import { useEffect, useState } from 'react'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

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

export default function AdminAttendance() {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editStatus, setEditStatus] = useState('')

  useEffect(() => { fetchData() }, [])

  function fetchData() {
    api.get('/attendance')
      .then(res => {
        setAttendance(res.data)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load attendance records')
        setLoading(false)
      })
  }

  async function handleSave(id) {
    try {
      await api.put(`/attendance/${id}`, { status: editStatus })
      toast.success('Attendance updated')
      setEditingId(null)
      fetchData()
    } catch {
      toast.error('Update failed')
    }
  }

  if (loading) {
    return <div className="loading-center"><span className="spinner" /><span>Loading attendance…</span></div>
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Attendance Oversight</h1>
          <p style={{ color: 'rgba(0,0,0,0.54)', marginTop: 4, fontSize: '0.875rem' }}>
            Monitor and correct employee attendance records
          </p>
        </div>
        <button className="btn-secondary" onClick={fetchData}>
          <span className="material-icons" style={{ fontSize: '1rem' }}>refresh</span>
          Refresh
        </button>
      </div>

      <div className="hr-table-wrap" style={{ overflowX: 'auto' }}>
        <table className="hr-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map(r => {
              let hours = null
              if (r.check_in_time && r.check_out_time) {
                const ms = new Date(r.check_out_time + 'Z') - new Date(r.check_in_time + 'Z')
                hours = (ms / 3_600_000).toFixed(1)
              }
              return (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap', color: 'rgba(0,0,0,0.7)' }}>
                    {format(new Date(r.date), 'MMM d, yyyy')}
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{r.employee?.full_name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.38)', marginLeft: 6 }}>
                      ({r.employee?.user?.employee_id})
                    </span>
                  </td>
                  <td style={{ color: 'rgba(0,0,0,0.7)' }}>
                    {r.check_in_time ? format(new Date(r.check_in_time + 'Z'), 'hh:mm a') : '—'}
                  </td>
                  <td style={{ color: 'rgba(0,0,0,0.7)' }}>
                    {r.check_out_time ? format(new Date(r.check_out_time + 'Z'), 'hh:mm a') : '—'}
                  </td>
                  <td style={{ color: hours ? 'rgba(0,0,0,0.87)' : 'rgba(0,0,0,0.38)' }}>
                    {hours ? `${hours}h` : '—'}
                  </td>
                  <td>
                    {editingId === r.id ? (
                      <select
                        className="input-field"
                        style={{ padding: '4px 8px', fontSize: '0.8125rem', width: 'auto' }}
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value)}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="half_day">Half Day</option>
                        <option value="leave">Leave</option>
                      </select>
                    ) : (
                      <StatusBadge status={r.status} />
                    )}
                  </td>
                  <td>
                    {editingId === r.id ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setEditingId(null)} className="btn-icon" title="Cancel">
                          <span className="material-icons" style={{ fontSize: '1rem' }}>close</span>
                        </button>
                        <button onClick={() => handleSave(r.id)} className="btn-icon green" title="Save">
                          <span className="material-icons" style={{ fontSize: '1rem' }}>save</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingId(r.id); setEditStatus(r.status) }}
                        className="btn-icon indigo"
                        title="Edit status"
                      >
                        <span className="material-icons" style={{ fontSize: '1rem' }}>edit</span>
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {attendance.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'rgba(0,0,0,0.38)' }}>
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
