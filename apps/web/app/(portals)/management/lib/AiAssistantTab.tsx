'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Brain, Sparkles, Activity, TrendingUp, Users,
  AlertTriangle, CheckCircle2, Clock, Gauge, Target, GraduationCap,
  CalendarCheck, FileText, LineChart, BarChart3, RefreshCw, Download, Search, Send,
  Wrench, Lightbulb, X, Play, ListChecks, BookOpen, Award,
  MessageSquare, Cpu, Radar, HeartHandshake,
} from 'lucide-react';
import {
  BarChart, Bar as RBar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from './useApi';
import { predictiveAiApiV2, aiTeachingApiV2 } from './dataService';
import { Badge } from '@/components/ui/badge';

const CLR = {
  primary: '#6D4CFF', secondary: '#8B5CF6', accent: '#A855F7',
  success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', cyan: '#06B6D4',
};

const PAL_META = [
  { name: 'AI Subject Tutor', color: '#6D4CFF', icon: GraduationCap, desc: 'Adaptive subject tutoring with personal learning paths' },
  { name: 'AI Quiz Generator', color: '#F59E0B', icon: FileText, desc: 'Auto-generate quizzes from any topic or curriculum' },
  { name: 'AI Lesson Planner', color: '#3B82F6', icon: CalendarCheck, desc: 'Curriculum-aligned lesson plans in minutes' },
  { name: 'AI Content Creator', color: '#A855F7', icon: Sparkles, desc: 'Notes, resources and educational content on demand' },
  { name: 'AI Grading Assistant', color: '#EF4444', icon: CheckCircle2, desc: 'Auto-grade submissions with detailed feedback' },
  { name: 'AI Attendance Insight', color: '#22C55E', icon: Clock, desc: 'Attendance analytics with early-warning alerts' },
  { name: 'AI Parent Comms', color: '#06B6D4', icon: MessageSquare, desc: 'Automated parent updates and communication' },
  { name: 'AI Stats Analyst', color: '#8B5CF6', icon: BarChart3, desc: 'Institutional analytics and KPI narratives' },
] as const;

function probColor(v: number) {
  if (v >= 75) return CLR.success;
  if (v >= 50) return CLR.warning;
  return CLR.danger;
}

function RiskBadge({ risk }: { risk: string }) {
  const def = { label: risk || 'Low', cls: 'bg-green-50 text-green-600 border-green-100' };
  const map: Record<string, { label: string; cls: string }> = {
    critical: { label: 'Critical', cls: 'bg-purple-50 text-purple-600 border-purple-100' },
    high: { label: 'High', cls: 'bg-red-50 text-red-600 border-red-100' },
    medium: { label: 'Medium', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
    low: def,
  };
  const m = map[risk] || def;
  return <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${m.cls}`}>{m.label}</span>;
}

function MetricBar({ label, value, color }: { label: string; value: number; color?: string }) {
  const c = color || probColor(value);
  return (
    <div className="flex items-center gap-2">
      <span className="w-[110px] text-[10px] text-gray-500 font-medium truncate">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="h-full rounded-full" style={{ background: c }} />
      </div>
      <span className="w-10 text-right text-[10px] font-bold" style={{ color: c }}>{value}%</span>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return <div className="flex items-end gap-0.5 h-6" />;
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-6 mt-1">
      {data.slice(-8).map((v, i) => (
        <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${Math.max((v / max) * 100, 8)}%` }}
          transition={{ delay: i * 0.04, type: 'spring', stiffness: 200, damping: 24 }}
          className="flex-1 rounded-sm" style={{ background: `${color}45` }} />
      ))}
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div className="flex items-center justify-between text-[10px]">
      <span className="text-gray-500">{label}</span>
      <span className="font-extrabold" style={{ color }}>{value}</span>
    </div>
  );
}

