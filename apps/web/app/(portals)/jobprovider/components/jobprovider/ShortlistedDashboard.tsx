'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Mic, Award, TrendingUp, Sparkles, Search, Filter, X,
  ChevronDown, Download, FileText, Mail, Phone, MapPin,
  Briefcase, CalendarDays, MessageSquare, Eye, UserCheck, Video,
  Clock, ThumbsUp, GraduationCap, Globe, Code2, Link, RefreshCw,
  MoreHorizontal, Upload, Send, Sliders, Ban, CheckCircle,
  Hourglass, BarChart3, Activity, Target, Zap, Bookmark, Plus, Bot,
  ArrowUpRight, CheckSquare, Square, Trash2, AlertCircle, HelpCircle,
  Building2, Settings, Bell, LogOut, Menu, DollarSign, School, Loader,
  ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, ListChecks,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart as ReLineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  CartesianGrid,
} from 'recharts';
import apiClient from '../../lib/apiClient';

const CLR = {
  primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B',
  danger: '#EF4444', info: '#3B82F6', purple: '#A855F7',
  indigo: '#4F46E5', pink: '#EC4899', teal: '#14B8A6',
};

const aiRecommendations = [
  { type: 'match', text: 'Sneha Reddy has 96% match for Data Science role - recommend immediate interview', priority: 'high' },
  { type: 'review', text: '3 candidates require final stage review this week', priority: 'high' },
  { type: 'quality', text: 'Shortlisted candidate quality improved 21% this month', priority: 'medium' },
  { type: 'schedule', text: '2 interview slots open tomorrow - consider scheduling', priority: 'medium' },
  { type: 'hiring', text: 'Product Manager role has highest quality shortlist ever', priority: 'low' },
];

const pipelineStages = [
  { key: 'shortlisted', label: 'Shortlisted', icon: Star, color: CLR.purple },
  { key: 'interview', label: 'Interview Scheduled', icon: Video, color: CLR.warning },
  { key: 'offer', label: 'Offer Sent', icon: FileText, color: CLR.teal },
  { key: 'hired', label: 'Hired', icon: Award, color: CLR.success },
];

