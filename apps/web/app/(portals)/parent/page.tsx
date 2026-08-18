'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLanguage } from './language/LanguageProvider';
import LanguageSwitcher from './language/LanguageSwitcher';
import { useAuth } from './contexts/AuthContext';
import { useApi, EmptyState, LoadingSkeleton, ErrorState } from './lib/useApi';
import { useRouter } from 'next/navigation';
import {
  childApi, attendanceApi, performanceApi, assignmentApi, examApi,
  teacherApi, feeApi, announcementApi, notificationApi, emergencyApi,
  transportApi, healthApi, messageApi, leaveApi, ptmApi, partTimeJobApi,
} from './lib/dataService';
import { NotificationBell } from './lib/NotificationBell';
import { ChildrenDashboard } from './components/parents/ChildrenDashboard';
import { AttendanceDashboard } from './components/parents/AttendanceDashboard';
import { createClient } from './lib/supabase';
import { FeesDashboard } from './components/parents/FeesDashboard';
import { AssignmentsDashboard } from './components/parents/AssignmentsDashboard';
import { ExamsDashboard } from './components/parents/ExamsDashboard';
import { MessagesDashboard } from './components/parents/MessagesDashboard';
import { TransportDashboard } from './components/parents/TransportDashboard';
import { HealthDashboard } from './components/parents/HealthDashboard';
import { SupportDashboard } from './components/parents/SupportDashboard';
import { PartTimeJobsDashboard } from './components/parents/PartTimeJobsDashboard';
import { ProfileDashboard } from './components/parents/ProfileDashboard';
import { SettingsDashboard } from './components/parents/SettingsDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, GraduationCap, CalendarCheck, Wallet, BookOpen,
  ClipboardList, MessageSquare, Bus, Heart, LifeBuoy, UserCircle,
  Settings, LogOut, Menu, Search, Bell, ChevronRight,
  TrendingUp, DollarSign, Clock, AlertCircle, CheckCircle2,
  X, Star, FileText, Download, Send, Phone, Mail, MapPin,
  ArrowUpRight, Plus, Filter, MoreHorizontal, Edit3,
  HelpCircle, MessagesSquare, TicketCheck, Briefcase, Mic, Award, CalendarDays,
  ChevronLeft, ArrowRight, Home, UserCheck, BarChart3,
  BookMarked, FileSpreadsheet, CalendarRange, Navigation, Calendar,
  MessageCircle, BellRing, FolderOpen, FileWarning, UserCog,
  Activity, ScrollText, Clock3, CheckSquare, Receipt, Map,
  Users2, Repeat, ListChecks, Timer, FileCheck, PanelLeftOpen,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  ResponsiveContainer,
} from 'recharts';
import { Button } from './components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };

type NavSection = { key: string; label: string; icon: any; badge?: string };

