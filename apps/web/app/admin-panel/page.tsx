'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, UserPlus, ShieldCheck, BarChart3, History, Settings,
  Users, Key, Eye, Plus, Search, Download, ChevronDown, ChevronRight, LogOut,
  Bell, Moon, Sun, Menu, X, CheckCircle2, AlertTriangle, TrendingUp, IndianRupee,
  Globe, Database, Clock, Copy, RefreshCw, Trash2, ArrowUpRight, Sparkles,
  FileText, Lock, Fingerprint, Palette, Mail, Smartphone, Monitor, Check,
  Edit3, Upload, User, Award, HelpCircle, ExternalLink, BookOpen,
  Filter, ChevronLeft, ChevronFirst, ChevronLast, ArrowUpDown,
  Building, Percent, CreditCard, TicketCheck, Mic, Cloud, Brain,
  Activity, Shield, Lightbulb,

} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  LineChart, Line, PieChart as RePieChart, Pie, Cell, Legend, ComposedChart,
} from 'recharts';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Avatar } from './components/ui/avatar';
import { Progress } from './components/ui/progress';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from './lib/useApi';
import { organisationApi, credentialApi, auditApi, analyticsApi, adminApi, bulkApi, billingApi } from './lib/dataService';
import VoiceAITab from './lib/VoiceAITab';
import ThemeToggle from './components/theme/ThemeToggle';
import CrossPortalControlCenter from './components/center/CrossPortalControlCenter';
import RealTimeMonitoring from './components/center/RealTimeMonitoring';
import GlobalSearchComponent from './components/center/GlobalSearch';
import OrganizationManagementCenter from './components/center/OrganizationManagementCenter';
import UnifiedUserManagement from './components/center/UnifiedUserManagement';
import BillingSubscriptionManagement from './components/center/BillingSubscriptionManagement';
import SecurityCommandCenter from './components/center/SecurityCommandCenter';
import SupportManagement from './components/center/SupportManagement';
import AIAdminCommandCenter from './components/center/AIAdminCommandCenter';
import GlobalCommandCenter from './components/center/GlobalCommandCenter';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', accent: '#A855F7', purple: '#7C3AED' };
const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#A855F7'];

type OrgPlan = { key: string; label: string; monthly: number; yearly: number; color: string; gradient: string; tagline: string; features: string[]; popular?: boolean };
const PLAN_CATALOG: OrgPlan[] = [
  { key: 'starter', label: 'Starter', monthly: 7999, yearly: 89999, color: '#94A3B8', gradient: 'from-slate-400 to-slate-500', tagline: 'For small single-campus schools', features: ['Up to 200 students', '2 admin accounts', 'Management portal', 'Basic analytics', 'Email support'] },
  { key: 'growth', label: 'Growth', monthly: 9999, yearly: 99999, color: '#3B82F6', gradient: 'from-blue-500 to-blue-600', tagline: 'For growing schools', features: ['Up to 500 students', '5 admin accounts', 'Staff portal', 'Fees & finance module', 'Email + chat support'] },
  { key: 'professional', label: 'Professional', monthly: 14999, yearly: 149999, color: '#6D4CFF', gradient: 'from-[#6D4CFF] to-[#8B5CF6]', tagline: 'Most popular for mid-size schools', features: ['Up to 1,000 students', '15 admin accounts', 'Student & parent portals', 'Exams & report cards', 'Priority support'], popular: true },
  { key: 'premium', label: 'Premium', monthly: 24999, yearly: 259999, color: '#A855F7', gradient: 'from-purple-500 to-fuchsia-500', tagline: 'For large institutions', features: ['Up to 2,000 students', '25 admin accounts', 'All portals + AI insights', 'Transport & hostel modules', 'SSO + API access'] },
  { key: 'enterprise', label: 'Enterprise', monthly: 0, yearly: 0, color: '#F59E0B', gradient: 'from-amber-500 to-orange-500', tagline: 'Custom solution for groups & boards', features: ['Unlimited students', 'Unlimited admin accounts', 'Custom integrations', 'Dedicated success manager', 'On-prem / private cloud'] },
];
const PLAN_MAP = Object.fromEntries(PLAN_CATALOG.map(p => [p.key, p]));
const PLANS = ['starter', 'growth', 'professional', 'premium', 'enterprise'];

const formatCurrency = (n: number, currency = 'INR') => new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

