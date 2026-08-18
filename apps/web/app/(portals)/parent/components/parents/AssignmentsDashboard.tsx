'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, TrendingUp, Clock, CheckCircle2, AlertCircle, Award, Bell,
  Plus, CalendarDays, Target, Star, Sparkles, Download, MessageSquare, FileText,
  ArrowUpRight, Search, X, GraduationCap, Lightbulb, Activity,
  HelpCircle, Send, AlertTriangle, BarChart3, Users, ChevronRight,
  Shield, Eye, FileDown, Filter, ChevronDown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart as ReLineChart, Line,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface AssignmentsDashboardProps {
  assignments: any[];
  searchQuery?: string;
  selectedChild: any;
  setActiveTab: (tab: string) => void;
  children: any[];
  setSelectedChild: (c: any) => void;
  perfData?: any;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const aiQuickActions = [
  { icon: TrendingUp, label: 'Performance Analysis', desc: 'Analyze progress', color: '#6D4CFF' },
  { icon: BookOpen, label: 'Homework Help', desc: 'Get assistance', color: '#10B981' },
  { icon: Lightbulb, label: 'Study Tips', desc: 'Learning advice', color: '#F59E0B' },
  { icon: Target, label: 'Improvement Plan', desc: 'Focus areas', color: '#3B82F6' },
  { icon: MessageSquare, label: 'Contact Teacher', desc: 'Ask questions', color: '#8B5CF6' },
  { icon: FileText, label: 'Progress Report', desc: 'Generate report', color: '#EC4899' },
];

export function AssignmentsDashboard({ assignments, searchQuery, selectedChild, setActiveTab, children, setSelectedChild, perfData }: AssignmentsDashboardProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssign, setSelectedAssign] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [aiAskOpen, setAiAskOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: string; text: string }[]>([]);

  const effAssignments = useMemo(() => {
    if (Array.isArray(assignments) && assignments.length > 0) return assignments;
    return [];
  }, [assignments]);

  const effTrend = useMemo(() => {
    return [];
  }, []);

  const effScores = useMemo(() => {
    const subs = perfData?.subjects || perfData?.scores || [];
    if (Array.isArray(subs) && subs.length > 0) return subs.map((s: any, idx: number) => ({ subject: s.subject || s.name, score: s.score || s.marks || 0, color: ['#6D4CFF', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'][idx % 6] }));
    return [];
  }, [perfData]);

  const totalAssign = effAssignments.length;
  const completedAssign = effAssignments.filter((a: any) => a.status === 'submitted' || a.status === 'completed').length;
  const pendingAssign = effAssignments.filter((a: any) => a.status === 'pending' && new Date(a.due_date) >= new Date()).length;
  const overdueAssign = effAssignments.filter((a: any) => a.status === 'overdue' || (a.status === 'pending' && new Date(a.due_date) < new Date())).length;
  const avgScore = effScores.length > 0 ? Math.round(effScores.reduce((s: number, c: any) => s + (c.score || 0), 0) / effScores.length) : 0;
  const completionRate = totalAssign > 0 ? Math.round((completedAssign / totalAssign) * 100) : 0;

  const filteredAssign = useMemo(() => {
    let items = effAssignments;
    if (activeFilter === 'completed') items = items.filter((a: any) => a.status === 'submitted' || a.status === 'completed');
    else if (activeFilter === 'pending') items = items.filter((a: any) => a.status === 'pending' && new Date(a.due_date) >= new Date());
    else if (activeFilter === 'overdue') items = items.filter((a: any) => a.status === 'overdue' || (a.status === 'pending' && new Date(a.due_date) < new Date()));
    else if (activeFilter === 'high') items = items.filter((a: any) => a.priority === 'high');
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter((a: any) => a.title?.toLowerCase().includes(q) || a.subject?.toLowerCase().includes(q) || a.teacher?.toLowerCase().includes(q));
    }
    return items;
  }, [effAssignments, activeFilter, searchTerm]);

  const handleAiSend = () => {
    if (!aiQuery.trim()) return;
    setAiMessages(prev => [...prev, { role: 'user', text: aiQuery }]);
    setTimeout(() => {
      const responses: Record<string, string> = {
        'Performance Analysis': `Your child has completed ${completedAssign} out of ${totalAssign} assignments (${completionRate}% completion). Average score is ${avgScore}%. Strongest subjects: Computer Science (97%), Mathematics (95%). Areas for improvement: Social Studies (85%).`,
        'Homework Help': `I can help with math homework (algebra, geometry), science concepts (chemistry, physics), or English essays. What subject does your child need help with? I'll provide step-by-step guidance.`,
        'Study Tips': `Based on performance patterns: (1) Create a study schedule prioritizing Mathematics and Science (2) Practice with past papers (3) Use flashcards for Social Studies (4) Take 5-min breaks every 25 mins using Pomodoro technique.`,
        'Improvement Plan': `Focus areas for improvement: (1) Social Studies - allocate 30 mins extra/week (2) English essay structure practice (3) Time management for deadlines. Target: increase avg score from ${avgScore}% to 95% this term.`,
        'Contact Teacher': `I can help draft a message to your child's teacher. What would you like to communicate? For example: asking about missing assignments, requesting extra help, or discussing progress.`,
        'Progress Report': `Here's your child's academic summary: ${totalAssign} assignments, ${completionRate}% completion rate, ${avgScore}% average score, ${overdueAssign} overdue. Top subject: Computer Science (97%). Needs attention: ${overdueAssign > 0 ? overdueAssign + ' overdue assignments.' : 'None - all caught up!'}`,
      };
      setAiMessages(prev => [...prev, { role: 'assistant', text: responses[aiQuery] || `Your child has ${completedAssign} completed assignments out of ${totalAssign} with a ${completionRate}% completion rate. Average score across subjects is ${avgScore}%. ${overdueAssign > 0 ? `There are ${overdueAssign} overdue assignments that need attention.` : 'All assignments are up to date!'}` }]);
    }, 800);
    setAiQuery('');
  };

  const getStatusStyle = (a: any) => {
    if (a.status === 'submitted' || a.status === 'completed') return { color: '#10B981', bg: '#F0FDF4', label: 'Completed', icon: CheckCircle2 };
    const overdue = a.status === 'overdue' || (a.status === 'pending' && new Date(a.due_date) < new Date());
    if (overdue) return { color: '#EF4444', bg: '#FEF2F2', label: 'Overdue', icon: AlertCircle };
    return { color: '#F59E0B', bg: '#FFFBEB', label: 'Pending', icon: Clock };
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return { color: '#EF4444', bg: '#FEF2F2' };
      case 'medium': return { color: '#F59E0B', bg: '#FFFBEB' };
      case 'low': return { color: '#10B981', bg: '#F0FDF4' };
      default: return { color: '#94A3B8', bg: '#F8FAFC' };
    }
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
                <BookOpen className="w-3.5 h-3.5 text-purple-200" />
                <span className="text-[10px] font-semibold text-purple-100 uppercase tracking-wider">Assignments</span>
              </div>
              {selectedChild && <Badge className="bg-white/20 text-white border-0 text-[10px]">{selectedChild.full_name}</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Assignment Intelligence Center</h1>
            <p className="text-sm text-white/80 mt-1 max-w-xl">Track homework, projects, submissions, grades, and academic progress from one centralized dashboard.</p>
            <div className="flex flex-wrap gap-3 mt-5">
              {[
                { icon: BookOpen, label: 'Total', value: totalAssign, color: '#6D4CFF' },
                { icon: CheckCircle2, label: 'Completed', value: completedAssign, color: '#10B981' },
                { icon: Clock, label: 'Pending', value: pendingAssign, color: '#F59E0B' },
                { icon: AlertCircle, label: 'Overdue', value: overdueAssign, color: '#EF4444' },
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
              onClick={() => setActiveFilter('all')}>
              <BookOpen className="w-3.5 h-3.5" /> All Assignments
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.97] text-white font-bold rounded-xl text-xs h-9 px-4 border border-white/25 transition-all duration-200 gap-1.5"
              onClick={() => toast.success('Progress report download initiated')}>
              <Download className="w-3.5 h-3.5" /> Download Report
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
          { icon: BookOpen, label: 'Total Assignments', value: totalAssign, desc: 'This Academic Year', color: '#6D4CFF', bg: '#F3F0FF' },
          { icon: CheckCircle2, label: 'Completed', value: completedAssign, desc: `${completionRate}% Completion Rate`, color: '#10B981', bg: '#F0FDF4' },
          { icon: Clock, label: 'Pending', value: pendingAssign, desc: 'Needs Attention', color: '#F59E0B', bg: '#FFFBEB' },
          { icon: AlertCircle, label: 'Overdue', value: overdueAssign, desc: 'Requires Action', color: '#EF4444', bg: '#FEF2F2' },
          { icon: Award, label: 'Avg Score', value: `${avgScore}%`, desc: 'Excellent Performance', color: '#8B5CF6', bg: '#F5F3FF', progress: avgScore },
          { icon: TrendingUp, label: 'Completion', value: `${completionRate}%`, desc: 'Above Class Average', color: '#3B82F6', bg: '#EFF6FF', progress: completionRate },
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

      {/* ===== FILTER & SEARCH ===== */}
      <motion.div variants={fadeUp}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl w-fit">
            {[
              { key: 'all', label: 'All', count: totalAssign },
              { key: 'pending', label: 'Pending', count: pendingAssign },
              { key: 'overdue', label: 'Overdue', count: overdueAssign },
              { key: 'completed', label: 'Completed', count: completedAssign },
              { key: 'high', label: 'High Priority', count: effAssignments.filter((a: any) => a.priority === 'high').length },
            ].map(t => (
              <button key={t.key} onClick={() => setActiveFilter(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeFilter === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t.label} <span className="text-[10px] opacity-60">({t.count})</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:bg-white w-32" />
            </div>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== MAIN TWO-COLUMN ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

        {/* ===== LEFT ===== */}
        <div className="space-y-6">

          {/* Assignment Cards */}
          {filteredAssign.length === 0 ? (
            <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F3F0FF]/30 to-transparent" />
              <div className="relative z-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center shadow-[0_8px_24px_rgba(109,76,255,0.2)]">
                  <BookOpen className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">No Assignments Available Yet</h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">Assignments will appear here automatically once teachers assign homework, projects, or academic activities.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button className="bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white rounded-xl text-xs h-9 px-5 shadow-[0_4px_12px_rgba(109,76,255,0.25)] border-0 gap-1.5"
                    onClick={() => toast.success('Opening learning resources...')}>
                    <BookOpen className="w-3.5 h-3.5" /> Explore Resources
                  </Button>
                  <Button variant="outline" className="rounded-xl text-xs h-9 px-5 border-gray-200 gap-1.5"
                    onClick={() => setActiveTab('messages')}>
                    <MessageSquare className="w-3.5 h-3.5" /> Contact Teacher
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
              {filteredAssign.map((a: any, i: number) => {
                const st = getStatusStyle(a);
                const Icon = st.icon;
                const pc = getPriorityColor(a.priority);
                const isOverdue = a.status === 'overdue' || (a.status === 'pending' && new Date(a.due_date) < new Date());
                return (
                  <motion.div key={a.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className={`group relative overflow-hidden rounded-2xl border transition-all cursor-pointer ${
                      selectedAssign?.id === a.id ? 'border-[#6D4CFF] bg-[#FAFAFF] shadow-[0_4px_16px_rgba(109,76,255,0.1)]' : 'border-gray-100 bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#6D4CFF]/20'
                    } ${isOverdue ? 'border-l-4 border-l-red-400' : ''}`}
                    onClick={() => setSelectedAssign(selectedAssign?.id === a.id ? null : a)}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: st.bg }}>
                          <Icon className="w-5 h-5" style={{ color: st.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-sm font-bold text-gray-800 truncate">{a.title}</h4>
                            {a.priority === 'high' && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 font-semibold flex-shrink-0">HIGH</span>}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-400">
                            <span>{a.subject}</span>
                            <span>• {a.teacher}</span>
                            {a.due_date && <span>• Due: {new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${a.completion || 0}%` }} transition={{ duration: 1, delay: 0.2 + i * 0.03 }}
                                className="h-full rounded-full" style={{ background: st.color }} />
                            </div>
                            <span className="text-xs font-bold" style={{ color: st.color }}>{a.completion || 0}%</span>
                            <Badge className="text-[9px] border-0" style={{ background: pc.bg, color: pc.color }}>{a.priority}</Badge>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-gray-300 mt-2 transition-transform flex-shrink-0 ${selectedAssign?.id === a.id ? 'rotate-90' : ''}`} />
                      </div>

                      <AnimatePresence>
                        {selectedAssign?.id === a.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="h-px bg-gray-100 my-3" />
                            {a.description && <p className="text-xs text-gray-600 mb-3 p-3 rounded-lg bg-gray-50">{a.description}</p>}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                              {[
                                { label: 'Status', value: st.label, color: st.color },
                                { label: 'Assigned', value: a.assigned_date ? new Date(a.assigned_date).toLocaleDateString() : '—', color: '#6D4CFF' },
                                { label: 'Due Date', value: a.due_date ? new Date(a.due_date).toLocaleDateString() : '—', color: isOverdue ? '#EF4444' : '#6D4CFF' },
                                { label: 'Attachments', value: a.attachments || 0, color: '#6D4CFF' },
                              ].map((item, j) => (
                                <div key={j} className="p-2 rounded-lg bg-gray-50 text-center">
                                  <div className="text-[9px] font-medium text-gray-400">{item.label}</div>
                                  <div className="text-xs font-bold mt-0.5" style={{ color: item.color }}>{item.value}</div>
                                </div>
                              ))}
                            </div>
                            {a.score && (
                              <div className="p-3 rounded-lg bg-green-50 border border-green-100 mb-3">
                                <div className="flex items-center gap-2">
                                  <Award className="w-4 h-4 text-green-600" />
                                  <span className="text-xs font-bold text-green-700">Score: {a.score}/100</span>
                                </div>
                              </div>
                            )}
                            {a.feedback && (
                              <div className="p-3 rounded-lg bg-[#F3F0FF] border border-[#6D4CFF]/10 mb-3">
                                <div className="text-[10px] font-semibold text-[#6D4CFF] mb-1">Teacher Feedback</div>
                                <p className="text-xs text-gray-600">{a.feedback}</p>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" className="text-[10px] h-7 px-3 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white border-0" onClick={(e) => { e.stopPropagation(); toast.success('Viewing details...'); }}>
                                <Eye className="w-3 h-3" /> View Details
                              </Button>
                              <Button size="sm" variant="outline" className="text-[10px] h-7 px-3 rounded-lg border-gray-200" onClick={(e) => { e.stopPropagation(); toast.success('Downloading files...'); }}>
                                <Download className="w-3 h-3" /> Download Files
                              </Button>
                              {(a.status === 'pending' || a.status === 'overdue') && (
                                <Button size="sm" className="text-[10px] h-7 px-3 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white border-0" onClick={(e) => { e.stopPropagation(); toast.success('Assignment submitted!'); }}>
                                  <Send className="w-3 h-3" /> Submit
                                </Button>
                              )}
                              <Button size="sm" variant="ghost" className="text-[10px] h-7 px-3" onClick={(e) => { e.stopPropagation(); setAiAskOpen(true); setAiQuery(`Help with ${a.title}`); }}>
                                <Sparkles className="w-3 h-3 text-[#6D4CFF]" /> AI Help
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Analytics Charts */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Trend */}
            <Card className="p-5">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4">Assignment Trends</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={effTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                    <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={20} />
                    <Bar dataKey="assigned" name="Assigned" fill="#6D4CFF" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Subject Performance */}
            <Card className="p-5">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4">Subject Performance</h3>
              <div className="space-y-2.5">
                {([] as any[]).map((s: any, i: number) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-600">{s.subject}</span>
                      <span className="font-bold" style={{ color: s.color }}>{s.score}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s.score}%` }} transition={{ duration: 1, delay: 0.1 + i * 0.04 }}
                        className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}66)` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Submission Tracker + Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                  <FileDown className="w-4 h-4 text-[#6D4CFF]" />
                  Submission Tracker
                </h3>
                <div className="space-y-2.5">
                  {([] as any[]).map((s: any, i: number) => {
                    const isDone = s.status === 'reviewed' || s.status === 'graded';
                    return (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isDone ? 'border-green-100 bg-green-50/30' : 'border-amber-100 bg-amber-50/30'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-700">{s.title}</div>
                          <div className="text-[10px] text-gray-400">{s.action} • {s.date}</div>
                          {(s.feedback || s.score) && <div className="text-[10px] text-[#6D4CFF] font-medium mt-0.5">{s.feedback || `Score: ${s.score}`}</div>}
                        </div>
                        <div className={`w-2 h-2 rounded-full ${isDone ? 'bg-green-500' : 'bg-amber-500'}`} />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#6D4CFF]" />
                    Teacher Feedback
                  </h3>
                  <Button variant="ghost" size="sm" className="text-gray-400 h-7" onClick={() => setShowFeedback(!showFeedback)}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {([] as any[]).map((f: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl border border-gray-100 hover:border-[#6D4CFF]/20 transition-all">
                      <div className="flex items-start gap-2.5">
                        <Avatar className="w-7 h-7 flex-shrink-0"><AvatarFallback className="bg-[#F3F0FF] text-[#6D4CFF] text-[9px] font-bold">{f.avatar}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-800">{f.teacher}</span>
                            <Badge className="bg-gray-50 text-gray-400 border-gray-200 text-[8px]">{f.subject}</Badge>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{f.comment}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] font-bold text-green-600">Score: {f.score}/100</span>
                            <span className="text-[9px] text-gray-300">•</span>
                            <span className="text-[9px] text-gray-400">{f.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <div className="space-y-5">
          {/* Today's Assignments */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#6D4CFF]" />
                Today's Priority
              </h3>
              <div className="space-y-2.5">
                {effAssignments.filter((a: any) => a.priority === 'high' || a.status === 'overdue').slice(0, 4).map((a: any, i: number) => {
                  const isOverdue = a.status === 'overdue' || (a.status === 'pending' && new Date(a.due_date) < new Date());
                  return (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => { setActiveFilter('all'); setSearchTerm(a.title); }}>
                      <div className={`w-2 h-2 rounded-full ${isOverdue ? 'bg-red-500' : 'bg-[#6D4CFF]'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-700 truncate">{a.title}</div>
                        <div className="text-[10px] text-gray-400">{a.subject} • {isOverdue ? 'Overdue' : a.due_date ? `Due ${new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}</div>
                      </div>
                      <Badge className={`text-[8px] ${isOverdue ? 'bg-red-50 text-red-600 border-red-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}>
                        {isOverdue ? 'Overdue' : 'High'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#6D4CFF]" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {([] as any[]).map((n: any, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.color }} />
                    <div className="flex-1 min-w-0"><p className="text-xs font-medium text-gray-700">{n.text}</p><span className="text-[10px] text-gray-400">{n.time}</span></div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div variants={fadeUp}>
            <Card className="p-5 bg-gradient-to-br from-[#FEF3C7]/40 to-white border-amber-100">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#F59E0B]" />
                Upcoming Deadlines
              </h3>
              <div className="space-y-2.5">
                {effAssignments.filter((a: any) => a.status === 'pending' && new Date(a.due_date) >= new Date()).sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).slice(0, 4).map((a: any, i: number) => {
                  const daysLeft = Math.ceil((new Date(a.due_date).getTime() - Date.now()) / 86400000);
                  return (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-amber-100">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0">
                        <CalendarDays className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-700 truncate">{a.title}</div>
                        <div className="text-[10px] text-gray-400">{a.subject} • {daysLeft === 0 ? 'Due today' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}</div>
                      </div>
                      <Badge className={`text-[8px] ${daysLeft <= 1 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}>
                        {daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Class Comparison */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#6D4CFF]" />
                Performance Comparison
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Your Child', value: avgScore, color: '#6D4CFF' },
                  { label: 'Class Average', value: 84, color: '#94A3B8' },
                  { label: 'School Average', value: 87, color: '#CBD5E1' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium" style={{ color: item.color }}>{item.label}</span>
                      <span className="font-bold" style={{ color: i === 0 ? '#6D4CFF' : '#64748B' }}>{item.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                        className="h-full rounded-full" style={{ background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Prerana AI */}
          <motion.div variants={fadeUp}>
            <Card className="p-5 bg-gradient-to-br from-[#6D4CFF] to-[#4F2DB8] text-white border-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.08)_0%,transparent_50%)]" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm"><Sparkles className="w-4 h-4 text-purple-200" /></div>
                  <div><h3 className="text-sm font-extrabold">Prerana AI</h3><p className="text-[10px] text-purple-200/70">Learning Assistant</p></div>
                </div>
                <p className="text-[11px] text-purple-200/80 mb-4">Get homework help, study recommendations, and academic insights.</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {aiQuickActions.map((action: any, i: number) => {
                    const Icon = action.icon;
                    return (
                      <button key={i} onClick={() => { setAiAskOpen(true); setAiQuery(action.label); }}
                        className="flex items-center gap-1.5 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all text-left">
                        <Icon className="w-3 h-3 flex-shrink-0" style={{ color: action.color }} />
                        <span className="text-[9px] font-semibold text-white/90 leading-tight">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                  <input type="text" placeholder="Ask about assignments..."
                    className="flex-1 bg-transparent border-0 text-[11px] text-white placeholder-purple-200/50 outline-none"
                    value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { setAiAskOpen(true); handleAiSend(); } }} />
                  <button onClick={() => { setAiAskOpen(true); handleAiSend(); }} className="text-purple-200 hover:text-white transition-colors"><Send className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

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
                    <div><h3 className="text-white font-bold text-base">Prerana AI</h3><p className="text-[11px] text-purple-200/70">Learning Assistant</p></div>
                  </div>
                  <button onClick={() => setAiAskOpen(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"><X className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-5 max-h-[50vh] overflow-y-auto space-y-3">
                {aiMessages.length === 0 && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center"><BookOpen className="w-8 h-8 text-[#6D4CFF]" /></div>
                    <p className="text-sm font-semibold text-gray-700">Ask about assignments & learning</p>
                    <p className="text-xs text-gray-400 mt-1">Get homework help, study tips, and academic insights.</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {aiQuickActions.slice(0, 4).map((action: any, i: number) => {
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
                  <input type="text" placeholder="Ask about assignments, homework, or study tips..."
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
