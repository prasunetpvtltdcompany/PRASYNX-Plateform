'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Award, TrendingUp, Target, Clock, CheckCircle2, AlertCircle,
  BarChart3, Sparkles, Zap, Brain, Star, Flame, Calendar, Download,
  ArrowUpRight, ChevronRight, GraduationCap, BookMarked, FileText,
  Lightbulb, Rocket, Dumbbell, Medal, Trophy,
  Circle, Play, Book, Video, ScrollText, HelpCircle, MessageSquare,
  Bot,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion as fm } from 'framer-motion';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };
const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

interface AcademicsDashboardProps {
  marksData?: any[];
  assignmentsData?: any[];
  examsData?: any[];
  attendanceData?: any[];
  subjectPerformance: { name: string; marks: number; average: number; progress: number }[];
  marksHook: any;
  assignmentsHook: any;
  examsHook: any;
}

export function AcademicsDashboard({
  marksData, assignmentsData, examsData, attendanceData,
  subjectPerformance, marksHook, assignmentsHook, examsHook,
}: AcademicsDashboardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const averageScore = useMemo(() =>
    subjectPerformance.length > 0
      ? Math.round(subjectPerformance.reduce((s, x) => s + x.marks, 0) / subjectPerformance.length)
      : 0,
    [subjectPerformance]
  );

  const assignmentsCompleted = useMemo(() =>
    Array.isArray(assignmentsData)
      ? assignmentsData.filter((a: any) => a.status === 'submitted' || a.status === 'completed').length
      : 0,
    [assignmentsData]
  );

  const totalAssignments = Array.isArray(assignmentsData) ? assignmentsData.length : 0;
  const assignmentProgress = totalAssignments > 0 ? Math.round((assignmentsCompleted / totalAssignments) * 100) : 0;

  const gradeColor = (pct: number) => {
    if (pct >= 90) return COLORS.success;
    if (pct >= 75) return COLORS.primary;
    if (pct >= 60) return COLORS.warning;
    return COLORS.danger;
  };

  const subjectChartData = subjectPerformance.map(s => ({
    name: s.name,
    marks: s.marks,
    average: s.average,
    fill: gradeColor(s.marks),
  }));

  const radarData = subjectPerformance.map(s => ({
    subject: s.name.slice(0, 5),
    score: s.marks,
    fullMark: 100,
  }));

  const performanceTrend = useMemo(() => {
    if (!Array.isArray(marksData) || marksData.length < 2) return [];
    const grouped: Record<string, number[]> = {};
    marksData.forEach((m: any) => {
      const month = m.created_at ? new Date(m.created_at).toLocaleString('en-US', { month: 'short' }) : 'N/A';
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(m.score || m.marks || 0);
    });
    return Object.entries(grouped).map(([month, scores]) => ({
      month,
      average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    })).slice(-6);
  }, [marksData]);

  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const displaySubjects = showAllSubjects ? subjectPerformance : subjectPerformance.slice(0, 4);

  const kpiCards = [
    { label: 'Subjects Enrolled', value: subjectPerformance.length, icon: BookOpen, color: COLORS.primary, growth: '+2 this semester', bg: '#F3F0FF' },
    { label: 'Assignments', value: `${assignmentsCompleted}/${totalAssignments}`, icon: Target, color: COLORS.success, progress: assignmentProgress, bg: '#F0FDF4' },
    { label: 'Average Marks', value: `${averageScore}%`, icon: Award, color: COLORS.warning, status: averageScore >= 75 ? 'Excellent' : averageScore >= 60 ? 'Good' : 'Needs Work', bg: '#FFFBEB' },
    { label: 'Class Rank', value: '#12', icon: Trophy, color: COLORS.primary, subtitle: 'Top 5% of Class', bg: '#F3F0FF' },
    { label: 'Study Hours', value: '42 hrs', icon: Flame, color: COLORS.warning, subtitle: 'This Week', bg: '#FFFBEB' },
  ];

  const upcomingTasks = [
    { title: 'Math Assignment', subject: 'Mathematics', due: 'Tomorrow', priority: 'High', status: 'Pending', icon: BookOpen },
    { title: 'Science Project', subject: 'Science', due: 'In 3 days', priority: 'Medium', status: 'In Progress', icon: Target },
    { title: 'English Essay', subject: 'English', due: 'In 5 days', priority: 'Low', status: 'Not Started', icon: FileText },
    { title: 'History Presentation', subject: 'Social Science', due: 'Next Week', priority: 'Medium', status: 'Draft', icon: BookMarked },
  ];

  const achievements = [
    { label: 'Active Participant', icon: Trophy, earned: true, color: '#F59E0B' },
    { label: 'Top Performer', icon: Medal, earned: true, color: '#6D4CFF' },
    { label: 'Assignment Master', icon: Award, earned: true, color: '#22C55E' },
    { label: 'Coding Champion', icon: Brain, earned: false, color: '#3B82F6' },
    { label: 'Science Genius', icon: Star, earned: false, color: '#EF4444' },
    { label: 'Fast Learner', icon: Zap, earned: true, color: '#8B5CF6' },
  ];

  const weeklyData = [
    { day: 'Mon', hours: 6, tests: 2, completed: 4 },
    { day: 'Tue', hours: 5, tests: 1, completed: 3 },
    { day: 'Wed', hours: 7, tests: 3, completed: 5 },
    { day: 'Thu', hours: 4, tests: 1, completed: 2 },
    { day: 'Fri', hours: 8, tests: 2, completed: 6 },
    { day: 'Sat', hours: 6, tests: 2, completed: 4 },
    { day: 'Sun', hours: 6, tests: 1, completed: 3 },
  ];

  const semesterProgress = 72;
  const completedSubjects = subjectPerformance.filter(s => s.marks >= 60).length;
  const pendingSubjects = subjectPerformance.length - completedSubjects;
  const predictedGrade = averageScore >= 90 ? 'A+' : averageScore >= 80 ? 'A' : averageScore >= 70 ? 'B+' : averageScore >= 60 ? 'B' : 'C';

  const SectionWrapper = ({ id, title, subtitle, children, defaultOpen = false }: { id: string; title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean }) => {
    const isOpen = expandedSection === id || defaultOpen;
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <Card className={`p-6 transition-all duration-300 ${isOpen ? 'ring-2 ring-[#6D4CFF]/20 shadow-lg' : 'hover:shadow-md'}`}>
          <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setExpandedSection(isOpen ? null : id)}>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    );
  };

  if (marksHook.loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1>Academics</h1>
          <p>Loading your academic dashboard...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-gray-100 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-16 mb-2" />
              <div className="h-7 bg-gray-100 rounded w-20" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 p-6 animate-pulse">
          <div className="h-5 bg-gray-100 rounded w-48 mb-6" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-3 bg-gray-100 rounded w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (marksHook.error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load academic data</h2>
        <p className="text-gray-500 mb-6">{marksHook.error}</p>
        <button onClick={marksHook.refetch} className="px-6 py-2.5 bg-[#6D4CFF] text-white rounded-xl font-medium hover:bg-[#5A3FD6] transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* Page Header */}
      <motion.div variants={fadeUp} className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Academics</h1>
          <p className="text-sm text-gray-500 mt-1">Your AI-powered academic performance and learning insights dashboard.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-[#6D4CFF] bg-[#F3F0FF] rounded-xl hover:bg-[#EBE6FF] transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Report
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] rounded-xl shadow-[0_4px_14px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_20px_rgba(109,76,255,0.4)] transition-all hover:-translate-y-0.5 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Study Plan
          </button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div variants={fadeUp}>
        <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 mb-2 bg-gradient-to-br from-[#6D4CFF] via-[#8B5CF6] to-[#2D1B69] min-h-[200px] flex items-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(255,255,255,0.15)_0%,transparent_45%),radial-gradient(circle_at_85%_75%,rgba(255,255,255,0.08)_0%,transparent_45%)]" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-6">
            <div className="flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-white/70 mb-2">Academic Excellence Score</div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl md:text-6xl font-extrabold text-white">{averageScore}%</span>
                <span className="flex items-center gap-1 text-sm font-medium text-green-300 bg-green-500/20 px-2.5 py-1 rounded-full">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +12% this month
                </span>
              </div>
              <p className="text-white/80 text-sm mt-3 max-w-lg">
                Your performance has improved consistently over the last 30 days. Keep up the great work!
              </p>
              <div className="flex items-center gap-3 mt-5">
                <button className="px-5 py-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-white text-sm font-medium hover:bg-white/25 transition-all flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  View Full Report
                </button>
                <button className="px-5 py-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-white text-sm font-medium hover:bg-white/25 transition-all flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generate AI Study Plan
                </button>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - averageScore / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-white">{averageScore}</div>
                    <div className="text-[10px] text-white/70 font-medium">SCORE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Analytics Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl bg-white border border-gray-100 p-4 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5" style={{ background: kpi.bg }}>
              <kpi.icon size={17} style={{ color: kpi.color }} />
            </div>
            <div className="text-[11px] font-medium text-gray-500">{kpi.label}</div>
            <div className="text-xl font-extrabold text-gray-900 mt-0.5">{kpi.value}</div>
            {'growth' in kpi && kpi.growth && (
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3 text-green-500" />
                <span className="text-[10px] font-medium text-green-600">{kpi.growth}</span>
              </div>
            )}
            {'status' in kpi && kpi.status && (
              <Badge variant={averageScore >= 75 ? 'success' : averageScore >= 60 ? 'warning' : 'danger'} className="mt-1.5 text-[9px] px-1.5 py-0.5">
                {kpi.status}
              </Badge>
            )}
            {'progress' in kpi && (
              <div className="mt-2">
                <Progress value={kpi.progress as number} className="h-1.5 bg-gray-100 [&>div]:bg-gradient-to-r [&>div]:from-[#6D4CFF] [&>div]:to-[#22C55E]" />
              </div>
            )}
            {'subtitle' in kpi && kpi.subtitle && (
              <div className="text-[10px] text-gray-400 mt-1">{kpi.subtitle}</div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Subject Performance Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Subject Performance</h3>
                <p className="text-xs text-gray-500 mt-0.5">Marks and class average comparison</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#6D4CFF]" />
                  <span className="text-[10px] text-gray-500">Your Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#E2E8F0]" />
                  <span className="text-[10px] text-gray-500">Class Avg</span>
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectChartData} barSize={28} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    labelStyle={{ fontSize: 12, fontWeight: 600 }}
                  />
                  <Bar dataKey="marks" radius={[6, 6, 0, 0]}>
                    {subjectChartData.map((entry, i) => (
                      <rect key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                  <Bar dataKey="average" fill="#E2E8F0" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Right Column: AI Insights */}
        <motion.div variants={fadeUp}>
          <Card className="p-6 bg-gradient-to-br from-[#6D4CFF] to-[#4F2DB8] text-white overflow-hidden relative h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold">Prerana AI Insights</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-2">Strengths</div>
                  <div className="space-y-1.5">
                    {subjectPerformance.filter(s => s.marks >= 75).slice(0, 3).map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-300 flex-shrink-0" />
                        <span>{s.name}</span>
                      </div>
                    ))}
                    {subjectPerformance.filter(s => s.marks >= 75).length === 0 && (
                      <div className="text-sm text-white/70">No strengths identified yet</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-2">Focus Areas</div>
                  <div className="space-y-1.5">
                    {subjectPerformance.filter(s => s.marks < 60).slice(0, 2).map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <AlertCircle className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0" />
                        <span>{s.name}</span>
                      </div>
                    ))}
                    {subjectPerformance.filter(s => s.marks < 60).length === 0 && (
                      <div className="text-sm text-white/70">All subjects on track!</div>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-2">AI Recommendations</div>
                  <ul className="space-y-1.5">
                    {[
                      'Practice Algebra daily for 30 mins',
                      'Take weekly mock tests',
                      'Watch recorded Physics lectures',
                    ].map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Lightbulb className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0 mt-0.5" />
                        <span className="text-white/90">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-white/60">Predicted Grade</div>
                    <div className="text-2xl font-extrabold">{predictedGrade}</div>
                  </div>
                  <button className="px-3 py-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-medium hover:bg-white/25 transition-all flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Study Plan
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>

      {/* Second Row: Semester Progress + Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Semester Progress */}
        <motion.div variants={fadeUp}>
          <Card className="p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Semester Progress</h3>
            <div className="flex items-center gap-8">
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="url(#semesterGrad)" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - semesterProgress / 100)}`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="semesterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6D4CFF" />
                      <stop offset="100%" stopColor="#22C55E" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-gray-900">{semesterProgress}%</div>
                    <div className="text-[9px] text-gray-400 font-medium">COMPLETE</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1">
                {[
                  { label: 'Completed', value: completedSubjects, color: '#22C55E' },
                  { label: 'Pending', value: pendingSubjects, color: '#F59E0B' },
                  { label: 'Remaining Weeks', value: 6, color: '#3B82F6' },
                  { label: 'Expected GPA', value: '8.2', color: '#6D4CFF' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="text-[11px] text-gray-500 font-medium">{item.label}</div>
                    <div className="text-xl font-extrabold mt-0.5" style={{ color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div variants={fadeUp}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Upcoming Tasks</h3>
              <Badge variant="info" className="text-[9px]">{upcomingTasks.length} tasks</Badge>
            </div>
            <div className="space-y-2">
              {upcomingTasks.map((task, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#F3F0FF] flex items-center justify-center flex-shrink-0">
                    <task.icon className="w-4 h-4 text-[#6D4CFF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{task.title}</div>
                    <div className="text-[11px] text-gray-500">{task.subject} • {task.due}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'default'}
                      className="text-[9px] px-1.5 py-0.5"
                    >
                      {task.priority}
                    </Badge>
                    <button className="w-7 h-7 rounded-lg bg-[#6D4CFF]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Play className="w-3 h-3 text-[#6D4CFF]" fill="#6D4CFF" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

      </div>

      {/* Third Row: Weekly Heatmap + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Weekly Study Heatmap */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Weekly Study Activity</h3>
                <p className="text-xs text-gray-500 mt-0.5">GitHub-style contribution heatmap</p>
              </div>
              <Badge variant="success" className="text-[9px]">Excellent consistency</Badge>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
                  />
                  <Bar dataKey="hours" name="Study Hours" fill="#6D4CFF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#22C55E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#6D4CFF]" />
                  <span className="text-[10px] text-gray-500">Study Hrs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#22C55E]" />
                  <span className="text-[10px] text-gray-500">Completed</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Consistency Score: <span className="font-bold text-[#6D4CFF]">87%</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={fadeUp}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Achievements</h3>
              <span className="text-xs text-gray-500">{achievements.filter(a => a.earned).length}/{achievements.length}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {achievements.map((ach, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                    ach.earned ? 'bg-gradient-to-b from-gray-50 to-white border border-gray-100' : 'bg-gray-50 opacity-50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    ach.earned ? 'shadow-sm' : ''
                  }`} style={{ background: ach.earned ? `${ach.color}15` : '#F1F5F9' }}>
                    <ach.icon className="w-4 h-4" style={{ color: ach.earned ? ach.color : '#94A3B8' }} />
                  </div>
                  <div className="text-[9px] font-medium text-center leading-tight" style={{ color: ach.earned ? '#0F172A' : '#94A3B8' }}>
                    {ach.label}
                  </div>
                  {!ach.earned && (
                    <div className="w-full h-1 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6]" style={{ width: `${(ach as any).progress || 0}%` }} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

      </div>

      {/* Performance Trend */}
      {performanceTrend.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Performance Trend</h3>
                <p className="text-xs text-gray-500 mt-0.5">Monthly average score progression</p>
              </div>
              <Badge variant="success" className="text-[9px]">
                <TrendingUp className="w-3 h-3 mr-1" />
                Improving
              </Badge>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceTrend}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6D4CFF" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#6D4CFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                  <Area type="monotone" dataKey="average" stroke="#6D4CFF" strokeWidth={2.5} fill="url(#trendGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            { label: 'Take Quiz', icon: HelpCircle, color: '#6D4CFF' },
            { label: 'Download Notes', icon: Download, color: '#22C55E' },
            { label: 'Join Live Class', icon: Video, color: '#F59E0B' },
            { label: 'Ask AI Tutor', icon: Bot, color: '#3B82F6' },
            { label: 'View Timetable', icon: Calendar, color: '#8B5CF6' },
            { label: 'Submit Assignment', icon: FileText, color: '#EF4444' },
          ].map((action, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${action.color}12` }}>
                <action.icon className="w-5 h-5" style={{ color: action.color }} />
              </div>
              <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
}
