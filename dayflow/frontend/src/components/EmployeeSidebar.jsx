import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, User, Clock, CalendarCheck, DollarSign,
  LogOut, ChevronRight, Zap
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employee/profile', icon: User, label: 'My Profile' },
  { to: '/employee/attendance', icon: Clock, label: 'Attendance' },
  { to: '/employee/leave', icon: CalendarCheck, label: 'Leave' },
  { to: '/employee/payroll', icon: DollarSign, label: 'Payroll' },
]

export default function EmployeeSidebar() {
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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">Dayflow</span>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">HRMS</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold text-sm">
            {user?.email?.[0]?.toUpperCase() || 'E'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.email}</p>
            <p className="text-xs text-slate-500 truncate">{user?.employee_id}</p>
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
