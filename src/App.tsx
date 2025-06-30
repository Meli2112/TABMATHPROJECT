import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SocketProvider } from '@/contexts/SocketContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import HomePage from '@/pages/HomePage'
import AuthPage from '@/pages/AuthPage'
import DashboardPage from '@/pages/DashboardPage'
import ProfilePage from '@/pages/ProfilePage'
import CouplesPage from '@/pages/CouplesPage'
import ChallengesPage from '@/pages/ChallengesPage'
import ScoreboardPage from '@/pages/ScoreboardPage'
import GameLibraryPage from '@/pages/GameLibraryPage'
import SOSPage from '@/pages/SOSPage'
import SubscriptionPage from '@/pages/SubscriptionPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <Router>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/subscription" element={<SubscriptionPage />} />
                    
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <DashboardPage />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <ProfilePage />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/couples"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <CouplesPage />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/games"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <GameLibraryPage />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/challenges"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <ChallengesPage />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/scoreboard"
                      element={
                        <ProtectedRoute>
                          <Layout>
                            <ScoreboardPage />
                          </Layout>
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route
                      path="/sos"
                      element={
                        <ProtectedRoute>
                          <SOSPage />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </div>
              </Router>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App