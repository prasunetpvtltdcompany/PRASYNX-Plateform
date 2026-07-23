'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Award, TrendingUp, Sparkles, Search, Filter, X,
  ChevronDown, Download, FileText, Mail, Phone, MapPin,
  Briefcase, CalendarDays, MessageSquare, Eye, UserCheck, Video,
  Clock, ThumbsUp, GraduationCap, Link, RefreshCw,
  MoreHorizontal, Upload, Send, Sliders, Ban, CheckCircle,
  Hourglass, BarChart3, Activity, Target, Zap, Bookmark, Plus, Bot,
  ArrowUpRight, Star, ChevronLeft, ChevronRight, ListChecks,
  ExternalLink, Copy, CheckSquare, Square, HelpCircle, Bell,
  DollarSign, School, Loader, ArrowRight, ArrowLeft, Home,
  Globe, Code2, Edit3,
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
  { type: 'schedule', text: '3 interviews need scheduling this week - prioritize high-match candidates', priority: 'high' },
  { type: 'feedback', text: 'Feedback pending for 4 completed interviews - submit today', priority: 'high' },
  { type: 'quality', text: 'Interview pass rate improved 18% this quarter', priority: 'medium' },
  { type: 'top', text: 'Sneha Reddy scored 96% technical - highly recommended', priority: 'medium' },
  { type: 'reminder', text: '2 interviews in 1 hour - prepare evaluation forms', priority: 'low' },
];

const pipelineStages = [
  { key: 'interview', label: 'Scheduled', icon: CalendarDays, color: CLR.warning },
  { key: 'in_progress', label: 'In Progress', icon: Video, color: CLR.info },
  { key: 'feedback', label: 'Feedback Pending', icon: Clock, color: CLR.purple },
  { key: 'completed', label: 'Evaluated', icon: CheckCircle, color: CLR.teal },
  { key: 'selected', label: 'Selected', icon: ThumbsUp, color: CLR.success },
  { key: 'offer', label: 'Offer Sent', icon: Award, color: CLR.primary },
];

