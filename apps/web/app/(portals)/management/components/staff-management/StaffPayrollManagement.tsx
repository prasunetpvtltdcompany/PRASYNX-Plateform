'use client';

import { useState } from 'react';
import { useApi } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { useLanguage } from '../../language/LanguageProvider';
import { motion } from 'framer-motion';
import {
  DollarSign, Users, CalendarCheck, Download, Edit3, X, CreditCard,
  TrendingUp, PiggyBank, Percent, ArrowUpRight, Wallet, BadgeDollarSign,
  RefreshCw, Plus, FileDown
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const TABS = [
  { key: 'summary', labelKey: 'mod.summary', icon: TrendingUp },
  { key: 'structures', labelKey: 'mod.salaryStructures', icon: CreditCard },
  { key: 'payslips', labelKey: 'mod.payslips', icon: FileDown },
  { key: 'deductions', labelKey: 'mod.deductions', icon: Percent },
];

const COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#A855F7', '#EC4899', '#14B8A6'];

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className="stat-card-icon" style={{ background: `${color}12`, color }}><Icon size={20} /></div>
      <div className="text-2xl font-extrabold text-gray-900">{value ?? '-'}</div>
      <div className="text-[11px] font-medium text-gray-400 mt-1">{label}</div>
      {sub !== undefined && <div className="text-[10px] font-medium mt-0.5" style={{ color }}>{sub}</div>}
    </motion.div>
  );
}

function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-gray-100 rounded-xl" />
      ))}
    </div>
  );
}

