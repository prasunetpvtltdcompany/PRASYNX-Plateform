'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Send, Search, User, Clock, Briefcase,
  Paperclip, CheckCheck, ChevronRight,
} from 'lucide-react';
import apiClient from '../../lib/apiClient';

export default function MessagesTab({ provider }: { provider: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient.get<any[]>('/job-provider/messages').then(r => {
      if (r.success) setMessages(r.data || []);
      setLoading(false);
    });
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !selectedApp) return;
    const r = await apiClient.post('/job-provider/messages', {
      application_id: selectedApp,
      message: input.trim(),
    });
    if (r.success) {
      setMessages(prev => [r.data, ...prev]);
      setInput('');
    }
  };

  const conversations = messages.reduce((acc: any[], m: any) => {
    const appId = m.application_id;
    const existing = acc.find((a: any) => a.application_id === appId);
    if (!existing) acc.push({ application_id: appId, applicant_name: m.part_time_job_applications?.applicant_name || 'Unknown', lastMessage: m.message, time: m.created_at, count: 1 });
    else { existing.count++; existing.lastMessage = m.message; existing.time = m.created_at; }
    return acc;
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" /></div>;

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-180px)] flex gap-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-3 border-b border-gray-100">
          <h3 className="text-sm font-bold mb-2">Conversations</h3>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search messages..." className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-xs">No conversations yet</div>
          ) : conversations.map((conv: any) => (
            <button key={conv.application_id} onClick={() => setSelectedApp(conv.application_id)}
              className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedApp === conv.application_id ? 'bg-purple-50' : ''}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-500 flex-shrink-0">
                  {conv.applicant_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{conv.applicant_name}</div>
                  <div className="text-[9px] text-gray-400 truncate">{conv.lastMessage}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[8px] text-gray-400">{conv.time ? new Date(conv.time).toLocaleDateString() : ''}</div>
                  <div className="w-4 h-4 rounded-full bg-[#6D4CFF] text-white text-[7px] font-bold flex items-center justify-center ml-auto mt-0.5">{conv.count}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedApp ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.filter(m => m.application_id === selectedApp).map((m: any, i: number) => (
                <div key={i} className={`flex gap-2 ${m.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                  {m.direction !== 'outbound' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[7px] font-bold text-gray-500 flex-shrink-0 mt-1">
                      {m.part_time_job_applications?.applicant_name?.[0] || '?'}
                    </div>
                  )}
                  <div className={`max-w-[70%] px-3 py-2 rounded-xl text-[11px] ${m.direction === 'outbound' ? 'bg-[#6D4CFF] text-white rounded-tr-sm' : 'bg-gray-100 text-gray-700 rounded-tl-sm'}`}>
                    {m.message}
                    <div className={`text-[8px] mt-1 ${m.direction === 'outbound' ? 'text-white/60' : 'text-gray-400'}`}>
                      {m.created_at ? new Date(m.created_at).toLocaleTimeString() : ''}
                    </div>
                  </div>
                  {m.direction === 'outbound' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-[7px] font-bold text-white flex-shrink-0 mt-1">P</div>
                  )}
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><Paperclip size={16} /></button>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..." className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" />
                <button onClick={sendMessage} disabled={!input.trim()}
                  className="p-2 rounded-xl bg-[#6D4CFF] text-white hover:bg-[#5a3ed9] disabled:opacity-50 transition-all">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm">Select a conversation</p>
              <p className="text-xs mt-1">Choose a thread from the left to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
