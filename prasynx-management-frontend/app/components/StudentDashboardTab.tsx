'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users, Loader2, GraduationCap, UserCheck, UserPlus, Brain,
  ShieldAlert, ShieldCheck, AlertTriangle, ArrowDownRight, ArrowUpRight, LayoutDashboard, BookOpen,
  Heart, Bus, MessageSquare, ClipboardList, CalendarDays, BookMarked, UserRound,
  TrendingUp, FileSpreadsheet
} from 'lucide-react';
import {
  academicAnalyticsApiV2, predictiveAiApiV2, riskDetectionApi, admissionApi
} from '../lib/dataService';
import { useApi } from '../lib/useApi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, Legend, PieChart, Pie
} from 'recharts';

const CLR = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', secondary: '#8B5CF6' };
const CHART_COLORS = ['#6D4CFF', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

const num = (v: any, fallback = 0) => { const n = Number(v); return isFinite(n) ? n : fallback; };

function useCountUp(target: any, duration = 900) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef(0);
  useEffect(() => {
    const to = num(target);
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

function KpiCard({ icon: Icon, label, value, sub, color, bg, delay = 0, suffix }: { icon: any; label: string; value: any; sub?: string; color: string; bg: string; delay?: number; suffix?: string }) {
  return (
    <Card className={`p-4 bg-white border border-gray-100 shadow-sm flex items-center gap-3 hover-lift hover:shadow-lg transition-all anim-fade-up delay-${delay}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden" style={{ background: bg, color }}>
        <Icon className="w-5 h-5 relative z-10" />
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle at 50% 50%, ${color}22, transparent 70%)` }} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-gray-500 font-medium truncate">{label}</div>
        <div className="text-xl font-bold text-gray-900 leading-tight tabular-nums"><AnimatedValue value={value} suffix={suffix} /></div>
        {sub && <div className="text-[9px] text-gray-400 truncate">{sub}</div>}
      </div>
    </Card>
  );
}

function ChartCard({ title, sub, children, height = 220, delay = 0 }: { title: string; sub?: string; children: React.ReactNode; height?: number | string; delay?: number }) {
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

function Loader({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-8 h-8 text-[#6D4CFF] animate-spin" />
      <p className="text-xs text-gray-400 font-medium">{label}</p>
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

const QUICK_ACTIONS = [
  { key: 'directory', label: 'Student Directory', icon: Users, gradient: 'from-[#6D4CFF] to-[#8B5CF6]' },
  { key: 'admissions', label: 'Admissions', icon: UserPlus, gradient: 'from-[#3B82F6] to-[#06B6D4]' },
  { key: 'attendance', label: 'Attendance', icon: ClipboardList, gradient: 'from-[#22C55E] to-[#06B6D4]' },
  { key: 'academics', label: 'Academics', icon: BookOpen, gradient: 'from-[#6D4CFF] to-[#A855F7]' },
  { key: 'subjects', label: 'Subjects', icon: BookMarked, gradient: 'from-[#F59E0B] to-[#EF4444]' },
  { key: 'timetable', label: 'Timetable', icon: CalendarDays, gradient: 'from-[#3B82F6] to-[#6366F1]' },
  { key: 'examinations', label: 'Examinations', icon: FileSpreadsheet, gradient: 'from-[#EC4899] to-[#8B5CF6]' },
  { key: 'promotion', label: 'Promotion', icon: TrendingUp, gradient: 'from-[#F59E0B] to-[#EF4444]' },
  { key: 'health', label: 'Health', icon: Heart, gradient: 'from-[#22C55E] to-[#84CC16]' },
  { key: 'transport', label: 'Transport', icon: Bus, gradient: 'from-[#A855F7] to-[#EC4899]' },
  { key: 'discipline', label: 'Discipline', icon: ShieldCheck, gradient: 'from-[#EF4444] to-[#8B5CF6]' },
  { key: 'communication', label: 'Communication', icon: MessageSquare, gradient: 'from-[#6D4CFF] to-[#3B82F6]' },
  { key: 'analytics', label: 'AI Analytics', icon: Brain, gradient: 'from-[#0EA5E9] to-[#6D4CFF]' },
];

export default function StudentDashboardTab({ students, onNavigate }: { students: any; onNavigate?: (tab: string) => void }) {
  const dash = useApi(() => academicAnalyticsApiV2.getDashboard(), []);
  const pred = useApi(() => predictiveAiApiV2.getDashboard(), []);
  const risk = useApi(() => predictiveAiApiV2.getRiskAnalysis(), []);
  const reports = useApi(() => admissionApi.getReports(), []);
  const apps = useApi(() => admissionApi.getApplications(), []);

  const studentList = Array.isArray(students?.data) ? students.data : [];
  const d = dash.data || {};
  const s = d.summary || {};
  const p = pred.data || {};
  const r = risk.data || {};
  const stats = reports.data || {};

  const total = studentList.length;
  const activeCount = studentList.filter((st: any) => st.status === 'active').length;
  const newCount = studentList.filter((st: any) => st.status === 'new' || st.status === 'pending').length;
  const maleCount = studentList.filter((st: any) => (st.gender || st.sex || '').toLowerCase() === 'male').length;
  const femaleCount = studentList.filter((st: any) => (st.gender || st.sex || '').toLowerCase() === 'female').length;
  const classCount = new Set(studentList.map((st: any) => st.class_name || st.class)).size;

  const classDist = useMemo(() => {
    const map = new Map<string, number>();
    studentList.forEach((st: any) => {
      const c = st.class_name || st.class || 'Unassigned';
      map.set(c, (map.get(c) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [studentList]);

  const statusDist = useMemo(() => {
    const map = new Map<string, number>();
    studentList.forEach((st: any) => {
      const stt = (st.status || 'unknown').toLowerCase();
      map.set(stt, (map.get(stt) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [studentList]);

  const genderData = [
    { name: 'Male', value: maleCount, color: '#3B82F6' },
    { name: 'Female', value: femaleCount, color: '#EC4899' },
    { name: 'Other', value: Math.max(0, total - maleCount - femaleCount), color: '#8B5CF6' },
  ].filter(x => x.value > 0);

  const trendData = d.performanceTrend || [];
  const gradeData = (d.gradeDistribution || []).map((x: any) => ({ name: x.label, count: num(x.count) }));
  const classPerf = (d.classPerformance || []).map((x: any) => ({ name: x.class_name, avgScore: num(x.avgScore) }));
  const studentAnalytics = d.studentAnalytics || [];
  const atRisk = studentAnalytics.filter((st: any) => st.riskLevel === 'high' || st.riskLevel === 'critical')
    .sort((a: any, b: any) => num(a.gpa) - num(b.gpa)).slice(0, 6);
  const topStudents = [...studentAnalytics].sort((a: any, b: any) => num(b.avgExamScore) - num(a.avgExamScore)).slice(0, 5);
  const recentApps = [...(apps.data || [])]
    .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 6);

  const spark = (arr: any[]) => {
    const vals = Array.isArray(arr) ? arr.map((v: any) => Number(v) || 0) : [];
    const max = Math.max(1, ...vals);
    const w = 64, h = 28, step = w / Math.max(1, vals.length - 1);
    return vals.map((v, i) => `${i * step},${h - (v / max) * h}`).join(' ');
  };
  const sparkline = (key: string) => (Array.isArray(p.sparklines?.[key]) ? (p.sparklines[key] as any[]) : []);

  const aiMetrics = [
    { label: 'AI Health Score', value: `${p.academicHealthScore ?? '—'}%`, trend: p.trends?.healthScore, spark: sparkline('health'), color: '#A78BFA' },
    { label: 'Predicted Pass Rate', value: `${p.predictedPassRate ?? '—'}%`, trend: p.trends?.predictedPassRate, spark: sparkline('passRate'), color: '#34D399' },
    { label: 'Students At Risk', value: p.studentsAtRisk ?? '—', trend: p.trends?.studentsAtRisk, spark: sparkline('atRisk'), color: '#F87171' },
    { label: 'Dropout Risk', value: `${p.predictedDropoutRisk ?? '—'}%`, trend: p.trends?.dropoutRisk, spark: sparkline('dropout'), color: '#FBBF24' },
    { label: 'Attendance Forecast', value: `${p.attendanceForecast ?? '—'}%`, trend: p.trends?.attendanceForecast, spark: sparkline('attendance'), color: '#60A5FA' },
    { label: 'Prediction Accuracy', value: `${p.aiPredictionAccuracy ?? '—'}%`, trend: p.trends?.accuracy, spark: sparkline('accuracy'), color: '#F472B6' },
  ];

  const healthScore = num(p.academicHealthScore);
  const scoreColor = healthScore >= 80 ? CLR.success : healthScore >= 55 ? CLR.warning : CLR.danger;

  return (
    <div className="p-6 space-y-5 anim-fade-in">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard icon={Users} label="Total Students" value={total} sub={`${classCount} classes`} color={CLR.primary} bg="#F3F0FF" delay={1} />
        <KpiCard icon={UserCheck} label="Active" value={activeCount} sub="enrolled & active" color={CLR.success} bg="#F0FDF4" delay={2} />
        <KpiCard icon={UserPlus} label="New Admissions" value={newCount} sub="awaiting processing" color={CLR.info} bg="#EFF6FF" delay={3} />
        <KpiCard icon={UserRound} label="Gender Split" value={`${maleCount}/${femaleCount}`} sub="male / female" color={CLR.secondary} bg="#FAF5FF" delay={4} />
        <KpiCard icon={GraduationCap} label="Attendance Rate" value={s.attendanceRate != null ? Math.round(num(s.attendanceRate)) : null} suffix="%" sub="across all records" color={CLR.warning} bg="#FFFBEB" delay={5} />
        <KpiCard icon={ShieldAlert} label="At-Risk Students" value={num(s.atRiskStudents) || null} sub="need attention" color={CLR.danger} bg="#FEF2F2" delay={5} />
      </div>

      {/* AI Institutional Intelligence hero */}
      <div className="rounded-2xl overflow-hidden text-white p-6 relative anim-gradient anim-fade-up delay-1"
        style={{ background: 'linear-gradient(-45deg, #3B82F6 0%, #6D4CFF 35%, #8B5CF6 65%, #2D1B69 100%)', backgroundSize: '220% 220%' }}>
        <div className="absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl anim-float" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-[#8B5CF6]/30 blur-2xl anim-pulse-glow" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-[#22D3EE]/20 blur-3xl anim-float" style={{ animationDelay: '1.5s' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Brain size={16} className="anim-pulse-glow" />
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90">AI Student Intelligence</span>
          </div>
          <h3 className="text-xl font-extrabold mb-4">Predictive Analytics Dashboard</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {aiMetrics.map((c, i) => (
              <div key={c.label} className="rounded-xl bg-white/10 p-3 backdrop-blur-sm border border-white/10 anim-fade-up hover:bg-white/20 hover:-translate-y-0.5 transition-all" style={{ animationDelay: `${0.15 * i}s` }}>
                <div className="text-[9px] uppercase tracking-wider opacity-75">{c.label}</div>
                <div className="text-lg font-extrabold mt-0.5 flex items-center gap-1.5 tabular-nums">{c.value} <TrendPill value={c.trend} /></div>
                {c.spark.length > 1 && (
                  <svg width="64" height="28" viewBox="0 0 64 28" className="mt-1.5 opacity-80">
                    <polyline points={spark(c.spark)} fill="none" stroke={c.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
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
                Institution risk index <strong className="text-white">{r.institutionRiskScore ?? '—'}/100</strong> ·{' '}
                {num((r.distribution?.values || [])[0])} low-risk, {num((r.distribution?.values || [])[2])} high-risk students.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Class Distribution" sub="Students per class" delay={1}>
          {classDist.length === 0 ? <div className="text-center py-12 text-gray-400 text-sm">No students yet</div> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classDist} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} cursor={{ fill: 'rgba(109,76,255,0.06)' }} />
                <Bar dataKey="count" name="Students" radius={[0, 6, 6, 0]} barSize={14}>
                  {classDist.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard title="Gender Split" sub="Male vs female enrolment" delay={2}>
          {genderData.length === 0 ? <div className="text-center py-12 text-gray-400 text-sm">No gender data</div> : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3}>
                  {genderData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard title="Enrolment Status" sub="Student status breakdown" delay={3}>
          {statusDist.length === 0 ? <div className="text-center py-12 text-gray-400 text-sm">No students yet</div> : (
            <div className="space-y-3 py-2">
              {statusDist.map((x, i) => (
                <div key={x.name} className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold capitalize w-20 text-gray-600">{x.name}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bar-fill" style={{ width: `${(x.value / Math.max(1, total)) * 100}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  </div>
                  <span className="text-[11px] font-bold w-6 text-right text-gray-700">{x.value}</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Academics + admissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <ChartCard title="Academic Performance Trend" sub="Average score & pass rate over time" delay={1}>
            {trendData.length === 0 ? <div className="text-center py-12 text-gray-400 text-sm">No trend data yet</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CLR.primary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={CLR.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="avgScore" name="Avg Score %" stroke={CLR.primary} strokeWidth={2} fill="url(#gDash)" />
                  <Area type="monotone" dataKey="passRate" name="Pass Rate %" stroke={CLR.success} strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
          <ChartCard title="Class Performance" sub="Average score by class" delay={2}>
            {classPerf.length === 0 ? <div className="text-center py-12 text-gray-400 text-sm">No class analytics yet</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classPerf} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} cursor={{ fill: 'rgba(109,76,255,0.06)' }} />
                  <Bar dataKey="avgScore" name="Avg Score %" fill={CLR.primary} radius={[6, 6, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="space-y-4">
          <Card className="p-4 bg-white border border-gray-100 shadow-sm anim-fade-up delay-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-red-500" /> Students Needing Attention</h4>
            </div>
            {atRisk.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">No students at risk</div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {atRisk.map((st: any, i: number) => (
                  <div key={st.id || i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-800 truncate">{st.full_name}</div>
                      <div className="text-[10px] text-gray-400">Roll: {st.roll_number || '—'} · GPA {st.gpa || '—'}</div>
                    </div>
                    <Badge className={`text-[9px] border ${st.riskLevel === 'critical' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {(st.riskLevel || 'high').toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4 bg-white border border-gray-100 shadow-sm anim-fade-up delay-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5"><UserPlus className="w-4 h-4 text-[#6D4CFF]" /> Recent Admissions</h4>
              <span className="text-[10px] text-gray-400">{stats.totalApplications ?? 0} total</span>
            </div>
            {recentApps.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">No recent applications</div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {recentApps.map((a: any, i: number) => (
                  <div key={a.id || i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-[#6D4CFF]/10 flex items-center justify-center text-[10px] font-bold text-[#6D4CFF] shrink-0">
                      {(a.applicant_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-800 truncate">{a.applicant_name}</div>
                      <div className="text-[10px] text-gray-400">{a.applying_class || '—'}{a.created_at ? ` · ${new Date(a.created_at).toLocaleDateString()}` : ''}</div>
                    </div>
                    <Badge variant={a.status === 'approved' ? 'success' : a.status === 'rejected' ? 'danger' : 'warning'} className="text-[9px] capitalize">{a.status || 'pending'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Quick actions */}
      <div className="anim-fade-up delay-2">
        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5"><LayoutDashboard className="w-4 h-4 text-[#6D4CFF]" /> Quick Access</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {QUICK_ACTIONS.map((a, i) => {
            const Icon = a.icon;
            return (
              <button
                key={a.key}
                onClick={() => onNavigate?.(a.key)}
                className="group p-3 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-lg hover:-translate-y-0.5 hover:border-[#6D4CFF]/40 transition-all text-left anim-fade-up"
                style={{ animationDelay: `${0.06 * i}s` }}
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-white flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}><Icon size={16} /></div>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-[#6D4CFF] transition-colors">{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
