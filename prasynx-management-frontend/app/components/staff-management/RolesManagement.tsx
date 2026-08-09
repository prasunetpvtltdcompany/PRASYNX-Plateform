'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Shield, ShieldCheck, Users, Key, Plus, Edit3, Trash2, X, Loader2, RefreshCw, Search,
  CheckCircle2, UserCheck, UserX, Ban, Activity, BadgeCheck, Fingerprint, LayoutDashboard,
  GraduationCap, BookOpen, CalendarDays, ClipboardList, Banknote, Receipt, FileText,
  MessageSquare, Bus, Boxes, Heart, Trophy, CalendarCheck, KeyRound, Sparkles,
} from 'lucide-react';
import { rolesApiV2 } from '../../lib/dataService';
import { useApi, LoadingSkeleton, EmptyState } from '../../lib/useApi';
import { Cell, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip } from 'recharts';

type Tab = 'overview' | 'people' | 'roles' | 'permissions';

const MODULE_ICONS: Record<string, any> = {
  academics: GraduationCap, attendance: CalendarDays, homework: BookOpen, classes: BookOpen,
  subjects: BookOpen, marks: FileText, evaluation: FileText, fees: Banknote, payroll: Banknote,
  transport: Bus, library: BookOpen, inventory: Boxes, medical: Heart, sports: Trophy,
  security: Shield, workforce: Users, staff: Users, portal: LayoutDashboard, dashboard: LayoutDashboard,
  communication: MessageSquare, timetable: CalendarDays, leave: CalendarCheck, record: FileText, general: LayoutDashboard,
};

const NAV: { key: Tab; label: string; icon: any }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'people', label: 'People', icon: Users },
  { key: 'roles', label: 'Roles', icon: Shield },
  { key: 'permissions', label: 'Permissions', icon: Key },
];

