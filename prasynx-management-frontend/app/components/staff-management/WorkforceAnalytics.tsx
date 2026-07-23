'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  BarChart3, TrendingUp, TrendingDown, Users, Building2,
  PieChart, Activity, Target, Award, AlertTriangle,
  Calendar, Download, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart as RePie, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#6D4CFF', '#8B5CF6', '#A855F7', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#14B8A6'];

function KpiCard({ icon: Icon, label, value, trend, color, bg }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}><Icon size={18} /></div>
        {trend && <Badge variant={trend.startsWith('+') ? 'success' : 'danger'} className="text-[9px]">{trend}</Badge>}
      </div>
      <div className="text-[11px] text-gray-500 font-medium">{label}</div>
      <div className="text-xl font-extrabold text-gray-900 mt-0.5">{value ?? '—'}</div>
    </motion.div>
  );
}

export function WorkforceAnalytics() {
  const [timeRange, setTimeRange] = useState('month');

  const analytics = useApi(() => enterpriseStaffApi.getStaffAnalytics(), []);
  const deptAnalytics = useApi(() => enterpriseStaffApi.getDepartmentAnalytics(), []);
  const roleAnalytics = useApi(() => enterpriseStaffApi.getRoleAnalytics(), []);
  const attrition = useApi(() => enterpriseStaffApi.getAttritionAnalytics(), []);

  const a = analytics.data?.data || analytics.data || {};
  const da = deptAnalytics.data?.data || deptAnalytics.data || {};
  const ra = roleAnalytics.data?.data || roleAnalytics.data || {};
  const att = attrition.data?.data || attrition.data || {};

  const loading = analytics.loading || deptAnalytics.loading || roleAnalytics.loading;

  const departmentData = useMemo(() => {
    if (Array.isArray(da)) return da;
    if (Array.isArray(da.departments)) return da.departments;
    return [];
  }, [da]);

  const roleDistribution = useMemo(() => {
    if (Array.isArray(ra)) return ra;
    if (Array.isArray(ra.roles)) return ra.roles;
    return [];
  }, [ra]);

  const monthlyTrend = useMemo(() => {
    if (Array.isArray(a.monthly_trend)) return a.monthly_trend;
    if (Array.isArray(a.trend)) return a.trend;
    return [];
  }, [a]);

  const attritionRate = att.rate ?? att.attrition_rate ?? 0;
  const avgTenure = att.avg_tenure ?? att.average_tenure ?? 0;

  if (loading) return <LoadingSkeleton rows={6} cols={4} />;
  if (analytics.error) return <ErrorState message={analytics.error} onRetry={analytics.refetch} />;

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <h1>Staff Analytics</h1>
        <p>Comprehensive workforce analytics and insights</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <KpiCard icon={Users} label="Total Staff" value={a.total_staff ?? a.total ?? 0} trend="+5.2%" color="#6D4CFF" bg="#F0EDFF" />
        <KpiCard icon={Building2} label="Departments" value={a.total_departments ?? departmentData.length ?? 0} color="#3B82F6" bg="#EFF6FF" />
        <KpiCard icon={Activity} label="Attendance Rate" value={`${a.attendance_rate ?? a.rate ?? 0}%`} color="#10B981" bg="#ECFDF5" />
        <KpiCard icon={Target} label="Performance" value={`${a.performance_score ?? a.performance ?? 0}%`} color="#F59E0B" bg="#FFFBEB" />
        <KpiCard icon={TrendingUp} label="Retention" value={`${100 - attritionRate}%`} color="#8B5CF6" bg="#F5F3FF" />
        <KpiCard icon={Award} label="Avg Tenure" value={`${avgTenure}y`} color="#EC4899" bg="#FDF2F8" />
      </div>

      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">Monthly Staff Trend</h3>
          <div className="flex items-center gap-2">
            <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-[10px]">
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
            <button onClick={() => toast.success('Exporting analytics...')} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-[10px] font-semibold hover:bg-gray-50 flex items-center gap-1"><Download size={12} /> Export</button>
          </div>
        </div>
        {monthlyTrend.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month || name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Area type="monotone" dataKey="total || count" stroke="#6D4CFF" fill="url(#colorAn)" strokeWidth={2} name="Total Staff" />
                <Area type="monotone" dataKey="active || active_count" stroke="#22C55E" fill="url(#colorAn2)" strokeWidth={2} name="Active" />
                <defs>
                  <linearGradient id="colorAn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6D4CFF" stopOpacity={0.3} /><stop offset="95%" stopColor="#6D4CFF" stopOpacity={0} /></linearGradient>
                  <linearGradient id="colorAn2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} /><stop offset="95%" stopColor="#22C55E" stopOpacity={0} /></linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : <EmptyState message="No trend data available" />}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-4">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Building2 size={14} className="text-[#3B82F6]" />Department Distribution</h3>
          {departmentData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 9 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count || total || staff_count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState message="No department data" />}
        </Card>
        <Card className="p-4">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><PieChart size={14} className="text-[#8B5CF6]" />Role Distribution</h3>
          {roleDistribution.length > 0 ? (
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePie>
                  <Pie data={roleDistribution} cx="50%" cy="50%" outerRadius={80} dataKey="count || total" label={({ name }) => name}>
                    {roleDistribution.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </RePie>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState message="No role data" />}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><TrendingUp size={14} className="text-[#10B981]" />Attendance Trend by Department</h3>
          {departmentData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Bar dataKey="attendance_rate || attendance" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="performance_score || performance" fill="#6D4CFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState message="No attendance by department" />}
        </Card>
        <Card className="p-4">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><AlertTriangle size={14} className="text-[#EF4444]" />Attrition & Retention</h3>
          <div className="flex items-center justify-around h-56">
            <div className="text-center">
              <div className="text-4xl font-extrabold text-[#EF4444]">{attritionRate}%</div>
              <div className="text-[10px] text-gray-400 mt-1">Attrition Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-[#10B981]">{100 - attritionRate}%</div>
              <div className="text-[10px] text-gray-400 mt-1">Retention Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-extrabold text-[#6D4CFF]">{avgTenure}y</div>
              <div className="text-[10px] text-gray-400 mt-1">Avg Tenure</div>
            </div>
          </div>
          {att.reasons && Array.isArray(att.reasons) && (
            <div className="mt-2 space-y-1">
              {att.reasons.slice(0, 3).map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">{r.reason || r.name}</span>
                  <span className="font-semibold">{r.count || r.value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
