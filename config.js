// ===========================================
// UWorld Replica - Config (JavaScript)
// ===========================================
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
    postgres: {
      url: 'postgresql://postgres:5&Ph9uzgYW/pLy6@db.cdyvgxmlfjbdmgqrocgc.supabase.co:5432/postgres',
      ssl: { rejectUnauthorized: false },
    },
    mongodb: {
      uri: 'mongodb+srv://rbym13403_db_user:i2wMfB7cIcBG5kDE@cluster0.zpve2xd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    },
    redis: {
      url: 'redis://default:ART3AAImcDJkMGNjYjIwZjVlOGQ0NWM2OWYzOWZmNGY1NzNlY2QxYnAyNTM2Nw@flying-shark-5367.upstash.io:6379',
    },
  },

  // ===========================================
  // Authentication & Security
  // ===========================================
  auth: {
    nextAuth: {
      url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      secret: 'XOzuHvWreD9mllgODECCiyKIhBWGcU4k',
    },
    jwt: {
      secret: 'vCPVGUG8YJbjNXBNBsAg6Hzp247zwD7o8zrdBxznA3sPSD7Sr/rADfxWh9ZfyZywXxp0HGv30mjnZWK/szOXXg==',
      expiresIn: '7d',
    },
    encryption: {
      key: 'WOjQuFyPachR2u1WyDlznzKYx7gOn0jm',
    },
  },

  // ===========================================
  // Test User (for immediate login)
  // ===========================================
  testUser: {
    username: 'testuser',
    password: 'Test@1234',
    email: 'testuser@example.com',
  },

  // ===========================================
  // OAuth Providers (Optional)
  // ===========================================
  oauth: {
    google: { clientId: '', clientSecret: '' },
    github: { clientId: '', clientSecret: '' },
    microsoft: { clientId: '', clientSecret: '' },
  },

  // ===========================================
  // External Services (Optional)
  // ===========================================
  services: {
    supabase: {
      url: 'https://cdyvgxmlfjbdmgqrocgc.supabase.co',
      apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkeXZneG1sZmpiZG1ncXJvY2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDI3NzMsImV4cCI6MjA3MzcxODc3M30.YmWRrzXnt52jmcEolKpYQKRe4KHkTxXdkmndxBrUwOg',
    },
    openai: { apiKey: '', model: 'gpt-4', maxTokens: 2000 },
    aws: { accessKeyId: '', secretAccessKey: '', region: 'us-east-1', s3Bucket: '' },
  },

  // ===========================================
  // File Upload Configuration
  // ===========================================
  upload: {
    dir: './uploads',
    tempDir: './temp',
    maxSize: 52428800, // 50MB
    allowedTypes: ['pdf', 'docx', 'xlsx'],
    maxFiles: 10,
  },

  // ===========================================
  // OCR (Optional)
  // ===========================================
  ocr: { language: 'eng', options: '--psm 6', confidenceThreshold: 60 },

  // ===========================================
  // Email Configuration (Optional)
  // ===========================================
  email: { host: 'smtp.gmail.com', port: 587, user: '', pass: '', from: 'noreply@uworldreplica.com', fromName: 'UWorld Replica' },

  // ===========================================
  // Rate Limiting
  // ===========================================
  rateLimit: { windowMs: 900000, maxRequests: 100, apiMaxRequests: 1000 },

  // ===========================================
  // Monitoring & Logging (Optional)
  // ===========================================
  monitoring: { sentry: { dsn: '' }, logging: { level: 'info', file: './logs/app.log' } },

  // ===========================================
  // Background Jobs
  // ===========================================
  queue: { redisUrl: 'redis://default:ART3AAImcDJkMGNjYjIwZjVlOGQ0NWM2OWYzOWZmNGY1NzNlY2QxYnAyNTM2Nw@flying-shark-5367.upstash.io:6379', concurrency: 5 },

  // ===========================================
  // Security Headers
  // ===========================================
  security: { cors: { origin: 'http://localhost:3000', credentials: true }, helmet: { csp: "default-src 'self'" } },

  // ===========================================
  // Development Tools
  // ===========================================
  development: { debug: 'uworld:*', verboseLogging: false, testDatabase: { postgres: '', mongodb: '' } },
};
