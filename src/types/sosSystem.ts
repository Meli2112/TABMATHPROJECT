export interface SOSSession {
  id: string
  coupleId: string
  initiatedBy: string
  status: 'active' | 'partner-pending' | 'analyzing' | 'resolved' | 'abandoned'
  createdAt: string
  resolvedAt?: string
}

export interface SOSInput {
  id: string
  sessionId: string
  userId: string
  perspective: string
  emotionalState: 'angry' | 'hurt' | 'confused' | 'frustrated' | 'sad'
  severityLevel: 1 | 2 | 3 | 4 | 5
  triggerEvent: string
  desiredOutcome: string
  submittedAt: string
}

export interface SOSAnalysis {
  id: string
  sessionId: string
  aiProvider: 'openai' | 'anthropic'
  analysis: {
    summary: string
    rootCause: string
    faultAssignment: {
      partner1Fault: number // 0-100 percentage
      partner2Fault: number // 0-100 percentage
      explanation: string
    }
    recommendations: {
      partner1Actions: string[]
      partner2Actions: string[]
      jointActions: string[]
    }
    apologyRequired: {
      partner1ShouldApologize: boolean
      partner2ShouldApologize: boolean
      apologyScripts: {
        partner1?: string
        partner2?: string
      }
    }
    healingChallenges: string[]
    communicationBreakdown: string
    emotionalValidation: string
    personalizedFeedback?: {
      partner1: DrMarcieResponse
      partner2: DrMarcieResponse
    }
  }
  drMarcieResponse: DrMarcieResponse
  createdAt: string
}

export interface SOSQuestionFlow {
  id: string
  question: string
  type: 'text' | 'scale' | 'choice' | 'emotion'
  required: boolean
  options?: string[]
  followUp?: {
    condition: string
    nextQuestion: string
  }
  adaptiveLogic?: {
    emotionalTriggers: string[]
    escalationQuestions: string[]
  }
}

export interface SOSEmergencyProtocol {
  triggerWords: string[]
  escalationLevel: 1 | 2 | 3 | 4 | 5
  immediateActions: string[]
  professionalReferral: boolean
  cooldownPeriod: number // minutes
}

import type { DrMarcieResponse } from '@/types/drMarcie'