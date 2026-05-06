import axios from 'axios'

const BASE_URL = 'https://thcoc-backend.onrender.com/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  try {
    const user = localStorage.getItem('thcoc_user')
    if (user) {
      const parsed = JSON.parse(user)
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`
      }
    }
  } catch (e) {
    console.error('Token error:', e)
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    console.error('API Error:', err.response?.status, err.response?.data)
    if (err.response?.status === 401) {
      localStorage.removeItem('thcoc_user')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default api