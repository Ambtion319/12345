import winston from 'winston'
import path from 'path'
import { SystemLog } from '@/lib/mongodb/schemas'
import config from '../../config.example'

// ===========================================
// Winston Logger Configuration
// ===========================================
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
)

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`
  })
)

// Create logs directory if it doesn't exist
const logDir = path.dirname(config.monitoring.logging.file)
require('fs').mkdirSync(logDir, { recursive: true })

// ===========================================
// Logger Service
// ===========================================
export class LoggerService {
  private static instance: LoggerService
  private logger: winston.Logger
  private mongoLogger: winston.Logger

  private constructor() {
    // Main logger
    this.logger = winston.createLogger({
      level: config.monitoring.logging.level,
      format: logFormat,
      transports: [
        // Console transport
        new winston.transports.Console({
          format: consoleFormat,
        }),
        // File transport for errors
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // File transport for all logs
        new winston.transports.File({
          filename: config.monitoring.logging.file,
          maxsize: 5242880, // 5MB
          maxFiles: 10,
        }),
      ],
    })

    // MongoDB logger for structured logging
    this.mongoLogger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    })
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService()
    }
    return LoggerService.instance
  }

  // ===========================================
  // Log Methods
  // ===========================================
  public info(message: string, meta?: any) {
    this.logger.info(message, meta)
    this.logToMongo('info', message, meta)
  }

  public warn(message: string, meta?: any) {
    this.logger.warn(message, meta)
    this.logToMongo('warn', message, meta)
  }

  public error(message: string, error?: Error, meta?: any) {
    this.logger.error(message, { error: error?.stack, ...meta })
    this.logToMongo('error', message, { error: error?.stack, ...meta })
  }

  public debug(message: string, meta?: any) {
    this.logger.debug(message, meta)
    this.logToMongo('debug', message, meta)
  }

  // ===========================================
  // Service-Specific Logging
  // ===========================================
  public logAuth(action: string, userId?: string, meta?: any) {
    this.info(`Auth: ${action}`, { userId, service: 'auth', ...meta })
  }

  public logUpload(action: string, fileId?: string, userId?: string, meta?: any) {
    this.info(`Upload: ${action}`, { fileId, userId, service: 'upload', ...meta })
  }

  public logOCR(action: string, fileId?: string, meta?: any) {
    this.info(`OCR: ${action}`, { fileId, service: 'ocr', ...meta })
  }

  public logLLM(action: string, questionId?: string, meta?: any) {
    this.info(`LLM: ${action}`, { questionId, service: 'llm', ...meta })
  }

  public logAPI(method: string, endpoint: string, statusCode: number, meta?: any) {
    this.info(`API: ${method} ${endpoint}`, { 
      method, 
      endpoint, 
      statusCode, 
      service: 'api',
      ...meta 
    })
  }

  public logDatabase(action: string, table?: string, meta?: any) {
    this.info(`Database: ${action}`, { table, service: 'database', ...meta })
  }

  public logSecurity(event: string, severity: 'low' | 'medium' | 'high' | 'critical', meta?: any) {
    const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn'
    this[level](`Security: ${event}`, { severity, service: 'security', ...meta })
  }

  // ===========================================
  // Performance Logging
  // ===========================================
  public logPerformance(operation: string, duration: number, meta?: any) {
    this.info(`Performance: ${operation}`, { 
      operation, 
      duration, 
      service: 'performance',
      ...meta 
    })
  }

  // ===========================================
  // User Activity Logging
  // ===========================================
  public logUserActivity(userId: string, action: string, meta?: any) {
    this.info(`User Activity: ${action}`, { 
      userId, 
      action, 
      service: 'user-activity',
      ...meta 
    })
  }

  // ===========================================
  // System Health Logging
  // ===========================================
  public logSystemHealth(component: string, status: 'healthy' | 'degraded' | 'down', meta?: any) {
    const level = status === 'down' ? 'error' : status === 'degraded' ? 'warn' : 'info'
    this[level](`System Health: ${component}`, { 
      component, 
      status, 
      service: 'system-health',
      ...meta 
    })
  }

  // ===========================================
  // Log to MongoDB
  // ===========================================
  private async logToMongo(level: string, message: string, meta?: any) {
    try {
      const logEntry = new SystemLog({
        level: level as 'error' | 'warn' | 'info' | 'debug',
        message,
        service: meta?.service || 'general',
        userId: meta?.userId,
        sessionId: meta?.sessionId,
        metadata: meta || {},
        stack: meta?.error,
      })

      await logEntry.save()
    } catch (error) {
      // Fallback to console if MongoDB logging fails
      console.error('Failed to log to MongoDB:', error)
    }
  }

  // ===========================================
  // Query Logs
  // ===========================================
  public async queryLogs(filters: {
    level?: string
    service?: string
    userId?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }) {
    try {
      const query: any = {}

      if (filters.level) query.level = filters.level
      if (filters.service) query.service = filters.service
      if (filters.userId) query.userId = filters.userId
      if (filters.startDate || filters.endDate) {
        query.createdAt = {}
        if (filters.startDate) query.createdAt.$gte = filters.startDate
        if (filters.endDate) query.createdAt.$lte = filters.endDate
      }

      const logs = await SystemLog.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 100)

      return logs
    } catch (error) {
      this.error('Failed to query logs', error as Error)
      return []
    }
  }

  // ===========================================
  // Get Log Statistics
  // ===========================================
  public async getLogStats(days: number = 7) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

      const stats = await SystemLog.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              level: '$level',
              service: '$service'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.level',
            services: {
              $push: {
                service: '$_id.service',
                count: '$count'
              }
            },
            total: { $sum: '$count' }
          }
        }
      ])

      return stats
    } catch (error) {
      this.error('Failed to get log statistics', error as Error)
      return []
    }
  }

  // ===========================================
  // Cleanup Old Logs
  // ===========================================
  public async cleanupLogs(daysToKeep: number = 30) {
    try {
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
      
      const result = await SystemLog.deleteMany({
        createdAt: { $lt: cutoffDate }
      })

      this.info(`Cleaned up ${result.deletedCount} old log entries`)
      return result.deletedCount
    } catch (error) {
      this.error('Failed to cleanup logs', error as Error)
      return 0
    }
  }
}

// ===========================================
// Export Singleton Instance
// ===========================================
export const logger = LoggerService.getInstance()

// ===========================================
// Utility Functions
// ===========================================
export const logInfo = (message: string, meta?: any) => logger.info(message, meta)
export const logWarn = (message: string, meta?: any) => logger.warn(message, meta)
export const logError = (message: string, error?: Error, meta?: any) => logger.error(message, error, meta)
export const logDebug = (message: string, meta?: any) => logger.debug(message, meta)

export const logAuth = (action: string, userId?: string, meta?: any) => logger.logAuth(action, userId, meta)
export const logUpload = (action: string, fileId?: string, userId?: string, meta?: any) => logger.logUpload(action, fileId, userId, meta)
export const logOCR = (action: string, fileId?: string, meta?: any) => logger.logOCR(action, fileId, meta)
export const logLLM = (action: string, questionId?: string, meta?: any) => logger.logLLM(action, questionId, meta)
export const logAPI = (method: string, endpoint: string, statusCode: number, meta?: any) => logger.logAPI(method, endpoint, statusCode, meta)
export const logDatabase = (action: string, table?: string, meta?: any) => logger.logDatabase(action, table, meta)
export const logSecurity = (event: string, severity: 'low' | 'medium' | 'high' | 'critical', meta?: any) => logger.logSecurity(event, severity, meta)
export const logPerformance = (operation: string, duration: number, meta?: any) => logger.logPerformance(operation, duration, meta)
export const logUserActivity = (userId: string, action: string, meta?: any) => logger.logUserActivity(userId, action, meta)
export const logSystemHealth = (component: string, status: 'healthy' | 'degraded' | 'down', meta?: any) => logger.logSystemHealth(component, status, meta)

export default logger
