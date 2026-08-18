'use client';

import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  TrendingUp, Target, Award, Star, CheckCircle2,
  Clock, MessageSquare, Users, BookOpen, BarChart3,
  PieChart as PieChartIcon, Activity
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444'];

export function PerformanceManagement() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';

  const perfHook = useApi(() => workforceApi.getPerformanceManagement(orgId), [orgId], !!orgId);

  const perfData = (perfHook.data?.data || perfHook.data || {}) as any;
  const staffList = Array.isArray(perfData.staff_list) ? perfData.staff_list : [];
  const kpiData = Array.isArray(perfData.kpi_data) ? perfData.kpi_data : [];
  const overallAvg = perfData.overall_average || 0;

  const metrics = [
    { label: 'Attendance Score', key: 'attendance_score', value: perfData.avg_attendance || 0, icon: Clock, color: 'text-blue-600 bg-blue-50' },
    { label: 'Task Completion', key: 'task_completion', value: perfData.avg_task_completion || 0, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'Student Performance', key: 'student_performance', value: perfData.avg_student_perf || 0, icon: BookOpen, color: 'text-purple-600 bg-purple-50' },
    { label: 'Parent Communication', key: 'parent_comm', value: perfData.avg_parent_comm || 0, icon: MessageSquare, color: 'text-amber-600 bg-amber-50' },
    { label: 'PTM Participation', key: 'ptm', value: perfData.avg_ptm || 0, icon: Users, color: 'text-cyan-600 bg-cyan-50' },
    { label: 'Exam Work', key: 'exam_work', value: perfData.avg_exam_work || 0, icon: Award, color: 'text-orange-600 bg-orange-50' },
    { label: 'Committee Work', key: 'committee', value: perfData.avg_committee || 0, icon: Target, color: 'text-pink-600 bg-pink-50' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Performance Management</h1>
        <p>Track and evaluate staff performance across multiple KPIs and metrics.</p>
      </div>

      {/* Overall Score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl p-6 md:p-8 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-purple-200 font-bold mb-1">Overall Performance Score</div>
            <div className="text-4xl font-black">{overallAvg}%</div>
            <div className="text-sm text-purple-200 font-semibold mt-1">
              Based on {staffList.length} staff members across {metrics.length} metrics
            </div>
          </div>
          <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
            <div className="text-3xl font-black">{overallAvg}%</div>
          </div>
        </div>
      </motion.div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
        {metrics.map((m, i) => (
          <motion.div key={m.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center mb-3`}>
              <m.icon size={18} />
            </div>
            <div className="text-lg font-black text-gray-900">{m.value}%</div>
            <div className="text-[10px] font-semibold text-gray-400 mt-0.5">{m.label}</div>
            <Progress value={m.value} className="mt-2 h-1" />
          </motion.div>
        ))}
      </div>

      {/* KPI Details */}
      <Card className="p-5 border-gray-100 mb-6">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <Target size={16} className="text-purple-500" /> Key Performance Indicators
        </h3>
        {perfHook.loading ? <LoadingSkeleton rows={4} cols={1} /> : (
          <div className="space-y-4">
            {staffList.slice(0, 10).map((staff: any, i: number) => (
              <div key={staff.id || i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                      {staff.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{staff.full_name}</div>
                      <div className="text-[10px] text-gray-400">{staff.designation_name}</div>
                    </div>
                  </div>
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[9px] font-extrabold">
                    Score: {staff.overall_score || staff.score || 0}%
                  </Badge>
                </div>
                {staff.kpis && Object.keys(staff.kpis).length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(staff.kpis).map(([key, val]: any) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                        <span className="text-[10px] font-medium text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-[11px] font-bold text-purple-600">{val}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {staffList.length === 0 && (
              <p className="text-center text-gray-400 text-xs py-8">No performance data available</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
