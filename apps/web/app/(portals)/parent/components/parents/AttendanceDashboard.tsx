'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, CheckCircle2, X, AlertCircle, Calendar, Clock,
  TrendingUp, ChevronRight, Download, CalendarDays,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface AttendanceDashboardProps {
  attendance: any;
  attendanceRate: number;
  selectedChild: any;
  setActiveTab: (tab: string) => void;
  children: any[];
  setSelectedChild: (c: any) => void;
  searchQuery?: string;
  notifArray?: any[];
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

export function AttendanceDashboard({
  attendance, attendanceRate, selectedChild, setActiveTab, children, setSelectedChild, searchQuery, notifArray,
}: AttendanceDashboardProps) {
  const [selectedRange, setSelectedRange] = useState('this-year');
  const [selectedDay, setSelectedDay] = useState<any>(null);

  const effMonthly = useMemo(() => {
    const m = attendance?.monthly || [];
    if (Array.isArray(m) && m.length > 0) return m;
    return [];
  }, [attendance]);

  const effDays = useMemo(() => {
    const d = attendance?.recent_days || attendance?.daily || [];
    if (Array.isArray(d) && d.length > 0) return d;
    return [];
  }, [attendance]);

  const rate = useMemo(() => {
    if (typeof attendanceRate === 'number') return attendanceRate;
    if (selectedChild?.attendance_percentage) return selectedChild.attendance_percentage;
    return 0;
  }, [attendanceRate, selectedChild]);

  const presentDays = attendance?.present ?? 0;
  const absentDays = attendance?.absent ?? 0;
  const lateDays = attendance?.late ?? 0;

  const getDayStatus = (status: string) => {
    switch (status) {
      case 'present': return { color: '#10B981', bg: '#F0FDF4', label: 'Present', icon: CheckCircle2 };
      case 'absent': return { color: '#EF4444', bg: '#FEF2F2', label: 'Absent', icon: X };
      case 'late': return { color: '#F59E0B', bg: '#FFFBEB', label: 'Late', icon: AlertCircle };
      case 'leave': return { color: '#3B82F6', bg: '#EFF6FF', label: 'Leave', icon: Calendar };
      default: return { color: '#94A3B8', bg: '#F8FAFC', label: '—', icon: Clock };
    }
  };

  const thisMonth = effMonthly[effMonthly.length - 1] || { month: new Date().toLocaleString('en-US', { month: 'short' }), present: 0, absent: 0, late: 0, days: 0 };

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* Hero Section */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#6D4CFF] via-[#7C5CFF] to-[#4F2DB8]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(124,58,237,0.15)_0%,transparent_50%)]" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            {selectedChild && (
              <Badge className="bg-white/20 text-white border-0 mb-3">{selectedChild.full_name}</Badge>
            )}
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Attendance Dashboard</h1>
            <p className="text-sm text-white/80 mt-1 max-w-xl">
              Track attendance patterns, monitor school participation, and stay informed.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              {[
                { icon: CalendarCheck, label: 'Rate', value: `${rate}%`, color: '#10B981' },
                { icon: CheckCircle2, label: 'Present', value: presentDays, color: '#10B981' },
                { icon: X, label: 'Absent', value: absentDays, color: '#EF4444' },
                { icon: AlertCircle, label: 'Late', value: lateDays, color: '#F59E0B' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  <div>
                    <span className="text-[10px] text-purple-200/70 block">{item.label}</span>
                    <span className="text-sm font-bold text-white">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#fff" strokeWidth="3"
                  strokeDasharray={`${rate} ${100 - rate}`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-white">{rate}%</span>
            </div>
            <span className="text-[10px] text-purple-200/70 font-medium">Attendance Rate</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
          <Button className="bg-white text-[#6D4CFF] hover:bg-white/95 rounded-xl text-xs h-9 px-4 shadow-[0_4px_12px_rgba(255,255,255,0.15)] border-0 transition-all gap-1.5"
            onClick={() => toast.success('Attendance report download initiated')}>
            <Download className="w-3.5 h-3.5" /> Download Report
          </Button>
          <Button className="bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs h-9 px-4 border border-white/25 transition-all gap-1.5"
            onClick={() => toast.success('Attendance calendar view toggled')}>
            <Calendar className="w-3.5 h-3.5" /> Calendar View
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: TrendingUp, label: 'Attendance Rate', value: `${rate}%`, color: '#6D4CFF', bg: '#F3F0FF' },
          { icon: CheckCircle2, label: 'Present Days', value: presentDays, color: '#10B981', bg: '#F0FDF4' },
          { icon: X, label: 'Absent Days', value: absentDays, color: '#EF4444', bg: '#FEF2F2' },
          { icon: AlertCircle, label: 'Late Arrivals', value: lateDays, color: '#F59E0B', bg: '#FFFBEB' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={i} whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#6D4CFF]/20 transition-all"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: item.bg, color: item.color }}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-medium text-gray-400 mb-0.5">{item.label}</div>
              <div className="text-lg font-extrabold text-gray-900">{item.value}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Two-column: Monthly Chart + Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

        {/* Monthly Bar Chart */}
        <motion.div variants={fadeUp}>
          <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Monthly Attendance Analytics</h3>
                <p className="text-xs text-gray-400">Track attendance trends month by month</p>
              </div>
              <div className="flex gap-1.5">
                {['this-month', 'last-month', 'this-semester', 'this-year'].map(r => (
                  <button key={r} onClick={() => setSelectedRange(r)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                      selectedRange === r ? 'bg-[#6D4CFF] text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {r === 'this-month' ? 'Month' : r === 'last-month' ? 'Last' : r === 'this-semester' ? 'Semester' : 'Year'}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={effMonthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }} />
                  <Bar dataKey="rate" fill="#6D4CFF" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Monthly Summary Sidebar */}
        <motion.div variants={fadeUp}>
          <Card className="p-5">
            <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#6D4CFF]" />
              Monthly Summary
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Present', value: thisMonth.present || 0, total: thisMonth.days || 1, color: '#10B981', bg: '#F0FDF4' },
                { label: 'Absent', value: thisMonth.absent || 0, total: thisMonth.days || 1, color: '#EF4444', bg: '#FEF2F2' },
                { label: 'Late', value: thisMonth.late || 0, total: thisMonth.days || 1, color: '#F59E0B', bg: '#FFFBEB' },
                { label: 'Leave', value: 0, total: thisMonth.days || 1, color: '#3B82F6', bg: '#EFF6FF' },
              ].map((item, i) => {
                const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: item.bg }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs font-medium text-gray-600 flex-1">{item.label}</span>
                    <span className="text-sm font-extrabold" style={{ color: item.color }}>{item.value}</span>
                    <span className="text-[10px] text-gray-400 w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Attendance Timeline */}
      <motion.div variants={fadeUp}>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">Attendance Timeline</h3>
              <p className="text-xs text-gray-400">Daily attendance activity feed</p>
            </div>
            <div className="flex items-center gap-1.5">
              {['present', 'late', 'absent', 'leave'].map(s => {
                const st = getDayStatus(s);
                return (
                  <div key={s} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: st.color }} />
                    <span className="text-[9px] text-gray-400 capitalize">{st.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            {effDays.map((d: any, i: number) => {
              const status = getDayStatus(d.status);
              const Icon = status.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className={`p-4 rounded-xl border transition-all hover:shadow-sm cursor-pointer ${
                    selectedDay?.date === d.date ? 'border-[#6D4CFF] bg-[#FAFAFF]' : 'border-gray-100 hover:border-[#6D4CFF]/20'
                  }`}
                  onClick={() => setSelectedDay(selectedDay?.date === d.date ? null : d)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: status.bg }}>
                      <Icon className="w-5 h-5" style={{ color: status.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${d.status === 'absent' ? 'text-red-600' : d.status === 'late' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {status.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span>Arrived: {d.arrival}</span>
                        <span>Departed: {d.departure}</span>
                      </div>
                      {d.remark && <p className="text-[11px] text-gray-400 mt-1">{d.remark}</p>}
                      {d.reason && (
                        <Badge className="mt-1.5 bg-yellow-50 text-yellow-600 border-yellow-200 text-[9px]">{d.reason}</Badge>
                      )}
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${selectedDay?.date === d.date ? 'rotate-90' : ''}`} />
                  </div>
                  <AnimatePresence>
                    {selectedDay?.date === d.date && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="h-px bg-gray-100 my-3" />
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { label: 'Status', value: status.label, color: status.color },
                            { label: 'Arrival', value: d.arrival, color: '#6D4CFF' },
                            { label: 'Departure', value: d.departure, color: '#6D4CFF' },
                            { label: 'Date', value: new Date(d.date).toLocaleDateString(), color: '#6D4CFF' },
                          ].map((item, j) => (
                            <div key={j} className="p-2 rounded-lg bg-gray-50 text-center">
                              <div className="text-[9px] font-medium text-gray-400">{item.label}</div>
                              <div className="text-xs font-bold mt-0.5" style={{ color: item.color }}>{item.value}</div>
                            </div>
                          ))}
                        </div>
                        {d.remark && (
                          <div className="mt-2 p-2.5 rounded-lg bg-[#F3F0FF] border border-[#6D4CFF]/10">
                            <div className="text-[10px] font-semibold text-[#6D4CFF]">Teacher Remark</div>
                            <p className="text-xs text-gray-600 mt-0.5">{d.remark}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
