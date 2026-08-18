'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  School, Users, BookOpen, ClipboardList, TrendingUp, Clock, CheckCircle2,
  AlertCircle, Award, Bell, Plus, CalendarDays, Target, Star, Sparkles,
  ChevronRight, Download, MessageSquare, FileText, BarChart3, ArrowUpRight,
  Search, X, User, GraduationCap, Lightbulb, Zap, Play, Video,
  Mail, Phone, MapPin, Settings, Eye, Edit3, Filter, MoreHorizontal,
  LayoutDashboard, LineChart, PieChart as PieChartIcon, Activity,
  Gift, HelpCircle, Moon, Sun, Globe, CreditCard, BookMarked, Send,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart as ReLineChart, Line,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '../../components/ui/button';

const PCOLORS = { primary: '#7C3AED', secondary: '#8B5CF6', tertiary: '#6366F1', success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };
const PIE_COLORS = ['#7C3AED', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

interface ClassesDashboardProps {
  classesHook: any;
  classes: any[];
  students: any[];
  setActiveTab: (tab: string) => void;
  timetable: any[];
  assignments: any[];
  darkMode?: boolean;
  setDarkMode?: (v: boolean) => void;
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

function Sparkline({ data, color = '#7C3AED' }: { data: number[]; color?: string }) {
  const w = 80; const h = 28;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={pts} />
      <polygon fill={`${color}15`} points={`0,${h} ${pts} ${w},${h}`} />
    </svg>
  );
}

const quickActions = [
  { label: 'Take Attendance', icon: ClipboardList, color: '#7C3AED', action: 'attendance' },
  { label: 'Create Assignment', icon: BookOpen, color: '#10B981', action: 'assignments' },
  { label: 'Schedule Class', icon: CalendarDays, color: '#F59E0B', action: 'calendar' },
  { label: 'Start Live Class', icon: Video, color: '#3B82F6', action: '' },
];

export function ClassesDashboard({ classesHook, classes, students, setActiveTab, timetable, assignments, darkMode, setDarkMode }: ClassesDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('overview');

  const effectiveClasses = useMemo(() => {
    if (Array.isArray(classes) && classes.length > 0) return classes;
    return [] as any[];
  }, [classes]);

  const effectiveStudents = useMemo(() => {
    if (Array.isArray(students) && students.length > 0) return students;
    return [] as any[];
  }, [students]);

  const effectiveTimetable = useMemo(() => {
    if (Array.isArray(timetable) && timetable.length > 0) return timetable;
    return [] as any[];
  }, [timetable]);

  const totalStudents = effectiveStudents.length;
  const activeClasses = effectiveClasses.length;

  const completionRate = useMemo(() => {
    const total = assignments.length || 8;
    const done = Math.floor(total * 0.89);
    return Math.round((done / total) * 100);
  }, [assignments]);

  const attendanceAvg = useMemo(() => {
    if (effectiveClasses.length === 0) return 94;
    return Math.round(effectiveClasses.reduce((s: number, c: any) => s + (c.attendance || 94), 0) / effectiveClasses.length);
  }, [effectiveClasses]);

  const filteredClasses = useMemo(() => {
    if (!searchQuery) return effectiveClasses;
    const q = searchQuery.toLowerCase();
    return effectiveClasses.filter((c: any) =>
      (c.class?.class_name || c.class_name || '').toLowerCase().includes(q) ||
      (c.subject?.name || c.subject || '').toLowerCase().includes(q) ||
      (c.class?.section || c.section || '').toLowerCase().includes(q)
    );
  }, [effectiveClasses, searchQuery]);

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const teacherName = 'Sarah';

  const currentTabOptions = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'classes', label: 'My Classes', icon: School },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

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
    if (g.startsWith('A')) return '#10B981';
    if (g.startsWith('B')) return '#7C3AED';
    if (g.startsWith('C')) return '#F59E0B';
    return '#EF4444';
  };

  if (classesHook?.loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><div className="h-7 w-56 bg-gray-200 rounded-lg animate-pulse" /><div className="h-4 w-72 bg-gray-100 rounded-lg mt-2 animate-pulse" /></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        <div className="rounded-3xl bg-white border border-gray-100 p-8 animate-pulse"><div className="h-44 bg-gray-100 rounded-2xl" /></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        </div>
      </div>
    );
  }

  if (classesHook?.error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load classes</h2>
        <p className="text-gray-500 mb-6">{classesHook.error}</p>
        <div className="flex gap-3">
          <button onClick={classesHook.refetch} className="px-6 py-2.5 bg-[#7C3AED] text-white rounded-xl font-medium hover:bg-[#6D28D9] transition-colors">Refresh</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* ===== TOP TAB BAR ===== */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {currentTabOptions.map(tab => (
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
            <motion.div key={i} className="absolute rounded-full bg-white/10"
              animate={{ opacity: [0.1, 0.4, 0.1], y: [0, -(10 + (i % 3) * 8), 0], x: [0, (i % 2 === 0 ? 1 : -1) * 10, 0] }}
              transition={{ duration: 4 + (i % 3) * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
              style={{ width: `${2 + (i % 3) * 2}px`, height: `${2 + (i % 3) * 2}px`, top: `${10 + (i * 12) % 80}%`, left: `${5 + (i * 15) % 90}%` }}
            />
          ))}
        </motion.div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-purple-200 mb-1.5">{greeting}, Sarah</div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back! 👋</h1>
            <p className="text-sm text-purple-100/80 max-w-xl mb-5">Manage your classes, students, assignments, attendance, and academic performance from one place.</p>
            <div className="flex flex-wrap items-center gap-4 mb-5">
              {[
                { label: 'Active Classes', value: activeClasses, icon: BookOpen },
                { label: 'Total Students', value: totalStudents, icon: Users },
                { label: 'Assignments', value: assignments.length || 42, icon: ClipboardList },
                { label: 'Attendance Rate', value: `${attendanceAvg}%`, icon: TrendingUp },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3.5 py-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center"><stat.icon className="w-4 h-4 text-white" /></div>
                  <div>
                    <div className="text-lg font-extrabold text-white">{typeof stat.value === 'number' ? <CounterAnimation value={stat.value} /> : stat.value}</div>
                    <div className="text-[9px] text-purple-200">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="grid grid-cols-2 gap-2.5">
              {quickActions.map((action, i) => (
                <motion.button key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => action.action && setActiveTab(action.action)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-medium text-white hover:bg-white/25 transition-all">
                  <action.icon className="w-4 h-4" style={{ color: action.color }} /> {action.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== 4 KPI CARDS ===== */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Classes', value: activeClasses, sub: '+2 New This Semester', icon: School, color: '#7C3AED', trend: [3, 4, 3, 5, 4, 5, 5] },
          { label: 'Total Students', value: totalStudents, sub: '+12 New Students', icon: Users, color: '#10B981', trend: [130, 142, 150, 160, 165, 172, 178] },
          { label: 'Assignments', value: assignments.length || 42, sub: '8 Pending Reviews', icon: BookOpen, color: '#F59E0B', trend: [35, 38, 36, 40, 38, 42, 42] },
          { label: 'Attendance Rate', value: `${attendanceAvg}%`, sub: 'Excellent Performance', icon: TrendingUp, color: '#3B82F6', isProgress: true },
        ].map((kpi, i) => (
          <motion.div key={i} whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(124,58,237,0.12)' }}
            className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-5 transition-all cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.04]" style={{ background: kpi.color, transform: 'translate(30%, -30%)' }} />
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}10` }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              {kpi.trend && !kpi.isProgress && <Sparkline data={kpi.trend as number[]} color={kpi.color} />}
            </div>
            <div className="text-2xl font-extrabold text-gray-900">
              {typeof kpi.value === 'number' ? <CounterAnimation value={kpi.value} /> : kpi.value}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">{kpi.label}</div>
            {kpi.isProgress ? (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${attendanceAvg}%` }} transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #7C3AED, #6366F1)' }} />
                </div>
                <span className="text-[10px] font-semibold" style={{ color: kpi.color }}>{attendanceAvg}%</span>
              </div>
            ) : (
              <div className="text-[9px] mt-1.5 font-medium" style={{ color: kpi.color }}>{kpi.sub}</div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* ===== MAIN 70/30 LAYOUT ===== */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 70% */}
          <div className="lg:col-span-8 space-y-6">

            {/* My Classes */}
            <SectionCard title="My Classes" subtitle="Manage all assigned classes and student activities.">
              <div className="space-y-3">
                {filteredClasses.slice(0, 4).map((c: any, i: number) => {
                  const name = c.class?.class_name || c.class_name || 'Class';
                  const section = c.class?.section || c.section || 'A';
                  const subject = c.subject?.name || c.subject || 'Subject';
                  const studentCount = c.students || effectiveStudents.filter((s: any) => s.class === `${name}${section}`).length || 0;
                  const att = c.attendance || 94;
                  const assignCount = c.assignments || 0;
                  const grade = c.avgGrade || 'B+';
                  const next = c.nextClass || 'Today';
                  const isExpanded = expandedClass === c.id;
                  return (
                    <motion.div key={c.id || i} layout
                      className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-all">
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                              style={{ background: [PCOLORS.primary, PCOLORS.success, PCOLORS.warning, PCOLORS.info][i % 4] }}>
                              {name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-gray-900">{name} <span className="text-gray-400 font-medium">{section}</span></h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <BookOpen className="w-3 h-3 text-gray-400" />
                                <span className="text-[10px] text-gray-500">{subject}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-green-50 text-green-600 border-green-200 text-[9px] font-medium px-2 py-0.5">Active</Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                          {[
                            { label: 'Students', value: studentCount, icon: Users, color: '#7C3AED' },
                            { label: 'Attendance', value: `${att}%`, icon: TrendingUp, color: '#10B981' },
                            { label: 'Assignments', value: `${assignCount} Active`, icon: BookOpen, color: '#F59E0B' },
                            { label: 'Avg Grade', value: grade, icon: Award, color: getGradeColor(grade) },
                          ].map((stat, si) => (
                            <div key={si} className="p-2.5 rounded-xl bg-gray-50 border border-gray-50">
                              <div className="flex items-center gap-1.5 mb-1">
                                <stat.icon className="w-3 h-3" style={{ color: stat.color }} />
                                <span className="text-[9px] text-gray-500">{stat.label}</span>
                              </div>
                              <span className="text-sm font-extrabold text-gray-900">{stat.value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-3">
                          <Clock className="w-3 h-3" />
                          <span><strong>Next Class:</strong> {next}</span>
                          <span className="text-gray-300">|</span>
                          <MapPin className="w-3 h-3" />
                          <span>{c.room || 'Room —'}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button onClick={() => setActiveTab('attendance')}
                            className="px-3 py-1.5 text-[10px] font-medium rounded-lg bg-[#F3F0FF] text-[#7C3AED] hover:bg-[#EBE6FF] transition-colors flex items-center gap-1">
                            <ClipboardList className="w-3 h-3" /> Attendance
                          </button>
                          <button onClick={() => setActiveTab('assignments')}
                            className="px-3 py-1.5 text-[10px] font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> Assignments
                          </button>
                          <button onClick={() => setActiveTab('grades')}
                            className="px-3 py-1.5 text-[10px] font-medium rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors flex items-center gap-1">
                            <Award className="w-3 h-3" /> Performance
                          </button>
                          <button onClick={() => setExpandedClass(isExpanded ? null : c.id)}
                            className="px-3 py-1.5 text-[10px] font-medium rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Details
                          </button>
                        </div>
                      </div>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="px-5 pb-5 pt-0 border-t border-gray-100">
                              <div className="pt-4">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  <div className="p-3 rounded-xl bg-gray-50">
                                    <div className="text-[9px] text-gray-500 mb-1">Student List</div>
                                    <div className="space-y-1">
                                      {effectiveStudents.slice(0, 4).map((s: any, si: number) => (
                                        <div key={si} className="flex items-center gap-2 text-[10px] text-gray-700">
                                          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white text-[5px] font-bold">
                                            {(s.name || s.full_name || 'S').charAt(0)}
                                          </div>
                                          <span className="truncate flex-1">{s.name || s.full_name}</span>
                                          <span className="font-semibold" style={{ color: getGradeColor(s.grade || 'B') }}>{s.grade || 'B'}</span>
                                        </div>
                                      ))}
                                      <button className="text-[9px] text-[#7C3AED] font-medium hover:underline mt-1">View all →</button>
                                    </div>
                                  </div>
                                  <div className="p-3 rounded-xl bg-gray-50">
                                    <div className="text-[9px] text-gray-500 mb-2">Class Statistics</div>
                                    {[
                                      { label: 'Total Students', value: String(studentCount) },
                                      { label: 'Avg Attendance', value: `${att}%` },
                                      { label: 'Class Strength', value: `Section ${section}` },
                                      { label: 'Subject Hours', value: '6 hrs/week' },
                                    ].map((st, si) => (
                                      <div key={si} className="flex items-center justify-between text-[10px] py-1">
                                        <span className="text-gray-500">{st.label}</span>
                                        <span className="font-semibold text-gray-700">{st.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
                {filteredClasses.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
                    <School className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                    <p className="text-sm text-gray-400">No classes match your search</p>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Student Performance Overview */}
            <SectionCard title="Student Performance Overview" subtitle="Attendance, completion & engagement metrics">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center">
                  <div className="relative mb-2">
                    <svg width="72" height="72" className="transform -rotate-90">
                      <circle cx="36" cy="36" r="30" fill="none" stroke="#E5E7EB" strokeWidth="5" />
                      <motion.circle cx="36" cy="36" r="30" fill="none" stroke="#7C3AED" strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 30} strokeDashoffset={2 * Math.PI * 30 * (1 - attendanceAvg / 100)}
                        animate={{ strokeDashoffset: 2 * Math.PI * 30 * (1 - attendanceAvg / 100) }}
                        transition={{ duration: 1.5, ease: 'easeOut' }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-extrabold text-gray-900">{attendanceAvg}%</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">Attendance</span>
                  <span className="text-[9px] text-green-600 font-medium">▲ +2% this month</span>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-[#7C3AED]" /><span className="text-xs font-semibold text-gray-700">Assignment Completion</span></div>
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <svg width="80" height="80" className="transform -rotate-90">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#E5E7EB" strokeWidth="5" />
                      <motion.circle cx="40" cy="40" r="34" fill="none" stroke="#10B981" strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 34} strokeDashoffset={2 * Math.PI * 34 * (1 - completionRate / 100)}
                        animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - completionRate / 100) }}
                        transition={{ duration: 1.5, ease: 'easeOut' }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center"><span className="text-base font-extrabold text-gray-900">{completionRate}%</span></div>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-green-600 font-medium">▲ +5% improvement</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2"><Activity className="w-4 h-4 text-[#7C3AED]" /><span className="text-xs font-semibold text-gray-700">Student Engagement</span></div>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[]}>
                        <defs><linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED" stopOpacity={0.3} /><stop offset="100%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient></defs>
                        <Area type="monotone" dataKey="engagement" stroke="#7C3AED" strokeWidth={2} fill="url(#engGrad)" dot={{ r: 2, fill: '#7C3AED' }} />
                        <XAxis dataKey="day" tick={{ fontSize: 8, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-between text-[10px] mt-1">
                    <span className="text-gray-500">Weekly Engagement</span>
                    <span className="font-semibold text-[#7C3AED]">+8%</span>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Recent Activities */}
            <SectionCard title="Recent Activities" subtitle="Latest actions & updates">
              <p className="text-xs text-gray-400">No recent activities</p>
            </SectionCard>
          </div>

          {/* RIGHT 30% */}
          <div className="lg:col-span-4 space-y-4">

            {/* Today's Schedule */}
            <SectionCard title="Today's Schedule" subtitle="Your daily timetable">
              <div className="space-y-0 relative">
                {effectiveTimetable.map((slot: any, i: number) => (
                  <div key={i} className="relative pl-7 pb-4 last:pb-0">
                    <div className="absolute left-[7px] top-1 bottom-0 w-0.5 bg-gray-100 last:hidden" />
                    <div className="absolute left-0 top-1 w-[14px] h-[14px] rounded-full border-2 flex items-center justify-center" style={{ borderColor: i === 0 ? '#7C3AED' : '#E5E7EB', background: i === 0 ? '#F3F0FF' : 'white' }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: i === 0 ? '#7C3AED' : '#D1D5DB' }} />
                    </div>
                    <div className={`p-2.5 rounded-xl ${i === 0 ? 'bg-[#F3F0FF] border border-[#7C3AED]/10' : 'hover:bg-gray-50'} transition-all`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-gray-900">{slot.subject || slot.subject_name}</span>
                        <span className="text-[9px] font-medium text-[#7C3AED]">{slot.time || slot.start_time?.slice(0, 5)}</span>
                      </div>
                      <div className="text-[9px] text-gray-500">
                        {slot.class_name && <span>{slot.class_name} • </span>}
                        {slot.room || slot.room_number || '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 py-2 rounded-xl bg-[#F3F0FF] text-[#7C3AED] text-xs font-medium hover:bg-[#EBE6FF] transition-all flex items-center justify-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> View Full Schedule
              </button>
            </SectionCard>

            {/* Upcoming Tasks */}
            <SectionCard title="Upcoming Tasks" subtitle="Your to-do list">
              <p className="text-xs text-gray-400">No upcoming tasks</p>
              <button className="w-full mt-3 py-2 rounded-xl border border-dashed border-gray-200 text-[10px] text-gray-400 hover:border-[#7C3AED] hover:text-[#7C3AED] transition-all flex items-center justify-center gap-1">
                <Plus className="w-3 h-3" /> Add New Task
              </button>
            </SectionCard>

            {/* Prerana AI Assistant */}
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
                    <div className="text-[8px] text-purple-200">Hello Sarah 👋 How can I help you today?</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {[
                    { label: 'Generate Assignment', icon: BookOpen },
                    { label: 'Create Quiz', icon: HelpCircle },
                    { label: 'Lesson Plan', icon: FileText },
                    { label: 'Analyze Performance', icon: BarChart3 },
                    { label: 'Draft Announcement', icon: Bell },
                    { label: 'Exam Questions', icon: FileText },
                  ].slice(0, 4).map((sugg, si) => (
                    <button key={si} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white/10 border border-white/10 text-[10px] text-white hover:bg-white/20 transition-all">
                      <sugg.icon className="w-3 h-3 text-purple-200" /> {sugg.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input type="text" placeholder="Ask Prerana AI anything..."
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-purple-200/50 outline-none focus:border-white/40 transition-all" />
                    <Send className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-200 cursor-pointer hover:text-white" />
                  </div>
                  <button className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center hover:bg-white/25 transition-all">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ===== MY CLASSES TAB ===== */}
      {selectedTab === 'classes' && (
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search classes by name, subject or section..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-[#7C3AED] focus:ring-3 focus:ring-[rgba(124,58,237,0.1)] transition-all placeholder:text-gray-400" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-400" /></button>}
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"><Filter className="w-4 h-4" /></button>
              <button className="px-4 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white rounded-xl text-xs font-medium hover:shadow-lg transition-all flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Class
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClasses.map((c: any, i: number) => {
              const name = c.class?.class_name || c.class_name || 'Class';
              const section = c.class?.section || c.section || 'A';
              const subject = c.subject?.name || c.subject || 'Subject';
              const studentCount = c.students || 0;
              const att = c.attendance || 94;
              return (
                <motion.div key={c.id || i} whileHover={{ y: -3 }}
                  className="rounded-2xl bg-white border border-gray-100 p-5 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ background: [PCOLORS.primary, PCOLORS.success, PCOLORS.warning, PCOLORS.info][i % 4] }}>
                        {name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{name} <span className="text-gray-400 font-medium">{section}</span></h3>
                        <div className="text-xs text-gray-500">{subject}</div>
                      </div>
                    </div>
                    <Badge className="bg-green-50 text-green-600 border-green-200">Active</Badge>
                  </div>
                  <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {studentCount} Students</span>
                    <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> {att}%</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {c.room || 'Room —'}</span>
                  </div>
                  <Progress value={att} className="mb-3" />
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button onClick={() => setActiveTab('attendance')} className="flex-1 py-2 rounded-lg bg-[#F3F0FF] text-[#7C3AED] text-xs font-medium hover:bg-[#EBE6FF] transition-all">Attendance</button>
                    <button onClick={() => setActiveTab('assignments')} className="flex-1 py-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-all">Assignments</button>
                    <button onClick={() => setActiveTab('grades')} className="flex-1 py-2 rounded-lg bg-amber-50 text-amber-600 text-xs font-medium hover:bg-amber-100 transition-all">Grades</button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ===== ANALYTICS TAB ===== */}
      {selectedTab === 'analytics' && (
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Classes', value: activeClasses, icon: School, color: '#7C3AED', change: '+2 this sem' },
              { label: 'Total Students', value: totalStudents, icon: Users, color: '#10B981', change: '+12 new' },
              { label: 'Avg Attendance', value: `${attendanceAvg}%`, icon: TrendingUp, color: '#3B82F6', change: '+3% improvement' },
              { label: 'Completion Rate', value: `${completionRate}%`, icon: Target, color: '#F59E0B', change: '+5% this month' },
            ].map((m, i) => (
              <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${m.color}10` }}>
                    <m.icon className="w-5 h-5" style={{ color: m.color }} />
                  </div>
                  <div className="text-lg font-extrabold text-gray-900">{m.value}</div>
                </div>
                <div className="text-[10px] text-gray-500">{m.label}</div>
                <div className="text-[9px] font-medium mt-0.5" style={{ color: m.color }}>{m.change}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Weekly Student Engagement" subtitle="Daily engagement & attendance trends">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[]} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                    <Bar dataKey="engagement" name="Engagement %" radius={[6, 6, 0, 0]} fill="#7C3AED" />
                    <Bar dataKey="attendance" name="Attendance %" radius={[6, 6, 0, 0]} fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title="Grade Distribution" subtitle="Student performance breakdown">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[
                      { name: 'A Grade', value: 35, color: '#7C3AED' },
                      { name: 'B Grade', value: 30, color: '#8B5CF6' },
                      { name: 'C Grade', value: 20, color: '#10B981' },
                      { name: 'D Grade', value: 10, color: '#F59E0B' },
                      { name: 'F Grade', value: 5, color: '#EF4444' },
                    ]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {PIE_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['A', 'B', 'C', 'D', 'F'].map((g, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[9px]">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-gray-500">{g} Grade</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Top Performing Students" subtitle="Students with highest overall performance">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Student</th>
                    <th className="text-left py-2.5 px-3 text-gray-500 font-medium">Class</th>
                    <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Grade</th>
                    <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Attendance</th>
                    <th className="text-center py-2.5 px-3 text-gray-500 font-medium">Performance</th>
                    <th className="text-right py-2.5 px-3 text-gray-500 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {effectiveStudents.map((s: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white text-[7px] font-bold">
                            {(s.name || s.full_name || 'S').charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{s.name || s.full_name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-gray-500">{s.class || s.class_name || '—'}</td>
                      <td className="py-2.5 px-3 text-center"><span className="font-bold" style={{ color: getGradeColor(s.grade || 'B') }}>{s.grade || 'B'}</span></td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-12 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${s.attendance || 90}%`, background: 'linear-gradient(90deg, #7C3AED, #6366F1)' }} />
                          </div>
                          <span className="text-[9px] font-medium text-gray-500">{s.attendance || 90}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge variant={(s.grade || 'B')?.startsWith('A') ? 'default' : (s.grade || 'B')?.startsWith('B') ? 'secondary' : 'destructive'} className="text-[8px]">
                          {(s.grade || 'B')?.startsWith('A') ? 'Excellent' : (s.grade || 'B')?.startsWith('B') ? 'Good' : 'Needs Improvement'}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button className="px-2.5 py-1 rounded-lg bg-[#F3F0FF] text-[#7C3AED] text-[9px] font-medium hover:bg-[#EBE6FF] transition-colors">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </motion.div>
      )}

    </motion.div>
  );
}
