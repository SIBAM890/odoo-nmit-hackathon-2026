import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { DollarSign, Edit3, X, Save } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminPayroll() {
  const [payrolls, setPayrolls] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ basic: 0, hra: 0, deductions: 0 })
  const [saving, setSaving] = useState(false)

  // New Payroll Modal
  const [showModal, setShowModal] = useState(false)
  const [newForm, setNewForm] = useState({ employee_id: '', basic: 0, hra: 0, deductions: 0 })

  useEffect(() => {
    fetchData()
  }, [])

  function fetchData() {
    Promise.all([
      api.get('/payroll'),
      api.get('/employees')
    ])
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

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0)

  function startEdit(payroll) {
    setEditingId(payroll.id)
    setForm({ basic: payroll.basic, hra: payroll.hra, deductions: payroll.deductions })
  }

  async function handleSaveEdit(id) {
    setSaving(true)
    try {
      await api.put(`/payroll/${id}`, form)
      toast.success('Payroll updated')
      setEditingId(null)
      fetchData()
    } catch (err) {
      toast.error('Failed to update')
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

  if (loading) return <div className="flex justify-center items-center h-64"><div className="spinner border-t-purple-500" /></div>

  // Find employees who don't have payroll set up yet
  const payrollEmpIds = payrolls.map(p => p.employee_id)
  const availableEmployees = employees.filter(e => !payrollEmpIds.includes(e.id))

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="page-title">Payroll Management</h1>
          <p className="text-slate-400 mt-1">Manage employee salary structures.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary !bg-purple-600 hover:!bg-purple-700">
          <DollarSign size={16} /> Setup Payroll
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="table-header text-xs text-slate-400 uppercase">
                <th className="p-4 font-medium">Employee</th>
                <th className="p-4 font-medium">Basic Pay</th>
                <th className="p-4 font-medium">HRA</th>
                <th className="p-4 font-medium">Deductions</th>
                <th className="p-4 font-medium">Net Salary</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map(p => {
                const isEditing = editingId === p.id
                return (
                  <tr key={p.id} className="table-row">
                    <td className="p-4 text-sm font-medium text-white">{p.employee?.full_name} <span className="text-xs text-slate-500 font-normal">({p.employee?.user?.employee_id})</span></td>
                    
                    <td className="p-4">
                      {isEditing ? <input type="number" className="input-field py-1 px-2 w-24 text-xs" value={form.basic} onChange={e => setForm({...form, basic: Number(e.target.value)})} /> : <span className="text-sm text-slate-300">{formatCurrency(p.basic)}</span>}
                    </td>
                    
                    <td className="p-4">
                      {isEditing ? <input type="number" className="input-field py-1 px-2 w-24 text-xs" value={form.hra} onChange={e => setForm({...form, hra: Number(e.target.value)})} /> : <span className="text-sm text-slate-300">{formatCurrency(p.hra)}</span>}
                    </td>
                    
                    <td className="p-4">
                      {isEditing ? <input type="number" className="input-field py-1 px-2 w-24 text-xs" value={form.deductions} onChange={e => setForm({...form, deductions: Number(e.target.value)})} /> : <span className="text-sm text-red-400">-{formatCurrency(p.deductions)}</span>}
                    </td>
                    
                    <td className="p-4 text-sm font-bold text-emerald-400">
                      {isEditing ? formatCurrency((form.basic || 0) + (form.hra || 0) - (form.deductions || 0)) : formatCurrency(p.net_salary)}
                    </td>
                    
                    <td className="p-4 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingId(null)} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400"><X size={14} /></button>
                          <button onClick={() => handleSaveEdit(p.id)} disabled={saving} className="p-1.5 rounded bg-purple-500/20 hover:bg-purple-500/40 text-purple-400">{saving ? <span className="spinner w-3 h-3" /> : <Save size={14} />}</button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(p)} className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-400">
                          <Edit3 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {payrolls.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400">No payroll structures defined.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Setup New Payroll</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Select Employee</label>
                <select className="input-field" value={newForm.employee_id} onChange={e => setNewForm({...newForm, employee_id: e.target.value})} required>
                  <option value="">-- Choose employee --</option>
                  {availableEmployees.map(e => (
                    <option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>
                  ))}
                </select>
                {availableEmployees.length === 0 && <p className="text-xs text-amber-400 mt-1">All employees already have a payroll set up.</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Basic Pay (₹)</label>
                  <input type="number" className="input-field" value={newForm.basic} onChange={e => setNewForm({...newForm, basic: Number(e.target.value)})} required min="0" />
                </div>
                <div>
                  <label className="label">HRA (₹)</label>
                  <input type="number" className="input-field" value={newForm.hra} onChange={e => setNewForm({...newForm, hra: Number(e.target.value)})} required min="0" />
                </div>
                <div>
                  <label className="label text-red-400">Deductions (₹)</label>
                  <input type="number" className="input-field" value={newForm.deductions} onChange={e => setNewForm({...newForm, deductions: Number(e.target.value)})} required min="0" />
                </div>
                <div>
                  <label className="label text-emerald-400">Net Salary (Calculated)</label>
                  <div className="input-field bg-white/5 flex items-center font-semibold text-emerald-400">
                    {formatCurrency((newForm.basic || 0) + (newForm.hra || 0) - (newForm.deductions || 0))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving || !newForm.employee_id} className="btn-primary !bg-purple-600 hover:!bg-purple-700">
                  {saving ? <span className="spinner w-4 h-4" /> : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
