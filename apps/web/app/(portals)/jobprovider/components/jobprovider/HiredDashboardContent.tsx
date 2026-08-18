'use client';

import type { JSX } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, TrendingUp, Sparkles, Search, Filter, X,
  Download, FileText, Mail, Phone, MapPin,
  Briefcase, CalendarDays, MessageSquare, Eye,
  Clock, GraduationCap,
  Send, Sliders, Ban, CheckCircle,
  BarChart3, Zap, Plus, Bot,
  ArrowUpRight, Star,
  Users, Building2, Upload, Shield, School,
  UserCheck, MoreHorizontal,
} from 'lucide-react';
import {
  Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie,
  CartesianGrid, XAxis, YAxis,
} from 'recharts';
import Counter from './Counter';
import MiniChart from './MiniChart';

function Info({ size }: { size?: number }) {
  return (
    <svg width={size || 12} height={size || 12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function Paperclip({ size }: { size?: number }) {
  return (
    <svg width={size || 14} height={size || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

interface HiredDashboardContentProps {
  hired: any[]; filtered: any[]; totalHires: number; activeEmployees: number;
  joiningSoon: number; offerAcceptanceRate: number; avgTimeToHire: number;
  qualityScore: number; departments: string[]; statuses: string[];
  onboardingPipelineCounts: Record<string, number>; successHighlights: any[];
  searchQuery: string; statusFilter: string; departmentFilter: string;
  selectedCandidate: any; showAnalytics: boolean; showAIInsights: boolean;
  showReportModal: boolean; showExportModal: boolean; showMessageModal: boolean;
  showScheduleModal: boolean; showDocModal: boolean;
  messageText: string; scheduleDate: string; scheduleTime: string;
  advancedFilters: boolean; selectedHires: Set<string>;
  pipelineStages: any[]; aiRecommendations: any[]; CLR: Record<string, string>;
  onSetSearchQuery: (v: string) => void; onSetStatusFilter: (v: string) => void;
  onSetDepartmentFilter: (v: string) => void; onSetSelectedCandidate: (v: any) => void;
  onSetShowAnalytics: (v: boolean) => void; onSetShowAIInsights: (v: boolean) => void;
  onSetShowReportModal: (v: boolean) => void; onSetShowExportModal: (v: boolean) => void;
  onSetShowMessageModal: (v: boolean) => void; onSetShowScheduleModal: (v: boolean) => void;
  onSetShowDocModal: (v: boolean) => void; onSetMessageText: (v: string) => void;
  onSetScheduleDate: (v: string) => void; onSetScheduleTime: (v: string) => void;
  onSetAdvancedFilters: (v: boolean) => void;
  onToggleSelect: (id: string) => void; onToggleSelectAll: () => void;
  getStageIcon: (stage: string) => JSX.Element; getStageColor: (stage: string) => string;
  getStageLabel: (stage: string) => string;
}

export default function HiredDashboardContent(props: HiredDashboardContentProps) {
  return <div className="max-w-[1600px] mx-auto space-y-6">
      {/* ===== HERO SECTION ===== */}
      <div className="relative overflow-hidden rounded-2xl p-4 md:p-6 lg:p-8 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.15)]"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-[#6D4CFF]/20 rounded-full blur-[140px]" />
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-[#22C55E]/12 rounded-full blur-[140px]" />
          <div className="absolute top-[40%] left-[50%] w-1/3 h-1/3 bg-[#A855F7]/10 rounded-full blur-[120px]" />
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} animate={{ opacity: [0.05, 0.2, 0.05], y: [0, -(3 + i % 3) * 2, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
              className="absolute rounded-full bg-white/20 pointer-events-none"
              style={{ width: `${1 + (i % 3) * 1.2}px`, height: `${1 + (i % 3) * 1.2}px`, top: `${8 + (i * 11) % 84}%`, left: `${5 + (i * 14) % 90}%` }}
            />
          ))}
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">Recruitment Success</div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-2">
              Hired Candidates
            </h1>
            <p className="text-sm text-white/60 mb-4">
              Track successful hires, monitor onboarding progress, and measure recruitment outcomes.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { icon: Award, label: 'Total Hires', value: props.totalHires, color: 'text-green-300' },
                { icon: CalendarDays, label: 'Joining This Week', value: props.joiningSoon, color: 'text-amber-300' },
                { icon: CheckCircle, label: 'Onboarded', value: props.activeEmployees, color: 'text-blue-300' },
                { icon: TrendingUp, label: 'Offer Acceptance', value: `${props.offerAcceptanceRate}%`, color: 'text-purple-300' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-[10px] text-white/80 font-medium">
                    <Icon size={10} className={item.color} />
                    <span className="font-bold text-white">{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</span>
                    {item.label}
                  </span>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => props.onSetShowReportModal(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#1a1a2e] hover:bg-white/90 text-xs font-bold transition-all shadow-lg">
                <FileText size={14} /> Generate Hiring Report
              </button>
              <button onClick={() => props.onSetShowExportModal(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/25 transition-all backdrop-blur-sm">
                <Download size={14} /> Export Hires
              </button>
              <button onClick={() => props.onSetShowAIInsights(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/12 text-[11px] font-medium text-white/70 border border-white/10 hover:border-white/20 transition-all">
                <Sparkles size={12} /> AI Hiring Insights
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 xl:col-span-4 hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-[280px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#6D4CFF]/30 via-[#22C55E]/10 to-[#3B82F6]/20 rounded-full blur-[70px] opacity-30" />
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative flex items-center justify-center">
                <div className="grid grid-cols-3 gap-3">
                  {['🎉', '🏆', '⭐', '🚀', '💼', '📋', '✅', '🎯', '📈'].map((emoji, i) => (
                    <motion.div key={i} animate={{ y: [0, -3 - (i % 3) * 2, 0], scale: [1, 1.05, 1] }}
                      transition={{ duration: 2 + i * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
                      className="w-10 h-10 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/[0.12] flex items-center justify-center text-lg">
                      {emoji}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ONBOARDING PIPELINE ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {props.pipelineStages.map((stage: any) => {
          const StageIcon = stage.icon;
          const count = props.onboardingPipelineCounts[stage.key] || 0;
          return (
            <motion.div key={stage.key} whileHover={{ y: -2 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 border border-gray-100/80 shadow-sm text-center cursor-pointer hover:shadow-md transition-all"
              onClick={() => props.onSetStatusFilter(stage.key)}>
              <div className="w-8 h-8 rounded-xl mx-auto mb-1.5 flex items-center justify-center"
                style={{ background: `${stage.color}15`, color: stage.color }}>
                <StageIcon size={14} />
              </div>
              <div className="text-lg font-extrabold" style={{ color: stage.color }}>{count}</div>
              <div className="text-[8px] text-gray-400 font-medium leading-tight">{stage.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {[
          { icon: Award, label: 'Total Hires', value: props.totalHires, trend: '+12 This Month', color: props.CLR.primary, chart: [8, 12, 10, 14, 16, 20, 18] },
          { icon: CheckCircle, label: 'Active Employees', value: props.activeEmployees, trend: `${props.activeEmployees} Currently Working`, color: props.CLR.success, chart: [5, 8, 10, 14, 16, 18, 20] },
          { icon: CalendarDays, label: 'Joining Soon', value: props.joiningSoon, trend: 'Upcoming Joining Dates', color: props.CLR.warning, chart: [3, 5, 4, 7, 6, 8, 8] },
          { icon: TrendingUp, label: 'Offer Acceptance Rate', value: `${props.offerAcceptanceRate}%`, trend: '+5% This Quarter', color: props.CLR.teal, chart: [72, 75, 78, 80, 82, 84, 86] },
          { icon: Clock, label: 'Avg Time To Hire', value: `${props.avgTimeToHire} Days`, trend: '-18% Improvement', color: props.CLR.info, chart: [18, 17, 16, 15, 15, 14, 14] },
          { icon: Bot, label: 'Hiring Quality Score', value: `${props.qualityScore}%`, trend: 'AI Assessment', color: props.CLR.purple, chart: [78, 80, 82, 85, 86, 88, props.qualityScore] },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3, scale: 1.01 }}
              className="group bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-xl" style={{ background: `${card.color}12`, color: card.color }}>
                  <Icon size={16} />
                </div>
                {card.trend && (
                  <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <ArrowUpRight size={9} />{card.trend}
                  </span>
                )}
              </div>
              <div className="text-lg md:text-xl font-extrabold text-gray-900">
                {typeof card.value === 'number' ? <Counter value={card.value} /> : card.value}
              </div>
              <div className="text-[10px] text-gray-400 font-medium">{card.label}</div>
              <div className="mt-1 h-8">
                <MiniChart data={card.chart} color={card.color} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ===== QUICK ACTIONS + AI RECOMMENDATIONS + RECENT ACTIVITY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
          <h3 className="text-xs font-bold text-gray-800 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { icon: Mail, label: 'Bulk Email', color: props.CLR.info, action: () => props.onSetShowMessageModal(true) },
              { icon: CalendarDays, label: 'Schedule Orientation', color: props.CLR.warning, action: () => props.onSetShowScheduleModal(true) },
              { icon: Download, label: 'Export CSV', color: props.CLR.primary, action: () => props.onSetShowExportModal(true) },
              { icon: FileText, label: 'Hiring Report', color: props.CLR.teal, action: () => props.onSetShowReportModal(true) },
              { icon: UserCheck, label: 'Assign Mentor', color: props.CLR.purple, action: () => {} },
              { icon: School, label: 'Send Onboarding Kit', color: props.CLR.orange, action: () => {} },
            ].map((action, i) => {
              const ActionIcon = action.icon;
              return (
                <button key={i} onClick={action.action}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:-translate-y-0.5">
                  <div className="p-1.5 rounded-lg transition-transform group-hover:scale-110" style={{ background: `${action.color}12`, color: action.color }}>
                    <ActionIcon size={13} />
                  </div>
                  <span className="text-[8px] font-semibold text-gray-500 group-hover:text-gray-700 text-center leading-tight">{action.label}</span>
                </button>
              );
            })}
          </div>
          {props.selectedHires.size > 0 && (
            <div className="mt-3 p-2 rounded-xl bg-[#6D4CFF]/5 border border-[#6D4CFF]/10 text-center">
              <span className="text-[10px] font-semibold text-[#6D4CFF]">{props.selectedHires.size} selected</span>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="lg:col-span-1 bg-gradient-to-br from-[#6D4CFF]/5 via-[#A855F7]/5 to-[#EC4899]/5 rounded-2xl p-4 border border-[#6D4CFF]/10 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center shadow-sm">
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-800">AI Insights</h3>
            </div>
          </div>
          <div className="space-y-2">
            {props.aiRecommendations.slice(0, 4).map((rec: any, i: number) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-white/60 hover:bg-white/80 transition-colors cursor-pointer">
                <div className={`p-1 rounded-lg flex-shrink-0 mt-0.5 ${
                  rec.priority === 'high' ? 'bg-red-50 text-red-500' :
                  rec.priority === 'medium' ? 'bg-amber-50 text-amber-500' :
                  'bg-blue-50 text-blue-500'
                }`}>
                  {rec.priority === 'high' ? <Zap size={10} /> :
                   rec.priority === 'medium' ? <Clock size={10} /> : <Info size={10} />}
                </div>
                <span className="text-[10px] font-medium text-gray-600 leading-relaxed">{rec.text}</span>
              </div>
            ))}
          </div>
          <button onClick={() => props.onSetShowAIInsights(true)} className="w-full mt-2 py-1.5 rounded-xl bg-[#6D4CFF]/10 text-[#6D4CFF] text-[10px] font-bold hover:bg-[#6D4CFF]/20 transition-all flex items-center justify-center gap-1">
            <Sparkles size={11} /> View All AI Recommendations
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-800">Recent Activity</h3>
            <button className="text-[9px] font-semibold text-[#6D4CFF] hover:underline">View All</button>
          </div>
          <div className="space-y-1 max-h-[160px] overflow-y-auto">
            {props.hired.length === 0 ? (
              <div className="text-center py-4 text-[10px] text-gray-400">No recent activity</div>
            ) : (
              props.hired.slice(0, 5).map((c: any, i: number) => (
                <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6D4CFF]/10 to-[#A855F7]/10 flex items-center justify-center text-[8px] font-bold text-[#6D4CFF]">
                    {(c.applicant_name || '?')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-gray-700 truncate">{c.applicant_name}</div>
                    <div className="text-[8px] text-gray-400">Status updated to {props.getStageLabel(c.onboarding_stage || 'offer_accepted')}</div>
                  </div>
                  <span className="text-[8px] text-gray-300 flex-shrink-0">
                    {c.updated_at ? new Date(c.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* ===== FILTER BAR ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'All Hires', count: props.hired.length },
            ...props.pipelineStages.map((s: any) => ({ key: s.key, label: s.label, count: props.onboardingPipelineCounts[s.key] || 0 })),
          ].map(tab => (
            <button key={tab.key} onClick={() => props.onSetStatusFilter(tab.key)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                props.statusFilter === tab.key
                  ? 'bg-[#6D4CFF] text-white shadow-sm'
                  : 'bg-white/80 text-gray-500 hover:bg-gray-100 border border-gray-200/80'
              }`}>
              {tab.label}
              <span className={`text-[8px] px-1 py-0.5 rounded-full ${
                props.statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={props.searchQuery} onChange={e => props.onSetSearchQuery(e.target.value)}
              placeholder="Search candidates..."
              className="w-full sm:w-48 pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF] bg-white/90" />
          </div>
          <button onClick={() => props.onSetAdvancedFilters(!props.advancedFilters)}
            className={`p-1.5 rounded-xl border transition-all ${
              props.advancedFilters ? 'bg-[#6D4CFF]/10 border-[#6D4CFF] text-[#6D4CFF]' : 'border-gray-200 text-gray-400 hover:bg-gray-50'
            }`}>
            <Filter size={14} />
          </button>
          <button onClick={() => props.onSetShowAnalytics(true)}
            className="p-1.5 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50">
            <BarChart3 size={14} />
          </button>
        </div>
      </div>

      {/* ===== CANDIDATE TABLE ===== */}
      {props.hired.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 border border-gray-100/80 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-[#F3F0FF] flex items-center justify-center mx-auto mb-4">
            <Award size={40} className="text-[#6D4CFF]" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">No Hired Candidates Yet</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">When you accept candidates, they will appear here with their hiring and onboarding details.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5a3ed9] transition-all shadow-md shadow-purple-200">
              <TrendingUp size={14} /> View Applications
            </button>
            <button onClick={() => props.onSetShowAIInsights(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 text-xs font-semibold hover:from-purple-100 hover:to-pink-100 border border-purple-200 transition-all">
              <Sparkles size={14} /> Ask Prerana AI
            </button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="w-8 px-3 py-3">
                    <input type="checkbox" checked={props.selectedHires.size === props.filtered.length && props.filtered.length > 0}
                      onChange={props.onToggleSelectAll} className="rounded border-gray-300 text-[#6D4CFF] focus:ring-[#6D4CFF] w-3 h-3" />
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">Candidate</th>
                  <th className="text-left px-3 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">Hired For</th>
                  <th className="text-left px-3 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">AI Score</th>
                  <th className="text-left px-3 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">Offer Date</th>
                  <th className="text-left px-3 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">Onboarding Stage</th>
                  <th className="text-right px-3 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {props.filtered.map((c: any) => (
                  <motion.tr key={c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-b border-gray-50 hover:bg-[#F8F6FF] transition-colors group">
                    <td className="px-3 py-3">
                      <input type="checkbox" checked={props.selectedHires.has(c.id)} onChange={() => props.onToggleSelect(c.id)}
                        className="rounded border-gray-300 text-[#6D4CFF] focus:ring-[#6D4CFF] w-3 h-3" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => props.onSetSelectedCandidate(c)}>
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6D4CFF]/10 to-[#A855F7]/10 flex items-center justify-center text-xs font-bold text-[#6D4CFF] flex-shrink-0">
                          {(c.applicant_name || '?')[0]}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-800 group-hover:text-[#6D4CFF] transition-colors">{c.applicant_name}</div>
                          <div className="text-[9px] text-gray-400">{c.applicant_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-[11px] font-medium text-gray-700">{c.applicant_role || 'N/A'}</div>
                      <div className="text-[9px] text-gray-400">{c.department || 'N/A'}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: `${c.ai_score || 0}%`,
                            background: (c.ai_score || 0) >= 90 ? 'linear-gradient(90deg, #22C55E, #16A34A)' :
                              (c.ai_score || 0) >= 75 ? 'linear-gradient(90deg, #6D4CFF, #8B6FFF)' :
                              (c.ai_score || 0) >= 60 ? 'linear-gradient(90deg, #F59E0B, #FBBF24)' :
                              'linear-gradient(90deg, #EF4444, #DC2626)'
                          }} />
                        </div>
                        <span className={`text-[10px] font-bold ${
                          (c.ai_score || 0) >= 90 ? 'text-green-600' :
                          (c.ai_score || 0) >= 75 ? 'text-[#6D4CFF]' :
                          (c.ai_score || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}>{c.ai_score || 0}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[10px] text-gray-400">
                      {c.hired_at || c.created_at ? new Date(c.hired_at || c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
                        style={{ background: props.getStageColor(c.onboarding_stage || 'offer_accepted') + '15', color: props.getStageColor(c.onboarding_stage || 'offer_accepted') }}>
                        {props.getStageIcon(c.onboarding_stage || 'offer_accepted')}
                        {props.getStageLabel(c.onboarding_stage || 'offer_accepted')}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => props.onSetSelectedCandidate(c)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF] transition-all" title="View Profile">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => props.onSetShowMessageModal(true)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF] transition-all" title="Send Message">
                          <MessageSquare size={13} />
                        </button>
                        <button onClick={() => props.onSetShowScheduleModal(true)}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-all" title="Schedule">
                          <CalendarDays size={13} />
                        </button>
                        <div className="relative group/more">
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                            <MoreHorizontal size={13} />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-gray-200 shadow-lg z-20 hidden group-hover/more:block">
                            {props.pipelineStages.map((s: any) => (
                              <button key={s.key}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] text-gray-600 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                                style={{ color: s.color }}>
                                {props.getStageIcon(s.key)} Move to {s.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="opacity-100 group-hover:opacity-0 transition-opacity flex items-center justify-end gap-1">
                        <span className="text-[9px] text-gray-300">{c.applicant_phone?.slice(-4) || ''}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {props.filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <Search size={24} className="mx-auto text-gray-200 mb-2" />
                      <p className="text-sm text-gray-400 font-medium">No candidates match your search</p>
                      <button onClick={() => { props.onSetSearchQuery(''); props.onSetStatusFilter('all'); }} className="mt-2 text-[10px] text-[#6D4CFF] font-semibold hover:underline">Clear filters</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/30">
            <span className="text-[10px] text-gray-400">{props.filtered.length} of {props.hired.length} hired candidates</span>
          </div>
        </motion.div>
      )}

      {/* ===== CANDIDATE PROFILE MODAL ===== */}
      <AnimatePresence>
        {props.selectedCandidate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={() => props.onSetSelectedCandidate(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-10 flex items-center justify-between px-5 py-3">
                <h3 className="text-sm font-bold text-gray-800">Candidate Profile</h3>
                <button onClick={() => props.onSetSelectedCandidate(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center text-xl font-bold text-white shadow-md shadow-purple-200">
                    {(props.selectedCandidate.applicant_name || '?')[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-gray-900">{props.selectedCandidate.applicant_name}</div>
                    <div className="text-xs text-gray-400">{props.selectedCandidate.applicant_role}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: props.getStageColor(props.selectedCandidate.onboarding_stage || 'offer_accepted') + '15', color: props.getStageColor(props.selectedCandidate.onboarding_stage || 'offer_accepted') }}>
                        {props.getStageIcon(props.selectedCandidate.onboarding_stage || 'offer_accepted')} {props.getStageLabel(props.selectedCandidate.onboarding_stage || 'offer_accepted')}
                      </span>
                      <span className="text-[9px] text-gray-400">ID: {props.selectedCandidate.id}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#F3F0FF] to-[#FAF5FF] rounded-2xl p-4 border border-[#6D4CFF]/10">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#6D4CFF" strokeWidth="4"
                          strokeDasharray={`${(props.selectedCandidate.ai_score || 0) * 1.76} 176`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-extrabold text-[#6D4CFF]">{props.selectedCandidate.ai_score || 0}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-gray-800">AI Match Score</div>
                      <div className="text-[10px] text-gray-500 mb-2">Based on skills, experience & assessment</div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Skills', value: props.selectedCandidate.ai_score || 0 },
                          { label: 'Communication', value: props.selectedCandidate.communication_score || 0 },
                          { label: 'Culture Fit', value: props.selectedCandidate.culture_fit_score || 0 },
                          { label: 'Experience', value: props.selectedCandidate.experience_score || 0 },
                        ].map((score, i) => (
                          <div key={i} className="text-center">
                            <div className="text-[9px] font-bold text-gray-700">{score.value}%</div>
                            <div className="text-[7px] text-gray-400">{score.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-1"><Mail size={10} /> Email</div>
                    <div className="text-[11px] font-semibold text-gray-700 truncate">{props.selectedCandidate.applicant_email}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-1"><Phone size={10} /> Phone</div>
                    <div className="text-[11px] font-semibold text-gray-700">{props.selectedCandidate.applicant_phone || 'N/A'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-1"><MapPin size={10} /> Location</div>
                    <div className="text-[11px] font-semibold text-gray-700">{props.selectedCandidate.location || 'N/A'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-1"><GraduationCap size={10} /> Education</div>
                    <div className="text-[11px] font-semibold text-gray-700 truncate">{props.selectedCandidate.education || 'N/A'}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F3F0FF] border border-[#6D4CFF]/10">
                  <div className="flex items-center gap-1.5 text-[9px] text-[#6D4CFF] font-semibold mb-1">
                    <Briefcase size={10} /> Hired For
                  </div>
                  <div className="text-xs font-bold text-gray-800">{props.selectedCandidate.applicant_role || 'Unknown Position'}</div>
                  <div className="text-[9px] text-gray-500 mt-1">{props.selectedCandidate.department || 'N/A'} department</div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => props.onSetShowMessageModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5a3ed9] transition-all shadow-md shadow-purple-200">
                    <MessageSquare size={13} /> Send Message
                  </button>
                  <button onClick={() => props.onSetShowScheduleModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
                    <CalendarDays size={13} /> Schedule
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== AI INSIGHTS MODAL ===== */}
      <AnimatePresence>
        {props.showAIInsights && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => props.onSetShowAIInsights(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[560px] bg-white rounded-2xl shadow-2xl z-50 overflow-y-auto max-h-[90vh] border border-gray-200">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center">
                    <Sparkles size={15} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">AI Hiring Insights</h3>
                    <p className="text-[9px] text-gray-400">Powered by Prerana AI</p>
                  </div>
                </div>
                <button onClick={() => props.onSetShowAIInsights(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-gradient-to-br from-[#F3F0FF] to-[#FAF5FF] rounded-2xl p-4 border border-[#6D4CFF]/10">
                  <h4 className="text-xs font-bold text-gray-800 mb-3">Top Candidate Matches</h4>
                  {props.hired.sort((a: any, b: any) => (b.ai_score || 0) - (a.ai_score || 0)).slice(0, 5).map((c: any, i: number) => (
                    <div key={i} className="flex items-center gap-2.5 py-2 border-b border-[#6D4CFF]/5 last:border-0">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6D4CFF]/10 to-[#A855F7]/10 flex items-center justify-center text-[9px] font-bold text-[#6D4CFF]">
                        {(c.applicant_name || '?')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-gray-700">{c.applicant_name}</div>
                        <div className="text-[9px] text-gray-400">{c.applicant_role}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-extrabold text-[#6D4CFF]">{c.ai_score}%</div>
                        <div className="text-[7px] text-gray-400">Match</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                  <h4 className="text-xs font-bold text-green-800 mb-2">AI Recommendations</h4>
                  <div className="space-y-2">
                    {props.aiRecommendations.map((rec: any, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className={`p-1 rounded-lg mt-0.5 ${
                          rec.priority === 'high' ? 'bg-red-50 text-red-500' :
                          rec.priority === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                        }`}>
                          {rec.priority === 'high' ? <Zap size={10} /> :
                           rec.priority === 'medium' ? <Clock size={10} /> : <Info size={10} />}
                        </div>
                        <span className="text-[10px] text-gray-600">{rec.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-800 mb-2">Hiring Summary</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Total Hired', value: props.totalHires, color: props.CLR.primary },
                      { label: 'Onboarded', value: props.activeEmployees, color: props.CLR.success },
                      { label: 'Awaiting Onboarding', value: props.totalHires - props.activeEmployees, color: props.CLR.warning },
                      { label: 'Avg Quality Score', value: `${props.qualityScore}%`, color: props.CLR.purple },
                    ].map((item, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white/80 border border-blue-100/50">
                        <div className="text-[8px] text-gray-400">{item.label}</div>
                        <div className="text-sm font-extrabold" style={{ color: item.color }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== ANALYTICS MODAL ===== */}
      <AnimatePresence>
        {props.showAnalytics && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => props.onSetShowAnalytics(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[640px] bg-white rounded-2xl shadow-2xl z-50 overflow-y-auto max-h-[90vh] border border-gray-200">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between p-4">
                <h3 className="text-sm font-bold">Hiring Analytics</h3>
                <button onClick={() => props.onSetShowAnalytics(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-5">
                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-600 mb-3 uppercase tracking-wider">Hiring Trend</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={[]}>
                      <defs>
                        <linearGradient id="hiredTrendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22C55E" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #F3F4F6' }} />
                      <Area type="monotone" dataKey="hires" stroke="#22C55E" strokeWidth={2} fill="url(#hiredTrendGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                    <h4 className="text-[10px] font-bold text-gray-600 mb-3 uppercase tracking-wider">Hire Sources</h4>
                    <div className="flex items-center justify-center h-[140px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[]} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="none" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center mt-1">
                      <span className="text-[8px] text-gray-400">No source data</span>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                    <h4 className="text-[10px] font-bold text-gray-600 mb-3 uppercase tracking-wider">Onboarding Funnel</h4>
                    <div className="space-y-2">
                      {props.pipelineStages.map((s: any) => (
                        <div key={s.key} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                          <span className="text-[9px] text-gray-500 flex-1">{s.label}</span>
                          <span className="text-[9px] font-bold text-gray-700">{props.onboardingPipelineCounts[s.key] || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Offer Acceptance', value: `${props.offerAcceptanceRate}%`, color: props.CLR.teal },
                    { label: 'Onboarding Rate', value: `${Math.round((props.activeEmployees / Math.max(props.totalHires, 1)) * 100)}%`, color: props.CLR.success },
                    { label: 'Avg Time to Hire', value: `${props.avgTimeToHire}d`, color: props.CLR.info },
                    { label: 'Quality Score', value: `${props.qualityScore}%`, color: props.CLR.purple },
                  ].map((metric, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white border border-gray-100 text-center">
                      <div className="text-sm font-extrabold" style={{ color: metric.color }}>{metric.value}</div>
                      <div className="text-[8px] text-gray-400 mt-0.5">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== MESSAGE MODAL ===== */}
      <AnimatePresence>
        {props.showMessageModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-50" onClick={() => props.onSetShowMessageModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] bg-white rounded-2xl shadow-2xl z-50 border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold">
                  {props.selectedCandidate ? `Message ${props.selectedCandidate.applicant_name}` : 'Send Message'}
                </h3>
                <button onClick={() => props.onSetShowMessageModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-3">
                {props.selectedCandidate && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF]/10 to-[#A855F7]/10 flex items-center justify-center text-xs font-bold text-[#6D4CFF]">
                      {props.selectedCandidate.applicant_name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{props.selectedCandidate.applicant_name}</div>
                      <div className="text-[9px] text-gray-400">{props.selectedCandidate.applicant_email}</div>
                    </div>
                  </div>
                )}
                <textarea value={props.messageText} onChange={e => props.onSetMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF] resize-none" />
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50"><Paperclip size={14} /></button>
                  <button onClick={() => { props.onSetShowMessageModal(false); props.onSetMessageText(''); }}
                    disabled={!props.messageText.trim()}
                    className="flex-1 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5a3ed9] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                    <Send size={13} /> Send Message
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== SCHEDULE MODAL ===== */}
      <AnimatePresence>
        {props.showScheduleModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-50" onClick={() => props.onSetShowScheduleModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] bg-white rounded-2xl shadow-2xl z-50 border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold">Schedule Onboarding</h3>
                <button onClick={() => props.onSetShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-3">
                {props.selectedCandidate && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF]/10 to-[#A855F7]/10 flex items-center justify-center text-xs font-bold text-[#6D4CFF]">
                      {props.selectedCandidate.applicant_name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{props.selectedCandidate.applicant_name}</div>
                      <div className="text-[9px] text-gray-400">{props.selectedCandidate.applicant_role}</div>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-1 block">Date</label>
                  <input type="date" value={props.scheduleDate} onChange={e => props.onSetScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-1 block">Time</label>
                  <input type="time" value={props.scheduleTime} onChange={e => props.onSetScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-1 block">Type</label>
                  <select className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF] bg-white">
                    <option value="orientation">Orientation Session</option>
                    <option value="documentation">Documentation Review</option>
                    <option value="team_intro">Team Introduction</option>
                    <option value="training">Training Session</option>
                  </select>
                </div>
                <button onClick={() => { props.onSetShowScheduleModal(false); }}
                  disabled={!props.scheduleDate || !props.scheduleTime}
                  className="w-full py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5a3ed9] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <CalendarDays size={13} /> Schedule
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== REPORT MODAL ===== */}
      <AnimatePresence>
        {props.showReportModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-50" onClick={() => props.onSetShowReportModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] bg-white rounded-2xl shadow-2xl z-50 border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold">Generate Hiring Report</h3>
                <button onClick={() => props.onSetShowReportModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-4">
                <p className="text-[10px] text-gray-500">Generate a comprehensive hiring report covering all hired candidates, onboarding status, and key metrics.</p>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-1 block">Report Type</label>
                  <select className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF] bg-white">
                    <option value="summary">Executive Summary</option>
                    <option value="detailed">Detailed Hiring Report</option>
                    <option value="onboarding">Onboarding Status Report</option>
                    <option value="analytics">Analytics Report</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-1 block">Format</label>
                  <div className="flex gap-2">
                    {['PDF', 'Excel', 'CSV'].map(f => (
                      <button key={f} className="flex-1 py-2 rounded-xl border border-gray-200 text-[10px] font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">{f}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-1 block">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" className="px-3 py-2 rounded-xl border border-gray-200 text-[10px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" placeholder="From" />
                    <input type="date" className="px-3 py-2 rounded-xl border border-gray-200 text-[10px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" placeholder="To" />
                  </div>
                </div>
                <button onClick={() => props.onSetShowReportModal(false)}
                  className="w-full py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5a3ed9] transition-all flex items-center justify-center gap-1.5">
                  <FileText size={13} /> Generate Report
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== EXPORT MODAL ===== */}
      <AnimatePresence>
        {props.showExportModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-50" onClick={() => props.onSetShowExportModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] bg-white rounded-2xl shadow-2xl z-50 border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold">Export Hires</h3>
                <button onClick={() => props.onSetShowExportModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-[10px] text-gray-500">Export hired candidates data for external use.</p>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-2 block">Export Options</label>
                  {[
                    { label: 'All Hires', desc: `${props.totalHires} candidates`, default: true },
                    { label: 'Selected Only', desc: `${props.selectedHires.size} candidates`, default: false },
                    { label: 'By Department', desc: `${props.departments.length} departments`, default: false },
                  ].map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <input type="radio" name="export" defaultChecked={opt.default} className="text-[#6D4CFF] focus:ring-[#6D4CFF]" />
                      <div>
                        <div className="text-[10px] font-medium text-gray-700">{opt.label}</div>
                        <div className="text-[8px] text-gray-400">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2 rounded-xl bg-[#6D4CFF] text-white text-[10px] font-bold hover:bg-[#5a3ed9] transition-all flex items-center justify-center gap-1">
                    <Download size={12} /> Export CSV
                  </button>
                  <button className="py-2 rounded-xl border border-gray-200 text-gray-600 text-[10px] font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-1">
                    <FileText size={12} /> Export PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>;
}