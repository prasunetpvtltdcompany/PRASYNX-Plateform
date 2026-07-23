'use client';

import { useState } from 'react';
import { useApi } from './useApi';
import { homeworkApiV4, classApi, subjectApi } from './dataService';
import { BookOpen, Plus, Edit3, Trash2, CheckCircle, X, Search, RefreshCw, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

function DataTable({ columns, data, loading }: any) {
  if (loading) return <div className="text-center py-8 text-gray-400 text-xs">Loading...</div>;
  if (!data?.length) return <div className="text-center py-8 text-gray-400 text-xs">No records found</div>;
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {columns.map((col: any) => (<th key={col.key} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{col.label}</th>))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, i: number) => (
            <tr key={row.id || i} className="border-b border-gray-50 hover:bg-gray-50/50">
              {columns.map((col: any) => (<td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">{col.render ? col.render(row) : row[col.key] ?? '-'}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CLR = { primary: '#6D4CFF' };

export default function HomeworkTab() {
  const [search, setSearch] = useState('');
  const [viewId, setViewId] = useState<string | null>(null);

  const homework = useApi(() => homeworkApiV4.list(), []);
  const submissions = useApi(() => viewId ? homeworkApiV4.getSubmissions(viewId) : Promise.resolve({ success: true, data: [] }), [viewId]);
  const classes = useApi(() => classApi.getAll(), []);
  const subjects = useApi(() => subjectApi.getAll(), []);

  const filter = (arr: any[]) => {
    if (!search) return arr;
    const q = search.toLowerCase();
    return arr.filter((r: any) => JSON.stringify(r).toLowerCase().includes(q));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Homework Management</h2>
          <p className="text-xs text-gray-500">Create, assign, and grade homework</p>
        </div>
        <button onClick={() => { homework.refetch(); submissions.refetch(); }} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><RefreshCw size={16} /></button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <DataTable
            columns={[
              { key: 'title', label: 'Title' },
              { key: 'class', label: 'Class', render: (r: any) => r.class?.name || '-' },
              { key: 'subject', label: 'Subject', render: (r: any) => r.subject?.name || '-' },
              { key: 'due_date', label: 'Due', render: (r: any) => r.due_date ? new Date(r.due_date).toLocaleDateString() : '-' },
              { key: 'status', label: 'Status', render: (r: any) => <Badge className={r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>{r.status}</Badge> },
              { key: 'actions', label: '', render: (r: any) => (
                <div className="flex gap-1">
                  <button onClick={() => setViewId(viewId === r.id ? null : r.id)} className={`p-1.5 rounded-lg ${viewId === r.id ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-gray-500'}`}><Eye size={14} /></button>
                  <button onClick={async () => { if (confirm('Delete?')) { await homeworkApiV4.delete(r.id); homework.refetch(); toast.success('Deleted'); } }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
                </div>
              )},
            ]}
            data={filter(homework.data || [])}
            loading={homework.loading}
          />
        </div>

        <div className="border border-gray-100 rounded-xl p-4">
          <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2">
            <CheckCircle size={14} className="text-green-500" />
            Submissions {viewId ? `#${viewId.slice(0, 8)}` : '(select a homework)'}
          </h3>
          {!viewId ? (
            <p className="text-xs text-gray-400">Click the eye icon on a homework to view its submissions</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {submissions.loading ? <p className="text-xs text-gray-400">Loading...</p> : null}
              {!submissions.loading && !submissions.data?.length ? <p className="text-xs text-gray-400">No submissions yet</p> : null}
              {submissions.data?.map((s: any) => (
                <div key={s.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700">{s.student?.full_name || 'Unknown'}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      s.status === 'graded' ? 'bg-green-100 text-green-700' :
                      s.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>{s.status}</span>
                  </div>
                  {s.score != null && <div className="text-xs text-gray-500">Score: {s.score}</div>}
                  {s.submission_text && <div className="text-[10px] text-gray-400 mt-1 line-clamp-2">{s.submission_text}</div>}
                  <div className="text-[10px] text-gray-400 mt-1">{s.submitted_at ? new Date(s.submitted_at).toLocaleString() : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