function ChartCard({ title, icon: Icon, color, meta, children }: { title: string; icon: any; color: string; meta?: [string, string][]; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, color }}>
            <Icon size={14} />
          </span>
          {title}
        </h4>
        {meta && (
          <div className="flex items-center gap-3">
            {meta.map(([label, c]) => (
              <div key={label} className="flex items-center gap-1.5 text-[9px] text-gray-400">
                <div className="w-2.5 h-0.5 rounded" style={{ background: c }} /> {label}
              </div>
            ))}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function ChartSection({ title, icon: Icon, color, children }: { title: string; icon: any; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, color }}><Icon size={15} /></div>
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function ToolsStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: any; color: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}><Icon size={16} /></div>
      <div>
        <div className="text-[10px] text-gray-500">{label}</div>
        <div className="text-lg font-extrabold" style={{ color }}>{value ?? 0}</div>
      </div>
    </motion.div>
  );
}

function CategoryCard({ title, icon: Icon, color, values }: { title: string; icon: any; color: string; values: { label: string; value: number }[] }) {
  const max = Math.max(...values.map(v => v.value), 1);
  return (
    <motion.div whileHover={{ y: -2 }} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, color }}><Icon size={15} /></div>
        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200">{title}</h4>
      </div>
      <div className="space-y-2.5">
        {values.map((v, i) => (
          <div key={v.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-500">{v.label}</span>
              <span className="text-[10px] font-bold" style={{ color }}>{v.value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(v.value / max) * 100}%` }} transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 120, damping: 20 }}
                className="h-full rounded-full" style={{ background: color }} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function AiAssistantTab() {
  const [view, setView] = useState('overview');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [predSearch, setPredSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [tip, setTip] = useState(0);

  const dash = useApi(() => predictiveAiApiV2.getDashboard(), []);
  const insights = useApi(() => predictiveAiApiV2.getAiInsights(), []);
  const predictions = useApi(() => predictiveAiApiV2.getStudentPredictions({ search: predSearch || undefined, risk: riskFilter || undefined }), [predSearch, riskFilter]);
  const risk = useApi(() => predictiveAiApiV2.getRiskAnalysis(), []);
  const attendFc = useApi(() => predictiveAiApiV2.getAttendanceForecast(), []);
  const academicFc = useApi(() => predictiveAiApiV2.getAcademicForecast(), []);
  const dropout = useApi(() => predictiveAiApiV2.getDropoutPrediction(), []);
  const interventions = useApi(() => predictiveAiApiV2.getInterventions(), []);
  const assistants = useApi(() => aiTeachingApiV2.getAssistants({}), []);
  const tools = useApi(() => aiTeachingApiV2.getTeacherTools(), []);

  const dd = (dash.data as any)?.data || dash.data || {};
  const ii = (insights.data as any)?.data || insights.data || {};
  const rd = (risk.data as any)?.data || risk.data || {};
  const af = (attendFc.data as any)?.data || attendFc.data || {};
  const acf = (academicFc.data as any)?.data || academicFc.data || {};
  const dp = (dropout.data as any)?.data || dropout.data || {};
  const iv = (interventions.data as any)?.data || interventions.data || {};
  const asArr = (assistants.data as any)?.data || assistants.data || [];

  useEffect(() => {
    const id = setInterval(() => setTip(t => t + 1), 7000);
    return () => clearInterval(id);
  }, []);

  const refreshAll = useCallback(() => {
    dash.refetch(); insights.refetch(); predictions.refetch(); risk.refetch();
    attendFc.refetch(); academicFc.refetch(); dropout.refetch(); interventions.refetch();
  }, [dash, insights, predictions, risk, attendFc, academicFc, dropout, interventions]);

  const NAVS = [
    { key: 'overview', label: 'Overview', icon: Cpu },
    { key: 'assistants', label: 'AI Tools', icon: Wrench },
    { key: 'predict', label: 'Predictions', icon: Radar },
    { key: 'forecast', label: 'Forecasts', icon: LineChart },
    { key: 'insights', label: 'Insights', icon: Brain },
    { key: 'intervention', label: 'Actions', icon: ListChecks },
  ];

  const aiTips = [
    { icon: Lightbulb, text: `${dd.studentsAtRisk ?? '—'} students are flagged at risk. Prioritize the ${rd.distribution?.critical ?? 0} most critical for immediate parent meetings.`, score: 40, sub: 'Intervention readiness' },
    { icon: AlertTriangle, text: `Attendance is forecast at ${af.dailyTrend?.[af.dailyTrend.length - 1]?.pct ?? dd.attendanceForecast ?? '—'}%. Consistent low attendance spikes dropout probability.`, score: dd.attendanceForecast ?? 80, sub: 'Attendance signal' },
    { icon: Brain, text: `The model predicts a ${dd.predictedPassRate ?? '—'}% pass rate. Focus coaching on subjects with the widest learning gaps.`, score: dd.predictedPassRate ?? 75, sub: 'Pass probability' },
    { icon: Sparkles, text: `Class-level comparison reveals variance across sections — aim AI attention at the widest-spread classes first.`, score: dd.academicHealthScore ?? 70, sub: 'Institutional health' },
  ];
  const cur = aiTips[tip % aiTips.length];

  const KPIS = [
    { icon: Users, label: 'Students', value: dd.totalStudents ?? 0, color: CLR.info, spark: 'atRisk', trend: dd.trends?.studentsAtRisk?.pct },
    { icon: AlertTriangle, label: 'At Risk', value: dd.studentsAtRisk ?? 0, color: CLR.danger, spark: 'atRisk', trend: dd.trends?.studentsAtRisk?.pct },
    { icon: Award, label: 'Pass Rate', value: `${dd.predictedPassRate ?? 0}%`, color: CLR.success, spark: 'passRate', trend: dd.trends?.predictedPassRate?.pct },
    { icon: CalendarCheck, label: 'Attendance', value: `${dd.attendanceForecast ?? 0}%`, color: CLR.info, spark: 'attendance', trend: dd.trends?.attendanceForecast?.pct },
    { icon: TrendingUp, label: 'Performance', value: `${dd.performanceForecast ?? 0}%`, color: CLR.secondary, spark: 'performance', trend: dd.trends?.performanceForecast?.pct },
    { icon: Activity, label: 'Health', value: dd.academicHealthScore ?? 0, color: CLR.cyan, spark: 'health', trend: dd.trends?.healthScore?.pct },
    { icon: Gauge, label: 'AI Accuracy', value: `${dd.aiPredictionAccuracy ?? 0}%`, color: CLR.accent, spark: 'accuracy', trend: dd.trends?.accuracy?.pct },
    { icon: Target, label: 'Interventions', value: `${dd.interventionSuccessRate ?? 0}%`, color: CLR.success, spark: 'intervention', trend: dd.trends?.interventionSuccess?.pct },
  ];

  const riskMix = (() => {
    const d = rd.distribution || {};
    return [
      { name: 'Low', value: d.low ?? 0, color: CLR.success },
      { name: 'Medium', value: d.medium ?? 0, color: CLR.warning },
      { name: 'High', value: d.high ?? 0, color: CLR.danger },
      { name: 'Critical', value: d.critical ?? 0, color: CLR.accent },
    ];
  })();

  const sendQuery = useCallback(async (text: string) => {
    if (chatBusy) return;
    setMessages(p => [...p, { role: 'user', text }]);
    setChatInput('');
    setChatBusy(true);
    try {
      const res = await aiTeachingApiV2.sendMessage({ query: text });
      setMessages(p => [...p, { role: 'assistant', text: (res as any)?.data?.response || 'Analysed — here are the insights I could prepare for you.' }]);
    } catch {
      setMessages(p => [...p, { role: 'assistant', text: 'I could not process that request right now. Please try again.' }]);
    } finally {
      setChatBusy(false);
    }
  }, [chatBusy]);

  const sendChat = () => { if (chatInput.trim()) sendQuery(chatInput.trim()); };

  const exportPredictions = () => {
    const rows = (predictions.data as any)?.data || predictions.data || [];
    if (!Array.isArray(rows) || rows.length === 0) return;
    const headers = ['Name', 'Roll No', 'Class', 'Attendance %', 'Pass Prob', 'Risk', 'Recommendation'];
    const lines = rows.map((r: any) => [
      `"${String(r.full_name || '').replace(/"/g, '""')}"`,
      r.roll_number || r.admission_number || '',
      r.class || '',
      r.attendancePct ?? '',
      r.predictedPassProbability ?? '',
      r.riskLevel || 'low',
      `"${String(r.aiRecommendation || '').replace(/"/g, '""')}"`,
    ].join(','));
    const csv = [headers.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ai-predictions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const openChat = () => { setMessages([]); setChatOpen(true); };

  const renderHeader = () => (
    <div className="relative overflow-hidden rounded-2xl p-5 md:p-6 bg-gradient-to-r from-[#1E1B4B] via-[#4C1D95] to-[#6D28D9] text-white shadow-xl shadow-purple-500/20">
      <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute right-6 bottom-0 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <motion.div animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/40 flex-shrink-0">
            <Brain size={26} />
          </motion.div>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-2">AI Command Center <span className="text-base">✨</span></h2>
            <p className="text-[11px] md:text-xs text-white/70 mt-0.5">Predictive intelligence, institutional insights and AI-powered action tools for your school.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button whileTap={{ scale: 0.95 }} onClick={refreshAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-semibold backdrop-blur-sm transition-all">
            <RefreshCw size={13} className={dash.loading ? 'animate-spin' : ''} /> Refresh
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={openChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-[#6D28D9] text-[11px] font-bold shadow-lg transition-all hover:shadow-xl">
            <Bot size={14} /> Ask AI
          </motion.button>
        </div>
      </div>
      <div className="relative mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[
          { label: 'Prediction Accuracy', value: `${dd.aiPredictionAccuracy ?? 0}%`, ic: Gauge, color: '#A78BFA' },
          { label: 'Students Monitored', value: dd.totalStudents ?? 0, ic: Radar, color: '#67E8F9' },
          { label: 'AI Insight Modules', value: `${Object.keys(ii).length || 0}`, ic: Sparkles, color: '#FBBF24' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }}
            className="rounded-xl bg-white/[0.08] border border-white/10 p-3 flex items-center gap-3 backdrop-blur-sm">
            <s.ic size={18} style={{ color: s.color }} />
            <div>
              <div className="text-[9px] uppercase tracking-wide text-white/60 font-semibold">{s.label}</div>
              <div className="text-lg font-extrabold">{s.value}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KPIS.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3 }} className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${k.color}15`, color: k.color }}><k.icon size={18} /></div>
              {k.trend != null && <Badge className="text-[9px] bg-gray-50 text-gray-500 border-gray-100">▲ {k.trend}%</Badge>}
            </div>
            <div className="text-[11px] text-gray-500 font-medium">{k.label}</div>
            <div className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">{k.value}</div>
            <Sparkline data={dd.sparklines?.[k.spark] || []} color={k.color} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ChartSection title="Live AI Insight" icon={Brain} color={CLR.accent}>
            <AnimatePresence mode="wait">
              <motion.div key={tip} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.25 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-500/10 dark:to-indigo-500/10 border border-purple-100 dark:border-purple-500/20">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <cur.icon size={14} style={{ color: CLR.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-gray-700 dark:text-gray-200 leading-relaxed">{cur.text}</p>
                  <div className="mt-2"><MetricBar label={cur.sub} value={Number(cur.score)} color={probColor(Number(cur.score))} /></div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex gap-1.5 mt-3">
              {aiTips.map((_, i) => (
                <button key={i} onClick={() => setTip(i)} className={`h-1.5 rounded-full transition-all ${i === tip % aiTips.length ? 'w-6 bg-[#7C3AED]' : 'w-2.5 bg-gray-200 dark:bg-gray-700'}`} />
              ))}
            </div>
          </ChartSection>

          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><Target size={14} className="text-[#06B6D4]" /> Academic Risk Mix</h4>
            </div>
            <div className="relative mx-auto w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskMix} cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {riskMix.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-2xl font-extrabold text-[#6D4CFF]">{dd.academicHealthScore ?? 0}</div>
                <div className="text-[9px] text-gray-400 font-semibold uppercase">Health</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-3">
              {riskMix.map(l => (
                <div key={l.name} className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color }} /> {l.name} <span className="ml-auto font-bold">{l.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 text-white p-5 shadow-lg shadow-purple-500/20 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-white/10 blur-xl" />
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-yellow-300" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-white/80">AI Health</span>
            </div>
            <div className="text-4xl font-extrabold">{dd.academicHealthScore ?? 0}<span className="text-lg text-white/60">/100</span></div>
            <p className="text-[11px] text-white/80 mt-2">
              {dd.academicHealthScore >= 70 ? 'Your institution is in a strong position. Continue the momentum.'
                : dd.academicHealthScore >= 50 ? 'Some areas need attention — targeted interventions are recommended below.'
                : 'Immediate attention advised — open the intervention center.'}
            </p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setView('intervention')} className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm text-[10px] font-semibold transition-all">Open Center</button>
              <button onClick={openChat} className="px-3 py-1.5 rounded-lg bg-white text-purple-700 text-[10px] font-bold transition-all">Ask AI</button>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-2.5 h-2.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
                <span className="relative rounded-full bg-emerald-500 w-2.5 h-2.5 block" />
              </div>
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200">Predictive Pulse</h4>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Predicted Pass Rate', value: dd.predictedPassRate ?? 0, c: '#10B981', g: 'from-emerald-400 to-teal-500' },
                { label: 'Predicted Dropout Risk', value: dd.predictedDropoutRisk ?? 0, c: '#F59E0B', g: 'from-amber-400 to-orange-500' },
                { label: 'Intervention Success', value: dd.interventionSuccessRate ?? 0, c: '#6366F1', g: 'from-indigo-400 to-purple-500' },
              ].map((m, mi) => (
                <div key={m.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-gray-400">{m.label}</span>
                    <span className="text-[10px] font-bold" style={{ color: m.c }}>{m.value ?? 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${m.value ?? 0}%` }} transition={{ delay: mi * 0.1, type: 'spring', stiffness: 100, damping: 18 }}
                      className={`h-full bg-gradient-to-r ${m.g} rounded-full`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssistants = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-gray-500">Explore the AI tooling available across your institution. Launch one to begin.</p>
        <button onClick={() => { setView('predict'); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-[11px] font-semibold text-gray-500 hover:bg-gray-50 transition-all">
          <Download size={13} /> Export Predictions
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(Array.isArray(asArr) && asArr.length > 0 ? asArr : Array.from(PAL_META)).map((a: any, i: number) => {
          const meta = PAL_META[i % PAL_META.length];
          return (
            <motion.div key={a.id || i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }} className="group rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-3">
                <motion.div whileHover={{ rotate: 8, scale: 1.08 }} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${meta.color}15`, color: meta.color }}>
                  <meta.icon size={20} />
                </motion.div>
                <Badge variant="success" className="text-[9px] capitalize">{a.status || 'active'}</Badge>
              </div>
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 mb-1">{a.name || meta.name}</h4>
              <p className="text-[9px] text-gray-400 mb-3 leading-relaxed">{a.description || meta.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-gray-500"><Users size={10} className="inline mr-1" />{Number(a.usage_count || a.usage || 0).toLocaleString()} uses</span>
                <Badge variant={(Number(a.accuracy_score || a.accuracy || 0)) >= 95 ? 'success' : 'warning'} className="text-[8px]">{Number(a.accuracy_score || a.accuracy || 0)}%</Badge>
              </div>
              <button onClick={openChat} className="mt-3 w-full py-1.5 rounded-lg text-[10px] font-bold text-white transition-all hover:shadow-md active:scale-[0.97]"
                style={{ background: `linear-gradient(135deg, ${meta.color}, #6D4CFF)` }}>
                <Play size={11} className="inline mr-1" /> Launch
              </button>
            </motion.div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ToolsStat icon={FileText} label="Lessons Generated" value={tools?.data?.totalLessons ?? 0} color={CLR.primary} />
        <ToolsStat icon={CheckCircle2} label="Quizzes Generated" value={tools?.data?.totalQuizzes ?? 0} color={CLR.info} />
        <ToolsStat icon={Sparkles} label="Content Pieces" value={tools?.data?.totalContent ?? 0} color={CLR.secondary} />
      </div>
    </div>
  );

  const renderPredictions = () => {
    const preds = (predictions.data as any)?.data || predictions.data || [];
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={predSearch} onChange={e => setPredSearch(e.target.value)} placeholder="Search by name or roll number…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
          </div>
          <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs">
            <option value="">All Risks</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical</option>
          </select>
          <button onClick={exportPredictions} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[11px] font-semibold shadow-md shadow-purple-500/20">
            <Download size={13} /> Export
          </button>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
          {predictions.loading ? <LoadingSkeleton rows={6} cols={1} /> :
            predictions.error ? <ErrorState message={predictions.error} onRetry={predictions.refetch} /> :
              (!Array.isArray(preds) || preds.length === 0) ? <EmptyState message="No student predictions found" /> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800/70 text-[10px] text-gray-500 uppercase tracking-wide">
                        <th className="px-4 py-3 font-semibold">Student</th>
                        <th className="px-4 py-3 font-semibold">Attendance</th>
                        <th className="px-4 py-3 font-semibold">Pass %</th>
                        <th className="px-4 py-3 font-semibold">Predicted</th>
                        <th className="px-4 py-3 font-semibold">Risk</th>
                        <th className="px-4 py-3 font-semibold">AI Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preds.map((p: any, i: number) => (
                        <motion.tr key={p.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}
                          className="border-t border-gray-50 dark:border-gray-800 hover:bg-purple-50/40 dark:hover:bg-purple-500/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">{String(p.full_name || '?').charAt(0)}</div>
                              <div>
                                <div className="text-xs font-semibold text-gray-800 dark:text-gray-100">{p.full_name}</div>
                                <div className="text-[9px] text-gray-400">{p.roll_number || p.admission_number || ''}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold">{p.attendancePct ?? '—'}%</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-14 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${p.predictedPassProbability || 0}%` }} transition={{ delay: 0.2 + i * 0.03, type: 'spring', stiffness: 120, damping: 20 }}
                                  className="h-full rounded-full" style={{ background: probColor(p.predictedPassProbability || 0) }} />
                              </div>
                              <span className="text-[9px] font-bold">{p.predictedPassProbability ?? '—'}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-bold" style={{ color: probColor(p.predictedFinalScore || 0) }}>{p.predictedFinalScore ?? '—'}</td>
                          <td className="px-4 py-3"><RiskBadge risk={p.riskLevel} /></td>
                          <td className="px-4 py-3 text-[10px] text-gray-500 max-w-[220px] truncate">{p.aiRecommendation || '—'}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
        </div>
      </div>
    );
  };

  const renderForecast = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Attendance Trend & Forecast" icon={CalendarCheck} color={CLR.primary}
          meta={[['Actual', CLR.primary], ['Predicted', CLR.accent]]}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={(af.dailyTrend || []).slice(-40)}>
              <defs>
                <linearGradient id="aiAttGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6D4CFF" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6D4CFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 8 }} tickFormatter={(v: string) => v?.slice(5) || ''} interval={8} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
              <Area type="monotone" dataKey="pct" stroke="#6D4CFF" fill="url(#aiAttGrad)" strokeWidth={2} name="Attendance %" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Academic Performance Forecast" icon={TrendingUp} color={CLR.secondary}
          meta={[['Actual', CLR.secondary], ['Predicted', CLR.accent]]}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={acf.performanceTrend || []}>
              <defs>
                <linearGradient id="aiAcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 9 }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
              <Area type="monotone" dataKey="actual" stroke="#8B5CF6" fill="url(#aiAcGrad)" strokeWidth={2} name="Actual" dot={false} />
              <Area type="monotone" dataKey="predicted" stroke="#A855F7" strokeWidth={2} strokeDasharray="6 3" name="Predicted" fill="transparent" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Subject Difficulty & Average Grade" icon={BarChart3} color={CLR.accent}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={(ii.subjectDifficulty || []).slice(0, 6)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="subject" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9 }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
            <RBar dataKey="difficultyScore" name="Difficulty" fill="#A855F7" radius={[4, 4, 0, 0]} />
            <RBar dataKey="avgGrade" name="Avg Grade" fill="#6D4CFF" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Dropout Risk Bands" icon={AlertTriangle} color={CLR.danger}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={(dp.probabilityDistribution || []).slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" tick={{ fontSize: 8 }} />
              <YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
              <RBar dataKey="count" name="Students" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartSection title="Top Dropout Contenders" icon={AlertTriangle} color={CLR.warning}>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div><Metric label="Overall Risk" value={`${dp.overallRisk ?? 0}%`} color={CLR.danger} /></div>
            <div><Metric label="At Risk" value={dp.totalAtRisk ?? 0} color={CLR.warning} /></div>
            <div><Metric label="Watch" value={(dp.students || []).length} color={CLR.info} /></div>
          </div>
          {(dp.students || []).slice(0, 5).map((s: any, i: number) => (
            <div key={s.id || i} className="mb-2"><MetricBar label={s.full_name || `Student ${i + 1}`} value={s.dropoutProbability || 0} /></div>
          ))}
        </ChartSection>
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CategoryCard title="Failure Risk" icon={AlertTriangle} color={CLR.danger} values={[
          { label: 'High', value: ii.failureRiskPrediction?.high ?? 0 },
          { label: 'Medium', value: ii.failureRiskPrediction?.medium ?? 0 },
          { label: 'Low', value: ii.failureRiskPrediction?.low ?? 0 },
        ]} />
        <CategoryCard title="Dropout Watch" icon={GraduationCap} color={CLR.warning} values={[
          { label: 'At Risk', value: ii.dropoutRiskPrediction?.atRisk ?? 0 },
          { label: 'Watch', value: ii.dropoutRiskPrediction?.watchList ?? 0 },
          { label: 'Safe', value: ii.dropoutRiskPrediction?.safe ?? 0 },
        ]} />
        <CategoryCard title="Behavioral Signals" icon={CalendarCheck} color={CLR.cyan} values={[
          { label: 'Positive', value: ii.behavioralTrends?.positive ?? 0 },
          { label: 'Neutral', value: ii.behavioralTrends?.neutral ?? 0 },
          { label: 'Concerns', value: ii.behavioralTrends?.concerning ?? 0 },
        ]} />
      </div>

      <ChartSection title="Learning Gaps" icon={Brain} color={CLR.info}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(ii.learningGaps || []).map((g: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0 shadow-sm"><BookOpen size={14} style={{ color: CLR.info }} /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{g.subject} — {g.topic}</span>
                  <span className="text-[10px] font-bold" style={{ color: probColor(100 - (g.gapPct || 0)) }}>{g.gapPct ?? 0}% gap</span>
                </div>
                <p className="text-[10px] text-gray-400 mb-1.5">{g.studentsAffected ?? 0} students affected</p>
                <MetricBar label="" value={g.gapPct ?? 0} color={CLR.danger} />
              </div>
            </motion.div>
          ))}
        </div>
      </ChartSection>

      <ChartSection title="Parent Engagement Impact" icon={Users} color={CLR.success}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['highEngagement', 'mediumEngagement', 'lowEngagement'].map((k, i) => {
            const e = ii.parentEngagementImpact?.[k] || {};
            const color = i === 0 ? CLR.success : i === 1 ? CLR.warning : CLR.danger;
            return (
              <div key={k} className="rounded-xl p-4 border" style={{ background: `${color}0a`, borderColor: `${color}22` }}>
                <div className="text-[10px] font-bold uppercase tracking-wide mb-3" style={{ color }}>{k.replace('Engagement', ' Engagement')}</div>
                <div className="space-y-2">
                  <Metric label="Avg Grade" value={`${e.avgGrade ?? 0}%`} color={color} />
                  <Metric label="Attendance" value={`${e.attendancePct ?? 0}%`} color={color} />
                  <Metric label="Improvement" value={`${e.improvementRate ?? 0}%`} color={color} />
                </div>
              </div>
            );
          })}
        </div>
      </ChartSection>
    </div>
  );

  const renderIntervention = () => {
    const plans = iv.plans || [];
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Active Plans', value: iv.totalActive ?? 0, color: CLR.primary },
            { label: 'Success Rate', value: `${iv.overallSuccessRate ?? 0}%`, color: CLR.success },
            { label: 'Institution Risk', value: rd.institutionRiskScore ?? 0, color: CLR.danger },
            { label: 'At-Risk Students', value: dd.studentsAtRisk ?? 0, color: CLR.warning },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
              <div className="text-[11px] text-gray-500 font-medium">{s.label}</div>
              <div className="text-xl font-extrabold mt-1" style={{ color: s.color }}>{s.value}</div>
            </motion.div>
          ))}
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2"><HeartHandshake size={14} className="text-[#6D4CFF]" /> Intervention Plans</h4>
            <Badge className="text-[9px] bg-purple-50 text-purple-600 border-purple-100">{plans.length} plans</Badge>
          </div>
          {interventions.loading ? <LoadingSkeleton rows={4} cols={1} /> :
            interventions.error ? <ErrorState message={interventions.error} onRetry={interventions.refetch} /> :
              plans.length === 0 ? <EmptyState message="No intervention plans yet — the AI will start recommending actions shortly." /> : (
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {plans.map((p: any, i: number) => (
                    <div key={p.id || i} className="px-5 py-4 flex items-start gap-3 hover:bg-purple-50/40 dark:hover:bg-purple-500/5 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center flex-shrink-0"><Target size={14} className="text-[#6D4CFF]" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{p.title || p.student_name || 'Intervention Plan'}</span>
                          <Badge variant={p.status === 'active' ? 'success' : p.status === 'completed' ? 'info' : 'warning'} className="text-[9px] capitalize">{p.status || 'active'}</Badge>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{p.description || p.plan_details || 'Working to improve student outcomes.'}</p>
                        <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-500">
                          <span className="flex items-center gap-1"><Activity size={10} /> Success {p.successProbability ?? p.improvementRate ?? 0}%</span>
                          <span className="flex items-center gap-1"><Clock size={10} /> {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </div>
      </div>
    );
  };

  const renderChat = () => {
    if (!chatOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setChatOpen(false)}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md h-[560px] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="px-4 py-3 bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                <Bot size={20} />
              </motion.div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">PRASYNX AI <span className="inline-flex items-center gap-1 text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full"><Sparkles size={9} /> Powered</span></h3>
                <p className="text-[10px] text-white/70">Institutional insights & guided help</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center"><X size={15} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/60 dark:bg-gray-950/40">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-400 to-indigo-500 mx-auto mb-3 flex items-center justify-center shadow-lg">
                  <Brain size={28} className="text-white" />
                </motion.div>
                <p className="text-xs text-gray-400 mb-4">Questions the AI can answer instantly</p>
                <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
                  {['Which students are at risk?', 'Attendance trend this term', 'Top subject gaps', 'Summarise dropout risk'].map(q2 => (
                    <button key={q2} onClick={() => sendQuery(q2)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:border-[#6D4CFF] hover:text-[#6D4CFF] transition-all bg-white dark:bg-gray-800">
                      {q2}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                  className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
                  {m.role === 'assistant' && <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center flex-shrink-0"><Bot size={12} className="text-white" /></div>}
                  <div className={`max-w-[80%] p-3 rounded-xl text-[11px] leading-relaxed ${m.role === 'user' ? 'bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white rounded-tr-sm shadow-md' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-sm'}`}>
                    {m.text}
                  </div>
                  {m.role === 'user' && <div className="w-6 h-6 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0"><Users size={12} className="text-gray-500" /></div>}
                </motion.div>
              ))}
            </AnimatePresence>
            {chatBusy && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center flex-shrink-0"><Bot size={12} className="text-white" /></div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.12s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.24s' }} />
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-2">
            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Type a question for the AI assistant…" className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
            <motion.button whileTap={{ scale: 0.92 }} onClick={sendChat} disabled={chatBusy}
              className="p-2.5 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white hover:shadow-lg disabled:opacity-50 transition-all">
              <Send size={15} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {renderHeader()}

      <div className="relative flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/70 rounded-xl w-fit overflow-x-auto max-w-full">
        {NAVS.map(n => (
          <button key={n.key} onClick={() => setView(n.key)}
            className={`relative px-3.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${view === n.key ? 'text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {view === n.key && <motion.span layoutId="ai-pill" className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]" transition={{ type: 'spring', stiffness: 350, damping: 30 }} />}
            <span className="relative flex items-center gap-1.5"><n.icon size={12} /> {n.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
          {view === 'overview' && renderOverview()}
          {view === 'assistants' && renderAssistants()}
          {view === 'predict' && renderPredictions()}
          {view === 'forecast' && renderForecast()}
          {view === 'insights' && renderInsights()}
          {view === 'intervention' && renderIntervention()}
        </motion.div>
      </AnimatePresence>

      {renderChat()}
    </div>
  );
}