import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import {
  CheckCircle as AcceptIcon,
  Cancel as RejectIcon,
  PlayArrow as StartIcon,
  Done as CompleteIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { assignmentsAPI } from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function Assignments() {
  const { user, isVolunteer } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [completeDialog, setCompleteDialog] = useState(null)

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      const res = await assignmentsAPI.getAll()
      setAssignments(res.data.data || [])
    } catch (error) {
      toast.error('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (id) => {
    try {
      await assignmentsAPI.accept(id)
      toast.success('Assignment accepted')
      loadAssignments()
    } catch (error) {
      toast.error('Failed to accept assignment')
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this assignment?')) return
    try {
      await assignmentsAPI.reject(id)
      toast.success('Assignment rejected')
      loadAssignments()
    } catch (error) {
      toast.error('Failed to reject assignment')
    }
  }

  const handleStart = async (id) => {
    try {
      await assignmentsAPI.start(id)
      toast.success('Assignment started')
      loadAssignments()
    } catch (error) {
      toast.error('Failed to start assignment')
    }
  }

  const handleComplete = async (data) => {
    try {
      await assignmentsAPI.complete(completeDialog.id, data)
      toast.success('Assignment completed')
      setCompleteDialog(null)
      loadAssignments()
    } catch (error) {
      toast.error('Failed to complete assignment')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      accepted: '#4a90e2',
      rejected: '#ef4444',
      'in-progress': '#10b981',
      completed: '#10b981',
      cancelled: '#9ca3af'
    }
    return colors[status] || '#9ca3af'
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#fff', mb: 1, fontWeight: 'bold' }}>
          Assignments
        </Typography>
        <Typography variant="body1" sx={{ color: '#9ca3af' }}>
          {isVolunteer ? 'Manage your volunteer assignments' : 'View all assignments'}
        </Typography>
      </Box>

      {assignments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', background: '#1a1f3a', border: '1px solid #2a2f4a' }}>
          <Typography sx={{ color: '#9ca3af' }}>No assignments found</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ background: '#1a1f3a', border: '1px solid #2a2f4a' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#0f1422' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Incident</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Volunteer</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Distance</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment._id} sx={{ '&:hover': { background: '#0f1422' } }}>
                  <TableCell sx={{ color: '#fff' }}>
                    {assignment.incident?.title || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: '#9ca3af' }}>
                    {assignment.volunteer?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={assignment.status}
                      size="small"
                      sx={{
                        background: `${getStatusColor(assignment.status)}20`,
                        color: getStatusColor(assignment.status),
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#9ca3af' }}>
                    {assignment.distance ? `${(assignment.distance / 1000).toFixed(1)} km` : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: '#9ca3af' }}>
                    {format(new Date(assignment.createdAt), 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {assignment.status === 'pending' && isVolunteer && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleAccept(assignment._id)}
                            sx={{ color: '#10b981' }}
                          >
                            <AcceptIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleReject(assignment._id)}
                            sx={{ color: '#ef4444' }}
                          >
                            <RejectIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      {assignment.status === 'accepted' && isVolunteer && (
                        <IconButton
                          size="small"
                          onClick={() => handleStart(assignment._id)}
                          sx={{ color: '#4a90e2' }}
                        >
                          <StartIcon fontSize="small" />
                        </IconButton>
                      )}
                      {assignment.status === 'in-progress' && isVolunteer && (
                        <IconButton
                          size="small"
                          onClick={() => setCompleteDialog({ id: assignment._id })}
                          sx={{ color: '#10b981' }}
                        >
                          <CompleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Complete Assignment Dialog */}
      {completeDialog && (
        <Dialog
          open={!!completeDialog}
          onClose={() => setCompleteDialog(null)}
          PaperProps={{
            sx: { background: '#1a1f3a', border: '1px solid #2a2f4a', minWidth: 400 }
          }}
        >
          <DialogTitle sx={{ color: '#fff' }}>Complete Assignment</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Actual Duration (minutes)"
              type="number"
              sx={{ mt: 2, mb: 2 }}
              InputProps={{ sx: { color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#9ca3af' } }}
            />
            <TextField
              fullWidth
              label="Rating (1-5)"
              type="number"
              inputProps={{ min: 1, max: 5 }}
              sx={{ mb: 2 }}
              InputProps={{ sx: { color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#9ca3af' } }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Feedback"
              InputProps={{ sx: { color: '#fff' } }}
              InputLabelProps={{ sx: { color: '#9ca3af' } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCompleteDialog(null)} sx={{ color: '#9ca3af' }}>
              Cancel
            </Button>
            <Button
              onClick={() => handleComplete({})}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
              }}
            >
              Complete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  )
}

