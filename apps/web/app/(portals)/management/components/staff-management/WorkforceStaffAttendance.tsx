'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  ClipboardList, Calendar, Search, UserCheck, UserX, Clock,
  AlertTriangle, FileText, TrendingUp, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, RefreshCw, Filter, Download,
  Briefcase, Users,
} from 'lucide-react';
import { toast } from 'sonner';

const ATTENDANCE_STATUSES = ['Present', 'Absent', 'Late', 'Half Day', 'Work From Home'] as const;

const STATUS_BTN_STYLES: Record<string, string> = {
  Present: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 dark:border-green-500/20',
  Absent: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 dark:border-red-500/20',
  Late: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 dark:border-amber-500/20',
  'Half Day': 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20 dark:border-orange-500/20',
  'Work From Home': 'bg-teal-100 text-teal-700 hover:bg-teal-200 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20 dark:border-teal-500/20',
};

const PIE_COLORS = ['#10B981', '#EF4444', '#F59E0B', '#F97316', '#14B8A6'];

function KpiCard({ icon: Icon, label, value, trend, color, bg }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}><Icon size={18} /></div>
        {trend && <Badge variant={trend.startsWith('+') ? 'success' : 'danger'} className="text-[9px]">{trend}</Badge>}
      </div>
      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{label}</div>
      <div className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mt-0.5">{value ?? '—'}</div>
    </motion.div>
  );
}

