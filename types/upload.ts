export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'uploading' | 'processing' | 'parsing' | 'completed' | 'error'
  message?: string
}

export interface ParsedQuestion {
  questionText: string
  options: {
    letter: string
    text: string
  }[]
  correctAnswer: string
  explanation?: string
  subject?: string
  system?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
  images?: string[]
}

export interface ParsingResult {
  success: boolean
  questions: ParsedQuestion[]
  errors: string[]
  warnings: string[]
  metadata: {
    totalQuestions: number
    subjects: string[]
    systems: string[]
    difficulties: string[]
  }
}

export interface FileUpload {
  id: string
  fileName: string
  fileSize: number
  fileType: 'pdf' | 'docx' | 'xlsx'
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  uploadedAt: Date
  processedAt?: Date
  error?: string
}

export interface OCRResult {
  text: string
  confidence: number
  boundingBoxes: {
    text: string
    x: number
    y: number
    width: number
    height: number
  }[]
}
