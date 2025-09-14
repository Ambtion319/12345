import OpenAI from 'openai'
import { LLMResponse } from '@/lib/mongodb/schemas'
import config from '../../config.example'

// ===========================================
// LLM Service for Generating Explanations
// ===========================================
export class LLMService {
  private static instance: LLMService
  private openai: OpenAI

  private constructor() {
    this.openai = new OpenAI({
      apiKey: config.services.openai.apiKey,
    })
  }

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService()
    }
    return LLMService.instance
  }

  // ===========================================
  // Generate Question Explanation
  // ===========================================
  public async generateExplanation(questionData: {
    questionId: string
    questionText: string
    options: Array<{ letter: string; text: string }>
    correctAnswer: string
    subject?: string
    system?: string
    difficulty?: string
  }): Promise<{
    explanation: string
    reasoning: string
    keyPoints: string[]
    references: string[]
  }> {
    try {
      // Check if we already have a cached response
      const cachedResponse = await this.getCachedResponse(questionData.questionId)
      if (cachedResponse) {
        return JSON.parse(cachedResponse.response)
      }

      const prompt = this.buildExplanationPrompt(questionData)
      
      const startTime = Date.now()
      const response = await this.openai.chat.completions.create({
        model: config.services.openai.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: config.services.openai.maxTokens,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      })

      const processingTime = Date.now() - startTime
      const explanation = response.choices[0]?.message?.content || ''

      // Parse the response
      const parsedExplanation = this.parseExplanation(explanation)

      // Calculate cost (approximate)
      const cost = this.calculateCost(response.usage?.total_tokens || 0)

      // Save to database
      await this.saveResponse({
        questionId: questionData.questionId,
        prompt,
        response: JSON.stringify(parsedExplanation),
        model: config.services.openai.model,
        tokensUsed: response.usage?.total_tokens || 0,
        cost,
        processingTime,
        cached: false,
      })

      return parsedExplanation

    } catch (error) {
      console.error('LLM explanation generation error:', error)
      throw new Error('Failed to generate explanation')
    }
  }

  // ===========================================
  // Generate Study Notes
  // ===========================================
  public async generateStudyNotes(topic: string, level: 'beginner' | 'intermediate' | 'advanced'): Promise<{
    notes: string
    keyConcepts: string[]
    practiceQuestions: string[]
    resources: string[]
  }> {
    try {
      const prompt = `Generate comprehensive study notes for the medical topic: "${topic}" at ${level} level.

Include:
1. Key concepts and definitions
2. Important facts and details
3. Clinical correlations
4. Practice questions (3-5)
5. Recommended resources

Format the response as JSON with the following structure:
{
  "notes": "comprehensive study notes...",
  "keyConcepts": ["concept1", "concept2", ...],
  "practiceQuestions": ["question1", "question2", ...],
  "resources": ["resource1", "resource2", ...]
}`

      const response = await this.openai.chat.completions.create({
        model: config.services.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a medical education expert. Generate comprehensive, accurate study materials for medical students.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: config.services.openai.maxTokens,
        temperature: 0.7,
      })

      const content = response.choices[0]?.message?.content || ''
      return JSON.parse(content)

    } catch (error) {
      console.error('LLM study notes generation error:', error)
      throw new Error('Failed to generate study notes')
    }
  }

  // ===========================================
  // Generate Practice Questions
  // ===========================================
  public async generatePracticeQuestions(topic: string, count: number = 5): Promise<Array<{
    question: string
    options: Array<{ letter: string; text: string }>
    correctAnswer: string
    explanation: string
    difficulty: 'easy' | 'medium' | 'hard'
  }>> {
    try {
      const prompt = `Generate ${count} practice questions for the medical topic: "${topic}".

Each question should have:
- Clear, concise question text
- 4 multiple choice options (A, B, C, D)
- Correct answer
- Detailed explanation
- Difficulty level (easy, medium, hard)

Format as JSON array with this structure:
[
  {
    "question": "question text",
    "options": [
      {"letter": "A", "text": "option A"},
      {"letter": "B", "text": "option B"},
      {"letter": "C", "text": "option C"},
      {"letter": "D", "text": "option D"}
    ],
    "correctAnswer": "A",
    "explanation": "detailed explanation",
    "difficulty": "medium"
  }
]`

      const response = await this.openai.chat.completions.create({
        model: config.services.openai.model,
        messages: [
          {
            role: 'system',
            content: 'You are a medical education expert. Generate high-quality practice questions for medical students.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: config.services.openai.maxTokens,
        temperature: 0.8,
      })

      const content = response.choices[0]?.message?.content || ''
      return JSON.parse(content)

    } catch (error) {
      console.error('LLM practice questions generation error:', error)
      throw new Error('Failed to generate practice questions')
    }
  }

  // ===========================================
  // Build Explanation Prompt
  // ===========================================
  private buildExplanationPrompt(questionData: any): string {
    const { questionText, options, correctAnswer, subject, system, difficulty } = questionData

    return `Please provide a comprehensive explanation for this medical question:

Question: ${questionText}

Options:
${options.map((opt: any) => `${opt.letter}. ${opt.text}`).join('\n')}

Correct Answer: ${correctAnswer}

Subject: ${subject || 'General Medicine'}
System: ${system || 'Not specified'}
Difficulty: ${difficulty || 'Medium'}

Please provide:
1. A detailed explanation of why the correct answer is right
2. Explanation of why other options are incorrect
3. Key concepts and principles involved
4. Clinical relevance and applications
5. Additional learning points

Format as JSON:
{
  "explanation": "detailed explanation...",
  "reasoning": "step-by-step reasoning...",
  "keyPoints": ["point1", "point2", ...],
  "references": ["reference1", "reference2", ...]
}`
  }

  // ===========================================
  // Get System Prompt
  // ===========================================
  private getSystemPrompt(): string {
    return `You are an expert medical educator with extensive experience in medical education and exam preparation. 

Your role is to:
1. Provide accurate, evidence-based explanations for medical questions
2. Explain complex medical concepts in clear, understandable terms
3. Highlight key learning points and clinical correlations
4. Reference current medical guidelines and best practices
5. Help students understand not just the answer, but the underlying principles

Guidelines:
- Use clear, concise language appropriate for medical students
- Include relevant clinical context and real-world applications
- Reference current medical literature when appropriate
- Explain both correct and incorrect answer choices
- Focus on understanding rather than memorization
- Maintain accuracy and avoid speculation`
  }

  // ===========================================
  // Parse Explanation Response
  // ===========================================
  private parseExplanation(explanation: string): {
    explanation: string
    reasoning: string
    keyPoints: string[]
    references: string[]
  } {
    try {
      return JSON.parse(explanation)
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        explanation,
        reasoning: 'Step-by-step reasoning not available',
        keyPoints: ['Key points not available'],
        references: ['References not available']
      }
    }
  }

  // ===========================================
  // Get Cached Response
  // ===========================================
  private async getCachedResponse(questionId: string): Promise<any> {
    try {
      const cached = await LLMResponse.findOne({
        questionId,
        cached: true,
        expiresAt: { $gt: new Date() }
      })

      return cached
    } catch (error) {
      console.error('Get cached response error:', error)
      return null
    }
  }

  // ===========================================
  // Save Response to Database
  // ===========================================
  private async saveResponse(data: {
    questionId: string
    prompt: string
    response: string
    model: string
    tokensUsed: number
    cost: number
    processingTime: number
    cached: boolean
  }): Promise<void> {
    try {
      const llmResponse = new LLMResponse({
        ...data,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      })

      await llmResponse.save()
    } catch (error) {
      console.error('Save LLM response error:', error)
    }
  }

  // ===========================================
  // Calculate Cost
  // ===========================================
  private calculateCost(tokens: number): number {
    // Approximate cost calculation (adjust based on actual OpenAI pricing)
    const costPerToken = 0.00003 // $0.03 per 1K tokens
    return tokens * costPerToken
  }
}

// ===========================================
// Export Singleton Instance
// ===========================================
export const llmService = LLMService.getInstance()

// ===========================================
// Utility Functions
// ===========================================
export const generateQuestionExplanation = async (questionData: any) => {
  return await llmService.generateExplanation(questionData)
}

export const generateStudyNotes = async (topic: string, level: 'beginner' | 'intermediate' | 'advanced') => {
  return await llmService.generateStudyNotes(topic, level)
}

export const generatePracticeQuestions = async (topic: string, count: number = 5) => {
  return await llmService.generatePracticeQuestions(topic, count)
}

export default llmService
