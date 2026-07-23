'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from './i18n/LanguageProvider';
import LanguageSwitcher from './i18n/LanguageSwitcher';
import { useAuth } from './contexts/AuthContext';
import apiClient from './lib/apiClient';
import { useNotifications } from './lib/useNotifications';
import { useApi } from './lib/useApi';
import {
  dashboardApi, classApi, studentApi, announcementApi,
  timetableApi, assignmentApi, examApi, messageApi, qrApi, partTimeJobApi, staffApi, teacherApi
} from './lib/dataService';
import { workforceApi } from './lib/enterpriseDataService';
import { createClient } from './lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Bell, Search, Menu, LogOut, ChevronDown, X,
  Users, BookOpen, ClipboardList, CalendarDays,
  MessageSquare, FileText, Settings, UserCircle, Clock,
  CheckCircle2, AlertCircle, Plus, Download, Send, Eye, EyeOff,
  Sparkles, Trash2, Filter, MoreHorizontal, ArrowUpRight,
  Star, Moon, Sun, HelpCircle, School, BarChart3, PieChart,
  LineChart, Mail, Phone, Award, Target, Layers, Activity,
  FolderOpen, Zap, CheckSquare, PlayCircle, AlertTriangle,
  ShieldCheck, BarChart2, Building2, Briefcase, TrendingUp,
  UserPlus, BadgeCheck, Umbrella, GraduationCap as Cap,
  DollarSign, UserCheck, CalendarCheck, Heart,
  Radio, RefreshCw, ThumbsUp, Share2,
  type LucideIcon
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Loader2, ArrowRight, ChevronLeft } from 'lucide-react';
import CommandPalette from '../components/CommandPalette';
import {
  TeacherDashboardView, MyClassesView, MySubjectsView, MyStudentsView,
  HomeworkView, ExamsView, ParentCommView, PtmView, ResourcesView
} from './components/teacher/TeacherWorkspace';
import { TeacherAttendanceView } from './components/attendance/TeacherAttendanceView';
import { TeacherStudentAttendanceView } from './components/teacher/TeacherAttendanceView';

import { StaffDirectory } from './components/staff-management/StaffDirectory';
import { StaffAttendance } from './components/staff-management/StaffAttendance';
import { WorkAssignments } from './components/staff-management/WorkAssignments';
import { Departments } from './components/staff-management/Departments';
import { Designations } from './components/staff-management/Designations';
import { AcademicAssignments } from './components/staff-management/AcademicAssignments';
import { PerformanceManagement } from './components/staff-management/PerformanceManagement';
import { LeaveManagement } from './components/staff-management/LeaveManagement';
import { TaskManagement } from './components/staff-management/TaskManagement';
import { TrainingCertifications } from './components/staff-management/TrainingCertifications';
import { StaffDocuments } from './components/staff-management/StaffDocuments';
import { PayrollOverview } from './components/staff-management/PayrollOverview';
import { CommunicationCenter } from './components/staff-management/CommunicationCenter';
import { StaffAnalytics } from './components/staff-management/StaffAnalytics';
import { RolesPermissions } from './components/staff-management/RolesPermissions';
import { StaffRequests } from './components/staff-management/StaffRequests';
import { StaffLifecycle } from './components/staff-management/StaffLifecycle';
import { StaffSettings } from './components/staff-management/StaffSettings';
import { TimetableAssignments } from './components/staff-management/TimetableAssignments';

interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

const sidebarSections: { label: string; items: NavItem[] }[] = [
  {
    label: 'Main Menu',
    items: [
      { key: 'self', label: 'Self Dashboard', icon: LayoutDashboard },
      { key: 'students', label: 'Student Management', icon: Users },
      { key: 'parents', label: 'Parent Management', icon: MessageSquare },
    ]
  },
];

const COLORS = { primary: '#7C3AED', success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };

type Workspace = 'self' | 'students' | 'parents';

