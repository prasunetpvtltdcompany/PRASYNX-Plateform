'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  QrCode, Camera, Fingerprint, Users, Clock, CheckCircle2, AlertCircle,
  Download, Plus, Search, X, RefreshCw, Star, Sparkles, CalendarDays,
  FileText, Eye, TrendingUp, HelpCircle, Send, Globe, BarChart3,
  PieChart as PieChartIcon, Target, Zap, Bell, Smartphone, Scan,
  Shield, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const PCOLORS = { primary: '#7C3AED', secondary: '#8B5CF6', tertiary: '#6366F1', success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };
const PIE_COLORS = ['#7C3AED', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#6366F1', '#EC4899'];

interface QRDashboardProps {
  darkMode?: boolean;
  setActiveTab?: (tab: string) => void;
  generateQR: () => void;
  qrData: any;
  setQrData: (data: any) => void;
  showQRModal: boolean;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const scanTrend = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return {
    day: d.toLocaleDateString('en-US', { weekday: 'short' }),
    scans: 0,
    students: 150,
  };
});

const methodDist = [
  { name: 'QR Code', value: 65, color: '#7C3AED' },
  { name: 'Facial Rec', value: 22, color: '#10B981' },
  { name: 'Fingerprint', value: 13, color: '#3B82F6' },
];