export function RolesManagement() {
  const [mode, setMode] = useState<Tab>('overview');
  const [searchQ, setSearchQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const dash = useApi(() => rolesApiV2.getDashboard(), []);
  const roles = useApi(() => rolesApiV2.getRoles(), []);
  const permissions = useApi(() => rolesApiV2.getPermissions(), []);
  const users = useApi(() => rolesApiV2.getUsers({ search: searchQ, role: roleFilter, status: statusFilter }), [searchQ, roleFilter, statusFilter]);
  const auditLogs = useApi(() => rolesApiV2.getAuditLogs(), []);

  const dd: any = dash.data?.data || dash.data || {};
  const usersList: any[] = users.data?.data || users.data || [];
  const rolesList: any[] = roles.data?.data || roles.data || [];
  const permsList: any[] = permissions.data?.data || permissions.data || [];

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [roleModal, setRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  const [permModal, setPermModal] = useState(false);
  const [permRole, setPermRole] = useState<any>(null);
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busyUser, setBusyUser] = useState<string | null>(null);

  const selectedUser = usersList.find(u => u.id === selectedUserId) || null;
  const roleOfUser = (u: any) => rolesList.find(r => String(r.name).toLowerCase() === String(u?.role || '').toLowerCase());
  const roleOfSelected = selectedUser ? roleOfUser(selectedUser) : undefined;
  const rolePermIds = (role: any) => new Set((role?.role_permissions || []).map((rp: any) => rp.permissions?.id).filter(Boolean));
  const rolePermsForUser = roleOfSelected ? rolePermIds(roleOfSelected) : new Set<string>();

  const moduleGroups = permsList.reduce((acc: Record<string, any[]>, p: any) => {
    const m = p.module || 'General';
    if (!acc[m]) acc[m] = [];
    acc[m].push(p);
    return acc;
  }, {});

  const initials = (n: string) => String(n || '?').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const avColor = (n: string) => ['#6D4CFF', '#EC4899', '#0EA5E9', '#14B8A6', '#F59E0B', '#8B5CF6'][(String(n || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0)) % 6];

  const StatusBadge = ({ s }: { s?: string }) => (
    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold capitalize ${s === 'active' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' : s === 'disabled' ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300'}`}>{s || 'pending'}</span>
  );

  const refreshAll = () => { dash.refetch(); roles.refetch(); permissions.refetch(); users.refetch(); auditLogs.refetch(); };

  const openCreate = () => { setEditingRole(null); setRoleForm({ name: '', description: '' }); setRoleModal(true); };
  const openEdit = (r: any) => { setEditingRole(r); setRoleForm({ name: r.name || '', description: r.description || '' }); setRoleModal(true); };

  const saveRole = async () => {
    if (!roleForm.name.trim()) { toast.error('Role name is required'); return; }
    setSaving(true);
    try {
      const r: any = editingRole
        ? await rolesApiV2.updateRole(editingRole.id, { name: roleForm.name.trim(), description: roleForm.description })
        : await rolesApiV2.createRole({ name: roleForm.name.trim(), description: roleForm.description });
      if (r?.success) { toast.success(editingRole ? 'Role updated' : 'Role created'); setRoleModal(false); roles.refetch(); dash.refetch(); }
      else toast.error(r?.error || 'Save failed');
    } catch (e: any) { toast.error(e?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const deleteRole = async (r: any) => {
    if (!window.confirm(`Delete role "${r.name}"?`)) return;
    setDeletingId(r.id);
    try {
      const res: any = await rolesApiV2.deleteRole(r.id);
      if (res?.success) { toast.success('Role deleted'); roles.refetch(); dash.refetch(); }
      else toast.error(res?.error || 'Delete failed');
    } catch (e: any) { toast.error(e?.message || 'Delete failed'); }
    finally { setDeletingId(null); }
  };

  const openPerms = (r: any) => {
    const ids = (r.role_permissions || []).map((rp: any) => rp.permissions?.id).filter(Boolean);
    setPermRole(r); setSelectedPerms(new Set(ids)); setPermModal(true);
  };
  const togglePerm = (id: string) => setSelectedPerms(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const savePerms = async () => {
    setSaving(true);
    try {
      const r: any = await rolesApiV2.assignPermissions(permRole.id, { permission_ids: Array.from(selectedPerms) });
      if (r?.success) { toast.success('Access updated'); setPermModal(false); roles.refetch(); }
      else toast.error(r?.error || 'Update failed');
    } catch (e: any) { toast.error(e?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const changeUser = async (userId: string, body: any) => {
    setBusyUser(userId);
    try {
      const r: any = await rolesApiV2.updateUserRole(userId, body);
      if (r?.success) {
        users.refetch(); dash.refetch();
        toast.success(body.role ? 'Role updated' : body.status === 'disabled' ? 'Portal access restricted' : 'Portal access granted');
      } else toast.error(r?.error || 'Update failed');
    } catch (e: any) { toast.error(e?.message || 'Update failed'); }
    finally { setBusyUser(null); }
  };

  // ==================== OVERVIEW ====================
  const renderOverview = () => {
    const restricted = usersList.filter(u => u.status === 'disabled').length;
    const roleDist = usersList.reduce((a: Record<string, number>, u: any) => { const k = u.role || 'unassigned'; a[k] = (a[k] || 0) + 1; return a; }, {});
    const totalDist = Object.values(roleDist).reduce((a: number, b: any) => a + Number(b), 0);
    const logs: any[] = auditLogs.data?.data || auditLogs.data || [];
    const kpis = [
      { icon: Users, label: 'Users', value: usersList.length, sub: `${dd.activeUsers ?? 0} active`, color: '#6D4CFF' },
      { icon: Ban, label: 'Restricted', value: restricted, sub: 'portal access blocked', color: '#EF4444' },
      { icon: Shield, label: 'Roles', value: dd.totalRoles ?? rolesList.length, sub: `${dd.customRoles ?? 0} custom`, color: '#22C55E' },
      { icon: Key, label: 'Permissions', value: dd.totalPermissions ?? permsList.length, sub: 'access rules', color: '#F59E0B' },
    ];
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.05, type: 'spring', stiffness: 220, damping: 20 }}>
              <div className="rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 p-4 group hover:-translate-y-1 hover:shadow-xl transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform" style={{ background: `${k.color}15`, color: k.color }}><k.icon size={18} /></div>
                <div className="text-xl font-extrabold text-gray-900 dark:text-white">{k.value}</div>
                <div className="text-[10px] text-gray-400">{k.label} · <span className="font-semibold" style={{ color: k.color }}>{k.sub}</span></div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 p-5">
            <h4 className="text-xs font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-1.5"><Users size={14} className="text-[#6D4CFF]" /> Users by Role</h4>
            {Object.keys(roleDist).length ? (
              <div className="space-y-3">
                {Object.entries(roleDist).map(([role, count], i) => (
                  <div key={role} className="flex items-center gap-3">
                    <span className="w-24 text-[10px] capitalize text-gray-600 dark:text-gray-300 truncate">{role}</span>
                    <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(Number(count) / (totalDist || 1)) * 100}%` }} transition={{ delay: 0.3 + i * 0.07, type: 'spring', stiffness: 120 }} className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#EC4899]" />
                    </div>
                    <span className="w-6 text-right text-[11px] font-bold text-gray-700 dark:text-gray-200">{count}</span>
                  </div>
                ))}
              </div>
            ) : <EmptyState message="No users yet" />}
          </div>
          <div className="rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 p-5">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-1.5"><Activity size={14} className="text-[#6D4CFF]" /> Recent Access Activity</h4>
            {auditLogs.loading ? <LoadingSkeleton rows={4} /> : !logs.length ? <EmptyState message="No activity yet" /> : logs.slice(0, 6).map((lg, i) => (
              <motion.div key={lg.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800/40 last:border-0">
                <div className="w-7 h-7 rounded-lg bg-[#6D4CFF]/10 flex items-center justify-center text-[#6D4CFF] flex-shrink-0"><Fingerprint size={13} /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 truncate">{lg.users?.full_name || lg.user_id}</div>
                  <div className="text-[9px] text-gray-400 capitalize">{String(lg.action || 'change').replace(/_/g, ' ')}</div>
                </div>
                <span className="text-[9px] text-gray-400">{lg.created_at ? new Date(lg.created_at).toLocaleString() : ''}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ==================== PEOPLE (portal access control) ====================
  const renderPeople = () => (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2">
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search people…" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs">
            <option value="">All access</option><option value="active">Active</option><option value="disabled">Restricted</option><option value="pending">Pending</option>
          </select>
        </div>
        {users.loading ? <LoadingSkeleton rows={6} /> : !usersList.length ? <EmptyState message="No matches" /> : (
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {usersList.map((u, i) => (
              <motion.button key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedUserId(u.id)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-2xl border transition-all ${selectedUserId === u.id ? 'border-[#6D4CFF]/60 bg-[#6D4CFF]/5 shadow-sm' : 'border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 hover:border-[#6D4CFF]/30'}`}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: avColor(u.full_name) }}>{initials(u.full_name)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{u.full_name}</div>
                  <div className="text-[9px] text-gray-400 truncate">{u.email}</div>
                  <div className="mt-0.5 flex items-center gap-1.5"><span className="text-[9px] font-semibold text-[#6D4CFF]">{u.role || 'no role'}</span><StatusBadge s={u.status} /></div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-2">
        {!selectedUser ? (
          <div className="h-full flex items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-8">
            <EmptyState icon={Users} message="Select a person to control their portal access" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-base font-extrabold" style={{ background: avColor(selectedUser.full_name) }}>{initials(selectedUser.full_name)}</div>
                  <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${selectedUser.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-extrabold text-gray-900 dark:text-white">{selectedUser.full_name}</div>
                  <div className="text-[11px] text-gray-400 truncate">{selectedUser.email}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    {selectedUser.status === 'active' ? <BadgeCheck size={13} className="text-emerald-500" /> : <Ban size={13} className="text-red-500" />}
                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">{selectedUser.status === 'active' ? 'Has portal access' : 'Portal access restricted'}</span>
                  </div>
                </div>
                <StatusBadge s={selectedUser.status} />
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Assigned role</div>
                  <select value={selectedUser.role || ''} disabled={busyUser === selectedUser.id} onChange={e => changeUser(selectedUser.id, { role: e.target.value })} className="w-full sm:w-56 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold focus:outline-none disabled:opacity-50">
                    <option value="">Unassigned</option>
                    {rolesList.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Restrict portal</div>
                    <button onClick={() => changeUser(selectedUser.id, { status: selectedUser.status === 'active' ? 'disabled' : 'active' })} disabled={busyUser === selectedUser.id}
                      className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 ${selectedUser.status !== 'active' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${selectedUser.status !== 'active' ? 'left-0.5' : 'left-[26px]'}`} />
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-400">{selectedUser.status === 'active' ? 'Granted' : 'Restricted'}{busyUser === selectedUser.id && <Loader2 size={11} className="inline ml-1 animate-spin" />}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 p-5">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">Portal Apps Access</h4>
                <span className="text-[10px] text-gray-400">what this person can use</span>
              </div>
              <p className="text-[10px] text-gray-400 mb-4">
                Based on their role <span className="font-semibold text-[#6D4CFF]">{selectedUser.role || '—'}</span>.
                {roleOfSelected ? ' Use Access below to fine-tune the role.' : ' Assign a role to enable access.'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {Object.entries(moduleGroups).map(([module, items]) => {
                  const got = items.filter((p: any) => rolePermsForUser.has(p.id)).length;
                  const allowed = got > 0;
                  const Icon = MODULE_ICONS[module.toLowerCase()] || LayoutDashboard;
                  return (
                    <motion.div key={module} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                      className={`rounded-xl border p-3 flex items-center gap-3 transition-colors ${allowed ? 'border-emerald-200 dark:border-emerald-500/25 bg-emerald-50/60 dark:bg-emerald-500/5' : 'border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/40'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${allowed ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-gray-200/80 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}><Icon size={15} /></div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold capitalize truncate text-gray-800 dark:text-gray-200">{module.replace(/_/g, ' ')}</div>
                        <div className="text-[9px] text-gray-400">{got} permission{got === 1 ? '' : 's'}</div>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${allowed ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>{allowed ? 'Granted' : 'Restricted'}</span>
                    </motion.div>
                  );
                })}
              </div>
              {roleOfSelected && (
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => openPerms(roleOfSelected)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[11px] font-bold shadow-lg shadow-purple-500/25"><KeyRound size={13} /> Edit this role's access</button>
                  <span className="text-[10px] text-gray-400">Changes apply to everyone with this role.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ==================== ROLES ====================
  const renderRoles = () => {
    const list = rolesList.filter(r => !searchQ || r.name.toLowerCase().includes(searchQ.toLowerCase()));
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search roles…" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-bold shadow-lg shadow-purple-500/25"><Plus size={14} /> Create Role</motion.button>
        </div>
        {roles.loading ? <LoadingSkeleton rows={6} cols={3} /> : !list.length ? <EmptyState message="No roles created yet" /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {list.map((r, i) => {
              const nPerms = (r.role_permissions || []).length;
              return (
                <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, type: 'spring', stiffness: 220, damping: 22 }}
                  className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all p-5">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6D4CFF] to-[#EC4899]" />
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform"><Shield size={20} /></div>
                      <div>
                        <div className="text-sm font-extrabold text-gray-900 dark:text-white">{r.name}</div>
                        <div className="text-[10px] text-gray-400">{r.description || 'No description'}</div>
                      </div>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${r.is_system ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300'}`}>{r.is_system ? 'System' : 'Custom'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 text-[11px] text-gray-500"><KeyRound size={12} className="text-[#A855F7]" /> {nPerms} portal permissions</div>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/40">
                    <button onClick={() => openEdit(r)} className="px-3 py-1.5 rounded-lg bg-[#6D4CFF] text-white text-[11px] font-semibold hover:bg-[#5a3fd8] transition-colors">Edit</button>
                    <button onClick={() => openPerms(r)} className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[11px] font-semibold hover:bg-gray-200 transition-colors">Access</button>
                    {!r.is_system && (
                      <button onClick={() => deleteRole(r)} disabled={deletingId === r.id} className="ml-auto px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 text-[11px] font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
                        {deletingId === r.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ==================== PERMISSIONS ====================
  const renderPermissions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-gray-800 dark:text-white">Portal Apps & Rules <span className="text-[10px] font-medium text-gray-400">({permsList.length})</span></h3>
        <span className="text-[10px] text-gray-400">{Object.keys(moduleGroups).length} apps</span>
      </div>
      {permissions.loading ? <LoadingSkeleton rows={5} cols={3} /> : !Object.keys(moduleGroups).length ? <EmptyState message="No permissions configured" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(moduleGroups).map(([module, perms], i) => {
            const Icon = MODULE_ICONS[module.toLowerCase()] || LayoutDashboard;
            return (
              <motion.div key={module} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-lg transition-all p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#6D4CFF]/10 flex items-center justify-center text-[#6D4CFF]"><Icon size={16} /></div>
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-800 dark:text-white capitalize">{module.replace(/_/g, ' ')}</h4>
                    <span className="text-[9px] text-gray-400">{perms.length} rules</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {perms.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/40">
                      <span className="text-[10px] text-gray-600 dark:text-gray-300 flex items-center gap-1.5"><Fingerprint size={10} className="text-[#6D4CFF]" /> {p.name}</span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 capitalize">{p.action || 'access'}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ rotate: 6, scale: 1.05 }} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#EC4899] flex items-center justify-center text-white shadow-lg shadow-purple-500/30 flex-shrink-0"><ShieldCheck size={20} /></motion.div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Access Control</h2>
            <p className="text-[11px] text-gray-400">Control who can sign in and what each person can use in the portal.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.95 }} onClick={refreshAll} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><RefreshCw size={13} className={users.loading ? 'animate-spin' : ''} /> Refresh</motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={openCreate} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-bold shadow-lg shadow-purple-500/25"><Plus size={13} /> New Role</motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/70 rounded-xl w-fit overflow-x-auto max-w-full">
        {NAV.map(tab => (
          <button key={tab.key} onClick={() => setMode(tab.key)} className={`relative px-4 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${mode === tab.key ? 'text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {mode === tab.key && <motion.span layoutId="ac-pill" className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6]" transition={{ type: 'spring', stiffness: 350, damping: 30 }} />}
            <span className="relative flex items-center gap-1.5"><tab.icon size={12} /> {tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
          {mode === 'overview' && renderOverview()}
          {mode === 'people' && renderPeople()}
          {mode === 'roles' && renderRoles()}
          {mode === 'permissions' && renderPermissions()}
        </motion.div>
      </AnimatePresence>

      {/* Create / Edit role modal */}
      <AnimatePresence>
        {roleModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRoleModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 12 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }} className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">{editingRole ? <Edit3 size={15} className="text-[#6D4CFF]" /> : <Plus size={15} className="text-[#6D4CFF]" />} {editingRole ? 'Edit Role' : 'Create Role'}</h4>
                <button onClick={() => setRoleModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 transition-colors"><X size={14} /></button>
              </div>
              <div className="space-y-4">
                <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Role Name *</span>
                  <input value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} placeholder="e.g. Department Head" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" /></label>
                <label className="block"><span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Description</span>
                  <textarea value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} rows={3} placeholder="What this role is responsible for…" className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" /></label>
              </div>
              <div className="flex items-center gap-2 justify-end mt-5">
                <button onClick={() => setRoleModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors">Cancel</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={saveRole} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-bold shadow-lg shadow-purple-500/25 disabled:opacity-50">
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />} {saving ? 'Saving…' : 'Save Role'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign permissions modal */}
      <AnimatePresence>
        {permModal && permRole && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPermModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 12 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }} className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2"><Key size={15} className="text-[#6D4CFF]" /> Access · {permRole.name}</h4>
                <button onClick={() => setPermModal(false)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 transition-colors"><X size={14} /></button>
              </div>
              <div className="text-[10px] text-gray-400 mb-4">Toggle which apps and actions this role can access. Grants apply to everyone holding this role.</div>
              {Object.entries(moduleGroups).map(([module, perms]) => (
                <div key={module} className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D4CFF] capitalize flex items-center gap-1.5">{(() => { const Icon = MODULE_ICONS[module.toLowerCase()] || LayoutDashboard; return <Icon size={12} />; })()}{module.replace(/_/g, ' ')}</span>
                    <button onClick={() => {
                      const ids = (perms as any[]).map(p => p.id);
                      const allOn = ids.every(id => selectedPerms.has(id));
                      setSelectedPerms(prev => { const n = new Set(prev); ids.forEach(id => allOn ? n.delete(id) : n.add(id)); return n; });
                    }} className="text-[9px] font-semibold text-gray-400 hover:text-[#6D4CFF] transition-colors">{((perms as any[]).every(p => selectedPerms.has(p.id))) ? 'Clear' : 'Select all'}</button>
                  </div>
                  <div className="space-y-1">
                    {(perms as any[]).map((p: any) => {
                      const on = selectedPerms.has(p.id);
                      return (
                        <button key={p.id} onClick={() => togglePerm(p.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${on ? 'border-[#6D4CFF]/50 bg-[#6D4CFF]/10' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-[#6D4CFF]/30'}`}>
                          <span className={`w-4 h-4 rounded-md flex items-center justify-center text-white transition-colors shrink-0 ${on ? 'bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6]' : 'bg-gray-200 dark:bg-gray-600'}`}>{on && <CheckCircle2 size={11} />}</span>
                          <span className="flex-1 text-xs font-semibold text-gray-700 dark:text-gray-200">{p.name}</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 capitalize">{p.action || 'access'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 justify-end mt-5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-[10px] text-gray-400 mr-auto">{selectedPerms.size} granted</span>
                <button onClick={() => setPermModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors">Cancel</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={savePerms} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-bold shadow-lg shadow-purple-500/25 disabled:opacity-50">
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />} {saving ? 'Saving…' : 'Save Access'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RolesManagement;