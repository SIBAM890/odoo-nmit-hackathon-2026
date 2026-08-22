import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, Mail, Lock, User, Hash, CheckCircle, AlertCircle, X, Check } from 'lucide-react'
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
  const passed = checks.filter((c) => c.pass).length
  const percent = (passed / checks.length) * 100
  const color = percent < 40 ? '#ef4444' : percent < 80 ? '#f59e0b' : '#10b981'

  if (!password) return null

  return (
    <div className="mt-2 space-y-2">
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      <ul className="grid grid-cols-2 gap-1">
        {checks.map(({ label, pass }) => (
          <li key={label} className={`flex items-center gap-1.5 text-[11px] ${pass ? 'text-emerald-400' : 'text-slate-500'}`}>
            {pass ? <Check size={10} /> : <X size={10} />}
            {label}
          </li>
        ))}
      </ul>
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
        setError(detail.map((d) => d.msg).join('. '))
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in glass-card p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="text-emerald-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Verify your email</h2>
          <p className="text-slate-400 text-sm mb-2">
            In production, a verification link would be sent to your email.
            For this demo, click the button below to simulate verification.
          </p>
          <div className="bg-white/5 rounded-lg p-3 mb-6 font-mono text-xs text-indigo-300 break-all">
            {verifyToken}
          </div>
          <button onClick={handleVerify} className="btn-primary w-full justify-center py-3">
            Verify Email & Continue
          </button>
          <p className="text-xs text-slate-500 mt-4">
            This simulates the /auth/verify/{'{token}'} endpoint — the full state machine is real.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Dayflow</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
          <p className="text-slate-400 text-sm">Join your team on Dayflow</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="label">Employee ID</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="reg-employee-id"
                  type="text"
                  className="input-field pl-10"
                  placeholder="EMP001"
                  value={form.employee_id}
                  onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="reg-email"
                  type="email"
                  className="input-field pl-10"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
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
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin / HR</option>
              </select>
            </div>

            <button id="reg-submit" type="submit" className="btn-primary w-full justify-center py-3 text-base mt-2" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