const formatLogTime = (iso?: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return String(iso).slice(0, 16);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
};

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
  const { session, logout: authLogout, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [settingsTab, setSettingsTab] = useState('profile');

  const [orgForm, setOrgForm] = useState({
    name: '', email: '', secondary_email: '', phone: '', website: '',
    address: '', city: '', country: '',
    contact_person: '',
    plan: 'professional',
    billing_cycle: 'yearly',
    student_capacity: 500,
    max_admins: 5,
    modules: ['management', 'staff', 'student', 'parent'] as string[],
    notes: '',
  });
  const [orgSubmitting, setOrgSubmitting] = useState(false);
  const [showOrgCredentials, setShowOrgCredentials] = useState(false);
  const [orgCredentials, setOrgCredentials] = useState({ portal: '', email: '', password: '' });

  const [accessForm, setAccessForm] = useState({ orgId: '', orgName: '', adminName: '', adminEmail: '', accessType: 'Management' });
  const [showAccessCredentials, setShowAccessCredentials] = useState(false);
  const [accessCredentials, setAccessCredentials] = useState({ portal: '', email: '', password: '' });

  const [orgSearch, setOrgSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState('all');
  const [orgPage, setOrgPage] = useState(1);
  const pageSize = 4;
  const [orgDetail, setOrgDetail] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deletePasscode, setDeletePasscode] = useState('');
  const [deleting, setDeleting] = useState(false);

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
  const revenueData = useApi(() => analyticsApi.revenue(), [isAuthenticated], true);
  const billingOverview = useApi(() => billingApi.overview(), [isAuthenticated], true);

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
    if (activeTab === 'dashboard') billingOverview.refetch();
  }, [activeTab, isAuthenticated]);

  const userInitials = session?.user?.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'A';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const logout = () => { authLogout(); };

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
  const billingOv = billingOverview.data || {};
  const revTrend = Array.isArray(billingOv.revenueTrend)
    ? billingOv.revenueTrend.map((t: any) => ({ month: t.month, revenue: Number(t.amount) || 0 }))
    : [];
  const inr = (n: number) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;

  const recentActivities = auditArray.slice(0, 5).map((log: any) => {
    return {
      action: log.action || log.event || 'Activity',
      org: log.target || log.organisation_name || log.org || '',
      time: formatLogTime(log.time || log.created_at),
      icon: TrendingUp,
      color: COLORS.primary,
    };
  });

  const filteredOrgs = orgsArray.filter((o: any) => {
    const matchesSearch = (o.name || '').toLowerCase().includes(orgSearch.toLowerCase()) || (o.email || '').toLowerCase().includes(orgSearch.toLowerCase()) || (o.org_id || '').toLowerCase().includes(orgSearch.toLowerCase());
    const matchesFilter = orgFilter === 'all' || (o.status || '').toLowerCase() === orgFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });
  const totalOrgPages = Math.ceil(filteredOrgs.length / pageSize);
  const paginatedOrgs = filteredOrgs.slice((orgPage - 1) * pageSize, orgPage * pageSize);

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

  useEffect(() => {
    if (!loading && !session) {
      window.location.href = '/admin-panel/login';
    }
  }, [loading, session]);

  if (loading || !session) {
    return null;
  }

  // ===== DASHBOARD =====
  const renderDashboard = () => {
    if (dashboardData.loading) {
      return <div className="space-y-6"><LoadingSkeleton rows={4} cols={4} /></div>;
    }
    if (dashboardData.error) {
      return <ErrorState message={dashboardData.error} onRetry={dashboardData.refetch} />;
    }
    const fmt = (n: number) => (n ?? 0).toLocaleString();
    const growthBadge = (v: number) => {
      const num = Number(v) || 0;
      return <Badge variant={num >= 0 ? 'success' : 'danger'} className="text-[9px]">{num >= 0 ? '+' : ''}{num}%</Badge>;
    };
const tooltipStyle = { borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' };
    const dashboardLoading = orgGrowthData.loading || credTrendData.loading || userActivityData.loading || topOrgsData.loading;

    const chartData = (() => {
      const orgs = Array.isArray(orgGrowthChart) ? orgGrowthChart : [];
      const creds = Array.isArray(credTrendChart) ? credTrendChart : [];
      const acts = Array.isArray(userActivityChart) ? userActivityChart : [];
      const rev = Array.isArray(revenueChartData) ? revenueChartData : [];
      const pad = (arr: any[], labelKey: string) => arr.length ? arr : Array.from({ length: 7 }, (_, i) => ({ [labelKey]: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i] || `M${i}` }));
      return { orgs: pad(orgs, 'month'), creds: pad(creds, 'month'), acts: pad(acts, 'name'), rev: pad(rev, 'month') };
    })();

    const kpis = [
      { icon: Building2, label: 'Total Organizations', value: fmt(dashKpis?.totalOrganizations), trend: dashKpis?.orgGrowth, color: COLORS.primary, bg: '#F3F0FF' },
      { icon: Users, label: 'Active Users', value: fmt(dashKpis?.totalActiveUsers), trend: dashKpis?.userGrowth, color: COLORS.success, bg: '#F0FDF4' },
      { icon: Award, label: 'Credentials Issued', value: fmt(dashKpis?.credentialsIssued), trend: dashKpis?.credGrowth, color: COLORS.warning, bg: '#FFFBEB' },
      { icon: IndianRupee, label: 'Monthly Revenue', value: inr(billingOv.monthlyRevenue ?? 0), trend: dashKpis?.monthlyGrowth, color: COLORS.info, bg: '#EFF6FF' },
    ];

    const aiInsights = (() => {
      const insights: { priority: 'critical' | 'high' | 'medium' | 'low'; title: string; desc: string; impact: string; category: string }[] = [];
      const orgs = Number(dashKpis?.totalOrganizations) || 0;
      const creds = Number(dashKpis?.credentialsIssued) || 0;
      const users = Number(dashKpis?.totalActiveUsers) || 0;
      const orgGrowth = Number(dashKpis?.orgGrowth) || 0;
      const credGrowth = Number(dashKpis?.credGrowth) || 0;
      const userGrowth = Number(dashKpis?.userGrowth) || 0;

      if (orgs === 0 && creds === 0 && users === 0) {
        insights.push({ priority: 'low', title: 'Platform is warming up', desc: 'No live activity detected yet. As organizations onboard, real-time insights will appear here.', impact: 'Info', category: 'Onboarding' });
      } else {
        if (orgGrowth < 0) insights.push({ priority: 'critical', title: 'Organization growth declining', desc: `Organization base ${orgGrowth}% this period. Review onboarding and activation funnel to reverse the trend.`, impact: 'High', category: 'Growth' });
        else if (orgs > 0) insights.push({ priority: 'low', title: 'Organization growth is steady', desc: `${orgs} organizations onboarded, growing ${orgGrowth > 0 ? '+' : ''}${orgGrowth}% this month.`, impact: 'Medium', category: 'Growth' });

        if (userGrowth < 0) insights.push({ priority: 'high', title: 'Active user engagement dropping', desc: `Active users ${userGrowth}% this period. Consider targeted activation campaigns to re-engage.`, impact: 'Medium', category: 'Engagement' });
        else if (users > 0) insights.push({ priority: 'medium', title: 'Active user engagement up', desc: `${users} active users, up ${userGrowth > 0 ? '+' : ''}${userGrowth}% this month.`, impact: 'Medium', category: 'Engagement' });

        if (credGrowth >= 0 && creds > 0) insights.push({ priority: 'medium', title: 'Credential issuance accelerating', desc: `${fmt(creds)} credentials issued, growing ${credGrowth}% this month. Ensure capacity keeps pace.`, impact: 'Medium', category: 'Growth' });

        insights.push({ priority: 'low', title: 'Revenue outlook', desc: `${inr(Number(billingOv.totalRevenue) || 0)} billed across invoiced organizations. Monthly revenue is ${inr(Number(billingOv.monthlyRevenue) || 0)}, averaging ${inr(Number(billingOv.avgRevenuePerOrg) || 0)} per org.`, impact: 'Low', category: 'Finance' });
      }
      return insights.slice(0, 4);
    })();

    const priorityTone: Record<string, string> = {
      critical: 'border-l-red-500 bg-red-50',
      high: 'border-l-yellow-500 bg-yellow-50',
      medium: 'border-l-blue-500 bg-blue-50',
      low: 'border-l-slate-400 bg-slate-50',
    };
    const priorityIconTone: Record<string, string> = {
      critical: 'bg-red-100 text-red-600',
      high: 'bg-yellow-100 text-yellow-600',
      medium: 'bg-blue-100 text-blue-600',
      low: 'bg-slate-100 text-slate-600',
    };
    const priorityBadge: Record<string, any> = { critical: 'danger', high: 'warning', medium: 'info', low: 'default' };

    const chatTotal = (() => {
      const arr = Array.isArray(userActivityChart) ? userActivityChart : [];
      return arr.reduce((a: number, d: any) => a + (Number(d.logins) || 0), 0);
    })();

    const ChartTooltip = ({ active, payload, label, money }: any) => {
      if (!active || !payload?.length) return null;
      return (
        <div className="rounded-xl border border-gray-100 bg-white/95 backdrop-blur-md px-3 py-2.5 shadow-xl text-[10px]">
          <div className="font-bold text-gray-800 mb-1">{label}</div>
          <div className="space-y-1">
            {payload.map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-gray-500">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color || p.fill }} />
                <span>{p.name}:</span>
                <span className="font-semibold text-gray-800 ml-auto">{money ? `₹${Number(p.value).toLocaleString('en-IN')}` : Number(p.value).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div>
        {/* Welcome hero */}
        <div className="relative overflow-hidden rounded-3xl mb-8 border border-white/15 bg-gradient-to-br from-[#3A2A6B] via-[#4B3B9A] to-[#6D4CFF] shadow-[0_20px_60px_rgba(109,76,255,0.28)]">
          {/* Animated aurora orbs */}
          <motion.div className="absolute -top-32 -left-24 w-96 h-96 bg-[#7C3AED]/45 rounded-full blur-[120px] pointer-events-none"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -bottom-32 -right-24 w-96 h-96 bg-[#3B82F6]/35 rounded-full blur-[130px] pointer-events-none"
            animate={{ x: [0, -30, 0], y: [0, -20, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute top-1/3 right-1/4 w-40 h-40 bg-[#A855F7]/45 rounded-full blur-[80px] pointer-events-none"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />

          {/* Dotted grid overlay */}
          <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />

          {/* Sheen sweep */}
          <motion.div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none"
            initial={{ x: '-120%' }} animate={{ x: '320%' }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />

          {/* Floating particles */}
          {[
            { l: 12, t: 20, s: '6px' }, { l: 24, t: 72, s: '4px' }, { l: 38, t: 12, s: '5px' },
            { l: 55, t: 82, s: '6px' }, { l: 68, t: 24, s: '4px' }, { l: 82, t: 64, s: '5px' },
            { l: 90, t: 16, s: '6px' }, { l: 46, t: 48, s: '3px' },
          ].map((p, i) => (
            <motion.span key={i} className="absolute rounded-full bg-white/40 pointer-events-none"
              style={{ left: `${p.l}%`, top: `${p.t}%`, width: p.s, height: p.s }}
              animate={{ y: [0, -14, 0], opacity: [0.25, 0.7, 0.25] }}
              transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.4 }} />
          ))}

          <div className="relative z-10 p-6 md:p-8 xl:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Left: greeting */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 backdrop-blur-md mb-3">
                <Sparkles size={12} className="text-purple-300 animate-pulse" />
                <span className="text-[10px] tracking-[0.18em] uppercase font-semibold text-white/80">Platform Dashboard</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight tracking-tight">
                Welcome back,{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200">Prasynx</span>
              </h1>
              <p className="text-xs md:text-sm text-white/70 max-w-xl leading-relaxed mt-2">
                Here's what's happening across your platform right now — every stat below is live from real production data.
              </p>

              {/* Live status pills */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 border border-white/10 text-[10px] font-semibold text-white/95">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                  All systems operational
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 border border-white/10 text-[10px] font-semibold text-white/95">
                  <Database size={11} className="text-blue-300" /> {fmt(dashKpis?.totalOrganizations)} organizations
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 border border-white/10 text-[10px] font-semibold text-white/95">
                  <Users size={11} className="text-green-500" /> {fmt(dashKpis?.totalActiveUsers)} active users
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 border border-white/10 text-[10px] font-semibold text-white/95">
                  <Award size={11} className="text-amber-500" /> {fmt(dashKpis?.credentialsIssued)} credentials
                </span>
              </div>
            </div>

            {/* Right: mascot illustration */}
            <div className="relative flex items-center justify-center lg:justify-end w-full lg:w-auto min-h-[160px]">
              <div className="absolute top-1/2 left-1/2 lg:right-0 lg:left-auto -translate-x-1/2 lg:translate-x-0 -translate-y-1/2 w-[220px] h-[220px] md:w-[280px] md:h-[280px] bg-gradient-to-tr from-[#7C3AED]/30 to-[#A855F7]/30 rounded-full blur-[60px] pointer-events-none" />
              <motion.div
                className="relative select-none pointer-events-none flex items-center justify-center"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <img
                    src="/admin-sticker.png"
                    alt="Prasynx Admin Ecosystem"
                    className="w-[240px] sm:w-[300px] lg:w-[380px] h-auto object-contain drop-shadow-[0_12px_24px_rgba(109,76,255,0.25)]"
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {dashboardLoading && <LoadingSkeleton rows={4} cols={4} />}
        {!dashboardLoading && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {kpis.map((kpi, i) => {
                const Icon = kpi.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }} className="stat-card">
                    <div className="flex items-start justify-between mb-1">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: kpi.bg, color: kpi.color }}><Icon size={20} /></div>
                      {growthBadge(kpi.trend)}
                    </div>
                    <div className="mt-2">
                      <div className="text-[11px] text-gray-500 font-medium">{kpi.label}</div>
                      <div className="text-2xl font-extrabold text-gray-900 mt-0.5">{kpi.value}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Growth {kpi.trend >= 0 ? '+' : ''}{kpi.trend}% MoM</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* AI insights rail */}
            {aiInsights.length > 0 && (
              <Card className="p-5 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold flex items-center gap-2"><Sparkles size={15} className="text-[#6D4CFF]" /> AI-Generated Insights</h3>
                  <Badge variant="info" className="text-[9px]">Derived from live data</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiInsights.map((insight, i) => (
                    <div key={i} className={`p-4 rounded-xl border-l-4 ${priorityTone[insight.priority]} hover:shadow-md transition-all`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${priorityIconTone[insight.priority]}`}><Lightbulb size={16} /></div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold truncate">{insight.title}</span>
                            <Badge variant={priorityBadge[insight.priority]} className="text-[8px]">{insight.priority}</Badge>
                          </div>
                          <p className="text-[11px] text-gray-600 leading-relaxed">{insight.desc}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[9px] font-medium text-[#6D4CFF]">Impact: {insight.impact}</span>
                            <span className="text-[9px] text-gray-400">Category: {insight.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold">Organization Growth</h3>
                  {growthBadge(dashKpis?.orgGrowth)}
                </div>
                <div className="h-52">
                  {orgGrowthData.loading ? <LoadingSkeleton rows={1} cols={1} /> : (
                    orgGrowthChart.length === 0 ? <EmptyState message="No organization growth data yet" /> : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.orgs} margin={{ top: 6, right: 6, left: 0, bottom: 0 }} barGap={4}>
                          <defs>
                            <linearGradient id="orgBarA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6D4CFF" stopOpacity={0.95} /><stop offset="100%" stopColor="#6D4CFF" stopOpacity={0.55} /></linearGradient>
                            <linearGradient id="orgBarB" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22C55E" stopOpacity={0.95} /><stop offset="100%" stopColor="#22C55E" stopOpacity={0.55} /></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} dy={6} />
                          <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(109,76,255,0.06)' }} />
                          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} iconType="circle" iconSize={8} />
                          <Bar dataKey="total" name="Total" fill="url(#orgBarA)" radius={[6, 6, 0, 0]} maxBarSize={22} animationDuration={800} />
                          <Bar dataKey="verified" name="Verified" fill="url(#orgBarB)" radius={[6, 6, 0, 0]} maxBarSize={22} />
                        </BarChart>
                      </ResponsiveContainer>
                    )
                  )}
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold">Credential Issuance</h3>
                  {growthBadge(dashKpis?.credGrowth)}
                </div>
                <div className="h-52">
                  {credTrendData.loading ? <LoadingSkeleton rows={1} cols={1} /> : (
                    credTrendChart.length === 0 ? <EmptyState message="No credential data yet" /> : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.creds}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="issued" fill="#6D4CFF" radius={[4, 4, 0, 0]} name="Issued" />
                          <Bar dataKey="revoked" fill="#EF4444" radius={[4, 4, 0, 0]} name="Revoked" />
                        </BarChart>
                      </ResponsiveContainer>
                    )
                  )}
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold">User Activity</h3>
                  <Badge variant="info" className="text-[9px]">{fmt(chatTotal)} events</Badge>
                </div>
                <div className="h-52">
                  {userActivityData.loading ? <LoadingSkeleton rows={1} cols={1} /> : (
                    userActivityChart.length === 0 ? <EmptyState message="No activity yet" /> : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.acts} margin={{ top: 6, right: 6, left: 0, bottom: 0 }} barGap={4}>
                          <defs>
                            <linearGradient id="actBarA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6D4CFF" stopOpacity={0.95} /><stop offset="100%" stopColor="#6D4CFF" stopOpacity={0.55} /></linearGradient>
                            <linearGradient id="actBarB" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity={0.95} /><stop offset="100%" stopColor="#F59E0B" stopOpacity={0.55} /></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} dy={6} />
                          <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(109,76,255,0.06)' }} />
                          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} iconType="circle" iconSize={8} />
                          <Bar dataKey="logins" name="Logins" fill="url(#actBarA)" radius={[6, 6, 0, 0]} maxBarSize={18} animationDuration={800} />
                          <Bar dataKey="actions" name="Actions" fill="url(#actBarB)" radius={[6, 6, 0, 0]} maxBarSize={18} />
                        </BarChart>
                      </ResponsiveContainer>
                    )
                  )}
                </div>
              </Card>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="p-5 lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold">Top Organizations</h3>
                  <button onClick={() => setActiveTab('organizations')} className="text-[#6D4CFF] text-[10px] font-semibold hover:underline">View all</button>
                </div>
                <div className="overflow-x-auto">
                  {topOrgsData.loading ? <LoadingSkeleton rows={4} cols={3} /> : (
                    topOrgsArray.length === 0 ? <EmptyState message="No organizations yet" /> : (
                      <table className="data-table w-full">
                        <thead>
                          <tr><th>Organization</th><th>Users</th><th>Credentials</th></tr>
                        </thead>
                        <tbody>
                          {topOrgsArray.slice(0, 5).map((org: any, i: number) => (
                            <tr key={i}>
                              <td className="font-medium">{org.name || org.organisation_name || 'N/A'}</td>
                              <td className="text-gray-600">{(org.users || org.user_count || 0).toLocaleString()}</td>
                              <td className="text-gray-600">{(org.credentials || org.credential_count || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  )}
                </div>
              </Card>

              <Card className="p-5 lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold">Revenue</h3>
                  <Badge variant="success" className="text-[9px]">₹ Monthly · Total {inr(Number(billingOv.totalRevenue) || 0)}</Badge>
                </div>
                <div className="h-52">
                  {billingOverview.loading ? <LoadingSkeleton rows={1} cols={1} /> : (
                    revTrend.length === 0 ? <EmptyState message="No revenue data yet" /> : (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={revTrend} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="revBarGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22C55E" stopOpacity={0.95} /><stop offset="100%" stopColor="#22C55E" stopOpacity={0.55} /></linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
                          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} dy={6} />
                          <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={58} tickFormatter={(v: number) => `₹${Number(v).toLocaleString('en-IN')}`} />
                          <Tooltip content={<ChartTooltip money />} cursor={{ fill: 'rgba(34,197,94,0.06)' }} />
                          <Bar dataKey="revenue" name="Revenue (₹)" fill="url(#revBarGrad)" radius={[6, 6, 0, 0]} maxBarSize={22} animationDuration={800} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    )
                  )}
                </div>
              </Card>

              <Card className="p-5 lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold">Recent Activity</h3>
                  <button onClick={() => setActiveTab('security-center')} className="text-[#6D4CFF] text-[10px] font-semibold hover:underline">View audit</button>
                </div>
                <div className="space-y-3">
                  {recentActivities.length === 0 ? (
                    <EmptyState message="No recent activity" />
                  ) : (
                    recentActivities.slice(0, 5).map((act: any, i: number) => {
                      const Icon = act.icon;
                      return (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${act.color}15`, color: act.color }}><Icon size={14} /></div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-semibold truncate">{act.action}</div>
                            <div className="text-[10px] text-gray-400 truncate">{act.org}</div>
                          </div>
                          <span className="text-[9px] text-gray-400 whitespace-nowrap">{act.time}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 mt-6">
              {[
                { icon: UserPlus, label: 'Add Org', tab: 'add-organization' },
                { icon: BarChart3, label: 'Analytics', tab: 'analytics' },
                { icon: Upload, label: 'Bulk Upload', tab: 'bulk-upload' },
                { icon: Settings, label: 'Settings', tab: 'settings' },
              ].map((a, i) => {
                const Icon = a.icon;
                return (
                  <button key={i} onClick={() => setActiveTab(a.tab)} className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#F3F0FF] hover:bg-[#e9e4ff] text-[#6D4CFF] transition-all text-xs font-semibold">
                    <Icon size={13} /> {a.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  // ===== ORGANIZATIONS =====
  const renderOrganizations = () => {
    const getStatusBadge = (status: string) => {
      const variants: Record<string, { label: string; variant: any }> = { verified: { label: 'Verified', variant: 'success' }, pending: { label: 'Pending', variant: 'warning' }, active: { label: 'Active', variant: 'success' }, suspended: { label: 'Suspended', variant: 'danger' } };
      return <Badge variant={variants[status?.toLowerCase()]?.variant || 'default'} className="text-[9px]">{variants[status?.toLowerCase()]?.label || status || 'Unknown'}</Badge>;
    };
    if (orgListData.loading && orgsArray.length === 0) return <div className="space-y-6"><div className="page-header"><h1>Organizations</h1><p>Manage all organizations, their members, and platform access.</p></div><LoadingSkeleton rows={6} cols={8} /></div>;
    if (orgListData.error && orgsArray.length === 0) return <ErrorState message={orgListData.error} onRetry={orgListData.refetch} />;

    const isSuperAdmin = session?.user?.role === 'owner';

    const exportCSV = () => {
      const rows = filteredOrgs.map((o: any) => ({
        Organization: o.name || 'Unknown',
        Email: o.email || '',
        Status: o.status || 'pending',
        Plan: o.plan || 'starter',
        Billing: o.billing_cycle || 'yearly',
        Price: o.plan_price ? formatCurrency(Number(o.plan_price)) : '',
        Members: o.member_count || 0,
        Students: o.students || 0,
        Staff: o.staff || 0,
        Parents: o.parents || 0,
        Admins: o.admins || 0,
        Credentials: o.credentials || 0,
        Phone: o.phone || '',
        Address: o.address || '',
        Created: o.created_at ? new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
      }));
      if (!rows.length) { toast.error('No data to export'); return; }
      const headers = Object.keys(rows[0]);
      const csv = [headers.join(','), ...rows.map((r: any) => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `organizations-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${rows.length} organizations`);
    };

    const startDelete = (org: any) => {
      setDeleteTarget(org);
      setDeleteStep(1);
      setDeleteConfirmName('');
      setDeletePasscode('');
    };

    const confirmDelete = async () => {
      if (!deleteTarget) return;
      if (deleteStep === 1) {
        if (deleteConfirmName.trim() !== deleteTarget.name) { toast.error('Organization name does not match. Re-type it exactly to continue.'); return; }
        setDeleteStep(2);
        return;
      }
      if (!deletePasscode.trim()) { toast.error('Enter the super admin passcode to continue'); return; }
      setDeleting(true);
      const res = await organisationApi.remove(deleteTarget.id, deletePasscode.trim());
      setDeleting(false);
      if (res.success) {
        toast.success(`"${deleteTarget.name}" has been permanently deleted`);
        setDeleteTarget(null);
        orgListData.refetch();
      } else {
        toast.error(res.error || 'Failed to delete organization');
      }
    };

    const toggleStatus = async (org: any) => {
      const next = (org.status || '').toLowerCase() === 'verified' || (org.status || '').toLowerCase() === 'active' ? 'pending' : 'verified';
      const res = await organisationApi.verify(org.id, next);
      if (res.success) {
        toast.success(`${org.name} marked as ${next}`);
        orgListData.refetch();
      } else {
        toast.error(res.error || 'Failed to update organization status');
      }
    };

    return (
      <div>
        <div className="page-header flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6D4CFF]/10 flex items-center justify-center text-[#6D4CFF]"><Building2 size={20} /></div>
            <div>
              <h1>Organizations</h1>
              <p>Manage all organizations connected to the platform — members, plans, and platform access.</p>
            </div>
          </div>
          <button onClick={() => setActiveTab('add-organization')} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.97] transition-all"><Plus size={14} /> Add Organization</button>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
              <Search size={14} className="text-gray-400" />
              <input type="text" value={orgSearch} onChange={e => { setOrgSearch(e.target.value); setOrgPage(1); }} placeholder="Search by name, email or org ID..." className="bg-transparent border-none outline-none text-xs flex-1" />
            </div>
            <select value={orgFilter} onChange={e => { setOrgFilter(e.target.value); setOrgPage(1); }} className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium outline-none focus:border-[#6D4CFF]">
              <option value="all">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
            <button onClick={() => { setOrgSearch(''); setOrgFilter('all'); setOrgPage(1); }} className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all">Clear</button>
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 active:scale-[0.97] transition-all"><Download size={14} /> Export CSV</button>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr>
                <th>Org ID</th>
                <th>Organization</th>
                <th>Members</th>
                <th>Plan</th>
                <th>Admins</th>
                <th>Credentials</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr></thead>
              <tbody>
                {paginatedOrgs.map((org: any) => (
                  <tr key={org.id} className="hover:bg-gray-50/60">
                    <td><span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#6D4CFF]/10 text-[#6D4CFF]">{org.org_id || org.id?.slice?.(0, 8) || '—'}</span></td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#6D4CFF] font-bold text-xs">{(org.name || '').split(' ').map((w: string) => w[0]).join('').slice(0, 2)}</div>
                        <div>
                          <div className="text-xs font-semibold">{org.name || 'N/A'}</div>
                          <div className="text-[10px] text-gray-400">{org.email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs font-semibold text-gray-800">{(org.member_count || 0).toLocaleString()}</div>
                      <div className="text-[9px] text-gray-400">{(org.students || 0).toLocaleString()} students · {(org.staff || 0).toLocaleString()} staff · {(org.parents || 0).toLocaleString()} parents</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-6 h-6 rounded-lg bg-gradient-to-br ${PLAN_MAP[org.plan]?.gradient || 'from-gray-400 to-gray-500'} flex items-center justify-center text-white`}>{org.plan === 'enterprise' ? <Sparkles size={11} /> : <Building size={11} />}</span>
                        <div>
                          <div className="text-xs font-semibold capitalize">{org.plan || 'starter'}</div>
                          <div className="text-[9px] text-gray-400 capitalize">{org.billing_cycle || 'yearly'}{org.plan_price ? ` · ${formatCurrency(Number(org.plan_price))}` : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs font-medium">{(org.admins || 0).toLocaleString()}</td>
                    <td className="text-xs font-medium">{(org.credentials || 0).toLocaleString()}</td>
                    <td>{getStatusBadge(org.status)}</td>
                    <td className="text-xs text-gray-500">{org.created_at ? new Date(org.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setOrgDetail(org)} title="View details" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF] transition-all"><Eye size={14} /></button>
                        <button onClick={() => toggleStatus(org)} title="Verify / unverify" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#22C55E] transition-all"><ShieldCheck size={14} /></button>
                        {isSuperAdmin && (
                          <button onClick={() => startDelete(org)} title="Delete organization (super admin)" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-[#EF4444] transition-all"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrgs.length === 0 && (
            <EmptyState message={orgListData.loading ? 'Loading organizations...' : 'No organizations found matching your filters.'} action={!orgListData.loading ? { label: 'Clear Filters', onClick: () => { setOrgSearch(''); setOrgFilter('all'); } } : undefined} />
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

        {/* Org detail modal */}
        <AnimatePresence>
          {orgDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setOrgDetail(null)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#3A2A6B] to-[#6D4CFF] text-white">
                  <h3 className="text-sm font-bold flex items-center gap-2"><Building2 size={15} /> Organization Details</h3>
                  <button onClick={() => setOrgDetail(null)} className="p-1 rounded-lg hover:bg-white/15"><X size={15} /></button>
                </div>
                <div className="p-5 space-y-3 text-xs">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-[#F3F0FF] flex items-center justify-center text-[#6D4CFF] font-bold text-sm">{(orgDetail.name || '').split(' ').map((w: string) => w[0]).join('').slice(0, 2)}</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{orgDetail.name}</div>
                      <div className="text-[10px] text-gray-400">{orgDetail.email || ''}</div>
                    </div>
                  </div>
                  {[
                    { label: 'Status', value: orgDetail.status },
                    { label: 'Plan', value: `${orgDetail.plan || 'starter'} · ${orgDetail.billing_cycle || 'yearly'}${orgDetail.plan_price ? ` · ${formatCurrency(Number(orgDetail.plan_price))}` : ''}` },
                    { label: 'Capacity', value: orgDetail.student_capacity ? `${Number(orgDetail.student_capacity) >= 100000 ? 'Unlimited' : Number(orgDetail.student_capacity).toLocaleString()} students` : '—' },
                    { label: 'Modules', value: Array.isArray(orgDetail.modules) ? orgDetail.modules.map((m: string) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ') : '—' },
                    { label: 'Members', value: String((orgDetail.member_count || 0).toLocaleString()) },
                    { label: 'Students', value: String((orgDetail.students || 0).toLocaleString()) },
                    { label: 'Staff', value: String((orgDetail.staff || 0).toLocaleString()) },
                    { label: 'Parents', value: String((orgDetail.parents || 0).toLocaleString()) },
                    { label: 'Admins', value: String((orgDetail.admins || 0).toLocaleString()) },
                    { label: 'Credentials Issued', value: String((orgDetail.credentials || 0).toLocaleString()) },
                    { label: 'Phone', value: orgDetail.phone || '—' },
                    { label: 'Address', value: orgDetail.address || '—' },
                    { label: 'Created', value: orgDetail.created_at ? new Date(orgDetail.created_at).toLocaleString() : '—' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-start justify-between gap-4 border-b border-gray-50 pb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 shrink-0">{r.label}</span>
                      <span className="text-xs text-gray-700 text-right break-words capitalize">{r.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete confirmation modal (dual + passcode, super admin only) */}
        <AnimatePresence>
          {deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-rose-600 to-red-500 text-white">
                  <h3 className="text-sm font-bold flex items-center gap-2"><AlertTriangle size={16} /> Delete Organization</h3>
                  <button onClick={() => !deleting && setDeleteTarget(null)} className="p-1 rounded-lg hover:bg-white/15"><X size={15} /></button>
                </div>
                <div className="p-5">
                  {deleteStep === 1 ? (
                    <>
                      <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-100 text-[11px] text-red-600 flex gap-2">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <span>This action <b>permanently deletes</b> <span className="font-bold">{deleteTarget.name}</span>, all its members, credentials and logs. It cannot be undone.</span>
                      </div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1.5">Type the organization name to confirm</label>
                      <input
                        type="text"
                        value={deleteConfirmName}
                        onChange={e => setDeleteConfirmName(e.target.value)}
                        placeholder={deleteTarget.name}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-red-500 focus:ring-3 focus:ring-red-500/10 transition-all"
                      />
                      <button
                        onClick={confirmDelete}
                        disabled={deleteConfirmName.trim() !== deleteTarget.name}
                        className="w-full mt-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        Continue to Passcode
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
                        <Lock size={18} className="text-amber-500 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-gray-800">Super Admin Passcode Required</div>
                          <div className="text-[10px] text-gray-500">Deleting "{deleteTarget.name}" requires the super admin passcode.</div>
                        </div>
                      </div>
                      <input
                        type="password"
                        value={deletePasscode}
                        onChange={e => setDeletePasscode(e.target.value)}
                        placeholder="Enter super admin passcode"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-amber-500 focus:ring-3 focus:ring-amber-500/10 transition-all"
                        onKeyDown={e => { if (e.key === 'Enter') confirmDelete(); }}
                      />
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => setDeleteStep(1)} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-all disabled:opacity-50">Back</button>
                        <button
                          onClick={confirmDelete}
                          disabled={deleting}
                          className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          {deleting ? <RefreshCw size={14} className="inline animate-spin" /> : <Trash2 size={14} className="inline" />} {deleting ? 'Deleting...' : 'Delete Forever'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ===== ADD ORGANIZATION =====
  const renderAddOrganization = () => {
    const selectedPlan = PLAN_MAP[orgForm.plan] || PLAN_MAP.professional;
    const isEnterprise = orgForm.plan === 'enterprise';
    const planPrice = isEnterprise ? null : (orgForm.billing_cycle === 'monthly' ? selectedPlan.monthly : selectedPlan.yearly);
    const allModules = [
      { key: 'management', label: 'Management Portal', desc: 'Admin, operations & reporting', icon: ShieldCheck },
      { key: 'staff', label: 'Staff Portal', desc: 'Teachers, attendance & payroll', icon: Users },
      { key: 'student', label: 'Student Portal', desc: 'Students, grades & timetable', icon: BookOpen },
      { key: 'parent', label: 'Parent Portal', desc: 'Parents, fees & communication', icon: User },
    ];

    const toggleModule = (key: string) => {
      setOrgForm(prev => ({
        ...prev,
        modules: prev.modules.includes(key) ? prev.modules.filter(m => m !== key) : [...prev.modules, key],
      }));
    };

    const selectPlan = (key: string) => {
      const defaults: Record<string, { student_capacity: number; max_admins: number }> = {
        starter: { student_capacity: 500, max_admins: 2 },
        growth: { student_capacity: 1500, max_admins: 5 },
        professional: { student_capacity: 5000, max_admins: 10 },
        premium: { student_capacity: 15000, max_admins: 25 },
        enterprise: { student_capacity: 100000, max_admins: 100 },
      };
      setOrgForm(prev => ({ ...prev, plan: key, ...defaults[key] }));
    };

    const handleCreateOrg = async () => {
      if (!orgForm.name.trim()) { toast.error('Organization name is required'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgForm.email)) { toast.error('Please enter a valid primary email'); return; }
      if (!orgForm.modules.length) { toast.error('Select at least one portal module'); return; }
      setOrgSubmitting(true);
      try {
        const res = await organisationApi.create({
          ...orgForm,
          plan_price: isEnterprise ? 0 : planPrice,
          currency: 'INR',
          subscription_start: new Date().toISOString(),
          modules: orgForm.modules,
        });
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
      } finally {
        setOrgSubmitting(false);
      }
    };

    const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#6D4CFF] focus:ring-3 focus:ring-[rgba(109,76,255,0.1)] transition-all";
    const labelCls = "text-xs font-semibold text-gray-700 block mb-1.5";

    return (
      <div>
        <div className="page-header flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#6D4CFF]/10 flex items-center justify-center text-[#6D4CFF]"><Building2 size={20} /></div>
          <div>
            <h1>Add Organization</h1>
            <p>Onboard institutions quickly — details, plan, capacity, and access in one flow.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ===== LEFT: FORM ===== */}
          <div className="xl:col-span-2 space-y-6">
            {/* 1. Organization Details */}
            <Card className="p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF] flex items-center justify-center text-xs font-bold">1</div>
                <h3 className="text-sm font-bold">Organization Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Organization Name *</label>
                  <input type="text" value={orgForm.name} onChange={e => setOrgForm({ ...orgForm, name: e.target.value })} placeholder="e.g., Greenfield International School" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Primary Email *</label>
                  <input type="email" value={orgForm.email} onChange={e => setOrgForm({ ...orgForm, email: e.target.value })} placeholder="contact@school.edu" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Contact Person</label>
                  <input type="text" value={orgForm.contact_person} onChange={e => setOrgForm({ ...orgForm, contact_person: e.target.value })} placeholder="Principal / Director name" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Secondary Email</label>
                  <input type="email" value={orgForm.secondary_email} onChange={e => setOrgForm({ ...orgForm, secondary_email: e.target.value })} placeholder="billing@school.edu" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input type="tel" value={orgForm.phone} onChange={e => setOrgForm({ ...orgForm, phone: e.target.value })} placeholder="+1 555 123 4567" className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Website</label>
                  <input type="url" value={orgForm.website} onChange={e => setOrgForm({ ...orgForm, website: e.target.value })} placeholder="https://school.edu" className={inputCls} />
                </div>
              </div>
            </Card>

            {/* 2. Location */}
            <Card className="p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF] flex items-center justify-center text-xs font-bold">2</div>
                <h3 className="text-sm font-bold">Location</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <label className={labelCls}>Address</label>
                  <input type="text" value={orgForm.address} onChange={e => setOrgForm({ ...orgForm, address: e.target.value })} placeholder="123 School Lane" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <input type="text" value={orgForm.city} onChange={e => setOrgForm({ ...orgForm, city: e.target.value })} placeholder="Bengaluru" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <input type="text" value={orgForm.country} onChange={e => setOrgForm({ ...orgForm, country: e.target.value })} placeholder="India" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Timezone Hint</label>
                  <div className="px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-400">Auto-detected</div>
                </div>
              </div>
            </Card>

            {/* 3. Plan & Billing */}
            <Card className="p-6">
              <div className="flex items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF] flex items-center justify-center text-xs font-bold">3</div>
                  <h3 className="text-sm font-bold">Plan & Billing</h3>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100">
                  {(['monthly', 'yearly'] as const).map(cycle => (
                    <button key={cycle} onClick={() => setOrgForm(prev => ({ ...prev, billing_cycle: cycle }))} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all capitalize ${orgForm.billing_cycle === cycle ? 'bg-white shadow text-[#6D4CFF]' : 'text-gray-500 hover:text-gray-700'}`}>
                      {cycle}
                      {cycle === 'yearly' && <span className="ml-1 text-[9px] font-bold text-green-600">-17%</span>}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mb-4">Billed {orgForm.billing_cycle}. Save roughly 17% with annual billing.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PLAN_CATALOG.map(p => {
                  const active = orgForm.plan === p.key;
                  const price = p.key === 'enterprise' ? 'Custom' : (orgForm.billing_cycle === 'monthly' ? formatCurrency(p.monthly) : formatCurrency(p.yearly));
                  const perUnit = p.key === 'enterprise' ? '' : orgForm.billing_cycle === 'monthly' ? '/month' : '/year';
                  return (
                    <button key={p.key} onClick={() => selectPlan(p.key)} className={`relative text-left p-4 rounded-2xl border-2 transition-all group ${active ? 'border-[#6D4CFF] bg-[#6D4CFF]/5 shadow-[0_6px_18px_rgba(109,76,255,0.15)]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                      {p.popular && <span className="absolute -top-2 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white">POPULAR</span>}
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center text-white mb-3`}>
                        {p.key === 'enterprise' ? <Sparkles size={16} /> : <Building size={16} />}
                      </div>
                      <div className="text-sm font-bold capitalize">{p.label}</div>
                      <div className="text-[10px] text-gray-400 mb-2">{p.tagline}</div>
                      <div className="text-xl font-extrabold">{price}<span className="text-[10px] font-medium text-gray-400">{perUnit}</span></div>
                      <ul className="mt-3 space-y-1.5">
                        {p.features.slice(0, 3).map(f => (
                          <li key={f} className="flex items-center gap-1.5 text-[10px] text-gray-600"><Check size={11} className="text-green-500 shrink-0" />{f}</li>
                        ))}
                        <li className="text-[10px] text-gray-400">+{p.features.length - 3} more</li>
                      </ul>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* 4. Capacity & Access */}
            <Card className="p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF] flex items-center justify-center text-xs font-bold">4</div>
                <h3 className="text-sm font-bold">Capacity & Access</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelCls}>Student Capacity</label>
                    <span className="text-xs font-bold text-[#6D4CFF]">{orgForm.student_capacity >= 100000 ? 'Unlimited' : orgForm.student_capacity.toLocaleString()}</span>
                  </div>
                  <input type="range" min={100} max={100000} step={100} value={Math.min(orgForm.student_capacity, 100000)} onChange={e => setOrgForm(prev => ({ ...prev, student_capacity: Number(e.target.value) }))} className="w-full accent-[#6D4CFF]" />
                  <div className="flex justify-between text-[9px] text-gray-400 mt-1"><span>100</span><span>1K</span><span>10K</span><span>100K+</span></div>
                </div>
                <div>
                  <label className={labelCls}>Admin Accounts</label>
                  <input type="number" min={1} max={500} value={orgForm.max_admins} onChange={e => setOrgForm(prev => ({ ...prev, max_admins: Math.max(1, Number(e.target.value) || 1) }))} className={inputCls} />
                </div>
              </div>
              <div className="mt-6">
                <label className={labelCls}>Enabled Portal Modules</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allModules.map(m => {
                    const ModIcon = m.icon;
                    const on = orgForm.modules.includes(m.key);
                    return (
                      <button key={m.key} onClick={() => toggleModule(m.key)} className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${on ? 'border-[#6D4CFF] bg-[#6D4CFF]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${on ? 'bg-[#6D4CFF] text-white' : 'bg-gray-100 text-gray-400'}`}><ModIcon size={15} /></div>
                        <div className="flex-1">
                          <div className="text-xs font-bold">{m.label}</div>
                          <div className="text-[10px] text-gray-400">{m.desc}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${on ? 'bg-[#6D4CFF] border-[#6D4CFF]' : 'border-gray-300'}`}>{on && <Check size={12} className="text-white" />}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* 5. Notes */}
            <Card className="p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-7 h-7 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF] flex items-center justify-center text-xs font-bold">5</div>
                <h3 className="text-sm font-bold">Internal Notes</h3>
              </div>
              <textarea value={orgForm.notes} onChange={e => setOrgForm({ ...orgForm, notes: e.target.value })} placeholder="Onboarding notes, renewal reminders, special instructions..." rows={3} className={`${inputCls} resize-none`} />
            </Card>
          </div>

          {/* ===== RIGHT: SUMMARY ===== */}
          <div className="space-y-6">
            <div className="xl:sticky xl:top-6 space-y-6">
              <Card className="p-6 overflow-hidden relative">
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${selectedPlan.gradient}`} />
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold">Subscription Summary</h3>
                  <Sparkles size={16} className="text-[#6D4CFF]" />
                </div>
                <div className={`mt-3 p-4 rounded-2xl bg-gradient-to-br ${selectedPlan.gradient} text-white`}>
                  <div className="text-[10px] font-semibold uppercase tracking-wide opacity-80">Selected Plan</div>
                  <div className="text-lg font-extrabold capitalize">{selectedPlan.label}</div>
                  <div className="text-2xl font-extrabold mt-1">{isEnterprise ? 'Custom' : `${formatCurrency(planPrice || 0)}`}<span className="text-xs font-medium opacity-80">{isEnterprise ? ' pricing' : orgForm.billing_cycle === 'monthly' ? '/month' : '/year'}</span></div>
                </div>
                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between"><span className="text-gray-500">Billing cycle</span><span className="font-semibold capitalize">{orgForm.billing_cycle}</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-500">Student capacity</span><span className="font-semibold">{orgForm.student_capacity >= 100000 ? 'Unlimited' : orgForm.student_capacity.toLocaleString()}</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-500">Admin accounts</span><span className="font-semibold">{orgForm.max_admins}</span></div>
                  <div className="flex items-center justify-between"><span className="text-gray-500">Modules</span><span className="font-semibold">{orgForm.modules.length} enabled</span></div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2.5"><span className="text-gray-500">Status</span><span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold">Verified on create</span></div>
                </div>
                <button onClick={handleCreateOrg} disabled={orgSubmitting} className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-sm font-semibold shadow-[0_4px_14px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_20px_rgba(109,76,255,0.4)] hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none">
                  {orgSubmitting ? 'Creating organization...' : `Create ${selectedPlan.label} Organization`}
                </button>
              </Card>

              {showOrgCredentials && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="p-6 border-l-4 border-l-green-500">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600"><CheckCircle2 size={18} /></div>
                      <div><h3 className="text-sm font-bold">Management Portal Credentials</h3><p className="text-[10px] text-gray-400">Save these — shown only once.</p></div>
                    </div>
                    <div className="space-y-3">
                      <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Portal URL</label><div className="api-key-display mt-1">{orgCredentials.portal} <button onClick={() => copyToClipboard(orgCredentials.portal)} className="ml-auto text-[#6D4CFF] hover:text-[#5A3EF0]"><Copy size={12} /></button></div></div>
                      <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Email</label><div className="api-key-display mt-1">{orgCredentials.email} <button onClick={() => copyToClipboard(orgCredentials.email)} className="ml-auto text-[#6D4CFF] hover:text-[#5A3EF0]"><Copy size={12} /></button></div></div>
                      <div><label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Password</label><div className="api-key-display mt-1">{orgCredentials.password} <button onClick={() => copyToClipboard(orgCredentials.password)} className="ml-auto text-[#6D4CFF] hover:text-[#5A3EF0]"><Copy size={12} /></button></div></div>
                    </div>
                  </Card>
                </motion.div>
              )}

              <Card className="p-6">
                <h3 className="text-sm font-bold mb-3">What happens next?</h3>
                <div className="space-y-2.5">
                  {[
                    'Organization admin receives login credentials',
                    'Admin can access the management portal',
                    'Create student, staff, and parent accounts',
                    'Configure modules based on the selected plan',
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
    const revenueDataLocal = revTrend;
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
            <h3 className="text-sm font-bold mb-4">Revenue Trend</h3>
            <div className="h-64">
              {billingOverview.loading ? <LoadingSkeleton rows={1} cols={1} /> : (
                revTrend.length === 0 ? <EmptyState message="No revenue data yet" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueDataLocal}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${Number(v).toLocaleString('en-IN')}`} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue (₹)']} />
                      <Bar dataKey="revenue" fill="#6D4CFF" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                )
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
          <div className="flex w-full flex-col items-center gap-1.5">
            <img
              src="/logo.png"
              alt="Prasynx"
              className="h-20 w-auto object-contain drop-shadow-[0_2px_10px_rgba(109,76,255,0.25)]"
            />
            <span className="inline-flex items-center rounded-full bg-[#F3F0FF] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#6D4CFF]">
              <ShieldCheck size={10} /> Admin Portal
            </span>
          </div>
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
              <span className="text-[11px] font-semibold">Admin v1.0.1</span>
            </div>
            <div className="text-[10px] text-gray-400">Last updated: Aug 2026</div>
          </div>
          <button className="sidebar-footer-item !text-[#EF4444]" onClick={logout}>
            <LogOut size={14} /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content !ml-0 lg:!ml-[280px]">
        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <button className="header-mobile-btn" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button>
          </div>
          <div className="header-right">
            <div className="header-divider" />
            <ThemeToggle />
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
