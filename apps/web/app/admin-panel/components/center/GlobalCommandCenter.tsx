'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertTriangle, ArrowUpRight, BarChart3, Bell, Bot, Briefcase, Building2,
  CheckCircle2, Clock, Database, Download, Eye, FileText, GraduationCap, Heart,
  Lock, LogOut, RefreshCw, Search, Server, Shield, ShieldAlert, Sparkles, Users,
  UserCheck, X,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { gccApi } from '../../lib/dataService-gcc';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', accent: '#A855F7', purple: '#7C3AED' };

function LayoutDashboard({ size, className }: { size?: number; className?: string }) {
  return <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>;
}

const shortId = (id?: string) => (id ? `#${id.replace(/-/g, '').slice(0, 8).toUpperCase()}` : '—');
const orgDisplayId = (org: any) => org?.org_id || (org?.id ? `org${org.id.replace(/-/g, '').slice(0, 4).toLowerCase()}` : 'org????');
const fmtNum = (n?: any) => Number(n || 0).toLocaleString();
const fmtLastActive = (d?: string) => {
  if (!d) return 'Never logged in';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Active now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};
const fmtAgo = (d?: string) => {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
};
const severityColor = (s?: string) => {
  switch ((s || 'info').toLowerCase()) {
    case 'critical': return 'bg-red-100 text-red-700 border-red-200';
    case 'error': return 'bg-rose-50 text-rose-600 border-rose-200';
    case 'warning': return 'bg-amber-50 text-amber-600 border-amber-200';
    default: return 'bg-sky-50 text-sky-600 border-sky-200';
  }
};
const severityDot = (s?: string) => {
  switch ((s || 'info').toLowerCase()) {
    case 'critical': return 'bg-red-500';
    case 'error': return 'bg-rose-500';
    case 'warning': return 'bg-amber-400';
    default: return 'bg-sky-400';
  }
};
const fmtDate = (d?: string) => {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const exportCSV = (rows: any[], filename: string) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

function EmptyState({ icon, title, desc }: { icon?: any; title: string; desc: string }) {
  const Icon = icon || Building2;
  return (
    <div className="text-center py-10">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3 text-gray-300"><Icon size={22} /></div>
      <div className="text-xs font-bold text-gray-500">{title}</div>
      <div className="text-[10px] text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">{desc}</div>
    </div>
  );
}

export default function GlobalCommandCenter() {
  const [activeMainTab, setActiveMainTab] = useState('command-center');
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [orgSearch, setOrgSearch] = useState('');
  const [activeOrgTab, setActiveOrgTab] = useState('overview');
  const [impersonating, setImpersonating] = useState<any>(null);
  const [showImpersonationModal, setShowImpersonationModal] = useState(false);
  const [impersonationTarget, setImpersonationTarget] = useState<any>(null);
  const [viewUser, setViewUser] = useState<any>(null);

  const [organisations, setOrganisations] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>({});
  const [students, setStudents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [orgAdmins, setOrgAdmins] = useState<any[]>([]);
  const [orgSecurityLogs, setOrgSecurityLogs] = useState<any[]>([]);
  const [orgAuditLogs, setOrgAuditLogs] = useState<any[]>([]);
  const [impersonationSessions, setImpersonationSessions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [monitoringData, setMonitoringData] = useState<any[]>([]);
  const [rbacRoles, setRbacRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [orgRes, overviewRes, monRes, auditRes, impRes, rbacRes] = await Promise.all([
      gccApi.listOrganisations({ page: 1, limit: 50 }),
      gccApi.overview(),
      gccApi.getMonitoring(),
      gccApi.getAuditLogs({ page: 1, limit: 20 }),
      gccApi.getImpersonationSessions(),
      gccApi.getRBAC(),
    ]);

    if (orgRes.success && orgRes.data?.organisations?.length > 0) {
      setOrganisations(orgRes.data.organisations);
    }
    if (overviewRes.success && overviewRes.data) setOverview(overviewRes.data);
    if (monRes.success && monRes.data?.metrics?.length > 0) {
      const iconMap: Record<string, any> = {
        'Online Students': GraduationCap, 'Online Parents': Users, 'Online Staff': UserCheck,
        'Online Recruiters': Briefcase, 'Active Organizations': Building2, 'Active Sessions': Activity,
        'Failed Logins (24h)': ShieldAlert, 'Security Alerts': AlertTriangle,
        'API Usage (req/s)': Server, 'AI Usage (calls/hr)': Bot, 'Storage Used': Database, 'Platform Health': Heart,
      };
      setMonitoringData(monRes.data.metrics.map((m: any) => ({ ...m, icon: iconMap[m.label] || Activity })));
    }
    if (auditRes.success && auditRes.data?.logs?.length > 0) setAuditLogs(auditRes.data.logs);
    if (impRes.success && impRes.data?.sessions?.length > 0) setImpersonationSessions(impRes.data.sessions);
    if (rbacRes.success && rbacRes.data?.roles?.length > 0) setRbacRoles(rbacRes.data.roles);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const loadOrgData = useCallback(async (orgId: string) => {
    const [studRes, staffRes, parentRes, adminsRes, logsRes, auditRes] = await Promise.all([
      gccApi.getStudents(orgId),
      gccApi.getStaff(orgId),
      gccApi.getParents(orgId),
      gccApi.getOrgAdmins(orgId),
      gccApi.getOrgSecurityLogs(orgId),
      gccApi.getOrgAuditLogs(orgId),
    ]);
    if (studRes.success && studRes.data?.students) setStudents(studRes.data.students);
    if (staffRes.success && staffRes.data?.staff) setStaff(staffRes.data.staff);
    if (parentRes.success && parentRes.data?.parents) setParents(parentRes.data.parents);
    if (adminsRes.success && adminsRes.data?.admins) setOrgAdmins(adminsRes.data.admins);
    if (logsRes.success && logsRes.data?.logs) setOrgSecurityLogs(logsRes.data.logs);
    if (auditRes.success && auditRes.data?.logs) setOrgAuditLogs(auditRes.data.logs);
  }, []);

  const filteredOrgs = organisations.filter(o =>
    (o.name || '').toLowerCase().includes(orgSearch.toLowerCase()) ||
    (o.org_id || o.id || '').toLowerCase().includes(orgSearch.toLowerCase())
  );

  const handleSelectOrg = (org: any) => {
    setSelectedOrg(org);
    setActiveMainTab('command-center');
    setActiveOrgTab('overview');
    loadOrgData(org.id);
  };

  const startImpersonation = (user: any, role: string) => {
    setImpersonationTarget({ ...user, role });
    setShowImpersonationModal(true);
  };

  const confirmImpersonation = async () => {
    if (impersonationTarget) {
      const res = await gccApi.startImpersonation({
        userId: impersonationTarget.id,
        role: impersonationTarget.role,
        organisationId: selectedOrg?.id || '',
        orgName: selectedOrg?.name || '',
        userName: impersonationTarget.name,
      });
      setImpersonating({ ...impersonationTarget, success: !!(res && res.success) });
    } else {
      setImpersonating(impersonationTarget);
    }
    setShowImpersonationModal(false);
    setImpersonationTarget(null);
  };

  const exitImpersonation = () => setImpersonating(null);

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

  const mainTabs = [
    { key: 'command-center', label: 'Command Center', icon: LayoutDashboard },
    { key: 'monitoring', label: 'Real-Time Monitoring', icon: Activity },
    { key: 'audit-compliance', label: 'Audit & Compliance', icon: FileText },
    { key: 'impersonation', label: 'Impersonation Logs', icon: Eye },
  ];

  const overviewStats = () => [
    { label: 'Total Students', value: students.length, color: COLORS.success, bg: '#F0FDF4', icon: GraduationCap },
    { label: 'Total Staff', value: staff.length, color: COLORS.primary, bg: '#F3F0FF', icon: UserCheck },
    { label: 'Total Parents', value: parents.length, color: COLORS.info, bg: '#EFF6FF', icon: Users },
    { label: 'Total Portal Users', value: students.length + staff.length + parents.length, color: COLORS.accent, bg: '#FAF5FF', icon: Users },
  ];

  const overviewPills = [
    { icon: Building2, label: 'Organizations', value: overview.totalOrganisations ?? organisations.length, color: '#C4B5FD' },
    { icon: GraduationCap, label: 'Students', value: overview.totalStudents, color: '#86EFAC' },
    { icon: UserCheck, label: 'Staff', value: overview.totalStaff, color: '#93C5FD' },
    { icon: Users, label: 'Parents', value: overview.totalParents, color: '#FCD34D' },
  ];

  return (
    <div>
      {/* Impersonation Banner */}
      <AnimatePresence>
        {impersonating && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="sticky top-0 z-50 -mx-5 lg:-mx-8 px-5 lg:px-8 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center"><Eye size={14} /></div>
              <div className="text-xs font-medium">
                You are impersonating: <span className="font-bold">{impersonating.name}</span>
                <span className="ml-2 px-1.5 py-0.5 rounded bg-white/20 text-[10px]">{impersonating.role}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20 text-white border-0 text-[10px]">Session Recording Active</Badge>
              <button onClick={exitImpersonation} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white text-amber-700 text-xs font-bold hover:bg-amber-50 transition-all active:scale-95">
                <LogOut size={13} /> Exit Impersonation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Center Hero */}
      <div className="relative overflow-hidden rounded-3xl mb-8 border border-white/15 bg-gradient-to-br from-[#3A2A6B] via-[#4B3B9A] to-[#6D4CFF] shadow-[0_20px_60px_rgba(109,76,255,0.28)]">
        {/* Aurora orbs */}
        <motion.div className="absolute -top-32 -left-24 w-96 h-96 bg-[#7C3AED]/45 rounded-full blur-[120px] pointer-events-none"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -bottom-32 -right-24 w-96 h-96 bg-[#3B82F6]/35 rounded-full blur-[130px] pointer-events-none"
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute top-1/3 right-1/4 w-40 h-40 bg-[#A855F7]/45 rounded-full blur-[80px] pointer-events-none"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
        {/* Dotted grid */}
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
        {/* Sheen sweep */}
        <motion.div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none"
          initial={{ x: '-120%' }} animate={{ x: '320%' }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
        {/* Particles */}
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

        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" /></span>
              Global Command Center Active
            </Badge>
            <Badge className="bg-white/15 text-white border border-white/15 text-[10px] flex items-center gap-1">
              <Sparkles size={10} /> Enterprise Control Plane
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight mb-1">
            Global Command Center
          </h1>
          <p className="text-xs md:text-sm text-white/70 max-w-3xl leading-relaxed mb-4">
            Cross-portal control plane with hierarchical organization isolation. Select an organization workspace to manage its portals, users, monitoring, and audit trails — every figure below is live.
          </p>

          {/* Live overview pills */}
          <div className="flex flex-wrap items-center gap-2">
            {overviewPills.map((pill, i) => {
              const Icon = pill.icon;
              return (
                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 border border-white/10 text-[10px] font-semibold text-white/95">
                  <Icon size={11} style={{ color: pill.color }} /> {fmtNum(pill.value)} {pill.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {mainTabs.map(tab => {
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
          {!selectedOrg ? (
            <div>
              {/* Platform-wide summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                {overviewPills.map((pill, i) => {
                  const Icon = pill.icon;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }} className="stat-card">
                      <div className="flex items-start justify-between mb-1">
                        <div className="stat-card-icon"><Icon size={20} /></div>
                      </div>
                      <div className="text-2xl font-extrabold tracking-tight">{fmtNum(pill.value)}</div>
                      <div className="text-[11px] text-gray-400">{pill.label}</div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Select workspace */}
              <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center mx-auto mb-4">
                    <Building2 size={28} className="text-white" />
                  </div>
                  <h2 className="text-lg font-extrabold mb-1">Select Organization Workspace</h2>
                  <p className="text-xs text-gray-400 max-w-lg mx-auto">
                    Search by name or org ID — select an organization to manage its portals, users, and settings. All actions are scoped to that workspace.
                  </p>
                </div>
                <div className="max-w-xl mx-auto mb-5">
                  <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus-within:border-[#6D4CFF] focus-within:bg-white transition-all">
                    <Search size={16} className="text-gray-400" />
                    <input type="text" value={orgSearch} onChange={e => setOrgSearch(e.target.value)}
                      placeholder="Search by organization name or org ID (e.g. org9237)..."
                      className="bg-transparent border-none outline-none text-sm flex-1" />
                  </div>
                  {orgSearch && (
                    <div className="text-right mt-1 text-[10px] text-gray-400">
                      {filteredOrgs.length} organization{filteredOrgs.length === 1 ? '' : 's'} match
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {loading && organisations.length === 0 && (
                    <div className="col-span-full text-center py-10 text-xs text-gray-400">Loading organizations...</div>
                  )}
                  {filteredOrgs.slice(0, 30).map(org => (
                    <button key={org.id} onClick={() => handleSelectOrg(org)}
                      className="flex items-start gap-3 w-full p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-[#6D4CFF]/40 hover:bg-[#F3F0FF] hover:shadow-md transition-all text-left group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        org.tier === 'platinum' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white' :
                        org.tier === 'gold' ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {org.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold truncate">{org.name}</span>
                          <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#6D4CFF]/10 text-[#6D4CFF]">{orgDisplayId(org)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1 flex-wrap">
                          <span>{org.plan} Plan</span>
                          <span>·</span>
                          <span>{fmtDate(org.created)}</span>
                          {org.region && (<><span>·</span><span className="capitalize">{org.region}</span></>)}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant={org.status === 'active' ? 'success' : org.status === 'pending' ? 'warning' : 'danger'} className="text-[8px] capitalize">{org.status}</Badge>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-semibold capitalize ${
                            org.tier === 'platinum' ? 'bg-purple-50 text-purple-600' :
                            org.tier === 'gold' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-500'
                          }`}>{org.tier} tier</span>
                        </div>
                      </div>
                      <ArrowUpRight size={13} className="text-gray-300 mt-1 group-hover:text-[#6D4CFF] transition-all flex-shrink-0" />
                    </button>
                  ))}
                  {!loading && filteredOrgs.length === 0 && (
                    <div className="col-span-full text-center py-10 text-xs text-gray-400">
                      No organizations found matching "{orgSearch}"
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            <div>
              {/* Organization Workspace Header */}
              <Card className="p-5 mb-6 border-l-4 border-l-[#6D4CFF]">
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold">{selectedOrg.name}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF]">{orgDisplayId(selectedOrg)}</span>
                        <Badge variant={selectedOrg.status === 'active' ? 'success' : 'warning'} className="text-[9px] capitalize">{selectedOrg.status}</Badge>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                          selectedOrg.tier === 'platinum' ? 'bg-purple-50 text-purple-600' :
                          selectedOrg.tier === 'gold' ? 'bg-amber-50 text-amber-600' :
                          'bg-gray-50 text-gray-500'
                        }`}>{selectedOrg.tier?.toUpperCase() || 'SILVER'} TIER</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1 flex-wrap">
                        <span>{selectedOrg.plan} Plan</span>
                        <span>·</span>
                        <span>Joined {fmtDate(selectedOrg.created)}</span>
                        {selectedOrg.region && (<><span>·</span><span className="capitalize">{selectedOrg.region} region</span></>)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setSelectedOrg(null); setOrgSearch(''); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-gray-200 transition-all">
                      <Search size={12} /> Change Org
                    </button>
                    <Badge className="bg-[#F3F0FF] text-[#6D4CFF] border-0 text-[9px]">Workspace Active</Badge>
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
                      {/* KPI cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {overviewStats().map((stat, i) => {
                          const Icon = stat.icon;
                          return (
                            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }} className="stat-card">
                              <div className="flex items-start justify-between mb-1">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: stat.bg, color: stat.color }}><Icon size={20} /></div>
                              </div>
                              <div className="text-2xl font-extrabold tracking-tight">{fmtNum(stat.value)}</div>
                              <div className="text-[11px] text-gray-400">{stat.label}</div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Portal distribution + Org profile */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <Card className="p-5 lg:col-span-2">
                          <h3 className="text-sm font-bold mb-4">Portal Distribution — {selectedOrg.name}</h3>
                          {(() => {
                            const stats = [
                              { label: 'Students', value: students.length, color: COLORS.success, icon: GraduationCap },
                              { label: 'Staff', value: staff.length, color: COLORS.primary, icon: UserCheck },
                              { label: 'Parents', value: parents.length, color: COLORS.info, icon: Users },
                            ];
                            const total = stats.reduce((a, b) => a + b.value, 0) || 1;
                            return (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {stats.map((stat, i) => {
                                    const Icon = stat.icon;
                                    return (
                                      <div key={i} className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: `${stat.color}15`, color: stat.color }}><Icon size={16} /></div>
                                        <div className="text-lg font-extrabold">{fmtNum(stat.value)}</div>
                                        <div className="text-[10px] text-gray-500">{stat.label}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="space-y-3">
                                  {stats.map((stat, i) => (
                                    <div key={i}>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] text-gray-500">{stat.label}</span>
                                        <span className="text-[10px] font-semibold">{Math.round((stat.value / total) * 100)}%</span>
                                      </div>
                                      <Progress value={(stat.value / total) * 100} className="h-1.5" style={{ background: `${stat.color}15` }} />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </Card>

                        {/* Organization profile */}
                        <Card className="p-5">
                          <h3 className="text-sm font-bold mb-4">Organization Profile</h3>
                          <div className="space-y-2">
                            {[
                              { label: 'Org ID', value: orgDisplayId(selectedOrg), mono: true },
                              { label: 'Plan', value: selectedOrg.plan || '—' },
                              { label: 'Tier', value: (selectedOrg.tier || 'silver').toUpperCase() },
                              { label: 'Status', value: (selectedOrg.status || '—').charAt(0).toUpperCase() + (selectedOrg.status || '—').slice(1) },
                              { label: 'Region', value: selectedOrg.region || '—' },
                              { label: 'Joined', value: fmtDate(selectedOrg.created) },
                            ].map((row, i) => (
                              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <span className="text-[10px] text-gray-500">{row.label}</span>
                                <span className={`text-[10px] font-semibold ${row.mono ? 'font-mono text-[#6D4CFF]' : ''}`}>{row.value}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 p-3 rounded-xl bg-[#F3F0FF] border border-[#6D4CFF]/10">
                            <div className="flex items-center gap-2 text-[10px] font-semibold text-[#6D4CFF] mb-1">
                              <Sparkles size={11} /> Workspace Summary
                            </div>
                            <p className="text-[9px] text-gray-500 leading-relaxed">
                              {students.length} student, {staff.length} staff, and {parents.length} parent accounts are linked to this workspace.
                            </p>
                          </div>
                        </Card>
                      </div>

                      {/* Recent audit activity */}
                      <Card className="p-5">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                          <h3 className="text-sm font-bold">Recent Audit Activity</h3>
                          <button onClick={() => setActiveOrgTab('audit')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-gray-200 transition-all">
                            View All <ArrowUpRight size={11} />
                          </button>
                        </div>
                        {auditLogs.length === 0 ? (
                          <EmptyState icon={FileText} title="No audit activity yet" desc="Audit events for this organization will appear here as admin actions are recorded." />
                        ) : (
                          <div className="space-y-2">
                            {auditLogs.slice(0, 5).map(log => (
                              <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#6D4CFF] flex-shrink-0"><Activity size={14} /></div>
                                  <div className="min-w-0">
                                    <div className="text-[10px] font-semibold truncate">{log.action}</div>
                                    <div className="text-[9px] text-gray-400 truncate">{log.admin} · {log.affectedUser || '—'}</div>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-3">
                                  <Badge variant="info" className="text-[8px]">{log.portal}</Badge>
                                  <div className="text-[9px] text-gray-400 mt-1 whitespace-nowrap">{log.timestamp}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    </div>
                  )}

                  {/* STUDENT PORTAL CONTROL */}
                  {activeOrgTab === 'students' && (
                    <div className="space-y-5">
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600"><GraduationCap size={16} /></div>
                            <h3 className="text-sm font-bold">Student Portal Control — {selectedOrg.name}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-[#F3F0FF] text-[#6D4CFF] border-0 text-[9px]">{fmtNum(students.length)} Students</Badge>
                            <button
                              onClick={() => exportCSV(students.map(s => ({ id: shortId(s.id), name: s.name, email: s.email, status: s.status })), `students-${orgDisplayId(selectedOrg)}.csv`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-gray-200 hover:text-[#6D4CFF] transition-all">
                              <Download size={12} /> Export
                            </button>
                          </div>
                        </div>
                        {students.length === 0 ? (
                          <EmptyState icon={GraduationCap} title="No students found" desc="No student accounts are linked to this organization yet." />
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="data-table">
                              <thead><tr><th>Student ID</th><th>Name</th><th>Email</th><th>Status</th><th className="text-right w-[150px]">Actions</th></tr></thead>
                              <tbody>
                                {students.map(s => (
                                  <tr key={s.id}>
                                    <td className="text-[10px] font-mono text-[#6D4CFF] whitespace-nowrap">{shortId(s.id)}</td>
                                    <td className="text-xs font-semibold whitespace-nowrap">{s.name}</td>
                                    <td className="text-[10px] text-gray-500 whitespace-nowrap">{s.email}</td>
                                    <td className="whitespace-nowrap"><Badge variant={s.status === 'active' ? 'success' : 'danger'} className="text-[9px]">{s.status}</Badge></td>
                                    <td className="text-right whitespace-nowrap">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button onClick={() => setViewUser({ ...s, role: 'Student', org: selectedOrg?.name })}
                                          className="px-2 py-1 rounded-md bg-gray-50 border border-gray-100 text-gray-500 text-[9px] font-semibold hover:bg-[#F3F0FF] hover:text-[#6D4CFF] hover:border-[#6D4CFF]/30 transition-all">
                                          <Eye size={11} className="inline -mt-0.5 mr-1" />View
                                        </button>
                                        <button onClick={() => startImpersonation(s, 'Student')}
                                          className="px-2 py-1 rounded-md bg-amber-50 border border-amber-100 text-amber-600 text-[9px] font-semibold hover:bg-amber-100 transition-all">
                                          <LogOut size={11} className="inline -mt-0.5 mr-1 rotate-180" />Login As
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </Card>
                    </div>
                  )}

                  {/* STAFF PORTAL CONTROL */}
                  {activeOrgTab === 'staff' && (
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600"><UserCheck size={16} /></div>
                          <h3 className="text-sm font-bold">Staff Portal Control — {selectedOrg.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#F3F0FF] text-[#6D4CFF] border-0 text-[9px]">{fmtNum(staff.length)} Staff</Badge>
                          <button
                            onClick={() => exportCSV(staff.map(s => ({ id: shortId(s.id), name: s.name, email: s.email, status: s.status })), `staff-${orgDisplayId(selectedOrg)}.csv`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-gray-200 hover:text-[#6D4CFF] transition-all">
                            <Download size={12} /> Export
                          </button>
                        </div>
                      </div>
                      {staff.length === 0 ? (
                        <EmptyState icon={UserCheck} title="No staff found" desc="No staff accounts are linked to this organization yet." />
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="data-table">
                            <thead><tr><th>Staff ID</th><th>Name</th><th>Email</th><th>Status</th><th className="text-right w-[150px]">Actions</th></tr></thead>
                            <tbody>
                              {staff.map(s => (
                                <tr key={s.id}>
                                  <td className="text-[10px] font-mono text-[#6D4CFF] whitespace-nowrap">{shortId(s.id)}</td>
                                  <td className="text-xs font-semibold whitespace-nowrap">{s.name}</td>
                                  <td className="text-[10px] text-gray-500 whitespace-nowrap">{s.email}</td>
                                  <td className="whitespace-nowrap"><Badge variant="success" className="text-[9px]">{s.status}</Badge></td>
                                  <td className="text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button onClick={() => setViewUser({ ...s, role: 'Staff', org: selectedOrg?.name })}
                                        className="px-2 py-1 rounded-md bg-gray-50 border border-gray-100 text-gray-500 text-[9px] font-semibold hover:bg-[#F3F0FF] hover:text-[#6D4CFF] hover:border-[#6D4CFF]/30 transition-all">
                                        <Eye size={11} className="inline -mt-0.5 mr-1" />View
                                      </button>
                                      <button onClick={() => startImpersonation(s, 'Staff')}
                                        className="px-2 py-1 rounded-md bg-amber-50 border border-amber-100 text-amber-600 text-[9px] font-semibold hover:bg-amber-100 transition-all">
                                        <LogOut size={11} className="inline -mt-0.5 mr-1 rotate-180" />Login As
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Card>
                  )}

                  {/* PARENT PORTAL CONTROL */}
                  {activeOrgTab === 'parents' && (
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Users size={16} /></div>
                          <h3 className="text-sm font-bold">Parent Portal Control — {selectedOrg.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#F3F0FF] text-[#6D4CFF] border-0 text-[9px]">{fmtNum(parents.length)} Parents</Badge>
                          <button
                            onClick={() => exportCSV(parents.map(p => ({ id: shortId(p.id), name: p.name, email: p.email, status: p.status })), `parents-${orgDisplayId(selectedOrg)}.csv`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-gray-200 hover:text-[#6D4CFF] transition-all">
                            <Download size={12} /> Export
                          </button>
                        </div>
                      </div>
                      {parents.length === 0 ? (
                        <EmptyState icon={Users} title="No parents found" desc="No parent accounts are linked to this organization yet." />
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="data-table">
                            <thead><tr><th>Parent ID</th><th>Name</th><th>Email</th><th>Status</th><th className="text-right w-[150px]">Actions</th></tr></thead>
                            <tbody>
                              {parents.map(p => (
                                <tr key={p.id}>
                                  <td className="text-[10px] font-mono text-[#6D4CFF] whitespace-nowrap">{shortId(p.id)}</td>
                                  <td className="text-xs font-semibold whitespace-nowrap">{p.name}</td>
                                  <td className="text-[10px] text-gray-500 whitespace-nowrap">{p.email}</td>
                                  <td className="whitespace-nowrap"><Badge variant="success" className="text-[9px]">{p.status}</Badge></td>
                                  <td className="text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button onClick={() => setViewUser({ ...p, role: 'Parent', org: selectedOrg?.name })}
                                        className="px-2 py-1 rounded-md bg-gray-50 border border-gray-100 text-gray-500 text-[9px] font-semibold hover:bg-[#F3F0FF] hover:text-[#6D4CFF] hover:border-[#6D4CFF]/30 transition-all">
                                        <Eye size={11} className="inline -mt-0.5 mr-1" />View
                                      </button>
                                      <button onClick={() => startImpersonation(p, 'Parent')}
                                        className="px-2 py-1 rounded-md bg-amber-50 border border-amber-100 text-amber-600 text-[9px] font-semibold hover:bg-amber-100 transition-all">
                                        <LogOut size={11} className="inline -mt-0.5 mr-1 rotate-180" />Login As
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Card>
                  )}

                  {/* JOB PROVIDER PORTAL CONTROL */}
                  {activeOrgTab === 'job-provider' && (
                    <Card className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600"><Briefcase size={16} /></div>
                        <h3 className="text-sm font-bold">Job Provider Portal — {selectedOrg.name}</h3>
                      </div>
                      <EmptyState icon={Briefcase} title="Job provider data not available" desc="Recruiter and job listings for this organization will appear here once wired to the platform data." />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {[
                          { icon: Briefcase, label: 'Manage Jobs' },
                          { icon: Users, label: 'Recruiters' },
                          { icon: BarChart3, label: 'Hiring Analytics' },
                        ].map((action, i) => {
                          const Icon = action.icon;
                          return (
                            <button key={i} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-[#F3F0FF] transition-all text-left">
                              <Icon size={13} className="text-[#6D4CFF]" />
                              <span className="text-[10px] font-semibold">{action.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </Card>
                  )}

                  {/* ORG ADMIN CONTROL */}
                  {activeOrgTab === 'org-admin' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <Card className="p-5">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                          <h3 className="text-sm font-bold">Admin Management</h3>
                          <Badge className="bg-[#F3F0FF] text-[#6D4CFF] border-0 text-[9px]">{fmtNum(orgAdmins.length)} Admins</Badge>
                        </div>
                        {orgAdmins.length === 0 ? (
                          <EmptyState icon={Shield} title="No administrators found" desc="Organization admins (management, admin, owner, supervisor roles) linked to this organization will appear here." />
                        ) : (
                          <div className="space-y-2">
                            {orgAdmins.map(admin => (
                              <div key={admin.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                  <Avatar className="w-8 h-8 flex-shrink-0"><div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[9px] font-bold rounded-full">{admin.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</div></Avatar>
                                  <div className="min-w-0">
                                    <div className="text-xs font-semibold truncate">{admin.name}</div>
                                    <div className="text-[10px] text-gray-400 truncate">{admin.email}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <div className="text-right mr-1">
                                    <div className="flex justify-end"><Badge variant={admin.role === 'owner' ? 'purple' : 'info'} className="text-[8px] capitalize">{admin.role}</Badge></div>
                                    <div className="text-[9px] text-gray-400 mt-1 whitespace-nowrap">{fmtLastActive(admin.lastLogin)}</div>
                                  </div>
                                  <button onClick={() => setViewUser({ ...admin, role: 'Org Admin', org: selectedOrg?.name })}
                                    className="px-2 py-1 rounded-md bg-gray-50 border border-gray-100 text-gray-500 text-[9px] font-semibold hover:bg-[#F3F0FF] hover:text-[#6D4CFF] hover:border-[#6D4CFF]/30 transition-all">
                                    <Eye size={11} className="inline -mt-0.5 mr-1" />View
                                  </button>
                                  <button onClick={() => startImpersonation(admin, 'Org Admin')}
                                    className="px-2 py-1 rounded-md bg-amber-50 border border-amber-100 text-amber-600 text-[9px] font-semibold hover:bg-amber-100 transition-all">
                                    <LogOut size={11} className="inline -mt-0.5 mr-1 rotate-180" />Login As
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                      <Card className="p-5">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                          <h3 className="text-sm font-bold">Security Logs</h3>
                          <Badge className="bg-gray-100 text-gray-500 border-0 text-[9px]">{fmtNum(orgSecurityLogs.length)} Events</Badge>
                        </div>
                        {orgSecurityLogs.length === 0 ? (
                          <EmptyState icon={Lock} title="No recent security events" desc="Security events for this organization (from the audit_logs table) will appear here." />
                        ) : (
                          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                            {orgSecurityLogs.map((log: any) => (
                              <div key={log.id} className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severityDot(log.severity)}`} />
                                  <div className="min-w-0">
                                    <div className="text-[11px] font-semibold truncate">{log.action}</div>
                                    <div className="text-[9px] text-gray-500 truncate">{log.user || 'Unknown admin'}{log.userEmail && <span className="text-gray-400"> · {log.userEmail}</span>}</div>
                                    <div className="text-[9px] text-gray-400 truncate">
                                      {log.method && <span className="font-mono text-gray-500 uppercase">{log.method}</span>}
                                      {log.method && log.resource && <span> · </span>}
                                      <span className="font-mono">{log.resource || log.entityType}</span>
                                    </div>
                                    <div className="text-[9px] text-gray-400 truncate">
                                      {log.ip && <span className="font-mono">IP {log.ip}</span>}
                                      {log.status && <span> · HTTP {log.status}</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                  <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase border ${severityColor(log.severity)}`}>{log.severity}</span>
                                  <span className="text-[9px] text-gray-400 whitespace-nowrap">{fmtAgo(log.timestamp)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    </div>
                  )}

                  {/* MONITORING (ORG) */}
                  {activeOrgTab === 'monitoring' && (
                    <div>
                      {monitoringData.length === 0 ? (
                        <Card className="p-5">
                          <EmptyState icon={Activity} title="No live metrics available" desc="Real-time platform metrics for this organization will appear here when the monitoring pipeline is connected." />
                        </Card>
                      ) : (
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
                      )}
                    </div>
                  )}

                  {/* AUDIT LOGS (ORG) */}
                  {activeOrgTab === 'audit' && (
                    <Card className="p-5">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <h3 className="text-sm font-bold">Organization Audit Log — {selectedOrg.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-50 text-amber-600 border-0 text-[9px]">Important Events Only</Badge>
                          <Badge className="bg-[#F3F0FF] text-[#6D4CFF] border-0 text-[9px]">{fmtNum(orgAuditLogs.length)} Events</Badge>
                          {orgAuditLogs.length > 0 && (
                            <button onClick={() => exportCSV(orgAuditLogs.map(l => ({ action: l.action, entity: l.entityType, user: l.user, email: l.userEmail, severity: l.severity, ip: l.ip, timestamp: l.timestamp })), `audit-log-${selectedOrg.id}.csv`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-[#F3F0FF] hover:text-[#6D4CFF] transition-all"><Download size={12} /> Export</button>
                          )}
                        </div>
                      </div>
                      {orgAuditLogs.length === 0 ? (
                        <EmptyState icon={FileText} title="No important audit events" desc="Significant actions for this organization (role changes, deletions, impersonations, security warnings & errors) recorded in the audit_logs table will appear here." />
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="data-table">
                            <thead><tr><th>Admin</th><th>Action</th><th>Entity</th><th>Severity</th><th>IP Address</th><th className="text-right">Timestamp</th></tr></thead>
                            <tbody>
                              {orgAuditLogs.map(log => (
                                <tr key={log.id}>
                                  <td className="text-[10px] font-semibold">{log.user || '—'}<div className="text-[9px] font-normal text-gray-400">{log.userEmail}</div></td>
                                  <td className="text-[10px] max-w-[220px]">
                                    <div className="truncate">{log.action}</div>
                                    <div className="text-[9px] font-mono text-gray-400 truncate">{log.method && <span className="uppercase">{log.method}</span>}{log.method && log.resource && <span> · </span>}{log.resource}</div>
                                  </td>
                                  <td><Badge variant="default" className="text-[8px]">{log.entityType}</Badge></td>
                                  <td><span className={`inline-block px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase border ${severityColor(log.severity)}`}>{log.severity}</span></td>
                                  <td className="text-[9px] text-gray-400 font-mono">{log.ip || '—'}</td>
                                  <td className="text-right text-[9px] text-gray-400 whitespace-nowrap">{fmtAgo(log.timestamp)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
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
          {monitoringData.length === 0 ? (
            <Card className="p-5">
              <EmptyState icon={Activity} title="No live metrics available" desc="Real-time platform metrics from the monitoring pipeline will appear here. Check the API connection and try again with the refresh button below." />
              <div className="text-center pb-4">
                <button onClick={loadData} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-[10px] font-bold hover:shadow-lg transition-all active:scale-95">
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>
            </Card>
          ) : (
            <>
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
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="text-sm font-bold">Security & Platform Status</h3>
                  <button onClick={loadData} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-gray-200 transition-all">
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-100 mb-3">
                  <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
                  <span className="text-[10px] text-green-700 font-medium">All monitored services reporting normal status.</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Encryption', value: 'Active', icon: Lock, color: COLORS.success },
                    { label: 'Auth Guard', value: 'Active', icon: Shield, color: COLORS.success },
                    { label: 'Audit Trail', value: 'Active', icon: FileText, color: COLORS.success },
                    { label: 'Backup Pipeline', value: 'Active', icon: Database, color: COLORS.success },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15`, color: s.color }}><Icon size={13} /></div>
                        <div>
                          <div className="text-[9px] text-gray-400">{s.label}</div>
                          <div className="text-[10px] font-semibold text-green-700">{s.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* AUDIT & COMPLIANCE TAB */}
      {activeMainTab === 'audit-compliance' && (
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-sm font-bold">Enterprise Audit Trail</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold"><Download size={12} /> Export</button>
            </div>
            {auditLogs.length === 0 ? (
              <EmptyState icon={FileText} title="No audit records yet" desc="Audit events will appear here as admin actions are recorded across all organizations." />
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>ID</th><th>Admin</th><th>Organization</th><th>Portal</th><th>Affected User</th><th>Action</th><th>IP Address</th><th>Timestamp</th></tr></thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id}>
                        <td className="text-[9px] font-mono text-gray-400">{shortId(log.id)}</td>
                        <td className="text-[10px] font-semibold">{log.admin}</td>
                        <td className="text-[10px] max-w-[120px] truncate">{log.org}</td>
                        <td><Badge variant="info" className="text-[7px]">{log.portal}</Badge></td>
                        <td className="text-[10px] text-gray-600">{log.affectedUser}</td>
                        <td className="text-[10px] max-w-[140px] truncate">{log.action}</td>
                        <td className="text-[9px] text-gray-400 font-mono">{log.ip}</td>
                        <td className="text-[9px] text-gray-400 whitespace-nowrap">{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Compliance Summary */}
          <Card className="p-5">
            <h3 className="text-sm font-bold mb-4">Compliance & Certification</h3>
            <EmptyState icon={Shield} title="Compliance certificates not available" desc="Certification status (SOC 2, GDPR, ISO 27001, PCI DSS) will appear here once the compliance pipeline is connected." />
          </Card>

          {/* Impersonation Audit */}
          <Card className="p-5">
            <h3 className="text-sm font-bold mb-4">Impersonation Activity</h3>
            {impersonationSessions.length === 0 ? (
              <EmptyState icon={Eye} title="No impersonation sessions" desc="Secure impersonation sessions will appear here as they are initiated by super admins." />
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead><tr><th>Session ID</th><th>Impersonated User</th><th>Role</th><th>Organization</th><th>Duration</th><th>Initiated By</th><th>Time</th></tr></thead>
                  <tbody>
                    {impersonationSessions.map(s => (
                      <tr key={s.id}>
                        <td className="text-[9px] font-mono text-gray-400">{s.id}</td>
                        <td className="text-[10px] font-semibold">{s.user}</td>
                        <td><Badge variant="warning" className="text-[8px]">{s.role}</Badge></td>
                        <td className="text-[10px] text-gray-600">{s.org}</td>
                        <td className="text-[10px] font-mono">{s.duration}</td>
                        <td className="text-[10px]">{s.by}</td>
                        <td className="text-[10px] text-gray-400">{s.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Role-Based Security */}
          <Card className="p-5">
            <h3 className="text-sm font-bold mb-4">Role-Based Access Control</h3>
            {rbacRoles.length === 0 ? (
              <EmptyState icon={Shield} title="No RBAC roles configured" desc="Administrator roles and permissions will appear here once configured in the admin directory." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {rbacRoles.map((r, i) => (
                  <div key={i} className="p-4 rounded-xl text-center bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 bg-[#F3F0FF] text-[#6D4CFF]"><Shield size={18} /></div>
                    <h4 className="text-xs font-bold mb-1">{r.name || r.role || 'Role'}</h4>
                    <div className="text-lg font-extrabold text-[#6D4CFF]">{fmtNum(r.users ?? r.user_count)}</div>
                    <div className="text-[9px] text-gray-500 mb-2">users</div>
                    <div className="text-[10px] font-semibold text-gray-600">{r.permissions || r.description || '—'}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* IMPERSONATION LOGS TAB */}
      {activeMainTab === 'impersonation' && (
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <h3 className="text-sm font-bold">Secure Impersonation Management</h3>
              <Badge className="bg-[#F3F0FF] text-[#6D4CFF] border-0 text-[9px]">Temporary Sessions Only</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <div className="flex items-center gap-2 mb-1">
                  <Eye size={16} className="text-amber-600" />
                  <span className="text-xs font-bold text-amber-800">Recorded Sessions</span>
                </div>
                <div className="text-2xl font-extrabold text-amber-900">{fmtNum(impersonationSessions.length)}</div>
                <div className="text-[10px] text-amber-700">Live audit trail</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-blue-600" />
                  <span className="text-xs font-bold text-blue-800">Session Status</span>
                </div>
                <div className="text-2xl font-extrabold text-blue-900">{impersonationSessions.filter(s => s.status === 'active').length} active</div>
                <div className="text-[10px] text-blue-700">Auto-expires at 30 min</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={16} className="text-green-600" />
                  <span className="text-xs font-bold text-green-800">Security Compliance</span>
                </div>
                <div className="text-2xl font-extrabold text-green-900">{impersonationSessions.length > 0 ? '100%' : '—'}</div>
                <div className="text-[10px] text-green-700">{impersonationSessions.length > 0 ? 'All sessions audited' : 'No active sessions'}</div>
              </Card>
            </div>
            <h4 className="text-xs font-bold mb-3">Impersonation History</h4>
            {impersonationSessions.length === 0 ? (
              <EmptyState icon={Eye} title="No impersonation sessions" desc="Impersonation sessions initiated by super admins will appear here with full audit context." />
            ) : (
              <div className="space-y-2">
                {impersonationSessions.map(s => (
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
            )}
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-bold mb-4">Impersonation Security Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Clock, label: 'Temporary Session', desc: 'Auto-expires after 30 minutes of inactivity' },
                { icon: FileText, label: 'Audit Logging', desc: 'Every action is logged with full context' },
                { icon: Bell, label: 'User Notification', desc: 'User is notified when impersonated' },
                { icon: Eye, label: 'Session Recording', desc: 'Full session activity is recorded' },
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

      {/* View User Modal */}
      <AnimatePresence>
        {viewUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setViewUser(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.25)] max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F3F0FF] flex items-center justify-center text-[#6D4CFF] font-bold text-sm">
                    {viewUser.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{viewUser.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="info" className="text-[8px]">{viewUser.role}</Badge>
                      <Badge variant={viewUser.status === 'active' ? 'success' : 'danger'} className="text-[8px] capitalize">{viewUser.status}</Badge>
                    </div>
                  </div>
                </div>
                <button onClick={() => setViewUser(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"><X size={15} /></button>
              </div>
              <div className="space-y-2 mb-5">
                {[
                  { label: 'User ID', value: shortId(viewUser.id), mono: true },
                  { label: 'Email', value: viewUser.email || '—' },
                  { label: 'Role', value: viewUser.role || '—' },
                  { label: 'Status', value: (viewUser.status || '—').charAt(0).toUpperCase() + (viewUser.status || '—').slice(1) },
                  { label: 'Organization', value: viewUser.org || selectedOrg?.name || '—' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-500">{row.label}</span>
                    <span className={`text-[10px] font-semibold ${row.mono ? 'font-mono text-[#6D4CFF]' : ''}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setViewUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all">
                  Close
                </button>
                <button onClick={() => { const target = { ...viewUser, name: viewUser.name }; setViewUser(null); startImpersonation(target, viewUser.role || 'User'); }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:shadow-lg active:scale-[0.98] transition-all">
                  Login As {viewUser.role || 'User'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}