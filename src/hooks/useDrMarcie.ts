import { useState, useCallback, useRef } from 'react'
import { drMarcieAI } from '@/services/drMarcieAI'
import { avatarAnimationEngine } from '@/services/avatarAnimationEngine'
import { voiceSynthesis } from '@/services/voiceSynthesis'
import type { 
  DrMarcieResponse, 
  ConversationContext, 
  AvatarState,
  DrMarciePersonality 
} from '@/types/drMarcie'

interface UseDrMarcieOptions {
  autoPlay?: boolean
  persistConversation?: boolean
  contextualMemory?: boolean
}

export function useDrMarcie(
  baseContext: ConversationContext,
  options: UseDrMarcieOptions = {}
) {
  const {
    autoPlay = true,
    persistConversation = true,
    contextualMemory = true
  } = options

  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentResponse, setCurrentResponse] = useState<DrMarcieResponse | null>(null)
  const [avatarState, setAvatarState] = useState<AvatarState>({
    expression: 'neutral',
    gesture: 'none',
    eyeContact: true,
    isAnimating: false
  })
  const [conversationHistory, setConversationHistory] = useState<Array<{
    user: string
    marcie: DrMarcieResponse
    timestamp: Date
  }>>([])

  const currentAnimationRef = useRef<string | null>(null)
  const conversationContextRef = useRef<ConversationContext>(baseContext)

  // Update conversation context
  const updateContext = useCallback((updates: Partial<ConversationContext>) => {
    conversationContextRef.current = {
      ...conversationContextRef.current,
      ...updates
    }
  }, [])

  // Generate Dr. Marcie response
  const generateResponse = useCallback(async (
    prompt: string,
    personality?: Partial<DrMarciePersonality>
  ): Promise<DrMarcieResponse> => {
    setIsLoading(true)
    
    try {
      // Update context with recent conversation if enabled
      if (contextualMemory && conversationHistory.length > 0) {
        const recentResponses = conversationHistory
          .slice(-5)
          .map(entry => entry.marcie.message)
        
        conversationContextRef.current = {
          ...conversationContextRef.current,
          previousResponses: recentResponses
        }
      }

      const response = await drMarcieAI.generateResponse(
        prompt,
        conversationContextRef.current,
        personality
      )

      setCurrentResponse(response)

      // Update avatar state based on response
      const newAvatarState = drMarcieAI.getAvatarState(response, conversationContextRef.current)
      setAvatarState(newAvatarState)

      // Start appropriate animation
      const animationId = avatarAnimationEngine.selectAnimationForResponse(
        response,
        conversationContextRef.current
      )
      
      const animation = avatarAnimationEngine.startAnimation(animationId)
      if (animation) {
        currentAnimationRef.current = animationId
        
        // Update avatar state during animation
        const updateAnimation = () => {
          const animationState = avatarAnimationEngine.getCurrentAnimationState()
          if (animationState) {
            setAvatarState(animationState)
          }
          
          if (!avatarAnimationEngine.isAnimationComplete()) {
            requestAnimationFrame(updateAnimation)
          } else {
            currentAnimationRef.current = null
            setAvatarState(prev => ({ ...prev, isAnimating: false }))
          }
        }
        
        requestAnimationFrame(updateAnimation)
      }

      // Play voice if auto-play is enabled
      if (autoPlay) {
        playVoice(response)
      }

      // Store in conversation history
      if (persistConversation) {
        setConversationHistory(prev => [...prev, {
          user: prompt,
          marcie: response,
          timestamp: new Date()
        }])
      }

      return response
    } catch (error) {
      console.error('Error generating Dr. Marcie response:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [conversationHistory, contextualMemory, persistConversation, autoPlay])

  // Play voice response
  const playVoice = useCallback(async (response?: DrMarcieResponse) => {
    const responseToPlay = response || currentResponse
    if (!responseToPlay) return

    try {
      setIsSpeaking(true)
      await voiceSynthesis.speakDrMarcieResponse(responseToPlay)
    } catch (error) {
      console.error('Error playing voice:', error)
    } finally {
      setIsSpeaking(false)
    }
  }, [currentResponse])

  // Stop voice
  const stopVoice = useCallback(() => {
    voiceSynthesis.stopSpeaking()
    setIsSpeaking(false)
  }, [])

  // Quick response generators for common scenarios
  const generateWelcome = useCallback(async () => {
    const welcomePrompt = `Welcome the user to a therapy session. Be warm but establish your no-nonsense approach. Ask about their relationship goals.`
    
    return generateResponse(welcomePrompt, {
      tone: 'supportive',
      sassLevel: 2,
      context: 'general'
    })
  }, [generateResponse])

  const generateChallengeIntro = useCallback(async (challengeTitle: string, challengeDescription: string) => {
    const prompt = `Introduce the "${challengeTitle}" challenge: ${challengeDescription}. Get them excited but set clear expectations.`
    
    return generateResponse(prompt, {
      tone: 'playful',
      sassLevel: 3,
      context: 'challenge'
    })
  }, [generateResponse])

  const generateSOSResponse = useCallback(async (conflictDescription: string) => {
    const prompt = `Help resolve this conflict: ${conflictDescription}. Be direct about what needs to happen.`
    
    return generateResponse(prompt, {
      tone: 'direct',
      sassLevel: 4,
      context: 'fight-solver'
    })
  }, [generateResponse])

  const generateConsequenceMessage = useCallback(async (consequenceType: string, reason: string) => {
    const prompt = `Deliver a consequence for ${reason}. Consequence type: ${consequenceType}. Be firm but fair.`
    
    return generateResponse(prompt, {
      tone: 'sweet-savage',
      sassLevel: 4,
      context: 'consequence'
    })
  }, [generateResponse])

  // Clear conversation history
  const clearHistory = useCallback(() => {
    setConversationHistory([])
    setCurrentResponse(null)
  }, [])

  // Get conversation summary
  const getConversationSummary = useCallback(() => {
    return conversationHistory.map(entry => ({
      user: entry.user,
      marcie: entry.marcie.message,
      timestamp: entry.timestamp
    }))
  }, [conversationHistory])

  return {
    // State
    isLoading,
    isSpeaking,
    currentResponse,
    avatarState,
    conversationHistory: getConversationSummary(),
    
    // Actions
    generateResponse,
    playVoice,
    stopVoice,
    updateContext,
    clearHistory,
    
    // Quick generators
    generateWelcome,
    generateChallengeIntro,
    generateSOSResponse,
    generateConsequenceMessage,
    
    // Utils
    isVoiceAvailable: voiceSynthesis.isAvailable()
  }
}