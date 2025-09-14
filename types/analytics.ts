export interface PerformanceMetrics {
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  averageTimePerQuestion: number
  totalTimeSpent: number
  flaggedQuestions: number
}

export interface SubjectBreakdown {
  subject: string
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  averageTime: number
}

export interface SystemBreakdown {
  system: string
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  averageTime: number
}

export interface DifficultyBreakdown {
  difficulty: 'easy' | 'medium' | 'hard'
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  averageTime: number
}

import { PracticeSession } from './question'

export interface ProgressData {
  date: string
  accuracy: number
  questionsAnswered: number
  timeSpent: number
}

export interface AnalyticsData {
  overall: PerformanceMetrics
  bySubject: SubjectBreakdown[]
  bySystem: SystemBreakdown[]
  byDifficulty: DifficultyBreakdown[]
  progress: ProgressData[]
  recentSessions: PracticeSession[]
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}
