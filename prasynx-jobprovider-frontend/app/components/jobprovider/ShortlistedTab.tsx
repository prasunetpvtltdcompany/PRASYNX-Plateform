'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserCheck, X, Video, Award, Mail, Phone, Briefcase, Star, CalendarDays, MessageSquare } from 'lucide-react';
import apiClient from '../../lib/apiClient';

export default function ShortlistedTab({ provider }: { provider: any }) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    apiClient.get<any[]>('/job-provider/applications/shortlisted').then(r => {
      if (r.success) setCandidates(r.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const r = await apiClient.patch(`/job-provider/applications/${id}/status`, { status });
    if (r.success) load();
  };

  const filtered = candidates.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.applicant_name || '').toLowerCase().includes(q) || (c.part_time_jobs?.title || '').toLowerCase().includes(q);
  });

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" /></div>;

  return (
    <div className="max-w-[1600px] mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Shortlisted Candidates</h1>
          <p className="text-xs text-gray-400">{filtered.length} candidate{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full sm:w-56 pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c: any) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center font-bold text-purple-600">
                {(c.applicant_name || '?')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold">{c.applicant_name}</div>
                <div className="text-[10px] text-gray-400">{c.applicant_email}</div>
              </div>
              <div className="flex gap-3 text-amber-400">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill={i <= 4 ? 'currentColor' : 'none'} />)}
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-3">
              <Briefcase size={11} /> {c.part_time_jobs?.title || 'N/A'}
              <span className="text-gray-300">|</span>
              <CalendarDays size={11} /> {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
            </div>
            {c.applicant_phone && (
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-3">
                <Phone size={10} /> {c.applicant_phone}
              </div>
            )}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <button onClick={() => updateStatus(c.id, 'interview')} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-semibold hover:bg-blue-100 transition-all">
                <Video size={12} /> Schedule Interview
              </button>
              <button onClick={() => updateStatus(c.id, 'rejected')} className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
            <UserCheck size={48} className="text-gray-200 mb-4" />
            <h3 className="font-bold text-gray-400">No shortlisted candidates</h3>
            <p className="text-xs mt-1">Shortlist applicants from the Applications tab</p>
          </div>
        )}
      </div>
    </div>
  );
}
