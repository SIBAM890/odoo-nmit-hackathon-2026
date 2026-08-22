import { useEffect, useState } from 'react'
import api from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { DollarSign, FileText, ArrowDownToLine, CheckCircle2 } from 'lucide-react'

export default function EmployeePayroll() {
  const [payroll, setPayroll] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/payroll/me')
      .then((res) => {
        setPayroll(res.data)
        setLoading(false)
      })
      .catch((err) => {
        if (err.response?.status !== 404) {
          toast.error('Failed to load payroll data')
        }
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0)
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="page-title">My Payroll</h1>
          <p className="text-slate-400 mt-1">View your current salary structure and recent payslips.</p>
        </div>
      </div>

      {!payroll ? (
        <div className="glass-card p-12 text-center text-slate-400 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <DollarSign size={24} className="text-slate-500" />
          </div>
          <p className="text-lg font-medium text-slate-300">No payroll record found</p>
          <p className="text-sm mt-1">Your HR administrator has not set up your payroll yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 to-transparent flex justify-between items-center">
                <div>
                  <p className="text-sm text-indigo-400 font-semibold uppercase tracking-wider mb-1">Net Payable Salary</p>
                  <p className="text-4xl font-bold text-white">{formatCurrency(payroll.net_salary)} <span className="text-lg text-slate-500 font-normal">/ month</span></p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <DollarSign size={24} className="text-indigo-400" />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Salary Breakdown</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-slate-300">Basic Pay</span>
                    </div>
                    <span className="font-medium text-white">{formatCurrency(payroll.basic)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="text-slate-300">House Rent Allowance (HRA)</span>
                    </div>
                    <span className="font-medium text-white">{formatCurrency(payroll.hra)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-slate-300">Deductions (Tax, PF, etc.)</span>
                    </div>
                    <span className="font-medium text-red-400">-{formatCurrency(payroll.deductions)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-white/5 bg-white/5 flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 size={14} className="text-emerald-400" />
                Last updated by HR on {format(new Date(payroll.updated_at + 'Z'), 'MMMM d, yyyy')}
              </div>
            </div>
          </div>

          <div className="col-span-1">
            <div className="glass-card p-6 h-full">
              <h3 className="section-title mb-4">Recent Payslips</h3>
              
              <div className="space-y-3">
                {/* Mock recent payslips for the UI */}
                {[0, 1, 2].map((i) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - i - 1);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{format(d, 'MMMM yyyy')}</p>
                          <p className="text-xs text-slate-500">{formatCurrency(payroll.net_salary)}</p>
                        </div>
                      </div>
                      <button className="text-slate-500 hover:text-white transition-colors" title="Download PDF">
                        <ArrowDownToLine size={16} />
                      </button>
                    </div>
                  )
                })}
              </div>
              
              <button className="w-full mt-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                View All Payslips
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
