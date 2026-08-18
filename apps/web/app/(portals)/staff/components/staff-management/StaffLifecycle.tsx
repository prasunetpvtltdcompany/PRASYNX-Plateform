'use client';

import { useState } from 'react';
import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  UserPlus, UserCheck, Briefcase, TrendingUp,
  ArrowUpRight, Repeat, UserX, Users, Clock,
  CheckCircle2, AlertCircle, Search, Filter, Plus, CalendarDays
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const lifecycleStages = [
  { key: 'recruitment', label: 'Recruitment', icon: UserPlus, color: 'bg-blue-50 text-blue-600' },
  { key: 'onboarding', label: 'Onboarding', icon: UserCheck, color: 'bg-green-50 text-green-600' },
  { key: 'active', label: 'Active', icon: Briefcase, color: 'bg-purple-50 text-purple-600' },
  { key: 'performance', label: 'Reviews', icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
  { key: 'promotion', label: 'Promotions', icon: ArrowUpRight, color: 'bg-cyan-50 text-cyan-600' },
  { key: 'transfer', label: 'Transfers', icon: Repeat, color: 'bg-pink-50 text-pink-600' },
  { key: 'exit', label: 'Exits', icon: UserX, color: 'bg-red-50 text-red-600' },
  { key: 'alumni', label: 'Alumni', icon: Users, color: 'bg-gray-50 text-gray-600' },
];

export function StaffLifecycle() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';
  const [activeTab, setLocalTab] = useState('recruitment');

  const lifecycleHook = useApi(() => workforceApi.getStaffLifecycle(orgId), [orgId], !!orgId);
  const recruitmentHook = useApi(() => workforceApi.getRecruitment(orgId), [orgId], !!orgId);
  const exitsHook = useApi(() => workforceApi.getExitManagement(orgId), [orgId], !!orgId);
  const alumniHook = useApi(() => workforceApi.getAlumniRecords(orgId), [orgId], !!orgId);

  const lifecycle = (lifecycleHook.data?.data || lifecycleHook.data || {}) as any;
  const recruitment = Array.isArray(recruitmentHook.data?.data || recruitmentHook.data) ? (recruitmentHook.data?.data || recruitmentHook.data) : [];
  const exits = Array.isArray(exitsHook.data?.data || exitsHook.data) ? (exitsHook.data?.data || exitsHook.data) : [];
  const alumni = Array.isArray(alumniHook.data?.data || alumniHook.data) ? (alumniHook.data?.data || alumniHook.data) : [];

  return (
    <div>
      <div className="page-header">
        <h1>Staff Lifecycle</h1>
        <p>Complete staff journey from recruitment through exit and alumni management.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        {lifecycleStages.map((stage, i) => (
          <motion.div key={stage.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            onClick={() => setLocalTab(stage.key)}
            className={`bg-white rounded-2xl border p-4 text-center hover:shadow-lg transition-all cursor-pointer ${
              activeTab === stage.key ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-100'
            }`}>
            <div className={`w-10 h-10 rounded-xl ${stage.color} flex items-center justify-center mx-auto mb-2`}>
              <stage.icon size={18} />
            </div>
            <div className="text-lg font-black">{lifecycle[stage.key] || 0}</div>
            <div className="text-[9px] font-semibold text-gray-400">{stage.label}</div>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setLocalTab} className="space-y-6">
        <TabsContent value="recruitment">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800">Recruitment Pipeline</h3>
            <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
              <Plus size={14} className="mr-1" /> New Position
            </Button>
          </div>
          {recruitmentHook.loading ? <LoadingSkeleton rows={3} cols={1} /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recruitment.map((r: any, i: number) => (
                <motion.div key={r.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <UserPlus size={18} />
                    </div>
                    <Badge className={`text-[9px] font-extrabold ${
                      r.status === 'OPEN' ? 'bg-green-50 text-green-700' : r.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'
                    }`}>{r.status || 'OPEN'}</Badge>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">{r.title || r.position}</h4>
                  <p className="text-xs text-gray-500 mb-3">{r.department_name}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{r.applicants || 0} applicants</span>
                    <span>Open since: {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</span>
                  </div>
                </motion.div>
              ))}
              {recruitment.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <UserPlus size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-semibold">No active recruitment</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="exit">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Exit Management</h3>
          {exitsHook.loading ? <LoadingSkeleton rows={3} cols={1} /> : (
            <div className="space-y-3">
              {exits.map((e: any, i: number) => (
                <motion.div key={e.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                        <UserX size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{e.full_name || e.staff_name}</h4>
                        <p className="text-xs text-gray-500">{e.designation_name} • {e.department_name}</p>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1">
                          <span>Exit: {e.exit_date ? new Date(e.exit_date).toLocaleDateString() : ''}</span>
                          {e.reason && <span>Reason: {e.reason}</span>}
                        </div>
                      </div>
                    </div>
                    <Badge className={`text-[9px] font-extrabold ${
                      e.exit_type === 'voluntary' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                    }`}>{e.exit_type || 'Voluntary'}</Badge>
                  </div>
                </motion.div>
              ))}
              {exits.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <UserX size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-semibold">No exit records</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alumni">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Alumni Records</h3>
          {alumniHook.loading ? <LoadingSkeleton rows={3} cols={1} /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {alumni.map((a: any, i: number) => (
                <motion.div key={a.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
                      {a.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{a.full_name}</h4>
                      <p className="text-xs text-gray-400">{a.last_designation || a.designation_name}</p>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400">
                    <span>Served: {a.start_date ? new Date(a.start_date).toLocaleDateString() : ''} - {a.end_date ? new Date(a.end_date).toLocaleDateString() : ''}</span>
                  </div>
                </motion.div>
              ))}
              {alumni.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <Users size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-semibold">No alumni records</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {lifecycleStages.slice(3, 6).map(stage => (
          <TabsContent key={stage.key} value={stage.key}>
            <Card className="p-5 border-gray-100">
              <div className="text-center py-12 text-gray-400">
                <stage.icon size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-semibold capitalize">{stage.label} management</p>
              </div>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="active">
          <Card className="p-5 border-gray-100">
            <div className="text-center py-12 text-gray-400">
              <Briefcase size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-semibold">Active staff records - See Staff Directory</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
