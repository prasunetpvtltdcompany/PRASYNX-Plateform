'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Clock, CheckCircle2, AlertCircle, FileText, Download,
  Calendar, Search, Filter, ArrowUpDown, Plus, BookOpen, TrendingUp,
  Award, Zap, Flame, Target, Star, Medal, Brain, Lightbulb,
  ChevronRight, Play, Upload, Eye, Edit3, MessageSquare, BookMarked,
  HelpCircle, Sparkles, BarChart3, ChevronDown, Circle, Timer,
  User, Paperclip, Trophy, ArrowRight, GraduationCap, Layers,
  ChevronLeft, List, LayoutGrid, SlidersHorizontal, X,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const PIE_COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#6D4CFF', '#8B5CF6'];
const STATUS_COLORS: Record<string, string> = {
  completed: '#22C55E', graded: '#22C55E', submitted: '#3B82F6',
  in_progress: '#F59E0B', pending: '#EF4444', overdue: '#DC2626', draft: '#94A3B8',
};
const PRIORITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  urgent: { bg: '#FEF2F2', text: '#EF4444', label: 'Urgent' },
  high: { bg: '#FFF7ED', text: '#F97316', label: 'High' },
  medium: { bg: '#FFFBEB', text: '#F59E0B', label: 'Medium' },
  low: { bg: '#EFF6FF', text: '#3B82F6', label: 'Low' },
};

