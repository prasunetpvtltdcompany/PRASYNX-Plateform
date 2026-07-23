'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, GraduationCap, UserCheck, UserCog, School, Briefcase,
  Search, Filter, Plus, Download, Eye, Settings, Trash2,
  ChevronRight, ChevronLeft, ChevronFirst, ChevronLast, ArrowUpDown,
  Mail, Phone, MapPin, CalendarDays, Clock, CheckCircle2,
  AlertTriangle, TrendingUp, BarChart3, Sparkles, Activity,
  Shield, Globe, Lock, UserPlus, ExternalLink, RefreshCw, ArrowUpRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart as RePieChart, Pie, Cell,
} from 'recharts';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', accent: '#A855F7' };
const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#A855F7'];

const userTypeDistribution = [
  { name: 'Students', value: 45200, color: COLORS.success },
  { name: 'Staff', value: 8900, color: COLORS.primary },
  { name: 'Parents', value: 38500, color: COLORS.info },
  { name: 'Admins', value: 1248, color: COLORS.warning },
  { name: 'Job Providers', value: 3200, color: COLORS.accent },
  { name: 'Mobile Users', value: 28400, color: COLORS.danger },
];

const userGrowthData = [
  { month: 'Jan', Students: 42100, Staff: 8200, Parents: 35100, Mobile: 26100 },
  { month: 'Feb', Students: 43200, Staff: 8400, Parents: 36200, Mobile: 27000 },
  { month: 'Mar', Students: 44500, Staff: 8600, Parents: 37100, Mobile: 27800 },
  { month: 'Apr', Students: 45200, Staff: 8900, Parents: 38500, Mobile: 28400 },
  { month: 'May', Students: 45800, Staff: 9100, Parents: 39200, Mobile: 29100 },
  { month: 'Jun', Students: 46100, Staff: 9300, Parents: 39800, Mobile: 29500 },
];

