import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const user = localStorage.getItem('thcoc_user')
  if (user) {
    const parsed = JSON.parse(user)
    config.headers.Authorization = `Bearer ${parsed.token}`
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('thcoc_user')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default api