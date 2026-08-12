'use client';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, User, Send, Mic, MicOff, MessageSquare, Globe, Phone, PhoneOff,
  Loader2, GraduationCap, Users, Heart, Shield, BarChart3, Brain,
  CalendarDays, Clock, Bell, AlertCircle, CheckCircle, FileText,
  ChevronDown, X, Sparkles, BookOpen, HelpCircle, Play, Speaker,
  Volume2, Settings, Activity, TrendingUp, Award, Lightbulb,
  Search, BookMarked, Library, Zap, Target, Star, Smile,
  HeadphonesIcon, Radio,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const VOICE_API = process.env.NEXT_PUBLIC_VOICE_API_URL || 'http://localhost:4007/api/voice';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  data?: any;
  action?: string;
  persona?: string;
}

interface Persona {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  expertise: string[];
}

const roles = [
  { key: 'parent', label: 'Parent', icon: Users, color: '#22C55E' },
  { key: 'student', label: 'Student', icon: GraduationCap, color: '#3B82F6' },
  { key: 'teacher', label: 'Teacher', icon: Heart, color: '#A855F7' },
  { key: 'admin', label: 'Admin', icon: Shield, color: '#6D4CFF' },
  { key: 'management', label: 'Management', icon: BarChart3, color: '#F59E0B' },
  { key: 'staff', label: 'Staff', icon: Users, color: '#06B6D4' },
];

const languages = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'हिन्दी', native: 'Hindi' },
  { code: 'mr', label: 'मराठी', native: 'Marathi' },
  { code: 'ta', label: 'தமிழ்', native: 'Tamil' },
  { code: 'te', label: 'తెలుగు', native: 'Telugu' },
  { code: 'bn', label: 'বাংলা', native: 'Bengali' },
  { code: 'gu', label: 'ગુજરાતી', native: 'Gujarati' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', native: 'Punjabi' },
];

const viewOptions = [
  { key: 'chat', label: 'Chat', icon: MessageSquare },
  { key: 'ptm', label: 'PTM', icon: CalendarDays },
  { key: 'calls', label: 'Voice Calls', icon: Phone },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'knowledge', label: 'Knowledge', icon: Library },
];

const defaultPersonas: Persona[] = [
  { id: 'teacher-avatar', name: 'Teacher Avatar', title: 'AI Teaching Assistant', description: 'Lesson plans, quizzes, assignments, teaching materials', icon: 'BookOpen', color: '#A855F7', expertise: ['lesson-planning', 'quiz-creation', 'assignment-help', 'teaching-strategies', 'report-cards'] },
  { id: 'principal', name: 'Principal', title: 'AI School Principal', description: 'School administration, staff management, policy guidance', icon: 'Shield', color: '#6D4CFF', expertise: ['school-policy', 'staff-management', 'discipline', 'curriculum-oversight', 'parent-relations'] },
  { id: 'counselor', name: 'Counselor', title: 'AI Student Counselor', description: 'Student guidance, mental health, career advice', icon: 'Heart', color: '#EC4899', expertise: ['student-counseling', 'mental-health', 'career-guidance', 'conflict-resolution', 'wellness'] },
  { id: 'admission-counselor', name: 'Admission Counselor', title: 'AI Admission Counselor', description: 'Admissions, enrollment, document verification', icon: 'GraduationCap', color: '#3B82F6', expertise: ['admissions', 'enrollment', 'document-verification', 'fee-structure', 'scholarships'] },
  { id: 'hr-assistant', name: 'HR Assistant', title: 'AI HR Assistant', description: 'Payroll, leave management, recruitment', icon: 'Users', color: '#06B6D4', expertise: ['payroll', 'leave-management', 'recruitment', 'staff-benefits', 'hr-policies'] },
  { id: 'finance-assistant', name: 'Finance Assistant', title: 'AI Finance Assistant', description: 'Fee management, budgeting, financial reports', icon: 'BarChart3', color: '#F59E0B', expertise: ['fee-management', 'budgeting', 'financial-reports', 'expense-tracking', 'revenue-analysis'] },
  { id: 'academic-coach', name: 'Academic Coach', title: 'AI Academic Coach', description: 'Subject help, study strategies, exam preparation', icon: 'Brain', color: '#8B5CF6', expertise: ['subject-help', 'study-skills', 'exam-prep', 'time-management', 'learning-strategies'] },
  { id: 'parent-companion', name: 'Parent Companion', title: 'AI Parent Companion', description: 'Child progress, school communication, parenting tips', icon: 'Heart', color: '#22C55E', expertise: ['child-progress', 'school-communication', 'parenting-tips', 'pta', 'extracurricular'] },
  { id: 'student-companion', name: 'Student Companion', title: 'AI Student Companion', description: 'Daily life, activities, peer support', icon: 'Sparkles', color: '#F97316', expertise: ['daily-schedule', 'activities', 'peer-support', 'school-events', 'student-life'] },
  { id: 'school-receptionist', name: 'Receptionist', title: 'AI School Receptionist', description: 'General inquiries, directions, visitor management', icon: 'Phone', color: '#6366F1', expertise: ['general-info', 'directions', 'visitor-management', 'school-hours', 'contact-info'] },
  { id: 'school-broadcaster', name: 'Broadcaster', title: 'AI School Broadcaster', description: 'Announcements, alerts, notifications, mass communication', icon: 'Bell', color: '#EF4444', expertise: ['announcements', 'emergency-alerts', 'event-notifications', 'mass-communication', 'newsletters'] },
];

