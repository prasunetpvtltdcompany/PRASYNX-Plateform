'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from './i18n/LanguageProvider';
import LanguageSwitcher from './i18n/LanguageSwitcher';
import { useAuth } from './contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, UserPlus, ShieldCheck, BarChart3, History, Settings,
  Users, Key, Eye, EyeOff, Plus, Search, Download, ChevronDown, ChevronRight, LogOut,
  Bell, Moon, Sun, Menu, X, CheckCircle2, AlertTriangle, TrendingUp, DollarSign,
  Globe, Database, Clock, Copy, RefreshCw, Trash2, ArrowUpRight, Sparkles,
  FileText, Lock, Fingerprint, Palette, Mail, Smartphone, Monitor, Check,
  Edit3, Upload, User, Award, HelpCircle, ExternalLink, BookOpen,
  Filter, ChevronLeft, ChevronFirst, ChevronLast, ArrowUpDown,
  Building, Percent, CreditCard, TicketCheck, Mic, Cloud, Brain,
  Activity, Shield, ArrowRight, Loader2, AlertCircle,

} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  LineChart, Line, PieChart as RePieChart, Pie, Cell,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from './lib/useApi';
import { organisationApi, credentialApi, auditApi, analyticsApi, adminApi, bulkApi } from './lib/dataService';
import VoiceAITab from './lib/VoiceAITab';
import { createClient } from './lib/supabase';
import apiClient from './lib/apiClient';
import CrossPortalControlCenter from './components/admin/CrossPortalControlCenter';
import RealTimeMonitoring from './components/admin/RealTimeMonitoring';
import GlobalSearchComponent from './components/admin/GlobalSearch';
import OrganizationManagementCenter from './components/admin/OrganizationManagementCenter';
import UnifiedUserManagement from './components/admin/UnifiedUserManagement';
import BillingSubscriptionManagement from './components/admin/BillingSubscriptionManagement';
import SecurityCommandCenter from './components/admin/SecurityCommandCenter';
import SupportManagement from './components/admin/SupportManagement';
import AIAdminCommandCenter from './components/admin/AIAdminCommandCenter';
import GlobalCommandCenter from './components/admin/GlobalCommandCenter';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', accent: '#A855F7', purple: '#7C3AED' };
const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#A855F7'];

const navGroups = [
  { label: 'Main', items: [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'global-command', label: 'Global Command Center', icon: Shield },
    { key: 'cross-portal', label: 'Cross-Portal Control', icon: Globe },
    { key: 'real-time', label: 'Real-Time Monitoring', icon: Activity },
    { key: 'global-search', label: 'Global Search', icon: Search },
  ]},
  { label: 'Organizations', items: [
    { key: 'organizations', label: 'Organizations', icon: Building2 },
    { key: 'org-management', label: 'Org Management Center', icon: Building2 },
    { key: 'add-organization', label: 'Add Organization', icon: UserPlus },
    { key: 'grant-access', label: 'Grant Access', icon: ShieldCheck },
    { key: 'bulk-upload', label: 'Bulk Upload', icon: Upload },
  ]},
  { label: 'Users & Finance', items: [
    { key: 'user-management', label: 'User Management', icon: Users },
    { key: 'billing', label: 'Billing & Subscriptions', icon: CreditCard },
  ]},
  { label: 'Monitoring', items: [
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'credential-history', label: 'Credential History', icon: History },
  ]},
  { label: 'Security & Support', items: [
    { key: 'security-center', label: 'Security Center', icon: Shield },
    { key: 'support-hub', label: 'Support Hub', icon: HelpCircle },
  ]},
  { label: 'AI', items: [
    { key: 'ai-command', label: 'AI Command Center', icon: Brain },
  ]},
  { label: 'System', items: [
    { key: 'settings', label: 'Settings', icon: Settings },
    { key: 'voice-ai', label: 'Voice AI', icon: Mic },
  ]},
];

