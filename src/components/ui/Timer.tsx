import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

interface TimerProps {
  duration: number // in seconds
  onComplete?: () => void
  autoStart?: boolean
  showProgress?: boolean
  variant?: 'default' | 'danger' | 'warning'
}

export default function Timer({
  duration,
  onComplete,
  autoStart = true,
  showProgress = true,
  variant = 'default'
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(autoStart)

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, timeLeft, onComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((duration - timeLeft) / duration) * 100
  const isWarning = timeLeft <= 30 && timeLeft > 10
  const isDanger = timeLeft <= 10

  const getVariantColor = () => {
    if (isDanger || variant === 'danger') return 'text-red-500'
    if (isWarning || variant === 'warning') return 'text-yellow-500'
    return 'text-purple-600'
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <Clock className={`w-6 h-6 ${getVariantColor()}`} />
        {showProgress && (
          <svg className="absolute inset-0 w-6 h-6 transform -rotate-90">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gray-200"
            />
            <motion.circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 10}`}
              strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress / 100)}`}
              className={getVariantColor()}
              initial={{ strokeDashoffset: 2 * Math.PI * 10 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 10 * (1 - progress / 100) }}
              transition={{ duration: 0.5 }}
            />
          </svg>
        )}
      </div>
      
      <motion.span
        className={`text-lg font-mono font-bold ${getVariantColor()}`}
        animate={isDanger ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: isDanger ? Infinity : 0 }}
      >
        {formatTime(timeLeft)}
      </motion.span>
      
      {!autoStart && (
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
      )}
    </div>
  )
}