'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Briefcase, Building2, Clock, Download, ExternalLink, Eye, FileText, Globe,
  GraduationCap, RefreshCw, Server, Settings, Shield, ShieldAlert, Smartphone, Sparkles,
  TrendingUp, UserCheck, Users, X,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { gccApi } from '../../lib/dataService-gcc';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', accent: '#A855F7', purple: '#7C3AED' };

const PORTAL_META: Record<string, { name: string; short: string; icon: any; color: string; bg: string }> = {
  student: { name: 'Student Portal', short: 'Student', icon: GraduationCap, color: COLORS.success, bg: '#F0FDF4' },
  staff: { name: 'Staff Portal', short: 'Staff', icon: UserCheck, color: COLORS.primary, bg: '#F3F0FF' },
  parent: { name: 'Parents Portal', short: 'Parents', icon: Users, color: COLORS.info, bg: '#EFF6FF' },
  'org-admin': { name: 'Management Portal', short: 'Management', icon: Shield, color: COLORS.warning, bg: '#FFFBEB' },
};

const fmtNum = (n?: any) => Number(n || 0).toLocaleString();
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
const exportCSV = (rows: any[], filename: string) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

function CountUp({ value }: { value: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!value) { setVal(0); return; }
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 700);
      setVal(Math.floor(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{val.toLocaleString()}</span>;
}

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

export default function CrossPortalControlCenter() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null);
  const [viewPortal, setViewPortal] = useState<any>(null);
  const [portalUsers, setPortalUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [health, setHealth] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setHealth('');
    const res = await gccApi.getPortalStats();
    if (res.success && res.data) setStats(res.data);
    else if (res.error) setError(res.error);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const healthCheck = async () => {
    setHealth('');
    setLoading(true);
    const res = await gccApi.getPortalStats();
    setLoading(false);
    if (res.success && res.data) {
      setStats(res.data);
      setHealth('All portal services responding · data synchronized');
    } else {
      setHealth(`Health check failed: ${res.error || 'API unreachable'}`);
    }
  };

  const openPortalUsers = async (portal: any) => {
    setViewPortal(portal);
    setPortalUsers([]);
    setUsersLoading(true);
    const res = await gccApi.getPortalUsers(portal.key);
    if (res.success && res.data?.users) setPortalUsers(res.data.users);
    setUsersLoading(false);
  };

  const portals = stats?.portals || [];
  const entities = stats?.entities || {};
  const orgsData = stats?.organisations || {};
  const recentLogs = stats?.recentLogs || [];
  const growth = stats?.growth || [];
  const traffic = stats?.traffic || [];

  const stat = (key: string) => {
    const p = portals.find((x: any) => x.key === key);
    return p ? p.users || 0 : 0;
  };

  const cards = [
    { key: 'student', name: PORTAL_META.student.name, icon: PORTAL_META.student.icon, users: stat('student'), color: PORTAL_META.student.color, bg: PORTAL_META.student.bg },
    { key: 'staff', name: PORTAL_META.staff.name, icon: PORTAL_META.staff.icon, users: stat('staff'), color: PORTAL_META.staff.color, bg: PORTAL_META.staff.bg },
    { key: 'parent', name: PORTAL_META.parent.name, icon: PORTAL_META.parent.icon, users: stat('parent'), color: PORTAL_META.parent.color, bg: PORTAL_META.parent.bg },
    { key: 'org-admin', name: PORTAL_META['org-admin'].name, icon: PORTAL_META['org-admin'].icon, users: stat('org-admin'), color: PORTAL_META['org-admin'].color, bg: PORTAL_META['org-admin'].bg },
    { key: 'jobprovider', name: 'Job Provider Portal', icon: Briefcase, users: 0, color: COLORS.accent, bg: '#FAF5FF' },
    { key: 'mobile', name: 'Mobile App', icon: Smartphone, users: 0, color: COLORS.danger, bg: '#FEF2F2' },
  ];

  const totalUsers = cards.reduce((s, c) => s + c.users, 0);
  const portalsOnline = cards.filter(c => c.users > 0).length;

  const chartData = portals.map((p: any) => ({
    name: (PORTAL_META[p.key] || { short: p.name }).short,
    Active: p.active || 0,
    Inactive: Math.max(0, (p.users || 0) - (p.active || 0)),
  }));

  const exportReport = () => {
    const portalRows = portals.map((p: any) => ({ Portal: p.name, Users: p.users, Active: p.active }));
    const orgRows = (stats?.recentOrganisations || []).map((o: any) => ({ Organisation: o.name, 'Org ID': o.org_id, Plan: o.plan, Status: o.status, Region: o.region, Created: o.created }));
    exportCSV([...portalRows, {}, ...orgRows], `cross-portal-report-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl mb-8 border border-white/15 bg-gradient-to-br from-[#3A2A6B] via-[#4B3B9A] to-[#6D4CFF] shadow-[0_20px_60px_rgba(109,76,255,0.28)] min-h-[320px] md:min-h-[340px] flex items-center"
      >
        <motion.div className="absolute -top-32 -left-24 w-96 h-96 bg-[#7C3AED]/45 rounded-full blur-[120px] pointer-events-none"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -bottom-32 -right-24 w-96 h-96 bg-[#3B82F6]/35 rounded-full blur-[130px] pointer-events-none"
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute top-1/3 right-1/4 w-40 h-40 bg-[#A855F7]/45 rounded-full blur-[80px] pointer-events-none"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />

        <div className="relative z-10 w-full p-6 md:p-8 flex items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" /></span>
                  {portalsOnline} Portals Active
                </Badge>
                <Badge className="bg-white/15 text-white border border-white/15 text-[10px] flex items-center gap-1">
                  <Sparkles size={10} /> Cross-Portal Control Plane
                </Badge>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight mb-1">
              Cross-Portal Control Center
            </h1>
            <p className="text-xs md:text-sm text-white/70 max-w-3xl leading-relaxed">
              Live portal accounts, organisation health and security activity across the Prasynx platform.
            </p>

            {/* Live overview pills */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {[
                { label: 'Organisations', value: orgsData.total, icon: Building2, color: 'text-amber-300' },
                { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-purple-300' },
                { label: 'Active Now', value: 0, icon: Activity, color: 'text-green-300' },
                { label: 'Students', value: entities.students, icon: GraduationCap, color: 'text-blue-300' },
                { label: 'Staff', value: entities.staff, icon: UserCheck, color: 'text-cyan-300' },
                { label: 'Parents', value: entities.parents, icon: Users, color: 'text-pink-300' },
              ].map((chip, i) => {
                const Icon = chip.icon;
                return (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 border border-white/10 text-[10px] font-semibold text-white/95">
                    <Icon size={11} className={chip.color} /> <CountUp value={chip.value} /> {chip.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Right-side controls — far end, vertically centered */}
          <div className="flex items-center gap-2 shrink-0">
            {loading ? (
              <Badge className="bg-white/15 text-white border border-white/20 text-[9px]"><RefreshCw size={10} className="animate-spin" /> Refreshing…</Badge>
            ) : (
              <Badge className="bg-white/15 text-white border border-white/20 text-[9px]"><Clock size={10} /> Updated {stats?.updatedAt ? fmtAgo(stats.updatedAt) : '—'}</Badge>
            )}
            <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 border border-white/20 text-white text-[10px] font-semibold hover:bg-white/25 transition-all active:scale-95">
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={exportReport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#6D4CFF] text-[10px] font-bold hover:shadow-lg transition-all active:scale-95">
              <Download size={11} /> Export Report
            </button>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="rounded-xl px-4 py-3 mb-6 bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-semibold">{error}</div>
      )}
      {health && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl px-4 py-3 mb-6 border text-[11px] font-semibold ${health.includes('failed') ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
          <ShieldAlert size={12} className="inline -mt-0.5 mr-1.5" />{health}
        </motion.div>
      )}

      {loading && !stats ? (
        <Card className="p-5"><EmptyState icon={RefreshCw} title="Loading platform data…" desc="Fetching real portal statistics, organisations and security activity." /></Card>
      ) : (
        <>
          {/* Portal Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {cards.map((portal, i) => {
              const Icon = portal.icon;
              const isSelected = selectedPortal === portal.key;
              return (
                <motion.div
                  key={portal.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                  whileHover={{ y: -4, scale: 1.03 }}
                  onClick={() => setSelectedPortal(isSelected ? null : portal.key)}
                  className={`rounded-2xl p-4 cursor-pointer transition-all duration-200 border-2 ${isSelected ? 'border-[#6D4CFF] shadow-lg shadow-[#6D4CFF]/20' : 'border-transparent hover:border-gray-200 shadow-sm'} bg-white`}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: portal.bg, color: portal.color }}><Icon size={18} /></div>
                    <div>
                      <div className="text-xs font-semibold">{portal.name}</div>
                      <Badge variant={portal.users > 0 ? 'success' : 'warning'} className="text-[8px] px-1.5 py-0">
                        {portal.users > 0 ? 'Active' : 'No Activity'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Users</span>
                      <span className="text-xs font-bold"><CountUp value={portal.users} /></span>
                    </div>
                    <Progress value={0} className="h-1" />
                    <div className="flex items-center justify-between text-[9px] text-gray-400">
                      <span>0 active</span>
                      <span>0%</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Selected portal strip */}
          <AnimatePresence>
            {selectedPortal && (() => {
              const selected = cards.find(c => c.key === selectedPortal)!;
              const Icon = selected.icon;
              return (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-8">
                <Card className="p-4 bg-gradient-to-r from-[#F3F0FF] to-white border-[#6D4CFF]/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: selected.bg, color: selected.color }}><Icon size={18} /></div>
                      <div>
                        <div className="text-sm font-bold">{selected.name}</div>
                        <div className="text-[10px] text-gray-400">Live account overview</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div><div className="text-lg font-extrabold text-[#6D4CFF]"><CountUp value={selected.users} /></div><div className="text-[9px] text-gray-400 font-semibold">Total Users</div></div>
                      <div><div className="text-lg font-extrabold text-emerald-600">0</div><div className="text-[9px] text-gray-400 font-semibold">Active</div></div>
                      <button onClick={() => openPortalUsers(selected)} className="px-3 py-1.5 rounded-lg bg-[#6D4CFF] text-white text-[10px] font-bold hover:shadow-lg transition-all active:scale-95">
                        <Eye size={11} className="inline -mt-0.5 mr-1" />View Users
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
              );
            })()}
          </AnimatePresence>

          {/* Growth + Traffic */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
            <Card className="p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold">Cross-Portal User Growth</h3>
                <Badge variant="info" className="text-[9px]">Last 6 months</Badge>
              </div>
              {growth.length === 0 ? (
                <EmptyState icon={TrendingUp} title="No growth data yet" desc="Monthly portal account growth from the users table will appear here." />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growth}>
                      <defs>
                        <linearGradient id="studGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.success} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.success} stopOpacity={0} /></linearGradient>
                        <linearGradient id="staffGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} /></linearGradient>
                        <linearGradient id="parGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.info} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.info} stopOpacity={0} /></linearGradient>
                        <linearGradient id="mngGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.warning} stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                      <Area type="monotone" dataKey="Student" stroke={COLORS.success} strokeWidth={2} fill="url(#studGrad)" name="Students" />
                      <Area type="monotone" dataKey="Staff" stroke={COLORS.primary} strokeWidth={2} fill="url(#staffGrad)" name="Staff" />
                      <Area type="monotone" dataKey="Parents" stroke={COLORS.info} strokeWidth={2} fill="url(#parGrad)" name="Parents" />
                      <Area type="monotone" dataKey="Management" stroke={COLORS.warning} strokeWidth={2} fill="url(#mngGrad)" name="Management" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold">Live Activity (24h)</h3>
                <Badge variant="success" className="text-[9px]">Real-time</Badge>
              </div>
              {traffic.length === 0 ? (
                <EmptyState icon={Activity} title="No activity in last 24h" desc="Audit events recorded in the last 24 hours will appear here." />
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={traffic} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="hour" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={40} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} />
                      <Bar dataKey="Events" fill={COLORS.primary} radius={[0, 4, 4, 0]} name="Events" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          {/* Portal Health & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold">Portal Health & Metrics</h3>
                <Badge className="bg-gray-100 text-gray-500 border-0 text-[9px]">{fmtNum(totalUsers)} Total Users</Badge>
              </div>
              {portals.length === 0 ? (
                <EmptyState icon={Server} title="No portal data" desc="Portal account metrics will appear here." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr><th>Portal</th><th>Users</th><th>Active</th><th>Status</th><th className="text-right">Actions</th></tr>
                    </thead>
                    <tbody>
                      {portals.map((p: any) => {
                        const meta = PORTAL_META[p.key] || { name: p.name, icon: Server, color: COLORS.accent, bg: '#FAF5FF' };
                        const Icon = meta.icon;
                        return (
                          <tr key={p.key}>
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: meta.bg, color: meta.color }}><Icon size={14} /></div>
                                <span className="text-xs font-semibold">{meta.name}</span>
                              </div>
                            </td>
                            <td className="text-xs font-medium"><CountUp value={p.users} /></td>
                            <td className="text-xs text-gray-600">0</td>
                            <td><Badge variant={p.users > 0 ? 'success' : 'warning'} className="text-[9px]">{p.users > 0 ? 'Operational' : 'No Activity'}</Badge></td>
                            <td className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => openPortalUsers({ key: p.key, name: meta.name })}
                                  title="View users"
                                  className="p-1.5 rounded-lg hover:bg-[#F3F0FF] text-gray-400 hover:text-[#6D4CFF] transition-all active:scale-90"><Eye size={13} /></button>
                                <button onClick={() => setSelectedPortal(p.key)}
                                  title="Focus portal"
                                  className="p-1.5 rounded-lg hover:bg-[#F3F0FF] text-gray-400 hover:text-[#6D4CFF] transition-all active:scale-90"><Settings size={13} /></button>
                                <button onClick={exportReport}
                                  title="Export report"
                                  className="p-1.5 rounded-lg hover:bg-[#F3F0FF] text-gray-400 hover:text-[#6D4CFF] transition-all active:scale-90"><ExternalLink size={13} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2.5">
                {[
                  { icon: RefreshCw, label: 'Refresh Data', desc: 'Re-fetch live platform statistics', onClick: load },
                  { icon: Download, label: 'Export Cross-Portal Report', desc: 'Download accounts & organisations CSV', onClick: exportReport },
                  { icon: Users, label: 'Browse Portal Users', desc: 'View real users per portal', onClick: () => setShowPicker(true) },
                  { icon: ShieldAlert, label: 'Security Activity', desc: 'View recent important security events', onClick: () => setShowLogs(true) },
                  { icon: Activity, label: 'Health Check', desc: 'Run diagnostic on portal data source', onClick: healthCheck },
                  { icon: Sparkles, label: 'AI Insights', desc: 'Summary of current platform state', onClick: () => setHealth(`Live snapshot: ${fmtNum(totalUsers)} users across ${portalsOnline} portals · ${fmtNum(orgsData.total)} organisations.`) },
                ].map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.button key={i} onClick={action.onClick} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md hover:border-[#6D4CFF]/30 transition-all text-left">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F3F0FF] text-[#6D4CFF] flex-shrink-0"><Icon size={14} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate">{action.label}</div>
                        <div className="text-[9px] text-gray-400 truncate">{action.desc}</div>
                      </div>
                      <TrendingUp size={12} className="text-gray-300 flex-shrink-0" />
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Portal Users Modal */}
      {viewPortal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewPortal(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">{viewPortal.name} — Users</h3>
              <button onClick={() => setViewPortal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={15} /></button>
            </div>
            {usersLoading ? (
              <EmptyState icon={RefreshCw} title="Loading users…" desc="Fetching the latest portal accounts." />
            ) : portalUsers.length === 0 ? (
              <EmptyState icon={Users} title="No users in this portal" desc="No accounts found for this portal yet." />
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {portalUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F3F0FF] text-[#6D4CFF] text-[10px] font-bold flex-shrink-0">{u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{u.name}</div>
                        <div className="text-[10px] text-gray-400 truncate">{u.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="info" className="text-[8px] capitalize">{u.role}</Badge>
                      <span className="text-[9px] text-gray-400 whitespace-nowrap">{fmtAgo(u.created)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Portal Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPicker(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Browse Portal Users</h3>
              <button onClick={() => setShowPicker(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={15} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(PORTAL_META).map((meta) => {
                const Icon = meta.icon;
                const count = stat(Object.keys(PORTAL_META).find(k => PORTAL_META[k] === meta) || '');
                return (
                  <motion.button key={meta.name} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                    onClick={() => { const key = Object.keys(PORTAL_META).find(k => PORTAL_META[k] === meta)!; setShowPicker(false); openPortalUsers({ key, name: meta.name }); }}
                    className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#6D4CFF]/40 transition-all text-left">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: meta.bg, color: meta.color }}><Icon size={16} /></div>
                    <div className="text-xs font-bold">{meta.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{fmtNum(count)} users</div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Security Activity Modal */}
      {showLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogs(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Security Activity</h3>
              <button onClick={() => setShowLogs(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={15} /></button>
            </div>
            {recentLogs.length === 0 ? (
              <EmptyState icon={FileText} title="No recent security events" desc="Important security activity recorded across organisations will appear here." />
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {recentLogs.map((log: any) => (
                  <div key={log.id} className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severityDot(log.severity)}`} />
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold truncate">{log.action}</div>
                        <div className="text-[9px] text-gray-400 truncate">{log.user || 'Unknown admin'}</div>
                        <div className="text-[9px] text-gray-400 truncate font-mono">{log.ip ? `IP ${log.ip}` : log.entityType}</div>
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
          </motion.div>
        </div>
      )}
    </div>
  );
}
