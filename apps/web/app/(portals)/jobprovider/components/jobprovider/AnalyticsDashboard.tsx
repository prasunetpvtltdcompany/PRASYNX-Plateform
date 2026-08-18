'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, TrendingUp, Users, Briefcase, Award, PieChart as PieChartIcon,
  Download, CalendarDays, ArrowUpRight, Clock, Filter,
  Activity, Target, Zap, Search, X, ChevronDown, Plus,
  Star, UserCheck, Video, FileText, Mail, DollarSign,
  Bot, Sparkles, MoreHorizontal, RefreshCw, ExternalLink,
  CheckCircle, ThumbsUp, HelpCircle, Globe, MapPin,
  GraduationCap, Building2, Bell, Settings, Copy, Share2,
  Loader, ArrowRight, ArrowLeft, Eye, Bookmark, Sliders,
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
  indigo: '#4F46E5', pink: '#EC4899', teal: '#14B8A6', orange: '#F97316',
};

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
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data.map((v, i) => ({ i, v }))}>
        <defs>
          <linearGradient id={`mc${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#mc${color.replace('#', '')})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const formatCurrency = (v: number) => {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
};

export default function AnalyticsDashboard({ provider }: { provider: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showPredictive, setShowPredictive] = useState(false);
  const [showFunnelDetail, setShowFunnelDetail] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [period, setPeriod] = useState('7d');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    apiClient.get<any>('/job-provider/dashboard/enhanced').then((r) => {
      if (r.success && r.data) setData(r.data);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => data, [data]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" /></div>;

  if (!stats) {
    return (
      <div className="max-w-[1600px] mx-auto">
        <div className="bg-white rounded-2xl p-12 md:p-16 border border-gray-200 text-center shadow-sm">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center mx-auto mb-6">
              <BarChart3 size={48} className="text-[#6D4CFF]" />
            </div>
          </motion.div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Recruitment Data Available Yet</h3>
          <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto">
            Analytics and hiring insights will automatically appear once jobs and candidates are added.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D4CFF] text-white text-sm font-semibold hover:bg-[#5a3ed9] transition-all shadow-md shadow-purple-200">
              <Briefcase size={16} /> Create Job
            </button>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
              <BarChart3 size={16} /> Generate Sample Dashboard
            </button>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
              <Bot size={16} /> Ask Prerana AI
            </button>
          </div>
        </div>
      </div>
    );
  }

  const funnel = [
    { stage: 'Applications', count: stats?.totalApplications || 0, pct: 100, avgDays: '-', color: CLR.primary },
    { stage: 'Shortlisted', count: stats?.shortlisted || 0, pct: stats?.totalApplications ? Math.round(((stats?.shortlisted || 0) / stats.totalApplications) * 100) : 0, avgDays: '3', color: CLR.purple },
    { stage: 'Interviews', count: stats?.interviews || 0, pct: stats?.shortlisted ? Math.round(((stats?.interviews || 0) / stats.shortlisted) * 100) : 0, avgDays: '5', color: CLR.warning },
    { stage: 'Offers', count: stats?.interviews ? Math.round(stats.interviews * 0.625) : 0, pct: stats?.interviews ? 62.5 : 0, avgDays: '4', color: CLR.info },
    { stage: 'Hired', count: stats?.hired || 0, pct: stats?.hired && stats?.interviews ? Math.round((stats.hired / stats.interviews) * 100) : 0, avgDays: '2', color: CLR.success },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* ===== HERO SECTION ===== */}
      <div className="relative overflow-hidden rounded-2xl p-4 md:p-6 lg:p-8 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.15)]"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-[#6D4CFF]/20 rounded-full blur-[140px]" />
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-[#3B82F6]/12 rounded-full blur-[140px]" />
          <div className="absolute top-[40%] left-[50%] w-1/3 h-1/3 bg-[#22C55E]/8 rounded-full blur-[120px]" />
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} animate={{ opacity: [0.05, 0.3, 0.05], y: [0, -(5 + (i % 3) * 4), 0], x: [0, (i % 2 === 0 ? 4 : -4), 0] }}
              transition={{ duration: 3 + (i % 4) * 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
              className="absolute rounded-full bg-white/20 pointer-events-none"
              style={{ width: `${1 + (i % 3) * 1.2}px`, height: `${1 + (i % 3) * 1.2}px`, top: `${8 + (i * 11) % 84}%`, left: `${5 + (i * 14) % 90}%` }}
            />
          ))}
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 xl:col-span-8">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">Analytics & Insights</div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-2">
              Recruitment Intelligence Dashboard
            </h1>
            <p className="text-sm text-white/60 mb-4">
              Monitor hiring performance, analyze recruitment trends, and make data-driven decisions.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { icon: Briefcase, label: 'Active Jobs', value: stats.activeJobs || 0, color: 'text-blue-300' },
                { icon: Users, label: 'Applications', value: stats.totalApplications || 0, color: 'text-green-300' },
                { icon: Video, label: 'Interviews', value: stats.interviews || 0, color: 'text-amber-300' },
                { icon: Award, label: 'Hires', value: stats.hired || 0, color: 'text-purple-300' },
                { icon: TrendingUp, label: 'Hiring Growth', value: '+32%', color: 'text-pink-300' },
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
              <button onClick={() => setShowExportModal(true)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-[#1a1a2e] hover:bg-white/90 text-xs font-bold transition-all shadow-lg">
                <Download size={14} /> Export Reports
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/25 transition-all backdrop-blur-sm">
                <FileText size={14} /> PDF Report
              </button>
              <button onClick={() => setShowAIInsights(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/12 text-[11px] font-medium text-white/70 text-white border border-white/10 hover:border-white/20 transition-all">
                <Sparkles size={12} /> AI Insights
              </button>
            </div>
          </div>
          <div className="lg:col-span-4 xl:col-span-4 hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-[280px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#6D4CFF]/30 via-[#22C55E]/10 to-[#3B82F6]/20 rounded-full blur-[70px] opacity-30" />
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative flex items-center justify-center">
                <div className="grid grid-cols-3 gap-3">
                  {['📊', '📈', '🎯', '📉', '💡', '📋', '✅', '🎯', '📊'].map((emoji, i) => (
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

      {/* ===== EXECUTIVE KPI DASHBOARD (8 CARDS) ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {[
          { icon: Briefcase, label: 'Total Jobs', value: stats.totalJobs || 0, trend: '+15% Growth', color: CLR.primary, chart: [8, 10, 9, 12, 11, 13, 12] },
          { icon: Users, label: 'Applications', value: stats.totalApplications || 0, trend: '+34 This Week', color: CLR.info, chart: [180, 200, 190, 220, 210, 240, 248] },
          { icon: Star, label: 'Shortlisted', value: stats.shortlisted || 0, trend: '14.5% Conv.', color: CLR.purple, chart: [18, 22, 25, 28, 30, 34, 36] },
          { icon: Video, label: 'Interviews', value: stats.interviews || 0, trend: 'Stage', color: CLR.warning, chart: [6, 8, 10, 9, 12, 14, 16] },
          { icon: Award, label: 'Hires', value: stats.hired || 0, trend: 'Placements', color: CLR.success, chart: [2, 3, 4, 5, 6, 7, 8] },
          { icon: TrendingUp, label: 'Recruitment ROI', value: `${stats.recruitmentROI || 0}%`, trend: 'Return', color: CLR.teal, chart: [200, 220, 240, 250, 260, 275, 285] },
          { icon: Clock, label: 'Time To Hire', value: `${stats.timeToHire || 0} Days`, trend: '-18% Faster', color: CLR.orange, chart: [20, 19, 18, 17, 16, 15, 14] },
          { icon: Bot, label: 'AI Hiring Score', value: `${stats.aiHiringScore || 0}%`, trend: 'Performance', color: CLR.purple, chart: [78, 80, 82, 85, 87, 89, 91] },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 border border-gray-100/80 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300">
              <div className="flex items-center justify-between mb-1.5">
                <div className="p-1.5 rounded-lg" style={{ background: `${card.color}12`, color: card.color }}>
                  <Icon size={12} />
                </div>
                <span className="text-[7px] font-semibold px-1 py-0.5 rounded-full" style={{ background: `${card.color}12`, color: card.color }}>{card.trend}</span>
              </div>
              <div className="text-sm md:text-base font-extrabold text-gray-900">{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</div>
              <div className="text-[8px] text-gray-400 font-medium mb-1">{card.label}</div>
              <div className="h-6">
                <MiniChart data={card.chart} color={card.color} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ===== ADVANCED FILTER SYSTEM ===== */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-gray-100/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Period:</span>
            {['7d', '30d', '90d', '1y', 'all'].map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-semibold transition-all ${period === p ? 'bg-[#6D4CFF] text-white' : 'text-gray-400 hover:bg-gray-100'}`}>
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : p === '1y' ? '1 Year' : 'All Time'}
              </button>
            ))}
            <span className="w-px h-4 bg-gray-200 mx-1" />
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2 py-1 rounded-lg border border-gray-200 text-[9px] focus:outline-none bg-white">
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Product">Product</option>
              <option value="Data">Data</option>
            </select>
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
              className="px-2 py-1 rounded-lg border border-gray-200 text-[9px] focus:outline-none bg-white">
              <option value="all">All Sources</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Campus">Campus</option>
              <option value="Referral">Referral</option>
              <option value="Naukri">Naukri</option>
            </select>
          </div>
          <button onClick={() => setShowReportModal(true)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF] text-[9px] font-semibold hover:bg-[#6D4CFF]/20 transition-all">
            <FileText size={12} /> Generate Report
          </button>
        </div>
      </div>

      {/* ===== CHARTS GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Application Trends */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-gray-100/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Activity size={14} className="text-[#6D4CFF]" /> Application Trends</h3>
            <div className="flex items-center gap-1">
              {['Daily', 'Weekly', 'Monthly'].map((t) => (
                <button key={t} className="px-2 py-0.5 rounded text-[8px] font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">{t}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={[]}>
              <defs>
                <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CLR.primary} stopOpacity={0.3} /><stop offset="100%" stopColor={CLR.primary} stopOpacity={0} /></linearGradient>
                <linearGradient id="shortGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CLR.purple} stopOpacity={0.3} /><stop offset="100%" stopColor={CLR.purple} stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(v: string) => v.split(' ')[0]} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
              <Area type="monotone" dataKey="applications" stroke={CLR.primary} strokeWidth={2} fill="url(#appGrad)" dot={{ r: 2, fill: CLR.primary }} />
              <Area type="monotone" dataKey="shortlisted" stroke={CLR.purple} strokeWidth={1.5} fill="url(#shortGrad)" dot={{ r: 2, fill: CLR.purple }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hiring Funnel */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-gray-100/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Target size={14} className="text-[#6D4CFF]" /> Hiring Funnel</h3>
            <button onClick={() => setShowFunnelDetail(true)} className="text-[9px] font-semibold text-[#6D4CFF] hover:underline">Details</button>
          </div>
          <div className="space-y-2.5">
            {funnel.map((f, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: f.color }} />
                    {f.stage}
                  </span>
                  <span className="text-gray-400 font-medium">{f.count} ({f.pct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${f.pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                    className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${f.color}, ${f.color}88)` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t border-gray-100">
            {funnel.map((f, i) => (
              <div key={i} className="text-center">
                <div className="text-[9px] font-bold" style={{ color: f.color }}>{f.avgDays}</div>
                <div className="text-[7px] text-gray-400">Days</div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Performance Analysis */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-gray-100/80 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Briefcase size={14} className="text-[#6D4CFF]" /> Job Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[]} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 9 }} />
              <YAxis dataKey="title" type="category" tick={{ fontSize: 8 }} width={80} />
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
              <Bar dataKey="applications" fill={CLR.primary} radius={[0, 4, 4, 0]} />
              <Bar dataKey="shortlisted" fill={CLR.purple} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Candidate Quality Distribution */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-gray-100/80 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Star size={14} className="text-[#6D4CFF]" /> Candidate Quality Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={[
                { name: 'High Match (90%+)', value: 25, color: CLR.success },
                { name: 'Medium Match (70-89%)', value: 45, color: CLR.warning },
                { name: 'Low Match (<70%)', value: 30, color: CLR.danger },
              ]} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {[
                  { name: 'High Match (90%+)', value: 25, color: CLR.success },
                  { name: 'Medium Match (70-89%)', value: 45, color: CLR.warning },
                  { name: 'Low Match (<70%)', value: 30, color: CLR.danger },
                ].map((e, idx) => <Cell key={idx} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {[
              { label: 'High Match', color: CLR.success, value: '25%' },
              { label: 'Medium Match', color: CLR.warning, value: '45%' },
              { label: 'Low Match', color: CLR.danger, value: '30%' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                <span className="text-[8px] text-gray-500">{item.label}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MIDDLE SECTION: 3 COLUMN LAYOUT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Funnel Detail */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-gray-100/80 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Funnel Performance</h3>
          <div className="space-y-4">
            {funnel.map((f, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-semibold text-gray-600">{f.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{f.count}</span>
                    <span className="text-gray-400">{f.pct}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden relative">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${f.pct}%` }}
                    className="h-full rounded-full absolute left-0 top-0" style={{ background: f.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 text-center">
              <div className="text-lg font-extrabold text-[#6D4CFF]">{stats.conversionRate || 8.2}%</div>
              <div className="text-[8px] text-gray-400">Overall Conv. Rate</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 text-center">
              <div className="text-lg font-extrabold text-[#22C55E]">{stats.offerAcceptance || 80}%</div>
              <div className="text-[8px] text-gray-400">Offer Acceptance</div>
            </div>
          </div>
        </div>

        {/* Source Performance */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-gray-100/80 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Recruitment Sources</h3>
          <div className="space-y-2">
            {(stats?.sources || []).map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-gray-700">{s.name}</span>
                    <span className="text-[9px] font-bold text-gray-600">{s.applications}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[8px] text-gray-400">
                    <span>{s.hires} hires</span>
                    <span>|</span>
                    <span>{formatCurrency(s.cost)}</span>
                    <span>|</span>
                    <span style={{ color: s.quality >= 90 ? CLR.success : s.quality >= 80 ? CLR.warning : CLR.danger }}>{s.quality}% quality</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Analysis */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-gray-100/80 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><DollarSign size={14} className="text-[#6D4CFF]" /> Cost Analysis</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={stats?.costData || []} layout="vertical" margin={{ left: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 8 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 8 }} width={65} />
              <Tooltip contentStyle={{ fontSize: 9, borderRadius: 8 }} formatter={(v: any) => formatCurrency(v)} />
              <Bar dataKey="cost" fill={CLR.info} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
            <div className="text-center">
              <div className="text-xs font-extrabold text-gray-800">{formatCurrency(0)}</div>
              <div className="text-[7px] text-gray-400">Total Spend</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-extrabold text-gray-800">{formatCurrency(0)}</div>
              <div className="text-[7px] text-gray-400">Per Hire</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-extrabold text-green-600">{stats.recruitmentROI || 285}%</div>
              <div className="text-[7px] text-gray-400">ROI</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== JOB PERFORMANCE LEADERBOARD ===== */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
        <div className="p-4 md:p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Award size={14} className="text-[#6D4CFF]" /> Job Performance Leaderboard</h3>
            <button onClick={() => setShowReportModal(true)} className="text-[9px] font-semibold text-[#6D4CFF] hover:underline">Full Report</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead className="bg-gray-50/80">
              <tr>
                {['Job Title', 'Dept', 'Applications', 'Shortlisted', 'Intvs', 'Hires', 'Conv. Rate', 'Score', 'Days Open'].map((h) => (
                  <th key={h} className="text-left px-3 py-2.5 text-[9px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats?.jobPerformance || []).sort((a: any, b: any) => (b.score || 0) - (a.score || 0)).map((job: any, i: number) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  onClick={() => setSelectedJob(job)}
                  className={`border-t border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${selectedJob === job ? 'bg-[#6D4CFF]/5' : ''}`}>
                  <td className="px-3 py-2.5 font-semibold text-gray-800 whitespace-nowrap">{job.title}</td>
                  <td className="px-3 py-2.5 text-gray-500">{job.department}</td>
                  <td className="px-3 py-2.5 font-bold text-gray-800">{job.applications}</td>
                  <td className="px-3 py-2.5 text-gray-600">{job.shortlisted}</td>
                  <td className="px-3 py-2.5 text-gray-600">{job.interviews}</td>
                  <td className="px-3 py-2.5 font-bold"><span className={job.hires > 0 ? 'text-green-600' : 'text-gray-400'}>{job.hires}</span></td>
                  <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded-full text-[8px] font-semibold ${job.conversion > 0 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>{job.conversion > 0 ? `${job.conversion}%` : '—'}</span></td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#22C55E]" style={{ width: `${job.score}%` }} />
                      </div>
                      <span className="text-[9px] font-bold" style={{ color: job.score >= 90 ? CLR.success : job.score >= 80 ? CLR.warning : CLR.danger }}>{job.score}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-500">{job.daysOpen}d</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== INTERVIEW & PREDICTIVE ANALYTICS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Interview Analytics */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-gray-100/80 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Video size={14} className="text-[#6D4CFF]" /> Interview Analytics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Completion', value: `${stats.interviewCompletionRate || 88}%`, color: CLR.success },
              { label: 'Success Rate', value: `${stats.interviewSuccessRate || 72}%`, color: CLR.teal },
              { label: 'Avg Duration', value: `${stats.avgInterviewDuration || 42}m`, color: CLR.warning },
              { label: 'Selection Rate', value: `${stats.hired && stats.interviews ? Math.round((stats.hired / stats.interviews) * 100) : 50}%`, color: CLR.primary },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-gray-50 text-center">
                <div className="text-sm font-extrabold" style={{ color: item.color }}>{item.value}</div>
                <div className="text-[8px] text-gray-400">{item.label}</div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={[]} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value">
              </Pie>
              <Tooltip contentStyle={{ fontSize: 9, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <span className="text-[8px] text-gray-400">Interview data will appear here</span>
          </div>
        </div>

        {/* Predictive Analytics */}
        <div className="bg-gradient-to-br from-[#6D4CFF]/5 via-[#A855F7]/5 to-[#EC4899]/5 rounded-2xl p-4 md:p-5 border border-[#6D4CFF]/10 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Zap size={14} className="text-[#6D4CFF]" /> Predictive Analytics</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-white/80 border border-gray-100 text-center">
              <div className="text-lg font-extrabold text-[#6D4CFF]">{stats?.predicted?.predictedApplications || 0}</div>
              <div className="text-[8px] text-gray-400">Predicted Apps</div>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-gray-100 text-center">
              <div className="text-lg font-extrabold text-[#22C55E]">{stats?.predicted?.expectedHires || 0}</div>
              <div className="text-[8px] text-gray-400">Expected Hires</div>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-gray-100 text-center">
              <div className="text-lg font-extrabold" style={{ color: CLR.success }}>{stats?.predicted?.hiringProbability || 0}%</div>
              <div className="text-[8px] text-gray-400">Success Prob.</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Department Forecast</div>
            {(stats?.predicted?.departmentForecast || []).map((d: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/60 hover:bg-white/80 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-gray-700">{d.department}</span>
                    <span className="text-gray-500">{d.predicted} hires</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${d.confidence}%`, background: d.confidence >= 90 ? CLR.success : d.confidence >= 80 ? CLR.warning : CLR.danger }} />
                    </div>
                    <span className="text-[8px] font-medium text-gray-400">{d.confidence}% confidence</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== AI INSIGHTS SECTION ===== */}
      <div className="bg-gradient-to-br from-[#6D4CFF]/5 via-[#A855F7]/5 to-[#EC4899]/5 rounded-2xl p-4 md:p-5 border border-[#6D4CFF]/10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center shadow-sm">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">AI Recruitment Insights</h3>
              <p className="text-[9px] text-gray-400">Intelligence-driven hiring recommendations</p>
            </div>
          </div>
          <button onClick={() => setShowAIInsights(true)} className="px-3 py-1.5 rounded-lg bg-[#6D4CFF] text-white text-[9px] font-semibold hover:bg-[#5a3ed9] transition-all flex items-center gap-1">
            <Sparkles size={11} /> View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(stats?.aiInsights || []).slice(0, 3).map((insight: any, i: number) => {
            const InsightIcon = insight.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="p-1.5 rounded-lg mt-0.5 flex-shrink-0" style={{ background: `${insight.color}12`, color: insight.color }}>
                  <InsightIcon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-gray-600 leading-relaxed">{insight.text}</p>
                  <span className="text-[7px] font-semibold uppercase tracking-wider mt-0.5 block" style={{ color: insight.priority === 'high' ? CLR.success : insight.priority === 'medium' ? CLR.warning : CLR.info }}>
                    {insight.priority} priority
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ===== RIGHT SIDEBAR (BOTTOM) ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Score */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
          <h3 className="text-xs font-bold text-gray-800 mb-3">Recruitment Health</h3>
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f0f0f0" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={CLR.success} strokeWidth="3"
                  strokeDasharray={`${(stats.aiHiringScore || 91) * 0.341} 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-extrabold" style={{ color: (stats.aiHiringScore || 91) >= 85 ? CLR.success : CLR.warning }}>{stats.aiHiringScore || 91}%</span>
              </div>
            </div>
            <div className="text-[9px] text-gray-400">Hiring Health Score</div>
            <div className="text-[8px] text-green-600 font-semibold mt-0.5">Excellent performance</div>
          </div>
        </div>

        {/* Top Jobs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
          <h3 className="text-xs font-bold text-gray-800 mb-3">Top Performing Jobs</h3>
          <div className="space-y-2">
            {(stats?.jobPerformance || []).sort((a: any, b: any) => (b.score || 0) - (a.score || 0)).slice(0, 4).map((job: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold text-gray-700 truncate">{job.title}</div>
                  <div className="text-[8px] text-gray-400">{job.applications} apps / {job.hires} hires</div>
                </div>
                <span className={`text-[9px] font-bold ${job.score >= 90 ? 'text-green-600' : job.score >= 80 ? 'text-amber-600' : 'text-gray-400'}`}>{job.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Reports */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
          <h3 className="text-xs font-bold text-gray-800 mb-3">Quick Reports</h3>
          <div className="space-y-1.5">
            {[
              { icon: FileText, label: 'Hiring Report', color: CLR.primary },
              { icon: Video, label: 'Interview Report', color: CLR.warning },
              { icon: Target, label: 'Funnel Report', color: CLR.purple },
              { icon: Building2, label: 'Department Report', color: CLR.info },
              { icon: DollarSign, label: 'Cost Analysis', color: CLR.teal },
              { icon: Star, label: 'Quality Report', color: CLR.success },
            ].map((r, i) => {
              const RIcon = r.icon;
              return (
                <button key={i} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-all text-left">
                  <div className="p-1 rounded" style={{ background: `${r.color}12`, color: r.color }}>
                    <RIcon size={11} />
                  </div>
                  <span className="text-[9px] font-medium text-gray-600">{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Targets */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
          <h3 className="text-xs font-bold text-gray-800 mb-3">Recruitment Targets</h3>
          <div className="space-y-3">
            {[
              { label: 'Monthly Hires', current: stats.hired || 8, target: 12, color: CLR.primary },
              { label: 'Quality Score', current: stats.aiHiringScore || 91, target: 95, color: CLR.success },
              { label: 'Time to Hire', current: stats.timeToHire || 14, target: 10, color: CLR.warning, invert: true },
            ].map((t, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-[9px] mb-0.5">
                  <span className="font-medium text-gray-500">{t.label}</span>
                  <span className="font-bold text-gray-700">{t.current}{typeof t.current === 'number' && t.label.includes('Score') ? '%' : ''} / {t.target}{typeof t.target === 'number' && t.label.includes('Score') ? '%' : ''}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((t.current / t.target) * 100, 100)}%` }}
                    className="h-full rounded-full" style={{ background: t.invert ? (t.current <= t.target ? CLR.success : CLR.danger) : (t.current >= t.target ? CLR.success : CLR.warning) }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
