import { NextRequest, NextResponse } from 'next/server'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import cors from 'cors'
import { verify } from 'jsonwebtoken'
import config from '../../config.example'

// ===========================================
// Rate Limiting Configuration
// ===========================================
export const createRateLimit = (options: {
  windowMs?: number
  max?: number
  message?: string
  standardHeaders?: boolean
  legacyHeaders?: boolean
}) => {
  return rateLimit({
    windowMs: options.windowMs || config.rateLimit.windowMs,
    max: options.max || config.rateLimit.maxRequests,
    message: options.message || 'Too many requests from this IP, please try again later.',
    standardHeaders: options.standardHeaders || true,
    legacyHeaders: options.legacyHeaders || false,
  })
}

// ===========================================
// CORS Configuration
// ===========================================
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true)
    
    const allowedOrigins = [
      config.security.cors.origin,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ]
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: config.security.cors.credentials,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}

// ===========================================
// Helmet Security Headers
// ===========================================
export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}

// ===========================================
// JWT Token Verification
// ===========================================
export const verifyToken = (token: string): any => {
  try {
    return verify(token, config.auth.jwt.secret)
  } catch (error) {
    throw new Error('Invalid token')
  }
}

// ===========================================
// Authentication Middleware
// ===========================================
export const authenticateToken = (req: NextRequest): { user: any; error?: string } => {
  try {
    const authHeader = req.headers.get('authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return { user: null, error: 'Access token required' }
    }

    const user = verifyToken(token)
    return { user, error: undefined }
  } catch (error) {
    return { user: null, error: 'Invalid or expired token' }
  }
}

// ===========================================
// Role-Based Access Control
// ===========================================
export const requireRole = (allowedRoles: string[]) => {
  return (req: NextRequest): { user: any; error?: string } => {
    const { user, error } = authenticateToken(req)
    
    if (error) {
      return { user: null, error }
    }

    if (!allowedRoles.includes(user.role)) {
      return { user: null, error: 'Insufficient permissions' }
    }

    return { user, error: undefined }
  }
}

// ===========================================
// Input Validation Middleware
// ===========================================
export const validateInput = (schema: any) => {
  return (req: NextRequest): { valid: boolean; error?: string; data?: any } => {
    try {
      const body = req.json ? req.json() : {}
      const { error, value } = schema.validate(body)
      
      if (error) {
        return { valid: false, error: error.details[0].message }
      }

      return { valid: true, data: value }
    } catch (error) {
      return { valid: false, error: 'Invalid request body' }
    }
  }
}

// ===========================================
// File Upload Security
// ===========================================
export const validateFileUpload = (req: NextRequest): { valid: boolean; error?: string } => {
  try {
    const contentType = req.headers.get('content-type')
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return { valid: false, error: 'Content-Type must be multipart/form-data' }
    }

    // Additional file validation can be added here
    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'File upload validation failed' }
  }
}

// ===========================================
// IP Whitelist Middleware
// ===========================================
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: NextRequest): { allowed: boolean; error?: string } => {
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown'

    if (!allowedIPs.includes(clientIP)) {
      return { allowed: false, error: 'IP address not allowed' }
    }

    return { allowed: true }
  }
}

// ===========================================
// Request Size Limiter
// ===========================================
export const limitRequestSize = (maxSize: number) => {
  return (req: NextRequest): { allowed: boolean; error?: string } => {
    const contentLength = req.headers.get('content-length')
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      return { allowed: false, error: 'Request too large' }
    }

    return { allowed: true }
  }
}

// ===========================================
// API Key Validation
// ===========================================
export const validateAPIKey = (req: NextRequest): { valid: boolean; error?: string } => {
  try {
    const apiKey = req.headers.get('x-api-key')
    
    if (!apiKey) {
      return { valid: false, error: 'API key required' }
    }

    // In production, validate against database or environment variable
    const validAPIKeys = process.env.VALID_API_KEYS?.split(',') || []
    
    if (!validAPIKeys.includes(apiKey)) {
      return { valid: false, error: 'Invalid API key' }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'API key validation failed' }
  }
}

// ===========================================
// Security Headers Middleware
// ===========================================
export const securityHeaders = (req: NextRequest, res: NextResponse) => {
  // Set security headers
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  return res
}

// ===========================================
// Request Logging Middleware
// ===========================================
export const logRequest = (req: NextRequest) => {
  const timestamp = new Date().toISOString()
  const method = req.method
  const url = req.url
  const userAgent = req.headers.get('user-agent') || 'Unknown'
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown'
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`)
}

// ===========================================
// Error Handler
// ===========================================
export const handleSecurityError = (error: any, req: NextRequest) => {
  console.error('Security error:', error)
  
  // Log security incidents
  // In production, send to monitoring service
  
  return NextResponse.json(
    { 
      success: false, 
      error: 'Security validation failed',
      timestamp: new Date().toISOString()
    },
    { status: 403 }
  )
}

// ===========================================
// Combined Security Middleware
// ===========================================
export const applySecurity = (req: NextRequest, res: NextResponse) => {
  // Apply all security measures
  securityHeaders(req, res)
  logRequest(req)
  
  return res
}

export default {
  createRateLimit,
  corsOptions,
  helmetOptions,
  verifyToken,
  authenticateToken,
  requireRole,
  validateInput,
  validateFileUpload,
  ipWhitelist,
  limitRequestSize,
  validateAPIKey,
  securityHeaders,
  logRequest,
  handleSecurityError,
  applySecurity,
}
