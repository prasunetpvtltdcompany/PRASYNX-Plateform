'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, CreditCard, TrendingUp, Users, Building2, Download,
  Plus, Search, Filter, Eye, Settings, ArrowUpRight, ChevronRight,
  ChevronDown, Clock, CheckCircle2, AlertTriangle, XCircle,
  BarChart3, Sparkles, Activity, RefreshCw, Shield, Globe,
  CalendarDays, FileText, ArrowUpDown, Receipt, Banknote,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  LineChart, Line, PieChart as RePieChart, Pie, Cell,
} from 'recharts';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', accent: '#A855F7' };
const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#A855F7'];

const revenueData = [
  { month: 'Jan', revenue: 124000, subscriptions: 98000, oneTime: 26000 },
  { month: 'Feb', revenue: 132000, subscriptions: 102000, oneTime: 30000 },
  { month: 'Mar', revenue: 141000, subscriptions: 108000, oneTime: 33000 },
  { month: 'Apr', revenue: 148000, subscriptions: 112000, oneTime: 36000 },
  { month: 'May', revenue: 155000, subscriptions: 118000, oneTime: 37000 },
  { month: 'Jun', revenue: 162000, subscriptions: 124000, oneTime: 38000 },
];

const planData = [
  { name: 'Enterprise', subscribers: 280, revenue: 89600, growth: 18, color: COLORS.primary },
  { name: 'Professional', subscribers: 520, revenue: 62400, growth: 12, color: COLORS.success },
  { name: 'Starter', subscribers: 448, revenue: 22400, growth: 8, color: COLORS.warning },
];

const invoices = [
  { id: 'INV-2024-001', org: 'Greenfield International School', amount: '$4,200', plan: 'Enterprise', status: 'paid', date: 'Jun 1, 2024' },
  { id: 'INV-2024-002', org: 'Riverside Academy', amount: '$2,400', plan: 'Professional', status: 'paid', date: 'Jun 1, 2024' },
  { id: 'INV-2024-003', org: 'Sunrise Valley School', amount: '$800', plan: 'Starter', status: 'paid', date: 'Jun 1, 2024' },
  { id: 'INV-2024-004', org: 'Oakridge Institute', amount: '$4,200', plan: 'Enterprise', status: 'pending', date: 'Jul 1, 2024' },
  { id: 'INV-2024-005', org: 'St. Mary\'s College', amount: '$2,400', plan: 'Professional', status: 'overdue', date: 'May 1, 2024' },
];