function Counter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const inc = value / (duration / 16);
    const timer = setInterval(() => {
      start += inc;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{count.toLocaleString()}</>;
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data.map((v, i) => ({ i, v }))}>
        <defs>
          <linearGradient id={`smc${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#smc${color.replace('#', '')})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function ShortlistedDashboard({ provider }: { provider: any }) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [messageModal, setMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<any[]>([]);
  const [dragItem, setDragItem] = useState<any>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const loadShortlisted = () => {
    setLoading(true);
    apiClient.get<any[]>('/job-provider/applications/shortlisted').then(r => {
      if (r.success && Array.isArray(r.data) && r.data.length > 0) setCandidates(r.data);
      else setCandidates([]);
      setLoading(false);
    }).catch(() => { setCandidates([]); setLoading(false); });
  };

  useEffect(() => { loadShortlisted(); }, []);

  const allCandidates = candidates;

  const filteredCandidates = useMemo(() => {
    let items = allCandidates;
    if (filterTab === 'ai_recommended') items = items.filter((c: any) => (c.ai_score || 0) >= 90);
    else if (filterTab === 'interview_ready') items = items.filter((c: any) => c.status === 'shortlisted' && (c.ai_score || 0) >= 80);
    else if (filterTab === 'high_match') items = items.sort((a: any, b: any) => (b.ai_score || 0) - (a.ai_score || 0)).slice(0, 5);
    else if (filterTab === 'recent') items = items.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (filterTab === 'offer') items = items.filter((c: any) => c.status === 'offer' || c.status === 'hired');
    else if (filterTab !== 'all') items = items.filter((c: any) => c.status === filterTab);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((c: any) =>
        (c.applicant_name || '').toLowerCase().includes(q) ||
        (c.applicant_email || '').toLowerCase().includes(q) ||
        (c.skills || '').toLowerCase().includes(q) ||
        (c.college || '').toLowerCase().includes(q) ||
        (c.part_time_jobs?.title || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [allCandidates, filterTab, search]);

  const totalShortlisted = allCandidates.length;
  const interviewScheduled = allCandidates.filter((c: any) => c.status === 'interview').length;
  const aiRecommended = allCandidates.filter((c: any) => (c.ai_score || 0) >= 90).length;
  const hires = allCandidates.filter((c: any) => c.status === 'hired').length;
  const avgScore = Math.round(allCandidates.reduce((s: number, c: any) => s + (c.ai_score || 0), 0) / Math.max(allCandidates.length, 1));
  const conversionRate = totalShortlisted > 0 ? Math.round((hires / totalShortlisted) * 100) : 0;

  const pipelineData = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    pipelineStages.forEach(s => { grouped[s.key] = []; });
    allCandidates.forEach((c: any) => {
      const status = c.status || 'shortlisted';
      if (grouped[status]) grouped[status].push(c);
      else grouped['shortlisted'].push(c);
    });
    return grouped;
  }, [allCandidates]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const r = await apiClient.patch(`/job-provider/applications/${id}/status`, { status });
      if (r.success) {
        setCandidates((prev: any[]) => prev.map((c: any) => c.id === id ? { ...c, status } : c));
        setSelectedProfile((prev: any) => prev?.id === id ? { ...prev, status } : prev);
      }
    } catch { }
  };

  const handleDragStart = (e: React.DragEvent, c: any) => {
    setDragItem(c);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    if (dragItem && dragItem.status !== stage) updateStatus(dragItem.id, stage);
    setDragItem(null);
    setDragOverStage(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedCandidates(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCompare = (c: any) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === c.id);
      if (exists) return prev.filter(p => p.id !== c.id);
      if (prev.length >= 3) return prev;
      return [...prev, c];
    });
  };

  const bulkAction = (status: string) => {
    selectedCandidates.forEach(id => updateStatus(id, status));
    setSelectedCandidates(new Set());
  };

  const getScoreColor = (score: number) =>
    score >= 90 ? '#22C55E' : score >= 75 ? '#6D4CFF' : score >= 60 ? '#F59E0B' : '#EF4444';

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" />
        <span className="text-xs text-gray-400 font-medium">Loading shortlisted candidates...</span>
      </div>
    </div>
  );

  const isEmpty = allCandidates.length === 0 && !loading;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* ===== HERO ===== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="hero-section relative overflow-hidden rounded-2xl p-4 md:p-6 lg:p-8 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.15)]">
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-[#A855F7]/15 rounded-full blur-[140px]" />
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-[#3B82F6]/12 rounded-full blur-[140px]" />
          <div className="absolute top-[40%] left-[50%] w-1/3 h-1/3 bg-[#EC4899]/6 rounded-full blur-[120px]" />
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} animate={{ opacity: [0.05, 0.3, 0.05], y: [0, -(4 + i % 3) * 2, 0] }}
              transition={{ duration: 3 + i * 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
              className="absolute rounded-full bg-white/20 pointer-events-none"
              style={{ width: `${1 + i % 2}px`, height: `${1 + i % 2}px`, top: `${10 + i * 12}%`, left: `${8 + i * 10}%` }}
            />
          ))}
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">Talent Pipeline</div>
            <h1 className="hero-title mb-2">Shortlisted Candidates</h1>
            <p className="hero-desc mb-4">Manage high-potential applicants, evaluate talent, schedule interviews, and accelerate hiring decisions.</p>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {[
                { icon: Star, value: totalShortlisted, label: 'Shortlisted', color: 'text-purple-300' },
                { icon: Mic, value: interviewScheduled, label: 'Interviews', color: 'text-amber-300' },
                { icon: Sparkles, value: aiRecommended, label: 'AI Recommended', color: 'text-blue-300' },
                { icon: Award, value: hires, label: 'Hired', color: 'text-green-300' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <span key={i} className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-[10px] text-white/80 font-medium">
                    <Icon size={10} className={item.color} />
                    <span className="font-bold text-white"><Counter value={item.value} /></span>
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-5 xl:col-span-4 flex flex-wrap gap-2 justify-start lg:justify-end">
            <button onClick={() => setScheduleModal(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-[#6D4CFF] hover:bg-white/90 hover:-translate-y-0.5 text-[11px] font-bold shadow-[0_4px_12px_rgba(255,255,255,0.15)] transition-all duration-200">
              <CalendarDays size={13} /> Schedule Interviews
            </button>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 text-[11px] font-semibold text-white border border-white/25 transition-all duration-200 backdrop-blur-sm">
              <Download size={13} /> Export
            </button>
            <button onClick={() => setShowAnalytics(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 text-[11px] font-semibold text-white border border-white/25 transition-all duration-200 backdrop-blur-sm">
              <FileText size={13} /> Report
            </button>
            <button onClick={() => setShowAiPanel(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 hover:from-purple-500/40 hover:to-pink-500/40 hover:-translate-y-0.5 text-[11px] font-semibold text-white border border-white/20 transition-all duration-200 backdrop-blur-sm">
              <Sparkles size={13} /> AI Insights
            </button>
          </div>
        </div>
      </motion.div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {[
          { icon: Star, label: 'Shortlisted Candidates', value: totalShortlisted, trend: '', sub: 'Total Pipeline', color: CLR.purple, chart: [8, 12, 6, 14, 10, 16, 12] },
          { icon: Mic, label: 'Interviews Pending', value: interviewScheduled, trend: '+3', sub: 'This Week', color: CLR.warning, chart: [4, 6, 3, 7, 5, 8, 6] },
          { icon: Sparkles, label: 'AI Recommended', value: aiRecommended, trend: '', sub: 'Top Talent', color: CLR.info, chart: [3, 5, 2, 6, 4, 7, 5] },
          { icon: Award, label: 'Successful Hires', value: hires, trend: '+2', sub: 'This Month', color: CLR.success, chart: [1, 2, 1, 3, 2, 4, 3] },
          { icon: TrendingUp, label: 'Hiring Conversion', value: `${conversionRate}%`, trend: '', sub: 'Shortlist to Hire', color: CLR.teal, chart: [15, 20, 18, 25, 22, 28, conversionRate] },
          { icon: Target, label: 'Avg Match Score', value: `${avgScore}%`, trend: '+4%', sub: 'This Month', color: CLR.pink, chart: [80, 83, 82, 87, 85, 89, avgScore] },
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
              {card.sub && <div className="text-[9px] text-gray-300 mt-0.5">{card.sub}</div>}
              <div className="mt-1 h-8"><MiniChart data={card.chart} color={card.color} /></div>
            </motion.div>
          );
        })}
      </div>

      {/* ===== QUICK ACTIONS + AI RECS + ACTIVITY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
          <h3 className="text-xs font-bold text-gray-800 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { icon: Video, label: 'Schedule', color: CLR.warning, action: () => setScheduleModal(true) },
              { icon: Mail, label: 'Bulk Email', color: CLR.info, action: () => setMessageModal(true) },
              { icon: Download, label: 'Export Data', color: CLR.primary, action: () => {} },
              { icon: FileText, label: 'Hire Report', color: CLR.teal, action: () => setShowAnalytics(true) },
              { icon: CheckSquare, label: 'Send Assessment', color: CLR.purple, action: () => {} },
              { icon: Upload, label: 'Request Docs', color: CLR.indigo, action: () => {} },
            ].map((action, i) => {
              const ActionIcon = action.icon;
              return (
                <button key={i} onClick={action.action}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ '--hover-color': action.color } as React.CSSProperties}>
                  <div className="p-1.5 rounded-lg transition-transform" style={{ background: `${action.color}12`, color: action.color }}>
                    <ActionIcon size={13} />
                  </div>
                  <span className="text-[8px] font-semibold text-gray-500 text-center leading-tight">{action.label}</span>
                </button>
              );
            })}
          </div>
          {selectedCandidates.size > 0 && (
            <div className="mt-3 p-2 rounded-xl bg-[#6D4CFF]/5 border border-[#6D4CFF]/10">
              <div className="text-[10px] font-semibold text-[#6D4CFF] text-center">{selectedCandidates.size} selected</div>
              <div className="flex gap-1 mt-1.5">
                <button onClick={() => bulkAction('interview')} className="flex-1 py-1 rounded-lg bg-amber-50 text-amber-600 text-[8px] font-semibold">Schedule</button>
                <button onClick={() => bulkAction('rejected')} className="flex-1 py-1 rounded-lg bg-red-50 text-red-600 text-[8px] font-semibold">Reject</button>
              </div>
            </div>
          )}
          {compareList.length > 0 && (
            <div className="mt-2 p-2 rounded-xl bg-blue-50 border border-blue-100">
              <div className="text-[10px] font-semibold text-blue-600 text-center">{compareList.length} in comparison</div>
              <button onClick={() => setCompareMode(true)} className="w-full mt-1 py-1 rounded-lg bg-blue-500 text-white text-[8px] font-semibold">Compare Now</button>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="lg:col-span-1 bg-gradient-to-br from-[#6D4CFF]/5 via-[#A855F7]/5 to-[#EC4899]/5 rounded-2xl p-4 border border-[#6D4CFF]/10 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center shadow-sm">
              <Sparkles size={15} className="text-white" />
            </div>
            <h3 className="text-xs font-bold text-gray-800">AI Talent Insights</h3>
          </div>
          <div className="space-y-2">
            {aiRecommendations.slice(0, 4).map((rec, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-white/60 hover:bg-white/80 transition-colors cursor-pointer">
                <div className={`p-1 rounded-lg flex-shrink-0 mt-0.5 ${
                  rec.priority === 'high' ? 'bg-red-50 text-red-500' :
                  rec.priority === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                }`}>
                  {rec.priority === 'high' ? <Zap size={10} /> : rec.priority === 'medium' ? <Clock size={10} /> : <Activity size={10} />}
                </div>
                <span className="text-[10px] font-medium text-gray-600 leading-relaxed">{rec.text}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setShowAiPanel(true)} className="w-full mt-2 py-1.5 rounded-xl bg-[#6D4CFF]/10 text-[#6D4CFF] text-[10px] font-bold hover:bg-[#6D4CFF]/20 transition-all flex items-center justify-center gap-1">
            <Sparkles size={11} /> View All AI Insights
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-800">Recruiter Activity</h3>
            <button className="text-[9px] font-semibold text-[#6D4CFF] hover:underline">View All</button>
          </div>
          <div className="space-y-1 max-h-[160px] overflow-y-auto">
            <div className="text-center py-4 text-[10px] text-gray-400">No recent activity</div>
          </div>
        </motion.div>
      </div>

      {/* ===== FILTER BAR ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'All Candidates', count: allCandidates.length },
            { key: 'ai_recommended', label: 'AI Recommended', count: aiRecommended },
            { key: 'interview_ready', label: 'Interview Ready', count: allCandidates.filter((c: any) => c.status === 'shortlisted' && (c.ai_score || 0) >= 80).length },
            { key: 'high_match', label: 'High Match', count: 5 },
            { key: 'recent', label: 'Recently Added', count: allCandidates.length },
            { key: 'offer', label: 'Offer Stage', count: allCandidates.filter((c: any) => c.status === 'offer' || c.status === 'hired').length },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilterTab(tab.key)}
              className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                filterTab === tab.key
                  ? 'bg-[#6D4CFF] text-white shadow-sm'
                  : 'bg-white/80 text-gray-500 hover:bg-gray-100 border border-gray-200/80'
              }`}>
              {tab.label}
              <span className={`text-[8px] px-1 py-0.5 rounded-full ${
                filterTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search shortlisted..."
              className="w-full sm:w-48 pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF] bg-white/90" />
          </div>
          <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`p-1.5 rounded-xl border transition-all ${
              showAdvancedFilters ? 'bg-[#6D4CFF]/10 border-[#6D4CFF] text-[#6D4CFF]' : 'border-gray-200 text-gray-400 hover:bg-gray-50'
            }`}>
            <Filter size={14} />
          </button>
          <button onClick={() => setShowAnalytics(true)} className="p-1.5 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50">
            <BarChart3 size={14} />
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { label: 'Skills', options: ['All', 'React', 'Python', 'Node.js', 'UI/UX'] },
                  { label: 'Experience', options: ['All', '0-1 yr', '1-3 yrs', '3-5 yrs', '5+ yrs'] },
                  { label: 'Education', options: ['All', 'IIT', 'NIT', 'BITS', 'Other'] },
                  { label: 'Location', options: ['All', 'Remote', 'Bangalore', 'Delhi', 'Mumbai'] },
                  { label: 'Expected Salary', options: ['All', '<₹15k', '₹15k-₹30k', '₹30k-₹50k', '₹50k+'] },
                  { label: 'Availability', options: ['All', 'Immediate', '2 Weeks', '1 Month', 'Negotiable'] },
                  { label: 'AI Match Score', options: ['All', '90%+', '80%+', '70%+', 'Below 70%'] },
                  { label: 'Job Position', options: ['All', 'Frontend', 'Backend', 'Data Science', 'Design'] },
                ].map((f, i) => (
                  <div key={i}>
                    <div className="text-[9px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">{f.label}</div>
                    <select className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#6D4CFF] bg-white">
                      {f.options.map((opt, j) => (
                        <option key={j} value={opt.toLowerCase()}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== EMPTY STATE ===== */}
      {isEmpty ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 border border-gray-100/80 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-[#F3F0FF] flex items-center justify-center mx-auto mb-4">
            <Star size={40} className="text-[#6D4CFF]" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">No Shortlisted Candidates Yet</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">Review applications and shortlist qualified candidates to build your talent pipeline.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5a3ed9] transition-all shadow-md shadow-purple-200">
              <Eye size={14} /> Review Applications
            </button>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
              <TrendingUp size={14} /> Promote Jobs
            </button>
            <button onClick={() => setShowAiPanel(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 text-xs font-semibold hover:from-purple-100 hover:to-pink-100 border border-purple-200 transition-all">
              <Sparkles size={14} /> Ask Prerana AI
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ===== INTERVIEW PIPELINE ===== */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
            <h3 className="text-xs font-bold text-gray-800 mb-3">Hiring Pipeline</h3>
            <div className="grid grid-cols-4 gap-3">
              {pipelineStages.map(stage => {
                const Icon = stage.icon;
                const items = pipelineData[stage.key] || [];
                return (
                  <div key={stage.key}
                    onDragOver={(e) => handleDragOver(e, stage.key)}
                    onDrop={(e) => handleDrop(e, stage.key)}
                    className={`rounded-xl p-3 transition-all ${
                      dragOverStage === stage.key ? 'bg-[#6D4CFF]/5 border-2 border-dashed border-[#6D4CFF]/30' : 'bg-gray-50/70 border-2 border-transparent'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg" style={{ background: `${stage.color}15`, color: stage.color }}>
                        <Icon size={12} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-700 flex-1">{stage.label}</span>
                      <span className="text-[9px] font-bold" style={{ color: stage.color }}>{items.length}</span>
                    </div>
                    <div className="space-y-1.5 min-h-[80px]">
                      {items.length === 0 && (
                        <div className="flex items-center justify-center h-14 text-[8px] text-gray-300 font-medium border border-dashed border-gray-200 rounded-lg">
                          Drop here
                        </div>
                      )}
                      {items.slice(0, 3).map((c: any) => (
                        <div key={c.id} draggable onDragStart={(e) => handleDragStart(e, c)}
                          className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm hover:shadow cursor-grab active:cursor-grabbing transition-all group/pip">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#6D4CFF]/10 to-[#A855F7]/10 flex items-center justify-center text-[7px] font-bold text-[#6D4CFF] flex-shrink-0">
                              {(c.applicant_name || '?')[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[8px] font-bold text-gray-700 truncate">{c.applicant_name}</div>
                              <div className="text-[7px] text-gray-400 truncate">{c.part_time_jobs?.title}</div>
                            </div>
                            <span className="text-[7px] font-bold" style={{ color: getScoreColor(c.ai_score) }}>{c.ai_score}%</span>
                          </div>
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div className="text-[8px] text-gray-400 font-medium text-center">+{items.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ===== CANDIDATE CARDS ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCandidates.map((candidate: any, idx: number) => (
              <motion.div key={candidate.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                whileHover={{ y: -2 }}
                className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-lg hover:border-purple-100 transition-all duration-300 overflow-hidden">
                {/* Top gradient accent */}
                <div className="h-1 w-full bg-gradient-to-r from-[#6D4CFF] via-[#A855F7] to-[#EC4899]" />
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center text-sm font-bold text-white shadow-sm flex-shrink-0">
                        {(candidate.applicant_name || '?')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-gray-800 truncate">{candidate.applicant_name}</div>
                        <div className="text-[9px] text-gray-400 truncate">{candidate.part_time_jobs?.title || 'N/A'}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={8} className="text-gray-300" />
                          <span className="text-[8px] text-gray-400">{candidate.location || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleCompare(candidate)}
                        className={`p-1 rounded-lg transition-all ${compareList.find(p => p.id === candidate.id) ? 'bg-[#6D4CFF]/10 text-[#6D4CFF]' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'}`}
                        title="Compare">
                        <BarChart3 size={11} />
                      </button>
                      <input type="checkbox" checked={selectedCandidates.has(candidate.id)} onChange={() => toggleSelect(candidate.id)}
                        className="rounded border-gray-300 text-[#6D4CFF] focus:ring-[#6D4CFF] w-3 h-3" />
                    </div>
                  </div>

                  {/* AI Score Ring + Details */}
                  <div className="grid grid-cols-12 gap-3 mb-3">
                    <div className="col-span-3 flex flex-col items-center justify-center">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                          <circle cx="24" cy="24" r="20" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                          <circle cx="24" cy="24" r="20" fill="none" stroke={getScoreColor(candidate.ai_score)} strokeWidth="3"
                            strokeDasharray={`${(candidate.ai_score || 0) * 1.26} 126`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-extrabold" style={{ color: getScoreColor(candidate.ai_score) }}>{candidate.ai_score}</span>
                        </div>
                      </div>
                      <span className="text-[7px] text-gray-400 mt-0.5">Match</span>
                    </div>
                    <div className="col-span-9 grid grid-cols-2 gap-x-3 gap-y-1">
                      <div>
                        <span className="text-[7px] text-gray-400 uppercase tracking-wider">Experience</span>
                        <div className="text-[10px] font-semibold text-gray-700">{candidate.experience || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-[7px] text-gray-400 uppercase tracking-wider">Education</span>
                        <div className="text-[10px] font-semibold text-gray-700 truncate">{candidate.college || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-[7px] text-gray-400 uppercase tracking-wider">Resume Score</span>
                        <div className="text-[10px] font-semibold" style={{ color: getScoreColor(candidate.resume_score) }}>{candidate.resume_score || 0}%</div>
                      </div>
                      <div>
                        <span className="text-[7px] text-gray-400 uppercase tracking-wider">Stage</span>
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-semibold"
                          style={{ background: pipelineStages.find(s => s.key === candidate.status)?.color + '15' || '#F3F0FF',
                                   color: pipelineStages.find(s => s.key === candidate.status)?.color || '#6D4CFF' }}>
                          {(candidate.status || 'shortlisted').charAt(0).toUpperCase() + (candidate.status || 'shortlisted').slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(candidate.skills || '').split(',').slice(0, 4).map((s: string, i: number) => (
                      <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-lg bg-gray-100 text-gray-500 font-medium">{s.trim()}</span>
                    ))}
                    {(candidate.skills || '').split(',').length > 4 && (
                      <span className="text-[8px] text-gray-400 font-medium">+{candidate.skills.split(',').length - 4}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
                    <button onClick={() => { setSelectedProfile(candidate); setDrawerOpen(true); }}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#F3F0FF] text-[#6D4CFF] text-[9px] font-semibold hover:bg-[#E8E3FF] transition-all">
                      <Eye size={11} /> Profile
                    </button>
                    <button onClick={() => { setSelectedProfile(candidate); setMessageModal(true); }}
                      className="flex items-center justify-center p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-[#6D4CFF] hover:border-[#6D4CFF]/30 transition-all" title="Message">
                      <MessageSquare size={12} />
                    </button>
                    <button onClick={() => setScheduleModal(true)}
                      className="flex items-center justify-center p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all" title="Schedule Interview">
                      <CalendarDays size={12} />
                    </button>
                    <div className="relative group/more">
                      <button className="flex items-center justify-center p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all">
                        <MoreHorizontal size={12} />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl border border-gray-200 shadow-lg z-20 hidden group-hover/more:block">
                        {pipelineStages.filter(s => s.key !== candidate.status).map(s => {
                          const SIcon = s.icon;
                          return (
                            <button key={s.key} onClick={() => updateStatus(candidate.id, s.key)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-[9px] text-gray-600 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                              style={{ color: s.color }}>
                              <SIcon size={10} /> Move to {s.label}
                            </button>
                          );
                        })}
                        <div className="border-t border-gray-100" />
                        <button onClick={() => updateStatus(candidate.id, 'rejected')}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[9px] text-red-500 hover:bg-red-50 last:rounded-b-xl">
                          <X size={10} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredCandidates.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <Search size={32} className="text-gray-200 mb-3" />
                <p className="text-sm text-gray-400 font-medium">No candidates match your search</p>
                <button onClick={() => { setSearch(''); setFilterTab('all'); }} className="mt-2 text-[10px] text-[#6D4CFF] font-semibold hover:underline">Clear filters</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== CANDIDATE COMPARISON PANEL ===== */}
      <AnimatePresence>
        {compareMode && compareList.length >= 2 && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => { setCompareMode(false); setCompareList([]); }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[85vh] overflow-y-auto border-t border-gray-200">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between p-4">
                <h3 className="text-sm font-bold">Candidate Comparison</h3>
                <button onClick={() => { setCompareMode(false); setCompareList([]); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-3 py-2 font-semibold text-gray-500 text-[10px] uppercase">Attribute</th>
                      {compareList.map((c: any) => (
                        <th key={c.id} className="text-center px-3 py-2 min-w-[160px]">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center text-[9px] font-bold text-white">
                              {(c.applicant_name || '?')[0]}
                            </div>
                            <div className="text-left">
                              <div className="text-[10px] font-bold text-gray-700">{c.applicant_name}</div>
                              <div className="text-[8px] text-gray-400">{c.part_time_jobs?.title}</div>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'AI Match Score', key: 'ai_score', format: (v: any) => `${v}%`, color: true },
                      { label: 'Resume Score', key: 'resume_score', format: (v: any) => `${v}%`, color: true },
                      { label: 'Experience', key: 'experience', format: (v: any) => v },
                      { label: 'Education', key: 'education', format: (v: any) => v },
                      { label: 'College', key: 'college', format: (v: any) => v },
                      { label: 'Location', key: 'location', format: (v: any) => v },
                      { label: 'Expected Salary', key: 'expected_salary', format: (v: any) => v },
                      { label: 'Assessment Score', key: 'assessment_score', format: (v: any) => `${v}%`, color: true },
                      { label: 'Communication', key: 'communication_score', format: (v: any) => `${v}%`, color: true },
                      { label: 'Culture Fit', key: 'culture_fit_score', format: (v: any) => `${v}%`, color: true },
                      { label: 'Leadership', key: 'leadership_score', format: (v: any) => `${v}%`, color: true },
                      { label: 'Hiring Probability', key: 'hiring_probability', format: (v: any) => `${v}%`, color: true },
                      { label: 'Skills', key: 'skills', format: (v: any) => v.split(',').slice(0, 3).join(', ') },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-3 py-2.5 text-[10px] font-semibold text-gray-600">{row.label}</td>
                        {compareList.map((c: any) => {
                          const val = c[row.key];
                          const formatted = row.format ? row.format(val) : val || 'N/A';
                          return (
                            <td key={c.id} className="px-3 py-2.5 text-center">
                              {row.color && typeof val === 'number' ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${val}%`, background: getScoreColor(val) }} />
                                  </div>
                                  <span className="text-[10px] font-bold" style={{ color: getScoreColor(val) }}>{formatted}</span>
                                </div>
                              ) : (
                                <span className="text-[10px] font-medium text-gray-700">{formatted}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== PROFILE DRAWER ===== */}
      <AnimatePresence>
        {drawerOpen && selectedProfile && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={() => setDrawerOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-10 flex items-center justify-between px-5 py-3">
                <h3 className="text-sm font-bold text-gray-800">Candidate Profile</h3>
                <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="p-5 space-y-5">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center text-xl font-bold text-white shadow-md shadow-purple-200">
                    {(selectedProfile.applicant_name || '?')[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-gray-900">{selectedProfile.applicant_name}</div>
                    <div className="text-xs text-gray-400">{selectedProfile.applicant_role}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: (pipelineStages.find(s => s.key === selectedProfile.status)?.color || '#6D4CFF') + '15',
                                 color: pipelineStages.find(s => s.key === selectedProfile.status)?.color || '#6D4CFF' }}>
                        {(selectedProfile.status || 'shortlisted').charAt(0).toUpperCase() + (selectedProfile.status || 'shortlisted').slice(1)}
                      </span>
                      <span className="text-[9px] text-gray-400">ID: {selectedProfile.id}</span>
                    </div>
                  </div>
                </div>

                {/* AI Scores */}
                <div className="bg-gradient-to-br from-[#F3F0FF] to-[#FAF5FF] rounded-2xl p-4 border border-[#6D4CFF]/10">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#6D4CFF" strokeWidth="4"
                          strokeDasharray={`${(selectedProfile.ai_score || 0) * 1.76} 176`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-extrabold text-[#6D4CFF]">{selectedProfile.ai_score || 0}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-gray-800">AI Evaluation</div>
                      <div className="text-[10px] text-gray-500 mb-2">Comprehensive candidate assessment</div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Technical', value: selectedProfile.assessment_score || 0 },
                          { label: 'Communication', value: selectedProfile.communication_score || 0 },
                          { label: 'Culture Fit', value: selectedProfile.culture_fit_score || 0 },
                          { label: 'Experience', value: selectedProfile.experience_score || 0 },
                          { label: 'Leadership', value: selectedProfile.leadership_score || 0 },
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

                {/* AI Insights */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-green-600" />
                    <span className="text-xs font-bold text-green-800">AI Insights</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      selectedProfile.ai_score >= 90 ? 'Top Talent' : 'Strong Candidate',
                      'High Hiring Probability',
                      selectedProfile.communication_score >= 85 ? 'Excellent Communication' : 'Good Communicator',
                      'Recommended For Next Stage',
                    ].map((insight, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/80 text-[9px] font-medium text-green-700 border border-green-200">
                        <Zap size={8} /> {insight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-1"><Mail size={10} /> Email</div>
                    <div className="text-[11px] font-semibold text-gray-700 truncate">{selectedProfile.applicant_email}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-1"><Phone size={10} /> Phone</div>
                    <div className="text-[11px] font-semibold text-gray-700">{selectedProfile.applicant_phone || 'N/A'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-1"><MapPin size={10} /> Location</div>
                    <div className="text-[11px] font-semibold text-gray-700">{selectedProfile.location || 'N/A'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-1"><GraduationCap size={10} /> Education</div>
                    <div className="text-[11px] font-semibold text-gray-700 truncate">{selectedProfile.education || 'N/A'}</div>
                  </div>
                </div>

                {/* Applied Job */}
                <div className="p-3 rounded-xl bg-[#F3F0FF] border border-[#6D4CFF]/10">
                  <div className="flex items-center gap-1.5 text-[9px] text-[#6D4CFF] font-semibold mb-1"><Briefcase size={10} /> Applied For</div>
                  <div className="text-xs font-bold text-gray-800">{selectedProfile.part_time_jobs?.title || 'Unknown'}</div>
                  <div className="text-[9px] text-gray-500 mt-1">{selectedProfile.experience} &middot; {selectedProfile.college}</div>
                </div>

                {/* Skills */}
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedProfile.skills || '').split(',').map((s: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-gray-100 text-[9px] font-medium text-gray-600">{s.trim()}</span>
                    ))}
                  </div>
                </div>

                {/* Projects & Certs */}
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Projects</div>
                    <div className="p-2.5 rounded-xl bg-gray-50 text-[10px] text-gray-600 leading-relaxed">{selectedProfile.projects || 'No projects listed'}</div>
                  </div>
                  {selectedProfile.certifications && (
                    <div>
                      <div className="text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Certifications</div>
                      <div className="p-2.5 rounded-xl bg-gray-50 text-[10px] text-gray-600">{selectedProfile.certifications}</div>
                    </div>
                  )}
                </div>

                {/* Resume & Links */}
                <div className="flex flex-wrap gap-2">
                  {selectedProfile.resume_url && (
                    <a href={selectedProfile.resume_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6D4CFF]/10 text-[#6D4CFF] text-[10px] font-semibold hover:bg-[#6D4CFF]/20 transition-all">
                      <Download size={12} /> Download Resume
                    </a>
                  )}
                  {selectedProfile.portfolio && (
                    <a href={selectedProfile.portfolio} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-gray-200 transition-all">
                      <Globe size={12} /> Portfolio
                    </a>
                  )}
                  {selectedProfile.linkedin && (
                    <a href={selectedProfile.linkedin} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-semibold hover:bg-blue-100 transition-all">
                      <Link size={12} /> LinkedIn
                    </a>
                  )}
                  {selectedProfile.github && (
                    <a href={selectedProfile.github} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900/5 text-gray-700 text-[10px] font-semibold hover:bg-gray-900/10 transition-all">
                      <Code2 size={12} /> GitHub
                    </a>
                  )}
                </div>

                {/* Evaluation Scores */}
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">Score Breakdown</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Technical', value: selectedProfile.assessment_score || 0 },
                      { label: 'Communication', value: selectedProfile.communication_score || 0 },
                      { label: 'Culture Fit', value: selectedProfile.culture_fit_score || 0 },
                      { label: 'Experience', value: selectedProfile.experience_score || 0 },
                      { label: 'Leadership', value: selectedProfile.leadership_score || 0 },
                      { label: 'Hiring Prob.', value: selectedProfile.hiring_probability || 0 },
                    ].map((score, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] text-gray-400">{score.label}</span>
                          <span className="text-[10px] font-bold" style={{ color: getScoreColor(score.value) }}>{score.value}%</span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${score.value}%`, background: getScoreColor(score.value) }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recruiter Notes */}
                {selectedProfile.notes && (
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Recruiter Notes</div>
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-[10px] text-amber-800">{selectedProfile.notes}</div>
                  </div>
                )}

                {/* Interview Info */}
                {selectedProfile.interview_date && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <div className="flex items-center gap-1.5 text-[9px] text-amber-600 font-semibold mb-1">
                      <CalendarDays size={10} /> Interview
                    </div>
                    <div className="text-xs font-semibold text-amber-800">
                      {new Date(selectedProfile.interview_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                )}

                {/* Stage Actions */}
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">Update Stage</div>
                  <div className="flex flex-wrap gap-1.5">
                    {pipelineStages.map(s => {
                      const SIcon = s.icon;
                      const isActive = selectedProfile.status === s.key;
                      return (
                        <button key={s.key} onClick={() => updateStatus(selectedProfile.id, s.key)} disabled={isActive}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-semibold transition-all disabled:opacity-50"
                          style={{ background: isActive ? `${s.color}15` : '#F3F4F6', color: s.color, border: isActive ? `1px solid ${s.color}40` : '1px solid transparent' }}>
                          <SIcon size={10} /> {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setMessageModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5a3ed9] transition-all shadow-md shadow-purple-200">
                    <MessageSquare size={13} /> Send Message
                  </button>
                  <button onClick={() => setScheduleModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
                    <CalendarDays size={13} /> Schedule Interview
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== AI INSIGHTS MODAL ===== */}
      <AnimatePresence>
        {showAiPanel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setShowAiPanel(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[560px] bg-white rounded-2xl shadow-2xl z-50 overflow-y-auto max-h-[90vh] border border-gray-200">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center">
                    <Sparkles size={15} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">AI Talent Insights</h3>
                    <p className="text-[9px] text-gray-400">Powered by Prerana AI</p>
                  </div>
                </div>
                <button onClick={() => setShowAiPanel(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-4">
                {/* Top Candidates */}
                <div className="bg-gradient-to-br from-[#F3F0FF] to-[#FAF5FF] rounded-2xl p-4 border border-[#6D4CFF]/10">
                  <h4 className="text-xs font-bold text-gray-800 mb-3">Top Ranked Candidates</h4>
                  {allCandidates.sort((a: any, b: any) => (b.hiring_probability || 0) - (a.hiring_probability || 0)).slice(0, 5).map((c: any, i: number) => (
                    <div key={i} className="flex items-center gap-2.5 py-2 border-b border-[#6D4CFF]/5 last:border-0">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6D4CFF]/10 to-[#A855F7]/10 flex items-center justify-center text-[9px] font-bold text-[#6D4CFF]">
                        {(c.applicant_name || '?')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-gray-700">{c.applicant_name}</div>
                        <div className="text-[9px] text-gray-400">{c.part_time_jobs?.title}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-extrabold text-green-600">{c.hiring_probability}%</div>
                        <div className="text-[7px] text-gray-400">Hire Prob.</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                  <h4 className="text-xs font-bold text-green-800 mb-2">AI Recommendations</h4>
                  <div className="space-y-2">
                    {aiRecommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className={`p-1 rounded-lg mt-0.5 ${rec.priority === 'high' ? 'bg-red-50 text-red-500' : rec.priority === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                          {rec.priority === 'high' ? <Zap size={10} /> : rec.priority === 'medium' ? <Clock size={10} /> : <Activity size={10} />}
                        </div>
                        <span className="text-[10px] text-gray-600">{rec.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-800 mb-2">Pipeline Summary</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Total Shortlisted', value: totalShortlisted, color: CLR.purple },
                      { label: 'Avg Match Score', value: `${avgScore}%`, color: CLR.success },
                      { label: 'Interview Ready', value: allCandidates.filter((c: any) => c.status === 'shortlisted' && (c.ai_score || 0) >= 80).length, color: CLR.warning },
                      { label: 'Conversion Rate', value: `${conversionRate}%`, color: CLR.teal },
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
        {showAnalytics && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setShowAnalytics(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[640px] bg-white rounded-2xl shadow-2xl z-50 overflow-y-auto max-h-[90vh] border border-gray-200">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between p-4">
                <h3 className="text-sm font-bold">Hiring Performance Analytics</h3>
                <button onClick={() => setShowAnalytics(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-5">
                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-600 mb-3 uppercase tracking-wider">Shortlisting Trends</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={[]}>
                      <defs>
                        <linearGradient id="shortGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#A855F7" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#A855F7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="shortlisted" stroke="#A855F7" strokeWidth={2} fill="url(#shortGrad)" dot={false} />
                      <Area type="monotone" dataKey="interviews" stroke="#F59E0B" strokeWidth={2} fill="none" dot={false} />
                      <Area type="monotone" dataKey="hired" stroke="#22C55E" strokeWidth={2} fill="none" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                    <h4 className="text-[10px] font-bold text-gray-600 mb-3 uppercase tracking-wider">Conversion Metrics</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Shortlist → Interview', value: totalShortlisted > 0 ? Math.round((interviewScheduled / totalShortlisted) * 100) : 0, color: CLR.warning },
                        { label: 'Interview → Offer', value: interviewScheduled > 0 ? Math.round((allCandidates.filter((c: any) => c.status === 'offer' || c.status === 'hired').length / interviewScheduled) * 100) : 0, color: CLR.teal },
                        { label: 'Offer → Hire', value: allCandidates.filter((c: any) => c.status === 'offer').length > 0 ? Math.round((hires / allCandidates.filter((c: any) => c.status === 'offer' || c.status === 'hired').length) * 100) : 0, color: CLR.success },
                        { label: 'Overall Conversion', value: conversionRate, color: CLR.purple },
                      ].map((m, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between text-[9px] mb-0.5">
                            <span className="font-semibold text-gray-600">{m.label}</span>
                            <span className="font-bold" style={{ color: m.color }}>{m.value}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${m.value}%` }}
                              transition={{ duration: 0.6, delay: i * 0.1 }}
                              className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${m.color}, ${m.color}88)` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                    <h4 className="text-[10px] font-bold text-gray-600 mb-3 uppercase tracking-wider">Quality Metrics</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Avg AI Match Score', value: avgScore, color: CLR.primary },
                        { label: 'Avg Resume Score', value: Math.round(allCandidates.reduce((s: number, c: any) => s + (c.resume_score || 0), 0) / Math.max(allCandidates.length, 1)), color: CLR.info },
                        { label: 'Avg Communication', value: Math.round(allCandidates.reduce((s: number, c: any) => s + (c.communication_score || 0), 0) / Math.max(allCandidates.length, 1)), color: CLR.success },
                        { label: 'Avg Leadership', value: Math.round(allCandidates.reduce((s: number, c: any) => s + (c.leadership_score || 0), 0) / Math.max(allCandidates.length, 1)), color: CLR.warning },
                      ].map((m, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between text-[9px] mb-0.5">
                            <span className="font-semibold text-gray-600">{m.label}</span>
                            <span className="font-bold" style={{ color: m.color }}>{m.value}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${m.value}%` }}
                              transition={{ duration: 0.6, delay: i * 0.1 }}
                              className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${m.color}, ${m.color}88)` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Total Pipeline', value: totalShortlisted, color: CLR.purple },
                    { label: 'Avg Time-to-Hire', value: '12 days', color: CLR.info },
                    { label: 'Offer Accept Rate', value: '85%', color: CLR.success },
                    { label: 'Quality Score', value: 'A-', color: CLR.teal },
                  ].map((m, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white border border-gray-100 text-center">
                      <div className="text-sm font-extrabold" style={{ color: m.color }}>{m.value}</div>
                      <div className="text-[8px] text-gray-400 mt-0.5">{m.label}</div>
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
        {messageModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-50" onClick={() => setMessageModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] bg-white rounded-2xl shadow-2xl z-50 border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold">{selectedProfile ? `Message ${selectedProfile.applicant_name}` : 'Send Message'}</h3>
                <button onClick={() => setMessageModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-3">
                {selectedProfile && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF]/10 to-[#A855F7]/10 flex items-center justify-center text-xs font-bold text-[#6D4CFF]">
                      {selectedProfile.applicant_name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{selectedProfile.applicant_name}</div>
                      <div className="text-[9px] text-gray-400">{selectedProfile.applicant_email}</div>
                    </div>
                  </div>
                )}
                <textarea value={messageText} onChange={e => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF] resize-none" />
                <button onClick={() => { setMessageModal(false); setMessageText(''); }}
                  disabled={!messageText.trim()}
                  className="w-full py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5a3ed9] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <Send size={13} /> Send Message
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== SCHEDULE MODAL ===== */}
      <AnimatePresence>
        {scheduleModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-50" onClick={() => setScheduleModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] bg-white rounded-2xl shadow-2xl z-50 border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold">Schedule Interview</h3>
                <button onClick={() => setScheduleModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-3">
                {selectedProfile && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF]/10 to-[#A855F7]/10 flex items-center justify-center text-xs font-bold text-[#6D4CFF]">
                      {selectedProfile.applicant_name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{selectedProfile.applicant_name}</div>
                      <div className="text-[9px] text-gray-400">{selectedProfile.part_time_jobs?.title}</div>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-1 block">Date</label>
                  <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-1 block">Time</label>
                  <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-1 block">Type</label>
                  <select className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF] bg-white">
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                    <option value="in-person">In Person</option>
                  </select>
                </div>
                <button onClick={() => { setScheduleModal(false); if (selectedProfile) updateStatus(selectedProfile.id, 'interview'); }}
                  disabled={!scheduleDate || !scheduleTime}
                  className="w-full py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5a3ed9] transition-all disabled:opacity-50">Schedule Interview</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
