'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Plus, Search, X, Filter, Clock, CheckCircle2, AlertCircle, Megaphone,
  TrendingUp, Users, Star, Sparkles, CalendarDays, MessageSquare, Eye,
  School, BookOpen, ArrowUpRight, ChevronRight, Target, HelpCircle, Zap,
  BarChart3, PieChart as PieChartIcon, Send, FileText, Trash2, Edit3,
  MoreHorizontal, Globe, Mail, Phone, MapPin, ThumbsUp, Share2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '@/components/ui/progress';

const PCOLORS = { primary: '#7C3AED', secondary: '#8B5CF6', tertiary: '#6366F1', success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };
const PIE_COLORS = ['#7C3AED', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#6366F1', '#EC4899'];

interface AnnouncementsDashboardProps {
  announcementsHook: any;
  announcements: any[];
  setActiveTab: (tab: string) => void;
  setShowAnnounceModal: (v: boolean) => void;
  darkMode?: boolean;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const announcementTrend = Array.from({ length: 12 }, (_, i) => ({
  month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  count: 0,
  reads: 0,
}));

const priorityDist = [
  { name: 'Normal', value: 45, color: '#3B82F6' },
  { name: 'Important', value: 28, color: '#F59E0B' },
  { name: 'High Priority', value: 12, color: '#EF4444' },
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

export function AnnouncementsDashboard({ announcementsHook, announcements, setActiveTab, setShowAnnounceModal, darkMode }: AnnouncementsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedTab, setSelectedTab] = useState<'all' | 'create' | 'analytics'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const effectiveAnnouncements = useMemo(() => {
    if (Array.isArray(announcements) && announcements.length > 0) return announcements;
    return [];
  }, [announcements]);

  const totalReads = effectiveAnnouncements.reduce((s: number, a: any) => s + (a.readCount || 0), 0);
  const highPriority = effectiveAnnouncements.filter((a: any) => a.priority === 'high').length;
  const thisWeek = effectiveAnnouncements.filter((a: any) => {
    const d = new Date(a.date);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 86400000 * 7;
  }).length;

  const filteredAnnouncements = useMemo(() => {
    let result = effectiveAnnouncements;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a: any) =>
        (a.title || '').toLowerCase().includes(q) ||
        (a.content || '').toLowerCase().includes(q) ||
        (a.category || '').toLowerCase().includes(q)
      );
    }
    if (filterPriority !== 'all') result = result.filter((a: any) => a.priority === filterPriority);
    if (filterCategory !== 'all') result = result.filter((a: any) => (a.category || '').toLowerCase() === filterCategory.toLowerCase());
    return result;
  }, [effectiveAnnouncements, searchQuery, filterPriority, filterCategory]);

  const formatDate = (d: string) => {
    if (!d) return '—';
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) return date.toLocaleDateString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diff < 86400000 * 7) return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const categoryIcon = (cat: string) => {
    const c = cat?.toLowerCase() || '';
    if (c.includes('academic')) return BookOpen;
    if (c.includes('event')) return Star;
    if (c.includes('notice')) return Bell;
    if (c.includes('staff')) return Users;
    if (c.includes('security')) return ShieldCheck;
    return Megaphone;
  };

  if (announcementsHook?.loading) {
    return (
      <div className="space-y-6">
        <div><div className="h-7 w-56 bg-gray-200 rounded-lg animate-pulse" /><div className="h-4 w-72 bg-gray-100 rounded-lg mt-2 animate-pulse" /></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        </div>
      </div>
    );
  }

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
                <Megaphone size={20} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-200">Communication Center</div>
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Announcements</h1>
              </div>
            </div>
            <p className="text-sm text-purple-100/90 mt-2 max-w-xl leading-relaxed">
              Create and manage school-wide announcements, notices, and important communications.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { icon: Megaphone, value: effectiveAnnouncements.length, label: 'Total Announcements', color: '#A855F7' },
                { icon: CalendarDays, value: thisWeek, label: 'This Week', color: '#3B82F6' },
                { icon: AlertCircle, value: highPriority, label: 'High Priority', color: '#EF4444' },
                { icon: Eye, value: totalReads, label: 'Total Reads', color: '#10B981' },
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
              onClick={() => setShowAnnounceModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#7C3AED] hover:bg-white/95 hover:shadow-[0_8px_24px_rgba(255,255,255,0.25)] font-bold rounded-xl text-xs h-10 shadow-lg border-0 transition-all"
            >
              <Plus size={16} /> New Announcement
            </motion.button>
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-10 border border-white/25 backdrop-blur-sm transition-all"
            >
              <Sparkles size={16} /> Generate with AI
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ===== TAB NAVIGATION ===== */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        {[
          { key: 'all', label: 'All Announcements', icon: Megaphone },
          { key: 'create', label: 'Create', icon: Plus },
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

      {/* ===== TAB: ALL ANNOUNCEMENTS ===== */}
      {selectedTab === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Search & Filters */}
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search announcements..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 bg-white" />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>}
                </div>
                <div className="flex gap-2">
                  <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#7C3AED]">
                    <option value="all">All Priority</option>
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="high">High Priority</option>
                  </select>
                  <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#7C3AED]">
                    <option value="all">All Categories</option>
                    {([] as any[]).map((c: any) => <option key={c.name} value={c.name.toLowerCase()}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </Card>

            {/* Announcements List */}
            {filteredAnnouncements.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4"><Megaphone size={28} className="text-gray-300" /></div>
                <h3 className="font-bold text-sm mb-1">No Announcements Found</h3>
                <p className="text-xs text-gray-400 mb-4">Try adjusting your search or filters.</p>
                <button onClick={() => setShowAnnounceModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-xs font-semibold"><Plus size={14} /> Create New</button>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredAnnouncements.map((a: any) => {
                  const CatIcon = categoryIcon(a.category);
                  const isExpanded = expandedId === a.id;
                  return (
                    <motion.div key={a.id} layout className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${a.priority === 'high' ? 'bg-red-500' : a.priority === 'important' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="text-sm font-bold text-gray-900">{a.title}</h3>
                              {a.priority === 'high' && <Badge className="bg-red-50 text-red-600 border-red-200 text-[9px]">High Priority</Badge>}
                              {a.priority === 'important' && <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200 text-[9px]">Important</Badge>}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-2">
                              <span className="flex items-center gap-1"><CatIcon size={10} />{a.category || 'General'}</span>
                              <span>•</span>
                              <span>{formatDate(a.date)}</span>
                              <span>•</span>
                              <span>By {a.created_by || 'System'}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><Eye size={10} />{a.readCount || 0} reads</span>
                            </div>
                            <p className={`text-xs text-gray-600 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>{a.content}</p>
                            {a.target && <div className="flex items-center gap-1.5 mt-2">
                              <Users size={11} className="text-gray-400" />
                              <span className="text-[10px] text-gray-400">Target: {a.target}</span>
                            </div>}
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => setExpandedId(isExpanded ? null : a.id)} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors">
                              <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors">
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                        </div>
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
              <div className="space-y-3">
                {([] as any[]).map((act, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${act.color}15` }}>
                      <act.icon size={12} style={{ color: act.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-gray-700">{act.text}</p>
                      <p className="text-[10px] text-gray-400">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><PieChartIcon size={14} className="text-[#7C3AED]" /> Categories</h3>
              <div className="space-y-2.5">
                {([] as any[]).map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                      <span className="text-xs text-gray-600">{cat.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{cat.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Bell size={14} className="text-[#7C3AED]" /> Priority Distribution</h3>
              <div className="space-y-2.5">
                {priorityDist.map((p) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                      <span className="text-xs text-gray-600">{p.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{p.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Prerana AI Assistant */}
            <Card className="p-5 bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Prerana AI</div>
                    <div className="text-[9px] text-purple-200">Announcement Assistant</div>
                  </div>
                </div>
                <p className="text-[11px] text-purple-100/90 mb-3 leading-relaxed">
                  Craft engaging announcements, schedule broadcasts, and track engagement with AI-powered insights.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: 'Draft Notice', icon: FileText },
                    { label: 'Schedule Post', icon: CalendarDays },
                    { label: 'Engagement Report', icon: BarChart3 },
                    { label: 'Translate', icon: Globe },
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

      {/* ===== TAB: CREATE ===== */}
      {selectedTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-base font-bold mb-1">Create New Announcement</h3>
              <p className="text-xs text-gray-400 mb-5">Draft a new announcement to share with students, staff, or parents.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Title</label>
                  <input type="text" placeholder="e.g., Exam Schedule Update" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Category</label>
                    <select className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#7C3AED] bg-white">
                      <option>Academic</option>
                      <option>Event</option>
                      <option>Notice</option>
                      <option>Staff</option>
                      <option>Security</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Priority</label>
                    <select className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#7C3AED] bg-white">
                      <option value="normal">Normal</option>
                      <option value="important">Important</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Target Audience</label>
                  <select className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#7C3AED] bg-white">
                    <option>All</option>
                    <option>All Students</option>
                    <option>All Staff</option>
                    <option>Students + Staff</option>
                    <option>Parents</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Content</label>
                  <textarea rows={6} placeholder="Write your announcement content here..." className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 bg-white resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Schedule Date</label>
                    <input type="date" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#7C3AED] bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Schedule Time</label>
                    <input type="time" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#7C3AED] bg-white" />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9] transition-all"><Send size={14} /> Publish Now</button>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all"><CalendarDays size={14} /> Schedule Later</button>
                  <button className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-400 text-xs font-semibold hover:bg-gray-50 transition-all">Save Draft</button>
                </div>
              </div>
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Tips for Effective Announcements</h3>
              <div className="space-y-3">
                {[
                  { icon: Target, text: 'Be clear and concise in your message', color: '#7C3AED' },
                  { icon: Users, text: 'Target the right audience for maximum impact', color: '#3B82F6' },
                  { icon: Clock, text: 'Schedule announcements at optimal times', color: '#10B981' },
                  { icon: FileText, text: 'Include relevant details and call-to-action', color: '#F59E0B' },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${tip.color}15` }}>
                      <tip.icon size={12} style={{ color: tip.color }} />
                    </div>
                    <p className="text-[11px] text-gray-600">{tip.text}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Recent Drafts</h3>
              <p className="text-xs text-gray-400">No draft announcements saved yet.</p>
            </Card>
          </div>
        </div>
      )}

      {/* ===== TAB: ANALYTICS ===== */}
      {selectedTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-4">Announcement Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={announcementTrend}>
                    <defs>
                      <linearGradient id="countGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED" stopOpacity={0.2} /><stop offset="100%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient>
                      <linearGradient id="readsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.2} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="count" stroke="#7C3AED" fill="url(#countGrad)" strokeWidth={2} name="Announcements" />
                    <Area type="monotone" dataKey="reads" stroke="#10B981" fill="url(#readsGrad)" strokeWidth={2} name="Reads" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-5">
                <h3 className="text-sm font-bold mb-4">Priority Distribution</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={priorityDist} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" nameKey="name" paddingAngle={3}>
                        {priorityDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {priorityDist.map((p) => (
                    <div key={p.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                      <span className="text-[10px] text-gray-500">{p.name}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-bold mb-4">Category Performance</h3>
                <div className="space-y-3">
                {([] as any[]).map((cat) => (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">{cat.name}</span>
                        <span className="font-semibold">{cat.count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(cat.count / Math.max(...([] as any[]).map((c: any) => c.count))) * 100}%`, background: cat.color }} />
                      </div>
                    </div>
                ))}
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Summary</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Announcements', value: effectiveAnnouncements.length, color: '#7C3AED' },
                  { label: 'Total Reads', value: totalReads, color: '#10B981' },
                  { label: 'Avg. Reads/Post', value: effectiveAnnouncements.length > 0 ? Math.round(totalReads / effectiveAnnouncements.length) : 0, color: '#3B82F6' },
                  { label: 'High Priority', value: highPriority, color: '#EF4444' },
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

function ShieldCheck(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
