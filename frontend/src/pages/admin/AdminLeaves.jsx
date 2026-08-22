import { useEffect, useState } from 'react'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

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
  const [showModal, setShowModal] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState(null)
  const [actionType, setActionType] = useState('')
  const [adminComment, setAdminComment] = useState('')

  useEffect(() => { fetchLeaves() }, [])

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
        admin_comment: adminComment || null,
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

  if (loading) {
    return <div className="loading-center"><span className="spinner" /><span>Loading leave requests…</span></div>
  }

  const pending = leaves.filter(l => l.status === 'pending').length

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Leave Approvals</h1>
          <p style={{ color: 'rgba(0,0,0,0.54)', marginTop: 4, fontSize: '0.875rem' }}>
            {pending} pending request{pending !== 1 ? 's' : ''} · {leaves.length} total
          </p>
        </div>
      </div>

      <div className="hr-table-wrap" style={{ overflowX: 'auto' }}>
        <table className="hr-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map(l => {
              const days = Math.round(
                (new Date(l.end_date) - new Date(l.start_date)) / 86_400_000
              ) + 1
              return (
                <tr key={l.id}>
                  <td>
                    <span style={{ fontWeight: 500 }}>{l.employee?.full_name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.38)', marginLeft: 6 }}>
                      ({l.employee?.user?.employee_id})
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize', color: 'rgba(0,0,0,0.7)' }}>{l.leave_type}</td>
                  <td style={{ whiteSpace: 'nowrap', color: 'rgba(0,0,0,0.7)' }}>
                    {format(new Date(l.start_date), 'MMM d')} – {format(new Date(l.end_date), 'MMM d, yy')}
                  </td>
                  <td style={{ color: 'rgba(0,0,0,0.7)' }}>{days}d</td>
                  <td style={{ maxWidth: 180 }}>
                    <span
                      title={l.remarks}
                      style={{
                        display: 'block', overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', color: 'rgba(0,0,0,0.54)', fontSize: '0.8125rem',
                      }}
                    >
                      {l.remarks || '—'}
                    </span>
                    {l.admin_comment && (
                      <span style={{ fontSize: '0.75rem', color: '#4caf50', display: 'block' }}>
                        Note: {l.admin_comment}
                      </span>
                    )}
                  </td>
                  <td><StatusBadge status={l.status} /></td>
                  <td>
                    {l.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => openActionModal(l, 'approve')}
                          className="btn-success"
                          style={{ padding: '0 10px', height: 28, fontSize: '0.75rem' }}
                        >
                          <span className="material-icons" style={{ fontSize: '0.9rem' }}>check</span>
                          Approve
                        </button>
                        <button
                          onClick={() => openActionModal(l, 'reject')}
                          className="btn-danger"
                          style={{ padding: '0 10px', height: 28, fontSize: '0.75rem' }}
                        >
                          <span className="material-icons" style={{ fontSize: '0.9rem' }}>close</span>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8125rem', color: 'rgba(0,0,0,0.38)' }}>Processed</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {leaves.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'rgba(0,0,0,0.38)' }}>
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-box"
            style={{ borderTop: `4px solid ${actionType === 'approve' ? '#4caf50' : '#f44336'}` }}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="modal-title">
              {actionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'rgba(0,0,0,0.54)', marginBottom: 20 }}>
              For {selectedLeave?.employee?.full_name}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">
                  <span className="material-icons" style={{ fontSize: '0.875rem', verticalAlign: 'middle', marginRight: 4 }}>chat</span>
                  Admin Comment (Optional)
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  style={{ resize: 'none' }}
                  placeholder={actionType === 'approve' ? 'e.g., Approved. Enjoy your time off!' : 'Reason for rejection…'}
                  value={adminComment}
                  onChange={e => setAdminComment(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
                <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button
                  onClick={submitAction}
                  disabled={processingId === selectedLeave?.id}
                  className={actionType === 'approve' ? 'btn-success' : 'btn-danger'}
                >
                  {processingId === selectedLeave?.id
                    ? <span className="spinner spinner-sm" />
                    : 'Confirm'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
