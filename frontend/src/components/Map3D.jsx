import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Sphere, Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import { Box, Paper, Typography, Chip, Button } from '@mui/material'
import { incidentsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

// 3D Marker component for incidents
function IncidentMarker({ position, incident, onClick }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  const getColor = () => {
    if (incident.severity === 'critical') return '#dc2626'
    if (incident.severity === 'high') return '#ef4444'
    if (incident.severity === 'medium') return '#f59e0b'
    return '#10b981'
  }

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.5
      meshRef.current.rotation.y += 0.01
    }
  })

  return (
    <group position={[position[0], 0, position[1]]}>
      <Sphere
        ref={meshRef}
        args={[0.15, 16, 16]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={hovered ? 0.8 : 0.4}
        />
      </Sphere>
      <Line
        points={[[0, 0, 0], [0, 0.5, 0]]}
        color={getColor()}
        lineWidth={2}
      />
      {hovered && (
        <Html distanceFactor={10}>
          <Paper sx={{
            p: 1,
            background: 'rgba(26, 31, 58, 0.95)',
            border: `1px solid ${getColor()}`,
            borderRadius: 1,
            minWidth: 200,
          }}>
            <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600 }}>
              {incident.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
              {incident.type} • {incident.severity}
            </Typography>
          </Paper>
        </Html>
      )}
    </group>
  )
}

// Volunteer marker
function VolunteerMarker({ position, volunteer }) {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05 + 0.3
    }
  })

  return (
    <group position={[position[0], 0, position[1]]}>
      <Sphere ref={meshRef} args={[0.1, 16, 16]}>
        <meshStandardMaterial
          color="#4a90e2"
          emissive="#4a90e2"
          emissiveIntensity={0.3}
        />
      </Sphere>
      <Line
        points={[[0, 0, 0], [0, 0.3, 0]]}
        color="#4a90e2"
        lineWidth={1}
      />
    </group>
  )
}

// Ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#1a3a2a" />
    </mesh>
  )
}

// Grid helper
function GridHelper() {
  return (
    <gridHelper args={[100, 100, '#2a2f4a', '#1a1f3a']} />
  )
}

export default function Map3D() {
  const { user } = useAuth()
  const [incidents, setIncidents] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [incidentsRes] = await Promise.all([
        incidentsAPI.getAll({ status: 'reported,verified,assigned,in-progress' })
      ])

      setIncidents(incidentsRes.data.data || [])
      
      // Simulate volunteer positions (in real app, fetch from API)
      if (user?.location?.coordinates) {
        const baseCoords = user.location.coordinates
        setVolunteers([
          { _id: '1', location: { coordinates: [baseCoords[0] + 0.01, baseCoords[1] + 0.01] } },
          { _id: '2', location: { coordinates: [baseCoords[0] - 0.01, baseCoords[1] + 0.01] } },
        ])
      }
    } catch (error) {
      console.error('Failed to load map data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Normalize coordinates to 3D space (simplified - in production, use proper projection)
  const normalizeCoords = (coords) => {
    if (!coords || coords.length !== 2) return [0, 0]
    // Simple normalization - in production, use proper map projection
    const center = user?.location?.coordinates || [0, 0]
    return [
      (coords[0] - center[0]) * 1000, // longitude to x
      (coords[1] - center[1]) * 1000  // latitude to z
    ]
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '600px' }}>
        <Typography sx={{ color: '#9ca3af' }}>Loading 3D map...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', position: 'relative' }}>
      <Canvas
        camera={{ position: [10, 10, 10], fov: 60 }}
        shadows
        style={{ background: '#0a0e27' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[0, 10, 0]} intensity={0.5} />

        <Ground />
        <GridHelper />

        {/* Render incidents */}
        {incidents.map((incident) => {
          if (!incident.location?.coordinates) return null
          const pos = normalizeCoords(incident.location.coordinates)
          return (
            <IncidentMarker
              key={incident._id}
              position={pos}
              incident={incident}
              onClick={() => setSelectedIncident(incident)}
            />
          )
        })}

        {/* Render volunteers */}
        {volunteers.map((volunteer) => {
          if (!volunteer.location?.coordinates) return null
          const pos = normalizeCoords(volunteer.location.coordinates)
          return (
            <VolunteerMarker
              key={volunteer._id}
              position={pos}
              volunteer={volunteer}
            />
          )
        })}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
        />
      </Canvas>

      {/* Info panel */}
      <Paper sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        p: 2,
        background: 'rgba(26, 31, 58, 0.95)',
        border: '1px solid #2a2f4a',
        borderRadius: 2,
        minWidth: 300,
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
          3D Emergency Map
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#9ca3af', mb: 1 }}>
            Legend:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#dc2626' }} />
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>Critical</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>High</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>Medium</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#4a90e2' }} />
              <Typography variant="caption" sx={{ color: '#9ca3af' }}>Volunteers</Typography>
            </Box>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
          Active Incidents: {incidents.length}
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
          Volunteers: {volunteers.length}
        </Typography>
      </Paper>

      {/* Selected incident details */}
      {selectedIncident && (
        <Paper sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          p: 3,
          background: 'rgba(26, 31, 58, 0.95)',
          border: '1px solid #2a2f4a',
          borderRadius: 2,
          minWidth: 350,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
              {selectedIncident.title}
            </Typography>
            <Button
              size="small"
              onClick={() => setSelectedIncident(null)}
              sx={{ color: '#9ca3af', minWidth: 'auto' }}
            >
              ×
            </Button>
          </Box>
          <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
            {selectedIncident.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip label={selectedIncident.type} size="small" sx={{ background: '#2a2f4a', color: '#fff' }} />
            <Chip label={selectedIncident.severity} size="small" sx={{ background: '#2a2f4a', color: '#fff' }} />
            <Chip label={selectedIncident.status} size="small" sx={{ background: '#2a2f4a', color: '#fff' }} />
          </Box>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            Location: {selectedIncident.location?.address || 'Not specified'}
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

