import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Map3D from './pages/Map3D'
import Skills from './pages/Skills'
import Incidents from './pages/Incidents'
import Assignments from './pages/Assignments'
import Reports from './pages/Reports'
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1f3a',
                color: '#fff',
                border: '1px solid #4a90e2',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="map" element={<Map3D />} />
              <Route path="skills" element={<Skills />} />
              <Route path="incidents" element={<Incidents />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App

