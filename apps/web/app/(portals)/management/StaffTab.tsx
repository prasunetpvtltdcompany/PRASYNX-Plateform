'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useForm, LoadingSkeleton, ErrorState, EmptyState, useApi } from './lib/useApi';
import apiClient from './lib/apiClient';
import { auth } from './lib/auth';
import Link from 'next/link';
import {
  staffApi, classApi, subjectApi, credentialMgmtApi, bulkApi, staffAttendanceApi
} from './lib/dataService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart as RePie, Pie, Cell, Legend
} from 'recharts';
import {
  Building2, Briefcase, ChevronLeft, ChevronRight, Download, Edit3, Eye, Filter,
  GraduationCap, Key, Layers, Plus, RotateCcw, Search, Trash2, Upload,
  UserCheck, Users, UserX, ChevronDown, X, Loader2, CheckCircle2, Printer,
  FileSpreadsheet, EyeOff, AlertTriangle, FileText, XCircle, AlertCircle,
  MoreVertical, Calendar, DollarSign, MapPin, Mail, Phone, User, ShieldAlert,
  UserPlus, LayoutDashboard, TrendingUp, Lock, Shield, Activity
} from 'lucide-react';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const orgId = () => {
  if (typeof window === 'undefined') return '';
  try {
    const s = auth.getSession();
    return s?.organisation?.id && UUID_RE.test(s.organisation.id) ? s.organisation.id : '';
  } catch { return ''; }
};

const getLoggedInUser = () => {
  if (typeof window === 'undefined') return 'Administrator';
  try {
    const s = auth.getSession();
    return s?.user?.full_name || s?.user?.email || 'Administrator';
  } catch { return 'Administrator'; }
};

const STAFF_COLUMNS = [
  { key: 'employee_id',       label: 'Employee ID',       required: false },
  { key: 'full_name',         label: 'Full Name',          required: true  },
  { key: 'email',             label: 'Email',              required: true  },
  { key: 'phone',             label: 'Phone',              required: false },
  { key: 'role',              label: 'Role',               required: true  },
  { key: 'department',        label: 'Department',         required: false },
  { key: 'designation',       label: 'Designation',        required: false },
  { key: 'qualification',     label: 'Qualification',      required: false },
  { key: 'experience_years',  label: 'Experience Years',   required: false },
  { key: 'joining_date',      label: 'Joining Date',       required: false },
  { key: 'gender',            label: 'Gender',             required: false },
  { key: 'date_of_birth',     label: 'Date of Birth',      required: false },
  { key: 'address',           label: 'Address',            required: false },
  { key: 'city',              label: 'City',               required: false },
  { key: 'state',             label: 'State',              required: false },
  { key: 'country',           label: 'Country',            required: false },
  { key: 'postal_code',       label: 'Postal Code',        required: false },
  { key: 'salary',            label: 'Salary',             required: false },
  { key: 'employment_type',   label: 'Employment Type',    required: false },
  { key: 'reporting_manager', label: 'Reporting Manager',  required: false },
  { key: 'assigned_classes',  label: 'Assigned Classes',   required: false },
  { key: 'assigned_subjects', label: 'Assigned Subjects',  required: false },
  { key: 'status',            label: 'Status',             required: false },
];

