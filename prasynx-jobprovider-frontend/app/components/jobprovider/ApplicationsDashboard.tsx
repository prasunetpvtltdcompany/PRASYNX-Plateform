'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Star, Mic, Award, TrendingUp, Sparkles, Search, Filter,
  X, ChevronDown, Download, FileText, Mail, Phone, MapPin,
  Briefcase, CalendarDays, MessageSquare, Eye, UserCheck, Video,
  Clock, ThumbsUp, GraduationCap, BookOpen, Globe, Code2,
  Link, RefreshCw, MoreHorizontal, Upload, Send, Share2,
  ChevronRight, ChevronLeft, Sliders, ListChecks, Ban, CheckCircle,
  Hourglass, ExternalLink, Copy, Home, BarChart3,
  Activity, Target, Zap, Bookmark, Plus, Bot, ArrowUpRight,
  CheckSquare, Square, Trash2, Edit3, AlertCircle, HelpCircle,
  Building2, Hash, ClipboardList, Settings, Bell, LogOut, Menu,
  DollarSign, School, Loader, ArrowRight, ArrowLeft,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart as ReLineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  CartesianGrid,
} from 'recharts';
import apiClient from '../../lib/apiClient';

const CLR = {
  primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B',
  danger: '#EF4444', info: '#3B82F6', purple: '#A855F7',
  indigo: '#4F46E5', pink: '#EC4899', teal: '#14B8A6',
};

const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  new: { color: '#6D4CFF', bg: '#F3F0FF', icon: Star, label: 'New' },
  reviewed: { color: '#3B82F6', bg: '#EFF6FF', icon: Eye, label: 'Reviewed' },
  shortlisted: { color: '#A855F7', bg: '#FAF5FF', icon: UserCheck, label: 'Shortlisted' },
  interview: { color: '#F59E0B', bg: '#FFFBEB', icon: Video, label: 'Interview' },
  offer: { color: '#14B8A6', bg: '#F0FDFA', icon: FileText, label: 'Offer Sent' },
  hired: { color: '#22C55E', bg: '#F0FDF4', icon: Award, label: 'Hired' },
  rejected: { color: '#EF4444', bg: '#FEF2F2', icon: X, label: 'Rejected' },
};

const aiRecommendations = [
  { type: 'match', text: '5 candidates match Frontend Developer role with 90%+ AI score', priority: 'high' },
  { type: 'review', text: '3 applicants require immediate review and response', priority: 'high' },
  { type: 'quality', text: 'Overall candidate quality improved 18% this week', priority: 'medium' },
  { type: 'schedule', text: 'Consider scheduling interviews for 4 shortlisted candidates', priority: 'medium' },
  { type: 'hiring', text: 'Data Science has highest quality applicants this month', priority: 'low' },
];

const stages = ['new', 'reviewed', 'shortlisted', 'interview', 'offer', 'hired'];

function Counter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{count.toLocaleString()}</>;
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
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

