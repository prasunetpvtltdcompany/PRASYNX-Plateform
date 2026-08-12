'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { useLanguage } from '../../language/LanguageProvider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Star, ClipboardList, Clock, Users, TrendingUp, Search, Building2, MessageSquare, Calendar
} from 'lucide-react';

const TABS = ['Overview', 'Reviews', 'KPIs', 'Feedback'] as const;
type TabKey = typeof TABS[number];

const TAB_TRANSLATIONS: Record<TabKey, string> = {
  Overview: 'mod.overview', Reviews: 'mod.reviews', KPIs: 'mod.kpis', Feedback: 'mod.feedback',
};

function KpiCard({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: string | number; color: string; bg: string }) {
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

export function StaffPerformance() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchTerm, setSearchTerm] = useState('');

  const perfHook = useApi(() => enterpriseStaffApi.getPerformanceManagement(), [], true);
  const staffHook = useApi(() => enterpriseStaffApi.getStaffDirectory(), [], true);

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

  if (loading) return <LoadingSkeleton rows={6} cols={4} />;
  if (error) return <ErrorState message={error} onRetry={perfHook.refetch} />;

  return (
    <div>
      <div className="page-header">
        <h1>{t('mod.staffPerformance')}</h1>
        <p>Monitor and evaluate staff performance across the institution</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t(TAB_TRANSLATIONS[tab])}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={Star} label="Avg Performance Score" value={`${(overview.avgScore ?? 0).toFixed(1)}%`} color="#6D4CFF" bg="#F0EDFF" />
            <KpiCard icon={ClipboardList} label="Total Reviews" value={overview.totalReviews ?? 0} color="#10B981" bg="#E8F9F0" />
            <KpiCard icon={Clock} label="Pending Reviews" value={overview.pendingReviews ?? 0} color="#F59E0B" bg="#FFF8E8" />
            <KpiCard icon={Users} label="Top Performers" value={overview.topPerformers?.length ?? 0} color="#3B82F6" bg="#EBF2FF" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Performance Distribution</h3>
              {distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
                    <Bar dataKey="count" fill="#6D4CFF" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyState message="No distribution data" />}
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Department Comparison</h3>
              {departments.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={departments} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
                    <Bar dataKey="avgScore" fill="#8B5CF6" radius={[0, 6, 6, 0]} name="Avg Score" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyState message="No department data" />}
            </Card>
          </div>

          {overview.topPerformers?.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-green-500" /> Top Performers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(overview.topPerformers as any[]).map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold">{p.name?.charAt(0) || '?'}</div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900">{p.name}</div>
                      <div className="text-[10px] text-gray-400">{p.department} · {p.score}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {activeTab === 'Reviews' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by staff or reviewer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6D4CFF]" />
          </div>
          {filteredReviews.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Staff</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Reviewer</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Score</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((r: any, i: number) => (
                    <tr key={r.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-800">{r.staff_name || r.staff?.full_name || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.reviewer_name || r.reviewer?.full_name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold" style={{ color: (r.score || 0) >= 75 ? '#10B981' : (r.score || 0) >= 60 ? '#F59E0B' : '#EF4444' }}>
                          {r.score ?? '—'}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{r.date ? new Date(r.date).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3"><StatBadge score={r.score ?? 0} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyState message={searchTerm ? 'No matching reviews found' : 'No reviews available'} />}
        </motion.div>
      )}

      {activeTab === 'KPIs' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {kpiData.length > 0 ? kpiData.map((entry: any, i: number) => (
            <Card key={i} className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold">
                  {(entry.staff_name || entry.staff?.full_name || '?').charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{entry.staff_name || entry.staff?.full_name || 'Unknown'}</div>
                  <div className="text-[10px] text-gray-400">{entry.department || ''}</div>
                </div>
              </div>
              <div className="space-y-3">
                {(entry.kpis || entry.metrics || []).map((kpi: any, j: number) => (
                  <div key={j}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">{kpi.name || kpi.metric}</span>
                      <span className="text-xs font-semibold text-gray-900">{kpi.score ?? kpi.value ?? 0}/{kpi.max ?? 100}</span>
                    </div>
                    <Progress value={((kpi.score ?? kpi.value ?? 0) / (kpi.max ?? 100)) * 100} />
                  </div>
                ))}
              </div>
            </Card>
          )) : <EmptyState message="No KPI data available" />}
        </motion.div>
      )}

      {activeTab === 'Feedback' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {feedbackEntries.length > 0 ? feedbackEntries.map((fb: any, i: number) => (
            <Card key={i} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} className="text-purple-500" />
                  <span className="text-xs font-semibold text-gray-800">{fb.reviewer_name || fb.from || 'Anonymous'}</span>
                  <span className="text-[10px] text-gray-400">→</span>
                  <span className="text-xs font-medium text-gray-600">{fb.staff_name || fb.to || 'Staff'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {fb.rating && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={10} fill={s < fb.rating ? '#F59E0B' : 'none'} color={s < fb.rating ? '#F59E0B' : '#D1D5DB'} />
                      ))}
                    </div>
                  )}
                  {fb.date && <span className="text-[10px] text-gray-400">{new Date(fb.date).toLocaleDateString()}</span>}
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{fb.comment || fb.feedback || fb.message || 'No comment'}</p>
              {fb.categories && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {(Array.isArray(fb.categories) ? fb.categories : []).map((cat: string, c: number) => (
                    <span key={c} className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-medium">{cat}</span>
                  ))}
                </div>
              )}
            </Card>
          )) : <EmptyState message="No feedback entries yet" />}
        </motion.div>
      )}
    </div>
  );
}
