export interface TherapyGame {
  id: string
  title: string
  description: string
  category: 'communication' | 'intimacy' | 'trust' | 'conflict-resolution' | 'fun' | 'emotional-intelligence'
  gameType: 'quiz' | 'role-play' | 'puzzle' | 'timed-challenge' | 'sharing' | 'creative' | 'auction' | 'matching'
  difficultyLevel: 1 | 2 | 3 | 4 | 5
  estimatedDuration: number // minutes
  pointsReward: number
  isPremium: boolean
  drMarcieIntro: string
  drMarcieOutro: string
  rules: string[]
  prompts: GamePrompt[]
  scoringCriteria: ScoringCriteria
  personalizations: PersonalizationRule[]
  consequences: GameConsequence[]
  rewards: GameReward[]
  createdAt: string
  updatedAt: string
}

export interface GamePrompt {
  id: string
  order: number
  type: 'question' | 'instruction' | 'scenario' | 'reflection' | 'challenge' | 'auction-item' | 'match-pair'
  content: string
  drMarcieVoiceText: string
  timeLimit?: number
  requiredResponse: 'text' | 'choice' | 'rating' | 'audio' | 'both-partners' | 'bid' | 'selection'
  choices?: string[]
  followUpPrompts?: string[]
  aiPersonalization?: {
    useRelationshipHistory: boolean
    adaptToDifficulty: boolean
    personalizeForEmotionalState: boolean
  }
}

export interface ScoringCriteria {
  maxPoints: number
  categories: {
    participation: number
    honesty: number
    effort: number
    insight: number
    connection: number
    vulnerability: number
    creativity: number
  }
  bonusPoints: {
    vulnerability: number
    humor: number
    creativity: number
    speedBonus: number
    perfectScore: number
  }
  penalties: {
    skipping: number
    lowEffort: number
    dishonesty: number
  }
}

export interface PersonalizationRule {
  condition: string // e.g., "relationship_length < 1_year"
  modification: {
    promptChanges?: { [promptId: string]: string }
    difficultyAdjustment?: number
    additionalContext?: string
    drMarciePersonality?: 'supportive' | 'challenging' | 'playful' | 'direct'
  }
}

export interface GameConsequence {
  id: string
  triggerCondition: 'skip' | 'low_score' | 'no_participation' | 'dishonest_answer'
  severity: 'light' | 'medium' | 'heavy'
  type: 'screensaver_change' | 'app_block' | 'notification_spam' | 'challenge_assignment'
  description: string
  drMarcieMessage: string
  duration?: number // minutes
  requiresConsent: boolean
}

export interface GameReward {
  id: string
  triggerCondition: 'completion' | 'high_score' | 'vulnerability_bonus' | 'streak'
  type: 'points' | 'badge' | 'unlock' | 'privilege'
  value: number
  title: string
  description: string
  drMarcieMessage: string
}

export interface GameSession {
  id: string
  gameId: string
  coupleId: string
  status: 'starting' | 'in-progress' | 'paused' | 'completed' | 'abandoned'
  currentPromptIndex: number
  responses: GameResponse[]
  scores: {
    partner1: number
    partner2: number
    combined: number
    vulnerabilityPoints: number
    trustThermometer: number
  }
  drMarcieCommentary: string[]
  personalizedPrompts: { [promptId: string]: string }
  startedAt: string
  completedAt?: string
  pausedAt?: string
  realTimeEvents: GameEvent[]
}

export interface GameResponse {
  id: string
  sessionId: string
  promptId: string
  userId: string
  response: string | string[] | number | { bid?: number; selection?: string }
  submittedAt: string
  aiAnalysis?: string
  drMarcieFeedback?: string
  emotionalScore?: number
  vulnerabilityScore?: number
  honestyScore?: number
}

export interface GameEvent {
  id: string
  sessionId: string
  type: 'prompt_start' | 'response_submitted' | 'score_update' | 'consequence_triggered' | 'reward_earned'
  data: any
  timestamp: string
}

export interface GameLibrary {
  games: TherapyGame[]
  categories: GameCategory[]
  progressionRules: ProgressionRule[]
}

export interface GameCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
  unlockRequirements: {
    minimumScore: number
    requiredGames: string[]
    relationshipMilestones: string[]
  }
}

export interface ProgressionRule {
  id: string
  condition: string
  unlocks: string[] // game IDs
  rewards: GameReward[]
}