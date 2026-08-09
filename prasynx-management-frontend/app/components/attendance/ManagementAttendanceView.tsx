'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2, X,
  Search, Users, Loader2, Download, AlertTriangle, TrendingUp, RefreshCw, ClipboardList,
  Brain, Sparkles, Activity, Gauge, CalendarClock, ShieldAlert, TrendingDown, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '../../lib/supabase';
import { auth } from '../../lib/auth';
import { ModuleHeader } from '../../lib/ModuleUi';
import { attendanceApiV2 } from '../../lib/dataService';
import { useApi } from '../../lib/useApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CLR = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', secondary: '#8B5CF6', cyan: '#06B6D4' };

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
    <Card className={`p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3 hover-lift hover:shadow-lg transition-all anim-fade-up delay-${delay}`}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden" style={{ background: bg, color }}>
        <Icon className="w-5 h-5 relative z-10" />
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 50%, ${color}22, transparent 70%)` }} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-gray-500 font-medium truncate">{label}</div>
        <div className="text-xl font-bold text-gray-900 dark:text-white leading-tight tabular-nums"><AnimatedValue value={value} suffix={suffix} /></div>
        {sub && <div className="text-[9px] text-gray-400 truncate">{sub}</div>}
      </div>
    </Card>
  );
}

function ChartCard({ title, sub, children, delay = 0, height = 210 }: {
  title: string; sub?: string; children: React.ReactNode; delay?: number; height?: number | string;
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
  const width = `${Math.max(3, Math.min(100, rate))}%`;
  return (
    <div className={`flex-1 h-2 rounded-full bg-gray-100 overflow-hidden ${shimmer ? 'bar-shimmer' : ''}`}>
      <div className="h-full rounded-full bar-fill" style={{ width, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
    </div>
  );
}

function TrendPill({ value }: { value: any }) {
  if (value == null) return null;
  const up = value.direction === 'up';
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${up ? 'text-emerald-300' : 'text-red-400'}`}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {Math.abs(Number(value.pct) || 0)}%
    </span>
  );
}

