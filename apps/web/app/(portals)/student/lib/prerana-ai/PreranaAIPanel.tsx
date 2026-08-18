'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, MessageSquare, Phone, CalendarDays, List, Clock,
  Send, Mic, MicOff, Globe, Loader2, ChevronDown, Bot, User,
  GraduationCap, Users, Heart, Shield, BarChart3, Brain,
  BookOpen, HelpCircle, FileText, Bell, CheckCircle, AlertCircle,
  TrendingUp, Award, Settings, ChevronRight, Paperclip, Sun, Moon,
  History, Target, Zap, Smile, Volume2, DollarSign, Bus, Home,
  ClipboardList, Edit3, BookMarked, PieChart, LineChart,
} from 'lucide-react';
import { usePreranaAIStore } from './store';

type Tab = 'chat' | 'voice' | 'tasks' | 'history';

const VOICE_API = process.env.NEXT_PUBLIC_VOICE_API_URL || 'http://localhost:4007/api/voice';

const roles = [
  { key: 'parent', label: 'Parent', icon: Users, color: '#22C55E', bg: '#22C55E15' },
  { key: 'student', label: 'Student', icon: GraduationCap, color: '#3B82F6', bg: '#3B82F615' },
  { key: 'teacher', label: 'Teacher', icon: Heart, color: '#A855F7', bg: '#A855F715' },
  { key: 'admin', label: 'Admin', icon: Shield, color: '#6D4CFF', bg: '#6D4CFF15' },
  { key: 'management', label: 'Management', icon: BarChart3, color: '#F59E0B', bg: '#F59E0B15' },
  { key: 'staff', label: 'Staff', icon: Users, color: '#06B6D4', bg: '#06B6D415' },
];

const languages = [
  { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' }, { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' }, { code: 'bn', label: 'বাংলা' },
  { code: 'gu', label: 'ગુજરાતી' }, { code: 'pa', label: 'ਪੰਜਾਬੀ' },
];

const roleSuggestions: Record<string, string[]> = {
  parent: ['Child Attendance', 'Fee Status', 'Homework', 'Book PTM', 'Exam Results', 'Transport Tracking'],
  student: ['AI Tutor', 'Timetable', 'Homework Help', 'Exam Schedule', 'Doubt Solving', 'Generate Notes'],
  teacher: ['Mark Attendance', 'Create Assignment', 'Lesson Plan', 'Class Analytics', 'Report Cards', 'Schedule PTM'],
  admin: ['Generate Reports', 'Manage Students', 'Fee Analytics', 'Attendance Overview', 'Transport Reports', 'Staff Management'],
  management: ['Revenue Forecast', 'Admission Trends', 'Growth Dashboard', 'AI Predictions', 'Executive Summary', 'Strategic Reports'],
  staff: ['Apply Leave', 'View Schedule', 'Salary Info', 'My Tasks', 'Notices', 'View Profile'],
};

function useScrollHide(drawerRef: any) {
  return { drawerRef };
}

interface TaskItem {
  icon: any;
  label: string;
  desc: string;
  color: string;
  action: () => void;
}

