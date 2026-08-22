import { useEffect, useState } from 'react'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { parseTimestamp } from '../../utils/time'

function InfoRow({ icon, label, value }) {
  return (
    <div className="info-row">
      <span className="material-icons" style={{
        fontSize: '1.1rem', color: '#3f51b5',
        flexShrink: 0, marginTop: 2,
      }}>{icon}</span>
      <div>
        <div className="info-label">{label}</div>
        <div className="info-value">
          {value || <span style={{ color: 'rgba(0,0,0,0.38)', fontStyle: 'italic' }}>Not set</span>}
        </div>
      </div>
    </div>
  )
}

export default function EmployeeProfile() {
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ phone: '', address: '', profile_pic_url: '' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/employees/me').then(res => {
      setProfile(res.data)
      setForm({
        phone: res.data.phone || '',
        address: res.data.address || '',
        profile_pic_url: res.data.profile_pic_url || '',
      })
      setLoading(false)
    }).catch(() => {
      toast.error('Failed to load profile')
      setLoading(false)
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await api.put('/employees/me', form)
      setProfile(res.data)
      setEditing(false)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading-center"><span className="spinner" /><span>Loading profile…</span></div>
  }

  const initials = profile.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'ME'

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">My Profile</h1>
        {!editing ? (
          <button className="btn-primary" onClick={() => setEditing(true)}>
            <span className="material-icons" style={{ fontSize: '1rem' }}>edit</span>
            Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={() => { setEditing(false); setForm({ phone: profile.phone || '', address: profile.address || '', profile_pic_url: profile.profile_pic_url || '' }) }}>
              <span className="material-icons" style={{ fontSize: '1rem' }}>close</span>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner spinner-sm" /> : <><span className="material-icons" style={{ fontSize: '1rem' }}>save</span> Save</>}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Avatar Card */}
        <div className="hr-card" style={{ textAlign: 'center', alignSelf: 'start' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: '#3f51b5', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 700,
            margin: '0 auto 16px',
            overflow: 'hidden',
            border: '4px solid #e8eaf6',
          }}>
            {profile.profile_pic_url
              ? <img src={profile.profile_pic_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials
            }
          </div>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(0,0,0,0.87)', marginBottom: 4 }}>
            {profile.full_name}
          </p>
          {profile.job_title && (
            <p style={{ fontSize: '0.875rem', color: '#3f51b5', fontWeight: 500 }}>{profile.job_title}</p>
          )}
          {profile.department && (
            <p style={{ fontSize: '0.8125rem', color: 'rgba(0,0,0,0.54)', marginBottom: 12 }}>{profile.department}</p>
          )}
          <span className="badge badge-success">
            <span className="material-icons" style={{ fontSize: '0.8rem' }}>check_circle</span>
            Active
          </span>
          {profile.date_of_joining && (
            <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.38)', marginTop: 12 }}>
              Joined {profile.date_of_joining ? format(new Date(profile.date_of_joining + 'T00:00:00'), 'MMM d, yyyy')}
            </p>
          )}
        </div>

        {/* Info / Edit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Personal Info */}
          <div className="hr-card">
            <h2 className="section-title" style={{ marginBottom: 12 }}>Personal Information</h2>
            {!editing ? (
              <div>
                <InfoRow icon="email" label="Email" value={profile.email} />
                <InfoRow icon="phone" label="Phone" value={profile.phone} />
                <InfoRow icon="place" label="Address" value={profile.address} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label">Email (read-only)</label>
                  <input type="text" className="input-field" value={profile.email || ''} disabled
                    style={{ background: '#f5f5f5', color: 'rgba(0,0,0,0.38)', cursor: 'not-allowed' }} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" className="input-field" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="label">Address</label>
                  <textarea className="input-field" rows={2} style={{ resize: 'none' }}
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="Your full address"
                  />
                </div>
                <div>
                  <label className="label">Profile Picture URL</label>
                  <input type="url" className="input-field" value={form.profile_pic_url}
                    onChange={e => setForm({ ...form, profile_pic_url: e.target.value })}
                    placeholder="https://example.com/photo.jpg" />
                </div>
              </div>
            )}
          </div>

          {/* Employment Info */}
          <div className="hr-card">
            <h2 className="section-title" style={{ marginBottom: 12 }}>Employment Information</h2>
            <InfoRow icon="badge" label="Employee ID" value={profile.user?.employee_id || profile.employee_id} />
            <InfoRow icon="work" label="Job Title" value={profile.job_title} />
            <InfoRow icon="business" label="Department" value={profile.department} />
            <InfoRow icon="calendar_today" label="Date of Joining" value={profile.date_of_joining
              ? profile.date_of_joining ? format(new Date(profile.date_of_joining + 'T00:00:00'), 'MMMM d, yyyy') : null} />
          </div>
        </div>
      </div>
    </div>
  )
}
