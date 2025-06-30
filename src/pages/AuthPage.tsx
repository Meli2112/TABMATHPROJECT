import React from 'react'
import AuthScreen from '@/components/auth/AuthScreen'

export default function AuthPage() {
  return (
    <AuthScreen 
      onSuccess={() => window.location.href = '/dashboard'} 
    />
  )
}