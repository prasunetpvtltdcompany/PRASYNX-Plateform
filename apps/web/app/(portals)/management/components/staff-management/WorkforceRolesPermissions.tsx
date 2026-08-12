'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Shield, ShieldCheck, Eye, Edit3, Trash2, Plus, X,
  Search, Users, Key, Lock, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

const FEATURES = [
  'Staff Directory', 'Staff Attendance', 'Work Assignments', 'Academic Assignments',
  'Leave Management', 'Performance Management', 'Task Management', 'Staff Documents',
  'Communication Center', 'Staff Analytics', 'Payroll', 'Recruitment',
];

const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete'] as const;

function KpiCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mb-2" style={{ background: bg, color }}><Icon size={18} /></div>
      <div className="text-[11px] text-gray-500 font-medium">{label}</div>
      <div className="text-xl font-extrabold text-gray-900 mt-0.5">{value ?? '—'}</div>
    </motion.div>
  );
}

export function WorkforceRolesPermissions() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});

  const roles = useApi(() => enterpriseStaffApi.getRoles(), []);
  const permissionsApi = useApi(() => enterpriseStaffApi.getPermissions(), []);
  const directory = useApi(() => enterpriseStaffApi.getStaffDirectory(), []);

  const roleList = useMemo(() => {
    let items = Array.isArray(roles.data?.data) ? roles.data.data : Array.isArray(roles.data) ? roles.data : [];
    if (search) items = items.filter((r: any) => r.name?.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [roles.data, search]);

  const staffCount = useMemo(() => {
    const raw = directory.data?.data || directory.data || [];
    return Array.isArray(raw) ? raw.length : 0;
  }, [directory.data]);

  const permData = useMemo(() => {
    const raw = permissionsApi.data?.data || permissionsApi.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [permissionsApi.data]);

  const handleCreateRole = async () => {
    try {
      const res = await enterpriseStaffApi.createRole({ ...formData, permissions });
      if (res.success) { toast.success('Role created'); setShowCreate(false); setFormData({}); setPermissions({}); roles.refetch(); }
      else toast.error(res.error || 'Failed to create role');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;
    try {
      const res = await enterpriseStaffApi.updateRole(editingRole.id, { ...formData, permissions });
      if (res.success) { toast.success('Role updated'); setEditingRole(null); setFormData({}); setPermissions({}); roles.refetch(); }
      else toast.error(res.error || 'Failed to update role');
    } catch (err: any) { toast.error(err.message); }
  };

  const openEdit = (role: any) => {
    setEditingRole(role);
    setFormData({ name: role.name, description: role.description });
    setPermissions(role.permissions || {});
  };

  const togglePermission = (feature: string, action: string) => {
    setPermissions((prev: any) => ({
      ...prev,
      [feature]: { ...prev[feature], [action]: !(prev[feature]?.[action] || false) },
    }));
  };

  if (roles.loading) return <LoadingSkeleton rows={4} cols={4} />;
  if (roles.error) return <ErrorState message={roles.error} onRetry={roles.refetch} />;

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <h1>Roles & Permissions</h1>
        <p>Dynamic role-based access control — define who can access what</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={Shield} label="Total Roles" value={roleList.length} color="#6D4CFF" bg="#F0EDFF" />
        <KpiCard icon={Users} label="Staff Covered" value={staffCount} color="#3B82F6" bg="#EFF6FF" />
        <KpiCard icon={Key} label="Permissions" value={permData.length || FEATURES.length * 4} color="#F59E0B" bg="#FFFBEB" />
        <KpiCard icon={Lock} label="Custom Roles" value={roleList.filter((r: any) => r.is_custom || !r.is_system).length} color="#10B981" bg="#ECFDF5" />
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roles..." className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs w-48 focus:outline-none focus:border-[#6D4CFF]" />
          </div>
          <button onClick={() => { setEditingRole(null); setFormData({}); setPermissions({}); setShowCreate(true); }} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all"><Plus size={14} /> Create Role</button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roleList.length === 0 ? <div className="lg:col-span-3"><EmptyState message="No roles defined" /></div> :
          roleList.map((role: any, i: number) => {
            const perms = role.permissions || {};
            const permCount = Object.values(perms).flatMap((v: any) => Object.values(v)).filter(Boolean).length;
            return (
              <motion.div key={role.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="rounded-xl p-4 border border-gray-100 bg-white hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#F0EDFF] flex items-center justify-center text-[#6D4CFF]"><ShieldCheck size={18} /></div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">{role.name || 'Unnamed Role'}</div>
                      <div className="text-[9px] text-gray-400">{role.description || 'No description'}</div>
                    </div>
                  </div>
                  {role.is_system && <Badge variant="info" className="text-[8px]">System</Badge>}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-3">
                  <Key size={12} /> {permCount} permissions
                  <Users size={12} className="ml-2" /> {role.user_count || 0} users
                </div>
                <div className="flex gap-1 flex-wrap">
                  {FEATURES.slice(0, 4).map(f => (
                    <Badge key={f} variant={perms[f]?.view ? 'success' : 'default'} className="text-[8px]">{f.split(' ')[0]}</Badge>
                  ))}
                  {permCount > 4 && <span className="text-[8px] text-gray-400">+{permCount - 4} more</span>}
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => openEdit(role)} className="text-[10px] text-[#6D4CFF] hover:text-[#5B3FDD] font-semibold flex items-center gap-1"><Edit3 size={12} /> Edit</button>
                </div>
              </motion.div>
            );
          })}
      </div>

      <AnimatePresence>
        {(showCreate || editingRole) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm overflow-y-auto" onClick={() => { setShowCreate(false); setEditingRole(null); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="font-bold text-sm">{editingRole ? 'Edit Role' : 'Create Role'}</h3>
                <button onClick={() => { setShowCreate(false); setEditingRole(null); }} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg">×</button>
              </div>
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Role Name</label><input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF]" /></div>
                  <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Description</label><input value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs" /></div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Permissions</label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead><tr className="bg-gray-50">
                        <th className="text-left px-3 py-2 font-semibold text-gray-500 text-[9px] uppercase">Feature</th>
                        {PERMISSION_ACTIONS.map(a => <th key={a} className="px-2 py-2 font-semibold text-gray-500 text-[9px] uppercase text-center">{a}</th>)}
                      </tr></thead>
                      <tbody>
                        {FEATURES.map(f => (
                          <tr key={f} className="border-t border-gray-50">
                            <td className="px-3 py-2 text-[10px]">{f}</td>
                            {PERMISSION_ACTIONS.map(a => {
                              const checked = permissions[f]?.[a] || false;
                              return (
                                <td key={a} className="px-2 py-2 text-center">
                                  <button onClick={() => togglePermission(f, a)}
                                    className={`w-4 h-4 rounded border transition-all inline-flex items-center justify-center ${checked ? 'bg-[#6D4CFF] border-[#6D4CFF] text-white' : 'border-gray-300'}`}>
                                    {checked && <CheckCircle2 size={10} />}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <button onClick={editingRole ? handleUpdateRole : handleCreateRole} className="w-full py-2.5 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all">
                  {editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
