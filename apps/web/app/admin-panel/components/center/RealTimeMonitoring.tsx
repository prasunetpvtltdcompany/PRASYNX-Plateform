'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Watch, Server, Database, Cloud, Wifi, Cpu, HardDrive,
  AlertTriangle, CheckCircle2, XCircle, Clock, ArrowUpRight, RefreshCw,
  Download, BarChart3, LineChart as LineChartIcon, PieChart, TrendingUp,
  Users, Zap, Globe, Shield, Bell, Eye, Filter, ChevronDown,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', accent: '#A855F7', purple: '#7C3AED' };

const services = [
  { name: 'API Gateway', status: 'operational', uptime: 99.99, latency: '12ms', requests: '2.4K/min', icon: Server },
  { name: 'Database Cluster', status: 'operational', uptime: 99.97, latency: '4ms', requests: '8.1K/min', icon: Database },
  { name: 'Cloud Storage', status: 'operational', uptime: 99.95, latency: '18ms', requests: '1.2K/min', icon: Cloud },
  { name: 'Authentication', status: 'operational', uptime: 99.99, latency: '8ms', requests: '3.5K/min', icon: Shield },
  { name: 'WebSocket Server', status: 'operational', uptime: 99.93, latency: '6ms', requests: '5.7K/min', icon: Wifi },
  { name: 'Cache Layer', status: 'warning', uptime: 99.85, latency: '2ms', requests: '12.3K/min', icon: Zap },
  { name: 'Message Queue', status: 'operational', uptime: 99.98, latency: '5ms', requests: '4.8K/min', icon: Activity },
  { name: 'Search Index', status: 'operational', uptime: 99.92, latency: '22ms', requests: '0.9K/min', icon: Cpu },
];

const cpuHistory = [
  { time: '00:00', CPU: 45, Memory: 62, Disk: 78, Network: 35 },
  { time: '04:00', CPU: 32, Memory: 58, Disk: 76, Network: 22 },
  { time: '08:00', CPU: 78, Memory: 82, Disk: 80, Network: 68 },
  { time: '12:00', CPU: 92, Memory: 88, Disk: 82, Network: 85 },
  { time: '16:00', CPU: 85, Memory: 84, Disk: 81, Network: 79 },
  { time: '20:00', CPU: 52, Memory: 68, Disk: 79, Network: 45 },
];

const alerts = [
  { type: 'warning', message: 'Cache hit ratio dropped below 85%', time: '2 min ago', priority: 'medium' },
  { type: 'info', message: 'Database backup completed successfully', time: '15 min ago', priority: 'low' },
  { type: 'error', message: 'Search index rebuild triggered on primary node', time: '1 hour ago', priority: 'high' },
  { type: 'success', message: 'API Gateway auto-scaled to 6 instances', time: '2 hours ago', priority: 'low' },
  { type: 'warning', message: 'Memory usage exceeded 85% on app-server-3', time: '3 hours ago', priority: 'medium' },
];

const kpis = [
  { icon: Server, label: 'Active Services', value: '8/8', sub: 'All services operational', color: COLORS.success, bg: '#F0FDF4', trend: '100%' },
  { icon: Activity, label: 'Avg Response Time', value: '14ms', sub: '-2ms from yesterday', color: COLORS.primary, bg: '#F3F0FF', trend: '-12.5%' },
  { icon: Users, label: 'Concurrent Users', value: '24,580', sub: 'Peak: 38,200 at 12:00', color: COLORS.info, bg: '#EFF6FF', trend: '+8.3%' },
  { icon: TrendingUp, label: 'Request Volume', value: '38.9K/min', sub: '+12% from last hour', color: COLORS.warning, bg: '#FFFBEB', trend: '+12%' },
  { icon: Cpu, label: 'CPU Utilization', value: '67%', sub: 'Peak: 92% at 12:00', color: COLORS.accent, bg: '#FAF5FF', trend: 'Normal' },
  { icon: Globe, label: 'Global Latency', value: '32ms', sub: 'Avg across all regions', color: COLORS.danger, bg: '#FEF2F2', trend: 'Stable' },
];

