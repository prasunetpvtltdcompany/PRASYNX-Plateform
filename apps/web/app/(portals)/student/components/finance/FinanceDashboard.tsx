'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Search, Sparkles, ChevronLeft, ChevronRight,
  Download, Clock, CheckCircle2, AlertCircle, Award, Star,
  TrendingUp, FileText, Brain, Lightbulb, CalendarDays, X, Mic,
  Target, Timer, ChevronDown, CreditCard, DollarSign,
  Receipt, Wallet, PiggyBank, ShieldCheck, GraduationCap,
  Landmark, Banknote, Zap, Gift, Trophy,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };
const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

function CounterAnimation({ value, suffix = '', duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const inc = value / (duration * 60);
    const interval = setInterval(() => {
      start += inc;
      if (start >= value) { setCount(value); clearInterval(interval); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(interval);
  }, [value, duration]);
  return <span>{count}{suffix}</span>;
}

const demoFees: any[] = [];

const demoPayments: any[] = [];

const demoScholarships: any[] = [];

const demoInvoices: any[] = [];

const demoInstallments: any[] = [];

const demoRecommendations: any[] = [];

const monthlyPaymentData = [
  { month: 'Jan', paid: 25000, pending: 0 },
  { month: 'Feb', paid: 3000, pending: 0 },
  { month: 'Mar', paid: 30000, pending: 0 },
  { month: 'Apr', paid: 67000, pending: 0 },
  { month: 'May', paid: 10000, pending: 15000 },
  { month: 'Jun', paid: 0, pending: 18000 },
];

interface FinanceDashboardProps {
  feesHook: any;
  scholarshipsHook: any;
  feesData: any[];
  scholarshipsData: any[];
  totalFees: number;
  paidFees: number;
  pendingFees: number;
}

export function FinanceDashboard({
  feesHook, scholarshipsHook, feesData, scholarshipsData,
  totalFees: tf, paidFees: pf, pendingFees: pef,
}: FinanceDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showInsights, setShowInsights] = useState(true);
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filters = ['All', 'Fees', 'Payments', 'Scholarships', 'Invoices', 'Receipts'];

  const effectiveFees = useMemo(() => {
    if (Array.isArray(feesData) && feesData.length > 0) return feesData;
    return demoFees;
  }, [feesData]);

  const effectivePayments = useMemo(() => {
    if (Array.isArray(feesData) && feesData.length > 0) {
      const payments = feesData.flatMap((f: any) => f.payments || []);
      return payments.length > 0 ? payments : demoPayments;
    }
    return demoPayments;
  }, [feesData]);

  const effectiveScholarships = useMemo(() => {
    if (Array.isArray(scholarshipsData) && scholarshipsData.length > 0) return scholarshipsData;
    return demoScholarships;
  }, [scholarshipsData]);

  const totalFees = useMemo(() => {
    if (tf > 0) return tf;
    return effectiveFees.reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
  }, [effectiveFees, tf]);

  const paidFees = useMemo(() => {
    if (pf > 0) return pf;
    return effectiveFees
      .filter((f: any) => f.status === 'paid' || f.status === 'Paid')
      .reduce((sum: number, f: any) => sum + (f.amount || 0), 0)
      + effectiveFees
        .filter((f: any) => f.status === 'partial')
        .reduce((sum: number, f: any) => sum + (f.paid_amount || 0), 0);
  }, [effectiveFees, pf]);

  const pendingFees = useMemo(() => {
    if (pef > 0 && tf > 0) return pef;
    return totalFees - paidFees;
  }, [totalFees, paidFees, pef, tf]);

  const scholarshipEarned = useMemo(() => {
    const approved = effectiveScholarships.filter((s: any) => s.status === 'approved');
    return approved.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
  }, [effectiveScholarships]);

  const feeCategories = useMemo(() => {
    const paid = effectiveFees.filter((f: any) => f.status === 'paid' || f.status === 'Paid').length;
    const partial = effectiveFees.filter((f: any) => f.status === 'partial').length;
    const pending = effectiveFees.filter((f: any) => f.status === 'pending').length;
    return [
      { name: 'Paid', value: paid, color: COLORS.success },
      { name: 'Partial', value: partial, color: COLORS.warning },
      { name: 'Pending', value: pending, color: COLORS.danger },
    ];
  }, [effectiveFees]);

  const upcomingPayments = useMemo(() => {
    return effectiveFees
      .filter((f: any) => f.status === 'pending' || f.status === 'partial')
      .sort((a: any, b: any) => {
        if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        return 0;
      });
  }, [effectiveFees]);

  const sortedPayments = useMemo(() => {
    return [...effectivePayments].sort((a: any, b: any) => {
      let cmp = 0;
      if (sortField === 'date') cmp = new Date(b.date || b.payment_date).getTime() - new Date(a.date || a.payment_date).getTime();
      else if (sortField === 'amount') cmp = (b.amount || b.amount_paid || 0) - (a.amount || a.amount_paid || 0);
      else if (sortField === 'method') cmp = (a.payment_method || '').localeCompare(b.payment_method || '');
      return sortDir === 'asc' ? -cmp : cmp;
    });
  }, [effectivePayments, sortField, sortDir]);

  const scholarshipTimeline = [
    { label: 'Applied', count: effectiveScholarships.filter((s: any) => s.applied).length, total: effectiveScholarships.length },
    { label: 'Under Review', count: effectiveScholarships.filter((s: any) => s.status === 'under_review').length, total: effectiveScholarships.length },
    { label: 'Approved', count: effectiveScholarships.filter((s: any) => s.status === 'approved').length, total: effectiveScholarships.length },
    { label: 'Rejected', count: effectiveScholarships.filter((s: any) => s.status === 'rejected').length, total: effectiveScholarships.length },
    { label: 'Received', count: effectiveScholarships.filter((s: any) => s.status === 'approved').length, total: effectiveScholarships.length },
  ];

  const SectionCard = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const payBtn = (onClick?: () => void) => (
    <button onClick={onClick} className="px-4 py-2 bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold rounded-xl hover:shadow-[0_4px_14px_rgba(109,76,255,0.3)] transition-all flex items-center gap-1.5">
      <CreditCard className="w-3.5 h-3.5" /> Pay Now
    </button>
  );

  if (feesHook?.loading) {
    return (
      <div className="space-y-6">
        <div className="page-header"><h1>Finance</h1><p>Loading financial data...</p></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-gray-100 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
              <div className="h-7 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 p-6 animate-pulse">
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (feesHook?.error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load financial data</h2>
        <p className="text-gray-500 mb-6">{feesHook.error}</p>
        <div className="flex gap-3">
          <button onClick={feesHook.refetch} className="px-6 py-2.5 bg-[#6D4CFF] text-white rounded-xl font-medium hover:bg-[#5A3FD6] transition-colors">Refresh Data</button>
          <button className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">Contact Accounts Office</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Finance & Scholarship Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Manage fees, track payments, explore scholarships, and receive AI-powered financial guidance.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 bg-white text-gray-700 outline-none focus:border-[#6D4CFF]">
            <option>2025-2026</option>
            <option>2024-2025</option>
          </select>
          <button className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] rounded-xl shadow-[0_4px_14px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_20px_rgba(109,76,255,0.4)] transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Statement
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Fees', value: totalFees, prefix: '₹', icon: CreditCard, color: COLORS.primary, bg: '#F3F0FF', sub: 'Annual fee summary' },
          { label: 'Paid Amount', value: paidFees, prefix: '₹', icon: CheckCircle2, color: COLORS.success, bg: '#F0FDF4', sub: `${totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0}% of total` },
          { label: 'Pending Fees', value: pendingFees, prefix: '₹', icon: AlertCircle, color: COLORS.danger, bg: '#FEF2F2', sub: `${upcomingPayments.length} payments due` },
          { label: 'Scholarship Earned', value: scholarshipEarned, prefix: '₹', icon: Award, color: COLORS.warning, bg: '#FFFBEB', sub: 'Amount approved' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
              className="rounded-2xl bg-white border border-gray-100 p-5 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                  <Icon size={19} style={{ color: kpi.color }} />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">
                {kpi.prefix}<CounterAnimation value={kpi.value} />
              </div>
              <div className="text-xs font-medium text-gray-500 mt-1">{kpi.label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Smart Finance Search */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 md:p-5">
          <div className="relative">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#F3F0FF] to-white border border-[#E8DFFF]">
              <Search className="w-5 h-5 text-[#6D4CFF] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search fees, invoices, scholarships, receipts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
              />
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700">
                  <Mic className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-[0_4px_12px_rgba(109,76,255,0.3)] transition-all flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Search
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 text-[10px] font-semibold rounded-full whitespace-nowrap transition-all ${
                  activeFilter === filter
                    ? 'bg-[#6D4CFF] text-white shadow-[0_2px_8px_rgba(109,76,255,0.3)]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Main Layout: 70% Left | 30% Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN (70%) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Fee Status Overview */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Fee Status Overview" subtitle="Breakdown of all fees for the current academic year">
              <div className="space-y-4">
                {effectiveFees.map((fee: any, i: number) => {
                  const isPaid = fee.status === 'paid' || fee.status === 'Paid';
                  const isPartial = fee.status === 'partial';
                  const isPending = fee.status === 'pending';
                  const paidAmt = isPaid ? fee.amount : (fee.paid_amount || 0);
                  const progress = isPaid ? 100 : isPartial ? Math.round((paidAmt / fee.amount) * 100) : 0;
                  const statusColor = isPaid ? COLORS.success : isPartial ? COLORS.warning : COLORS.danger;
                  const daysLeft = fee.due_date ? Math.ceil((new Date(fee.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
                  const feeIcons: Record<string, any> = { 'Academic': BookOpen, 'Transport': Car, 'Lab': Beaker, 'Extracurricular': Star, 'Accommodation': Home, 'Utility': Zap };
                  const Icon = feeIcons[fee.category] || CreditCard;
                  return (
                    <div key={fee.id || i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${statusColor}15` }}>
                        <Icon className="w-5 h-5" style={{ color: statusColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-900">{fee.fee_name || fee.name}</span>
                          <Badge variant={isPaid ? 'success' : isPartial ? 'warning' : 'danger'} className="text-[9px] capitalize">
                            {isPaid ? 'Paid' : isPartial ? 'Partial' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-2">
                          <span>₹{paidAmt.toLocaleString()} / ₹{fee.amount.toLocaleString()}</span>
                          {fee.due_date && !isPaid && (
                            <span className={`flex items-center gap-1 ${daysLeft <= 7 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                              <Clock className="w-3 h-3" />
                              Due: {new Date(fee.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {!isPaid && ` • ${daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}`}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${statusColor}, ${statusColor}aa)` }} />
                          </div>
                          <span className="text-[10px] font-bold" style={{ color: statusColor }}>{progress}%</span>
                        </div>
                      </div>
                      {!isPaid && (
                        <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[9px] font-semibold hover:shadow-[0_4px_12px_rgba(109,76,255,0.3)] transition-all whitespace-nowrap">
                          Pay Now
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </motion.div>

          {/* Payment History */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Payment History" subtitle="Your transaction records">
              {sortedPayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-[10px] font-semibold text-gray-400 uppercase pb-3 cursor-pointer hover:text-gray-600" onClick={() => toggleSort('date')}>
                          Date {sortField === 'date' && (sortDir === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="text-left text-[10px] font-semibold text-gray-400 uppercase pb-3">Transaction ID</th>
                        <th className="text-left text-[10px] font-semibold text-gray-400 uppercase pb-3 cursor-pointer hover:text-gray-600" onClick={() => toggleSort('method')}>
                          Method {sortField === 'method' && (sortDir === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="text-right text-[10px] font-semibold text-gray-400 uppercase pb-3 cursor-pointer hover:text-gray-600" onClick={() => toggleSort('amount')}>
                          Amount {sortField === 'amount' && (sortDir === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="text-center text-[10px] font-semibold text-gray-400 uppercase pb-3">Status</th>
                        <th className="text-right text-[10px] font-semibold text-gray-400 uppercase pb-3">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPayments.slice(0, 10).map((p: any, i: number) => {
                        const isCompleted = (p.status === 'completed' || p.status === 'Completed' || p.status === 'paid');
                        const methodIcons: Record<string, any> = { 'UPI': Smartphone, 'Net Banking': Monitor, 'Credit Card': CreditCard, 'Debit Card': CreditCard };
                        const MethodIcon = methodIcons[p.payment_method] || CreditCard;
                        return (
                          <tr key={p.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-3">
                              <span className="text-xs text-gray-700">{new Date(p.date || p.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </td>
                            <td className="py-3">
                              <span className="text-[10px] font-mono text-gray-600">{p.transaction_id || '—'}</span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1.5">
                                <MethodIcon className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-[10px] text-gray-600">{p.payment_method || '—'}</span>
                              </div>
                            </td>
                            <td className="text-right py-3">
                              <span className="text-xs font-bold text-gray-900">₹{(p.amount || p.amount_paid || 0).toLocaleString()}</span>
                            </td>
                            <td className="text-center py-3">
                              <Badge variant={isCompleted ? 'success' : 'warning'} className="text-[9px]">
                                {isCompleted ? 'Completed' : 'Pending'}
                              </Badge>
                            </td>
                            <td className="text-right py-3">
                              <button className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                                <Download className="w-3.5 h-3.5 text-gray-500" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Receipt className="w-10 h-10 text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-500">No payment records yet</p>
                  <p className="text-xs text-gray-400 mt-1">Your payment history will appear here</p>
                </div>
              )}
            </SectionCard>
          </motion.div>

          {/* Upcoming Payments */}
          {upcomingPayments.length > 0 && (
            <motion.div variants={fadeUp}>
              <SectionCard title="Upcoming Payments" subtitle={`${upcomingPayments.length} payments pending`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {upcomingPayments.map((fee: any, i: number) => {
                    const daysLeft = fee.due_date ? Math.ceil((new Date(fee.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
                    const statusColor = daysLeft <= 3 ? COLORS.danger : daysLeft <= 14 ? COLORS.warning : COLORS.success;
                    return (
                      <motion.div
                        key={fee.id || i}
                        whileHover={{ y: -2 }}
                        className="p-4 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-sm font-bold text-gray-900">{fee.fee_name || fee.name}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              Due: {fee.due_date ? new Date(fee.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </div>
                          </div>
                          <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            daysLeft <= 3 ? 'bg-red-50 text-red-600' : daysLeft <= 14 ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                          }`}>
                            {daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}
                          </div>
                        </div>
                        <div className="text-xl font-extrabold text-gray-900 mb-3">₹{(fee.amount - (fee.paid_amount || 0)).toLocaleString()}</div>
                        <div className="flex items-center gap-2">
                          <button className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[10px] font-semibold hover:shadow-[0_4px_12px_rgba(109,76,255,0.3)] transition-all">
                            Pay Now
                          </button>
                          <button className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-gray-200 transition-all">
                            Details
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* Installment Tracker */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Installment Tracker" subtitle="Fee payment installment timeline">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Overall Progress</span>
                  <span className="text-xs font-bold text-[#6D4CFF]">
                    {demoInstallments.filter(i => i.status === 'paid').length}/{demoInstallments.length} Paid
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6]" style={{ width: `${(demoInstallments.filter(i => i.status === 'paid').length / demoInstallments.length) * 100}%` }} />
                </div>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-4">
                    {demoInstallments.map((inst, i) => {
                      const isComplete = inst.status === 'paid';
                      const isUpcoming = inst.status === 'upcoming';
                      const dotColor = isComplete ? COLORS.success : isUpcoming ? COLORS.warning : COLORS.danger;
                      return (
                        <div key={i} className="flex items-start gap-4 relative">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 z-10 ${
                            isComplete ? 'bg-green-100' : isUpcoming ? 'bg-yellow-100' : 'bg-red-100'
                          }`}>
                            {isComplete ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <Clock className={`w-5 h-5 ${isUpcoming ? 'text-yellow-600' : 'text-red-600'}`} />
                            )}
                          </div>
                          <div className="flex-1 pt-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-semibold ${isComplete ? 'text-gray-900' : isUpcoming ? 'text-yellow-600' : 'text-red-600'}`}>
                                {inst.label}
                              </span>
                              <Badge variant={isComplete ? 'success' : isUpcoming ? 'warning' : 'danger'} className="text-[9px] capitalize">
                                {inst.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              ₹{inst.amount.toLocaleString()} • {new Date(inst.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            {isUpcoming && (
                              <button className="mt-2 px-3 py-1 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[9px] font-semibold hover:shadow-[0_4px_12px_rgba(109,76,255,0.3)] transition-all">
                                Pay Now
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SectionCard>
          </motion.div>

          {/* Payment Analytics */}
          <motion.div variants={fadeUp}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Payment Analytics</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Monthly payment trends and fee breakdown</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyPaymentData} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
                      <Bar dataKey="paid" fill="#22C55E" radius={[4, 4, 0, 0]} name="Paid" />
                      <Bar dataKey="pending" fill="#EF4444" radius={[4, 4, 0, 0]} name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={feeCategories} cx="50%" cy="50%" innerRadius={28} outerRadius={48} paddingAngle={3} dataKey="value">
                          {feeCategories.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {feeCategories.filter(c => c.value > 0).map((cat, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                          <span className="text-[11px] text-gray-600">{cat.name}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-gray-900">{cat.value} fees</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-gray-700">Total Fees</span>
                        <span className="text-xs font-extrabold text-gray-900">{effectiveFees.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* RIGHT COLUMN (30%) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Financial Insights */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <button onClick={() => setShowInsights(!showInsights)} className="flex items-center justify-between w-full mb-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" /> Financial Insights
                </h3>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showInsights ? 'rotate-180' : ''}`} />
              </button>
              {showInsights && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-white border border-[#E8DFFF]">
                      <div className="text-[9px] text-gray-500">Paid This Year</div>
                      <div className="text-lg font-extrabold text-[#6D4CFF] mt-0.5">₹{paidFees.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                      <div className="text-[9px] text-red-500">Pending Balance</div>
                      <div className="text-lg font-extrabold text-red-600 mt-0.5">₹{pendingFees.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-gray-500">Payment Completion</span>
                      <span className="text-[10px] font-bold text-[#6D4CFF]">{totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6]" style={{ width: `${totalFees > 0 ? (paidFees / totalFees) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Next Due Date', value: upcomingPayments.length > 0 ? new Date(upcomingPayments[0].due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No dues', icon: CalendarDays, color: COLORS.primary },
                      { label: 'Estimated Next Payment', value: upcomingPayments.length > 0 ? `₹${(upcomingPayments[0].amount - (upcomingPayments[0].paid_amount || 0)).toLocaleString()}` : '—', icon: DollarSign, color: COLORS.warning },
                      { label: 'Scholarship Benefits', value: `₹${scholarshipEarned.toLocaleString()}`, icon: Gift, color: COLORS.success },
                    ].map((item, i) => {
                      const Icn = item.icon;
                      return (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${item.color}15` }}>
                            <Icn className="w-3.5 h-3.5" style={{ color: item.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] text-gray-500">{item.label}</div>
                            <div className="text-[11px] font-semibold text-gray-900">{item.value}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Scholarship Hub */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Scholarship Hub" subtitle="Available scholarships & financial aid">
              {effectiveScholarships.length > 0 ? (
                <div className="space-y-3">
                  {effectiveScholarships.map((s: any, i: number) => {
                    const statusColors: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
                      approved: { variant: 'success', label: 'Approved' },
                      under_review: { variant: 'warning', label: 'Under Review' },
                      available: { variant: 'info', label: 'Available' },
                      rejected: { variant: 'danger', label: 'Rejected' },
                    };
                    const sc = statusColors[s.status] || { variant: 'default' as const, label: s.status };
                    const schIcons: Record<string, any> = { 'Merit': Award, 'Need-Based': Heart, 'Sports': Trophy, 'Research': Brain, 'Government': Landmark };
                    const SchIcon = schIcons[s.type] || Gift;
                    return (
                      <div key={s.id || i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${COLORS.primary}12` }}>
                            <SchIcon className="w-4 h-4 text-[#6D4CFF]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-900">{s.name}</span>
                              <Badge variant={sc.variant} className="text-[8px]">{sc.label}</Badge>
                            </div>
                            <div className="text-[9px] text-gray-500 mt-0.5">{s.provider || s.eligibility?.slice(0, 40)}</div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs font-extrabold text-gray-900">₹{(s.amount || 0).toLocaleString()}</span>
                              {s.status === 'available' && (
                                <button className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[8px] font-semibold transition-all">
                                  Apply Now
                                </button>
                              )}
                            </div>
                            {s.deadline && (
                              <div className="text-[8px] text-gray-400 mt-1">Deadline: {new Date(s.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Gift className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-xs font-medium text-gray-500">No scholarships available</p>
                  <p className="text-[9px] text-gray-400 mt-1">Check back later for new opportunities</p>
                </div>
              )}
            </SectionCard>
          </motion.div>

          {/* AI Financial Recommendations */}
          <motion.div variants={fadeUp}>
            <Card className="p-5 bg-gradient-to-br from-[#6D4CFF] to-[#4F2DB8] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-semibold">Recommended By Prerana AI</span>
                </div>
                <p className="text-[10px] text-white/70 mb-4">Personalized financial guidance</p>
                <div className="space-y-3">
                  {demoRecommendations.map((rec, i) => {
                    const priorityColor = rec.priority === 'High' ? COLORS.danger : rec.priority === 'Medium' ? COLORS.warning : COLORS.success;
                    return (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold text-white truncate">{rec.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="text-[8px] px-1.5 py-0.5" style={{ background: `${priorityColor}30`, color: '#fff', border: `1px solid ${priorityColor}50` }}>
                              {rec.priority}
                            </Badge>
                            {rec.savings !== '—' && (
                              <span className="text-[8px] text-green-300">Save {rec.savings}</span>
                            )}
                          </div>
                        </div>
                        <button className="px-2.5 py-1.5 rounded-lg bg-white/20 text-[9px] font-semibold hover:bg-white/30 transition-all whitespace-nowrap">
                          View
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Scholarship Progress Timeline */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Scholarship Progress" subtitle="Application status overview">
              <div className="space-y-3">
                {scholarshipTimeline.map((step, i) => {
                  const pct = step.total > 0 ? Math.round((step.count / step.total) * 100) : 0;
                  const colors = ['#6D4CFF', '#3B82F6', '#22C55E', '#EF4444', '#22C55E'];
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-medium text-gray-700">{step.label}</span>
                        <span className="text-[10px] font-bold" style={{ color: colors[i] }}>{step.count}/{step.total}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[i] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Quick Actions" subtitle="Financial management tools">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Pay Fees', icon: CreditCard, color: '#6D4CFF' },
                  { label: 'Download Receipt', icon: Download, color: '#22C55E' },
                  { label: 'Apply Scholarship', icon: Gift, color: '#3B82F6' },
                  { label: 'Request Financial Aid', icon: Heart, color: '#F59E0B' },
                  { label: 'View Statements', icon: FileText, color: '#8B5CF6' },
                  { label: 'Ask Prerana AI', icon: Brain, color: '#EC4899' },
                ].map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${action.color}12` }}>
                        <Icon className="w-4 h-4" style={{ color: action.color }} />
                      </div>
                      <span className="text-[9px] font-medium text-gray-600 text-center leading-tight">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </SectionCard>
          </motion.div>
        </div>
      </div>

      {/* Invoices & Receipts */}
      <motion.div variants={fadeUp}>
        <SectionCard title="Invoices & Receipts" subtitle="Download payment receipts and invoices">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoInvoices.map((inv, i) => (
              <motion.div
                key={inv.id}
                whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(0,0,0,0.08)' }}
                className="rounded-xl bg-white border border-gray-100 p-4 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge variant={inv.status === 'paid' ? 'success' : 'warning'} className="text-[8px] capitalize">{inv.status}</Badge>
                  {inv.status === 'paid' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div className="text-xs font-bold text-gray-900 mb-0.5">{inv.invoice_no}</div>
                <div className="text-[9px] text-gray-500">{inv.type}</div>
                <div className="text-sm font-extrabold text-gray-900 mt-2">₹{inv.amount.toLocaleString()}</div>
                <div className="text-[9px] text-gray-400 mt-1">{new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                  <button className="flex-1 py-1.5 rounded-lg bg-[#F3F0FF] text-[#6D4CFF] text-[8px] font-semibold hover:bg-[#EBE6FF] transition-all flex items-center justify-center gap-1">
                    <Download className="w-3 h-3" /> PDF
                  </button>
                  <button className="flex-1 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[8px] font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-1">
                    Print
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </SectionCard>
      </motion.div>

    </motion.div>
  );
}

function Smartphone({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function Monitor({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function Car({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
      <circle cx="6.5" cy="16.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  );
}

function Beaker({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4.5 3h15" /><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" /><path d="M6 14h12" />
    </svg>
  );
}

function Heart({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function Home({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" /><path d="M9 22V12h6v10" />
    </svg>
  );
}
