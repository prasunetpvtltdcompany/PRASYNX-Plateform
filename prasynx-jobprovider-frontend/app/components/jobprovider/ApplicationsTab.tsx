'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, Eye, UserCheck, X, Video, Award,
  Clock, Mail, Phone, MapPin, ChevronDown, Download,
  Briefcase, CalendarDays, ThumbsUp, MessageSquare,
} from 'lucide-react';
import apiClient from '../../lib/apiClient';

const statusColors: Record<string, string> = {
  pending: '#F59E0B', shortlisted: '#A855F7', interview: '#3B82F6',
  hired: '#22C55E', rejected: '#EF4444',
};

export default function ApplicationsTab({ provider }: { provider: any }) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<any>(null);

  const load = () => {
    setLoading(true);
    const ep = filter === 'all' ? '/job-provider/applications' : `/job-provider/applications?status=${filter}`;
    apiClient.get<any[]>(ep).then(r => {
      if (r.success) setApps(r.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [filter]);

  const filtered = apps.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (a.applicant_name || '').toLowerCase().includes(q)
      || (a.applicant_email || '').toLowerCase().includes(q)
      || (a.part_time_jobs?.title || '').toLowerCase().includes(q);
  });

  const updateStatus = async (id: string, status: string) => {
    const r = await apiClient.patch(`/job-provider/applications/${id}/status`, { status });
    if (r.success) { load(); setSelectedApp(null); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" /></div>;

  return (
    <div className="max-w-[1600px] mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Applications</h1>
          <p className="text-xs text-gray-400">{filtered.length} application{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applicants..." className="w-full sm:w-56 pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF] bg-white">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50"><Download size={16} /></button>
        </div>
      </div>

      {selectedApp ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-bold text-sm">Application Details</h3>
            <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
                  {(selectedApp.applicant_name || '?')[0]}
                </div>
                <div>
                  <div className="font-bold text-base">{selectedApp.applicant_name}</div>
                  <div className="text-xs text-gray-400">{selectedApp.applicant_role || 'Applicant'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1"><Mail size={12} /> Email</div>
                  <div className="text-xs font-medium">{selectedApp.applicant_email}</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1"><Phone size={12} /> Phone</div>
                  <div className="text-xs font-medium">{selectedApp.applicant_phone || 'N/A'}</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1"><Briefcase size={12} /> Applied for</div>
                <div className="text-xs font-medium">{selectedApp.part_time_jobs?.title || 'Unknown'}</div>
              </div>
              {selectedApp.cover_note && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                  <div className="text-[10px] text-purple-500 font-semibold mb-1">Cover Note</div>
                  <div className="text-xs text-purple-700 italic">"{selectedApp.cover_note}"</div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-xs font-semibold text-gray-600 mb-2">Current Status</div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold"
                  style={{ background: `${statusColors[selectedApp.status] || '#6B7280'}15`, color: statusColors[selectedApp.status] || '#6B7280' }}>
                  <Clock size={10} /> {selectedApp.status}
                </span>
                <div className="mt-2 text-[10px] text-gray-400">Applied {selectedApp.created_at ? new Date(selectedApp.created_at).toLocaleDateString() : 'N/A'}</div>
              </div>
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Update Status</div>
                {['shortlisted', 'interview', 'hired', 'rejected'].map(s => (
                  <button key={s} onClick={() => updateStatus(selectedApp.id, s)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50 transition-all disabled:opacity-30"
                    disabled={selectedApp.status === s}
                    style={selectedApp.status === s ? { background: `${statusColors[s]}15`, borderColor: statusColors[s], color: statusColors[s] } : {}}>
                    {s === 'shortlisted' && <UserCheck size={13} />}
                    {s === 'interview' && <Video size={13} />}
                    {s === 'hired' && <Award size={13} />}
                    {s === 'rejected' && <X size={13} />}
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
              <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF] text-xs font-semibold hover:bg-[#6D4CFF]/20 transition-all">
                <MessageSquare size={13} /> Send Message
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Applicant</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Job</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app: any) => (
                  <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-500">
                          {(app.applicant_name || '?')[0]}
                        </div>
                        <div>
                          <div className="text-xs font-semibold">{app.applicant_name}</div>
                          <div className="text-[9px] text-gray-400">{app.applicant_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{app.part_time_jobs?.title || '-'}</td>
                    <td className="px-4 py-3"><span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">{app.applicant_role || 'N/A'}</span></td>
                    <td className="px-4 py-3 text-gray-400">{app.created_at ? new Date(app.created_at).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
                        style={{ background: `${statusColors[app.status] || '#6B7280'}15`, color: statusColors[app.status] || '#6B7280' }}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelectedApp(app)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF] transition-all">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No applications found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
