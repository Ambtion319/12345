export interface Question {
  id: string
  questionBankId: string
  questionText: string
  options: QuestionOption[]
  correctAnswer: string
  explanation?: string
  subject?: string
  system?: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  images?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface QuestionOption {
  id: string
  letter: string
  text: string
}

export interface QuestionBank {
  id: string
  userId: string
  name: string
  description?: string
  subject?: string
  totalQuestions: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  fileUrl?: string
  fileType: 'pdf' | 'docx' | 'xlsx'
  createdAt: Date
  updatedAt: Date
}

export interface UserAnswer {
  id: string
  userId: string
  questionId: string
  selectedOption: string
  isCorrect: boolean
  timeSpent: number
  isFlagged: boolean
  answeredAt: Date
}

export interface PracticeSession {
  id: string
  userId: string
  questionBankId: string
  mode: 'tutor' | 'timed' | 'review'
  totalQuestions: number
  completedQuestions: number
  correctAnswers: number
  timeSpent: number
  status: 'active' | 'completed' | 'paused'
  startedAt: Date
  completedAt?: Date
}

export interface QuestionFilters {
  subject?: string
  system?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
  isFlagged?: boolean
}
