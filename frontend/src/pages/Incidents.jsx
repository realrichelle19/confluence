import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  CircularProgress,
  Select,
  FormControl,
  InputLabel
} from '@mui/material'
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  TrendingUp as EscalateIcon,
  CheckCircle as VerifyIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { incidentsAPI } from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function Incidents() {
  const { user, isCoordinator } = useAuth()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'flood',
    severity: 'medium',
    location: { coordinates: [0, 0], address: '', area: '' },
    requiredSkills: [],
    peopleAffected: 0,
    urgencyLevel: 5
  })

  useEffect(() => {
    loadIncidents()
  }, [])

  const loadIncidents = async () => {
    try {
      const res = await incidentsAPI.getAll()
      setIncidents(res.data.data || [])
    } catch (error) {
      toast.error('Failed to load incidents')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIncident = async () => {
    try {
      if (!formData.location.coordinates[0] || !formData.location.coordinates[1]) {
        toast.error('Please set location coordinates')
        return
      }
      await incidentsAPI.create(formData)
      toast.success('Incident reported successfully')
      setOpenDialog(false)
      setFormData({
        title: '',
        description: '',
        type: 'flood',
        severity: 'medium',
        location: { coordinates: [0, 0], address: '', area: '' },
        requiredSkills: [],
        peopleAffected: 0,
        urgencyLevel: 5
      })
      loadIncidents()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create incident')
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
              address: prev.location.address || `${latitude}, ${longitude}`,
              area: prev.location.area
            }
          }))
        },
        () => toast.error('Failed to get location')
      )
    }
  }

  const handleVerify = async (id) => {
    try {
      await incidentsAPI.verify(id)
      toast.success('Incident verified')
      loadIncidents()
    } catch (error) {
      toast.error('Failed to verify incident')
    }
  }

  const handleEscalate = async (id) => {
    try {
      await incidentsAPI.escalate(id)
      toast.success('Incident escalated')
      loadIncidents()
    } catch (error) {
      toast.error('Failed to escalate incident')
    }
  }

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    }
    return colors[severity] || '#9ca3af'
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#4a90e2' }} />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#fff', mb: 1, fontWeight: 'bold' }}>
            Incidents
          </Typography>
          <Typography variant="body1" sx={{ color: '#9ca3af' }}>
            Report and manage flood emergencies
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
          }}
        >
          Report Incident
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ background: '#1a1f3a', border: '1px solid #2a2f4a' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#0f1422' }}>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Severity</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Location</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Created</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incidents.map((incident) => (
              <TableRow key={incident._id} sx={{ '&:hover': { background: '#0f1422' } }}>
                <TableCell sx={{ color: '#fff' }}>{incident.title}</TableCell>
                <TableCell>
                  <Chip label={incident.type} size="small" sx={{ background: '#2a2f4a', color: '#fff' }} />
                </TableCell>
                <TableCell>
                  <Chip
                    label={incident.severity}
                    size="small"
                    sx={{
                      background: `${getSeverityColor(incident.severity)}20`,
                      color: getSeverityColor(incident.severity),
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip label={incident.status} size="small" sx={{ background: '#2a2f4a', color: '#fff' }} />
                </TableCell>
                <TableCell sx={{ color: '#9ca3af', maxWidth: 200 }}>
                  {incident.location?.address || 'N/A'}
                </TableCell>
                <TableCell sx={{ color: '#9ca3af' }}>
                  {format(new Date(incident.createdAt), 'MMM dd, HH:mm')}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => setSelectedIncident(incident)}
                      sx={{ color: '#4a90e2' }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    {isCoordinator && incident.status === 'reported' && (
                      <IconButton
                        size="small"
                        onClick={() => handleVerify(incident._id)}
                        sx={{ color: '#10b981' }}
                      >
                        <VerifyIcon fontSize="small" />
                      </IconButton>
                    )}
                    {isCoordinator && (
                      <IconButton
                        size="small"
                        onClick={() => handleEscalate(incident._id)}
                        sx={{ color: '#ef4444' }}
                      >
                        <EscalateIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Incident Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { background: '#1a1f3a', border: '1px solid #2a2f4a' }
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>Report New Incident</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            InputProps={{ sx: { color: '#fff' } }}
            InputLabelProps={{ sx: { color: '#9ca3af' } }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{ sx: { color: '#fff' } }}
            InputLabelProps={{ sx: { color: '#9ca3af' } }}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#9ca3af' }}>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                sx={{ color: '#fff' }}
                label="Type"
              >
                <MenuItem value="flood">Flood</MenuItem>
                <MenuItem value="rescue">Rescue</MenuItem>
                <MenuItem value="medical">Medical</MenuItem>
                <MenuItem value="evacuation">Evacuation</MenuItem>
                <MenuItem value="supply">Supply</MenuItem>
                <MenuItem value="infrastructure">Infrastructure</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#9ca3af' }}>Severity</InputLabel>
              <Select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                sx={{ color: '#fff' }}
                label="Severity"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button onClick={handleGetLocation} variant="outlined" sx={{ mb: 2, borderColor: '#4a90e2', color: '#4a90e2' }}>
            Get My Location
          </Button>
          <TextField
            fullWidth
            label="Longitude"
            type="number"
            value={formData.location.coordinates[0]}
            onChange={(e) => setFormData({
              ...formData,
              location: { ...formData.location, coordinates: [parseFloat(e.target.value) || 0, formData.location.coordinates[1]] }
            })}
            sx={{ mb: 1 }}
            InputProps={{ sx: { color: '#fff' } }}
            InputLabelProps={{ sx: { color: '#9ca3af' } }}
          />
          <TextField
            fullWidth
            label="Latitude"
            type="number"
            value={formData.location.coordinates[1]}
            onChange={(e) => setFormData({
              ...formData,
              location: { ...formData.location, coordinates: [formData.location.coordinates[0], parseFloat(e.target.value) || 0] }
            })}
            sx={{ mb: 2 }}
            InputProps={{ sx: { color: '#fff' } }}
            InputLabelProps={{ sx: { color: '#9ca3af' } }}
          />
          <TextField
            fullWidth
            label="Address"
            value={formData.location.address}
            onChange={(e) => setFormData({
              ...formData,
              location: { ...formData.location, address: e.target.value }
            })}
            sx={{ mb: 2 }}
            InputProps={{ sx: { color: '#fff' } }}
            InputLabelProps={{ sx: { color: '#9ca3af' } }}
          />
          <TextField
            fullWidth
            label="People Affected"
            type="number"
            value={formData.peopleAffected}
            onChange={(e) => setFormData({ ...formData, peopleAffected: parseInt(e.target.value) || 0 })}
            sx={{ mb: 2 }}
            InputProps={{ sx: { color: '#fff' } }}
            InputLabelProps={{ sx: { color: '#9ca3af' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#9ca3af' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateIncident}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
            }}
          >
            Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Incident Dialog */}
      {selectedIncident && (
        <Dialog
          open={!!selectedIncident}
          onClose={() => setSelectedIncident(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { background: '#1a1f3a', border: '1px solid #2a2f4a' }
          }}
        >
          <DialogTitle sx={{ color: '#fff' }}>{selectedIncident.title}</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: '#9ca3af', mb: 2 }}>{selectedIncident.description}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip label={selectedIncident.type} sx={{ background: '#2a2f4a', color: '#fff' }} />
              <Chip label={selectedIncident.severity} sx={{ background: '#2a2f4a', color: '#fff' }} />
              <Chip label={selectedIncident.status} sx={{ background: '#2a2f4a', color: '#fff' }} />
            </Box>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Location: {selectedIncident.location?.address || 'Not specified'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              People Affected: {selectedIncident.peopleAffected || 0}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Urgency Level: {selectedIncident.urgencyLevel}/10
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedIncident(null)} sx={{ color: '#9ca3af' }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}

