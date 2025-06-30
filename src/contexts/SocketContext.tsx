import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  joinCoupleRoom: (coupleId: string) => void
  leaveCoupleRoom: (coupleId: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, session } = useAuth()

  useEffect(() => {
    if (user && session) {
      const socketInstance = io(import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001', {
        auth: {
          token: session.access_token,
          userId: user.id,
        },
      })

      socketInstance.on('connect', () => {
        setIsConnected(true)
        console.log('Connected to WebSocket server')
      })

      socketInstance.on('disconnect', () => {
        setIsConnected(false)
        console.log('Disconnected from WebSocket server')
      })

      setSocket(socketInstance)

      return () => {
        socketInstance.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [user, session])

  const joinCoupleRoom = (coupleId: string) => {
    if (socket) {
      socket.emit('join-couple-room', coupleId)
    }
  }

  const leaveCoupleRoom = (coupleId: string) => {
    if (socket) {
      socket.emit('leave-couple-room', coupleId)
    }
  }

  const value = {
    socket,
    isConnected,
    joinCoupleRoom,
    leaveCoupleRoom,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}