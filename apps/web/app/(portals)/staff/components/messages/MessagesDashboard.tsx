'use client';

import { useState, useMemo, useEffect, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import {
  School, Users, BookOpen, ClipboardList, TrendingUp, Clock, CheckCircle2,
  AlertCircle, Award, Bell, Plus, CalendarDays, Target, Star, Sparkles,
  ChevronRight, Download, MessageSquare, FileText, BarChart3, ArrowUpRight,
  Search, X, User, GraduationCap, Lightbulb, Zap, BrainCircuit,
  Mail, Phone, MapPin, Settings, Eye, Edit3, Filter, MoreHorizontal,
  QrCode, Camera, Fingerprint, Activity, PieChart as PieChartIcon,
  LineChart, Gift, HelpCircle, Moon, Sun, Globe, BookMarked, Send,
  Trash2, RefreshCw, Timer, ListChecks, Trophy, Medal, Percent,
  Video, Image, Paperclip, Smile, Mic, Hash, UsersRound, Volume2,
  Pin, Reply, Forward, Flag, Ban, Archive,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Input } from '@/components/ui/input';

const PCOLORS = { primary: '#7C3AED', secondary: '#8B5CF6', tertiary: '#6366F1', success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };

interface MessagesDashboardProps {
  conversationsHook: any;
  conversations: any[];
  students: any[];
  setActiveTab: (tab: string) => void;
  darkMode?: boolean;
}

export function MessagesDashboard({ conversationsHook, conversations, students, setActiveTab, darkMode }: MessagesDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'chats' | 'groups' | 'broadcast'>('chats');

  const effectiveConversations = useMemo(() => {
    if (Array.isArray(conversations) && conversations.length > 0) return conversations;
    return [];
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const filteredContacts = useMemo(() => {
    let result = effectiveConversations;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c: any) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.role || '').toLowerCase().includes(q) ||
        (c.class || '').toLowerCase().includes(q)
      );
    }
    if (filterType !== 'all') {
      result = result.filter((c: any) => (c.role || '').toLowerCase() === filterType.toLowerCase());
    }
    return result;
  }, [effectiveConversations, searchQuery, filterType]);

  const openChat = (contact: any) => {
    setSelectedContact(contact);
    setChatMessages([]);
  };

  const sendMessage = () => {
    if (!messageText.trim()) return;
    const newMsg = {
      id: `m${Date.now()}`,
      senderId: 'me',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    setChatMessages(prev => [...prev, newMsg]);
    setMessageText('');
  };

  const contactStatus = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-300';
      case 'group': return 'bg-[#7C3AED]';
      default: return 'bg-gray-300';
    }
  };

  const unreadTotal = effectiveConversations.reduce((s: number, c: any) => s + (c.unread || 0), 0);

  const SectionCard = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
    <Card className={`p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );

  return (
    <div className="space-y-6 overflow-x-hidden max-w-full">
      {/* ===== HERO ===== */}
      <motion.div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] p-6 md:p-8">
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
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-200">Communication Center</div>
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Messages</h1>
              </div>
            </div>
            <p className="text-sm text-purple-100/90 mt-2 max-w-xl leading-relaxed">
              Connect and collaborate with students, parents, teachers, and staff in real-time.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { icon: UsersRound, value: '1,248', label: 'Active Contacts', color: '#A855F7' },
                { icon: MessageSquare, value: '3,842', label: 'Messages This Month', color: '#3B82F6' },
                { icon: Mail, value: unreadTotal, label: 'Unread', color: '#F59E0B' },
                { icon: Users, value: '178', label: 'Online Now', color: '#10B981' },
              ].map((stat, i) => (
                <motion.div key={i} whileHover={{ scale: 1.03, y: -2 }} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon size={14} className="text-white/80" />
                    <span className="text-[10px] font-medium text-purple-200/80">{stat.label}</span>
                  </div>
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#7C3AED] hover:bg-white/95 font-bold rounded-xl text-xs h-10 shadow-lg border-0 transition-all"
            ><Plus size={16} /> New Message</motion.button>
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-10 border border-white/25 backdrop-blur-sm transition-all"
            ><UsersRound size={16} /> Create Group</motion.button>
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-10 border border-white/25 backdrop-blur-sm transition-all"
            ><Volume2 size={16} /> Broadcast</motion.button>
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-10 border border-white/25 backdrop-blur-sm transition-all"
            ><Sparkles size={16} /> AI Assistant</motion.button>
          </div>
        </div>
      </motion.div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {([] as any[]).map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: kpi.bg, color: kpi.color }}><kpi.icon size={22} /></div>
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{kpi.value}</div>
            <div className="text-xs font-medium text-gray-500 mt-0.5">{kpi.label}</div>
            <div className="text-[9px] mt-1 font-medium" style={{ color: kpi.color }}>{kpi.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ===== TABS ===== */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
        {[
          { key: 'chats', label: 'Chats', icon: MessageSquare },
          { key: 'groups', label: 'Groups', icon: UsersRound },
          { key: 'broadcast', label: 'Broadcast', icon: Volume2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setSelectedTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${selectedTab === tab.key ? 'bg-[#7C3AED] text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            ><Icon size={15} />{tab.label}</button>
          );
        })}
      </div>

      {/* ===== CHATS TAB ===== */}
      {selectedTab === 'chats' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT - Contacts (25%) */}
          <div className="lg:col-span-1">
            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search contacts..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 bg-white" />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {['all', 'student', 'parent', 'teacher', 'group'].map(f => (
                    <button key={f} onClick={() => setFilterType(f)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-semibold transition-all ${filterType === f ? 'bg-[#7C3AED] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}{f === 'group' ? 's' : ''}</button>
                  ))}
                </div>
              </div>
              <div className="overflow-y-auto max-h-[600px]">
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare size={24} className="mx-auto mb-2 text-gray-200" />
                    <p className="text-xs text-gray-400">No contacts found</p>
                  </div>
                ) : filteredContacts.map((contact: any) => (
                  <button key={contact.id} onClick={() => openChat(contact)}
                    className={`w-full text-left p-3.5 flex items-center gap-3 transition-all border-b border-gray-50 hover:bg-gray-50 ${selectedContact?.id === contact.id ? 'bg-[#F3F0FF] border-l-2 border-l-[#7C3AED]' : ''}`}>
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className={`text-xs font-bold ${contact.role === 'Group' ? 'bg-[#F3F0FF] text-[#7C3AED]' : 'bg-gradient-to-br from-[#7C3AED] to-[#6366F1] text-white'}`}>
                          {contact.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {contact.status !== 'group' && (
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${contactStatus(contact.status)}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-900 truncate">{contact.name}</span>
                        <span className="text-[9px] text-gray-400 flex-shrink-0">{contact.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] text-gray-400">{contact.role}</span>
                        {contact.class && <><span className="text-gray-300">•</span><span className="text-[9px] text-gray-400">{contact.class}</span></>}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] text-gray-500 truncate max-w-[100px] sm:max-w-[140px]">{contact.lastMessage}</span>
                        {contact.unread > 0 && (
                          <span className="w-4 h-4 rounded-full bg-[#7C3AED] text-white text-[7px] font-bold flex items-center justify-center flex-shrink-0">{contact.unread}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* RIGHT - Chat Area (75%) */}
          <div className="lg:col-span-3">
            {selectedContact ? (
              <Card className="p-0 overflow-hidden flex flex-col h-[650px]">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-[#7C3AED] to-[#6366F1] text-white">
                        {selectedContact.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{selectedContact.name}</h3>
                      <div className="flex items-center gap-1.5">
                        {selectedContact.status !== 'group' && (
                          <div className={`w-2 h-2 rounded-full ${contactStatus(selectedContact.status)}`} />
                        )}
                        <span className="text-[10px] text-gray-400">
                          {selectedContact.status === 'online' ? 'Online' : selectedContact.status === 'away' ? 'Away' : selectedContact.status === 'group' ? `${selectedContact.class}` : 'Offline'}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-[10px] text-gray-400">{selectedContact.role}</span>
                        {selectedContact.class && <><span className="text-gray-300">•</span><span className="text-[10px] text-gray-400">{selectedContact.class}</span></>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><Phone size={16} /></button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><Video size={16} /></button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><Search size={16} /></button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><MoreHorizontal size={16} /></button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-1 bg-[#FAFBFC]">
                  {chatMessages.map((msg, i) => {
                    const isMe = msg.senderId === 'me';
                    const isSystem = msg.senderId === 'system';
                    const showAvatar = i === 0 || chatMessages[i - 1]?.senderId !== msg.senderId;
                    return isSystem ? (
                      <div key={msg.id} className="flex justify-center my-3">
                        <div className="px-4 py-2 rounded-full bg-gray-100 text-[10px] text-gray-500 font-medium">{msg.text}</div>
                      </div>
                    ) : (
                      <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-0.5'}`}>
                        {!isMe && showAvatar && (
                          <Avatar className="w-7 h-7 flex-shrink-0 mb-1">
                            <AvatarFallback className="text-[7px] bg-[#F3F0FF] text-[#7C3AED] font-bold">
                              {selectedContact.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {!isMe && !showAvatar && <div className="w-7 flex-shrink-0" />}
                        <div className={`max-w-[85%] sm:max-w-[75%] ${isMe ? 'order-1' : 'order-2'}`}>
                          <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${isMe ? 'bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white rounded-br-md' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md shadow-sm'}`}>
                            {msg.text}
                          </div>
                          <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'} px-1`}>
                            <span className="text-[8px] text-gray-400">{msg.time}</span>
                            {isMe && (
                              <span className={`text-[8px] ${msg.status === 'read' ? 'text-blue-400' : msg.status === 'delivered' ? 'text-gray-400' : 'text-gray-300'}`}>
                                {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                        {isMe && showAvatar && (
                          <Avatar className="w-7 h-7 flex-shrink-0 mb-1">
                            <AvatarFallback className="text-[7px] bg-[#7C3AED] text-white font-bold">ME</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><Paperclip size={16} /></button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><Smile size={16} /></button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><Mic size={16} /></button>
                    <input type="text" value={messageText} onChange={e => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10"
                      onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                    <button onClick={sendMessage} disabled={!messageText.trim()}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white hover:shadow-lg transition-all disabled:opacity-50">
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-[650px] bg-white rounded-2xl border border-gray-100">
                <div className="text-center">
                  <MessageSquare size={48} className="mx-auto mb-3 text-gray-200" />
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Select a Conversation</h3>
                  <p className="text-sm text-gray-400">Choose a contact to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== GROUPS TAB ===== */}
      {selectedTab === 'groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Groups</h3>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#7C3AED] text-white text-[9px] font-semibold hover:bg-[#6D28D9] transition-all">
                  <Plus size={12} /> New
                </button>
              </div>
              <div className="space-y-1">
                {([] as any[]).map((g: any) => (
                  <button key={g.id}
                    className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F3F0FF] flex items-center justify-center text-[#7C3AED]">
                      <UsersRound size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-900 truncate">{g.name}</span>
                        {g.unread > 0 && (
                          <span className="w-4 h-4 rounded-full bg-[#7C3AED] text-white text-[7px] font-bold flex items-center justify-center">{g.unread}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9px] text-gray-400">{g.members} members</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-[9px] text-gray-400">{g.lastActive}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
          <div className="lg:col-span-3">
            <SectionCard title="Group Communication" subtitle="Collaborate with teams and classes">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {([] as any[]).map((g: any) => (
                  <motion.div key={g.id} whileHover={{ y: -2 }}
                    className="p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white">
                        <UsersRound size={22} />
                      </div>
                      {g.unread > 0 && (
                        <Badge className="bg-[#7C3AED] text-white border-0 text-[9px]">{g.unread} new</Badge>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">{g.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-3">
                      <Users size={12} /> {g.members} members • {g.lastActive}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {['Chat', 'Files', 'Polls'].map((feat) => (
                        <span key={feat} className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-500 text-[8px] font-medium">{feat}</span>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <button className="flex-1 py-2 rounded-lg bg-[#F3F0FF] text-[#7C3AED] text-[10px] font-semibold hover:bg-[#EDE9FE] transition-all">Open Chat</button>
                      <button className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-600 text-[10px] font-semibold hover:bg-gray-100 transition-all">Members</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* ===== BROADCAST TAB ===== */}
      {selectedTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-4">New Broadcast</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Send To</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:border-[#7C3AED]">
                    <option>All Students</option>
                    <option>Selected Classes</option>
                    <option>All Parents</option>
                    <option>All Teachers</option>
                    <option>All Staff</option>
                    <option>Entire School</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Title</label>
                  <input type="text" placeholder="Broadcast title" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7C3AED] bg-white" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Message</label>
                  <textarea placeholder="Write your broadcast message..." rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7C3AED] bg-white resize-none" />
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-[9px] font-medium hover:bg-gray-200 transition-all"><Paperclip size={12} /> Attach</button>
                  <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-[9px] font-medium hover:bg-gray-200 transition-all"><CalendarDays size={12} /> Schedule</button>
                  <button className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-[9px] font-medium hover:bg-gray-200 transition-all"><Bell size={12} /> Priority</button>
                </div>
                <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white text-xs font-bold hover:shadow-lg transition-all flex items-center justify-center gap-1.5">
                  <Send size={14} /> Send Broadcast
                </button>
              </div>
            </Card>
          </div>
          <div className="lg:col-span-3">
            <SectionCard title="Broadcast History" subtitle="Previous announcements and their delivery status">
              <div className="space-y-4">
                {([] as any[]).map((b: any) => (
                  <div key={b.id} className="p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{b.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400">{b.sentTo}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-[10px] text-gray-400">{b.date}</span>
                        </div>
                      </div>
                      <Badge className={b.status === 'sent' ? 'bg-green-50 text-green-600 border-green-200 text-[9px]' : 'bg-yellow-50 text-yellow-600 border-yellow-200 text-[9px]'}>
                        {b.status === 'sent' ? 'Sent' : 'Scheduled'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Delivered', value: b.stats.delivered, color: '#10B981' },
                        { label: 'Read', value: b.stats.read, color: '#7C3AED' },
                        { label: 'Pending', value: b.stats.pending, color: '#F59E0B' },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center p-3 rounded-xl bg-gray-50">
                          <div className="text-lg font-extrabold text-gray-900">{stat.value}</div>
                          <div className="text-[9px] font-medium" style={{ color: stat.color }}>{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                        {[
                          { value: (b.stats.delivered / (b.stats.delivered + b.stats.pending)) * 100, color: '#10B981' },
                          { value: (b.stats.read / (b.stats.delivered + b.stats.pending)) * 100, color: '#7C3AED' },
                        ].map((seg, si) => (
                          <div key={si} className="h-full" style={{ width: `${Math.min(seg.value, 100)}%`, background: seg.color }} />
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[9px] text-gray-400">Delivered</span></div>
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#7C3AED]" /><span className="text-[9px] text-gray-400">Read</span></div>
                        </div>
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Eye size={13} /></button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><BarChart3 size={13} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* ===== PRERANA AI SIDEBAR ===== */}
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
        className="bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] rounded-2xl p-5 text-white overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Sparkles size={18} className="text-purple-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Prerana AI</h3>
              <p className="text-[10px] text-purple-200/80">Communication Assistant</p>
            </div>
          </div>
          <p className="text-xs text-purple-100/90 mb-4 leading-relaxed">
            Hello Teacher 👋 I can help draft messages, respond to parents, summarize conversations, and generate announcements.
          </p>
          <div className="grid grid-cols-2 gap-1.5 mb-4">
            {[
              { label: 'Draft Parent Message', icon: MessageSquare },
              { label: 'Generate Announcement', icon: Volume2 },
              { label: 'Summarize Chat', icon: FileText },
              { label: 'Translate Message', icon: Globe },
              { label: 'Meeting Invitation', icon: CalendarDays },
              { label: 'Academic Feedback', icon: Award },
            ].map((sugg, si) => (
              <button key={si}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white/10 border border-white/10 text-[10px] text-white hover:bg-white/20 transition-all"
              ><sugg.icon size={13} /><span>{sugg.label}</span></button>
            ))}
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
              <input type="text" placeholder="Ask AI about messaging..." className="flex-1 bg-transparent border-0 text-xs text-white placeholder-purple-200/60 focus:outline-none" />
              <button className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"><Send size={12} /></button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
