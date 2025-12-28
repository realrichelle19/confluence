import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Box, 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Alert
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || 'Login failed')
    }
    
    setLoading(false)
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background elements */}
      <Box sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(74, 144, 226, 0.1) 0%, transparent 70%)',
          top: '-250px',
          left: '-250px',
          animation: 'pulse 4s ease-in-out infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(74, 144, 226, 0.1) 0%, transparent 70%)',
          bottom: '-200px',
          right: '-200px',
          animation: 'pulse 4s ease-in-out infinite 2s',
        },
      }} />
      
      <Container maxWidth="sm">
        <Paper elevation={24} sx={{
          p: 4,
          background: 'rgba(26, 31, 58, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(74, 144, 226, 0.2)',
          borderRadius: 3,
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ color: '#4a90e2', fontWeight: 'bold', mb: 1 }}>
              Flood Emergency Platform
            </Typography>
            <Typography variant="body1" sx={{ color: '#9ca3af' }}>
              Sign in to your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
              InputProps={{
                sx: { color: '#fff', '&::before': { borderColor: '#2a2f4a' } }
              }}
              InputLabelProps={{ sx: { color: '#9ca3af' } }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                sx: { color: '#fff', '&::before': { borderColor: '#2a2f4a' } }
              }}
              InputLabelProps={{ sx: { color: '#9ca3af' } }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5ba0f2 0%, #4a90e2 100%)',
                },
                mb: 2,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#4a90e2', textDecoration: 'none' }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

