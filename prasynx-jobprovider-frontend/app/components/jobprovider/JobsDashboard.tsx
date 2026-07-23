'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Plus, Edit3, Trash2, Eye, X, Users, CheckCircle2, Clock,
  DollarSign, MapPin, FileText, Search, ChevronDown, ArrowUpRight,
  Building2, Mail, Phone, Star, Filter, MoreHorizontal, UserCheck,
  CalendarDays, MessageSquare, BarChart3, Bell, Target, TrendingUp,
  Award, Download, Upload, Send, Share2, Play, Pause, ChevronRight,
  Sparkles, BookOpen, GraduationCap, Sliders, ClipboardList, UserPlus,
  Video, ThumbsUp, Activity, RefreshCw, Zap, Bookmark,
  Globe, Home, Copy, AlertCircle, CheckCircle, Hourglass, Ban,
  ExternalLink, Settings, HelpCircle, ListChecks, Hash,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart as ReLineChart, Line, AreaChart, Area, PieChart, Pie, Cell, CartesianGrid,
} from 'recharts';
import apiClient from '../../lib/apiClient';

const CLR = {
  primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B',
  danger: '#EF4444', info: '#3B82F6', purple: '#A855F7',
  indigo: '#4F46E5', pink: '#EC4899',
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const statusColors: Record<string, { color: string; bg: string; label: string }> = {
  active: { color: '#10B981', bg: '#F0FDF4', label: 'Active' },
  draft: { color: '#94A3B8', bg: '#F8FAFC', label: 'Draft' },
  paused: { color: '#F59E0B', bg: '#FFFBEB', label: 'Paused' },
  expired: { color: '#EF4444', bg: '#FEF2F2', label: 'Expired' },
  closed: { color: '#6B7280', bg: '#F3F4F6', label: 'Closed' },
};

const aiInsights: { icon: any; bg: string; color: string; text: string }[] = [
  { icon: Sparkles, bg: '#F3F0FF', color: '#6D4CFF', text: 'Top candidate matches are 15% higher in quality this week compared to last week.' },
  { icon: TrendingUp, bg: '#F0FDF4', color: '#22C55E', text: 'Engineering job postings received 45% more traction than other categories.' },
  { icon: Target, bg: '#EFF6FF', color: '#3B82F6', text: 'Optimize job descriptions with keywords like React, TypeScript to boost application rate.' }
];

export default function JobsDashboard({ provider }: { provider: any }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState({ title: '', description: '', type: 'local', area: '', pay_type: 'fixed', pay_amount: '', duration: '', slots: '1', skills: '', contact_info: '', target_role: '', department: '', experience: '', salary: '', status: 'draft' });
  const [submitting, setSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [showApps, setShowApps] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [tabView, setTabView] = useState<string>('all');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const loadJobs = async () => {
    const res = await apiClient.get('/job-provider/jobs');
    if (res.success) setJobs((res.data || []) as any[]);
    setLoading(false);
  };

  useEffect(() => { loadJobs(); }, []);

  const filteredJobs = useMemo(() => {
    let items = jobs;
    if (activeFilter !== 'all') items = items.filter((j: any) => j.status === activeFilter);
    if (statusFilter !== 'all') items = items.filter((j: any) => j.status === statusFilter);
    if (typeFilter !== 'all') items = items.filter((j: any) => j.type === typeFilter);
    if (deptFilter !== 'all') items = items.filter((j: any) => j.department?.toLowerCase() === deptFilter.toLowerCase());
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter((j: any) =>
        j.title?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q) ||
        j.skills?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.department?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [jobs, activeFilter, typeFilter, deptFilter, statusFilter, searchTerm]);

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j: any) => j.status === 'active').length;
  const draftJobs = jobs.filter((j: any) => j.status === 'draft').length;
  const expiredJobs = jobs.filter((j: any) => j.status === 'expired').length;
  const totalApps = jobs.reduce((s: number, j: any) => s + (j.applications || 0), 0);
  const totalShortlisted = jobs.reduce((s: number, j: any) => s + (j.shortlisted || 0), 0);
  const totalInterviews = jobs.reduce((s: number, j: any) => s + (j.interviews || 0), 0);
  const totalHired = jobs.reduce((s: number, j: any) => s + (j.hired || 0), 0);
  const totalViews = jobs.reduce((s: number, j: any) => s + (j.views || 0), 0);
  const conversionRate = totalApps > 0 ? Math.round((totalHired / totalApps) * 100) : 0;

  const departments = useMemo(() => [...new Set(jobs.map((j: any) => j.department).filter(Boolean))], [jobs]);

  const resetForm = () => {
    setJobForm({ title: '', description: '', type: 'local', area: '', pay_type: 'fixed', pay_amount: '', duration: '', slots: '1', skills: '', contact_info: '', target_role: '', department: '', experience: '', salary: '', status: 'draft' });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = { ...jobForm, pay_amount: Number(jobForm.pay_amount), slots: Number(jobForm.slots) };
    const res = editingId ? await apiClient.patch(`/job-provider/jobs/${editingId}`, payload) : await apiClient.post('/job-provider/jobs', payload);
    setSubmitting(false);
    if (res.success) { setShowForm(false); resetForm(); loadJobs(); }
    else alert(res.error || 'Failed');
  };

  const deleteJob = async (id: string) => {
    const res = await apiClient.delete(`/job-provider/jobs/${id}`);
    if (res.success) { loadJobs(); setShowDeleteConfirm(null); }
  };

  const duplicateJob = (job: any) => {
    const newJob = { ...job, id: `demo_${Date.now()}`, title: `${job.title} (Copy)`, status: 'draft', applications: 0, shortlisted: 0, interviews: 0, hired: 0, views: 0, created_at: new Date().toISOString() };
    setJobs(prev => [newJob, ...prev]);
  };

  const toggleJobStatus = (id: string, newStatus: string) => {
    apiClient.patch(`/job-provider/jobs/${id}`, { status: newStatus }).then(res => { if (res.success) loadJobs(); });
  };

  const viewApplications = async (job: any) => {
    setSelectedJob(job);
    const res = await apiClient.get<any[]>(`/job-provider/jobs/${job.id}/applications`);
    if (res.success) setApplications(res.data || []);
    setShowApps(true);
  };

  const updateAppStatus = async (appId: string, status: string) => {
    const res = await apiClient.patch(`/job-provider/applications/${appId}/status`, { status });
    if (res.success) viewApplications(selectedJob);
  };

  const editJob = (job: any) => {
    setJobForm({
      title: job.title || '',
      description: job.description || '',
      type: job.type || 'local',
      area: job.area || '',
      pay_type: job.pay_type || 'fixed',
      pay_amount: String(job.pay_amount || ''),
      duration: job.duration || '',
      slots: String(job.slots || '1'),
      skills: job.skills || '',
      contact_info: job.contact_info || '',
      target_role: job.target_role || '',
      department: job.department || '',
      experience: job.experience || '',
      salary: job.salary || '',
      status: job.status || 'draft',
    });
    setEditingId(job.id);
    setShowForm(true);
  };

  const handleBulkImport = () => {
    fileInputRef.current?.click();
  };
  const onFileImport = (e: any) => {
    toast.success('Bulk import initiated. Processing CSV file...');
  };

  if (showApps && selectedJob) {
    return (
      <motion.div initial="initial" animate="animate" variants={stagger} className="max-w-[1600px] mx-auto space-y-6">
        <motion.div variants={fadeUp}>
          <button onClick={() => { setShowApps(false); setApplications([]); }} className="mb-4 text-xs text-[#6D4CFF] font-semibold hover:underline flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Back to Jobs
          </button>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Applications for {selectedJob.title}</h3>
                <p className="text-sm text-gray-400">{applications.length} total applications</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {}} className="px-3 py-2 rounded-xl bg-[#F3F0FF] text-[#6D4CFF] text-xs font-semibold hover:bg-[#E8E3FF] transition-all flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
                <button onClick={() => { setShowApps(false); }} className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-all flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5" /> Close
                </button>
              </div>
            </div>
            {applications.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium text-gray-600">No applications yet</p>
                <p className="text-sm mt-1">Applications will appear here once candidates start applying.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app: any) => {
                  const statusStyle = app.status === 'approved' || app.status === 'hired' ? { color: '#10B981', bg: '#F0FDF4' } :
                    app.status === 'rejected' ? { color: '#EF4444', bg: '#FEF2F2' } :
                    app.status === 'shortlisted' ? { color: '#3B82F6', bg: '#EFF6FF' } :
                    { color: '#F59E0B', bg: '#FFFBEB' };
                  return (
                    <div key={app.id} className="flex flex-col sm:flex-row sm:items-start justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#6D4CFF]/20 hover:bg-white transition-all gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center text-[#6D4CFF] font-bold text-sm flex-shrink-0">
                          {app.applicant_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900">{app.applicant_name || app.name || 'Applicant'}</span>
                            <Badge className="text-[9px] font-semibold border-0" style={{ background: statusStyle.bg, color: statusStyle.color }}>{app.status}</Badge>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {app.applicant_email || app.email}
                            {app.applicant_type && <> • {app.applicant_type}</>}
                            {app.phone && <> • {app.phone}</>}
                          </div>
                          {app.cover_note && <div className="text-xs text-gray-500 mt-2 italic bg-white p-2.5 rounded-lg border border-gray-100">"{app.cover_note}"</div>}
                          <div className="text-[10px] text-gray-400 mt-1">Applied {new Date(app.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:ml-4 flex-shrink-0">
                        <button onClick={() => updateAppStatus(app.id, 'shortlisted')} className="px-3 py-1.5 rounded-lg bg-[#EFF6FF] text-[#3B82F6] text-[10px] font-semibold hover:bg-[#DBEAFE] transition-all flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Shortlist
                        </button>
                        <button onClick={() => updateAppStatus(app.id, 'rejected')} className="px-3 py-1.5 rounded-lg bg-[#FEF2F2] text-[#EF4444] text-[10px] font-semibold hover:bg-[#FEE2E2] transition-all flex items-center gap-1">
                          <X className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="max-w-[1600px] mx-auto space-y-6">
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
              <span className="text-[10px] font-semibold text-purple-100 uppercase tracking-wider">Recruitment Management</span>
            </div>
            <Badge className="bg-white/15 text-white border-0 text-[9px]">{provider?.company_name || 'Provider'}</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">My Jobs</h1>
          <p className="text-sm text-white/80 mt-1 max-w-xl">Manage job postings, track applicants, monitor hiring pipelines, and optimize recruitment performance.</p>
          <div className="flex flex-wrap gap-3 mt-5">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
              <Briefcase className="w-4 h-4 text-[#10B981]" />
              <div><span className="text-[10px] text-purple-200/70 block">Total Jobs</span><span className="text-sm font-bold text-white">{totalJobs}</span></div>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
              <TrendingUp className="w-4 h-4 text-[#3B82F6]" />
              <div><span className="text-[10px] text-purple-200/70 block">Applications</span><span className="text-sm font-bold text-white">{totalApps}</span></div>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
              <UserCheck className="w-4 h-4 text-[#F59E0B]" />
              <div><span className="text-[10px] text-purple-200/70 block">Interviews</span><span className="text-sm font-bold text-white">{totalInterviews}</span></div>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
              <Award className="w-4 h-4 text-[#22C55E]" />
              <div><span className="text-[10px] text-purple-200/70 block">Hired</span><span className="text-sm font-bold text-white">{totalHired}</span></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-5">
            <Button onClick={() => { resetForm(); setShowForm(true); }}
              className="bg-white text-[#6D4CFF] hover:bg-white/95 hover:-translate-y-0.5 active:scale-[0.97] font-bold rounded-xl text-xs h-9 px-4 shadow-[0_4px_12px_rgba(255,255,255,0.15)] border-0 transition-all duration-200 gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Post New Job
            </Button>
            <Button onClick={handleBulkImport}
              className="bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.97] text-white font-bold rounded-xl text-xs h-9 px-4 border border-white/25 transition-all duration-200 gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Bulk Import
            </Button>
            <Button onClick={() => { resetForm(); setJobForm(prev => ({ ...prev, title: 'Using template...' })); setShowForm(true); }}
              className="bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.97] text-white font-bold rounded-xl text-xs h-9 px-4 border border-white/25 transition-all duration-200 gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Job Templates
            </Button>
            <Button onClick={() => setAiPanelOpen(true)}
              className="bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.97] text-white font-bold rounded-xl text-xs h-9 px-4 border border-white/25 transition-all duration-200 gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Recruitment Analytics
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ===== KPI CARDS ===== */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: Briefcase, label: 'Total Jobs', value: totalJobs, desc: `${activeJobs} Active`, color: '#6D4CFF', bg: '#F3F0FF', trend: '+12%' },
          { icon: CheckCircle2, label: 'Active Jobs', value: activeJobs, desc: `${draftJobs} Drafts`, color: '#10B981', bg: '#F0FDF4', trend: '+8%' },
          { icon: Users, label: 'Applications', value: totalApps, desc: `Avg ${totalJobs > 0 ? Math.round(totalApps / totalJobs) : 0}/job`, color: '#3B82F6', bg: '#EFF6FF', trend: '+24%' },
          { icon: UserCheck, label: 'Shortlisted', value: totalShortlisted, desc: `${totalShortlisted > 0 ? Math.round((totalShortlisted / totalApps) * 100) : 0}% rate`, color: '#F59E0B', bg: '#FFFBEB', trend: '+15%' },
          { icon: CalendarDays, label: 'Interviews', value: totalInterviews, desc: `${totalInterviews} Scheduled`, color: '#A855F7', bg: '#F5F3FF', trend: '+30%' },
          { icon: Award, label: 'Hired', value: totalHired, desc: `${conversionRate}% Conversion`, color: '#22C55E', bg: '#F0FDF4', trend: '+5%', progress: conversionRate },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={i} whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#6D4CFF]/20 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: item.bg, color: item.color }}><Icon className="w-4.5 h-4.5" /></div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-semibold" style={{ color: item.color }}>{item.trend}</span>
                  <TrendingUp className="w-3 h-3" style={{ color: item.color }} />
                </div>
              </div>
              <div className="text-[11px] font-medium text-gray-400 mb-0.5">{item.label}</div>
              <div className="text-lg font-extrabold text-gray-900">{item.value}</div>
              <div className="text-[10px]" style={{ color: item.color }}>{item.desc}</div>
              {(item as any).progress !== undefined && (
                <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(item as any).progress}%` }} transition={{ duration: 1, delay: 0.5 + i * 0.08 }}
                    className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}88)` }} />
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* ===== MAIN LAYOUT: TWO COLUMNS ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* ===== CHARTS SECTION ===== */}
          {jobs.length > 0 && (
            <motion.div variants={fadeUp}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-[#6D4CFF]" />Applications Trend</h3>
                    <Badge className="text-[9px] bg-[#F3F0FF] text-[#6D4CFF] border-0">Last 6 Months</Badge>
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[]}>
                        <defs><linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6D4CFF" stopOpacity={0.2} /><stop offset="100%" stopColor="#6D4CFF" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                        <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #F3F4F6' }} />
                        <Area type="monotone" dataKey="applications" stroke="#6D4CFF" strokeWidth={2} fill="url(#appGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#6D4CFF]" />Hiring Funnel</h3>
                    <Badge className="text-[9px] bg-[#F0FDF4] text-[#10B981] border-0">{conversionRate}% Conv.</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-center py-4 text-[11px] text-gray-400">No funnel data available</div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* ===== FILTER BAR ===== */}
          <motion.div variants={fadeUp}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-100 w-fit flex-wrap">
                {[
                  { key: 'all', label: 'All Jobs', count: totalJobs },
                  { key: 'active', label: 'Active', count: activeJobs },
                  { key: 'draft', label: 'Draft', count: draftJobs },
                  { key: 'paused', label: 'Paused', count: jobs.filter((j: any) => j.status === 'paused').length },
                  { key: 'expired', label: 'Expired', count: expiredJobs },
                  { key: 'closed', label: 'Closed', count: jobs.filter((j: any) => j.status === 'closed').length },
                ].map((tab) => (
                  <button key={tab.key} onClick={() => setActiveFilter(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${activeFilter === tab.key ? 'bg-white text-[#6D4CFF] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}>
                    {tab.label} <span className="text-[9px] opacity-60">({tab.count})</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="relative flex-1 w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input type="text" placeholder="Search jobs by title, skill, department..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] transition-all"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#6D4CFF]">
                    <option value="all">All Departments</option>
                    {departments.map((d: string) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#6D4CFF]">
                    <option value="all">All Types</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-gray-100">
                    {(['grid', 'list'] as const).map((mode) => (
                      <button key={mode} onClick={() => setTabView(mode)}
                        className={`p-1.5 rounded-md text-[10px] font-semibold transition-all ${tabView === mode ? 'bg-white text-[#6D4CFF] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                        {mode === 'grid' ? '▦' : '☰'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ===== JOB LISTINGS ===== */}
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" /></div>
          ) : filteredJobs.length === 0 ? (
            <motion.div variants={fadeUp}>
              <Card className="p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center">
                  <Briefcase className="w-12 h-12 text-[#6D4CFF]" />
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">No Jobs Posted Yet</h2>
                <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">Create your first job posting and start attracting qualified candidates. Use our AI-powered tools to optimize your recruitment.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button onClick={() => { resetForm(); setShowForm(true); }}
                    className="bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white rounded-xl text-xs h-9 gap-1.5 shadow-[0_4px_12px_rgba(109,76,255,0.25)]">
                    <Plus className="w-4 h-4" /> Post New Job
                  </Button>
                  <Button variant="outline" className="rounded-xl text-xs h-9 gap-1.5"
                    onClick={() => { resetForm(); setJobForm(prev => ({ ...prev, title: 'Using template...' })); setShowForm(true); }}>
                    <FileText className="w-4 h-4" /> Use Job Template
                  </Button>
                  <Button variant="outline" className="rounded-xl text-xs h-9 gap-1.5"
                    onClick={() => setAiPanelOpen(true)}>
                    <Sparkles className="w-4 h-4" /> Ask Prerana AI
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : tabView === 'grid' ? (
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job: any, i: number) => {
                const st = statusColors[job.status] || statusColors.draft;
                const isExpanded = expandedJob === job.id;
                const appRatio = job.applications > 0 ? Math.round((job.hired / job.applications) * 100) : 0;
                return (
                  <motion.div key={job.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#6D4CFF]/20 transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge className="text-[9px] font-semibold border-0" style={{ background: st.bg, color: st.color }}>{st.label}</Badge>
                        {job.type && <Badge variant="outline" className="text-[9px] text-gray-400 border-gray-200">{job.type}</Badge>}
                        {job.department && <Badge variant="outline" className="text-[9px] text-gray-400 border-gray-200">{job.department}</Badge>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-300 hover:text-gray-600 transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 mb-1 group-hover:text-[#6D4CFF] transition-colors">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400 mb-2">
                      {job.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{job.location}</span>}
                      {job.salary && <span className="flex items-center gap-0.5 font-semibold text-[#10B981]"><DollarSign className="w-3 h-3" />{job.salary}</span>}
                      {job.experience && <span>{job.experience}</span>}
                    </div>
                    <p className="text-[11px] text-gray-500 mb-3 line-clamp-2">{job.description || 'No description'}</p>
                    {job.skills && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {job.skills.split(',').slice(0, 4).map((s: string, si: number) => (
                          <span key={si} className="px-2 py-0.5 rounded-md bg-gray-100 text-[9px] text-gray-500 font-medium">{s.trim()}</span>
                        ))}
                        {job.skills.split(',').length > 4 && <span className="text-[9px] text-gray-400">+{job.skills.split(',').length - 4}</span>}
                      </div>
                    )}
                    <div className="grid grid-cols-4 gap-2 mb-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      {[
                        { label: 'Apps', value: job.applications || 0, color: '#6D4CFF' },
                        { label: 'Shortlisted', value: job.shortlisted || 0, color: '#3B82F6' },
                        { label: 'Interviews', value: job.interviews || 0, color: '#F59E0B' },
                        { label: 'Hired', value: job.hired || 0, color: '#10B981' },
                      ].map((m, mi) => (
                        <div key={mi} className="text-center">
                          <div className="text-sm font-extrabold" style={{ color: m.color }}>{m.value}</div>
                          <div className="text-[8px] text-gray-400 uppercase">{m.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button onClick={() => viewApplications(job)}
                        className="flex-1 py-2 rounded-lg bg-[#6D4CFF] text-white text-[10px] font-semibold hover:bg-[#5B3FE8] transition-all flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3" /> View Apps
                      </button>
                      <button onClick={() => editJob(job)}
                        className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-[#6D4CFF] hover:border-[#6D4CFF]/30 hover:bg-[#F3F0FF] transition-all">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => duplicateJob(job)}
                        className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-[#3B82F6] hover:border-[#3B82F6]/30 hover:bg-[#EFF6FF] transition-all">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <div className="relative">
                        <button onClick={() => setShowDeleteConfirm(showDeleteConfirm === job.id ? null : job.id)}
                          className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <AnimatePresence>
                          {showDeleteConfirm === job.id && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-xl border border-gray-100 p-3 w-48">
                              <p className="text-[11px] font-medium text-gray-700 mb-2">Delete this job?</p>
                              <div className="flex gap-1.5">
                                <button onClick={() => deleteJob(job.id)}
                                  className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-[10px] font-semibold hover:bg-red-600 transition-all">Delete</button>
                                <button onClick={() => setShowDeleteConfirm(null)}
                                  className="flex-1 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-gray-200 transition-all">Cancel</button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3 pt-3 border-t border-gray-100 overflow-hidden">
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="text-gray-500">Posted: <span className="font-semibold text-gray-700">{new Date(job.created_at).toLocaleDateString()}</span></div>
                          <div className="text-gray-500">Expires: <span className="font-semibold text-gray-700">{job.expires_at ? new Date(job.expires_at).toLocaleDateString() : '—'}</span></div>
                          <div className="text-gray-500">Views: <span className="font-semibold text-gray-700">{job.views || 0}</span></div>
                          <div className="text-gray-500">Slots: <span className="font-semibold text-gray-700">{job.slots || 1}</span></div>
                          <div className="text-gray-500">Conversion: <span className="font-semibold text-[#10B981]">{appRatio}%</span></div>
                          <div className="flex gap-1">
                            <button onClick={() => toggleJobStatus(job.id, job.status === 'active' ? 'paused' : 'active')}
                              className="text-[#6D4CFF] hover:underline">{(job.status === 'active' ? 'Pause' : 'Activate')}</button>
                            <span className="text-gray-300">|</span>
                            <button onClick={() => { navigator.clipboard.writeText(window.location.origin + '/jobs/' + job.id); }}
                              className="text-[#3B82F6] hover:underline">Share</button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} className="space-y-2.5">
              {filteredJobs.map((job: any, i: number) => {
                const st = statusColors[job.status] || statusColors.draft;
                return (
                  <motion.div key={job.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-[#6D4CFF]/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-[#6D4CFF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-gray-900">{job.title}</h3>
                          <Badge className="text-[8px] font-semibold border-0" style={{ background: st.bg, color: st.color }}>{st.label}</Badge>
                          <Badge variant="outline" className="text-[8px] text-gray-400 border-gray-200">{job.type}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-0.5">
                          <span>{job.location || 'Remote'}</span>
                          {job.salary && <span className="text-[#10B981] font-semibold">{job.salary}</span>}
                          <span>{job.department}</span>
                          <span>{job.applications || 0} applications</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => viewApplications(job)}
                          className="px-3 py-1.5 rounded-lg bg-[#F3F0FF] text-[#6D4CFF] text-[10px] font-semibold hover:bg-[#E8E3FF] transition-all">View</button>
                        <button onClick={() => editJob(job)}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-[#6D4CFF] transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-4">
          {/* PERFORMANCE SUMMARY */}
          <motion.div variants={fadeUp}>
            <Card className="p-4">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-3"><BarChart3 className="w-3.5 h-3.5 text-[#6D4CFF]" />Performance Summary</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Total Jobs', value: totalJobs, color: '#6D4CFF' },
                  { label: 'Active', value: activeJobs, color: '#10B981' },
                  { label: 'Draft', value: draftJobs, color: '#94A3B8' },
                  { label: 'Expired/Closed', value: expiredJobs + jobs.filter((j: any) => j.status === 'closed').length, color: '#EF4444' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <span className="text-[11px] text-gray-500">{s.label}</span>
                    <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-gray-500">Conversion Rate</span>
                    <span className="text-xs font-bold text-[#10B981]">{conversionRate}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${conversionRate}%` }} transition={{ duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#22C55E]" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* QUICK ACTIONS */}
          <motion.div variants={fadeUp}>
            <Card className="p-4">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-3"><Zap className="w-3.5 h-3.5 text-[#6D4CFF]" />Quick Actions</h3>
              <div className="space-y-1.5">
                {[
                  { icon: Plus, label: 'Post New Job', color: '#6D4CFF', action: () => { resetForm(); setShowForm(true); } },
                  { icon: Upload, label: 'Bulk Import', color: '#3B82F6', action: handleBulkImport },
                  { icon: FileText, label: 'Job Templates', color: '#F59E0B', action: () => toast.info('Job templates coming soon') },
                  { icon: Bookmark, label: 'Saved Searches', color: '#EC4899', action: () => toast.info('Saved searches coming soon') },
                  { icon: CalendarDays, label: 'Interview Calendar', color: '#A855F7', action: () => toast.info('Interview calendar opening...') },
                ].map((q, i) => {
                  const Icon = q.icon;
                  return (
                    <button key={i} onClick={q.action}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-medium text-gray-600 hover:bg-gray-50 hover:text-[#6D4CFF] transition-all group">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: q.color + '12', color: q.color }}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{q.label}</span>
                      <ChevronRight className="w-3 h-3 ml-auto text-gray-300 group-hover:text-[#6D4CFF] group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* RECENT ACTIVITY */}
          <motion.div variants={fadeUp}>
            <Card className="p-4">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-3"><Activity className="w-3.5 h-3.5 text-[#6D4CFF]" />Recent Activity</h3>
              <div className="text-center py-4 text-[11px] text-gray-400">No recent activity</div>
            </Card>
          </motion.div>

          {/* AI INSIGHTS */}
          <motion.div variants={fadeUp}>
            <Card className="p-4 bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] border-[rgba(109,76,255,0.15)]">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#6D4CFF]" />
                <h3 className="text-xs font-bold text-[#6D4CFF]">AI Recruitment Insights</h3>
              </div>
              <div className="text-center py-4 text-[11px] text-gray-400">No insights available yet</div>
              <button onClick={() => setAiPanelOpen(true)}
                className="mt-3 w-full py-2 rounded-xl bg-white text-[10px] font-semibold text-[#6D4CFF] border border-[rgba(109,76,255,0.2)] hover:bg-[#6D4CFF] hover:text-white transition-all flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Open AI Assistant
              </button>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ===== HIDDEN FILE INPUT ===== */}
      <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx,.json" onChange={onFileImport} />

      {/* ===== POST/EDIT JOB MODAL ===== */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center">
                    {editingId ? <Edit3 className="w-5 h-5 text-[#6D4CFF]" /> : <Plus className="w-5 h-5 text-[#6D4CFF]" />}
                  </div>
                  <div><h3 className="font-bold text-base">{editingId ? 'Edit Job' : 'Post a New Job'}</h3><p className="text-[11px] text-gray-400">Fill in the details below</p></div>
                </div>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"><X size={18} className="text-gray-400" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Job Title *</label>
                  <input className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:bg-white focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] transition-all" placeholder="e.g. Senior Frontend Developer" value={jobForm.title} onChange={e => setJobForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Department</label>
                  <select className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] transition-all" value={jobForm.department} onChange={e => setJobForm(p => ({ ...p, department: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                    <option value="Content">Content</option>
                    <option value="Data">Data</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Job Type</label>
                  <select className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] transition-all" value={jobForm.type} onChange={e => setJobForm(p => ({ ...p, type: e.target.value }))}>
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Location</label>
                  <input className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:bg-white focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] transition-all" placeholder="e.g. Bangalore, Remote" value={jobForm.area} onChange={e => setJobForm(p => ({ ...p, area: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Experience Required</label>
                  <input className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:bg-white focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] transition-all" placeholder="e.g. 2-4 yrs" value={jobForm.experience} onChange={e => setJobForm(p => ({ ...p, experience: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Salary Range</label>
                  <input className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:bg-white focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] transition-all" placeholder="e.g. $80k-$120k or ₹15k/mo" value={jobForm.salary} onChange={e => setJobForm(p => ({ ...p, salary: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Description</label>
                  <textarea className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:bg-white focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] transition-all min-h-[80px] resize-none" placeholder="Describe the role, responsibilities, and requirements..." value={jobForm.description} onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Skills (comma separated)</label>
                  <input className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:bg-white focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] transition-all" placeholder="e.g. React, TypeScript, Node.js" value={jobForm.skills} onChange={e => setJobForm(p => ({ ...p, skills: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Available Slots</label>
                  <input type="number" className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:bg-white focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] transition-all" value={jobForm.slots} onChange={e => setJobForm(p => ({ ...p, slots: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Target Role</label>
                  <select className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] transition-all" value={jobForm.target_role} onChange={e => setJobForm(p => ({ ...p, target_role: e.target.value }))}>
                    <option value="">All</option>
                    <option value="teacher">Teachers</option>
                    <option value="driver">Drivers</option>
                    <option value="admin">Admin</option>
                    <option value="student">Students</option>
                    <option value="parent">Parents</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 block mb-1">Status</label>
                  <select className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] transition-all" value={jobForm.status} onChange={e => setJobForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
                <Button onClick={handleSubmit} disabled={submitting || !jobForm.title}
                  className="flex-1 bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white rounded-xl h-10 text-sm font-semibold shadow-[0_4px_12px_rgba(109,76,255,0.25)] hover:shadow-[0_6px_16px_rgba(109,76,255,0.35)] transition-all disabled:opacity-50">
                  {submitting ? 'Saving...' : editingId ? 'Update Job' : 'Post Job'}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}
                  className="rounded-xl h-10 text-sm">Cancel</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== AI PANEL MODAL ===== */}
      <AnimatePresence>
        {aiPanelOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setAiPanelOpen(false)}>
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#6D4CFF] to-[#4F2DB8] p-5 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.08)_0%,transparent_50%)]" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm"><Sparkles className="w-5 h-5 text-purple-200" /></div>
                    <div><h3 className="text-white font-bold text-base">Prerana AI</h3><p className="text-[11px] text-purple-200/70">Recruitment Assistant</p></div>
                  </div>
                  <button onClick={() => setAiPanelOpen(false)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all"><X className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-5 max-h-[50vh] overflow-y-auto space-y-3">
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center"><Sparkles className="w-8 h-8 text-[#6D4CFF]" /></div>
                  <p className="text-sm font-semibold text-gray-700">AI Recruitment Insights</p>
                  <p className="text-xs text-gray-400 mt-1">Get hiring recommendations and recruitment analytics.</p>
                </div>
                {aiInsights.map((insight: any, i: number) => {
                  const Icon = insight.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: insight.bg }}>
                        <Icon className="w-4 h-4" style={{ color: insight.color }} />
                      </div>
                      <p className="text-xs text-gray-600">{insight.text}</p>
                    </div>
                  );
                })}
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] border border-[rgba(16,185,129,0.15)]">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-[#10B981]" />
                    <span className="text-xs font-bold text-[#10B981]">Recommendation</span>
                  </div>
                  <p className="text-[11px] text-gray-600">Based on your current job postings, we recommend posting 2 more engineering roles to meet the growing demand. Consider adding a competitive benefits package.</p>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <p className="text-[10px] text-gray-400 text-center">Powered by Prerana AI • Recruitment Intelligence</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Badge({ children, className = '', style, variant, ...props }: any) {
  const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
  const variantClasses = variant === 'outline' ? 'border' : '';
  return <span className={`${baseClasses} ${variantClasses} ${className}`} style={style} {...props}>{children}</span>;
}

function Button({ children, className = '', variant, size, disabled, onClick, ...props }: any) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-xs h-8' : 'px-4 py-2 text-sm h-10';
  const variantClasses = variant === 'outline' ? 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900' : '';
  return <button className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`} disabled={disabled} onClick={onClick} {...props}>{children}</button>;
}

function Card({ children, className = '', ...props }: any) {
  return <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`} {...props}>{children}</div>;
}

function toast(info: any) {
  if (typeof info === 'string') {
    const evt = new CustomEvent('app-toast', { detail: { message: info, type: 'info' } });
    window.dispatchEvent(evt);
  }
}
toast.success = (m: string) => { const evt = new CustomEvent('app-toast', { detail: { message: m, type: 'success' } }); window.dispatchEvent(evt); };
toast.error = (m: string) => { const evt = new CustomEvent('app-toast', { detail: { message: m, type: 'error' } }); window.dispatchEvent(evt); };
toast.info = (m: string) => { const evt = new CustomEvent('app-toast', { detail: { message: m, type: 'info' } }); window.dispatchEvent(evt); };
