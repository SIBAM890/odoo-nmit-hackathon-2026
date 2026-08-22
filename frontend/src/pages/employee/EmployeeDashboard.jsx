import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { format, subDays } from 'date-fns'
import toast from 'react-hot-toast'
import { parseTimestamp } from '../../utils/time'
import { useAuth } from '../../context/AuthContext'
import {
  Clock, LogIn, LogOut, CheckCircle, CalendarClock, Activity, ArrowRight, Sun, Moon
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

function StatusBadge({ status }) {
  const map = {
    present: 'badge-success',
    absent: 'badge-error',
    'half-day': 'badge-warning',
    half_day: 'badge-warning',
    leave: 'badge-info',
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-error',
  }
  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status?.replace('_', '-')}</span>
}

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [todayRecord, setTodayRecord] = useState(null)
  const [checkingIn, setCheckingIn] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/attendance/me'),
      api.get('/leaves/me'),
      api.get('/employees/me').catch(() => ({ data: null }))
    ]).then(([aRes, lRes, pRes]) => {
      setAttendance(aRes.data)
      setLeaves(lRes.data)
      setProfile(pRes.data)
      const today = format(new Date(), 'yyyy-MM-dd')
      setTodayRecord(aRes.data.find(r => r.date === today) || null)
      setLoading(false)
    }).catch(() => {
      toast.error('Failed to load dashboard data')
      setLoading(false)
    })
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

  // Calculate Weekly Working Hours
  const weeklyData = useMemo(() => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const dateStr = format(d, 'yyyy-MM-dd')
      const rec = attendance.find(a => a.date === dateStr)
      let hours = 0
      if (rec && rec.check_in_time && rec.check_out_time) {
        const ci = parseTimestamp(rec.check_in_time)
        const co = parseTimestamp(rec.check_out_time)
        if (ci && co) hours = (co - ci) / 3600000
      }
      data.push({
        name: format(d, 'EEE'),
        hours: Math.round(hours * 10) / 10
      })
    }
    return data
  }, [attendance])

  const pendingLeaves = leaves.filter(l => l.status === 'pending').length
  const totalHoursWeek = weeklyData.reduce((sum, d) => sum + d.hours, 0)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'
  const GreetingIcon = hour < 18 ? Sun : Moon

  if (loading) {
    return (
      <div className="loading-center">
        <span className="spinner" />
        <span>Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GreetingIcon size={24} className={hour < 18 ? 'text-amber-500' : 'text-indigo-400'} />
            {greeting}, {profile?.full_name?.split(' ')[0] || user?.employee_id || 'Employee'}
          </h1>
          <p style={{ color: 'rgba(0,0,0,0.54)', marginTop: 4, fontSize: '0.875rem' }}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Hero Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        
        {/* Action Card: Today's Attendance */}
        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          borderRadius: 16, padding: 24, color: 'white',
          boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.9 }}>
              <Clock size={18} />
              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Quick Action</span>
            </div>
            
            <div style={{ marginTop: 16 }}>
              {todayRecord ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                    In: {parseTimestamp(todayRecord.check_in_time) ? format(parseTimestamp(todayRecord.check_in_time), 'h:mm a') : '--'}
                  </div>
                  {todayRecord.check_out_time ? (
                    <div style={{ fontSize: '1rem', opacity: 0.8 }}>
                      Out: {parseTimestamp(todayRecord.check_out_time) ? format(parseTimestamp(todayRecord.check_out_time), 'h:mm a') : '--'}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Currently working...</div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '1.125rem', fontWeight: 500, opacity: 0.9 }}>
                  Ready to start your day?
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            {!todayRecord && (
              <button onClick={handleCheckIn} disabled={checkingIn} style={{
                background: 'white', color: '#1d4ed8', border: 'none', padding: '10px 20px',
                borderRadius: 8, fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {checkingIn ? <span className="spinner spinner-sm border-t-[#1d4ed8]" /> : <><LogIn size={18} /> Check In</>}
              </button>
            )}
            {todayRecord && !todayRecord.check_out_time && (
              <button onClick={handleCheckOut} disabled={checkingIn} style={{
                background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', 
                padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center'
              }}>
                {checkingIn ? <span className="spinner spinner-sm" /> : <><LogOut size={18} /> Check Out</>}
              </button>
            )}
            {todayRecord?.check_out_time && (
              <div style={{
                background: 'rgba(255,255,255,0.15)', color: 'white', padding: '10px 20px',
                borderRadius: 8, fontWeight: 600, fontSize: '0.9375rem', 
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center'
              }}>
                <CheckCircle size={18} /> Shift Complete
              </div>
            )}
          </div>
        </div>

        {/* Stats Card: Working Hours */}
        <div style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          borderRadius: 16, padding: 24, color: 'white',
          boxShadow: '0 4px 12px rgba(14,165,233,0.2)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.9 }}>
            <Activity size={18} />
            <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Weekly Progress</span>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>
              {totalHoursWeek.toFixed(1)}<span style={{ fontSize: '1.25rem', opacity: 0.8, marginLeft: 4 }}>hrs</span>
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: 8 }}>
              Total hours worked in the last 7 days
            </div>
          </div>
          <div style={{ marginTop: 24, background: 'rgba(255,255,255,0.15)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
            <div style={{ background: 'white', height: '100%', width: `${Math.min((totalHoursWeek / 40) * 100, 100)}%`, borderRadius: 8 }} />
          </div>
        </div>

        {/* Stats Card: Leaves */}
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          borderRadius: 16, padding: 24, color: 'white',
          boxShadow: '0 4px 12px rgba(139,92,246,0.2)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.9 }}>
            <CalendarClock size={18} />
            <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Leave Status</span>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>
              {pendingLeaves}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: 8 }}>
              Pending leave requests awaiting HR approval
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <Link to="/employee/leave" style={{
              display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: 'white', 
              padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none'
            }}>
              View Leaves
            </Link>
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: 'gridTemplateColumns: 2fr 1fr', gap: 20 }}>
        
        {/* Working Hours Bar Chart */}
        <div className="hr-card" style={{ padding: 24 }}>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Activity size={18} color="#3f51b5" />
            Total Working Hours (Last 7 Days)
          </h2>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 'dataMax + 2']} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value} hrs`, 'Worked']}
                />
                <Bar dataKey="hours" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Attendance List */}
        <div className="hr-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fafafa'
          }}>
            <h2 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} className="text-slate-500" />
              Recent Logs
            </h2>
            <Link to="/employee/attendance" style={{ color: '#3b82f6', fontSize: '0.8125rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ padding: '8px 0' }}>
            {attendance.slice(0, 5).map(r => (
              <div key={r.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 20px',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
              }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                    {r.date ? format(new Date(r.date + 'T00:00:00'), 'EEE, MMM d') : '—'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                    {r.check_in_time ? format(parseTimestamp(r.check_in_time), 'h:mm a') : '--'}
                    {' — '}
                    {r.check_out_time ? format(parseTimestamp(r.check_out_time), 'h:mm a') : 'Working'}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
            {attendance.length === 0 && (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0', fontSize: '0.875rem' }}>
                No attendance records yet.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
