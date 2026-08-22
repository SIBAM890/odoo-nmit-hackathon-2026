import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/employees')
      .then(res => {
        setEmployees(res.data)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load employees')
        setLoading(false)
      })
  }, [])

  const filtered = employees.filter(e =>
    e.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div className="loading-center"><span className="spinner" /><span>Loading employees…</span></div>
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Employees</h1>
          <p style={{ color: 'rgba(0,0,0,0.54)', marginTop: 4, fontSize: '0.875rem' }}>
            {employees.length} employees total
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="hr-filter-bar">
        <div className="hr-search" style={{ flex: '0 0 auto' }}>
          <span className="hr-search-icon material-icons">search</span>
          <input
            type="text"
            className="input-field"
            placeholder="Search Employees"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <button
            className="btn-secondary"
            onClick={() => setSearch('')}
          >
            <span className="material-icons" style={{ fontSize: '1rem' }}>refresh</span>
            Reset
          </button>
        )}
        <div style={{ marginLeft: 'auto', color: 'rgba(0,0,0,0.54)', fontSize: '0.875rem' }}>
          {filtered.length} of {employees.length} employees
        </div>
      </div>

      {/* Table */}
      <div className="hr-table-wrap">
        <table className="hr-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Job Title</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={e.id}>
                <td style={{ color: 'rgba(0,0,0,0.54)', fontWeight: 500 }}>{i + 1}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {e.profile_pic_url ? (
                      <img src={e.profile_pic_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div className="hr-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                        {e.full_name?.[0] || 'E'}
                      </div>
                    )}
                    <Link to={`/admin/employees/${e.id}`} className="hr-table-link">
                      {e.full_name || e.employee_id}
                    </Link>
                  </div>
                </td>
                <td style={{ color: 'rgba(0,0,0,0.7)' }}>{e.email || '—'}</td>
                <td>{e.department || '—'}</td>
                <td>{e.job_title || '—'}</td>
                <td>
                  <span className={`badge ${e.role === 'admin' ? 'badge-indigo' : 'badge-neutral'}`}>
                    {e.role || 'employee'}
                  </span>
                </td>
                <td>
                  <Link to={`/admin/employees/${e.id}`}>
                    <button className="btn-icon indigo" title="View details">
                      <span className="material-icons" style={{ fontSize: '1.1rem' }}>chevron_right</span>
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'rgba(0,0,0,0.38)' }}>
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
