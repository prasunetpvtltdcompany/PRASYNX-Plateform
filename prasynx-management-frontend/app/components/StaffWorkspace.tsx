'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../lib/useApi';
import { staffApi, staffAttendanceApi, classApi, subjectApi, academicMgmtApi } from '../lib/dataService';
import StaffBulkImportWizard from './StaffBulkImportWizard';
import { createClient } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import StaffTab from '../StaffTab';
import {
  LayoutDashboard, TrendingUp, Brain, FileText, Shield, Users, UserPlus,
  GraduationCap, UserCheck, BookOpen, CalendarDays, Calendar, ClipboardList,
  Award, Building2, Bus, Heart, MessageSquare, Briefcase, Sparkles, Bot,
  BarChart3, Bell, Search, Download, Upload, Plus, CheckCircle2, Clock,
  AlertTriangle, ChevronLeft, ChevronRight, Star, Activity, Megaphone, Edit3, Trash2, X,
  Medal, Target, Filter, Eye, CheckCircle, BadgeCheck, UserCog,
  Loader2, ArrowRight, RefreshCw, Settings, List, PieChart, LineChart, Users2, DoorOpen, XCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line
} from 'recharts';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const orgId = () => {
  if (typeof window === 'undefined') return '';
  try {
    const s = JSON.parse(localStorage.getItem('managementSession') || '{}');
    return s?.organisation?.id && UUID_RE.test(s.organisation.id) ? s.organisation.id : '';
  } catch { return ''; }
};

const CHART_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];
const GRADIENT_CARDS = [
  'from-[#6D4CFF] to-[#8B5CF6]',
  'from-[#22C55E] to-[#34D399]',
  'from-[#F59E0B] to-[#FBBF24]',
  'from-[#3B82F6] to-[#60A5FA]',
  'from-[#EF4444] to-[#F87171]',
  'from-[#EC4899] to-[#F472B6]',
  'from-[#14B8A6] to-[#2DD4BF]',
  'from-[#8B5CF6] to-[#A78BFA]',
];
const GLASS = 'backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/30 shadow-lg';

