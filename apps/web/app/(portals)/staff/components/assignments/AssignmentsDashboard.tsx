'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  School, Users, BookOpen, ClipboardList, TrendingUp, Clock, CheckCircle2,
  AlertCircle, Award, Bell, Plus, CalendarDays, Target, Star, Sparkles,
  ChevronRight, Download, MessageSquare, FileText, BarChart3, ArrowUpRight,
  Search, X, User, GraduationCap, Lightbulb, Zap, Play, Video,
  Mail, Phone, MapPin, Settings, Eye, Edit3, Filter, MoreHorizontal,
  QrCode, Camera, Fingerprint, PieChart as PieChartIcon,
  LineChart, Gift, HelpCircle, Moon, Sun, Globe, BookMarked, Send,
  Trash2, RefreshCw, Timer, BadgeAlert, BadgeCheck, BadgeMinus,
  ListChecks, Trophy, Medal, BrainCircuit, Percent, Bookmark,
  Notebook, ScrollText, Library, ClipboardPen, DoorOpen,
  ListTodo, CalendarCheck, FileSpreadsheet, Printer,
  Atom, Beaker, Languages, Binary,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart as ReLineChart, Line,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '@/components/ui/progress';

const PCOLORS = { primary: '#7C3AED', secondary: '#8B5CF6', tertiary: '#6366F1', success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };
const PIE_COLORS = ['#7C3AED', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#6366F1', '#EC4899'];

interface AssignmentsDashboardProps {
  assignmentsHook: any;
  assignments: any[];
  classes: any[];
  setActiveTab: (tab: string) => void;
  setShowAssignModal: (v: boolean) => void;
  darkMode?: boolean;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const submissionDist = [
  { name: 'Completed', value: 324, color: '#10B981' },
  { name: 'Pending', value: 128, color: '#F59E0B' },
  { name: 'Late', value: 45, color: '#EF4444' },
  { name: 'Missing', value: 18, color: '#6B7280' },
];

const pendingReviews = [
  { name: 'Rahul Kumar', subject: 'Science Assignment', daysAgo: 2, class: '11A', score: '—', risk: 'high' },
  { name: 'Sneha Patel', subject: 'Mathematics Assignment', daysAgo: 3, class: '10B', score: '—', risk: 'medium' },
  { name: 'Arjun Singh', subject: 'English Essay', daysAgo: 1, class: '10A', score: '—', risk: 'high' },
  { name: 'Isha Mehta', subject: 'Physics Lab Report', daysAgo: 2, class: '11B', score: '—', risk: 'medium' },
];

const atRiskStudents = [
  { name: 'Rahul Kumar', avgScore: 58, subjects: ['Mathematics', 'Science'], riskLevel: 'High', class: '10A', trend: 'declining' },
  { name: 'Sneha Patel', avgScore: 62, subjects: ['English', 'History'], riskLevel: 'Medium', class: '10B', trend: 'stable' },
  { name: 'Neha Gupta', avgScore: 55, subjects: ['Mathematics', 'Physics'], riskLevel: 'High', class: '10A', trend: 'declining' },
];

const gradeDist = [
  { name: 'A+', value: 22, color: '#10B981' },
  { name: 'A', value: 28, color: '#7C3AED' },
  { name: 'B', value: 25, color: '#3B82F6' },
  { name: 'C', value: 14, color: '#F59E0B' },
  { name: 'D', value: 7, color: '#EF4444' },
  { name: 'F', value: 4, color: '#6B7280' },
];

function CounterAnimation({ value, suffix = '', duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => {
    let start = 0;
    const inc = value / (duration * 60);
    ref.current = setInterval(() => {
      start += inc;
      if (start >= value) { setCount(value); clearInterval(ref.current); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(ref.current);
  }, [value, duration]);
  return <span>{count}{suffix}</span>;
}

export function AssignmentsDashboard({ assignmentsHook, assignments, classes, setActiveTab, setShowAssignModal, darkMode }: AssignmentsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'board' | 'submissions'>('overview');
  const [expandedAssign, setExpandedAssign] = useState<string | null>(null);

  const effectiveAssignments = useMemo(() => {
    if (Array.isArray(assignments) && assignments.length > 0) return assignments;
    return [];
  }, [assignments]);

  const totalSubmissions = effectiveAssignments.reduce((s: number, a: any) => s + (a.submitted || 0), 0);
  const totalStudents = effectiveAssignments.reduce((s: number, a: any) => s + (a.students || 0), 0);
  const pendingReviewsCount = effectiveAssignments.reduce((s: number, a: any) => s + (a.pending || 0), 0);
  const totalCompletion = effectiveAssignments.length > 0
    ? Math.round(effectiveAssignments.reduce((s: number, a: any) => s + (a.completion || 0), 0) / effectiveAssignments.length)
    : 0;

  const filteredAssignments = useMemo(() => {
    let result = effectiveAssignments;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a: any) =>
        (a.title || '').toLowerCase().includes(q) ||
        (a.subject || '').toLowerCase().includes(q) ||
        (a.class || '').toLowerCase().includes(q) ||
        (a.topic || '').toLowerCase().includes(q)
      );
    }
    if (filterClass !== 'all') result = result.filter((a: any) => (a.class || '') === filterClass);
    return result;
  }, [effectiveAssignments, searchQuery, filterClass]);

  const classOptions: string[] = useMemo(() => {
    const set = new Set(effectiveAssignments.map((a: any) => a.class || ''));
    return Array.from(set) as string[];
  }, [effectiveAssignments]);

  const SectionCard = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
    <Card className={`p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );

  const daysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const subjectIcon = (subject: string) => {
    const s = subject?.toLowerCase() || '';
    if (s.includes('math')) return BookMarked;
    if (s.includes('physics') || s.includes('science')) return Atom;
    if (s.includes('chem')) return Beaker;
    if (s.includes('english')) return Languages;
    if (s.includes('computer') || s.includes('cs')) return Binary;
    if (s.includes('biology')) return Leaf;
    if (s.includes('history')) return ScrollText;
    return BookOpen;
  };

  if (assignmentsHook?.loading) {
    return (
      <div className="space-y-6">
        <div><div className="h-7 w-56 bg-gray-200 rounded-lg animate-pulse" /><div className="h-4 w-72 bg-gray-100 rounded-lg mt-2 animate-pulse" /></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* ===== HERO SECTION ===== */}
      <motion.div variants={fadeUp}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] p-6 md:p-8"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
          <motion.div className="absolute w-72 h-72 rounded-full bg-[#A855F7]/25 blur-[90px]" animate={{ x: [-40, 40, -40], y: [-20, 20, -20], scale: [1, 1.15, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} style={{ top: '-15%', left: '-10%' }} />
          <motion.div className="absolute w-80 h-80 rounded-full bg-[#3B82F6]/20 blur-[100px]" animate={{ x: [30, -30, 30], y: [20, -20, 20], scale: [1.1, 1, 1.1] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} style={{ bottom: '-20%', right: '-10%' }} />
          <motion.div className="absolute w-48 h-48 rounded-full bg-[#EC4899]/15 blur-[80px]" animate={{ x: [-15, 15, -15], y: [30, -30, 30] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} style={{ top: '20%', right: '25%' }} />
          {[...Array(10)].map((_, i) => (
            <motion.div key={i} animate={{ opacity: [0.1, 0.5, 0.1], y: [0, -(12 + (i % 4) * 6), 0], x: [0, (i % 3 - 1) * 10, 0] }} transition={{ duration: 5 + (i % 3) * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }} className="absolute rounded-full bg-white/30 pointer-events-none" style={{ width: `${1.5 + (i % 3) * 1}px`, height: `${1.5 + (i % 3) * 1}px`, top: `${10 + (i * 9) % 80}%`, left: `${5 + (i * 13) % 90}%` }} />
          ))}
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-200">Assignment Management</div>
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Assignments & Submissions</h1>
              </div>
            </div>
            <p className="text-sm text-purple-100/90 mt-2 max-w-xl leading-relaxed">
              Create assignments, monitor submissions, evaluate student work, and improve academic performance.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { icon: BookOpen, value: effectiveAssignments.length, label: 'Active Assignments', color: '#A855F7' },
                { icon: Users, value: totalStudents, label: 'Students', color: '#3B82F6' },
                { icon: Upload, value: totalSubmissions, label: 'Submissions', color: '#10B981' },
                { icon: Clock, value: pendingReviewsCount, label: 'Pending Reviews', color: '#F59E0B' },
              ].map((stat, i) => (
                <motion.div key={i} whileHover={{ scale: 1.03, y: -2 }} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon size={14} className="text-white/80" />
                    <span className="text-[10px] font-medium text-purple-200/80">{stat.label}</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {typeof stat.value === 'number' ? <CounterAnimation value={stat.value} /> : stat.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#7C3AED] hover:bg-white/95 hover:shadow-[0_8px_24px_rgba(255,255,255,0.25)] font-bold rounded-xl text-xs h-10 shadow-lg border-0 transition-all"
            >
              <Plus size={16} /> Create Assignment
            </motion.button>
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-10 border border-white/25 backdrop-blur-sm transition-all"
            >
              <Sparkles size={16} /> Generate with AI
            </motion.button>
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-10 border border-white/25 backdrop-blur-sm transition-all"
            >
              <BarChart3 size={16} /> Analytics
            </motion.button>
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-10 border border-white/25 backdrop-blur-sm transition-all"
            >
              <Download size={16} /> Export Reports
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ===== KPI CARDS ===== */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'Active Assignments', value: effectiveAssignments.length, sub: '+8 This Month', color: PCOLORS.primary, bg: '#F3F0FF', trend: [5, 8, 7, 10, 12, 14, 15] },
          { icon: Upload, label: 'Total Submissions', value: totalSubmissions, sub: `${Math.round((totalSubmissions / (totalStudents || 1)) * 100)}% Completion Rate`, color: PCOLORS.success, bg: '#F0FDF4', trend: [180, 220, 280, 350, 420, 500, 580] },
          { icon: Clock, label: 'Pending Reviews', value: pendingReviewsCount, sub: 'Requires Attention', color: PCOLORS.warning, bg: '#FFFBEB', trend: [22, 18, 20, 16, 14, 18, 16] },
          { icon: Trophy, label: 'Success Rate', value: `${totalCompletion}%`, sub: `${totalCompletion >= 85 ? 'Excellent' : totalCompletion >= 70 ? 'Good' : 'Needs Improvement'} Performance`, color: PCOLORS.secondary, bg: '#F5F3FF', isProgress: true },
        ].map((kpi, i) => (
          <motion.div key={i} variants={fadeUp} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: kpi.bg, color: kpi.color }}><kpi.icon size={22} /></div>
              {!kpi.isProgress && (
                <div className="flex items-end gap-0.5">
                  {(kpi.trend as number[]).map((t, ti) => (
                    <div key={ti} className="w-1.5 rounded-full" style={{ height: `${Math.max(t / 20, 2)}px`, background: ti === (kpi.trend as number[]).length - 1 ? kpi.color : '#E5E7EB' }} />
                  ))}
                </div>
              )}
            </div>
            <div className="text-2xl font-extrabold text-gray-900">
              {kpi.isProgress ? <span style={{ color: kpi.color }}>{kpi.value}</span> : <CounterAnimation value={kpi.value as number} />}
            </div>
            <div className="text-xs font-medium text-gray-500 mt-0.5">{kpi.label}</div>
            {kpi.isProgress ? (
              <div className="mt-2">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${totalCompletion}%` }} transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${PCOLORS.primary}, ${PCOLORS.secondary})` }} />
                </div>
                <span className="text-[9px] mt-0.5 block font-medium" style={{ color: kpi.color }}>{kpi.sub}</span>
              </div>
            ) : (
              <div className="text-[9px] mt-1 font-medium" style={{ color: kpi.color }}>{kpi.sub}</div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* ===== TABS ===== */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
        {[
          { key: 'overview', label: 'Dashboard', icon: Activity },
          { key: 'board', label: 'Assignment Board', icon: ClipboardPen },
          { key: 'submissions', label: 'Submissions', icon: ListChecks },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setSelectedTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${selectedTab === tab.key ? 'bg-[#7C3AED] text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            ><Icon size={15} />{tab.label}</button>
          );
        })}
      </div>

      {/* ===== OVERVIEW TAB ===== */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* LEFT 70% */}
          <div className="lg:col-span-5 space-y-6">

            {/* Assignment Board */}
            <SectionCard title="Assignment Board" subtitle={`${filteredAssignments.length} active assignments`}>
              <div className="flex flex-wrap items-center gap-2.5 mb-4 pb-4 border-b border-gray-100">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search assignments..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 bg-white" />
                </div>
                <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[#7C3AED]">
                  <option value="all">All Classes</option>
                  {classOptions.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {filteredAssignments.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-2xl bg-[#F3F0FF] flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={36} className="text-[#7C3AED]" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">No Assignments Found</h4>
                  <p className="text-xs text-gray-400 mb-4">Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAssignments.map((a: any, i: number) => {
                    const daysLeft = a.due_date ? daysUntilDue(a.due_date) : 0;
                    const isExpanded = expandedAssign === a.id;
                    const SubIcon = subjectIcon(a.subject);
                    return (
                      <motion.div key={a.id || i} layout
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#F3F0FF] flex items-center justify-center text-[#7C3AED]">
                                <SubIcon size={20} />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-gray-900 leading-tight">{a.title}</h4>
                                <span className="text-[10px] text-gray-400">{a.subject} • Class {a.class} • {a.topic}</span>
                              </div>
                            </div>
                            <Badge className={a.completion >= 80 ? 'bg-green-50 text-green-600 border-green-200 text-[9px]' : a.completion >= 50 ? 'bg-yellow-50 text-yellow-600 border-yellow-200 text-[9px]' : 'bg-red-50 text-red-600 border-red-200 text-[9px]'}>
                              {a.status || 'Active'}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                            {[
                              { label: 'Assigned', value: String(a.students), icon: Users, color: '#7C3AED' },
                              { label: 'Submitted', value: String(a.submitted), icon: Upload, color: '#10B981' },
                              { label: 'Pending', value: String(a.pending), icon: Clock, color: '#F59E0B' },
                              { label: 'Avg Score', value: a.avgScore ? `${a.avgScore}%` : '—', icon: Trophy, color: '#8B5CF6' },
                            ].map((stat, si) => (
                              <div key={si} className="text-center p-2 rounded-lg bg-gray-50">
                                <div className="flex items-center justify-center gap-1 mb-0.5">
                                  <stat.icon size={10} style={{ color: stat.color }} />
                                  <span className="text-[9px] text-gray-400">{stat.label}</span>
                                </div>
                                <div className="text-xs font-extrabold text-gray-900">{stat.value}</div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${a.completion || 0}%`, background: a.completion >= 80 ? PCOLORS.success : a.completion >= 50 ? PCOLORS.warning : PCOLORS.danger }} />
                            </div>
                            <span className="text-[10px] font-semibold text-gray-500">{a.completion || 0}%</span>
                            <span className={`text-[9px] font-medium ${daysLeft > 3 ? 'text-gray-400' : daysLeft > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                              {daysLeft > 0 ? `${daysLeft}d left` : daysLeft === 0 ? 'Due today' : 'Overdue'}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            <button className="px-3 py-1.5 rounded-lg bg-[#F3F0FF] text-[#7C3AED] text-[10px] font-semibold hover:bg-[#EDE9FE] transition-all"><Eye size={12} className="inline mr-1 align-middle" />View</button>
                            <button className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-semibold hover:bg-blue-100 transition-all"><ClipboardList size={12} className="inline mr-1 align-middle" />Review</button>
                            <button className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-[10px] font-semibold hover:bg-amber-100 transition-all"><Edit3 size={12} className="inline mr-1 align-middle" />Edit</button>
                            <button onClick={() => setExpandedAssign(isExpanded ? null : a.id)}
                              className="px-2 py-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all"
                            ><MoreHorizontal size={14} /></button>
                          </div>

                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 pt-3 border-t border-gray-100">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                                <div className="p-2.5 rounded-lg bg-gray-50">
                                  <div className="text-[9px] text-gray-400 mb-0.5">Created</div>
                                  <div className="text-xs font-semibold text-gray-900">{a.created || '—'}</div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-gray-50">
                                  <div className="text-[9px] text-gray-400 mb-0.5">Due Date</div>
                                  <div className="text-xs font-semibold text-gray-900">{a.due_date ? formatDate(a.due_date) : '—'}</div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-gray-50">
                                  <div className="text-[9px] text-gray-400 mb-0.5">Submission Rate</div>
                                  <div className="text-xs font-semibold text-gray-900">{a.completion}% ({a.submitted}/{a.students})</div>
                                </div>
                                <div className="p-2.5 rounded-lg bg-gray-50">
                                  <div className="text-[9px] text-gray-400 mb-0.5">Performance</div>
                                  <div className="text-xs font-semibold text-gray-900">{a.avgScore ? `Avg: ${a.avgScore}%` : 'Not graded'}</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button className="flex-1 py-2 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-semibold hover:bg-blue-100 transition-all"><Users size={12} className="inline mr-1 align-middle" /> Manage Students</button>
                                <button className="flex-1 py-2 rounded-lg bg-green-50 text-green-600 text-[10px] font-semibold hover:bg-green-100 transition-all"><BarChart3 size={12} className="inline mr-1 align-middle" /> Analytics</button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* Submission Analytics */}
            <SectionCard title="Submission Analytics" subtitle="Assignment completion trends & distribution">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="lg:col-span-2">
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">Daily Submissions (Last 14 Days)</h4>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={[]}>
                      <defs><linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED" stopOpacity={0.3} /><stop offset="100%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 8, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval={3} />
                      <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: '11px' }} />
                      <Area type="monotone" dataKey="submissions" stroke="#7C3AED" strokeWidth={2} fill="url(#subGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">Status Distribution</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-24 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={submissionDist} cx="50%" cy="50%" innerRadius={28} outerRadius={44} paddingAngle={3} dataKey="value">
                            {submissionDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-1">
                      {submissionDist.map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                            <span className="text-gray-500">{s.name}</span>
                          </div>
                          <span className="font-semibold text-gray-900">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 mb-3">Class-wise Completion</h4>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={[]} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: '10px' }} />
                    <Bar dataKey="completion" name="Completion %" radius={[6, 6, 0, 0]}>
                      {([] as any[]).map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            {/* Recent Submissions */}
            <SectionCard title="Recent Submissions" subtitle="Latest student assignment submissions">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-500">Student</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-500">Class</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-500">Assignment</th>
                      <th className="text-left py-2.5 px-2 font-semibold text-gray-500">Submitted</th>
                      <th className="text-center py-2.5 px-2 font-semibold text-gray-500">Score</th>
                      <th className="text-center py-2.5 px-2 font-semibold text-gray-500">Status</th>
                      <th className="text-right py-2.5 px-2 font-semibold text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {([] as any[]).slice(0, 7).map((s, i) => (
                      <tr key={s.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-[8px] bg-[#F3F0FF] text-[#7C3AED] font-bold">{s.student.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-gray-900 whitespace-nowrap">{s.student}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-gray-500">{s.class}</td>
                        <td className="py-2.5 px-2 text-gray-600 truncate">{s.assignment}</td>
                        <td className="py-2.5 px-2 text-gray-500 whitespace-nowrap">{s.submitted}</td>
                        <td className="py-2.5 px-2 text-center">
                          <span className={`font-bold ${s.score !== '—' ? 'text-green-600' : 'text-gray-300'}`}>{s.score}</span>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <Badge className={s.status === 'reviewed' ? 'bg-green-50 text-green-600 border-green-200 text-[9px]' : 'bg-yellow-50 text-yellow-600 border-yellow-200 text-[9px]'}>
                            {s.status === 'reviewed' ? 'Reviewed' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><Eye size={13} /></button>
                            <button className="p-1.5 rounded-lg hover:bg-[#F3F0FF] text-gray-400 hover:text-[#7C3AED] transition-all"><MessageSquare size={13} /></button>
                            <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"><Award size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-[10px] text-gray-500">{0} total submissions</span>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F3F0FF] text-[#7C3AED] text-[9px] font-semibold hover:bg-[#EDE9FE] transition-all">
                  <Download size={12} /> Export
                </button>
              </div>
            </SectionCard>

            {/* Pending Reviews */}
            <SectionCard title="Pending Reviews" subtitle="Assignments awaiting evaluation">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pendingReviews.map((pr, i) => (
                  <motion.div key={i} whileHover={{ y: -2 }} className={`p-4 rounded-xl ${pr.risk === 'high' ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'} hover:shadow-md transition-all`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${pr.risk === 'high' ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'}`}>
                          <Clock size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900">{pr.name}</h4>
                          <span className="text-[9px] text-gray-400">{pr.class}</span>
                        </div>
                      </div>
                      <Badge className={pr.risk === 'high' ? 'bg-red-100 text-red-600 border-0 text-[8px]' : 'bg-amber-100 text-amber-600 border-0 text-[8px]'}>
                        {pr.risk === 'high' ? 'Urgent' : 'Normal'}
                      </Badge>
                    </div>
                    <div className="text-[10px] text-gray-500 mb-2">{pr.subject} • Submitted {pr.daysAgo}d ago</div>
                    <div className="flex gap-1.5">
                      <button className="flex-1 py-1.5 rounded-lg bg-white text-gray-700 text-[9px] font-semibold hover:bg-gray-50 transition-all border border-gray-200"><Eye size={11} className="inline mr-1 align-middle" />Review</button>
                      <button className="flex-1 py-1.5 rounded-lg bg-[#7C3AED] text-white text-[9px] font-semibold hover:bg-[#6D28D9] transition-all"><Award size={11} className="inline mr-1 align-middle" />Grade</button>
                      <button className="flex-1 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-semibold hover:bg-blue-100 transition-all"><Send size={11} className="inline mr-1 align-middle" />Feedback</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </SectionCard>

            {/* At-Risk Students */}
            <SectionCard title="Students Needing Support" subtitle="Students performing below expected benchmarks">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {atRiskStudents.map((student, i) => (
                  <motion.div key={i} whileHover={{ y: -2 }} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${student.riskLevel === 'High' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-500'}`}>
                          <AlertCircle size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{student.name}</h4>
                          <span className="text-[9px] text-gray-400">{student.class}</span>
                        </div>
                      </div>
                      <Badge className={student.riskLevel === 'High' ? 'bg-red-50 text-red-600 border-red-200 text-[8px]' : 'bg-yellow-50 text-yellow-600 border-yellow-200 text-[8px]'}>
                        {student.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div>
                        <div className="text-[9px] text-gray-400">Avg Score</div>
                        <div className="text-lg font-extrabold text-red-500">{student.avgScore}%</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-[9px] text-gray-400">Subjects</div>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {student.subjects.map((s, si) => (
                            <span key={si} className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[8px] font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button className="flex-1 py-1.5 rounded-lg bg-[#7C3AED] text-white text-[9px] font-semibold hover:bg-[#6D28D9] transition-all"><Eye size={11} className="inline mr-1" />View</button>
                      <button className="flex-1 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[9px] font-semibold hover:bg-gray-200 transition-all"><Mail size={11} className="inline mr-1" />Notify</button>
                      <button className="flex-1 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-semibold hover:bg-blue-100 transition-all"><Lightbulb size={11} className="inline mr-1" />Help</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* RIGHT 30% */}
          <div className="lg:col-span-2 space-y-5">

            {/* Upcoming Deadlines */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Upcoming Deadlines</h3>
              <div className="space-y-2">
                {([] as any[]).map((dl, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#7C3AED]/30 transition-all">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dl.urgent ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900 truncate">{dl.title}</div>
                      <div className="text-[9px] text-gray-400">Class {dl.class}</div>
                    </div>
                    <span className={`text-[9px] font-semibold flex-shrink-0 ${dl.urgent ? 'text-red-500' : 'text-gray-400'}`}>{dl.due}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 py-2 rounded-xl bg-[#F3F0FF] text-[#7C3AED] text-xs font-semibold hover:bg-[#EDE9FE] transition-all flex items-center justify-center gap-1.5">
                <CalendarDays size={14} /> View All Deadlines
              </button>
            </Card>

            {/* Recent Activity */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {([] as any[]).map((act, i) => {
                  const Icon = act.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${act.color}15`, color: act.color }}><Icon size={14} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 leading-tight">{act.text}</div>
                        <div className="text-[9px] text-gray-400 mt-0.5">{act.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Class Performance */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Class Performance</h3>
              <div className="space-y-3">
                {([] as any[]).map((cls, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600 font-medium">Class {cls.name}</span>
                      <span className="font-bold text-gray-900">{cls.completion}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${cls.completion}%` }}
                        transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full" style={{ background: cls.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Prerana AI Assignment Assistant */}
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] rounded-2xl p-5 text-white overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <Sparkles size={18} className="text-purple-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Prerana AI</h3>
                    <p className="text-[10px] text-purple-200/80">Assignment Assistant</p>
                  </div>
                </div>
                <p className="text-xs text-purple-100/90 mb-4 leading-relaxed">
                  Hello Teacher 👋 I can help create assignments, generate questions, review submissions, and analyze student performance.
                </p>
                <div className="grid grid-cols-2 gap-1.5 mb-4">
                  {[
                    { label: 'Generate Assignment', icon: BookOpen },
                    { label: 'Create Homework', icon: ClipboardList },
                    { label: 'Generate Rubrics', icon: FileText },
                    { label: 'Review Student Work', icon: Eye },
                    { label: 'Assignment Analytics', icon: BarChart3 },
                    { label: 'Auto Feedback', icon: MessageSquare },
                  ].map((sugg, si) => (
                    <button key={si} onClick={() => setShowAssignModal(true)}
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white/10 border border-white/10 text-[10px] text-white hover:bg-white/20 transition-all"
                    >
                      <sugg.icon size={13} />
                      <span>{sugg.label}</span>
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                    <input type="text" placeholder="Ask AI about assignments..." className="flex-1 bg-transparent border-0 text-xs text-white placeholder-purple-200/60 focus:outline-none" />
                    <button className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"><Send size={12} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ===== ASSIGNMENT BOARD TAB ===== */}
      {selectedTab === 'board' && (
        <div className="space-y-6">
          <SectionCard title="Assignment Board" subtitle="Full assignment management board">
            <div className="flex flex-wrap items-center gap-2.5 mb-4 pb-4 border-b border-gray-100">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search assignments..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 bg-white" />
              </div>
              <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[#7C3AED]">
                <option value="all">All Classes</option>
                {classOptions.map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] transition-all">
                <Plus size={14} /> New Assignment
              </button>
            </div>

            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 rounded-2xl bg-[#F3F0FF] flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={44} className="text-[#7C3AED]" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">No Assignments Found</h4>
                <p className="text-sm text-gray-400 mb-5">No assignments match your current filters.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => { setSearchQuery(''); setFilterClass('all'); }}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all"
                  >Clear Filters</button>
                  <button onClick={() => setShowAssignModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] transition-all"
                  >Create Assignment</button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-3 font-semibold text-gray-500">Assignment</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-500">Subject</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-500">Class</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-500">Due Date</th>
                      <th className="text-center py-3 px-3 font-semibold text-gray-500">Students</th>
                      <th className="text-center py-3 px-3 font-semibold text-gray-500">Submitted</th>
                      <th className="text-center py-3 px-3 font-semibold text-gray-500">Completion</th>
                      <th className="text-center py-3 px-3 font-semibold text-gray-500">Avg Score</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((a: any, i: number) => {
                      const daysLeft = a.due_date ? daysUntilDue(a.due_date) : 0;
                      return (
                        <tr key={a.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-3 font-medium text-gray-900 truncate">{a.title}</td>
                          <td className="py-3 px-3 text-gray-600">{a.subject}</td>
                          <td className="py-3 px-3">
                            <Badge className="bg-[#F3F0FF] text-[#7C3AED] border-0 text-[9px]">{a.class}</Badge>
                          </td>
                          <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{a.due_date ? formatDate(a.due_date) : '—'}</td>
                          <td className="py-3 px-3 text-center font-medium text-gray-900">{a.students || 0}</td>
                          <td className="py-3 px-3 text-center font-medium text-gray-900">{a.submitted || 0}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 justify-center">
                              <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${a.completion || 0}%`, background: a.completion >= 80 ? '#10B981' : a.completion >= 50 ? '#F59E0B' : '#EF4444' }} />
                              </div>
                              <span className="text-[10px] font-semibold text-gray-500">{a.completion || 0}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`font-bold ${a.avgScore >= 80 ? 'text-green-600' : a.avgScore >= 60 ? 'text-yellow-600' : 'text-gray-400'}`}>
                              {a.avgScore ? `${a.avgScore}%` : '—'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 rounded-lg hover:bg-[#F3F0FF] text-gray-400 hover:text-[#7C3AED] transition-all"><Eye size={14} /></button>
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><Edit3 size={14} /></button>
                              <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* ===== SUBMISSIONS TAB ===== */}
      {selectedTab === 'submissions' && (
        <div className="space-y-6">
          <SectionCard title="All Submissions" subtitle="Track and review student assignment submissions">
            <div className="flex flex-wrap items-center gap-2.5 mb-4 pb-4 border-b border-gray-100">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search by student, assignment, or class..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 bg-white" />
              </div>
              <select className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[#7C3AED]">
                <option>All Assignments</option>
                {effectiveAssignments.map((a: any, i: number) => <option key={i}>{a.title}</option>)}
              </select>
              <select className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[#7C3AED]">
                <option>All Status</option>
                <option>Reviewed</option>
                <option>Pending</option>
              </select>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] transition-all">
                <Download size={14} /> Export
              </button>
            </div>

            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-5 text-[9px] text-gray-500 font-semibold uppercase">Student</th>
                    <th className="text-left py-3 px-3 text-[9px] text-gray-500 font-semibold uppercase">Class</th>
                    <th className="text-left py-3 px-3 text-[9px] text-gray-500 font-semibold uppercase">Assignment</th>
                    <th className="text-left py-3 px-3 text-[9px] text-gray-500 font-semibold uppercase">Submitted</th>
                    <th className="text-center py-3 px-3 text-[9px] text-gray-500 font-semibold uppercase">Score</th>
                    <th className="text-center py-3 px-3 text-[9px] text-gray-500 font-semibold uppercase">Status</th>
                    <th className="text-right py-3 px-5 text-[9px] text-gray-500 font-semibold uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {([] as any[]).map((s, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className="text-[8px] bg-gradient-to-br from-[#7C3AED] to-[#6366F1] text-white font-bold">{'—'}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-900 text-xs">{s.student}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-500">{s.class}</td>
                      <td className="py-3 px-3 text-gray-700 truncate">{s.assignment}</td>
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{s.submitted}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-bold ${s.score !== '—' ? 'text-green-600' : 'text-gray-300'}`}>{s.score}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge className={s.status === 'reviewed' ? 'bg-green-50 text-green-600 border-green-200 text-[8px]' : 'bg-yellow-50 text-yellow-600 border-yellow-200 text-[8px]'}>
                          {s.status === 'reviewed' ? 'Reviewed' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><Eye size={13} /></button>
                          <button className="p-1.5 rounded-lg hover:bg-[#F3F0FF] text-gray-400 hover:text-[#7C3AED] transition-all"><MessageSquare size={13} /></button>
                          <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"><Award size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <span className="text-[10px] text-gray-500">{0} total submissions</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-400">Show: <strong>10</strong> per page</span>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

    </motion.div>
  );
}

function Activity(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h4l2 9 4-18 2 9h4" /></svg>; }

const Upload = (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m7-4l4 4m0 0l4-4m-4 4V3" /></svg>;

function Leaf(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 2L2 7l11 5 11-5L13 2zM2 17l11 5 11-5M2 12l11 5 11-5" /></svg>; }
