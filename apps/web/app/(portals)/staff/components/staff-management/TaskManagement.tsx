'use client';

import { useState } from 'react';
import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  CheckSquare, Plus, Clock, AlertCircle, CheckCircle2,
  RefreshCw, Target, Flag, CalendarDays, Users, Building2,
  Filter, Search, BarChart3, Repeat, ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const priorityColors: Record<string, string> = {
  HIGH: 'text-red-600 bg-red-50 border-red-200',
  MEDIUM: 'text-amber-600 bg-amber-50 border-amber-200',
  LOW: 'text-green-600 bg-green-50 border-green-200',
};

export function TaskManagement() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';
  const [activeTab, setLocalTab] = useState('all');

  const tasksHook = useApi(() => workforceApi.getTaskManagement(orgId), [orgId], !!orgId);

  const tasks = Array.isArray(tasksHook.data?.data || tasksHook.data) ? (tasksHook.data?.data || tasksHook.data) : [];

  const filteredTasks = activeTab === 'all' ? tasks : tasks.filter((t: any) => t.status === activeTab.toUpperCase());

  const todoTasks = tasks.filter((t: any) => t.status === 'PENDING');
  const inProgressTasks = tasks.filter((t: any) => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED');

  return (
    <div>
      <div className="page-header">
        <h1>Task Management</h1>
        <p>Create, assign, and track tasks across departments and staff.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Tasks', value: tasks.length, color: 'bg-purple-50 text-purple-600' },
          { label: 'To Do', value: todoTasks.length, color: 'bg-amber-50 text-amber-600' },
          { label: 'In Progress', value: inProgressTasks.length, color: 'bg-blue-50 text-blue-600' },
          { label: 'Completed', value: completedTasks.length, color: 'bg-green-50 text-green-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <CheckSquare size={18} />
            </div>
            <div className="text-2xl font-black text-gray-900">{stat.value}</div>
            <div className="text-[11px] font-semibold text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'in_progress', 'completed'].map(tab => (
            <button key={tab} onClick={() => setLocalTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {tab === 'pending' ? 'To Do' : tab === 'in_progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
          <Plus size={14} className="mr-1" /> New Task
        </Button>
      </div>

      {tasksHook.loading ? <LoadingSkeleton rows={5} cols={1} /> : (
        <div className="space-y-3">
          {filteredTasks.map((t: any, i: number) => (
            <motion.div key={t.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-gray-900">{t.title}</h4>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${priorityColors[t.priority] || priorityColors.MEDIUM}`}>
                      {t.priority || 'MEDIUM'}
                    </span>
                    <Badge className={`text-[9px] font-extrabold ${
                      t.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                      t.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>{t.status || 'PENDING'}</Badge>
                  </div>
                  {t.description && <p className="text-xs text-gray-500 mb-2">{t.description}</p>}
                  <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium">
                    {t.department_name && <span className="flex items-center gap-1"><Building2 size={11} /> {t.department_name}</span>}
                    {t.assigned_to_name && <span className="flex items-center gap-1"><Users size={11} /> {t.assigned_to_name}</span>}
                    {t.deadline && <span className="flex items-center gap-1"><Clock size={11} /> Due: {new Date(t.deadline).toLocaleDateString()}</span>}
                    {t.is_recurring && <span className="flex items-center gap-1"><Repeat size={11} /> Recurring</span>}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" className="rounded-xl text-xs h-8 border-gray-200">Edit</Button>
                  <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs h-8">
                    <ArrowRight size={12} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="text-center py-16">
              <CheckSquare size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400 font-semibold">No tasks found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
