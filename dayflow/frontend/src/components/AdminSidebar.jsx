import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Clock, CalendarCheck, DollarSign,
  LogOut, Zap, Shield
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/employees', icon: Users, label: 'Employees' },
  { to: '/admin/attendance', icon: Clock, label: 'Attendance' },
  { to: '/admin/leaves', icon: CalendarCheck, label: 'Leave Requests' },
  { to: '/admin/payroll', icon: DollarSign, label: 'Payroll' },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">Dayflow</span>
            <p className="text-[10px] text-purple-400 leading-none mt-0.5 font-medium">ADMIN</p>
          </div>
        </div>
      </div>

      {/* Admin badge + user */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            <Shield size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.email}</p>
            <p className="text-xs text-purple-400 truncate">HR Administrator</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4">
        <button onClick={handleLogout} className="nav-item w-full text-red-400 hover:bg-red-500/10 hover:text-red-300">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
