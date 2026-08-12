'use client';

import { useState } from 'react';
import { useApi } from './useApi';
import { communicationApiV4 } from './dataService';
import { MessageSquare, Send, Megaphone, Bell, Search, RefreshCw, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

function DataTable({ columns, data, loading }: any) {
  if (loading) return <div className="text-center py-8 text-gray-400 text-xs">Loading...</div>;
  if (!data?.length) return <div className="text-center py-8 text-gray-400 text-xs">No records found</div>;
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-xs">
        <thead><tr className="bg-gray-50 border-b border-gray-100">
          {columns.map((col: any) => <th key={col.key} className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">{col.label}</th>)}
        </tr></thead>
        <tbody>
          {data.map((row: any, i: number) => <tr key={row.id || i} className="border-b border-gray-50 hover:bg-gray-50/50">
            {columns.map((col: any) => <td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">{col.render ? col.render(row) : row[col.key] ?? '-'}</td>)}
          </tr>)}
        </tbody>
      </table>
    </div>
  );
}

const MODES = [
  { key: 'logs', label: 'Audit Log', icon: BarChart3 },
  { key: 'notify', label: 'Send Notification', icon: Bell },
  { key: 'announce', label: 'Announcement', icon: Megaphone },
];

export default function CommunicationTab() {
  const [mode, setMode] = useState('logs');
  const [search, setSearch] = useState('');
  const [notifForm, setNotifForm] = useState({ user_id: '', title: '', message: '', type: 'info', sender_type: 'management' });
  const [announceForm, setAnnounceForm] = useState({ title: '', content: '', target_role: 'all', sender_type: 'management' });

  const logs = useApi(() => communicationApiV4.getLogs(), []);
  const stats = useApi(() => communicationApiV4.getStats(), []);

  const filter = (arr: any[]) => {
    if (!search) return arr;
    const q = search.toLowerCase();
    return arr.filter((r: any) => JSON.stringify(r).toLowerCase().includes(q));
  };

  const handleSendNotification = async () => {
    if (!notifForm.user_id || !notifForm.title || !notifForm.message) { toast.error('User ID, title, and message required'); return; }
    await communicationApiV4.sendNotification(notifForm);
    toast.success('Notification sent');
    logs.refetch(); stats.refetch();
    setNotifForm({ user_id: '', title: '', message: '', type: 'info', sender_type: 'management' });
  };

  const handleSendAnnouncement = async () => {
    if (!announceForm.title || !announceForm.content) { toast.error('Title and content required'); return; }
    await communicationApiV4.sendAnnouncement(announceForm);
    toast.success('Announcement sent');
    logs.refetch(); stats.refetch();
    setAnnounceForm({ title: '', content: '', target_role: 'all', sender_type: 'management' });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Communication</h2>
          <p className="text-xs text-gray-500">Send notifications, announcements, and view audit trail</p>
        </div>
        <button onClick={() => { logs.refetch(); stats.refetch(); }} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><RefreshCw size={16} /></button>
      </div>

      {stats.data && (
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
            <div className="text-2xl font-bold text-purple-700">{stats.data.total || 0}</div>
            <div className="text-[10px] text-purple-500 font-medium mt-1">Total Communications</div>
          </div>
          {Object.entries(stats.data.byChannel || {}).map(([ch, count]: any) => (
            <div key={ch} className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="text-2xl font-bold text-blue-700">{count}</div>
              <div className="text-[10px] text-blue-500 font-medium mt-1 capitalize">{ch}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 mb-6 p-1 bg-gray-50 rounded-xl w-fit">
        {MODES.map(n => (
          <button key={n.key} onClick={() => setMode(n.key)}
            className={`px-4 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${mode === n.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
            <n.icon size={12} className="inline mr-1.5" /> {n.label}
          </button>
        ))}
      </div>

      {mode === 'logs' && (
        <>
          <div className="relative max-w-xs mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
          </div>
          <DataTable
            columns={[
              { key: 'created_at', label: 'Time', render: (r: any) => r.created_at ? new Date(r.created_at).toLocaleString() : '-' },
              { key: 'channel', label: 'Channel', render: (r: any) => <Badge className="bg-blue-100 text-blue-700 capitalize">{r.channel}</Badge> },
              { key: 'subject', label: 'Subject' },
              { key: 'message', label: 'Message', render: (r: any) => <span className="text-gray-400 max-w-[200px] truncate block">{r.message}</span> },
              { key: 'sender_type', label: 'Sender' },
              { key: 'receiver_type', label: 'To' },
              { key: 'status', label: 'Status', render: (r: any) => <Badge className={r.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{r.status}</Badge> },
            ]}
            data={filter(logs.data || [])}
            loading={logs.loading}
          />
        </>
      )}

      {mode === 'notify' && (
        <div className="max-w-lg space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">User ID</label>
            <input value={notifForm.user_id} onChange={e => setNotifForm({ ...notifForm, user_id: e.target.value })} placeholder="UUID of target user" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Title</label>
            <input value={notifForm.title} onChange={e => setNotifForm({ ...notifForm, title: e.target.value })} placeholder="Notification title" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Message</label>
            <textarea value={notifForm.message} onChange={e => setNotifForm({ ...notifForm, message: e.target.value })} rows={3} placeholder="Notification message" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Type</label>
            <select value={notifForm.type} onChange={e => setNotifForm({ ...notifForm, type: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20">
              <option value="info">Info</option><option value="warning">Warning</option><option value="success">Success</option><option value="error">Error</option>
            </select>
          </div>
          <button onClick={handleSendNotification} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD]">
            <Send size={14} /> Send Notification
          </button>
        </div>
      )}

      {mode === 'announce' && (
        <div className="max-w-lg space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Title</label>
            <input value={announceForm.title} onChange={e => setAnnounceForm({ ...announceForm, title: e.target.value })} placeholder="Announcement title" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Content</label>
            <textarea value={announceForm.content} onChange={e => setAnnounceForm({ ...announceForm, content: e.target.value })} rows={5} placeholder="Announcement content" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Target Role</label>
            <select value={announceForm.target_role} onChange={e => setAnnounceForm({ ...announceForm, target_role: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20">
              <option value="all">All</option><option value="student">Students</option><option value="parent">Parents</option><option value="staff">Staff</option><option value="teacher">Teachers</option>
            </select>
          </div>
          <button onClick={handleSendAnnouncement} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5B3FDD]">
            <Megaphone size={14} /> Send Announcement
          </button>
        </div>
      )}
    </div>
  );
}
