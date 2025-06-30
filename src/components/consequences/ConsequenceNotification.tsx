import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  Smartphone, 
  Bell, 
  Target, 
  X, 
  Check,
  Clock,
  Shield
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import DrMarcieAvatar from '@/components/avatar/DrMarcieAvatar'
import DrMarcieVoicePlayer from '@/components/avatar/DrMarcieVoicePlayer'
import { consequenceEngine } from '@/services/consequenceEngine'
import { useDrMarcie } from '@/hooks/useDrMarcie'
import type { ActiveConsequence } from '@/types/consequences'
import type { ConversationContext } from '@/types/drMarcie'

interface ConsequenceNotificationProps {
  consequence: ActiveConsequence
  onConsent?: (consent: boolean) => void
  onDismiss?: () => void
  className?: string
}

export default function ConsequenceNotification({
  consequence,
  onConsent,
  onDismiss,
  className = ''
}: ConsequenceNotificationProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const context: ConversationContext = {
    userId: consequence.userId,
    sessionType: 'consequence',
    currentMood: 'frustrated',
    recentChallenges: [],
    previousResponses: []
  }

  const {
    currentResponse,
    isSpeaking,
    generateResponse
  } = useDrMarcie(context, { autoPlay: false })

  useEffect(() => {
    // Generate Dr. Marcie's consequence explanation
    generateConsequenceExplanation()
  }, [])

  const generateConsequenceExplanation = async () => {
    const prompt = `Explain this consequence to the user:
    Triggered by: ${consequence.triggeredBy}
    Type: ${consequence.ruleId}
    
    Be firm but fair. Explain why this consequence helps their relationship growth. Use your signature style.`

    await generateResponse(prompt, {
      tone: 'direct',
      sassLevel: 3,
      context: 'consequence'
    })
  }

  const handleConsent = async (consent: boolean) => {
    setIsProcessing(true)
    try {
      await consequenceEngine.giveConsent(consequence.id, consent)
      onConsent?.(consent)
    } catch (error) {
      console.error('Error processing consent:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getConsequenceIcon = () => {
    switch (consequence.ruleId) {
      case 'screensaver':
        return <Smartphone className="w-6 h-6" />
      case 'app_block':
        return <Shield className="w-6 h-6" />
      case 'notification_spam':
        return <Bell className="w-6 h-6" />
      case 'challenge_assignment':
        return <Target className="w-6 h-6" />
      default:
        return <AlertTriangle className="w-6 h-6" />
    }
  }

  const getConsequenceTitle = () => {
    switch (consequence.ruleId) {
      case 'screensaver':
        return 'Screensaver Makeover'
      case 'app_block':
        return 'App Timeout'
      case 'notification_spam':
        return 'Motivation Reminders'
      case 'challenge_assignment':
        return 'Makeup Challenge'
      default:
        return 'Consequence Activated'
    }
  }

  const getConsequenceDescription = () => {
    switch (consequence.ruleId) {
      case 'screensaver':
        return 'Dr. Marcie will update your phone wallpaper with a motivational message until you complete your missed task.'
      case 'app_block':
        return 'Distracting apps will be temporarily blocked to help you focus on your relationship.'
      case 'notification_spam':
        return 'You\'ll receive gentle (but persistent) reminders to get back on track with your relationship goals.'
      case 'challenge_assignment':
        return 'A makeup challenge has been assigned to help you catch up on your relationship work.'
      default:
        return 'A consequence has been triggered to help you stay accountable to your relationship goals.'
    }
  }

  const getSeverityColor = () => {
    // This would be based on consequence.severity if available
    return 'from-yellow-500 to-orange-500'
  }

  if (consequence.status === 'cancelled') {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className={`fixed inset-x-4 top-4 z-50 max-w-md mx-auto ${className}`}
      >
        <Card className="overflow-hidden border-l-4 border-orange-500 shadow-2xl">
          {/* Header */}
          <div className={`bg-gradient-to-r ${getSeverityColor()} text-white p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getConsequenceIcon()}
                <div>
                  <h3 className="font-bold text-lg">{getConsequenceTitle()}</h3>
                  <p className="text-sm opacity-90">Dr. Marcie's Intervention</p>
                </div>
              </div>
              
              {!consequence.requiresConsent && (
                <button
                  onClick={onDismiss}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Dr. Marcie Avatar */}
            <div className="flex items-center space-x-4 mb-4">
              <DrMarcieAvatar
                state={{
                  expression: 'stern',
                  gesture: 'pointing',
                  eyeContact: true,
                  isAnimating: true
                }}
                isSpeaking={isSpeaking}
                currentResponse={currentResponse}
                size="medium"
              />
              
              <div className="flex-1">
                <Badge variant="warning" size="sm" className="mb-2">
                  Consequence Triggered
                </Badge>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Triggered by: {consequence.triggeredBy.replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* Dr. Marcie's Message */}
            {currentResponse && (
              <Card variant="gradient" className="p-4 mb-4">
                <div className="flex items-start space-x-3">
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
            )}

            {/* Consequence Description */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                What happens next:
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {getConsequenceDescription()}
              </p>
            </div>

            {/* Details Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium mb-4"
            >
              {showDetails ? 'Hide details' : 'Show details'}
            </button>

            {/* Detailed Information */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Status:</span>
                      <Badge variant={consequence.status === 'active' ? 'success' : 'warning'}>
                        {consequence.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Assigned:</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {new Date(consequence.assignedAt).toLocaleString()}
                      </span>
                    </div>
                    
                    {consequence.metadata.duration && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Duration:</span>
                        <span className="text-gray-900 dark:text-gray-100 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {consequence.metadata.duration} minutes
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Consent Required */}
            {consequence.requiresConsent && consequence.status === 'pending_consent' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                        Your Consent Required
                      </h4>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        This consequence requires your permission before it can be activated. 
                        You can decline, but Dr. Marcie might have something to say about that...
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => handleConsent(false)}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                  
                  <Button
                    onClick={() => handleConsent(true)}
                    disabled={isProcessing}
                    isLoading={isProcessing}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                </div>
              </div>
            )}

            {/* Active Consequence Info */}
            {consequence.status === 'active' && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">
                      Consequence Active
                    </h4>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      Complete your missed task to remove this consequence.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}