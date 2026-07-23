'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Upload, Download, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle,
  CheckCircle, Loader2, ChevronLeft, Printer, Key, EyeOff, Eye, FileText,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { bulkApi } from '../lib/dataService';

export const STAFF_COLUMNS = [
  { key: 'employee_id',       label: 'Employee ID',       required: false },
  { key: 'full_name',         label: 'Full Name',          required: true  },
  { key: 'email',             label: 'Email',              required: true  },
  { key: 'phone',             label: 'Phone',              required: false },
  { key: 'role',              label: 'Role',               required: true  },
  { key: 'department',        label: 'Department',         required: false },
  { key: 'designation',       label: 'Designation',        required: false },
  { key: 'qualification',     label: 'Qualification',      required: false },
  { key: 'experience_years',  label: 'Experience Years',   required: false },
  { key: 'joining_date',      label: 'Joining Date',       required: false },
  { key: 'gender',            label: 'Gender',             required: false },
  { key: 'date_of_birth',     label: 'Date of Birth',      required: false },
  { key: 'address',           label: 'Address',            required: false },
  { key: 'city',              label: 'City',               required: false },
  { key: 'state',             label: 'State',              required: false },
  { key: 'country',           label: 'Country',            required: false },
  { key: 'postal_code',       label: 'Postal Code',        required: false },
  { key: 'salary',            label: 'Salary',             required: false },
  { key: 'employment_type',   label: 'Employment Type',    required: false },
  { key: 'reporting_manager', label: 'Reporting Manager',  required: false },
  { key: 'assigned_classes',  label: 'Assigned Classes',   required: false },
  { key: 'assigned_subjects', label: 'Assigned Subjects',  required: false },
  { key: 'status',            label: 'Status',             required: false },
];

