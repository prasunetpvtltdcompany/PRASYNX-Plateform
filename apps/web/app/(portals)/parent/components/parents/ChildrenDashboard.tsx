'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  School, Users, BookOpen, ClipboardList, TrendingUp, Clock, CheckCircle2,
  AlertCircle, Award, Bell, Plus, CalendarDays, Target, Star, Sparkles,
  ChevronRight, Download, MessageSquare, FileText, BarChart3, ArrowUpRight,
  Search, X, User, GraduationCap, Lightbulb, Zap, Play, Video,
  Mail, Phone, MapPin, Settings, Eye, Edit3, Filter, MoreHorizontal,
  LayoutDashboard, LineChart, PieChart as PieChartIcon, Activity,
  Gift, HelpCircle, Moon, Sun, Globe, CreditCard, BookMarked, Send,
  Heart, Shield, Clock as ClockIcon, AlertTriangle, CheckCircle,
  DollarSign, Calendar, CalendarCheck, Bus,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart as ReLineChart, Line,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '../ui/button';

const PCOLORS = { primary: '#6D4CFF', secondary: '#8B5CF6', tertiary: '#6366F1', success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };
const PIE_COLORS = ['#6D4CFF', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];
const GRADE_COLORS: Record<string, string> = { 'A+': '#10B981', 'A': '#10B981', 'A-': '#34D399', 'B+': '#6D4CFF', 'B': '#8B5CF6', 'B-': '#6366F1', 'C+': '#F59E0B', 'C': '#F59E0B', 'D': '#EF4444', 'F': '#EF4444' };

