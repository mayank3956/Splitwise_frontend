import axios from 'axios'

// In production (Vercel), use the VITE_API_URL env var pointing to Render backend.
// In development, use the Vite proxy (/api → https://spliwise-backend-5rgu.onrender.com).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
})

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sw_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const registerUser = (name, email, password) => api.post('/auth/register', { name, email, password })
export const loginUser = (email, password) => api.post('/auth/login', { email, password })
export const getCurrentUser = () => api.get('/auth/me')

// Groups
export const getGroups = () => api.get('/groups')
export const getGroup = (id) => api.get(`/groups/${id}`)
export const createGroup = (data) => api.post('/groups', data)
export const updateGroup = (id, data) => api.put(`/groups/${id}`, data)
export const deleteGroup = (id) => api.delete(`/groups/${id}`)
export const addMember = (groupId, name) => api.post(`/groups/${groupId}/members`, { name })
export const getBalances = (groupId) => api.get(`/groups/${groupId}/balances`)
export const getGroupByShareCode = (code) => api.get(`/groups/join/${code}`)
export const regenerateShareCode = (id) => api.post(`/groups/${id}/regenerate-code`)

// Expenses
export const getExpenses = (groupId) => api.get(`/expenses/group/${groupId}`)
export const createExpense = (data) => api.post('/expenses', data)
export const deleteExpense = (id) => api.delete(`/expenses/${id}`)

// Settlements
export const getSettlements = (groupId) => api.get(`/settlements/group/${groupId}`)
export const createSettlement = (data) => api.post('/settlements', data)
export const deleteSettlement = (id) => api.delete(`/settlements/${id}`)

export default api
