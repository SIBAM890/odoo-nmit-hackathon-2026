import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { Users, Clock, CalendarCheck, TrendingUp, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="stat-card" style={{ '--accent-gradient': accent }}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <Icon size={20} className="text-slate-300" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
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

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([])
  const [leaves, setLeaves] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/employees'),
      api.get('/leaves'),
      api.get('/attendance')
    ]).then(([eRes, lRes, aRes]) => {
      setEmployees(eRes.data)
      setLeaves(lRes.data)
      setAttendance(aRes.data)
      setLoading(false)
    }).catch(() => {
      toast.error('Failed to load dashboard data')
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="spinner border-t-purple-500" /></div>
  }

  const pendingLeaves = leaves.filter(l => l.status === 'pending')
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayAttendance = attendance.filter(a => a.date === today)
  const presentToday = todayAttendance.filter(a => ['present', 'half-day'].includes(a.status)).length

  return (
    <div className="animate-fade-in space-y-8 max-w-6xl">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of company HR metrics.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          icon={Users} 
          label="Total Employees" 
          value={employees.length} 
          accent="linear-gradient(90deg, #8b5cf6, #c084fc)" 
        />
        <StatCard 
          icon={Clock} 
          label="Present Today" 
          value={`${presentToday} / ${employees.length}`} 
          accent="linear-gradient(90deg, #10b981, #34d399)" 
        />
        <StatCard 
          icon={CalendarCheck} 
          label="Pending Leaves" 
          value={pendingLeaves.length} 
          accent="linear-gradient(90deg, #f59e0b, #fbbf24)" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Total Leave Requests" 
          value={leaves.length} 
          accent="linear-gradient(90deg, #0ea5e9, #38bdf8)" 
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="section-title">Leave Approvals Queue</h2>
            <Link to="/admin/leaves" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingLeaves.slice(0, 5).map(l => (
              <div key={l.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                <div>
                  <p className="text-sm font-medium text-slate-200">{l.employee?.full_name}</p>
                  <p className="text-xs text-slate-400 capitalize">{l.leave_type} Leave: {format(new Date(l.start_date), 'MMM d')} - {format(new Date(l.end_date), 'MMM d')}</p>
                </div>
                <StatusBadge status={l.status} />
              </div>
            ))}
            {pendingLeaves.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">No pending leave requests.</p>}
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="section-title">Today's Attendance Overview</h2>
            <Link to="/admin/attendance" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {todayAttendance.slice(0, 5).map(a => (
              <div key={a.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                <div>
                  <p className="text-sm font-medium text-slate-200">{a.employee?.full_name}</p>
                  <p className="text-xs text-slate-400">In: {a.check_in_time ? format(new Date(a.check_in_time + 'Z'), 'h:mm a') : '--'} | Out: {a.check_out_time ? format(new Date(a.check_out_time + 'Z'), 'h:mm a') : '--'}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
            {todayAttendance.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">No attendance records for today yet.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
