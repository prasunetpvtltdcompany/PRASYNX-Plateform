'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, ChevronLeft, ChevronRight,
  Download, Clock, CheckCircle2, AlertCircle, Award, Star,
  TrendingUp, FileText, Brain, Lightbulb, CalendarDays, X, Mic,
  Target, Timer, ChevronDown, Calendar, MapPin, Users, Trophy,
  Zap, Gift, BookOpen, Flag, Camera, Medal, Flame, Heart,
  User, ArrowRight, Link, ExternalLink, MessageSquare, Send,
  Paperclip, Smile, Reply, Pin, MoreHorizontal, Phone,
  Video, Image, FolderOpen, Bell, Settings, HelpCircle,
  Globe, BookMarked, Palette, Share2, ThumbsUp, Eye,
  Headphones, Volume2, VolumeX, Edit3, RefreshCw,
  UserCheck, UserPlus, Mail, Inbox, Archive, Trash2,
  PhoneCall, Clock12, BadgeCheck,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';
import { messageApi } from '../../lib/dataService';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };
const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

function CounterAnimation({ value, suffix = '', duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const inc = value / (duration * 60);
    const interval = setInterval(() => {
      start += inc;
      if (start >= value) { setCount(value); clearInterval(interval); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(interval);
  }, [value, duration]);
  return <span>{count}{suffix}</span>;
}

const demoConversations: any[] = [];

const demoGroups: any[] = [];

const demoAnnouncements: any[] = [];

const demoTeachers: any[] = [];

const demoFiles: any[] = [];

const demoMeetings: any[] = [];

const supportCenters = [
  { name: 'Academic Help', icon: BookOpen, color: COLORS.primary, desc: 'Course & curriculum support' },
  { name: 'IT Support', icon: HelpCircle, color: COLORS.info, desc: 'Technical issue resolution' },
  { name: 'Library Support', icon: BookMarked, color: COLORS.success, desc: 'Research & resource help' },
  { name: 'Finance Support', icon: Mail, color: COLORS.warning, desc: 'Fee & scholarship queries' },
  { name: 'Examination Cell', icon: FileText, color: COLORS.danger, desc: 'Exam-related inquiries' },
  { name: 'Student Welfare', icon: Heart, color: '#EC4899', desc: 'Personal & emotional support' },
];

const aiQuickReplies = [
  { label: 'Professional Reply', prompt: 'Write a professional reply' },
  { label: 'Short Reply', prompt: 'Write a brief response' },
  { label: 'Formal Email', prompt: 'Convert to formal email' },
  { label: 'Translate', prompt: 'Translate this message' },
  { label: 'Summarize', prompt: 'Summarize the conversation' },
];

const quickActions = [
  { label: 'New Message', icon: MessageSquare, color: COLORS.primary },
  { label: 'Schedule Meeting', icon: Calendar, color: COLORS.success },
  { label: 'Share File', icon: FolderOpen, color: COLORS.info },
  { label: 'View Announcements', icon: Bell, color: COLORS.warning },
  { label: 'Contact Teacher', icon: User, color: COLORS.danger },
  { label: 'Ask Prerana AI', icon: Brain, color: '#8B5CF6' },
];

interface MessagesDashboardProps {
  messagesHook: any;
  messagesData: any[];
  teachersHook: any;
  teachersData: any[];
  announcementsHook: any;
  announcementsData: any[];
  session: any;
}

export function MessagesDashboard({ messagesHook, messagesData, teachersHook, teachersData, announcementsHook, announcementsData, session }: MessagesDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [sidebarView, setSidebarView] = useState<'conversations' | 'groups'>('conversations');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filters = ['All', 'Teachers', 'Departments', 'Announcements', 'Class Groups', 'Support', 'Unread', 'Important'];

  useEffect(() => {
    if (messagesData && Array.isArray(messagesData) && messagesData.length > 0) {
      setConversations(messagesData.map((c: any) => ({
        id: c.teacher_id || c.id,
        name: c.teacher_name || c.name || 'Teacher',
        subject: c.subject || '',
        avatar: (c.teacher_name || 'T').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        lastMsg: c.last_message || '',
        unread: c.unread_count || 0,
        online: c.online || false,
        teacher_id: c.teacher_id,
        time: c.last_message_time || '',
        status: c.online ? 'online' : 'offline',
      })));
    } else {
      setConversations(demoConversations);
    }
  }, [messagesData]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const loadMessages = async (contactId: string, teacherId: string) => {
    try {
      const res = await messageApi.getMessages(teacherId);
      const msgs = res.success && res.data ? (Array.isArray(res.data) ? res.data : []) : [];
      setChatMessages(msgs.length > 0 ? msgs.map((m: any) => ({
        id: m.id,
        sender: m.sender_id === session?.user?.id ? 'me' : 'them',
        text: m.message || m.content || '',
        time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      })) : [
        { id: 'd1', sender: 'them', text: 'Hello! How can I help you today?', time: '9:00 AM' },
        { id: 'd2', sender: 'them', text: 'Please let me know if you have any questions about the coursework.', time: '9:01 AM' },
      ]);
    } catch {
      setChatMessages([
        { id: 'd1', sender: 'them', text: 'Hello! How can I help you today?', time: '9:00 AM' },
        { id: 'd2', sender: 'them', text: 'Please let me know if you have any questions about the coursework.', time: '9:01 AM' },
      ]);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedContact) return;
    const tempId = Date.now();
    const newMsg = { id: tempId, sender: 'me' as const, text: messageText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, newMsg]);
    setMessageText('');
    try {
      await messageApi.send({
        student_id: session?.student?.id,
        teacher_id: selectedContact.teacher_id,
        message: messageText,
      });
    } catch {}
  };

  const effectiveTeachers = useMemo(() => {
    if (Array.isArray(teachersData) && teachersData.length > 0) return teachersData;
    return demoTeachers;
  }, [teachersData]);

  const effectiveAnnouncements = useMemo(() => {
    if (Array.isArray(announcementsData) && announcementsData.length > 0) return announcementsData;
    return demoAnnouncements;
  }, [announcementsData]);

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c: any) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.subject || '').toLowerCase().includes(q) ||
        (c.lastMsg || '').toLowerCase().includes(q)
      );
    }
    if (activeFilter === 'Unread') list = list.filter((c: any) => c.unread > 0);
    if (activeFilter === 'Teachers') list = list.filter((c: any) => !c.isOfficial);
    if (activeFilter === 'Departments' || activeFilter === 'Support') list = list.filter((c: any) => c.isOfficial);
    return list;
  }, [conversations, searchQuery, activeFilter]);

  const totalUnread = useMemo(() => conversations.reduce((sum: number, c: any) => sum + (c.unread || 0), 0), [conversations]);

  const analytics = useMemo(() => {
    const sent = chatMessages.filter(m => m.sender === 'me').length;
    const received = chatMessages.filter(m => m.sender === 'them').length;
    return { sent, received };
  }, [chatMessages]);

  const activityData = [
    { day: 'Mon', messages: 12 },
    { day: 'Tue', messages: 18 },
    { day: 'Wed', messages: 8 },
    { day: 'Thu', messages: 22 },
    { day: 'Fri', messages: 15 },
    { day: 'Sat', messages: 6 },
    { day: 'Sun', messages: 3 },
  ];

  const weeklyActivity = [
    { week: 'W1', messages: 45 },
    { week: 'W2', messages: 62 },
    { week: 'W3', messages: 38 },
    { week: 'W4', messages: 71 },
  ];

  const SectionCard = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
    <Card className={`p-5 ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );

  const selectContact = (c: any) => {
    setSelectedContact(c);
    loadMessages(c.id, c.teacher_id);
    setConversations(prev => prev.map(p => p.id === c.id ? { ...p, unread: 0 } : p));
  };

  if (messagesHook?.loading) {
    return (
      <div className="space-y-6">
        <div className="page-header"><h1>Messages & Communication Hub</h1><p>Loading your conversations...</p></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-gray-100 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
              <div className="h-7 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 rounded-2xl bg-white border border-gray-100 p-5 animate-pulse h-[500px]" />
          <div className="lg:col-span-6 rounded-2xl bg-white border border-gray-100 p-5 animate-pulse h-[500px]" />
          <div className="lg:col-span-3 rounded-2xl bg-white border border-gray-100 p-5 animate-pulse h-[500px]" />
        </div>
      </div>
    );
  }

  if (messagesHook?.error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load messages</h2>
        <p className="text-gray-500 mb-6">{messagesHook.error}</p>
        <div className="flex gap-3">
          <button onClick={messagesHook.refetch} className="px-6 py-2.5 bg-[#6D4CFF] text-white rounded-xl font-medium hover:bg-[#5A3FD6] transition-colors">Refresh Data</button>
          <button className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">Contact Support</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Messages & Communication Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Connect with teachers, mentors, departments, and classmates in one centralized communication platform.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="px-4 py-2 text-xs font-medium text-[#6D4CFF] bg-[#F3F0FF] rounded-xl hover:bg-[#EBE6FF] transition-all flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notification Settings
          </button>
          <button className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] rounded-xl shadow-[0_4px_14px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_20px_rgba(109,76,255,0.4)] transition-all flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> New Message
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-[#F3F0FF] to-white border-[#6D4CFF]/10">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#6D4CFF]/10"><MessageSquare size={20} style={{ color: COLORS.primary }} /></div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900"><CounterAnimation value={conversations.length} /></div>
          <div className="text-xs text-gray-500 font-medium">Total Conversations</div>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-[#FFF0F0] to-white border-red-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50"><Inbox size={20} style={{ color: COLORS.danger }} /></div>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900"><CounterAnimation value={totalUnread} /></div>
          <div className="text-xs text-gray-500 font-medium">Unread Messages</div>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-[#F0FDF4] to-white border-green-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50"><UserCheck size={20} style={{ color: COLORS.success }} /></div>
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900"><CounterAnimation value={effectiveTeachers.length} /></div>
          <div className="text-xs text-gray-500 font-medium">Active Teachers</div>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-[#FFFBEB] to-white border-yellow-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-50"><Bell size={20} style={{ color: COLORS.warning }} /></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{effectiveAnnouncements.length < 10 ? `0${effectiveAnnouncements.length}` : effectiveAnnouncements.length}</div>
          <div className="text-xs text-gray-500 font-medium">Announcements</div>
        </Card>
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search messages, teachers, departments, announcements..."
            className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:border-[#6D4CFF] transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><Mic size={14} /></button>
            <button className="p-1.5 rounded-lg hover:bg-[#F3F0FF] text-[#6D4CFF]/60 hover:text-[#6D4CFF]"><Sparkles size={14} /></button>
            {searchQuery && <button onClick={() => setSearchQuery('')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={14} /></button>}
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                activeFilter === f ? 'bg-[#6D4CFF] text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >{f}</button>
          ))}
        </div>
      </motion.div>

      {/* Main Layout: 25% | 50% | 25% */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT PANEL — Conversations */}
        <div className="lg:col-span-3 space-y-4">

          {/* Sidebar Toggle */}
          <div className="flex gap-1.5 p-1 rounded-xl bg-gray-50 border border-gray-100">
            {[
              { key: 'conversations' as const, label: 'Chats', icon: MessageSquare },
              { key: 'groups' as const, label: 'Groups', icon: Users },
            ].map((v) => {
              const Icon = v.icon;
              return (
                <button key={v.key} onClick={() => setSidebarView(v.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-semibold transition-all ${
                    sidebarView === v.key ? 'bg-white text-[#6D4CFF] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                ><Icon size={12} />{v.label}</button>
              );
            })}
          </div>

          {sidebarView === 'conversations' && (
            <Card className="p-0 overflow-hidden">
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-700">Conversations</span>
                <Badge variant="default" className="text-[9px]">{filteredConversations.length}</Badge>
              </div>
              <div className="max-h-[580px] overflow-y-auto">
                {filteredConversations.length > 0 ? filteredConversations.map((c, i) => (
                  <button key={c.id} onClick={() => selectContact(c)}
                    className={`w-full text-left p-3 transition-all hover:bg-gray-50 border-b border-gray-50 last:border-0 ${
                      selectedContact?.id === c.id ? 'bg-[#F3F0FF] border-l-2 border-l-[#6D4CFF]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-10 h-10">
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6D4CFF] to-[#8B6FFF] text-white text-[11px] font-bold rounded-full">{c.avatar}</div>
                        </Avatar>
                        {c.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[11px] font-semibold text-gray-900 truncate">{c.name}</span>
                            {c.isOfficial && <BadgeCheck size={10} className="text-[#6D4CFF] flex-shrink-0" />}
                          </div>
                          <span className="text-[9px] text-gray-400 flex-shrink-0">{c.time}</span>
                        </div>
                        <div className="text-[9px] text-gray-400 truncate">{c.subject}</div>
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <span className="text-[10px] text-gray-500 truncate">{c.lastMsg}</span>
                          {c.unread > 0 && (
                            <span className="w-4 h-4 rounded-full bg-[#6D4CFF] text-white text-[8px] font-bold flex items-center justify-center flex-shrink-0">{c.unread}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )) : (
                  <div className="flex flex-col items-center py-10 px-4">
                    <MessageSquare className="w-10 h-10 text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400 mb-3">No conversations yet</p>
                    <button className="px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-[10px] font-semibold hover:bg-[#5A3FD6] transition-all">Start New Conversation</button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {sidebarView === 'groups' && (
            <Card className="p-0 overflow-hidden">
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-700">Class Groups</span>
                <Badge variant="default" className="text-[9px]">{demoGroups.length}</Badge>
              </div>
              <div className="max-h-[580px] overflow-y-auto">
                {demoGroups.map((g, i) => (
                  <div key={g.id} className="p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold ${
                        g.activity === 'High' ? 'bg-green-500' : g.activity === 'Medium' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}>
{g.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-gray-900 truncate">{g.name}</span>
                          {g.active && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-gray-400 mt-0.5">
                          <Users size={10} /><span>{g.members} members</span>
                          {g.unread > 0 && <><span>•</span><span className="text-[#6D4CFF] font-medium">{g.unread} new</span></>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Class Groups Summary */}
          {sidebarView === 'conversations' && (
            <SectionCard title="Class Groups" subtitle={`${demoGroups.length} active groups`}>
              <div className="space-y-2">
                {demoGroups.slice(0, 4).map((g) => (
                  <div key={g.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px] font-bold ${
                      g.activity === 'High' ? 'bg-green-500' : g.activity === 'Medium' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}>
                      {g.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-semibold text-gray-800 truncate">{g.name}</div>
                      <div className="text-[8px] text-gray-400">{g.members} members</div>
                    </div>
                    {g.unread > 0 && <span className="w-4 h-4 rounded-full bg-[#6D4CFF] text-white text-[7px] font-bold flex items-center justify-center">{g.unread}</span>}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* CENTER PANEL — Chat */}
        <div className="lg:col-span-6">
          <Card className="p-0 overflow-hidden flex flex-col h-[700px]">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6D4CFF] to-[#8B6FFF] text-white text-xs font-bold rounded-full">{selectedContact.avatar}</div>
                      </Avatar>
                      {selectedContact.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{selectedContact.name}</span>
                        {selectedContact.isOfficial && <BadgeCheck size={12} className="text-[#6D4CFF]" />}
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-gray-400">{selectedContact.subject}</span>
                        {selectedContact.online ? (
                          <span className="text-green-500 font-medium">● Online</span>
                        ) : (
                          <span className="text-gray-400">Offline</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><Phone size={14} /></button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><Video size={14} /></button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><MoreHorizontal size={14} /></button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFBFC]">
                  {chatMessages.length > 0 ? chatMessages.map((m: any, i: number) => {
                    const isMe = m.sender === 'me';
                    return (
                      <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] group`}>
                          <div className={`p-3 rounded-2xl text-xs ${
                            isMe
                              ? 'bg-gradient-to-r from-[#6D4CFF] to-[#8B6FFF] text-white rounded-br-md'
                              : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-md'
                          }`}>
                            <p className="leading-relaxed">{m.text}</p>
                            <div className={`flex items-center justify-end gap-2 mt-1 ${isMe ? '' : ''}`}>
                              <span className={`text-[9px] ${isMe ? 'text-white/60' : 'text-gray-400'}`}>{m.time}</span>
                              {isMe && <Eye size={10} className="text-white/60" />}
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <button className="p-0.5 rounded hover:bg-gray-100 text-gray-400"><Smile size={10} /></button>
                            <button className="p-0.5 rounded hover:bg-gray-100 text-gray-400"><Reply size={10} /></button>
                            <button className="p-0.5 rounded hover:bg-gray-100 text-gray-400"><Pin size={10} /></button>
                            <button className="p-0.5 rounded hover:bg-gray-100 text-gray-400"><MoreHorizontal size={10} /></button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  }) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <MessageSquare className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="text-sm">Start a conversation</p>
                      <p className="text-xs mt-1">Send a message to begin chatting</p>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* AI Message Assistant */}
                <AnimatePresence>
                  {showAI && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-100 bg-[#F3F0FF]/50 px-4 py-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Brain size={14} className="text-[#6D4CFF]" />
                          <span className="text-[11px] font-semibold text-[#6D4CFF]">Prerana AI Assistant</span>
                        </div>
                        <button onClick={() => setShowAI(false)} className="text-gray-400 hover:text-gray-600"><X size={12} /></button>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {aiQuickReplies.map((a, i) => (
                          <button key={i} className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[9px] font-medium text-gray-600 hover:border-[#6D4CFF]/30 hover:text-[#6D4CFF] transition-all">
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowAI(!showAI)} className={`p-2 rounded-lg transition-all ${showAI ? 'bg-[#F3F0FF] text-[#6D4CFF]' : 'text-gray-400 hover:bg-gray-100'}`}>
                      <Sparkles size={16} />
                    </button>
                    <button onClick={() => setShowFiles(!showFiles)} className={`p-2 rounded-lg transition-all ${showFiles ? 'bg-[#F3F0FF] text-[#6D4CFF]' : 'text-gray-400 hover:bg-gray-100'}`}>
                      <Paperclip size={16} />
                    </button>
                    <input type="text" value={messageText} onChange={e => setMessageText(e.target.value)} placeholder="Type your message..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs outline-none focus:border-[#6D4CFF] focus:bg-white transition-all"
                      onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    />
                    <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><Smile size={16} /></button>
                    <button onClick={sendMessage} className="p-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B6FFF] text-white hover:shadow-lg transition-all active:scale-95">
                      <Send size={16} />
                    </button>
                  </div>

                  {/* File Attachments */}
                  <AnimatePresence>
                    {showFiles && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2 mt-3 pt-3 border-t border-gray-100"
                      >
                        {[
                          { label: 'Document', icon: FileText, color: '#6D4CFF' },
                          { label: 'Image', icon: Image, color: '#22C55E' },
                          { label: 'PDF', icon: FileText, color: '#EF4444' },
                          { label: 'Voice', icon: Mic, color: '#F59E0B' },
                        ].map((f, i) => {
                          const Icon = f.icon;
                          return (
                            <button key={i} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-all">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${f.color}12`, color: f.color }}><Icon size={14} /></div>
                              <span className="text-[8px] text-gray-500">{f.label}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <div className="w-20 h-20 rounded-2xl bg-[#F3F0FF] flex items-center justify-center mb-4">
                  <MessageSquare size={36} className="text-[#6D4CFF]" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Select a Conversation</h3>
                <p className="text-xs text-gray-400 mb-6">Choose a teacher or group to start messaging</p>
                <div className="flex gap-3">
                  <button className="px-5 py-2.5 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5A3FD6] transition-all flex items-center gap-2">
                    <MessageSquare size={14} /> New Conversation
                  </button>
                  <button className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all flex items-center gap-2">
                    <Users size={14} /> Browse Teachers
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT PANEL — Insights */}
        <div className="lg:col-span-3 space-y-4">

          {/* Conversation Insights */}
          {selectedContact && (
            <SectionCard title="Conversation Insights" subtitle="Contact information and stats">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <Avatar className="w-12 h-12">
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6D4CFF] to-[#8B6FFF] text-white text-sm font-bold rounded-full">{selectedContact.avatar}</div>
                  </Avatar>
                  <div>
                    <div className="text-xs font-bold text-gray-900">{selectedContact.name}</div>
                    <div className="text-[9px] text-gray-400">{selectedContact.subject}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${selectedContact.online ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-[9px] text-gray-500">{selectedContact.online ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Messages', value: chatMessages.length },
                    { label: 'Response Time', value: '~15 min' },
                    { label: 'Office Hours', value: 'Mon-Fri' },
                    { label: 'Meetings', value: 'Schedule' },
                  ].map((s, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-center">
                      <div className="text-xs font-bold text-gray-900">{s.value}</div>
                      <div className="text-[8px] text-gray-400">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-xl bg-[#6D4CFF] text-white text-[9px] font-semibold hover:bg-[#5A3FD6] transition-all flex items-center justify-center gap-1">
                    <Calendar size={10} /> Schedule Meeting
                  </button>
                  <button className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-600 text-[9px] font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-1">
                    <Phone size={10} /> Call
                  </button>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Today's Communication Insights */}
          <SectionCard title="Today's Insights" subtitle="Quick overview of your communication">
            <div className="space-y-2.5">
              {[
                { label: 'Unread Messages', value: totalUnread, icon: Inbox, color: COLORS.danger },
                { label: 'Pending Responses', value: Math.max(0, totalUnread - 3), icon: Clock, color: COLORS.warning },
                { label: 'Important Announcements', value: effectiveAnnouncements.filter((a: any) => a.priority === 'High').length, icon: Bell, color: COLORS.primary },
                { label: 'Upcoming Meetings', value: demoMeetings.length, icon: Calendar, color: COLORS.success },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12`, color: s.color }}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-semibold text-gray-900">{s.label}</div>
                      <div className="text-[18px] font-extrabold" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Academic Announcements */}
          <SectionCard title="Announcements" subtitle={`${effectiveAnnouncements.length} latest notices`}>
            <div className="space-y-2 max-h-[240px] overflow-y-auto">
              {effectiveAnnouncements.slice(0, 4).map((a: any, i: number) => (
                <div key={a.id || i} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                      a.priority === 'High' ? 'bg-red-500' : a.priority === 'Medium' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-gray-900 truncate">{a.title}</span>
                        <Badge variant={a.priority === 'High' ? 'danger' : a.priority === 'Medium' ? 'warning' : 'default'} className="text-[7px]">{a.priority}</Badge>
                      </div>
                      <div className="text-[8px] text-gray-400 mt-0.5">
                        {a.department} • {a.date ? new Date(a.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : ''}
                      </div>
                      <button className="text-[8px] text-[#6D4CFF] font-medium mt-1 hover:underline">View Details →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Meetings & Appointments */}
          <SectionCard title="Meetings & Appointments" subtitle={`${demoMeetings.length} upcoming`}>
            <div className="space-y-2">
              {demoMeetings.map((m, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#F3F0FF] text-[#6D4CFF] flex-shrink-0">
                      <Calendar size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-semibold text-gray-900">{m.title}</div>
                      <div className="text-[8px] text-gray-400">{m.with} • {new Date(m.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })} {m.time}</div>
                      <div className="flex gap-1.5 mt-1">
                        <button className="px-2 py-0.5 rounded-md bg-[#6D4CFF] text-white text-[7px] font-medium">Join</button>
                        <button className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-600 text-[7px] font-medium">Reschedule</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Quick Actions */}
          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((a, i) => {
                const Icon = a.icon;
                return (
                  <button key={i} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 hover:shadow-sm transition-all active:scale-95"
                    style={{ background: `${a.color}08` }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${a.color}15`, color: a.color }}>
                      <Icon size={12} />
                    </div>
                    <span className="text-[8px] font-semibold text-gray-700">{a.label}</span>
                  </button>
                );
              })}
            </div>
          </SectionCard>

        </div>
      </div>

      {/* Second Row: File Sharing + Teacher Directory + Support Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* File Sharing Hub */}
        <SectionCard title="File Sharing Hub" subtitle="Recently shared documents">
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {demoFiles.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all cursor-pointer">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    f.type === 'PDF' ? 'bg-red-50 text-red-500' : f.type === 'Image' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'
                  }`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-gray-900 truncate">{f.name}</div>
                    <div className="text-[8px] text-gray-400">{f.size} • {f.date} • From: {f.from}</div>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-[#6D4CFF] flex-shrink-0"><Download size={12} /></button>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Teacher Directory */}
        <SectionCard title="Teacher Directory" subtitle={`${effectiveTeachers.length} teachers available`}>
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {effectiveTeachers.slice(0, 5).map((t: any, i: number) => (
              <div key={t.id || i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-all">
                <Avatar className="w-9 h-9">
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6D4CFF] to-[#8B6FFF] text-white text-[10px] font-bold rounded-full">{t.image || t.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</div>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-gray-900 truncate">{t.name}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      t.status === 'available' ? 'bg-green-500' : t.status === 'busy' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                  </div>
                  <div className="text-[8px] text-gray-400">{t.department} • {t.designation}</div>
                </div>
                <button className="px-2.5 py-1 rounded-lg bg-[#6D4CFF] text-white text-[8px] font-semibold hover:bg-[#5A3FD6] transition-all flex-shrink-0">Contact</button>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Academic Support Center */}
        <SectionCard title="Academic Support Center" subtitle="Quick access to help desks">
          <div className="grid grid-cols-2 gap-2">
            {supportCenters.map((s, i) => {
              const Icon = s.icon;
              return (
                <button key={i} className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 hover:shadow-sm transition-all active:scale-95"
                  style={{ background: `${s.color}06` }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12`, color: s.color }}>
                    <Icon size={14} />
                  </div>
                  <div className="text-left">
                    <div className="text-[9px] font-semibold text-gray-900">{s.name}</div>
                    <div className="text-[7px] text-gray-400">{s.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Message Analytics */}
      <SectionCard title="Message Analytics" subtitle="Your messaging activity and patterns">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {[
              { label: 'Messages Sent', value: analytics.sent, icon: Send, color: COLORS.primary },
              { label: 'Messages Received', value: analytics.received, icon: Inbox, color: COLORS.success },
              { label: 'Avg Response Time', value: '~12 min', icon: Clock, color: COLORS.warning },
              { label: 'Active Conversations', value: conversations.filter((c: any) => c.unread > 0).length, icon: MessageSquare, color: COLORS.info },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12`, color: s.color }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-gray-900">{s.value}</div>
                    <div className="text-[9px] text-gray-400">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="lg:col-span-3">
            <div className="text-[11px] font-semibold text-gray-600 mb-3">Daily Activity (This Week)</div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 11 }} />
                <Bar dataKey="messages" fill="#6D4CFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-[11px] font-semibold text-gray-600 mb-3 mt-4">Weekly Activity</div>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="weeklyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6D4CFF" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#6D4CFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="messages" stroke="#6D4CFF" strokeWidth={2} fill="url(#weeklyGrad)" dot={{ r: 3, fill: '#6D4CFF' }} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 11 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </SectionCard>

    </motion.div>
  );
}
