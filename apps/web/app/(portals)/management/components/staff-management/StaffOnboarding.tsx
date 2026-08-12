'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { useLanguage } from '../../language/LanguageProvider';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  UserPlus, ClipboardList, CheckCircle2, Calendar,
  Clock, TrendingUp, ArrowRight, FileText, BookOpen, Building2
} from 'lucide-react';

const TABS = ['Active Onboarding', 'Onboarding Templates', 'Completed'] as const;
type TabKey = typeof TABS[number];

const TAB_TRANSLATIONS: Record<TabKey, string> = {
  'Active Onboarding': 'mod.activeOnboarding', 'Onboarding Templates': 'mod.onboardingTemplates', Completed: 'mod.completed',
};

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(Math.max(value || 0), 100);
  const color = pct === 100 ? '#10B981' : pct >= 50 ? '#6D4CFF' : '#F59E0B';
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        className="h-full rounded-full transition-all duration-700"
        style={{ background: color }} />
    </div>
  );
}

export function StaffOnboarding() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);

  const onboarding = useApi(() => enterpriseStaffApi.getOnboarding(), []);

  const onboardingData = useMemo(() => {
    const raw = onboarding.data?.data || onboarding.data || {};
    return {
      active: Array.isArray(raw.active) ? raw.active : Array.isArray(raw) ? raw : [],
      templates: Array.isArray(raw.templates) ? raw.templates : [],
      completed: Array.isArray(raw.completed) ? raw.completed : [],
    };
  }, [onboarding.data]);

  const { active, templates, completed } = onboardingData;

  const getStageBadge = (stage: string) => {
    const s = (stage || '').toLowerCase();
    if (s.includes('document') || s.includes('paperwork')) return 'info';
    if (s.includes('orientation') || s.includes('training')) return 'warning';
    if (s.includes('review') || s.includes('approval')) return 'default';
    if (s.includes('complete') || s.includes('done')) return 'success';
    return 'default';
  };

  const daysRemaining = (endDate?: string) => {
    if (!endDate) return '—';
    const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff} days` : 'Overdue';
  };

  if (onboarding.loading) return <div className="w-full"><LoadingSkeleton rows={3} cols={3} /></div>;
  if (onboarding.error) return <ErrorState message={onboarding.error} onRetry={onboarding.refetch} />;

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <h1>{t('mod.staffOnboarding')}</h1>
        <p>Manage staff onboarding workflows, templates, and completed onboarding records</p>
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

      {/* Tab: Active Onboarding */}
      {activeTab === 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
              <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-xl bg-[#F0EDFF] flex items-center justify-center text-[#6D4CFF]"><UserPlus size={16} /></div></div>
              <div className="text-[11px] text-gray-500 font-medium">Active Onboardings</div>
              <div className="text-xl font-extrabold text-gray-900">{active.length}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="stat-card">
              <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-[#10B981]"><Clock size={16} /></div></div>
              <div className="text-[11px] text-gray-500 font-medium">Avg Completion</div>
              <div className="text-xl font-extrabold text-gray-900">{active.length ? `${Math.round(active.reduce((a: any, b: any) => a + (b.progress || 0), 0) / active.length)}%` : '—'}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
              <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-xl bg-[#FFFBEB] flex items-center justify-center text-[#F59E0B]"><TrendingUp size={16} /></div></div>
              <div className="text-[11px] text-gray-500 font-medium">This Month</div>
              <div className="text-xl font-extrabold text-gray-900">{active.filter((o: any) => new Date(o.start_date || o.created_at) > new Date(Date.now() - 30 * 86400000)).length}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="stat-card">
              <div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-xl bg-[#FEF2F2] flex items-center justify-center text-[#EF4444]"><Calendar size={16} /></div></div>
              <div className="text-[11px] text-gray-500 font-medium">Overdue</div>
              <div className="text-xl font-extrabold text-gray-900">{active.filter((o: any) => o.end_date && new Date(o.end_date) < new Date()).length}</div>
            </motion.div>
          </div>

          {active.length === 0 ? (
            <EmptyState message="No active onboarding processes" />
          ) : (
            <div className="space-y-3">
              {active.map((item: any, idx: number) => (
                <motion.div key={item.id || idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                  <Card className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-gray-900 truncate">{item.full_name || item.name || 'New Hire'}</span>
                          <Badge variant={getStageBadge(item.stage)} className="text-[9px] capitalize">{item.stage || 'Onboarding'}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                          <span className="flex items-center gap-1"><Building2 size={11} />{item.department || 'General'}</span>
                          <span className="flex items-center gap-1"><Calendar size={11} />Start: {item.start_date ? new Date(item.start_date).toLocaleDateString() : '—'}</span>
                          <span className="flex items-center gap-1"><Clock size={11} />{daysRemaining(item.end_date)}</span>
                        </div>
                      </div>
                      <div className="w-full sm:w-48">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="font-medium text-gray-500">Progress</span>
                          <span className="font-bold" style={{ color: (item.progress || 0) >= 100 ? '#10B981' : (item.progress || 0) >= 50 ? '#6D4CFF' : '#F59E0B' }}>{item.progress || 0}%</span>
                        </div>
                        <ProgressBar value={item.progress || 0} />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Onboarding Templates */}
      {activeTab === 1 && (
        templates.length === 0 ? (
          <EmptyState message="No onboarding templates found" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tmpl: any, idx: number) => (
              <motion.div key={tmpl.id || idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-[#6D4CFF] flex-shrink-0"><FileText size={18} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate">{tmpl.name || 'Template'}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{tmpl.department || 'All Departments'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><BookOpen size={12} />{tmpl.steps || tmpl.tasks || 0} steps</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{tmpl.duration || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#6D4CFF] text-white text-[10px] font-semibold hover:bg-[#5B3FDD] transition-all"><ArrowRight size={12} /> Use Template</button>
                    <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-[10px] font-semibold hover:bg-gray-50 transition-all">Preview</button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* Tab: Completed */}
      {activeTab === 2 && (
        completed.length === 0 ? (
          <EmptyState message="No completed onboarding records" />
        ) : (
          <div className="space-y-3">
            {completed.map((item: any, idx: number) => (
              <motion.div key={item.id || idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-[#ECFDF5] flex items-center justify-center text-[#10B981] flex-shrink-0"><CheckCircle2 size={18} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-900">{item.full_name || item.name || 'Staff Member'}</div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1"><Building2 size={11} />{item.department || 'General'}</span>
                        <span className="flex items-center gap-1"><Calendar size={11} />Completed: {item.completion_date ? new Date(item.completion_date).toLocaleDateString() : '—'}</span>
                      </div>
                    </div>
                    <Badge variant="success">Completed</Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
