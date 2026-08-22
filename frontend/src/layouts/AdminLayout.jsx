import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import {
  LayoutDashboard, Users, Clock, CalendarCheck, DollarSign,
  LogOut, ChevronDown, UserCircle2
} from 'lucide-react'

const NAV = [
  { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Home' },
  { to: '/admin/employees',  icon: Users,            label: 'Employees' },
  { to: '/admin/attendance', icon: Clock,            label: 'Attendance' },
  { to: '/admin/leaves',     icon: CalendarCheck,    label: 'Leaves' },
  { to: '/admin/payroll',    icon: DollarSign,       label: 'Payroll' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ── Top Navbar ── */}
      <header style={{
        background: 'linear-gradient(135deg, #3949ab 0%, #3f51b5 60%, #5c6bc0 100%)',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        gap: 0,
      }}>
        {/* Brand */}
        <div
          onClick={() => navigate('/admin/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            marginRight: 32,
            userSelect: 'none',
            flexShrink: 0,
          }}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}>
            <Users size={17} color="white" />
          </div>
          <span style={{
            color: 'white',
            fontWeight: 700,
            fontSize: '0.9375rem',
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
          }}>
            HR Management
          </span>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 14px',
                borderRadius: 8,
                color: isActive ? 'white' : 'rgba(255,255,255,0.72)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                textDecoration: 'none',
                background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
                border: isActive ? '1px solid rgba(255,255,255,0.25)' : '1px solid transparent',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                position: 'relative',
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.style.background.includes('0.18')) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = 'white'
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.className.includes('active')) {
                  const isActive = e.currentTarget.getAttribute('aria-current') === 'page'
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.72)'
                  }
                }
              }}
            >
              <Icon size={15} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User Menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px 6px 8px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'white',
              flexShrink: 0,
            }}>
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.employee_id || user?.email?.split('@')[0]}
            </span>
            <ChevronDown size={13} style={{ opacity: 0.8 }} />
          </button>

          {menuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={() => setMenuOpen(false)} />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: 'white',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                minWidth: 200,
                zIndex: 101,
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.08)',
              }}>
                {/* User info header */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(0,0,0,0.08)',
                  background: '#f8f9ff',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', background: '#3f51b5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
                    }}>
                      {user?.email?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(0,0,0,0.87)' }}>
                        {user?.employee_id || 'Admin'}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.54)', marginTop: 1 }}>
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span className="badge badge-indigo">Admin</span>
                  </div>
                </div>
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', color: '#f44336',
                    fontSize: '0.875rem', cursor: 'pointer',
                    background: 'transparent', border: 'none', width: '100%',
                    textAlign: 'left', transition: 'background 0.15s', fontWeight: 500,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="hr-main">
        <div className="hr-page-container">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
