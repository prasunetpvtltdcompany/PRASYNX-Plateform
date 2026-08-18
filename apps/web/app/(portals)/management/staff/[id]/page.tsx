'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import apiClient from '../../lib/apiClient';
import { auth } from '../../lib/auth';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import { useDarkMode } from '../../lib/useDarkMode';
import { staffApi, classApi, subjectApi, rolesApiV2, staffAttendanceApi } from '../../lib/dataService';
import CommandPalette from '@/components/CommandPalette';
import { createClient } from '../../lib/supabase';
import {
  User, Layers, Shield, TrendingUp, FileText,
  Key, LogOut, LogIn, Search, Sparkles, Bell, Moon, Sun, ChevronLeft, ArrowLeft,
  Plus, Trash2, Mail, Phone, MapPin, Award, CheckCircle2, XCircle, Clock,
  Briefcase, DollarSign, BookOpen, AlertTriangle, Users, ClipboardList, ShieldAlert,
  Loader2, RefreshCw, Bus, Building2, Heart, ShieldCheck, HelpCircle, Check, FileSpreadsheet, Lock, Hourglass,
  BarChart3, GraduationCap, Book, Star, CalendarDays, Edit3, Save, X, Filter, ChevronDown, ChevronUp, Eye, ChevronRight,
  Minus, BadgeCheck, Landmark, Banknote, Component
} from 'lucide-react';

// UUID regex validation
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const getOrgId = () => {
  if (typeof window === 'undefined') return '';
  try {
    const s = auth.getSession();
    return s?.organisation?.id && UUID_RE.test(s.organisation.id) ? s.organisation.id : '';
  } catch { return ''; }
};