export default function AdminPage() {
  const { t } = useLanguage();
  const { session, login: authLogin, logout: authLogout, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const [settingsTab, setSettingsTab] = useState('profile');

  const [orgForm, setOrgForm] = useState({ name: '', email: '', phone: '', address: '', plan: 'Starter' });
  const [showOrgCredentials, setShowOrgCredentials] = useState(false);
  const [orgCredentials, setOrgCredentials] = useState({ portal: '', email: '', password: '' });

  const [accessForm, setAccessForm] = useState({ orgId: '', orgName: '', adminName: '', adminEmail: '', accessType: 'Management' });
  const [showAccessCredentials, setShowAccessCredentials] = useState(false);
  const [accessCredentials, setAccessCredentials] = useState({ portal: '', email: '', password: '' });

  const [orgSearch, setOrgSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState('all');
  const [orgPage, setOrgPage] = useState(1);
  const [selectedOrgs, setSelectedOrgs] = useState<number[]>([]);
  const pageSize = 4;

  const [credSearch, setCredSearch] = useState('');
  const [credFilter, setCredFilter] = useState('all');
  const [credTypeFilter, setCredTypeFilter] = useState('all');
  const [credPage, setCredPage] = useState(1);
  const credPageSize = 5;

  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const [notifications] = useState<{ id: number; title: string; message: string; priority: string; time: string }[]>([]);

  const [bulkData, setBulkData] = useState<{ name: string; email: string; phone: string; address: string }[]>([]);
  const [bulkResults, setBulkResults] = useState<any[] | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const bulkFileRef = useRef<HTMLInputElement>(null);

  const dashboardData = useApi(() => analyticsApi.dashboard(), [isAuthenticated], true);
  const orgGrowthData = useApi(() => analyticsApi.orgGrowth(), [isAuthenticated], true);
  const credTrendData = useApi(() => analyticsApi.credentialTrend(), [isAuthenticated], true);
  const userActivityData = useApi(() => analyticsApi.userActivity(), [isAuthenticated], true);
  const topOrgsData = useApi(() => analyticsApi.topOrgs(), [isAuthenticated], true);
  const auditLogsData = useApi(() => auditApi.list(), [isAuthenticated], true);
  const revenueData = useApi(() => analyticsApi.revenue(), [], false);

  const orgListData = useApi(() => organisationApi.list(), [], false);
  const credListData = useApi(() => credentialApi.list(), [], false);
  const analyticsSummaryData = useApi(() => analyticsApi.dashboard(), [], false);
  const analyticsRevenueData = useApi(() => analyticsApi.revenue(), [], false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'organizations' || activeTab === 'grant-access') orgListData.refetch();
    if (activeTab === 'credential-history') credListData.refetch();
    if (activeTab === 'bulk-upload') { setBulkResults(null); }
    if (activeTab === 'analytics') { analyticsSummaryData.refetch(); analyticsRevenueData.refetch(); }
  }, [activeTab, isAuthenticated]);

  const userInitials = session?.user?.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'A';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const login = async () => {
    setLoading(true);
    setError(null);
    if (!form.email || !form.password) {
      setError('Please enter Email and Password.');
      setLoading(false);
      return;
    }
    try {
      const result = await authLogin(form.email, form.password);
      if (result.success) {
        toast.success('Authenticated successfully');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => { authLogout(); setForm({ email: '', password: '' }); };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const orgsArray = (() => {
    const d = orgListData.data;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.organisations)) return d.organisations;
    if (d && Array.isArray(d.data)) return d.data;
    return [];
  })();
  const credsArray = (() => {
    const d = credListData.data;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.credentials)) return d.credentials;
    if (d && Array.isArray(d.data)) return d.data;
    return [];
  })();
  const auditArray = (() => {
    const d = auditLogsData.data;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.logs)) return d.logs;
    if (d && Array.isArray(d.auditLogs)) return d.auditLogs;
    if (d && Array.isArray(d.data)) return d.data;
    return [];
  })();
  const dashKpis = (() => {
    const d = dashboardData.data;
    if (d && typeof d === 'object') return d;
    return null;
  })();
  const orgGrowthChart = (() => {
    const d = orgGrowthData.data;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.data)) return d.data;
    return [];
  })();
  const credTrendChart = (() => {
    const d = credTrendData.data;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.data)) return d.data;
    return [];
  })();
  const userActivityChart = (() => {
    const d = userActivityData.data;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.data)) return d.data;
    return [];
  })();
  const topOrgsArray = (() => {
    const d = topOrgsData.data;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.organisations)) return d.organisations;
    if (d && Array.isArray(d.data)) return d.data;
    return [];
  })();
  const revenueChartData = (() => {
    const d = revenueData.data || analyticsRevenueData.data;
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.data)) return d.data;
    return [];
  })();

  const recentActivities = auditArray.slice(0, 5).map((log: any) => {
    return {
      action: log.action || log.event || 'Activity',
      org: log.target || log.organisation_name || log.org || '',
      time: log.time || log.created_at || '',
      icon: TrendingUp,
      color: COLORS.primary,
    };
  });

  const filteredOrgs = orgsArray.filter((o: any) => {
    const matchesSearch = (o.name || '').toLowerCase().includes(orgSearch.toLowerCase()) || (o.owner || '').toLowerCase().includes(orgSearch.toLowerCase());
    const matchesFilter = orgFilter === 'all' || (o.status || '').toLowerCase() === orgFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });
  const totalOrgPages = Math.ceil(filteredOrgs.length / pageSize);
  const paginatedOrgs = filteredOrgs.slice((orgPage - 1) * pageSize, orgPage * pageSize);

  const handleSelectAllOrgs = () => {
    if (selectedOrgs.length === paginatedOrgs.length) setSelectedOrgs([]);
    else setSelectedOrgs(paginatedOrgs.map((o: any) => o.id));
  };
  const handleSelectOrg = (id: number) => {
    setSelectedOrgs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredCreds = credsArray.filter((c: any) => {
    const searchLower = credSearch.toLowerCase();
    const matchesSearch = !credSearch || (c.full_name || '').toLowerCase().includes(searchLower) || (c.email || '').toLowerCase().includes(searchLower) || (c.organisation_name || '').toLowerCase().includes(searchLower);
    const matchesFilter = credFilter === 'all' || (c.role || '').toLowerCase() === credFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });
  const totalCredPages = Math.ceil(filteredCreds.length / credPageSize);
  const paginatedCreds = filteredCreds.slice((credPage - 1) * credPageSize, credPage * credPageSize);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const NavItem = ({ item, isActive }: { item: typeof navGroups[0]["items"][0]; isActive: boolean }) => {
    const Icon = item.icon;
    return (
      <button onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
        className={`sidebar-item ${isActive ? 'active' : ''}`}>
        <Icon size={18} className="sidebar-item-icon" />
        <span>{item.label}</span>
      </button>
    );
  };

  if (!session) {
    return (
      <div className="flex h-dvh overflow-hidden bg-white">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute -top-96 -left-96 h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-[150px]" />
          <div className="absolute -bottom-96 -right-96 h-[800px] w-[800px] rounded-full bg-purple-500/5 blur-[150px]" />
          <div className="absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-500/3 blur-[120px]" />
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
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#EDE9FE] bg-purple-50 px-3 py-1">
                <Shield size={11} className="text-purple-600" />
                <span className="text-[10px] font-bold text-purple-600">Admin Portal</span>
              </div>
              <h1 className="text-2xl font-black text-[#0F172A] sm:text-3xl">Admin Sign In</h1>
              <p className="mt-1.5 text-sm text-[#64748B]">Enter your credentials to access the command center</p>
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
                  <AlertCircle size={14} /> {error}
                </motion.div>
              )}
              <form onSubmit={(e) => { e.preventDefault(); login(); }} className="space-y-3.5">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#475569]">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@prasynx.com"
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#475569]">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 pr-10 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] transition hover:text-[#475569]"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="h-4 w-4 rounded border-[#CBD5E1] text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-semibold text-[#64748B]">Remember me</span>
                  </label>
                  <Link
                    href="http://localhost:3000/forgot-password"
                    className="text-xs font-bold text-purple-600 transition hover:text-purple-700"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-600/20 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <><ArrowRight size={16} /> Sign In</>}
                </motion.button>
              </form>

              <div className="mt-5 space-y-3">
                <div className="text-center">
                  <p className="text-xs text-[#94A3B8]">
                    Having trouble signing in?{' '}
                    <Link href="http://localhost:3000/contact" className="font-bold text-purple-600 transition hover:text-purple-700">
                      Contact Support
                    </Link>
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
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5" />
          <img src="/adminlogin.png" alt="Admin Portal" className="h-full w-full object-contain p-8" />
        </motion.div>
      </div>
    );
  }

  // ===== DASHBOARD =====
  const renderDashboard = () => {
    if (dashboardData.loading) {
      return <div className="space-y-6"><div className="hero-section"><div className="relative z-10"><div className="hero-label">Platform Administration</div><h1 className="hero-title">Welcome back, {session?.user?.full_name?.split(' ')[0] || 'Admin'}</h1></div></div><LoadingSkeleton rows={4} cols={4} /></div>;
    }
    if (dashboardData.error) {
      return <ErrorState message={dashboardData.error} onRetry={dashboardData.refetch} />;
    }
    const kpis = [
      { icon: Building2, label: 'Total Organizations', value: (dashKpis?.totalOrganizations ?? 1248).toLocaleString(), sub: `+${dashKpis?.orgGrowth ?? 14.2}% from last month`, color: COLORS.primary, bg: '#F3F0FF', trend: `+${dashKpis?.orgGrowth ?? 14.2}%`, chart: dashKpis?.orgChart || [40, 45, 42, 48, 52, 55, 58, 62, 68, 72, 78, 82] },
      { icon: Users, label: 'Total Active Users', value: (dashKpis?.totalActiveUsers ?? 8540).toLocaleString(), sub: `+${dashKpis?.userGrowth ?? 9.8}% from last month`, color: COLORS.success, bg: '#F0FDF4', trend: `+${dashKpis?.userGrowth ?? 9.8}%`, chart: dashKpis?.userChart || [30, 35, 40, 38, 42, 48, 52, 55, 58, 62, 68, 72] },
      { icon: Key, label: 'Credentials Issued', value: (dashKpis?.credentialsIssued ?? 45200).toLocaleString(), sub: `+${dashKpis?.credGrowth ?? 12.5}% from last month`, color: COLORS.warning, bg: '#FFFBEB', trend: `+${dashKpis?.credGrowth ?? 12.5}%`, chart: dashKpis?.credChart || [25, 30, 35, 32, 38, 42, 48, 45, 50, 55, 58, 62] },
      { icon: TrendingUp, label: 'Monthly Growth', value: `+${dashKpis?.monthlyGrowth ?? 12.5}%`, sub: 'Consistent upward trend', color: COLORS.info, bg: '#EFF6FF', trend: `+${dashKpis?.monthlyGrowth ?? 12.5}%`, chart: dashKpis?.growthChart || [20, 25, 22, 28, 32, 35, 30, 38, 42, 45, 48, 52] },
    ];
    return (
      <div>
      <div className="hero-section relative overflow-hidden rounded-3xl p-6 md:p-8 xl:p-10 mb-8 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.2)] flex items-center min-h-[380px] md:min-h-[400px] xl:h-[420px] xl:max-height-[420px]">
        {/* Soft light orbs & floating particles in background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#A855F7]/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#3B82F6]/15 rounded-full blur-[120px]" />
          {/* Custom floating particle nodes */}
          <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 bg-white/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute top-2/3 left-1/4 w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-white/20 rounded-full animate-pulse" style={{ animationDuration: '5s' }} />
        </div>

        <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Side Content */}
          <div className="md:col-span-7 xl:col-span-8 flex flex-col justify-between h-full py-1 text-left">
            <div>
              <div className="hero-label text-[10px] tracking-[0.2em] font-semibold text-white/70 uppercase mb-1">
                Platform Administration
              </div>
              <h1 className="hero-title text-2xl md:text-3xl xl:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight">
                Welcome back, Prasynx
              </h1>
              <p className="hero-desc text-xs md:text-sm text-white/80 max-w-2xl leading-relaxed mb-4">
                Manage organizations, credentials, analytics, users, and platform operations from one intelligent administration platform.
              </p>
            </div>

            {/* Dynamic Platform Intelligence Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-1 mb-4">
              <Badge className="bg-white/10 text-white hover:bg-white/20 border border-white/10 text-[10px] py-1 px-2.5 backdrop-blur-sm flex items-center gap-1.5">
                <Building2 size={12} className="text-purple-300" />
                {(dashKpis?.totalOrganizations ?? 5).toLocaleString()} Organizations Active
              </Badge>
              <Badge className="bg-white/10 text-white hover:bg-white/20 border border-white/10 text-[10px] py-1 px-2.5 backdrop-blur-sm flex items-center gap-1.5">
                <Users size={12} className="text-green-300" />
                {(dashKpis?.totalActiveUsers ?? 30).toLocaleString()} Active Users
              </Badge>
              <Badge className="bg-white/10 text-white hover:bg-white/20 border border-white/10 text-[10px] py-1 px-2.5 backdrop-blur-sm flex items-center gap-1.5">
                <Award size={12} className="text-amber-300" />
                {(dashKpis?.credentialsIssued ?? 45200).toLocaleString()} Credentials Issued
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] py-1 px-2.5 backdrop-blur-sm flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Platform Health: Excellent
              </Badge>
            </div>

            {/* AI-Generated Operational Summary */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md max-w-2xl mb-5">
              <Sparkles size={14} className="text-purple-300 animate-pulse flex-shrink-0" />
              <p className="text-[11px] md:text-xs text-white/80 leading-snug">
                All platform services are operational. <span className="font-semibold text-white">{(dashKpis?.totalOrganizations ?? 5)}</span> organizations are active, <span className="font-semibold text-white">{(dashKpis?.totalActiveUsers ?? 30)}</span> users are online, and credential issuance is performing above target.
              </p>
            </div>

            {/* Glassmorphic Actions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl">
              <button onClick={() => setActiveTab('add-organization')} className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white transition-all text-xs font-semibold group shadow-sm">
                <UserPlus size={13} className="text-purple-300 group-hover:scale-110 transition-transform" />
                Add Org
              </button>
              <button onClick={() => setActiveTab('analytics')} className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white transition-all text-xs font-semibold group shadow-sm">
                <BarChart3 size={13} className="text-green-300 group-hover:scale-110 transition-transform" />
                Analytics
              </button>
              <button onClick={() => setActiveTab('bulk-upload')} className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white transition-all text-xs font-semibold group shadow-sm">
                <Upload size={13} className="text-amber-300 group-hover:scale-110 transition-transform" />
                Bulk Upload
              </button>
              <button onClick={() => setActiveTab('settings')} className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white transition-all text-xs font-semibold group shadow-sm">
                <Settings size={13} className="text-blue-300 group-hover:scale-110 transition-transform" />
                Settings
              </button>
            </div>
          </div>

          {/* Right Side - Mascot sticker and orbiting icons */}
          <div className="md:col-span-5 xl:col-span-4 relative flex items-center justify-center md:justify-end h-full min-h-[220px] md:min-h-0">
            {/* Soft purple radial glow behind illustration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] md:w-[300px] md:h-[300px] bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] rounded-full blur-[60px] opacity-45 mix-blend-screen pointer-events-none" />

            {/* Orbiting Icons */}
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              {[
                { icon: Building2, label: 'Organizations', className: 'top-[2%] left-[10%] md:top-[6%] md:left-[15%]' },
                { icon: Users, label: 'Users', className: 'top-[12%] right-[5%] md:top-[16%] md:right-[10%]' },
                { icon: Award, label: 'Credentials', className: 'top-[36%] left-[-15%] md:top-[42%] md:left-[-10%]' },
                { icon: BarChart3, label: 'Analytics', className: 'bottom-[3%] left-[12%] md:bottom-[8%] md:left-[22%]' },
                { icon: FileText, label: 'Reports', className: 'bottom-[10%] right-[10%] md:bottom-[15%] md:right-[18%]' },
                { icon: ShieldCheck, label: 'Security', className: 'bottom-[34%] right-[-15%] md:bottom-[40%] md:right-[-10%]' },
                { icon: Cloud, label: 'Cloud Management', className: 'top-[22%] left-[20%] md:top-[28%] md:left-[30%]' },
                { icon: Brain, label: 'AI Insights', className: 'bottom-[22%] left-[5%] md:bottom-[28%] md:left-[10%]' },
                { icon: TrendingUp, label: 'Growth Charts', className: 'top-[50%] right-[3%] md:top-[60%] md:right-[8%]' },
                { icon: Settings, label: 'Platform Settings', className: 'bottom-[42%] left-[-20%] md:bottom-[48%] md:left-[-15%]' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    className={`absolute z-20 flex items-center justify-center p-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-lg text-white pointer-events-auto ${item.className}`}
                    animate={{
                      y: [0, idx % 2 === 0 ? -6 : 6, 0],
                      rotate: [0, idx % 3 === 0 ? 8 : -8, 0],
                    }}
                    transition={{
                      duration: 4 + (idx % 3),
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: idx * 0.2,
                    }}
                    whileHover={{ scale: 1.15, backgroundColor: 'rgba(255,255,255,0.25)' }}
                    title={item.label}
                  >
                    <Icon size={12} className="text-white" />
                  </motion.div>
                );
              })}
            </div>

            {/* Floating mascot illustration */}
            <motion.div
              className="relative select-none pointer-events-none z-10 flex items-center justify-center pr-2 xl:pr-6"
              style={{
                x: mousePos.x * 15,
                y: mousePos.y * 15,
              }}
              animate={{
                y: [0, -8, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img
                src="/admin-sticker.png"
                alt="Prasynx Admin Ecosystem"
                className="w-[280px] sm:w-[340px] md:w-[400px] lg:w-[480px] xl:w-[580px] 2xl:w-[650px] h-auto object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.3)] transition-all"
              />
            </motion.div>
          </div>
        </div>
      </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            const miniChartId = `miniChart${i}`;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }} className="stat-card">
                <div className="flex items-start justify-between mb-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: kpi.bg, color: kpi.color }}><Icon size={20} /></div>
                  <Badge variant="success" className="text-[9px]">{kpi.trend}</Badge>
                </div>
                <div className="mt-2">
                  <div className="text-[11px] text-gray-500 font-medium">{kpi.label}</div>
                  <div className="text-2xl font-extrabold text-gray-900 mt-0.5">{kpi.value}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</div>
                </div>
                <div className="h-8 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={kpi.chart.map((v: number, idx: number) => ({ v, idx }))}>
                      <defs><linearGradient id={miniChartId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={kpi.color} stopOpacity={0.25} /><stop offset="100%" stopColor={kpi.color} stopOpacity={0} /></linearGradient></defs>
                      <Area type="monotone" dataKey="v" stroke={kpi.color} strokeWidth={1.5} fill={`url(#${miniChartId})`} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Organization Growth</h3>
              <Badge variant="info" className="text-[9px]">+27% YoY</Badge>
            </div>
            <div className="h-52">
              {orgGrowthData.loading ? <LoadingSkeleton rows={1} cols={1} /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={orgGrowthChart.length > 0 ? orgGrowthChart : [{ month: 'Jan', total: 1248, verified: 930 }]}>
                    <defs><linearGradient id="orgGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6D4CFF" stopOpacity={0.25} /><stop offset="95%" stopColor="#6D4CFF" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    <Area type="monotone" dataKey="total" stroke="#6D4CFF" strokeWidth={2} fill="url(#orgGrad)" name="Total" />
                    <Area type="monotone" dataKey="verified" stroke="#22C55E" strokeWidth={2} fill="none" strokeDasharray="4 3" name="Verified" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Credential Issuance</h3>
              <Badge variant="warning" className="text-[9px]">+41% YoY</Badge>
            </div>
            <div className="h-52">
              {credTrendData.loading ? <LoadingSkeleton rows={1} cols={1} /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={credTrendChart.length > 0 ? credTrendChart : [{ month: 'Jan', issued: 4520, revoked: 145 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    <Bar dataKey="issued" fill="#6D4CFF" radius={[4, 4, 0, 0]} name="Issued" />
                    <Bar dataKey="revoked" fill="#EF4444" radius={[4, 4, 0, 0]} name="Revoked" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">User Activity</h3>
              <Badge variant="success" className="text-[9px]">+64% YoY</Badge>
            </div>
            <div className="h-52">
              {userActivityData.loading ? <LoadingSkeleton rows={1} cols={1} /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userActivityChart.length > 0 ? userActivityChart : [{ month: 'Jan', active: 8540, new: 540 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    <Line type="monotone" dataKey="active" stroke="#6D4CFF" strokeWidth={2.5} dot={{ r: 3, fill: '#6D4CFF' }} name="Active Users" />
                    <Line type="monotone" dataKey="new" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B' }} name="New Users" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Top Organizations</h3>
              <button className="text-[#6D4CFF] text-[10px] font-semibold hover:underline">View all</button>
            </div>
            <div className="overflow-x-auto">
              {topOrgsData.loading ? <LoadingSkeleton rows={4} cols={4} /> : (
                <table className="data-table">
                  <thead><tr>
                    <th>Organization</th><th>Users</th><th>Credentials</th><th>Growth</th>
                  </tr></thead>
                  <tbody>
                    {topOrgsArray.length === 0 && (
                      <tr><td colSpan={4} className="text-center text-xs text-gray-400 py-8">No data available</td></tr>
                    )}
                    {topOrgsArray.slice(0, 5).map((org: any, i: number) => (
                      <tr key={i}>
                        <td className="font-medium">{org.name || org.organisation_name || 'N/A'}</td>
                        <td className="text-gray-600">{(org.users || org.user_count || 0).toLocaleString()}</td>
                        <td className="text-gray-600">{(org.credentials || org.credential_count || 0).toLocaleString()}</td>
                        <td><Badge variant="success" className="text-[9px]">+{org.growth || org.growth_rate || 0}%</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Recent Activity</h3>
              <button className="text-[#6D4CFF] text-[10px] font-semibold hover:underline">View all</button>
            </div>
            <div className="space-y-3">
              {auditLogsData.loading ? <LoadingSkeleton rows={3} cols={1} /> : (
                recentActivities.length === 0 ? (
                  <div className="text-center text-xs text-gray-400 py-8">No recent activity</div>
                ) : (
                  recentActivities.map((act: any, i: number) => {
                    const Icon = act.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${act.color}15`, color: act.color }}><Icon size={14} /></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold truncate">{act.action}</div>
                          <div className="text-[10px] text-gray-400">{act.org}</div>
                        </div>
                        <span className="text-[9px] text-gray-400 whitespace-nowrap">{act.time}</span>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // ===== ORGANIZATIONS =====
  const renderOrganizations = () => {
    const getStatusBadge = (status: string) => {
      const variants: Record<string, { label: string; variant: any }> = { verified: { label: 'Verified', variant: 'success' }, pending: { label: 'Pending', variant: 'warning' } };
      return <Badge variant={variants[status?.toLowerCase()]?.variant || 'default'} className="text-[9px]">{variants[status?.toLowerCase()]?.label || status || 'Unknown'}</Badge>;
    };
    if (orgListData.loading && orgsArray.length === 0) return <div className="space-y-6"><div className="page-header"><h1>Organizations</h1><p>Search, filter, verify, and manage all organizations connected to the platform.</p></div><LoadingSkeleton rows={6} cols={8} /></div>;
    if (orgListData.error && orgsArray.length === 0) return <ErrorState message={orgListData.error} onRetry={orgListData.refetch} />;
    return (
      <div>
        <div className="page-header flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1>Organizations</h1>
            <p>Search, filter, verify, and manage all organizations connected to the platform.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('add-organization')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.97] transition-all"><Plus size={14} /> Add Organization</button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 active:scale-[0.97] transition-all"><Download size={14} /> Export CSV</button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
              <Search size={14} className="text-gray-400" />
              <input type="text" value={orgSearch} onChange={e => { setOrgSearch(e.target.value); setOrgPage(1); }} placeholder="Search by name or owner..." className="bg-transparent border-none outline-none text-xs flex-1" />
            </div>
            <select value={orgFilter} onChange={e => { setOrgFilter(e.target.value); setOrgPage(1); }} className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium outline-none focus:border-[#6D4CFF]">
              <option value="all">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
            {selectedOrgs.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{selectedOrgs.length} selected</span>
                <button className="px-3 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-all">Bulk Action</button>
              </div>
            )}
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr>
                <th className="w-10"><input type="checkbox" checked={selectedOrgs.length === paginatedOrgs.length && paginatedOrgs.length > 0} onChange={handleSelectAllOrgs} className="rounded" /></th>
                <th>Organization <ArrowUpDown size={11} className="inline ml-1 opacity-50" /></th>
                <th>Owner</th>
                <th>Members</th>
                <th>Plan</th>
                <th>Region</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr></thead>
              <tbody>
                {paginatedOrgs.map((org: any) => (
                  <tr key={org.id}>
                    <td><input type="checkbox" checked={selectedOrgs.includes(org.id)} onChange={() => handleSelectOrg(org.id)} className="rounded" /></td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#6D4CFF] font-bold text-xs">{(org.name || '').split(' ').map((w: string) => w[0]).join('').slice(0, 2)}</div>
                        <div><div className="text-xs font-semibold">{org.name || 'N/A'}</div><div className="text-[10px] text-gray-400">{org.email || ''}</div></div>
                      </div>
                    </td>
                    <td className="text-xs text-gray-600">{org.owner || org.owner_name || 'N/A'}</td>
                    <td className="text-xs font-medium">{(org.members || org.member_count || 0).toLocaleString()}</td>
                    <td><span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">{org.plans || org.plan || 'N/A'}</span></td>
                    <td className="text-xs text-gray-500">{org.region || org.region_name || 'N/A'}</td>
                    <td>{getStatusBadge(org.status)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF] transition-all"><Eye size={14} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF] transition-all"><Settings size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrgs.length === 0 && (
            <EmptyState message={orgListData.loading ? 'Loading organizations...' : 'No organizations found matching your filters.'} action={!orgListData.loading ? { label: 'Add Organization', onClick: () => setActiveTab('add-organization') } : undefined} />
          )}
          {filteredOrgs.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">Showing {(orgPage - 1) * pageSize + 1}-{Math.min(orgPage * pageSize, filteredOrgs.length)} of {filteredOrgs.length}</span>
              <div className="flex items-center gap-1">
                <button disabled={orgPage === 1} onClick={() => setOrgPage(1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-all"><ChevronFirst size={14} /></button>
                <button disabled={orgPage === 1} onClick={() => setOrgPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-all"><ChevronLeft size={14} /></button>
                <span className="text-xs font-medium px-3 py-1 rounded-lg bg-[#F3F0FF] text-[#6D4CFF]">{orgPage} / {totalOrgPages}</span>
                <button disabled={orgPage === totalOrgPages} onClick={() => setOrgPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-all"><ChevronRight size={14} /></button>
                <button disabled={orgPage === totalOrgPages} onClick={() => setOrgPage(totalOrgPages)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-all"><ChevronLast size={14} /></button>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  };

  // ===== ADD ORGANIZATION =====
  const renderAddOrganization = () => {
    const handleCreateOrg = async () => {
      if (!orgForm.name || !orgForm.email) { toast.error('Please fill in required fields'); return; }
      try {
        const res = await organisationApi.create(orgForm);
        if (res.success && res.data?.credentials?.password) {
          setOrgCredentials({
            portal: 'https://portal.prasynx.com',
            email: res.data.credentials.email || orgForm.email,
            password: res.data.credentials.password,
          });
          setShowOrgCredentials(true);
          toast.success('Organization created successfully');
        } else {
          toast.error(res.error || 'Failed to create organization');
        }
      } catch {
        toast.error('Failed to create organization');
      }
    };
    return (
      <div>
        <div className="page-header">
          <h1>Add Organization</h1>
          <p>Capture essential details and onboard institutions quickly.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold mb-5">Organization Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Organization Name *</label>
                <input type="text" value={orgForm.name} onChange={e => setOrgForm({ ...orgForm, name: e.target.value })} placeholder="e.g., Greenfield International School" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#6D4CFF] focus:ring-3 focus:ring-[rgba(109,76,255,0.1)] transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Email Address *</label>
                <input type="email" value={orgForm.email} onChange={e => setOrgForm({ ...orgForm, email: e.target.value })} placeholder="contact@school.edu" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#6D4CFF] focus:ring-3 focus:ring-[rgba(109,76,255,0.1)] transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Phone Number</label>
                  <input type="tel" value={orgForm.phone} onChange={e => setOrgForm({ ...orgForm, phone: e.target.value })} placeholder="+1 555 123 4567" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#6D4CFF] focus:ring-3 focus:ring-[rgba(109,76,255,0.1)] transition-all" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Plan</label>
                  <select value={orgForm.plan} onChange={e => setOrgForm({ ...orgForm, plan: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#6D4CFF] focus:ring-3 focus:ring-[rgba(109,76,255,0.1)] transition-all">
                    <option value="Starter">Starter</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Address</label>
                <textarea value={orgForm.address} onChange={e => setOrgForm({ ...orgForm, address: e.target.value })} placeholder="123 School Lane, City, Country" rows={3} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#6D4CFF] focus:ring-3 focus:ring-[rgba(109,76,255,0.1)] transition-all resize-none" />
              </div>
              <button onClick={handleCreateOrg} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-sm font-semibold shadow-[0_4px_14px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_20px_rgba(109,76,255,0.4)] hover:-translate-y-0.5 active:scale-[0.98] transition-all">Create Organization</button>
            </div>
          </Card>
          {/* Credentials Output */}
          <div>
            {showOrgCredentials && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-6 border-l-4 border-l-[#6D4CFF]">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600"><CheckCircle2 size={18} /></div>
                    <div><h3 className="text-sm font-bold">Management Portal Credentials</h3><p className="text-[10px] text-gray-400">Use these credentials to login to the management portal.</p></div>
                  </div>
                  <div className="space-y-3">
                    <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Portal URL</label><div className="api-key-display mt-1">{orgCredentials.portal} <button onClick={() => copyToClipboard(orgCredentials.portal)} className="ml-auto text-[#6D4CFF] hover:text-[#5A3EF0]"><Copy size={12} /></button></div></div>
                    <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Email</label><div className="api-key-display mt-1">{orgCredentials.email} <button onClick={() => copyToClipboard(orgCredentials.email)} className="ml-auto text-[#6D4CFF] hover:text-[#5A3EF0]"><Copy size={12} /></button></div></div>
                    <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Password</label><div className="api-key-display mt-1">{orgCredentials.password} <button onClick={() => copyToClipboard(orgCredentials.password)} className="ml-auto text-[#6D4CFF] hover:text-[#5A3EF0]"><Copy size={12} /></button></div></div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-4">Administrators can access the management portal to create and manage student accounts, staff accounts, parent accounts, and monitor academic workflows.</p>
                </Card>
              </motion.div>
            )}
            {/* Info Card */}
            <Card className="p-6 mt-4">
              <h3 className="text-sm font-bold mb-3">What happens next?</h3>
              <div className="space-y-2.5">
                {[
                  'Organization admin receives login credentials',
                  'Admin can access the management portal',
                  'Create student, staff, and parent accounts',
                  'Configure school settings and workflow',
                  'Monitor analytics and platform usage',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-[#F3F0FF] flex items-center justify-center text-[#6D4CFF] font-bold text-[10px]">{i + 1}</div>
                    {step}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // ===== GRANT ACCESS =====
  const renderGrantAccess = () => {
    const handleGrantAccess = async () => {
      if (!accessForm.orgName || !accessForm.adminName || !accessForm.adminEmail) { toast.error('Please fill in required fields'); return; }
      const accessSlug = accessForm.orgName.toLowerCase().replace(/\s+/g, '');
      try {
        const res = await credentialApi.createManagementAccess({ organisation_id: accessForm.orgId, full_name: accessForm.adminName, email: accessForm.adminEmail });
        if (res.success && res.data?.credentials?.password) {
          setAccessCredentials({ portal: 'https://' + accessSlug + '.portal.prasynx.com', email: res.data.credentials.email, password: res.data.credentials.password });
          setShowAccessCredentials(true);
          toast.success('Management access created successfully');
        } else {
          toast.error(res.error || 'Failed to create management access');
        }
      } catch {
        toast.error('Failed to create management access. Check your network connection.');
      }
    };
    return (
      <div>
        <div className="page-header">
          <h1>Grant Management Access</h1>
          <p>Create leadership accounts for school administrators and send credentials securely.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold mb-5">Admin Account Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Select Organization *</label>
                <select value={accessForm.orgName} onChange={e => { const org = orgsArray.find((o: any) => o.name === e.target.value); setAccessForm({ ...accessForm, orgName: e.target.value, orgId: org?.id || '' }); }} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#6D4CFF] focus:ring-3 focus:ring-[rgba(109,76,255,0.1)] transition-all">
                  <option value="">Choose an organization...</option>
                  {orgsArray.map((o: any) => <option key={o.id} value={o.name || o.organisation_name}>{o.name || o.organisation_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Administrator Full Name *</label>
                <input type="text" value={accessForm.adminName} onChange={e => setAccessForm({ ...accessForm, adminName: e.target.value })} placeholder="John Doe" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#6D4CFF] focus:ring-3 focus:ring-[rgba(109,76,255,0.1)] transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Administrator Email *</label>
                <input type="email" value={accessForm.adminEmail} onChange={e => setAccessForm({ ...accessForm, adminEmail: e.target.value })} placeholder="admin@school.com" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#6D4CFF] focus:ring-3 focus:ring-[rgba(109,76,255,0.1)] transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Access Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Management', 'Super Admin'].map(type => (
                    <button key={type} onClick={() => setAccessForm({ ...accessForm, accessType: type })}
                      className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${accessForm.accessType === type ? 'bg-[#F3F0FF] border-[#6D4CFF] text-[#6D4CFF]' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>{type}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleGrantAccess} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-sm font-semibold shadow-[0_4px_14px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_20px_rgba(109,76,255,0.4)] hover:-translate-y-0.5 active:scale-[0.98] transition-all">Create Admin Account</button>
            </div>
          </Card>
          <div>
            {showAccessCredentials && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-6 border-l-4 border-l-[#6D4CFF]">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600"><ShieldCheck size={18} /></div>
                    <div><h3 className="text-sm font-bold">Generated Credentials</h3><p className="text-[10px] text-gray-400">Admin access has been created for {accessForm.orgName}.</p></div>
                  </div>
                  <div className="space-y-3">
                    <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Portal URL</label><div className="api-key-display mt-1">{accessCredentials.portal} <button onClick={() => copyToClipboard(accessCredentials.portal)} className="ml-auto text-[#6D4CFF] hover:text-[#5A3EF0]"><Copy size={12} /></button></div></div>
                    <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Email</label><div className="api-key-display mt-1">{accessCredentials.email} <button onClick={() => copyToClipboard(accessCredentials.email)} className="ml-auto text-[#6D4CFF] hover:text-[#5A3EF0]"><Copy size={12} /></button></div></div>
                    <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Password</label><div className="api-key-display mt-1">{accessCredentials.password} <button onClick={() => copyToClipboard(accessCredentials.password)} className="ml-auto text-[#6D4CFF] hover:text-[#5A3EF0]"><Copy size={12} /></button></div></div>
                  </div>
                </Card>
              </motion.div>
            )}
            <Card className="p-6">
              <h3 className="text-sm font-bold mb-3">Management Portal Capabilities</h3>
              <div className="space-y-2.5">
                {[
                  'Create and manage student accounts',
                  'Create and manage staff accounts',
                  'Create and manage parent accounts',
                  'Link parents with students',
                  'Monitor academic workflows',
                  'Generate reports and analytics',
                ].map((cap, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-gray-600">
                    <Check size={14} className="text-green-500 flex-shrink-0" />
                    {cap}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // ===== ANALYTICS =====
  const renderAnalytics = () => {
    const analyticsD = analyticsSummaryData.data;
    const summaryCards = [
      { icon: Building2, label: 'Total Organizations', value: (analyticsD?.totalOrganizations ?? 1248).toLocaleString(), sub: `${(analyticsD?.verifiedOrganizations ?? 930).toLocaleString()} verified`, color: COLORS.primary, bg: '#F3F0FF' },
      { icon: Users, label: 'Active Users', value: (analyticsD?.totalActiveUsers ?? 8540).toLocaleString(), sub: `${(analyticsD?.newUsers ?? 2100).toLocaleString()} new this month`, color: COLORS.success, bg: '#F0FDF4' },
      { icon: Key, label: 'Credentials', value: (analyticsD?.credentialsIssued ?? 45200).toLocaleString(), sub: `${(analyticsD?.monthlyCredentials ?? 4520).toLocaleString()} issued this month`, color: COLORS.warning, bg: '#FFFBEB' },
      { icon: Percent, label: 'Verification Rate', value: `${analyticsD?.verificationRate ?? 74.5}%`, sub: `+${analyticsD?.verificationImprovement ?? 5.2}% improvement`, color: COLORS.info, bg: '#EFF6FF' },
    ];
    const revenueDataLocal = revenueChartData.length > 0 ? revenueChartData : [{ month: 'Jan', revenue: 62000, expenses: 35000 }];
    const pieData = [
      { name: 'Enterprise', value: analyticsD?.enterpriseCount ?? 280 },
      { name: 'Professional', value: analyticsD?.professionalCount ?? 520 },
      { name: 'Starter', value: analyticsD?.starterCount ?? 448 },
    ];
    if (analyticsSummaryData.loading && !analyticsSummaryData.data) return <div className="space-y-6"><div className="page-header"><h1>Analytics</h1><p>Track platform growth, credential issuance, and organization activity.</p></div><LoadingSkeleton rows={4} cols={4} /></div>;
    if (analyticsSummaryData.error && !analyticsSummaryData.data) return <ErrorState message={analyticsSummaryData.error} onRetry={analyticsSummaryData.refetch} />;
    return (
      <div>
        <div className="page-header">
          <h1>Analytics</h1>
          <p>Track platform growth, credential issuance, and organization activity.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {summaryCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.bg, color: s.color }}><Icon size={18} /></div>
                  <div><div className="text-[11px] text-gray-500 font-medium">{s.label}</div><div className="text-xl font-extrabold">{s.value}</div></div>
                </div>
                <div className="text-[10px] text-gray-400">{s.sub}</div>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <Card className="p-5">
            <h3 className="text-sm font-bold mb-4">User Growth & Revenue</h3>
            <div className="h-64">
              {analyticsRevenueData.loading ? <LoadingSkeleton rows={1} cols={1} /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueDataLocal}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} />
                    <Bar dataKey="revenue" fill="#6D4CFF" radius={[6, 6, 0, 0]} name="Revenue ($)" />
                    <Bar dataKey="expenses" fill="#E2E8F0" radius={[6, 6, 0, 0]} name="Expenses ($)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-bold mb-4">Organization Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {PIE_COLORS.map((clr, idx) => <Cell key={idx} fill={clr} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} />
                </RePieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {[{ name: 'Enterprise', color: '#6D4CFF' }, { name: 'Professional', color: '#22C55E' }, { name: 'Starter', color: '#F59E0B' }].map((l, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-500"><div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />{l.name}</div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity Log */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Audit Trail</h3>
            <button className="text-[#6D4CFF] text-[10px] font-semibold">View all</button>
          </div>
          <div className="overflow-x-auto">
            {auditLogsData.loading ? <LoadingSkeleton rows={4} cols={4} /> : (
              <table className="data-table">
                <thead><tr><th>Action</th><th>User</th><th>Target</th><th>Time</th></tr></thead>
                <tbody>
                  {auditArray.length === 0 && (
                    <tr><td colSpan={4} className="text-center text-xs text-gray-400 py-8">No audit logs available</td></tr>
                  )}
                  {auditArray.map((log: any) => (
                    <tr key={log.id || log._id}>
                      <td className="font-medium">{log.action || log.event || 'N/A'}</td>
                      <td className="text-gray-600">{log.user || log.performed_by || 'N/A'}</td>
                      <td className="text-gray-600">{log.target || log.organisation_name || log.org || 'N/A'}</td>
                      <td><span className="text-[10px] text-gray-400">{log.time || log.created_at || 'N/A'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // ===== CREDENTIAL HISTORY =====
   const renderCredentialHistory = () => {
     const getStatusBadge = (status: string) => {
       const map: Record<string, { label: string; variant: any }> = { active: { label: 'Active', variant: 'success' as const }, verified: { label: 'Verified', variant: 'success' as const }, pending: { label: 'Pending', variant: 'warning' as const }, suspended: { label: 'Suspended', variant: 'danger' as const }, expired: { label: 'Expired', variant: 'danger' as const } };
       return <Badge variant={map[status?.toLowerCase()]?.variant || 'default'} className="text-[9px]">{map[status?.toLowerCase()]?.label || status || 'Unknown'}</Badge>;
     };
     if (credListData.loading && credsArray.length === 0) return <div className="space-y-6"><div className="page-header"><h1>Management Credentials</h1><p>View all management portal credentials issued to organizations.</p></div><LoadingSkeleton rows={6} cols={8} /></div>;
     if (credListData.error && credsArray.length === 0) return <ErrorState message={credListData.error} onRetry={credListData.refetch} />;

     const downloadCsv = () => {
       const header = 'Name,Organization,Email,Password,Role,Created Date';
       const rows = filteredCreds.map((c: any) => `${c.full_name || ''},${c.organisation_name || ''},${c.email || ''},${c.password || ''},${c.role || ''},${c.created_at || ''}`);
       const csv = '\uFEFF' + header + '\n' + rows.join('\n');
       const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a'); a.href = url; a.download = 'management-credentials.csv'; a.click();
       URL.revokeObjectURL(url);
     };

     return (
       <div>
         <div className="page-header flex items-center justify-between flex-wrap gap-3">
           <div>
             <h1>Management Credentials</h1>
             <p>View all management portal credentials issued to organizations.</p>
           </div>
           <div className="flex items-center gap-2">
             <button onClick={downloadCsv} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.97] transition-all"><Download size={14} /> Export CSV</button>
           </div>
         </div>

         {/* Filters */}
         <Card className="p-4 mb-5">
           <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
               <Search size={14} className="text-gray-400" />
               <input type="text" value={credSearch} onChange={e => { setCredSearch(e.target.value); setCredPage(1); }} placeholder="Search by name, email, or organization..." className="bg-transparent border-none outline-none text-xs flex-1" />
             </div>
             <select value={credFilter} onChange={e => { setCredFilter(e.target.value); setCredPage(1); }} className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium outline-none focus:border-[#6D4CFF]">
               <option value="all">All Roles</option>
               <option value="management">Management</option>
               <option value="admin">Admin</option>
             </select>
           </div>
         </Card>

         {/* Table */}
         <Card className="overflow-hidden">
           <div className="overflow-x-auto">
             <table className="data-table">
               <thead><tr>
                 <th>Name</th><th>Organization</th><th>Email</th><th>Password</th><th>Role</th><th>Created</th><th className="text-right">Actions</th>
               </tr></thead>
               <tbody>
                 {paginatedCreds.map((crd: any) => (
                   <tr key={crd.id}>
                     <td className="font-medium text-xs">{crd.full_name || 'N/A'}</td>
                     <td className="text-xs text-gray-600">{crd.organisation_name || 'N/A'}</td>
                     <td className="text-xs">{crd.email || 'N/A'}</td>
                     <td>
                       <span className="text-[11px] font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                         {crd.password ? crd.password : 'N/A'}
                       </span>
                     </td>
                     <td><span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium capitalize">{crd.role || 'N/A'}</span></td>
                     <td className="text-xs text-gray-500">{crd.created_at ? new Date(crd.created_at).toLocaleDateString() : 'N/A'}</td>
                     <td className="text-right">
                       <div className="flex items-center justify-end gap-1">
                         <button onClick={() => { copyToClipboard(crd.email || ''); toast.success('Email copied'); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF] transition-all" title="Copy Email"><Copy size={13} /></button>
                         <button onClick={() => { copyToClipboard(crd.password || ''); toast.success('Password copied'); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF] transition-all" title="Copy Password"><Key size={13} /></button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           {filteredCreds.length === 0 && (
             <EmptyState message={credListData.loading ? 'Loading credentials...' : 'No credentials found matching your filters.'} />
           )}
           {filteredCreds.length > 0 && (
             <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
               <span className="text-[11px] text-gray-400">Showing {(credPage - 1) * credPageSize + 1}-{Math.min(credPage * credPageSize, filteredCreds.length)} of {filteredCreds.length}</span>
               <div className="flex items-center gap-1">
                 <button disabled={credPage === 1} onClick={() => setCredPage(1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronFirst size={14} /></button>
                 <button disabled={credPage === 1} onClick={() => setCredPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14} /></button>
                 <span className="text-xs font-medium px-3 py-1 rounded-lg bg-[#F3F0FF] text-[#6D4CFF]">{credPage} / {totalCredPages}</span>
                 <button disabled={credPage === totalCredPages} onClick={() => setCredPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14} /></button>
                 <button disabled={credPage === totalCredPages} onClick={() => setCredPage(totalCredPages)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLast size={14} /></button>
               </div>
             </div>
           )}
         </Card>
       </div>
     );
   };

  // ===== BULK UPLOAD =====
  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows: { name: string; email: string; phone: string; address: string }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((h, idx) => { row[h] = vals[idx] || ''; });
      if (row.name || row.email) rows.push({ name: row.name || '', email: row.email || '', phone: row.phone || '', address: row.address || '' });
    }
    return rows;
  };

  const handleBulkFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length === 0) { toast.error('No valid data found in CSV. Expected columns: name, email, phone, address'); return; }
      setBulkData(rows);
      setBulkResults(null);
      toast.success(`Parsed ${rows.length} organisations from CSV`);
    };
    reader.readAsText(file);
  };

  const handleBulkGenerate = async () => {
    if (bulkData.length === 0) { toast.error('No data to process'); return; }
    setBulkLoading(true);
    try {
      const res = await bulkApi.createOrganisations(bulkData);
      if (res.success && res.data) {
        setBulkResults(res.data.credentials || []);
        toast.success(`Generated ${res.data.success_count || 0} credentials`);
        if (res.data.failed_count > 0) toast.error(`${res.data.failed_count} failed`);
      } else {
        toast.error(res.error || 'Bulk creation failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error');
    } finally {
      setBulkLoading(false);
    }
  };

  const downloadBulkCSV = () => {
    if (!bulkResults || bulkResults.length === 0) return;
    const header = 'Name,Email,Password,Portal,Status,Error';
    const rows = bulkResults.map(r => `${r.name},${r.email},${r.password},${r.portal},${r.status},${r.error || ''}`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bulk-credentials.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const renderBulkUpload = () => {
    const sampleCSV = `name,email,phone,address\nGreenfield School,admin@greenfield.edu,+1234567890,123 School St\nRiverside Academy,contact@riverside.edu,+1987654321,456 College Ave`;
    return (
      <div>
        <div className="page-header">
          <h1>Bulk Upload</h1>
          <p>Upload a CSV file to generate credentials for multiple organisations at once.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <Card className="p-6">
              <h3 className="text-sm font-bold mb-4">Upload CSV</h3>
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#6D4CFF] hover:bg-[#F3F0FF]/30 transition-all"
                onClick={() => bulkFileRef.current?.click()}
              >
                <Upload size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-600">Click to upload CSV file</p>
                <p className="text-xs text-gray-400 mt-1">Columns: name, email, phone, address</p>
              </div>
              <input ref={bulkFileRef} type="file" accept=".csv" className="hidden" onChange={handleBulkFile} />
              <div className="mt-4 p-3 rounded-xl bg-gray-50">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Expected CSV format</p>
                <pre className="text-[10px] text-gray-600 font-mono leading-relaxed">{sampleCSV}</pre>
              </div>
            </Card>
            {bulkData.length > 0 && !bulkResults && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold">{bulkData.length} Organisations Ready</h3>
                  <button onClick={() => { setBulkData([]); setBulkResults(null); }} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear</button>
                </div>
                <button
                  onClick={handleBulkGenerate}
                  disabled={bulkLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-sm font-semibold hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {bulkLoading ? 'Generating...' : `Generate ${bulkData.length} Credentials`}
                </button>
              </Card>
            )}
          </div>
          <div className="space-y-5">
            {bulkData.length > 0 && !bulkResults && (
              <Card className="p-6">
                <h3 className="text-sm font-bold mb-4">Data Preview ({bulkData.length} rows)</h3>
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkData.map((row, i) => (
                        <tr key={i}>
                          <td className="text-xs text-gray-400">{i + 1}</td>
                          <td className="text-xs font-medium">{row.name}</td>
                          <td className="text-xs text-gray-600">{row.email}</td>
                          <td className="text-xs text-gray-600">{row.phone}</td>
                          <td className="text-xs text-gray-600 truncate max-w-[120px]">{row.address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
            {bulkResults && (
              <Card className="p-6 border-l-4 border-l-[#22C55E]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600"><CheckCircle2 size={18} /></div>
                    <div>
                      <h3 className="text-sm font-bold">Generated Credentials</h3>
                      <p className="text-[10px] text-gray-400">{bulkResults.filter(r => r.status === 'success').length} success, {bulkResults.filter(r => r.status === 'failed').length} failed</p>
                    </div>
                  </div>
                  <button onClick={downloadBulkCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3F0FF] text-[#6D4CFF] text-[10px] font-semibold hover:bg-[#6D4CFF] hover:text-white transition-all"><Download size={12} /> Export CSV</button>
                </div>
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Organisation</th>
                        <th>Email</th>
                        <th>Password</th>
                        <th>Portal</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkResults.map((r, i) => (
                        <tr key={i}>
                          <td className="text-xs font-medium">{r.name}</td>
                          <td className="text-xs">{r.email}</td>
                          <td>
                            <span className="text-[11px] font-mono bg-gray-100 px-2 py-0.5 rounded">{r.password}</span>
                            <button onClick={() => { navigator.clipboard.writeText(r.password); toast.success('Copied'); }} className="ml-1 text-[#6D4CFF] hover:text-[#5A3EF0] inline-block align-middle"><Copy size={11} /></button>
                          </td>
                          <td className="text-xs text-gray-600">{r.portal}</td>
                          <td>
                            {r.status === 'success' ? (
                              <Badge variant="success" className="text-[9px]">Active</Badge>
                            ) : (
                              <Badge variant="danger" className="text-[9px]">{r.error || 'Failed'}</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {bulkResults.length > 0 && (
                  <button onClick={() => { setBulkData([]); setBulkResults(null); }} className="mt-4 w-full py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-all">
                    Upload Another File
                  </button>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ===== SETTINGS =====
  const renderSettings = () => {
    const settingsTabs = [
      { key: 'profile', label: 'Profile', icon: User },
      { key: 'password', label: 'Password', icon: Lock },
      { key: 'security', label: 'Security', icon: ShieldCheck },
      { key: 'branding', label: 'Branding', icon: Palette },
      { key: 'preferences', label: 'Preferences', icon: Settings },
      { key: 'api-keys', label: 'API Keys', icon: Key },
      { key: 'audit-logs', label: 'Audit Logs', icon: FileText },
    ];

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="page-header mb-0"><h1>Settings</h1><p>Manage your account, security, branding and platform preferences.</p></div>
          {settingsTab === 'profile' && (
            <button onClick={() => setShowProfileEdit(!showProfileEdit)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.97] transition-all">
              {showProfileEdit ? <Check size={14} /> : <Edit3 size={14} />}{showProfileEdit ? 'Save Changes' : 'Edit Profile'}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="settings-tabs overflow-x-auto">
          {settingsTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setSettingsTab(tab.key)}
                className={`settings-tab ${settingsTab === tab.key ? 'active' : ''}`}>
                <Icon size={14} />{tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={settingsTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
            {/* PROFILE */}
            {settingsTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6 lg:col-span-2">
                  <h3 className="text-sm font-bold mb-5">Admin Account</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Full Name', value: session?.user?.full_name || 'System Administrator', key: 'name' },
                      { label: 'Email Address', value: session?.user?.email || 'admin@prasynx.com', key: 'email' },
                      { label: 'Role', value: 'Super Admin', key: 'role' },
                      { label: 'Phone', value: '+1 (555) 000-0000', key: 'phone' },
                      { label: 'Last Login', value: 'Today at 9:42 AM', key: 'lastLogin' },
                      { label: 'Member Since', value: 'January 12, 2023', key: 'memberSince' },
                    ].map((field, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-b-0">
                        <span className="text-xs text-gray-500">{field.label}</span>
                        {showProfileEdit && field.key !== 'role' && field.key !== 'lastLogin' && field.key !== 'memberSince' ? (
                          <input type="text" defaultValue={field.value} className="text-xs font-medium text-right px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#6D4CFF] w-48" />
                        ) : (
                          <span className="text-xs font-medium">{field.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
                <div>
                  <Card className="p-6 mb-4">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="w-20 h-20 mb-3 ring-4 ring-[#F3F0FF]">
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white text-xl font-bold rounded-full">{userInitials}</div>
                      </Avatar>
                      <h3 className="text-sm font-bold">{session?.user?.full_name || 'Administrator'}</h3>
                      <p className="text-[10px] text-gray-400">Super Admin</p>
                      <button className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F3F0FF] text-[#6D4CFF] text-[10px] font-semibold hover:bg-[#6D4CFF] hover:text-white transition-all"><Upload size={12} /> Upload Avatar</button>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <h3 className="text-sm font-bold mb-4">Platform Information</h3>
                    <div className="space-y-2.5">
                      {[
                        { label: 'Platform', value: 'Prasynx' },
                        { label: 'Version', value: '2.4.1' },
                        { label: 'Environment', value: 'Production' },
                        { label: 'Server Region', value: 'US East (N. Virginia)' },
                        { label: 'Current Time', value: new Date().toLocaleString() },
                        { label: 'License Status', value: 'Active', badge: true },
                        { label: 'Database', value: 'Connected', badge: true },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5">
                          <span className="text-[11px] text-gray-500">{item.label}</span>
                          {item.badge ? (
                            <Badge variant="success" className="text-[9px]">{item.value}</Badge>
                          ) : (
                            <span className="text-[11px] font-medium">{item.value}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* PASSWORD */}
            {settingsTab === 'password' && (
              <div className="max-w-lg">
                <Card className="p-6">
                  <h3 className="text-sm font-bold mb-5">Change Password</h3>
                  <div className="space-y-4">
                    <div><label className="text-xs font-semibold text-gray-700 block mb-1.5">Current Password</label><input type="password" placeholder="Enter current password" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#6D4CFF] transition-all" /></div>
                    <div><label className="text-xs font-semibold text-gray-700 block mb-1.5">New Password</label><input type="password" placeholder="Enter new password" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#6D4CFF] transition-all" /></div>
                    <div><label className="text-xs font-semibold text-gray-700 block mb-1.5">Confirm New Password</label><input type="password" placeholder="Confirm new password" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#6D4CFF] transition-all" /></div>
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center justify-between mb-1"><span className="text-[10px] font-semibold text-gray-500">Password Strength</span><span className="text-[10px] font-semibold text-gray-400">—</span></div>
                      <Progress value={0} className="h-1.5" />
                      <p className="text-[10px] text-gray-400 mt-1.5">Enter a new password to see strength indicator</p>
                    </div>
                    <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-sm font-semibold hover:shadow-lg active:scale-[0.98] transition-all">Update Password</button>
                  </div>
                </Card>
              </div>
            )}

            {/* SECURITY */}
            {settingsTab === 'security' && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: Lock, label: 'Password Strength', value: 'Strong', badge: true, color: COLORS.success, bg: '#F0FDF4' },
                    { icon: Fingerprint, label: '2FA Status', value: 'Enabled', badge: true, color: COLORS.primary, bg: '#F3F0FF' },
                    { icon: Globe, label: 'Session Count', value: '3 Active', badge: false, color: COLORS.info, bg: '#EFF6FF' },
                    { icon: Clock, label: 'Last Login Activity', value: 'Today, 9:42 AM', badge: false, color: COLORS.warning, bg: '#FFFBEB' },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <Card key={i} className="p-5">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: s.bg, color: s.color }}><Icon size={18} /></div>
                        <div className="text-[11px] text-gray-500 font-medium">{s.label}</div>
                        {s.badge ? <Badge variant="success" className="text-[9px] mt-1">{s.value}</Badge> : <div className="text-xs font-semibold mt-1">{s.value}</div>}
                      </Card>
                    );
                  })}
                </div>
                <Card className="p-6">
                  <h3 className="text-sm font-bold mb-4">Security Actions</h3>
                  <div className="space-y-3">
                    {[
                      { icon: Lock, label: 'Change Password', desc: 'Update your account password', color: COLORS.primary },
                      { icon: Fingerprint, label: 'Enable Two-Factor Authentication', desc: 'Add an extra layer of security', color: COLORS.success },
                      { icon: Globe, label: 'Manage Active Sessions', desc: 'View and revoke active sessions', color: COLORS.info },
                      { icon: FileText, label: 'Download Security Report', desc: 'Export security audit log', color: COLORS.warning },
                    ].map((action, i) => {
                      const Icon = action.icon;
                      return (
                        <button key={i} className="flex items-center gap-3 w-full p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${action.color}15`, color: action.color }}><Icon size={18} /></div>
                          <div className="flex-1"><div className="text-xs font-semibold">{action.label}</div><div className="text-[10px] text-gray-400">{action.desc}</div></div>
                          <ArrowUpRight size={14} className="text-gray-300" />
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* BRANDING */}
            {settingsTab === 'branding' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-sm font-bold mb-5">Brand Settings</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Logo</label>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 border-dashed">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white font-extrabold text-xl">P</div>
                        <div>
                          <button className="text-xs font-semibold text-[#6D4CFF] hover:underline">Upload new logo</button>
                          <p className="text-[10px] text-gray-400 mt-0.5">PNG or SVG. At least 256x256px.</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-2">Primary Color</label>
                        <div className="flex items-center gap-2">
                          <div className="color-swatch" style={{ background: '#6D4CFF' }} />
                          <span className="text-xs font-mono text-gray-500">#6D4CFF</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-2">Secondary Color</label>
                        <div className="flex items-center gap-2">
                          <div className="color-swatch" style={{ background: '#8B5CF6' }} />
                          <span className="text-xs font-mono text-gray-500">#8B5CF6</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Theme</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { name: 'Light', icon: Sun, color: '#FBBF24' },
                          { name: 'Dark', icon: Moon, color: '#6B7280' },
                          { name: 'System', icon: Monitor, color: '#3B82F6' },
                        ].map((theme, i) => {
                          const Icon = theme.icon;
                          return (
                            <button key={i} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${i === 0 ? 'border-[#6D4CFF] bg-[#F3F0FF] text-[#6D4CFF]' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                              <Icon size={18} style={{ color: theme.color }} />
                              {theme.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">Custom Domain</label>
                      <input type="text" defaultValue="admin.prasynx.com" placeholder="admin.yourdomain.com" className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#6D4CFF] transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">Email Branding</label>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div><div className="text-xs font-medium">Custom email templates</div><div className="text-[10px] text-gray-400">Use organization branding in emails</div></div>
                        <div className={`toggle active`}><span className="toggle-thumb" /></div>
                      </div>
                    </div>
                    <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-sm font-semibold hover:shadow-lg active:scale-[0.98] transition-all">Save Branding</button>
                  </div>
                </Card>
                <div>
                  <Card className="p-6 mb-4">
                    <h3 className="text-sm font-bold mb-4">Preview</h3>
                    <div className="rounded-xl overflow-hidden border border-gray-200">
                      <div className="bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] p-4">
                        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-[10px]">P</div><span className="text-white text-xs font-bold">Prasynx</span></div>
                      </div>
                      <div className="p-4 bg-white">
                        <div className="text-xs font-semibold mb-1">Welcome to Prasynx</div>
                        <div className="text-[10px] text-gray-500">Your organization has been onboarded successfully. Use the credentials below to access the management portal.</div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <h3 className="text-sm font-bold mb-4">Email Branding Preview</h3>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="text-xs font-semibold text-gray-400 mb-2">From: Prasynx &lt;no-reply@prasynx.com&gt;</div>
                      <div className="text-sm font-bold text-[#6D4CFF]">Welcome to Prasynx Platform</div>
                      <div className="text-xs text-gray-600 mt-2">Dear Administrator,</div>
                      <div className="text-xs text-gray-500 mt-1">Your organization has been successfully onboarded. You can now access the management portal using the credentials below.</div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* PREFERENCES */}
            {settingsTab === 'preferences' && (
              <div className="max-w-2xl">
                <Card className="p-6">
                  <h3 className="text-sm font-bold mb-5">Platform Preferences</h3>
                  <div className="space-y-5">
                    {[
                      { label: 'Email Notifications', desc: 'Receive email notifications for important updates', enabled: true },
                      { label: 'Slack Integration', desc: 'Send notifications to Slack workspace', enabled: false },
                      { label: 'Weekly Reports', desc: 'Receive weekly platform activity summary', enabled: true },
                      { label: 'Auto-logout Timer', desc: 'Automatically logout after 30 minutes of inactivity', enabled: false },
                      { label: 'New User Invites', desc: 'Allow admins to invite users without approval', enabled: true },
                      { label: 'Audit Logging', desc: 'Enable detailed audit logging for all platform actions', enabled: true },
                    ].map((pref, i) => (
                      <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                        <div><div className="text-xs font-semibold">{pref.label}</div><div className="text-[10px] text-gray-400">{pref.desc}</div></div>
                        <div className={`toggle ${pref.enabled ? 'active' : 'inactive'}`}><span className="toggle-thumb" /></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Language</label>
                    <select className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#6D4CFF] transition-all">
                      <option>English</option><option>Hindi</option><option>Tamil</option><option>Telugu</option><option>Bengali</option>
                    </select>
                  </div>
                  <div className="mt-4">
                    <label className="text-xs font-semibold text-gray-700 block mb-2">Timezone</label>
                    <select className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#6D4CFF] transition-all">
                      <option>UTC (Coordinated Universal Time)</option>
                      <option>America/New_York (EST)</option>
                      <option>Asia/Kolkata (IST)</option>
                      <option>Europe/London (GMT)</option>
                      <option>Asia/Tokyo (JST)</option>
                    </select>
                  </div>
                </Card>
              </div>
            )}

            {/* API KEYS */}
            {settingsTab === 'api-keys' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-500">Manage API keys for programmatic access to the platform.</p>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.97] transition-all"><Plus size={14} /> Create API Key</button>
                </div>
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead><tr><th>Key Name</th><th>Created</th><th>Permissions</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                      <tbody>
                        {[
                          { name: 'Production API Key', created: 'Jan 15, 2024', permissions: 'Full Access', status: 'active' },
                          { name: 'Staging API Key', created: 'Mar 20, 2024', permissions: 'Read Only', status: 'active' },
                          { name: 'Development Key', created: 'Jun 5, 2024', permissions: 'Limited', status: 'active' },
                          { name: 'Integration Test Key', created: 'Aug 12, 2024', permissions: 'Read Only', status: 'revoked' },
                        ].map((key, i) => (
                          <tr key={i}>
                            <td className="font-medium text-xs">{key.name}</td>
                            <td className="text-xs text-gray-500">{key.created}</td>
                            <td><span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">{key.permissions}</span></td>
                            <td><Badge variant={key.status === 'active' ? 'success' : 'danger'} className="text-[9px]">{key.status}</Badge></td>
                            <td className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF] transition-all"><Copy size={13} /></button>
                                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF] transition-all"><RefreshCw size={13} /></button>
                                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#EF4444] transition-all"><Trash2 size={13} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* AUDIT LOGS */}
            {settingsTab === 'audit-logs' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-500">Track all changes and actions performed on the platform.</p>
                  <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 active:scale-[0.97] transition-all"><Download size={14} /> Export Logs</button>
                </div>
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead><tr><th>Action</th><th>User</th><th>Target</th><th>Time</th><th className="text-right">Type</th></tr></thead>
                      <tbody>
                        {auditArray.map((log: any) => (
                          <tr key={log.id || log._id}>
                            <td className="font-medium text-xs">{log.action || log.event || 'N/A'}</td>
                            <td className="text-xs text-gray-600">{log.user || log.performed_by || 'N/A'}</td>
                            <td className="text-xs text-gray-600">{log.target || log.organisation_name || log.org || 'N/A'}</td>
                            <td className="text-xs text-gray-500">{log.time || log.created_at || 'N/A'}</td>
                            <td className="text-right">
                              <Badge variant={log.type === 'create' ? 'success' : log.type === 'delete' ? 'danger' : 'info'} className="text-[9px]">{log.type || 'N/A'}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  // ===== MAIN RENDER =====
  return (
    <div className="app-layout">
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="workspace-logo">
  <img src="/icons/fav.png" alt="Logo" />
</div>
          <div><div className="sidebar-logo-text">Prasynx</div><div className="sidebar-logo-badge">Admin Portal</div></div>
        </div>
        <nav className="sidebar-nav">
          {navGroups.map(group => (
            <div key={group.label} className="mb-1">
              <div className="text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider px-3 py-1.5">{group.label}</div>
              {group.items.map(item => (
                <NavItem key={item.key} item={item} isActive={activeTab === item.key} />
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-footer-card">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-[#6D4CFF]/10 flex items-center justify-center text-[#6D4CFF]"><Sparkles size={12} /></div>
              <span className="text-[11px] font-semibold">Platform v2.4.1</span>
            </div>
            <div className="text-[10px] text-gray-400">Last updated: Mar 2025</div>
          </div>
          <button onClick={() => setActiveTab('settings')} className={`sidebar-footer-item ${activeTab === 'settings' ? 'text-[#6D4CFF]' : ''}`}>
            <HelpCircle size={14} /><span>Help & Support</span>
          </button>
          <a href="#" className="sidebar-footer-item" onClick={e => e.preventDefault()}>
            <BookOpen size={14} /><span>Documentation</span><ExternalLink size={10} className="ml-auto" />
          </a>
          <button className="sidebar-footer-item !text-[#EF4444]" onClick={logout}>
            <LogOut size={14} /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <button className="header-mobile-btn" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button>
            <div className="hidden lg:flex search-bar">
              <Search size={16} />
              <input type="text" placeholder="Search organizations, users, credentials..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <span className="search-badge"><Sparkles size={10} /> AI</span>
            </div>
          </div>
          <div className="header-right">
            <LanguageSwitcher />
            <div className="header-divider" />
            <button className="header-btn" onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Sun size={17} /> : <Moon size={17} />}</button>
            <div className="header-divider" />
            <div className="relative" ref={notifRef}>
              <button className="header-btn" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
                <Bell size={17} />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center">{notifications.filter((n) => n.priority === 'high').length}</span>
              </button>
              {showNotifDropdown && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 top-full mt-2 w-[320px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    <button className="text-[10px] text-[#6D4CFF] font-semibold">View all</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 && (
                      <div className="p-6 text-center text-xs text-gray-400">No notifications</div>
                    )}
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${n.priority === 'high' ? 'bg-red-50/20' : ''}`}>
                        <div className="flex items-start gap-2.5">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.priority === 'high' ? 'bg-red-500' : 'bg-[#6D4CFF]'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold">{n.title}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{n.message}</div>
                            <div className="text-[10px] text-gray-300 mt-1">{n.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            <div className="header-divider" />
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('settings')}>
              <Avatar className="w-8 h-8 ring-2 ring-[#F3F0FF]">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-bold rounded-full">{userInitials}</div>
              </Avatar>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold">{session?.user?.full_name || 'Administrator'}</div>
                <div className="text-[10px] text-gray-400">Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="page">
          <Toaster />
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'global-command' && <GlobalCommandCenter />}
              {activeTab === 'cross-portal' && <CrossPortalControlCenter />}
              {activeTab === 'real-time' && <RealTimeMonitoring />}
              {activeTab === 'global-search' && <GlobalSearchComponent />}
              {activeTab === 'organizations' && renderOrganizations()}
              {activeTab === 'org-management' && <OrganizationManagementCenter />}
              {activeTab === 'add-organization' && renderAddOrganization()}
              {activeTab === 'grant-access' && renderGrantAccess()}
              {activeTab === 'user-management' && <UnifiedUserManagement />}
              {activeTab === 'billing' && <BillingSubscriptionManagement />}
              {activeTab === 'analytics' && renderAnalytics()}
              {activeTab === 'credential-history' && renderCredentialHistory()}
              {activeTab === 'bulk-upload' && renderBulkUpload()}
              {activeTab === 'security-center' && <SecurityCommandCenter />}
              {activeTab === 'support-hub' && <SupportManagement />}
              {activeTab === 'ai-command' && <AIAdminCommandCenter />}
              {activeTab === 'settings' && renderSettings()}
              {activeTab === 'voice-ai' && <VoiceAITab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
