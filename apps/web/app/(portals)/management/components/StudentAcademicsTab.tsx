'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users, School, FileText, BarChart3, TrendingUp, AlertTriangle, Award,
  Search, Loader2, Download, GraduationCap, Percent, Target, User, Layers,
  BookOpen, CheckCircle2, XCircle, RefreshCw, Brain, Sparkles, Gauge, ShieldAlert,
  TrendingDown, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { toast } from 'sonner';
import { academicAnalyticsApiV2, examApiV2, marksApiV4, classApi, predictiveAiApiV2 } from '../lib/dataService';
import { useApi } from '../lib/useApi';
import { ModuleHeader } from '../lib/ModuleUi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, Legend
} from 'recharts';

const CLR = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', secondary: '#8B5CF6' };
const CHART_COLORS = ['#6D4CFF', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const num = (v: any, fallback = 0) => { const n = Number(v); return isFinite(n) ? n : fallback; };
const pct = (v: any) => `${Math.round(num(v))}%`;
const riskColor = (r: any) => (r === 'high' || r === 'critical') ? CLR.danger : r === 'medium' ? CLR.warning : CLR.success;
const riskLabel = (r: any) => (r || 'low').toUpperCase();

function useCountUp(target: any, duration = 900) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef(0);
  useEffect(() => {
    const to = Number(target) || 0;
    if (!isFinite(to)) { setValue(to); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(fromRef.current + (to - fromRef.current) * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return value;
}

function AnimatedValue({ value, suffix }: { value: any; suffix?: string }) {
  const v = useCountUp(value);
  if (value == null) return <>—</>;
  if (typeof value === 'string') return <>{value}</>;
  return <>{v}{suffix || ''}</>;
}

function KpiCard({ icon: Icon, label, value, sub, color, bg, delay = 0, suffix }: {
  icon: any; label: string; value: any; sub?: string; color: string; bg: string; delay?: number; suffix?: string;
}) {
  return (
    <Card className={`p-4 bg-white border border-gray-100 shadow-sm flex items-center gap-3 hover-lift hover:shadow-lg transition-all anim-fade-up delay-${delay}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden" style={{ background: bg, color }}>
        <Icon className="w-5 h-5 relative z-10" />
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 50%, ${color}22, transparent 70%)` }} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-gray-500 font-medium truncate">{label}</div>
        <div className="text-xl font-bold text-gray-900 leading-tight tabular-nums"><AnimatedValue value={value} suffix={suffix} /></div>
        {sub && <div className="text-[9px] text-gray-400 truncate">{sub}</div>}
      </div>
    </Card>
  );
}

function ChartCard({ title, sub, children, height = 220, delay = 0 }: {
  title: string; sub?: string; children: React.ReactNode; height?: number | string; delay?: number;
}) {
  return (
    <Card className={`p-4 bg-white border border-gray-100 shadow-sm hover-lift hover:shadow-lg transition-all anim-fade-up delay-${delay}`}>
      <div className="mb-3">
        <h4 className="text-sm font-bold text-gray-800">{title}</h4>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div style={{ height }}>{children}</div>
    </Card>
  );
}

function RateBar({ rate, color, shimmer = false }: { rate: number; color: string; shimmer?: boolean }) {
  return (
    <div className={`flex-1 h-2 rounded-full bg-gray-100 overflow-hidden ${shimmer ? 'bar-shimmer' : ''}`}>
      <div className="h-full rounded-full bar-fill" style={{ width: `${Math.max(3, Math.min(100, rate))}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
    </div>
  );
}

function TrendPill({ value }: { value: any }) {
  if (value == null) return null;
  const up = value.direction === 'up';
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${up ? 'text-emerald-300' : 'text-red-400'}`}>
      {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
      {num(value.pct)}%
    </span>
  );
}

function Loader({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-8 h-8 text-[#6D4CFF] animate-spin" />
      <p className="text-xs text-gray-400 font-medium">{label}</p>
    </div>
  );
}

function Empty({ icon: Icon = FileText, title, sub }: { icon?: any; title: string; sub?: string }) {
  return (
    <div className="text-center py-14 text-gray-400">
      <Icon className="w-10 h-10 opacity-25 mx-auto mb-2" />
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {sub && <p className="text-xs mt-1">{sub}</p>}
    </div>
  );
}

// ======================== OVERVIEW ========================
function OverviewView({ refreshKey }: { refreshKey: number }) {
  const dash = useApi(() => academicAnalyticsApiV2.getDashboard(), [refreshKey]);
  if (dash.loading) return <Loader label="Loading academic overview..." />;
  if (dash.error) return <Empty icon={AlertTriangle} title="Failed to load overview" sub={dash.error} />;
  const d = dash.data;
  const s = d?.summary || {};

  const studentAnalytics = d?.studentAnalytics || [];
  const topStudents = [...studentAnalytics].sort((a: any, b: any) => num(b.avgExamScore) - num(a.avgExamScore)).slice(0, 5);
  const atRisk = studentAnalytics.filter((st: any) => st.riskLevel === 'high' || st.riskLevel === 'critical').sort((a: any, b: any) => num(a.gpa) - num(b.gpa)).slice(0, 5);

  const subjectData = (d?.subjectPerformance || []).map((x: any) => ({ name: x.subject_name, avgScore: num(x.avgScore), passRate: num(x.passRate) }));
  const classData = (d?.classPerformance || []).map((x: any) => ({ name: x.class_name, avgScore: num(x.avgScore), passRate: num(x.passRate) }));
  const gradeData = (d?.gradeDistribution || []).map((x: any) => ({ name: x.label, count: num(x.count) }));
  const trendData = d?.performanceTrend || [];

  return (
    <div className="space-y-4">
      {/* Trend + Grade distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Performance Trend" sub="Average score & pass rate over time" delay={1}>
          {trendData.length === 0 ? <Empty icon={TrendingUp} title="No trend data yet" sub="Performance snapshots will appear here" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CLR.primary} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={CLR.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="avgScore" name="Avg Score %" stroke={CLR.primary} strokeWidth={2} fill="url(#gScore)" />
                <Area type="monotone" dataKey="passRate" name="Pass Rate %" stroke={CLR.success} strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard title="Grade Distribution" sub="Number of students per grade band" delay={2}>
          {gradeData.every((g: any) => g.count === 0) ? <Empty title="No grades recorded yet" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} cursor={{ fill: 'rgba(109,76,255,0.06)' }} />
                <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
                  {gradeData.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Subject + Class performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Subject Performance" sub="Average score by subject" delay={1}>
          {subjectData.length === 0 ? <Empty icon={BookOpen} title="No subject performance yet" /> : (
            <div className="space-y-2.5 py-1">
              {subjectData.map((sub: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold w-28 truncate text-gray-600">{sub.name}</span>
                  <RateBar rate={sub.avgScore} color={sub.avgScore >= 60 ? CLR.success : sub.avgScore >= 40 ? CLR.warning : CLR.danger} shimmer={sub.avgScore < 50} />
                  <span className={`text-[11px] font-bold w-10 text-right tabular-nums ${sub.avgScore >= 60 ? 'text-emerald-600' : sub.avgScore >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>{sub.avgScore}%</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
        <ChartCard title="Class Performance" sub="Average score by class" delay={2}>
          {classData.length === 0 ? <Empty icon={School} title="No class performance yet" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} cursor={{ fill: 'rgba(109,76,255,0.06)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="avgScore" name="Avg Score %" fill={CLR.primary} radius={[6, 6, 0, 0]} barSize={20} />
                <Bar dataKey="passRate" name="Pass Rate %" fill={CLR.success} radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Top performers + at-risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 bg-white border border-gray-100 shadow-sm anim-fade-up delay-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5"><Award className="w-4 h-4 text-[#6D4CFF]" /> Top Performing Students</h4>
          </div>
          {topStudents.length === 0 ? <Empty icon={Users} title="No student analytics yet" /> : (
            <div className="space-y-2">
              {topStudents.map((st: any, i: number) => (
                <div key={st.id || i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 hover:translate-x-0.5 transition-all">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: i === 0 ? '#F3F0FF' : '#F9FAFB', color: i === 0 ? CLR.primary : '#6B7280' }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{st.full_name}</div>
                    <div className="text-[10px] text-gray-400">Roll: {st.roll_number || '—'} · GPA {st.gpa || '—'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16">
                      <RateBar rate={num(st.avgExamScore)} color={CLR.success} />
                    </div>
                    <Badge className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 tabular-nums">{num(st.avgExamScore)}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-4 bg-white border border-gray-100 shadow-sm anim-fade-up delay-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-red-500" /> Students Needing Attention</h4>
          </div>
          {atRisk.length === 0 ? <Empty icon={CheckCircle2} title="No students at risk" sub="All students are performing within acceptable levels" /> : (
            <div className="space-y-2">
              {atRisk.map((st: any, i: number) => (
                <div key={st.id || i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 hover:translate-x-0.5 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{st.full_name}</div>
                    <div className="text-[10px] text-gray-400">Roll: {st.roll_number || '—'} · GPA {st.gpa || '—'}</div>
                  </div>
                  <Badge className="text-[10px] border" style={{ background: `${riskColor(st.riskLevel)}1A`, color: riskColor(st.riskLevel), borderColor: `${riskColor(st.riskLevel)}33` }}>
                    {riskLabel(st.riskLevel)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ======================== STUDENTS ========================
function StudentsView({ students, refreshKey }: { students: any; refreshKey: number }) {
  const list = useApi(() => academicAnalyticsApiV2.getStudentAnalytics(), [refreshKey]);
  const classes = useApi(() => classApi.getAll(), [refreshKey]);
  const [search, setSearch] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const detail = useApi(() => examApiV2.getStudentPerformance(selId as string), [selId, refreshKey], !!selId);

  const classMap = useMemo(() => Object.fromEntries((classes.data || []).map((c: any) => [c.id, c])), [classes.data]);
  const metaMap = useMemo(() => Object.fromEntries((students?.data || []).map((st: any) => [st.id, st])), [students?.data]);

  const filtered = useMemo(() => {
    const arr = list.data || [];
    if (!search) return arr;
    const q = search.toLowerCase();
    return arr.filter((st: any) => st.full_name?.toLowerCase().includes(q) || st.roll_number?.toLowerCase().includes(q));
  }, [list.data, search]);

  const selected = filtered.find((st: any) => st.id === selId) || null;
  const meta = selId ? metaMap[selId] : null;
  const d = detail.data;

  const exportCSV = () => {
    const rows = (d?.results || []).map((r: any) => ({
      'Exam': r.exam?.name || '—',
      'Subject': r.subject?.name || r.subject_name || '—',
      'Marks Obtained': r.marks_obtained ?? '—',
      'Max Marks': r.max_marks ?? r.total_marks ?? '—',
      'Percentage': r.percentage != null ? `${r.percentage}%` : (num(r.max_marks) > 0 ? `${Math.round((num(r.marks_obtained) / num(r.max_marks)) * 100)}%` : '—'),
      'Grade': r.grade || '—',
      'Result': r.is_passed ? 'PASS' : 'FAIL'
    }));
    if (rows.length === 0) return toast.warning('No exam results to export');
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(','), ...rows.map((rw: any) => headers.map(h => `"${String(rw[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `academics-${selected?.roll_number || selId}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Student results exported');
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-white border border-gray-100 shadow-sm anim-fade-up delay-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search student by name or roll number..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF]"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        {/* Student list */}
        <Card className="p-3 bg-white border border-gray-100 shadow-sm anim-fade-up delay-2">
          <div className="flex items-center justify-between px-1 mb-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Students</h4>
            <span className="text-[10px] text-gray-400">{filtered.length} found</span>
          </div>
          {list.loading ? <Loader label="Loading students..." /> : filtered.length === 0 ? (
            <Empty icon={Users} title="No students found" sub="Try a different search term" />
          ) : (
            <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
              {filtered.map((st: any) => (
                <button
                  key={st.id}
                  onClick={() => setSelId(st.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left border transition-all ${selId === st.id ? 'border-[#6D4CFF] bg-[#6D4CFF]/5 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                    {(st.full_name || 'S')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{st.full_name}</div>
                    <div className="text-[10px] text-gray-400">Roll {st.roll_number || '—'} · {classMap[st.class_id]?.name || metaMap[st.id]?.student_class || '—'}</div>
                  </div>
                  <Badge className="text-[9px] border" style={{ background: `${riskColor(st.riskLevel)}1A`, color: riskColor(st.riskLevel), borderColor: `${riskColor(st.riskLevel)}33` }}>
                    {st.gpa || '—'}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Student detail */}
        <Card className="p-5 bg-white border border-gray-100 shadow-sm anim-fade-up delay-3">
          {!selId ? (
            <Empty icon={User} title="Select a student" sub="Choose a student from the list to view their academic performance" />
          ) : detail.loading ? (
            <Loader label="Loading student performance..." />
          ) : (
            <div className="space-y-4">
              {/* Profile header */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white text-sm font-bold">
                    {(selected?.full_name || meta?.full_name || 'S')[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{selected?.full_name || meta?.full_name || '—'}</h4>
                    <p className="text-xs text-gray-400">
                      Roll {selected?.roll_number || meta?.roll_number || '—'} ·
                      {meta ? `${meta.student_class || ''}${meta.section ? ` (${meta.section})` : ''}` : classMap[selected?.class_id]?.name || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selected?.riskLevel && (
                    <Badge className="text-[10px] border" style={{ background: `${riskColor(selected.riskLevel)}1A`, color: riskColor(selected.riskLevel), borderColor: `${riskColor(selected.riskLevel)}33` }}>
                      Risk: {riskLabel(selected.riskLevel)}
                    </Badge>
                  )}
                  <button onClick={exportCSV} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-[11px] font-semibold hover:bg-gray-50">
                    <Download size={12} /> Export
                  </button>
                </div>
              </div>

              {/* Student summary KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard icon={BarChart3} label="Avg Exam Score" value={selected?.avgExamScore != null ? Math.round(num(selected.avgExamScore)) : null} suffix="%" sub={`${num(d?.summary?.total)} results`} color={CLR.primary} bg="#F3F0FF" delay={1} />
                <KpiCard icon={Award} label="GPA" value={selected?.gpa ?? '—'} sub="Overall (0-5 scale)" color={CLR.secondary} bg="#FAF5FF" delay={2} />
                <KpiCard icon={GraduationCap} label="Attendance" value={selected?.attendancePct != null ? Math.round(num(selected.attendancePct)) : null} suffix="%" sub="All records" color={CLR.info} bg="#EFF6FF" delay={3} />
                <KpiCard icon={FileText} label="Assignments" value={num(selected?.gradedAssignments)} sub={`${num(selected?.totalAssignments)} total`} color={CLR.success} bg="#F0FDF4" delay={4} />
              </div>

              {/* Pass summary */}
              {d?.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <KpiCard icon={Target} label="Pass Rate" value={d.summary.passPercentage != null ? Math.round(num(d.summary.passPercentage)) : null} suffix="%" sub={`${num(d.summary.passed)} passed`} color={CLR.success} bg="#F0FDF4" delay={1} />
                  <KpiCard icon={CheckCircle2} label="Passed" value={num(d.summary.passed)} sub="Exams cleared" color={CLR.success} bg="#F0FDF4" delay={2} />
                  <KpiCard icon={XCircle} label="Failed" value={num(d.summary.failed)} sub="Needs attention" color={CLR.danger} bg="#FEF2F2" delay={3} />
                  <KpiCard icon={Layers} label="Avg Marks" value={d.summary.averageMarks ?? '—'} sub="Per result" color={CLR.warning} bg="#FFFBEB" delay={4} />
                </div>
              )}

              {/* Subject performance chart */}
              {d?.bySubject && d.bySubject.length > 0 && (
                <ChartCard title="Subject-wise Performance" sub="Average percentage by subject" height={200} delay={2}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={d.bySubject.map((x: any) => ({ name: x.subject, avg: num(x.avg) }))} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} cursor={{ fill: 'rgba(109,76,255,0.06)' }} />
                      <Bar dataKey="avg" name="Avg %" fill={CLR.primary} radius={[6, 6, 0, 0]} barSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}

              {/* Exam results table */}
              {d?.results && d.results.length > 0 && (
                <ChartCard title="Exam Results" sub="Latest results across all exams" height="auto" delay={3}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-[10px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                          <th className="py-2 pr-3">Exam</th>
                          <th className="py-2 pr-3">Subject</th>
                          <th className="py-2 pr-3 text-center">Marks</th>
                          <th className="py-2 pr-3 text-center">%</th>
                          <th className="py-2 pr-3 text-center">Grade</th>
                          <th className="py-2 text-center">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.results.map((r: any, i: number) => {
                          const maxM = num(r.max_marks) || num(r.total_marks);
                          const percentage = r.percentage != null ? num(r.percentage) : (maxM > 0 ? (num(r.marks_obtained) / maxM) * 100 : 0);
                          return (
                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/40">
                              <td className="py-2 pr-3 font-medium text-gray-700">{r.exam?.name || '—'}<div className="text-[9px] text-gray-400">{r.exam?.term ? `${r.exam.term} · ` : ''}{r.exam?.academic_year || ''}</div></td>
                              <td className="py-2 pr-3 text-gray-600">{r.subject?.name || r.subject_name || '—'}</td>
                              <td className="py-2 pr-3 text-center text-gray-600">{num(r.marks_obtained)} / {maxM}</td>
                              <td className="py-2 pr-3 text-center font-semibold" style={{ color: percentage >= 40 ? CLR.success : CLR.danger }}>{Math.round(percentage)}%</td>
                              <td className="py-2 pr-3 text-center"><Badge className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200">{r.grade || '—'}</Badge></td>
                              <td className="py-2 text-center">
                                <Badge className={`text-[10px] border ${r.is_passed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                  {r.is_passed ? 'PASS' : 'FAIL'}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </ChartCard>
              )}
              {(!d?.results || d.results.length === 0) && (
                <Empty icon={FileText} title="No exam results recorded" sub="Results will appear once marks are entered for this student" />
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ======================== CLASSES ========================
function ClassesView({ refreshKey }: { refreshKey: number }) {
  const clsData = useApi(() => academicAnalyticsApiV2.getClassAnalytics(), [refreshKey]);
  const studentData = useApi(() => academicAnalyticsApiV2.getStudentAnalytics(), [refreshKey]);
  const [selClass, setSelClass] = useState<string | null>(null);

  const classes = useMemo(() => [...(clsData.data || [])].sort((a: any, b: any) => num(b.avgScore) - num(a.avgScore)), [clsData.data]);
  const selectedClass = classes.find((c: any) => c.class_id === selClass) || null;
  const classStudents = useMemo(() => (studentData.data || []).filter((st: any) => st.class_id === selClass)
    .sort((a: any, b: any) => num(b.avgExamScore) - num(a.avgExamScore)), [studentData.data, selClass]);

  if (clsData.loading) return <Loader label="Loading class performance..." />;
  if (clsData.error) return <Empty icon={AlertTriangle} title="Failed to load class data" sub={clsData.error} />;

  return (
    <div className="space-y-4">
      {/* Class summary table */}
      <Card className="p-4 bg-white border border-gray-100 shadow-sm anim-fade-up delay-1">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-800">Class Performance Summary</h4>
          <span className="text-[11px] text-gray-400">{classes.length} classes</span>
        </div>
        {classes.length === 0 ? <Empty icon={School} title="No class analytics yet" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                  <th className="py-2 pr-3">Class</th>
                  <th className="py-2 pr-3 text-center">Students</th>
                  <th className="py-2 pr-3 text-center">Avg Score</th>
                  <th className="py-2 pr-3 text-center">Exam Avg</th>
                  <th className="py-2 pr-3 text-center">Pass Rate</th>
                  <th className="py-2 pr-3 text-center">Attendance</th>
                  <th className="py-2 text-center">View</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c: any) => (
                  <tr key={c.class_id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                    <td className="py-2.5 pr-3 font-semibold text-gray-800">{c.class_name}</td>
                    <td className="py-2.5 pr-3 text-center text-gray-600">{num(c.studentCount)}</td>
                    <td className="py-2.5 pr-3 text-center font-bold text-[#6D4CFF] tabular-nums">{num(c.avgScore)}%</td>
                    <td className="py-2.5 pr-3 text-center text-gray-600 tabular-nums">{num(c.avgExamScore)}%</td>
                    <td className="py-2.5 pr-3 text-center">
                      <Badge className={`text-[10px] border tabular-nums ${num(c.passRate) >= 60 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : num(c.passRate) >= 40 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                        {num(c.passRate)}%
                      </Badge>
                    </td>
                    <td className="py-2.5 pr-3 text-center text-gray-600 tabular-nums">{num(c.attendanceRate)}%</td>
                    <td className="py-2.5 text-center">
                      <button onClick={() => setSelClass(c.class_id)} className="px-3 py-1 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF] text-[10px] font-bold hover:bg-[#6D4CFF]/20 transition-colors">
                        {selClass === c.class_id ? 'Showing' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Class detail */}
      {selectedClass && (
        <Card className="p-4 bg-white border border-gray-100 shadow-sm anim-fade-up delay-2">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#6D4CFF]/10 flex items-center justify-center"><School className="w-4 h-4 text-[#6D4CFF]" /></div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">{selectedClass.class_name}</h4>
                <p className="text-[11px] text-gray-400">{num(selectedClass.studentCount)} students · Avg {num(selectedClass.avgScore)}% · Pass {num(selectedClass.passRate)}%</p>
              </div>
            </div>
            <button onClick={() => setSelClass(null)} className="text-[11px] text-gray-400 hover:text-gray-600 font-semibold">Close</button>
          </div>
          {studentData.loading ? <Loader label="Loading students..." /> : classStudents.length === 0 ? (
            <Empty icon={Users} title="No student analytics for this class" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                    <th className="py-2 pr-3">#</th>
                    <th className="py-2 pr-3">Student</th>
                    <th className="py-2 pr-3 text-center">Exam Avg</th>
                    <th className="py-2 pr-3 text-center">Attendance</th>
                    <th className="py-2 pr-3 text-center">GPA</th>
                    <th className="py-2 text-center">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((st: any, i: number) => (
                    <tr key={st.id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                      <td className="py-2.5 pr-3 text-gray-400 font-bold">{i + 1}</td>
                      <td className="py-2.5 pr-3">
                        <div className="font-semibold text-gray-800">{st.full_name}</div>
                        <div className="text-[10px] text-gray-400">Roll {st.roll_number || '—'}</div>
                      </td>
                      <td className="py-2.5 pr-3 text-center font-semibold text-gray-700 tabular-nums">{num(st.avgExamScore)}%</td>
                      <td className="py-2.5 pr-3 text-center text-gray-600 tabular-nums">{num(st.attendancePct)}%</td>
                      <td className="py-2.5 pr-3 text-center text-gray-600">{st.gpa || '—'}</td>
                      <td className="py-2.5 text-center">
                        <Badge className="text-[10px] border" style={{ background: `${riskColor(st.riskLevel)}1A`, color: riskColor(st.riskLevel), borderColor: `${riskColor(st.riskLevel)}33` }}>
                          {riskLabel(st.riskLevel)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ======================== EXAMS ========================
function ExamsView({ refreshKey }: { refreshKey: number }) {
  const exams = useApi(() => examApiV2.getExams({ limit: 100 }), [refreshKey]);
  const [selExam, setSelExam] = useState<string | null>(null);
  const results = useApi(() => marksApiV4.getExamResults(selExam as string), [selExam, refreshKey], !!selExam);

  const examList = exams.data?.data || [];
  const selectedExam = examList.find((e: any) => e.id === selExam) || null;

  const rankings = useMemo(() => {
    const rows = results.data || [];
    const grouped = new Map<string, any>();
    for (const r of rows) {
      const sid = r.student_id || r.student?.id;
      if (!sid) continue;
      if (!grouped.has(sid)) {
        grouped.set(sid, { student_id: sid, full_name: r.student?.full_name || '', roll_number: r.student?.roll_number || '', total: 0, max: 0, count: 0, grades: [] as string[] });
      }
      const g = grouped.get(sid);
      g.total += num(r.marks_obtained);
      g.max += num(r.max_marks) || num(r.total_marks);
      g.count += 1;
      if (r.grade) g.grades.push(r.grade);
    }
    return Array.from(grouped.values())
      .map((g: any) => ({ ...g, percentage: g.max > 0 ? Math.round((g.total / g.max) * 10000) / 100 : 0 }))
      .sort((a: any, b: any) => b.total - a.total)
      .map((g: any, i: number) => ({ rank: i + 1, ...g }));
  }, [results.data]);

  const avgPct = rankings.length > 0 ? Math.round(rankings.reduce((s: any, r: any) => s + r.percentage, 0) / rankings.length) : 0;
  const passCount = rankings.filter((r: any) => r.percentage >= 40).length;

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-white border border-gray-100 shadow-sm anim-fade-up delay-1">
        <label className="text-[10px] font-semibold text-gray-500 uppercase">Select Exam</label>
        <select
          value={selExam || ''}
          onChange={e => setSelExam(e.target.value || null)}
          className="mt-1 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF]"
        >
          <option value="">Choose an exam to view results...</option>
          {examList.map((e: any) => (
            <option key={e.id} value={e.id}>{e.name}{e.term ? ` (${e.term})` : ''}</option>
          ))}
        </select>
      </Card>

      {!selExam ? (
        <Empty icon={FileText} title="Select an exam" sub="Pick an exam to view student rankings and pass/fail results" />
      ) : results.loading ? (
        <Loader label="Loading exam results..." />
      ) : rankings.length === 0 ? (
        <Empty icon={FileText} title="No results recorded" sub="Marks have not been entered for this exam yet" />
      ) : (
        <div className="space-y-4">
          {/* Exam KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={FileText} label="Exam" value={selectedExam?.name || '—'} sub={selectedExam?.exam_type || '—'} color={CLR.primary} bg="#F3F0FF" delay={1} />
            <KpiCard icon={Users} label="Students" value={rankings.length} sub="With marks entered" color={CLR.info} bg="#EFF6FF" delay={2} />
            <KpiCard icon={Percent} label="Class Average" value={avgPct} suffix="%" sub="All students" color={CLR.secondary} bg="#FAF5FF" delay={3} />
            <KpiCard icon={Target} label="Pass Rate" value={passCount > 0 ? Math.round((passCount / rankings.length) * 100) : 0} suffix="%" sub={`${passCount} passed`} color={CLR.success} bg="#F0FDF4" delay={4} />
          </div>

          {/* Rankings table */}
          <Card className="p-4 bg-white border border-gray-100 shadow-sm anim-fade-up delay-3">
            <h4 className="text-sm font-bold text-gray-800 mb-3">Student Rankings</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                    <th className="py-2 pr-3">Rank</th>
                    <th className="py-2 pr-3">Student</th>
                    <th className="py-2 pr-3 text-center">Total</th>
                    <th className="py-2 pr-3 text-center">Max</th>
                    <th className="py-2 pr-3 text-center">Percentage</th>
                    <th className="py-2 pr-3 text-center">Subjects</th>
                    <th className="py-2 text-center">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((r: any) => (
                    <tr key={r.student_id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                      <td className="py-2.5 pr-3">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${r.rank <= 3 ? 'bg-[#6D4CFF]/10 text-[#6D4CFF]' : 'bg-gray-50 text-gray-400'}`}>{r.rank}</span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="font-semibold text-gray-800">{r.full_name || '—'}</div>
                        <div className="text-[10px] text-gray-400">Roll {r.roll_number || '—'}</div>
                      </td>
                      <td className="py-2.5 pr-3 text-center font-bold text-gray-700 tabular-nums">{r.total}</td>
                      <td className="py-2.5 pr-3 text-center text-gray-500 tabular-nums">{r.max}</td>
                      <td className="py-2.5 pr-3 text-center font-semibold tabular-nums" style={{ color: r.percentage >= 40 ? CLR.success : CLR.danger }}>{r.percentage}%</td>
                      <td className="py-2.5 pr-3 text-center text-gray-600">{r.count}</td>
                      <td className="py-2.5 text-center">
                        <Badge className={`text-[10px] border ${r.percentage >= 40 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          {r.percentage >= 40 ? 'PASS' : 'FAIL'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ======================== MAIN ========================
export function StudentAcademicsTab({ students }: { students: any }) {
  const [tab, setTab] = useState<'overview' | 'students' | 'classes' | 'exams'>('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const dash = useApi(() => academicAnalyticsApiV2.getDashboard(), [refreshKey]);
  const pred = useApi(() => predictiveAiApiV2.getDashboard(), [refreshKey]);
  const ai = useApi(() => academicAnalyticsApiV2.getAiInsights(), [refreshKey]);
  const s = dash.data?.summary || {};
  const p = pred.data || {};
  const a = ai.data || {};

  const TABS = [
    { key: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { key: 'students' as const, label: 'Students', icon: Users },
    { key: 'classes' as const, label: 'Classes', icon: School },
    { key: 'exams' as const, label: 'Exams', icon: FileText },
  ];

  const spark = (arr: any[]) => {
    const vals = Array.isArray(arr) ? arr.map((v: any) => Number(v) || 0) : [];
    const max = Math.max(1, ...vals);
    const w = 64, h = 24, step = w / Math.max(1, vals.length - 1);
    return vals.map((v, i) => `${i * step},${h - (v / max) * h}`).join(' ');
  };

  const healthScore = num(p.academicHealthScore) || num(s.avgAcademicScore);
  const scoreColor = healthScore >= 80 ? CLR.success : healthScore >= 55 ? CLR.warning : CLR.danger;

  const subjectPerf = dash.data?.subjectPerformance || [];
  const classPerf = dash.data?.classPerformance || [];
  const bestSubject = [...subjectPerf].sort((a: any, b: any) => num(b.avgScore) - num(a.avgScore))[0];
  const weakestSubject = [...subjectPerf].sort((a: any, b: any) => num(a.avgScore) - num(b.avgScore))[0];
  const topClass = [...classPerf].sort((a: any, b: any) => num(b.avgScore) - num(a.avgScore))[0];

  const heroMetrics = [
    { label: 'AI Health Score', value: `${healthScore || '—'}%`, trend: p.trends?.healthScore, spark: spark(p.sparklines?.health), color: '#A78BFA' },
    { label: 'Predicted Pass Rate', value: `${p.predictedPassRate ?? '—'}%`, trend: p.trends?.predictedPassRate, spark: spark(p.sparklines?.passRate), color: '#34D399' },
    { label: 'Predicted Failures', value: a.predictedFailures ?? '—', trend: null, spark: '', color: '#F87171' },
    { label: 'Dropout Risk', value: `${p.predictedDropoutRisk ?? '—'}%`, trend: p.trends?.dropoutRisk, spark: spark(p.sparklines?.dropout), color: '#FBBF24' },
    { label: 'Attendance Forecast', value: `${p.attendanceForecast ?? '—'}%`, trend: p.trends?.attendanceForecast, spark: spark(p.sparklines?.attendance), color: '#60A5FA' },
    { label: 'AI Accuracy', value: `${p.aiPredictionAccuracy ?? '—'}%`, trend: p.trends?.accuracy, spark: spark(p.sparklines?.accuracy), color: '#F472B6' },
  ];

  const atRiskCount = num(s.atRiskStudents) || num(a.totalAtRisk);
  const suggestions = Array.isArray(a.improvementSuggestions) ? a.improvementSuggestions : [];

  return (
    <div className="px-6 pb-6 space-y-6 anim-fade-in">
      <ModuleHeader
        icon={GraduationCap}
        gradient="bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6]"
        title="Academic Performance"
        subtitle="Monitor grades, exam results, and class performance across the school"
        onRefresh={() => setRefreshKey(k => k + 1)}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard icon={Award} label="Avg Academic Score" value={s.avgAcademicScore != null ? Math.round(num(s.avgAcademicScore)) : null} suffix="%" sub={`Growth: ${s.academicGrowthRate || 0}%`} color={CLR.primary} bg="#F3F0FF" delay={1} />
        <KpiCard icon={Target} label="Pass Rate" value={s.passRate != null ? Math.round(num(s.passRate)) : null} suffix="%" sub={`${num(s.totalStudents)} total students`} color={CLR.success} bg="#F0FDF4" delay={2} />
        <KpiCard icon={GraduationCap} label="Attendance Rate" value={s.attendanceRate != null ? Math.round(num(s.attendanceRate)) : null} suffix="%" sub="Across all records" color={CLR.info} bg="#EFF6FF" delay={3} />
        <KpiCard icon={ShieldAlert} label="At-Risk Students" value={atRiskCount} sub="need intervention" color={CLR.danger} bg="#FEF2F2" delay={4} />
        <KpiCard icon={BarChart3} label="Avg Exam Score" value={s.avgExamScore != null ? Math.round(num(s.avgExamScore)) : null} suffix="%" sub="Examinations" color={CLR.secondary} bg="#FAF5FF" delay={5} />
        <KpiCard icon={Layers} label="Avg Grade Score" value={s.avgGradeScore != null ? Math.round(num(s.avgGradeScore)) : null} suffix="%" sub="Continuous assessment" color={CLR.warning} bg="#FFFBEB" delay={5} />
      </div>

      {/* AI Academic Intelligence hero */}
      <div className="rounded-2xl overflow-hidden text-white p-6 relative anim-gradient anim-fade-up delay-1"
        style={{ background: 'linear-gradient(-45deg, #6D4CFF 0%, #8B5CF6 40%, #3B82F6 70%, #2D1B69 100%)', backgroundSize: '220% 220%' }}>
        <div className="absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl anim-float" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-[#22D3EE]/30 blur-2xl anim-pulse-glow" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-[#A855F7]/25 blur-3xl anim-float" style={{ animationDelay: '1.5s' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Brain size={16} className="anim-pulse-glow" />
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90">AI Academic Intelligence</span>
          </div>
          <h3 className="text-xl font-extrabold mb-4">Predictive Academic Health Dashboard</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {heroMetrics.map((m, i) => (
              <div key={m.label} className="rounded-xl bg-white/10 p-3 backdrop-blur-sm border border-white/10 anim-fade-up hover:bg-white/20 hover:-translate-y-0.5 transition-all"
                style={{ animationDelay: `${0.12 * i}s` }}>
                <div className="text-[9px] uppercase tracking-wider opacity-75">{m.label}</div>
                <div className="text-lg font-extrabold mt-0.5 flex items-center gap-1.5 tabular-nums">{m.value} <TrendPill value={m.trend} /></div>
                {m.spark && m.spark.length > 1 ? (
                  <svg width="64" height="24" viewBox="0 0 64 24" className="mt-1.5 opacity-80">
                    <polyline points={m.spark} fill="none" stroke={m.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <div className="flex items-center gap-1.5 mt-1.5 opacity-80">
                    <Sparkles size={10} style={{ color: m.color }} />
                    <span className="text-[8px] text-white/60">live prediction</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-white/10 anim-ping-slow" />
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 relative">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="9" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="9" strokeLinecap="round"
                    strokeDasharray={`${(healthScore / 100) * 264} 264`} style={{ transition: 'stroke-dasharray 1s ease' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold tabular-nums" style={{ color: scoreColor }}>{healthScore}</span>
                  <span className="text-[7px] uppercase tracking-widest opacity-75">Health</span>
                </div>
              </div>
              <div className="text-xs text-white/90 max-w-md leading-relaxed">
                {atRiskCount > 0
                  ? <><strong className="text-white">{atRiskCount} students</strong> are flagged at-risk across attendance, exams, and assignments.{' '}
                      {suggestions.length > 0 && <span className="text-emerald-200">AI has prepared {suggestions.length} intervention strategies.</span>}</>
                  : <span className="text-emerald-200">No critical at-risk signals detected — academic health is stable.</span>}
                <div className="flex items-center gap-1.5 mt-1">
                  <Gauge size={11} className="text-[#A78BFA]" />
                  {bestSubject ? <span className="text-white/90">Strongest: {bestSubject.subject_name} ({num(bestSubject.avgScore)}%)</span> : <span className="text-white/90">No subject data</span>}
                  {weakestSubject && bestSubject && bestSubject.subject_name !== weakestSubject.subject_name && (
                    <span className="text-white/90">· Needs focus: {weakestSubject.subject_name} ({num(weakestSubject.avgScore)}%)</span>
                  )}
                </div>
              </div>
            </div>
            {topClass && (
              <div className="hidden md:flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 px-3 py-2">
                <Award size={14} className="text-[#FBBF24]" />
                <div>
                  <div className="text-[8px] uppercase tracking-wider opacity-75">Top Class</div>
                  <div className="text-xs font-bold">{topClass.class_name} · {num(topClass.avgScore)}%</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI suggestions strip */}
      {suggestions.length > 0 && (
        <div className="rounded-xl p-4 bg-gradient-to-r from-[#F3F0FF] via-white to-[#F0FDF4] border border-gray-100 shadow-sm anim-fade-up delay-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={13} className="text-[#6D4CFF]" />
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">AI Intervention Strategies</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((rec: any, i: number) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-gray-100 text-[11px] text-gray-600 hover:border-[#6D4CFF]/40 hover:-translate-y-0.5 transition-all">
                <CheckCircle2 size={11} className="text-[#6D4CFF]" /> {rec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar nav + content */}
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="lg:w-44 flex-shrink-0">
          <div className="flex lg:flex-col gap-1 bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm anim-fade-up delay-2 overflow-x-auto lg:sticky lg:top-4">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${tab === t.key ? 'bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {tab === 'overview' && <OverviewView refreshKey={refreshKey} />}
          {tab === 'students' && <StudentsView students={students} refreshKey={refreshKey} />}
          {tab === 'classes' && <ClassesView refreshKey={refreshKey} />}
          {tab === 'exams' && <ExamsView refreshKey={refreshKey} />}
        </div>
      </div>
    </div>
  );
}
