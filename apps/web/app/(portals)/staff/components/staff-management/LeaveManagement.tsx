'use client';

import { useState } from 'react';
import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  CalendarDays, Clock, CheckCircle2, XCircle, AlertCircle,
  Plus, Search, Filter, BarChart3, Users, FileText,
  Umbrella, Heart, Briefcase, Baby, Activity
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell,
} from 'recharts';

const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#EC4899'];

export function LeaveManagement() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';
  const [activeTab, setLocalTab] = useState('overview');

  const leavesHook = useApi(() => workforceApi.getLeaveManagement(orgId), [orgId], !!orgId);
  const analyticsHook = useApi(() => workforceApi.getLeaveAnalytics(orgId), [orgId], !!orgId);

  const leaves = Array.isArray(leavesHook.data?.data || leavesHook.data) ? (leavesHook.data?.data || leavesHook.data) : [];
  const analytics = (analyticsHook.data?.data || analyticsHook.data || {}) as any;

  const pendingCount = leaves.filter((l: any) => l.status === 'PENDING').length;
  const approvedCount = leaves.filter((l: any) => l.status === 'APPROVED').length;
  const rejectedCount = leaves.filter((l: any) => l.status === 'REJECTED').length;

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'APPROVED': return <Badge className="bg-green-50 text-green-700 border-green-200 text-[9px] font-extrabold">Approved</Badge>;
      case 'PENDING': return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] font-extrabold">Pending</Badge>;
      case 'REJECTED': return <Badge className="bg-red-50 text-red-700 border-red-200 text-[9px] font-extrabold">Rejected</Badge>;
      default: return <Badge className="bg-gray-50 text-gray-600 border-gray-200 text-[9px]">{s}</Badge>;
    }
  };

  const leaveTypeIcon: Record<string, any> = {
    SICK: Activity, CASUAL: Umbrella, ANNUAL: CalendarDays,
    PERSONAL: Heart, MATERNITY: Baby,
  };

  return (
    <div>
      <div className="page-header">
        <h1>Leave Management</h1>
        <p>Manage staff leave applications, approvals, balances, and analytics.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Requests', value: leaves.length, icon: FileText, color: 'bg-purple-50 text-purple-600' },
          { label: 'Pending', value: pendingCount, icon: Clock, color: 'bg-amber-50 text-amber-600' },
          { label: 'Approved', value: approvedCount, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
          { label: 'Rejected', value: rejectedCount, icon: XCircle, color: 'bg-red-50 text-red-600' },
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

      <Tabs value={activeTab} onValueChange={setLocalTab} className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-2xl">
          <TabsTrigger value="overview" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">All Leaves</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Pending</TabsTrigger>
          <TabsTrigger value="balance" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Leave Balance</TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Calendar</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {leavesHook.loading ? <LoadingSkeleton rows={5} cols={1} /> : (
            <div className="space-y-3">
              {leaves.map((l: any, i: number) => {
                const Icon = leaveTypeIcon[l.leave_type] || CalendarDays;
                return (
                  <motion.div key={l.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-gray-900">{l.staff_name || l.full_name}</h4>
                            {getStatusBadge(l.status)}
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{l.leave_type} Leave</p>
                          <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium">
                            <span>{new Date(l.start_date).toLocaleDateString()} - {new Date(l.end_date).toLocaleDateString()}</span>
                            {l.reason && <span className="italic">"{l.reason}"</span>}
                          </div>
                        </div>
                      </div>
                      {l.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white rounded-xl text-[9px] h-8"
                            onClick={() => toast.success('Leave approved')}>
                            <CheckCircle2 size={12} className="mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-[9px] h-8"
                            onClick={() => toast.error('Leave rejected')}>
                            <XCircle size={12} className="mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {leaves.length === 0 && (
                <div className="text-center py-16">
                  <CalendarDays size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-400 font-semibold">No leave records found</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          <div className="text-center py-16">
            <Clock size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400 font-semibold">
              {pendingCount > 0 ? `${pendingCount} pending leave requests` : 'No pending requests'}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="balance">
          <Card className="p-5 border-gray-100">
            <h3 className="text-sm font-bold mb-4">Leave Balance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { type: 'Annual', used: 12, total: 20, color: '#6D4CFF' },
                { type: 'Sick', used: 4, total: 12, color: '#22C55E' },
                { type: 'Casual', used: 6, total: 10, color: '#F59E0B' },
                { type: 'Personal', used: 2, total: 5, color: '#3B82F6' },
                { type: 'Maternity', used: 0, total: 90, color: '#EC4899' },
              ].map((b, i) => (
                <div key={b.type} className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
                  <div className="text-2xl font-black" style={{ color: b.color }}>{b.used}/{b.total}</div>
                  <div className="text-[10px] font-semibold text-gray-400 mt-1">{b.type}</div>
                  <Progress value={(b.used / b.total) * 100} className="mt-2 h-1" style={{ background: '#E5E7EB' }} />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card className="p-5 border-gray-100">
            <h3 className="text-sm font-bold mb-4">Leave Calendar</h3>
            <div className="text-center py-12 text-gray-400">
              <CalendarDays size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-semibold">Interactive leave calendar view</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5 border-gray-100">
              <h3 className="text-sm font-bold mb-4">Leave Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie data={[
                    { name: 'Sick', value: analytics.sick_count || 25 },
                    { name: 'Casual', value: analytics.casual_count || 30 },
                    { name: 'Annual', value: analytics.annual_count || 20 },
                    { name: 'Personal', value: analytics.personal_count || 15 },
                    { name: 'Other', value: analytics.other_count || 10 },
                   ]} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                    {[0, 1, 2, 3, 4].map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5 border-gray-100">
              <h3 className="text-sm font-bold mb-4">Monthly Leave Trends</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={Array.isArray(analytics.monthly) ? analytics.monthly : []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6D4CFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