function KpiCard({ icon: Icon, label, value, trend, color, bg, chart }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}><Icon size={18} /></div>
        {trend && <Badge variant={trend.startsWith('+') ? 'success' : 'danger'} className="text-[9px]">{trend}</Badge>}
      </div>
      <div className="text-[11px] text-gray-500 font-medium">{label}</div>
      <div className="text-xl font-extrabold text-gray-900 mt-0.5">{value ?? '—'}</div>
      {chart && chart.length > 0 && (
        <div className="flex items-end gap-0.5 h-6 mt-1">
          {chart.map((v: number, ci: number) => (
            <div key={ci} className="flex-1 rounded-sm" style={{ height: `${Math.max(v * 0.7, 3)}%`, background: `${color}25` }} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

const CHART_COLORS = ['#6D4CFF', '#8B5CF6', '#A855F7', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#14B8A6', '#EC4899', '#F97316'];

function DashboardInsights({ analytics, loading, onRetry }: { analytics: any; loading?: boolean; onRetry?: () => void }) {
  const a = analytics || {};
  const trend: any[] = Array.isArray(a.attendanceTrend) ? a.attendanceTrend : [];
  const depts: any[] = Array.isArray(a.departmentDistribution) ? a.departmentDistribution : [];
  const roles: any[] = Array.isArray(a.roleDistribution) ? a.roleDistribution : [];

  return (
    <div className="mb-4 animate-fadeIn">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="stat-card"><div className="text-[11px] text-gray-500 font-medium">Present Today</div><div className="text-xl font-extrabold text-gray-900 mt-0.5">{a.presentToday ?? '—'}</div><div className="text-[10px] text-emerald-600 font-semibold mt-0.5">{a.todayRate != null ? `${a.todayRate}% rate` : ''}</div></div>
        <div className="stat-card"><div className="text-[11px] text-gray-500 font-medium">Absent Today</div><div className="text-xl font-extrabold text-gray-900 mt-0.5">{a.absentToday ?? '—'}</div><div className="text-[10px] text-red-500 font-semibold mt-0.5">{a.totalStaff != null ? `of ${a.totalStaff} staff` : ''}</div></div>
        <div className="stat-card"><div className="text-[11px] text-gray-500 font-medium">7-Day Attendance</div><div className="text-xl font-extrabold text-gray-900 mt-0.5">{a.weekRate != null ? `${a.weekRate}%` : '—'}</div><div className="text-[10px] text-blue-600 font-semibold mt-0.5">rolling average</div></div>
        <div className="stat-card"><div className="text-[11px] text-gray-500 font-medium">Departments</div><div className="text-xl font-extrabold text-gray-900 mt-0.5">{depts.length || '—'}</div><div className="text-[10px] text-purple-600 font-semibold mt-0.5">{roles.length || ''} role types</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance Trend */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-[#6D4CFF]" />
              <h3 className="text-xs font-bold text-gray-700">Attendance Trend</h3>
            </div>
            <Badge className="text-[9px] font-medium bg-purple-50 text-purple-700">Last {trend.length} days</Badge>
          </div>
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
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Area type="monotone" dataKey="Present" stroke="#22C55E" strokeWidth={2} fill="url(#attPresent)" />
                  <Area type="monotone" dataKey="Absent" stroke="#EF4444" strokeWidth={2} fill="url(#attAbsent)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message="No attendance records in the selected period yet." />
          )}
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-[#3B82F6]" />
              <h3 className="text-xs font-bold text-gray-700">Department Distribution</h3>
            </div>
            {depts.length > 0 && <Badge className="text-[9px] font-medium bg-blue-50 text-blue-700">{depts.length} departments</Badge>}
          </div>
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
                    {depts.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState message="No department data available." />
          )}
        </div>

        {/* Role Distribution */}
        {roles.length > 0 && (
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase size={15} className="text-[#8B5CF6]" />
              <h3 className="text-xs font-bold text-gray-700">Role Distribution</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {roles.map((r: any, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-gray-800 capitalize truncate">{r.name}</div>
                    <div className="text-[9px] text-gray-400">{r.count} staff</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModulePage({ title, desc, actions, children }: { title: string; desc?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{title}</h1>
          {desc && <p className="text-sm text-gray-400 mt-1">{desc}</p>}
        </div>
        {actions && (
          <div className="flex-shrink-0 w-full md:w-auto">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className="flex items-center justify-center gap-1.5 px-4 py-3 sm:py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.98] transition-all min-h-[44px] sm:min-h-0 w-full sm:w-auto">
      <Plus size={14} /> {label}
    </button>
  );
}

function CrudModal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-sm">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg">×</button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}

function LargeCrudModal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-sm">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg">×</button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}

function getRoleBadgeStyle(role: string) {
  const r = (role || '').toLowerCase();
  if (r.includes('principal')) return 'bg-purple-100 text-purple-700 border border-purple-200';
  if (r.includes('teacher')) return 'bg-blue-100 text-blue-700 border border-blue-200';
  if (r.includes('accountant')) return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  if (r.includes('librarian')) return 'bg-cyan-100 text-cyan-700 border border-cyan-200';
  if (r.includes('driver')) return 'bg-amber-100 text-amber-700 border border-amber-200';
  if (r.includes('security')) return 'bg-red-100 text-red-700 border border-red-200';
  if (r.includes('sweeper')) return 'bg-gray-100 text-gray-700 border border-gray-300';
  if (r.includes('nurse')) return 'bg-pink-100 text-pink-700 border border-pink-200';
  return 'bg-purple-50 text-purple-650';
}

// ─── Forms ──────────────────────────────────────────────────────────────────
function AssignClassForm({ staff, classesList, subjectsList, onDone }: { staff: any; classesList: any[]; subjectsList: any[]; onDone: () => void }) {
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(new Set());
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const toggleClass = (id: string) => {
    setSelectedClassIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds(prev => {
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
      const res = await staffApi.assignClass(staff.id, {
        class_ids: Array.from(selectedClassIds),
        subject_ids: Array.from(selectedSubjectIds)
      });
      if (res.success) {
        toast.success(`${selectedClassIds.size * selectedSubjectIds.size} assignment(s) created successfully!`);
        onDone();
      } else {
        toast.error(res.error || 'Failed to assign class/subject');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
        <p className="font-bold text-purple-900">Assigning for: {staff.full_name}</p>
        <p className="text-purple-600 mt-0.5">Role: <span className="capitalize">{staff.role}</span></p>
        {selectedClassIds.size > 0 && selectedSubjectIds.size > 0 && (
          <p className="text-[10px] text-purple-500 mt-1">
            {selectedClassIds.size} class × {selectedSubjectIds.size} subject = {selectedClassIds.size * selectedSubjectIds.size} total assignment(s)
          </p>
        )}
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">
          Classes <span className="text-red-500">*</span>
          <span className="text-gray-400 font-normal ml-1">({selectedClassIds.size} selected)</span>
        </label>
        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-1 space-y-0.5">
          {classesList.map((c: any) => (
            <label key={c.id} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${selectedClassIds.has(c.id) ? 'bg-purple-50 text-purple-900' : 'hover:bg-gray-50 text-gray-700'}`}>
              <input type="checkbox" checked={selectedClassIds.has(c.id)} onChange={() => toggleClass(c.id)} className="accent-[#6D4CFF]" />
              <span>{c.name}{c.section ? ` - ${c.section}` : ''}</span>
            </label>
          ))}
          {classesList.length === 0 && <p className="text-gray-400 px-2 py-3 text-center">No classes available</p>}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-700 mb-1 block">
          Subjects <span className="text-red-500">*</span>
          <span className="text-gray-400 font-normal ml-1">({selectedSubjectIds.size} selected)</span>
        </label>
        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-1 space-y-0.5">
          {subjectsList.map((s: any) => (
            <label key={s.id} className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${selectedSubjectIds.has(s.id) ? 'bg-purple-50 text-purple-900' : 'hover:bg-gray-50 text-gray-700'}`}>
              <input type="checkbox" checked={selectedSubjectIds.has(s.id)} onChange={() => toggleSubject(s.id)} className="accent-[#6D4CFF]" />
              <span>{s.name}{s.code ? ` (${s.code})` : ''}</span>
            </label>
          ))}
          {subjectsList.length === 0 && <p className="text-gray-400 px-2 py-3 text-center">No subjects available</p>}
        </div>
      </div>
      <button onClick={handleAssign} disabled={saving}
        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-1.5">
        {saving ? <Loader2 size={13} className="animate-spin" /> : null}
        {saving ? 'Assigning...' : `Assign ${selectedClassIds.size > 0 && selectedSubjectIds.size > 0 ? `${selectedClassIds.size * selectedSubjectIds.size} ` : ''}Class(es) & Subject(s)`}
      </button>
    </div>
  );
}

function EditStaffForm({ staff, onDone }: { staff: any; onDone: () => void }) {
  const [saving, setSaving] = useState(false);
  const f = useForm({
    full_name: staff.full_name || '',
    email: staff.email || '',
    role: staff.role || 'teacher',
    phone: staff.phone || '',
    employee_id: staff.staff_unique_id || staff.staff_unique_id || '',
    department: staff.department || '',
    designation: staff.designation || '',
    qualification: staff.qualification || '',
    experience_years: staff.experience_years !== undefined ? String(staff.experience_years) : '',
    joining_date: staff.join_date || staff.joining_date ? (staff.join_date || staff.joining_date).split('T')[0] : '',
    gender: staff.gender || 'Male',
    date_of_birth: staff.date_of_birth ? staff.date_of_birth.split('T')[0] : '',
    address: staff.address || '',
    city: staff.city || '',
    state: staff.state || '',
    country: staff.country || '',
    postal_code: staff.postal_code || '',
    salary: staff.salary !== undefined ? String(staff.salary) : '',
    employment_type: staff.employment_type || 'Full-time',
    reporting_manager: staff.reporting_manager || '',
    subject: staff.subject || '',
    status: staff.status || 'active'
  });

  const handleUpdate = async () => {
    if (!f.values.full_name) {
      toast.error('Full Name is required');
      return;
    }
    setSaving(true);
    try {
      const res = await staffApi.update(staff.id, f.values);
      if (res.success) {
        toast.success('Staff member updated successfully!');
        onDone();
      } else {
        toast.error(res.error || 'Failed to update staff');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={e => { e.preventDefault(); handleUpdate(); }} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5 pb-2 border-b border-gray-100/80">
          <Key size={14} /> Account & Role
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={f.values.full_name} onChange={e => f.handleChange('full_name', e.target.value)} required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Role <span className="text-red-500">*</span></label>
            <select value={f.values.role} onChange={e => f.handleChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white">
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="accountant">Accountant</option>
              <option value="librarian">Librarian</option>
              <option value="transport_manager">Transport Manager</option>
              <option value="hostel_warden">Hostel Warden</option>
              <option value="staff">Staff</option>
              <option value="driver">Driver</option>
              <option value="counsellor">Counsellor</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Phone</label>
            <input type="tel" value={f.values.phone} onChange={e => f.handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Login Email</label>
            <input type="email" readOnly value={f.values.email}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-100 text-gray-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Status</label>
            <select value={f.values.status} onChange={e => f.handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5 pb-2 border-b border-gray-100/80">
          <Briefcase size={14} /> Professional Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Employee ID</label>
            <input type="text" value={f.values.employee_id} onChange={e => f.handleChange('employee_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Department</label>
            <input type="text" value={f.values.department} onChange={e => f.handleChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Designation</label>
            <input type="text" value={f.values.designation} onChange={e => f.handleChange('designation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Qualification</label>
            <input type="text" value={f.values.qualification} onChange={e => f.handleChange('qualification', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Experience (Years)</label>
            <input type="number" min="0" value={f.values.experience_years} onChange={e => f.handleChange('experience_years', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Joining Date</label>
            <input type="date" value={f.values.joining_date} onChange={e => f.handleChange('joining_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white text-gray-500" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Salary</label>
            <input type="number" min="0" value={f.values.salary} onChange={e => f.handleChange('salary', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Employment Type</label>
            <select value={f.values.employment_type} onChange={e => f.handleChange('employment_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white">
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Temporary">Temporary</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Reporting Manager</label>
            <input type="text" value={f.values.reporting_manager} onChange={e => f.handleChange('reporting_manager', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" />
          </div>
        </div>
        {f.values.role === 'teacher' && (
          <div className="pt-2">
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Subject(s)</label>
            <input type="text" value={f.values.subject} onChange={e => f.handleChange('subject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" />
          </div>
        )}
      </div>

      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5 pb-2 border-b border-gray-100/80">
          <Users size={14} /> Personal & Address Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Gender</label>
            <select value={f.values.gender} onChange={e => f.handleChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Date of Birth</label>
            <input type="date" value={f.values.date_of_birth} onChange={e => f.handleChange('date_of_birth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white text-gray-500" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Address</label>
          <input type="text" value={f.values.address} onChange={e => f.handleChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">City</label>
            <input type="text" value={f.values.city} onChange={e => f.handleChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">State</label>
            <input type="text" value={f.values.state} onChange={e => f.handleChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Country</label>
            <input type="text" value={f.values.country} onChange={e => f.handleChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Postal Code</label>
            <input type="text" value={f.values.postal_code} onChange={e => f.handleChange('postal_code', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all">
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

export function StaffForm({ onDone, onCreated }: { onDone: () => void; onCreated?: (creds: { email: string; password: string }) => void }) {
  const f = useForm({
    full_name: '',
    email: '',
    password: '',
    role: 'teacher',
    phone: '',
    employee_id: '',
    department: '',
    designation: '',
    qualification: '',
    experience_years: '',
    joining_date: '',
    gender: 'Male',
    date_of_birth: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    salary: '',
    employment_type: 'Full-time',
    reporting_manager: '',
    subject: ''
  });

  const [creating, setCreating] = useState(false);
  const [ro, setRo] = useState(true);
  const [createdTeacherId, setCreatedTeacherId] = useState<string | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [assigning, setAssigning] = useState(false);

  return (
    <form autoComplete="off" onSubmit={e => e.preventDefault()} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 text-xs">
      {!createdTeacherId ? (
        <>
          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5 pb-2 border-b border-gray-100/80">
              <Key size={14} /> Account & Role
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Full Name <span className="text-red-500">*</span></label>
                <input type="text" value={f.values.full_name} onChange={e => f.handleChange('full_name', e.target.value)} required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="Jane Smith" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Role <span className="text-red-500">*</span></label>
                <select value={f.values.role} onChange={e => f.handleChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white">
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                  <option value="accountant">Accountant</option>
                  <option value="librarian">Librarian</option>
                  <option value="transport_manager">Transport Manager</option>
                  <option value="hostel_warden">Hostel Warden</option>
                  <option value="staff">Staff</option>
                  <option value="driver">Driver</option>
                  <option value="counsellor">Counsellor</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Phone</label>
                <input type="tel" value={f.values.phone} onChange={e => f.handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="9876543210" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Login Email <span className="text-gray-400 font-normal">(Auto-generated if blank)</span></label>
                <input type="email" readOnly={ro} onFocus={() => setRo(false)} value={f.values.email} onChange={e => f.handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="jane.smith@school.edu" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Login Password <span className="text-gray-400 font-normal">(Auto-generated if blank)</span></label>
                <input type="password" readOnly={ro} onFocus={() => setRo(false)} value={f.values.password} onChange={e => f.handleChange('password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="••••••••" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5 pb-2 border-b border-gray-100/80">
              <Briefcase size={14} /> Professional Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Employee ID / Code</label>
                <input type="text" value={f.values.employee_id} onChange={e => f.handleChange('employee_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="EMP001" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Department</label>
                <input type="text" value={f.values.department} onChange={e => f.handleChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="Science" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Designation</label>
                <input type="text" value={f.values.designation} onChange={e => f.handleChange('designation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="Physics Teacher" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Qualification</label>
                <input type="text" value={f.values.qualification} onChange={e => f.handleChange('qualification', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="B.Sc Physics, M.Ed" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Experience (Years)</label>
                <input type="number" min="0" value={f.values.experience_years} onChange={e => f.handleChange('experience_years', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Joining Date</label>
                <input type="date" value={f.values.joining_date} onChange={e => f.handleChange('joining_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white text-gray-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Salary</label>
                <input type="number" min="0" value={f.values.salary} onChange={e => f.handleChange('salary', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="45000" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Employment Type</label>
                <select value={f.values.employment_type} onChange={e => f.handleChange('employment_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white">
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Reporting Manager</label>
                <input type="text" value={f.values.reporting_manager} onChange={e => f.handleChange('reporting_manager', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="Dr. Kumar" />
              </div>
            </div>
            {f.values.role === 'teacher' && (
              <div className="pt-2">
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Subject(s) <span className="text-gray-400 font-normal">(e.g., Mathematics, Physics)</span></label>
                <input type="text" value={f.values.subject} onChange={e => f.handleChange('subject', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="Science, Mathematics" />
              </div>
            )}
          </div>

          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5 pb-2 border-b border-gray-100/80">
              <Users size={14} /> Personal & Address Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Gender</label>
                <select value={f.values.gender} onChange={e => f.handleChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Date of Birth</label>
                <input type="date" value={f.values.date_of_birth} onChange={e => f.handleChange('date_of_birth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white text-gray-500" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Address</label>
              <input type="text" value={f.values.address} onChange={e => f.handleChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="123 Main St" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">City</label>
                <input type="text" value={f.values.city} onChange={e => f.handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="Mumbai" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">State</label>
                <input type="text" value={f.values.state} onChange={e => f.handleChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="Maharashtra" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Country</label>
                <input type="text" value={f.values.country} onChange={e => f.handleChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="India" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">Postal Code</label>
                <input type="text" value={f.values.postal_code} onChange={e => f.handleChange('postal_code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] bg-white" placeholder="400001" />
              </div>
            </div>
          </div>

          <button type="button" onClick={async () => {
            if (creating) return;
            if (!f.values.full_name) { toast.error('Full Name is required'); return; }
            setCreating(true);
            try {
              const res = await staffApi.create(f.values);
              if (!res.success) { toast.error(res.error || 'Failed to create staff'); return; }
              const creds = res.data?.credentials || {};
              toast.success(`Staff created — Email: ${creds.email || f.values.email || res.data?.user?.email}`);
              onCreated?.({ email: creds.email || f.values.email || res.data?.user?.email, password: creds.password || f.values.password || '' });
              if (f.values.role === 'teacher' && res.data?.teacher?.id) {
                setCreatedTeacherId(res.data.teacher.id);
                classApi.getAll().then(r => { if (r.success && Array.isArray(r.data)) setClasses(r.data); });
                apiClient.get<any[]>(`/management/subjects/${orgId()}`).then(r => { if (r.success && Array.isArray(r.data)) setSubjects(r.data); });
              } else { onDone(); }
            } catch (err: any) { toast.error(err.message); } finally { setCreating(false); }
          }} className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all">
            {creating ? 'Creating...' : <>Add Staff Member</>}
          </button>
        </>
      ) : (
        <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100/50 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Briefcase size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-purple-900">Assign Class & Subject</p>
              <p className="text-[10px] text-purple-500">Link the newly created teacher to their respective academic divisions</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Class</label>
              <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                <option value="">Select Class</option>
                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}{c.section ? ` - ${c.section}` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Subject</label>
              <select value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                <option value="">Select Subject</option>
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}{s.code ? ` (${s.code})` : ''}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => onDone()} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-all">Skip Assignment</button>
            <button type="button" onClick={async () => {
              if (!selectedClassId || !selectedSubjectId || assigning) return;
              setAssigning(true);
              try {
                const res = await apiClient.post(`/management/staff/${createdTeacherId}/assign-class`, { class_id: selectedClassId, subject_id: selectedSubjectId, organisation_id: orgId() });
                if (res.success) { toast.success('Class & subject assigned!'); onDone(); }
                else toast.error(res.error || 'Assignment failed');
              } catch (err: any) { toast.error(err.message); } finally { setAssigning(false); }
            }} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg disabled:opacity-50 transition-all">
              {assigning ? 'Assigning...' : 'Assign & Done'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

// ─── Profile Drawer ──────────────────────────────────────────────────────────
function StaffProfileDrawer({ staff, open, onClose, onAction }: { staff: any; open: boolean; onClose: () => void; onAction: (action: string, data?: any) => void }) {
  if (!open || !staff) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg md:max-w-xl h-full bg-white shadow-2xl flex flex-col z-10 border-l border-gray-100"
        >
          <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-750 text-base font-bold shadow-sm border border-purple-200">
                {(staff.full_name || 'S').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">{staff.full_name}</h3>
                <p className="text-[10px] text-gray-400">Employee ID: {staff.staff_unique_id || staff.staff_unique_id || '—'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-gray-600">
            <div className="bg-purple-50/40 border border-purple-100 rounded-xl p-3 flex flex-wrap gap-1.5 shadow-sm">
              <button
                onClick={() => onAction('edit', staff)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all font-semibold"
              >
                <Edit3 size={12} /> Edit Staff
              </button>
              <button
                onClick={() => onAction('assign_classes', staff)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 transition-all font-semibold"
              >
                <Layers size={12} /> Assign Classes/Subjects
              </button>
              <button
                onClick={() => onAction('reset_password', staff)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-amber-250 text-amber-700 hover:bg-amber-50 transition-all font-semibold"
              >
                <Key size={12} /> Reset Password
              </button>
              <button
                onClick={() => onAction('toggle_status', staff)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all font-semibold"
              >
                {staff.status === 'active' ? <UserX size={12} /> : <UserCheck size={12} />}
                {staff.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => onAction('delete', staff)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-750 hover:bg-red-100/60 transition-all font-semibold ml-auto"
              >
                <Trash2 size={12} /> Delete Staff
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-gray-800 text-[10px] uppercase tracking-wider text-purple-650 flex items-center gap-1.5 border-b pb-1.5">
                <User size={13} /> Personal Information
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <span className="text-gray-400 block font-medium">Employee ID</span>
                  <span className="font-semibold text-gray-850">{staff.staff_unique_id || staff.staff_unique_id || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Full Name</span>
                  <span className="font-semibold text-gray-850">{staff.full_name || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Email Address</span>
                  <span className="font-semibold text-gray-850 font-mono">{staff.email || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Phone Number</span>
                  <span className="font-semibold text-gray-850">{staff.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Gender</span>
                  <span className="font-semibold text-gray-805 capitalize">{staff.gender || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Date of Birth</span>
                  <span className="font-semibold text-gray-805">{staff.date_of_birth || staff.dob || '—'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-gray-800 text-[10px] uppercase tracking-wider text-purple-650 flex items-center gap-1.5 border-b pb-1.5">
                <Briefcase size={13} /> Professional Information
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <span className="text-gray-400 block font-medium">Role</span>
                  <span className="font-semibold text-gray-805 capitalize">{staff.role || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Department</span>
                  <span className="font-semibold text-gray-805 capitalize">{staff.department || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Designation</span>
                  <span className="font-semibold text-gray-855 capitalize">{staff.designation || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Qualification</span>
                  <span className="font-semibold text-gray-800">{staff.qualification || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Experience</span>
                  <span className="font-semibold text-gray-800">{staff.experience_years !== undefined ? `${staff.experience_years} Years` : '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Joining Date</span>
                  <span className="font-semibold text-gray-800">{staff.joining_date || staff.join_date || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Employment Type</span>
                  <span className="font-semibold text-gray-800 capitalize">{staff.employment_type || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Reporting Manager</span>
                  <span className="font-semibold text-gray-800">{staff.reporting_manager || '—'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-gray-800 text-[10px] uppercase tracking-wider text-purple-655 flex items-center gap-1.5 border-b pb-1.5">
                <GraduationCap size={13} /> Academic Assignments
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="col-span-2">
                  <span className="text-gray-400 block font-medium mb-1">Assigned Classes</span>
                  {Array.isArray(staff.assigned_classes) && staff.assigned_classes.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {staff.assigned_classes.map((c: string, idx: number) => (
                        <span key={idx} className="bg-purple-50 text-purple-700 text-[10px] px-2 py-0.5 rounded font-semibold border border-purple-100">{c}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-450 italic font-medium">No classes assigned</span>
                  )}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block font-medium mb-1">Assigned Subjects</span>
                  {Array.isArray(staff.assigned_subjects) && staff.assigned_subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {staff.assigned_subjects.map((sub: string, idx: number) => (
                        <span key={idx} className="bg-blue-50 text-blue-705 text-[10px] px-2 py-0.5 rounded font-semibold border border-blue-100">{sub}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-450 italic font-medium">No subjects assigned</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-gray-800 text-[10px] uppercase tracking-wider text-purple-655 flex items-center gap-1.5 border-b pb-1.5">
                <MapPin size={13} /> Address Information
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="col-span-2">
                  <span className="text-gray-400 block font-medium">Street Address</span>
                  <span className="font-semibold text-gray-800">{staff.address || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">City</span>
                  <span className="font-semibold text-gray-800 capitalize">{staff.city || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">State</span>
                  <span className="font-semibold text-gray-800 capitalize">{staff.state || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Country</span>
                  <span className="font-semibold text-gray-800 capitalize">{staff.country || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Postal Code</span>
                  <span className="font-semibold text-gray-800">{staff.postal_code || '—'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-gray-800 text-[10px] uppercase tracking-wider text-purple-650 flex items-center gap-1.5 border-b pb-1.5">
                <DollarSign size={13} /> Payroll
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <span className="text-gray-400 block font-medium">Salary (Monthly)</span>
                  <span className="font-bold text-[#6D4CFF] text-sm">{staff.salary ? `₹${Number(staff.salary).toLocaleString()}` : '—'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-gray-800 text-[10px] uppercase tracking-wider text-purple-655 flex items-center gap-1.5 border-b pb-1.5">
                <ShieldAlert size={13} /> Account Status
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <span className="text-gray-400 block font-medium">Login Status</span>
                  <Badge variant={staff.user_id ? 'success' : 'default'} className="mt-0.5 text-[9px]">
                    {staff.user_id ? 'Login Enabled' : 'Login Disabled'}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Last Login</span>
                  <span className="font-semibold text-gray-800">{staff.last_login ? new Date(staff.last_login).toLocaleString() : 'Never logged in'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Bulk Import Wizard ──────────────────────────────────────────────────────
const getImportHistory = (): any[] => {
  if (typeof window === 'undefined') return [];
  try {
    const oId = orgId();
    if (!oId) return [];
    return JSON.parse(localStorage.getItem(`prasynx_staff_import_history_${oId}`) || '[]');
  } catch { return []; }
};

const saveImportHistory = (history: any[]) => {
  const oId = orgId();
  if (oId) {
    localStorage.setItem(`prasynx_staff_import_history_${oId}`, JSON.stringify(history));
  }
};

function StaffBulkImportWizard({ onClose, onDone, onCreated }: { onClose: () => void; onDone: () => void; onCreated?: (creds: Record<string, { email: string; password: string }>) => void }) {
  const [phase, setPhase] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(false);
  const [importResults, setImportResults] = useState<any[]>([]);
  const [importSummary, setImportSummary] = useState({ success: 0, failed: 0, total: 0 });
  const [validFilter, setValidFilter] = useState<'all' | 'valid' | 'invalid'>('all');
  const [credVisible, setCredVisible] = useState<Record<number, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setHistory(getImportHistory());
  }, []);

  const parseRows = (headers: string[], vals: string[][]): any[] => {
    const rows: any[] = [];
    for (const cells of vals) {
      if (cells.every(v => !v.trim())) continue;
      const row: any = {};
      headers.forEach((h, i) => { row[h] = (cells[i] ?? '').trim(); });
      if (row.full_name || row.email) rows.push(row);
    }
    return rows;
  };

  const handleFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    try {
      let rows: any[] = [];
      if (ext === 'csv') {
        const text = await file.text();
        const lines = text.trim().split('\n').map(l => l.replace(/\r/g, ''));
        if (lines.length < 2) { toast.error('No data found in file'); return; }
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
        const vals = lines.slice(1).map(l => {
          const result: string[] = []; let cur = '', inQ = false;
          for (const ch of l) {
            if (ch === '"') { inQ = !inQ; }
            else if (ch === ',' && !inQ) { result.push(cur.trim()); cur = ''; }
            else { cur += ch; }
          }
          result.push(cur.trim());
          return result;
        });
        rows = parseRows(headers, vals);
      } else if (ext === 'xlsx' || ext === 'xls') {
        const XLSX = await import('xlsx');
        const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
        const json: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
        if (!json.length) { toast.error('No data found in file'); return; }
        const map: Record<string, string> = {};
        Object.keys(json[0]).forEach(k => { map[k.trim().toLowerCase().replace(/\s+/g, '_')] = k; });
        rows = json.map(r => {
          const row: any = {};
          Object.entries(map).forEach(([n, o]) => { row[n] = String((r as any)[o] ?? '').trim(); });
          return row;
        }).filter(r => r.full_name || r.email);
      } else { toast.error('Unsupported format. Use .csv, .xlsx or .xls'); return; }
      if (!rows.length) { toast.error('No valid rows found. Check file format.'); return; }
      setImportData(rows); setFileName(file.name); setValidationResults([]); setPhase('upload');
      toast.success(`Parsed ${rows.length} records from ${file.name}`);
    } catch (e: any) { toast.error('Failed to parse file: ' + e.message); }
  };

  const handleValidate = async () => {
    if (!importData.length) { toast.error('Upload a file first'); return; }
    setValidating(true);
    try {
      const res = await bulkApi.validateStaff(importData);
      if (res.success && res.data) {
        setValidationResults(res.data.results || []);
        const bad = (res.data.results || []).filter((r: any) => !r.valid).length;
        setPhase('preview');
        if (!bad) toast.success('All records valid — ready to import');
        else toast.warning(`${bad} record(s) have issues`);
      } else { toast.error(res.error || 'Validation failed'); }
    } catch (e: any) { toast.error(e.message || 'Network error'); }
    finally { setValidating(false); }
  };

  const handleImport = async () => {
    setImporting(true); setPhase('importing'); setImportProgress(0);
    const timer = setInterval(() => setImportProgress(p => p < 85 ? p + Math.random() * 8 : p), 400);
    try {
      const res = await bulkApi.createStaff(importData, sendWelcomeEmail);
      clearInterval(timer); setImportProgress(100);
      const r = res as any;
      if (r.success !== false) {
        const results = r.data?.results || r.results || [];
        const sc = r.data?.success_count ?? r.success_count ?? results.filter((x: any) => x.Status === 'Success').length;
        const fc = r.data?.failed_count ?? r.failed_count ?? results.filter((x: any) => x.Status === 'Failed').length;
        setImportResults(results); setImportSummary({ success: sc, failed: fc, total: importData.length }); setPhase('done');
        const creds: Record<string, { email: string; password: string }> = {};
        results.filter((x: any) => x.Status === 'Success' && x.Email && x.Password).forEach((x: any) => { creds[x.Email] = { email: x.Email, password: x.Password }; });
        if (Object.keys(creds).length) onCreated?.(creds);
        onDone();
        
        // Log History
        const updatedHistory = [
          {
            date: new Date().toISOString(),
            importedBy: getLoggedInUser(),
            recordsImported: sc,
            failedRecords: fc
          },
          ...getImportHistory()
        ];
        saveImportHistory(updatedHistory);
        setHistory(updatedHistory);

        if (sc > 0) toast.success(`${sc} staff imported successfully`);
        if (fc > 0) toast.error(`${fc} records failed`);
      } else { toast.error((res as any).error || 'Import failed'); setPhase('preview'); }
    } catch (e: any) { clearInterval(timer); toast.error(e.message || 'Network error'); setPhase('preview'); }
    finally { setImporting(false); }
  };

  const downloadCSV = () => {
    const header = STAFF_COLUMNS.map(c => c.key).join(',');
    const sample = [
      'EMP001,Jane Smith,jane.smith@school.edu,9876543210,Teacher,Science,Physics Teacher,B.Sc Physics,5,2024-01-15,Female,1990-05-20,123 Main St,Mumbai,Maharashtra,India,400001,45000,Full-time,Dr. Kumar,"Grade 10,Grade 11","Physics,Chemistry",active',
      'EMP002,Raj Kumar,raj.kumar@school.edu,9123456780,Principal,Administration,School Principal,M.Ed,15,2023-06-01,Male,1975-08-10,456 Park Ave,Delhi,Delhi,India,110001,90000,Full-time,,,,active',
      ',Ali Hassan,ali.hassan@school.edu,9234567891,Librarian,Library,Senior Librarian,B.Lib,8,2024-03-01,Male,1985-11-22,789 Lake Rd,Chennai,Tamil Nadu,India,600001,35000,Full-time,,,, active',
    ].join('\n');
    const blob = new Blob([header + '\n' + sample], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'staff-import-template.csv'; a.click();
    toast.success('CSV template downloaded');
  };

  const downloadExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const header = STAFF_COLUMNS.map(c => c.key);
      const ws = XLSX.utils.aoa_to_sheet([header]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Staff Import');
      XLSX.writeFile(wb, 'staff-import-template.xlsx');
      toast.success('Excel template downloaded');
    } catch { toast.error('Could not generate Excel'); }
  };

  const downloadResultsCSV = () => {
    if (!importResults.length) return;
    const header = Object.keys(importResults[0]).join(',');
    const rows = importResults.map(r => Object.values(r).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'staff-credentials.csv'; a.click();
  };

  const printCredentials = () => {
    const ok = importResults.filter(r => r.Status === 'Success');
    if (!ok.length) { toast.error('No successful imports to print'); return; }
    const pw = window.open('', '_blank');
    if (!pw) { toast.error('Allow popups to print'); return; }
    const rows = ok.map(r => `<tr><td>${r['Employee ID']||'—'}</td><td>${r['Name']||'—'}</td><td>${r['Email']||'—'}</td><td style="font-family:monospace">${r['Password']||'—'}</td><td>${r['Role']||'—'}</td></tr>`).join('');
    pw.document.write(`<html><head><title>Staff Credentials - Prasynx ERP</title><style>body{font-family:system-ui,sans-serif;padding:30px;color:#1e293b}h2{font-size:18px;font-weight:700;color:#7c3aed;border-bottom:2px solid #7c3aed;padding-bottom:8px;margin-bottom:20px}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#f8fafc;color:#64748b;font-weight:600;text-align:left;padding:10px 12px;border-bottom:1px solid #e2e8f0}td{padding:10px 12px;border-bottom:1px solid #f1f5f9}tr:nth-child(even) td{background:#fafbfc}</style></head><body><h2>Staff Import Credentials</h2><table><thead><tr><th>Employee ID</th><th>Name</th><th>Email</th><th>Password</th><th>Role</th></tr></thead><tbody>${rows}</tbody></table><script>window.onload=()=>{window.print();window.close()}<\/script></body></html>`);
    pw.document.close();
  };

  const validCount   = validationResults.filter(r => r.valid).length;
  const invalidCount = validationResults.filter(r => !r.valid).length;
  const dupCount     = validationResults.filter(r => r.errors?.some((e: string) => e.toLowerCase().includes('duplicate'))).length;
  const filteredVR   = validFilter === 'all' ? validationResults : validFilter === 'valid' ? validationResults.filter(r => r.valid) : validationResults.filter(r => !r.valid);

  const ROLE_GROUPS = [
    { label: 'Teaching', color: 'bg-blue-50 text-blue-700 border-blue-200', roles: ['Principal','Vice Principal','Teacher','Subject Teacher','HOD','Coordinator'] },
    { label: 'Administration', color: 'bg-purple-50 text-purple-700 border-purple-200', roles: ['Accountant','Receptionist','HR Manager'] },
    { label: 'Library', color: 'bg-amber-50 text-amber-700 border-amber-200', roles: ['Librarian'] },
    { label: 'Transport', color: 'bg-green-50 text-green-700 border-green-200', roles: ['Driver'] },
    { label: 'Security', color: 'bg-red-50 text-red-700 border-red-200', roles: ['Security Guard'] },
    { label: 'Housekeeping', color: 'bg-teal-50 text-teal-700 border-teal-200', roles: ['Sweeper'] },
    { label: 'Medical', color: 'bg-rose-50 text-rose-700 border-rose-200', roles: ['Nurse'] },
  ];

  const PROCESS_STEPS = [
    'Employee ID auto-generated if missing',
    'Secure password auto-generated for each staff member',
    'Role permissions assigned automatically',
    'Teachers mapped to classes and subjects',
    'Duplicate emails and employee IDs rejected automatically',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/30 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[1000px] my-6 overflow-hidden border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#F3F0FF', color: '#6D4CFF' }}>
              <Upload size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">Import Staff</h3>
              <p className="text-xs text-gray-400 mt-0.5">Manage bulk staff onboarding with automatic account creation and role assignment.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <button onClick={downloadCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
              <Download size={13} /> CSV Template
            </button>
            <button onClick={downloadExcel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
              <FileSpreadsheet size={13} /> Excel Template
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg ml-1">×</button>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(92vh-80px)]">
          {(phase === 'upload' || phase === 'preview') && (
            <>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 ${dragOver ? 'border-[#6D4CFF] bg-[#F3F0FF]/40' : fileName ? 'border-green-300 bg-green-50/30' : 'border-gray-200 hover:border-[#6D4CFF] hover:bg-[#F3F0FF]/20'}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: '#F3F0FF', color: '#6D4CFF' }}>
                  {fileName ? <CheckCircle2 size={22} className="text-green-600" /> : <Upload size={22} />}
                </div>
                {fileName ? (
                  <div>
                    <p className="text-sm font-bold text-gray-800">{fileName}</p>
                    <p className="text-xs text-gray-400 mt-1">{importData.length} records parsed · click to replace</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Click or drop CSV / Excel file</p>
                    <p className="text-xs text-gray-400 mt-1">Supports .csv, .xlsx, .xls · Auto-generated passwords and employee IDs supported</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />

              {/* Import History Section - ONLY shown when no file is uploaded yet */}
              {!fileName && history.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-150 p-4 shadow-sm space-y-2.5">
                  <p className="text-xs font-bold text-gray-850 flex items-center gap-1.5 border-b pb-2">
                    <Calendar size={14} className="text-[#6D4CFF]" />
                    <span>Import History</span>
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="min-w-full text-left text-[11px] text-gray-500">
                      <thead className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-[9px] border-b">
                        <tr>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Imported By</th>
                          <th className="px-3 py-2 text-center">Records Imported</th>
                          <th className="px-3 py-2 text-center">Failed Records</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {history.map((h, i) => (
                          <tr key={i} className="hover:bg-gray-50/50">
                            <td className="px-3 py-2 font-medium text-gray-900">{new Date(h.date).toLocaleString()}</td>
                            <td className="px-3 py-2 font-mono text-[10px]">{h.importedBy}</td>
                            <td className="px-3 py-2 text-center text-green-600 font-bold">{h.recordsImported}</td>
                            <td className="px-3 py-2 text-center text-red-650 font-bold">{h.failedRecords}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <p className="text-xs font-bold text-gray-700 mb-3">Column Reference</p>
                  <div className="mb-2">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Required</p>
                    <div className="flex flex-wrap gap-1.5">
                      {STAFF_COLUMNS.filter(c => c.required).map(c => (
                        <span key={c.key} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-705 border border-purple-200">{c.key}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 mt-2">Optional</p>
                    <div className="flex flex-wrap gap-1.5">
                      {STAFF_COLUMNS.filter(c => !c.required).map(c => (
                        <span key={c.key} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-200">{c.key}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <p className="text-xs font-bold text-gray-700 mb-3">Import Process</p>
                  <ul className="space-y-1.5">
                    {PROCESS_STEPS.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <CheckCircle2 size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs font-bold text-gray-700 mb-3">Supported Staff Roles</p>
                <div className="space-y-2.5">
                  {ROLE_GROUPS.map(g => (
                    <div key={g.label} className="flex items-start gap-3">
                      <span className="text-[10px] font-semibold text-gray-500 w-24 flex-shrink-0 pt-0.5">{g.label}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {g.roles.map(r => (
                          <span key={r} className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${g.color}`}>{r}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {phase === 'preview' && validationResults.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Total Records', value: validationResults.length, icon: FileText, color: '#6D4CFF', bg: '#F3F0FF' },
                      { label: 'Valid Records',  value: validCount,   icon: CheckCircle2, color: '#22C55E', bg: '#F0FDF4' },
                      { label: 'Invalid Records', value: invalidCount, icon: XCircle, color: '#EF4444', bg: '#FEF2F2' },
                      { label: 'Duplicates', value: dupCount, icon: AlertCircle, color: '#F59E0B', bg: '#FFFBEB' },
                    ].map(s => (
                      <div key={s.label} className="stat-card">
                        <div className="flex items-start justify-between mb-2">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg, color: s.color }}>
                            <s.icon size={18} />
                          </div>
                        </div>
                        <div className="text-[11px] text-gray-500 font-medium">{s.label}</div>
                        <div className="text-xl font-extrabold text-gray-900 mt-0.5">{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {invalidCount > 0 && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200">
                      <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-red-700">{invalidCount} record(s) have validation errors</p>
                        <p className="text-[10px] text-red-500 mt-0.5">Review the table below. Only valid records will be imported.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-gray-700 flex-1">Preview Table</p>
                    {(['all', 'valid', 'invalid'] as const).map(f => (
                      <button key={f} onClick={() => setValidFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${validFilter === f ? 'bg-[#6D4CFF] text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-150 shadow-sm">
                    <table className="min-w-full border-collapse text-left text-xs text-gray-500">
                      <thead className="bg-gray-50 text-gray-750 font-semibold uppercase tracking-wider text-[10px] border-b">
                        <tr>
                          <th className="px-4 py-2">#</th>
                          <th className="px-4 py-2">Employee ID</th>
                          <th className="px-4 py-2">Name</th>
                          <th className="px-4 py-2">Email</th>
                          <th className="px-4 py-2">Role</th>
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2">Issues</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredVR.map((r, i) => (
                          <tr key={i} style={{ background: r.valid ? undefined : '#FEF2F2' }}>
                            <td className="px-4 py-2 text-gray-400">{r.index + 1}</td>
                            <td className="px-4 py-2 text-gray-500">{r.employee_id !== 'N/A' ? r.employee_id : <span className="text-amber-500 font-medium italic">Auto</span>}</td>
                            <td className="px-4 py-2 font-medium text-gray-800">{r.full_name}</td>
                            <td className="px-4 py-2 text-gray-500 max-w-[180px] overflow-hidden truncate">{r.email}</td>
                            <td className="px-4 py-2 capitalize text-gray-600">{r.role}</td>
                            <td className="px-4 py-2">
                              {r.valid
                                ? <span className="flex items-center gap-1 text-green-600 text-xs font-semibold"><CheckCircle2 size={12} />Valid</span>
                                : <span className="flex items-center gap-1 text-red-650 text-xs font-semibold"><XCircle size={12} />Invalid</span>}
                            </td>
                            <td className="px-4 py-2 text-red-500 text-xs max-w-[240px] truncate">{r.errors?.length ? r.errors.join('; ') : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                    <button onClick={() => setSendWelcomeEmail(!sendWelcomeEmail)}
                      className={`relative w-8 h-4 rounded-full transition-colors ${sendWelcomeEmail ? 'bg-[#6D4CFF]' : 'bg-gray-250'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${sendWelcomeEmail ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Send welcome emails</p>
                      <p className="text-[10px] text-gray-400">Send login credentials to each staff member after import</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                {importData.length > 0 && phase === 'upload' && (
                  <button onClick={handleValidate} disabled={validating}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-sm font-semibold hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60">
                    {validating ? <><Loader2 size={15} className="animate-spin" /> Validating…</> : <><CheckCircle2 size={15} /> Validate {importData.length} Records</>}
                  </button>
                )}
                {phase === 'preview' && validCount > 0 && (
                  <>
                    <button onClick={() => { setPhase('upload'); setValidationResults([]); }}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
                      <ChevronLeft size={15} /> Back
                    </button>
                    <button onClick={handleImport} disabled={importing}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-sm font-semibold hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60">
                      <Upload size={15} />
                      {invalidCount > 0 ? `Import ${validCount} Valid Records (skip ${invalidCount})` : `Import All ${validCount} Records`}
                    </button>
                  </>
                )}
                {importData.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2 w-full">Upload a file to get started</p>
                )}
              </div>
            </>
          )}

          {phase === 'importing' && (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#F3F0FF', color: '#6D4CFF' }}>
                <Loader2 size={32} className="animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-gray-900">Importing Staff Records</p>
                <p className="text-sm text-gray-400 mt-1">Creating accounts and generating credentials…</p>
              </div>
              <div className="w-full max-w-sm">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Progress</span>
                  <span className="font-semibold">{Math.round(importProgress)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%`, background: 'linear-gradient(90deg,#6D4CFF,#8B5CF6)' }} />
                </div>
              </div>
              <p className="text-xs text-gray-400">Please do not close this window</p>
            </div>
          )}

          {phase === 'done' && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-5 rounded-xl border" style={{ background: importSummary.failed === 0 ? '#F0FDF4' : '#F3F0FF', borderColor: importSummary.failed === 0 ? '#86EFAC' : '#C4B5FD' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: importSummary.failed === 0 ? '#DCFCE7' : '#EDE9FE', color: importSummary.failed === 0 ? '#22C55E' : '#7C3AED' }}>
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Import Completed Successfully</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{importSummary.success} staff member{importSummary.success !== 1 ? 's' : ''} imported · {importSummary.failed} failed</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Imported', value: importSummary.success, color: '#22C55E', bg: '#F0FDF4', icon: CheckCircle2 },
                  { label: 'Failed', value: importSummary.failed, color: '#EF4444', bg: '#FEF2F2', icon: XCircle },
                  { label: 'Generated Credentials', value: importResults.filter(r => r.Status === 'Success' && r.Password).length, color: '#6D4CFF', bg: '#F3F0FF', icon: Key },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.color }}>
                        <s.icon size={18} />
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium">{s.label}</div>
                    <div className="text-xl font-extrabold text-gray-900 mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={downloadResultsCSV}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
                  <Download size={13} /> Download Credentials CSV
                </button>
                <button onClick={printCredentials}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
                  <Printer size={13} /> Print Credentials
                </button>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">Import Results</p>
                <div className="overflow-x-auto rounded-xl border border-gray-150 shadow-sm">
                  <table className="min-w-full border-collapse text-left text-xs text-gray-500">
                    <thead className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-[10px] border-b">
                      <tr>
                        <th className="px-4 py-2">Employee ID</th>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Password</th>
                        <th className="px-4 py-2">Role</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {importResults.map((r, i) => (
                        <tr key={i} style={{ background: r.Status === 'Success' ? undefined : '#FEF2F2' }}>
                          <td className="px-4 py-2 text-gray-500">{r['Employee ID'] || '—'}</td>
                          <td className="px-4 py-2 font-medium text-gray-805">{r['Name'] || '—'}</td>
                          <td className="px-4 py-2 text-gray-500 max-w-[180px] overflow-hidden truncate">{r['Email'] || '—'}</td>
                          <td className="px-4 py-2">
                            {r['Password'] && r.Status === 'Success' ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] text-[#6D4CFF] bg-[#F3F0FF] px-2 py-0.5 rounded">
                                  {credVisible[i] ? r['Password'] : '••••••••'}
                                </span>
                                <button onClick={() => setCredVisible(p => ({ ...p, [i]: !p[i] }))} className="text-gray-400 hover:text-gray-655">
                                  {credVisible[i] ? <EyeOff size={11} /> : <Eye size={11} />}
                                </button>
                              </div>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-2 capitalize text-gray-650">{r['Role'] || '—'}</td>
                          <td className="px-4 py-2">
                            {r.Status === 'Success'
                              ? <Badge variant="success" className="text-[10px]">Success</Badge>
                              : <Badge variant="danger" className="text-[10px]">Failed</Badge>}
                          </td>
                          <td className="px-4 py-2 text-red-500 text-xs max-w-[180px] truncate">{r.error || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => { setImportData([]); setFileName(''); setValidationResults([]); setImportResults([]); setPhase('upload'); }}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
                  Import Another File
                </button>
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-sm font-semibold hover:shadow-lg active:scale-[0.98] transition-all">
                  View Staff List
                </button>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function StaffTab({ staffList: propStaffList }: { staffList: any }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [newCreds, setNewCreds] = useState<Record<string, { email: string; password: string }>>({});
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [classesList, setClassesList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);

  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: '', role: '', department: '', designation: '',
    employment_type: '', status: '', gender: '', joining_date: '', experience: '',
  });

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(handler);
  }, [filters.search]);

  const staffList = useApi(() => staffApi.getAll({
    search: debouncedSearch,
    role: filters.role,
    department: filters.department,
    status: filters.status,
    employment_type: filters.employment_type
  }), [debouncedSearch, filters.role, filters.department, filters.status, filters.employment_type]);

  const dashboardAnalytics = useApi(() => staffAttendanceApi.getDashboardAnalytics(14), []);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [bulkBroadcasting, setBulkBroadcasting] = useState(false);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [filters]);

  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    classApi.getAll().then(res => {
      if (res.success && Array.isArray(res.data)) setClassesList(res.data);
    }).catch(() => {});
    apiClient.get<any[]>(`/management/subjects/${orgId()}`).then(res => {
      if (res.success && Array.isArray(res.data)) setSubjectsList(res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const oId = orgId();
    if (!oId) return;
    try {
      const saved = localStorage.getItem(`prasynx_staff_filters_${oId}`);
      if (saved) {
        setFilters(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const saveFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    const oId = orgId();
    if (oId) {
      localStorage.setItem(`prasynx_staff_filters_${oId}`, JSON.stringify(newFilters));
    }
  };

  const handleClearFilters = () => {
    const cleared = {
      search: '', role: '', department: '', designation: '',
      employment_type: '', status: '', gender: '', joining_date: '', experience: '',
    };
    saveFilters(cleared);
  };

  const stats = useMemo(() => {
    const list = staffList?.data || [];
    const total = list.length;
    const teachingRoles = ['principal', 'vice principal', 'teacher', 'subject teacher', 'hod', 'coordinator'];
    const teaching = list.filter((s: any) => teachingRoles.includes((s.role || '').toLowerCase())).length;
    const nonTeaching = total - teaching;
    const active = list.filter((s: any) => (s.status || '').toLowerCase() === 'active').length;
    const onLeave = list.filter((s: any) => (s.status || '').toLowerCase() === 'on leave' || (s.status || '').toLowerCase() === 'leave').length;
    const departments = new Set(list.map((s: any) => (s.department || '').trim()).filter(Boolean));
    return { total, teaching, nonTeaching, active, onLeave, depts: departments.size };
  }, [staffList?.data]);

  const filteredStaff = useMemo(() => {
    let result = staffList?.data || [];
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter((s: any) =>
        s.full_name?.toLowerCase().includes(q) ||
        s.staff_unique_id?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q)
      );
    }
    if (filters.role) result = result.filter((s: any) => (s.role || '').toLowerCase() === filters.role.toLowerCase());
    if (filters.department) result = result.filter((s: any) => (s.department || '').toLowerCase() === filters.department.toLowerCase());
    if (filters.designation) result = result.filter((s: any) => (s.designation || '').toLowerCase().includes(filters.designation.toLowerCase()));
    if (filters.employment_type) result = result.filter((s: any) => (s.employment_type || '').toLowerCase() === filters.employment_type.toLowerCase());
    if (filters.status) result = result.filter((s: any) => (s.status || '').toLowerCase() === filters.status.toLowerCase());
    if (filters.gender) result = result.filter((s: any) => (s.gender || '').toLowerCase() === filters.gender.toLowerCase());
    if (filters.joining_date) result = result.filter((s: any) => s.joining_date === filters.joining_date || s.join_date === filters.joining_date);
    if (filters.experience) {
      const minExp = parseInt(filters.experience, 10);
      if (!isNaN(minExp)) result = result.filter((s: any) => (s.experience_years || 0) >= minExp);
    }
    return result;
  }, [staffList?.data, filters]);

  const sortedStaff = useMemo(() => {
    const result = [...filteredStaff];
    if (!sortField) return result;
    result.sort((a: any, b: any) => {
      let valA = a[sortField], valB = b[sortField];
      if (typeof valA === 'boolean') valA = valA ? 1 : 0;
      if (typeof valB === 'boolean') valB = valB ? 1 : 0;
      if (typeof valA === 'string') valA = valA.toLowerCase().trim();
      if (typeof valB === 'string') valB = valB.toLowerCase().trim();
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [filteredStaff, sortField, sortDirection]);

  const paginatedStaff = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return sortedStaff.slice(startIdx, startIdx + pageSize);
  }, [sortedStaff, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedStaff.length / pageSize) || 1;

  useEffect(() => { setCurrentPage(1); }, [filters, pageSize]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDirection('asc'); }
  };

  const handleExportFiltered = () => {
    const rows = sortedStaff.map((s: any) => ({
      'Employee ID': s.staff_unique_id || s.staff_unique_id || '',
      'Full Name': s.full_name,
      'Role': s.role || 'staff',
      'Department': s.department || '',
      'Designation': s.designation || '',
      'Phone': s.phone || '',
      'Email': s.email || '',
      'Qualification': s.qualification || '',
      'Experience (Years)': s.experience_years || 0,
      'Employment Type': s.employment_type || '',
      'Assigned Classes': Array.isArray(s.assigned_classes) ? s.assigned_classes.join('; ') : '',
      'Assigned Subjects': Array.isArray(s.assigned_subjects) ? s.assigned_subjects.join('; ') : '',
      'Status': s.status || 'active',
      'Address': s.address || '',
      'Salary': s.salary || '',
      'Postal Code': s.postal_code || '',
    }));
    if (rows.length === 0) return void toast.warning('No filtered results to export.');
    const csvHeaders = Object.keys(rows[0]);
    const csvContent = [
      csvHeaders.join(','),
      ...rows.map((row: any) => csvHeaders.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'filtered-staff.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} records successfully!`);
  };

  const handleDeleteStaff = async (staff: any) => {
    if (!confirm(`Delete ${staff.full_name}? This is permanent.`)) return;
    try {
      const res = await staffApi.delete(staff.id);
      if (res.success) { toast.success('Staff deleted!'); staffList?.refetch(); }
      else toast.error(res.error || 'Failed to delete');
    } catch (err: any) { toast.error(err.message || 'Error'); }
  };

  const handleToggleStatus = async (staff: any) => {
    const newStatus = staff.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await staffApi.updateStatus(staff.id, newStatus);
      if (res.success) { toast.success(`Status changed to ${newStatus}!`); staffList?.refetch(); }
      else toast.error(res.error || 'Failed');
    } catch (err: any) { toast.error(err.message || 'Error'); }
  };

  const handleResetPassword = async (staff: any) => {
    try {
      const res = await credentialMgmtApi.regeneratePassword(staff.id);
      if (res.success) {
        setNewCreds(prev => ({ ...prev, [staff.email]: { email: staff.email, password: res.data?.password || 'NewPassword123' } }));
        toast.success(`Password regenerated for ${staff.full_name}!`);
      } else toast.error(res.error || 'Failed');
    } catch (err: any) { toast.error(err.message || 'Error'); }
  };

  const handleBulkExport = () => {
    const selectedList = sortedStaff.filter((s: any) => selectedIds.has(s.id));
    const rows = selectedList.map((s: any) => ({
      'Employee ID': s.staff_unique_id || s.staff_unique_id || '',
      'Full Name': s.full_name,
      'Role': s.role || 'staff',
      'Department': s.department || '',
      'Designation': s.designation || '',
      'Phone': s.phone || '',
      'Email': s.email || '',
      'Qualification': s.qualification || '',
      'Experience (Years)': s.experience_years || 0,
      'Employment Type': s.employment_type || '',
      'Assigned Classes': Array.isArray(s.assigned_classes) ? s.assigned_classes.join('; ') : '',
      'Assigned Subjects': Array.isArray(s.assigned_subjects) ? s.assigned_subjects.join('; ') : '',
      'Status': s.status || 'active',
      'Address': s.address || '',
      'Salary': s.salary || '',
      'Postal Code': s.postal_code || '',
    }));
    if (rows.length === 0) return void toast.warning('No selected staff to export.');
    const csvHeaders = Object.keys(rows[0]);
    const csvContent = [
      csvHeaders.join(','),
      ...rows.map((row: any) => csvHeaders.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'selected-staff.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} records successfully!`);
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (!status) return;
    const count = selectedIds.size;
    if (!confirm(`Update status of ${count} selected staff to "${status}"?`)) return;
    
    let success = 0;
    let fail = 0;
    
    for (const id of Array.from(selectedIds)) {
      try {
        const res = await staffApi.updateStatus(id, status);
        if (res.success) success++;
        else fail++;
      } catch {
        fail++;
      }
    }
    
    toast.success(`Successfully updated ${success} staff status. ${fail > 0 ? `${fail} failed.` : ''}`);
    setSelectedIds(new Set());
    staffList.refetch();
  };

  const handleBroadcastMessage = async () => {
    if (!broadcastMessage.trim()) {
      toast.error('Message content cannot be empty');
      return;
    }
    
    const count = selectedIds.size;
    const session = auth.getSession();
    const senderId = session?.user?.id;
    if (!senderId) {
      toast.error('Sender session not found. Please re-login.');
      return;
    }
    
    setBulkBroadcasting(true);
    let success = 0;
    let fail = 0;
    
    for (const recipientId of Array.from(selectedIds)) {
      try {
        const res = await apiClient.post('/management/staff/messages', {
          sender_id: senderId,
          recipient_id: recipientId,
          message_text: broadcastMessage,
          organisation_id: orgId()
        });
        if (res.success) success++;
        else fail++;
      } catch {
        fail++;
      }
    }
    
    setBulkBroadcasting(false);
    toast.success(`Broadcasted message to ${success} staff members. ${fail > 0 ? `${fail} failed.` : ''}`);
    setBroadcastMessage('');
    setBroadcastOpen(false);
    setSelectedIds(new Set());
  };

  const handleDrawerAction = async (action: string, data: any) => {
    setViewOpen(false);
    if (action === 'edit') {
      setSelectedStaff(data);
      setEditOpen(true);
    } else if (action === 'assign_classes' || action === 'assign_subjects') {
      setSelectedStaff(data);
      setAssignOpen(true);
    } else if (action === 'reset_password') {
      handleResetPassword(data);
    } else if (action === 'toggle_status') {
      handleToggleStatus(data);
    } else if (action === 'delete') {
      handleDeleteStaff(data);
    }
  };

  const columns = [
    { key: 'staff_unique_id', label: 'Employee ID', className: 'w-[120px] min-w-[120px] max-w-[120px]' },
    { key: 'full_name', label: 'Full Name', className: 'w-[180px] min-w-[180px] max-w-[180px]' },
    { key: 'role', label: 'Role', className: 'w-[120px] min-w-[120px] max-w-[120px]' },
    { key: 'department', label: 'Department', className: 'w-[120px] min-w-[120px] max-w-[120px]' },
    { key: 'designation', label: 'Designation', className: 'w-[130px] min-w-[130px] max-w-[130px]' },
    { key: 'phone', label: 'Phone', className: 'w-[120px] min-w-[120px] max-w-[120px]' },
    { key: 'email', label: 'Email', className: 'w-[200px] min-w-[200px] max-w-[200px] hidden xl:table-cell' },
    { key: 'qualification', label: 'Qualification', className: 'w-[150px] min-w-[150px] max-w-[150px] hidden lg:table-cell' },
    { key: 'experience_years', label: 'Experience', className: 'w-[100px] min-w-[100px] max-w-[100px] hidden xl:table-cell' },
    { key: 'employment_type', label: 'Employment Type', className: 'w-[130px] min-w-[130px] max-w-[130px] hidden xl:table-cell' },
    { key: 'assigned_classes', label: 'Assigned Classes', className: 'w-[150px] min-w-[150px] max-w-[150px] hidden lg:table-cell' },
    { key: 'assigned_subjects', label: 'Assigned Subjects', className: 'w-[150px] min-w-[150px] max-w-[150px] hidden lg:table-cell' },
    { key: 'status', label: 'Status', className: 'w-[100px] min-w-[100px] max-w-[100px]' },
    { key: 'address', label: 'Address', className: 'w-[180px] min-w-[180px] max-w-[180px] hidden xl:table-cell' },
    { key: 'salary', label: 'Salary', className: 'w-[100px] min-w-[100px] max-w-[100px] hidden xl:table-cell' },
    { key: 'postal_code', label: 'Postal Code', className: 'w-[100px] min-w-[100px] max-w-[100px] hidden xl:table-cell' },
  ];

  return (
    <ModulePage title="Staff Management" desc="Manage teachers, administrators, and support staff across the institution." actions={
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
        <button onClick={handleExportFiltered} className="flex items-center justify-center gap-1.5 px-3 py-3 sm:py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all min-h-[44px] sm:min-h-0 w-full sm:w-auto"><Download size={14} /> Export CSV</button>
        <button onClick={() => setBulkOpen(true)} className="flex items-center justify-center gap-1.5 px-3 py-3 sm:py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all min-h-[44px] sm:min-h-0 w-full sm:w-auto"><Upload size={14} /> Bulk Import</button>
        <AddButton onClick={() => setModalOpen(true)} label="Add Staff" />
      </div>
    }>
      {/* Dashboard Statistics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4 animate-fadeIn">
        <KpiCard icon={Users} label="Total Staff" value={stats.total} color="#7C3AED" bg="#F3F0FF" />
        <KpiCard icon={GraduationCap} label="Teaching Staff" value={stats.teaching} color="#3B82F6" bg="#EFF6FF" />
        <KpiCard icon={Briefcase} label="Non-Teaching Staff" value={stats.nonTeaching} color="#10B981" bg="#ECFDF5" />
        <KpiCard icon={UserCheck} label="Active Staff" value={stats.active} color="#059669" bg="#ECFDF5" />
        <KpiCard icon={UserX} label="On Leave" value={stats.onLeave} color="#EF4444" bg="#FEF2F2" />
        <KpiCard icon={Building2} label="Departments" value={stats.depts} color="#F59E0B" bg="#FEF3C7" />
      </div>

      {/* Dashboard Insights — Attendance Trend & Department Distribution */}
      <DashboardInsights analytics={dashboardAnalytics.data?.data || dashboardAnalytics.data} loading={dashboardAnalytics.loading} onRetry={dashboardAnalytics.refetch} />

      {/* Advanced Filters Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 shadow-sm space-y-3 animate-fadeIn">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <Filter size={15} className="text-[#6D4CFF]" />
            <span>Advanced Filters</span>
          </div>
          <button onClick={handleClearFilters} className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors">
            <RotateCcw size={12} /> Clear Filters
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative col-span-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input aria-label="Search staff" type="text" placeholder="Search by Employee ID, Staff Name, Email, Phone..." value={filters.search} onChange={e => saveFilters({ ...filters, search: e.target.value })}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[#6D4CFF]/20 bg-white" />
          </div>
          <select aria-label="Filter by Role" value={filters.role} onChange={e => saveFilters({ ...filters, role: e.target.value })}
            className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[#6D4CFF]/20 bg-white">
            <option value="">All Roles</option>
            {['Principal', 'Vice Principal', 'Teacher', 'Subject Teacher', 'HOD', 'Coordinator', 'Accountant', 'Librarian', 'Receptionist', 'Driver', 'Security Guard', 'Sweeper', 'Nurse', 'Other'].map(r => (
              <option key={r} value={r.toLowerCase()}>{r}</option>
            ))}
          </select>
          <select aria-label="Filter by Department" value={filters.department} onChange={e => saveFilters({ ...filters, department: e.target.value })}
            className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[#6D4CFF]/20 bg-white">
            <option value="">All Departments</option>
            {['Academics', 'Administration', 'Finance', 'Library', 'Transport', 'Security', 'Housekeeping', 'Medical'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <input aria-label="Filter by Designation" type="text" placeholder="Designation Filter" value={filters.designation} onChange={e => saveFilters({ ...filters, designation: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[#6D4CFF]/20 bg-white" />
          <select aria-label="Filter by Employment Type" value={filters.employment_type} onChange={e => saveFilters({ ...filters, employment_type: e.target.value })}
            className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[#6D4CFF]/20 bg-white">
            <option value="">All Employment Types</option>
            <option value="Full-time">Full Time</option>
            <option value="Part-time">Part Time</option>
            <option value="Contract">Contract</option>
          </select>
          <select aria-label="Filter by Status" value={filters.status} onChange={e => saveFilters({ ...filters, status: e.target.value })}
            className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[#6D4CFF]/20 bg-white">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on leave">On Leave</option>
          </select>
          <select aria-label="Filter by Gender" value={filters.gender} onChange={e => saveFilters({ ...filters, gender: e.target.value })}
            className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[#6D4CFF]/20 bg-white">
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input aria-label="Joining Date Filter" type="date" value={filters.joining_date} onChange={e => saveFilters({ ...filters, joining_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[#6D4CFF]/20 bg-white text-gray-500" />
          <input aria-label="Experience Filter" type="number" min="0" placeholder="Experience Filter (Min Years)" value={filters.experience} onChange={e => saveFilters({ ...filters, experience: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[#6D4CFF]/20 bg-white" />
        </div>
      </div>

      {/* Staff Table & Mobile Cards */}
      {staffList?.loading ? (
        <LoadingSkeleton rows={5} cols={columns.length} />
      ) : staffList?.error ? (
        <ErrorState message={staffList?.error} onRetry={staffList?.refetch} />
      ) : sortedStaff.length === 0 ? (
        <EmptyState message="No staff found matching current filters." />
      ) : (
        <div className="space-y-4 animate-fadeIn">
          {/* Desktop Table view */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="min-w-[1800px] w-full border-collapse text-left text-xs text-gray-500">
              <thead className="bg-white text-gray-700 font-semibold uppercase tracking-wider text-[10px] border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-center sticky top-0 bg-white z-20 w-[50px] min-w-[50px] max-w-[50px]">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-[#6D4CFF] focus:ring-[#6D4CFF] cursor-pointer"
                      checked={paginatedStaff.length > 0 && paginatedStaff.every(s => selectedIds.has(s.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(prev => {
                            const next = new Set(prev);
                            paginatedStaff.forEach(s => next.add(s.id));
                            return next;
                          });
                        } else {
                          setSelectedIds(prev => {
                            const next = new Set(prev);
                            paginatedStaff.forEach(s => next.delete(s.id));
                            return next;
                          });
                        }
                      }}
                    />
                  </th>
                  {columns.map(col => (
                    <th key={col.key} onClick={() => handleSort(col.key)} className={`px-4 py-3 cursor-pointer select-none hover:bg-gray-100 transition-colors whitespace-nowrap sticky top-0 bg-white z-10 ${col.key === 'full_name' ? 'left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-gray-100' : ''} ${col.className || ''}`}>
                      <div className="flex items-center gap-1">
                        <span>{col.label}</span>
                        <span className="text-gray-400 text-[9px]">{sortField === col.key ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center sticky top-0 bg-white z-10 w-[120px] min-w-[120px] max-w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedStaff.map((row: any, i: number) => (
                  <tr key={row.id || i} className="hover:bg-purple-50/20 transition-all group">
                    <td className="px-4 py-3 text-center w-[50px] min-w-[50px] max-w-[50px]">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#6D4CFF] focus:ring-[#6D4CFF] cursor-pointer"
                        checked={selectedIds.has(row.id)}
                        onChange={(e) => {
                          setSelectedIds(prev => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(row.id);
                            else next.delete(row.id);
                            return next;
                          });
                        }}
                      />
                    </td>
                    {/* Employee ID */}
                    <td className="px-4 py-3 whitespace-nowrap w-[120px] min-w-[120px] max-w-[120px] font-medium text-gray-900">{row.staff_unique_id || row.staff_unique_id || '—'}</td>
                    {/* Full Name (sticky left, click to drawer) */}
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)] border-r border-gray-100 group-hover:bg-purple-50/50 transition-colors w-[180px] min-w-[180px] max-w-[180px]">
                      <button onClick={() => { setSelectedStaff(row); setViewOpen(true); }} className="hover:text-[#6D4CFF] text-left hover:underline">{row.full_name}</button>
                    </td>
                    {/* Role Badge */}
                    <td className="px-4 py-3 whitespace-nowrap w-[120px] min-w-[120px] max-w-[120px]">
                      <Link href={`/management/staff/${row.id}`}>
                        <Badge className={`text-[10px] font-semibold capitalize cursor-pointer hover:opacity-85 transition-opacity ${getRoleBadgeStyle(row.designation || row.role)}`}>
                          {row.designation || row.role || 'staff'}
                        </Badge>
                      </Link>
                    </td>
                    {/* Department */}
                    <td className="px-4 py-3 whitespace-nowrap w-[120px] min-w-[120px] max-w-[120px] capitalize">{row.department || '—'}</td>
                    {/* Designation */}
                    <td className="px-4 py-3 whitespace-nowrap w-[130px] min-w-[130px] max-w-[130px] capitalize">{row.designation || '—'}</td>
                    {/* Phone */}
                    <td className="px-4 py-3 whitespace-nowrap w-[120px] min-w-[120px] max-w-[120px]">{row.phone || '—'}</td>
                    {/* Email */}
                    <td className="px-4 py-3 font-mono text-[10px] hidden xl:table-cell w-[200px] min-w-[200px] max-w-[200px] truncate">{row.email || '—'}</td>
                    {/* Qualification */}
                    <td className="px-4 py-3 hidden lg:table-cell w-[150px] min-w-[150px] max-w-[150px] truncate">{row.qualification || '—'}</td>
                    {/* Experience */}
                    <td className="px-4 py-3 hidden xl:table-cell w-[100px] min-w-[100px] max-w-[100px]">{row.experience_years !== undefined ? `${row.experience_years} Years` : '—'}</td>
                    {/* Employment Type */}
                    <td className="px-4 py-3 hidden xl:table-cell w-[130px] min-w-[130px] max-w-[130px] capitalize">{row.employment_type || '—'}</td>
                    {/* Assigned Classes */}
                    <td className="px-4 py-3 hidden lg:table-cell w-[150px] min-w-[150px] max-w-[150px] truncate">
                      {Array.isArray(row.assigned_classes) && row.assigned_classes.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[140px]">{row.assigned_classes.map((c: string, idx: number) => <span key={idx} className="bg-purple-50 text-purple-600 text-[9px] px-1 py-0.5 rounded font-medium">{c}</span>)}</div>
                      ) : '—'}
                    </td>
                    {/* Assigned Subjects */}
                    <td className="px-4 py-3 hidden lg:table-cell w-[150px] min-w-[150px] max-w-[150px] truncate">
                      {Array.isArray(row.assigned_subjects) && row.assigned_subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[140px]">{row.assigned_subjects.map((sub: string, idx: number) => <span key={idx} className="bg-blue-50 text-blue-600 text-[9px] px-1 py-0.5 rounded font-medium">{sub}</span>)}</div>
                      ) : '—'}
                    </td>
                    {/* Status Badge */}
                    <td className="px-4 py-3 whitespace-nowrap w-[100px] min-w-[100px] max-w-[100px]">
                      <Badge variant={row.status === 'active' ? 'success' : row.status === 'on leave' || row.status === 'leave' ? 'warning' : 'default'} className="text-[10px] capitalize">{row.status || 'active'}</Badge>
                    </td>
                    {/* Address (Laptop hidden) */}
                    <td className="px-4 py-3 hidden xl:table-cell w-[180px] min-w-[180px] max-w-[180px] truncate">{row.address || '—'}</td>
                    {/* Salary (Laptop hidden) */}
                    <td className="px-4 py-3 hidden xl:table-cell w-[100px] min-w-[100px] max-w-[100px] font-medium">{row.salary ? `₹${Number(row.salary).toLocaleString()}` : '—'}</td>
                    {/* Postal Code (Laptop hidden) */}
                    <td className="px-4 py-3 hidden xl:table-cell w-[100px] min-w-[100px] max-w-[100px]">{row.postal_code || '—'}</td>
                    {/* Actions Menu Dropdown */}
                    <td className="px-4 py-3 text-center whitespace-nowrap w-[120px] min-w-[120px] max-w-[120px] relative">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpenId(actionMenuOpenId === row.id ? null : row.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <MoreVertical size={14} />
                        </button>
                        {actionMenuOpenId === row.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setActionMenuOpenId(null)} />
                            <div className="absolute right-4 mt-2 w-48 bg-white border border-gray-150 rounded-xl shadow-xl z-40 py-1 text-left animate-fadeIn">
                              <Link
                                href={`/management/staff/${row.id}`}
                                className="w-full px-3 py-2 hover:bg-purple-50 text-gray-750 hover:text-purple-700 flex items-center gap-2 font-semibold text-xs transition-colors"
                                onClick={() => setActionMenuOpenId(null)}
                              >
                                <LayoutDashboard size={12} className="text-gray-400" /> View Dashboard
                              </Link>
                              <Link
                                href={`/management/staff/${row.id}`}
                                className="w-full px-3 py-2 hover:bg-purple-50 text-gray-750 hover:text-purple-700 flex items-center gap-2 font-semibold text-xs transition-colors"
                                onClick={() => setActionMenuOpenId(null)}
                              >
                                <User size={12} className="text-gray-400" /> View Profile
                              </Link>
                              <Link
                                href={`/management/staff/${row.id}`}
                                className="w-full px-3 py-2 hover:bg-purple-50 text-gray-750 hover:text-purple-700 flex items-center gap-2 font-semibold text-xs transition-colors"
                                onClick={() => setActionMenuOpenId(null)}
                              >
                                <Layers size={12} className="text-gray-400" /> Assignments
                              </Link>
                              <Link
                                href={`/management/staff/${row.id}`}
                                className="w-full px-3 py-2 hover:bg-purple-50 text-gray-750 hover:text-purple-700 flex items-center gap-2 font-semibold text-xs transition-colors"
                                onClick={() => setActionMenuOpenId(null)}
                              >
                                <Shield size={12} className="text-gray-400" /> Permissions
                              </Link>
                              <Link
                                href={`/management/staff/${row.id}`}
                                className="w-full px-3 py-2 hover:bg-purple-50 text-gray-750 hover:text-purple-700 flex items-center gap-2 font-semibold text-xs transition-colors"
                                onClick={() => setActionMenuOpenId(null)}
                              >
                                <TrendingUp size={12} className="text-gray-400" /> Performance
                              </Link>
                              <Link
                                href={`/management/staff/${row.id}`}
                                className="w-full px-3 py-2 hover:bg-purple-50 text-gray-750 hover:text-purple-700 flex items-center gap-2 font-semibold text-xs transition-colors"
                                onClick={() => setActionMenuOpenId(null)}
                              >
                                <Calendar size={12} className="text-gray-400" /> Attendance
                              </Link>
                              <Link
                                href={`/management/staff/${row.id}`}
                                className="w-full px-3 py-2 hover:bg-purple-50 text-gray-750 hover:text-purple-700 flex items-center gap-2 font-semibold text-xs transition-colors"
                                onClick={() => setActionMenuOpenId(null)}
                              >
                                <FileText size={12} className="text-gray-400" /> Documents
                              </Link>
                              <button
                                onClick={() => { setActionMenuOpenId(null); handleResetPassword(row); }}
                                className="w-full px-3 py-2 hover:bg-purple-50 text-gray-750 hover:text-purple-700 flex items-center gap-2 font-semibold text-xs transition-colors"
                              >
                                <Key size={12} className="text-gray-400" /> Reset Password
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile responsive Cards list */}
          <div className="block md:hidden space-y-4">
            {paginatedStaff.map((row: any, i: number) => {
              const isExpanded = !!expandedCards[row.id || i];
              return (
                <div key={row.id || i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{row.full_name}</h4>
                      <p className="text-[10px] text-gray-400">Employee ID: {row.staff_unique_id || row.staff_unique_id || '—'}</p>
                    </div>
                    <Link href={`/management/staff/${row.id}`}>
                      <Badge className={`text-[9px] capitalize cursor-pointer hover:opacity-85 transition-opacity ${getRoleBadgeStyle(row.designation || row.role)}`}>
                        {row.designation || row.role || 'staff'}
                      </Badge>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-gray-400 block font-medium">Department</span><span className="font-semibold text-gray-800 capitalize">{row.department || '—'}</span></div>
                    <div><span className="text-gray-400 block font-medium">Phone</span><span className="font-semibold text-gray-800">{row.phone || '—'}</span></div>
                    <div><span className="text-gray-400 block font-medium">Status</span><Badge variant={row.status === 'active' ? 'success' : row.status === 'on leave' || row.status === 'leave' ? 'warning' : 'default'} className="mt-0.5 text-[9px] capitalize">{row.status || 'active'}</Badge></div>
                  </div>
                  {isExpanded && (
                    <div className="border-t pt-3 space-y-2.5 text-xs grid grid-cols-1 gap-2 animate-fadeIn">
                      <div><span className="text-gray-400 block font-medium">Designation</span><span className="font-semibold text-gray-800 capitalize">{row.designation || '—'}</span></div>
                      <div><span className="text-gray-400 block font-medium">Email</span><span className="font-semibold text-gray-800 font-mono">{row.email || '—'}</span></div>
                      <div><span className="text-gray-400 block font-medium">Qualification</span><span className="font-semibold text-gray-800">{row.qualification || '—'}</span></div>
                      <div><span className="text-gray-400 block font-medium">Experience</span><span className="font-semibold text-gray-800">{row.experience_years !== undefined ? `${row.experience_years} Years` : '—'}</span></div>
                      <div><span className="text-gray-400 block font-medium">Employment Type</span><span className="font-semibold text-gray-800 capitalize">{row.employment_type || '—'}</span></div>
                      <div><span className="text-gray-400 block font-medium">Assigned Classes</span><span className="font-semibold text-gray-800">{Array.isArray(row.assigned_classes) ? row.assigned_classes.join(', ') : '—'}</span></div>
                      <div><span className="text-gray-400 block font-medium">Assigned Subjects</span><span className="font-semibold text-gray-800">{Array.isArray(row.assigned_subjects) ? row.assigned_subjects.join(', ') : '—'}</span></div>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t pt-2 mt-2 gap-2 relative">
                    <button onClick={() => setExpandedCards(prev => ({ ...prev, [row.id || i]: !prev[row.id || i] }))} className="flex items-center justify-center gap-1 text-xs font-bold text-[#6D4CFF] hover:text-[#5b3ee0] min-h-[44px] px-2">
                      {isExpanded ? 'View Less' : 'View More'}
                    </button>
                    
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/management/staff/${row.id}`}
                        className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-100 min-h-[44px] flex items-center justify-center"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => setActionMenuOpenId(actionMenuOpenId === row.id ? null : row.id)}
                        className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 min-h-[44px] flex items-center gap-1"
                      >
                        Actions <ChevronDown size={12} />
                      </button>
                    </div>

                    {actionMenuOpenId === row.id && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setActionMenuOpenId(null)} />
                        <div className="absolute right-0 bottom-12 w-48 bg-white border border-gray-150 rounded-xl shadow-xl z-40 py-1 text-left animate-fadeIn">
                          <Link
                            href={`/management/staff/${row.id}`}
                            className="w-full px-4 py-2 hover:bg-purple-50 text-gray-750 hover:text-purple-700 flex items-center gap-2 font-semibold text-xs"
                            onClick={() => setActionMenuOpenId(null)}
                          >
                            <LayoutDashboard size={12} className="text-gray-400" /> View Dashboard
                          </Link>
                          <Link
                            href={`/management/staff/${row.id}`}
                            className="w-full px-4 py-2 hover:bg-purple-50 text-gray-750 hover:text-purple-700 flex items-center gap-2 font-semibold text-xs"
                            onClick={() => setActionMenuOpenId(null)}
                          >
                            <User size={12} className="text-gray-400" /> View Profile
                          </Link>
                          <Link
                            href={`/management/staff/${row.id}`}
                            className="w-full px-4 py-2 hover:bg-purple-50 text-gray-750 hover:text-purple-700 flex items-center gap-2 font-semibold text-xs"
                            onClick={() => setActionMenuOpenId(null)}
                          >
                            <Layers size={12} className="text-gray-450" /> Assignments
                          </Link>
                          <Link
                            href={`/management/staff/${row.id}`}
                            className="w-full px-4 py-2 hover:bg-purple-50 text-gray-750 hover:text-purple-700 flex items-center gap-2 font-semibold text-xs"
                            onClick={() => setActionMenuOpenId(null)}
                          >
                            <Shield size={12} className="text-gray-450" /> Permissions
                          </Link>
                          <Link
                            href={`/management/staff/${row.id}`}
                            className="w-full px-4 py-2 hover:bg-purple-50 text-gray-750 hover:text-purple-700 flex items-center gap-2 font-semibold text-xs"
                            onClick={() => setActionMenuOpenId(null)}
                          >
                            <TrendingUp size={12} className="text-gray-450" /> Performance
                          </Link>
                          <Link
                            href={`/management/staff/${row.id}`}
                            className="w-full px-4 py-2 hover:bg-purple-50 text-gray-750 hover:text-purple-700 flex items-center gap-2 font-semibold text-xs"
                            onClick={() => setActionMenuOpenId(null)}
                          >
                            <Calendar size={12} className="text-gray-450" /> Attendance
                          </Link>
                          <Link
                            href={`/management/staff/${row.id}`}
                            className="w-full px-4 py-2 hover:bg-purple-50 text-gray-750 hover:text-purple-700 flex items-center gap-2 font-semibold text-xs"
                            onClick={() => setActionMenuOpenId(null)}
                          >
                            <FileText size={12} className="text-gray-450" /> Documents
                          </Link>
                          <button
                            onClick={() => { setActionMenuOpenId(null); handleResetPassword(row); }}
                            className="w-full px-4 py-2 hover:bg-purple-50 text-gray-750 hover:text-purple-700 flex items-center gap-2 font-semibold text-xs"
                          >
                            <Key size={12} className="text-gray-450" /> Reset Password
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination component */}
          <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm text-xs text-gray-500 gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left w-full md:w-auto">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start font-semibold">
                <span>Show</span>
                <select aria-label="Select page size" value={pageSize} onChange={e => setPageSize(Number(e.target.value))}
                  className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none min-h-[36px] flex items-center">
                  {[10, 25, 50, 100].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                </select>
                <span>per page</span>
              </div>
              <div className="text-gray-400">
                Showing {Math.min(sortedStaff.length, (currentPage - 1) * pageSize + 1)} to {Math.min(sortedStaff.length, currentPage * pageSize)} of {sortedStaff.length} entries
              </div>
            </div>
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
              <button aria-label="Previous page" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-1 font-semibold min-h-[44px] justify-center flex-1 sm:flex-none">
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="font-semibold text-gray-700 px-2 text-center">Page {currentPage} of {totalPages}</span>
              <button aria-label="Next page" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-1 font-semibold min-h-[44px] justify-center flex-1 sm:flex-none">
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Details sliding drawer */}
      <AnimatePresence>
        {viewOpen && selectedStaff && (
          <StaffProfileDrawer
            staff={selectedStaff}
            open={viewOpen}
            onClose={() => { setViewOpen(false); setSelectedStaff(null); }}
            onAction={handleDrawerAction}
          />
        )}
      </AnimatePresence>

      {/* Add Staff Modal */}
      <CrudModal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Staff Member">
        <StaffForm onDone={() => { staffList?.refetch(); setModalOpen(false); }} onCreated={(creds) => {
          setNewCreds(p => ({ ...p, [creds.email]: creds }));
        }} />
      </CrudModal>

      {/* Edit Staff Modal */}
      <LargeCrudModal open={editOpen} onClose={() => { setEditOpen(false); setSelectedStaff(null); }} title="Edit Staff Member Information">
        {selectedStaff && (
          <EditStaffForm staff={selectedStaff} onDone={() => {
            staffList?.refetch();
            setEditOpen(false);
            setSelectedStaff(null);
          }} />
        )}
      </LargeCrudModal>

      {/* Assign Class / Subject Modal */}
      <CrudModal open={assignOpen} onClose={() => { setAssignOpen(false); setSelectedStaff(null); }} title="Assign Class & Subject">
        {selectedStaff && (
          <AssignClassForm
            staff={selectedStaff}
            classesList={classesList}
            subjectsList={subjectsList}
            onDone={() => {
              staffList?.refetch();
              setAssignOpen(false);
              setSelectedStaff(null);
            }}
          />
        )}
      </CrudModal>

      {/* Bulk Import Wizard Modal */}
      <AnimatePresence>
        {bulkOpen && (
          <StaffBulkImportWizard
            onClose={() => setBulkOpen(false)}
            onDone={() => staffList?.refetch()}
            onCreated={(creds) => setNewCreds(p => ({ ...p, ...creds }))}
          />
        )}
      </AnimatePresence>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl py-3 px-6 flex items-center gap-6 z-50"
          >
            <span className="text-xs font-bold text-gray-700">
              {selectedIds.size} staff member{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-all"
              >
                <Download size={13} /> Export Selected
              </button>
              <button
                onClick={() => setBroadcastOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6D4CFF] text-white hover:bg-[#5b3ee0] text-xs font-semibold transition-all"
              >
                <Mail size={13} /> Broadcast Message
              </button>
              <select
                aria-label="Bulk Status Update"
                onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                value=""
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="" disabled>Change Status</option>
                <option value="active">Activate</option>
                <option value="inactive">Deactivate</option>
                <option value="on leave">Mark On Leave</option>
              </select>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors ml-2"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Broadcast Message Modal */}
      <CrudModal open={broadcastOpen} onClose={() => { if (!bulkBroadcasting) setBroadcastOpen(false); }} title={`Broadcast Message to ${selectedIds.size} Staff Members`}>
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <p className="font-bold text-purple-900">Broadcasting announcement</p>
            <p className="text-purple-600 mt-0.5">Your message will be sent to each of the {selectedIds.size} selected staff members as a direct message in real-time.</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Message Content <span className="text-red-500">*</span></label>
            <textarea
              value={broadcastMessage}
              onChange={e => setBroadcastMessage(e.target.value)}
              rows={4}
              placeholder="Type your message here..."
              disabled={bulkBroadcasting}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#6D4CFF] focus:ring-1 focus:ring-[#6D4CFF]/20"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setBroadcastOpen(false)}
              disabled={bulkBroadcasting}
              className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleBroadcastMessage}
              disabled={bulkBroadcasting || !broadcastMessage.trim()}
              className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              {bulkBroadcasting && <Loader2 size={13} className="animate-spin" />}
              {bulkBroadcasting ? 'Sending...' : 'Send Broadcast'}
            </button>
          </div>
        </div>
      </CrudModal>
    </ModulePage>
  );
}
