'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLanguage } from './language/LanguageProvider';
import LanguageSwitcher from './language/LanguageSwitcher';
import { useAuth } from './contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from './lib/useApi';
import {
  dashboardApi, timetableApi, attendanceApi, examApi,
  marksApi, assignmentApi, feeApi, libraryApi, certificateApi,
  scholarshipApi, eventApi, clubApi, healthApi, messageApi,
  announcementApi, teacherApi, canteenApi
} from './lib/dataService';
import { NotificationBell } from './lib/NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';
import { AcademicsDashboard } from './components/academics/AcademicsDashboard';
import { AssignmentsDashboard } from './components/assignments/AssignmentsDashboard';
import { ScheduleDashboard } from './components/schedule/ScheduleDashboard';
import { LibraryDashboard } from './components/library/LibraryDashboard';
import { ExamsDashboard } from './components/exams/ExamsDashboard';
import { AttendanceDashboard } from './components/attendance/AttendanceDashboard';
import { createClient } from './lib/supabase';
import { FinanceDashboard } from './components/finance/FinanceDashboard';
import { EventsDashboard } from './components/events/EventsDashboard';
import { HealthDashboard } from './components/health/HealthDashboard';
import { MessagesDashboard } from './components/messages/MessagesDashboard';
import { JobsDashboard } from './components/jobs/JobsDashboard';
import { ProfileDashboard } from './components/profile/ProfileDashboard';
import { SettingsDashboard } from './components/settings/SettingsDashboard';
import {
  LayoutDashboard, BookOpen, ClipboardList, CalendarDays, Library, FileText,
  CreditCard, MessageSquare, Calendar, Heart, Settings, User, LogOut,
  Search, Menu, X, Award, Clock, Moon, Sun, HelpCircle, Filter,
  BarChart3, Trophy, Briefcase,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };
