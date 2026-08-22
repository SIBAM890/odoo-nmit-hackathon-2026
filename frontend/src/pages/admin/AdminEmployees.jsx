import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Search, ChevronRight, User } from 'lucide-react'

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/employees')
      .then((res) => {
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

  if (loading) return <div className="flex justify-center items-center h-64"><div className="spinner border-t-purple-500" /></div>

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="page-title">Manage Employees</h1>
          <p className="text-slate-400 mt-1">View and manage all employee profiles.</p>
        </div>
        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search employees..." 
            className="input-field pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="table-header text-xs text-slate-400 uppercase">
              <th className="p-4 font-medium">Employee</th>
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Department</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="table-row group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {e.profile_pic_url ? (
                      <img src={e.profile_pic_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                        {e.full_name?.[0] || 'E'}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{e.full_name}</p>
                      <p className="text-xs text-slate-500">{e.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-300 font-medium">{e.employee_id}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${e.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-500/10 text-slate-400'}`}>
                    {e.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-300">{e.department || '-'}</td>
                <td className="p-4 text-right">
                  <Link to={`/admin/employees/${e.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-purple-500/20 text-slate-400 hover:text-purple-400 transition-colors">
                    <ChevronRight size={16} />
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400">No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