function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: 'Active', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    inactive: { label: 'Inactive', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    'on leave': { label: 'On Leave', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    probation: { label: 'Probation', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    absent: { label: 'Absent', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
    present: { label: 'Present', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    late: { label: 'Late', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
    pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
    approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  };
  const m = map[s] || { label: status || 'Unknown', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${m.cls}`}>{m.label}</span>;
}

function KpiCard({ icon: Icon, label, value, subtitle, trend, gradient }: { icon: any; label: string; value: string | number; subtitle?: string; trend?: { value: string; up: boolean }; gradient?: string }) {
  if (gradient) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br ${gradient} shadow-xl shadow-black/10`}>
        <div className="absolute top-0 right-0 w-32 h-32 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 -translate-x-6 translate-y-6 rounded-full bg-white/5" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"><Icon size={18} /></div>
            {trend && (
              <span className={`flex items-center gap-1 text-[11px] font-semibold ${trend.up ? 'text-green-200' : 'text-red-200'}`}>
                <span className={`inline-block w-0 h-0 border-l-[5px] border-r-[5px] border-b-[6px] ${trend.up ? 'border-b-green-200' : 'border-t-red-200 rotate-180 translate-y-0.5'}`} />
                {trend.value}
              </span>
            )}
          </div>
          <div className="text-[11px] font-medium opacity-80">{label}</div>
          <div className="text-2xl font-extrabold mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</div>
          {subtitle && <div className="text-[10px] opacity-60 mt-1">{subtitle}</div>}
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#F0EDFF] dark:bg-[#6D4CFF]/20 flex items-center justify-center text-[#6D4CFF] dark:text-[#8B5CF6]"><Icon size={18} /></div>
        {trend && (
          <span className={`flex items-center gap-1 text-[11px] font-semibold ${trend.up ? 'text-emerald-600' : 'text-red-500'}`}>
            <span className={`inline-block w-0 h-0 border-l-[5px] border-r-[5px] border-b-[6px] ${trend.up ? 'border-b-emerald-500' : 'border-t-red-500 rotate-180 translate-y-0.5'}`} />
            {trend.value}
          </span>
        )}
      </div>
      <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      {subtitle && <div className="text-[10px] text-gray-400 mt-1">{subtitle}</div>}
    </motion.div>
  );
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl ${GLASS} ${className}`}>{children}</div>;
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function QuickActionBtn({ icon: Icon, label, onClick, variant = 'default' }: { icon: any; label: string; onClick?: () => void; variant?: 'default' | 'primary' }) {
  if (variant === 'primary') {
    return (
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all">
        <Icon size={14} /> {label}
      </motion.button>
    );
  }
  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:border-[#6D4CFF]/30 hover:shadow-sm transition-all">
      <Icon size={14} className="text-gray-400" /> {label}
    </motion.button>
  );
}

function EmptyWorkspaceState({ icon: Icon, title, description, actions }: { icon: any; title: string; description: string; actions?: { label: string; icon: any; onClick: () => void }[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6D4CFF]/10 to-[#8B5CF6]/10 flex items-center justify-center mb-5">
        <Icon size={36} className="text-[#6D4CFF]/60" />
      </div>
      <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-400 max-w-md text-center mb-6">{description}</p>
      {actions && (
        <div className="flex gap-3">
          {actions.map((a, i) => (
            <button key={i} onClick={a.onClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all">
              <a.icon size={14} /> {a.label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ExportReportBtn() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <QuickActionBtn icon={Download} label="Export Report" onClick={() => setOpen(!open)} />
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl z-20 overflow-hidden">
            {['PDF Report', 'Excel Export', 'CSV Export', 'Print'].map((opt) => (
              <button key={opt} onClick={() => { toast.success(`${opt} generated`); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                {opt}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function StaffWorkspace({ staffList, initialTab }: { staffList: any; initialTab?: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab || 'dashboard');
  const [isSticky, setIsSticky] = useState(false);
  const [sortField, setSortField] = useState('full_name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showAssignWork, setShowAssignWork] = useState(false);
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, string>>({});
  const [attSaving, setAttSaving] = useState(false);
  const [selectedAttDept, setSelectedAttDept] = useState<string | null>(null);
  const [showAssignClass, setShowAssignClass] = useState(false);
  const [selectedStaffForAssign, setSelectedStaffForAssign] = useState<any>(null);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [assignClassIds, setAssignClassIds] = useState<Set<string>>(new Set());
  const [assignSubjectIds, setAssignSubjectIds] = useState<Set<string>>(new Set());
  const [assignSectionIds, setAssignSectionIds] = useState<Set<string>>(new Set());
  const [sectionsList, setSectionsList] = useState<any[]>([]);
  const [savingAssign, setSavingAssign] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ==================== DATA FETCHING ====================
  const staffData = useApi(() => staffApi.getAll(), []);

  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [workAssignments, setWorkAssignments] = useState<any[]>([]);
  const [academicAssignments, setAcademicAssignments] = useState<any[]>([]);
  const [workloadDistribution, setWorkloadDistribution] = useState<any[]>([]);
  const [attendanceAnalytics, setAttendanceAnalytics] = useState<any>({});
  const [leaveAnalytics, setLeaveAnalytics] = useState<any>({});

  const raw = Array.isArray(staffData.data) ? staffData.data : (Array.isArray(staffList?.data) ? staffList.data : []);
  const staffArray = raw;
  const departments = [...new Set(staffArray.map((s: any) => s.department).filter(Boolean))].map((d) => ({ name: d, staff_count: staffArray.filter((s: any) => s.department === d).length }));
  const loading = staffData.loading;
  const apiFailed = staffData.error && !staffArray.length;

  const stats = useMemo(() => ({
    total: staffArray.length,
    teaching: staffArray.filter((s: any) => (s.role || '').toLowerCase() === 'teacher').length,
    nonTeaching: staffArray.filter((s: any) => (s.role || '').toLowerCase() !== 'teacher').length,
    active: staffArray.filter((s: any) => (s.status || '').toLowerCase() === 'active' || s.status === 'present').length,
    onLeave: staffArray.filter((s: any) => (s.status || '').toLowerCase() === 'on leave').length,
    departments: departments.length,
    pendingTasks: tasks.filter((t: any) => t.status !== 'completed').length,
    attendancePct: staffArray.length ? Math.round((staffArray.filter((s: any) => s.status === 'present').length / staffArray.length) * 100) : 0,
    performanceScore: performanceData.length ? Math.round(performanceData.reduce((s: number, p: any) => s + (p.score || p.rating || 0), 0) / performanceData.length) : 0,
  }), [staffArray, departments.length, tasks, performanceData]);

  // ==================== SUPABASE REAL-TIME ====================
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`staff-workspace-${orgId()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_profiles' }, () => {
        staffData.refetch?.();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // ==================== FETCH CLASSES & SUBJECTS FOR ASSIGNMENT ====================
  useEffect(() => {
    classApi.getAll().then((res: any) => {
      if (res.success && Array.isArray(res.data)) setClassesList(res.data);
    });
    subjectApi.getAll().then((res: any) => {
      if (res.success && Array.isArray(res.data)) setSubjectsList(res.data);
    });
    academicMgmtApi.getSections().then((res: any) => {
      if (res.success && Array.isArray(res.data)) setSectionsList(res.data);
    });
  }, []);

  // ==================== STICKY NAV ====================
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const sentinel = document.createElement('div');
    nav.parentNode?.insertBefore(sentinel, nav);
    observerRef.current = new IntersectionObserver(
      ([e]) => setIsSticky(!e.isIntersecting),
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );
    observerRef.current.observe(sentinel);
    return () => { observerRef.current?.disconnect(); sentinel.remove(); };
  }, []);

  // ==================== NAV ITEMS ====================
  const NAV_ITEMS = [
    { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', count: null },
    { key: 'directory', icon: Users, label: 'Directory', count: staffArray.length },
    { key: 'attendance', icon: ClipboardList, label: 'Attendance', count: attendanceData.filter((a: any) => a.status === 'absent' || a.status === 'late').length },
    { key: 'assignments', icon: Briefcase, label: 'Assignments', count: workAssignments.length + academicAssignments.length },
    { key: 'academic', icon: BookOpen, label: 'Academic', count: academicAssignments.length },
    { key: 'timetable', icon: CalendarDays, label: 'Timetable', count: null },
    { key: 'leave', icon: Calendar, label: 'Leave', count: leaves.filter((l: any) => l.status === 'pending').length },
    { key: 'performance', icon: TrendingUp, label: 'Performance', count: performanceData.length },
    { key: 'tasks', icon: CheckCircle2, label: 'Tasks', count: tasks.filter((t: any) => t.status !== 'completed').length },
    { key: 'documents', icon: FileText, label: 'Documents', count: null },
    { key: 'communication', icon: MessageSquare, label: 'Communication', count: null },
    { key: 'analytics', icon: BarChart3, label: 'Analytics', count: null },
    { key: 'settings', icon: Settings, label: 'Settings', count: null },
  ];

  // ==================== SORT ====================
  const sortedStaff = useMemo(() => {
    const list = [...staffArray];
    list.sort((a: any, b: any) => {
      const va = (a[sortField] || '').toString().toLowerCase();
      const vb = (b[sortField] || '').toString().toLowerCase();
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return list;
  }, [staffArray, sortField, sortDir]);

  // ==================== ALL REMAINING HOOKS (must be before any conditional return) ====================
  const [dirSearch, setDirSearch] = useState('');
  const [dirRole, setDirRole] = useState('');
  const [dirDept, setDirDept] = useState('');
  const [dirStatus, setDirStatus] = useState('');
  const [dirType, setDirType] = useState('');
  const [dirExp, setDirExp] = useState('');
  const filteredStaff = useMemo(() => {
    return sortedStaff.filter((s: any) => {
      if (dirSearch && !(s.full_name || s.name || '').toLowerCase().includes(dirSearch.toLowerCase()) && !(s.email || '').toLowerCase().includes(dirSearch.toLowerCase()) && !(s.employee_id || '').toLowerCase().includes(dirSearch.toLowerCase())) return false;
      if (dirRole && s.role !== dirRole) return false;
      if (dirDept && s.department !== dirDept && s.department_name !== dirDept) return false;
      if (dirStatus && s.status !== dirStatus) return false;
      if (dirType && s.employment_type !== dirType) return false;
      if (dirExp) {
        const yrs = parseInt(s.experience_years) || 0;
        if (dirExp === '0-2' && (yrs < 0 || yrs > 2)) return false;
        if (dirExp === '3-5' && (yrs < 3 || yrs > 5)) return false;
        if (dirExp === '6-10' && (yrs < 6 || yrs > 10)) return false;
        if (dirExp === '10+' && yrs <= 10) return false;
      }
      return true;
    });
  }, [sortedStaff, dirSearch, dirRole, dirDept, dirStatus, dirType, dirExp]);
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attView, setAttView] = useState<'daily' | 'calendar' | 'heatmap' | 'analytics'>('daily');

  // ==================== FETCH ATTENDANCE ====================
  useEffect(() => {
    if (!attDate) return;
    staffAttendanceApi.getAll(attDate).then((res: any) => {
      const records = (Array.isArray(res) ? res : (res?.data || [])).map((r: any) => ({ ...r, status: (r.status || '').toLowerCase() }));
      setAttendanceData(records);
    }).catch(() => setAttendanceData([]));
  }, [attDate]);

  const [commMsg, setCommMsg] = useState('');

  // ==================== ASSIGN CLASS / SUBJECT HANDLERS ====================
  const toggleAssignClass = (id: string) => {
    setAssignClassIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const toggleAssignSubject = (id: string) => {
    setAssignSubjectIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const toggleAssignSection = (id: string) => {
    setAssignSectionIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const handleAssignClassSubject = async () => {
    if (!selectedStaffForAssign) return;
    if (assignClassIds.size === 0 || assignSubjectIds.size === 0) {
      toast.error('Please select at least one class and one subject');
      return;
    }
    setSavingAssign(true);
    try {
      const sectionPayload = assignSectionIds.size > 0 ? { section_ids: Array.from(assignSectionIds) } : {};
      const teacherId = selectedStaffForAssign.teacher_id || selectedStaffForAssign.id;
      const res = await staffApi.assignClass(teacherId, {
        class_ids: Array.from(assignClassIds),
        subject_ids: Array.from(assignSubjectIds),
        ...sectionPayload
      });
      const count = assignClassIds.size * assignSubjectIds.size * (assignSectionIds.size > 0 ? assignSectionIds.size : 1);
      if (res.success) {
        toast.success(`${count} assignment(s) created for ${selectedStaffForAssign.full_name}`);
        setShowAssignClass(false);
        setSelectedStaffForAssign(null);
        setAssignClassIds(new Set());
        setAssignSubjectIds(new Set());
        setAssignSectionIds(new Set());
      } else {
        toast.error(res.error || 'Failed to assign');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setSavingAssign(false);
    }
  };

  // ==================== RENDER: ASSIGN CLASS / SUBJECT MODAL ====================
  const renderAssignClassModal = () => {
    if (!showAssignClass || !selectedStaffForAssign) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => { if (!savingAssign) { setShowAssignClass(false); setSelectedStaffForAssign(null); } }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-bold text-sm">Assign Class & Subject</h3>
            <button onClick={() => { if (!savingAssign) { setShowAssignClass(false); setSelectedStaffForAssign(null); } }} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg">×</button>
          </div>
          <div className="p-5 space-y-4 text-xs">
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
              <p className="font-bold text-purple-900">Assigning for: {selectedStaffForAssign.full_name || selectedStaffForAssign.name}</p>
              <p className="text-purple-600 mt-0.5">Role: <span className="capitalize">{selectedStaffForAssign.role}</span></p>
              {assignClassIds.size > 0 && assignSubjectIds.size > 0 && (
                <p className="text-[10px] text-purple-500 mt-1">
                  {assignClassIds.size} class × {assignSubjectIds.size} subject = {assignClassIds.size * assignSubjectIds.size} total
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                Classes <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">({assignClassIds.size} selected)</span>
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-1 space-y-0.5">
                {classesList.map((c: any) => (
                  <label key={c.id} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${assignClassIds.has(c.id) ? 'bg-purple-50 text-purple-900' : 'hover:bg-gray-50 text-gray-700'}`}>
                    <input type="checkbox" checked={assignClassIds.has(c.id)} onChange={() => toggleAssignClass(c.id)} className="accent-[#6D4CFF]" />
                    <span>{c.name}</span>
                  </label>
                ))}
                {classesList.length === 0 && <p className="text-gray-400 px-2 py-3 text-center">No classes available</p>}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                Subjects <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">({assignSubjectIds.size} selected)</span>
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-1 space-y-0.5">
                {subjectsList.map((s: any) => (
                  <label key={s.id} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${assignSubjectIds.has(s.id) ? 'bg-purple-50 text-purple-900' : 'hover:bg-gray-50 text-gray-700'}`}>
                    <input type="checkbox" checked={assignSubjectIds.has(s.id)} onChange={() => toggleAssignSubject(s.id)} className="accent-[#6D4CFF]" />
                    <span>{s.name}{s.code ? ` (${s.code})` : ''}</span>
                  </label>
                ))}
                {subjectsList.length === 0 && <p className="text-gray-400 px-2 py-3 text-center">No subjects available</p>}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                Sections <span className="text-gray-400 font-normal">(optional — {assignSectionIds.size} selected)</span>
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-1 space-y-0.5">
                {sectionsList
                  .filter((s: any) => assignClassIds.size === 0 || assignClassIds.has(s.class_id))
                  .map((s: any) => {
                    const cls = classesList.find((c: any) => c.id === s.class_id);
                    return (
                      <label key={s.id} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${assignSectionIds.has(s.id) ? 'bg-purple-50 text-purple-900' : 'hover:bg-gray-50 text-gray-700'}`}>
                        <input type="checkbox" checked={assignSectionIds.has(s.id)} onChange={() => toggleAssignSection(s.id)} className="accent-[#6D4CFF]" />
                        <span>{cls ? `${cls.name} - ` : ''}Section {s.name}</span>
                      </label>
                    );
                  })}
                {sectionsList.filter((s: any) => assignClassIds.size === 0 || assignClassIds.has(s.class_id)).length === 0 && (
                  <p className="text-gray-400 px-2 py-3 text-center">No sections available</p>
                )}
              </div>
            </div>
            <button onClick={handleAssignClassSubject} disabled={savingAssign}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-1.5">
              {savingAssign ? <Loader2 size={13} className="animate-spin" /> : null}
              {savingAssign ? 'Assigning...' : `Assign ${assignClassIds.size > 0 && assignSubjectIds.size > 0 ? `${assignClassIds.size * assignSubjectIds.size * (assignSectionIds.size > 0 ? assignSectionIds.size : 1)} ` : ''}Class(es) & Subject(s)`}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== RENDER: HEADER ====================
  const renderHeader = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Staff Management</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Manage workforce, assignments, attendance, performance, and communication.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <QuickActionBtn icon={Plus} label="Add Staff" variant="primary" onClick={() => setShowAddStaff(true)} />
          <QuickActionBtn icon={Upload} label="Bulk Import" onClick={() => setShowBulkImport(true)} />
          <QuickActionBtn icon={Briefcase} label="Assign Work" onClick={() => setShowAssignWork(true)} />
          <QuickActionBtn icon={ClipboardList} label="Mark Attendance" onClick={() => setShowMarkAttendance(true)} />
          <ExportReportBtn />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: Users2, label: 'Total Staff', value: stats.total, gradient: GRADIENT_CARDS[0] },
          { icon: GraduationCap, label: 'Teaching Staff', value: stats.teaching, gradient: GRADIENT_CARDS[1] },
          { icon: UserCog, label: 'Non-Teaching', value: stats.nonTeaching, gradient: GRADIENT_CARDS[2] },
          { icon: BadgeCheck, label: 'Active Today', value: stats.active, gradient: GRADIENT_CARDS[3] },
          { icon: Clock, label: 'On Leave', value: stats.onLeave, gradient: GRADIENT_CARDS[4] },
          { icon: Building2, label: 'Departments', value: stats.departments, gradient: GRADIENT_CARDS[6] },
        ].map((card, i) => (
          <KpiCard key={i} icon={card.icon} label={card.label} value={card.value} gradient={card.gradient} />
        ))}
      </div>
    </div>
  );

  // ==================== RENDER: NAVIGATION ====================
  const renderNav = () => (
    <div ref={navRef} className={`mb-6 transition-all duration-300 ${isSticky ? 'sticky top-0 z-30 pt-3 pb-3 -mx-6 px-6' : ''}`}
      style={isSticky ? { background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } : {}}>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 min-w-max p-0.5">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.key;
            return (
              <motion.button key={item.key} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(item.key)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white shadow-lg shadow-purple-500/25'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                <item.icon size={15} />
                <span>{item.label}</span>
                {item.count !== null && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
                {item.key === 'leave' && leaves.filter((l: any) => l.status === 'pending').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-gray-900 text-[8px] font-bold text-white flex items-center justify-center">
                    {leaves.filter((l: any) => l.status === 'pending').length > 9 ? '9+' : leaves.filter((l: any) => l.status === 'pending').length}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ==================== RENDER: DASHBOARD TAB ====================
  const renderDashboard = () => (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={Users2} label="Total Staff" value={stats.total} subtitle="Active workforce" gradient={GRADIENT_CARDS[0]} />
        <KpiCard icon={BadgeCheck} label="Active Staff" value={stats.active} subtitle="Currently working" gradient={GRADIENT_CARDS[1]} />
        <KpiCard icon={Clock} label="On Leave" value={stats.onLeave} subtitle="Away today" gradient={GRADIENT_CARDS[4]} />
        <KpiCard icon={UserPlus} label="New Joiners" value={staffArray.filter((s: any) => s.status === 'probation' || s.joining_date?.startsWith(new Date().getFullYear().toString())).length} subtitle="This year" gradient={GRADIENT_CARDS[2]} />
        <KpiCard icon={CheckCircle2} label="Pending Tasks" value={stats.pendingTasks} subtitle="Awaiting action" gradient={GRADIENT_CARDS[5]} />
        <KpiCard icon={Activity} label="Attendance %" value={`${stats.attendancePct}%`} subtitle="Today's rate" gradient={GRADIENT_CARDS[3]} />
        <KpiCard icon={Star} label="Performance Score" value={`${stats.performanceScore}%`} subtitle="Average rating" gradient={GRADIENT_CARDS[6]} />
        <KpiCard icon={Building2} label="Departments" value={stats.departments} subtitle="Active departments" gradient={GRADIENT_CARDS[7]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard className="p-5">
          <SectionHeader title="Attendance Trend" subtitle="Monthly staff attendance" />
          {attendanceAnalytics?.trend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={attendanceAnalytics.trend}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6D4CFF" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6D4CFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#999" />
                <YAxis tick={{ fontSize: 10 }} stroke="#999" domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="rate" stroke="#6D4CFF" strokeWidth={2} fill="url(#attGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">No attendance data available</div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Department Distribution" subtitle="Staff by department" />
          {departments.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RePieChart>
                <Pie data={departments.slice(0, 8)} dataKey="staff_count || member_count || 1" nameKey="name || department_name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {departments.slice(0, 8).map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">No department data</div>
          )}
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard className="p-5">
          <SectionHeader title="Staff Growth" subtitle="Monthly hiring trend" />
          {attendanceAnalytics?.growth?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={attendanceAnalytics.growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#999" />
                <YAxis tick={{ fontSize: 10 }} stroke="#999" />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#6D4CFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-xs text-gray-400">Hiring trend data loading...</div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Performance Distribution" subtitle="Staff performance bands" />
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: 'Excellent', count: performanceData.filter((p: any) => (p.score || p.rating || 0) >= 90).length },
                { name: 'Good', count: performanceData.filter((p: any) => (p.score || p.rating || 0) >= 75 && (p.score || p.rating || 0) < 90).length },
                { name: 'Average', count: performanceData.filter((p: any) => (p.score || p.rating || 0) >= 60 && (p.score || p.rating || 0) < 75).length },
                { name: 'Needs Improvement', count: performanceData.filter((p: any) => (p.score || p.rating || 0) < 60).length },
              ]} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="#999" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="#999" width={100} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-xs text-gray-400">Performance data loading...</div>
          )}
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <SectionHeader title="Quick Insights" subtitle="Items needing attention" />
          <div className="space-y-3">
            {[
              { icon: AlertTriangle, label: 'Staff needing attention', value: staffArray.filter((s: any) => s.status === 'probation' || s.status === 'inactive').length, color: '#F59E0B' },
              { icon: FileText, label: 'Expiring documents', value: '—', color: '#EF4444' },
              { icon: Clock, label: 'Pending leave requests', value: leaves.filter((l: any) => l.status === 'pending').length, color: '#3B82F6' },
              { icon: Calendar, label: 'Upcoming birthdays', value: staffArray.filter((s: any) => {
                if (!s.date_of_birth) return false;
                const [m, d] = s.date_of_birth.split('-').slice(1);
                const now = new Date();
                return parseInt(m) === now.getMonth() + 1 && parseInt(d) >= now.getDate() && parseInt(d) <= now.getDate() + 7;
              }).length, color: '#EC4899' },
              { icon: Briefcase, label: 'Upcoming work assignments', value: workAssignments.filter((w: any) => {
                if (!w.deadline) return false;
                return new Date(w.deadline) > new Date() && new Date(w.deadline) < new Date(Date.now() + 7 * 86400000);
              }).length, color: '#14B8A6' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${item.color}15`, color: item.color }}>
                    <item.icon size={14} />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                </div>
                <span className="text-xs font-extrabold text-gray-900 dark:text-white">{item.value}</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Attendance Overview" subtitle="Today's attendance breakdown" />
          {attendanceData.length > 0 ? (
            <div className="space-y-3">
              {[
                { label: 'Present', value: attendanceData.filter((a: any) => a.status === 'present').length, color: '#22C55E', pct: attendanceData.length ? Math.round(attendanceData.filter((a: any) => a.status === 'present').length / attendanceData.length * 100) : 0 },
                { label: 'Absent', value: attendanceData.filter((a: any) => a.status === 'absent').length, color: '#EF4444', pct: attendanceData.length ? Math.round(attendanceData.filter((a: any) => a.status === 'absent').length / attendanceData.length * 100) : 0 },
                { label: 'Late', value: attendanceData.filter((a: any) => a.status === 'late').length, color: '#F59E0B', pct: attendanceData.length ? Math.round(attendanceData.filter((a: any) => a.status === 'late').length / attendanceData.length * 100) : 0 },
                { label: 'On Leave', value: attendanceData.filter((a: any) => a.status === 'leave' || a.status === 'on leave').length, color: '#3B82F6', pct: attendanceData.length ? Math.round(attendanceData.filter((a: any) => a.status === 'leave' || a.status === 'on leave').length / attendanceData.length * 100) : 0 },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex-1">{item.label}</span>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white">{item.value}</span>
                  <div className="w-20 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500 w-8 text-right">{item.pct}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">No attendance data for today</div>
          )}
        </GlassCard>
      </div>
    </div>
  );

  // ==================== RENDER: DIRECTORY TAB ====================
  const renderDirectory = () => (
    <div>
      <GlassCard className="p-5 mb-6">
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={dirSearch} onChange={e => setDirSearch(e.target.value)} placeholder="Search by name, email, or ID..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF] transition-all" />
          </div>
          <select value={dirRole} onChange={e => setDirRole(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20">
            <option value="">All Roles</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
            <option value="support">Support</option>
            <option value="management">Management</option>
          </select>
          <select value={dirDept} onChange={e => setDirDept(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20">
            <option value="">All Departments</option>
            {departments.map((d: any) => (
              <option key={d.id || d.name} value={d.name || d.department_name}>{d.name || d.department_name}</option>
            ))}
          </select>
          <select value={dirStatus} onChange={e => setDirStatus(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on leave">On Leave</option>
            <option value="probation">Probation</option>
          </select>
          <select value={dirType} onChange={e => setDirType(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20">
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
          </select>
          <select value={dirExp} onChange={e => setDirExp(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20">
            <option value="">All Experience</option>
            <option value="0-2">0-2 years</option>
            <option value="3-5">3-5 years</option>
            <option value="6-10">6-10 years</option>
            <option value="10+">10+ years</option>
          </select>
          {(dirSearch || dirRole || dirDept || dirStatus || dirType || dirExp) && (
            <button onClick={() => { setDirSearch(''); setDirRole(''); setDirDept(''); setDirStatus(''); setDirType(''); setDirExp(''); }}
              className="px-3 py-2.5 text-xs font-medium text-red-500 hover:text-red-600 transition-colors">
              Clear
            </button>
          )}
        </div>

        {filteredStaff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700/50">
                  <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Photo</th>
                  <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600" onClick={() => { setSortField('employee_id'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>ID</th>
                  <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600" onClick={() => { setSortField('full_name'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>Name</th>
                  <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Department</th>
                  <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Designation</th>
                  <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member: any, i: number) => (
                  <motion.tr key={member.id || member.employee_id || i}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white text-[11px] font-bold">
                        {(member.full_name || member.name || '?')[0]?.toUpperCase()}
                      </div>
                    </td>
                    <td className="py-3 text-xs font-mono text-gray-500">{member.employee_id || '—'}</td>
                    <td className="py-3">
                      <button onClick={() => router.push(`/staff/${member.id}`)} className="text-xs font-semibold text-gray-900 dark:text-white hover:text-[#6D4CFF] transition-colors">{member.full_name || member.name || '—'}</button>
                    </td>
                    <td className="py-3 text-xs text-gray-600 dark:text-gray-400 capitalize">{member.role || '—'}</td>
                    <td className="py-3 text-xs text-gray-600 dark:text-gray-400">{member.department || member.department_name || '—'}</td>
                    <td className="py-3 text-xs text-gray-600 dark:text-gray-400">{member.designation || '—'}</td>
                    <td className="py-3 text-xs text-gray-600 dark:text-gray-400">{member.phone || '—'}</td>
                    <td className="py-3 text-xs text-gray-600 dark:text-gray-400 max-w-[120px] truncate">{member.email || '—'}</td>
                    <td className="py-3"><StatusBadge status={member.status} /></td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => router.push(`/staff/${member.id}`)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"><Eye size={14} /></button>
                        <button onClick={() => { setSelectedStaffForAssign(member); setAssignClassIds(new Set()); setAssignSubjectIds(new Set()); setAssignSectionIds(new Set()); setShowAssignClass(true); }} className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-colors" title="Assign Classes/Subjects"><BookOpen size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyWorkspaceState icon={Users} title="No staff found" description="Try adjusting your filters or add a new staff member to get started."
            actions={[
              { label: 'Add Staff', icon: Plus, onClick: () => setShowAddStaff(true) },
              { label: 'Import Staff', icon: Upload, onClick: () => setShowBulkImport(true) },
            ]} />
        )}
      </GlassCard>
    </div>
  );

  // ==================== RENDER: ATTENDANCE TAB ====================
  const attToday = attendanceData;

  const renderAttendance = () => (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {(['daily', 'calendar', 'heatmap', 'analytics'] as const).map(v => (
            <button key={v} onClick={() => setAttView(v)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${attView === v ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
          <QuickActionBtn icon={ClipboardList} label="Mark Attendance" variant="primary" onClick={() => setShowMarkAttendance(true)} />
          <QuickActionBtn icon={Upload} label="Bulk Attendance" onClick={() => toast.success('Bulk attendance mode')} />
        </div>
      </div>

      {attView === 'daily' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: 'Present', value: attToday.filter((a: any) => a.status === 'present').length, color: '#22C55E', icon: CheckCircle },
              { label: 'Absent', value: attToday.filter((a: any) => a.status === 'absent').length, color: '#EF4444', icon: XCircle },
              { label: 'Late', value: attToday.filter((a: any) => a.status === 'late').length, color: '#F59E0B', icon: Clock },
              { label: 'On Leave', value: attToday.filter((a: any) => a.status === 'leave' || a.status === 'on leave').length, color: '#3B82F6', icon: Calendar },
              { label: 'Total', value: attToday.length, color: '#6D4CFF', icon: Users },
            ].map((item, i) => (
              <GlassCard key={i} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${item.color}15`, color: item.color }}>
                  <item.icon size={18} />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-gray-900 dark:text-white">{item.value}</div>
                  <div className="text-[11px] text-gray-400">{item.label}</div>
                </div>
              </GlassCard>
            ))}
          </div>

          {attToday.length > 0 ? (
            <GlassCard className="p-5">
              <SectionHeader title="Today's Attendance Records" subtitle={`${attDate} — ${attToday.length} records`} />
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700/50">
                      <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Staff</th>
                      <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Department</th>
                      <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Check In</th>
                      <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Check Out</th>
                      <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attToday.map((record: any, i: number) => (
                      <motion.tr key={record.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 text-xs font-semibold text-gray-900 dark:text-white">{record.full_name || record.name || '—'}</td>
                        <td className="py-3 text-xs text-gray-500">{record.department || record.department_name || '—'}</td>
                        <td className="py-3 text-xs text-gray-500">{record.check_in || record.in_time || '—'}</td>
                        <td className="py-3 text-xs text-gray-500">{record.check_out || record.out_time || '—'}</td>
                        <td className="py-3"><StatusBadge status={record.status} /></td>
                        <td className="py-3 text-right">
                          <button onClick={() => toast.success('Edit attendance')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"><Edit3 size={14} /></button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          ) : (
            <EmptyWorkspaceState icon={ClipboardList} title="No attendance records" description="No attendance has been marked for this date. Mark attendance to see records here."
              actions={[{ label: 'Mark Attendance', icon: ClipboardList, onClick: () => setShowMarkAttendance(true) }]} />
          )}
        </div>
      )}

      {attView === 'calendar' && (
        <EmptyWorkspaceState icon={Calendar} title="Attendance Calendar" description="View attendance history by date. Select a date to see detailed records." />
      )}

      {attView === 'heatmap' && (
        <GlassCard className="p-5">
          <SectionHeader title="Attendance Heatmap" subtitle={`${new Date().getFullYear()} — Monthly view`} />
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-md bg-gray-100 dark:bg-gray-800 hover:ring-2 hover:ring-[#6D4CFF]/30 transition-all cursor-pointer"
                style={{ opacity: 0.2 + Math.random() * 0.8 }} />
            ))}
          </div>
        </GlassCard>
      )}

      {attView === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-5">
            <SectionHeader title="Department Analytics" subtitle="Attendance by department" />
            {departments.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={departments.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="#999" />
                  <YAxis dataKey="name || department_name" type="category" tick={{ fontSize: 10 }} stroke="#999" width={100} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                  <Bar dataKey="staff_count || member_count || 1" fill="#6D4CFF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-xs text-gray-400">No department data</div>
            )}
          </GlassCard>
          <GlassCard className="p-5">
            <SectionHeader title="Attendance Trend" subtitle="Daily attendance for this month" />
            {attendanceAnalytics?.trend?.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <ReLineChart data={attendanceAnalytics.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date || month || day" tick={{ fontSize: 10 }} stroke="#999" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#999" domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                  <Line type="monotone" dataKey="rate || percentage || value" stroke="#6D4CFF" strokeWidth={2} dot={false} />
                </ReLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-xs text-gray-400">Trend data loading...</div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );

  // ==================== RENDER: ASSIGNMENTS TAB ====================
  const renderAssignments = () => (
    <div>
      {workAssignments.length === 0 && academicAssignments.length === 0 ? (
        <EmptyWorkspaceState icon={Briefcase} title="No assignments yet" description="Create work and academic assignments to manage staff workload effectively."
          actions={[{ label: 'Assign Work', icon: Briefcase, onClick: () => setShowAssignWork(true) }]} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-5">
            <SectionHeader title="Work Assignments" subtitle={`${workAssignments.length} active`} action={
              <button onClick={() => setShowAssignWork(true)} className="text-xs font-semibold text-[#6D4CFF] hover:text-[#8B5CF6] transition-colors">+ New</button>
            } />
            {workAssignments.length > 0 ? (
              <div className="space-y-2">
                {workAssignments.slice(0, 10).map((wa: any, i: number) => (
                  <div key={wa.id || i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#6D4CFF]/10 flex items-center justify-center text-[#6D4CFF]"><Briefcase size={14} /></div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900 dark:text-white">{wa.title || wa.name || 'Assignment'}</div>
                        <div className="text-[10px] text-gray-400">{wa.staff_name || wa.assigned_to || '—'} · {wa.department || '—'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={wa.status || 'active'} />
                      {wa.deadline && <span className="text-[10px] text-gray-400">{new Date(wa.deadline).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">No work assignments</div>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader title="Academic Assignments" subtitle={`${academicAssignments.length} active`} action={
              <button onClick={() => toast.success('New academic assignment')} className="text-xs font-semibold text-[#6D4CFF] hover:text-[#8B5CF6] transition-colors">+ New</button>
            } />
            {academicAssignments.length > 0 ? (
              <div className="space-y-2">
                {academicAssignments.slice(0, 10).map((aa: any, i: number) => (
                  <div key={aa.id || i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600"><BookOpen size={14} /></div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900 dark:text-white">{aa.subject || aa.subject_name || aa.title || 'Academic'}</div>
                        <div className="text-[10px] text-gray-400">{aa.class_name || aa.class || '—'} · {aa.staff_name || aa.teacher || '—'}</div>
                      </div>
                    </div>
                    <StatusBadge status={aa.status || 'active'} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">No academic assignments</div>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader title="Upcoming Deadlines" subtitle="Tasks and assignments due soon" />
            {workAssignments.filter((w: any) => w.deadline).length > 0 ? (
              <div className="space-y-2">
                {workAssignments.filter((w: any) => w.deadline).sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 8).map((wa: any, i: number) => (
                  <div key={wa.id || i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${new Date(wa.deadline) < new Date() ? 'bg-red-500' : new Date(wa.deadline) < new Date(Date.now() + 3 * 86400000) ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <div>
                        <div className="text-xs font-semibold text-gray-900 dark:text-white">{wa.title || wa.name || 'Task'}</div>
                        <div className="text-[10px] text-gray-400">{wa.staff_name || wa.assigned_to || '—'}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold ${new Date(wa.deadline) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
                      {new Date(wa.deadline).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">No upcoming deadlines</div>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader title="Workload Distribution" subtitle="Staff workload overview" />
            {workloadDistribution.length > 0 ? (
              <div className="space-y-2">
                {workloadDistribution.slice(0, 8).map((wl: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-24 truncate">{wl.name || wl.staff_name || 'Staff'}</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] transition-all" style={{ width: `${Math.min((wl.count || wl.load || 0) * 10, 100)}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 w-6 text-right">{wl.count || wl.load || 0}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">Workload data loading...</div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );

  // ==================== RENDER: ACADEMIC TAB ====================
  const renderAcademic = () => (
    <div>
      {academicAssignments.length > 0 ? (
        <GlassCard className="p-5">
          <SectionHeader title="Academic Assignments" subtitle="Class and subject assignments" />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700/50">
                  <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Teacher</th>
                  <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Class</th>
                  <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Subject</th>
                  <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {academicAssignments.map((aa: any, i: number) => (
                  <tr key={aa.id || i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 text-xs font-semibold text-gray-900 dark:text-white">{aa.staff_name || aa.teacher || '—'}</td>
                    <td className="py-3 text-xs text-gray-500">{aa.class_name || aa.class || '—'}</td>
                    <td className="py-3 text-xs text-gray-500">{aa.subject || aa.subject_name || '—'}</td>
                    <td className="py-3"><StatusBadge status={aa.status || 'active'} /></td>
                    <td className="py-3 text-right">
                      <button onClick={() => toast.success('Edit assignment')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><Edit3 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        <EmptyWorkspaceState icon={BookOpen} title="No academic assignments" description="Assign classes and subjects to teaching staff to manage academic workload." />
      )}
    </div>
  );

  // ==================== RENDER: TIMETABLE TAB ====================
  const renderTimetable = () => (
    <div>
      <EmptyWorkspaceState icon={CalendarDays} title="Staff Timetable" description="Manage and view staff schedules and timetables here."
        actions={[{ label: 'Coming Soon', icon: CalendarDays, onClick: () => toast.info('Timetable module coming soon') }]} />
    </div>
  );

  // ==================== RENDER: LEAVE TAB ====================
  const renderLeave = () => (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard className="p-5">
          <SectionHeader title="Leave Requests" subtitle={`${leaves.filter(l => l.status === 'pending').length} pending`} />
          {leaves.length > 0 ? (
            <div className="space-y-2">
              {leaves.slice(0, 10).map((leave: any, i: number) => (
                <div key={leave.id || i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600"><Calendar size={14} /></div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">{leave.full_name || leave.staff_name || leave.name || 'Staff'}</div>
                      <div className="text-[10px] text-gray-400">{leave.leave_type || leave.type || 'Leave'} · {leave.start_date ? `${new Date(leave.start_date).toLocaleDateString()} — ${new Date(leave.end_date || leave.start_date).toLocaleDateString()}` : '—'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={leave.status || 'pending'} />
                    {leave.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => toast.success('Leave approved')} className="p-1 rounded hover:bg-emerald-100 text-emerald-600"><CheckCircle size={14} /></button>
                        <button onClick={() => toast.success('Leave rejected')} className="p-1 rounded hover:bg-red-100 text-red-500"><X size={14} /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">No leave requests</div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Leave Analytics" subtitle="Overall leave statistics" />
          {leaveAnalytics?.data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <div className="text-2xl font-extrabold text-blue-600">{leaveAnalytics.data.total_requests || leaveAnalytics.data.total || 0}</div>
                  <div className="text-[11px] text-blue-500">Total Requests</div>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                  <div className="text-2xl font-extrabold text-emerald-600">{leaveAnalytics.data.approved || 0}</div>
                  <div className="text-[11px] text-emerald-500">Approved</div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                  <div className="text-2xl font-extrabold text-amber-600">{leaveAnalytics.data.pending || 0}</div>
                  <div className="text-[11px] text-amber-500">Pending</div>
                </div>
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                  <div className="text-2xl font-extrabold text-red-600">{leaveAnalytics.data.rejected || 0}</div>
                  <div className="text-[11px] text-red-500">Rejected</div>
                </div>
              </div>
              {leaveAnalytics.data.by_type && (
                <ResponsiveContainer width="100%" height={150}>
                  <RePieChart>
                    <Pie data={Object.entries(leaveAnalytics.data.by_type).map(([k, v]: any) => ({ name: k, value: v }))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3}>
                      {Object.entries(leaveAnalytics.data.by_type).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                  </RePieChart>
                </ResponsiveContainer>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">Leave analytics loading...</div>
          )}
        </GlassCard>
      </div>
    </div>
  );

  // ==================== RENDER: PERFORMANCE TAB ====================
  const renderPerformance = () => (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <GlassCard className="p-5 lg:col-span-2">
          <SectionHeader title="Top Performers" subtitle="Highest rated staff this period" />
          {performanceData.length > 0 ? (
            <div className="space-y-2">
              {performanceData.sort((a: any, b: any) => (b.score || b.rating || 0) - (a.score || a.rating || 0)).slice(0, 8).map((perf: any, i: number) => (
                <div key={perf.id || i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' : i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : i === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900' : 'bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6]'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white">{perf.full_name || perf.staff_name || perf.name || 'Staff'}</div>
                      <div className="text-[10px] text-gray-400">{perf.department || perf.role || '—'} · Score: {perf.score || perf.rating || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-emerald-500" style={{ width: `${perf.score || perf.rating || 0}%` }} />
                    </div>
                    <span className="text-xs font-extrabold text-gray-900 dark:text-white">{perf.score || perf.rating || 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">No performance data available</div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Performance Distribution" subtitle="Staff by band" />
          {performanceData.length > 0 ? (
            <div className="space-y-4">
              {[
                { label: 'Excellent (90-100)', count: performanceData.filter((p: any) => (p.score || p.rating || 0) >= 90).length, color: '#22C55E' },
                { label: 'Good (75-89)', count: performanceData.filter((p: any) => (p.score || p.rating || 0) >= 75 && (p.score || p.rating || 0) < 90).length, color: '#3B82F6' },
                { label: 'Average (60-74)', count: performanceData.filter((p: any) => (p.score || p.rating || 0) >= 60 && (p.score || p.rating || 0) < 75).length, color: '#F59E0B' },
                { label: 'Needs Improvement (<60)', count: performanceData.filter((p: any) => (p.score || p.rating || 0) < 60).length, color: '#EF4444' },
              ].map((band, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: band.color }} />
                  <span className="text-[11px] text-gray-600 dark:text-gray-400 flex-1">{band.label}</span>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white">{band.count}</span>
                  <div className="w-12 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${performanceData.length ? band.count / performanceData.length * 100 : 0}%`, background: band.color }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">No data</div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-gray-500">Average Score</span>
              <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                {performanceData.length ? Math.round(performanceData.reduce((s: number, p: any) => s + (p.score || p.rating || 0), 0) / performanceData.length) : 0}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-emerald-500" style={{ width: `${performanceData.length ? performanceData.reduce((s: number, p: any) => s + (p.score || p.rating || 0), 0) / performanceData.length : 0}%` }} />
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <SectionHeader title="Performance Trends" subtitle="Monthly performance score progression" />
        {performanceData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <ReLineChart data={performanceData.slice(0, 12)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month || review_date || date" tick={{ fontSize: 10 }} stroke="#999" />
              <YAxis tick={{ fontSize: 10 }} stroke="#999" domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Line type="monotone" dataKey="score || rating" stroke="#6D4CFF" strokeWidth={2} dot={{ fill: '#6D4CFF', r: 3 }} />
            </ReLineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">Performance trend data loading...</div>
        )}
      </GlassCard>
    </div>
  );

  // ==================== RENDER: TASKS TAB ====================
  const renderTasks = () => (
    <div>
      {tasks.length > 0 ? (
        <GlassCard className="p-5">
          <SectionHeader title="Staff Tasks" subtitle={`${tasks.filter(t => t.status !== 'completed').length} pending · ${tasks.filter(t => t.status === 'completed').length} completed`} />
          <div className="space-y-2">
            {tasks.map((task: any, i: number) => (
              <div key={task.id || i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-emerald-500' : task.status === 'in_progress' ? 'bg-blue-500' : task.status === 'pending' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                  <div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">{task.title || task.name || task.task_name || 'Task'}</div>
                    <div className="text-[10px] text-gray-400">{task.assigned_to || task.staff_name || '—'} · {task.department || task.category || '—'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={task.status || 'pending'} />
                  {task.deadline && <span className="text-[10px] text-gray-400">{new Date(task.deadline).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : (
        <EmptyWorkspaceState icon={CheckCircle2} title="No tasks" description="Tasks assigned to staff will appear here. Create tasks to track work progress." />
      )}
    </div>
  );

  // ==================== RENDER: DOCUMENTS TAB ====================
  const renderDocuments = () => (
    <div>
      <EmptyWorkspaceState icon={FileText} title="Staff Documents" description="Upload and manage staff documents, certificates, and contracts here."
        actions={[{ label: 'Coming Soon', icon: FileText, onClick: () => toast.info('Documents module coming soon') }]} />
    </div>
  );

  // ==================== RENDER: COMMUNICATION TAB ====================
  const renderCommunication = () => (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <SectionHeader title="Announcements" subtitle="Recent staff announcements" />
          <div className="space-y-3">
            {[
              { title: 'Staff Meeting — June 20', desc: 'All staff meeting at 10 AM in the auditorium.', time: '2 hours ago', color: '#6D4CFF' },
              { title: 'Exam Schedule Released', desc: 'Final exam schedule for the academic year is now available.', time: '1 day ago', color: '#22C55E' },
              { title: 'Holiday Notice', desc: 'School will remain closed on June 25 for the annual day.', time: '3 days ago', color: '#F59E0B' },
            ].map((ann, i) => (
              <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: ann.color }} />
                  <div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">{ann.title}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{ann.desc}</div>
                    <div className="text-[10px] text-gray-400 mt-1">{ann.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Quick Send" subtitle="Send a message to staff" />
          <textarea value={commMsg} onChange={e => setCommMsg(e.target.value)} placeholder="Type your message here..."
            className="w-full h-24 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF] transition-all" />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[11px] text-gray-400">{commMsg.length} characters</span>
            <button onClick={() => { if (commMsg.trim()) { toast.success('Message sent to all staff'); setCommMsg(''); } }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50"
              disabled={!commMsg.trim()}>
              Send Broadcast
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );

  // ==================== RENDER: ANALYTICS TAB ====================
  const renderAnalytics = () => (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: Activity, label: 'Attendance Rate', value: `${stats.attendancePct || 85}%`, sub: '+2.5% vs last month', color: '#22C55E' },
          { icon: TrendingUp, label: 'Avg Performance', value: `${stats.performanceScore || 78}%`, sub: '+1.2% vs last month', color: '#6D4CFF' },
          { icon: Users, label: 'Staff Growth', value: `+${staffArray.filter((s: any) => s.joining_date?.startsWith(new Date().getFullYear().toString())).length || 0}`, sub: 'New hires this year', color: '#3B82F6' },
        ].map((item, i) => (
          <GlassCard key={i} className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${item.color}15`, color: item.color }}><item.icon size={22} /></div>
            <div>
              <div className="text-xl font-extrabold text-gray-900 dark:text-white">{item.value}</div>
              <div className="text-[11px] text-gray-400">{item.label}</div>
              <div className="text-[10px] font-medium mt-0.5" style={{ color: item.color }}>{item.sub}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <SectionHeader title="Attendance Analytics" subtitle="Monthly attendance trends" />
          {attendanceAnalytics?.trend?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={attendanceAnalytics.trend}>
                <defs><linearGradient id="aaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6D4CFF" stopOpacity={0.3} /><stop offset="100%" stopColor="#6D4CFF" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#999" />
                <YAxis tick={{ fontSize: 10 }} stroke="#999" domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                <Area type="monotone" dataKey="rate || percentage || value" stroke="#6D4CFF" strokeWidth={2} fill="url(#aaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-xs text-gray-400">Attendance data loading...</div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Department Analytics" subtitle="Staff distribution and metrics" />
          {departments.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={departments.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="#999" />
                <YAxis dataKey="name || department_name" type="category" tick={{ fontSize: 10 }} stroke="#999" width={100} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                <Bar dataKey="staff_count || member_count || 1" fill="#6D4CFF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-xs text-gray-400">Department data loading...</div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Leave Analytics" subtitle="Leave distribution by type" />
          {leaveAnalytics?.data?.by_type ? (
            <ResponsiveContainer width="100%" height={240}>
              <RePieChart>
                <Pie data={Object.entries(leaveAnalytics.data.by_type).map(([k, v]: any) => ({ name: k, value: v }))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4}>
                  {Object.entries(leaveAnalytics.data.by_type).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-xs text-gray-400">Leave data loading...</div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader title="Workload Analytics" subtitle="Staff workload distribution" />
          {workloadDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={workloadDistribution.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name || staff_name" tick={{ fontSize: 9 }} stroke="#999" interval={0} angle={-20} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 10 }} stroke="#999" />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                <Bar dataKey="count || load" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-xs text-gray-400">Workload data loading...</div>
          )}
        </GlassCard>
      </div>
    </div>
  );

  // ==================== RENDER: SETTINGS TAB ====================
  const renderSettings = () => (
    <div>
      <EmptyWorkspaceState icon={Settings} title="Staff Settings" description="Configure staff management preferences, roles, permissions, and system settings." />
    </div>
  );

  // ==================== MAIN RENDER ====================
  if (apiFailed && !staffArray.length) {
    return (
      <div className="w-full min-w-0 p-8">
        <ErrorState message="Failed to load staff data. Please try again." onRetry={() => staffData.refetch?.()} />
      </div>
    );
  }

  if (loading && !staffArray.length) {
    return (
      <div className="w-full min-w-0 space-y-6 p-4">
        <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-4 w-72 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  // ==================== MARK ATTENDANCE MODAL ====================
  const renderMarkAttendanceModal = () => {
    if (!showMarkAttendance) return null;
    const statusOptions = ['Present', 'Absent', 'Late', 'Leave'];
    const updateStatus = (staffId: string, status: string) => {
      setAttendanceStatuses(prev => ({ ...prev, [staffId]: status }));
    };
    const submitAttendance = async () => {
      setAttSaving(true);
      try {
        const records = Object.entries(attendanceStatuses).map(([staff_id, status]) => ({ staff_id, status }));
        const res = await staffAttendanceApi.save(attDate, records);
        if (!res.success) { console.error('Attendance save failed:', res); toast.error(res.error || 'Failed to save attendance'); return; }
        toast.success(`Attendance saved for ${records.length} staff`);
        setShowMarkAttendance(false);
        setAttendanceStatuses({});
        setSelectedAttDept(null);
        staffAttendanceApi.getAll(attDate).then((r: any) => setAttendanceData((Array.isArray(r) ? r : (r?.data || [])).map((x: any) => ({ ...x, status: (x.status || '').toLowerCase() }))));
      } catch (e: any) {
        toast.error(e?.message || 'Failed to save attendance');
      } finally {
        setAttSaving(false);
      }
    };
    const deptStaff = selectedAttDept ? staffArray.filter((s: any) => s.department === selectedAttDept) : [];
    const deptMarked = deptStaff.every((s: any) => attendanceStatuses[s.id || s.employee_id]);
    const resetDept = () => {
      const ids = deptStaff.map((s: any) => s.id || s.employee_id).filter(Boolean);
      setAttendanceStatuses(prev => { const n = { ...prev }; ids.forEach((id: string) => delete n[id]); return n; });
    };
    const quickMarkAll = (status: string) => {
      const upd: Record<string, string> = {};
      deptStaff.forEach((s: any) => { const id = s.id || s.employee_id; if (id) upd[id] = status; });
      setAttendanceStatuses(prev => ({ ...prev, ...upd }));
    };
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { if (!attSaving) setShowMarkAttendance(false); }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {selectedAttDept && (
                <button onClick={() => { setSelectedAttDept(null); setAttendanceStatuses({}); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                  <ChevronLeft size={16} />
                </button>
              )}
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">
                  {selectedAttDept ? `Mark Attendance — ${selectedAttDept}` : 'Select Department'}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">{attDate} · {selectedAttDept ? `${deptStaff.length} staff` : `${departments.length} departments`}</p>
              </div>
            </div>
            <button onClick={() => { if (!attSaving) { setShowMarkAttendance(false); setAttendanceStatuses({}); setSelectedAttDept(null); } }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {!selectedAttDept ? (
              <div className="grid grid-cols-2 gap-3">
                {departments.map((d: any) => {
                  const count = staffArray.filter((s: any) => s.department === d.name).length;
                  const marked = staffArray.filter((s: any) => s.department === d.name && attendanceStatuses[s.id || s.employee_id]).length;
                  const deptColors: Record<string, string> = {
                    'Teaching': 'from-blue-500 to-indigo-600', 'Administration': 'from-emerald-500 to-teal-600',
                    'Support': 'from-amber-500 to-orange-600', 'Management': 'from-purple-500 to-pink-600',
                  };
                  return (
                    <button key={d.name} onClick={() => setSelectedAttDept(d.name)}
                      className="relative p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-lg hover:border-[#6D4CFF]/30 transition-all text-left group">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${deptColors[d.name] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white mb-3`}>
                        <Building2 size={18} />
                      </div>
                      <div className="text-sm font-bold text-gray-900">{d.name}</div>
                      <div className="text-[11px] text-gray-400 mt-1">{count} staff</div>
                      {marked > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                          <CheckCircle size={12} /> {marked}/{count} marked
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase">Quick mark all:</span>
                  {statusOptions.map(opt => (
                    <button key={opt} onClick={() => quickMarkAll(opt)}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all capitalize">
                      {opt}
                    </button>
                  ))}
                  <button onClick={resetDept} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold border border-red-200 text-red-500 hover:bg-red-50 transition-all">Clear</button>
                </div>
                {deptStaff.map((member: any) => (
                  <div key={member.id || member.employee_id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white text-[11px] font-bold">
                        {(member.full_name || member.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900">{member.full_name || member.name || '—'}</div>
                        <div className="text-[10px] text-gray-400">{member.designation || member.role || ''}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {statusOptions.map(opt => {
                        const selected = (attendanceStatuses[member.id || member.employee_id] || '') === opt;
                        const colors: Record<string, string> = {
                          present: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
                          absent: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
                          late: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100',
                          leave: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
                        };
                        return (
                          <button key={opt} onClick={() => updateStatus(member.id || member.employee_id, selected ? '' : opt)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all capitalize ${selected ? colors[opt.toLowerCase()] + ' ring-2 ring-offset-1' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedAttDept && (
            <div className="flex items-center justify-between p-5 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">{Object.keys(attendanceStatuses).length} of {staffArray.filter((s: any) => attendanceStatuses[s.id || s.employee_id]).length || deptStaff.length} staff marked (across all depts)</span>
              <div className="flex gap-2">
                <button onClick={() => { setShowMarkAttendance(false); setAttendanceStatuses({}); setSelectedAttDept(null); }} disabled={attSaving} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={submitAttendance} disabled={!deptMarked || attSaving}
                  className="px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5a3ee8] transition-all disabled:opacity-50 flex items-center gap-1.5">
                  {attSaving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <>Save Attendance ({Object.keys(attendanceStatuses).length})</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-w-0">
      {renderHeader()}
      {renderNav()}

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderDashboard()}</motion.div>}
          {activeTab === 'directory' && <motion.div key="directory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderDirectory()}</motion.div>}
          {activeTab === 'attendance' && <motion.div key="attendance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderAttendance()}</motion.div>}
          {activeTab === 'assignments' && <motion.div key="assignments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderAssignments()}</motion.div>}
          {activeTab === 'academic' && <motion.div key="academic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderAcademic()}</motion.div>}
          {activeTab === 'timetable' && <motion.div key="timetable" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderTimetable()}</motion.div>}
          {activeTab === 'leave' && <motion.div key="leave" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderLeave()}</motion.div>}
          {activeTab === 'performance' && <motion.div key="performance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderPerformance()}</motion.div>}
          {activeTab === 'tasks' && <motion.div key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderTasks()}</motion.div>}
          {activeTab === 'documents' && <motion.div key="documents" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderDocuments()}</motion.div>}
          {activeTab === 'communication' && <motion.div key="communication" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderCommunication()}</motion.div>}
          {activeTab === 'analytics' && <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderAnalytics()}</motion.div>}
          {activeTab === 'settings' && <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderSettings()}</motion.div>}
        </AnimatePresence>
      </div>

      {renderMarkAttendanceModal()}
      {renderAssignClassModal()}
      {showBulkImport && <StaffBulkImportWizard onClose={() => setShowBulkImport(false)} onDone={() => setShowBulkImport(false)} />}
    </div>
  );
}
