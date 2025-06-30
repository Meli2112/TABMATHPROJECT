export interface DrMarciePersonality {
  tone: 'sweet-savage' | 'supportive' | 'direct' | 'playful'
  sassLevel: 1 | 2 | 3 | 4 | 5
  context: 'challenge' | 'fight-solver' | 'general' | 'consequence'
}

export interface DrMarcieResponse {
  message: string
  voiceText: string
  tone: DrMarciePersonality['tone']
  animations?: string[]
  followUpQuestions?: string[]
  actionItems?: string[]
}

export interface VoiceConfig {
  voiceId: string
  stability: number
  similarityBoost: number
  style: number
  speakingRate: number
  pitch: number
}

export interface AvatarState {
  expression: 'neutral' | 'happy' | 'concerned' | 'sassy' | 'encouraging' | 'stern'
  gesture: 'none' | 'pointing' | 'thinking' | 'clapping' | 'shrugging'
  eyeContact: boolean
  isAnimating: boolean
}

export interface ConversationContext {
  userId: string
  coupleId?: string
  relationshipStory?: string
  recentChallenges: string[]
  currentMood: 'happy' | 'frustrated' | 'sad' | 'angry' | 'neutral'
  sessionType: 'challenge' | 'fight-solver' | 'check-in' | 'consequence'
  previousResponses: string[]
}

export interface DrMarcieConversation {
  id: string
  userId: string
  coupleId?: string
  sessionType: ConversationContext['sessionType']
  context: Record<string, any>
  userMessage: string
  drMarcieResponse: DrMarcieResponse
  createdAt: string
}