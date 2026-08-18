'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Users, GraduationCap, Briefcase, UserCog, HeartHandshake, Shield,
  Search, Plus, Download, Eye, RefreshCw, Trash2, Ban, CheckCircle2,
  X, Mail, Phone, Building2, CalendarDays, KeyRound, Pencil, ChevronRight, ChevronLeft, ChevronFirst, ChevronLast,
  LayoutDashboard, Filter, UserPlus,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { userApi, organisationApi } from '../../lib/dataService';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell,
} from 'recharts';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', accent: '#A855F7' };

const TABS = [
  { key: 'all', label: 'Overview', icon: LayoutDashboard },
  { key: 'student', label: 'Student', icon: GraduationCap },
  { key: 'staff', label: 'Staff', icon: Briefcase },
  { key: 'management', label: 'Management', icon: UserCog },
  { key: 'parent', label: 'Parent', icon: HeartHandshake },
  { key: 'company-admin', label: 'Company Admin', icon: Shield },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const ROLE_LABEL: Record<string, string> = {
  student: 'Student', staff: 'Staff', teacher: 'Teacher', management: 'Management',
  admin: 'Admin', supervisor: 'Supervisor', owner: 'Owner', parent: 'Parent',
};

const GROUP_ROLES: Record<string, string[]> = {
  student: ['student'],
  staff: ['staff', 'teacher'],
  management: ['management', 'admin', 'supervisor', 'owner'],
  parent: ['parent'],
};

const statusVariant = (s?: string | null) =>
  (s === 'active' ? 'success' : s === 'blocked' ? 'danger' : s === 'inactive' ? 'warning' : 'default') as 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

const EMPTY_USERS: any[] = [];
const EMPTY_CA: any[] = [];
const EMPTY_ORGS: any[] = [];

const initials = (name: string) => (name || '—').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const inputCls = 'w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[#6D4CFF]/20 transition-all';

function downloadCSV(filename: string, rows: Record<string, any>[], columns: { key: string; label: string }[]) {
  const esc = (v: any) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [columns.map(c => c.label).join(','), ...rows.map(r => columns.map(c => esc(r[c.key])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-sm font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><X size={15} /></button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function UnifiedUserManagement() {
  const [tab, setTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');
  const [caDesignation, setCaDesignation] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [showAddUser, setShowAddUser] = useState(false);
  const [showCompanyAdminModal, setShowCompanyAdminModal] = useState(false);
  const [editingCompanyAdmin, setEditingCompanyAdmin] = useState<any>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ kind: 'user' | 'companyAdmin'; id: string; name: string } | null>(null);

  const stats = useApi<any>(() => userApi.stats());
  const usersRes = useApi<any>(() => userApi.list());
  const companyAdminsRes = useApi<any>(() => userApi.companyAdmins());
  const orgs = useApi<any>(() => organisationApi.list());

  const allUsers: any[] = usersRes.data?.users || EMPTY_USERS;
  const companyAdmins: any[] = companyAdminsRes.data?.companyAdmins || EMPTY_CA;
  const s = stats.data || {};
  const orgList: any[] = orgs.data?.organisations || EMPTY_ORGS;

  const filteredUsers = useMemo(() => {
    let rows: any[] = allUsers;
    if (tab !== 'all' && tab !== 'company-admin') {
      const roles = GROUP_ROLES[tab] || [];
      rows = rows.filter(u => roles.includes(u.role));
    }
    if (roleFilter !== 'all') rows = rows.filter(u => u.role === roleFilter);
    if (statusFilter !== 'all') rows = rows.filter(u => u.status === statusFilter);
    if (orgFilter !== 'all') rows = rows.filter(u => (u.organisation_name || 'Unassigned') === orgFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(u =>
        [u.name, u.email, u.phone, u.organisation_name, u.organisation_code]
          .join(' ').toLowerCase().includes(q)
      );
    }
    return rows;
  }, [allUsers, tab, roleFilter, statusFilter, orgFilter, search]);

  const filteredCompanyAdmins = useMemo(() => {
    let rows: any[] = companyAdmins;
    if (caDesignation !== 'all') rows = rows.filter(ca => (ca.designation || '') === caDesignation);
    if (statusFilter !== 'all') rows = rows.filter(ca => ca.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(ca => [ca.full_name, ca.email, ca.phone].join(' ').toLowerCase().includes(q));
    }
    return rows;
  }, [companyAdmins, caDesignation, statusFilter, search]);

  // Role options relevant to the active tab (All/Overview shows every role)
  const userRoles = useMemo(() => {
    const set = new Set<string>();
    let rows = allUsers;
    if (tab !== 'all') rows = rows.filter(u => (GROUP_ROLES[tab] || []).includes(u.role));
    rows.forEach(u => set.add(u.role));
    return [...set].sort();
  }, [allUsers, tab]);

  const orgOptions = useMemo(() => {
    const set = new Set<string>();
    allUsers.forEach(u => { if (u.organisation_name) set.add(u.organisation_name); });
    return [...set].sort();
  }, [allUsers]);

  const caDesignations = useMemo(() => {
    const set = new Set<string>();
    companyAdmins.forEach(ca => { if (ca.designation) set.add(ca.designation); });
    return [...set].sort();
  }, [companyAdmins]);

  // Overview charts
  const portalDist = useMemo(() => {
    const countByRole = (roles: string[]) => allUsers.filter(u => roles.includes(u.role)).length;
    return [
      { name: 'Students', value: countByRole(['student']), color: COLORS.success },
      { name: 'Staff', value: countByRole(['staff', 'teacher']), color: COLORS.primary },
      { name: 'Management', value: countByRole(['management', 'supervisor', 'owner', 'admin']), color: COLORS.info },
      { name: 'Parents', value: countByRole(['parent']), color: COLORS.accent },
      { name: 'Company Admins', value: Number(s.companyAdmins ?? 0), color: COLORS.danger },
    ];
  }, [allUsers, s.companyAdmins]);

  const statusDist = useMemo(() => [
    { name: 'Active', value: Number(s.active ?? 0), color: COLORS.success },
    { name: 'Blocked / Inactive', value: Number(s.blocked ?? 0), color: COLORS.danger },
  ], [s.active, s.blocked]);

  const topOrgs = useMemo(() => {
    const m: Record<string, number> = {};
    allUsers.forEach(u => {
      const n = u.organisation_name || 'Unassigned';
      m[n] = (m[n] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [allUsers]);

  // Overview: portal snapshot + platform stats
  const portalSnapshot = useMemo(() => [
    { tab: 'student', label: 'Students', icon: GraduationCap, value: Number(s.students ?? 0), color: COLORS.success, bg: '#F0FDF4' },
    { tab: 'staff', label: 'Staff', icon: Briefcase, value: Number(s.staff ?? 0), color: COLORS.primary, bg: '#F3F0FF' },
    { tab: 'management', label: 'Management', icon: UserCog, value: (Number(s.management) || 0) + (Number(s.admins) || 0), color: COLORS.info, bg: '#EFF6FF' },
    { tab: 'parent', label: 'Parents', icon: HeartHandshake, value: Number(s.parents ?? 0), color: COLORS.warning, bg: '#FFFBEB' },
    { tab: 'company-admin', label: 'Company Admins', icon: Shield, value: Number(s.companyAdmins ?? 0), color: COLORS.accent, bg: '#FAF5FF' },
  ], [s.students, s.staff, s.management, s.admins, s.parents, s.companyAdmins]);

  const verifiedOrgs = useMemo(
    () => orgList.filter(o => ['verified', 'active', 'approved'].includes(o.status)).length,
    [orgList]
  );

  const totalN = Number(s.total) || 1;
  const managementAccounts = (Number(s.management) || 0) + (Number(s.admins) || 0);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  const isCompanyAdminTab = tab === 'company-admin';

  const refetchAll = () => { stats.refetch(); usersRes.refetch(); companyAdminsRes.refetch(); };

  const changeTab = (t: TabKey) => {
    setTab(t); setPage(1); setSearch(''); setRoleFilter('all'); setOrgFilter('all'); setCaDesignation('all');
  };

  const handleExport = () => {
    if (isCompanyAdminTab) {
      downloadCSV('company-admins.csv', filteredCompanyAdmins, [
        { key: 'full_name', label: 'Name' }, { key: 'designation', label: 'Designation' },
        { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' },
        { key: 'status', label: 'Status' }, { key: 'created_at', label: 'Created' },
      ]);
    } else {
      downloadCSV('users.csv', filteredUsers, [
        { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' },
        { key: 'role', label: 'Role' }, { key: 'organisation_name', label: 'Organization' },
        { key: 'status', label: 'Status' }, { key: 'last_login', label: 'Last Login' },
      ]);
    }
    toast.success('CSV exported');
  };

  const handleBlock = async (u: any, block: boolean) => {
    const res = await userApi.updateStatus(u.id, block ? 'blocked' : 'active');
    if (res.success) { toast.success(`${u.name} ${block ? 'blocked' : 'activated'}`); refetchAll(); }
    else toast.error(res.error || 'Action failed');
  };

  const handleCaStatus = async (ca: any, block: boolean) => {
    const res = await userApi.updateCompanyAdmin(ca.id, { status: block ? 'blocked' : 'active' });
    if (res.success) { toast.success(`${ca.full_name} ${block ? 'blocked' : 'activated'}`); refetchAll(); }
    else toast.error(res.error || 'Action failed');
  };

  const handleDelete = async () => {
    if (!confirmTarget) return;
    const res = confirmTarget.kind === 'user'
      ? await userApi.remove(confirmTarget.id)
      : await userApi.deleteCompanyAdmin(confirmTarget.id);
    if (res.success) { toast.success(`${confirmTarget.name} deleted`); refetchAll(); }
    else toast.error(res.error || 'Delete failed');
    setConfirmTarget(null);
  };

  const roleOptions = (tab === 'student' ? ['student'] : tab === 'staff' ? ['staff', 'teacher'] : tab === 'management' ? ['management', 'admin', 'supervisor', 'owner'] : tab === 'parent' ? ['parent'] : ['student', 'staff', 'teacher', 'management', 'admin', 'supervisor', 'owner', 'parent']);

  const [addUserForm, setAddUserForm] = useState({ full_name: '', email: '', phone: '', role: 'student', organisation_id: '', status: 'active' });
  const [savingUser, setSavingUser] = useState(false);

  const submitAddUser = async () => {
    if (!addUserForm.full_name.trim() || !addUserForm.email.trim() || !addUserForm.organisation_id) {
      toast.error('Name, email and organization are required'); return;
    }
    setSavingUser(true);
    const res = await userApi.create(addUserForm);
    setSavingUser(false);
    if (res.success) {
      toast.success(`User created — default password: ${res.data?.user?.password || '(see response)'}`);
      setShowAddUser(false);
      setAddUserForm({ full_name: '', email: '', phone: '', role: 'student', organisation_id: '', status: 'active' });
      refetchAll();
    } else toast.error(res.error || 'Failed to create user');
  };

  const [caForm, setCaForm] = useState({ full_name: '', email: '', phone: '', designation: '', status: 'active' });
  const [savingCa, setSavingCa] = useState(false);

  const openCaModal = (rec: any | null) => {
    setEditingCompanyAdmin(rec);
    setCaForm(rec
      ? { full_name: rec.full_name || '', email: rec.email || '', phone: rec.phone || '', designation: rec.designation || '', status: rec.status || 'active' }
      : { full_name: '', email: '', phone: '', designation: '', status: 'active' });
    setShowCompanyAdminModal(true);
  };

  const submitCompanyAdmin = async () => {
    if (!caForm.full_name.trim() || !caForm.email.trim()) {
      toast.error('Name and email are required'); return;
    }
    setSavingCa(true);
    const res = editingCompanyAdmin
      ? await userApi.updateCompanyAdmin(editingCompanyAdmin.id, caForm)
      : await userApi.createCompanyAdmin(caForm);
    setSavingCa(false);
    if (res.success) {
      toast.success(editingCompanyAdmin ? 'Company admin updated' : 'Company admin created');
      setShowCompanyAdminModal(false);
      setEditingCompanyAdmin(null);
      refetchAll();
    } else toast.error(res.error || 'Failed to save company admin');
  };

  const kpis = [
    { icon: Users, label: 'Total Users', value: String(s.total ?? 0), sub: `Across ${Object.keys(GROUP_ROLES).length} portals`, color: COLORS.primary, bg: '#F3F0FF' },
    { icon: CheckCircle2, label: 'Active Users', value: String(s.active ?? 0), sub: `${(Number(s.management) || 0) + (Number(s.admins) || 0)} management accounts`, color: COLORS.success, bg: '#F0FDF4' },
    { icon: Ban, label: 'Blocked / Inactive', value: String(s.blocked ?? 0), sub: 'Require review', color: COLORS.danger, bg: '#FEF2F2' },
    { icon: Shield, label: 'Company Admins', value: String(s.companyAdmins ?? 0), sub: 'Platform-level staff', color: COLORS.accent, bg: '#FAF5FF' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6D4CFF]/10 flex items-center justify-center text-[#6D4CFF]"><Users size={20} /></div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">User Management</h2>
            <p className="text-xs text-gray-500">Manage students, staff, management, parents and company admins</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { refetchAll(); }} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-all"><RefreshCw size={14} /> Refresh</button>
          {tab !== 'all' && (
            <>
              <button onClick={handleExport} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-all"><Download size={14} /> Export</button>
              {isCompanyAdminTab
                ? <button onClick={() => openCaModal(null)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.97] transition-all"><Plus size={14} /> Add Company Admin</button>
                : <button onClick={() => { setAddUserForm(f => ({ ...f, role: roleOptions[0] })); setShowAddUser(true); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.97] transition-all"><Plus size={14} /> Add User</button>}
            </>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5 mt-5">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: k.bg, color: k.color }}><Icon size={16} /></div>
                <div className="min-w-0">
                  <div className="text-lg font-extrabold text-gray-900 leading-tight">{k.value}</div>
                  <div className="text-[10px] text-gray-500 truncate">{k.label}</div>
                  <div className="text-[9px] text-gray-400 truncate">{k.sub}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Sub-navbar */}
      <div className="flex items-center gap-1.5 flex-wrap p-1.5 rounded-2xl bg-gray-100/70 border border-gray-200 mb-5">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => changeTab(t.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${active ? 'bg-white text-[#6D4CFF] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Overview charts */}
      {tab === 'all' && (
        <div className="mb-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            {/* Users by Portal */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className="lg:col-span-2">
              <Card className="p-5 h-full relative overflow-hidden border-t-[3px] border-t-[#6D4CFF]/60">
                <div className="absolute -top-20 -right-20 w-56 h-56 bg-[#6D4CFF]/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Users by Portal</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Distribution across all platforms</p>
                  </div>
                  <Badge variant="purple" className="text-[9px]">{s.total ?? 0} total</Badge>
                </div>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={portalDist} margin={{ top: 22, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        {portalDist.map((d, i) => (
                          <linearGradient key={i} id={`pbar${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={d.color} stopOpacity={0.95} />
                            <stop offset="100%" stopColor={d.color} stopOpacity={0.35} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval={0} />
                      <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }} cursor={{ fill: '#F8FAFC' }} />
                      <Bar dataKey="value" name="Users" radius={[8, 8, 0, 0]} animationDuration={900} label={{ position: 'top', fontSize: 10, fontWeight: 700, fill: '#64748B' }}>
                        {portalDist.map((d, i) => <Cell key={i} fill={`url(#pbar${i})`} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* User Status */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}>
              <Card className="p-5 h-full relative overflow-hidden border-t-[3px] border-t-emerald-400/60">
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />
                <h3 className="text-sm font-bold text-gray-900">User Status</h3>
                <p className="text-[10px] text-gray-400 mt-0.5 mb-2">Active vs blocked / inactive</p>
                <div className="relative h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie data={statusDist} cx="50%" cy="50%" innerRadius={54} outerRadius={78} paddingAngle={4} dataKey="value" startAngle={90} endAngle={-270} animationDuration={900}>
                        {statusDist.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }} />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-extrabold text-gray-900 leading-none">{s.total ?? 0}</span>
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider mt-1">Total Users</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {statusDist.map((d, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50">
                      <span className="flex items-center gap-1.5 text-[10px] text-gray-600">
                        <span className="w-2 h-2 rounded-full" style={{ background: d.color }} /> {d.name}
                      </span>
                      <span className="text-xs font-bold text-gray-800">{d.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Top Organizations */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.16, ease: 'easeOut' }}>
            <Card className="p-5 relative overflow-hidden border-t-[3px] border-t-[#3B82F6]/60">
              <div className="absolute -top-24 right-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Top Organizations by Users</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Where your users belong</p>
                </div>
                <Badge variant="info" className="text-[9px]">{orgOptions.length} organizations</Badge>
              </div>
              {topOrgs.length === 0 ? (
                <EmptyState message="No organization data yet" />
              ) : (
                <div className="space-y-4">
                  {topOrgs.map((o, i) => {
                    const pct = s.total ? Math.round((o.value / Number(s.total)) * 100) : 0;
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="flex items-center gap-2 text-[11px] font-medium text-gray-700 min-w-0">
                            <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 ${i === 0 ? 'bg-gradient-to-br from-[#F59E0B] to-[#EF4444]' : i === 1 ? 'bg-gradient-to-br from-[#94A3B8] to-[#64748B]' : i === 2 ? 'bg-gradient-to-br from-[#D97706] to-[#B45309]' : 'bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6]'}`}>{i + 1}</span>
                            <span className="truncate">{o.name}</span>
                          </span>
                          <span className="text-[10px] font-semibold text-gray-400 flex-shrink-0">{o.value} users · {pct}%</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#A855F7]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Portal Snapshot */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.24, ease: 'easeOut' }} className="mb-5">
            <Card className="p-5 relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Portal Snapshot</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Live counts per portal — click to open the tab</p>
                </div>
                <Badge variant="success" className="text-[9px]">{s.active ?? 0} active</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {portalSnapshot.map(p => {
                  const Icon = p.icon;
                  const pct = Math.round((p.value / totalN) * 100);
                  return (
                    <button key={p.tab} onClick={() => changeTab(p.tab as TabKey)}
                      className="group rounded-2xl p-4 text-left border border-gray-100 hover:border-[#6D4CFF]/40 hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: p.bg, color: p.color }}><Icon size={16} /></div>
                        <span className="text-lg font-extrabold text-gray-900">{p.value}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-gray-600 mt-2">{p.label}</div>
                      <div className="text-[9px] text-gray-400 mb-1.5">{pct}% of users</div>
                      <Progress value={pct} className="h-1" />
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Account Health */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.3, ease: 'easeOut' }}>
              <Card className="p-5 h-full">
                <h3 className="text-sm font-bold mb-4">Account Health</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Active Users', value: s.active ?? 0, pct: s.total ? Math.round((Number(s.active) / Number(s.total)) * 100) : 0, color: COLORS.success },
                    { label: 'Blocked / Inactive', value: s.blocked ?? 0, pct: s.total ? Math.round((Number(s.blocked) / Number(s.total)) * 100) : 0, color: COLORS.danger },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-medium text-gray-600">{item.label}</span>
                        <span className="text-xs font-bold" style={{ color: item.color }}>{item.value} <span className="text-[9px] text-gray-400 font-medium">({item.pct}%)</span></span>
                      </div>
                      <Progress value={item.pct} className="h-2" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                  <p className="text-[10px] text-emerald-700 leading-snug">All portals are healthy — no suspended organizations detected.</p>
                </div>
              </Card>
            </motion.div>

            {/* Platform Stats */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.36, ease: 'easeOut' }}>
              <Card className="p-5 h-full">
                <h3 className="text-sm font-bold mb-4">Platform Stats</h3>
                <div className="space-y-2.5">
                  {[
                    { icon: Building2, label: 'Total Organizations', value: String(orgList.length), sub: `${verifiedOrgs} verified`, color: COLORS.primary },
                    { icon: Shield, label: 'Roles Defined', value: String(userRoles.length), sub: `${Object.keys(ROLE_LABEL).length} available`, color: COLORS.success },
                    { icon: UserCog, label: 'Management Accounts', value: String(managementAccounts), sub: 'incl. school admins', color: COLORS.info },
                    { icon: KeyRound, label: 'Company Admins', value: String(s.companyAdmins ?? 0), sub: 'platform-level', color: COLORS.accent },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="flex items-center gap-2.5 text-[11px] font-medium text-gray-700 min-w-0">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}15`, color: item.color }}><Icon size={13} /></span>
                          <span className="truncate">{item.label}</span>
                        </span>
                        <span className="text-right flex-shrink-0">
                          <span className="block text-sm font-extrabold text-gray-900 leading-none">{item.value}</span>
                          <span className="block text-[9px] text-gray-400 mt-0.5">{item.sub}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.42, ease: 'easeOut' }}>
              <Card className="p-5 h-full">
                <h3 className="text-sm font-bold mb-4">Quick Actions</h3>
                <div className="space-y-2.5">
                  {[
                    { icon: UserPlus, label: 'Create New User', desc: 'Add a user to any portal', onClick: () => { setAddUserForm(f => ({ ...f, role: 'student' })); setShowAddUser(true); } },
                    { icon: Shield, label: 'Add Company Admin', desc: 'Register platform staff', onClick: () => openCaModal(null) },
                    { icon: Download, label: 'Export Report', desc: 'Download user directory CSV', onClick: handleExport },
                    { icon: RefreshCw, label: 'Refresh Data', desc: 'Sync latest counts & users', onClick: refetchAll },
                  ].map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <button key={i} onClick={action.onClick} className="flex items-center gap-3 w-full p-3 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F3F0FF] text-[#6D4CFF] flex-shrink-0"><Icon size={14} /></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold text-gray-700 truncate">{action.label}</div>
                          <div className="text-[9px] text-gray-400 truncate">{action.desc}</div>
                        </div>
                        <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      )}

      {/* Directory */}
      {tab !== 'all' && (
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 flex-1 min-w-[220px] px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
              <Search size={14} className="text-gray-400" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder={isCompanyAdminTab ? 'Search by name, email, phone...' : 'Search by name, email, phone, school, code...'}
                className="bg-transparent border-none outline-none text-xs flex-1" />
            </div>
            {isCompanyAdminTab ? (
              <select value={caDesignation} onChange={e => { setCaDesignation(e.target.value); setPage(1); }} className={inputCls + ' w-auto'}>
                <option value="all">All Designations</option>
                {caDesignations.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            ) : (
              <>
                <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className={inputCls + ' w-auto'}>
                  <option value="all">All Roles</option>
                  {userRoles.map(r => <option key={r} value={r} className="capitalize">{ROLE_LABEL[r] || r}</option>)}
                </select>
                <select value={orgFilter} onChange={e => { setOrgFilter(e.target.value); setPage(1); }} className={inputCls + ' w-auto max-w-[180px]'}>
                  <option value="all">All Organizations</option>
                  {orgOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </>
            )}
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className={inputCls + ' w-auto'}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="inactive">Inactive</option>
            </select>
            <span className="flex items-center gap-1 text-[11px] text-gray-400 whitespace-nowrap">
              <Filter size={12} />
              {isCompanyAdminTab ? filteredCompanyAdmins.length : filteredUsers.length} {isCompanyAdminTab ? 'company admins' : 'users'}
            </span>
          </div>
        </div>

        {isCompanyAdminTab ? (
          <>
            {companyAdminsRes.loading ? <div className="p-5"><LoadingSkeleton rows={4} cols={5} /></div>
              : companyAdminsRes.error ? <div className="p-5"><ErrorState message={companyAdminsRes.error} onRetry={() => companyAdminsRes.refetch()} /></div>
                : filteredCompanyAdmins.length === 0 ? <EmptyState message="No company admins match your filters" action={{ label: 'Add Company Admin', onClick: () => openCaModal(null) }} />
                  : (
                    <div className="overflow-x-auto">
                      <table className="data-table">
                        <thead><tr>
                          <th>Admin</th><th>Designation</th><th>Contact</th><th>Status</th><th>Created</th><th className="text-right">Actions</th>
                        </tr></thead>
                        <tbody>
                          {filteredCompanyAdmins.map((ca: any) => (
                            <tr key={ca.id}>
                              <td>
                                <div className="flex items-center gap-2.5">
                                  <Avatar className="w-8 h-8">
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#A855F7] to-[#6D4CFF] text-white text-[10px] font-bold rounded-full">{initials(ca.full_name)}</div>
                                  </Avatar>
                                  <div>
                                    <div className="text-xs font-semibold">{ca.full_name}</div>
                                    <div className="text-[10px] text-gray-400">{ca.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td><span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 font-medium">{ca.designation || '—'}</span></td>
                              <td className="text-xs text-gray-600">{ca.phone || '—'}</td>
                              <td><Badge variant={statusVariant(ca.status)} className="text-[9px] capitalize">{ca.status}</Badge></td>
                              <td className="text-[10px] text-gray-400">{fmtDate(ca.created_at)}</td>
                              <td className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => openCaModal(ca)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Pencil size={13} /></button>
                                  <button onClick={() => handleCaStatus(ca, ca.status === 'active')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#F59E0B]" title={ca.status === 'active' ? 'Block' : 'Activate'}>
                                    {ca.status === 'active' ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                                  </button>
                                  <button onClick={() => setConfirmTarget({ kind: 'companyAdmin', id: ca.id, name: ca.full_name })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#EF4444]"><Trash2 size={13} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
          </>
        ) : (
          <>
            {usersRes.loading ? <div className="p-5"><LoadingSkeleton rows={5} cols={6} /></div>
              : usersRes.error ? <div className="p-5"><ErrorState message={usersRes.error} onRetry={() => usersRes.refetch()} /></div>
                : filteredUsers.length === 0 ? <EmptyState message="No users match your filters" />
                  : (
                    <div className="overflow-x-auto">
                      <table className="data-table">
                        <thead><tr>
                          <th>User</th><th>Role</th><th>Organization</th><th>Status</th><th>Last Login</th><th className="text-right">Actions</th>
                        </tr></thead>
                        <tbody>
                          {paginatedUsers.map((u: any) => (
                            <tr key={u.id}>
                              <td>
                                <div className="flex items-center gap-2.5">
                                  <Avatar className="w-8 h-8">
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white text-[10px] font-bold rounded-full">{initials(u.name)}</div>
                                  </Avatar>
                                  <div>
                                    <div className="text-xs font-semibold">{u.name}</div>
                                    <div className="text-[10px] text-gray-400">{u.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td><span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium capitalize">{ROLE_LABEL[u.role] || u.role}</span></td>
                              <td className="text-xs text-gray-600 max-w-[180px]">
                                <div className="truncate">{u.organisation_name || '—'}</div>
                                {u.organisation_code && <div className="text-[9px] text-gray-400">{u.organisation_code}</div>}
                              </td>
                              <td><Badge variant={statusVariant(u.status)} className="text-[9px] capitalize">{u.status}</Badge></td>
                              <td className="text-[10px] text-gray-400">{fmtDate(u.last_login)}</td>
                              <td className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => setViewingUser(u)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Eye size={13} /></button>
                                  <button onClick={() => handleBlock(u, u.status === 'active')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#F59E0B]" title={u.status === 'active' ? 'Block' : 'Activate'}>
                                    {u.status === 'active' ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                                  </button>
                                  <button onClick={() => setConfirmTarget({ kind: 'user', id: u.id, name: u.name })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#EF4444]"><Trash2 size={13} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
            {filteredUsers.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span className="text-[11px] text-gray-400">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredUsers.length)} of {filteredUsers.length}</span>
                <div className="flex items-center gap-1">
                  <button disabled={page === 1} onClick={() => setPage(1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronFirst size={14} /></button>
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14} /></button>
                  <span className="text-xs font-medium px-3 py-1 rounded-lg bg-[#F3F0FF] text-[#6D4CFF]">{page} / {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14} /></button>
                  <button disabled={page === totalPages} onClick={() => setPage(totalPages)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLast size={14} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
      )}

      {/* Add User modal */}
      <Modal open={showAddUser} onClose={() => setShowAddUser(false)} title="Add User">
        <div className="space-y-3">
          <Field label="Full Name"><input value={addUserForm.full_name} onChange={e => setAddUserForm(f => ({ ...f, full_name: e.target.value }))} className={inputCls} placeholder="e.g. Rahul Sharma" /></Field>
          <Field label="Email"><input type="email" value={addUserForm.email} onChange={e => setAddUserForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="user@example.com" /></Field>
          <Field label="Phone"><input value={addUserForm.phone} onChange={e => setAddUserForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="Optional" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <select value={addUserForm.role} onChange={e => setAddUserForm(f => ({ ...f, role: e.target.value }))} className={inputCls}>
                {roleOptions.map(r => <option key={r} value={r} className="capitalize">{ROLE_LABEL[r] || r}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={addUserForm.status} onChange={e => setAddUserForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>
          <Field label="Organization">
            <select value={addUserForm.organisation_id} onChange={e => setAddUserForm(f => ({ ...f, organisation_id: e.target.value }))} className={inputCls}>
              <option value="">Select school</option>
              {orgList.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </Field>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 text-blue-700 text-[10px] leading-relaxed">
            <KeyRound size={13} className="flex-shrink-0 mt-0.5" />
            <span>A default password is generated automatically and shown after creation. Share it with the user securely.</span>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowAddUser(false)} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all">Cancel</button>
            <button onClick={submitAddUser} disabled={savingUser} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg disabled:opacity-60 transition-all">
              {savingUser ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Company Admin modal */}
      <Modal open={showCompanyAdminModal} onClose={() => { setShowCompanyAdminModal(false); setEditingCompanyAdmin(null); }} title={editingCompanyAdmin ? 'Edit Company Admin' : 'Add Company Admin'}>
        <div className="space-y-3">
          <Field label="Full Name"><input value={caForm.full_name} onChange={e => setCaForm(f => ({ ...f, full_name: e.target.value }))} className={inputCls} placeholder="e.g. Admin Name" /></Field>
          <Field label="Email"><input type="email" value={caForm.email} onChange={e => setCaForm(f => ({ ...f, email: e.target.value }))} className={inputCls} placeholder="admin@prasynx.com" /></Field>
          <Field label="Phone"><input value={caForm.phone} onChange={e => setCaForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} placeholder="Optional" /></Field>
          <Field label="Designation"><input value={caForm.designation} onChange={e => setCaForm(f => ({ ...f, designation: e.target.value }))} className={inputCls} placeholder="e.g. Platform Admin, Support Lead" /></Field>
          <Field label="Status">
            <select value={caForm.status} onChange={e => setCaForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => { setShowCompanyAdminModal(false); setEditingCompanyAdmin(null); }} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all">Cancel</button>
            <button onClick={submitCompanyAdmin} disabled={savingCa} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg disabled:opacity-60 transition-all">
              {savingCa ? 'Saving...' : editingCompanyAdmin ? 'Save Changes' : 'Add Company Admin'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View user modal */}
      <Modal open={!!viewingUser} onClose={() => setViewingUser(null)} title="User Details">
        {viewingUser && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white text-sm font-bold rounded-full">{initials(viewingUser.name)}</div>
              </Avatar>
              <div>
                <div className="text-sm font-bold text-gray-900">{viewingUser.name}</div>
                <Badge variant={statusVariant(viewingUser.status)} className="mt-0.5 text-[9px] capitalize">{viewingUser.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {[
                { icon: Mail, label: 'Email', value: viewingUser.email },
                { icon: Phone, label: 'Phone', value: viewingUser.phone || '—' },
                { icon: Shield, label: 'Role', value: ROLE_LABEL[viewingUser.role] || viewingUser.role },
                { icon: Building2, label: 'Organization', value: viewingUser.organisation_name ? `${viewingUser.organisation_name}${viewingUser.organisation_code ? ` (${viewingUser.organisation_code})` : ''}` : '—' },
                { icon: CalendarDays, label: 'Last Login', value: fmtDate(viewingUser.last_login) },
              ].map((row, i) => {
                const Icon = row.icon;
                return (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50">
                    <Icon size={13} className="text-[#6D4CFF] flex-shrink-0" />
                    <span className="text-[10px] font-semibold text-gray-500 w-24 flex-shrink-0">{row.label}</span>
                    <span className="text-xs text-gray-700 break-all">{row.value}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => handleBlock(viewingUser, viewingUser.status === 'active')} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all">
                {viewingUser.status === 'active' ? 'Block User' : 'Activate User'}
              </button>
              <button onClick={() => { setConfirmTarget({ kind: 'user', id: viewingUser.id, name: viewingUser.name }); setViewingUser(null); }} className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-all">Delete User</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm delete */}
      <Modal open={!!confirmTarget} onClose={() => setConfirmTarget(null)} title="Confirm Deletion">
        <p className="text-xs text-gray-600 mb-1">Delete <span className="font-bold text-gray-900">{confirmTarget?.name}</span>?</p>
        <p className="text-[11px] text-gray-400 mb-4">This action cannot be undone. The account will be permanently removed.</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setConfirmTarget(null)} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-all">Delete</button>
        </div>
      </Modal>
    </div>
  );
}