import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface ProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'gradient' | 'trust' | 'vulnerability'
  showLabel?: boolean
  label?: string
  className?: string
}

export default function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }
  
  const variants = {
    default: 'from-gray-300 to-gray-400',
    gradient: 'from-pink-500 to-purple-600',
    trust: 'from-blue-400 to-blue-600',
    vulnerability: 'from-pink-400 to-red-500'
  }

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={clsx(
        'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
        sizes[size]
      )}>
        <motion.div
          className={clsx(
            'h-full bg-gradient-to-r rounded-full',
            variants[variant]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}