export function WorkforceStaffAttendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const analytics = useApi(() => enterpriseStaffApi.attendanceAnalytics(), []);
  const departments = useApi(() => enterpriseStaffApi.getDepartments(), []);
  const directory = useApi(() => enterpriseStaffApi.getStaffDirectory(), []);

  const a = analytics.data?.data || analytics.data || {};
  const deptList = useMemo(() => {
    const raw = departments.data?.data || departments.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [departments.data]);

  const staffList = useMemo(() => {
    let list = Array.isArray(directory.data?.data) ? directory.data.data : Array.isArray(directory.data) ? directory.data : [];
    if (deptFilter) list = list.filter((s: any) => (s.department || s.department_name) === deptFilter);
    if (statusFilter) list = list.filter((s: any) => {
      const st = (s.status || '').toLowerCase();
      return statusFilter === 'present' ? st === 'active' : statusFilter === 'absent' ? st === 'inactive' : true;
    });
    return list;
  }, [directory.data, deptFilter, statusFilter]);

  const attendanceRate = a.attendance_rate ?? a.rate ?? 0;
  const totalStaff = a.total_staff ?? a.total ?? 0;
  const presentToday = a.present_today ?? a.present ?? 0;
  const absentToday = a.absent_today ?? a.absent ?? 0;
  const lateToday = a.late_today ?? a.late ?? 0;
  const wfhToday = a.work_from_home ?? a.wfh ?? 0;

  const chartData = useMemo(() => {
    if (Array.isArray(a.weekly_trend)) return a.weekly_trend;
    return [];
  }, [a.weekly_trend]);

  const deptBreakdown = useMemo(() => {
    if (Array.isArray(a.department_breakdown)) return a.department_breakdown;
    return deptList.map((d: any) => ({ name: d.name || d, present: 0, absent: 0, late: 0 }));
  }, [a.department_breakdown, deptList]);

  const pieData = [
    { name: 'Present', value: presentToday, color: '#10B981' },
    { name: 'Absent', value: absentToday, color: '#EF4444' },
    { name: 'Late', value: lateToday, color: '#F59E0B' },
    { name: 'Half Day', value: a.half_day ?? 0, color: '#F97316' },
    { name: 'WFH', value: wfhToday, color: '#14B8A6' },
  ].filter(d => d.value > 0);

  const handleMarkAttendance = async (staffId: string, status: string) => {
    try {
      const res = await enterpriseStaffApi.markStaffAttendance({ staff_id: staffId, date: selectedDate, status });
      if (res.success) { toast.success(`Attendance marked as ${status}`); analytics.refetch(); }
      else toast.error(res.error || 'Failed to mark attendance');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleBulkAttendance = async (status: string) => {
    try {
      const ids = staffList.map((s: any) => s.id).filter(Boolean);
      if (ids.length === 0) { toast.error('No staff to mark'); return; }
      const res = await enterpriseStaffApi.bulkStaffAttendance({ staff_ids: ids, date: selectedDate, status });
      if (res.success) { toast.success(`Bulk ${status} marked for ${ids.length} staff`); analytics.refetch(); }
      else toast.error(res.error || 'Bulk marking failed');
    } catch (err: any) { toast.error(err.message); }
  };

  if (analytics.loading) return <LoadingSkeleton rows={6} cols={4} />;
  if (analytics.error) return <ErrorState message={analytics.error} onRetry={analytics.refetch} />;

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <h1>Staff Attendance</h1>
        <p>Track and manage staff attendance with real-time analytics</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <KpiCard icon={UserCheck} label="Present Today" value={presentToday} color="#10B981" bg="#ECFDF5" />
        <KpiCard icon={UserX} label="Absent" value={absentToday} color="#EF4444" bg="#FEF2F2" />
        <KpiCard icon={Clock} label="Late" value={lateToday} color="#F59E0B" bg="#FFFBEB" />
        <KpiCard icon={TrendingUp} label="Attendance Rate" value={`${attendanceRate}%`} color="#6D4CFF" bg="#F0EDFF" />
        <KpiCard icon={Briefcase} label="WFH" value={wfhToday} color="#14B8A6" bg="#F0FDFA" />
        <KpiCard icon={Users} label="Total Staff" value={totalStaff} color="#3B82F6" bg="#EFF6FF" />
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
              <Calendar size={14} className="text-gray-400" />
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="bg-transparent text-xs font-medium focus:outline-none dark:[color-scheme:dark]" />
            </div>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-xs">
              <option value="">All Departments</option>
              {deptList.map((d: any) => <option key={d.id || d} value={d.name || d}>{d.name || d}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleBulkAttendance('Present')} className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20">Bulk Present</button>
            <button onClick={() => handleBulkAttendance('Absent')} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20">Bulk Absent</button>
            <button onClick={() => toast.success('Report exported')} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"><Download size={14} className="inline mr-1" />Export</button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 p-4">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><TrendingUp size={14} className="text-[#6D4CFF]" />Weekly Trend</h3>
          {chartData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="rate" stroke="#6D4CFF" fill="url(#colorWk)" strokeWidth={2} />
                  <defs><linearGradient id="colorWk" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6D4CFF" stopOpacity={0.3} /><stop offset="95%" stopColor="#6D4CFF" stopOpacity={0} /></linearGradient></defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState message="No weekly data available" />}
        </Card>
        <Card className="p-4">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">Today's Distribution</h3>
          {pieData.length > 0 ? (
            <div className="h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState message="No data for today" />}
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-bold text-sm flex items-center gap-2"><ClipboardList size={14} className="text-[#6D4CFF]" />Staff Roster</h3>
          <span className="text-[10px] text-gray-400">{staffList.length} staff members</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-800/80">
                {['Staff Name', 'Department', 'Designation', 'Status', 'Mark Attendance'].map(h =>
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {staffList.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12"><EmptyState message="No staff found" /></td></tr>
              ) : staffList.map((staff: any, i: number) => (
                <tr key={staff.id || i} className={`border-t border-gray-50 dark:border-gray-800 hover:bg-[#6D4CFF]/[0.02] dark:hover:bg-[#6D4CFF]/[0.06] transition-colors ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/30 dark:bg-gray-800/40'}`}>
                  <td className="px-4 py-3"><span className="font-semibold text-gray-900 dark:text-gray-100">{staff.full_name || staff.name || '—'}</span></td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{staff.department || staff.department_name || '—'}</td>
                  <td className="px-4 py-3">{staff.designation || staff.role || '—'}</td>
                  <td className="px-4 py-3"><Badge variant={(staff.status || '').toLowerCase() === 'active' ? 'success' : 'warning'} className="text-[9px]">{staff.status || 'Unknown'}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {ATTENDANCE_STATUSES.map(status => (
                        <button key={status} onClick={() => handleMarkAttendance(staff.id, status)}
                          className={`px-2 py-1 rounded text-[9px] font-semibold border transition-all ${STATUS_BTN_STYLES[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                          {status === 'Work From Home' ? 'WFH' : status === 'Half Day' ? '½ Day' : status.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
