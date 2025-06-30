import React, { useState } from 'react'
import WelcomeScreen from '@/components/welcome/WelcomeScreen'
import AuthScreen from '@/components/auth/AuthScreen'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const [showAuth, setShowAuth] = useState(false)
  const { user } = useAuth()

  // If user is already authenticated, redirect to dashboard
  if (user) {
    window.location.href = '/dashboard'
    return null
  }

  if (showAuth) {
    return (
      <AuthScreen 
        onSuccess={() => window.location.href = '/dashboard'} 
      />
    )
  }

  return (
    <WelcomeScreen 
      onGetStarted={() => setShowAuth(true)} 
    />
  )
}