function getRoleTasks(role: string, setActiveTab: (tab: Tab) => void, handleSend: (msg: string) => void): TaskItem[] {
  const tasks: Record<string, TaskItem[]> = {
    parent: [
      { icon: Users, label: 'View Child Performance', desc: 'Attendance, grades & progress', color: '#6D4CFF', action: () => { setActiveTab('chat'); handleSend('Show child performance'); } },
      { icon: CalendarDays, label: 'Book PTM', desc: 'Schedule parent-teacher meeting', color: '#22C55E', action: () => { setActiveTab('chat'); handleSend('Book PTM'); } },
      { icon: DollarSign, label: 'Pay Fees', desc: 'Check and pay school fees', color: '#F59E0B', action: () => { setActiveTab('chat'); handleSend('Fee status'); } },
      { icon: Bus, label: 'Track School Bus', desc: 'Live bus tracking & route info', color: '#3B82F6', action: () => { setActiveTab('chat'); handleSend('Track school bus'); } },
      { icon: FileText, label: 'Download Report Card', desc: 'Get progress report', color: '#A855F7', action: () => { setActiveTab('chat'); handleSend('Download report card'); } },
      { icon: HelpCircle, label: 'Teacher Feedback', desc: 'View teacher remarks', color: '#EC4899', action: () => { setActiveTab('chat'); handleSend('Teacher feedback'); } },
    ],
    student: [
      { icon: Brain, label: 'Start AI Tutor', desc: 'Interactive study assistance', color: '#6D4CFF', action: () => { setActiveTab('chat'); handleSend('Start AI Tutor'); } },
      { icon: BookMarked, label: 'Generate Notes', desc: 'Create study notes from topics', color: '#22C55E', action: () => { setActiveTab('chat'); handleSend('Generate notes'); } },
      { icon: Edit3, label: 'Create Quiz', desc: 'Practice with AI-generated quiz', color: '#F59E0B', action: () => { setActiveTab('chat'); handleSend('Create a quiz'); } },
      { icon: CalendarDays, label: 'View Timetable', desc: 'Check today schedule', color: '#3B82F6', action: () => { setActiveTab('chat'); handleSend('My timetable'); } },
      { icon: ClipboardList, label: 'Check Assignments', desc: 'View pending homework', color: '#A855F7', action: () => { setActiveTab('chat'); handleSend('My homework'); } },
      { icon: HelpCircle, label: 'Doubt Solving', desc: 'Ask academic questions', color: '#EC4899', action: () => { setActiveTab('chat'); handleSend('I have a doubt'); } },
    ],
    teacher: [
      { icon: ClipboardList, label: 'Mark Attendance', desc: 'Take class attendance', color: '#6D4CFF', action: () => { setActiveTab('chat'); handleSend('Mark attendance'); } },
      { icon: Edit3, label: 'Create Assignment', desc: 'Create new class assignment', color: '#22C55E', action: () => { setActiveTab('chat'); handleSend('Create assignment'); } },
      { icon: FileText, label: 'Generate Question Paper', desc: 'Create exam question paper', color: '#F59E0B', action: () => { setActiveTab('chat'); handleSend('Generate question paper'); } },
      { icon: BarChart3, label: 'Analyze Performance', desc: 'Class performance analytics', color: '#3B82F6', action: () => { setActiveTab('chat'); handleSend('Class performance'); } },
      { icon: CalendarDays, label: 'Schedule PTM', desc: 'Plan parent meetings', color: '#A855F7', action: () => { setActiveTab('chat'); handleSend('Schedule PTM'); } },
      { icon: BookMarked, label: 'Lesson Plan', desc: 'Create teaching plan', color: '#EC4899', action: () => { setActiveTab('chat'); handleSend('Create lesson plan'); } },
    ],
    admin: [
      { icon: FileText, label: 'Generate Reports', desc: 'School-wide admin reports', color: '#6D4CFF', action: () => { setActiveTab('chat'); handleSend('Generate reports'); } },
      { icon: Users, label: 'Manage Students', desc: 'Student records & enrollment', color: '#22C55E', action: () => { setActiveTab('chat'); handleSend('Student management'); } },
      { icon: Shield, label: 'Manage Staff', desc: 'Staff records & assignments', color: '#3B82F6', action: () => { setActiveTab('chat'); handleSend('Staff management'); } },
      { icon: DollarSign, label: 'Fee Analytics', desc: 'Fee collection & pending', color: '#F59E0B', action: () => { setActiveTab('chat'); handleSend('Fee collection report'); } },
      { icon: Bus, label: 'Transport Reports', desc: 'Bus routes & driver details', color: '#A855F7', action: () => { setActiveTab('chat'); handleSend('Transport report'); } },
      { icon: BarChart3, label: 'Attendance Analytics', desc: 'School-wide attendance', color: '#EC4899', action: () => { setActiveTab('chat'); handleSend('Attendance analytics'); } },
    ],
    management: [
      { icon: TrendingUp, label: 'View Revenue Forecast', desc: 'Financial projections', color: '#6D4CFF', action: () => { setActiveTab('chat'); handleSend('Revenue forecast'); } },
      { icon: PieChart, label: 'Admission Analytics', desc: 'Admission trends & stats', color: '#22C55E', action: () => { setActiveTab('chat'); handleSend('Admission analytics'); } },
      { icon: BarChart3, label: 'Growth Dashboard', desc: 'School growth metrics', color: '#3B82F6', action: () => { setActiveTab('chat'); handleSend('Growth dashboard'); } },
      { icon: FileText, label: 'Strategic Reports', desc: 'Executive summary reports', color: '#F59E0B', action: () => { setActiveTab('chat'); handleSend('Executive summary'); } },
      { icon: Brain, label: 'AI Forecasting', desc: 'Predictive analytics insights', color: '#A855F7', action: () => { setActiveTab('chat'); handleSend('AI predictions'); } },
      { icon: LineChart, label: 'Financial Reports', desc: 'Detailed financial analysis', color: '#EC4899', action: () => { setActiveTab('chat'); handleSend('Financial reports'); } },
    ],
    staff: [
      { icon: CalendarDays, label: 'View Schedule', desc: 'Work duty schedule', color: '#6D4CFF', action: () => { setActiveTab('chat'); handleSend('My schedule'); } },
      { icon: FileText, label: 'Apply Leave', desc: 'Submit leave request', color: '#22C55E', action: () => { setActiveTab('chat'); handleSend('Apply leave'); } },
      { icon: DollarSign, label: 'View Salary Slip', desc: 'Check payroll details', color: '#3B82F6', action: () => { setActiveTab('chat'); handleSend('My salary'); } },
      { icon: ClipboardList, label: 'View Tasks', desc: 'Assigned duties & tasks', color: '#F59E0B', action: () => { setActiveTab('chat'); handleSend('My tasks'); } },
      { icon: Bell, label: 'Notices', desc: 'Internal announcements', color: '#A855F7', action: () => { setActiveTab('chat'); handleSend('View notices'); } },
    ],
  };
  return tasks[role] || tasks.admin;
}

