'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Users, UserCheck, UserX, GraduationCap, Building2,
  Plus, Upload, Download, Search, Filter, Briefcase,
  Mail, Phone, Calendar, TrendingUp, ChevronRight, Shield,
  ChevronDown, X, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

function KpiCard({ icon: Icon, label, value, trend, color, bg }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}><Icon size={18} /></div>
        {trend && <Badge variant={trend.startsWith('+') ? 'success' : 'danger'} className="text-[9px]">{trend}</Badge>}
      </div>
      <div className="text-[11px] text-gray-500 font-medium">{label}</div>
      <div className="text-xl font-extrabold text-gray-900 mt-0.5">{value ?? '—'}</div>
    </motion.div>
  );
}

const statusBadgeVariant = (status: string): any => {
  const s = (status || '').toLowerCase();
  if (s === 'active' || s === 'present') return 'success';
  if (s === 'inactive' || s === 'absent') return 'danger';
  if (s === 'on leave' || s === 'leave') return 'warning';
  if (s === 'probation') return 'info';
  return 'default';
};

export function WorkforceStaffDirectory() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<{ type: string } | null>(null);
  const [formData, setFormData] = useState<any>({});

  const directory = useApi(() => enterpriseStaffApi.getStaffDirectory(), []);
  const stats = useApi(() => enterpriseStaffApi.getStaffStats(), []);
  const departments = useApi(() => enterpriseStaffApi.getDepartments(), []);
  const designations = useApi(() => enterpriseStaffApi.getDesignations(), []);

  const staffList = useMemo(() => {
    let list = Array.isArray(directory.data?.data) ? directory.data.data : Array.isArray(directory.data) ? directory.data : [];
    if (search) list = list.filter((s: any) =>
      (s.full_name || s.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.staff_unique_id || '').toLowerCase().includes(search.toLowerCase())
    );
    if (deptFilter) list = list.filter((s: any) => (s.department || s.department_name) === deptFilter);
    if (roleFilter) list = list.filter((s: any) => (s.role || s.designation) === roleFilter);
    if (statusFilter) list = list.filter((s: any) => (s.status || '').toLowerCase() === statusFilter.toLowerCase());
    return list;
  }, [directory.data, search, deptFilter, roleFilter, statusFilter]);

  const deptList = useMemo(() => {
    const raw = departments.data?.data || departments.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [departments.data]);

  const desigList = useMemo(() => {
    const raw = designations.data?.data || designations.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [designations.data]);

  const s = stats.data?.data || stats.data || {};

  const statCards = [
    { icon: Users, label: 'Total Staff', value: s.total_staff ?? s.total ?? 0, trend: '+5.2%', color: '#6D4CFF', bg: '#F0EDFF' },
    { icon: GraduationCap, label: 'Teaching', value: s.teaching_staff ?? s.teaching ?? 0, trend: '+3.1%', color: '#10B981', bg: '#ECFDF5' },
    { icon: Briefcase, label: 'Non-Teaching', value: s.non_teaching_staff ?? s.non_teaching ?? 0, color: '#F59E0B', bg: '#FFFBEB' },
    { icon: UserCheck, label: 'Active Staff', value: s.active_staff ?? s.active ?? 0, color: '#3B82F6', bg: '#EFF6FF' },
    { icon: UserX, label: 'On Leave', value: s.on_leave ?? s.leave ?? 0, trend: '-2.1%', color: '#EF4444', bg: '#FEF2F2' },
    { icon: Building2, label: 'Departments', value: deptList.length || s.departments || 0, color: '#EC4899', bg: '#FDF2F8' },
  ];

  const handleAddStaff = async () => {
    try {
      const res = await enterpriseStaffApi.addStaff(formData);
      if (res.success) { toast.success('Staff added successfully'); setShowAddModal(false); setFormData({}); directory.refetch(); stats.refetch(); }
      else toast.error(res.error || 'Failed to add staff');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleAssign = async (type: string) => {
    try {
      const res = type === 'role'
        ? await enterpriseStaffApi.assignRole(formData)
        : await enterpriseStaffApi.assignDepartment(formData);
      if (res.success) { toast.success(`${type} assigned successfully`); setShowAssignModal(null); setFormData({}); directory.refetch(); }
      else toast.error(res.error || 'Failed to assign');
    } catch (err: any) { toast.error(err.message); }
  };

  if (directory.loading || stats.loading) return <LoadingSkeleton rows={4} cols={4} />;
  if (directory.error) return <ErrorState message={directory.error} onRetry={directory.refetch} />;

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <h1>Staff Directory</h1>
        <p>Enterprise workforce directory — manage all staff across departments and roles</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {statCards.map((card, i) => (
          <KpiCard key={i} {...card} />
        ))}
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1">Quick Actions</span>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all"><Plus size={14} /> Add Staff</button>
          <button onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.csv,.xlsx'; input.click(); }} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><Upload size={14} /> Import Staff</button>
          <button onClick={() => toast.success('Exporting staff data...')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><Download size={14} /> Export Staff</button>
          <button onClick={() => setShowAssignModal({ type: 'role' })} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><Shield size={14} /> Assign Role</button>
          <button onClick={() => setShowAssignModal({ type: 'department' })} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><Building2 size={14} /> Assign Department</button>
          <button onClick={() => toast.success('Opening work assignment...')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><Briefcase size={14} /> Assign Work</button>
        </div>
      </Card>

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or ID..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF] focus:ring-1 focus:ring-[#6D4CFF]/20" />
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-xs">
            <option value="">All Departments</option>
            {deptList.map((d: any) => <option key={d.id || d} value={d.name || d}>{d.name || d}</option>)}
          </select>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-xs">
            <option value="">All Roles</option>
            {desigList.map((d: any) => <option key={d.id || d} value={d.name || d}>{d.name || d}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-xs">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on leave">On Leave</option>
            <option value="probation">Probation</option>
          </select>
          {(search || deptFilter || roleFilter || statusFilter) && (
            <button onClick={() => { setSearch(''); setDeptFilter(''); setRoleFilter(''); setStatusFilter(''); }} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"><X size={12} /> Clear</button>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-800/80">
                {['Staff ID', 'Name', 'Email', 'Department', 'Role', 'Status', 'Actions'].map(h =>
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {staffList.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12"><EmptyState message="No staff members found" /></td></tr>
              ) : staffList.map((staff: any, i: number) => (
                <tr key={staff.id || i} className={`border-t border-gray-50 hover:bg-[#6D4CFF]/[0.02] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-3 font-mono text-[10px] text-gray-400">{staff.staff_unique_id || staff.staff_unique_id || staff.id?.slice(0, 8) || '—'}</td>
                  <td className="px-4 py-3"><span className="font-semibold text-gray-900 dark:text-gray-100">{staff.full_name || staff.name || '—'}</span></td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{staff.email || '—'}</td>
                  <td className="px-4 py-3">{staff.department || staff.department_name || '—'}</td>
                  <td className="px-4 py-3">{staff.designation || staff.role || '—'}</td>
                  <td className="px-4 py-3"><Badge variant={statusBadgeVariant(staff.status)} className="text-[9px]">{staff.status || 'Active'}</Badge></td>
                  <td className="px-4 py-3">
                    <button className="text-[#6D4CFF] hover:text-[#5B3FDD] text-[10px] font-semibold" onClick={() => toast.info(`Viewing ${staff.full_name || staff.name}`)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-sm dark:text-gray-100">Add Staff Member</h3>
              <button onClick={() => setShowAddModal(false)} className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 text-lg">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Full Name</label><input value={formData.full_name || ''} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF]" /></div>
              <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Email</label><input type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF]" /></div>
              <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Phone</label><input value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF]" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Department</label>
                  <select value={formData.department || ''} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs">
                    <option value="">Select</option>
                    {deptList.map((d: any) => <option key={d.id || d} value={d.name || d}>{d.name || d}</option>)}
                  </select>
                </div>
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Designation</label>
                  <select value={formData.designation || ''} onChange={e => setFormData({ ...formData, designation: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs">
                    <option value="">Select</option>
                    {desigList.map((d: any) => <option key={d.id || d} value={d.name || d}>{d.name || d}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleAddStaff} className="w-full py-2.5 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all">Add Staff Member</button>
            </div>
          </motion.div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowAssignModal(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-sm dark:text-gray-100">Assign {showAssignModal.type === 'role' ? 'Role' : 'Department'}</h3>
              <button onClick={() => setShowAssignModal(null)} className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 text-lg">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Staff Member</label>
                <select value={formData.staff_id || ''} onChange={e => setFormData({ ...formData, staff_id: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs">
                  <option value="">Select staff</option>
                  {(Array.isArray(directory.data?.data) ? directory.data.data : Array.isArray(directory.data) ? directory.data : []).map((s: any) => (
                    <option key={s.id} value={s.id}>{s.full_name || s.name}</option>
                  ))}
                </select>
              </div>
              {showAssignModal.type === 'role' ? (
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Role</label>
                  <select value={formData.role_id || ''} onChange={e => setFormData({ ...formData, role_id: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs">
                    <option value="">Select role</option>
                    {desigList.map((d: any) => <option key={d.id || d} value={d.id}>{d.name || d}</option>)}
                  </select>
                </div>
              ) : (
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Department</label>
                  <select value={formData.department_id || ''} onChange={e => setFormData({ ...formData, department_id: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs">
                    <option value="">Select department</option>
                    {deptList.map((d: any) => <option key={d.id || d} value={d.id}>{d.name || d}</option>)}
                  </select>
                </div>
              )}
              <button onClick={() => handleAssign(showAssignModal.type)} className="w-full py-2.5 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all">Assign</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