interface ChildrenDashboardProps {
  children: any[];
  selectedChild: any;
  setSelectedChild: (c: any) => void;
  setActiveTab: (tab: string) => void;
  searchQuery?: string;
  attendance?: any;
  attendanceRate?: number;
  assignments: any[];
  teachers: any[];
  examData?: any;
  perfData?: any;
  transportInfo?: any;
  healthData?: any;
  vaccinations?: any[];
  feesSummary?: any;
  feesDue?: number;
  notifArray?: any[];
  announcements?: any[];
  emergencyContacts?: any[];
  childrenHook?: { loading?: boolean; error?: string | null };
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const aiQuickActions = [
  { icon: TrendingUp, label: 'Performance Analysis', desc: 'Analyze academic trends', color: '#6D4CFF' },
  { icon: BookOpen, label: 'Homework Guidance', desc: 'Get help with homework', color: '#3B82F6' },
  { icon: ClipboardList, label: 'Exam Tips', desc: 'Preparation strategies', color: '#F59E0B' },
  { icon: MessageSquare, label: 'Teacher Chat', desc: 'Draft a message', color: '#8B5CF6' },
  { icon: Star, label: 'Recommendations', desc: 'Personalized suggestions', color: '#EC4899' },
];

export function ChildrenDashboard({
  children, selectedChild, setSelectedChild, setActiveTab, searchQuery,
  attendance, attendanceRate, assignments, teachers, examData, perfData,
  transportInfo, healthData, vaccinations, feesSummary, feesDue,
  notifArray, announcements, emergencyContacts, childrenHook,
}: ChildrenDashboardProps) {
  const [expandedChild, setExpandedChild] = useState<string | null>(null);
  const [aiAskOpen, setAiAskOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: string; text: string }[]>([]);
  const [activeChildSection, setActiveChildSection] = useState<string | null>(null);

  const effectiveChildren = useMemo(() => {
    if (Array.isArray(children) && children.length > 0) return children;
    return [];
  }, [children]);

  const effectiveScores = useMemo(() => {
    const subs = perfData?.subjects || perfData?.scores || [];
    if (Array.isArray(subs) && subs.length > 0) return subs.map((s: any, idx: number) => ({ subject: s.subject || s.name, score: s.score || s.marks || 0, color: PIE_COLORS[idx % PIE_COLORS.length], trend: '+2%' }));
    return [];
  }, [perfData]);

  const effectiveAttendance = useMemo(() => {
    const monthly = attendance?.monthly || [];
    if (Array.isArray(monthly) && monthly.length > 0) return monthly;
    return [];
  }, [attendance]);

  const effectiveAssignments = useMemo(() => {
    if (Array.isArray(assignments) && assignments.length > 0) return assignments;
    return [];
  }, [assignments]);

  const effectiveExams = useMemo(() => {
    const upcoming = examData?.upcoming || [];
    if (Array.isArray(upcoming) && upcoming.length > 0) return upcoming;
    return [];
  }, [examData]);

  const effectiveTrend = useMemo(() => {
    const trend = perfData?.trend || [];
    if (Array.isArray(trend) && trend.length > 0) return trend;
    return [];
  }, [perfData]);

  const attRate = useMemo(() => {
    if (typeof attendanceRate === 'number') return attendanceRate;
    if (selectedChild?.attendance_percentage) return selectedChild.attendance_percentage;
    return 0;
  }, [attendanceRate, selectedChild]);

  const avgScore = useMemo(() => {
    if (effectiveScores.length === 0) return 0;
    return Math.round(effectiveScores.reduce((s: number, c: any) => s + (c.score || 0), 0) / effectiveScores.length);
  }, [effectiveScores]);

  const filteredChildren = useMemo(() => {
    if (!searchQuery) return effectiveChildren;
    const q = searchQuery.toLowerCase();
    return effectiveChildren.filter((c: any) =>
      c.full_name?.toLowerCase().includes(q) ||
      c.class?.toLowerCase().includes(q) ||
      c.roll_number?.toLowerCase().includes(q)
    );
  }, [effectiveChildren, searchQuery]);

  const filterAssignments = (status: string) =>
    effectiveAssignments.filter((a: any) => {
      if (status === 'completed' || status === 'submitted') return a.status === 'submitted' || a.status === 'completed';
      if (status === 'overdue') return a.status === 'overdue' || (a.status === 'pending' && new Date(a.due_date) < new Date());
      if (status === 'pending') return a.status === 'pending' && new Date(a.due_date) >= new Date();
      return true;
    });

  const completedAssignments = effectiveAssignments.filter((a: any) => a.status === 'submitted' || a.status === 'completed').length;
  const overdueAssignments = effectiveAssignments.filter((a: any) => a.status === 'overdue' || (a.status === 'pending' && new Date(a.due_date) < new Date())).length;
  const pendingAssignments = effectiveAssignments.filter((a: any) => a.status === 'pending' && new Date(a.due_date) >= new Date()).length;

  const handleAiSend = () => {
    if (!aiQuery.trim()) return;
    setAiMessages(prev => [...prev, { role: 'user', text: aiQuery }]);
    setTimeout(() => {
      setAiMessages(prev => [...prev, {
        role: 'assistant', text: `I've analyzed ${selectedChild?.full_name || 'your child'}'s data. Here are my insights and recommendations based on their current academic performance, attendance, and recent activities.`
      }]);
    }, 1000);
    setAiQuery('');
  };

  const activeChild = selectedChild && filteredChildren.find((c: any) => c.id === selectedChild.id) || filteredChildren[0];

  const renderChildCard = (child: any, index: number) => (
    <motion.div key={child.id || index} variants={fadeUp}
      className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
        activeChild?.id === child.id
          ? 'border-[#6D4CFF] bg-gradient-to-br from-[#FAFAFF] to-white shadow-[0_8px_32px_rgba(109,76,255,0.15)]'
          : 'border-gray-100 bg-white hover:border-[#6D4CFF]/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]'
      }`}
      onClick={() => { setSelectedChild(child); setExpandedChild(expandedChild === child.id ? null : child.id); }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#6D4CFF]/5 to-transparent rounded-bl-full" />
      <div className="p-5 relative z-10">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <Avatar className="w-16 h-16 ring-2 ring-[#F3F0FF]">
              <AvatarFallback className="bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white font-bold text-lg">
                {child.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'S'}
              </AvatarFallback>
            </Avatar>

          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-gray-900 truncate">{child.full_name}</h3>
              <Badge className="bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white border-0 text-[10px] px-2 py-0.5 flex-shrink-0">
                {child.grade || 'A+'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#F3F0FF] text-[#6D4CFF]">
                {child.class || child.student_class || '—'} {child.section || ''}
              </span>
              {child.roll_number && (
                <span className="text-xs text-gray-400">Roll: {child.roll_number}</span>
              )}
              {child.house && (
                <span className="text-xs text-gray-400">{child.house}</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-3">
              {child.transport_status && (
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${child.transport_status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-xs text-gray-500">{child.transport_status === 'Active' ? 'Bus Active' : 'No Bus'}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        <AnimatePresence>
          {expandedChild === child.id && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="h-px bg-gray-100 my-4" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { icon: Award, label: 'Results', value: child.grade || 'A+', color: '#8B5CF6', tab: 'results' },
                  { icon: BookOpen, label: 'Assignments', value: `${completedAssignments}/${effectiveAssignments.length}`, color: '#6D4CFF', tab: 'assignments' },
                  { icon: ClipboardList, label: 'Exams', value: `${effectiveExams.length} Upcoming`, color: '#3B82F6', tab: 'exams' },
                  { icon: Heart, label: 'Health', value: 'Good', color: '#EC4899', tab: 'health' },
                ].map((item, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setActiveTab?.(item.tab); }}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-gray-50 hover:bg-[#F3F0FF] hover:text-[#6D4CFF] transition-all group/btn"
                  >
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    <span className="text-[10px] font-semibold text-gray-500 group-hover/btn:text-[#6D4CFF]">{item.label}</span>
                    <span className="text-xs font-bold text-gray-800">{item.value}</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 rounded-xl border-gray-200" onClick={(e) => { e.stopPropagation(); setActiveTab?.('overview'); }}>
                  <Eye className="w-3.5 h-3.5" /> View Profile
                </Button>
                <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 rounded-xl border-gray-200" onClick={(e) => { e.stopPropagation(); setActiveTab?.('messages'); }}>
                  <MessageSquare className="w-3.5 h-3.5" /> Send Message
                </Button>
                <Button size="sm" className="text-xs h-8 gap-1.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white border-0 shadow-[0_2px_8px_rgba(109,76,255,0.2)]" onClick={(e) => { e.stopPropagation(); toast.success('Report card download initiated'); }}>
                  <Download className="w-3.5 h-3.5" /> Report Card
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">
      {/* ===== PAGE HEADER ===== */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#6D4CFF] via-[#7C5CFF] to-[#4F2DB8]">
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
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
                <GraduationCap className="w-3.5 h-3.5 text-purple-200" />
                <span className="text-[10px] font-semibold text-purple-100 uppercase tracking-wider">My Children</span>
              </div>
              <Badge className="bg-white/20 text-white border-0 text-[10px]">{effectiveChildren.length} Linked</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {activeChild?.full_name || 'My Children'}
            </h1>
            <p className="text-sm text-white/80 mt-1 max-w-xl">
              Track your children's academic journey, attendance, performance, health, and school activities from a single dashboard.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <GraduationCap className="w-4 h-4 text-purple-200" />
                <div>
                  <span className="text-[10px] text-purple-200/70 block">Children</span>
                  <span className="text-sm font-bold text-white">{effectiveChildren.length}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <Award className="w-4 h-4 text-purple-200" />
                <div>
                  <span className="text-[10px] text-purple-200/70 block">Avg Score</span>
                  <span className="text-sm font-bold text-white">{avgScore}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <ClipboardList className="w-4 h-4 text-purple-200" />
                <div>
                  <span className="text-[10px] text-purple-200/70 block">Exams</span>
                  <span className="text-sm font-bold text-white">{effectiveExams.length}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
            <Button className="bg-white text-[#6D4CFF] hover:bg-white/95 hover:-translate-y-0.5 active:scale-[0.97] font-bold rounded-xl text-xs h-9 px-4 shadow-[0_4px_12px_rgba(255,255,255,0.15)] border-0 transition-all duration-200 gap-1.5"
              onClick={() => toast.success('Link child by admission number')}>
              <Plus className="w-3.5 h-3.5" /> Link Child
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.97] text-white font-bold rounded-xl text-xs h-9 px-4 border border-white/25 transition-all duration-200 gap-1.5"
              onClick={() => setActiveTab?.('exams')}>
              <Download className="w-3.5 h-3.5" /> Report Card
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.97] text-white font-bold rounded-xl text-xs h-9 px-4 border border-white/25 transition-all duration-200 gap-1.5"
              onClick={() => setActiveTab?.('messages')}>
              <MessageSquare className="w-3.5 h-3.5" /> Contact School
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ===== TOP KPI CARDS ===== */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { icon: GraduationCap, label: 'Linked Children', value: effectiveChildren.length, bg: '#F3F0FF', color: '#6D4CFF', suffix: '' },
          { icon: Award, label: 'Academic Score', value: `${avgScore}%`, bg: '#EFF6FF', color: '#3B82F6', suffix: '' },
          { icon: ClipboardList, label: 'Upcoming Exams', value: effectiveExams.length, bg: '#FFFBEB', color: '#F59E0B', suffix: '' },
          { icon: BookOpen, label: 'Pending Assignments', value: pendingAssignments, bg: '#FEF2F2', color: '#EF4444', suffix: '' },
          { icon: Bus, label: 'Transport', value: activeChild?.transport_status || 'Active', bg: '#F5F3FF', color: '#8B5CF6', suffix: '' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={i} whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#6D4CFF]/20 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: item.bg, color: item.color }}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.05, type: 'spring' }}
                  className="w-2 h-2 rounded-full" style={{ background: item.color }}
                />
              </div>
              <div className="text-[11px] font-medium text-gray-400 mb-0.5">{item.label}</div>
              <div className="text-lg font-extrabold text-gray-900">{item.value}{item.suffix}</div>
              <div className="mt-2 h-1 rounded-full bg-gray-100 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${typeof item.value === 'number' ? Math.min(item.value, 100) : 70}%` }} transition={{ duration: 1, delay: 0.5 + i * 0.08 }}
                  className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}88)` }}
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ===== CHILD SELECTOR BAR (multi-child) ===== */}
      {effectiveChildren.length > 1 && (
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Switch Child:</span>
            {effectiveChildren.map((child: any, i: number) => {
              const isActive = activeChild?.id === child.id;
              return (
                <motion.button key={child.id || i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedChild(child)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                    isActive
                      ? 'bg-[#6D4CFF] text-white border-[#6D4CFF] shadow-[0_4px_12px_rgba(109,76,255,0.25)]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#6D4CFF]/40 hover:text-[#6D4CFF]'
                  }`}
                >
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className={`text-[9px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {child.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold">{child.full_name || child.name || 'Child'}</span>
                  {child.class && <span className={`text-[11px] ${isActive ? 'text-white/70' : 'text-gray-400'}`}>Class {child.class}</span>}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ===== MAIN CONTENT: Two-column layout ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

        {/* ===== LEFT COLUMN ===== */}
        <div className="space-y-6">

          {/* SECTION 1: Child Profile Cards */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Child Profile{effectiveChildren.length > 1 ? 's' : ''}</h2>
                <p className="text-xs text-gray-400">{filteredChildren.length} child{filteredChildren.length > 1 ? 'ren' : ''} linked to your account</p>
              </div>
              {searchQuery && filteredChildren.length === 0 && (
                <Button variant="outline" size="sm" className="text-xs h-8 rounded-xl border-gray-200 gap-1.5" onClick={() => setActiveTab?.('support')}>
                  <HelpCircle className="w-3.5 h-3.5" /> Not found?
                </Button>
              )}
            </div>
            {filteredChildren.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredChildren.map((child: any, i) => renderChildCard(child, i))}
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#F3F0FF]/30 to-transparent" />
                <div className="relative z-10">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                    className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center shadow-[0_8px_24px_rgba(109,76,255,0.2)]"
                  >
                    <GraduationCap className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2">No Children Linked Yet</h3>
                  <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                    Link your child's school account to access attendance, grades, assignments, exams, transport tracking, health records, and academic insights.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button className="bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white rounded-xl text-xs h-9 px-5 shadow-[0_4px_12px_rgba(109,76,255,0.25)] border-0 gap-1.5"
                      onClick={() => toast.success('Link child by admission number')}>
                      <Plus className="w-3.5 h-3.5" /> Link Child
                    </Button>
                    <Button variant="outline" className="rounded-xl text-xs h-9 px-5 border-gray-200 gap-1.5"
                      onClick={() => setActiveTab?.('messages')}>
                      <MessageSquare className="w-3.5 h-3.5" /> Contact School
                    </Button>
                    <Button variant="outline" className="rounded-xl text-xs h-9 px-5 border-gray-200 gap-1.5"
                      onClick={() => setAiAskOpen(true)}>
                      <Sparkles className="w-3.5 h-3.5 text-[#6D4CFF]" /> Get Help
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* SECTION 2: Academic Performance */}
          <motion.div variants={fadeUp}>
            <Card className="p-5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#F3F0FF] to-transparent rounded-bl-full pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">Academic Performance</h3>
                    <p className="text-xs text-gray-400">Subject-wise scores and trends</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 rounded-xl" onClick={() => setActiveTab?.('exams')}>
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {effectiveScores.slice(0, 6).map((s: any, i: number) => {
                    const gradeColor = GRADE_COLORS[s.score >= 90 ? 'A+' : s.score >= 80 ? 'B+' : s.score >= 70 ? 'C' : 'D'] || '#6D4CFF';
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 hover:border-[#6D4CFF]/20 hover:bg-white transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-700 truncate">{s.subject}</span>
                          <span className="text-[10px] font-bold" style={{ color: s.trend?.startsWith('+') ? '#10B981' : '#EF4444' }}>{s.trend || '+2%'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${s.score}%` }} transition={{ duration: 1, delay: 0.3 + i * 0.05 }}
                              className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${gradeColor}, ${gradeColor}66)` }}
                            />
                          </div>
                          <span className="text-sm font-extrabold" style={{ color: gradeColor }}>{s.score}%</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Academic Trend Chart */}
                <div className="h-44 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={effectiveTrend}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6D4CFF" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#6D4CFF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }} />
                      <Area type="monotone" dataKey="score" stroke="#6D4CFF" strokeWidth={2.5} fill="url(#trendGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Overall Score Ring */}
                <div className="flex items-center justify-center gap-6 p-4 rounded-xl bg-gradient-to-r from-[#F3F0FF]/40 to-transparent border border-[#6D4CFF]/10">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F3F4F6" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#6D4CFF" strokeWidth="3"
                        strokeDasharray={`${avgScore} ${100 - avgScore}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-[#6D4CFF]">{avgScore}%</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Overall Academic Score</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Based on {effectiveScores.length} subjects • A Grade Average
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-50 text-green-600 border-green-200 text-[10px]">
                        <TrendingUp className="w-3 h-3 mr-0.5" /> +4% vs last term
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>



          {/* SECTION 4: Assignment Tracker */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Assignment Tracker</h3>
                  <p className="text-xs text-gray-400">Track homework and submissions</p>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 rounded-xl" onClick={() => setActiveTab?.('assignments')}>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Completed', value: completedAssignments, color: '#10B981', bg: '#F0FDF4' },
                  { label: 'Pending', value: pendingAssignments, color: '#F59E0B', bg: '#FFFBEB' },
                  { label: 'Overdue', value: overdueAssignments, color: '#EF4444', bg: '#FEF2F2' },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl text-center" style={{ background: item.bg }}>
                    <div className="text-xl font-extrabold" style={{ color: item.color }}>{item.value}</div>
                    <div className="text-[10px] font-medium text-gray-500 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {effectiveAssignments.slice(0, 4).map((a: any, i: number) => {
                  const isOverdue = a.status === 'overdue' || (a.status === 'pending' && new Date(a.due_date) < new Date());
                  const isSubmitted = a.status === 'submitted' || a.status === 'completed';
                  const statusColor = isSubmitted ? '#10B981' : isOverdue ? '#EF4444' : '#F59E0B';
                  const statusLabel = isSubmitted ? 'Completed' : isOverdue ? 'Overdue' : 'Pending';
                  return (
                    <motion.div key={a.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${
                        isOverdue ? 'border-red-100 bg-red-50/30' : isSubmitted ? 'border-green-100 bg-green-50/30' : 'border-gray-100 bg-white'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${statusColor}15` }}>
                        {isSubmitted ? <CheckCircle2 className="w-4.5 h-4.5" style={{ color: statusColor }} /> :
                         isOverdue ? <AlertCircle className="w-4.5 h-4.5" style={{ color: statusColor }} /> :
                         <Clock className="w-4.5 h-4.5" style={{ color: statusColor }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800 truncate">{a.title}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                            isSubmitted ? 'bg-green-100 text-green-700' : isOverdue ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>{statusLabel}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                          <span>{a.subject}</span>
                          {a.due_date && <span>• Due: {new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                          {a.teacher && <span>• {a.teacher}</span>}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="w-8 h-8 rounded-lg text-gray-400 hover:text-[#6D4CFF] hover:bg-[#F3F0FF] flex-shrink-0"
                        onClick={() => { setActiveTab?.('assignments'); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* SECTION 5: Upcoming Exams */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Upcoming Exams</h3>
                  <p className="text-xs text-gray-400">Exam schedule and preparation status</p>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 rounded-xl" onClick={() => setActiveTab?.('exams')}>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {effectiveExams.map((e: any, i: number) => (
                  <motion.div key={e.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-[#6D4CFF]/20 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white flex-shrink-0 shadow-[0_4px_12px_rgba(109,76,255,0.2)]">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-800">{e.subject}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {e.date ? new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBD'}
                          </span>
                          {e.time && <span>• {e.time}</span>}
                          {e.room && <span>• {e.room}</span>}
                        </div>
                        {e.syllabus && (
                          <div className="mt-2.5">
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="font-medium text-gray-500">Syllabus Coverage</span>
                              <span className="font-bold" style={{ color: e.syllabus >= 80 ? '#10B981' : e.syllabus >= 50 ? '#F59E0B' : '#EF4444' }}>
                                {e.syllabus}%
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${e.syllabus}%` }} transition={{ duration: 1, delay: 0.3 + i * 0.05 }}
                                className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, #6D4CFF, #8B5CF6)` }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="text-[10px] h-7 px-2.5 rounded-lg border-gray-200 gap-1"
                            onClick={() => toast.info('Viewing syllabus...')}>
                            <Eye className="w-3 h-3" /> View Syllabus
                          </Button>
                          <Button size="sm" className="text-[10px] h-7 px-2.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white border-0 gap-1 shadow-[0_2px_8px_rgba(109,76,255,0.15)]"
                            onClick={() => { setAiAskOpen(true); setAiQuery(`Tips for ${e.subject}`); }}>
                            <Lightbulb className="w-3 h-3" /> Prep Tips
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <div className="space-y-5">

          {/* Today's Activity */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#6D4CFF]" />
                Today's Activity
              </h3>
              <div className="space-y-3">
                {([] as any[]).map((a: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}12` }}>
                      <a.icon className="w-4 h-4" style={{ color: a.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 leading-snug">{a.text}</p>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">{a.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Recent Notifications */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#6D4CFF]" />
                  Notifications
                </h3>
                {([] as any[]).filter((n: any) => n.priority === 'high').length > 0 && (
                  <Badge className="bg-red-50 text-red-600 border-red-200 text-[9px] px-1.5">
                    {([] as any[]).filter((n: any) => n.priority === 'high').length} New
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                {([] as any[]).slice(0, 4).map((n: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl border border-gray-100 hover:border-[#6D4CFF]/20 hover:bg-[#FAFAFF] transition-all cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${n.priority === 'high' ? 'bg-red-500' : 'bg-[#6D4CFF]'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-gray-800">{n.title}</span>
                          {n.priority === 'high' && <span className="text-[8px] px-1 py-0.5 rounded-full bg-red-50 text-red-500 font-semibold">URGENT</span>}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{n.desc}</p>
                        <span className="text-[9px] text-gray-300 mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Quick Contacts */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#6D4CFF]" />
                Quick Contacts
              </h3>
              <div className="space-y-2">
                {([] as any[]).map((c: any, i: number) => {
                  const Icon = c.icon;
                  return (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => { setActiveTab?.('messages'); toast.info(`Contacting ${c.name}...`); }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${c.color}12` }}>
                        <Icon className="w-4.5 h-4.5" style={{ color: c.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-800 group-hover:text-[#6D4CFF] transition-colors">{c.name}</div>
                        <div className="text-[10px] text-gray-400">{c.role}</div>
                      </div>
                      <Phone className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#6D4CFF] transition-colors flex-shrink-0" />
                    </motion.div>
                  );
                })}
              </div>
              <Button variant="outline" className="w-full mt-3 text-xs h-8 rounded-xl border-gray-200 gap-1.5"
                onClick={() => { setActiveTab?.('support'); }}>
                <MessageSquare className="w-3.5 h-3.5" /> Contact Directory
              </Button>
            </Card>
          </motion.div>

          {/* AI Quick Actions */}
          <motion.div variants={fadeUp}>
            <Card className="p-5 bg-gradient-to-br from-[#6D4CFF] to-[#4F2DB8] text-white border-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.08)_0%,transparent_50%)]" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-purple-200" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold">Prerana AI</h3>
                    <p className="text-[10px] text-purple-200/70">Parent Assistant</p>
                  </div>
                </div>
                <p className="text-[11px] text-purple-200/80 mb-4">
                  Analyze academic progress, get recommendations, and receive personalized insights.
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {aiQuickActions.slice(0, 6).map((action: any, i: number) => {
                    const Icon = action.icon;
                    return (
                      <button key={i} onClick={() => { setAiAskOpen(true); setAiQuery(action.label); }}
                        className="flex items-center gap-1.5 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all text-left"
                      >
                        <Icon className="w-3 h-3 flex-shrink-0" style={{ color: action.color }} />
                        <span className="text-[9px] font-semibold text-white/90 leading-tight">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                  <input
                    type="text"
                    placeholder="Ask about your child..."
                    className="flex-1 bg-transparent border-0 text-[11px] text-white placeholder-purple-200/50 outline-none"
                    value={aiQuery}
                    onChange={e => setAiQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { setAiAskOpen(true); handleAiSend(); } }}
                  />
                  <button onClick={() => { setAiAskOpen(true); handleAiSend(); }} className="text-purple-200 hover:text-white transition-colors">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ===== AI ASSISTANT FLOATING PANEL ===== */}
      <AnimatePresence>
        {aiAskOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setAiAskOpen(false)}
          >
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-[#6D4CFF] to-[#4F2DB8] p-5 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.08)_0%,transparent_50%)]" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                        <Sparkles className="w-5 h-5 text-purple-200" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-base">Prerana AI</h3>
                        <p className="text-[11px] text-purple-200/70">Parent Assistant for {activeChild?.full_name || 'your child'}</p>
                      </div>
                    </div>
                    <button onClick={() => setAiAskOpen(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 max-h-[50vh] overflow-y-auto space-y-3">
                {aiMessages.length === 0 && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-[#6D4CFF]" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">How can I help you today?</p>
                    <p className="text-xs text-gray-400 mt-1">Ask about performance, attendance, homework, or any school-related topic.</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {aiQuickActions.slice(0, 4).map((action: any, i: number) => {
                        const Icon = action.icon;
                        return (
                          <button key={i} onClick={() => { setAiQuery(action.label); handleAiSend(); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600 hover:bg-[#F3F0FF] hover:text-[#6D4CFF] hover:border-[#6D4CFF]/20 transition-all"
                          >
                            <Icon className="w-3 h-3" style={{ color: action.color }} />
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {aiMessages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#6D4CFF] text-white rounded-br-sm'
                        : 'bg-gray-50 text-gray-700 border border-gray-100 rounded-bl-sm'
                    }`}>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Sparkles className="w-3 h-3 text-[#6D4CFF]" />
                          <span className="text-[10px] font-semibold text-[#6D4CFF]">Prerana AI</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ask anything about your child..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] focus:bg-white transition-all"
                    value={aiQuery}
                    onChange={e => setAiQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAiSend(); }}
                  />
                  <button onClick={handleAiSend}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_16px_rgba(109,76,255,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