const NAV_SECTIONS: { label: string; items: NavSection[] }[] = [
  { label: 'Main', items: [
    { key: 'academic-progress', label: 'Academic Progress', icon: BarChart3 },
  ]},
  { label: 'Academic', items: [
    { key: 'homework', label: 'Homework', icon: BookMarked },
    { key: 'assignments', label: 'Assignments', icon: FileSpreadsheet },
    { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { key: 'exams', label: 'Exams', icon: ClipboardList },
    { key: 'results', label: 'Results', icon: Award },
    { key: 'timetable', label: 'Timetable', icon: CalendarDays },
  ]},
  { label: 'Finance', items: [
    { key: 'fees', label: 'Fees', icon: Wallet },
  ]},
  { label: 'Communication', items: [
    { key: 'messages', label: 'Messages', icon: MessageSquare, badge: '3' },
    { key: 'ptm', label: 'PTM', icon: Calendar },
    { key: 'announcements', label: 'Announcements', icon: BellRing },
  ]},
  { label: 'Services', items: [
    { key: 'transport', label: 'Transport', icon: Bus },
    { key: 'documents', label: 'Documents', icon: FolderOpen },
    { key: 'complaints', label: 'Complaints & Requests', icon: FileWarning },
  ]},
  { label: 'Account', items: [
    { key: 'settings', label: 'Settings', icon: Settings },
    { key: 'signout', label: 'Sign Out', icon: LogOut },
  ]},
];

function KpiCard({ icon: Icon, label, value, trend, color, bg, subtitle }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-[#6D4CFF]/20">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg || '#F3F0FF', color: color || '#6D4CFF' }}><Icon size={20} /></div>
        {trend && <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{trend}</span>}
      </div>
      <div className="text-[11px] text-gray-500 font-medium">{label}</div>
      <div className="text-xl font-extrabold text-gray-900 mt-0.5">{value ?? '—'}</div>
      {subtitle && <div className="text-[10px] text-gray-400 mt-0.5">{subtitle}</div>}
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  const map: Record<string, string> = {
    present: 'bg-emerald-100 text-emerald-700', absent: 'bg-red-100 text-red-700',
    late: 'bg-orange-100 text-orange-700', active: 'bg-emerald-100 text-emerald-700',
    submitted: 'bg-blue-100 text-blue-700', pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${map[s] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

function WidgetCard({ title, icon: Icon, children, action }: { title: string; icon?: any; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {Icon && <div className="w-8 h-8 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#6D4CFF]"><Icon size={16} /></div>}
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

const getChildEmoji = (name: string) => {
  const n = (name || '').toLowerCase();
  if (n.includes('aarav') || n.includes('boy') || n.includes('raj') || n.includes('rahul') || n.includes('amit')) return '👦';
  if (n.includes('anaya') || n.includes('girl') || n.includes('priya') || n.includes('sanya') || n.includes('sneha') || n.includes('ananya')) return '👧';
  return name.length % 2 === 0 ? '👦' : '👧';
};

export default function ParentsPage() {
  const { t } = useLanguage();
  const { session, isReady, logout: authLogout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };
  const handleMouseLeave = () => setMousePos({ x: 0, y: 0 });

  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [notifSettings, setNotifSettings] = useState({ email: true, sms: false, push: true, attendance: true });
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ reason: '', start_date: '', end_date: '', type: 'sick' });
  const [meetingForm, setMeetingForm] = useState({ teacher_id: '', date: '', time: '', reason: '' });
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', address: '' });
  const [profileTab, setProfileTab] = useState('overview');

  // WARNING: API routes use enforceUserAccess which checks parent_id against the JWT userId (users.id, NOT parents.id)
  const pid = session?.user?.id || session?.parent?.id || '';
  const uid = session?.user?.id || '';
  const oid = session?.parent?.organisation_id || session?.user?.organisation_id || '';
  const sid = selectedChild?.id || '';

  const formatTime12h = (timeStr: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const { data: childrenData, loading: childrenLoading, error: childrenError, refetch: refetchChildren } = useApi(() => pid ? childApi.getByParent(pid) : Promise.resolve({ success: true, data: null }), [pid], true);
  const { data: feesData } = useApi(() => sid ? feeApi.getByStudent(sid) : Promise.resolve({ success: true, data: null }), [sid], true);
  const { data: annData } = useApi(() => announcementApi.getAll(oid), [oid], !!oid);
  const { data: notifData } = useApi(() => notificationApi.getAll(uid), [uid], !!uid);
  const { data: emergData } = useApi(() => emergencyApi.getByOrg(oid), [oid], !!oid);

  const { data: attData, refetch: refetchAttendance } = useApi(() => sid ? attendanceApi.getByStudent(sid) : Promise.resolve({ success: true, data: null }), [sid], true);
  const { data: perfData } = useApi(() => sid ? performanceApi.getByStudent(sid) : Promise.resolve({ success: true, data: null }), [sid], true);
  const { data: assignData } = useApi(() => sid ? assignmentApi.getByStudent(sid) : Promise.resolve({ success: true, data: null }), [sid], true);
  const { data: examData } = useApi(() => sid ? examApi.getByStudent(sid) : Promise.resolve({ success: true, data: null }), [sid], true);
  const { data: teachData } = useApi(() => sid ? teacherApi.getByStudent(sid) : Promise.resolve({ success: true, data: null }), [sid], true);
  const { data: transportData } = useApi(() => sid ? transportApi.getByStudent(sid) : Promise.resolve({ success: true, data: null }), [sid], true);
  const { data: busLocData, refetch: refetchBus } = useApi(() => sid ? transportApi.getBusLocation(sid) : Promise.resolve({ success: true, data: null }), [sid], true);
  const { data: healthResult } = useApi(() => sid ? healthApi.getByStudent(sid) : Promise.resolve({ success: true, data: null }), [sid], true);
  const { data: vaccData } = useApi(() => sid ? healthApi.getVaccinations(sid) : Promise.resolve({ success: true, data: null }), [sid], true);
  const { data: messagesData, refetch: refetchMessages } = useApi(
    () => (selectedTeacher?.user_id && uid) ? messageApi.getMessages(uid, selectedTeacher.user_id) : Promise.resolve({ success: true, data: null }),
    [uid, selectedTeacher?.user_id], true
  );

  const dbChildren = Array.isArray(childrenData) ? childrenData : (childrenData?.students ?? childrenData?.children ?? []);
  const children = dbChildren;
  const notifArray = Array.isArray(notifData) ? notifData : (notifData?.notifications ?? []);
  const announcements = Array.isArray(annData) ? annData : (annData?.announcements ?? []);
  const assignments = Array.isArray(assignData) ? assignData : (assignData?.assignments ?? []);
  const teachers = Array.isArray(teachData) ? teachData : (teachData?.teachers ?? []);
  const messages = messagesData?.messages ?? [];
  const vaccinations = vaccData?.vaccinations ?? [];
  const emergencyContacts = Array.isArray(emergData) ? emergData : (emergData?.contacts ?? emergData ?? []);

  // Live attendance computed from backend API data
  const liveAttendance = useMemo(() => attData ? {
    rate: (attData as any)?.rate ?? (attData as any)?.percentage ?? 0,
    present: (attData as any)?.present ?? 0,
    absent: (attData as any)?.absent ?? 0,
    late: (attData as any)?.late ?? 0,
    monthly: (attData as any)?.monthly ?? [],
    recent_days: ((attData as any)?.records ?? []).map((r: any) => ({
      date: r.date,
      status: r.status,
      arrival: r.check_in_time ? formatTime12h(r.check_in_time) : '08:30 AM',
      departure: r.check_out_time ? formatTime12h(r.check_out_time) : '03:10 PM',
      remark: r.notes || '',
      reason: r.leave_reason || ''
    }))
  } : { rate: 0, present: 0, absent: 0, late: 0, monthly: [], recent_days: [] }, [attData]);
  const liveAttendanceRate = liveAttendance.rate;

  // Realtime subscription — triggers API refetch so data flows through the hook
  useEffect(() => {
    if (!sid) return;
    refetchAttendance?.();

    const supabase = createClient();
    const channel = supabase
      .channel(`attendance_child_${sid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records',
          filter: `student_id=eq.${sid}`
        },
        (payload: any) => {
          console.log("Realtime child attendance update:", payload);
          refetchAttendance?.();
          const childName = selectedChild?.full_name || 'Your child';
          if (payload.eventType === 'INSERT') {
            const status = payload.new.attendance_status;
            if (status === 'Absent') {
              toast.warning(`${childName} marked Absent today.`);
            } else {
              toast.success(`${childName}'s attendance marked as ${status}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sid, selectedChild]);

  const feesSummary = feesData ? {
    total_due: (feesData as any)?.total_due ?? (feesData as any)?.totalDue ?? 0,
    total_paid: (feesData as any)?.total_paid ?? (feesData as any)?.totalPaid ?? 0,
    upcoming: ((feesData as any)?.studentFees ?? []).filter((f: any) => f.status === 'pending').length > 0
      ? `$${((feesData as any)?.studentFees ?? []).filter((f: any) => f.status === 'pending').reduce((s: number, f: any) => s + parseFloat(f.amount || 0), 0)}`
      : '$0',
    payments: (feesData as any)?.studentFees ?? [],
  } : null;

  const transportInfo = transportData as any;
  const busLocation = busLocData as any;
  const healthData = healthResult as any;

  // Normalize exam data: legacy API returns { schedules, results }, map to { upcoming, results }
  const normalizedExamData = examData ? {
    ...examData,
    upcoming: (examData as any)?.upcoming ?? (examData as any)?.schedules ?? [],
    results: (examData as any)?.results ?? [],
  } : null;

  useEffect(() => {
    if (children.length > 0 && !selectedChild) setSelectedChild(children[0]);
  }, [children]);

  const logout = () => {
    try {
      const supabase = createClient();
      supabase.auth.signOut().catch(() => {});
    } catch {}
    authLogout();
    setSelectedChild(null);
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedTeacher || !uid) return;
    try {
      const res = await messageApi.send({ sender_id: uid, receiver_id: selectedTeacher.user_id, message: messageText });
      if (res.success) { refetchMessages(); setMessageText(''); } else toast.error('Failed to send message');
    } catch { toast.error('Failed to send message'); }
  };

  const submitLeave = async () => {
    if (!leaveForm.reason || !leaveForm.start_date || !leaveForm.end_date) { toast.error('Please fill all leave fields'); return; }
    try {
      const res = await leaveApi.apply({ parent_id: pid, student_id: sid, type: leaveForm.type, reason: leaveForm.reason, start_date: leaveForm.start_date, end_date: leaveForm.end_date });
      if (res.success) { toast.success('Leave application submitted'); setShowLeaveModal(false); setLeaveForm({ reason: '', start_date: '', end_date: '', type: 'sick' }); } else toast.error(res.error || 'Failed to submit leave');
    } catch { toast.error('Failed to submit leave'); }
  };

  const submitMeeting = async () => {
    if (!meetingForm.date || !meetingForm.time) { toast.error('Please fill meeting fields'); return; }
    try {
      const res = await ptmApi.book({ parent_id: pid, student_id: sid, teacher_id: meetingForm.teacher_id || teachers[0]?.user_id, date: meetingForm.date, time: meetingForm.time, reason: meetingForm.reason });
      if (res.success) { toast.success('Meeting booked successfully'); setShowMeetingModal(false); setMeetingForm({ teacher_id: '', date: '', time: '', reason: '' }); } else toast.error(res.error || 'Failed to book meeting');
    } catch { toast.error('Failed to book meeting'); }
  };

  const downloadReportCard = () => { if (!uid) return; window.open(`${API_BASE}/parents/fee-documents/${pid || uid}`, '_blank'); toast.success('Report card download initiated'); };
  const saveProfile = () => { setEditingProfile(false); toast.success('Profile updated successfully'); };
  const startEditingProfile = () => { setEditForm({ full_name: session?.user?.full_name || '', phone: session?.user?.phone || '', address: session?.user?.address || '' }); setEditingProfile(true); };

  const userInitials = session?.user?.full_name ? session.user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'P';
  const feesDue = feesSummary?.total_due ?? 0;
  const feesPaid = feesSummary?.total_paid ?? 0;

  const filteredChildren = searchQuery
    ? children.filter((c: any) => c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.class?.toLowerCase().includes(searchQuery.toLowerCase()))
    : children;

  const filteredAssignments = searchQuery
    ? assignments.filter((a: any) => a.title?.toLowerCase().includes(searchQuery.toLowerCase()) || a.subject?.toLowerCase().includes(searchQuery.toLowerCase()))
    : assignments;

  const filteredTeachers = searchQuery
    ? teachers.filter((t: any) => t.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject?.toLowerCase().includes(searchQuery.toLowerCase()))
    : teachers;

  const navigateTo = useCallback((view: string) => {
    if (view === 'signout') { logout(); return; }
    setActiveView(view);
    setSidebarOpen(false);
  }, [logout]);

  const filteredNotifs = notifArray.filter((n: any) => !n.read).length;

  // Redirect to the dedicated login page when session is missing (only after hydration)
  useEffect(() => {
    if (isReady && !session) {
      router.replace('/parent/login');
    }
  }, [isReady, session, router]);

  // ===================== RAIL NAV ITEMS =====================
  const currentSection = NAV_SECTIONS.find(s => s.items.some(i => i.key === activeView)) || NAV_SECTIONS[0];

  // ===================== VIEW RENDERER =====================
  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return renderDashboard();
      case 'attendance': return (
        <AttendanceDashboard
          attendance={liveAttendance}
          attendanceRate={liveAttendanceRate}
          selectedChild={selectedChild}
          setActiveTab={navigateTo}
          children={children}
          setSelectedChild={setSelectedChild}
          searchQuery={searchQuery}
          notifArray={notifArray}
        />
      );
      case 'my-children': return <ChildrenDashboard children={children} selectedChild={selectedChild} setSelectedChild={setSelectedChild} setActiveTab={navigateTo} searchQuery={searchQuery} attendance={liveAttendance} attendanceRate={liveAttendanceRate} assignments={assignments} teachers={teachers} examData={normalizedExamData} perfData={perfData} transportInfo={transportInfo} healthData={healthData} vaccinations={vaccinations} feesSummary={feesSummary} feesDue={feesDue} notifArray={notifArray} announcements={announcements} emergencyContacts={emergencyContacts} childrenHook={{ loading: childrenLoading, error: childrenError }} />;
      case 'academic-progress': return renderAcademicProgress();
      case 'homework': return renderHomework();
      case 'assignments': return <AssignmentsDashboard assignments={assignments} searchQuery={searchQuery} selectedChild={selectedChild} setActiveTab={navigateTo} children={children} setSelectedChild={setSelectedChild} perfData={perfData} />;
      case 'exams': return <ExamsDashboard examData={normalizedExamData} searchQuery={searchQuery} selectedChild={selectedChild} setActiveTab={navigateTo} children={children} setSelectedChild={setSelectedChild} />;
      case 'results': return renderResults();
      case 'fees': return <FeesDashboard feesSummary={feesSummary} feesPaid={feesPaid} feesDue={feesDue} selectedChild={selectedChild} setActiveTab={navigateTo} children={children} setSelectedChild={setSelectedChild} searchQuery={searchQuery} downloadReportCard={downloadReportCard} />;
      case 'timetable': return renderTimetable();
      case 'transport': return <TransportDashboard transportInfo={transportInfo} busLocation={busLocation} refetchBus={refetchBus} selectedChild={selectedChild} children={children} setSelectedChild={setSelectedChild} />;
      case 'messages': return <MessagesDashboard messages={messages} teachers={teachers} selectedTeacher={selectedTeacher} setSelectedTeacher={setSelectedTeacher} messageText={messageText} setMessageText={setMessageText} sendMessage={sendMessage} filteredTeachers={filteredTeachers} uid={uid} searchQuery={searchQuery} refetchMessages={refetchMessages} selectedChild={selectedChild} />;
      case 'ptm': return renderPTM();
      case 'announcements': return renderAnnouncements();
      case 'documents': return renderDocuments();
      case 'complaints': return <SupportDashboard setActiveTab={navigateTo} downloadReportCard={downloadReportCard} teachers={teachers} submitLeave={submitLeave} submitMeeting={submitMeeting} leaveForm={leaveForm} setLeaveForm={setLeaveForm} meetingForm={meetingForm} setMeetingForm={setMeetingForm} />;
      case 'settings': return <SettingsDashboard notifSettings={notifSettings} setNotifSettings={setNotifSettings} />;
      default: return renderDashboard();
    }
  };

  // ===================== DASHBOARD =====================
  const renderDashboard = () => {
    const upcomingExams = Array.isArray(normalizedExamData?.upcoming) ? normalizedExamData.upcoming : [];
    const pendingHomework = assignments.filter((a: any) => a.status === 'pending' || a.status === 'assigned');
    const latestResults = Array.isArray(normalizedExamData?.results) ? normalizedExamData.results : [];
    const dueInvoices = Array.isArray(feesSummary?.payments) ? feesSummary.payments.filter((p: any) => p.status === 'pending' || p.status === 'overdue') : [];

    return (
      <div className="w-full min-w-0">
        <div className="hero-section" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <div className="absolute inset-0 overflow-hidden rounded-2xl z-0 pointer-events-none">
            <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#EC4899]/15 blur-[80px]" />
            <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-[#3B82F6]/15 blur-[90px]" />
            <div className="absolute top-[30%] left-[45%] w-60 h-60 rounded-full bg-[#F59E0B]/5 blur-[75px]" />
            <div className="absolute top-[55%] right-[30%] w-40 h-40 rounded-full bg-[#A855F7]/10 blur-[60px]" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-200 mb-2">Prasunet Parents Portal</div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-2">Stay connected with your child&apos;s education</h1>
                <p className="text-sm text-white/80 max-w-lg">Track grades, assignments, fees, and school updates — all in one place.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => navigateTo('academic-progress')} className="bg-white text-[#6D4CFF] hover:bg-white/95 font-bold rounded-xl text-xs h-9 px-4 shadow-[0_4px_12px_rgba(255,255,255,0.15)] border-0 cursor-pointer">View Progress</Button>
                <Button onClick={() => navigateTo('messages')} className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-9 px-4 border border-white/25 cursor-pointer backdrop-blur-sm">Contact School</Button>
                <Button onClick={() => navigateTo('fees')} className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-9 px-4 border border-white/25 cursor-pointer backdrop-blur-sm">Pay Fees</Button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== DASHBOARD KPIS ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
          <KpiCard icon={ClipboardList} label="Upcoming Exams" value={upcomingExams.length} color="#F59E0B" bg="#FFFBEB" />
          <KpiCard icon={BookOpen} label="Pending Homework" value={pendingHomework.length} color="#3B82F6" bg="#EFF6FF" />
          <KpiCard icon={Award} label="Latest Results" value={latestResults.length} color="#22C55E" bg="#F0FDF4" />
          <KpiCard icon={Wallet} label="Fees Due" value={`$${feesDue}`} color="#EF4444" bg="#FEF2F2" subtitle={dueInvoices.length > 0 ? `${dueInvoices.length} pending invoices` : 'All paid'} />
          <KpiCard icon={Bell} label="Notifications" value={notifArray.length} color="#EC4899" bg="#FDF2F8" subtitle={`${filteredNotifs} unread`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <WidgetCard title="Academic Progress" icon={BarChart3} action={
              <Button variant="ghost" size="sm" className="text-gray-400" onClick={() => navigateTo('academic-progress')}><ArrowRight size={14} /></Button>
            }>
              <div className="h-64">
                {(perfData?.subjects || []).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(perfData.subjects as any[]).map((s: any) => ({ subject: s.subject || s.name, score: s.score || s.marks || 0 }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                      <Bar dataKey="score" fill="#6D4CFF" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-gray-400 text-sm">No performance data yet</div>}
              </div>
            </WidgetCard>

            <WidgetCard title="Fee Due Status" icon={Wallet} action={
              feesDue > 0 && <Button size="sm" className="bg-[#6D4CFF] text-white text-xs rounded-lg px-3 h-8" onClick={() => navigateTo('fees')}>Pay Now</Button>
            }>
              {feesSummary ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                    <div><div className="text-sm font-bold text-gray-900">${feesPaid.toLocaleString()}</div><div className="text-[11px] text-gray-500">Total Paid</div></div>
                    <div className="w-px h-10 bg-gray-200" />
                    <div><div className="text-sm font-bold text-red-600">${feesDue.toLocaleString()}</div><div className="text-[11px] text-gray-500">Total Due</div></div>
                    <div className="w-px h-10 bg-gray-200" />
                    <div><div className="text-sm font-bold text-gray-900">{feesSummary.upcoming}</div><div className="text-[11px] text-gray-500">Upcoming</div></div>
                  </div>
                  {dueInvoices.length > 0 && (
                    <div className="space-y-2">
                      {dueInvoices.slice(0, 3).map((inv: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                          <div><div className="text-xs font-semibold">{inv.title || `Invoice #${inv.id}`}</div><div className="text-[10px] text-gray-400">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : ''}</div></div>
                          <div className="text-right"><div className="text-xs font-bold">${inv.amount || 0}</div><span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-red-100 text-red-700">{inv.status || 'Pending'}</span></div>
                        </div>
                      ))}
                    </div>
                  )}
                  {dueInvoices.length === 0 && <div className="text-center py-6"><CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" /><p className="text-sm text-gray-500">All fees are paid up to date!</p></div>}
                </div>
              ) : <div className="text-center py-6 text-sm text-gray-400">No fee data available</div>}
            </WidgetCard>
          </div>

          <div className="space-y-6">
            <WidgetCard title="Upcoming Exams" icon={ClipboardList}>
              {upcomingExams.length > 0 ? (
                <div className="space-y-3">
                  {upcomingExams.slice(0, 4).map((exam: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-9 h-9 rounded-lg bg-[#FFF3E0] flex items-center justify-center text-[#F59E0B] flex-shrink-0"><FileText size={16} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate">{exam.title || exam.name || `Exam ${i + 1}`}</div>
                        <div className="text-[10px] text-gray-400">{exam.date ? new Date(exam.date).toLocaleDateString() : exam.subject || ''}</div>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-100 text-amber-700">{exam.status || 'Scheduled'}</span>
                    </div>
                  ))}
                </div>
              ) : <div className="text-center py-6 text-sm text-gray-400">No upcoming exams</div>}
              <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-[#6D4CFF]" onClick={() => navigateTo('exams')}>View All Exams</Button>
            </WidgetCard>

            <WidgetCard title="Pending Homework" icon={BookMarked}>
              {pendingHomework.length > 0 ? (
                <div className="space-y-3">
                  {pendingHomework.slice(0, 3).map((hw: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6] flex-shrink-0"><BookOpen size={16} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate">{hw.title || hw.name || `Homework ${i + 1}`}</div>
                        <div className="text-[10px] text-gray-400">{hw.subject || ''} {hw.due_date ? `• Due ${new Date(hw.due_date).toLocaleDateString()}` : ''}</div>
                      </div>
                      <StatusBadge status={hw.status || 'pending'} />
                    </div>
                  ))}
                </div>
              ) : <div className="text-center py-6 text-sm text-gray-400">No pending homework</div>}
              <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-[#6D4CFF]" onClick={() => navigateTo('homework')}>View All Homework</Button>
            </WidgetCard>

            <WidgetCard title="School Announcements" icon={BellRing}>
              {announcements.length > 0 ? (
                <div className="space-y-2">
                  {announcements.slice(0, 4).map((a: any, i: number) => (
                    <div key={a.id || i} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50">
                      <div className="w-2 h-2 rounded-full bg-[#6D4CFF] mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold">{a.title || 'Announcement'}</div>
                        <div className="text-[10px] text-gray-400">{a.date ? new Date(a.date).toLocaleDateString() : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-center py-6 text-sm text-gray-400">No announcements yet</div>}
              <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-[#6D4CFF]" onClick={() => navigateTo('announcements')}>View All</Button>
            </WidgetCard>

            <WidgetCard title="PTM Schedule" icon={Calendar}>
              <div className="text-center py-6">
                <CalendarDays size={32} className="text-[#6D4CFF]/40 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">No upcoming PTM meetings</p>
                <Button size="sm" className="bg-[#6D4CFF] text-white text-xs rounded-lg mt-2" onClick={() => navigateTo('ptm')}>Book a Meeting</Button>
              </div>
            </WidgetCard>

            <WidgetCard title="Recent Messages" icon={MessageSquare}>
              {teachers.length > 0 ? (
                <div className="space-y-2">
                  {teachers.slice(0, 3).map((t: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer hover:bg-[#F3F0FF] transition-colors" onClick={() => { setSelectedTeacher(t); navigateTo('messages'); }}>
                      <Avatar className="w-8 h-8"><AvatarFallback className="text-[10px] bg-[#6D4CFF] text-white">{(t.full_name || 'T')[0]}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold">{t.full_name || `Teacher ${i + 1}`}</div>
                        <div className="text-[10px] text-gray-400">{t.subject || t.role || 'Teacher'}</div>
                      </div>
                      <MessageSquare size={14} className="text-gray-300" />
                    </div>
                  ))}
                </div>
              ) : <div className="text-center py-6 text-sm text-gray-400">No teachers assigned yet</div>}
              <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-[#6D4CFF]" onClick={() => navigateTo('messages')}>Send Message</Button>
            </WidgetCard>
          </div>
        </div>
      </div>
    );
  };

  // ===================== ACADEMIC PROGRESS =====================
  const renderAcademicProgress = () => {
    const subjects = (perfData?.subjects || perfData?.data?.subjects || []) as any[];
    const chartData = subjects.map((s: any) => ({ subject: s.subject || s.name, score: s.score || s.marks || 0 }));
    const teacherRemarks = teachers.map((t: any) => ({ teacher: t.full_name, subject: t.subject, remark: 'Good progress. Keep it up!', date: new Date().toISOString() }));

    return (
      <div className="w-full min-w-0">
        <div className="page-header"><h1 className="text-xl font-extrabold">Academic Progress</h1><p className="text-sm text-gray-400">Subject-wise performance and progress reports for {selectedChild?.full_name || 'your child'}</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="p-5 mb-6">
              <h3 className="text-sm font-bold mb-4">Subject-wise Performance</h3>
              <div className="h-80">
                {subjects.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                      <Bar dataKey="score" fill="#6D4CFF" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-gray-400">No performance data yet</div>}
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Overall Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span>Average Score</span><span className="font-bold">{subjects.length > 0 ? Math.round(subjects.reduce((s: any, sub: any) => s + (sub.score || sub.marks || 0), 0) / subjects.length) : '—'}%</span></div>
                  <Progress value={subjects.length > 0 ? Math.round(subjects.reduce((s: any, sub: any) => s + (sub.score || sub.marks || 0), 0) / subjects.length) : 0} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1"><span>Assignments Completed</span><span className="font-bold">{assignments.filter((a: any) => a.status === 'submitted').length}/{assignments.length}</span></div>
                  <Progress value={assignments.length > 0 ? (assignments.filter((a: any) => a.status === 'submitted').length / assignments.length) * 100 : 0} className="h-2" />
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Progress Reports</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 cursor-pointer hover:bg-[#F3F0FF]">
                  <div className="flex items-center gap-2"><FileText size={14} className="text-[#6D4CFF]" /><span className="text-xs font-semibold">Term 1 Report</span></div>
                  <Download size={14} className="text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 cursor-pointer hover:bg-[#F3F0FF]">
                  <div className="flex items-center gap-2"><FileText size={14} className="text-[#6D4CFF]" /><span className="text-xs font-semibold">Term 2 Report</span></div>
                  <Download size={14} className="text-gray-400" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 cursor-pointer hover:bg-[#F3F0FF]">
                  <div className="flex items-center gap-2"><FileText size={14} className="text-[#6D4CFF]" /><span className="text-xs font-semibold">Annual Report</span></div>
                  <Download size={14} className="text-gray-400" />
                </div>
              </div>
            </Card>
          </div>
        </div>
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">Teacher Remarks</h3>
          {teacherRemarks.length > 0 ? (
            <div className="space-y-3">
              {teacherRemarks.map((r: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                  <Avatar className="w-8 h-8"><AvatarFallback className="text-[10px] bg-[#6D4CFF] text-white">{r.teacher?.[0] || 'T'}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><span className="text-xs font-semibold">{r.teacher}</span><span className="text-[10px] text-gray-400">{r.subject}</span></div>
                    <p className="text-xs text-gray-600">{r.remark}</p>
                    <div className="text-[10px] text-gray-400 mt-1">{new Date(r.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="text-center py-6 text-sm text-gray-400">No teacher remarks yet</div>}
        </Card>
      </div>
    );
  };

  // ===================== HOMEWORK =====================
  const renderHomework = () => {
    const grouped = {
      pending: assignments.filter((a: any) => a.status === 'pending' || a.status === 'assigned'),
      submitted: assignments.filter((a: any) => a.status === 'submitted'),
      overdue: assignments.filter((a: any) => a.status === 'overdue' || (a.due_date && new Date(a.due_date) < new Date() && a.status !== 'submitted')),
    };

    return (
      <div className="w-full min-w-0">
        <div className="page-header"><h1 className="text-xl font-extrabold">Homework</h1><p className="text-sm text-gray-400">Track assigned homework, submission status, and due dates</p></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <KpiCard icon={BookOpen} label="Pending" value={grouped.pending.length} color="#F59E0B" bg="#FFFBEB" />
          <KpiCard icon={CheckCircle2} label="Submitted" value={grouped.submitted.length} color="#22C55E" bg="#F0FDF4" />
          <KpiCard icon={AlertCircle} label="Overdue" value={grouped.overdue.length} color="#EF4444" bg="#FEF2F2" />
          <KpiCard icon={FileText} label="Total" value={assignments.length} color="#6D4CFF" bg="#F3F0FF" />
        </div>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending ({grouped.pending.length})</TabsTrigger>
            <TabsTrigger value="submitted">Submitted ({grouped.submitted.length})</TabsTrigger>
            <TabsTrigger value="overdue">Overdue ({grouped.overdue.length})</TabsTrigger>
          </TabsList>
          {(['pending', 'submitted', 'overdue'] as const).map(tab => (
            <TabsContent key={tab} value={tab}>
              {grouped[tab].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped[tab].map((hw: any, i: number) => (
                    <Card key={hw.id || i} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tab === 'submitted' ? 'bg-green-50 text-green-600' : tab === 'overdue' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                            {tab === 'submitted' ? <CheckCircle2 size={16} /> : tab === 'overdue' ? <AlertCircle size={16} /> : <Clock size={16} />}
                          </div>
                          <div><div className="text-xs font-bold">{hw.title || hw.name || `Homework ${i + 1}`}</div><div className="text-[10px] text-gray-400">{hw.subject || ''}</div></div>
                        </div>
                        <StatusBadge status={hw.status || tab} />
                      </div>
                      {hw.due_date && <div className="text-[10px] text-gray-400 mb-2">Due: {new Date(hw.due_date).toLocaleDateString()}</div>}
                      {hw.description && <p className="text-[11px] text-gray-600 line-clamp-2">{hw.description}</p>}
                      <div className="mt-3 flex items-center gap-2">
                        {hw.attachment_url && <Button variant="outline" size="sm" className="text-[10px] h-7 px-2"><Download size={10} /> Download</Button>}
                        {tab === 'pending' && <Button size="sm" className="bg-[#6D4CFF] text-white text-[10px] h-7 px-3">Mark Complete</Button>}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : <EmptyState message={`No ${tab} homework`} />}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  };

  // ===================== RESULTS =====================
  const renderResults = () => {
    const resultsList = Array.isArray(normalizedExamData?.results) ? normalizedExamData.results : [];
    const reportCards = [
      { name: 'Term 1 Report Card', date: '2025-12-15', type: 'Term', downloadable: true },
      { name: 'Term 2 Report Card', date: '2026-03-20', type: 'Term', downloadable: true },
      { name: 'Annual Report Card', date: '2026-05-30', type: 'Annual', downloadable: true },
    ];

    return (
      <div className="w-full min-w-0">
        <div className="page-header"><h1 className="text-xl font-extrabold">Results</h1><p className="text-sm text-gray-400">Exam results and report cards for {selectedChild?.full_name || 'your child'}</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="p-5 mb-6">
              <h3 className="text-sm font-bold mb-4">Recent Results</h3>
              {resultsList.length > 0 ? (
                <div className="space-y-3">
                  {resultsList.map((r: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                      <div>
                        <div className="text-sm font-semibold">{r.subject || r.name || `Result ${i + 1}`}</div>
                        <div className="text-[11px] text-gray-400">{r.date ? new Date(r.date).toLocaleDateString() : ''} {r.exam_name ? `• ${r.exam_name}` : ''}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-extrabold" style={{ color: (r.score || r.marks || 0) >= 80 ? '#22C55E' : (r.score || 0) >= 40 ? '#F59E0B' : '#EF4444' }}>
                          {r.score || r.marks || 0}%
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold ${(r.score || 0) >= 80 ? 'bg-green-100 text-green-700' : (r.score || 0) >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {(r.score || 0) >= 80 ? 'Excellent' : (r.score || 0) >= 60 ? 'Good' : (r.score || 0) >= 40 ? 'Average' : 'Needs Improvement'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-center py-10 text-sm text-gray-400">No results available yet</div>}
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-4">Report Cards</h3>
              <div className="space-y-3">
                {reportCards.map((rc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 cursor-pointer hover:bg-[#F3F0FF] transition-colors" onClick={downloadReportCard}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#6D4CFF]"><Award size={16} /></div>
                      <div><div className="text-xs font-semibold">{rc.name}</div><div className="text-[10px] text-gray-400">{new Date(rc.date).toLocaleDateString()} • {rc.type}</div></div>
                    </div>
                    <Download size={14} className="text-gray-400" />
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Download Marksheet</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-between text-xs" onClick={downloadReportCard}><span>Consolidated Marksheet</span><Download size={12} /></Button>
                <Button variant="outline" size="sm" className="w-full justify-between text-xs" onClick={downloadReportCard}><span>Subject-wise Marksheet</span><Download size={12} /></Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // ===================== TIMETABLE =====================
  const renderTimetable = () => {
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = ['8:00 - 8:45', '8:45 - 9:30', '9:30 - 10:15', '10:15 - 11:00', '11:00 - 11:30', '11:30 - 12:15', '12:15 - 1:00', '1:00 - 1:45'];
    const subjects = ['Mathematics', 'English', 'Science', 'Social Studies', 'Break', 'Hindi', 'Computer', 'Physical Edu.'];
    const colors = ['#6D4CFF', '#3B82F6', '#22C55E', '#F59E0B', 'transparent', '#EC4899', '#14B8A6', '#EF4444'];

    return (
      <div className="w-full min-w-0">
        <div className="page-header"><h1 className="text-xl font-extrabold">Timetable</h1><p className="text-sm text-gray-400">Daily and weekly class schedule for {selectedChild?.full_name || 'your child'}</p></div>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="mb-6"><TabsTrigger value="weekly">Weekly Schedule</TabsTrigger><TabsTrigger value="daily">Daily Timetable</TabsTrigger></TabsList>
          <TabsContent value="weekly">
            <Card className="p-5">
              <div className="table-wrapper">
                <table className="w-full text-xs">
                <thead>
                  <tr><th className="text-left p-3 font-bold text-gray-500 border-b">Period</th>{weekDays.map(d => <th key={d} className="p-3 font-bold text-gray-500 border-b text-center">{d}</th>)}</tr>
                </thead>
                <tbody>
                  {periods.map((time, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
                      <td className="p-3 font-semibold text-gray-500 border-b whitespace-nowrap">{time}</td>
                      {weekDays.map((_, di) => (
                        <td key={di} className="p-2 border-b text-center">
                          {subjects[i] !== 'Break' ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white" style={{ background: colors[i] }}>
                              {subjects[i]}
                            </div>
                          ) : <span className="text-gray-400 font-semibold">Break</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          </TabsContent>
          <TabsContent value="daily">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-4">Today's Schedule</h3>
              <div className="space-y-3">
                {periods.map((time, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                    <div className="w-20 text-[11px] font-semibold text-gray-500">{time}</div>
                    {subjects[i] !== 'Break' ? (
                      <div className="flex items-center gap-2.5 flex-1">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: colors[i] }} />
                        <span className="text-xs font-semibold">{subjects[i]}</span>
                        <span className="text-[10px] text-gray-400">Room {101 + i}</span>
                      </div>
                    ) : <div className="flex-1 text-xs text-gray-400 italic">Break Time</div>}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // ===================== PTM =====================
  const renderPTM = () => {
    return (
      <div className="w-full min-w-0">
        <div className="page-header"><h1 className="text-xl font-extrabold">Parent-Teacher Meetings</h1><p className="text-sm text-gray-400">Book PTM slots and view meeting history</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-4">Upcoming Meetings</h3>
              <div className="text-center py-10 text-sm text-gray-400">
                <CalendarDays size={40} className="text-gray-200 mx-auto mb-3" />
                <p>No upcoming PTM meetings scheduled</p>
                <Button size="sm" className="bg-[#6D4CFF] text-white text-xs rounded-lg mt-3" onClick={() => setShowMeetingModal(true)}>Book New Meeting</Button>
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-4">Meeting History</h3>
              <div className="text-center py-10 text-sm text-gray-400">
                <Clock size={40} className="text-gray-200 mx-auto mb-3" />
                <p>No past meetings</p>
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button className="w-full justify-start gap-2 text-xs bg-[#6D4CFF] text-white" onClick={() => setShowMeetingModal(true)}><Calendar size={14} /> Book PTM Slot</Button>
                <Button variant="outline" className="w-full justify-start gap-2 text-xs" onClick={() => navigateTo('messages')}><MessageSquare size={14} /> Message Teacher</Button>
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Teachers</h3>
              {teachers.length > 0 ? (
                <div className="space-y-2">
                  {teachers.map((t: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedTeacher(t); setShowMeetingModal(true); }}>
                      <Avatar className="w-7 h-7"><AvatarFallback className="text-[8px] bg-[#6D4CFF] text-white">{(t.full_name || 'T')[0]}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold">{t.full_name}</div>
                        <div className="text-[10px] text-gray-400">{t.subject || 'Teacher'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-center py-4 text-xs text-gray-400">No teachers assigned</div>}
            </Card>
          </div>
        </div>

        {showMeetingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowMeetingModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="font-bold text-sm">Book PTM Slot</h3>
                <button onClick={() => setShowMeetingModal(false)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700">×</button>
              </div>
              <div className="p-5 space-y-4 text-xs">
                <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Teacher</label>
                  <select value={meetingForm.teacher_id} onChange={e => setMeetingForm({ ...meetingForm, teacher_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                    <option value="">Select Teacher</option>
                    {teachers.map((t: any) => <option key={t.user_id || t.id} value={t.user_id || t.id}>{t.full_name} - {t.subject}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Date</label>
                  <input type="date" value={meetingForm.date} onChange={e => setMeetingForm({ ...meetingForm, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
                </div>
                <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Time</label>
                  <input type="time" value={meetingForm.time} onChange={e => setMeetingForm({ ...meetingForm, time: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
                </div>
                <div><label className="text-xs font-semibold text-gray-700 mb-1 block">Reason (optional)</label>
                  <textarea value={meetingForm.reason} onChange={e => setMeetingForm({ ...meetingForm, reason: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" placeholder="Any specific topics to discuss..." />
                </div>
                <button onClick={submitMeeting} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg transition-all">Book Meeting</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  };

  // ===================== ANNOUNCEMENTS =====================
  const renderAnnouncements = () => (
    <div className="w-full min-w-0">
      <div className="page-header"><h1 className="text-xl font-extrabold">Announcements</h1><p className="text-sm text-gray-400">School announcements and circulars</p></div>
      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((a: any, i: number) => (
            <Card key={a.id || i} className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F3F0FF] flex items-center justify-center text-[#6D4CFF] flex-shrink-0"><BellRing size={18} /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold">{a.title || 'Announcement'}</h3>
                    {a.priority === 'high' && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-red-100 text-red-700">Important</span>}
                  </div>
                  {a.content && <p className="text-xs text-gray-600 mb-2">{a.content}</p>}
                  <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    {a.date && <span>{new Date(a.date).toLocaleDateString()}</span>}
                    {a.author && <span>By {a.author}</span>}
                    {a.category && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-blue-100 text-blue-700">{a.category}</span>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : <EmptyState message="No announcements yet" />}
    </div>
  );

  // ===================== DOCUMENTS =====================
  const renderDocuments = () => {
    const docTypes = [
      { name: 'Birth Certificate', icon: FileText, status: 'Available', color: '#6D4CFF' },
      { name: 'Transfer Certificate', icon: FileText, status: 'Available', color: '#3B82F6' },
      { name: 'Report Cards', icon: Award, status: 'Available', color: '#22C55E' },
      { name: 'School Circulars', icon: ScrollText, status: 'Available', color: '#F59E0B' },
      { name: 'Bonafide Certificate', icon: FileCheck, status: 'Request', color: '#EC4899' },
    ];

    return (
      <div className="w-full min-w-0">
        <div className="page-header"><h1 className="text-xl font-extrabold">Documents</h1><p className="text-sm text-gray-400">Certificates, report cards, and school circulars</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {docTypes.map((doc, i) => (
            <Card key={i} className="p-5 cursor-pointer hover:border-[#6D4CFF]/30 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${doc.color}15`, color: doc.color }}><doc.icon size={18} /></div>
                <div className="flex-1">
                  <div className="text-sm font-semibold mb-1">{doc.name}</div>
                  {doc.status === 'Available' ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-green-100 text-green-700">Available</span>
                      <button onClick={downloadReportCard} className="ml-auto text-[#6D4CFF] opacity-0 group-hover:opacity-100 transition-opacity"><Download size={14} /></button>
                    </div>
                  ) : (
                    <Button size="sm" className="bg-[#6D4CFF] text-white text-[10px] h-7 px-3">Request</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-3">School Circulars</h3>
          <div className="space-y-3">
            {[{ title: 'Summer Vacation Notice', date: '2026-04-15', desc: 'School will be closed for summer break from May 1st to June 15th.' },
              { title: 'Parent-Teacher Meeting', date: '2026-03-28', desc: 'Annual PTM scheduled for all classes.' },
            ].map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                <ScrollText size={16} className="text-[#6D4CFF] mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-semibold">{c.title}</div>
                  <div className="text-[10px] text-gray-400">{new Date(c.date).toLocaleDateString()}</div>
                  <p className="text-[11px] text-gray-600 mt-1">{c.desc}</p>
                </div>
                <Download size={14} className="text-gray-400 cursor-pointer" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  // ===================== MAIN LAYOUT =====================
  const hasMultipleChildren = children.length > 1;

  return (
    <div className="flex h-dvh overflow-hidden bg-[#F8FAFC]">
      <div className={`fixed inset-0 bg-black/30 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)} />

      {/* Child Rail — workspace-rail style */}
      {hasMultipleChildren && (
        <div className="child-rail">
          <div className="child-rail-header">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold">P</div>
          </div>
          <div className="flex flex-col items-center gap-1 overflow-y-auto flex-1 w-full px-1 py-2 border-t border-[#F1F5F9]">
            {children.map((child: any) => (
              <button key={child.id} onClick={() => { setSelectedChild(child); setSidebarOpen(false); }}
                className={`child-rail-btn ${selectedChild?.id === child.id ? 'active' : ''}`}
                title={child.full_name}>
                <div className="child-rail-avatar">{getChildEmoji(child.full_name)}</div>
                <span className="child-rail-label">{child.full_name?.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Sidebar */}
      <aside className={`dynamic-sidebar ${sidebarOpen ? 'open' : ''} ${hasMultipleChildren ? 'shifted' : ''}`}>
        <div className="dynamic-sidebar-header">
          <div className="dynamic-sidebar-search">
            <Search size={15} />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>

        </div>

        <nav className="dynamic-sidebar-nav">
          {NAV_SECTIONS.filter(s => s.label !== 'Account').map(section => (
            <div key={section.label} className="dynamic-sidebar-section">
              <div className="dynamic-sidebar-label">{section.label}</div>
              {section.items.filter(item => item.key !== 'signout').map(item => (
                <button key={item.key} onClick={() => navigateTo(item.key)}
                  className={`dynamic-sidebar-item ${activeView === item.key ? 'active' : ''}`}>
                  <item.icon size={16} />
                  <span>{item.label}</span>
                  {item.badge && <span className="count-badge">{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="dynamic-sidebar-footer">
          <button className="dynamic-sidebar-footer-item" onClick={() => { if (session) logout(); else router.replace('/parent/login'); }}>
            {session ? <><LogOut size={16} /><span>Sign Out</span></> : <><LogOut size={16} /><span>Sign In</span></>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`content-area ${hasMultipleChildren ? 'has-child-rail' : ''}`}>
        {/* Mobile child bar — only when children exist */}
        {hasMultipleChildren && (
          <div className="mobile-child-bar">
            {children.map((child: any) => (
              <button key={child.id} onClick={() => setSelectedChild(child)}
                className={`child-chip ${selectedChild?.id === child.id ? 'active' : ''}`}>
                <span className="text-sm mr-1">{getChildEmoji(child.full_name)}</span>
                <span>{child.full_name?.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        )}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50" onClick={() => setSidebarOpen(true)}>
              <Menu size={18} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <span className="font-semibold text-gray-900 capitalize">{currentSection.items.find(i => i.key === activeView)?.label || activeView.replace(/-/g, ' ')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <NotificationBell />
            <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-[#F3F0FF]" onClick={() => navigateTo('settings')}>
              <AvatarFallback className="bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white text-[10px] font-bold">{userInitials}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Toaster position="top-right" richColors />
          <AnimatePresence mode="wait">
            <motion.div key={activeView} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
