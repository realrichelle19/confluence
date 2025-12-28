import React, { createContext, useState, useContext, useEffect } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      // Verify token is still valid
      authAPI.getMe()
        .then(res => {
          setUser(res.data.user)
          localStorage.setItem('user', JSON.stringify(res.data.user))
        })
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password })
      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData)
      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      toast.success('Registration successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateLocation = async (coordinates, address) => {
    try {
      await authAPI.updateLocation({ coordinates, address })
      const res = await authAPI.getMe()
      setUser(res.data.user)
      localStorage.setItem('user', JSON.stringify(res.data.user))
    } catch (error) {
      toast.error('Failed to update location')
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateLocation,
    isAuthenticated: !!user,
    isCoordinator: user?.role === 'coordinator',
    isVolunteer: user?.role === 'volunteer',
    isCitizen: user?.role === 'citizen',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