export default function UnifiedUserManagement() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredUsers = ([] as any[]).filter((u: any) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeTab === 'all' || u.type.toLowerCase() === activeTab || u.role.toLowerCase() === activeTab;
    return matchesSearch && matchesType;
  });
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const totalUsers = userTypeDistribution.reduce((sum, t) => sum + t.value, 0);

  return (
    <div>
      {/* Hero */}
      <div className="hero-section relative overflow-hidden rounded-3xl p-6 md:p-8 xl:p-8 mb-8 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.2)] min-h-[340px] md:min-h-[360px] xl:h-[380px] xl:max-h-[380px] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-8%] left-[-5%] w-[45%] h-[50%] bg-[#A855F7]/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[45%] bg-[#3B82F6]/12 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-white/10 text-white border border-white/10 text-[10px] flex items-center gap-1.5">
              <Users size={12} /> Unified Management
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl xl:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight">
            Unified User Management
          </h1>
          <p className="text-xs md:text-sm text-white/80 max-w-2xl leading-relaxed mb-4">
            Centralized user directory spanning all portals — students, staff, parents, admins, and job providers across the entire ecosystem.
          </p>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md max-w-xl">
            <Activity size={14} className="text-green-300 animate-pulse flex-shrink-0" />
            <p className="text-[11px] text-white/80 leading-snug">
              <span className="font-semibold text-white">{totalUsers.toLocaleString()}</span> total users across <span className="font-semibold text-white">6</span> portals. <span className="font-semibold text-white">38,200</span> active right now.
            </p>
          </div>
        </div>
      </div>

      {/* User Type Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        {userTypeDistribution.map((type, i) => {
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}
              className={`rounded-2xl p-4 cursor-pointer transition-all border-2 ${activeTab === type.name.toLowerCase().replace(' ', '-') ? 'border-[#6D4CFF] shadow-lg bg-white' : 'border-transparent bg-white hover:border-gray-200 shadow-sm'}`}
              onClick={() => setActiveTab(activeTab === type.name.toLowerCase().replace(' ', '-') ? 'all' : type.name.toLowerCase().replace(' ', '-'))}>
              <div className="text-center">
                <div className="text-lg font-extrabold" style={{ color: type.color }}>{type.value.toLocaleString()}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{type.name}</div>
                <Progress value={0} className="h-1 mt-2" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* User Growth & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">User Growth Across Portals</h3>
            <Badge variant="info" className="text-[9px]">+8.7% MoM</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="studUGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.success} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.success} stopOpacity={0} /></linearGradient>
                  <linearGradient id="staffUGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} /></linearGradient>
                  <linearGradient id="parUGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.info} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.info} stopOpacity={0} /></linearGradient>
                  <linearGradient id="mobUGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.danger} stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} />
                <Area type="monotone" dataKey="Students" stroke={COLORS.success} strokeWidth={2} fill="url(#studUGrad)" name="Students" />
                <Area type="monotone" dataKey="Staff" stroke={COLORS.primary} strokeWidth={2} fill="url(#staffUGrad)" name="Staff" />
                <Area type="monotone" dataKey="Parents" stroke={COLORS.info} strokeWidth={2} fill="url(#parUGrad)" name="Parents" />
                <Area type="monotone" dataKey="Mobile" stroke={COLORS.danger} strokeWidth={2} fill="url(#mobUGrad)" name="Mobile" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">User Distribution</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={userTypeDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {PIE_COLORS.map((clr, idx) => <Cell key={idx} fill={clr} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} />
              </RePieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {userTypeDistribution.slice(0, 4).map((l, i) => (
                <div key={i} className="flex items-center gap-1 text-[9px] text-gray-500"><div className="w-2 h-2 rounded-full" style={{ background: l.color }} />{l.name}</div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* User Directory */}
      <Card className="overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
              <Search size={14} className="text-gray-400" />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search users by name, email..." className="bg-transparent border-none outline-none text-xs flex-1" />
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.97] transition-all"><UserPlus size={14} /> Add User</button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-all"><Download size={14} /> Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>User</th><th>Role</th><th>Portal</th><th>Organization</th><th>Status</th><th>Last Login</th><th className="text-right">Actions</th>
            </tr></thead>
            <tbody>
              {paginatedUsers.map((user, i) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8">
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white text-[10px] font-bold rounded-full">
                          {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                      </Avatar>
                      <div>
                        <div className="text-xs font-semibold">{user.name}</div>
                        <div className="text-[10px] text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">{user.role}</span></td>
                  <td><Badge variant={user.portal === 'Staff' ? 'info' : 'success'} className="text-[9px]">{user.portal}</Badge></td>
                  <td className="text-xs text-gray-600 max-w-[150px] truncate">{user.org}</td>
                  <td>
                    <Badge variant={user.status === 'active' ? 'success' : 'danger'} className="text-[9px]">{user.status}</Badge>
                  </td>
                  <td className="text-[10px] text-gray-400">{user.lastLogin}</td>
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
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-[11px] text-gray-400">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredUsers.length)} of {filteredUsers.length}</span>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">Active vs Inactive</h3>
          <div className="space-y-3">
            {[
              { label: 'Active Users', value: '108,248', pct: 86, color: COLORS.success },
              { label: 'Inactive Users', value: '17,300', pct: 14, color: COLORS.danger },
              { label: 'New This Month', value: '12,450', pct: 10, color: COLORS.info },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-600">{item.label}</span>
                  <span className="text-xs font-semibold" style={{ color: item.color }}>{item.value}</span>
                </div>
                <Progress value={item.pct} className="h-1.5" />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { icon: UserPlus, label: 'Create New User', desc: 'Add user to any portal' },
              { icon: RefreshCw, label: 'Sync User Data', desc: 'Force sync across all portals' },
              { icon: BarChart3, label: 'User Analytics Report', desc: 'Export comprehensive user data' },
              { icon: Shield, label: 'Manage Permissions', desc: 'Configure role-based access' },
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
          <h3 className="text-sm font-bold mb-4">User Management Stats</h3>
          <div className="space-y-2.5">
            {[
              { label: 'Total Portals', value: '6', color: COLORS.primary },
              { label: 'Roles Defined', value: '12', color: COLORS.success },
              { label: 'Pending Invites', value: '234', color: COLORS.warning },
              { label: 'Suspended Accounts', value: '56', color: COLORS.danger },
              { label: 'API Access Users', value: '1,480', color: COLORS.info },
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