export default function ApplicationsDashboard({ provider }: { provider: any }) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [messageModal, setMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [dragItem, setDragItem] = useState<any>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const loadApplications = () => {
    setLoading(true);
    apiClient.get<any[]>('/job-provider/applications').then(r => {
      if (r.success && Array.isArray(r.data) && r.data.length > 0) setApps(r.data);
      else setApps([]);
      setLoading(false);
    }).catch(() => { setApps([]); setLoading(false); });
  };

  useEffect(() => { loadApplications(); }, []);

  const sourceData: any[] = [];

  const allApps = apps;

  const totalApps = allApps.length;
  const shortlistedCount = allApps.filter((a: any) => a.status === 'shortlisted').length;
  const interviewCount = allApps.filter((a: any) => a.status === 'interview').length;
  const hiredCount = allApps.filter((a: any) => a.status === 'hired').length;
  const newCount = allApps.filter((a: any) => a.status === 'new').length;
  const avgScore = Math.round(allApps.reduce((s: number, a: any) => s + (a.ai_score || 0), 0) / Math.max(allApps.length, 1));

  const filteredApps = useMemo(() => {
    let items = allApps;
    if (filterTab !== 'all') items = items.filter((a: any) => a.status === filterTab);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((a: any) =>
        (a.applicant_name || '').toLowerCase().includes(q) ||
        (a.applicant_email || '').toLowerCase().includes(q) ||
        (a.applicant_phone || '').toLowerCase().includes(q) ||
        (a.skills || '').toLowerCase().includes(q) ||
        (a.college || '').toLowerCase().includes(q) ||
        (a.part_time_jobs?.title || '').toLowerCase().includes(q)
      );
    }
    return items;
  }, [allApps, filterTab, search]);

  const kanbanData = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    stages.forEach(s => { grouped[s] = []; });
    allApps.forEach((a: any) => {
      const status = a.status || 'new';
      if (grouped[status]) grouped[status].push(a);
      else grouped['new'].push(a);
    });
    return grouped;
  }, [allApps]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const r = await apiClient.patch(`/job-provider/applications/${id}/status`, { status });
      if (r.success) {
        setApps((prev: any[]) => prev.map((a: any) => a.id === id ? { ...a, status } : a));
        setSelectedApp((prev: any) => prev?.id === id ? { ...prev, status } : prev);
      }
    } catch { }
  };

  const handleDragStart = (e: React.DragEvent, app: any) => {
    setDragItem(app);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    if (dragItem && dragItem.status !== stage) {
      updateStatus(dragItem.id, stage);
    }
    setDragItem(null);
    setDragOverStage(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedApps(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedApps.size === filteredApps.length) setSelectedApps(new Set());
    else setSelectedApps(new Set(filteredApps.map((a: any) => a.id)));
  };

  const bulkAction = (status: string) => {
    selectedApps.forEach(id => updateStatus(id, status));
    setSelectedApps(new Set());
  };

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status];
    if (!config) return <Star size={12} />;
    const Icon = config.icon;
    return <Icon size={12} />;
  };

  const getStatusColor = (status: string) => statusConfig[status]?.color || '#6B7280';
  const getStatusBg = (status: string) => statusConfig[status]?.bg || '#F3F4F6';
  const getStatusLabel = (status: string) => statusConfig[status]?.label || status;

  if (loading) return <div className="flex items-center justify-center py-20"><div className="flex flex-col items-center gap-3"><div className="animate-spin w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" /><span className="text-xs text-gray-400 font-medium">Loading applications...</span></div></div>;

  const isEmpty = allApps.length === 0;

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { label: 'Experience', options: ['All', '0-1 yr', '1-3 yrs', '3-5 yrs', '5+ yrs'] },
                  { label: 'Skills', options: ['All', 'React', 'Python', 'Node.js', 'UI/UX'] },
                  { label: 'Location', options: ['All', 'Remote', 'Bangalore', 'Delhi', 'Mumbai'] },
                  { label: 'Education', options: ['All', 'IIT', 'NIT', 'BITS', 'Other'] },
                  { label: 'AI Match Score', options: ['All', '90%+', '80%+', '70%+', 'Below 70%'] },
                  { label: 'Expected Salary', options: ['All', '<₹15k', '₹15k-₹30k', '₹30k-₹50k', '₹50k+'] },
                  { label: 'Job Position', options: ['All', 'Frontend', 'Backend', 'Data Science', 'Design'] },
                  { label: 'Application Date', options: ['All', 'Today', 'This Week', 'This Month', 'Older'] },
                ].map((filter, i) => (
                  <div key={i}>
                    <div className="text-[9px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">{filter.label}</div>
                    <select className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#6D4CFF] bg-white">
                      {filter.options.map((opt, j) => (
                        <option key={j} value={opt.toLowerCase()}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== EMPTY STATE ===== */}
      {isEmpty ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 border border-gray-100/80 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-[#F3F0FF] flex items-center justify-center mx-auto mb-4">
            <Users size={40} className="text-[#6D4CFF]" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">No Applications Yet</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">Applications will automatically appear when candidates apply to your jobs. Start by promoting your listings.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5a3ed9] transition-all shadow-md shadow-purple-200">
              <TrendingUp size={14} /> Promote Jobs
            </button>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
              <Plus size={14} /> Post New Job
            </button>
            <button onClick={() => setShowAiPanel(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 text-xs font-semibold hover:from-purple-100 hover:to-pink-100 border border-purple-200 transition-all">
              <Sparkles size={14} /> Ask Prerana AI
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ===== TABLE VIEW ===== */}
          {viewMode === 'table' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="w-8 px-3 py-3">
                        <input type="checkbox" checked={selectedApps.size === filteredApps.length && filteredApps.length > 0}
                          onChange={toggleSelectAll} className="rounded border-gray-300 text-[#6D4CFF] focus:ring-[#6D4CFF] w-3 h-3" />
                      </th>
                      <th className="text-left px-3 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">Candidate</th>
                      <th className="text-left px-3 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">Applied Job</th>
                      <th className="text-left px-3 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">Skills</th>
                      <th className="text-left px-3 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">AI Match</th>
                      <th className="text-left px-3 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">Date</th>
                      <th className="text-left px-3 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">Stage</th>
                      <th className="text-right px-3 py-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map((app: any) => (
                      <motion.tr key={app.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="border-b border-gray-50 hover:bg-[#F8F6FF] transition-colors group">
                        <td className="px-3 py-3">
                          <input type="checkbox" checked={selectedApps.has(app.id)} onChange={() => toggleSelect(app.id)}
                            className="rounded border-gray-300 text-[#6D4CFF] focus:ring-[#6D4CFF] w-3 h-3" />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setSelectedApp(app); setDrawerOpen(true); }}>
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6D4CFF]/10 to-[#A855F7]/10 flex items-center justify-center text-xs font-bold text-[#6D4CFF] flex-shrink-0">
                              {(app.applicant_name || '?')[0]}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-800 group-hover:text-[#6D4CFF] transition-colors">{app.applicant_name}</div>
                              <div className="text-[9px] text-gray-400">{app.applicant_email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-[11px] font-medium text-gray-700">{app.part_time_jobs?.title || 'N/A'}</div>
                          <div className="text-[9px] text-gray-400">{app.experience || 'Fresher'}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[160px]">
                            {(app.skills || '').split(',').slice(0, 3).map((s: string, i: number) => (
                              <span key={i} className="text-[8px] px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 font-medium">{s.trim()}</span>
                            ))}
                            {(app.skills || '').split(',').length > 3 && (
                              <span className="text-[8px] text-gray-400 font-medium">+{app.skills.split(',').length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-14 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full rounded-full" style={{
                                width: `${app.ai_score || 0}%`,
                                background: (app.ai_score || 0) >= 90 ? 'linear-gradient(90deg, #22C55E, #16A34A)' :
                                  (app.ai_score || 0) >= 75 ? 'linear-gradient(90deg, #6D4CFF, #8B6FFF)' :
                                  (app.ai_score || 0) >= 60 ? 'linear-gradient(90deg, #F59E0B, #FBBF24)' :
                                  'linear-gradient(90deg, #EF4444, #DC2626)'
                              }} />
                            </div>
                            <span className={`text-[10px] font-bold ${
                              (app.ai_score || 0) >= 90 ? 'text-green-600' :
                              (app.ai_score || 0) >= 75 ? 'text-[#6D4CFF]' :
                              (app.ai_score || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                            }`}>{app.ai_score || 0}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-[10px] text-gray-400">
                          {app.created_at ? new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
                            style={{ background: getStatusBg(app.status || 'new'), color: getStatusColor(app.status || 'new') }}>
                            {getStatusIcon(app.status || 'new')}
                            {getStatusLabel(app.status || 'new')}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedApp(app); setDrawerOpen(true); }}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF] transition-all" title="View Profile">
                              <Eye size={13} />
                            </button>
                            <button onClick={() => updateStatus(app.id, 'shortlisted')}
                              className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-all" title="Shortlist">
                              <UserCheck size={13} />
                            </button>
                            <button onClick={() => setScheduleModal(true)}
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-all" title="Schedule Interview">
                              <CalendarDays size={13} />
                            </button>
                            <div className="relative group/more">
                              <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                                <MoreHorizontal size={13} />
                              </button>
                              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl border border-gray-200 shadow-lg z-20 hidden group-hover/more:block">
                                {['shortlisted', 'interview', 'offer', 'hired', 'rejected'].map(s => (
                                  <button key={s} onClick={() => updateStatus(app.id, s)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] text-gray-600 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                                    style={{ color: getStatusColor(s) }}>
                                    {getStatusIcon(s)} Move to {getStatusLabel(s)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="opacity-100 group-hover:opacity-0 transition-opacity flex items-center justify-end gap-1">
                            <span className="text-[9px] text-gray-300">{app.applicant_phone?.slice(-4) || ''}</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {filteredApps.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-16 text-center">
                          <Search size={24} className="mx-auto text-gray-200 mb-2" />
                          <p className="text-sm text-gray-400 font-medium">No candidates match your search</p>
                          <button onClick={() => { setSearch(''); setFilterTab('all'); }} className="mt-2 text-[10px] text-[#6D4CFF] font-semibold hover:underline">Clear filters</button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/30">
                <span className="text-[10px] text-gray-400">{filteredApps.length} of {allApps.length} applications</span>
                <div className="flex items-center gap-2">
                  <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><ChevronLeft size={12} /></button>
                  <span className="text-[10px] font-medium text-gray-600">1</span>
                  <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><ChevronRight size={12} /></button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== KANBAN VIEW ===== */}
          {viewMode === 'kanban' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto pb-4">
              <div className="flex gap-3 min-w-[900px]">
                {stages.map(stage => {
                  const config = statusConfig[stage];
                  const Icon = config?.icon || Star;
                  const items = kanbanData[stage] || [];
                  return (
                    <div key={stage} className="flex-1 min-w-[140px]">
                      <div className="flex items-center gap-2 mb-2.5 px-1">
                        <div className="p-1 rounded-lg" style={{ background: `${config?.color || '#6B7280'}15`, color: config?.color || '#6B7280' }}>
                          <Icon size={11} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700">{config?.label || stage}</span>
                        <span className="text-[8px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full ml-auto">{items.length}</span>
                      </div>
                      <div
                        onDragOver={(e) => handleDragOver(e, stage)}
                        onDrop={(e) => handleDrop(e, stage)}
                        className={`space-y-2 min-h-[300px] rounded-xl p-2 transition-all ${
                          dragOverStage === stage ? 'bg-[#6D4CFF]/5 border-2 border-dashed border-[#6D4CFF]/30' : 'bg-gray-50/50 border-2 border-transparent'
                        }`}>
                        {items.length === 0 && (
                          <div className="flex items-center justify-center h-20 text-[9px] text-gray-300 font-medium">
                            Drop candidates here
                          </div>
                        )}
                        {items.map((app: any) => (
                          <div key={app.id} draggable onDragStart={(e) => handleDragStart(e, app)}
                            className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-grab active:cursor-grabbing group/card">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6D4CFF]/10 to-[#A855F7]/10 flex items-center justify-center text-[10px] font-bold text-[#6D4CFF] flex-shrink-0">
                                {(app.applicant_name || '?')[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold text-gray-800 truncate">{app.applicant_name}</div>
                                <div className="text-[8px] text-gray-400 truncate">{app.part_time_jobs?.title || 'N/A'}</div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {(app.skills || '').split(',').slice(0, 2).map((s: string, i: number) => (
                                <span key={i} className="text-[7px] px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 font-medium">{s.trim()}</span>
                              ))}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <div className="w-10 h-1 rounded-full bg-gray-100 overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${app.ai_score || 0}%`, background: '#6D4CFF' }} />
                                </div>
                                <span className="text-[8px] font-bold text-[#6D4CFF]">{app.ai_score || 0}%</span>
                              </div>
                              <button onClick={() => { setSelectedApp(app); setDrawerOpen(true); }}
                                className="opacity-0 group-hover/card:opacity-100 transition-opacity p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                                <Eye size={10} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* ===== CANDIDATE PROFILE DRAWER ===== */}
      <AnimatePresence>
        {drawerOpen && selectedApp && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={() => setDrawerOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-10 flex items-center justify-between px-5 py-3">
                <h3 className="text-sm font-bold text-gray-800">Candidate Profile</h3>
                <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-5">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center text-xl font-bold text-white shadow-md shadow-purple-200">
                    {(selectedApp.applicant_name || '?')[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-gray-900">{selectedApp.applicant_name}</div>
                    <div className="text-xs text-gray-400">{selectedApp.applicant_role}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: getStatusBg(selectedApp.status || 'new'), color: getStatusColor(selectedApp.status || 'new') }}>
                        {getStatusIcon(selectedApp.status || 'new')} {getStatusLabel(selectedApp.status || 'new')}
                      </span>
                      <span className="text-[9px] text-gray-400">ID: {selectedApp.id}</span>
                    </div>
                  </div>
                </div>

                {/* AI Score Ring */}
                <div className="bg-gradient-to-br from-[#F3F0FF] to-[#FAF5FF] rounded-2xl p-4 border border-[#6D4CFF]/10">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#E5E7EB" strokeWidth="4" />
                        <circle cx="32" cy="32" r="28" fill="none" stroke="#6D4CFF" strokeWidth="4"
                          strokeDasharray={`${(selectedApp.ai_score || 0) * 1.76} 176`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-extrabold text-[#6D4CFF]">{selectedApp.ai_score || 0}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-gray-800">AI Match Score</div>
                      <div className="text-[10px] text-gray-500 mb-2">Based on skills, experience & assessment</div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Skills', value: selectedApp.ai_score || 0 },
                          { label: 'Communication', value: selectedApp.communication_score || 0 },
                          { label: 'Culture Fit', value: selectedApp.culture_fit_score || 0 },
                          { label: 'Experience', value: selectedApp.experience_score || 0 },
                        ].map((score, i) => (
                          <div key={i} className="text-center">
                            <div className="text-[9px] font-bold text-gray-700">{score.value}%</div>
                            <div className="text-[7px] text-gray-400">{score.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-green-600" />
                    <span className="text-xs font-bold text-green-800">AI Insights</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Excellent React Skills', 'Strong Communication',
                      selectedApp.ai_score >= 85 ? 'High Hiring Probability' : 'Good Potential',
                      'Recommended For Interview',
                    ].map((insight, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/80 text-[9px] font-medium text-green-700 border border-green-200">
                        <Zap size={8} /> {insight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-1"><Mail size={10} /> Email</div>
                    <div className="text-[11px] font-semibold text-gray-700 truncate">{selectedApp.applicant_email}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-1"><Phone size={10} /> Phone</div>
                    <div className="text-[11px] font-semibold text-gray-700">{selectedApp.applicant_phone || 'N/A'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-1"><MapPin size={10} /> Location</div>
                    <div className="text-[11px] font-semibold text-gray-700">{selectedApp.location || 'N/A'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 mb-1"><GraduationCap size={10} /> Education</div>
                    <div className="text-[11px] font-semibold text-gray-700 truncate">{selectedApp.education || 'N/A'}</div>
                  </div>
                </div>

                {/* Applied Job & Details */}
                <div className="p-3 rounded-xl bg-[#F3F0FF] border border-[#6D4CFF]/10">
                  <div className="flex items-center gap-1.5 text-[9px] text-[#6D4CFF] font-semibold mb-1">
                    <Briefcase size={10} /> Applied For
                  </div>
                  <div className="text-xs font-bold text-gray-800">{selectedApp.part_time_jobs?.title || 'Unknown Position'}</div>
                  <div className="text-[9px] text-gray-500 mt-1">{selectedApp.experience || 'Fresher'} experience &middot; {selectedApp.college || 'N/A'}</div>
                </div>

                {/* Skills */}
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedApp.skills || '').split(',').map((s: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-gray-100 text-[9px] font-medium text-gray-600">{s.trim()}</span>
                    ))}
                  </div>
                </div>

                {/* Projects & Certifications */}
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Projects</div>
                    <div className="p-2.5 rounded-xl bg-gray-50 text-[10px] text-gray-600 leading-relaxed">{selectedApp.projects || 'No projects listed'}</div>
                  </div>
                  {selectedApp.certifications && (
                    <div>
                      <div className="text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Certifications</div>
                      <div className="p-2.5 rounded-xl bg-gray-50 text-[10px] text-gray-600">{selectedApp.certifications}</div>
                    </div>
                  )}
                </div>

                {/* Resume & Links */}
                <div className="flex flex-wrap gap-2">
                  {selectedApp.resume_url && (
                    <a href={selectedApp.resume_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6D4CFF]/10 text-[#6D4CFF] text-[10px] font-semibold hover:bg-[#6D4CFF]/20 transition-all">
                      <Download size={12} /> Download Resume
                    </a>
                  )}
                  {selectedApp.portfolio && (
                    <a href={selectedApp.portfolio} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-gray-200 transition-all">
                      <Globe size={12} /> Portfolio
                    </a>
                  )}
                  {selectedApp.linkedin && (
                    <a href={selectedApp.linkedin} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-semibold hover:bg-blue-100 transition-all">
                      <Link size={12} /> LinkedIn
                    </a>
                  )}
                  {selectedApp.github && (
                    <a href={selectedApp.github} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900/5 text-gray-700 text-[10px] font-semibold hover:bg-gray-900/10 transition-all">
                      <Code2 size={12} /> GitHub
                    </a>
                  )}
                </div>

                {/* Cover Note */}
                {selectedApp.cover_note && (
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                    <div className="text-[9px] text-purple-500 font-semibold mb-1">Cover Note</div>
                    <div className="text-[10px] text-purple-700 italic leading-relaxed">"{selectedApp.cover_note}"</div>
                  </div>
                )}

                {/* Recruiter Notes */}
                {selectedApp.notes && (
                  <div>
                    <div className="text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wider">Recruiter Notes</div>
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-[10px] text-amber-800">{selectedApp.notes}</div>
                  </div>
                )}

                {/* Assessment Score */}
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">Assessment Scores</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Technical', value: selectedApp.assessment_score || 0 },
                      { label: 'Communication', value: selectedApp.communication_score || 0 },
                      { label: 'Culture Fit', value: selectedApp.culture_fit_score || 0 },
                      { label: 'Experience', value: selectedApp.experience_score || 0 },
                    ].map((score, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[8px] text-gray-400">{score.label}</span>
                          <span className="text-[10px] font-bold" style={{
                            color: score.value >= 85 ? '#22C55E' : score.value >= 70 ? '#6D4CFF' : score.value >= 55 ? '#F59E0B' : '#EF4444'
                          }}>{score.value}%</span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${score.value}%`,
                            background: score.value >= 85 ? '#22C55E' : score.value >= 70 ? '#6D4CFF' : score.value >= 55 ? '#F59E0B' : '#EF4444'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Update Status */}
                <div>
                  <div className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wider">Update Stage</div>
                  <div className="flex flex-wrap gap-1.5">
                    {stages.map(s => {
                      const config = statusConfig[s];
                      const Icon = config?.icon || Star;
                      const isActive = selectedApp.status === s;
                      return (
                        <button key={s} onClick={() => updateStatus(selectedApp.id, s)}
                          disabled={isActive}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-semibold transition-all disabled:opacity-50"
                          style={{
                            background: isActive ? `${config?.color || '#6B7280'}15` : '#F3F4F6',
                            color: config?.color || '#6B7280',
                            border: isActive ? `1px solid ${config?.color || '#6B7280'}40` : '1px solid transparent'
                          }}>
                          <Icon size={10} /> {config?.label || s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interview Info */}
                {selectedApp.interview_date && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <div className="flex items-center gap-1.5 text-[9px] text-amber-600 font-semibold mb-1">
                      <CalendarDays size={10} /> Interview Scheduled
                    </div>
                    <div className="text-xs font-semibold text-amber-800">
                      {new Date(selectedApp.interview_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setMessageModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5a3ed9] transition-all shadow-md shadow-purple-200">
                    <MessageSquare size={13} /> Send Message
                  </button>
                  <button onClick={() => setScheduleModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
                    <CalendarDays size={13} /> Schedule Interview
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== AI SCREENING PANEL MODAL ===== */}
      <AnimatePresence>
        {showAiPanel && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setShowAiPanel(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[560px] bg-white rounded-2xl shadow-2xl z-50 overflow-y-auto max-h-[90vh] border border-gray-200">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center">
                    <Sparkles size={15} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">AI Screening Insights</h3>
                    <p className="text-[9px] text-gray-400">Powered by Prerana AI</p>
                  </div>
                </div>
                <button onClick={() => setShowAiPanel(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-gradient-to-br from-[#F3F0FF] to-[#FAF5FF] rounded-2xl p-4 border border-[#6D4CFF]/10">
                  <h4 className="text-xs font-bold text-gray-800 mb-3">Top Candidate Matches</h4>
                  {allApps.sort((a: any, b: any) => (b.ai_score || 0) - (a.ai_score || 0)).slice(0, 5).map((app: any, i: number) => (
                    <div key={i} className="flex items-center gap-2.5 py-2 border-b border-[#6D4CFF]/5 last:border-0">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6D4CFF]/10 to-[#A855F7]/10 flex items-center justify-center text-[9px] font-bold text-[#6D4CFF]">
                        {(app.applicant_name || '?')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-gray-700">{app.applicant_name}</div>
                        <div className="text-[9px] text-gray-400">{app.part_time_jobs?.title}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-extrabold text-[#6D4CFF]">{app.ai_score}%</div>
                        <div className="text-[7px] text-gray-400">Match</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                  <h4 className="text-xs font-bold text-green-800 mb-2">AI Recommendations</h4>
                  <div className="space-y-2">
                    {aiRecommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className={`p-1 rounded-lg mt-0.5 ${
                          rec.priority === 'high' ? 'bg-red-50 text-red-500' :
                          rec.priority === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                        }`}>
                          {rec.priority === 'high' ? <Zap size={10} /> :
                           rec.priority === 'medium' ? <Clock size={10} /> : <Info size={10} />}
                        </div>
                        <span className="text-[10px] text-gray-600">{rec.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-800 mb-2">Screening Summary</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Total Screened', value: totalApps, color: CLR.primary },
                      { label: 'Qualified', value: shortlistedCount + interviewCount + hiredCount, color: CLR.success },
                      { label: 'Needs Review', value: newCount, color: CLR.warning },
                      { label: 'Avg Match Score', value: `${avgScore}%`, color: CLR.purple },
                    ].map((item, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white/80 border border-blue-100/50">
                        <div className="text-[8px] text-gray-400">{item.label}</div>
                        <div className="text-sm font-extrabold" style={{ color: item.color }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== ANALYTICS MODAL ===== */}
      <AnimatePresence>
        {showAnalytics && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setShowAnalytics(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[640px] bg-white rounded-2xl shadow-2xl z-50 overflow-y-auto max-h-[90vh] border border-gray-200">
              <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between p-4">
                <h3 className="text-sm font-bold">Application Analytics</h3>
                <button onClick={() => setShowAnalytics(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-5">
                {/* Trend */}
                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-600 mb-3 uppercase tracking-wider">Applications Trend</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={[]}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6D4CFF" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#6D4CFF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                      <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #F3F4F6' }} />
                      <Area type="monotone" dataKey="applications" stroke="#6D4CFF" strokeWidth={2} fill="url(#trendGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Sources */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                    <h4 className="text-[10px] font-bold text-gray-600 mb-3 uppercase tracking-wider">Application Sources</h4>
                    <div className="flex items-center justify-center h-[140px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[]} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="none" />
                          <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center mt-1">
                      <span className="text-[8px] text-gray-400">No source data</span>
                    </div>
                  </div>

                  {/* Funnel */}
                  <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                    <h4 className="text-[10px] font-bold text-gray-600 mb-3 uppercase tracking-wider">Hiring Funnel</h4>
                    <div className="space-y-2">
                      <div className="text-center py-6 text-[10px] text-gray-400">No funnel data available</div>
                    </div>
                  </div>
                </div>

                {/* Conversion Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Shortlist Rate', value: `${Math.round((shortlistedCount / Math.max(totalApps, 1)) * 100)}%`, color: CLR.purple },
                    { label: 'Interview Rate', value: `${Math.round((interviewCount / Math.max(totalApps, 1)) * 100)}%`, color: CLR.warning },
                    { label: 'Offer Rate', value: `${Math.round((allApps.filter((a: any) => a.status === 'offer').length / Math.max(totalApps, 1)) * 100)}%`, color: CLR.teal },
                    { label: 'Hire Rate', value: `${Math.round((hiredCount / Math.max(totalApps, 1)) * 100)}%`, color: CLR.success },
                  ].map((metric, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white border border-gray-100 text-center">
                      <div className="text-sm font-extrabold" style={{ color: metric.color }}>{metric.value}</div>
                      <div className="text-[8px] text-gray-400 mt-0.5">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== MESSAGE MODAL ===== */}
      <AnimatePresence>
        {messageModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-50" onClick={() => setMessageModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] bg-white rounded-2xl shadow-2xl z-50 border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold">
                  {selectedApp ? `Message ${selectedApp.applicant_name}` : 'Send Message'}
                </h3>
                <button onClick={() => setMessageModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-3">
                {selectedApp && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF]/10 to-[#A855F7]/10 flex items-center justify-center text-xs font-bold text-[#6D4CFF]">
                      {selectedApp.applicant_name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{selectedApp.applicant_name}</div>
                      <div className="text-[9px] text-gray-400">{selectedApp.applicant_email}</div>
                    </div>
                  </div>
                )}
                <textarea value={messageText} onChange={e => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF] resize-none" />
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50"><Paperclip size={14} /></button>
                  <button onClick={() => { setMessageModal(false); setMessageText(''); }}
                    disabled={!messageText.trim()}
                    className="flex-1 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5a3ed9] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                    <Send size={13} /> Send Message
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== SCHEDULE INTERVIEW MODAL ===== */}
      <AnimatePresence>
        {scheduleModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-50" onClick={() => setScheduleModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px] bg-white rounded-2xl shadow-2xl z-50 border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold">Schedule Interview</h3>
                <button onClick={() => setScheduleModal(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-3">
                {selectedApp && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF]/10 to-[#A855F7]/10 flex items-center justify-center text-xs font-bold text-[#6D4CFF]">
                      {selectedApp.applicant_name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{selectedApp.applicant_name}</div>
                      <div className="text-[9px] text-gray-400">{selectedApp.part_time_jobs?.title}</div>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-1 block">Date</label>
                  <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-1 block">Time</label>
                  <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-1 block">Interview Type</label>
                  <select className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF] bg-white">
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                    <option value="in-person">In Person</option>
                  </select>
                </div>
                <button onClick={() => { setScheduleModal(false); updateStatus(selectedApp?.id, 'interview'); }}
                  disabled={!scheduleDate || !scheduleTime}
                  className="w-full py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5a3ed9] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <CalendarDays size={13} /> Schedule Interview
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Info({ size }: { size?: number }) {
  return (
    <svg width={size || 12} height={size || 12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function Paperclip({ size }: { size?: number }) {
  return (
    <svg width={size || 14} height={size || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" />
        <span className="text-xs text-gray-400 font-medium">Loading applications...</span>
      </div>
    </div>
  );
}
