import { useEffect, useState } from 'react'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { parseTimestamp } from '../../utils/time'

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
    remarks: '',
  })

  useEffect(() => { fetchLeaves() }, [])

  function fetchLeaves() {
    api.get('/leaves/me')
      .then(res => {
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
    return <div className="loading-center"><span className="spinner" /><span>Loading leaves…</span></div>
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">My Leaves</h1>
          <p style={{ color: 'rgba(0,0,0,0.54)', marginTop: 4, fontSize: '0.875rem' }}>
            Manage your leave requests and check their status
          </p>
        </div>
        <button className="btn-accent" onClick={() => setShowModal(true)}>
          <span className="material-icons" style={{ fontSize: '1rem' }}>add</span>
          Apply for Leave
        </button>
      </div>

      {leaves.length === 0 ? (
        <div className="hr-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span className="material-icons" style={{ color: '#3f51b5', fontSize: '2rem' }}>event_available</span>
          </div>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(0,0,0,0.54)' }}>
            No leave requests yet
          </p>
          <p style={{ fontSize: '0.875rem', color: 'rgba(0,0,0,0.38)', marginTop: 4 }}>
            Click the button above to apply for leave.
          </p>
        </div>
      ) : (
        <div className="hr-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="hr-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Admin Comment</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => {
                const days = Math.round(
                  (new Date(l.end_date + 'T00:00:00') - new Date(l.start_date + 'T00:00:00')) / 86_400_000
                ) + 1
                return (
                  <tr key={l.id}>
                    <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>{l.leave_type}</td>
                    <td style={{ color: 'rgba(0,0,0,0.7)' }}>{format(new Date(l.start_date + 'T00:00:00'), 'MMM d, yyyy')}</td>
                    <td style={{ color: 'rgba(0,0,0,0.7)' }}>{format(new Date(l.end_date + 'T00:00:00'), 'MMM d, yyyy')}</td>
                    <td style={{ color: 'rgba(0,0,0,0.7)' }}>{days}d</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td>
                      <span
                        title={l.remarks}
                        style={{
                          display: 'block', maxWidth: 180, overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          color: 'rgba(0,0,0,0.54)', fontSize: '0.8125rem',
                        }}
                      >
                        {l.remarks || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        color: l.admin_comment ? '#4caf50' : 'rgba(0,0,0,0.38)',
                        fontSize: '0.8125rem',
                        maxWidth: 160, display: 'block', overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }} title={l.admin_comment}>
                        {l.admin_comment || '—'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="modal-title" style={{ margin: 0 }}>Apply for Leave</h2>
              <button onClick={() => setShowModal(false)} className="btn-icon">
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Leave Type</label>
                <select
                  className="input-field"
                  value={form.leave_type}
                  onChange={e => setForm({ ...form, leave_type: e.target.value })}
                  required
                >
                  <option value="paid">Paid Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.end_date}
                    min={form.start_date}
                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Remarks (Optional)</label>
                <textarea
                  className="input-field"
                  rows={3}
                  style={{ resize: 'none' }}
                  placeholder="Reason for leave..."
                  value={form.remarks}
                  onChange={e => setForm({ ...form, remarks: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <span className="spinner spinner-sm" /> : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
