'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useApi, useForm } from './useApi';
import { healthApiV4 } from './dataService';
import {
  Heart, Activity, PhoneCall, Users,
  Plus, Search, X, LayoutDashboard, Syringe, Stethoscope,
  AlertTriangle, Sparkles, BrainCircuit,
  CalendarClock, ShieldAlert, CheckCircle2, Filter,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const frame = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = Number(target) || 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);
  return value;
}

function SearchBox({ value, onChange, placeholder }: any) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF]/50 transition-shadow"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={13} />
        </button>
      )}
    </div>
  );
}

function FilterChips({ options, value, onChange, emptyLabel = 'All' }: any) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={() => onChange('')}
        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${value === '' ? 'bg-[#6D4CFF] text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
      >
        {emptyLabel}
      </button>
      {options.map((opt: string) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold capitalize transition-all ${value === opt ? 'bg-[#6D4CFF] text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          {opt.replace('_', ' ')}
        </button>
      ))}
    </div>
  );
}

function ResultCount({ total, shown }: any) {
  if (!shown) return null;
  return (
    <span className="text-[10px] text-gray-400 font-medium">
      Showing <span className="text-gray-600 font-bold">{shown}</span> of {total} records
    </span>
  );
}

const NAVS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'records', label: 'Health Records', icon: Heart },
  { key: 'vaccinations', label: 'Vaccinations', icon: Syringe },
  { key: 'medical', label: 'Medical Records', icon: Stethoscope },
  { key: 'emergency', label: 'Emergency Contacts', icon: PhoneCall },
];

const RECORD_TYPES = ['checkup', 'medication', 'vaccination', 'condition', 'allergy', 'injury'];
const RECORD_TYPE_STYLE: Record<string, string> = {
  checkup: 'bg-blue-50 text-blue-600',
  medication: 'bg-purple-50 text-purple-600',
  vaccination: 'bg-green-50 text-green-600',
  condition: 'bg-amber-50 text-amber-600',
  allergy: 'bg-red-50 text-red-600',
  injury: 'bg-orange-50 text-orange-600',
};

const MEDICAL_TYPES = ['general', 'specialist', 'emergency', 'follow_up', 'routine_checkup', 'other'];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const BLOOD_COLORS: Record<string, string> = {
  'A+': '#EF4444', 'A-': '#F87171', 'B+': '#3B82F6', 'B-': '#60A5FA',
  'AB+': '#8B5CF6', 'AB-': '#A78BFA', 'O+': '#22C55E', 'O-': '#4ADE80',
};

