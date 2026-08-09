'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScrollText, RefreshCw, Search, Download, Activity, Clock,
  Users, BookOpen, Megaphone, CalendarDays, FileText, Database,
  ChevronDown, ChevronRight, Plus, Ban, ShieldAlert, Shield,
} from 'lucide-react';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from './useApi';
import { auditLogsApi } from './dataService';
import { Badge } from '@/components/ui/badge';

const SEV_META: Record<string, { label: string; cls: string }> = {
  info: { label: 'Info', cls: 'bg-blue-50 text-blue-600 border-blue-100' },
  warning: { label: 'Warning', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
  error: { label: 'Error', cls: 'bg-red-50 text-red-600 border-red-100' },
  critical: { label: 'Critical', cls: 'bg-purple-50 text-purple-600 border-purple-100' },
};

function prettyEntity(entity: string | null): string {
  if (!entity) return 'System';
  const map: Record<string, string> = {
    students: 'Student', parents: 'Parent', users: 'User', teachers: 'Teacher',
    staff_records: 'Staff Record', classes: 'Class', staff: 'Staff', staff_attendance: 'Staff Attendance',
    attendance_records: 'Attendance', announcements: 'Announcement', events: 'Event',
    clubs: 'Club', sports_teams: 'Sports Team', fee_payments: 'Fee Payment', documents: 'Document',
    payroll_records: 'Payroll', transports: 'Transport', hostel_rooms: 'Hostel', timetable_entries: 'Timetable',
    exams: 'Exam', exam_results: 'Result', assignments: 'Assignment', homework: 'Homework',
  };
  return map[entity] || entity.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function entityIcon(entity: string | null): any {
  const e = (entity || '').toLowerCase();
  if (e.includes('parent')) return Users;
  if (e.includes('teacher') || e.includes('staff')) return Users;
  if (e.includes('class') || e.includes('subject')) return BookOpen;
  if (e.includes('announc')) return Megaphone;
  if (e.includes('event')) return CalendarDays;
  if (e.includes('document')) return FileText;
  return Database;
}

function timeAgo(iso: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function fmtTime(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function summarizeDetails(details: any): { old: Record<string, any>; next: Record<string, any>; body: Record<string, any> } {
  if (!details || typeof details !== 'object') return { old: {}, next: {}, body: {} };
  if (details.old && details.new) return { old: details.old, next: details.new, body: {} };
  if (details.body) return { old: {}, next: {}, body: details.body };
  if (details.new) return { old: {}, next: details.new, body: {} };
  if (details.old) return { old: details.old, next: {}, body: {} };
  return { old: {}, next: {}, body: details };
}

function opMeta(action: string) {
  const a = (action || '').toUpperCase();
  if (a.startsWith('DELETE')) return { label: 'Deleted', color: '#EF4444', icon: Ban };
  if (a.startsWith('UPDATE')) return { label: 'Updated', color: '#F59E0B', icon: ChevronRight };
  return { label: 'Created', color: '#22C55E', icon: Plus };
}

function exportCsv(rows: any[]) {
  const headers = ['Time', 'Action', 'Entity', 'Severity', 'Actor', 'IP', 'Details'];
  const lines = rows.map(r => [
    r.created_at ? new Date(r.created_at).toISOString() : '',
    `"${(r.action || '').replace(/"/g, '""')}"`,
    `"${(r.entity_type || '').replace(/"/g, '""')}"`,
    r.severity || 'info',
    `"${((r.user_name || r.user_email || r.user_id) || '').replace(/"/g, '""')}"`,
    `"${(r.ip_address || '').replace(/"/g, '""')}"`,
    `"${JSON.stringify(r.details || {}).replace(/"/g, '""')}"`,
  ].join(','));
  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function AuditLogTab() {
  const [tab, setTab] = useState('feed');
  const [q, setQ] = useState('');
  const [sev, setSev] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [opFilter, setOpFilter] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const logs = useApi(() => auditLogsApi.getLogs({
    limit: 50,
    severity: sev || undefined,
    entity_type: entityFilter !== 'all' ? entityFilter : undefined,
    action: opFilter || undefined,
    from: dateRange === '7d' ? new Date(Date.now() - 7 * 864e5).toISOString() : dateRange === '30d' ? new Date(Date.now() - 30 * 864e5).toISOString() : undefined,
    page,
  }), [sev, entityFilter, opFilter, dateRange, page]);

  const types = useApi(() => auditLogsApi.getEntityTypes(), []);
  const entityTypes = useMemo(() => {
    const raw = (types.data as any);
    return Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : ([] as string[]);
  }, [types.data]);

  const refresh = useCallback(() => { logs.refetch(); types.refetch(); }, [logs, types]);

  const filteredEntries = useMemo(() => {
    const arr: any[] = (logs.data?.data || []);
    const lower = q.toLowerCase();
    if (!q) return arr;
    return arr.filter(r => [r.action, r.entity_type, r.user_name, r.user_email, r.user_id, r.ip_address]
      .filter(Boolean).some(v => String(v).toLowerCase().includes(lower)));
  }, [logs.data, q]);

  const opCounts = useMemo(() => {
    const counts = { INSERT: 0, UPDATE: 0, DELETE: 0 };
    for (const r of (logs.data?.data || [])) {
      const a = (r.action || '').toUpperCase();
      if (a.startsWith('INSERT')) counts.INSERT += 1;
      else if (a.startsWith('DELETE')) counts.DELETE += 1;
      else if (a.startsWith('UPDATE')) counts.UPDATE += 1;
      else if (a === 'INSERT' || a === 'UPDATE' || a === 'DELETE') counts[a as keyof typeof counts] += 1;
    }
    return counts;
  }, [logs.data]);

  const entityBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of (logs.data?.data || [])) {
      const e = r.entity_type || 'System';
      counts[e] = (counts[e] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [logs.data]);

  const stats = [
    { key: 'total', label: 'Total Changes', value: logs.data?.pagination?.total ?? filteredEntries.length, color: '#6D4CFF', bg: 'rgba(109,76,255,0.10)', icon: Database },
    { key: 'created', label: 'Created', value: opCounts.INSERT, color: '#3B82F6', bg: 'rgba(59,130,246,0.10)', icon: Plus },
    { key: 'updated', label: 'Updated', value: opCounts.UPDATE, color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', icon: ChevronRight },
    { key: 'deleted', label: 'Deleted', value: opCounts.DELETE, color: '#EF4444', bg: 'rgba(239,68,68,0.10)', icon: Ban },
    { key: 'warnings', label: 'Warnings + Errors', value: filteredEntries.filter(r => r.severity === 'warning' || r.severity === 'error' || r.severity === 'critical').length, color: '#DC2625', bg: 'rgba(220,38,38,0.10)', icon: ShieldAlert },
  ];

  const tabs = [
    { key: 'feed', label: 'Live Feed', icon: Activity },
    { key: 'entities', label: 'By Entity', icon: Database },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ rotate: 6, scale: 1.05 }} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-[#6D4CFF] flex items-center justify-center text-white shadow-lg shadow-blue-500/30 flex-shrink-0">
            <ScrollText size={20} />
          </motion.div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Audit Log</h2>
            <p className="text-[11px] text-gray-400">Every change across the entire system — students, parents, staff & more.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.95 }} onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800">
            <RefreshCw size={13} className={logs.loading ? 'animate-spin' : ''} /> Refresh
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => exportCsv(filteredEntries)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-[#0EA5E9] to-[#6D4CFF] text-white text-xs font-semibold shadow-md shadow-blue-500/20">
            <Download size={13} /> Export CSV
          </motion.button>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="relative flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/70 rounded-xl w-fit overflow-x-auto max-w-full">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`relative px-4 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${tab === t.key ? 'text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {tab === t.key && <motion.span layoutId="audit-pill" className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#0EA5E9] to-[#6D4CFF]" transition={{ type: 'spring', stiffness: 350, damping: 30 }} />}
            <span className="relative flex items-center gap-1.5"><t.icon size={12} /> {t.label}</span>
          </button>
        ))}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg, color: s.color }}><s.icon size={18} /></div>
            </div>
            <div className="text-[11px] text-gray-500 font-medium">{s.label}</div>
            <div className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{s.value ?? 0}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search action, entity, actor, IP…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={sev} onChange={e => { setSev(e.target.value); setPage(1); }} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs">
            <option value="">All Severity</option>
            {['info', 'warning', 'error', 'critical'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs max-w-[170px]">
            <option value="all">All Entities</option>
            {entityTypes.map((et: string) => <option key={et} value={et}>{prettyEntity(et)}</option>)}
          </select>
          <select value={opFilter} onChange={e => { setOpFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs">
            <option value="">All Operations</option>
            <option value="INSERT">Created</option>
            <option value="UPDATE">Updated</option>
            <option value="DELETE">Deleted</option>
          </select>
          <select value={dateRange} onChange={e => { setDateRange(e.target.value); setPage(1); }} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs">
            <option value="all">All Time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
          {tab === 'feed' ? (
            <FeedView entries={filteredEntries} loading={logs.loading} error={logs.error} onRetry={logs.refetch} openId={openId} setOpenId={setOpenId} page={page} totalPages={logs.data?.pagination?.totalPages} setPage={setPage} />
          ) : (
            <EntitiesView breakdown={entityBreakdown} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FeedView({ entries, loading, error, onRetry, openId, setOpenId, page, totalPages, setPage }: {
  entries: any[]; loading: boolean; error: string | null; onRetry: () => void; openId: string | null; setOpenId: (id: string | null) => void;
  page: number; totalPages?: number; setPage: (p: number) => void;
}) {
  if (loading) return <LoadingSkeleton rows={6} cols={1} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!entries || entries.length === 0) return <EmptyState message="No activity recorded yet. Every change you make will appear here." />;
  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {entries.map((r: any, i: number) => (
          <motion.div key={r.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
            transition={{ delay: Math.min(i * 0.03, 0.4), type: 'spring', stiffness: 300, damping: 28 }}
            className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3">
              <LogBadge action={r.action} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <LogActionText action={r.action} />
                  <LogEntity entity={r.entity_type} />
                  <SevBadge sev={r.severity} />
                  <Badge className="bg-gray-50 text-gray-500 text-[9px] border-gray-100">{timeAgo(r.created_at)}</Badge>
                  <button onClick={() => setOpenId(openId === r.id ? null : r.id)}
                    className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-[#6D4CFF] hover:underline">
                    {openId === r.id ? <><ChevronDown size={12} /> Hide</> : <><ChevronRight size={12} /> Details</>}
                  </button>
                </div>
                <LogMeta log={r} />
                <AnimatePresence initial={false}>
                  {openId === r.id && <LogDetails log={r} />}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {totalPages && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-500 disabled:opacity-40">Prev</button>
          <span className="text-[11px] text-gray-400">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-500 disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}

function LogBadge({ action }: { action: string }) {
  const meta = opMeta(action);
  const Icon = meta.icon;
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ background: `${meta.color}18`, color: meta.color }}>
      <Icon size={16} />
    </motion.div>
  );
}

function LogActionText({ action }: { action: string }) {
  const meta = opMeta(action);
  return <span className="text-xs font-bold" style={{ color: meta.color }}>{meta.label}</span>;
}

function LogEntity({ entity }: { entity: string }) {
  const Icon = entityIcon(entity);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
      <Icon size={10} /> {prettyEntity(entity)}
    </span>
  );
}

function SevBadge({ sev }: { sev: string }) {
  const m = SEV_META[sev] || SEV_META.info;
  return <Badge className={`text-[9px] border ${m.cls}`}>{m.label}</Badge>;
}

function LogMeta({ log }: { log: any }) {
  const actor = log.user_name || log.user_email || null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-400 mt-1">
      {actor && <span className="flex items-center gap-1"><Users size={10} /> {actor}</span>}
      {log.user_id && !actor && <span className="flex items-center gap-1"><Users size={10} /> {String(log.user_id).slice(0, 8)}…</span>}
      <span className="flex items-center gap-1"><Clock size={10} /> {fmtTime(log.created_at)}</span>
      {log.ip_address && <span className="flex items-center gap-1"><Shield size={10} /> {log.ip_address}</span>}
    </div>
  );
}

function LogDetails({ log }: { log: any }) {
  const { old, next, body } = summarizeDetails(log.details);
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18 }} className="mt-2 overflow-hidden">
      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 p-3 text-[10px]">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-bold text-gray-600 dark:text-gray-300">Change Details</div>
          <div className="text-[9px] text-gray-400">{log.entity_id ? `ID: ${log.entity_id}` : ''}</div>
        </div>
        {(Object.keys(old).length > 0 || Object.keys(next).length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <div className="text-[9px] font-semibold text-red-400 uppercase mb-1">Before</div>
              <JsonBlock data={old} />
            </div>
            <div>
              <div className="text-[9px] font-semibold text-green-500 uppercase mb-1">After</div>
              <JsonBlock data={next} />
            </div>
          </div>
        ) : (
          <JsonBlock data={body} />
        )}
      </div>
    </motion.div>
  );
}

function JsonBlock({ data }: { data: Record<string, any> }) {
  const entries = Object.entries(data || {}).filter(([, v]) => v !== null && v !== '' && v !== undefined).slice(0, 20);
  if (entries.length === 0) return <div className="text-[10px] text-gray-400">No field-level data stored.</div>;
  return (
    <div className="space-y-1">
      {entries.map(([k, v]) => {
        const value = typeof v === 'object' ? JSON.stringify(v) : String(v);
        return (
          <div key={k} className="flex justify-between gap-2">
            <span className="text-gray-500 dark:text-gray-400 font-medium">{k}</span>
            <span className="text-gray-700 dark:text-gray-300 text-right break-all max-w-[60%]">{value.length > 60 ? value.slice(0, 60) + '…' : value}</span>
          </div>
        );
      })}
    </div>
  );
}

function EntitiesView({ breakdown }: { breakdown: [string, number][] }) {
  if (breakdown.length === 0) return <EmptyState message="No entity activity recorded yet." />;
  const max = Math.max(...breakdown.map(b => b[1]), 1);
  return (
    <div className="space-y-3">
      {breakdown.map(([entity, count], i) => (
        <motion.div key={entity} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
          className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-800">{<EntityIcon entity={entity} />}</div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{prettyEntity(entity)}</span>
              <span className="text-[10px] font-bold text-gray-400">{count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(count / max) * 100}%` }} transition={{ delay: 0.2 + i * 0.04, type: 'spring', stiffness: 120, damping: 20 }}
                className="h-full rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#6D4CFF]" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EntityIcon({ entity }: { entity: string }) {
  const Icon = entityIcon(entity);
  return <Icon size={15} />;
}