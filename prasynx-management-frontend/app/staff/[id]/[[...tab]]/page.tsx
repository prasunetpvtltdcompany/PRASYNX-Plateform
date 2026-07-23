'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import apiClient from '@/app/lib/apiClient';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '@/app/lib/useApi';
import { staffApi, classApi, subjectApi, rolesApiV2, staffAttendanceApi } from '@/app/lib/dataService';
import CommandPalette from '@/components/CommandPalette';
import { createClient } from '@/app/lib/supabase';
import {
  LayoutDashboard, User, Layers, Shield, TrendingUp, Calendar, FileText,
  Key, LogOut, Search, Sparkles, Bell, Moon, Sun, ChevronLeft, ArrowLeft,
  Plus, Trash2, Mail, Phone, MapPin, Award, CheckCircle2, XCircle, Clock,
  Briefcase, DollarSign, BookOpen, AlertTriangle, Users, ClipboardList, ShieldAlert,
  Loader2, RefreshCw, Bus, Building2, Heart, ShieldCheck, HelpCircle, Check, FileSpreadsheet, Lock,
  BarChart3, GraduationCap, Book, Star, CalendarDays, Edit3, Save, X, Filter, ChevronDown, ChevronUp
} from 'lucide-react';

// UUID regex validation
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const getOrgId = () => {
  if (typeof window === 'undefined') return '';
  try {
    const s = JSON.parse(localStorage.getItem('managementSession') || '{}');
    return s?.organisation?.id && UUID_RE.test(s.organisation.id) ? s.organisation.id : '';
  } catch { return ''; }
};

// Sidebar Nav Groups — Staff Portal
const navGroups = [
  { label: 'User Management', items: [
    { key: 'students', label: 'Student Management', icon: Award },
    { key: 'parents', label: 'Parent Management', icon: User },
  ]},
];

