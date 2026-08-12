'use client';

import { useState, useMemo, useEffect } from 'react';
import { useApi, useForm } from './useApi';
import { disciplineApiV4, studentApi } from './dataService';
import {
  ShieldAlert, Search, RefreshCw, LayoutDashboard, ClipboardList,
  Plus, CheckCircle2, X, Download, Gavel,
  Hourglass, User, ListChecks, Flag, ImagePlus, Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const NAVS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'incidents', label: 'Incidents', icon: ClipboardList },
  { key: 'report', label: 'Report Incident', icon: Plus },
];

const SEVERITY = [
  { value: 'minor', label: 'Minor', color: '#F59E0B', bg: '#F59E0B15' },
  { value: 'moderate', label: 'Moderate', color: '#3B82F6', bg: '#3B82F615' },
  { value: 'major', label: 'Major', color: '#EF4444', bg: '#EF444415' },
  { value: 'critical', label: 'Critical', color: '#7C3AED', bg: '#7C3AED15' },
];
const SEVERITY_MAP: Record<string, any> = Object.fromEntries(SEVERITY.map(s => [s.value, s]));

const STATUS = ['reported', 'under_review', 'actioned', 'resolved', 'closed'];
const STATUS_STYLE: Record<string, string> = {
  reported: 'bg-gray-100 text-gray-600',
  under_review: 'bg-blue-50 text-blue-600',
  actioned: 'bg-amber-50 text-amber-600',
  resolved: 'bg-green-50 text-green-600',
  closed: 'bg-gray-100 text-gray-500',
};

const ACTIONS = [
  { value: 'warning', label: 'Warning' },
  { value: 'detention', label: 'Detention' },
  { value: 'suspension', label: 'Suspension' },
  { value: 'expulsion', label: 'Expulsion' },
  { value: 'counselling', label: 'Counselling' },
  { value: 'other', label: 'Other' },
];

