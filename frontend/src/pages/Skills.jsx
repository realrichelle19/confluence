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
  Alert
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Verified as VerifiedIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { skillsAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function Skills() {
  const { user, isCoordinator } = useAuth()
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({
    skill: '',
    level: 'intermediate',
    certification: ''
  })

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      const res = await skillsAPI.getAll({ userId: user.id })
      setSkills(res.data.data || [])
    } catch (error) {
      toast.error('Failed to load skills')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = async () => {
    try {
      await skillsAPI.add(formData)
      toast.success('Skill added successfully')
      setOpenDialog(false)
      setFormData({ skill: '', level: 'intermediate', certification: '' })
      loadSkills()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add skill')
    }
  }

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return
    try {
      await skillsAPI.delete(skillId)
      toast.success('Skill deleted successfully')
      loadSkills()
    } catch (error) {
      toast.error('Failed to delete skill')
    }
  }

  const handleVerifySkill = async (skillId, userId) => {
    try {
      await skillsAPI.verify(skillId, { userId })
      toast.success('Skill verified successfully')
      loadSkills()
    } catch (error) {
      toast.error('Failed to verify skill')
    }
  }

  const getLevelColor = (level) => {
    const colors = {
      beginner: '#10b981',
      intermediate: '#4a90e2',
      advanced: '#f59e0b',
      expert: '#ef4444'
    }
    return colors[level] || '#9ca3af'
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
            Skills Management
          </Typography>
          <Typography variant="body1" sx={{ color: '#9ca3af' }}>
            Manage and verify your skills to help during emergencies
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5ba0f2 0%, #4a90e2 100%)',
            },
          }}
        >
          Add Skill
        </Button>
      </Box>

      {skills.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', background: '#1a1f3a', border: '1px solid #2a2f4a' }}>
          <Typography sx={{ color: '#9ca3af', mb: 2 }}>No skills added yet</Typography>
          <Button
            variant="outlined"
            onClick={() => setOpenDialog(true)}
            sx={{ borderColor: '#4a90e2', color: '#4a90e2' }}
          >
            Add Your First Skill
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ background: '#1a1f3a', border: '1px solid #2a2f4a' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#0f1422' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Skill</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Level</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Certification</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {skills.map((skill) => (
                <TableRow key={skill._id} sx={{ '&:hover': { background: '#0f1422' } }}>
                  <TableCell sx={{ color: '#fff' }}>{skill.skill}</TableCell>
                  <TableCell>
                    <Chip
                      label={skill.level}
                      size="small"
                      sx={{
                        background: `${getLevelColor(skill.level)}20`,
                        color: getLevelColor(skill.level),
                        border: `1px solid ${getLevelColor(skill.level)}40`
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#9ca3af' }}>
                    {skill.certification || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {skill.verified ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Verified"
                        size="small"
                        sx={{
                          background: '#10b98120',
                          color: '#10b981',
                          border: '1px solid #10b98140'
                        }}
                      />
                    ) : (
                      <Chip
                        label="Pending"
                        size="small"
                        sx={{
                          background: '#f59e0b20',
                          color: '#f59e0b',
                          border: '1px solid #f59e0b40'
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!skill.verified && isCoordinator && (
                        <IconButton
                          size="small"
                          onClick={() => handleVerifySkill(skill._id, user.id)}
                          sx={{ color: '#10b981' }}
                        >
                          <VerifiedIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteSkill(skill._id)}
                        sx={{ color: '#ef4444' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            background: '#1a1f3a',
            border: '1px solid #2a2f4a',
            minWidth: 400
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>Add New Skill</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Skill Name"
            value={formData.skill}
            onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
            InputProps={{ sx: { color: '#fff' } }}
            InputLabelProps={{ sx: { color: '#9ca3af' } }}
          />
          <TextField
            fullWidth
            select
            label="Level"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{ sx: { color: '#fff' } }}
            InputLabelProps={{ sx: { color: '#9ca3af' } }}
          >
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="intermediate">Intermediate</MenuItem>
            <MenuItem value="advanced">Advanced</MenuItem>
            <MenuItem value="expert">Expert</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Certification (optional)"
            value={formData.certification}
            onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
            InputProps={{ sx: { color: '#fff' } }}
            InputLabelProps={{ sx: { color: '#9ca3af' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#9ca3af' }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddSkill}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

