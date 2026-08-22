import { useEffect, useState } from 'react'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Check, X, MessageSquare } from 'lucide-react'

function StatusBadge({ status }) {
  const map = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-error',
  }
  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>
}

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [actionType, setActionType] = useState('') // 'approved' or 'rejected'
  const [adminComment, setAdminComment] = useState('')

  useEffect(() => {
    fetchLeaves()
  }, [])

  function fetchLeaves() {
    api.get('/leaves')
      .then(res => {
        setLeaves(res.data)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load leaves')
        setLoading(false)
      })
  }

  function openActionModal(leave, action) {
    setSelectedLeave(leave)
    setActionType(action)
    setAdminComment('')
    setShowModal(true)
  }

  async function submitAction() {
    setProcessingId(selectedLeave.id)
    try {
      await api.put(`/leaves/${selectedLeave.id}/${actionType}`, {
        admin_comment: adminComment || null
      })
      toast.success(`Leave request ${actionType}`)
      setShowModal(false)
      fetchLeaves()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Action failed')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="spinner border-t-purple-500" /></div>

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl">
      <div>
        <h1 className="page-title">Leave Approvals</h1>
        <p className="text-slate-400 mt-1">Review, approve, or reject employee leave requests.</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header text-xs text-slate-400 uppercase">
                <th className="p-4 font-medium">Employee</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Dates</th>
                <th className="p-4 font-medium">Reason</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id} className="table-row">
                  <td className="p-4 text-sm font-medium text-white">{l.employee?.full_name} <span className="text-xs text-slate-500 font-normal">({l.employee?.user?.employee_id})</span></td>
                  <td className="p-4 text-sm text-slate-300 capitalize">{l.leave_type}</td>
                  <td className="p-4 text-sm text-slate-300 whitespace-nowrap">{format(new Date(l.start_date), 'MMM d, yy')} - {format(new Date(l.end_date), 'MMM d, yy')}</td>
                  <td className="p-4 text-sm text-slate-400 max-w-[200px] truncate" title={l.remarks}>{l.remarks || '-'}</td>
                  <td className="p-4"><StatusBadge status={l.status} /></td>
                  <td className="p-4 text-right">
                    {l.status === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openActionModal(l, 'approved')} className="btn-success !px-2 !py-1 !text-xs"><Check size={14} /> Approve</button>
                        <button onClick={() => openActionModal(l, 'rejected')} className="btn-error !px-2 !py-1 !text-xs"><X size={14} /> Reject</button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400">No leave requests found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box !border-t-4" style={{ borderTopColor: actionType === 'approved' ? '#10b981' : '#ef4444' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-2">
              {actionType === 'approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </h2>
            <p className="text-sm text-slate-400 mb-6">For {selectedLeave?.employee?.full_name}</p>
            
            <div className="space-y-4">
              <div>
                <label className="label flex items-center gap-2"><MessageSquare size={14} /> Comment (Optional)</label>
                <textarea 
                  className="input-field resize-none" 
                  rows="3" 
                  placeholder={actionType === 'approved' ? "e.g., Have a great trip!" : "Reason for rejection..."}
                  value={adminComment}
                  onChange={e => setAdminComment(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={submitAction} disabled={processingId === selectedLeave?.id} className={actionType === 'approved' ? 'btn-success' : 'btn-error'}>
                  {processingId === selectedLeave?.id ? <span className="spinner w-4 h-4" /> : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
