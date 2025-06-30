export interface ConsequenceRule {
  id: string
  triggeredBy: 'missed_challenge' | 'low_score' | 'skipped_task' | 'fight_unresolved' | 'streak_broken' | 'game_abandoned'
  severity: 'light' | 'medium' | 'heavy'
  type: 'screensaver' | 'app_block' | 'notification_spam' | 'challenge_assignment' | 'privilege_loss'
  description: string
  drMarcieMessage: string
  isActive: boolean
  requiresConsent: boolean
  maxDuration?: number // minutes
  createdAt: string
}

export interface ActiveConsequence {
  id: string
  ruleId: string
  userId: string
  coupleId: string
  status: 'pending_consent' | 'active' | 'completed' | 'cancelled'
  triggeredBy: string
  assignedAt: string
  startedAt?: string
  completedAt?: string
  cancelledAt?: string
  userConsent: boolean
  metadata: {
    originalScreensaver?: string
    blockedApps?: string[]
    notificationCount?: number
    challengeAssigned?: string
    screensaverImages?: string[]
    notificationMessages?: string[]
  }
  drMarcieCommentary: string[]
}

export interface ConsequencePreferences {
  userId: string
  allowScreensaverChanges: boolean
  allowAppBlocking: boolean
  allowNotificationSpam: boolean
  maxNotificationFrequency: number // minutes
  blockedAppCategories: string[]
  exemptionHours: { start: string; end: string }[] // e.g., work hours
  emergencyBypass: boolean
  updatedAt: string
}

export interface ScreensaverImage {
  id: string
  url: string
  category: 'motivational' | 'humorous' | 'guilt-trip' | 'romantic'
  drMarcieCaption: string
  isActive: boolean
}