'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, animate, useMotionValue } from 'framer-motion';
import { useApi, useForm, LoadingSkeleton, ErrorState, EmptyState } from '../lib/useApi';
import { staffApi, staffAttendanceApi, classApi, subjectApi, academicMgmtApi, announcementApi, timetableApi, enterpriseStaffApi, payrollApiV2, staffExpensesApi } from '../lib/dataService';
import { auth } from '../lib/auth';
import { ModuleHeader } from '../lib/ModuleUi';
import StaffBulkImportWizard from './StaffBulkImportWizard';
import { createClient } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLanguage } from '../language/LanguageProvider';
import {
  LayoutDashboard, TrendingUp, Brain, FileText, Shield, Users, UserPlus,
  GraduationCap, UserCheck, BookOpen, CalendarDays, Calendar, ClipboardList,
  Award, Building2, Bus, Heart, MessageSquare, Briefcase, Sparkles, Bot,
  BarChart3, Bell, Search, Download, Upload, Plus, CheckCircle2, Clock,
  AlertTriangle, ChevronLeft, ChevronRight, Star, Activity, Megaphone, Edit3, Trash2, X,
  Medal, Target, Filter, Eye, CheckCircle, BadgeCheck, UserCog, AlertCircle,
  Loader2, ArrowRight, RefreshCw, Settings, List, PieChart, LineChart, Users2, DoorOpen, XCircle, ListTodo, School, CalendarCheck, Send, DollarSign, Moon, Palette, Save,
  Banknote, Receipt, CreditCard, Wallet, TrendingDown, Percent, Landmark, PiggyBank,
Zap, ShoppingBag, Wrench, Boxes, Inbox, ListChecks, ShieldCheck, Timer, Coins, UserRoundCheck, BellRing, ClipboardCheck
  } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line
} from 'recharts';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toTimeInput = (v?: string | null) => {
  if (!v) return '';
  const m = String(v).match(/(\d{1,2}):(\d{2})/);
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : '';
};
const orgId = () => {
  if (typeof window === 'undefined') return '';
  try {
    const s = auth.getSession();
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

function TrendPill({ value }: { value: any }) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  const up = n >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${up ? 'bg-emerald-400/20 text-emerald-200' : 'bg-rose-400/20 text-rose-200'}`}>
      {up ? '▲' : '▼'} {Math.abs(n)}
    </span>
  );
}

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
    'not marked': { label: 'Not Marked', cls: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
    pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
    approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
    verified: { label: 'Verified', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    uploaded: { label: 'Uploaded', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
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

function AnimatedNumber({ value, decimals = 0, className = '' }: { value: number; decimals?: number; className?: string }) {
  const mv = useMotionValue(0);
  const [text, setText] = useState('0');
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.8, ease: 'easeOut', onUpdate: v => setText(v.toFixed(decimals)) });
    return () => controls.stop();
  }, [value, decimals, mv]);
  return <span className={className}>{text}</span>;
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

function QuickActionBtn({ icon: Icon, label, onClick, variant = 'default', disabled = false }: { icon: any; label: string; onClick?: () => void; variant?: 'default' | 'primary'; disabled?: boolean }) {
  if (variant === 'primary') {
    return (
      <motion.button whileHover={disabled ? undefined : { scale: 1.02 }} whileTap={disabled ? undefined : { scale: 0.98 }}
        onClick={onClick} disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all ${disabled ? 'opacity-50 cursor-not-allowed shadow-none' : ''}`}>
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

function SimpleStaffForm({ onDone }: { onDone: () => void }) {
  const f = useForm({
    full_name: '', role: 'teacher', phone: '', email: '', password: '',
    employee_id: '', department: '', designation: '', employment_type: 'Full-time',
    date_of_birth: '', joining_date: '', gender: '', address: '', city: '', state: '',
    country: '', postal_code: '', qualification: '', experience_years: '',
    reporting_manager: '', subject: '',
  });
  const [creating, setCreating] = useState(false);
  const [ro, setRo] = useState(true);
  const [customRole, setCustomRole] = useState('');

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#6D4CFF] focus:ring-3 focus:ring-[rgba(109,76,255,0.1)]";
  const isTeacher = f.values.role === 'teacher';
  const finalRole = f.values.role === 'other' ? customRole.trim() : f.values.role;

  return (
    <form autoComplete="off" onSubmit={e => e.preventDefault()} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">Full Name <span className="text-red-500">*</span></label>
        <input type="text" placeholder="Jane Smith" value={f.values.full_name} onChange={e => f.handleChange('full_name', e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">Role <span className="text-red-500">*</span></label>
        <select value={f.values.role} onChange={e => { f.handleChange('role', e.target.value); if (e.target.value !== 'others') setCustomRole(''); }} className={`${inputCls} bg-white`}>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
          <option value="accountant">Accountant</option>
          <option value="librarian">Librarian</option>
          <option value="transport_manager">Transport Manager</option>
          <option value="hostel_warden">Hostel Warden</option>
          <option value="staff">Staff</option>
          <option value="driver">Driver</option>
          <option value="counsellor">Counsellor</option>
          <option value="others">Others</option>
        </select>
        {f.values.role === 'others' && (
          <input type="text" placeholder="Enter custom role (e.g. Sports Coach)" value={customRole} onChange={e => setCustomRole(e.target.value)} className={`${inputCls} mt-2`} />
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Employee ID</label>
          <input type="text" placeholder="EMP001" value={f.values.employee_id} onChange={e => f.handleChange('employee_id', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Phone</label>
          <input type="tel" placeholder="9876543210" value={f.values.phone} onChange={e => f.handleChange('phone', e.target.value)} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Login Email <span className="text-gray-400 font-normal">(auto)</span></label>
          <input type="email" autoComplete="off" readOnly={ro} onFocus={() => setRo(false)} placeholder="jane.smith@school.edu" value={f.values.email} onChange={e => f.handleChange('email', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Login Password <span className="text-gray-400 font-normal">(auto)</span></label>
          <input type="password" autoComplete="new-password" readOnly={ro} onFocus={() => setRo(false)} placeholder="Auto-generated" value={f.values.password} onChange={e => f.handleChange('password', e.target.value)} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Department</label>
          <input type="text" placeholder="Science" value={f.values.department} onChange={e => f.handleChange('department', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Designation</label>
          <input type="text" placeholder="Physics Teacher" value={f.values.designation} onChange={e => f.handleChange('designation', e.target.value)} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Date of Birth</label>
          <input type="date" value={f.values.date_of_birth} onChange={e => f.handleChange('date_of_birth', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Gender</label>
          <select value={f.values.gender} onChange={e => f.handleChange('gender', e.target.value)} className={`${inputCls} bg-white`}>
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Date of Join</label>
          <input type="date" value={f.values.joining_date} onChange={e => f.handleChange('joining_date', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Employment Type</label>
          <select value={f.values.employment_type} onChange={e => f.handleChange('employment_type', e.target.value)} className={`${inputCls} bg-white`}>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Temporary">Temporary</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Qualification</label>
          <input type="text" placeholder="M.Sc Physics, B.Ed" value={f.values.qualification} onChange={e => f.handleChange('qualification', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Experience (years)</label>
          <input type="number" min="0" placeholder="5" value={f.values.experience_years} onChange={e => f.handleChange('experience_years', e.target.value)} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Reporting Manager</label>
          <input type="text" placeholder="Dr. Kumar" value={f.values.reporting_manager} onChange={e => f.handleChange('reporting_manager', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Address</label>
          <input type="text" placeholder="123 Main St" value={f.values.address} onChange={e => f.handleChange('address', e.target.value)} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">City</label>
          <input type="text" placeholder="Mumbai" value={f.values.city} onChange={e => f.handleChange('city', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">State</label>
          <input type="text" placeholder="Maharashtra" value={f.values.state} onChange={e => f.handleChange('state', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Postal Code</label>
          <input type="text" placeholder="400001" value={f.values.postal_code} onChange={e => f.handleChange('postal_code', e.target.value)} className={inputCls} />
        </div>
      </div>
      {isTeacher && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Teaching Details</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Subject Specialization</label>
            <input type="text" placeholder="Physics" value={f.values.subject} onChange={e => f.handleChange('subject', e.target.value)} className={inputCls} />
          </div>
        </div>
      )}
      <button type="button" onClick={async () => {
        if (creating) return;
        if (!f.values.full_name) { toast.error('Full Name is required'); return; }
        if (f.values.role === 'other' && !customRole.trim()) { toast.error('Please enter the custom role'); return; }
        setCreating(true);
        try {
          const res = await staffApi.create({ ...f.values, role: finalRole });
          if (!res.success) { toast.error(res.error || 'Failed to create staff'); return; }
          const creds = res.data?.credentials || {};
          toast.success(`Staff created — Email: ${creds.email || f.values.email || res.data?.user?.email}`);
          onDone();
        } catch (err: any) { toast.error(err.message); } finally { setCreating(false); }
      }} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-sm font-semibold hover:shadow-lg disabled:opacity-50">
        {creating ? 'Creating...' : 'Create Staff Member'}
      </button>
    </form>
  );
}

const ANALYTICS_COLORS = ['#6D4CFF', '#8B5CF6', '#A855F7', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#14B8A6', '#EC4899', '#F97316'];

function DashboardInsights({ analytics, loading, onRetry }: { analytics: any; loading?: boolean; onRetry?: () => void }) {
  const a = analytics || {};
  const trend: any[] = Array.isArray(a.attendanceTrend) ? a.attendanceTrend : [];
  const depts: any[] = Array.isArray(a.departmentDistribution) ? a.departmentDistribution : [];

  return (
    <div className="mb-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <GlassCard className="p-5">
          <SectionHeader title="Attendance Trend" subtitle={`Staff attendance · last ${trend.length} days`} />
          {loading ? (
            <div className="h-56 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
          ) : trend.length > 0 && trend.some((t: any) => t.total > 0) ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="attPresent" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22C55E" stopOpacity={0.35} /><stop offset="95%" stopColor="#22C55E" stopOpacity={0} /></linearGradient>
                    <linearGradient id="attAbsent" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.35} /><stop offset="95%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={trend.length > 14 ? 1 : 0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 9 }} width={24} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="Present" stroke="#22C55E" strokeWidth={2} fill="url(#attPresent)" />
                  <Area type="monotone" dataKey="Absent" stroke="#EF4444" strokeWidth={2} fill="url(#attAbsent)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message="No attendance records in the selected period yet." />
          )}
        </GlassCard>

        {/* Department Distribution */}
        <GlassCard className="p-5">
          <SectionHeader title="Department Distribution" subtitle="Staff by department" />
          {loading ? (
            <div className="h-56 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
          ) : depts.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={depts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 9 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={92} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {depts.map((_, i) => <Cell key={i} fill={ANALYTICS_COLORS[i % ANALYTICS_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message="No department data available." />
          )}
        </GlassCard>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function StaffWorkspace({ staffList, initialTab, onTabChange }: { staffList: any; initialTab?: string; onTabChange?: (tab: string) => void }) {
  const router = useRouter();
  const { t, ui } = useLanguage();
  const [activeTab, setActiveTab] = useState(initialTab || 'dashboard');
  const [sortField, setSortField] = useState('full_name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showAssignWork, setShowAssignWork] = useState(false);
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<string, string>>({});
  const [attendanceCheckIns, setAttendanceCheckIns] = useState<Record<string, string>>({});
  const [editAttRecord, setEditAttRecord] = useState<any>(null);
  const [editAttForm, setEditAttForm] = useState<any>({});
  const [editAttSaving, setEditAttSaving] = useState(false);
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
  const [deletingStaff, setDeletingStaff] = useState<string | null>(null);

  // ==================== DATA FETCHING ====================
  const staffData = useApi(() => staffApi.getAll(), []);
  const dashboardAnalytics = useApi(() => staffAttendanceApi.getDashboardAnalytics(14), []);
  const attHistory = useApi(() => staffAttendanceApi.getDashboardAnalytics(60), []);
  const entAnalytics = useApi(() => enterpriseStaffApi.getStaffAnalytics(), []);
  const entDeptAnalytics = useApi(() => enterpriseStaffApi.getDepartmentAnalytics(), []);
  const entRoleAnalytics = useApi(() => enterpriseStaffApi.getRoleAnalytics(), []);
  const entAttrition = useApi(() => enterpriseStaffApi.getAttritionAnalytics(), []);
  const entWorkload = useApi(() => enterpriseStaffApi.getWorkloadDistribution(), []);

  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [workAssignments, setWorkAssignments] = useState<any[]>([]);
  const [academicAssignments, setAcademicAssignments] = useState<any[]>([]);
  const [workloadDistribution, setWorkloadDistribution] = useState<any[]>([]);
  const [attendanceAnalytics, setAttendanceAnalytics] = useState<any>({});
  const [leaveAnalytics, setLeaveAnalytics] = useState<any>({});

  // ==================== ASSIGNMENTS MODULE STATE ====================
  const [assignForm, setAssignForm] = useState<any>({});
  const [assignSaving, setAssignSaving] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [assignFilter, setAssignFilter] = useState('ALL');
  const [assignSearch, setAssignSearch] = useState('');

  // ==================== ACADEMIC MODULE STATE ====================
  const [academicRows, setAcademicRows] = useState<any[]>([]);
  const [academicLoading, setAcademicLoading] = useState(false);
  const [acadFilter, setAcadFilter] = useState('ALL');
  const [acadSearch, setAcadSearch] = useState('');
  const [showAssignAcademic, setShowAssignAcademic] = useState(false);
  const [editingAcad, setEditingAcad] = useState<any>(null);
  const [acadForm, setAcadForm] = useState<any>({});
  const [acadSaving, setAcadSaving] = useState(false);

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

  const staffGrowth = useMemo(() => {
    const months: { month: string; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en', { month: 'short' });
      months.push({ month: label, count: staffArray.filter((s: any) => (s.joining_date || '').startsWith(key)).length });
    }
    return months;
  }, [staffArray]);

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

  // ==================== LOAD ASSIGNMENTS / TASKS (staff_tasks) ====================
  const loadTasks = useCallback(async () => {
    const res = await staffApi.getAllTasks();
    if (res.success && Array.isArray(res.data)) setTasks(res.data);
  }, []);
  useEffect(() => { loadTasks(); }, [loadTasks]);

  // ==================== LOAD ACADEMIC ASSIGNMENTS (class_subject_teacher_map) ====================
  const loadAcademic = useCallback(async () => {
    setAcademicLoading(true);
    const res = await academicMgmtApi.getTeacherAssignments();
    const rows = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
    setAcademicRows(rows);
    setAcademicLoading(false);
  }, []);
  useEffect(() => { loadAcademic(); }, [loadAcademic]);

  // ==================== LOAD LEAVE REQUESTS (staff_leave_requests) ====================
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveFilter, setLeaveFilter] = useState('ALL');
  const [leaveSearch, setLeaveSearch] = useState('');
  const [leaveProcessing, setLeaveProcessing] = useState<string | null>(null);
  const loadLeaves = useCallback(async () => {
    setLeaveLoading(true);
    const res: any = await staffApi.getAllLeaves();
    const rows = Array.isArray(res?.data) ? res.data : [];
    setLeaves(rows);
    const by_type: Record<string, number> = {};
    rows.forEach((l: any) => { const k = l.leave_type || 'Other'; by_type[k] = (by_type[k] || 0) + 1; });
    setLeaveAnalytics({
      data: {
        total_requests: rows.length,
        total: rows.length,
        approved: rows.filter((l: any) => l.status === 'APPROVED').length,
        pending: rows.filter((l: any) => l.status === 'PENDING').length,
        rejected: rows.filter((l: any) => l.status === 'REJECTED').length,
        by_type,
      }
    });
    setLeaveLoading(false);
  }, []);
  useEffect(() => { loadLeaves(); }, [loadLeaves]);

  // ==================== LOAD PERFORMANCE (staff_performance) ====================
  const [perfLoading, setPerfLoading] = useState(false);
  const loadPerformance = useCallback(async () => {
    setPerfLoading(true);
    const res: any = await staffApi.getAllPerformance();
    setPerformanceData(Array.isArray(res?.data) ? res.data : []);
    setPerfLoading(false);
  }, []);
  useEffect(() => { loadPerformance(); }, [loadPerformance]);

  // ==================== LOAD DOCUMENTS (staff_documents, org-wide) ====================
  const [docsLoading, setDocsLoading] = useState(false);
  const [docFilter, setDocFilter] = useState('ALL');
  const [docSearch, setDocSearch] = useState('');
  const loadDocuments = useCallback(async () => {
    setDocsLoading(true);
    const res: any = await staffApi.getAllDocuments();
    setStaffDocs(Array.isArray(res?.data) ? res.data : []);
    setDocsLoading(false);
  }, []);
  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const updateLeaveStatus = useCallback(async (id: string, status: string) => {
    setLeaveProcessing(id);
    try {
      const res: any = await staffApi.updateLeaveStatus(id, status);
      if (res?.success) {
        setLeaves(prev => prev.map((l: any) => l.id === id ? { ...l, status, approved_at: status === 'APPROVED' ? new Date().toISOString() : l.approved_at } : l));
        toast.success(status === 'APPROVED' ? 'Leave approved' : status === 'REJECTED' ? 'Leave rejected' : 'Leave cancelled');
      } else {
        toast.error(res?.error || 'Failed to update leave');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update leave');
    } finally {
      setLeaveProcessing(null);
    }
  }, []);

  // ==================== NAV ITEMS ====================
  const NAV_ITEMS = [
    { key: 'dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { key: 'directory', icon: Users, label: t('nav.directory') },
    { key: 'attendance', icon: ClipboardList, label: t('nav.attendance') },
    { key: 'assignments', icon: Briefcase, label: t('nav.assignments') },
    { key: 'academic', icon: BookOpen, label: t('nav.academic') },
    { key: 'timetable', icon: CalendarDays, label: t('nav.timetable') },
    { key: 'leave', icon: Calendar, label: t('nav.leave') },
    { key: 'performance', icon: TrendingUp, label: t('nav.performance') },
    { key: 'documents', icon: FileText, label: t('nav.documents') },
    { key: 'communication', icon: MessageSquare, label: t('nav.communication') },
    { key: 'salary', icon: Banknote, label: t('nav.salary') },
    { key: 'expenses', icon: Receipt, label: t('nav.expenses') },
    { key: 'approvals', icon: ShieldCheck, label: t('nav.approvals') },
    { key: 'analytics', icon: BarChart3, label: t('nav.analytics') },
    { key: 'settings', icon: Settings, label: t('nav.settings') },
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
  const [attView, setAttView] = useState<'daily' | 'monthly' | 'heatmap' | 'analytics'>('daily');
  const [monthlyData, setMonthlyData] = useState<any>({ records: [], departments: [], avgRate: 0, totalMarked: 0 });
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  // ==================== FETCH ATTENDANCE ====================
  useEffect(() => {
    if (!attDate) return;
    staffAttendanceApi.getAll(attDate).then((res: any) => {
      const records = (Array.isArray(res) ? res : (res?.data || [])).map((r: any) => ({ ...r, status: (r.status || '').toLowerCase() }));
      setAttendanceData(records);
    }).catch(() => setAttendanceData([]));
  }, [attDate]);

  // ==================== FETCH MONTHLY ATTENDANCE SUMMARY ====================
  useEffect(() => {
    if (!attDate) return;
    const month = attDate.slice(0, 7);
    setMonthlyLoading(true);
    staffAttendanceApi.getMonthly(month).then((res: any) => {
      const data = (Array.isArray(res) ? {} : (res?.data || {}));
      setMonthlyData({ records: data.records || [], departments: data.departments || [], avgRate: data.avgRate || 0, totalMarked: data.totalMarked || 0 });
    }).catch(() => setMonthlyData({ records: [], departments: [], avgRate: 0, totalMarked: 0 })).finally(() => setMonthlyLoading(false));
  }, [attDate]);

  const [commMsg, setCommMsg] = useState('');
  const [commTitle, setCommTitle] = useState('');
  const [commAudience, setCommAudience] = useState('All Staff');
  const [commMode, setCommMode] = useState<'group' | 'individual'>('group');
  const [commIndividual, setCommIndividual] = useState('');
  const [commDraftPrompt, setCommDraftPrompt] = useState('');
  const [commDrafting, setCommDrafting] = useState(false);
  const [commSending, setCommSending] = useState(false);
  const [commLoading, setCommLoading] = useState(false);

  // ==================== SETTINGS STATE ====================
  const [settingsTab, setSettingsTab] = useState('general');
  const [settings, setSettings] = useState<any>(() => {
    if (typeof window === 'undefined') return {};
    try { const s = localStorage.getItem('staffSettings'); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const updateSetting = useCallback((key: string, value: any) => {
    setSettings((p: any) => {
      const next = { ...p, [key]: value };
      try { localStorage.setItem('staffSettings', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  // ==================== SALARY / EXPENSES (real DB data) ====================
  const EXPENSE_CATS = ['Operations', 'Transport', 'Supplies', 'Utilities', 'Maintenance', 'Welfare'];
  const salaryList = useApi(() => payrollApiV2.getEmployeeSalaries(), []);
  const payrollAnalytics = useApi(() => payrollApiV2.getAnalytics(), []);
  const orgPayslips = useApi(() => staffApi.getOrgPayslips(), []);
  const orgSalaries = useApi(() => staffApi.getOrgSalaries(), []);
  const expData = useApi(() => staffExpensesApi.getExpenses(), []);
  const expSummary = useApi(() => staffExpensesApi.getSummary(), []);
  const [expModal, setExpModal] = useState(false);
  const [expSaving, setExpSaving] = useState(false);
  const [expForm, setExpForm] = useState<any>({ category: 'Operations', item: '', amount: '', date: new Date().toISOString().slice(0, 10), status: 'pending', notes: '', staff_id: '' });
  const [expFilter, setExpFilter] = useState('all');
  const [expCatFilter, setExpCatFilter] = useState('all');

  // ==================== SALARY MANAGEMENT (components + payslip generation) ====================
  const [salaryModal, setSalaryModal] = useState(false);
  const [salarySaving, setSalarySaving] = useState(false);
  const [salaryForm, setSalaryForm] = useState<any>({
    staff_id: '', base_salary: '', pay_frequency: 'MONTHLY',
    allowances: '', deductions: '', components: [{ label: '', amount: '' }],
  });
  const [payslipModal, setPayslipModal] = useState(false);
  const [payslipSaving, setPayslipSaving] = useState(false);
  const [payslipForm, setPayslipForm] = useState<any>({
    staff_id: '', month: new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase(), year: new Date().getFullYear(),
    gross_pay: '', deductions: '', payment_method: 'BANK',
  });
  const [payoutMonth, setPayoutMonth] = useState('');
  const [salaryTab, setSalaryTab] = useState<'overview' | 'add' | 'payslip' | 'register' | 'history'>('overview');
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [histYear, setHistYear] = useState<string>('all');
  const [histMonth, setHistMonth] = useState<string>('all');
  const [histDept, setHistDept] = useState<string>('all');
  const [histPay, setHistPay] = useState<string>('all');
  const [histStatus, setHistStatus] = useState<string>('all');
  const [histSearch, setHistSearch] = useState('');

  // ==================== APPROVALS (unified queue: leave + expense approvals) ====================
  const [apprType, setApprType] = useState<'all' | 'leave' | 'expense'>('all');
  const [apprStatus, setApprStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [apprSearch, setApprSearch] = useState('');
  const [apprProcessing, setApprProcessing] = useState<string | null>(null);

  const actOnApproval = async (item: any, action: 'approve' | 'reject') => {
    setApprProcessing(item.id);
    try {
      if (item.type === 'leave') {
        await updateLeaveStatus(item.id, action === 'approve' ? 'APPROVED' : 'REJECTED');
      } else {
        await approveExpense(item.id, action === 'approve' ? 'approved' : 'rejected');
      }
    } finally {
      setApprProcessing(null);
    }
  };

  const refreshApprovals = () => {
    loadLeaves();
    expData.refetch();
    expSummary.refetch();
  };

  const addExpense = async () => {
    if (!expForm.item?.trim() || !expForm.amount) { toast.error('Please fill item and amount'); return; }
    setExpSaving(true);
    try {
      const r: any = await staffExpensesApi.createExpense({
        category: expForm.category, item: expForm.item.trim(), amount: Number(expForm.amount),
        date: expForm.date, status: expForm.status, notes: expForm.notes, staff_id: expForm.staff_id || null,
      });
      if (r?.success) {
        toast.success('Expense saved to database');
        setExpModal(false);
        setExpForm({ category: 'Operations', item: '', amount: '', date: new Date().toISOString().slice(0, 10), status: 'pending', notes: '', staff_id: '' });
        expData.refetch(); expSummary.refetch();
      } else {
        toast.error(r?.error || 'Failed to save expense');
      }
    } catch (e: any) { toast.error(e?.message || 'Failed to save expense'); }
    finally { setExpSaving(false); }
  };

  const approveExpense = async (id: string, status: string, label = 'this expense') => {
    const action = status === 'approved' ? 'approve' : 'reject';
    if (!window.confirm(`You are about to ${action} ${label}. Continue?`)) return;
    if (!window.confirm(`Are you absolutely sure you want to ${action} ${label}? This will update its status permanently and cannot be undone.`)) return;
    try {
      const r: any = await staffExpensesApi.updateExpense(id, { status });
      if (r?.success) { toast.success(`Expense ${status === 'approved' ? 'approved' : 'rejected'}`); expData.refetch(); expSummary.refetch(); }
      else toast.error(r?.error || 'Update failed');
    } catch (e: any) { toast.error(e?.message || 'Update failed'); }
  };

  const deleteExpense = async (id: string, label = 'this expense') => {
    if (!window.confirm(`Delete ${label} permanently?`)) return;
    if (!window.confirm(`Final confirmation: this will permanently delete ${label} and it cannot be recovered. Continue?`)) return;
    try {
      const r: any = await staffExpensesApi.deleteExpense(id);
      if (r?.success) { toast.success('Expense deleted'); expData.refetch(); expSummary.refetch(); }
      else toast.error(r?.error || 'Delete failed');
    } catch (e: any) { toast.error(e?.message || 'Delete failed'); }
  };

  // ==================== FETCH SCHEDULES / DOCUMENTS / ANNOUNCEMENTS ====================
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [staffDocs, setStaffDocs] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<any[]>([]);
  const [timetableTeachers, setTimetableTeachers] = useState<any[]>([]);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [scheduleTeacher, setScheduleTeacher] = useState('all');
  const [scheduleSearch, setScheduleSearch] = useState('');

  const loadTimetable = useCallback(async () => {
    setTimetableLoading(true);
    try {
      const res: any = await timetableApi.getStaffOverview();
      const d = res?.data;
      setTimetableEntries(Array.isArray(d?.entries) ? d.entries : []);
      setTimetableTeachers(Array.isArray(d?.teachers) ? d.teachers : []);
    } catch {
      setTimetableEntries([]);
      setTimetableTeachers([]);
    } finally {
      setTimetableLoading(false);
    }
  }, []);
  useEffect(() => { loadTimetable(); }, [loadTimetable]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(staffArray.map((m: any) => staffApi.getSchedules(m.id || m.teacher_id).then((r: any) => r.data || []).catch(() => [])))
      .then(results => { if (!cancelled) setAllSchedules(results.flat()); });
    announcementApi.getAll().then((r: any) => { if (!cancelled && r.success && Array.isArray(r.data)) setAnnouncements(r.data); }).catch(() => {});
    return () => { cancelled = true; };
  }, [staffArray.length]);

  // ==================== LOAD ANNOUNCEMENTS ====================
  const loadAnnouncements = useCallback(async () => {
    setCommLoading(true);
    const r: any = await announcementApi.getAll();
    if (r?.success && Array.isArray(r.data)) setAnnouncements(r.data);
    setCommLoading(false);
  }, []);
  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

  const sendBroadcast = useCallback(async () => {
    if (!commTitle.trim() && !commMsg.trim()) return;
    setCommSending(true);
    try {
      const member = commMode === 'individual' ? staffArray.find((m: any) => (m.id || m.staff_id || m.teacher_id) === commIndividual) : null;
      const target = commMode === 'individual'
        ? `Individual: ${member?.full_name || member?.name || 'Staff Member'}`
        : commAudience;
      const res: any = await announcementApi.create({
        title: commTitle.trim() || commMsg.trim().slice(0, 60),
        content: commMsg.trim(),
        target_role: target,
      });
      if (res?.success) {
        toast.success(commMode === 'individual' ? `Message sent to ${target}` : 'Broadcast sent to staff');
        setCommMsg(''); setCommTitle('');
        if (commMode === 'individual') setCommIndividual('');
        loadAnnouncements();
      } else {
        toast.error(res?.error || 'Failed to send');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to send');
    } finally {
      setCommSending(false);
    }
  }, [commTitle, commMsg, commAudience, commMode, commIndividual, loadAnnouncements]);

  const aisDraftBroadcast = useCallback(async () => {
    if (!commDraftPrompt.trim()) { toast.error('Describe what you want to announce first'); return; }
    setCommDrafting(true);
    try {
      const r: any = await announcementApi.draft({
        topic: commDraftPrompt.trim(),
        audience: commMode === 'individual' ? (staffArray.find((m: any) => (m.id || m.staff_id || m.teacher_id) === commIndividual)?.full_name || commAudience) : commAudience,
      });
      const d: any = r?.data || r;
      if (d?.success || r?.success) {
        setCommTitle(d.title || '');
        setCommMsg(d.content || '');
        toast.success('AI drafted your announcement — review and edit before sending');
      } else {
        toast.error(r?.error || 'AI draft failed');
      }
    } catch (e: any) {
      toast.error(e?.message || 'AI draft failed');
    } finally {
      setCommDrafting(false);
    }
  }, [commDraftPrompt, commMode, commIndividual, staffArray]);

  // ==================== STAFF ID HELPER & EXPORT ====================
  const staffIdOf = (m: any) => m?.employee_id || m?.staff_unique_id || (m?.id && UUID_RE.test(m.id) ? m.id.slice(0, 8) : '');

  const exportStaffCSV = () => {
    const rows = filteredStaff.map((m: any) => ({
      'Staff ID': staffIdOf(m),
      'Full Name': m.full_name || m.name || '',
      'Role': m.role || '',
      'Department': m.department || m.department_name || '',
      'Designation': m.designation || '',
      'Phone': m.phone || '',
      'Email': m.email || '',
      'Status': m.status || '',
    }));
    if (rows.length === 0) { toast.warning('No staff to export'); return; }
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'staff-directory.csv'; link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} staff records`);
  };

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

  const handleDeleteStaff = async (member: any) => {
    const id = member.id || member.staff_id;
    if (!id) { toast.error('Cannot delete: missing staff ID'); return; }
    if (!window.confirm(`Delete ${member.full_name || member.name || 'this staff member'}? This cannot be undone.`)) return;
    setDeletingStaff(id);
    try {
      const res = await staffApi.delete(id);
      if (res.success) { toast.success(`${member.full_name || 'Staff member'} deleted`); staffData.refetch?.(); }
      else toast.error(res.error || 'Failed to delete staff');
    } catch (err: any) { toast.error(err.message); } finally { setDeletingStaff(null); }
  };

  // ==================== RENDER: HEADER ====================
  const renderHeader = () => (
    <ModuleHeader
      icon={Users}
      gradient="bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6]"
      title={t('nav.staffLabel')}
      subtitle="Manage workforce, assignments, attendance, performance, and communication."
      onRefresh={() => { staffData.refetch?.(); dashboardAnalytics.refetch?.(); }}
    />
  );

  // ==================== RENDER: DASHBOARD TAB ====================
  const analytics = dashboardAnalytics.data?.data || dashboardAnalytics.data || {};
  const renderDashboard = () => {
    const aiTrend = Array.isArray(analytics.attendanceTrend) ? analytics.attendanceTrend : [];
    const lastT = aiTrend[aiTrend.length - 1] || {};
    const presentToday = analytics.presentToday ?? attendanceData.filter((a: any) => a.status === 'present').length;
    const absentToday = analytics.absentToday ?? attendanceData.filter((a: any) => a.status === 'absent' || a.status === 'late').length;
    const onLeaveToday = attendanceData.length > 0 ? attendanceData.filter((a: any) => a.status === 'leave' || a.status === 'on leave').length : stats.onLeave;
    const totalStaff = (analytics.totalStaff ?? staffArray.length) || 1;
    const presentPct = analytics.todayRate != null ? Number(analytics.todayRate) : Math.round((presentToday / Math.max(1, totalStaff)) * 100);
    const activePct = Math.round((stats.active / Math.max(1, totalStaff)) * 100);
    const teachingPct = Math.round((stats.teaching / Math.max(1, totalStaff)) * 100);
    const leavePct = Math.round((onLeaveToday / Math.max(1, totalStaff)) * 100);
    const healthScore = Math.min(100, Math.max(0, Math.round(presentPct * 0.5 + activePct * 0.3 + (100 - leavePct) * 0.2)));
    const scoreColor = healthScore >= 80 ? '#34D399' : healthScore >= 55 ? '#FBBF24' : '#F87171';
    const aiForecast = analytics.weekRate != null ? Number(analytics.weekRate) : null;
    const probationCount = staffArray.filter((s: any) => (s.status || '').toLowerCase() === 'probation').length;

    const spark = (vals: any[]) => {
      const nums = (vals || []).map((v: any) => Number(v) || 0);
      const max = Math.max(1, ...nums);
      const w = 64, h = 28, step = w / Math.max(1, nums.length - 1);
      return nums.map((v, i) => `${i * step},${h - (v / max) * h}`).join(' ');
    };
    const presentSpark = aiTrend.slice(-7).map((t: any) => t.Present);
    const absentSpark = aiTrend.slice(-7).map((t: any) => t.Absent);

    const aiMetrics = [
      { label: 'Attendance Today', value: presentPct, suffix: '%', trend: null, spark: presentSpark, color: '#34D399' },
      { label: '7-Day Forecast', value: aiForecast, suffix: aiForecast != null ? '%' : '', trend: null, spark: presentSpark, color: '#60A5FA' },
      { label: 'Active Rate', value: activePct, suffix: '%', trend: null, spark: presentSpark, color: '#A78BFA' },
      { label: 'Teaching Load', value: teachingPct, suffix: '%', trend: null, spark: presentSpark, color: '#F472B6' },
      { label: 'Absent + Late', value: absentToday, suffix: '', trend: null, spark: absentSpark, color: '#F87171' },
      { label: 'On Leave', value: onLeaveToday, suffix: '', trend: null, spark: absentSpark, color: '#FBBF24' },
    ];

    const recs: { icon: any; text: string }[] = [];
    if (absentToday > 0) recs.push({ icon: AlertTriangle, text: `${absentToday} staff absent/late today — follow up and mark attendance` });
    if (onLeaveToday > 0) recs.push({ icon: Calendar, text: `${onLeaveToday} staff on leave — arrange class coverage` });
    if (probationCount > 0) recs.push({ icon: Target, text: `${probationCount} staff on probation — schedule onboarding reviews` });
    if (!recs.length) recs.push({ icon: BadgeCheck, text: 'Workforce health looks good — no critical flags' });

    return (
    <div>
      {/* AI Workforce Intelligence hero */}
      <div className="rounded-2xl overflow-hidden text-white p-6 relative anim-gradient anim-fade-up delay-1 mb-6"
        style={{ background: 'linear-gradient(-45deg, #6D4CFF 0%, #8B5CF6 35%, #3B82F6 65%, #0F172A 100%)', backgroundSize: '220% 220%' }}>
        <div className="absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl anim-float" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-[#3B82F6]/30 blur-2xl anim-pulse-glow" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-[#22D3EE]/20 blur-3xl anim-float" style={{ animationDelay: '1.5s' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Brain size={16} className="anim-pulse-glow" />
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90">AI Workforce Intelligence</span>
          </div>
          <h3 className="text-xl font-extrabold mb-4">Staff Predictive Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {aiMetrics.map((c, i) => (
              <div key={c.label} className="rounded-xl bg-white/10 p-3 backdrop-blur-sm border border-white/10 anim-fade-up hover:bg-white/20 hover:-translate-y-0.5 transition-all" style={{ animationDelay: `${0.15 * i}s` }}>
                <div className="text-[9px] uppercase tracking-wider opacity-75">{c.label}</div>
                <div className="text-lg font-extrabold mt-0.5 tabular-nums"><AnimatedValue value={c.value} suffix={c.suffix} /> <TrendPill value={c.trend} /></div>
                {c.spark.length > 1 && (
                  <svg width="64" height="28" viewBox="0 0 64 28" className="mt-1.5 opacity-80">
                    <polyline points={spark(c.spark)} fill="none" stroke={c.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
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
                Workforce health <strong className="text-white">{healthScore}/100</strong> · {presentToday}/{totalStaff} present today · {stats.teaching} teaching, {stats.nonTeaching} non-teaching staff.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-4">
            {recs.map((r, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-semibold text-white/90 anim-fade-up" style={{ animationDelay: `${0.1 * i}s` }}>
                <r.icon size={12} /> {r.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      <DashboardInsights analytics={analytics} loading={dashboardAnalytics.loading} onRetry={dashboardAnalytics.refetch} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard className="p-5 lg:col-span-2">
          <SectionHeader title="Staff Growth" subtitle="Monthly hiring trend (last 6 months)" />
          {staffGrowth.some((g: any) => g.count > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={staffGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#999" />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="#999" />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#6D4CFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-xs text-gray-400">No hiring data for the last 6 months</div>
          )}
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <SectionHeader title="Quick Insights" subtitle="Items needing attention" />
          <div className="space-y-3">
            {[
              { icon: AlertTriangle, label: 'Staff needing attention', value: staffArray.filter((s: any) => s.status === 'probation' || s.status === 'inactive').length, color: '#F59E0B' },
              { icon: FileText, label: 'Inactive staff', value: staffArray.filter((s: any) => (s.status || '').toLowerCase() === 'inactive').length, color: '#EF4444' },
              { icon: Clock, label: 'On leave today', value: (() => { const fromAtt = attendanceData.filter((a: any) => a.status === 'leave' || a.status === 'on leave').length; if (fromAtt > 0 || attendanceData.length > 0) return fromAtt; const t = Array.isArray(analytics.attendanceTrend) ? analytics.attendanceTrend : []; const last = t[t.length - 1]; return last ? (last.Leave ?? last['On Leave'] ?? 0) : staffArray.filter((s: any) => (s.status || '').toLowerCase() === 'on leave').length; })(), color: '#3B82F6' },
              { icon: Calendar, label: 'Upcoming birthdays', value: staffArray.filter((s: any) => {
                if (!s.date_of_birth) return false;
                const [m, d] = s.date_of_birth.split('-').slice(1);
                const now = new Date();
                return parseInt(m) === now.getMonth() + 1 && parseInt(d) >= now.getDate() && parseInt(d) <= now.getDate() + 7;
              }).length, color: '#EC4899' },
              { icon: Briefcase, label: 'New this year', value: staffArray.filter((s: any) => (s.joining_date || '').startsWith(new Date().getFullYear().toString())).length, color: '#14B8A6' },
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
                { label: t('mod.present'), value: attendanceData.filter((a: any) => a.status === 'present').length, color: '#22C55E', pct: attendanceData.length ? Math.round(attendanceData.filter((a: any) => a.status === 'present').length / attendanceData.length * 100) : 0 },
                { label: t('mod.absent'), value: attendanceData.filter((a: any) => a.status === 'absent').length, color: '#EF4444', pct: attendanceData.length ? Math.round(attendanceData.filter((a: any) => a.status === 'absent').length / attendanceData.length * 100) : 0 },
                { label: t('mod.late'), value: attendanceData.filter((a: any) => a.status === 'late').length, color: '#F59E0B', pct: attendanceData.length ? Math.round(attendanceData.filter((a: any) => a.status === 'late').length / attendanceData.length * 100) : 0 },
                { label: t('mod.onLeave'), value: attendanceData.filter((a: any) => a.status === 'leave' || a.status === 'on leave').length, color: '#3B82F6', pct: attendanceData.length ? Math.round(attendanceData.filter((a: any) => a.status === 'leave' || a.status === 'on leave').length / attendanceData.length * 100) : 0 },
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

      {/* Quick access */}
      <div className="anim-fade-up delay-2">
        <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-1.5"><LayoutDashboard className="w-4 h-4 text-[#6D4CFF]" /> Quick Access</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {NAV_ITEMS.filter(n => n.key !== 'dashboard').map((n, i) => (
            <button key={n.key} onClick={() => { setActiveTab(n.key); onTabChange?.(n.key); }}
              className="group p-3 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 shadow-sm flex items-center gap-2.5 hover:shadow-lg hover:-translate-y-0.5 hover:border-[#6D4CFF]/40 transition-all text-left anim-fade-up"
              style={{ animationDelay: `${0.05 * i}s` }}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"><n.icon size={14} /></div>
              <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 group-hover:text-[#6D4CFF] transition-colors">{n.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
    );
  };

  // ==================== RENDER: DIRECTORY TAB ====================
  const renderDirectory = () => (
    <div>
      <ModuleHeader
        icon={Users}
        gradient="bg-gradient-to-br from-[#3B82F6] to-[#06B6D4]"
        title="Staff Directory"
        subtitle="Manage staff profiles, roles, and contact details"
        onRefresh={() => staffData.refetch?.()}
      />
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
        <div className="flex items-center justify-end gap-2 flex-wrap pt-3 border-t border-gray-100 dark:border-gray-700/50 mb-5">
          <QuickActionBtn icon={Upload} label="Import" onClick={() => setShowBulkImport(true)} />
          <QuickActionBtn icon={Download} label="Export" onClick={exportStaffCSV} />
          <QuickActionBtn icon={Plus} label="Add Staff" variant="primary" onClick={() => setShowAddStaff(true)} />
        </div>

        {filteredStaff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700/50">
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
                    <td className="py-3 text-xs font-mono text-gray-500">{staffIdOf(member) || '—'}</td>
                    <td className="py-3">
                      <button onClick={() => router.push(`/management/staff/${member.id}`)} className="text-xs font-semibold text-gray-900 dark:text-white hover:text-[#6D4CFF] transition-colors">{member.full_name || member.name || '—'}</button>
                    </td>
                    <td className="py-3 text-xs text-gray-600 dark:text-gray-400 capitalize">{member.role || '—'}</td>
                    <td className="py-3 text-xs text-gray-600 dark:text-gray-400">{member.department || member.department_name || '—'}</td>
                    <td className="py-3 text-xs text-gray-600 dark:text-gray-400">{member.designation || '—'}</td>
                    <td className="py-3 text-xs text-gray-600 dark:text-gray-400">{member.phone || '—'}</td>
                    <td className="py-3 text-xs text-gray-600 dark:text-gray-400 max-w-[120px] truncate">{member.email || '—'}</td>
                    <td className="py-3"><StatusBadge status={member.status} /></td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => router.push(`/management/staff/${member.id}`)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors" title="View Profile"><Eye size={14} /></button>
                        <button onClick={() => handleDeleteStaff(member)} disabled={deletingStaff === (member.id || member.staff_id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50" title="Delete Staff">
                          {deletingStaff === (member.id || member.staff_id) ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
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
  const attTodayMarked = attToday.filter((a: any) => a.status !== 'not marked');

  const renderAttendance = () => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const refreshAttendance = () => {
      staffAttendanceApi.getAll(attDate).then((res: any) => {
        setAttendanceData((Array.isArray(res) ? res : (res?.data || [])).map((r: any) => ({ ...r, status: (r.status || '').toLowerCase() })));
      }).catch(() => setAttendanceData([]));
      const month = attDate.slice(0, 7);
      setMonthlyLoading(true);
      staffAttendanceApi.getMonthly(month).then((res: any) => {
        const data = (Array.isArray(res) ? {} : (res?.data || {}));
        setMonthlyData({ records: data.records || [], departments: data.departments || [], avgRate: data.avgRate || 0, totalMarked: data.totalMarked || 0 });
      }).catch(() => setMonthlyData({ records: [], departments: [], avgRate: 0, totalMarked: 0 })).finally(() => setMonthlyLoading(false));
      dashboardAnalytics.refetch?.();
      attHistory.refetch?.();
    };
    return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white flex-shrink-0"><ClipboardList size={20} /></div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-white truncate">Attendance</h2>
          <p className="text-[11px] text-gray-400">Daily records, monthly summaries, and attendance analytics</p>
        </div>
        <button onClick={refreshAttendance} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex-shrink-0">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {(['daily', 'monthly', 'heatmap', 'analytics'] as const).map(v => (
            <button key={v} onClick={() => setAttView(v)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${attView === v ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {v}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)} max={todayKey}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
          <QuickActionBtn icon={ClipboardList} label="Mark Attendance" variant="primary"
            disabled={attDate !== todayKey}
            onClick={() => { if (attDate !== todayKey) { toast.error('Attendance can only be marked for today'); return; } setShowMarkAttendance(true); }} />
        </div>
        {attDate !== todayKey && (
          <div className="flex items-center gap-1.5 -mt-3 mb-4 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 w-fit">
            <AlertCircle size={12} /> Marking is only allowed for today's date. You can still view records for other dates.
          </div>
        )}
      </div>

      {attView === 'daily' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Present', value: attTodayMarked.filter((a: any) => a.status === 'present').length, color: '#22C55E', icon: CheckCircle },
              { label: 'Absent', value: attTodayMarked.filter((a: any) => a.status === 'absent').length, color: '#EF4444', icon: XCircle },
              { label: 'Late', value: attTodayMarked.filter((a: any) => a.status === 'late').length, color: '#F59E0B', icon: Clock },
              { label: 'On Leave', value: attTodayMarked.filter((a: any) => a.status === 'leave' || a.status === 'on leave').length, color: '#3B82F6', icon: Calendar },
              { label: 'Total', value: attTodayMarked.length, color: '#6D4CFF', icon: Users },
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

          {attTodayMarked.length > 0 ? (
            <GlassCard className="p-5">
              <SectionHeader title="Today's Attendance Records" subtitle={`${attDate} — ${attTodayMarked.length} records`} />
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700/50">
                      <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Staff ID</th>
                      <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Staff</th>
                      <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Department</th>
                      <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Check In</th>
                      <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Check Out</th>
                      <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attTodayMarked.map((record: any, i: number) => (
                      <motion.tr key={record.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 text-xs font-mono text-gray-500">{record.employee_id || record.staff_unique_id || '—'}</td>
                        <td className="py-3 text-xs font-semibold text-gray-900 dark:text-white">{record.full_name || record.employee_name || record.name || '—'}</td>
                        <td className="py-3 text-xs text-gray-500">{record.department || record.department_name || '—'}</td>
                        <td className="py-3 text-xs text-gray-500">{record.check_in || '—'}</td>
                        <td className="py-3 text-xs text-gray-500">{record.check_out || '—'}</td>
                        <td className="py-3"><StatusBadge status={record.status} /></td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setEditAttRecord(record); setEditAttForm({ status: record.status || 'Present', check_in: toTimeInput(record.check_in), check_out: toTimeInput(record.check_out), remarks: record.remarks || '' }); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-[#6D4CFF] transition-colors"><Edit3 size={14} /></button>
                            {record.id && (
                              <button onClick={async () => {
                                if (!confirm(`Delete attendance record for ${record.full_name || record.employee_name || record.name || 'this staff member'}?`)) return;
                                const res = await staffAttendanceApi.deleteRecord(record.id);
                                if (res.success) { toast.success('Attendance record deleted'); staffAttendanceApi.getAll(attDate).then((r: any) => setAttendanceData((Array.isArray(r) ? r : (r?.data || [])).map((x: any) => ({ ...x, status: (x.status || '').toLowerCase() })))); }
                                else toast.error(res.error || 'Failed to delete record');
                              }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/40 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                            )}
                          </div>
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

      {attView === 'monthly' && (() => {
        const month = attDate.slice(0, 7);
        const [yy, mm] = month.split('-').map(Number);
        const monthLabel = new Date(yy, mm - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const rows = monthlyData.records || [];
        const depts = monthlyData.departments || [];
        const shiftMonth = (dir: number) => {
          const d = new Date(yy, mm - 1 + dir, 1);
          setAttDate(d.toISOString().slice(0, 10));
        };
        const perfect = rows.filter((r: any) => r.attendance_rate === 100 && r.totalMarked > 0).length;
        const maxLate = rows.reduce((mx: any, r: any) => (r.late > (mx?.late || 0) ? r : mx), null);
        const sorted = [...rows].sort((a: any, b: any) => b.attendance_rate - a.attendance_rate);
        const rateColor = (r: number) => r >= 90 ? 'text-emerald-600' : r >= 75 ? 'text-amber-600' : 'text-red-500';
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button onClick={() => shiftMonth(-1)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-all"><ChevronLeft size={14} /></button>
                <span className="px-4 py-1.5 text-xs font-bold text-gray-800 dark:text-gray-100">{monthLabel}</span>
                <button onClick={() => shiftMonth(1)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-all"><ChevronRight size={14} /></button>
              </div>
              <input type="month" value={month} onChange={e => { if (e.target.value) setAttDate(e.target.value + '-01'); }}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
              {monthlyLoading && <span className="text-[10px] text-gray-400 flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Loading...</span>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Average Rate', value: `${monthlyData.avgRate}%`, color: '#6D4CFF', icon: TrendingUp },
                { label: '100% Attendance', value: perfect, color: '#22C55E', icon: Award },
                { label: 'Most Late Entries', value: maxLate?.employee_name ? `${maxLate.employee_name} (${maxLate.late})` : '—', color: '#F59E0B', icon: Clock },
                { label: 'Records Marked', value: monthlyData.totalMarked, color: '#3B82F6', icon: ClipboardList },
              ].map((item, i) => (
                <GlassCard key={i} className="p-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: `${item.color}15`, color: item.color }}><item.icon size={16} /></div>
                  <div className="text-[11px] text-gray-400 font-medium">{item.label}</div>
                  <div className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5 truncate">{item.value}</div>
                </GlassCard>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GlassCard className="p-5 lg:col-span-2">
                <SectionHeader title="Monthly Staff Summary" subtitle={`${rows.length} staff · ${monthLabel}`} />
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700/50">
                        {['Staff', 'Dept', 'Present', 'Late', 'Absent', 'Leave', 'Rate'].map(h => (
                          <th key={h} className="pb-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((r: any) => (
                        <tr key={r.staff_id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="py-2.5 pr-2">
                            <div className="text-xs font-semibold text-gray-900 dark:text-white">{r.employee_name}</div>
                            <div className="text-[9px] text-gray-400 font-mono">{r.employee_id}</div>
                          </td>
                          <td className="py-2.5 pr-2 text-[11px] text-gray-500">{r.department}</td>
                          <td className="py-2.5 pr-2 text-[11px] font-semibold text-emerald-600">{r.present}</td>
                          <td className="py-2.5 pr-2 text-[11px] font-semibold text-amber-500">{r.late}</td>
                          <td className="py-2.5 pr-2 text-[11px] font-semibold text-red-500">{r.absent}</td>
                          <td className="py-2.5 pr-2 text-[11px] font-semibold text-blue-500">{r.leave}</td>
                          <td className="py-2.5">
                            <span className={`text-[11px] font-extrabold ${rateColor(r.attendance_rate)}`}>{r.attendance_rate}%</span>
                            <div className="w-14 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mt-0.5">
                              <div className={`h-full rounded-full ${r.attendance_rate >= 90 ? 'bg-emerald-500' : r.attendance_rate >= 75 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${r.attendance_rate}%` }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                      {sorted.length === 0 && (
                        <tr><td colSpan={7} className="py-8 text-center text-xs text-gray-400">No attendance records for this month</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              <div className="space-y-6">
                <GlassCard className="p-5">
                  <SectionHeader title="Department Rates" subtitle="Attendance % by department" />
                  {depts.length > 0 ? (
                    <div className="space-y-3">
                      {depts.map((d: any) => (
                        <div key={d.name}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">{d.name}</span>
                            <span className="text-[10px] font-bold text-gray-800 dark:text-gray-100">{d.rate}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6]" style={{ width: `${d.rate}%` }} />
                          </div>
                          <div className="text-[9px] text-gray-400 mt-0.5">{d.present + d.late} of {d.total} records on time</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-gray-400">No department data</div>
                  )}
                </GlassCard>

                <GlassCard className="p-5">
                  <SectionHeader title="Recent Edit Trail" subtitle="Last person who changed each record" />
                  <div className="space-y-2.5 max-h-72 overflow-y-auto">
                    {sorted.filter((r: any) => r.updated_by_name || r.marked_by_name).slice(0, 8).map((r: any) => (
                      <div key={r.staff_id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {(r.employee_name || '?')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-gray-800 dark:text-gray-100">{r.employee_name}</div>
                          <div className="text-[9px] text-gray-400 leading-relaxed">
                            {r.marked_by_name && <span>Marked by {r.marked_by_name}{r.marked_by_role ? ` (${r.marked_by_role})` : ''}</span>}
                            {r.updated_by_name && <span className="block">Edited by {r.updated_by_name}{r.updated_by_role ? ` (${r.updated_by_role})` : ''}{r.last_updated_at ? ` · ${new Date(r.last_updated_at).toLocaleDateString()}` : ''}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                    {!sorted.some((r: any) => r.updated_by_name || r.marked_by_name) && (
                      <div className="py-6 text-center text-xs text-gray-400">No edit history yet</div>
                    )}
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        );
      })()}

      {attView === 'heatmap' && (() => {
        const trendData = attHistory.data?.data || attHistory.data || {};
        const trend = Array.isArray(trendData.attendanceTrend) ? trendData.attendanceTrend : [];
        const last30 = trend.slice(-30);
        const rateOf = (t: any) => {
          const total = (t.Present || 0) + (t.Absent || 0) + (t.Late || 0) + (t.Leave || 0);
          if (total === 0) return null;
          return Math.round(((t.Present || 0) + (t.Late || 0)) / total * 100);
        };
        return (
          <GlassCard className="p-5">
            <SectionHeader title="Attendance Heatmap" subtitle="Attendance rate — last 30 days" />
            {last30.length > 0 ? (
              <>
                <div className="grid grid-cols-10 gap-1.5">
                  {last30.map((t: any, i: number) => {
                    const rate = rateOf(t);
                    const bg = rate === null ? 'bg-gray-100 dark:bg-gray-800' : rate >= 90 ? 'bg-emerald-500' : rate >= 75 ? 'bg-emerald-400' : rate >= 50 ? 'bg-amber-400' : rate >= 25 ? 'bg-orange-400' : 'bg-red-500';
                    return (
                      <div key={i} title={`${t.label}: ${rate === null ? 'no data' : rate + '%'}`}
                        className={`aspect-square rounded-md ${bg} ${rate === null ? 'opacity-40' : ''}`} />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> 0-25%
                    <span className="w-2.5 h-2.5 rounded-sm bg-orange-400" /> 25-50%
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> 50-75%
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> 75-90%
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> 90%+
                  </div>
                  <span className="text-[10px] text-gray-400">{trendData.weekRate != null ? `7-day avg: ${trendData.weekRate}%` : ''}</span>
                </div>
              </>
            ) : (
              <div className="py-10 text-center text-xs text-gray-400">No attendance data available</div>
            )}
          </GlassCard>
        );
      })()}

      {attView === 'analytics' && (() => {
        const trendData = attHistory.data?.data || attHistory.data || {};
        const trend = Array.isArray(trendData.attendanceTrend) ? trendData.attendanceTrend : [];
        const chartData = trend.map((t: any) => {
          const total = (t.Present || 0) + (t.Absent || 0) + (t.Late || 0) + (t.Leave || 0);
          return {
            label: t.label,
            Present: t.Present || 0,
            Absent: t.Absent || 0,
            Late: t.Late || 0,
            Leave: t.Leave || 0,
            total,
            rate: total ? Math.round(((t.Present || 0) + (t.Late || 0)) / total * 100) : 0,
          };
        });
        const deptByAnalytics = Array.isArray(trendData.departmentDistribution) ? trendData.departmentDistribution : [];
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="p-5">
              <SectionHeader title="Department Distribution" subtitle="Staff by department" />
              {deptByAnalytics.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={deptByAnalytics.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} stroke="#999" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} stroke="#999" width={100} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                    <Bar dataKey="count" fill="#6D4CFF" radius={[0, 4, 4, 0]}>
                      {deptByAnalytics.slice(0, 10).map((_: any, i: number) => <Cell key={i} fill={ANALYTICS_COLORS[i % ANALYTICS_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-xs text-gray-400">No department data</div>
              )}
            </GlassCard>
            <GlassCard className="p-5">
              <SectionHeader title="Attendance Trend" subtitle="Daily present/absent — last 60 days" />
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={4} stroke="#999" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="#999" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                    <Bar dataKey="Present" stackId="a" fill="#22C55E" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Late" stackId="a" fill="#F59E0B" />
                    <Bar dataKey="Absent" stackId="a" fill="#EF4444" />
                    <Bar dataKey="Leave" stackId="a" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-xs text-gray-400">No attendance data available</div>
              )}
            </GlassCard>
            <GlassCard className="p-5 lg:col-span-2">
              <SectionHeader title="Attendance Rate" subtitle="Daily attendance % — last 60 days" />
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <ReLineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={4} stroke="#999" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#999" domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                    <Line type="monotone" dataKey="rate" name="Rate %" stroke="#6D4CFF" strokeWidth={2} dot={false} />
                  </ReLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-xs text-gray-400">No attendance data available</div>
              )}
            </GlassCard>
          </div>
        );
      })()}
    </div>
  );
  };

  // ==================== ASSIGNMENTS MODULE HANDLERS ====================
  const openAssignModal = () => {
    setEditingTask(null);
    setAssignForm({});
    setShowAssignWork(true);
  };

  // ==================== ACADEMIC MODULE HANDLERS ====================
  const openAcademicModal = () => {
    setEditingAcad(null);
    setAcadForm({});
    setAcadFilter('ALL');
    setShowAssignAcademic(true);
  };
  const openEditAcademic = (r: any) => {
    setEditingAcad(r);
    setAcadForm({
      class_id: r.class_id || '',
      subject_id: r.subject_id || '',
      section_id: r.section_id || '',
      teacher_id: r.teacher_id || '',
      is_class_teacher: !!r.is_class_teacher,
    });
    setShowAssignAcademic(true);
  };
  const submitAcademic = async () => {
    if (!acadForm.class_id) { toast.error('Please select a class'); return; }
    if (!acadForm.subject_id) { toast.error('Please select a subject'); return; }
    if (!acadForm.teacher_id) { toast.error('Please select a teacher'); return; }
    setAcadSaving(true);
    try {
      const payload = {
        class_id: acadForm.class_id,
        subject_id: acadForm.subject_id,
        section_id: acadForm.section_id || null,
        teacher_id: acadForm.teacher_id,
        is_class_teacher: !!acadForm.is_class_teacher,
      };
      const res = editingAcad
        ? await academicMgmtApi.updateTeacherAssignment(editingAcad.id, payload)
        : await academicMgmtApi.createTeacherAssignment(payload);
      if (!res.success) { toast.error(res.error || 'Failed to save assignment'); return; }
      toast.success(editingAcad ? 'Academic assignment updated' : 'Teacher assigned');
      setShowAssignAcademic(false);
      setAcademicRows([]);
      setAcadForm({});
      setEditingAcad(null);
      loadAcademic();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save assignment');
    } finally {
      setAcadSaving(false);
    }
  };
  const deleteAcademic = async (r: any) => {
    if (!confirm(`Remove academic assignment for ${r.teacher?.full_name || 'this teacher'}?`)) return;
    const res = await academicMgmtApi.deleteTeacherAssignment(r.id);
    if (res.success) { toast.success('Assignment removed'); loadAcademic(); }
    else toast.error(res.error || 'Failed to remove assignment');
  };

  const openEditAssignment = (t: any) => {
    setEditingTask(t);
    setAssignForm({
      staff_id: t.staff_id || '',
      title: t.title || '',
      description: t.description || '',
      priority: t.priority || 'MEDIUM',
      status: t.status || 'PENDING',
      progress: t.progress ?? 0,
      task_type: t.task_type || 'OTHER',
      start_date: t.start_date || '',
      deadline: t.deadline || '',
      location: t.location || '',
    });
    setShowAssignWork(true);
  };
  const submitAssignment = async () => {
    if (!assignForm.staff_id) { toast.error('Please select a staff member'); return; }
    if (!assignForm.title?.trim()) { toast.error('Please provide a title'); return; }
    setAssignSaving(true);
    try {
      const payload = {
        title: assignForm.title.trim(),
        description: assignForm.description || null,
        priority: assignForm.priority || 'MEDIUM',
        status: assignForm.status || 'PENDING',
        progress: Number(assignForm.progress) || 0,
        task_type: assignForm.task_type || 'WORK',
        start_date: assignForm.start_date || null,
        deadline: assignForm.deadline || null,
        location: assignForm.location || null,
      };
      const res = editingTask
        ? await staffApi.updateTask(editingTask.id, payload)
        : await staffApi.addTask(assignForm.staff_id, payload);
      if (!res.success) { toast.error(res.error || 'Failed to save assignment'); return; }
      toast.success(editingTask ? 'Assignment updated' : 'Assignment created');
      setShowAssignWork(false);
      setAssignForm({});
      setEditingTask(null);
      loadTasks();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save assignment');
    } finally {
      setAssignSaving(false);
    }
  };
  const updateAssignStatus = async (id: string, status: string) => {
    const res = await staffApi.updateTask(id, { status });
    if (res.success) { toast.success(`Marked as ${status.toLowerCase()}`); loadTasks(); }
    else toast.error(res.error || 'Failed to update status');
  };
  const deleteAssignment = async (t: any) => {
    if (!confirm(`Delete assignment "${t.title || 'this assignment'}"? This cannot be undone.`)) return;
    const res = await staffApi.deleteTask(t.id);
    if (res.success) { toast.success('Assignment deleted'); loadTasks(); }
    else toast.error(res.error || 'Failed to delete assignment');
  };

// ==================== RENDER: ASSIGNMENTS TAB ====================
  const renderAssignments = () => {
    const assignTabs = [
      { key: 'ALL', label: 'All' },
      { key: 'PENDING', label: 'Pending' },
      { key: 'IN_PROGRESS', label: 'In Progress' },
      { key: 'COMPLETED', label: 'Completed' },
    ];
    const statusMeta: Record<string, { label: string; cls: string; color: string }> = {
      PENDING: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', color: '#F59E0B' },
      IN_PROGRESS: { label: 'In Progress', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', color: '#3B82F6' },
      COMPLETED: { label: 'Completed', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', color: '#22C55E' },
    };
    const priorityCls: Record<string, string> = {
      HIGH: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-300',
      MEDIUM: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
      LOW: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
    };
    const statusColor: Record<string, string> = { PENDING: '#F59E0B', IN_PROGRESS: '#3B82F6', COMPLETED: '#22C55E' };

    const filtered = tasks.filter((t: any) => {
      const s = (t.status || '').toUpperCase();
      if (assignFilter !== 'ALL' && s !== assignFilter) return false;
      if (assignSearch) {
        const q = assignSearch.toLowerCase();
        const hay = `${t.title || ''} ${t.staff_name || ''} ${t.department || ''} ${t.task_type || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const countBy = (key: string) => key === 'ALL' ? tasks.length : tasks.filter((t: any) => (t.status || '').toUpperCase() === key).length;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#F97316] flex items-center justify-center text-white flex-shrink-0"><Briefcase size={20} /></div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white truncate">Assignments</h2>
              <p className="text-[11px] text-gray-400">Assign work and tasks to staff members and track their progress.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => loadTasks()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <RefreshCw size={13} /> Refresh
            </button>
            <button onClick={openAssignModal} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold shadow-lg shadow-[#6D4CFF]/25 hover:shadow-[#6D4CFF]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5">
              <Plus size={15} /> Assign Work
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Assignments', value: countBy('ALL') || 0, color: '#6D4CFF', icon: Briefcase },
            { label: 'Pending', value: countBy('PENDING') || 0, color: '#F59E0B', icon: Clock },
            { label: 'In Progress', value: countBy('IN_PROGRESS') || 0, color: '#3B82F6', icon: Activity },
            { label: 'Completed', value: countBy('COMPLETED') || 0, color: '#22C55E', icon: CheckCircle2 },
          ].map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15`, color: k.color }}><k.icon size={20} /></div>
                <div>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{k.value}</div>
                  <div className="text-[11px] text-gray-400">{k.label}</div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Toolbar: filter tabs + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
            {assignTabs.map(t => (
              <button key={t.key} onClick={() => setAssignFilter(t.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${assignFilter === t.key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t.label}
                <span className={`ml-1.5 text-[10px] ${assignFilter === t.key ? 'text-[#6D4CFF]' : 'text-gray-400'}`}>{countBy(t.key)}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={assignSearch} onChange={e => setAssignSearch(e.target.value)} placeholder="Search assignments..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
          </div>
        </div>

        {/* Animated assignments grid */}
        {filtered.length === 0 ? (
          <EmptyWorkspaceState icon={Briefcase} title="No assignments yet" description="Create work and task assignments to manage staff workload effectively."
            actions={[{ label: 'Assign Work', icon: Briefcase, onClick: openAssignModal }]} />
        ) : (
          <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((t: any) => {
                const st = statusMeta[(t.status || '').toUpperCase()] || statusMeta.PENDING;
                const pr = priorityCls[(t.priority || 'MEDIUM').toUpperCase()] || priorityCls.MEDIUM;
                const prog = Number(t.progress) || 0;
                const overdue = t.deadline && new Date(t.deadline) < new Date() && (t.status || '').toUpperCase() !== 'COMPLETED';
                return (
                  <motion.div key={t.id} layout variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="group relative rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/60 p-4 hover:shadow-xl hover:shadow-[#6D4CFF]/5 hover:border-[#6D4CFF]/30 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white shrink-0">
                          <ListTodo size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{t.title || 'Untitled'}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-[#6D4CFF] flex items-center justify-center text-[7px] text-white font-bold shrink-0">
                              {(t.staff_name || '?')[0].toUpperCase()}
                            </span>
                            <span className="truncate">{t.staff_name || 'Unassigned'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditAssignment(t)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#6D4CFF] opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 size={13} /></button>
                        <button onClick={() => deleteAssignment(t)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={13} /></button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${pr}`}>{t.priority || 'MEDIUM'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.cls}`}>{st.label}</span>
                      {t.task_type && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400 uppercase">{t.task_type}</span>}
                    </div>

                    {t.description && <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2.5 line-clamp-2">{t.description}</p>}

                    <div className="mt-3 flex items-center justify-between text-[10px] text-gray-400">
                      <span className="flex items-center gap-1 truncate">{t.department || 'General'}</span>
                      {t.deadline && (
                        <span className={`flex items-center gap-1 shrink-0 ${overdue ? 'text-red-500 font-semibold' : ''}`}><Clock size={11} /> {new Date(t.deadline).toLocaleDateString()}</span>
                      )}
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="font-semibold text-gray-500">Progress</span>
                        <span className="font-bold" style={{ color: statusColor[prog >= 100 ? 'COMPLETED' : prog > 0 ? 'IN_PROGRESS' : 'PENDING'] }}>{prog}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${prog}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6]" />
                      </div>
                    </div>

                    <div className="mt-3 flex gap-1.5">
                      {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map(s => {
                        const active = (t.status || '').toUpperCase() === s;
                        const meta = statusMeta[s];
                        return (
                          <button key={s} onClick={() => active ? null : updateAssignStatus(t.id, s)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border ${active ? meta.cls + ' ring-1' : 'border-gray-200 text-gray-400 hover:bg-gray-50 dark:border-gray-700 hover:text-gray-700'}`}>
                            {meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    );
  };

  // ==================== RENDER: ASSIGN WORK MODAL ====================
  const renderAssignWorkModal = () => {
    if (!showAssignWork) return null;
    const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/25 focus:border-[#6D4CFF]";
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => { if (!assignSaving) { setShowAssignWork(false); setEditingTask(null); } }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.92, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[88vh] overflow-hidden flex flex-col">
          <div className="relative px-6 py-5 bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6]">
            <div className="absolute top-0 right-0 w-40 h-40 translate-x-10 -translate-y-10 rounded-full bg-white/10" />
            <div className="relative flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">{editingTask ? 'Edit Assignment' : 'Assign Work'}</h3>
                <p className="text-[11px] text-white/70">{editingTask ? 'Update the details of this assignment.' : 'Create a work or task for a staff member.'}</p>
              </div>
              <button onClick={() => { if (!assignSaving) { setShowAssignWork(false); setEditingTask(null); } }} className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"><X size={16} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Assign To <span className="text-red-500">*</span></label>
              <select value={assignForm.staff_id || ''} onChange={e => setAssignForm((f: any) => ({ ...f, staff_id: e.target.value }))} className={inputCls}>
                <option value="">Select staff member...</option>
                {staffArray.map((s: any) => (
                  <option key={s.id || s.staff_id} value={s.id || s.staff_id}>{s.full_name || s.name || 'Staff'} {s.department ? `· ${s.department}` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Title <span className="text-red-500">*</span></label>
              <input value={assignForm.title || ''} onChange={e => setAssignForm((f: any) => ({ ...f, title: e.target.value }))} placeholder="e.g. Prepare quarterly report" className={inputCls} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Description</label>
              <textarea value={assignForm.description || ''} onChange={e => setAssignForm((f: any) => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe the assignment..." className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Priority</label>
                <select value={assignForm.priority || 'MEDIUM'} onChange={e => setAssignForm((f: any) => ({ ...f, priority: e.target.value }))} className={inputCls}>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Task Type</label>
                <select value={assignForm.task_type || 'WORK'} onChange={e => setAssignForm((f: any) => ({ ...f, task_type: e.target.value }))} className={inputCls}>
                  <option value="WORK">Work</option>
                  <option value="ADMIN">Admin</option>
                  <option value="REPORT">Report</option>
                  <option value="EVENT">Event</option>
                  <option value="TRAINING">Training</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Start Date</label>
                <input type="date" value={assignForm.start_date || ''} onChange={e => setAssignForm((f: any) => ({ ...f, start_date: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Deadline</label>
                <input type="date" value={assignForm.deadline || ''} onChange={e => setAssignForm((f: any) => ({ ...f, deadline: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Progress</label>
                <input type="number" min={0} max={100} value={assignForm.progress ?? 0} onChange={e => setAssignForm((f: any) => ({ ...f, progress: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Status</label>
                <select value={assignForm.status || 'PENDING'} onChange={e => setAssignForm((f: any) => ({ ...f, status: e.target.value }))} className={inputCls}>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Location (optional)</label>
              <input value={assignForm.location || ''} onChange={e => setAssignForm((f: any) => ({ ...f, location: e.target.value }))} placeholder="e.g. Admin block, Room 204" className={inputCls} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100 dark:border-gray-800">
            <button onClick={() => { if (!assignSaving) { setShowAssignWork(false); setEditingTask(null); } }} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
            <button onClick={submitAssignment} disabled={assignSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold shadow-lg shadow-[#6D4CFF]/25 hover:shadow-[#6D4CFF]/40 transition-all disabled:opacity-50 flex items-center gap-1.5">
              {assignSaving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : editingTask ? 'Update Assignment' : 'Assign Now'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

// ==================== RENDER: ACADEMIC TAB ====================
  const renderAcademic = () => {
    const acadTabs = [
      { key: 'ALL', label: 'All' },
      { key: 'CLASS_TEACHER', label: 'Class Teachers' },
      { key: 'SUBJECT', label: 'Subject' },
    ];
    const acadTypeCls: Record<string, string> = {
      class_teacher: 'bg-gradient-to-r from-[#6D4CFF]/15 to-[#8B5CF6]/15 text-[#6D4CFF] border-[#6D4CFF]/30',
      subject: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
    };

    const enriched = academicRows.map((r: any) => ({
      ...r,
      teacherName: r.teacher?.full_name || null,
      teacherCode: r.teacher?.staff_unique_id || null,
      className: r.class?.name || null,
      subjectName: r.subject?.name || null,
      sectionName: r.section?.name || sectionsList.find((s: any) => s.id === r.section_id)?.name || null,
      type: r.is_class_teacher ? 'class_teacher' : 'subject',
    }));

    const filtered = enriched.filter((r: any) => {
      if (acadFilter !== 'ALL' && r.type !== acadFilter) return false;
      if (acadSearch) {
        const q = acadSearch.toLowerCase();
        const hay = `${r.teacherName || ''} ${r.className || ''} ${r.subjectName || ''} ${r.sectionName || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const teachersAssigned = new Set(academicRows.map((r: any) => r.teacher_id).filter(Boolean)).size;
    const classSet = new Set(academicRows.map((r: any) => r.class_id).filter(Boolean));
    const classWorkload = Array.from(classSet).map((cid) => {
      const rows = academicRows.filter((r: any) => r.class_id === cid);
      return {
        classId: cid,
        name: rows[0]?.class?.name || '—',
        subjects: new Set(rows.map((r: any) => r.subject_id).filter(Boolean)).size,
        classTeachers: rows.filter((r: any) => r.is_class_teacher).length,
        teachers: new Set(rows.map((r: any) => r.teacher_id).filter(Boolean)).size,
      };
    });

    const kpis = [
      { label: 'Total Assignments', value: academicRows.length, color: '#6D4CFF', icon: BookOpen },
      { label: 'Class Teachers', value: academicRows.filter((r: any) => r.is_class_teacher).length, color: '#F59E0B', icon: GraduationCap },
      { label: 'Subject Assignments', value: academicRows.filter((r: any) => !r.is_class_teacher).length, color: '#10B981', icon: BookOpen },
      { label: 'Teachers Assigned', value: teachersAssigned, color: '#3B82F6', icon: Users },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white flex-shrink-0"><GraduationCap size={20} /></div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white truncate">Academic Planning</h2>
              <p className="text-[11px] text-gray-400">Assign teachers to classes, subjects and sections across the academic syllabus.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => loadAcademic()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <RefreshCw size={13} /> Refresh
            </button>
            <button onClick={openAcademicModal} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5">
              <Plus size={15} /> Assign Teacher
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15`, color: k.color }}><k.icon size={20} /></div>
                <div>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{k.value}</div>
                  <div className="text-[11px] text-gray-400">{k.label}</div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
            {acadTabs.map(t => (
              <button key={t.key} onClick={() => setAcadFilter(t.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${acadFilter === t.key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={acadSearch} onChange={e => setAcadSearch(e.target.value)} placeholder="Search teacher, class, subject..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
          </div>
        </div>

        {/* Assignments grid */}
        {academicLoading ? (
          <GlassCard className="p-8 flex items-center justify-center text-xs text-gray-400"><Loader2 size={16} className="animate-spin mr-2" /> Loading assignments...</GlassCard>
        ) : filtered.length === 0 ? (
          <EmptyWorkspaceState icon={BookOpen} title="No academic assignments" description="Assign teachers to classes and subjects to build the academic load."
            actions={[{ label: 'Assign Teacher', icon: Plus, onClick: openAcademicModal }]} />
        ) : (
          <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((r: any) => (
                <motion.div key={r.id} layout variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className="group relative rounded-2xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-800/60 p-4 hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shrink-0">
                        <span className="text-xs font-bold">{r.teacherName ? r.teacherName[0].toUpperCase() : '?'}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{r.teacherName || 'Unassigned'}</div>
                        <div className="text-[10px] text-gray-400">{r.teacherCode || 'Teacher'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditAcademic(r)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#6D4CFF] opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 size={13} /></button>
                      <button onClick={() => deleteAcademic(r)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={13} /></button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${acadTypeCls[r.type] || acadTypeCls.subject}`}>
                      {r.type === 'class_teacher' ? 'Class Teacher' : 'Subject Teacher'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300">{r.className || '—'}</span>
                    {r.sectionName && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">{r.sectionName}</span>}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <GraduationCap size={13} className="text-[#6D4CFF]" />
                    {r.subjectName ? <span className="font-semibold">{r.subjectName}</span> : <span className="italic">—</span>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Class workload summary */}
        {!academicLoading && classWorkload.length > 0 && (
          <GlassCard className="p-5">
            <SectionHeader title="Class Coverage" subtitle="Subject and teacher load per class" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
              {classWorkload.map((c: any, i: number) => (
                <motion.div key={c.classId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="rounded-2xl border border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/40 p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#6D4CFF]/10 flex items-center justify-center text-[#6D4CFF]"><School size={15} /></div>
                    <span className="text-sm font-extrabold text-gray-800 dark:text-white">{c.name}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-white dark:bg-gray-800 p-2">
                      <div className="text-base font-extrabold text-[#6D4CFF]">{c.subjects}</div>
                      <div className="text-[9px] text-gray-400">Subjects</div>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-gray-800 p-2">
                      <div className="text-base font-extrabold text-emerald-600">{c.classTeachers}</div>
                      <div className="text-[9px] text-gray-400">Lead</div>
                    </div>
                    <div className="rounded-xl bg-white dark:bg-gray-800 p-2">
                      <div className="text-base font-extrabold text-blue-600">{c.teachers}</div>
                      <div className="text-[9px] text-gray-400">Teachers</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    );
  };

  // ==================== RENDER: ACADEMIC ASSIGN MODAL ====================
  const renderAcademicModal = () => {
    if (!showAssignAcademic) return null;
    const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500";
    const teachers = staffArray.filter((s: any) => (s.role || '').toLowerCase() === 'teacher' || ((s.designation || '') + '').toLowerCase().includes('teacher'));
    const classSections = sectionsList.filter((s: any) => !acadForm.class_id || s.class_id === acadForm.class_id);
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => { if (!acadSaving) { setShowAssignAcademic(false); setEditingAcad(null); } }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.92, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 26 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[88vh] overflow-y-auto">
          <div className="relative px-6 py-5 bg-gradient-to-r from-emerald-500 to-teal-600">
            <div className="absolute top-0 right-0 w-40 h-40 translate-x-10 -translate-y-10 rounded-full bg-white/10" />
            <div className="relative flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">{editingAcad ? 'Edit Academic Assignment' : 'Assign Teacher'}</h3>
                <p className="text-[11px] text-white/70">{editingAcad ? 'Update class, subject and section for this teacher.' : 'Assign a teacher to a class, subject and optional section.'}</p>
              </div>
              <button onClick={() => { if (!acadSaving) { setShowAssignAcademic(false); setEditingAcad(null); } }} className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"><X size={16} /></button>
            </div>
          </div>
          <div className="p-6 space-y-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Teacher <span className="text-red-500">*</span></label>
              <select value={acadForm.teacher_id || ''} onChange={e => setAcadForm((f: any) => ({ ...f, teacher_id: e.target.value }))} className={inputCls}>
                <option value="">Select teacher...</option>
                {teachers.map((s: any) => (
                  <option key={s.teacher_id || s.id || s.staff_id} value={s.teacher_id || s.id || s.staff_id}>{s.full_name || s.name} {s.department ? `· ${s.department}` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Class <span className="text-red-500">*</span></label>
              <select value={acadForm.class_id || ''} onChange={e => setAcadForm((f: any) => ({ ...f, class_id: e.target.value, section_id: '' }))} className={inputCls}>
                <option value="">Select class...</option>
                {classesList.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Subject <span className="text-red-500">*</span></label>
              <select value={acadForm.subject_id || ''} onChange={e => setAcadForm((f: any) => ({ ...f, subject_id: e.target.value }))} className={inputCls}>
                <option value="">Select subject...</option>
                {subjectsList.map((s: any) => <option key={s.id} value={s.id}>{s.name}{s.code ? ` (${s.code})` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Section {acadForm.class_id ? '' : <span className="text-gray-400 font-normal">(select class first)</span>}</label>
              <select value={acadForm.section_id || ''} onChange={e => setAcadForm((f: any) => ({ ...f, section_id: e.target.value }))} className={inputCls}>
                <option value="">No specific section</option>
                {classSections.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <label className={`flex items-center gap-2.5 p-3.5 rounded-xl border cursor-pointer transition-all ${acadForm.is_class_teacher ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-400'}`}>
              <input type="checkbox" checked={!!acadForm.is_class_teacher} onChange={e => setAcadForm((f: any) => ({ ...f, is_class_teacher: e.target.checked }))} className="accent-emerald-500 w-4 h-4" />
              <div>
                <div className="text-xs font-semibold text-gray-800 dark:text-white">Class Teacher</div>
                <div className="text-[10px] text-gray-400">Mark this teacher as the class teacher for this class.</div>
              </div>
            </label>
          </div>
          <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100 dark:border-gray-800">
            <button onClick={() => { if (!acadSaving) { setShowAssignAcademic(false); setEditingAcad(null); } }} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
            <button onClick={submitAcademic} disabled={acadSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 flex items-center gap-1.5">
              {acadSaving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : editingAcad ? 'Update Assignment' : 'Assign Teacher'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // ==================== RENDER: TIMETABLE TAB ====================
  const renderTimetable = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const colorPool = ['#6D4CFF', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];
    const toHh = (v: any) => { if (v == null) return 0; const m = String(v).match(/(\d{1,2}):(\d{2})/); return m ? Number(m[1]) + Number(m[2]) / 60 : 0; };
    const dayNum = (e: any) => {
      const n = e?.day_of_week;
      if (typeof n === 'number') return n >= 0 && n <= 5 ? n : -1;
      const s = (e?.day || '').toLowerCase().slice(0, 3);
      const i = days.findIndex(d => d.toLowerCase().startsWith(s));
      return i >= 0 ? i : -1;
    };
    const nameOf = (e: any) => e?.teacher?.full_name || e?.teacher_name || staffArray.find((m: any) => m.teacher_id === e?.teacher_id || m.id === e?.teacher_id)?.full_name || 'Unassigned';
    const subjectOf = (e: any) => e?.subject?.name || e?.subject_name || e?.subject_text || '—';
    const classOf = (e: any) => e?.class?.name || e?.class_name || '—';
    const roomOf = (e: any) => e?.room_name || e?.room || e?.room_or_location || '—';
    const timeOf = (e: any) => e?.start_time || e?.startTime || e?.time || '';

    const todayIdx = (() => { const d = new Date().getDay(); return d === 0 ? -1 : d - 1; })();
    const todayName = todayIdx >= 0 ? days[todayIdx] : '';
    const todayDate = new Date().toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });

    const teacherList = timetableTeachers.length ? timetableTeachers : (staffArray.filter((s: any) => (s.role || '').toLowerCase() === 'teacher' || s.teacher_id) as any[]);
    const sel = scheduleTeacher;
    const entries = sel === 'all' ? timetableEntries : timetableEntries.filter((e: any) => e.teacher_id === sel);
    const byDay = days.map((_, i) => entries.filter((e: any) => dayNum(e) === i).sort((a: any, b: any) => toHh(timeOf(a)) - toHh(timeOf(b))));
    const slotTimes = Array.from(new Set(entries.map((e: any) => timeOf(e)).filter(Boolean))).sort((a, b) => toHh(a) - toHh(b)).slice(0, 12);
    const tc = new Set(entries.map((e: any) => e.teacher_id).filter(Boolean));
    const totalPeriods = entries.length;
    const activeDays = byDay.filter(d => d.length > 0).length;
    const totalHours = entries.reduce((s: number, e: any) => s + Math.max(0, toHh(e?.end_time || e?.endTime) - toHh(timeOf(e))), 0);
    const busyPct = teacherList.length ? Math.round((new Set(timetableEntries.map((e: any) => e.teacher_id).filter(Boolean)).size / teacherList.length) * 100) : 0;
    const maxPer = Math.max(1, ...teacherList.map((t: any) => timetableEntries.filter((e: any) => e.teacher_id === t.id).length));

    const roster = teacherList
      .map((t: any) => { const cnt = timetableEntries.filter((e: any) => e.teacher_id === t.id).length; return { id: t.id, name: t.full_name || t.name || 'Unnamed', q: (t.role || t.designation || '').toLowerCase(), subject: t.subject || '—', cnt }; })
      .sort((a: any, b: any) => b.cnt - a.cnt);
    const q = scheduleSearch.trim().toLowerCase();
    const filteredRoster = q ? roster.filter((r: any) => r.name.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q)) : roster;

    const conflicts: { teacher: string; day: string; time: string; classes: string[] }[] = [];
    const buckets = new Map<string, any[]>();
    timetableEntries.forEach((e: any) => { const k = `${e.teacher_id}|${dayNum(e)}|${timeOf(e)}`; if (!buckets.has(k)) buckets.set(k, []); buckets.get(k)!.push(e); });
    buckets.forEach((list) => { if (list.length > 1) { const e = list[0]; conflicts.push({ teacher: nameOf(e), day: days[dayNum(e)] || '?', time: timeOf(e), classes: Array.from(new Set(list.map((x: any) => classOf(x)).filter(Boolean))) }); } });

    const busiest = byDay.map((l, i) => ({ name: days[i], n: l.length })).sort((a, b) => b.n - a.n)[0];
    const todayCount = todayIdx >= 0 ? byDay[todayIdx].length : -1;
    const lightest = roster.slice().sort((a: any, b: any) => a.cnt - b.cnt)[0];

    const insights: string[] = [];
    if (totalPeriods > 0) insights.push(`${busiest?.name} is the busiest day with ${busiest?.n} period${busiest?.n === 1 ? '' : 's'}.`);
    if (todayIdx >= 0) insights.push(todayCount === 0 ? `No periods scheduled for ${todayName} — staff have a lighter day today.` : `${todayName}: ${todayCount} period${todayCount === 1 ? '' : 's'} scheduled today.`);
    if (roster.length > 1 && lightest) insights.push(`${lightest.name} carries the lightest load (${lightest.cnt} periods).`);
    if (conflicts.length) insights.push(`${conflicts.length} scheduling conflict${conflicts.length === 1 ? '' : 's'} detected — a teacher is double-booked.`);

    const kpis = [
      { icon: BookOpen, label: 'Total Periods', value: totalPeriods, color: '#6D4CFF', suffix: '', decimals: 0 },
      { icon: Clock, label: 'Teaching Hours', value: totalHours, color: '#3B82F6', suffix: 'h', decimals: 1 },
      { icon: Users2, label: 'Teachers Busy', value: busyPct, color: '#22C55E', suffix: '%', decimals: 0 },
      { icon: CalendarDays, label: 'Active Days', value: activeDays, color: '#F59E0B', suffix: `/${days.length}`, decimals: 0 },
    ];
    const loadColor = (cnt: number) => cnt >= maxPer ? '#EF4444' : cnt >= maxPer * 0.6 ? '#F59E0B' : '#22C55E';

    const head = totalPeriods === 0
      ? 'Set up your class timetable to start seeing weekly intelligence.'
      : `${busiest?.name} carries your busiest classroom load with ${busiest?.n} period${busiest?.n === 1 ? '' : 's'}${todayIdx >= 0 ? (todayCount > 0 ? ` — ${todayName} has ${todayCount} period${todayCount === 1 ? '' : 's'} upcoming.` : ` — ${todayName} looks light, a good window for planning.`) : '.'}`;
    const avgPer = roster.length ? totalPeriods / roster.length : 0;
    const statTiles = [
      { label: 'Busiest Day', value: busiest?.n || 0, decimals: 0, suffix: ` · ${busiest?.name || '—'}` },
      { label: 'Today', value: todayCount >= 0 ? todayCount : 0, decimals: 0, suffix: todayCount >= 0 ? (todayCount === 1 ? ' class' : ' classes') : '' },
      { label: 'Avg / Teacher', value: avgPer, decimals: 1, suffix: ' periods' },
      { label: 'Coverage', value: busyPct, decimals: 0, suffix: '%' },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div whileHover={{ rotate: -6, scale: 1.05 }} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#6366F1] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-blue-500/30">
              <CalendarDays size={20} />
            </motion.div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white truncate">Staff Timetable</h2>
              <p className="text-[11px] text-gray-400">Weekly teaching periods, live coverage, and load for your staff.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${todayIdx >= 0 ? 'bg-emerald-400 opacity-75' : 'bg-gray-300'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${todayIdx >= 0 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              </span>
              {todayDate}
            </div>
            <select value={sel} onChange={e => setScheduleTeacher(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:border-[#6D4CFF] max-w-[190px]">
              <option value="all">All teachers</option>
              {teacherList.map((t: any) => <option key={t.id || t.name} value={t.id}>{t.full_name || t.name}</option>)}
            </select>
            <button onClick={() => loadTimetable()} disabled={timetableLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              {timetableLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Refresh
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 20 }}>
              <GlassCard className="p-4 flex items-center gap-4 group hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${k.color}22, ${k.color}0D)`, color: k.color }}><k.icon size={22} /></div>
                <div>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-baseline gap-0.5">
                    <AnimatedNumber value={k.value} decimals={k.decimals} />
                    <span className="text-sm text-gray-400 font-bold">{k.suffix}</span>
                  </div>
                  <div className="text-[11px] text-gray-400">{k.label}</div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Insights banner */}
        {insights.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl p-5 md:p-6 bg-gradient-to-br from-white via-[#F7F4FF] to-[#EDE8FF] border border-[#6D4CFF]/15 text-gray-900 shadow-xl shadow-purple-900/10">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#8B5CF6]/20 blur-3xl anim-float" />
              <div className="absolute -bottom-28 -left-16 w-64 h-64 rounded-full bg-[#3B82F6]/10 blur-3xl anim-float" style={{ animationDelay: '1.2s' }} />
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(109,76,255,0.04)_0%,transparent_40%)]" />
            </div>
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#6D4CFF]/20 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6D4CFF] shadow-sm">
                  <Sparkles size={12} className="text-[#8B5CF6]" /> Weekly Intelligence
                </span>
                {conflicts.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-300/50 text-[10px] font-bold text-red-600">
                    <AlertTriangle size={11} /> {conflicts.length} conflict{conflicts.length === 1 ? '' : 's'}
                  </span>
                )}
              </div>

              <p className="text-sm md:text-[15px] font-extrabold leading-snug bg-gradient-to-r from-[#4C3BC7] via-[#6D4CFF] to-[#9B7BFF] bg-clip-text text-transparent">{head}</p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                {statTiles.map((t, i) => (
                  <motion.div key={t.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.07 }}
                    className="rounded-xl bg-[#6D4CFF]/[0.06] border border-[#6D4CFF]/10 p-3 hover:bg-[#6D4CFF]/[0.1] transition-colors">
                    <div className="text-lg font-extrabold text-[#4C3BC7] flex items-baseline gap-1 leading-none">
                      <AnimatedNumber value={t.value} decimals={t.decimals} />
                      <span className="text-[9px] font-semibold text-gray-400 whitespace-nowrap">{t.suffix}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1.5">{t.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col gap-2 mt-4">
                {insights.map((t, i) => {
                  const isConflict = t.includes('conflict');
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.08 }}
                      className="flex items-start gap-2.5 text-[11px] leading-snug text-gray-700 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 shadow-sm">
                      <span className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${isConflict ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {isConflict ? <AlertTriangle size={11} /> : <CheckCircle size={11} />}
                      </span>
                      {t}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Toolbar: search + teacher chips */}
        <div className="space-y-3">
          <div className="relative max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search staff or subject..." value={scheduleSearch} onChange={e => setScheduleSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF] transition-all" />
            {scheduleSearch && (
              <button onClick={() => setScheduleSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setScheduleTeacher('all')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${sel === 'all' ? 'bg-[#6D4CFF] text-white border-[#6D4CFF] shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-[#6D4CFF]/40 hover:text-gray-700'}`}>
              All Teachers
            </button>
            {teacherList.slice(0, 24).map((t: any) => (
              <button key={t.id || t.name} onClick={() => setScheduleTeacher(sel === t.id ? 'all' : t.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${sel === t.id ? 'bg-[#6D4CFF] text-white border-[#6D4CFF] shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-[#6D4CFF]/40 hover:text-gray-700'}`}>
                {t.full_name || t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly matrix */}
        {timetableLoading && timetableEntries.length === 0 ? (
          <GlassCard className="p-8 flex items-center justify-center text-xs text-gray-400"><Loader2 size={16} className="animate-spin mr-2" /> Loading timetable...</GlassCard>
        ) : totalPeriods === 0 ? (
          <GlassCard className="p-8">
            <EmptyWorkspaceState icon={CalendarDays} title="No timetable yet" description="Teaching periods will appear here as a weekly grid once class timetable entries are created." />
          </GlassCard>
        ) : (
          <GlassCard className="p-5">
            <SectionHeader
              title={sel === 'all' ? 'Weekly Matrix' : `${teacherList.find((t: any) => t.id === sel)?.full_name || 'Teacher'} — Weekly Matrix`}
              subtitle={`${totalPeriods} periods · ${tc.size} teacher${tc.size === 1 ? '' : 's'} · ${totalHours.toFixed(1)}h this week`}
              action={
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-2.5 h-2.5 rounded-full bg-[#6D4CFF] inline-block" /> Period</span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-2.5 h-2.5 rounded-sm border border-dashed border-gray-300 inline-block" /> Free</span>
                </div>
              }
            />
            <div className="overflow-x-auto">
              <div className="grid min-w-[720px]" style={{ gridTemplateColumns: `54px repeat(6, minmax(0, 1fr))` }}>
                <div className="pb-2" />
                {days.map((d, i) => (
                  <div key={d} className="pb-2 text-center">
                    <div className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-extrabold ${i === todayIdx ? 'bg-[#6D4CFF] text-white shadow-md shadow-purple-500/30' : 'text-gray-500'}`}>
                      {d.slice(0, 3)}
                    </div>
                  </div>
                ))}
                {slotTimes.length === 0 && (
                  <div className="col-span-7 py-8 text-center text-xs text-gray-400">No time slots available for the selected scope.</div>
                )}
                {slotTimes.map((slot, si) => (
                  <div key={slot} className="contents">
                    <div className="py-1.5 pr-2 text-right">
                      <span className="text-[10px] font-mono font-bold text-gray-400 whitespace-nowrap">{slot}</span>
                    </div>
                    {days.map((d, di) => {
                      const cell = byDay[di].find((e: any) => timeOf(e) === slot);
                      const isToday = di === todayIdx;
                      if (cell) {
                        const c = colorPool[dayNum(cell) % colorPool.length] ?? '#6D4CFF';
                        return (
                          <motion.div key={d} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * si + 0.03 * di }}
                            className={`p-1.5 ${isToday ? 'rounded-xl bg-[#6D4CFF]/5 ring-1 ring-[#6D4CFF]/30' : ''}`}>
                            <div className="h-full rounded-lg p-2 border-l-[3px] hover:scale-[1.03] transition-transform duration-200 cursor-pointer" style={{ borderLeftColor: c, background: `${c}10` }}>
                              <div className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight truncate">{classOf(cell)}</div>
                              <div className="text-[9px] text-gray-500 leading-tight truncate">{subjectOf(cell)}</div>
                              {sel === 'all' && <div className="text-[9px] font-semibold text-gray-500 mt-0.5 truncate">{nameOf(cell)}</div>}
                              <div className="text-[9px] text-gray-400 mt-0.5 flex items-center gap-1 truncate"><DoorOpen size={9} /> {roomOf(cell)}</div>
                            </div>
                          </motion.div>
                        );
                      }
                      return (
                        <div key={d} className={`p-1.5 ${isToday ? 'rounded-xl bg-[#6D4CFF]/5 ring-1 ring-[#6D4CFF]/30' : ''}`}>
                          <div className="h-full min-h-[52px] rounded-lg border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
                            <span className="text-[9px] text-gray-300 dark:text-gray-600">—</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        )}

        {/* Conflict alerts */}
        {conflicts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-2xl p-5 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/30 border border-red-200 dark:border-red-800/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-red-700 dark:text-red-300 flex items-center gap-2"><AlertTriangle size={15} /> Scheduling Conflicts</h3>
                  <p className="text-[11px] text-red-500/80 mt-0.5">{conflicts.length} double-booking{conflicts.length === 1 ? '' : 's'} need attention</p>
                </div>
                <span className="text-2xl font-extrabold text-red-500">{conflicts.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {conflicts.slice(0, 8).map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-white/5 border border-red-200 dark:border-red-700/40 text-[11px] shadow-sm">
                    <span className="w-6 h-6 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center text-[9px] font-extrabold">{String(c.teacher).charAt(0)}</span>
                    <span className="font-bold text-red-700 dark:text-red-300">{c.teacher}</span>
                    <span className="text-red-500/80">·</span>
                    <span className="text-red-600/80">{c.classes.join(' & ')} · {c.day} {c.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Teaching load roster */}
        <GlassCard className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2"><Activity size={15} className="text-[#6D4CFF]" /> Weekly Teaching Load</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">{q ? `Results for "${scheduleSearch}"` : `${roster.length} staff · avg ${avgPer.toFixed(1)} periods · peak ${maxPer}`}</p>
            </div>
            <div className="flex items-center gap-1.5">
              {[['#22C55E', 'Light'], ['#F59E0B', 'Moderate'], ['#EF4444', 'Heavy']].map(([c, l]) => (
                <span key={l} className="flex items-center gap-1 text-[9px] font-semibold text-gray-500"><span className="w-2 h-2 rounded-full" style={{ background: c }} /> {l}</span>
              ))}
            </div>
          </div>
          {filteredRoster.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoster.map((r: any, i: number) => {
                const c = loadColor(r.cnt);
                const pct = Math.min(100, Math.round((r.cnt / maxPer) * 100));
                const band = r.cnt === 0
                  ? { label: 'Unassigned', cls: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' }
                  : r.cnt >= maxPer
                    ? { label: 'Heavy', cls: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50' }
                    : r.cnt >= maxPer * 0.6
                      ? { label: 'Moderate', cls: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50' }
                      : { label: 'Light', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50' };
                return (
                  <motion.div key={r.id || r.name} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 22 }}>
                    <GlassCard className="p-4 group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-xs font-extrabold shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${c}, ${c}bb)` }}>
                            {String(r.name || '?').charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{r.name}</div>
                            <div className="text-[10px] text-gray-400 truncate">{r.q || r.subject}</div>
                          </div>
                        </div>
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                            <circle cx="18" cy="18" r="15.915" fill="none" strokeWidth="3.5" className="stroke-gray-100 dark:stroke-gray-800" />
                            <motion.circle cx="18" cy="18" r="15.915" fill="none" stroke={c} strokeWidth="3.5" strokeLinecap="round"
                              initial={{ pathLength: 0 }} animate={{ pathLength: pct / 100 }} transition={{ duration: 0.8, delay: i * 0.06 }} />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold" style={{ color: c }}>{pct}</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mt-4">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
                          className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${c}, ${c}cc)` }} />
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-[10px] font-bold text-gray-500"><AnimatedNumber value={r.cnt} /> periods</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${band.cls}`}>{band.label}</span>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <EmptyWorkspaceState icon={Users2} title="No staff match" description="Try a different search term." />
          )}
        </GlassCard>
      </div>
    );
  };

  // ==================== RENDER: LEAVE TAB ====================
  const renderLeave = () => {
    const sLower = (v?: string) => (v || '').toLowerCase();
    const count = (s: string) => leaves.filter((l: any) => sLower(l.status) === s).length;
    const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const dayShort = (d?: string) => d ? new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '—';
    const dayCount = (s?: string, e?: string) => { if (!s || !e) return 1; return Math.max(1, Math.round((new Date(e).getTime() - new Date(s).getTime()) / 86400000) + 1); };

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayKey = today.toISOString().slice(0, 10);

    const total = leaves.length;
    const pending = count('pending');
    const approved = count('approved');
    const rejected = count('rejected');
    const approvalRate = (approved + rejected) ? Math.round((approved / (approved + rejected)) * 100) : 0;
    const onToday = leaves.filter((l: any) => sLower(l.status) === 'approved' && l.start_date && l.end_date && l.start_date <= todayKey && l.end_date >= todayKey);
    const upcoming = leaves.filter((l: any) => sLower(l.status) === 'approved' && l.start_date && l.start_date > todayKey).sort((a: any, b: any) => (a.start_date || '').localeCompare(b.start_date || ''));

    const byType: Record<string, number> = {};
    leaves.forEach((l: any) => { const k = l.leave_type || 'Other'; byType[k] = (byType[k] || 0) + 1; });
    const typeData = Object.entries(byType).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const monthKeys: string[] = [];
    for (let i = 5; i >= 0; i--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); monthKeys.push(d.toISOString().slice(0, 7)); }
    const monthTrend = monthKeys.map(k => ({ label: new Date(k + '-01').toLocaleDateString('en', { month: 'short' }), period: k, count: leaves.filter((l: any) => (l.created_at || l.start_date || '').startsWith(k)).length }));

    const q = leaveSearch.trim().toLowerCase();
    const filtered = leaves.filter((l: any) => {
      const ls = sLower(l.status);
      if (leaveFilter !== 'ALL' && ls !== leaveFilter) return false;
      if (q) {
        const hay = `${l.staff_name || ''} ${l.employee_id || ''} ${l.department || ''} ${l.leave_type || ''} ${l.reason || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const statusCfg: Record<string, { label: string; cls: string; dot: string }> = {
      pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50', dot: '#F59E0B' },
      approved: { label: 'Approved', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50', dot: '#22C55E' },
      rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50', dot: '#EF4444' },
      cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700', dot: '#9CA3AF' },
    };
    const typeDot = (t: string) => CHART_COLORS[(Object.keys(byType).indexOf(t) + Object.keys(byType).length) % CHART_COLORS.length] ?? '#6D4CFF';
    const kpiTiles = [
      { icon: Users2, label: 'Total Requests', value: total, color: '#6D4CFF', decimals: 0, suffix: '' },
      { icon: AlertTriangle, label: 'Pending Action', value: pending, color: '#F59E0B', decimals: 0, suffix: '' },
      { icon: CheckCircle, label: 'Approved', value: approved, color: '#22C55E', decimals: 0, suffix: '' },
      { icon: CalendarCheck, label: 'Approval Rate', value: approvalRate, color: '#3B82F6', decimals: 0, suffix: '%' },
    ];
    const tabs = [['ALL', 'All', total], ['pending', 'Pending', pending], ['approved', 'Approved', approved], ['rejected', 'Rejected', rejected]] as const;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div whileHover={{ rotate: -6, scale: 1.05 }} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-emerald-500/30">
              <CalendarCheck size={20} />
            </motion.div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white truncate">Leave Management</h2>
              <p className="text-[11px] text-gray-400">Review, approve and track staff leave applications.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => loadLeaves()} disabled={leaveLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              {leaveLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Refresh
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit flex-wrap">
          {tabs.map(([key, label, n]) => (
            <button key={key} onClick={() => setLeaveFilter(key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${leaveFilter === key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              {label} <span className="text-[10px] opacity-60 ml-0.5">{n}</span>
            </button>
          ))}
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiTiles.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 20 }}>
              <GlassCard className="p-4 flex items-center gap-4 group hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${k.color}22, ${k.color}0D)`, color: k.color }}><k.icon size={22} /></div>
                <div>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-baseline gap-0.5">
                    <AnimatedNumber value={k.value} decimals={k.decimals} />
                    <span className="text-sm text-gray-400 font-bold">{k.suffix}</span>
                  </div>
                  <div className="text-[11px] text-gray-400">{k.label}</div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* On leave today + upcoming */}
        {(onToday.length > 0 || upcoming.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {onToday.length > 0 && (
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">On Leave Today</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {onToday.slice(0, 10).map((l: any) => (
                    <span key={l.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      <span className="w-5 h-5 rounded-lg bg-emerald-500/15 flex items-center justify-center text-[9px] font-extrabold">{String(l.staff_name || '?').charAt(0)}</span>
                      {l.staff_name || 'Staff'} <span className="text-emerald-500/70">· {l.leave_type}</span>
                    </span>
                  ))}
                </div>
              </GlassCard>
            )}
            {upcoming.length > 0 && (
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-3"><CalendarDays size={14} className="text-[#6D4CFF]" /><span className="text-xs font-bold text-gray-900 dark:text-white">Upcoming Approved Leave</span></div>
                <div className="flex flex-wrap gap-2">
                  {upcoming.slice(0, 10).map((l: any) => (
                    <span key={l.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                      {l.staff_name || 'Staff'} <span className="text-blue-500/70">· {dayShort(l.start_date)}</span>
                    </span>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {/* Main grid: requests + analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leave requests list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search name, department, type..." value={leaveSearch} onChange={e => setLeaveSearch(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF] transition-all" />
              {leaveSearch && <button onClick={() => setLeaveSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>}
            </div>

            <GlassCard className="p-4">
              <SectionHeader title="Leave Applications" subtitle={q ? `Results for "${leaveSearch}"` : `${filtered.length} of ${total} requests`} />
              {leaveLoading && leaves.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-400"><Loader2 size={16} className="animate-spin inline mr-2" /> Loading leaves...</div>
              ) : filtered.length === 0 ? (
                <EmptyWorkspaceState icon={CalendarCheck} title="No leave requests" description={q ? 'Try a different search.' : 'Staff leave applications will appear here once submitted.'} />
              ) : (
                <div className="space-y-3">
                  {filtered.map((l: any, i: number) => {
                    const sc = statusCfg[sLower(l.status)] || { label: l.status || 'Unknown', cls: 'bg-gray-100 text-gray-600 border-gray-200', dot: '#9CA3AF' };
                    const isPending = sLower(l.status) === 'pending';
                    return (
                      <motion.div key={l.id || i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -2 }}>
                        <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0" style={{ background: typeDot(l.leave_type) }}>{String(l.staff_name || '?').charAt(0)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{l.staff_name || 'Staff'}</span>
                                {l.department && <span className="text-[10px] font-medium text-gray-400">{l.department}{l.designation ? ` · ${l.designation}` : ''}</span>}
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${typeDot(l.leave_type)}18`, color: typeDot(l.leave_type) }}>{l.leave_type}</span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500"><CalendarDays size={11} /> {dayShort(l.start_date)} — {dayShort(l.end_date)}</span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400"><Clock size={11} /> {dayCount(l.start_date, l.end_date)} day{dayCount(l.start_date, l.end_date) === 1 ? '' : 's'}</span>
                              </div>
                              {l.reason && <p className="text-[11px] text-gray-500 mt-1.5 line-clamp-2">{l.reason}</p>}
                            </div>
                            <div className="flex items-center gap-2 sm:flex-col sm:items-end flex-shrink-0">
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${sc.cls}`}>{sc.label}</span>
                              {isPending && (
                                <div className="flex items-center gap-1.5">
                                  <button onClick={() => updateLeaveStatus(l.id, 'APPROVED')} disabled={leaveProcessing === l.id}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 hover:-translate-y-0.5">
                                    {leaveProcessing === l.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />} Approve
                                  </button>
                                  <button onClick={() => updateLeaveStatus(l.id, 'REJECTED')} disabled={leaveProcessing === l.id}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-[10px] font-bold hover:bg-red-600 transition-all disabled:opacity-50 hover:-translate-y-0.5">
                                    <X size={11} /> Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Analytics sidebar */}
          <div className="space-y-6">
            <GlassCard className="p-5">
              <SectionHeader title="Leave by Type" subtitle="Distribution across categories" />
              {typeData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={150}>
                    <RePieChart>
                      <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4}>
                        {typeData.map((_, i) => <Cell key={i} fill={typeDot(typeData[i].name)} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 11 }} />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-3">
                    {typeData.slice(0, 5).map((t) => (
                      <div key={t.name} className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-2 text-gray-500"><span className="w-2.5 h-2.5 rounded-full" style={{ background: typeDot(t.name) }} /> {t.name}</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{t.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-xs text-gray-400">No data yet</div>
              )}
            </GlassCard>

            <GlassCard className="p-5">
              <SectionHeader title="Monthly Trend" subtitle="Requests across the last 6 months" />
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={22} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 11 }} cursor={{ fill: '#f5f5f5' }} />
                  <Bar dataKey="count" name="Requests" fill="#6D4CFF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  };

  // ==================== RENDER: PERFORMANCE TAB ====================
  const renderPerformance = () => {
    const rows: any[] = Array.isArray(performanceData) ? performanceData : [];
    const scoreOf = (p: any) => Number(p?.score ?? p?.rating ?? p?.performance_score ?? 0);
    const keyOf = (p: any) => p?.staff_id || p?.staffKey || p?.id || `${p?.staff_name}-${scoreOf(p)}`;
    const recDate = (p: any) => p?.review_date || p?.created_at || '';
    const latestMap = new Map<string, any>();
    rows.forEach((p: any) => {
      const k = keyOf(p);
      const prev = latestMap.get(k);
      if (!prev || (recDate(p) || '') >= (recDate(prev) || '')) latestMap.set(k, p);
    });
    const latest = Array.from(latestMap.values());

    const avg = latest.length ? Math.round(latest.reduce((s, p) => s + scoreOf(p), 0) / latest.length) : 0;
    const bands = [
      { label: 'Excellent', range: [90, 101], color: '#22C55E', sub: '90-100' },
      { label: 'Good', range: [75, 90], color: '#3B82F6', sub: '75-89' },
      { label: 'Average', range: [60, 75], color: '#F59E0B', sub: '60-74' },
      { label: 'Needs Improvement', range: [0, 60], color: '#EF4444', sub: '<60' },
    ].map((b) => ({ ...b, count: latest.filter((p) => scoreOf(p) >= b.range[0] && scoreOf(p) < b.range[1]).length }));

    const top = [...latest].sort((a, b) => scoreOf(b) - scoreOf(a));
    const topPerf = top[0];
    const attention = latest.filter((p) => scoreOf(p) < 60);
    const deptMap: Record<string, { avg: number; n: number }> = (() => {
      const m: Record<string, { s: number; n: number }> = {};
      latest.forEach((p) => { const d = p.department || 'General'; m[d] = m[d] || { s: 0, n: 0 }; m[d].s += scoreOf(p); m[d].n += 1; });
      return Object.fromEntries(Object.entries(m).map(([name, v]) => [name, { avg: Math.round(v.s / v.n), n: v.n }]));
    })();
    const deptBars = Object.entries(deptMap).map(([name, v]) => ({ name, avg: v.avg })).sort((a, b) => b.avg - a.avg);
    const topDept = deptBars[0];

    const trend = (() => {
      const m: Record<string, { s: number; n: number }> = {};
      rows.forEach((p) => {
        const d = p.review_date || p.created_at;
        if (!d) return;
        const key = String(d).slice(0, 7);
        m[key] = m[key] || { s: 0, n: 0 };
        m[key].s += scoreOf(p); m[key].n += 1;
      });
      return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0])).map(([month, v]) => ({ month: new Date(month + '-01').toLocaleDateString('en', { month: 'short' }), avg: Math.round(v.s / v.n) }));
    })();

    const kpiNames = Array.from(new Set(rows.flatMap((p) => Object.keys(p?.kpi_metrics || {}))).keys());
    const kpiAgg = kpiNames.map((name) => {
      const vals = latest.map((p) => Number(p?.kpi_metrics?.[name])).filter((n) => !Number.isNaN(n));
      return { name, avg: vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0 };
    });

    const insights: { text: string; tone: 'good' | 'warn' | 'info' }[] = [];
    if (!latest.length) {
      insights.push({ text: 'No performance reviews yet — once evaluations are recorded they will surface here with automated scoring.', tone: 'info' });
    } else {
      if (topPerf) insights.push({ text: `${topPerf.staff_name || 'A staff member'} leads the workforce with a ${scoreOf(topPerf)} score.`, tone: 'good' });
      if (topDept) insights.push({ text: `${topDept.name} is the strongest department, averaging ${topDept.avg} across ${deptMap[topDept.name]?.n || 0} staff.`, tone: 'good' });
      if (avg >= 75) insights.push({ text: `Workforce average is ${avg}% — an excellent overall standard.`, tone: 'good' });
      else if (avg < 60) insights.push({ text: `Workforce average is ${avg}% — a focused improvement program may be needed.`, tone: 'warn' });
      else insights.push({ text: `Workforce average is ${avg}%, in the healthy middle band with room to grow.`, tone: 'info' });
      if (attention.length) insights.push({ text: `${attention.length} staff ${attention.length === 1 ? 'is' : 'are'} below the quality threshold and would benefit from review.`, tone: 'warn' });
      if (trend.length >= 2) {
        const last = trend[trend.length - 1].avg, prev = trend[trend.length - 2].avg;
        insights.push({ text: last > prev ? `Performance improved ${last - prev} pts this month.` : last < prev ? `Performance dipped ${prev - last} pts this month.` : 'Performance held steady this month.', tone: last >= prev ? 'good' : 'warn' });
      }
    }

    const kpis = [
      { icon: Target, label: 'Avg Performance', value: avg, suffix: '%', color: '#6D4CFF' },
      { icon: Users2, label: 'Staff Evaluated', value: latest.length, suffix: '', color: '#3B82F6' },
      { icon: Star, label: 'Excellent', value: bands[0].count, suffix: '', color: '#22C55E' },
      { icon: AlertTriangle, label: 'Needs Support', value: attention.length, suffix: '', color: '#EF4444' },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div whileHover={{ rotate: -6, scale: 1.05 }} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-purple-500/30">
              <Medal size={20} />
            </motion.div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white truncate">Performance Management</h2>
              <p className="text-[11px] text-gray-400">Track staff scores, KPIs and workforce quality trends.</p>
            </div>
          </div>
          <button onClick={() => loadPerformance()} disabled={perfLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            {perfLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Refresh
          </button>
        </div>

        {/* AI Intelligence banner */}
        {latest.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.15 }}
            className="relative overflow-hidden rounded-2xl p-5 md:p-6 bg-gradient-to-br from-[#3A2E96] via-[#5B3FBF] to-[#EDE8FF] border border-[#6D4CFF]/30 text-white shadow-xl shadow-purple-900/20">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#A78BFA]/35 blur-3xl anim-float" />
              <div className="absolute -bottom-28 -left-16 w-64 h-64 rounded-full bg-emerald-400/20 blur-3xl anim-float" style={{ animationDelay: '1.2s' }} />
              <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.08)_0%,transparent_40%)]" />
            </div>
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-sm backdrop-blur">
                  <Sparkles size={12} className="text-[#E9E4FF]" /> Performance Intelligence
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/15 border border-emerald-300/40 text-[10px] font-bold text-emerald-100 backdrop-blur">
                  <Activity size={11} /> Workforce health: {avg >= 75 ? 'Strong' : avg >= 60 ? 'Healthy' : 'Needs attention'}
                </span>
              </div>

              <p className="text-sm md:text-[15px] font-extrabold leading-snug bg-gradient-to-r from-white via-[#E9E4FF] to-[#C4B5FD] bg-clip-text text-transparent">
                {latest.length ? `${avg >= 75 ? 'A high-performing' : avg >= 60 ? 'A steadily performing' : 'A workforce needing'} of ${latest.length} staff averaging ${avg}%${topDept ? ` — ${topDept.name} leading at ${topDept.avg}%.` : '.'}` : 'Track scores and KPIs to unlock performance intelligence.'}
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                {[
                  { label: 'Avg Score', value: avg, decimals: 0, suffix: '%' },
                  { label: 'Evaluated', value: latest.length, decimals: 0, suffix: '' },
                  { label: 'Top Performer', value: (top ? scoreOf(top) : 0), decimals: 0, suffix: '%' },
                  { label: 'Needs Support', value: attention.length, decimals: 0, suffix: '' },
                ].map((t, i) => (
                  <motion.div key={t.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.07 }}
                    className="rounded-xl bg-white/10 border border-white/15 p-3 hover:bg-white/[0.16] backdrop-blur transition-colors">
                    <div className="text-lg font-extrabold text-white flex items-baseline gap-1 leading-none">
                      <AnimatedNumber value={t.value} decimals={t.decimals} />
                      <span className="text-[9px] font-semibold text-[#E9E4FF]/80 whitespace-nowrap">{t.suffix}</span>
                    </div>
                    <div className="text-[10px] text-[#E9E4FF]/70 mt-1.5">{t.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col gap-2 mt-4">
                {insights.map((it, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.08 }}
                    className="flex items-start gap-2.5 text-[11px] leading-snug text-[#EFEAFF] bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 backdrop-blur">
                    <span className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${it.tone === 'good' ? 'bg-emerald-400/20 text-emerald-200' : it.tone === 'warn' ? 'bg-amber-400/20 text-amber-200' : 'bg-white/15 text-[#E9E4FF]'}`}>
                      {it.tone === 'warn' ? <AlertTriangle size={11} /> : <CheckCircle size={11} />}
                    </span>
                    {it.text}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 20 }}>
              <GlassCard className="p-4 flex items-center gap-4 group hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${k.color}22, ${k.color}0D)`, color: k.color }}><k.icon size={22} /></div>
                <div>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-baseline gap-0.5">
                    <AnimatedNumber value={k.value} decimals={0} />
                    <span className="text-sm text-gray-400 font-bold">{k.suffix}</span>
                  </div>
                  <div className="text-[11px] text-gray-400">{k.label}</div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Distribution + KPI breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="p-5">
            <SectionHeader title="Performance Distribution" subtitle="Staff by band" />
            {latest.length > 0 ? (
              <div className="space-y-4">
                {bands.map((band) => (
                  <div key={band.label} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: band.color }} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-gray-600 dark:text-gray-400">{band.label}</span>
                        <span className="text-xs font-extrabold text-gray-900 dark:text-white">{band.count} <span className="text-[10px] text-gray-400 normal-case">({Math.round(band.count / latest.length * 100)}%)</span></span>
                      </div>
                      <div className="h-1.5 mt-1 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${band.count / latest.length * 100}%` }} transition={{ duration: 0.7 }} style={{ background: band.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-400">No data yet</div>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader title="KPI Breakdown" subtitle="Average score by assessment area" />
            {kpiAgg.length > 0 ? (
              <div className="space-y-3">
                {kpiAgg.map((k) => (
                  <div key={k.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-gray-600 dark:text-gray-400 capitalize">{k.name.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-xs font-extrabold text-gray-900 dark:text-white">{k.avg}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <motion.div className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6]" initial={{ width: 0 }} animate={{ width: `${k.avg}%` }} transition={{ duration: 0.7 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-400">No KPI metrics recorded</div>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader title="Leaderboard" subtitle="Top rated staff" />
            {top.length > 0 ? (
              <div className="space-y-2">
                {top.slice(0, 6).map((perf, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' : i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' : i === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900' : 'bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6]'}`}>
                        {i === 0 ? <Medal size={14} /> : i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">{perf.staff_name || perf.full_name || perf.name || 'Staff'}</div>
                        <div className="text-[10px] text-gray-400 truncate">{perf.department || perf.role || '—'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-extrabold text-gray-900 dark:text-white">{scoreOf(perf)}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-400">No staff evaluated yet</div>
            )}
          </GlassCard>
        </div>

        {/* Charts: trend + department */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-5">
            <SectionHeader title="Performance Trend" subtitle="Monthly average score progression" />
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <ReLineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#999" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#999" domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                  <Line type="monotone" dataKey="avg" name="Avg Score" stroke="#6D4CFF" strokeWidth={2} dot={{ fill: '#6D4CFF', r: 3 }} />
                </ReLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">Trend data loading...</div>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader title="Department Performance" subtitle="Average score by department" />
            {deptBars.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptBars}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#999" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#999" domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                  <Bar dataKey="avg" name="Avg Score" radius={[6, 6, 0, 0]}>
                    {deptBars.map((d: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">Department data unavailable</div>
            )}
          </GlassCard>
        </div>

        {/* Empty state / CTA */}
        {latest.length === 0 && (
          <GlassCard className="p-6">
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg shadow-purple-500/30 mb-3"><Medal size={26} /></div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">No performance reviews yet</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1">Performance scores, KPIs and insights will appear here as soon as the first evaluation is recorded for your staff.</p>
            </div>
          </GlassCard>
        )}
      </div>
    );
  };

  const renderDocuments = () => {
    const validDocs: any[] = Array.isArray(staffDocs) ? staffDocs : [];
    const sL = (s?: string) => (s || '').toLowerCase();
    const pendingCount = validDocs.filter((d: any) => sL(d.status) === 'pending').length;
    const verifiedCount = validDocs.filter((d: any) => sL(d.status) === 'verified').length;
    const total = validDocs.length;
    const verifiedRate = total ? Math.round(verifiedCount / total * 100) : 0;

    const byType: Record<string, number> = {};
    validDocs.forEach((d: any) => { const k = d.document_type || 'Other'; byType[k] = (byType[k] || 0) + 1; });

    const staffCoverage: Record<string, { name: string; n: number }> = {};
    validDocs.forEach((d: any) => {
      const k = d.staff_name || d.staff_id || 'Unassigned';
      staffCoverage[k] = staffCoverage[k] || { name: k, n: 0 };
      staffCoverage[k].n += 1;
    });
    const covBars = Object.values(staffCoverage).sort((a, b) => b.n - a.n).slice(0, 6);
    const maxCov = covBars[0]?.n || 1;

    const filtered = validDocs.filter((d: any) => {
      const q = docSearch.toLowerCase();
      const matchQ = !q || (d.title || d.document_name || '').toLowerCase().includes(q) || (d.staff_name || '').toLowerCase().includes(q) || (d.document_type || '').toLowerCase().includes(q);
      const matchF = docFilter === 'ALL' || sL(d.status) === sL(docFilter);
      return matchQ && matchF;
    });

    const typeData = Object.entries(byType).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const insights: { text: string; tone: 'good' | 'warn' | 'info' }[] = [];
    if (!total) insights.push({ text: 'No documents yet — staff uploads (contracts, certificates, IDs) will appear here for central review.', tone: 'info' });
    else {
      insights.push({ text: `${total} document${total === 1 ? '' : 's'} on file across ${Object.keys(staffCoverage).length} staff.`, tone: 'info' });
      if (verifiedCount > 0) insights.push({ text: `${verifiedRate}% of documents verified — ${verifiedCount} ready for compliance.`, tone: verifiedRate >= 60 ? 'good' : 'warn' });
      if (pendingCount > 0) insights.push({ text: `${pendingCount} document${pendingCount === 1 ? '' : 's'} ${pendingCount === 1 ? 'is' : 'are'} awaiting verification review.`, tone: 'warn' });
      const docType = typeData[0];
      if (docType) insights.push({ text: `“${docType.name}” is the most common document type with ${docType.value} on record.`, tone: 'info' });
      const most = covBars[0];
      if (most) insights.push({ text: most.n === 0 ? 'Document coverage is starting to build out.' : `${most.name} holds the most documents (${most.n}).`, tone: 'good' });
    }

    const kpis = [
      { icon: FileText, label: 'Total Documents', value: total, color: '#6D4CFF' },
      { icon: CheckCircle, label: 'Verified', value: verifiedCount, color: '#22C55E' },
      { icon: Clock, label: 'Pending Review', value: pendingCount, color: '#F59E0B' },
      { icon: Shield, label: 'Verification Rate', value: verifiedRate, suffix: '%', color: '#3B82F6' },
    ];

    const tabs = [['ALL', 'All', total], ['pending', 'Pending', pendingCount], ['verified', 'Verified', verifiedCount]] as const;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div whileHover={{ rotate: -6, scale: 1.05 }} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#FB923C] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-amber-500/30">
              <Shield size={20} />
            </motion.div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white truncate">Documents Management</h2>
              <p className="text-[11px] text-gray-400">Centrally review staff documents, certificates, and compliance records.</p>
            </div>
          </div>
          <button onClick={() => loadDocuments()} disabled={docsLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            {docsLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Refresh
          </button>
        </div>

        {/* AI Intelligence banner */}
        {total > 0 && (
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.15 }}
            className="relative overflow-hidden rounded-2xl p-5 md:p-6 bg-gradient-to-br from-[#4A3A2F] via-[#7A5C3A] to-[#FCE9C8] border border-amber-500/30 text-white shadow-xl shadow-amber-900/20">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#FBBF24]/30 blur-3xl anim-float" />
              <div className="absolute -bottom-28 -left-16 w-64 h-64 rounded-full bg-[#F97316]/25 blur-3xl anim-float" style={{ animationDelay: '1.2s' }} />
              <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.09)_0%,transparent_42%)]" />
            </div>
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-sm backdrop-blur">
                  <Sparkles size={12} className="text-[#FDE68A]" /> Document Intelligence
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/15 border border-emerald-300/40 text-[10px] font-bold text-emerald-100 backdrop-blur">
                  <Shield size={11} /> Compliance: {verifiedRate >= 80 ? 'Excellent' : verifiedRate >= 50 ? 'On track' : 'Behind schedule'}
                </span>
              </div>

              <p className="text-sm md:text-[15px] font-extrabold leading-snug bg-gradient-to-r from-white via-[#FDEBD5] to-[#FBBF24] bg-clip-text text-transparent">
                {total > 0 ? `${total} documents across ${Object.keys(staffCoverage).length} staff — ${verifiedCount} verified (${verifiedRate}%).` : 'Upload documents to unlock compliance intelligence.'}
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                {[
                  { label: 'Total', value: total, decimals: 0, suffix: '' },
                  { label: 'Verified', value: verifiedCount, decimals: 0, suffix: '' },
                  { label: 'Pending', value: pendingCount, decimals: 0, suffix: '' },
                  { label: 'Verification', value: verifiedRate, decimals: 0, suffix: '%' },
                ].map((t, i) => (
                  <motion.div key={t.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.07 }}
                    className="rounded-xl bg-white/10 border border-white/15 p-3 hover:bg-white/[0.16] backdrop-blur transition-colors">
                    <div className="text-lg font-extrabold text-white flex items-baseline gap-1 leading-none">
                      <AnimatedNumber value={t.value} decimals={t.decimals} />
                      <span className="text-[9px] font-semibold text-amber-100/80 whitespace-nowrap">{t.suffix}</span>
                    </div>
                    <div className="text-[10px] text-amber-100/70 mt-1.5">{t.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col gap-2 mt-4">
                {insights.map((it, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.08 }}
                    className="flex items-start gap-2.5 text-[11px] leading-snug text-[#FFF8EC] bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 backdrop-blur">
                    <span className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${it.tone === 'good' ? 'bg-emerald-400/20 text-emerald-200' : it.tone === 'warn' ? 'bg-amber-400/20 text-amber-200' : 'bg-white/15 text-amber-50'}`}>
                      {it.tone === 'warn' ? <AlertTriangle size={11} /> : <CheckCircle size={11} />}
                    </span>
                    {it.text}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 20 }}>
              <GlassCard className="p-4 flex items-center gap-4 group hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${k.color}22, ${k.color}0D)`, color: k.color }}><k.icon size={22} /></div>
                <div>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-baseline gap-0.5">
                    <AnimatedNumber value={k.value} decimals={0} />
                    <span className="text-sm text-gray-400 font-bold">{k.suffix || ''}</span>
                  </div>
                  <div className="text-[11px] text-gray-400">{k.label}</div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit flex-wrap">
          {tabs.map(([key, label, n]) => (
            <button key={key} onClick={() => setDocFilter(key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${docFilter === key ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              {label} <span className="text-[10px] opacity-60 ml-0.5">{n}</span>
            </button>
          ))}
        </div>

        {/* Type breakdown + coverage */}
        {total > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="p-5">
              <SectionHeader title="By Type" subtitle="Documents grouped by category" />
              {typeData.length > 0 ? (
                <div className="space-y-3">
                  {typeData.slice(0, 6).map((t: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-[11px] text-gray-600 dark:text-gray-400 flex-1 capitalize capitalize first-letter:uppercase">{t.name.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-xs font-extrabold text-gray-900 dark:text-white">{t.value}</span>
                      <div className="w-14 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${t.value / total * 100}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-gray-400">No docs</div>
              )}
            </GlassCard>

            <GlassCard className="p-5">
              <SectionHeader title="Top Holders" subtitle="Staff with most documents" />
              {covBars.length > 0 ? (
                <div className="space-y-3">
                  {covBars.slice(0, 6).map((c: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[11px] text-gray-600 dark:text-gray-400 flex-1 truncate">{c.name}</span>
                      <span className="text-xs font-extrabold text-gray-900 dark:text-white">{c.n}</span>
                      <div className="w-14 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#EF923C]" style={{ width: `${c.n / maxCov * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-gray-400">No data</div>
              )}
            </GlassCard>

            <GlassCard className="p-5">
              <SectionHeader title="Update Status" subtitle="Compliance snapshot" />
              <div className="flex flex-col items-center py-2">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#F3D4A" strokeWidth="10" className="text-gray-100 dark:text-gray-700" />
                    <motion.circle cx="50" cy="50" r="42" fill="none" stroke="url(#docsGrad)" strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42} initial={{ strokeDashoffset: 2 * Math.PI * 42 }} animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - verifiedRate / 100) }} transition={{ duration: 1 }} />
                    <defs>
                      <linearGradient id="docsGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#F97316" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl font-extrabold text-gray-900 dark:text-white">{verifiedRate}%</div>
                      <div className="text-[9px] text-gray-400">verified</div>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 text-center mt-3">{verifiedCount} of {total} documents verified and ready for compliance.</div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Search + Documents table */}
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search document, type or staff..." value={docSearch} onChange={e => setDocSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF] transition-all" />
          {docSearch && (
            <button onClick={() => setDocSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>
          )}
        </div>

        {filtered.length === 0 ? (
          <GlassCard className="p-8">
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#F97316] flex items-center justify-center text-white shadow-lg shadow-amber-500/30 mb-3"><Shield size={26} /></div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">{validDocs.length ? 'No matching documents' : 'No documents yet'}</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1">{validDocs.length ? 'Try adjusting your search or filter.' : 'Staff documents, certificates, and contracts will appear here once uploaded.'}</p>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-5">
            <SectionHeader title="Document Registry" subtitle={`${filtered.length} of ${total} documents`} />
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700/50">
                    <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Document</th>
                    <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Staff</th>
                    <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Department</th>
                    <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc: any, i: number) => (
                    <tr key={doc.id || i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]"><FileText size={14} /></div>
                          <div>
                            <div className="text-xs font-semibold text-gray-900 dark:text-white">{doc.document_name || doc.file_name || doc.title || 'Document'}</div>
                            <div className="text-[10px] text-gray-400 capitalize">{doc.document_type || doc.category || 'Generic'} · {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-xs text-gray-600 dark:text-gray-300">{doc.staff_name || '—'}<div className="text-[10px] text-gray-400">{doc.employee_id || ''}</div></td>
                      <td className="py-3 text-xs text-gray-500">{doc.department || '—'}</td>
                      <td className="py-3"><StatusBadge status={doc.status || doc.verification_status || 'pending'} /></td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => doc.file_url ? window.open(doc.file_url, '_blank') : toast.success('Opening document')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors" title="Open"><Eye size={14} /></button>
                          <button onClick={() => toast.success('Downloading document')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors" title="Download"><Download size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    );
  };

  // ==================== RENDER: COMMUNICATION TAB ====================
  const renderCommunication = () => {
    const anns: any[] = Array.isArray(announcements) ? announcements : [];
    const total = anns.length;
    const thisMonth = anns.filter((a: any) => { const d = a.created_at ? new Date(a.created_at) : null; if (!d) return false; const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;
    const roleGroups = new Set(anns.map((a: any) => String(a.target_role || a.audience || 'All Staff')).filter(t => t && !t.startsWith('Individual:')).map(t => t));
    const individuals = anns.filter((a: any) => String(a.target_role || a.audience).startsWith('Individual:')).length;
    const audiences = roleGroups.size + (individuals > 0 ? 1 : 0);
    const last = anns[0];
    const sorted = [...anns].sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));

    const insights: { text: string; tone: 'good' | 'warn' | 'info' }[] = [];
    if (!total) insights.push({ text: 'No announcements yet — publish your first broadcast to reach the whole staff at once.', tone: 'info' });
    else {
      insights.push({ text: `${total} announcement${total === 1 ? '' : 's'} on record, ${thisMonth} sent this month.`, tone: 'info' });
      if (audiences > 1) insights.push({ text: `You are reaching ${audiences} different audience group${audiences === 1 ? '' : 's'} — good targeting coverage.`, tone: 'good' });
      else insights.push({ text: 'All communication currently targets one audience — segment broadcasts (Teaching, Support, by Department) for sharper reach.', tone: 'warn' });
      if (last) {
        const days = Math.max(0, Math.round((Date.now() - new Date(last.created_at || Date.now()).getTime()) / 86400000));
        insights.push({ text: days === 0 ? 'Your latest announcement went out today — staff are seeing fresh updates.' : days <= 3 ? `Your latest announcement was ${days} day${days === 1 ? '' : 's'} ago — keep the cadence steady.` : `No announcement in the last ${days} days — staff may be missing updates.`, tone: days <= 7 ? 'good' : 'warn' });
      }
    }

    const audienceChips = ['All Staff', 'Teaching Staff', 'Support Staff', 'Department', 'Leadership'];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div whileHover={{ rotate: -6, scale: 1.05 }} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-blue-500/30">
              <Megaphone size={20} />
            </motion.div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white truncate">Communication Center</h2>
              <p className="text-[11px] text-gray-400">Broadcast announcements and keep the workforce informed.</p>
            </div>
          </div>
          <button onClick={() => loadAnnouncements()} disabled={commLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            {commLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Refresh
          </button>
        </div>

        {/* AI Intelligence banner */}
        <motion.div initial={{ opacity: 0, y: 16, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl p-5 md:p-6 bg-gradient-to-br from-[#163A63] via-[#2563EB] to-[#D7E9FF] border border-blue-500/30 text-white shadow-xl shadow-blue-900/20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#38BDF8]/35 blur-3xl anim-float" />
            <div className="absolute -bottom-28 -left-16 w-64 h-64 rounded-full bg-[#06B6D4]/30 blur-3xl anim-float" style={{ animationDelay: '1.2s' }} />
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.09)_0%,transparent_42%)]" />
          </div>
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-sm backdrop-blur">
                <Sparkles size={12} className="text-[#BAE6FD]" /> Communication Intelligence
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/15 border border-emerald-300/40 text-[10px] font-bold text-emerald-100 backdrop-blur">
                <Activity size={11} /> Reach: {total ? 'Active' : 'Needs a first broadcast'}
              </span>
            </div>

            <p className="text-sm md:text-[15px] font-extrabold leading-snug bg-gradient-to-r from-white via-[#DBEAFF] to-[#7DD3FC] bg-clip-text text-transparent">
              {total > 0 ? `${total} announcements reach ${audiences} audience group${audiences === 1 ? '' : 's'} — ${thisMonth} sent this month.` : 'Publish your first announcement to reach all staff in one click.'}
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
              {[
                { label: 'Announcements', value: total, decimals: 0, suffix: '' },
                { label: 'This Month', value: thisMonth, decimals: 0, suffix: '' },
                { label: 'Audiences', value: audiences, decimals: 0, suffix: '' },
                { label: 'Reach Score', value: total ? Math.min(100, Math.round(50 + thisMonth * 10 + audiences * 8)) : 0, decimals: 0, suffix: '%' },
              ].map((t, i) => (
                <motion.div key={t.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.07 }}
                  className="rounded-xl bg-white/10 border border-white/15 p-3 hover:bg-white/[0.16] backdrop-blur transition-colors">
                  <div className="text-lg font-extrabold text-white flex items-baseline gap-1 leading-none">
                    <AnimatedNumber value={t.value} decimals={t.decimals} />
                    <span className="text-[9px] font-semibold text-blue-100/80 whitespace-nowrap">{t.suffix}</span>
                  </div>
                  <div className="text-[10px] text-blue-100/70 mt-1.5">{t.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col gap-2 mt-4">
              {insights.map((it, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.08 }}
                  className="flex items-start gap-2.5 text-[11px] leading-snug text-[#EAF3FF] bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 backdrop-blur">
                  <span className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${it.tone === 'good' ? 'bg-emerald-400/20 text-emerald-200' : it.tone === 'warn' ? 'bg-amber-400/20 text-amber-200' : 'bg-white/15 text-blue-50'}`}>
                    {it.tone === 'warn' ? <AlertTriangle size={11} /> : <CheckCircle size={11} />}
                  </span>
                  {it.text}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Compose / Broadcast */}
          <GlassCard className="p-5 lg:col-span-2">
            <SectionHeader title="Broadcast" subtitle="Send an announcement to staff" />
            <div className="space-y-3">

              {/* AI Draft */}
              <div className="rounded-xl border border-dashed border-[#6D4CFF]/40 bg-gradient-to-br from-[#6D4CFF]/5 to-[#8B5CF6]/5 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold text-[#6D4CFF] uppercase tracking-wider flex items-center gap-1"><Sparkles size={11} /> AI Assistant</span>
                  <span className="text-[9px] text-gray-400">Draft it in a click</span>
                </div>
                <input value={commDraftPrompt} onChange={e => setCommDraftPrompt(e.target.value)} placeholder="e.g. Remind staff about the Diwali holiday and closing time"
                  onKeyDown={e => { if (e.key === 'Enter') aisDraftBroadcast(); }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/30 focus:border-[#6D4CFF] transition-all mb-2" />
                <button onClick={aisDraftBroadcast} disabled={commDrafting || !commDraftPrompt.trim()}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-[#6D4CFF]/30 text-[#6D4CFF] text-[11px] font-bold hover:bg-[#6D4CFF] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {commDrafting ? <><Loader2 size={13} className="animate-spin" /> Drafting...</> : <><Sparkles size={13} /> Draft with AI</>}
                </button>
              </div>

              {/* Mode toggle */}
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Send To</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setCommMode('group')}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-bold transition-all ${commMode === 'group' ? 'bg-[#6D4CFF] text-white border-[#6D4CFF] shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-[#6D4CFF]/40'}`}>
                    <Users2 size={13} /> Group
                  </button>
                  <button onClick={() => setCommMode('individual')}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-bold transition-all ${commMode === 'individual' ? 'bg-[#6D4CFF] text-white border-[#6D4CFF] shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-[#6D4CFF]/40'}`}>
                    <UserPlus size={13} /> Individual
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Title</label>
                <input value={commTitle} onChange={e => setCommTitle(e.target.value)} placeholder="e.g. Holiday Notice, Meeting Update"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF] transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Message</label>
                <textarea value={commMsg} onChange={e => setCommMsg(e.target.value)} placeholder="Type your message here..."
                  className="w-full h-24 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF] transition-all" />
              </div>

              {commMode === 'group' ? (
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Audience</label>
                  <div className="flex flex-wrap gap-2">
                    {audienceChips.map(c => (
                      <button key={c} onClick={() => setCommAudience(c)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${commAudience === c ? 'bg-[#6D4CFF] text-white border-[#6D4CFF] shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-[#6D4CFF]/40'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1 block">Staff Member</label>
                  <select value={commIndividual} onChange={e => setCommIndividual(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF] transition-all ${commIndividual ? 'border-gray-200 dark:border-gray-700' : 'border-red-300 text-gray-400'}`}>
                    <option value="">Select a staff member…</option>
                    {staffArray.map((s: any) => (
                      <option key={s.id || s.staff_id || s.teacher_id} value={s.id || s.staff_id || s.teacher_id}>
                        {s.full_name || s.name} {s.department ? `· ${s.department}` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">A private direct message will be addressed to this member.</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-400">{commMsg.length} characters</span>
                <button onClick={sendBroadcast} disabled={!commTitle.trim() && !commMsg.trim() || commSending || (commMode === 'individual' && !commIndividual)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {commSending ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : <><Send size={14} /> {commMode === 'individual' ? 'Send Direct Message' : 'Send Broadcast'}</>}
                </button>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-5 lg:col-span-3">
            <SectionHeader title="Announcement Feed" subtitle={total ? `${total} published` : 'Recent staff announcements'} />
            {sorted.length > 0 ? (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {sorted.slice(0, 12).map((ann: any, i: number) => (
                  <motion.div key={ann.id || i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/40 hover:border-[#6D4CFF]/30 hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${ann.color || CHART_COLORS[i % CHART_COLORS.length]}22, ${ann.color || CHART_COLORS[i % CHART_COLORS.length]}0D)`, color: ann.color || CHART_COLORS[i % CHART_COLORS.length] }}>
                        <Megaphone size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">{ann.title || 'Announcement'}</div>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">{ann.created_at ? new Date(ann.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : ''}</span>
                        </div>
                        {ann.content && <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">{ann.content}</div>}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[9px] font-bold text-blue-600 dark:text-blue-300"><Users2 size={9} className="mr-1" />{ann.target_role || ann.audience || 'All Staff'}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-3 mx-auto"><Megaphone size={26} /></div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">No announcements yet</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">Compose your first broadcast to reach all staff at once.</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    );
  };

  // ==================== RENDER: ANALYTICS TAB ====================
  const renderAnalytics = () => {
    const ea: any = entAnalytics.data?.data || entAnalytics.data || {};
    const da: any = entDeptAnalytics.data?.data || entDeptAnalytics.data || {};
    const ra: any = entRoleAnalytics.data?.data || entRoleAnalytics.data || {};
    const att: any = entAttrition.data?.data || entAttrition.data || {};
    const wl: any = entWorkload.data?.data || entWorkload.data || {};
    const a: any = dashboardAnalytics.data?.data || dashboardAnalytics.data || {};

    const deptRaw: any[] = Array.isArray(da) ? da : Array.isArray(da.departments) ? da.departments : [];
    const roleRaw: any[] = Array.isArray(ra) ? ra : Array.isArray(ra.roles) ? ra.roles : [];
    const trend: any[] = Array.isArray(a.attendanceTrend) ? a.attendanceTrend : Array.isArray(att.trend) ? att.trend : [];
    const leaveByType: Record<string, number> = leaveAnalytics?.data?.by_type || {};
    const workloadArr: any[] = Array.isArray(wl) ? wl : Array.isArray(wl.distribution) ? wl.distribution : [];

    const presentToday = a.presentToday ?? attendanceData.filter((x: any) => x.status === 'present').length;
    const absentToday = a.absentToday ?? attendanceData.filter((x: any) => x.status === 'absent' || x.status === 'late').length;
    const onLeaveToday = attendanceData.some((x: any) => x.status === 'leave' || x.status === 'on leave') ? attendanceData.filter((x: any) => x.status === 'leave' || x.status === 'on leave').length : stats.onLeave;
    const totalStaff = (ea.total_staff ?? stats.total ?? staffArray.length) || 1;
    const attRate = (ea.attendance_rate ?? stats.attendancePct ?? (a.todayRate != null ? Number(a.todayRate) : 0)) || 0;
    const perfScore = ea.performance_score ?? stats.performanceScore ?? 0;
    const attritionRate = att.rate ?? att.attrition_rate ?? 0;
    const avgTenure = (() => { const yrs = (att.avg_tenure ?? att.average_tenure); if (yrs != null) return Number(yrs); const withJoining = staffArray.map((s: any) => s.joining_date || s.joined_date || s.date_of_joining).filter(Boolean); if (!withJoining.length) return 0; const total = withJoining.reduce((sum: number, d: any) => sum + Math.max(0, (Date.now() - new Date(d).getTime()) / (365.25 * 86400000)), 0); return Math.round((total / withJoining.length) * 10) / 10; })();
    const pendingLeaves = leaveAnalytics?.data?.pending ?? 0;
    const probationCount = staffArray.filter((s: any) => (s.status || '').toLowerCase() === 'probation').length;

    const growthData = staffGrowth.map((g) => ({ ...g }));
    const deptChart = (deptRaw.length ? deptRaw : departments).map((d: any) => {
      const deptName = d.name || d.department_name || '—';
      const deptPerfs = performanceData.filter((p: any) => (p.department || '').toLowerCase() === String(deptName).toLowerCase()).map((p: any) => Number(p.score ?? p.rating ?? 0)).filter(Boolean);
      const deptAtt = attendanceData.filter((x: any) => (x.department || x.dept || '').toLowerCase() === String(deptName).toLowerCase() && x.status === 'present').length;
      return {
        name: deptName,
        value: Number(d.count ?? d.total ?? d.staff_count ?? 1),
        att: Number(d.attendance_rate ?? d.attendance ?? deptAtt) > 0 ? Number(d.attendance_rate ?? d.attendance ?? deptAtt) : 0,
        perf: deptPerfs.length ? Math.round(deptPerfs.reduce((s: number, v: number) => s + v, 0) / deptPerfs.length) : Number(d.performance_score ?? d.performance ?? 0),
      };
    });
    const roleChart = roleRaw.length
      ? roleRaw.map((r: any) => ({ name: r.name || r.role || '—', value: Number(r.count ?? r.total ?? 0) }))
      : (() => { const m: Record<string, number> = {}; staffArray.forEach((s: any) => { const k = (s.role || s.designation || 'Staff') || 'Staff'; m[k] = (m[k] || 0) + 1; }); return Object.entries(m).map(([name, value]) => ({ name, value })); })();
    const leaveTypeChart = Object.entries(leaveByType).map(([name, value]: any) => ({ name, value: Number(value) }));
    const workloadChart = workloadArr.slice(0, 12).map((w: any) => ({ name: w.name || w.staff_name || w.teacher_name || '—', value: Number(w.count ?? w.load ?? w.total ?? 0) }));
    const trendChart = trend.map((t: any) => ({
      label: t.month || t.date || t.label || '',
      present: Number(t.Present ?? t.present ?? t.present_count ?? 0),
      absent: Number(t.Absent ?? t.absent ?? t.absent_count ?? 0),
      leave: Number(t.Leave ?? t.leave ?? t['On Leave'] ?? 0),
      rate: Number(t.Rate ?? t.rate ?? t.pct ?? t.percentage ?? 0),
    }));
    const topPerformers = [...performanceData]
      .sort((x: any, y: any) => Number(y.score ?? y.rating ?? 0) - Number(x.score ?? x.rating ?? 0))
      .slice(0, 6)
      .map((p: any) => ({ name: p.staff_name || p.full_name || p.name || 'Staff', score: Number(p.score ?? p.rating ?? 0), department: p.department || '' }));

    const growthDelta = (growthData[growthData.length - 1]?.count || 0) - (growthData[0]?.count || 0);

    const insights: { text: string; tone: 'good' | 'warn' | 'info' }[] = [];
    if (attRate >= 90) insights.push({ text: `Workforce attendance is strong at ${attRate}% — staff discipline is excellent.`, tone: 'good' });
    else if (attRate >= 75) insights.push({ text: `Attendance sits at ${attRate}% — steady, but watch for dips in low-performing departments.`, tone: 'info' });
    else if (attRate > 0) insights.push({ text: `Attendance rate is low at ${attRate}% — investigate absent patterns and schedule check-ins.`, tone: 'warn' });
    if (presentToday > 0) insights.push({ text: `${presentToday} staff present today${absentToday ? `, ${absentToday} absent or late` : ''}.`, tone: absentToday > 0 ? (absentToday > 3 ? 'warn' : 'info') : 'good' });
    if (pendingLeaves > 0) insights.push({ text: `${pendingLeaves} leave request${pendingLeaves === 1 ? '' : 's'} awaiting your approval — review to avoid scheduling gaps.`, tone: 'info' });
    if (topPerformers.length) insights.push({ text: `Top performer right now: ${topPerformers[0].name} at ${topPerformers[0].score}% — consider public recognition.`, tone: 'good' });
    if (growthDelta !== 0) insights.push({ text: `Staff strength ${growthDelta > 0 ? `grew by +${growthDelta}` : `declined by ${growthDelta}`} over the last 6 months.`, tone: growthDelta >= 0 ? 'good' : 'warn' });
    if (attritionRate > 0) insights.push({ text: `Attrition is at ${attritionRate}% with an average tenure of ${avgTenure || '—'} year${avgTenure === 1 ? '' : 's'}.`, tone: attritionRate > 15 ? 'warn' : 'info' });
    if (probationCount > 0) insights.push({ text: `${probationCount} staff on probation — schedule onboarding reviews before confirmation.`, tone: 'info' });
    if (!insights.length) insights.push({ text: 'Workforce analytics are loading — insights will appear as data becomes available.', tone: 'info' });

    const recs: { icon: any; text: string; tone: string }[] = [];
    if (pendingLeaves > 0) recs.push({ icon: CalendarCheck, text: `Approve/reject ${pendingLeaves} pending leave request${pendingLeaves === 1 ? '' : 's'}`, tone: '#F59E0B' });
    if (absentToday > 3) recs.push({ icon: AlertTriangle, text: `${absentToday} staff absent/late today — follow up with department heads`, tone: '#EF4444' });
    const lowDept = deptChart.filter((d: any) => d.perf > 0 && d.perf < 60);
    if (lowDept.length) recs.push({ icon: Target, text: `${lowDept[0].name} scores below 60% performance — plan focused training`, tone: '#EF4444' });
    if (topPerformers.length) recs.push({ icon: Award, text: `Recognise ${topPerformers[0].name} — top performance this period`, tone: '#22C55E' });
    if (probationCount > 0) recs.push({ icon: UserPlus, text: `${probationCount} probation reviews due — confirm or extend`, tone: '#6D4CFF' });
    if (!recs.length) recs.push({ icon: BadgeCheck, text: 'All analytics are healthy — no action flags detected', tone: '#22C55E' });

    const kpis = [
      { icon: Users, label: 'Total Staff', value: totalStaff, suffix: '', color: '#6D4CFF' },
      { icon: Activity, label: 'Attendance Rate', value: attRate, suffix: '%', color: '#22C55E' },
      { icon: TrendingUp, label: 'Avg Performance', value: perfScore, suffix: '%', color: '#3B82F6' },
      { icon: CalendarCheck, label: 'Pending Leaves', value: pendingLeaves, suffix: '', color: '#F59E0B' },
      { icon: Calendar, label: 'On Leave Today', value: onLeaveToday, suffix: '', color: '#F472B6' },
      { icon: Building2, label: 'Departments', value: departments.length, suffix: '', color: '#14B8A6' },
      { icon: Shield, label: 'Retention', value: 100 - attritionRate, suffix: '%', color: '#8B5CF6' },
      { icon: Clock, label: 'Avg Tenure', value: avgTenure, suffix: 'y', color: '#EC4899' },
    ];

    const exportAnalytics = () => {
      const rows: any[] = staffArray.map((m: any) => ({ Name: m.full_name || m.name || '', Department: m.department || '', Role: m.role || '', Designation: m.designation || '', Status: m.status || '', 'Joining Date': m.joining_date || '', Phone: m.phone || '', Email: m.email || '' }));
      const csv = [Object.keys(rows[0] || {}).join(','), ...rows.map(r => Object.values(r).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = 'staff-analytics.csv'; link.click();
      URL.revokeObjectURL(url);
      toast.success('Analytics exported');
    };

    const loadingAny = entAnalytics.loading || entDeptAnalytics.loading || entRoleAnalytics.loading || entAttrition.loading || entWorkload.loading;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div whileHover={{ rotate: -6, scale: 1.05 }} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-purple-500/30">
              <BarChart3 size={20} />
            </motion.div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white truncate">Workforce Analytics</h2>
              <p className="text-[11px] text-gray-400">AI-driven insights into attendance, performance, growth, and retention.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { entAnalytics.refetch?.(); entDeptAnalytics.refetch?.(); entRoleAnalytics.refetch?.(); entAttrition.refetch?.(); entWorkload.refetch?.(); dashboardAnalytics.refetch?.(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              {loadingAny ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Refresh
            </button>
            <button onClick={exportAnalytics}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all">
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl p-5 md:p-6 bg-gradient-to-br from-[#2A1E6E] via-[#6D4CFF] to-[#D6CBFF] border border-purple-500/30 text-white shadow-xl shadow-purple-900/20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#A78BFA]/40 blur-3xl anim-float" />
            <div className="absolute -bottom-28 -left-16 w-64 h-64 rounded-full bg-[#8B5CF6]/35 blur-3xl anim-float" style={{ animationDelay: '1.2s' }} />
            <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute inset-0 opacity-[0.08]"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="anim-pulse-glow" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">AI Analytics Intelligence</span>
              <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-white/15 border border-white/20 backdrop-blur">Auto-generated</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[{ label: 'Total Staff', value: totalStaff, suffix: '' }, { label: 'Attendance', value: attRate, suffix: '%' }, { label: 'Performance', value: perfScore, suffix: '%' }, { label: 'Retention', value: 100 - attritionRate, suffix: '%' }].map((t, i) => (
                <motion.div key={t.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.07 }}
                  className="rounded-xl bg-white/10 border border-white/15 p-3 backdrop-blur hover:bg-white/15 hover:-translate-y-0.5 transition-all">
                  <div className="text-lg font-extrabold leading-none">
                    <AnimatedNumber value={t.value} decimals={0} /><span className="text-[9px] font-semibold opacity-80 ml-0.5">{t.suffix}</span>
                  </div>
                  <div className="text-[10px] text-purple-100/80 mt-1.5">{t.label}</div>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-col gap-2 mt-4">
              {insights.map((it, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.08 }}
                  className="flex items-start gap-2.5 text-[11px] leading-snug text-[#F1EDFF] bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 backdrop-blur">
                  <span className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${it.tone === 'good' ? 'bg-emerald-400/20 text-emerald-200' : it.tone === 'warn' ? 'bg-amber-400/20 text-amber-200' : 'bg-white/15 text-purple-50'}`}>
                    {it.tone === 'warn' ? <AlertTriangle size={11} /> : <CheckCircle size={11} />}
                  </span>
                  {it.text}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 20 }}>
              <GlassCard className="p-3.5 flex flex-col gap-2 group hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" style={{ background: `linear-gradient(135deg, ${k.color}22, ${k.color}0D)`, color: k.color }}><k.icon size={18} /></div>
                <div>
                  <div className="text-lg font-extrabold text-gray-900 dark:text-white flex items-baseline gap-0.5">
                    <AnimatedNumber value={k.value} decimals={0} />
                    {k.suffix && <span className="text-xs text-gray-400 font-bold">{k.suffix}</span>}
                  </div>
                  <div className="text-[10px] text-gray-400 leading-tight">{k.label}</div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-5">
            <SectionHeader title="Staff Growth" subtitle="Headcount trend — last 6 months" />
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={growthData}>
                  <defs><linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6D4CFF" stopOpacity={0.35} /><stop offset="100%" stopColor="#6D4CFF" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#999" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="#999" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="count" name="Staff" stroke="#6D4CFF" strokeWidth={2} fill="url(#growthGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-[240px] flex items-center justify-center text-xs text-gray-400">No growth data yet</div>}
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader title="Attendance Trend" subtitle="Present / absent — latest period" />
            {trendChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={trendChart}>
                  <defs>
                    <linearGradient id="presGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22C55E" stopOpacity={0.35} /><stop offset="100%" stopColor="#22C55E" stopOpacity={0} /></linearGradient>
                    <linearGradient id="absGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} /><stop offset="100%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} stroke="#999" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="#999" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="present" name="Present" stroke="#22C55E" strokeWidth={2} fill="url(#presGrad)" />
                  <Area type="monotone" dataKey="absent" name="Absent" stroke="#EF4444" strokeWidth={2} fill="url(#absGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="h-[240px] flex items-center justify-center text-xs text-gray-400">Attendance trend loading...</div>}
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="p-5">
            <SectionHeader title="Department Distribution" subtitle="Staff by department" />
            {deptChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={deptChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} stroke="#999" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} stroke="#999" width={90} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                  <Bar dataKey="value" name="Staff" fill="#6D4CFF" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="h-[240px] flex items-center justify-center text-xs text-gray-400">No department data</div>}
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader title="Role Mix" subtitle="Staff by role" />
            {roleChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <RePieChart>
                  <Pie data={roleChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4}>
                    {roleChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                </RePieChart>
              </ResponsiveContainer>
            ) : <div className="h-[240px] flex items-center justify-center text-xs text-gray-400">No role data</div>}
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader title="Leave Breakdown" subtitle="Requests by leave type" />
            {leaveTypeChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <RePieChart>
                  <Pie data={leaveTypeChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} paddingAngle={4} label={({ name }: any) => name}>
                    {leaveTypeChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                </RePieChart>
              </ResponsiveContainer>
            ) : <div className="h-[240px] flex items-center justify-center text-xs text-gray-400">No leave data</div>}
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-5">
            <SectionHeader title="Top Performers" subtitle="Highest scoring staff this period" />
            {topPerformers.length > 0 ? (
              <div className="space-y-3">
                {topPerformers.map((p, i) => (
                  <motion.div key={p.name + i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/40 hover:border-[#6D4CFF]/30 transition-all">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-extrabold text-white flex-shrink-0 bg-gradient-to-br ${i === 0 ? 'from-amber-400 to-orange-500' : i === 1 ? 'from-slate-300 to-slate-400' : i === 2 ? 'from-amber-600 to-amber-800' : 'from-[#6D4CFF] to-[#8B5CF6]'}`}>
                      {i === 0 ? <Medal size={16} /> : i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">{p.name}</span>
                        <span className="text-xs font-extrabold text-[#6D4CFF]">{p.score}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, p.score)}%` }} transition={{ delay: 0.3 + i * 0.08, duration: 0.7 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6]" />
                      </div>
                      {p.department && <div className="text-[10px] text-gray-400 mt-1">{p.department}</div>}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : <div className="h-[240px] flex items-center justify-center text-xs text-gray-400">No performance data yet</div>}
          </GlassCard>

          <div className="flex flex-col gap-6">
            <GlassCard className="p-5 flex-1">
              <SectionHeader title="Actionable Recommendations" subtitle="AI-suggested next steps" />
              <div className="space-y-2.5">
                {recs.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/40 hover:-translate-y-0.5 hover:shadow-md transition-all">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${r.tone}18`, color: r.tone }}><r.icon size={14} /></div>
                    <span className="text-[11px] leading-snug text-gray-600 dark:text-gray-300 font-medium pt-1">{r.text}</span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            {workloadChart.length > 0 && (
              <GlassCard className="p-5">
                <SectionHeader title="Workload Distribution" subtitle="Top loaded staff" />
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={workloadChart.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 8 }} stroke="#999" interval={0} angle={-20} textAnchor="end" height={40} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 9 }} stroke="#999" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                    <Bar dataKey="value" name="Load" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>
            )}
          </div>
        </div>

        {deptChart.some((d: any) => d.att > 0 || d.perf > 0) && (
          <GlassCard className="p-5">
            <SectionHeader title="Department Health" subtitle="Attendance & performance by department" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#999" interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#999" />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                <Bar dataKey="att" name="Attendance %" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="perf" name="Performance %" fill="#6D4CFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        )}
      </div>
    );
  };

  // ==================== RENDER: SALARY TAB (real payroll data) ====================
  const renderSalary = () => {
    const raw: any[] = Array.isArray(salaryList.data) ? salaryList.data : (salaryList.data?.data || []);
    const payslipRaw: any[] = Array.isArray(orgPayslips.data) ? orgPayslips.data : (orgPayslips.data?.data || []);
    const rows = raw.map((m: any) => {
      const monthly = Number(m.currentSalary ?? m.salary ?? m.current_salary ?? 0) || 0;
      const band = monthly <= 25000 ? '₹0 – 25K' : monthly <= 50000 ? '₹25K – 50K' : monthly <= 100000 ? '₹50K – 1L' : '₹1L+';
      return {
        id: m.id, name: m.full_name || m.name || '—', role: m.designation || m.role || 'Staff',
        department: m.department || 'General', status: m.status || 'Active',
        monthly, annual: monthly * 12, band, email: m.email || '', lastStatus: m.lastPayrollStatus || 'none',
      };
    });
    const staffById: Record<string, any> = {};
    raw.forEach((m: any) => { if (m?.id) staffById[m.id] = m; });
    const nowMonth = new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const nowYear = new Date().getFullYear();
    const payslipRegister = (payslipRaw || [])
      .filter((p: any) => String(p.month || '').toUpperCase() === nowMonth && Number(p.year) === nowYear)
      .map((p: any) => {
        const st = p.staff || staffById[p.staff_id] || {};
        return {
          id: p.id, staff_id: p.staff_id,
          employee_id: st.employee_id || st.staff_unique_id || '—',
          name: st.name || st.full_name || st.name || '—', role: st.role || st.designation || 'Staff',
          department: st.department || 'General', email: st.email || '',
          period: `${p.month || ''} ${p.year || ''}`, gross: Number(p.gross_pay) || 0,
          deductions: Number(p.deductions) || 0, net: Number(p.net_pay) || 0,
          payment_method: p.payment_method || 'BANK', status: p.status || 'PENDING',
        };
      })
      .sort((a: any, b: any) => b.gross - a.gross);

    const historyPayslips = (payslipRaw || [])
      .map((p: any) => {
        const st = p.staff || staffById[p.staff_id] || {};
        return {
          id: p.id, staff_id: p.staff_id,
          employee_id: st.employee_id || st.staff_unique_id || '—',
          name: st.name || st.full_name || st.name || '—', role: st.role || st.designation || 'Staff',
          department: st.department || 'General', email: st.email || '',
          month: String(p.month || '').toUpperCase(), year: Number(p.year) || 0,
          period: `${p.month || ''} ${p.year || ''}`, gross: Number(p.gross_pay) || 0,
          deductions: Number(p.deductions) || 0, net: Number(p.net_pay) || 0,
          payment_method: p.payment_method || 'BANK', status: p.status || 'PENDING',
        };
      })
      .sort((a: any, b: any) => (b.year || 0) - (a.year || 0) || String(b.month || '').localeCompare(String(a.month || '')));

    const historyMonths = Array.from(new Set(historyPayslips.map((r: any) => r.period).filter(Boolean))).sort((a: any, b: any) => {
      const [am, ay] = String(a).split(' '); const [bm, by] = String(b).split(' ');
      const mn = (m: string) => ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].indexOf(String(m).toUpperCase()) + 1;
      return (Number(by) || 0) - (Number(ay) || 0) || mn(bm) - mn(am);
    });
    const histYearOptions = Array.from(new Set(historyPayslips.map((r: any) => r.year).filter(Boolean))).sort((a: any, b: any) => b - a);
    const histMonthOptions = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const histDeptOptions = Array.from(new Set(historyPayslips.map((r: any) => r.department).filter(Boolean))) as string[];
    const histPayOptions = Array.from(new Set(historyPayslips.map((r: any) => (r.payment_method || 'BANK').toUpperCase()).filter(Boolean))) as string[];
    const histStatusOptions = Array.from(new Set([...historyPayslips.map((r: any) => (r.status || 'PENDING').toUpperCase()).filter(Boolean), 'PENDING', 'PAID', 'CANCELLED'])) as string[];
    const q = String(histSearch || '').trim().toLowerCase();
    const filteredHistory = historyPayslips.filter((r: any) =>
      (histYear === 'all' || Number(r.year) === Number(histYear)) &&
      (histMonth === 'all' || String(r.month).toUpperCase() === histMonth) &&
      (histDept === 'all' || r.department === histDept) &&
      (histPay === 'all' || (r.payment_method || 'BANK').toUpperCase() === histPay) &&
      (histStatus === 'all' || (r.status || 'PENDING').toUpperCase() === histStatus) &&
      (!q || [r.employee_id, r.name, r.email, r.role, r.department, r.period].some(v => String(v || '').toLowerCase().includes(q)))
    );
    const filteredMonths = Array.from(new Set(filteredHistory.map((r: any) => r.period).filter(Boolean))).sort((a: any, b: any) => {
      const [am, ay] = String(a).split(' '); const [bm, by] = String(b).split(' ');
      const mn = (m: string) => ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].indexOf(String(m).toUpperCase()) + 1;
      return (Number(by) || 0) - (Number(ay) || 0) || mn(bm) - mn(am);
    });
    const an = payrollAnalytics.data?.data || payrollAnalytics.data || {};
    const trend: any[] = Array.isArray(an.monthlyTrend) ? an.monthlyTrend : [];
    const monthlyNetPaid = payslipRegister.reduce((s: number, r: any) => s + Number(r.net || 0), 0);
    const allTimeNetPaid = (payslipRaw || []).reduce((s: number, p: any) => s + (Number(p.net_pay) || 0), 0);
    const avgNetPerStaff = payslipRegister.length ? Math.round(monthlyNetPaid / payslipRegister.length) : 0;
    const paidThisMonth = payslipRegister.filter((r: any) => (r.status || '').toUpperCase() === 'PAID').length;
    const pendingThisMonth = payslipRegister.filter((r: any) => (r.status || '').toUpperCase() === 'PENDING').length;

    const saveSalary = async () => {
      const id = salaryForm.staff_id;
      if (!id) return toast.error('Select a staff member');
      if (!salaryForm.base_salary && !salaryForm.allowances) return toast.error('Enter base salary');
      const matched = (orgSalaries.data?.data || orgSalaries.data || []).find((s: any) => s.staff_id === id);
      const isEdit = Boolean(matched);
      const name = matched?.name || staffArray.find((s: any) => s.id === id)?.full_name || 'this staff member';
      const gross = (Number(salaryForm.base_salary) || 0) + (Number(salaryForm.allowances) || 0) + (salaryForm.components || []).reduce((s2: number, c: any) => s2 + (Number(c.amount) || 0), 0);
      const net = Math.max(0, gross - (Number(salaryForm.deductions) || 0));
      if (!window.confirm(`${isEdit ? 'Update' : 'Save'} salary for ${name}?\n\nGross: ₹${gross.toLocaleString('en-IN')}\nDeductions: ₹${(Number(salaryForm.deductions) || 0).toLocaleString('en-IN')}\nNet: ₹${net.toLocaleString('en-IN')}\n\n${isEdit ? 'This will overwrite the existing salary structure.' : 'This will create a new salary structure.'}`)) return;
      setSalarySaving(true);
      try {
        await staffApi.updateSalary(id, {
          base_salary: Number(salaryForm.base_salary) || 0,
          allowances: Number(salaryForm.allowances) || 0,
          deductions: Number(salaryForm.deductions) || 0,
          pay_frequency: salaryForm.pay_frequency || 'MONTHLY',
          components: (salaryForm.components || [])
            .filter((c: any) => c && (c.label || Number(c.amount) > 0))
            .map((c: any) => ({ label: c.label || 'Component', amount: Number(c.amount) || 0 })),
        });
        toast.success('Salary saved for staff member');
        setSalaryModal(false);
        setSalaryForm({ staff_id: '', base_salary: '', pay_frequency: 'MONTHLY', allowances: '', deductions: '', components: [{ label: '', amount: '' }] });
        salaryList.refetch?.();
        payrollAnalytics.refetch?.();
        orgSalaries.refetch?.();
      } catch (e: any) {
        toast.error(e?.message || 'Failed to save salary');
      } finally {
        setSalarySaving(false);
      }
    };

    const editSalary = (s: any) => {
      if (!s) return;
      setSalaryForm({
        staff_id: s.staff_id || s.id,
        base_salary: s.base_salary ?? '',
        pay_frequency: s.pay_frequency || 'MONTHLY',
        allowances: s.allowances ?? '',
        deductions: s.deductions ?? '',
        components: Array.isArray(s.components) && s.components.length ? s.components.map((c: any) => ({ label: c.label || '', amount: c.amount ?? '' })) : [{ label: '', amount: '' }],
      });
      setSalaryTab('add');
      toast.success(`Loaded salary for ${s.name || 'staff member'} for editing`);
    };

    const onSalaryStaffChange = async (staff_id: string) => {
      setSalaryForm((prev: any) => ({ ...prev, staff_id }));
      if (!staff_id) return;
      const saved = (orgSalaries.data?.data || orgSalaries.data || []).find((s: any) => s.staff_id === staff_id);
      if (saved) {
        editSalary(saved);
        return;
      }
      try {
        const res: any = await staffApi.getSalary(staff_id);
        const payroll = res?.data?.payroll || res?.payroll;
        if (payroll) {
          setSalaryForm({
            staff_id,
            base_salary: Number(payroll.base_salary) || '',
            pay_frequency: payroll.pay_frequency || 'MONTHLY',
            allowances: Number(payroll.allowances) || '',
            deductions: Number(payroll.deductions) || '',
            components: Array.isArray(payroll.components) && payroll.components.length ? payroll.components.map((c: any) => ({ label: c.label || '', amount: c.amount ?? '' })) : [{ label: '', amount: '' }],
          });
        }
      } catch { /* keep blank form */ }
    };

    const onPayslipStaffChange = async (staff_id: string) => {
      setPayslipForm({ ...payslipForm, staff_id, gross_pay: '', deductions: '' });
      if (!staff_id) return;
      try {
        const res: any = await staffApi.getSalary(staff_id);
        const payroll = res?.data?.payroll || res?.payroll;
        if (payroll) {
          const componentsSum = ((payroll.components || []) as any[]).reduce((s: number, c: any) => s + (Number(c.amount) || 0), 0);
          const gross = Number(payroll.base_salary || 0) + (Number(payroll.allowances) || 0) + componentsSum;
          setPayslipForm((prev: any) => ({
            ...prev, staff_id,
            gross_pay: gross || Number(payroll.currentSalary ?? payroll.net_salary ?? 0) || '',
            deductions: Number(payroll.deductions) || 0,
          }));
        } else {
          const matched = (salaryList.data?.data || salaryList.data || []).find((m: any) => m.id === staff_id);
          const gross = Number(matched?.currentSalary ?? matched?.salary ?? matched?.current_salary ?? 0) || 0;
          setPayslipForm((prev: any) => ({ ...prev, staff_id, gross_pay: gross || '', deductions: Number(matched?.deductions) || 0 }));
        }
      } catch {
        const matched = (salaryList.data?.data || salaryList.data || []).find((m: any) => m.id === staff_id);
        const gross = Number(matched?.currentSalary ?? matched?.salary ?? matched?.current_salary ?? 0) || 0;
        setPayslipForm((prev: any) => ({ ...prev, staff_id, gross_pay: gross || '', deductions: Number(matched?.deductions) || 0 }));
      }
    };

    const generatePayslip = async () => {
      const id = payslipForm.staff_id;
      if (!id) return toast.error('Select a staff member');
      const curMonth = new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const curYear = new Date().getFullYear();
      if (hasPayslip(id)) return toast.error('A payslip already exists for this staff member this month');
      const staff = staffArray.find((s: any) => s.id === id);
      const gross = Number(payslipForm.gross_pay) || 0;
      const deductions = Number(payslipForm.deductions) || 0;
      if (!window.confirm(`Generate payslip for ${staff?.full_name || staff?.name || 'this staff member'} for ${curMonth} ${curYear}?\n\nGross: ₹${gross.toLocaleString('en-IN')}\nDeductions: ₹${deductions.toLocaleString('en-IN')}\nNet: ₹${Math.max(0, gross - deductions).toLocaleString('en-IN')}\n\nOnly one payslip is allowed per staff member per month.`)) return;
      setPayslipSaving(true);
      try {
        await staffApi.createPayslip(id, {
          month: curMonth,
          year: curYear,
          gross_pay: gross,
          deductions,
          payment_method: payslipForm.payment_method || 'BANK',
        });
        toast.success('Payslip generated');
        setPayslipModal(false);
        setPayslipForm({ staff_id: '', month: new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase(), year: new Date().getFullYear(), gross_pay: '', deductions: '', payment_method: 'BANK' });
        orgPayslips.refetch?.();
      } catch (e: any) {
        toast.error(e?.message || 'Failed to generate payslip');
      } finally {
        setPayslipSaving(false);
      }
    };

    const generateBulkPayslips = async () => {
      if (!bulkSelected.length) return toast.error('Select at least one staff member');
      const curMonth = new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const curYear = new Date().getFullYear();
      if (!window.confirm(`Generate payslips for ${bulkSelected.length} staff member(s) for ${curMonth} ${curYear}?\n\nGross & deductions are read from each staff member's saved salary structure.`)) return;
      setBulkGenerating(true);
      let done = 0, skipped = 0, failedCount = 0;
      try {
        for (const sid of bulkSelected) {
          try {
            const res: any = await staffApi.getSalary(sid);
            const payroll = res?.data?.payroll || res?.payroll;
            const componentsSum = ((payroll?.components || []) as any[]).reduce((s2: number, c: any) => s2 + (Number(c.amount) || 0), 0);
            const gross = payroll ? (Number(payroll.base_salary) || 0) + (Number(payroll.allowances) || 0) + componentsSum : 0;
            const deductions = payroll ? Number(payroll.deductions) || 0 : 0;
            if (!gross && !payroll) { skipped++; continue; }
            await staffApi.createPayslip(sid, {
              month: curMonth, year: curYear,
              gross_pay: gross, deductions,
              payment_method: payslipForm.payment_method || 'BANK',
            });
            done++;
          } catch (e: any) {
            if (String(e?.message || '').includes('already')) { skipped++; } else { skipped++; failedCount++; }
          }
        }
        if (done) toast.success(`${done} payslip(s) generated`);
        if (skipped - failedCount > 0) toast.info(`${skipped - failedCount} already had a payslip this month`);
        if (failedCount) toast.error(`${failedCount} failed`);
        setBulkSelected([]);
        orgPayslips.refetch?.();
      } finally {
        setBulkGenerating(false);
      }
    };

    const hasPayslip = (sid: string) => payslipRegister.some((r: any) => r.staff_id === sid);

    const updatePayslipStatus = async (p: any, status: string) => {
      if (status === 'PAID' && !window.confirm(`Mark payslip as PAID for ${p.name || 'this staff member'} (₹${Number(p.net || 0).toLocaleString('en-IN')})?`)) return;
      if (status === 'CANCELLED' && !window.confirm(`Cancel payslip for ${p.name || 'this staff member'}?`)) return;
      try {
        await staffApi.updatePayslipStatus(p.id, status);
        toast.success(`Payslip marked ${status}`);
        orgPayslips.refetch?.();
      } catch (e: any) {
        toast.error(e?.message || 'Failed to update payslip');
      }
    };

    const confirmAllPending = async () => {
      const pending = payslipRegister.filter((r: any) => (r.status || '').toUpperCase() !== 'PAID' && (r.status || '').toUpperCase() !== 'CANCELLED');
      if (!pending.length) return toast.info('No pending payslips to confirm');
      const total = pending.reduce((s: number, r: any) => s + Number(r.net || 0), 0);
      if (!window.confirm(`Confirm ${pending.length} pending payslip(s) as PAID?\n\nTotal net: ₹${total.toLocaleString('en-IN')}`)) return;
      let done = 0;
      try {
        for (const p of pending) {
          try { await staffApi.updatePayslipStatus(p.id, 'PAID'); done++; } catch { /* keep going */ }
        }
        toast.success(`${done} payslip(s) marked PAID`);
        orgPayslips.refetch?.();
      } finally {
        setBulkGenerating(false);
      }
    };

    const exportSalary = () => {
      const csv = [['Emp ID', 'Employee', 'Role', 'Department', 'Period', 'Gross', 'Deductions', 'Net', 'Status'].join(','), ...payslipRegister.map((r: any) => [r.employee_id, r.name, r.role, r.department, r.period, r.gross, r.deductions, r.net, r.status].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'staff-payslips.csv'; a.click(); URL.revokeObjectURL(url); toast.success('Payslip register exported');
    };

    const salaryNav = [
      { key: 'overview', label: 'Dashboard', icon: LayoutDashboard, color: '#0EA5E9' },
      { key: 'add', label: 'Add Salary', icon: Plus, color: '#14B8A6' },
      { key: 'payslip', label: 'Generate Payslip', icon: FileText, color: '#6D4CFF' },
      { key: 'register', label: 'Payslip Register', icon: Receipt, color: '#F59E0B' },
      { key: 'history', label: 'History', icon: CalendarDays, color: '#A855F7' },
    ] as const;
    const activeNav = salaryNav.find(n => n.key === salaryTab) || salaryNav[0];

    const areaData = trend.map((t: any) => ({ month: t.month, gross: Number(t.gross) || 0, net: Number(t.net) || 0, deductions: Number(t.deductions) || 0 }));
    const orgSalaryRows: any[] = (orgSalaries.data?.data || orgSalaries.data || []);
    const deptData: any[] = orgSalaryRows.length ? Object.entries(orgSalaryRows.reduce((m: Record<string, { count: number; cost: number }>, s: any) => {
      const dept = s.department || 'General';
      const gross = (Number(s.base_salary) || 0) + (Number(s.allowances) || 0) + (Array.isArray(s.components) ? (s.components as any[]).reduce((a, c) => a + (Number(c.amount) || 0), 0) : 0);
      if (!m[dept]) m[dept] = { count: 0, cost: 0 };
      m[dept].count += 1;
      m[dept].cost += gross;
      return m;
    }, {})).map(([name, d]: any) => ({ name, cost: Number(d.cost) || 0, count: d.count || 0 })).sort((a, b) => b.cost - a.cost) : [];

    const kpis = [
      { icon: Wallet, label: 'Monthly Payout', value: monthlyNetPaid, color: '#0EA5E9', fmt: true },
      { icon: TrendingUp, label: 'Total Net Paid', value: allTimeNetPaid, color: '#14B8A6', fmt: true },
      { icon: UserCheck, label: 'Avg Net / Staff', value: avgNetPerStaff, color: '#6D4CFF', fmt: true },
      { icon: Users, label: 'Staff on Payroll', value: rows.length, color: '#F59E0B', fmt: false },
      { icon: Receipt, label: 'Payslips Generated', value: payslipRegister.length, color: '#EC4899', fmt: false },
      { icon: CheckCircle2, label: 'Paid', value: paidThisMonth, color: '#22C55E', fmt: false },
      { icon: Clock, label: 'Pending', value: pendingThisMonth, color: '#F59E0B', fmt: false },
    ];

    return (
      <div className="space-y-6">
        {/* Hero header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#0EA5E9] via-[#0891B2] to-[#14B8A6] text-white shadow-xl shadow-cyan-500/20">
          <div className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-teal-300/20 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <motion.div whileHover={{ rotate: -8, scale: 1.08 }} className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center flex-shrink-0 shadow-xl">
                <Banknote size={26} />
              </motion.div>
              <div className="min-w-0">
                <h2 className="text-xl font-black truncate drop-shadow">Salary & Payroll Hub</h2>
                <p className="text-[11px] text-cyan-100">{nowMonth} {nowYear} · Compensation, components & payslips in one place</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/25 text-[10px] font-bold backdrop-blur"><Calendar size={10} /> {nowMonth} {nowYear}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/25 text-[10px] font-bold backdrop-blur"><Users size={10} /> {rows.length} staff</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/25 text-[10px] font-bold backdrop-blur"><Receipt size={10} /> {payslipRegister.length} payslips</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={exportSalary} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 text-[#0891B2] text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"><Download size={13} /> Export CSV</button>
            </div>
          </div>
          <div className="absolute right-8 bottom-4 hidden lg:block opacity-20 text-[90px] font-black pointer-events-none select-none">{'₹'}</div>
        </motion.div>

        {/* Sub navigation */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-1.5 shadow-sm">
          {salaryNav.map((n) => {
            const Icon = n.icon;
            const active = salaryTab === n.key;
            return (
              <button key={n.key} onClick={() => setSalaryTab(n.key as any)}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {active && <motion.span layoutId="salaryTabPill" className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#14B8A6] shadow-lg shadow-cyan-500/30" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                <span className="relative z-10 flex items-center gap-1.5"><n.icon size={14} /> {n.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* ==================== DASHBOARD ==================== */}
          {salaryTab === 'overview' && (
            <motion.div key="ov" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k, i) => (
                  <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <GlassCard className="p-4 flex flex-col gap-2 group hover:-translate-y-1 hover:shadow-xl transition-all cursor-default">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: `${k.color}18`, color: k.color }}><k.icon size={18} /></div>
                        {i === 0 && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">this month</span>}
                      </div>
                      <div className="text-lg font-extrabold text-gray-900 dark:text-white tabular-nums">{k.fmt ? '₹' : ''}{Number(k.value || 0).toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-gray-400">{k.label}</div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard className="p-5">
                  <SectionHeader title="Payroll Trend" subtitle="Gross vs Net across months" />
                  {areaData.length ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={areaData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.35} /><stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} /></linearGradient>
                          <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#14B8A6" stopOpacity={0.35} /><stop offset="100%" stopColor="#14B8A6" stopOpacity={0} /></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} tickFormatter={(v: any) => `₹${Math.round(Number(v) / 1000)}K`} />
                        <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
                        <Area type="monotone" dataKey="gross" name="Gross" stroke="#0EA5E9" strokeWidth={2.5} fill="url(#grossGrad)" />
                        <Area type="monotone" dataKey="net" name="Net" stroke="#14B8A6" strokeWidth={2.5} fill="url(#netGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : <EmptyState message="Payroll trend will appear once records exist." />}
                </GlassCard>

                <GlassCard className="p-5">
                  <SectionHeader title="Cost by Department" subtitle="Monthly salary liability" />
                  {deptData.length ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={deptData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} tickFormatter={(v: any) => `₹${Math.round(Number(v) / 1000)}K`} />
                        <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
                        <Bar dataKey="cost" name="Salary Cost" radius={[7, 7, 0, 0]}>
                          {deptData.map((_, i) => <Cell key={i} fill={['#0EA5E9', '#14B8A6', '#6D4CFF', '#F59E0B', '#EC4899', '#22C55E', '#3B82F6', '#A855F7'][i % 8]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <EmptyState message="Department cost will appear here." />}
                </GlassCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard className="p-5 lg:col-span-3">
                  <SectionHeader title="Recent Payslips" subtitle={`${payslipRegister.length} generated · ${nowMonth} ${nowYear}`} action={<button onClick={() => setSalaryTab('register')} className="text-[10px] font-bold text-cyan-600 hover:underline">View all →</button>} />
                  {payslipRegister.length ? (
                    <div className="overflow-x-auto -mx-5 px-5">
                      <table className="w-full text-left min-w-[640px]">
                        <thead><tr className="text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700/60">{['Emp ID', 'Employee', 'Period', 'Gross', 'Deductions', 'Net', 'Status'].map(h => <th key={h} className="py-2.5 pr-3 font-semibold">{h}</th>)}</tr></thead>
                        <tbody>{payslipRegister.slice(0, 6).map((r: any, i: number) => (
                          <motion.tr key={r.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                            className="border-b border-gray-50 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                            <td className="py-3 pr-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 tabular-nums">{r.employee_id}</td>
                            <td className="py-3 pr-3"><div className="text-xs font-bold text-gray-900 dark:text-white">{r.name}</div><div className="text-[10px] text-gray-400">{r.role}</div></td>
                            <td className="py-3 pr-3 text-xs text-gray-500">{r.period}</td>
                            <td className="py-3 pr-3 text-xs font-semibold text-gray-900 dark:text-white tabular-nums">₹{r.gross.toLocaleString('en-IN')}</td>
                            <td className="py-3 pr-3 text-xs font-semibold text-red-500 dark:text-red-400 tabular-nums">-₹{r.deductions.toLocaleString('en-IN')}</td>
                            <td className="py-3 pr-3 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">₹{r.net.toLocaleString('en-IN')}</td>
                            <td className="py-3 pr-3"><span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${(r.status || '').toUpperCase() === 'PAID' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300'}`}>{r.status || 'PENDING'}</span></td>
                          </motion.tr>
                        ))}</tbody>
                      </table>
                    </div>
                  ) : <EmptyState message="No payslips generated yet this month." />}
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* ==================== ADD SALARY ==================== */}
          {salaryTab === 'add' && (
            <motion.div key="add" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <GlassCard className="p-6">
                <SectionHeader title="Add / Update Staff Salary" subtitle="Set base salary, allowances, deductions and components" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-3">
                    <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Staff Member *</span>
                      <select value={salaryForm.staff_id} onChange={e => onSalaryStaffChange(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20">
                        <option value="">Select staff…</option>
                        {staffArray.map((s: any) => <option key={s.id} value={s.id}>{s.staff_unique_id || s.employee_id ? `[${s.staff_unique_id || s.employee_id}] ` : ''}{s.full_name || s.name || 'Staff'}{s.designation ? ` (${s.designation})` : ''}</option>)}
                      </select></label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Base Salary *</span>
                        <input type="number" min={0} value={salaryForm.base_salary} onChange={e => setSalaryForm({ ...salaryForm, base_salary: e.target.value })} placeholder="0" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" /></label>
                      <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Pay Frequency</span>
                        <select value={salaryForm.pay_frequency} onChange={e => setSalaryForm({ ...salaryForm, pay_frequency: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs">
                          <option value="MONTHLY">Monthly</option><option value="WEEKLY">Weekly</option><option value="DAILY">Daily</option>
                        </select></label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Allowances</span>
                        <input type="number" min={0} value={salaryForm.allowances} onChange={e => setSalaryForm({ ...salaryForm, allowances: e.target.value })} placeholder="0" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" /></label>
                      <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Deductions</span>
                        <input type="number" min={0} value={salaryForm.deductions} onChange={e => setSalaryForm({ ...salaryForm, deductions: e.target.value })} placeholder="0" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30" /></label>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => setSalaryModal(false)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors">Cancel</button>
                      <button onClick={saveSalary} disabled={salarySaving} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#14B8A6] text-white text-xs font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all">{salarySaving ? 'Saving…' : 'Save Salary'}</button>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Salary Components</span>
                      <button onClick={() => setSalaryForm({ ...salaryForm, components: [...(salaryForm.components || []), { label: '', amount: '' }] })} className="text-[10px] font-bold text-[#14B8A6] hover:underline">+ Add component</button>
                    </div>
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-3 space-y-2">
                      {(salaryForm.components || []).map((c: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <input value={c.label} onChange={e => { const comps = [...(salaryForm.components || [])]; comps[i] = { ...comps[i], label: e.target.value }; setSalaryForm({ ...salaryForm, components: comps }); }} placeholder="e.g. HRA, Transport, PF…" className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20" />
                          <input type="number" min={0} value={c.amount} onChange={e => { const comps = [...(salaryForm.components || [])]; comps[i] = { ...comps[i], amount: e.target.value }; setSalaryForm({ ...salaryForm, components: comps }); }} placeholder="₹" className="w-24 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/20" />
                          {i > 0 && <button onClick={() => setSalaryForm({ ...salaryForm, components: (salaryForm.components || []).filter((_: any, j: number) => j !== i) })} className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 transition-colors"><X size={13} /></button>}
                        </div>
                      ))}
                      {(!salaryForm.components || !salaryForm.components.length) && <p className="text-[11px] text-gray-400 text-center py-2">Add components like HRA, transport, special allowance, PF, etc.</p>}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">Components are summed into gross salary alongside allowances for accurate payslips.</p>
                  </div>
                </div>
                </GlassCard>

                <GlassCard className="p-5 mt-6">
                  <SectionHeader title="Saved Salary Structures" subtitle={`${((orgSalaries.data?.data || orgSalaries.data || []) as any[]).length || 0} on record`} action={<button onClick={() => orgSalaries.refetch?.()} className="text-[10px] font-bold text-cyan-600 hover:underline">Refresh</button>} />
                  <div className="overflow-x-auto -mx-5 px-5 mt-2">
                    {((orgSalaries.data?.data || orgSalaries.data || []) as any[]).length ? (
                      <table className="w-full text-left min-w-[820px]">
                        <thead><tr className="text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700/60">{['Emp ID', 'Employee', 'Department', 'Base', 'Allowances', 'Deductions', 'Components', 'Net', 'Frequency', 'Action'].map(h => <th key={h} className="py-2.5 pr-3 font-semibold">{h}</th>)}</tr></thead>
                        <tbody>{((orgSalaries.data?.data || orgSalaries.data || []) as any[]).map((s: any, i: number) => (
                          <motion.tr key={s.id || s.staff_id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.03, 0.4) }}
                            className="border-b border-gray-50 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                            <td className="py-3 pr-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 tabular-nums">{s.employee_id || '—'}</td>
                            <td className="py-3 pr-3"><div className="text-xs font-bold text-gray-900 dark:text-white">{s.name || 'Staff'}</div><div className="text-[10px] text-gray-400">{s.role || ''}</div></td>
                            <td className="py-3 pr-3 text-xs text-gray-600 dark:text-gray-300">{s.department || 'General'}</td>
                            <td className="py-3 pr-3 text-xs font-semibold text-gray-900 dark:text-white tabular-nums">₹{Number(s.base_salary || 0).toLocaleString('en-IN')}</td>
                            <td className="py-3 pr-3 text-xs font-semibold text-gray-900 dark:text-white tabular-nums">₹{Number(s.allowances || 0).toLocaleString('en-IN')}</td>
                            <td className="py-3 pr-3 text-xs font-semibold text-red-500 dark:text-red-400 tabular-nums">-₹{Number(s.deductions || 0).toLocaleString('en-IN')}</td>
                            <td className="py-3 pr-3 text-xs font-semibold text-gray-900 dark:text-white tabular-nums">₹{Number((Array.isArray(s.components) ? s.components : []).reduce((a2: number, c2: any) => a2 + (Number(c2.amount) || 0), 0) || 0).toLocaleString('en-IN')}</td>
                            <td className="py-3 pr-3 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">₹{Number(s.net_salary || 0).toLocaleString('en-IN')}</td>
                            <td className="py-3 pr-3"><span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold">{s.pay_frequency || 'MONTHLY'}</span></td>
                            <td className="py-3 pr-3">
                              <button onClick={() => editSalary(s)} className="text-[10px] font-bold text-cyan-600 hover:underline flex items-center gap-1"><Edit3 size={11} /> Edit</button>
                            </td>
                          </motion.tr>
                        ))}</tbody>
                      </table>
                    ) : <EmptyState message="No salary structures saved yet. Use the form above to add one." />}
                  </div>
                </GlassCard>
            </motion.div>
          )}

          {/* ==================== GENERATE PAYSLIP ==================== */}
          {salaryTab === 'payslip' && (
            <motion.div key="ps" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <div className="grid grid-cols-1 gap-6">
                <GlassCard className="p-6">
                  <SectionHeader title="Generate Payslip" subtitle="Fixed to the current month · gross & deductions read from the saved salary structure" />
                  <div className="space-y-3 mt-4">
                    <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Staff Member *</span>
                      <select value={payslipForm.staff_id} onChange={e => onPayslipStaffChange(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20">
                        <option value="">Select staff…</option>
                        {staffArray.map((s: any) => <option key={s.id} value={s.id} disabled={hasPayslip(s.id)}>{hasPayslip(s.id) ? '✓ ' : ''}{s.staff_unique_id || s.employee_id ? `[${s.staff_unique_id || s.employee_id}] ` : ''}{s.full_name || s.name || 'Staff'}{s.designation ? ` (${s.designation})` : ''}{hasPayslip(s.id) ? ' · payslip exists' : ''}</option>)}
                      </select></label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Month</span>
                        <input readOnly value={nowMonth} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 focus:outline-none cursor-not-allowed" /></label>
                      <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Year</span>
                        <input readOnly value={nowYear} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 focus:outline-none cursor-not-allowed" /></label>
                      <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Gross Pay</span>
                        <input readOnly value={payslipForm.gross_pay || ''} placeholder="₹0" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none cursor-not-allowed" /></label>
                      <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Deductions</span>
                        <input readOnly value={payslipForm.deductions || ''} placeholder="₹0" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-red-500 font-bold focus:outline-none cursor-not-allowed" /></label>
                    </div>
                    <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Payment Method</span>
                      <select value={payslipForm.payment_method} onChange={e => setPayslipForm({ ...payslipForm, payment_method: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20">
                        <option value="BANK">Bank Transfer</option><option value="CASH">Cash</option>
                      </select></label>
                    <p className="text-[10px] text-amber-500 bg-amber-50 dark:bg-amber-500/10 rounded-lg px-3 py-2">Note: Payslips can only be generated for the current month, once per staff member.</p>
                    <div className="flex items-center gap-2 justify-end pt-1">
                      <button onClick={generatePayslip} disabled={payslipSaving} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#EC4899] text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all">{payslipSaving ? 'Generating…' : 'Generate Payslip'}</button>
                    </div>
                  </div>
                </GlassCard>
              </div>

              <GlassCard className="p-6 mt-6">
                <SectionHeader title="Bulk Generate Payslips" subtitle="Select staff to generate payslips for all of them at once · current month" />
                <div className="flex items-center gap-2 mt-3 mb-3 flex-wrap">
                  <button onClick={() => setBulkSelected(((staffArray as any[]).filter((s: any) => !hasPayslip(s.id)) as any[]).map((s: any) => s.id))} className="text-[10px] font-bold text-[#6D4CFF] hover:underline">Select all (no payslip yet)</button>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <button onClick={() => setBulkSelected([])} className="text-[10px] font-bold text-gray-500 hover:underline">Clear</button>
                  <div className="ml-auto">
                    <button onClick={generateBulkPayslips} disabled={bulkGenerating || !bulkSelected.length} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#EC4899] text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed">{bulkGenerating ? 'Generating…' : `Generate Payslips (${bulkSelected.length})`}</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {(staffArray as any[]).map((s: any) => {
                    const has = hasPayslip(s.id);
                    const selected = bulkSelected.includes(s.id);
                    return (
                      <label key={s.id} onClick={() => { if (!has) { setBulkSelected((prev: string[]) => selected ? prev.filter(x => x !== s.id) : [...prev, s.id]); } }}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 cursor-pointer border transition-all ${has ? 'opacity-40 cursor-not-allowed bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-700/40' : selected ? 'bg-[#6D4CFF]/10 border-[#6D4CFF]/40' : 'bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:border-[#6D4CFF]/40'}`}>
                        <input type="checkbox" checked={selected} disabled={has} readOnly className="accent-[#6D4CFF] w-3.5 h-3.5 pointer-events-none" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{s.staff_unique_id || s.employee_id ? `[${s.staff_unique_id || s.employee_id}] ` : ''}{s.full_name || s.name || 'Staff'}</div>
                          <div className="text-[9px] text-gray-400">{s.designation || s.role || 'Staff'}{has ? ' · has payslip' : ''}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          )}
          {salaryTab === 'register' && (
            <motion.div key="reg" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <GlassCard className="p-5">
                <SectionHeader title="Payslip Register" subtitle={`${payslipRegister.length} staff with generated payslips · ${nowMonth} ${nowYear}`} action={
                  <div className="flex items-center gap-2">
                    {payslipRegister.some((r: any) => (r.status || '').toUpperCase() !== 'PAID' && (r.status || '').toUpperCase() !== 'CANCELLED') && (
                      <button onClick={confirmAllPending} disabled={bulkGenerating} className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1 disabled:opacity-50"><CheckCircle2 size={11} /> Confirm All Pending</button>
                    )}
                    <button onClick={exportSalary} className="text-[10px] font-bold text-cyan-600 hover:underline flex items-center gap-1"><Download size={11} /> Export</button>
                  </div>
                } />
                <div className="overflow-x-auto -mx-5 px-5 mt-2">
                  {payslipRegister.length ? (
                    <table className="w-full text-left min-w-[820px]">
                      <thead><tr className="text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700/60">{['Emp ID', 'Employee', 'Role', 'Department', 'Period', 'Gross', 'Deductions', 'Net', 'Payment', 'Status', 'Actions'].map(h => <th key={h} className="py-2.5 pr-3 font-semibold">{h}</th>)}</tr></thead>
                      <tbody>{payslipRegister.map((r: any, i: number) => (
                        <motion.tr key={r.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.03, 0.4) }}
                          className="border-b border-gray-50 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                          <td className="py-3 pr-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 tabular-nums">{r.employee_id}</td>
                          <td className="py-3 pr-3"><div className="text-xs font-bold text-gray-900 dark:text-white">{r.name}</div><div className="text-[10px] text-gray-400">{r.email}</div></td>
                          <td className="py-3 pr-3 text-xs text-gray-600 dark:text-gray-300">{r.role}</td>
                          <td className="py-3 pr-3 text-xs text-gray-600 dark:text-gray-300">{r.department}</td>
                          <td className="py-3 pr-3 text-xs font-semibold text-gray-900 dark:text-white">{r.period}</td>
                          <td className="py-3 pr-3 text-xs font-semibold text-gray-900 dark:text-white tabular-nums">₹{r.gross.toLocaleString('en-IN')}</td>
                          <td className="py-3 pr-3 text-xs font-semibold text-red-500 dark:text-red-400 tabular-nums">-₹{r.deductions.toLocaleString('en-IN')}</td>
                          <td className="py-3 pr-3 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">₹{r.net.toLocaleString('en-IN')}</td>
                          <td className="py-3 pr-3"><span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${(r.payment_method || '').toUpperCase() === 'CASH' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300'}`}>{r.payment_method || 'BANK'}</span></td>
                          <td className="py-3 pr-3"><span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${(r.status || '').toUpperCase() === 'PAID' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' : (r.status || '').toUpperCase() === 'CANCELLED' ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300'}`}>{r.status || 'PENDING'}</span></td>
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-1.5">
                              {(r.status || '').toUpperCase() !== 'PAID' && (
                                <button onClick={() => updatePayslipStatus(r, 'PAID')} title="Mark as paid" className="w-6 h-6 rounded-lg flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"><CheckCircle2 size={13} /></button>
                              )}
                              {(r.status || '').toUpperCase() !== 'CANCELLED' && (
                                <button onClick={() => updatePayslipStatus(r, 'CANCELLED')} title="Cancel payslip" className="w-6 h-6 rounded-lg flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 transition-colors"><X size={13} /></button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}</tbody>
                    </table>
                  ) : <EmptyState message="No payslips generated yet. Use the Generate Payslip tab to create one." />}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* ==================== HISTORY ==================== */}
          {salaryTab === 'history' && (
            <motion.div key="hist" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <GlassCard className="p-5">
                <SectionHeader title="Payslip History" subtitle={`${filteredHistory.length} records across ${filteredMonths.length} month(s)`} />
                {historyPayslips.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <label className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 min-w-[200px] flex-1 sm:flex-none sm:min-w-[240px]">
                      <Search size={13} className="text-gray-400 flex-shrink-0" />
                      <input value={histSearch} onChange={(e) => setHistSearch(e.target.value)} placeholder="Search name, emp ID, role, department…" className="bg-transparent text-xs text-gray-700 dark:text-gray-200 w-full focus:outline-none placeholder:text-gray-400" />
                    </label>
                    <select value={histYear} onChange={(e) => { setHistYear(e.target.value); setHistMonth('all'); }} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A855F7]/40 cursor-pointer">
                      <option value="all">All Years</option>
                      {histYearOptions.map((y: any) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <label className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 flex items-center gap-2 cursor-pointer" title="Filter by month">
                      <select value={histMonth} onChange={(e) => setHistMonth(e.target.value)} className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer">
                        <option value="all">All Months</option>
                        {histMonthOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <CalendarDays size={13} className="text-[#A855F7]" />
                    </label>
                    <select value={histDept} onChange={(e) => setHistDept(e.target.value)} title="Filter by department" className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer">
                      <option value="all">All Departments</option>
                      {histDeptOptions.sort().map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select value={histPay} onChange={(e) => setHistPay(e.target.value)} title="Filter by payment method" className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer">
                      <option value="all">All Payments</option>
                      {histPayOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select value={histStatus} onChange={(e) => setHistStatus(e.target.value)} title="Filter by status" className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer">
                      <option value="all">All Statuses</option>
                      {histStatusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {(histYear !== 'all' || histMonth !== 'all' || histDept !== 'all' || histPay !== 'all' || histStatus !== 'all' || histSearch) && (
                      <button onClick={() => { setHistYear('all'); setHistMonth('all'); setHistDept('all'); setHistPay('all'); setHistStatus('all'); setHistSearch(''); }} className="text-[10px] font-bold text-[#A855F7] hover:underline flex items-center gap-1"><Filter size={11} /> Clear filters</button>
                    )}
                  </div>
                )}
                {filteredMonths.length ? (
                  <div className="space-y-6 mt-3">
                    {filteredMonths.map((period: string) => {
                      const monthRows = filteredHistory.filter((r: any) => r.period === period);
                      if (!monthRows.length) return null;
                      const mGross = monthRows.reduce((s: number, r: any) => s + r.gross, 0);
                      const mDed = monthRows.reduce((s: number, r: any) => s + r.deductions, 0);
                      const mNet = monthRows.reduce((s: number, r: any) => s + r.net, 0);
                      const isCurrent = String(period).toUpperCase().includes(nowMonth) && String(period).includes(String(nowYear));
                      return (
                        <div key={period} className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#A855F7]/10 to-[#6D4CFF]/5 border-b border-gray-100 dark:border-gray-700/60">
                            <span className="flex items-center gap-1.5 text-xs font-black text-gray-900 dark:text-white"><CalendarDays size={13} className="text-[#A855F7]" /> {period}</span>
                            {isCurrent && <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300 font-bold">current</span>}
                            <span className="text-[10px] text-gray-400">{monthRows.length} payslips</span>
                            <div className="ml-auto flex items-center gap-3 text-[10px] font-semibold">
                              <span className="text-gray-500">Gross <b className="tabular-nums">₹{mGross.toLocaleString('en-IN')}</b></span>
                              <span className="text-red-500">Ded <b className="tabular-nums">₹{mDed.toLocaleString('en-IN')}</b></span>
                              <span className="text-emerald-600">Net <b className="tabular-nums">₹{mNet.toLocaleString('en-IN')}</b></span>
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[820px]">
                              <thead><tr className="text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700/60">{['Emp ID', 'Employee', 'Role', 'Department', 'Gross', 'Deductions', 'Net', 'Payment', 'Status'].map(h => <th key={h} className="py-2.5 pr-3 font-semibold">{h}</th>)}</tr></thead>
                              <tbody>{monthRows.map((r: any, i: number) => (
                                <motion.tr key={r.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}
                                  className="border-b border-gray-50 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                                  <td className="py-2.5 pr-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 tabular-nums">{r.employee_id}</td>
                                  <td className="py-2.5 pr-3"><div className="text-xs font-bold text-gray-900 dark:text-white">{r.name}</div><div className="text-[10px] text-gray-400">{r.email}</div></td>
                                  <td className="py-2.5 pr-3 text-xs text-gray-600 dark:text-gray-300">{r.role}</td>
                                  <td className="py-2.5 pr-3 text-xs text-gray-600 dark:text-gray-300">{r.department}</td>
                                  <td className="py-2.5 pr-3 text-xs font-semibold text-gray-900 dark:text-white tabular-nums">₹{r.gross.toLocaleString('en-IN')}</td>
                                  <td className="py-2.5 pr-3 text-xs font-semibold text-red-500 dark:text-red-400 tabular-nums">-₹{r.deductions.toLocaleString('en-IN')}</td>
                                  <td className="py-2.5 pr-3 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">₹{r.net.toLocaleString('en-IN')}</td>
                                  <td className="py-2.5 pr-3"><span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${(r.payment_method || '').toUpperCase() === 'CASH' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300'}`}>{r.payment_method || 'BANK'}</span></td>
                                  <td className="py-2.5 pr-3"><span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${(r.status || '').toUpperCase() === 'PAID' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' : (r.status || '').toUpperCase() === 'CANCELLED' ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300'}`}>{r.status || 'PENDING'}</span></td>
                                </motion.tr>
                              ))}</tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : historyPayslips.length ? <EmptyState message="No payslips match this month/year filter." /> : <EmptyState message="No payslips recorded yet. Generate payslips to start building history." />}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ==================== RENDER: EXPENSES TAB (AI-powered) ====================
  const renderExpenses = () => {
    const expensesA: any[] = (() => { const d: any = expData.data; return Array.isArray(d) ? d : (d?.data || []); })();
    const expSum: any = expSummary.data || {};
    const baseRows = expensesA.map((r: any) => ({
      id: r.id, month: r.date ? String(r.date).slice(0, 7) : '—', category: r.category || 'Other',
      item: r.item || '', amount: Number(r.amount) || 0, status: r.status || 'pending', notes: r.notes || '',
      staff: r.staff?.full_name || '', staff_id: r.staff_id || '',
    }));
    const rows = baseRows
      .filter(r => expFilter === 'all' || r.status === expFilter)
      .filter(r => expCatFilter === 'all' || r.category === expCatFilter);

    const total = baseRows.reduce((s, r) => s + r.amount, 0);
    const avgPerMonth = expSum.avgPerEntry ?? (baseRows.length ? Math.round(total / baseRows.length) : 0);
    const catSummary = (() => { const m: Record<string, number> = {}; baseRows.forEach((r: any) => { m[r.category] = (m[r.category] || 0) + r.amount; }); return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value); })();
    const topCat = catSummary[0] || { name: '—', value: 0 };
    const pending = baseRows.filter(r => r.status === 'pending');
    const monthly = (expSum.monthly || []).slice(-12).map((m: any) => ({ month: (() => { try { return new Date(String(m.month) + '-01').toLocaleString('en', { month: 'short' }); } catch { return String(m.month).slice(0, 7); } })(), amount: Number(m.value) || 0 }));
    const CAT_COLORS = ['#6D4CFF', '#14B8A6', '#F59E0B', '#EC4899', '#3B82F6', '#22C55E'];
    const catIcon = (c: string) => c === 'Transport' ? Bus : c === 'Utilities' ? Zap : c === 'Supplies' ? ShoppingBag : c === 'Maintenance' ? Wrench : c === 'Welfare' ? Heart : Boxes;
    const loadingExp = expData.loading;

    const insights: { text: string; tone: 'good' | 'warn' | 'info' }[] = [];
    if (topCat.name !== '—') insights.push({ text: `Spending is led by ${topCat.name} at ₹${topCat.value.toLocaleString('en-IN')} — consolidate vendors here to cut ~8%.`, tone: 'info' });
    insights.push({ text: `Total outflows are ₹${total.toLocaleString('en-IN')} across ${baseRows.length} entries.`, tone: total > 0 ? 'good' : 'info' });
    if (pending.length) insights.push({ text: `${pending.length} expense${pending.length === 1 ? '' : 's'} still pending approval — settle them to keep records clean.`, tone: 'warn' });
    else if (baseRows.length) insights.push({ text: 'All expenses are approved — no outstanding payments flagged.', tone: 'good' });
    if (total > 0 && topCat.value > total / 3) insights.push({ text: `${topCat.name} alone is over a third of outflow — reconsider this line item.`, tone: 'warn' });
    insights.push({ text: `Average ${avgPerMonth.toLocaleString('en-IN')}/entry — that projects to roughly ₹${(avgPerMonth * 12).toLocaleString('en-IN')} a year if it holds.`, tone: 'info' });
    if (!baseRows.length) insights.push({ text: 'No expenses yet. Add your first expense and it will be stored in the database — no synthetic data.', tone: 'info' });
    const recs: { icon: any; text: string; tone: string }[] = [];
    if (topCat.name !== '—') recs.push({ icon: Target, text: `Cut ${topCat.name} by 10% via vendor renegotiation`, tone: '#F59E0B' });
    if (pending.length) recs.push({ icon: CalendarCheck, text: `Approve/reject ${pending.length} pending expense${pending.length === 1 ? '' : 's'}`, tone: '#EF4444' });
    if (baseRows.length) recs.push({ icon: PiggyBank, text: 'Keep adding expenses so cash-flow insights stay accurate', tone: '#14B8A6' });
    if (!recs.length) recs.push({ icon: Plus, text: 'Add your first expense to start AI insights', tone: '#6D4CFF' });

    const exportExpenses = () => {
      const csv = [['Month', 'Category', 'Item', 'Amount', 'Status'].join(','), ...rows.map(r => [r.month, r.category, r.item, r.amount, r.status].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'staff-expenses.csv'; a.click(); URL.revokeObjectURL(url); toast.success('Expenses exported');
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div whileHover={{ rotate: 6, scale: 1.05 }} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#F59E0B] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-pink-500/30">
              <Receipt size={20} />
            </motion.div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white truncate">Expenses</h2>
              <p className="text-[11px] text-gray-400">Staff department spend with AI-driven cost intelligence.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { expData.refetch(); expSummary.refetch(); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">{loadingExp ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Refresh</button>
            <button onClick={exportExpenses} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><Download size={13} /> Export CSV</button>
            <button onClick={() => setExpModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#EC4899] to-[#F59E0B] text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all"><Plus size={13} /> Add Expense</button>
          </div>
        </div>

        {/* AI Insights */}
        <motion.div initial={{ opacity: 0, y: 16, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl p-5 md:p-6 bg-gradient-to-br from-[#4C1D54] via-[#9D2E4F] to-[#F59E0B] border border-pink-500/30 text-white shadow-xl shadow-pink-900/20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#EC4899]/40 blur-3xl anim-float" />
            <div className="absolute -bottom-28 -left-16 w-64 h-64 rounded-full bg-[#F59E0B]/35 blur-3xl anim-float" style={{ animationDelay: '1.2s' }} />
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="anim-pulse-glow" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">AI Expense Intelligence</span>
              <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-white/15 border border-white/20 backdrop-blur">Auto-generated</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[{ label: 'Total Spend', value: total, fmt: true }, { label: 'Avg / Month', value: avgPerMonth, fmt: true }, { label: 'Top Category', value: topCat.name === '—' ? 0 : topCat.name, fmt: false }, { label: 'Pending', value: pending.length, fmt: false }].map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.07 }} className="rounded-xl bg-white/10 border border-white/15 p-3 backdrop-blur hover:bg-white/15 hover:-translate-y-0.5 transition-all">
                  <div className="text-lg font-extrabold leading-none truncate">{t.fmt ? `₹${Number(t.value).toLocaleString('en-IN')}` : t.value}</div>
                  <div className="text-[10px] text-pink-100/80 mt-1.5">{t.label}</div>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-col gap-2 mt-4">
              {insights.map((it, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.08 }}
                  className="flex items-start gap-2.5 text-[11px] leading-snug text-[#FFF1F6] bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 backdrop-blur">
                  <span className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${it.tone === 'warn' ? 'bg-amber-400/20 text-amber-200' : it.tone === 'good' ? 'bg-emerald-400/20 text-emerald-200' : 'bg-white/15 text-pink-50'}`}>{it.tone === 'good' ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}</span>
                  {it.text}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: CreditCard, label: 'Total Expenses', value: total, color: '#EC4899', fmt: true },
            { icon: Briefcase, label: 'Categories', value: catSummary.length, color: '#14B8A6', fmt: false },
            { icon: Target, label: 'Largest Category', value: topCat.name === '—' ? 0 : topCat.name, color: '#F59E0B', fmt: false },
            { icon: Clock, label: 'Pending Approval', value: pending.length, color: '#EF4444', fmt: false },
          ].map((k, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 20 }}>
              <GlassCard className="p-4 flex flex-col gap-2 group hover:-translate-y-0.5 hover:shadow-xl transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: `${k.color}18`, color: k.color }}><k.icon size={18} /></div>
                <div className={`text-lg font-extrabold ${k.fmt ? 'text-gray-900 dark:text-white' : ''}`}>{k.fmt ? '₹' : ''}{k.fmt ? Number(k.value).toLocaleString('en-IN') : k.value}</div>
                <div className="text-[10px] text-gray-400">{k.label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-5">
            <SectionHeader title="Spend by Category" subtitle="Where the money goes" />
            {EXPENSE_CATS.map((c: any, i: number) => {
              const amt = catSummary.find(x => x.name === c)?.value || 0;
              const pct = total ? Math.round((amt / total) * 100) : 0;
              return (
                <div key={c} className={i > 0 ? 'mt-3' : ''}>
                  <div className="flex items-center justify-between text-xs mb-1"><span className="text-gray-600 dark:text-gray-300 font-semibold">{c}</span><span className="text-gray-400 text-[10px]">₹{amt.toLocaleString('en-IN')} · {pct}%</span></div>
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700/50 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay: i * 0.05 }} className="h-full rounded-full" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} /></div>
                </div>
              );
            })}
          </GlassCard>
          <GlassCard className="p-5">
            <SectionHeader title="Monthly Spend Trend" subtitle="Last 12 months" />
            <ResponsiveContainer width="100%" height={240}><AreaChart data={monthly}><defs><linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EC4899" stopOpacity={0.35} /><stop offset="100%" stopColor="#EC4899" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} /><Area type="monotone" dataKey="amount" stroke="#EC4899" fill="url(#expGrad)" strokeWidth={2} /></AreaChart></ResponsiveContainer>
          </GlassCard>
        </div>

        <GlassCard className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <SectionHeader title="Expense Register" subtitle={`${baseRows.length} entries stored in database`} />
            <div className="flex items-center gap-2">
              <select value={expCatFilter} onChange={e => setExpCatFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                <option value="all">All Categories</option>{EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={expFilter} onChange={e => setExpFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                <option value="all">All Statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto -mx-5 px-5 mt-3">
            {baseRows.length ? (
            <table className="w-full text-left min-w-[640px]">
              <thead><tr className="text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700/60">{['Date', 'Category', 'Item', 'Amount', 'Status', 'Actions'].map(h => <th key={h} className="py-2.5 pr-3 font-semibold">{h}</th>)}</tr></thead>
              <tbody>{rows.map((r, i) => (
                <tr key={r.id || i} className="border-b border-gray-50 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 pr-3 text-[10px] font-semibold text-gray-900 dark:text-white">{r.month}</td>
                  <td className="py-3 pr-3 text-xs text-gray-600 dark:text-gray-300"><span className="flex items-center gap-1.5">{(() => { const Ri = catIcon(r.category); return Ri ? <Ri size={13} style={{ color: CAT_COLORS[Math.max(0, EXPENSE_CATS.indexOf(r.category)) % CAT_COLORS.length] }} /> : null; })()}{r.category}</span></td>
                  <td className="py-3 pr-3 text-xs text-gray-500">{r.item}</td>
                  <td className="py-3 pr-3 text-xs font-semibold text-gray-900 dark:text-white">₹{r.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3 pr-3"><span className={`text-[9px] px-2 py-0.5 rounded-full font-bold capitalize ${r.status === 'approved' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' : r.status === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300'}`}>{r.status}</span></td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-1">
                      <button title="Approve" onClick={() => approveExpense(r.id, 'approved', `${r.category} · ${r.item || 'expense'} (₹${r.amount.toLocaleString('en-IN')})`)} className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 transition-colors">A</button>
                      <button title="Reject" onClick={() => approveExpense(r.id, 'rejected', `${r.category} · ${r.item || 'expense'} (₹${r.amount.toLocaleString('en-IN')})`)} className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 transition-colors">R</button>
                      <button title="Delete" onClick={() => deleteExpense(r.id, `${r.category} · ${r.item || 'expense'} (₹${r.amount.toLocaleString('en-IN')})`)} className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 transition-colors">×</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
            ) : loadingExp ? <LoadingSkeleton rows={4} cols={4} /> : <EmptyState message="No expenses recorded yet. Click “Add Expense” to save your first entry." />}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {recs.map((r, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/40 text-[11px] font-semibold text-gray-700 dark:text-gray-200">
                <r.icon size={14} style={{ color: r.tone }} /> {r.text}
              </div>
            ))}
          </div>
        </GlassCard>

        {expModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setExpModal(false)}>
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl p-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2"><Plus size={16} className="text-[#EC4899]" /> Add Expense</h4>
                <button onClick={() => setExpModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 transition-colors"><X size={14} /></button>
              </div>
              <div className="space-y-3">
                <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Item / Description *</span>
                  <input value={expForm.item} onChange={e => setExpForm({ ...expForm, item: e.target.value })} placeholder="e.g. Office stationery restock" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#EC4899]/20" /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Category</span>
                    <select value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs">{EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
                  <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Amount *</span>
                    <input type="number" min={0} value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: e.target.value })} placeholder="0" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#EC4899]/30" /></label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Date</span>
                    <input type="date" value={expForm.date} onChange={e => setExpForm({ ...expForm, date: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#EC4899]/30" /></label>
                  <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Status</span>
                    <select value={expForm.status} onChange={e => setExpForm({ ...expForm, status: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#EC4899]/30">
                      <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
                    </select></label>
                </div>
                <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Notes</span>
                  <textarea value={expForm.notes} onChange={e => setExpForm({ ...expForm, notes: e.target.value })} rows={2} placeholder="Optional" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#EC4899]/30" /></label>
              </div>
              <div className="flex items-center gap-2 justify-end mt-4">
                <button onClick={() => setExpModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={addExpense} disabled={expSaving} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#EC4899] to-[#F59E0B] text-white text-xs font-bold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all">{expSaving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} {expSaving ? 'Saving…' : 'Save Expense'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================== RENDER: APPROVALS TAB (unified approval queue) ====================
  const renderApprovals = () => {
    const expensesA: any[] = (() => { const d: any = expData.data; return Array.isArray(d) ? d : (d?.data || []); })();

    const leaveRows = (leaves || []).map((l: any) => ({
      id: l.id, type: 'leave', kind: l.leave_type || 'Leave', person: l.staff_name || 'Staff',
      email: l.staff_email || '', role: l.designation || '', department: l.department || '',
      title: `${l.leave_type || 'Leave'} Request`, description: `${String(l.start_date || '').slice(0, 10)} → ${String(l.end_date || '').slice(0, 10)}${l.reason ? ' · ' + l.reason : ''}`,
      status: (l.status || 'PENDING').toLowerCase(), amount: 0, date: l.created_at || l.start_date || '', notes: l.reason || '',
    }));
    const expRows = expensesA.map((e: any) => ({
      id: e.id, type: 'expense', kind: e.category || 'Expense', person: e.staff?.full_name || 'General',
      email: '', role: e.staff?.designation || '', department: e.staff?.department || '',
      title: e.item || 'Expense', description: `${e.category || 'Expense'} · ${e.staff?.full_name || 'General'}${e.notes ? ' · ' + e.notes : ''}`,
      status: (e.status || 'pending').toLowerCase(), amount: Number(e.amount) || 0, date: e.date || '', notes: e.notes || '',
    }));

    const queue = [...leaveRows, ...expRows];
    const filtered = queue
      .filter(t => apprType === 'all' || t.type === apprType)
      .filter(t => apprStatus === 'all' || t.status === apprStatus)
      .filter(t => !apprSearch || `${t.person} ${t.title} ${t.kind} ${t.description}`.toLowerCase().includes(apprSearch.toLowerCase()));

    const pending = queue.filter(t => t.status === 'pending');
    const pendingLeaves = pending.filter(t => t.type === 'leave').length;
    const pendingExp = pending.filter(t => t.type === 'expense').length;
    const approved = queue.filter(t => t.status === 'approved').length;
    const rejected = queue.filter(t => t.status === 'rejected').length;
    const rate = approved + rejected ? Math.round((approved / (approved + rejected)) * 100) : 0;

    const donut = [
      { name: 'Pending', value: pending.length, color: '#F59E0B' },
      { name: 'Approved', value: approved, color: '#22C55E' },
      { name: 'Rejected', value: rejected, color: '#EF4444' },
    ];

    const initials = (n: string) => String(n || '?').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

    const statusPill = (s: string) => (
      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold capitalize ${s === 'approved' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' : s === 'rejected' ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300'}`}>{s}</span>
    );

    const activity = [...queue].filter(t => t.status !== 'pending').sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 5);

    const typeIcon = (t: string) => t === 'leave' ? CalendarCheck : Receipt;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div whileHover={{ rotate: 6, scale: 1.05 }} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#EC4899] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-purple-500/30">
              <ShieldCheck size={20} />
            </motion.div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white truncate">Approvals</h2>
              <p className="text-[11px] text-gray-400">Unified queue for leave requests and expense claims.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={apprSearch} onChange={e => setApprSearch(e.target.value)} placeholder="Search approvals…"
                className="w-52 pl-8 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 transition-all" />
            </div>
            <button onClick={refreshApprovals} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><RefreshCw size={13} className={expData.loading || leaveLoading ? 'animate-spin' : ''} /> Refresh</button>
          </div>
        </div>

        {/* Priority banner */}
        <motion.div initial={{ opacity: 0, y: 16, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.12 }}
          className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[#6D4CFF] via-[#9D2E4F] to-[#EC4899] border border-purple-500/30 text-white shadow-xl shadow-purple-900/20">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#EC4899]/40 blur-3xl anim-float" />
            <div className="absolute -bottom-28 -left-16 w-64 h-64 rounded-full bg-[#F59E0B]/35 blur-3xl anim-float" style={{ animationDelay: '1.2s' }} />
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
          </div>
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 backdrop-blur flex items-center justify-center"><BellRing size={22} className="anim-pulse-glow" /></div>
              <div>
                <div className="text-xl font-extrabold leading-none">{pending.length}</div>
                <div className="text-[10px] text-purple-100/80 mt-1 uppercase tracking-widest">Awaiting approval</div>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/20" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
              {[{ label: 'Leave requests', value: pendingLeaves, icon: CalendarCheck }, { label: 'Expense claims', value: pendingExp, icon: Receipt }, { label: 'Approval rate', value: `${rate}%`, icon: TrendingUp }, { label: 'Decisions made', value: approved + rejected, icon: ClipboardCheck }].map((k, i) => (
                <motion.div key={k.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.06 }} className="rounded-xl bg-white/10 border border-white/15 p-3 backdrop-blur hover:bg-white/15 hover:-translate-y-0.5 transition-all">
                  <div className="text-lg font-extrabold leading-none truncate">{k.value}</div>
                  <div className="flex items-center gap-1 text-[9px] text-purple-100/80 mt-1.5"><k.icon size={11} /> {k.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {[['all', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([k, label]) => (
              <button key={k} onClick={() => setApprStatus(k as any)}
                className={`px-3.5 py-2 rounded-lg text-[11px] font-bold transition-all ${apprStatus === k ? 'bg-gradient-to-r from-[#6D4CFF] to-[#EC4899] text-white shadow-lg shadow-purple-500/25' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#6D4CFF]/40'}`}>
                {label} <span className="opacity-70 ml-1">{k === 'all' ? queue.length : k === 'pending' ? pending.length : k === 'approved' ? approved : rejected}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Type:</span>
            {[['all', 'All'], ['leave', 'Leave'], ['expense', 'Expense']].map(([k, label]) => (
              <button key={k} onClick={() => setApprType(k as any)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${apprType === k ? 'bg-[#6D4CFF] text-white shadow-lg shadow-purple-500/25' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-[#6D4CFF]/40'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue */}
          <div className="lg:col-span-2 space-y-3">
            {expData.loading || leaveLoading ? <LoadingSkeleton rows={5} /> : !filtered.length ? (
              <EmptyState message={apprStatus === 'pending' ? 'No pending approvals. Your queue is clear.' : 'No matching approvals found.'} />
            ) : filtered.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all p-4">
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${t.type === 'leave' ? 'from-[#6D4CFF] to-[#8B5CF6]' : 'from-[#EC4899] to-[#F59E0B]'}`} />
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0 bg-gradient-to-br ${t.type === 'leave' ? 'from-[#6D4CFF] to-[#8B5CF6]' : 'from-[#EC4899] to-[#F59E0B]'}`}>{initials(t.person)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${t.type === 'leave' ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300' : 'bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300'}`}>{t.type.toUpperCase()}</span>
                      {statusPill(t.status)}
                      {t.amount > 0 && <span className="text-[10px] font-extrabold text-gray-900 dark:text-white">₹{t.amount.toLocaleString('en-IN')}</span>}
                    </div>
                    <div className="text-xs font-extrabold text-gray-900 dark:text-white mt-1 truncate">{t.title}</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{t.description}</div>
                    <div className="flex items-center gap-2 flex-wrap mt-1.5 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1"><UserRoundCheck size={11} className="text-[#6D4CFF]" /> {t.person}</span>
                      {t.department && <span>· {t.department}</span>}
                      {t.date && <span>· {String(t.date).slice(0, 10)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {t.status === 'pending' && (
                      <>
                        <button onClick={() => actOnApproval(t, 'approve')} disabled={apprProcessing === t.id}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-500 text-white text-[11px] font-bold shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 disabled:opacity-50 transition-all">
                          {apprProcessing === t.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={13} />} Approve</button>
                        <button onClick={() => actOnApproval(t, 'reject')} disabled={apprProcessing === t.id}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-200 dark:border-red-500/30 text-[11px] font-bold hover:bg-red-100 disabled:opacity-50 transition-all">
                          <XCircle size={13} /> Reject</button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Side panel */}
          <div className="space-y-6">
            <GlassCard className="p-5">
              <SectionHeader title="Status Distribution" subtitle="All approvals" />
              <div className="relative mx-auto w-full max-w-[190px]">
                <ResponsiveContainer width="100%" height={190}>
                  <RePieChart>
                    <Pie data={donut} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={82} paddingAngle={3}>
                      {donut.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{queue.length}</div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-widest">Total</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {donut.map(d => (
                  <div key={d.name} className="text-center rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/40 p-2">
                    <div className="text-sm font-extrabold" style={{ color: d.color }}>{d.value}</div>
                    <div className="text-[9px] text-gray-400">{d.name}</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <SectionHeader title="Recent Decisions" subtitle="Latest actions" />
              <div className="space-y-3">
                {!activity.length ? <EmptyState message="No decisions yet." /> : activity.map((a, i) => {
                  const Icon = typeIcon(a.type);
                  return (
                    <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${a.type === 'leave' ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300' : 'bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300'}`}><Icon size={14} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-gray-800 dark:text-white truncate">{a.person}</div>
                        <div className="text-[10px] text-gray-400 truncate">{a.title}</div>
                      </div>
                      {statusPill(a.status)}
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  };


  // ==================== RENDER: SETTINGS TAB ====================
  const renderSettings = () => {
    const s = settings || {};
    const P = (k: string, dv: any) => (s[k] !== undefined ? s[k] : dv);

    const Toggle = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
      <button onClick={() => onChange(!on)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? 'bg-[#6D4CFF]' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    );

    const Row = ({ icon: Icon, iconColor, label, desc, children }: any) => (
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/40 hover:border-[#6D4CFF]/30 transition-all">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${iconColor || '#6D4CFF'}15`, color: iconColor || '#6D4CFF' }}>{Icon ? <Icon size={16} /> : <span className="text-xs">•</span>}</div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-gray-900 dark:text-white">{label}</div>
            {desc && <div className="text-[10px] text-gray-400 mt-0.5">{desc}</div>}
          </div>
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    );

    const Field = ({ label, children }: any) => (
      <label className="block">
        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">{label}</span>
        {children}
      </label>
    );

    const inputCls2 = 'w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF] transition-all';
    const selectCls2 = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF] transition-all';
    const numInput = (key: string, dv: any, suffix?: string) => (
      <div className="relative">
        <input type="number" value={P(key, dv)} min={0} onChange={e => updateSetting(key, Number(e.target.value))}
          className={inputCls2 + (suffix ? ' pr-10' : '')} />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">{suffix}</span>}
      </div>
    );
    const textInput = (key: string, dv: any) => (
      <input value={P(key, dv)} onChange={e => updateSetting(key, e.target.value)} className={inputCls2} />
    );
    const selectInput = (key: string, opts: string[], dv: any) => (
      <select value={P(key, dv)} onChange={e => updateSetting(key, e.target.value)} className={selectCls2}>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );

    const sections: { key: string; label: string; icon: any; color: string; desc: string }[] = [
      { key: 'general', label: 'General', icon: Building2, color: '#6D4CFF', desc: 'Organisation & profile basics' },
      { key: 'attendance', label: 'Attendance', icon: ClipboardList, color: '#22C55E', desc: 'Hours, grace & marking' },
      { key: 'leave', label: 'Leave', icon: Calendar, color: '#F59E0B', desc: 'Approvals & balances' },
      { key: 'performance', label: 'Performance', icon: TrendingUp, color: '#3B82F6', desc: 'Reviews & thresholds' },
      { key: 'payroll', label: 'Payroll', icon: DollarSign, color: '#14B8A6', desc: 'Cycle, currency & payslips' },
      { key: 'communication', label: 'Communication', icon: MessageSquare, color: '#EC4899', desc: 'Broadcasts & messaging' },
      { key: 'reporting', label: 'Reporting', icon: BarChart3, color: '#8B5CF6', desc: 'Exports & schedules' },
      { key: 'appearance', label: 'Appearance', icon: Palette, color: '#A855F7', desc: 'Theme & layout' },
      { key: 'data', label: 'Data & Danger', icon: Shield, color: '#EF4444', desc: 'Reset & maintenance' },
    ];

    const active = sections.find(x => x.key === settingsTab) || sections[0];
    const Icon = active.icon;
    const saveAll = () => { try { localStorage.setItem('staffSettings', JSON.stringify(settings)); } catch {} toast.success('Settings saved'); };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <motion.div whileHover={{ rotate: 10, scale: 1.05 }} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-purple-500/30">
              <Settings size={20} />
            </motion.div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white truncate">Settings</h2>
              <p className="text-[11px] text-gray-400">Configure every module to match how your institution works.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setSettings({}); try { localStorage.removeItem('staffSettings'); } catch {} toast.success('Reset to defaults'); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              <RefreshCw size={13} /> Reset
            </button>
            <button onClick={saveAll} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all">
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Section nav */}
          <div className="lg:w-60 shrink-0 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1">
            {sections.map(sec => (
              <button key={sec.key} onClick={() => setSettingsTab(sec.key)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left border transition-all flex-shrink-0 lg:w-full ${settingsTab === sec.key ? 'bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white border-transparent shadow-lg shadow-purple-500/25' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#6D4CFF]/40 hover:-translate-y-0.5'}`}>
                <sec.icon size={16} style={{ color: settingsTab === sec.key ? '#fff' : sec.color }} />
                <div className="min-w-0">
                  <div className="text-xs font-bold">{sec.label}</div>
                  <div className={`text-[9px] ${settingsTab === sec.key ? 'text-white/80' : 'text-gray-400'} truncate`}>{sec.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-6">
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${active.color}15`, color: active.color }}><Icon size={16} /></div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">{active.label} Settings</h3>
                  <p className="text-[10px] text-gray-400">{active.desc}</p>
                </div>
              </div>

              {settingsTab === 'general' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Organisation Name"><div className="mt-1">{textInput('orgName', '')}</div></Field>
                  <Field label="Timezone"><div className="mt-1">{selectInput('timezone', ['Asia/Kolkata', 'Asia/Dubai', 'UTC', 'Europe/London', 'America/New_York', 'Asia/Singapore'], 'Asia/Kolkata')}</div></Field>
                  <Field label="Date Format"><div className="mt-1">{selectInput('dateFormat', ['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD'], 'DD-MM-YYYY')}</div></Field>
                  <Field label="Week Starts On"><div className="mt-1">{selectInput('weekStart', ['Monday', 'Sunday', 'Saturday'], 'Monday')}</div></Field>
                  <Field label="Academic Year"><div className="mt-1">{textInput('academicYear', '')}</div></Field>
                  <Field label="Holiday Calendar"><div className="mt-1"><select onChange={e => updateSetting('holidayCalendar', e.target.value)} value={P('holidayCalendar', 'National')} className={selectCls2}><option>National</option><option>Regional</option><option>Custom</option></select></div></Field>
                </div>
              )}

              {settingsTab === 'attendance' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Field label="Marking Grace Period (min)"><div className="mt-1">{numInput('gracePeriod', 5, 'min')}</div></Field>
                    <Field label="Late Threshold (min)"><div className="mt-1">{numInput('lateThreshold', 10, 'min')}</div></Field>
                    <Field label="Work Start"><div className="mt-1"><input type="time" value={P('workStart', '09:00')} onChange={e => updateSetting('workStart', e.target.value)} className={inputCls2} /></div></Field>
                    <Field label="Work End"><div className="mt-1"><input type="time" value={P('workEnd', '18:00')} onChange={e => updateSetting('workEnd', e.target.value)} className={inputCls2} /></div></Field>
                  </div>
                  <div className="space-y-2">
                    <Row Icon={Clock} iconColor="#22C55E" label="Auto-mark absent" desc="Mark unmarked staff as absent after work end">
                      <Toggle on={!!P('autoMarkAbsent', true)} onChange={v => updateSetting('autoMarkAbsent', v)} />
                    </Row>
                    <Row Icon={Bus} iconColor="#3B82F6" label="Allow work-from-home" desc="Let staff mark WFH status">
                      <Toggle on={!!P('allowWFH', true)} onChange={v => updateSetting('allowWFH', v)} />
                    </Row>
                    <Row Icon={Heart} iconColor="#EC4899" label="Saturday is working day" desc="Include Saturday in attendance cycle">
                      <Toggle on={!!P('weekendSaturday', false)} onChange={v => updateSetting('weekendSaturday', v)} />
                    </Row>
                  </div>
                </>
              )}

              {settingsTab === 'leave' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <Field label="Auto-approve days (≤)"><div className="mt-1">{numInput('autoApproveDays', 0, 'days')}</div></Field>
                    <Field label="Annual leave / member"><div className="mt-1">{numInput('maxAnnual', 20, 'days')}</div></Field>
                    <Field label="Carry-forward"><div className="mt-1">{numInput('carryForward', 5, 'days')}</div></Field>
                  </div>
                  <div className="space-y-2">
                    <Row Icon={CalendarCheck} iconColor="#F59E0B" label="Auto-approve short leaves" desc="Approve leaves up to the day limit without review">
                      <Toggle on={!!P('autoApprove', false)} onChange={v => updateSetting('autoApprove', v)} />
                    </Row>
                    <Row Icon={UserCog} iconColor="#6D4CFF" label="Two-level approval" desc="Require manager + admin approval for long leaves">
                      <Toggle on={!!P('doubleApproval', false)} onChange={v => updateSetting('doubleApproval', v)} />
                    </Row>
                  </div>
                </>
              )}

              {settingsTab === 'performance' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Field label="Review Frequency"><div className="mt-1">{selectInput('reviewFrequency', ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'], 'Quarterly')}</div></Field>
                    <Field label="KPI Passing Score"><div className="mt-1">{numInput('kpiPass', 60, '%')}</div></Field>
                  </div>
                  <div className="space-y-2">
                    <Row Icon={Sparkles} iconColor="#8B5CF6" label="Auto-generate reviews" desc="AI drafts performance reviews from scores">
                      <Toggle on={!!P('autoGenReviews', true)} onChange={v => updateSetting('autoGenReviews', v)} />
                    </Row>
                    <Row Icon={AlertTriangle} iconColor="#EF4444" label="Alert on low scores" desc="Notify when scores fall below passing score">
                      <Toggle on={!!P('notifyLowScore', true)} onChange={v => updateSetting('notifyLowScore', v)} />
                    </Row>
                  </div>
                </>
              )}

              {settingsTab === 'payroll' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Field label="Currency"><div className="mt-1">{selectInput('currency', ['INR (₹)', 'AED (د.إ)', 'USD ($)', 'EUR (€)', 'GBP (£)'], 'INR (₹)')}</div></Field>
                    <Field label="Pay Cycle Day"><div className="mt-1">{numInput('payCycleDay', 1, 'day')}</div></Field>
                  </div>
                  <div className="space-y-2">
                    <Row Icon={DollarSign} iconColor="#14B8A6" label="Overtime allowed" desc="Track and pay overtime hours">
                      <Toggle on={!!P('overtimeAllowed', false)} onChange={v => updateSetting('overtimeAllowed', v)} />
                    </Row>
                    <Row Icon={FileText} iconColor="#3B82F6" label="Auto-generate payslips" desc="Create payslips on cycle day automatically">
                      <Toggle on={!!P('autoPayslip', true)} onChange={v => updateSetting('autoPayslip', v)} />
                    </Row>
                  </div>
                </>
              )}

              {settingsTab === 'communication' && (
                <>
                  <div className="mb-4">
                    <Field label="Announcement Digest"><div className="mt-1">{selectInput('digestFrequency', ['Real-time', 'Daily', 'Weekly'], 'Real-time')}</div></Field>
                  </div>
                  <div className="space-y-2">
                    <Row Icon={Shield} iconColor="#EC4899" label="Broadcast requires approval" desc="Admins must approve mass announcements">
                      <Toggle on={!!P('approvalNeeded', false)} onChange={v => updateSetting('approvalNeeded', v)} />
                    </Row>
                    <Row Icon={UserPlus} iconColor="#6D4CFF" label="Allow direct messages" desc="Enable one-to-one staff messaging">
                      <Toggle on={!!P('allowDirect', true)} onChange={v => updateSetting('allowDirect', v)} />
                    </Row>
                    <Row Icon={Megaphone} iconColor="#F59E0B" label="Announcement notifications" desc="Notify staff when a broadcast is sent">
                      <Toggle on={!!P('notifyToggle', true)} onChange={v => updateSetting('notifyToggle', v)} />
                    </Row>
                  </div>
                </>
              )}

              {settingsTab === 'reporting' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Field label="Auto-report frequency"><div className="mt-1">{selectInput('reportFrequency', ['Disabled', 'Daily', 'Weekly', 'Monthly'], 'Weekly')}</div></Field>
                    <Field label="Data retention (months)"><div className="mt-1">{numInput('retentionMonths', 24, 'mo')}</div></Field>
                  </div>
                  <div className="space-y-2">
                    <Row Icon={Download} iconColor="#8B5CF6" label="Scheduled CSV export" desc="Auto-export staff + attendance reports">
                      <Toggle on={!!P('scheduledReports', true)} onChange={v => updateSetting('scheduledReports', v)} />
                    </Row>
                    <Row Icon={Shield} iconColor="#10B981" label="Anonymise in exports" desc="Mask phone/email in shared exports">
                      <Toggle on={!!P('anonymise', false)} onChange={v => updateSetting('anonymise', v)} />
                    </Row>
                  </div>
                </>
              )}

              {settingsTab === 'appearance' && (
                <div className="space-y-2">
                  <Row Icon={Moon} iconColor="#A855F7" label="Default to dark mode" desc="Open staff management in dark theme" value>
                    <Toggle on={!!P('darkDefault', false)} onChange={v => updateSetting('darkDefault', v)} />
                  </Row>
                  <Row Icon={List} iconColor="#6D4CFF" label="Compact mode" desc="Reduce spacing to fit more rows">
                    <Toggle on={!!P('compactMode', false)} onChange={v => updateSetting('compactMode', v)} />
                  </Row>
                  <Row Icon={Sparkles} iconColor="#22C55E" label="Animations & effects" desc="Enable motion effects across modules">
                    <Toggle on={!!P('reduceMotion', true)} onChange={v => updateSetting('reduceMotion', v)} />
                  </Row>
                </div>
              )}

              {settingsTab === 'data' && (
                <>
                  <div className="space-y-2 mb-4">
                    <Row Icon={Download} iconColor="#3B82F6" label="Export staff data" desc="Download full staff roster as CSV">
                      <button onClick={exportStaffCSV} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-[10px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-all">Export</button>
                    </Row>
                  </div>
                  <GlassCard className="p-4 border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20">
                    <h4 className="text-xs font-bold text-red-600 flex items-center gap-1.5"><AlertTriangle size={14} /> Danger Zone</h4>
                    <p className="text-[10px] text-red-400 mt-1 mb-3">These actions are irreversible. Please confirm carefully.</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => { if (window.confirm('Clear all locally stored settings?')) { try { localStorage.removeItem('staffSettings'); } catch {} setSettings({}); toast.success('Settings cleared'); } }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500 text-white text-[11px] font-bold hover:bg-red-600 transition-all"><Trash2 size={13} /> Clear Settings</button>
                      <button onClick={() => { if (window.confirm('Reset all staff analytics caches?')) toast.success('Cache cleared'); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-[11px] font-bold hover:bg-red-50 transition-all"><RefreshCw size={13} /> Clear Cache</button>
                    </div>
                  </GlassCard>
                </>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    );
  };

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
    const statusOptions = ['Present', 'Absent', 'Late', 'Half Day', 'Leave', 'Work From Home'];
    const autoCheckInStatuses = ['Present', 'Late', 'Half Day', 'Work From Home'];
    const updateStatus = (staffId: string, status: string) => {
      setAttendanceStatuses(prev => ({ ...prev, [staffId]: status }));
      if (status && autoCheckInStatuses.includes(status) && !attendanceCheckIns[staffId]) {
        setAttendanceCheckIns(prev => ({ ...prev, [staffId]: new Date().toTimeString().slice(0, 5) }));
      }
    };
    const submitAttendance = async () => {
      setAttSaving(true);
      try {
        const records = Object.entries(attendanceStatuses).map(([staff_id, status]) => ({
          staff_id,
          status,
          check_in: attendanceCheckIns[staff_id] || null,
        }));
        const res = await staffAttendanceApi.save(attDate, records);
        if (!res.success) { console.error('Attendance save failed:', res); toast.error(res.error || 'Failed to save attendance'); return; }
        toast.success(`Attendance saved for ${records.length} staff`);
        setShowMarkAttendance(false);
        setAttendanceStatuses({});
        setAttendanceCheckIns({});
        setSelectedAttDept(null);
        staffAttendanceApi.getAll(attDate).then((r: any) => setAttendanceData((Array.isArray(r) ? r : (r?.data || [])).map((x: any) => ({ ...x, status: (x.status || '').toLowerCase() }))));
      } catch (e: any) {
        toast.error(e?.message || 'Failed to save attendance');
      } finally {
        setAttSaving(false);
      }
    };
    const deptStaff = selectedAttDept ? staffArray.filter((s: any) => s.department === selectedAttDept) : [];
    const deptAnyMarked = deptStaff.some((s: any) => attendanceStatuses[s.id || s.employee_id]);
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
            <button onClick={() => { if (!attSaving) { setShowMarkAttendance(false); setAttendanceStatuses({}); setAttendanceCheckIns({}); setSelectedAttDept(null); } }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
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
                  <div key={member.id || member.employee_id} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white text-[11px] font-bold">
                        {(member.full_name || member.name || '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-gray-900">{member.full_name || member.name || '—'}</div>
                        <div className="text-[10px] text-gray-400">{member.employee_id || member.staff_unique_id || member.designation || member.role || ''}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-gray-400" />
                        <input type="time" value={attendanceCheckIns[member.id || member.employee_id] || ''}
                          onChange={e => setAttendanceCheckIns(prev => ({ ...prev, [member.id || member.employee_id]: e.target.value }))}
                          className="px-2 py-1 rounded-lg border border-gray-200 bg-white text-[10px] font-medium focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
                      </div>
                      <div className="flex gap-1">
                        {statusOptions.map(opt => {
                          const selected = (attendanceStatuses[member.id || member.employee_id] || '') === opt;
                          const colors: Record<string, string> = {
                            present: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
                            absent: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
                            late: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100',
                            leave: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
                            'half day': 'bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-100',
                            'work from home': 'bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100',
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
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedAttDept && (
            <div className="flex items-center justify-between p-5 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">{deptStaff.filter((s: any) => attendanceStatuses[s.id || s.employee_id]).length} of {deptStaff.length} staff marked in {selectedAttDept}</span>
              <div className="flex gap-2">
                <button onClick={() => { setShowMarkAttendance(false); setAttendanceStatuses({}); setAttendanceCheckIns({}); setSelectedAttDept(null); }} disabled={attSaving} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={submitAttendance} disabled={!deptAnyMarked || attSaving}
                  className="px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5a3ee8] transition-all disabled:opacity-50 flex items-center gap-1.5">
                  {attSaving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <>Save Attendance ({deptStaff.filter((s: any) => attendanceStatuses[s.id || s.employee_id]).length})</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==================== EDIT ATTENDANCE MODAL ====================
  const renderEditAttendanceModal = () => {
    if (!editAttRecord) return null;
    const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] focus:ring-3 focus:ring-[rgba(109,76,255,0.1)]";
    const saveEdit = async () => {
      setEditAttSaving(true);
      try {
        const payload: any = {
          status: editAttForm.status || 'Present',
          check_in: editAttForm.check_in || null,
          check_out: editAttForm.check_out || null,
          remarks: editAttForm.remarks || null,
        };
        if (!editAttRecord.id) {
          const res = await staffAttendanceApi.save(attDate, [{ staff_id: editAttRecord.staff_id, ...payload }]);
          if (!res.success) { toast.error(res.error || 'Failed to save attendance'); return; }
        } else {
          const res = await staffAttendanceApi.updateRecord(editAttRecord.id, payload);
          if (!res.success) { toast.error(res.error || 'Failed to update attendance'); return; }
        }
        toast.success('Attendance record updated');
        setEditAttRecord(null);
        setEditAttForm({});
        staffAttendanceApi.getAll(attDate).then((r: any) => setAttendanceData((Array.isArray(r) ? r : (r?.data || [])).map((x: any) => ({ ...x, status: (x.status || '').toLowerCase() }))));
      } catch (e: any) {
        toast.error(e?.message || 'Failed to update attendance');
      } finally {
        setEditAttSaving(false);
      }
    };
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { if (!editAttSaving) setEditAttRecord(null); }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900">Edit Attendance</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">{editAttRecord.full_name || editAttRecord.employee_name || editAttRecord.name || '—'} · {attDate}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {editAttRecord.marked_by_name && (
                  <span className="text-[9px] text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-md px-1.5 py-0.5">Marked by: {editAttRecord.marked_by_name}{editAttRecord.marked_by_role ? ` (${editAttRecord.marked_by_role})` : ''}</span>
                )}
                {(editAttRecord.updated_by_name || editAttRecord.updated_by) && (
                  <span className="text-[9px] text-[#6D4CFF] bg-[#F3F0FF] border border-[#E4DEFC] rounded-md px-1.5 py-0.5">Last edited by: {editAttRecord.updated_by_name || '—'}{editAttRecord.updated_by_role ? ` (${editAttRecord.updated_by_role})` : ''}</span>
                )}
              </div>
            </div>
            <button onClick={() => { if (!editAttSaving) setEditAttRecord(null); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Status</label>
              <div className="flex gap-1.5">
                {['Present', 'Absent', 'Late', 'Leave'].map(opt => (
                  <button key={opt} onClick={() => setEditAttForm((p: any) => ({ ...p, status: opt }))}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all capitalize ${editAttForm.status === opt ? 'bg-[#6D4CFF] text-white border-[#6D4CFF]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Check In</label>
                <input type="time" value={editAttForm.check_in || ''} onChange={e => setEditAttForm((p: any) => ({ ...p, check_in: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Check Out</label>
                <input type="time" value={editAttForm.check_out || ''} onChange={e => setEditAttForm((p: any) => ({ ...p, check_out: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Remarks</label>
              <input type="text" placeholder="Optional remarks" value={editAttForm.remarks || ''} onChange={e => setEditAttForm((p: any) => ({ ...p, remarks: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100">
            <button onClick={() => setEditAttRecord(null)} disabled={editAttSaving} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
            <button onClick={saveEdit} disabled={editAttSaving}
              className="px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5a3ee8] transition-all disabled:opacity-50 flex items-center gap-1.5">
              {editAttSaving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-w-0">
      {!['directory', 'attendance', 'assignments', 'academic', 'timetable', 'leave', 'performance', 'documents', 'communication', 'salary', 'expenses', 'approvals', 'analytics', 'settings'].includes(activeTab) && renderHeader()}

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
          {activeTab === 'documents' && <motion.div key="documents" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderDocuments()}</motion.div>}
          {activeTab === 'communication' && <motion.div key="communication" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderCommunication()}</motion.div>}
          {activeTab === 'salary' && <motion.div key="salary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderSalary()}</motion.div>}
          {activeTab === 'expenses' && <motion.div key="expenses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderExpenses()}</motion.div>}
          {activeTab === 'approvals' && <motion.div key="approvals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderApprovals()}</motion.div>}
          {activeTab === 'analytics' && <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderAnalytics()}</motion.div>}
          {activeTab === 'settings' && <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>{renderSettings()}</motion.div>}
        </AnimatePresence>
      </div>

      {renderMarkAttendanceModal()}
      {renderEditAttendanceModal()}
      {renderAssignClassModal()}
      {renderAssignWorkModal()}
      {renderAcademicModal()}
      {showBulkImport && <StaffBulkImportWizard onClose={() => setShowBulkImport(false)} onDone={() => setShowBulkImport(false)} />}

      {showAddStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowAddStaff(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-sm">Add Staff Member</h3>
              <button onClick={() => setShowAddStaff(false)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg">×</button>
            </div>
            <div className="p-5">
              <SimpleStaffForm onDone={() => { staffData.refetch?.(); setShowAddStaff(false); }} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
