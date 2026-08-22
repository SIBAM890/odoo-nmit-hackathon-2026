import { useEffect, useState } from 'react'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { parseTimestamp } from '../../utils/time'

function StatusBadge({ status }) {
  const map = {
    present: 'badge-success',
    absent: 'badge-error',
    'half-day': 'badge-warning',
    half_day: 'badge-warning',
    leave: 'badge-info',
  }
  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status?.replace('_', '-')}</span>
}

export default function EmployeeAttendance() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [todayRecord, setTodayRecord] = useState(null)

  useEffect(() => { fetchRecords() }, [])

  function fetchRecords() {
    api.get('/attendance/me')
      .then(res => {
        setRecords(res.data)
        const today = format(new Date(), 'yyyy-MM-dd')
        setTodayRecord(res.data.find(r => r.date === today) || null)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load attendance records')
        setLoading(false)
      })
  }

  async function handleCheckIn() {
    setCheckingIn(true)
    try {
      await api.post('/attendance/check-in')
      toast.success('Checked in!')
      fetchRecords()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Check-in failed')
    } finally {
      setCheckingIn(false)
    }
  }

  async function handleCheckOut() {
    setCheckingIn(true)
    try {
      await api.post('/attendance/check-out')
      toast.success('Checked out!')
      fetchRecords()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Check-out failed')
    } finally {
      setCheckingIn(false)
    }
  }

  if (loading) {
    return <div className="loading-center"><span className="spinner" /><span>Loading attendance…</span></div>
  }

  const presentDays = records.filter(r => r.status === 'present').length
  const halfDays = records.filter(r => ['half-day', 'half_day'].includes(r.status)).length
  const absentDays = records.filter(r => r.status === 'absent').length

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 className="page-title">My Attendance</h1>

      {/* Today's Action */}
      <div className="hr-card" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <p style={{ fontWeight: 500 }}>Today — {format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          {todayRecord ? (
            <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: '0.875rem', color: 'rgba(0,0,0,0.54)' }}>
              <span>In: {parseTimestamp(todayRecord.check_in_time) ? format(parseTimestamp(todayRecord.check_in_time), 'hh:mm a') : '—'}</span>
              <span>Out: {parseTimestamp(todayRecord.check_out_time) ? format(parseTimestamp(todayRecord.check_out_time), 'hh:mm a') : '—'}</span>
              <StatusBadge status={todayRecord.status} />
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'rgba(0,0,0,0.38)', marginTop: 4 }}>Not checked in yet.</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {!todayRecord && (
            <button className="btn-success" onClick={handleCheckIn} disabled={checkingIn}>
              {checkingIn ? <span className="spinner spinner-sm" /> : <><span className="material-icons" style={{ fontSize: '1rem' }}>login</span> Check In</>}
            </button>
          )}
          {todayRecord && !todayRecord.check_out_time && (
            <button className="btn-danger" onClick={handleCheckOut} disabled={checkingIn}>
              {checkingIn ? <span className="spinner spinner-sm" /> : <><span className="material-icons" style={{ fontSize: '1rem' }}>logout</span> Check Out</>}
            </button>
          )}
          {todayRecord?.check_out_time && (
            <span className="badge badge-success">
              <span className="material-icons" style={{ fontSize: '0.9rem' }}>check_circle</span>
              Shift complete
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div className="hr-stat-card">
          <div className="hr-stat-icon green">
            <span className="material-icons">check_circle</span>
          </div>
          <div>
            <div className="hr-stat-value">{presentDays}</div>
            <div className="hr-stat-label">Present</div>
          </div>
        </div>
        <div className="hr-stat-card">
          <div className="hr-stat-icon amber">
            <span className="material-icons">schedule</span>
          </div>
          <div>
            <div className="hr-stat-value">{halfDays}</div>
            <div className="hr-stat-label">Half Days</div>
          </div>
        </div>
        <div className="hr-stat-card">
          <div className="hr-stat-icon" style={{ background: '#ffebee', color: '#f44336' }}>
            <span className="material-icons">cancel</span>
          </div>
          <div>
            <div className="hr-stat-value">{absentDays}</div>
            <div className="hr-stat-label">Absent</div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div>
        <div style={{
          padding: '14px 0', display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 8,
        }}>
          <span className="material-icons" style={{ color: '#3f51b5' }}>history</span>
          <h2 className="section-title">Attendance History</h2>
        </div>
        <div className="hr-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="hr-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => {
                const checkIn  = parseTimestamp(r.check_in_time)
                const checkOut = parseTimestamp(r.check_out_time)
                let hours = null
                if (checkIn && checkOut) {
                  hours = ((checkOut - checkIn) / 3_600_000).toFixed(1)
                }
                return (
                  <tr key={r.id}>
                    <td style={{ color: 'rgba(0,0,0,0.87)', fontWeight: 500 }}>
                      {r.date ? format(new Date(r.date + 'T00:00:00'), 'MMM d, yyyy') : '—'}
                    </td>
                    <td style={{ color: 'rgba(0,0,0,0.54)' }}>{r.date ? format(new Date(r.date + 'T00:00:00'), 'EEE') : '—'}</td>
                    <td style={{ color: 'rgba(0,0,0,0.7)' }}>
                      {checkIn ? format(checkIn, 'hh:mm a') : '—'}
                    </td>
                    <td style={{ color: 'rgba(0,0,0,0.7)' }}>
                      {checkOut ? format(checkOut, 'hh:mm a') : '—'}
                    </td>
                    <td style={{ color: hours ? 'rgba(0,0,0,0.87)' : 'rgba(0,0,0,0.38)' }}>
                      {hours ? `${hours}h` : '—'}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                )
              })}
              {records.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'rgba(0,0,0,0.38)' }}>
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
