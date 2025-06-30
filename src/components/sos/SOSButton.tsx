import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Phone, Shield } from 'lucide-react'
import { useSOSSystem } from '@/hooks/useSOSSystem'

interface SOSButtonProps {
  size?: 'small' | 'medium' | 'large'
  position?: 'fixed' | 'relative'
  className?: string
  onSOSActivated?: () => void
}

export default function SOSButton({
  size = 'medium',
  position = 'fixed',
  className = '',
  onSOSActivated
}: SOSButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null)
  
  const {
    canInitiate,
    initiationReason,
    initiateSOS,
    isLoading,
    checkSOSEligibility
  } = useSOSSystem()

  useEffect(() => {
    checkSOSEligibility()
  }, [checkSOSEligibility])

  const sizeClasses = {
    small: 'w-12 h-12 text-sm',
    medium: 'w-16 h-16 text-base',
    large: 'w-20 h-20 text-lg'
  }

  const positionClasses = position === 'fixed' 
    ? 'fixed bottom-6 right-6 z-50' 
    : 'relative'

  const handleMouseDown = () => {
    if (!canInitiate || isLoading) return

    setIsPressed(true)
    const timer = setTimeout(() => {
      setShowConfirmation(true)
      setIsPressed(false)
    }, 1000) // Hold for 1 second

    setPressTimer(timer)
  }

  const handleMouseUp = () => {
    setIsPressed(false)
    if (pressTimer) {
      clearTimeout(pressTimer)
      setPressTimer(null)
    }
  }

  const handleConfirmSOS = async () => {
    try {
      await initiateSOS()
      setShowConfirmation(false)
      onSOSActivated?.()
    } catch (error) {
      console.error('Failed to initiate SOS:', error)
      setShowConfirmation(false)
    }
  }

  const handleCancelSOS = () => {
    setShowConfirmation(false)
  }

  return (
    <>
      {/* Main SOS Button */}
      <motion.div
        className={`${positionClasses} ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          disabled={!canInitiate || isLoading}
          className={`
            ${sizeClasses[size]}
            bg-gradient-to-br from-red-500 to-red-600 
            hover:from-red-600 hover:to-red-700
            text-white font-bold rounded-full
            shadow-lg hover:shadow-xl
            border-4 border-white
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            relative overflow-hidden
            ${isPressed ? 'scale-95' : ''}
          `}
          title={canInitiate ? "Hold for 1 second to activate SOS Fight Solver" : initiationReason}
        >
          {/* Pulse animation */}
          <motion.div
            className="absolute inset-0 bg-red-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Progress ring when pressed */}
          {isPressed && (
            <motion.div
              className="absolute inset-1 border-2 border-white rounded-full"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "linear" }}
              style={{
                background: `conic-gradient(from 0deg, transparent 0deg, white ${isPressed ? '360deg' : '0deg'}, transparent 360deg)`
              }}
            />
          )}

          {/* Icon */}
          <div className="relative z-10 flex items-center justify-center">
            {isLoading ? (
              <motion.div
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>

          {/* SOS Text */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-red-600 whitespace-nowrap">
            SOS
          </div>
        </motion.button>

        {/* Hold instruction */}
        {!showConfirmation && canInitiate && (
          <motion.div
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isPressed ? 1 : 0, y: isPressed ? 0 : 10 }}
          >
            Hold to activate...
          </motion.div>
        )}

        {/* Rate limit message */}
        {!canInitiate && (
          <motion.div
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-800 text-xs px-3 py-2 rounded-lg max-w-48 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {initiationReason}
          </motion.div>
        )}
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Activate SOS Fight Solver?
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Dr. Marcie will guide you and your partner through a structured conflict resolution process. 
                  You'll be separated into private input booths to share your perspectives.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCancelSOS}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleConfirmSOS}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Phone className="w-4 h-4" />
                        <span>Start SOS</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}