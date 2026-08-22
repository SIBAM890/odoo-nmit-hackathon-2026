import { useEffect, useState } from 'react'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Clock, Calendar as CalendarIcon, CheckCircle, XCircle } from 'lucide-react'

function StatusBadge({ status }) {
  const map = {
    present: 'badge-success',
    absent: 'badge-error',
    'half-day': 'badge-warning',
    leave: 'badge-info',
  }
  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>
}

export default function EmployeeAttendance() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/attendance/me')
      .then((res) => {
        setRecords(res.data)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load attendance records')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  const presentDays = records.filter(r => r.status === 'present').length
  const absentDays = records.filter(r => r.status === 'absent').length
  const halfDays = records.filter(r => r.status === 'half-day').length

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="page-title">My Attendance</h1>
          <p className="text-slate-400 mt-1">View your daily check-in and check-out history.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <CheckCircle size={32} className="text-emerald-400 mb-2" />
          <p className="text-3xl font-bold text-white">{presentDays}</p>
          <p className="text-sm text-slate-400">Present</p>
        </div>
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <Clock size={32} className="text-amber-400 mb-2" />
          <p className="text-3xl font-bold text-white">{halfDays}</p>
          <p className="text-sm text-slate-400">Half Days</p>
        </div>
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <XCircle size={32} className="text-red-400 mb-2" />
          <p className="text-3xl font-bold text-white">{absentDays}</p>
          <p className="text-sm text-slate-400">Absent</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/10 bg-white/5 flex items-center gap-2">
          <CalendarIcon size={18} className="text-indigo-400" />
          <h3 className="font-semibold text-white">Attendance History</h3>
        </div>
        
        {records.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No attendance records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header text-xs text-slate-400 uppercase">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Check In</th>
                  <th className="p-4 font-medium">Check Out</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="table-row">
                    <td className="p-4 text-sm text-slate-200">
                      {format(new Date(r.date), 'EEE, MMM d, yyyy')}
                    </td>
                    <td className="p-4 text-sm text-slate-300">
                      {r.check_in_time ? format(new Date(r.check_in_time + 'Z'), 'hh:mm a') : '-'}
                    </td>
                    <td className="p-4 text-sm text-slate-300">
                      {r.check_out_time ? format(new Date(r.check_out_time + 'Z'), 'hh:mm a') : '-'}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
