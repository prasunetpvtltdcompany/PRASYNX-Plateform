'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';
import { useApi, LoadingSkeleton, ErrorState } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { useLanguage } from '../../language/LanguageProvider';
import { Card } from '@/components/ui/card';
import {
  Users, TrendingUp, BarChart3, PieChart as PieChartIcon,
  Activity, Target, AlertTriangle, Download
} from 'lucide-react';

const TABS = ['Overview', 'Departments', 'Attrition', 'Reports'] as const;
type TabKey = typeof TABS[number];

const TAB_TRANSLATIONS: Record<TabKey, string> = {
  Overview: 'mod.overview', Departments: 'mod.departments',
  Attrition: 'mod.attrition', Reports: 'mod.reports',
};

const COLORS = ['#6D4CFF', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6'];

function KpiCard({ icon: Icon, label, value, sub, color, bg }: { icon: any; label: string; value: string | number; sub?: string; color: string; bg: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}><Icon size={18} /></div>
      </div>
      <div className="text-[11px] text-gray-500 font-medium">{label}</div>
      <div className="text-xl font-extrabold text-gray-900 mt-0.5">{value ?? '—'}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </motion.div>
  );
}

function ChartCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-[#F0EDFF] flex items-center justify-center text-[#6D4CFF]"><Icon size={14} /></div>
        <h3 className="text-xs font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

export function StaffAnalytics() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);

  const staffAnalytics = useApi(() => enterpriseStaffApi.getStaffAnalytics(), []);
  const deptAnalytics = useApi(() => enterpriseStaffApi.getDepartmentAnalytics(), []);
  const roleAnalytics = useApi(() => enterpriseStaffApi.getRoleAnalytics(), []);
  const attritionAnalytics = useApi(() => enterpriseStaffApi.getAttritionAnalytics(), []);

  const loading = staffAnalytics.loading || deptAnalytics.loading || roleAnalytics.loading || attritionAnalytics.loading;
  const error = staffAnalytics.error || deptAnalytics.error || roleAnalytics.error || attritionAnalytics.error;

  const sa = staffAnalytics.data?.data || staffAnalytics.data || {};
  const da = deptAnalytics.data?.data || deptAnalytics.data || {};
  const ra = roleAnalytics.data?.data || roleAnalytics.data || {};
  const aa = attritionAnalytics.data?.data || attritionAnalytics.data || {};

  const staffGrowth = useMemo(() => {
    const raw = sa.staff_growth || sa.growth || sa.monthly_growth || [];
    return Array.isArray(raw) ? raw : [];
  }, [sa]);

  const deptDistribution = useMemo(() => {
    const raw = da.departments || da.distribution || da.dept_data || [];
    return Array.isArray(raw) ? raw : [];
  }, [da]);

  const workloadDistribution = useMemo(() => {
    const raw = sa.workload || sa.workload_distribution || [];
    return Array.isArray(raw) ? raw : [];
  }, [sa]);

  const roleDistribution = useMemo(() => {
    const raw = ra.roles || ra.role_distribution || ra.distribution || [];
    return Array.isArray(raw) ? raw : [];
  }, [ra]);

  const attritionTrend = useMemo(() => {
    const raw = aa.trend || aa.attrition_trend || aa.monthly || [];
    return Array.isArray(raw) ? raw : [];
  }, [aa]);

  const deptPerformance = useMemo(() => {
    const raw = da.performance || da.dept_performance || [];
    return Array.isArray(raw) ? raw : [];
  }, [da]);

  const totalStaff = sa.total_staff ?? sa.total ?? 0;
  const avgPerformance = sa.avg_performance ?? sa.average_performance ?? sa.avg_perf ?? 0;
  const avgAttendance = sa.avg_attendance ?? sa.average_attendance ?? sa.attendance ?? 0;
  const attritionRate = aa.rate ?? aa.attrition_rate ?? sa.attrition_rate ?? 0;

  if (loading) return <div className="w-full"><LoadingSkeleton rows={4} cols={4} /></div>;
  if (error) return <ErrorState message={error} onRetry={() => { staffAnalytics.refetch(); deptAnalytics.refetch(); roleAnalytics.refetch(); attritionAnalytics.refetch(); }} />;

  const renderOverview = () => (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={Users} label="Total Staff" value={totalStaff.toLocaleString()} sub="Active workforce" color="#6D4CFF" bg="#F0EDFF" />
        <KpiCard icon={TrendingUp} label="Avg Performance" value={avgPerformance ? `${avgPerformance}%` : '—'} sub="Across all departments" color="#10B981" bg="#ECFDF5" />
        <KpiCard icon={Activity} label="Avg Attendance" value={avgAttendance ? `${avgAttendance}%` : '—'} sub="Current month" color="#3B82F6" bg="#EFF6FF" />
        <KpiCard icon={AlertTriangle} label="Attrition Rate" value={attritionRate ? `${attritionRate}%` : '—'} sub="Rolling 12 months" color="#EF4444" bg="#FEF2F2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Staff Growth" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={staffGrowth}>
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6D4CFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6D4CFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" />
              <Tooltip />
              <Area type="monotone" dataKey="count" name="Staff Count" stroke="#6D4CFF" fill="url(#growthGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Department Distribution" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="#9CA3AF" width={90} />
              <Tooltip />
              <Bar dataKey="count" name="Staff" radius={[0, 4, 4, 0]}>
                {deptDistribution.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Workload Distribution" icon={Activity}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={workloadDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" />
              <Tooltip />
              <Bar dataKey="hours" name="Hours/Week" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Role Distribution" icon={PieChartIcon}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={roleDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                {roleDistribution.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );

  const renderDepartments = () => (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Department Performance" icon={Target}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={deptPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9CA3AF" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" />
              <Tooltip />
              <Legend />
              <Bar dataKey="performance" name="Performance %" fill="#6D4CFF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="attendance" name="Attendance %" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Department Distribution" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={deptDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="#9CA3AF" width={100} />
              <Tooltip />
              <Bar dataKey="count" name="Staff" radius={[0, 4, 4, 0]}>
                {deptDistribution.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {deptPerformance.length > 0 && (
        <Card className="p-5">
          <h3 className="text-xs font-bold text-gray-900 mb-4">Department Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-3 font-semibold text-gray-500">Department</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-500">Total Staff</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-500">Performance</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-500">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {deptPerformance.map((d: any, i: number) => (
                  <tr key={d.name || i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-3 font-medium text-gray-900">{d.name}</td>
                    <td className="py-3 px-3 text-gray-500">{d.count ?? d.staff_count ?? d.total ?? 0}</td>
                    <td className="py-3 px-3"><span className={`font-semibold ${(d.performance || 0) >= 80 ? 'text-green-600' : (d.performance || 0) >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{d.performance ?? '—'}%</span></td>
                    <td className="py-3 px-3"><span className={`font-semibold ${(d.attendance || 0) >= 80 ? 'text-green-600' : (d.attendance || 0) >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{d.attendance ?? '—'}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );

  const renderAttrition = () => (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={AlertTriangle} label="Attrition Rate" value={attritionRate ? `${attritionRate}%` : '—'} sub="Rolling 12 months" color="#EF4444" bg="#FEF2F2" />
        <KpiCard icon={Users} label="Total Exits" value={aa.total_exits ?? aa.exits ?? 0} sub={aa.period || 'This period'} color="#F59E0B" bg="#FFFBEB" />
        <KpiCard icon={Users} label="New Hires" value={aa.new_hires ?? aa.hires ?? 0} sub={aa.hire_period || 'This period'} color="#10B981" bg="#ECFDF5" />
        <KpiCard icon={TrendingUp} label="Retention Rate" value={aa.retention_rate ?? aa.retention ? `${aa.retention}%` : '—'} sub="Year to date" color="#3B82F6" bg="#EFF6FF" />
      </div>

      <ChartCard title="Attrition Trend" icon={TrendingUp}>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={attritionTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
            <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="attrition" name="Attrition %" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="hires" name="New Hires" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );

  const renderReports = () => {
    const reports = [
      { title: 'Staff Performance Summary', desc: 'Complete overview of staff performance metrics across departments', icon: TrendingUp, color: '#6D4CFF' },
      { title: 'Department Analytics Report', desc: 'Detailed departmental analytics with comparison charts', icon: BarChart3, color: '#10B981' },
      { title: 'Attrition Analysis Report', desc: 'Attrition trends, exit analysis, and retention insights', icon: AlertTriangle, color: '#EF4444' },
      { title: 'Workload Distribution Report', desc: 'Staff workload analysis with department-wise breakdown', icon: Activity, color: '#F59E0B' },
      { title: 'Role-Based Analytics', desc: 'Staff distribution and performance by role type', icon: PieChartIcon, color: '#3B82F6' },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((rpt, idx) => (
          <motion.div key={rpt.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${rpt.color}15`, color: rpt.color }}><rpt.icon size={18} /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900">{rpt.title}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{rpt.desc}</div>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6D4CFF] text-white text-[10px] font-semibold hover:bg-[#5B3FDD] transition-all"><Download size={12} /> Download Report</button>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <h1>{t('mod.staffAnalytics')}</h1>
        <p>Comprehensive analytics and insights for workforce management</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === i ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t(TAB_TRANSLATIONS[tab])}
          </button>
        ))}
      </div>

      {activeTab === 0 && renderOverview()}
      {activeTab === 1 && renderDepartments()}
      {activeTab === 2 && renderAttrition()}
      {activeTab === 3 && renderReports()}
    </div>
  );
}
