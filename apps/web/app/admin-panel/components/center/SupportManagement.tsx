'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle, MessageSquare, TicketCheck, Users, Clock, CheckCircle2,
  AlertTriangle, TrendingUp, BarChart3, Sparkles, ArrowUpRight,
  Search, Filter, Plus, Download, Eye, ChevronRight, Reply,
  Phone, Mail, MessageCircle, Star, ThumbsUp, ThumbsDown,
  Activity, Award, RefreshCw, UserCheck, Headphones,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Progress } from '../ui/progress';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart as RePieChart, Pie, Cell,
} from 'recharts';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', accent: '#A855F7' };
const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#A855F7'];

const ticketTrend = [
  { month: 'Jan', opened: 245, resolved: 220, escalation: 18 },
  { month: 'Feb', opened: 232, resolved: 215, escalation: 15 },
  { month: 'Mar', opened: 268, resolved: 245, escalation: 22 },
  { month: 'Apr', opened: 252, resolved: 238, escalation: 16 },
  { month: 'May', opened: 278, resolved: 260, escalation: 20 },
  { month: 'Jun', opened: 240, resolved: 235, escalation: 12 },
];

const tickets = [
  { id: 'TKT-001', org: 'Greenfield International School', subject: 'Unable to add new students to portal', priority: 'high', status: 'open', assignee: 'Sarah Chen', time: '2 hours ago', type: 'Technical' },
  { id: 'TKT-002', org: 'Riverside Academy', subject: 'Billing discrepancy on enterprise plan', priority: 'critical', status: 'in-progress', assignee: 'John Mitchell', time: '4 hours ago', type: 'Billing' },
  { id: 'TKT-003', org: 'Sunrise Valley School', subject: 'Request for custom report generation', priority: 'medium', status: 'open', assignee: 'Priya Sharma', time: '1 day ago', type: 'Feature Request' },
  { id: 'TKT-004', org: 'Oakridge Institute', subject: 'SSO integration not working', priority: 'high', status: 'resolved', assignee: 'Robert Williams', time: '2 days ago', type: 'Technical' },
  { id: 'TKT-005', org: 'St. Mary\'s College', subject: 'Account recovery for admin user', priority: 'medium', status: 'in-progress', assignee: 'Mary Johnson', time: '2 days ago', type: 'Account' },
  { id: 'TKT-006', org: 'Delhi Public School', subject: 'Performance degradation during peak hours', priority: 'high', status: 'open', assignee: 'Rajesh Kumar', time: '3 days ago', type: 'Technical' },
];

const kpis = [
  { icon: TicketCheck, label: 'Open Tickets', value: '24', sub: '8 critical, 12 high', color: COLORS.danger, bg: '#FEF2F2', trend: '+3' },
  { icon: CheckCircle2, label: 'Resolved Today', value: '18', sub: '92% resolution rate', color: COLORS.success, bg: '#F0FDF4', trend: '+12%' },
  { icon: Clock, label: 'Avg Response Time', value: '1.8 hrs', sub: 'For critical tickets', color: COLORS.warning, bg: '#FFFBEB', trend: '-15%' },
  { icon: Headphones, label: 'Support Agents', value: '12', sub: '3 online, 9 available', color: COLORS.primary, bg: '#F3F0FF', trend: 'On duty' },
  { icon: TrendingUp, label: 'CSAT Score', value: '4.7/5.0', sub: 'Based on 156 ratings', color: COLORS.info, bg: '#EFF6FF', trend: '+0.2' },
  { icon: Users, label: 'SLA Compliance', value: '96.8%', sub: 'Above target of 95%', color: COLORS.accent, bg: '#FAF5FF', trend: '+1.2%' },
];

const typeData = [
  { name: 'Technical Support', value: 48, color: COLORS.primary },
  { name: 'Billing Issues', value: 22, color: COLORS.warning },
  { name: 'Feature Requests', value: 18, color: COLORS.info },
  { name: 'Account Issues', value: 12, color: COLORS.accent },
];

