'use client';

import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Users, Target, Clock,
  Activity, Building2, Award, TrendingDown, UserMinus,
  PieChart as PieChartIcon, LineChart as LineChartIcon
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line, AreaChart, Area,
} from 'recharts';

const COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#EC4899', '#14B8A6', '#8B5CF6'];

export function StaffAnalytics() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';

  const analyticsHook = useApi(() => workforceApi.getStaffAnalytics(orgId), [orgId], !!orgId);
  const deptAnalyticsHook = useApi(() => workforceApi.getDepartmentAnalytics(orgId), [orgId], !!orgId);
  const roleAnalyticsHook = useApi(() => workforceApi.getRoleAnalytics(orgId), [orgId], !!orgId);
  const attritionHook = useApi(() => workforceApi.getAttritionAnalytics(orgId), [orgId], !!orgId);

  const analytics = (analyticsHook.data?.data || analyticsHook.data || {}) as any;
  const deptData = Array.isArray(deptAnalyticsHook.data?.data || deptAnalyticsHook.data) ? (deptAnalyticsHook.data?.data || deptAnalyticsHook.data) : [];
  const roleData = Array.isArray(roleAnalyticsHook.data?.data || roleAnalyticsHook.data) ? (roleAnalyticsHook.data?.data || roleAnalyticsHook.data) : [];
  const attrition = (attritionHook.data?.data || attritionHook.data || {}) as any;

  const growthData = Array.isArray(analytics.growth_data) ? analytics.growth_data : [];
  const workloadData = Array.isArray(analytics.workload_data) ? analytics.workload_data : [];

  return (
    <div>
      <div className="page-header">
        <h1>Staff Analytics</h1>
        <p>Comprehensive analytics across departments, roles, attendance, performance, and more.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Staff', value: analytics.total_staff || 0, icon: Users, color: 'bg-purple-50 text-purple-600' },
          { label: 'Avg Performance', value: `${analytics.avg_performance || 0}%`, icon: Award, color: 'bg-green-50 text-green-600' },
          { label: 'Avg Attendance', value: `${analytics.avg_attendance || 0}%`, icon: Clock, color: 'bg-blue-50 text-blue-600' },
          { label: 'Attrition Rate', value: `${analytics.attrition_rate || 0}%`, icon: TrendingDown, color: 'bg-red-50 text-red-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={18} />
            </div>
            <div className="text-2xl font-black text-gray-900">{stat.value}</div>
            <div className="text-[11px] font-semibold text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-5 border-gray-100">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-purple-500" /> Staff Growth
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#6D4CFF" fill="#6D4CFF" fillOpacity={0.1} name="Staff Count" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5 border-gray-100">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-purple-500" /> Department Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deptData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#6D4CFF" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-5 border-gray-100">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Target size={16} className="text-purple-500" /> Workload Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie data={workloadData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                {workloadData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5 border-gray-100">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <UserMinus size={16} className="text-purple-500" /> Attrition Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Current Rate</span>
              <span className="text-lg font-black text-red-500">{attrition.current_rate || 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Year to Date</span>
              <span className="text-lg font-black text-gray-900">{attrition.ytd || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Voluntary</span>
              <span className="text-lg font-black text-amber-500">{attrition.voluntary || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Involuntary</span>
              <span className="text-lg font-black text-gray-900">{attrition.involuntary || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5 border-gray-100">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <Activity size={16} className="text-purple-500" /> Role Analytics
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <ReLineChart data={roleData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="role" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#6D4CFF" strokeWidth={2} dot={{ fill: '#6D4CFF' }} />
          </ReLineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