function getRoleHistory(role: string): { icon: any; label: string; desc: string; color: string; count: number }[] {
  const history: Record<string, any[]> = {
    parent: [
      { icon: Users, label: 'Attendance Checks', desc: 'Child attendance history', color: '#6D4CFF', count: 12 },
      { icon: DollarSign, label: 'Fee Inquiries', desc: 'Fee payment history', color: '#22C55E', count: 8 },
      { icon: CalendarDays, label: 'PTM Bookings', desc: 'Past meetings', color: '#3B82F6', count: 4 },
      { icon: FileText, label: 'Report Downloads', desc: 'Downloaded reports', color: '#F59E0B', count: 6 },
    ],
    student: [
      { icon: Brain, label: 'AI Tutor Sessions', desc: 'Past tutoring sessions', color: '#6D4CFF', count: 15 },
      { icon: BookMarked, label: 'Notes Generated', desc: 'Study notes created', color: '#22C55E', count: 10 },
      { icon: Edit3, label: 'Quizzes Taken', desc: 'Practice quizzes', color: '#3B82F6', count: 7 },
      { icon: ClipboardList, label: 'Assignments', desc: 'Completed tasks', color: '#F59E0B', count: 20 },
    ],
    teacher: [
      { icon: ClipboardList, label: 'Attendance Marked', desc: 'Classes taken', color: '#6D4CFF', count: 25 },
      { icon: Edit3, label: 'Assignments Created', desc: 'Given to students', color: '#22C55E', count: 18 },
      { icon: FileText, label: 'Question Papers', desc: 'Exams generated', color: '#3B82F6', count: 6 },
      { icon: BarChart3, label: 'Analytics Viewed', desc: 'Performance checks', color: '#F59E0B', count: 14 },
    ],
    admin: [
      { icon: FileText, label: 'Reports Generated', desc: 'Admin reports', color: '#6D4CFF', count: 30 },
      { icon: Users, label: 'Student Actions', desc: 'Records managed', color: '#22C55E', count: 45 },
      { icon: Shield, label: 'Staff Actions', desc: 'Staff management', color: '#3B82F6', count: 22 },
      { icon: DollarSign, label: 'Fee Queries', desc: 'Payment checks', color: '#F59E0B', count: 18 },
    ],
    management: [
      { icon: TrendingUp, label: 'Revenue Reviews', desc: 'Financial check-ins', color: '#6D4CFF', count: 20 },
      { icon: PieChart, label: 'Admission Reviews', desc: 'Enrollment checks', color: '#22C55E', count: 12 },
      { icon: BarChart3, label: 'Growth Reports', desc: 'Metric reviews', color: '#3B82F6', count: 15 },
      { icon: Brain, label: 'AI Insights', desc: 'Predictive views', color: '#F59E0B', count: 8 },
    ],
    staff: [
      { icon: CalendarDays, label: 'Schedule Views', desc: 'Duty checks', color: '#6D4CFF', count: 20 },
      { icon: FileText, label: 'Leave Applications', desc: 'Past requests', color: '#22C55E', count: 5 },
      { icon: DollarSign, label: 'Salary Checks', desc: 'Payroll views', color: '#3B82F6', count: 8 },
      { icon: Bell, label: 'Notices Read', desc: 'Announcements', color: '#F59E0B', count: 15 },
    ],
  };
  return history[role] || history.admin;
}

