import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Shield } from 'lucide-react'

export default function AdminEmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    api.get(`/employees/${id}`)
      .then(res => {
        setEmployee(res.data)
        setForm(res.data)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Employee not found')
        navigate('/admin/employees')
      })
  }, [id, navigate])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { full_name, phone, address, job_title, department, date_of_joining, profile_pic_url } = form
      const res = await api.put(`/employees/${id}`, {
        full_name, phone, address, job_title, department, date_of_joining, profile_pic_url
      })
      setEmployee(res.data)
      toast.success('Employee updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="spinner border-t-purple-500" /></div>

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/employees')} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="page-title">Edit Employee</h1>
          <p className="text-slate-400 mt-1">{employee.full_name} ({employee.employee_id})</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-3xl mb-4 overflow-hidden">
            {employee.profile_pic_url ? <img src={employee.profile_pic_url} alt="" className="w-full h-full object-cover" /> : employee.full_name?.[0]}
          </div>
          <p className="text-sm font-medium text-slate-200">{employee.email}</p>
          <div className="mt-3 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-400 font-medium flex items-center gap-1">
            <Shield size={12} /> {employee.role}
          </div>
        </div>

        <div className="col-span-2 glass-card p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input type="text" className="input-field" value={form.full_name || ''} onChange={e => setForm({...form, full_name: e.target.value})} required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input type="tel" className="input-field" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div>
                <label className="label">Job Title</label>
                <input type="text" className="input-field" value={form.job_title || ''} onChange={e => setForm({...form, job_title: e.target.value})} />
              </div>
              <div>
                <label className="label">Department</label>
                <input type="text" className="input-field" value={form.department || ''} onChange={e => setForm({...form, department: e.target.value})} />
              </div>
              <div>
                <label className="label">Date of Joining</label>
                <input type="date" className="input-field" value={form.date_of_joining || ''} onChange={e => setForm({...form, date_of_joining: e.target.value})} />
              </div>
              <div>
                <label className="label">Profile Pic URL</label>
                <input type="url" className="input-field" value={form.profile_pic_url || ''} onChange={e => setForm({...form, profile_pic_url: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="label">Address</label>
              <textarea className="input-field resize-none" rows="2" value={form.address || ''} onChange={e => setForm({...form, address: e.target.value})} />
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary !bg-purple-600 hover:!bg-purple-700">
                {saving ? <span className="spinner w-4 h-4" /> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
