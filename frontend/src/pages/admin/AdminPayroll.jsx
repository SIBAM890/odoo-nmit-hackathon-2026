import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { parseTimestamp } from '../../utils/time'

export default function AdminPayroll() {
  const [payrolls, setPayrolls] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ basic: 0, hra: 0, deductions: 0 })
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [newForm, setNewForm] = useState({ employee_id: '', basic: 0, hra: 0, deductions: 0 })

  useEffect(() => { fetchData() }, [])

  function fetchData() {
    Promise.all([api.get('/payroll'), api.get('/employees')])
      .then(([pRes, eRes]) => {
        setPayrolls(pRes.data)
        setEmployees(eRes.data)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load payroll data')
        setLoading(false)
      })
  }

  const fmt = val =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0)

  function startEdit(p) {
    setEditingId(p.id)
    setForm({ basic: p.basic, hra: p.hra, deductions: p.deductions })
  }

  async function handleSaveEdit(id) {
    setSaving(true)
    try {
      await api.put(`/payroll/${id}`, form)
      toast.success('Payroll updated')
      setEditingId(null)
      fetchData()
    } catch {
      toast.error('Failed to update payroll')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/payroll', newForm)
      toast.success('Payroll created')
      setShowModal(false)
      setNewForm({ employee_id: '', basic: 0, hra: 0, deductions: 0 })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Creation failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading-center"><span className="spinner" /><span>Loading payroll…</span></div>
  }

  const payrollEmpIds = payrolls.map(p => p.employee_id)
  const availableEmployees = employees.filter(e => !payrollEmpIds.includes(e.id))

  const totalNetSalary = payrolls.reduce((s, p) => s + (p.net_salary || 0), 0)

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Payroll Management</h1>
          <p style={{ color: 'rgba(0,0,0,0.54)', marginTop: 4, fontSize: '0.875rem' }}>
            Total Monthly Payroll: <strong style={{ color: '#4caf50' }}>{fmt(totalNetSalary)}</strong>
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <span className="material-icons" style={{ fontSize: '1rem' }}>add</span>
          Setup Payroll
        </button>
      </div>

      <div className="hr-table-wrap" style={{ overflowX: 'auto' }}>
        <table className="hr-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Basic Pay</th>
              <th>HRA</th>
              <th>Deductions</th>
              <th>Net Salary</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map(p => {
              const isEditing = editingId === p.id
              return (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontWeight: 500 }}>{p.employee?.full_name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.38)', marginLeft: 6 }}>
                      ({p.employee?.user?.employee_id})
                    </span>
                  </td>
                  <td>
                    {isEditing
                      ? <input type="number" className="input-field" style={{ padding: '4px 8px', width: 100, fontSize: '0.8125rem' }}
                          value={form.basic} onChange={e => setForm({ ...form, basic: Number(e.target.value) })} />
                      : <span style={{ color: 'rgba(0,0,0,0.7)' }}>{fmt(p.basic)}</span>
                    }
                  </td>
                  <td>
                    {isEditing
                      ? <input type="number" className="input-field" style={{ padding: '4px 8px', width: 90, fontSize: '0.8125rem' }}
                          value={form.hra} onChange={e => setForm({ ...form, hra: Number(e.target.value) })} />
                      : <span style={{ color: 'rgba(0,0,0,0.7)' }}>{fmt(p.hra)}</span>
                    }
                  </td>
                  <td>
                    {isEditing
                      ? <input type="number" className="input-field" style={{ padding: '4px 8px', width: 90, fontSize: '0.8125rem' }}
                          value={form.deductions} onChange={e => setForm({ ...form, deductions: Number(e.target.value) })} />
                      : <span style={{ color: '#f44336' }}>-{fmt(p.deductions)}</span>
                    }
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#4caf50' }}>
                      {isEditing
                        ? fmt((form.basic || 0) + (form.hra || 0) - (form.deductions || 0))
                        : fmt(p.net_salary)
                      }
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'rgba(0,0,0,0.38)' }}>
                    {p.updated_at
                      ? format(parseTimestamp(p.updated_at) || new Date(p.updated_at + 'T00:00:00'), 'MMM d, yyyy')
                      : '—'}
                  </td>
                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => setEditingId(null)} className="btn-icon" title="Cancel">
                          <span className="material-icons" style={{ fontSize: '1rem' }}>close</span>
                        </button>
                        <button onClick={() => handleSaveEdit(p.id)} disabled={saving} className="btn-icon green" title="Save">
                          {saving ? <span className="spinner spinner-sm" /> : <span className="material-icons" style={{ fontSize: '1rem' }}>save</span>}
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(p)} className="btn-icon indigo" title="Edit payroll">
                        <span className="material-icons" style={{ fontSize: '1rem' }}>edit</span>
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {payrolls.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'rgba(0,0,0,0.38)' }}>
                  No payroll structures defined.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Payroll Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="modal-title" style={{ margin: 0 }}>Setup New Payroll</h2>
              <button onClick={() => setShowModal(false)} className="btn-icon" title="Close">
                <span className="material-icons">close</span>
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Select Employee</label>
                <select
                  className="input-field"
                  value={newForm.employee_id}
                  onChange={e => setNewForm({ ...newForm, employee_id: e.target.value })}
                  required
                >
                  <option value="">— Choose employee —</option>
                  {availableEmployees.map(e => (
                    <option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>
                  ))}
                </select>
                {availableEmployees.length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: '#ff9800', marginTop: 4 }}>
                    All employees already have payroll configured.
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="label">Basic Pay (₹)</label>
                  <input type="number" className="input-field" min={0}
                    value={newForm.basic} onChange={e => setNewForm({ ...newForm, basic: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="label">HRA (₹)</label>
                  <input type="number" className="input-field" min={0}
                    value={newForm.hra} onChange={e => setNewForm({ ...newForm, hra: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="label" style={{ color: '#f44336' }}>Deductions (₹)</label>
                  <input type="number" className="input-field" min={0}
                    value={newForm.deductions} onChange={e => setNewForm({ ...newForm, deductions: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="label" style={{ color: '#4caf50' }}>Net Salary (Calculated)</label>
                  <div className="input-field" style={{
                    background: '#f1f8e9', border: '1px solid #a5d6a7',
                    color: '#2e7d32', fontWeight: 600, display: 'flex', alignItems: 'center',
                  }}>
                    {fmt((newForm.basic || 0) + (newForm.hra || 0) - (newForm.deductions || 0))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving || !newForm.employee_id}>
                  {saving ? <span className="spinner spinner-sm" /> : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
