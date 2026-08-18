'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, TrendingUp, Clock, CheckCircle2, AlertCircle, Award, Bell,
  CalendarDays, Target, Star, Sparkles, Download, GraduationCap, BarChart3,
  ArrowUpRight, Search, X, BookOpen, Lightbulb, Activity, HelpCircle, Send,
  AlertTriangle, Users, ChevronRight, Shield, Eye, Filter, ChevronDown,
  MapPin, User, FileText, MessageSquare,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface ExamsDashboardProps {
  examData?: any;
  searchQuery?: string;
  selectedChild: any;
  setActiveTab: (tab: string) => void;
  children: any[];
  setSelectedChild: (c: any) => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const aiQuickActions = [
  { icon: BarChart3, label: 'Performance Analysis', color: '#6D4CFF' },
  { icon: Lightbulb, label: 'Study Tips', color: '#F59E0B' },
  { icon: Target, label: 'Improvement Plan', color: '#10B981' },
  { icon: MessageSquare, label: 'Contact Teacher', color: '#3B82F6' },
  { icon: Award, label: 'Progress Report', color: '#8B5CF6' },
  { icon: BookOpen, label: 'Exam Prep', color: '#EC4899' },
];

const getDaysLeft = (d: string) => {
  const diff = new Date(d).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
};

const formatCountdown = (d: string) => {
  const diff = new Date(d).getTime() - Date.now();
  if (diff <= 0) return 'Today!';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hrs}h`;
  return `${hrs}h`;
};

const getGradeColor = (grade: string) => {
  const map: Record<string, string> = { 'A+': '#10B981', 'A': '#3B82F6', 'B+': '#F59E0B', 'B': '#F97316', 'C+': '#EF4444', 'C': '#EF4444', 'D': '#DC2626' };
  return map[grade] || '#94A3B8';
};

export function ExamsDashboard({ examData, searchQuery, selectedChild, setActiveTab, children, setSelectedChild }: ExamsDashboardProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [showResults, setShowResults] = useState(true);
  const [aiAskOpen, setAiAskOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: string; text: string }[]>([]);

  const effUpcoming = useMemo(() => {
    const u = examData?.upcoming;
    if (Array.isArray(u) && u.length > 0) return u;
    return [];
  }, [examData]);

  const effResults = useMemo(() => {
    const r = examData?.results;
    if (Array.isArray(r) && r.length > 0) return r;
    return [];
  }, [examData]);

  const effTrend = useMemo(() => [], []);
  const effPerf = useMemo(() => [], []);

  const totalExams = effUpcoming.length + effResults.length;
  const completedExams = effResults.length;
  const upcomingCount = effUpcoming.length;
  const avgScore = effResults.length > 0 ? Math.round(effResults.reduce((s: number, r: any) => s + ((r.score || 0) / (r.total || 100)) * 100, 0) / effResults.length) : 0;
  const highestGrade = effResults.length > 0 ? [...effResults].sort((a: any, b: any) => ((b.score || 0) / (b.total || 100)) - ((a.score || 0) / (a.total || 100)))[0]?.grade || '—' : '—';
  const passRate = effResults.length > 0 ? Math.round(effResults.filter((r: any) => ((r.score || 0) / (r.total || 100)) >= 0.4).length / effResults.length * 100) : 0;

  const filteredResults = useMemo(() => {
    let items = effResults;
    if (activeFilter === 'high') items = items.filter((r: any) => r.grade?.startsWith('A'));
    else if (activeFilter === 'average') items = items.filter((r: any) => r.grade === 'B+' || r.grade === 'B');
    else if (activeFilter === 'needs') items = items.filter((r: any) => r.grade === 'C+' || r.grade === 'C' || r.grade === 'D');
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter((r: any) => r.subject?.toLowerCase().includes(q) || r.teacher?.toLowerCase().includes(q) || r.grade?.toLowerCase().includes(q));
    }
    return items;
  }, [effResults, activeFilter, searchTerm]);

  const handleAiSend = () => {
    if (!aiQuery.trim()) return;
    setAiMessages(prev => [...prev, { role: 'user', text: aiQuery }]);
    setTimeout(() => {
      const responses: Record<string, string> = {
        'Performance Analysis': `Your child has completed ${completedExams} exams with an average score of ${avgScore}%. Highest grade: ${highestGrade}. Top subjects: Science (98%), Computer Science (94%). Needs improvement: English (78%).`,
        'Study Tips': `Based on exam patterns: (1) Focus 30 mins daily on weak subjects (2) Practice with previous year papers (3) Create summary notes for each chapter (4) Take regular breaks using Pomodoro technique (25/5).`,
        'Improvement Plan': `Focus: (1) English essay structure - practice 2 essays/week (2) Social Studies map work - 15 mins daily (3) Time management during exams. Target: increase avg from ${avgScore}% to 93% next term.`,
        'Contact Teacher': `I can help draft a message to the teacher. What would you like to discuss? Exam preparation, performance review, or extra help requests?`,
        'Progress Report': `Exams: ${completedExams} completed, ${upcomingCount} upcoming. Average: ${avgScore}%. Pass rate: ${passRate}%. Highest: ${highestGrade}. ${avgScore >= 85 ? 'Excellent performance overall!' : avgScore >= 75 ? 'Good performance with room for improvement.' : 'Needs focused attention on core subjects.'}`,
        'Exam Prep': `Upcoming exams: ${upcomingCount} exams scheduled. Next: ${effUpcoming[0]?.subject || 'N/A'} in ${formatCountdown(effUpcoming[0]?.date || '')}. Focus on ${effUpcoming[0]?.syllabus?.slice(0, 50) || 'syllabus review'} and practice previous year papers.`,
      };
      setAiMessages(prev => [...prev, { role: 'assistant', text: responses[aiQuery] || `Your child has completed ${completedExams} exams with a ${avgScore}% average. ${upcomingCount} upcoming exams. Highest grade: ${highestGrade}. ${avgScore >= 80 ? 'Keep up the great work!' : 'Some subjects need more attention.'}` }]);
    }, 800);
    setAiQuery('');
  };

  const getExamStatusColor = (date: string) => {
    const days = getDaysLeft(date);
    if (days < 0) return { color: '#EF4444', bg: '#FEF2F2', label: 'Past Due' };
    if (days <= 3) return { color: '#F59E0B', bg: '#FFFBEB', label: `${days}d left` };
    if (days <= 7) return { color: '#3B82F6', bg: '#EFF6FF', label: `${days}d left` };
    return { color: '#10B981', bg: '#F0FDF4', label: `${days}d left` };
  };

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">
      {/* ===== HERO ===== */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#6D4CFF] via-[#7C5CFF] to-[#4F2DB8]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(124,58,237,0.15)_0%,transparent_50%)]" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#A855F7]/15 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#6366F1]/15 rounded-full blur-[80px]" />
        <motion.div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full bg-white/10"
              animate={{ opacity: [0.1, 0.4, 0.1], y: [0, -(10 + (i % 3) * 8), 0], x: [0, (i % 2 === 0 ? 1 : -1) * 10, 0] }}
              transition={{ duration: 4 + (i % 3) * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
              style={{ width: `${2 + (i % 3) * 2}px`, height: `${2 + (i % 3) * 2}px`, top: `${10 + (i * 12) % 80}%`, left: `${5 + (i * 15) % 90}%` }} />
          ))}
        </motion.div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
                <ClipboardList className="w-3.5 h-3.5 text-purple-200" />
                <span className="text-[10px] font-semibold text-purple-100 uppercase tracking-wider">Exams & Results</span>
              </div>
              {selectedChild && <Badge className="bg-white/20 text-white border-0 text-[10px]">{selectedChild.full_name}</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Exam Performance Center</h1>
            <p className="text-sm text-white/80 mt-1 max-w-xl">Track upcoming exams, view results, analyze performance trends, and prepare with AI-powered study insights.</p>
            <div className="flex flex-wrap gap-3 mt-5">
              {[
                { icon: ClipboardList, label: 'Total Exams', value: totalExams, color: '#6D4CFF' },
                { icon: CheckCircle2, label: 'Completed', value: completedExams, color: '#10B981' },
                { icon: Clock, label: 'Upcoming', value: upcomingCount, color: '#3B82F6' },
                { icon: TrendingUp, label: 'Avg Score', value: `${avgScore}%`, color: '#F59E0B' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  <div><span className="text-[10px] text-purple-200/70 block">{item.label}</span><span className="text-sm font-bold text-white">{item.value}</span></div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
            <Button className="bg-white text-[#6D4CFF] hover:bg-white/95 hover:-translate-y-0.5 active:scale-[0.97] font-bold rounded-xl text-xs h-9 px-4 shadow-[0_4px_12px_rgba(255,255,255,0.15)] border-0 transition-all duration-200 gap-1.5"
              onClick={() => setShowResults(true)}>
              <ClipboardList className="w-3.5 h-3.5" /> View Results
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.97] text-white font-bold rounded-xl text-xs h-9 px-4 border border-white/25 transition-all duration-200 gap-1.5"
              onClick={() => toast.success('Report card download initiated')}>
              <Download className="w-3.5 h-3.5" /> Report Card
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.97] text-white font-bold rounded-xl text-xs h-9 px-4 border border-white/25 transition-all duration-200 gap-1.5"
              onClick={() => setAiAskOpen(true)}>
              <Sparkles className="w-3.5 h-3.5" /> Ask AI
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ===== TOP KPI CARDS ===== */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: ClipboardList, label: 'Total Exams', value: totalExams, desc: 'This Academic Year', color: '#6D4CFF', bg: '#F3F0FF' },
          { icon: CheckCircle2, label: 'Completed', value: completedExams, desc: `${completedExams} Results Published`, color: '#10B981', bg: '#F0FDF4' },
          { icon: Clock, label: 'Upcoming', value: upcomingCount, desc: `${upcomingCount > 0 ? `Next: ${formatCountdown(effUpcoming[0]?.date || '')}` : 'No Exams'}` , color: '#3B82F6', bg: '#EFF6FF' },
          { icon: Award, label: 'Avg Score', value: `${avgScore}%`, desc: `Pass Rate ${passRate}%`, color: '#F59E0B', bg: '#FFFBEB', progress: avgScore },
          { icon: Star, label: 'Highest Grade', value: highestGrade, desc: 'Best Performance', color: '#8B5CF6', bg: '#F5F3FF' },
          { icon: TrendingUp, label: 'Pass Rate', value: `${passRate}%`, desc: 'Above Class Average', color: '#EC4899', bg: '#FDF2F8', progress: passRate },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={i} whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#6D4CFF]/20 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: item.bg, color: item.color }}><Icon className="w-4.5 h-4.5" /></div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.05, type: 'spring' }} className="w-2 h-2 rounded-full" style={{ background: item.color }} />
              </div>
              <div className="text-[11px] font-medium text-gray-400 mb-0.5">{item.label}</div>
              <div className="text-lg font-extrabold text-gray-900">{item.value}</div>
              <div className="text-[10px]" style={{ color: item.color }}>{item.desc}</div>
              {(item as any).progress !== undefined && (
                <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(item as any).progress}%` }} transition={{ duration: 1, delay: 0.5 + i * 0.08 }}
                    className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}88)` }} />
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* ===== MAIN CONTENT: TWO COLUMNS ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* ===== UPCOMING EXAMS ===== */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2"><CalendarDays className="w-4 h-4 text-[#6D4CFF]" /> Upcoming Exams</h2>
              <Badge className="bg-[#F3F0FF] text-[#6D4CFF] border-[rgba(109,76,255,0.2)] text-[10px]">{upcomingCount} Scheduled</Badge>
            </div>
            {effUpcoming.length > 0 ? (
              <div className="space-y-2.5">
                {effUpcoming.map((e: any, i: number) => {
                  const daysLeft = getDaysLeft(e.date);
                  const statusColor = getExamStatusColor(e.date);
                  const isUrgent = daysLeft >= 0 && daysLeft <= 3;
                  return (
                    <motion.div key={e.id || i} whileHover={{ x: 2 }}
                      className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all cursor-pointer"
                      onClick={() => setSelectedExam(selectedExam?.id === e.id ? null : e)}>
                      {isUrgent && <div className="absolute top-0 right-0 w-20 h-20 bg-[#F59E0B]/5 rounded-bl-full" />}
                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-5 h-5 text-[#6D4CFF]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm text-gray-900">{e.subject}</h3>
                            <Badge className="text-[9px] px-1.5 py-0" style={{ background: statusColor.bg, color: statusColor.color, borderColor: statusColor.color + '33' }}>{statusColor.label}</Badge>
                            {e.max_marks && <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-gray-400 border-gray-200">{e.max_marks} marks</Badge>}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            <span className="text-[11px] text-gray-500 flex items-center gap-1"><CalendarDays className="w-3 h-3" />{new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            {e.time && <span className="text-[11px] text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{e.time}</span>}
                            {e.room && <span className="text-[11px] text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{e.room}</span>}
                            {e.teacher && <span className="text-[11px] text-gray-400 flex items-center gap-1"><User className="w-3 h-3" />{e.teacher}</span>}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className={`text-lg font-extrabold ${isUrgent ? 'text-[#F59E0B]' : 'text-[#6D4CFF]'}`}>{formatCountdown(e.date)}</div>
                          <div className="text-[9px] text-gray-400 uppercase">{daysLeft >= 0 ? 'Until Exam' : 'Past Due'}</div>
                        </div>
                      </div>
                      {selectedExam?.id === e.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 pt-3 border-t border-gray-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Syllabus</p>
                              <p className="text-xs text-gray-600">{e.syllabus || 'Full syllabus'}</p>
                            </div>
                            <div className="flex items-end gap-2">
                              <Button size="sm" className="text-[10px] h-7 bg-[#6D4CFF] text-white hover:bg-[#5B3FE8] rounded-lg gap-1"
                                onClick={() => toast.success(`Starting ${e.subject} preparation guide...`)}>
                                <BookOpen className="w-3 h-3" /> Start Preparing
                              </Button>
                              <Button size="sm" variant="outline" className="text-[10px] h-7 rounded-lg gap-1"
                                onClick={() => toast.success('Downloading previous papers...')}>
                                <FileText className="w-3 h-3" /> Past Papers
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center"><CalendarDays className="w-8 h-8 text-[#6D4CFF]" /></div>
                <p className="text-sm font-semibold text-gray-700">No Upcoming Exams</p>
                <p className="text-xs text-gray-400 mt-1">All exams for this term have been completed.</p>
                <Button className="mt-3 text-xs bg-[#6D4CFF] text-white rounded-lg h-8" onClick={() => setActiveTab('overview')}>Go to Dashboard</Button>
              </Card>
            )}
          </motion.div>

          {/* ===== EXAM RESULTS ===== */}
          <motion.div variants={fadeUp}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Award className="w-4 h-4 text-[#6D4CFF]" /> Exam Results</h2>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['all', 'high', 'average', 'needs'].map((f) => (
                  <button key={f} onClick={() => setActiveFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${activeFilter === f ? 'bg-[#6D4CFF] text-white border-[#6D4CFF]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#6D4CFF]/40 hover:text-[#6D4CFF]'}`}>
                    {f === 'all' ? 'All' : f === 'high' ? 'A Grade' : f === 'average' ? 'B Grade' : 'Needs Work'}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input type="text" placeholder="Search results by subject, teacher, or grade..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] transition-all"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            {filteredResults.length > 0 ? (
              <div className="space-y-2">
                {filteredResults.map((r: any, i: number) => {
                  const pct = r.total ? Math.round((r.score / r.total) * 100) : r.score || 0;
                  return (
                    <motion.div key={r.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-5 h-5 text-[#6D4CFF]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm text-gray-900">{r.subject}</h3>
                            <Badge className="text-[9px] px-1.5 py-0 border-0 font-bold" style={{ background: getGradeColor(r.grade) + '20', color: getGradeColor(r.grade) }}>{r.grade}</Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
                            <span className="text-[11px] text-gray-500 flex items-center gap-1"><GraduationCap className="w-3 h-3" />{r.score}/{r.total || 100} ({pct}%)</span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1"><CalendarDays className="w-3 h-3" />{new Date(r.date).toLocaleDateString()}</span>
                            {r.teacher && <span className="text-[11px] text-gray-400 flex items-center gap-1"><User className="w-3 h-3" />{r.teacher}</span>}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="relative w-14 h-14">
                            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F3F4F6" strokeWidth="2.5" />
                              <circle cx="18" cy="18" r="15.5" fill="none" stroke={getGradeColor(r.grade)} strokeWidth="2.5"
                                strokeDasharray={`${pct * 0.975} 100`} strokeLinecap="round" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold" style={{ color: getGradeColor(r.grade) }}>{pct}%</span>
                          </div>
                        </div>
                      </div>
                      {r.remarks && (
                        <div className="mt-2.5 flex items-start gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                          <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-[11px] text-gray-500 italic">{r.remarks}</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center"><Search className="w-8 h-8 text-[#6D4CFF]" /></div>
                <p className="text-sm font-semibold text-gray-700">{searchTerm ? 'No results match your search' : 'No Results Yet'}</p>
                <p className="text-xs text-gray-400 mt-1">{searchTerm ? 'Try adjusting your search terms.' : 'Exam results will appear here once published.'}</p>
              </Card>
            )}
          </motion.div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-4">
          {/* ===== PERFORMANCE OVERVIEW ===== */}
          <motion.div variants={fadeUp}>
            <Card className="p-4 overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-[#6D4CFF]" />
                <h3 className="text-xs font-bold text-gray-800">Performance Trend</h3>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={effTrend}>
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6D4CFF" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#6D4CFF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #F3F4F6', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    <Area type="monotone" dataKey="avgScore" stroke="#6D4CFF" strokeWidth={2} fill="url(#trendGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* ===== SUBJECT COMPARISON ===== */}
          <motion.div variants={fadeUp}>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-[#6D4CFF]" />Subject Scores</h3>
                <Badge className="text-[9px] bg-[#F3F0FF] text-[#6D4CFF] border-0">vs Class Avg</Badge>
              </div>
              <div className="space-y-2.5">
                {effPerf.map((s: any, i: number) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-gray-700">{s.subject}</span>
                      <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.score}%</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s.score}%` }} transition={{ duration: 1, delay: 0.2 + i * 0.05 }}
                        className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}88)` }} />
                      <div className="absolute top-0 left-0 h-full w-full flex items-center" style={{ clipPath: 'inset(0 0 0 0)' }}>
                        <div className="h-full rounded-full opacity-20" style={{ width: `${s.avg}%`, background: s.color }} />
                        <span className="absolute left-0 text-[7px] text-white font-bold" style={{ left: `calc(${s.avg}% - 6px)`, top: '1px' }}>|</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[8px] text-gray-400">Class avg {s.avg}%</span>
                      <span className={`text-[8px] font-semibold ${s.score >= s.avg ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{s.score >= s.avg ? `+${s.score - s.avg}%` : `-${s.avg - s.score}%`}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* ===== NOTIFICATIONS ===== */}
          <motion.div variants={fadeUp}>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-[#6D4CFF]" />
                <h3 className="text-xs font-bold text-gray-800">Exam Updates</h3>
              </div>
              <div className="space-y-2.5">
                {([] as any[]).map((n, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-gray-600 leading-relaxed">{n.text}</p>
                      <span className="text-[9px] text-gray-400">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* ===== PRERANA AI ===== */}
          <motion.div variants={fadeUp}>
            <Card className="p-4 bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] border-[rgba(109,76,255,0.15)]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm"><Sparkles className="w-4 h-4 text-[#6D4CFF]" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-[#6D4CFF]">Prerana AI</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">Exam Assistant is ready to help with preparation, performance analysis, and study strategies.</p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {aiQuickActions.slice(0, 3).map((action: any, i: number) => {
                      const Icon = action.icon;
                      return (
                        <button key={i} onClick={() => { setAiQuery(action.label); setAiAskOpen(true); }}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-[rgba(109,76,255,0.15)] text-[9px] font-semibold text-gray-600 hover:bg-[#6D4CFF] hover:text-white transition-all">
                          <Icon className="w-2.5 h-2.5" /> {action.label}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setAiAskOpen(true)}
                    className="mt-2 w-full py-2 rounded-lg bg-white text-[10px] font-semibold text-[#6D4CFF] border border-[rgba(109,76,255,0.2)] hover:bg-[#6D4CFF] hover:text-white transition-all flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" /> Open AI Assistant
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ===== EMPTY STATE (when no data at all) ===== */}
      {effUpcoming.length === 0 && effResults.length === 0 && (
        <motion.div variants={fadeUp}>
          <Card className="p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center">
              <ClipboardList className="w-12 h-12 text-[#6D4CFF]" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Welcome to Exam Center</h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">Track your child's exam schedule, view results, analyze performance, and get AI-powered study recommendations.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button className="bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white rounded-xl text-xs h-9 gap-1.5 shadow-[0_4px_12px_rgba(109,76,255,0.25)]"
                onClick={() => toast.info('Sample exam data loaded for preview')}>
                <GraduationCap className="w-4 h-4" /> View Sample Data
              </Button>
              <Button variant="outline" className="rounded-xl text-xs h-9 gap-1.5"
                onClick={() => setAiAskOpen(true)}>
                <Sparkles className="w-4 h-4" /> Ask Prerana AI
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ===== AI PANEL ===== */}
      <AnimatePresence>
        {aiAskOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setAiAskOpen(false)}>
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#6D4CFF] to-[#4F2DB8] p-5 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.08)_0%,transparent_50%)]" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm"><Sparkles className="w-5 h-5 text-purple-200" /></div>
                    <div><h3 className="text-white font-bold text-base">Prerana AI</h3><p className="text-[11px] text-purple-200/70">Exam Assistant</p></div>
                  </div>
                  <button onClick={() => setAiAskOpen(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"><X className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-5 max-h-[50vh] overflow-y-auto space-y-3">
                {aiMessages.length === 0 && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center"><GraduationCap className="w-8 h-8 text-[#6D4CFF]" /></div>
                    <p className="text-sm font-semibold text-gray-700">Ask about exams & performance</p>
                    <p className="text-xs text-gray-400 mt-1">Get exam prep tips, performance analysis, and study strategies.</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {aiQuickActions.map((action: any, i: number) => {
                        const Icon = action.icon;
                        return (
                          <button key={i} onClick={() => { setAiQuery(action.label); handleAiSend(); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600 hover:bg-[#F3F0FF] hover:text-[#6D4CFF] transition-all">
                            <Icon className="w-3 h-3" style={{ color: action.color }} /> {action.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {aiMessages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-[#6D4CFF] text-white rounded-br-sm' : 'bg-gray-50 text-gray-700 border border-gray-100 rounded-bl-sm'}`}>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1.5 mb-1.5"><Sparkles className="w-3 h-3 text-[#6D4CFF]" /><span className="text-[10px] font-semibold text-[#6D4CFF]">Prerana AI</span></div>
                      )}
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="Ask about exams, results, or study strategies..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] focus:bg-white transition-all"
                    value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAiSend(); }} />
                  <button onClick={handleAiSend}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_16px_rgba(109,76,255,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all flex-shrink-0">
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
