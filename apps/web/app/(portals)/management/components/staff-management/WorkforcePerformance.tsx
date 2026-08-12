'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import {
  Star, ClipboardList, Clock, Users, TrendingUp, Search, Building2, MessageSquare, Calendar, Award, Target, Zap,
} from 'lucide-react';

function KpiCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}><Icon size={18} /></div>
      </div>
      <div className="text-[11px] text-gray-500 font-medium">{label}</div>
      <div className="text-xl font-extrabold text-gray-900 mt-0.5">{value ?? '—'}</div>
    </motion.div>
  );
}

function StatBadge({ score }: { score: number }) {
  if (score >= 90) return <Badge variant="success">Excellent</Badge>;
  if (score >= 75) return <Badge variant="info">Good</Badge>;
  if (score >= 60) return <Badge variant="warning">Average</Badge>;
  return <Badge variant="danger">Needs Improvement</Badge>;
}

export function WorkforcePerformance() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchTerm, setSearchTerm] = useState('');

  const perfHook = useApi(() => enterpriseStaffApi.getPerformanceManagement(), []);
  const staffHook = useApi(() => enterpriseStaffApi.getStaffDirectory(), []);

  const loading = perfHook.loading || staffHook.loading;
  const error = perfHook.error || staffHook.error;

  const perfRaw = perfHook.data?.data || perfHook.data || {};
  const staffDir = staffHook.data?.data || staffHook.data;
  const staffList = Array.isArray(staffDir) ? staffDir : [];

  const overview = perfRaw.overview || perfRaw;
  const distribution = perfRaw.distribution || [];
  const departments = perfRaw.departments || [];
  const reviews = perfRaw.reviews || [];
  const kpiData = perfRaw.kpis || [];
  const feedbackEntries = perfRaw.feedback || [];

  const filteredReviews = useMemo(() => {
    if (!searchTerm) return reviews;
    const q = searchTerm.toLowerCase();
    return reviews.filter((r: any) =>
      (r.staff_name || r.staff?.full_name || '').toLowerCase().includes(q) ||
      (r.reviewer_name || '').toLowerCase().includes(q)
    );
  }, [reviews, searchTerm]);

  const avgScore = overview.avg_score ?? overview.average_score ?? 0;
  const totalReviews = overview.total_reviews ?? overview.total ?? 0;

  const ratings = [
    { icon: Star, label: 'Attendance Score', value: `${overview.attendance_score ?? overview.attendance ?? 0}%`, color: '#6D4CFF', bg: '#F0EDFF' },
    { icon: ClipboardList, label: 'Task Completion', value: `${overview.task_completion ?? overview.tasks ?? 0}%`, color: '#10B981', bg: '#ECFDF5' },
    { icon: Users, label: 'Student Performance', value: `${overview.student_performance ?? overview.students ?? 0}%`, color: '#3B82F6', bg: '#EFF6FF' },
    { icon: MessageSquare, label: 'Parent Communication', value: `${overview.parent_communication ?? overview.communication ?? 0}%`, color: '#F59E0B', bg: '#FFFBEB' },
    { icon: Award, label: 'Overall Rating', value: `${avgScore}%`, color: '#8B5CF6', bg: '#F5F3FF' },
  ];

  if (loading) return <LoadingSkeleton rows={6} cols={4} />;
  if (error) return <ErrorState message={error} onRetry={perfHook.refetch} />;

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <h1>Performance Management</h1>
        <p>Monitor attendance, task completion, student performance, and overall staff ratings</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
        {ratings.map((card, i) => (
          <KpiCard key={i} {...card} />
        ))}
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {['Overview', 'Reviews', 'KPIs'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Target size={14} className="text-[#6D4CFF]" />Performance Distribution</h3>
            {distribution.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#6D4CFF" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" fill="#22C55E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState message="No distribution data" />}
          </Card>
          <Card className="p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Building2 size={14} className="text-[#8B5CF6]" />Department Performance</h3>
            {departments.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departments} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState message="No department data" />}
          </Card>
        </div>
      )}

      {activeTab === 'Reviews' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search reviews..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF]" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="bg-gray-50/80">
                {['Staff', 'Reviewer', 'Score', 'Rating', 'Date', 'Comments'].map(h =>
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">{h}</th>
                )}
              </tr></thead>
              <tbody>
                {filteredReviews.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12"><EmptyState message="No reviews found" /></td></tr>
                ) : filteredReviews.map((r: any, i: number) => (
                  <tr key={r.id || i} className={`border-t border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{r.staff_name || r.staff?.full_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{r.reviewer_name || '—'}</td>
                    <td className="px-4 py-3 font-bold">{r.score ?? r.rating ?? '—'}</td>
                    <td className="px-4 py-3"><StatBadge score={r.score ?? r.rating ?? 0} /></td>
                    <td className="px-4 py-3 text-gray-400">{r.review_date ? new Date(r.review_date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-gray-400 max-w-[150px] truncate">{r.comments || r.feedback || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'KPIs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Array.isArray(kpiData) ? kpiData : []).length === 0 ? (
            <div className="lg:col-span-3"><EmptyState message="No KPI data available" /></div>
          ) : (Array.isArray(kpiData) ? kpiData : []).map((kpi: any, i: number) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-gray-900">{kpi.metric || kpi.name || 'KPI'}</div>
                <Badge variant={(kpi.status || '').toLowerCase() === 'achieved' ? 'success' : 'warning'} className="text-[9px]">{kpi.status || 'In Progress'}</Badge>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-2xl font-extrabold text-gray-900">{kpi.current ?? kpi.value ?? 0}</span>
                <span className="text-[10px] text-gray-400 mb-1">/ {kpi.target ?? 100}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((kpi.current ?? kpi.value ?? 0) / (kpi.target ?? 100) * 100, 100)}%`, background: '#6D4CFF' }} />
              </div>
              {kpi.staff_name && <div className="text-[10px] text-gray-400 mt-2">{kpi.staff_name}</div>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
