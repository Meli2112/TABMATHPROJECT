import { useState, useCallback, useRef } from 'react'
import { sosService } from '@/services/sosService'
import { useDrMarcie } from './useDrMarcie'
import { useAuth } from '@/contexts/AuthContext'
import { useCouple } from './useCouple'
import type { 
  SOSSession, 
  SOSInput, 
  SOSAnalysis,
  SOSQuestionFlow 
} from '@/types/sosSystem'
import type { ConversationContext } from '@/types/drMarcie'

interface UseSOSSystemOptions {
  autoPlayVoice?: boolean
  enableEmergencyProtocols?: boolean
}

export function useSOSSystem(options: UseSOSSystemOptions = {}) {
  const { autoPlayVoice = true, enableEmergencyProtocols = true } = options
  const { user } = useAuth()
  const { couple } = useCouple()
  
  const [currentSession, setCurrentSession] = useState<SOSSession | null>(null)
  const [currentInput, setCurrentInput] = useState<Partial<SOSInput>>({})
  const [analysis, setAnalysis] = useState<SOSAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'initiation' | 'input' | 'waiting' | 'analysis' | 'complete'>('initiation')
  const [questionFlow, setQuestionFlow] = useState<SOSQuestionFlow[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [canInitiate, setCanInitiate] = useState(true)
  const [initiationReason, setInitiationReason] = useState<string>('')

  const sessionRef = useRef<SOSSession | null>(null)

  // Dr. Marcie integration for SOS guidance
  const sosContext: ConversationContext = {
    userId: user?.id || '',
    coupleId: couple?.id,
    sessionType: 'fight-solver',
    currentMood: 'frustrated',
    recentChallenges: [],
    previousResponses: []
  }

  const {
    generateResponse: generateDrMarcieResponse,
    currentResponse: drMarcieResponse,
    isSpeaking,
    playVoice,
    stopVoice
  } = useDrMarcie(sosContext, { autoPlay: autoPlayVoice })

  // Check if user can initiate SOS
  const checkSOSEligibility = useCallback(async () => {
    if (!user) return

    try {
      const eligibility = await sosService.canInitiateSOS(user.id)
      setCanInitiate(eligibility.canInitiate)
      if (!eligibility.canInitiate && eligibility.reason) {
        setInitiationReason(eligibility.reason)
      }
    } catch (error) {
      console.error('Error checking SOS eligibility:', error)
    }
  }, [user])

  // Initiate SOS session
  const initiateSOS = useCallback(async (): Promise<SOSSession | null> => {
    if (!user || !couple || !canInitiate) {
      throw new Error('Cannot initiate SOS session')
    }

    try {
      setIsLoading(true)
      setCurrentStep('initiation')

      const session = await sosService.initiateSOS(couple.id, user.id)
      setCurrentSession(session)
      sessionRef.current = session

      // Generate Dr. Marcie's welcome message
      await generateDrMarcieResponse(
        'SOS session initiated. Guide the user through the conflict resolution process.',
        { tone: 'supportive', sassLevel: 2, context: 'fight-solver' }
      )

      // Initialize question flow
      const initialQuestions = generateAdaptiveQuestions()
      setQuestionFlow(initialQuestions)
      setCurrentQuestionIndex(0)
      setCurrentStep('input')

      return session
    } catch (error) {
      console.error('Error initiating SOS:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user, couple, canInitiate, generateDrMarcieResponse])

  // Generate adaptive question flow
  const generateAdaptiveQuestions = useCallback((): SOSQuestionFlow[] => {
    return [
      {
        id: 'emotional-state',
        question: "First, let's check in with your emotions. How are you feeling right now?",
        type: 'emotion',
        required: true,
        options: ['angry', 'hurt', 'confused', 'frustrated', 'sad']
      },
      {
        id: 'severity-level',
        question: "On a scale of 1-5, how serious is this conflict?",
        type: 'scale',
        required: true,
        followUp: {
          condition: 'value >= 4',
          nextQuestion: 'emergency-check'
        }
      },
      {
        id: 'emergency-check',
        question: "This seems intense. Do you feel safe and able to continue, or do you need immediate support?",
        type: 'choice',
        required: true,
        options: ['I can continue', 'I need immediate support', 'I want to pause this']
      },
      {
        id: 'trigger-event',
        question: "What specifically triggered this conflict? Be as detailed as you can.",
        type: 'text',
        required: true,
        adaptiveLogic: {
          emotionalTriggers: ['betrayal', 'lying', 'cheating', 'abuse'],
          escalationQuestions: ['safety-check', 'support-network']
        }
      },
      {
        id: 'your-perspective',
        question: "Now tell me your side of the story. What happened from your perspective?",
        type: 'text',
        required: true
      },
      {
        id: 'desired-outcome',
        question: "What would you like to see happen to resolve this? What's your ideal outcome?",
        type: 'text',
        required: true
      },
      {
        id: 'safety-check',
        question: "I need to ask - do you feel physically and emotionally safe in this relationship?",
        type: 'choice',
        required: true,
        options: ['Yes, completely safe', 'Mostly safe', 'Sometimes unsafe', 'No, I don\'t feel safe']
      }
    ]
  }, [])

  // Submit answer to current question
  const submitAnswer = useCallback(async (answer: string | number) => {
    if (!currentSession || currentQuestionIndex >= questionFlow.length) return

    const currentQuestion = questionFlow[currentQuestionIndex]
    
    // Update current input with the answer
    const updatedInput = {
      ...currentInput,
      [currentQuestion.id.replace('-', '_')]: answer
    }
    setCurrentInput(updatedInput)

    // Check for adaptive logic triggers
    if (currentQuestion.adaptiveLogic && typeof answer === 'string') {
      const hasEmotionalTrigger = currentQuestion.adaptiveLogic.emotionalTriggers.some(
        trigger => answer.toLowerCase().includes(trigger)
      )
      
      if (hasEmotionalTrigger && enableEmergencyProtocols) {
        await handleEmergencyProtocol(answer)
        return
      }
    }

    // Generate Dr. Marcie's response to the answer
    await generateDrMarcieResponse(
      `User answered "${answer}" to the question about ${currentQuestion.id}. Provide encouraging feedback and guide them to the next step.`,
      { tone: 'supportive', sassLevel: 1, context: 'fight-solver' }
    )

    // Move to next question or complete input
    if (currentQuestionIndex < questionFlow.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      await completeSOSInput(updatedInput)
    }
  }, [currentSession, currentQuestionIndex, questionFlow, currentInput, generateDrMarcieResponse, enableEmergencyProtocols])

  // Handle emergency protocols
  const handleEmergencyProtocol = useCallback(async (triggerText: string) => {
    await generateDrMarcieResponse(
      `The user mentioned something concerning: "${triggerText}". Provide immediate support and guidance. Ask if they need professional help or emergency services.`,
      { tone: 'concerned', sassLevel: 1, context: 'fight-solver' }
    )

    // In a real implementation, this would trigger additional safety protocols
    console.warn('Emergency protocol triggered:', triggerText)
  }, [generateDrMarcieResponse])

  // Complete SOS input submission
  const completeSOSInput = useCallback(async (inputData: Partial<SOSInput>) => {
    if (!currentSession || !user) return

    try {
      setIsLoading(true)
      setCurrentStep('waiting')

      const sosInput: Omit<SOSInput, 'id' | 'sessionId' | 'userId' | 'submittedAt'> = {
        perspective: inputData.your_perspective as string || '',
        emotionalState: inputData.emotional_state as SOSInput['emotionalState'] || 'frustrated',
        severityLevel: inputData.severity_level as SOSInput['severityLevel'] || 3,
        triggerEvent: inputData.trigger_event as string || '',
        desiredOutcome: inputData.desired_outcome as string || ''
      }

      await sosService.submitSOSInput(currentSession.id, user.id, sosInput)

      // Generate waiting message
      await generateDrMarcieResponse(
        'Input received. Now waiting for partner\'s perspective before providing analysis.',
        { tone: 'supportive', sassLevel: 1, context: 'fight-solver' }
      )

    } catch (error) {
      console.error('Error submitting SOS input:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [currentSession, user, generateDrMarcieResponse])

  // Get SOS analysis results
  const getAnalysisResults = useCallback(async (sessionId: string): Promise<SOSAnalysis | null> => {
    try {
      setIsLoading(true)
      const analysisResult = await sosService.getSOSAnalysis(sessionId)
      
      if (analysisResult) {
        setAnalysis(analysisResult)
        setCurrentStep('analysis')

        // Generate Dr. Marcie's analysis presentation
        await generateDrMarcieResponse(
          'Analysis complete. Present the findings with your signature direct but caring approach.',
          { tone: 'direct', sassLevel: 3, context: 'fight-solver' }
        )
      }

      return analysisResult
    } catch (error) {
      console.error('Error getting analysis results:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [generateDrMarcieResponse])

  // Abort SOS session
  const abortSession = useCallback(async () => {
    if (!currentSession || !user) return

    try {
      await sosService.abortSOSSession(currentSession.id, user.id)
      setCurrentSession(null)
      setCurrentInput({})
      setAnalysis(null)
      setCurrentStep('initiation')
      setCurrentQuestionIndex(0)
    } catch (error) {
      console.error('Error aborting SOS session:', error)
      throw error
    }
  }, [currentSession, user])

  // Get current question
  const getCurrentQuestion = useCallback((): SOSQuestionFlow | null => {
    if (currentQuestionIndex >= questionFlow.length) return null
    return questionFlow[currentQuestionIndex]
  }, [currentQuestionIndex, questionFlow])

  // Navigation helpers
  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }, [currentQuestionIndex])

  const skipQuestion = useCallback(() => {
    if (currentQuestionIndex < questionFlow.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }, [currentQuestionIndex, questionFlow.length])

  return {
    // State
    currentSession,
    currentInput,
    analysis,
    isLoading,
    currentStep,
    canInitiate,
    initiationReason,
    drMarcieResponse,
    isSpeaking,
    
    // Question flow
    getCurrentQuestion,
    currentQuestionIndex,
    totalQuestions: questionFlow.length,
    
    // Actions
    checkSOSEligibility,
    initiateSOS,
    submitAnswer,
    completeSOSInput,
    getAnalysisResults,
    abortSession,
    
    // Navigation
    goToPreviousQuestion,
    skipQuestion,
    
    // Voice controls
    playVoice,
    stopVoice,
    
    // Progress
    progress: questionFlow.length > 0 ? (currentQuestionIndex / questionFlow.length) * 100 : 0,
    isComplete: currentStep === 'complete' || currentStep === 'analysis'
  }
}