/**
 * AuthContext — single source of truth for the current user session.
 *
 * Stores: { token, user: { id, employee_id, email, role, is_verified } }
 * Persisted in localStorage so refresh doesn't log the user out.
 * login() stores creds; logout() wipes them; isAdmin / isEmployee helpers
 * make route guards readable.
 */
import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('dayflow_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('dayflow_token') || null)
  const [loading, setLoading] = useState(false)

  // Sync to localStorage whenever state changes
  useEffect(() => {
    if (token) localStorage.setItem('dayflow_token', token)
    else localStorage.removeItem('dayflow_token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('dayflow_user', JSON.stringify(user))
    else localStorage.removeItem('dayflow_user')
  }, [user])

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    const { access_token, role, employee_id } = res.data
    setToken(access_token)
    // Fetch full user profile
    const meRes = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    setUser({ ...meRes.data, role, employee_id })
    return role
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  const isAdmin = user?.role === 'admin'
  const isEmployee = user?.role === 'employee'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isEmployee }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
