'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, ChevronLeft, ChevronRight,
  Download, Clock, CheckCircle2, AlertCircle, Award, Star,
  TrendingUp, FileText, Brain, Lightbulb, CalendarDays, X, Mic,
  Target, Timer, ChevronDown, Calendar, MapPin, Users, Trophy,
  Zap, Gift, BookOpen, Flag, Camera, Medal, Flame, Heart,
  User, ArrowRight, Link, ExternalLink, Briefcase, DollarSign,
  Send, Bookmark, Eye, Edit3, RefreshCw, Globe, GraduationCap,
  Building, MapPinned, Laptop, PenTool, Code, ChartBar,
  Headphones, Megaphone, ShoppingCart, Palette, Smile,
  PhoneCall, Clock12, BadgeCheck, ShieldPlus, Route,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { useApi } from '../../lib/useApi';
import { partTimeJobApi } from '../../lib/dataService';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };
const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

function CounterAnimation({ value, suffix = '', duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const inc = value / (duration * 60);
    const interval = setInterval(() => {
      start += inc;
      if (start >= value) { setCount(value); clearInterval(interval); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(interval);
  }, [value, duration]);
  return <span>{count}{suffix}</span>;
}

const demoJobs: any[] = [];

const demoApplications: any[] = [];

const demoInterviews: any[] = [];

const demoSkills: any[] = [];

const demoFreelance: any[] = [];

const demoStories: any[] = [];

const demoCareerEvents: any[] = [];

const demoCategories: any[] = [];

const aiRecommendations = [
  { title: 'Improve Your Resume', priority: 'High', benefit: '35% more interview calls', action: 'Start Now', time: '10 min' },
  { title: 'Learn React.js', priority: 'High', benefit: 'Unlock 200+ frontend jobs', action: 'View Courses', time: '4 weeks' },
  { title: 'Apply to Teaching Jobs', priority: 'Medium', benefit: '100+ tutoring openings', action: 'Browse', time: 'Now' },
  { title: 'Complete AI Certification', priority: 'Medium', benefit: 'Premium AI roles unlocked', action: 'Start', time: '8 weeks' },
  { title: 'Join Freelance Projects', priority: 'Low', benefit: 'Earn while building portfolio', action: 'Explore', time: 'Flexible' },
];

const SectionCard = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
  <Card className={`p-5 ${className}`}>
    <div className="mb-3">
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </Card>
);

export function JobsDashboard() {
  const { session } = useAuth();
  const profile = session?.student || null;
  const uid = session?.user?.id || '';
  const oid = session?.student?.organisation_id || session?.user?.organisation_id || '';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Jobs');
  const [jobFilter, setJobFilter] = useState('all');
  const [applyJob, setApplyJob] = useState<any>(null);
  const [appForm, setAppForm] = useState({ phone: '', cover_note: '' });
  const [applying, setApplying] = useState(false);
  const [showMyApps, setShowMyApps] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<'jobs' | 'applications' | 'freelance' | 'skills'>('jobs');

  const jobsHook = useApi(() => partTimeJobApi.getAll(oid, 'student'), [oid], !!oid);
  const myAppsHook = useApi(() => partTimeJobApi.getMyApplications(uid), [uid], !!uid);

  const filters = ['All Jobs', 'Remote', 'Local', 'Internships', 'Freelance', 'Campus Jobs', 'Part-Time', 'Featured'];

  const effectiveJobs = useMemo(() => {
    if (Array.isArray(jobsHook.data) && jobsHook.data.length > 0) return jobsHook.data;
    return demoJobs;
  }, [jobsHook.data]);

  const effectiveApps = useMemo(() => {
    if (Array.isArray(myAppsHook.data) && myAppsHook.data.length > 0) return myAppsHook.data;
    return demoApplications;
  }, [myAppsHook.data]);

  const filteredJobs = useMemo(() => {
    let list = effectiveJobs;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((j: any) =>
        (j.title || '').toLowerCase().includes(q) ||
        (j.company || '').toLowerCase().includes(q) ||
        (j.skills || '').toLowerCase().includes(q) ||
        (j.area || '').toLowerCase().includes(q) ||
        (j.description || '').toLowerCase().includes(q)
      );
    }
    const filterMap: Record<string, string[]> = {
      'All Jobs': [],
      'Remote': ['online'],
      'Local': ['local'],
      'Internships': ['online', 'local'],
      'Freelance': ['freelance'],
      'Campus Jobs': ['local'],
      'Part-Time': ['online', 'local'],
      'Featured': [],
    };
    const typeFilter = filterMap[activeFilter];
    if (typeFilter && typeFilter.length > 0) {
      list = list.filter((j: any) => typeFilter.includes(j.type));
    }
    if (jobFilter !== 'all') {
      list = list.filter((j: any) => j.type === jobFilter);
    }
    return list;
  }, [effectiveJobs, searchQuery, activeFilter, jobFilter]);

  const toggleSave = (jobId: string) => {
    setSavedJobs(prev => prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]);
  };

  const handleApply = async () => {
    if (!applyJob) return;
    setApplying(true);
    const res = await partTimeJobApi.apply({
      job_id: applyJob.id, applicant_id: uid,
      applicant_name: profile?.full_name || session?.user?.name || '',
      applicant_email: session?.user?.email || '',
      applicant_type: 'student', ...appForm
    });
    setApplying(false);
    if (res.success) { toast.success('Application submitted!'); setApplyJob(null); setAppForm({ phone: '', cover_note: '' }); jobsHook.refetch(); myAppsHook.refetch(); }
    else toast.error(res.error || 'Failed to apply');
  };

  const stats = useMemo(() => [
    { label: 'Available Jobs', value: effectiveJobs.length, icon: Briefcase, color: COLORS.primary, bg: '#F3F0FF', trend: '+12 this week' },
    { label: 'Applications Sent', value: effectiveApps.length, icon: Send, color: COLORS.success, bg: '#F0FDF4', trend: '+3 this week' },
    { label: 'Interview Invites', value: effectiveApps.filter((a: any) => a.status === 'approved').length, icon: Star, color: COLORS.warning, bg: '#FFFBEB', trend: '2 pending' },
    { label: 'Potential Earnings', value: effectiveJobs.reduce((sum: number, j: any) => sum + (j.pay_amount || 0), 0), icon: DollarSign, color: COLORS.danger, bg: '#FEF2F2', prefix: '₹' },
  ], [effectiveJobs, effectiveApps]);

  const pendingApps = effectiveApps.filter((a: any) => a.status === 'pending');
  const approvedApps = effectiveApps.filter((a: any) => a.status === 'approved');
  const rejectedApps = effectiveApps.filter((a: any) => a.status === 'rejected');

  const earningsData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((m) => ({
      month: m,
      earnings: 0,
      applications: 0,
    }));
  }, []);

  const categoryCount = effectiveJobs.length;
  const avgSalary = effectiveJobs.length > 0
    ? Math.round(effectiveJobs.reduce((s: number, j: any) => s + (j.pay_amount || 0), 0) / effectiveJobs.length)
    : 0;

  if (jobsHook?.loading && !jobsHook.data) {
    return (
      <div className="space-y-6">
        <div className="page-header"><h1>Part-Time Jobs & Career Hub</h1><p>Loading opportunities...</p></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-gray-100 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
              <div className="h-7 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 animate-pulse h-60" />
          ))}
        </div>
      </div>
    );
  }

  if (jobsHook?.error && !jobsHook.data) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load jobs</h2>
        <p className="text-gray-500 mb-6">{jobsHook.error}</p>
        <div className="flex gap-3">
          <button onClick={jobsHook.refetch} className="px-6 py-2.5 bg-[#6D4CFF] text-white rounded-xl font-medium hover:bg-[#5A3FD6] transition-colors">Refresh Data</button>
          <button className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">Contact Career Services</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Part-Time Jobs & Career Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Discover flexible jobs, internships, freelance projects, campus opportunities, and AI-powered career recommendations.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => setShowMyApps(!showMyApps)} className="px-4 py-2 text-xs font-medium text-[#6D4CFF] bg-[#F3F0FF] rounded-xl hover:bg-[#EBE6FF] transition-all flex items-center gap-2">
            <FileText className="w-4 h-4" /> My Applications
          </button>
          <button className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] rounded-xl shadow-[0_4px_14px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_20px_rgba(109,76,255,0.4)] transition-all flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload Resume
          </button>
        </div>
      </motion.div>

      {/* Hero Banner */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6D4CFF] via-[#7B5DFF] to-[#8B6FFF] p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-extrabold mb-2">Earn, Learn & Grow 🚀</h2>
            <p className="text-sm text-white/80 max-w-xl">Find local jobs, online work, internships, tutoring opportunities, and freelance projects that fit your academic schedule.</p>
          </div>
          <div className="flex gap-3 flex-wrap flex-shrink-0">
            <button className="px-5 py-2.5 rounded-xl bg-white text-[#6D4CFF] text-xs font-bold hover:shadow-lg transition-all">Browse Jobs</button>
            <button className="px-5 py-2.5 rounded-xl bg-white/15 text-white text-xs font-bold hover:bg-white/25 transition-all border border-white/30">Career Guidance</button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="p-5 bg-gradient-to-br from-white to-[#FAFBFC] border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.color }}><Icon size={20} /></div>
                <Badge variant="default" className="text-[8px] bg-gray-50 text-gray-500">{s.trend}</Badge>
              </div>
              <div className="text-2xl font-extrabold text-gray-900">
                {s.prefix}{typeof s.value === 'number' ? <CounterAnimation value={s.value} /> : s.value}
              </div>
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
            </Card>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-2.5">
        {[
          { label: 'Upload Resume', icon: Upload, color: '#6D4CFF' },
          { label: 'Find Jobs', icon: Search, color: '#22C55E' },
          { label: 'Track Applications', icon: FileText, color: '#3B82F6' },
          { label: 'Career Guidance', icon: Lightbulb, color: '#F59E0B' },
          { label: 'Build Resume', icon: Edit3, color: '#EF4444' },
          { label: 'Ask Prerana AI', icon: Brain, color: '#8B5CF6' },
        ].map((a, i) => {
          const Icon = a.icon;
          return (
            <button key={i}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all hover:shadow-md active:scale-95"
              style={{ background: `${a.color}12`, color: a.color }}
            ><Icon size={14} /> {a.label}</button>
          );
        })}
      </motion.div>

      {/* Section Tabs */}
      <motion.div variants={fadeUp} className="flex gap-2 flex-wrap border-b border-gray-100 pb-3">
        {[
          { key: 'jobs' as const, label: 'Job Board', icon: Briefcase },
          { key: 'applications' as const, label: 'My Applications', icon: Send },
          { key: 'freelance' as const, label: 'Freelance', icon: Code },
          { key: 'skills' as const, label: 'Skill Hub', icon: GraduationCap },
        ].map((v) => {
          const Icon = v.icon;
          return (
            <button key={v.key} onClick={() => setActiveSection(v.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize flex items-center gap-1.5 ${
                activeSection === v.key ? 'bg-[#6D4CFF] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            ><Icon size={12} />{v.label}</button>
          );
        })}
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search jobs, internships, skills, companies, locations..."
            className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:border-[#6D4CFF] transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><Mic size={14} /></button>
            <button className="p-1.5 rounded-lg hover:bg-[#F3F0FF] text-[#6D4CFF]/60 hover:text-[#6D4CFF]"><Sparkles size={14} /></button>
            {searchQuery && <button onClick={() => setSearchQuery('')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={14} /></button>}
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all ${
                activeFilter === f ? 'bg-[#6D4CFF] text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >{f}</button>
          ))}
        </div>
      </motion.div>

      {/* My Applications Panel */}
      <AnimatePresence>
        {showMyApps && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <SectionCard title="My Applications" subtitle={`${effectiveApps.length} total applications`}>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                {[
                  { label: 'Total', value: effectiveApps.length, color: COLORS.primary },
                  { label: 'Pending', value: pendingApps.length, color: COLORS.warning },
                  { label: 'Approved', value: approvedApps.length, color: COLORS.success },
                  { label: 'Rejected', value: rejectedApps.length, color: COLORS.danger },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                    <div className="text-lg font-extrabold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[9px] text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
              {effectiveApps.length > 0 ? (
                <div className="space-y-2">
                  {effectiveApps.map((app: any, i: number) => (
                    <div key={app.id || i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                          app.status === 'approved' ? 'bg-green-500' : app.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}>
                          {app.part_time_jobs?.title?.split(' ').map((w: string) => w[0]).slice(0, 2).join('') || 'JB'}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-900">{app.part_time_jobs?.title || 'Job'}</div>
                          <div className="text-[10px] text-gray-400">Applied: {new Date(app.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <Badge variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'} className="text-[9px] capitalize">{app.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Send className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 mb-2">You haven't applied to any jobs yet</p>
                  <button className="px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-[10px] font-semibold">Browse Opportunities</button>
                </div>
              )}
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      {activeSection === 'jobs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column — Jobs */}
          <div className="lg:col-span-8 space-y-6">

            {/* Featured Jobs */}
            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredJobs.map((job: any, i: number) => (
                  <motion.div key={job.id || i} variants={fadeUp} className="p-5 rounded-2xl bg-white border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#8B6FFF] flex items-center justify-center text-white text-xs font-bold">
                          {job.logo || job.title?.split(' ').map((w: string) => w[0]).slice(0, 2).join('') || 'JB'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900">{job.title}</h3>
                            <button onClick={(e) => { e.stopPropagation(); toggleSave(job.id); }}
                              className={`p-1 rounded-lg transition-all ${savedJobs.includes(job.id) ? 'text-[#6D4CFF] bg-[#F3F0FF]' : 'text-gray-300 hover:text-gray-400 opacity-0 group-hover:opacity-100'}`}
                            ><Bookmark size={12} fill={savedJobs.includes(job.id) ? '#6D4CFF' : 'none'} /></button>
                          </div>
                          <div className="text-[10px] text-gray-400">{job.company || job.area}</div>
                        </div>
                      </div>
                      <Badge variant={job.type === 'online' ? 'success' : job.type === 'freelance' ? 'warning' : 'info'} className="text-[8px] capitalize">{job.type}</Badge>
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-2 mb-3">{job.description || ''}</p>
                    <div className="flex items-center gap-3 mb-3 text-[10px]">
                      <div className="flex items-center gap-1 font-bold" style={{ color: COLORS.success }}>
                        <DollarSign size={12} />{job.pay_amount > 0 ? `₹${job.pay_amount.toLocaleString()}/${job.pay_type === 'hourly' ? 'hr' : job.pay_type === 'monthly' ? 'mo' : 'project'}` : 'Negotiable'}
                      </div>
                      {job.location && <div className="flex items-center gap-1 text-gray-400"><MapPin size={10} />{job.location}</div>}
                      {job.slots > 0 && <div className="text-gray-400"><Users size={10} className="inline mr-0.5" />{job.slots} {job.slots > 1 ? 'slots' : 'slot'}</div>}
                      {job.applicants > 0 && <div className="text-gray-400">{job.applicants} applied</div>}
                    </div>
                    {job.skills && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {job.skills.split(',').slice(0, 4).map((s: string, si: number) => (
                          <span key={si} className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-[8px] text-gray-500">{s.trim()}</span>
                        ))}
                        {job.skills.split(',').length > 4 && <span className="px-2 py-0.5 rounded-md bg-gray-50 text-[8px] text-gray-400">+{job.skills.split(',').length - 4}</span>}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => setApplyJob(job)} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B6FFF] text-white text-[10px] font-semibold hover:shadow-md transition-all active:scale-95">Apply Now</button>
                      <button className="px-3 py-2 rounded-xl border border-gray-200 text-gray-500 text-[10px] font-medium hover:bg-gray-50 transition-all"><Eye size={12} /></button>
                    </div>
                    {job.deadline && (
                      <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between text-[9px]">
                        <span className="text-gray-400">
                          Deadline: {new Date(job.deadline).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </span>
                        {job.experience && <Badge variant="default" className="text-[7px] bg-gray-50">{job.experience}</Badge>}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-white border border-gray-100">
                <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">No jobs match your filter</h3>
                <p className="text-sm text-gray-400 mb-4">Try adjusting your search or filters</p>
                <button onClick={() => { setSearchQuery(''); setActiveFilter('All Jobs'); setJobFilter('all'); }} className="px-6 py-2.5 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5A3FD6] transition-all">Explore All Opportunities</button>
              </div>
            )}
          </div>

          {/* Right Column — Insights */}
          <div className="lg:col-span-4 space-y-4">

            {/* Profile Strength */}
            <SectionCard title="Career Profile" subtitle="Complete your career profile">
              <div className="text-center mb-4">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#F3F0FF" strokeWidth="6" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#6D4CFF" strokeWidth="6"
                      strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * 0.35}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-extrabold text-[#6D4CFF]">65%</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500">Add your skills and experience to get matched with the best jobs</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Profile Photo', done: true },
                  { label: 'Skills Added', done: true },
                  { label: 'Resume Uploaded', done: false },
                  { label: 'Experience', done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px]">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {item.done ? <CheckCircle2 size={10} /> : <X size={10} />}
                    </div>
                    <span className={item.done ? 'text-gray-700' : 'text-gray-400'}>{item.label}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 py-2 rounded-xl bg-[#6D4CFF] text-white text-[10px] font-semibold hover:bg-[#5A3FD6] transition-all">Complete Profile</button>
            </SectionCard>

            {/* Quick Stats */}
            <SectionCard title="Job Match Insights" subtitle="Based on your profile">
              {[
                { label: 'Profile Strength', value: '65%', color: COLORS.primary },
                { label: 'Job Match Score', value: '78%', color: COLORS.success },
                { label: 'Interview Chances', value: 'Medium', color: COLORS.warning },
                { label: 'Weekly Progress', value: '+15%', color: COLORS.info },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 mb-2 last:mb-0">
                  <span className="text-[10px] text-gray-600">{s.label}</span>
                  <span className="text-xs font-extrabold" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </SectionCard>

            {/* AI Recommendations */}
            <SectionCard title="Recommended by Prerana AI" subtitle="Personalized career advice">
              <div className="space-y-2">
                {aiRecommendations.slice(0, 4).map((r, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-gradient-to-r from-[#F3F0FF] to-white border border-[#6D4CFF]/10">
                    <div className="flex items-start gap-2">
                      <Brain size={12} className="text-[#6D4CFF] mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-gray-900">{r.title}</span>
                          <Badge variant={r.priority === 'High' ? 'danger' : r.priority === 'Medium' ? 'warning' : 'default'} className="text-[7px]">{r.priority}</Badge>
                        </div>
                        <div className="text-[8px] text-gray-500">{r.benefit}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[8px] text-gray-400">{r.time}</span>
                          <button className="text-[8px] text-[#6D4CFF] font-semibold hover:underline">{r.action} →</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Job Categories */}
            <SectionCard title="Job Categories" subtitle="Browse by category">
              <div className="grid grid-cols-2 gap-2">
                {demoCategories.slice(0, 8).map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <button key={i} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 hover:shadow-sm transition-all"
                      style={{ background: `${c.color}06` }}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${c.color}12`, color: c.color }}>
                        <Icon size={12} />
                      </div>
                      <div className="text-left">
                        <div className="text-[9px] font-semibold text-gray-900">{c.name}</div>
                        <div className="text-[7px] text-gray-400">{c.count} jobs</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* Upcoming Interviews */}
            <SectionCard title="Upcoming Interviews" subtitle={`${demoInterviews.length} scheduled`}>
              <div className="space-y-2">
                {demoInterviews.map((iv, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F3F0FF] text-[#6D4CFF] flex-shrink-0">
                        <Star size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold text-gray-900">{iv.company}</div>
                        <div className="text-[8px] text-gray-400">{iv.role}</div>
                        <div className="text-[8px] text-gray-400">{new Date(iv.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })} • {iv.time} • {iv.mode}</div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-[#6D4CFF]" style={{ width: `${iv.prepProgress}%` }} />
                          </div>
                          <span className="text-[8px] font-medium text-gray-500">{iv.prepProgress}%</span>
                        </div>
                        <div className="flex gap-1.5 mt-1.5">
                          <button className="px-2 py-0.5 rounded-md bg-[#6D4CFF] text-white text-[7px] font-medium">Join</button>
                          <button className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-600 text-[7px] font-medium">Prepare</button>
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

      {/* Section: My Applications (full view) */}
      {activeSection === 'applications' && (
        <SectionCard title="Application Tracker" subtitle="Track all your job applications">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Status Summary */}
            <div className="space-y-3">
              {[
                { label: 'Total Applications', value: effectiveApps.length, color: COLORS.primary, icon: Send },
                { label: 'Pending Review', value: pendingApps.length, color: COLORS.warning, icon: Clock },
                { label: 'Approved / Selected', value: approvedApps.length, color: COLORS.success, icon: CheckCircle2 },
                { label: 'Offers Received', value: Math.min(approvedApps.length, 2), color: COLORS.info, icon: Award },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12`, color: s.color }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-gray-900">{s.value}</div>
                      <div className="text-[9px] text-gray-400">{s.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Application Details */}
            <div className="lg:col-span-3">
              {effectiveApps.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {effectiveApps.map((app: any, i: number) => (
                    <div key={app.id || i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold ${
                        app.status === 'approved' ? 'bg-green-500' : app.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}>
                        {app.part_time_jobs?.title?.split(' ').map((w: string) => w[0]).slice(0, 2).join('') || 'JB'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900">{app.part_time_jobs?.title || 'Job Application'}</div>
                        <div className="text-xs text-gray-400">Applied: {new Date(app.created_at).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                        <div className="flex gap-2 mt-1">
                          <button className="text-[9px] text-[#6D4CFF] font-medium hover:underline">View Details</button>
                          <button className="text-[9px] text-gray-400 hover:text-gray-600">Withdraw</button>
                        </div>
                      </div>
                      <Badge variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'} className="text-[10px] capitalize">{app.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <Send className="w-16 h-16 text-gray-300 mb-3" />
                  <h3 className="text-base font-bold text-gray-800 mb-1">No Applications Yet</h3>
                  <p className="text-xs text-gray-400 mb-4">Start applying to jobs that match your skills</p>
                  <button onClick={() => setActiveSection('jobs')} className="px-6 py-2.5 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5A3FD6] transition-all">Browse Jobs</button>
                </div>
              )}
            </div>
          </div>
        </SectionCard>
      )}

      {/* Section: Freelance */}
      {activeSection === 'freelance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <SectionCard title="Freelance Projects" subtitle={`${demoFreelance.length} available projects`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {demoFreelance.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-sm transition-all cursor-pointer">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#F3F0FF] text-[#6D4CFF]"><Icon size={16} /></div>
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-gray-900">{f.title}</h4>
                          <div className="text-[10px] text-gray-500">{f.duration}</div>
                        </div>
                        <Badge variant={f.difficulty === 'Easy' ? 'success' : f.difficulty === 'Medium' ? 'warning' : 'danger'} className="text-[7px]">{f.difficulty}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold" style={{ color: COLORS.success }}>{f.budget}</div>
                        <div className="text-[9px] text-gray-400">{f.applicants} applicants</div>
                      </div>
                      <button className="w-full mt-3 py-2 rounded-xl border border-[#6D4CFF]/30 text-[#6D4CFF] text-[10px] font-semibold hover:bg-[#F3F0FF] transition-all">Apply Now</button>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
          {/* Freelance insights */}
          <div className="lg:col-span-4 space-y-4">
            <SectionCard title="Freelance Tips" subtitle="Succeed as a freelancer">
              <div className="space-y-2">
                {[
                  { tip: 'Build a strong portfolio with 5+ samples', icon: Palette },
                  { tip: 'Set competitive rates based on your skill level', icon: DollarSign },
                  { tip: 'Deliver early to build client trust', icon: Zap },
                  { tip: 'Ask for testimonials after each project', icon: Star },
                ].map((t, i) => {
                  const Icon = t.icon;
                  return (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#F3F0FF] text-[#6D4CFF] flex-shrink-0"><Icon size={12} /></div>
                      <span className="text-[9px] text-gray-600">{t.tip}</span>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* Section: Skill Hub */}
      {activeSection === 'skills' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <SectionCard title="Trending Skills" subtitle="Skills employers are looking for">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {demoSkills.map((s, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center hover:shadow-sm transition-all cursor-pointer">
                    <div className={`w-3 h-3 rounded-full mx-auto mb-2`} style={{ background: s.color }} />
                    <div className="text-xs font-bold text-gray-900">{s.name}</div>
                    <Badge variant={s.demand === 'High' ? 'danger' : s.demand === 'Medium' ? 'warning' : 'default'} className="text-[7px] mt-1">{s.demand} Demand</Badge>
                    <div className="text-[8px] text-gray-400 mt-1">{s.courses} courses</div>
                    <button className="w-full mt-2 py-1.5 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF] text-[8px] font-semibold hover:bg-[#6D4CFF]/20 transition-all">Learn</button>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Success Stories */}
            <SectionCard title="Student Success Stories" subtitle="Real earnings from real students">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {demoStories.map((s, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center hover:shadow-sm transition-all">
                    <Avatar className="w-12 h-12 mx-auto mb-2">
                      <div className="flex h-full w-full items-center justify-center text-white text-xs font-bold rounded-full"
                        style={{ background: s.color }}>{s.avatar}</div>
                    </Avatar>
                    <div className="text-xs font-bold text-gray-900">{s.name}</div>
                    <div className="text-[8px] text-gray-400">{s.role}</div>
                    <div className="text-sm font-extrabold mt-1" style={{ color: COLORS.success }}>{s.earned}</div>
                    <div className="text-[8px] text-gray-400">{s.period}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
          <div className="lg:col-span-4 space-y-4">
            <SectionCard title="Recommended Courses" subtitle="Upskill for better opportunities">
              <div className="space-y-2">
                {[
                  { name: 'Full-Stack Web Dev', provider: 'Coursera', duration: '6 months', rating: 4.7 },
                  { name: 'Data Science with Python', provider: 'Udemy', duration: '4 months', rating: 4.5 },
                  { name: 'Digital Marketing', provider: 'Google', duration: '2 months', rating: 4.8 },
                  { name: 'UI/UX Design', provider: 'Figma Academy', duration: '3 months', rating: 4.6 },
                ].map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-[10px] font-semibold text-gray-900">{c.name}</div>
                    <div className="text-[8px] text-gray-400">{c.provider} • {c.duration}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={8} className="text-yellow-500" fill="currentColor" />
                      <span className="text-[8px] text-gray-500">{c.rating}</span>
                      <button className="ml-auto text-[8px] text-[#6D4CFF] font-semibold hover:underline">Enroll →</button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* Bottom Section: Internships Hub + Career Events + Job Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Internships */}
        <SectionCard title="Internships Hub" subtitle="Paid & remote internships">
          <div className="space-y-2">
            {effectiveJobs.filter((j: any) => j.type === 'online').slice(0, 4).map((job: any, i: number) => (
              <div key={job.id || i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-all">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#8B6FFF] flex items-center justify-center text-white text-[9px] font-bold">
                  {job.title?.split(' ').map((w: string) => w[0]).slice(0, 2).join('') || 'IN'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-gray-900 truncate">{job.title}</div>
                  <div className="text-[8px] text-gray-400">{job.pay_amount > 0 ? `₹${job.pay_amount.toLocaleString()}/mo` : 'Paid'} • {job.area || 'Remote'}</div>
                </div>
                <Badge variant="success" className="text-[7px]">{job.type}</Badge>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Career Events */}
        <SectionCard title="Career Events" subtitle="Workshops, hiring events & more">
          <div className="space-y-2">
            {demoCareerEvents.map((e, i) => {
              const Icon = e.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F3F0FF] text-[#6D4CFF] flex-shrink-0"><Icon size={14} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-gray-900">{e.title}</div>
                    <div className="text-[8px] text-gray-400">{e.type} • {e.mode} • {new Date(e.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[8px] text-gray-400">{e.seats} seats</span>
                      <button className="text-[8px] text-[#6D4CFF] font-semibold hover:underline">Register →</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Job Categories Grid */}
        <SectionCard title="Job Categories" subtitle={`${demoCategories.length} categories`}>
          <div className="grid grid-cols-2 gap-2">
            {demoCategories.map((c, i) => {
              const Icon = c.icon;
              return (
                <button key={i} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 hover:shadow-sm transition-all"
                  style={{ background: `${c.color}06` }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${c.color}12`, color: c.color }}>
                    <Icon size={12} />
                  </div>
                  <div className="text-left">
                    <div className="text-[9px] font-semibold text-gray-900">{c.name}</div>
                    <div className="text-[7px] text-gray-400">{c.count} jobs</div>
                  </div>
                </button>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Earnings Dashboard */}
      <SectionCard title="Earnings Dashboard" subtitle="Your earning potential and analytics">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {[
              { label: 'Expected Monthly', value: `₹${avgSalary.toLocaleString()}`, icon: DollarSign, color: COLORS.success },
              { label: 'Total Potential', value: `₹${effectiveJobs.reduce((s: number, j: any) => s + (j.pay_amount || 0), 0).toLocaleString()}`, icon: TrendingUp, color: COLORS.primary },
              { label: 'Available Projects', value: effectiveJobs.length, icon: Briefcase, color: COLORS.warning },
              { label: 'Active Applications', value: pendingApps.length, icon: Send, color: COLORS.info },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12`, color: s.color }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-gray-900">{s.value}</div>
                    <div className="text-[9px] text-gray-400">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="lg:col-span-3">
            <div className="text-[11px] font-semibold text-gray-600 mb-3">Monthly Earnings Overview</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="earnings" stroke="#22C55E" strokeWidth={2} fill="url(#earningsGrad)" dot={{ r: 3, fill: '#22C55E' }} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 11 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </SectionCard>

      {/* Apply Modal */}
      <AnimatePresence>
        {applyJob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setApplyJob(null)}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Apply for</h3>
                  <p className="text-sm text-[#6D4CFF] font-semibold">{applyJob.title}</p>
                </div>
                <button onClick={() => setApplyJob(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#8B6FFF] flex items-center justify-center text-white text-[9px] font-bold">
                  {applyJob.logo || applyJob.title?.split(' ').map((w: string) => w[0]).slice(0, 2).join('') || 'JB'}
                </div>
                <div>
                  <div className="text-xs font-semibold">{applyJob.company || applyJob.area}</div>
                  <div className="text-[10px] text-gray-400">{applyJob.location} • {applyJob.pay_amount > 0 ? `₹${applyJob.pay_amount.toLocaleString()}/${applyJob.pay_type || 'mo'}` : 'Negotiable'}</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-1 block">Phone Number</label>
                  <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6D4CFF] transition-all bg-gray-50" placeholder="Your contact number" value={appForm.phone} onChange={e => setAppForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-500 mb-1 block">Cover Note</label>
                  <textarea className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#6D4CFF] transition-all bg-gray-50 min-h-[80px]" placeholder="Why are you a good fit for this role?" value={appForm.cover_note} onChange={e => setAppForm(p => ({ ...p, cover_note: e.target.value }))} />
                </div>
                <button onClick={handleApply} disabled={applying}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B6FFF] text-white text-xs font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >{applying ? 'Submitting...' : 'Submit Application'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

// Need Upload icon
function Upload(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>}
