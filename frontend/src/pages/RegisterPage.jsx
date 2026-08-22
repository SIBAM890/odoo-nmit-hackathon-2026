import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', pass: /[a-z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
    { label: 'Special character', pass: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]
  const passed = checks.filter(c => c.pass).length
  const percent = (passed / checks.length) * 100
  const color = percent < 40 ? '#f44336' : percent < 80 ? '#ff9800' : '#4caf50'

  if (!password) return null

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        height: 4,
        background: 'rgba(0,0,0,0.12)',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 8,
      }}>
        <div style={{
          height: '100%',
          width: `${percent}%`,
          background: color,
          transition: 'width 0.3s ease',
          borderRadius: 2,
        }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
        {checks.map(({ label, pass }) => (
          <span key={label} style={{
            fontSize: '0.7rem',
            color: pass ? '#4caf50' : 'rgba(0,0,0,0.38)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <span className="material-icons" style={{ fontSize: '0.8rem' }}>
              {pass ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const [form, setForm] = useState({ employee_id: '', email: '', password: '', role: 'employee' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifyToken, setVerifyToken] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/register', form)
      setVerifyToken(res.data.verify_token)
      toast.success('Registration successful!')
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join('. '))
      } else {
        setError(detail || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    try {
      await api.get(`/auth/verify/${verifyToken}`)
      toast.success('Email verified! Please log in.')
      navigate('/login')
    } catch {
      toast.error('Verification failed')
    }
  }

  if (verifyToken) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
        <header className="hr-toolbar">
          <span className="hr-toolbar-title">DayFlow HR Management System</span>
        </header>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div className="hr-card animate-fade-in" style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: '#e8f5e9', border: '2px solid #a5d6a7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <span className="material-icons" style={{ color: '#4caf50', fontSize: '2rem' }}>check_circle</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: 8 }}>Verify your email</h2>
            <p style={{ color: 'rgba(0,0,0,0.54)', fontSize: '0.875rem', marginBottom: 12 }}>
              In production, a verification link would be sent to your email.
              For this demo, click below to simulate verification.
            </p>
            <div style={{
              background: '#f5f5f5', border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 4, padding: '8px 12px', marginBottom: 20,
              fontFamily: 'monospace', fontSize: '0.75rem', color: '#3f51b5',
              wordBreak: 'break-all',
            }}>
              {verifyToken}
            </div>
            <button onClick={handleVerify} className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: 42 }}>
              Verify Email &amp; Continue
            </button>
            <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.38)', marginTop: 12 }}>
              This simulates the /auth/verify/{'{token}'} endpoint.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <header className="hr-toolbar">
        <span className="hr-toolbar-title">DayFlow HR Management System</span>
      </header>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#3f51b5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <span className="material-icons" style={{ color: 'white', fontSize: '2rem' }}>person_add</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 500, color: 'rgba(0,0,0,0.87)', marginBottom: 4 }}>
              Create account
            </h1>
            <p style={{ color: 'rgba(0,0,0,0.54)', fontSize: '0.875rem' }}>
              Join your team on Dayflow HRMS
            </p>
          </div>

          <div className="hr-card animate-fade-in">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && (
                <div style={{
                  background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 4,
                  padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8,
                  color: '#c62828', fontSize: '0.875rem',
                }}>
                  <span className="material-icons" style={{ fontSize: '1.1rem' }}>error_outline</span>
                  {error}
                </div>
              )}

              <div>
                <label className="label">Employee ID</label>
                <input
                  id="reg-employee-id"
                  type="text"
                  className="input-field"
                  placeholder="EMP001"
                  value={form.employee_id}
                  onChange={e => setForm({ ...form, employee_id: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Email address</label>
                <input
                  id="reg-email"
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
                    id="reg-password"
                    type={showPass ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{ paddingRight: 40 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'rgba(0,0,0,0.54)', display: 'flex', alignItems: 'center',
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: '1.1rem' }}>
                      {showPass ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </div>

              <div>
                <label className="label">Role</label>
                <select
                  id="reg-role"
                  className="input-field"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin / HR</option>
                </select>
              </div>

              <button
                id="reg-submit"
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: 4, height: 42 }}
              >
                {loading ? <span className="spinner spinner-sm" /> : 'Create Account'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.875rem', color: 'rgba(0,0,0,0.54)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#3f51b5', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
