export interface RealtimeEvent {
  id: string
  type: 'score_update' | 'challenge_completed' | 'consequence_triggered' | 'sos_activated' | 'game_started' | 'partner_joined'
  userId: string
  coupleId: string
  data: any
  timestamp: string
}

export interface LiveDashboard {
  coupleId: string
  scores: {
    partner1: {
      totalPoints: number
      vulnerabilityPoints: number
      trustThermometer: number
      currentStreak: number
      longestStreak: number
    }
    partner2: {
      totalPoints: number
      vulnerabilityPoints: number
      trustThermometer: number
      currentStreak: number
      longestStreak: number
    }
    combined: {
      totalPoints: number
      relationshipHealth: number
      challengesCompleted: number
      conflictsResolved: number
    }
  }
  activeGames: GameSession[]
  recentActivity: RealtimeEvent[]
  notifications: RealtimeNotification[]
  consequences: ActiveConsequence[]
  lastUpdated: string
}

export interface RealtimeNotification {
  id: string
  userId: string
  type: 'daily_challenge' | 'sos_prompt' | 'consequence_alert' | 'reward_earned' | 'partner_activity'
  title: string
  message: string
  drMarcieMessage?: string
  actionUrl?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isRead: boolean
  createdAt: string
  expiresAt?: string
}

export interface RelationshipStory {
  id: string
  coupleId: string
  originStory: string
  betrayalHistory: BetrayalEvent[]
  milestones: RelationshipMilestone[]
  currentChallenges: string[]
  strengthsIdentified: string[]
  growthAreas: string[]
  drMarcieNotes: string[]
  lastUpdated: string
}

export interface BetrayalEvent {
  id: string
  type: 'infidelity' | 'lying' | 'broken_promise' | 'emotional_affair' | 'financial' | 'other'
  description: string
  severity: 1 | 2 | 3 | 4 | 5
  reportedBy: string
  dateOccurred: string
  resolutionStatus: 'unresolved' | 'in_progress' | 'resolved'
  healingProgress: number // 0-100
  drMarcieAnalysis?: string
  createdAt: string
}

export interface RelationshipMilestone {
  id: string
  type: 'anniversary' | 'challenge_completed' | 'conflict_resolved' | 'trust_rebuilt' | 'custom'
  title: string
  description: string
  dateAchieved: string
  pointsAwarded: number
  drMarcieCelebration: string
}