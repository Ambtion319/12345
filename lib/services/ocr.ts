import Tesseract from 'tesseract.js'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { OCRResult, FileUpload } from '@/lib/mongodb/schemas'
import config from '../../config.example'

// ===========================================
// OCR Processing Service
// ===========================================
export class OCRService {
  private static instance: OCRService
  private worker: Tesseract.Worker | null = null

  private constructor() {}

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService()
    }
    return OCRService.instance
  }

  // ===========================================
  // Initialize Tesseract Worker
  // ===========================================
  private async initializeWorker(): Promise<Tesseract.Worker> {
    if (this.worker) {
      return this.worker
    }

    try {
      this.worker = await Tesseract.createWorker({
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
          }
        }
      })

      await this.worker.load()
      await this.worker.loadLanguage(config.ocr.language)
      await this.worker.initialize(config.ocr.language)
      await this.worker.setParameters({
        tessedit_pageseg_mode: config.ocr.options,
      })

      return this.worker
    } catch (error) {
      console.error('Failed to initialize Tesseract worker:', error)
      throw error
    }
  }

  // ===========================================
  // Process File with OCR
  // ===========================================
  public async processFile(fileId: string): Promise<{
    success: boolean
    results: any[]
    totalPages: number
    processingTime: number
  }> {
    const startTime = Date.now()
    
    try {
      // Get file upload record
      const fileUpload = await FileUpload.findById(fileId)
      if (!fileUpload) {
        throw new Error('File upload not found')
      }

      // Update status to processing
      fileUpload.status = 'processing'
      fileUpload.progress = 10
      await fileUpload.save()

      // Initialize worker
      const worker = await this.initializeWorker()

      // Process file based on type
      let results: any[] = []
      let totalPages = 1

      if (fileUpload.mimeType === 'application/pdf') {
        const pdfResults = await this.processPDF(fileUpload.filePath!, worker)
        results = pdfResults.results
        totalPages = pdfResults.totalPages
      } else {
        // Process as single image/document
        const result = await this.processImage(fileUpload.filePath!, worker)
        results = [result]
      }

      // Save OCR results to database
      for (let i = 0; i < results.length; i++) {
        const ocrResult = new OCRResult({
          fileUploadId: fileId,
          pageNumber: i + 1,
          extractedText: results[i].text,
          confidence: results[i].confidence,
          boundingBoxes: results[i].boundingBoxes,
          processingTime: results[i].processingTime,
        })

        await ocrResult.save()
      }

      // Update file upload status
      fileUpload.status = 'completed'
      fileUpload.progress = 100
      fileUpload.metadata.ocrProcessed = true
      await fileUpload.save()

      const processingTime = Date.now() - startTime

      return {
        success: true,
        results,
        totalPages,
        processingTime,
      }

    } catch (error) {
      console.error('OCR processing error:', error)
      
      // Update file upload status to error
      await FileUpload.findByIdAndUpdate(fileId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      throw error
    }
  }

  // ===========================================
  // Process PDF File
  // ===========================================
  private async processPDF(filePath: string, worker: Tesseract.Worker): Promise<{
    results: any[]
    totalPages: number
  }> {
    try {
      // For PDF processing, we need to convert PDF to images first
      // This is a simplified version - in production, use pdf2pic or similar
      const results: any[] = []
      
      // For now, treat PDF as single page
      // In production, extract all pages as images
      const result = await this.processImage(filePath, worker)
      results.push(result)

      return {
        results,
        totalPages: 1, // In production, this would be the actual page count
      }
    } catch (error) {
      console.error('PDF processing error:', error)
      throw error
    }
  }

  // ===========================================
  // Process Image File
  // ===========================================
  private async processImage(filePath: string, worker: Tesseract.Worker): Promise<{
    text: string
    confidence: number
    boundingBoxes: any[]
    processingTime: number
  }> {
    const startTime = Date.now()

    try {
      // Preprocess image for better OCR results
      const processedImagePath = await this.preprocessImage(filePath)

      // Perform OCR
      const { data } = await worker.recognize(processedImagePath)

      // Clean up processed image
      if (processedImagePath !== filePath) {
        fs.unlinkSync(processedImagePath)
      }

      // Extract bounding boxes
      const boundingBoxes = this.extractBoundingBoxes(data.words)

      const processingTime = Date.now() - startTime

      return {
        text: data.text,
        confidence: data.confidence,
        boundingBoxes,
        processingTime,
      }

    } catch (error) {
      console.error('Image processing error:', error)
      throw error
    }
  }

  // ===========================================
  // Preprocess Image for Better OCR
  // ===========================================
  private async preprocessImage(filePath: string): Promise<string> {
    try {
      const outputPath = filePath.replace(/\.[^/.]+$/, '_processed.png')

      await sharp(filePath)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .sharpen()
        .normalize()
        .png({ quality: 100 })
        .toFile(outputPath)

      return outputPath
    } catch (error) {
      console.error('Image preprocessing error:', error)
      // Return original file if preprocessing fails
      return filePath
    }
  }

  // ===========================================
  // Extract Bounding Boxes
  // ===========================================
  private extractBoundingBoxes(words: any[]): any[] {
    return words
      .filter(word => word.confidence > config.ocr.confidenceThreshold)
      .map(word => ({
        text: word.text,
        x: word.bbox.x0,
        y: word.bbox.y0,
        width: word.bbox.x1 - word.bbox.x0,
        height: word.bbox.y1 - word.bbox.y0,
        confidence: word.confidence,
      }))
  }

  // ===========================================
  // Clean Up Worker
  // ===========================================
  public async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
    }
  }

  // ===========================================
  // Get OCR Results for File
  // ===========================================
  public async getOCRResults(fileId: string): Promise<any[]> {
    try {
      const results = await OCRResult.find({ fileUploadId: fileId })
        .sort({ pageNumber: 1 })

      return results.map(result => ({
        pageNumber: result.pageNumber,
        text: result.extractedText,
        confidence: result.confidence,
        boundingBoxes: result.boundingBoxes,
        processingTime: result.processingTime,
      }))
    } catch (error) {
      console.error('Get OCR results error:', error)
      throw error
    }
  }

  // ===========================================
  // Extract Text from OCR Results
  // ===========================================
  public async extractText(fileId: string): Promise<string> {
    try {
      const results = await this.getOCRResults(fileId)
      return results.map(result => result.text).join('\n\n')
    } catch (error) {
      console.error('Extract text error:', error)
      throw error
    }
  }
}

// ===========================================
// Export Singleton Instance
// ===========================================
export const ocrService = OCRService.getInstance()

// ===========================================
// Utility Functions
// ===========================================
export const processFileWithOCR = async (fileId: string) => {
  return await ocrService.processFile(fileId)
}

export const getFileOCRResults = async (fileId: string) => {
  return await ocrService.getOCRResults(fileId)
}

export const extractTextFromFile = async (fileId: string) => {
  return await ocrService.extractText(fileId)
}

export default ocrService
