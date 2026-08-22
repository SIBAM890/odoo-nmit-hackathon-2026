import { useEffect, useState } from 'react'
import api from '../../services/api'
import { User, Phone, MapPin, Briefcase, Building2, Calendar, Camera, Save, Edit3, X } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 py-3.5 border-b border-white/5 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} className="text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm text-slate-200">{value || <span className="text-slate-600 italic">Not set</span>}</p>
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
    api.get('/employees/me').then((res) => {
      setProfile(res.data)
      setForm({ phone: res.data.phone || '', address: res.data.address || '', profile_pic_url: res.data.profile_pic_url || '' })
      setLoading(false)
    }).catch(() => { toast.error('Failed to load profile'); setLoading(false) })
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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  )

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="page-title">My Profile</h1>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn-secondary">
            <Edit3 size={16} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn-secondary">
              <X size={16} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? <span className="spinner" /> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Avatar + identity */}
        <div className="glass-card p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            {profile?.profile_pic_url ? (
              <img
                src={profile.profile_pic_url}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold">
                {profile?.full_name?.[0] || '?'}
              </div>
            )}
          </div>
          <h2 className="text-lg font-semibold text-white">{profile?.full_name}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{profile?.job_title || 'Employee'}</p>
          <div className="mt-3 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-medium">
            {profile?.employee_id}
          </div>
          <div className={`mt-2 px-3 py-1.5 rounded-full text-xs font-medium ${profile?.is_verified ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'}`}>
            {profile?.is_verified ? '✓ Verified' : '⚠ Unverified'}
          </div>
          {editing && (
            <div className="mt-4 w-full">
              <label className="label text-left">Profile Picture URL</label>
              <input
                type="url"
                className="input-field text-xs"
                placeholder="https://..."
                value={form.profile_pic_url}
                onChange={(e) => setForm({ ...form, profile_pic_url: e.target.value })}
              />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="col-span-2 space-y-4">
          <div className="glass-card p-6">
            <h3 className="section-title mb-4">Personal Information</h3>
            {!editing ? (
              <>
                <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
                <InfoRow icon={MapPin} label="Address" value={profile?.address} />
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="+91-9000000000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Address</label>
                  <textarea
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Your address..."
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="section-title mb-4">Job Information <span className="text-xs text-slate-600 font-normal ml-2">(read-only)</span></h3>
            <InfoRow icon={Briefcase} label="Job Title" value={profile?.job_title} />
            <InfoRow icon={Building2} label="Department" value={profile?.department} />
            <InfoRow icon={Calendar} label="Date of Joining" value={profile?.date_of_joining ? format(new Date(profile.date_of_joining), 'MMMM d, yyyy') : null} />
          </div>

          <div className="glass-card p-6">
            <h3 className="section-title mb-4">Account</h3>
            <InfoRow icon={User} label="Email" value={profile?.email} />
            <InfoRow icon={User} label="Employee ID" value={profile?.employee_id} />
          </div>
        </div>
      </div>
    </div>
  )
}
