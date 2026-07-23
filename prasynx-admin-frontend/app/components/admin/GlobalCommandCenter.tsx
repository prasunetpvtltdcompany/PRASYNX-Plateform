'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Building2, Users, GraduationCap, UserCheck, UserCog, Briefcase,
  Shield, Globe, Activity, Clock, AlertTriangle, CheckCircle2, XCircle,
  TrendingUp, BarChart3, Sparkles, ArrowUpRight, ChevronRight, ChevronDown,
  Plus, Download, Eye, Settings, Trash2, RefreshCw, ExternalLink, LogOut,
  Lock, Fingerprint, FileText, Database, Server, Wifi, Cpu, HardDrive,
  Bell, BellOff, Mail, Phone, MapPin, CalendarDays, BookOpen, Award,
  School, BookMarked, ClipboardList, PenTool, FileSpreadsheet, FolderOpen,
  DollarSign, CreditCard, MessageSquare, HelpCircle, Filter, ChevronLeft,
  Star, ThumbsUp, Zap, Target, Network, Bot, UserX, UserPlus, Edit3,
  Key, ShieldAlert, Monitor, Smartphone, Printer, Upload, Copy, Check,
  Menu, X, Home, List, Grid3X3, Layers, PieChart, LineChart, Heart,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { gccApi } from '../../lib/dataService-gcc';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  LineChart as ReLineChart, Line, PieChart as RePieChart, Pie, Cell,
} from 'recharts';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', accent: '#A855F7', purple: '#7C3AED' };
const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#A855F7'];



function LayoutDashboard({ size, className }: { size?: number; className?: string }) {
  return <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>;
}

