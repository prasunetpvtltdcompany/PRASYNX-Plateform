'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCheck, Settings, Download, X, Search, Filter,
  ChevronDown, MoreHorizontal, Star, UserCheck, Video, Award,
  Briefcase, MessageSquare, Bot, Sparkles, CalendarDays, Clock,
  AlertCircle, TrendingUp, Users, Mail, Smartphone, Share2,
  Globe, Zap, Target, HelpCircle, Trash2, Pin, Archive,
  Eye, EyeOff, RefreshCw, Plus, ArrowUpRight, CheckCircle,
  UserPlus, FileText, CreditCard, Activity, Loader,
  ArrowRight, ArrowLeft, Home, BarChart3,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import apiClient from '../../lib/apiClient';

const CLR = {
  primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B',
  danger: '#EF4444', info: '#3B82F6', purple: '#A855F7',
  indigo: '#4F46E5', pink: '#EC4899', teal: '#14B8A6', orange: '#F97316',
};

const priorityColors: Record<string, string> = {
  high: '#EF4444', medium: '#F59E0B', low: '#6B7280', urgent: '#DC2626',
};

const typeIcons: Record<string, any> = {
  application: Users, interview: Video, shortlist: UserCheck,
  ai: Bot, message: MessageSquare, offer: Award,
  job: Briefcase, billing: CreditCard, system: Bell,
};

const dailyNotifications = [
  { icon: Users, label: 'New Applications', count: 18, trend: '+8 Today', color: CLR.primary, chart: [10, 14, 12, 18, 16, 20, 18] },
  { icon: Video, label: 'Interview Updates', count: 7, trend: '+3 Today', color: CLR.warning, chart: [3, 5, 4, 7, 6, 8, 7] },
  { icon: MessageSquare, label: 'Messages', count: 12, trend: '+5 Today', color: CLR.info, chart: [8, 10, 9, 12, 11, 14, 12] },
  { icon: AlertCircle, label: 'Hiring Alerts', count: 4, trend: 'Urgent: 2', color: CLR.danger, chart: [2, 3, 2, 4, 3, 5, 4] },
  { icon: Bell, label: 'System', count: 9, trend: '+2 Today', color: CLR.purple, chart: [6, 7, 5, 9, 8, 10, 9] },
];

