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
  Mail, Phone, Calendar, TrendingUp, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

function KpiCard({ icon: Icon, label, value, trend, color, bg }: { icon: any; label: string; value: string | number; trend?: string; color: string; bg: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}><Icon size={18} /></div>
        {trend && <Badge variant={trend.startsWith('+') ? 'success' : 'danger'} className="text-[9px]">{trend}</Badge>}
      </div>
      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{label}</div>
      <div className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mt-0.5">{value ?? '—'}</div>
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

export function StaffDirectoryEnterprise() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const directory = useApi(() => enterpriseStaffApi.getStaffDirectory(), []);
  const stats = useApi(() => enterpriseStaffApi.getStaffStats(), []);
  const departments = useApi(() => enterpriseStaffApi.getDepartments(), []);

  const staffList = useMemo(() => {
    let list = Array.isArray(directory.data?.data) ? directory.data.data : Array.isArray(directory.data) ? directory.data : [];
    if (search) list = list.filter((s: any) => (s.full_name || s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.email || '').toLowerCase().includes(search.toLowerCase()));
    if (deptFilter) list = list.filter((s: any) => (s.department || s.department_name) === deptFilter);
    return list;
  }, [directory.data, search, deptFilter]);

  const deptList = useMemo(() => {
    const raw = departments.data?.data || departments.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [departments.data]);

  const s = stats.data?.data || stats.data || {};

  const statCards = [
    { icon: Users, label: 'Total Staff', value: s.total_staff ?? s.total ?? 0, trend: '+5.2%', color: '#6D4CFF', bg: '#F0EDFF' },
    { icon: GraduationCap, label: 'Teaching', value: s.teaching_staff ?? s.teaching ?? 0, trend: '+3.1%', color: '#10B981', bg: '#ECFDF5' },
    { icon: Briefcase, label: 'Non-Teaching', value: s.non_teaching_staff ?? s.non_teaching ?? 0, color: '#F59E0B', bg: '#FFFBEB' },
    { icon: UserCheck, label: 'Active', value: s.active_staff ?? s.active ?? 0, color: '#3B82F6', bg: '#EFF6FF' },
    { icon: UserX, label: 'On Leave', value: s.on_leave ?? s.leave ?? 0, trend: '-2.1%', color: '#EF4444', bg: '#FEF2F2' },
    { icon: TrendingUp, label: 'New Joiners', value: s.new_joiners ?? s.new_join ?? 0, trend: '+12%', color: '#8B5CF6', bg: '#F5F3FF' },
    { icon: Building2, label: 'Departments', value: deptList.length || s.departments || 0, color: '#EC4899', bg: '#FDF2F8' },
  ];

  const handleActionToast = (action: string) => toast.success(`${action} clicked — integration pending`);

  if (directory.loading || stats.loading) return <div className="w-full"><LoadingSkeleton rows={4} cols={4} /></div>;
  if (directory.error) return <ErrorState message={directory.error} onRetry={directory.refetch} />;

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <h1>Staff Directory</h1>
        <p>Enterprise workforce management — view and manage all staff across departments</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {statCards.map((card, i) => (
          <KpiCard key={i} {...card} />
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1">Quick Actions</span>
          <button onClick={() => handleActionToast('Add Staff')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all"><Plus size={14} /> Add Staff</button>
          <button onClick={() => handleActionToast('Import')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><Upload size={14} /> Import</button>
          <button onClick={() => handleActionToast('Export')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><Download size={14} /> Export</button>
          <button onClick={() => handleActionToast('Assign Department')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><Building2 size={14} /> Assign Dept</button>
          <button onClick={() => handleActionToast('Assign Role')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"><Briefcase size={14} /> Assign Role</button>
        </div>
      </Card>

      {/* Search & Filter */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
          </div>
          <div className="relative w-full sm:w-56">
            <Filter size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-xs bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 appearance-none">
              <option value="">All Departments</option>
              {deptList.map((d: any) => (
                <option key={d.id || d.name} value={d.name || d}>{d.name || d}</option>
              ))}
            </select>
          </div>
          <div className="text-xs text-gray-400 font-medium whitespace-nowrap">{staffList.length} staff members</div>
        </div>
      </Card>

      {/* Staff Grid */}
      {staffList.length === 0 ? (
        <EmptyState message="No staff members found matching your criteria" action={{ label: 'Clear Filters', onClick: () => { setSearch(''); setDeptFilter(''); } }} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {staffList.map((staff: any, idx: number) => {
            const name = staff.full_name || staff.name || 'Unknown';
            const email = staff.email || '—';
            const phone = staff.phone || staff.mobile || '—';
            const dept = staff.department || staff.department_name || 'General';
            const status = staff.status || 'active';
            const role = staff.role || staff.designation || 'Staff';
            const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

            return (
              <motion.div key={staff.id || idx} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#6D4CFF]/10 flex items-center justify-center text-[#6D4CFF] text-sm font-bold flex-shrink-0">{initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{name}</span>
                        <ChevronRight size={12} className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                      <div className="text-[10px] text-gray-400 capitalize mt-0.5">{role}</div>
                    </div>
                    <Badge variant={statusBadgeVariant(status)} className="capitalize">{status}</Badge>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2"><Mail size={12} className="text-gray-300 dark:text-gray-600" /><span className="truncate">{email}</span></div>
                    <div className="flex items-center gap-2"><Phone size={12} className="text-gray-300 dark:text-gray-600" /><span>{phone}</span></div>
                    <div className="flex items-center gap-2"><Building2 size={12} className="text-gray-300 dark:text-gray-600" /><span>{dept}</span></div>
                    {staff.employee_id && <div className="flex items-center gap-2"><Calendar size={12} className="text-gray-300 dark:text-gray-600" /><span>ID: {staff.employee_id}</span></div>}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
