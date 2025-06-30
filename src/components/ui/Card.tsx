import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'gradient' | 'glass'
  hover?: boolean
}

export default function Card({ 
  children, 
  className, 
  variant = 'default',
  hover = false 
}: CardProps) {
  const variants = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    gradient: 'bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-700',
    glass: 'backdrop-blur-sm bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/20'
  }

  const Component = hover ? motion.div : 'div'
  const motionProps = hover ? {
    whileHover: { scale: 1.02, y: -2 },
    transition: { duration: 0.2 }
  } : {}

  return (
    <Component
      className={clsx(
        'rounded-xl shadow-lg',
        variants[variant],
        className
      )}
      {...motionProps}
    >
      {children}
    </Component>
  )
}