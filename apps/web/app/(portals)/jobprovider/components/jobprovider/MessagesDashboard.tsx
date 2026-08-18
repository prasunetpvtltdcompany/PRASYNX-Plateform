'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Search, User, Clock, Briefcase,
  Paperclip, CheckCheck, ChevronRight, Plus, X, Phone, Video,
  FileText, Star, MoreHorizontal, Download, Trash2, Pin,
  Smile, Image, Mic, CalendarDays, Bot, Sparkles, ArrowUpRight,
  Users, Award, TrendingUp, Filter, ChevronDown, Bell,
  Mail, Share2, Copy, ExternalLink, CheckCircle, ThumbsUp,
  HelpCircle, Target, Zap, Globe, MapPin, GraduationCap,
  Building2, DollarSign, BarChart3, Activity, Bookmark,
  RefreshCw, Hourglass, Ban, Settings, ListChecks, Eye,
  UserCheck, Upload, Loader, ArrowRight, ArrowLeft,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart as ReLineChart, Line, AreaChart, Area,
  CartesianGrid,
} from 'recharts';
import apiClient from '../../lib/apiClient';

const CLR = {
  primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B',
  danger: '#EF4444', info: '#3B82F6', purple: '#A855F7',
  indigo: '#4F46E5', pink: '#EC4899', teal: '#14B8A6',
};

const aiResponseSuggestions = [
  { type: 'interview', label: 'Interview Invitation', icon: CalendarDays, color: CLR.primary },
  { type: 'followup', label: 'Follow-Up Message', icon: Send, color: CLR.info },
  { type: 'offer', label: 'Offer Letter', icon: Award, color: CLR.success },
  { type: 'rejection', label: 'Rejection Email', icon: X, color: CLR.danger },
  { type: 'reminder', label: 'Reminder', icon: Bell, color: CLR.warning },
  { type: 'assessment', label: 'Assessment Invite', icon: FileText, color: CLR.purple },
];

