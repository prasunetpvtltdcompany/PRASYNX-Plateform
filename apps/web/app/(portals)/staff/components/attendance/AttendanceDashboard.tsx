'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  School, Users, BookOpen, ClipboardList, TrendingUp, Clock, CheckCircle2,
  AlertCircle, Award, Bell, Plus, CalendarDays, Target, Star, Sparkles,
  ChevronRight, Download, MessageSquare, FileText, BarChart3, ArrowUpRight,
  Search, X, User, GraduationCap, Lightbulb, Zap, Play, Video,
  Mail, Phone, MapPin, Settings, Eye, Edit3, Filter, MoreHorizontal,
  QrCode, Camera, Fingerprint, CreditCard, Activity, PieChart as PieChartIcon,
  LineChart, Gift, HelpCircle, Moon, Sun, Globe, BookMarked, Send,
  Trash2, RefreshCw, Timer, BadgeAlert, BadgeCheck, BadgeMinus,
  ListChecks, CalendarCheck, UsersRound, UserRoundX,
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

interface AttendanceDashboardProps {
  attendanceHook: any;
  students: any[];
  classes: any[];
  setActiveTab: (tab: string) => void;
  loadStudentAttendance: (sid: string) => void;
  darkMode?: boolean;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const todaySummary = { present: 164, absent: 14, late: 8, leaves: 3 };

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

export function AttendanceDashboard({ attendanceHook, students, classes, setActiveTab, loadStudentAttendance, darkMode }: AttendanceDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'mark' | 'analytics'>('overview');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  const effectiveStudents = useMemo(() => {
    if (Array.isArray(students) && students.length > 0) return students;
    return [];
  }, [students]);

  const filteredStudents = useMemo(() => {
    let result = effectiveStudents;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s: any) =>
        (s.full_name || '').toLowerCase().includes(q) ||
        (s.roll_number || '').toLowerCase().includes(q) ||
        (s.class_name || s.class || '').toLowerCase().includes(q)
      );
    }
    if (filterClass !== 'all') result = result.filter((s: any) => (s.class_name || s.class || '') === filterClass);
    if (filterStatus !== 'all') result = result.filter((s: any) => s.status === filterStatus);
    return result;
  }, [effectiveStudents, searchQuery, filterClass, filterStatus]);

  const totalPresent = effectiveStudents.filter((s: any) => s.status === 'present').length;
  const totalAbsent = effectiveStudents.filter((s: any) => s.status === 'absent').length;
  const totalLate = effectiveStudents.filter((s: any) => s.status === 'late').length;
  const totalStudents = effectiveStudents.length;
  const attendanceRate = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;

  const classOptions = useMemo(() => {
    const set = new Set(effectiveStudents.map((s: any) => s.class_name || s.class || ''));
    return Array.from(set);
  }, [effectiveStudents]);

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
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

  const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    present: { label: 'Present', color: '#10B981', bg: '#F0FDF4', icon: BadgeCheck },
    absent: { label: 'Absent', color: '#EF4444', bg: '#FEF2F2', icon: UserRoundX },
    late: { label: 'Late', color: '#F59E0B', bg: '#FFFBEB', icon: Timer },
  };

  if (attendanceHook?.loading) {
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

  if (attendanceHook?.error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load attendance data</h2>
        <p className="text-gray-500 mb-6">{attendanceHook.error}</p>
        <div className="flex gap-3">
          <button onClick={attendanceHook.refetch} className="px-6 py-2.5 bg-[#7C3AED] text-white rounded-xl font-medium hover:bg-[#6D28D9] transition-colors">Refresh</button>
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
            { key: 'mark', label: 'Mark Attendance', icon: ClipboardList },
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
            <div className="text-[10px] font-bold uppercase tracking-widest text-purple-200 mb-1.5">📅 Attendance Dashboard</div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-2">Track Attendance & Insights</h1>
            <p className="text-sm text-purple-100/80 max-w-xl mb-5">Track attendance, identify trends, monitor student participation, and improve classroom engagement.</p>
            <div className="flex flex-wrap items-center gap-4">
              {[
                { label: 'Total Students', value: totalStudents, icon: Users },
                { label: 'Present Today', value: totalPresent, icon: BadgeCheck },
                { label: 'Absent Today', value: totalAbsent, icon: UserRoundX },
                { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: TrendingUp },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3.5 py-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center"><stat.icon className="w-4 h-4 text-white" /></div>
                  <div>
                    <div className="text-lg font-extrabold text-white">
                      {typeof stat.value === 'number' && stat.label !== 'Attendance Rate' ? <CounterAnimation value={stat.value} /> : stat.value}
                    </div>
                    <div className="text-[9px] text-purple-200">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => setSelectedTab('mark')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-medium text-white hover:bg-white/25 transition-all">
                <ClipboardList className="w-4 h-4 text-[#10B981]" /> Mark Attendance
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-medium text-white hover:bg-white/25 transition-all">
                <Users className="w-4 h-4 text-[#8B5CF6]" /> Bulk Attendance
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-medium text-white hover:bg-white/25 transition-all">
                <FileText className="w-4 h-4 text-[#F59E0B]" /> Generate Report
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-medium text-white hover:bg-white/25 transition-all">
                <Download className="w-4 h-4 text-[#3B82F6]" /> Export Data
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== 4 KPI CARDS ===== */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: totalStudents, sub: '+12 This Semester', icon: Users, color: '#7C3AED', trend: [130, 142, 150, 160, 165, 172, 178] },
          { label: 'Present Today', value: totalPresent, sub: `${attendanceRate}% Attendance`, icon: BadgeCheck, color: '#10B981', trend: [148, 152, 158, 155, 162, 160, 164] },
          { label: 'Absent Today', value: totalAbsent, sub: '-3 Compared To Yesterday', icon: UserRoundX, color: '#EF4444', trend: [18, 14, 16, 12, 10, 17, 14] },
          { label: 'Monthly Attendance', value: `${attendanceRate}%`, sub: 'Excellent Performance', icon: TrendingUp, color: '#3B82F6', isProgress: true },
        ].map((kpi, i) => (
          <motion.div key={i} whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(124,58,237,0.12)' }}
            className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-5 transition-all cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.04]" style={{ background: kpi.color, transform: 'translate(30%, -30%)' }} />
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}10` }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              {!kpi.isProgress && (
                <svg width="72" height="24" className="opacity-50">
                  <polyline fill="none" stroke={kpi.color} strokeWidth="1.5"
                    points={(kpi.trend as number[]).map((v, i) => `${(i / ((kpi.trend as number[]).length - 1)) * 72},${24 - (v / Math.max(...(kpi.trend as number[]))) * 20}`).join(' ')} />
                </svg>
              )}
            </div>
            <div className="text-2xl font-extrabold text-gray-900">
              {typeof kpi.value === 'number' && kpi.label !== 'Monthly Attendance' ? <CounterAnimation value={kpi.value} /> : kpi.value}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">{kpi.label}</div>
            {kpi.isProgress ? (
              <div className="mt-2">
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${attendanceRate}%` }} transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #7C3AED, #6366F1)' }} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] font-medium" style={{ color: kpi.color }}>{kpi.sub}</span>
                  <span className="text-[9px] text-gray-400">{attendanceRate}%</span>
                </div>
              </div>
            ) : (
              <div className="text-[9px] mt-1.5 font-medium" style={{ color: kpi.color }}>{kpi.sub}</div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* ===== OVERVIEW TAB ===== */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 70% */}
          <div className="lg:col-span-8 space-y-6">

            {/* Today's Attendance Table */}
            <SectionCard title="Today's Attendance" subtitle="Student attendance status for today">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search by name, roll number or class..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:border-[#7C3AED] focus:ring-3 focus:ring-[rgba(124,58,237,0.1)] transition-all placeholder:text-gray-400" />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-gray-400" /></button>}
                </div>
                <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-600 outline-none focus:border-[#7C3AED]">
                  <option value="all">All Classes</option>
                  {classOptions.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-600 outline-none focus:border-[#7C3AED]">
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
                <button className="px-3 py-2 rounded-xl bg-[#F3F0FF] text-[#7C3AED] text-xs font-medium hover:bg-[#EBE6FF] transition-all flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4" /> Mark All
                </button>
              </div>
              <div className="overflow-x-auto -mx-5">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left py-2.5 px-5 text-[9px] text-gray-500 font-semibold uppercase w-8">
                        <input type="checkbox" className="rounded border-gray-300 accent-[#7C3AED]"
                          checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                          onChange={() => {
                            if (selectedStudents.size === filteredStudents.length) setSelectedStudents(new Set());
                            else setSelectedStudents(new Set(filteredStudents.map((s: any) => s.id)));
                          }} />
                      </th>
                      <th className="text-left py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Student</th>
                      <th className="text-left py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Roll No</th>
                      <th className="text-left py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Class</th>
                      <th className="text-left py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Check-In</th>
                      <th className="text-left py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Status</th>
                      <th className="text-left py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Remarks</th>
                      <th className="text-right py-2.5 px-5 text-[9px] text-gray-500 font-semibold uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s: any, i: number) => {
                      const st = s.status || 'absent';
                      const config = statusConfig[st] || statusConfig.absent;
                      const Icon = config.icon;
                      return (
                        <motion.tr key={s.id || i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.025 }}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-5">
                            <input type="checkbox" className="rounded border-gray-300 accent-[#7C3AED]"
                              checked={selectedStudents.has(s.id)} onChange={() => toggleStudent(s.id)} />
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white text-[8px] font-bold">
                                {(s.full_name || 'S').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </div>
                              <span className="font-medium text-gray-900 text-xs">{s.full_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-gray-500 text-xs">{s.roll_number || '—'}</td>
                          <td className="py-3 px-3 text-gray-500 text-xs">{s.class_name || s.class || '—'}</td>
                          <td className="py-3 px-3 text-xs">
                            {s.checkIn ? (
                              <span className="text-gray-700">{s.checkIn}</span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit" style={{ background: config.bg }}>
                              <Icon className="w-3 h-3" style={{ color: config.color }} />
                              <span className="text-[9px] font-semibold" style={{ color: config.color }}>{config.label}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-xs text-gray-400 truncate">{s.remarks || '—'}</td>
                          <td className="py-3 px-5 text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 rounded-lg hover:bg-[#F3F0FF] text-gray-400 hover:text-[#7C3AED] transition-all">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                    {filteredStudents.length === 0 && (
                      <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">No students found matching your filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <span>{filteredStudents.length} of {effectiveStudents.length} students</span>
                  {selectedStudents.size > 0 && (
                    <span className="font-medium text-[#7C3AED]">{selectedStudents.size} selected</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] text-[9px] font-medium hover:bg-[#10B981]/20 transition-all flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" /> Mark Present
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-[#EF4444]/10 text-[#EF4444] text-[9px] font-medium hover:bg-[#EF4444]/20 transition-all flex items-center gap-1">
                    <UserRoundX className="w-3 h-3" /> Mark Absent
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* Attendance Analytics */}
            <SectionCard title="Attendance Analytics" subtitle="Charts & trends">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2 mb-2"><LineChart className="w-4 h-4 text-[#7C3AED]" /><span className="text-xs font-semibold text-gray-700">Attendance Trend (Last 30 Days)</span></div>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[]}>
                        <defs><linearGradient id="monthAtt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED" stopOpacity={0.3} /><stop offset="100%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 7, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval={4} />
                        <YAxis domain={[70, 100]} tick={{ fontSize: 8, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 11 }} />
                        <Area type="monotone" dataKey="rate" stroke="#7C3AED" strokeWidth={2} fill="url(#monthAtt)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2"><PieChartIcon className="w-4 h-4 text-[#7C3AED]" /><span className="text-xs font-semibold text-gray-700">Distribution</span></div>
                  <div className="h-44 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[
                          { name: 'Present', value: totalPresent || 0, color: '#10B981' },
                          { name: 'Absent', value: totalAbsent || 0, color: '#EF4444' },
                          { name: 'Late', value: totalLate || 0, color: '#F59E0B' },
                        ].filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                          {PIE_COLORS.slice(0, 3).map((clr, i) => <Cell key={i} fill={clr} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-[8px] mt-1">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#10B981]" /> Present</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#EF4444]" /> Absent</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Late</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-[#7C3AED]" /><span className="text-xs font-semibold text-gray-700">Weekly Attendance</span></div>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]} barSize={20} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0' }} />
                      <Bar dataKey="present" name="Present" radius={[4, 4, 0, 0]} fill="#10B981" />
                      <Bar dataKey="absent" name="Absent" radius={[4, 4, 0, 0]} fill="#EF4444" />
                      <Bar dataKey="late" name="Late" radius={[4, 4, 0, 0]} fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </SectionCard>

            {/* Low Attendance Alerts */}
            <SectionCard title="Low Attendance Alerts" subtitle="Students below 75% attendance">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([] as any[]).map((alert, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:shadow-sm transition-all">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert.risk === 'high' ? 'bg-red-50' : alert.risk === 'medium' ? 'bg-amber-50' : 'bg-yellow-50'}`}>
                      <BadgeAlert className={`w-5 h-5 ${alert.risk === 'high' ? 'text-red-500' : alert.risk === 'medium' ? 'text-amber-500' : 'text-yellow-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-900 truncate">{alert.name}</span>
                        <Badge variant={alert.risk === 'high' ? 'destructive' : alert.risk === 'medium' ? 'secondary' : 'default'} className="text-[7px] px-1 py-0 capitalize">{alert.risk} Risk</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-0.5">
                        <span>Class {alert.class}</span>
                        <span>•</span>
                        <span className="font-semibold" style={{ color: alert.attendance < 65 ? '#EF4444' : alert.attendance < 70 ? '#F59E0B' : '#F59E0B' }}>{alert.attendance}%</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Progress value={alert.attendance} />
                        <button className="text-[8px] text-[#7C3AED] font-medium hover:underline flex-shrink-0">Notify</button>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* RIGHT 30% */}
          <div className="lg:col-span-4 space-y-4">

            {/* Today's Summary */}
            <SectionCard title="Today's Summary" subtitle="Attendance breakdown">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Present', value: todaySummary.present, color: '#10B981', bg: '#F0FDF4' },
                  { label: 'Absent', value: todaySummary.absent, color: '#EF4444', bg: '#FEF2F2' },
                  { label: 'Late', value: todaySummary.late, color: '#F59E0B', bg: '#FFFBEB' },
                  { label: 'Leaves', value: todaySummary.leaves, color: '#3B82F6', bg: '#EFF6FF' },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: item.bg }}>
                    <div className="text-lg font-extrabold" style={{ color: item.color }}>{item.value}</div>
                    <div className="text-[9px] font-medium text-gray-500">{item.label}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Class-Wise Attendance */}
            <SectionCard title="Class-Wise Attendance" subtitle="Today by class">
              <div className="space-y-2">
                {([] as any[]).map((cls, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[11px] font-semibold text-gray-700 w-10">{cls.name}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${cls.attendance}%` }}
                            transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                            className="h-full rounded-full" style={{ background: cls.attendance >= 94 ? 'linear-gradient(90deg, #10B981, #059669)' : cls.attendance >= 88 ? 'linear-gradient(90deg, #7C3AED, #6366F1)' : 'linear-gradient(90deg, #F59E0B, #D97706)' }} />
                        </div>
                        <span className="text-[10px] font-semibold text-gray-600 w-9 text-right">{cls.attendance}%</span>
                      </div>
                      <div className="text-[8px] text-gray-400 mt-0.5">{cls.present}/{cls.total} present</div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Recent Activity */}
            <SectionCard title="Recent Activity" subtitle="Latest attendance actions">
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

            {/* AI Attendance Assistant */}
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
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Prerana AI Assistant</div>
                    <div className="text-[8px] text-purple-200">Hello Teacher 👋 I can help analyze attendance trends</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {[
                    { label: 'Find Low Attendance', icon: BadgeAlert },
                    { label: 'Generate Report', icon: FileText },
                    { label: 'Predict Risk', icon: TrendingUp },
                    { label: 'Notify Parents', icon: Mail },
                    { label: 'Attendance Insights', icon: BarChart3 },
                    { label: 'Create Summary', icon: ListChecks },
                  ].slice(0, 4).map((sugg, si) => (
                    <button key={si} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white/10 border border-white/10 text-[10px] text-white hover:bg-white/20 transition-all">
                      <sugg.icon className="w-3 h-3 text-purple-200" /> {sugg.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input type="text" placeholder="Ask about attendance..."
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-purple-200/50 outline-none focus:border-white/40 transition-all" />
                    <Send className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-200 cursor-pointer hover:text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ===== MARK ATTENDANCE TAB ===== */}
      {selectedTab === 'mark' && (
        <motion.div variants={fadeUp}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <SectionCard title="Mark Attendance" subtitle="Quick attendance marking interface">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <select className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-700 outline-none focus:border-[#7C3AED] w-40">
                    <option>Select Class</option>
                    {['10A', '10B', '11A', '11B', '12A'].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-700 outline-none focus:border-[#7C3AED] w-40">
                    <option>Select Subject</option>
                    <option>Mathematics</option>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>English</option>
                  </select>
                  <input type="date" defaultValue={new Date().toISOString().slice(0, 10)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs text-gray-700 outline-none focus:border-[#7C3AED]" />
                  <div className="flex items-center gap-2 text-xs text-gray-500 ml-auto">
                    <Camera className="w-4 h-4 text-[#7C3AED]" />
                    <span>QR / Face ID</span>
                  </div>
                </div>
                <div className="overflow-x-auto -mx-5">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-left py-2.5 px-5 text-[9px] text-gray-500 font-semibold uppercase w-8">
                          <input type="checkbox" className="rounded border-gray-300 accent-[#7C3AED]" />
                        </th>
                        <th className="text-left py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Student</th>
                        <th className="text-left py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Roll No</th>
                        <th className="text-center py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Present</th>
                        <th className="text-center py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Absent</th>
                        <th className="text-center py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Late</th>
                        <th className="text-left py-2.5 px-3 text-[9px] text-gray-500 font-semibold uppercase">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {([] as any[]).map((s, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="py-2.5 px-5"><input type="checkbox" className="rounded border-gray-300 accent-[#7C3AED]" /></td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white text-[7px] font-bold">{'—'}</div>
                              <span className="font-medium text-gray-900 text-xs">{'—'}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-gray-500">{'—'}</td>
                          <td className="py-2.5 px-3 text-center"><input type="radio" name={`status-${i}`} className="accent-[#10B981] cursor-pointer" /></td>
                          <td className="py-2.5 px-3 text-center"><input type="radio" name={`status-${i}`} className="accent-[#EF4444] cursor-pointer" /></td>
                          <td className="py-2.5 px-3 text-center"><input type="radio" name={`status-${i}`} className="accent-[#F59E0B] cursor-pointer" /></td>
                          <td className="py-2.5 px-3"><input type="text" placeholder="Optional" className="w-full px-2 py-1 rounded-lg border border-gray-200 text-[10px] outline-none focus:border-[#7C3AED] placeholder:text-gray-300" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span>10 students selected</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    <span>Date: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-all">Reset</button>
                    <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white text-xs font-medium hover:shadow-lg transition-all flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Save Attendance
                    </button>
                  </div>
                </div>
              </SectionCard>
            </div>
            <div className="lg:col-span-4 space-y-4">
              <SectionCard title="Quick Stats" subtitle="For selected class">
                <div className="space-y-2">
                  {[
                    { label: 'Total Students', value: '10', color: '#7C3AED' },
                    { label: 'Present', value: '7', color: '#10B981' },
                    { label: 'Absent', value: '2', color: '#EF4444' },
                    { label: 'Late', value: '1', color: '#F59E0B' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                      <span className="text-[10px] text-gray-600">{s.label}</span>
                      <span className="text-sm font-extrabold" style={{ color: s.color }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
              <SectionCard title="Advanced Options" subtitle="Attendance methods">
                <div className="space-y-2">
                  {[
                    { icon: QrCode, label: 'QR Code Attendance', desc: 'Students scan QR to mark', color: '#7C3AED' },
                    { icon: Camera, label: 'Face Recognition', desc: 'AI-powered facial detection', color: '#10B981' },
                    { icon: Fingerprint, label: 'Biometric', desc: 'Fingerprint verification', color: '#3B82F6' },
                  ].map((opt, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:shadow-sm transition-all cursor-pointer">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${opt.color}10` }}>
                        <opt.icon className="w-4.5 h-4.5" style={{ color: opt.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-900">{opt.label}</div>
                        <div className="text-[9px] text-gray-400">{opt.desc}</div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== ANALYTICS TAB ===== */}
      {selectedTab === 'analytics' && (
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { label: 'Avg Daily Attendance', value: `${attendanceRate}%`, change: '+2.3% vs last month', icon: TrendingUp, color: '#7C3AED' },
              { label: 'Total Records', value: '5,340', change: '+450 this month', icon: ClipboardList, color: '#10B981' },
              { label: 'Low Risk Students', value: '12', change: '-3 from last month', icon: BadgeAlert, color: '#F59E0B' },
              { label: 'Parent Notifications', value: '48', change: '+8 this week', icon: Mail, color: '#3B82F6' },
            ].map((m, i) => (
              <motion.div key={i} whileHover={{ y: -2 }} className="rounded-2xl bg-white border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${m.color}10` }}><m.icon className="w-4.5 h-4.5" style={{ color: m.color }} /></div>
                  <div className="text-lg font-extrabold text-gray-900">{m.value}</div>
                </div>
                <div className="text-[10px] text-gray-500">{m.label}</div>
                <div className="text-[9px] font-medium mt-0.5" style={{ color: m.color }}>{m.change}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Monthly Attendance Trend" subtitle="Daily attendance rate for this month">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[]}>
                    <defs><linearGradient id="anaAtt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED" stopOpacity={0.3} /><stop offset="100%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval={5} />
                    <YAxis domain={[70, 100]} tick={{ fontSize: 9, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                    <Area type="monotone" dataKey="rate" stroke="#7C3AED" strokeWidth={2.5} fill="url(#anaAtt)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
            <SectionCard title="Weekly Comparison" subtitle="Present/Absent/Late distribution">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[]} barSize={24} barGap={3}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                    <Bar dataKey="present" name="Present" radius={[4, 4, 0, 0]} fill="#10B981" />
                    <Bar dataKey="absent" name="Absent" radius={[4, 4, 0, 0]} fill="#EF4444" />
                    <Bar dataKey="late" name="Late" radius={[4, 4, 0, 0]} fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Attendance Summary" subtitle="Grade & class level breakdown">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {([] as any[]).map((cls, i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-gray-100 text-center">
                  <div className="text-sm font-extrabold text-gray-900 mb-1">{cls.name}</div>
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg width="64" height="64" viewBox="0 0 64 64" className="transform -rotate-90">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="#E5E7EB" strokeWidth="5" />
                      <motion.circle cx="32" cy="32" r="26" fill="none" stroke={cls.attendance >= 94 ? '#10B981' : cls.attendance >= 88 ? '#7C3AED' : '#F59E0B'} strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 26}
                        initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - cls.attendance / 100) }}
                        transition={{ duration: 1.5, ease: 'easeOut' }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-extrabold text-gray-900">{cls.attendance}%</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-gray-500">{cls.present}/{cls.total} present</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </motion.div>
      )}

    </motion.div>
  );
}
