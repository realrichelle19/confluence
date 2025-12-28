import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Grid, Paper, Typography, Card, CardContent, Chip, CircularProgress } from '@mui/material'
import {
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { incidentsAPI, assignmentsAPI, usersAPI } from '../services/api'
import { format } from 'date-fns'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isCoordinator, isVolunteer } = useAuth()
  const [stats, setStats] = useState({
    incidents: { total: 0, active: 0, critical: 0 },
    assignments: { total: 0, pending: 0, completed: 0 },
    volunteers: 0,
    recentIncidents: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [incidentsRes, assignmentsRes] = await Promise.all([
        incidentsAPI.getAll(),
        assignmentsAPI.getAll()
      ])

      const incidents = incidentsRes.data.data || []
      const assignments = assignmentsRes.data.data || []

      let volunteersCount = 0
      if (isCoordinator) {
        const usersRes = await usersAPI.getAll({ role: 'volunteer' })
        volunteersCount = usersRes.data.count || 0
      }

      setStats({
        incidents: {
          total: incidents.length,
          active: incidents.filter(i => ['reported', 'verified', 'assigned', 'in-progress'].includes(i.status)).length,
          critical: incidents.filter(i => i.severity === 'critical' || i.urgencyLevel >= 8).length
        },
        assignments: {
          total: assignments.length,
          pending: assignments.filter(a => a.status === 'pending').length,
          completed: assignments.filter(a => a.status === 'completed').length
        },
        volunteers: volunteersCount,
        recentIncidents: incidents.slice(0, 5)
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#4a90e2' }} />
      </Box>
    )
  }

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ 
      background: 'linear-gradient(135deg, #1a1f3a 0%, #2a2f4a 100%)',
      border: `1px solid ${color}40`,
      borderRadius: 2,
      height: '100%',
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-4px)' }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold', mb: 0.5 }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: color, mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ 
            background: `${color}20`, 
            borderRadius: 2, 
            p: 1.5,
            color: color
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    }
    return colors[severity] || '#9ca3af'
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#fff', mb: 1, fontWeight: 'bold' }}>
        Welcome back, {user?.name}!
      </Typography>
      <Typography variant="body1" sx={{ color: '#9ca3af', mb: 4 }}>
        {isCoordinator && 'Monitor and coordinate emergency responses'}
        {isVolunteer && 'Track your assignments and help those in need'}
        {!isCoordinator && !isVolunteer && 'Report incidents and stay informed'}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Incidents"
            value={stats.incidents.total}
            icon={<WarningIcon />}
            color="#ef4444"
            subtitle={`${stats.incidents.active} active`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Critical Incidents"
            value={stats.incidents.critical}
            icon={<TrendingUpIcon />}
            color="#dc2626"
            subtitle="Requires immediate attention"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="My Assignments"
            value={stats.assignments.total}
            icon={<AssignmentIcon />}
            color="#4a90e2"
            subtitle={`${stats.assignments.pending} pending`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {isCoordinator ? (
            <StatCard
              title="Active Volunteers"
              value={stats.volunteers}
              icon={<PeopleIcon />}
              color="#10b981"
              subtitle="Ready to help"
            />
          ) : (
            <StatCard
              title="Completed"
              value={stats.assignments.completed}
              icon={<CheckCircleIcon />}
              color="#10b981"
              subtitle="Successfully resolved"
            />
          )}
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 3, 
            background: '#1a1f3a', 
            border: '1px solid #2a2f4a',
            borderRadius: 2
          }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
              Recent Incidents
            </Typography>
            {stats.recentIncidents.length === 0 ? (
              <Typography sx={{ color: '#9ca3af', textAlign: 'center', py: 4 }}>
                No incidents found
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {stats.recentIncidents.map((incident) => (
                  <Box
                    key={incident._id}
                    sx={{
                      p: 2,
                      background: '#0f1422',
                      borderRadius: 1,
                      border: '1px solid #2a2f4a',
                      '&:hover': { borderColor: '#4a90e2' }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
                        {incident.title}
                      </Typography>
                      <Chip
                        label={incident.severity}
                        size="small"
                        sx={{
                          background: `${getSeverityColor(incident.severity)}20`,
                          color: getSeverityColor(incident.severity),
                          border: `1px solid ${getSeverityColor(incident.severity)}40`
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#9ca3af', mb: 1 }}>
                      {incident.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {incident.type} • {incident.location?.address || 'Location not specified'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6b7280' }}>
                        {format(new Date(incident.createdAt), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            background: '#1a1f3a', 
            border: '1px solid #2a2f4a',
            borderRadius: 2
          }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box 
                onClick={() => navigate('/incidents')}
                sx={{ 
                  p: 2, 
                  background: '#0f1422', 
                  borderRadius: 1,
                  border: '1px solid #2a2f4a',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#4a90e2', background: '#1a1f3a' }
                }}
              >
                <Typography variant="subtitle2" sx={{ color: '#4a90e2', mb: 0.5 }}>
                  Report New Incident
                </Typography>
                <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                  Report a flood emergency or civic need
                </Typography>
              </Box>
              <Box 
                onClick={() => navigate('/map')}
                sx={{ 
                  p: 2, 
                  background: '#0f1422', 
                  borderRadius: 1,
                  border: '1px solid #2a2f4a',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#4a90e2', background: '#1a1f3a' }
                }}
              >
                <Typography variant="subtitle2" sx={{ color: '#4a90e2', mb: 0.5 }}>
                  View 3D Map
                </Typography>
                <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                  See incidents and volunteers in 3D
                </Typography>
              </Box>
              {isVolunteer && (
                <Box 
                  onClick={() => navigate('/skills')}
                  sx={{ 
                    p: 2, 
                    background: '#0f1422', 
                    borderRadius: 1,
                    border: '1px solid #2a2f4a',
                    cursor: 'pointer',
                    '&:hover': { borderColor: '#4a90e2', background: '#1a1f3a' }
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: '#4a90e2', mb: 0.5 }}>
                    Manage Skills
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                    Add or update your verified skills
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

