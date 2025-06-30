import React from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './Header'
import Navigation from './Navigation'
import SOSFloatingButton from './SOSFloatingButton'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()

  const handleSOSActivate = () => {
    navigate('/sos')
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="pb-16 md:pb-0">
          {children}
        </main>
        <Navigation />
        <SOSFloatingButton onActivate={handleSOSActivate} />
      </div>
    </ErrorBoundary>
  )
}