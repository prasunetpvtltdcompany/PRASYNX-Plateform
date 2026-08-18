'use client';

import { useState, useMemo, useRef } from 'react';
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
  Briefcase, DollarSign, Building2, BadgeCheck, Bookmark,
  Heart, Share2, ExternalLink, Globe2, UsersRound,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useApi } from '../../lib/useApi';
import { partTimeJobApi } from '../../lib/dataService';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

const PCOLORS = { primary: '#7C3AED', secondary: '#8B5CF6', tertiary: '#6366F1', success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };
const PIE_COLORS = ['#7C3AED', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#6366F1', '#EC4899'];

interface JobsDashboardProps {
  darkMode?: boolean;
}

const appStatuses = [
  { key: 'applied', label: 'Applied', color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'review', label: 'In Review', color: '#F59E0B', bg: '#FFFBEB' },
  { key: 'interview', label: 'Interview', color: '#7C3AED', bg: '#F3F0FF' },
  { key: 'offer', label: 'Offer 🎉', color: '#10B981', bg: '#F0FDF4' },
  { key: 'rejected', label: 'Rejected', color: '#EF4444', bg: '#FEF2F2' },
];

const jobTypeFilters = [
  { key: 'all', label: 'All Opportunities' },
  { key: 'internship', label: 'Internships' },
  { key: 'part-time', label: 'Part-Time' },
  { key: 'freelance', label: 'Freelance' },
  { key: 'remote', label: 'Remote' },
];

export function JobsDashboard({ darkMode }: JobsDashboardProps) {
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [showMyApps, setShowMyApps] = useState(false);
  const [applyJob, setApplyJob] = useState<any>(null);
  const [appForm, setAppForm] = useState({ phone: '', cover_note: '' });
  const [applying, setApplying] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<'browse' | 'applications' | 'saved'>('browse');

  const uid = session?.user?.id || '';
  const orgId = session?.user?.organisation_id || session?.teacher?.organisation_id || '';
  const userRole = session?.user?.role || '';
  const teacherId = session?.teacher?.id || session?.user?.id || '';

  const jobsHook = useApi<any[]>(() => partTimeJobApi.getAll(orgId, userRole), [orgId, userRole], !!orgId);
  const myAppsHook = useApi<any[]>(() => partTimeJobApi.getMyApplications(uid), [uid], !!uid);

  const effectiveJobs = useMemo(() => {
    const data = Array.isArray(jobsHook.data) ? jobsHook.data : [];
    if (data.length > 0) return data;
    return [];
  }, [jobsHook.data]);

  const effectiveApps = useMemo(() => {
    const data = Array.isArray(myAppsHook.data) ? myAppsHook.data : [];
    if (data.length > 0) return data;
    return [];
  }, [myAppsHook.data]);

  const filteredJobs = useMemo(() => {
    let result = effectiveJobs;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((j: any) =>
        (j.title || '').toLowerCase().includes(q) ||
        (j.company || '').toLowerCase().includes(q) ||
        (j.skills || '').toLowerCase().includes(q) ||
        (j.description || '').toLowerCase().includes(q)
      );
    }
    if (jobTypeFilter !== 'all') {
      result = result.filter((j: any) => j.type === jobTypeFilter);
    }
    return result;
  }, [effectiveJobs, searchQuery, jobTypeFilter]);

  const handleApply = async () => {
    if (!applyJob) return;
    setApplying(true);
    const res = await partTimeJobApi.apply({
      job_id: applyJob.id, applicant_id: uid,
      applicant_name: (session?.teacher?.full_name as string) || '',
      applicant_email: session?.user?.email || '',
      applicant_type: 'staff', ...appForm
    });
    setApplying(false);
    if (res.success) {
      toast.success('Application submitted!');
      setApplyJob(null);
      setAppForm({ phone: '', cover_note: '' });
      jobsHook.refetch();
      myAppsHook.refetch();
    } else toast.error(res.error || 'Failed to apply');
  };

  const toggleSave = (jobId: string) => {
    setSavedJobs(prev => prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]);
    toast.success(savedJobs.includes(jobId) ? 'Job removed from saved' : 'Job saved!');
  };

  const SectionCard = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
    <Card className={`p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );

  const totalOnline = effectiveJobs.filter((j: any) => j.type === 'remote' || j.location === 'Remote').length;
  const totalLocal = effectiveJobs.filter((j: any) => j.location === 'Local' || j.type === 'part-time').length;

  return (
    <div className="space-y-6">
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
                <Briefcase size={20} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-200">Career & Earning Hub</div>
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Part-Time Jobs</h1>
              </div>
            </div>
            <p className="text-sm text-purple-100/90 mt-2 max-w-xl leading-relaxed">
              Discover internships, freelance gigs, remote jobs, campus opportunities, and part-time work that match skills.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { icon: Briefcase, value: effectiveJobs.length, label: 'Openings', color: '#A855F7' },
                { icon: Building2, value: 0, label: 'Companies', color: '#3B82F6' },
                { icon: Send, value: effectiveApps.length, label: 'Applications', color: '#10B981' },
                { icon: Percent, value: '89%', label: 'AI Match', color: '#F59E0B' },
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
            ><Search size={16} /> Find Jobs</motion.button>
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-10 border border-white/25 backdrop-blur-sm transition-all"
            ><FileText size={16} /> Build Resume</motion.button>
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-10 border border-white/25 backdrop-blur-sm transition-all"
            ><Sparkles size={16} /> AI Career</motion.button>
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-10 border border-white/25 backdrop-blur-sm transition-all"
            ><Plus size={16} /> Post Job</motion.button>
          </div>
        </div>
      </motion.div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Briefcase, label: 'Available Jobs', value: effectiveJobs.length, sub: '+248 New This Week', color: PCOLORS.primary, bg: '#F3F0FF' },
          { icon: Globe2, label: 'Remote Opportunities', value: totalOnline, sub: 'Work From Anywhere', color: PCOLORS.success, bg: '#F0FDF4' },
          { icon: MapPin, label: 'Local Opportunities', value: totalLocal, sub: 'Nearby Jobs', color: PCOLORS.warning, bg: '#FFFBEB' },
          { icon: Send, label: 'My Applications', value: effectiveApps.length, sub: `${effectiveApps.filter((a: any) => a.status === 'review' || a.status === 'interview').length} In Review`, color: PCOLORS.info, bg: '#EFF6FF' },
        ].map((kpi, i) => (
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
          { key: 'browse', label: 'Browse Jobs', icon: Briefcase },
          { key: 'applications', label: 'My Applications', icon: Send },
          { key: 'saved', label: `Saved (${savedJobs.length})`, icon: Bookmark },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setSelectedTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${selectedTab === tab.key ? 'bg-[#7C3AED] text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            ><Icon size={15} />{tab.label}</button>
          );
        })}
      </div>

      {/* ===== BROWSE JOBS TAB ===== */}
      {selectedTab === 'browse' && (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-5 space-y-6">
            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search jobs by title, company, skill..."
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 bg-white" />
              </div>
              <div className="flex gap-1.5 overflow-x-auto">
                {jobTypeFilters.map(f => (
                  <button key={f.key} onClick={() => setJobTypeFilter(f.key)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all ${jobTypeFilter === f.key ? 'bg-[#7C3AED] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >{f.label}</button>
                ))}
              </div>
            </div>

            {/* Job Cards */}
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 rounded-2xl bg-[#F3F0FF] flex items-center justify-center mx-auto mb-4">
                  <Briefcase size={44} className="text-[#7C3AED]" />
                </div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">No Jobs Found</h4>
                <p className="text-sm text-gray-400 mb-5">Try adjusting your search or filters.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => { setSearchQuery(''); setJobTypeFilter('all'); }}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all"
                  >Clear Filters</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredJobs.map((job: any) => {
                  const isSaved = savedJobs.includes(job.id);
                  return (
                    <motion.div key={job.id} whileHover={{ y: -3 }}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <div className={`h-1 ${job.featured ? 'bg-gradient-to-r from-[#7C3AED] to-[#6366F1]' : 'bg-transparent'}`} />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#EDE9FE] flex items-center justify-center text-[#7C3AED] font-bold text-sm">
                              {job.company?.charAt(0) || 'J'}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-gray-900 leading-tight">{job.title}</h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-gray-500">{job.company}</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-[10px] text-gray-400">{job.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => toggleSave(job.id)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-all">
                              <Heart size={14} className={isSaved ? 'text-red-500 fill-red-500' : 'text-gray-300'} />
                            </button>
                            {job.featured && <Sparkles size={14} className="text-yellow-500" />}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge className={`text-[8px] ${job.type === 'internship' ? 'bg-blue-50 text-blue-600 border-blue-200' : job.type === 'freelance' ? 'bg-green-50 text-green-600 border-green-200' : job.type === 'part-time' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-purple-50 text-purple-600 border-purple-200'}`}>
                            {job.type === 'internship' ? 'Internship' : job.type === 'freelance' ? 'Freelance' : job.type === 'part-time' ? 'Part-Time' : 'Remote'}
                          </Badge>
                          <span className="text-[10px] font-semibold text-green-600 flex items-center gap-0.5">
                            <DollarSign size={10} />{job.salary}
                          </span>
                          <span className="text-[9px] text-gray-400">📅 {job.posted}</span>
                        </div>

                        <p className="text-[10px] text-gray-500 mb-3 line-clamp-2">{job.description}</p>

                        {job.skills && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {job.skills.split(',').map((s: string, si: number) => (
                              <span key={si} className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-500 text-[8px] font-medium">{s.trim()}</span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-[9px] text-gray-400">
                            <Users size={11} /> {job.applicants} applicants
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-[#7C3AED]" style={{ width: `${job.aiMatch}%` }} />
                            </div>
                            <span className="text-[9px] font-bold text-[#7C3AED]">{job.aiMatch}% match</span>
                          </div>
                        </div>

                        <div className="flex gap-1.5">
                          <button onClick={() => setApplyJob(job)}
                            className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white text-[10px] font-semibold hover:shadow-lg transition-all">
                            Apply Now
                          </button>
                          <button className="flex-1 py-2 rounded-lg bg-[#F3F0FF] text-[#7C3AED] text-[10px] font-semibold hover:bg-[#EDE9FE] transition-all">
                            View Details
                          </button>
                          <button className="px-3 py-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all">
                            <Share2 size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-2 space-y-5">
            {/* Profile Completion */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Profile Completion</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#7C3AED" strokeWidth="3" strokeDasharray={`${82 * 0.97} 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-extrabold text-[#7C3AED]">82%</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {['Upload Resume', 'Add Skills', 'Add Certifications'].map((sug, i) => (
                    <button key={i} className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-[#7C3AED] transition-all">
                      <Plus size={10} /> {sug}
                    </button>
                  ))}
                </div>
              </div>
              <button className="w-full py-2 rounded-xl bg-[#F3F0FF] text-[#7C3AED] text-[10px] font-semibold hover:bg-[#EDE9FE] transition-all">
                Complete Profile
              </button>
            </Card>

            {/* Upcoming Interviews */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Upcoming Interviews</h3>
              <div className="space-y-3">
                {([] as any[]).map((int: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#7C3AED]/30 transition-all">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#7C3AED]">
                        <CalendarDays size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-900 truncate">{int.role}</div>
                        <div className="text-[9px] text-gray-400">{int.company}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pl-9">
                      <span className="text-[9px] font-medium text-[#7C3AED]">{int.date} at {int.time}</span>
                      <Badge className="bg-green-50 text-green-600 border-0 text-[8px]">Confirmed</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Companies */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Top Companies Hiring</h3>
              <div className="space-y-2">
                {([] as any[]).map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                        {c.name?.charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-gray-700">{c.name}</span>
                    </div>
                    <Badge className="bg-[#F3F0FF] text-[#7C3AED] border-0 text-[8px]">{c.hiring} openings</Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {([] as any[]).map((act: any, i: number) => {
                  const Icon = act.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${act.color}15`, color: act.color }}><Icon size={14} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 leading-tight">{act.text}</div>
                        <div className="text-[9px] text-gray-400 mt-0.5">{act.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* AI Career Assistant */}
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] rounded-2xl p-5 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <Sparkles size={18} className="text-purple-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Prerana AI</h3>
                    <p className="text-[10px] text-purple-200/80">Career Assistant</p>
                  </div>
                </div>
                <p className="text-xs text-purple-100/90 mb-4 leading-relaxed">
                  Hello 👋 I can help find jobs, improve resumes, prepare interviews, and increase your chances of getting hired.
                </p>
                <div className="grid grid-cols-2 gap-1.5 mb-4">
                  {[
                    { label: 'Find Best Jobs', icon: Search },
                    { label: 'Resume Review', icon: FileText },
                    { label: 'Interview Prep', icon: Zap },
                    { label: 'Salary Insights', icon: DollarSign },
                    { label: 'Career Roadmap', icon: MapPin },
                    { label: 'Cover Letter', icon: MessageSquare },
                  ].map((sugg, si) => (
                    <button key={si}
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white/10 border border-white/10 text-[10px] text-white hover:bg-white/20 transition-all"
                    ><sugg.icon size={13} /><span>{sugg.label}</span></button>
                  ))}
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                    <input type="text" placeholder="Ask AI about careers..." className="flex-1 bg-transparent border-0 text-xs text-white placeholder-purple-200/60 focus:outline-none" />
                    <button className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"><Send size={12} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ===== MY APPLICATIONS TAB ===== */}
      {selectedTab === 'applications' && (
        <div className="space-y-6">
          <SectionCard title="Application Tracker" subtitle="Track your job applications across all opportunities">
            {/* Status Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {appStatuses.map((st) => {
                const apps = effectiveApps.filter((a: any) => a.status === st.key);
                return (
                  <div key={st.key} className="rounded-xl p-3" style={{ background: st.bg }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold" style={{ color: st.color }}>{st.label}</span>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: st.color, color: 'white' }}>{apps.length}</span>
                    </div>
                    <div className="space-y-1.5">
                      {apps.length > 0 ? apps.map((app: any) => (
                        <div key={app.id} className="p-2 rounded-lg bg-white/80 border border-white/60 hover:shadow-sm transition-all cursor-pointer">
                          <div className="text-[10px] font-semibold text-gray-900 truncate">{app.title}</div>
                          <div className="text-[8px] text-gray-400">{app.company}</div>
                          {app.interviewDate && (
                            <div className="text-[8px] text-[#7C3AED] font-medium mt-1">📅 {app.interviewDate}</div>
                          )}
                        </div>
                      )) : (
                        <div className="text-[9px] text-gray-400 text-center py-3">No applications</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Application Details Table */}
          <SectionCard title="All Applications" subtitle="Complete list of your submitted applications">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-500">Position</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-500">Company</th>
                    <th className="text-left py-2.5 px-2 font-semibold text-gray-500">Applied</th>
                    <th className="text-center py-2.5 px-2 font-semibold text-gray-500">Status</th>
                    <th className="text-right py-2.5 px-2 font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {effectiveApps.map((app: any) => {
                    const st = appStatuses.find(s => s.key === app.status) || appStatuses[0];
                    return (
                      <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-2.5 px-2 font-medium text-gray-900">{app.title}</td>
                        <td className="py-2.5 px-2 text-gray-600">{app.company || '—'}</td>
                        <td className="py-2.5 px-2 text-gray-500">{app.appliedDate}</td>
                        <td className="py-2.5 px-2 text-center">
                          <Badge className="text-[8px]" style={{ background: st.bg, color: st.color, borderColor: `${st.color}30` }}>{st.label}</Badge>
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Eye size={13} /></button>
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ===== SAVED TAB ===== */}
      {selectedTab === 'saved' && (
        <div className="space-y-6">
          {savedJobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-2xl bg-[#F3F0FF] flex items-center justify-center mx-auto mb-4">
                <Heart size={44} className="text-[#7C3AED]" />
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-1">No Saved Jobs</h4>
              <p className="text-sm text-gray-400">Click the heart icon on any job to save it for later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {effectiveJobs.filter(j => savedJobs.includes(j.id)).map((job: any) => (
                <motion.div key={job.id} whileHover={{ y: -3 }}
                  className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#EDE9FE] flex items-center justify-center text-[#7C3AED] font-bold">{job.company?.charAt(0)}</div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{job.title}</h3>
                        <span className="text-[10px] text-gray-400">{job.company}</span>
                      </div>
                    </div>
                    <button onClick={() => toggleSave(job.id)} className="p-1.5 rounded-lg hover:bg-gray-100"><Heart size={14} className="text-red-500 fill-red-500" /></button>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mb-3">
                    <MapPin size={11} /> {job.location}
                    <DollarSign size={11} /> {job.salary}
                  </div>
                  <button onClick={() => setApplyJob(job)}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white text-[10px] font-semibold hover:shadow-lg transition-all">
                    Apply Now
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== APPLY MODAL ===== */}
      {applyJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setApplyJob(null)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Apply for</h3>
                <p className="text-sm text-[#7C3AED] font-semibold">{applyJob.title}</p>
                <p className="text-[11px] text-gray-400">{applyJob.company} • {applyJob.location}</p>
              </div>
              <button onClick={() => setApplyJob(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Phone</label>
                <input value={appForm.phone} onChange={e => setAppForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 bg-white"
                  placeholder="Your contact number" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Cover Note</label>
                <textarea value={appForm.cover_note} onChange={e => setAppForm(p => ({ ...p, cover_note: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 bg-white min-h-[100px] resize-none"
                  placeholder="Why are you a good fit for this role?" />
              </div>
              <button onClick={handleApply} disabled={applying}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white text-xs font-bold hover:shadow-lg transition-all disabled:opacity-50">
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