export default function SupportManagement() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredTickets = activeFilter === 'all' ? tickets : tickets.filter(t => t.status === activeFilter);

  return (
    <div>
      {/* Hero */}
      <div className="hero-section relative overflow-hidden rounded-3xl p-6 md:p-8 xl:p-8 mb-8 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.2)] min-h-[340px] md:min-h-[360px] xl:h-[380px] xl:max-h-[380px] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-8%] right-[-5%] w-[40%] h-[50%] bg-[#A855F7]/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[40%] bg-[#3B82F6]/12 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-white/10 text-white border border-white/10 text-[10px] flex items-center gap-1.5">
              <Headphones size={12} /> Support Hub
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl xl:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight">
            Support Management
          </h1>
          <p className="text-xs md:text-sm text-white/80 max-w-2xl leading-relaxed mb-4">
            Manage support tickets, track SLAs, monitor agent performance, and ensure organization satisfaction.
          </p>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md max-w-xl">
            <Activity size={14} className="text-green-300 animate-pulse flex-shrink-0" />
            <p className="text-[11px] text-white/80 leading-snug">
              <span className="font-semibold text-white">24</span> open tickets · <span className="font-semibold text-white">18</span> resolved today · CSAT: <span className="font-semibold text-white">4.7/5.0</span>
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
                <Badge variant={kpi.label === 'Open Tickets' ? 'danger' : 'success'} className="text-[9px]">{kpi.trend}</Badge>
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Ticket Volume & Resolution</h3>
            <Badge variant="info" className="text-[9px]">Last 6 months</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ticketTrend}>
                <defs>
                  <linearGradient id="openGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} /></linearGradient>
                  <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.success} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.success} stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} />
                <Area type="monotone" dataKey="opened" stroke={COLORS.primary} strokeWidth={2} fill="url(#openGrad)" name="Opened" />
                <Area type="monotone" dataKey="resolved" stroke={COLORS.success} strokeWidth={2} fill="url(#resGrad)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">Ticket Categories</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {PIE_COLORS.map((clr, idx) => <Cell key={idx} fill={clr} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {typeData.map((l, i) => (
              <div key={i} className="flex items-center gap-1 text-[9px] text-gray-500"><div className="w-2 h-2 rounded-full" style={{ background: l.color }} />{l.name}</div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tickets Section */}
      <Card className="overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
              <Search size={14} className="text-gray-400" />
              <input type="text" placeholder="Search tickets by ID, org, subject..." className="bg-transparent border-none outline-none text-xs flex-1" />
            </div>
            <div className="flex items-center gap-2">
              {['all', 'open', 'in-progress', 'resolved'].map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${activeFilter === f ? 'bg-[#6D4CFF] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg"><Plus size={14} /> New Ticket</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Ticket</th><th>Organization</th><th>Subject</th><th>Priority</th><th>Type</th><th>Assignee</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {filteredTickets.map((ticket, i) => (
                <tr key={i}>
                  <td className="text-[11px] font-mono font-medium text-[#6D4CFF]">{ticket.id}</td>
                  <td className="text-xs font-medium">{ticket.org}</td>
                  <td className="text-xs text-gray-600 max-w-[200px] truncate">{ticket.subject}</td>
                  <td>
                    <Badge variant={ticket.priority === 'critical' ? 'danger' : ticket.priority === 'high' ? 'warning' : 'info'} className="text-[9px]">{ticket.priority}</Badge>
                  </td>
                  <td><span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">{ticket.type}</span></td>
                  <td className="text-xs text-gray-600">{ticket.assignee}</td>
                  <td>
                    <Badge variant={ticket.status === 'open' ? 'warning' : ticket.status === 'in-progress' ? 'info' : 'success'} className="text-[9px]">
                      {ticket.status === 'in-progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Eye size={13} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Reply size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Agent Performance & SLA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">Agent Performance</h3>
          <div className="space-y-3">
            {[
              { name: 'Sarah Chen', tickets: 34, rating: 4.9, status: 'online' },
              { name: 'John Mitchell', tickets: 28, rating: 4.8, status: 'online' },
              { name: 'Priya Sharma', tickets: 22, rating: 4.7, status: 'away' },
              { name: 'Robert Williams', tickets: 19, rating: 4.6, status: 'online' },
            ].map((agent, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <Avatar className="w-8 h-8"><div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white text-[9px] font-bold rounded-full">{agent.name.split(' ').map(n => n[0]).join('')}</div></Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold">{agent.name}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  </div>
                  <div className="text-[9px] text-gray-400">{agent.tickets} tickets · ⭐ {agent.rating}</div>
                </div>
                <Progress value={(agent.tickets / 40) * 100} className="w-12 h-1.5" />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">SLA Compliance</h3>
          <div className="text-center">
            <div className="text-4xl font-extrabold text-[#22C55E]">96.8%</div>
            <div className="text-xs text-gray-500 mt-1">Above target of 95%</div>
          </div>
          <div className="space-y-3 mt-4">
            {[
              { label: 'Critical (1hr)', value: 98.2, color: COLORS.success },
              { label: 'High (4hrs)', value: 95.5, color: COLORS.primary },
              { label: 'Medium (8hrs)', value: 94.0, color: COLORS.warning },
              { label: 'Low (24hrs)', value: 99.5, color: COLORS.info },
            ].map((sla, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-gray-600">{sla.label}</span>
                  <span className="text-[10px] font-semibold">{sla.value}%</span>
                </div>
                <Progress value={sla.value} className="h-1.5" />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { icon: Plus, label: 'Create Ticket', desc: 'Open a new support ticket' },
              { icon: Users, label: 'Assign Agent', desc: 'Route ticket to support agent' },
              { icon: BarChart3, label: 'Support Report', desc: 'Generate support analytics' },
              { icon: MessageCircle, label: 'Escalation Matrix', desc: 'View escalation procedures' },
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
      </div>
    </div>
  );
}
