'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  BookOpen, Plus, Search, Filter, Calendar, Users, GraduationCap,
  CheckCircle2, X, Trash2, School, ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';

function KpiCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mb-2" style={{ background: bg, color }}><Icon size={18} /></div>
      <div className="text-[11px] text-gray-500 font-medium">{label}</div>
      <div className="text-xl font-extrabold text-gray-900 mt-0.5">{value ?? '—'}</div>
    </motion.div>
  );
}

export function WorkforceAcademicAssignments() {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const academic = useApi(() => enterpriseStaffApi.getAcademicAssignments(), []);
  const directory = useApi(() => enterpriseStaffApi.getStaffDirectory(), []);

  const list = useMemo(() => {
    let items = Array.isArray(academic.data?.data) ? academic.data.data : Array.isArray(academic.data) ? academic.data : [];
    if (search) items = items.filter((a: any) =>
      (a.subject_name || a.subject || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.class_name || a.class || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.teacher_name || '').toLowerCase().includes(search.toLowerCase())
    );
    if (subjectFilter) items = items.filter((a: any) => (a.subject_name || a.subject) === subjectFilter);
    return items;
  }, [academic.data, search, subjectFilter]);

  const staffList = useMemo(() => {
    const raw = directory.data?.data || directory.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [directory.data]);

  const subjects = useMemo(() => {
    const set = new Set<string>();
    list.forEach((a: any) => { const s = a.subject_name || a.subject; if (s) set.add(s); });
    return Array.from(set);
  }, [list]);

  const stats = {
    total: list.filter((a: any) => a.assignment_type === 'class_teacher' || a.type === 'class_teacher').length,
    subject: list.filter((a: any) => a.assignment_type === 'subject' || a.type === 'subject').length,
    teachers: new Set(list.map((a: any) => a.teacher_id || a.staff_id)).size,
  };

  const handleCreate = async () => {
    try {
      const res = await enterpriseStaffApi.createAcademicAssignment(formData);
      if (res.success) { toast.success('Academic assignment created'); setShowCreate(false); setFormData({}); academic.refetch(); }
      else toast.error(res.error || 'Failed to create');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (type: string, id: string) => {
    try {
      const res = await enterpriseStaffApi.deleteWorkAssignment(id);
      if (res.success) { toast.success('Assignment removed'); academic.refetch(); }
      else toast.error(res.error || 'Failed to remove');
    } catch (err: any) { toast.error(err.message); }
  };

  if (academic.loading) return <LoadingSkeleton rows={4} cols={4} />;
  if (academic.error) return <ErrorState message={academic.error} onRetry={academic.refetch} />;

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <h1>Academic Assignments</h1>
        <p>Assign teachers to classes, subjects, and sections</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={GraduationCap} label="Class Teachers" value={stats.total} color="#6D4CFF" bg="#F0EDFF" />
        <KpiCard icon={BookOpen} label="Subject Assignments" value={stats.subject} color="#10B981" bg="#ECFDF5" />
        <KpiCard icon={Users} label="Teachers Assigned" value={stats.teachers} color="#3B82F6" bg="#EFF6FF" />
        <KpiCard icon={School} label="Total Assignments" value={list.length} color="#F59E0B" bg="#FFFBEB" />
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by class, subject, teacher..." className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs w-56 focus:outline-none focus:border-[#6D4CFF]" />
            </div>
            <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-xs">
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all"><Plus size={14} /> Create Assignment</button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50/80">
                {['Teacher', 'Class', 'Subject', 'Section', 'Type', 'Status', 'Actions'].map(h =>
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12"><EmptyState message="No academic assignments found" /></td></tr>
              ) : list.map((item: any, i: number) => (
                <tr key={item.id || i} className={`border-t border-gray-50 hover:bg-[#6D4CFF]/[0.02] transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-4 py-3 font-semibold text-gray-900">{item.teacher_name || item.staff_name || '—'}</td>
                  <td className="px-4 py-3">{item.class_name || item.class || '—'}</td>
                  <td className="px-4 py-3">{item.subject_name || item.subject || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{item.section || '—'}</td>
                  <td className="px-4 py-3"><Badge variant="info" className="text-[9px]">{item.assignment_type || item.type || 'Subject'}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={(item.status || 'active').toLowerCase() === 'active' ? 'success' : 'warning'} className="text-[9px]">{item.status || 'Active'}</Badge></td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(item.assignment_type || item.type, item.id)} className="text-[10px] text-gray-400 hover:text-red-500 flex items-center gap-1"><Trash2 size={12} /> Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-sm">Create Academic Assignment</h3>
              <button onClick={() => setShowCreate(false)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Teacher</label>
                <select value={formData.teacher_id || formData.staff_id || ''} onChange={e => setFormData({ ...formData, staff_id: e.target.value, teacher_id: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs">
                  <option value="">Select teacher</option>
                  {staffList.filter((s: any) => s.role === 'teacher' || s.designation?.toLowerCase().includes('teacher')).map((s: any) => (
                    <option key={s.id} value={s.id}>{s.full_name || s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Class</label><input value={formData.class_name || ''} onChange={e => setFormData({ ...formData, class_name: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs" /></div>
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Section</label><input value={formData.section || ''} onChange={e => setFormData({ ...formData, section: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs" /></div>
              </div>
              <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Subject</label><input value={formData.subject_name || ''} onChange={e => setFormData({ ...formData, subject_name: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs" /></div>
              <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Assignment Type</label>
                <select value={formData.assignment_type || ''} onChange={e => setFormData({ ...formData, assignment_type: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs">
                  <option value="">Select</option>
                  <option value="class_teacher">Class Teacher</option>
                  <option value="subject">Subject Teacher</option>
                  <option value="assistant">Assistant Teacher</option>
                </select>
              </div>
              <button onClick={handleCreate} className="w-full py-2.5 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all">Create Assignment</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