const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'academics', label: 'Academics', icon: BookOpen },
  { key: 'assignments', label: 'Assignments', icon: ClipboardList },
  { key: 'attendance', label: 'Attendance', icon: CalendarDays },
  { key: 'schedule', label: 'Schedule', icon: Clock },
  { key: 'library', label: 'Library', icon: Library },
  { key: 'exams', label: 'Exams', icon: FileText },
  { key: 'finance', label: 'Finance', icon: CreditCard },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'events', label: 'Events', icon: Calendar },
  { key: 'health', label: 'Health', icon: Heart },
  { key: 'part-time-jobs', label: 'Part-Time Jobs', icon: Briefcase },
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function StudentPage() {
  const { t } = useLanguage();
  const { session, isReady, logout: authLogout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const profile = session?.student || null;
  const sid = session?.student?.id || '';
  const uid = session?.user?.id || '';
  const oid = session?.student?.organisation_id || session?.user?.organisation_id || '';

  // API hooks - dashboard loads immediately, others on demand
  const dash = useApi(() => dashboardApi.getStats(), [session], true);
  const timetableHook = useApi(() => timetableApi.getByStudent(), [session], false);
  const attendanceHook = useApi(() => attendanceApi.getByStudent(), [session], true);
  const assignmentsHook = useApi(() => assignmentApi.getByStudent(), [session], true);
  const examsHook = useApi(() => examApi.getByStudent(), [session], true);
  const marksHook = useApi(() => marksApi.getByStudent(), [session], true);
  const feesHook = useApi(() => feeApi.getByStudent(), [session], false);
  const libraryHook = useApi(() => libraryApi.getByUser(), [session], false);
  const certsHook = useApi(() => certificateApi.getByUser(), [session], false);
  const scholarshipsHook = useApi(() => scholarshipApi.getByStudent(), [session], false);
  const eventsHook = useApi(() => eventApi.getAll(), [session], false);
  const clubsHook = useApi(() => clubApi.getAll(), [session], false);
  const healthHook = useApi(() => healthApi.getByStudent(), [session], false);
  const messagesHook = useApi(() => messageApi.getConversations(), [session], false);
  const announcementsHook = useApi(() => announcementApi.getAll(), [session], false);
  const teachersHook = useApi(() => teacherApi.getAll(), [session], false);

  const dashData = dash.data as any;
  const attendanceData = attendanceHook.data as any[];
  const assignmentsData = assignmentsHook.data as any[];
  const examsData = examsHook.data as any[];
  const marksData = marksHook.data as any[];
  const feesData = feesHook.data as any[];
  const libraryData = libraryHook.data as any[];
  const certsData = certsHook.data as any[];
  const scholarshipsData = scholarshipsHook.data as any[];
  const eventsData = eventsHook.data as any[];
  const clubsData = clubsHook.data as any[];
  const healthData = healthHook.data as any;
  const messagesData = messagesHook.data as any[];
  const announcementsData = announcementsHook.data as any[];
  const teachersData = teachersHook.data as any[];

  // Attendance data derived from API hook (service-key backend, bypasses RLS)
  const liveAttendanceData = useMemo(() =>
    Array.isArray(attendanceData) ? attendanceData : [],
    [attendanceData]
  );

  const liveAttendanceStats = useMemo(() => {
    const data = liveAttendanceData;
    const present = data.filter((r: any) => r.status === 'present').length;
    const absent = data.filter((r: any) => r.status === 'absent').length;
    const late = data.filter((r: any) => r.status === 'late').length;
    const total = present + absent + late;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { percentage, present, absent, late, leave: 0, total };
  }, [liveAttendanceData]);

  const liveAttendanceChartData = useMemo(() => {
    const data = liveAttendanceData;
    const monthlyMap: Record<string, { present: number; absent: number; late: number; total: number }> = {};
    data.forEach((r: any) => {
      const d = new Date(r.date);
      const mName = d.toLocaleString('en-US', { month: 'short' });
      if (!monthlyMap[mName]) {
        monthlyMap[mName] = { present: 0, absent: 0, late: 0, total: 0 };
      }
      if (r.status === 'present') monthlyMap[mName].present++;
      else if (r.status === 'absent') monthlyMap[mName].absent++;
      else if (r.status === 'late') monthlyMap[mName].late++;
      monthlyMap[mName].total++;
    });
    const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return Object.entries(monthlyMap)
      .map(([month, val]) => ({
        month,
        rate: val.total > 0 ? Math.round(((val.present + val.late) / val.total) * 100) : 0,
        present: val.present,
        absent: val.absent,
        late: val.late
      }))
      .sort((a, b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month));
  }, [liveAttendanceData]);

  // Realtime subscription — triggers API refetch so data flows through the hook
  useEffect(() => {
    if (!sid) return;
    attendanceHook.refetch();

    const supabase = createClient();
    const channel = supabase
      .channel(`attendance_student_${sid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records',
          filter: `student_id=eq.${sid}`
        },
        (payload: any) => {
          console.log("Realtime student attendance update:", payload);
          attendanceHook.refetch();
          if (payload.eventType === 'INSERT') {
            toast.success(`Attendance marked: ${payload.new.status}`);
          } else if (payload.eventType === 'UPDATE') {
            toast.info(`Attendance updated: ${payload.new.status}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sid]);

  // Fetch data on tab change
  useEffect(() => {
    const refetchers: Record<string, () => void> = {
      schedule: timetableHook.refetch,
      attendance: attendanceHook.refetch,
      assignments: assignmentsHook.refetch,
      exams: examsHook.refetch,
      finance: feesHook.refetch,
      library: libraryHook.refetch,
      events: () => { eventsHook.refetch(); clubsHook.refetch(); },
      health: healthHook.refetch,
      messages: messagesHook.refetch,
      profile: certsHook.refetch,
      academics: marksHook.refetch,
    };
    const refetch = refetchers[activeTab];
    if (refetch) refetch();
  }, [activeTab]);

  const userInitials = session?.student?.full_name
    ? session.student.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'S';

  const logout = () => {
    try {
      const supabase = createClient();
      supabase.auth.signOut().catch(() => {});
    } catch {}
    authLogout();
  };

  const todaySchedule = Array.isArray(timetableHook.data)
    ? timetableHook.data.filter((t: any) =>
        Number(t.day_of_week) === new Date().getDay()
      ).sort((a: any, b: any) => (a.start_time || '00:00').localeCompare(b.start_time || '00:00'))
    : [];

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const todayTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const attendancePct = liveAttendanceStats.percentage;
  const dashGpa = marksData && marksData.length > 0
    ? (marksData.reduce((sum: number, m: any) => sum + (m.score || m.marks || 0), 0) / marksData.length / 10).toFixed(1)
    : '—';
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };
  const greeting = getGreeting();
  const studentFirstName = profile?.full_name?.split(' ')[0] || 'Student';
  const pendingAssignmentsCount = Array.isArray(assignmentsData)
    ? assignmentsData.filter((a: any) => a.status === 'pending' || !a.status).length
    : 0;
  const getLetterGrade = (gpaStr: string) => {
    if (gpaStr === '—') return '—';
    const gpa = parseFloat(gpaStr);
    if (gpa >= 9.0) return 'A+';
    if (gpa >= 8.0) return 'A';
    if (gpa >= 7.0) return 'B';
    if (gpa >= 6.0) return 'C';
    if (gpa >= 5.0) return 'D';
    return 'F';
  };
  const letterGrade = getLetterGrade(dashGpa);
  const assignmentsCount = Array.isArray(assignmentsData) ? assignmentsData.length : 0;
  const upcomingExamsCount = Array.isArray(examsData) ? examsData.length : 0;
  const presentCount = Array.isArray(attendanceData) ? attendanceData.filter((a: any) => a.status === 'present').length : 0;
  const absentCount = Array.isArray(attendanceData) ? attendanceData.filter((a: any) => a.status === 'absent').length : 0;
  const lateCount = Array.isArray(attendanceData) ? attendanceData.filter((a: any) => a.status === 'late').length : 0;
  const totalAttendance = Array.isArray(attendanceData) ? attendanceData.length : 0;
  const monthlyAttendancePct = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  // Build subject performance from marks
  const subjectPerformance = Array.isArray(marksData) && marksData.length > 0
    ? marksData.map((m: any) => ({
        name: m.subject_name || m.subject || 'Subject',
        marks: m.score || m.marks || 0,
        average: m.average || 70,
        progress: Math.min(100, (m.score || m.marks || 0)),
      }))
    : [];

  // Build monthly attendance chart data from attendance records
  const attendanceChartData = (() => {
    if (!Array.isArray(attendanceData) || attendanceData.length === 0) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const byMonth: Record<string, { present: number; absent: number; late: number }> = {};
    attendanceData.forEach((a: any) => {
      if (!a.date) return;
      const d = new Date(a.date);
      const key = months[d.getMonth()];
      if (!byMonth[key]) byMonth[key] = { present: 0, absent: 0, late: 0 };
      if (a.status === 'present') byMonth[key].present++;
      else if (a.status === 'absent') byMonth[key].absent++;
      else if (a.status === 'late') byMonth[key].late++;
    });
    return Object.entries(byMonth).map(([month, vals]) => ({ month, ...vals }));
  })();

  const monthlyProgress = Array.isArray(marksData) && marksData.length > 0
    ? marksData.reduce((acc: any[], m: any) => {
        if (!m.created_at && !m.date) return acc;
        const d = new Date(m.created_at || m.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const existing = acc.find((x: any) => x.key === key);
        if (existing) {
          existing.score = Math.max(existing.score, m.score || m.marks || 0);
        } else {
          acc.push({ key, month: d.toLocaleString('en-US', { month: 'short' }), score: m.score || m.marks || 0 });
        }
        return acc;
      }, []).slice(-6)
    : [];

  const totalFees = Array.isArray(feesData) ? feesData.reduce((sum: number, f: any) => sum + (f.amount || 0), 0) : 0;
  const paidFees = Array.isArray(feesData) ? feesData.filter((f: any) => f.status === 'paid' || f.status === 'Paid').reduce((sum: number, f: any) => sum + (f.amount || 0), 0) : 0;
  const pendingFees = totalFees - paidFees;

  const examCountdown = Array.isArray(examsData) ? examsData.slice(0, 3).map((e: any) => {
    const examDate = e.exam_date ? new Date(e.exam_date) : new Date();
    const days = Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return {
      name: e.exam_name || e.name || 'Exam',
      date: examDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      days: Math.max(0, days),
      color: days <= 3 ? COLORS.danger : days <= 7 ? COLORS.warning : COLORS.success,
    };
  }) : [];

  const achievementsList = Array.isArray(certsData) && certsData.length > 0
    ? certsData.slice(0, 4).map((c: any) => ({
        title: c.title || c.name || 'Certificate',
        desc: c.description || '',
        icon: Award,
        color: COLORS.primary,
      }))
    : [];

  // Redirect to the dedicated login page when session is missing (only after hydration)
  useEffect(() => {
    if (isReady && !session) {
      router.replace('/student/login');
    }
  }, [isReady, session, router]);
  return (
    <div className="app-layout">
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">P</div>
          <div><div className="sidebar-logo-text">Prasunet</div><div className="sidebar-logo-badge">Student Portal</div></div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.key} onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
                className={`sidebar-item ${activeTab === item.key ? 'active' : ''}`}
              ><Icon size={20} /><span>{item.label}</span></button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-help-card">
            <HelpCircle size={24} className="mb-2 opacity-80" />
            <div className="font-semibold text-sm">Need Help?</div>
            <div className="text-xs text-white/70 mt-0.5">Contact your teacher or IT support</div>
            <div className="flex gap-2 mt-3">
              <button className="text-xs h-7 px-3 rounded-lg bg-white/20 text-white hover:bg-white/30 font-medium transition-all">Support</button>
              <button className="text-xs h-7 px-3 rounded-lg border border-white/20 text-white hover:bg-white/10 font-medium transition-all">Guide</button>
            </div>
          </div>
          <button className="sidebar-footer-item" onClick={logout}><LogOut size={18} /><span>Sign Out</span></button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="header-mobile-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search assignments, exams, books..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <span className="search-badge hidden sm:flex"><span>⌘</span>K</span>
              {searchQuery && <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>}
            </div>
          </div>
          <div className="header-right">
            <LanguageSwitcher />
            <div className="header-divider" />
            <button className="header-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="header-divider" />
            <NotificationBell />
            <div className="header-divider" />
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('profile')}>
              <Avatar className="w-9 h-9 ring-2 ring-[#F3F0FF]">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6D4CFF] to-[#8B6FFF] text-white text-xs font-bold rounded-full">{userInitials}</div>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-xs font-semibold">{session?.student?.full_name || 'Student'}</div>
                <div className="text-[10px] text-gray-400">{session?.student?.student_class || session?.user?.role || 'Student'}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="page">
          <Toaster />

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

              {/* ===================== DASHBOARD ===================== */}
              {activeTab === 'dashboard' && (
                <div>
                  {dash.loading ? <LoadingSkeleton rows={6} cols={4} /> : dash.error ? <ErrorState message={dash.error} onRetry={dash.refetch} /> : (
                    <>
                      <div
                        className="hero-section"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="absolute inset-0 overflow-hidden rounded-3xl z-0 pointer-events-none">
                          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#EC4899]/15 blur-[80px]" />
                          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-[#3B82F6]/15 blur-[90px]" />
                          <div className="absolute top-[30%] left-[45%] w-60 h-60 rounded-full bg-[#F59E0B]/5 blur-[75px]" />
                          <div className="absolute top-[55%] right-[30%] w-40 h-40 rounded-full bg-[#A855F7]/10 blur-[60px]" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10" />

                          {[...Array(12)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{
                                opacity: [0.1, 0.4, 0.1],
                                y: [0, -(12 + (i % 4) * 6), 0],
                                x: [0, (i % 3 - 1) * 6, 0],
                              }}
                              transition={{
                                duration: 4 + (i % 3) * 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: i * 0.4,
                              }}
                              className="absolute rounded-full bg-white/40 pointer-events-none"
                              style={{
                                width: `${2 + (i % 3) * 1.5}px`,
                                height: `${2 + (i % 3) * 1.5}px`,
                                top: `${15 + (i * 12) % 70}%`,
                                left: `${10 + (i * 17) % 80}%`,
                              }}
                            />
                          ))}
                        </div>

                        <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                          {/* Left Side Content */}
                          <div className="w-full md:max-w-[55%] lg:max-w-[58%] flex-1 flex flex-col justify-center">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-purple-200 mb-2.5">
                              Student Dashboard
                            </div>
                            <h1
                              className="font-extrabold text-white tracking-tight mb-3 leading-tight"
                              style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)' }}
                            >
                              {greeting}, {studentFirstName}! 👋
                            </h1>
                            <p
                              className="text-white/90 leading-relaxed mb-6 font-medium"
                              style={{ fontSize: 'clamp(0.85rem, 1.2vw, 0.95rem)' }}
                            >
                              You have {pendingAssignmentsCount} pending assignment{pendingAssignmentsCount !== 1 ? 's' : ''} and {upcomingExamsCount} upcoming exam{upcomingExamsCount !== 1 ? 's' : ''}. Keep up the great work!
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6 w-full sm:w-auto">
                              <button
                                onClick={() => setActiveTab('assignments')}
                                className="bg-white/10 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 text-white font-bold rounded-2xl text-xs h-10 px-5 border border-white/15 backdrop-blur-md cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
                              >
                                <ClipboardList size={14} />
                                View Assignments
                              </button>
                              <button
                                onClick={() => setActiveTab('academics')}
                                className="bg-white/10 hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 text-white font-bold rounded-2xl text-xs h-10 px-5 border border-white/15 backdrop-blur-md cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
                              >
                                <Award size={14} />
                                View Results
                              </button>
                            </div>

                            {/* Quick Statistics (Glass Cards) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-4 pt-6 border-t border-white/10">
                              {[
                                { icon: ClipboardList, value: `${pendingAssignmentsCount}`, label: 'Pending Tasks', sub: 'Assignments' },
                                { icon: FileText, value: `${upcomingExamsCount}`, label: 'Upcoming Exams', sub: 'Next 30 Days' },
                                { icon: Award, value: `${letterGrade}`, label: 'Current Grade', sub: `GPA: ${dashGpa}` }
                              ].map((stat, idx) => {
                                const StatIcon = stat.icon;
                                return (
                                  <div
                                    key={idx}
                                    className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex flex-col justify-between shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] hover:bg-white/15 hover:border-white/25 hover:shadow-[0_12px_40px_0_rgba(109,76,255,0.2)] hover:-translate-y-1 transition-all duration-300 group w-full"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[9px] font-bold text-purple-200 uppercase tracking-wider">{stat.sub}</span>
                                      <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all">
                                        <StatIcon size={12} className="text-white" />
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xl font-extrabold text-white leading-none">{stat.value}</div>
                                      <div className="text-[10px] text-white/70 font-semibold mt-1.5">{stat.label}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Right Side Sticker with Floating Education Icons */}
                          <div className="w-full md:w-[40%] flex-shrink-0 relative overflow-visible flex items-center justify-center min-h-[280px] md:min-h-[360px]">
                            <motion.div
                              style={{ x: mousePos.x * 12, y: mousePos.y * 12 }}
                              className="absolute inset-0 flex items-center justify-center translate-x-3 translate-y-4 md:translate-x-6 md:translate-y-8 lg:translate-x-10 lg:translate-y-12"
                            >
                              {/* Soft purple-blue radial glow behind sticker */}
                              <motion.div
                                animate={{
                                  opacity: [0.3, 0.5, 0.3],
                                  scale: [0.95, 1.08, 0.95],
                                }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 4,
                                  ease: 'easeInOut',
                                }}
                                className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 rounded-full bg-[#8B5CF6]/20 blur-[60px] pointer-events-none"
                              />

                              {/* 5 Premium Floating Education Icons */}
                              {[
                                { icon: BookOpen, label: 'Books', x: '-28%', y: '-28%', delay: 0 },
                                { icon: ClipboardList, label: 'Assignments', x: '28%', y: '-24%', delay: 0.6 },
                                { icon: CalendarDays, label: 'Calendar', x: '-30%', y: '12%', delay: 1.2 },
                                { icon: Trophy, label: 'Trophy', x: '28%', y: '20%', delay: 1.8 },
                                { icon: BarChart3, label: 'Analytics', x: '-6%', y: '-42%', delay: 2.4 },
                              ].map((item, i) => {
                                const Icon = item.icon;
                                return (
                                  <motion.div
                                    key={i}
                                    animate={{
                                      y: [0, -10 - (i % 3) * 2, 0],
                                      rotate: [0, (i % 2 === 0 ? 6 : -6), 0],
                                      scale: [1, 1.05, 1],
                                    }}
                                    transition={{
                                      repeat: Infinity,
                                      duration: 5 + i * 0.4,
                                      delay: item.delay,
                                      ease: 'easeInOut',
                                    }}
                                    whileHover={{ scale: 1.2, rotate: 0 }}
                                    className="hidden md:flex absolute items-center justify-center z-20 pointer-events-auto cursor-pointer"
                                    style={{
                                      top: `calc(50% + ${item.y})`,
                                      left: `calc(50% + ${item.x})`,
                                    }}
                                    title={item.label}
                                  >
                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)] backdrop-blur-xl hover:bg-white/20 hover:border-white/30 transition-all duration-300">
                                      <Icon size={14} className="text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
                                    </div>
                                  </motion.div>
                                );
                              })}

                              {/* Student Sticker - transparent, no container, floats gently */}
                              <motion.img
                                animate={{ y: [0, -8, 0] }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 4,
                                  ease: 'easeInOut',
                                }}
                                whileHover={{ scale: 1.04 }}
                                src="/student-sticker.png"
                                alt="Student Mascot Illustration"
                                className="object-contain select-none pointer-events-none drop-shadow-[0_20px_40px_rgba(109,76,255,0.3)] filter w-[240px] md:w-[280px] xl:w-[340px] [@media(min-width:1366px)]:w-[360px] [@media(min-width:1600px)]:w-[410px] h-auto z-10"
                              />
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      {/* KPI Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                        {[
                          { icon: Award, label: 'GPA', value: dashGpa !== '—' ? dashGpa : '—', sub: dashGpa !== '—' ? 'On track' : 'No data', color: COLORS.success, bg: '#F0FDF4', trend: null },
                          { icon: ClipboardList, label: 'Assignments', value: `${assignmentsCount}`, sub: 'Total assigned', color: COLORS.warning, bg: '#FFFBEB', trend: null },
                          { icon: FileText, label: 'Upcoming Exams', value: `${upcomingExamsCount}`, sub: 'Next exam soon', color: COLORS.info, bg: '#EFF6FF', trend: null },
                        ].map((kpi, i) => {
                          const Icon = kpi.icon;
                          return (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="stat-card">
                              <div className="stat-card-icon" style={{ background: kpi.bg, color: kpi.color }}><Icon size={22} /></div>
                              <div className="text-xs text-gray-500 font-medium mb-0.5">{kpi.label}</div>
                              <div className="text-2xl font-extrabold text-gray-900">{kpi.value}</div>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-gray-400">{kpi.sub}</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Subject Performance */}
                        <Card className="p-6">
                          <h3 className="text-base font-bold mb-4">Subject Performance</h3>
                          {subjectPerformance.length > 0 ? (
                            <div className="space-y-4">
                              {subjectPerformance.map((s, i) => (
                                <div key={i}>
                                  <div className="flex items-center justify-between text-sm mb-1.5">
                                    <span className="font-medium">{s.name}</span>
                                    <span className="text-xs font-semibold">{s.marks}%</span>
                                  </div>
                                  <Progress value={s.progress} className="h-2" />
                                </div>
                              ))}
                            </div>
                          ) : <EmptyState message="No marks data yet" />}
                        </Card>

                        {/* Today's Schedule */}
                        <Card className="p-6">
                          <h3 className="text-base font-bold mb-4">Today's Classes</h3>
                          {timetableHook.loading ? <LoadingSkeleton rows={4} cols={1} /> : timetableHook.error ? <ErrorState message={timetableHook.error} onRetry={timetableHook.refetch} /> : todaySchedule.length > 0 ? (
                            <div className="space-y-3">
                              {todaySchedule.map((cls: any, i: number) => (
                                <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                  <div className="w-16 text-center flex-shrink-0">
                                    <div className="text-[10px] font-semibold text-[#6D4CFF]">{cls.start_time?.slice(0, 5) || '—'}</div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold">{cls.subject_name || cls.subjects?.name || 'Subject'}</div>
                                    <div className="text-xs text-gray-400">{cls.teacher_name || cls.teachers?.full_name || ''}</div>
                                  </div>
                                  <Badge variant="info" className="flex-shrink-0">{cls.room || cls.room_number || '—'}</Badge>
                                </div>
                              ))}
                            </div>
                          ) : <EmptyState message="No classes today" />}
                        </Card>

                        {/* Achievement Badges */}
                        <Card className="p-6">
                          <h3 className="text-base font-bold mb-4">🏆 Achievements</h3>
                          <div className="space-y-3">
                            {achievementsList.map((a, i) => {
                              const Icon = a.icon;
                              return (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${a.color}15`, color: a.color }}>
                                    <Icon size={20} />
                                  </div>
                                  <div>
                                    <div className="text-xs font-semibold">{a.title}</div>
                                    <div className="text-[10px] text-gray-400">{a.desc}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      </div>

                      {/* Charts Row */}
                      <div className="mb-8">
                        <Card className="p-6">
                          <h3 className="text-base font-bold mb-4">Monthly Progress</h3>
                          <div className="h-64">
                            {monthlyProgress.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyProgress}>
                                  <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#6D4CFF" stopOpacity={0.3} />
                                      <stop offset="95%" stopColor="#6D4CFF" stopOpacity={0} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                  <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
                                  <Tooltip />
                                  <Area type="monotone" dataKey="score" stroke="#6D4CFF" fill="url(#colorScore)" strokeWidth={2} />
                                </AreaChart>
                              </ResponsiveContainer>
                            ) : <EmptyState message="No progress data yet" />}
                          </div>
                        </Card>
                      </div>

                      {/* Quick Actions + Upcoming Exams */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="p-6">
                          <h3 className="text-base font-bold mb-4">⚡ Quick Actions</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { icon: BookOpen, label: 'Assignments', color: COLORS.primary, bg: '#F3F0FF' },
                              { icon: FileText, label: 'Check Results', color: COLORS.success, bg: '#F0FDF4' },
                              { icon: CreditCard, label: 'Pay Fees', color: COLORS.warning, bg: '#FFFBEB' },
                              { icon: MessageSquare, label: 'Message', color: COLORS.info, bg: '#EFF6FF' },
                              { icon: Library, label: 'Library', color: '#8B5CF6', bg: '#F5F3FF' },
                              { icon: CalendarDays, label: 'Calendar', color: COLORS.danger, bg: '#FEF2F2' },
                            ].map((qa, i) => {
                              const Icon = qa.icon;
                              return (
                                <button key={i} onClick={() => setActiveTab(qa.label.toLowerCase() === 'assignments' ? 'assignments' : qa.label.toLowerCase() === 'check results' ? 'exams' : qa.label.toLowerCase() === 'pay fees' ? 'finance' : qa.label.toLowerCase() === 'message' ? 'messages' : qa.label.toLowerCase() === 'library' ? 'library' : 'schedule')}
                                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
                                >
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: qa.bg, color: qa.color }}><Icon size={16} /></div>
                                  <span className="text-[11px] font-semibold">{qa.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </Card>

                        <Card className="p-6 lg:col-span-2">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold">📅 Upcoming Exams</h3>
                            <button onClick={() => setActiveTab('exams')} className="text-xs text-[#6D4CFF] font-semibold hover:underline">View all</button>
                          </div>
                          {examCountdown.length > 0 ? (
                            <div className="space-y-3">
                              {examCountdown.map((exam, i) => (
                                <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: exam.color }}>
                                    {exam.days}
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-semibold">{exam.name}</div>
                                    <div className="text-xs text-gray-400">{exam.date} • {exam.days} days left</div>
                                  </div>
                                  <Progress value={100 - (exam.days * 5)} className="w-16 h-1.5" />
                                </div>
                              ))}
                            </div>
                          ) : <EmptyState message="No upcoming exams" />}
                        </Card>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ===================== ACADEMICS ===================== */}
              {activeTab === 'academics' && (
                <AcademicsDashboard
                  marksData={marksData}
                  assignmentsData={assignmentsData}
                  examsData={examsData}
                  attendanceData={attendanceData}
                  subjectPerformance={subjectPerformance}
                  marksHook={marksHook}
                  assignmentsHook={assignmentsHook}
                  examsHook={examsHook}
                />
              )}

              {/* ===================== ASSIGNMENTS ===================== */}
              {activeTab === 'assignments' && (
                <AssignmentsDashboard
                  assignmentsData={assignmentsData}
                  assignmentsHook={assignmentsHook}
                />
              )}

              {/* ===================== ATTENDANCE ===================== */}
              {activeTab === 'attendance' && (
                <AttendanceDashboard
                  attendanceData={liveAttendanceData}
                  attendanceHook={attendanceHook}
                  attendancePct={liveAttendanceStats.percentage}
                  presentCount={liveAttendanceStats.present}
                  absentCount={liveAttendanceStats.absent}
                  lateCount={liveAttendanceStats.late}
                  totalAttendance={liveAttendanceStats.total}
                  monthlyAttendancePct={liveAttendanceStats.percentage}
                  attendanceChartData={liveAttendanceChartData}
                />
              )}


              {/* ===================== SCHEDULE ===================== */}
              {activeTab === 'schedule' && (
                <ScheduleDashboard
                  timetableHook={timetableHook}
                  todaySchedule={todaySchedule}
                  allSchedule={Array.isArray(timetableHook.data) ? timetableHook.data : []}
                />
              )}

              {/* ===================== LIBRARY ===================== */}
              {activeTab === 'library' && (
                <LibraryDashboard
                  libraryHook={libraryHook}
                  libraryData={libraryData}
                />
              )}

              {/* ===================== EXAMS ===================== */}
              {activeTab === 'exams' && (
                <ExamsDashboard
                  examsHook={examsHook}
                  marksHook={marksHook}
                  examsData={examsData}
                  marksData={marksData}
                  subjectPerformance={subjectPerformance}
                  monthlyProgress={monthlyProgress}
                  examCountdown={examCountdown}
                />
              )}

              {/* ===================== FINANCE ===================== */}
              {activeTab === 'finance' && (
                <FinanceDashboard
                  feesHook={feesHook}
                  scholarshipsHook={scholarshipsHook}
                  feesData={feesData}
                  scholarshipsData={scholarshipsData}
                  totalFees={totalFees}
                  paidFees={paidFees}
                  pendingFees={pendingFees}
                />
              )}

              {/* ===================== MESSAGES ===================== */}
              {activeTab === 'messages' && (
                <MessagesDashboard
                  messagesHook={messagesHook}
                  messagesData={messagesData}
                  teachersHook={teachersHook}
                  teachersData={teachersData}
                  announcementsHook={announcementsHook}
                  announcementsData={announcementsData}
                  session={session}
                />
              )}

              {/* ===================== EVENTS ===================== */}
              {activeTab === 'events' && (
                <EventsDashboard
                  eventsHook={eventsHook}
                  clubsHook={clubsHook}
                  eventsData={eventsData}
                  clubsData={clubsData}
                />
              )}

              {/* ===================== HEALTH ===================== */}
              {activeTab === 'health' && (
                <HealthDashboard
                  healthHook={healthHook}
                  healthData={healthData}
                />
              )}

              {/* ===================== PROFILE ===================== */}
              {activeTab === 'profile' && (
                <ProfileDashboard
                  certsHook={certsHook}
                  certsData={certsData}
                  session={session}
                />
              )}

              {/* ===================== PART-TIME JOBS ===================== */}
              {activeTab === 'part-time-jobs' && <JobsDashboard />}



              {/* ===================== SETTINGS ===================== */}
              {activeTab === 'settings' && (
                <SettingsDashboard
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}


