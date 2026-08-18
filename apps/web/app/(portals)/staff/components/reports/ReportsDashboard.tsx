'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, FileText, Download, TrendingUp, Users, School, BookOpen,
  Plus, Search, X, Filter, Clock, CheckCircle2, AlertCircle, Award,
  Star, Sparkles, CalendarDays, MessageSquare, Eye, ArrowUpRight,
  ChevronRight, Target, HelpCircle, Zap, PieChart as PieChartIcon,
  Send, Printer, Share2, ClipboardList, GraduationCap, Bell,
  DollarSign, Activity, Mail, Globe,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const PCOLORS = { primary: '#7C3AED', secondary: '#8B5CF6', tertiary: '#6366F1', success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };
const PIE_COLORS = ['#7C3AED', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#6366F1', '#EC4899'];

interface ReportsDashboardProps {
  darkMode?: boolean;
  setActiveTab?: (tab: string) => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};



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

export function ReportsDashboard({ darkMode, setActiveTab }: ReportsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedTab, setSelectedTab] = useState<'all' | 'generate' | 'analytics'>('all');
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const totalReports = 0;
  const totalDownloads = 0;
  const thisMonth = 12;

  const filteredReports = ([] as any[]).filter(r => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!r.title.toLowerCase().includes(q) && !r.category.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q)) return false;
    }
    if (filterCategory !== 'all' && r.category.toLowerCase() !== filterCategory.toLowerCase()) return false;
    return true;
  });

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
                <BarChart3 size={20} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-200">Data & Insights</div>
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Reports</h1>
              </div>
            </div>
            <p className="text-sm text-purple-100/90 mt-2 max-w-xl leading-relaxed">
              Generate, export, and analyze comprehensive academic and administrative reports.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { icon: FileText, value: totalReports, label: 'Available Reports', color: '#A855F7' },
                { icon: CalendarDays, value: thisMonth, label: 'Generated This Month', color: '#3B82F6' },
                { icon: Download, value: totalDownloads, label: 'Total Downloads', color: '#10B981' },
                { icon: Star, value: 0, label: 'Ready to Export', color: '#F59E0B' },
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
              onClick={() => { toast.success('Generating custom report...'); setSelectedTab('generate'); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#7C3AED] hover:bg-white/95 hover:shadow-[0_8px_24px_rgba(255,255,255,0.25)] font-bold rounded-xl text-xs h-10 shadow-lg border-0 transition-all"
            >
              <Plus size={16} /> Generate Report
            </motion.button>
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={() => { toast.success('Request sent to admin'); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-10 border border-white/25 backdrop-blur-sm transition-all"
            >
              <Mail size={16} /> Request Custom
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ===== TAB NAVIGATION ===== */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        {[
          { key: 'all', label: 'All Reports', icon: FileText },
          { key: 'generate', label: 'Generate', icon: Plus },
          { key: 'analytics', label: 'Analytics', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setSelectedTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all ${selectedTab === tab.key ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            ><Icon size={14} />{tab.label}</button>
          );
        })}
      </div>

      {/* ===== TAB: ALL REPORTS ===== */}
      {selectedTab === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Search & Filters */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search reports..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 bg-white" />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>}
                </div>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#7C3AED]">
                  <option value="all">All Categories</option>
                </select>
              </div>
            </Card>

            {/* Report Cards */}
            {filteredReports.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4"><FileText size={28} className="text-gray-300" /></div>
                <h3 className="font-bold text-sm mb-1">No Reports Found</h3>
                <p className="text-xs text-gray-400">Try adjusting your search or filters.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredReports.map((r) => {
                  const Icon = r.icon;
                  return (
                    <motion.div key={r.id} whileHover={{ scale: 1.01, y: -2 }}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: r.bg, color: r.color }}><Icon size={20} /></div>
                        <Badge className={`text-[9px] ${r.format === 'PDF' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>{r.format}</Badge>
                      </div>
                      <h3 className="text-sm font-bold mb-1">{r.title}</h3>
                      <p className="text-[11px] text-gray-500 mb-3 line-clamp-2">{r.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3">
                        <span className="flex items-center gap-1"><Clock size={10} />{r.generated}</span>
                        <span>•</span>
                        <span>{r.pages} pages</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toast.success(`Downloading ${r.title}...`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#7C3AED] text-white text-[10px] font-semibold hover:bg-[#6D28D9] transition-all">
                          <Download size={12} /> {r.format === 'PDF' ? 'Download PDF' : 'Export Excel'}
                        </button>
                        <button onClick={() => setSelectedReport(r)} className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
                          <Eye size={14} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Clock size={14} className="text-[#7C3AED]" /> Recent Activity</h3>
              <p className="text-xs text-gray-400">No recent activity</p>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Report Categories</h3>
              <p className="text-xs text-gray-400">No categories available</p>
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
                    <div className="text-[9px] text-purple-200">Report Assistant</div>
                  </div>
                </div>
                <p className="text-[11px] text-purple-100/90 mb-3 leading-relaxed">
                  Generate custom reports, analyze data trends, and export insights with AI-powered automation.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: 'Quick Summary', icon: FileText },
                    { label: 'Compare Data', icon: BarChart3 },
                    { label: 'Export All', icon: Download },
                    { label: 'Schedule Report', icon: CalendarDays },
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

      {/* ===== TAB: GENERATE ===== */}
      {selectedTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-base font-bold mb-1">Generate Custom Report</h3>
              <p className="text-xs text-gray-400 mb-5">Select parameters to create a tailored report.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Report Type</label>
                    <select className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#7C3AED] bg-white">
                      <option>Academic Performance</option>
                      <option>Class Progress</option>
                      <option>Behavior & Conduct</option>
                      <option>Fee Collection</option>
                      <option>Exam Results</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Format</label>
                    <select className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#7C3AED] bg-white">
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Class</label>
                    <select className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#7C3AED] bg-white">
                      <option>All Classes</option>
                      <option>10A</option>
                      <option>10B</option>
                      <option>11A</option>
                      <option>11B</option>
                      <option>12A</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">From Date</label>
                    <input type="date" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#7C3AED] bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">To Date</label>
                    <input type="date" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#7C3AED] bg-white" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Include Sections</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Summary', 'Charts & Graphs', 'Data Tables', 'Comparative Analysis', 'Trends', 'Recommendations'].map((s) => (
                      <label key={s} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#7C3AED] focus:ring-[#7C3AED]" />
                        <span className="text-xs text-gray-600">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button onClick={() => toast.success('Report generation started!')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9] transition-all"><FileText size={14} /> Generate Report</button>
                  <button onClick={() => toast.success('Report scheduled for weekly delivery')} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all"><CalendarDays size={14} /> Schedule Weekly</button>
                </div>
              </div>
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Quick Reports</h3>
              <div className="space-y-2">
                {[
                  { label: 'This Week Summary', time: '~30 sec' },
                  { label: 'Monthly Performance', time: '~2 min' },
                  { label: 'Term Report Card', time: '~5 min' },
                ].map((qr, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => toast.success(`Generating ${qr.label}...`)}>
                    <span className="text-xs text-gray-600">{qr.label}</span>
                    <span className="text-[10px] text-gray-400">{qr.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ===== TAB: ANALYTICS ===== */}
      {selectedTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-4">Report Generation Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[]}>
                    <defs>
                      <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED" stopOpacity={0.2} /><stop offset="100%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient>
                      <linearGradient id="downGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.2} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="generated" stroke="#7C3AED" fill="url(#genGrad)" strokeWidth={2} name="Generated" />
                    <Area type="monotone" dataKey="downloaded" stroke="#10B981" fill="url(#downGrad)" strokeWidth={2} name="Downloaded" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-5">
                <h3 className="text-sm font-bold mb-4">Category Distribution</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[]} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" nameKey="name" paddingAngle={3} />
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  <p className="text-xs text-gray-400">No data available</p>
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-bold mb-4">Format Preference</h3>
                <div className="space-y-3">
                  {[{ name: 'PDF', value: 65, color: '#EF4444' }, { name: 'Excel', value: 25, color: '#10B981' }, { name: 'CSV', value: 10, color: '#3B82F6' }].map((f) => (
                    <div key={f.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">{f.name}</span>
                        <span className="font-semibold">{f.value}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${f.value}%`, background: f.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Summary Stats</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Reports', value: totalReports, color: '#7C3AED' },
                  { label: 'Generated This Month', value: thisMonth, color: '#10B981' },
                  { label: 'Total Downloads', value: totalDownloads, color: '#3B82F6' },
                  { label: 'Avg. Downloads/Report', value: totalReports > 0 ? Math.round(totalDownloads / totalReports) : 0, color: '#F59E0B' },
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

    </motion.div>
  );
}
