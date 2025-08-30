export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

export interface Poll {
  id: string
  title: string
  description?: string
  options: PollOption[]
  totalVotes: number
  createdAt: Date
  isActive: boolean
  createdBy: string // User ID
}

export interface PollOption {
  id: string
  text: string
  votes: number
  percentage: number
}

export interface Vote {
  id: string
  pollId: string
  optionId: string
  userId: string
  createdAt: Date
}

export interface CreatePollData {
  title: string
  description?: string
  options: string[] // Array of option texts
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterData extends AuthCredentials {
  name: string
  confirmPassword: string
}