export default function BillingSubscriptionManagement() {
  const [billingTab, setBillingTab] = useState('overview');
  const totalMRR = revenueData[revenueData.length - 1].revenue;
  const totalSubs = planData.reduce((s, p) => s + p.subscribers, 0);

  return (
    <div>
      {/* Hero */}
      <div className="hero-section relative overflow-hidden rounded-3xl p-6 md:p-8 xl:p-8 mb-8 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.2)] min-h-[340px] md:min-h-[360px] xl:h-[380px] xl:max-h-[380px] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[50%] bg-[#A855F7]/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-8%] left-[-5%] w-[35%] h-[40%] bg-[#22C55E]/12 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-white/10 text-white border border-white/10 text-[10px] flex items-center gap-1.5">
              <CreditCard size={12} /> Billing & Subscriptions
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl xl:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight">
            Billing & Subscription Management
          </h1>
          <p className="text-xs md:text-sm text-white/80 max-w-2xl leading-relaxed mb-4">
            Manage subscription plans, billing cycles, revenue tracking, invoices, and financial analytics for all organizations.
          </p>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md max-w-xl">
            <TrendingUp size={14} className="text-green-300 flex-shrink-0" />
            <p className="text-[11px] text-white/80 leading-snug">
              MRR: <span className="font-semibold text-white">${totalMRR.toLocaleString()}</span> · <span className="font-semibold text-white">{totalSubs}</span> active subscriptions · <span className="font-semibold text-white">+8.5%</span> MoM growth
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: DollarSign, label: 'Monthly Revenue', value: `$${totalMRR.toLocaleString()}`, sub: '+8.5% from last month', color: COLORS.success, bg: '#F0FDF4', trend: '+8.5%' },
          { icon: CreditCard, label: 'Active Subscriptions', value: totalSubs.toLocaleString(), sub: 'Across all plans', color: COLORS.primary, bg: '#F3F0FF', trend: '+5.2%' },
          { icon: TrendingUp, label: 'Avg Revenue/Org', value: '$130', sub: 'Per organization/month', color: COLORS.info, bg: '#EFF6FF', trend: '+3.1%' },
          { icon: Users, label: 'New Subscriptions', value: '48', sub: 'This month', color: COLORS.warning, bg: '#FFFBEB', trend: '+12%' },
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

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {['overview', 'plans', 'invoices', 'transactions'].map(tab => (
          <button key={tab} onClick={() => setBillingTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              billingTab === tab
                ? 'bg-[#6D4CFF] text-white shadow-[0_4px_12px_rgba(109,76,255,0.3)]'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#6D4CFF] hover:text-[#6D4CFF]'
            }`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Content */}
      {billingTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold">Revenue Trend</h3>
                <Badge variant="info" className="text-[9px]">Monthly</Badge>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.success} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.success} stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} />
                    <Area type="monotone" dataKey="revenue" stroke={COLORS.success} strokeWidth={2} fill="url(#revGrad)" name="Total Revenue" />
                    <Area type="monotone" dataKey="subscriptions" stroke={COLORS.primary} strokeWidth={2} fill="none" strokeDasharray="4 3" name="Subscriptions" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-4">Revenue Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: 'Subscriptions', value: '$124,000', pct: 76.5, color: COLORS.primary },
                  { label: 'One-time Fees', value: '$38,000', pct: 23.5, color: COLORS.warning },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-600">{item.label}</span>
                      <span className="text-xs font-semibold">{item.value}</span>
                    </div>
                    <Progress value={item.pct} className="h-2" />
                    <span className="text-[9px] text-gray-400">{item.pct}% of total</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Total MRR</span>
                    <span className="text-sm font-extrabold text-[#6D4CFF]">${totalMRR.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Plan Distribution */}
          <Card className="p-5">
            <h3 className="text-sm font-bold mb-4">Plan Performance</h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Plan</th><th>Subscribers</th><th>Revenue</th><th>Growth</th><th>Revenue Share</th><th className="text-right">Actions</th></tr></thead>
                <tbody>
                  {planData.map((plan, i) => (
                    <tr key={i}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: plan.color }} />
                          <span className="text-xs font-semibold">{plan.name}</span>
                        </div>
                      </td>
                      <td className="text-xs font-medium">{plan.subscribers.toLocaleString()}</td>
                      <td className="text-xs font-semibold">${plan.revenue.toLocaleString()}</td>
                      <td><Badge variant="success" className="text-[9px]">+{plan.growth}%</Badge></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Progress value={(plan.revenue / totalMRR) * 100} className="w-20 h-1.5" />
                          <span className="text-[10px] text-gray-500">{((plan.revenue / totalMRR) * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="text-right">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Settings size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Invoices Tab */}
      {billingTab === 'invoices' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
                <Search size={14} className="text-gray-400" />
                <input type="text" placeholder="Search invoices..." className="bg-transparent border-none outline-none text-xs w-40" />
              </div>
              <select className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium outline-none">
                <option>All Statuses</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Overdue</option>
              </select>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.97] transition-all"><Download size={14} /> Export</button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Invoice #</th><th>Organization</th><th>Amount</th><th>Plan</th><th>Date</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={i}>
                    <td className="text-xs font-mono font-medium">{inv.id}</td>
                    <td className="text-xs font-medium">{inv.org}</td>
                    <td className="text-xs font-semibold">{inv.amount}</td>
                    <td><span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">{inv.plan}</span></td>
                    <td className="text-xs text-gray-500">{inv.date}</td>
                    <td>
                      <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'pending' ? 'warning' : 'danger'} className="text-[9px]">{inv.status}</Badge>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Eye size={13} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Download size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Plans Tab */}
      {billingTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { name: 'Starter', price: '$29', orgs: 448, features: ['Up to 500 users', 'Basic analytics', 'Email support', 'Standard reports', '1 admin account'], popular: false },
            { name: 'Professional', price: '$99', orgs: 520, features: ['Up to 2,000 users', 'Advanced analytics', 'Priority support', 'Custom reports', '5 admin accounts', 'API access'], popular: true },
            { name: 'Enterprise', price: '$299', orgs: 280, features: ['Unlimited users', 'Full analytics suite', '24/7 dedicated support', 'Custom integrations', 'Unlimited admins', 'API + Webhooks', 'SLA guarantee'], popular: false },
          ].map((plan, i) => (
            <Card key={i} className={`p-6 relative ${plan.popular ? 'border-2 border-[#6D4CFF] shadow-[0_8px_30px_rgba(109,76,255,0.12)]' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#A855F7] text-white text-[9px] font-semibold">Most Popular</div>
              )}
              <h3 className="text-lg font-bold text-center">{plan.name}</h3>
              <div className="text-center my-4">
                <span className="text-3xl font-extrabold">{plan.price}</span>
                <span className="text-xs text-gray-400">/month</span>
              </div>
              <div className="text-center text-[11px] text-gray-500 mb-4">{plan.orgs} organizations</div>
              <div className="space-y-2 mb-6">
                {plan.features.map((f, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${plan.popular ? 'bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white shadow-[0_4px_14px_rgba(109,76,255,0.3)]' : 'border border-gray-200 text-gray-700 hover:border-[#6D4CFF]'}`}>
                {plan.popular ? 'Current Plan' : 'View Plan'}
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Transactions Tab */}
      {billingTab === 'transactions' && (
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {[
              { type: 'subscription', org: 'Greenfield International School', amount: '+$4,200', date: 'Jun 1, 2024', status: 'completed' },
              { type: 'subscription', org: 'Riverside Academy', amount: '+$2,400', date: 'Jun 1, 2024', status: 'completed' },
              { type: 'one-time', org: 'Oakridge Institute', amount: '+$1,500', date: 'May 28, 2024', status: 'completed' },
              { type: 'refund', org: 'St. Mary\'s College', amount: '-$800', date: 'May 25, 2024', status: 'completed' },
              { type: 'subscription', org: 'Sunrise Valley School', amount: '+$800', date: 'May 20, 2024', status: 'pending' },
            ].map((txn, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${txn.type === 'refund' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {txn.type === 'subscription' ? <CreditCard size={14} /> : txn.type === 'refund' ? <AlertTriangle size={14} /> : <DollarSign size={14} />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{txn.org}</div>
                    <div className="text-[10px] text-gray-400 capitalize">{txn.type} · {txn.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-bold ${txn.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{txn.amount}</div>
                  <Badge variant={txn.status === 'completed' ? 'success' : 'warning'} className="text-[9px]">{txn.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
