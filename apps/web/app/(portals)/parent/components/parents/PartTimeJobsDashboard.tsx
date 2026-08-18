'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, MapPin, Clock, DollarSign, CheckCircle2, FileText, Star,
  Search, X, Sparkles, Send, ChevronRight, Users, Filter, BookOpen,
  TrendingUp, CalendarDays, Award, ChevronDown, ExternalLink, Globe,
  Home, Building2, GraduationCap,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { partTimeJobApi } from '../../lib/dataService';
import { useApi, EmptyState } from '../../lib/useApi';
import { useAuth } from '../../contexts/AuthContext';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

export function PartTimeJobsDashboard() {
  const { session } = useAuth();
  const pid = session?.parent?.id || session?.user?.id || '';
  const uid = session?.user?.id || '';
  const oid = session?.parent?.organisation_id || session?.user?.organisation_id || '';

  const [jobFilter, setJobFilter] = useState('all');
  const [applyJob, setApplyJob] = useState<any>(null);
  const [appForm, setAppForm] = useState({ phone: '', cover_note: '' });
  const [applying, setApplying] = useState(false);
  const [showMyApps, setShowMyApps] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const jobsHook = useApi(() => partTimeJobApi.getAll(oid, 'parent'), [oid], !!oid);
  const myAppsHook = useApi(() => partTimeJobApi.getMyApplications(uid), [uid], !!uid);

  const jobs: any[] = Array.isArray(jobsHook.data) && jobsHook.data.length > 0 ? jobsHook.data : [];
  const myApps: any[] = Array.isArray(myAppsHook.data) && myAppsHook.data.length > 0 ? myAppsHook.data : [];

  const filtered = jobFilter === 'all' ? jobs : jobs.filter((j: any) => j.type === jobFilter);
  const searched = searchTerm ? filtered.filter((j: any) =>
    j.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.skills?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.area?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : filtered;

  const onlineJobs = jobs.filter((j: any) => j.type === 'online').length;
  const localJobs = jobs.filter((j: any) => j.type === 'local').length;
  const approvedCount = myApps.filter((a: any) => a.status === 'approved').length;
  const pendingCount = myApps.filter((a: any) => a.status === 'pending').length;

  const handleApply = async () => {
    if (!applyJob) return;
    setApplying(true);
    try {
      const res = await partTimeJobApi.apply({
        job_id: applyJob.id, applicant_id: uid,
        applicant_name: session?.parent?.full_name || session?.parent?.name || session?.user?.name || '',
        applicant_email: session?.user?.email || '',
        applicant_type: 'parent', ...appForm,
      });
      setApplying(false);
      if (res.success) {
        toast.success('Application submitted!');
        setApplyJob(null);
        setAppForm({ phone: '', cover_note: '' });
        jobsHook.refetch();
        myAppsHook.refetch();
      } else {
        toast.error(res.error || 'Failed to apply');
      }
    } catch {
      setApplying(false);
      toast.error('Failed to apply');
    }
  };

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
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <Briefcase className="w-3.5 h-3.5 text-purple-200" />
              <span className="text-[10px] font-semibold text-purple-100 uppercase tracking-wider">Part-Time Jobs</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Job Opportunities</h1>
          <p className="text-sm text-white/80 mt-1 max-w-xl">Discover local and online part-time work opportunities. Find flexible jobs that fit your schedule and skills.</p>
          <div className="flex flex-wrap gap-3 mt-5">
            {[
              { icon: Briefcase, label: 'Available', value: jobs.length, color: '#6D4CFF' },
              { icon: Globe, label: 'Online', value: onlineJobs, color: '#10B981' },
              { icon: MapPin, label: 'Local', value: localJobs, color: '#F59E0B' },
              { icon: TrendingUp, label: 'My Apps', value: myApps.length, color: '#3B82F6' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
                <div><span className="text-[10px] text-purple-200/70 block">{item.label}</span><span className="text-sm font-bold text-white">{item.value}</span></div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ===== STATS CARDS ===== */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Briefcase, label: 'Total Jobs', value: jobs.length, desc: 'Active Listings', color: '#6D4CFF', bg: '#F3F0FF' },
          { icon: Globe, label: 'Online', value: onlineJobs, desc: 'Remote Work', color: '#10B981', bg: '#F0FDF4' },
          { icon: MapPin, label: 'Local', value: localJobs, desc: 'In Your Area', color: '#F59E0B', bg: '#FFFBEB' },
          { icon: Award, label: 'Approved', value: approvedCount, desc: approvedCount > 0 ? `${pendingCount} Pending` : 'No Applications', color: '#3B82F6', bg: '#EFF6FF' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={i} whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#6D4CFF]/20 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: item.bg, color: item.color }}><Icon className="w-4.5 h-4.5" /></div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.05, type: 'spring' }} className="w-2 h-2 rounded-full" style={{ background: item.color }} />
              </div>
              <div className="text-[11px] font-medium text-gray-400 mb-0.5">{item.label}</div>
              <div className="text-lg font-extrabold text-gray-900">{item.value}</div>
              <div className="text-[10px]" style={{ color: item.color }}>{item.desc}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ===== FILTERS ===== */}
      <motion.div variants={fadeUp}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-100 w-fit">
            {[
              { key: 'all', label: 'All Jobs', icon: Briefcase },
              { key: 'online', label: 'Online', icon: Globe },
              { key: 'local', label: 'Local', icon: MapPin },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = jobFilter === tab.key;
              return (
                <button key={tab.key} onClick={() => setJobFilter(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${isActive ? 'bg-white text-[#6D4CFF] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}>
                  <Icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input type="text" placeholder="Search jobs..." className="w-full sm:w-48 pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] transition-all"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-gray-100">
              {(['grid', 'list'] as const).map((mode) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`p-1.5 rounded-md text-[10px] font-semibold transition-all ${viewMode === mode ? 'bg-white text-[#6D4CFF] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  {mode === 'grid' ? '▦' : '☰'}
                </button>
              ))}
            </div>
            <button onClick={() => { setShowMyApps(!showMyApps); toast.info(`Showing ${myApps.length} applications`); }}
              className="px-3 py-2 rounded-xl bg-[#F3F0FF] text-[#6D4CFF] text-[11px] font-semibold hover:bg-[#E8E0FF] transition-all flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> My Apps ({myApps.length})
            </button>
          </div>
        </div>
      </motion.div>

      {/* ===== MY APPLICATIONS ===== */}
      <AnimatePresence>
        {showMyApps && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <Card className="p-5 border border-[#6D4CFF]/20">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-[#6D4CFF]" />My Applications</h3>
              {myApps.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No applications yet</p>
                  <p className="text-xs mt-0.5">Apply to a job to track your application status here.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {myApps.map((app: any) => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#6D4CFF]/20 transition-all">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{app.part_time_jobs?.title || 'Job'}</div>
                        <div className="text-[11px] text-gray-400">Applied {new Date(app.created_at).toLocaleDateString()}</div>
                      </div>
                      <Badge className={`text-[10px] font-semibold border-0 ${app.status === 'approved' ? 'bg-[#F0FDF4] text-[#10B981]' : app.status === 'rejected' ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-[#FFFBEB] text-[#F59E0B]'}`}>
                        {app.status === 'approved' ? '✓ Approved' : app.status === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== JOB CARDS ===== */}
      {searched.length === 0 ? (
        <motion.div variants={fadeUp}>
          <Card className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center">
              <Briefcase className="w-10 h-10 text-[#6D4CFF]" />
            </div>
            <p className="text-sm font-semibold text-gray-700">{searchTerm ? 'No jobs match your search' : 'No jobs available'}</p>
            <p className="text-xs text-gray-400 mt-1">{searchTerm ? 'Try adjusting your search or filter.' : 'Check back later for new opportunities.'}</p>
            {searchTerm && <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={() => setSearchTerm('')}>Clear Search</Button>}
          </Card>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searched.map((job: any, i: number) => (
            <motion.div key={job.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#6D4CFF]/20 transition-all duration-200 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`text-[9px] border-0 ${job.type === 'online' ? 'bg-[#EFF6FF] text-[#3B82F6]' : 'bg-[#FFF3E0] text-[#F59E0B]'}`}>
                    {job.type === 'online' ? '🌐 Online' : '📍 Local'}
                  </Badge>
                  {job.area && <span className="text-[10px] text-gray-400">{job.area}</span>}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-300">
                  {job.rating && <><Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />{job.rating}</>}
                </div>
              </div>
              <h3 className="font-bold text-sm text-gray-900 mb-1.5 group-hover:text-[#6D4CFF] transition-colors">{job.title}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{job.description || 'No description'}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#10B981]">
                  <DollarSign className="w-3 h-3" /> {job.pay_amount > 0 ? `$${job.pay_amount}/${job.pay_type === 'hourly' ? 'hr' : 'fixed'}` : 'Negotiable'}
                </div>
                {job.duration && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock className="w-3 h-3" /> {job.duration}
                  </div>
                )}
                {job.slots > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Users className="w-3 h-3" /> {job.slots} slot{job.slots > 1 ? 's' : ''}
                  </div>
                )}
                {job.employer && (
                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {job.employer}
                  </div>
                )}
              </div>
              {job.skills && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {job.skills.split(',').map((s: string, si: number) => (
                    <span key={si} className="px-2 py-0.5 rounded-md bg-gray-100 text-[9px] text-gray-500 font-medium">{s.trim()}</span>
                  ))}
                </div>
              )}
              <button onClick={() => setApplyJob(job)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[11px] font-bold hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(109,76,255,0.2)] hover:shadow-[0_6px_16px_rgba(109,76,255,0.3)]">
                Apply Now
              </button>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="space-y-2.5">
          {searched.map((job: any, i: number) => (
            <motion.div key={job.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[#6D4CFF]/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-[#6D4CFF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-gray-900">{job.title}</h3>
                    <Badge className={`text-[8px] border-0 ${job.type === 'online' ? 'bg-[#EFF6FF] text-[#3B82F6]' : 'bg-[#FFF3E0] text-[#F59E0B]'}`}>{job.type}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-0.5">
                    <span>{job.area || 'Remote'}</span>
                    <span className="text-[#10B981] font-semibold">${job.pay_amount}/{job.pay_type === 'hourly' ? 'hr' : 'fixed'}</span>
                    <span>{job.duration}</span>
                    <span>{job.slots > 0 ? `${job.slots} slots` : ''}</span>
                  </div>
                </div>
                <button onClick={() => setApplyJob(job)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[11px] font-bold hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(109,76,255,0.2)] hover:shadow-[0_6px_16px_rgba(109,76,255,0.3)] flex-shrink-0">
                  Apply
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ===== APPLY MODAL ===== */}
      <AnimatePresence>
        {applyJob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={() => setApplyJob(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-100" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center"><Briefcase className="w-5 h-5 text-[#6D4CFF]" /></div>
                  <div>
                    <h3 className="font-bold text-base">Apply for</h3>
                    <p className="text-sm text-gray-600">{applyJob.title}</p>
                  </div>
                </div>
                <button onClick={() => setApplyJob(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"><X size={18} className="text-gray-400" /></button>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] border border-[rgba(109,76,255,0.15)] mb-4">
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <DollarSign className="w-4 h-4 text-[#10B981]" />
                  <span className="font-semibold">${applyJob.pay_amount}/{applyJob.pay_type === 'hourly' ? 'hr' : 'fixed'}</span>
                  <span className="text-gray-300">|</span>
                  <MapPin className="w-4 h-4 text-[#F59E0B]" />
                  <span>{applyJob.area || 'Remote'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Phone Number</label>
                  <input className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:bg-white focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] transition-all"
                    placeholder="Your contact number" value={appForm.phone} onChange={e => setAppForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Cover Note</label>
                  <textarea className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:bg-white focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] min-h-[80px] transition-all resize-none"
                    placeholder="Why are you a good fit for this position?" value={appForm.cover_note} onChange={e => setAppForm(p => ({ ...p, cover_note: e.target.value }))} />
                </div>
                <Button onClick={handleApply} disabled={applying}
                  className="w-full bg-gradient-to-r from-[#6D4CFF] to-[#8B6FFF] text-white rounded-xl h-10 text-sm font-semibold shadow-[0_4px_12px_rgba(109,76,255,0.25)] hover:shadow-[0_6px_16px_rgba(109,76,255,0.35)] transition-all disabled:opacity-50">
                  {applying ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