const workspaceConfig: Record<Workspace, { label: string; icon: LucideIcon; nav: { key: string; label: string; icon: LucideIcon }[] }> = {
  self: {
    label: 'Self',
    icon: UserCircle,
    nav: [
      { key: 'overview', label: 'Overview', icon: LayoutDashboard },
      { key: 'attendance', label: 'My Attendance', icon: ClipboardList },
      { key: 'leave', label: 'Leave Requests', icon: Umbrella },
      { key: 'salary', label: 'Salary', icon: DollarSign },
      { key: 'timetable', label: 'Timetable', icon: CalendarDays },
      { key: 'subjects', label: 'Subjects', icon: BookOpen },
      { key: 'messages', label: 'Messages', icon: Mail },
      { key: 'documents', label: 'Documents', icon: FolderOpen },
      { key: 'settings', label: 'Settings', icon: Settings },
    ],
  },
  students: {
    label: 'Student',
    icon: Cap,
    nav: [
      { key: 'overview', label: 'Overview', icon: LayoutDashboard },
      { key: 'classes', label: 'My Classes', icon: School },
      { key: 'directory', label: 'Students', icon: Users },
      { key: 'attendance', label: 'Attendance', icon: ClipboardList },
      { key: 'marks', label: 'Marks Entry', icon: Award },
      { key: 'homework', label: 'Homework', icon: FileText },
      { key: 'exams', label: 'Exams', icon: Cap },
      { key: 'reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  parents: {
    label: 'Parent',
    icon: MessageSquare,
    nav: [
      { key: 'overview', label: 'Overview', icon: LayoutDashboard },
      { key: 'directory', label: 'Parents', icon: Users },
      { key: 'messages', label: 'Messages', icon: Mail },
      { key: 'ptm', label: 'PTM', icon: CalendarDays },
      { key: 'complaints', label: 'Complaints', icon: AlertTriangle },
      { key: 'reports', label: 'Reports', icon: BarChart3 },
      { key: 'settings', label: 'Settings', icon: Settings },
    ],
  },
};

export default function StaffPage() {
  const { t } = useLanguage();
  const { session, login: authLogin, logout: authLogout, isAuthenticated, organisationId } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace>('self');
  const [workspaceView, setWorkspaceView] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdPaletteOpen(true); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const validUuid = (v: string | undefined | null): v is string => typeof v === 'string' && UUID_RE.test(v);
  const teacherId = validUuid(session?.teacher?.id) ? session!.teacher!.id : validUuid(session?.user?.id) ? session!.user!.id : null;
  const orgId = validUuid(organisationId) ? organisationId : validUuid(session?.user?.organisation_id) ? session!.user!.organisation_id : null;
  const userId = validUuid(session?.user?.id) ? session!.user!.id : null;
  const isTeacher = session?.user?.role === 'teacher';

  const dash = useApi(() => dashboardApi.getStats(teacherId), [teacherId], !!teacherId);
  const classesHook = useApi(() => classApi.getByTeacher(teacherId), [teacherId], false);
  const studentsHook = useApi(() => studentApi.getByTeacher(teacherId), [teacherId], false);
  const announcementsHook = useApi(() => announcementApi.getAll(orgId), [orgId], false);
  const { notifications: notifList, unread: notifUnread, markAsRead: markNotifRead, markAllAsRead: markAllNotifRead } = useNotifications();
  const timetableHook = useApi(() => timetableApi.getByTeacher(teacherId), [teacherId], false);
  const assignmentsHook = useApi(() => assignmentApi.getByTeacher(teacherId), [teacherId], false);
  const examsHook = useApi(() => examApi.getAll(orgId), [orgId], false);
  const conversationsHook = useApi(() => messageApi.getConversations(userId), [userId], false);
  const workTasksHook = useApi(() => staffApi.getTasks(teacherId!), [teacherId], !!teacherId);

  const teacherStatsHook = useApi(() => teacherApi.getDashboardStats(teacherId!), [teacherId], !!teacherId && isTeacher);
  const teacherClassesHook = useApi(() => teacherApi.getClasses(teacherId!), [teacherId], !!teacherId && isTeacher);
  const teacherSubjectsHook = useApi(() => teacherApi.getSubjects(teacherId!), [teacherId], !!teacherId && isTeacher);
  const teacherStudentsHook = useApi(() => teacherApi.getStudents(teacherId!), [teacherId], !!teacherId && isTeacher);
  const teacherHomeworkHook = useApi(() => teacherApi.getHomework(teacherId!), [teacherId], !!teacherId && isTeacher);
  const teacherAttendanceHook = useApi(() => teacherApi.getAttendance(teacherId!), [teacherId], !!teacherId && isTeacher);
  const teacherExamsHook = useApi(() => teacherApi.getExams(teacherId!), [teacherId], !!teacherId && isTeacher);
  const teacherPtmHook = useApi(() => teacherApi.getPtm(teacherId!), [teacherId], !!teacherId && isTeacher);
  const teacherResourcesHook = useApi(() => teacherApi.getResources(teacherId!), [teacherId], !!teacherId && isTeacher);
  const teacherTasksHook = useApi(() => teacherApi.getTasks(teacherId!), [teacherId], !!teacherId && isTeacher);
  const teacherPerformanceHook = useApi(() => teacherApi.getPerformance(teacherId!), [teacherId], !!teacherId && isTeacher);
  const teacherCommunicationsHook = useApi(() => teacherApi.getCommunications(teacherId!), [teacherId], !!teacherId && isTeacher);
  const teacherNotificationsHook = useApi(() => teacherApi.getNotifications(teacherId!), [teacherId], !!teacherId && isTeacher);
  const teacherActivityLogsHook = useApi(() => teacherApi.getActivityLogs(teacherId!), [teacherId], !!teacherId && isTeacher);

  const [studentSubTab, setStudentSubTab] = useState('overview');
  const [parentSubTab, setParentSubTab] = useState('overview');
  const [showCreateHomeworkModal, setShowCreateHomeworkModal] = useState(false);
  const [homeworkForm, setHomeworkForm] = useState({ title: '', description: '', class_name: '', subject_name: '', due_date: '' });
  const [showViewSubmissionsModal, setShowViewSubmissionsModal] = useState(false);
  const [selectedHomeworkForSubmissions, setSelectedHomeworkForSubmissions] = useState<any>(null);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [showGradeSubmissionModal, setShowGradeSubmissionModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradeSubmissionForm, setGradeSubmissionForm] = useState({ grade: '', feedback: '' });
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [teacherExamForm, setTeacherExamForm] = useState({ exam_name: '', class_name: '', subject_name: '', exam_date: '', max_marks: 100, instructions: '' });
  const [showEnterMarksModal, setShowEnterMarksModal] = useState(false);
  const [selectedExamForMarks, setSelectedExamForMarks] = useState<any>(null);
  const [marksList, setMarksList] = useState<any[]>([]);
  const [marksFormList, setMarksFormList] = useState<Record<string, { marks_obtained: number; grade: string; remarks: string }>>({});
  const [showCreatePtmModal, setShowCreatePtmModal] = useState(false);
  const [ptmForm, setPtmForm] = useState({ parent_name: '', student_name: '', meeting_date: '', time_slot: '', notes: '' });
  const [showParentCommModal, setShowParentCommModal] = useState(false);
  const [parentCommForm, setParentCommForm] = useState({ recipient_type: 'CLASS', recipient_name: '', message_text: '', communication_type: 'EMAIL' });
  const [showAiSuiteModal, setShowAiSuiteModal] = useState(false);
  const [aiSuiteForm, setAiSuiteForm] = useState({ toolType: 'lesson', topic: '', grade: '', subject: '', duration: 45, count: 5, difficulty: 'medium', extraPrompt: '' });
  const [aiSuiteResult, setAiSuiteResult] = useState('');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceClass, setAttendanceClass] = useState('');
  const [attendanceSubject, setAttendanceSubject] = useState('');
  const [attendanceList, setAttendanceList] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({});
  const [attendanceRemarks, setAttendanceRemarks] = useState<Record<string, string>>({});
  const [smsAlertLoading, setSmsAlertLoading] = useState(false);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [profileTab, setProfileTab] = useState('overview');
  const [announceForm, setAnnounceForm] = useState({ title: '', content: '', priority: 'normal' });
  const [assignForm, setAssignForm] = useState({ title: '', subject: '', due_date: '', class_id: '', description: '' });
  const [gradeForm, setGradeForm] = useState({ student_id: '', subject: '', score: 0, grade: '', exam_type: '' });
  const [examForm, setExamForm] = useState({ title: '', subject: '', date: '', time: '', duration: '', total_marks: 100 });
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const classes = Array.isArray(classesHook.data?.data) ? classesHook.data.data : Array.isArray(classesHook.data) ? classesHook.data : [];
  const students = Array.isArray(studentsHook.data?.students) ? studentsHook.data.students : Array.isArray(studentsHook.data) ? studentsHook.data : [];
  const announcements = Array.isArray(announcementsHook.data?.announcements) ? announcementsHook.data.announcements : Array.isArray(announcementsHook.data) ? announcementsHook.data : [];
  const timetable = Array.isArray(timetableHook.data?.data) ? timetableHook.data.data : Array.isArray(timetableHook.data) ? timetableHook.data : [];
  const assignments = Array.isArray(assignmentsHook.data?.assignments) ? assignmentsHook.data.assignments : Array.isArray(assignmentsHook.data) ? assignmentsHook.data : [];
  const exams = Array.isArray(examsHook.data?.exams) ? examsHook.data.exams : Array.isArray(examsHook.data) ? examsHook.data : [];
  const conversations = Array.isArray(conversationsHook.data?.conversations) ? conversationsHook.data.conversations : Array.isArray(conversationsHook.data) ? conversationsHook.data : [];

  const dashData = dash.data as any;
  const userInitials = session?.user?.full_name
    ? session.user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'S';

  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const todayTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const todaySchedule = timetable.filter((t: any) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return t.day_of_week?.toLowerCase() === days[new Date().getDay()];
  }).sort((a: any, b: any) => (a.start_time || '00:00').localeCompare(b.start_time || '00:00'));

  const [localTasks, setLocalTasks] = useState<any[]>([]);
  useEffect(() => {
    const tasks = Array.isArray(workTasksHook.data?.tasks) ? workTasksHook.data.tasks
      : Array.isArray(workTasksHook.data) ? workTasksHook.data : [];
    setLocalTasks(tasks);
  }, [workTasksHook.data]);

  useEffect(() => {
    if (!teacherId) return;
    const supabase = createClient();
    if (!supabase) return;
    const channel = supabase.channel(`wos-staff-${teacherId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_tasks' }, () => workTasksHook.refetch())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_assignments' }, () => { })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_leave_requests' }, () => { })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_messages' }, () => { })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_performance' }, () => { })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_documents' }, () => { })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [teacherId]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const login = async () => {
    setLoading(true); setError(null);
    if (!form.email || !form.password) { setError('Please enter Email and Password.'); setLoading(false); return; }
    try {
      const res = await apiClient.login(form.email, form.password);
      if (res.success && res.data) {
        const { token, user, teacher } = res.data;
        if (!user || !['staff', 'teacher', 'admin', 'accountant', 'librarian', 'transport_manager', 'hostel_warden', 'driver', 'counsellor'].includes(user.role)) {
          setError('Invalid portal. Please use the correct login portal.'); setLoading(false); return;
        }
        try {
          const supabase = createClient();
          await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password
          });
        } catch (sbErr) {
          console.error("Supabase login warning:", sbErr);
        }
        authLogin(token, user, teacher || {});
      } else { setError(res.error || 'Login failed'); }
    } catch (err: any) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const logout = () => {
    try {
      const supabase = createClient();
      supabase.auth.signOut().catch(() => {});
    } catch {}
    authLogout();
    setForm({ email: '', password: '' });
  };

  const loadMessages = async (otherUserId: string) => {
    if (!userId) return;
    try {
      const res = await messageApi.getMessages(userId, otherUserId);
      const msgs = res.success && res.data ? (res.data?.messages || res.data || []) : [];
      setChatMessages(Array.isArray(msgs) ? msgs : []);
    } catch { setChatMessages([]); }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedContact || !userId) return;
    try {
      const res = await messageApi.send({ sender_id: userId, receiver_id: selectedContact.user_id || selectedContact.id, message: messageText });
      if (res.success) { setChatMessages(prev => [...prev, { id: Date.now(), sender_id: userId, message: messageText, created_at: new Date().toISOString() }]); setMessageText(''); }
      else toast.error('Failed to send message');
    } catch { toast.error('Failed to send message'); }
  };

  const submitAnnouncement = async () => { /* ... keep existing ... */ };
  const submitAssignment = async () => { /* ... keep existing ... */ };
  const submitGrade = async () => { /* ... keep existing ... */ };
  const submitExam = async () => { /* ... keep existing ... */ };
  const generateQR = async () => { /* ... keep existing ... */ };
  const loadStudentGrades = async (sid: string) => { /* ... keep existing ... */ };
  const loadStudentAttendance = async (sid: string) => { /* ... keep existing ... */ };

  if (!session) {
    return (
      <div className="flex h-dvh overflow-hidden bg-white">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute -top-96 -left-96 h-[800px] w-[800px] rounded-full bg-orange-500/5 blur-[150px]" />
          <div className="absolute -bottom-96 -right-96 h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-[150px]" />
          <div className="absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-orange-500/3 blur-[120px]" />
        </div>
        <div className="relative flex w-full flex-col justify-center overflow-y-auto px-4 py-8 lg:w-1/2 lg:px-12">
          <div className="mx-auto w-full max-w-sm sm:max-w-md">
            <Link href="http://localhost:3000/signin" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] transition hover:text-[#7C3AED]">
              <ChevronLeft size={14} /> Back to role selection
            </Link>
            <div className="mb-6 text-center lg:text-left">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FFEDD5] bg-orange-50 px-3 py-1">
                <BookOpen size={11} className="text-orange-600" />
                <span className="text-[10px] font-bold text-orange-600">Staff Portal</span>
              </div>
              <h1 className="text-2xl font-black text-[#0F172A] sm:text-3xl">Welcome Back!</h1>
              <p className="mt-1.5 text-sm text-[#64748B]">Sign in to manage your organization</p>
            </div>
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
                  <AlertCircle size={14} /> {error}
                </motion.div>
              )}
              <form onSubmit={(e) => { e.preventDefault(); login(); }} className="space-y-3.5">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#475569]">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#475569]">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 pr-10 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] transition hover:text-[#475569]">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)}
                      className="h-4 w-4 rounded border-[#CBD5E1] text-orange-600 focus:ring-orange-500" />
                    <span className="text-xs font-semibold text-[#64748B]">Remember me</span>
                  </label>
                  <Link href="http://localhost:3000/forgot-password" className="text-xs font-bold text-orange-600 transition hover:text-orange-700">Forgot Password?</Link>
                </div>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Sign In</>}
                </motion.button>
              </form>
            </div>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="relative hidden lg:flex lg:w-1/2 items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5" />
          <img src="/teacherloginimg.png" alt="Staff Portal" className="h-full w-full object-contain p-8" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Workspace Rail Overlay (mobile) */}
      <div className={`workspace-rail-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* PANEL 1: Workspace Switcher Rail */}
      <div className={`workspace-rail ${sidebarOpen ? 'open' : ''}`}>
        <div className="workspace-logo">P</div>
        <div className="flex flex-col items-center gap-1 flex-1 px-1">
          {(['self', 'students', 'parents'] as Workspace[]).map((ws) => {
            const cfg = workspaceConfig[ws];
            const Icon = cfg.icon;
            const isActive = workspace === ws;
            return (
              <button key={ws} onClick={() => { setWorkspace(ws); setWorkspaceView('overview'); setSidebarOpen(false); }}
                className={`workspace-btn ${isActive ? 'active' : ''}`}>
                <div className="workspace-btn-indicator" />
                <div className="workspace-btn-icon"><Icon size={20} /></div>
                <span className="workspace-btn-label">{cfg.label}</span>
              </button>
            );
          })}
        </div>
        <div className="pb-4 flex flex-col items-center">
          <button onClick={logout} className="workspace-btn-icon hover:!bg-red-50 hover:!text-red-500 !rounded-xl cursor-pointer">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Dynamic Sidebar Overlay (mobile) */}
      <div className={`dynamic-sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* PANEL 2: Dynamic Navigation Sidebar */}
      <aside className={`dynamic-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="dynamic-sidebar-header">
          <div className="dynamic-sidebar-search">
            <Search size={15} className="text-gray-400" />
            <input type="text" placeholder="Search..." readOnly onClick={() => { setCmdPaletteOpen(true); setSidebarOpen(false); }} />
          </div>
        </div>
        <div className="dynamic-sidebar-title">
          <div className="dynamic-sidebar-title-icon">{(() => { const Icon = workspaceConfig[workspace].icon; return <Icon size={18} />; })()}</div>
          <span className="dynamic-sidebar-title-text">{workspaceConfig[workspace].label} Workspace</span>
        </div>
        <nav className="dynamic-sidebar-nav">
          {workspaceConfig[workspace].nav.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.key} onClick={() => { setWorkspaceView(item.key); setSidebarOpen(false); }}
                className={`dynamic-sidebar-item ${workspaceView === item.key ? 'active' : ''}`}>
                <Icon size={16} className="dynamic-sidebar-item-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="dynamic-sidebar-footer">
          <button className="dynamic-sidebar-footer-item" onClick={logout}>
            <LogOut size={16} /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* PANEL 3: Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="header-mobile-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <div className="search-bar cursor-pointer" onClick={() => setCmdPaletteOpen(true)}>
              <Search size={18} />
              <input type="text" placeholder="Search modules, staff, actions (CMD+K)..." readOnly className="pointer-events-none" />
              <span className="search-badge hidden sm:flex"><span>⌘</span>K</span>
            </div>
          </div>
          <div className="header-right">
            <div className="hidden sm:block"><LanguageSwitcher /></div>
            <div className="header-divider hidden sm:block" />
            <button className="header-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="header-divider" />
            <div className="relative" ref={notifRef}>
              <button className="header-btn" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
                <Bell size={20} />
                {notifUnread > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                    {notifUnread > 99 ? '99+' : notifUnread}
                  </span>
                )}
              </button>
              {showNotifDropdown && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 sm:left-auto top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    {notifUnread > 0 && (
                      <button className="text-[10px] text-[#7C3AED] font-semibold hover:underline" onClick={markAllNotifRead}>Mark all read</button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifList.length > 0 ? notifList.slice(0, 10).map((n: any) => (
                      <div key={n.id} className={`p-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-[#F3F0FF]/30' : ''}`}
                        onClick={() => markNotifRead(n.id)}>
                        <div className="flex items-start gap-2.5">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'danger' ? 'bg-red-500' : n.type === 'warning' ? 'bg-purple-500' : n.type === 'success' ? 'bg-green-500' : 'bg-[#7C3AED]'}`} />
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs ${!n.read ? 'font-semibold' : 'font-medium'}`}>{n.title || 'Notification'}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{n.message || ''}</div>
                            <div className="text-[10px] text-gray-300 mt-1">
                              {n.created_at ? (() => {
                                const diff = Date.now() - new Date(n.created_at).getTime();
                                const mins = Math.floor(diff / 60000);
                                if (mins < 1) return 'Just now';
                                if (mins < 60) return `${mins}m ago`;
                                const hours = Math.floor(mins / 60);
                                if (hours < 24) return `${hours}h ago`;
                                return `${Math.floor(hours / 24)}d ago`;
                              })() : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : <div className="text-center py-10 text-gray-400 text-sm">No notifications</div>}
                  </div>
                </motion.div>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-0">
              <Button variant="outline" size="sm" className="rounded-full text-xs gap-1.5 h-9 border-gray-200" onClick={() => toast.success('What\'s New feature coming soon!')}>
                <Star size={14} className="text-yellow-500" /> <span className="hidden sm:inline">What&apos;s New</span>
              </Button>
              <div className="header-divider ml-3" />
            </div>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setWorkspace('self'); setWorkspaceView('overview'); }}>
              <Avatar className="w-9 h-9 ring-2 ring-[#F3F0FF]">
                <AvatarFallback className="bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] text-white text-xs font-bold">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-xs font-semibold">{session?.user?.full_name || 'Staff'}</div>
                <div className="text-[10px] text-gray-400">{session?.teacher?.subject || session?.user?.role || 'Staff'}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="page">
          <Toaster position="top-right" richColors />
          <AnimatePresence mode="wait">
            <motion.div key={workspace + '-' + workspaceView} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
              {workspace === 'self' && <SelfDashboard
                view={workspaceView} setView={setWorkspaceView}
                session={session} teacherStats={teacherStatsHook.data}
                teacherClasses={teacherClassesHook.data || []} teacherSubjects={teacherSubjectsHook.data || []}
                teacherStudents={teacherStudentsHook.data || []} localTasks={localTasks} todaySchedule={todaySchedule}
                timetable={timetable} teacherAttendanceHook={teacherAttendanceHook}
                announcementsHook={announcementsHook} conversationsHook={conversationsHook}
                teacherNotificationsHook={teacherNotificationsHook} teacherPerformanceHook={teacherPerformanceHook}
                teacherActivityLogsHook={teacherActivityLogsHook} teacherId={teacherId} userId={userId} />}
              {workspace === 'students' && (
                <StudentsView
                  view={workspaceView} setView={setWorkspaceView}
                  session={session}
                  teacherStudents={teacherStudentsHook.data || []}
                  teacherClasses={teacherClassesHook.data || []}
                  teacherSubjects={teacherSubjectsHook.data || []}
                  teacherAttendanceHook={teacherAttendanceHook}
                  teacherHomeworkHook={teacherHomeworkHook}
                  teacherExamsHook={teacherExamsHook}
                  teacherStats={teacherStatsHook.data}
                  attendanceDate={attendanceDate} setAttendanceDate={setAttendanceDate}
                  attendanceClass={attendanceClass} setAttendanceClass={setAttendanceClass}
                  attendanceSubject={attendanceSubject} setAttendanceSubject={setAttendanceSubject}
                  attendanceList={attendanceList} setAttendanceList={setAttendanceList}
                  attendanceRemarks={attendanceRemarks} setAttendanceRemarks={setAttendanceRemarks}
                  smsAlertLoading={smsAlertLoading} setSmsAlertLoading={setSmsAlertLoading}
                  isClassTeacher={isTeacher}
                  showCreateHomeworkModal={showCreateHomeworkModal} setShowCreateHomeworkModal={setShowCreateHomeworkModal}
                  homeworkForm={homeworkForm} setHomeworkForm={setHomeworkForm}
                  showViewSubmissionsModal={showViewSubmissionsModal} setShowViewSubmissionsModal={setShowViewSubmissionsModal}
                  selectedHomeworkForSubmissions={selectedHomeworkForSubmissions} setSelectedHomeworkForSubmissions={setSelectedHomeworkForSubmissions}
                  submissionsList={submissionsList} setSubmissionsList={setSubmissionsList}
                  showGradeSubmissionModal={showGradeSubmissionModal} setShowGradeSubmissionModal={setShowGradeSubmissionModal}
                  selectedSubmission={selectedSubmission} setSelectedSubmission={setSelectedSubmission}
                  gradeSubmissionForm={gradeSubmissionForm} setGradeSubmissionForm={setGradeSubmissionForm}
                  showCreateExamModal={showCreateExamModal} setShowCreateExamModal={setShowCreateExamModal}
                  teacherExamForm={teacherExamForm} setTeacherExamForm={setTeacherExamForm}
                  showEnterMarksModal={showEnterMarksModal} setShowEnterMarksModal={setShowEnterMarksModal}
                  selectedExamForMarks={selectedExamForMarks} setSelectedExamForMarks={setSelectedExamForMarks}
                  marksList={marksList} setMarksList={setMarksList}
                  marksFormList={marksFormList} setMarksFormList={setMarksFormList}
                />)}
              {workspace === 'parents' && (
                <ParentsView
                  view={workspaceView} setView={setWorkspaceView}
                  teacherStudents={teacherStudentsHook.data || []}
                  teacherClasses={teacherClassesHook.data || []}
                  teacherCommunicationsHook={teacherCommunicationsHook}
                  teacherPtmHook={teacherPtmHook}
                  teacherResourcesHook={teacherResourcesHook}
                  teacherHomeworkHook={teacherHomeworkHook}
                  teacherExamsHook={teacherExamsHook}
                  teacherStats={teacherStatsHook.data}
                  showParentCommModal={showParentCommModal} setShowParentCommModal={setShowParentCommModal}
                  parentCommForm={parentCommForm} setParentCommForm={setParentCommForm}
                  showCreatePtmModal={showCreatePtmModal} setShowCreatePtmModal={setShowCreatePtmModal}
                  ptmForm={ptmForm} setPtmForm={setPtmForm}
                  showAiSuiteModal={showAiSuiteModal} setShowAiSuiteModal={setShowAiSuiteModal}
                  aiSuiteForm={aiSuiteForm} setAiSuiteForm={setAiSuiteForm}
                  aiSuiteResult={aiSuiteResult} setAiSuiteResult={setAiSuiteResult}
                  generatingAi={generatingAi} setGeneratingAi={setGeneratingAi}
                  teacherId={teacherId} userId={userId} conversationsHook={conversationsHook}
                />)}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <CommandPalette isOpen={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} setActiveTab={(tab: string) => { setWorkspace(tab as Workspace); setWorkspaceView('overview'); }} tasks={localTasks} resources={[]} />
    </div>
  );
}

function SelfDashboard(props: any) {
  const st = props.view || 'overview';
  const setSt = props.setView || (() => {});
  const user = props.session?.user || {};
  const teacher = props.session?.teacher || {};
  const stats = props.teacherStats || {};
  return (
    <div className="space-y-5">
      {st === 'overview' && <TeacherDashboardView
          teacherStats={props.teacherStats} teacherClasses={props.teacherClasses}
          teacherSubjects={props.teacherSubjects} teacherStudents={props.teacherStudents}
          localTasks={props.localTasks} todaySchedule={props.todaySchedule}
          timetable={props.timetable} teacherAttendanceHook={props.teacherAttendanceHook}
          session={props.session}
          setActiveTab={(tab: string) => {}} setStudentSubTab={() => {}} setParentSubTab={() => {}}
          setShowAiSuiteModal={() => {}} setShowCreateHomeworkModal={() => {}}
          setShowCreateExamModal={() => {}} setShowCreatePtmModal={() => {}}
          setShowParentCommModal={() => {}} generateQR={() => {}} />}
        {st === 'profile' && <ProfileView session={props.session} />}
        {st === 'attendance' && <TeacherAttendanceView teacherAttendanceHook={props.teacherAttendanceHook} session={props.session} teacherStats={props.teacherStats} />}
        {st === 'leave' && <TeacherLeaveView teacherId={props.teacherId} teacherStats={props.teacherStats} />}
        {st === 'salary' && (
          <Card className="bg-white border border-gray-150/85 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4"><DollarSign size={16} className="text-emerald-600" /><h3 className="text-xs font-semibold text-gray-700">Salary & Payslips</h3></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-emerald-50"><div className="text-[9px] text-emerald-600 font-semibold uppercase">Net Salary</div><div className="text-lg font-bold text-gray-900 mt-0.5">₹42,500</div></div>
              <div className="p-3 rounded-lg bg-blue-50"><div className="text-[9px] text-blue-600 font-semibold uppercase">Allowances</div><div className="text-lg font-bold text-gray-900 mt-0.5">₹12,000</div></div>
              <div className="p-3 rounded-lg bg-purple-50"><div className="text-[9px] text-purple-600 font-semibold uppercase">Deductions</div><div className="text-lg font-bold text-gray-900 mt-0.5">₹5,200</div></div>
              <div className="p-3 rounded-lg bg-purple-50"><div className="text-[9px] text-purple-600 font-semibold uppercase">Next Pay</div><div className="text-lg font-bold text-gray-900 mt-0.5">01 Jul 2026</div></div>
            </div>
            <div className="space-y-2">
              {['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026'].map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <div className="text-xs font-semibold text-gray-700">{m}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">₹42,500</span>
                    <Badge className="text-[9px] font-medium bg-green-50 text-green-700">Paid</Badge>
                    <Download size={13} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        {st === 'timetable' && (
          <Card className="bg-white border border-gray-150/85 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100"><CalendarDays size={14} className="text-indigo-600" /><h3 className="text-xs font-semibold text-gray-700">My Timetable</h3></div>
            <FullTimetableTable timetable={props.timetable || []} />
          </Card>
        )}
        {st === 'subjects' && <MySubjectsView teacherSubjects={props.teacherSubjects} />}
        {st === 'messages' && <MessagesView teacherId={props.teacherId} userId={props.userId} conversationsHook={props.conversationsHook} />}
        {st === 'documents' && <TeacherDocumentsView teacherId={props.teacherId} />}
        {st === 'settings' && (
          <Card className="bg-white border border-gray-150/85 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4"><Settings size={16} className="text-gray-600" /><h3 className="text-xs font-semibold text-gray-700">Settings</h3></div>
            <div className="space-y-3">
              {[
                { label: 'Email Notifications', desc: 'Receive email notifications for attendance, marks, and announcements' },
                { label: 'SMS Alerts', desc: 'Get SMS alerts for urgent updates and reminders' },
                { label: 'Dark Mode', desc: 'Toggle dark mode for the portal' },
                { label: 'Language', desc: 'Change portal language' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                  <div><div className="text-xs font-semibold text-gray-700">{s.label}</div><div className="text-[10px] text-gray-400">{s.desc}</div></div>
                  <div className="w-9 h-5 rounded-full bg-gray-200 relative cursor-pointer"><div className="w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 left-0.5 shadow-sm" /></div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
  );
}

function StudentsView(props: any) {
  const subTab = props.view || 'overview';
  const setSubTab = props.setView || (() => {});
  return (
    <div className="space-y-6">
      {subTab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Card className="p-3 bg-white border border-gray-150/80 shadow-sm"><div className="text-[10px] text-gray-400 font-semibold uppercase">Classes</div><div className="text-lg font-bold text-gray-800">{(props.teacherClasses || []).length}</div></Card>
          <Card className="p-3 bg-white border border-gray-150/80 shadow-sm"><div className="text-[10px] text-gray-400 font-semibold uppercase">Subjects</div><div className="text-lg font-bold text-gray-800">{(props.teacherSubjects || []).length}</div></Card>
          <Card className="p-3 bg-white border border-gray-150/80 shadow-sm"><div className="text-[10px] text-gray-400 font-semibold uppercase">Students</div><div className="text-lg font-bold text-gray-800">{(props.teacherStudents || []).length}</div></Card>
        </div>
      )}
      {subTab === 'classes' && <MyClassesView teacherClasses={props.teacherClasses} teacherStudents={props.teacherStudents} />}
      {subTab === 'directory' && <MyStudentsView teacherStudents={props.teacherStudents} />}
      {subTab === 'profiles' && <MyStudentsView teacherStudents={props.teacherStudents} />}
      {subTab === 'attendance' && <TeacherStudentAttendanceView session={props.session} />}
      {subTab === 'marks' && (
        <ExamsView teacherClasses={props.teacherClasses} teacherExamsHook={props.teacherExamsHook}
          showCreateExamModal={props.showCreateExamModal} setShowCreateExamModal={props.setShowCreateExamModal}
          teacherExamForm={props.teacherExamForm} setTeacherExamForm={props.setTeacherExamForm}
          showEnterMarksModal={props.showEnterMarksModal} setShowEnterMarksModal={props.setShowEnterMarksModal}
          selectedExamForMarks={props.selectedExamForMarks} setSelectedExamForMarks={props.setSelectedExamForMarks}
          marksList={props.marksList} setMarksList={props.setMarksList}
          marksFormList={props.marksFormList} setMarksFormList={props.setMarksFormList}
          teacherStudents={props.teacherStudents} />)}
      {subTab === 'exams' && (
        <ExamsView teacherClasses={props.teacherClasses} teacherExamsHook={props.teacherExamsHook}
          showCreateExamModal={props.showCreateExamModal} setShowCreateExamModal={props.setShowCreateExamModal}
          teacherExamForm={props.teacherExamForm} setTeacherExamForm={props.setTeacherExamForm}
          showEnterMarksModal={props.showEnterMarksModal} setShowEnterMarksModal={props.setShowEnterMarksModal}
          selectedExamForMarks={props.selectedExamForMarks} setSelectedExamForMarks={props.setSelectedExamForMarks}
          marksList={props.marksList} setMarksList={props.setMarksList}
          marksFormList={props.marksFormList} setMarksFormList={props.setMarksFormList}
          teacherStudents={props.teacherStudents} />)}
      {subTab === 'gradebook' && (
        <Card className="bg-white border border-gray-150/85 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4"><BookOpen size={16} className="text-indigo-600" /><h3 className="text-xs font-semibold text-gray-700">Gradebook</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b text-gray-500 uppercase font-semibold text-[10px] bg-gray-50">
                <th className="py-2 px-3 text-left">Student</th><th className="py-2 px-3 text-center">Class</th><th className="py-2 px-3 text-center">Avg Marks</th><th className="py-2 px-3 text-center">Grade</th><th className="py-2 px-3 text-center">Status</th>
              </tr></thead>
              <tbody>
                {(props.teacherStudents || []).slice(0, 10).map((s: any, i: number) => (
                  <tr key={s.id || i} className="border-b hover:bg-gray-50/30">
                    <td className="py-2 px-3 font-semibold text-gray-800">{s.full_name || s.name}</td>
                    <td className="py-2 px-3 text-center text-gray-500">Grade {s.class_name || '—'}</td>
                    <td className="py-2 px-3 text-center font-bold text-indigo-700">{s.average_marks || 85}%</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-600">{(s.average_marks || 85) >= 90 ? 'A' : (s.average_marks || 85) >= 75 ? 'B' : (s.average_marks || 85) >= 60 ? 'C' : 'D'}</td>
                    <td className="py-2 px-3 text-center"><Badge className={`text-[9px] font-medium ${(s.average_marks || 85) >= 75 ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'}`}>{(s.average_marks || 85) >= 75 ? 'Pass' : 'Needs Improvement'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {subTab === 'homework' && (
        <HomeworkView teacherClasses={props.teacherClasses} teacherHomeworkHook={props.teacherHomeworkHook}
          showCreateHomeworkModal={props.showCreateHomeworkModal} setShowCreateHomeworkModal={props.setShowCreateHomeworkModal}
          homeworkForm={props.homeworkForm} setHomeworkForm={props.setHomeworkForm}
          showViewSubmissionsModal={props.showViewSubmissionsModal} setShowViewSubmissionsModal={props.setShowViewSubmissionsModal}
          selectedHomeworkForSubmissions={props.selectedHomeworkForSubmissions} setSelectedHomeworkForSubmissions={props.setSelectedHomeworkForSubmissions}
          submissionsList={props.submissionsList} setSubmissionsList={props.setSubmissionsList}
          showGradeSubmissionModal={props.showGradeSubmissionModal} setShowGradeSubmissionModal={props.setShowGradeSubmissionModal}
          selectedSubmission={props.selectedSubmission} setSelectedSubmission={props.setSelectedSubmission}
          gradeSubmissionForm={props.gradeSubmissionForm} setGradeSubmissionForm={props.setGradeSubmissionForm} />)}
      {subTab === 'reports' && (
        <Card className="bg-white border border-gray-150/85 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4"><BarChart3 size={16} className="text-indigo-600" /><h3 className="text-xs font-semibold text-gray-700">Progress Reports</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(props.teacherStudents || []).slice(0, 6).map((s: any, i: number) => (
              <div key={s.id || i} className="p-4 rounded-xl border border-gray-100 hover:shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-800">{s.full_name || s.name}</span>
                  <Badge className="text-[9px] font-medium bg-indigo-50 text-indigo-700">Report</Badge>
                </div>
                <div className="text-[10px] text-gray-400">Grade {s.class_name || '—'} · {(s.average_marks || 85)}% avg</div>
                <div className="mt-2 flex gap-1">
                  <button className="text-[9px] px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100">Download</button>
                  <button className="text-[9px] px-2 py-1 rounded bg-gray-50 text-gray-600 font-semibold hover:bg-gray-100">Share</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {subTab === 'behavior' && (
        <Card className="bg-white border border-gray-150/85 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4"><ShieldCheck size={16} className="text-purple-600" /><h3 className="text-xs font-semibold text-gray-700">Behavior & Discipline Notes</h3></div>
          {(props.teacherStudents || []).slice(0, 5).map((s: any, i: number) => (
            <div key={s.id || i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div><div className="text-xs font-semibold text-gray-800">{s.full_name || s.name}</div><div className="text-[10px] text-gray-400">Grade {s.class_name || '—'}</div></div>
              <Badge className="text-[9px] font-medium bg-green-50 text-green-700">Good Standing</Badge>
            </div>
          ))}
        </Card>
      )}
      {subTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-white border border-gray-150/80 shadow-sm"><div className="text-[10px] text-gray-400 font-semibold uppercase">Avg Performance</div><div className="text-xl font-bold text-indigo-700 mt-1">85%</div><div className="text-[9px] text-gray-400 mt-1">Across all subjects</div></Card>
          <Card className="p-4 bg-white border border-gray-150/80 shadow-sm"><div className="text-[10px] text-gray-400 font-semibold uppercase">Attendance Rate</div><div className="text-xl font-bold text-emerald-600 mt-1">95%</div><div className="text-[9px] text-gray-400 mt-1">Class average</div></Card>
          <Card className="p-4 bg-white border border-gray-150/80 shadow-sm"><div className="text-[10px] text-gray-400 font-semibold uppercase">Homework Completion</div><div className="text-xl font-bold text-purple-600 mt-1">88%</div><div className="text-[9px] text-gray-400 mt-1">Submission rate</div></Card>
        </div>
      )}
    </div>
  );
}

function FullTimetableTable({ timetable }: { timetable: any[] }) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const times = [...new Set((timetable || []).map((t: any) => t.start_time))].sort();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead><tr className="bg-gray-50 border-b border-gray-100">
          <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-500 uppercase w-20">Time</th>
          {dayNames.map(d => (<th key={d} className="text-left py-2.5 px-3 text-[10px] font-semibold uppercase text-gray-500">{d}</th>))}
        </tr></thead>
        <tbody>
          {times.length > 0 ? times.map((time: any, ti: number) => (
            <tr key={ti} className={ti % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
              <td className="py-2 px-3 text-[10px] font-semibold text-indigo-600 border-r border-gray-100">{time}</td>
              {days.map(day => {
                const slot = timetable.find((t: any) => t.day_of_week === day && t.start_time === time);
                return (<td key={day} className="py-2 px-3 border-r border-gray-50">
                  {slot ? <div><div className="text-[10px] font-semibold text-gray-800">{slot.subject?.name || slot.subject}</div><div className="text-[8px] text-gray-400">{slot.class?.class_name || ''} · {slot.room || '—'}</div></div>
                    : <span className="text-[9px] text-gray-300">—</span>}
                </td>);
              })}
            </tr>
          )) : <tr><td colSpan={7} className="text-center py-8 text-gray-400 text-xs">No timetable data.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

const lvFadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };
const lvStagger = { animate: { transition: { staggerChildren: 0.05 } } };
const lvMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function TeacherLeaveView({ teacherId, teacherStats }: { teacherId: string | null; teacherStats?: any }) {
  const staffLeave = useApi(() => staffApi.getLeaves(teacherId!), [teacherId], !!teacherId);
  const leavesList = Array.isArray(staffLeave.data?.leaves) ? staffLeave.data.leaves : Array.isArray(staffLeave.data) ? staffLeave.data : [];
  const loading = staffLeave?.loading;
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ type: 'SICK', start_date: '', end_date: '', reason: '' });
  const submit = () => {
    if (!form.start_date || !form.end_date || !form.reason) { toast.error('Fill all fields'); return; }
    toast.success('Leave submitted for approval');
    setShowApply(false); setForm({ type: 'SICK', start_date: '', end_date: '', reason: '' });
  };

  const leaveBalance = [
    { type: 'Casual Leave', icon: '🌴', used: 4, total: 12, color: '#10B981', bg: '#D1FAE5', remaining: 8 },
    { type: 'Sick Leave', icon: '🏥', used: 2, total: 10, color: '#F59E0B', bg: '#FEF3C7', remaining: 8 },
    { type: 'Earned Leave', icon: '🏖️', used: 8, total: 20, color: '#3B82F6', bg: '#DBEAFE', remaining: 12 },
    { type: 'Comp Off', icon: '🎯', used: 1, total: 5, color: '#EC4899', bg: '#FCE7F3', remaining: 4 },
  ];

  const effectiveLeaves = leavesList.length > 0 ? leavesList : [];
  const pct = (used: number, total: number) => Math.round(((total - used) / total) * 100);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 p-8">
          <div className="h-8 w-48 bg-white/20 rounded-lg animate-pulse mb-3" />
          <div className="h-4 w-56 bg-white/10 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
      <motion.div initial="initial" animate="animate" variants={lvStagger} className="space-y-5">

      {/* HERO */}
      <motion.div variants={lvFadeUp} className="relative overflow-hidden rounded-3xl md:rounded-[24px] p-6 md:p-8 bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(251,146,60,0.15)_0%,transparent_50%)]" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-300/15 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-300/15 rounded-full blur-[100px]" />
        <motion.div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full bg-white/20"
              animate={{ opacity: [0.1, 0.5, 0.1], y: [0, -(12 + (i % 3) * 10), 0], x: [0, (i % 2 === 0 ? 1 : -1) * 15, 0] }}
              transition={{ duration: 5 + (i % 3) * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
              style={{ width: `${3 + (i % 3) * 3}px`, height: `${3 + (i % 3) * 3}px`, top: `${10 + (i * 10) % 80}%`, left: `${5 + (i * 12) % 90}%` }}
            />
          ))}
        </motion.div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-[9px] font-bold text-white/90 uppercase tracking-wider">📋 Leave Management</div>
              <div className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-[9px] font-bold text-white/90 uppercase tracking-wider">{new Date().getFullYear()}</div>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1">Leave Requests</h1>
            <p className="text-sm text-purple-100/80 mb-5">Manage your leave applications and track balances</p>
            <div className="flex flex-wrap items-center gap-4">
              {[
                { label: 'Total Leaves', value: leaveBalance.reduce((s, l) => s + l.total, 0), icon: Umbrella },
                { label: 'Remaining', value: leaveBalance.reduce((s, l) => s + l.remaining, 0), icon: CalendarCheck },
                { label: 'Used This Year', value: leaveBalance.reduce((s, l) => s + l.used, 0), icon: Clock },
                { label: 'Pending', value: effectiveLeaves.filter((l: any) => l.status === 'pending').length, icon: AlertCircle },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center"><stat.icon className="w-4 h-4 text-white" /></div>
                  <div>
                    <div className="text-lg font-extrabold text-white">{stat.value}</div>
                    <div className="text-[9px] text-purple-200">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex flex-shrink-0 relative w-44 h-44 items-center justify-center">
            <div className="absolute w-36 h-36 rounded-full bg-purple-300/20 blur-[60px] animate-pulse" />
            <div className="relative flex items-center justify-center">
              <svg width="130" height="130" viewBox="0 0 130 130" className="drop-shadow-xl">
                <rect x="40" y="20" width="50" height="60" rx="6" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <rect x="50" y="10" width="30" height="14" rx="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <circle cx="65" cy="17" r="2" fill="rgba(255,255,255,0.4)" />
                <line x1="50" y1="38" x2="80" y2="38" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <line x1="50" y1="48" x2="75" y2="48" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <line x1="50" y1="58" x2="70" y2="58" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                <line x1="50" y1="68" x2="65" y2="68" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
              </svg>
              <motion.div className="absolute -top-1 -right-4 w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}>
                <CalendarDays className="w-5 h-5 text-purple-200" />
              </motion.div>
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-4 flex flex-wrap items-center gap-3">
          <button onClick={() => setShowApply(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-xs font-bold text-white hover:bg-white/25 transition-all">
            <Plus size={15} /> Apply for Leave
          </button>
        </div>
      </motion.div>

      {/* LEAVE BALANCE CARDS */}
      <motion.div variants={lvFadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {leaveBalance.map((item, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: item.bg }}>
                <span className="text-base">{item.icon}</span>
              </div>
              <span className="text-[10px] font-semibold text-gray-700">{item.type}</span>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-extrabold text-gray-900">{item.remaining}</span>
              <span className="text-[10px] text-gray-500">/ {item.total} left</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct(item.used, item.total)}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                  className="h-full rounded-full" style={{ background: item.color }} />
              </div>
              <span className="text-[9px] font-bold" style={{ color: item.color }}>{pct(item.used, item.total)}%</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* LEAVE HISTORY */}
      <motion.div variants={lvFadeUp}>
        <Card className="p-5 md:p-6 bg-white border border-gray-100 shadow-sm rounded-2xl md:rounded-[20px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><FileText className="w-5 h-5 text-purple-600" /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Leave History</h3>
                <p className="text-[10px] text-gray-400">Your recent leave applications</p>
              </div>
            </div>
            <button onClick={() => setShowApply(true)} className="px-3 py-1.5 rounded-xl text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 transition-all">+ New</button>
          </div>
          <div className="overflow-x-auto -mx-5 md:-mx-6">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-5 md:px-6 text-[9px] text-gray-500 font-semibold uppercase">Leave Type</th>
                  <th className="text-left py-3 px-4 text-[9px] text-gray-500 font-semibold uppercase">From</th>
                  <th className="text-left py-3 px-4 text-[9px] text-gray-500 font-semibold uppercase">To</th>
                  <th className="text-center py-3 px-3 text-[9px] text-gray-500 font-semibold uppercase">Days</th>
                  <th className="text-right py-3 px-5 md:px-6 text-[9px] text-gray-500 font-semibold uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {effectiveLeaves.map((l: any, i: number) => {
                  const s = (l.status || '').toLowerCase();
                  const badge = s === 'approved' ? { bg: '#D1FAE5', color: '#065F46', text: 'Approved' }
                    : s === 'pending' ? { bg: '#FEF3C7', color: '#92400E', text: 'Pending' }
                    : s === 'rejected' ? { bg: '#FEE2E2', color: '#991B1B', text: 'Rejected' }
                    : { bg: '#F3F4F6', color: '#374151', text: l.status };
                  const days = l.days || (l.start_date && l.end_date ? Math.max(1, Math.ceil((new Date(l.end_date).getTime() - new Date(l.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1) : 1);
                  return (
                    <motion.tr key={l.id || i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-5 md:px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-50">
                            {(l.leave_type || '').toLowerCase().includes('casual') ? <Umbrella className="w-3.5 h-3.5 text-green-600" />
                              : (l.leave_type || '').toLowerCase().includes('sick') ? <Heart className="w-3.5 h-3.5 text-purple-500" />
                              : (l.leave_type || '').toLowerCase().includes('earned') ? <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                              : <Award className="w-3.5 h-3.5 text-pink-500" />}
                          </div>
                          <span className="font-medium text-gray-900 text-xs">{l.leave_type || 'Leave'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{l.start_date || '—'}</td>
                      <td className="py-3 px-4 text-gray-600">{l.end_date || '—'}</td>
                      <td className="py-3 px-3 text-center"><span className="font-extrabold text-gray-800">{days}</span></td>
                      <td className="py-3 px-5 md:px-6 text-right">
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-[9px] font-bold" style={{ background: badge.bg, color: badge.color }}>{badge.text}</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* LEAVE CALENDAR + STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={lvFadeUp}>
          <Card className="p-5 md:p-6 bg-white border border-gray-100 shadow-sm rounded-2xl md:rounded-[20px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><CalendarDays className="w-5 h-5 text-purple-600" /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">This Month</h3>
                <p className="text-[10px] text-gray-400">{lvMonths[new Date().getMonth()]} {new Date().getFullYear()}</p>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="text-[9px] font-bold text-gray-400 uppercase text-center py-1">{d[0]}</div>
              ))}
              {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() || 7 }, (_, i) => {
                const emptyDay = i === 0 ? 6 : i - 1;
                return <div key={`e-${i}`} />;
              }).filter(Boolean)}
              {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) => {
                const day = i + 1;
                const isLeave = effectiveLeaves.some((l: any) => {
                  const start = l.start_date ? new Date(l.start_date) : null;
                  const end = l.end_date ? new Date(l.end_date) : null;
                  if (!start) return false;
                  const check = new Date(new Date().getFullYear(), new Date().getMonth(), day);
                  return check >= start && check <= (end || start);
                });
                const isToday = day === new Date().getDate();
                return (
                  <div key={day} className={`p-1.5 rounded-lg text-center text-xs font-bold ${isLeave ? 'bg-purple-100 text-purple-700' : isToday ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {day}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-[9px] text-gray-500">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-purple-100 border border-purple-300" /> Leave</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-purple-500" /> Today</span>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={lvFadeUp}>
          <Card className="p-5 md:p-6 bg-white border border-gray-100 shadow-sm rounded-2xl md:rounded-[20px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-purple-600" /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Leave Analytics</h3>
                <p className="text-[10px] text-gray-400">Annual leave distribution</p>
              </div>
            </div>
            <div className="space-y-3">
              {leaveBalance.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-600 w-24">{item.type}</span>
                  <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden relative">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(item.used / item.total) * 100}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full" style={{ background: item.color }} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 w-12 text-right">{item.used}/{item.total}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-purple-50"><div className="text-[9px] text-purple-600 font-semibold uppercase">Avg Leave/Year</div><div className="text-lg font-extrabold text-purple-700">8.5</div></div>
              <div className="p-3 rounded-xl bg-green-50"><div className="text-[9px] text-green-600 font-semibold uppercase">Utilization</div><div className="text-lg font-extrabold text-green-700">{Math.round(leaveBalance.reduce((s, l) => s + l.used, 0) / leaveBalance.reduce((s, l) => s + l.total, 0) * 100)}%</div></div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* APPLY LEAVE MODAL */}
      {showApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowApply(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center"><Umbrella className="w-4 h-4 text-purple-600" /></div>
                <h3 className="text-sm font-bold text-gray-900">Apply for Leave</h3>
              </div>
              <button onClick={() => setShowApply(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1.5 block">Leave Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white">
                  <option value="SICK">Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="EARNED">Earned Leave</option>
                  <option value="COMPOFF">Compensatory Off</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1.5 block">Start Date</label>
                  <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1.5 block">End Date</label>
                  <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase mb-1.5 block">Reason</label>
                <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                  placeholder="Please provide a reason for your leave request..." />
              </div>
              <button onClick={submit}
                className="w-full py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-purple-600/20 hover:shadow-xl transition-all"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                <Send className="w-4 h-4 mr-1.5 inline-block" /> Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}

function TeacherAnnouncementsView({ announcementsHook }: { announcementsHook: any }) {
  const list = Array.isArray(announcementsHook.data?.announcements) ? announcementsHook.data.announcements : Array.isArray(announcementsHook.data) ? announcementsHook.data : [];
  return (
    <div className="space-y-2">
      {list.length > 0 ? list.map((a: any, i: number) => (
        <div key={a.id || i} className="p-4 rounded-xl bg-white border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5" />
            <div>
              <div className="text-xs font-semibold text-gray-900">{a.title || a.name || 'Announcement'}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{a.content || a.description || ''}</div>
              <div className="text-[9px] text-gray-400 mt-1">{a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}</div>
            </div>
          </div>
        </div>
      )) : <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">No announcements</div>}
    </div>
  );
}

function TeacherTasksView({ tasks }: { tasks: any[] }) {
  const list = tasks || [];
  return (
    <div className="space-y-2">
      {list.length > 0 ? list.map((t: any, i: number) => (
        <div key={t.id || i} className="p-4 rounded-xl bg-white border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare size={16} className="text-gray-400" />
            <div><div className="text-xs font-semibold text-gray-900">{t.title || t.name || 'Task'}</div><div className="text-[10px] text-gray-500">{t.description || ''}</div></div>
          </div>
          <Badge className={`text-[9px] font-medium ${t.status === 'completed' ? 'bg-green-50 text-green-700' : t.status === 'overdue' ? 'bg-red-50 text-red-700' : 'bg-purple-50 text-purple-700'}`}>{t.status || 'pending'}</Badge>
        </div>
      )) : <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">No tasks</div>}
    </div>
  );
}

function TeacherDocumentsView({ teacherId }: { teacherId: string | null }) {
  const staffDocs = useApi(() => staffApi.getDocuments(teacherId!), [teacherId], !!teacherId);
  const docsList = Array.isArray(staffDocs.data?.documents) ? staffDocs.data.documents : Array.isArray(staffDocs.data) ? staffDocs.data : [];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {docsList.length > 0 ? docsList.map((d: any, i: number) => (
        <div key={d.id || i} className="p-4 rounded-xl bg-white border border-gray-100 hover:shadow-sm">
          <div className="flex items-center gap-2 mb-2"><FolderOpen size={16} className="text-indigo-500" /><span className="text-xs font-semibold text-gray-900">{d.name || d.title || 'Document'}</span></div>
          <div className="text-[10px] text-gray-400">{d.type || d.document_type || ''}</div>
        </div>
      )) : <div className="col-span-full text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">No documents</div>}
    </div>
  );
}

function TeacherPerformanceView({ teacherId, teacherPerformanceHook }: { teacherId: string | null; teacherPerformanceHook: any }) {
  const perfData = teacherPerformanceHook?.data?.performance || teacherPerformanceHook?.data || {};
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Attendance Score', value: perfData.attendance_score || perfData.attendance || '—', unit: '%' },
        { label: 'Task Completion', value: perfData.task_completion || perfData.tasks || '—', unit: '%' },
        { label: 'Overall Score', value: perfData.score || perfData.rating || '—', unit: '/100' },
        { label: 'Homework Completion', value: perfData.homework_completion || '—', unit: '%' },
      ].map((p, i) => (
        <div key={i} className="p-4 rounded-xl bg-white border border-gray-100 text-center">
          <div className="text-[10px] text-gray-400 uppercase font-semibold">{p.label}</div>
          <div className="text-2xl font-extrabold text-gray-900 mt-1">{p.value} <span className="text-sm font-normal text-gray-400">{p.unit}</span></div>
        </div>
      ))}
    </div>
  );
}

function ParentsView(props: any) {
  const subTab = props.view || 'overview';
  const setSubTab = props.setView || (() => {});
  const [dirSearch, setDirSearch] = useState('');
  return (
    <div className="space-y-6">
      {subTab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3 bg-white border border-gray-150/80 shadow-sm"><div className="text-[10px] text-gray-400 font-semibold uppercase">Total Parents</div><div className="text-lg font-bold text-gray-800">{(props.teacherStudents || []).length}</div></Card>
          <Card className="p-3 bg-white border border-gray-150/80 shadow-sm"><div className="text-[10px] text-gray-400 font-semibold uppercase">Communications</div><div className="text-lg font-bold text-gray-800">{props.teacherCommunicationsHook?.data?.length || 0}</div></Card>
          <Card className="p-3 bg-white border border-gray-150/80 shadow-sm"><div className="text-[10px] text-gray-400 font-semibold uppercase">PTMs Scheduled</div><div className="text-lg font-bold text-gray-800">{props.teacherPtmHook?.data?.length || 0}</div></Card>
          <Card className="p-3 bg-white border border-gray-150/80 shadow-sm"><div className="text-[10px] text-gray-400 font-semibold uppercase">Resources</div><div className="text-lg font-bold text-gray-800">{props.teacherResourcesHook?.data?.length || 0}</div></Card>
        </div>
      )}
      {subTab === 'directory' && (
        (() => {
          const list = props.teacherStudents || [];
          const filtered = list.filter((s: any) => {
            const name = `${s.parent_name || s.parent_first_name || ''} ${s.parent_last_name || ''}`.trim() || s.full_name || '';
            return name.toLowerCase().includes(dirSearch.toLowerCase()) || s.full_name?.toLowerCase().includes(dirSearch.toLowerCase());
          });
          return (
            <div className="space-y-4">
              <Input placeholder="Search parents by name or student..." value={dirSearch} onChange={e => setDirSearch(e.target.value)} className="max-w-md bg-white rounded-xl" />
              <Card className="bg-white border border-gray-150 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b text-gray-450 uppercase font-semibold text-[11px] text-left bg-gray-50/50">
                      <th className="py-2 px-3">Parent Name</th><th className="py-2 px-3">Student</th><th className="py-2 px-3">Class</th><th className="py-2 px-3">Email</th><th className="py-2 px-3">Phone</th>
                    </tr></thead>
                    <tbody>
                      {filtered.map((std: any, idx: number) => (
                        <tr key={std.id || idx} className="border-b hover:bg-gray-50/30">
                          <td className="py-2 px-3 font-semibold text-gray-800">{std.parent_name || std.parent_first_name || `${std.full_name}'s Parent` || '—'}</td>
                          <td className="py-2 px-3 text-gray-500">{std.full_name || '—'}</td>
                          <td className="py-2 px-3 font-semibold text-indigo-700">Grade {std.class_name || '—'}</td>
                          <td className="py-2 px-3 text-gray-400">{std.parent_email || std.email || '—'}</td>
                          <td className="py-2 px-3 text-gray-400">{std.parent_phone || std.phone || '—'}</td>
                        </tr>
                      ))}
                      {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-gray-400 font-medium italic">No parent records found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </Card>
              <div className="flex gap-2">
                <button className="text-[10px] px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 flex items-center gap-1"><Send size={12} /> Bulk Email</button>
                <button className="text-[10px] px-3 py-1.5 rounded-lg bg-green-50 text-green-700 font-semibold hover:bg-green-100 flex items-center gap-1"><Download size={12} /> Export</button>
              </div>
            </div>
          );
        })()
      )}
      {subTab === 'communications' && (
        <ParentCommView teacherClasses={props.teacherClasses} teacherCommunicationsHook={props.teacherCommunicationsHook}
          showParentCommModal={props.showParentCommModal} setShowParentCommModal={props.setShowParentCommModal}
          parentCommForm={props.parentCommForm} setParentCommForm={props.setParentCommForm} />)}
      {subTab === 'ptm' && (
        <PtmView teacherClasses={props.teacherClasses} teacherPtmHook={props.teacherPtmHook}
          showCreatePtmModal={props.showCreatePtmModal} setShowCreatePtmModal={props.setShowCreatePtmModal}
          ptmForm={props.ptmForm} setPtmForm={props.setPtmForm}
          teacherStudents={props.teacherStudents} />)}
      {subTab === 'messages' && (
        <MessagesView teacherId={props.teacherId} userId={props.userId} conversationsHook={props.conversationsHook} />)}
      {subTab === 'resources' && (
        <ResourcesView teacherClasses={props.teacherClasses} teacherResourcesHook={props.teacherResourcesHook}
          showAiSuiteModal={props.showAiSuiteModal} setShowAiSuiteModal={props.setShowAiSuiteModal}
          aiSuiteForm={props.aiSuiteForm} setAiSuiteForm={props.setAiSuiteForm}
          aiSuiteResult={props.aiSuiteResult} setAiSuiteResult={props.setAiSuiteResult}
          generatingAi={props.generatingAi} setGeneratingAi={props.setGeneratingAi} />)}
      {subTab === 'progress' && (
        <Card className="bg-white border border-gray-150/85 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4"><TrendingUp size={16} className="text-emerald-600" /><h3 className="text-xs font-semibold text-gray-700">Child Progress Updates</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(props.teacherStudents || []).slice(0, 9).map((s: any, i: number) => (
              <div key={s.id || i} className="p-4 rounded-xl border border-gray-100 hover:shadow-sm">
                <div className="flex items-center justify-between mb-1"><span className="text-xs font-semibold text-gray-800">{s.full_name || s.name}</span><Badge className={`text-[9px] font-medium ${(s.average_marks || 85) >= 80 ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'}`}>{s.average_marks || 85}%</Badge></div>
                <div className="text-[10px] text-gray-400">Grade {s.class_name || '—'}</div>
                <div className="mt-2 flex gap-1">
                  <button className="text-[9px] px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100">Send Update</button>
                  <button className="text-[9px] px-2 py-1 rounded bg-gray-50 text-gray-600 font-semibold hover:bg-gray-100">View Details</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {subTab === 'sharing' && (
        <Card className="bg-white border border-gray-150/85 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4"><Share2 size={16} className="text-indigo-600" /><h3 className="text-xs font-semibold text-gray-700">Parent Sharing & Collaboration</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border-2 border-dashed border-gray-200 text-center"><Share2 size={24} className="text-gray-300 mx-auto mb-2" /><div className="text-xs font-semibold text-gray-700">Share Documents</div><div className="text-[10px] text-gray-400">Share files, reports, and resources with parents</div><button className="mt-2 text-[10px] px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-semibold">Upload & Share</button></div>
            <div className="p-4 rounded-xl border-2 border-dashed border-gray-200 text-center"><Users size={24} className="text-gray-300 mx-auto mb-2" /><div className="text-xs font-semibold text-gray-700">Parent Portal Access</div><div className="text-[10px] text-gray-400">Grant parents access to student progress portal</div><button className="mt-2 text-[10px] px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-semibold">Manage Access</button></div>
          </div>
        </Card>
      )}
      {subTab === 'complaints' && (
        <Card className="bg-white border border-gray-150/85 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4"><AlertTriangle size={16} className="text-red-600" /><h3 className="text-xs font-semibold text-gray-700">Parent Complaints</h3></div>
          {(props.teacherStudents || []).slice(0, 3).map((s: any, i: number) => (
            <div key={i} className="p-3 border-b border-gray-50 last:border-0 flex items-center justify-between">
              <div><div className="text-xs font-semibold text-gray-800">{s.parent_name || `${s.full_name}'s Parent`}</div><div className="text-[10px] text-gray-400">Regarding: {s.full_name} — Classroom</div></div>
              <Badge className="text-[9px] bg-green-50 text-green-700 font-medium">Resolved</Badge>
            </div>
          ))}
          {(!props.teacherStudents || props.teacherStudents.length === 0) && <div className="text-center py-8 text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded-2xl">No complaints</div>}
        </Card>
      )}
      {subTab === 'feedback' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white border border-gray-150/85 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4"><ThumbsUp size={16} className="text-purple-600" /><h3 className="text-xs font-semibold text-gray-700">Parent Feedback</h3></div>
            {(props.teacherStudents || []).slice(0, 3).map((s: any, i: number) => (
              <div key={i} className="p-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center justify-between"><span className="text-xs font-semibold text-gray-800">{s.parent_name || `Parent of ${s.full_name}`}</span><span className="text-[10px] text-purple-500">★★★★☆</span></div>
                <div className="text-[10px] text-gray-400 mt-1">Great progress! The student has shown improvement.</div>
              </div>
            ))}
          </Card>
          <Card className="bg-white border border-gray-150/85 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4"><BarChart3 size={16} className="text-indigo-600" /><h3 className="text-xs font-semibold text-gray-700">Feedback Analytics</h3></div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-green-50"><div className="text-lg font-bold text-green-700">4.2</div><div className="text-[9px] text-green-600 font-semibold">Avg Rating</div></div>
              <div className="p-3 rounded-lg bg-blue-50"><div className="text-lg font-bold text-blue-700">92%</div><div className="text-[9px] text-blue-600 font-semibold">Satisfaction</div></div>
            </div>
          </Card>
        </div>
      )}
      {subTab === 'realtime' && (
        <Card className="bg-white border border-gray-150/85 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4"><Radio size={16} className="text-purple-600" /><h3 className="text-xs font-semibold text-gray-700">Real-Time Sync</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-gray-100 text-center"><div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-2"><Radio size={16} /></div><div className="text-xs font-semibold text-gray-700">Attendance Sync</div><div className="text-[10px] text-gray-400">Real-time attendance push to parents</div><Badge className="mt-2 text-[9px] bg-green-50 text-green-700 font-medium">Active</Badge></div>
            <div className="p-4 rounded-xl border border-gray-100 text-center"><div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2"><Bell size={16} /></div><div className="text-xs font-semibold text-gray-700">Instant Notifications</div><div className="text-[10px] text-gray-400">Push notifications & SMS alerts</div><Badge className="mt-2 text-[9px] bg-green-50 text-green-700 font-medium">Active</Badge></div>
            <div className="p-4 rounded-xl border border-gray-100 text-center"><div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-2"><RefreshCw size={16} /></div><div className="text-xs font-semibold text-gray-700">Live Grade Sync</div><div className="text-[10px] text-gray-400">Real-time marks & grade updates</div><Badge className="mt-2 text-[9px] bg-green-50 text-green-700 font-medium">Active</Badge></div>
          </div>
        </Card>
      )}
      {subTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white border border-gray-150/85 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4"><BarChart3 size={16} className="text-indigo-600" /><h3 className="text-xs font-semibold text-gray-700">Communication Reports</h3></div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-xs text-gray-700">Messages Sent</span><span className="text-xs font-bold text-indigo-700">{Math.floor(Math.random() * 50) + 10}</span></div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50"><span className="text-xs text-gray-700">PTMs Conducted</span><span className="text-xs font-bold text-indigo-700">{Math.floor(Math.random() * 10) + 2}</span></div>
              <div className="flex justify-between items-center py-2"><span className="text-xs text-gray-700">Complaints Resolved</span><span className="text-xs font-bold text-green-600">{Math.floor(Math.random() * 20) + 5}</span></div>
            </div>
          </Card>
          <Card className="bg-white border border-gray-150/85 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4"><Download size={16} className="text-gray-600" /><h3 className="text-xs font-semibold text-gray-700">Export Reports</h3></div>
            <div className="space-y-2">
              <button className="w-full p-3 rounded-xl border border-gray-100 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Download size={14} /> Download Parent Communication Report</button>
              <button className="w-full p-3 rounded-xl border border-gray-100 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Download size={14} /> Download PTM Attendance Report</button>
              <button className="w-full p-3 rounded-xl border border-gray-100 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Download size={14} /> Download Feedback Summary</button>
            </div>
          </Card>
        </div>
      )}
      {subTab === 'settings' && (
        <Card className="bg-white border border-gray-150/85 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4"><Settings size={16} className="text-gray-600" /><h3 className="text-xs font-semibold text-gray-700">Parent Management Settings</h3></div>
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center justify-between py-2 border-b border-gray-50"><span className="text-xs text-gray-700">Auto-sync attendance to parents</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" defaultChecked /><div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div></label></div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50"><span className="text-xs text-gray-700">Send weekly progress reports</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" defaultChecked /><div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div></label></div>
            <div className="flex items-center justify-between py-2"><span className="text-xs text-gray-700">Enable parent portal access</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" defaultChecked /><div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div></label></div>
          </div>
        </Card>
      )}
    </div>
  );
}

function MessagesView({ teacherId, userId, conversationsHook }: { teacherId: string | null; userId: string | null; conversationsHook: any }) {
  const [selContact, setSelContact] = useState<any>(null);
  const [msgText, setMsgText] = useState('');
  const [chatMsgs, setChatMsgs] = useState<any[]>([]);
  const convos = Array.isArray(conversationsHook.data?.conversations) ? conversationsHook.data.conversations : Array.isArray(conversationsHook.data) ? conversationsHook.data : [];
  const loadMsgs = async (otherId: string) => {
    if (!userId) return;
    const res = await messageApi.getMessages(userId, otherId);
    const msgs = res.success && res.data ? (res.data?.messages || res.data || []) : [];
    setChatMsgs(Array.isArray(msgs) ? msgs : []);
  };
  const sendMsg = async () => {
    if (!msgText.trim() || !selContact || !userId) return;
    const res = await messageApi.send({ sender_id: userId, receiver_id: selContact.user_id || selContact.id, message: msgText });
    if (res.success) { setChatMsgs(prev => [...prev, { id: Date.now(), sender_id: userId, message: msgText, created_at: new Date().toISOString() }]); setMsgText(''); }
    else toast.error('Failed to send');
  };
  return (
    <div className="p-4 sm:p-6 flex gap-4 h-[calc(100vh-120px)]">
      <div className="w-72 shrink-0 bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100"><h3 className="text-sm font-bold text-gray-900">Conversations</h3></div>
        <div className="flex-1 overflow-y-auto">
          {convos.map((c: any, i: number) => (
            <div key={c.id || i} onClick={() => { setSelContact(c); loadMsgs(c.user_id || c.id); }}
              className={`p-3.5 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selContact?.id === c.id ? 'bg-[#F3F0FF]' : ''}`}>
              <div className="text-xs font-semibold text-gray-900">{c.name || c.full_name || 'User'}</div>
              <div className="text-[10px] text-gray-400 truncate">{c.last_message || c.message || ''}</div>
            </div>
          ))}
          {convos.length === 0 && <div className="text-center py-8 text-xs text-gray-400">No conversations</div>}
        </div>
      </div>
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col">
        {selContact ? (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold">
                {(selContact.name || selContact.full_name || '?')[0].toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-gray-900">{selContact.name || selContact.full_name || 'User'}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMsgs.map((m: any, i: number) => (
                <div key={m.id || i} className={`flex ${m.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl text-xs ${m.sender_id === userId ? 'bg-[#6D4CFF] text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'}`}>
                    {m.message || m.content || ''}
                    <div className={`text-[9px] mt-1 ${m.sender_id === userId ? 'text-white/60' : 'text-gray-400'}`}>
                      {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-2">
              <input value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
              <button onClick={sendMsg} className="px-4 py-2.5 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5a3ee8] transition-all"><Send size={14} /></button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Select a conversation</div>
        )}
      </div>
    </div>
  );
}

function NotificationsView({ notificationsHook }: { notificationsHook: any }) {
  const notifs = Array.isArray(notificationsHook.data?.notifications) ? notificationsHook.data.notifications : Array.isArray(notificationsHook.data) ? notificationsHook.data : [];
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Notifications</h2>
      <p className="text-sm text-gray-500 mb-6">All your notifications in one place.</p>
      {notifs.length > 0 ? (
        <div className="space-y-2">
          {notifs.map((n: any, i: number) => (
            <div key={n.id || i} className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-sm transition-shadow flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${n.type === 'danger' ? 'bg-red-500' : n.type === 'warning' ? 'bg-purple-500' : 'bg-[#6D4CFF]'}`} />
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">{n.title || 'Notification'}</div>
                <div className="text-xs text-gray-500 mt-0.5">{n.message || ''}</div>
                <div className="text-[10px] text-gray-400 mt-1">{n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}</div>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-[#6D4CFF]" />}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
          <Bell size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No notifications yet</p>
        </div>
      )}
    </div>
  );
}

function ProfileView({ session }: { session: any }) {
  const user = session?.user || {};
  const teacher = session?.teacher || {};
  const [pt, setPt] = useState('overview');
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white text-xl font-bold">
          {(user.full_name || 'S')[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.full_name || 'Staff Member'}</h1>
          <p className="text-sm text-gray-500">{teacher.subject || user.role || 'Staff'}</p>
        </div>
      </div>
      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-2">
        {['overview', 'contact', 'settings'].map(t => (
          <button key={t} onClick={() => setPt(t)} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all capitalize ${pt === t ? 'bg-[#6D4CFF] text-white' : 'text-gray-500 hover:text-gray-700'}`}>{t}</button>
        ))}
      </div>
      {pt === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Email', value: user.email || '—' },
            { label: 'Role', value: user.role || '—' },
            { label: 'Employee ID', value: teacher.employee_id || user.employee_id || '—' },
            { label: 'Department', value: teacher.department || user.department || '—' },
            { label: 'Designation', value: teacher.designation || user.designation || '—' },
            { label: 'Phone', value: teacher.phone || user.phone || '—' },
          ].map((f, i) => (
            <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-[10px] text-gray-400 uppercase font-semibold">{f.label}</div>
              <div className="text-sm font-semibold text-gray-900 mt-1">{f.value}</div>
            </div>
          ))}
        </div>
      )}
      {pt === 'contact' && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Phone', value: teacher.phone || user.phone || '—' },
            { label: 'Email', value: user.email || '—' },
            { label: 'Address', value: teacher.address || user.address || '—' },
          ].map((f, i) => (
            <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-[10px] text-gray-400 uppercase font-semibold">{f.label}</div>
              <div className="text-sm font-semibold text-gray-900 mt-1">{f.value}</div>
            </div>
          ))}
        </div>
      )}
      {pt === 'settings' && <div className="text-center py-12 text-gray-400 text-sm">Settings panel coming soon.</div>}
    </div>
  );
}

function SelfModule({ teacherId }: { teacherId: string | null }) {
  const [st, setSt] = useState('overview');
  const tabs = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'assignments', label: 'Assignments', icon: Briefcase },
    { key: 'tasks', label: 'Tasks', icon: CheckSquare },
    { key: 'schedule', label: 'Schedule', icon: CalendarDays },
    { key: 'attendance', label: 'Attendance', icon: ClipboardList },
    { key: 'leave', label: 'Leave', icon: Umbrella },
    { key: 'performance', label: 'Performance', icon: TrendingUp },
    { key: 'documents', label: 'Documents', icon: FolderOpen },
    { key: 'resources', label: 'Resources', icon: Layers },
    { key: 'activity', label: 'Activity Log', icon: Activity },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ];
  const staffAssignments = useApi(() => staffApi.getAssignments(teacherId!), [teacherId], !!teacherId);
  const staffTasks = useApi(() => staffApi.getTasks(teacherId!), [teacherId], !!teacherId);
  const staffSchedules = useApi(() => staffApi.getSchedules(teacherId!), [teacherId], !!teacherId);
  const staffLeave = useApi(() => staffApi.getLeaves(teacherId!), [teacherId], !!teacherId);
  const staffPerf = useApi(() => staffApi.getPerformance(teacherId!), [teacherId], !!teacherId);
  const staffDocs = useApi(() => staffApi.getDocuments(teacherId!), [teacherId], !!teacherId);
  const staffRes = useApi(() => staffApi.getResources(teacherId!), [teacherId], !!teacherId);
  const staffActivities = useApi(() => staffApi.getActivities(teacherId!), [teacherId], !!teacherId);
  const staffNotifs = useApi(() => teacherApi.getNotifications(teacherId!), [teacherId], !!teacherId);

  const assignmentsList = Array.isArray(staffAssignments.data?.assignments) ? staffAssignments.data.assignments : Array.isArray(staffAssignments.data) ? staffAssignments.data : [];
  const tasksList = Array.isArray(staffTasks.data?.tasks) ? staffTasks.data.tasks : Array.isArray(staffTasks.data) ? staffTasks.data : [];
  const scheduleList = Array.isArray(staffSchedules.data?.schedules) ? staffSchedules.data.schedules : Array.isArray(staffSchedules.data) ? staffSchedules.data : [];
  const leavesList = Array.isArray(staffLeave.data?.leaves) ? staffLeave.data.leaves : Array.isArray(staffLeave.data) ? staffLeave.data : [];
  const perfData = staffPerf.data?.performance || staffPerf.data || {};
  const docsList = Array.isArray(staffDocs.data?.documents) ? staffDocs.data.documents : Array.isArray(staffDocs.data) ? staffDocs.data : [];
  const resourcesList = Array.isArray(staffRes.data?.resources) ? staffRes.data.resources : Array.isArray(staffRes.data) ? staffRes.data : [];
  const activityList = Array.isArray(staffActivities.data?.activities) ? staffActivities.data.activities : Array.isArray(staffActivities.data) ? staffActivities.data : [];
  const notifList = Array.isArray(staffNotifs.data?.notifications) ? staffNotifs.data.notifications : Array.isArray(staffNotifs.data) ? staffNotifs.data : [];

  const renderContent = () => {
    switch (st) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Active Assignments', value: assignmentsList.filter((a: any) => a.status === 'active').length, color: '#6D4CFF' },
                  { label: 'Pending Tasks', value: tasksList.filter((t: any) => t.status === 'pending').length, color: '#F59E0B' },
                  { label: 'Performance', value: perfData.score || perfData.rating || '—', color: '#22C55E' },
                ].map((c, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white border border-gray-100">
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">{c.label}</div>
                    <div className="text-xl font-extrabold mt-1" style={{ color: c.color }}>{c.value || 0}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-white border border-gray-100">
                <h4 className="text-xs font-bold text-gray-900 mb-3">Recent Activity</h4>
                {activityList.slice(0, 5).map((a: any, i: number) => (
                  <div key={a.id || i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6D4CFF] mt-1.5" />
                    <div>
                      <div className="text-xs text-gray-700">{a.activity || a.description || a.action || 'Activity'}</div>
                      <div className="text-[10px] text-gray-400">{a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}</div>
                    </div>
                  </div>
                ))}
                {activityList.length === 0 && <div className="text-xs text-gray-400 py-4 text-center">No recent activity</div>}
              </div>
            </div>
            <div>
              <div className="p-4 rounded-xl bg-white border border-gray-100 mb-3">
                <h4 className="text-xs font-bold text-gray-900 mb-3">Upcoming Schedule</h4>
                {scheduleList.slice(0, 4).map((s: any, i: number) => (
                  <div key={s.id || i} className="flex items-center gap-2 py-1.5 text-xs text-gray-600">
                    <Clock size={12} /> {s.title || s.name || 'Event'} — {s.date || s.start_date || ''}
                  </div>
                ))}
                {scheduleList.length === 0 && <div className="text-xs text-gray-400 text-center py-4">No upcoming events</div>}
              </div>
              <div className="p-4 rounded-xl bg-white border border-gray-100">
                <h4 className="text-xs font-bold text-gray-900 mb-3">Recent Notifications</h4>
                {notifList.slice(0, 4).map((n: any, i: number) => (
                  <div key={n.id || i} className="flex items-start gap-2 py-1.5 text-xs text-gray-600">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${n.type === 'danger' ? 'bg-red-500' : 'bg-[#6D4CFF]'}`} />
                    <span>{n.title || n.message || 'Notification'}</span>
                  </div>
                ))}
                {notifList.length === 0 && <div className="text-xs text-gray-400 text-center py-4">No notifications</div>}
              </div>
            </div>
          </div>
        );
      case 'assignments':
        return (
          <div className="space-y-2">
            {assignmentsList.length > 0 ? assignmentsList.map((a: any, i: number) => (
              <div key={a.id || i} className="p-4 rounded-xl bg-white border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{a.title || a.name || 'Assignment'}</div>
                  <div className="text-xs text-gray-500">{a.description || a.type || ''}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${a.status === 'active' ? 'bg-emerald-50 text-emerald-600' : a.status === 'pending' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                  {a.status || 'active'}
                </span>
              </div>
            )) : <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">No assignments yet</div>}
          </div>
        );
      case 'tasks':
        return (
          <div className="space-y-2">
            {tasksList.length > 0 ? tasksList.map((t: any, i: number) => (
              <div key={t.id || i} className="p-4 rounded-xl bg-white border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckSquare size={16} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t.title || t.name || 'Task'}</div>
                    <div className="text-xs text-gray-500">{t.description || ''}</div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${t.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : t.status === 'in_progress' || t.status === 'in-progress' ? 'bg-blue-50 text-blue-600' : t.status === 'overdue' ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600'}`}>
                  {t.status || 'pending'}
                </span>
              </div>
            )) : <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">No tasks assigned</div>}
          </div>
        );
      case 'schedule':
        return (
          <div className="space-y-2">
            {scheduleList.length > 0 ? scheduleList.map((s: any, i: number) => (
              <div key={s.id || i} className="p-4 rounded-xl bg-white border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{s.title || s.name || 'Schedule'}</div>
                    <div className="text-xs text-gray-500">{s.date || s.start_date || ''} {s.start_time ? `• ${s.start_time}` : ''}</div>
                  </div>
                </div>
              </div>
            )) : <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">No schedule entries</div>}
          </div>
        );
      case 'attendance':
        return (
          <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
            <ClipboardList size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Your attendance records managed by management</p>
          </div>
        );
      case 'leave':
        return (
          <div className="space-y-2">
            {leavesList.length > 0 ? leavesList.map((l: any, i: number) => (
              <div key={l.id || i} className="p-4 rounded-xl bg-white border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">{l.leave_type || l.type || 'Leave'}</div>
                  <div className="text-xs text-gray-500">{l.start_date || ''} → {l.end_date || ''}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${l.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : l.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600'}`}>
                  {l.status || 'pending'}
                </span>
              </div>
            )) : <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">No leave records</div>}
          </div>
        );
      case 'performance':
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Attendance Score', value: perfData.attendance_score || perfData.attendance || '—', unit: '%' },
              { label: 'Task Completion', value: perfData.task_completion || perfData.tasks || '—', unit: '%' },
              { label: 'Overall Score', value: perfData.score || perfData.rating || '—', unit: '/100' },
              { label: 'Homework Completion', value: perfData.homework_completion || '—', unit: '%' },
            ].map((p, i) => (
              <div key={i} className="p-4 rounded-xl bg-white border border-gray-100 text-center">
                <div className="text-[10px] text-gray-400 uppercase font-semibold">{p.label}</div>
                <div className="text-2xl font-extrabold text-gray-900 mt-1">{p.value} <span className="text-sm font-normal text-gray-400">{p.unit}</span></div>
              </div>
            ))}
          </div>
        );
      case 'documents':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {docsList.length > 0 ? docsList.map((d: any, i: number) => (
              <div key={d.id || i} className="p-4 rounded-xl bg-white border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <FolderOpen size={16} className="text-[#6D4CFF]" />
                  <span className="text-sm font-semibold text-gray-900">{d.name || d.title || 'Document'}</span>
                </div>
                <div className="text-[10px] text-gray-400">{d.type || d.document_type || ''}</div>
              </div>
            )) : <div className="col-span-full text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">No documents</div>}
          </div>
        );
      case 'resources':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {resourcesList.length > 0 ? resourcesList.map((r: any, i: number) => (
              <div key={r.id || i} className="p-4 rounded-xl bg-white border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Layers size={16} className="text-[#6D4CFF]" />
                  <span className="text-sm font-semibold text-gray-900">{r.name || r.title || 'Resource'}</span>
                </div>
                <div className="text-[10px] text-gray-400">{r.type || r.resource_type || ''}</div>
              </div>
            )) : <div className="col-span-full text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">No resources assigned</div>}
          </div>
        );
      case 'activity':
        return (
          <div className="space-y-2">
            {activityList.length > 0 ? activityList.map((a: any, i: number) => (
              <div key={a.id || i} className="p-3 rounded-xl bg-white border border-gray-100 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#6D4CFF] mt-1.5" />
                <div>
                  <div className="text-xs text-gray-700">{a.activity || a.description || a.action || 'Activity'}</div>
                  <div className="text-[10px] text-gray-400">{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</div>
                </div>
              </div>
            )) : <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">No activity logs</div>}
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-2">
            {notifList.length > 0 ? notifList.map((n: any, i: number) => (
              <div key={n.id || i} className="p-4 rounded-xl bg-white border border-gray-100 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${n.type === 'danger' ? 'bg-red-500' : n.type === 'warning' ? 'bg-purple-500' : 'bg-[#6D4CFF]'}`} />
                <div>
                  <div className="text-xs font-semibold text-gray-900">{n.title || 'Notification'}</div>
                  <div className="text-xs text-gray-500">{n.message || ''}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}</div>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-[#6D4CFF] ml-auto" />}
              </div>
            )) : <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">No notifications</div>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Self</h1>
          <p className="text-sm text-gray-500 mt-1">Everything assigned by management, in one place</p>
        </div>
      </div>
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setSt(tab.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${st === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>
      <motion.div key={st} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {renderContent()}
      </motion.div>
    </div>
  );
}
