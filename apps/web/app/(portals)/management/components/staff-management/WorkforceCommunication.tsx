'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';
import { enterpriseStaffApi } from '../../lib/dataService';
import { useLanguage } from '../../language/LanguageProvider';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  MessageSquare, Bell, Megaphone, Send, Search, Users,
  Plus, X, CheckCircle2, Clock, AlertCircle, Mail, Share2,
} from 'lucide-react';
import { toast } from 'sonner';

const TABS = [
  { key: 'messages', labelKey: 'mod.messages', icon: MessageSquare },
  { key: 'announcements', labelKey: 'mod.announcements', icon: Megaphone },
  { key: 'broadcast', labelKey: 'mod.staffBroadcast', icon: Bell },
];

function KpiCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mb-2" style={{ background: bg, color }}><Icon size={18} /></div>
      <div className="text-[11px] text-gray-500 font-medium">{label}</div>
      <div className="text-xl font-extrabold text-gray-900 mt-0.5">{value ?? '—'}</div>
    </motion.div>
  );
}

export function WorkforceCommunication() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('messages');
  const [search, setSearch] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const messages = useApi(() => enterpriseStaffApi.getMessages(), []);
  const announcements = useApi(() => enterpriseStaffApi.getAnnouncements(), []);
  const directory = useApi(() => enterpriseStaffApi.getStaffDirectory(), []);

  const staffList = useMemo(() => {
    const raw = directory.data?.data || directory.data || [];
    return Array.isArray(raw) ? raw : [];
  }, [directory.data]);

  const msgList = useMemo(() => {
    let items = Array.isArray(messages.data?.data) ? messages.data.data : Array.isArray(messages.data) ? messages.data :
                Array.isArray(messages.data?.messages) ? messages.data.messages : [];
    if (search) items = items.filter((m: any) =>
      (m.subject || m.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.sender_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.content || '').toLowerCase().includes(search.toLowerCase())
    );
    return items;
  }, [messages.data, search]);

  const annList = useMemo(() => {
    let items = Array.isArray(announcements.data?.data) ? announcements.data.data : Array.isArray(announcements.data) ? announcements.data :
                Array.isArray(announcements.data?.announcements) ? announcements.data.announcements : [];
    if (search) items = items.filter((a: any) =>
      (a.title || a.subject || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.content || '').toLowerCase().includes(search.toLowerCase())
    );
    return items;
  }, [announcements.data, search]);

  const handleSend = async () => {
    try {
      const api = activeTab === 'announcements' ? enterpriseStaffApi.createAnnouncement : enterpriseStaffApi.sendMessage;
      const res = await api(formData);
      if (res.success) { toast.success(`${activeTab === 'announcements' ? 'Announcement' : 'Message'} sent`); setShowCompose(false); setFormData({}); messages.refetch(); announcements.refetch(); }
      else toast.error(res.error || 'Failed to send');
    } catch (err: any) { toast.error(err.message); }
  };

  if (messages.loading && announcements.loading) return <LoadingSkeleton rows={4} cols={4} />;

  return (
    <div className="w-full min-w-0">
      <div className="page-header">
        <h1>{t('mod.communicationCenter')}</h1>
        <p>Send messages, announcements, and broadcasts to all staff</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={MessageSquare} label={t('mod.messages')} value={msgList.length} color="#6D4CFF" bg="#F0EDFF" />
        <KpiCard icon={Megaphone} label={t('mod.announcements')} value={annList.length} color="#F59E0B" bg="#FFFBEB" />
        <KpiCard icon={Bell} label={t('mod.activeBroadcasts')} value={annList.filter((a: any) => (a.status || '').toLowerCase() === 'active').length} color="#3B82F6" bg="#EFF6FF" />
        <KpiCard icon={Users} label={t('mod.staffReach')} value={staffList.length} color="#10B981" bg="#ECFDF5" />
      </div>

      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search communications..." className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs w-48 focus:outline-none focus:border-[#6D4CFF]" />
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {TABS.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <tab.icon size={12} /> {t(tab.labelKey)}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setShowCompose(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all">
            <Plus size={14} /> {activeTab === 'announcements' ? 'New Announcement' : activeTab === 'broadcast' ? 'New Broadcast' : 'New Message'}
          </button>
        </div>
      </Card>

      {activeTab === 'messages' && (
        <div className="space-y-3">
          {msgList.length === 0 ? <EmptyState message="No messages found" /> :
            msgList.map((msg: any, i: number) => (
              <motion.div key={msg.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="rounded-xl p-4 border border-gray-100 bg-white hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#F0EDFF] flex items-center justify-center text-[#6D4CFF] font-bold text-xs flex-shrink-0">
                    {(msg.sender_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-gray-900">{msg.subject || msg.title || '(No Subject)'}</div>
                      <div className="text-[9px] text-gray-400">{msg.created_at ? new Date(msg.created_at).toLocaleDateString() : ''}</div>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">From: {msg.sender_name || msg.sender || 'System'}</div>
                    <div className="text-[10px] text-gray-500 mt-1.5 line-clamp-2">{msg.content || msg.message || ''}</div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="space-y-3">
          {annList.length === 0 ? <EmptyState message="No announcements found" /> :
            annList.map((ann: any, i: number) => (
              <motion.div key={ann.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="rounded-xl p-4 border border-gray-100 bg-white hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0"><Megaphone size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-gray-900">{ann.title || ann.subject || 'Announcement'}</div>
                      <Badge variant={(ann.status || 'active').toLowerCase() === 'active' ? 'success' : 'default'} className="text-[8px]">{ann.status || 'Active'}</Badge>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">By: {ann.created_by_name || ann.sender_name || 'Admin'} · {ann.created_at ? new Date(ann.created_at).toLocaleDateString() : ''}</div>
                    <div className="text-[10px] text-gray-500 mt-1.5 line-clamp-3">{ann.content || ann.message || ''}</div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}

      {activeTab === 'broadcast' && (
        <Card className="p-6 text-center">
          <Bell size={32} className="mx-auto mb-3 text-[#6D4CFF]" />
          <h3 className="font-bold text-sm mb-1">Staff Broadcast</h3>
          <p className="text-xs text-gray-400 mb-4">Send urgent notifications to all staff members simultaneously</p>
          <button onClick={() => { setFormData({ type: 'broadcast' }); setShowCompose(true); }} className="px-6 py-2.5 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all flex items-center gap-2 mx-auto"><Send size={14} /> Send Broadcast</button>
        </Card>
      )}

      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowCompose(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-sm capitalize">{activeTab === 'announcements' ? 'New Announcement' : activeTab === 'broadcast' ? 'Staff Broadcast' : 'New Message'}</h3>
              <button onClick={() => setShowCompose(false)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 text-lg">×</button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Subject</label><input value={formData.subject || formData.title || ''} onChange={e => setFormData({ ...formData, subject: e.target.value, title: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF]" /></div>
              {(activeTab === 'messages') && (
                <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Recipient</label>
                  <select value={formData.recipient_id || ''} onChange={e => setFormData({ ...formData, recipient_id: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs">
                    <option value="">Select staff</option>
                    {staffList.map((s: any) => <option key={s.id} value={s.id}>{s.full_name || s.name}</option>)}
                  </select>
                </div>
              )}
              <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Message</label><textarea value={formData.content || formData.message || ''} onChange={e => setFormData({ ...formData, content: e.target.value, message: e.target.value })} rows={5} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#6D4CFF]" /></div>
              <button onClick={handleSend} className="w-full py-2.5 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD] transition-all flex items-center justify-center gap-2"><Send size={14} /> Send</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
