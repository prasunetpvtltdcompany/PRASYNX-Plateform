'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Search, Sparkles, ChevronLeft, ChevronRight,
  Download, Clock, CheckCircle2, AlertCircle, Award, Star,
  TrendingUp, FileText, Brain, Lightbulb, CalendarDays, X, Mic,
  Target, Timer, ChevronDown, Zap, Trophy, Flame, Medal,
  GraduationCap, ArrowRight, Eye, BarChart3,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };
const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

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

const demoExams: any[] = [];

const demoScores: any[] = [];

const demoCalendar: any[] = [];

const demoQuestions: any[] = [];

const demoRecommendations: any[] = [];

const demoDeadlines: any[] = [];

interface ExamsDashboardProps {
  examsHook: any;
  marksHook: any;
  examsData: any[];
  marksData: any[];
  subjectPerformance: any[];
  monthlyProgress: any[];
  examCountdown: any[];
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

export function ExamsDashboard({
  examsHook, marksHook, examsData, marksData,
  subjectPerformance, monthlyProgress, examCountdown,
}: ExamsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [resourceTab, setResourceTab] = useState('Previous Year Papers');
  const [showInsights, setShowInsights] = useState(true);
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filters = ['All', 'Upcoming', 'Completed', 'Practice Tests', 'Results', 'Question Papers'];
  const resourceTabs = ['Previous Year Papers', 'Sample Papers', 'Mock Tests', 'Practice Questions'];

  const effectiveExams = useMemo(() => {
    if (Array.isArray(examsData) && examsData.length > 0) return examsData;
    return demoExams;
  }, [examsData]);

  const effectiveScores = useMemo(() => {
    if (Array.isArray(marksData) && marksData.length > 0) return marksData;
    return demoScores;
  }, [marksData]);

  const upcomingExams = useMemo(() => {
    const now = new Date();
    return effectiveExams
      .filter((e: any) => {
        if (e.status === 'completed') return false;
        const examDate = e.exam_date ? new Date(e.exam_date) : null;
        return examDate && examDate >= now;
      })
      .sort((a: any, b: any) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());
  }, [effectiveExams]);

  const completedExams = useMemo(() => {
    return effectiveExams
      .filter((e: any) => e.status === 'completed' || e.score != null)
      .sort((a: any, b: any) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime());
  }, [effectiveExams]);

  const avgScore = useMemo(() => {
    if (completedExams.length === 0) return 0;
    const total = completedExams.reduce((sum: number, e: any) => sum + (e.score || 0), 0);
    return Math.round(total / completedExams.length);
  }, [completedExams]);

  const classRank = useMemo(() => {
    const ranks = completedExams.filter((e: any) => e.rank != null).map((e: any) => e.rank);
    return ranks.length > 0 ? Math.round(ranks.reduce((a: number, b: number) => a + b, 0) / ranks.length) : 12;
  }, [completedExams]);

  const prepProgress = useMemo(() => {
    if (upcomingExams.length === 0) return 78;
    const completed = completedExams.length;
    const total = effectiveExams.length;
    return total > 0 ? Math.round((completed / total) * 100) : 78;
  }, [upcomingExams, completedExams, effectiveExams]);

  const sortedCompleted = useMemo(() => {
    return [...completedExams].sort((a: any, b: any) => {
      let cmp = 0;
      if (sortField === 'date') cmp = new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime();
      else if (sortField === 'score') cmp = (b.score || 0) - (a.score || 0);
      else if (sortField === 'subject') cmp = (a.subject || a.exam_name || '').localeCompare(b.subject || b.exam_name || '');
      return sortDir === 'asc' ? -cmp : cmp;
    });
  }, [completedExams, sortField, sortDir]);

  const filteredQuestions = useMemo(() => {
    let list = demoQuestions;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q)
      );
    }
    if (activeFilter !== 'All') {
      if (activeFilter === 'Previous Year Papers') list = list.filter(i => i.type === 'Previous Year');
      else if (activeFilter === 'Sample Papers') list = list.filter(i => i.type === 'Sample Paper');
      else if (activeFilter === 'Mock Tests') list = list.filter(i => i.type === 'Mock Test');
      else if (activeFilter === 'Practice Questions') list = list.filter(i => i.type === 'Practice Questions');
    }
    return list;
  }, [searchQuery, activeFilter]);

  const calendarDays = useMemo(() => {
    const totalDays = daysInMonth(calendarMonth, calendarYear);
    const firstDay = firstDayOfMonth(calendarMonth, calendarYear);
    const days: any[] = [];
    for (let i = 0; i < firstDay; i++) days.push({ date: 0, events: [], isToday: false });
    const today = new Date();
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dateObj = new Date(calendarYear, calendarMonth, d);
      const events = demoCalendar.filter(e => e.date === dateStr);
      days.push({
        date: d,
        events,
        isToday: d === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear(),
        isPast: dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      });
    }
    return days;
  }, [calendarMonth, calendarYear]);

  const studyStreak = 12;
  const weeklyHours = [4, 5, 3, 6, 4, 2, 3];
  const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const SectionCard = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  if (examsHook?.loading || marksHook?.loading) {
    return (
      <div className="space-y-6">
        <div className="page-header"><h1>Exams</h1><p>Loading examination data...</p></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-gray-100 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
              <div className="h-7 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 p-6 animate-pulse">
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (examsHook?.error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load exam data</h2>
        <p className="text-gray-500 mb-6">{examsHook.error}</p>
        <div className="flex gap-3">
          <button onClick={examsHook.refetch} className="px-6 py-2.5 bg-[#6D4CFF] text-white rounded-xl font-medium hover:bg-[#5A3FD6] transition-colors">Refresh Data</button>
          <button className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">Contact Administrator</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Exams & Performance Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Track exams, monitor performance, prepare smarter, and receive AI-powered recommendations.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 bg-white text-gray-700 outline-none focus:border-[#6D4CFF]">
            <option>All Semesters</option>
            <option>Semester 1</option>
            <option>Semester 2</option>
          </select>
          <button className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] rounded-xl shadow-[0_4px_14px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_20px_rgba(109,76,255,0.4)] transition-all flex items-center gap-2">
            <FileText className="w-4 h-4" /> View Report Card
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Upcoming Exams', value: upcomingExams.length, suffix: '', icon: FileText, color: COLORS.primary, bg: '#F3F0FF', sub: 'This semester', trend: 'up' },
          { label: 'Average Score', value: avgScore, suffix: '%', icon: Award, color: COLORS.success, bg: '#F0FDF4', sub: 'Across all subjects', trend: avgScore >= 80 ? 'up' : 'down' },
          { label: 'Class Rank', value: classRank, suffix: '', icon: TrendingUp, color: COLORS.warning, bg: '#FFFBEB', sub: 'Average position', trend: classRank <= 10 ? 'up' : 'down' },
          { label: 'Preparation Progress', value: prepProgress, suffix: '%', icon: Target, color: COLORS.info, bg: '#EFF6FF', sub: `${upcomingExams.length} exams remaining`, trend: 'up' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
              className="rounded-2xl bg-white border border-gray-100 p-5 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                  <Icon size={19} style={{ color: kpi.color }} />
                </div>
                {kpi.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                )}
              </div>
              <div className="text-2xl font-extrabold text-gray-900">
                <CounterAnimation value={kpi.value} suffix={kpi.suffix} />
              </div>
              <div className="text-xs font-medium text-gray-500 mt-1">{kpi.label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* AI Search Bar */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 md:p-5">
          <div className="relative">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#F3F0FF] to-white border border-[#E8DFFF]">
              <Search className="w-5 h-5 text-[#6D4CFF] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search exams, subjects, syllabus, question papers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
              />
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700">
                  <Mic className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-[0_4px_12px_rgba(109,76,255,0.3)] transition-all flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Search
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 text-[10px] font-semibold rounded-full whitespace-nowrap transition-all ${
                  activeFilter === filter
                    ? 'bg-[#6D4CFF] text-white shadow-[0_2px_8px_rgba(109,76,255,0.3)]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Main Layout: 70% Left | 30% Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN (70%) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Upcoming Exams */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Upcoming Exams" subtitle={upcomingExams.length > 0 ? `${upcomingExams.length} exams scheduled` : ''}>
              {upcomingExams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {upcomingExams.map((exam: any, i: number) => {
                    const examDate = exam.exam_date ? new Date(exam.exam_date) : null;
                    const daysLeft = examDate ? Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
                    const color = daysLeft <= 3 ? COLORS.danger : daysLeft <= 7 ? COLORS.warning : COLORS.primary;
                    const subjectIcons: Record<string, any> = {
                      Mathematics: BookOpen, 'Computer Science': Brain, Science: Star, English: FileText,
                    };
                    const Icon = subjectIcons[exam.subject] || BookOpen;
                    return (
                      <motion.div
                        key={exam.id || i}
                        whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
                        className="rounded-2xl bg-white border border-gray-100 p-5 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                              <Icon className="w-5 h-5" style={{ color }} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{exam.exam_name || exam.name}</div>
                              <div className="text-[10px] text-gray-500">{exam.subject || 'General'}</div>
                            </div>
                          </div>
                          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            daysLeft <= 3 ? 'bg-red-50 text-red-600' : daysLeft <= 7 ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                          }`}>
                            {daysLeft}d left
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="text-[10px] text-gray-500">
                            <span className="block text-[9px] text-gray-400">Date</span>
                            {examDate ? examDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            <span className="block text-[9px] text-gray-400">Time</span>
                            {exam.time || '09:00 AM'}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            <span className="block text-[9px] text-gray-400">Duration</span>
                            {exam.duration || '3 hours'}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            <span className="block text-[9px] text-gray-400">Room</span>
                            {exam.room || '—'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Math.max(0, 100 - daysLeft * 10)}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                          </div>
                          <span className="text-[9px] font-semibold" style={{ color }}>{exam.type || 'Exam'}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 rounded-lg bg-[#F3F0FF] text-[#6D4CFF] text-[10px] font-semibold hover:bg-[#EBE6FF] transition-all">View Details</button>
                          <button className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[10px] font-semibold hover:shadow-[0_4px_12px_rgba(109,76,255,0.3)] transition-all">Prepare Now</button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                    <CalendarDays className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">No upcoming exams scheduled</p>
                  <p className="text-xs text-gray-400 mb-4">Check your academic calendar for scheduled exams</p>
                  <button className="px-4 py-2 bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold rounded-xl transition-all">
                    Browse Academic Calendar
                  </button>
                </div>
              )}
            </SectionCard>
          </motion.div>

          {/* Exam Calendar */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Exam Calendar</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Monthly view of exams and deadlines</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); } else setCalendarMonth(m => m - 1); }}
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-xs font-semibold text-gray-700 min-w-[100px] text-center">{months[calendarMonth]} {calendarYear}</span>
                  <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); } else setCalendarMonth(m => m + 1); }}
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="text-[10px] font-semibold text-gray-400 text-center py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day: any, i: number) => (
                  <div key={i} className="relative min-h-[44px] text-center py-1 text-xs rounded-lg transition-all cursor-pointer hover:bg-gray-50"
                    style={day.isToday ? { background: '#F3F0FF', border: '1px solid #6D4CFF' } : day.events.length > 0 ? { background: `${day.events[0].type === 'exam' ? '#FEF2F2' : day.events[0].type === 'assignment' ? '#FFFBEB' : '#F0FDF4'}15` } : {}}
                  >
                    <span className={`${day.isToday ? 'font-bold text-[#6D4CFF]' : day.isPast ? 'text-gray-300' : 'text-gray-600'}`}>
                      {day.date > 0 ? day.date : ''}
                    </span>
                    {day.events.length > 0 && (
                      <div className="flex justify-center gap-0.5 mt-0.5">
                        {day.events.map((ev: any, ei: number) => (
                          <div key={ei} className={`w-1 h-1 rounded-full ${
                            ev.type === 'exam' ? 'bg-red-500' : ev.type === 'assignment' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                {[
                  { color: 'bg-red-500', label: 'Exams' },
                  { color: 'bg-yellow-500', label: 'Assignments' },
                  { color: 'bg-green-500', label: 'Holidays' },
                ].map((leg, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${leg.color}`} />
                    <span className="text-[9px] text-gray-500">{leg.label}</span>
                  </div>
                ))}
                <div className="flex-1" />
                <span className="text-[10px] font-semibold text-gray-500">{upcomingExams.length} exams this month</span>
              </div>
            </Card>
          </motion.div>

          {/* Exam Preparation Progress */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Exam Preparation Progress" subtitle="Subject-wise readiness">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'Mathematics', score: 92, color: '#6D4CFF' },
                  { name: 'Operating Systems', score: 81, color: '#22C55E' },
                  { name: 'DBMS', score: 88, color: '#3B82F6' },
                  { name: 'Computer Networks', score: 78, color: '#F59E0B' },
                  { name: 'Machine Learning', score: 85, color: '#8B5CF6' },
                  { name: 'Data Structures', score: 90, color: '#EC4899' },
                ].map((subj, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: subj.color }} />
                        <span className="text-xs font-medium text-gray-700">{subj.name}</span>
                      </div>
                      <span className="text-[10px] font-bold" style={{ color: subj.color }}>{subj.score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${subj.score}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${subj.color}, ${subj.color}bb)` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </motion.div>

          {/* Previous Results */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Previous Results" subtitle="Your exam performance history">
              {sortedCompleted.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-[10px] font-semibold text-gray-400 uppercase pb-3 cursor-pointer hover:text-gray-600" onClick={() => toggleSort('subject')}>
                          Subject {sortField === 'subject' && (sortDir === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="text-left text-[10px] font-semibold text-gray-400 uppercase pb-3 cursor-pointer hover:text-gray-600" onClick={() => toggleSort('score')}>
                          Marks {sortField === 'score' && (sortDir === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="text-center text-[10px] font-semibold text-gray-400 uppercase pb-3">Grade</th>
                        <th className="text-center text-[10px] font-semibold text-gray-400 uppercase pb-3">Rank</th>
                        <th className="text-center text-[10px] font-semibold text-gray-400 uppercase pb-3">Status</th>
                        <th className="text-right text-[10px] font-semibold text-gray-400 uppercase pb-3 cursor-pointer hover:text-gray-600" onClick={() => toggleSort('date')}>
                          Date {sortField === 'date' && (sortDir === 'asc' ? '↑' : '↓')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedCompleted.slice(0, 10).map((exam: any, i: number) => {
                        const isGood = (exam.score || 0) >= 80;
                        return (
                          <tr key={exam.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${isGood ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-xs font-semibold text-gray-900">{exam.exam_name || exam.name}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className={`text-xs font-bold ${isGood ? 'text-green-600' : 'text-red-500'}`}>
                                {exam.score || 0}/{exam.max_marks || 100}
                              </span>
                            </td>
                            <td className="text-center py-3">
                              <Badge variant={isGood ? 'success' : 'warning'} className="text-[9px]">{exam.grade || (isGood ? 'A' : 'B')}</Badge>
                            </td>
                            <td className="text-center py-3">
                              <span className="text-xs font-semibold text-gray-700">{exam.rank != null ? `#${exam.rank}` : '—'}</span>
                            </td>
                            <td className="text-center py-3">
                              <Badge variant={isGood ? 'success' : 'default'} className="text-[9px]">{isGood ? 'Passed' : 'Needs Improvement'}</Badge>
                            </td>
                            <td className="text-right py-3">
                              <span className="text-[10px] text-gray-500">
                                {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-gray-400" />
                      <input type="text" placeholder="Search results..." className="w-40 text-[10px] bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-[#6D4CFF]" />
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-medium hover:bg-gray-200 transition-all flex items-center gap-1">
                      <Download className="w-3 h-3" /> Export
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="w-10 h-10 text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-500">No results yet</p>
                  <p className="text-xs text-gray-400 mt-1">Your exam results will appear here once graded</p>
                </div>
              )}
            </SectionCard>
          </motion.div>
        </div>

        {/* RIGHT COLUMN (30%) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Today's Exam Insights */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <button onClick={() => setShowInsights(!showInsights)} className="flex items-center justify-between w-full mb-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" /> Today's Insights
                </h3>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showInsights ? 'rotate-180' : ''}`} />
              </button>
              {showInsights && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-[#F3F0FF] to-white border border-[#E8DFFF]">
                    <div className="text-[9px] text-gray-500">Upcoming Exam</div>
                    <div className="text-sm font-bold text-[#6D4CFF] mt-0.5">
                      {upcomingExams.length > 0 ? upcomingExams[0].exam_name : 'No exams scheduled'}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {upcomingExams.length > 0 ? `${upcomingExams[0].exam_date || ''} • ${upcomingExams[0].time || '09:00'}` : 'Enjoy your break!'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="text-[9px] text-gray-500">Most Difficult</div>
                      <div className="text-xs font-bold text-gray-900 mt-1">Computer Networks</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">78% score</div>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="text-[9px] text-gray-500">Prep Time</div>
                      <div className="text-xs font-bold text-gray-900 mt-1">12.5h</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">This week</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-gray-500">Suggested Study Hours</span>
                      <span className="text-[10px] font-bold text-[#6D4CFF]">3h/day</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6]" style={{ width: '65%' }} />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[8px] text-gray-400">
                      <span>Current: 2h/day</span>
                      <span>Target: 3h/day</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Performance Analytics */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Performance Analytics" subtitle="Subject-wise scores">
              <div className="space-y-4">
                {effectiveScores.slice(0, 5).map((subj: any, i: number) => {
                  const score = subj.score || 0;
                  const avg = subj.average || 0;
                  const isAboveAvg = score >= avg;
                  const color = score >= 85 ? COLORS.success : score >= 70 ? COLORS.warning : COLORS.danger;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-medium text-gray-700">{subj.subject_name || subj.subject}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold" style={{ color }}>{score}%</span>
                          <span className={`text-[8px] ${isAboveAvg ? 'text-green-500' : 'text-red-400'}`}>
                            {isAboveAvg ? `+${score - avg}` : score - avg}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                          />
                        </div>
                        <div className="w-8 h-3 rounded-sm bg-gray-50 flex items-center justify-center border border-gray-100">
                          <div className="w-5 h-1 rounded-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)`, width: `${(avg / 100) * 20}px` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">Class Average</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1 rounded-full bg-gray-300" />
                    <span className="text-gray-400 font-medium">
                      {effectiveScores.length > 0 ? Math.round(effectiveScores.reduce((s: number, m: any) => s + (m.average || 0), 0) / effectiveScores.length) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </SectionCard>
          </motion.div>

          {/* Prerana AI Recommendations */}
          <motion.div variants={fadeUp}>
            <Card className="p-5 bg-gradient-to-br from-[#6D4CFF] to-[#4F2DB8] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-semibold">Prerana AI Recommendations</span>
                </div>
                <p className="text-[10px] text-white/70 mb-4">Personalized study suggestions based on your performance</p>
                <div className="space-y-3">
                  {demoRecommendations.map((rec, i) => {
                    const priorityColor = rec.priority === 'High' ? COLORS.danger : rec.priority === 'Medium' ? COLORS.warning : COLORS.success;
                    return (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold text-white truncate">{rec.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="text-[8px] px-1.5 py-0.5" style={{ background: `${priorityColor}30`, color: '#fff', border: `1px solid ${priorityColor}50` }}>
                              {rec.priority}
                            </Badge>
                            <span className="text-[8px] text-white/60">{rec.time}</span>
                          </div>
                        </div>
                        <button className="px-2.5 py-1.5 rounded-lg bg-white/20 text-[9px] font-semibold hover:bg-white/30 transition-all whitespace-nowrap">
                          Start
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Study Streak */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" /> Study Streak
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-gray-900">{studyStreak}</div>
                  <div className="text-[9px] text-gray-500">Day Streak</div>
                </div>
                <div className="flex-1 h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyLabels.map((d, i) => ({ day: d, hours: weeklyHours[i] }))} barSize={12}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 8, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Bar dataKey="hours" radius={[3, 3, 0, 0]}>
                        {weeklyHours.map((_, i) => (
                          <Cell key={i} fill={weeklyHours[i] >= 4 ? '#6D4CFF' : '#CBD5E1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Weekly', value: '18h', color: COLORS.primary },
                  { label: 'Monthly', value: '72h', color: COLORS.success },
                  { label: 'Best Streak', value: '21d', color: COLORS.warning },
                ].map((s, i) => (
                  <div key={i} className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="text-sm font-extrabold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[8px] text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                {[
                  { label: 'Perfect Week', earned: false },
                  { label: '7-Day Streak', earned: true },
                  { label: '30-Day Streak', earned: false },
                  { label: 'Star Learner', earned: true },
                ].map((badge, i) => (
                  <div key={i} className={`flex flex-col items-center gap-1 p-2 rounded-xl flex-1 transition-all ${badge.earned ? 'bg-gradient-to-b from-gray-50 to-white border border-gray-100' : 'opacity-40'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${badge.earned ? 'bg-[#F3F0FF]' : 'bg-gray-100'}`}>
                      <Trophy className={`w-3 h-3 ${badge.earned ? 'text-[#6D4CFF]' : 'text-gray-300'}`} />
                    </div>
                    <span className="text-[7px] font-medium text-center leading-tight text-gray-500">{badge.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Upcoming Deadlines" subtitle="Assignments, projects & exams">
              {demoDeadlines.length > 0 ? (
                <div className="space-y-2">
                  {demoDeadlines.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5).map((item, i) => {
                    const statusColor = item.daysLeft <= 3 ? 'border-red-200 bg-red-50' : item.daysLeft <= 7 ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50';
                    const dotColor = item.daysLeft <= 3 ? 'bg-red-500' : item.daysLeft <= 7 ? 'bg-yellow-500' : 'bg-green-500';
                    const typeIcons: Record<string, any> = { exam: FileText, assignment: BookOpen, project: Target };
                    const Icon = typeIcons[item.type] || Clock;
                    return (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${statusColor}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${dotColor.replace('bg-', 'bg-').replace('500', '100 bg-opacity-20')}`}>
                          <Icon className={`w-3.5 h-3.5 ${dotColor.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold text-gray-900 truncate">{item.title}</div>
                          <div className="text-[9px] text-gray-500">Due: {new Date(item.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        </div>
                        <span className={`text-[10px] font-bold whitespace-nowrap ${
                          item.daysLeft <= 3 ? 'text-red-600' : item.daysLeft <= 7 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {item.daysLeft}d
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400 mb-2" />
                  <p className="text-xs font-medium text-gray-500">No upcoming deadlines</p>
                </div>
              )}
            </SectionCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Quick Actions" subtitle="Exam preparation tools">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Take Mock Test', icon: Brain, color: '#6D4CFF' },
                  { label: 'Download Notes', icon: Download, color: '#22C55E' },
                  { label: 'View Syllabus', icon: FileText, color: '#3B82F6' },
                  { label: 'Previous Papers', icon: BookOpen, color: '#F59E0B' },
                  { label: 'Ask Prerana AI', icon: Sparkles, color: '#8B5CF6' },
                  { label: 'Study Planner', icon: CalendarDays, color: '#EC4899' },
                ].map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${action.color}12` }}>
                        <Icon className="w-4 h-4" style={{ color: action.color }} />
                      </div>
                      <span className="text-[9px] font-medium text-gray-600 text-center leading-tight">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </SectionCard>
          </motion.div>
        </div>
      </div>

      {/* Question Paper Repository */}
      <motion.div variants={fadeUp}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900">Question Paper Repository</h3>
              <p className="text-xs text-gray-500 mt-0.5">Access previous year papers, sample papers, and practice materials</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
            {resourceTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setResourceTab(tab)}
                className={`px-3.5 py-1.5 text-[10px] font-semibold rounded-full whitespace-nowrap transition-all ${
                  resourceTab === tab
                    ? 'bg-[#6D4CFF] text-white shadow-[0_2px_8px_rgba(109,76,255,0.3)]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredQuestions.slice(0, 8).map((item, i) => {
              const difficultyColor = item.difficulty === 'Hard' ? COLORS.danger : item.difficulty === 'Medium' ? COLORS.warning : COLORS.success;
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
                  className="rounded-xl bg-white border border-gray-100 p-4 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="text-[8px]" variant={item.difficulty === 'Hard' ? 'danger' : item.difficulty === 'Medium' ? 'warning' : 'success'}>
                      {item.difficulty}
                    </Badge>
                    <Download className="w-3.5 h-3.5 text-gray-400 hover:text-[#6D4CFF] cursor-pointer" />
                  </div>
                  <div className="text-xs font-semibold text-gray-900 mb-1">{item.title}</div>
                  <div className="text-[9px] text-gray-500 mb-3">{item.subject}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-gray-400">{item.downloads} downloads</span>
                    <button className="px-2.5 py-1 rounded-lg bg-[#F3F0FF] text-[#6D4CFF] text-[8px] font-semibold hover:bg-[#EBE6FF] transition-all">
                      Download
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Exam Strategy Hub */}
      <motion.div variants={fadeUp}>
        <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-5">Exam Strategy Hub</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { title: 'Time Management Tips', desc: 'Optimize your exam time with proven strategies', icon: Clock, color: COLORS.primary },
              { title: 'Revision Planner', desc: 'Create a structured revision schedule', icon: CalendarDays, color: COLORS.success },
              { title: 'Weak Subject Analysis', desc: 'Identify and improve your weak areas', icon: BarChart3, color: COLORS.warning },
              { title: 'AI Study Plan', desc: 'Get a personalized study plan from Prerana AI', icon: Brain, color: COLORS.info },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={i}
                  whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
                  className="p-4 rounded-xl bg-white border border-gray-100 text-left transition-all"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${item.color}12` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                  </div>
                  <div className="text-xs font-bold text-gray-900 mb-1">{item.title}</div>
                  <div className="text-[9px] text-gray-500 leading-relaxed">{item.desc}</div>
                </motion.button>
              );
            })}
          </div>
        </Card>
      </motion.div>

    </motion.div>
  );
}
