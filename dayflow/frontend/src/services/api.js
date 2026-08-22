/**
 * Axios instance — all requests go through /api which Vite proxies to :8000.
 * The interceptor auto-attaches Bearer tokens from localStorage and
 * redirects to /login on 401 (expired/invalid token).
 */
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dayflow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally — clear session and redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dayflow_token')
      localStorage.removeItem('dayflow_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
