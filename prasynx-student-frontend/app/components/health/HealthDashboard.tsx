'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, ChevronLeft, ChevronRight,
  Download, Clock, CheckCircle2, AlertCircle, Award, Star,
  TrendingUp, FileText, Brain, Lightbulb, CalendarDays, X, Mic,
  Target, Timer, ChevronDown, Calendar, MapPin, Users, Trophy,
  Zap, Gift, BookOpen, Flag, Camera, Medal, Flame, Heart,
  User, ArrowRight, Link, ExternalLink, Activity, Stethoscope, Syringe,
  Pill, Droplets, Thermometer, ShieldPlus, Smile, Frown, Meh,
  BedDouble, PhoneCall, Clock12,
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
  useEffect(() => {
    let start = 0;
    const inc = value / (duration * 60);
    const interval = setInterval(() => {
      start += inc;
      if (start >= value) { setCount(value); clearInterval(interval); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(interval);
  }, [value, duration]);
  return <span>{count}{suffix}</span>;
}



const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

interface HealthDashboardProps {
  healthHook: any;
  healthData: any;
}

export function HealthDashboard({ healthHook, healthData }: HealthDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Records');
  const [showInsights, setShowInsights] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [moodScore, setMoodScore] = useState(5);
  const [moodNote, setMoodNote] = useState('');
  const [viewMode, setViewMode] = useState<'overview' | 'records' | 'checkups' | 'medications'>('overview');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const filters = ['All Records', 'Checkups', 'Vaccinations', 'Medications', 'Mood Logs', 'Reports', 'Emergency'];

  const effective = useMemo(() => healthData || {}, [healthData]);

  const checkups = useMemo(() => {
    let list = effective.checkups || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e: any) =>
        (e.checkup_type || '').toLowerCase().includes(q) ||
        (e.notes || '').toLowerCase().includes(q) ||
        (e.status || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [effective.checkups, searchQuery]);

  const records = useMemo(() => {
    let list = effective.medicalRecords || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e: any) =>
        (e.title || '').toLowerCase().includes(q) ||
        (e.record_type || '').toLowerCase().includes(q) ||
        (e.doctor || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [effective.medicalRecords, searchQuery]);

  const vaccinations = useMemo(() => {
    let list = effective.vaccinations || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e: any) =>
        (e.vaccine_name || '').toLowerCase().includes(q) ||
        (e.administered_by || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [effective.vaccinations, searchQuery]);

  const medications = useMemo(() => {
    let list = effective.medications || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e: any) =>
        (e.medication_name || '').toLowerCase().includes(q) ||
        (e.dosage || '').toLowerCase().includes(q) ||
        (e.notes || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [effective.medications, searchQuery]);

  const moodLogs = useMemo(() => {
    let list = effective.moodLogs || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e: any) =>
        (e.notes || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [effective.moodLogs, searchQuery]);

  const avgMood = useMemo(() => {
    if (!effective.moodLogs || effective.moodLogs.length === 0) return 7;
    return Math.round((effective.moodLogs.reduce((s: number, m: any) => s + (m.mood_score || 0), 0) / effective.moodLogs.length) * 10) / 10;
  }, [effective.moodLogs]);

  const upcomingCheckups = useMemo(() => {
    return (effective.checkups || [])
      .filter((c: any) => c.status === 'scheduled')
      .sort((a: any, b: any) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime());
  }, [effective.checkups]);

  const calendarDays = useMemo(() => {
    const totalDays = daysInMonth(calendarMonth, calendarYear);
    const firstDay = firstDayOfMonth(calendarMonth, calendarYear);
    const days: any[] = [];
    for (let i = 0; i < firstDay; i++) days.push({ date: 0, events: [], isToday: false });
    const today = new Date();
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dateObj = new Date(calendarYear, calendarMonth, d);
      const dayCheckups = (effective.checkups || []).filter((c: any) => {
        if (!c.scheduled_date) return false;
        const cd = c.scheduled_date.slice(0, 10);
        return cd === dateStr;
      });
      const dayVaccinations = (effective.vaccinations || []).filter((v: any) => {
        if (!v.administered_date) return false;
        const vd = v.administered_date.slice(0, 10);
        return vd === dateStr;
      });
      days.push({
        date: d,
        checkups: dayCheckups,
        vaccinations: dayVaccinations,
        events: [...dayCheckups, ...dayVaccinations],
        isToday: d === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear(),
        isPast: dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      });
    }
    return days;
  }, [calendarMonth, calendarYear, effective.checkups, effective.vaccinations]);

  const moodChartData = useMemo(() => {
    if (!effective.moodLogs || effective.moodLogs.length === 0) return [];
    const sorted = [...effective.moodLogs].sort((a: any, b: any) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
    return sorted.slice(-7).map((m: any) => ({
      day: new Date(m.logged_at).toLocaleDateString('en', { weekday: 'short' }),
      mood: m.mood_score || 0,
    }));
  }, [effective.moodLogs]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {
      Checkups: effective.checkups?.length || 0,
      Vaccinations: effective.vaccinations?.length || 0,
      Records: effective.medicalRecords?.length || 0,
      'Mood Logs': effective.moodLogs?.length || 0,
      Medications: effective.medications?.length || 0,
    };
    return Object.entries(map).map(([name, value], i) => ({
      name, value, color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [effective]);

  const getActiveContent = () => {
    switch (activeFilter) {
      case 'Checkups': return { items: checkups, type: 'checkups' };
      case 'Vaccinations': return { items: vaccinations, type: 'vaccinations' };
      case 'Medications': return { items: medications, type: 'medications' };
      case 'Mood Logs': return { items: moodLogs, type: 'moodLogs' };
      case 'Reports': return { items: records, type: 'records' };
      case 'Emergency': return { items: effective.emergencyContacts || [], type: 'emergency' };
      default: return { items: [...checkups, ...vaccinations, ...medications], type: 'all' };
    }
  };

  const SectionCard = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );

  const daysLeft = (date: string) => Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const wellnessScore = useMemo(() => {
    const hasCheckups = (effective.checkups?.length || 0) > 0;
    const hasVax = (effective.vaccinations?.length || 0) > 0;
    const hasMeds = (effective.medications?.length || 0) > 0;
    const hasMood = (effective.moodLogs?.length || 0) > 0;
    const hasRecords = (effective.medicalRecords?.length || 0) > 0;
    const score = (hasCheckups ? 20 : 0) + (hasVax ? 20 : 0) + (hasMeds ? 20 : 0) + (hasMood ? 20 : 0) + (hasRecords ? 20 : 0);
    return score;
  }, [effective]);

  const getMoodEmoji = (score: number) => {
    if (score >= 8) return '😊';
    if (score >= 5) return '🙂';
    return '😐';
  };

  if (healthHook?.loading) {
    return (
      <div className="space-y-6">
        <div className="page-header"><h1>Health & Wellness</h1><p>Loading your health data...</p></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-gray-100 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
              <div className="h-7 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-6 animate-pulse">
              <div className="h-40 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (healthHook?.error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load health data</h2>
        <p className="text-gray-500 mb-6">{healthHook.error}</p>
        <div className="flex gap-3">
          <button onClick={healthHook.refetch} className="px-6 py-2.5 bg-[#6D4CFF] text-white rounded-xl font-medium hover:bg-[#5A3FD6] transition-colors">Refresh Data</button>
          <button className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">Contact Health Center</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Health & Wellness Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Track medical records, vaccinations, mood, checkups, and wellness goals — all in one place.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="px-4 py-2 text-xs font-medium text-[#6D4CFF] bg-[#F3F0FF] rounded-xl hover:bg-[#EBE6FF] transition-all flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> My Calendar
          </button>
          <button className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] rounded-xl shadow-[0_4px_14px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_20px_rgba(109,76,255,0.4)] transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Records
          </button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Wellness Score Ring */}
        <Card className="lg:col-span-1 p-6 flex flex-col items-center justify-center">
          <div className="relative w-28 h-28 mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#F3F0FF" strokeWidth="10" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#6D4CFF" strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - wellnessScore / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-[#6D4CFF]">{wellnessScore}%</span>
              <span className="text-[9px] text-gray-400 font-medium">Wellness</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">Your overall wellness score based on health records completeness</p>
        </Card>

        {/* KPI Cards */}
        {[
          { label: 'Checkups', value: effective.checkups?.length || 0, sub: `${upcomingCheckups.length} upcoming`, icon: Stethoscope, color: COLORS.primary, bg: '#F3F0FF' },
          { label: 'Vaccinations', value: effective.vaccinations?.length || 0, sub: 'Up to date', icon: Syringe, color: COLORS.success, bg: '#F0FDF4' },
          { label: 'Avg Mood', value: avgMood, sub: '/10 this week', icon: Smile, color: COLORS.warning, bg: '#FFFBEB', isDecimal: true },
          { label: 'Medications', value: effective.medications?.length || 0, sub: 'Active prescriptions', icon: Pill, color: COLORS.danger, bg: '#FEF2F2' },
          { label: 'Medical Records', value: effective.medicalRecords?.length || 0, sub: 'On file', icon: FileText, color: COLORS.info, bg: '#EFF6FF' },
          { label: 'Emergency Contacts', value: effective.emergencyContacts?.length || 0, sub: 'On record', icon: PhoneCall, color: COLORS.warning, bg: '#FFF7ED' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="p-5">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                   style={{ background: s.bg, color: s.color }}>
                <Icon size={20} />
              </div>
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              <div className="text-2xl font-extrabold text-gray-900 mt-0.5">
                {s.isDecimal ? <span>{s.value}</span> : <CounterAnimation value={s.value} />}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">{s.sub}</div>
            </Card>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-2.5">
        {[
          { label: 'Log Mood', icon: Smile, color: '#6D4CFF' },
          { label: 'Schedule Checkup', icon: Calendar, color: '#22C55E' },
          { label: 'Add Medication', icon: Pill, color: '#3B82F6' },
          { label: 'Book Appointment', icon: Stethoscope, color: '#F59E0B' },
          { label: 'Emergency Contact', icon: PhoneCall, color: '#EF4444' },
          { label: 'Health Report', icon: FileText, color: '#8B5CF6' },
        ].map((a, i) => {
          const Icon = a.icon;
          return (
            <button key={i}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all hover:shadow-md active:scale-95"
              style={{ background: `${a.color}12`, color: a.color }}
            >
              <Icon size={14} /> {a.label}
            </button>
          );
        })}
      </motion.div>

      {/* View Tabs */}
      <motion.div variants={fadeUp} className="flex gap-2 flex-wrap border-b border-gray-100 pb-3">
        {['overview', 'records', 'checkups', 'medications'].map((v) => (
          <button key={v} onClick={() => setViewMode(v as any)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
              viewMode === v ? 'bg-[#6D4CFF] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >{v === 'overview' ? 'Overview' : v}</button>
        ))}
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search health records, checkups, medications..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:border-[#6D4CFF] transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            ><X size={14} /></button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                activeFilter === f ? 'bg-[#6D4CFF] text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >{f}</button>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      {viewMode === 'overview' && (
        <>
          {/* 70/30 Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column (70%) */}
            <div className="lg:col-span-8 space-y-6">

              {/* Medical Records & Upcoming Checkups */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SectionCard title="Medical Records" subtitle={`${effective.medicalRecords?.length || 0} records on file`}>
                  {effective.medicalRecords && effective.medicalRecords.length > 0 ? (
                    <div className="space-y-2">
                      {effective.medicalRecords.slice(0, 5).map((r: any, i: number) => (
                        <div key={i}
                          className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-all"
                          onClick={() => setSelectedRecord(selectedRecord?.id === r.id ? null : r)}
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-200 flex-shrink-0">
                            <FileText size={14} className="text-[#6D4CFF]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-900 truncate">{r.title || r.record_type}</div>
                            <div className="text-[10px] text-gray-400 truncate">
                              {r.doctor ? `${r.doctor} • ` : ''}{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                            </div>
                          </div>
                          <Badge variant="success" className="text-[9px]">{r.status || 'Completed'}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">No medical records yet</p>
                    </div>
                  )}
                </SectionCard>

                <SectionCard title="Upcoming Checkups" subtitle={`${upcomingCheckups.length} scheduled`}>
                  {upcomingCheckups.length > 0 ? (
                    <div className="space-y-2">
                      {upcomingCheckups.map((c: any, i: number) => {
                        const dl = daysLeft(c.scheduled_date);
                        return (
                          <div key={i}
                            className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-200 flex-shrink-0"
                              style={{ color: dl <= 7 ? COLORS.danger : dl <= 14 ? COLORS.warning : COLORS.primary }}>
                              <Stethoscope size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-gray-900">{c.checkup_type}</div>
                              <div className="text-[10px] text-gray-400">
                                {new Date(c.scheduled_date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                            <Badge variant={dl <= 7 ? 'danger' : dl <= 14 ? 'warning' : 'success'} className="text-[9px] whitespace-nowrap">
                              {dl <= 0 ? 'Today!' : `${dl}d left`}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">No upcoming checkups</p>
                    </div>
                  )}
                </SectionCard>
              </div>

              {/* Current Medications */}
              <SectionCard title="Current Medications" subtitle={`${effective.medications?.length || 0} active prescriptions`}>
                {effective.medications && effective.medications.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {effective.medications.map((m: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-200 flex-shrink-0"
                          style={{ color: COLORS.danger }}>
                          <Pill size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-900">{m.medication_name}</div>
                          <div className="text-[10px] text-gray-400">{m.dosage}</div>
                          {m.notes && <div className="text-[9px] text-gray-400 mt-0.5">{m.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Pill className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No active medications</p>
                  </div>
                )}
              </SectionCard>

              {/* Vaccination History */}
              <SectionCard title="Vaccination History" subtitle={`${effective.vaccinations?.length || 0} vaccines recorded`}>
                {effective.vaccinations && effective.vaccinations.length > 0 ? (
                  <div className="space-y-2">
                    {effective.vaccinations.map((v: any, i: number) => {
                      const isBoosterDue = v.booster_required && v.booster_due && daysLeft(v.booster_due) <= 30;
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-200 flex-shrink-0"
                            style={{ color: isBoosterDue ? COLORS.warning : COLORS.success }}>
                            <Syringe size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-900">{v.vaccine_name}</div>
                            <div className="text-[10px] text-gray-400">
                              {v.administered_date ? new Date(v.administered_date).toLocaleDateString() : ''}
                              {v.administered_by ? ` • ${v.administered_by}` : ''}
                            </div>
                          </div>
                          {isBoosterDue ? (
                            <Badge variant="warning" className="text-[9px]">Booster Due</Badge>
                          ) : (
                            <Badge variant="success" className="text-[9px]">Completed</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Syringe className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No vaccination records</p>
                  </div>
                )}
              </SectionCard>

              {/* Health Calendar */}
              <SectionCard title="Health Calendar" subtitle="Checkups, vaccinations and appointments">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); } else setCalendarMonth(calendarMonth - 1); }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-all"><ChevronLeft size={16} /></button>
                    <span className="text-xs font-bold text-gray-700">{months[calendarMonth]} {calendarYear}</span>
                    <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); } else setCalendarMonth(calendarMonth + 1); }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-all"><ChevronRight size={16} /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                      <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
                    ))}
                    {calendarDays.map((day: any, i: number) => (
                      <div key={i}
                        className={`relative text-center py-2 rounded-lg text-[11px] font-medium transition-all ${
                          day.date === 0 ? 'invisible' : ''
                        } ${
                          day.isToday ? 'bg-[#6D4CFF] text-white shadow-sm' : ''
                        } ${
                          !day.isToday && day.isPast ? 'text-gray-300' : ''
                        } ${
                          !day.isToday && !day.isPast && day.date > 0 ? 'text-gray-700 hover:bg-gray-50' : ''
                        } ${day.events.length > 0 && !day.isToday ? 'ring-1 ring-[#6D4CFF]/30' : ''}`}
                      >
                        {day.date > 0 ? day.date : ''}
                        {day.events.length > 0 && !day.isToday && (
                          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                            {day.checkups?.length > 0 && <div className="w-1 h-1 rounded-full bg-[#6D4CFF]" />}
                            {day.vaccinations?.length > 0 && <div className="w-1 h-1 rounded-full bg-[#22C55E]" />}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#6D4CFF]" />
                      <span className="text-[10px] text-gray-500">Checkup</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                      <span className="text-[10px] text-gray-500">Vaccination</span>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* COVID Tracking */}
              <SectionCard title="COVID-19 Tracking" subtitle="Your COVID health records">
                {effective.covidTracking && effective.covidTracking.length > 0 ? (
                  <div className="space-y-3">
                    {effective.covidTracking.map((c: any, i: number) => (
                      <div key={i} className={`p-4 rounded-xl border ${
                        c.status === 'resolved' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            c.status === 'resolved' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            <ShieldPlus size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900">COVID Case</span>
                              <Badge variant={c.status === 'resolved' ? 'success' : 'warning'} className="text-[9px]">
                                {c.status === 'resolved' ? 'Resolved' : 'Active'}
                              </Badge>
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              Reported: {new Date(c.reported_date).toLocaleDateString()}
                              {c.symptoms ? ` • Symptoms: ${c.symptoms}` : ''}
                            </div>
                            {c.isolation_start && (
                              <div className="text-[10px] text-gray-400">
                                Isolation: {new Date(c.isolation_start).toLocaleDateString()}
                                {c.isolation_end ? ` → ${new Date(c.isolation_end).toLocaleDateString()}` : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50 border border-green-200">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100 text-green-600">
                      <ShieldPlus size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">No COVID Cases</div>
                      <div className="text-[10px] text-gray-500">No COVID-19 cases reported in your records</div>
                    </div>
                    <Badge variant="success" className="text-[9px] ml-auto">All Clear</Badge>
                  </div>
                )}
              </SectionCard>

            </div>

            {/* Right Column (30%) */}
            <div className="lg:col-span-4 space-y-6">

              {/* Toggle Insights */}
              <button onClick={() => setShowInsights(!showInsights)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F3F0FF] border border-[#6D4CFF]/10">
                <div className="flex items-center gap-2">
                  <Brain size={16} className="text-[#6D4CFF]" />
                  <span className="text-xs font-semibold text-[#6D4CFF]">Prerana AI Insights</span>
                </div>
                <ChevronDown size={14} className={`text-[#6D4CFF] transition-transform duration-200 ${showInsights ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showInsights && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6 overflow-hidden">

                    {/* Mood & Wellness Tracker */}
                    <SectionCard title="Mood & Wellness" subtitle="How are you feeling today?">
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-2">{getMoodEmoji(moodScore)}</div>
                        <div className="flex items-center justify-center gap-1 mb-3">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                            <button key={n} onClick={() => setMoodScore(n)}
                              className={`w-6 h-6 rounded-lg text-[9px] font-bold transition-all ${
                                n <= moodScore
                                  ? 'bg-gradient-to-br from-[#6D4CFF] to-[#8B6FFF] text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                            >{n}</button>
                          ))}
                        </div>
                        <input type="text" value={moodNote} onChange={e => setMoodNote(e.target.value)}
                          placeholder="How are you feeling?"
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs outline-none focus:border-[#6D4CFF] transition-all"
                        />
                        <button
                          className="mt-2.5 w-full py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B6FFF] text-white text-xs font-semibold hover:shadow-lg transition-all active:scale-[0.98]"
                          onClick={() => {
                            setMoodNote('');
                            setMoodScore(5);
                          }}
                        >Log Mood</button>
                      </div>

                      {moodChartData.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="text-[11px] font-semibold text-gray-600 mb-3">Mood Trend (7 days)</div>
                          <ResponsiveContainer width="100%" height={120}>
                            <AreaChart data={moodChartData}>
                              <defs>
                                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#6D4CFF" stopOpacity={0.2} />
                                  <stop offset="100%" stopColor="#6D4CFF" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="mood" stroke="#6D4CFF" strokeWidth={2} fill="url(#moodGradient)" dot={{ r: 3, fill: '#6D4CFF' }} />
                              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                              <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                              <Tooltip
                                contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 11 }}
                                itemStyle={{ color: '#6D4CFF' }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </SectionCard>

                    {/* Emergency Contacts */}
                    <SectionCard title="Emergency Contacts" subtitle="Quick access to important numbers">
                      {effective.emergencyContacts && effective.emergencyContacts.length > 0 ? (
                        <div className="space-y-2">
                          {effective.emergencyContacts.map((c: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                                i === 0 ? 'bg-red-500' : i === 1 ? 'bg-[#6D4CFF]' : 'bg-gray-500'
                              }`}>
                                {c.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-gray-900">{c.name}</div>
                                <div className="text-[10px] text-gray-400">{c.relationship}</div>
                                {c.phone && <div className="text-[10px] text-[#6D4CFF] font-medium">{c.phone}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <PhoneCall className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">No emergency contacts</p>
                        </div>
                      )}
                    </SectionCard>

                  </motion.div>
                )}
              </AnimatePresence>

              {/* Category Distribution */}
              <SectionCard title="Records Overview" subtitle="Distribution by category">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {categoryData.filter(d => d.value > 0).map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      <span className="text-[10px] text-gray-500">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </SectionCard>

            </div>
          </div>
        </>
      )}

      {/* View: Records */}
      {viewMode === 'records' && (
        <SectionCard title="All Medical Records" subtitle="Complete health records history">
          {records.length > 0 ? (
            <div className="space-y-2">
              {records.map((r: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-gray-200"
                    style={{ color: COLORS.primary }}>
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900">{r.title || r.record_type}</div>
                    <div className="text-xs text-gray-400">
                      {r.record_type} • {r.doctor || ''} • {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                    </div>
                    {r.description && <div className="text-[11px] text-gray-500 mt-1">{r.description}</div>}
                    {r.value && <Badge variant="success" className="text-[9px] mt-1">{r.value}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No medical records found</p>
            </div>
          )}
        </SectionCard>
      )}

      {/* View: Checkups */}
      {viewMode === 'checkups' && (
        <SectionCard title="Checkup Schedule" subtitle="All scheduled and completed checkups">
          {checkups.length > 0 ? (
            <div className="space-y-2">
              {checkups.map((c: any, i: number) => {
                const dl = daysLeft(c.scheduled_date);
                return (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      c.status === 'completed' ? 'bg-green-100 text-green-600' : dl <= 0 ? 'bg-red-100 text-red-600' : 'bg-[#F3F0FF] text-[#6D4CFF]'
                    }`}>
                      <Stethoscope size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">{c.checkup_type}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(c.scheduled_date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      {c.notes && <div className="text-[11px] text-gray-500 mt-1">{c.notes}</div>}
                    </div>
                    <Badge variant={c.status === 'completed' ? 'success' : dl <= 0 ? 'danger' : 'warning'} className="text-[10px]">
                      {c.status === 'completed' ? 'Completed' : dl <= 0 ? 'Overdue' : `${dl}d left`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No checkups scheduled</p>
            </div>
          )}
        </SectionCard>
      )}

      {/* View: Medications */}
      {viewMode === 'medications' && (
        <SectionCard title="Medications" subtitle="Current and past medications">
          {medications.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {medications.map((m: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-gray-200"
                      style={{ color: COLORS.danger }}>
                      <Pill size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900">{m.medication_name}</div>
                      <div className="text-[10px] text-gray-400">{m.dosage}</div>
                    </div>
                  </div>
                  {m.notes && <div className="text-[10px] text-gray-500 border-t border-gray-200 pt-2 mt-2">{m.notes}</div>}
                  <div className="text-[9px] text-gray-400 mt-1">
                    {m.administered_by ? `By: ${m.administered_by}` : ''}
                    {m.administered_at ? ` • ${new Date(m.administered_at).toLocaleDateString()}` : ''}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Pill className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No medications prescribed</p>
            </div>
          )}
        </SectionCard>
      )}

      {/* Record Detail Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedRecord(null)}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">{selectedRecord.title || selectedRecord.record_type}</h3>
                <button onClick={() => setSelectedRecord(null)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {selectedRecord.record_type && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Type</span>
                    <span className="font-semibold text-gray-900">{selectedRecord.record_type}</span>
                  </div>
                )}
                {selectedRecord.doctor && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Doctor</span>
                    <span className="font-semibold text-gray-900">{selectedRecord.doctor}</span>
                  </div>
                )}
                {selectedRecord.created_at && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Date</span>
                    <span className="font-semibold text-gray-900">{new Date(selectedRecord.created_at).toLocaleDateString()}</span>
                  </div>
                )}
                {selectedRecord.description && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-[11px] text-gray-500 mb-1">Description</div>
                    <div className="text-xs text-gray-900">{selectedRecord.description}</div>
                  </div>
                )}
                {selectedRecord.value && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-[11px] text-gray-500 mb-1">Result</div>
                    <Badge variant="success" className="text-[10px]">{selectedRecord.value}</Badge>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
