import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const role = await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate(role === 'admin' ? '/admin/dashboard' : '/employee/dashboard', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const DEMO = [
    { label: 'Admin / HR', email: 'admin@dayflow.io', pass: 'Admin@123' },
    { label: 'Employee (Alice)', email: 'alice@dayflow.io', pass: 'Alice@123' },
    { label: 'Employee (Bob)', email: 'bob@dayflow.io', pass: 'Bob@123' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Bar */}
      <header className="hr-toolbar">
        <span className="hr-toolbar-title">Dayflow</span>
      </header>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#3f51b5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <span className="material-icons" style={{ color: 'white', fontSize: '2rem' }}>lock</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 500, color: 'rgba(0,0,0,0.87)', marginBottom: 4 }}>
              Sign in
            </h1>
            <p style={{ color: 'rgba(0,0,0,0.54)', fontSize: '0.875rem' }}>
              Access your HRMS account
            </p>
          </div>

          {/* Card */}
          <div className="hr-card animate-fade-in">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {error && (
                <div style={{
                  background: '#ffebee',
                  border: '1px solid #ef9a9a',
                  borderRadius: 4,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#c62828',
                  fontSize: '0.875rem',
                }}>
                  <span className="material-icons" style={{ fontSize: '1.1rem' }}>error_outline</span>
                  {error}
                </div>
              )}

              <div>
                <label className="label">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  className="input-field"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    className="input-field"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{ paddingRight: '40px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'rgba(0,0,0,0.54)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: '1.1rem' }}>
                      {showPass ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: 4, height: 42 }}
              >
                {loading ? <span className="spinner spinner-sm" /> : 'Sign In'}
              </button>
            </form>

            {/* Demo credentials */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(0,0,0,0.12)' }}>
              <p style={{
                fontSize: '0.75rem',
                color: 'rgba(0,0,0,0.38)',
                textAlign: 'center',
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 500,
              }}>
                Demo Credentials
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {DEMO.map(({ label, email, pass }) => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => setForm({ email, password: pass })}
                    style={{
                      background: '#f5f5f5',
                      border: '1px solid rgba(0,0,0,0.12)',
                      borderRadius: 4,
                      padding: '8px 12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#eeeeee'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f5f5f5'}
                  >
                    <span style={{ color: '#3f51b5', fontWeight: 500, minWidth: 120 }}>{label}</span>
                    <span style={{ color: 'rgba(0,0,0,0.54)' }}>{email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.875rem', color: 'rgba(0,0,0,0.54)' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ color: '#3f51b5', fontWeight: 500 }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
