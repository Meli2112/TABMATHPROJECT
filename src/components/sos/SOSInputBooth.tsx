import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Progress from '@/components/ui/Progress'
import DrMarcieAvatar from '@/components/avatar/DrMarcieAvatar'
import DrMarcieVoicePlayer from '@/components/avatar/DrMarcieVoicePlayer'
import { useDrMarcie } from '@/hooks/useDrMarcie'
import { useAuth } from '@/contexts/AuthContext'
import type { ConversationContext } from '@/types/drMarcie'

interface SOSInputBoothProps {
  sessionId: string
  onComplete?: () => void
  className?: string
}

interface Question {
  id: string
  question: string
  type: 'text' | 'scale' | 'emotion' | 'choice'
  required: boolean
  options?: string[]
}

export default function SOSInputBooth({
  sessionId,
  onComplete,
  className = ''
}: SOSInputBoothProps) {
  const { user } = useAuth()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentAnswer, setCurrentAnswer] = useState<string>('')
  const [showEmergencyOptions, setShowEmergencyOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const questions: Question[] = [
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
      required: true
    },
    {
      id: 'trigger-event',
      question: "What specifically triggered this conflict? Be as detailed as you can.",
      type: 'text',
      required: true
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
    }
  ]

  const context: ConversationContext = {
    userId: user?.id || '',
    sessionType: 'fight-solver',
    currentMood: 'frustrated',
    recentChallenges: [],
    previousResponses: []
  }

  const {
    generateResponse,
    currentResponse,
    isSpeaking
  } = useDrMarcie(context, { autoPlay: false })

  useEffect(() => {
    generateQuestionGuidance()
  }, [currentQuestionIndex])

  const generateQuestionGuidance = async () => {
    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return

    const prompt = `Guide the user through this SOS question: "${currentQuestion.question}". Be supportive and help them feel safe to share honestly.`

    await generateResponse(prompt, {
      tone: 'supportive',
      sassLevel: 1,
      context: 'fight-solver'
    })
  }

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() && questions[currentQuestionIndex].required) return

    setIsLoading(true)

    try {
      const currentQuestion = questions[currentQuestionIndex]
      
      // Store the answer
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: currentAnswer
      }))

      // Check for emergency triggers
      if (currentAnswer.toLowerCase().includes('unsafe') || 
          currentAnswer.toLowerCase().includes('abuse') ||
          currentAnswer.toLowerCase().includes('hurt me')) {
        setShowEmergencyOptions(true)
        return
      }

      // Generate acknowledgment
      const acknowledgmentPrompt = `Acknowledge their answer: "${currentAnswer}". Be supportive and guide them to continue.`
      
      await generateResponse(acknowledgmentPrompt, {
        tone: 'supportive',
        sassLevel: 1,
        context: 'fight-solver'
      })

      setCurrentAnswer('')

      // Move to next question or complete
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
      } else {
        // Complete the input process
        setTimeout(() => {
          onComplete?.()
        }, 2000)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && questions[currentQuestionIndex]?.type === 'text') {
      e.preventDefault()
      handleSubmitAnswer()
    }
  }

  const renderQuestionInput = () => {
    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return null

    switch (currentQuestion.type) {
      case 'text':
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share your thoughts here..."
            className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            disabled={isLoading}
          />
        )

      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Not serious</span>
              <span>Very serious</span>
            </div>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setCurrentAnswer(value.toString())}
                  className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                    currentAnswer === value.toString()
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-400'
                  }`}
                  disabled={isLoading}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        )

      case 'emotion':
        return (
          <div className="grid grid-cols-2 gap-3">
            {currentQuestion.options?.map((emotion) => (
              <button
                key={emotion}
                onClick={() => setCurrentAnswer(emotion)}
                className={`py-3 px-4 rounded-lg border-2 transition-colors capitalize ${
                  currentAnswer === emotion
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    : 'border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-400'
                }`}
                disabled={isLoading}
              >
                {emotion}
              </button>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Header with Dr. Marcie */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-6">
        <div className="flex items-center space-x-4">
          <DrMarcieAvatar
            state={{
              expression: 'concerned',
              gesture: 'none',
              eyeContact: true,
              isAnimating: false
            }}
            isSpeaking={isSpeaking}
            size="medium"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gradient mb-2">
              SOS Fight Solver - Private Input Booth
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Dr. Marcie is here to guide you through this process. Your partner cannot see your responses.
            </p>
          </div>
          {currentResponse && (
            <DrMarcieVoicePlayer
              response={currentResponse}
              autoPlay={false}
            />
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} variant="gradient" />
      </div>

      {/* Dr. Marcie's Current Response */}
      {currentResponse && (
        <motion.div
          className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-lg p-4 mb-6 border border-pink-200 dark:border-pink-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-gray-900 dark:text-gray-100">
            {currentResponse.message}
          </p>
        </motion.div>
      )}

      {/* Question Card */}
      {currentQuestion && (
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          key={currentQuestion.id}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {currentQuestion.question}
          </h3>

          {renderQuestionInput()}

          {/* Emergency Alert */}
          {showEmergencyOptions && (
            <motion.div
              className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    Safety Check
                  </h4>
                  <p className="text-red-700 dark:text-red-300 text-sm mb-3">
                    Your response indicates you might need additional support. Would you like to:
                  </p>
                  <div className="space-y-2">
                    <button className="block w-full text-left px-3 py-2 bg-red-100 dark:bg-red-800/30 rounded hover:bg-red-200 dark:hover:bg-red-800/50 text-red-800 dark:text-red-200 text-sm">
                      Connect with a crisis counselor
                    </button>
                    <button className="block w-full text-left px-3 py-2 bg-red-100 dark:bg-red-800/30 rounded hover:bg-red-200 dark:hover:bg-red-800/50 text-red-800 dark:text-red-200 text-sm">
                      Get local emergency resources
                    </button>
                    <button 
                      onClick={() => setShowEmergencyOptions(false)}
                      className="block w-full text-left px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm"
                    >
                      Continue with SOS process
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0 || isLoading}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <Button
          onClick={handleSubmitAnswer}
          disabled={(!currentAnswer && currentQuestion?.required) || isLoading}
          isLoading={isLoading}
          className="flex items-center space-x-2"
        >
          <span>
            {currentQuestionIndex >= questions.length - 1 ? 'Complete Input' : 'Continue'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}