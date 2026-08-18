'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  School, Users, BookOpen, ClipboardList, TrendingUp, Clock, CheckCircle2,
  AlertCircle, Award, Bell, Plus, CalendarDays, Target, Star, Sparkles,
  ChevronRight, Download, MessageSquare, FileText, BarChart3, ArrowUpRight,
  Search, X, User, GraduationCap, Lightbulb, Zap, Play, Video,
  Mail, Phone, MapPin, Settings, Eye, Edit3, Filter, MoreHorizontal,
  QrCode, Camera, Fingerprint, Activity, PieChart as PieChartIcon,
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

interface ExamsDashboardProps {
  examsHook: any;
  exams: any[];
  classes: any[];
  students: any[];
  setActiveTab: (tab: string) => void;
  setShowExamModal: (v: boolean) => void;
  darkMode?: boolean;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};



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

export function ExamsDashboard({ examsHook, exams, classes, students, setActiveTab, setShowExamModal, darkMode }: ExamsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'board' | 'analytics'>('overview');
  const [expandedExam, setExpandedExam] = useState<string | null>(null);

  const effectiveExams = useMemo(() => {
    if (Array.isArray(exams) && exams.length > 0) return exams;
    return [] as any[];
  }, [exams]);

  const gradeDist: any[] = [];
  const performanceTrend: any[] = [];
  const subjectComparison: any[] = [];
  const passFailData: any[] = [];
  const totalExams = effectiveExams.length;
  const upcomingExams = effectiveExams.filter((e: any) => e.status === 'scheduled' && new Date(e.date) > new Date()).length;
  const completedExams = effectiveExams.filter((e: any) => e.status === 'completed').length;
  const draftExams = effectiveExams.filter((e: any) => e.status === 'draft').length;
  const totalStudents = effectiveExams.reduce((s: number, e: any) => s + (e.students || 0), 0);
  const avgScore = effectiveExams.filter((e: any) => e.avgScore > 0).length > 0
    ? Math.round(effectiveExams.filter((e: any) => e.avgScore > 0).reduce((s: number, e: any) => s + (e.avgScore || 0), 0) / effectiveExams.filter((e: any) => e.avgScore > 0).length)
    : 0;
  const avgParticipation = totalExams > 0 ? Math.round(effectiveExams.reduce((s: number, e: any) => s + (e.completion || 0), 0) / totalExams) : 0;

  const filteredExams = useMemo(() => {
    let result = effectiveExams;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e: any) =>
        (e.title || '').toLowerCase().includes(q) ||
        (e.subject || '').toLowerCase().includes(q) ||
        (e.class || '').toLowerCase().includes(q) ||
        (e.topic || '').toLowerCase().includes(q)
      );
    }
    if (filterClass !== 'all') result = result.filter((e: any) => (e.class || '') === filterClass);
    if (filterSubject !== 'all') result = result.filter((e: any) => (e.subject || '') === filterSubject);
    if (filterStatus !== 'all') result = result.filter((e: any) => (e.status || '') === filterStatus);
    return result;
  }, [effectiveExams, searchQuery, filterClass, filterSubject, filterStatus]);

  const classOptions: string[] = useMemo(() => {
    const set = new Set(effectiveExams.map((e: any) => e.class || ''));
    return Array.from(set) as string[];
  }, [effectiveExams]);

  const subjectOptions: string[] = useMemo(() => {
    const set = new Set(effectiveExams.map((e: any) => e.subject || ''));
    return Array.from(set) as string[];
  }, [effectiveExams]);

  const SectionCard = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
    <Card className={`p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' };
      case 'scheduled': return { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' };
      case 'draft': return { bg: 'bg-yellow-50', text: 'text-yellow-600', dot: 'bg-yellow-500' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' };
    }
  };

  const daysUntil = (date: string) => {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    if (diff < 0) return { text: 'Overdue', urgent: true };
    if (diff === 0) return { text: 'Today', urgent: true };
    if (diff === 1) return { text: 'Tomorrow', urgent: false };
    if (diff <= 7) return { text: `In ${diff} Days`, urgent: false };
    return { text: `${Math.ceil(diff / 7)} Weeks`, urgent: false };
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* ===== HERO SECTION ===== */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] p-6 md:p-8"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          e.currentTarget.style.setProperty('--mouse-x', String(x));
          e.currentTarget.style.setProperty('--mouse-y', String(y));
        }}
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
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-200">Examination Management</div>
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Exams Dashboard</h1>
              </div>
            </div>
            <p className="text-sm text-purple-100/90 mt-2 max-w-xl leading-relaxed">
              Create, schedule, monitor, and analyze examinations while tracking student academic performance.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { icon: FileText, value: totalExams, label: 'Active Exams', color: '#A855F7' },
                { icon: Users, value: totalStudents, label: 'Students', color: '#3B82F6' },
                { icon: Percent, value: `${avgParticipation}%`, label: 'Participation', color: '#10B981' },
                { icon: Trophy, value: `${avgScore}%`, label: 'Avg Score', color: '#F59E0B' },
              ].map((stat, i) => (
                <motion.div key={i} whileHover={{ scale: 1.03, y: -2 }} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon size={14} className="text-white/80" />
                    <span className="text-[10px] font-medium text-purple-200/80">{stat.label}</span>
                  </div>
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={() => setShowExamModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#7C3AED] hover:bg-white/95 hover:shadow-[0_8px_24px_rgba(255,255,255,0.25)] font-bold rounded-xl text-xs h-10 shadow-lg border-0 transition-all"
            >
              <Plus size={16} /> Create Exam
            </motion.button>
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-10 border border-white/25 backdrop-blur-sm transition-all"
            >
              <Sparkles size={16} /> Generate with AI
            </motion.button>
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-10 border border-white/25 backdrop-blur-sm transition-all"
            >
              <CalendarDays size={16} /> Schedule
            </motion.button>
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-10 border border-white/25 backdrop-blur-sm transition-all"
            >
              <BarChart3 size={16} /> Reports
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ===== KPI CARDS ===== */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Total Exams', value: totalExams, sub: `+6 This Semester`, color: PCOLORS.primary, bg: '#F3F0FF', trend: [20, 25, 22, 28, 24] },
          { icon: CalendarDays, label: 'Upcoming Exams', value: upcomingExams, sub: `Next Exam ${daysUntil(effectiveExams.find((e: any) => e.status === 'scheduled' && new Date(e.date) > new Date())?.date || '').text}`, color: PCOLORS.info, bg: '#EFF6FF', trend: [8, 10, 6, 9, 8] },
          { icon: Percent, label: 'Exam Participation', value: `${avgParticipation}%`, sub: avgParticipation >= 90 ? 'Excellent Engagement' : avgParticipation >= 75 ? 'Good Engagement' : 'Needs Improvement', color: PCOLORS.success, bg: '#F0FDF4', trend: [88, 91, 93, 95, 96] },
          { icon: Trophy, label: 'Average Performance', value: `${avgScore}%`, sub: avgScore >= 80 ? 'Above School Benchmark' : 'Below School Benchmark', color: PCOLORS.warning, bg: '#FFFBEB', trend: [78, 80, 82, 83, 84] },
        ].map((kpi, i) => (
          <motion.div key={i} variants={fadeUp} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: kpi.bg, color: kpi.color }}><kpi.icon size={22} /></div>
              <div className="flex items-end gap-0.5">
                {kpi.trend.map((t, ti) => (
                  <div key={ti} className="w-1.5 rounded-full bg-gray-200" style={{ height: `${t / 2}px`, background: ti === kpi.trend.length - 1 ? kpi.color : undefined }} />
                ))}
              </div>
            </div>
            <div className="text-xs font-medium text-gray-500 mb-0.5">{kpi.label}</div>
            <div className="text-2xl font-extrabold text-gray-900">{kpi.value}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs font-medium" style={{ color: kpi.color }}>{kpi.sub}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ===== TABS ===== */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
        {[
          { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
          { key: 'board', label: 'Exam Board', icon: ClipboardPen },
          { key: 'analytics', label: 'Analytics', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setSelectedTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${selectedTab === tab.key ? 'bg-[#7C3AED] text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            ><Icon size={15} />{tab.label}</button>
          );
        })}
      </div>

      {/* ===== DASHBOARD TAB ===== */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* LEFT SECTION - 70% */}
          <div className="lg:col-span-5 space-y-6">
            {/* Exam Management Board */}
            <SectionCard title="Exam Management Board" subtitle={`${filteredExams.length} examinations scheduled`}>
              <div className="flex flex-wrap items-center gap-2.5 mb-4 pb-4 border-b border-gray-100">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search exams..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 bg-white" />
                </div>
                <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[#7C3AED]">
                  <option value="all">All Classes</option>
                  {classOptions.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[#7C3AED]">
                  <option value="all">All Subjects</option>
                  {subjectOptions.map((s: string) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[#7C3AED]">
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {filteredExams.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 rounded-2xl bg-[#F3F0FF] flex items-center justify-center mx-auto mb-4">
                    <FileText size={36} className="text-[#7C3AED]" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">No Exams Found</h4>
                  <p className="text-xs text-gray-400 mb-4">Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredExams.map((exam: any) => {
                    const sc = statusColor(exam.status);
                    const due = daysUntil(exam.date);
                    const isExpanded = expandedExam === exam.id;
                    const SubjectIcon = exam.subject === 'Mathematics' ? BookMarked :
                      exam.subject === 'Physics' ? Atom :
                      exam.subject === 'Chemistry' ? Beaker :
                      exam.subject === 'English' ? Languages :
                      exam.subject === 'Computer Science' ? Binary :
                      exam.subject === 'Biology' ? Leaf :
                      exam.subject === 'History' ? ScrollText : BookOpen;
                    return (
                      <motion.div key={exam.id} layout className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-[#F3F0FF] flex items-center justify-center text-[#7C3AED]">
                                <SubjectIcon size={18} />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-gray-900 leading-tight">{exam.title}</h4>
                                <span className="text-[10px] text-gray-400">{exam.class} • {exam.topic}</span>
                              </div>
                            </div>
                            <div className={`px-2.5 py-1 rounded-full text-[9px] font-semibold ${sc.bg} ${sc.text}`}>
                              <span className={`inline-block w-1.5 h-1.5 rounded-full ${sc.dot} mr-1 align-middle`} />
                              {exam.status}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="text-center p-2 rounded-lg bg-gray-50">
                              <div className="text-[9px] text-gray-400">Date</div>
                              <div className="text-xs font-semibold text-gray-900">{formatDate(exam.date).split(',').slice(0, 1).join('')}</div>
                              <div className="text-[9px] text-gray-400">{exam.time || '—'}</div>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-gray-50">
                              <div className="text-[9px] text-gray-400">Duration</div>
                              <div className="text-xs font-semibold text-gray-900">{exam.duration || '—'} Min</div>
                              <div className="text-[9px] text-gray-400">{exam.total_marks || 0} Marks</div>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-gray-50">
                              <div className="text-[9px] text-gray-400">Students</div>
                              <div className="text-xs font-semibold text-gray-900">{exam.students || 0}</div>
                              <div className="text-[9px] text-gray-400">{due.text}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${exam.completion || 0}%`, background: exam.completion >= 80 ? PCOLORS.success : exam.completion >= 40 ? PCOLORS.warning : PCOLORS.danger }} />
                            </div>
                            <span className="text-[10px] font-semibold text-gray-500">{exam.completion || 0}%</span>
                          </div>

                          <div className="flex gap-1.5">
                            <button className="flex-1 py-1.5 rounded-lg bg-[#F3F0FF] text-[#7C3AED] text-[10px] font-semibold hover:bg-[#EDE9FE] transition-all"><Eye size={12} className="inline mr-1 align-middle" />View</button>
                            <button className="flex-1 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-[10px] font-semibold hover:bg-gray-100 transition-all"><Edit3 size={12} className="inline mr-1 align-middle" />Edit</button>
                            <button onClick={() => setExpandedExam(isExpanded ? null : exam.id)}
                              className="px-2 py-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all"
                            ><MoreHorizontal size={14} /></button>
                          </div>

                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 pt-3 border-t border-gray-100">
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-semibold hover:bg-blue-100 transition-all"><Users size={12} /> Manage Students</button>
                                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 text-green-600 text-[10px] font-semibold hover:bg-green-100 transition-all"><BarChart3 size={12} /> Analytics</button>
                              </div>
                              {exam.status === 'completed' && exam.avgScore > 0 && (
                                <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                                  <div>
                                    <div className="text-[10px] text-gray-400">Avg Score</div>
                                    <div className="text-sm font-bold" style={{ color: exam.avgScore >= 80 ? PCOLORS.success : exam.avgScore >= 60 ? PCOLORS.warning : PCOLORS.danger }}>{exam.avgScore}%</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-[10px] text-gray-400">Pass Rate</div>
                                    <div className="text-sm font-bold text-gray-900">{exam.passRate || 0}%</div>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* Exam Performance Analytics */}
            <SectionCard title="Exam Performance Analytics" subtitle="Track student performance across all examinations">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 mb-3">Performance Trend</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={[]}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED" stopOpacity={0.3} /><stop offset="100%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="avgScore" stroke="#7C3AED" strokeWidth={2} fill="url(#trendGrad)" name="Avg Score" />
                      <Area type="monotone" dataKey="passRate" stroke="#10B981" strokeWidth={2} fill="none" strokeDasharray="4 4" name="Pass Rate" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 mb-3">Grade Distribution</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[]} cx="50%" cy="50%" innerRadius={32} outerRadius={55} dataKey="value" paddingAngle={2} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <p className="text-xs text-gray-400">No grade data available</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 mb-3">Subject Performance Comparison</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={[]} barSize={20} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                      <Bar dataKey="avgScore" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Avg Score" />
                      <Bar dataKey="passRate" fill="#10B981" radius={[4, 4, 0, 0]} name="Pass Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 mb-3">Pass vs Fail Analysis</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-28 h-28 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[]} cx="50%" cy="50%" innerRadius={28} outerRadius={50} dataKey="value" paddingAngle={4} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-xs text-gray-400">No pass/fail data available</p>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Upcoming Exams */}
            <SectionCard title="Upcoming Exams" subtitle="Your upcoming examination schedule">
              <p className="text-xs text-gray-400">No upcoming exams</p>
            </SectionCard>

            {/* Recent Exam Results */}
            <SectionCard title="Recent Exam Results" subtitle="Latest student examination outcomes">
              <p className="text-xs text-gray-400">No recent results</p>
            </SectionCard>

            {/* At-Risk Students */}
            <SectionCard title="Students Needing Academic Support" subtitle="Students performing below the expected benchmark">
              <p className="text-xs text-gray-400">No at-risk students identified</p>
            </SectionCard>
          </div>

          {/* RIGHT SIDEBAR - 30% */}
          <div className="lg:col-span-2 space-y-5">
            {/* Today's Exam Schedule */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Today's Exam Schedule</h3>
              <div className="space-y-3">
                <p className="text-xs text-gray-400 text-center py-4">No exams scheduled today</p>
              </div>
            </Card>

            {/* Exam Status Overview */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Exam Status Overview</h3>
              <div className="space-y-3">
                {[
                  { label: 'Completed', value: completedExams, color: '#10B981', bg: '#F0FDF4', dot: 'bg-green-500' },
                  { label: 'Scheduled', value: upcomingExams, color: '#3B82F6', bg: '#EFF6FF', dot: 'bg-blue-500' },
                  { label: 'Pending Review', value: draftExams, color: '#F59E0B', bg: '#FFFBEB', dot: 'bg-yellow-500' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: item.bg }}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
                      <span className="text-xs font-medium text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-sm font-extrabold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <p className="text-xs text-gray-400 text-center py-4">No recent activity</p>
              </div>
            </Card>

            {/* Subject Success Rate */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Subject Success Rate</h3>
              <div className="space-y-3">
                <p className="text-xs text-gray-400 text-center py-4">No subject data available</p>
              </div>
            </Card>

            {/* Prerana AI Exam Assistant */}
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
                    <p className="text-[10px] text-purple-200/80">Exam Assistant</p>
                  </div>
                </div>
                <p className="text-xs text-purple-100/90 mb-4 leading-relaxed">
                  Hello Teacher 👋 I can help create exams, generate question papers, evaluate performance, identify learning gaps, and prepare reports.
                </p>
                <div className="space-y-1.5 mb-4">
                  {[
                    { label: 'Generate Question Paper', icon: FileText },
                    { label: 'Create MCQ Test', icon: ListChecks },
                    { label: 'Analyze Exam Results', icon: BarChart3 },
                    { label: 'Identify Weak Topics', icon: Lightbulb },
                    { label: 'Generate Report Cards', icon: Award },
                  ].map((action, i) => (
                    <button key={i} onClick={() => setShowExamModal(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-left text-white/90 transition-all"
                    >
                      <action.icon size={13} />
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                    <input type="text" placeholder="Ask AI about exams..." className="flex-1 bg-transparent border-0 text-xs text-white placeholder-purple-200/60 focus:outline-none" />
                    <button className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"><Send size={12} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ===== EXAM BOARD TAB ===== */}
      {selectedTab === 'board' && (
        <div className="space-y-6">
          <SectionCard title="Exam Board" subtitle="Full examination management board with search and filters">
            <div className="flex flex-wrap items-center gap-2.5 mb-4 pb-4 border-b border-gray-100">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search exams..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 bg-white" />
              </div>
              <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[#7C3AED]">
                <option value="all">All Classes</option>
                {classOptions.map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[#7C3AED]">
                <option value="all">All Subjects</option>
                {subjectOptions.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[#7C3AED]">
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </select>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] transition-all"><Plus size={14} /> New Exam</button>
            </div>

            {filteredExams.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 rounded-2xl bg-[#F3F0FF] flex items-center justify-center mx-auto mb-4">
                  <FileText size={44} className="text-[#7C3AED]" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">No Exams Found</h4>
                <p className="text-sm text-gray-400 mb-5">No examinations match your current filters.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => { setSearchQuery(''); setFilterClass('all'); setFilterSubject('all'); setFilterStatus('all'); }}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all"
                  >Clear Filters</button>
                  <button onClick={() => setShowExamModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] transition-all"
                  >Create Exam</button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-3 font-semibold text-gray-500">Exam Title</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-500">Subject</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-500">Class</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-500">Date</th>
                      <th className="text-center py-3 px-3 font-semibold text-gray-500">Duration</th>
                      <th className="text-center py-3 px-3 font-semibold text-gray-500">Students</th>
                      <th className="text-center py-3 px-3 font-semibold text-gray-500">Status</th>
                      <th className="text-center py-3 px-3 font-semibold text-gray-500">Completion</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExams.map((exam: any) => {
                      const sc = statusColor(exam.status);
                      return (
                        <tr key={exam.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-3 font-medium text-gray-900 truncate">{exam.title}</td>
                          <td className="py-3 px-3 text-gray-600">{exam.subject}</td>
                          <td className="py-3 px-3">
                            <Badge className="bg-[#F3F0FF] text-[#7C3AED] border-0 text-[9px]">{exam.class}</Badge>
                          </td>
                          <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{formatDate(exam.date)}</td>
                          <td className="py-3 px-3 text-center text-gray-600">{exam.duration || '—'}m</td>
                          <td className="py-3 px-3 text-center font-medium text-gray-900">{exam.students || 0}</td>
                          <td className="py-3 px-3 text-center">
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${sc.bg} ${sc.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                              {exam.status}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 justify-center">
                              <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${exam.completion || 0}%`, background: exam.completion >= 80 ? '#10B981' : exam.completion >= 40 ? '#F59E0B' : '#EF4444' }} />
                              </div>
                              <span className="text-[10px] font-semibold text-gray-500">{exam.completion || 0}%</span>
                            </div>
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

      {/* ===== ANALYTICS TAB ===== */}
      {selectedTab === 'analytics' && (
        <div className="space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: 'Total Exams', value: totalExams, color: PCOLORS.primary },
              { icon: Users, label: 'Total Students', value: totalStudents, color: PCOLORS.info },
              { icon: Percent, label: 'Avg Score', value: `${avgScore}%`, color: PCOLORS.success },
              { icon: Trophy, label: 'Pass Rate', value: `${Math.round(gradeDist.slice(0, 4).reduce((s, g) => s + g.value, 0))}%`, color: PCOLORS.warning },
            ].map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${m.color}15`, color: m.color }}><m.icon size={16} /></div>
                  <span className="text-[10px] font-medium text-gray-500">{m.label}</span>
                </div>
                <div className="text-xl font-extrabold text-gray-900">{m.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Performance Trend">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={performanceTrend}>
                  <defs>
                    <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED" stopOpacity={0.3} /><stop offset="100%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="avgScore" stroke="#7C3AED" strokeWidth={2} fill="url(#analyticsGrad)" name="Avg Score" />
                  <Area type="monotone" dataKey="passRate" stroke="#10B981" strokeWidth={2} fill="none" strokeDasharray="4 4" name="Pass Rate" />
                </AreaChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard title="Grade Distribution">
              <div className="flex items-center justify-center gap-8">
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={gradeDist} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                        {gradeDist.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {gradeDist.map((g) => (
                    <div key={g.name} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-sm" style={{ background: g.color }} />
                      <span className="text-gray-600 w-6 font-medium">{g.name}</span>
                      <span className="font-bold text-gray-900">{g.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Subject Performance">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={subjectComparison} barSize={24} barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                  <Bar dataKey="avgScore" fill="#7C3AED" radius={[6, 6, 0, 0]} name="Avg Score" />
                  <Bar dataKey="passRate" fill="#10B981" radius={[6, 6, 0, 0]} name="Pass Rate" />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard title="Pass vs Fail">
              <div className="flex items-center justify-center gap-8">
                <div className="w-36 h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={passFailData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={5}>
                        {passFailData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {passFailData.map((d) => (
                    <div key={d.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">{d.name}</span>
                        <span className="font-bold text-gray-900">{d.value}%</span>
                      </div>
                      <div className="w-28 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${d.value}%`, background: d.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Top Performers Leaderboard */}
          <SectionCard title="Top Performers" subtitle="Highest scoring students across all examinations">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-500 w-8">#</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-500">Student</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-500">Class</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-500">Exam</th>
                    <th className="text-center py-2.5 px-2 font-semibold text-gray-500">Score</th>
                    <th className="text-center py-2.5 px-2 font-semibold text-gray-500">Grade</th>
                    <th className="text-center py-2.5 px-2 font-semibold text-gray-500">Percentage</th>
                    <th className="text-center py-2.5 px-2 font-semibold text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {([] as any[]).sort((a, b) => b.percentage - a.percentage).slice(0, 8).map((r: any, i: number) => (
                    <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${i < 3 ? 'bg-gradient-to-r from-[#F3F0FF]/30 to-transparent' : ''}`}>
                      <td className="py-2.5 px-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-600' : i === 1 ? 'bg-gray-100 text-gray-500' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                          {i + 1}
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          {i < 3 && <Trophy size={11} className={i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-orange-500'} />}
                          <span className="font-medium text-gray-900">{r.student}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-gray-500">{r.class}</td>
                      <td className="py-2.5 px-2 text-gray-600 truncate">{r.exam}</td>
                      <td className="py-2.5 px-2 text-center font-medium text-gray-900">{r.score}</td>
                      <td className="py-2.5 px-2 text-center font-bold" style={{ color: r.grade.startsWith('A') ? '#10B981' : r.grade.startsWith('B') ? '#3B82F6' : r.grade.startsWith('C') ? '#F59E0B' : '#EF4444' }}>{r.grade}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`font-bold ${r.percentage >= 80 ? 'text-green-600' : r.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{r.percentage}%</span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <Badge className={r.status === 'passed' ? 'bg-green-50 text-green-600 border-green-200 text-[9px]' : 'bg-red-50 text-red-600 border-red-200 text-[9px]'}>{r.status === 'passed' ? 'Passed' : 'Failed'}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}

function Leaf(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>; }

function LayoutDashboard(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>; }
