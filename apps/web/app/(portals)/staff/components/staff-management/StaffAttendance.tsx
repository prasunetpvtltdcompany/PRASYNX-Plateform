'use client';

import { useState } from 'react';
import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  ClipboardList, CalendarDays, CheckCircle2, XCircle, AlertCircle,
  Clock, TrendingUp, Users, Download, Filter, Search, ChevronDown,
  RefreshCw, BarChart3, Target, Zap, Sun, Moon, Activity, Upload
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line, AreaChart, Area,
} from 'recharts';

const PIE_COLORS = ['#22C55E', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'];

export function StaffAttendance() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';
  const [activeTab, setLocalTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const analyticsHook = useApi(() => workforceApi.attendanceAnalytics(orgId), [orgId], !!orgId);
  const deptsHook = useApi(() => workforceApi.getDepartments(orgId), [orgId], !!orgId);

  const analytics = (analyticsHook.data?.data || analyticsHook.data || {}) as any;
  const departments = Array.isArray(deptsHook.data?.data || deptsHook.data) ? (deptsHook.data?.data || deptsHook.data) : [];

  const todayStats = analytics.today || {};
  const weeklyData = Array.isArray(analytics.weekly) ? analytics.weekly : [];
  const monthlyData = Array.isArray(analytics.monthly) ? analytics.monthly : [];
  const deptData = Array.isArray(analytics.by_department) ? analytics.by_department : [];

  const statCards = [
    { label: 'Present Today', value: todayStats.present || 0, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'Absent Today', value: todayStats.absent || 0, icon: XCircle, color: 'text-red-600 bg-red-50' },
    { label: 'On Leave', value: todayStats.on_leave || 0, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Late Arrivals', value: todayStats.late || 0, icon: AlertCircle, color: 'text-orange-600 bg-orange-50' },
    { label: 'Attendance %', value: `${todayStats.percentage || 0}%`, icon: Target, color: 'text-purple-600 bg-purple-50' },
    { label: 'Pending Approvals', value: analytics.pending_approvals || 0, icon: RefreshCw, color: 'text-blue-600 bg-blue-50' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Staff Attendance</h1>
        <p>Manage, track, and analyze staff attendance across departments.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setLocalTab} className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-2xl overflow-x-auto flex-nowrap">
          <TabsTrigger value="overview" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="mark" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Mark Attendance</TabsTrigger>
          <TabsTrigger value="bulk" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Bulk Attendance</TabsTrigger>
          <TabsTrigger value="corrections" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Corrections</TabsTrigger>
          <TabsTrigger value="heatmap" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Heatmap</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {analyticsHook.loading ? <LoadingSkeleton rows={4} cols={3} /> : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {statCards.map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-all">
                    <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                      <stat.icon size={18} />
                    </div>
                    <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                    <div className="text-[11px] font-semibold text-gray-400 mt-0.5">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="p-5 border-gray-100">
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <BarChart3 size={16} className="text-purple-500" /> Weekly Attendance
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="present" fill="#22C55E" radius={[4, 4, 0, 0]} name="Present" />
                      <Bar dataKey="absent" fill="#EF4444" radius={[4, 4, 0, 0]} name="Absent" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-5 border-gray-100">
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <Activity size={16} className="text-purple-500" /> Department Attendance
                  </h3>
                  <div className="space-y-3">
                    {deptData.map((d: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">{d.name || d.department_name}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${d.percentage || 0}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          </div>
                          <span className="text-xs font-bold text-gray-600 w-10 text-right">{d.percentage || 0}%</span>
                        </div>
                      </div>
                    ))}
                    {deptData.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No department data available</p>}
                  </div>
                </Card>
              </div>

              <Card className="p-5 border-gray-100">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-purple-500" /> Monthly Attendance Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="present" stroke="#22C55E" fill="#22C55E" fillOpacity={0.1} name="Present" />
                    <Area type="monotone" dataKey="absent" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} name="Absent" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="mark">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-5 border-gray-100">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <ClipboardList size={16} className="text-purple-500" /> Mark Attendance
              </h3>
              <div className="flex gap-3 mb-4">
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400" />
                <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 bg-white">
                  <option value="all">All Departments</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
                  <Search size={14} className="mr-1" /> Load Staff
                </Button>
              </div>
              <div className="text-center py-12 text-gray-400">
                <ClipboardList size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-semibold">Select date and department to load staff for attendance marking</p>
              </div>
            </Card>
            <Card className="p-5 border-gray-100">
              <h3 className="text-sm font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-green-50 text-green-700 hover:bg-green-100 border-0 rounded-xl text-xs font-bold">
                  <CheckCircle2 size={14} className="mr-2" /> Mark All Present
                </Button>
                <Button className="w-full justify-start bg-red-50 text-red-700 hover:bg-red-100 border-0 rounded-xl text-xs font-bold">
                  <XCircle size={14} className="mr-2" /> Mark All Absent
                </Button>
                <Button className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 rounded-xl text-xs font-bold">
                  <RefreshCw size={14} className="mr-2" /> Sync from Biometric
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk">
          <Card className="p-5 border-gray-100">
            <h3 className="text-sm font-bold mb-4">Bulk Attendance</h3>
            <div className="text-center py-12 text-gray-400">
              <Upload size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-semibold">Upload CSV or Excel file for bulk attendance marking</p>
              <Button className="mt-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
                <Download size={14} className="mr-1" /> Download Template
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="corrections">
          <Card className="p-5 border-gray-100">
            <h3 className="text-sm font-bold mb-4">Attendance Corrections</h3>
            <div className="text-center py-12 text-gray-400">
              <AlertCircle size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-semibold">Review and approve attendance correction requests</p>
              <p className="text-xs text-gray-400 mt-1">No pending correction requests</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap">
          <Card className="p-5 border-gray-100">
            <h3 className="text-sm font-bold mb-4">Attendance Heatmap</h3>
            <div className="text-center py-12 text-gray-400">
              <Activity size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-semibold">Visual attendance density map</p>
              <p className="text-xs text-gray-400 mt-1">Select month and year to view heatmap</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5 border-gray-100">
              <h3 className="text-sm font-bold mb-4">Monthly Attendance Report</h3>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
                <Download size={14} className="mr-1" /> Generate Report
              </Button>
            </Card>
            <Card className="p-5 border-gray-100">
              <h3 className="text-sm font-bold mb-4">Department-wise Report</h3>
              <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
                <Download size={14} className="mr-1" /> Generate Report
              </Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
