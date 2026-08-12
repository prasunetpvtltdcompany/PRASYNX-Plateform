'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { useLanguage } from '../../language/LanguageProvider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Calendar, Clock, Briefcase, Users, CheckCircle2, XCircle, AlertCircle, MoreHorizontal, Search
} from 'lucide-react';
import { toast } from 'sonner';

const TABS = ['Timetable', 'Work Assignments', 'Workload Distribution'] as const;
type TabKey = typeof TABS[number];

const TAB_TRANSLATIONS: Record<TabKey, string> = {
  Timetable: 'mod.timetable', 'Work Assignments': 'mod.workAssignments', 'Workload Distribution': 'mod.workloadDistribution',
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase();
  if (s === 'completed' || s === 'done') return <Badge variant="success">Completed</Badge>;
  if (s === 'in_progress' || s === 'in-progress' || s === 'active') return <Badge variant="info">In Progress</Badge>;
  if (s === 'pending' || s === 'assigned') return <Badge variant="warning">Pending</Badge>;
  if (s === 'cancelled' || s === 'overdue') return <Badge variant="danger">Overdue</Badge>;
  return <Badge>{status || 'Unknown'}</Badge>;
}

export function StaffScheduleManagement() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('Timetable');
  const [searchTerm, setSearchTerm] = useState('');

  const timetableHook = useApi(() => enterpriseStaffApi.getTimetableAssignments(), [], true);
  const workHook = useApi(() => enterpriseStaffApi.getWorkAssignments(), [], true);

  const loading = timetableHook.loading || workHook.loading;
  const error = timetableHook.error || workHook.error;

  const timetableRaw = timetableHook.data?.data || timetableHook.data;
  const timetableEntries = Array.isArray(timetableRaw) ? timetableRaw : [];

  const workRaw = workHook.data?.data || workHook.data;
  const workList = Array.isArray(workRaw) ? workRaw : [];

  const filteredTimetable = useMemo(() => {
    if (!searchTerm) return timetableEntries;
    const q = searchTerm.toLowerCase();
    return timetableEntries.filter((e: any) =>
      (e.teacher_name || e.teacher?.full_name || '').toLowerCase().includes(q) ||
      (e.class_name || e.class?.name || '').toLowerCase().includes(q) ||
      (e.subject_name || e.subject?.name || '').toLowerCase().includes(q)
    );
  }, [timetableEntries, searchTerm]);

  const filteredWork = useMemo(() => {
    if (!searchTerm) return workList;
    const q = searchTerm.toLowerCase();
    return workList.filter((w: any) =>
      (w.staff_name || w.staff?.full_name || '').toLowerCase().includes(q) ||
      (w.task || w.title || '').toLowerCase().includes(q)
    );
  }, [workList, searchTerm]);

  const workloadData = useMemo(() => {
    const counts: Record<string, number> = {};
    workList.forEach((w: any) => {
      const name = w.staff_name || w.staff?.full_name || w.department || 'Unassigned';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, assignments: count }));
  }, [workList]);

  if (loading) return <LoadingSkeleton rows={6} cols={4} />;
  if (error) return <ErrorState message={error} onRetry={timetableHook.refetch} />;

  return (
    <div>
      <div className="page-header">
        <h1>{t('mod.staffSchedule')}</h1>
        <p>Manage timetables, work assignments, and workload distribution</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t(TAB_TRANSLATIONS[tab])}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6D4CFF]" />
      </div>

      {activeTab === 'Timetable' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {filteredTimetable.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Teacher</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Class</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Subject</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Day</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Time</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Room</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimetable.map((entry: any, i: number) => (
                    <tr key={entry.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-[10px] font-bold">
                            {(entry.teacher_name || entry.teacher?.full_name || '?').charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-800">{entry.teacher_name || entry.teacher?.full_name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{entry.class_name || entry.class?.name || '—'}</td>
                      <td className="px-4 py-3">{entry.subject_name || entry.subject?.name ? <Badge variant="purple">{entry.subject_name || entry.subject?.name}</Badge> : '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{entry.day || entry.day_of_week ? (DAYS[entry.day_of_week] || entry.day) : '—'}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono">{entry.start_time && entry.end_time ? `${entry.start_time} - ${entry.end_time}` : '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{entry.room || entry.room_name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyState message={searchTerm ? 'No matching timetable entries' : 'No timetable assignments'} />}
        </motion.div>
      )}

      {activeTab === 'Work Assignments' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {filteredWork.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Staff</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Task</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Deadline</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWork.map((w: any, i: number) => (
                    <tr key={w.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-bold">
                            {(w.staff_name || w.staff?.full_name || '?').charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-800">{w.staff_name || w.staff?.full_name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-gray-800 font-medium">{w.task || w.title || '—'}</div>
                          {w.description && <div className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{w.description}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-gray-400" />
                          <span className="text-gray-600">{w.deadline ? new Date(w.deadline).toLocaleDateString() : '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={w.status || w.state} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => toast.success('Assignment updated')}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-green-600 transition-colors" title="Mark complete">
                            <CheckCircle2 size={14} />
                          </button>
                          <button onClick={() => toast.success('Assignment updated')}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors" title="Cancel">
                            <XCircle size={14} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors" title="More">
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyState message={searchTerm ? 'No matching assignments' : 'No work assignments'} />}
        </motion.div>
      )}

      {activeTab === 'Workload Distribution' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Assignments per Staff / Department</h3>
            <p className="text-xs text-gray-400 mb-4">Distribution of work assignments across the workforce</p>
            {workloadData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={workloadData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
                  <Bar dataKey="assignments" fill="#6D4CFF" radius={[0, 6, 6, 0]} name="Assignments" />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyState message="No workload data available" />}
          </Card>
          {workloadData.length > 0 && (
            <Card className="p-5 mt-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><Users size={16} className="text-purple-500" /> Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-[11px] text-gray-500 font-medium">Total Assignments</div>
                  <div className="text-lg font-extrabold text-gray-900">{workList.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-[11px] text-gray-500 font-medium">Active Staff</div>
                  <div className="text-lg font-extrabold text-gray-900">{workloadData.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-[11px] text-gray-500 font-medium">Avg per Person</div>
                  <div className="text-lg font-extrabold text-gray-900">{(workList.length / Math.max(workloadData.length, 1)).toFixed(1)}</div>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
