import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DrMarcieAvatar from './DrMarcieAvatar'
import DrMarcieVoicePlayer from './DrMarcieVoicePlayer'
import { drMarcieAI } from '@/services/drMarcieAI'
import { useAuth } from '@/contexts/AuthContext'
import type { DrMarcieResponse, ConversationContext, AvatarState } from '@/types/drMarcie'

interface DrMarcieChatProps {
  context: ConversationContext
  initialMessage?: string
  className?: string
  avatarSize?: 'small' | 'medium' | 'large'
  showVoiceControls?: boolean
}

export default function DrMarcieChat({
  context,
  initialMessage,
  className = '',
  avatarSize = 'medium',
  showVoiceControls = true
}: DrMarcieChatProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Array<{
    id: string
    type: 'user' | 'marcie'
    content: string
    response?: DrMarcieResponse
    timestamp: Date
  }>>([])
  const [currentInput, setCurrentInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [avatarState, setAvatarState] = useState<AvatarState>({
    expression: 'neutral',
    gesture: 'none',
    eyeContact: true,
    isAnimating: false
  })
  const [currentResponse, setCurrentResponse] = useState<DrMarcieResponse | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialMessage) {
      handleInitialMessage(initialMessage)
    }
  }, [initialMessage])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleInitialMessage = async (message: string) => {
    try {
      setIsLoading(true)
      const response = await drMarcieAI.generateResponse(message, context)
      
      const messageId = Date.now().toString()
      setMessages([{
        id: messageId,
        type: 'marcie',
        content: response.message,
        response,
        timestamp: new Date()
      }])
      
      setCurrentResponse(response)
      updateAvatarFromResponse(response)
    } catch (error) {
      console.error('Error generating initial message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: currentInput.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentInput('')
    setIsLoading(true)

    try {
      // Update context with recent conversation
      const updatedContext: ConversationContext = {
        ...context,
        previousResponses: messages.slice(-5).map(m => m.content)
      }

      const response = await drMarcieAI.generateResponse(
        currentInput.trim(),
        updatedContext
      )

      const marcieMessage = {
        id: (Date.now() + 1).toString(),
        type: 'marcie' as const,
        content: response.message,
        response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, marcieMessage])
      setCurrentResponse(response)
      updateAvatarFromResponse(response)

    } catch (error) {
      console.error('Error generating Dr. Marcie response:', error)
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'marcie' as const,
        content: "Oops! Seems like I'm having a technical moment. Even therapists need a breather sometimes! What were we talking about?",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const updateAvatarFromResponse = (response: DrMarcieResponse) => {
    const newState = drMarcieAI.getAvatarState(response, context)
    setAvatarState(newState)

    // Reset gesture after animation
    if (newState.gesture !== 'none') {
      setTimeout(() => {
        setAvatarState(prev => ({ ...prev, gesture: 'none', isAnimating: false }))
      }, 2000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}>
      {/* Header with Avatar */}
      <div className="flex items-center space-x-4 p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-t-xl">
        <DrMarcieAvatar
          state={avatarState}
          isSpeaking={isSpeaking}
          currentResponse={currentResponse}
          size={avatarSize}
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gradient">Dr. Marcie Liss</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Your AI Couples Therapist
          </p>
        </div>
        {showVoiceControls && currentResponse && (
          <DrMarcieVoicePlayer
            response={currentResponse}
            autoPlay={false}
            onSpeakingStart={() => setIsSpeaking(true)}
            onSpeakingEnd={() => setIsSpeaking(false)}
          />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 text-gray-900 dark:text-gray-100 border border-pink-200 dark:border-pink-700'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.type === 'marcie' && message.response && showVoiceControls && (
                    <DrMarcieVoicePlayer
                      response={message.response}
                      autoPlay={false}
                      onSpeakingStart={() => setIsSpeaking(true)}
                      onSpeakingEnd={() => setIsSpeaking(false)}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 px-4 py-2 rounded-lg border border-pink-200 dark:border-pink-700">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Dr. Marcie is thinking...
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
        <div className="flex space-x-2">
          <textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!currentInput.trim() || isLoading}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}