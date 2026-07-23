'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, CalendarDays, Clock, Mail, Phone, Briefcase, X, CheckCircle, Award, MapPin, ExternalLink } from 'lucide-react';
import apiClient from '../../lib/apiClient';

export default function InterviewsTab({ provider }: { provider: any }) {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    apiClient.get<any[]>('/job-provider/applications/interviews').then(r => {
      if (r.success) setInterviews(r.data || []);
      setLoading(false);
    });
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const r = await apiClient.patch(`/job-provider/applications/${id}/status`, { status });
    if (r.success) load();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" /></div>;

  const upcoming = interviews.filter(i => i.status === 'interview');
  const past = interviews.filter(i => i.status !== 'interview');

  return (
    <div className="max-w-[1600px] mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Interviews</h1>
          <p className="text-xs text-gray-400">{upcoming.length} upcoming, {past.length} completed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Clock size={16} className="text-blue-500" /> Upcoming</h3>
          {upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
              <Video size={36} className="mx-auto text-gray-200 mb-2" />
              <p className="text-xs text-gray-400">No upcoming interviews</p>
            </div>
          ) : upcoming.map((c: any) => (
            <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center font-bold text-blue-600">
                  {(c.applicant_name || '?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold">{c.applicant_name}</div>
                  <div className="text-[10px] text-gray-400">{c.applicant_email}</div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                    <Briefcase size={10} /> {c.part_time_jobs?.title || 'N/A'}
                    {c.applicant_phone && <><span className="text-gray-300">|</span><Phone size={10} /> {c.applicant_phone}</>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateStatus(c.id, 'hired')} className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all" title="Hire"><Award size={14} /></button>
                  <button onClick={() => updateStatus(c.id, 'rejected')} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all" title="Reject"><X size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Completed</h3>
          {past.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
              <CalendarDays size={36} className="mx-auto text-gray-200 mb-2" />
              <p className="text-xs text-gray-400">No completed interviews</p>
            </div>
          ) : past.map((c: any) => (
            <div key={c.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-500">
                  {(c.applicant_name || '?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-500">{c.applicant_name}</div>
                  <div className="text-[10px] text-gray-400">{c.part_time_jobs?.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
