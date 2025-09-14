import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import { FileUpload } from '@/lib/mongodb/schemas'
import config from '../../config.example'

// ===========================================
// File Upload Configuration
// ===========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = config.upload.tempDir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`
    cb(null, uniqueName)
  }
})

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = config.upload.allowedTypes
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1)
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true)
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxSize,
    files: config.upload.maxFiles,
  }
})

// ===========================================
// File Validation
// ===========================================
export const validateFile = (file: Express.Multer.File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > config.upload.maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${config.upload.maxSize / 1024 / 1024}MB`
    }
  }

  // Check file type
  const allowedTypes = config.upload.allowedTypes
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1)
  
  if (!allowedTypes.includes(fileExtension)) {
    return {
      valid: false,
      error: `File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    }
  }

  // Check MIME type
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/msword'
  ]

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `MIME type ${file.mimetype} is not allowed`
    }
  }

  return { valid: true }
}

// ===========================================
// File Processing
// ===========================================
export const processFile = async (file: Express.Multer.File, userId: string) => {
  try {
    // Create file upload record
    const fileUpload = new FileUpload({
      userId,
      fileName: file.filename,
      originalName: file.originalname,
      fileSize: file.size,
      fileType: path.extname(file.originalname).toLowerCase().slice(1),
      mimeType: file.mimetype,
      status: 'uploading',
      progress: 0,
      filePath: file.path,
      metadata: {
        uploadedAt: new Date(),
        ocrProcessed: false,
        questionsExtracted: 0
      }
    })

    await fileUpload.save()

    // Process file based on type
    let processedPath = file.path

    if (file.mimetype === 'application/pdf') {
      // PDF processing will be handled by OCR service
      processedPath = await processPDF(file.path, fileUpload._id.toString())
    } else if (file.mimetype.includes('word') || file.mimetype.includes('excel')) {
      // Office document processing
      processedPath = await processOfficeDocument(file.path, fileUpload._id.toString())
    }

    // Update file upload record
    fileUpload.status = 'processing'
    fileUpload.progress = 50
    fileUpload.filePath = processedPath
    await fileUpload.save()

    // Queue for OCR processing
    await queueOCRProcessing(fileUpload._id.toString())

    return {
      success: true,
      fileId: fileUpload._id.toString(),
      fileName: file.originalname,
      fileSize: file.size,
      status: 'processing'
    }

  } catch (error) {
    console.error('File processing error:', error)
    throw new Error('Failed to process file')
  }
}

// ===========================================
// PDF Processing
// ===========================================
const processPDF = async (filePath: string, fileId: string): Promise<string> => {
  try {
    // For now, just return the original path
    // In production, you might want to:
    // 1. Extract images from PDF
    // 2. Convert PDF to images
    // 3. Optimize PDF
    return filePath
  } catch (error) {
    console.error('PDF processing error:', error)
    throw error
  }
}

// ===========================================
// Office Document Processing
// ===========================================
const processOfficeDocument = async (filePath: string, fileId: string): Promise<string> => {
  try {
    // For now, just return the original path
    // In production, you might want to:
    // 1. Convert to PDF
    // 2. Extract text content
    // 3. Parse structured data
    return filePath
  } catch (error) {
    console.error('Office document processing error:', error)
    throw error
  }
}

// ===========================================
// Queue OCR Processing
// ===========================================
const queueOCRProcessing = async (fileId: string) => {
  try {
    // This will be implemented with Bull queue
    console.log(`Queuing OCR processing for file: ${fileId}`)
    
    // For now, just log the action
    // In production, this would add a job to the OCR queue
    return true
  } catch (error) {
    console.error('OCR queue error:', error)
    throw error
  }
}

// ===========================================
// File Cleanup
// ===========================================
export const cleanupFile = async (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`Cleaned up file: ${filePath}`)
    }
  } catch (error) {
    console.error('File cleanup error:', error)
  }
}

// ===========================================
// Get Upload Status
// ===========================================
export const getUploadStatus = async (fileId: string) => {
  try {
    const fileUpload = await FileUpload.findById(fileId)
    
    if (!fileUpload) {
      throw new Error('File upload not found')
    }

    return {
      fileId: fileUpload._id.toString(),
      fileName: fileUpload.originalName,
      status: fileUpload.status,
      progress: fileUpload.progress,
      error: fileUpload.error,
      metadata: fileUpload.metadata
    }
  } catch (error) {
    console.error('Get upload status error:', error)
    throw error
  }
}

// ===========================================
// Security Functions
// ===========================================
export const scanFileForViruses = async (filePath: string): Promise<boolean> => {
  try {
    // In production, integrate with a virus scanning service
    // For now, just check file size and basic validation
    const stats = fs.statSync(filePath)
    
    if (stats.size === 0) {
      return false
    }

    // Add more security checks here
    return true
  } catch (error) {
    console.error('Virus scan error:', error)
    return false
  }
}

export const sanitizeFileName = (fileName: string): string => {
  // Remove potentially dangerous characters
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}

// ===========================================
// File Type Detection
// ===========================================
export const detectFileType = (filePath: string): string => {
  const ext = path.extname(filePath).toLowerCase()
  
  const typeMap: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.doc': 'application/msword',
    '.xls': 'application/vnd.ms-excel'
  }

  return typeMap[ext] || 'application/octet-stream'
}

export default {
  upload,
  validateFile,
  processFile,
  cleanupFile,
  getUploadStatus,
  scanFileForViruses,
  sanitizeFileName,
  detectFileType,
}