export default function StaffBulkImportWizard({ onClose, onDone, onCreated }: { onClose: () => void; onDone: () => void; onCreated?: (creds: Record<string, { email: string; password: string }>) => void }) {
  const [phase, setPhase] = useState<'upload' | 'preview' | 'importing' | 'done'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(false);
  const [importResults, setImportResults] = useState<any[]>([]);
  const [importSummary, setImportSummary] = useState({ success: 0, failed: 0, total: 0 });
  const [validFilter, setValidFilter] = useState<'all' | 'valid' | 'invalid'>('all');
  const [credVisible, setCredVisible] = useState<Record<number, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const parseRows = (headers: string[], vals: string[][]): any[] => {
    const rows: any[] = [];
    for (const cells of vals) {
      if (cells.every(v => !v.trim())) continue;
      const row: any = {};
      headers.forEach((h, i) => { row[h] = (cells[i] ?? '').trim(); });
      if (row.full_name || row.email) rows.push(row);
    }
    return rows;
  };

  const handleFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    try {
      let rows: any[] = [];
      if (ext === 'csv') {
        const text = await file.text();
        const lines = text.trim().split('\n').map(l => l.replace(/\r/g, ''));
        if (lines.length < 2) { toast.error('No data found in file'); return; }
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
        const vals = lines.slice(1).map(l => {
          const result: string[] = []; let cur = '', inQ = false;
          for (const ch of l) {
            if (ch === '"') { inQ = !inQ; }
            else if (ch === ',' && !inQ) { result.push(cur.trim()); cur = ''; }
            else { cur += ch; }
          }
          result.push(cur.trim());
          return result;
        });
        rows = parseRows(headers, vals);
      } else if (ext === 'xlsx' || ext === 'xls') {
        const XLSX = await import('xlsx');
        const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
        const json: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
        if (!json.length) { toast.error('No data found in file'); return; }
        const map: Record<string, string> = {};
        Object.keys(json[0]).forEach(k => { map[k.trim().toLowerCase().replace(/\s+/g, '_')] = k; });
        rows = json.map(r => {
          const row: any = {};
          Object.entries(map).forEach(([n, o]) => { row[n] = String((r as any)[o] ?? '').trim(); });
          return row;
        }).filter(r => r.full_name || r.email);
      } else { toast.error('Unsupported format. Use .csv, .xlsx or .xls'); return; }
      if (!rows.length) { toast.error('No valid rows found. Check file format.'); return; }
      setImportData(rows); setFileName(file.name); setValidationResults([]); setPhase('upload');
      toast.success(`Parsed ${rows.length} records from ${file.name}`);
    } catch (e: any) { toast.error('Failed to parse file: ' + e.message); }
  };

  const handleValidate = async () => {
    if (!importData.length) { toast.error('Upload a file first'); return; }
    setValidating(true);
    try {
      const res = await bulkApi.validateStaff(importData);
      if (res.success && res.data) {
        setValidationResults(res.data.results || []);
        const bad = (res.data.results || []).filter((r: any) => !r.valid).length;
        setPhase('preview');
        if (!bad) toast.success('All records valid — ready to import');
        else toast.warning(`${bad} record(s) have issues`);
      } else { toast.error(res.error || 'Validation failed'); }
    } catch (e: any) { toast.error(e.message || 'Network error'); }
    finally { setValidating(false); }
  };

  const handleImport = async () => {
    setImporting(true); setPhase('importing'); setImportProgress(0);
    const timer = setInterval(() => setImportProgress(p => p < 85 ? p + Math.random() * 8 : p), 400);
    try {
      const res = await bulkApi.createStaff(importData, sendWelcomeEmail);
      clearInterval(timer); setImportProgress(100);
      const r = res as any;
      if (r.success !== false) {
        const results = r.data?.results || r.results || [];
        const sc = r.data?.success_count ?? r.success_count ?? results.filter((x: any) => x.Status === 'Success').length;
        const fc = r.data?.failed_count ?? r.failed_count ?? results.filter((x: any) => x.Status === 'Failed').length;
        setImportResults(results); setImportSummary({ success: sc, failed: fc, total: importData.length }); setPhase('done');
        const creds: Record<string, { email: string; password: string }> = {};
        results.filter((x: any) => x.Status === 'Success' && x.Email && x.Password).forEach((x: any) => { creds[x.Email] = { email: x.Email, password: x.Password }; });
        if (Object.keys(creds).length) onCreated?.(creds);
        if (sc > 0) toast.success(`${sc} staff imported successfully`);
        if (fc > 0) toast.error(`${fc} records failed`);
      } else { toast.error((res as any).error || 'Import failed'); setPhase('preview'); }
    } catch (e: any) { clearInterval(timer); toast.error(e.message || 'Network error'); setPhase('preview'); }
    finally { setImporting(false); }
  };

  const downloadCSV = () => {
    const header = STAFF_COLUMNS.map(c => c.key).join(',');
    const sample = [
      'EMP001,Jane Smith,jane.smith@school.edu,9876543210,Teacher,Science,Physics Teacher,B.Sc Physics,5,2024-01-15,Female,1990-05-20,123 Main St,Mumbai,Maharashtra,India,400001,45000,Full-time,Dr. Kumar,Grade 10,Physics,active',
      'EMP002,Raj Kumar,raj.kumar@school.edu,9123456780,Principal,Administration,School Principal,M.Ed,15,2023-06-01,Male,1975-08-10,456 Park Ave,Delhi,Delhi,India,110001,90000,Full-time,,,,active',
      ',Ali Hassan,ali.hassan@school.edu,9234567891,Librarian,Library,Senior Librarian,B.Lib,8,2024-03-01,Male,1985-11-22,789 Lake Rd,Chennai,Tamil Nadu,India,600001,35000,Full-time,,,, active',
    ].join('\n');
    const blob = new Blob([header + '\n' + sample], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'staff-import-template.csv'; a.click();
    toast.success('CSV template downloaded');
  };

  const downloadExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const header = STAFF_COLUMNS.map(c => c.key);
      const ws = XLSX.utils.aoa_to_sheet([header]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Staff Import');
      XLSX.writeFile(wb, 'staff-import-template.xlsx');
      toast.success('Excel template downloaded');
    } catch { toast.error('Could not generate Excel'); }
  };

  const downloadResultsCSV = () => {
    if (!importResults.length) return;
    const header = Object.keys(importResults[0]).join(',');
    const rows = importResults.map(r => Object.values(r).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'staff-credentials.csv'; a.click();
  };

  const printCredentials = () => {
    const ok = importResults.filter(r => r.Status === 'Success');
    if (!ok.length) { toast.error('No successful imports to print'); return; }
    const pw = window.open('', '_blank');
    if (!pw) { toast.error('Allow popups to print'); return; }
    const rows = ok.map(r => `<tr><td>${r['Employee ID']||'—'}</td><td>${r['Name']||'—'}</td><td>${r['Email']||'—'}</td><td style="font-family:monospace">${r['Password']||'—'}</td><td>${r['Role']||'—'}</td></tr>`).join('');
    pw.document.write(`<html><head><title>Staff Credentials - Prasynx ERP</title><style>body{font-family:system-ui,sans-serif;padding:30px;color:#1e293b}h2{font-size:18px;font-weight:700;color:#7c3aed;border-bottom:2px solid #7c3aed;padding-bottom:8px;margin-bottom:20px}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#f8fafc;color:#64748b;font-weight:600;text-align:left;padding:10px 12px;border-bottom:1px solid #e2e8f0}td{padding:10px 12px;border-bottom:1px solid #f1f5f9}tr:nth-child(even) td{background:#fafbfc}</style></head><body><h2>Staff Import Credentials</h2><table><thead><tr><th>Employee ID</th><th>Name</th><th>Email</th><th>Password</th><th>Role</th></tr></thead><tbody>${rows}</tbody></table><script>window.onload=()=>{window.print();window.close()}<\/script></body></html>`);
    pw.document.close();
  };

  const validCount   = validationResults.filter(r => r.valid).length;
  const invalidCount = validationResults.filter(r => !r.valid).length;
  const dupCount     = validationResults.filter(r => r.errors?.some((e: string) => e.toLowerCase().includes('duplicate'))).length;
  const filteredVR   = validFilter === 'all' ? validationResults : validFilter === 'valid' ? validationResults.filter(r => r.valid) : validationResults.filter(r => !r.valid);

  const ROLE_GROUPS = [
    { label: 'Teaching', color: 'bg-blue-50 text-blue-700 border-blue-200', roles: ['Principal','Vice Principal','Teacher','Subject Teacher','HOD','Academic Coordinator','Assistant Teacher','Lab Instructor','Special Educator','Sports Coach','Music Teacher','Dance Teacher','Art Teacher','Computer Teacher'] },
    { label: 'Administration', color: 'bg-purple-50 text-purple-700 border-purple-200', roles: ['Administrator','Accountant','Finance Manager','HR Manager','Receptionist','Admission Officer','Front Desk Executive','Data Entry Operator'] },
    { label: 'Library', color: 'bg-amber-50 text-amber-700 border-amber-200', roles: ['Librarian','Assistant Librarian'] },
    { label: 'Transport', color: 'bg-green-50 text-green-700 border-green-200', roles: ['Bus Driver','Transport Manager','Transport Coordinator','Driver Helper'] },
    { label: 'Maintenance', color: 'bg-orange-50 text-orange-700 border-orange-200', roles: ['Electrician','Plumber','Carpenter','Technician','IT Support'] },
    { label: 'Security', color: 'bg-red-50 text-red-700 border-red-200', roles: ['Security Guard','Security Supervisor'] },
    { label: 'Housekeeping', color: 'bg-teal-50 text-teal-700 border-teal-200', roles: ['Sweeper','Cleaner','Gardener','Housekeeping Staff'] },
    { label: 'Medical', color: 'bg-rose-50 text-rose-700 border-rose-200', roles: ['Nurse','Doctor','Counselor'] },
    { label: 'Other', color: 'bg-slate-50 text-slate-700 border-slate-200', roles: ['Hostel Warden','Store Keeper','Mess Manager','Event Coordinator','Procurement Officer'] },
  ];

  const PROCESS_STEPS = [
    'Employee ID auto-generated if missing',
    'Secure password auto-generated for each staff member',
    'Role permissions assigned automatically',
    'Teachers mapped to classes and subjects',
    'Duplicate emails detected and rejected',
    'Duplicate employee IDs detected and rejected',
    'Login credentials generated automatically',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/30 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[1000px] my-6 overflow-hidden border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#F3F0FF', color: '#6D4CFF' }}>
              <Upload size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">Import Staff</h3>
              <p className="text-xs text-gray-400 mt-0.5">Manage bulk staff onboarding with automatic account creation and role assignment.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <button onClick={downloadCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
              <Download size={13} /> CSV Template
            </button>
            <button onClick={downloadExcel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
              <FileSpreadsheet size={13} /> Excel Template
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg ml-1">×</button>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(92vh-80px)]">

          {(phase === 'upload' || phase === 'preview') && (
            <>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 ${dragOver ? 'border-[#6D4CFF] bg-[#F3F0FF]/40' : fileName ? 'border-green-300 bg-green-50/30' : 'border-gray-200 hover:border-[#6D4CFF] hover:bg-[#F3F0FF]/20'}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: '#F3F0FF', color: '#6D4CFF' }}>
                  {fileName ? <CheckCircle2 size={22} className="text-green-600" /> : <Upload size={22} />}
                </div>
                {fileName ? (
                  <div>
                    <p className="text-sm font-bold text-gray-800">{fileName}</p>
                    <p className="text-xs text-gray-400 mt-1">{importData.length} records parsed · click to replace</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Click or drop CSV / Excel file</p>
                    <p className="text-xs text-gray-400 mt-1">Supports .csv, .xlsx, .xls · Auto-generated passwords and employee IDs supported</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <p className="text-xs font-bold text-gray-700 mb-3">Column Reference</p>
                  <div className="mb-2">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Required</p>
                    <div className="flex flex-wrap gap-1.5">
                      {STAFF_COLUMNS.filter(c => c.required).map(c => (
                        <span key={c.key} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">{c.key}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 mt-2">Optional</p>
                    <div className="flex flex-wrap gap-1.5">
                      {STAFF_COLUMNS.filter(c => !c.required).map(c => (
                        <span key={c.key} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-200">{c.key}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <p className="text-xs font-bold text-gray-700 mb-3">Import Process</p>
                  <ul className="space-y-1.5">
                    {PROCESS_STEPS.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <CheckCircle2 size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs font-bold text-gray-700 mb-3">Supported Staff Roles</p>
                <div className="space-y-2.5">
                  {ROLE_GROUPS.map(g => (
                    <div key={g.label} className="flex items-start gap-3">
                      <span className="text-[10px] font-semibold text-gray-500 w-24 flex-shrink-0 pt-0.5">{g.label}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {g.roles.map(r => (
                          <span key={r} className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${g.color}`}>{r}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {phase === 'preview' && validationResults.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Total Records', value: validationResults.length, icon: FileText, color: '#6D4CFF', bg: '#F3F0FF' },
                      { label: 'Valid Records',  value: validCount,   icon: CheckCircle2, color: '#22C55E', bg: '#F0FDF4' },
                      { label: 'Invalid Records', value: invalidCount, icon: XCircle, color: '#EF4444', bg: '#FEF2F2' },
                      { label: 'Duplicates', value: dupCount, icon: AlertCircle, color: '#F59E0B', bg: '#FFFBEB' },
                    ].map(s => (
                      <div key={s.label} className="stat-card">
                        <div className="flex items-start justify-between mb-2">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg, color: s.color }}>
                            <s.icon size={18} />
                          </div>
                        </div>
                        <div className="text-[11px] text-gray-500 font-medium">{s.label}</div>
                        <div className="text-xl font-extrabold text-gray-900 mt-0.5">{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {invalidCount > 0 && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200">
                      <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-red-700">{invalidCount} record(s) have validation errors</p>
                        <p className="text-[10px] text-red-500 mt-0.5">Review the table below. Only valid records will be imported.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-gray-700 flex-1">Preview Table</p>
                    {(['all', 'valid', 'invalid'] as const).map(f => (
                      <button key={f} onClick={() => setValidFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${validFilter === f ? 'bg-[#6D4CFF] text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                    <table className="data-table" style={{ minWidth: '800px' }}>
                      <thead>
                        <tr>
                          {['#', 'Employee ID', 'Name', 'Email', 'Role', 'Status', 'Issues'].map(h => <th key={h}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVR.map((r, i) => (
                          <tr key={i} style={{ background: r.valid ? undefined : '#FEF2F2' }}>
                            <td className="text-gray-400">{r.index + 1}</td>
                            <td className="text-gray-500">{r.employee_id !== 'N/A' ? r.employee_id : <span className="text-amber-500 font-medium italic">Auto</span>}</td>
                            <td className="font-medium text-gray-800">{r.full_name}</td>
                            <td className="text-gray-500 max-w-[180px] overflow-hidden" style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email}</td>
                            <td className="capitalize text-gray-600">{r.role}</td>
                            <td>
                              {r.valid
                                ? <span className="flex items-center gap-1 text-green-600 text-xs font-semibold"><CheckCircle size={12} />Valid</span>
                                : <span className="flex items-center gap-1 text-red-600 text-xs font-semibold"><XCircle size={12} />Invalid</span>}
                            </td>
                            <td className="text-red-500 text-xs max-w-[240px]">{r.errors?.length ? r.errors.join('; ') : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                    <button onClick={() => setSendWelcomeEmail(!sendWelcomeEmail)}
                      className={`toggle flex-shrink-0 ${sendWelcomeEmail ? 'active' : 'inactive'}`}>
                      <span className="toggle-thumb" />
                    </button>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Send welcome emails</p>
                      <p className="text-[10px] text-gray-400">Send login credentials to each staff member after import</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                {importData.length > 0 && phase === 'upload' && (
                  <button onClick={handleValidate} disabled={validating}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-sm font-semibold hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60">
                    {validating ? <><Loader2 size={15} className="animate-spin" /> Validating…</> : <><CheckCircle2 size={15} /> Validate {importData.length} Records</>}
                  </button>
                )}
                {phase === 'preview' && validCount > 0 && (
                  <>
                    <button onClick={() => { setPhase('upload'); setValidationResults([]); }}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
                      <ChevronLeft size={15} /> Back
                    </button>
                    <button onClick={handleImport} disabled={importing}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-sm font-semibold hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60">
                      <Upload size={15} />
                      {invalidCount > 0 ? `Import ${validCount} Valid Records (skip ${invalidCount})` : `Import All ${validCount} Records`}
                    </button>
                  </>
                )}
                {importData.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">Upload a file to get started</p>
                )}
              </div>
            </>
          )}

          {phase === 'importing' && (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#F3F0FF', color: '#6D4CFF' }}>
                <Loader2 size={32} className="animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-gray-900">Importing Staff Records</p>
                <p className="text-sm text-gray-400 mt-1">Creating accounts and generating credentials…</p>
              </div>
              <div className="w-full max-w-sm">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Progress</span>
                  <span className="font-semibold">{Math.round(importProgress)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%`, background: 'linear-gradient(90deg,#6D4CFF,#8B5CF6)' }} />
                </div>
              </div>
              <p className="text-xs text-gray-400">Please do not close this window</p>
            </div>
          )}

          {phase === 'done' && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-5 rounded-xl border" style={{ background: importSummary.failed === 0 ? '#F0FDF4' : '#F3F0FF', borderColor: importSummary.failed === 0 ? '#86EFAC' : '#C4B5FD' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: importSummary.failed === 0 ? '#DCFCE7' : '#EDE9FE', color: importSummary.failed === 0 ? '#22C55E' : '#7C3AED' }}>
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Import Completed Successfully</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{importSummary.success} staff member{importSummary.success !== 1 ? 's' : ''} imported · {importSummary.failed} failed</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Imported', value: importSummary.success, color: '#22C55E', bg: '#F0FDF4', icon: CheckCircle2 },
                  { label: 'Failed', value: importSummary.failed, color: '#EF4444', bg: '#FEF2F2', icon: XCircle },
                  { label: 'Generated Credentials', value: importResults.filter(r => r.Status === 'Success' && r.Password).length, color: '#6D4CFF', bg: '#F3F0FF', icon: Key },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.color }}>
                        <s.icon size={18} />
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium">{s.label}</div>
                    <div className="text-xl font-extrabold text-gray-900 mt-0.5">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={downloadResultsCSV}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
                  <Download size={13} /> Download Credentials CSV
                </button>
                <button onClick={printCredentials}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
                  <Printer size={13} /> Print Credentials
                </button>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">Import Results</p>
                <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                  <table className="data-table" style={{ minWidth: '720px' }}>
                    <thead>
                      <tr>
                        {['Employee ID', 'Name', 'Email', 'Password', 'Role', 'Status', 'Error'].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {importResults.map((r, i) => (
                        <tr key={i} style={{ background: r.Status === 'Success' ? undefined : '#FEF2F2' }}>
                          <td className="text-gray-500">{r['Employee ID'] || '—'}</td>
                          <td className="font-medium text-gray-800">{r['Name'] || '—'}</td>
                          <td className="text-gray-500 max-w-[180px] overflow-hidden" style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r['Email'] || '—'}</td>
                          <td>
                            {r['Password'] && r.Status === 'Success' ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] text-[#6D4CFF] bg-[#F3F0FF] px-2 py-0.5 rounded">
                                  {credVisible[i] ? r['Password'] : '••••••••'}
                                </span>
                                <button onClick={() => setCredVisible(p => ({ ...p, [i]: !p[i] }))} className="text-gray-400 hover:text-gray-600">
                                  {credVisible[i] ? <EyeOff size={11} /> : <Eye size={11} />}
                                </button>
                              </div>
                            ) : '—'}
                          </td>
                          <td className="capitalize text-gray-600">{r['Role'] || '—'}</td>
                          <td>
                            {r.Status === 'Success'
                              ? <Badge variant="success" className="text-[10px]">Success</Badge>
                              : <Badge variant="danger" className="text-[10px]">Failed</Badge>}
                          </td>
                          <td className="text-red-500 text-xs max-w-[180px]">{r.error || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => { setImportData([]); setFileName(''); setValidationResults([]); setImportResults([]); setPhase('upload'); }}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
                  Import Another File
                </button>
                <button onClick={onClose}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-sm font-semibold hover:shadow-lg active:scale-[0.98] transition-all">
                  View Staff List
                </button>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