function getRoleRecentActivity(role: string): { action: string; time: string }[] {
  const activity: Record<string, { action: string; time: string }[]> = {
    parent: [
      { action: 'Attendance check for Rohan', time: '2h ago' },
      { action: 'Fee inquiry', time: '1d ago' },
      { action: 'PTM scheduled', time: '2d ago' },
    ],
    student: [
      { action: 'AI Tutor session - Math', time: '1h ago' },
      { action: 'Homework submitted', time: '3h ago' },
      { action: 'Quiz attempted - Science', time: '1d ago' },
    ],
    teacher: [
      { action: 'Attendance marked - Class 10A', time: '1h ago' },
      { action: 'Assignment created', time: '3h ago' },
      { action: 'Class analytics viewed', time: '1d ago' },
    ],
    admin: [
      { action: 'Report generated', time: '1h ago' },
      { action: 'Student record updated', time: '3h ago' },
      { action: 'Fee report viewed', time: '1d ago' },
    ],
    management: [
      { action: 'Revenue forecast viewed', time: '1h ago' },
      { action: 'Admission report generated', time: '3h ago' },
      { action: 'Executive summary downloaded', time: '1d ago' },
    ],
    staff: [
      { action: 'Schedule viewed', time: '2h ago' },
      { action: 'Leave application submitted', time: '1d ago' },
      { action: 'Salary slip downloaded', time: '3d ago' },
    ],
  };
  return activity[role] || activity.admin;
}

