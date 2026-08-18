'use client';

import { useState } from 'react';
import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, UserCheck, UserX, UserPlus, Building2, Clock, AlertCircle,
  Plus, Upload, Download, ShieldCheck, Layers, GraduationCap,
  Mail, Phone, MapPin, Search, Filter, ChevronDown, MoreHorizontal,
  Briefcase, BadgeCheck, CalendarDays, TrendingUp, ArrowUpRight,
  Star, Target, Award, Sparkles, Activity as ZapIcon
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export function StaffDirectory({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const statsHook = useApi(() => workforceApi.getStaffStats(orgId), [orgId], !!orgId);
  const directoryHook = useApi(() => workforceApi.getStaffDirectory(orgId), [orgId], !!orgId);
  const deptsHook = useApi(() => workforceApi.getDepartments(orgId), [orgId], !!orgId);

  const stats = (statsHook.data?.data || statsHook.data || {}) as any;
  const staffList = Array.isArray(directoryHook.data?.data || directoryHook.data) ? (directoryHook.data?.data || directoryHook.data) : [];
  const departments = Array.isArray(deptsHook.data?.data || deptsHook.data) ? (deptsHook.data?.data || deptsHook.data) : [];

  const filteredStaff = staffList.filter((s: any) => {
    const matchesSearch = !searchQuery || s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) || s.employee_code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || s.department_id === selectedDepartment || s.department_name === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const getInitials = (name: string) =>
    name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'S';

  const statCards = [
    { label: 'Total Staff', value: stats.total_staff || 0, icon: Users, color: 'bg-purple-50 text-purple-600' },
    { label: 'Teaching', value: stats.teaching_staff || 0, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
    { label: 'Non-Teaching', value: stats.non_teaching_staff || 0, icon: Briefcase, color: 'bg-orange-50 text-orange-600' },
    { label: 'Active', value: stats.active_staff || 0, icon: BadgeCheck, color: 'bg-green-50 text-green-600' },
    { label: 'On Leave', value: stats.on_leave || 0, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'New Joiners', value: stats.new_joiners || 0, icon: UserPlus, color: 'bg-cyan-50 text-cyan-600' },
    { label: 'Departments', value: stats.total_departments || departments.length || 0, icon: Building2, color: 'bg-pink-50 text-pink-600' },
  ];

  const quickActions = [
    { label: 'Add Staff', icon: Plus, color: 'bg-purple-500', action: () => toast.info('Add Staff form opening...') },
    { label: 'Import', icon: Upload, color: 'bg-blue-500', action: () => toast.info('Import Staff dialog...') },
    { label: 'Export', icon: Download, color: 'bg-green-500', action: () => toast.info('Exporting staff data...') },
    { label: 'Assign Work', icon: Layers, color: 'bg-orange-500', action: () => setActiveTab('work-assignments') },
    { label: 'Assign Role', icon: ShieldCheck, color: 'bg-pink-500', action: () => setActiveTab('roles-permissions') },
    { label: 'Assign Dept', icon: Building2, color: 'bg-cyan-500', action: () => setActiveTab('departments') },
    { label: 'Assign Classes', icon: GraduationCap, color: 'bg-indigo-500', action: () => setActiveTab('academic-assignments') },
    { label: 'Assign Subjects', icon: BookOpen, color: 'bg-teal-500', action: () => setActiveTab('academic-assignments') },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Staff Directory</h1>
        <p>Complete workforce directory for your organization — manage, filter, and take quick actions.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={18} />
            </div>
            <div className="text-2xl font-black text-gray-900">{stat.value}</div>
            <div className="text-[11px] font-semibold text-gray-400 mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <ZapIcon size={16} className="text-purple-500" /> Quick Actions
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button key={action.label} onClick={action.action}
              className="flex items-center gap-1.5 text-xs font-bold rounded-xl h-9 px-4 text-white shadow-sm hover:shadow-md transition-all"
              style={{ background: action.color }}>
              <action.icon size={14} /> {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name, email, or employee code..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" />
          </div>
          <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 outline-none focus:border-purple-400 bg-white">
            <option value="all">All Departments</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id || d.name}>{d.name}</option>
            ))}
          </select>
          <Button className="bg-purple-50 text-purple-600 hover:bg-purple-100 border-0 rounded-xl text-xs font-bold">
            <Filter size={14} className="mr-1" /> Filters
          </Button>
        </div>
      </div>

      {/* Staff Grid */}
      {directoryHook.loading ? <LoadingSkeleton rows={6} cols={4} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredStaff.map((staff: any, i: number) => (
            <motion.div key={staff.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 ring-2 ring-purple-100">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-700 text-white text-sm font-bold">
                      {getInitials(staff.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{staff.full_name}</div>
                    <div className="text-[11px] font-medium text-gray-400">{staff.designation_name || staff.role || 'Staff'}</div>
                  </div>
                </div>
                <Badge className={`text-[9px] font-extrabold uppercase ${
                  staff.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                  staff.status === 'on_leave' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}>{staff.status === 'active' ? 'Active' : staff.status === 'on_leave' ? 'On Leave' : 'Inactive'}</Badge>
              </div>
              <div className="space-y-1.5 mb-4">
                {staff.email && <div className="flex items-center gap-2 text-[11px] text-gray-500"><Mail size={12} /> {staff.email}</div>}
                {staff.phone && <div className="flex items-center gap-2 text-[11px] text-gray-500"><Phone size={12} /> {staff.phone}</div>}
                {staff.department_name && <div className="flex items-center gap-2 text-[11px] text-gray-500"><Building2 size={12} /> {staff.department_name}</div>}
                {staff.employee_code && <div className="flex items-center gap-2 text-[11px] text-gray-500"><BadgeCheck size={12} /> {staff.employee_code}</div>}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="text-[10px] text-gray-400 font-medium">
                  Joined: {staff.joined_at ? new Date(staff.joined_at).toLocaleDateString() : '—'}
                </div>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </motion.div>
          ))}
          {filteredStaff.length === 0 && !directoryHook.loading && (
            <div className="col-span-full py-16 text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400 font-semibold">No staff members found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
