import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material'
import {
  Assignment as AssignmentIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { assignmentsAPI } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Reports() {
  const { user, isCoordinator } = useAuth()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isCoordinator) {
      loadReport()
    }
  }, [])

  const loadReport = async () => {
    try {
      const res = await assignmentsAPI.getActivityReport()
      setReport(res.data.data)
    } catch (error) {
      console.error('Failed to load report:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isCoordinator) {
    return (
      <Box>
        <Typography variant="h4" sx={{ color: '#fff', mb: 2 }}>
          Access Denied
        </Typography>
        <Typography sx={{ color: '#9ca3af' }}>
          Reports are only available to coordinators.
        </Typography>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#4a90e2' }} />
      </Box>
    )
  }

  const statusData = report?.byStatus ? Object.entries(report.byStatus).map(([key, value]) => ({
    name: key,
    value
  })) : []

  const COLORS = ['#4a90e2', '#10b981', '#f59e0b', '#ef4444', '#9ca3af', '#8b5cf6']

  return (
    <Box>
      <Typography variant="h4" sx={{ color: '#fff', mb: 1, fontWeight: 'bold' }}>
        Volunteer Activity Report
      </Typography>
      <Typography variant="body1" sx={{ color: '#9ca3af', mb: 4 }}>
        Comprehensive analytics and tracking of volunteer activities
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1a1f3a 0%, #2a2f4a 100%)', border: '1px solid #4a90e240' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    {report?.totalAssignments || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    Total Assignments
                  </Typography>
                </Box>
                <AssignmentIcon sx={{ fontSize: 40, color: '#4a90e2' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1a1f3a 0%, #2a2f4a 100%)', border: '1px solid #10b98140' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    {report?.byStatus?.completed || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    Completed
                  </Typography>
                </Box>
                <CompletedIcon sx={{ fontSize: 40, color: '#10b981' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1a1f3a 0%, #2a2f4a 100%)', border: '1px solid #f59e0b40' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    {report?.byStatus?.pending || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    Pending
                  </Typography>
                </Box>
                <PendingIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #1a1f3a 0%, #2a2f4a 100%)', border: '1px solid #8b5cf640' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    {report?.averageRating?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                    Avg Rating
                  </Typography>
                </Box>
                <TrendingIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: '#1a1f3a', border: '1px solid #2a2f4a', height: 400 }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
              Assignments by Status
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f4a" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    background: '#1a1f3a',
                    border: '1px solid #2a2f4a',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="value" fill="#4a90e2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: '#1a1f3a', border: '1px solid #2a2f4a', height: 400 }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 3, fontWeight: 600 }}>
              Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1a1f3a',
                    border: '1px solid #2a2f4a',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

