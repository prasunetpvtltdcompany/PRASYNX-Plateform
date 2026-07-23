'use client';

import { useState, useEffect } from 'react';
import { createClient } from './lib/supabase';
import apiClient from './lib/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import ShortlistedDashboard from './components/jobprovider/ShortlistedDashboard';
import InterviewDashboard from './components/jobprovider/InterviewDashboard';
import HiredDashboard from './components/jobprovider/HiredDashboard';
import MessagesDashboard from './components/jobprovider/MessagesDashboard';
import AnalyticsDashboard from './components/jobprovider/AnalyticsDashboard';
import ProfileDashboard from './components/jobprovider/ProfileDashboard';
import SettingsDashboard from './components/jobprovider/SettingsDashboard';
import NotificationsDashboard from './components/jobprovider/NotificationsDashboard';
import JobsDashboard from './components/jobprovider/JobsDashboard';
import ApplicationsDashboard from './components/jobprovider/ApplicationsDashboard';
import {
  Briefcase, LayoutDashboard, Plus, LogOut,
  Menu, Users, CheckCircle2, Clock, DollarSign, FileText,
  Search, Building2,
  Star, UserCheck, CalendarDays, MessageSquare,
  BarChart3, Bell, Settings, HelpCircle, Target, TrendingUp, Award,
  Download, Bot, Sparkles, GraduationCap,
  Video, ClipboardList, Eye, EyeOff, AlertCircle, ArrowRight, Loader2, ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';

const CLR = {
  primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B',
  danger: '#EF4444', info: '#3B82F6', purple: '#A855F7',
  indigo: '#4F46E5', pink: '#EC4899',
};
const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'jobs', label: 'My Jobs', icon: Briefcase },
  { key: 'applications', label: 'Applications', icon: ClipboardList },
  { key: 'shortlisted', label: 'Shortlisted', icon: UserCheck },
  { key: 'interviews', label: 'Interviews', icon: Video },
  { key: 'hired', label: 'Hired Candidates', icon: Award },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'analytics', label: 'Reports & Analytics', icon: BarChart3 },
  { key: 'profile', label: 'Company Profile', icon: Building2 },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function JobProviderPage() {
  const [auth, setAuth] = useState<{ token: string; provider: any } | null>(null);
  const [page, setPage] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', company_name: '', contact_name: '', phone: '', website: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!auth) {
    const handleSubmit = async () => {
      setError(''); setLoading(true);
      try {
        const supabase = createClient();
        if (page === 'login') {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
          });
          if (authError) { setError(authError.message); return; }
          if (authData.session) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authData.session.user.id)
              .single();
            if (!profile) { await supabase.auth.signOut(); setError('Profile not found.'); return; }
            if (profile.role !== 'job_provider') {
              await supabase.auth.signOut();
              setError('Invalid portal. Please use the correct login portal.');
              return;
            }
            if (!profile.is_active) { await supabase.auth.signOut(); setError('Account disabled.'); return; }
            const { data: provider } = await supabase
              .from('job_providers')
              .select('*')
              .eq('email', profile.email)
              .single();
            localStorage.setItem('jobProviderSession', JSON.stringify({
              token: authData.session.access_token,
              provider: provider || profile,
            }));
            setAuth({ token: authData.session.access_token, provider: provider || profile });
          }
        } else {
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
              data: {
                full_name: form.contact_name || form.company_name,
                role: 'job_provider',
              },
            },
          });
          if (signUpError) { setError(signUpError.message); return; }
          if (authData.user) {
            await supabase.from('job_providers').insert({
              user_id: authData.user.id,
              company_name: form.company_name,
              contact_name: form.contact_name,
              phone: form.phone,
              website: form.website,
            });
            setError('Registration successful. Please check your email to confirm your account.');
          }
        }
      } catch (e: any) {
        setError(e.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="flex h-dvh overflow-hidden bg-white">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute -top-96 -left-96 h-[800px] w-[800px] rounded-full bg-indigo-500/5 blur-[150px]" />
          <div className="absolute -bottom-96 -right-96 h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-[150px]" />
          <div className="absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/3 blur-[120px]" />
        </div>

        <div className="relative flex w-full flex-col justify-center overflow-y-auto px-4 py-8 lg:w-1/2 lg:px-12">
          <div className="mx-auto w-full max-w-sm sm:max-w-md">
            <Link
              href="http://localhost:3000/signin"
              className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] transition hover:text-[#7C3AED]"
            >
              <ChevronLeft size={14} />
              Back to role selection
            </Link>

            <div className="mb-6 text-center lg:text-left">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E0E7FF] bg-indigo-50 px-3 py-1">
                <Briefcase size={11} className="text-indigo-600" />
                <span className="text-[10px] font-bold text-indigo-600">Job Provider Portal</span>
              </div>
              <h1 className="text-2xl font-black text-[#0F172A] sm:text-3xl">Welcome Back</h1>
              <p className="mt-1.5 text-sm text-[#64748B]">Sign in to your employer account to manage jobs and candidates</p>
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
                  <AlertCircle size={14} /> {error}
                </motion.div>
              )}
              <div className="flex items-center gap-2 mb-6">
                <button onClick={() => setPage('login')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${page === 'login' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-[#F1F5F9] text-[#64748B]'}`}>Login</button>
                <button onClick={() => setPage('register')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${page === 'register' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-[#F1F5F9] text-[#64748B]'}`}>Register</button>
              </div>
              <form className="space-y-3.5" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                {page === 'register' && (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-[#475569]">Company Name</label>
                      <input className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                        placeholder="Company Name *" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-[#475569]">Contact Name</label>
                      <input className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                        placeholder="Contact Name *" value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} />
                    </div>
                  </>
                )}
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#475569]">Company Email</label>
                  <input type="email" className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                    placeholder="Enter your company email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#475569]">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 pr-10 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] transition hover:text-[#475569]">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {page === 'register' && (
                  <>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-[#475569]">Phone</label>
                      <input className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                        placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold text-[#475569]">Website</label>
                      <input className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                        placeholder="Website" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)}
                      className="h-4 w-4 rounded border-[#CBD5E1] text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-xs font-semibold text-[#64748B]">Remember me</span>
                  </label>
                  <Link href="http://localhost:3000/forgot-password"
                    className="text-xs font-bold text-indigo-600 transition hover:text-indigo-700">Forgot Password?</Link>
                </div>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  type="submit" disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> {page === 'login' ? 'Sign In' : 'Create Account'}</>}
                </motion.button>
              </form>

              <div className="mt-5 space-y-3">
                <div className="text-center">
                  <p className="text-xs text-[#94A3B8]">
                    Having trouble signing in?{' '}
                    <Link href="http://localhost:3000/contact" className="font-bold text-indigo-600 transition hover:text-indigo-700">Contact Support</Link>
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-[#94A3B8]">
                  <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500" /> SSL Secured</span>
                  <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500" /> 256-bit Encrypted</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-[#94A3B8]">
              <Sparkles size={10} className="text-[#7C3AED]" />
              <span>Powered by <span className="font-semibold text-[#7C3AED]">Prerana AI</span></span>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative hidden lg:flex lg:w-1/2 items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
          <img src="/jobproviderloginimg.png" alt="Job Provider Portal" className="h-full w-full object-contain p-8" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/90 backdrop-blur-xl border-r border-gray-200/80 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto flex flex-col shadow-sm`}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#8B6FFF] flex items-center justify-center text-white font-bold text-lg shadow-md shadow-purple-200">P</div>
            <div>
              <div className="font-bold text-sm">Prasunet Hiring</div>
              <div className="text-[10px] text-gray-400">{auth.provider.company_name || 'Provider'}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400 px-3 py-2">Main Menu</div>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.key} onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${activeTab === item.key ? 'bg-[#6D4CFF] text-white shadow-md shadow-purple-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}>
                <Icon size={18} className={activeTab === item.key ? '' : 'text-gray-400 group-hover:text-gray-600'} />
                <span>{item.label}</span>
                {activeTab === item.key && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <div className="rounded-2xl bg-gradient-to-br from-[#6D4CFF]/5 to-[#A855F7]/5 border border-[#6D4CFF]/10 p-4 mb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center"><Bot size={16} className="text-white" /></div>
              <div><div className="text-xs font-bold text-gray-700">Prerana AI</div><div className="text-[9px] text-gray-400">Hiring Assistant</div></div>
            </div>
            <p className="text-[10px] text-gray-500 mb-2">AI-powered candidate matching & screening</p>
            <button className="w-full py-1.5 rounded-lg bg-[#6D4CFF] text-white text-[10px] font-semibold hover:bg-[#5a3ed9] transition-all flex items-center justify-center gap-1"><Sparkles size={12} /> Open Prerana AI</button>
          </div>
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-400">{auth.provider.email}</span>
          </div>
          <button onClick={async () => { const { createClient } = await import('./lib/supabase'); const s = createClient(); await s.auth.signOut(); localStorage.removeItem('jobProviderSession'); setAuth(null); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 min-h-screen flex flex-col">
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"><Menu size={20} /></button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
              <span className="text-gray-300">/</span>
              <span className="text-gray-700 font-medium capitalize">{navItems.find(n => n.key === activeTab)?.label || activeTab}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#8B6FFF] flex items-center justify-center text-white font-bold text-xs">{auth.provider.company_name?.[0] || 'P'}</div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold">{auth.provider.contact_name}</div>
                <div className="text-[10px] text-gray-400">Job Provider</div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {activeTab === 'dashboard' && <DashboardTab provider={auth.provider} setActiveTab={setActiveTab} />}
              {activeTab === 'jobs' && <JobsDashboard provider={auth.provider} />}
              {activeTab === 'applications' && <ApplicationsDashboard provider={auth.provider} />}
              {activeTab === 'shortlisted' && <ShortlistedDashboard provider={auth.provider} />}
              {activeTab === 'interviews' && <InterviewDashboard provider={auth.provider} />}
              {activeTab === 'hired' && <HiredDashboard provider={auth.provider} />}
              {activeTab === 'messages' && <MessagesDashboard provider={auth.provider} />}
              {activeTab === 'notifications' && <NotificationsDashboard />}
              {activeTab === 'analytics' && <AnalyticsDashboard provider={auth.provider} />}
              {activeTab === 'profile' && <ProfileDashboard provider={auth.provider} />}
              {activeTab === 'settings' && <SettingsDashboard provider={auth.provider} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PlaceholderTab({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Icon size={48} className="mb-4 text-gray-200" />
      <h3 className="text-lg font-bold text-gray-400">{title}</h3>
      <p className="text-sm text-gray-300 mt-1">Coming soon</p>
    </div>
  );
}

// ====================== DASHBOARD TAB ======================
function DashboardTab({ provider, setActiveTab }: { provider: any; setActiveTab: (tab: string) => void }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<any>('/job-provider/dashboard').then(res => {
      setStats(res.data);
      setLoading(false);
    });
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };

  const totalJobs = stats?.totalJobs || 0;
  const activeJobs = stats?.activeJobs || 12;
  const totalApps = stats?.totalApplications || 148;
  const shortlisted = stats?.shortlisted || 45;
  const interviews = stats?.interviews || 6;
  const hired = stats?.hired || 3;
  const jobViews = stats?.jobViews || 1250;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" />
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const chartData = [
    { name: 'Mon', apps: 12 }, { name: 'Tue', apps: 18 }, { name: 'Wed', apps: 15 },
    { name: 'Thu', apps: 22 }, { name: 'Fri', apps: 28 }, { name: 'Sat', apps: 20 },
    { name: 'Sun', apps: 14 },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* ===== HERO SECTION ===== */}
      <div className="hero-section relative overflow-hidden rounded-2xl p-4 md:p-5 lg:p-6 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.15)] flex flex-col justify-between" onMouseMove={handleMouseMove}>
        {/* Stripe-inspired subtle noise texture overlay */}
        <div className="hero-noise" />

        {/* Ambient Moving Orbs & Particles */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-2xl">
          <motion.div 
            animate={{ x: [-30, 30, -30], y: [-20, 20, -20] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-12 -left-12 w-48 h-48 bg-[#6D4CFF]/20 rounded-full blur-[60px]"
          />
          <motion.div 
            animate={{ x: [40, -40, 40], y: [20, -20, 20] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-16 -right-16 w-64 h-64 bg-[#A855F7]/15 rounded-full blur-[80px]"
          />
          <motion.div 
            animate={{ x: [-20, 20, -20], y: [30, -30, 30] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 right-1/3 w-36 h-36 bg-[#EC4899]/10 rounded-full blur-[50px]"
          />
          {/* Particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} animate={{ opacity: [0.1, 0.5, 0.1], y: [0, -(10 + (i % 3) * 6), 0], x: [0, (i % 2 === 0 ? 3 : -3), 0] }}
              transition={{ duration: 4 + (i % 3) * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
              className="absolute rounded-full bg-white/30"
              style={{ width: `${1.5 + (i % 2) * 1}px`, height: `${1.5 + (i % 2) * 1}px`, top: `${15 + (i * 12) % 70}%`, left: `${5 + (i * 13) % 90}%` }}
            />
          ))}
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center w-full">
          {/* Title & Description */}
          <div className="order-1 lg:col-span-7 xl:col-span-8 text-left">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-purple-200 mb-0.5">Hiring Platform</div>
            <h1 className="hero-title mb-1.5">
              {greeting}, {provider.company_name || 'there'} 👋
            </h1>
            <p className="hero-desc mb-3">
              Connect with talented students, parents, and staff across the Prasunet ecosystem.
            </p>
          </div>

          {/* Right Illustration with floating icons */}
          <div className="order-2 md:order-3 lg:order-2 lg:col-span-5 xl:col-span-4 lg:row-span-2 relative flex items-center justify-center min-h-[150px] md:min-h-[170px] w-full self-center">
            {/* Soft purple radial glow behind illustration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] bg-gradient-to-tr from-[#6D4CFF]/35 via-[#8B5CF6]/20 to-transparent rounded-full blur-[50px] opacity-70 pointer-events-none" />
            
            {/* Orbiting floating icons - hidden on mobile/tablet (<768px / md) */}
            <div className="absolute inset-0 pointer-events-none overflow-visible hidden md:block">
              {[
                { icon: Briefcase, x: '-32%', y: '-22%', delay: 0 },
                { icon: FileText, x: '-36%', y: '10%', delay: 0.5 },
                { icon: CalendarDays, x: '-26%', y: '38%', delay: 1.0 },
                { icon: Search, x: '34%', y: '-24%', delay: 0.3 },
                { icon: Bot, x: '40%', y: '6%', delay: 0.8 },
                { icon: Star, x: '30%', y: '36%', delay: 1.3 },
                { icon: GraduationCap, x: '-6%', y: '-36%', delay: 0.6 },
                { icon: DollarSign, x: '6%', y: '42%', delay: 1.1 },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div key={i} 
                    animate={{ 
                      y: [0, -8 - (i % 3) * 3, 0], 
                      rotate: [0, (i % 2 === 0 ? 5 : -5), 0], 
                      opacity: [0.8, 1.0, 0.8] 
                    }}
                    transition={{ repeat: Infinity, duration: 4.5 + i * 0.4, delay: item.delay, ease: 'easeInOut' }}
                    className="absolute flex items-center justify-center"
                    style={{ top: `calc(50% + ${item.y})`, left: `calc(50% + ${item.x})` }}>
                    <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-[#6D4CFF]/15 flex items-center justify-center shadow-[0_4px_12px_rgba(109,76,255,0.08)]">
                      <Icon size={14} className="text-[#6D4CFF]" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <motion.div 
              style={{ x: mousePos.x * 12, y: mousePos.y * 12 }} 
              animate={{ y: [0, -8, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="flex justify-center items-center w-full lg:max-w-[85%] xl:max-w-full"
            >
              <img 
                src="/jobprovider-sticker.png" 
                alt="Hiring" 
                style={{ width: 'clamp(200px, 38vw, 460px)', height: 'auto' }}
                className="max-w-full max-h-[220px] lg:max-h-full object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.22)] select-none pointer-events-none" 
              />
            </motion.div>
          </div>

          {/* Metrics & Actions Column */}
          <div className="order-3 md:order-2 lg:order-3 lg:col-span-7 xl:col-span-8 text-left w-full flex flex-col justify-end">
            {/* Dynamic Summary - 2-column grid on mobile/tablet */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-3">
              {[
                { icon: Briefcase, value: activeJobs, label: 'Active Jobs', color: 'text-blue-300' },
                { icon: Users, value: totalApps, label: 'Applications', color: 'text-green-300' },
                { icon: Star, value: '18', label: 'New Today', color: 'text-amber-300' },
                { icon: CalendarDays, value: interviews, label: 'Interviews', color: 'text-purple-300' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <span key={i} className="inline-flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.12] text-[10px] text-white/80 font-medium w-full sm:w-auto">
                    <Icon size={10} className={item.color} />
                    <span className="font-bold text-white">{item.value}</span>
                    {item.label}
                  </span>
                );
              })}
            </div>

            {/* AI Insight Card */}
            <div className="mb-4 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex items-start gap-2.5 max-w-xl">
              <div className="p-1.5 rounded-lg bg-gradient-to-tr from-[#A855F7] to-[#EC4899] text-white shrink-0 mt-0.5 animate-pulse">
                <Sparkles size={12} />
              </div>
              <div>
                <div className="text-[9px] font-bold text-purple-200 uppercase tracking-wider mb-0.5">Prerana AI Insight</div>
                <p className="text-[11px] leading-relaxed text-white/95 font-semibold">
                  <span className="font-bold text-white">{totalApps} applications</span> received, <span className="font-bold text-white">{interviews} interviews</span> scheduled, <span className="font-bold text-white">{hired} high-match</span> candidates found by Prerana AI.
                </p>
              </div>
            </div>

            {/* Primary Actions - flex-wrap, gap 12px, full-width on mobile */}
            <div className="flex flex-wrap gap-2.5 w-full">
              <button 
                onClick={() => setActiveTab('jobs')}
                className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-full bg-white text-[#6D4CFF] hover:bg-white/95 hover:-translate-y-0.5 active:scale-[0.97] text-xs font-bold shadow-[0_4px_12px_rgba(255,255,255,0.15)] transition-all duration-200 cursor-pointer w-full sm:w-auto"
              >
                <Plus size={14} /> Post New Job
              </button>
              <button 
                onClick={() => setActiveTab('applications')}
                className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-full bg-white/10 hover:bg-white/18 hover:-translate-y-0.5 active:scale-[0.97] text-xs font-semibold text-white border border-white/20 transition-all duration-200 backdrop-blur-sm cursor-pointer w-full sm:w-auto"
              >
                <Search size={14} /> Search Candidates
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-[11px] font-medium text-white/80 hover:text-white border border-white/10 hover:border-white/15 transition-all duration-200 cursor-pointer w-full sm:w-auto"
              >
                <BarChart3 size={12} /> Reports
              </button>
            </div>
          </div>
        </div>

        {/* Live Activity Ticker Marquee */}
        <div className="w-full mt-4 pt-3 border-t border-white/10 overflow-hidden relative select-none flex items-center">
          <div className="shrink-0 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-green-300 bg-green-500/20 px-2.5 py-0.5 rounded-full mr-3 border border-green-500/30 z-10 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
            <span>Live Activity</span>
          </div>
          <div className="relative w-full overflow-hidden whitespace-nowrap text-[10px] text-white/80 flex">
            <div className="animate-marquee whitespace-nowrap flex shrink-0">
              <span className="mx-4 flex items-center gap-1">🔥 Priya Sharma applied for Math Tutor</span>
              <span className="text-white/30">•</span>
              <span className="mx-4 flex items-center gap-1">✨ Rahul Verma shortlisted for Bus Driver</span>
              <span className="text-white/30">•</span>
              <span className="mx-4 flex items-center gap-1">📅 Interview scheduled with Ananya Reddy</span>
              <span className="text-white/30">•</span>
              <span className="mx-4 flex items-center gap-1">🎉 Suresh Patel hired as Accountant</span>
              <span className="text-white/30">•</span>
              <span className="mx-4 flex items-center gap-1">💼 New job posted: Science Teacher</span>
              <span className="text-white/30">•</span>
            </div>
            <div className="animate-marquee whitespace-nowrap flex shrink-0" aria-hidden="true">
              <span className="mx-4 flex items-center gap-1">🔥 Priya Sharma applied for Math Tutor</span>
              <span className="text-white/30">•</span>
              <span className="mx-4 flex items-center gap-1">✨ Rahul Verma shortlisted for Bus Driver</span>
              <span className="text-white/30">•</span>
              <span className="mx-4 flex items-center gap-1">📅 Interview scheduled with Ananya Reddy</span>
              <span className="text-white/30">•</span>
              <span className="mx-4 flex items-center gap-1">🎉 Suresh Patel hired as Accountant</span>
              <span className="text-white/30">•</span>
              <span className="mx-4 flex items-center gap-1">💼 New job posted: Science Teacher</span>
              <span className="text-white/30">•</span>
          </div>
        </div>
      </div>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {[
          { icon: Briefcase, label: 'Active Jobs', value: activeJobs, trend: '+12%', color: CLR.primary, chart: [30, 38, 35, 42, 40, 48, 45] },
          { icon: Users, label: 'Applications Received', value: totalApps, trend: '+18%', color: CLR.success, chart: [60, 68, 65, 75, 72, 82, 78] },
          { icon: UserCheck, label: 'Shortlisted', value: shortlisted, trend: '+8%', color: CLR.purple, chart: [20, 25, 22, 28, 26, 32, 30] },
          { icon: CalendarDays, label: 'Interviews', value: interviews, trend: '+25%', color: CLR.warning, chart: [8, 10, 6, 12, 9, 14, 12] },
          { icon: Award, label: 'Hired', value: hired, trend: '+5%', color: CLR.success, chart: [2, 3, 2, 4, 3, 5, 4] },
          { icon: TrendingUp, label: 'Job Views', value: jobViews, trend: '+32%', color: CLR.info, chart: [200, 280, 250, 320, 300, 380, 350] },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3, scale: 1.01 }}
              className="group bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl" style={{ background: `${card.color}12`, color: card.color }}>
                  <Icon size={16} />
                </div>
                <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">{card.trend}</span>
              </div>
              <div className="text-lg md:text-xl font-extrabold text-gray-900">{card.value.toLocaleString()}</div>
              <div className="text-[10px] text-gray-400 font-medium mb-2">{card.label}</div>
              <div className="h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={card.chart.map((v, idx) => ({ i: idx, v }))}>
                    <defs>
                      <linearGradient id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={card.color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={card.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={card.color} strokeWidth={1.5} fill={`url(#grad${i})`} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ===== QUICK ACTIONS + RECENT APPS + AI ASSISTANT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Plus, label: 'Post Job', color: CLR.primary },
                { icon: Search, label: 'Find Candidates', color: CLR.info },
                { icon: CalendarDays, label: 'Schedule Interview', color: CLR.warning },
                { icon: MessageSquare, label: 'Send Message', color: CLR.success },
                { icon: Download, label: 'Export Data', color: CLR.purple },
                { icon: Bot, label: 'AI Match', color: CLR.pink },
                { icon: FileText, label: 'Generate JD', color: CLR.indigo },
                { icon: Users, label: 'Bulk Hiring', color: CLR.danger },
              ].map((action, i) => {
                const ActionIcon = action.icon;
                return (
                  <button key={i} className="group flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:-translate-y-0.5"
                    style={{ '--hover-color': action.color } as React.CSSProperties}>
                    <div className="p-1.5 rounded-lg transition-transform group-hover:scale-110" style={{ background: `${action.color}12`, color: action.color }}>
                      <ActionIcon size={14} />
                    </div>
                    <span className="text-[9px] font-semibold text-gray-500 group-hover:text-gray-700 text-center leading-tight">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="lg:col-span-1 lg:col-start-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800">Recent Applications</h3>
              <button className="text-[10px] font-semibold text-[#6D4CFF] hover:underline">View All</button>
            </div>
            <div className="space-y-2.5">
              {[
                { name: 'Priya Sharma', type: 'Student', job: 'Math Tutor', status: 'New', color: '#3B82F6' },
                { name: 'Rahul Verma', type: 'Parent', job: 'Bus Driver', status: 'Under Review', color: '#F59E0B' },
                { name: 'Ananya Reddy', type: 'Student', job: 'Web Developer', status: 'Shortlisted', color: '#A855F7' },
                { name: 'Suresh Patel', type: 'Staff', job: 'Accountant', status: 'Interview', color: '#F97316' },
                { name: 'Kavita Singh', type: 'Parent', job: 'Librarian', status: 'Selected', color: '#22C55E' },
              ].map((app, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0">
                    {app.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-800 truncate">{app.name}</div>
                    <div className="text-[10px] text-gray-400">{app.type} &middot; {app.job}</div>
                  </div>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: `${app.color}15`, color: app.color }}>{app.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Hiring Assistant */}
        <div className="lg:col-span-1 lg:col-start-3">
          <div className="bg-gradient-to-br from-[#6D4CFF]/5 via-[#A855F7]/5 to-[#EC4899]/5 rounded-2xl p-5 border border-[#6D4CFF]/10 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center shadow-md shadow-purple-200">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Prerana AI</h3>
                <p className="text-[10px] text-gray-400">Hiring Assistant</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {[
                { icon: Sparkles, label: 'Resume Screening' },
                { icon: Target, label: 'Candidate Matching' },
                { icon: HelpCircle, label: 'Interview Questions' },
                { icon: TrendingUp, label: 'Skill Gap Analysis' },
              ].map((f, i) => {
                const FIcon = f.icon;
                return (
                  <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-white/60 hover:bg-white transition-colors cursor-pointer">
                    <div className="p-1 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF]"><FIcon size={12} /></div>
                    <span className="text-[11px] font-medium text-gray-600">{f.label}</span>
                  </div>
                );
              })}
            </div>
            <button className="w-full py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5a3ed9] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-200">
              <Sparkles size={14} /> Open Prerana AI
            </button>
          </div>
        </div>
      </div>

      {/* ===== HIRING FUNNEL + RECENT ACTIVITY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hiring Funnel */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Hiring Funnel</h3>
          <div className="space-y-3">
            {[
              { stage: 'Applications', count: totalApps, pct: 100, color: CLR.primary },
              { stage: 'Reviewed', count: Math.round(totalApps * 0.7), pct: 70, color: CLR.info },
              { stage: 'Shortlisted', count: shortlisted, pct: 30, color: CLR.purple },
              { stage: 'Interviewed', count: interviews, pct: 15, color: CLR.warning },
              { stage: 'Selected', count: hired, pct: 5, color: CLR.success },
            ].map((funnel, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-700">{funnel.stage}</span>
                  <span className="text-gray-400">{funnel.count} ({funnel.pct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${funnel.pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${funnel.color}, ${funnel.color}88)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-0">
            {[
              { time: '2 min ago', text: 'New application received for Math Tutor', icon: Users, color: CLR.primary },
              { time: '15 min ago', text: 'Priya Sharma was shortlisted', icon: UserCheck, color: CLR.purple },
              { time: '1 hr ago', text: 'Interview scheduled with Rahul Verma', icon: CalendarDays, color: CLR.warning },
              { time: '3 hrs ago', text: 'New job posted: Web Developer', icon: Briefcase, color: CLR.success },
              { time: '1 day ago', text: 'Suresh Patel was hired as Accountant', icon: Award, color: CLR.success },
              { time: '2 days ago', text: 'Job posting expired: Driver', icon: Clock, color: CLR.danger },
            ].map((act, i) => {
              const ActIcon = act.icon;
              return (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="p-1.5 rounded-lg mt-0.5 flex-shrink-0" style={{ background: `${act.color}12`, color: act.color }}>
                    <ActIcon size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-gray-600">{act.text}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">{act.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

