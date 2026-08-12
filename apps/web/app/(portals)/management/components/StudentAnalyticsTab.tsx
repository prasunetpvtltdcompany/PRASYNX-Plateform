'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users, School, FileText, BarChart3, TrendingUp, AlertTriangle, Award,
  Search, Loader2, Download, GraduationCap, Percent, Target, User, Layers,
  BookOpen, CheckCircle2, XCircle, Brain, Activity, CalendarCheck, Sparkles,
  ShieldAlert, ArrowDownRight, ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import {
  academicAnalyticsApiV2, predictiveAiApiV2, riskDetectionApi,
  examApiV2, attendanceApiV2
} from '../lib/dataService';
import { useApi } from '../lib/useApi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, Legend, PieChart, Pie
} from 'recharts';

const CLR = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', secondary: '#8B5CF6' };
const CHART_COLORS = ['#6D4CFF', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const num = (v: any, fallback = 0) => { const n = Number(v); return isFinite(n) ? n : fallback; };
const pct = (v: any) => `${Math.round(num(v))}%`;
const riskColor = (r: any) => (r === 'high' || r === 'critical') ? CLR.danger : r === 'medium' ? CLR.warning : CLR.success;
const riskLabel = (r: any) => (r || 'low').toUpperCase();

function KpiCard({ icon: Icon, label, value, sub, color, bg }: { icon: any; label: string; value: any; sub?: string; color: string; bg: string }) {
  return (
    <Card className="p-4 bg-white border border-gray-100 shadow-sm flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg, color }}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-gray-400 font-semibold uppercase truncate">{label}</div>
        <div className="text-lg font-black text-gray-800 leading-tight">{value ?? '—'}</div>
        {sub && <div className="text-[10px] text-gray-400 truncate">{sub}</div>}
      </div>
    </Card>
  );
}

function ChartCard({ title, sub, children, height = 220 }: { title: string; sub?: string; children: React.ReactNode; height?: number | string }) {
  return (
    <Card className="p-4 bg-white border border-gray-100 shadow-sm">
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

function Empty({ icon: Icon = FileText, title, sub }: { icon?: any; title: string; sub?: string }) {
  return (
    <div className="text-center py-14 text-gray-400">
      <Icon className="w-10 h-10 opacity-25 mx-auto mb-2" />
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {sub && <p className="text-xs mt-1">{sub}</p>}
    </div>
  );
}

function TrendPill({ value }: { value: any }) {
  if (value == null) return null;
  const up = value.direction === 'up';
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
      {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
      {num(value.pct)}%
    </span>
  );
}

// ======================== AI HEALTH HERO ========================
function AiHealthHero({ dash }: { dash: any }) {
  const d = dash.data || {};
  const spark = (arr: any[]) => {
    const max = Math.max(1, ...arr.map((v: any) => Number(v) || 0));
    const w = 64, h = 28, step = w / Math.max(1, arr.length - 1);
    const pts = arr.map((v: any, i: number) => `${i * step},${h - ((Number(v) || 0) / max) * h}`).join(' ');
    return pts;
  };
  const sparkline = (key: string) => Array.isArray(d.sparklines?.[key]) ? (d.sparklines[key] as any[]) : [];

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#1E1B4B] to-[#6D4CFF] text-white p-6 relative">
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-[#8B5CF6]/30 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <Brain size={16} />
          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90">AI Institutional Intelligence</span>
        </div>
        <h3 className="text-lg font-extrabold mb-4">Predictive Analytics Dashboard</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {[
            { label: 'AI Health Score', value: `${d.academicHealthScore ?? '—'}%`, trend: d.trends?.healthScore, spark: sparkline('health'), color: '#A78BFA' },
            { label: 'Predicted Pass Rate', value: `${d.predictedPassRate ?? '—'}%`, trend: d.trends?.predictedPassRate, spark: sparkline('passRate'), color: '#34D399' },
            { label: 'At-Risk Students', value: d.studentsAtRisk ?? '—', trend: d.trends?.studentsAtRisk, spark: sparkline('atRisk'), color: '#F87171' },
            { label: 'Dropout Risk', value: `${d.predictedDropoutRisk ?? '—'}%`, trend: d.trends?.dropoutRisk, spark: sparkline('dropout'), color: '#FBBF24' },
            { label: 'Attendance Forecast', value: `${d.attendanceForecast ?? '—'}%`, trend: d.trends?.attendanceForecast, spark: sparkline('attendance'), color: '#60A5FA' },
            { label: 'AI Prediction Accuracy', value: `${d.aiPredictionAccuracy ?? '—'}%`, trend: d.trends?.accuracy, spark: sparkline('accuracy'), color: '#F472B6' },
          ].map(c => (
            <div key={c.label} className="rounded-xl bg-white/10 p-3 backdrop-blur-sm border border-white/10">
              <div className="text-[9px] uppercase tracking-wider opacity-75">{c.label}</div>
              <div className="text-lg font-extrabold mt-0.5 flex items-center gap-1.5">{c.value} <TrendPill value={c.trend} /></div>
              <svg width="64" height="28" viewBox="0 0 64 28" className="mt-1.5 opacity-80">
                <polyline points={spark(c.spark)} fill="none" stroke={c.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ======================== OVERVIEW ========================
function OverviewView() {
  const dash = useApi(() => academicAnalyticsApiV2.getDashboard(), []);
  const pred = useApi(() => predictiveAiApiV2.getDashboard(), []);
  const risk = useApi(() => predictiveAiApiV2.getRiskAnalysis(), []);
  const insights = useApi(() => riskDetectionApi.getPredictiveInsights(), []);

  const loading = dash.loading || pred.loading || risk.loading;
  if (loading) return <Loader label="Loading analytics..." />;
  if (dash.error && pred.error) return <Empty icon={AlertTriangle} title="Failed to load analytics" sub={dash.error || pred.error} />;

  const d = dash.data || {};
  const s = d.summary || {};
  const p = pred.data || {};
  const r = risk.data || {};
  const ins = insights.data || {};
  const overview = ins.overview || {};

  const trendData = d.performanceTrend || [];
  const gradeData = (d.gradeDistribution || []).map((x: any) => ({ name: x.label, count: num(x.count) }));
  const subjectData = (d.subjectPerformance || []).map((x: any) => ({ name: x.subject_name, avgScore: num(x.avgScore) }));
  const classData = (d.classPerformance || []).map((x: any) => ({ name: x.class_name, avgScore: num(x.avgScore), passRate: num(x.passRate) }));
  const riskDist = r.distribution || {};

  const riskPie = (r.distribution?.labels || ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk']).map((l: string, i: number) => ({
    name: l,
    value: num((r.distribution?.values || [])[i]),
    color: (r.distribution?.colors || ['#22C55E', '#F59E0B', '#EF4444', '#7C3AED'])[i],
  })).filter((x: any) => x.value > 0);

  const studentAnalytics = d.studentAnalytics || [];
  const topStudents = [...studentAnalytics].sort((a: any, b: any) => num(b.avgExamScore) - num(a.avgExamScore)).slice(0, 5);
  const atRiskList = (d.studentAnalytics || []).filter((st: any) => st.riskLevel === 'high' || st.riskLevel === 'critical')
    .sort((a: any, b: any) => num(a.gpa) - num(b.gpa)).slice(0, 5);

  return (
    <div className="space-y-4">
      <AiHealthHero dash={pred} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Award} label="Avg Academic Score" value={s.avgAcademicScore != null ? pct(s.avgAcademicScore) : '—'} sub={`Growth: ${s.academicGrowthRate || 0}%`} color={CLR.primary} bg="#F3F0FF" />
        <KpiCard icon={Target} label="Pass Rate" value={s.passRate != null ? pct(s.passRate) : '—'} sub={`${num(s.totalStudents)} total students`} color={CLR.success} bg="#F0FDF4" />
        <KpiCard icon={GraduationCap} label="Attendance Rate" value={s.attendanceRate != null ? pct(s.attendanceRate) : '—'} sub={`Top class: ${s.topPerformingClass || '—'}`} color={CLR.info} bg="#EFF6FF" />
        <KpiCard icon={AlertTriangle} label="At-Risk Students" value={num(s.atRiskStudents) || num(overview.atRiskCount)} sub={`${num(overview.decliningCount)} declining · ${num(overview.dropoutRiskCount)} dropout risk`} color={CLR.danger} bg="#FEF2F2" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={BarChart3} label="Avg Exam Score" value={s.avgExamScore != null ? pct(s.avgExamScore) : '—'} sub="Examinations" color={CLR.secondary} bg="#FAF5FF" />
        <KpiCard icon={Layers} label="Avg Grade Score" value={s.avgGradeScore != null ? pct(s.avgGradeScore) : '—'} sub="Continuous assessment" color={CLR.warning} bg="#FFFBEB" />
        <KpiCard icon={FileText} label="Intervention Success" value={`${p.interventionSuccessRate ?? '—'}%`} sub={`${p.totalStudents ?? 0} students monitored`} color={CLR.success} bg="#ECFDF5" />
        <KpiCard icon={ShieldAlert} label="Institution Risk" value={`${r.institutionRiskScore ?? '—'}/100`} sub="Overall risk index" color={CLR.info} bg="#EFF6FF" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Performance Trend" sub="Avg score & pass rate over time">
          {trendData.length === 0 ? <Empty icon={TrendingUp} title="No trend data yet" /> : (
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
        <ChartCard title="Risk Distribution" sub="Predicted student risk levels">
          {riskPie.length === 0 ? <Empty icon={ShieldAlert} title="No risk data yet" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskPie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>
                  {riskPie.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard title="Grade Distribution" sub="Students per grade band">
          {gradeData.length === 0 || gradeData.every((g: any) => g.count === 0) ? <Empty title="No grades recorded yet" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Subject Performance" sub="Average score by subject">
          {subjectData.length === 0 ? <Empty icon={BookOpen} title="No subject performance yet" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} cursor={{ fill: 'rgba(109,76,255,0.06)' }} />
                <Bar dataKey="avgScore" name="Avg Score %" fill={CLR.primary} radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard title="Class Performance" sub="Average score by class">
          {classData.length === 0 ? <Empty icon={School} title="No class performance yet" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} cursor={{ fill: 'rgba(109,76,255,0.06)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="avgScore" name="Avg Score %" fill={CLR.primary} radius={[6, 6, 0, 0]} barSize={18} />
                <Bar dataKey="passRate" name="Pass Rate %" fill={CLR.success} radius={[6, 6, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5"><Award className="w-4 h-4 text-[#6D4CFF]" /> Top Performing Students</h4>
          </div>
          {topStudents.length === 0 ? <Empty icon={Users} title="No student analytics yet" /> : (
            <div className="space-y-2">
              {topStudents.map((st: any, i: number) => (
                <div key={st.id || i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: i === 0 ? '#F3F0FF' : '#F9FAFB', color: i === 0 ? CLR.primary : '#6B7280' }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{st.full_name}</div>
                    <div className="text-[10px] text-gray-400">Roll: {st.roll_number || '—'} · GPA {st.gpa || '—'}</div>
                  </div>
                  <Badge className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">{num(st.avgExamScore)}%</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-red-500" /> Students Needing Attention</h4>
          </div>
          {atRiskList.length === 0 ? <Empty icon={CheckCircle2} title="No students at risk" sub="All students performing within acceptable levels" /> : (
            <div className="space-y-2">
              {atRiskList.map((st: any, i: number) => (
                <div key={st.id || i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
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
function StudentsView({ students }: { students: any }) {
  const list = useApi(() => predictiveAiApiV2.getStudentPredictions(), []);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  const metaMap = useMemo(() => Object.fromEntries((students?.data || []).map((st: any) => [st.id, st])), [students?.data]);

  const filtered = useMemo(() => {
    let arr = list.data || [];
    if (riskFilter) arr = arr.filter((st: any) => st.riskLevel === riskFilter);
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter((st: any) =>
        st.full_name?.toLowerCase().includes(q) ||
        st.roll_number?.toLowerCase().includes(q) ||
        (metaMap[st.id]?.class_name || '').toLowerCase().includes(q));
    }
    return arr;
  }, [list.data, search, riskFilter, metaMap]);

  const exportCSV = () => {
    const rows = filtered.map((st: any) => ({
      'Student': st.full_name || '—',
      'Roll No': st.roll_number || '—',
      'Class': metaMap[st.id]?.class_name || st.class || '—',
      'Attendance %': st.attendancePct ?? '—',
      'Assignment Score': st.assignmentScore ?? '—',
      'Exam Score': st.examScore ?? '—',
      'GPA': st.gpa ?? '—',
      'Predicted Final %': st.predictedFinalScore ?? '—',
      'Pass Probability %': st.predictedPassProbability ?? '—',
      'Risk Level': st.riskLevel || 'low',
      'AI Recommendation': st.aiRecommendation || '—'
    }));
    if (rows.length === 0) { toast.error('No rows to export'); return; }
    const cols = Object.keys(rows[0]);
    const csv = [cols, ...rows.map((r: any) => cols.map((c: any) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Student analytics exported');
  };

  const highCount = filtered.filter((st: any) => st.riskLevel === 'high' || st.riskLevel === 'critical').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Users} label="Students Analyzed" value={filtered.length} sub={`${highCount} high risk`} color={CLR.primary} bg="#F3F0FF" />
        <KpiCard icon={AlertTriangle} label="High Risk" value={filtered.filter((st: any) => st.riskLevel === 'high').length} sub="Need intervention" color={CLR.danger} bg="#FEF2F2" />
        <KpiCard icon={ShieldAlert} label="Critical Risk" value={filtered.filter((st: any) => st.riskLevel === 'critical').length} sub="Immediate action" color={CLR.danger} bg="#FEE2E2" />
        <KpiCard icon={CheckCircle2} label="On Track" value={filtered.filter((st: any) => st.riskLevel === 'low' || st.riskLevel === 'medium').length} sub="Low risk students" color={CLR.success} bg="#F0FDF4" />
      </div>

      <Card className="p-4 bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student, roll, class..." className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs w-56 focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF]" />
            </div>
            <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none">
              <option value="">All Risk Levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">
            <Download size={13} /> Export CSV
          </button>
        </div>
        {list.loading ? <Loader label="Loading student predictions..." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-gray-400 border-b border-gray-100">
                  <th className="py-2 pr-3">Student</th>
                  <th className="py-2 pr-3">Class</th>
                  <th className="py-2 pr-3 text-center">Attend.</th>
                  <th className="py-2 pr-3 text-center">Assign.</th>
                  <th className="py-2 pr-3 text-center">Exam</th>
                  <th className="py-2 pr-3 text-center">GPA</th>
                  <th className="py-2 pr-3 text-center">Predicted</th>
                  <th className="py-2 pr-3 text-center">Pass %</th>
                  <th className="py-2 pr-3">Risk</th>
                  <th className="py-2">AI Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((st: any) => (
                  <tr key={st.id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                    <td className="py-2.5 pr-3">
                      <div className="font-semibold text-gray-800">{st.full_name || '—'}</div>
                      <div className="text-[10px] text-gray-400">Roll {st.roll_number || '—'}</div>
                    </td>
                    <td className="py-2.5 pr-3 text-gray-600">{metaMap[st.id]?.class_name || st.class || '—'}</td>
                    <td className="py-2.5 pr-3 text-center font-semibold" style={{ color: num(st.attendancePct) < 75 ? CLR.danger : CLR.success }}>{num(st.attendancePct)}%</td>
                    <td className="py-2.5 pr-3 text-center text-gray-600">{num(st.assignmentScore)}%</td>
                    <td className="py-2.5 pr-3 text-center text-gray-600">{num(st.examScore)}%</td>
                    <td className="py-2.5 pr-3 text-center font-semibold text-gray-700">{st.gpa ?? '—'}</td>
                    <td className="py-2.5 pr-3 text-center font-semibold text-gray-700">{num(st.predictedFinalScore)}%</td>
                    <td className="py-2.5 pr-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${num(st.predictedPassProbability) >= 60 ? 'text-emerald-600' : num(st.predictedPassProbability) >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                        {num(st.predictedPassProbability)}%
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <Badge className="text-[10px] border" style={{ background: `${riskColor(st.riskLevel)}1A`, color: riskColor(st.riskLevel), borderColor: `${riskColor(st.riskLevel)}33` }}>
                        {riskLabel(st.riskLevel)}
                      </Badge>
                    </td>
                    <td className="py-2.5 max-w-[180px]"><span className="text-[10px] text-gray-500 line-clamp-2">{st.aiRecommendation || '—'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <Empty icon={Users} title="No students match your filters" />}
          </div>
        )}
      </Card>
    </div>
  );
}

// ======================== ATTENDANCE ========================
function AttendanceView() {
  const att = useApi(() => academicAnalyticsApiV2.getAttendanceAnalytics(), []);
  const forecast = useApi(() => predictiveAiApiV2.getAttendanceForecast(), []);

  if (att.loading || forecast.loading) return <Loader label="Loading attendance analytics..." />;
  const s = att.data?.summary || {};
  const monthly = (att.data?.monthlyTrend || []).map((m: any) => ({ name: m.month, rate: num(m.rate) }));
  const daily = (forecast.data?.dailyTrend || []).map((d: any) => ({ name: d.date, pct: num(d.pct) }));
  const classFc = (forecast.data?.classForecast || []).map((c: any) => ({ name: c.className, current: num(c.current), predicted: num(c.predicted) }));
  const monthlyFc = (forecast.data?.monthlyForecast || []).map((m: any) => ({ name: m.month, predicted: num(m.predicted) }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={GraduationCap} label="Overall Rate" value={pct(s.rate)} sub={`${num(s.total)} total records`} color={CLR.success} bg="#F0FDF4" />
        <KpiCard icon={CheckCircle2} label="Present" value={num(s.present)} sub="Marked present" color={CLR.info} bg="#EFF6FF" />
        <KpiCard icon={XCircle} label="Absent" value={num(s.absent)} sub={`${num(s.late)} late · ${num(s.halfDay)} half-day`} color={CLR.danger} bg="#FEF2F2" />
        <KpiCard icon={CalendarCheck} label="Forecast" value={`${forecast.data?.dailyTrend?.length || 0} days`} sub="AI predicted trend" color={CLR.secondary} bg="#FAF5FF" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Attendance Trend" sub="Monthly attendance rate">
          {monthly.length === 0 ? <Empty icon={CalendarCheck} title="No attendance records yet" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CLR.info} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={CLR.info} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                <Area type="monotone" dataKey="rate" name="Attendance %" stroke={CLR.info} strokeWidth={2} fill="url(#gAtt)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard title="Attendance Forecast" sub="AI predicted monthly attendance">
          {monthlyFc.length === 0 && daily.length === 0 ? <Empty icon={CalendarCheck} title="No forecast yet" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFc.length ? monthlyFc : daily} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
                <Bar dataKey={monthlyFc.length ? "predicted" : "pct"} name="Attendance %" fill={CLR.secondary} radius={[6, 6, 0, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {classFc.length > 0 && (
        <ChartCard title="Attendance by Class" sub="Current vs predicted per class">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classFc} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="current" name="Current %" fill={CLR.info} radius={[6, 6, 0, 0]} barSize={18} />
              <Bar dataKey="predicted" name="Predicted %" fill={CLR.secondary} radius={[6, 6, 0, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

// ======================== EXAMS ========================
function ExamsView() {
  const exams = useApi(() => academicAnalyticsApiV2.getExamAnalytics(), []);
  if (exams.loading) return <Loader label="Loading exam analytics..." />;
  const data = (exams.data || []).map((e: any) => ({ name: e.exam_title, avgScore: num(e.avgScore), passRate: num(e.passRate), total: num(e.totalStudents) }));
  const best = [...data].sort((a, b) => b.avgScore - a.avgScore)[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={FileText} label="Exams Tracked" value={data.length} sub="With results" color={CLR.primary} bg="#F3F0FF" />
        <KpiCard icon={Award} label="Best Exam" value={best?.name || '—'} sub={best ? `Avg ${best.avgScore}%` : undefined} color={CLR.success} bg="#F0FDF4" />
        <KpiCard icon={Target} label="Avg Pass Rate" value={data.length ? pct(Math.round(data.reduce((s: any, e: any) => s + e.passRate, 0) / data.length)) : '—'} sub="Across exams" color={CLR.info} bg="#EFF6FF" />
        <KpiCard icon={Users} label="Total Attempts" value={data.reduce((s: any, e: any) => s + e.total, 0)} sub="Student exam entries" color={CLR.secondary} bg="#FAF5FF" />
      </div>
      <ChartCard title="Exam Performance" sub="Average score & pass rate per exam">
        {data.length === 0 ? <Empty icon={FileText} title="No exam results yet" /> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
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
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wide text-gray-400 border-b border-gray-100 bg-gray-50/60">
              <th className="py-2.5 px-4">Exam</th>
              <th className="py-2.5 px-4">Type</th>
              <th className="py-2.5 px-4 text-center">Total Marks</th>
              <th className="py-2.5 px-4 text-center">Students</th>
              <th className="py-2.5 px-4 text-center">Avg Score</th>
              <th className="py-2.5 px-4 text-center">Pass Rate</th>
            </tr>
          </thead>
          <tbody>
            {(exams.data || []).map((e: any) => (
              <tr key={e.exam_id} className="border-b border-gray-50 hover:bg-gray-50/40">
                <td className="py-2.5 px-4 font-semibold text-gray-700">{e.exam_title}</td>
                <td className="py-2.5 px-4 text-gray-500 capitalize">{e.exam_type || '—'}</td>
                <td className="py-2.5 px-4 text-center text-gray-600">{e.total_marks ?? '—'}</td>
                <td className="py-2.5 px-4 text-center text-gray-600">{e.totalStudents ?? 0}</td>
                <td className="py-2.5 px-4 text-center font-bold text-gray-700">{e.avgScore ?? 0}%</td>
                <td className="py-2.5 px-4 text-center">
                  <Badge className={`text-[10px] ${num(e.passRate) >= 60 ? 'bg-emerald-50 text-emerald-700' : num(e.passRate) >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>{num(e.passRate)}%</Badge>
                </td>
              </tr>
            ))}
            {(exams.data || []).length === 0 && <tr><td colSpan={6} className="py-10 text-center text-gray-400">No exams recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ======================== AI INSIGHTS ========================
function AiInsightsView() {
  const ai = useApi(() => predictiveAiApiV2.getAiInsights(), []);
  const acAi = useApi(() => academicAnalyticsApiV2.getAiInsights(), []);
  const risk = useApi(() => riskDetectionApi.getPredictiveInsights(), []);

  if (ai.loading || acAi.loading) return <Loader label="Generating AI insights..." />;
  const d = ai.data || {};
  const ac = acAi.data || {};
  const ins = risk.data || {};

  const failure = d.failureRiskPrediction || {};
  const dropout = d.dropoutRiskPrediction || {};
  const attendance = d.attendanceRiskPrediction || {};
  const behavioral = d.behavioralTrends || {};

  const subjectDifficulty = (d.subjectDifficulty || []).map((x: any) => ({ name: x.subject, difficulty: num(x.difficultyScore), avgGrade: num(x.avgGrade) }));
  const learningGaps = d.learningGaps || [];

  const barData = [
    { name: 'Failure Risk', low: num(failure.low), medium: num(failure.medium), high: num(failure.high) },
    { name: 'Dropout Risk', low: num(dropout.safe), medium: num(dropout.watchList), high: num(dropout.atRisk) },
    { name: 'Attendance', low: num(attendance.good), medium: num(attendance.concerning), high: num(attendance.critical) },
  ];

  const engagement = d.parentEngagementImpact || {};
  const engagementData = [
    { name: 'High', avgGrade: num(engagement.highEngagement?.avgGrade), attendance: num(engagement.highEngagement?.attendancePct) },
    { name: 'Medium', avgGrade: num(engagement.mediumEngagement?.avgGrade), attendance: num(engagement.mediumEngagement?.attendancePct) },
    { name: 'Low', avgGrade: num(engagement.lowEngagement?.avgGrade), attendance: num(engagement.lowEngagement?.attendancePct) },
  ];

  const atRiskStudents = ac.atRiskStudents || ins.dropoutCandidates || [];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#1E1B4B] to-[#6D4CFF] text-white p-6 relative">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-[#8B5CF6]/30 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Brain size={16} />
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90">AI Predictions Engine</span>
          </div>
          <h3 className="text-lg font-extrabold mb-1">Risk Forecasting & Learning Insights</h3>
          <p className="text-[11px] opacity-80 max-w-2xl">AI analyzes attendance, exam results, and assignment submissions to predict failure risk, dropout probability, and learning gaps — so you can intervene early.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="rounded-xl bg-white/10 p-3 border border-white/10">
              <div className="text-[9px] uppercase tracking-wider opacity-75">Predicted Failures</div>
              <div className="text-lg font-extrabold">{num(ac.predictedFailures)} <span className="text-[10px] opacity-70">students</span></div>
              <div className="text-[9px] opacity-70">Total at risk: {num(ac.totalAtRisk)}</div>
            </div>
            <div className="rounded-xl bg-white/10 p-3 border border-white/10">
              <div className="text-[9px] uppercase tracking-wider opacity-75">Dropout Risk</div>
              <div className="text-lg font-extrabold">{num(dropout.atRisk)} <span className="text-[10px] opacity-70">at-risk</span></div>
              <div className="text-[9px] opacity-70">Watch list: {num(dropout.watchList)} · Trend: {dropout.trend}</div>
            </div>
            <div className="rounded-xl bg-white/10 p-3 border border-white/10">
              <div className="text-[9px] uppercase tracking-wider opacity-75">Attendance Risk</div>
              <div className="text-lg font-extrabold">{num(attendance.critical)} <span className="text-[10px] opacity-70">critical</span></div>
              <div className="text-[9px] opacity-70">Concerning: {num(attendance.concerning)} · Trend: {attendance.trend}</div>
            </div>
            <div className="rounded-xl bg-white/10 p-3 border border-white/10">
              <div className="text-[9px] uppercase tracking-wider opacity-75">Behavior</div>
              <div className="text-lg font-extrabold">{num(behavioral.positive)}% <span className="text-[10px] opacity-70">positive</span></div>
              <div className="text-[9px] opacity-70">Neutral: {num(behavioral.neutral)}% · Trend: {behavioral.trend}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Risk Prediction Comparison" sub="Low / medium / high student counts by risk type">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} cursor={{ fill: 'rgba(109,76,255,0.06)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="low" name="Low" stackId="a" fill={CLR.success} radius={[0, 0, 0, 0]} />
              <Bar dataKey="medium" name="Medium" stackId="a" fill={CLR.warning} />
              <Bar dataKey="high" name="High" stackId="a" fill={CLR.danger} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Subject Difficulty" sub="Difficulty score vs average grade by subject">
          {subjectDifficulty.length === 0 ? <Empty icon={BookOpen} title="No subject difficulty data" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectDifficulty} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} cursor={{ fill: 'rgba(109,76,255,0.06)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="difficulty" name="Difficulty" fill={CLR.warning} radius={[6, 6, 0, 0]} barSize={16} />
                <Bar dataKey="avgGrade" name="Avg Grade" fill={CLR.primary} radius={[6, 6, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Parent Engagement Impact" sub="Grade & attendance by engagement level">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={engagementData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} cursor={{ fill: 'rgba(109,76,255,0.06)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="avgGrade" name="Avg Grade %" fill={CLR.primary} radius={[6, 6, 0, 0]} barSize={18} />
              <Bar dataKey="attendance" name="Attendance %" fill={CLR.info} radius={[6, 6, 0, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-[#6D4CFF]" /> Detected Learning Gaps</h4>
          {learningGaps.length === 0 ? <Empty icon={BookOpen} title="No learning gaps detected" /> : (
            <div className="space-y-2">
              {learningGaps.map((g: any, i: number) => (
                <div key={i} className="p-2.5 rounded-lg bg-gray-50 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-700">{g.topic} <span className="text-gray-400 font-normal">· {g.subject}</span></div>
                    <div className="text-[10px] text-gray-400">{num(g.studentsAffected)} students affected</div>
                  </div>
                  <div className="w-24">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, num(g.gapPct))}%`, background: num(g.gapPct) >= 30 ? CLR.danger : CLR.warning }} />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold w-9 text-right" style={{ color: num(g.gapPct) >= 30 ? CLR.danger : CLR.warning }}>{num(g.gapPct)}%</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-red-500" /> Students Needing Intervention</h4>
          {atRiskStudents.length === 0 ? <Empty icon={CheckCircle2} title="No students need intervention" /> : (
            <div className="space-y-2">
              {atRiskStudents.slice(0, 8).map((st: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{st.student_name || st.studentName || '—'}</div>
                    <div className="text-[10px] text-gray-400">Roll {st.roll_number || '—'} · Score {num(st.overallScore || st.riskScore)}%</div>
                  </div>
                  <Badge className="text-[10px] bg-red-50 text-red-700 border border-red-200">{riskLabel(st.riskLevel)}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-4 bg-white border border-gray-100 shadow-sm">
          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-[#6D4CFF]" /> AI Improvement Suggestions</h4>
          {(ac.improvementSuggestions || []).length === 0 ? <Empty icon={Sparkles} title="No suggestions yet" /> : (
            <div className="space-y-2">
              {(ac.improvementSuggestions || []).map((sg: any, i: number) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#F5F3FF]">
                  <div className="w-5 h-5 rounded-full bg-[#6D4CFF] text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-[11px] text-gray-700 leading-relaxed">{sg}</p>
                </div>
              ))}
              {(ins.dropoutCandidates || []).length > 0 && (
                <div className="mt-2 p-2.5 rounded-lg bg-red-50 text-[11px] text-red-700">
                  <strong>{ins.dropoutCandidates.length}</strong> students flagged as dropout candidates — {ins.dropoutCandidates[0]?.recommendation}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ======================== MAIN ========================
export function StudentAnalyticsTab({ students }: { students: any }) {
  const [tab, setTab] = useState<'overview' | 'students' | 'attendance' | 'exams' | 'ai'>('overview');
  const TABS = [
    { key: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { key: 'students' as const, label: 'Students', icon: Users },
    { key: 'attendance' as const, label: 'Attendance', icon: CalendarCheck },
    { key: 'exams' as const, label: 'Exams', icon: FileText },
    { key: 'ai' as const, label: 'AI Insights', icon: Brain },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white"><BarChart3 size={20} /></div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Student Analytics</h1>
            <p className="text-xs text-gray-500">Institution-wide performance, attendance, exam and AI-driven predictive insights</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 flex-wrap p-1 bg-gray-100/60 rounded-xl mb-5">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${tab === t.key ? 'bg-white text-[#6D4CFF] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'}`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewView />}
      {tab === 'students' && <StudentsView students={students} />}
      {tab === 'attendance' && <AttendanceView />}
      {tab === 'exams' && <ExamsView />}
      {tab === 'ai' && <AiInsightsView />}
    </div>
  );
}
