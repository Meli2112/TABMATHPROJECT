import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AvatarState, DrMarcieResponse } from '@/types/drMarcie'

interface DrMarcieAvatarProps {
  state: AvatarState
  isListening?: boolean
  isSpeaking?: boolean
  currentResponse?: DrMarcieResponse
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export default function DrMarcieAvatar({
  state,
  isListening = false,
  isSpeaking = false,
  currentResponse,
  size = 'medium',
  className = ''
}: DrMarcieAvatarProps) {
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle')
  const [eyeBlinkTimer, setEyeBlinkTimer] = useState<NodeJS.Timeout | null>(null)
  const [shouldBlink, setShouldBlink] = useState(false)

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  }

  // Handle automatic eye blinking
  useEffect(() => {
    const startBlinking = () => {
      const timer = setInterval(() => {
        setShouldBlink(true)
        setTimeout(() => setShouldBlink(false), 150)
      }, 2000 + Math.random() * 3000) // Random blink every 2-5 seconds
      
      setEyeBlinkTimer(timer)
    }

    startBlinking()
    return () => {
      if (eyeBlinkTimer) clearInterval(eyeBlinkTimer)
    }
  }, [])

  // Update animation based on state
  useEffect(() => {
    if (isSpeaking) {
      setCurrentAnimation('speaking')
    } else if (isListening) {
      setCurrentAnimation('listening')
    } else if (state.gesture !== 'none') {
      setCurrentAnimation(state.gesture)
    } else {
      setCurrentAnimation('idle')
    }
  }, [state, isSpeaking, isListening])

  const getExpressionStyles = () => {
    switch (state.expression) {
      case 'happy':
        return {
          mouth: 'smile',
          eyebrows: 'raised',
          cheeks: 'rosy'
        }
      case 'sassy':
        return {
          mouth: 'smirk',
          eyebrows: 'raised-one',
          cheeks: 'normal'
        }
      case 'concerned':
        return {
          mouth: 'frown-slight',
          eyebrows: 'furrowed',
          cheeks: 'normal'
        }
      case 'encouraging':
        return {
          mouth: 'smile-warm',
          eyebrows: 'gentle',
          cheeks: 'rosy'
        }
      case 'stern':
        return {
          mouth: 'straight',
          eyebrows: 'furrowed-serious',
          cheeks: 'normal'
        }
      default:
        return {
          mouth: 'neutral',
          eyebrows: 'normal',
          cheeks: 'normal'
        }
    }
  }