function StatCard({ icon: Icon, label, value, sub, color, bg, delay }: any) {
  return (
    <div className={`p-4 rounded-2xl bg-white border border-gray-100 flex items-center gap-3 hover-lift anim-fade-up ${delay || ''}`}>
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

function StudentName({ student }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
        {(student?.full_name || '?').charAt(0)}
      </div>
      <div>
        <div className="text-xs font-semibold text-gray-700">{student?.full_name || 'Unknown'}</div>
        <div className="text-[9px] text-gray-400">
          {student?.student_class?.name || ''}{student?.section ? ` · ${student.section}` : ''}{student?.roll_number ? ` · ${student.roll_number}` : ''}
        </div>
      </div>
    </div>
  );
}

const emptyRecordForm = {
  student_id: '', record_type: '', title: '', description: '', value: '',
};
const emptyVaccinationForm = {
  student_id: '', vaccine_name: '', vaccination_date: '', next_due_date: '', administered_by: '', notes: '',
};
const emptyMedicalForm = {
  student_id: '', record_type: '', diagnosis: '', treatment: '', medication: '', doctor_name: '', record_date: '', notes: '',
};

export default function HealthTab() {
  const [view, setView] = useState('dashboard');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search, 200);
  const [typeFilter, setTypeFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [showRecord, setShowRecord] = useState(false);
  const [showVaccination, setShowVaccination] = useState(false);
  const [showMedical, setShowMedical] = useState(false);
  const [saving, setSaving] = useState(false);

  const dash = useApi(() => healthApiV4.getDashboard(), []);
  const students = useApi(() => healthApiV4.getStudents(), []);
  const records = useApi(() => healthApiV4.getRecords({ student_id: studentFilter || undefined }), [studentFilter]);
  const vaccinations = useApi(() => healthApiV4.getVaccinations(studentFilter || undefined), [studentFilter]);
  const medical = useApi(() => healthApiV4.getMedicalRecords(studentFilter || undefined), [studentFilter]);
  const emergency = useApi(() => healthApiV4.getEmergencyContacts(), []);
  const aiInsights = useApi(() => healthApiV4.getAiInsights(), []);

  const recordForm = useForm(emptyRecordForm);
  const vaccinationForm = useForm(emptyVaccinationForm);
  const medicalForm = useForm(emptyMedicalForm);

  const studentList = Array.isArray(students.data) ? students.data : [];
  const recordList = Array.isArray(records.data) ? records.data : [];
  const vaccinationList = Array.isArray(vaccinations.data) ? vaccinations.data : [];
  const medicalList = Array.isArray(medical.data) ? medical.data : [];
  const emergencyList = Array.isArray(emergency.data) ? emergency.data : [];
  const dd = dash.data || {};

  const totalStudents = useCountUp(dd.total_students ?? 0);
  const totalRecords = useCountUp(dd.total_records ?? 0);
  const totalVacc = useCountUp(dd.total_vaccinations ?? 0);
  const totalEmergency = useCountUp(dd.emergency_contacts ?? 0);
  const aiScore = useCountUp((aiInsights.data?.health_score) ?? 0);

  const studentName = (id: string) => studentList.find((s: any) => s.id === id)?.full_name || 'Unknown';

  const filteredRecords = useMemo(() => {
    let list = recordList;
    if (typeFilter) list = list.filter((r: any) => r.record_type === typeFilter);
    if (!debouncedSearch) return list;
    const q = debouncedSearch.toLowerCase();
    return list.filter((r: any) =>
      (r.student?.full_name || '').toLowerCase().includes(q) ||
      (r.student?.roll_number || '').toLowerCase().includes(q) ||
      (r.title || '').toLowerCase().includes(q) ||
      (r.record_type || '').toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q)
    );
  }, [recordList, debouncedSearch, typeFilter]);

  const filteredVaccinations = useMemo(() => {
    if (!debouncedSearch) return vaccinationList;
    const q = debouncedSearch.toLowerCase();
    return vaccinationList.filter((v: any) =>
      (v.student?.full_name || '').toLowerCase().includes(q) ||
      (v.student?.roll_number || '').toLowerCase().includes(q) ||
      (v.vaccine_name || '').toLowerCase().includes(q) ||
      (v.administered_by || '').toLowerCase().includes(q)
    );
  }, [vaccinationList, debouncedSearch]);

  const filteredMedical = useMemo(() => {
    if (!debouncedSearch) return medicalList;
    const q = debouncedSearch.toLowerCase();
    return medicalList.filter((m: any) =>
      (m.student?.full_name || '').toLowerCase().includes(q) ||
      (m.student?.roll_number || '').toLowerCase().includes(q) ||
      (m.diagnosis || '').toLowerCase().includes(q) ||
      (m.treatment || '').toLowerCase().includes(q) ||
      (m.doctor_name || '').toLowerCase().includes(q)
    );
  }, [medicalList, debouncedSearch]);

  const filteredEmergency = useMemo(() => {
    if (!debouncedSearch) return emergencyList;
    const q = debouncedSearch.toLowerCase();
    return emergencyList.filter((e: any) =>
      (e.student?.full_name || '').toLowerCase().includes(q) ||
      (e.student?.roll_number || '').toLowerCase().includes(q) ||
      (e.name || '').toLowerCase().includes(q) ||
      (e.relationship || '').toLowerCase().includes(q) ||
      (e.phone || '').toLowerCase().includes(q)
    );
  }, [emergencyList, debouncedSearch]);

  useEffect(() => {
    setSearch('');
    setTypeFilter('');
  }, [view]);

  const closeRecord = () => { setShowRecord(false); recordForm.reset(); };
  const closeVaccination = () => { setShowVaccination(false); vaccinationForm.reset(); };
  const closeMedical = () => { setShowMedical(false); medicalForm.reset(); };

  const handleSubmitRecord = async () => {
    if (!recordForm.values.student_id) { toast.error('Select a student'); return; }
    if (!recordForm.values.record_type) { toast.error('Select a record type'); return; }
    if (!recordForm.values.title) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const res = await healthApiV4.createRecord(recordForm.values);
      if (!res.success) { toast.error(res.error || 'Failed to add record'); return; }
      toast.success('Health record added');
      closeRecord(); records.refetch(); dash.refetch();
    } finally { setSaving(false); }
  };

  const handleSubmitVaccination = async () => {
    if (!vaccinationForm.values.student_id) { toast.error('Select a student'); return; }
    if (!vaccinationForm.values.vaccine_name) { toast.error('Vaccine name is required'); return; }
    setSaving(true);
    try {
      const res = await healthApiV4.createVaccination(vaccinationForm.values);
      if (!res.success) { toast.error(res.error || 'Failed to add vaccination'); return; }
      toast.success('Vaccination recorded');
      closeVaccination(); vaccinations.refetch(); dash.refetch();
    } finally { setSaving(false); }
  };

  const handleSubmitMedical = async () => {
    if (!medicalForm.values.student_id) { toast.error('Select a student'); return; }
    if (!medicalForm.values.record_type) { toast.error('Select a record type'); return; }
    setSaving(true);
    try {
      const res = await healthApiV4.createMedicalRecord(medicalForm.values);
      if (!res.success) { toast.error(res.error || 'Failed to add medical record'); return; }
      toast.success('Medical record added');
      closeMedical(); medical.refetch(); dash.refetch();
    } finally { setSaving(false); }
  };

  const renderDashboard = () => {
    const byType = dd.by_record_type || {};
    const byBlood = dd.by_blood_group || {};
    const bloodItems = BLOOD_GROUPS.map(b => ({ group: b, count: byBlood[b] ?? 0 }));
    const maxBlood = Math.max(1, ...bloodItems.map(b => b.count));
    const typeItems = Object.entries(byType).map(([key, count]) => ({ key, count: count as number }));
    const maxType = Math.max(1, ...typeItems.map(t => t.count));
    const upcoming = dd.upcoming_vaccinations || [];

    const ai = aiInsights.data || {};
    const score = ai.health_score ?? 0;
    const flags = ai.risk_flags || [];
    const due = ai.upcoming_vaccinations || [];
    const atRisk = ai.at_risk_students || [];
    const recommendations = ai.recommendations || [];
    const scoreColor = score >= 80 ? '#22C55E' : score >= 55 ? '#F59E0B' : '#EF4444';

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Users} label="Active Students" value={totalStudents} color="#6D4CFF" bg="#6D4CFF10"
            sub={`${dd.students_with_blood_group ?? 0} with blood group`} delay="delay-1" />
          <StatCard icon={Heart} label="Total Health Records" value={totalRecords} color="#EF4444" bg="#EF444410"
            sub="records + medical entries" delay="delay-2" />
          <StatCard icon={Syringe} label="Vaccinations" value={totalVacc} color="#22C55E" bg="#22C55E10"
            sub={`${upcoming.length} upcoming due`} delay="delay-3" />
          <StatCard icon={PhoneCall} label="Emergency Contacts" value={totalEmergency} color="#F59E0B" bg="#F59E0B10"
            sub="on file for students" delay="delay-4" />
        </div>

        <div className="rounded-2xl p-6 bg-gradient-to-br from-[#0B1120] via-[#111C33] to-[#1A1040] border border-white/10 text-white relative overflow-hidden anim-fade-up delay-2">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#6D4CFF]/25 blur-3xl anim-float" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-[#06B6D4]/15 blur-3xl anim-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-[#22D3EE]/10 blur-2xl anim-pulse-glow" />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit size={16} className="text-[#22D3EE] anim-pulse-glow" />
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#22D3EE]">AI Health Intelligence</span>
              </div>
              <h3 className="text-xl font-bold leading-tight">Campus Health Overview</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-md">Real-time flags, vaccination coverage, and at-risk students derived from health records, medical visits, and emergency data.</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="text-sm font-bold text-white">{ai.vaccination_coverage ?? 0}%</div>
                  <div className="text-[8px] text-slate-400 uppercase tracking-wider">Vaccination Coverage</div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="text-sm font-bold text-white">{flags.length}</div>
                  <div className="text-[8px] text-slate-400 uppercase tracking-wider">Active Risk Flags</div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="text-sm font-bold text-white">{atRisk.length}</div>
                  <div className="text-[8px] text-slate-400 uppercase tracking-wider">Students Needing Attention</div>
                </div>
                <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="text-sm font-bold text-white">{ai.overdue_vaccinations?.length ?? 0}</div>
                  <div className="text-[8px] text-slate-400 uppercase tracking-wider">Overdue Doses</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center shrink-0 relative">
              <div className="absolute inset-0 w-24 h-24 rounded-full bg-white/10 anim-ping-slow" />
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(aiScore / 100) * 264} 264`} style={{ filter: `drop-shadow(0 0 6px ${scoreColor})`, transition: 'stroke-dasharray 1s ease' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: scoreColor }}>{aiScore}</span>
                  <span className="text-[8px] text-slate-400 uppercase tracking-widest">Health Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-100 bg-white/80 backdrop-blur-sm p-5 lg:col-span-2 hover-lift anim-fade-up delay-2">
            <h4 className="text-[11px] font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><ShieldAlert size={12} className="text-red-500" /> Risk Flags</h4>
            {flags.length ? (
              <div className="space-y-2">
                {flags.map((f: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-50/60 border border-red-100 hover:bg-red-50 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center text-white shrink-0"><ShieldAlert size={13} /></div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-gray-800">{f.title}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{f.detail}</div>
                      {f.severity && <Badge className={`mt-1.5 text-[8px] ${f.severity === 'high' ? 'bg-red-100 text-red-600' : f.severity === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>{f.severity} priority</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-[11px] text-gray-400">No risk flags detected.</p>}
          </div>

          <div className="rounded-xl border border-gray-100 bg-white/80 backdrop-blur-sm p-5 hover-lift anim-fade-up delay-3">
            <h4 className="text-[11px] font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><CalendarClock size={12} className="text-[#6D4CFF]" /> Vaccination Forecast</h4>
            {due.length ? (
              <div className="space-y-2">
                {due.map((v: any, i: number) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-[10px]">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-700 truncate">{v.vaccine_name}</div>
                      <div className="text-[9px] text-gray-400 truncate">{v.student_name || ''}{v.days ? ` · in ${v.days}d` : ''}</div>
                    </div>
                    <span className={`text-[9px] font-semibold shrink-0 ${v.days <= 7 ? 'text-red-500' : v.days <= 30 ? 'text-amber-500' : 'text-[#22C55E]'}`}>{v.date || ''}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-[11px] text-gray-400">No upcoming doses.</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-100 bg-white/80 backdrop-blur-sm p-5 lg:col-span-2 hover-lift anim-fade-up delay-3">
            <h4 className="text-[11px] font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Users size={12} className="text-red-500" /> Students Needing Attention</h4>
            {atRisk.length ? (
              <div className="space-y-2">
                {atRisk.map((s: any) => (
                  <div key={s.id} className="flex items-start gap-3 p-3 rounded-lg bg-orange-50/50 border border-orange-100 hover:bg-orange-50 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                      {(s.full_name || '?').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-gray-800">{s.full_name}</span>
                        {s.blood_group && <Badge className="text-[8px] bg-red-50 text-red-600">{s.blood_group}</Badge>}
                        <Badge className="text-[8px] bg-orange-100 text-orange-600">{s.flag_count} flags</Badge>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{s.flags.join(' · ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-[11px] text-gray-400">All students look good — no flags detected.</p>}
          </div>

          <div className="rounded-xl border border-gray-100 bg-white/80 backdrop-blur-sm p-5 hover-lift anim-fade-up delay-4">
            <h4 className="text-[11px] font-semibold text-gray-700 mb-3">Blood Group Distribution</h4>
            <div className="space-y-2">
              {bloodItems.map(b => (
                <div key={b.group} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold w-8" style={{ color: BLOOD_COLORS[b.group] }}>{b.group}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden bar-shimmer">
                    <div className="h-full rounded-full bar-fill" style={{ width: `${(b.count / maxBlood) * 100}%`, background: BLOOD_COLORS[b.group] }} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-700 w-6 text-right">{b.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-100 bg-white/80 backdrop-blur-sm p-5 hover-lift anim-fade-up delay-4">
            <h4 className="text-[11px] font-semibold text-gray-700 mb-3">Records by Type</h4>
            {typeItems.length ? (
              <div className="space-y-2">
                {typeItems.map(t => (
                  <div key={t.key} className="flex items-center gap-2">
                    <span className="text-[10px] capitalize text-gray-600 w-24">{t.key.replace('_', ' ')}</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden bar-shimmer">
                      <div className="h-full rounded-full bg-[#6D4CFF] bar-fill" style={{ width: `${(t.count / maxType) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-700 w-6 text-right">{t.count}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-[11px] text-gray-400">No records yet.</p>}
          </div>

          <div className="rounded-xl border border-gray-100 bg-white/80 backdrop-blur-sm p-5 lg:col-span-2 hover-lift anim-fade-up delay-5">
            <h4 className="text-[11px] font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Sparkles size={12} className="text-[#F59E0B]" /> AI Recommendations</h4>
            {recommendations.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recommendations.map((r: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-gray-50/60 hover:bg-gray-50 transition-colors">
                    <CheckCircle2 size={13} className="text-[#22C55E] mt-0.5 shrink-0" />
                    <span className="text-[10px] text-gray-600 leading-relaxed">{r}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-[11px] text-gray-400">No recommendations available.</p>}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white/80 backdrop-blur-sm p-5 hover-lift anim-fade-up delay-5">
          <h4 className="text-[11px] font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Activity size={12} className="text-[#6D4CFF]" /> Recent Health Activity</h4>
          {dd.recent_records?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dd.recent_records.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gray-50/60 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge className={`text-[8px] capitalize ${RECORD_TYPE_STYLE[r.record_type] || 'bg-gray-100 text-gray-600'}`}>{r.record_type}</Badge>
                    <span className="text-[10px] text-gray-600 truncate">{r.title}</span>
                  </div>
                  <span className="text-[9px] text-gray-400 shrink-0">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-[11px] text-gray-400">No health activity recorded yet.</p>}
        </div>
      </div>
    );
  };

  const renderRecords = () => (
    <div className="space-y-4 anim-fade-in">
      <div className="flex items-center gap-2 flex-wrap bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
        <SearchBox value={search} onChange={setSearch} placeholder="Search by student, roll no, title, description..." />
        <button onClick={() => setShowRecord(true)} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-colors shadow-sm shadow-[#6D4CFF]/30"><Plus size={13} /> Add Record</button>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <FilterChips options={RECORD_TYPES} value={typeFilter} onChange={setTypeFilter} />
        <ResultCount total={recordList.length} shown={filteredRecords.length} />
      </div>
      <DataTable
        columns={[
          { key: 'student', label: 'Student', render: (row: any) => <StudentName student={row.student} /> },
          { key: 'record_type', label: 'Type', render: (row: any) => <Badge className={`text-[9px] capitalize ${RECORD_TYPE_STYLE[row.record_type] || 'bg-gray-100 text-gray-600'}`}>{row.record_type}</Badge> },
          { key: 'title', label: 'Title', render: (row: any) => <span className="font-medium text-gray-700">{row.title}</span> },
          { key: 'description', label: 'Description', render: (row: any) => <span className="text-[10px] text-gray-500 max-w-[180px] inline-block truncate">{row.description || '—'}</span> },
          { key: 'recorded_by', label: 'Recorded By', render: (row: any) => <span className="text-[10px] text-gray-500">{row.recorded_by || 'Student/Parent'}</span> },
          { key: 'recorded_at', label: 'Date', render: (row: any) => <span className="text-[10px] text-gray-400">{row.recorded_at ? new Date(row.recorded_at).toLocaleDateString() : '—'}</span> },
        ]}
        data={filteredRecords}
        loading={records.loading}
        empty={debouncedSearch ? 'No health records match your search.' : 'No health records found.'}
      />
    </div>
  );

  const renderVaccinations = () => (
    <div className="space-y-4 anim-fade-in">
      <div className="flex items-center gap-2 flex-wrap bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
        <SearchBox value={search} onChange={setSearch} placeholder="Search by student, roll no, vaccine..." />
        <select value={studentFilter} onChange={e => setStudentFilter(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20">
          <option value="">All students</option>
          {studentList.map((s: any) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </select>
        <button onClick={() => setShowVaccination(true)} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-colors shadow-sm shadow-[#6D4CFF]/30"><Plus size={13} /> Record Vaccination</button>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1"><Filter size={11} /> Filter by student to narrow the list</span>
        <ResultCount total={vaccinationList.length} shown={filteredVaccinations.length} />
      </div>
      <DataTable
        columns={[
          { key: 'student', label: 'Student', render: (row: any) => <StudentName student={row.student} /> },
          { key: 'vaccine_name', label: 'Vaccine', render: (row: any) => <span className="font-medium text-gray-700">{row.vaccine_name}</span> },
          { key: 'vaccination_date', label: 'Given', render: (row: any) => <span className="text-[10px] text-gray-500">{row.vaccination_date ? new Date(row.vaccination_date).toLocaleDateString() : '—'}</span> },
          { key: 'next_due_date', label: 'Next Due', render: (row: any) => row.next_due_date ? <Badge className="text-[9px] bg-amber-50 text-amber-600">{new Date(row.next_due_date).toLocaleDateString()}</Badge> : <span className="text-[10px] text-gray-400">—</span> },
          { key: 'administered_by', label: 'Administered By', render: (row: any) => <span className="text-[10px] text-gray-500">{row.administered_by || '—'}</span> },
        ]}
        data={filteredVaccinations}
        loading={vaccinations.loading}
        empty={debouncedSearch ? 'No vaccinations match your search.' : 'No vaccination records found.'}
      />
    </div>
  );

  const renderMedical = () => (
    <div className="space-y-4 anim-fade-in">
      <div className="flex items-center gap-2 flex-wrap bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
        <SearchBox value={search} onChange={setSearch} placeholder="Search by student, roll no, diagnosis, doctor..." />
        <select value={studentFilter} onChange={e => setStudentFilter(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20">
          <option value="">All students</option>
          {studentList.map((s: any) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </select>
        <button onClick={() => setShowMedical(true)} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-colors shadow-sm shadow-[#6D4CFF]/30"><Plus size={13} /> Add Medical Record</button>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1"><Filter size={11} /> Filter by student to narrow the list</span>
        <ResultCount total={medicalList.length} shown={filteredMedical.length} />
      </div>
      <DataTable
        columns={[
          { key: 'student', label: 'Student', render: (row: any) => <StudentName student={row.student} /> },
          { key: 'record_type', label: 'Type', render: (row: any) => <Badge className="text-[9px] capitalize bg-gray-100 text-gray-600">{row.record_type?.replace('_', ' ')}</Badge> },
          { key: 'diagnosis', label: 'Diagnosis', render: (row: any) => <span className="font-medium text-gray-700 max-w-[140px] inline-block truncate">{row.diagnosis || '—'}</span> },
          { key: 'treatment', label: 'Treatment', render: (row: any) => <span className="text-[10px] text-gray-500 max-w-[140px] inline-block truncate">{row.treatment || '—'}</span> },
          { key: 'medication', label: 'Medication', render: (row: any) => <span className="text-[10px] text-gray-500">{row.medication || '—'}</span> },
          { key: 'doctor_name', label: 'Doctor', render: (row: any) => <span className="text-[10px] text-gray-500">{row.doctor_name || '—'}</span> },
          { key: 'record_date', label: 'Date', render: (row: any) => <span className="text-[10px] text-gray-400">{row.record_date ? new Date(row.record_date).toLocaleDateString() : '—'}</span> },
        ]}
        data={filteredMedical}
        loading={medical.loading}
        empty={debouncedSearch ? 'No medical records match your search.' : 'No medical records found.'}
      />
    </div>
  );

  const renderEmergency = () => (
    <div className="space-y-4 anim-fade-in">
      <div className="flex items-center gap-2 flex-wrap bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
        <SearchBox value={search} onChange={setSearch} placeholder="Search by student, contact, phone..." />
        <p className="text-[10px] text-gray-400 flex items-center gap-1.5"><AlertTriangle size={12} className="text-amber-500" /> Emergency contacts uploaded by students/parents are listed here.</p>
      </div>
      <div className="flex items-center justify-end">
        <ResultCount total={emergencyList.length} shown={filteredEmergency.length} />
      </div>
      <DataTable
        columns={[
          { key: 'student', label: 'Student', render: (row: any) => <StudentName student={row.student} /> },
          { key: 'name', label: 'Contact', render: (row: any) => <span className="font-medium text-gray-700">{row.name}</span> },
          { key: 'relationship', label: 'Relationship', render: (row: any) => <span className="text-[10px] text-gray-500">{row.relationship || '—'}</span> },
          { key: 'phone', label: 'Phone', render: (row: any) => <span className="text-[10px] text-gray-600">{row.phone || '—'}</span> },
          { key: 'alternate_phone', label: 'Alternate', render: (row: any) => <span className="text-[10px] text-gray-500">{row.alternate_phone || '—'}</span> },
          { key: 'address', label: 'Address', render: (row: any) => <span className="text-[10px] text-gray-500 max-w-[160px] inline-block truncate">{row.address || '—'}</span> },
        ]}
        data={filteredEmergency}
        loading={emergency.loading}
        empty={debouncedSearch ? 'No emergency contacts match your search.' : 'No emergency contacts uploaded yet.'}
      />
    </div>
  );

  const modalBase = "fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4";

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#06B6D4] flex items-center justify-center text-white"><Heart size={20} /></div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Student Health Management</h1>
            <p className="text-xs text-gray-500">View health records, vaccinations, and emergency details uploaded by students and parents</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 flex-wrap mb-6 p-1 bg-gray-100/60 rounded-xl anim-fade-in">
        {NAVS.map(n => (
          <button key={n.key} onClick={() => setView(n.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${view === n.key ? 'bg-white text-[#22C55E] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'}`}>
            <n.icon size={14} />
            {n.label}
          </button>
        ))}
      </div>

      {view === 'dashboard' && renderDashboard()}
      {view === 'records' && renderRecords()}
      {view === 'vaccinations' && renderVaccinations()}
      {view === 'medical' && renderMedical()}
      {view === 'emergency' && renderEmergency()}

      {showRecord && (
        <div className={modalBase}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Add Health Record</h3>
              <button onClick={closeRecord} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Student *</label>
                <select value={recordForm.values.student_id} onChange={e => recordForm.handleChange('student_id', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                  <option value="">Select student...</option>
                  {studentList.map((s: any) => <option key={s.id} value={s.id}>{s.full_name} {s.blood_group ? `(${s.blood_group})` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Record Type *</label>
                <select value={recordForm.values.record_type} onChange={e => recordForm.handleChange('record_type', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                  <option value="">Select type...</option>
                  {RECORD_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Title *</label>
                <input value={recordForm.values.title} onChange={e => recordForm.handleChange('title', e.target.value)} placeholder="e.g. Allergic to peanuts" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Description</label>
                <textarea value={recordForm.values.description} onChange={e => recordForm.handleChange('description', e.target.value)} rows={2} placeholder="Details..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Value (optional)</label>
                <input value={recordForm.values.value} onChange={e => recordForm.handleChange('value', e.target.value)} placeholder="e.g. 120/80, height..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={closeRecord} className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600">Cancel</button>
              <button onClick={handleSubmitRecord} disabled={saving} className="px-4 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showVaccination && (
        <div className={modalBase}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Record Vaccination</h3>
              <button onClick={closeVaccination} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Student *</label>
                <select value={vaccinationForm.values.student_id} onChange={e => vaccinationForm.handleChange('student_id', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                  <option value="">Select student...</option>
                  {studentList.map((s: any) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Vaccine Name *</label>
                <input value={vaccinationForm.values.vaccine_name} onChange={e => vaccinationForm.handleChange('vaccine_name', e.target.value)} placeholder="e.g. BCG, Polio, MMR..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Vaccination Date</label>
                <input type="date" value={vaccinationForm.values.vaccination_date} onChange={e => vaccinationForm.handleChange('vaccination_date', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Next Due Date</label>
                <input type="date" value={vaccinationForm.values.next_due_date} onChange={e => vaccinationForm.handleChange('next_due_date', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Administered By</label>
                <input value={vaccinationForm.values.administered_by} onChange={e => vaccinationForm.handleChange('administered_by', e.target.value)} placeholder="Doctor / nurse name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Notes</label>
                <input value={vaccinationForm.values.notes} onChange={e => vaccinationForm.handleChange('notes', e.target.value)} placeholder="Optional notes" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={closeVaccination} className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600">Cancel</button>
              <button onClick={handleSubmitVaccination} disabled={saving} className="px-4 py-2 rounded-lg bg-[#22C55E] text-white text-xs font-semibold hover:bg-[#16A34A] disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Vaccination'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMedical && (
        <div className={modalBase}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Add Medical Record</h3>
              <button onClick={closeMedical} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Student *</label>
                <select value={medicalForm.values.student_id} onChange={e => medicalForm.handleChange('student_id', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                  <option value="">Select student...</option>
                  {studentList.map((s: any) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Record Type *</label>
                <select value={medicalForm.values.record_type} onChange={e => medicalForm.handleChange('record_type', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                  <option value="">Select type...</option>
                  {MEDICAL_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Record Date</label>
                <input type="date" value={medicalForm.values.record_date} onChange={e => medicalForm.handleChange('record_date', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Diagnosis</label>
                <input value={medicalForm.values.diagnosis} onChange={e => medicalForm.handleChange('diagnosis', e.target.value)} placeholder="e.g. Viral fever" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Doctor</label>
                <input value={medicalForm.values.doctor_name} onChange={e => medicalForm.handleChange('doctor_name', e.target.value)} placeholder="Doctor name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Treatment</label>
                <input value={medicalForm.values.treatment} onChange={e => medicalForm.handleChange('treatment', e.target.value)} placeholder="Treatment given" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Medication</label>
                <input value={medicalForm.values.medication} onChange={e => medicalForm.handleChange('medication', e.target.value)} placeholder="Prescribed medication" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold text-gray-500 mb-1 block">Notes</label>
                <textarea value={medicalForm.values.notes} onChange={e => medicalForm.handleChange('notes', e.target.value)} rows={2} placeholder="Additional notes" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={closeMedical} className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600">Cancel</button>
              <button onClick={handleSubmitMedical} disabled={saving} className="px-4 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
