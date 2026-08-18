'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Clock, TrendingUp, CheckCircle2, AlertCircle, Award,
  Download, FileText, Sparkles, ChevronLeft, ChevronRight,
  Target, Zap, Star, Medal, Trophy, Flame, Brain, Lightbulb, BookOpen,
  ArrowUpRight, ChevronDown, Search, X, Video, MapPin, User, Bell,
  Home, Edit3, MessageSquare, GraduationCap, Layers, List, Calendar,
  ArrowRight, Timer, Play, Eye, Sun, Moon, Coffee, Sunrise,
  Sunset, BookMarked, ClipboardList, Library, HelpCircle,
  Plus, Trash2, RefreshCw, BarChart3, Activity,
  Grip, MousePointerClick, CalendarCheck, AlarmClock,
  Notebook, ScrollText, School, Presentation,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };
const SUBJECT_PALETTE: Record<string, string> = {
  mathematics: '#6D4CFF', science: '#22C55E', english: '#3B82F6',
  physics: '#EC4899', chemistry: '#F59E0B', 'computer science': '#14B8A6',
  'social studies': '#8B5CF6', history: '#EF4444', biology: '#059669',
  economics: '#D97706', geography: '#0891B2', art: '#DB2777',
};

interface ScheduleDashboardProps {
  timetableHook: any;
  todaySchedule: any[];
  allSchedule: any[];
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'classes', label: 'Classes' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'events', label: 'Events' },
  { id: 'exams', label: 'Exams' },
  { id: 'meetings', label: 'Meetings' },
  { id: 'personal', label: 'Personal Tasks' },
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

const demoSlots: any[] = [];

const demoAssignments: any[] = [];

const demoExams: any[] = [];

const demoEvents: any[] = [];

const demoSuggestions: any[] = [];

const demoTasks: any[] = [];

const demoGoals: any[] = [];

const demoReminders: any[] = [];

const demoAgenda: any[] = [];

const learningAnalyticsData = [
  { name: 'Mon', attendance: 85, engagement: 75, hours: 4.5, completion: 60 },
  { name: 'Tue', attendance: 90, engagement: 82, hours: 5, completion: 75 },
  { name: 'Wed', attendance: 95, engagement: 88, hours: 6, completion: 85 },
  { name: 'Thu', attendance: 88, engagement: 79, hours: 4, completion: 70 },
  { name: 'Fri', attendance: 92, engagement: 85, hours: 5.5, completion: 80 },
  { name: 'Sat', attendance: 80, engagement: 70, hours: 3, completion: 55 },
  { name: 'Sun', attendance: 0, engagement: 65, hours: 2.5, completion: 45 },
];

const studyHoursWeekly = Array.from({ length: 12 }, (_, i) => ({
  week: `W${i + 1}`,
  hours: 0,
  target: 20,
}));

const quickActionsList = [
  { label: 'Create Task', icon: Plus, color: '#6D4CFF' },
  { label: 'Add Reminder', icon: Bell, color: '#22C55E' },
  { label: 'Join Class', icon: Video, color: '#3B82F6' },
  { label: 'View Calendar', icon: CalendarDays, color: '#F59E0B' },
  { label: 'Download Timetable', icon: Download, color: '#8B5CF6' },
  { label: 'Ask Prerana AI', icon: Sparkles, color: '#EC4899' },
];

