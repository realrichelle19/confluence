import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateLocation: (data) => api.put('/auth/update-location', data),
}

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  getStats: (id) => api.get(`/users/${id}/stats`),
}

// Skills API
export const skillsAPI = {
  add: (data) => api.post('/skills', data),
  getAll: (params) => api.get('/skills', { params }),
  update: (skillId, data) => api.put(`/skills/${skillId}`, data),
  delete: (skillId) => api.delete(`/skills/${skillId}`),
  verify: (skillId, data) => api.put(`/skills/${skillId}/verify`, data),
}

// Incidents API
export const incidentsAPI = {
  create: (data) => api.post('/incidents', data),
  getAll: (params) => api.get('/incidents', { params }),
  getById: (id) => api.get(`/incidents/${id}`),
  update: (id, data) => api.put(`/incidents/${id}`, data),
  verify: (id) => api.put(`/incidents/${id}/verify`),
  escalate: (id) => api.put(`/incidents/${id}/escalate`),
  matchVolunteers: (id, params) => api.get(`/incidents/${id}/match-volunteers`, { params }),
  addNote: (id, data) => api.post(`/incidents/${id}/notes`, data),
}

// Assignments API
export const assignmentsAPI = {
  create: (data) => api.post('/assignments', data),
  getAll: (params) => api.get('/assignments', { params }),
  getById: (id) => api.get(`/assignments/${id}`),
  accept: (id) => api.put(`/assignments/${id}/accept`),
  reject: (id) => api.put(`/assignments/${id}/reject`),
  start: (id) => api.put(`/assignments/${id}/start`),
  complete: (id, data) => api.put(`/assignments/${id}/complete`, data),
  addNote: (id, data) => api.post(`/assignments/${id}/notes`, data),
  getActivityReport: (params) => api.get('/assignments/reports/volunteer-activity', { params }),
}

export default api