function Counter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (value === 0) return;
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
          <linearGradient id={`imc${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#imc${color.replace('#', '')})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={8} fill={i <= Math.round(rating) ? '#F59E0B' : 'none'} className={i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'} />
      ))}
    </div>
  );
}

export default function InterviewDashboard({ provider }: { provider: any }) {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({ date: '', time: '', type: 'Technical Round', interviewer: '', duration: '45', platform: 'Google Meet', link: '' });
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ technical_score: 0, communication_score: 0, problem_solving_score: 0, teamwork_score: 0, leadership_score: 0, culture_fit_score: 0, comments: '', recommendation: 'hold' });
  const [messageModal, setMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [calendarView, setCalendarView] = useState<'upcoming' | 'completed' | 'all'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const loadInterviews = () => {
    setLoading(true);
    apiClient.get<any[]>('/job-provider/applications/interviews').then(r => {
      if (r.success && Array.isArray(r.data) && r.data.length > 0) setInterviews(r.data);
      else setInterviews([]);
      setLoading(false);
    }).catch(() => { setInterviews([]); setLoading(false); });
  };

  useEffect(() => { loadInterviews(); }, []);

  const allInterviews = interviews;

  const now = new Date();
  const upcoming = allInterviews.filter((i: any) => i.status === 'interview' && new Date(i.interview_date) >= now);
  const completed = allInterviews.filter((i: any) => i.status !== 'interview' || new Date(i.interview_date) < now);

  const filtered = useMemo(() => {
    let items = allInterviews;
    if (filterTab === 'upcoming') items = allInterviews.filter((i: any) => i.status === 'interview' && new Date(i.interview_date) >= now);
    else if (filterTab === 'completed') items = allInterviews.filter((i: any) => i.status !== 'interview' || new Date(i.interview_date) < now);
    else if (filterTab === 'pending_feedback') items = allInterviews.filter((i: any) => i.feedback_status === 'pending' && (i.status === 'interview' || i.status === 'hired'));
    else if (filterTab === 'selected') items = allInterviews.filter((i: any) => i.result === 'selected' || i.status === 'hired' || i.status === 'offer');
    else if (filterTab === 'today') items = allInterviews.filter((i: any) => i.interview_date && new Date(i.interview_date).toDateString() === now.toDateString());
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((i: any) =>
        (i.applicant_name || '').toLowerCase().includes(q) ||
        (i.applicant_email || '').toLowerCase().includes(q) ||
        (i.part_time_jobs?.title || '').toLowerCase().includes(q) ||
        (i.interviewer || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [allInterviews, filterTab, search, now]);

  const totalUpcoming = upcoming.length;
  const totalCompleted = completed.length;
  const passedCount = allInterviews.filter((i: any) => i.result === 'selected' || i.status === 'hired' || i.status === 'offer').length;
  const hiredCount = allInterviews.filter((i: any) => i.result === 'selected' || i.status === 'hired').length;
  const avgDuration = allInterviews.length > 0 ? Math.round(allInterviews.reduce((s: number, i: any) => s + (i.interview_duration || 45), 0) / allInterviews.length) : 0;
  const avgAiScore = allInterviews.length > 0 ? Math.round(allInterviews.reduce((s: number, i: any) => s + (i.ai_score || 0), 0) / allInterviews.length) : 0;
  const successRate = totalCompleted > 0 ? Math.round((passedCount / Math.max(totalCompleted, 1)) * 100) : 0;
  const todayCount = allInterviews.filter((i: any) => i.interview_date && new Date(i.interview_date).toDateString() === now.toDateString()).length;

  const pipelineData = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    pipelineStages.forEach(s => { grouped[s.key] = []; });
    allInterviews.forEach((i: any) => {
      const status = i.result === 'selected' || i.status === 'hired' ? 'selected' :
        i.result === 'rejected' ? 'completed' :
        i.feedback_status === 'completed' && i.status === 'hired' ? 'selected' :
        i.feedback_status === 'completed' ? 'completed' :
        i.feedback_status === 'pending' && (i.status === 'interview' || i.status === 'hired') ? 'feedback' :
        i.status === 'interview' ? 'interview' : 'completed';
      if (grouped[status]) grouped[status].push(i);
      else grouped['interview'].push(i);
    });
    return grouped;
  }, [allInterviews]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const r = await apiClient.patch(`/job-provider/applications/${id}/status`, { status });
      if (r.success) {
        setInterviews((prev: any[]) => prev.map((i: any) => i.id === id ? { ...i, status } : i));
        setSelectedProfile((prev: any) => prev?.id === id ? { ...prev, status } : prev);
      }
    } catch { }
  };

  const getScoreColor = (s: number) => s >= 85 ? '#22C55E' : s >= 70 ? '#6D4CFF' : s >= 55 ? '#F59E0B' : '#EF4444';

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" />
        <span className="text-xs text-gray-400 font-medium">Loading interviews...</span>
      </div>
    </div>
  );

  const isEmpty = allInterviews.length === 0;

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
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">Interview Management</div>
            <h1 className="hero-title mb-2">Interview Management Center</h1>
            <p className="hero-desc mb-4">Manage candidate interviews, coordinate hiring teams, track performance, and accelerate decisions.</p>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {[
                { icon: CalendarDays, value: totalUpcoming, label: 'Upcoming', color: 'text-amber-300' },
                { icon: CheckCircle, value: totalCompleted, label: 'Completed', color: 'text-green-300' },
                { icon: ThumbsUp, value: `${successRate}%`, label: 'Success Rate', color: 'text-blue-300' },
                { icon: Award, value: hiredCount, label: 'Hired', color: 'text-purple-300' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <span key={i} className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-[10px] text-white/80 font-medium">
                    <Icon size={10} className={item.color} />
                    <span className="font-bold text-white">{typeof item.value === 'number' ? <Counter value={item.value} /> : item.value}</span>
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-5 xl:col-span-4 flex flex-wrap gap-2 justify-start lg:justify-end">
            <button onClick={() => setScheduleModal(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-[#6D4CFF] hover:bg-white/90 hover:-translate-y-0.5 text-[11px] font-bold shadow-[0_4px_12px_rgba(255,255,255,0.15)] transition-all duration-200">
              <Plus size={13} /> Schedule
            </button>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 text-[11px] font-semibold text-white border border-white/25 transition-all duration-200 backdrop-blur-sm">
              <Download size={13} /> Export
            </button>
            <button onClick={() => setShowAnalytics(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 text-[11px] font-semibold text-white border border-white/25 transition-all duration-200 backdrop-blur-sm">
              <FileText size={13} /> Reports
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
          { icon: CalendarDays, label: 'Upcoming Interviews', value: totalUpcoming, trend: `Today +${todayCount}`, sub: '', color: CLR.warning, chart: [4, 6, 3, 7, 5, 8, totalUpcoming] },
          { icon: CheckCircle, label: 'Completed Interviews', value: totalCompleted, trend: '', sub: 'All Time', color: CLR.success, chart: [10, 14, 8, 18, 12, 20, totalCompleted] },
          { icon: ThumbsUp, label: 'Passed Interviews', value: passedCount, trend: `${successRate}%`, sub: 'Success Rate', color: CLR.purple, chart: [8, 10, 6, 14, 9, 16, passedCount] },
          { icon: Award, label: 'Hired Candidates', value: hiredCount, trend: '', sub: 'After Interviews', color: CLR.teal, chart: [2, 4, 2, 6, 3, 7, hiredCount] },
          { icon: Clock, label: 'Avg Duration', value: `${avgDuration}m`, trend: '', sub: 'Per Interview', color: CLR.info, chart: [35, 40, 38, 45, 42, 48, avgDuration] },
          { icon: Sparkles, label: 'AI Candidate Rating', value: `${avgAiScore}%`, trend: '', sub: 'Average Score', color: CLR.pink, chart: [80, 84, 82, 88, 85, 90, avgAiScore] },
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
                {card.value === `${avgDuration}m` || card.value === `${avgAiScore}%` || card.value === `${successRate}%` ? card.value : <Counter value={card.value as number} />}
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
              { icon: Plus, label: 'Schedule', color: CLR.warning, action: () => setScheduleModal(true) },
              { icon: RefreshCw, label: 'Bulk Schedule', color: CLR.info, action: () => setScheduleModal(true) },
              { icon: Bell, label: 'Send Reminders', color: CLR.primary, action: () => {} },
              { icon: Download, label: 'Export', color: CLR.indigo, action: () => {} },
              { icon: FileText, label: 'Eval Report', color: CLR.teal, action: () => setShowAnalytics(true) },
              { icon: Mail, label: 'Send Feedback', color: CLR.success, action: () => {} },
            ].map((action, i) => {
              const ActionIcon = action.icon;
              return (
                <button key={i} onClick={action.action}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ '--hover-color': action.color } as React.CSSProperties}>
                  <div className="p-1.5 rounded-lg" style={{ background: `${action.color}12`, color: action.color }}>
                    <ActionIcon size={13} />
                  </div>
                  <span className="text-[8px] font-semibold text-gray-500 text-center leading-tight">{action.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="lg:col-span-1 bg-gradient-to-br from-[#6D4CFF]/5 via-[#A855F7]/5 to-[#EC4899]/5 rounded-2xl p-4 border border-[#6D4CFF]/10 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center shadow-sm">
              <Sparkles size={15} className="text-white" />
            </div>
            <h3 className="text-xs font-bold text-gray-800">AI Interview Insights</h3>
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
            <Sparkles size={11} /> View All Insights
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-800">Recent Activity</h3>
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
            { key: 'all', label: 'All Interviews', count: allInterviews.length },
            { key: 'upcoming', label: 'Upcoming', count: totalUpcoming },
            { key: 'today', label: 'Today', count: todayCount },
            { key: 'completed', label: 'Completed', count: totalCompleted },
            { key: 'pending_feedback', label: 'Feedback Pending', count: allInterviews.filter((i: any) => i.feedback_status === 'pending' && (i.status === 'interview' || i.status === 'hired')).length },
            { key: 'selected', label: 'Selected', count: passedCount },
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
              placeholder="Search interviews..."
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
                  { label: 'Interview Type', options: ['All', 'Technical', 'HR', 'Screening', 'Final'] },
                  { label: 'Interviewer', options: ['All', 'Ankit Verma', 'Neha Gupta', 'Rahul Mehta', 'Priya Singh'] },
                  { label: 'Platform', options: ['All', 'Google Meet', 'Zoom', 'Teams', 'In Person'] },
                  { label: 'Duration', options: ['All', '15 min', '30 min', '45 min', '60 min'] },
                  { label: 'Result', options: ['All', 'Selected', 'Rejected', 'Hold', 'Pending'] },
                  { label: 'Score Range', options: ['All', '90%+', '80%+', '70%+', 'Below 70%'] },
                  { label: 'Feedback', options: ['All', 'Completed', 'Pending', 'Not Started'] },
                  { label: 'Date Range', options: ['All', 'Today', 'This Week', 'This Month', 'Next Month'] },
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
            <Video size={40} className="text-[#6D4CFF]" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">No Interviews Scheduled Yet</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">Schedule interviews with shortlisted candidates to continue your hiring process.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => setScheduleModal(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5a3ed9] transition-all shadow-md shadow-purple-200">
              <CalendarDays size={14} /> Schedule Interview
            </button>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
              <Eye size={14} /> View Shortlisted
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
            <h3 className="text-xs font-bold text-gray-800 mb-3">Interview Pipeline</h3>
            <div className="grid grid-cols-6 gap-2">
              {pipelineStages.map(stage => {
                const Icon = stage.icon;
                const items = pipelineData[stage.key] || [];
                return (
                  <div key={stage.key} className="rounded-xl p-2.5 bg-gray-50/70 transition-all">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="p-1 rounded-lg" style={{ background: `${stage.color}15`, color: stage.color }}>
                        <Icon size={10} />
                      </div>
                      <span className="text-[8px] font-bold text-gray-700 flex-1 truncate">{stage.label}</span>
                      <span className="text-[9px] font-bold" style={{ color: stage.color }}>{items.length}</span>
                    </div>
                    <div className="space-y-1 min-h-[60px]">
                      {items.length === 0 && (
                        <div className="text-center text-[7px] text-gray-300 py-3 border border-dashed border-gray-200 rounded-lg">Empty</div>
                      )}
                      {items.slice(0, 2).map((c: any) => (
                        <div key={c.id} className="bg-white rounded-lg p-1.5 border border-gray-100 shadow-sm">
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded bg-gradient-to-br from-[#6D4CFF]/10 to-[#A855F7]/10 flex items-center justify-center text-[6px] font-bold text-[#6D4CFF]">
                              {(c.applicant_name || '?')[0]}
                            </div>
                            <span className="text-[7px] font-semibold text-gray-700 truncate flex-1">{c.applicant_name}</span>
                          </div>
                        </div>
                      ))}
                      {items.length > 2 && <div className="text-[7px] text-gray-400 text-center">+{items.length - 2} more</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ===== INTERVIEW CARDS ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((interview: any, idx: number) => {
              const isUpcoming = interview.status === 'interview' && new Date(interview.interview_date) >= now;
              const isPast = !isUpcoming || interview.status !== 'interview';
              const showFeedbackBtn = interview.status === 'interview' && interview.feedback_status === 'pending';
              return (
                <motion.div key={interview.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                  whileHover={{ y: -2 }}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-lg hover:border-amber-100 transition-all duration-300 overflow-hidden">
                  <div className={`h-1 w-full bg-gradient-to-r ${isUpcoming ? 'from-amber-400 via-orange-400 to-rose-400' : 'from-gray-300 via-gray-400 to-gray-500'}`} />
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-sm font-bold text-white shadow-sm flex-shrink-0">
                          {(interview.applicant_name || '?')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-gray-800 truncate">{interview.applicant_name}</div>
                          <div className="text-[9px] text-gray-400 truncate">{interview.part_time_jobs?.title || 'N/A'}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {isUpcoming ? (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-green-50 text-green-600">
                                <Clock size={7} /> {interview.interview_time || 'TBD'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-semibold" style={{
                                background: interview.result === 'selected' ? '#F0FDF4' : interview.result === 'rejected' ? '#FEF2F2' : '#F3F4F6',
                                color: interview.result === 'selected' ? '#22C55E' : interview.result === 'rejected' ? '#EF4444' : '#6B7280'
                              }}>
                                {interview.result === 'selected' ? 'Selected' : interview.result === 'rejected' ? 'Rejected' : interview.status || 'Completed'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {interview.overall_rating && (
                        <div className="text-right flex-shrink-0">
                          <StarRating rating={interview.overall_rating} />
                          <div className="text-[8px] text-gray-400 mt-0.5">{interview.overall_rating}/5.0</div>
                        </div>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-3">
                      <div>
                        <span className="text-[7px] text-gray-400 uppercase tracking-wider">Type</span>
                        <div className="text-[10px] font-semibold text-gray-700">{interview.interview_type || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-[7px] text-gray-400 uppercase tracking-wider">Date</span>
                        <div className="text-[10px] font-semibold text-gray-700">
                          {interview.interview_date ? new Date(interview.interview_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                        </div>
                      </div>
                      <div>
                        <span className="text-[7px] text-gray-400 uppercase tracking-wider">Duration</span>
                        <div className="text-[10px] font-semibold text-gray-700">{interview.interview_duration || 45} min</div>
                      </div>
                      <div>
                        <span className="text-[7px] text-gray-400 uppercase tracking-wider">Interviewer</span>
                        <div className="text-[10px] font-semibold text-gray-700 truncate">{interview.interviewer || 'TBD'}</div>
                      </div>
                    </div>

                    {/* Platform Badge */}
                    {interview.meeting_platform && (
                      <div className="flex items-center gap-1.5 mb-3 px-2 py-1 rounded-lg bg-gray-50 border border-gray-100">
                        <Video size={10} className="text-gray-400" />
                        <span className="text-[8px] font-medium text-gray-500 flex-1">{interview.meeting_platform}</span>
                        {interview.meeting_link && (
                          <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer"
                            className="text-[8px] font-semibold text-[#6D4CFF] hover:underline flex items-center gap-0.5">
                            <ExternalLink size={8} /> Join
                          </a>
                        )}
                      </div>
                    )}

                    {/* Feedback Summary (for completed) */}
                    {isPast && interview.technical_score > 0 && (
                      <div className="flex gap-1.5 mb-3">
                        {[
                          { label: 'Tech', value: interview.technical_score },
                          { label: 'Comm', value: interview.communication_score },
                          { label: 'Problem', value: interview.problem_solving_score },
                          { label: 'Culture', value: interview.culture_fit_score },
                        ].map((s, i) => (
                          <div key={i} className="flex-1 text-center p-1 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="text-[8px] font-bold" style={{ color: getScoreColor(s.value) }}>{s.value}%</div>
                            <div className="text-[6px] text-gray-400">{s.label}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* AI Score */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${interview.ai_score || 0}%`, background: `linear-gradient(90deg, ${getScoreColor(interview.ai_score)}, ${getScoreColor(interview.ai_score)}88)` }} />
                      </div>
                      <span className="text-[9px] font-bold" style={{ color: getScoreColor(interview.ai_score) }}>AI {interview.ai_score}%</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
                      <button onClick={() => { setSelectedProfile(interview); setDrawerOpen(true); }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#F3F0FF] text-[#6D4CFF] text-[9px] font-semibold hover:bg-[#E8E3FF] transition-all">
                        <Eye size={11} /> Profile
                      </button>
                      {showFeedbackBtn && (
                        <button onClick={() => { setSelectedProfile(interview); setFeedbackModal(true); }}
                          className="flex items-center justify-center p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all" title="Submit Feedback">
                          <ThumbsUp size={12} />
                        </button>
                      )}
                      {isUpcoming && interview.meeting_link && (
                        <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all" title="Join Meeting">
                          <Video size={12} />
                        </a>
                      )}
                      <div className="relative group/more">
                        <button className="flex items-center justify-center p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-all">
                          <MoreHorizontal size={12} />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl border border-gray-200 shadow-lg z-20 hidden group-hover/more:block">
                          <button onClick={() => { setSelectedProfile(interview); setScheduleModal(true); }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-[9px] text-gray-600 hover:bg-gray-50 first:rounded-t-xl">
                            <CalendarDays size={10} /> Reschedule
                          </button>
                          <button onClick={() => { setSelectedProfile(interview); setMessageModal(true); }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-[9px] text-gray-600 hover:bg-gray-50">
                            <MessageSquare size={10} /> Message
                          </button>
                          {isUpcoming && (
                            <button onClick={() => updateStatus(interview.id, 'hired')}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-[9px] text-green-600 hover:bg-green-50">
                              <Award size={10} /> Mark Hired
                            </button>
                          )}
                          <div className="border-t border-gray-100" />
                          <button onClick={() => updateStatus(interview.id, 'rejected')}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-[9px] text-red-500 hover:bg-red-50 last:rounded-b-xl">
                            <X size={10} /> Cancel/Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <CalendarDays size={32} className="text-gray-200 mb-3" />
                <p className="text-sm text-gray-400 font-medium">No interviews match your search</p>
                <button onClick={() => { setSearch(''); setFilterTab('all'); }} className="mt-2 text-[10px] text-[#6D4CFF] font-semibold hover:underline">Clear filters</button>
              </div>
            )}
          </div>
        </>
      )}

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
                <h3 className="text-sm font-bold text-gray-800">Interview Profile</h3>
                <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-xl font-bold text-white shadow-md">
                    {(selectedProfile.applicant_name || '?')[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-gray-900">{selectedProfile.applicant_name}</div>
                    <div className="text-xs text-gray-400">{selectedProfile.applicant_role}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                        <Video size={8} /> {selectedProfile.interview_type || 'Interview'}
                      </span>
                      {selectedProfile.overall_rating && <StarRating rating={selectedProfile.overall_rating} />}
                    </div>
                  </div>
                </div>

                {/* AI Score */}
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
                      <div className="text-xs font-bold text-gray-800">AI Candidate Rating</div>
                      <div className="text-[10px] text-gray-500 mb-2">Comprehensive interview prediction</div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {[
                          { label: 'Technical', value: selectedProfile.technical_score || 0 },
                          { label: 'Comm', value: selectedProfile.communication_score || 0 },
                          { label: 'Problem', value: selectedProfile.problem_solving_score || 0 },
                          { label: 'Leadership', value: selectedProfile.leadership_score || 0 },
                        ].map((s, i) => (
                          <div key={i} className="text-center">
                            <div className="text-[9px] font-bold" style={{ color: getScoreColor(s.value) }}>{s.value}%</div>
                            <div className="text-[7px] text-gray-400">{s.label}</div>
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
                    <span className="text-xs font-bold text-green-800">AI Interview Insights</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      selectedProfile.technical_score >= 85 ? 'Strong Technical Skills' : 'Adequate Technical Skills',
                      selectedProfile.communication_score >= 85 ? 'Excellent Communicator' : 'Good Communication',
                      selectedProfile.culture_fit_score >= 80 ? 'Great Culture Fit' : 'Average Culture Fit',
                      selectedProfile.overall_rating >= 4.0 ? 'Highly Recommended' : 'Consider for Next Round',
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
                </div>

                {/* Interview Details */}
                <div className="space-y-2">
                  <div className="text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Interview Details</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                      <div className="text-[8px] text-amber-500 font-semibold">Date & Time</div>
                      <div className="text-[10px] font-bold text-amber-800">
                        {selectedProfile.interview_date ? new Date(selectedProfile.interview_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBD'}
                      </div>
                      <div className="text-[9px] text-amber-600">{selectedProfile.interview_time || ''}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                      <div className="text-[8px] text-blue-500 font-semibold">Duration</div>
                      <div className="text-[10px] font-bold text-blue-800">{selectedProfile.interview_duration || 45} minutes</div>
                      <div className="text-[9px] text-blue-600">{selectedProfile.interview_type}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                      <div className="text-[8px] text-purple-500 font-semibold">Interviewer</div>
                      <div className="text-[10px] font-bold text-purple-800">{selectedProfile.interviewer || 'TBD'}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="text-[8px] text-gray-500 font-semibold">Platform</div>
                      <div className="text-[10px] font-bold text-gray-800">{selectedProfile.meeting_platform || 'TBD'}</div>
                      {selectedProfile.meeting_link && (
                        <a href={selectedProfile.meeting_link} target="_blank" rel="noopener noreferrer"
                          className="text-[8px] text-[#6D4CFF] font-semibold hover:underline flex items-center gap-0.5 mt-0.5">
                          <ExternalLink size={8} /> Join Link
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">Interview Scores</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Technical', value: selectedProfile.technical_score || 0 },
                      { label: 'Communication', value: selectedProfile.communication_score || 0 },
                      { label: 'Problem Solving', value: selectedProfile.problem_solving_score || 0 },
                      { label: 'Teamwork', value: selectedProfile.teamwork_score || 0 },
                      { label: 'Leadership', value: selectedProfile.leadership_score || 0 },
                      { label: 'Culture Fit', value: selectedProfile.culture_fit_score || 0 },
                    ].map((s, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] text-gray-400">{s.label}</span>
                          <span className="text-[10px] font-bold" style={{ color: getScoreColor(s.value) }}>{s.value}%</span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: getScoreColor(s.value) }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                {selectedProfile.feedback && (
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Interviewer Feedback</div>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-[10px] text-amber-800 leading-relaxed">{selectedProfile.feedback}</div>
                  </div>
                )}

                {/* Candidate Availability */}
                {selectedProfile.candidate_availability && (
                  <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                    <div className="text-[9px] text-green-600 font-semibold mb-0.5">Availability</div>
                    <div className="text-[10px] font-medium text-green-800">{selectedProfile.candidate_availability}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {selectedProfile.meeting_link && (
                    <a href={selectedProfile.meeting_link} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-all shadow-md">
                      <Video size={13} /> Join Meeting
                    </a>
                  )}
                  <button onClick={() => { setScheduleModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
                    <CalendarDays size={13} /> Reschedule
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedProfile(selectedProfile); setFeedbackModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-50 text-green-600 text-xs font-semibold hover:bg-green-100 transition-all border border-green-200">
                    <ThumbsUp size={12} /> Submit Feedback
                  </button>
                  <button onClick={() => { setSelectedProfile(selectedProfile); setMessageModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#F3F0FF] text-[#6D4CFF] text-xs font-semibold hover:bg-[#E8E3FF] transition-all border border-[#6D4CFF]/20">
                    <MessageSquare size={12} /> Message
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
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center"><Sparkles size={15} className="text-white" /></div>
                  <div><h3 className="text-sm font-bold">AI Interview Insights</h3><p className="text-[9px] text-gray-400">Powered by Prerana AI</p></div>
                </div>
                <button onClick={() => setShowAiPanel(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
                  <h4 className="text-xs font-bold text-amber-800 mb-3">Top Interview Candidates</h4>
                  {allInterviews.sort((a: any, b: any) => (b.overall_rating || 0) - (a.overall_rating || 0)).slice(0, 5).map((c: any, i: number) => (
                    <div key={i} className="flex items-center gap-2.5 py-2 border-b border-amber-100/50 last:border-0">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-[9px] font-bold text-amber-600">
                        {(c.applicant_name || '?')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-gray-700">{c.applicant_name}</div>
                        <div className="text-[9px] text-gray-400">{c.part_time_jobs?.title}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <StarRating rating={c.overall_rating} />
                        <span className="text-[9px] font-bold text-amber-600 ml-1">{c.overall_rating}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                  <h4 className="text-xs font-bold text-green-800 mb-2">AI Recommendations</h4>
                  <div className="space-y-2">{aiRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`p-1 rounded-lg mt-0.5 ${rec.priority === 'high' ? 'bg-red-50 text-red-500' : rec.priority === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                        {rec.priority === 'high' ? <Zap size={10} /> : rec.priority === 'medium' ? <Clock size={10} /> : <Activity size={10} />}
                      </div>
                      <span className="text-[10px] text-gray-600">{rec.text}</span>
                    </div>
                  ))}</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-800 mb-2">Interview Summary</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Scheduled', value: totalUpcoming, color: CLR.warning },
                      { label: 'Completed', value: totalCompleted, color: CLR.success },
                      { label: 'Avg Duration', value: `${avgDuration}m`, color: CLR.info },
                      { label: 'Success Rate', value: `${successRate}%`, color: CLR.purple },
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
                <h3 className="text-sm font-bold">Interview Analytics</h3>
                <button onClick={() => setShowAnalytics(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-5">
                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-600 mb-3 uppercase tracking-wider">Interview Trends</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={[]}>
                      <defs>
                        <linearGradient id="intGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="scheduled" stroke="#F59E0B" strokeWidth={2} fill="url(#intGrad)" dot={false} />
                      <Area type="monotone" dataKey="completed" stroke="#6D4CFF" strokeWidth={2} fill="none" dot={false} />
                      <Area type="monotone" dataKey="passed" stroke="#22C55E" strokeWidth={2} fill="none" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                    <h4 className="text-[10px] font-bold text-gray-600 mb-3 uppercase tracking-wider">Conversion Metrics</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Interview → Selection', value: allInterviews.length > 0 ? Math.round((passedCount / Math.max(allInterviews.length, 1)) * 100) : 0, color: CLR.success },
                        { label: 'Selection → Offer', value: passedCount > 0 ? Math.round((hiredCount / Math.max(passedCount, 1)) * 100) : 0, color: CLR.teal },
                        { label: 'Interview → Hire', value: allInterviews.length > 0 ? Math.round((hiredCount / Math.max(allInterviews.length, 1)) * 100) : 0, color: CLR.primary },
                        { label: 'Completion Rate', value: allInterviews.length > 0 ? Math.round((totalCompleted / Math.max(allInterviews.length, 1)) * 100) : 0, color: CLR.info },
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
                        { label: 'Avg Technical Score', value: Math.round(allInterviews.reduce((s: number, i: any) => s + (i.technical_score || 0), 0) / Math.max(allInterviews.length, 1)), color: CLR.primary },
                        { label: 'Avg Communication', value: Math.round(allInterviews.reduce((s: number, i: any) => s + (i.communication_score || 0), 0) / Math.max(allInterviews.length, 1)), color: CLR.success },
                        { label: 'Avg Problem Solving', value: Math.round(allInterviews.reduce((s: number, i: any) => s + (i.problem_solving_score || 0), 0) / Math.max(allInterviews.length, 1)), color: CLR.warning },
                        { label: 'Avg Culture Fit', value: Math.round(allInterviews.reduce((s: number, i: any) => s + (i.culture_fit_score || 0), 0) / Math.max(allInterviews.length, 1)), color: CLR.purple },
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
                    { label: 'Total Interviews', value: allInterviews.length, color: CLR.warning },
                    { label: 'Avg Rating', value: allInterviews.length > 0 ? (allInterviews.reduce((s: number, i: any) => s + (i.overall_rating || 0), 0) / allInterviews.length).toFixed(1) : '0.0', color: CLR.primary },
                    { label: 'Avg Duration', value: `${avgDuration}m`, color: CLR.info },
                    { label: 'Pass Rate', value: `${successRate}%`, color: CLR.success },
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

      {/* ===== SCHEDULE MODAL ===== */}
      <AnimatePresence>
        {scheduleModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-50" onClick={() => setScheduleModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] bg-white rounded-2xl shadow-2xl z-50 border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold">
                  {selectedProfile ? `Schedule: ${selectedProfile.applicant_name}` : 'Schedule Interview'}
                </h3>
                <button onClick={() => { setScheduleModal(false); setScheduleData({ date: '', time: '', type: 'Technical Round', interviewer: '', duration: '45', platform: 'Google Meet', link: '' }); }}
                  className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-3">
                {selectedProfile && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-xs font-bold text-amber-600">
                      {selectedProfile.applicant_name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{selectedProfile.applicant_name}</div>
                      <div className="text-[9px] text-gray-400">{selectedProfile.part_time_jobs?.title}</div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 mb-1 block">Date *</label>
                    <input type="date" value={scheduleData.date} onChange={e => setScheduleData(p => ({ ...p, date: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 mb-1 block">Time *</label>
                    <input type="time" value={scheduleData.time} onChange={e => setScheduleData(p => ({ ...p, time: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 mb-1 block">Interview Type</label>
                    <select value={scheduleData.type} onChange={e => setScheduleData(p => ({ ...p, type: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF] bg-white">
                      <option value="Technical Round">Technical Round</option>
                      <option value="HR Round">HR Round</option>
                      <option value="Screening">Screening</option>
                      <option value="Portfolio Review">Portfolio Review</option>
                      <option value="Final Round">Final Round</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 mb-1 block">Duration (min)</label>
                    <select value={scheduleData.duration} onChange={e => setScheduleData(p => ({ ...p, duration: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF] bg-white">
                      <option value="15">15 min</option><option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-1 block">Interviewer</label>
                  <input value={scheduleData.interviewer} onChange={e => setScheduleData(p => ({ ...p, interviewer: e.target.value }))}
                    placeholder="Interviewer name"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 mb-1 block">Platform</label>
                    <select value={scheduleData.platform} onChange={e => setScheduleData(p => ({ ...p, platform: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF] bg-white">
                      <option value="Google Meet">Google Meet</option>
                      <option value="Zoom">Zoom</option>
                      <option value="Microsoft Teams">Microsoft Teams</option>
                      <option value="In Person">In Person</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 mb-1 block">Meeting Link</label>
                    <input value={scheduleData.link} onChange={e => setScheduleData(p => ({ ...p, link: e.target.value }))}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" />
                  </div>
                </div>
                <button onClick={() => {
                  if (selectedProfile) updateStatus(selectedProfile.id, 'interview');
                  setScheduleModal(false);
                  setScheduleData({ date: '', time: '', type: 'Technical Round', interviewer: '', duration: '45', platform: 'Google Meet', link: '' });
                }} disabled={!scheduleData.date || !scheduleData.time}
                  className="w-full py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5a3ed9] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <CalendarDays size={13} /> Schedule Interview
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== FEEDBACK MODAL ===== */}
      <AnimatePresence>
        {feedbackModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-50" onClick={() => setFeedbackModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[520px] bg-white rounded-2xl shadow-2xl z-50 overflow-y-auto max-h-[90vh] border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold">Interview Feedback</h3>
                <button onClick={() => setFeedbackModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-4">
                {selectedProfile && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-xs font-bold text-amber-600">
                      {selectedProfile.applicant_name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{selectedProfile.applicant_name}</div>
                      <div className="text-[9px] text-gray-400">{selectedProfile.part_time_jobs?.title} &middot; {selectedProfile.interview_type}</div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'technical_score', label: 'Technical Knowledge', emoji: '💻' },
                    { key: 'communication_score', label: 'Communication', emoji: '🗣️' },
                    { key: 'problem_solving_score', label: 'Problem Solving', emoji: '🧠' },
                    { key: 'teamwork_score', label: 'Teamwork', emoji: '🤝' },
                    { key: 'leadership_score', label: 'Leadership', emoji: '👑' },
                    { key: 'culture_fit_score', label: 'Culture Fit', emoji: '🎯' },
                  ].map((field) => (
                    <div key={field.key}>
                      <div className="text-[9px] font-semibold text-gray-500 mb-1 flex items-center gap-1">
                        <span>{field.emoji}</span> {field.label}
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="range" min="0" max="100" value={(feedbackData as any)[field.key]}
                          onChange={e => setFeedbackData(p => ({ ...p, [field.key]: Number(e.target.value) }))}
                          className="flex-1 h-1.5 rounded-full appearance-none bg-gray-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#6D4CFF] [&::-webkit-slider-thumb]:cursor-pointer" />
                        <span className="text-[10px] font-bold w-8 text-right" style={{ color: getScoreColor((feedbackData as any)[field.key]) }}>
                          {(feedbackData as any)[field.key]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-1 block">Comments</label>
                  <textarea value={feedbackData.comments} onChange={e => setFeedbackData(p => ({ ...p, comments: e.target.value }))}
                    placeholder="Detailed feedback about the candidate..."
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF] resize-none" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-2 block">Recommendation</label>
                  <div className="flex gap-2">
                    {[
                      { key: 'hire', label: 'Hire', color: '#22C55E', bg: '#F0FDF4', icon: ThumbsUp },
                      { key: 'hold', label: 'Maybe / Hold', color: '#F59E0B', bg: '#FFFBEB', icon: Clock },
                      { key: 'reject', label: 'Reject', color: '#EF4444', bg: '#FEF2F2', icon: X },
                    ].map(opt => {
                      const OptIcon = opt.icon;
                      return (
                        <button key={opt.key} onClick={() => setFeedbackData(p => ({ ...p, recommendation: opt.key }))}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                            feedbackData.recommendation === opt.key
                              ? 'border-2 shadow-sm' : 'border border-gray-200 opacity-60 hover:opacity-100'
                          }`}
                          style={feedbackData.recommendation === opt.key ? { background: opt.bg, borderColor: opt.color, color: opt.color } : {}}>
                          <OptIcon size={12} /> {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button onClick={() => {
                  if (selectedProfile) {
                    updateStatus(selectedProfile.id, feedbackData.recommendation === 'reject' ? 'rejected' : feedbackData.recommendation === 'hire' ? 'hired' : 'interview');
                  }
                  setFeedbackModal(false);
                }} className="w-full py-2.5 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5a3ed9] transition-all">
                  Submit Feedback
                </button>
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
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-xs font-bold text-amber-600">
                      {selectedProfile.applicant_name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{selectedProfile.applicant_name}</div>
                      <div className="text-[9px] text-gray-400">{selectedProfile.part_time_jobs?.title}</div>
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
    </div>
  );
}
