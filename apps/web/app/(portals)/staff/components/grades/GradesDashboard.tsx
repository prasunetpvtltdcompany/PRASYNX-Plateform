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
const PIE_COLORS = ['#7C3AED', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

interface GradesDashboardProps {
  students: any[];
  classes: any[];
  gradesHook: any;
  loadStudentGrades: (sid: string) => Promise<any[]>;
  setActiveTab: (tab: string) => void;
  setShowGradeModal: (v: boolean) => void;
  darkMode?: boolean;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const monthlyTrend = Array.from({ length: 6 }, (_, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
  avg: 0,
}));

const gradeDist = [
  { name: 'A+', value: 22, color: '#7C3AED' },
  { name: 'A', value: 18, color: '#8B5CF6' },
  { name: 'B', value: 25, color: '#10B981' },
  { name: 'C', value: 20, color: '#F59E0B' },
  { name: 'D', value: 10, color: '#EF4444' },
  { name: 'F', value: 5, color: '#DC2626' },
];

const classPerf = [
  { name: '10A', avg: 92 },
  { name: '10B', avg: 88 },
  { name: '11A', avg: 78 },
  { name: '11B', avg: 72 },
  { name: '12A', avg: 90 },
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

export function GradesDashboard({ students, classes, gradesHook, loadStudentGrades, setActiveTab, setShowGradeModal, darkMode }: GradesDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'gradebook' | 'analytics'>('overview');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const effectiveStudents = useMemo(() => {
    if (Array.isArray(students) && students.length > 0) return students;
    return [];
  }, [students]);

  const effectiveGrades = useMemo(() => {
    if (Array.isArray(gradesHook.data) && gradesHook.data.length > 0) return gradesHook.data;
    return [];
  }, [gradesHook]);

  const filteredGrades = useMemo(() => {
    let result = effectiveGrades;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((g: any) =>
        (g.student_name || '').toLowerCase().includes(q) ||
        (g.roll || '').toLowerCase().includes(q) ||
        (g.class || '').toLowerCase().includes(q) ||
        (g.subject || '').toLowerCase().includes(q)
      );
    }
    if (filterClass !== 'all') result = result.filter((g: any) => (g.class || '') === filterClass);
    if (filterSubject !== 'all') result = result.filter((g: any) => (g.subject || '') === filterSubject);
    return result;
  }, [effectiveGrades, searchQuery, filterClass, filterSubject]);

  const topStudents = useMemo(() => {
    const withScores = effectiveStudents.map((s: any) => ({
      ...s,
      avgScore: s.avgScore || 0,
      grade: s.grade || 'A',
    }));
    return withScores.sort((a: any, b: any) => b.avgScore - a.avgScore);
  }, [effectiveStudents]);

  const highPerformers = topStudents.filter((s: any) => s.avgScore >= 85).length;
  const needingAttention = topStudents.filter((s: any) => s.avgScore < 60).length;
  const avgGrade = useMemo(() => {
    const total = topStudents.reduce((sum: number, s: any) => sum + (s.avgScore || 0), 0);
    const avg = total / (topStudents.length || 1);
    if (avg >= 90) return 'A';
    if (avg >= 80) return 'B+';
    if (avg >= 70) return 'C+';
    return 'D';
  }, [topStudents]);
  const avgScore = Math.round(topStudents.reduce((sum: number, s: any) => sum + (s.avgScore || 0), 0) / (topStudents.length || 1));

  const classOptions: string[] = useMemo(() => {
    const set = new Set(effectiveGrades.map((g: any) => g.class || ''));
    return Array.from(set) as string[];
  }, [effectiveGrades]);

  const subjectOptions: string[] = useMemo(() => {
    const set = new Set(effectiveGrades.map((g: any) => g.subject || ''));
    return Array.from(set) as string[];
  }, [effectiveGrades]);

  const SectionCard = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
    <Card className={`p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );

  const getGradeColor = (g: string) => {
    if (g?.startsWith('A')) return '#10B981';
    if (g?.startsWith('B')) return '#7C3AED';
    if (g?.startsWith('C')) return '#F59E0B';
    return '#EF4444';
  };

  const scoreToGrade = (score: number) => {
    if (score >= 95) return { grade: 'A+', color: '#10B981' };
    if (score >= 85) return { grade: 'A', color: '#10B981' };
    if (score >= 75) return { grade: 'B+', color: '#7C3AED' };
    if (score >= 65) return { grade: 'B', color: '#7C3AED' };
    if (score >= 55) return { grade: 'C+', color: '#F59E0B' };
    if (score >= 45) return { grade: 'C', color: '#F59E0B' };
    return { grade: 'F', color: '#EF4444' };
  };

  if (gradesHook?.loading) {
    return (
      <div className="space-y-6">
        <div><div className="h-7 w-56 bg-gray-200 rounded-lg animate-pulse" /><div className="h-4 w-72 bg-gray-100 rounded-lg mt-2 animate-pulse" /></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        </div>
      </div>
    );
  }

  if (gradesHook?.error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load grade data</h2>
        <p className="text-gray-500 mb-6">{gradesHook.error}</p>
        <div className="flex gap-3">
          <button onClick={gradesHook.refetch} className="px-6 py-2.5 bg-[#7C3AED] text-white rounded-xl font-medium hover:bg-[#6D28D9] transition-colors">Refresh</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* ===== TOP TAB BAR ===== */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {[
            { key: 'overview', label: 'Dashboard', icon: Activity },
            { key: 'gradebook', label: 'Gradebook', icon: BookOpen },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map(tab => (
            <button key={tab.key} onClick={() => setSelectedTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-all ${
                selectedTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ===== HERO SECTION ===== */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#7C3AED] via-[#6366F1] to-[#4F46E5]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(124,58,237,0.15)_0%,transparent_50%)]" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#A855F7]/15 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#6366F1]/15 rounded-full blur-[80px]" />
        <motion.div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full bg-white/15"
              animate={{ opacity: [0.1, 0.4, 0.1], y: [0, -(10 + (i % 3) * 8), 0], x: [0, (i % 2 === 0 ? 1 : -1) * 10, 0] }}
              transition={{ duration: 4 + (i % 3) * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
              style={{ width: `${2 + (i % 3) * 2}px`, height: `${2 + (i % 3) * 2}px`, top: `${10 + (i * 12) % 80}%`, left: `${5 + (i * 15) % 90}%` }}
            />
          ))}
        </motion.div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-purple-200 mb-1.5">📊 Academic Performance Dashboard</div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-2">Grades & Performance</h1>
            <p className="text-sm text-purple-100/80 max-w-xl mb-5">Monitor grades, analyze student performance, identify learning gaps, and improve academic outcomes.</p>
            <div className="flex flex-wrap items-center gap-4">
              {[
                { label: 'Total Students', value: effectiveStudents.length, icon: Users },
                { label: 'Assessments', value: effectiveGrades.length, icon: FileText },
                { label: 'Average Grade', value: avgGrade, icon: Award },
                { label: 'Performance', value: `${avgScore}%`, icon: TrendingUp },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3.5 py-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center"><stat.icon className="w-4 h-4 text-white" /></div>
                  <div>
                    <div className="text-lg font-extrabold text-white">
                      {typeof stat.value === 'number' && stat.label !== 'Average Grade' && stat.label !== 'Performance' ? <CounterAnimation value={stat.value} /> : stat.value}
                    </div>
                    <div className="text-[9px] text-purple-200">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => setShowGradeModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-medium text-white hover:bg-white/25 transition-all">
                <Plus className="w-4 h-4 text-[#10B981]" /> Add Grade
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-medium text-white hover:bg-white/25 transition-all">
                <FileText className="w-4 h-4 text-[#8B5CF6]" /> Create Assessment
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-medium text-white hover:bg-white/25 transition-all">
                <BarChart3 className="w-4 h-4 text-[#F59E0B]" /> Generate Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-medium text-white hover:bg-white/25 transition-all">
                <Download className="w-4 h-4 text-[#3B82F6]" /> Export Results
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== 4 KPI CARDS ===== */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: effectiveStudents.length, sub: '+12 New Students', icon: Users, color: '#7C3AED' },
          { label: 'Average Grade', value: avgGrade, sub: 'Top Performing Semester', icon: Award, color: '#10B981', isGrade: true },
          { label: 'High Performers', value: highPerformers, sub: 'Above 85%', icon: Trophy, color: '#8B5CF6' },
          { label: 'Needs Attention', value: needingAttention, sub: 'Below 60%', icon: BadgeAlert, color: '#EF4444' },
        ].map((kpi, i) => (
          <motion.div key={i} whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(124,58,237,0.12)' }}
            className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-5 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}10` }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              {kpi.isGrade ? (
                <div className="text-lg font-extrabold" style={{ color: kpi.color }}>{kpi.value}</div>
              ) : (
                <svg width="72" height="24" className="opacity-40">
                  <polyline fill="none" stroke={kpi.color} strokeWidth="1.5"
                    points={Array.from({ length: 7 }, (_, j) => `${j * 12},${24 - (Math.sin(j * 0.8) * 8 + 10)}`).join(' ')} />
                </svg>
              )}
            </div>
            <div className="text-2xl font-extrabold text-gray-900">
              {kpi.isGrade ? (
                <span className="text-3xl" style={{ color: kpi.color }}>{kpi.value}</span>
              ) : (
                <CounterAnimation value={kpi.value as number} />
              )}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">{kpi.label}</div>
            <div className="text-[9px] mt-1.5 font-medium" style={{ color: kpi.color }}>{kpi.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ===== OVERVIEW TAB ===== */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 70% */}
          <div className="lg:col-span-8 space-y-6">

            {/* Gradebook Table */}
            <SectionCard title="Gradebook" subtitle="Recent student grades & assessments">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search by name, roll or subject..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:border-[#7C3AED] focus:ring-3 focus:ring-[rgba(124,58,237,0.1)] transition-all placeholder:text-gray-400" />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-gray-400" /></button>}
                </div>
                <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-600 outline-none focus:border-[#7C3AED]">
                  <option value="all">All Classes</option>
                  {classOptions.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-600 outline-none focus:border-[#7C3AED]">
                  <option value="all">All Subjects</option>
                  {subjectOptions.map((s: string) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => setShowGradeModal(true)}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white text-xs font-medium hover:shadow-lg transition-all flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add Grade
                </button>
              </div>
              <div className="overflow-x-auto -mx-5">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left py-2.5 px-5 text-[9px] text-gray-500 font-semibold uppercase">Student</th>
                      <th className="text-left py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Roll</th>
                      <th className="text-left py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Class</th>
                      <th className="text-left py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Subject</th>
                      <th className="text-left py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Assessment</th>
                      <th className="text-center py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Score</th>
                      <th className="text-center py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Grade</th>
                      <th className="text-center py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">%</th>
                      <th className="text-center py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Status</th>
                      <th className="text-right py-2.5 px-5 text-[9px] text-gray-500 font-semibold uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrades.slice(0, 8).map((g: any, i: number) => {
                      const gradeInfo = g.grade ? { grade: g.grade, color: getGradeColor(g.grade) } : scoreToGrade(g.score || g.pct || 0);
                      const pct = g.pct || g.score || 0;
                      return (
                        <motion.tr key={g.id || i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white text-[8px] font-bold">
                                {(g.student_name || 'S').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </div>
                              <span className="font-medium text-gray-900 text-xs">{g.student_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-gray-500">{g.roll || '—'}</td>
                          <td className="py-3 px-3 text-gray-500">{g.class || '—'}</td>
                          <td className="py-3 px-3 text-gray-700">{g.subject}</td>
                          <td className="py-3 px-3 text-gray-500">{g.assessment}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-semibold text-gray-900">{g.score || '—'}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-bold" style={{ color: gradeInfo.color }}>{gradeInfo.grade}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center gap-1.5 justify-center">
                              <div className="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 85 ? 'linear-gradient(90deg, #10B981, #059669)' : pct >= 65 ? 'linear-gradient(90deg, #7C3AED, #6366F1)' : 'linear-gradient(90deg, #EF4444, #DC2626)' }} />
                              </div>
                              <span className="text-[9px] font-medium text-gray-500">{pct}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Badge variant={pct >= 85 ? 'default' : pct >= 65 ? 'secondary' : 'destructive'} className="text-[7px] px-1.5 py-0">
                              {pct >= 85 ? 'Excellent' : pct >= 65 ? 'Good' : 'Needs Work'}
                            </Badge>
                          </td>
                          <td className="py-3 px-5 text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><Eye className="w-3.5 h-3.5" /></button>
                              <button className="p-1.5 rounded-lg hover:bg-[#F3F0FF] text-gray-400 hover:text-[#7C3AED] transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                    {filteredGrades.length === 0 && (
                      <tr><td colSpan={10} className="text-center py-12 text-gray-400 text-sm">No grades found matching your filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span className="text-[10px] text-gray-500">{filteredGrades.length} of {effectiveGrades.length} records</span>
                <button className="px-3 py-1.5 rounded-lg bg-[#F3F0FF] text-[#7C3AED] text-[9px] font-medium hover:bg-[#EBE6FF] transition-all flex items-center gap-1">
                  <Download className="w-3 h-3" /> Export to Excel
                </button>
              </div>
            </SectionCard>

            {/* Top Performers + Needs Attention */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SectionCard title="Top Performers 🏆" subtitle="Highest scoring students">
                <div className="space-y-2">
                  {topStudents.filter((_: any, i: number) => i < 5).map((s: any, i: number) => (
                    <div key={s.id || i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-gradient-to-br from-[#7C3AED] to-[#6366F1]'}`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (s.full_name || 'S').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-900 truncate">{s.full_name}</div>
                        <div className="text-[9px] text-gray-500">{s.class} • Avg: {s.avgScore}%</div>
                      </div>
                      <span className="text-sm font-extrabold" style={{ color: getGradeColor(s.grade || scoreToGrade(s.avgScore || 90).grade) }}>
                        {s.grade || scoreToGrade(s.avgScore || 90).grade}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
              <SectionCard title="Needs Attention ⚠️" subtitle="Students requiring support">
                <div className="space-y-2">
                  {topStudents.filter((s: any) => s.avgScore < 75).slice(0, 5).map((s: any, i: number) => (
                    <div key={s.id || i} className="flex items-center gap-3 p-2.5 rounded-xl bg-red-50/50 border border-red-100 hover:shadow-sm transition-all cursor-pointer">
                      <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
                        <BadgeAlert className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-900 truncate">{s.full_name}</div>
                        <div className="text-[9px] text-gray-500">{s.class} • Score: {s.avgScore}%</div>
                        {s.subjectsAtRisk && (
                          <div className="flex items-center gap-1 mt-0.5">
                            {s.subjectsAtRisk.slice(0, 2).map((sub: string, si: number) => (
                              <Badge key={si} variant="destructive" className="text-[6px] px-1 py-0">{sub}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button className="px-2 py-1 rounded-lg bg-red-100 text-red-600 text-[8px] font-medium hover:bg-red-200 transition-colors">Notify</button>
                        <ChevronRight className="w-3 h-3 text-gray-300" />
                      </div>
                    </div>
                  ))}
                  {topStudents.filter((s: any) => s.avgScore < 75).length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-xs">All students are performing well 🎉</div>
                  )}
                </div>
              </SectionCard>
            </div>

            {/* Performance Analytics */}
            <SectionCard title="Academic Performance Analytics" subtitle="Grade trends & distribution">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2 mb-2"><LineChart className="w-4 h-4 text-[#7C3AED]" /><span className="text-xs font-semibold text-gray-700">Grade Trend (Monthly Average)</span></div>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyTrend}>
                        <defs><linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED" stopOpacity={0.3} /><stop offset="100%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                        <YAxis domain={[60, 100]} tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0' }} />
                        <Area type="monotone" dataKey="avg" stroke="#7C3AED" strokeWidth={2} fill="url(#trendGrad)" dot={{ r: 3, fill: '#7C3AED' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2"><PieChartIcon className="w-4 h-4 text-[#7C3AED]" /><span className="text-xs font-semibold text-gray-700">Grade Distribution</span></div>
                  <div className="h-36 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={gradeDist} cx="50%" cy="50%" innerRadius={32} outerRadius={50} paddingAngle={2} dataKey="value">
                          {gradeDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-[7px] mt-1">
                    {gradeDist.slice(0, 4).map((g, i) => (
                      <span key={i} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: g.color }} />{g.name}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-[#7C3AED]" /><span className="text-xs font-semibold text-gray-700">Class Performance Comparison</span></div>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classPerf} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[60, 100]} tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0' }} />
                      <Bar dataKey="avg" name="Avg Score" radius={[6, 6, 0, 0]}>
                        {classPerf.map((e, i) => <Cell key={i} fill={[PCOLORS.primary, PCOLORS.success, PCOLORS.warning, PCOLORS.danger, PCOLORS.info][i]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* RIGHT 30% */}
          <div className="lg:col-span-4 space-y-4">

            {/* Today's Assessments */}
            <SectionCard title="Today's Assessments" subtitle="Scheduled for today">
              <div className="space-y-0 relative">
                {([] as any[]).map((assess, i) => (
                  <div key={i} className="relative pl-7 pb-4 last:pb-0">
                    <div className="absolute left-[7px] top-1.5 bottom-0 w-0.5 bg-gray-100 last:hidden" />
                    <div className="absolute left-0 top-1.5 w-[14px] h-[14px] rounded-full border-2 flex items-center justify-center" style={{ borderColor: [PCOLORS.primary, PCOLORS.success, PCOLORS.warning][i], background: 'white' }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: [PCOLORS.primary, PCOLORS.success, PCOLORS.warning][i] }} />
                    </div>
                    <div className="p-2.5 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-900">{assess.title}</span>
                        <span className="text-[9px] font-medium text-[#7C3AED]">{assess.time}</span>
                      </div>
                      <div className="text-[9px] text-gray-500 mt-0.5">
                        {assess.class} • {assess.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 py-2 rounded-xl bg-[#F3F0FF] text-[#7C3AED] text-xs font-medium hover:bg-[#EBE6FF] transition-all flex items-center justify-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> View Full Schedule
              </button>
            </SectionCard>

            {/* Recent Grading Activity */}
            <SectionCard title="Recent Activity" subtitle="Latest grading actions">
              <div className="space-y-0 relative">
                {([] as any[]).map((act, i) => (
                  <div key={i} className="relative pl-7 pb-4 last:pb-0">
                    <div className="absolute left-[7px] top-1.5 bottom-0 w-0.5 bg-gray-100 last:hidden" />
                    <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 flex items-center justify-center" style={{ borderColor: act.color }}>
                      <act.icon className="w-[7px] h-[7px]" style={{ color: act.color }} />
                    </div>
                    <div>
                      <div className="text-[10px] font-medium text-gray-700">{act.text}</div>
                      <div className="text-[8px] text-gray-400 mt-0.5">{act.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Subject Performance */}
            <SectionCard title="Subject Performance" subtitle="Average scores by subject">
              <div className="space-y-3">
                {([] as any[]).map((sub, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-gray-700">{sub.name}</span>
                      <span className="text-[10px] font-bold" style={{ color: sub.color }}>{sub.score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${sub.score}%` }}
                        transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${sub.color}, ${sub.color}cc)` }} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* AI Grading Assistant */}
            <motion.div whileHover={{ y: -2 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] p-5 shadow-lg">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-[40px]" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#A855F7]/20 rounded-full blur-[30px]" />
              <motion.div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }}>
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </motion.div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Prerana AI Academic Assistant</div>
                    <div className="text-[8px] text-purple-200">Hello Teacher 👋 I can help analyze performance</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {[
                    { label: 'Analyze Performance', icon: BarChart3 },
                    { label: 'Generate Report', icon: FileText },
                    { label: 'Predict Risk', icon: TrendingUp },
                    { label: 'Progress Reports', icon: ListChecks },
                  ].map((sugg, si) => (
                    <button key={si} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white/10 border border-white/10 text-[10px] text-white hover:bg-white/20 transition-all">
                      <sugg.icon className="w-3 h-3 text-purple-200" /> {sugg.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input type="text" placeholder="Ask about student performance..."
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-purple-200/50 outline-none focus:border-white/40 transition-all" />
                    <Send className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-200 cursor-pointer hover:text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ===== GRADEBOOK TAB ===== */}
      {selectedTab === 'gradebook' && (
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by student name, roll number, class, or subject..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#7C3AED] focus:ring-3 focus:ring-[rgba(124,58,237,0.1)] transition-all placeholder:text-gray-400" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-400" /></button>}
            </div>
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-600 outline-none focus:border-[#7C3AED]">
              <option value="all">All Classes</option>
              {classOptions.map((c: string) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-600 outline-none focus:border-[#7C3AED]">
              <option value="all">All Subjects</option>
              {subjectOptions.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => setShowGradeModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white rounded-xl text-xs font-medium hover:shadow-lg transition-all flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Grade
            </button>
          </div>
          <SectionCard title="Complete Gradebook" subtitle="All student grades & assessments">
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-5 text-[9px] text-gray-500 font-semibold uppercase">Student</th>
                    <th className="text-left py-3 px-3 text-[9px] text-gray-500 font-semibold uppercase">Roll</th>
                    <th className="text-left py-3 px-3 text-[9px] text-gray-500 font-semibold uppercase">Class</th>
                    <th className="text-left py-3 px-3 text-[9px] text-gray-500 font-semibold uppercase">Subject</th>
                    <th className="text-left py-3 px-3 text-[9px] text-gray-500 font-semibold uppercase">Assessment</th>
                    <th className="text-center py-3 px-3 text-[9px] text-gray-500 font-semibold uppercase">Score</th>
                    <th className="text-center py-3 px-3 text-[9px] text-gray-500 font-semibold uppercase">Grade</th>
                    <th className="text-center py-3 px-3 text-[9px] text-gray-500 font-semibold uppercase">%</th>
                    <th className="text-center py-3 px-3 text-[9px] text-gray-500 font-semibold uppercase">Status</th>
                    <th className="text-center py-3 px-3 text-[9px] text-gray-500 font-semibold uppercase">Date</th>
                    <th className="text-right py-3 px-5 text-[9px] text-gray-500 font-semibold uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(filteredGrades.length > 0 ? filteredGrades : effectiveGrades).map((g: any, i: number) => {
                    const gradeInfo = g.grade ? { grade: g.grade, color: getGradeColor(g.grade) } : scoreToGrade(g.score || g.pct || 0);
                    const pct = g.pct || g.score || 0;
                    return (
                      <tr key={g.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white text-[8px] font-bold">
                              {(g.student_name || 'S').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="font-medium text-gray-900 text-xs">{g.student_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-500">{g.roll || '—'}</td>
                        <td className="py-3 px-3 text-gray-500">{g.class || '—'}</td>
                        <td className="py-3 px-3 text-gray-700">{g.subject}</td>
                        <td className="py-3 px-3 text-gray-500">{g.assessment}</td>
                        <td className="py-3 px-3 text-center font-semibold text-gray-900">{g.score || '—'}</td>
                        <td className="py-3 px-3 text-center"><span className="font-bold" style={{ color: gradeInfo.color }}>{gradeInfo.grade}</span></td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center gap-1.5 justify-center">
                            <div className="w-10 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 85 ? 'linear-gradient(90deg, #10B981, #059669)' : pct >= 65 ? 'linear-gradient(90deg, #7C3AED, #6366F1)' : 'linear-gradient(90deg, #EF4444, #DC2626)' }} />
                            </div>
                            <span className="text-[9px] text-gray-500">{pct}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant={pct >= 85 ? 'default' : pct >= 65 ? 'secondary' : 'destructive'} className="text-[7px] px-1.5 py-0">
                            {pct >= 85 ? 'Excellent' : pct >= 65 ? 'Good' : 'Needs Work'}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-center text-gray-400 text-[10px]">{g.date || '—'}</td>
                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><Eye className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded-lg hover:bg-[#F3F0FF] text-gray-400 hover:text-[#7C3AED] transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><BarChart3 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <span className="text-[10px] text-gray-500">Showing {effectiveGrades.length} records</span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[9px] font-medium hover:bg-gray-200 transition-all">Previous</button>
                <span className="text-[10px] text-gray-500 px-2">Page 1 of 1</span>
                <button className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[9px] font-medium hover:bg-gray-200 transition-all">Next</button>
              </div>
            </div>
          </SectionCard>
        </motion.div>
      )}

      {/* ===== ANALYTICS TAB ===== */}
      {selectedTab === 'analytics' && (
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { label: 'Overall Performance', value: `${avgScore}%`, change: '+3.2% this term', icon: TrendingUp, color: '#7C3AED' },
              { label: 'Total Assessments', value: effectiveGrades.length, change: '+24 this month', icon: FileText, color: '#10B981' },
              { label: 'At-Risk Students', value: needingAttention, change: '-2 from last month', icon: BadgeAlert, color: '#F59E0B' },
              { label: 'A Grade Students', value: gradeDist[0].value + gradeDist[1].value, change: `${Math.round(((gradeDist[0].value + gradeDist[1].value) / gradeDist.reduce((s, g) => s + g.value, 0)) * 100)}% of total`, icon: Trophy, color: '#8B5CF6' },
            ].map((m, i) => (
              <motion.div key={i} whileHover={{ y: -2 }} className="rounded-2xl bg-white border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${m.color}10` }}><m.icon className="w-4.5 h-4.5" style={{ color: m.color }} /></div>
                  <div className="text-lg font-extrabold text-gray-900">{typeof m.value === 'number' ? m.value : m.value}</div>
                </div>
                <div className="text-[10px] text-gray-500">{m.label}</div>
                <div className="text-[9px] font-medium mt-0.5" style={{ color: m.color }}>{m.change}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Monthly Performance Trend" subtitle="Average scores over time">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend}>
                    <defs><linearGradient id="anaPerf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED" stopOpacity={0.3} /><stop offset="100%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                    <Area type="monotone" dataKey="avg" stroke="#7C3AED" strokeWidth={2.5} fill="url(#anaPerf)" dot={{ r: 4, fill: '#7C3AED' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
            <SectionCard title="Grade Distribution" subtitle="All grades breakdown">
              <div className="h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={gradeDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {gradeDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {gradeDist.map((g, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[9px]">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: g.color }} />
                    <span className="text-gray-500">{g.name} ({((g.value / gradeDist.reduce((s, x) => s + x.value, 0)) * 100).toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Top Performing Students" subtitle="Student leaderboard">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Rank</th>
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Student</th>
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Class</th>
                    <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Avg Score</th>
                    <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Grade</th>
                    <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Status</th>
                    <th className="text-right py-2.5 px-3 text-gray-500 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {topStudents.map((s: any, i: number) => {
                    const gradeInfo = s.grade ? { grade: s.grade, color: getGradeColor(s.grade) } : scoreToGrade(s.avgScore || 90);
                    return (
                      <tr key={s.id || i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 px-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-amber-100 text-amber-700' : 'text-gray-500'}`}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white text-[7px] font-bold">
                              {(s.full_name || 'S').charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900">{s.full_name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-gray-500">{s.class || '—'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${s.avgScore || 90}%`, background: 'linear-gradient(90deg, #7C3AED, #6366F1)' }} />
                            </div>
                            <span className="text-[9px] font-medium text-gray-600">{s.avgScore || 90}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-bold" style={{ color: gradeInfo.color }}>{gradeInfo.grade}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge variant={(s.avgScore || 90) >= 85 ? 'default' : (s.avgScore || 90) >= 65 ? 'secondary' : 'destructive'} className="text-[8px]">
                            {(s.avgScore || 90) >= 85 ? 'Excellent' : (s.avgScore || 90) >= 65 ? 'Good' : 'At Risk'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button className="px-2.5 py-1 rounded-lg bg-[#F3F0FF] text-[#7C3AED] text-[9px] font-medium hover:bg-[#EBE6FF] transition-colors">View</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </motion.div>
      )}

    </motion.div>
  );
}
