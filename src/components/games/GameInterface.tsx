import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  SkipForward, 
  Heart, 
  Star, 
  Clock,
  Users,
  Trophy,
  Target,
  MessageSquare,
  ArrowLeft
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Progress from '@/components/ui/Progress'
import Badge from '@/components/ui/Badge'
import Timer from '@/components/ui/Timer'
import DrMarcieAvatar from '@/components/avatar/DrMarcieAvatar'
import DrMarcieVoicePlayer from '@/components/avatar/DrMarcieVoicePlayer'
import { useDrMarcie } from '@/hooks/useDrMarcie'
import { useAuth } from '@/contexts/AuthContext'
import { useCouple } from '@/hooks/useCouple'
import type { ConversationContext } from '@/types/drMarcie'

interface Game {
  id: string
  title: string
  description: string
  category: string
  difficultyLevel: number
  estimatedDuration: number
  pointsReward: number
  isPremium: boolean
}

interface GameInterfaceProps {
  game: Game
  onComplete?: () => void
  onExit?: () => void
}

export default function GameInterface({ game, onComplete, onExit }: GameInterfaceProps) {
  const { user } = useAuth()
  const { couple } = useCouple()
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [userResponse, setUserResponse] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'completed'>('intro')
  const [scores, setScores] = useState({ user: 0, partner: 0, combined: 0 })

  const mockPrompts = [
    {
      id: '1',
      content: "What's one thing about your partner that surprised you when you first started dating?",
      type: 'text',
      timeLimit: 120
    },
    {
      id: '2', 
      content: "Rate how well you think you know your partner's dreams and goals (1-5)",
      type: 'rating',
      timeLimit: 60
    },
    {
      id: '3',
      content: "Share a moment when your partner made you feel truly understood",
      type: 'text',
      timeLimit: 180
    }
  ]

  const context: ConversationContext = {
    userId: user?.id || '',
    coupleId: couple?.id,
    sessionType: 'challenge',
    currentMood: 'neutral',
    recentChallenges: [game.title],
    previousResponses: []
  }

  const {
    generateResponse,
    currentResponse,
    isSpeaking,
    playVoice
  } = useDrMarcie(context, { autoPlay: true })

  useEffect(() => {
    if (gameState === 'intro') {
      generateGameIntro()
    }
  }, [gameState])

  const generateGameIntro = async () => {
    const prompt = `Introduce the "${game.title}" game: ${game.description}. Get them excited but set clear expectations. Use your signature style.`
    
    await generateResponse(prompt, {
      tone: 'playful',
      sassLevel: 2,
      context: 'challenge'
    })
  }

  const handleStartGame = () => {
    setGameState('playing')
  }

  const handleSubmitResponse = async () => {
    if (!userResponse.trim()) return

    setIsLoading(true)
    
    try {
      // Simulate response processing
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate Dr. Marcie's feedback
      const feedbackPrompt = `Provide feedback on the user's response: "${userResponse}". Be encouraging but honest.`
      
      await generateResponse(feedbackPrompt, {
        tone: 'supportive',
        sassLevel: 2,
        context: 'challenge'
      })
      
      // Update scores
      const points = Math.floor(Math.random() * 30) + 20
      setScores(prev => ({
        ...prev,
        user: prev.user + points,
        combined: prev.combined + points
      }))
      
      setUserResponse('')
      
      // Move to next prompt or complete
      if (currentPromptIndex >= mockPrompts.length - 1) {
        setGameState('completed')
      } else {
        setCurrentPromptIndex(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error submitting response:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentPrompt = mockPrompts[currentPromptIndex]

  const renderPromptInput = () => {
    if (!currentPrompt) return null

    switch (currentPrompt.type) {
      case 'text':
        return (
          <textarea
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            disabled={isLoading}
          />
        )
      
      case 'rating':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Strongly Disagree</span>
              <span>Strongly Agree</span>
            </div>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setUserResponse(rating.toString())}
                  className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                    userResponse === rating.toString()
                      ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-pink-300 dark:hover:border-pink-400'
                  }`}
                  disabled={isLoading}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h1 className="text-3xl font-bold text-gradient">{game.title}</h1>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
            
            <DrMarcieAvatar
              state={{
                expression: 'encouraging',
                gesture: 'clapping',
                eyeContact: true,
                isAnimating: true
              }}
              isSpeaking={isSpeaking}
              currentResponse={currentResponse}
              size="large"
            />
            
            <div className="space-y-4">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {game.description}
              </p>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{game.estimatedDuration} min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4" />
                  <span>{game.pointsReward} points</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Level {game.difficultyLevel}</span>
                </div>
              </div>
              
              {game.isPremium && (
                <Badge variant="primary" className="mx-auto">
                  Premium Game
                </Badge>
              )}
            </div>
            
            {currentResponse && (
              <Card variant="gradient" className="p-4">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-purple-600 mt-1" />
                  <div className="flex-1 text-left">
                    <p className="text-gray-700 dark:text-gray-300">
                      {currentResponse.message}
                    </p>
                    {currentResponse && (
                      <DrMarcieVoicePlayer
                        response={currentResponse}
                        autoPlay={true}
                      />
                    )}
                  </div>
                </div>
              </Card>
            )}
            
            <div className="flex space-x-4">
              <Button
                variant="secondary"
                onClick={onExit}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Library
              </Button>
              <Button
                onClick={handleStartGame}
                className="flex-1"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>
            </div>
          </motion.div>
        </Card>
      </div>
    )
  }

  if (gameState === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Trophy className="w-12 h-12 text-yellow-500" />
              <h1 className="text-3xl font-bold text-gradient">Game Complete!</h1>
              <Trophy className="w-12 h-12 text-yellow-500" />
            </div>
            
            <DrMarcieAvatar
              state={{
                expression: 'happy',
                gesture: 'clapping',
                eyeContact: true,
                isAnimating: true
              }}
              isSpeaking={isSpeaking}
              size="large"
            />
            
            <div className="grid grid-cols-2 gap-6">
              <Card variant="gradient" className="p-4">
                <h3 className="font-semibold text-purple-800 mb-2">Your Score</h3>
                <div className="text-2xl font-bold text-purple-600">
                  {scores.user}
                </div>
              </Card>
              <Card variant="gradient" className="p-4">
                <h3 className="font-semibold text-purple-800 mb-2">Total Points</h3>
                <div className="text-2xl font-bold text-purple-600">
                  {scores.combined}
                </div>
              </Card>
            </div>
            
            {currentResponse && (
              <Card variant="gradient" className="p-4">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-purple-600 mt-1" />
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-purple-800 mb-2">
                      Dr. Marcie's Final Thoughts
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {currentResponse.message}
                    </p>
                  </div>
                </div>
              </Card>
            )}
            
            <div className="flex space-x-4">
              <Button
                variant="secondary"
                onClick={onExit}
                className="flex-1"
              >
                Back to Library
              </Button>
              <Button
                onClick={onComplete}
                className="flex-1"
              >
                Continue Journey
              </Button>
            </div>
          </motion.div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Game Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <DrMarcieAvatar
                state={{
                  expression: 'encouraging',
                  gesture: 'none',
                  eyeContact: true,
                  isAnimating: false
                }}
                isSpeaking={isSpeaking}
                currentResponse={currentResponse}
                size="medium"
              />
              <div>
                <h1 className="text-2xl font-bold">{game.title}</h1>
                <p className="text-pink-100">
                  Question {currentPromptIndex + 1} of {mockPrompts.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentPrompt?.timeLimit && (
                <Timer
                  duration={currentPrompt.timeLimit}
                  onComplete={() => handleSubmitResponse()}
                  variant="warning"
                />
              )}
              
              <Button
                variant="ghost"
                onClick={onExit}
                className="text-white hover:bg-white/10"
              >
                Exit Game
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress
              value={((currentPromptIndex + 1) / mockPrompts.length) * 100}
              className="bg-white/20"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Dr. Marcie's Current Message */}
        {currentResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card variant="gradient" className="p-6">
              <div className="flex items-start space-x-4">
                <MessageSquare className="w-6 h-6 text-purple-600 mt-1" />
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {currentResponse.message}
                  </p>
                  <DrMarcieVoicePlayer
                    response={currentResponse}
                    autoPlay={false}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Current Prompt */}
        {currentPrompt && (
          <Card className="p-6 mb-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {currentPrompt.content}
                </h2>
              </div>
              
              {renderPromptInput()}
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {currentPromptIndex > 0 && (
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentPromptIndex(prev => prev - 1)}
                    >
                      Previous
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={handleSubmitResponse}
                    disabled={!userResponse || isLoading}
                    isLoading={isLoading}
                  >
                    {currentPromptIndex >= mockPrompts.length - 1 
                      ? 'Complete Game' 
                      : 'Submit Answer'
                    }
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Live Scoreboard */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
            Live Scoreboard
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {scores.user}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Your Score</div>
              <Progress 
                value={scores.user} 
                max={game.pointsReward} 
                variant="gradient" 
                className="mt-2"
              />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600 mb-1">
                {scores.combined}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Combined</div>
              <Progress 
                value={scores.combined} 
                max={game.pointsReward * 2} 
                variant="gradient" 
                className="mt-2"
              />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {scores.partner}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Partner's Score</div>
              <Progress 
                value={scores.partner} 
                max={game.pointsReward} 
                variant="gradient" 
                className="mt-2"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}