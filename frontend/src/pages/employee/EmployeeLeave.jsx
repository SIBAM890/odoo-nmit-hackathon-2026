import { useEffect, useState } from 'react'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Plus, Check, X, Clock } from 'lucide-react'

function StatusBadge({ status }) {
  const map = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-error',
  }
  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>
}

export default function EmployeeLeave() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [form, setForm] = useState({
    leave_type: 'paid',
    start_date: '',
    end_date: '',
    remarks: ''
  })

  useEffect(() => {
    fetchLeaves()
  }, [])

  function fetchLeaves() {
    api.get('/leaves/me')
      .then((res) => {
        setLeaves(res.data)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load leave requests')
        setLoading(false)
      })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/leaves', form)
      toast.success('Leave request submitted successfully')
      setShowModal(false)
      setForm({ leave_type: 'paid', start_date: '', end_date: '', remarks: '' })
      fetchLeaves()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="page-title">My Leaves</h1>
          <p className="text-slate-400 mt-1">Manage your leave requests and check their status.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> Apply for Leave
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        {leaves.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <CalendarIcon size={24} className="text-slate-500" />
            </div>
            <p>You haven't requested any leaves yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="table-header text-xs text-slate-400 uppercase">
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Duration</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Remarks</th>
                  <th className="p-4 font-medium">Admin Comment</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr key={l.id} className="table-row">
                    <td className="p-4 text-sm font-medium text-slate-200 capitalize">
                      {l.leave_type}
                    </td>
                    <td className="p-4 text-sm text-slate-300">
                      {format(new Date(l.start_date), 'MMM d, yy')} - {format(new Date(l.end_date), 'MMM d, yy')}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="p-4 text-sm text-slate-400 max-w-[200px] truncate">
                      {l.remarks || '-'}
                    </td>
                    <td className="p-4 text-sm text-slate-400 max-w-[200px] truncate">
                      {l.admin_comment || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Apply for Leave</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Leave Type</label>
                <select 
                  className="input-field"
                  value={form.leave_type}
                  onChange={e => setForm({...form, leave_type: e.target.value})}
                  required
                >
                  <option value="paid">Paid Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date</label>
                  <input 
                    type="date" 
                    className="input-field"
                    value={form.start_date}
                    onChange={e => setForm({...form, start_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input 
                    type="date" 
                    className="input-field"
                    value={form.end_date}
                    onChange={e => setForm({...form, end_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Remarks (Optional)</label>
                <textarea 
                  className="input-field resize-none" 
                  rows="3"
                  placeholder="Reason for leave..."
                  value={form.remarks}
                  onChange={e => setForm({...form, remarks: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? <span className="spinner border-t-transparent w-4 h-4" /> : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function CalendarIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
