import axios from 'axios'

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
})

export const getWelcome = async () => {
  const res = await api.get('/hello')
  return res.data
}

export const sendMessage = async (message) => {
  const res = await api.post('/chat', { text: message })
  return res.data
}