function MiniChart({ data, color }: { data: number[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={28}>
      <AreaChart data={data.map((v, i) => ({ i, v }))}>
        <defs>
          <linearGradient id={`mc${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#mc${color.replace('#', '')})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function timeAgo(date: Date) {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationsDashboard() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timeView, setTimeView] = useState<'today' | 'week' | 'month'>('today');

  const [notifSettings, setNotifSettings] = useState({
    email: true, push: true, sms: false, whatsapp: false,
    desktop: true, slack: false, interview_reminders: true,
    application_alerts: true, hiring_updates: true,
    ai_recommendations: true, system: true,
  });

  useEffect(() => {
    setLoading(true);
    apiClient.get<any[]>('/job-provider/notifications').then((r) => {
      if (r.success && r.data && r.data.length > 0) setNotifications(r.data);
      else setNotifications([]);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let list = notifications;
    if (filter !== 'all') {
      if (filter === 'unread') list = list.filter((n) => !n.read);
      else list = list.filter((n) => n.type === filter);
    }
    if (priorityFilter !== 'all') list = list.filter((n) => n.priority === priorityFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((n) => n.title.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q) || n.user?.toLowerCase().includes(q));
    }
    return list;
  }, [notifications, filter, priorityFilter, searchQuery]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const groupedByDate = useMemo(() => {
    const groups: Record<string, any[]> = {};
    const now = new Date();
    filtered.forEach((n) => {
      const d = new Date(n.time);
      let key: string;
      const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
      if (diff === 0) key = 'Today';
      else if (diff === 1) key = 'Yesterday';
      else if (diff < 7) key = 'This Week';
      else if (diff < 30) key = 'This Month';
      else key = 'Older';
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });
    return groups;
  }, [filtered]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  };

  const removeNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" /></div>;

  if (notifications.length === 0) {
    return (
      <div className="max-w-[1600px] mx-auto">
        <div className="bg-white rounded-2xl p-12 md:p-16 border border-gray-200 text-center shadow-sm">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center mx-auto mb-6">
              <Bell size={48} className="text-[#6D4CFF]" />
            </div>
          </motion.div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Notifications Yet</h3>
          <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto">
            Notifications about applications, interviews, candidate activity, and recruitment updates will appear here.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D4CFF] text-white text-sm font-semibold hover:bg-[#5a3ed9] transition-all shadow-md shadow-purple-200">
              <Briefcase size={16} /> View Jobs
            </button>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
              <Users size={16} /> Review Applications
            </button>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
              <Bot size={16} /> Ask Prerana AI
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* ===== HEADER ===== */}
      <div className="relative overflow-hidden rounded-2xl p-4 md:p-6 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.15)]"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-[#6D4CFF]/20 rounded-full blur-[140px]" />
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-[#3B82F6]/12 rounded-full blur-[140px]" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">Notifications</div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Notification Center</h1>
            <p className="text-xs text-white/60 mt-1">Stay updated with candidate activity, interviews, and hiring alerts.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] text-white font-medium">
              <Bell size={11} className="text-amber-300" /> {unreadCount} Unread
            </span>
            <button onClick={markAllRead} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-white border border-white/20 transition-all">
              <CheckCheck size={12} className="inline mr-1" /> Mark All Read
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-white border border-white/20 transition-all">
              <Settings size={12} className="inline mr-1" /> Settings
            </button>
          </div>
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {dailyNotifications.map((card, i) => {
          const CardIcon = card.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2, scale: 1.01 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-3.5 border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between mb-1.5">
                <div className="p-1.5 rounded-lg" style={{ background: `${card.color}12`, color: card.color }}>
                  <CardIcon size={13} />
                </div>
                <span className="text-[7px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${card.color}12`, color: card.color }}>{card.trend}</span>
              </div>
              <div className="text-sm md:text-base font-extrabold text-gray-900">{card.count}</div>
              <div className="text-[8px] text-gray-400 font-medium mb-1">{card.label}</div>
              <div className="h-5">
                <MiniChart data={card.chart} color={card.color} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* LEFT / CENTER: Notification Feed */}
        <div className="xl:col-span-8 space-y-4">
          {/* Filters */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-gray-100/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notifications..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF]" />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {['all', 'unread', 'application', 'interview', 'message', 'system', 'ai'].map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[8px] font-semibold transition-all flex-shrink-0 ${filter === f ? 'bg-[#6D4CFF] text-white' : 'text-gray-400 hover:bg-gray-100'}`}>
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    {f === 'unread' && <span className="ml-1 bg-red-400 text-white px-1 rounded-full text-[7px]">{unreadCount}</span>}
                  </button>
                ))}
              </div>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-gray-200 text-[9px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 bg-white">
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Time View Tabs */}
          <div className="flex items-center gap-1">
            {['today', 'week', 'month'].map((t) => (
              <button key={t} onClick={() => setTimeView(t as any)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-semibold transition-all ${timeView === t ? 'bg-[#6D4CFF]/10 text-[#6D4CFF] border border-[#6D4CFF]/20' : 'text-gray-400 hover:bg-gray-100 border border-transparent'}`}>
                {t === 'today' ? 'Today' : t === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          {/* Notification Groups */}
          <div className="space-y-4">
            {Object.entries(groupedByDate).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{dateLabel}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[8px] text-gray-300">{items.length} notification{items.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-1.5">
                  {items.map((n) => {
                    const TypeIcon = typeIcons[n.type] || Bell;
                    const isUnread = !n.read;
                    return (
                      <motion.div key={n.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className={`group relative flex items-start gap-3 p-3.5 rounded-xl transition-all cursor-pointer ${isUnread ? 'bg-[#6D4CFF]/5 border border-[#6D4CFF]/10 hover:bg-[#6D4CFF]/8' : 'bg-white border border-gray-100 hover:bg-gray-50/80 hover:border-gray-200'} shadow-sm`}
                        onClick={() => toggleRead(n.id)}>
                        {isUnread && <span className="absolute top-3.5 left-3.5 w-1.5 h-1.5 rounded-full bg-[#6D4CFF]" />}
                        <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === 'ai' ? 'bg-gradient-to-br from-[#6D4CFF]/20 to-[#A855F7]/20' : 'bg-gray-100'}`}
                          style={n.type === 'ai' ? {} : { background: `${n.type === 'application' ? CLR.primary : n.type === 'interview' ? CLR.warning : n.type === 'message' ? CLR.info : n.type === 'offer' ? CLR.success : n.type === 'shortlist' ? CLR.purple : '#6B7280'}12` }}>
                          <TypeIcon size={15} style={{ color: n.type === 'ai' ? CLR.purple : n.type === 'application' ? CLR.primary : n.type === 'interview' ? CLR.warning : n.type === 'message' ? CLR.info : n.type === 'offer' ? CLR.success : n.type === 'shortlist' ? CLR.purple : '#6B7280' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`text-[11px] ${isUnread ? 'font-bold' : 'font-semibold'} text-gray-800 truncate ${isUnread ? '' : ''}`}>{n.title}</span>
                              <span className="px-1.5 py-0.5 rounded text-[7px] font-semibold uppercase"
                                style={{ background: `${priorityColors[n.priority]}15`, color: priorityColors[n.priority] }}>
                                {n.priority}
                              </span>
                            </div>
                            <span className="text-[8px] text-gray-400 whitespace-nowrap flex-shrink-0">{timeAgo(new Date(n.time))}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{n.desc}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[8px] text-gray-400">from {n.source}</span>
                            <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                            <span className="text-[8px] font-medium text-gray-500">{n.user}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); toggleRead(n.id); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title={isUnread ? 'Mark Read' : 'Mark Unread'}>
                            {isUnread ? <Eye size={11} /> : <EyeOff size={11} />}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); removeNotif(n.id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" title="Remove">
                            <X size={11} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="More">
                            <MoreHorizontal size={11} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="xl:col-span-4 space-y-4">
          {/* AI Insights */}
          <div className="bg-gradient-to-br from-[#6D4CFF]/5 via-[#A855F7]/5 to-[#EC4899]/5 rounded-2xl p-4 border border-[#6D4CFF]/10 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-800">Prerana AI Insights</h3>
                <p className="text-[9px] text-gray-400">Smart recruitment intelligence</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-3 rounded-xl bg-white/80 text-center border border-gray-100">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f0f0f0" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke={CLR.primary} strokeWidth="3" strokeDasharray="31.4 100" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-extrabold text-[#6D4CFF]">92%</span>
                  </div>
                </div>
                <div className="text-[8px] text-gray-400">AI Score</div>
              </div>
              <div className="p-3 rounded-xl bg-white/80 text-center border border-gray-100">
                <div className="text-lg font-extrabold text-green-600">96%</div>
                <div className="text-[8px] text-gray-400">Match Quality</div>
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                { icon: Target, text: '5 high-match candidates for Frontend role', color: CLR.primary },
                { icon: AlertCircle, text: '3 interviews pending feedback review', color: CLR.warning },
                { icon: TrendingUp, text: 'Application rate up 22% this week', color: CLR.success },
              ].map((insight, i) => {
                const InsightIcon = insight.icon;
                return (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/60 hover:bg-white/80 transition-colors">
                    <InsightIcon size={11} className="mt-0.5" style={{ color: insight.color }} />
                    <p className="text-[9px] text-gray-600">{insight.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notification Stats */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
            <h3 className="text-xs font-bold text-gray-800 mb-3">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 8 }} />
                <YAxis tick={{ fontSize: 8 }} />
                <Tooltip contentStyle={{ fontSize: 9, borderRadius: 8 }} />
                <Bar dataKey="apps" fill={CLR.primary} radius={[3, 3, 0, 0]} barSize={8} />
                <Bar dataKey="intvs" fill={CLR.warning} radius={[3, 3, 0, 0]} barSize={8} />
                <Bar dataKey="msgs" fill={CLR.info} radius={[3, 3, 0, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-3 mt-2">
              {[{ label: 'Apps', color: CLR.primary }, { label: 'Intvs', color: CLR.warning }, { label: 'Msgs', color: CLR.info }].map((l, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
                  <span className="text-[7px] text-gray-400">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
            <h3 className="text-xs font-bold text-gray-800 mb-3">Live Activity</h3>
            <div className="space-y-2">
              {[
                { text: 'New application for Frontend Dev', time: '2 min ago', color: CLR.primary },
                { text: 'Interview confirmed with Priya', time: '5 min ago', color: CLR.warning },
                { text: 'Message from Sneha Reddy', time: '8 min ago', color: CLR.info },
                { text: 'Offer accepted by Kavita Joshi', time: '12 min ago', color: CLR.success },
                { text: 'AI match found for Data Scientist', time: '15 min ago', color: CLR.purple },
              ].map((act, i) => (
                <div key={i} className="flex items-start gap-2.5 py-1.5 border-b border-gray-50 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: act.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] text-gray-600">{act.text}</div>
                    <div className="text-[7px] text-gray-400">{act.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
            <h3 className="text-xs font-bold text-gray-800 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: CheckCheck, label: 'Mark All Read', color: CLR.primary, onClick: markAllRead },
                { icon: Download, label: 'Export', color: CLR.teal, onClick: () => {} },
                { icon: Settings, label: 'Preferences', color: CLR.purple, onClick: () => setShowSettings(!showSettings) },
                { icon: Trash2, label: 'Clear Read', color: CLR.danger, onClick: () => setNotifications((prev) => prev.filter((n) => !n.read)) },
              ].map((act, i) => {
                const ActIcon = act.icon;
                return (
                  <button key={i} onClick={act.onClick}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all hover:-translate-y-0.5">
                    <div className="p-1.5 rounded-lg" style={{ background: `${act.color}12`, color: act.color }}>
                      <ActIcon size={12} />
                    </div>
                    <span className="text-[8px] font-semibold text-gray-500 text-center">{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notification Settings */}
          {showSettings && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-800">Notification Preferences</h3>
                <button onClick={() => setShowSettings(false)} className="p-1 rounded text-gray-400 hover:bg-gray-100"><X size={12} /></button>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Email Alerts', key: 'email' },
                  { label: 'Push Notifications', key: 'push' },
                  { label: 'SMS Notifications', key: 'sms' },
                  { label: 'WhatsApp Alerts', key: 'whatsapp' },
                  { label: 'Desktop Notifications', key: 'desktop' },
                  { label: 'Slack Notifications', key: 'slack' },
                  { label: 'Interview Reminders', key: 'interview_reminders' },
                  { label: 'Application Alerts', key: 'application_alerts' },
                  { label: 'Hiring Updates', key: 'hiring_updates' },
                  { label: 'AI Recommendations', key: 'ai_recommendations' },
                  { label: 'System Notifications', key: 'system' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-1.5">
                    <span className="text-[9px] font-medium text-gray-600">{item.label}</span>
                    <button
                      onClick={() => setNotifSettings((s) => ({ ...s, [item.key]: !(s as any)[item.key] }))}
                      className={`relative w-8 h-4 rounded-full transition-colors ${(notifSettings as any)[item.key] ? 'bg-[#6D4CFF]' : 'bg-gray-200'}`}>
                      <motion.div animate={{ x: (notifSettings as any)[item.key] ? 16 : 2 }} className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
