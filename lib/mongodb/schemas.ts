import mongoose, { Schema, Document } from 'mongoose'

// ===========================================
// File Upload Management
// ===========================================
export interface IFileUpload extends Document {
  _id: string
  userId: string
  fileName: string
  originalName: string
  fileSize: number
  fileType: string
  mimeType: string
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  filePath?: string
  s3Key?: string
  error?: string
  metadata: {
    uploadedAt: Date
    processedAt?: Date
    ocrProcessed?: boolean
    questionsExtracted?: number
  }
  createdAt: Date
  updatedAt: Date
}

const FileUploadSchema = new Schema<IFileUpload>({
  userId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  mimeType: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'uploading', 'processing', 'completed', 'error'],
    default: 'pending'
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  filePath: { type: String },
  s3Key: { type: String },
  error: { type: String },
  metadata: {
    uploadedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    ocrProcessed: { type: Boolean, default: false },
    questionsExtracted: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  collection: 'file_uploads'
})

// ===========================================
// OCR Results
// ===========================================
export interface IOCRResult extends Document {
  _id: string
  fileUploadId: string
  pageNumber: number
  extractedText: string
  confidence: number
  boundingBoxes: Array<{
    text: string
    x: number
    y: number
    width: number
    height: number
    confidence: number
  }>
  processingTime: number
  createdAt: Date
}

const OCRResultSchema = new Schema<IOCRResult>({
  fileUploadId: { type: String, required: true, index: true },
  pageNumber: { type: Number, required: true },
  extractedText: { type: String, required: true },
  confidence: { type: Number, required: true, min: 0, max: 100 },
  boundingBoxes: [{
    text: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    confidence: { type: Number, required: true }
  }],
  processingTime: { type: Number, required: true }, // in milliseconds
}, {
  timestamps: true,
  collection: 'ocr_results'
})

// ===========================================
// LLM Responses & Caching
// ===========================================
// الحل: فصل الواجهة الأساسية عن واجهة المستند
export interface ILLMResponse {
  questionId: string;
  prompt: string;
  response: string;
  model: string;
  tokensUsed: number;
  cost: number;
  processingTime: number;
  cached: boolean;
  expiresAt?: Date;
}

export interface ILLMResponseDocument extends ILLMResponse, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LLMResponseSchema = new Schema<ILLMResponseDocument>({
  questionId: { type: String, required: true, index: true },
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  model: { type: String, required: true },
  tokensUsed: { type: Number, required: true },
  cost: { type: Number, required: true },
  processingTime: { type: Number, required: true },
  cached: { type: Boolean, default: false },
  expiresAt: { type: Date, index: { expireAfterSeconds: 0 } }
}, {
  timestamps: true,
  collection: 'llm_responses'
})

// ===========================================
// System Logs
// ===========================================
export interface ISystemLog extends Document {
  _id: string
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  service: string
  userId?: string
  sessionId?: string
  metadata: Record<string, any>
  stack?: string
  createdAt: Date
}

const SystemLogSchema = new Schema<ISystemLog>({
  level: { 
    type: String, 
    enum: ['error', 'warn', 'info', 'debug'],
    required: true,
    index: true
  },
  message: { type: String, required: true },
  service: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  sessionId: { type: String, index: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  stack: { type: String }
}, {
  timestamps: true,
  collection: 'system_logs'
})

// ===========================================
// Cached Data
// ===========================================
export interface ICachedData extends Document {
  _id: string
  key: string
  value: any
  ttl: number // time to live in seconds
  expiresAt: Date
  createdAt: Date
}

const CachedDataSchema = new Schema<ICachedData>({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: Schema.Types.Mixed, required: true },
  ttl: { type: Number, required: true },
  expiresAt: { 
    type: Date, 
    required: true,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true,
  collection: 'cached_data'
})

// ===========================================
// Background Jobs
// ===========================================
export interface IBackgroundJob extends Document {
  _id: string
  type: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  priority: number
  data: Record<string, any>
  result?: any
  error?: string
  attempts: number
  maxAttempts: number
  scheduledAt: Date
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
}

const BackgroundJobSchema = new Schema<IBackgroundJob>({
  type: { type: String, required: true, index: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  priority: { type: Number, default: 0 },
  data: { type: Schema.Types.Mixed, required: true },
  result: { type: Schema.Types.Mixed },
  error: { type: String },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  scheduledAt: { type: Date, default: Date.now, index: true },
  startedAt: { type: Date },
  completedAt: { type: Date }
}, {
  timestamps: true,
  collection: 'background_jobs'
})

// ===========================================
// User Sessions (Redis alternative)
// ===========================================
export interface IUserSession extends Document {
  _id: string
  userId: string
  sessionToken: string
  data: Record<string, any>
  expiresAt: Date
  createdAt: Date
}

const UserSessionSchema = new Schema<IUserSession>({
  userId: { type: String, required: true, index: true },
  sessionToken: { type: String, required: true, unique: true, index: true },
  data: { type: Schema.Types.Mixed, default: {} },
  expiresAt: { 
    type: Date, 
    required: true,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true,
  collection: 'user_sessions'
})

// ===========================================
// Export Models
// ===========================================
export const FileUpload = mongoose.models.FileUpload || mongoose.model<IFileUpload>('FileUpload', FileUploadSchema)
export const OCRResult = mongoose.models.OCRResult || mongoose.model<IOCRResult>('OCRResult', OCRResultSchema)
export const LLMResponse = mongoose.models.LLMResponse || mongoose.model<ILLMResponseDocument>('LLMResponse', LLMResponseSchema)
export const SystemLog = mongoose.models.SystemLog || mongoose.model<ISystemLog>('SystemLog', SystemLogSchema)
export const CachedData = mongoose.models.CachedData || mongoose.model<ICachedData>('CachedData', CachedDataSchema)
export const BackgroundJob = mongoose.models.BackgroundJob || mongoose.model<IBackgroundJob>('BackgroundJob', BackgroundJobSchema)
export const UserSession = mongoose.models.UserSession || mongoose.model<IUserSession>('UserSession', UserSessionSchema)
