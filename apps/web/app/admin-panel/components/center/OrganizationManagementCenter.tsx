'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Users, Key, TrendingUp, Plus, Search, Filter, Download,
  Eye, Settings, ArrowUpDown, ChevronRight, ChevronLeft, ChevronFirst, ChevronLast,
  ShieldCheck, BarChart3, Globe, Mail, Phone, MapPin, CalendarDays,
  CheckCircle2, AlertTriangle, Clock, ExternalLink, RefreshCw, Trash2,
  Award, DollarSign, Percent, Sparkles, UserPlus, Activity, ArrowUpRight,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Progress } from '../ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart as RePieChart, Pie, Cell,
} from 'recharts';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', accent: '#A855F7' };
const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#A855F7'];

const planDistribution = [
  { name: 'Enterprise', value: 280, color: COLORS.primary },
  { name: 'Professional', value: 520, color: COLORS.success },
  { name: 'Starter', value: 448, color: COLORS.warning },
];

const orgGrowthData = [
  { month: 'Jan', total: 1120, new: 45 },
  { month: 'Feb', total: 1150, new: 52 },
  { month: 'Mar', total: 1185, new: 48 },
  { month: 'Apr', total: 1210, new: 55 },
  { month: 'May', total: 1240, new: 62 },
  { month: 'Jun', total: 1248, new: 58 },
];