interface AssignmentsDashboardProps {
  assignmentsData?: any[];
  assignmentsHook: any;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const statusLabels: Record<string, string> = {
  pending: 'Pending', in_progress: 'In Progress', submitted: 'Submitted',
  completed: 'Completed', graded: 'Completed', overdue: 'Overdue', draft: 'Draft',
};

function CounterAnimation({ value, suffix = '', duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => {
    let start = 0;
    const increment = value / (duration * 60);
    ref.current = setInterval(() => {
      start += increment;
      if (start >= value) { setCount(value); clearInterval(ref.current); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(ref.current);
  }, [value, duration]);
  return <span>{count}{suffix}</span>;
}

function RefreshCw({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

const demoAssignments: any[] = [];

export function AssignmentsDashboard({ assignmentsData, assignmentsHook }: AssignmentsDashboardProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const effectiveData = useMemo(() => {
    if (Array.isArray(assignmentsData) && assignmentsData.length > 0) return assignmentsData;
    return demoAssignments;
  }, [assignmentsData]);

  const filtered = useMemo(() => {
    if (!Array.isArray(effectiveData)) return [];
    let items = [...effectiveData];
    if (activeTab !== 'all') {
      items = items.filter((a: any) => {
        const s = a.status || 'pending';
        if (activeTab === 'overdue') return s === 'pending' && a.due_date && new Date(a.due_date) < new Date();
        if (activeTab === 'draft') return s === 'draft';
        return s === activeTab || (activeTab === 'completed' && (s === 'completed' || s === 'graded'));
      });
    }
    if (selectedSubject !== 'all') {
      items = items.filter((a: any) =>
        (a.subject || a.subject_name || '').toLowerCase() === selectedSubject.toLowerCase()
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((a: any) =>
        (a.title || a.name || '').toLowerCase().includes(q) ||
        (a.subject || a.subject_name || '').toLowerCase().includes(q) ||
        (a.teacher_name || a.teacher || '').toLowerCase().includes(q)
      );
    }
    items.sort((a: any, b: any) => {
      if (sortBy === 'dueDate') return (a.due_date || '').localeCompare(b.due_date || '');
      if (sortBy === 'priority') return (getPriority(a) > getPriority(b) ? -1 : 1);
      if (sortBy === 'status') return (a.status || 'pending').localeCompare(b.status || 'pending');
      return 0;
    });
    return items;
  }, [effectiveData, activeTab, searchQuery, selectedSubject, sortBy]);

  const stats = useMemo(() => {
    const data = Array.isArray(effectiveData) ? effectiveData : [];
    const pending = data.filter((a: any) => (a.status || 'pending') === 'pending' && (!a.due_date || new Date(a.due_date) >= new Date())).length;
    const overdue = data.filter((a: any) => (a.status || 'pending') === 'pending' && a.due_date && new Date(a.due_date) < new Date()).length;
    const inProgress = data.filter((a: any) => a.status === 'in_progress' || a.status === 'in-progress').length;
    const submitted = data.filter((a: any) => a.status === 'submitted').length;
    const completed = data.filter((a: any) => a.status === 'completed' || a.status === 'graded').length;
    const draft = data.filter((a: any) => a.status === 'draft').length;
    const total = data.length;
    const avgScore = completed > 0
      ? Math.round(data.filter((a: any) => a.score || a.marks).reduce((s: number, a: any) => s + (a.score || a.marks || 0), 0) / completed)
      : 0;
    return { pending, overdue, inProgress, submitted, completed, draft, total, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0, avgScore };
  }, [effectiveData]);

  const tabCounts = useMemo(() => {
    const data = Array.isArray(effectiveData) ? effectiveData : [];
    return {
      all: data.length,
      pending: data.filter((a: any) => (a.status || 'pending') === 'pending' && (!a.due_date || new Date(a.due_date) >= new Date())).length,
      in_progress: data.filter((a: any) => a.status === 'in_progress' || a.status === 'in-progress').length,
      submitted: data.filter((a: any) => a.status === 'submitted').length,
      completed: data.filter((a: any) => a.status === 'completed' || a.status === 'graded').length,
      overdue: data.filter((a: any) => (a.status || 'pending') === 'pending' && a.due_date && new Date(a.due_date) < new Date()).length,
      draft: data.filter((a: any) => a.status === 'draft').length,
    };
  }, [effectiveData]);

  const pieData = [
    { name: 'Completed', value: stats.completed || 1, color: PIE_COLORS[0] },
    { name: 'Submitted', value: stats.submitted || 1, color: PIE_COLORS[1] },
    { name: 'In Progress', value: stats.inProgress || 1, color: PIE_COLORS[2] },
    { name: 'Pending', value: stats.pending || 1, color: PIE_COLORS[3] },
    { name: 'Overdue', value: stats.overdue || 1, color: PIE_COLORS[4] },
    { name: 'Draft', value: stats.draft || 1, color: PIE_COLORS[5] },
  ].filter(d => d.value > 0);

  const subjects = useMemo(() => {
    if (!Array.isArray(effectiveData)) return [];
    const map = new Map<string, { given: number; completed: number; pending: number; totalScore: number; scoredCount: number }>();
    effectiveData.forEach((a: any) => {
      const sub = a.subject || a.subject_name || 'General';
      if (!map.has(sub)) map.set(sub, { given: 0, completed: 0, pending: 0, totalScore: 0, scoredCount: 0 });
      const entry = map.get(sub)!;
      entry.given++;
      if (a.status === 'completed' || a.status === 'graded') {
        entry.completed++;
        if (a.score || a.marks) { entry.totalScore += (a.score || a.marks); entry.scoredCount++; }
      } else entry.pending++;
    });
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      given: data.given,
      completed: data.completed,
      pending: data.pending,
      avgScore: data.scoredCount > 0 ? Math.round(data.totalScore / data.scoredCount) : 0,
      pct: data.given > 0 ? Math.round((data.completed / data.given) * 100) : 0,
    }));
  }, [effectiveData]);

  const daysUntil = (dateStr: string) => {
    if (!dateStr) return '';
    const now = new Date();
    const due = new Date(dateStr);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    if (diff === 0) return 'Due today';
    if (diff === 1) return 'Tomorrow';
    return `${diff}d left`;
  };

  const getPriority = (item: any) => {
    if (item.priority && PRIORITY_COLORS[item.priority]) return item.priority as string;
    if (item.due_date) {
      const diff = Math.ceil((new Date(item.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (diff <= 0) return 'urgent';
      if (diff <= 2) return 'high';
      if (diff <= 5) return 'medium';
    }
    return 'low';
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'completed', label: 'Completed' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'draft', label: 'Drafts' },
  ];

  const deadlineGroups = [
    { period: 'Today', items: filtered.filter((a: any) => daysUntil(a.due_date) === 'Due today'), color: '#EF4444', limit: 3 },
    { period: 'Tomorrow', items: filtered.filter((a: any) => daysUntil(a.due_date) === 'Tomorrow'), color: '#F97316', limit: 3 },
    { period: 'This Week', items: filtered.filter((a: any) => {
      const d = daysUntil(a.due_date);
      return d !== '' && !d.includes('overdue') && !d.includes('today') && !d.includes('Tomorrow') && parseInt(d) <= 7;
    }), color: '#F59E0B', limit: 4 },
  ];

  const subjectList = useMemo(() => {
    const subs = new Set<string>();
    if (Array.isArray(effectiveData)) {
      effectiveData.forEach((a: any) => subs.add(a.subject || a.subject_name || 'General'));
    }
    return ['all', ...Array.from(subs)];
  }, [effectiveData]);

  const activityFeed = [
    { action: 'Assignment Submitted', detail: 'Math Homework Ch.5', time: '2 hours ago', icon: Upload, color: '#22C55E' },
    { action: 'Feedback Received', detail: 'Science Project Review', time: '1 day ago', icon: MessageSquare, color: '#3B82F6' },
    { action: 'Marks Published', detail: 'English Essay - 85/100', time: '2 days ago', icon: Award, color: '#6D4CFF' },
    { action: 'Assignment Updated', detail: 'Physics Lab Report', time: '3 days ago', icon: Edit3, color: '#F59E0B' },
    { action: 'File Uploaded', detail: 'History Presentation.pptx', time: '4 days ago', icon: Paperclip, color: '#64748B' },
  ];

  const weeklyData = [
    { day: 'Mon', completed: 3, started: 5, hours: 4 },
    { day: 'Tue', completed: 4, started: 6, hours: 5 },
    { day: 'Wed', completed: 2, started: 4, hours: 3 },
    { day: 'Thu', completed: 5, started: 7, hours: 6 },
    { day: 'Fri', completed: 3, started: 5, hours: 4 },
    { day: 'Sat', completed: 1, started: 3, hours: 2 },
    { day: 'Sun', completed: 2, started: 3, hours: 2 },
  ];

  const SectionCard = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );

  if (assignmentsHook?.loading) {
    return (
      <div className="space-y-6">
        <div className="page-header"><h1>Assignments</h1><p>Loading your assignments...</p></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-gray-100 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
              <div className="h-7 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 p-6 animate-pulse">
          <div className="h-5 bg-gray-100 rounded w-48 mb-4" />
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}</div>
        </div>
      </div>
    );
  }

  if (assignmentsHook?.error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load assignments</h2>
        <p className="text-gray-500 mb-6">{assignmentsHook.error}</p>
        <button onClick={assignmentsHook.refetch} className="px-6 py-2.5 bg-[#6D4CFF] text-white rounded-xl font-medium hover:bg-[#5A3FD6] transition-colors">Try Again</button>
      </div>
    );
  }

  if (!Array.isArray(effectiveData) || effectiveData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 rounded-3xl bg-gray-50 flex items-center justify-center mb-6">
          <ClipboardList className="w-12 h-12 text-gray-300" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">No assignments available yet</h2>
        <p className="text-gray-500 mb-8 max-w-md text-center">Your assignments will appear here once your teachers publish them.</p>
        <div className="flex gap-3 flex-wrap justify-center">
          <button className="px-6 py-2.5 bg-[#F3F0FF] text-[#6D4CFF] rounded-xl font-medium hover:bg-[#EBE6FF] transition-colors">Browse Resources</button>
          <button className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">View Calendar</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* ===== HEADER ===== */}
      <motion.div variants={fadeUp} className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">Track, manage, submit, and complete your assignments efficiently.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <select className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 bg-white text-gray-700 outline-none focus:border-[#6D4CFF]">
            <option>2024-2025</option>
            <option>2023-2024</option>
          </select>
          <select className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 bg-white text-gray-700 outline-none focus:border-[#6D4CFF]"
            value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
            {subjectList.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</option>
            ))}
          </select>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#6D4CFF] focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs outline-none w-28 text-gray-700 placeholder:text-gray-400" />
            {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-3.5 h-3.5 text-gray-400" /></button>}
          </div>
          <select className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 bg-white text-gray-700 outline-none focus:border-[#6D4CFF]"
            value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="status">Sort: Status</option>
          </select>
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] rounded-xl shadow-[0_4px_14px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_20px_rgba(109,76,255,0.4)] transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </motion.div>

      {/* ===== HERO BANNER ===== */}
      <motion.div variants={fadeUp}>
        <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#6D4CFF] via-[#4F2DB8] to-[#2D1B69]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(109,76,255,0.15)_0%,transparent_50%)]" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#EC4899]/10 rounded-full blur-[70px]" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#3B82F6]/10 rounded-full blur-[70px]" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-white/60 mb-2">Assignment Overview</div>
              <div className="grid grid-cols-5 gap-4 mb-4">
                {[
                  { label: 'Total', value: stats.total, color: 'text-white' },
                  { label: 'Completed', value: stats.completed, color: 'text-green-300' },
                  { label: 'In Progress', value: stats.inProgress, color: 'text-yellow-300' },
                  { label: 'Pending', value: stats.pending, color: 'text-red-300' },
                  { label: 'Overdue', value: stats.overdue, color: 'text-rose-300' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-2xl md:text-3xl font-extrabold text-white"><CounterAnimation value={s.value} /></div>
                    <div className="text-[10px] text-white/60">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-3xl md:text-4xl font-extrabold text-white">{stats.completionRate}%</span>
                <span className="text-sm font-medium text-green-300 bg-green-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> Completion Rate
                </span>
              </div>
              <div className="w-full h-2.5 bg-white/15 rounded-full overflow-hidden mb-4 max-w-md">
                <motion.div initial={{ width: 0 }} animate={{ width: `${stats.completionRate}%` }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-400" />
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10 max-w-lg">
                <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0" />
                <span>You are completing assignments faster than <strong>82%</strong> of students in your class.</span>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button className="px-4 py-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-medium text-white hover:bg-white/25 transition-all flex items-center gap-2">
                  <Eye className="w-4 h-4" /> View Report
                </button>
                <button className="px-4 py-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-medium text-white hover:bg-white/25 transition-all flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Generate Study Plan
                </button>
                <button className="px-4 py-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-medium text-white hover:bg-white/25 transition-all flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download Progress
                </button>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="relative w-28 h-28 md:w-32 md:h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - stats.completionRate / 100)}`}
                    strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-white">{stats.completionRate}</div>
                    <div className="text-[9px] text-white/70 font-medium">COMPLETE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== KPI CARDS ===== */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Pending', value: stats.pending, sub: `${stats.overdue} urgent`, icon: Clock, color: '#EF4444', bg: '#FEF2F2' },
          { label: 'In Progress', value: stats.inProgress, sub: `${stats.completionRate}% complete`, icon: Target, color: '#F59E0B', bg: '#FFFBEB' },
          { label: 'Submitted', value: stats.submitted, sub: 'Awaiting review', icon: Upload, color: '#3B82F6', bg: '#EFF6FF' },
          { label: 'Completed', value: stats.completed, sub: 'Successfully done', icon: CheckCircle2, color: '#22C55E', bg: '#F0FDF4' },
          { label: 'Avg Score', value: `${stats.avgScore}%`, sub: 'Overall average', icon: Award, color: '#6D4CFF', bg: '#F3F0FF' },
          { label: 'Class Rank', value: 'Top 10%', sub: 'Among peers', icon: TrendingUp, color: '#8B5CF6', bg: '#F5F3FF' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={i} whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
              className="rounded-2xl bg-white border border-gray-100 p-4 cursor-pointer transition-all">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5" style={{ background: kpi.bg }}>
                <Icon size={17} style={{ color: kpi.color }} />
              </div>
              <div className="text-[11px] font-medium text-gray-500">{kpi.label}</div>
              <div className="text-lg font-extrabold text-gray-900 mt-0.5">
                {typeof kpi.value === 'number' ? <CounterAnimation value={kpi.value} /> : kpi.value}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ===== MAIN CONTENT: Tabs, List + Sidebar ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">

          {/* Tabs */}
          <motion.div variants={fadeUp} className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`relative px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {tab.label}
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key ? 'bg-[#6D4CFF]/10 text-[#6D4CFF]' : 'bg-gray-200 text-gray-500'
                }`}>{tabCounts[tab.key as keyof typeof tabCounts]}</span>
              </button>
            ))}
          </motion.div>

          {/* Assignment List */}
          <motion.div variants={fadeUp} className="space-y-3">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <ClipboardList className="w-16 h-16 text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">No assignments found</h3>
                <p className="text-sm text-gray-500 mb-6">Try a different filter or browse resources.</p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 text-sm font-medium text-[#6D4CFF] bg-[#F3F0FF] rounded-xl hover:bg-[#EBE6FF] transition-colors">Browse Resources</button>
                  <button className="px-4 py-2 text-sm font-medium text-[#6D4CFF] bg-[#F3F0FF] rounded-xl hover:bg-[#EBE6FF] transition-colors">View Calendar</button>
                </div>
              </div>
            ) : viewMode === 'list' ? (
              <AnimatePresence>
                {filtered.map((item: any, i: number) => {
                  const priority = getPriority(item);
                  const pColor = PRIORITY_COLORS[priority] || { bg: '#F1F5F9', text: '#94A3B8', label: 'Normal' };
                  const status = item.status || 'pending';
                  const sColor = STATUS_COLORS[status] || '#94A3B8';
                  const isExpanded = expandedCard === item.id;
                  const subInitial = (item.subject || item.subject_name || 'A').charAt(0);

                  return (
                    <motion.div key={item.id || i} layout
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.03 }}>
                      <Card className={`p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer ${
                        isExpanded ? 'ring-2 ring-[#6D4CFF]/20 shadow-lg' : ''
                      }`}
                        onClick={() => setExpandedCard(isExpanded ? null : item.id)}>
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                            {subInitial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-gray-900 truncate">{item.title || item.name}</h4>
                                  {item.marks !== undefined && item.marks !== null && (
                                    <Badge variant="success" className="text-[9px] px-1.5 py-0">{(item.score || item.marks || 0) + '%'}</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{item.subject || item.subject_name} • {item.teacher_name || item.teacher || 'Teacher'}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: pColor.bg, color: pColor.text }}>
                                  <Circle className="w-1.5 h-1.5 fill-current" />
                                  {pColor.label}
                                </div>
                                <Badge variant={status === 'completed' || status === 'graded' ? 'success' : status === 'submitted' ? 'info' : status === 'in_progress' ? 'warning' : 'danger'}
                                  className="text-[9px] px-1.5 py-0.5">
                                  {statusLabels[status] || 'Pending'}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-[11px] text-gray-400">
                              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {item.due_date ? new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}</span>
                              <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> {daysUntil(item.due_date)}</span>
                              {item.difficulty && <Badge variant="default" className="text-[9px]">{item.difficulty}</Badge>}
                              {item.estimated_time && <span className="flex items-center gap-1 text-[10px]">⏱ {item.estimated_time}</span>}
                              {item.progress !== undefined && (
                                <span className="flex items-center gap-1.5 flex-1 max-w-[120px]">
                                  <Progress value={item.progress} className="h-1.5 flex-1" />
                                  <span className="text-[10px] font-medium" style={{ color: sColor }}>{item.progress}%</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button className="w-8 h-8 rounded-lg bg-[#F3F0FF] flex items-center justify-center hover:bg-[#EBE6FF] transition-colors">
                              {status === 'completed' || status === 'graded' ? <Eye className="w-4 h-4 text-[#6D4CFF]" /> : <Play className="w-4 h-4 text-[#6D4CFF]" />}
                            </button>
                            {status !== 'completed' && status !== 'graded' && (
                              <button className="px-3 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-medium hover:shadow-md transition-all flex items-center gap-1">
                                {status === 'submitted' ? 'View' : 'Submit'} <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expanded Detail */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                {item.description && <p className="text-xs text-gray-600 mb-3">{item.description}</p>}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                                  {[
                                    { label: 'Subject', value: item.subject || item.subject_name },
                                    { label: 'Teacher', value: item.teacher_name || item.teacher },
                                    { label: 'Due Date', value: item.due_date ? new Date(item.due_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—' },
                                    { label: 'Status', value: statusLabels[status] || 'Pending' },
                                  ].map((f, fi) => (
                                    <div key={fi} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                                      <div className="text-[9px] text-gray-400 font-medium">{f.label}</div>
                                      <div className="text-xs font-semibold text-gray-700 mt-0.5">{f.value}</div>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {item.has_attachments && (
                                    <button className="px-3 py-1.5 text-[10px] font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1">
                                      <Paperclip className="w-3 h-3" /> Attachments
                                    </button>
                                  )}
                                  <button className="px-3 py-1.5 text-[10px] font-medium rounded-lg bg-[#F3F0FF] text-[#6D4CFF] hover:bg-[#EBE6FF] transition-colors flex items-center gap-1">
                                    <Download className="w-3 h-3" /> Resources
                                  </button>
                                  {item.feedback && (
                                    <Badge variant="info" className="text-[9px]">Feedback available</Badge>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((item: any, i: number) => {
                  const priority = getPriority(item);
                  const pColor = PRIORITY_COLORS[priority] || { bg: '#F1F5F9', text: '#94A3B8', label: 'Normal' };
                  const status = item.status || 'pending';
                  const subInitial = (item.subject || item.subject_name || 'A').charAt(0);
                  return (
                    <motion.div key={item.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <Card className="p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-xs">{subInitial}</div>
                          <Badge variant={status === 'completed' || status === 'graded' ? 'success' : status === 'submitted' ? 'info' : status === 'in_progress' ? 'warning' : 'danger'} className="text-[8px]">
                            {statusLabels[status] || 'Pending'}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 truncate">{item.title || item.name}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">{item.subject || item.subject_name}</p>
                        <div className="flex items-center justify-between mt-3 text-[10px] text-gray-400">
                          <span>{item.due_date ? new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
                          <span style={{ color: pColor.text }} className="font-semibold">{pColor.label}</span>
                        </div>
                        {item.progress !== undefined && <Progress value={item.progress} className="h-1 mt-2" />}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <div className="space-y-4">

          {/* AI Assistant Card */}
          <motion.div variants={fadeUp}>
            <Card className="p-6 bg-gradient-to-br from-[#6D4CFF] to-[#4F2DB8] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
                  <span className="text-sm font-semibold">Prerana AI Assistant</span>
                </div>
                <p className="text-xs text-white/80 mb-4">Generate notes, summaries, submission plans, research help, and more.</p>
                <div className="space-y-1.5 mb-4">
                  {[
                    'Generate Notes', 'Summarize Assignment', 'Create Submission Plan',
                    'Research Help', 'Explain Topics', 'Suggest References',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                      <CheckCircle2 className="w-3 h-3 text-green-300" />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 mb-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-2">AI Recommendations</div>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-3 h-3 text-green-300 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">Finish Mathematics Assignment First</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <Lightbulb className="w-3 h-3 text-yellow-300 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">Science Project Requires 3 More Days</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-3 h-3 text-green-300 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">English Essay Can Be Completed Today</span>
                    </div>
                  </div>
                </div>
                <button className="w-full py-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-medium hover:bg-white/25 transition-all flex items-center justify-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Ask Prerana AI
                </button>
              </div>
            </Card>
          </motion.div>

          {/* Calendar */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Assignment Calendar" subtitle="Due dates and deadlines">
              <div className="space-y-2">
                {[
                  { date: 'Jun 12', label: 'Math Assignment', type: 'due', color: '#EF4444' },
                  { date: 'Jun 15', label: 'Science Project', type: 'submission', color: '#3B82F6' },
                  { date: 'Jun 18', label: 'English Essay', type: 'due', color: '#F59E0B' },
                  { date: 'Jun 22', label: 'Physics Lab', type: 'exam', color: '#6D4CFF' },
                  { date: 'Jun 25', label: 'History Presentation', type: 'project', color: '#22C55E' },
                ].map((ev, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: ev.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900 truncate">{ev.label}</div>
                      <div className="text-[10px] text-gray-400">{ev.date}</div>
                    </div>
                    <Badge variant={ev.type === 'due' ? 'danger' : ev.type === 'submission' ? 'info' : 'default'} className="text-[8px] px-1.5 py-0.5">{ev.type}</Badge>
                  </div>
                ))}
              </div>
            </SectionCard>
          </motion.div>

          {/* Submission Analytics */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Submission Analytics" subtitle="Distribution overview">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-1 mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="text-center">
                    <div className="w-2 h-2 rounded-full mx-auto mb-0.5" style={{ background: d.color }} />
                    <div className="text-[9px] text-gray-500">{d.name}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </motion.div>

        </div>
      </div>

      {/* ===== UPCOMING DEADLINES ===== */}
      <motion.div variants={fadeUp}>
        <SectionCard title="Upcoming Deadlines" subtitle="Timeline view of pending assignments">
          <div className="space-y-0">
            {deadlineGroups.map((group, gi) => (
              group.items.length > 0 && (
                <div key={gi} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-24 flex-shrink-0">
                    <div className="text-xs font-semibold text-gray-700">{group.period}</div>
                    <div className="text-[10px] text-gray-400">{group.items.length} item{group.items.length !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {group.items.slice(0, group.limit).map((item: any, j: number) => (
                      <div key={j} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: group.color }} />
                        <span className="text-xs text-gray-600 truncate">{item.title || item.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-xs font-bold" style={{ color: group.color }}>
                      {group.period === 'Today' ? 'Due!' : group.period === 'Tomorrow' ? '1d' : `${(group as any).daysUntil || 0}d`}
                    </div>
                  </div>
                </div>
              )
            ))}
            {deadlineGroups.every(g => g.items.length === 0) && (
              <div className="text-center py-6 text-gray-400 text-sm">No upcoming deadlines</div>
            )}
          </div>
        </SectionCard>
      </motion.div>

      {/* ===== SUBJECT ANALYTICS + ACTIVITY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-wise Analytics */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <SectionCard title="Subject-wise Analytics" subtitle="Performance breakdown by subject">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[10px] font-semibold text-gray-400 uppercase pb-3">Subject</th>
                    <th className="text-center text-[10px] font-semibold text-gray-400 uppercase pb-3">Given</th>
                    <th className="text-center text-[10px] font-semibold text-gray-400 uppercase pb-3">Completed</th>
                    <th className="text-center text-[10px] font-semibold text-gray-400 uppercase pb-3">Pending</th>
                    <th className="text-center text-[10px] font-semibold text-gray-400 uppercase pb-3">Avg Score</th>
                    <th className="text-left text-[10px] font-semibold text-gray-400 uppercase pb-3">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.length > 0 ? subjects.map((s, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-[10px]">{s.name.charAt(0)}</div>
                          <span className="text-xs font-semibold text-gray-900">{s.name}</span>
                        </div>
                      </td>
                      <td className="text-center text-xs text-gray-600">{s.given}</td>
                      <td className="text-center text-xs font-semibold text-green-600">{s.completed}</td>
                      <td className="text-center text-xs font-semibold text-red-500">{s.pending}</td>
                      <td className="text-center text-xs font-bold text-gray-900">{s.avgScore}%</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#22C55E] transition-all duration-500" style={{ width: `${s.pct}%` }} />
                          </div>
                          <span className="text-[10px] font-medium text-gray-500">{s.pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No subject data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={fadeUp}>
          <SectionCard title="Recent Activity" subtitle="Your latest actions">
            <div className="space-y-0">
              {activityFeed.map((act, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${act.color}15` }}>
                    <act.icon className="w-4 h-4" style={{ color: act.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-900">{act.action}</div>
                    <div className="text-[11px] text-gray-500">{act.detail}</div>
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </motion.div>
      </div>

      {/* ===== PRODUCTIVITY + ACHIEVEMENTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <SectionCard title="Weekly Productivity" subtitle="Assignment activity overview">
            <div className="h-44 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barSize={24} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="completed" name="Completed" fill="#22C55E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="started" name="Started" fill="#6D4CFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Focus Score', value: '85%', color: '#6D4CFF' },
                { label: 'Consistency', value: '78%', color: '#22C55E' },
                { label: 'Completion', value: `${stats.completionRate}%`, color: '#F59E0B' },
                { label: 'Study Hours', value: `${weeklyData.reduce((s, d) => s + d.hours, 0)}h`, color: '#3B82F6' },
              ].map((m, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                  <div className="text-xs text-gray-500">{m.label}</div>
                  <div className="text-sm font-extrabold mt-0.5" style={{ color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={fadeUp}>
          <SectionCard title="Achievements & Badges" subtitle="Milestones earned">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Assignment Master', icon: Award, earned: true, color: '#6D4CFF' },
                { label: 'Perfect Submission', icon: Star, earned: true, color: '#F59E0B' },
                { label: 'Fast Learner', icon: Zap, earned: true, color: '#22C55E' },
                { label: 'Top Performer', icon: Trophy, earned: false, color: '#3B82F6' },
                { label: 'Research Expert', icon: Brain, earned: false, color: '#EF4444' },
                { label: 'Consistent', icon: Flame, earned: true, color: '#8B5CF6' },
              ].map((ach, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05 }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                    ach.earned ? 'bg-gradient-to-b from-gray-50 to-white border border-gray-100' : 'bg-gray-50 opacity-50'
                  }`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${ach.earned ? 'shadow-sm' : ''}`}
                    style={{ background: ach.earned ? `${ach.color}15` : '#F1F5F9' }}>
                    <ach.icon className="w-4 h-4" style={{ color: ach.earned ? ach.color : '#94A3B8' }} />
                  </div>
                  <span className="text-[8px] font-medium text-center leading-tight" style={{ color: ach.earned ? '#0F172A' : '#94A3B8' }}>{ach.label}</span>
                </motion.div>
              ))}
            </div>
          </SectionCard>
        </motion.div>
      </div>

      {/* ===== SMART RECOMMENDATIONS ===== */}
      <motion.div variants={fadeUp}>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h3 className="text-base font-bold text-gray-900">Smart Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Assignments to Prioritize', desc: `${stats.pending} pending assignments need attention`, icon: Target, color: '#EF4444' },
              { label: 'Subjects Needing Focus', desc: subjects.filter(s => s.pct < 50).map(s => s.name).join(', ') || 'All on track!', icon: Brain, color: '#6D4CFF' },
              { label: 'Suggested Schedule', desc: `Dedicate ${Math.max(2, Math.round(stats.pending * 0.5))}h/day to catch up`, icon: Clock, color: '#F59E0B' },
              { label: 'Productivity Tip', desc: stats.completionRate >= 70 ? 'Great momentum! Keep your current pace.' : 'Try Pomodoro technique for better focus', icon: Zap, color: '#22C55E' },
            ].map((rec, i) => {
              const Icon = rec.icon;
              return (
                <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="w-4 h-4" style={{ color: rec.color }} />
                    <span className="text-xs font-bold text-gray-900">{rec.label}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">{rec.desc}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* ===== QUICK ACTIONS ===== */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: 'Upload Assignment', icon: Upload, color: '#6D4CFF' },
            { label: 'View Notes', icon: BookOpen, color: '#22C55E' },
            { label: 'Open Calendar', icon: Calendar, color: '#F59E0B' },
            { label: 'Download Resources', icon: Download, color: '#3B82F6' },
            { label: 'Past Papers', icon: FileText, color: '#8B5CF6' },
            { label: 'Study Materials', icon: HelpCircle, color: '#EF4444' },
          ].map((action, i) => (
            <motion.button key={i} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${action.color}12` }}>
                <action.icon className="w-5 h-5" style={{ color: action.color }} />
              </div>
              <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
}