export function ManagementAttendanceView() {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);

  // Selected filters
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lowAttendanceThreshold, setLowAttendanceThreshold] = useState<number>(75);

  const organisationId = auth.getOrganisationId();

  // AI insights layer (server-computed; graceful fallback to client heuristics)
  const ai = useApi(() => attendanceApiV2.getAiInsights(), []);
  const aiData = ai.data || {};

  // Fetch classes and sections on mount
  useEffect(() => {
    async function loadMeta() {
      try {
        let query = supabase.from('classes').select('*');
        if (organisationId) query = query.eq('organisation_id', organisationId);
        const { data: classData } = await query;
        setClasses(classData || []);

        let sectionQuery = supabase.from('sections').select('*');
        if (organisationId) sectionQuery = sectionQuery.eq('organisation_id', organisationId);
        const { data: sectionData } = await sectionQuery;
        setSections(sectionData || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, [organisationId]);

  // Filter sections based on selected class
  const filteredSections = useMemo(() => {
    if (selectedClass === 'all') return [];
    return sections.filter(s => s.class_id === selectedClass);
  }, [selectedClass, sections]);

  // Reset section when class changes
  useEffect(() => {
    setSelectedSection('all');
  }, [selectedClass]);

  // Load all student profiles and compute summaries from records
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      let studentQuery = supabase
        .from('students')
        .select('id, full_name, roll_number, class_id, section_id, classes(name), sections(name)');
      if (organisationId) studentQuery = studentQuery.eq('organisation_id', organisationId);
      const { data: studentData, error: stuErr } = await studentQuery;
      if (stuErr) throw stuErr;

      const currentStudents = studentData || [];
      setStudents(currentStudents);

      // Fetch all attendance records and compute summaries client-side
      const studentIds = currentStudents.map((s: any) => s.id);
      let recordsMap: Record<string, any[]> = {};
      if (studentIds.length > 0) {
        const { data: allRecords, error: recErr } = await supabase
          .from('attendance_records')
          .select('*')
          .in('student_id', studentIds);
        if (!recErr && allRecords) {
          recordsMap = allRecords.reduce((acc: Record<string, any[]>, r: any) => {
            if (!acc[r.student_id]) acc[r.student_id] = [];
            acc[r.student_id].push(r);
            return acc;
          }, {});
        }
      }

      const computedSummaries = currentStudents.map((s: any) => {
        const records = recordsMap[s.id] || [];
        const statusOf = (r: any) => (r.status || r.attendance_status || '').toLowerCase();
        const present = records.filter(r => statusOf(r) === 'present').length;
        const absent = records.filter(r => statusOf(r) === 'absent').length;
        const late = records.filter(r => statusOf(r) === 'late').length;
        const leave = records.filter(r => ['excused', 'leave', 'on_leave'].includes(statusOf(r))).length;
        const total = records.length;
        return {
          student_id: s.id,
          total_present: present,
          total_absent: absent,
          total_late: late,
          total_leave: leave,
          attendance_percentage: total > 0 ? Math.round((present / total) * 100) : 0,
        };
      });
      setSummaries(computedSummaries);
    } catch {
      toast.error('Failed to load management attendance data');
    } finally {
      setLoading(false);
    }
  }, [organisationId]);

  useEffect(() => {
    loadData();

    // Subscribe to attendance records changes
    const channel = supabase
      .channel('management_attendance_sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance_records'
        },
        (payload: any) => {
          console.log("Realtime records update received:", payload);
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Process data for rendering student analytics list
  const processedStudents = useMemo(() => {
    return students.map(s => {
      const summary = summaries.find(sum => sum.student_id === s.id) || {
        total_present: 0,
        total_absent: 0,
        total_late: 0,
        total_leave: 0,
        attendance_percentage: 0
      };

      const total = summary.total_present + summary.total_absent + summary.total_late + summary.total_leave;

      return {
        id: s.id,
        rollNumber: s.roll_number || '—',
        fullName: s.full_name,
        classId: s.class_id,
        className: s.classes?.name || '—',
        sectionId: s.section_id,
        sectionName: s.sections?.name || '—',
        present: summary.total_present,
        absent: summary.total_absent,
        late: summary.total_late,
        leave: summary.total_leave,
        total,
        percentage: Math.round(Number(summary.attendance_percentage || 0))
      };
    });
  }, [students, summaries]);

  // Apply filters
  const filteredStudents = useMemo(() => {
    return processedStudents.filter(s => {
      const matchClass = selectedClass === 'all' || s.classId === selectedClass;
      const matchSection = selectedSection === 'all' || s.sectionId === selectedSection;
      const matchSearch = !searchQuery ||
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSection && matchSearch;
    });
  }, [processedStudents, selectedClass, selectedSection, searchQuery]);

  // Low attendance list
  const lowAttendanceStudents = useMemo(() => {
    return processedStudents.filter(s => s.total > 0 && s.percentage < lowAttendanceThreshold);
  }, [processedStudents, lowAttendanceThreshold]);

  // Compute school-wide KPI aggregates based on active filters
  const aggregates = useMemo(() => {
    const activeList = filteredStudents;
    const totalPercentageSum = activeList.reduce((sum, s) => sum + s.percentage, 0);
    const avgPercentage = activeList.length > 0 ? Math.round(totalPercentageSum / activeList.length) : 0;

    const totalPresent = activeList.reduce((sum, s) => sum + s.present, 0);
    const totalAbsent = activeList.reduce((sum, s) => sum + s.absent, 0);
    const totalLate = activeList.reduce((sum, s) => sum + s.late, 0);
    const totalLeave = activeList.reduce((sum, s) => sum + s.leave, 0);

    return {
      avgPercentage,
      totalPresent,
      totalAbsent,
      totalLate,
      totalLeave,
      count: activeList.length
    };
  }, [filteredStudents]);

  // Class-wise compliance (for chart + hero sparkline)
  const classCompliance = useMemo(() => {
    const map = new Map<string, { sum: number; count: number }>();
    filteredStudents.forEach(s => {
      if (s.total === 0) return;
      const key = s.className || '—';
      const e = map.get(key) || { sum: 0, count: 0 };
      e.sum += s.percentage;
      e.count++;
      map.set(key, e);
    });
    return Array.from(map.entries())
      .map(([name, e]) => ({ name, rate: Math.round(e.sum / e.count) }))
      .sort((a, b) => b.rate - a.rate);
  }, [filteredStudents]);

  // P / A / L / Leave breakdown for donut
  const statusDonut = useMemo(() => {
    const data = [
      { name: 'Present', value: aggregates.totalPresent, color: '#22C55E' },
      { name: 'Absent', value: aggregates.totalAbsent, color: '#EF4444' },
      { name: 'Late', value: aggregates.totalLate, color: '#F59E0B' },
      { name: 'Leave', value: aggregates.totalLeave, color: '#3B82F6' },
    ];
    return data.filter(d => d.value > 0);
  }, [aggregates]);

  // Chronic absentees (API first, client fallback)
  const chronicAbsentees = useMemo(() => {
    const apiList = Array.isArray(aiData.chronicAbsentees) ? aiData.chronicAbsentees : [];
    if (apiList.length > 0) {
      return apiList.map((c: any) => ({
        name: c.student?.full_name || 'Student',
        absent: c.totalAbsences ?? 0,
        pct: c.attendancePct ?? 0,
      }));
    }
    return processedStudents
      .filter(s => s.total > 0 && s.absent >= 15)
      .sort((a, b) => b.absent - a.absent)
      .slice(0, 10)
      .map(s => ({ name: s.fullName, absent: s.absent, pct: s.percentage }));
  }, [aiData.chronicAbsentees, processedStudents]);

  // AI forecast (API first, client heuristic fallback)
  const forecastList = useMemo(() => {
    const apiList = Array.isArray(aiData.forecast) ? aiData.forecast : [];
    if (apiList.length > 0) {
      return apiList.slice(0, 6).map((f: any) => ({
        name: f.studentName || 'Student',
        currentPct: f.currentPct ?? 0,
        projectedPct: f.projectedPct ?? 0,
        riskLevel: f.riskLevel || 'medium',
      }));
    }
    return processedStudents
      .filter(s => s.total > 0 && s.percentage < 80)
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 6)
      .map(s => ({
        name: s.fullName,
        currentPct: s.percentage,
        projectedPct: Math.max(0, s.percentage - s.absent * 2),
        riskLevel: s.percentage < 40 ? 'critical' : s.percentage < 60 ? 'high' : 'medium',
      }));
  }, [aiData.forecast, processedStudents]);

  // AI recommendations (API first, client heuristic fallback)
  const aiRecommendations = useMemo(() => {
    const apiList = Array.isArray(aiData.recommendations) ? aiData.recommendations : [];
    if (apiList.length > 0) return apiList.slice(0, 6);
    const recs: string[] = [];
    if (aggregates.avgPercentage < 80) recs.push('Overall attendance below 80% — implement school-wide awareness program');
    if (lowAttendanceStudents.length > 5) recs.push(`${lowAttendanceStudents.length} students below ${lowAttendanceThreshold}% — schedule parent meetings`);
    if (chronicAbsentees.length > 3) recs.push(`${chronicAbsentees.length} chronic absentees identified — consider counseling and home visits`);
    recs.push('Conduct monthly attendance review with class teachers');
    recs.push('Recognize classes with 100% attendance weekly');
    if (recs.length === 0) recs.push('Attendance is well-managed — continue current practices');
    return recs.slice(0, 6);
  }, [aiData.recommendations, aggregates.avgPercentage, lowAttendanceStudents.length, lowAttendanceThreshold, chronicAbsentees.length]);

  // AI risk students (API first, client fallback)
  const riskStudents = useMemo(() => {
    const apiList = Array.isArray(aiData.riskStudents) ? aiData.riskStudents : [];
    if (apiList.length > 0) {
      return apiList.slice(0, 6).map((r: any) => ({
        name: r.student?.full_name || 'Student',
        probability: r.dropout_probability ?? r.probability ?? null,
        level: (r.risk_level || r.riskLevel || 'medium').toLowerCase(),
      }));
    }
    return lowAttendanceStudents.slice(0, 6).map(s => ({
      name: s.fullName,
      probability: null,
      level: s.percentage < 40 ? 'critical' : s.percentage < 60 ? 'high' : 'medium',
    }));
  }, [aiData.riskStudents, lowAttendanceStudents]);

  // Export CSV function
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      toast.error('No records available to export');
      return;
    }

    const headers = ['Roll No', 'Full Name', 'Class', 'Section', 'Present Days', 'Absent Days', 'Late Days', 'Leave Days', 'Total Days', 'Attendance Rate %'];
    const rows = filteredStudents.map(s => [
      s.rollNumber,
      s.fullName,
      s.className,
      s.sectionName,
      s.present,
      s.absent,
      s.late,
      s.leave,
      s.total,
      `${s.percentage}%`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Attendance Report exported successfully');
  };

  const avgScore = aggregates.avgPercentage;
  const scoreColor = avgScore >= 80 ? CLR.success : avgScore >= 55 ? CLR.warning : CLR.danger;
  const bestClass = classCompliance[0];
  const worstClass = classCompliance[classCompliance.length - 1];
  const projectedAtRisk = forecastList.filter((f: any) => f.projectedPct < 60).length;

  const sparkPoints = (vals: number[]) => {
    const max = Math.max(1, ...vals);
    const w = 64, h = 28, step = w / Math.max(1, vals.length - 1);
    return vals.map((v, i) => `${i * step},${h - (v / max) * h}`).join(' ');
  };

  const heroMetrics = [
    { label: 'Overall Rate', value: `${avgScore}%`, color: '#A78BFA' },
    { label: 'Present Markings', value: aggregates.totalPresent, color: '#34D399' },
    { label: 'Absent Markings', value: aggregates.totalAbsent, color: '#F87171' },
    { label: 'Late Markings', value: aggregates.totalLate, color: '#FBBF24' },
    { label: 'At Risk < 75%', value: lowAttendanceStudents.length, color: '#FB923C' },
    { label: 'Chronic Absentees', value: chronicAbsentees.length, color: '#F472B6' },
  ];

  return (
    <div className="px-6 pb-6 space-y-6 anim-fade-in">
      <ModuleHeader
        icon={ClipboardList}
        gradient="bg-gradient-to-br from-[#22C55E] to-[#06B6D4]"
        title="Student Attendance"
        subtitle="Monitor attendance compliance and low-attendance alerts across the school"
        onRefresh={loadData}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard icon={TrendingUp} label="Overall Attendance" value={avgScore} suffix="%" sub={`${aggregates.count} students tracked`} color={CLR.primary} bg="#F3F0FF" delay={1} />
        <KpiCard icon={CheckCircle2} label="Present Markings" value={aggregates.totalPresent} sub="marked present" color={CLR.success} bg="#F0FDF4" delay={2} />
        <KpiCard icon={X} label="Absent Markings" value={aggregates.totalAbsent} sub="marked absent" color={CLR.danger} bg="#FEF2F2" delay={3} />
        <KpiCard icon={Clock} label="Late Markings" value={aggregates.totalLate} sub="arrived late" color={CLR.warning} bg="#FFFBEB" delay={4} />
        <KpiCard icon={AlertTriangle} label="At-Risk Students" value={lowAttendanceStudents.length} sub={`below ${lowAttendanceThreshold}%`} color={CLR.warning} bg="#FFF7ED" delay={5} />
        <KpiCard icon={ShieldAlert} label="Chronic Absentees" value={chronicAbsentees.length} sub="15+ absences" color={CLR.danger} bg="#FEF2F2" delay={5} />
      </div>

      {/* AI Attendance Intelligence hero */}
      <div className="rounded-2xl overflow-hidden text-white p-6 relative anim-gradient anim-fade-up delay-1"
        style={{ background: 'linear-gradient(-45deg, #0EA5E9 0%, #22C55E 45%, #6D4CFF 80%, #2D1B69 100%)', backgroundSize: '220% 220%' }}>
        <div className="absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl anim-float" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-[#22D3EE]/30 blur-2xl anim-pulse-glow" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-[#22C55E]/20 blur-3xl anim-float" style={{ animationDelay: '1.5s' }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Brain size={16} className="anim-pulse-glow" />
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-90">AI Attendance Intelligence</span>
          </div>
          <h3 className="text-xl font-extrabold mb-4">Attendance Health &amp; Risk Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {heroMetrics.map((m, i) => (
              <div key={m.label} className="rounded-xl bg-white/10 p-3 backdrop-blur-sm border border-white/10 anim-fade-up hover:bg-white/20 hover:-translate-y-0.5 transition-all"
                style={{ animationDelay: `${0.12 * i}s` }}>
                <div className="text-[9px] uppercase tracking-wider opacity-75">{m.label}</div>
                <div className="text-lg font-extrabold mt-0.5 tabular-nums">{m.value}</div>
                <svg width="64" height="16" viewBox="0 0 64 16" className="mt-1.5 opacity-70">
                  <line x1="0" y1="8" x2="64" y2="8" stroke={`${m.color}55`} strokeWidth="1" strokeDasharray="3 3" />
                  <polyline points="0,10 16,6 32,9 48,4 64,7" fill="none" stroke={m.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
                    strokeDasharray={`${(avgScore / 100) * 264} 264`} style={{ transition: 'stroke-dasharray 1s ease' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold tabular-nums" style={{ color: scoreColor }}>{avgScore}</span>
                  <span className="text-[7px] uppercase tracking-widest opacity-75">Health</span>
                </div>
              </div>
              <div className="text-xs text-white/90 max-w-md leading-relaxed">
                <strong className="text-white">AI projection:</strong> {projectedAtRisk} students are forecast to drop below 60% attendance —{' '}
                {bestClass && <span className="text-emerald-200">best compliance in {bestClass.name} ({bestClass.rate}%)</span>}
                {worstClass && bestClass && <span className="text-white/90">, weakest in {worstClass.name} ({worstClass.rate}%)</span>}.
                <div className="flex items-center gap-1.5 mt-1 text-emerald-200">
                  <Sparkles size={11} /> {aiRecommendations.length} AI recommendations generated
                </div>
              </div>
            </div>
            {classCompliance.length > 1 && (
              <div className="hidden md:block">
                <div className="text-[9px] uppercase tracking-wider opacity-75 mb-1">Class Compliance Trend</div>
                <svg width="150" height="40" viewBox="0 0 150 40" className="opacity-90">
                  <polyline points={sparkPoints(classCompliance.map(c => c.rate))} fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Class Compliance" sub="Average attendance rate by class" delay={1}>
          {classCompliance.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No class data yet</div>
          ) : (
            <div className="space-y-3 py-2">
              {classCompliance.slice(0, 8).map(c => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold w-24 truncate text-gray-600">{c.name}</span>
                  <RateBar rate={c.rate} color={c.rate >= 80 ? CLR.success : c.rate >= 60 ? CLR.warning : CLR.danger} shimmer={c.rate < 75} />
                  <span className={`text-[11px] font-bold w-9 text-right tabular-nums ${c.rate >= 80 ? 'text-emerald-600' : c.rate >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>{c.rate}%</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Markings Breakdown" sub="Present / Absent / Late / Leave" delay={2}>
          {statusDonut.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No marking data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDonut} dataKey="value" nameKey="name" innerRadius={46} outerRadius={70} paddingAngle={3}>
                  {statusDonut.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="AI Risk Forecast" sub="Current vs projected attendance for at-risk students" delay={3}>
          {forecastList.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No at-risk students</div>
          ) : (
            <div className="space-y-3 py-2">
              {forecastList.map((f: any, i: number) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold truncate text-gray-700 max-w-[55%]">{f.name}</span>
                    <Badge className={`text-[8px] border ${f.riskLevel === 'critical' ? 'bg-purple-50 text-purple-700 border-purple-200' : f.riskLevel === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {String(f.riskLevel).toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bar-fill" style={{ width: `${f.currentPct}%`, background: CLR.warning }} />
                    </div>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bar-fill" style={{ width: `${f.projectedPct}%`, background: f.projectedPct < 60 ? CLR.danger : CLR.primary }} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 w-12 text-right tabular-nums">
                      {f.currentPct} → {f.projectedPct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* Left Side: Student list with filters */}
        <Card className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 anim-fade-up delay-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Attendance Roster</h3>
              <p className="text-xs text-gray-400 mt-0.5">Filter by class and section to analyze percentages.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                className="text-xs font-semibold py-1.5 px-3 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 shadow-none flex items-center gap-1 cursor-pointer transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
              <button
                onClick={handleExportCSV}
                className="text-xs font-semibold py-1.5 px-3 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100/50 border border-indigo-200 shadow-none flex items-center gap-1 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filters row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Class filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Class</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white outline-none focus:border-[#6D4CFF]"
              >
                <option value="all">All Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Section filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Section</label>
              <select
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                disabled={selectedClass === 'all'}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white outline-none focus:border-[#6D4CFF] disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="all">All Sections</option>
                {filteredSections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Search</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Student name/roll no..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs h-9"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-xs text-gray-400 font-medium">Fetching roster analytics...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Users className="w-12 h-12 opacity-25 mx-auto mb-2" />
              <p className="text-xs font-medium">No student records match selected filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-gray-500 uppercase font-semibold text-[10px] bg-gray-50/50">
                    <th className="py-2 px-3 text-left w-20">Roll No</th>
                    <th className="py-2 px-3 text-left">Name</th>
                    <th className="py-2 px-3 text-center">Class</th>
                    <th className="py-2 px-3 text-center">Section</th>
                    <th className="py-2 px-3 text-center">P / A / L</th>
                    <th className="py-2 px-3 text-center w-32">Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, idx) => (
                    <tr key={s.id || idx} className="border-b dark:border-gray-800 hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-gray-500">{s.rollNumber}</td>
                      <td className="py-2.5 px-3 font-semibold text-gray-800">{s.fullName}</td>
                      <td className="py-2.5 px-3 text-center text-gray-500">{s.className}</td>
                      <td className="py-2.5 px-3 text-center text-gray-500">{s.sectionName}</td>
                      <td className="py-2.5 px-3 text-center text-gray-600 font-medium tabular-nums">
                        {s.present}d / {s.absent}d / {s.late}d
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="flex-1 max-w-[70px] h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full bar-fill"
                              style={{ width: `${s.percentage}%`, background: s.total === 0 ? '#CBD5E1' : s.percentage >= 90 ? CLR.success : s.percentage >= 75 ? CLR.warning : CLR.danger }} />
                          </div>
                          <Badge
                            className={`text-[9px] font-bold py-0.5 border ${
                              s.total === 0 ? 'bg-gray-50 text-gray-500 border-gray-200' :
                              s.percentage >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              s.percentage >= 75 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {s.total === 0 ? 'No Data' : `${s.percentage}%`}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Right Side: AI Insight panel */}
        <div className="space-y-4">
          <Card className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3 anim-fade-up delay-3">
            <div>
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Attendance Warnings
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Students below the alert threshold rate.</p>
            </div>

            {/* Threshold slider value input */}
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border dark:border-gray-700">
              <span className="text-[10px] font-semibold text-gray-500">Alert Threshold</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={lowAttendanceThreshold}
                  onChange={e => setLowAttendanceThreshold(Number(e.target.value))}
                  className="w-10 text-center h-6 text-xs border dark:border-gray-700 rounded bg-white dark:bg-gray-800 font-bold dark:text-gray-100"
                  min="0"
                  max="100"
                />
                <span className="text-xs font-bold text-gray-500">%</span>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {loading ? (
                <div className="text-center py-10 text-xs text-gray-400">Loading alerts...</div>
              ) : lowAttendanceStudents.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-400">No student warnings.</div>
              ) : (
                lowAttendanceStudents.slice(0, 8).map((s, idx) => (
                  <div key={s.id || idx} className="p-3 bg-rose-50/50 hover:bg-rose-50 border border-rose-100 rounded-xl transition-all hover:translate-x-0.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[11px] font-bold text-gray-800 truncate">{s.fullName}</span>
                      <span className="text-[10px] font-black text-rose-600 bg-rose-100/50 px-1.5 py-0.5 rounded-md tabular-nums">{s.percentage}%</span>
                    </div>
                    <div className="text-[9px] text-gray-400 mt-0.5">
                      Class: {s.className} ({s.sectionName}) · Absents: {s.absent}d
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <RateBar rate={s.percentage} color={CLR.danger} />
                      <span className="text-[8px] text-gray-400 w-8 text-right">{s.total}d</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3 anim-fade-up delay-4">
            <div>
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-[#6D4CFF]" />
                AI Recommendations
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Automated action plan for attendance health.</p>
            </div>
            <div className="space-y-2">
              {aiRecommendations.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">No recommendations yet</div>
              ) : (
                aiRecommendations.map((rec: any, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF]/5 to-[#22C55E]/5 border border-gray-100 hover:border-[#6D4CFF]/30 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-[#6D4CFF]/10 text-[#6D4CFF] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles size={10} />
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">{rec}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3 anim-fade-up delay-5">
            <div>
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-[#F59E0B]" />
                Dropout Risk Signals
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Students with elevated absence-driven risk.</p>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {riskStudents.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">No risk flags detected</div>
              ) : (
                riskStudents.map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-amber-50/50 border border-amber-100 hover:bg-amber-50 transition-colors">
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-gray-800 truncate">{r.name}</div>
                      {r.probability != null && (
                        <div className="text-[9px] text-gray-400">{r.probability}% dropout probability</div>
                      )}
                    </div>
                    <Badge className={`text-[8px] border capitalize ${r.level === 'critical' ? 'bg-purple-50 text-purple-700 border-purple-200' : r.level === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {r.level}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 anim-fade-up delay-5">
        <Activity size={12} className="text-[#22C55E]" />
        Live sync enabled — attendance records update in real time via Supabase Realtime
        <CalendarClock size={12} className="text-[#6D4CFF]" />
      </div>
    </div>
  );
}