export function ScheduleDashboard({ timetableHook, todaySchedule, allSchedule }: ScheduleDashboardProps) {
  const [activeView, setActiveView] = useState<'timeline' | 'weekly' | 'calendar'>('timeline');
  const [expandedClass, setExpandedClass] = useState<number | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [voiceMode, setVoiceMode] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'planner' | 'calendar' | 'productivity'>('overview');

  const effectiveSchedule = useMemo(() => {
    if (Array.isArray(allSchedule) && allSchedule.length > 0) return allSchedule;
    return demoSlots;
  }, [allSchedule]);

  const scheduleToday = useMemo(() => {
    return effectiveSchedule
      .filter((s: any) => Number(s.day_of_week) === new Date().getDay())
      .sort((a: any, b: any) => (a.start_time || '00:00').localeCompare(b.start_time || '00:00'));
  }, [effectiveSchedule]);

  const weekDays = useMemo(() => {
    return dayNames.map((_, dayIdx) => ({
      day: dayIdx,
      name: shortDays[dayIdx],
      fullName: dayNames[dayIdx],
      date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + (dayIdx - new Date().getDay())),
      slots: effectiveSchedule
        .filter((s: any) => Number(s.day_of_week) === dayIdx)
        .sort((a: any, b: any) => (a.start_time || '00:00').localeCompare(b.start_time || '00:00')),
    }));
  }, [effectiveSchedule]);

  const completedCount = scheduleToday.filter((s: any) => s.status === 'completed').length;
  const liveCount = scheduleToday.filter((s: any) => s.status === 'live').length;
  const upcomingClassCount = scheduleToday.filter((s: any) => s.status !== 'completed' && s.status !== 'live').length;

  const totalHours = scheduleToday.reduce((sum: number, s: any) => {
    const start = s.start_time || '00:00';
    const end = s.end_time || '00:00';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return sum + ((eh * 60 + em) - (sh * 60 + sm)) / 60;
  }, 0);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const liveSlot = scheduleToday.find((s: any) => {
    if (s.status === 'live') return true;
    const [sh, sm] = (s.start_time || '00:00').split(':').map(Number);
    const [eh, em] = (s.end_time || '00:00').split(':').map(Number);
    return currentMinutes >= sh * 60 + sm && currentMinutes < eh * 60 + em;
  });

  const nextClass = scheduleToday.find((s: any) => {
    const [sh, sm] = (s.start_time || '00:00').split(':').map(Number);
    return currentMinutes < sh * 60 + sm && s.status !== 'completed';
  }) || liveSlot;

  const nextClassMinutes = nextClass && !liveSlot ? (() => {
    const [sh, sm] = (nextClass.start_time || '00:00').split(':').map(Number);
    return sh * 60 + sm - currentMinutes;
  })() : 0;

  const subjectHours = useMemo(() => {
    const map = new Map<string, number>();
    effectiveSchedule.forEach((s: any) => {
      const sub = (s.subject_name || 'General').toLowerCase();
      const [sh, sm] = (s.start_time || '00:00').split(':').map(Number);
      const [eh, em] = (s.end_time || '00:00').split(':').map(Number);
      map.set(sub, (map.get(sub) || 0) + ((eh * 60 + em) - (sh * 60 + sm)) / 60);
    });
    return Array.from(map.entries()).map(([name, hours]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      hours: Math.round(hours * 10) / 10,
      color: SUBJECT_PALETTE[name] || '#6D4CFF',
    }));
  }, [effectiveSchedule]);

  const upcomingEvents = [
    { date: 'Jun 20', title: 'Mid-Term Exams Begin', type: 'exam', color: '#EF4444' },
    { date: 'Jun 22', title: 'Science Exhibition', type: 'event', color: '#22C55E' },
    { date: 'Jun 25', title: 'Math Olympiad Finals', type: 'competition', color: '#F59E0B' },
    { date: 'Jun 28', title: 'Physics Project Submission', type: 'deadline', color: '#3B82F6' },
    { date: 'Jul 02', title: 'Guest Lecture: AI in Healthcare', type: 'seminar', color: '#6D4CFF' },
    { date: 'Jul 05', title: 'Inter-School Hackathon', type: 'competition', color: '#14B8A6' },
  ];

  const monthDays = useMemo(() => {
    const total = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const days: { date: number; events: typeof upcomingEvents; isToday: boolean }[] = [];
    for (let i = 0; i < firstDay; i++) days.push({ date: 0, events: [], isToday: false });
    for (let d = 1; d <= total; d++) {
      days.push({
        date: d,
        events: upcomingEvents.filter(e => parseInt(e.date.split(' ')[1]) === d),
        isToday: d === now.getDate() && calendarMonth === now.getMonth() && calendarYear === now.getFullYear(),
      });
    }
    return days;
  }, [calendarMonth, calendarYear]);

  const getSubjectColor = (name: string) => SUBJECT_PALETTE[name.toLowerCase()] || '#6D4CFF';
  const getTypeBadge = (type: string) => {
    const t = (type || 'Lecture').toLowerCase();
    if (t === 'lab') return { variant: 'warning' as const, label: 'Lab' };
    if (t === 'practical') return { variant: 'info' as const, label: 'Practical' };
    if (t === 'workshop') return { variant: 'success' as const, label: 'Workshop' };
    return { variant: 'default' as const, label: 'Lecture' };
  };

  const SectionCard = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
    <Card className={`p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );

  const ProgressRing = ({ value, size = 48, strokeWidth = 4, color = '#6D4CFF' }: { value: number; size?: number; strokeWidth?: number; color?: string }) => {
    const r = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (value / 100) * circumference;
    const [animVal, setAnimVal] = useState(circumference);
    useEffect(() => { const t = setTimeout(() => setAnimVal(offset), 200); return () => clearTimeout(t); }, [offset]);
    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={animVal} style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
      </svg>
    );
  };

  const formatCountdown = (days: number) => {
    if (days <= 0) return 'Today!';
    if (days === 1) return '1 day left';
    return `${days} days left`;
  };

  const deadlineColor = (days: number) => {
    if (days <= 1) return COLORS.danger;
    if (days <= 3) return COLORS.warning;
    return COLORS.success;
  };

  if (timetableHook?.loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="h-7 w-56 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-72 bg-gray-100 rounded-lg mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
        <div className="rounded-3xl bg-white border border-gray-100 p-8 animate-pulse">
          <div className="h-36 bg-gray-100 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  if (timetableHook?.error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load schedule</h2>
        <p className="text-gray-500 mb-6">{timetableHook.error}</p>
        <div className="flex gap-3">
          <button onClick={timetableHook.refetch} className="px-6 py-2.5 bg-[#6D4CFF] text-white rounded-xl font-medium hover:bg-[#5A3FD6] transition-colors">Refresh</button>
        </div>
      </div>
    );
  }

  const showEmptyState = (!Array.isArray(allSchedule) || allSchedule.length === 0) && (!Array.isArray(todaySchedule) || todaySchedule.length === 0);

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* ===== PAGE HEADER ===== */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Schedule & Learning Planner 📅</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your classes, timetable, assignments, events, exams, and daily learning activities from one intelligent dashboard.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            {(['overview', 'planner', 'calendar', 'productivity'] as const).map(v => (
              <button key={v} onClick={() => setSelectedTab(v)}
                className={`px-3 py-1.5 text-[10px] font-medium rounded-md transition-all capitalize ${
                  selectedTab === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {v === 'productivity' ? 'Analytics' : v}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {showEmptyState ? (
        <motion.div variants={fadeUp} className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-3xl bg-gray-50 flex items-center justify-center mb-6">
            <CalendarDays className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">No classes scheduled today</h2>
          <p className="text-gray-500 mb-8 max-w-md text-center">Your timetable and academic planner will appear here once published.</p>
          <div className="flex gap-3">
            <button onClick={() => setSelectedTab('calendar')} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Weekly Timetable
            </button>
          </div>
        </motion.div>
      ) : (

      <>
      {/* ===== HERO SECTION ===== */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#6D4CFF] via-[#4F2DB8] to-[#2D1B69]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(109,76,255,0.15)_0%,transparent_50%)]" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#EC4899]/10 rounded-full blur-[70px]" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#3B82F6]/10 rounded-full blur-[70px]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/60">Academic Planner & Schedule Hub 🚀</span>
          </div>
          <p className="text-sm text-white/70 max-w-2xl mb-5">Stay organized, manage your learning activities, and optimize your academic journey with AI-powered planning.</p>
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => setSelectedTab('calendar')} className="px-4 py-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-medium text-white hover:bg-white/25 transition-all flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> View Calendar
            </button>
            <button onClick={() => setActiveView('timeline')} className="px-4 py-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-medium text-white hover:bg-white/25 transition-all flex items-center gap-2">
              <Clock className="w-4 h-4" /> Today&apos;s Schedule
            </button>
            <button className="px-4 py-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-medium text-white hover:bg-white/25 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Task
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl text-xs font-medium hover:shadow-lg transition-all flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Ask Prerana AI
            </button>
          </div>
        </div>
      </motion.div>

      {/* ===== TOP KPI CARDS ===== */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Classes Today', value: scheduleToday.length, icon: BookOpen, color: '#6D4CFF', trend: '+2 from yesterday', trendUp: true },
          { label: 'Pending Assignments', value: demoAssignments.length, icon: ClipboardList, color: '#F59E0B', trend: '3 overdue', trendUp: false },
          { label: 'Upcoming Events', value: demoEvents.length, icon: CalendarDays, color: '#22C55E', trend: 'this month', trendUp: true },
          { label: 'Study Hours This Week', value: 24, suffix: 'h', icon: Clock, color: '#3B82F6', trend: '+4h vs last week', trendUp: true },
        ].map((kpi, i) => (
          <motion.div key={i} whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(109,76,255,0.12)' }}
            className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-5 transition-all cursor-pointer">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5" style={{ background: kpi.color, transform: 'translate(30%, -30%)' }} />
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}12` }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <span className={`flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full ${kpi.trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                <TrendingUp className={`w-3 h-3 ${kpi.trendUp ? '' : 'rotate-180'}`} />
                {kpi.trendUp ? '+' : '-'}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-gray-900">
              <CounterAnimation value={kpi.value} suffix={kpi.suffix || ''} />
            </div>
            <div className="text-[10px] text-gray-500 mt-1">{kpi.label}</div>
            <div className="text-[9px] mt-1.5" style={{ color: kpi.color }}>{kpi.trend}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ===== SMART SCHEDULE SEARCH ===== */}
      <motion.div variants={fadeUp}>
        <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search classes, events, assignments, exams, activities..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder:text-gray-400"
            />
            <div className="flex items-center gap-2">
              <button onClick={() => setVoiceMode(!voiceMode)}
                className={`p-1.5 rounded-lg transition-all ${voiceMode ? 'bg-red-50 text-red-500' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
              <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#6D4CFF] hover:bg-[#F3F0FF] transition-all">
                <Sparkles className="w-4 h-4" />
              </button>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-4 pb-3 flex-wrap border-t border-gray-50 pt-2">
            {filterOptions.map(f => (
              <button key={f.id} onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1 text-[10px] font-medium rounded-lg transition-all ${
                  activeFilter === f.id
                    ? 'bg-[#6D4CFF] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}>{f.label}</button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ===== QUICK ACTIONS ROW ===== */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {quickActionsList.map((action, i) => (
            <motion.button key={i} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-all">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${action.color}12` }}>
                <action.icon className="w-4 h-4" style={{ color: action.color }} />
              </div>
              <span className="text-[9px] font-medium text-gray-600 text-center leading-tight">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ===== OVERVIEW TAB ===== */}
      {selectedTab === 'overview' && (
        <>
        {/* 70/30 MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT - 70% */}
          <div className="lg:col-span-8 space-y-6">

            {/* Today's Timetable */}
            <SectionCard title="Today's Timetable" subtitle={`${scheduleToday.length} classes scheduled`}>
              <div className="space-y-0 relative">
                {scheduleToday.length > 0 ? (
                  scheduleToday.map((slot: any, i: number) => {
                    const isLive = slot.status === 'live' || (() => {
                      const [sh, sm] = (slot.start_time || '00:00').split(':').map(Number);
                      const [eh, em] = (slot.end_time || '00:00').split(':').map(Number);
                      return currentMinutes >= sh * 60 + sm && currentMinutes < eh * 60 + em;
                    })();
                    const isExpanded = expandedClass === slot.id;
                    const typeInfo = getTypeBadge(slot.type);
                    const subColor = getSubjectColor(slot.subject_name || '');
                    return (
                      <motion.div key={slot.id || i} layout
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="relative pl-8 pb-5 last:pb-0">
                        <div className="absolute left-[11px] top-3 bottom-0 w-0.5 bg-gray-100 last:hidden" />
                        <div className={`absolute left-2 top-3 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                          isLive ? 'border-green-500 bg-green-50' : slot.status === 'completed' ? 'border-gray-300 bg-gray-50' : 'border-[#6D4CFF] bg-white'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : slot.status === 'completed' ? 'bg-gray-300' : 'bg-[#6D4CFF]'}`} />
                        </div>
                        <Card className={`p-4 hover:shadow-lg transition-all cursor-pointer ${
                          isLive ? 'ring-2 ring-green-500/20 shadow-md' : ''
                        } ${isExpanded ? 'ring-2 ring-[#6D4CFF]/20' : ''}`}
                          onClick={() => setExpandedClass(isExpanded ? null : slot.id)}>
                          <div className="flex items-start gap-3">
                            <div className="text-center w-14 flex-shrink-0">
                              <div className="text-sm font-extrabold text-[#6D4CFF]">{slot.start_time?.slice(0, 5)}</div>
                              <div className="text-[9px] text-gray-400">{slot.end_time?.slice(0, 5)}</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-gray-900">{slot.subject_name}</h4>
                                <Badge variant={typeInfo.variant} className="text-[9px]">{typeInfo.label}</Badge>
                                {isLive && <Badge variant="success" className="text-[9px] animate-pulse">Live</Badge>}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400 flex-wrap">
                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {slot.teacher_name}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {slot.room || '—'} • {slot.building || ''}</span>
                                <span className="flex items-center gap-1">
                                  <Timer className="w-3 h-3" />
                                  {(() => {
                                    const [sh, sm] = (slot.start_time || '00:00').split(':').map(Number);
                                    const [eh, em] = (slot.end_time || '00:00').split(':').map(Number);
                                    return `${((eh * 60 + em) - (sh * 60 + sm)) / 60}h`;
                                  })()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={isLive ? 'success' : slot.status === 'completed' ? 'info' : 'default'} className="text-[9px]">
                                {isLive ? 'Live Now' : slot.status === 'completed' ? 'Done' : 'Upcoming'}
                              </Badge>
                              <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                                    {[
                                      { label: 'Room', value: `${slot.room || '—'} • ${slot.building || ''}` },
                                      { label: 'Teacher', value: slot.teacher_name || '—' },
                                      { label: 'Duration', value: `${slot.start_time?.slice(0, 5)} - ${slot.end_time?.slice(0, 5)}` },
                                      { label: 'Capacity', value: `${slot.capacity || '—'} seats` },
                                    ].map((f, fi) => (
                                      <div key={fi} className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                                        <div className="text-[9px] text-gray-400">{f.label}</div>
                                        <div className="text-xs font-semibold text-gray-700 mt-0.5">{f.value}</div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {slot.class_link && (
                                      <button className="px-3 py-1.5 text-[10px] font-medium rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors flex items-center gap-1">
                                        <Video className="w-3 h-3" /> Join Class
                                      </button>
                                    )}
                                    <button className="px-3 py-1.5 text-[10px] font-medium rounded-lg bg-[#F3F0FF] text-[#6D4CFF] hover:bg-[#EBE6FF] transition-colors flex items-center gap-1">
                                      <BookOpen className="w-3 h-3" /> Open Notes
                                    </button>
                                    <button className="px-3 py-1.5 text-[10px] font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1">
                                      <Download className="w-3 h-3" /> Materials
                                    </button>
                                    <button className="px-3 py-1.5 text-[10px] font-medium rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF] hover:bg-[#6D4CFF]/20 transition-colors flex items-center gap-1">
                                      <Sparkles className="w-3 h-3" /> Ask AI
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-gray-400 text-sm border border-dashed border-gray-200 rounded-2xl">
                    <CalendarDays className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    No classes scheduled for today
                    <div className="mt-4">
                      <button onClick={() => setSelectedTab('calendar')} className="px-4 py-2 bg-[#F3F0FF] text-[#6D4CFF] rounded-xl text-xs font-medium hover:bg-[#EBE6FF] transition-colors flex items-center gap-2 mx-auto">
                        <CalendarDays className="w-4 h-4" /> View Weekly Timetable
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Assignment Planner */}
            <SectionCard title="Assignment Planner" subtitle="Track your academic work">
              <div className="space-y-2">
                {demoAssignments.map((item, i) => (
                  <motion.div key={i} whileHover={{ x: 3 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:shadow-sm transition-all">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${getSubjectColor(item.subject)}12` }}>
                      <ClipboardList className="w-5 h-5" style={{ color: getSubjectColor(item.subject) }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-900 truncate">{item.title}</span>
                        <Badge variant={item.priority === 'High' ? 'danger' : item.priority === 'Medium' ? 'warning' : 'default'} className="text-[8px]">{item.priority}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                        <span>{item.subject}</span>
                        <span>•</span>
                        <span>Due: {item.due} ({item.deadline})</span>
                      </div>
                      <Progress value={item.progress} className="h-1.5 mt-1.5" />
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[8px] text-gray-400">{item.progress}% complete</span>
                        <span className="text-[8px] font-medium" style={{ color: item.progress >= 80 ? COLORS.success : item.progress >= 40 ? COLORS.warning : COLORS.danger }}>
                          {item.progress >= 80 ? 'Almost Done' : item.progress >= 40 ? 'In Progress' : 'Not Started'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {item.progress > 0 && item.progress < 100 && (
                        <button className="px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 text-[9px] font-medium hover:bg-green-100 transition-colors flex items-center gap-1">
                          <Play className="w-3 h-3" /> Continue
                        </button>
                      )}
                      {item.progress === 0 && (
                        <button className="px-2.5 py-1.5 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF] text-[9px] font-medium hover:bg-[#6D4CFF]/20 transition-colors flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Start
                        </button>
                      )}
                      {item.progress === 100 && (
                        <button className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-medium hover:bg-blue-100 transition-colors flex items-center gap-1">
                          <Eye className="w-3 h-3" /> View
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </SectionCard>

            {/* Exam Schedule */}
            <SectionCard title="Exam Schedule" subtitle="Upcoming tests & examinations">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {demoExams.map((exam, i) => {
                  const examDate = new Date(exam.date + ' 2025');
                  const daysUntil = Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <motion.div key={i} whileHover={{ y: -2 }}
                      className="p-4 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-all">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${getSubjectColor(exam.subject)}12` }}>
                          <FileText className="w-5 h-5" style={{ color: getSubjectColor(exam.subject) }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-gray-900 truncate">{exam.name}</div>
                          <div className="text-[10px] text-gray-500">{exam.date} • {exam.duration}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-gray-500">Preparation</span>
                          <span className="font-semibold" style={{ color: exam.prepProgress >= 60 ? COLORS.success : exam.prepProgress >= 30 ? COLORS.warning : COLORS.danger }}>
                            {exam.prepProgress}%
                          </span>
                        </div>
                        <Progress value={exam.prepProgress} className="h-1.5" />
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <AlarmClock className="w-3 h-3 text-gray-400" />
                            <span className="text-[9px] font-medium" style={{ color: deadlineColor(daysUntil) }}>
                              {formatCountdown(daysUntil)}
                            </span>
                          </div>
                          <button className="px-2.5 py-1 rounded-lg bg-[#F3F0FF] text-[#6D4CFF] text-[8px] font-medium hover:bg-[#EBE6FF] transition-colors flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI Prep
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </SectionCard>

            {/* Events & Activities */}
            <SectionCard title="Events & Activities" subtitle="Workshops, hackathons, sports & more">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoEvents.map((ev, i) => (
                  <motion.div key={i} whileHover={{ y: -2 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:shadow-sm transition-all">
                    <div className="flex flex-col items-center w-10 flex-shrink-0">
                      <div className="text-xs font-extrabold text-gray-900">{ev.date.split(' ')[1]}</div>
                      <div className="text-[7px] text-gray-400">{ev.date.split(' ')[0]}</div>
                    </div>
                    <div className="w-0.5 h-8 rounded-full flex-shrink-0" style={{ background: ev.type === 'workshop' ? COLORS.primary : ev.type === 'hackathon' ? COLORS.success : ev.type === 'sports' ? COLORS.info : ev.type === 'seminar' ? COLORS.warning : ev.type === 'competition' ? COLORS.danger : COLORS.primary }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900 truncate">{ev.title}</div>
                      <div className="text-[9px] text-gray-500">{ev.time} • {ev.location}</div>
                      <Badge variant={ev.regStatus === 'Open' ? 'success' : ev.regStatus === 'Registering' ? 'warning' : 'default'} className="text-[7px] mt-0.5">{ev.regStatus}</Badge>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* RIGHT - 30% SIDEBAR */}
          <div className="lg:col-span-4 space-y-4">

            {/* Today's Agenda */}
            <SectionCard title="Today's Agenda" subtitle="Your day at a glance">
              <div className="space-y-2">
                {demoAgenda.map((item, i) => (
                  <motion.div key={i} whileHover={{ x: 2 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-gray-50 hover:bg-gray-50 transition-all cursor-pointer">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${item.color}12` }}>
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] text-gray-400">{item.label}</div>
                      <div className="text-xs font-semibold text-gray-900 truncate">{item.value}</div>
                      <div className="text-[8px] text-gray-400">{item.time}</div>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                  </motion.div>
                ))}
              </div>
            </SectionCard>

            {/* AI Study Recommendations */}
            <SectionCard title="AI Study Recommendations" subtitle="Recommended By Prerana AI">
              <div className="space-y-2">
                {demoSuggestions.slice(0, 4).map((rec, i) => (
                  <motion.div key={i} whileHover={{ x: 2 }}
                    className="p-3 rounded-xl bg-gradient-to-r from-[#F3F0FF] to-white border border-[#6D4CFF]/10 hover:shadow-sm transition-all">
                    <div className="flex items-start gap-2 mb-2">
                      <Lightbulb className="w-3.5 h-3.5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-900">{rec.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant={rec.priority === 'High' ? 'danger' : rec.priority === 'Medium' ? 'warning' : 'default'} className="text-[7px]">{rec.priority}</Badge>
                          <span className="text-[8px] text-gray-400">⏱ {rec.time}</span>
                        </div>
                      </div>
                    </div>
                    <button className="w-full py-1.5 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF] text-[9px] font-medium hover:bg-[#6D4CFF]/20 transition-colors flex items-center justify-center gap-1">
                      <Play className="w-3 h-3" /> {rec.action}
                    </button>
                  </motion.div>
                ))}
                <button className="w-full py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[11px] font-medium hover:shadow-md transition-all flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> View All Recommendations
                </button>
              </div>
            </SectionCard>

            {/* Productivity Tracker */}
            <SectionCard title="Productivity Tracker" subtitle="Weekly performance">
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[
                  { label: 'Study Hrs', value: 24, max: 35, color: '#6D4CFF' },
                  { label: 'Attendance', value: 88, max: 100, color: '#22C55E' },
                  { label: 'Tasks Done', value: 12, max: 18, color: '#3B82F6' },
                  { label: 'Goals Met', value: 4, max: 7, color: '#F59E0B' },
                  { label: 'Streak', value: 7, max: 10, color: '#EF4444' },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="relative mb-1">
                      <ProgressRing value={(stat.value / stat.max) * 100} size={44} strokeWidth={3.5} color={stat.color} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[8px] font-extrabold" style={{ color: stat.color }}>{stat.value}</span>
                      </div>
                    </div>
                    <span className="text-[7px] text-gray-400 text-center leading-tight">{stat.label}</span>
                  </div>
                ))}
              </div>
              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={studyHoursWeekly.slice(-6)} margin={{ top: 2, right: 2, bottom: 2, left: -10 }}>
                    <defs>
                      <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6D4CFF" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6D4CFF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="hours" stroke="#6D4CFF" strokeWidth={2} fill="url(#studyGrad)" dot={false} />
                    <Area type="monotone" dataKey="target" stroke="#E5E7EB" strokeWidth={1} strokeDasharray="3 3" fill="none" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            {/* Quick Tasks */}
            <SectionCard title="Quick Tasks" subtitle="Manage your to-dos">
              <div className="space-y-1.5">
                {demoTasks.map((task, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-all group cursor-pointer">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      task.checked ? 'bg-[#6D4CFF] border-[#6D4CFF]' : 'border-gray-300 hover:border-[#6D4CFF]'
                    }`}>
                      {task.checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs ${task.checked ? 'line-through text-gray-400' : 'text-gray-900 font-medium'}`}>{task.title}</span>
                      <div className="flex items-center gap-2 text-[8px] text-gray-400">
                        <span>{task.category}</span>
                        <span>•</span>
                        <span>{task.due}</span>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 py-2 rounded-xl border border-dashed border-gray-200 text-[10px] text-gray-400 hover:border-[#6D4CFF] hover:text-[#6D4CFF] transition-all flex items-center justify-center gap-1">
                <Plus className="w-3 h-3" /> Add New Task
              </button>
            </SectionCard>

            {/* Upcoming Deadlines */}
            <SectionCard title="Upcoming Deadlines" subtitle="What&apos;s due soon">
              <div className="space-y-1.5">
                {[
                  { title: 'Math Problem Set', type: 'Assignment', daysLeft: 1, color: '#EF4444' },
                  { title: 'Science Project', type: 'Project', daysLeft: 3, color: '#F59E0B' },
                  { title: 'Mid-Term Exam', type: 'Exam', daysLeft: 9, color: '#22C55E' },
                  { title: 'Hackathon Reg.', type: 'Registration', daysLeft: 5, color: '#F59E0B' },
                  { title: 'Scholarship App', type: 'Deadline', daysLeft: 14, color: '#22C55E' },
                ].map((dl, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dl.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-900 truncate">{dl.title}</div>
                      <div className="text-[9px] text-gray-500">{dl.type}</div>
                    </div>
                    <span className="text-[9px] font-semibold" style={{ color: dl.color }}>
                      {dl.daysLeft <= 1 ? '⚠️ Due!' : `${dl.daysLeft}d left`}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Goals & Milestones */}
            <SectionCard title="Goals & Milestones" subtitle="Track your academic journey">
              {demoGoals.map((goal, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" style={{ color: i === 0 ? COLORS.primary : i === 1 ? COLORS.success : COLORS.info }} />
                      <span className="text-xs font-semibold text-gray-900">{goal.title}</span>
                    </div>
                    <span className="text-[9px] font-medium" style={{ color: i === 0 ? COLORS.primary : i === 1 ? COLORS.success : COLORS.info }}>{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-1.5 mb-1" />
                  <p className="text-[8px] text-gray-400 truncate">{goal.target}</p>
                </div>
              ))}
            </SectionCard>

            {/* Learning Analytics */}
            <SectionCard title="Learning Analytics" subtitle="Academic performance metrics">
              <div className="h-32 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={learningAnalyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 11 }} />
                    <Line type="monotone" dataKey="attendance" stroke="#6D4CFF" strokeWidth={2} dot={{ r: 2 }} name="Attendance" />
                    <Line type="monotone" dataKey="engagement" stroke="#22C55E" strokeWidth={2} dot={{ r: 2 }} name="Engagement" />
                    <Line type="monotone" dataKey="completion" stroke="#3B82F6" strokeWidth={2} dot={{ r: 2 }} name="Completion" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Class Attendance', value: '88%', trend: '+3%', up: true },
                  { label: 'Subject Engagement', value: '82%', trend: '+5%', up: true },
                  { label: 'Study Hours', value: '24h', trend: '+4h', up: true },
                  { label: 'Exam Readiness', value: '65%', trend: '+12%', up: true },
                ].map((m, i) => (
                  <div key={i} className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="text-[8px] text-gray-500">{m.label}</div>
                    <div className="text-sm font-extrabold text-gray-900">{m.value}</div>
                    <span className={`text-[7px] font-medium ${m.up ? 'text-green-600' : 'text-red-500'}`}>{m.trend}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Reminders Center */}
            <SectionCard title="Reminders Center" subtitle="Alerts & notifications">
              <div className="space-y-1.5">
                {demoReminders.map((rem, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${rem.urgent ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-gray-900 truncate">{rem.title}</span>
                        <Badge variant={rem.type === 'assignment' ? 'warning' : rem.type === 'exam' ? 'danger' : rem.type === 'event' ? 'success' : 'info'} className="text-[6px] px-1 py-0">{rem.type}</Badge>
                      </div>
                      <div className="text-[9px] text-gray-400">{rem.time}</div>
                    </div>
                    <Bell className="w-3 h-3 text-gray-300 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
        </>
      )}

      {/* ===== PLANNER TAB ===== */}
      {selectedTab === 'planner' && (
        <motion.div variants={fadeUp} className="space-y-6">

          {/* Weekly Timetable */}
          <SectionCard title="Weekly Timetable" subtitle="Full week class schedule">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, di) => (
                <div key={di} className={`rounded-2xl border ${di === new Date().getDay() ? 'border-[#6D4CFF]/30 bg-[#F3F0FF]' : 'border-gray-100 bg-white'} p-2 min-h-[200px]`}>
                  <div className={`text-center pb-2 mb-2 border-b ${di === new Date().getDay() ? 'border-[#6D4CFF]/20' : 'border-gray-100'}`}>
                    <div className="text-[10px] font-bold text-gray-500 uppercase">{day.name}</div>
                    <div className={`text-lg font-extrabold ${di === new Date().getDay() ? 'text-[#6D4CFF]' : 'text-gray-900'}`}>{day.date.getDate()}</div>
                  </div>
                  <div className="space-y-1.5">
                    {day.slots.length > 0 ? day.slots.map((slot: any, si: number) => {
                      const subColor = getSubjectColor(slot.subject_name || '');
                      return (
                        <div key={si} className="p-1.5 rounded-lg text-[9px] leading-tight cursor-pointer hover:shadow-sm transition-all"
                          style={{ background: `${subColor}12` }}>
                          <div className="font-semibold text-gray-900 truncate flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: subColor }} />
                            {slot.subject_name}
                          </div>
                          <div className="text-gray-500">{slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}</div>
                          <div className="text-gray-400 truncate">{slot.teacher_name}</div>
                          <div className="text-gray-400 truncate">{slot.room || ''}</div>
                          <Badge variant={slot.type?.toLowerCase() === 'lab' ? 'warning' : slot.type?.toLowerCase() === 'practical' ? 'info' : slot.type?.toLowerCase() === 'workshop' ? 'success' : 'default'} className="text-[7px] mt-0.5 px-1 py-0">{slot.type || 'Lecture'}</Badge>
                        </div>
                      );
                    }) : (
                      <div className="text-center py-6 text-[9px] text-gray-300">No classes</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Assignment Planner + Exam Schedule Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Assignment Planner" subtitle="All assignments & deadlines">
              <div className="space-y-2">
                {demoAssignments.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${getSubjectColor(item.subject)}15` }}>
                      <ClipboardList className="w-4 h-4" style={{ color: getSubjectColor(item.subject) }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-900 truncate">{item.title}</span>
                        <Badge variant={item.priority === 'High' ? 'danger' : item.priority === 'Medium' ? 'warning' : 'default'} className="text-[8px]">{item.priority}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                        <span>{item.subject}</span>
                        <span>•</span>
                        <span>Due: {item.due}</span>
                      </div>
                      <Progress value={item.progress} className="h-1 mt-1.5" />
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button className="px-2 py-1 rounded-lg bg-[#F3F0FF] text-[#6D4CFF] text-[9px] font-medium hover:bg-[#EBE6FF] transition-colors flex items-center gap-1">
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button className="px-2 py-1 rounded-lg bg-green-50 text-green-600 text-[9px] font-medium hover:bg-green-100 transition-colors flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Submit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Exam Schedule" subtitle="All upcoming exams">
              <div className="space-y-2">
                {demoExams.map((exam, i) => {
                  const examDate = new Date(exam.date + ' 2025');
                  const daysUntil = Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${getSubjectColor(exam.subject)}15` }}>
                        <FileText className="w-4 h-4" style={{ color: getSubjectColor(exam.subject) }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-900 truncate">{exam.name}</div>
                        <div className="text-[10px] text-gray-500">{exam.date} • {exam.duration} • {exam.syllabus}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <Progress value={exam.prepProgress} className="h-1 flex-1" />
                          <span className="text-[8px] font-medium" style={{ color: deadlineColor(daysUntil) }}>{formatCountdown(daysUntil)}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>

          {/* Events & Activities + AI Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SectionCard title="Events & Activities" subtitle="Workshops, hackathons, sports & competitions">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {demoEvents.map((ev, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:shadow-sm transition-all cursor-pointer">
                      <div className="flex flex-col items-center w-10 flex-shrink-0">
                        <div className="text-xs font-extrabold text-gray-900">{ev.date.split(' ')[1]}</div>
                        <div className="text-[7px] text-gray-400">{ev.date.split(' ')[0]}</div>
                      </div>
                      <div className="w-0.5 h-8 rounded-full flex-shrink-0" style={{ background: ev.type === 'workshop' ? COLORS.primary : ev.type === 'hackathon' ? COLORS.success : ev.type === 'sports' ? COLORS.info : COLORS.warning }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-900 truncate">{ev.title}</div>
                        <div className="text-[9px] text-gray-500">{ev.time} • {ev.location}</div>
                        <Badge variant={ev.regStatus === 'Open' ? 'success' : ev.regStatus === 'Registering' ? 'warning' : 'default'} className="text-[7px] mt-0.5">{ev.regStatus}</Badge>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* AI Recommendations Sidebar */}
            <div>
              <SectionCard title="AI Study Recommendations" subtitle="Prerana AI suggestions">
                <div className="space-y-2">
                  {demoSuggestions.map((rec, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-gradient-to-r from-[#F3F0FF] to-white border border-[#6D4CFF]/10">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-semibold text-gray-900">{rec.title}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant={rec.priority === 'High' ? 'danger' : rec.priority === 'Medium' ? 'warning' : 'default'} className="text-[6px] px-1 py-0">{rec.priority}</Badge>
                            <span className="text-[7px] text-gray-400">⏱ {rec.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[11px] font-medium hover:shadow-md transition-all flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Generate Smart Schedule
                </button>
              </SectionCard>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== CALENDAR TAB ===== */}
      {selectedTab === 'calendar' && (
        <motion.div variants={fadeUp} className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Academic Calendar</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); } else setCalendarMonth(m => m - 1); }}
                  className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
                <span className="text-xs font-semibold text-gray-700 min-w-[120px] text-center">
                  {new Date(calendarYear, calendarMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); } else setCalendarMonth(m => m + 1); }}
                  className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-[10px] font-semibold text-gray-400 text-center py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day, i) => (
                <div key={i} className={`min-h-[64px] p-1.5 rounded-lg text-xs transition-all ${
                  day.isToday ? 'bg-[#6D4CFF]/10 ring-1 ring-[#6D4CFF]/30' : 'hover:bg-gray-50'
                } ${day.date === 0 ? 'invisible' : ''}`}>
                  <div className={`font-semibold text-center mb-1 ${day.isToday ? 'text-[#6D4CFF]' : 'text-gray-700'}`}>
                    {day.date > 0 ? day.date : ''}
                  </div>
                  <div className="space-y-0.5">
                    {day.events.slice(0, 3).map((ev, ei) => (
                      <div key={ei} className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ev.color }} />
                        <span className="text-[7px] text-gray-500 truncate block max-w-[50px]">{ev.title}</span>
                      </div>
                    ))}
                    {day.events.length > 3 && (
                      <div className="text-[7px] text-gray-400 pl-[10px]">+{day.events.length - 3} more</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 flex-wrap">
              {[
                { color: 'bg-[#6D4CFF]', label: 'Class' },
                { color: 'bg-red-500', label: 'Exam' },
                { color: 'bg-green-500', label: 'Event' },
                { color: 'bg-yellow-500', label: 'Competition' },
                { color: 'bg-blue-500', label: 'Deadline' },
              ].map((leg, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${leg.color}`} />
                  <span className="text-[9px] text-gray-500">{leg.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Weekly view below calendar */}
          <SectionCard title="Weekly Overview" subtitle="This week&apos;s class schedule">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, di) => (
                <div key={di} className={`rounded-2xl border ${di === new Date().getDay() ? 'border-[#6D4CFF]/30 bg-[#F3F0FF]' : 'border-gray-100 bg-white'} p-2 min-h-[160px]`}>
                  <div className={`text-center pb-2 mb-1 border-b ${di === new Date().getDay() ? 'border-[#6D4CFF]/20' : 'border-gray-100'}`}>
                    <div className="text-[9px] font-bold text-gray-500 uppercase">{day.name}</div>
                    <div className={`text-base font-extrabold ${di === new Date().getDay() ? 'text-[#6D4CFF]' : 'text-gray-900'}`}>{day.date.getDate()}</div>
                  </div>
                  <div className="space-y-1">
                    {day.slots.length > 0 ? day.slots.map((slot: any, si: number) => {
                      const subColor = getSubjectColor(slot.subject_name || '');
                      return (
                        <div key={si} className="p-1 rounded-lg text-[8px] leading-tight cursor-pointer hover:shadow-sm transition-all"
                          style={{ background: `${subColor}10` }}>
                          <div className="font-semibold text-gray-900 truncate flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: subColor }} />
                            {slot.subject_name}
                          </div>
                          <div className="text-gray-400">{slot.start_time?.slice(0, 5)}</div>
                        </div>
                      );
                    }) : (
                      <div className="text-center py-4 text-[8px] text-gray-300">No classes</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </motion.div>
      )}

      {/* ===== PRODUCTIVITY/ANALYTICS TAB ===== */}
      {selectedTab === 'productivity' && (
        <motion.div variants={fadeUp} className="space-y-6">

          {/* Productivity Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Study Hours', value: '124h', change: '+18h vs last month', icon: Clock, color: '#6D4CFF' },
              { label: 'Attendance Rate', value: '88%', change: '+3% improvement', icon: CheckCircle2, color: '#22C55E' },
              { label: 'Tasks Completed', value: '68/85', change: '80% completion rate', icon: ClipboardList, color: '#3B82F6' },
              { label: 'Learning Streak', value: '7 days', change: 'Personal best: 14 days', icon: Flame, color: '#EF4444' },
            ].map((m, i) => (
              <motion.div key={i} whileHover={{ y: -2 }}
                className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${m.color}12` }}>
                    <m.icon className="w-5 h-5" style={{ color: m.color }} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-gray-900">{m.value}</div>
                <div className="text-[10px] text-gray-500 mt-1">{m.label}</div>
                <div className="text-[9px] mt-1" style={{ color: m.color }}>{m.change}</div>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Weekly Study Hours" subtitle="Hours spent studying per week">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studyHoursWeekly} barSize={22} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                    <Bar dataKey="hours" name="Study Hours" radius={[6, 6, 0, 0]} fill="#6D4CFF" />
                    <Bar dataKey="target" name="Target" radius={[6, 6, 0, 0]} fill="#E5E7EB" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Learning Analytics" subtitle="Daily academic metrics">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={learningAnalyticsData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                    <defs>
                      <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6D4CFF" stopOpacity={0.3} /><stop offset="100%" stopColor="#6D4CFF" stopOpacity={0} /></linearGradient>
                      <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} /><stop offset="100%" stopColor="#22C55E" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                    <Area type="monotone" dataKey="attendance" stroke="#6D4CFF" strokeWidth={2} fill="url(#attGrad)" name="Attendance" dot={{ r: 3, fill: '#6D4CFF' }} />
                    <Area type="monotone" dataKey="engagement" stroke="#22C55E" strokeWidth={2} fill="url(#engGrad)" name="Engagement" dot={{ r: 3, fill: '#22C55E' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          {/* Subject Distribution + Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SectionCard title="Subject Distribution" subtitle="Hours per subject">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={subjectHours} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="hours">
                      {subjectHours.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 mt-2">
                {subjectHours.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-[9px]">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-gray-600 flex-1">{s.name}</span>
                    <span className="font-semibold text-gray-900">{s.hours}h</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Goals & Progress" subtitle="Academic milestones">
              {demoGoals.map((goal, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-900">{goal.title}</span>
                    <span className="text-[9px] font-medium" style={{ color: i === 0 ? COLORS.primary : i === 1 ? COLORS.success : COLORS.info }}>{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2 mb-1" />
                  <p className="text-[8px] text-gray-400">{goal.target}</p>
                </div>
              ))}
            </SectionCard>

            <SectionCard title="Achievements" subtitle="Badges & milestones">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Perfect Attendance', icon: Award, earned: true, color: '#6D4CFF' },
                  { label: 'Early Bird', icon: Star, earned: true, color: '#F59E0B' },
                  { label: 'Study Streak', icon: Flame, earned: true, color: '#EF4444' },
                  { label: 'Class Champion', icon: Trophy, earned: false, color: '#22C55E' },
                  { label: 'Time Master', icon: Medal, earned: false, color: '#3B82F6' },
                  { label: 'Consistent', icon: Zap, earned: true, color: '#8B5CF6' },
                ].map((ach, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-xl ${ach.earned ? 'bg-gray-50' : 'bg-gray-50/50 opacity-50'}`}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: ach.earned ? `${ach.color}15` : '#F1F5F9' }}>
                      <ach.icon className="w-3.5 h-3.5" style={{ color: ach.earned ? ach.color : '#94A3B8' }} />
                    </div>
                    <span className="text-[8px] font-medium text-gray-600">{ach.label}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Reminders + Quick Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Reminders & Alerts" subtitle="Stay on track">
              <div className="space-y-1.5">
                {demoReminders.map((rem, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${rem.urgent ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-900">{rem.title}</span>
                        <Badge variant={rem.type === 'assignment' ? 'warning' : rem.type === 'exam' ? 'danger' : rem.type === 'event' ? 'success' : 'info'} className="text-[6px] px-1 py-0">{rem.type}</Badge>
                      </div>
                      <div className="text-[9px] text-gray-500">{rem.time}</div>
                    </div>
                    <Bell className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Quick Tasks" subtitle="Your to-do list">
              <div className="space-y-1.5">
                {demoTasks.map((task, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-all group cursor-pointer">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      task.checked ? 'bg-[#6D4CFF] border-[#6D4CFF]' : 'border-gray-300 hover:border-[#6D4CFF]'
                    }`}>
                      {task.checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs ${task.checked ? 'line-through text-gray-400' : 'text-gray-900 font-medium'}`}>{task.title}</span>
                      <div className="text-[8px] text-gray-400">{task.category} • {task.due}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </motion.div>
      )}

      {/* ===== BOTTOM QUICK ACTIONS ===== */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {[
            { label: 'Join Live Class', icon: Video, color: '#6D4CFF' },
            { label: 'Open Notes', icon: BookOpen, color: '#22C55E' },
            { label: 'View Assignments', icon: ClipboardList, color: '#F59E0B' },
            { label: 'View Exams', icon: FileText, color: '#3B82F6' },
            { label: 'Download Timetable', icon: Download, color: '#8B5CF6' },
            { label: 'Contact Teacher', icon: MessageSquare, color: '#EF4444' },
            { label: 'Study Materials', icon: Library, color: '#14B8A6' },
            { label: 'Ask Prerana AI', icon: Sparkles, color: '#EC4899' },
          ].map((action, i) => (
            <motion.button key={i} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-all">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${action.color}12` }}>
                <action.icon className="w-4 h-4" style={{ color: action.color }} />
              </div>
              <span className="text-[8px] font-medium text-gray-600 text-center leading-tight">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
      </>

      )}

    </motion.div>
  );
}
