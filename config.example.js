// ===========================================
// UWorld Replica - Configuration Template
// ===========================================
// Copy this file to config.js and fill in your actual values
// NEVER commit config.js to version control

module.exports = {
  // ===========================================
  // Application Configuration
  // ===========================================
  app: {
    name: 'UWorld Replica',
    version: '1.0.0',
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // ===========================================
  // Database Configuration
  // ===========================================
  database: {
    // PostgreSQL (Primary Database)
    postgres: {
      url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/uworld_replica',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
    
    // MongoDB (Document Storage)
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/uworld_replica',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      },
    },
    
    // Redis (Caching & Sessions)
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      options: {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
      },
    },
  },

  // ===========================================
  // Authentication & Security
  // ===========================================
  auth: {
    nextAuth: {
      url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      secret: process.env.NEXTAUTH_SECRET || 'your-nextauth-secret-key-here',
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'your-jwt-secret-key-here',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    encryption: {
      key: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key',
    },
  },

  // ===========================================
  // OAuth Providers
  // ===========================================
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || 'your-github-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your-github-client-secret',
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID || 'your-microsoft-client-id',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || 'your-microsoft-client-secret',
    },
  },

  // ===========================================
  // External Services
  // ===========================================
  services: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
      model: process.env.OPENAI_MODEL || 'gpt-4',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
    },
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your-aws-access-key',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your-aws-secret-key',
      region: process.env.AWS_REGION || 'us-east-1',
      s3Bucket: process.env.AWS_S3_BUCKET || 'uworld-replica-uploads',
    },
  },

  // ===========================================
  // File Upload Configuration
  // ===========================================
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    tempDir: process.env.UPLOAD_TEMP_DIR || './temp',
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800, // 50MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,docx,xlsx').split(','),
    maxFiles: 10,
  },

  // ===========================================
  // OCR Configuration
  // ===========================================
  ocr: {
    language: process.env.TESSERACT_LANG || 'eng',
    options: process.env.TESSERACT_OPTIONS || '--psm 6',
    confidenceThreshold: parseInt(process.env.OCR_CONFIDENCE_THRESHOLD) || 60,
  },

  // ===========================================
  // Email Configuration
  // ===========================================
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password',
    from: process.env.FROM_EMAIL || 'noreply@uworldreplica.com',
    fromName: process.env.FROM_NAME || 'UWorld Replica',
  },

  // ===========================================
  // Rate Limiting
  // ===========================================
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    apiMaxRequests: parseInt(process.env.API_RATE_LIMIT_MAX) || 1000,
  },

  // ===========================================
  // Monitoring & Logging
  // ===========================================
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN || 'your-sentry-dsn',
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      file: process.env.LOG_FILE || './logs/app.log',
    },
  },

  // ===========================================
  // Background Jobs
  // ===========================================
  queue: {
    redisUrl: process.env.QUEUE_REDIS_URL || 'redis://localhost:6379',
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY) || 5,
  },

  // ===========================================
  // Security Headers
  // ===========================================
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: process.env.CORS_CREDENTIALS === 'true',
    },
    helmet: {
      csp: process.env.HELMET_CSP || "default-src 'self'",
    },
  },

  // ===========================================
  // Development Tools
  // ===========================================
  development: {
    debug: process.env.DEBUG || 'uworld:*',
    verboseLogging: process.env.VERBOSE_LOGGING === 'true',
    testDatabase: {
      postgres: process.env.TEST_DATABASE_URL || 'postgresql://username:password@localhost:5432/uworld_replica_test',
      mongodb: process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/uworld_replica_test',
    },
  },
};
