'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  IndianRupee, CreditCard, TrendingUp, Users, Download, Plus, Search, Eye,
  Settings, CheckCircle2, RefreshCw, Pencil, Trash2, X, FileText,
  Building2, CalendarDays, Banknote, Sparkles, Activity, Wallet, Receipt, ArrowRight,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { billingApi } from '../../lib/dataService';
import { useApi, LoadingSkeleton, ErrorState, EmptyState } from '../../lib/useApi';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', accent: '#A855F7' };
const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#A855F7'];

const inr = (n: number | string | undefined | null, compact = false) => {
  const num = Number(n) || 0;
  return `₹${compact
    ? new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(num)
    : new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num)}`;
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const planStatusBadge = (status: string) => {
  const map: Record<string, any> = {
    active: <Badge variant="success" className="text-[9px]">Active</Badge>,
    trialing: <Badge variant="info" className="text-[9px]">Trialing</Badge>,
    past_due: <Badge variant="warning" className="text-[9px]">Past Due</Badge>,
    cancelled: <Badge variant="danger" className="text-[9px]">Cancelled</Badge>,
    expired: <Badge variant="default" className="text-[9px]">Expired</Badge>,
  };
  return map[status] || <Badge className="text-[9px]">{status}</Badge>;
};

const invoiceStatusBadge = (status: string) => {
  const map: Record<string, any> = {
    paid: <Badge variant="success" className="text-[9px]">Paid</Badge>,
    pending: <Badge variant="warning" className="text-[9px]">Pending</Badge>,
    overdue: <Badge variant="danger" className="text-[9px]">Overdue</Badge>,
    failed: <Badge variant="danger" className="text-[9px]">Failed</Badge>,
    void: <Badge variant="default" className="text-[9px]">Void</Badge>,
  };
  return map[status] || <Badge className="text-[9px]">{status}</Badge>;
};

const paymentMethodBadge = (method: string | null) => {
  if (!method) return <span className="text-[10px] text-gray-400">—</span>;
  const map: Record<string, any> = {
    cash: <Badge variant="warning" className="text-[9px]">Cash</Badge>,
    bank_transfer: <Badge variant="success" className="text-[9px]">Bank Transfer</Badge>,
    online: <Badge variant="info" className="text-[9px]">Online</Badge>,
  };
  return map[method] || <Badge className="text-[9px] capitalize">{method}</Badge>;
};

function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const inputCls = 'w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[#6D4CFF]/20 transition-all';

export default function BillingSubscriptionManagement() {
  const [tab, setTab] = useState('overview');
  const [syncing, setSyncing] = useState(false);
  const [planModal, setPlanModal] = useState<{ open: boolean; plan: any } | null>(null);
  const [subModal, setSubModal] = useState<{ open: boolean; sub: any } | null>(null);
  const [confirmDeleteSub, setConfirmDeleteSub] = useState<{ id: string; name: string } | null>(null);
  const [deletingSub, setDeletingSub] = useState(false);
  const [confirmDeleteInv, setConfirmDeleteInv] = useState<{ id: string; number: string; org: string; kind: 'invoice' | 'transaction' } | null>(null);
  const [deletingInv, setDeletingInv] = useState(false);
  const [viewInv, setViewInv] = useState<any>(null);
  const [txnModal, setTxnModal] = useState<any>(null);
  const [invModal, setInvModal] = useState<{ open: boolean }>({ open: false });
  const [saving, setSaving] = useState(false);

  const overview = useApi<any>(() => billingApi.overview());
  const plans = useApi<any>(() => billingApi.plans());
  const subs = useApi<any>(() => billingApi.subscriptions());
  const invoices = useApi<any>(() => billingApi.invoices());
  const transactions = useApi<any>(() => billingApi.transactions());

  const [invQuery, setInvQuery] = useState('');
  const [invFilter, setInvFilter] = useState('all');
  const [subQuery, setSubQuery] = useState('');
  const [subFilter, setSubFilter] = useState('all');
  const [txnQuery, setTxnQuery] = useState('');
  const [txnFilter, setTxnFilter] = useState('all');
  const [txnStatusFilter, setTxnStatusFilter] = useState('all');
  const [txnTypeFilter, setTxnTypeFilter] = useState('all');

  const ov = overview.data || {};
  const planList = plans.data?.plans || [];
  const subList = subs.data?.subscriptions || [];
  const invList = invoices.data?.invoices || [];
  const txnList = transactions.data?.transactions || [];

  const filteredTxns = useMemo(() => {
    return txnList.filter((txn: any) => {
      if (txnFilter !== 'all' && txn.payment_method !== txnFilter) return false;
      if (txnStatusFilter !== 'all' && txn.status !== txnStatusFilter) return false;
      if (txnTypeFilter !== 'all' && (txn.transaction_type || 'subscription') !== txnTypeFilter) return false;
      const q = txnQuery.trim().toLowerCase();
      if (!q) return true;
      return String(txn.invoice_number || '').toLowerCase().includes(q)
        || String(txn.organisation_name || '').toLowerCase().includes(q)
        || String(txn.organisation_code || '').toLowerCase().includes(q)
        || String(txn.transaction_ref || '').toLowerCase().includes(q);
    });
  }, [txnList, txnQuery, txnFilter, txnStatusFilter, txnTypeFilter]);

  const filteredInvoices = useMemo(() => {
    return invList.filter((inv: any) => {
      if (invFilter !== 'all' && inv.status !== invFilter) return false;
      const q = invQuery.trim().toLowerCase();
      if (!q) return true;
      return String(inv.invoice_number).toLowerCase().includes(q)
        || String(inv.organisation_name || '').toLowerCase().includes(q);
    });
  }, [invList, invQuery, invFilter]);

  const filteredSubs = useMemo(() => {
    return subList.filter((s: any) => {
      if (subFilter !== 'all' && s.status !== subFilter) return false;
      const q = subQuery.trim().toLowerCase();
      if (!q) return true;
      return String(s.organisation_name || '').toLowerCase().includes(q)
        || String(s.plan_name || '').toLowerCase().includes(q)
        || String(s.plan_key || '').toLowerCase().includes(q);
    });
  }, [subList, subQuery, subFilter]);

  const handleSync = async () => {
    setSyncing(true);
    const res = await billingApi.reconcile();
    setSyncing(false);
    if (res.success) {
      toast.success(`Synced — ${res.data?.synced ?? 0} subscriptions, ${res.data?.invoicesCreated ?? 0} invoices created`);
      overview.refetch(); plans.refetch(); subs.refetch(); invoices.refetch(); transactions.refetch();
    } else {
      toast.error(res.error || 'Sync failed');
    }
  };

  const kpis = [
    { icon: Wallet, label: 'Monthly Revenue', value: inr(ov.monthlyRevenue ?? ov.mrr), sub: `Total ${inr(ov.totalRevenue)} billed`, color: COLORS.success, bg: '#F0FDF4' },
    { icon: CreditCard, label: 'Active Subscriptions', value: String(ov.activeSubscriptions ?? 0), sub: `${ov.trialingSubscriptions ?? 0} trialing · ${ov.pastDueSubscriptions ?? 0} past due`, color: COLORS.primary, bg: '#F3F0FF' },
    { icon: TrendingUp, label: 'Avg Revenue / Org', value: inr(ov.avgRevenuePerOrg), sub: 'Per invoiced organization', color: COLORS.info, bg: '#EFF6FF' },
    { icon: Users, label: 'New Subscriptions', value: String(ov.newSubscriptions ?? 0), sub: 'This month', color: COLORS.warning, bg: '#FFFBEB' },
  ];

  const planMap: Record<string, string> = {};
  (plans.data?.plans || []).forEach((p: any) => { planMap[p.id] = p.name; planMap[p.plan_key] = p.name; });

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6D4CFF]/10 flex items-center justify-center text-[#6D4CFF]"><IndianRupee size={20} /></div>
          <div>
            <h1>Billing & Subscriptions</h1>
            <p>Plans, subscriptions, revenue and invoices for every organization — priced in ₹.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 active:scale-[0.97] transition-all disabled:opacity-50">
            <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} /> Sync
          </button>
          <button onClick={() => setInvModal({ open: true })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.97] transition-all">
            <Plus size={14} /> Generate Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }} className="stat-card">
              <div className="flex items-start justify-between mb-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: kpi.bg, color: kpi.color }}><Icon size={18} /></div>
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
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'plans', label: 'Plans' },
          { key: 'subscriptions', label: 'Subscriptions' },
          { key: 'invoices', label: 'Invoices' },
          { key: 'transactions', label: 'Transactions' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              tab === t.key
                ? 'bg-[#6D4CFF] text-white shadow-[0_4px_12px_rgba(109,76,255,0.3)]'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#6D4CFF] hover:text-[#6D4CFF]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ============ OVERVIEW ============ */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold">Revenue Trend</h3>
                <Badge variant="info" className="text-[9px]">Last 6 months</Badge>
              </div>
              <div className="h-56">
                {overview.loading ? <LoadingSkeleton rows={1} cols={1} /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ov.revenueTrend || []}>
                      <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.success} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.success} stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => inr(v, true)} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} formatter={(v: any) => [inr(v), 'Revenue']} />
                      <Area type="monotone" dataKey="amount" stroke={COLORS.success} strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-4">Revenue Breakdown</h3>
              {overview.loading ? <LoadingSkeleton rows={3} cols={1} /> : (ov.revenueBreakdown || []).length === 0 ? (
                <EmptyState message="No invoice revenue yet" />
              ) : (
                <div className="space-y-4">
                  {(ov.revenueBreakdown || []).map((item: any, i: number) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-600">{item.plan_name}</span>
                        <span className="text-xs font-semibold">{inr(item.revenue)}</span>
                      </div>
                      <Progress value={item.percent} className="h-2" />
                      <span className="text-[9px] text-gray-400">{item.percent}% of revenue · {item.count} invoice{item.count === 1 ? '' : 's'}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Total Revenue</span>
                      <span className="text-sm font-extrabold text-[#6D4CFF]">{inr(ov.totalRevenue)}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Plan Performance */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold">Plan Performance</h3>
              <Badge variant="purple" className="text-[9px]">Live data</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Plan</th><th>Monthly Price</th><th>Yearly Price</th><th>Subscribers</th><th>Revenue (MRR)</th><th>New (last mo)</th></tr></thead>
                <tbody>
                  {(ov.planPerformance || []).map((p: any, i: number) => (
                    <tr key={i}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-xs font-semibold">{p.plan_name}</span>
                          {p.plan_key === 'professional' && <Badge variant="purple" className="text-[9px]">Popular</Badge>}
                        </div>
                      </td>
                      <td className="text-xs font-medium">{p.monthly_price ? inr(p.monthly_price) : 'Custom'}</td>
                      <td className="text-xs font-medium">{p.yearly_price ? inr(p.yearly_price) : 'Custom'}</td>
                      <td className="text-xs font-semibold">{p.subscribers}</td>
                      <td className="text-xs font-semibold">{inr(p.revenue)}</td>
                      <td>{p.growth > 0 ? <Badge variant="success" className="text-[9px]">+{p.growth}</Badge> : <span className="text-[10px] text-gray-400">—</span>}</td>
                    </tr>
                  ))}
                  {(ov.planPerformance || []).length === 0 && !overview.loading && (
                    <tr><td colSpan={6}><EmptyState message="No plan data yet — run Sync Billing Data" /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ============ PLANS ============ */}
      {tab === 'plans' && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">Subscription Plans</h3>
              <Badge variant="purple" className="text-[9px]">{planList.filter((p: any) => p.status === 'active').length} active</Badge>
            </div>
            <button onClick={() => setPlanModal({ open: true, plan: null })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.97] transition-all">
              <Plus size={14} /> Add Plan
            </button>
          </div>
          {plans.loading ? <LoadingSkeleton rows={4} cols={3} /> : plans.error ? <ErrorState message={plans.error} onRetry={plans.refetch} /> : planList.length === 0 ? (
            <EmptyState message="No plans defined" action={{ label: 'Add Plan', onClick: () => setPlanModal({ open: true, plan: null }) }} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {planList.map((p: any, i: number) => (
                <Card key={p.id} className={`p-6 relative flex flex-col ${p.plan_key === 'professional' ? 'border-2 border-[#6D4CFF] shadow-[0_8px_30px_rgba(109,76,255,0.12)]' : ''} ${p.status === 'archived' ? 'opacity-60' : ''}`}>
                  {p.plan_key === 'professional' && p.status === 'active' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#A855F7] text-white text-[9px] font-semibold whitespace-nowrap">Most Popular</div>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#F3F0FF', color: COLORS.primary }}><Sparkles size={16} /></div>
                      <div>
                        <h3 className="text-base font-bold capitalize">{p.name}</h3>
                        <div className="text-[10px] text-gray-400">{p.student_capacity >= 100000 ? 'Unlimited' : p.student_capacity.toLocaleString()} students · {p.max_admins >= 100 ? 'Unlimited' : p.max_admins} admins</div>
                      </div>
                    </div>
                    {p.status === 'archived' && <Badge variant="danger" className="text-[9px]">Archived</Badge>}
                  </div>
                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-3xl font-extrabold">{p.monthly_price ? inr(p.monthly_price) : 'Custom'}</span>
                    <span className="text-xs text-gray-400 mb-1">/month</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mb-3">
                    {p.yearly_price ? <span className="text-green-600 font-medium">{inr(p.yearly_price)}/year</span> : <span>Billed annually on request</span>} · {p.description || '—'}
                  </div>
                  <div className="space-y-2 mb-5 flex-grow">
                    {(Array.isArray(p.features) ? p.features : []).map((f: string, j: number) => (
                      <div key={j} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPlanModal({ open: true, plan: p })}
                      className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:border-[#6D4CFF] hover:text-[#6D4CFF] transition-all flex items-center justify-center gap-1.5">
                      <Pencil size={13} /> Edit
                    </button>
                    <button onClick={async () => {
                      if (!confirm(`Delete or archive "${p.name}" plan?`)) return;
                      const res = await billingApi.deletePlan(p.id);
                      if (res.success) { toast.success(res.data?.archived ? 'Plan archived' : 'Plan deleted'); plans.refetch(); overview.refetch(); }
                      else toast.error(res.error || 'Failed to delete plan');
                    }}
                      className="px-3 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-all flex items-center gap-1">
                      <Trash2 size={13} /> {p.status === 'archived' ? 'Restore' : 'Delete'}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ SUBSCRIPTIONS ============ */}
      {tab === 'subscriptions' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
                <Search size={14} className="text-gray-400" />
                <input value={subQuery} onChange={e => setSubQuery(e.target.value)} placeholder="Search by org or plan..." className="bg-transparent border-none outline-none text-xs w-44" />
              </div>
              <select value={subFilter} onChange={e => setSubFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium outline-none">
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="trialing">Trialing</option>
                <option value="past_due">Past Due</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <button onClick={() => {
              if (!filteredSubs.length) { toast.error('No data to export'); return; }
              downloadCSV('subscriptions.csv', ['Org Code', 'Organisation', 'Plan', 'Billing Cycle', 'Amount', 'Status', 'Auto Renew', 'Next Billing'],
                filteredSubs.map((s: any) => [s.organisation_code || '', s.organisation_name, s.plan_name, s.billing_cycle, inr(s.amount), s.status, s.auto_renew ? 'Yes' : 'No', formatDate(s.next_billing_date || s.current_period_end)]));
              toast.success(`Exported ${filteredSubs.length} subscriptions`);
            }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.97] transition-all"><Download size={14} /> Export</button>
          </div>
          <div className="overflow-x-auto">
            {subs.loading ? <div className="p-4"><LoadingSkeleton rows={5} cols={6} /></div> : subs.error ? <div className="p-4"><ErrorState message={subs.error} onRetry={subs.refetch} /></div> : filteredSubs.length === 0 ? (
              <div className="p-4"><EmptyState message="No subscriptions found" /></div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Org Code</th><th>Organisation</th><th>Plan</th><th>Cycle</th><th>Amount</th><th>Status</th><th>Next Billing</th><th>Auto Renew</th><th className="text-right w-[190px]">Actions</th></tr></thead>
                <tbody>
                  {filteredSubs.map((s: any) => (
                    <tr key={s.id}>
                      <td className="text-xs font-mono text-gray-500 whitespace-nowrap">{s.organisation_code || '—'}</td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#F3F0FF] flex items-center justify-center flex-shrink-0"><Building2 size={14} className="text-[#6D4CFF]" /></div>
                          <div>
                            <div className="text-xs font-semibold">{s.organisation_name}</div>
                            <div className="text-[10px] text-gray-400">{s.organisation_email || s.organisation_id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 font-semibold capitalize">{s.plan_name}</span>
                      </td>
                      <td className="text-xs font-medium capitalize">{s.billing_cycle}</td>
                      <td className="text-xs font-semibold">{inr(s.amount)}</td>
                      <td>{planStatusBadge(s.status)}</td>
                      <td className="text-xs text-gray-500">{formatDate(s.next_billing_date || s.current_period_end)}</td>
                      <td>
                        <button
                          onClick={async () => {
                            const res = await billingApi.updateSubscription(s.id, { auto_renew: !s.auto_renew });
                            if (res.success) { toast.success(`Auto-renew ${res.data?.auto_renew ? 'enabled' : 'disabled'}`); subs.refetch(); overview.refetch(); }
                            else toast.error(res.error || 'Update failed');
                          }}
                          className={`relative w-9 h-5 rounded-full transition-colors ${s.auto_renew ? 'bg-green-500' : 'bg-gray-300'}`}>
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${s.auto_renew ? 'left-4' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setSubModal({ open: true, sub: s })}
                            className="px-2.5 py-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF] flex items-center gap-1 text-[10px] font-semibold whitespace-nowrap">
                            <Settings size={13} /> Manage
                          </button>
                          <button onClick={() => setConfirmDeleteSub({ id: s.id, name: s.organisation_name })} title="Delete subscription (and its invoices)"
                            className="px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center gap-1 text-[10px] font-semibold whitespace-nowrap">
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {/* ============ INVOICES ============ */}
      {tab === 'invoices' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
                <Search size={14} className="text-gray-400" />
                <input value={invQuery} onChange={e => setInvQuery(e.target.value)} placeholder="Search invoices..." className="bg-transparent border-none outline-none text-xs w-40" />
              </div>
              <select value={invFilter} onChange={e => setInvFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium outline-none">
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="failed">Failed</option>
                <option value="void">Void</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setInvModal({ open: true })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.97] transition-all"><Plus size={14} /> Generate</button>
              <button onClick={() => {
                if (!filteredInvoices.length) { toast.error('No data to export'); return; }
              downloadCSV('invoices.csv', ['Org Code', 'Organisation', 'Invoice #', 'Amount', 'Status', 'Issue Date', 'Due Date'],
                filteredInvoices.map((inv: any) => [inv.organisation_code || '', inv.organisation_name, inv.invoice_number, inr(inv.amount), inv.status, formatDate(inv.issue_date), formatDate(inv.due_date)]));
                toast.success(`Exported ${filteredInvoices.length} invoices`);
              }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.97] transition-all"><Download size={14} /> Export</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {invoices.loading ? <div className="p-4"><LoadingSkeleton rows={5} cols={6} /></div> : invoices.error ? <div className="p-4"><ErrorState message={invoices.error} onRetry={invoices.refetch} /></div> : filteredInvoices.length === 0 ? (
              <div className="p-4"><EmptyState message="No invoices found" /></div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Org Code</th><th>Organisation</th><th>Invoice #</th><th>Amount</th><th>Status</th><th>Issue Date</th><th>Due Date</th><th className="text-right w-[140px]">Actions</th></tr></thead>
                <tbody>
                  {filteredInvoices.map((inv: any) => (
                    <tr key={inv.id}>
                      <td className="text-xs font-mono text-gray-500 whitespace-nowrap">{inv.organisation_code || '—'}</td>
                      <td className="text-xs font-medium">{inv.organisation_name}</td>
                      <td className="text-xs font-mono font-medium">{inv.invoice_number}</td>
                      <td className="text-xs font-semibold">{inr(inv.amount)}</td>
                      <td>{invoiceStatusBadge(inv.status)}</td>
                      <td className="text-xs text-gray-500">{formatDate(inv.issue_date)}</td>
                      <td className="text-xs text-gray-500">{formatDate(inv.due_date)}</td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewInv(inv)} title="View invoice"
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Eye size={13} /></button>
                          {inv.status === 'paid' && inv.paid_at && (
                            <button onClick={() => toast.info(`Paid on ${formatDate(inv.paid_at)}`)} title="Receipt" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Receipt size={13} /></button>
                          )}
                          <button onClick={() => setConfirmDeleteInv({ id: inv.id, number: inv.invoice_number, org: inv.organisation_name, kind: 'invoice' })} title="Delete invoice"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {/* ============ TRANSACTIONS ============ */}
      {tab === 'transactions' && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
                <Search size={14} className="text-gray-400" />
                <input value={txnQuery} onChange={e => setTxnQuery(e.target.value)} placeholder="Search transactions..." className="bg-transparent border-none outline-none text-xs w-44" />
              </div>
              <select value={txnFilter} onChange={e => setTxnFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium outline-none">
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="online">Online</option>
              </select>
              <select value={txnStatusFilter} onChange={e => setTxnStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium outline-none">
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="failed">Failed</option>
                <option value="void">Void</option>
              </select>
              <select value={txnTypeFilter} onChange={e => setTxnTypeFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium outline-none">
                <option value="all">All Types</option>
                <option value="subscription">Subscription</option>
                <option value="admission">Admission</option>
                <option value="exam">Exam / Assessment</option>
                <option value="miscellaneous">Miscellaneous</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setTxnModal({})}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.97] transition-all"><Plus size={14} /> Add Transaction</button>
              <button onClick={() => {
                const rows = filteredTxns;
                if (!rows.length) { toast.error('No data to export'); return; }
                downloadCSV('transactions.csv', ['Org Code', 'Organisation', 'Invoice #', 'Amount', 'Type', 'Status', 'Payment Method', 'Ref', 'Date'],
                  rows.map((t: any) => [t.organisation_code || '', t.organisation_name, t.invoice_number, inr(t.amount), t.transaction_type || 'subscription', t.status, t.payment_method || '', t.transaction_ref || '', formatDate(t.date)]));
                toast.success(`Exported ${rows.length} transactions`);
              }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.97] transition-all"><Download size={14} /> Export</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {transactions.loading ? <div className="p-4"><LoadingSkeleton rows={5} cols={6} /></div> : transactions.error ? <div className="p-4"><ErrorState message={transactions.error} onRetry={transactions.refetch} /></div> : filteredTxns.length === 0 ? (
              <div className="p-4"><EmptyState message="No transactions found" /></div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Org Code</th><th>Organisation</th><th>Invoice #</th><th>Amount</th><th>Type</th><th>Method</th><th>Status</th><th>Date</th><th className="text-right w-[130px]">Actions</th></tr></thead>
                <tbody>
                  {filteredTxns.map((txn: any) => (
                    <tr key={txn.id}>
                      <td className="text-xs font-mono text-gray-500 whitespace-nowrap">{txn.organisation_code || '—'}</td>
                      <td className="text-xs font-medium">{txn.organisation_name}</td>
                      <td className="text-xs font-mono font-medium">{txn.invoice_number}</td>
                      <td className="text-xs font-semibold">{inr(txn.amount)}</td>
                      <td><Badge variant="default" className="text-[9px] capitalize">{txn.transaction_type || 'subscription'}</Badge></td>
                      <td>{paymentMethodBadge(txn.payment_method)}</td>
                      <td>{invoiceStatusBadge(txn.status)}</td>
                      <td className="text-xs text-gray-500">{formatDate(txn.date)}</td>
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewInv(txn)} title="View transaction"
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Eye size={13} /></button>
                          <button onClick={() => setTxnModal(txn)} title="Edit transaction"
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Pencil size={13} /></button>
                          <button onClick={() => setConfirmDeleteInv({ id: txn.id, number: txn.invoice_number, org: txn.organisation_name, kind: 'transaction' })} title="Delete transaction"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {/* ============ PLAN MODAL ============ */}
      {planModal?.open && <PlanModal plan={planModal.plan} onClose={() => setPlanModal(null)} onSaved={() => { plans.refetch(); overview.refetch(); }} />}

      {/* ============ SUBSCRIPTION MODAL ============ */}
      {subModal?.open && (
        <SubModal
          sub={subModal.sub}
          plans={planList}
          onClose={() => setSubModal(null)}
          onSaved={() => { subs.refetch(); overview.refetch(); }}
        />
      )}

      {/* ============ DELETE SUBSCRIPTION CONFIRM (popup) ============ */}
      {confirmDeleteSub && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center pt-20 p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deletingSub && setConfirmDeleteSub(null)} />
          <motion.div initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold flex items-center gap-2"><span className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center"><Trash2 size={15} className="text-red-600" /></span> Delete Subscription</h3>
              <button onClick={() => setConfirmDeleteSub(null)} disabled={deletingSub} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="p-6">
              <p className="text-xs text-gray-600 leading-relaxed">
                Are you sure you want to delete the subscription for <span className="font-bold text-gray-900">{confirmDeleteSub.name}</span>?
                This will also permanently remove its invoices and cannot be undone.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button onClick={() => setConfirmDeleteSub(null)} disabled={deletingSub}
                  className="py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={async () => {
                  setDeletingSub(true);
                  const res = await billingApi.deleteSubscription(confirmDeleteSub.id);
                  setDeletingSub(false);
                  setConfirmDeleteSub(null);
                  if (res.success) { toast.success('Subscription deleted'); subs.refetch(); overview.refetch(); }
                  else toast.error(res.error || 'Delete failed');
                }} disabled={deletingSub}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-semibold hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50">
                  {deletingSub ? 'Deleting...' : 'Yes, Delete Subscription'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ============ DELETE INVOICE CONFIRM (popup) ============ */}
      {confirmDeleteInv && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center pt-20 p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deletingInv && setConfirmDeleteInv(null)} />
          <motion.div initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold flex items-center gap-2"><span className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center"><Trash2 size={15} className="text-red-600" /></span> {confirmDeleteInv.kind === 'transaction' ? 'Delete Transaction' : 'Delete Invoice'}</h3>
              <button onClick={() => setConfirmDeleteInv(null)} disabled={deletingInv} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="p-6">
              <p className="text-xs text-gray-600 leading-relaxed">
                {confirmDeleteInv.kind === 'transaction' ? (
                  <>Are you sure you want to remove the transaction for invoice <span className="font-mono font-bold text-gray-900">{confirmDeleteInv.number}</span> for <span className="font-bold text-gray-900">{confirmDeleteInv.org}</span>? The invoice will be kept and reset to pending.</>
                ) : (
                  <>Are you sure you want to delete invoice <span className="font-mono font-bold text-gray-900">{confirmDeleteInv.number}</span> for <span className="font-bold text-gray-900">{confirmDeleteInv.org}</span>?
                  This cannot be undone.</>
                )}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button onClick={() => setConfirmDeleteInv(null)} disabled={deletingInv}
                  className="py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={async () => {
                  setDeletingInv(true);
                  const res = confirmDeleteInv.kind === 'transaction'
                    ? await billingApi.deleteTransaction(confirmDeleteInv.id)
                    : await billingApi.deleteInvoice(confirmDeleteInv.id);
                  setDeletingInv(false);
                  setConfirmDeleteInv(null);
                  if (res.success) { toast.success(confirmDeleteInv.kind === 'transaction' ? 'Transaction deleted, invoice kept' : 'Invoice deleted'); invoices.refetch(); overview.refetch(); transactions.refetch(); }
                  else toast.error(res.error || 'Delete failed');
                }} disabled={deletingInv}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-semibold hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50">
                  {deletingInv ? 'Deleting...' : confirmDeleteInv.kind === 'transaction' ? 'Yes, Remove Transaction' : 'Yes, Delete Invoice'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ============ INVOICE MODAL ============ */}
      {invModal?.open && (
        <InvModal
          subscriptions={subList}
          onClose={() => setInvModal({ open: false })}
          onSaved={() => { invoices.refetch(); overview.refetch(); transactions.refetch(); }}
        />
      )}

      {/* ============ INVOICE VIEW MODAL ============ */}
      {viewInv && <InvViewModal inv={viewInv} onClose={() => setViewInv(null)} />}

      {/* ============ ADD / EDIT TRANSACTION MODAL ============ */}
      {txnModal !== null && (
        <TxnModal
          subscriptions={subList}
          invoices={invList}
          txn={txnModal?.id ? txnModal : null}
          onClose={() => setTxnModal(null)}
          onSaved={() => { transactions.refetch(); invoices.refetch(); overview.refetch(); }}
        />
      )}
    </div>
  );
}

/* ==================== PLAN MODAL ==================== */
function PlanModal({ plan, onClose, onSaved }: { plan: any; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    plan_key: plan?.plan_key || '',
    name: plan?.name || '',
    description: plan?.description || '',
    monthly_price: plan?.monthly_price ?? 0,
    yearly_price: plan?.yearly_price ?? 0,
    student_capacity: plan?.student_capacity ?? 500,
    max_admins: plan?.max_admins ?? 2,
    features: (Array.isArray(plan?.features) ? plan.features : []).join(', '),
    status: plan?.status || 'active',
  });

  const submit = async () => {
    if (!form.name.trim()) { toast.error('Plan name is required'); return; }
    if (!plan && !form.plan_key.trim()) { toast.error('Plan key is required'); return; }
    setSaving(true);
    const payload = {
      ...form,
      monthly_price: Number(form.monthly_price) || 0,
      yearly_price: Number(form.yearly_price) || 0,
      student_capacity: Number(form.student_capacity) || 0,
      max_admins: Number(form.max_admins) || 0,
      features: form.features.split(',').map((f: string) => f.trim()).filter(Boolean),
    };
    const res = plan ? await billingApi.updatePlan(plan.id, payload) : await billingApi.createPlan(payload);
    setSaving(false);
    if (res.success) { toast.success(plan ? 'Plan updated' : 'Plan created'); onSaved(); onClose(); }
    else toast.error(res.error || 'Failed to save plan');
  };

  return (
    <ModalShell title={plan ? `Edit Plan — ${plan.name}` : 'Add New Plan'} onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Plan Key {plan && <span className="text-gray-300">(locked)</span>}</label>
            <input disabled={!!plan} value={form.plan_key} onChange={e => setForm({ ...form, plan_key: e.target.value.toLowerCase().replace(/\s+/g, '_') })} placeholder="e.g. starter" className={`${inputCls} disabled:bg-gray-100 disabled:text-gray-400 capitalize`} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Plan Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Starter" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 mb-1">Description</label>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description shown on plan card" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Monthly Price (₹)</label>
            <input type="number" value={form.monthly_price} onChange={e => setForm({ ...form, monthly_price: e.target.value })} placeholder="e.g. 1999" className={inputCls} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Yearly Price (₹)</label>
            <input type="number" value={form.yearly_price} onChange={e => setForm({ ...form, yearly_price: e.target.value })} placeholder="e.g. 19990" className={inputCls} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Student Capacity</label>
            <input type="number" value={form.student_capacity} onChange={e => setForm({ ...form, student_capacity: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Max Admin Accounts</label>
            <input type="number" value={form.max_admins} onChange={e => setForm({ ...form, max_admins: e.target.value })} className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 mb-1">Features (comma separated)</label>
          <textarea value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} rows={3} placeholder="Up to 500 students, 2 admin accounts, Email support" className={`${inputCls} resize-none`} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 mb-1">Status</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputCls}>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button onClick={submit} disabled={saving}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50">
          {saving ? 'Saving...' : plan ? 'Save Changes' : 'Create Plan'}
        </button>
      </div>
    </ModalShell>
  );
}

/* ==================== SUBSCRIPTION MODAL ==================== */
function SubModal({ sub, plans, onClose, onSaved }: { sub: any; plans: any[]; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    plan_key: sub.plan_key,
    billing_cycle: sub.billing_cycle,
    status: sub.status,
    auto_renew: sub.auto_renew,
    next_billing_date: (sub.next_billing_date || sub.current_period_end || '').slice(0, 10),
  });
  const selected = plans.find((p: any) => p.plan_key === form.plan_key);
  const preview = form.billing_cycle === 'yearly' ? selected?.yearly_price : selected?.monthly_price;

  const recomputeNextBilling = (cycle: string) => {
    const base = sub.current_period_start || sub.start_date || new Date().toISOString();
    const d = new Date(base);
    if (cycle === 'yearly') d.setMonth(d.getMonth() + 12);
    else d.setDate(d.getDate() + 30);
    setForm((f: any) => ({ ...f, billing_cycle: cycle, next_billing_date: d.toISOString().slice(0, 10) }));
  };

  const submit = async () => {
    setSaving(true);
    const res = await billingApi.updateSubscription(sub.id, { ...form, next_billing_date: form.next_billing_date ? new Date(form.next_billing_date).toISOString() : undefined });
    setSaving(false);
    if (res.success) { toast.success('Subscription updated'); onSaved(); onClose(); }
    else toast.error(res.error || 'Update failed');
  };

  return (
    <ModalShell title={`Manage Subscription — ${sub.organisation_name}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div>
            <div className="text-xs font-semibold">{sub.organisation_name}</div>
            <div className="text-[10px] text-gray-400">Current: {inr(sub.amount)} / {sub.billing_cycle} · {sub.status}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#F3F0FF] flex items-center justify-center"><CreditCard size={16} className="text-[#6D4CFF]" /></div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 mb-1">Plan</label>
          <select value={form.plan_key} onChange={e => setForm({ ...form, plan_key: e.target.value })} className={inputCls}>
            {plans.filter((p: any) => p.status === 'active' || p.plan_key === sub.plan_key).map((p: any) => (
              <option key={p.id} value={p.plan_key}>{p.name} — {p.monthly_price ? `${inr(p.monthly_price)}/mo · ${inr(p.yearly_price)}/yr` : 'Custom'}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Billing Cycle</label>
            <select value={form.billing_cycle} onChange={e => recomputeNextBilling(e.target.value)} className={inputCls}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputCls}>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past Due</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 mb-1">Next Billing Date</label>
          <input type="date" value={form.next_billing_date} onChange={e => setForm({ ...form, next_billing_date: e.target.value })} className={inputCls} />
          <p className="text-[9px] text-gray-400 mt-1">Auto-set to +30 days (monthly) or +12 months (yearly). Change it here to override.</p>
        </div>
        {selected && (
          <div className="p-3 rounded-xl bg-[#F3F0FF] border border-purple-100 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-[#6D4CFF]">New amount preview</span>
            <span className="text-sm font-extrabold text-[#6D4CFF]">{preview ? inr(preview) : 'Custom'} / {form.billing_cycle}</span>
          </div>
        )}
        <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer">
          <span className="text-xs font-semibold">Auto-renew</span>
          <button onClick={() => setForm({ ...form, auto_renew: !form.auto_renew })} className={`relative w-9 h-5 rounded-full transition-colors ${form.auto_renew ? 'bg-green-500' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.auto_renew ? 'left-4' : 'left-0.5'}`} />
          </button>
        </label>
        <button onClick={submit} disabled={saving}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </ModalShell>
  );
}

/* ==================== INVOICE MODAL ==================== */
function InvModal({ subscriptions, onClose, onSaved }: { subscriptions: any[]; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ organisation_id: '', amount: '', status: 'pending', due_days: 15, transaction_type: 'subscription' });

  const submit = async () => {
    if (!form.organisation_id) { toast.error('Select an organisation'); return; }
    const amount = Number(form.amount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    setSaving(true);
    const due = new Date();
    due.setDate(due.getDate() + (Number(form.due_days) || 15));
    const res = await billingApi.createInvoice({
      organisation_id: form.organisation_id,
      amount,
      status: form.status,
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: due.toISOString().slice(0, 10),
      transaction_type: form.transaction_type,
      items: [{ description: 'Manual invoice', amount, period: 'Manual' }],
    });
    setSaving(false);
    if (res.success) { toast.success(`Invoice ${res.data?.invoice?.invoice_number} generated`); onSaved(); onClose(); }
    else toast.error(res.error || 'Failed to generate invoice');
  };

  return (
    <ModalShell title="Generate Invoice" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 mb-1">Organisation</label>
          <select value={form.organisation_id} onChange={e => setForm({ ...form, organisation_id: e.target.value })} className={inputCls}>
            <option value="">Select organisation...</option>
            {subscriptions.map((s: any) => (
              <option key={s.id} value={s.organisation_id}>{s.organisation_name} — {s.plan_name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Amount (₹)</label>
            <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 19990" className={inputCls} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputCls}>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 mb-1">Invoice / Transaction Type</label>
          <select value={form.transaction_type} onChange={e => setForm({ ...form, transaction_type: e.target.value })} className={inputCls}>
            <option value="subscription">Subscription</option>
            <option value="admission">Admission</option>
            <option value="exam">Exam / Assessment</option>
            <option value="miscellaneous">Miscellaneous</option>
            <option value="other">Other</option>
          </select>
          <p className="text-[10px] text-gray-400 mt-1">Transactions of this type can be recorded against this invoice.</p>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 mb-1">Due in (days)</label>
          <input type="number" value={form.due_days} onChange={e => setForm({ ...form, due_days: e.target.value })} className={inputCls} />
        </div>
        <button onClick={submit} disabled={saving}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50">
          {saving ? 'Generating...' : 'Generate Invoice'}
        </button>
      </div>
    </ModalShell>
  );
}

/* ==================== INVOICE VIEW MODAL ==================== */
function InvViewModal({ inv, onClose }: { inv: any; onClose: () => void }) {
  const items = Array.isArray(inv.items) ? inv.items : [];
  const dueDisplay = (() => {
    if (inv.due_date) return formatDate(inv.due_date);
    const d = new Date(inv.issue_date || Date.now());
    d.setDate(d.getDate() + 15);
    return formatDate(d.toISOString());
  })();
  return (
    <ModalShell title={`Invoice ${inv.invoice_number}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start justify-between p-4 rounded-2xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white">
          <div>
            <div className="text-[10px] opacity-80 uppercase tracking-wider">PRASYNX Invoice</div>
            <div className="text-lg font-extrabold font-mono mt-1">{inv.invoice_number}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] opacity-80 uppercase tracking-wider">Amount</div>
            <div className="text-lg font-extrabold">{inr(inv.amount)}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-[10px] text-gray-400 font-semibold mb-1">Organisation</div>
            <div className="font-semibold">{inv.organisation_name}</div>
            <div className="text-[10px] text-gray-400 mt-0.5 font-mono">{inv.organisation_code || '—'}</div>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="text-[10px] text-gray-400 font-semibold mb-1">Status</div>
            <div>{invoiceStatusBadge(inv.status)}</div>
            <div className="text-[10px] text-gray-400 mt-1">Issued {formatDate(inv.issue_date)}</div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
          <div className="text-[10px] text-gray-400 font-semibold">Due Date</div>
          <div className="text-xs font-bold">{dueDisplay}</div>
        </div>
        {(inv.transaction_type || inv.payment_method) && (
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
            <div className="text-[10px] text-gray-400 font-semibold">Payment Details</div>
            <div className="flex justify-between text-xs"><span className="text-gray-500">Type</span><span className="font-semibold capitalize">{inv.transaction_type || 'subscription'}</span></div>
            <div className="flex justify-between text-xs"><span className="text-gray-500">Method</span><span className="font-semibold capitalize">{inv.payment_method === 'bank_transfer' ? 'Bank Transfer' : inv.payment_method || '—'}</span></div>
            {inv.transaction_ref && <div className="flex justify-between text-xs"><span className="text-gray-500">Reference</span><span className="font-mono font-semibold">{inv.transaction_ref}</span></div>}
            {inv.bank_name && <div className="flex justify-between text-xs"><span className="text-gray-500">Bank</span><span className="font-semibold">{inv.bank_name}</span></div>}
            {inv.paid_at && <div className="flex justify-between text-xs"><span className="text-gray-500">Paid on</span><span className="font-semibold">{formatDate(inv.paid_at)}</span></div>}
            {inv.notes && <div className="text-[10px] text-gray-500 mt-1">{inv.notes}</div>}
          </div>
        )}
        {items.length > 0 && (
          <div>
            <div className="text-[10px] text-gray-400 font-semibold mb-1.5">Items</div>
            <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
              {items.map((it: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 text-xs">
                  <div>
                    <div className="font-semibold">{it.description}</div>
                    <div className="text-[10px] text-gray-400">{it.period || ''}</div>
                  </div>
                  <div className="font-bold">{inr(Number(it.amount) || inv.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all">Close</button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ==================== ADD TRANSACTION MODAL ==================== */
function TxnModal({ subscriptions, invoices, txn, onClose, onSaved }: {
  subscriptions: any[];
  invoices: any[];
  txn: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(txn ? {
    organisation_id: txn.organisation_id,
    amount: txn.amount,
    payment_method: txn.payment_method || 'cash',
    transaction_ref: txn.transaction_ref || '',
    bank_name: txn.bank_name || '',
    notes: txn.notes || '',
    transaction_type: txn.transaction_type || 'subscription',
    date: (txn.date || txn.paid_at || new Date().toISOString()).slice(0, 10),
  } : {
    organisation_id: '',
    amount: '',
    payment_method: 'cash',
    transaction_ref: '',
    bank_name: '',
    notes: '',
    transaction_type: 'subscription',
    date: new Date().toISOString().slice(0, 10),
  });

  // Only orgs that already have an invoice may receive a manual transaction.
  const orgIdsWithInvoice = useMemo(() => new Set((invoices || []).map((i: any) => i.organisation_id)), [invoices]);
  const txnTypeLabels: Record<string, string> = {
    subscription: 'Subscription', admission: 'Admission', exam: 'Exam / Assessment',
    miscellaneous: 'Miscellaneous', other: 'Other',
  };
  // The transaction type comes from the organisation's invoice — it is NOT chosen here.
  const invoiceTypeFor = (orgId: string) => {
    const orgInvs = (invoices || []).filter((i: any) => i.organisation_id === orgId);
    if (!orgInvs.length) return 'subscription';
    const latest = orgInvs.slice().sort((a: any, b: any) => String(b.issue_date).localeCompare(String(a.issue_date)))[0];
    return latest.transaction_type || 'subscription';
  };
  const eligible = (subscriptions || []).filter((s: any) => orgIdsWithInvoice.has(s.organisation_id));
  const orgLabel = (id: string) => {
    const s = (subscriptions || []).find((x: any) => x.organisation_id === id);
    return s ? `${s.organisation_code ? `${s.organisation_code} — ` : ''}${s.organisation_name}` : id.slice(0, 8);
  };

  const submit = async () => {
    if (!form.organisation_id) { toast.error('Select an organisation'); return; }
    if (!orgIdsWithInvoice.has(form.organisation_id)) { toast.error('This organisation has no invoice yet. Generate an invoice first.'); return; }
    const amount = Number(form.amount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    setSaving(true);
    const payload = {
      organisation_id: form.organisation_id,
      amount,
      payment_method: form.payment_method,
      transaction_ref: form.transaction_ref || null,
      bank_name: form.bank_name || null,
      notes: form.notes || null,
      transaction_type: form.transaction_type,
      paid_at: form.date,
    };
    const res = txn
      ? await billingApi.updateTransaction(txn.id, payload)
      : await billingApi.recordTransaction(payload);
    setSaving(false);
    if (res.success) { toast.success(txn ? 'Transaction updated' : `Transaction recorded — ${res.data?.transaction?.invoice_number}`); onSaved(); onClose(); }
    else toast.error(res.error || 'Failed to save transaction');
  };

  return (
    <ModalShell title={txn ? `Edit Transaction — ${txn.invoice_number}` : 'Add Transaction'} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 mb-1">Organisation</label>
          {txn ? (
            <div className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold">{orgLabel(form.organisation_id)}</div>
          ) : (
            <select value={form.organisation_id} onChange={e => setForm({ ...form, organisation_id: e.target.value, transaction_type: invoiceTypeFor(e.target.value) })} className={inputCls}>
              <option value="">Select organisation...</option>
              {eligible.map((s: any) => {
                const t = invoiceTypeFor(s.organisation_id);
                return (
                  <option key={s.id} value={s.organisation_id}>
                    {s.organisation_code ? `${s.organisation_code} — ` : ''}{s.organisation_name} · {txnTypeLabels[t] || t}
                  </option>
                );
              })}
            </select>
          )}
          {!txn && eligible.length === 0 && <p className="text-[10px] text-amber-600 mt-1">No organisation with an invoice yet. Generate an invoice first to add transactions.</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Amount (₹)</label>
            <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 7999" className={inputCls} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Transaction Date</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 mb-1">Transaction Type</label>
          <select value={form.transaction_type} disabled className={`${inputCls} opacity-70 cursor-not-allowed`}>
            <option value="subscription">Subscription</option>
            <option value="admission">Admission</option>
            <option value="exam">Exam / Assessment</option>
            <option value="miscellaneous">Miscellaneous</option>
            <option value="other">Other Purpose</option>
          </select>
          <p className="text-[10px] text-gray-400 mt-1">Set from the organisation's invoice — select the invoice type when generating it.</p>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 mb-1">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {[['cash', 'Cash'], ['bank_transfer', 'Bank Transfer'], ['online', 'Online']].map(([val, label]) => (
              <button key={val} type="button" onClick={() => setForm({ ...form, payment_method: val })}
                className={`py-2 rounded-xl border text-[11px] font-semibold transition-all ${form.payment_method === val ? 'border-[#6D4CFF] bg-[#F3F0FF] text-[#6D4CFF]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {form.payment_method === 'bank_transfer' && (
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 mb-1">Bank Name</label>
            <input type="text" value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} placeholder="e.g. HDFC Bank" className={inputCls} />
          </div>
        )}
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 mb-1">Transaction Reference {form.payment_method === 'cash' ? '(optional)' : ''}</label>
          <input type="text" value={form.transaction_ref} onChange={e => setForm({ ...form, transaction_ref: e.target.value })} placeholder="e.g. UPTR / NEFT ref / receipt no." className={inputCls} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 mb-1">Notes</label>
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Optional notes..." className={`${inputCls} resize-none`} />
        </div>
        <button onClick={submit} disabled={saving}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50">
          {saving ? 'Saving...' : txn ? 'Save Changes' : 'Record Transaction'}
        </button>
      </div>
    </ModalShell>
  );
}

/* ==================== MODAL SHELL ==================== */
function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <h3 className="text-sm font-bold">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}
