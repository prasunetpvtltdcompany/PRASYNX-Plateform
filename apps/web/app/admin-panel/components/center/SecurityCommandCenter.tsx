'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Lock, Fingerprint, Eye, AlertTriangle, CheckCircle2, XCircle,
  Users, Globe, Clock, Download, Search, Filter, RefreshCw,
  Activity, BarChart3, Sparkles, ArrowUpRight, ChevronRight,
  Server, Database, UserCheck, Key, Bell, Terminal, Wifi,
  Smartphone, Monitor, Mail, ShieldAlert, FileText,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Progress } from '../ui/progress';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart as RePieChart, Pie, Cell,
} from 'recharts';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', accent: '#A855F7', purple: '#7C3AED' };
const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#A855F7'];

const threatData = [
  { month: 'Jan', blocked: 1240, flagged: 340, resolved: 1180 },
  { month: 'Feb', blocked: 1180, flagged: 310, resolved: 1120 },
  { month: 'Mar', blocked: 1350, flagged: 380, resolved: 1280 },
  { month: 'Apr', blocked: 1420, flagged: 420, resolved: 1350 },
  { month: 'May', blocked: 1280, flagged: 360, resolved: 1220 },
  { month: 'Jun', blocked: 1120, flagged: 290, resolved: 1080 },
];

const recentThreats = [
  { type: 'brute-force', source: '45.33.32.156', target: 'Admin Portal', severity: 'high', time: '5 min ago', status: 'blocked' },
  { type: 'suspicious-login', source: 'Unknown device', target: 'Staff Portal', severity: 'medium', time: '18 min ago', status: 'flagged' },
  { type: 'api-abuse', source: 'API Key #3421', target: 'Job Provider API', severity: 'high', time: '42 min ago', status: 'blocked' },
  { type: 'sql-injection', source: '203.0.113.45', target: 'Student Portal', severity: 'critical', time: '2 hours ago', status: 'blocked' },
  { type: 'rate-limit', source: '198.51.100.22', target: 'Auth Service', severity: 'low', time: '3 hours ago', status: 'resolved' },
  { type: 'unauthorized-access', source: 'Mobile App v2.1', target: 'API Gateway', severity: 'medium', time: '5 hours ago', status: 'blocked' },
];

const kpis = [
  { icon: Shield, label: 'Security Score', value: '94/100', sub: 'Excellent', color: COLORS.success, bg: '#F0FDF4', trend: '+2 pts' },
  { icon: AlertTriangle, label: 'Active Threats', value: '3', sub: '2 critical, 1 medium', color: COLORS.danger, bg: '#FEF2F2', trend: '-12%' },
  { icon: Activity, label: 'Threats Blocked', value: '1,120', sub: 'This month', color: COLORS.primary, bg: '#F3F0FF', trend: '-8.5%' },
  { icon: Users, label: '2FA Enabled', value: '85.2%', sub: 'Of all admin accounts', color: COLORS.info, bg: '#EFF6FF', trend: '+5.3%' },
  { icon: Clock, label: 'Avg Response Time', value: '2.4 min', sub: 'To critical threats', color: COLORS.warning, bg: '#FFFBEB', trend: '-18%' },
  { icon: Globe, label: 'Security Audits', value: '12', sub: 'Completed this quarter', color: COLORS.accent, bg: '#FAF5FF', trend: 'On track' },
];