const personaIconMap: Record<string, any> = {
  'BookOpen': BookOpen, 'Shield': Shield, 'Heart': Heart, 'GraduationCap': GraduationCap,
  'Users': Users, 'BarChart3': BarChart3, 'Brain': Brain, 'Sparkles': Sparkles,
  'Phone': Phone, 'Bell': Bell,
};

function speakText(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const cleaned = text.replace(/[*#✅📊📝💰📈📋⚠️🤖💡🔴🟡🔵🌟🎓🚌🏠📅📚⚖️📍🕐📞💼👥🎯💚🤝💪🆘🔥⏰📰🚨📡]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.rate = 0.9; utterance.pitch = 1.05; utterance.volume = 1; utterance.lang = 'en-US';
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.name.includes('Google US') || v.name.includes('Samantha') || v.name.includes('Female'));
  if (preferred) utterance.voice = preferred;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
}

export default function PreranaAITab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeakingState] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'ptm' | 'calls' | 'analytics' | 'knowledge'>('chat');
  const [selectedRole, setSelectedRole] = useState('parent');
  const [selectedLang, setSelectedLang] = useState('en');
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showPersonaPanel, setShowPersonaPanel] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callActive, setCallActive] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [personas, setPersonas] = useState<Persona[]>(defaultPersonas);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    fetch(`${VOICE_API}/prerana/personas`).then(r => r.json()).then(d => {
      if (d.success && d.data?.personas?.length) setPersonas(d.data.personas);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
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
    let timer: ReturnType<typeof setInterval>;
    if (callActive) timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, [callActive]);

  const toggleListening = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    if (recognitionRef.current) { try { recognitionRef.current.start(); setIsListening(true); } catch {} }
  };

  const getPersona = (id: string | null) => personas.find(p => p.id === id);

  const getPersonaIcon = (persona: Persona | undefined) => {
    if (!persona) return Sparkles;
    return personaIconMap[persona.icon] || Bot;
  };

  const getWelcomeMessage = (role: string, personaId?: string | null): string => {
    if (personaId) {
      const p = getPersona(personaId);
      if (p) return `Hello! I'm **${p.name}** — ${p.title}. ${p.description}. How can I assist you today?`;
    }
    const welcomes: Record<string, string> = {
      parent: "Hello! I'm Prerana AI, your child's school assistant. I can help you check attendance, fees, exam schedules, homework, and even schedule meetings with teachers. How can I help you today?",
      student: "Hey there! I'm Prerana AI, your learning buddy. Need help with your timetable, homework, exam prep, or understanding a topic? Just ask me anything!",
      teacher: "Hello! I'm Prerana AI, your teaching assistant. I can help with lesson plans, assignments, quizzes, attendance, and class analytics. How can I support you today?",
      admin: "Welcome! I'm Prerana AI, your admin assistant. I can generate reports on admissions, attendance, fees, transport, hostel, and academics. What would you like to know?",
      management: "Hello! I'm Prerana AI, your executive assistant. I provide insights on revenue forecasts, student growth, admissions trends, academic performance, and risk analysis.",
      staff: "Hi! I'm Prerana AI, your staff assistant. I can help with your schedule, payroll, leave balance, and meetings. What would you like to check?",
    };
    return welcomes[role] || "Hello! I'm Prerana AI, your school assistant. How can I help you today?";
  };

  const handleSend = async (text?: string) => {
    const message = (text || input).trim();
    if (!message || isProcessing) return;
    setInput('');
    setShowQuickActions(false);
    setMessages(prev => [...prev, { role: 'user', content: message, timestamp: new Date() }]);
    setIsProcessing(true);

    try {
      const res = await fetch(`${VOICE_API}/prerana/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message, role: selectedRole, language: selectedLang, callId,
          personaId: selectedPersona,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const reply = data.data.reply || "I'm processing your request. Let me check the system.";
        setMessages(prev => [...prev, {
          role: 'assistant', content: reply, timestamp: new Date(),
          data: data.data.data, action: data.data.action, persona: data.data.persona,
        }]);
        if (data.data.suggestions?.length) {
          setMessages(prev => [...prev, { role: 'system', content: '', timestamp: new Date(), data: { suggestions: data.data.suggestions } }]);
        }
        if (data.data.action === 'ptm_scheduling') setActiveView('ptm');
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I couldn't process that. Please try again.", timestamp: new Date() }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please check that the Prerana AI service is running.', timestamp: new Date() }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAction = async (intent: string) => {
    await handleSend(intent);
  };

  const selectPersona = (personaId: string | null) => {
    setSelectedPersona(personaId);
    setShowPersonaPanel(false);
    setMessages([]);
    setShowQuickActions(true);
    const persona = personas.find(p => p.id === personaId);
    if (persona) {
      setMessages([{ role: 'assistant', content: `Hello! I'm **${persona.name}** — ${persona.title}. ${persona.description}. How can I assist you today?`, timestamp: new Date(), persona: personaId ?? undefined }]);
    }
  };

  const startCall = async () => {
    try {
      const persona = selectedPersona ? getPersona(selectedPersona) : null;
      const res = await fetch(`${VOICE_API}/prerana/voice-call`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: selectedRole, message: `Hello from ${persona?.name || 'Prerana AI'}`, type: 'general' }),
      });
      const data = await res.json();
      if (data.success) {
        setCallId(data.data?.callId || `CALL-${Date.now()}`);
        setCallActive(true);
        setMessages([{ role: 'assistant', content: `📞 Call connected! Welcome to Prerana AI Voice Assistant. ${persona ? `You're speaking with **${persona.name}**.` : `You are speaking as a **${selectedRole}**.`} How can I help you today?`, timestamp: new Date() }]);
      }
    } catch {}
  };

  const endCall = async () => {
    stopSpeaking();
    if (callId) await fetch(`${VOICE_API}/calls/${callId}/end`, { method: 'POST' }).catch(() => {});
    setCallActive(false); setCallDuration(0); setCallId(null);
    setMessages([{ role: 'assistant', content: 'Call ended. Thank you for using Prerana AI! 😊', timestamp: new Date() }]);
  };

  const formatDuration = (secs: number) => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

  const getRoleIcon = (role: string) => {
    const r = roles.find(r => r.key === role);
    return r?.icon || Bot;
  };

  const getRoleColor = (role: string) => {
    const r = roles.find(r => r.key === role);
    return r?.color || '#6D4CFF';
  };

  const renderChatView = () => (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !callActive && (
          <div className="text-center py-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center mx-auto shadow-lg">
                <Sparkles size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Prerana AI Assistant</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                {selectedPersona
                  ? `Chatting with **${getPersona(selectedPersona)?.name || 'AI Assistant'}**. Ask anything related to ${getPersona(selectedPersona)?.expertise?.slice(0, 3).join(', ') || 'school'}!`
                  : 'Your intelligent school assistant. Ask me anything about attendance, fees, exams, homework, and more.'}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <button onClick={() => setShowPersonaPanel(true)}
                  className="px-3 py-1.5 rounded-lg border border-[#6D4CFF30] text-[10px] font-semibold text-[#6D4CFF] hover:bg-[#6D4CFF10] transition-all flex items-center gap-1"
                ><Bot size={12} />Choose AI Persona</button>
              </div>
            </motion.div>
          </div>
        )}
        {messages.map((msg, i) => {
          if (msg.role === 'system' && msg.data?.suggestions) {
            return (
              <div key={i} className="flex flex-wrap gap-1.5 justify-center">
                {msg.data.suggestions.map((s: string) => (
                  <button key={s} onClick={() => handleSend(s)}
                    className="px-3 py-1.5 rounded-lg bg-[#6D4CFF10] border border-[#6D4CFF20] text-[10px] font-medium text-[#6D4CFF] hover:bg-[#6D4CFF20] transition-all"
                  >{s}</button>
                ))}
              </div>
            );
          }
          const persona = msg.persona ? getPersona(msg.persona) : null;
          const IconComp = persona ? getPersonaIcon(persona) : (msg.role === 'user' ? User : Sparkles);
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm"
                  style={{ background: persona ? `linear-gradient(135deg, ${persona.color}, ${persona.color}dd)` : 'linear-gradient(135deg, #6D4CFF, #8B5CF6)' }}>
                  <IconComp size={12} className="text-white" />
                </div>
              )}
              <div className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
                msg.role === 'user' ? 'bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <User size={12} className="text-white" />
                </div>
              )}
            </motion.div>
          );
        })}
        {isProcessing && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles size={12} className="text-white" />
            </div>
            <div className="bg-white border border-gray-100 px-3.5 py-2.5 rounded-xl rounded-tl-sm shadow-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-[#6D4CFF]" />
              <span className="text-xs text-gray-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showQuickActions && messages.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-white">
          <div className="flex flex-wrap gap-1.5">
            {['Attendance', 'Fee Status', 'Exam Dates', 'Timetable', 'Homework', 'Performance'].map(a => (
              <button key={a} onClick={() => handleQuickAction(a)} disabled={isProcessing}
                className="px-2.5 py-1.5 text-[10px] rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-50"
              >{a}</button>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <button onClick={toggleListening} disabled={!callActive}
            className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-[#EF4444] text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} disabled:opacity-50`}
            title={isListening ? 'Stop listening' : 'Start speaking'}
          >{isListening ? <MicOff size={16} /> : <Mic size={16} />}</button>
          <div className="flex-1 relative">
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? '🎤 Listening...' : `Ask me anything as a ${selectedRole}...`} disabled={isProcessing}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF] disabled:opacity-50 pr-10"
            />
            {input && (
              <button onClick={() => setInput('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <button onClick={() => handleSend()} disabled={!input.trim() || isProcessing}
            className="p-2 bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white rounded-lg hover:shadow-md disabled:opacity-50 transition-all"
          ><Send size={16} /></button>
        </div>
      </div>
    </div>
  );

  const renderPersonaPanel = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowPersonaPanel(false)}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-3xl max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Bot size={20} className="text-[#6D4CFF]" />Choose AI Persona</h3>
            <p className="text-xs text-gray-400">Select an AI assistant tailored to your specific needs</p>
          </div>
          <button onClick={() => setShowPersonaPanel(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {personas.map(p => {
            const IconComp = getPersonaIcon(p);
            const isActive = selectedPersona === p.id;
            return (
              <motion.button key={p.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => selectPersona(p.id)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                  isActive ? 'border-[#6D4CFF] bg-[#6D4CFF08] shadow-md' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${p.color}18` }}>
                    <IconComp size={18} style={{ color: p.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-800">{p.name}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{p.title}</div>
                    <div className="text-[9px] text-gray-400 mt-1 line-clamp-2">{p.description}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.expertise.slice(0, 3).map(e => (
                        <span key={e} className="text-[8px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{e.replace(/-/g, ' ')}</span>
                      ))}
                    </div>
                  </div>
                  {isActive && <CheckCircle size={14} className="text-[#6D4CFF] flex-shrink-0 mt-1" />}
                </div>
              </motion.button>
            );
          })}
        </div>
        <button onClick={() => selectPersona(null)}
          className="w-full mt-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
        ><Zap size={14} className="inline mr-1" />Use Default AI Assistant (No Persona)</button>
      </motion.div>
    </div>
  );

  const renderPTMView = () => (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#06B6D4] flex items-center justify-center mx-auto mb-3">
            <CalendarDays size={22} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Parent-Teacher Meeting</h3>
          <p className="text-xs text-gray-400 mt-1">Schedule and manage PTM appointments</p>
        </div>

        <Card className="p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Schedule a Meeting</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Parent Name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              <input placeholder="Student Name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
            </div>
            <input placeholder="Teacher Name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs" />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" className="px-3 py-2 border border-gray-200 rounded-lg text-xs" />
              <select className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
                <option>Select Time</option>
                <option>9:00 AM</option><option>10:00 AM</option><option>11:00 AM</option>
                <option>2:00 PM</option><option>3:00 PM</option><option>4:00 PM</option>
              </select>
            </div>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white">
              <option>Purpose of Meeting</option>
              <option>Academic Progress</option><option>Behavior</option><option>General Discussion</option>
            </select>
            <button onClick={() => { handleQuickAction('I want to schedule a meeting'); toast?.success?.('PTM request sent!'); }}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg transition-all"
            >Request Meeting</button>
          </div>
        </Card>

        <Card className="p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Available Slots</h4>
          <div className="grid grid-cols-1 gap-2">
            {[
              { date: 'Fri, Jun 12', time: '11:00 AM', teacher: 'Class Teacher', available: true },
              { date: 'Sat, Jun 13', time: '2:00 PM', teacher: 'Class Teacher', available: true },
              { date: 'Mon, Jun 15', time: '9:00 AM', teacher: 'Math Teacher', available: true },
              { date: 'Tue, Jun 16', time: '3:00 PM', teacher: 'Science Teacher', available: true },
            ].map((slot, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#22C55E15] flex items-center justify-center text-[#22C55E]">
                    <CalendarDays size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{slot.date} at {slot.time}</div>
                    <div className="text-[10px] text-gray-400">{slot.teacher}</div>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-[#22C55E] text-white text-[10px] font-semibold hover:bg-[#16A34A]">
                  Book
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderCallsView = () => (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#06B6D4] flex items-center justify-center mx-auto mb-3">
            <Phone size={22} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Voice Call Center</h3>
          <p className="text-xs text-gray-400 mt-1">Automated voice calls with Prerana AI personas for notifications and alerts</p>
        </div>

        {selectedPersona && (
          <Card className="p-4 bg-gradient-to-r from-[#6D4CFF08] to-[#8B5CF608] border-[#6D4CFF20]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${getPersona(selectedPersona)?.color || '#6D4CFF'}20` }}>
                {(() => { const Icon = getPersonaIcon(getPersona(selectedPersona)); return <Icon size={18} style={{ color: getPersona(selectedPersona)?.color }} />; })()}
              </div>
              <div>
                <div className="text-xs font-bold">Calling via {getPersona(selectedPersona)?.name || 'AI'} mode</div>
                <div className="text-[9px] text-gray-400">Voice calls will use the {getPersona(selectedPersona)?.title} persona</div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: AlertCircle, label: 'Fee Reminder', desc: 'Call parents with pending fees', color: '#22C55E', action: 'fee_status' },
            { icon: CalendarDays, label: 'PTM Reminder', desc: 'Remind parents about PTM', color: '#3B82F6', action: 'meet_teacher' },
            { icon: Clock, label: 'Attendance Alert', desc: 'Alert about low attendance', color: '#F59E0B', action: 'attendance' },
            { icon: Bell, label: 'Emergency Alert', desc: 'Send emergency notifications', color: '#EF4444', action: 'emergency' },
            { icon: GraduationCap, label: 'Exam Notice', desc: 'Notify about exams', color: '#A855F7', action: 'exam_dates' },
            { icon: Award, label: 'Scholarship Alert', desc: 'Scholarship announcements', color: '#6D4CFF', action: 'scholarship' },
          ].map((item) => (
            <Card key={item.label} className="p-4 text-center hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `${item.color}15` }}>
                <item.icon size={18} style={{ color: item.color }} />
              </div>
              <h4 className="text-sm font-semibold">{item.label}</h4>
              <p className="text-[10px] text-gray-500 mb-3">{item.desc}</p>
              <button onClick={() => handleQuickAction(item.action)}
                className="px-4 py-2 rounded-lg text-white text-xs font-semibold hover:shadow-md transition-all"
                style={{ background: item.color }}>Call Now</button>
            </Card>
          ))}
        </div>

        <Card className="p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Call Status</h4>
          <div className="space-y-2">
            {[
              { number: 'Parent - R. Sharma', status: 'Completed', time: '2 min ago', type: 'Fee Reminder' },
              { number: 'Parent - A. Patel', status: 'In Progress', time: '45 sec', type: 'PTM Reminder' },
              { number: 'Parent - S. Singh', status: 'Queued', time: '—', type: 'Attendance Alert' },
              { number: 'Staff - M. Kumar', status: 'Scheduled', time: 'Tomorrow', type: 'Meeting Alert' },
            ].map((call, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Phone size={12} className={
                    call.status === 'Completed' ? 'text-[#22C55E]' : call.status === 'In Progress' ? 'text-[#3B82F6]' : 'text-gray-400'
                  } />
                  <div>
                    <div className="text-xs font-semibold">{call.number}</div>
                    <div className="text-[9px] text-gray-400">{call.type}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={
                    call.status === 'Completed' ? 'success' : call.status === 'In Progress' ? 'info' : call.status === 'Queued' ? 'warning' : 'default'
                  } className="text-[8px]">{call.status}</Badge>
                  <div className="text-[9px] text-gray-400 mt-0.5">{call.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderKnowledgeView = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    const doSearch = async () => {
      if (!searchQuery.trim()) return;
      setLoading(true);
      try {
        const res = await fetch(`${VOICE_API}/prerana/knowledge-base/search`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        });
        const data = await res.json();
        if (data.success) setResults(data.data?.results || []);
      } catch {}
      setSearched(true);
      setLoading(false);
    };

    const categories = [
      { name: 'Admissions', icon: GraduationCap, color: '#3B82F6' },
      { name: 'Fees', icon: Shield, color: '#F59E0B' },
      { name: 'Academics', icon: BookOpen, color: '#A855F7' },
      { name: 'Policies', icon: FileText, color: '#6D4CFF' },
      { name: 'Exams', icon: HelpCircle, color: '#EF4444' },
      { name: 'Transport', icon: Phone, color: '#22C55E' },
      { name: 'Hostel', icon: Shield, color: '#06B6D4' },
      { name: 'Activities', icon: Star, color: '#F97316' },
    ];

    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center mx-auto mb-3">
              <Library size={22} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Knowledge Base</h3>
            <p className="text-xs text-gray-400 mt-1">Search school policies, procedures, FAQs and information</p>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()}
                placeholder="Search knowledge base..." className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF]" />
            </div>
            <button onClick={doSearch} disabled={loading || !searchQuery.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-md disabled:opacity-50"
            >{loading ? <Loader2 size={14} className="animate-spin" /> : 'Search'}</button>
          </div>

          {!searched && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600 mb-3">Browse by Category</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map(cat => (
                  <button key={cat.name} onClick={() => { setSearchQuery(cat.name); setTimeout(doSearch, 100); }}
                    className="p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm text-center transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: `${cat.color}15` }}>
                      <cat.icon size={14} style={{ color: cat.color }} />
                    </div>
                    <div className="text-[11px] font-semibold text-gray-700">{cat.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {searched && loading && (
            <div className="text-center py-8">
              <Loader2 size={24} className="animate-spin text-[#6D4CFF] mx-auto" />
              <p className="text-xs text-gray-400 mt-2">Searching knowledge base...</p>
            </div>
          )}

          {searched && !loading && results.length === 0 && (
            <div className="text-center py-8">
              <Search size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No results found for "{searchQuery}"</p>
              <p className="text-[10px] text-gray-300 mt-1">Try different keywords or browse categories above</p>
            </div>
          )}

          {searched && results.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] text-gray-500">Found {results.length} result{results.length > 1 ? 's' : ''} for "{searchQuery}"</p>
              {results.map((item: any, i: number) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#6D4CFF' }} />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">{item.question || item.category}</h4>
                      <p className="text-xs text-gray-600 mt-1">{item.answer}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(item.tags || []).map((t: string) => (
                          <span key={t} className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#6D4CFF10] text-[#6D4CFF]">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAnalyticsView = () => (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center mx-auto mb-3">
            <BarChart3 size={22} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">AI Analytics Dashboard</h3>
          <p className="text-xs text-gray-400 mt-1">Track Prerana AI performance, persona usage, and insights</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Conversations', value: '1,247', icon: MessageSquare, color: '#6D4CFF', trend: '+12%' },
            { label: 'Questions Answered', value: '3,892', icon: HelpCircle, color: '#22C55E', trend: '+18%' },
            { label: 'PTMs Scheduled', value: '156', icon: CalendarDays, color: '#3B82F6', trend: '+8%' },
            { label: 'Resolution Rate', value: '94%', icon: CheckCircle, color: '#22C55E', trend: '+5%' },
          ].map(stat => (
            <Card key={stat.label} className="p-4 text-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: `${stat.color}15` }}>
                <stat.icon size={15} style={{ color: stat.color }} />
              </div>
              <div className="text-lg font-extrabold text-gray-900">{stat.value}</div>
              <div className="text-[9px] text-gray-500">{stat.label}</div>
              <Badge variant="success" className="text-[7px] mt-1">{stat.trend}</Badge>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h4 className="text-xs font-semibold text-gray-700 mb-4">Persona Usage</h4>
            <div className="space-y-2">
              {[
                { name: 'Teacher Avatar', pct: 25, color: '#A855F7' },
                { name: 'Parent Companion', pct: 20, color: '#22C55E' },
                { name: 'Admission Counselor', pct: 15, color: '#3B82F6' },
                { name: 'Student Companion', pct: 12, color: '#F97316' },
                { name: 'Principal', pct: 10, color: '#6D4CFF' },
              ].map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="text-[10px] font-medium w-28 truncate">{item.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                  <span className="text-[9px] font-semibold text-gray-500">{item.pct}%</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h4 className="text-xs font-semibold text-gray-700 mb-4">Role Distribution</h4>
            <div className="space-y-2">
              {[
                { role: 'Parent', pct: 45, color: '#22C55E' },
                { role: 'Student', pct: 28, color: '#3B82F6' },
                { role: 'Teacher', pct: 15, color: '#A855F7' },
                { role: 'Admin', pct: 8, color: '#6D4CFF' },
                { role: 'Management', pct: 4, color: '#F59E0B' },
              ].map(item => (
                <div key={item.role} className="flex items-center gap-2">
                  <span className="text-[10px] font-medium w-20">{item.role}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                  <span className="text-[9px] font-semibold text-gray-500">{item.pct}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <h4 className="text-xs font-semibold text-gray-700 mb-4">Frequently Asked Questions</h4>
          <div className="space-y-2">
            {[
              { question: 'How is my child\'s attendance?', count: 342 },
              { question: 'How much fee is pending?', count: 289 },
              { question: 'What are the exam dates?', count: 245 },
              { question: 'What is today\'s timetable?', count: 198 },
              { question: 'How is my child performing?', count: 167 },
              { question: 'What scholarships are available?', count: 134 },
            ].map((faq, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-xs text-gray-700">{faq.question}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full rounded-full bg-[#6D4CFF]" style={{ width: `${(faq.count / 342) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500">{faq.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-gray-50/50 rounded-2xl overflow-hidden border border-gray-100">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          {selectedPersona ? (
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: `linear-gradient(135deg, ${getPersona(selectedPersona)?.color || '#6D4CFF'}, ${getPersona(selectedPersona)?.color || '#8B5CF6'}dd)` }}>
              {(() => { const Icon = getPersonaIcon(getPersona(selectedPersona)); return <Icon size={15} className="text-white" />; })()}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center shadow-sm">
              <Sparkles size={16} className="text-white" />
            </div>
          )}
          <div>
            <div className="text-sm font-bold flex items-center gap-2">
              {selectedPersona ? getPersona(selectedPersona)?.name || 'Prerana AI' : 'Prerana AI'}
              <Badge variant="purple" className="text-[8px]">BETA</Badge>
            </div>
            <div className="text-[10px] text-gray-400">{selectedPersona ? getPersona(selectedPersona)?.title || 'AI Assistant' : 'School AI Assistant'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <button onClick={() => { stopSpeaking(); setIsSpeakingState(false); }}
              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="Stop speaking">
              <Speaker size={14} />
            </button>
          )}
          {callActive && (
            <>
              <span className="text-[10px] font-mono text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                {formatDuration(callDuration)}
              </span>
              <button onClick={endCall} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100" title="End call">
                <PhoneOff size={14} />
              </button>
            </>
          )}
          {!callActive && (
            <button onClick={startCall} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100" title="Start call">
              <Phone size={14} />
            </button>
          )}
          <Badge variant="default" className={`text-[10px] gap-1 ${callActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${callActive ? 'bg-green-500' : 'bg-gray-300'}`} />
            {callActive ? 'Online' : 'Ready'}
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between px-3 border-b border-gray-200 bg-white">
        <div className="flex gap-1">
          {viewOptions.map(view => (
            <button key={view.key} onClick={() => setActiveView(view.key as typeof activeView)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeView === view.key ? 'border-[#6D4CFF] text-[#6D4CFF]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            ><view.icon size={12} />{view.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPersonaPanel(true)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-colors ${
              selectedPersona ? 'bg-[#6D4CFF10] border-[#6D4CFF30] text-[#6D4CFF]' : 'text-gray-600 hover:bg-gray-100 border-gray-200'
            }`}
          ><Bot size={12} />{selectedPersona ? getPersona(selectedPersona)?.name || 'Persona' : 'Persona'}</button>
          <div className="relative">
            <button onClick={() => setShowLangPicker(!showLangPicker)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium text-gray-600 hover:bg-gray-100 border border-gray-200">
              <Globe size={12} />
              {languages.find(l => l.code === selectedLang)?.native || 'English'}
              <ChevronDown size={10} />
            </button>
            <AnimatePresence>
              {showLangPicker && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-1 min-w-[140px]">
                  {languages.map(lang => (
                    <button key={lang.code} onClick={() => { setSelectedLang(lang.code); setShowLangPicker(false); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${selectedLang === lang.code ? 'bg-[#6D4CFF10] text-[#6D4CFF] font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                    >{lang.native} <span className="text-[9px] text-gray-400">({lang.label})</span></button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative">
            <button onClick={() => setShowRolePicker(!showRolePicker)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium text-gray-600 hover:bg-gray-100 border border-gray-200">
              {(() => { const Icon = getRoleIcon(selectedRole); return <Icon size={12} style={{ color: getRoleColor(selectedRole) }} />; })()}
              {roles.find(r => r.key === selectedRole)?.label || 'Parent'}
              <ChevronDown size={10} />
            </button>
            <AnimatePresence>
              {showRolePicker && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                  className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-1 min-w-[150px]">
                  {roles.map(role => (
                    <button key={role.key} onClick={() => { setSelectedRole(role.key); setShowRolePicker(false); setMessages([]); setShowQuickActions(true); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 ${selectedRole === role.key ? 'bg-[#6D4CFF10] text-[#6D4CFF] font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                    ><role.icon size={12} style={{ color: role.color }} />{role.label}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {activeView === 'chat' && renderChatView()}
      {activeView === 'ptm' && renderPTMView()}
      {activeView === 'calls' && renderCallsView()}
      {activeView === 'analytics' && renderAnalyticsView()}
      {activeView === 'knowledge' && renderKnowledgeView()}

      <AnimatePresence>
        {showPersonaPanel && renderPersonaPanel()}
      </AnimatePresence>
    </div>
  );
}