  const expression = getExpressionStyles()

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Main Avatar Container */}
      <motion.div
        className="relative w-full h-full"
        animate={{
          scale: isSpeaking ? [1, 1.05, 1] : 1,
          rotate: currentAnimation === 'thinking' ? [0, -2, 2, 0] : 0
        }}
        transition={{
          scale: { duration: 0.6, repeat: isSpeaking ? Infinity : 0 },
          rotate: { duration: 2, repeat: currentAnimation === 'thinking' ? Infinity : 0 }
        }}
      >
        {/* Background Glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 opacity-20 blur-lg"
          animate={{
            scale: isSpeaking ? [1, 1.2, 1] : 1,
            opacity: isSpeaking ? [0.2, 0.4, 0.2] : 0.2
          }}
          transition={{ duration: 0.8, repeat: isSpeaking ? Infinity : 0 }}
        />

        {/* Face Base */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-pink-200 to-purple-200 border-4 border-gradient-to-r from-pink-400 to-purple-500 overflow-hidden">
          
          {/* Hair */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-3/4 h-1/2 bg-gradient-to-b from-purple-600 to-pink-500 rounded-t-full" />
          
          {/* Eyes */}
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {/* Left Eye */}
            <motion.div
              className="relative"
              animate={{
                scaleY: shouldBlink ? 0.1 : 1,
                y: expression.eyebrows === 'raised' ? -1 : expression.eyebrows === 'furrowed' ? 1 : 0
              }}
              transition={{ duration: shouldBlink ? 0.1 : 0.2 }}
            >
              <div className="w-3 h-3 bg-white rounded-full">
                <motion.div
                  className="w-2 h-2 bg-purple-800 rounded-full mt-0.5 ml-0.5"
                  animate={{
                    x: state.eyeContact ? 0 : Math.sin(Date.now() / 1000) * 0.5,
                    y: state.eyeContact ? 0 : Math.cos(Date.now() / 1000) * 0.5
                  }}
                />
              </div>
            </motion.div>

            {/* Right Eye */}
            <motion.div
              className="relative"
              animate={{
                scaleY: shouldBlink ? 0.1 : 1,
                y: expression.eyebrows === 'raised' ? -1 : expression.eyebrows === 'furrowed' ? 1 : 0
              }}
              transition={{ duration: shouldBlink ? 0.1 : 0.2 }}
            >
              <div className="w-3 h-3 bg-white rounded-full">
                <motion.div
                  className="w-2 h-2 bg-purple-800 rounded-full mt-0.5 ml-0.5"
                  animate={{
                    x: state.eyeContact ? 0 : Math.sin(Date.now() / 1000) * 0.5,
                    y: state.eyeContact ? 0 : Math.cos(Date.now() / 1000) * 0.5
                  }}
                />
              </div>
            </motion.div>
          </div>

          {/* Eyebrows */}
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <motion.div
              className="w-4 h-1 bg-purple-700 rounded"
              animate={{
                rotate: expression.eyebrows === 'raised-one' ? -15 : expression.eyebrows === 'furrowed' ? 10 : 0,
                y: expression.eyebrows === 'raised' ? -1 : 0
              }}
            />
            <motion.div
              className="w-4 h-1 bg-purple-700 rounded"
              animate={{
                rotate: expression.eyebrows === 'raised-one' ? 0 : expression.eyebrows === 'furrowed' ? -10 : 0,
                y: expression.eyebrows === 'raised' ? -1 : 0
              }}
            />
          </div>

          {/* Nose */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1 w-1 h-2 bg-pink-300 rounded" />

          {/* Mouth */}
          <motion.div
            className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2"
            animate={{
              scaleX: isSpeaking ? [1, 1.2, 0.8, 1] : 1,
              scaleY: isSpeaking ? [1, 0.8, 1.2, 1] : 1
            }}
            transition={{ duration: 0.3, repeat: isSpeaking ? Infinity : 0 }}
          >
            {expression.mouth === 'smile' && (
              <div className="w-6 h-3 border-b-2 border-pink-600 rounded-b-full" />
            )}
            {expression.mouth === 'smirk' && (
              <div className="w-4 h-2 border-b-2 border-pink-600 rounded-br-full transform rotate-12" />
            )}
            {expression.mouth === 'frown-slight' && (
              <div className="w-4 h-2 border-t-2 border-pink-600 rounded-t-full" />
            )}
            {expression.mouth === 'neutral' && (
              <div className="w-4 h-0.5 bg-pink-600 rounded" />
            )}
            {expression.mouth === 'smile-warm' && (
              <div className="w-8 h-4 border-b-2 border-pink-500 rounded-b-full" />
            )}
            {expression.mouth === 'straight' && (
              <div className="w-5 h-0.5 bg-pink-700 rounded" />
            )}
          </motion.div>

          {/* Cheeks */}
          {expression.cheeks === 'rosy' && (
            <>
              <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-pink-400 rounded-full opacity-50" />
              <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-pink-400 rounded-full opacity-50" />
            </>
          )}
        </div>

        {/* Gesture Animations */}
        <AnimatePresence>
          {currentAnimation === 'pointing' && (
            <motion.div
              className="absolute -right-8 top-1/2 transform -translate-y-1/2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="w-6 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transform rotate-12" />
            </motion.div>
          )}

          {currentAnimation === 'clapping' && (
            <motion.div
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <div className="flex space-x-1">
                <div className="w-3 h-4 bg-gradient-to-b from-pink-400 to-purple-500 rounded" />
                <div className="w-3 h-4 bg-gradient-to-b from-pink-400 to-purple-500 rounded" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Speaking Indicator */}
        {isSpeaking && (
          <motion.div
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
        )}

        {/* Listening Indicator */}
        {isListening && (
          <motion.div
            className="absolute -top-6 left-1/2 transform -translate-x-1/2"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="w-4 h-4 border-2 border-purple-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Personality Aura */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-gradient-to-r from-pink-400 to-purple-600 opacity-30"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </div>
  )
}