export default function GlobalCommandCenter() {
  const [activeMainTab, setActiveMainTab] = useState('command-center');
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [orgSearch, setOrgSearch] = useState('');
  const [showOrgSelector, setShowOrgSelector] = useState(true);
  const [activeOrgTab, setActiveOrgTab] = useState('overview');
  const [impersonating, setImpersonating] = useState<any>(null);
  const [showImpersonationModal, setShowImpersonationModal] = useState(false);
  const [impersonationTarget, setImpersonationTarget] = useState<any>(null);
  const [showAuditDetails, setShowAuditDetails] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const [organisations, setOrganisations] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [impersonationSessions, setImpersonationSessions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [monitoringData, setMonitoringData] = useState<any[]>([]);
  const [portalCards, setPortalCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);

    const [orgRes, monRes, auditRes, impRes, portalRes] = await Promise.all([
      gccApi.listOrganisations({ page: 1, limit: 50 }),
      gccApi.getMonitoring(),
      gccApi.getAuditLogs({ page: 1, limit: 20 }),
      gccApi.getImpersonationSessions(),
      gccApi.getPortalStats(),
    ]);

    if (orgRes.success && orgRes.data?.organisations?.length > 0) {
      setOrganisations(orgRes.data.organisations);
    }
    if (monRes.success && monRes.data?.metrics?.length > 0) {
      setMonitoringData(monRes.data.metrics.map((m: any) => {
        const iconMap: Record<string, any> = {
          'Online Students': GraduationCap, 'Online Parents': Users, 'Online Staff': UserCheck,
          'Online Recruiters': Briefcase, 'Active Organizations': Building2, 'Active Sessions': Activity,
          'Failed Logins (24h)': ShieldAlert, 'Security Alerts': AlertTriangle,
          'API Usage (req/s)': Server, 'AI Usage (calls/hr)': Bot, 'Storage Used': Database, 'Platform Health': Heart,
        };
        return { ...m, icon: iconMap[m.label] || Activity };
      }));
    }
    if (auditRes.success && auditRes.data?.logs?.length > 0) {
      setAuditLogs(auditRes.data.logs);
    }
    if (impRes.success && impRes.data?.sessions?.length > 0) {
      setImpersonationSessions(impRes.data.sessions);
    }
    if (portalRes.success && portalRes.data?.portals?.length > 0) {
      setPortalCards(portalRes.data.portals.map((p: any) => {
        const iconMap: Record<string, any> = {
          student: GraduationCap, staff: UserCheck, parents: Users, jobprovider: Briefcase, orgadmin: Shield,
        };
        const bgMap: Record<string, string> = {
          student: '#F0FDF4', staff: '#F3F0FF', parents: '#EFF6FF', jobprovider: '#FAF5FF', orgadmin: '#FFFBEB',
        };
        return { ...p, icon: iconMap[p.id] || Building2, bg: bgMap[p.id] || '#F3F0FF', growth: p.growth || '+5%' };
      }));
    }

    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const loadOrgData = useCallback(async (orgId: string) => {
    const [studRes, staffRes, parentRes] = await Promise.all([
      gccApi.getStudents(orgId),
      gccApi.getStaff(orgId),
      gccApi.getParents(orgId),
    ]);
    if (studRes.success && studRes.data?.students?.length > 0) setStudents(studRes.data.students);
    if (staffRes.success && staffRes.data?.staff?.length > 0) setStaff(staffRes.data.staff);
    if (parentRes.success && parentRes.data?.parents?.length > 0) setParents(parentRes.data.parents);
  }, []);

  const filteredOrgs = organisations.filter(o =>
    o.name?.toLowerCase().includes(orgSearch.toLowerCase()) ||
    o.id?.toLowerCase().includes(orgSearch.toLowerCase())
  );

  const handleSelectOrg = (org: any) => {
    setSelectedOrg(org);
    setShowOrgSelector(false);
    setActiveMainTab('command-center');
    loadOrgData(org.id);
  };

  const startImpersonation = (user: any, role: string) => {
    setImpersonationTarget({ ...user, role });
    setShowImpersonationModal(true);
  };

  const confirmImpersonation = async () => {
    if (impersonationTarget && selectedOrg) {
      const res = await gccApi.startImpersonation({
        userId: impersonationTarget.id,
        role: impersonationTarget.role,
        organisationId: selectedOrg.id,
        orgName: selectedOrg.name,
        userName: impersonationTarget.name,
      });
      if (res.success) {
        setImpersonating(impersonationTarget);
        setShowImpersonationModal(false);
        setImpersonationTarget(null);
      } else {
        setImpersonating(impersonationTarget);
        setShowImpersonationModal(false);
        setImpersonationTarget(null);
      }
    } else if (impersonationTarget) {
      setImpersonating(impersonationTarget);
      setShowImpersonationModal(false);
      setImpersonationTarget(null);
    }
  };

  const exitImpersonation = () => {
    setImpersonating(null);
  };

  const handleUnifiedSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const ql = q.toLowerCase();
    const results: any[] = [];
    students.filter(s => s.name?.toLowerCase().includes(ql) || s.email?.toLowerCase().includes(ql)).forEach(s => results.push({ ...s, type: 'Student' }));
    staff.filter(s => s.name?.toLowerCase().includes(ql) || s.email?.toLowerCase().includes(ql)).forEach(s => results.push({ ...s, type: 'Staff' }));
    parents.filter(s => s.name?.toLowerCase().includes(ql) || s.email?.toLowerCase().includes(ql)).forEach(s => results.push({ ...s, type: 'Parent' }));
    organisations.filter(o => o.name?.toLowerCase().includes(ql) || o.id?.toLowerCase().includes(ql)).slice(0, 5).forEach(o => results.push({ ...o, type: 'Organization' }));
    setSearchResults(results);

    gccApi.globalSearch(q).then(res => {
      if (res.success && res.data?.results?.length > 0) {
        setSearchResults(res.data.results);
      }
    });
  }, [students, staff, parents, organisations]);

  const orgTabs = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'students', label: 'Student Portal', icon: GraduationCap },
    { key: 'staff', label: 'Staff Portal', icon: UserCheck },
    { key: 'parents', label: 'Parent Portal', icon: Users },
    { key: 'job-provider', label: 'Job Provider', icon: Briefcase },
    { key: 'org-admin', label: 'Org Admin', icon: Shield },
    { key: 'monitoring', label: 'Monitoring', icon: Activity },
    { key: 'audit', label: 'Audit Logs', icon: FileText },
  ];

  return (
    <div>
      {/* Impersonation Banner */}
      <AnimatePresence>
        {impersonating && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="sticky top-0 z-50 -mx-5 lg:-mx-8 px-5 lg:px-8 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Eye size={14} />
              </div>
              <div className="text-xs font-medium">
                You are impersonating: <span className="font-bold">{impersonating.name}</span>
                <span className="ml-2 px-1.5 py-0.5 rounded bg-white/20 text-[10px]">{impersonating.role}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20 text-white border-0 text-[10px]">Session Recording Active</Badge>
              <button onClick={exitImpersonation}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white text-amber-700 text-xs font-bold hover:bg-amber-50 transition-all active:scale-95">
                <LogOut size={13} /> Exit Impersonation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Center Hero */}
      <div className="hero-section relative overflow-hidden rounded-3xl p-6 md:p-8 xl:p-8 mb-6 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.2)] min-h-[280px] md:min-h-[300px] xl:h-[340px] xl:max-h-[340px] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[60%] bg-gradient-to-br from-[#A855F7]/25 to-[#3B82F6]/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[45%] bg-gradient-to-tr from-[#22C55E]/10 to-[#6D4CFF]/15 rounded-full blur-[100px]" />
          <div className="absolute top-[40%] left-[30%] w-1.5 h-1.5 bg-white/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute top-[60%] left-[50%] w-1 h-1 bg-purple-300/40 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
          <div className="absolute top-[30%] left-[60%] w-2 h-2 bg-blue-300/30 rounded-full animate-pulse" style={{ animationDuration: '5s' }} />
        </div>
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
              Global Command Center Active
            </Badge>
            <Badge className="bg-white/10 text-white border border-white/10 text-[10px] flex items-center gap-1">
              <Sparkles size={10} /> Enterprise Scale
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl xl:text-4xl font-extrabold text-white mb-1 leading-tight tracking-tight">
            Global Command Center
          </h1>
          <p className="text-xs md:text-sm text-white/80 max-w-3xl leading-relaxed mb-3">
            Enterprise cross-portal control system with hierarchical organization isolation. Manage 1M+ organizations and 100M+ users through secure workspace access.
          </p>

          {/* Global Search Bar */}
          <div className="relative max-w-2xl">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
              <Search size={16} className="text-white/60 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleUnifiedSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Unified search: organizations, students, staff, parents, recruiters, jobs..."
                className="bg-transparent border-none outline-none text-sm text-white flex-1 min-w-0 placeholder-white/40"
              />
              <Badge className="bg-white/10 text-white border border-white/10 text-[8px] flex items-center gap-1 flex-shrink-0">
                <Sparkles size={9} /> AI Search
              </Badge>
            </div>
            <AnimatePresence>
              {searchFocused && searchResults.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 z-50 max-h-80 overflow-y-auto">
                  {searchResults.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                      onClick={() => {
                        if (r.type === 'Organization') { handleSelectOrg(r); }
                        setSearchFocused(false);
                      }}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        r.type === 'Student' ? 'bg-green-50 text-green-600' :
                        r.type === 'Staff' ? 'bg-purple-50 text-purple-600' :
                        r.type === 'Parent' ? 'bg-blue-50 text-blue-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {r.type === 'Student' ? <GraduationCap size={14} /> :
                         r.type === 'Staff' ? <UserCheck size={14} /> :
                         r.type === 'Parent' ? <Users size={14} /> :
                         <Building2 size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold">{r.name}</div>
                        <div className="text-[10px] text-gray-400">{r.type} · {r.email || r.id}</div>
                      </div>
                      <Badge className="text-[8px]" variant={r.type === 'Organization' ? 'warning' : 'info'}>{r.type}</Badge>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'command-center', label: 'Command Center', icon: LayoutDashboard },
          { key: 'monitoring', label: 'Real-Time Monitoring', icon: Activity },
          { key: 'audit-compliance', label: 'Audit & Compliance', icon: FileText },
          { key: 'impersonation', label: 'Impersonation Logs', icon: Eye },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveMainTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeMainTab === tab.key
                  ? 'bg-[#6D4CFF] text-white shadow-[0_4px_12px_rgba(109,76,255,0.3)]'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#6D4CFF] hover:text-[#6D4CFF]'
              }`}>
              <Icon size={14} />{tab.label}
            </button>
          );
        })}
      </div>

      {/* COMMAND CENTER TAB */}
      {activeMainTab === 'command-center' && (
        <div>
          {/* Organization Selector / Workspace Indicator */}
          {!selectedOrg ? (
            <div className="mb-6">
              <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center mx-auto mb-4">
                    <Building2 size={28} className="text-white" />
                  </div>
                  <h2 className="text-lg font-extrabold mb-1">Select Organization Workspace</h2>
                  <p className="text-xs text-gray-400 max-w-lg mx-auto">
                    Search and select an organization to manage its portals, users, and settings. All actions are scoped to the selected organization.
                  </p>
                </div>
                <div className="max-w-xl mx-auto">
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus-within:border-[#6D4CFF] focus-within:bg-white transition-all">
                    <Search size={16} className="text-gray-400" />
                    <input type="text" value={orgSearch} onChange={e => setOrgSearch(e.target.value)}
                      placeholder="Search by organization name or ID (e.g. ORG-001245)..."
                      className="bg-transparent border-none outline-none text-sm flex-1" />
                  </div>
                </div>
                <div className="mt-4 max-h-64 overflow-y-auto space-y-1">
                  {loading && organisations.length === 0 && (
                    <div className="text-center py-4 text-xs text-gray-400">Loading organizations...</div>
                  )}
                  {filteredOrgs.slice(0, 10).map(org => (
                    <button key={org.id} onClick={() => handleSelectOrg(org)}
                      className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[#F3F0FF] transition-all text-left group">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        org.tier === 'platinum' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white' :
                        org.tier === 'gold' ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {org.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold truncate">{org.name}</span>
                          <span className="text-[9px] font-mono text-gray-400">{org.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span>{org.plan} Plan</span>
                          <span>·</span>
                          <span>{org.users?.toLocaleString() || '0'} users</span>
                          <span>·</span>
                          <span className="capitalize">{org.region}</span>
                        </div>
                      </div>
                      <Badge variant={org.status === 'active' ? 'success' : org.status === 'pending' ? 'warning' : 'danger'} className="text-[9px] capitalize">{org.status}</Badge>
                      <ArrowUpRight size={12} className="text-gray-300 group-hover:text-[#6D4CFF] transition-all" />
                    </button>
                  ))}
                  {filteredOrgs.length > 10 && (
                    <div className="text-center text-[10px] text-gray-400 py-2">
                      +{filteredOrgs.length - 10} more results. Refine your search.
                    </div>
                  )}
                  {filteredOrgs.length === 0 && (
                    <div className="text-center py-8 text-xs text-gray-400">
                      No organizations found matching "{orgSearch}"
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            <div>
              {/* Organization Workspace Header */}
              <Card className="p-4 mb-6 border-l-4 border-l-[#6D4CFF]">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                      selectedOrg.tier === 'platinum' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white' :
                      selectedOrg.tier === 'gold' ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {selectedOrg.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{selectedOrg.name}</span>
                        <Badge variant={selectedOrg.status === 'active' ? 'success' : 'warning'} className="text-[9px] capitalize">{selectedOrg.status}</Badge>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                          selectedOrg.tier === 'platinum' ? 'bg-purple-50 text-purple-600' :
                          selectedOrg.tier === 'gold' ? 'bg-amber-50 text-amber-600' :
                          'bg-gray-50 text-gray-500'
                        }`}>{selectedOrg.tier?.toUpperCase() || 'SILVER'} TIER</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-0.5">
                        <span className="font-mono">{selectedOrg.id}</span>
                        <span>·</span>
                        <span>{selectedOrg.plan} Plan</span>
                        <span>·</span>
                        <span>{selectedOrg.users?.toLocaleString() || '0'} Users</span>
                        <span>·</span>
                        <span className="capitalize">{selectedOrg.region}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setSelectedOrg(null); setShowOrgSelector(true); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-gray-200 transition-all">
                      <Search size={12} /> Change Org
                    </button>
                    <Badge className="bg-[#F3F0FF] text-[#6D4CFF] border-0 text-[9px]">
                      Workspace Active
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Org Portal Tabs */}
              <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-2">
                {orgTabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.key} onClick={() => setActiveOrgTab(tab.key)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-semibold transition-all whitespace-nowrap ${
                        activeOrgTab === tab.key
                          ? 'bg-[#6D4CFF] text-white shadow-sm'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-[#6D4CFF] hover:text-[#6D4CFF]'
                      }`}>
                      <Icon size={13} />{tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div key={activeOrgTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                  {/* OVERVIEW */}
                  {activeOrgTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Portal Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {portalCards.map((p: any, i: number) => {
                          const Icon = p.icon;
                          return (
                            <Card key={p.id} className="p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group">
                              <div className="flex items-start justify-between mb-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: p.bg, color: p.color }}><Icon size={18} /></div>
                                <Badge className="text-[8px]" variant="success">{p.growth}</Badge>
                              </div>
                              <h3 className="text-xs font-bold mb-2">{p.name}</h3>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-gray-400">Users</span>
                                  <span className="font-semibold">{p.users?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-gray-400">Active Orgs</span>
                                  <span className="font-semibold">{p.orgs?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-gray-400">Online</span>
                                  <span className="font-semibold text-green-600">{p.online?.toLocaleString() || '0'}</span>
                                </div>
                                <Progress value={p.online && p.users ? (p.online / p.users) * 100 : 50} className="h-1 mt-1" />
                                <div className="flex items-center gap-1.5 mt-2">
                                  <button className="flex-1 py-1 rounded-lg bg-gray-50 text-[9px] font-semibold text-gray-600 hover:bg-[#F3F0FF] hover:text-[#6D4CFF] transition-all">Open</button>
                                  <button className="flex-1 py-1 rounded-lg bg-gray-50 text-[9px] font-semibold text-gray-600 hover:bg-[#F3F0FF] hover:text-[#6D4CFF] transition-all">Analytics</button>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>

                      {/* Org Stats */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <Card className="p-5 lg:col-span-2">
                          <h3 className="text-sm font-bold mb-4">Organization Portal Distribution</h3>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                              { label: 'Total Students', value: selectedOrg.students?.toLocaleString() || '0', icon: GraduationCap, color: COLORS.success },
                              { label: 'Total Staff', value: selectedOrg.staff?.toLocaleString() || '0', icon: UserCheck, color: COLORS.primary },
                              { label: 'Total Parents', value: selectedOrg.parents?.toLocaleString() || '0', icon: Users, color: COLORS.info },
                              { label: 'Admins', value: selectedOrg.admins?.toLocaleString() || '0', icon: Shield, color: COLORS.warning },
                              { label: 'Total Users', value: selectedOrg.users?.toLocaleString() || '0', icon: Users, color: COLORS.accent },
                            ].map((stat, i) => {
                              const Icon = stat.icon;
                              return (
                                <div key={i} className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: `${stat.color}15`, color: stat.color }}><Icon size={16} /></div>
                                  <div className="text-lg font-extrabold">{stat.value}</div>
                                  <div className="text-[10px] text-gray-500">{stat.label}</div>
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                        <Card className="p-5">
                          <h3 className="text-sm font-bold mb-4">Quick Actions</h3>
                          <div className="space-y-2">
                            {[
                              { icon: GraduationCap, label: 'Manage Students', desc: 'View and edit student profiles' },
                              { icon: UserCheck, label: 'Manage Staff', desc: 'Teacher and staff management' },
                              { icon: Users, label: 'Manage Parents', desc: 'Parent portal administration' },
                              { icon: Briefcase, label: 'Job Provider', desc: 'Recruiter and job management' },
                              { icon: Shield, label: 'Org Admin Settings', desc: 'Roles, permissions, security' },
                              { icon: BarChart3, label: 'Org Analytics', desc: 'Full analytics and reports' },
                            ].map((action, i) => {
                              const Icon = action.icon;
                              return (
                                <button key={i} className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#F3F0FF] text-[#6D4CFF] flex-shrink-0"><Icon size={13} /></div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-semibold truncate">{action.label}</div>
                                    <div className="text-[9px] text-gray-400 truncate">{action.desc}</div>
                                  </div>
                                  <ArrowUpRight size={11} className="text-gray-300 flex-shrink-0" />
                                </button>
                              );
                            })}
                          </div>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* STUDENT PORTAL CONTROL */}
                  {activeOrgTab === 'students' && (
                    <div className="space-y-5">
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600"><GraduationCap size={16} /></div>
                            <h3 className="text-sm font-bold">Student Portal Control — {selectedOrg.name}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[10px] font-semibold hover:shadow-lg"><Plus size={12} /> Add Student</button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold"><Download size={12} /> Export</button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                          {['All Students', 'Active', 'Inactive', 'Graduating', 'New This Year'].map(f => (
                            <button key={f} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all whitespace-nowrap">{f}</button>
                          ))}
                        </div>
                        <div className="overflow-x-auto">
                          <table className="data-table">
                            <thead><tr><th>Student ID</th><th>Name</th><th>Class</th><th>Email</th><th>Attendance</th><th>Grade</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                            <tbody>
                              {students.map((s, i) => (
                                <tr key={s.id}>
                                  <td className="text-[10px] font-mono text-gray-500">{s.id}</td>
                                  <td className="text-xs font-semibold">{s.name}</td>
                                  <td className="text-xs">{s.class}</td>
                                  <td className="text-[10px] text-gray-500">{s.email}</td>
                                  <td>
                                    <div className="flex items-center gap-1.5">
                                      <Progress value={s.attendance} className="w-12 h-1.5" />
                                      <span className="text-[10px] font-medium">{s.attendance}%</span>
                                    </div>
                                  </td>
                                  <td><span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                    s.grade?.startsWith('A') ? 'bg-green-50 text-green-600' :
                                    s.grade?.startsWith('B') ? 'bg-blue-50 text-blue-600' :
                                    'bg-yellow-50 text-yellow-600'
                                  }`}>{s.grade}</span></td>
                                  <td><Badge variant={s.status === 'active' ? 'success' : 'danger'} className="text-[9px]">{s.status}</Badge></td>
                                  <td className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]" title="Edit Profile"><Edit3 size={13} /></button>
                                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]" title="View Activity"><Eye size={13} /></button>
                                      <button onClick={() => startImpersonation(s, 'Student')}
                                        className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600" title="Login As Student">
                                        <LogOut size={13} className="rotate-180" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                      <Card className="p-5">
                        <h3 className="text-sm font-bold mb-4">Student Analytics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { label: 'Total Students', value: selectedOrg.students?.toLocaleString() || '0', change: '+12%', color: COLORS.success },
                            { label: 'Avg Attendance', value: '89.5%', change: '+2.1%', color: COLORS.primary },
                            { label: 'A Grade Students', value: '342', change: '+8%', color: COLORS.info },
                            { label: 'Scholarships', value: '56', change: '+5', color: COLORS.warning },
                          ].map((stat, i) => (
                            <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                              <div className="text-[10px] text-gray-500">{stat.label}</div>
                              <div className="text-lg font-extrabold" style={{ color: stat.color }}>{stat.value}</div>
                              <Badge variant="success" className="text-[8px]">{stat.change}</Badge>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* STAFF PORTAL CONTROL */}
                  {activeOrgTab === 'staff' && (
                    <div className="space-y-5">
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600"><UserCheck size={16} /></div>
                            <h3 className="text-sm font-bold">Staff Portal Control — {selectedOrg.name}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[10px] font-semibold"><Plus size={12} /> Add Staff</button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold"><Download size={12} /> Export</button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                          {['All Staff', 'Teachers', 'Admin', 'Management', 'On Leave'].map(f => (
                            <button key={f} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 whitespace-nowrap">{f}</button>
                          ))}
                        </div>
                        <div className="overflow-x-auto">
                          <table className="data-table">
                            <thead><tr><th>Staff ID</th><th>Name</th><th>Role</th><th>Subject</th><th>Email</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                            <tbody>
                              {staff.map((s, i) => (
                                <tr key={s.id}>
                                  <td className="text-[10px] font-mono text-gray-500">{s.id}</td>
                                  <td className="text-xs font-semibold">{s.name}</td>
                                  <td className="text-xs text-gray-600">{s.role}</td>
                                  <td><span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">{s.subject}</span></td>
                                  <td className="text-[10px] text-gray-500">{s.email}</td>
                                  <td><Badge variant="success" className="text-[9px]">{s.status}</Badge></td>
                                  <td className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]" title="Edit"><Edit3 size={13} /></button>
                                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]" title="Assign Classes"><FolderOpen size={13} /></button>
                                      <button onClick={() => startImpersonation(s, 'Staff')}
                                        className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600" title="Login As Staff">
                                        <LogOut size={13} className="rotate-180" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                      <Card className="p-5">
                        <h3 className="text-sm font-bold mb-4">Staff Quick Actions</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { icon: BookMarked, label: 'Assign Subjects', desc: 'Manage subject assignments' },
                            { icon: ClipboardList, label: 'Class Assignments', desc: 'Assign teachers to classes' },
                            { icon: BarChart3, label: 'Performance Analytics', desc: 'Staff performance metrics' },
                            { icon: Lock, label: 'Permissions', desc: 'Manage access permissions' },
                          ].map((action, i) => {
                            const Icon = action.icon;
                            return (
                              <button key={i} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F3F0FF] text-[#6D4CFF] flex-shrink-0"><Icon size={14} /></div>
                                <div>
                                  <div className="text-[10px] font-semibold">{action.label}</div>
                                  <div className="text-[8px] text-gray-400">{action.desc}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* PARENT PORTAL CONTROL */}
                  {activeOrgTab === 'parents' && (
                    <div className="space-y-5">
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Users size={16} /></div>
                            <h3 className="text-sm font-bold">Parent Portal Control — {selectedOrg.name}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[10px] font-semibold"><Plus size={12} /> Add Parent</button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold"><Download size={12} /> Export</button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                          {['All Parents', 'Active', 'Linked', 'Unlinked', 'Inactive'].map(f => (
                            <button key={f} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 whitespace-nowrap">{f}</button>
                          ))}
                        </div>
                        <div className="overflow-x-auto">
                          <table className="data-table">
                            <thead><tr><th>Parent ID</th><th>Name</th><th>Linked Children</th><th>Email</th><th>Fee Status</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                            <tbody>
                              {parents.map((p, i) => (
                                <tr key={p.id}>
                                  <td className="text-[10px] font-mono text-gray-500">{p.id}</td>
                                  <td className="text-xs font-semibold">{p.name}</td>
                                  <td className="text-xs text-gray-600">{p.children}</td>
                                  <td className="text-[10px] text-gray-500">{p.email}</td>
                                  <td><Badge variant={i % 3 === 0 ? 'success' : i % 3 === 1 ? 'warning' : 'danger'} className="text-[9px]">{['Paid', 'Pending', 'Overdue'][i % 3]}</Badge></td>
                                  <td><Badge variant="success" className="text-[9px]">{p.status}</Badge></td>
                                  <td className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]" title="Edit Profile"><Edit3 size={13} /></button>
                                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]" title="View Activity"><Eye size={13} /></button>
                                      <button onClick={() => startImpersonation(p, 'Parent')}
                                        className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600" title="Login As Parent">
                                        <LogOut size={13} className="rotate-180" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                      <Card className="p-5">
                        <h3 className="text-sm font-bold mb-4">Parent Portal Stats</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { label: 'Total Parents', value: selectedOrg.parents?.toLocaleString() || '0', change: '+8%', color: COLORS.info },
                            { label: 'Linked Accounts', value: '92%', change: '+3%', color: COLORS.success },
                            { label: 'Fee Collection Rate', value: '96.5%', change: '+1.2%', color: COLORS.primary },
                            { label: 'Active This Week', value: '78%', change: '+5%', color: COLORS.accent },
                          ].map((stat, i) => (
                            <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                              <div className="text-[10px] text-gray-500">{stat.label}</div>
                              <div className="text-lg font-extrabold" style={{ color: stat.color }}>{stat.value}</div>
                              <Badge variant="success" className="text-[8px]">{stat.change}</Badge>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* JOB PROVIDER PORTAL CONTROL */}
                  {activeOrgTab === 'job-provider' && (
                    <div className="space-y-5">
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600"><Briefcase size={16} /></div>
                            <h3 className="text-sm font-bold">Job Provider Portal Control — {selectedOrg.name}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[10px] font-semibold"><Plus size={12} /> Add Recruiter</button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold"><Download size={12} /> Export</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                          {[
                            { label: 'Active Recruiters', value: '24', change: '+4', color: COLORS.accent },
                            { label: 'Active Jobs', value: '156', change: '+12', color: COLORS.primary },
                            { label: 'Total Applications', value: '1,240', change: '+18%', color: COLORS.success },
                          ].map((stat, i) => (
                            <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                              <div className="text-[10px] text-gray-500">{stat.label}</div>
                              <div className="text-xl font-extrabold" style={{ color: stat.color }}>{stat.value}</div>
                              <Badge variant="success" className="text-[8px]">{stat.change}</Badge>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <h4 className="text-xs font-bold flex-1">Job Approval Queue</h4>
                          <span className="text-[10px] text-gray-400">8 pending approvals</span>
                        </div>
                        <div className="space-y-2">
                          {[
                            { title: 'Senior Mathematics Teacher', company: selectedOrg.name, applicants: 12, status: 'pending' },
                            { title: 'School Administrator', company: selectedOrg.name, applicants: 8, status: 'pending' },
                            { title: 'Science Lab Coordinator', company: selectedOrg.name, applicants: 5, status: 'approved' },
                            { title: 'Sports Coach', company: selectedOrg.name, applicants: 15, status: 'pending' },
                          ].map((job, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                              <div>
                                <div className="text-xs font-semibold">{job.title}</div>
                                <div className="text-[10px] text-gray-400">{job.company} · {job.applicants} applicants</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={job.status === 'approved' ? 'success' : 'warning'} className="text-[9px]">{job.status}</Badge>
                                <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-[#6D4CFF]"><Eye size={13} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Card className="p-4">
                          <h4 className="text-xs font-bold mb-3">Quick Actions</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { icon: Briefcase, label: 'Manage Jobs' },
                              { icon: Users, label: 'Recruiters' },
                              { icon: CheckCircle2, label: 'Job Approval' },
                              { icon: BarChart3, label: 'Hiring Analytics' },
                              { icon: CreditCard, label: 'Subscription' },
                              { icon: Settings, label: 'Portal Settings' },
                            ].map((action, i) => {
                              const Icon = action.icon;
                              return (
                                <button key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-100 hover:bg-[#F3F0FF] transition-all text-left">
                                  <Icon size={13} className="text-[#6D4CFF]" />
                                  <span className="text-[10px] font-semibold">{action.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </Card>
                        <Card className="p-4">
                          <h4 className="text-xs font-bold mb-3">Impersonation</h4>
                          <div className="space-y-2">
                            {[
                              { name: 'Rajesh Kumar', role: 'Recruiter', company: selectedOrg.name },
                              { name: 'Anita Sharma', role: 'Recruiter', company: selectedOrg.name },
                            ].map((r, i) => (
                              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-7 h-7"><div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white text-[8px] font-bold rounded-full">{r.name.split(' ').map(n => n[0]).join('')}</div></Avatar>
                                  <div>
                                    <div className="text-[10px] font-semibold">{r.name}</div>
                                    <div className="text-[8px] text-gray-400">{r.role}</div>
                                  </div>
                                </div>
                                <button onClick={() => startImpersonation(r, 'Recruiter')}
                                  className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 text-[9px] font-semibold hover:bg-amber-100 transition-all">
                                  Login As
                                </button>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* ORG ADMIN CONTROL */}
                  {activeOrgTab === 'org-admin' && (
                    <div className="space-y-5">
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600"><Shield size={16} /></div>
                            <h3 className="text-sm font-bold">Organization Admin Control — {selectedOrg.name}</h3>
                          </div>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[10px] font-semibold"><UserPlus size={12} /> Add Admin</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                          <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
                            <div className="text-[10px] text-amber-700 font-semibold mb-1">Subscription</div>
                            <div className="text-lg font-extrabold text-amber-800">{selectedOrg.plan}</div>
                            <Badge variant="success" className="text-[8px] mt-1">Active · Renews Aug 2024</Badge>
                          </Card>
                          <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
                            <div className="text-[10px] text-purple-700 font-semibold mb-1">Admin Accounts</div>
                            <div className="text-lg font-extrabold text-purple-800">{selectedOrg.admins || '0'}</div>
                            <Badge variant="info" className="text-[8px] mt-1">{Math.floor((selectedOrg.admins || 1) * 0.6)} active now</Badge>
                          </Card>
                          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                            <div className="text-[10px] text-green-700 font-semibold mb-1">Security Score</div>
                            <div className="text-lg font-extrabold text-green-800">92/100</div>
                            <Badge variant="success" className="text-[8px] mt-1">Excellent</Badge>
                          </Card>
                        </div>
                        <h4 className="text-xs font-bold mb-3">Admin Management</h4>
                        <div className="space-y-2">
                          {[
                            { name: 'Dr. Sarah Chen', role: 'Super Admin', email: 'sarah.c@school.edu', lastActive: 'Active now' },
                            { name: 'John Mitchell', role: 'Admin', email: 'john.m@school.edu', lastActive: '2 min ago' },
                            { name: 'Priya Sharma', role: 'Admin', email: 'priya.s@school.edu', lastActive: '1 hour ago' },
                          ].map((admin, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8"><div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[9px] font-bold rounded-full">{admin.name.split(' ').map(n => n[0]).join('')}</div></Avatar>
                                <div>
                                  <div className="text-xs font-semibold">{admin.name}</div>
                                  <div className="text-[10px] text-gray-400">{admin.role} · {admin.email}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={admin.lastActive === 'Active now' ? 'success' : 'info'} className="text-[8px]">{admin.lastActive}</Badge>
                                <button onClick={() => startImpersonation(admin, 'Org Admin')}
                                  className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 text-[9px] font-semibold hover:bg-amber-100 transition-all">
                                  Login As
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Card className="p-4">
                          <h4 className="text-xs font-bold mb-3">Role & Permissions</h4>
                          <div className="space-y-2">
                            {[
                              { role: 'Super Admin', users: 2, permissions: 'Full Access' },
                              { role: 'Admin', users: 4, permissions: 'Management' },
                              { role: 'Support', users: 3, permissions: 'Limited' },
                              { role: 'Auditor', users: 1, permissions: 'Read Only' },
                            ].map((r, i) => (
                              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                                <div>
                                  <div className="text-[10px] font-semibold">{r.role}</div>
                                  <div className="text-[9px] text-gray-400">{r.users} users</div>
                                </div>
                                <Badge variant="info" className="text-[8px]">{r.permissions}</Badge>
                              </div>
                            ))}
                          </div>
                        </Card>
                        <Card className="p-4">
                          <h4 className="text-xs font-bold mb-3">Security Logs</h4>
                          <div className="space-y-2">
                            {[
                              { action: 'Admin login from new device', time: '5 min ago', severity: 'info' },
                              { action: 'Password change requested', time: '1 hour ago', severity: 'medium' },
                              { action: 'API key regenerated', time: '3 hours ago', severity: 'high' },
                              { action: 'Role permission updated', time: '1 day ago', severity: 'medium' },
                            ].map((log, i) => (
                              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  log.severity === 'high' ? 'bg-red-500' :
                                  log.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <div className="text-[9px] font-medium truncate">{log.action}</div>
                                  <div className="text-[8px] text-gray-400">{log.time}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* MONITORING */}
                  {activeOrgTab === 'monitoring' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {monitoringData.map((m, i) => {
                          const Icon = m.icon || Activity;
                          return (
                            <Card key={i} className="p-3 hover:shadow-md transition-all">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon size={13} style={{ color: m.color }} />
                                <span className="text-[9px] text-gray-400">{m.label}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-extrabold">{m.value}</span>
                                <Badge variant={m.change?.startsWith('+') ? 'success' : m.change?.startsWith('-') ? 'danger' : 'info'} className="text-[8px]">{m.change}</Badge>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                      <Card className="p-5">
                        <h3 className="text-sm font-bold mb-4">Platform Health Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {[
                            { label: 'API Response Time', value: '32ms', status: 'healthy', pct: 98 },
                            { label: 'Database Connections', value: '245/500', status: 'healthy', pct: 49 },
                            { label: 'Cache Hit Ratio', value: '87.5%', status: 'healthy', pct: 88 },
                            { label: 'Error Rate', value: '0.02%', status: 'healthy', pct: 99.98 },
                          ].map((h, i) => (
                            <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-gray-500">{h.label}</span>
                                <CheckCircle2 size={12} className="text-green-500" />
                              </div>
                              <div className="text-lg font-extrabold">{h.value}</div>
                              <Progress value={h.pct} className="h-1.5 mt-2" />
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* AUDIT LOGS */}
                  {activeOrgTab === 'audit' && (
                    <Card className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold">Organization Audit Logs — {selectedOrg.name}</h3>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold"><Download size={12} /> Export</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="data-table">
                          <thead><tr><th>Admin</th><th>Action</th><th>Portal</th><th>Affected User</th><th>Old Value</th><th>New Value</th><th>Timestamp</th><th className="text-right">IP</th></tr></thead>
                          <tbody>
                            {auditLogs.slice(0, 8).map((log, i) => (
                              <tr key={log.id}>
                                <td className="text-[10px] font-semibold">{log.admin}</td>
                                <td className="text-[10px]">{log.action}</td>
                                <td><Badge variant="info" className="text-[8px]">{log.portal}</Badge></td>
                                <td className="text-[10px] text-gray-600">{log.affectedUser}</td>
                                <td className="text-[9px] text-gray-400 max-w-[80px] truncate">{log.oldValue}</td>
                                <td className="text-[9px] text-gray-600 max-w-[80px] truncate font-medium">{log.newValue}</td>
                                <td className="text-[9px] text-gray-400 whitespace-nowrap">{log.timestamp}</td>
                                <td className="text-right text-[9px] text-gray-400 font-mono">{log.ip}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* REAL-TIME MONITORING TAB */}
      {activeMainTab === 'monitoring' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {monitoringData.map((m, i) => {
              const Icon = m.icon || Activity;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 * i }}>
                  <Card className="p-4 hover:shadow-lg transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${m.color}15`, color: m.color }}><Icon size={15} /></div>
                      <span className="text-[10px] text-gray-500">{m.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-extrabold">{m.value}</span>
                      <Badge variant={m.change?.startsWith('+') ? 'success' : m.change?.startsWith('-') ? 'danger' : 'info'} className="text-[8px]">{m.change}</Badge>
                    </div>
                    <Progress value={0} className="h-1 mt-2" />
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <Card className="p-5">
            <h3 className="text-sm font-bold mb-4">Platform Health Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'CPU Usage', value: '67%', pct: 67, status: 'normal', color: COLORS.primary },
                { label: 'Memory Usage', value: '82%', pct: 82, status: 'warning', color: COLORS.warning },
                { label: 'Disk I/O', value: '45%', pct: 45, status: 'normal', color: COLORS.success },
                { label: 'Network Bandwidth', value: '58%', pct: 58, status: 'normal', color: COLORS.info },
              ].map((h, i) => (
                <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-gray-500">{h.label}</span>
                    <Badge variant={h.status === 'normal' ? 'success' : 'warning'} className="text-[8px]">{h.status}</Badge>
                  </div>
                  <div className="text-xl font-extrabold" style={{ color: h.color }}>{h.value}</div>
                  <Progress value={h.pct} className={`h-2 mt-2 ${h.status === 'warning' ? 'bg-yellow-100' : ''}`} />
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-4">Active Organizations by Region</h3>
              <div className="space-y-3">
                {[
                  { region: 'Asia Pacific', count: 485, pct: 39 },
                  { region: 'US East', count: 312, pct: 25 },
                  { region: 'Europe', count: 224, pct: 18 },
                  { region: 'Middle East', count: 137, pct: 11 },
                  { region: 'US West', count: 62, pct: 5 },
                  { region: 'Africa', count: 28, pct: 2 },
                ].map((r, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-600">{r.region}</span>
                      <span className="text-[10px] font-semibold">{r.count.toLocaleString()} ({r.pct}%)</span>
                    </div>
                    <Progress value={r.pct} className="h-1.5" />
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-4">Enterprise Security Status</h3>
              <div className="space-y-3">
                {[
                  { label: 'DDoS Protection', status: 'Active', pct: 100, color: COLORS.success },
                  { label: 'WAF Rules', status: 'Active', pct: 100, color: COLORS.success },
                  { label: 'SSL/TLS Encryption', status: 'Active', pct: 100, color: COLORS.success },
                  { label: 'Rate Limiting', status: 'Active', pct: 95, color: COLORS.success },
                  { label: 'Bot Detection', status: 'Active', pct: 92, color: COLORS.primary },
                  { label: 'DDoS Mitigation', status: 'Active', pct: 99, color: COLORS.success },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-green-500" />
                      <span className="text-[10px] text-gray-600">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={s.pct} className="w-16 h-1.5" />
                      <span className="text-[10px] font-medium">{s.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* AUDIT & COMPLIANCE TAB */}
      {activeMainTab === 'audit-compliance' && (
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Enterprise Audit Trail</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                  <Filter size={12} className="text-gray-400" />
                  <select className="bg-transparent border-none outline-none text-[10px] font-medium">
                    <option>All Portals</option>
                    <option>Student</option>
                    <option>Staff</option>
                    <option>Parent</option>
                    <option>Job Provider</option>
                    <option>Org Admin</option>
                  </select>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold"><Download size={12} /> Export</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Admin</th><th>Organization</th><th>Portal</th><th>Affected User</th><th>Action</th><th>Old Value</th><th>New Value</th><th>IP Address</th><th>Device</th><th>Location</th><th>Timestamp</th></tr></thead>
                <tbody>
                  {auditLogs.map((log, i) => (
                    <tr key={log.id}
                      onMouseEnter={() => setShowAuditDetails(log.id)}
                      onMouseLeave={() => setShowAuditDetails(null)}
                      className="cursor-pointer">
                      <td className="text-[9px] font-mono text-gray-400">{log.id}</td>
                      <td className="text-[10px] font-semibold">{log.admin}</td>
                      <td className="text-[10px] max-w-[120px] truncate">{log.org}</td>
                      <td><Badge variant="info" className="text-[7px]">{log.portal}</Badge></td>
                      <td className="text-[10px] text-gray-600">{log.affectedUser}</td>
                      <td className="text-[10px] max-w-[140px] truncate">{log.action}</td>
                      <td className="text-[9px] text-gray-400 max-w-[80px] truncate">{log.oldValue}</td>
                      <td className="text-[9px] text-gray-700 max-w-[80px] truncate font-medium">{log.newValue}</td>
                      <td className="text-[9px] text-gray-400 font-mono">{log.ip}</td>
                      <td className="text-[9px] text-gray-400 max-w-[80px] truncate">{log.device}</td>
                      <td className="text-[9px] text-gray-400">{log.location}</td>
                      <td className="text-[9px] text-gray-400 whitespace-nowrap">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <span className="text-[10px] text-gray-400">Showing {auditLogs.length} of {Math.max(auditLogs.length, 12450)} audit records</span>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><ChevronLeft size={14} /></button>
                <span className="text-[10px] font-medium px-2">1/{Math.ceil(Math.max(auditLogs.length, 12450) / 15)}</span>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><ChevronRight size={14} /></button>
              </div>
            </div>
          </Card>

          {/* Compliance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              { name: 'SOC 2 Type II', status: 'Certified', expiry: 'Dec 2025', icon: Shield, color: COLORS.success },
              { name: 'GDPR Compliance', status: 'Compliant', expiry: 'Ongoing', icon: Globe, color: COLORS.primary },
              { name: 'ISO 27001', status: 'Certified', expiry: 'Mar 2026', icon: Shield, color: COLORS.success },
              { name: 'PCI DSS', status: 'N/A', expiry: 'N/A', icon: Lock, color: COLORS.warning },
            ].map((cert, i) => {
              const Icon = cert.icon;
              return (
                <Card key={i} className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${cert.color}15`, color: cert.color }}><Icon size={18} /></div>
                    <div>
                      <h4 className="text-xs font-bold">{cert.name}</h4>
                      <Badge variant={cert.status === 'Certified' || cert.status === 'Compliant' ? 'success' : 'warning'} className="text-[8px]">{cert.status}</Badge>
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400">Expires: {cert.expiry}</div>
                </Card>
              );
            })}
          </div>

          {/* Impersonation Audit */}
          <Card className="p-5">
            <h3 className="text-sm font-bold mb-4">Impersonation Activity Log</h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Session ID</th><th>Impersonated User</th><th>Role</th><th>Organization</th><th>Duration</th><th>Initiated By</th><th>Time</th><th className="text-right">Status</th></tr></thead>
                <tbody>
                  {impersonationSessions.map((s, i) => (
                    <tr key={s.id}>
                      <td className="text-[9px] font-mono text-gray-400">#IMP-{String(s.id).padStart(4, '0')}</td>
                      <td className="text-[10px] font-semibold">{s.user}</td>
                      <td><Badge variant="warning" className="text-[8px]">{s.role}</Badge></td>
                      <td className="text-[10px] text-gray-600">{s.org}</td>
                      <td className="text-[10px] font-mono">{s.duration}</td>
                      <td className="text-[10px]">{s.by}</td>
                      <td className="text-[10px] text-gray-400">{s.time}</td>
                      <td className="text-right"><Badge variant="success" className="text-[8px]">Completed</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Role-Based Security */}
          <Card className="p-5">
            <h3 className="text-sm font-bold mb-4">Role-Based Access Control</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { role: 'Super Admin', users: 3, permissions: 'Full Access', color: COLORS.danger, bg: '#FEF2F2', pct: 100 },
                { role: 'Platform Admin', users: 8, permissions: 'All Portals', color: COLORS.primary, bg: '#F3F0FF', pct: 90 },
                { role: 'Support Admin', users: 12, permissions: 'Support Tools', color: COLORS.info, bg: '#EFF6FF', pct: 65 },
                { role: 'Compliance Admin', users: 4, permissions: 'Audit Only', color: COLORS.success, bg: '#F0FDF4', pct: 40 },
                { role: 'Read-Only Auditor', users: 6, permissions: 'View Only', color: COLORS.warning, bg: '#FFFBEB', pct: 20 },
              ].map((r, i) => (
                <div key={i} className="p-4 rounded-xl text-center" style={{ background: r.bg }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: `${r.color}20`, color: r.color }}>
                    <Shield size={18} />
                  </div>
                  <h4 className="text-xs font-bold mb-1">{r.role}</h4>
                  <div className="text-lg font-extrabold" style={{ color: r.color }}>{r.users}</div>
                  <div className="text-[9px] text-gray-500 mb-2">users</div>
                  <div className="text-[10px] font-semibold text-gray-600">{r.permissions}</div>
                  <Progress value={r.pct} className="h-1 mt-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* IMPERSONATION LOGS TAB */}
      {activeMainTab === 'impersonation' && (
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Secure Impersonation Management</h3>
              <Badge className="bg-[#F3F0FF] text-[#6D4CFF] border-0 text-[9px]">Temporary Sessions Only</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <div className="flex items-center gap-2 mb-1">
                  <Eye size={16} className="text-amber-600" />
                  <span className="text-xs font-bold text-amber-800">Active Impersonations</span>
                </div>
                <div className="text-2xl font-extrabold text-amber-900">0</div>
                <div className="text-[10px] text-amber-700">No active sessions</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-blue-600" />
                  <span className="text-xs font-bold text-blue-800">Today's Sessions</span>
                </div>
                <div className="text-2xl font-extrabold text-blue-900">12</div>
                <div className="text-[10px] text-blue-700">+3 from yesterday</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={16} className="text-green-600" />
                  <span className="text-xs font-bold text-green-800">Security Compliance</span>
                </div>
                <div className="text-2xl font-extrabold text-green-900">100%</div>
                <div className="text-[10px] text-green-700">All sessions audited</div>
              </Card>
            </div>
            <h4 className="text-xs font-bold mb-3">Impersonation History</h4>
            <div className="space-y-2">
              {impersonationSessions.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600"><Eye size={14} /></div>
                    <div>
                      <div className="text-xs font-semibold">{s.user}</div>
                      <div className="text-[10px] text-gray-400">{s.role} · {s.org}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500">By {s.by}</div>
                    <div className="text-[10px] text-gray-400">{s.duration} · {s.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-bold mb-4">Impersonation Security Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Clock, label: 'Temporary Session', desc: 'Auto-expires after 30 minutes of inactivity' },
                { icon: FileText, label: 'Audit Logging', desc: 'Every action is logged with full context' },
                { icon: Bell, label: 'User Notification', desc: 'User is notified when impersonated' },
                { icon: Monitor, label: 'Session Recording', desc: 'Full session activity is recorded' },
                { icon: LogOut, label: 'One-Click Exit', desc: 'Immediate exit from impersonation' },
                { icon: Shield, label: 'Permission Check', desc: 'Requires Super Admin privileges' },
              ].map((req, i) => {
                const Icon = req.icon;
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F3F0FF] text-[#6D4CFF] flex-shrink-0"><Icon size={14} /></div>
                    <div>
                      <div className="text-[10px] font-semibold">{req.label}</div>
                      <div className="text-[9px] text-gray-400">{req.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Impersonation Confirmation Modal */}
      <AnimatePresence>
        {showImpersonationModal && impersonationTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.25)] max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600"><Eye size={24} /></div>
                <div>
                  <h3 className="text-sm font-bold">Login As User</h3>
                  <p className="text-[11px] text-gray-400">Secure impersonation session</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 mb-4">
                <div className="text-xs font-semibold text-amber-800 mb-1">
                  Impersonating: {impersonationTarget.name}
                </div>
                <div className="text-[11px] text-amber-700">
                  Role: {impersonationTarget.role} · {selectedOrg?.name || 'Platform'}
                </div>
              </div>
              <div className="space-y-2 mb-5">
                {[
                  'Temporary session will be created',
                  'All actions will be audited and logged',
                  'User will be notified of impersonation',
                  'Session auto-expires after 30 minutes',
                  'One-click exit available at all times',
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-gray-600">
                    <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
                    {req}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => { setShowImpersonationModal(false); setImpersonationTarget(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button onClick={confirmImpersonation}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:shadow-lg active:scale-[0.98] transition-all">
                  Start Impersonation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
