'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays, TrendingUp, Clock, AlertCircle, CheckCircle2, Award,
  ChevronLeft, ChevronRight, Download, FileText, RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
};

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

interface AttendanceDashboardProps {
  attendanceData?: any[];
  attendanceHook: any;
  attendancePct: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalAttendance: number;
  monthlyAttendancePct: number;
  attendanceChartData: { month: string; present: number; absent: number; late: number }[];
}

export function AttendanceDashboard({
  attendanceData, attendanceHook, attendancePct, presentCount, absentCount,
  lateCount, totalAttendance, monthlyAttendancePct, attendanceChartData,
}: AttendanceDashboardProps) {
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const consecutiveDays = useMemo(() => {
    if (!Array.isArray(attendanceData)) return 0;
    let maxStreak = 0, currentStreak = 0;
    const sorted = [...attendanceData]
      .filter((a: any) => a.status === 'present')
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (let i = 0; i < sorted.length; i++) {
      const curr = new Date(sorted[i].date);
      const prev = i > 0 ? new Date(sorted[i - 1].date) : null;
      if (prev) {
        const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
        if (diff <= 1.5) currentStreak++;
        else { maxStreak = Math.max(maxStreak, currentStreak); currentStreak = 1; }
      } else currentStreak = 1;
    }
    return Math.max(maxStreak, currentStreak);
  }, [attendanceData]);

  const attendanceStatus = useMemo(() => {
    if (attendancePct >= 95) return { label: 'Excellent', color: '#22C55E' };
    if (attendancePct >= 85) return { label: 'Good', color: '#6D4CFF' };
    if (attendancePct >= 75) return { label: 'Average', color: '#F59E0B' };
    return { label: 'Needs Improvement', color: '#EF4444' };
  }, [attendancePct]);

  const calendarDays = useMemo(() => {
    const totalDays = daysInMonth(calendarMonth, calendarYear);
    const firstDay = firstDayOfMonth(calendarMonth, calendarYear);
    const days: { date: number; status: 'present' | 'absent' | 'late' | 'holiday' | 'weekend' | 'future' | 'none'; isToday: boolean }[] = [];
    for (let i = 0; i < firstDay; i++) days.push({ date: 0, status: 'none', isToday: false });
    const today = new Date();
    for (let d = 1; d <= totalDays; d++) {
      const dayOfWeek = new Date(calendarYear, calendarMonth, d).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isFuture = new Date(calendarYear, calendarMonth, d) > today;
      const record = Array.isArray(attendanceData) ? attendanceData.find((a: any) => {
        if (!a.date) return false;
        const recordDateStr = typeof a.date === 'string' ? a.date.split('T')[0] : new Date(a.date).toISOString().split('T')[0];
        const cellDateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        return recordDateStr === cellDateStr;
      }) : null;
      let status: any = 'none';
      if (isFuture) status = 'future';
      else if (isWeekend) status = 'weekend';
      else if (record) status = record.status || 'none';
      days.push({
        date: d,
        status,
        isToday: d === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear(),
      });
    }
    return days;
  }, [calendarMonth, calendarYear, attendanceData]);

  const calendarPct = useMemo(() => {
    const nonFuture = calendarDays.filter(d => d.status !== 'future' && d.status !== 'none' && d.status !== 'weekend');
    const present = nonFuture.filter(d => d.status === 'present').length;
    return nonFuture.length > 0 ? Math.round((present / nonFuture.length) * 100) : 0;
  }, [calendarDays]);

  const weeklyTrend = useMemo(() => {
    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { date: d.toLocaleDateString('en-US', { weekday: 'short' }), present: 0, absent: 0, late: 0 };
      });
    }
    const weekData: Record<string, { present: number; absent: number; late: number }> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      weekData[d.toLocaleDateString('en-US', { weekday: 'short' })] = { present: 0, absent: 0, late: 0 };
    }
    attendanceData.forEach((a: any) => {
      if (!a.date) return;
      const d = new Date(a.date);
      const key = d.toLocaleDateString('en-US', { weekday: 'short' });
      if (weekData[key]) {
        if (a.status === 'present') weekData[key].present++;
        else if (a.status === 'absent') weekData[key].absent++;
        else if (a.status === 'late') weekData[key].late++;
      }
    });
    return Object.entries(weekData).map(([date, vals]) => ({ date, ...vals }));
  }, [attendanceData]);

  if (attendanceHook?.loading) {
    return (
      <div className="space-y-6">
        <div className="page-header"><h1>Attendance</h1><p>Loading your attendance data...</p></div>
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
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (attendanceHook?.error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load attendance data</h2>
        <p className="text-gray-500 mb-6">{attendanceHook.error}</p>
        <div className="flex gap-3">
          <button onClick={attendanceHook.refetch} className="px-6 py-2.5 bg-[#6D4CFF] text-white rounded-xl font-medium hover:bg-[#5A3FD6] transition-colors">Refresh Data</button>
          <button className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">Contact Administrator</button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-24 h-24 rounded-3xl bg-gray-50 flex items-center justify-center mb-6">
          <CalendarDays className="w-12 h-12 text-gray-300" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">No attendance records available</h2>
        <p className="text-gray-500 mb-8 max-w-md text-center">Your attendance data will appear here once records are added by your school administration.</p>
        <div className="flex gap-3">
          <button onClick={attendanceHook?.refetch} className="px-6 py-2.5 bg-[#6D4CFF] text-white rounded-xl font-medium hover:bg-[#5A3FD6] transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
          <button className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">Contact Administrator</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* Hero Section */}
      <motion.div variants={fadeUp}>
        <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#6D4CFF] via-[#8B5CF6] to-[#2D1B69]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(255,255,255,0.15)_0%,transparent_45%),radial-gradient(circle_at_85%_75%,rgba(255,255,255,0.08)_0%,transparent_45%)]" />
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#EC4899]/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-[90px] translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-white/70 mb-2">Overall Attendance</div>
              <div className="flex items-baseline gap-4">
                <span className="text-5xl md:text-6xl font-extrabold text-white">{Math.round(attendancePct)}%</span>
                <Badge
                  className="text-xs px-3 py-1 rounded-full border"
                  style={{
                    backgroundColor: `${attendanceStatus.color}20`,
                    color: attendanceStatus.label === 'Excellent' ? '#86EFAC' : attendanceStatus.color,
                    borderColor: `${attendanceStatus.color}30`,
                  }}
                >
                  <TrendingUp className="w-3.5 h-3.5 mr-1" /> {attendanceStatus.label}
                </Badge>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="relative w-28 h-28 md:w-36 md:h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - attendancePct / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-white">{Math.round(attendancePct)}</div>
                    <div className="text-[9px] text-white/70 font-medium">COMPLIANCE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Attendance', value: `${Math.round(attendancePct)}%`, sub: attendanceStatus.label, icon: Award },
          { label: 'Present Days', value: presentCount, sub: 'This session', icon: CheckCircle2 },
          { label: 'Absent Days', value: absentCount, sub: 'This session', icon: AlertCircle },
          { label: 'Late Arrivals', value: lateCount, sub: 'This session', icon: Clock },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          const colors = [
            { bg: 'bg-[#6D4CFF]/10', text: 'text-[#6D4CFF]' },
            { bg: 'bg-emerald-100', text: 'text-emerald-600' },
            { bg: 'bg-red-100', text: 'text-red-500' },
            { bg: 'bg-amber-100', text: 'text-amber-500' },
          ];
          return (
            <Card key={i} className="p-5">
              <div className={`w-10 h-10 rounded-xl ${colors[i].bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${colors[i].text}`} />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">{kpi.value}</div>
              <div className="text-sm font-medium text-gray-500 mt-1">{kpi.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{kpi.sub}</div>
            </Card>
          );
        })}
      </motion.div>

      {/* Calendar + Weekly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div variants={fadeUp} className="lg:col-span-1">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Calendar</h3>
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
              {calendarDays.map((day, i) => (
                <div key={i} className={`text-center py-1.5 text-xs rounded-lg transition-all ${
                  day.isToday ? 'ring-2 ring-[#6D4CFF] font-bold' : ''
                } ${
                  day.status === 'present' ? 'bg-emerald-100 text-emerald-700 font-medium' :
                  day.status === 'absent' ? 'bg-red-100 text-red-700 font-medium' :
                  day.status === 'late' ? 'bg-amber-100 text-amber-700 font-medium' :
                  day.status === 'holiday' ? 'bg-blue-100 text-blue-600 font-medium' :
                  day.status === 'weekend' ? 'text-gray-300' :
                  day.status === 'future' ? 'text-gray-200' :
                  day.date === 0 ? '' : 'text-gray-400'
                }`}>
                  {day.date > 0 ? day.date : ''}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                {[
                  { color: 'bg-emerald-500', label: 'Present' },
                  { color: 'bg-red-500', label: 'Absent' },
                  { color: 'bg-amber-500', label: 'Late' },
                ].map((leg, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${leg.color}`} />
                    <span className="text-[9px] text-gray-500">{leg.label}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs font-bold text-[#6D4CFF]">{calendarPct}%</div>
            </div>
          </Card>
        </motion.div>

        {/* Weekly Trend */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Weekly Trend</h3>
                <p className="text-xs text-gray-500 mt-0.5">Attendance breakdown by day</p>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend} barSize={28} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="present" fill="#22C55E" radius={[4, 4, 0, 0]} name="Present" />
                  <Bar dataKey="absent" fill="#EF4444" radius={[4, 4, 0, 0]} name="Absent" />
                  <Bar dataKey="late" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Late" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

    </motion.div>
  );
}