export function StaffPayrollManagement() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('summary');

  const overview = useApi(() => enterpriseStaffApi.getPayrollOverview(), []);
  const payslips = useApi(() => enterpriseStaffApi.getPayslips(), []);

  const d = overview.data?.data || overview.data;
  const payroll = d || {};
  const payslipList = (payslips.data?.data || payslips.data || []);

  const trend = payroll?.monthlyTrend || payroll?.monthly_trend || [];
  const deptBreakdown = payroll?.departmentBreakdown || payroll?.department_breakdown || [];
  const structures = payroll?.salaryStructures || payroll?.salary_structures || [];
  const deductions = payroll?.deductions || [];

  const summaryCards = [
    { icon: DollarSign, label: 'Total Payroll', value: payroll?.totalPayroll ?? payroll?.total_payroll, color: '#6D4CFF', sub: 'This month' },
    { icon: Wallet, label: 'Avg Salary', value: payroll?.avgSalary ?? payroll?.avg_salary, color: '#22C55E', sub: 'Per employee' },
    { icon: BadgeDollarSign, label: 'Allowances', value: payroll?.totalAllowances ?? payroll?.total_allowances, color: '#3B82F6' },
    { icon: Percent, label: 'Deductions', value: payroll?.totalDeductions ?? payroll?.total_deductions, color: '#EF4444' },
    { icon: Users, label: 'Active Employees', value: payroll?.activeEmployees ?? payroll?.active_employees, color: '#F59E0B' },
    { icon: CalendarCheck, label: 'Pending Payslips', value: payroll?.pendingPayslips ?? payroll?.pending_payslips, color: '#A855F7' },
  ];

  const handleDownloadPayslip = async (p: any) => {
    toast.success(`Downloading payslip for ${p.employee_name || p.employeeName || 'employee'}`);
  };

  const handleEditStructure = async (s: any) => {
    toast.success(`Editing structure: ${s.name || s.structure_name}`);
  };

  const formatCurrency = (v: any) => {
    if (v == null) return '-';
    const n = typeof v === 'string' ? parseFloat(v) : v;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  return (
    <div>
      <div className="page-header">
        <h1>{t('mod.staffPayroll')}</h1>
        <p>Manage employee salaries, payslips, and deductions</p>
      </div>

      <div className="flex gap-1 mb-6 p-1 bg-gray-50 rounded-2xl border border-gray-100 w-fit">
        {TABS.map(item => {
          const Icon = item.icon;
          const active = tab === item.key;
          return (
            <button key={item.key} onClick={() => setTab(item.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${active ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}>
              <Icon size={15} />
              {t(item.labelKey)}
            </button>
          );
        })}
      </div>

      {tab === 'summary' && (
        <motion.div variants={container} initial="hidden" animate="show">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {summaryCards.map((c, i) => <StatCard key={i} {...c} />)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Monthly Payroll Trend</h3>
              {trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={trend}>
                    <defs><linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6D4CFF" stopOpacity={0.2} /><stop offset="95%" stopColor="#6D4CFF" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                    <Area type="monotone" dataKey="amount" stroke="#6D4CFF" strokeWidth={2} fill="url(#payGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-xs text-gray-300">No trend data</div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Department Breakdown</h3>
              {deptBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={deptBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="department" tick={{ fontSize: 11, fill: '#64748B' }} width={100} />
                    <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                    <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                      {deptBreakdown.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-xs text-gray-300">No department data</div>
              )}
            </Card>
          </div>
        </motion.div>
      )}

      {tab === 'structures' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Salary Structures</h3>
            <button onClick={() => toast.success('Add structure form')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6D4CFF] text-white text-[11px] font-semibold hover:bg-[#5A3EF0] transition-all">
              <Plus size={14} /> Add Structure
            </button>
          </div>
          {overview.loading ? <LoadingSkeleton rows={5} /> : structures.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-300">No salary structures found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-3 py-3 font-semibold text-gray-500">Name</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-500">Department</th>
                    <th className="text-right px-3 py-3 font-semibold text-gray-500">Basic</th>
                    <th className="text-right px-3 py-3 font-semibold text-gray-500">Allowances</th>
                    <th className="text-right px-3 py-3 font-semibold text-gray-500">Total</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-500">Employees</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {structures.map((s: any, i: number) => (
                    <tr key={s.id || i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-3 py-3 font-medium text-gray-900">{s.name || s.structure_name}</td>
                      <td className="px-3 py-3 text-gray-500">{s.department || '-'}</td>
                      <td className="px-3 py-3 text-right text-gray-700">{formatCurrency(s.basic)}</td>
                      <td className="px-3 py-3 text-right text-green-600">{formatCurrency(s.allowances || s.total_allowances)}</td>
                      <td className="px-3 py-3 text-right font-semibold text-gray-900">{formatCurrency(s.total || s.total_salary)}</td>
                      <td className="px-3 py-3 text-center"><Badge variant="info">{s.employeeCount ?? s.employee_count ?? 0}</Badge></td>
                      <td className="px-3 py-3 text-center">
                        <button onClick={() => handleEditStructure(s)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF] transition-all">
                          <Edit3 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'payslips' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Payslips</h3>
            <button onClick={() => payslips.refetch()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-[11px] font-semibold hover:bg-gray-200 transition-all">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
          {payslips.loading ? <LoadingSkeleton rows={5} /> : payslipList.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-300">No payslips found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-3 py-3 font-semibold text-gray-500">Employee</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-500">Month</th>
                    <th className="text-right px-3 py-3 font-semibold text-gray-500">Gross</th>
                    <th className="text-right px-3 py-3 font-semibold text-gray-500">Deductions</th>
                    <th className="text-right px-3 py-3 font-semibold text-gray-500">Net</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-500">Status</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-500">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {payslipList.map((p: any, i: number) => (
                    <tr key={p.id || i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-3 py-3 font-medium text-gray-900">{p.employeeName || p.employee_name || p.employee}</td>
                      <td className="px-3 py-3 text-gray-500">{p.month || p.pay_period}</td>
                      <td className="px-3 py-3 text-right text-gray-700">{formatCurrency(p.gross || p.gross_pay)}</td>
                      <td className="px-3 py-3 text-right text-red-500">{formatCurrency(p.deductions || p.total_deductions)}</td>
                      <td className="px-3 py-3 text-right font-semibold text-gray-900">{formatCurrency(p.net || p.net_pay)}</td>
                      <td className="px-3 py-3 text-center">
                        <Badge variant={(p.status || 'pending').toLowerCase() === 'paid' ? 'success' : 'warning'}>
                          {p.status || 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button onClick={() => handleDownloadPayslip(p)} className="p-1.5 rounded-lg hover:bg-[#6D4CFF]/10 text-gray-400 hover:text-[#6D4CFF] transition-all">
                          <Download size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'deductions' && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Deductions</h3>
          {overview.loading ? <LoadingSkeleton rows={5} /> : deductions.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-300">No deductions recorded</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-3 py-3 font-semibold text-gray-500">Type</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-500">Description</th>
                    <th className="text-right px-3 py-3 font-semibold text-gray-500">Amount</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-500">Recurring</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-500">Applicable To</th>
                  </tr>
                </thead>
                <tbody>
                  {deductions.map((d: any, i: number) => (
                    <tr key={d.id || i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center">
                            <Percent size={12} className="text-red-500" />
                          </div>
                          <span className="font-medium text-gray-900">{d.type || d.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-500 max-w-[200px] truncate">{d.description || '-'}</td>
                      <td className="px-3 py-3 text-right font-semibold text-red-500">{formatCurrency(d.amount)}</td>
                      <td className="px-3 py-3 text-center">
                        <Badge variant={d.recurring ? 'success' : 'default'}>{d.recurring ? 'Yes' : 'No'}</Badge>
                      </td>
                      <td className="px-3 py-3 text-gray-500">{d.applicableTo || d.applicable_to || 'All'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
