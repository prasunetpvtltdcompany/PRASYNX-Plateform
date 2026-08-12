'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Briefcase, Plus, Search, Filter, Calendar, Clock, Users,
  CheckCircle2, AlertCircle, X, Trash2, Edit3, ChevronDown,
  BookOpen, Building2, Trophy, Target, FileText,
} from 'lucide-react';
import { toast } from 'sonner';

const ASSIGNMENT_TYPES = [
  'Class', 'Subject', 'Section', 'Committee', 'Event', 'Project', 'Responsibility', 'Task', 'Deadline',
];

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
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

export function WorkforceWorkAssignments() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const assignments = useApi(() => enterpriseStaffApi.getWorkAssignments(), []);
  const directory = useApi(() => enterpriseStaffApi.getStaffDirectory(), []);
  const workload = useApi(() => enterpriseStaffApi.getWorkloadDistribution(), []);

  const list = useMemo(() => {
    let items = Array.isArray(assignments.data?.data) ? assignments.data.data : Array.isArray(assignments.data) ? assignments.data : [];
    if (search) items = items.filter((a: any) =>
      (a.title || a.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.assigned_to_name || '').toLowerCase().includes(search.toLowerCase())
    );
    if (typeFilter) items = items.filter((a: any) => (a.assignment_type || a.type) === typeFilter);
    if (statusFilter) items = items.filter((a: any) => (a.status || '').toLowerCase() === statusFilter.toLowerCase());
    return items;
  }, [assignments.data, search, typeFilter, statusFilter]);

  const staffList = useMemo(() => {
    const raw = directory.data?.data || directory.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [directory.data]);

  const wl = workload.data?.data || workload.data || {};
  const totalAssignments = wl.total_assignments ?? wl.total ?? list.length;
  const activeAssignments = list.filter((a: any) => (a.status || '').toLowerCase() === 'active').length;

  const handleCreate = async () => {
    try {
      const res = await enterpriseStaffApi.createWorkAssignment(formData);
      if (res.success) { toast.success('Assignment created'); setShowCreate(false); setFormData({}); assignments.refetch(); workload.refetch(); }
      else toast.error(res.error || 'Failed to create');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await enterpriseStaffApi.deleteWorkAssignment(id);
      if (res.success) { toast.success('Assignment deleted'); assignments.refetch(); workload.refetch(); }
      else toast.error(res.error || 'Failed to delete');
    } catch (err: any) { toast.error(err.message); }
  };

  if (assignments.loading) return <LoadingSkeleton rows={4} cols={4} />;
  if (assignments.error) return <ErrorState message={assignments.error} onRetry={assignments.refetch} />;

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <h1>Work Assignments</h1>
        <p>Manage staff assignments — classes, subjects, committees, events, and more</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={Briefcase} label="Total Assignments" value={totalAssignments} color="#6D4CFF" bg="#F0EDFF" />
        <KpiCard icon={CheckCircle2} label="Active" value={activeAssignments} color="#10B981" bg="#ECFDF5" />
        <KpiCard icon={Users} label="Assigned Staff" value={new Set(list.map((a: any) => a.assigned_to || a.staff_id)).size} color="#3B82F6" bg="#EFF6FF" />
        <KpiCard icon={Calendar} label="Due This Week" value={list.filter((a: any) => a.deadline && new Date(a.deadline) <= new Date(Date.now() + 7 * 86400000) && new Date(a.deadline) >= new Date()).length} color="#F59E0B" bg="#FFFBEB" />
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assignments..." className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs w-48 focus:outline-none focus:border-[#6D4CFF]" />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-xs">
              <option value="">All Types</option>
              {ASSIGNMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-xs">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all"><Plus size={14} /> Create Assignment</button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.length === 0 ? (
          <div className="lg:col-span-2 xl:col-span-3"><EmptyState message="No work assignments found" /></div>
        ) : list.map((item: any, i: number) => (
          <motion.div key={item.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="rounded-xl p-4 border border-gray-100 bg-white hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F0EDFF] text-[#6D4CFF]">
                  {item.assignment_type === 'Class' || item.type === 'Class' ? <BookOpen size={14} /> :
                   item.assignment_type === 'Event' || item.type === 'Event' ? <Trophy size={14} /> :
                   item.assignment_type === 'Project' || item.type === 'Project' ? <Target size={14} /> :
                   <Briefcase size={14} />}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">{item.title || item.name || 'Assignment'}</div>
                  <div className="text-[9px] text-gray-400">{item.assignment_type || item.type || 'General'}</div>
                </div>
              </div>
              <Badge variant={(item.status || '').toLowerCase() === 'active' ? 'success' : (item.status || '').toLowerCase() === 'completed' ? 'info' : 'warning'} className="text-[9px]">{item.status || 'Pending'}</Badge>
            </div>
            <div className="space-y-1.5 mt-3 text-[10px] text-gray-500">
              <div className="flex items-center gap-2"><Users size={12} /> {item.assigned_to_name || 'Unassigned'}</div>
              {item.deadline && <div className="flex items-center gap-2"><Calendar size={12} /> Due: {new Date(item.deadline).toLocaleDateString()}</div>}
              {item.description && <div className="text-gray-400 line-clamp-2 mt-1">{item.description}</div>}
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
              <button onClick={() => toast.info('Edit assignment')} className="text-[10px] text-gray-400 hover:text-[#6D4CFF] flex items-center gap-1"><Edit3 size={12} /> Edit</button>
              <button onClick={() => handleDelete(item.id)} className="text-[10px] text-gray-400 hover:text-red-500 flex items-center gap-1"><Trash2 size={12} /> Delete</button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="font-bold text-sm">Create Work Assignment</h3>
                <button onClick={() => setShowCreate(false)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg">×</button>
              </div>
              <div className="p-5 space-y-4">
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Title</label><input value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF]" /></div>
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Assignment Type</label>
                  <select value={formData.assignment_type || ''} onChange={e => setFormData({ ...formData, assignment_type: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs">
                    <option value="">Select type</option>
                    {ASSIGNMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Assign To</label>
                  <select value={formData.assigned_to || ''} onChange={e => setFormData({ ...formData, assigned_to: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs">
                    <option value="">Select staff</option>
                    {staffList.map((s: any) => <option key={s.id} value={s.id}>{s.full_name || s.name}</option>)}
                  </select>
                </div>
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Deadline</label><input type="date" value={formData.deadline || ''} onChange={e => setFormData({ ...formData, deadline: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF]" /></div>
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Description</label><textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF]" /></div>
                <button onClick={handleCreate} className="w-full py-2.5 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all">Create Assignment</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
