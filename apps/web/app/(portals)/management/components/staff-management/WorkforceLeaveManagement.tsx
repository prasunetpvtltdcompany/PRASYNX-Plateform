'use client';

import { useState } from 'react';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { motion } from 'framer-motion';
import {
  CalendarCheck, Clock, CheckCircle2, XCircle, Search, RefreshCw,
  Users, BarChart3, FileText, ThumbsUp, ThumbsDown,
  Filter, CalendarDays, Plus,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  BarChart, Bar, PieChart as RePie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#6D4CFF', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#A855F7', '#EC4899', '#14B8A6'];
const STATUS_BADGE: Record<string, 'warning' | 'success' | 'danger' | 'info'> = { pending: 'warning', approved: 'success', rejected: 'danger' };

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className="stat-card-icon" style={{ background: `${color}12`, color }}><Icon size={20} /></div>
      <div className="text-2xl font-extrabold text-gray-900">{value ?? '-'}</div>
      <div className="text-[11px] font-medium text-gray-400 mt-1">{label}</div>
    </motion.div>
  );
}

export function WorkforceLeaveManagement() {
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [showApply, setShowApply] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const mgmt = useApi(() => enterpriseStaffApi.getLeaveManagement(), []);
  const analytics = useApi(() => enterpriseStaffApi.getLeaveAnalytics(), []);
  const directory = useApi(() => enterpriseStaffApi.getStaffDirectory(), []);

  const d = mgmt.data?.data || mgmt.data;
  const a = analytics.data?.data || analytics.data;

  const requests = d?.requests || d?.leaveRequests || d?.leaves || [];
  const balances = d?.balances || d?.leaveBalances || [];
  const staffList = Array.isArray(directory.data?.data) ? directory.data.data : Array.isArray(directory.data) ? directory.data : [];

  const stats = {
    total: d?.totalRequests ?? d?.total_requests ?? 0,
    pending: d?.pendingRequests ?? d?.pending_requests ?? 0,
    approved: d?.approvedRequests ?? d?.approved_requests ?? 0,
    rejected: d?.rejectedRequests ?? d?.rejected_requests ?? 0,
  };

  const leaveTypeDist = a?.leaveTypeDistribution || a?.leave_type_distribution || [];
  const monthlyTrend = a?.monthlyTrend || a?.monthly_trend || [];

  const filtered = (Array.isArray(requests) ? requests : []).filter((r: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.staff_name || '').toLowerCase().includes(q) || (r.leave_type || '').toLowerCase().includes(q) || (r.reason || '').toLowerCase().includes(q);
  });

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = action === 'approve' ? await enterpriseStaffApi.approveLeave(id) : await enterpriseStaffApi.rejectLeave(id, 'Manager decision');
      if (res.success) { toast.success(`Leave ${action}d`); mgmt.refetch(); analytics.refetch(); }
      else toast.error(res.error || `Failed to ${action}`);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleApply = async () => {
    try {
      const res = await enterpriseStaffApi.applyLeave({ ...formData, status: 'pending' });
      if (res.success) { toast.success('Leave applied'); setShowApply(false); setFormData({}); mgmt.refetch(); analytics.refetch(); }
      else toast.error(res.error || 'Failed to apply');
    } catch (err: any) { toast.error(err.message); }
  };

  if (mgmt.loading) return <LoadingSkeleton rows={4} />;
  if (mgmt.error) return <ErrorState message={mgmt.error} onRetry={mgmt.refetch} />;

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <h1>Leave Management</h1>
        <p>Manage staff leave requests, balances, and analytics</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CalendarDays} label="Total Requests" value={stats.total} color="#6D4CFF" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="#F59E0B" />
        <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} color="#22C55E" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected} color="#EF4444" />
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {['overview', 'requests', 'balances'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="font-bold text-sm mb-3">Leave Type Distribution</h3>
            {leaveTypeDist.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RePie>
                    <Pie data={leaveTypeDist} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name }) => name}>
                      {leaveTypeDist.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </RePie>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState message="No distribution data" />}
          </Card>
          <Card className="p-4">
            <h3 className="font-bold text-sm mb-3">Monthly Trend</h3>
            {monthlyTrend.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#6D4CFF" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="approved" fill="#22C55E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState message="No trend data" />}
          </Card>
        </div>
      )}

      {tab === 'requests' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="w-56 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requests..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF]" />
            </div>
            <button onClick={() => setShowApply(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all"><Plus size={14} /> Apply Leave</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-50/80">
                {['Staff', 'Type', 'From', 'To', 'Days', 'Reason', 'Status', 'Actions'].map(h =>
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">{h}</th>
                )}
              </tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12"><EmptyState message="No leave requests" /></td></tr>
                ) : filtered.map((r: any, i: number) => (
                  <tr key={r.id || i} className={`border-t border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{r.staff_name || r.staff?.full_name || '—'}</td>
                    <td className="px-4 py-3">{r.leave_type || r.type || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{r.start_date ? new Date(r.start_date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{r.end_date ? new Date(r.end_date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 font-semibold">{r.days || r.total_days || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 max-w-[120px] truncate">{r.reason || '—'}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_BADGE[r.status?.toLowerCase()] || 'default'} className="text-[9px]">{r.status || 'Pending'}</Badge></td>
                    <td className="px-4 py-3">
                      {r.status?.toLowerCase() === 'pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => handleAction(r.id, 'approve')} className="px-2 py-1 rounded bg-green-100 text-green-700 text-[9px] font-semibold hover:bg-green-200"><ThumbsUp size={11} /></button>
                          <button onClick={() => handleAction(r.id, 'reject')} className="px-2 py-1 rounded bg-red-100 text-red-700 text-[9px] font-semibold hover:bg-red-200"><ThumbsDown size={11} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'balances' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-50/80">
                {['Staff', 'Leave Type', 'Total Days', 'Used', 'Remaining'].map(h =>
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">{h}</th>
                )}
              </tr></thead>
              <tbody>
                {(Array.isArray(balances) ? balances : []).length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12"><EmptyState message="No balance data" /></td></tr>
                ) : (Array.isArray(balances) ? balances : []).map((b: any, i: number) => (
                  <tr key={b.id || i} className={`border-t border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{b.staff_name || b.staff?.full_name || '—'}</td>
                    <td className="px-4 py-3">{b.leave_type || b.type || '—'}</td>
                    <td className="px-4 py-3">{b.total_days || b.total || 0}</td>
                    <td className="px-4 py-3">{b.used_days || b.used || 0}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">{(b.total_days || b.total || 0) - (b.used_days || b.used || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowApply(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-sm">Apply Leave</h3>
              <button onClick={() => setShowApply(false)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Staff Member</label>
                <select value={formData.staff_id || ''} onChange={e => setFormData({ ...formData, staff_id: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs">
                  <option value="">Select</option>
                  {staffList.map((s: any) => <option key={s.id} value={s.id}>{s.full_name || s.name}</option>)}
                </select>
              </div>
              <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Leave Type</label>
                <select value={formData.leave_type || ''} onChange={e => setFormData({ ...formData, leave_type: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs">
                  <option value="">Select</option>
                  <option value="sick">Sick Leave</option>
                  <option value="casual">Casual Leave</option>
                  <option value="annual">Annual Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">From</label><input type="date" value={formData.start_date || ''} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs" /></div>
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">To</label><input type="date" value={formData.end_date || ''} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs" /></div>
              </div>
              <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Reason</label><textarea value={formData.reason || ''} onChange={e => setFormData({ ...formData, reason: e.target.value })} rows={3} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs" /></div>
              <button onClick={handleApply} className="w-full py-2.5 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all">Apply Leave</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
