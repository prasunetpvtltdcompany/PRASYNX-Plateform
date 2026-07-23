'use client';

import { useState } from 'react';
import { useApi } from './useApi';
import { promotionApiV4, classApi } from './dataService';
import { GraduationCap, Search, RefreshCw, ArrowUpRight } from 'lucide-react';
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

export default function PromotionTab() {
  const [search, setSearch] = useState('');
  const [promoteIds, setPromoteIds] = useState<string>('');

  const history = useApi(() => promotionApiV4.getHistory(), []);
  const report = useApi(() => promotionApiV4.getReport(), []);
  const classes = useApi(() => classApi.getAll(), []);

  const filter = (arr: any[]) => {
    if (!search) return arr;
    const q = search.toLowerCase();
    return arr.filter((r: any) => JSON.stringify(r).toLowerCase().includes(q));
  };

  const handleBulkPromote = async () => {
    const ids = promoteIds.split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.length) { toast.error('Enter at least one student ID'); return; }
    const fromId = prompt('From Class ID:');
    if (!fromId) return;
    const toId = prompt('To Class ID:');
    if (!toId) return;
    const yearId = prompt('Academic Year ID (optional):');
    await promotionApiV4.promoteStudents({ from_class_id: fromId, to_class_id: toId, student_ids: ids, academic_year_id: yearId || undefined });
    toast.success(`${ids.length} students promoted`);
    history.refetch();
    report.refetch();
    setPromoteIds('');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Promotion Management</h2>
          <p className="text-xs text-gray-500">Promote students and track promotion history</p>
        </div>
        <button onClick={() => { history.refetch(); report.refetch(); }} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><RefreshCw size={16} /></button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
          <div className="text-2xl font-bold text-purple-700">{history.data?.length || 0}</div>
          <div className="text-[10px] text-purple-500 font-medium mt-1">Total Promotions</div>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
          <div className="text-2xl font-bold text-blue-700">{report.data?.current_year_id ? 'Active' : 'No Active Year'}</div>
          <div className="text-[10px] text-blue-500 font-medium mt-1">Current Academic Year</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search history..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <input value={promoteIds} onChange={e => setPromoteIds(e.target.value)} placeholder="Student IDs (comma separated)" className="w-64 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
          <button onClick={handleBulkPromote} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD]">
            <ArrowUpRight size={14} /> Promote
          </button>
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'student', label: 'Student', render: (r: any) => r.student?.full_name || '-' },
          { key: 'from', label: 'From Class', render: (r: any) => r.from_class?.name || '-' },
          { key: 'to', label: 'To Class', render: (r: any) => r.to_class?.name || '-' },
          { key: 'academic_year', label: 'Academic Year', render: (r: any) => r.academic_year?.name || '-' },
          { key: 'promoted_at', label: 'Promoted At', render: (r: any) => r.promoted_at ? new Date(r.promoted_at).toLocaleDateString() : '-' },
        ]}
        data={filter(history.data || [])}
        loading={history.loading}
      />
    </div>
  );
}
