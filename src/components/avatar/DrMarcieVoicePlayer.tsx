import React, { useEffect, useRef, useState } from 'react'
import { voiceSynthesis } from '@/services/voiceSynthesis'
import type { DrMarcieResponse } from '@/types/drMarcie'

interface DrMarcieVoicePlayerProps {
  response: DrMarcieResponse | null
  autoPlay?: boolean
  onSpeakingStart?: () => void
  onSpeakingEnd?: () => void
  onError?: (error: Error) => void
}

export default function DrMarcieVoicePlayer({
  response,
  autoPlay = true,
  onSpeakingStart,
  onSpeakingEnd,
  onError
}: DrMarcieVoicePlayerProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const responseIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (response && autoPlay) {
      playResponse(response)
    }

    return () => {
      stopSpeaking()
    }
  }, [response, autoPlay])

  const playResponse = async (drMarcieResponse: DrMarcieResponse) => {
    // Prevent playing the same response multiple times
    const responseId = `${drMarcieResponse.message}-${Date.now()}`
    if (responseIdRef.current === responseId) return
    
    responseIdRef.current = responseId
    
    try {
      setIsLoading(true)
      stopSpeaking() // Stop any current speech

      onSpeakingStart?.()
      setIsSpeaking(true)

      await voiceSynthesis.speakDrMarcieResponse(drMarcieResponse)
      
    } catch (error) {
      console.error('Error playing Dr. Marcie response:', error)
      onError?.(error as Error)
    } finally {
      setIsLoading(false)
      setIsSpeaking(false)
      onSpeakingEnd?.()
      responseIdRef.current = null
    }
  }

  const stopSpeaking = () => {
    voiceSynthesis.stopSpeaking()
    
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current.currentTime = 0
      currentAudioRef.current = null
    }
    
    setIsSpeaking(false)
    setIsLoading(false)
    onSpeakingEnd?.()
  }

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking()
    } else if (response) {
      playResponse(response)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={toggleSpeaking}
        disabled={isLoading || !response}
        className={`p-2 rounded-full transition-colors ${
          isSpeaking
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isSpeaking ? 'Stop Speaking' : 'Play Voice'}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isSpeaking ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.824a1 1 0 011.617.824zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {isSpeaking && (
        <div className="flex items-center space-x-1">
          <div className="text-sm text-gray-600 dark:text-gray-300">Dr. Marcie is speaking...</div>
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-4 bg-gradient-to-t from-pink-500 to-purple-600 rounded animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}