const TYPES = [
  'Bullying', 'Uniform violation', 'Late arrival', 'Truancy / absenteeism',
  'Disruptive behavior', 'Academic dishonesty', 'Physical altercation',
  'Verbal misconduct', 'Property damage', 'Mobile phone misuse', 'Other',
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

function IncidentDetailModal({ detail, onClose, onSaved }: any) {
  const [incident, setIncident] = useState<any>(detail);
  const [manageStatus, setManageStatus] = useState(detail.status);
  const [manageAction, setManageAction] = useState(detail.action_taken || '');
  const [manageDetail, setManageDetail] = useState(detail.action_detail || '');
  const [manageNotes, setManageNotes] = useState(detail.resolution_notes || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    disciplineApiV4.getIncident(detail.id).then(res => {
      if (res.success && res.data) {
        setIncident(res.data);
        setManageStatus(res.data.status);
        setManageAction(res.data.action_taken || '');
        setManageDetail(res.data.action_detail || '');
        setManageNotes(res.data.resolution_notes || '');
      }
    });
  }, [detail.id]);

  const s = SEVERITY_MAP[incident.severity];
  const log = incident.log || [];
  const liveStatus = incident.status || detail.status;

  const handleManage = async () => {
    setSaving(true);
    try {
      const res = await disciplineApiV4.updateIncident(incident.id, {
        status: manageStatus, action_taken: manageAction, action_detail: manageDetail, resolution_notes: manageNotes,
      });
      if (res.success) {
        toast.success('Incident updated — changes logged');
        if (res.data) setIncident(res.data);
        onSaved();
      }
      else toast.error(res.error || 'Failed to update');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EF444410] flex items-center justify-center text-[#EF4444]"><ShieldAlert size={20} /></div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">{incident.title}</h3>
              <p className="text-[10px] text-gray-400">{incident.student?.full_name} · {incident.incident_type}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 rounded-full text-[9px] font-semibold" style={{ background: s?.bg, color: s?.color }}>{s?.label || incident.severity}</span>
          <Badge className={`text-[9px] ${STATUS_STYLE[liveStatus] || ''}`}>{liveStatus?.replace('_', ' ')}</Badge>
          {incident.action_taken && <Badge className="text-[9px] bg-blue-50 text-blue-600">{incident.action_taken.replace('_', ' ')}</Badge>}
        </div>
        {incident.description && <p className="text-xs text-gray-600 mb-3">{incident.description}</p>}
        <div className="space-y-2 text-xs mb-4">
          <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Reported By</span><span className="font-medium text-gray-700 flex items-center gap-1"><User size={11} className="text-[#6D4CFF]" /> {incident.reported_by_user?.full_name || '—'}</span></div>
          <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Location</span><span className="font-medium text-gray-700">{incident.location || '—'}</span></div>
          <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Reported At</span><span className="font-medium text-gray-700">{incident.reported_at ? new Date(incident.reported_at).toLocaleString() : '—'}</span></div>
          <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Resolved By</span><span className="font-medium text-gray-700">{incident.resolved_by_user?.full_name || '—'}</span></div>
          {incident.resolved_at && <div className="flex gap-2"><span className="text-gray-400 w-20 shrink-0">Resolved At</span><span className="font-medium text-gray-700">{new Date(incident.resolved_at).toLocaleString()}</span></div>}
        </div>

        {incident.evidence_url && (
          <div className="mb-4">
            <p className="text-[10px] font-semibold text-gray-500 mb-1.5">Evidence Image</p>
            <a href={incident.evidence_url} target="_blank" rel="noreferrer">
              <img src={incident.evidence_url} alt="Incident evidence" className="max-h-52 rounded-xl border border-gray-100 object-contain cursor-zoom-in hover:opacity-90 transition-opacity" />
            </a>
          </div>
        )}

        <div className="border rounded-xl border-gray-100 mb-4 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/80 border-b border-gray-100">
            <ListChecks size={13} className="text-[#6D4CFF]" />
            <h4 className="text-[11px] font-semibold text-gray-700">Incident Log / Timeline</h4>
            <span className="ml-auto text-[9px] text-gray-400">{log.length} entries</span>
          </div>
          <div className="p-4">
            {log.length ? (
              <div className="space-y-0">
                {log.map((entry: any, i: number) => (
                  <TimelineRow key={entry.id || i} entry={entry} last={i === log.length - 1} />
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400">No log entries yet. Progress the incident to build its history.</p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wide">Manage / Progress Case</h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Status</label>
              <select value={manageStatus} onChange={e => setManageStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                {STATUS.map(s2 => <option key={s2} value={s2}>{s2.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Action Taken</label>
              <select value={manageAction} onChange={e => setManageAction(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                <option value="">No action</option>
                {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          </div>
          <textarea value={manageDetail} onChange={e => setManageDetail(e.target.value)} rows={2} placeholder="Action detail — e.g. Parent notified, detention Friday 3-4pm"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs resize-none mb-2" />
          <textarea value={manageNotes} onChange={e => setManageNotes(e.target.value)} rows={2} placeholder="Resolution / follow-up notes"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs resize-none mb-3" />
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">Close</button>
            <button onClick={handleManage} disabled={saving} className="px-4 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] disabled:opacity-50">
              {saving ? 'Saving...' : 'Save & Log Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineRow({ entry, last }: any) {
  const icon = entry.log_type === 'reported' ? Flag
    : entry.log_type === 'status_change' ? Hourglass
    : entry.log_type === 'action_taken' ? Gavel
    : entry.log_type === 'resolution' ? CheckCircle2 : ListChecks;
  const color = entry.log_type === 'reported' ? '#EF4444'
    : entry.log_type === 'status_change' ? '#F59E0B'
    : entry.log_type === 'action_taken' ? '#6D4CFF'
    : entry.log_type === 'resolution' ? '#22C55E' : '#64748B';
  const Icon = icon;
  const label = entry.log_type === 'reported' ? 'Incident Reported'
    : entry.log_type === 'status_change' ? `Status → ${(entry.to_value || '').replace('_', ' ')}`
    : entry.log_type === 'action_taken' ? `Action: ${(entry.to_value || 'None').replace('_', ' ')}`
    : entry.log_type === 'resolution' ? 'Resolution Logged' : 'Note';
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>
          <Icon size={12} />
        </div>
        {!last && <div className="w-px flex-1 bg-gray-100" />}
      </div>
      <div className="pb-4 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-gray-700">{label}</span>
          <span className="text-[9px] text-gray-400">{entry.created_at ? new Date(entry.created_at).toLocaleString() : ''}</span>
        </div>
        {entry.note && <p className="text-[10px] text-gray-500 mt-0.5 break-words">{entry.note}</p>}
        {entry.created_by_user?.full_name && <p className="text-[9px] text-gray-400 mt-0.5">by {entry.created_by_user.full_name}</p>}
      </div>
    </div>
  );
}

const emptyForm = {
  student_id: '', incident_type: '', title: '', description: '',
  severity: 'minor', location: '',
};

export default function DisciplineTab() {
  const [view, setView] = useState<'dashboard' | 'incidents' | 'report'>('dashboard');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [evidenceFile, setEvidenceFile] = useState<string>('');

  const incidents = useApi(() => disciplineApiV4.getIncidents({ status: filterStatus || undefined, severity: filterSeverity || undefined, search: search || undefined }), [filterStatus, filterSeverity, search]);
  const dash = useApi(() => disciplineApiV4.getDashboard(), []);
  const students = useApi(() => studentApi.getAll(), []);
  const form = useForm(emptyForm);

  const studentList = Array.isArray(students.data) ? students.data : [];
  const incidentList = Array.isArray(incidents.data) ? incidents.data : [];

  const refreshAll = () => { incidents.refetch(); dash.refetch(); students.refetch(); };
  const filteredIncidents = useMemo(() => {
    if (!search) return incidentList;
    const q = search.toLowerCase();
    return incidentList.filter((r: any) =>
      (r.student?.full_name || '').toLowerCase().includes(q) ||
      (r.title || '').toLowerCase().includes(q) ||
      (r.incident_type || '').toLowerCase().includes(q)
    );
  }, [incidentList, search]);

  const studentName = (id: string) => studentList.find((s: any) => s.id === id)?.full_name || studentList.find((s: any) => s.id === id)?.name || 'Unknown';

  const handleSubmit = async () => {
    if (!form.values.student_id) { toast.error('Select a student'); return; }
    if (!form.values.title) { toast.error('Incident title is required'); return; }
    if (!form.values.incident_type) { toast.error('Select an incident type'); return; }
    setSaving(true);
    try {
      const payload: any = {
        student_id: form.values.student_id,
        incident_type: form.values.incident_type,
        title: form.values.title,
        description: form.values.description,
        severity: form.values.severity,
        location: form.values.location,
      };

      if (evidenceFile) {
        const up = await disciplineApiV4.uploadEvidence(evidenceFile);
        if (!up.success) { toast.error(up.error || 'Failed to upload evidence'); return; }
        payload.evidence_url = up.data.url;
      }

      const res = editing
        ? await disciplineApiV4.updateIncident(editing.id, payload)
        : await disciplineApiV4.createIncident(payload);
      if (!res.success) { toast.error(res.error || 'Failed to save incident'); return; }
      toast.success(editing ? 'Incident updated' : 'Incident reported');
      form.reset(); setEvidenceFile(''); setEditing(null); setView('incidents'); refreshAll();
    } finally { setSaving(false); }
  };

  const handleEvidenceFile = (e: any) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) { toast.error('Only JPEG, PNG, WebP or GIF images allowed'); return; }
    const reader = new FileReader();
    reader.onload = () => setEvidenceFile(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleStatus = async (id: string, status: string) => {
    if (['resolved', 'closed'].includes(status)) {
      if (!window.confirm(`Mark this incident as ${status}? This records the resolution.`)) return;
    }
    const res = await disciplineApiV4.updateIncident(id, { status });
    if (res.success) { toast.success(`Incident ${status}`); refreshAll(); }
    else toast.error(res.error || 'Failed to update status');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this incident record? This cannot be undone.')) return;
    const res = await disciplineApiV4.deleteIncident(id);
    if (res.success) { toast.success('Incident deleted'); refreshAll(); }
    else toast.error(res.error || 'Failed to delete');
  };

  const editIncident = (row: any) => {
    setEditing(row);
    setEvidenceFile('');
    form.setValues({
      student_id: row.student_id || '',
      incident_type: row.incident_type || '',
      title: row.title || '',
      description: row.description || '',
      severity: row.severity || 'minor',
      location: row.location || '',
    });
    setView('report');
  };

  const exportIncidents = () => {
    exportCSV(
      incidentList.map((r: any) => ({
        student: r.student?.full_name || '', title: r.title || '',
        type: r.incident_type || '', severity: r.severity || '',
        status: r.status || '', action: r.action_taken || '',
        reported_at: r.reported_at ? new Date(r.reported_at).toLocaleDateString() : '',
      })),
      'discipline-incidents.csv'
    );
  };

  const renderDashboard = () => {
    const d = dash.data || {};
    const sev = d.by_severity || {};
    const status = d.by_status || {};
    const sevItems = SEVERITY.map(s => ({ ...s, count: sev[s.value] ?? 0 }));
    const maxSev = Math.max(1, ...sevItems.map(s => s.count));
    const offenders = d.repeat_offenders || [];
    const trend = d.trending || [];
    const actions = d.by_action || {};
    const types = d.by_type || [];
    const actionItems = ACTIONS.map(a => ({ ...a, count: actions[a.value] ?? 0 }));
    const maxAction = Math.max(1, ...actionItems.map(a => a.count));

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={ShieldAlert} label="Total Incidents" value={d.total_incidents ?? 0} color="#EF4444" bg="#EF444410"
            sub={`${d.incidents_last_30_days ?? 0} in last 30 days`} />
          <StatCard icon={Hourglass} label="Open Incidents" value={d.open_incidents ?? 0} color="#F59E0B" bg="#F59E0B10"
            sub="awaiting review / action" />
          <StatCard icon={ListChecks} label="Pending Action" value={d.pending_action ?? 0} color="#3B82F6" bg="#3B82F610"
            sub="no action taken yet" />
          <StatCard icon={CheckCircle2} label="Resolved" value={d.resolved ?? 0} color="#22C55E" bg="#22C55E10"
            sub={`${d.resolve_rate ?? 0}% resolve rate · avg ${d.avg_resolution_days ?? 0}d`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-100 bg-white/80 backdrop-blur-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Incidents by Severity</h3>
            <div className="space-y-3">
              {sevItems.map(s => (
                <div key={s.value} className="flex items-center gap-3">
                  <span className="w-20 text-[10px] font-medium text-gray-500">{s.label}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(s.count / maxSev) * 100}%`, background: s.color }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-6 text-right">{s.count}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-2 mt-4 text-center">
              {Object.entries(status).map(([k, v]: [string, any]) => (
                <div key={k} className="px-1 py-2 rounded-lg bg-gray-50">
                  <div className="text-sm font-bold text-gray-800">{v}</div>
                  <div className="text-[8px] text-gray-400 uppercase tracking-wide">{k.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white/80 backdrop-blur-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Actions Taken by School</h3>
            {actionItems.some(a => a.count > 0) ? (
              <div className="space-y-3">
                {actionItems.filter(a => a.count > 0).map(a => (
                  <div key={a.value} className="flex items-center gap-3">
                    <span className="w-24 text-[10px] font-medium text-gray-500">{a.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#3B82F6]" style={{ width: `${(a.count / maxAction) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 w-6 text-right">{a.count}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-gray-400">No disciplinary actions taken yet</p>}
            <div className="mt-4 p-3 rounded-lg bg-amber-50/60 border border-amber-100">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-700 mb-1"><Gavel size={12} /> Discipline Insights</div>
              <ul className="text-[10px] text-amber-700/80 space-y-1">
                <li>• {d.open_incidents ?? 0} incidents need review or action</li>
                <li>• {d.pending_action ?? 0} have no action assigned yet</li>
                <li>• {d.resolved ?? 0} resolved · {d.resolve_rate ?? 0}% resolution rate</li>
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white/80 backdrop-blur-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Monthly Trend</h3>
            {trend.length ? (
              <div className="flex items-end gap-2 h-32">
                {trend.map((t: any) => (
                  <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-gray-700">{t.count}</span>
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-[#EF4444] to-[#F59E0B]" style={{ height: `${Math.max(6, (t.count / Math.max(1, ...trend.map((x: any) => x.count))) * 100)}%` }} />
                    <span className="text-[8px] text-gray-400">{t.month.slice(5)}/{t.month.slice(2, 4)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-gray-400">No incident data yet</p>}

            <h4 className="text-[10px] font-semibold text-gray-500 mt-5 mb-2">Incident Types</h4>
            <div className="flex flex-wrap gap-1.5">
              {types.length ? types.map((t: any) => (
                <Badge key={t.name} className="text-[9px] bg-purple-50 text-purple-700 border border-purple-100">
                  {t.name} · {t.count}
                </Badge>
              )) : <span className="text-[10px] text-gray-400">No types recorded</span>}
            </div>

            {offenders.length > 0 && (
              <div className="mt-4">
                <h4 className="text-[10px] font-semibold text-gray-500 mb-2">Repeat Offenders</h4>
                <div className="flex flex-wrap gap-2">
                  {offenders.map((o: any, i: number) => (
                    <Badge key={i} className="text-[9px] bg-red-50 text-red-600 border border-red-100">
                      {studentName(o.student_id)} · {o.count} incidents
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white/80 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Recent Incidents</h3>
            <button onClick={() => setView('incidents')} className="text-[10px] font-semibold text-[#6D4CFF] hover:underline">View all →</button>
          </div>
          <DataTable
            columns={[
              { key: 'student', label: 'Student', render: (r: any) => <span className="font-medium text-gray-800">{r.student?.full_name || '-'}</span> },
              { key: 'title', label: 'Incident', render: (r: any) => <span>{r.title || '-'}</span> },
              { key: 'severity', label: 'Severity', render: (r: any) => { const s = SEVERITY_MAP[r.severity]; return <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold" style={{ background: s?.bg, color: s?.color }}>{s?.label || r.severity}</span>; } },
              { key: 'status', label: 'Status', render: (r: any) => <Badge className={`text-[9px] ${STATUS_STYLE[r.status] || ''}`}>{r.status?.replace('_', ' ')}</Badge> },
              { key: 'reported_by', label: 'Reported By', render: (r: any) => <span className="text-[10px]">{r.reported_by_user?.full_name || '—'}</span> },
              { key: 'action', label: 'Action Taken', render: (r: any) => <span className="text-[10px]">{r.action_taken ? r.action_taken.replace('_', ' ').replace(/^\w/, (c: string) => c.toUpperCase()) : '—'}</span> },
              { key: 'when', label: 'Reported At', render: (r: any) => r.reported_at ? new Date(r.reported_at).toLocaleDateString() : '-' },
            ]}
            data={incidentList.slice(0, 8)}
            loading={incidents.loading}
            empty="No incidents reported yet"
          />
        </div>
      </div>
    );
  };

  const renderIncidents = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search incidents..."
              className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white">
            <option value="">All Status</option>
            {STATUS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white">
            <option value="">All Severity</option>
            {SEVERITY.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportIncidents} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <Download size={13} /> Export CSV
          </button>
          <button onClick={() => { setEditing(null); form.reset(); setView('report'); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD]">
            <Plus size={14} /> Report Incident
          </button>
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'student', label: 'Student', render: (r: any) => (
            <div>
              <div className="text-xs font-semibold text-gray-800">{r.student?.full_name || '-'}</div>
              <div className="text-[9px] text-gray-400">{r.student?.roll_number || ''}</div>
            </div>
          )},
          { key: 'title', label: 'Incident', render: (r: any) => (
            <div>
              <div className="text-xs font-medium text-gray-700">{r.title || '-'}</div>
              <div className="text-[9px] text-gray-400">{r.incident_type || ''}</div>
            </div>
          )},
          { key: 'severity', label: 'Severity', render: (r: any) => { const s = SEVERITY_MAP[r.severity]; return <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold" style={{ background: s?.bg, color: s?.color }}>{s?.label || r.severity}</span>; } },
          { key: 'status', label: 'Status', render: (r: any) => (
            <select
              value={r.status}
              onClick={e => e.stopPropagation()}
              onChange={e => handleStatus(r.id, e.target.value)}
              className={`px-2 py-1 rounded-lg text-[9px] font-semibold border-0 cursor-pointer focus:outline-none ${STATUS_STYLE[r.status] || 'bg-gray-100 text-gray-600'}`}
            >
              {STATUS.map(s => <option key={s} value={s} className="text-gray-700 bg-white">{s.replace('_', ' ')}</option>)}
            </select>
          )},
          { key: 'reported_by', label: 'Reported By', render: (r: any) => (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-[#6D4CFF10] flex items-center justify-center text-[#6D4CFF]">
                <User size={10} />
              </div>
              <span className="text-[10px]">{r.reported_by_user?.full_name || '—'}</span>
            </div>
          )},
          { key: 'action', label: 'Action Taken', render: (r: any) => r.action_taken ? (
            <Badge className="text-[9px] bg-blue-50 text-blue-700 border border-blue-100">
              {r.action_taken.replace('_', ' ').replace(/^\w/, (c: string) => c.toUpperCase())}
            </Badge>
          ) : <span className="text-[10px] text-gray-300">—</span> },
          { key: 'when', label: 'Reported At', render: (r: any) => r.reported_at ? new Date(r.reported_at).toLocaleDateString() : '—' },
          { key: 'id', label: 'Actions', render: (row: any) => (
            <div className="flex gap-1">
              <button onClick={() => setDetail(row)} className="px-2 py-1 rounded-lg bg-gray-50 text-gray-600 text-[9px] font-semibold hover:bg-gray-100">View</button>
              <button onClick={() => editIncident(row)} className="px-2 py-1 rounded-lg bg-[#6D4CFF10] text-[#6D4CFF] text-[9px] font-semibold">Edit</button>
              {row.status !== 'resolved' && row.status !== 'closed' && (
                <button onClick={() => handleStatus(row.id, 'resolved')} className="px-2 py-1 rounded-lg bg-green-50 text-green-600 text-[9px] font-semibold">Resolve</button>
              )}
              <button onClick={() => handleDelete(row.id)} className="px-2 py-1 rounded-lg bg-red-50 text-red-500 text-[9px] font-semibold">Delete</button>
            </div>
          )},
        ]}
        data={filteredIncidents}
        loading={incidents.loading}
        empty="No incidents found"
      />
    </div>
  );

  const renderReport = () => (
    <div className="max-w-3xl">
      <div className="rounded-xl border border-gray-100 bg-white/80 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-700">{editing ? 'Edit Incident' : 'Report New Incident'}</h3>
          {editing && <button onClick={() => { setEditing(null); setEvidenceFile(''); form.reset(); }} className="text-[10px] font-semibold text-gray-400 hover:text-red-500 flex items-center gap-1"><X size={12} /> Cancel edit</button>}
        </div>
        <p className="text-[11px] text-gray-400 mb-5">Record a disciplinary incident for a student. Fields marked * are required.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Student *</label>
            <select value={form.values.student_id} onChange={e => form.handleChange('student_id', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
              <option value="">Select student...</option>
              {studentList.map((s: any) => <option key={s.id} value={s.id}>{s.full_name || s.name}{s.roll_number ? ` (${s.roll_number})` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Incident Type *</label>
            <select value={form.values.incident_type} onChange={e => form.handleChange('incident_type', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
              <option value="">Select type...</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Incident Title *</label>
            <input value={form.values.title} onChange={e => form.handleChange('title', e.target.value)} placeholder="e.g. Repeated late arrival to class"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Severity</label>
            <select value={form.values.severity} onChange={e => form.handleChange('severity', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
              {SEVERITY.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Location</label>
            <input value={form.values.location} onChange={e => form.handleChange('location', e.target.value)} placeholder="e.g. Classroom 2A, Playground"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Evidence Image (optional)</label>
            {!evidenceFile ? (
              <label className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#6D4CFF]/40 hover:bg-[#6D4CFF]/5 cursor-pointer transition-all">
                <ImagePlus size={20} className="text-gray-400" />
                <span className="text-[11px] text-gray-500">Click to upload evidence photo</span>
                <span className="text-[9px] text-gray-400">JPEG, PNG, WebP or GIF · max 2MB</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleEvidenceFile} className="hidden" />
              </label>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-2">
                <img src={evidenceFile} alt="Evidence preview" className="h-16 w-16 rounded-lg object-cover border border-gray-100" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-gray-700">Evidence attached</p>
                  <p className="text-[9px] text-gray-400">Will be uploaded to secure storage on submit</p>
                </div>
                <button type="button" onClick={() => setEvidenceFile('')} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Description</label>
            <textarea value={form.values.description} onChange={e => form.handleChange('description', e.target.value)} rows={3} placeholder="Describe what happened..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs resize-none" />
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2">
          <ListChecks size={14} className="text-[#6D4CFF] mt-0.5 shrink-0" />
          <p className="text-[10px] text-blue-700/80 leading-relaxed">
            Reporting only records the incident. After reporting, you can open the incident from the list to
            review it, change its status, and log the action taken — giving management a full case history.
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setView('incidents')} className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Update Incident' : 'Report Incident'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!detail) return null;
    return <IncidentDetailModal
      detail={detail}
      onClose={() => setDetail(null)}
      onSaved={() => { refreshAll(); setDetail(null); }}
    />;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#F59E0B] flex items-center justify-center text-white"><ShieldAlert size={20} /></div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Discipline Management</h1>
            <p className="text-xs text-gray-500">Track, manage, and resolve student behavioral incidents</p>
          </div>
        </div>
        <button onClick={refreshAll} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
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
      {view === 'incidents' && renderIncidents()}
      {view === 'report' && renderReport()}
      {renderDetail()}
    </div>
  );
}