export default function OrganizationManagementCenter() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedOrgs, setSelectedOrgs] = useState<number[]>([]);
  const pageSize = 5;

  const filteredOrgs = ([] as any[]).filter((o: any) => {
    const matchesSearch = o.name.toLowerCase().includes(search.toLowerCase()) || o.owner.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || o.status === filter;
    return matchesSearch && matchesFilter;
  });
  const totalPages = Math.ceil(filteredOrgs.length / pageSize);
  const paginatedOrgs = filteredOrgs.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      {/* Hero */}
      <div className="hero-section relative overflow-hidden rounded-3xl p-6 md:p-8 xl:p-8 mb-8 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.2)] min-h-[340px] md:min-h-[360px] xl:h-[380px] xl:max-h-[380px] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-8%] w-[50%] h-[55%] bg-[#A855F7]/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-8%] left-[-5%] w-[35%] h-[40%] bg-[#22C55E]/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 backdrop-blur-sm">
              <span className="text-[10px] font-semibold text-white/80 tracking-wide">ORGANIZATION MANAGEMENT</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl xl:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight">
            Organization Management Center
          </h1>
          <p className="text-xs md:text-sm text-white/80 max-w-2xl leading-relaxed mb-4">
            Centralized hub for managing all organizations, plans, memberships, and organizational analytics across the platform.
          </p>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md max-w-xl">
            <Sparkles size={14} className="text-purple-300 animate-pulse flex-shrink-0" />
            <p className="text-[11px] text-white/80 leading-snug">
              <span className="font-semibold text-white">1,248</span> organizations active. <span className="font-semibold text-white">930</span> verified. <span className="font-semibold text-white">Enterprise</span> plans growing 18% MoM.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Building2, label: 'Total Organizations', value: '1,248', sub: '+14.2% from last month', color: COLORS.primary, bg: '#F3F0FF', trend: '+14.2%' },
          { icon: Users, label: 'Total Members', value: '284,500', sub: 'Across all organizations', color: COLORS.success, bg: '#F0FDF4', trend: '+9.8%' },
          { icon: Award, label: 'Verified Orgs', value: '930', sub: '74.5% verification rate', color: COLORS.warning, bg: '#FFFBEB', trend: '74.5%' },
          { icon: TrendingUp, label: 'Avg Org Size', value: '228', sub: 'Users per organization', color: COLORS.info, bg: '#EFF6FF', trend: 'Stable' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }} className="stat-card">
              <div className="flex items-start justify-between mb-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg, color: kpi.color }}><Icon size={18} /></div>
                <Badge variant="success" className="text-[9px]">{kpi.trend}</Badge>
              </div>
              <div className="mt-2">
                <div className="text-[11px] text-gray-500 font-medium">{kpi.label}</div>
                <div className="text-xl font-extrabold mt-0.5">{kpi.value}</div>
                <div className="text-[9px] text-gray-400 mt-0.5">{kpi.sub}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Organization Growth Trend</h3>
            <Badge variant="info" className="text-[9px]">Monthly</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={orgGrowthData}>
                <defs><linearGradient id="orgTrendGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.25} /><stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} />
                <Area type="monotone" dataKey="total" stroke={COLORS.primary} strokeWidth={2} fill="url(#orgTrendGrad)" name="Total" />
                <Area type="monotone" dataKey="new" stroke={COLORS.success} strokeWidth={2} fill="none" strokeDasharray="4 3" name="New" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">Plan Distribution</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {PIE_COLORS.map((clr, idx) => <Cell key={idx} fill={clr} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} />
              </RePieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {planDistribution.map((l, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-500"><div className="w-2 h-2 rounded-full" style={{ background: l.color }} />{l.name}</div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Organization Table */}
      <Card className="overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
              <Search size={14} className="text-gray-400" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or owner..." className="bg-transparent border-none outline-none text-xs flex-1" />
            </div>
            <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium outline-none focus:border-[#6D4CFF]">
              <option value="all">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.97] transition-all"><Plus size={14} /> Add Organization</button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-all"><Download size={14} /> Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th className="w-10"><input type="checkbox" className="rounded" /></th>
              <th>Organization <ArrowUpDown size={11} className="inline ml-1 opacity-50" /></th>
              <th>Owner</th>
              <th>Members</th>
              <th>Plan</th>
              <th>Region</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr></thead>
            <tbody>
              {paginatedOrgs.map(org => (
                <tr key={org.id}>
                  <td><input type="checkbox" className="rounded" /></td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#6D4CFF] font-bold text-xs">{(org.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2))}</div>
                      <div><div className="text-xs font-semibold">{org.name}</div><div className="text-[10px] text-gray-400">{org.email}</div></div>
                    </div>
                  </td>
                  <td className="text-xs text-gray-600">{org.owner}</td>
                  <td className="text-xs font-medium">{org.members.toLocaleString()}</td>
                  <td>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${org.plan === 'Enterprise' ? 'bg-purple-50 text-purple-600' : org.plan === 'Professional' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>{org.plan}</span>
                  </td>
                  <td className="text-xs text-gray-500">{org.region}</td>
                  <td><Badge variant={org.status === 'verified' ? 'success' : 'warning'} className="text-[9px]">{org.status}</Badge></td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Eye size={13} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Settings size={13} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#EF4444]"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrgs.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-[11px] text-gray-400">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredOrgs.length)} of {filteredOrgs.length}</span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronFirst size={14} /></button>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14} /></button>
              <span className="text-xs font-medium px-3 py-1 rounded-lg bg-[#F3F0FF] text-[#6D4CFF]">{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14} /></button>
              <button disabled={page === totalPages} onClick={() => setPage(totalPages)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLast size={14} /></button>
            </div>
          </div>
        )}
      </Card>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">Top Growing Organizations</h3>
          <div className="space-y-3">
            {([] as any[]).slice(0, 4).map((org: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#6D4CFF] font-bold text-[10px]">{org.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold truncate">{org.name}</div>
                  <div className="text-[9px] text-gray-400">{org.users.toLocaleString()} users</div>
                </div>
                <Badge variant="success" className="text-[9px]">+0%</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { icon: UserPlus, label: 'Bulk Invite Members', desc: 'Invite multiple users to organizations' },
              { icon: RefreshCw, label: 'Sync Organization Data', desc: 'Force sync all org data across portals' },
              { icon: BarChart3, label: 'Generate Org Report', desc: 'Export comprehensive org analytics' },
              { icon: ShieldCheck, label: 'Verify Pending Orgs', desc: 'Review and verify pending organizations' },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <button key={i} className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F3F0FF] text-[#6D4CFF] flex-shrink-0"><Icon size={14} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold truncate">{action.label}</div>
                    <div className="text-[9px] text-gray-400 truncate">{action.desc}</div>
                  </div>
                  <ArrowUpRight size={12} className="text-gray-300 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">Pending Actions</h3>
          <div className="space-y-2.5">
            {[
              { label: 'Unverified Organizations', value: '318', color: COLORS.warning },
              { label: 'Pending Plan Upgrades', value: '45', color: COLORS.info },
              { label: 'Support Tickets Open', value: '12', color: COLORS.danger },
              { label: 'Data Sync Requests', value: '8', color: COLORS.primary },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-600">{item.label}</span>
                <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
