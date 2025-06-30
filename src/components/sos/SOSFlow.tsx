import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Users, BarChart3, Heart, ArrowLeft } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import SOSInputBooth from './SOSInputBooth'
import SOSAnalysisResults from './SOSAnalysisResults'
import DrMarcieAvatar from '@/components/avatar/DrMarcieAvatar'
import DrMarcieVoicePlayer from '@/components/avatar/DrMarcieVoicePlayer'
import { useAuth } from '@/contexts/AuthContext'
import { useCouple } from '@/hooks/useCouple'
import { useDrMarcie } from '@/hooks/useDrMarcie'
import type { ConversationContext } from '@/types/drMarcie'

export default function SOSFlow() {
  const { user } = useAuth()
  const { couple } = useCouple()
  const [currentStep, setCurrentStep] = useState<'intro' | 'input' | 'waiting' | 'results'>('intro')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const context: ConversationContext = {
    userId: user?.id || '',
    coupleId: couple?.id,
    sessionType: 'fight-solver',
    currentMood: 'frustrated',
    recentChallenges: [],
    previousResponses: []
  }

  const {
    generateResponse,
    currentResponse,
    isSpeaking,
    playVoice
  } = useDrMarcie(context, { autoPlay: true })

  useEffect(() => {
    if (currentStep === 'intro') {
      generateSOSIntro()
    }
  }, [currentStep])

  const generateSOSIntro = async () => {
    const prompt = `The user just activated the SOS Fight Solver. They're in conflict with their partner. Welcome them, explain the process, and get them ready to share their side of the story. Be supportive but establish that you're going to get to the truth.`

    await generateResponse(prompt, {
      tone: 'supportive',
      sassLevel: 2,
      context: 'fight-solver'
    })
  }

  const handleStartSOS = async () => {
    setIsLoading(true)
    try {
      // Simulate SOS session creation
      await new Promise(resolve => setTimeout(resolve, 1000))
      const mockSessionId = `sos_${Date.now()}`
      setSessionId(mockSessionId)
      setCurrentStep('input')
    } catch (error) {
      console.error('Error starting SOS:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputComplete = () => {
    setCurrentStep('waiting')
    // Simulate waiting for partner
    setTimeout(() => {
      setCurrentStep('results')
    }, 3000)
  }

  const handleAnalysisComplete = () => {
    setCurrentStep('intro')
    setSessionId(null)
  }

  const renderIntroScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <AlertTriangle className="w-12 h-12 text-red-500" />
            <h1 className="text-3xl font-bold text-gradient">SOS Fight Solver</h1>
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          
          <DrMarcieAvatar
            state={{
              expression: 'concerned',
              gesture: 'none',
              eyeContact: true,
              isAnimating: false
            }}
            isSpeaking={isSpeaking}
            currentResponse={currentResponse}
            size="large"
          />
          
          <div className="space-y-4">
            <p className="text-lg text-gray-700 dark:text-gray-300">
              I'm here to help you and your partner work through this conflict. 
              This is a safe space where we'll get to the truth and find a path forward.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                How SOS Works:
              </h3>
              <ul className="text-left space-y-2 text-blue-700 dark:text-blue-300 text-sm">
                <li>• You'll each share your perspective privately</li>
                <li>• I'll analyze both sides without bias</li>
                <li>• You'll receive personalized guidance and action steps</li>
                <li>• We'll create a plan to heal and move forward</li>
              </ul>
            </div>
          </div>
          
          {currentResponse && (
            <Card variant="gradient" className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-1 text-left">
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {currentResponse.message}
                  </p>
                  <DrMarcieVoicePlayer
                    response={currentResponse}
                    autoPlay={true}
                  />
                </div>
              </div>
            </Card>
          )}
          
          <div className="flex space-x-4">
            <Button
              variant="secondary"
              onClick={() => window.history.back()}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Not Right Now
            </Button>
            <Button
              onClick={handleStartSOS}
              isLoading={isLoading}
              className="flex-1"
            >
              Start SOS Session
            </Button>
          </div>
        </motion.div>
      </Card>
    </div>
  )

  const renderWaitingScreen = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <LoadingSpinner size="lg" className="mb-6" />
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Waiting for Partner
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Dr. Marcie is waiting for your partner to complete their input before providing analysis.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            Both perspectives are needed for accurate conflict analysis
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {currentStep === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderIntroScreen()}
          </motion.div>
        )}

        {currentStep === 'input' && sessionId && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
          >
            <SOSInputBooth
              sessionId={sessionId}
              onComplete={handleInputComplete}
            />
          </motion.div>
        )}

        {currentStep === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderWaitingScreen()}
          </motion.div>
        )}

        {currentStep === 'results' && sessionId && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
          >
            <SOSAnalysisResults
              sessionId={sessionId}
              onComplete={handleAnalysisComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}