function Counter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const inc = value / (duration / 16);
    const timer = setInterval(() => {
      start += inc;
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

const stageConfig: Record<string, { color: string; bg: string; label: string }> = {
  shortlisted: { color: '#A855F7', bg: '#FAF5FF', label: 'Shortlisted' },
  interview: { color: '#F59E0B', bg: '#FFFBEB', label: 'Interview' },
  hired: { color: '#22C55E', bg: '#F0FDF4', label: 'Hired' },
  new: { color: '#6D4CFF', bg: '#F3F0FF', label: 'New' },
  offer: { color: '#14B8A6', bg: '#F0FDFA', label: 'Offer Sent' },
  archived: { color: '#6B7280', bg: '#F3F4F6', label: 'Archived' },
};

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

export default function MessagesDashboard({ provider }: { provider: any }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [input, setInput] = useState('');
  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showCandidateInfo, setShowCandidateInfo] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showBulkMessage, setShowBulkMessage] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [messageText, setMessageText] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    apiClient.get<any[]>('/job-provider/messages').then((r) => {
      if (r.success && r.data && r.data.length > 0) {
        const convs = r.data.reduce((acc: any[], m: any) => {
          const appId = m.application_id;
          const existing = acc.find((a: any) => a.application_id === appId);
          if (!existing) acc.push({
            id: appId, application_id: appId,
            applicant_name: m.part_time_job_applications?.applicant_name || 'Unknown',
            applicant_role: m.part_time_job_applications?.applicant_role || '',
            lastMessage: m.message, time: m.created_at, unread: 0, online: false, pinned: false,
            stage: m.part_time_job_applications?.status || 'new',
            messages: [m],
          });
          else { existing.messages.push(m); existing.lastMessage = m.message; existing.time = m.created_at; }
          return acc;
        }, []);
        setConversations(convs);
      } else { setConversations([]); }
      setLoading(false);
    });
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selectedConv?.messages]);

  const activeConversations = conversations.filter(c => c.stage !== 'archived').length;
  const unreadCount = conversations.reduce((s, c) => s + (c.unread || 0), 0);
  const responseRate = 94;
  const interviewDiscussions = conversations.filter(c => c.stage === 'interview').length;
  const candidateEngagement = 89;
  const aiAssistedReplies = 142;

  const filtered = useMemo(() => {
    let list = conversations;
    if (tab !== 'all') {
      if (tab === 'unread') list = list.filter(c => (c.unread || 0) > 0);
      else if (tab === 'candidates') list = list.filter(c => ['new', 'shortlisted', 'interview'].includes(c.stage));
      else if (tab === 'shortlisted') list = list.filter(c => c.stage === 'shortlisted');
      else if (tab === 'interviews') list = list.filter(c => c.stage === 'interview');
      else if (tab === 'hired') list = list.filter(c => c.stage === 'hired');
      else if (tab === 'archived') list = list.filter(c => c.stage === 'archived');
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.applicant_name?.toLowerCase().includes(q) ||
        c.applicant_role?.toLowerCase().includes(q) ||
        c.lastMessage?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [conversations, tab, searchQuery]);

  const sendMessage = () => {
    if (!input.trim() || !selectedConv) return;
    const newMsg = { id: `m${Date.now()}`, text: input.trim(), from: 'recruiter', time: new Date().toISOString(), read: true };
    setSelectedConv({ ...selectedConv, messages: [...selectedConv.messages, newMsg], lastMessage: input.trim(), time: new Date().toISOString() });
    setConversations(prev => prev.map(c => c.id === selectedConv.id ? { ...c, messages: [...c.messages, newMsg], lastMessage: input.trim(), time: new Date().toISOString() } : c));
    setInput('');
  };

  const generateAIResponse = (type: string) => {
    const candidate = selectedConv?.applicant_name || 'Candidate';
    const role = selectedConv?.applicant_role || 'the position';
    const templates: Record<string, string> = {
      interview: `Subject: Interview Invitation - ${role}\n\nDear ${candidate},\n\nThank you for your interest in the ${role} position at Prasunet. We were impressed by your profile and would like to invite you for an interview.\n\nPlease let us know your availability for next week.\n\nBest regards,\n${provider.contact_name || 'Recruitment Team'}\nPrasunet Hiring`,
      followup: `Subject: Follow-Up on Your Application\n\nDear ${candidate},\n\nI hope this message finds you well. I wanted to follow up on your application for the ${role} position. We are currently reviewing candidates and will get back to you soon.\n\nBest regards,\n${provider.contact_name || 'Recruitment Team'}\nPrasunet Hiring`,
      offer: `Subject: Offer Letter - ${role}\n\nDear ${candidate},\n\nCongratulations! We are pleased to offer you the ${role} position at Prasunet. We were impressed by your skills and believe you will be a great addition to our team.\n\nPlease find the offer letter attached. We look forward to having you on board!\n\nBest regards,\n${provider.contact_name || 'Recruitment Team'}\nPrasunet Hiring`,
      rejection: `Subject: Update on Your Application - ${role}\n\nDear ${candidate},\n\nThank you for your interest in the ${role} position at Prasunet. After careful consideration, we have decided to move forward with other candidates whose qualifications better match our current requirements.\n\nWe wish you the best in your job search.\n\nBest regards,\n${provider.contact_name || 'Recruitment Team'}\nPrasunet Hiring`,
      reminder: `Subject: Reminder: Upcoming Interview\n\nDear ${candidate},\n\nThis is a friendly reminder about your upcoming interview for the ${role} position at Prasunet.\n\nDate: [Date]\nTime: [Time]\nPlatform: [Platform]\n\nPlease join using the following link: [Link]\n\nBest regards,\n${provider.contact_name || 'Recruitment Team'}\nPrasunet Hiring`,
      assessment: `Subject: Assessment Invitation - ${role}\n\nDear ${candidate},\n\nThank you for your application for the ${role} position. As part of our selection process, we would like you to complete an assessment.\n\nPlease complete it within 7 days.\n\nBest regards,\n${provider.contact_name || 'Recruitment Team'}\nPrasunet Hiring`,
    };
    setAiResult(templates[type] || templates.interview);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" /></div>;

  if (conversations.length === 0) {
    return (
      <div className="max-w-[1600px] mx-auto">
        <div className="bg-white rounded-2xl p-12 md:p-16 border border-gray-200 text-center shadow-sm">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center mx-auto mb-6">
              <MessageSquare size={48} className="text-[#6D4CFF]" />
            </div>
          </motion.div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Conversations Yet</h3>
          <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto">
            Start communicating with applicants and candidates to streamline your hiring process.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => setShowNewConversation(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D4CFF] text-white text-sm font-semibold hover:bg-[#5a3ed9] transition-all shadow-md shadow-purple-200">
              <Plus size={16} /> Start Conversation
            </button>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
              <Users size={16} /> View Applications
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
      {/* ===== HERO SECTION ===== */}
      <div className="relative overflow-hidden rounded-2xl p-4 md:p-6 lg:p-8 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.15)]"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-[#6D4CFF]/20 rounded-full blur-[140px]" />
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-[#3B82F6]/12 rounded-full blur-[140px]" />
          <div className="absolute top-[40%] left-[50%] w-1/3 h-1/3 bg-[#A855F7]/10 rounded-full blur-[120px]" />
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} animate={{ opacity: [0.05, 0.3, 0.05], y: [0, -(5 + (i % 3) * 4), 0], x: [0, (i % 2 === 0 ? 4 : -4), 0] }}
              transition={{ duration: 3 + (i % 4) * 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
              className="absolute rounded-full bg-white/20 pointer-events-none"
              style={{ width: `${1 + (i % 3) * 1.2}px`, height: `${1 + (i % 3) * 1.2}px`, top: `${8 + (i * 11) % 84}%`, left: `${5 + (i * 14) % 90}%` }}
            />
          ))}
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">Recruitment Communication</div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-2">
              Communication Center
            </h1>
            <p className="text-sm text-white/60 mb-4">
              Manage conversations with candidates, streamline hiring communication.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { icon: MessageSquare, label: 'Active Conversations', value: activeConversations, color: 'text-green-300' },
                { icon: Users, label: 'Candidate Chats', value: conversations.filter(c => ['new', 'shortlisted', 'interview'].includes(c.stage)).length, color: 'text-blue-300' },
                { icon: Video, label: 'Interview Discussions', value: interviewDiscussions, color: 'text-amber-300' },
                { icon: Zap, label: 'Avg Response Time', value: '15 min', color: 'text-purple-300' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-[10px] text-white/80 font-medium">
                    <Icon size={10} className={item.color} />
                    <span className="font-bold text-white">{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</span>
                    {item.label}
                  </span>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setShowNewConversation(true)} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-[#1a1a2e] hover:bg-white/90 text-xs font-bold transition-all shadow-lg">
                <Plus size={14} /> New Conversation
              </button>
              <button onClick={() => setShowBulkMessage(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/25 transition-all backdrop-blur-sm">
                <Mail size={14} /> Bulk Message
              </button>
              <button onClick={() => setShowScheduleModal(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/12 text-[11px] font-medium text-white/70 text-white border border-white/10 hover:border-white/20 transition-all">
                <CalendarDays size={12} /> Schedule
              </button>
              <button onClick={() => { setShowAIAssistant(true); setAiResult(''); }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/12 text-[11px] font-medium text-white/70 text-white border border-white/10 hover:border-white/20 transition-all">
                <Sparkles size={12} /> AI Assistant
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 xl:col-span-4 hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-[280px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#6D4CFF]/30 via-[#3B82F6]/10 to-[#A855F7]/20 rounded-full blur-[70px] opacity-30" />
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative flex items-center justify-center">
                <div className="grid grid-cols-3 gap-3">
                  {['💬', '📨', '✉️', '📄', '🎤', '📋', '✅', '🤖', '📊'].map((emoji, i) => (
                    <motion.div key={i} animate={{ y: [0, -3 - (i % 3) * 2, 0], scale: [1, 1.05, 1] }}
                      transition={{ duration: 2 + i * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
                      className="w-10 h-10 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/[0.12] flex items-center justify-center text-lg">
                      {emoji}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {[
          { icon: MessageSquare, label: 'Total Conversations', value: activeConversations, trend: '+8 This Week', color: CLR.primary, chart: [30, 35, 32, 38, 36, 42, 40] },
          { icon: Bell, label: 'Unread Messages', value: unreadCount, trend: '+3 Today', color: CLR.danger, chart: [15, 12, 18, 10, 14, 8, 12] },
          { icon: TrendingUp, label: 'Response Rate', value: `${responseRate}%`, trend: '+4% This Month', color: CLR.success, chart: [82, 85, 88, 86, 90, 92, 94] },
          { icon: Video, label: 'Interview Discussions', value: interviewDiscussions, trend: '+5 This Week', color: CLR.warning, chart: [8, 10, 12, 9, 14, 11, 16] },
          { icon: Star, label: 'Candidate Engagement', value: `${candidateEngagement}%`, trend: '+6% This Month', color: CLR.purple, chart: [78, 80, 82, 84, 85, 87, 89] },
          { icon: Bot, label: 'AI Assisted Replies', value: aiAssistedReplies, trend: '+32 This Month', color: CLR.teal, chart: [80, 95, 88, 110, 120, 130, 142] },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3, scale: 1.01 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl" style={{ background: `${card.color}12`, color: card.color }}>
                  <Icon size={16} />
                </div>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${card.color}12`, color: card.color }}>{card.trend}</span>
              </div>
              <div className="text-lg md:text-xl font-extrabold text-gray-900">{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</div>
              <div className="text-[10px] text-gray-400 font-medium mb-2">{card.label}</div>
              <div className="h-8">
                <MiniChart data={card.chart} color={card.color} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ===== QUICK ACTIONS ROW ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Plus, label: 'New Conversation', color: CLR.primary, onClick: () => setShowNewConversation(true) },
          { icon: Mail, label: 'Bulk Message', color: CLR.info, onClick: () => setShowBulkMessage(true) },
          { icon: CalendarDays, label: 'Schedule Meeting', color: CLR.warning, onClick: () => setShowScheduleModal(true) },
          { icon: Download, label: 'Export Logs', color: CLR.teal, onClick: () => {} },
          { icon: FileText, label: 'Comm Report', color: CLR.purple, onClick: () => setShowAnalytics(true) },
          { icon: Video, label: 'Send Interview', color: CLR.indigo, onClick: () => { setShowAIAssistant(true); generateAIResponse('interview'); } },
          { icon: UserCheck, label: 'Send Assessment', color: CLR.pink, onClick: () => { setShowAIAssistant(true); generateAIResponse('assessment'); } },
          { icon: Share2, label: 'Share Templates', color: CLR.primary, onClick: () => {} },
        ].map((action, i) => {
          const ActionIcon = action.icon;
          return (
            <button key={i} onClick={action.onClick}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-100/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className="p-1.5 rounded-lg transition-transform group-hover:scale-110" style={{ background: `${action.color}12`, color: action.color }}>
                <ActionIcon size={13} />
              </div>
              <span className="text-[11px] font-semibold text-gray-600 group-hover:text-gray-800">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===== MAIN MESSAGING AREA ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: Conversation List */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 overflow-x-auto scrollbar-none flex gap-1">
                  {['all', 'unread', 'candidates', 'shortlisted', 'interviews', 'hired', 'archived'].map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[9px] font-semibold transition-all flex-shrink-0 ${tab === t ? 'bg-[#6D4CFF] text-white' : 'text-gray-400 hover:bg-gray-100'}`}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                      {t === 'unread' && unreadCount > 0 && <span className="ml-1 text-white bg-red-500 px-1 rounded-full">{unreadCount}</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF]" />
                <button onClick={() => setAdvancedFilters(!advancedFilters)}
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all ${advancedFilters ? 'text-[#6D4CFF]' : 'text-gray-400 hover:text-gray-600'}`}>
                  <Filter size={12} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[500px] lg:max-h-[600px]">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-xs">No conversations found</div>
              ) : filtered.map((conv, i) => {
                const sc = stageConfig[conv.stage] || stageConfig.new;
                const StageIcon = conv.stage === 'shortlisted' ? UserCheck : conv.stage === 'interview' ? Video : conv.stage === 'hired' ? Award : conv.stage === 'archived' ? X : Star;
                return (
                  <motion.button key={conv.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                    onClick={() => { setSelectedConv(conv); setShowCandidateInfo(false); }}
                    className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-all ${selectedConv?.id === conv.id ? 'bg-[#6D4CFF]/5 border-l-2 border-l-[#6D4CFF]' : 'border-l-2 border-l-transparent'}`}>
                    <div className="flex items-start gap-2.5">
                      <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold text-white"
                          style={{ background: `linear-gradient(135deg, ${sc.color}, ${sc.color}88)` }}>
                          {conv.avatar || conv.applicant_name?.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        {conv.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs font-semibold text-gray-800 truncate">{conv.applicant_name}</span>
                            {conv.pinned && <Pin size={9} className="text-gray-300 flex-shrink-0" />}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {(conv.unread || 0) > 0 && (
                              <span className="w-4 h-4 rounded-full bg-[#6D4CFF] text-white text-[7px] font-bold flex items-center justify-center">{conv.unread}</span>
                            )}
                            <span className="text-[8px] text-gray-400">{timeAgo(new Date(conv.time))}</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-500 truncate mt-0.5">{conv.applicant_role}</div>
                        <div className="text-[9px] text-gray-400 truncate mt-0.5">{conv.lastMessage}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="px-1.5 py-0.5 rounded-full text-[7px] font-semibold flex items-center gap-0.5" style={{ background: sc.bg, color: sc.color }}>
                            <StageIcon size={8} /> {sc.label}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CENTER: Chat Area */}
        <div className={`lg:col-span-5 xl:col-span-6 ${!selectedConv ? 'lg:col-span-8 xl:col-span-9' : ''}`}>
          {selectedConv ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: '500px', maxHeight: 'calc(100vh - 280px)' }}>
              {/* Chat Header */}
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${stageConfig[selectedConv.stage]?.color || CLR.primary}, ${stageConfig[selectedConv.stage]?.color || CLR.primary}88)` }}>
                      {selectedConv.avatar || selectedConv.applicant_name?.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    {selectedConv.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">{selectedConv.applicant_name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">{selectedConv.applicant_role}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className={`text-[9px] font-semibold ${selectedConv.online ? 'text-green-500' : 'text-gray-400'}`}>
                        {selectedConv.online ? 'Online' : 'Offline'}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${stageConfig[selectedConv.stage]?.bg || '#F3F0FF'}`, color: stageConfig[selectedConv.stage]?.color || CLR.primary }}>
                        {stageConfig[selectedConv.stage]?.label || selectedConv.stage}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all" title="Call">
                    <Phone size={14} />
                  </button>
                  <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all" title="Video Call">
                    <Video size={14} />
                  </button>
                  <button onClick={() => setShowScheduleModal(true)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all" title="Schedule Meeting">
                    <CalendarDays size={14} />
                  </button>
                  <button onClick={() => setShowCandidateInfo(!showCandidateInfo)} className={`p-2 rounded-lg transition-all ${showCandidateInfo ? 'bg-[#6D4CFF]/10 text-[#6D4CFF]' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`} title="View Profile">
                    <Eye size={14} />
                  </button>
                  <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all" title="More">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedConv.messages.map((msg: any, i: number) => (
                  <motion.div key={msg.id || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.from === 'recruiter' ? 'justify-end' : 'justify-start'}`}>
                    {msg.from !== 'recruiter' && (
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0 mt-1"
                        style={{ background: `linear-gradient(135deg, ${stageConfig[selectedConv.stage]?.color || CLR.primary}, ${stageConfig[selectedConv.stage]?.color || CLR.primary}88)` }}>
                        {selectedConv.avatar?.[0] || '?'}
                      </div>
                    )}
                    <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[11px] leading-relaxed ${msg.from === 'recruiter'
                      ? 'bg-[#6D4CFF] text-white rounded-tr-sm'
                      : 'bg-gray-50 text-gray-700 rounded-tl-sm border border-gray-100'}`}>
                      {msg.text}
                      <div className={`flex items-center gap-1.5 mt-1.5 ${msg.from === 'recruiter' ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[8px] ${msg.from === 'recruiter' ? 'text-white/60' : 'text-gray-400'}`}>
                          {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.from === 'recruiter' && (
                          <CheckCheck size={10} className={msg.read ? 'text-blue-300' : 'text-white/40'} />
                        )}
                      </div>
                    </div>
                    {msg.from === 'recruiter' && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0 mt-1">
                        {provider.company_name?.[0] || 'P'}
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* AI Quick Responses */}
              <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  {[
                    { label: '🤖 Interview Invite', action: () => { setShowAIAssistant(true); generateAIResponse('interview'); } },
                    { label: '📨 Follow Up', action: () => { setShowAIAssistant(true); generateAIResponse('followup'); } },
                    { label: '🎉 Offer Letter', action: () => { setShowAIAssistant(true); generateAIResponse('offer'); } },
                    { label: '⏰ Reminder', action: () => { setShowAIAssistant(true); generateAIResponse('reminder'); } },
                  ].map((quick, i) => (
                    <button key={i} onClick={quick.action}
                      className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[9px] font-medium text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all flex-shrink-0">
                      {quick.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-gray-100 bg-white">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-all">
                    <Paperclip size={16} />
                  </button>
                  <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-all">
                    <Image size={16} />
                  </button>
                  <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-all">
                    <Mic size={16} />
                  </button>
                  <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF]" />
                  <button onClick={sendMessage} disabled={!input.trim()}
                    className="p-2.5 rounded-xl bg-[#6D4CFF] text-white hover:bg-[#5a3ed9] disabled:opacity-50 transition-all shadow-md shadow-purple-200">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm flex items-center justify-center" style={{ minHeight: '500px' }}>
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={36} className="text-[#6D4CFF]/60" />
                </div>
                <h3 className="text-lg font-bold text-gray-400 mb-1">Select a Conversation</h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Choose a conversation from the left panel to start messaging with candidates.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Candidate Info / AI Assistant */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {showCandidateInfo && selectedConv ? (
              <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-800">Candidate Profile</h3>
                  <button onClick={() => setShowCandidateInfo(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100">
                    <X size={14} />
                  </button>
                </div>
                <div className="p-4 text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-lg font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${stageConfig[selectedConv.stage]?.color || CLR.primary}, ${stageConfig[selectedConv.stage]?.color || CLR.primary}88)` }}>
                    {selectedConv.avatar || selectedConv.applicant_name?.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <h4 className="text-sm font-bold text-gray-800">{selectedConv.applicant_name}</h4>
                  <p className="text-[10px] text-gray-400">{selectedConv.applicant_role}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <span className={`w-2 h-2 rounded-full ${selectedConv.online ? 'bg-green-400' : 'bg-gray-300'}`} />
                    <span className="text-[9px] text-gray-400">{selectedConv.online ? 'Online' : 'Offline'}</span>
                  </div>
                  <div className="flex justify-center gap-2 mt-3">
                    <button className="p-2 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF] hover:bg-[#6D4CFF]/20 transition-all">
                      <Phone size={14} />
                    </button>
                    <button className="p-2 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all">
                      <Mail size={14} />
                    </button>
                    <button className="p-2 rounded-lg bg-green-50 text-green-500 hover:bg-green-100 transition-all">
                      <Video size={14} />
                    </button>
                  </div>
                </div>
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex items-center gap-2 text-[10px] text-gray-500"><Mail size={12} className="text-gray-300" /> {selectedConv.email}</div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500"><Phone size={12} className="text-gray-300" /> {selectedConv.phone}</div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500"><MapPin size={12} className="text-gray-300" /> {selectedConv.location}</div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500"><Briefcase size={12} className="text-gray-300" /> {selectedConv.applicant_role}</div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500"><GraduationCap size={12} className="text-gray-300" /> {selectedConv.education}</div>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedConv.skills?.split(', ').map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-gray-100 text-[8px] font-medium text-gray-600">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">AI Match Score</span>
                      <span className="text-xs font-bold" style={{ color: selectedConv.aiScore >= 90 ? CLR.success : selectedConv.aiScore >= 80 ? CLR.warning : CLR.danger }}>
                        {selectedConv.aiScore}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#22C55E]"
                        style={{ width: `${selectedConv.aiScore || 0}%` }} />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Interview Status</div>
                    <div className="px-2 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-medium">
                      {selectedConv.interviewStatus || 'Not Scheduled'}
                    </div>
                  </div>
                  <button onClick={() => setShowTimeline(true)} className="w-full py-2 rounded-xl border border-gray-200 text-[10px] font-semibold text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-1">
                    <Activity size={12} /> View Communication Timeline
                  </button>
                </div>
              </motion.div>
            ) : showAIAssistant ? (
              <motion.div key="ai" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="bg-gradient-to-br from-[#6D4CFF]/5 via-[#A855F7]/5 to-[#EC4899]/5 rounded-2xl border border-[#6D4CFF]/10 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#6D4CFF]/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center">
                      <Bot size={14} className="text-white" />
                    </div>
                    <h3 className="text-xs font-bold text-gray-800">AI Message Assistant</h3>
                  </div>
                  <button onClick={() => setShowAIAssistant(false)} className="p-1 rounded-lg text-gray-400 hover:bg-white/50">
                    <X size={14} />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {aiResponseSuggestions.map((s, i) => {
                      const AIcon = s.icon;
                      return (
                        <button key={i} onClick={() => generateAIResponse(s.type)}
                          className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/60 hover:bg-white border border-gray-200/80 hover:border-gray-300 transition-all hover:-translate-y-0.5">
                          <div className="p-1.5 rounded-lg" style={{ background: `${s.color}12`, color: s.color }}>
                            <AIcon size={13} />
                          </div>
                          <span className="text-[8px] font-semibold text-gray-500 text-center leading-tight">{s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {aiResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-white border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Generated Message</span>
                        <button onClick={() => navigator.clipboard.writeText(aiResult)} className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                          <Copy size={12} />
                        </button>
                      </div>
                      <pre className="text-[10px] text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">{aiResult}</pre>
                      <button onClick={() => { if (selectedConv) { const newMsg = { id: `m${Date.now()}`, text: aiResult, from: 'recruiter', time: new Date().toISOString(), read: true }; setSelectedConv({ ...selectedConv, messages: [...selectedConv.messages, newMsg] }); setConversations(prev => prev.map(c => c.id === selectedConv.id ? { ...c, messages: [...c.messages, newMsg] } : c)); setAiResult(''); } }}
                        className="w-full mt-2 py-1.5 rounded-lg bg-[#6D4CFF] text-white text-[9px] font-semibold hover:bg-[#5a3ed9] transition-all flex items-center justify-center gap-1">
                        <Send size={11} /> Send to Candidate
                      </button>
                    </motion.div>
                  )}
                  {!aiResult && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-gray-500">Try suggesting:</p>
                      {[
                        { icon: Target, text: 'Send interview reminder to candidate', color: CLR.warning },
                        { icon: Zap, text: 'Follow up after assessment submission', color: CLR.info },
                        { icon: Star, text: 'Generate personalized offer message', color: CLR.success },
                        { icon: Sparkles, text: 'Recommend next communication step', color: CLR.purple },
                      ].map((sug, i) => {
                        const SugIcon = sug.icon;
                        return (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/50 hover:bg-white transition-colors cursor-pointer">
                            <div className="p-1 rounded" style={{ background: `${sug.color}12`, color: sug.color }}>
                              <SugIcon size={11} />
                            </div>
                            <span className="text-[10px] text-gray-600">{sug.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== COMMUNICATION ANALYTICS ===== */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-gray-100/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">Communication Analytics</h3>
          <button onClick={() => setShowAnalytics(true)} className="text-[10px] font-semibold text-[#6D4CFF] hover:underline flex items-center gap-1">
            <BarChart3 size={12} /> View Details
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Messages Sent</h4>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                <Bar dataKey="sent" fill={CLR.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="received" fill={CLR.teal} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Response Rate</h4>
            <ResponsiveContainer width="100%" height={160}>
              <ReLineChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} domain={[80, 100]} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                <Line type="monotone" dataKey="response" stroke={CLR.success} strokeWidth={2} dot={{ r: 3 }} />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">By Conversation Stage</h4>
            <div className="space-y-2">
              {[
                { label: 'Shortlisted', value: 12, color: CLR.purple },
                { label: 'Interview', value: 8, color: CLR.warning },
                { label: 'Hired', value: 16, color: CLR.success },
                { label: 'Archived', value: 4, color: CLR.danger },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-[9px] mb-0.5">
                    <span className="font-medium text-gray-500">{item.label}</span>
                    <span className="font-bold text-gray-700">{item.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(item.value / 16) * 100}%` }}
                      className="h-full rounded-full" style={{ background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Stats</h4>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">Avg Response Time</span>
                  <span className="text-xs font-bold text-gray-800">15 min</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp size={10} className="text-green-500" />
                  <span className="text-[8px] text-green-600 font-medium">25% faster this month</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">Interview Conversion</span>
                  <span className="text-xs font-bold text-gray-800">68%</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp size={10} className="text-green-500" />
                  <span className="text-[8px] text-green-600 font-medium">+8% this month</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">Total Messages</span>
                  <span className="text-xs font-bold text-gray-800">357</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Activity size={10} className="text-blue-500" />
                  <span className="text-[8px] text-blue-600 font-medium">This quarter</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
