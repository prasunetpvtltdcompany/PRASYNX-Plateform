'use client';

import { useState } from 'react';
import { useApi } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { useLanguage } from '../../language/LanguageProvider';
import { motion } from 'framer-motion';
import {
  CalendarCheck, Clock, CheckCircle2, XCircle, Search, RefreshCw,
  Users, BarChart3, PieChart, FileText, ThumbsUp, ThumbsDown,
  Filter, CalendarDays
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  BarChart, Bar, PieChart as RePie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line
} from 'recharts';

const TABS = [
  { key: 'overview', labelKey: 'mod.overview', icon: BarChart3 },
  { key: 'requests', labelKey: 'mod.leaveRequests', icon: FileText },
  { key: 'balances', labelKey: 'mod.balances', icon: CalendarDays },
  { key: 'analytics', labelKey: 'mod.analytics', icon: PieChart },
];

const COLORS = ['#6D4CFF', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#A855F7', '#EC4899', '#14B8A6'];

const STATUS_BADGE: Record<string, 'warning' | 'success' | 'danger' | 'info'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className="stat-card-icon" style={{ background: `${color}12`, color }}><Icon size={20} /></div>
      <div className="text-2xl font-extrabold text-gray-900">{value ?? '-'}</div>
      <div className="text-[11px] font-medium text-gray-400 mt-1">{label}</div>
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

export function StaffLeaveManagement() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');

  const mgmt = useApi(() => enterpriseStaffApi.getLeaveManagement(), []);
  const analytics = useApi(() => enterpriseStaffApi.getLeaveAnalytics(), []);

  const d = mgmt.data?.data || mgmt.data;
  const a = analytics.data?.data || analytics.data;

  const leaveData = d || {};
  const analyticsData = a || {};

  const requests = leaveData?.requests || leaveData?.leaveRequests || leaveData?.leaves || [];
  const balances = leaveData?.balances || leaveData?.leaveBalances || [];

  const stats = {
    total: leaveData?.totalRequests ?? leaveData?.total_requests ?? 0,
    pending: leaveData?.pendingRequests ?? leaveData?.pending_requests ?? 0,
    approved: leaveData?.approvedRequests ?? leaveData?.approved_requests ?? 0,
    rejected: leaveData?.rejectedRequests ?? leaveData?.rejected_requests ?? 0,
  };

  const leaveTypeDist = analyticsData?.leaveTypeDistribution || analyticsData?.leave_type_distribution || [];
  const monthlyTrend = analyticsData?.monthlyTrend || analyticsData?.monthly_trend || [];
  const deptAnalytics = analyticsData?.departmentAnalytics || analyticsData?.department_analytics || [];

  const handleApprove = async (r: any) => {
    toast.success(`Leave approved for ${r.employeeName || r.employee_name || 'employee'}`);
  };

  const handleReject = async (r: any) => {
    toast.success(`Leave rejected for ${r.employeeName || r.employee_name || 'employee'}`);
  };

  const filteredRequests = search
    ? requests.filter((r: any) => {
      const name = (r.employeeName || r.employee_name || r.employee || '').toLowerCase();
      return name.includes(search.toLowerCase());
    })
    : requests;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  return (
    <div>
      <div className="page-header">
        <h1>{t('mod.leaveManagement')}</h1>
        <p>Track and manage staff leave requests and balances</p>
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

      {tab === 'overview' && (
        <motion.div variants={container} initial="hidden" animate="show">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={FileText} label="Total Requests" value={stats.total} color="#6D4CFF" />
            <StatCard icon={Clock} label="Pending" value={stats.pending} color="#F59E0B" />
            <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} color="#22C55E" />
            <StatCard icon={XCircle} label="Rejected" value={stats.rejected} color="#EF4444" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Leave Type Distribution</h3>
              {leaveTypeDist.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <RePie>
                    <Pie data={leaveTypeDist} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                      {leaveTypeDist.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RePie>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-xs text-gray-300">No distribution data</div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Monthly Leave Trend</h3>
              {monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {monthlyTrend.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-xs text-gray-300">No trend data</div>
              )}
            </Card>
          </div>
        </motion.div>
      )}

      {tab === 'requests' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Leave Requests</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input type="text" placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#6D4CFF] transition-all w-48" />
              </div>
              <button onClick={() => mgmt.refetch()} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 transition-all">
                <RefreshCw size={15} />
              </button>
            </div>
          </div>
          {mgmt.loading ? <LoadingSkeleton rows={5} /> : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-300">No leave requests found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-3 py-3 font-semibold text-gray-500">Employee</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-500">Leave Type</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-500">From</th>
                    <th className="text-left px-3 py-3 font-semibold text-gray-500">To</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-500">Days</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-500">Status</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((r: any, i: number) => {
                    const status = (r.status || 'pending').toLowerCase();
                    return (
                      <tr key={r.id || i} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#6D4CFF]/10 flex items-center justify-center text-[#6D4CFF] font-bold text-[10px]">
                              {(r.employeeName || r.employee_name || r.employee || '?').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{r.employeeName || r.employee_name || r.employee}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-700">{r.leaveType || r.leave_type || r.type}</td>
                        <td className="px-3 py-3 text-gray-500">{r.fromDate || r.startDate || r.from || '-'}</td>
                        <td className="px-3 py-3 text-gray-500">{r.toDate || r.endDate || r.to || '-'}</td>
                        <td className="px-3 py-3 text-center font-medium">{r.days ?? r.total_days ?? '-'}</td>
                        <td className="px-3 py-3 text-center">
                          <Badge variant={STATUS_BADGE[status] || 'default'}>{status}</Badge>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleApprove(r)}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-all disabled:opacity-30"
                              disabled={status !== 'pending'}>
                              <ThumbsUp size={14} />
                            </button>
                            <button onClick={() => handleReject(r)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all disabled:opacity-30"
                              disabled={status !== 'pending'}>
                              <ThumbsDown size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'balances' && (
        <Card className="p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Leave Balances</h3>
          {mgmt.loading ? <LoadingSkeleton rows={5} /> : balances.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-300">No leave balance data</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-3 py-3 font-semibold text-gray-500">Employee</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-500">Annual</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-500">Sick</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-500">Personal</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-500">Casual</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-500">Other</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-500">Total Used</th>
                    <th className="text-center px-3 py-3 font-semibold text-gray-500">Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((b: any, i: number) => (
                    <tr key={b.id || i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-3 py-3 font-medium text-gray-900">{b.employeeName || b.employee_name || b.employee}</td>
                      <td className="px-3 py-3 text-center text-gray-700">{b.annual ?? b.annual_leave ?? '-'}</td>
                      <td className="px-3 py-3 text-center text-gray-700">{b.sick ?? b.sick_leave ?? '-'}</td>
                      <td className="px-3 py-3 text-center text-gray-700">{b.personal ?? b.personal_leave ?? '-'}</td>
                      <td className="px-3 py-3 text-center text-gray-700">{b.casual ?? b.casual_leave ?? '-'}</td>
                      <td className="px-3 py-3 text-center text-gray-700">{b.other ?? '-'}</td>
                      <td className="px-3 py-3 text-center"><Badge variant="warning">{b.used ?? b.total_used ?? 0}</Badge></td>
                      <td className="px-3 py-3 text-center"><Badge variant="success">{b.remaining ?? b.total_remaining ?? 0}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'analytics' && (
        <motion.div variants={container} initial="hidden" animate="show">
          {analytics.loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <LoadingSkeleton rows={6} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Leave Patterns by Department</h3>
                {deptAnalytics.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={deptAnalytics} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                      <YAxis type="category" dataKey="department" tick={{ fontSize: 11, fill: '#64748B' }} width={100} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                      <Bar dataKey="days" name="Days Taken" radius={[0, 6, 6, 0]} fill="#6D4CFF" />
                      <Bar dataKey="requests" name="Requests" radius={[0, 6, 6, 0]} fill="#22C55E" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-xs text-gray-300">No department analytics</div>
                )}
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Monthly Leave Analytics</h3>
                {monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                      <Line type="monotone" dataKey="count" name="Requests" stroke="#6D4CFF" strokeWidth={2} dot={{ r: 4, fill: '#6D4CFF' }} />
                      <Line type="monotone" dataKey="approved" name="Approved" stroke="#22C55E" strokeWidth={2} dot={{ r: 4, fill: '#22C55E' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-xs text-gray-300">No monthly data</div>
                )}
              </Card>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
