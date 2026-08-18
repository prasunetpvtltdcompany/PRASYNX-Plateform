'use client';

import { useState } from 'react';
import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Layers, BookOpen, Building2, Trophy, CalendarDays, Briefcase,
  Target, Clock, AlertTriangle, CheckCircle2, Plus, Search, Filter,
  BarChart3, Users
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const assignmentTypes = [
  { key: 'academic', label: 'Academic', icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
  { key: 'administrative', label: 'Administrative', icon: Building2, color: 'bg-purple-50 text-purple-600' },
  { key: 'committee', label: 'Committee', icon: Users, color: 'bg-green-50 text-green-600' },
  { key: 'event', label: 'Event', icon: Trophy, color: 'bg-orange-50 text-orange-600' },
  { key: 'project', label: 'Project', icon: Briefcase, color: 'bg-pink-50 text-pink-600' },
];

export function WorkAssignments() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';
  const [activeTab, setLocalTab] = useState('all');

  const assignmentsHook = useApi(() => workforceApi.getWorkAssignments(orgId), [orgId], !!orgId);
  const workloadHook = useApi(() => workforceApi.getWorkloadDistribution(orgId), [orgId], !!orgId);

  const assignments = Array.isArray(assignmentsHook.data?.data || assignmentsHook.data) ? (assignmentsHook.data?.data || assignmentsHook.data) : [];
  const workload = (workloadHook.data?.data || workloadHook.data || {}) as any;

  const filtered = activeTab === 'all' ? assignments : assignments.filter((a: any) => a.assignment_type === activeTab);

  const getPriorityColor = (p: string) => {
    switch (p?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'active': return <Badge className="bg-green-50 text-green-700 border-green-200 text-[9px] font-extrabold">Active</Badge>;
      case 'pending': return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] font-extrabold">Pending</Badge>;
      case 'completed': return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] font-extrabold">Completed</Badge>;
      default: return <Badge className="bg-gray-50 text-gray-600 border-gray-200 text-[9px] font-extrabold">{s || 'Draft'}</Badge>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Work Assignments</h1>
        <p>Assign and manage academic, administrative, committee, event, and project work.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setLocalTab} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <TabsList className="bg-gray-100 p-1 rounded-2xl overflow-x-auto flex-nowrap">
            <TabsTrigger value="all" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">All</TabsTrigger>
            {assignmentTypes.map(t => (
              <TabsTrigger key={t.key} value={t.key} className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {assignmentTypes.map((t, i) => (
            <motion.div key={t.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <div className={`w-10 h-10 rounded-xl ${t.color} flex items-center justify-center mx-auto mb-2`}>
                <t.icon size={18} />
              </div>
              <div className="text-lg font-black">{assignments.filter((a: any) => a.assignment_type === t.key).length}</div>
              <div className="text-[11px] font-semibold text-gray-400">{t.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
            <Plus size={14} className="mr-1" /> New Assignment
          </Button>
          <div className="flex gap-2">
            <select className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold outline-none bg-white">
              <option>All Priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold outline-none bg-white">
              <option>All Status</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        {assignmentsHook.loading ? <LoadingSkeleton rows={5} cols={1} /> : (
          <div className="space-y-3">
            {filtered.map((a: any, i: number) => (
              <motion.div key={a.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      assignmentTypes.find(t => t.key === a.assignment_type)?.color || 'bg-gray-50 text-gray-500'
                    }`}>
                      {(() => {
                        const t = assignmentTypes.find(at => at.key === a.assignment_type);
                        return t ? <t.icon size={18} /> : <Layers size={18} />;
                      })()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-gray-900">{a.title || a.assignment_name}</h4>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${getPriorityColor(a.priority)}`}>
                          {a.priority || 'Medium'} Priority
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{a.description || a.details || 'No description'}</p>
                      <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium">
                        {a.department_name && <span className="flex items-center gap-1"><Building2 size={11} /> {a.department_name}</span>}
                        {a.assigned_to_name && <span className="flex items-center gap-1"><Users size={11} /> {a.assigned_to_name}</span>}
                        {a.deadline && <span className="flex items-center gap-1"><Clock size={11} /> Due: {new Date(a.deadline).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(a.status)}
                    <Button variant="outline" size="sm" className="rounded-xl text-xs h-8 border-gray-200">
                      View
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <Layers size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-400 font-semibold">No assignments found</p>
              </div>
            )}
          </div>
        )}
      </Tabs>
    </div>
  );
}
