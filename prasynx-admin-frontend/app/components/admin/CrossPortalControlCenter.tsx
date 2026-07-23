'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, GraduationCap, UserCheck, Users, Building2, Briefcase,
  Monitor, Smartphone, Globe, Activity, ArrowUpRight, ChevronRight,
  School, BookOpen, CalendarDays, Clock, CheckCircle2, AlertTriangle,
  TrendingUp, BarChart3, Sparkles, ExternalLink, Search, Filter,
  Download, RefreshCw, Settings, Eye, ArrowUpDown, ChevronDown, Plus,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  LineChart, Line,
} from 'recharts';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', accent: '#A855F7', purple: '#7C3AED' };

const portals = [
  { id: 'student', name: 'Student Portal', icon: GraduationCap, users: 45200, active: 38200, color: COLORS.success, bg: '#F0FDF4', status: 'operational', version: '3.2.1', uptime: 99.97 },
  { id: 'staff', name: 'Staff Portal', icon: UserCheck, users: 8900, active: 7200, color: COLORS.primary, bg: '#F3F0FF', status: 'operational', version: '3.1.8', uptime: 99.95 },
  { id: 'parents', name: 'Parents Portal', icon: Users, users: 38500, active: 28100, color: COLORS.info, bg: '#EFF6FF', status: 'operational', version: '3.0.9', uptime: 99.93 },
  { id: 'admin', name: 'Admin Portal', icon: Building2, users: 1248, active: 980, color: COLORS.warning, bg: '#FFFBEB', status: 'operational', version: '2.4.1', uptime: 99.99 },
  { id: 'jobprovider', name: 'Job Provider Portal', icon: Briefcase, users: 3200, active: 2100, color: COLORS.accent, bg: '#FAF5FF', status: 'operational', version: '1.2.3', uptime: 99.89 },
  { id: 'mobile', name: 'Mobile App', icon: Smartphone, users: 28400, active: 19500, color: COLORS.danger, bg: '#FEF2F2', status: 'operational', version: '2.1.5', uptime: 99.91 },
];

const portalTraffic = [
  { hour: '00:00', Student: 3200, Staff: 890, Parents: 2100, Admin: 45, 'Job Provider': 120, Mobile: 1800 },
  { hour: '04:00', Student: 1800, Staff: 450, Parents: 980, Admin: 22, 'Job Provider': 60, Mobile: 950 },
  { hour: '08:00', Student: 28400, Staff: 5200, Parents: 18500, Admin: 620, 'Job Provider': 1400, Mobile: 12500 },
  { hour: '12:00', Student: 38200, Staff: 7200, Parents: 28100, Admin: 980, 'Job Provider': 2100, Mobile: 19500 },
  { hour: '16:00', Student: 35600, Staff: 6800, Parents: 25200, Admin: 850, 'Job Provider': 1900, Mobile: 17200 },
  { hour: '20:00', Student: 15800, Staff: 3200, Parents: 12000, Admin: 310, 'Job Provider': 780, Mobile: 8200 },
];

const crossPortalData = [
  { month: 'Jan', Students: 42100, Staff: 8200, Parents: 35100, Mobile: 26100 },
  { month: 'Feb', Students: 43200, Staff: 8400, Parents: 36200, Mobile: 27000 },
  { month: 'Mar', Students: 44500, Staff: 8600, Parents: 37100, Mobile: 27800 },
  { month: 'Apr', Students: 45200, Staff: 8900, Parents: 38500, Mobile: 28400 },
  { month: 'May', Students: 45800, Staff: 9100, Parents: 39200, Mobile: 29100 },
  { month: 'Jun', Students: 46100, Staff: 9300, Parents: 39800, Mobile: 29500 },
];

