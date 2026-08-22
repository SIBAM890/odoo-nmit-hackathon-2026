import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { format, subDays } from 'date-fns'
import toast from 'react-hot-toast'
import { parseTimestamp } from '../../utils/time'
import {
  Users, UserCheck, CalendarClock, CalendarRange,
  ArrowRight, Activity, Clock
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
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

export default function AdminDashboard() {
  const [employees, setEmployees] = useState([])
  const [leaves, setLeaves] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/employees'),
      api.get('/leaves'),
      api.get('/attendance'),
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

  const pendingLeaves = leaves.filter(l => l.status === 'pending')
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayAttendance = attendance.filter(a => a.date === today)
  
  const presentCount = todayAttendance.filter(a => ['present', 'half-day', 'half_day'].includes(a.status)).length
  const absentCount = todayAttendance.filter(a => a.status === 'absent').length
  const leaveCount = todayAttendance.filter(a => a.status === 'leave').length
  
  // Chart Data: Attendance over last 7 days
  const weeklyData = useMemo(() => {
    const data = []
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const dateStr = format(d, 'yyyy-MM-dd')
      const dayRecs = attendance.filter(a => a.date === dateStr)
      data.push({
        name: format(d, 'EEE'),
        Present: dayRecs.filter(a => ['present', 'half-day', 'half_day'].includes(a.status)).length,
        Absent: dayRecs.filter(a => a.status === 'absent').length,
        Leave: dayRecs.filter(a => a.status === 'leave').length,
      })
    }
    return data
  }, [attendance])

  // Pie Chart Data: Today's Status
  const pieData = [
    { name: 'Present', value: presentCount, color: '#10b981' },
    { name: 'Absent', value: absentCount, color: '#ef4444' },
    { name: 'On Leave', value: leaveCount, color: '#3b82f6' },
    { name: 'Not Checked In', value: Math.max(0, employees.length - todayAttendance.length), color: '#cbd5e1' }
  ].filter(d => d.value > 0)

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
          <h1 className="page-title">HR Overview</h1>
          <p style={{ color: 'rgba(0,0,0,0.54)', marginTop: 4, fontSize: '0.875rem' }}>
            Company metrics and daily statistics
          </p>
        </div>
      </div>

      {/* Colorful Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {/* Card 1 */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          borderRadius: 16, padding: 20, color: 'white',
          boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Total Employees</span>
            <Users size={20} style={{ opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: 12, lineHeight: 1 }}>
            {employees.length}
          </div>
          <div style={{ fontSize: '0.8125rem', opacity: 0.8, marginTop: 8 }}>Active workforce</div>
        </div>

        {/* Card 2 */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: 16, padding: 20, color: 'white',
          boxShadow: '0 4px 12px rgba(16,185,129,0.2)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Present Today</span>
            <UserCheck size={20} style={{ opacity: 0.8 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12, lineHeight: 1 }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 700 }}>{presentCount}</span>
            <span style={{ fontSize: '1.25rem', opacity: 0.8 }}>/ {employees.length}</span>
          </div>
          <div style={{ fontSize: '0.8125rem', opacity: 0.8, marginTop: 8 }}>
            {Math.round((presentCount / (employees.length || 1)) * 100)}% attendance rate
          </div>
        </div>

        {/* Card 3 */}
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          borderRadius: 16, padding: 20, color: 'white',
          boxShadow: '0 4px 12px rgba(139,92,246,0.2)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Pending Leaves</span>
            <CalendarClock size={20} style={{ opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, marginTop: 12, lineHeight: 1 }}>
            {pendingLeaves.length}
          </div>
          <div style={{ fontSize: '0.8125rem', opacity: 0.8, marginTop: 8 }}>Awaiting approval</div>
        </div>
      </div>

      {/* Data Visualizations */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Bar Chart: Weekly Attendance */}
        <div className="hr-card" style={{ padding: 24 }}>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Activity size={18} color="#3f51b5" />
            Attendance Overview (Last 7 Days)
          </h2>
          <div style={{ height: 280, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Leave" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Today's Status */}
        <div className="hr-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0 }}>
            <Clock size={18} color="#3f51b5" />
            Today's Status
          </h2>
          <div style={{ flex: 1, minHeight: 220, width: '100%', position: 'relative' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              textAlign: 'center', pointerEvents: 'none'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>{employees.length}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>Total</div>
            </div>
          </div>
          {/* Custom Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {pieData.map((entry, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#475569' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }} />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-column Lists */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Leave Approvals */}
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
              <CalendarRange size={16} className="text-slate-500" />
              Leave Approvals
            </h2>
            <Link to="/admin/leaves" style={{ color: '#3b82f6', fontSize: '0.8125rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ padding: '8px 0' }}>
            {pendingLeaves.slice(0, 5).map(l => (
              <div key={l.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 20px',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
              }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                    {l.employee?.full_name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2, textTransform: 'capitalize' }}>
                    {l.leave_type} — {format(new Date(l.start_date + 'T00:00:00'), 'MMM d')} to {format(new Date(l.end_date + 'T00:00:00'), 'MMM d')}
                  </p>
                </div>
                <StatusBadge status={l.status} />
              </div>
            ))}
            {pendingLeaves.length === 0 && (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0', fontSize: '0.875rem' }}>
                No pending leave requests.
              </p>
            )}
          </div>
        </div>

        {/* Today's Attendance List */}
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
              <UserCheck size={16} className="text-slate-500" />
              Today's Activity
            </h2>
            <Link to="/admin/attendance" style={{ color: '#3b82f6', fontSize: '0.8125rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ padding: '8px 0' }}>
            {todayAttendance.slice(0, 5).map(a => (
              <div key={a.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 20px',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
              }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                    {a.employee?.full_name}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                    In: {parseTimestamp(a.check_in_time) ? format(parseTimestamp(a.check_in_time), 'h:mm a') : '--'}
                    {' | '}
                    Out: {parseTimestamp(a.check_out_time) ? format(parseTimestamp(a.check_out_time), 'h:mm a') : '--'}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
            {todayAttendance.length === 0 && (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0', fontSize: '0.875rem' }}>
                No attendance records for today yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
