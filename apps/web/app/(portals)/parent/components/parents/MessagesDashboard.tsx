'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Send, Search, X, Bell, Sparkles, User,
  CheckCircle2, Clock, ChevronRight, MoreHorizontal, Phone,
  Mail, Star, Paperclip, Smile, Image, Shield, School,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface MessagesDashboardProps {
  messages: any[];
  teachers: any[];
  selectedTeacher: any;
  setSelectedTeacher: (t: any) => void;
  messageText: string;
  setMessageText: (t: string) => void;
  sendMessage: () => void;
  filteredTeachers: any[];
  uid: string;
  searchQuery?: string;
  refetchMessages: () => void;
  selectedChild: any;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

export function MessagesDashboard({
  messages, teachers, selectedTeacher, setSelectedTeacher,
  messageText, setMessageText, sendMessage, filteredTeachers,
  uid, searchQuery, refetchMessages, selectedChild,
}: MessagesDashboardProps) {
  const [searchTeacher, setSearchTeacher] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const effTeachers = useMemo(() => {
    if (teachers.length > 0) return teachers;
    return [];
  }, [teachers]);

  const effMessages = useMemo(() => {
    if (messages.length > 0) return messages;
    return [];
  }, [messages, selectedTeacher, uid]);

  const filteredTeacherList = useMemo(() => {
    if (!searchTeacher) return effTeachers;
    const q = searchTeacher.toLowerCase();
    return effTeachers.filter((t: any) =>
      t.full_name?.toLowerCase().includes(q) ||
      t.subject?.toLowerCase().includes(q) ||
      t.role?.toLowerCase().includes(q)
    );
  }, [effTeachers, searchTeacher]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [effMessages]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'away': return '#F59E0B';
      case 'offline': return '#94A3B8';
      default: return '#94A3B8';
    }
  };

  const handleQuickReply = (text: string) => {
    setMessageText(text);
    setShowQuickReplies(false);
    inputRef.current?.focus();
  };

  const onlineCount = effTeachers.filter((t: any) => t.status === 'online').length;

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">
      {/* ===== HERO ===== */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#6D4CFF] via-[#7C5CFF] to-[#4F2DB8]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(124,58,237,0.15)_0%,transparent_50%)]" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#A855F7]/15 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#6366F1]/15 rounded-full blur-[80px]" />
        <motion.div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full bg-white/10"
              animate={{ opacity: [0.1, 0.4, 0.1], y: [0, -(10 + (i % 3) * 8), 0], x: [0, (i % 2 === 0 ? 1 : -1) * 10, 0] }}
              transition={{ duration: 4 + (i % 3) * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
              style={{ width: `${2 + (i % 3) * 2}px`, height: `${2 + (i % 3) * 2}px`, top: `${10 + (i * 12) % 80}%`, left: `${5 + (i * 15) % 90}%` }} />
          ))}
        </motion.div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
                <MessageSquare className="w-3.5 h-3.5 text-purple-200" />
                <span className="text-[10px] font-semibold text-purple-100 uppercase tracking-wider">Messages</span>
              </div>
              {selectedChild && <Badge className="bg-white/20 text-white border-0 text-[10px]">{selectedChild.full_name}</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Parent-Teacher Communication</h1>
            <p className="text-sm text-white/80 mt-1 max-w-xl">Connect with teachers, discuss progress, and stay informed about your child's academic journey.</p>
            <div className="flex flex-wrap gap-3 mt-5">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <User className="w-4 h-4 text-[#10B981]" />
                <div><span className="text-[10px] text-purple-200/70 block">Teachers</span><span className="text-sm font-bold text-white">{effTeachers.length}</span></div>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <div><span className="text-[10px] text-purple-200/70 block">Online Now</span><span className="text-sm font-bold text-white">{onlineCount}</span></div>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <MessageSquare className="w-4 h-4 text-[#F59E0B]" />
                <div><span className="text-[10px] text-purple-200/70 block">Unread</span><span className="text-sm font-bold text-white">0</span></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== MAIN CHAT LAYOUT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* ===== TEACHERS SIDEBAR ===== */}
        <motion.div variants={fadeUp} className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Teachers</h2>
            <Badge className="text-[9px] bg-[#F3F0FF] text-[#6D4CFF] border-0">{effTeachers.length} contacts</Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" placeholder="Search teachers..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] transition-all"
              value={searchTeacher} onChange={e => setSearchTeacher(e.target.value)} />
          </div>
          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredTeacherList.map((t: any, i: number) => {
              const isActive = selectedTeacher?.user_id === t.user_id;
              return (
                <motion.button key={t.user_id || i} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTeacher(t)}
                  className={`w-full text-left p-3 rounded-xl text-sm flex items-center gap-3 transition-all border ${isActive ? 'bg-[#F3F0FF] border-[#6D4CFF]/30 text-[#6D4CFF]' : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'}`}>
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className={`text-[10px] font-bold ${isActive ? 'bg-[#6D4CFF] text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {t.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    {t.status && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                        style={{ background: getStatusColor(t.status) }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold truncate ${isActive ? 'text-[#6D4CFF]' : 'text-gray-800'}`}>{t.full_name || 'Teacher'}</div>
                    <div className={`text-[11px] ${isActive ? 'text-[#6D4CFF]/70' : 'text-gray-400'}`}>{t.subject || t.role || 'Teacher'}</div>
                  </div>
                  {t.status && (
                    <span className={`text-[9px] font-medium ${isActive ? 'text-[#6D4CFF]/70' : 'text-gray-400'}`}>
                      {t.status === 'online' ? '● Online' : t.status === 'away' ? '● Away' : ''}
                    </span>
                  )}
                </motion.button>
              );
            })}
            {filteredTeacherList.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">No teachers found</p>
                <p className="text-[10px] mt-0.5">Try a different search term</p>
              </div>
            )}
          </div>
          <Card className="p-3 bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] border-[rgba(109,76,255,0.15)]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#6D4CFF] flex-shrink-0" />
              <p className="text-[10px] text-gray-600">Quick tips: Use specific questions for faster teacher responses.</p>
            </div>
          </Card>
        </motion.div>

        {/* ===== CHAT AREA ===== */}
        <motion.div variants={fadeUp} className="flex flex-col">
          {selectedTeacher ? (
            <Card className="flex flex-col flex-1 overflow-hidden border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedTeacher.avatar_url} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white font-bold">
                        {selectedTeacher.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    {selectedTeacher.status && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                        style={{ background: getStatusColor(selectedTeacher.status) }} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{selectedTeacher.full_name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400">{selectedTeacher.subject || selectedTeacher.role}</span>
                      {selectedTeacher.status && (
                        <span className={`text-[10px] font-medium ${selectedTeacher.status === 'online' ? 'text-[#10B981]' : selectedTeacher.status === 'away' ? 'text-[#F59E0B]' : 'text-gray-400'}`}>
                          {selectedTeacher.status === 'online' ? '● Online' : selectedTeacher.status === 'away' ? '● Away' : '● Offline'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[400px] max-h-[500px] bg-gray-50/50">
                {effMessages.length > 0 ? (
                  effMessages.map((m: any, i: number) => {
                    const isMine = m.sender_id === uid;
                    return (
                      <motion.div key={m.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${isMine ? 'order-2' : 'order-2'}`}>
                          <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                            isMine
                              ? 'bg-gradient-to-r from-[#6D4CFF] to-[#8B6FFF] text-white rounded-br-md shadow-[0_2px_8px_rgba(109,76,255,0.15)]'
                              : 'bg-white text-gray-800 rounded-bl-md shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                          </div>
                          <div className={`flex items-center gap-1.5 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <span className={`text-[10px] ${isMine ? 'text-gray-400' : 'text-gray-400'}`}>
                              {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                            {isMine && <CheckCircle2 className="w-3 h-3 text-[#10B981]" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-[#6D4CFF]" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700">Start a Conversation</p>
                      <p className="text-xs text-gray-400 mt-1 max-w-xs">Send a message to {selectedTeacher.full_name} about your child's progress or any concerns.</p>
                    </div>
                  </div>
                )}
                <div ref={msgEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="px-4 pb-1">
                {showQuickReplies && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    className="flex flex-wrap gap-1.5 mb-2">
                    {([] as any[]).map((text, i) => (
                      <button key={i} onClick={() => handleQuickReply(text)}
                        className="px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[10px] text-gray-500 hover:bg-[#F3F0FF] hover:text-[#6D4CFF] hover:border-[#6D4CFF]/20 transition-all whitespace-nowrap">
                        {text.length > 30 ? text.slice(0, 30) + '...' : text}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
                    onClick={() => setShowQuickReplies(!showQuickReplies)}>
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0"
                    onClick={() => toast.info('File attachment coming soon')}>
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input ref={inputRef} value={messageText} onChange={e => setMessageText(e.target.value)}
                    placeholder={`Message ${selectedTeacher.full_name?.split(' ')[0] || 'teacher'}...`}
                    className="flex-1 rounded-xl bg-gray-50 border-gray-200 text-sm h-10 focus:bg-white"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                    }} />
                  <Button onClick={sendMessage} disabled={!messageText.trim()}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_16px_rgba(109,76,255,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_12px_rgba(109,76,255,0.3)] p-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex items-center justify-center min-h-[500px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-[#6D4CFF]" />
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">Select a Teacher</h2>
                <p className="text-sm text-gray-400 mb-6">Choose a teacher from the sidebar to start a conversation. You can discuss academic progress, ask questions, or share concerns.</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Check Progress', desc: 'Ask about academic performance' },
                    { label: 'Ask Questions', desc: 'Get homework or syllabus help' },
                    { label: 'Schedule Meeting', desc: 'Book a parent-teacher meeting' },
                    { label: 'Share Feedback', desc: 'Share your thoughts or concerns' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-left">
                      <p className="text-[11px] font-semibold text-gray-700">{item.label}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </div>

      {/* ===== BOTTOM STATS BAR ===== */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: MessageSquare, label: 'Total Messages', value: `${effMessages.length}`, desc: 'In Current Chat', color: '#6D4CFF', bg: '#F3F0FF' },
          { icon: User, label: 'Available Teachers', value: `${onlineCount}`, desc: `${effTeachers.length - onlineCount} offline`, color: '#10B981', bg: '#F0FDF4' },
          { icon: Clock, label: 'Avg Response', value: '~2h', desc: 'During School Hours', color: '#F59E0B', bg: '#FFFBEB' },
          { icon: School, label: 'Subjects Covered', value: `${new Set(effTeachers.map((t: any) => t.subject).filter(Boolean)).size}`, desc: 'All Core Subjects', color: '#3B82F6', bg: '#EFF6FF' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={i} whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#6D4CFF]/20 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: item.bg, color: item.color }}><Icon className="w-4.5 h-4.5" /></div>
                <div>
                  <div className="text-lg font-extrabold text-gray-900">{item.value}</div>
                  <div className="text-[11px] text-gray-400">{item.label}</div>
                  <div className="text-[9px]" style={{ color: item.color }}>{item.desc}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