export default function StaffDetailPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;
  const activeTabArray = params.tab as string[] | undefined;
  const currentTab = activeTabArray?.[0] || 'overview';

  // State managers
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [previewRole, setPreviewRole] = useState<string | null>(null);
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
      const s = JSON.parse(localStorage.getItem('managementSession') || '{}');
      setSessionUser(s?.user || null);
    } catch {}
  }, []);

  // API fetches
  const staffListState = useApi(() => staffApi.getAll(), []);
  const assignmentsState = useApi(() => staffApi.getAssignments(staffId), [staffId]);
  const classesListState = useApi(() => classApi.getAll(), []);
  const subjectsListState = useApi(() => subjectApi.getAll(), []);
  const tasksState = useApi(() => staffApi.getTasks(staffId), [staffId]);
  const schedulesState = useApi(() => staffApi.getSchedules(staffId), [staffId]);
  const resourcesState = useApi(() => staffApi.getResources(staffId), [staffId]);
  const leavesState = useApi(() => staffApi.getLeaves(staffId), [staffId]);
  const documentsState = useApi(() => staffApi.getDocuments(staffId), [staffId]);
  const messagesState = useApi(() => staffApi.getMessages(staffId), [staffId]);
  const performanceState = useApi(() => staffApi.getPerformance(staffId), [staffId]);
  const activitiesState = useApi(() => staffApi.getActivities(staffId), [staffId]);
  const workloadState = useApi(() => staffApi.getWorkload(staffId), [staffId]);

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
        activitiesState.refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_leave_requests' }, () => {
        leavesState.refetch();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_messages' }, () => {
        messagesState.refetch();
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_activity_logs' }, () => {
        activitiesState.refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [staffId]);

  // Resolve staff member from the staff list
  const staffMember = useMemo(() => {
    return (staffListState.data || []).find((s: any) => s.id === staffId);
  }, [staffListState.data, staffId]);

  // Handle password reset
  const handleResetPassword = async () => {
    if (!staffMember) return;
    const confirmReset = window.confirm(`Are you sure you want to reset password for ${staffMember.full_name}?`);
    if (!confirmReset) return;

    try {
      const res = await apiClient.post<any>(`/management/staff/${staffMember.id}/reset-password`, { organisation_id: getOrgId() });
      if (res.success || res.data) {
        toast.success(`Credentials regenerated successfully! New temporary password: ${res.data?.temporaryPassword || 'prasunet123'}`);
      } else {
        toast.error('Failed to reset password');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred during password reset');
    }
  };

  if (staffListState.loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#6D4CFF]" />
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
          <button onClick={() => router.push('/?tab=staff')} className="px-4 py-2 bg-[#6D4CFF] text-white rounded-lg text-xs font-semibold hover:bg-[#5b3ee0]">
            Back to Staff Management
          </button>
        </Card>
      </div>
    );
  }

  const role = (staffMember.designation || staffMember.role || 'staff').toLowerCase();
  
  // Custom navigation trigger helper
  const handleNav = (tabKey: string) => {
    router.push(`/staff/${staffId}/${tabKey}`);
  };

  const userInitials = sessionUser?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'A';

  return (
    <div className="app-layout">
      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar aside */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">P</div>
          <div>
            <div className="sidebar-logo-text">Prasunet ERP</div>
            <div className="sidebar-logo-badge">School Operating System</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navGroups.map(group => (
            <div key={group.label}>
              <div className="sidebar-section-label">{group.label}</div>
              {group.items.map(item => (
                <button
                  key={item.key}
                  onClick={() => router.push(`/?tab=${item.key}`)}
                  className={`sidebar-item ${item.key === 'staff' ? 'active' : ''}`}
                >
                  <item.icon size={18} className="sidebar-item-icon" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-footer-item" onClick={() => router.push('/')}><LogOut size={14} /><span>Back to Hub</span></button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="main-content">
        <header className="header">
          <div className="header-left flex items-center gap-2 w-full max-w-md">
            <button className="header-mobile-btn" onClick={() => setSidebarOpen(true)}><LayoutDashboard size={19} /></button>
            <button onClick={() => router.push('/?tab=staff')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-150 text-xs text-gray-500 font-semibold transition-colors flex-shrink-0">
              <ArrowLeft size={14} /> Back to List
            </button>
            <div className="hidden lg:flex search-bar cursor-pointer ml-4 w-full" onClick={() => setCmdPaletteOpen(true)}>
              <Search size={16} />
              <input type="text" placeholder="Search shortcuts, staff, classes (CMD+K)..." readOnly className="cursor-pointer" />
            </div>
          </div>
          <div className="header-right">
            <button className="header-btn" onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button>
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
        <div className="page space-y-6">
          
          {/* Glassmorphic Profile Header Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#6D4CFF] via-[#7C3AED] to-[#8B5CF6] text-white p-6 shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black border border-white/20 shadow-inner">
                  {staffMember.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="text-center md:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <h1 className="text-xl font-extrabold tracking-tight">{staffMember.full_name}</h1>
                    <Badge variant="purple" className="bg-white/10 hover:bg-white/25 border-white/20 text-white text-[10px] uppercase font-bold capitalize">
                      {role}
                    </Badge>
                  </div>
                  <p className="text-xs text-white/80 flex items-center gap-1.5 justify-center md:justify-start font-medium">
                    <Briefcase size={12} /> {staffMember.department || 'General'} Department &bull; {staffMember.designation || 'Staff'}
                  </p>
                  <p className="text-[11px] text-white/70 font-mono">
                    ID: {staffMember.staff_unique_id || staffMember.teacher_code || 'EMP—'}
                  </p>
                </div>
              </div>

              {/* Quick Actions Header Area */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-xs">
                  <span className="text-[10px] uppercase font-extrabold text-white/70">View As Staff:</span>
                  <select
                    value={previewRole || ''}
                    onChange={e => setPreviewRole(e.target.value || null)}
                    className="bg-transparent text-white font-bold text-xs outline-none border-none cursor-pointer [&>option]:text-gray-800"
                  >
                    <option value="">Default Profile</option>
                    <option value="teacher">Teacher Workspace</option>
                    <option value="principal">Principal Workspace</option>
                    <option value="accountant">Accountant Workspace</option>
                    <option value="librarian">Librarian Workspace</option>
                    <option value="driver">Driver Workspace</option>
                    <option value="security">Security Workspace</option>
                    <option value="housekeeping">Housekeeping Workspace</option>
                    <option value="nurse">Nurse Workspace</option>
                    <option value="coach">Sports Coach Workspace</option>
                  </select>
                </div>
                <button onClick={handleResetPassword} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 text-xs font-semibold transition-colors">
                  <Key size={13} /> Reset Password
                </button>
                <Link href={`/staff/${staffId}/dashboard`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-purple-750 font-bold hover:shadow-lg hover:bg-purple-50 text-xs transition-colors">
                  <LayoutDashboard size={13} /> View Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Sub-Tabbed Navigation Control Bar */}
          <div className="flex overflow-x-auto gap-1.5 pb-2 border-b border-gray-100 no-scrollbar">
            {[
              { key: 'overview', label: 'Overview', icon: User },
              { key: 'class-subject', label: 'Class & Subject', icon: BookOpen },
              { key: 'personal-info', label: 'Personal Info', icon: User },
              { key: 'qualifications', label: 'Qualifications', icon: Award },
              { key: 'work-center', label: 'Work Center', icon: Briefcase },
              { key: 'tasks', label: 'Tasks', icon: CheckCircle2 },
              { key: 'schedule', label: 'Schedule', icon: Calendar },
              { key: 'attendance', label: 'Attendance', icon: Clock },
              { key: 'leave', label: 'Leave', icon: FileSpreadsheet },
              { key: 'performance', label: 'Performance', icon: TrendingUp },
              { key: 'resources', label: 'Resources', icon: Layers },
              { key: 'permissions', label: 'Permissions', icon: Shield },
              { key: 'documents', label: 'Documents', icon: FileText },
              { key: 'communication', label: 'Communication', icon: Mail },
              { key: 'activity-log', label: 'Activity Log', icon: ClipboardList },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(tab => {
              const isActive = currentTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleNav(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${isActive ? 'bg-[#6D4CFF] text-white shadow-md shadow-[#6D4CFF]/20' : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-100 hover:border-gray-200'}`}
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

                {currentTab === 'qualifications' && (
                  <QualificationsPanel staff={staffMember} />
                )}

                {currentTab === 'work-center' && (
                  <WorkCenterPanel
                    staff={staffMember}
                    assignments={assignmentsState.data}
                    classesList={classesListState.data || []}
                    subjectsList={subjectsListState.data || []}
                    refetch={assignmentsState.refetch}
                  />
                )}

                {currentTab === 'tasks' && (
                  <TasksPanel
                    staff={staffMember}
                    tasks={tasksState.data?.data || tasksState.data || []}
                    refetch={tasksState.refetch}
                  />
                )}

                {currentTab === 'schedule' && (
                  <SchedulePanel
                    staff={staffMember}
                    schedules={schedulesState.data?.data || schedulesState.data || []}
                    refetch={schedulesState.refetch}
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

                {currentTab === 'permissions' && (
                  <PermissionsPanel
                    staff={staffMember}
                    assignments={assignmentsState.data}
                    refetchAssignments={assignmentsState.refetch}
                  />
                )}

                {currentTab === 'documents' && (
                  <DocumentsPanel
                    staff={staffMember}
                    documents={documentsState.data?.data || documentsState.data || []}
                    refetch={documentsState.refetch}
                  />
                )}

                {currentTab === 'communication' && (
                  <CommunicationPanel
                    staff={staffMember}
                    messages={messagesState.data?.data || messagesState.data || []}
                    refetch={messagesState.refetch}
                  />
                )}

                {currentTab === 'activity-log' && (
                  <ActivityLogPanel
                    staff={staffMember}
                    assignments={assignmentsState.data}
                    activities={activitiesState.data?.data || activitiesState.data || []}
                  />
                )}

                {currentTab === 'analytics' && (
                  <AnalyticsPanel
                    staff={staffMember}
                    assignments={assignmentsState.data}
                    tasks={tasksState.data?.data || tasksState.data || []}
                    workload={workloadState.data?.data || workloadState.data || {}}
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
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-black flex items-center justify-center ring-2 ring-purple-100">
      {initials}
    </div>
  );
}

// ==========================================
// SUB-TAB COMPONENTS IMPLEMENTATION PANELS
// ==========================================

// 1. Overview Panel
function OverviewPanel({ staff, assignments, tasks, workload, performance, leaves }: {
  staff: any; assignments: any; tasks: any[]; workload: any; performance: any[]; leaves: any[];
}) {
  const activeWorkCount = assignments?.staff_assignments?.length || 0;
  const pendingTasksCount = tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;

  const currentWorkload = workload?.workload_percentage ?? 0;
  const score = performance && performance.length > 0 ? performance[0].score : 'N/A';
  const leavesCount = leaves && leaves.length > 0 ? leaves.filter(l => l.status === 'APPROVED').length : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Info Columns */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-5 border-gray-100 shadow-sm bg-white">
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
            <User size={16} className="text-[#6D4CFF]" /> Professional & Profile Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-gray-400 block font-medium">Employee ID</span>
              <span className="font-semibold text-gray-800 font-mono">{staff.staff_unique_id || staff.teacher_code || 'EMP-10023'}</span>
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
              <span className="text-gray-400 block font-medium">Salary</span>
              <span className="font-semibold text-gray-800">{staff.salary ? `₹${Number(staff.salary).toLocaleString()}` : '—'}</span>
            </div>
          </div>
        </Card>

        {/* Address and Contact details */}
        <Card className="p-5 border-gray-100 shadow-sm bg-white">
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-[#6D4CFF]" /> Address & Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-gray-400 block font-medium">Residential Address</span>
              <span className="font-semibold text-gray-800">{staff.address || '—'}, {staff.city || '—'}, {staff.state || '—'} &bull; {staff.postal_code || '—'}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column: Workload summary widget */}
      <div className="space-y-6">
        <Card className="p-5 border-gray-100 bg-gray-50/50 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Award size={16} className="text-[#6D4CFF]" /> Workforce Status Overview
          </h3>
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-gray-500 font-medium">Work Assignments</span>
              <span className="font-bold text-gray-800">{activeWorkCount} Assigned</span>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-gray-500 font-medium">Pending Tasks</span>
              <span className="font-bold text-red-500">{pendingTasksCount} Pending</span>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-gray-500 font-medium">Current Workload</span>
              <span className="font-bold text-blue-600">{currentWorkload}%</span>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-gray-500 font-medium">Performance Score</span>
              <span className="font-bold text-green-600">{score !== 'N/A' ? `${score}/100` : 'No reviews'}</span>
            </div>
            <div className="flex justify-between pb-0.5">
              <span className="text-gray-500 font-medium">Approved Leave Days</span>
              <span className="font-bold text-amber-600">{leavesCount} Days</span>
            </div>
          </div>
        </Card>

        {/* Quick badging visualization */}
        <Card className="p-5 border-gray-100 shadow-sm bg-white">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Role Badges & Security</h3>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="purple">School Access Allowed</Badge>
            <Badge variant="info">Digital Identity Valid</Badge>
            <Badge variant="success">Active Status</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Role Templates for Workforce Assignment Center
const ROLE_TEMPLATES: Record<string, {
  categories: { key: string; label: string; type: 'select' | 'multi' | 'text'; options?: string[] }[];
  responsibilities: string[];
}> = {
  teacher: {
    categories: [
      { key: 'CLASS', label: 'Assigned Classes', type: 'multi', options: [] },
      { key: 'SUBJECT', label: 'Assigned Subjects', type: 'multi', options: [] },
    ],
    responsibilities: ['Class Teacher Duties', 'Exam Coordinator', 'PTM Coordinator', 'Activity Coordinator', 'Subject Head']
  },
  librarian: {
    categories: [
      { key: 'LIBRARY', label: 'Assigned Libraries', type: 'multi', options: ['Main Library', 'Primary School Library'] },
      { key: 'BOOK_CATEGORY', label: 'Book Categories Scope', type: 'multi', options: ['Academics', 'Fiction', 'Reference'] }
    ],
    responsibilities: ['Book Issue', 'Book Return', 'Inventory Management', 'Stock Verification']
  },
  'bus driver': {
    categories: [
      { key: 'VEHICLE', label: 'Assigned Vehicle', type: 'select', options: ['BUS-01', 'BUS-02', 'VAN-01'] },
      { key: 'ROUTE', label: 'Assigned Route', type: 'select', options: ['Route A', 'Route B', 'Route C'] },
      { key: 'STUDENTS_COUNT', label: 'Capacity / Assigned Students', type: 'text' }
    ],
    responsibilities: ['Morning Pickup Drive', 'Evening Drop Drive', 'Vehicle Safety Inspection', 'Fuel Logs Management']
  },
  driver: {
    categories: [
      { key: 'VEHICLE', label: 'Assigned Vehicle', type: 'select', options: ['BUS-01', 'BUS-02', 'VAN-01'] },
      { key: 'ROUTE', label: 'Assigned Route', type: 'select', options: ['Route A', 'Route B', 'Route C'] },
      { key: 'STUDENTS_COUNT', label: 'Capacity / Assigned Students', type: 'text' }
    ],
    responsibilities: ['Morning Pickup Drive', 'Evening Drop Drive', 'Vehicle Safety Inspection', 'Fuel Logs Management']
  },
  'security guard': {
    categories: [
      { key: 'BUILDING', label: 'Assigned Building', type: 'multi', options: ['Main Campus', 'Sports Complex', 'Hostel'] },
      { key: 'GATE', label: 'Assigned Gate', type: 'multi', options: ['Gate 1', 'Gate 2', 'Gate 3'] },
      { key: 'SHIFT', label: 'Shift Rotation', type: 'select', options: ['Morning', 'Afternoon', 'Night'] }
    ],
    responsibilities: ['Visitor Verification', 'Gate Monitoring', 'Patrolling Campus Grounds', 'Incident Log Checking']
  },
  security: {
    categories: [
      { key: 'BUILDING', label: 'Assigned Building', type: 'multi', options: ['Main Campus', 'Sports Complex', 'Hostel'] },
      { key: 'GATE', label: 'Assigned Gate', type: 'multi', options: ['Gate 1', 'Gate 2', 'Gate 3'] },
      { key: 'SHIFT', label: 'Shift Rotation', type: 'select', options: ['Morning', 'Afternoon', 'Night'] }
    ],
    responsibilities: ['Visitor Verification', 'Gate Monitoring', 'Patrolling Campus Grounds', 'Incident Log Checking']
  },
  nurse: {
    categories: [
      { key: 'MEDICAL_ROOM', label: 'Assigned Medical Room', type: 'select', options: ['Clinic Room 102', 'Hostel Post'] },
      { key: 'HEALTH_PROGRAM', label: 'Health Campaigns', type: 'multi', options: ['Eye Screening', 'Vaccination Drive'] }
    ],
    responsibilities: ['Medical Visits Log', 'Emergency Handling', 'Medicine Tracking', 'Health Record Auditing']
  },
  housekeeping: {
    categories: [
      { key: 'BUILDING', label: 'Assigned Building', type: 'multi', options: ['Main Campus', 'Hostel'] },
      { key: 'FLOOR', label: 'Assigned Floor', type: 'select', options: ['Ground', 'First', 'Second'] },
      { key: 'ZONE', label: 'Cleaning Zone', type: 'select', options: ['Corridors', 'Labs', 'Lounge'] }
    ],
    responsibilities: ['Cleaning Tasks Execution', 'Maintenance Checks Reporting', 'Trash Disposal Logistics', 'Sanitation Logs Refills']
  }
};

const fallbackTemplate = {
  categories: [
    { key: 'DEPARTMENT', label: 'Assigned Department', type: 'multi' as const, options: ['Academics', 'Administration', 'Finance', 'Library', 'Transport', 'Security', 'Housekeeping', 'Medical', 'IT Support'] },
    { key: 'RESOURCE', label: 'Assigned Resource', type: 'text' as const }
  ],
  responsibilities: ['General Duties', 'Special Project Coordination', 'Interim Supervisor']
};

// 2. Work Center Panel
function WorkCenterPanel({ staff, assignments, classesList, subjectsList, refetch }: {
  staff: any; assignments: any; classesList: any[]; subjectsList: any[]; refetch: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  const staffRole = (staff.designation || staff.role || 'staff').toLowerCase();
  const template = ROLE_TEMPLATES[staffRole] || fallbackTemplate;

  const [selectedCategory, setSelectedCategory] = useState(template.categories[0]?.key || '');
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedMultiValues, setSelectedMultiValues] = useState<string[]>([]);
  const [selectedResponsibilities, setSelectedResponsibilities] = useState<string[]>([]);
  const [customResponsibility, setCustomResponsibility] = useState('');

  useEffect(() => {
    setSelectedValue('');
    setSelectedMultiValues([]);
    setSelectedResponsibilities([]);
    setCustomResponsibility('');
  }, [selectedCategory]);

  const activeCategorySpec = template.categories.find(c => c.key === selectedCategory);

  const getReferenceOptions = () => {
    if (selectedCategory === 'CLASS') {
      return classesList.map(c => ({ value: c.id, label: `${c.name} ${c.section || ''}` }));
    }
    if (selectedCategory === 'SUBJECT') {
      return subjectsList.map(s => ({ value: s.id, label: `${s.name} (${s.code || 'Sub'})` }));
    }
    return activeCategorySpec?.options?.map(opt => ({ value: opt, label: opt })) || [];
  };

  const options = getReferenceOptions();

  const handleToggleMulti = (val: string) => {
    setSelectedMultiValues(prev =>
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  const handleToggleResponsibility = (resp: string) => {
    setSelectedResponsibilities(prev =>
      prev.includes(resp) ? prev.filter(x => x !== resp) : [...prev, resp]
    );
  };

  const handleAddCustomResponsibility = () => {
    if (customResponsibility.trim() && !selectedResponsibilities.includes(customResponsibility.trim())) {
      setSelectedResponsibilities(prev => [...prev, customResponsibility.trim()]);
      setCustomResponsibility('');
    }
  };

  const handleSave = async () => {
    let itemsToAssign: { name: string; refId: string }[] = [];

    if (activeCategorySpec?.type === 'multi') {
      if (selectedMultiValues.length === 0) {
        toast.error('Please select at least one assigned value.');
        return;
      }
      selectedMultiValues.forEach(val => {
        if (selectedCategory === 'CLASS') {
          const cls = classesList.find(c => c.id === val);
          itemsToAssign.push({ name: cls ? `${cls.name} ${cls.section || ''}` : val, refId: val });
        } else if (selectedCategory === 'SUBJECT') {
          const sub = subjectsList.find(s => s.id === val);
          itemsToAssign.push({ name: sub ? sub.name : val, refId: val });
        } else {
          itemsToAssign.push({ name: val, refId: val });
        }
      });
    } else {
      if (!selectedValue.trim()) {
        toast.error('Assignment value is required.');
        return;
      }
      itemsToAssign.push({ name: selectedValue, refId: selectedValue });
    }

    setSaving(true);
    try {
      const respString = selectedResponsibilities.join(', ');
      
      const savePromises = itemsToAssign.map(item => {
        const payload = {
          assignment_type: selectedCategory,
          assignment_name: item.name,
          assignment_reference_id: item.refId,
          responsibility: respString || null,
          start_date: startDate || new Date().toISOString().split('T')[0],
          end_date: endDate || null,
          status
        };
        return staffApi.addAssignment(staff.id, 'staff_assignment', payload);
      });

      const results = await Promise.all(savePromises);
      const failed = results.filter(r => !r.success);

      if (failed.length === 0) {
        toast.success('Work Assignments configured and saved successfully!');
        setSelectedMultiValues([]);
        setSelectedValue('');
        setSelectedResponsibilities([]);
        setStartDate('');
        setEndDate('');
        refetch();
      } else {
        toast.error('Some assignments failed to save.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred while saving assignments');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to remove this work assignment?');
    if (!confirmDelete) return;

    try {
      const res = await staffApi.removeAssignment('staff_assignment', id);
      if (res.success) {
        toast.success('Assignment deleted successfully!');
        refetch();
      } else {
        toast.error(res.error || 'Failed to remove assignment');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred while deleting assignment');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-5 border-gray-100 shadow-sm bg-white">
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
            <span>Work Assignment History</span>
            <Badge variant="purple" className="font-bold text-[10px]">
              {assignments?.staff_assignments?.length || 0} Assignments
            </Badge>
          </h3>

          {assignments?.staff_assignments?.length === 0 ? (
            <EmptyState message="No work assignments mapped for this staff member." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments?.staff_assignments?.map((itm: any) => (
                <div key={itm.id} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start">
                      <Badge variant="purple" className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold font-mono bg-purple-550/10 text-purple-750 border-none">
                        {itm.assignment_type}
                      </Badge>
                      <Badge className={`${itm.status === 'ACTIVE' ? 'bg-green-50 text-green-700 hover:bg-green-50' : 'bg-gray-100 text-gray-650 hover:bg-gray-100'} text-[10px] font-bold border-none`}>
                        {itm.status}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-gray-850">{itm.assignment_name}</h4>
                      {itm.responsibility && (
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                          <span className="font-bold text-gray-700">Responsibilities:</span> {itm.responsibility}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t mt-3 pt-2.5 flex justify-end">
                    <button onClick={() => handleRemove(itm.id)} className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors">
                      <Trash2 size={12} /> Remove Work
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div>
        <Card className="p-5 border-gray-100 shadow-sm bg-white space-y-4">
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
            <Plus size={16} className="text-[#6D4CFF]" /> Workforce Assigner
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="mb-1 block font-bold text-gray-600">Assignment Category</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-purple-500 font-bold text-gray-700"
              >
                {template.categories.map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block font-bold text-gray-600">
                {activeCategorySpec?.label || 'Assignment Value'}
              </label>

              {activeCategorySpec?.type === 'multi' ? (
                <div className="max-h-40 overflow-y-auto p-2 border rounded-xl bg-gray-50/50 space-y-1.5 no-scrollbar">
                  {options.length === 0 ? (
                    <span className="text-[10px] text-gray-400 block font-medium">No options available.</span>
                  ) : (
                    options.map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedMultiValues.includes(opt.value)}
                          onChange={() => handleToggleMulti(opt.value)}
                          className="w-3.5 h-3.5 text-[#6D4CFF] rounded focus:ring-purple-400"
                        />
                        <span className="font-semibold text-gray-700 text-[11px]">{opt.label}</span>
                      </label>
                    ))
                  )}
                </div>
              ) : activeCategorySpec?.type === 'select' ? (
                <select
                  value={selectedValue}
                  onChange={e => setSelectedValue(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-purple-500 font-semibold text-gray-700"
                >
                  <option value="">Select Option</option>
                  {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Enter details..."
                  value={selectedValue}
                  onChange={e => setSelectedValue(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-purple-500 font-semibold"
                />
              )}
            </div>

            <div>
              <label className="mb-1 block font-bold text-gray-600">Responsibilities</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {template.responsibilities.map(resp => (
                  <button
                    key={resp}
                    type="button"
                    onClick={() => handleToggleResponsibility(resp)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${selectedResponsibilities.includes(resp) ? 'bg-[#6D4CFF] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {resp}
                  </button>
                ))}
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Custom responsibility..."
                  value={customResponsibility}
                  onChange={e => setCustomResponsibility(e.target.value)}
                  className="flex-1 px-3 py-1.5 border rounded-xl bg-white outline-none focus:border-purple-500 text-[11px]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomResponsibility}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold rounded-xl text-[10px]"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block font-bold text-gray-600">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-purple-500 font-medium text-gray-700"
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-gray-600">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-purple-500 font-medium text-gray-700"
                />
              </div>
            </div>

            <button
              disabled={saving}
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-[#6D4CFF] hover:bg-[#5b3ee0] text-white font-extrabold tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-200"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : null} Save Assignment
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// 3. TasksPanel
function TasksPanel({ staff, tasks, refetch }: { staff: any; tasks: any[]; refetch: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Task Title is required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await staffApi.addTask(staff.id, {
        title,
        description,
        priority,
        deadline: deadline || null,
        status: 'PENDING'
      });
      if (res.success) {
        toast.success('Task assigned successfully!');
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setDeadline('');
        refetch();
      } else {
        toast.error(res.error || 'Failed to assign task');
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
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-5 border-gray-100 shadow-sm bg-white">
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
            <span>Workplace Task Queue</span>
            <Badge variant="purple" className="font-bold text-[10px]">
              {tasks.length} Tasks
            </Badge>
          </h3>

          {tasks.length === 0 ? (
            <EmptyState message="No tasks assigned to this staff member yet." />
          ) : (
            <div className="space-y-3">
              {tasks.map((tsk: any) => (
                <div key={tsk.id} className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-gray-805">{tsk.title}</span>
                      <Badge className={`${
                        tsk.priority === 'HIGH' ? 'bg-red-550/10 text-red-700 hover:bg-red-550/20' :
                        tsk.priority === 'MEDIUM' ? 'bg-amber-550/10 text-amber-700 hover:bg-amber-550/20' :
                        'bg-blue-550/10 text-blue-700 hover:bg-blue-550/20'
                      } text-[9px] font-extrabold border-none px-1.5 py-0.5`}>
                        {tsk.priority}
                      </Badge>
                      <Badge className={`${
                        tsk.status === 'COMPLETED' ? 'bg-green-550/10 text-green-700 hover:bg-green-550/20' :
                        tsk.status === 'IN_PROGRESS' ? 'bg-blue-550/10 text-blue-700 hover:bg-blue-550/20' :
                        tsk.status === 'OVERDUE' ? 'bg-red-550/10 text-red-700 hover:bg-red-550/20' :
                        'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } text-[9px] font-bold border-none`}>
                        {tsk.status}
                      </Badge>
                    </div>
                    {tsk.description && <p className="text-[10px] text-gray-500 font-medium">{tsk.description}</p>}
                    <div className="text-[9px] text-gray-400 font-mono">
                      Due: {tsk.deadline ? new Date(tsk.deadline).toLocaleDateString() : 'No Deadline'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <select
                      value={tsk.status}
                      onChange={e => handleUpdateStatus(tsk.id, e.target.value)}
                      className="bg-white text-gray-700 font-bold text-[10px] outline-none border border-gray-200 rounded-lg px-2 py-1 cursor-pointer"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="OVERDUE">OVERDUE</option>
                    </select>

                    <button
                      onClick={() => handleDeleteTask(tsk.id)}
                      className="text-red-550 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors border border-none"
                      title="Delete Task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div>
        <Card className="p-5 border-gray-100 shadow-sm bg-white space-y-4">
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
            <Plus size={16} className="text-[#6D4CFF]" /> Task Assigner
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="mb-1 block font-bold text-gray-600">Task Title</label>
              <input
                type="text"
                placeholder="e.g. Prepare Grade 10 Exam Schedule"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-semibold text-gray-700"
                required
              />
            </div>

            <div>
              <label className="mb-1 block font-bold text-gray-600">Description</label>
              <textarea
                placeholder="Details about the task..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] text-gray-700 h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block font-bold text-gray-600">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-bold text-gray-700"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold text-gray-600">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
                />
              </div>
            </div>

            <button
              disabled={submitting}
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#6D4CFF] hover:bg-[#5b3ee0] text-white font-extrabold tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-200"
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : null} Assign Task
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}

// 4. SchedulePanel
function SchedulePanel({ staff, schedules, refetch }: { staff: any; schedules: any[]; refetch: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('SHIFT');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [room, setRoom] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) {
      toast.error('Please fill required fields (Title, Start Time, End Time)');
      return;
    }
    setSubmitting(true);
    try {
      const res = await staffApi.addSchedule(staff.id, {
        title,
        description,
        event_type: eventType,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        room_or_location: room || null
      });
      if (res.success) {
        toast.success('Schedule item created successfully!');
        setTitle('');
        setDescription('');
        setStartTime('');
        setEndTime('');
        setRoom('');
        refetch();
      } else {
        toast.error(res.error || 'Failed to create schedule');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this schedule entry?')) return;
    try {
      const res = await staffApi.deleteSchedule(id);
      if (res.success) {
        toast.success('Schedule deleted!');
        refetch();
      } else {
        toast.error(res.error || 'Failed to delete');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-5 border-gray-100 shadow-sm bg-white">
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center justify-between">
            <span>Dynamic Work Schedules</span>
            <Badge variant="purple" className="font-bold text-[10px]">
              {schedules?.length || 0} Entries
            </Badge>
          </h3>

          {!schedules || schedules.length === 0 ? (
            <EmptyState message="No schedule entries found for this staff member." />
          ) : (
            <div className="space-y-3">
              {schedules.map((sch: any) => (
                <div key={sch.id} className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-805">{sch.title}</span>
                      <Badge variant="purple" className="text-[9px] font-extrabold uppercase px-1.5 py-0.5">
                        {sch.event_type}
                      </Badge>
                    </div>
                    {sch.description && <p className="text-[10px] text-gray-500 font-medium">{sch.description}</p>}
                    <div className="text-[10px] text-gray-400 font-medium">
                      <span>{new Date(sch.start_time).toLocaleString()} - {new Date(sch.end_time).toLocaleString()}</span>
                      {sch.room_or_location && <span className="ml-2 font-semibold text-purple-600">&bull; {sch.room_or_location}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSchedule(sch.id)}
                    className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div>
        <Card className="p-5 border-gray-100 shadow-sm bg-white space-y-4">
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
            <Plus size={16} className="text-[#6D4CFF]" /> Schedule Event
          </h3>
          <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
            <div>
              <label className="mb-1 block font-bold text-gray-600">Event Title</label>
              <input
                type="text"
                placeholder="e.g. Physics lecture / Morning Route Shift"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-semibold text-gray-700"
                required
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-gray-600">Description</label>
              <textarea
                placeholder="Details..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] text-gray-700 h-16"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-gray-600">Event Type</label>
              <select
                value={eventType}
                onChange={e => setEventType(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-bold text-gray-700"
              >
                <option value="TIMETABLE">TIMETABLE</option>
                <option value="ROUTE">BUS ROUTE</option>
                <option value="SHIFT">SHIFT</option>
                <option value="MEETING">MEETING</option>
                <option value="APPOINTMENT">APPOINTMENT</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block font-bold text-gray-600">Start Date & Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
                required
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-gray-600">End Date & Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
                required
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-gray-600">Location / Room</label>
              <input
                type="text"
                placeholder="e.g. Lab 3, Bus #02"
                value={room}
                onChange={e => setRoom(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
              />
            </div>
            <button
              disabled={submitting}
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#6D4CFF] hover:bg-[#5b3ee0] text-white font-extrabold tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-200"
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : null} Create Schedule Event
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
// 5. AttendancePanel
function AttendancePanel({ staff }: { staff: any }) {
  const [attHistory, setAttHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const staffId = staff?.id || staff?.employee_id || '';

  useEffect(() => {
    if (!staffId) { setLoading(false); return; }
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    staffAttendanceApi.getAll(today).then((res: any) => {
      const records = Array.isArray(res) ? res : (res?.data || []);
      setAttHistory(records.filter((r: any) => r.staff_id === staffId || r.employee_id === staffId));
    }).catch(() => setAttHistory([])).finally(() => setLoading(false));
  }, [staffId]);

  const presentDays = attHistory.filter((a: any) => a.status === 'present').length;
  const lateDays = attHistory.filter((a: any) => a.status === 'late').length;
  const absentDays = attHistory.filter((a: any) => a.status === 'absent').length;
  const leaveDays = attHistory.filter((a: any) => a.status === 'leave' || a.status === 'on leave').length;
  const totalDays = attHistory.length || 1;
  const rate = Math.round((presentDays / totalDays) * 100);

  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  if (loading) return <Card className="p-5"><LoadingSkeleton rows={4} cols={4} /></Card>;

  return (
    <Card className="p-5 border-gray-100 shadow-sm bg-white">
      <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">Workplace Attendance Tracker</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-gray-50 rounded-xl text-center border">
          <span className="text-gray-400 text-[10px] block uppercase font-bold">Present Days</span>
          <span className="text-lg font-black text-green-600">{presentDays}</span>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl text-center border">
          <span className="text-gray-400 text-[10px] block uppercase font-bold">Late Markings</span>
          <span className="text-lg font-black text-amber-600">{lateDays}</span>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl text-center border">
          <span className="text-gray-400 text-[10px] block uppercase font-bold">Leave</span>
          <span className="text-lg font-black text-blue-600">{leaveDays}</span>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl text-center border">
          <span className="text-gray-400 text-[10px] block uppercase font-bold">Attendance Rate</span>
          <span className="text-lg font-black text-[#6D4CFF]">{rate}%</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-150 text-xs">
        <table className="min-w-full text-left text-gray-500">
          <thead className="bg-gray-50 font-semibold uppercase text-gray-700">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Check In</th>
              <th className="p-3">Check Out</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {attHistory.length > 0 ? attHistory.map((row, idx) => (
              <tr key={row.id || idx} className="hover:bg-gray-50/50">
                <td className="p-3 text-gray-800">{row.date || '—'}</td>
                <td className="p-3 font-mono">{row.check_in || row.in_time || '—'}</td>
                <td className="p-3 font-mono">{row.check_out || row.out_time || '—'}</td>
                <td className="p-3">
                  <Badge variant={row.status === 'present' ? 'success' : row.status === 'late' ? 'warning' : row.status === 'leave' ? 'default' : 'danger'}>
                    {(row.status || '—').replace('_', ' ')}
                  </Badge>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="p-6 text-center text-xs text-gray-400">No attendance records found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// 6. LeavePanel
function LeavePanel({ staff, leaves, refetch }: { staff: any; leaves: any[]; refetch: () => void }) {
  const [leaveType, setLeaveType] = useState('SICK');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || !reason) {
      toast.error('Please fill all fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await staffApi.addLeave(staff.id, {
        leave_type: leaveType,
        start_date: from,
        end_date: to,
        reason,
        status: 'PENDING'
      });
      if (res.success) {
        toast.success('Leave request submitted!');
        setFrom('');
        setTo('');
        setReason('');
        refetch();
      } else {
        toast.error(res.error || 'Failed to submit leave');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
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

  const approvedLeaves = leaves?.filter(l => l.status === 'APPROVED') || [];
  const sickCount = approvedLeaves.filter(l => l.leave_type === 'SICK').length;
  const casualCount = approvedLeaves.filter(l => l.leave_type === 'CASUAL').length;
  const annualCount = approvedLeaves.filter(l => l.leave_type === 'ANNUAL' || l.leave_type === 'PERSONAL').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-5 border-gray-100 shadow-sm bg-white">
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">Leave Balances (Approved)</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
              <span className="text-[10px] font-bold uppercase block">Casual Leave</span>
              <div className="text-xl font-black">{casualCount} / 12 Days</div>
            </div>
            <div className="p-3.5 bg-green-50 text-green-700 rounded-xl border border-green-100">
              <span className="text-[10px] font-bold uppercase block">Sick Leave</span>
              <div className="text-xl font-black">{sickCount} / 10 Days</div>
            </div>
            <div className="p-3.5 bg-purple-50 text-purple-700 rounded-xl border border-purple-100">
              <span className="text-[10px] font-bold uppercase block">Annual / Personal</span>
              <div className="text-xl font-black">{annualCount} Days</div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <span className="font-bold text-gray-700 uppercase block">Leave Request History</span>
            <div className="overflow-x-auto rounded-xl border border-gray-150">
              <table className="min-w-full text-left text-gray-500">
                <thead className="bg-gray-50 font-semibold uppercase text-gray-700 text-[10px]">
                  <tr>
                    <th className="p-3">Leave Type</th>
                    <th className="p-3">From Date</th>
                    <th className="p-3">To Date</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {!leaves || leaves.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-400">No leave history</td>
                    </tr>
                  ) : (
                    leaves.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/50">
                        <td className="p-3 text-gray-800 font-bold uppercase">{row.leave_type}</td>
                        <td className="p-3">{new Date(row.start_date).toLocaleDateString()}</td>
                        <td className="p-3">{new Date(row.end_date).toLocaleDateString()}</td>
                        <td className="p-3 max-w-[150px] truncate" title={row.reason}>{row.reason || '—'}</td>
                        <td className="p-3">
                          <Badge variant={row.status === 'APPROVED' ? 'success' : row.status === 'REJECTED' ? 'danger' : 'warning'}>
                            {row.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          {row.status === 'PENDING' ? (
                            <div className="flex gap-1 justify-center">
                              <button
                                disabled={actioning !== null}
                                onClick={() => handleUpdateStatus(row.id, 'APPROVED')}
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-bold"
                              >
                                Approve
                              </button>
                              <button
                                disabled={actioning !== null}
                                onClick={() => handleUpdateStatus(row.id, 'REJECTED')}
                                className="px-2 py-1 bg-red-650 hover:bg-red-700 text-white rounded text-[10px] font-bold"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400">Handled</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <Card className="p-5 border-gray-100 shadow-sm bg-white space-y-4">
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
            <Clock size={16} className="text-[#6D4CFF]" /> Apply for Leave (Admin)
          </h3>
          <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
            <div>
              <label className="mb-1 block font-bold text-gray-600">Leave Type</label>
              <select
                value={leaveType}
                onChange={e => setLeaveType(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-bold text-gray-700"
              >
                <option value="SICK">Sick Leave</option>
                <option value="CASUAL">Casual Leave</option>
                <option value="ANNUAL">Annual Leave</option>
                <option value="PERSONAL">Personal Leave</option>
                <option value="MATERNITY">Maternity Leave</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block font-bold text-gray-600">From Date</label>
                <input
                  type="date"
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-gray-600">To Date</label>
                <input
                  type="date"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-bold text-gray-600">Reason</label>
              <textarea
                placeholder="Details of application..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] text-gray-700 h-16"
                required
              />
            </div>

            <button
              disabled={submitting}
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#6D4CFF] hover:bg-[#5b3ee0] text-white font-extrabold tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-200"
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : null} Submit Leave
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}

// 7. PerformancePanel
function PerformancePanel({ staff, performance, refetch }: { staff: any; performance: any[]; refetch: () => void }) {
  const isTeacher = (staff.role || '').toLowerCase().includes('teacher') || (staff.designation || '').toLowerCase().includes('teacher');
  const isDriver = (staff.role || '').toLowerCase().includes('driver') || (staff.designation || '').toLowerCase().includes('driver') || (staff.role || '').toLowerCase().includes('bus driver');
  const isAccountant = (staff.role || '').toLowerCase().includes('accountant') || (staff.designation || '').toLowerCase().includes('accountant');

  const [score, setScore] = useState(90);
  const [feedback, setFeedback] = useState('');
  
  // Role specific KPI states
  const [kpi1, setKpi1] = useState(90); // teacher: homework, driver: route, accountant: fee, other: shift
  const [kpi2, setKpi2] = useState(90); // teacher: syllabus, driver: timing, accountant: payroll, other: response

  const [submitting, setSubmitting] = useState(false);

  // Compute stats
  const { avgRating, avgKpi } = useMemo(() => {
    if (!performance || performance.length === 0) {
      return { avgRating: 'N/A', avgKpi: 'N/A' };
    }
    const sumScore = performance.reduce((sum, item) => sum + Number(item.score || 0), 0);
    const avgScore = sumScore / performance.length;
    
    // Average of all values inside all kpi_metrics
    let kpiSum = 0;
    let kpiCount = 0;
    performance.forEach(item => {
      const metrics = item.kpi_metrics || {};
      Object.values(metrics).forEach((v: any) => {
        kpiSum += Number(v || 0);
        kpiCount++;
      });
    });
    
    return {
      avgRating: (avgScore / 10).toFixed(1) + ' / 10',
      avgKpi: kpiCount > 0 ? (kpiSum / kpiCount).toFixed(1) + '%' : 'N/A'
    };
  }, [performance]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const kpiMetrics: Record<string, number> = {};
      if (isTeacher) {
        kpiMetrics.homeworkCompletion = kpi1;
        kpiMetrics.syllabusCoverage = kpi2;
      } else if (isDriver) {
        kpiMetrics.routeCompliance = kpi1;
        kpiMetrics.pickupTiming = kpi2;
      } else if (isAccountant) {
        kpiMetrics.feeCollection = kpi1;
        kpiMetrics.payrollAccuracy = kpi2;
      } else {
        kpiMetrics.shiftCompliance = kpi1;
        kpiMetrics.incidentResponse = kpi2;
      }

      const res = await staffApi.addPerformance(staff.id, {
        score,
        kpi_metrics: kpiMetrics,
        manager_feedback: feedback,
        reviews: [{
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          reviewer: 'Management Administrator',
          score: (score / 10).toFixed(1) + '/10',
          remarks: feedback
        }]
      });

      if (res.success || res.data) {
        toast.success('Performance review logged successfully!');
        setFeedback('');
        setScore(90);
        setKpi1(90);
        setKpi2(90);
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
        <Card className="p-5 border-gray-100 shadow-sm bg-white">
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">Workplace Performance Index</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-purple-50 text-purple-750 space-y-1 border border-purple-100">
              <span className="text-[10px] uppercase font-bold tracking-wider">Overall Rating</span>
              <div className="text-2xl font-black">{avgRating}</div>
            </div>
            <div className="p-4 rounded-xl bg-green-50 text-green-700 space-y-1 border border-green-100">
              <span className="text-[10px] uppercase font-bold tracking-wider">KPI Target Status</span>
              <div className="text-2xl font-black">{avgKpi === 'N/A' ? 'N/A' : `${avgKpi} Met`}</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 text-blue-700 space-y-1 border border-blue-100">
              <span className="text-[10px] uppercase font-bold tracking-wider">Review Cycle</span>
              <div className="text-2xl font-black">{performance && performance.length > 0 ? 'Updated' : 'Needs Review'}</div>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <span className="font-bold text-gray-700 uppercase block">Supervisor Performance Reviews</span>
            {!performance || performance.length === 0 ? (
              <div className="p-4 border border-dashed rounded-xl text-center text-gray-400 font-medium text-[11px]">
                No performance reviews have been logged for this staff member yet.
              </div>
            ) : (
              performance.map((item: any, idx: number) => (
                <div key={item.id || idx} className="p-3.5 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
                  <div className="flex justify-between items-center font-semibold text-gray-800">
                    <span>Review Date: {new Date(item.review_date || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <Badge variant="purple">{(item.score / 10).toFixed(1)}/10</Badge>
                  </div>
                  {item.manager_feedback && (
                    <p className="text-[11px] text-gray-650 italic leading-relaxed">
                      "{item.manager_feedback}"
                    </p>
                  )}
                  {item.kpi_metrics && Object.keys(item.kpi_metrics).length > 0 && (
                    <div className="pt-1.5 border-t border-gray-200/50 grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-bold">
                      {Object.entries(item.kpi_metrics).map(([k, v]: any) => (
                        <div key={k} className="flex justify-between p-1 bg-white rounded border border-gray-100">
                          <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-[#6D4CFF]">{v}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div>
        <Card className="p-5 border-gray-100 shadow-sm bg-white space-y-4">
          <h3 className="text-sm font-bold text-gray-855 border-b pb-2">Log New Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
            <div>
              <label className="mb-1 block font-bold text-gray-600">Overall Score (1 - 100)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={score}
                onChange={e => setScore(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
                required
              />
            </div>

            {isTeacher && (
              <>
                <div>
                  <label className="mb-1 block font-bold text-gray-600">Homework Completion Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={kpi1}
                    onChange={e => setKpi1(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-gray-600">Curriculum Syllabus Coverage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={kpi2}
                    onChange={e => setKpi2(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
                  />
                </div>
              </>
            )}

            {isDriver && (
              <>
                <div>
                  <label className="mb-1 block font-bold text-gray-600">Route Compliance Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={kpi1}
                    onChange={e => setKpi1(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-gray-600">Student Pickup Window compliance (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={kpi2}
                    onChange={e => setKpi2(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
                  />
                </div>
              </>
            )}

            {isAccountant && (
              <>
                <div>
                  <label className="mb-1 block font-bold text-gray-600">Fee Collection Compliance (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={kpi1}
                    onChange={e => setKpi1(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-gray-600">Payroll Calculation Accuracy (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={kpi2}
                    onChange={e => setKpi2(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
                  />
                </div>
              </>
            )}

            {!isTeacher && !isDriver && !isAccountant && (
              <>
                <div>
                  <label className="mb-1 block font-bold text-gray-600">Shift Compliance (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={kpi1}
                    onChange={e => setKpi1(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-gray-600">Incident Response Time (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={kpi2}
                    onChange={e => setKpi2(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-1 block font-bold text-gray-600">Manager Feedback & Remarks</label>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Write specific performance comments..."
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] text-gray-700 h-20"
                required
              />
            </div>

            <button
              disabled={submitting}
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#6D4CFF] hover:bg-[#5b3ee0] text-white font-extrabold tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : null} Log Review
            </button>
          </form>
        </Card>
      </div>
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
        toast.success(`${resourceName} issued successfully!`);
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
    try {
      const payload: any = { status: newStatus };
      if (newStatus === 'RETURNED') {
        payload.returned_at = new Date().toISOString();
      }
      const res = await staffApi.updateResource(resourceId, payload);
      if (res.success || res.data) {
        toast.success(`Resource status updated to ${newStatus}`);
        refetch();
      } else {
        toast.error('Failed to update status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-5 border-gray-100 shadow-sm bg-white">
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-1.5">
            <Layers size={16} className="text-[#6D4CFF]" /> Checked-out Equipment & Workspace Assets
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!resources || resources.length === 0 ? (
              <div className="col-span-2 py-8 border border-dashed rounded-2xl text-center text-gray-400 font-medium text-[11px]">
                No physical assets check-out history for this staff member.
              </div>
            ) : (
              resources.map((res: any, idx: number) => (
                <div key={res.id || idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Badge variant="purple" className="px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold bg-purple-550/10 text-purple-750 border-none">
                        {res.resource_type}
                      </Badge>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        res.status === 'ISSUED' ? 'bg-amber-50 text-amber-700' :
                        res.status === 'RETURNED' ? 'bg-green-50 text-green-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {res.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-850">{res.resource_name}</h4>
                    {res.serial_number && (
                      <p className="text-[10px] text-gray-500 font-medium">
                        <span className="font-bold">S/N:</span> {res.serial_number}
                      </p>
                    )}
                    {res.notes && (
                      <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                        "{res.notes}"
                      </p>
                    )}
                  </div>
                  
                  {res.status === 'ISSUED' && (
                    <div className="border-t mt-3 pt-2 flex gap-2 justify-end">
                      <button
                        onClick={() => handleUpdateStatus(res.id, 'RETURNED')}
                        className="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 font-extrabold text-[10px] rounded-lg transition-all"
                      >
                        Return Asset
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(res.id, 'DAMAGED')}
                        className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-[10px] rounded-lg transition-all"
                      >
                        Report Damaged
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div>
        <Card className="p-5 border-gray-100 shadow-sm bg-white space-y-4">
          <h3 className="text-sm font-bold text-gray-855 border-b pb-2 flex items-center gap-1.5">
            <Key size={14} className="text-[#6D4CFF]" /> Issue Resource
          </h3>
          <form onSubmit={handleIssueResource} className="space-y-4 text-xs">
            <div>
              <label className="mb-1 block font-bold text-gray-600">Resource Type</label>
              <select
                value={resourceType}
                onChange={e => setResourceType(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-bold text-gray-700"
              >
                <option value="DEVICE">Device (Laptop, Phone)</option>
                <option value="VEHICLE">Fleet Vehicle</option>
                <option value="CLASSROOM">Classroom / Hall Room</option>
                <option value="LAB">Laboratory Room</option>
                <option value="EQUIPMENT">Equipment (Keys, Projector)</option>
                <option value="BUILDING">Building Facility</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-bold text-gray-600">Resource Name</label>
              <input
                type="text"
                placeholder="e.g. MacBook Pro M3, Classroom 102"
                value={resourceName}
                onChange={e => setResourceName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
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
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
              />
            </div>

            <div>
              <label className="mb-1 block font-bold text-gray-600">Notes / Condition description</label>
              <textarea
                placeholder="Condition at issue, expected return date, etc."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] text-gray-700 h-16"
              />
            </div>

            <button
              disabled={submitting}
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#6D4CFF] hover:bg-[#5b3ee0] text-white font-extrabold tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : null} Checkout Asset
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}

// 9. PermissionsPanel
function PermissionsPanel({ staff, assignments, refetchAssignments }: { staff: any; assignments: any; refetchAssignments: () => void }) {
  const [roles, setRoles] = useState<any[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [selectedRole, setSelectedRole] = useState(staff.role || '');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchRoles() {
      setLoadingRoles(true);
      try {
        const res = await rolesApiV2.getRoles();
        if (res.success && res.data) setRoles(res.data);
      } catch (err) { console.error(err); } finally { setLoadingRoles(false); }
    }
    fetchRoles();
  }, []);

  const handleRoleChange = async (newRole: string) => {
    if (!newRole) return;
    setSelectedRole(newRole);
    setUpdating(true);
    try {
      const res = await rolesApiV2.updateUserRole(staff.id, { role: newRole });
      if (res.success) {
        toast.success(`Role successfully changed to ${newRole}!`);
        refetchAssignments();
      } else {
        toast.error(res.error || 'Failed to update user role');
      }
    } catch (err: any) { toast.error(err.message || 'Error occurred'); } finally { setUpdating(false); }
  };

  const livePermissions = assignments?.permissions || [];
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, string[]> = {};
    livePermissions.forEach((p: any) => {
      if (!p || !p.module) return;
      if (!groups[p.module]) groups[p.module] = [];
      if (p.action && !groups[p.module].includes(p.action)) groups[p.module].push(p.action);
    });
    return groups;
  }, [livePermissions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="p-5 border-gray-100 h-fit space-y-4 shadow-sm bg-white">
        <h3 className="text-sm font-bold text-gray-800 border-b pb-2 flex items-center gap-1.5">
          <Shield size={16} className="text-[#6D4CFF]" /> Role Assignment
        </h3>
        <select
          value={selectedRole}
          onChange={e => handleRoleChange(e.target.value)}
          disabled={updating}
          className="w-full px-3 py-2 text-xs border rounded-xl bg-white outline-none focus:border-purple-500 font-bold text-gray-700"
        >
          <option value="">Select a Role</option>
          {roles.map((r: any) => <option key={r.id} value={r.name}>{r.name}</option>)}
        </select>
      </Card>
      <Card className="lg:col-span-2 p-5 border-gray-100 shadow-sm bg-white">
        <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">Active Effective Permissions</h3>
        {Object.entries(groupedPermissions).map(([mod, actions]) => (
          <div key={mod} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border mb-2">
            <span className="text-xs font-bold capitalize">{mod}</span>
            <div className="flex gap-1.5">{actions.map(act => <Badge key={act} variant="purple">{act}</Badge>)}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// 10. DocumentsPanel
function DocumentsPanel({ staff, documents, refetch }: { staff: any; documents: any[]; refetch: () => void }) {
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('CONTRACT');
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [folder, setFolder] = useState('General');
  const [submitting, setSubmitting] = useState(false);

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) return;
    setSubmitting(true);
    try {
      const res = await staffApi.addDocument(staff.id, {
        title,
        document_type: docType,
        file_url: fileUrl,
        description: description || null,
        folder: folder || 'General',
        status: 'PENDING'
      });
      if (res.success || res.data) {
        toast.success('Document uploaded for verification!');
        setTitle('');
        setFileUrl('');
        setDescription('');
        refetch();
      } else {
        toast.error('Failed to submit document');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error uploading document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyStatus = async (docId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await staffApi.updateDocumentStatus(docId, status);
      if (res.success || res.data) {
        toast.success(`Document marked as ${status}`);
        refetch();
      } else {
        toast.error('Failed to update verification status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-5 border-gray-100 shadow-sm bg-white">
          <h3 className="text-sm font-bold text-gray-800 border-b pb-2 mb-4">Credentials & Documents Verification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {!documents || documents.length === 0 ? (
              <div className="col-span-2 py-8 border border-dashed rounded-2xl text-center text-gray-400 font-medium text-[11px]">
                No credentials or verification files uploaded yet.
              </div>
            ) : (
              documents.map((doc: any, idx: number) => (
                <div key={doc.id || idx} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-bold text-gray-800 break-all">{doc.title}</span>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        doc.status === 'VERIFIED' ? 'bg-green-50 text-green-700' :
                        doc.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-750'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      Type: {doc.document_type} &bull; Folder: {doc.folder}
                    </span>
                    {doc.description && (
                      <p className="text-[10px] text-gray-500 mt-2 border-t pt-1 italic">
                        "{doc.description}"
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-2 flex justify-between items-center gap-2">
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6D4CFF] hover:underline font-extrabold text-[10px]"
                    >
                      View File
                    </a>

                    {doc.status === 'PENDING' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleVerifyStatus(doc.id, 'VERIFIED')}
                          className="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 font-extrabold text-[9px] rounded-lg transition-all"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleVerifyStatus(doc.id, 'REJECTED')}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-[9px] rounded-lg transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div>
        <Card className="p-5 border-gray-100 shadow-sm bg-white space-y-4">
          <h3 className="text-sm font-bold text-gray-855 border-b pb-2">Upload / Link Document</h3>
          <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
            <div>
              <label className="mb-1 block font-bold text-gray-600">Document Title</label>
              <input
                type="text"
                placeholder="e.g. Master Degree Timetable Certificate"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
                required
              />
            </div>

            <div>
              <label className="mb-1 block font-bold text-gray-600">Document Type</label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-bold text-gray-700"
              >
                <option value="CONTRACT">Contract Agreement</option>
                <option value="CERTIFICATE">Academic Certificate</option>
                <option value="ID_PROOF">Identity Proof</option>
                <option value="TRAINING">Training Record</option>
                <option value="POLICY">Signed Policy Document</option>
                <option value="VERIFICATION">Background Verification</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-bold text-gray-600">File URL (Hosted Document Link)</label>
              <input
                type="text"
                placeholder="e.g. https://storage.supabase.co/..."
                value={fileUrl}
                onChange={e => setFileUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block font-bold text-gray-600">Storage Folder</label>
                <input
                  type="text"
                  placeholder="e.g. HR, Timetable"
                  value={folder}
                  onChange={e => setFolder(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] font-medium text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-bold text-gray-600">Description</label>
              <textarea
                placeholder="Specific comments regarding file verification..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-white outline-none focus:border-[#6D4CFF] text-gray-700 h-16"
              />
            </div>

            <button
              disabled={submitting}
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#6D4CFF] hover:bg-[#5b3ee0] text-white font-extrabold tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : null} Submit Document
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}

// 11. CommunicationPanel
function CommunicationPanel({ staff, messages, refetch }: { staff: any; messages: any[]; refetch: () => void }) {
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const sessionUser = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const s = JSON.parse(localStorage.getItem('managementSession') || '{}');
      return s?.user || null;
    } catch { return null; }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    if (!sessionUser?.id) {
      toast.error('Unable to send message: Admin session not detected.');
      return;
    }
    setSending(true);
    try {
      const res = await apiClient.post<any>('/management/staff/messages', {
        sender_id: sessionUser.id,
        recipient_id: staff.user_id || staff.id,
        message_text: messageText,
        organisation_id: getOrgId()
      });
      if (res.success || res.data) {
        setMessageText('');
        refetch();
        toast.success('Message dispatched in real-time!');
      } else {
        toast.error('Failed to dispatch message');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-5 border-gray-100 shadow-sm bg-white h-96 flex flex-col">
          <h3 className="text-sm font-bold border-b pb-2 mb-4">Internal Work Messaging</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {!messages || messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-gray-400 font-medium text-[11px]">
                No correspondence logged yet. Send a direct message below.
              </div>
            ) : (
              messages.map((msg: any, idx: number) => {
                const isAdmin = msg.sender_id === sessionUser?.id;
                return (
                  <div
                    key={msg.id || idx}
                    className={`p-3 rounded-2xl max-w-[85%] text-xs font-semibold leading-relaxed ${
                      isAdmin
                        ? 'bg-purple-50 text-purple-900 ml-auto border border-purple-100'
                        : 'bg-gray-50 text-gray-800 mr-auto border border-gray-200'
                    }`}
                  >
                    <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">
                      {isAdmin ? 'You (Management Admin)' : staff.full_name} &bull; {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.message_text}
                  </div>
                );
              })
            )}
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t">
            <input
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              className="flex-1 px-3 border rounded-xl text-xs outline-none focus:border-[#6D4CFF] font-medium"
              placeholder={`Send message to ${staff.full_name}...`}
              required
            />
            <button
              disabled={sending}
              className="px-4 py-2 bg-[#6D4CFF] hover:bg-[#5b3ee0] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-purple-100 flex items-center gap-1"
            >
              {sending ? <Loader2 size={12} className="animate-spin" /> : null} Send
            </button>
          </form>
        </Card>
      </div>
      <div>
        <Card className="p-5 border-gray-100 shadow-sm bg-white space-y-4">
          <h3 className="text-sm font-bold border-b pb-2">WOS Notifications Feed</h3>
          <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase">
            Active Employee Alerts
          </p>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-amber-50 text-amber-800 rounded-xl font-bold border border-amber-100">
              Shift Compliance Warning
              <span className="block text-[9px] font-normal text-amber-600 mt-1">
                Triggered automatically if timetable matches delayed clock-in events.
              </span>
            </div>
            <div className="p-3 bg-blue-50 text-blue-800 rounded-xl font-bold border border-blue-100">
              Contract Expiration Check
              <span className="block text-[9px] font-normal text-blue-600 mt-1">
                Renewals checklist initiated automatically in HR center.
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// 12. ActivityLogPanel
function ActivityLogPanel({ staff, assignments, activities }: { staff: any; assignments: any; activities: any[] }) {
  return (
    <Card className="p-5 border-gray-100 shadow-sm bg-white">
      <h3 className="text-sm font-bold border-b pb-2 mb-4">WOS System Activity Logs</h3>
      <div className="space-y-4">
        {!activities || activities.length === 0 ? (
          <div className="py-6 border border-dashed rounded-xl text-center text-gray-400 font-medium text-[11px]">
            No recent workforce system activity logs found.
          </div>
        ) : (
          activities.map((log: any, idx: number) => (
            <div key={log.id || idx} className="border-l-2 border-[#6D4CFF]/30 pl-4 py-1.5 space-y-1 relative">
              <span className="absolute -left-1.5 top-2.5 w-2.5 h-2.5 bg-[#6D4CFF] rounded-full ring-4 ring-purple-100" />
              <p className="text-xs font-semibold text-gray-800">{log.action}</p>
              {log.details && Object.keys(log.details).length > 0 && (
                <div className="text-[10px] text-gray-500 font-bold bg-gray-50 p-2 rounded-xl border border-gray-100/50 max-w-lg">
                  {Object.entries(log.details).map(([k, v]: any) => (
                    <div key={k} className="flex gap-1">
                      <span className="capitalize text-gray-600">{k}:</span>
                      <span className="text-gray-850 break-all">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
              <span className="text-[9px] text-gray-400 font-bold block">
                {new Date(log.created_at).toLocaleDateString()} at {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

// 13. AnalyticsPanel
function AnalyticsPanel({ staff, assignments, tasks, workload }: { staff: any; assignments: any; tasks: any[]; workload: any }) {
  const completionRate = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'COMPLETED').length / tasks.length) * 100) : 100;
  
  const workloadPercentage = Number(workload?.workload_percentage || 0);
  const activeClasses = Number(workload?.active_classes_count || 0);
  const activeTasks = Number(workload?.active_tasks_count || 0);
  const activeRoutes = Number(workload?.active_routes_count || 0);

  return (
    <Card className="p-5 border-gray-100 shadow-sm bg-white">
      <h3 className="text-sm font-bold border-b pb-2 mb-4">Workforce Load & Task Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 border rounded-2xl bg-gray-50/50 space-y-4">
          <div className="flex justify-between items-center font-bold">
            <span className="text-xs text-gray-700">Capacity Workload Ratio</span>
            <span className={`text-sm ${
              workloadPercentage > 100 ? 'text-red-600' :
              workloadPercentage > 75 ? 'text-purple-600' : 'text-green-600'
            }`}>
              {workloadPercentage}%
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                workloadPercentage > 100 ? 'bg-red-500' :
                workloadPercentage > 75 ? 'bg-[#6D4CFF]' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
            />
          </div>
          
          <p className="text-[10px] text-gray-400 font-bold leading-relaxed leading-4 uppercase">
            Workload Load Balancing Alert: {
              workloadPercentage > 120 ? 'OVER CAPACITY LIMIT' :
              workloadPercentage > 80 ? 'HIGH ASSIGNMENTS RATIO' : 'OPTIMAL LOAD BALANCE'
            }
          </p>
        </div>

        <div className="p-5 border rounded-2xl bg-gray-50/50 space-y-4">
          <div className="flex justify-between items-center font-bold">
            <span className="text-xs text-gray-700">Task Completion Efficiency</span>
            <span className="text-green-600 text-sm">{completionRate}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 font-bold leading-relaxed leading-4 uppercase">
            COMPLETED TASKS: {tasks.filter(t => t.status === 'COMPLETED').length} / {tasks.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-purple-50 text-purple-750 border border-purple-100 text-center">
          <span className="text-[9px] uppercase font-bold tracking-wider block mb-1">Active Classes</span>
          <span className="text-xl font-black">{activeClasses}</span>
        </div>
        <div className="p-4 rounded-xl bg-green-50 text-green-700 border border-green-100 text-center">
          <span className="text-[9px] uppercase font-bold tracking-wider block mb-1">Active Tasks</span>
          <span className="text-xl font-black">{activeTasks}</span>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 text-center">
          <span className="text-[9px] uppercase font-bold tracking-wider block mb-1">Active Routes</span>
          <span className="text-xl font-black">{activeRoutes}</span>
        </div>
      </div>
    </Card>
  );
}

// ==========================================
// NEW TAB: Class & Subject Assignment Panel
// ==========================================
function ClassSubjectPanel({ staff, classesList, subjectsList, refetchAssignments }: {
  staff: any; classesList: any[]; subjectsList: any[]; refetchAssignments: () => void;
}) {
  const orgIdVal = typeof window !== 'undefined' ? (() => { try { const s = JSON.parse(localStorage.getItem('managementSession') || '{}'); return s?.organisation?.id || ''; } catch { return ''; } })() : '';
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
            <BookOpen size={16} className="text-[#6D4CFF]" /> Current Class & Subject Assignments
            <Badge variant="purple" className="font-bold text-[10px]">{mappings.length}</Badge>
          </h3>
          <button onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5b3ee0] transition-colors">
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
                    <GraduationCap size={13} className="inline mr-1 text-[#6D4CFF]" />
                    {group.class?.name || 'Class'} {group.sections.size > 0 && `(${[...group.sections].join(', ')})`}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-semibold">{group.subjects.length} subjects</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.subjects.map((sub: any, idx: number) => (
                    <Badge key={idx} className="bg-purple-50 text-purple-700 border-none text-[10px] font-semibold">{sub.name || sub}</Badge>
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
            <Plus size={16} className="text-[#6D4CFF]" /> New Assignment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Classes */}
            <div>
              <label className="text-xs font-bold text-gray-600 mb-2 block">Select Classes</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto border rounded-xl p-2">
                {classesList.map((cls: any) => (
                  <label key={cls.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-xs">
                    <input type="checkbox" checked={selectedClassIds.has(cls.id)} onChange={() => toggleClass(cls.id)}
                      className="rounded border-gray-300 text-[#6D4CFF] focus:ring-[#6D4CFF] w-3.5 h-3.5" />
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
                      className="rounded border-gray-300 text-[#6D4CFF] focus:ring-[#6D4CFF] w-3.5 h-3.5" />
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
                        className="rounded border-gray-300 text-[#6D4CFF] focus:ring-[#6D4CFF] w-3.5 h-3.5" />
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5b3ee0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
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
          <User size={16} className="text-[#6D4CFF]" /> Personal Information
        </h3>
        <button onClick={() => editing ? handleSave() : setEditing(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5b3ee0] transition-colors">
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
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20">
                  <option value="">Select</option>
                  {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={field.type} value={form[field.key as keyof typeof form]} onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
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

// ==========================================
// NEW TAB: Qualifications Panel
// ==========================================
function QualificationsPanel({ staff }: { staff: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newQual, setNewQual] = useState({ degree: '', institution: '', year: '', grade: '' });
  const [saving, setSaving] = useState(false);

  const orgIdVal = typeof window !== 'undefined' ? (() => { try { const s = JSON.parse(localStorage.getItem('managementSession') || '{}'); return s?.organisation?.id || ''; } catch { return ''; } })() : '';
  const teacherId = staff.teacher_id || staff.id;

  useEffect(() => {
    if (!teacherId || !orgIdVal) { setLoading(false); return; }
    apiClient.get<any>(`/management/staff/${teacherId}/assignments`).then(res => {
      setItems(res?.data?.qualifications || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [teacherId, orgIdVal]);

  const handleAdd = async () => {
    if (!newQual.degree.trim()) { toast.error('Degree is required'); return; }
    setSaving(true);
    try {
      const res = await staffApi.addAssignment(teacherId, 'qualification', {
        ...newQual, organisation_id: orgIdVal,
        start_date: newQual.year ? `${newQual.year}-01-01` : null,
      });
      if (res?.success !== false) {
        toast.success('Qualification added');
        setShowForm(false);
        setNewQual({ degree: '', institution: '', year: '', grade: '' });
        const refetch = await apiClient.get<any>(`/management/staff/${teacherId}/assignments`);
        setItems(refetch?.data?.qualifications || []);
      } else toast.error(res?.error || 'Failed to add');
    } catch (err: any) { toast.error(err.message); }
    setSaving(false);
  };

  return (
    <Card className="p-5 border-gray-100 shadow-sm bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <Award size={16} className="text-[#6D4CFF]" /> Qualifications & Education
          <Badge variant="purple" className="font-bold text-[10px]">{items.length}</Badge>
        </h3>
        {staff.qualification && (
          <Badge className="bg-green-50 text-green-700 border-none text-[10px]">{staff.qualification}</Badge>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
      ) : (
        <>
          <button onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5b3ee0] mb-4 transition-colors">
            <Plus size={13} /> {showForm ? 'Cancel' : 'Add Qualification'}
          </button>

          {showForm && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <input value={newQual.degree} onChange={e => setNewQual({ ...newQual, degree: e.target.value })} placeholder="Degree *"
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
              <input value={newQual.institution} onChange={e => setNewQual({ ...newQual, institution: e.target.value })} placeholder="Institution"
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
              <input value={newQual.year} onChange={e => setNewQual({ ...newQual, year: e.target.value })} placeholder="Year"
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
              <input value={newQual.grade} onChange={e => setNewQual({ ...newQual, grade: e.target.value })} placeholder="Grade/Percentage"
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
              <button onClick={handleAdd} disabled={saving}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5b3ee0] disabled:opacity-50 transition-colors">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Add
              </button>
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400 font-medium">
              <Award size={32} className="mx-auto mb-2 text-gray-300" />
              No qualifications recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((q: any, i: number) => (
                <div key={q.id || i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/30">
                  <div className="flex items-center gap-3">
                    <Star size={14} className="text-[#6D4CFF] flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-800">{q.degree || q.assignment_name}</p>
                      <p className="text-[10px] text-gray-500">{q.institution || ''} {q.year ? `(${q.year})` : ''}</p>
                    </div>
                  </div>
                  {q.grade && <Badge className="bg-purple-50 text-purple-700 border-none text-[10px]">{q.grade}</Badge>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

// Dashboard wrapper for interface compatibility
function DashboardPanel() { return null; }
