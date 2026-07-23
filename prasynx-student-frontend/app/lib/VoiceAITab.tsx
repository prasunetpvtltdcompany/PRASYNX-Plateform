'use client';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Mic, MicOff, Send, Bot, User, MessageSquare, AlertCircle,
  CalendarDays, TicketCheck, Briefcase, Phone,
  Loader2, FileText, PhoneOff, Speaker,
  Heart, Award,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const VOICE_API = process.env.NEXT_PUBLIC_VOICE_API_URL || 'http://localhost:4007/api/voice';

interface Message { role: 'user' | 'assistant' | 'system'; content: string; timestamp: Date; }

const quickActions = [
  { label: 'Register Complaint', icon: AlertCircle, intent: 'complaint', color: 'text-red-500' },
  { label: 'Meet Counselor', icon: CalendarDays, intent: 'appointment', color: 'text-blue-500' },
  { label: 'Support Ticket', icon: TicketCheck, intent: 'ticket', color: 'text-purple-500' },
  { label: 'My Grades', icon: Award, intent: 'info', color: 'text-yellow-500' },
  { label: 'Find Part-Time Job', icon: Briefcase, intent: 'job', color: 'text-green-500' },
  { label: 'Health Issue', icon: Heart, intent: 'notification', color: 'text-pink-500' },
];

function speakText(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1; utterance.pitch = 1; utterance.volume = 1; utterance.lang = 'en-US';
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.name.includes('Google US') || v.name.includes('Samantha') || v.name.includes('Female'));
  if (preferred) utterance.voice = preferred;
  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() { if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel(); }

export default function VoiceAITab() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hello! I'm Prasunet AI Voice Assistant. I can help you with complaints, counselor appointments, support tickets, grade inquiries, part-time jobs, and health concerns. How can I assist you today?",
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'chat' | 'history'>('chat');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeakingState] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callActive, setCallActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === 'assistant' && last !== messages[0]) {
        speakText(last.content, () => setIsSpeakingState(false));
        setIsSpeakingState(true);
      }
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; recognitionRef.current.interimResults = false; recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript; setInput(transcript); setIsListening(false);
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

  const startCall = useCallback(async () => {
    try {
      const res = await fetch(`${VOICE_API}/incoming-call`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'student-portal', callerName: 'Student', callerRole: 'student' }),
      });
      const data = await res.json();
      if (data.success && data.data?.call?.id) { setCallId(data.data.call.id); setCallActive(true); }
    } catch {}
  }, []);

  useEffect(() => {
    startCall();
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setTimeout(() => { speakText(messages[0].content, () => setIsSpeakingState(false)); setIsSpeakingState(true); }, 500);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    if (recognitionRef.current) { try { recognitionRef.current.start(); setIsListening(true); } catch {} }
  };

  const handleSend = async (text?: string) => {
    const message = (text || input).trim();
    if (!message || isProcessing) return;
    setInput(''); setMessages(prev => [...prev, { role: 'user', content: message, timestamp: new Date() }]);
    setIsProcessing(true);
    try {
      let currentCallId = callId;
      if (!currentCallId) {
        const callRes = await fetch(`${VOICE_API}/incoming-call`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: 'student-portal', callerName: 'Student', callerRole: 'student' }),
        });
        const callData = await callRes.json();
        if (callData.success && callData.data?.call?.id) { currentCallId = callData.data.call.id; setCallId(currentCallId); setCallActive(true); }
      }
      const res = await fetch(`${VOICE_API}/process`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: currentCallId, message }),
      });
      const data = await res.json();
      if (data.success && data.data?.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.data.reply, timestamp: new Date() }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I couldn't process that. Please try again.", timestamp: new Date() }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please check that the Voice AI service is running.', timestamp: new Date() }]);
    } finally { setIsProcessing(false); }
  };

  const handleQuickAction = async (intent: string) => {
    const labels: Record<string, string> = {
      complaint: 'register a complaint', appointment: 'schedule a meeting with a counselor',
      ticket: 'create a support ticket', info: 'check my grades',
      job: 'find a part-time job', notification: 'report a health issue',
    };
    await handleSend(`I want to ${labels[intent] || 'talk to an assistant'}`);
  };

  const endCall = async () => {
    stopSpeaking();
    if (callId) await fetch(`${VOICE_API}/calls/${callId}/end`, { method: 'POST' }).catch(() => {});
    setCallActive(false); setCallDuration(0);
    setMessages([{ role: 'assistant', content: 'Call ended. Thank you for using Prasunet AI Voice Assistant!', timestamp: new Date() }]);
  };

  const formatDuration = (secs: number) => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-white">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${callActive ? 'bg-green-100' : 'bg-gray-100'}`}>
          <Phone size={14} className={callActive ? 'text-green-600' : 'text-gray-400'} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold flex items-center gap-2">AI Voice Assistant
            {callActive && <span className="text-[10px] font-mono text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{formatDuration(callDuration)}</span>}
          </div>
          <div className="text-[10px] text-gray-400">Student Portal</div>
        </div>
        <div className="flex items-center gap-1">
          {isSpeaking && <button onClick={() => { stopSpeaking(); setIsSpeakingState(false); }} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Speaker size={14} /></button>}
          {callActive && <button onClick={endCall} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><PhoneOff size={14} /></button>}
          <Badge variant="default" className={`text-[10px] gap-1 ${callActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full inline-block ${callActive ? 'bg-green-500' : 'bg-gray-300'}`} />{callActive ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </div>

      <div className="flex border-b border-gray-200 bg-white px-3">
        {[{ key: 'chat', label: 'Chat', icon: MessageSquare }, { key: 'history', label: 'History', icon: FileText }].map(view => (
          <button key={view.key} onClick={() => setActiveView(view.key as typeof activeView)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${activeView === view.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          ><view.icon size={12} />{view.label}</button>
        ))}
      </div>

      {activeView === 'chat' ? (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1"><Bot size={14} className="text-primary" /></div>}
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>{msg.content}</div>
                {msg.role === 'user' && <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1"><User size={14} className="text-gray-600" /></div>}
              </motion.div>
            ))}
            {isProcessing && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center"><Bot size={14} className="text-primary" /></div>
                <div className="bg-gray-100 px-3 py-2 rounded-xl rounded-tl-sm flex items-center gap-2"><Loader2 size={14} className="animate-spin text-gray-400" />{isSpeaking && <span className="text-xs text-gray-400">Speaking...</span>}</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="px-4 py-2 border-t border-gray-100">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {quickActions.map(action => (
                <button key={action.intent} onClick={() => handleQuickAction(action.intent)} disabled={isProcessing || !callActive}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors disabled:opacity-50"
                ><action.icon size={12} className={action.color} />{action.label}</button>
              ))}
            </div>
          </div>
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <button onClick={toggleListening} disabled={!callActive}
                className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} disabled:opacity-50`}
              >{isListening ? <MicOff size={16} /> : <Mic size={16} />}</button>
              <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? 'Listening...' : 'Type your message...'} disabled={isProcessing || !callActive}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
              />
              <button onClick={() => handleSend()} disabled={!input.trim() || isProcessing || !callActive}
                className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              ><Send size={16} /></button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-4">
          <div className="text-center text-gray-400 py-12">
            <FileText size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">Call History</p><p className="text-xs mt-1">Your call transcripts will appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
