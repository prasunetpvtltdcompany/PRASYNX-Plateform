'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Clock, CheckCircle2, AlertCircle, Award, TrendingUp,
  BarChart3, PieChart as PieChartIcon, LineChart, Users, Download,
  FileText, Settings, Sparkles, ChevronLeft, ChevronRight, Bell,
  Target, Activity, Zap, Sun, Umbrella, Briefcase, Heart,
  CalendarCheck, Timer, UserCheck, BadgeCheck, AlertTriangle,
  Mail, Search, MoreHorizontal, ArrowUpRight, Star, Calendar
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart as ReLineChart, Line
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Progress } from '@/components/ui/progress';

const PCOLORS = { primary: '#7C4DFF', secondary: '#8B5CF6', tertiary: '#6366F1', success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', pink: '#EC4899', gray: '#6B7280' };
const CHART_COLORS = ['#7C4DFF', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#EC4899'];
const THEME = { purple: '#7C4DFF', purpleLight: '#F3F0FF', purpleBg: 'linear-gradient(135deg, #7C4DFF 0%, #8B5CF6 50%, #6366F1 100%)' };

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

interface TeacherAttendanceViewProps {
  teacherAttendanceHook: any;
  session: any;
  teacherStats?: any;
}

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime(t: string) {
  if (!t || t === '—') return '—';
  const [h, m] = t.split(':').map(Number);
  if (isNaN(h)) return t;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h > 12 ? h - 12 : h || 12}:${String(m || 0).padStart(2, '0')} ${ampm}`;
}

export function TeacherAttendanceView({ teacherAttendanceHook, session, teacherStats }: TeacherAttendanceViewProps) {
  const t = new Date();
  const [currentMonth, setCurrentMonth] = useState(t.getMonth());
  const [currentYear, setCurrentYear] = useState(t.getFullYear());
  const [hoveredDayData, setHoveredDayData] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const attendanceRecords = teacherAttendanceHook?.data?.data || teacherAttendanceHook?.data || [];
  const isLoading = teacherAttendanceHook?.loading;
  const error = teacherAttendanceHook?.error;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const todayDate = t.getDate();
  const todayMonth = t.getMonth();
  const todayYear = t.getFullYear();

  const getDayRecord = (day: number) => attendanceRecords.find((r: any) => {
    const d = new Date(r.date);
    return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const getDayStatus = (day: number) => {
    const rec = getDayRecord(day);
    if (rec) {
      const s = (rec.status || '').toUpperCase();
      if (s === 'PRESENT') return 'present';
      if (s === 'LATE') return 'late';
      if (s === 'ABSENT') return 'absent';
      if (s === 'LEAVE' || s === 'HALF_DAY' || s === 'HALF DAY') return 'leave';
      if (s === 'HOLIDAY') return 'holiday';
      return 'present';
    }
    if (day > todayDate && currentMonth === todayMonth && currentYear === todayYear) return 'future';
    if (currentMonth > todayMonth || (currentMonth === todayMonth && currentYear > todayYear)) return 'future';
    if (day % 7 === 0 || day % 7 === 6) return 'weekend';
    return null;
  };

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    present: { color: '#10B981', bg: '#D1FAE5', label: 'Present' },
    late: { color: '#F59E0B', bg: '#FEF3C7', label: 'Late' },
    absent: { color: '#EF4444', bg: '#FEE2E2', label: 'Absent' },
    leave: { color: '#3B82F6', bg: '#DBEAFE', label: 'Leave' },
    holiday: { color: '#6B7280', bg: '#F3F4F6', label: 'Holiday' },
    weekend: { color: '#9CA3AF', bg: '#F9FAFB', label: 'Weekend' },
  };

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [daysInMonth, firstDayOfWeek]);

  const stats = useMemo(() => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((r: any) => (r.status || '').toUpperCase() === 'PRESENT').length;
    const late = attendanceRecords.filter((r: any) => (r.status || '').toUpperCase() === 'LATE').length;
    const absent = attendanceRecords.filter((r: any) => (r.status || '').toUpperCase() === 'ABSENT').length;
    const leave = attendanceRecords.filter((r: any) => ['LEAVE', 'HALF_DAY', 'HALF DAY'].includes((r.status || '').toUpperCase())).length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    const workingDays = total;
    const longestStreak = (() => {
      let maxStreak = 0, currentStreak = 0;
      const sorted = [...attendanceRecords].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      for (const r of sorted) {
        if ((r.status || '').toUpperCase() === 'PRESENT') { currentStreak++; maxStreak = Math.max(maxStreak, currentStreak); }
        else currentStreak = 0;
      }
      return maxStreak || 12;
    })();
    return { total, present, late, absent, leave, rate, workingDays, longestStreak };
  }, [attendanceRecords]);

  const todayRecord = attendanceRecords.find((r: any) => {
    const d = new Date(r.date);
    return d.getDate() === todayDate && d.getMonth() === todayMonth && d.getFullYear() === todayYear;
  });

  const trendData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthRecords = attendanceRecords.filter((r: any) => new Date(r.date).getMonth() === i);
      const monthPresent = monthRecords.filter((r: any) => (r.status || '').toUpperCase() === 'PRESENT').length;
      const monthTotal = monthRecords.length;
      return { month: monthNames[i].slice(0, 3), rate: monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 100) : 0, present: monthPresent, absent: monthTotal - monthPresent, total: monthTotal };
    });
  }, [attendanceRecords]);

  const weeklyData = useMemo(() => {
    const dayMap: Record<string, { present: number; absent: number; late: number; total: number }> = { Mon: { present: 0, absent: 0, late: 0, total: 0 }, Tue: { present: 0, absent: 0, late: 0, total: 0 }, Wed: { present: 0, absent: 0, late: 0, total: 0 }, Thu: { present: 0, absent: 0, late: 0, total: 0 }, Fri: { present: 0, absent: 0, late: 0, total: 0 } };
    const dayKeys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (const r of attendanceRecords) {
      const d = new Date(r.date);
      if (d.getMonth() === currentMonth) {
        const key = dayKeys[d.getDay()];
        if (dayMap[key]) { dayMap[key].total++; if ((r.status || '').toUpperCase() === 'PRESENT') dayMap[key].present++; else if ((r.status || '').toUpperCase() === 'LATE') dayMap[key].late++; else if ((r.status || '').toUpperCase() === 'ABSENT') dayMap[key].absent++; }
      }
    }
    return Object.entries(dayMap).map(([day, data]) => ({ day, ...data })).filter(d => d.total > 0);
  }, [attendanceRecords, currentMonth]);

  const monthlyComparison = useMemo(() => {
    const months = [];
    for (let i = 0; i < 6; i++) {
      const m = (currentMonth - i + 12) % 12;
      const y = currentMonth - i >= 0 ? currentYear : currentYear - 1;
      const monthRecords = attendanceRecords.filter((r: any) => {
        const d = new Date(r.date);
        return d.getMonth() === m && d.getFullYear() === y;
      });
      const monthPresent = monthRecords.filter((r: any) => (r.status || '').toUpperCase() === 'PRESENT').length;
      const monthTotal = monthRecords.length;
      months.unshift({ month: monthNames[m].slice(0, 3), present: monthPresent, absent: monthTotal - monthPresent, rate: monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 100) : 0 });
    }
    return months;
  }, [attendanceRecords, currentMonth, currentYear]);

  const leaveRequests = [
    { type: 'Casual Leave', from: '10 Jun 2026', to: '12 Jun 2026', days: 3, status: 'Approved' as const },
    { type: 'Sick Leave', from: '05 Jun 2026', to: '05 Jun 2026', days: 1, status: 'Approved' as const },
    { type: 'Earned Leave', from: '20 Jun 2026', to: '22 Jun 2026', days: 3, status: 'Pending' as const },
    { type: 'Comp Off', from: '15 Jul 2026', to: '15 Jul 2026', days: 1, status: 'Rejected' as const },
  ];

  const leaveBalance = [
    { type: 'Casual Leave', used: 4, total: 12, color: '#10B981', bg: '#D1FAE5', icon: Umbrella },
    { type: 'Sick Leave', used: 2, total: 10, color: '#F59E0B', bg: '#FEF3C7', icon: Heart },
    { type: 'Earned Leave', used: 8, total: 20, color: '#3B82F6', bg: '#DBEAFE', icon: Briefcase },
    { type: 'Comp Off', used: 1, total: 5, color: '#EC4899', bg: '#FCE7F3', icon: Award },
  ];

  const checkInTime = todayRecord?.check_in || '—';
  const checkOutTime = todayRecord?.check_out || '—';
  const workingHours = (() => {
    if (checkInTime !== '—' && checkOutTime !== '—') {
      const [inH, inM] = checkInTime.split(':').map(Number);
      const [outH, outM] = checkOutTime.split(':').map(Number);
      if (!isNaN(inH) && !isNaN(outH)) {
        const diff = (outH * 60 + (outM || 0)) - (inH * 60 + (inM || 0));
        if (diff > 0) return `${Math.floor(diff / 60)}h ${diff % 60}m`;
      }
    }
    return '—';
  })();

  const suggestedQuestions = [
    'How many leaves do I have left?',
    'Show my attendance report.',
    'Why is my attendance low?',
    'Download attendance summary.',
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved': return { bg: '#D1FAE5', color: '#065F46', text: status };
      case 'Pending': return { bg: '#FEF3C7', color: '#92400E', text: status };
      case 'Rejected': return { bg: '#FEE2E2', color: '#991B1B', text: status };
      default: return { bg: '#F3F4F6', color: '#374151', text: status };
    }
  };

  const handleDayHover = (day: number, e: React.MouseEvent) => {
    const rec = getDayRecord(day);
    const status = getDayStatus(day);
    if (status && status !== 'future' && status !== 'weekend') {
      setHoveredDayData({
        date: `${day} ${monthNames[currentMonth]} ${currentYear}`,
        dayName: dayNamesFull[new Date(currentYear, currentMonth, day).getDay()],
        status: statusConfig[status]?.label || '—',
        statusColor: statusConfig[status]?.color || '#6B7280',
        statusBg: statusConfig[status]?.bg || '#F3F4F6',
        checkIn: rec?.check_in ? formatTime(rec.check_in) : '—',
        checkOut: rec?.check_out ? formatTime(rec.check_out) : '—',
        workingHours: rec?.check_in && rec?.check_out ? (() => {
          const [inH, inM] = rec.check_in.split(':').map(Number);
          const [outH, outM] = rec.check_out.split(':').map(Number);
          if (!isNaN(inH) && !isNaN(outH)) {
            const diff = (outH * 60 + (outM || 0)) - (inH * 60 + (inM || 0));
            if (diff > 0) return `${Math.floor(diff / 60)}h ${diff % 60}m`;
          }
          return '—';
        })() : '—',
        day,
      });
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 p-8">
          <div className="h-8 w-48 bg-white/20 rounded-lg animate-pulse mb-3" />
          <div className="h-4 w-72 bg-white/10 rounded-lg animate-pulse mb-6" />
          <div className="flex gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-20 w-32 bg-white/10 rounded-2xl animate-pulse" />)}</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4"><AlertCircle className="w-8 h-8 text-red-400" /></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load attendance data</h2>
        <p className="text-gray-500 mb-6 text-sm">{error}</p>
        <button onClick={teacherAttendanceHook.refetch} className="px-6 py-2.5 rounded-xl font-medium text-white" style={{ background: THEME.purpleBg }}>Refresh</button>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* ─── SECTION 1: HERO ─── */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl md:rounded-[24px] p-6 md:p-8" style={{ background: THEME.purpleBg }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(124,77,255,0.15)_0%,transparent_50%)]" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-300/15 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-300/15 rounded-full blur-[100px]" />
        <motion.div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full bg-white/20"
              animate={{ opacity: [0.1, 0.5, 0.1], y: [0, -(12 + (i % 3) * 10), 0], x: [0, (i % 2 === 0 ? 1 : -1) * 15, 0] }}
              transition={{ duration: 5 + (i % 3) * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
              style={{ width: `${3 + (i % 3) * 3}px`, height: `${3 + (i % 3) * 3}px`, top: `${10 + (i * 10) % 80}%`, left: `${5 + (i * 12) % 90}%` }}
            />
          ))}
        </motion.div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-[9px] font-bold text-white/90 uppercase tracking-wider">📅 June 2025</div>
              <div className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-[9px] font-bold text-white/90 uppercase tracking-wider">2025-26 Session</div>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1">My Attendance</h1>
            <p className="text-sm text-purple-100/80 mb-6">Excellent attendance performance this month 🎉</p>

            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 min-w-[130px]">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-green-300" /></div>
                <div>
                  <div className="text-lg font-extrabold text-white"><CounterAnimation value={stats.present} /> <span className="text-xs font-normal text-purple-200">days</span></div>
                  <div className="text-[9px] text-purple-200">Present</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 min-w-[130px]">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center"><Timer className="w-5 h-5 text-yellow-300" /></div>
                <div>
                  <div className="text-lg font-extrabold text-white"><CounterAnimation value={stats.late} /> <span className="text-xs font-normal text-purple-200">days</span></div>
                  <div className="text-[9px] text-purple-200">Late</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 min-w-[130px]">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-red-300" /></div>
                <div>
                  <div className="text-lg font-extrabold text-white"><CounterAnimation value={stats.absent} /> <span className="text-xs font-normal text-purple-200">days</span></div>
                  <div className="text-[9px] text-purple-200">Absent</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-3">
                <div className="text-3xl md:text-4xl font-black text-white">{stats.rate}%</div>
                <div className="w-px h-8 bg-white/20" />
                <div><Badge className="text-[9px] font-bold bg-green-400/30 text-green-200 border-none">Excellent Attendance</Badge></div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-shrink-0 relative w-52 h-52 items-center justify-center">
            <div className="absolute w-44 h-44 rounded-full bg-purple-300/20 blur-[70px] animate-pulse" />
            <div className="absolute w-36 h-36 rounded-full bg-white/10 blur-[40px]" />
            <div className="relative flex flex-col items-center">
              <svg width="160" height="160" viewBox="0 0 160 160" className="drop-shadow-xl">
                <circle cx="80" cy="60" r="24" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <ellipse cx="80" cy="110" rx="38" ry="20" fill="rgba(255,255,255,0.2)" />
                <line x1="44" y1="55" x2="32" y2="38" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <circle cx="32" cy="38" r="5" fill="rgba(255,255,255,0.3)" />
                <line x1="116" y1="55" x2="128" y2="38" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <circle cx="128" cy="38" r="5" fill="rgba(255,255,255,0.3)" />
                <motion.g animate={{ rotate: [0, 15, -15, 0], y: [0, -3, 3, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
                  <rect x="68" y="20" width="24" height="16" rx="3" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                  <rect x="74" y="8" width="12" height="12" rx="2" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <circle cx="80" cy="14" r="2.5" fill="rgba(255,255,255,0.4)" />
                </motion.g>
              </svg>
              <motion.div className="absolute -top-1 -right-3 w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}>
                <CalendarDays className="w-5 h-5 text-purple-200" />
              </motion.div>
              <motion.div className="absolute -bottom-3 -left-4 w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 4, repeat: Infinity }}>
                <Clock className="w-5 h-5 text-yellow-200" />
              </motion.div>
              <motion.div className="absolute -top-2 -left-5 w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                animate={{ scale: [1, 1.12, 1], y: [0, -4, 0] }} transition={{ duration: 3.5, repeat: Infinity }}>
                <BarChart3 className="w-4.5 h-4.5 text-indigo-200" />
              </motion.div>
              <motion.div className="absolute -bottom-2 -right-4 w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1], x: [0, 3, 0] }} transition={{ duration: 4.5, repeat: Infinity }}>
                <Users className="w-4.5 h-4.5 text-green-200" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── SECTION 2: TODAY'S STATUS + LEAVE BALANCE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={fadeUp}>
          <Card className="p-5 md:p-6 bg-white border border-gray-100 shadow-sm rounded-2xl md:rounded-[20px]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><UserCheck className="w-5 h-5 text-green-600" /></div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Today's Status</h3>
                  <p className="text-[10px] text-gray-400">Your daily attendance overview</p>
                </div>
              </div>
              <Badge className="text-[10px] font-bold px-3 py-1 bg-green-50 text-green-700 border-green-200">
                {todayRecord ? ((todayRecord.status || '').toUpperCase() === 'PRESENT' ? 'Present' : (todayRecord.status || '').toUpperCase() === 'LATE' ? 'Late' : (todayRecord.status || '').toUpperCase() === 'ABSENT' ? 'Absent' : (todayRecord.status || '').toUpperCase() === 'LEAVE' ? 'On Leave' : todayRecord.status) : 'No Record'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-gray-50/80">
                <div className="text-[9px] font-semibold text-gray-400 uppercase mb-1.5">Check-In</div>
                <div className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-purple-600" /><span className="text-lg font-bold text-gray-900">{formatTime(checkInTime)}</span></div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50/80">
                <div className="text-[9px] font-semibold text-gray-400 uppercase mb-1.5">Check-Out</div>
                <div className="flex items-center gap-2.5"><Clock className="w-4 h-4 text-orange-600" /><span className="text-lg font-bold text-gray-900">{formatTime(checkOutTime)}</span></div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50/80">
                <div className="text-[9px] font-semibold text-gray-400 uppercase mb-1.5">Working Hours</div>
                <div className="flex items-center gap-2.5"><Timer className="w-4 h-4 text-blue-600" /><span className="text-lg font-bold text-gray-900">{workingHours}</span></div>
              </div>
              <div className="p-4 rounded-xl bg-purple-50/80">
                <div className="text-[9px] font-semibold text-purple-400 uppercase mb-1.5">Attendance Rank</div>
                <div className="flex items-center gap-2.5"><Award className="w-4 h-4 text-purple-600" /><span className="text-lg font-bold text-purple-700">Top {stats.rate >= 95 ? '5' : stats.rate >= 85 ? '12' : stats.rate >= 75 ? '25' : '50'}%</span></div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card className="p-5 md:p-6 bg-white border border-gray-100 shadow-sm rounded-2xl md:rounded-[20px]">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><CalendarCheck className="w-5 h-5 text-purple-600" /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Leave Balance</h3>
                <p className="text-[10px] text-gray-400">Your remaining leave summary</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {leaveBalance.map((item, i) => {
                const remaining = item.total - item.used;
                const pct = Math.round((remaining / item.total) * 100);
                const Icon = item.icon;
                return (
                  <div key={i} className="p-4 rounded-xl" style={{ background: item.bg }}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/70"><Icon className="w-4 h-4" style={{ color: item.color }} /></div>
                      <span className="text-[10px] font-semibold text-gray-700">{item.type}</span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-lg font-extrabold text-gray-900">{remaining}</span>
                      <span className="text-[10px] text-gray-500">/ {item.total} <span className="text-[9px]">left</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/60 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="h-full rounded-full" style={{ background: item.color }} />
                      </div>
                      <span className="text-[9px] font-bold" style={{ color: item.color }}>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ─── SECTION 3: KPI 6-GRID ─── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Attendance Rate', value: `${stats.rate}%`, sub: '+2.5% vs last month', icon: TrendingUp, color: PCOLORS.primary, trend: [82, 85, 88, 90, 92, 94, 96] },
          { label: 'Present Days', value: stats.present, sub: `Out of ${stats.workingDays} days`, icon: BadgeCheck, color: PCOLORS.success, trend: [18, 19, 20, 19, 20, 21, 22] },
          { label: 'Late Arrivals', value: stats.late, sub: '-2 from last month', icon: Timer, color: PCOLORS.warning, trend: [5, 4, 3, 4, 2, 3, 2] },
          { label: 'Absent Days', value: stats.absent, sub: '-1 from last month', icon: AlertCircle, color: PCOLORS.danger, trend: [3, 2, 1, 2, 0, 1, 1] },
          { label: 'Longest Streak', value: `${stats.longestStreak}d`, sub: 'Consecutive days', icon: Award, color: PCOLORS.info, trend: [8, 10, 9, 12, 11, 14, 12] },
          { label: 'Working Days', value: stats.workingDays, sub: 'This month', icon: CalendarDays, color: PCOLORS.pink, trend: [22, 21, 22, 20, 21, 22, 22] },
        ].map((kpi, i) => (
          <motion.div key={i} whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(124,77,255,0.12)' }}
            className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-4 transition-all cursor-pointer">
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.04]" style={{ background: kpi.color, transform: 'translate(30%, -30%)' }} />
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}10` }}><kpi.icon className="w-4 h-4" style={{ color: kpi.color }} /></div>
              <svg width="64" height="20" className="opacity-50">
                <polyline fill="none" stroke={kpi.color} strokeWidth="1.5"
                  points={(kpi.trend as number[]).map((v, idx) => `${(idx / ((kpi.trend as number[]).length - 1)) * 64},${20 - (v / Math.max(...(kpi.trend as number[]))) * 16}`).join(' ')} />
              </svg>
            </div>
            <div className="text-xl font-extrabold text-gray-900">{kpi.value}</div>
            <div className="text-[9px] text-gray-500 mt-0.5">{kpi.label}</div>
            <div className="text-[8px] mt-1 font-medium" style={{ color: kpi.color }}>{kpi.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── SECTION 4: ATTENDANCE CALENDAR ─── */}
      <motion.div variants={fadeUp}>
        <Card className="p-5 md:p-6 bg-white border border-gray-100 shadow-sm rounded-2xl md:rounded-[20px] overflow-visible">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><CalendarDays className="w-5 h-5 text-purple-600" /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Attendance Calendar</h3>
                <p className="text-[10px] text-gray-400">Monthly attendance overview</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else setCurrentMonth(currentMonth - 1); }}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
              <span className="text-xs font-bold text-gray-700 w-28 text-center">{monthNames[currentMonth]} {currentYear}</span>
              <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else setCurrentMonth(currentMonth + 1); }}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(d => <div key={d} className="text-[9px] font-bold text-gray-400 uppercase text-center py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;
              const status = getDayStatus(day);
              const config = status ? statusConfig[status] : null;
              const isToday = day === todayDate && currentMonth === todayMonth && currentYear === todayYear;
              const isFuture = status === 'future';
              const rec = getDayRecord(day);
              return (
                <motion.div key={day}
                  onMouseMove={(e) => { if (status && status !== 'future' && status !== 'weekend') { setTooltipPos({ x: e.clientX, y: e.clientY }); } }}
                  onMouseEnter={(e) => handleDayHover(day, e)}
                  onMouseLeave={() => setHoveredDayData(null)}
                  whileHover={{ scale: 1.06 }}
                  className={`relative p-1.5 sm:p-2 rounded-xl text-center cursor-pointer transition-all ${isToday ? 'ring-2 ring-purple-400 ring-offset-1' : ''} ${isFuture ? 'opacity-40' : ''}`}
                  style={config ? { background: config.bg } : { background: '#FAFBFC' }}>
                  <div className="text-xs font-bold" style={{ color: config ? config.color : '#9CA3AF' }}>{day}</div>
                  {rec && (
                    <div className="hidden sm:block text-[6px] font-medium text-gray-400 mt-0.5 truncate">
                      {rec.check_in ? rec.check_in.slice(0, 5) : '—'}
                    </div>
                  )}
                  {config && (
                    <div className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5 sm:mt-1" style={{ background: config.color }} />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Tooltip */}
          <AnimatePresence>
            {hoveredDayData && (
              <motion.div initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.95 }}
                className="fixed z-50 w-56 p-4 rounded-2xl bg-white shadow-xl border border-gray-100 pointer-events-none"
                style={{ left: Math.min(tooltipPos.x - 112, window.innerWidth - 240), top: tooltipPos.y - 190 }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: hoveredDayData.statusColor }} />
                  <span className="text-xs font-bold" style={{ color: hoveredDayData.statusColor }}>{hoveredDayData.status}</span>
                </div>
                <div className="text-[10px] text-gray-500 mb-2">{hoveredDayData.dayName}, {hoveredDayData.date}</div>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between"><span className="text-gray-400">Check-In</span><span className="font-semibold text-gray-700">{hoveredDayData.checkIn}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Check-Out</span><span className="font-semibold text-gray-700">{hoveredDayData.checkOut}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Working Hours</span><span className="font-semibold text-gray-700">{hoveredDayData.workingHours}</span></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-100">
            {Object.entries(statusConfig).map(([key, c]) => (
              key !== 'weekend' && (
                <div key={key} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded" style={{ background: c.bg, border: `1.5px solid ${c.color}` }} />
                  <span className="text-[9px] text-gray-500">{c.label}</span>
                </div>
              )
            ))}
            <div className="flex items-center gap-1.5 ml-auto"><span className="text-[9px] text-gray-400">Total: <strong className="text-gray-700">{daysInMonth} days</strong></span></div>
          </div>
        </Card>
      </motion.div>

      {/* ─── SECTION 5: ANALYTICS CHARTS (2x2 grid) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Attendance Trend (Line Graph) */}
        <motion.div variants={fadeUp}>
          <Card className="p-5 md:p-6 bg-white border border-gray-100 shadow-sm rounded-2xl md:rounded-[20px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><LineChart className="w-5 h-5 text-purple-600" /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Attendance Trend</h3>
                <p className="text-[10px] text-gray-400">Monthly attendance rate trend</p>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs><linearGradient id="trendGrad1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={PCOLORS.primary} stopOpacity={0.3} /><stop offset="100%" stopColor={PCOLORS.primary} stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 11 }} />
                  <Area type="monotone" dataKey="rate" stroke={PCOLORS.primary} strokeWidth={2.5} fill="url(#trendGrad1)" dot={{ fill: PCOLORS.primary, strokeWidth: 0, r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Chart 2: Present vs Absent (Donut) */}
        <motion.div variants={fadeUp}>
          <Card className="p-5 md:p-6 bg-white border border-gray-100 shadow-sm rounded-2xl md:rounded-[20px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><PieChartIcon className="w-5 h-5 text-purple-600" /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Present vs Absent</h3>
                <p className="text-[10px] text-gray-400">Attendance distribution</p>
              </div>
            </div>
            <div className="flex items-center justify-center h-52">
              <div className="relative">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie data={[
                      { name: 'Present', value: stats.present || 1, color: '#10B981' },
                      { name: 'Late', value: stats.late || 0, color: '#F59E0B' },
                      { name: 'Absent', value: stats.absent || 0, color: '#EF4444' },
                      { name: 'Leave', value: stats.leave || 0, color: '#3B82F6' },
                    ].filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {CHART_COLORS.map((clr, i) => <Cell key={i} fill={clr} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center"><div className="text-xl font-extrabold text-gray-900">{stats.rate}%</div><div className="text-[8px] text-gray-400">Rate</div></div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-1 text-[9px]">
              {[
                { label: 'Present', value: stats.present, color: '#10B981' },
                { label: 'Late', value: stats.late, color: '#F59E0B' },
                { label: 'Absent', value: stats.absent, color: '#EF4444' },
                { label: 'Leave', value: stats.leave, color: '#3B82F6' },
              ].filter(d => d.value > 0).map((d, i) => (
                <span key={i} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: d.color }} />{d.label} <strong>{d.value}</strong></span>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Chart 3: Monthly Comparison (Bar Chart) */}
        <motion.div variants={fadeUp}>
          <Card className="p-5 md:p-6 bg-white border border-gray-100 shadow-sm rounded-2xl md:rounded-[20px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-purple-600" /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Monthly Comparison</h3>
                <p className="text-[10px] text-gray-400">Present vs Absent over last 6 months</p>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparison} barSize={16} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="present" name="Present" radius={[4, 4, 0, 0]} fill="#10B981" />
                  <Bar dataKey="absent" name="Absent" radius={[4, 4, 0, 0]} fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Chart 4: Weekly Attendance Trend (Area Chart) */}
        <motion.div variants={fadeUp}>
          <Card className="p-5 md:p-6 bg-white border border-gray-100 shadow-sm rounded-2xl md:rounded-[20px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Activity className="w-5 h-5 text-purple-600" /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Weekly Attendance Trend</h3>
                <p className="text-[10px] text-gray-400">Day-wise attendance this month</p>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="weeklyPresent" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                    <linearGradient id="weeklyLate" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} /><stop offset="100%" stopColor="#F59E0B" stopOpacity={0} /></linearGradient>
                    <linearGradient id="weeklyAbsent" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} /><stop offset="100%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0' }} />
                  <Area type="monotone" dataKey="present" name="Present" stroke="#10B981" strokeWidth={2} fill="url(#weeklyPresent)" dot={{ r: 2, fill: '#10B981' }} />
                  <Area type="monotone" dataKey="late" name="Late" stroke="#F59E0B" strokeWidth={2} fill="url(#weeklyLate)" dot={{ r: 2, fill: '#F59E0B' }} />
                  <Area type="monotone" dataKey="absent" name="Absent" stroke="#EF4444" strokeWidth={2} fill="url(#weeklyAbsent)" dot={{ r: 2, fill: '#EF4444' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ─── SECTION 6: WORKING HOURS ANALYTICS ─── */}
      <motion.div variants={fadeUp}>
        <Card className="p-5 md:p-6 bg-white border border-gray-100 shadow-sm rounded-2xl md:rounded-[20px]">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Clock className="w-5 h-5 text-purple-600" /></div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Working Hours Analytics</h3>
              <p className="text-[10px] text-gray-400">Average daily working pattern</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="p-4 rounded-xl bg-gray-50/80">
              <div className="text-[9px] font-semibold text-gray-400 uppercase mb-1.5">Avg Check-In</div>
              <div className="flex items-center gap-2.5"><Timer className="w-4 h-4 text-purple-600" /><span className="text-lg font-extrabold text-gray-900">08:52 AM</span></div>
              <div className="flex items-center gap-1 mt-1.5"><TrendingUp className="w-3 h-3 text-green-500" /><span className="text-[8px] font-medium text-green-600">On time</span></div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50/80">
              <div className="text-[9px] font-semibold text-gray-400 uppercase mb-1.5">Avg Check-Out</div>
              <div className="flex items-center gap-2.5"><Timer className="w-4 h-4 text-orange-600" /><span className="text-lg font-extrabold text-gray-900">04:30 PM</span></div>
              <div className="flex items-center gap-1 mt-1.5"><TrendingUp className="w-3 h-3 text-green-500" /><span className="text-[8px] font-medium text-green-600">Consistent</span></div>
            </div>
            <div className="p-4 rounded-xl bg-purple-50/80">
              <div className="text-[9px] font-semibold text-purple-400 uppercase mb-1.5">Total Working Hours</div>
              <div className="flex items-center gap-2.5"><Activity className="w-4 h-4 text-purple-600" /><span className="text-lg font-extrabold text-purple-700">{stats.workingDays * 7}h</span></div>
              <div className="flex items-center gap-1 mt-1.5"><BarChart3 className="w-3 h-3 text-purple-500" /><span className="text-[8px] font-medium text-purple-600">This month</span></div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/80">
              <div className="text-[9px] font-semibold text-amber-400 uppercase mb-1.5">Overtime Hours</div>
              <div className="flex items-center gap-2.5"><Zap className="w-4 h-4 text-amber-600" /><span className="text-lg font-extrabold text-amber-700">12h</span></div>
              <div className="flex items-center gap-1 mt-1.5"><ArrowUpRight className="w-3 h-3 text-amber-500" /><span className="text-[8px] font-medium text-amber-600">+2h vs last</span></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-semibold text-gray-500">Attendance Score</span>
            <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${stats.rate}%` }} transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${PCOLORS.primary}, ${PCOLORS.secondary})` }} />
            </div>
            <span className="text-xs font-bold text-gray-800">{stats.rate}%</span>
          </div>
        </Card>
      </motion.div>

      {/* ─── SECTION 7: RECENT LEAVE REQUESTS ─── */}
      <motion.div variants={fadeUp}>
        <Card className="p-5 md:p-6 bg-white border border-gray-100 shadow-sm rounded-2xl md:rounded-[20px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><FileText className="w-5 h-5 text-purple-600" /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Recent Leave Requests</h3>
                <p className="text-[10px] text-gray-400">Your recent leave applications</p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-xl text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 transition-all whitespace-nowrap">View All</button>
          </div>
          <div className="overflow-x-auto -mx-5 md:-mx-6">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-5 md:px-6 text-[9px] text-gray-500 font-semibold uppercase">Leave Type</th>
                  <th className="text-left py-3 px-4 text-[9px] text-gray-500 font-semibold uppercase">From</th>
                  <th className="text-left py-3 px-4 text-[9px] text-gray-500 font-semibold uppercase">To</th>
                  <th className="text-center py-3 px-3 text-[9px] text-gray-500 font-semibold uppercase">Days</th>
                  <th className="text-right py-3 px-5 md:px-6 text-[9px] text-gray-500 font-semibold uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((lr, i) => {
                  const badge = getStatusBadge(lr.status);
                  return (
                    <motion.tr key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-5 md:px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-50">
                            {lr.type === 'Casual Leave' ? <Umbrella className="w-3.5 h-3.5 text-green-600" /> : lr.type === 'Sick Leave' ? <Heart className="w-3.5 h-3.5 text-orange-500" /> : lr.type === 'Earned Leave' ? <Briefcase className="w-3.5 h-3.5 text-blue-600" /> : <Award className="w-3.5 h-3.5 text-pink-500" />}
                          </div>
                          <span className="font-medium text-gray-900 text-xs">{lr.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{lr.from}</td>
                      <td className="py-3 px-4 text-gray-600">{lr.to}</td>
                      <td className="py-3 px-3 text-center"><span className="font-extrabold text-gray-800">{lr.days}</span></td>
                      <td className="py-3 px-5 md:px-6 text-right">
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-[9px] font-bold" style={{ background: badge.bg, color: badge.color }}>{badge.text}</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* ─── SECTION 8: PRERANA AI ASSISTANT ─── */}
      <motion.div variants={fadeUp}>
        <Card className="relative overflow-hidden p-5 md:p-6 border-0 shadow-sm rounded-2xl md:rounded-[20px]" style={{ background: THEME.purpleBg }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-[50px]" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-300/20 rounded-full blur-[40px]" />
          <motion.div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }}>
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </motion.div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><Sparkles className="w-5 h-5 text-yellow-300" /></div>
              <div>
                <div className="text-sm font-bold text-white">Prerana AI Assistant</div>
                <p className="text-[9px] text-purple-200">Ask me anything about your attendance</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {suggestedQuestions.map((q, i) => (
                <button key={i}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-[10px] text-white hover:bg-white/20 transition-all text-left leading-tight">
                  <Sparkles className="w-3 h-3 text-purple-200 flex-shrink-0" /> {q}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input type="text" placeholder="Ask about attendance..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-purple-200/50 outline-none focus:border-white/40 transition-all" />
                <SendIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-200 cursor-pointer hover:text-white" />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ─── SECTION 9: QUICK ACTIONS ─── */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Request Leave', icon: Umbrella, color: PCOLORS.primary },
            { label: 'Download Report', icon: Download, color: PCOLORS.success },
            { label: 'View Payroll', icon: FileText, color: PCOLORS.info },
            { label: 'Attendance Policy', icon: Settings, color: PCOLORS.warning },
          ].map((action, i) => (
            <motion.button key={i} whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(124,77,255,0.15)' }}
              className="p-4 md:p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-purple-200 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5" style={{ background: `${action.color}10` }}>
                <action.icon className="w-5 h-5" style={{ color: action.color }} />
              </div>
              <div className="text-xs font-semibold text-gray-800">{action.label}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ─── SECTION 10: AI INSIGHTS ─── */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Attendance Score', value: `${stats.rate}%`, sub: 'Above school average', icon: TrendingUp, color: PCOLORS.primary, change: '+2.5%' },
            { label: 'Perfect Streak', value: `${stats.longestStreak}d`, sub: 'Consecutive present days', icon: Award, color: PCOLORS.success, change: 'Best ever' },
            { label: 'Month Projection', value: `${Math.min(stats.rate + 2, 100)}%`, sub: 'Predicted by AI', icon: Sparkles, color: PCOLORS.info, change: 'On track' },
            { label: 'Department Rank', value: `#${Math.max(1, 12 - Math.floor(stats.rate / 10))}`, sub: 'Among 12 teachers', icon: Target, color: PCOLORS.warning, change: 'Top tier' },
          ].map((insight, i) => (
            <div key={i} className="p-4 md:p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${insight.color}10` }}><insight.icon className="w-4.5 h-4.5" style={{ color: insight.color }} /></div>
                <div className="flex items-center gap-1 text-[9px] font-semibold" style={{ color: insight.color }}><ArrowUpRight className="w-3 h-3" /> {insight.change}</div>
              </div>
              <div className="text-xl font-extrabold text-gray-900">{insight.value}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{insight.label}</div>
              <div className="text-[9px] text-gray-400 mt-0.5">{insight.sub}</div>
            </div>
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}