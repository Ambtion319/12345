export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'admin' | 'instructor'
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  user: User
  expires: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role?: 'student' | 'admin' | 'instructor'
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}
