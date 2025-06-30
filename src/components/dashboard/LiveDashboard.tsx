import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  Flame, 
  Trophy, 
  Target, 
  TrendingUp, 
  Users,
  AlertTriangle,
  Star,
  Calendar,
  MessageSquare,
  Play,
  Zap
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Progress from '@/components/ui/Progress'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import DrMarcieAvatar from '@/components/avatar/DrMarcieAvatar'
import DrMarcieVoicePlayer from '@/components/avatar/DrMarcieVoicePlayer'
import { useAuth } from '@/contexts/AuthContext'
import { useCouple } from '@/hooks/useCouple'
import { useDrMarcie } from '@/hooks/useDrMarcie'
import type { ConversationContext } from '@/types/drMarcie'

export default function LiveDashboard() {
  const { user } = useAuth()
  const { couple, isLoading: coupleLoading } = useCouple()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    scores: {
      partner1: { totalPoints: 0, vulnerabilityPoints: 0, trustThermometer: 50, currentStreak: 0 },
      partner2: { totalPoints: 0, vulnerabilityPoints: 0, trustThermometer: 50, currentStreak: 0 },
      combined: { totalPoints: 0, relationshipHealth: 75, challengesCompleted: 0 }
    },
    activeGames: [],
    recentActivity: [],
    notifications: []
  })

  const context: ConversationContext = {
    userId: user?.id || '',
    coupleId: couple?.id,
    sessionType: 'check-in',
    currentMood: 'neutral',
    recentChallenges: [],
    previousResponses: []
  }

  const {
    generateResponse,
    currentResponse,
    isSpeaking,
    playVoice
  } = useDrMarcie(context, { autoPlay: false })

  useEffect(() => {
    if (couple?.id) {
      loadDashboard()
    }
  }, [couple?.id])

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      
      // Simulate loading dashboard data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data for demonstration
      setDashboardData({
        scores: {
          partner1: { 
            totalPoints: 450, 
            vulnerabilityPoints: 120, 
            trustThermometer: 78, 
            currentStreak: 5 
          },
          partner2: { 
            totalPoints: 380, 
            vulnerabilityPoints: 95, 
            trustThermometer: 72, 
            currentStreak: 5 
          },
          combined: { 
            totalPoints: 830, 
            relationshipHealth: 85, 
            challengesCompleted: 12 
          }
        },
        activeGames: [
          { id: '1', title: 'Truth or Trust', status: 'in-progress' },
          { id: '2', title: 'Love Language Lab', status: 'waiting-partner' }
        ],
        recentActivity: [
          { id: '1', type: 'challenge_completed', message: 'Completed Daily Check-In', time: '2 hours ago' },
          { id: '2', type: 'game_started', message: 'Started Truth or Trust game', time: '1 day ago' }
        ],
        notifications: [
          { id: '1', title: 'Daily Challenge Ready!', message: 'Your new challenge is waiting', priority: 'medium' },
          { id: '2', title: 'Partner completed a game', message: 'Check out their progress!', priority: 'low' }
        ]
      })

      // Generate Dr. Marcie's daily check-in
      await generateDailyCheckIn()
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateDailyCheckIn = async () => {
    const prompt = `Give a daily check-in for this couple based on their progress:
    - Combined score: ${dashboardData.scores.combined.totalPoints}
    - Relationship health: ${dashboardData.scores.combined.relationshipHealth}%
    - Current streak: ${dashboardData.scores.partner1.currentStreak} days
    - Challenges completed: ${dashboardData.scores.combined.challengesCompleted}
    
    Be encouraging but honest. Point out areas for improvement with your signature wit.`

    await generateResponse(prompt, {
      tone: 'supportive',
      sassLevel: 2,
      context: 'general'
    })
  }

  if (coupleLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading your relationship dashboard...</p>
        </div>
      </div>
    )
  }

  if (!couple) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Users className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Link Your Partner</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You need to link with your partner to access the dashboard.
          </p>
          <Button onClick={() => window.location.href = '/profile'}>
            Go to Profile
          </Button>
        </Card>
      </div>
    )
  }

  const isPartner1 = user?.id === couple?.partner1Id
  const userScores = isPartner1 ? dashboardData.scores.partner1 : dashboardData.scores.partner2
  const partnerScores = isPartner1 ? dashboardData.scores.partner2 : dashboardData.scores.partner1

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header with Dr. Marcie */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <DrMarcieAvatar
                state={{
                  expression: 'happy',
                  gesture: 'none',
                  eyeContact: true,
                  isAnimating: false
                }}
                isSpeaking={isSpeaking}
                currentResponse={currentResponse}
                size="medium"
              />
              <div>
                <h1 className="text-2xl font-bold">Good morning, lovebirds! 💕</h1>
                <p className="text-pink-100">
                  Ready to work on your relationship today?
                </p>
              </div>
            </div>
            
            {currentResponse && (
              <DrMarcieVoicePlayer
                response={currentResponse}
                autoPlay={false}
                onSpeakingStart={() => {}}
                onSpeakingEnd={() => {}}
              />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Dr. Marcie's Daily Message */}
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
                  <h3 className="font-semibold text-purple-800 mb-2">
                    Dr. Marcie's Daily Check-In
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {currentResponse.message}
                  </p>
                  <button
                    onClick={() => playVoice()}
                    className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <Play className="w-4 h-4" />
                    <span>Hear Dr. Marcie's voice</span>
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Your Score */}
          <Card hover className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Your Progress</h3>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Points</span>
                  <span className="font-bold text-purple-600">{userScores.totalPoints}</span>
                </div>
                <Progress 
                  value={userScores.totalPoints} 
                  max={1000} 
                  variant="gradient" 
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Vulnerability</span>
                  <span className="font-bold text-pink-600">{userScores.vulnerabilityPoints}</span>
                </div>
                <Progress 
                  value={userScores.vulnerabilityPoints} 
                  max={500} 
                  variant="vulnerability" 
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Trust Level</span>
                  <span className="font-bold text-blue-600">{Math.round(userScores.trustThermometer)}%</span>
                </div>
                <Progress 
                  value={userScores.trustThermometer} 
                  variant="trust" 
                />
              </div>
            </div>
          </Card>

          {/* Partner Score */}
          <Card hover className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Partner's Progress</h3>
              <Users className="w-6 h-6 text-purple-500" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Points</span>
                  <span className="font-bold text-purple-600">{partnerScores.totalPoints}</span>
                </div>
                <Progress 
                  value={partnerScores.totalPoints} 
                  max={1000} 
                  variant="gradient" 
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Vulnerability</span>
                  <span className="font-bold text-pink-600">{partnerScores.vulnerabilityPoints}</span>
                </div>
                <Progress 
                  value={partnerScores.vulnerabilityPoints} 
                  max={500} 
                  variant="vulnerability" 
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Trust Level</span>
                  <span className="font-bold text-blue-600">{Math.round(partnerScores.trustThermometer)}%</span>
                </div>
                <Progress 
                  value={partnerScores.trustThermometer} 
                  variant="trust" 
                />
              </div>
            </div>
          </Card>

          {/* Combined Stats */}
          <Card hover className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Relationship Health</h3>
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient mb-2">
                  {Math.round(dashboardData.scores.combined.relationshipHealth)}%
                </div>
                <Progress 
                  value={dashboardData.scores.combined.relationshipHealth} 
                  variant="gradient" 
                  className="mb-4"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-500 flex items-center justify-center">
                    <Flame className="w-5 h-5 mr-1" />
                    {userScores.currentStreak}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Day Streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500 flex items-center justify-center">
                    <Trophy className="w-5 h-5 mr-1" />
                    {dashboardData.scores.combined.challengesCompleted}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Completed</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Button className="h-20 flex-col space-y-2" variant="secondary">
            <Calendar className="w-6 h-6" />
            <span>Today's Challenge</span>
          </Button>
          
          <Button className="h-20 flex-col space-y-2" variant="secondary">
            <Target className="w-6 h-6" />
            <span>Play Games</span>
          </Button>
          
          <Button className="h-20 flex-col space-y-2" variant="secondary">
            <MessageSquare className="w-6 h-6" />
            <span>Chat with Dr. Marcie</span>
          </Button>
          
          <Button className="h-20 flex-col space-y-2" variant="secondary">
            <Zap className="w-6 h-6" />
            <span>View Progress</span>
          </Button>
        </div>

        {/* Active Games & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Games */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Active Games</h3>
              <Target className="w-6 h-6 text-purple-500" />
            </div>
            
            {dashboardData.activeGames.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.activeGames.map((game) => (
                  <motion.div
                    key={game.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg border border-pink-200 dark:border-pink-700 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {game.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Status: {game.status.replace('-', ' ')}
                        </p>
                      </div>
                      <Badge variant="primary">
                        Continue
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  No active games right now
                </p>
                <Button>Start a Game</Button>
              </div>
            )}
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            
            {dashboardData.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentActivity.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-300">
                  No recent activity
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}