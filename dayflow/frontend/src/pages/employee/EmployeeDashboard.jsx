import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  Clock, CalendarCheck, DollarSign, User, CheckCircle,
  XCircle, AlertTriangle, TrendingUp, ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, accent, subtext }) {
  return (
    <div className="stat-card" style={{ '--accent-gradient': accent }}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <Icon size={20} className="text-slate-300" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
      {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    present: 'badge-success',
    absent: 'badge-error',
    'half-day': 'badge-warning',
    leave: 'badge-info',
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-error',
  }
  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>
}

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [todayRecord, setTodayRecord] = useState(null)
  const [checkingIn, setCheckingIn] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/employees/me'),
      api.get('/attendance/me'),
      api.get('/leaves/me'),
    ]).then(([p, a, l]) => {
      setProfile(p.data)
      setAttendance(a.data)
      setLeaves(l.data)
      const today = format(new Date(), 'yyyy-MM-dd')
      setTodayRecord(a.data.find((r) => r.date === today) || null)
    }).catch(() => toast.error('Failed to load dashboard data'))
  }, [])

  async function handleCheckIn() {
    setCheckingIn(true)
    try {
      const res = await api.post('/attendance/check-in')
      setTodayRecord(res.data)
      toast.success('Checked in successfully!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Check-in failed')
    } finally {
      setCheckingIn(false)
    }
  }

  async function handleCheckOut() {
    setCheckingIn(true)
    try {
      const res = await api.post('/attendance/check-out')
      setTodayRecord(res.data)
      toast.success('Checked out successfully!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Check-out failed')
    } finally {
      setCheckingIn(false)
    }
  }

  const presentDays = attendance.filter((r) => r.status === 'present').length
  const pendingLeaves = leaves.filter((l) => l.status === 'pending').length
  const recentLeaves = leaves.slice(0, 3)

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="page-title">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {profile?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {format(new Date(), 'EEEE, MMMM d yyyy')} · {user?.employee_id}
        </p>
      </div>

      {/* Check-in card */}
      <div className="glass-card p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">Today's Status</p>
          {todayRecord ? (
            <div className="flex items-center gap-3">
              <StatusBadge status={todayRecord.status} />
              {todayRecord.check_in_time && (
                <span className="text-xs text-slate-500">
                  In: {format(new Date(todayRecord.check_in_time + 'Z'), 'h:mm a')}
                </span>
              )}
              {todayRecord.check_out_time && (
                <span className="text-xs text-slate-500">
                  Out: {format(new Date(todayRecord.check_out_time + 'Z'), 'h:mm a')}
                </span>
              )}
            </div>
          ) : (
            <p className="text-slate-300 font-medium">Not checked in yet</p>
          )}
        </div>
        <div className="flex gap-3">
          {!todayRecord?.check_in_time && (
            <button onClick={handleCheckIn} disabled={checkingIn} className="btn-success">
              {checkingIn ? <span className="spinner" /> : <><Clock size={16} /> Check In</>}
            </button>
          )}
          {todayRecord?.check_in_time && !todayRecord?.check_out_time && (
            <button onClick={handleCheckOut} disabled={checkingIn} className="btn-secondary">
              {checkingIn ? <span className="spinner" /> : <><Clock size={16} /> Check Out</>}
            </button>
          )}
          {todayRecord?.check_out_time && (
            <span className="text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle size={16} /> Done for today
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle}
          label="Present Days"
          value={presentDays}
          accent="linear-gradient(90deg, #10b981, #059669)"
          subtext="Last 3 weeks"
        />
        <StatCard
          icon={CalendarCheck}
          label="Pending Leaves"
          value={pendingLeaves}
          accent="linear-gradient(90deg, #f59e0b, #d97706)"
        />
        <StatCard
          icon={XCircle}
          label="Absent Days"
          value={attendance.filter((r) => r.status === 'absent').length}
          accent="linear-gradient(90deg, #ef4444, #dc2626)"
          subtext="Last 3 weeks"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Leaves"
          value={leaves.length}
          accent="linear-gradient(90deg, #4f46e5, #7c3aed)"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Attendance</h2>
            <Link to="/employee/attendance" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {attendance.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0">
                <span className="text-sm text-slate-300">{format(new Date(r.date), 'EEE, MMM d')}</span>
                <StatusBadge status={r.status} />
              </div>
            ))}
            {attendance.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-6">No attendance records yet</p>
            )}
          </div>
        </div>

        {/* Recent Leaves */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">My Leave Requests</h2>
            <Link to="/employee/leave" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentLeaves.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0">
                <div>
                  <p className="text-sm text-slate-300 capitalize">{l.leave_type} leave</p>
                  <p className="text-xs text-slate-500">{format(new Date(l.start_date), 'MMM d')} – {format(new Date(l.end_date), 'MMM d')}</p>
                </div>
                <StatusBadge status={l.status} />
              </div>
            ))}
            {leaves.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-6">No leave requests yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { to: '/employee/profile', icon: User, label: 'My Profile', desc: 'View & edit personal details' },
          { to: '/employee/leave', icon: CalendarCheck, label: 'Apply Leave', desc: 'Submit a new leave request' },
          { to: '/employee/payroll', icon: DollarSign, label: 'My Payroll', desc: 'View salary breakdown' },
        ].map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to} className="glass-card-hover p-5 block">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
              <Icon size={20} className="text-indigo-400" />
            </div>
            <p className="font-semibold text-slate-200 text-sm mb-1">{label}</p>
            <p className="text-xs text-slate-500">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