export default function StaffDetailPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;

  // State managers
  const [currentTab, setCurrentTab] = useState('overview');
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Load local session info
  useEffect(() => {
    try {
      const s = auth.getSession();
      setSessionUser(s?.user || null);
    } catch {}
  }, []);

  // API fetches
  const staffListState = useApi(() => staffApi.getAll(), []);

  // Resolve staff member from the staff list
  const staffMember = useMemo(() => {
    return (staffListState.data || []).find((s: any) => s.id === staffId);
  }, [staffListState.data, staffId]);

  const teacherId = staffMember?.teacher_id || staffId;
  const assignmentsState = useApi(() => staffApi.getAssignments(teacherId), [teacherId]);
  const classesListState = useApi(() => classApi.getAll(), []);
  const subjectsListState = useApi(() => subjectApi.getAll(), []);
  const tasksState = useApi(() => staffApi.getTasks(staffId), [staffId]);
  const resourcesState = useApi(() => staffApi.getResources(staffId), [staffId]);
  const leavesState = useApi(() => staffApi.getLeaves(staffId), [staffId]);
  const documentsState = useApi(() => staffApi.getDocuments(staffId), [staffId]);
  const performanceState = useApi(() => staffApi.getPerformance(staffId), [staffId]);
  const workloadState = useApi(() => staffApi.getWorkload(staffId), [staffId]);
  const salaryState = useApi(() => staffApi.getSalary(staffId), [staffId]);

  // Real-time synchronization subscription
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase.channel(`wos-detail-${staffId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_tasks' }, () => {
        tasksState.refetch();
        workloadState.refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_assignments' }, () => {
        assignmentsState.refetch();
        workloadState.refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_leave_requests' }, () => {
        leavesState.refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_performance' }, () => {
        performanceState.refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_resources' }, () => {
        resourcesState.refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_documents' }, () => {
        documentsState.refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_payslips' }, () => {
        salaryState.refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_payroll' }, () => {
        salaryState.refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [staffId]);

  if (staffListState.loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#2563EB]" />
          <p className="text-xs font-semibold text-gray-500">Loading Workforce details...</p>
        </div>
      </div>
    );
  }

  if (staffListState.error || !staffMember) {
    const errMsg = typeof staffListState.error === 'string' ? staffListState.error : (staffListState.error as any)?.message || '';
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <Card className="p-6 max-w-md text-center space-y-4">
          <AlertTriangle size={48} className="text-red-500 mx-auto" />
          <h2 className="text-lg font-bold">Staff Member Not Found</h2>
          <p className="text-xs text-gray-500">We could not find a staff record matching ID: {staffId}.</p>
          {errMsg && <p className="text-[10px] text-red-400 font-mono">{errMsg}</p>}
          <button onClick={() => router.push('/management?tab=staff')} className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8]">
            Back to Staff Management
          </button>
        </Card>
      </div>
    );
  }

  const role = (staffMember.designation || staffMember.role || 'staff').toLowerCase();
  
  // Custom navigation trigger helper
  const handleNav = (tabKey: string) => {
    setCurrentTab(tabKey);
  };

  const userInitials = sessionUser?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'A';

  const isTeacher = (staffMember.role || staffMember.designation || '').toLowerCase().includes('teacher');
  const staffAssignments = (assignmentsState.data?.staff_assignments || [])
    .concat(assignmentsState.data?.teacher_classes || [])
    .concat(assignmentsState.data?.teacher_subjects || [])
    .concat(assignmentsState.data?.teacher_matrix || []);
  const taskList = tasksState.data?.data || tasksState.data || [];
  const workloadData = workloadState.data?.data || workloadState.data || {};
  const perfList = performanceState.data?.data || performanceState.data || [];
  const leaveList = leavesState.data?.data || leavesState.data || [];
  const workloadPct = Math.round(Number(workloadData.workload_percentage || 0));
  const completionRate = taskList.length ? Math.round(taskList.filter((t: any) => (t.status || '').toUpperCase() === 'COMPLETED').length / taskList.length * 100) : 100;
  const perfScore = perfList.length ? Number(perfList[0].score) || 0 : null;
  const pendingTasks = taskList.filter((t: any) => { const st = (t.status || '').toUpperCase(); return st === 'PENDING' || st === 'IN_PROGRESS'; }).length;
  const leaveApproved = leaveList.filter((l: any) => (l.status || '').toUpperCase() === 'APPROVED').length;
  const healthScore = Math.min(100, Math.max(0, Math.round((100 - Math.min(workloadPct, 100)) * 0.35 + completionRate * 0.35 + (perfScore != null ? perfScore : 70) * 0.3)));
  const scoreColor = healthScore >= 80 ? '#34D399' : healthScore >= 55 ? '#FBBF24' : '#F87171';

  const aiRecs: { icon: any; text: string }[] = [];
  if (workloadPct > 80) aiRecs.push({ icon: AlertTriangle, text: `Workload at ${workloadPct}% — consider redistributing assignments` });
  if (pendingTasks > 0) aiRecs.push({ icon: CheckCircle2, text: `${pendingTasks} pending task${pendingTasks > 1 ? 's' : ''} — follow up for completion` });
  if (perfScore != null && perfScore < 60) aiRecs.push({ icon: TrendingUp, text: `Performance score ${perfScore}/100 — schedule a review` });
  if (isTeacher && staffAssignments.length === 0) aiRecs.push({ icon: BookOpen, text: 'No class/subject assignments yet — assign teaching duties' });
  if (!isTeacher && staffAssignments.length === 0) aiRecs.push({ icon: Briefcase, text: 'No operational assignments yet — assign tasks under Tasks' });
  if (!aiRecs.length) aiRecs.push({ icon: ShieldCheck, text: 'Profile health looks good — no critical flags' });

  return (
    <div className={darkMode ? 'dark min-h-screen' : 'min-h-screen'} style={{ background: darkMode ? '#0B1220' : '#F8FAFC' }}>
      {/* Main Container */}
      <main className="main-content" style={{ marginLeft: 0 }}>
        <header className="header">
          <div className="header-left flex items-center gap-2 w-full max-w-md">
            <button onClick={() => router.push('/management?tab=staff')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-150 text-xs text-gray-500 font-semibold transition-colors flex-shrink-0">
              <ArrowLeft size={14} /> Back to List
            </button>
            <div className="hidden lg:flex search-bar cursor-pointer ml-4 w-full" onClick={() => setCmdPaletteOpen(true)}>
              <Search size={16} />
              <input type="text" placeholder="Search shortcuts, staff, classes (CMD+K)..." readOnly className="cursor-pointer" />
            </div>
          </div>
          <div className="header-right">
            <button className="header-btn" onClick={toggleDarkMode} title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button>
            <div className="header-divider" />
            <div className="flex items-center gap-2.5">
              <AvatarInitials name={sessionUser?.full_name || 'Administrator'} />
              <div className="hidden sm:block">
                <div className="text-xs font-semibold">{sessionUser?.full_name || 'Administrator'}</div>
                <div className="text-[10px] text-gray-400">School Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="page space-y-6 mx-auto">
          
          {/* Glassmorphic Profile Header Card */}
          <div className="relative overflow-hidden rounded-3xl text-white p-6 shadow-xl anim-gradient"
            style={{ background: 'linear-gradient(-45deg, #0F172A 0%, #1E3A8A 40%, #2563EB 75%, #0891B2 100%)', backgroundSize: '220% 220%' }}>
            <div className="absolute inset-0 opacity-[0.1]"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl anim-float" />
            <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-[#0891B2]/40 blur-2xl anim-pulse-glow" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black border border-white/20 shadow-inner">
                  {staffMember.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="text-center md:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h1 className="text-xl font-extrabold tracking-tight">{staffMember.full_name}</h1>
                    <Badge variant="info" className="bg-white/10 hover:bg-white/25 border-white/20 text-white text-[10px] uppercase font-bold capitalize">
                      {role}
                    </Badge>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${isTeacher ? 'bg-emerald-400/20 border-emerald-300/30 text-emerald-100' : 'bg-cyan-400/20 border-cyan-300/30 text-cyan-100'}`}>
                      <BookOpen size={11} /> {isTeacher ? 'Teaching Staff' : 'Non-Teaching Staff'}
                    </span>
                  </div>
                  <p className="text-xs text-white/80 flex items-center gap-1.5 justify-center md:justify-start font-medium">
                    <Briefcase size={12} /> {staffMember.department || 'General'} Department &bull; {staffMember.designation || 'Staff'}
                  </p>
                  <p className="text-[11px] text-white/70 font-mono">
                    ID: {staffMember.staff_unique_id || 'EMP—'}
                  </p>
                </div>
              </div>

              {/* Quick Actions Header Area */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button onClick={() => router.push('/management?tab=staff')} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-slate-800 border border-white/60 hover:bg-slate-50 text-xs font-bold shadow-sm transition-colors">
                  <ArrowLeft size={13} className="text-slate-600" /> Back to List
                </button>
              </div>
            </div>
          </div>

          {/* Sub-Tabbed Navigation Control Bar */}
          <div className="flex overflow-x-auto gap-1.5 pb-2 border-b border-gray-100 no-scrollbar">
            {[
              { key: 'overview', label: 'Overview', icon: User },
              { key: 'ai-insight', label: 'AI Insight', icon: Sparkles },
              ...(isTeacher ? [{ key: 'class-subject', label: 'Class & Subject', icon: BookOpen }] : []),
              { key: 'personal-info', label: 'Personal Info', icon: User },
              { key: 'tasks', label: 'Tasks', icon: CheckCircle2 },
              { key: 'attendance', label: 'Attendance', icon: Clock },
              { key: 'leave', label: 'Leave', icon: FileSpreadsheet },
              { key: 'performance', label: 'Performance', icon: TrendingUp },
              { key: 'resources', label: 'Resources', icon: Layers },
              { key: 'documents', label: 'Documents', icon: FileText },
              { key: 'salary', label: 'Salary', icon: DollarSign }
            ].map(tab => {
              const isActive = currentTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleNav(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${isActive ? 'bg-gradient-to-r from-[#2563EB] to-[#0891B2] text-white shadow-md shadow-blue-500/20' : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-100 hover:border-gray-200'}`}
                >
                  <tab.icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Sub-Tab Panels */}
          <div className="mt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {currentTab === 'ai-insight' && (
                  <div className="rounded-2xl overflow-hidden text-white p-6 relative anim-gradient anim-fade-up delay-1"
                    style={{ background: 'linear-gradient(-45deg, #0891B2 0%, #2563EB 35%, #4F46E5 65%, #0F172A 100%)', backgroundSize: '220% 220%' }}>
                    <div className="absolute inset-0 opacity-[0.12]"
                      style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
                    <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl anim-float" />
                    <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-[#0891B2]/40 blur-2xl anim-pulse-glow" />
                    <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-[#22D3EE]/20 blur-3xl anim-float" style={{ animationDelay: '1.5s' }} />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={16} className="anim-pulse-glow" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90">AI Workforce Profile Intelligence</span>
                      </div>
                      <h3 className="text-xl font-extrabold mb-4">Staff Performance & Engagement Overview</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                        {[
                          { label: 'Workload', value: workloadPct, suffix: '%', color: workloadPct > 80 ? '#F87171' : workloadPct > 50 ? '#FBBF24' : '#34D399' },
                          { label: 'Task Completion', value: completionRate, suffix: '%', color: '#34D399' },
                          { label: 'Performance Score', value: perfScore, suffix: perfScore != null ? '/100' : '', color: '#A78BFA' },
                          { label: 'Assigned Tasks', value: taskList.length, suffix: '', color: '#60A5FA' },
                          { label: 'Pending Tasks', value: pendingTasks, suffix: '', color: '#FBBF24' },
                          { label: 'Approved Leaves', value: leaveApproved, suffix: '', color: '#F472B6' },
                        ].map((c, i) => (
                          <div key={c.label} className="rounded-xl bg-white/10 p-3 backdrop-blur-sm border border-white/10 anim-fade-up hover:bg-white/20 hover:-translate-y-0.5 transition-all" style={{ animationDelay: `${0.15 * i}s` }}>
                            <div className="text-[9px] uppercase tracking-wider opacity-75">{c.label}</div>
                            <div className="text-lg font-extrabold mt-0.5 tabular-nums" style={{ color: c.color }}><AnimatedValue value={c.value} suffix={c.suffix} /></div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-4 mt-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-20 h-20">
                            <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/10 anim-ping-slow" />
                            <svg viewBox="0 0 100 100" className="relative w-full h-full -rotate-90">
                              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="9" />
                              <circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="9" strokeLinecap="round"
                                strokeDasharray={`${(healthScore / 100) * 264} 264`} style={{ transition: 'stroke-dasharray 1s ease' }} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-xl font-extrabold tabular-nums" style={{ color: scoreColor }}><AnimatedValue value={healthScore} /></span>
                              <span className="text-[7px] uppercase tracking-widest opacity-75">Health</span>
                            </div>
                          </div>
                          <div className="text-xs text-white/90 max-w-md leading-relaxed">
                            {isTeacher
                              ? `Teaching load balance ${workloadPct}% · ${workloadData.active_classes_count || 0} classes · ${workloadData.active_tasks_count || 0} active tasks.`
                              : `Operational load balance ${workloadPct}% · ${taskList.length} tasks assigned · ${pendingTasks} tasks in flight.`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mt-4">
                        {aiRecs.map((r, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-semibold text-white/90 anim-fade-up" style={{ animationDelay: `${0.1 * i}s` }}>
                            <r.icon size={12} /> {r.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentTab === 'overview' && (
                  <OverviewPanel
                    staff={staffMember}
                    assignments={assignmentsState.data}
                    tasks={tasksState.data?.data || tasksState.data || []}
                    workload={workloadState.data?.data || workloadState.data || {}}
                    performance={performanceState.data?.data || performanceState.data || []}
                    leaves={leavesState.data?.data || leavesState.data || []}
                  />
                )}
                
                {currentTab === 'class-subject' && (
                  <ClassSubjectPanel
                    staff={staffMember}
                    classesList={classesListState.data || []}
                    subjectsList={subjectsListState.data || []}
                    refetchAssignments={assignmentsState.refetch}
                  />
                )}

                {currentTab === 'personal-info' && (
                  <PersonalInfoPanel
                    staff={staffMember}
                    refetchStaff={staffListState.refetch}
                  />
                )}

                {currentTab === 'tasks' && (
                  <TasksPanel
                    staff={staffMember}
                    tasks={tasksState.data?.data || tasksState.data || []}
                    refetch={tasksState.refetch}
                  />
                )}

                {currentTab === 'attendance' && (
                  <AttendancePanel
                    staff={staffMember}
                  />
                )}

                {currentTab === 'leave' && (
                  <LeavePanel
                    staff={staffMember}
                    leaves={leavesState.data?.data || leavesState.data || []}
                    refetch={leavesState.refetch}
                  />
                )}

                {currentTab === 'performance' && (
                  <PerformancePanel
                    staff={staffMember}
                    performance={performanceState.data?.data || performanceState.data || []}
                    refetch={performanceState.refetch}
                  />
                )}

                {currentTab === 'resources' && (
                  <ResourcesPanel
                    staff={staffMember}
                    assignments={assignmentsState.data}
                    resources={resourcesState.data?.data || resourcesState.data || []}
                    refetch={resourcesState.refetch}
                  />
                )}

                {currentTab === 'documents' && (
                  <DocumentsPanel
                    staff={staffMember}
                    documents={documentsState.data?.data || documentsState.data || []}
                    refetch={documentsState.refetch}
                  />
                )}

                {currentTab === 'salary' && (
                  <SalaryPanel
                    staff={staffMember}
                    salary={salaryState.data?.data || salaryState.data || null}
                    refetch={salaryState.refetch}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
      <CommandPalette
        isOpen={cmdPaletteOpen}
        onClose={() => setCmdPaletteOpen(false)}
        staffList={staffListState.data || []}
      />
    </div>
  );
}

// Avatar initials custom sub-component
function AvatarInitials({ name }: { name: string }) {
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'A';
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#0891B2] text-white text-xs font-black flex items-center justify-center ring-2 ring-blue-100">
      {initials}
    </div>
  );
}

function useCountUp(target: any, duration = 900) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    const to = Number(target) || 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return Math.round(value);
}

function AnimatedValue({ value, suffix = '' }: { value: any; suffix?: string }) {
  const v = useCountUp(value);
  return <>{v}{suffix}</>;
}

// ==========================================
// SUB-TAB COMPONENTS IMPLEMENTATION PANELS
// ==========================================

// 1. Overview Panel
function OverviewPanel({ staff, assignments, tasks, workload, performance, leaves }: {
  staff: any; assignments: any; tasks: any[]; workload: any; performance: any[]; leaves: any[];
}) {
  const isTeacher = (staff.role || staff.designation || '').toLowerCase().includes('teacher');
  const assignedTasksCount = tasks.length;
  const pendingTasksCount = tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;

  const currentWorkload = Number(workload?.workload_percentage || 0);
  const score = performance && performance.length > 0 ? performance[0].score : 'N/A';
  const leavesCount = leaves && leaves.length > 0 ? leaves.filter(l => l.status === 'APPROVED').length : 0;
  const staffAssignmentsArr = assignments?.staff_assignments || [];
  const teacherClasses = assignments?.teacher_classes || [];
  const teacherSubjects = assignments?.teacher_subjects || [];
  const teacherMatrix = assignments?.teacher_matrix || [];
  const classAssignments = staffAssignmentsArr.filter((a: any) => (a.assignment_type || '').toUpperCase() === 'CLASS');
  const subjectAssignments = staffAssignmentsArr.filter((a: any) => (a.assignment_type || '').toUpperCase() === 'SUBJECT');
  const matrixClassNames = Array.from(new Set([
    ...teacherClasses.map((m: any) => m.classes?.name).filter(Boolean),
    ...teacherMatrix.map((m: any) => m.classes?.name || m.class_name).filter(Boolean),
  ])) as string[];
  const matrixSubjectNames = Array.from(new Set([
    ...teacherSubjects.map((m: any) => m.subjects?.name).filter(Boolean),
    ...teacherMatrix.flatMap((m: any) => (m.subjects ? [m.subjects.name || m.subjects] : [])).filter(Boolean),
  ])) as string[];
  const assignmentTotal = staffAssignmentsArr.length + teacherClasses.length + teacherSubjects.length + teacherMatrix.length;

  const workloadColor = currentWorkload > 80 ? '#EF4444' : currentWorkload > 50 ? '#F59E0B' : '#22C55E';
  const workloadStatus = currentWorkload > 120 ? 'Over capacity limit' : currentWorkload > 80 ? 'High assignment ratio' : 'Optimal load balance';

  return (
    <div className="space-y-6">
      {/* KPI Stat Tiles */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Tasks', value: assignedTasksCount, icon: ClipboardList,
            grad: 'from-[#2563EB] to-[#0891B2]', sub: isTeacher ? 'Assigned duties' : 'Assigned duties',
          },
          {
            label: 'Pending Tasks', value: pendingTasksCount, icon: Clock,
            grad: 'from-[#F59E0B] to-[#F97316]', sub: 'Awaiting completion',
          },
          {
            label: 'Performance Score', value: score === 'N/A' ? '—' : score, icon: TrendingUp,
            grad: 'from-[#10B981] to-[#22D3EE]', sub: score === 'N/A' ? 'No reviews yet' : 'Latest review',
          },
          {
            label: 'Approved Leaves', value: leavesCount, icon: CalendarDays,
            grad: 'from-[#0891B2] to-[#22D3EE]', sub: 'Days approved',
          },
        ].map((s, i) => (
          <div key={s.label} className="group p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all anim-fade-up" style={{ animationDelay: `${0.08 * i}s` }}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{s.label}</div>
                <div className="text-2xl font-black text-gray-900 mt-1 tabular-nums">
                  {typeof s.value === 'number' ? <AnimatedValue value={s.value} /> : s.value}
                </div>
                <div className="text-[10px] font-medium text-gray-400 mt-0.5 truncate">{s.sub}</div>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center text-white shadow-md shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <s.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional & Profile Details */}
          <Card className="overflow-hidden border-gray-100 shadow-sm bg-white anim-fade-up delay-1">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-blue-50/80 to-transparent">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#0891B2] flex items-center justify-center text-white shadow-sm">
                <User size={15} />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Professional & Profile Details</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-gray-400 block font-medium">Employee ID</span>
                  <span className="font-semibold text-gray-800 font-mono">{staff.staff_unique_id || 'EMP-10023'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 block font-medium">Role</span>
                  <span className="font-semibold text-gray-800 capitalize">{staff.role || 'Staff'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 block font-medium">Department</span>
                  <span className="font-semibold text-gray-800">{staff.department || 'Academics'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 block font-medium">Designation</span>
                  <span className="font-semibold text-gray-800">{staff.designation || 'Teacher'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 block font-medium">Reporting Manager</span>
                  <span className="font-semibold text-gray-800">{staff.reporting_manager || 'Academic Principal'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 block font-medium">Qualification</span>
                  <span className="font-semibold text-gray-800">{staff.qualification || 'Post Graduate (M.Sc, B.Ed)'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 block font-medium">Total Experience</span>
                  <span className="font-semibold text-gray-800">{staff.experience_years !== undefined ? `${staff.experience_years} Years` : '—'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 block font-medium">Employment Type</span>
                  <span className="font-semibold text-gray-800 capitalize">{staff.employment_type || '—'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Address and Contact details */}
          <Card className="overflow-hidden border-gray-100 shadow-sm bg-white anim-fade-up delay-3">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-sky-50/80 to-transparent">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0891B2] to-[#22D3EE] flex items-center justify-center text-white shadow-sm">
                <MapPin size={15} />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Address & Contact Information</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-gray-400 block font-medium">Residential Address</span>
                  <span className="font-semibold text-gray-800">{staff.address || '—'}, {staff.city || '—'}, {staff.state || '—'} &bull; {staff.postal_code || '—'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 block font-medium">Contact</span>
                  <span className="font-semibold text-gray-800">{staff.phone || '—'} {staff.email ? `· ${staff.email}` : ''}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Workforce Status Overview */}
          <Card className="overflow-hidden border-gray-100 shadow-sm bg-white anim-fade-up delay-2">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-indigo-50/80 to-transparent">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#2563EB] flex items-center justify-center text-white shadow-sm">
                <Award size={15} />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Workforce Status Overview</h3>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={workloadColor} strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${(Math.min(currentWorkload, 100) / 100) * 264} 264`} style={{ transition: 'stroke-dasharray 0.8s ease' }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-gray-800 tabular-nums">{currentWorkload}%</div>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-800">Current Workload</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{workloadStatus}</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5 text-xs">
                {[
                  { label: 'Total Tasks', value: `${assignedTasksCount} Assigned`, icon: ClipboardList, tint: 'bg-blue-50 text-blue-600' },
                  { label: 'Pending Tasks', value: `${pendingTasksCount} Pending`, icon: Clock, tint: 'bg-amber-50 text-amber-600' },
                  { label: 'Performance Score', value: score !== 'N/A' ? `${score}/100` : 'No reviews', icon: TrendingUp, tint: 'bg-emerald-50 text-emerald-600' },
                  { label: 'Approved Leave Days', value: `${leavesCount} Days`, icon: CalendarDays, tint: 'bg-cyan-50 text-cyan-600' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-500 font-medium">
                      <span className={`w-6 h-6 rounded-md ${row.tint} flex items-center justify-center`}><row.icon size={12} /></span>
                      {row.label}
                    </span>
                    <span className="font-bold text-gray-800 tabular-nums">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Role Badges & Security */}
          <Card className="overflow-hidden border-gray-100 shadow-sm bg-white anim-fade-up delay-3">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-teal-50/80 to-transparent">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0D9488] to-[#22D3EE] flex items-center justify-center text-white shadow-sm">
                <ShieldCheck size={15} />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Role Badges & Security</h3>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="info">School Access Allowed</Badge>
                <Badge variant="info">Digital Identity Valid</Badge>
                <Badge variant="success">Active Status</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// 3. TasksPanel
function TasksPanel({ staff, tasks, refetch }: { staff: any; tasks: any[]; refetch: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState('ADMINISTRATIVE');
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('PENDING');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Auto-overdue: PENDING/IN_PROGRESS tasks past their deadline display as OVERDUE
  const enriched = tasks.map((t: any) => {
    const st = (t.status || '').toUpperCase();
    const isPastDue = (st === 'PENDING' || st === 'IN_PROGRESS') && t.deadline && new Date(t.deadline).getTime() < Date.now();
    return { ...t, displayStatus: isPastDue ? 'OVERDUE' : st };
  });

  const counts: Record<string, number> = {
    ALL: enriched.length,
    PENDING: enriched.filter(t => t.displayStatus === 'PENDING').length,
    IN_PROGRESS: enriched.filter(t => t.displayStatus === 'IN_PROGRESS').length,
    REVIEW: enriched.filter(t => t.displayStatus === 'REVIEW').length,
    BLOCKED: enriched.filter(t => t.displayStatus === 'BLOCKED').length,
    COMPLETED: enriched.filter(t => t.displayStatus === 'COMPLETED').length,
    OVERDUE: enriched.filter(t => t.displayStatus === 'OVERDUE').length,
  };

  const statusMeta: Record<string, { accent: string }> = {
    COMPLETED: { accent: 'bg-emerald-500' },
    IN_PROGRESS: { accent: 'bg-blue-500' },
    REVIEW: { accent: 'bg-violet-500' },
    BLOCKED: { accent: 'bg-orange-500' },
    CANCELLED: { accent: 'bg-gray-400' },
    OVERDUE: { accent: 'bg-red-500' },
    PENDING: { accent: 'bg-sky-400' },
  };

  const filtered = statusFilter === 'ALL' ? enriched : enriched.filter(t => t.displayStatus === statusFilter);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTaskType('ADMINISTRATIVE');
    setPriority('MEDIUM');
    setStatus('PENDING');
    setStartDate('');
    setDeadline('');
    setLocation('');
    setEditingId(null);
  };

  const startEdit = (t: any) => {
    setEditingId(t.id);
    setTitle(t.title || '');
    setDescription(t.description || '');
    setTaskType(t.task_type || 'ADMINISTRATIVE');
    setPriority(t.priority || 'MEDIUM');
    setStatus(t.status || 'PENDING');
    setStartDate(t.start_date ? String(t.start_date).slice(0, 10) : '');
    setDeadline(t.deadline ? String(t.deadline).slice(0, 10) : '');
    setLocation(t.location || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Task Title is required');
      return;
    }
    const payload = {
      title,
      description,
      task_type: taskType,
      priority,
      status,
      start_date: startDate || null,
      deadline: deadline || null,
      location: location || null,
    };
    setSubmitting(true);
    try {
      const res = editingId
        ? await staffApi.updateTask(editingId, payload)
        : await staffApi.addTask(staff.id, payload);
      if (res.success) {
        toast.success(editingId ? 'Task updated successfully!' : 'Task assigned successfully!');
        resetForm();
        refetch();
      } else {
        toast.error(res.error || 'Failed to save task');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred while saving task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await staffApi.updateTask(taskId, { status: newStatus });
      if (res.success) {
        toast.success(`Task status updated to ${newStatus}`);
        refetch();
      } else {
        toast.error(res.error || 'Failed to update task status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await staffApi.deleteTask(taskId);
      if (res.success) {
        toast.success('Task deleted successfully');
        refetch();
      } else {
        toast.error(res.error || 'Failed to delete task');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting task');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        {/* Task stats + filter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
          {[
            { key: 'ALL', label: 'Total', icon: ClipboardList, active: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-200/70', idle: 'hover:border-blue-200 hover:bg-blue-50/60' },
            { key: 'PENDING', label: 'Pending', icon: Clock, active: 'bg-gradient-to-br from-slate-500 to-slate-700 text-white border-transparent shadow-lg shadow-slate-200/70', idle: 'hover:border-slate-200 hover:bg-slate-50/60' },
            { key: 'IN_PROGRESS', label: 'In Progress', icon: Loader2, active: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border-transparent shadow-lg shadow-amber-200/70', idle: 'hover:border-amber-200 hover:bg-amber-50/50' },
            { key: 'REVIEW', label: 'Review', icon: Eye, active: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white border-transparent shadow-lg shadow-violet-200/70', idle: 'hover:border-violet-200 hover:bg-violet-50/50' },
            { key: 'BLOCKED', label: 'Blocked', icon: AlertTriangle, active: 'bg-gradient-to-br from-orange-500 to-red-500 text-white border-transparent shadow-lg shadow-orange-200/70', idle: 'hover:border-orange-200 hover:bg-orange-50/50' },
            { key: 'COMPLETED', label: 'Completed', icon: CheckCircle2, active: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white border-transparent shadow-lg shadow-emerald-200/70', idle: 'hover:border-emerald-200 hover:bg-emerald-50/50' },
            { key: 'OVERDUE', label: 'Overdue', icon: AlertTriangle, active: 'bg-gradient-to-br from-red-500 to-rose-600 text-white border-transparent shadow-lg shadow-red-200/70', idle: 'hover:border-red-200 hover:bg-red-50/50' },
          ].map((s, i) => {
            const isActive = statusFilter === s.key;
            const StatusIcon = s.icon;
            return (
              <motion.button
                key={s.key}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.05 * i, type: 'spring', stiffness: 320, damping: 24 }}
                whileHover={{ y: -4, scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setStatusFilter(s.key)}
                className={`p-3 rounded-xl border text-center cursor-pointer transition-all duration-300 ${isActive ? s.active : `bg-white border-gray-100 shadow-sm hover:shadow-md ${s.idle}`}`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <StatusIcon size={14} className={`${isActive ? 'text-white/90' : 'text-gray-400'} transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="text-lg font-black tabular-nums leading-none">{counts[s.key]}</span>
                </div>
                <div className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-white/80' : 'opacity-60'}`}>{s.label}</div>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 26 }}
        >
          <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 anim-gradient" />

            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
                  <ClipboardList size={15} />
                </span>
                Workplace Task Queue
              </span>
              <Badge variant="info" className="font-bold text-[10px]">
                {filtered.length} Tasks
              </Badge>
            </h3>

            {filtered.length === 0 ? (
              <EmptyState message={tasks.length === 0 ? 'No tasks assigned to this staff member yet.' : 'No tasks match the selected status.'} />
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filtered.map((tsk: any) => {
                    const meta = statusMeta[tsk.displayStatus] || { accent: 'bg-gray-300' };
                    return (
                      <motion.div
                        key={tsk.id}
                        layout
                        initial={{ opacity: 0, y: 18, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -26, scale: 0.94 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        whileHover={{ y: -3, boxShadow: '0 14px 32px -10px rgba(37,99,235,0.16)' }}
                        className="group relative p-4 pl-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-blue-200/80 transition-colors duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden"
                      >
                        <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${meta.accent} transition-all duration-300 group-hover:top-1 group-hover:bottom-1`} />
                        <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-gradient-to-br from-blue-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="space-y-1 relative">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="relative flex h-2 w-2 shrink-0">
                              {tsk.displayStatus === 'IN_PROGRESS' && (
                                <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 anim-ping-slow" />
                              )}
                              <span className={`relative inline-flex rounded-full h-2 w-2 ring-2 ring-white ${meta.accent}`} />
                            </span>
                            <span className="font-bold text-xs text-gray-800 group-hover:text-blue-700 transition-colors">{tsk.title}</span>
                            {tsk.task_type && (
                              <Badge className="bg-cyan-50 text-cyan-700 text-[9px] font-extrabold border-none px-1.5 py-0.5 uppercase shadow-sm shadow-cyan-100">
                                {tsk.task_type}
                              </Badge>
                            )}
                            <Badge className={`${
                              tsk.priority === 'HIGH' ? 'bg-red-50 text-red-700' :
                              tsk.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700' :
                              'bg-blue-50 text-blue-700'
                            } text-[9px] font-extrabold border-none px-1.5 py-0.5 shadow-sm`}>
                              {tsk.priority}
                            </Badge>
                            <Badge className={`${
                              tsk.displayStatus === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                              tsk.displayStatus === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' :
                              tsk.displayStatus === 'REVIEW' ? 'bg-violet-50 text-violet-700' :
                              tsk.displayStatus === 'BLOCKED' ? 'bg-orange-50 text-orange-700' :
                              tsk.displayStatus === 'CANCELLED' ? 'bg-gray-200 text-gray-500' :
                              tsk.displayStatus === 'OVERDUE' ? 'bg-red-50 text-red-700' :
                              'bg-gray-100 text-gray-600'
                            } text-[9px] font-bold border-none`}>
                              {tsk.displayStatus}
                            </Badge>
                          </div>
                          {tsk.description && <p className="text-[10px] text-gray-500 font-medium">{tsk.description}</p>}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-mono">
                            {tsk.start_date && (
                              <span className="text-gray-500">
                                <CalendarDays size={10} className="inline mr-1 text-[#2563EB]" />Start: {new Date(tsk.start_date).toLocaleDateString()}
                              </span>
                            )}
                            <span className={`${tsk.displayStatus === 'OVERDUE' ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                              Due: {tsk.deadline ? new Date(tsk.deadline).toLocaleDateString() : 'No Deadline'}
                              {tsk.displayStatus === 'OVERDUE' ? ' — past due' : ''}
                            </span>
                            {tsk.location && (
                              <span className="text-gray-500">
                                <MapPin size={10} className="inline mr-1 text-[#0891B2]" />{tsk.location}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center bg-gray-50/80 rounded-xl p-1.5 border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50/40 transition-colors duration-300">
                          <motion.button
                            whileHover={{ scale: 1.12 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => startEdit(tsk)}
                            className="p-1.5 text-blue-600 hover:bg-white rounded-lg transition-colors shadow-sm hover:shadow"
                            title="Edit Task"
                          >
                            <Edit3 size={13} />
                          </motion.button>
                          <select
                            value={tsk.status}
                            onChange={e => handleUpdateStatus(tsk.id, e.target.value)}
                            className="bg-white text-gray-700 font-bold text-[10px] outline-none border border-gray-200 rounded-lg px-2 py-1 cursor-pointer transition-all focus:ring-2 focus:ring-blue-200/60"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="REVIEW">REVIEW</option>
                            <option value="BLOCKED">BLOCKED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                            <option value="OVERDUE">OVERDUE</option>
                          </select>

                          <motion.button
                            whileHover={{ scale: 1.12 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteTask(tsk.id)}
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-white rounded-lg transition-colors shadow-sm hover:shadow"
                            title="Delete Task"
                          >
                            <Trash2 size={13} />
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 250, damping: 26 }}
      >
        <Card className="p-5 border-gray-100 shadow-sm bg-white space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 anim-gradient" />

          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={editingId ? 'edit' : 'add'}
                initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2563EB] to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-200"
              >
                {editingId ? <Edit3 size={14} /> : <Plus size={14} />}
              </motion.span>
            </AnimatePresence>
            {editingId ? 'Edit Task' : 'Task Assigner'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="mb-1 block font-bold text-gray-600">Task Title</label>
              <input
                type="text"
                placeholder="e.g. Prepare Grade 10 Exam Schedule"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none transition-all duration-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-200/60 font-semibold text-gray-700"
                required
              />
            </div>

            <div>
              <label className="mb-1 block font-bold text-gray-600">Description</label>
              <textarea
                placeholder="Details about the task..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none transition-all duration-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-200/60 text-gray-700 h-20"
              />
            </div>

            <div>
              <label className="mb-1 block font-bold text-gray-600">Task Type</label>
              <select
                value={taskType}
                onChange={e => setTaskType(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none transition-all duration-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-200/60 font-bold text-gray-700"
              >
                <option value="ACADEMIC">ACADEMIC</option>
                <option value="EXAM">EXAM</option>
                <option value="ADMINISTRATIVE">ADMINISTRATIVE</option>
                <option value="EVENT">EVENT</option>
                <option value="SPORTS">SPORTS</option>
                <option value="TRANSPORT">TRANSPORT</option>
                <option value="SECURITY">SECURITY</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="MEETING">MEETING</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block font-bold text-gray-600">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white outline-none transition-all duration-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-200/60 font-bold text-gray-700"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="REVIEW">REVIEW</option>
                  <option value="BLOCKED">BLOCKED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold text-gray-600">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white outline-none transition-all duration-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-200/60 font-bold text-gray-700"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block font-bold text-gray-600">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white outline-none transition-all duration-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-200/60 font-medium text-gray-700"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-gray-600">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white outline-none transition-all duration-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-200/60 font-medium text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-bold text-gray-600">Location / Venue</label>
              <input
                type="text"
                placeholder="e.g. Main Auditorium, Lab 3, Bus #02"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none transition-all duration-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-200/60 font-medium text-gray-700"
              />
            </div>

            <div className="flex gap-2">
              <motion.button
                disabled={submitting}
                type="submit"
                whileHover={!submitting ? { scale: 1.02, y: -1 } : undefined}
                whileTap={!submitting ? { scale: 0.97 } : undefined}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:shadow-lg hover:shadow-blue-300/50 text-white font-extrabold tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-200 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} {editingId ? 'Update Task' : 'Assign Task'}
              </motion.button>
              {editingId && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </motion.button>
              )}
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

// 4. AttendancePanel
function AttendancePanel({ staff }: { staff: any }) {
  const [attHistory, setAttHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const initialMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const [month, setMonth] = useState(initialMonth);
  const staffId = staff?.id || staff?.employee_id || '';

  useEffect(() => {
    if (!staffId) { setLoading(false); setAttHistory([]); return; }
    setLoading(true);
    staffAttendanceApi.getForStaff(staffId, month).then((res: any) => {
      setAttHistory(Array.isArray(res) ? res : (res?.data || []));
    }).catch(() => setAttHistory([])).finally(() => setLoading(false));
  }, [staffId, month]);

  const recByDate = useMemo(() => {
    const map: Record<string, any> = {};
    attHistory.forEach((r: any) => { if (r.attendance_date) map[r.attendance_date] = r; });
    return map;
  }, [attHistory]);

  const presentDays = attHistory.filter((a: any) => (a.status || '').toLowerCase() === 'present').length;
  const lateDays = attHistory.filter((a: any) => (a.status || '').toLowerCase() === 'late').length;
  const absentDays = attHistory.filter((a: any) => (a.status || '').toLowerCase() === 'absent').length;
  const leaveDays = attHistory.filter((a: any) => { const s = (a.status || '').toLowerCase(); return s === 'leave' || s === 'on leave'; }).length;
  const totalMarked = attHistory.length;
  const rate = totalMarked > 0 ? Math.round(((presentDays + lateDays) / totalMarked) * 100) : 0;

  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const todayRec = recByDate[todayStr];

  const [curYear, curMon] = month.split('-').map(Number);
  const daysInMonth = new Date(curYear, curMon, 0).getDate();
  const firstWeekday = new Date(curYear, curMon - 1, 1).getDay();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const monthLabel = new Date(curYear, curMon - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const isCurrentMonth = month === initialMonth;

  const changeMonth = (dir: number) => {
    const d = new Date(curYear, curMon - 1 + dir, 1);
    setMonth(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  };

  const fmtDate = (s?: string) => {
    if (!s) return '—';
    const [y, m, d] = s.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const calcWorkingHours = (inTime?: string, outTime?: string) => {
    if (!inTime || !outTime) return null;
    const parse = (t: string) => {
      const m = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
      if (!m) return null;
      return { h: Number(m[1]), min: Number(m[2]) };
    };
    const a = parse(inTime);
    const b = parse(outTime);
    if (!a || !b) return null;
    let mins = (b.h * 60 + b.min) - (a.h * 60 + a.min);
    if (mins < 0) mins += 24 * 60;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const statusStyle = (s?: string) => {
    const v = (s || '').toLowerCase();
    if (v === 'present') return { dot: 'bg-emerald-500', soft: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Present' };
    if (v === 'late') return { dot: 'bg-amber-500', soft: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Late' };
    if (v === 'absent') return { dot: 'bg-red-500', soft: 'bg-red-50 text-red-700 border-red-200', label: 'Absent' };
    if (v === 'leave' || v === 'on leave') return { dot: 'bg-blue-500', soft: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Leave' };
    if (v === 'half day') return { dot: 'bg-violet-500', soft: 'bg-violet-50 text-violet-700 border-violet-200', label: 'Half Day' };
    if (v === 'work from home' || v === 'wfh') return { dot: 'bg-cyan-500', soft: 'bg-cyan-50 text-cyan-700 border-cyan-200', label: 'WFH' };
    if (v === 'holiday') return { dot: 'bg-gray-400', soft: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Holiday' };
    return { dot: 'bg-gray-300', soft: 'bg-gray-50 text-gray-500 border-gray-200', label: (s || 'Unmarked').replace(/_/g, ' ') };
  };

  const statCards = [
    { label: 'Present', value: presentDays, icon: CheckCircle2, grad: 'from-emerald-500 to-green-600', glow: 'shadow-emerald-200/60' },
    { label: 'Late', value: lateDays, icon: Clock, grad: 'from-amber-400 to-orange-500', glow: 'shadow-amber-200/60' },
    { label: 'Absent', value: absentDays, icon: XCircle, grad: 'from-red-500 to-rose-600', glow: 'shadow-red-200/60' },
    { label: 'Leave', value: leaveDays, icon: CalendarDays, grad: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-200/60' },
    { label: 'Attendance Rate', value: `${rate}%`, icon: TrendingUp, grad: 'from-violet-500 to-purple-600', glow: 'shadow-violet-200/60' },
  ];

  if (loading) return <Card className="p-5"><LoadingSkeleton rows={4} cols={4} /></Card>;

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.05 * i, type: 'spring', stiffness: 320, damping: 24 }}
              whileHover={{ y: -4, scale: 1.03 }}
              className={`p-4 rounded-2xl bg-gradient-to-br ${s.grad} text-white shadow-lg ${s.glow} relative overflow-hidden`}
            >
              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} className="text-white/90" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">{s.label}</span>
              </div>
              <div className="text-2xl font-black tabular-nums leading-none">{s.value}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar card */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 26 }}
        >
          <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-blue-500 to-violet-500 anim-gradient" />

            <div className="flex items-center justify-between border-b pb-3 mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
                  <CalendarDays size={15} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 leading-none">Monthly Attendance</h3>
                  <p className="text-[10px] text-gray-400 font-medium mt-1">Today: {todayRec ? statusStyle(todayRec.status).label : 'Not marked yet'} · {new Date(`${todayStr}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => changeMonth(-1)}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                >
                  <ChevronLeft size={14} />
                </motion.button>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={month}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="min-w-[130px] text-center text-xs font-extrabold text-gray-700"
                  >
                    {monthLabel}
                  </motion.span>
                </AnimatePresence>
                <motion.button
                  whileHover={isCurrentMonth ? undefined : { scale: 1.1 }}
                  whileTap={isCurrentMonth ? undefined : { scale: 0.9 }}
                  onClick={() => changeMonth(1)}
                  disabled={isCurrentMonth}
                  className={`p-2 rounded-lg border border-gray-200 transition-colors ${isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'}`}
                >
                  <ChevronRight size={14} />
                </motion.button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
              {['Present', 'Late', 'Absent', 'Leave', 'Half Day', 'WFH', 'Holiday'].map(l => {
                const st = statusStyle(l);
                return (
                  <span key={l} className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${st.dot}`} />{l}
                  </span>
                );
              })}
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[9px] font-extrabold uppercase tracking-wider text-gray-400">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={month}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-7 gap-1"
              >
                {cells.map((day, idx) => {
                  if (!day) return <div key={`b-${idx}`} />;
                  const dateStr = `${month}-${pad(day)}`;
                  const rec = recByDate[dateStr];
                  const st = statusStyle(rec?.status);
                  const isToday = dateStr === todayStr;
                  const weekend = new Date(curYear, curMon - 1, day).getDay() === 0 || new Date(curYear, curMon - 1, day).getDay() === 6;
                  return (
                    <motion.div
                      key={dateStr}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(idx * 0.012, 0.3), type: 'spring', stiffness: 300, damping: 22 }}
                      whileHover={{ scale: 1.12, y: -2 }}
                      title={`${fmtDate(dateStr)} — ${st.label}`}
                      className={`relative p-1.5 rounded-xl border text-center transition-all cursor-default ${isToday ? 'ring-2 ring-blue-400 border-blue-200 bg-blue-50/60' : rec ? `bg-white border-gray-100 hover:shadow-md` : `bg-gray-50/70 border-gray-100 ${weekend ? 'opacity-50' : ''}`}`}
                    >
                      <div className={`text-[11px] font-extrabold ${isToday ? 'text-blue-700' : rec ? 'text-gray-800' : 'text-gray-400'}`}>{day}</div>
                      <div className="mt-1 flex items-center justify-center">
                        {rec ? (
                          <span className={`inline-block w-2 h-2 rounded-full ${st.dot} shadow-sm`} />
                        ) : (
                          <span className="inline-block w-2 h-2 rounded-full bg-gray-200" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Today's snapshot */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 250, damping: 26 }}
        >
          <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-emerald-500 to-cyan-500 anim-gradient" />
            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-200">
                <Clock size={15} />
              </span>
              Today's Snapshot
            </h3>

            <div className="text-center py-2">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-extrabold text-xs ${todayRec ? statusStyle(todayRec.status).soft : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                {todayRec ? statusStyle(todayRec.status).label : 'Not marked yet'}
              </div>
              <p className="text-[10px] text-gray-400 font-medium mt-2">{new Date(`${todayStr}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>

            <div className="space-y-3 mt-3">
              {[
                { label: 'Check In', value: todayRec?.check_in || todayRec?.in_time || '—', icon: LogIn },
                { label: 'Check Out', value: todayRec?.check_out || todayRec?.out_time || '—', icon: LogOut },
                { label: 'Working Hours', value: calcWorkingHours(todayRec?.check_in, todayRec?.check_out) || (todayRec?.working_hours ? `${todayRec.working_hours} hrs` : '—'), icon: Clock },
              ].map((row, i) => {
                const Icon = row.icon;
                return (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-100"
                  >
                    <span className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                      <Icon size={13} className="text-[#2563EB]" />{row.label}
                    </span>
                    <span className="text-[11px] font-extrabold font-mono text-gray-800">{row.value}</span>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Records table */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 260, damping: 26 }}
      >
        <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 anim-gradient" />
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-200">
                <ClipboardList size={15} />
              </span>
              Daily Records — {monthLabel}
            </span>
            <Badge variant="info" className="font-bold text-[10px]">{attHistory.length} marked days</Badge>
          </h3>

          {attHistory.length === 0 ? (
            <EmptyState message="No attendance records for this month." />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-50 font-semibold uppercase text-gray-700 text-[10px]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Check In</th>
                    <th className="p-3">Check Out</th>
                    <th className="p-3">Working Hours</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {[...attHistory].reverse().map((row, idx) => {
                    const st = statusStyle(row.status);
                    return (
                      <motion.tr
                        key={row.id || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                        className="hover:bg-blue-50/40 transition-colors"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                            <span className="font-extrabold text-gray-800">{fmtDate(row.attendance_date)}</span>
                            <span className="text-[9px] text-gray-400 font-mono">{row.attendance_date}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-gray-600">{row.check_in || '—'}</td>
                        <td className="p-3 font-mono text-gray-600">{row.check_out || '—'}</td>
                        <td className="p-3 font-mono text-gray-600">{calcWorkingHours(row.check_in, row.check_out) || (row.working_hours ? `${row.working_hours} hrs` : '—')}</td>
                        <td className="p-3">
                          <Badge className={`border ${st.soft}`}>{st.label}</Badge>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

// 6. LeavePanel
function LeavePanel({ staff, leaves, refetch }: { staff: any; leaves: any[]; refetch: () => void }) {
  const [actioning, setActioning] = useState<string | null>(null);

  const handleReview = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setActioning(id);
    try {
      const res = await staffApi.updateLeaveStatus(id, newStatus);
      if (res.success) {
        toast.success(`Leave request ${newStatus.toLowerCase()} successfully!`);
        refetch();
      } else {
        toast.error(res.error || 'Action failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setActioning(null);
    }
  };

  const leaveCategory = (l: any) => {
    if (l.leave_category) return String(l.leave_category).toUpperCase() === 'UNPAID' ? 'UNPAID' : 'PAID';
    const t = (l.leave_type || '').toUpperCase();
    return ['UNPAID', 'SPECIAL'].includes(t) ? 'UNPAID' : 'PAID';
  };

  const daysBetween = (a?: string, b?: string) => {
    if (!a || !b) return 1;
    const s = new Date(a).getTime();
    const e = new Date(b).getTime();
    return Math.max(1, Math.round((e - s) / 86400000) + 1);
  };

  const fmtDay = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const pendingLeaves = (leaves || []).filter(l => l.status === 'PENDING');
  const approvedLeaves = (leaves || []).filter(l => l.status === 'APPROVED');
  const rejectedLeaves = (leaves || []).filter(l => l.status === 'REJECTED');
  const paidLeaves = approvedLeaves.filter(l => leaveCategory(l) === 'PAID');
  const unpaidLeaves = approvedLeaves.filter(l => leaveCategory(l) === 'UNPAID');
  const paidDays = paidLeaves.reduce((s, l) => s + daysBetween(l.start_date || l.from_date, l.end_date || l.to_date), 0);
  const unpaidDays = unpaidLeaves.reduce((s, l) => s + daysBetween(l.start_date || l.from_date, l.end_date || l.to_date), 0);

  const typeBadge = (t: string) => {
    const v = (t || '').toUpperCase();
    const map: Record<string, string> = {
      SICK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      CASUAL: 'bg-blue-50 text-blue-700 border-blue-200',
      ANNUAL: 'bg-violet-50 text-violet-700 border-violet-200',
      PERSONAL: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      MATERNITY: 'bg-pink-50 text-pink-700 border-pink-200',
      PATERNITY: 'bg-sky-50 text-sky-700 border-sky-200',
      BEREAVEMENT: 'bg-slate-100 text-slate-700 border-slate-200',
      UNPAID: 'bg-orange-50 text-orange-700 border-orange-200',
      OTHER: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return map[v] || map.OTHER;
  };

  const statusBadge = (s: string) =>
    s === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    s === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
    s === 'CANCELLED' ? 'bg-gray-100 text-gray-500 border-gray-200' :
    'bg-amber-50 text-amber-700 border-amber-200';

  const statCards = [
    { label: 'Approved', value: approvedLeaves.length, icon: CheckCircle2, grad: 'from-emerald-500 to-green-600', glow: 'shadow-emerald-200/60' },
    { label: 'Pending', value: pendingLeaves.length, icon: Clock, grad: 'from-amber-400 to-orange-500', glow: 'shadow-amber-200/60' },
    { label: 'Rejected', value: rejectedLeaves.length, icon: XCircle, grad: 'from-red-500 to-rose-600', glow: 'shadow-red-200/60' },
    { label: 'Paid Days', value: paidDays, icon: DollarSign, grad: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-200/60' },
    { label: 'Unpaid Days', value: unpaidDays, icon: Hourglass, grad: 'from-violet-500 to-purple-600', glow: 'shadow-violet-200/60' },
  ];

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.05 * i, type: 'spring', stiffness: 320, damping: 24 }}
              whileHover={{ y: -4, scale: 1.03 }}
              className={`p-4 rounded-2xl bg-gradient-to-br ${s.grad} text-white shadow-lg ${s.glow} relative overflow-hidden`}
            >
              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <Icon size={18} className="text-white/90" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">{s.label}</span>
              </div>
              <div className="text-2xl font-black tabular-nums leading-none">{s.value}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column: pending approvals + history */}
        <div className="lg:col-span-2 space-y-5">
          {/* Pending approval queue */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 26 }}
          >
            <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 anim-gradient" />
              <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-200">
                    <Clock size={15} />
                  </span>
                  Pending Approval Requests
                </span>
                <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                  {pendingLeaves.length} waiting
                </Badge>
              </h3>

              {pendingLeaves.length === 0 ? (
                <EmptyState message="No pending leave requests. All requests from staff have been reviewed." />
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {pendingLeaves.map((l, i) => (
                      <motion.div
                        key={l.id}
                        layout
                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -24, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                        whileHover={{ y: -2, boxShadow: '0 12px 28px -10px rgba(245,158,11,0.2)' }}
                        className="group relative p-4 pl-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-amber-200/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 overflow-hidden"
                      >
                        <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-amber-400 group-hover:top-1 group-hover:bottom-1 transition-all duration-300" />
                        <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="space-y-1.5 relative">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`border ${typeBadge(l.leave_type)} text-[9px] font-extrabold uppercase`}>{l.leave_type}</Badge>
                            <Badge className={`border text-[9px] font-extrabold ${leaveCategory(l) === 'PAID' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                              {leaveCategory(l) === 'PAID' ? 'PAID' : 'UNPAID'}
                            </Badge>
                            <span className="text-[10px] font-bold text-gray-400">{daysBetween(l.start_date || l.from_date, l.end_date || l.to_date)} day(s)</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500">
                            <span><CalendarDays size={10} className="inline mr-1 text-[#2563EB]" />{fmtDay(l.start_date || l.from_date)} → {fmtDay(l.end_date || l.to_date)}</span>
                          </div>
                          {l.reason && <p className="text-[10px] text-gray-500 font-medium">“{l.reason}”</p>}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center bg-gray-50/80 rounded-xl p-1.5 border border-gray-100 group-hover:border-amber-100 group-hover:bg-amber-50/40 transition-colors duration-300">
                          <motion.button
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={actioning !== null}
                            onClick={() => handleReview(l.id, 'APPROVED')}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-extrabold shadow-md shadow-emerald-200 hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center gap-1"
                          >
                            <CheckCircle2 size={11} /> Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={actioning !== null}
                            onClick={() => handleReview(l.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-extrabold shadow-md shadow-red-200 hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center gap-1"
                          >
                            <XCircle size={11} /> Reject
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Leave history */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 26 }}
          >
            <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 anim-gradient" />
              <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-200">
                    <FileText size={15} />
                  </span>
                  Leave Request History
                </span>
                <Badge variant="info" className="font-bold text-[10px]">{(leaves || []).length} requests</Badge>
              </h3>

              {!leaves || leaves.length === 0 ? (
                <EmptyState message="No leave requests found for this staff member." />
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-gray-50 font-semibold uppercase text-gray-700 text-[10px]">
                      <tr>
                        <th className="p-3">Leave Type</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">From Date</th>
                        <th className="p-3">To Date</th>
                        <th className="p-3">Days</th>
                        <th className="p-3">Reason</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {(leaves || []).map((row, idx) => (
                        <motion.tr
                          key={row.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                          className="hover:bg-blue-50/40 transition-colors"
                        >
                          <td className="p-3">
                            <Badge className={`border ${typeBadge(row.leave_type)} text-[9px] font-extrabold uppercase`}>{row.leave_type}</Badge>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full ${leaveCategory(row) === 'PAID' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                              {leaveCategory(row) === 'PAID' ? <DollarSign size={9} /> : <Hourglass size={9} />}
                              {leaveCategory(row) === 'PAID' ? 'Paid' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-gray-600">{fmtDay(row.start_date || row.from_date)}</td>
                          <td className="p-3 font-mono text-gray-600">{fmtDay(row.end_date || row.to_date)}</td>
                          <td className="p-3 font-extrabold text-gray-800 tabular-nums">{daysBetween(row.start_date || row.from_date, row.end_date || row.to_date)}</td>
                          <td className="p-3 max-w-[150px] truncate text-gray-500" title={row.reason}>{row.reason || '—'}</td>
                          <td className="p-3">
                            <Badge className={`border ${statusBadge(row.status)} text-[9px] font-extrabold`}>
                              {row.status}
                            </Badge>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Right column: paid / unpaid summary */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 250, damping: 26 }}
        >
          <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-emerald-500 to-cyan-500 anim-gradient" />
            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
                <DollarSign size={15} />
              </span>
              Paid vs Unpaid Leaves
            </h3>

            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5">
                    <DollarSign size={12} className="text-blue-600" /> Paid Leaves (Approved)
                  </span>
                  <span className="text-xs font-black text-blue-700 tabular-nums">{paidDays} day{paidDays !== 1 ? 's' : ''}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${paidDays + unpaidDays > 0 ? (paidDays / (paidDays + unpaidDays)) * 100 : 0}%` }}
                    transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5">
                    <Hourglass size={12} className="text-violet-600" /> Unpaid Leaves (Approved)
                  </span>
                  <span className="text-xs font-black text-violet-700 tabular-nums">{unpaidDays} day{unpaidDays !== 1 ? 's' : ''}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${paidDays + unpaidDays > 0 ? (unpaidDays / (paidDays + unpaidDays)) * 100 : 0}%` }}
                    transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-2">
                {[
                  { label: 'Total Approved', value: approvedLeaves.length, tint: 'text-emerald-700', bg: 'bg-emerald-50' },
                  { label: 'Total Days Taken', value: paidDays + unpaidDays, tint: 'text-gray-800', bg: 'bg-gray-50' },
                ].map((r, i) => (
                  <motion.div
                    key={r.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.08 }}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/80"
                  >
                    <span className="text-[10px] font-bold text-gray-500">{r.label}</span>
                    <span className={`text-sm font-black tabular-nums ${r.tint}`}>{r.value}</span>
                  </motion.div>
                ))}
              </div>

              <div className="rounded-xl p-3 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 text-[9px] font-medium text-gray-600 leading-relaxed">
                <strong className="text-blue-700">Paid leave</strong> is leave taken with full pay (e.g. sick, casual, annual).{' '}
                <strong className="text-violet-700">Unpaid leave</strong> is leave taken without pay. Admin can review and approve pending requests in the queue above.
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Performance KPI matrix definitions (role-specific metrics)
interface KpiDef { key: string; label: string; hint: string; }
interface KpiRow extends KpiDef { value: number; }
const KPI_MATRIX: Record<string, KpiDef[]> = {
  teacher: [
    { key: 'homeworkCompletion', label: 'Homework Completion', hint: 'Share of homework submitted on time' },
    { key: 'syllabusCoverage', label: 'Syllabus Coverage', hint: 'Curriculum progress vs schedule' },
    { key: 'classroomManagement', label: 'Classroom Management', hint: 'Discipline, engagement & control' },
    { key: 'parentCommunication', label: 'Parent Communication', hint: 'Responsiveness to parents & guardians' },
    { key: 'assessmentGrading', label: 'Assessments & Grading', hint: 'Timely, fair marking of work' },
  ],
  driver: [
    { key: 'routeCompliance', label: 'Route Compliance', hint: 'Adherence to assigned routes' },
    { key: 'pickupTiming', label: 'Pickup & Drop Timing', hint: 'Punctual pickups and drops' },
    { key: 'vehicleSafety', label: 'Vehicle Safety', hint: 'Safe driving & maintenance checks' },
    { key: 'studentCare', label: 'Student Care', hint: 'Supervision & behaviour on bus' },
    { key: 'dutyPunctuality', label: 'Duty Punctuality', hint: 'On-time reporting for duty' },
  ],
  accountant: [
    { key: 'feeCollection', label: 'Fee Collection', hint: 'Fee recovery & follow-ups' },
    { key: 'payrollAccuracy', label: 'Payroll Accuracy', hint: 'Error-free payroll processing' },
    { key: 'reconciliation', label: 'Reconciliation', hint: 'Bank & ledger alignment' },
    { key: 'auditReadiness', label: 'Audit Readiness', hint: 'Records ready for audit' },
    { key: 'dataDiscipline', label: 'Data Discipline', hint: 'Accurate, timely data entry' },
  ],
  default: [
    { key: 'shiftCompliance', label: 'Shift Compliance', hint: 'Adherence to duty shifts' },
    { key: 'incidentResponse', label: 'Incident Response', hint: 'Speed & quality of issue handling' },
    { key: 'taskCompletion', label: 'Task Completion', hint: 'Tasks finished on schedule' },
    { key: 'documentation', label: 'Documentation', hint: 'Records & reports maintained' },
    { key: 'teamwork', label: 'Teamwork & Collaboration', hint: 'Support of colleagues & culture' },
  ],
};
const buildKpiRows = (role: string): KpiRow[] =>
  (KPI_MATRIX[role] || KPI_MATRIX.default).map((d) => ({ ...d, value: 80 }));

// 7. PerformancePanel
function PerformancePanel({ staff, performance, refetch }: { staff: any; performance: any[]; refetch: () => void }) {
  const isTeacher = (staff.role || '').toLowerCase().includes('teacher') || (staff.designation || '').toLowerCase().includes('teacher');
  const isDriver = (staff.role || '').toLowerCase().includes('driver') || (staff.designation || '').toLowerCase().includes('driver') || (staff.role || '').toLowerCase().includes('bus driver');
  const isAccountant = (staff.role || '').toLowerCase().includes('accountant') || (staff.designation || '').toLowerCase().includes('accountant');

  const roleKey = isTeacher ? 'teacher' : isDriver ? 'driver' : isAccountant ? 'accountant' : 'default';
  const roleName = roleKey === 'teacher' ? 'Teacher' : roleKey === 'driver' ? 'Driver' : roleKey === 'accountant' ? 'Accountant' : 'Support / Admin';

  const [feedback, setFeedback] = useState('');
  const [period, setPeriod] = useState('MONTHLY');
  const [matrix, setMatrix] = useState<KpiRow[]>(() => buildKpiRows(roleKey));
  const [manualScore, setManualScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const autoScore = matrix.length > 0 ? Math.round(matrix.reduce((s, r) => s + r.value, 0) / matrix.length) : 90;
  const effectiveScore = manualScore ?? autoScore;

  const setKpiValue = (key: string, value: number) =>
    setMatrix(prev => prev.map(r => (r.key === key ? { ...r, value } : r)));
  const resetForm = () => {
    setMatrix(buildKpiRows(roleKey));
    setFeedback('');
    setPeriod('MONTHLY');
    setManualScore(null);
  };

  // Compute stats
  const stats = useMemo(() => {
    if (!performance || performance.length === 0) return null;
    const sorted = [...performance].sort(
      (a: any, b: any) => new Date(b.review_date || b.created_at).getTime() - new Date(a.review_date || a.created_at).getTime()
    );
    const sumScore = performance.reduce((sum, item) => sum + Number(item.score || 0), 0);
    const avgScore = sumScore / performance.length;
    let kpiSum = 0;
    let kpiCount = 0;
    performance.forEach((item: any) => {
      const metrics = item.kpi_metrics || {};
      Object.values(metrics).forEach((v: any) => {
        kpiSum += Number(v || 0);
        kpiCount++;
      });
    });
    const kpiAvg = kpiCount > 0 ? kpiSum / kpiCount : 0;
    return {
      avgScore,
      avgRating: avgScore / 10,
      kpiAvg,
      count: performance.length,
      latest: sorted[0] || null
    };
  }, [performance]);

  const perfStatus = (r: number) => (r >= 8.5 ? 'Excellent' : r >= 7 ? 'Good' : r >= 5 ? 'Average' : 'Needs Improvement');
  const statusTint = (r: number) => r >= 8.5 ? 'text-emerald-600' : r >= 7 ? 'text-blue-600' : r >= 5 ? 'text-amber-600' : 'text-rose-600';
  const perfFmtDay = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const ringRadius = 30;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringPct = stats ? Math.min(stats.avgScore, 100) : 0;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const kpiMetrics: Record<string, number> = {};
      matrix.forEach(r => {
        kpiMetrics[r.key] = Math.min(100, Math.max(0, r.value));
      });

      const res = await staffApi.addPerformance(staff.id, {
        score: effectiveScore,
        kpi_metrics: kpiMetrics,
        manager_feedback: feedback,
        review_period: period
      });

      if (res.success || res.data) {
        toast.success('Performance review saved successfully!');
        resetForm();
        refetch();
      } else {
        toast.error('Failed to log performance review');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error saving review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Overall score gauge + stat summary */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 anim-gradient" />
            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                  <Star size={15} />
                </span>
                Workplace Performance Index
              </span>
              <Badge variant="info" className="font-bold text-[10px]">
                {stats ? `${stats.count} review${stats.count !== 1 ? 's' : ''}` : 'No data'}
              </Badge>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Overall Rating', value: stats ? `${stats.avgRating.toFixed(1)} / 10` : 'N/A', icon: <TrendingUp size={14} />, grad: 'from-indigo-500 to-blue-600', shadow: 'shadow-indigo-200' },
                { label: 'KPI Target Status', value: stats ? `${stats.kpiAvg.toFixed(0)}% Met` : 'N/A', icon: <BarChart3 size={14} />, grad: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200' },
                { label: 'Reviews Logged', value: stats ? `${stats.count}` : 'N/A', icon: <Award size={14} />, grad: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-200' },
                { label: 'Latest Review', value: stats && stats.latest ? perfFmtDay(stats.latest.review_date || stats.latest.created_at) : '—', icon: <CalendarDays size={14} />, grad: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-200' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50/80 to-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className={`mb-2 inline-flex w-8 h-8 rounded-lg bg-gradient-to-br ${s.grad} text-white items-center justify-center shadow-md ${s.shadow}`}>{s.icon}</span>
                  <div className="text-2xl font-black text-gray-800 tabular-nums">{s.value}</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Score gauge */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 flex items-center gap-5">
                <div className="relative w-[84px] h-[84px] shrink-0">
                  <svg width="84" height="84" viewBox="0 0 72 72" className="rotate-0">
                    <defs>
                      <linearGradient id="perfRingGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#22D3EE" />
                      </linearGradient>
                    </defs>
                    <circle cx="36" cy="36" r={ringRadius} stroke="#E5E7EB" strokeWidth="8" fill="none" />
                    <motion.circle
                      cx="36"
                      cy="36"
                      r={ringRadius}
                      stroke="url(#perfRingGrad)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={ringCirc}
                      initial={{ strokeDashoffset: ringCirc }}
                      animate={{ strokeDashoffset: ringCirc - ringCirc * (ringPct / 100) }}
                      transition={{ delay: 0.35, duration: 1, ease: 'easeOut' }}
                      transform="rotate(-90 36 36)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-black text-gray-800 tabular-nums leading-none">{stats ? ringPct.toFixed(0) : '0'}%</div>
                      <div className="text-[8px] uppercase font-bold tracking-wide text-gray-400">Avg Score</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 min-w-0">
                  <div className={`text-sm font-black ${stats ? statusTint(stats.avgRating) : 'text-gray-300'}`}>
                    {stats ? perfStatus(stats.avgRating) : 'No data'}
                  </div>
                  <p className="text-[10px] font-medium text-gray-500 leading-relaxed">
                    {stats ? `Based on ${stats.count} logged review${stats.count !== 1 ? 's' : ''}.` : 'Log a review to begin scoring performance.'}
                  </p>
                </div>
              </div>

              {/* KPI summary bars (latest review) */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-white space-y-3">
                <div className="text-[10px] uppercase font-bold tracking-wider text-gray-500 flex items-center gap-1.5">
                  <BarChart3 size={12} className="text-blue-600" /> KPI Breakdown · Latest Review
                </div>
                {stats && stats.latest && Object.keys(stats.latest.kpi_metrics || {}).length > 0 ? (
                  Object.entries(stats.latest.kpi_metrics || {}).map(([k, v]: any, i: number) => (
                    <div key={k}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-gray-600 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-[10px] font-black text-blue-700 tabular-nums">{v}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(Number(v), 100)}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.7, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-400 font-medium">No KPI metrics recorded yet.</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Supervisor Performance Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 26 }}
        >
          <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 anim-gradient" />
            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-200">
                  <FileText size={15} />
                </span>
                Supervisor Performance Reviews
              </span>
              <Badge variant="info" className="font-bold text-[10px]">{(performance || []).length} logged</Badge>
            </h3>

            {!performance || performance.length === 0 ? (
              <EmptyState message="No performance reviews have been logged for this staff member yet." />
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {performance.map((item: any, idx: number) => {
                    const r = (Number(item.score || 0) / 10);
                    const kpis = Object.entries(item.kpi_metrics || {});
                    return (
                      <motion.div
                        key={item.id || idx}
                        layout
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                        className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50/70 to-white hover:shadow-md hover:-translate-y-0.5 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
                              <Award size={16} />
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs font-black text-gray-800">{item.review_period || 'Monthly'} Review</div>
                              <div className="text-[10px] font-mono text-gray-500">{perfFmtDay(item.review_date || item.created_at)}</div>
                            </div>
                          </div>
                          <Badge className={`border ${r >= 8.5 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : r >= 5 ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-rose-200 bg-rose-50 text-rose-700'} text-[10px] font-extrabold`}>
                            {r.toFixed(1)} / 10
                          </Badge>
                        </div>

                        {item.manager_feedback && (
                          <p className="text-[11px] text-gray-600 italic leading-relaxed border-l-2 border-gray-200 pl-3 mt-1">
                            "{item.manager_feedback}"
                          </p>
                        )}

                        {kpis.length > 0 && (
                          <div className="pt-3 mt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
                            {kpis.map(([k, v]: any) => (
                              <div key={k} className="flex items-center justify-between pl-1">
                                <span className="text-[10px] font-bold text-gray-500 capitalize truncate">{k.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="text-[10px] font-black text-[#2563EB] tabular-nums">{v}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 250, damping: 26 }}
      >
        <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 anim-gradient" />
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Sparkles size={15} />
            </span>
            Log New Review
          </h3>
          <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
            <div>
              <label className="mb-1.5 block font-bold text-gray-600">Review Period</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['MONTHLY', 'QUARTERLY', 'ANNUAL'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border transition-all ${
                      period === p
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-transparent shadow-md shadow-indigo-200'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-gray-600">Performance Matrix</label>
                <Badge variant="info" className="font-bold text-[9px]">{roleName} matrix</Badge>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 space-y-3.5">
                {matrix.map((r) => (
                  <div key={r.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-gray-700">{r.label}</span>
                      <span className="text-[10px] font-black text-blue-700 tabular-nums w-8 text-right">{r.value}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={r.value}
                      onChange={e => setKpiValue(r.key, Number(e.target.value))}
                      className="w-full accent-[#2563EB]"
                    />
                    <div className="text-[9px] text-gray-400 font-medium leading-tight">{r.hint}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-3 bg-gradient-to-br from-indigo-50 to-cyan-50 border border-indigo-100 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                  <TrendingUp size={14} />
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-gray-700">Computed Overall Score</div>
                  <div className="text-[9px] text-gray-500">{manualScore === null ? 'Auto-calculated from matrix' : 'Manually overridden'}</div>
                </div>
                <div className="ml-auto text-right shrink-0">
                  <span className="text-2xl font-black text-indigo-700 tabular-nums">{effectiveScore}</span>
                  <span className="text-[9px] text-gray-500"> / 100</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={effectiveScore}
                  onChange={e => setManualScore(Number(e.target.value))}
                  className="w-full accent-[#2563EB]"
                />
                {manualScore !== null && (
                  <button
                    type="button"
                    onClick={() => setManualScore(null)}
                    className="text-[9px] font-bold text-indigo-600 hover:underline whitespace-nowrap"
                  >
                    Auto
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block font-bold text-gray-600">Manager Feedback & Remarks</label>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Write specific performance comments..."
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#2563EB] text-gray-700 h-20 resize-none"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={submitting}
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 text-white font-extrabold tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-200 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Log Review
            </motion.button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

// 8. ResourcesPanel
function ResourcesPanel({ staff, assignments, resources, refetch }: { staff: any; assignments: any; resources: any[]; refetch: () => void }) {
  const [resourceType, setResourceType] = useState('DEVICE');
  const [resourceName, setResourceName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null);

  const TYPE_META: Record<string, { label: string; icon: any; grad: string; shadow: string }> = {
    DEVICE: { label: 'Device', icon: Layers, grad: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-200' },
    VEHICLE: { label: 'Vehicle', icon: Bus, grad: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-200' },
    CLASSROOM: { label: 'Classroom', icon: Building2, grad: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200' },
    LAB: { label: 'Laboratory', icon: BookOpen, grad: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-200' },
    EQUIPMENT: { label: 'Equipment', icon: Briefcase, grad: 'from-cyan-500 to-sky-600', shadow: 'shadow-cyan-200' },
    BUILDING: { label: 'Facility', icon: Building2, grad: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-200' },
  };

  const statusMeta = (s: string) => {
    if (s === 'ISSUED') return { label: 'Active', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock size={9} /> };
    if (s === 'RETURNED') return { label: 'Returned', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={9} /> };
    return { label: 'Damaged', cls: 'bg-rose-50 text-rose-700 border-rose-200', icon: <AlertTriangle size={9} /> };
  };

  const resFmtDay = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const issued = (resources || []).filter(r => r.status === 'ISSUED').length;
  const returned = (resources || []).filter(r => r.status === 'RETURNED').length;
  const damaged = (resources || []).filter(r => r.status !== 'ISSUED' && r.status !== 'RETURNED').length;

  const handleIssueResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceName.trim()) return;
    setSubmitting(true);
    try {
      const res = await staffApi.addResource(staff.id, {
        resource_type: resourceType,
        resource_name: resourceName,
        serial_number: serialNumber || null,
        notes: notes || null,
        status: 'ISSUED',
        issued_at: new Date().toISOString()
      });
      if (res.success || res.data) {
        toast.success(`${resourceName} checked out successfully!`);
        setResourceName('');
        setSerialNumber('');
        setNotes('');
        refetch();
      } else {
        toast.error('Failed to issue resource');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (resourceId: string, newStatus: string) => {
    setActioning(resourceId);
    try {
      const payload: any = { status: newStatus };
      if (newStatus === 'RETURNED') {
        payload.returned_at = new Date().toISOString();
      }
      const res = await staffApi.updateResource(resourceId, payload);
      if (res.success || res.data) {
        toast.success(`Resource marked as ${newStatus === 'RETURNED' ? 'Returned' : 'Damaged'}`);
        refetch();
      } else {
        toast.error('Failed to update status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Asset stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 anim-gradient" />
            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
                  <Layers size={15} />
                </span>
                Equipment & Asset Registry
              </span>
              <Badge variant="info" className="font-bold text-[10px]">{(resources || []).length} assets</Badge>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Assets', value: (resources || []).length, icon: <Layers size={14} />, grad: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-200' },
                { label: 'Active Issued', value: issued, icon: <Clock size={14} />, grad: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-200' },
                { label: 'Returned', value: returned, icon: <CheckCircle2 size={14} />, grad: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200' },
                { label: 'Damaged', value: damaged, icon: <AlertTriangle size={14} />, grad: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-200' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50/80 to-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className={`mb-2 inline-flex w-8 h-8 rounded-lg bg-gradient-to-br ${s.grad} text-white items-center justify-center shadow-md ${s.shadow}`}>{s.icon}</span>
                  <div className="text-2xl font-black text-gray-800 tabular-nums">{s.value}</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Assets grid */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 26 }}
        >
          <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 anim-gradient" />
            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-200">
                  <Briefcase size={15} />
                </span>
                Checked-out Equipment & Workspace Assets
              </span>
              <Badge variant="info" className="font-bold text-[10px]">{(resources || []).length} records</Badge>
            </h3>

            {!resources || resources.length === 0 ? (
              <EmptyState message="No physical assets check-out history for this staff member yet." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {resources.map((res: any, idx: number) => {
                    const meta = TYPE_META[res.resource_type] || TYPE_META.DEVICE;
                    const st = statusMeta(res.status);
                    return (
                      <motion.div
                        key={res.id || idx}
                        layout
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                        className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50/70 to-white hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.grad} text-white flex items-center justify-center shadow-md ${meta.shadow} shrink-0`}>
                                <meta.icon size={16} />
                              </span>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-gray-800 truncate">{res.resource_name}</h4>
                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">{meta.label}</span>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${st.cls}`}>
                              {st.icon} {st.label}
                            </span>
                          </div>

                          {res.serial_number && (
                            <p className="text-[10px] text-gray-500 font-medium">
                              <span className="font-bold">S/N:</span> {res.serial_number}
                            </p>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-medium pt-1">
                            <span className="flex items-center gap-1"><CalendarDays size={11} className="text-blue-500" /> Issued {resFmtDay(res.issued_at)}</span>
                            <span className="flex items-center gap-1"><CheckCircle2 size={11} className="text-emerald-500" /> {res.status === 'RETURNED' ? `Returned ${resFmtDay(res.returned_at)}` : res.status === 'ISSUED' ? 'In possession' : 'Awaiting repair'}</span>
                          </div>
                          {res.notes && (
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                              "{res.notes}"
                            </p>
                          )}
                        </div>

                        {res.status === 'ISSUED' && (
                          <div className="border-t mt-3 pt-2.5 flex gap-2 justify-end">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              disabled={actioning !== null}
                              onClick={() => handleUpdateStatus(res.id, 'RETURNED')}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-extrabold shadow-md shadow-emerald-200 hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center gap-1"
                            >
                              {actioning === res.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />} Return Asset
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              disabled={actioning !== null}
                              onClick={() => handleUpdateStatus(res.id, 'DAMAGED')}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-extrabold shadow-md shadow-red-200 hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center gap-1"
                            >
                              <AlertTriangle size={11} /> Report Damaged
                            </motion.button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Checkout form */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 250, damping: 26 }}
      >
        <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 anim-gradient" />
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
              <Key size={15} />
            </span>
            Checkout Asset
          </h3>
          <form onSubmit={handleIssueResource} className="space-y-4 text-xs">
            <div>
              <label className="mb-1.5 block font-bold text-gray-600">Resource Type</label>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(TYPE_META).map(([key, m]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setResourceType(key)}
                    className={`px-2 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wide border flex items-center gap-1.5 transition-all ${
                      resourceType === key
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-transparent shadow-md shadow-blue-200'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    <m.icon size={11} /> {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block font-bold text-gray-600">Resource Name</label>
              <input
                type="text"
                placeholder="e.g. MacBook Pro M3, Classroom 102"
                value={resourceName}
                onChange={e => setResourceName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none transition-all duration-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-200/60 font-medium text-gray-700"
                required
              />
            </div>

            <div>
              <label className="mb-1 block font-bold text-gray-600">Serial Number / Asset Tag</label>
              <input
                type="text"
                placeholder="e.g. ASSET-04492"
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none transition-all duration-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-200/60 font-medium text-gray-700"
              />
            </div>

            <div>
              <label className="mb-1 block font-bold text-gray-600">Notes / Condition description</label>
              <textarea
                placeholder="Condition at issue, expected return date, etc."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#2563EB] text-gray-700 h-16 resize-none"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={submitting}
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white font-extrabold tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-200 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <Key size={13} />} Checkout Asset
            </motion.button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

// 10. DocumentsPanel
function DocumentsPanel({ staff, documents, refetch }: { staff: any; documents: any[]; refetch: () => void }) {
  const [actioning, setActioning] = useState<string | null>(null);

  const DOC_META: Record<string, { label: string; icon: any; grad: string; shadow: string }> = {
    CONTRACT: { label: 'Contract', icon: FileText, grad: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-200' },
    CERTIFICATE: { label: 'Certificate', icon: GraduationCap, grad: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200' },
    ID_PROOF: { label: 'ID Proof', icon: ShieldCheck, grad: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-200' },
    TRAINING: { label: 'Training', icon: BookOpen, grad: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-200' },
    POLICY: { label: 'Policy', icon: FileSpreadsheet, grad: 'from-cyan-500 to-sky-600', shadow: 'shadow-cyan-200' },
    VERIFICATION: { label: 'Verification', icon: ShieldAlert, grad: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-200' },
  };

  const STATUS_META: Record<string, { label: string; cls: string; icon: any }> = {
    VERIFIED: { label: 'Verified', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={9} /> },
    PENDING: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock size={9} /> },
    REJECTED: { label: 'Rejected', cls: 'bg-rose-50 text-rose-700 border-rose-200', icon: <XCircle size={9} /> },
  };

  const docFmtDay = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const total = (documents || []).length;
  const verified = (documents || []).filter(d => d.status === 'VERIFIED').length;
  const pending = (documents || []).filter(d => d.status === 'PENDING').length;
  const rejected = (documents || []).filter(d => d.status === 'REJECTED').length;
  const verifiedPct = total > 0 ? Math.round((verified / total) * 100) : 0;

  const handleVerifyStatus = async (docId: string, status: 'VERIFIED' | 'REJECTED') => {
    setActioning(docId);
    try {
      const res = await staffApi.updateDocumentStatus(docId, status);
      if (res.success || res.data) {
        toast.success(`Document ${status === 'VERIFIED' ? 'verified' : 'marked as rejected'}`);
        refetch();
      } else {
        toast.error('Failed to update verification status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 anim-gradient" />
            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
                  <FileText size={15} />
                </span>
                Credentials & Document Registry
              </span>
              <Badge variant="info" className="font-bold text-[10px]">{total} documents</Badge>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Documents', value: total, icon: <FileText size={14} />, grad: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-200' },
                { label: 'Verified', value: verified, icon: <CheckCircle2 size={14} />, grad: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200' },
                { label: 'Pending Review', value: pending, icon: <Clock size={14} />, grad: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-200' },
                { label: 'Rejected', value: rejected, icon: <XCircle size={14} />, grad: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-200' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50/80 to-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className={`mb-2 inline-flex w-8 h-8 rounded-lg bg-gradient-to-br ${s.grad} text-white items-center justify-center shadow-md ${s.shadow}`}>{s.icon}</span>
                  <div className="text-2xl font-black text-gray-800 tabular-nums">{s.value}</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 26 }}
        >
          <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 anim-gradient" />
            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-200">
                  <GraduationCap size={15} />
                </span>
                Uploaded Documents
              </span>
              <Badge variant="info" className="font-bold text-[10px]">{pending} pending review</Badge>
            </h3>

            {!documents || documents.length === 0 ? (
              <EmptyState message="No credentials or verification files have been uploaded yet." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {documents.map((doc: any, idx: number) => {
                    const meta = DOC_META[doc.document_type] || DOC_META.CONTRACT;
                    const st = STATUS_META[doc.status] || STATUS_META.PENDING;
                    return (
                      <motion.div
                        key={doc.id || idx}
                        layout
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                        className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50/70 to-white hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.grad} text-white flex items-center justify-center shadow-md ${meta.shadow} shrink-0`}>
                                <meta.icon size={16} />
                              </span>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-gray-800 truncate">{doc.title}</h4>
                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">{meta.label}</span>
                              </div>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${st.cls}`}>
                              {st.icon} {st.label}
                            </span>
                          </div>

                          <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                            <Bell size={11} className="text-blue-500" /> {doc.folder || 'General'} &bull; Added {docFmtDay(doc.created_at)}
                          </p>
                          {doc.description && (
                            <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                              "{doc.description}"
                            </p>
                          )}
                        </div>

                        <div className="border-t mt-3 pt-2.5 flex items-center justify-between gap-2">
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#2563EB] hover:underline"
                          >
                            <Eye size={11} /> View File
                          </a>

                          {doc.status === 'PENDING' && (
                            <div className="flex gap-1.5">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={actioning !== null}
                                onClick={() => handleVerifyStatus(doc.id, 'VERIFIED')}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-extrabold shadow-md shadow-emerald-200 hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center gap-1"
                              >
                                {actioning === doc.id ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Verify
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={actioning !== null}
                                onClick={() => handleVerifyStatus(doc.id, 'REJECTED')}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-extrabold shadow-md shadow-red-200 hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center gap-1"
                              >
                                <XCircle size={11} /> Reject
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Verification summary */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 250, damping: 26 }}
      >
        <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden space-y-5">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 anim-gradient" />
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-emerald-200">
              <ShieldCheck size={15} />
            </span>
            Verification Summary
          </h3>

          <div className="text-center">
            <div className="text-3xl font-black text-gray-800 tabular-nums">{verifiedPct}%</div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Verification Rate</div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${verifiedPct}%` }}
                transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Verified', value: verified, tint: 'text-emerald-700', bg: 'bg-emerald-50', grad: 'from-emerald-500 to-teal-500' },
              { label: 'Pending', value: pending, tint: 'text-amber-700', bg: 'bg-amber-50', grad: 'from-amber-500 to-orange-500' },
              { label: 'Rejected', value: rejected, tint: 'text-rose-700', bg: 'bg-rose-50', grad: 'from-rose-500 to-pink-500' },
            ].map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.08 }}
                className="p-3 rounded-xl border border-gray-100 bg-white"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-gray-500">{r.label}</span>
                  <span className={`text-sm font-black tabular-nums ${r.tint}`}>{r.value}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${total > 0 ? (r.value / total) * 100 : 0}%` }}
                    transition={{ delay: 0.55 + i * 0.08, duration: 0.7, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${r.grad}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="rounded-xl p-3 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 text-[9px] font-medium text-gray-600 leading-relaxed">
            <strong className="text-blue-700">Verify</strong> approves a document after checking its authenticity.{' '}
            <strong className="text-rose-700">Reject</strong> flags a file that fails checks. Only pending documents can be reviewed.
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

// ==========================================
// NEW TAB: Class & Subject Assignment Panel
// ==========================================
function ClassSubjectPanel({ staff, classesList, subjectsList, refetchAssignments }: {
  staff: any; classesList: any[]; subjectsList: any[]; refetchAssignments: () => void;
}) {
  const orgIdVal = typeof window !== 'undefined' ? (() => { try { return auth.getOrganisationId() || ''; } catch { return ''; } })() : '';
  const teacherId = staff.teacher_id || staff.id;

  const [showForm, setShowForm] = useState(false);
  const [mappings, setMappings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Multi-select state
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(new Set());
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<Set<string>>(new Set());
  const [selectedSectionIds, setSelectedSectionIds] = useState<Set<string>>(new Set());
  const [sectionsList, setSectionsList] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch current mappings from class_subject_teacher_map
  const fetchMappings = useCallback(async () => {
    if (!teacherId || !orgIdVal) return;
    setLoading(true);
    try {
      const res = await apiClient.get<any>(`/management/staff/${teacherId}/assignments`);
      const allAssignments = res?.data?.teacher_matrix || [];
      setMappings(allAssignments);
    } catch { setMappings([]); }
    setLoading(false);
  }, [teacherId, orgIdVal]);

  // Fetch sections on mount
  useEffect(() => {
    if (!orgIdVal) return;
    apiClient.get<any>(`/management/sections/${orgIdVal}`).then(d => {
      setSectionsList(d?.data || d || []);
    }).catch(() => {});
  }, [orgIdVal]);

  useEffect(() => { fetchMappings(); }, [fetchMappings]);

  // Filter sections by selected class
  const availableSections = useMemo(() => {
    if (selectedClassIds.size === 0) return [];
    const classIds = Array.from(selectedClassIds);
    return sectionsList.filter(s => classIds.includes(s.class_id));
  }, [selectedClassIds, sectionsList]);

  const toggleClass = (id: string) => {
    setSelectedClassIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setSelectedSectionIds(new Set());
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSection = (id: string) => {
    setSelectedSectionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleAssign = async () => {
    if (selectedClassIds.size === 0 || selectedSubjectIds.size === 0) {
      toast.error('Please select at least one class and one subject');
      return;
    }
    setSaving(true);
    try {
      const classIds = Array.from(selectedClassIds);
      const subjectIds = Array.from(selectedSubjectIds);
      const sectionIds = selectedSectionIds.size > 0 ? Array.from(selectedSectionIds) : [];
      const res = await staffApi.assignClass(teacherId, { class_ids: classIds, subject_ids: subjectIds, section_ids: sectionIds });
      if (res?.success !== false) {
        toast.success(`Assigned ${classIds.length} class(es) × ${subjectIds.length} subject(s) successfully`);
        setSelectedClassIds(new Set());
        setSelectedSubjectIds(new Set());
        setSelectedSectionIds(new Set());
        setShowForm(false);
        fetchMappings();
        refetchAssignments();
      } else {
        toast.error(res?.error || 'Assignment failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error assigning classes/subjects');
    }
    setSaving(false);
  };

  const handleRemoveAssignment = async (mappingId: string) => {
    if (!confirm('Remove this assignment?')) return;
    try {
      await apiClient.delete<any>(`/management/staff/assignments/class_subject/${mappingId}`);
      toast.success('Assignment removed');
      fetchMappings();
      refetchAssignments();
    } catch { toast.error('Failed to remove assignment'); }
  };

  // Group mappings by class
  const groupedMappings = useMemo(() => {
    const groups: Record<string, { class: any; subjects: any[]; sections: Set<string> }> = {};
    mappings.forEach((m: any) => {
      const cId = m.class_id || m.classes?.id;
      if (!groups[cId]) {
        groups[cId] = { class: m.classes || { id: cId, name: m.class_name || 'Unknown' }, subjects: [], sections: new Set() };
      }
      if (m.subjects) groups[cId].subjects.push(m.subjects);
      if (m.sections?.name) groups[cId].sections.add(m.sections.name);
    });
    return Object.entries(groups);
  }, [mappings]);

  return (
    <div className="space-y-6">
      {/* Current Assignments */}
      <Card className="p-5 border-gray-100 shadow-sm bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <BookOpen size={16} className="text-[#2563EB]" /> Current Class & Subject Assignments
            <Badge variant="info" className="font-bold text-[10px]">{mappings.length}</Badge>
          </h3>
          <button onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition-colors">
            <Plus size={13} /> {showForm ? 'Cancel' : 'Assign New'}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
        ) : groupedMappings.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400 font-medium">
            <BookOpen size={32} className="mx-auto mb-2 text-gray-300" />
            No class/subject assignments yet. Click "Assign New" to add.
          </div>
        ) : (
          <div className="space-y-3">
            {groupedMappings.map(([classId, group]) => (
              <div key={classId} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-extrabold text-gray-700">
                    <GraduationCap size={13} className="inline mr-1 text-[#2563EB]" />
                    {group.class?.name || 'Class'} {group.sections.size > 0 && `(${[...group.sections].join(', ')})`}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-semibold">{group.subjects.length} subjects</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.subjects.map((sub: any, idx: number) => (
                    <Badge key={idx} className="bg-blue-50 text-blue-700 border-none text-[10px] font-semibold">{sub.name || sub}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Assign Form */}
      {showForm && (
        <Card className="p-5 border-gray-100 shadow-sm bg-white">
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
            <Plus size={16} className="text-[#2563EB]" /> New Assignment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Classes */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-2 block">Select Classes</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto border rounded-xl p-2">
                {classesList.map((cls: any) => (
                  <label key={cls.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-xs">
                    <input type="checkbox" checked={selectedClassIds.has(cls.id)} onChange={() => toggleClass(cls.id)}
                      className="rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB] w-3.5 h-3.5" />
                    {cls.name} {cls.section || ''}
                  </label>
                ))}
                {classesList.length === 0 && <p className="text-xs text-gray-400 px-2">No classes available</p>}
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-2 block">Select Subjects</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto border rounded-xl p-2">
                {subjectsList.map((sub: any) => (
                  <label key={sub.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-xs">
                    <input type="checkbox" checked={selectedSubjectIds.has(sub.id)} onChange={() => toggleSubject(sub.id)}
                      className="rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB] w-3.5 h-3.5" />
                    {sub.name}
                  </label>
                ))}
                {subjectsList.length === 0 && <p className="text-xs text-gray-400 px-2">No subjects available</p>}
              </div>
            </div>

            {/* Sections */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-2 block">Sections (optional)</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto border rounded-xl p-2">
                {availableSections.length === 0 ? (
                  <p className="text-xs text-gray-400 px-2">Select a class to see sections</p>
                ) : (
                  availableSections.map((sec: any) => (
                    <label key={sec.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-xs">
                      <input type="checkbox" checked={selectedSectionIds.has(sec.id)} onChange={() => toggleSection(sec.id)}
                        className="rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB] w-3.5 h-3.5" />
                      {sec.name}
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-[10px] text-gray-400">
              {selectedClassIds.size} class(es), {selectedSubjectIds.size} subject(s), {selectedSectionIds.size} section(s) selected
            </p>
            <button onClick={handleAssign} disabled={saving || selectedClassIds.size === 0 || selectedSubjectIds.size === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save Assignments
            </button>
          </div>
        </Card>
      )}

      {/* Mappings list with remove */}
      {mappings.length > 0 && (
        <Card className="p-5 border-gray-100 shadow-sm bg-white">
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">All Mappings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-[10px] font-bold text-gray-400 uppercase">Class</th>
                  <th className="pb-2 text-[10px] font-bold text-gray-400 uppercase">Subject</th>
                  <th className="pb-2 text-[10px] font-bold text-gray-400 uppercase">Section</th>
                  <th className="pb-2 text-[10px] font-bold text-gray-400 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((m: any) => (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2 text-xs font-semibold">{m.classes?.name || m.class_name || '—'}</td>
                    <td className="py-2 text-xs">{m.subjects?.name || m.subject_name || '—'}</td>
                    <td className="py-2 text-xs">{m.sections?.name || m.section_name || '—'}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => handleRemoveAssignment(m.id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ==========================================
// NEW TAB: Personal Information Panel
// ==========================================
function PersonalInfoPanel({ staff, refetchStaff }: { staff: any; refetchStaff: () => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: staff.full_name || '',
    email: staff.email || '',
    phone: staff.phone || '',
    date_of_birth: staff.date_of_birth || '',
    gender: staff.gender || '',
    address: staff.address || '',
    city: staff.city || '',
    state: staff.state || '',
    country: staff.country || '',
    postal_code: staff.postal_code || '',
  });

  useEffect(() => {
    setForm({
      full_name: staff.full_name || '',
      email: staff.email || '',
      phone: staff.phone || '',
      date_of_birth: staff.date_of_birth || '',
      gender: staff.gender || '',
      address: staff.address || '',
      city: staff.city || '',
      state: staff.state || '',
      country: staff.country || '',
      postal_code: staff.postal_code || '',
    });
  }, [staff]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await staffApi.update(staff.id, form);
      if (res?.success !== false) {
        toast.success('Personal information updated');
        setEditing(false);
        refetchStaff();
      } else toast.error(res?.error || 'Update failed');
    } catch (err: any) { toast.error(err.message); }
    setSaving(false);
  };

  return (
    <Card className="p-5 border-gray-100 shadow-sm bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <User size={16} className="text-[#2563EB]" /> Personal Information
        </h3>
        <button onClick={() => editing ? handleSave() : setEditing(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition-colors">
          {editing ? (saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />) : <Edit3 size={13} />}
          {editing ? 'Save Changes' : 'Edit'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Full Name', key: 'full_name', type: 'text' },
          { label: 'Email', key: 'email', type: 'email' },
          { label: 'Phone', key: 'phone', type: 'text' },
          { label: 'Date of Birth', key: 'date_of_birth', type: 'date' },
          { label: 'Gender', key: 'gender', type: 'select', options: ['Male', 'Female', 'Other'] },
          { label: 'Address', key: 'address', type: 'text' },
          { label: 'City', key: 'city', type: 'text' },
          { label: 'State', key: 'state', type: 'text' },
          { label: 'Country', key: 'country', type: 'text' },
          { label: 'Postal Code', key: 'postal_code', type: 'text' },
        ].map(field => (
          <div key={field.key} className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">{field.label}</label>
            {editing ? (
              field.type === 'select' ? (
                <select value={form[field.key as keyof typeof form]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20">
                  <option value="">Select</option>
                  {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={field.type} value={form[field.key as keyof typeof form]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20" />
              )
            ) : (
              <p className="text-xs font-semibold text-gray-800">{form[field.key as keyof typeof form] || '—'}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function SalaryPanel({ staff, salary, refetch }: { staff: any; salary: any; refetch: () => void }) {
  const payroll = salary?.payroll || null;
  const payslips: any[] = salary?.payslips || [];

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ base_salary: '', allowances: '', deductions: '', pay_frequency: 'MONTHLY' });

  const [month, setMonth] = useState(() => new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase());
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [psLoading, setPsLoading] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('BANK');
  const [compItems, setCompItems] = useState<{ label: string; amount: string }[]>([]);

  // Locked to the current month/year (payslips only allowed for the current month).
  useEffect(() => {
    setMonth(new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase());
    setYear(new Date().getFullYear());
  }, []);

  const num = (n: any) => Number(n || 0);
  const money = (n: any) => '₹' + num(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  const payComponents: { label: string; amount: number }[] = Array.isArray(payroll?.components) ? payroll.components : [];
  const componentsSum = payComponents.reduce((s, c) => s + num(c.amount), 0);
  const base = payroll?.base_salary ?? staff.salary ?? 0;
  const allowances = payroll?.allowances ?? 0;
  const deductions = payroll?.deductions ?? 0;
  const grossTotal = num(base) + num(allowances) + componentsSum;
  const dedTotal = num(deductions);
  const net = payroll?.net_salary ?? (grossTotal - dedTotal);

  const totalPaid = payslips.filter(p => p.status === 'PAID').reduce((s, p) => s + num(p.net_pay), 0);
  const pendingCount = payslips.filter(p => p.status === 'PENDING').length;
  const alreadyGenerated = payslips.some(p => p.month === month && p.year === year);

  const PAYSLIP_STATUS: Record<string, { label: string; cls: string; icon: any }> = {
    PENDING: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock size={9} /> },
    PAID: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={9} /> },
    CANCELLED: { label: 'Cancelled', cls: 'bg-rose-50 text-rose-700 border-rose-200', icon: <XCircle size={9} /> },
  };

  const PAY_META: Record<string, { label: string; cls: string; icon: any }> = {
    BANK: { label: 'Bank', cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Landmark size={9} /> },
    CASH: { label: 'Cash', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <Banknote size={9} /> },
  };

  const FREQ = ['MONTHLY', 'BIWEEKLY', 'WEEKLY', 'YEARLY'];

  const addComp = () => setCompItems(prev => [...prev, { label: '', amount: '' }]);
  const updateComp = (i: number, field: 'label' | 'amount', value: string) =>
    setCompItems(prev => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
  const removeComp = (i: number) => setCompItems(prev => prev.filter((_, idx) => idx !== i));

  const openEditor = () => {
    setForm({
      base_salary: String(base ?? ''),
      allowances: String(allowances || '0'),
      deductions: String(deductions || '0'),
      pay_frequency: payroll?.pay_frequency || 'MONTHLY',
    });
    setCompItems(payComponents.map(c => ({ label: c.label, amount: String(c.amount) })));
    setEditing(true);
  };

  const handleSaveStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await staffApi.updateSalary(staff.id, {
        base_salary: parseFloat(form.base_salary || '0'),
        allowances: parseFloat(form.allowances || '0'),
        deductions: parseFloat(form.deductions || '0'),
        pay_frequency: form.pay_frequency,
        components: compItems
          .filter(c => c.label.trim() !== '' || parseFloat(c.amount || '0') > 0)
          .map(c => ({ label: c.label.trim() || 'Component', amount: parseFloat(c.amount || '0') || 0 })),
      });
      if (res.success || res.data) {
        toast.success('Salary structure updated successfully!');
        setEditing(false);
        refetch();
      } else {
        toast.error('Failed to update salary structure');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error saving salary structure');
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePayslip = async (e: React.FormEvent) => {
    e.preventDefault();
    setPsLoading(true);
    try {
      const res = await staffApi.createPayslip(staff.id, {
        month,
        year,
        gross_pay: grossTotal,
        deductions: dedTotal,
        status: 'PENDING',
        payment_method: paymentMethod,
      });
      if (res.success || res.data) {
        toast.success(`Payslip generated for ${month} ${year}`);
        refetch();
      } else {
        toast.error('Failed to generate payslip');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error generating payslip');
    } finally {
      setPsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'PAID' | 'CANCELLED') => {
    setActioning(id);
    try {
      const res = await staffApi.updatePayslipStatus(id, status);
      if (res.success || res.data) {
        toast.success(`Payslip marked as ${status.toLowerCase()}`);
        refetch();
      } else {
        toast.error('Failed to update payslip status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 anim-gradient" />
            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
                  <DollarSign size={15} />
                </span>
                Compensation Overview
              </span>
              <Badge variant="info" className="font-bold text-[10px]">{payroll ? payroll.pay_frequency : 'Not configured'}</Badge>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Base Salary', value: money(base), icon: <DollarSign size={14} />, grad: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-200' },
                { label: 'Allowances', value: money(allowances), icon: <Plus size={14} />, grad: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200' },
                { label: 'Deductions', value: money(deductions), icon: <Minus size={14} />, grad: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-200' },
                { label: 'Net Take-Home', value: money(net), icon: <CheckCircle2 size={14} />, grad: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-200' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-b from-gray-50/80 to-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <span className={`mb-2 inline-flex w-8 h-8 rounded-lg bg-gradient-to-br ${s.grad} text-white items-center justify-center shadow-md ${s.shadow}`}>{s.icon}</span>
                  <div className="text-xl font-black text-gray-800 tabular-nums">{s.value}</div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mt-0.5">{s.label}</div>
                </motion.div>
              ))}
            </div>

            {payComponents.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                    <Component size={11} /> Additional Components
                  </div>
                  <span className="text-[10px] font-black text-cyan-700 tabular-nums">{money(componentsSum)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {payComponents.map((c, i) => (
                    <motion.div
                      key={`${c.label}-${i}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyan-100 bg-cyan-50/60"
                    >
                      <span className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-sky-600 text-white flex items-center justify-center shadow-sm shadow-cyan-200">
                        <Plus size={11} />
                      </span>
                      <span className="text-xs font-bold text-gray-700">{c.label}</span>
                      <span className="text-xs font-black text-cyan-700 tabular-nums">{money(c.amount)}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 26 }}
        >
          <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 anim-gradient" />
            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                  <Edit3 size={15} />
                </span>
                Salary Structure
              </span>
              <button
                onClick={() => (editing ? setEditing(false) : openEditor())}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:shadow-md hover:shadow-indigo-200/60 active:scale-95 transition-all"
              >
                {editing ? <X size={12} /> : <Edit3 size={12} />}
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </h3>

            {!editing ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {[
                    { label: 'Base Salary', value: money(base) },
                    { label: 'Allowances', value: money(allowances) },
                    { label: 'Deductions', value: money(deductions) },
                    { label: 'Net Salary', value: money(net) },
                  ].map(f => (
                    <div key={f.label} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">{f.label}</div>
                      <div className="text-lg font-black text-gray-800 tabular-nums">{f.value}</div>
                    </div>
                  ))}
                </div>
                {payComponents.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {payComponents.map((c, i) => (
                      <span key={`${c.label}-${i}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-cyan-100 bg-cyan-50/60 text-[11px] font-bold text-gray-700">
                        <Component size={10} className="text-cyan-600" />{c.label}: <span className="text-cyan-700 tabular-nums">{money(c.amount)}</span>
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={handleSaveStructure} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'base_salary', label: 'Base Salary', type: 'number' },
                  { key: 'allowances', label: 'Allowances', type: 'number' },
                  { key: 'deductions', label: 'Deductions', type: 'number' },
                ].map(field => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">{field.label}</label>
                    <input
                      type={field.type}
                      value={(form as any)[field.key]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                    />
                  </div>
                ))}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Pay Frequency</label>
                  <select
                    value={form.pay_frequency}
                    onChange={e => setForm({ ...form, pay_frequency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  >
                    {FREQ.map(fr => <option key={fr} value={fr}>{fr}</option>)}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                    <Component size={11} /> Additional Components <span className="font-normal normal-case text-gray-300">(HRA, Bonus, Travel, etc.)</span>
                  </label>
                  <div className="mt-1.5 space-y-2">
                    {compItems.length === 0 && (
                      <p className="text-[11px] text-gray-400 font-semibold">No additional components yet.</p>
                    )}
                    {compItems.map((c, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={c.label}
                          onChange={e => updateComp(i, 'label', e.target.value)}
                          placeholder="Component name (e.g. HRA)"
                          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                        />
                        <input
                          type="number"
                          value={c.amount}
                          onChange={e => updateComp(i, 'amount', e.target.value)}
                          placeholder="Amount"
                          className="w-32 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                        />
                        <button
                          type="button"
                          onClick={() => removeComp(i)}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 active:scale-95 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addComp}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-gradient-to-r from-cyan-500 to-sky-600 text-white hover:shadow-md hover:shadow-cyan-200/60 active:scale-95 transition-all"
                  >
                    <Plus size={12} /> Add Component
                  </button>
                </div>

                <div className="md:col-span-2 flex items-end justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:shadow-md hover:shadow-indigo-200/60 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    {saving ? 'Saving…' : 'Save Structure'}
                  </button>
                </div>
              </form>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 26 }}
        >
          <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500 anim-gradient" />
            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-600 text-white flex items-center justify-center shadow-md shadow-cyan-200">
                  <CalendarDays size={15} />
                </span>
                Payroll History
              </span>
              <Badge variant="info" className="font-bold text-[10px]">{payslips.length} record{payslips.length !== 1 ? 's' : ''}</Badge>
            </h3>

            {!payslips || payslips.length === 0 ? (
              <EmptyState message="No payslips generated yet. Use the generator panel to create one." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <th className="py-2 pr-3 font-bold">Period</th>
                      <th className="py-2 pr-3 font-bold">Gross</th>
                      <th className="py-2 pr-3 font-bold">Deductions</th>
                      <th className="py-2 pr-3 font-bold">Net</th>
                      <th className="py-2 pr-3 font-bold">Payment</th>
                      <th className="py-2 pr-3 font-bold">Status</th>
                      <th className="py-2 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {payslips.map((p: any, idx: number) => {
                        const st = PAYSLIP_STATUS[p.status] || PAYSLIP_STATUS.PENDING;
                        return (
                          <motion.tr
                            key={p.id || idx}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="py-3 pr-3 font-bold text-gray-800">{p.month} {p.year}</td>
                            <td className="py-3 pr-3 text-gray-600 tabular-nums">{money(p.gross_pay)}</td>
                            <td className="py-3 pr-3 text-gray-600 tabular-nums">{money(p.deductions)}</td>
                            <td className="py-3 pr-3 font-bold text-gray-800 tabular-nums">{money(p.net_pay)}</td>
                            <td className="py-3 pr-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${(PAY_META[p.payment_method] || PAY_META.BANK).cls}`}>
                                {(PAY_META[p.payment_method] || PAY_META.BANK).icon}
                                {(PAY_META[p.payment_method] || PAY_META.BANK).label}
                              </span>
                            </td>
                            <td className="py-3 pr-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${st.cls}`}>{st.icon}{st.label}</span>
                            </td>
                            <td className="py-3 text-right">
                              {actioning === p.id ? (
                                <Loader2 size={13} className="animate-spin text-gray-400" />
                              ) : p.status === 'PENDING' ? (
                                <button
                                  onClick={() => handleUpdateStatus(p.id, 'PAID')}
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-md hover:shadow-emerald-200/60 active:scale-95 transition-all"
                                >
                                  Mark Paid
                                </button>
                              ) : p.status === 'PAID' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1" title="Paid payslips cannot be cancelled">
                                  <Lock size={10} /> Locked
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-gray-400">—</span>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 26 }}
        >
          <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 anim-gradient" />
            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-200">
                  <BarChart3 size={15} />
                </span>
                Summary
              </span>
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Total Paid', value: money(totalPaid), tint: 'text-emerald-700', bg: 'bg-emerald-50' },
                { label: 'Pending Payslips', value: pendingCount, tint: 'text-amber-700', bg: 'bg-amber-50' },
                { label: 'Records on File', value: payslips.length, tint: 'text-gray-800', bg: 'bg-gray-50' },
              ].map(f => (
                <div key={f.label} className={`flex items-center justify-between rounded-xl px-4 py-3 ${f.bg}`}>
                  <span className="text-xs font-bold text-gray-500">{f.label}</span>
                  <span className={`text-lg font-black tabular-nums ${f.tint}`}>{f.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 26 }}
        >
          <Card className="p-5 border-gray-100 shadow-sm bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 anim-gradient" />
            <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-200">
                  <BadgeCheck size={15} />
                </span>
                Generate Payslip
              </span>
            </h3>
            <form onSubmit={handleGeneratePayslip} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Month</label>
                  <div className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-700">{month}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Year</label>
                  <div className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-700">{year}</div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Gross Pay</label>
                <div className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-700 tabular-nums">{money(grossTotal)}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Deductions</label>
                <div className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-700 tabular-nums">{money(dedTotal)}</div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'BANK', label: 'Bank', icon: <Landmark size={13} /> },
                    { key: 'CASH', label: 'Cash', icon: <Banknote size={13} /> },
                  ].map(m => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setPaymentMethod(m.key)}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${paymentMethod === m.key ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent shadow-md shadow-blue-200/60' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-200'}`}
                    >
                      {m.icon}
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              {alreadyGenerated && (
                <p className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  A payslip has already been generated for {month} {year}.
                </p>
              )}
              <button
                type="submit"
                disabled={psLoading || alreadyGenerated}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-md hover:shadow-blue-200/60 active:scale-95 transition-all disabled:opacity-50"
              >
                {!alreadyGenerated && psLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                {alreadyGenerated ? 'Already Generated' : psLoading ? 'Generating…' : 'Generate Payslip'}
              </button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
