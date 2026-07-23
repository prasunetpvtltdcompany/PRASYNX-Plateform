'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  CheckCircle2, Plus, Search, Filter, Calendar, Clock, Users,
  AlertCircle, X, Trash2, Edit3, ChevronDown, Flag, ListTodo,
} from 'lucide-react';
import { toast } from 'sonner';

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-green-100 text-green-700',
};

const STATUS_COLORS: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function KpiCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mb-2" style={{ background: bg, color }}><Icon size={18} /></div>
      <div className="text-[11px] text-gray-500 font-medium">{label}</div>
      <div className="text-xl font-extrabold text-gray-900 mt-0.5">{value ?? '—'}</div>
    </motion.div>
  );
}

export function WorkforceTaskManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const tasks = useApi(() => enterpriseStaffApi.getTaskManagement(), []);
  const directory = useApi(() => enterpriseStaffApi.getStaffDirectory(), []);

  const list = useMemo(() => {
    let items = Array.isArray(tasks.data?.data) ? tasks.data.data : Array.isArray(tasks.data) ? tasks.data : [];
    if (search) items = items.filter((t: any) =>
      (t.title || t.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.assigned_to_name || '').toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter) items = items.filter((t: any) => (t.status || 'todo').toLowerCase() === statusFilter.toLowerCase());
    if (priorityFilter) items = items.filter((t: any) => (t.priority || 'medium').toLowerCase() === priorityFilter.toLowerCase());
    return items;
  }, [tasks.data, search, statusFilter, priorityFilter]);

  const staffList = useMemo(() => {
    const raw = directory.data?.data || directory.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [directory.data]);

  const stats = {
    total: list.length,
    todo: list.filter((t: any) => (t.status || 'todo').toLowerCase() === 'todo').length,
    inProgress: list.filter((t: any) => (t.status || '').toLowerCase() === 'in_progress').length,
    completed: list.filter((t: any) => (t.status || '').toLowerCase() === 'completed').length,
  };

  const handleCreate = async () => {
    try {
      const res = await enterpriseStaffApi.createTask(formData);
      if (res.success) { toast.success('Task created'); setShowCreate(false); setFormData({}); tasks.refetch(); }
      else toast.error(res.error || 'Failed to create');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      const res = await enterpriseStaffApi.updateTask(id, data);
      if (res.success) { toast.success('Task updated'); tasks.refetch(); }
      else toast.error(res.error || 'Update failed');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await enterpriseStaffApi.deleteTask(id);
      if (res.success) { toast.success('Task deleted'); tasks.refetch(); }
      else toast.error(res.error || 'Delete failed');
    } catch (err: any) { toast.error(err.message); }
  };

  if (tasks.loading) return <LoadingSkeleton rows={4} cols={4} />;
  if (tasks.error) return <ErrorState message={tasks.error} onRetry={tasks.refetch} />;

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <h1>Task Management</h1>
        <p>Create, assign, and track staff tasks across the organization</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={ListTodo} label="Total Tasks" value={stats.total} color="#6D4CFF" bg="#F0EDFF" />
        <KpiCard icon={Clock} label="To Do" value={stats.todo} color="#F59E0B" bg="#FFFBEB" />
        <KpiCard icon={AlertCircle} label="In Progress" value={stats.inProgress} color="#3B82F6" bg="#EFF6FF" />
        <KpiCard icon={CheckCircle2} label="Completed" value={stats.completed} color="#10B981" bg="#ECFDF5" />
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs w-48 focus:outline-none focus:border-[#6D4CFF]" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-xs">
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-xs">
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all"><Plus size={14} /> Create Task</button>
        </div>
      </Card>

      <div className="space-y-3">
        {list.length === 0 ? (
          <EmptyState message="No tasks found" />
        ) : list.map((task: any, i: number) => (
          <motion.div key={task.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
            className="rounded-xl p-4 border border-gray-100 bg-white hover:shadow-md transition-all flex items-start gap-4">
            <button onClick={() => handleUpdate(task.id, { status: (task.status || 'todo') === 'completed' ? 'todo' : 'completed' })}
              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${(task.status || '').toLowerCase() === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-[#6D4CFF]'}`}>
              {(task.status || '').toLowerCase() === 'completed' && <CheckCircle2 size={12} />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className={`text-sm font-semibold ${(task.status || '').toLowerCase() === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title || task.name || 'Untitled Task'}</div>
                  {task.description && <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{task.description}</div>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${PRIORITY_COLORS[task.priority?.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>{task.priority || 'Medium'}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${STATUS_COLORS[task.status?.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>{task.status || 'To Do'}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-400">
                {task.assigned_to_name && <span className="flex items-center gap-1"><Users size={12} /> {task.assigned_to_name}</span>}
                {task.due_date && <span className="flex items-center gap-1"><Calendar size={12} /> Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                {task.created_at && <span className="flex items-center gap-1"><Clock size={12} /> {new Date(task.created_at).toLocaleDateString()}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => handleUpdate(task.id, { status: task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : 'todo' })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]" title="Advance status"><ChevronDown size={14} /></button>
              <button onClick={() => handleDelete(task.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="font-bold text-sm">Create Task</h3>
                <button onClick={() => setShowCreate(false)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg">×</button>
              </div>
              <div className="p-5 space-y-4">
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Title</label><input value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF]" /></div>
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Description</label><textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Priority</label>
                    <select value={formData.priority || 'medium'} onChange={e => setFormData({ ...formData, priority: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs">
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                    </select>
                  </div>
                  <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Due Date</label><input type="date" value={formData.due_date || ''} onChange={e => setFormData({ ...formData, due_date: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs" /></div>
                </div>
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Assign To</label>
                  <select value={formData.assigned_to || ''} onChange={e => setFormData({ ...formData, assigned_to: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs">
                    <option value="">Select staff</option>
                    {staffList.map((s: any) => <option key={s.id} value={s.id}>{s.full_name || s.name}</option>)}
                  </select>
                </div>
                <button onClick={handleCreate} className="w-full py-2.5 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all">Create Task</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
