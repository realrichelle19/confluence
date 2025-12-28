import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Box, 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'citizen',
    location: {
      coordinates: [0, 0],
      address: ''
    }
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'longitude' || name === 'latitude') {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: name === 'longitude' 
            ? [parseFloat(value) || 0, prev.location.coordinates[1]]
            : [prev.location.coordinates[0], parseFloat(value) || 0]
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords
          setFormData(prev => ({
            ...prev,
            location: {
              coordinates: [longitude, latitude],
              address: prev.location.address || `${latitude}, ${longitude}`
            }
          }))
        },
        (error) => {
          setError('Failed to get location: ' + error.message)
        }
      )
    } else {
      setError('Geolocation is not supported by your browser')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.location.coordinates[0] || !formData.location.coordinates[1]) {
      setError('Please set your location')
      setLoading(false)
      return
    }

    const result = await register(formData)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || 'Registration failed')
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
      py: 4,
    }}>
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
              Create Account
            </Typography>
            <Typography variant="body1" sx={{ color: '#9ca3af' }}>
              Join the flood emergency response network
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
              name="name"
              label="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              InputProps={{ sx: { color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#9ca3af' } }}
            />
            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              InputProps={{ sx: { color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#9ca3af' } }}
            />
            <TextField
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              InputProps={{ sx: { color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#9ca3af' } }}
            />
            <TextField
              fullWidth
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              InputProps={{ sx: { color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#9ca3af' } }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: '#9ca3af' }}>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                sx={{ color: '#fff' }}
                label="Role"
              >
                <MenuItem value="citizen">Citizen</MenuItem>
                <MenuItem value="volunteer">Volunteer</MenuItem>
                <MenuItem value="coordinator">Coordinator</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ mb: 2 }}>
              <Button
                type="button"
                onClick={handleGetLocation}
                variant="outlined"
                fullWidth
                sx={{ mb: 1, borderColor: '#4a90e2', color: '#4a90e2' }}
              >
                Get My Location
              </Button>
              <TextField
                fullWidth
                name="longitude"
                label="Longitude"
                type="number"
                value={formData.location.coordinates[0]}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
                InputProps={{ sx: { color: '#fff' } }}
                InputLabelProps={{ sx: { color: '#9ca3af' } }}
              />
              <TextField
                fullWidth
                name="latitude"
                label="Latitude"
                type="number"
                value={formData.location.coordinates[1]}
                onChange={handleChange}
                required
                sx={{ mb: 1 }}
                InputProps={{ sx: { color: '#fff' } }}
                InputLabelProps={{ sx: { color: '#9ca3af' } }}
              />
              <TextField
                fullWidth
                name="address"
                label="Address (optional)"
                value={formData.location.address}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, address: e.target.value }
                }))}
                sx={{ mb: 1 }}
                InputProps={{ sx: { color: '#fff' } }}
                InputLabelProps={{ sx: { color: '#9ca3af' } }}
              />
            </Box>
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
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#4a90e2', textDecoration: 'none' }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