function CounterAnimation({ value, suffix = '', duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => {
    let start = 0;
    const inc = value / (duration * 60);
    ref.current = setInterval(() => {
      start += inc;
      if (start >= value) { setCount(value); clearInterval(ref.current); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(ref.current);
  }, [value, duration]);
  return <span>{count}{suffix}</span>;
}

export function QRDashboard({ darkMode, setActiveTab, generateQR, qrData, setQrData, showQRModal }: QRDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'generate' | 'live' | 'history'>('generate');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const totalScansToday = 0;
  const presentCount = 0;
  const lateCount = 0;
  const avgRate = 0;

  const filteredHistory = ([] as any[]).filter((s: any) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!s.student.toLowerCase().includes(q) && !s.class.toLowerCase().includes(q)) return false;
    }
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case 'present': return <Badge className="bg-green-50 text-green-600 border-green-200 text-[9px]">Present</Badge>;
      case 'late': return <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200 text-[9px]">Late</Badge>;
      case 'absent': return <Badge className="bg-red-50 text-red-600 border-red-200 text-[9px]">Absent</Badge>;
      default: return null;
    }
  };

  const methodIcon = (method: string) => {
    switch (method) {
      case 'QR': return <QrCode size={10} className="text-[#7C3AED]" />;
      case 'Facial': return <Camera size={10} className="text-[#10B981]" />;
      case 'Fingerprint': return <Fingerprint size={10} className="text-[#3B82F6]" />;
      default: return <Smartphone size={10} className="text-gray-400" />;
    }
  };

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* ===== HERO SECTION ===== */}
      <motion.div variants={fadeUp}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] p-6 md:p-8"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
          <motion.div className="absolute w-72 h-72 rounded-full bg-[#A855F7]/25 blur-[90px]" animate={{ x: [-40, 40, -40], y: [-20, 20, -20], scale: [1, 1.15, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} style={{ top: '-15%', left: '-10%' }} />
          <motion.div className="absolute w-80 h-80 rounded-full bg-[#3B82F6]/20 blur-[100px]" animate={{ x: [30, -30, 30], y: [20, -20, 20], scale: [1.1, 1, 1.1] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} style={{ bottom: '-20%', right: '-10%' }} />
          <motion.div className="absolute w-48 h-48 rounded-full bg-[#EC4899]/15 blur-[80px]" animate={{ x: [-15, 15, -15], y: [30, -30, 30] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} style={{ top: '20%', right: '25%' }} />
          {[...Array(10)].map((_, i) => (
            <motion.div key={i} animate={{ opacity: [0.1, 0.5, 0.1], y: [0, -(12 + (i % 4) * 6), 0], x: [0, (i % 3 - 1) * 10, 0] }} transition={{ duration: 5 + (i % 3) * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }} className="absolute rounded-full bg-white/30 pointer-events-none" style={{ width: `${1.5 + (i % 3) * 1}px`, height: `${1.5 + (i % 3) * 1}px`, top: `${10 + (i * 9) % 80}%`, left: `${5 + (i * 13) % 90}%` }} />
          ))}
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <QrCode size={20} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-200">Attendance Technology</div>
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">QR Attendance</h1>
              </div>
            </div>
            <p className="text-sm text-purple-100/90 mt-2 max-w-xl leading-relaxed">
              Generate QR codes, scan attendance, and track student presence in real time.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { icon: QrCode, value: 0, label: 'Active Sessions', color: '#A855F7' },
                { icon: Users, value: totalScansToday, label: 'Today\'s Scans', color: '#3B82F6' },
                { icon: CheckCircle2, value: presentCount, label: 'Present', color: '#10B981' },
                { icon: Clock, value: lateCount, label: 'Late', color: '#F59E0B' },
              ].map((stat, i) => (
                <motion.div key={i} whileHover={{ scale: 1.03, y: -2 }} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon size={14} className="text-white/80" />
                    <span className="text-[10px] font-medium text-purple-200/80">{stat.label}</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {typeof stat.value === 'number' ? <CounterAnimation value={stat.value} /> : stat.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={generateQR}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#7C3AED] hover:bg-white/95 hover:shadow-[0_8px_24px_rgba(255,255,255,0.25)] font-bold rounded-xl text-xs h-10 shadow-lg border-0 transition-all"
            >
              <Plus size={16} /> Generate QR
            </motion.button>
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={() => toast.success('Biometric attendance active!')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-10 border border-white/25 backdrop-blur-sm transition-all"
            >
              <Camera size={16} /> Biometric Mode
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ===== TAB NAVIGATION ===== */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        {[
          { key: 'generate', label: 'Generate', icon: QrCode },
          { key: 'live', label: 'Live View', icon: Activity },
          { key: 'history', label: 'History', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setSelectedTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all ${selectedTab === tab.key ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            ><Icon size={14} />{tab.label}</button>
          );
        })}
      </div>

      {/* ===== TAB: GENERATE ===== */}
      {selectedTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Card className="p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#F3F0FF] flex items-center justify-center mx-auto mb-4">
                  <QrCode size={32} className="text-[#7C3AED]" />
                </div>
                <h3 className="font-bold text-base mb-2">Generate QR Code</h3>
                <p className="text-xs text-gray-400 mb-6">Create a scannable QR code for quick attendance marking.</p>
                <div className="space-y-3 mb-5">
                  <select className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#7C3AED] bg-white">
                    <option>Mathematics - 10A</option>
                    <option>Physics - 11B</option>
                    <option>Chemistry - 12A</option>
                    <option>English - 10A</option>
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <select className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#7C3AED] bg-white">
                      <option>Period 1 (08:00)</option>
                      <option>Period 2 (08:45)</option>
                      <option>Period 3 (09:30)</option>
                      <option>Period 4 (10:30)</option>
                    </select>
                    <select className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#7C3AED] bg-white">
                      <option>Standard (5 min)</option>
                      <option>Extended (10 min)</option>
                      <option>Custom</option>
                    </select>
                  </div>
                </div>
                <button onClick={generateQR} className="w-full py-2.5 rounded-lg bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9] transition-all flex items-center justify-center gap-2">
                  <QrCode size={16} /> Generate QR Code
                </button>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#F0FDF4] flex items-center justify-center mx-auto mb-4">
                  <Camera size={32} className="text-[#10B981]" />
                </div>
                <h3 className="font-bold text-base mb-2">Biometric Attendance</h3>
                <p className="text-xs text-gray-400 mb-6">Use facial recognition or fingerprint for contactless marking.</p>
                <div className="flex items-center justify-center gap-4 mb-5">
                  {[
                    { icon: Camera, label: 'Facial Rec', color: '#10B981', bg: '#F0FDF4' },
                    { icon: Fingerprint, label: 'Fingerprint', color: '#3B82F6', bg: '#EFF6FF' },
                  ].map((m, i) => {
                    const Icon = m.icon;
                    return (
                      <div key={i} className="text-center">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-1.5 cursor-pointer hover:scale-105 transition-all" style={{ background: m.bg, color: m.color }}>
                          <Icon size={24} />
                        </div>
                        <span className="text-[10px] font-medium text-gray-500">{m.label}</span>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => toast.success('Starting biometric scan...')} className="w-full py-2.5 rounded-lg border-2 border-[#10B981] text-[#10B981] text-xs font-bold hover:bg-[#F0FDF4] transition-all">Start Biometric Scan</button>
              </Card>
            </div>

            {/* QR Modal */}
            {showQRModal && qrData && (
              <Card className="p-6 text-center border-2 border-[#F3F0FF]">
                <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-2xl border-2 border-[#F3F0FF] flex items-center justify-center p-4">
                  {qrData.qrDataUrl ? <img src={qrData.qrDataUrl} alt="QR Code" className="w-full h-full" /> : <QrCode size={120} className="text-[#7C3AED]" />}
                </div>
                <h3 className="font-bold text-lg mb-1">Scan to Mark Attendance</h3>
                <p className="text-xs text-gray-400 mb-3">Students can scan this QR code to mark their attendance.</p>
                <Badge className="bg-[#F3F0FF] text-[#7C3AED] mb-4">
                  Expires: {qrData.expires_at ? new Date(qrData.expires_at).toLocaleTimeString() : '—'}
                </Badge>
                <div className="flex gap-3 justify-center">
                  <button className="px-5 py-2 rounded-lg bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9] transition-all flex items-center gap-2">
                    <Download size={14} /> Download
                  </button>
                  <button className="px-5 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
                    <RefreshCw size={14} /> Regenerate
                  </button>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Today's Sessions</h3>
              <div className="space-y-3">
                {([] as any[]).map((sess, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <p className="text-xs font-semibold">{sess.class} - {sess.subject}</p>
                      <p className="text-[10px] text-gray-400">{sess.time} • {sess.scans}/{sess.total} scanned</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold" style={{ color: sess.rate >= 90 ? '#10B981' : sess.rate >= 80 ? '#F59E0B' : '#EF4444' }}>{sess.rate}%</div>
                      <div className="w-16 h-1.5 rounded-full bg-gray-200 mt-0.5">
                        <div className="h-full rounded-full" style={{ width: `${sess.rate}%`, background: sess.rate >= 90 ? '#10B981' : sess.rate >= 80 ? '#F59E0B' : '#EF4444' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Method Distribution</h3>
              <div className="space-y-2.5">
                {methodDist.map((m) => (
                  <div key={m.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                      <span className="text-xs text-gray-600">{m.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{m.value}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Prerana AI */}
            <Card className="p-5 bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Prerana AI</div>
                    <div className="text-[9px] text-purple-200">Attendance Assistant</div>
                  </div>
                </div>
                <p className="text-[11px] text-purple-100/90 mb-3 leading-relaxed">
                  Track real-time attendance, detect anomalies, and generate reports automatically.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: 'Live Monitor', icon: Activity },
                    { label: 'Scan Report', icon: FileText },
                    { label: 'Detect Anomaly', icon: AlertCircle },
                    { label: 'Export Data', icon: Download },
                  ].map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <button key={i} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all">
                        <Icon size={11} className="text-purple-200" />
                        <span className="text-[10px] font-medium text-white/90">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 border border-white/10">
                  <input type="text" placeholder="Ask Prerana AI..." className="flex-1 bg-transparent text-[11px] text-white placeholder-purple-200/60 outline-none border-0" />
                  <Send size={14} className="text-purple-200 cursor-pointer hover:text-white transition-colors" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ===== TAB: LIVE VIEW ===== */}
      {selectedTab === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Activity size={14} className="text-[#10B981]" />
                  Live Scan Feed
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                </h3>
                <Badge className="bg-green-50 text-green-600 border-green-200 text-[9px]">{totalScansToday} scans today</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-400 uppercase">Student</th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-400 uppercase">Class</th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-400 uppercase">Time</th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-400 uppercase">Method</th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {([] as any[]).map((s, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-2.5 px-3 text-xs font-medium text-gray-900">{'—'}</td>
                        <td className="py-2.5 px-3 text-xs text-gray-500">{'—'}</td>
                        <td className="py-2.5 px-3 text-xs text-gray-500">{'—'}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                            {'—'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">{'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Live Summary</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Scanned', value: totalScansToday, color: '#7C3AED' },
                  { label: 'Present', value: presentCount, color: '#10B981' },
                  { label: 'Late', value: lateCount, color: '#F59E0B' },
                  { label: 'Attendance Rate', value: `${avgRate}%`, color: '#3B82F6' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <span className="text-xs text-gray-500">{s.label}</span>
                    <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ===== TAB: HISTORY ===== */}
      {selectedTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search scans..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 bg-white" />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>}
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#7C3AED]">
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold mb-4">Scan History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-400 uppercase">Student</th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-400 uppercase">Class</th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-400 uppercase">Date</th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-400 uppercase">Time</th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-400 uppercase">Method</th>
                      <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-gray-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.length > 0 ? filteredHistory.map((s, i) => (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-2.5 px-3 text-xs font-medium">{s.student}</td>
                        <td className="py-2.5 px-3 text-xs text-gray-500">{s.class}</td>
                        <td className="py-2.5 px-3 text-xs text-gray-500">{s.date}</td>
                        <td className="py-2.5 px-3 text-xs text-gray-500">{s.time}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                            {methodIcon(s.method)} {s.method}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">{statusBadge(s.status)}</td>
                      </tr>
                    )) : <tr><td colSpan={6} className="text-center py-8 text-xs text-gray-400">No scans found</td></tr>}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-4">Scan Trends</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scanTrend}>
                    <defs>
                      <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED" stopOpacity={0.2} /><stop offset="100%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="scans" stroke="#7C3AED" fill="url(#scanGrad)" strokeWidth={2} name="Scans" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Method Breakdown</h3>
              <div className="space-y-2.5">
                {methodDist.map((m) => (
                  <div key={m.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">{m.name}</span>
                      <span className="font-semibold">{m.value}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${m.value}%`, background: m.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

    </motion.div>
  );
}
