import { useEffect, useState } from 'react'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Edit2, X, Save } from 'lucide-react'

function StatusBadge({ status }) {
  const map = {
    present: 'badge-success',
    absent: 'badge-error',
    'half-day': 'badge-warning',
    leave: 'badge-info',
  }
  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>
}

export default function AdminAttendance() {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editStatus, setEditStatus] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

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
    } catch (err) {
      toast.error('Update failed')
    }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="spinner border-t-purple-500" /></div>

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl">
      <div>
        <h1 className="page-title">Attendance Oversight</h1>
        <p className="text-slate-400 mt-1">Monitor and correct employee attendance records.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header text-xs text-slate-400 uppercase">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Employee</th>
                <th className="p-4 font-medium">Check In</th>
                <th className="p-4 font-medium">Check Out</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(r => (
                <tr key={r.id} className="table-row">
                  <td className="p-4 text-sm text-slate-300">{format(new Date(r.date), 'MMM d, yyyy')}</td>
                  <td className="p-4 text-sm font-medium text-white">{r.employee_name} <span className="text-xs text-slate-500 font-normal">({r.employee_code})</span></td>
                  <td className="p-4 text-sm text-slate-300">{r.check_in_time ? format(new Date(r.check_in_time + 'Z'), 'hh:mm a') : '-'}</td>
                  <td className="p-4 text-sm text-slate-300">{r.check_out_time ? format(new Date(r.check_out_time + 'Z'), 'hh:mm a') : '-'}</td>
                  <td className="p-4">
                    {editingId === r.id ? (
                      <select className="input-field py-1 px-2 text-xs" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="half-day">Half Day</option>
                        <option value="leave">Leave</option>
                      </select>
                    ) : (
                      <StatusBadge status={r.status} />
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {editingId === r.id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingId(null)} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400"><X size={14} /></button>
                        <button onClick={() => handleSave(r.id)} className="p-1.5 rounded bg-purple-500/20 hover:bg-purple-500/40 text-purple-400"><Save size={14} /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingId(r.id); setEditStatus(r.status); }} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400">
                        <Edit2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {attendance.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400">No attendance records.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
