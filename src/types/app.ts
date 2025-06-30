export interface User {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  age?: number
  gender?: string
  relationshipStatus?: string
  subscriptionTier: 'free' | 'premium' | 'pro'
  createdAt: string
  updatedAt: string
}

export interface Couple {
  id: string
  partner1Id: string
  partner2Id: string
  relationshipStartDate?: string
  status: 'active' | 'paused' | 'ended'
  totalScore: number
  currentStreak: number
  longestStreak: number
  createdAt: string
  updatedAt: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  category: 'communication' | 'intimacy' | 'trust' | 'fun' | 'conflict-resolution'
  difficultyLevel: 1 | 2 | 3 | 4 | 5
  pointsReward: number
  timeLimitMinutes?: number
  isPremium: boolean
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface ChallengeAttempt {
  id: string
  coupleId: string
  challengeId: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  score?: number
  completedAt?: string
  feedback?: string
  aiAnalysis?: string
  createdAt: string
  updatedAt: string
}

export interface Consequence {
  id: string
  coupleId: string
  type: 'reward' | 'penalty' | 'task'
  title: string
  description: string
  assignedTo?: string
  status: 'pending' | 'completed' | 'expired'
  dueDate?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface FightLog {
  id: string
  coupleId: string
  reportedBy: string
  severityLevel: 1 | 2 | 3 | 4 | 5
  description: string
  aiAnalysis?: string
  resolutionStatus: 'unresolved' | 'in-progress' | 'resolved'
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  type: 'challenge' | 'consequence' | 'fight' | 'achievement' | 'system'
  title: string
  message: string
  isRead: boolean
  actionUrl?: string
  createdAt: string
}

export interface AIResponse {
  message: string
  suggestions?: string[]
  score?: number
  analysis?: string
}

export interface VoiceConfig {
  voiceId: string
  stability: number
  similarityBoost: number
  style: number
}