export default function RealTimeMonitoring() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredServices = activeFilter === 'all' ? services : services.filter(s => s.status === activeFilter);

  return (
    <div>
      {/* Hero */}
      <div className="hero-section relative overflow-hidden rounded-3xl p-6 md:p-8 xl:p-8 mb-8 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.2)] min-h-[340px] md:min-h-[360px] xl:h-[380px] xl:max-h-[380px] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-8%] right-[-8%] w-[55%] h-[60%] bg-[#3B82F6]/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[40%] bg-[#22C55E]/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span></span>
              Live Monitoring Active
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl xl:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight">
            Real-Time Platform Monitoring
          </h1>
          <p className="text-xs md:text-sm text-white/80 max-w-2xl leading-relaxed mb-4">
            Live infrastructure monitoring, service health, performance metrics, and system alerts for the entire Prasynx platform.
          </p>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md max-w-xl">
            <Activity size={14} className="text-green-300 animate-pulse flex-shrink-0" />
            <p className="text-[11px] text-white/80 leading-snug">
              All critical services operational. <span className="font-semibold text-white">8/8</span> services healthy. Avg response: <span className="font-semibold text-white">14ms</span>.
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
                <Badge variant="success" className="text-[9px]">{kpi.trend}</Badge>
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

      {/* System Resources & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">System Resource Utilization</h3>
            <Badge variant="info" className="text-[9px]">Last 24 hours</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuHistory}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} /></linearGradient>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.warning} stopOpacity={0} /></linearGradient>
                  <linearGradient id="diskGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.info} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.info} stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} />
                <Area type="monotone" dataKey="CPU" stroke={COLORS.primary} strokeWidth={2} fill="url(#cpuGrad)" name="CPU %" />
                <Area type="monotone" dataKey="Memory" stroke={COLORS.warning} strokeWidth={2} fill="url(#memGrad)" name="Memory %" />
                <Area type="monotone" dataKey="Disk" stroke={COLORS.info} strokeWidth={2} fill="url(#diskGrad)" name="Disk %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Live Alerts</h3>
            <button className="text-[#6D4CFF] text-[10px] font-semibold flex items-center gap-0.5">View All <ChevronDown size={12} /></button>
          </div>
          <div className="space-y-2.5">
            {alerts.map((alert, i) => {
              const priorityColors: Record<string, string> = { high: 'bg-red-500', medium: 'bg-yellow-500', low: 'bg-blue-500' };
              const typeIcons: Record<string, any> = { success: CheckCircle2, warning: AlertTriangle, error: XCircle, info: Bell };
              const typeColors: Record<string, string> = { success: 'text-green-600 bg-green-50', warning: 'text-yellow-600 bg-yellow-50', error: 'text-red-600 bg-red-50', info: 'text-blue-600 bg-blue-50' };
              const Icon = typeIcons[alert.type] || Bell;
              return (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[alert.type] || 'bg-gray-50 text-gray-500'}`}><Icon size={14} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-medium truncate">{alert.message}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-gray-400">{alert.time}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${priorityColors[alert.priority] || 'bg-gray-300'}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-[#F3F0FF] border border-[#6D4CFF]/10">
            <div className="flex items-center gap-2 text-[10px] text-[#6D4CFF] font-semibold">
              <RefreshCw size={12} />
              Auto-refreshing every 30s
            </div>
          </div>
        </Card>
      </div>

      {/* Service Health */}
      <Card className="p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold">Service Health Dashboard</h3>
          <div className="flex items-center gap-2">
            {['all', 'operational', 'warning', 'error'].map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${activeFilter === f ? 'bg-[#6D4CFF] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service</th><th>Status</th><th>Uptime</th><th>Latency</th><th>Requests</th><th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((svc, i) => {
                const Icon = svc.icon;
                return (
                  <tr key={i}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${svc.status === 'operational' ? 'bg-green-50 text-green-600' : svc.status === 'warning' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}><Icon size={14} /></div>
                        <span className="text-xs font-semibold">{svc.name}</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={svc.status === 'operational' ? 'success' : svc.status === 'warning' ? 'warning' : 'danger'} className="text-[9px]">
                        {svc.status === 'operational' ? 'Operational' : svc.status === 'warning' ? 'Degraded' : 'Down'}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Progress value={svc.uptime} className="w-16 h-1.5" />
                        <span className="text-[10px] font-medium">{svc.uptime}%</span>
                      </div>
                    </td>
                    <td className="text-xs font-mono text-gray-600">{svc.latency}</td>
                    <td className="text-xs text-gray-600">{svc.requests}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Eye size={13} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><RefreshCw size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Network & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Network Traffic & Latency</h3>
            <Badge variant="info" className="text-[9px]">Global</Badge>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cpuHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} />
                <Line type="monotone" dataKey="Network" stroke={COLORS.success} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.success }} name="Network (Gbps)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { icon: RefreshCw, label: 'Restart Service', desc: 'Restart a specific service' },
              { icon: Download, label: 'Export Metrics', desc: 'Download system metrics report' },
              { icon: Bell, label: 'Configure Alerts', desc: 'Set up alert thresholds' },
              { icon: BarChart3, label: 'View Analytics', desc: 'Detailed performance analytics' },
              { icon: Filter, label: 'Clear Cache', desc: 'Flush all cache layers' },
              { icon: Shield, label: 'Run Security Scan', desc: 'Check for vulnerabilities' },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <button key={i} className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F3F0FF] text-[#6D4CFF] flex-shrink-0"><Icon size={14} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold truncate">{action.label}</div>
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
