import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, ArrowRight, Play } from 'lucide-react'
import DrMarcieAvatar from '@/components/avatar/DrMarcieAvatar'
import DrMarcieVoicePlayer from '@/components/avatar/DrMarcieVoicePlayer'
import Button from '@/components/ui/Button'
import { useDrMarcie } from '@/hooks/useDrMarcie'
import type { ConversationContext } from '@/types/drMarcie'

interface WelcomeScreenProps {
  onGetStarted: () => void
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showAvatar, setShowAvatar] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  const context: ConversationContext = {
    userId: '',
    sessionType: 'general',
    currentMood: 'neutral',
    recentChallenges: [],
    previousResponses: []
  }

  const {
    generateResponse,
    currentResponse,
    isSpeaking,
    isLoading
  } = useDrMarcie(context, { autoPlay: false })

  useEffect(() => {
    const timer = setTimeout(() => setShowAvatar(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showAvatar && !currentResponse && currentStep === 1) {
      generateWelcomeMessage()
    }
  }, [showAvatar, currentStep])

  const generateWelcomeMessage = async () => {
    await generateResponse(
      "Welcome new users to the couples therapy app. Be warm but establish your no-nonsense approach. Introduce yourself as Dr. Marcie Liss and explain what makes this app different.",
      { tone: 'supportive', sassLevel: 2, context: 'general' }
    )
  }

  const welcomeSteps = [
    {
      title: "Welcome to",
      subtitle: "How About We DON'T Break Up?",
      description: "The gamified couples therapy app that actually works",
      showVideo: false
    },
    {
      title: "Meet Dr. Marcie Liss",
      subtitle: "Your AI Couples Therapist",
      description: "She's sweet, she's savage, and she's here to save your relationship",
      showVideo: true
    },
    {
      title: "Ready to Begin?",
      subtitle: "Let's rebuild your love story",
      description: "Together, we'll turn your relationship challenges into growth opportunities",
      showVideo: false
    }
  ]

  const currentStepData = welcomeSteps[currentStep]

  const handlePlayIntro = () => {
    setShowVideo(true)
    if (currentResponse) {
      // Play Dr. Marcie's voice
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-pink-500/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-2xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Heart className="w-8 h-8 text-pink-400" />
              <Sparkles className="w-6 h-6 text-purple-400" />
              <Heart className="w-8 h-8 text-pink-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-4">
              {currentStepData.title}
            </h1>
            <h2 className="text-2xl md:text-4xl font-semibold text-white mb-6">
              {currentStepData.subtitle}
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              {currentStepData.description}
            </p>
          </motion.div>

          {/* Dr. Marcie Avatar Section */}
          <AnimatePresence>
            {showAvatar && currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <div className="flex flex-col items-center space-y-6">
                  {/* Video/Avatar Container */}
                  <div className="relative">
                    {showVideo ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-64 h-64 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center border-4 border-white shadow-2xl"
                      >
                        <DrMarcieAvatar
                          state={{
                            expression: 'sassy',
                            gesture: 'pointing',
                            eyeContact: true,
                            isAnimating: true
                          }}
                          isSpeaking={isSpeaking}
                          currentResponse={currentResponse}
                          size="large"
                        />
                      </motion.div>
                    ) : (
                      <motion.button
                        onClick={handlePlayIntro}
                        className="w-64 h-64 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center border-4 border-white shadow-2xl hover:shadow-3xl transition-all duration-300 group"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-center">
                          <Play className="w-16 h-16 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-purple-800 font-semibold">Meet Dr. Marcie</p>
                        </div>
                      </motion.button>
                    )}
                  </div>
                  
                  {currentResponse && showVideo && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-md mx-auto"
                    >
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <p className="text-white text-lg mb-4">
                          {currentResponse.message}
                        </p>
                        <DrMarcieVoicePlayer
                          response={currentResponse}
                          autoPlay={false}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col items-center space-y-6"
          >
            {/* Step Indicators */}
            <div className="flex space-x-3">
              {welcomeSteps.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-gradient-to-r from-pink-400 to-purple-400'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {currentStep < welcomeSteps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  size="lg"
                  className="px-8 py-4"
                  disabled={isLoading}
                >
                  Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={onGetStarted}
                  size="xl"
                  className="px-12 py-4 text-xl"
                >
                  Start Your Journey
                  <Heart className="w-6 h-6 ml-3" />
                </Button>
              )}
              
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="text-white hover:bg-white/10"
                >
                  Back
                </Button>
              )}
            </div>

            {/* Skip Option */}
            {currentStep < welcomeSteps.length - 1 && (
              <button
                onClick={onGetStarted}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Skip intro
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}