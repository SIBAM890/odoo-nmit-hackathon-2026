import { useEffect, useState } from 'react'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { parseTimestamp } from '../../utils/time'

export default function EmployeePayroll() {
  const [payroll, setPayroll] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/payroll/me')
      .then(res => {
        setPayroll(res.data)
        setLoading(false)
      })
      .catch(err => {
        if (err.response?.status !== 404) {
          toast.error('Failed to load payroll data')
        }
        setLoading(false)
      })
  }, [])

  const fmt = val =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0)

  if (loading) {
    return <div className="loading-center"><span className="spinner" /><span>Loading payroll…</span></div>
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 className="page-title">My Payroll</h1>

      {!payroll ? (
        <div className="hr-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: '#e8eaf6',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <span className="material-icons" style={{ color: '#3f51b5', fontSize: '2rem' }}>attach_money</span>
          </div>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: 'rgba(0,0,0,0.54)' }}>
            No payroll record found
          </p>
          <p style={{ fontSize: '0.875rem', color: 'rgba(0,0,0,0.38)', marginTop: 4 }}>
            Your HR administrator has not set up your payroll yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          {/* Main Payroll Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Net Salary Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #3f51b5, #5c6bc0)',
              borderRadius: 4,
              padding: 24,
              color: 'white',
              boxShadow: '0 4px 12px rgba(63,81,181,0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', opacity: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>
                  Net Payable Salary
                </p>
                <p style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>
                  {fmt(payroll.net_salary)}
                  <span style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.7, marginLeft: 8 }}>/ month</span>
                </p>
              </div>
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="material-icons" style={{ fontSize: '1.75rem' }}>account_balance_wallet</span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="hr-card">
              <h2 className="section-title" style={{ marginBottom: 16 }}>Salary Breakdown</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* Basic Pay */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.08)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4caf50' }} />
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Basic Pay</p>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.38)' }}>Base compensation</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 600, color: '#4caf50', fontSize: '1rem' }}>{fmt(payroll.basic)}</span>
                </div>

                {/* HRA */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.08)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2196f3' }} />
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.9375rem' }}>House Rent Allowance (HRA)</p>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.38)' }}>Accommodation benefit</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 600, color: '#2196f3', fontSize: '1rem' }}>{fmt(payroll.hra)}</span>
                </div>

                {/* Deductions */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0', borderBottom: '1px solid rgba(0,0,0,0.08)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f44336' }} />
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '0.9375rem' }}>Deductions</p>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.38)' }}>Tax, PF, and other cuts</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 600, color: '#f44336', fontSize: '1rem' }}>-{fmt(payroll.deductions)}</span>
                </div>

                {/* Net */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0',
                  background: '#f1f8e9', margin: '8px -24px -24px', padding: '16px 24px',
                }}>
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>Net Salary</span>
                  <span style={{ fontWeight: 700, color: '#2e7d32', fontSize: '1.25rem' }}>
                    {fmt(payroll.net_salary)}
                  </span>
                </div>
              </div>
            </div>

            {payroll.updated_at && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: '0.8125rem', color: 'rgba(0,0,0,0.38)',
              }}>
                <span className="material-icons" style={{ fontSize: '0.9rem', color: '#4caf50' }}>check_circle</span>
                Last updated by HR on {payroll.updated_at ? format(parseTimestamp(payroll.updated_at) || new Date(payroll.updated_at + 'T00:00:00'), 'MMMM d, yyyy') : '—'}
              </div>
            )}
          </div>

          {/* Payslips Column */}
          <div className="hr-card" style={{ alignSelf: 'start' }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>Recent Payslips</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[0, 1, 2].map(i => {
                const d = new Date()
                d.setMonth(d.getMonth() - i - 1)
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px',
                    border: '1px solid rgba(0,0,0,0.12)', borderRadius: 4,
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="material-icons" style={{ color: '#3f51b5', fontSize: '1.25rem' }}>description</span>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{format(d, 'MMMM yyyy')}</p>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.54)' }}>{fmt(payroll.net_salary)}</p>
                      </div>
                    </div>
                    <span className="material-icons" style={{ color: 'rgba(0,0,0,0.38)', fontSize: '1.1rem' }}>
                      download
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
