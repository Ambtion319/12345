import { PrismaClient } from '@prisma/client'
import mongoose from 'mongoose'
import { createClient } from 'redis'
import config from '../../config.example'

// ===========================================
// PostgreSQL Connection (Prisma)
// ===========================================
declare global {
  var __prisma: PrismaClient | undefined
}

export const prisma = globalThis.__prisma || new PrismaClient({
  log: config.app.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

if (config.app.env !== 'production') {
  globalThis.__prisma = prisma
}

// ===========================================
// MongoDB Connection (Mongoose)
// ===========================================
let mongoConnection: typeof mongoose | null = null

export const connectMongoDB = async (): Promise<typeof mongoose> => {
  if (mongoConnection) {
    return mongoConnection
  }

  try {
    mongoConnection = await mongoose.connect(config.database.mongodb.uri, config.database.mongodb.options)
    
    console.log('✅ MongoDB connected successfully')
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected')
      mongoConnection = null
    })

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected')
    })

    return mongoConnection
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    throw error
  }
}

export const disconnectMongoDB = async (): Promise<void> => {
  if (mongoConnection) {
    await mongoose.disconnect()
    mongoConnection = null
    console.log('✅ MongoDB disconnected')
  }
}

// ===========================================
// Redis Connection
// ===========================================
let redisClient: ReturnType<typeof createClient> | null = null

export const connectRedis = async () => {
  if (redisClient) {
    return redisClient
  }

  try {
    redisClient = createClient({
      url: config.database.redis.url,
      ...config.database.redis.options,
    })

    redisClient.on('error', (error) => {
      console.error('❌ Redis connection error:', error)
    })

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully')
    })

    redisClient.on('disconnect', () => {
      console.warn('⚠️ Redis disconnected')
    })

    await redisClient.connect()
    return redisClient
  } catch (error) {
    console.error('❌ Redis connection failed:', error)
    throw error
  }
}

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    console.log('✅ Redis disconnected')
  }
}

// ===========================================
// Database Health Check
// ===========================================
export const checkDatabaseHealth = async () => {
  const health = {
    postgres: false,
    mongodb: false,
    redis: false,
    timestamp: new Date().toISOString(),
  }

  try {
    // Check PostgreSQL
    await prisma.$queryRaw`SELECT 1`
    health.postgres = true
  } catch (error) {
    console.error('PostgreSQL health check failed:', error)
  }

  try {
    // Check MongoDB - التحقق من وجود الاتصال وقاعدة البيانات أولاً
    if (mongoConnection && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping()
      health.mongodb = true
    }
  } catch (error) {
    console.error('MongoDB health check failed:', error)
  }

  try {
    // Check Redis
    if (redisClient) {
      await redisClient.ping()
      health.redis = true
    }
  } catch (error) {
    console.error('Redis health check failed:', error)
  }

  return health
}

// ===========================================
// Graceful Shutdown
// ===========================================
export const gracefulShutdown = async () => {
  console.log('🔄 Starting graceful shutdown...')

  try {
    // Close Prisma connection
    await prisma.$disconnect()
    console.log('✅ Prisma disconnected')

    // Close MongoDB connection
    await disconnectMongoDB()

    // Close Redis connection
    await disconnectRedis()

    console.log('✅ All database connections closed')
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error)
  }
}

// ===========================================
// Initialize All Connections
// ===========================================
export const initializeDatabases = async () => {
  try {
    console.log('🔄 Initializing database connections...')

    // Connect to MongoDB
    await connectMongoDB()

    // Connect to Redis
    await connectRedis()

    // Test PostgreSQL connection
    await prisma.$connect()

    console.log('✅ All database connections initialized successfully')

    // Set up graceful shutdown handlers
    process.on('SIGINT', gracefulShutdown)
    process.on('SIGTERM', gracefulShutdown)
    process.on('SIGUSR2', gracefulShutdown) // For nodemon

  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

// ===========================================
// Database Utilities
// ===========================================
export const clearTestData = async () => {
  if (config.app.env === 'production') {
    throw new Error('Cannot clear data in production environment')
  }

  try {
    // Clear PostgreSQL test data
    await prisma.auditLog.deleteMany()
    await prisma.analytics.deleteMany()
    await prisma.userAnswer.deleteMany()
    await prisma.practiceSession.deleteMany()
    await prisma.questionOption.deleteMany()
    await prisma.question.deleteMany()
    await prisma.questionBank.deleteMany()
    await prisma.user.deleteMany()
    await prisma.systemConfig.deleteMany()

    // Clear MongoDB test data - التحقق من وجود قاعدة البيانات أولاً
    if (mongoConnection && mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray()
      for (const collection of collections) {
        await mongoose.connection.db.collection(collection.name).deleteMany({})
      }
    }

    console.log('✅ Test data cleared successfully')
  } catch (error) {
    console.error('❌ Error clearing test data:', error)
    throw error
  }
}

export default {
  prisma,
  connectMongoDB,
  disconnectMongoDB,
  connectRedis,
  disconnectRedis,
  checkDatabaseHealth,
  gracefulShutdown,
  initializeDatabases,
  clearTestData,
                           }
