import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Heart, Target, MessageSquare } from 'lucide-react'
import DrMarcieAvatar from '@/components/avatar/DrMarcieAvatar'
import DrMarcieVoicePlayer from '@/components/avatar/DrMarcieVoicePlayer'
import { sosService } from '@/services/sosService'
import { useDrMarcie } from '@/hooks/useDrMarcie'
import { useAuth } from '@/contexts/AuthContext'
import type { SOSAnalysis } from '@/types/sosSystem'
import type { ConversationContext } from '@/types/drMarcie'

interface SOSAnalysisResultsProps {
  sessionId: string
  className?: string
  onComplete?: () => void
}

export default function SOSAnalysisResults({
  sessionId,
  className = '',
  onComplete
}: SOSAnalysisResultsProps) {
  const { user } = useAuth()
  const [analysis, setAnalysis] = useState<SOSAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentSection, setCurrentSection] = useState<'overview' | 'fault' | 'actions' | 'healing'>('overview')
  const [personalizedFeedback, setPersonalizedFeedback] = useState<any>(null)

  const context: ConversationContext = {
    userId: user?.id || '',
    sessionType: 'fight-solver',
    currentMood: 'neutral',
    recentChallenges: [],
    previousResponses: []
  }

  const {
    currentResponse: drMarcieResponse,
    isSpeaking,
    generateResponse: generateDrMarcieResponse
  } = useDrMarcie(context)

  useEffect(() => {
    loadAnalysis()
  }, [sessionId])

  const loadAnalysis = async () => {
    try {
      setIsLoading(true)
      const result = await sosService.getSOSAnalysis(sessionId)
      
      if (result) {
        setAnalysis(result)
        
        // Get personalized feedback for current user
        const userFeedback = result.analysis.personalizedFeedback
        if (userFeedback && user) {
          // Determine if user is partner1 or partner2 based on session data
          const inputs = await sosService.getSOSInputs(sessionId)
          const userInput = inputs.find(input => input.userId === user.id)
          const isPartner1 = inputs[0]?.userId === user.id
          
          setPersonalizedFeedback(isPartner1 ? userFeedback.partner1 : userFeedback.partner2)
        }

        // Generate Dr. Marcie's results presentation
        await generateDrMarcieResponse(
          'Present the conflict analysis results with your signature direct but caring approach. Focus on solutions and growth.',
          { tone: 'direct', sassLevel: 3, context: 'fight-solver' }
        )
      }
    } catch (error) {
      console.error('Error loading analysis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFaultColor = (percentage: number) => {
    if (percentage >= 70) return 'text-red-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getFaultIcon = (percentage: number) => {
    if (percentage >= 70) return XCircle
    if (percentage >= 50) return AlertTriangle
    return CheckCircle
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Dr. Marcie is analyzing your conflict...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-300">Analysis not available</p>
      </div>
    )
  }

  const renderOverview = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Conflict Summary
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          {analysis.analysis.summary}
        </p>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Root Cause
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          {analysis.analysis.rootCause}
        </p>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Communication Breakdown
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          {analysis.analysis.communicationBreakdown}
        </p>
      </div>
    </motion.div>
  )

  const renderFaultAssignment = () => {
    const { partner1Fault, partner2Fault, explanation } = analysis.analysis.faultAssignment
    const Partner1Icon = getFaultIcon(partner1Fault)
    const Partner2Icon = getFaultIcon(partner2Fault)

    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Responsibility Breakdown
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
                partner1Fault >= 70 ? 'bg-red-100 dark:bg-red-900/30' :
                partner1Fault >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                'bg-green-100 dark:bg-green-900/30'
              }`}>
                <Partner1Icon className={`w-8 h-8 ${getFaultColor(partner1Fault)}`} />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Partner 1</h4>
              <div className={`text-3xl font-bold ${getFaultColor(partner1Fault)}`}>
                {partner1Fault}%
              </div>
            </div>

            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
                partner2Fault >= 70 ? 'bg-red-100 dark:bg-red-900/30' :
                partner2Fault >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                'bg-green-100 dark:bg-green-900/30'
              }`}>
                <Partner2Icon className={`w-8 h-8 ${getFaultColor(partner2Fault)}`} />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Partner 2</h4>
              <div className={`text-3xl font-bold ${getFaultColor(partner2Fault)}`}>
                {partner2Fault}%
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Dr. Marcie's Explanation
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {explanation}
            </p>
          </div>
        </div>

        {/* Apology Requirements */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Apology Requirements
          </h3>
          
          <div className="space-y-4">
            {analysis.analysis.apologyRequired.partner1ShouldApologize && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Partner 1 Should Apologize
                </h4>
                {analysis.analysis.apologyRequired.apologyScripts.partner1 && (
                  <p className="text-red-700 dark:text-red-300 italic">
                    "{analysis.analysis.apologyRequired.apologyScripts.partner1}"
                  </p>
                )}
              </div>
            )}

            {analysis.analysis.apologyRequired.partner2ShouldApologize && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Partner 2 Should Apologize
                </h4>
                {analysis.analysis.apologyRequired.apologyScripts.partner2 && (
                  <p className="text-red-700 dark:text-red-300 italic">
                    "{analysis.analysis.apologyRequired.apologyScripts.partner2}"
                  </p>
                )}
              </div>
            )}

            {!analysis.analysis.apologyRequired.partner1ShouldApologize && 
             !analysis.analysis.apologyRequired.partner2ShouldApologize && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-green-700 dark:text-green-300">
                  No formal apologies required. Focus on understanding and moving forward together.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  const renderActionPlan = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Partner 1 Actions
          </h3>
          <ul className="space-y-2">
            {analysis.analysis.recommendations.partner1Actions.map((action, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-600" />
            Partner 2 Actions
          </h3>
          <ul className="space-y-2">
            {analysis.analysis.recommendations.partner2Actions.map((action, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Heart className="w-5 h-5 mr-2 text-green-600" />
          Joint Actions (Do Together)
        </h3>
        <ul className="space-y-2">
          {analysis.analysis.recommendations.jointActions.map((action, index) => (
            <li key={index} className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Personalized Feedback */}
      {personalizedFeedback && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-pink-600" />
            Personal Message from Dr. Marcie
          </h3>
          <p className="text-gray-700 dark:text-gray-300 italic">
            "{personalizedFeedback.message}"
          </p>
          {personalizedFeedback.actionItems && personalizedFeedback.actionItems.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Your Specific Action Items:
              </h4>
              <ul className="space-y-1">
                {personalizedFeedback.actionItems.map((item: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-pink-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )

  const renderHealingPlan = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Healing Challenges
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Dr. Marcie has assigned these challenges to help you rebuild and strengthen your relationship:
        </p>
        <ul className="space-y-3">
          {analysis.analysis.healingChallenges.map((challenge, index) => (
            <li key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold">
                  {index + 1}
                </span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">{challenge}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Emotional Validation
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          {analysis.analysis.emotionalValidation}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Next Steps
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="text-gray-700 dark:text-gray-300">
              Complete assigned healing challenges together
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-gray-700 dark:text-gray-300">
              Schedule weekly check-ins to discuss progress
            </span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            <span className="text-gray-700 dark:text-gray-300">
              Return to Dr. Marcie if conflicts persist
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header with Dr. Marcie */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-6">
        <div className="flex items-center space-x-4">
          <DrMarcieAvatar
            state={{
              expression: 'stern',
              gesture: 'pointing',
              eyeContact: true,
              isAnimating: false
            }}
            isSpeaking={isSpeaking}
            size="large"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gradient mb-2">
              Dr. Marcie's Conflict Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Here's my no-nonsense assessment of your conflict and the path forward.
            </p>
          </div>
          {drMarcieResponse && (
            <DrMarcieVoicePlayer
              response={drMarcieResponse}
              autoPlay={true}
            />
          )}
        </div>
      </div>

      {/* Dr. Marcie's Current Response */}
      {drMarcieResponse && (
        <motion.div
          className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-lg p-6 mb-6 border border-pink-200 dark:border-pink-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-gray-900 dark:text-gray-100 text-lg">
            {drMarcieResponse.message}
          </p>
        </motion.div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: MessageSquare },
          { id: 'fault', label: 'Responsibility', icon: AlertTriangle },
          { id: 'actions', label: 'Action Plan', icon: Target },
          { id: 'healing', label: 'Healing', icon: Heart }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setCurrentSection(id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
              currentSection === id
                ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-96">
        <AnimatePresence mode="wait">
          {currentSection === 'overview' && renderOverview()}
          {currentSection === 'fault' && renderFaultAssignment()}
          {currentSection === 'actions' && renderActionPlan()}
          {currentSection === 'healing' && renderHealingPlan()}
        </AnimatePresence>
      </div>

      {/* Complete Button */}
      <div className="text-center mt-8">
        <button
          onClick={onComplete}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-colors"
        >
          Complete SOS Session
        </button>
      </div>
    </div>
  )
}