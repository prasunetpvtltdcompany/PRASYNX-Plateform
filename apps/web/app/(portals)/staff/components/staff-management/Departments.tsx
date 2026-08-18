'use client';

import { useState } from 'react';
import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Building2, Users, Target, ClipboardList, BarChart3,
  Plus, Search, UserCheck, TrendingUp, CalendarDays, Award,
  Headphones, Bus, BookOpen, Activity, Shield, Wrench, Monitor,
  School, Truck, Home, Stethoscope, Utensils, ShoppingBag
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const departmentIcons: Record<string, any> = {
  academics: BookOpen, administration: Shield, finance: Target,
  transport: Bus, library: BookOpen, medical: Stethoscope,
  hostel: Home, security: Shield, maintenance: Wrench,
  it: Monitor, admissions: School, operations: Activity,
  housekeeping: Activity, sports: Award, store: ShoppingBag,
  management: Users,
};

const departmentsList = [
  { name: 'Academics', icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
  { name: 'Administration', icon: Shield, color: 'bg-purple-50 text-purple-600' },
  { name: 'Finance', icon: Target, color: 'bg-green-50 text-green-600' },
  { name: 'Transport', icon: Bus, color: 'bg-amber-50 text-amber-600' },
  { name: 'Library', icon: BookOpen, color: 'bg-cyan-50 text-cyan-600' },
  { name: 'Medical', icon: Stethoscope, color: 'bg-red-50 text-red-600' },
  { name: 'Hostel', icon: Home, color: 'bg-pink-50 text-pink-600' },
  { name: 'Security', icon: Shield, color: 'bg-gray-50 text-gray-600' },
  { name: 'Maintenance', icon: Wrench, color: 'bg-orange-50 text-orange-600' },
  { name: 'IT', icon: Monitor, color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Admissions', icon: School, color: 'bg-teal-50 text-teal-600' },
  { name: 'Operations', icon: Activity, color: 'bg-violet-50 text-violet-600' },
  { name: 'Housekeeping', icon: Activity, color: 'bg-rose-50 text-rose-600' },
  { name: 'Sports', icon: Award, color: 'bg-lime-50 text-lime-600' },
  { name: 'Store', icon: ShoppingBag, color: 'bg-yellow-50 text-yellow-600' },
  { name: 'Management', icon: Users, color: 'bg-slate-50 text-slate-600' },
];

export function Departments() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const deptsHook = useApi(() => workforceApi.getDepartments(orgId), [orgId], !!orgId);
  const deptMembersHook = useApi(() =>
    selectedDept ? workforceApi.getDepartmentMembers(orgId, selectedDept) : Promise.resolve({ success: true, data: [] }),
    [orgId, selectedDept], !!selectedDept);
  const deptPerfHook = useApi(() =>
    selectedDept ? workforceApi.getDepartmentPerformance(orgId, selectedDept) : Promise.resolve({ success: true, data: {} }),
    [orgId, selectedDept], !!selectedDept);

  const departments = Array.isArray(deptsHook.data?.data || deptsHook.data) ? (deptsHook.data?.data || deptsHook.data) : [];
  const members = Array.isArray(deptMembersHook.data?.data || deptMembersHook.data) ? (deptMembersHook.data?.data || deptMembersHook.data) : [];
  const performance = (deptPerfHook.data?.data || deptPerfHook.data || {}) as any;

  const filteredDepts = departments.filter((d: any) =>
    d.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (name: string) => {
    const key = name?.toLowerCase();
    for (const [k, icon] of Object.entries(departmentIcons)) {
      if (key?.includes(k)) return icon;
    }
    return Building2;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Departments</h1>
        <p>Manage departments, heads, members, and track performance.</p>
      </div>

      {!selectedDept ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search departments..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400" />
            </div>
            <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
              <Plus size={14} className="mr-1" /> New Department
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {(filteredDepts.length > 0 ? filteredDepts : departmentsList).map((dept: any, i: number) => {
              const Icon = getIcon(dept.name);
              const color = departmentsList.find(d => d.name.toLowerCase() === dept.name?.toLowerCase())?.color || 'bg-gray-50 text-gray-600';
              return (
                <motion.div key={dept.id || dept.name || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedDept(dept.id || dept.name)}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
                      <Icon size={22} />
                    </div>
                    <Badge className="bg-gray-50 text-gray-600 border-gray-200 text-[9px] font-extrabold">
                      {dept.member_count || dept.total_members || 0} members
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{dept.name}</h3>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{dept.description || `${dept.name} Department`}</p>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium pt-3 border-t border-gray-50">
                    {dept.head_name && <span className="flex items-center gap-1"><UserCheck size={11} /> {dept.head_name}</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <div>
          <button onClick={() => setSelectedDept(null)}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-1">
            ← Back to Departments
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="lg:col-span-3">
              <Card className="p-5 border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold">Department Members</h3>
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200">{members.length} members</Badge>
                </div>
                {deptMembersHook.loading ? <LoadingSkeleton rows={4} cols={1} /> : (
                  <div className="space-y-3">
                    {members.map((m: any, i: number) => (
                      <div key={m.id || i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-bold">
                              {m.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{m.full_name}</div>
                            <div className="text-[11px] text-gray-400">{m.designation_name || m.role}</div>
                          </div>
                        </div>
                        <Badge className={`text-[9px] font-extrabold ${
                          m.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                        }`}>{m.status || 'Active'}</Badge>
                      </div>
                    ))}
                    {members.length === 0 && <p className="text-center text-gray-400 text-xs py-4">No members found</p>}
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="p-5 border-gray-100">
                <h3 className="text-xs font-bold uppercase text-gray-400 mb-3">Performance</h3>
                <div className="text-2xl font-black text-gray-900">{performance.avg_score || 0}%</div>
                <Progress value={performance.avg_score || 0} className="mt-2 h-1.5" />
              </Card>
              <Card className="p-5 border-gray-100">
                <h3 className="text-xs font-bold uppercase text-gray-400 mb-3">Attendance</h3>
                <div className="text-2xl font-black text-gray-900">{performance.attendance_percentage || 0}%</div>
                <Progress value={performance.attendance_percentage || 0} className="mt-2 h-1.5" />
              </Card>
              <Card className="p-5 border-gray-100">
                <h3 className="text-xs font-bold uppercase text-gray-400 mb-3">Active Tasks</h3>
                <div className="text-2xl font-black text-gray-900">{performance.active_tasks || 0}</div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
