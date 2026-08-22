import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'

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
        full_name, phone, address, job_title, department, date_of_joining, profile_pic_url,
      })
      setEmployee(res.data)
      toast.success('Employee updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading-center"><span className="spinner" /><span>Loading employee…</span></div>
  }

  const initials = employee.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'E'

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Back + Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/admin/employees')}
          className="btn-icon"
          title="Back to employees"
          style={{ border: '1px solid rgba(0,0,0,0.12)' }}
        >
          <span className="material-icons">arrow_back</span>
        </button>
        <div>
          <h1 className="page-title">Edit Employee</h1>
          <p style={{ color: 'rgba(0,0,0,0.54)', fontSize: '0.875rem', marginTop: 2 }}>
            {employee.full_name} ({employee.user?.employee_id || employee.employee_id})
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
        {/* Profile Card */}
        <div className="hr-card" style={{ textAlign: 'center', alignSelf: 'start' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: '#3f51b5', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700,
            margin: '0 auto 16px',
            overflow: 'hidden',
          }}>
            {employee.profile_pic_url
              ? <img src={employee.profile_pic_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials
            }
          </div>
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(0,0,0,0.87)', marginBottom: 4 }}>
            {employee.full_name}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(0,0,0,0.54)', marginBottom: 12 }}>
            {employee.email}
          </p>
          <span className={`badge ${employee.role === 'admin' ? 'badge-indigo' : 'badge-neutral'}`}>
            <span className="material-icons" style={{ fontSize: '0.8rem' }}>shield</span>
            {employee.role || 'employee'}
          </span>
          {employee.job_title && (
            <div style={{ marginTop: 12, fontSize: '0.8125rem', color: 'rgba(0,0,0,0.54)' }}>
              {employee.job_title}
            </div>
          )}
          {employee.department && (
            <div style={{ fontSize: '0.8125rem', color: '#3f51b5', fontWeight: 500 }}>
              {employee.department}
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="hr-card">
          <h2 className="section-title" style={{ marginBottom: 20 }}>Employee Information</h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="label">Full Name</label>
                <input type="text" className="input-field" value={form.full_name || ''}
                  onChange={e => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input type="tel" className="input-field" value={form.phone || ''}
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="label">Job Title</label>
                <input type="text" className="input-field" value={form.job_title || ''}
                  onChange={e => setForm({ ...form, job_title: e.target.value })} />
              </div>
              <div>
                <label className="label">Department</label>
                <input type="text" className="input-field" value={form.department || ''}
                  onChange={e => setForm({ ...form, department: e.target.value })} />
              </div>
              <div>
                <label className="label">Date of Joining</label>
                <input type="date" className="input-field" value={form.date_of_joining || ''}
                  onChange={e => setForm({ ...form, date_of_joining: e.target.value })} />
              </div>
              <div>
                <label className="label">Profile Pic URL</label>
                <input type="url" className="input-field" value={form.profile_pic_url || ''}
                  onChange={e => setForm({ ...form, profile_pic_url: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Address</label>
              <textarea className="input-field" rows={2} style={{ resize: 'none' }}
                value={form.address || ''}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div style={{ paddingTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" className="btn-secondary" onClick={() => setForm(employee)}>
                Reset
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving
                  ? <span className="spinner spinner-sm" />
                  : <><span className="material-icons" style={{ fontSize: '1rem' }}>save</span> Save Changes</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
