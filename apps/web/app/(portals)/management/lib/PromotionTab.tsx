'use client';

import { useState, useMemo, useEffect } from 'react';
import { useApi } from './useApi';
import { promotionApiV4, classApiV2, academicMgmtApi, studentApi } from './dataService';
import {
  GraduationCap, Search, RefreshCw, ArrowUpRight, LayoutDashboard,
  Users, ClipboardList, Layers, CalendarDays, ArrowRight, X,
  Download, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const NAVS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'promote', label: 'Promote Students', icon: ArrowUpRight },
  { key: 'history', label: 'History', icon: ClipboardList },
];

function StatCard({ icon: Icon, label, value, sub, color, bg }: any) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-gray-100 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg, color }}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold text-gray-900 leading-none truncate">{value}</div>
        <div className="text-[10px] text-gray-500 font-medium mt-1 truncate">{label}</div>
        {sub && <div className="text-[9px] text-gray-400 truncate">{sub}</div>}
      </div>
    </div>
  );
}

function DataTable({ columns, data, loading, empty }: any) {
  if (loading) return <div className="text-center py-10 text-gray-400 text-xs">Loading...</div>;
  if (!data?.length) return <div className="text-center py-10 text-gray-400 text-xs">{empty || 'No records found'}</div>;
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

function exportCSV(rows: any[], filename: string) {
  if (!rows.length) { toast.error('Nothing to export'); return; }
  const header = Object.keys(rows[0]);
  const lines = [
    header.join(','),
    ...rows.map(r => header.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function PromotionTab() {
  const [view, setView] = useState<'dashboard' | 'promote' | 'history'>('dashboard');
  const [histSearch, setHistSearch] = useState('');
  const [fromClass, setFromClass] = useState('');
  const [toClass, setToClass] = useState('');
  const [yearId, setYearId] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [studentQ, setStudentQ] = useState('');
  const [promoting, setPromoting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const history = useApi(() => promotionApiV4.getHistory(), []);
  const report = useApi(() => promotionApiV4.getReport(), []);
  const classes = useApi(() => classApiV2.getClasses(), []);
  const years = useApi(() => academicMgmtApi.getAcademicYears(), []);
  const classStudents = useApi(() => fromClass ? classApiV2.getStudents(fromClass) : Promise.resolve({ success: true, data: [] }), [fromClass]);
  const allStudents = useApi(() => studentApi.getAll(), []);

  const classList = Array.isArray(classes.data)
    ? classes.data.map((c: any) => ({ ...c, name: c.class_name ?? c.name }))
    : [];
  const yearList = Array.isArray(years.data) ? years.data : [];
  // Fallback year labels ("2026-27" style) so the academic year is always visible
  // even when no academic_years rows exist in the database yet. Fallback ids are
  // the labels themselves (unique per option) but are NOT real UUIDs, so the
  // backend only stores the label for those.
  const yearFallback = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => {
      const start = now - 2 + i;
      const label = `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
      return { id: label, label, current: i === 2 };
    });
  }, []);
  const displayYears = yearList.length ? yearList.map((y: any) => ({ id: y.id, label: y.name, current: !!y.is_current })) : yearFallback;

  // Default the selected year to the current academic year once options resolve.
  useEffect(() => {
    if (!yearId) {
      const current = displayYears.find((y: any) => y.current);
      if (current) setYearId(current.id);
    }
  }, [displayYears, yearId]);
  const enrollments = Array.isArray(classStudents.data) ? classStudents.data : [];
  const students = useMemo(() => {
    if (enrollments.length) return enrollments.map((e: any) => e.student || e).filter((s: any) => s);
    const all = Array.isArray(allStudents.data) ? allStudents.data : [];
    return all.filter((s: any) => fromClass && (s.class_id === fromClass || s.classes?.id === fromClass));
  }, [enrollments, allStudents.data, fromClass]);
  const historyList = Array.isArray(history.data) ? history.data : [];
  const reportData: any = report.data || {};
  const promotionsCount = reportData.promotions?.length ?? historyList.length;
  const activeClass = yearList.find((y: any) => y.is_current);
  const currentYearLabel = activeClass?.name || displayYears.find((y: any) => y.current)?.label || displayYears[0]?.label || '';
  const disabledClassCount = classList.filter((c: any) => c.status === 'active').length;

  const filteredStudents = useMemo(() => {
    if (!studentQ) return students;
    const q = studentQ.toLowerCase();
    return students.filter((s: any) =>
      (s.full_name || s.name || '').toLowerCase().includes(q) ||
      (s.roll_number || s.roll_no || '').toLowerCase().includes(q)
    );
  }, [students, studentQ]);

  const filteredHistory = useMemo(() => {
    if (!histSearch) return historyList;
    const q = histSearch.toLowerCase();
    return historyList.filter((r: any) =>
      (r.student?.full_name || '').toLowerCase().includes(q) ||
      (r.from_class?.name || '').toLowerCase().includes(q) ||
      (r.to_class?.name || '').toLowerCase().includes(q) ||
      (r.year_label || '').toLowerCase().includes(q)
    );
  }, [historyList, histSearch]);

  const selectedStudents = students.filter((s: any) => selectedIds.includes(s.id));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const selectAll = () => {
    const ids = filteredStudents.map((s: any) => s.id).filter(Boolean);
    setSelectedIds(prev => {
      const allSelected = ids.length && ids.every((i: string) => prev.includes(i));
      if (allSelected) return prev.filter((p: string) => !ids.includes(p));
      return Array.from(new Set([...prev, ...ids]));
    });
  };

  const requestPromote = () => {
    if (!fromClass) { toast.error('Select a source class'); return; }
    if (!toClass) { toast.error('Select a destination class'); return; }
    if (fromClass === toClass) { toast.error('Source and destination classes must be different'); return; }
    if (!selectedIds.length) { toast.error('Select at least one student'); return; }
    setConfirmOpen(true);
  };

  const handlePromote = async () => {
    setPromoting(true);
    try {
      const selectedYear = displayYears.find((y: any) => y.id === yearId);
      const isUuidYear = selectedYear?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedYear.id);
      const res = await promotionApiV4.promoteStudents({
        from_class_id: fromClass, to_class_id: toClass,
        student_ids: selectedIds,
        academic_year_id: isUuidYear ? selectedYear.id : undefined,
        academic_year: selectedYear?.label || activeClass?.name || undefined,
      });
      if (res && res.success === false) {
        toast.error(res.error || 'Failed to promote');
      } else {
        const data: any = res?.data || {};
        const done = Array.isArray(data.records) ? data.records.length : selectedIds.length;
        toast.success(`${done} student(s) promoted successfully${data.skipped ? ` (skipped: ${data.skipped})` : ''}`);
        history.refetch(); report.refetch(); allStudents.refetch();
        setSelectedIds([]); setConfirmOpen(false);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to promote');
    } finally {
      setPromoting(false);
    }
  };

  const exportHistory = () => {
    exportCSV(
      historyList.map((r: any) => ({
        student: r.student?.full_name || '', roll_number: r.student?.roll_number || '',
        from_class: r.from_class?.name || '', to_class: r.to_class?.name || '',
        academic_year: r.year_label || r.academic_year?.name || '',
        promoted_at: r.promoted_at ? new Date(r.promoted_at).toLocaleDateString() : '',
      })),
      'promotion-history.csv'
    );
  };

  const promotionsByYear = useMemo(() => {
    const map: Record<string, number> = {};
    historyList.forEach((r: any) => {
      const yr = r.year_label || r.academic_year?.name || 'No year';
      map[yr] = (map[yr] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [historyList]);

  const renderDashboard = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={ArrowUpRight} label="Total Promotions" value={promotionsCount} color="#7C3AED" bg="#7C3AED10"
          sub={currentYearLabel ? `Active year: ${currentYearLabel}` : 'No active year'} />
        <StatCard icon={Layers} label="Classes" value={classList.length} color="#3B82F6" bg="#3B82F610"
          sub={`${disabledClassCount} active`} />
        <StatCard icon={Users} label="Source Students" value={students.length} color="#F59E0B" bg="#F59E0B10"
          sub={fromClass ? `From ${classList.find((c: any) => c.id === fromClass)?.name || 'class'}` : 'Load a source class'} />
        <StatCard icon={CalendarDays} label="Academic Year" value={currentYearLabel || '—'} color="#10B981" bg="#10B98110"
          sub={yearList.length ? `${yearList.length} configured` : 'Not configured yet'} />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white/80 backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Promotions by Year</h3>
          <span className="text-[10px] text-gray-400">Current: {currentYearLabel || '—'}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {promotionsByYear.length ? promotionsByYear.map(([yr, n], i) => (
            <div key={i} className="px-3 py-2 rounded-xl bg-[#7C3AED08] border border-[#7C3AED20] text-center min-w-[90px]">
              <div className="text-lg font-bold text-[#7C3AED] leading-none">{n}</div>
              <div className="text-[9px] text-gray-500 font-medium mt-1">{yr}</div>
            </div>
          )) : <span className="text-xs text-gray-400">No promotion records yet</span>}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white/80 backdrop-blur-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Promotions</h3>
        <DataTable
          columns={[
            { key: 'student', label: 'Student', render: (r: any) => <span className="font-medium text-gray-800">{r.student?.full_name || '-'}</span> },
            { key: 'from', label: 'From Class', render: (r: any) => r.from_class?.name || '-' },
            { key: 'to', label: 'To Class', render: (r: any) => r.to_class?.name || '-' },
            { key: 'year', label: 'Academic Year', render: (r: any) => <Badge className="text-[9px]">{r.year_label || r.academic_year?.name || '—'}</Badge> },
            { key: 'when', label: 'Promoted At', render: (r: any) => r.promoted_at ? new Date(r.promoted_at).toLocaleDateString() : '-' },
          ]}
          data={historyList.slice(0, 10)}
          loading={history.loading}
          empty="No promotions yet"
        />
      </div>
    </div>
  );

  const renderPromote = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-100 bg-white/80 backdrop-blur-sm p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-700">Promote Students</h3>
          {fromClass && <button onClick={() => { setFromClass(''); setToClass(''); setYearId(''); setSelectedIds([]); }} className="text-[10px] font-semibold text-gray-400 hover:text-red-500 flex items-center gap-1"><X size={12} /> Reset form</button>}
        </div>
        <p className="text-[11px] text-gray-400 mb-4">Move selected students from a source class to a destination class for the new academic year.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[10px] font-semibold text-gray-500 mb-1 block">From Class *</label>
            <select value={fromClass} onChange={e => { setFromClass(e.target.value); setSelectedIds([]); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20">
              <option value="">Select class...</option>
              {classList.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 mb-1 block">To Class *</label>
            <select value={toClass} onChange={e => setToClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20">
              <option value="">Select class...</option>
              {classList.filter((c: any) => c.id !== fromClass).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Academic Year</label>
            <select value={yearId} onChange={e => setYearId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20">
              <option value="">Select year...</option>
              {displayYears.map((y: any) => <option key={y.label} value={y.id}>{y.label}{y.current ? ' (Current)' : ''}</option>)}
            </select>
          </div>
        </div>

        {fromClass && (
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/60 border-b border-gray-100 gap-3">
              <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                {filteredStudents.length} of {students.length} students in {classList.find((c: any) => c.id === fromClass)?.name || 'class'}
              </span>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={studentQ} onChange={e => setStudentQ(e.target.value)} placeholder="Filter students..."
                    className="pl-8 pr-3 py-1.5 w-40 rounded-lg border border-gray-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
                </div>
                <button onClick={selectAll} className="text-[10px] font-semibold text-[#6D4CFF] hover:underline whitespace-nowrap">
                  {filteredStudents.length && filteredStudents.every((s: any) => selectedIds.includes(s.id)) ? 'Deselect all' : 'Select all'}
                </button>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <DataTable
                columns={[
                  { key: 'sel', label: '', render: (r: any) => (
                    <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleSelect(r.id)} className="rounded" />
                  )},
                  { key: 'name', label: 'Student', render: (r: any) => (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#7C3AED10] flex items-center justify-center text-[#7C3AED] text-[9px] font-bold">
                        {(r.full_name || '?').charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{r.full_name || r.name || '—'}</span>
                    </div>
                  )},
                  { key: 'roll', label: 'Roll No', render: (r: any) => r.roll_number || r.roll_no || '—' },
                ]}
                data={filteredStudents}
                loading={enrollments.length ? classStudents.loading : allStudents.loading}
                empty="No students in this class"
              />
            </div>
          </div>
        )}

        {selectedStudents.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold text-gray-500">Selected:</span>
            {selectedStudents.slice(0, 5).map((s: any) => (
              <Badge key={s.id} className="text-[9px] gap-1">
                {s.full_name || s.name}
                <button onClick={() => toggleSelect(s.id)} className="hover:text-red-400"><X size={9} /></button>
              </Badge>
            ))}
            {selectedStudents.length > 5 && <span className="text-[10px] text-gray-400">+{selectedStudents.length - 5} more</span>}
          </div>
        )}

        {fromClass && (
          <div className="flex items-center gap-3 mt-4">
            <button onClick={requestPromote} disabled={!selectedIds.length}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] disabled:opacity-40 disabled:cursor-not-allowed">
              <ArrowUpRight size={14} /> Promote ({selectedIds.length})
            </button>
            {selectedIds.length > 0 && (
              <button onClick={() => setSelectedIds([])} className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-gray-600">
                <X size={12} /> Clear selection
              </button>
            )}
          </div>
        )}
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED10] flex items-center justify-center text-[#7C3AED]"><CheckCircle2 size={20} /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Confirm Promotion</h3>
                <p className="text-[10px] text-gray-400">Please review before submitting</p>
              </div>
            </div>
            <div className="space-y-2 text-xs mb-5">
              <ConfirmRow label="Student(s)" value={`${selectedIds.length}`} />
              <ConfirmRow label="From" value={classList.find((c: any) => c.id === fromClass)?.name || '—'} />
              <ConfirmRow label="To" value={classList.find((c: any) => c.id === toClass)?.name || '—'} />
              <ConfirmRow label="Academic Year" value={displayYears.find((y: any) => y.id === yearId)?.label || yearList.find((y: any) => y.id === yearId)?.name || '—'} />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-5">
              <AlertTriangle size={13} /> Promoted students will be removed from the source class and enrolled in the destination class.
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmOpen(false)} disabled={promoting} className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handlePromote} disabled={promoting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] disabled:opacity-50">
                {promoting ? 'Promoting...' : 'Confirm & Promote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap justify-between">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={histSearch} onChange={e => setHistSearch(e.target.value)} placeholder="Search by student or class..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
        </div>
        <button onClick={exportHistory} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
          <Download size={13} /> Export CSV
        </button>
      </div>
      <DataTable
        columns={[
          { key: 'student', label: 'Student', render: (r: any) => (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#7C3AED10] flex items-center justify-center text-[#7C3AED]"><GraduationCap size={13} /></div>
              <div>
                <div className="text-xs font-semibold text-gray-800">{r.student?.full_name || '-'}</div>
                <div className="text-[9px] text-gray-400">{r.student?.roll_number || ''}</div>
              </div>
            </div>
          )},
          { key: 'from', label: 'From Class', render: (r: any) => <Badge className="text-[9px]">{r.from_class?.name || '-'}</Badge> },
          { key: 'arrow', label: '', render: (r: any) => <ArrowRight size={12} className="text-gray-300" /> },
          { key: 'to', label: 'To Class', render: (r: any) => <Badge className="text-[9px]">{r.to_class?.name || '-'}</Badge> },
          { key: 'year', label: 'Academic Year', render: (r: any) => r.year_label || r.academic_year?.name || '—' },
          { key: 'when', label: 'Promoted At', render: (r: any) => r.promoted_at ? new Date(r.promoted_at).toLocaleDateString() : '—' },
        ]}
        data={filteredHistory}
        loading={history.loading}
        empty="No promotions yet"
      />
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center text-white"><GraduationCap size={20} /></div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Promotion Management</h1>
            <p className="text-xs text-gray-500">Promote students across classes and track academy history</p>
          </div>
        </div>
        <button onClick={() => { history.refetch(); report.refetch(); classes.refetch(); years.refetch(); allStudents.refetch(); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="flex gap-1 flex-wrap mb-6 p-1 bg-gray-100/60 rounded-xl">
        {NAVS.map(n => (
          <button key={n.key} onClick={() => setView(n.key as any)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${view === n.key ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <n.icon size={14} />
            {n.label}
          </button>
        ))}
      </div>

      {view === 'dashboard' && renderDashboard()}
      {view === 'promote' && renderPromote()}
      {view === 'history' && renderHistory()}
    </div>
  );
}

function ConfirmRow({ label, value }: any) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-700">{value}</span>
    </div>
  );
}