export default function PreranaAIPanel() {
  const {
    isOpen, setOpen, activeTab, setActiveTab, role, setRole,
    language, setLanguage, badgeCount, resetBadge,
    query, setQuery,
  } = usePreranaAIStore();

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: `Hello! I'm Prerana AI. How can I help you today?` },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        if (transcript.trim()) handleSend(transcript);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setInterval>;
    if (callActive) t = setInterval(() => setCallDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, [callActive]);

  useEffect(() => {
    const initSocket = async () => {
      const { io } = await import('socket.io-client');
      const wsUrl = VOICE_API.replace('/api/voice', '');
      const s = io(wsUrl, {
        path: '/ws',
        transports: ['websocket', 'polling'],
        auth: { token: typeof window !== 'undefined' ? localStorage.getItem('studentSession') ? JSON.parse(localStorage.getItem('studentSession') || '{}').token : '' : '' },
        autoConnect: true,
        reconnection: true,
      });
      s.on('connect', () => console.log('[WS] Prerana AI connected'));
      s.on('prerana:response', (data: any) => {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Processing...' }]);
        if (data.suggestions?.length) setTimeout(() => setShowSuggestions(true), 500);
        setIsProcessing(false);
      });
      s.on('disconnect', () => console.log('[WS] Prerana AI disconnected'));
      s.on('connect_error', () => {
        setIsProcessing(false);
        setMessages(prev => [...prev, { role: 'assistant', content: 'WebSocket connection error. Using HTTP fallback.' }]);
      });
      socketRef.current = s;
    };
    initSocket();
    return () => { socketRef.current?.disconnect(); };
  }, []);

  const getRoleColor = () => roles.find(r => r.key === role)?.color || '#6D4CFF';
  const getRoleIcon = () => { const r = roles.find(r => r.key === role); return r?.icon || Bot; };
  const getRoleBg = () => roles.find(r => r.key === role)?.bg || '#6D4CFF15';

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isProcessing) return;
    setInput('');
    setShowSuggestions(false);
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setIsProcessing(true);
    if (socketRef.current?.connected) {
      socketRef.current.emit('prerana:chat', { content: msg, role, language });
    } else {
      try {
        const res = await fetch(`${VOICE_API}/prerana/chat`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, role, language }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setMessages(prev => [...prev, { role: 'assistant', content: data.data.reply || 'Processing...' }]);
          if (data.data.suggestions?.length) setTimeout(() => setShowSuggestions(true), 500);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that." }]);
        }
      } catch {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Check Prerana AI service.' }]);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  useEffect(() => {
    if (query) {
      handleSend(query);
      setQuery('');
    }
  }, [query]);

  const toggleListening = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    if (recognitionRef.current) { try { recognitionRef.current.start(); setIsListening(true); } catch {} }
  };

  const formatDuration = (secs: number) =>
    `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

  const RoleIcon = getRoleIcon();

  const renderSuggestions = () => {
    const suggestions = roleSuggestions[role] || roleSuggestions.admin;
    return (
      <div className="flex flex-wrap gap-1.5 px-3 py-2">
        {suggestions.map(s => (
          <button key={s} onClick={() => handleSend(s)}
            className="px-2.5 py-1 rounded-full bg-purple-50 text-[10px] font-medium text-purple-700 hover:bg-purple-100 border border-purple-100 transition-all"
          >{s}</button>
        ))}
      </div>
    );
  };

  const renderChat = () => (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center mx-auto mb-2">
              <Sparkles size={18} className="text-white" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Prerana AI Assistant</p>
            <p className="text-[10px] text-gray-400 mt-1">Ask me anything about school</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={10} className="text-white" />
              </div>
            )}
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[11px] leading-relaxed ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white rounded-tr-sm'
                : 'bg-gray-50 border border-gray-100 text-gray-700 rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={10} className="text-white" />
              </div>
            )}
          </motion.div>
        ))}
        {isProcessing && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
              <Sparkles size={10} className="text-white" />
            </div>
            <div className="bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl flex items-center gap-2">
              <Loader2 size={12} className="animate-spin text-[#7C3AED]" />
              <span className="text-[10px] text-gray-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showSuggestions && messages.length > 1 && (
        <div className="border-t border-gray-100 bg-white">
          {renderSuggestions()}
        </div>
      )}

      <div className="p-2.5 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-1.5">
          <button onClick={toggleListening}
            className={`p-1.5 rounded-lg transition-colors ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-gray-400 hover:bg-gray-100'}`}
          >{isListening ? <MicOff size={14} /> : <Mic size={14} />}</button>
          <div className="flex-1 relative">
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..." disabled={isProcessing}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] disabled:opacity-50"
            />
          </div>
          <button onClick={() => handleSend()} disabled={!input.trim() || isProcessing}
            className="p-1.5 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white disabled:opacity-50"
          ><Send size={14} /></button>
        </div>
      </div>
    </div>
  );

  const renderVoice = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
      <div className="text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-500 ${
          callActive ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-200' : 'bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6]'
        }`}>
          <Phone size={32} className="text-white" />
        </div>
        <h3 className="text-sm font-bold text-gray-800">{callActive ? 'Call in Progress' : 'Voice Call'}</h3>
        <p className="text-[10px] text-gray-400 mt-1">
          {callActive ? formatDuration(callDuration) : 'Start a voice conversation with AI'}
        </p>
      </div>

      {callActive && (
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-center gap-1 h-12">
            {[1, 2, 3, 4, 5].map(i => (
              <motion.div key={i} animate={{ height: [20, 40, 20] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                className="w-1.5 rounded-full bg-gradient-to-t from-[#7C3AED] to-[#8B5CF6]" />
            ))}
          </div>
          {transcript && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl text-[10px] text-gray-600 italic">
              "{transcript}"
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setCallActive(!callActive)}
          className={`px-6 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            callActive
              ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200'
              : 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white hover:shadow-lg'
          }`}
        >{callActive ? 'End Call' : 'Start Call'}</button>
      </div>

      <div className="relative">
        <button onClick={() => setShowLangPicker(!showLangPicker)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-medium text-gray-600 hover:bg-gray-50"
        ><Globe size={12} />{languages.find(l => l.code === language)?.label || 'English'}<ChevronDown size={10} /></button>
        <AnimatePresence>
          {showLangPicker && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-1 min-w-[120px]"
            >
              {languages.map(l => (
                <button key={l.code} onClick={() => { setLanguage(l.code); setShowLangPicker(false); }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] ${language === l.code ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                >{l.label}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const tasks = getRoleTasks(role, setActiveTab, handleSend);

  const renderTasks = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <p className="text-[10px] text-gray-400 mb-4">Let AI handle school tasks for you</p>
      <div className="grid grid-cols-2 gap-2">
        {tasks.map(t => (
          <motion.button key={t.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={t.action}
            className="p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm text-left transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${t.color}15` }}>
              <t.icon size={15} style={{ color: t.color }} />
            </div>
            <div className="text-[11px] font-semibold text-gray-800">{t.label}</div>
            <div className="text-[9px] text-gray-400 mt-0.5">{t.desc}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const historyItems = getRoleHistory(role);

  const renderHistory = () => {
    const recentActivity = getRoleRecentActivity(role);
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-[10px] text-gray-400 mb-4">Your activity history with Prerana AI</p>
        <div className="space-y-2">
          {historyItems.map((item, i) => (
            <div key={i} className="p-3 rounded-xl border border-gray-100 bg-white flex items-center justify-between hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${item.color}15` }}>
                  <item.icon size={14} style={{ color: item.color }} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-800">{item.label}</div>
                  <div className="text-[9px] text-gray-400">{item.desc}</div>
                </div>
              </div>
              <div className="text-[10px] font-bold text-gray-400">x{item.count}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="text-[10px] font-semibold text-gray-600 mb-2">Recent Activity</div>
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
              <span className="text-[10px] text-gray-600 flex-1">{a.action}</span>
              <span className="text-[8px] text-gray-400">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const tabs = [
    { key: 'chat', icon: MessageSquare, label: 'Chat' },
    { key: 'voice', icon: Phone, label: 'Voice' },
    { key: 'tasks', icon: List, label: 'Tasks' },
    { key: 'history', icon: Clock, label: 'History' },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={() => setOpen(false)}
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-0 right-0 bottom-0 z-50 w-[450px] max-w-full bg-white shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center shadow-sm">
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                Prerana AI
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                <span className="text-[8px] font-normal text-green-600">Online</span>
              </div>
              <div className="text-[9px] text-gray-400">Ask me anything</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="relative">
              <button onClick={() => setShowLangPicker(!showLangPicker)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors" title="Language">
                <Globe size={15} />
              </button>
              <AnimatePresence>
                {showLangPicker && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-1 min-w-[130px]"
                  >
                    {languages.map(l => (
                      <button key={l.code} onClick={() => { setLanguage(l.code); setShowLangPicker(false); }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] ${language === l.code ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                      >{l.label}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors" title="Settings">
              <Settings size={15} />
            </button>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors" title="Close">
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-1.5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-200 text-[9px] font-medium text-gray-500">
            <RoleIcon size={11} style={{ color: getRoleColor() }} />
            <span>{roles.find(r => r.key === role)?.label || role}</span>
            <ChevronDown size={9} />
          </div>
          <div className="flex-1" />
        </div>

        <nav className="flex border-b border-gray-100 bg-white">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-medium border-b-2 transition-colors ${
                activeTab === tab.key ? 'border-[#7C3AED] text-[#7C3AED]' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            ><tab.icon size={13} />{tab.label}</button>
          ))}
        </nav>

        <div className="flex-1 flex flex-col min-h-0">
          {activeTab === 'chat' && renderChat()}
          {activeTab === 'voice' && renderVoice()}
          {activeTab === 'tasks' && renderTasks()}
          {activeTab === 'history' && renderHistory()}
        </div>

        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] text-gray-400">Powered by</span>
            <span className="text-[8px] font-bold text-[#7C3AED]">Prerana AI</span>
          </div>
          <span className="text-[7px] text-gray-300">v1.0</span>
        </div>
      </motion.div>
    </>
  );
}