export default function CrossPortalControlCenter() {
  const [selectedPortal, setSelectedPortal] = useState<string | null>(null);

  const totalUsers = portals.reduce((sum, p) => sum + p.users, 0);
  const totalActive = portals.reduce((sum, p) => sum + p.active, 0);

  return (
    <div>
      {/* Hero */}
      <div className="hero-section relative overflow-hidden rounded-3xl p-6 md:p-8 xl:p-8 mb-8 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.2)] min-h-[340px] md:min-h-[360px] xl:h-[380px] xl:max-h-[380px] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[55%] bg-[#A855F7]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-15%] right-[-5%] w-[40%] h-[50%] bg-[#3B82F6]/15 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 backdrop-blur-sm">
              <span className="text-[10px] font-semibold text-white/80 tracking-wide">PLATFORM OVERVIEW</span>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
              All Portals Operational
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl xl:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight">
            Cross-Portal Control Center
          </h1>
          <p className="text-xs md:text-sm text-white/80 max-w-2xl leading-relaxed mb-4">
            Unified command center for monitoring and managing all Prasynx platform portals, users, and cross-portal activity.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-3">
            {[
              { label: 'Total Users', value: totalUsers.toLocaleString(), icon: Users, color: 'text-purple-300' },
              { label: 'Active Now', value: totalActive.toLocaleString(), icon: Activity, color: 'text-green-300' },
              { label: 'Portals', value: '6 Online', icon: Globe, color: 'text-blue-300' },
              { label: 'Avg Uptime', value: '99.94%', icon: TrendingUp, color: 'text-amber-300' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <Icon size={14} className={stat.color} />
                  <div>
                    <span className="text-[11px] font-semibold text-white">{stat.value}</span>
                    <span className="text-[9px] text-white/60 ml-1.5">{stat.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Portal Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {portals.map((portal, i) => {
          const Icon = portal.icon;
          const isSelected = selectedPortal === portal.id;
          return (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              onClick={() => setSelectedPortal(isSelected ? null : portal.id)}
              className={`rounded-2xl p-4 cursor-pointer transition-all duration-200 border-2 ${isSelected ? 'border-[#6D4CFF] shadow-lg' : 'border-transparent hover:border-gray-200 shadow-sm'} bg-white`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: portal.bg, color: portal.color }}><Icon size={18} /></div>
                <div>
                  <div className="text-xs font-semibold">{portal.name}</div>
                  <Badge className="text-[8px] px-1.5 py-0" variant="success" style={portal.status === 'operational' ? {} : {}}>
                    {portal.status === 'operational' ? 'Live' : 'Issues'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Users</span>
                  <span className="text-xs font-bold">{portal.users.toLocaleString()}</span>
                </div>
                <Progress value={(portal.active / portal.users) * 100} className="h-1" />
                <div className="flex items-center justify-between text-[9px] text-gray-400">
                  <span>{portal.active.toLocaleString()} active</span>
                  <span>{portal.uptime}% uptime</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Cross-Portal Activity & Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Cross-Portal User Growth</h3>
            <Badge variant="info" className="text-[9px]">+9.5% MoM</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={crossPortalData}>
                <defs>
                  <linearGradient id="studGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.success} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.success} stopOpacity={0} /></linearGradient>
                  <linearGradient id="staffGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} /></linearGradient>
                  <linearGradient id="parGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.info} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.info} stopOpacity={0} /></linearGradient>
                  <linearGradient id="mobGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.danger} stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="Students" stroke={COLORS.success} strokeWidth={2} fill="url(#studGrad)" name="Students" />
                <Area type="monotone" dataKey="Staff" stroke={COLORS.primary} strokeWidth={2} fill="url(#staffGrad)" name="Staff" />
                <Area type="monotone" dataKey="Parents" stroke={COLORS.info} strokeWidth={2} fill="url(#parGrad)" name="Parents" />
                <Area type="monotone" dataKey="Mobile" stroke={COLORS.danger} strokeWidth={2} fill="url(#mobGrad)" name="Mobile" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Live Traffic (24h Peak)</h3>
            <Badge variant="success" className="text-[9px]">Real-time</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portalTraffic} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="hour" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={35} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} />
                <Bar dataKey="Student" fill={COLORS.success} radius={[0, 4, 4, 0]} name="Student" stackId="a" />
                <Bar dataKey="Staff" fill={COLORS.primary} radius={[0, 4, 4, 0]} name="Staff" stackId="a" />
                <Bar dataKey="Parents" fill={COLORS.info} radius={[0, 4, 4, 0]} name="Parents" stackId="a" />
                <Bar dataKey="Job Provider" fill={COLORS.accent} radius={[0, 4, 4, 0]} name="Job Provider" stackId="a" />
                <Bar dataKey="Mobile" fill={COLORS.danger} radius={[0, 4, 4, 0]} name="Mobile" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Portal Metrics & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Portal Health & Metrics</h3>
            <button className="text-[#6D4CFF] text-[10px] font-semibold flex items-center gap-0.5 hover:underline">View Details <ChevronRight size={12} /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Portal</th><th>Users</th><th>Active</th><th>Uptime</th><th>Version</th><th>Status</th><th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {portals.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: p.bg, color: p.color }}><Icon size={14} /></div>
                          <span className="text-xs font-semibold">{p.name}</span>
                        </div>
                      </td>
                      <td className="text-xs font-medium">{p.users.toLocaleString()}</td>
                      <td className="text-xs text-gray-600">{p.active.toLocaleString()}</td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <Progress value={p.uptime} className="w-16 h-1.5" />
                          <span className="text-[10px] font-medium">{p.uptime}%</span>
                        </div>
                      </td>
                      <td><span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 rounded">v{p.version}</span></td>
                      <td><Badge variant="success" className="text-[9px]">Operational</Badge></td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF] transition-all"><Eye size={13} /></button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF] transition-all"><Settings size={13} /></button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF] transition-all"><ExternalLink size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">Quick Actions</h3>
          <div className="space-y-2.5">
            {[
              { icon: RefreshCw, label: 'Sync All Portals', desc: 'Force data synchronization across all portals' },
              { icon: BarChart3, label: 'Generate Cross-Portal Report', desc: 'Export comprehensive platform usage report' },
              { icon: Settings, label: 'Portal Configuration', desc: 'Manage portal settings and features' },
              { icon: Sparkles, label: 'AI Optimization', desc: 'Run AI-powered platform optimization' },
              { icon: Download, label: 'Export User Data', desc: 'Download cross-portal user analytics' },
              { icon: Activity, label: 'Health Check', desc: 'Run diagnostic on all portal services' },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <button key={i} className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F3F0FF] text-[#6D4CFF] flex-shrink-0"><Icon size={14} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{action.label}</div>
                    <div className="text-[9px] text-gray-400 truncate">{action.desc}</div>
                  </div>
                  <ArrowUpRight size={12} className="text-gray-300 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