export default function SecurityCommandCenter() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div>
      {/* Hero */}
      <div className="hero-section relative overflow-hidden rounded-3xl p-6 md:p-8 xl:p-8 mb-8 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.2)] min-h-[340px] md:min-h-[360px] xl:h-[380px] xl:max-h-[380px] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-8%] left-[-5%] w-[40%] h-[45%] bg-[#EF4444]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[50%] bg-[#3B82F6]/12 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
              Security Posture: Strong
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl xl:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight">
            Security Command Center
          </h1>
          <p className="text-xs md:text-sm text-white/80 max-w-2xl leading-relaxed mb-4">
            Centralized security operations — threat monitoring, vulnerability management, access control, and compliance tracking.
          </p>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md max-w-xl">
            <ShieldAlert size={14} className="text-amber-300 flex-shrink-0" />
            <p className="text-[11px] text-white/80 leading-snug">
              Security score: <span className="font-semibold text-white">94/100</span> · <span className="font-semibold text-white">1,120</span> threats blocked this month · <span className="font-semibold text-white">0</span> breaches
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }} className="stat-card">
              <div className="flex items-start justify-between mb-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg, color: kpi.color }}><Icon size={18} /></div>
                <Badge variant={kpi.trend.startsWith('+') ? 'success' : kpi.trend.startsWith('-') ? 'danger' : 'info'} className="text-[9px]">{kpi.trend}</Badge>
              </div>
              <div className="mt-2">
                <div className="text-[11px] text-gray-500 font-medium">{kpi.label}</div>
                <div className="text-lg font-extrabold mt-0.5">{kpi.value}</div>
                <div className="text-[9px] text-gray-400 mt-0.5">{kpi.sub}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {['overview', 'threats', 'access-control', 'compliance'].map(tab => (
          <button key={tab} onClick={() => setActiveSection(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeSection === tab
                ? 'bg-[#6D4CFF] text-white shadow-[0_4px_12px_rgba(109,76,255,0.3)]'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#6D4CFF] hover:text-[#6D4CFF]'
            }`}>
            {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeSection === 'overview' && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
            <Card className="p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold">Threat Detection Trend</h3>
                <Badge variant="info" className="text-[9px]">Last 6 months</Badge>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={threatData}>
                    <defs>
                      <linearGradient id="blockGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.danger} stopOpacity={0} /></linearGradient>
                      <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.success} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.success} stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} />
                    <Area type="monotone" dataKey="blocked" stroke={COLORS.danger} strokeWidth={2} fill="url(#blockGrad)" name="Blocked" />
                    <Area type="monotone" dataKey="resolved" stroke={COLORS.success} strokeWidth={2} fill="url(#resGrad)" name="Resolved" />
                    <Area type="monotone" dataKey="flagged" stroke={COLORS.warning} strokeWidth={2} fill="none" strokeDasharray="4 3" name="Flagged" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-4">Security Health</h3>
              <div className="space-y-4">
                {[
                  { label: 'Endpoint Protection', value: 98, color: COLORS.success },
                  { label: 'Access Control', value: 92, color: COLORS.primary },
                  { label: 'Data Encryption', value: 100, color: COLORS.success },
                  { label: 'Audit Compliance', value: 88, color: COLORS.info },
                  { label: 'Incident Response', value: 95, color: COLORS.success },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-600">{item.label}</span>
                      <span className="text-[10px] font-semibold">{item.value}%</span>
                    </div>
                    <Progress value={item.value} className="h-1.5" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Threats */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Recent Security Events</h3>
              <button className="text-[#6D4CFF] text-[10px] font-semibold flex items-center gap-0.5 hover:underline">View All <ChevronRight size={12} /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Type</th><th>Source</th><th>Target</th><th>Severity</th><th>Time</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                <tbody>
                  {recentThreats.map((threat, i) => (
                    <tr key={i}>
                      <td>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium capitalize">{threat.type.replace(/-/g, ' ')}</span>
                      </td>
                      <td className="text-xs text-gray-600 font-mono">{threat.source}</td>
                      <td className="text-xs text-gray-600">{threat.target}</td>
                      <td>
                        <Badge variant={threat.severity === 'critical' ? 'danger' : threat.severity === 'high' ? 'warning' : 'info'} className="text-[9px]">{threat.severity}</Badge>
                      </td>
                      <td className="text-[10px] text-gray-400">{threat.time}</td>
                      <td>
                        <Badge variant={threat.status === 'blocked' ? 'danger' : threat.status === 'flagged' ? 'warning' : 'success'} className="text-[9px]">{threat.status}</Badge>
                      </td>
                      <td className="text-right">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Eye size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Threats Section */}
      {activeSection === 'threats' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Threat Intelligence Dashboard</h3>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold"><RefreshCw size={12} /> Refresh</button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold"><Download size={12} /> Export</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Threats Today', value: '47', color: COLORS.danger, icon: AlertTriangle },
              { label: 'IPs Blacklisted', value: '2,340', color: COLORS.primary, icon: Shield },
              { label: 'Rate Limiting Events', value: '890', color: COLORS.warning, icon: Activity },
              { label: 'False Positives', value: '23', color: COLORS.info, icon: CheckCircle2 },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} style={{ color: stat.color }} />
                    <span className="text-[10px] text-gray-500">{stat.label}</span>
                  </div>
                  <span className="text-lg font-extrabold" style={{ color: stat.color }}>{stat.value}</span>
                </div>
              );
            })}
          </div>
          <div className="space-y-3">
            {recentThreats.map((threat, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    threat.severity === 'critical' ? 'bg-red-50 text-red-600' :
                    threat.severity === 'high' ? 'bg-orange-50 text-orange-600' :
                    'bg-yellow-50 text-yellow-600'
                  }`}>
                    <ShieldAlert size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold capitalize">{threat.type.replace(/-/g, ' ')}</div>
                    <div className="text-[10px] text-gray-400">{threat.source} → {threat.target}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={threat.severity === 'critical' ? 'danger' : threat.severity === 'high' ? 'warning' : 'info'} className="text-[9px]">{threat.severity}</Badge>
                  <span className="text-[10px] text-gray-400">{threat.time}</span>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Eye size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Access Control */}
      {activeSection === 'access-control' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-5">
            <h3 className="text-sm font-bold mb-4">Access Control Overview</h3>
            <div className="space-y-4">
              {[
                { label: 'Admins with 2FA', value: '1,060 (85.2%)', pct: 85.2, color: COLORS.success },
                { label: 'API Keys Active', value: '48', pct: 72, color: COLORS.primary },
                { label: 'SSO Enabled Orgs', value: '892 (71.5%)', pct: 71.5, color: COLORS.info },
                { label: 'Role-Based Access', value: '12 roles defined', pct: 100, color: COLORS.success },
                { label: 'Session Timeout Enabled', value: '1,248 (100%)', pct: 100, color: COLORS.success },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-600">{item.label}</span>
                    <span className="text-[10px] font-semibold">{item.value}</span>
                  </div>
                  <Progress value={item.pct} className="h-1.5" />
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-bold mb-4">Active Sessions</h3>
            <div className="space-y-3">
              {[
                { user: 'Sarah Chen', device: 'Chrome / macOS', ip: '192.168.1.100', time: 'Active now', type: 'Admin Portal' },
                { user: 'John Mitchell', device: 'Safari / iOS', ip: '10.0.0.45', time: '2 min ago', type: 'Staff Portal' },
                { user: 'Priya Sharma', device: 'Firefox / Windows', ip: '172.16.0.88', time: '15 min ago', type: 'Admin Portal' },
                { user: 'Robert Williams', device: 'Chrome / Linux', ip: '203.0.113.50', time: '1 hour ago', type: 'API Access' },
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="w-7 h-7"><div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white text-[9px] font-bold rounded-full">{session.user.split(' ').map(n => n[0]).join('')}</div></Avatar>
                    <div>
                      <div className="text-[11px] font-semibold">{session.user}</div>
                      <div className="text-[9px] text-gray-400">{session.device}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={session.time === 'Active now' ? 'success' : 'info'} className="text-[9px]">{session.time}</Badge>
                    <div className="text-[9px] text-gray-400 mt-0.5">{session.ip}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Compliance */}
      {activeSection === 'compliance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { name: 'SOC 2 Type II', status: 'Certified', expiry: 'Dec 2025', icon: Shield, color: COLORS.success },
            { name: 'GDPR Compliance', status: 'Compliant', expiry: 'Ongoing', icon: Globe, color: COLORS.primary },
            { name: 'ISO 27001', status: 'Certified', expiry: 'Mar 2026', icon: Shield, color: COLORS.success },
            { name: 'PCI DSS', status: 'Not Applicable', expiry: 'N/A', icon: Lock, color: COLORS.warning },
          ].map((cert, i) => {
            const Icon = cert.icon;
            return (
              <Card key={i} className="p-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${cert.color}15`, color: cert.color }}><Icon size={20} /></div>
                <h3 className="text-sm font-bold mb-1">{cert.name}</h3>
                <Badge variant={cert.status === 'Certified' || cert.status === 'Compliant' ? 'success' : 'warning'} className="text-[9px] mb-2">{cert.status}</Badge>
                <div className="text-[10px] text-gray-400">Expires: {cert.expiry}</div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
