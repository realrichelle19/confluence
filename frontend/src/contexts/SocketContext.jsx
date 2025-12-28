import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token')
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket', 'polling'],
      })

      newSocket.on('connect', () => {
        console.log('Socket connected')
        setConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected')
        setConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setConnected(false)
      })

      // Listen for notifications
      newSocket.on('new-incident-nearby', (data) => {
        if (user.role === 'volunteer') {
          toast.success(`New incident nearby: ${data.incident.title}`, {
            duration: 6000,
          })
        }
      })

      newSocket.on('assignment-request', (data) => {
        if (user.role === 'volunteer') {
          toast.success('New assignment request!', {
            duration: 6000,
          })
        }
      })

      newSocket.on('assignment-accepted', (data) => {
        if (user.role === 'coordinator') {
          toast.success('Volunteer accepted assignment', {
            duration: 4000,
          })
        }
      })

      newSocket.on('assignment-rejected', (data) => {
        if (user.role === 'coordinator') {
          toast.error('Volunteer rejected assignment', {
            duration: 4000,
          })
        }
      })

      newSocket.on('incident-escalated', (data) => {
        if (user.role === 'coordinator') {
          toast.error(`Incident escalated: ${data.incident.title}`, {
            duration: 6000,
          })
        }
      })

      newSocket.on('incident-status-changed', (data) => {
        toast.info(`Incident status: ${data.incident.status}`, {
          duration: 4000,
        })
      })

      newSocket.on('skill-verified', (data) => {
        toast.success(`Skill verified: ${data.skill.name}`, {
          duration: 4000,
        })
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [isAuthenticated, user])

  const updateLocation = (coordinates, address) => {
    if (socket && connected) {
      socket.emit('update-location', { coordinates, address })
    }
  }

  const value = {
    socket,
    connected,
    updateLocation,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

