'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Mail, Phone, Briefcase, CalendarDays, Star, MapPin, Building2 } from 'lucide-react';
import apiClient from '../../lib/apiClient';

export default function HiredTab({ provider }: { provider: any }) {
  const [hired, setHired] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient.get<any[]>('/job-provider/applications/hired').then(r => {
      if (r.success) setHired(r.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" /></div>;

  return (
    <div className="max-w-[1600px] mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Hired Candidates</h1>
          <p className="text-xs text-gray-400">{hired.length} candidate{hired.length !== 1 ? 's' : ''} hired</p>
        </div>
      </div>

      {hired.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center shadow-sm">
          <Award size={56} className="mx-auto text-gray-200 mb-4" />
          <h3 className="font-bold text-gray-400 mb-1">No hires yet</h3>
          <p className="text-sm text-gray-400">Hired candidates will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {hired.map((c: any) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-green-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center font-bold text-green-600">
                  {(c.applicant_name || '?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold">{c.applicant_name}</div>
                  <div className="text-[10px] text-gray-400">{c.applicant_email}</div>
                </div>
                <div className="p-1.5 rounded-lg bg-green-50 text-green-600"><Award size={16} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex items-center gap-1 text-gray-500"><Briefcase size={10} /> {c.part_time_jobs?.title || 'N/A'}</div>
                <div className="flex items-center gap-1 text-gray-500"><CalendarDays size={10} /> {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}</div>
                {c.applicant_phone && <div className="flex items-center gap-1 text-gray-500"><Phone size={10} /> {c.applicant_phone}</div>}
                {c.applicant_role && <div className="flex items-center gap-1 text-gray-500"><Star size={10} /> {c.applicant_role}</div>}
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <button className="flex-1 py-2 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF] text-[10px] font-semibold hover:bg-[#6D4CFF]/20 transition-all">
                  Send Message
                </button>
                <button className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-500 text-[10px] font-semibold hover:bg-gray-50 transition-all">
                  View Profile
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
