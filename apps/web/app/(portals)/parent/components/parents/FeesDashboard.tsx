'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, TrendingUp, Clock, CheckCircle2, AlertCircle, Award, Bell,
  Plus, CalendarDays, Target, Star, Sparkles, Download, MessageSquare, FileText,
  ArrowUpRight, Search, X, GraduationCap, Lightbulb, Activity,
  HelpCircle, Send, AlertTriangle, BarChart3, Users, ChevronRight,
  Shield, DollarSign, CreditCard, Landmark, Smartphone, Gift, Percent,
  Receipt, Banknote, ScrollText, QrCode, BadgeCheck, FileDown, Eye,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '../ui/button';
import { toast } from 'sonner';

const PCOLORS = { primary: '#6D4CFF', secondary: '#8B5CF6', tertiary: '#6366F1', success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };
const PIE_COLORS = ['#6D4CFF', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

interface FeesDashboardProps {
  feesSummary: any;
  feesPaid: number;
  feesDue: number;
  selectedChild: any;
  setActiveTab: (tab: string) => void;
  children: any[];
  setSelectedChild: (c: any) => void;
  searchQuery?: string;
  downloadReportCard?: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const aiQuickActions = [
  { icon: Receipt, label: 'Explain Fees', desc: 'Understand fee structure', color: '#6D4CFF' },
  { icon: CreditCard, label: 'Payment Help', desc: 'Payment assistance', color: '#10B981' },
  { icon: Gift, label: 'Scholarships', desc: 'Check eligibility', color: '#F59E0B' },
  { icon: CalendarDays, label: 'Installments', desc: 'Plan payments', color: '#3B82F6' },
  { icon: FileText, label: 'Statements', desc: 'Download statements', color: '#8B5CF6' },
  { icon: MessageSquare, label: 'Contact Finance', desc: 'Ask billing team', color: '#EC4899' },
];

export function FeesDashboard({
  feesSummary, feesPaid, feesDue, selectedChild, setActiveTab, children, setSelectedChild, searchQuery, downloadReportCard,
}: FeesDashboardProps) {
  const [payFilter, setPayFilter] = useState('all');
  const [paySearch, setPaySearch] = useState('');
  const [selectedPay, setSelectedPay] = useState<string | null>(null);
  const [aiAskOpen, setAiAskOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: string; text: string }[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState('upi');

  const effPayments = useMemo(() => {
    const p = feesSummary?.payments || [];
    if (Array.isArray(p) && p.length > 0) return p;
    return [];
  }, [feesSummary]);

  const effBreakdown = useMemo(() => {
    return [];
  }, []);

  const effUpcoming = useMemo(() => {
    return [];
  }, []);

  const effMonthly = useMemo(() => {
    return [];
  }, []);

  const totalPaid = feesPaid || 0;
  const totalDue = feesDue || 0;
  const nextAmount = 4000;
  const completionPct = totalPaid + totalDue > 0 ? Math.round((totalPaid / (totalPaid + totalDue)) * 100) : 0;
  const receiptCount = 12;

  const filteredPayments = useMemo(() => {
    let items = effPayments;
    if (payFilter === 'successful') items = items.filter((p: any) => p.status === 'successful');
    else if (payFilter === 'pending') items = items.filter((p: any) => p.status === 'pending');
    else if (payFilter === 'failed') items = items.filter((p: any) => p.status === 'failed');
    if (paySearch) {
      const q = paySearch.toLowerCase();
      items = items.filter((p: any) => p.description?.toLowerCase().includes(q) || p.id?.toLowerCase().includes(q) || p.method?.toLowerCase().includes(q));
    }
    return items;
  }, [effPayments, payFilter, paySearch]);

  const handleAiSend = () => {
    if (!aiQuery.trim()) return;
    setAiMessages(prev => [...prev, { role: 'user', text: aiQuery }]);
    setTimeout(() => {
      const responses: Record<string, string> = {
        'Explain Fees': 'The fee structure includes Tuition Fee (₹40,000), Transport Fee (₹12,000), Examination Fee (₹5,000), Library Fee (₹3,000), Activity Fee (₹4,000), and Technology Fee (₹2,000). Total annual fees: ₹69,000. Currently ₹57,000 paid, ₹12,000 pending.',
        'Payment Help': 'We accept UPI, Credit/Debit Cards, Net Banking, Wallets, and EMI. You can pay via the Pay Now button or set up auto-pay for recurring fees. All payments are processed securely.',
        'Scholarships': 'Your child is eligible for: (1) Merit Scholarship - ₹5,000 based on academic performance (2) Sibling Discount - 10% on tuition if applicable. Check with the finance office for more options.',
        'Installments': 'You can split pending fees into 3 installments: (1) ₹4,000 due Jul 15 (2) ₹4,000 due Aug 15 (3) ₹4,000 due Sep 15. Each installment has zero interest.',
        'Statements': 'I can generate annual, term, or custom date range statements. Would you like a full year summary or specific period?',
        'Contact Finance': 'I can help draft a message to the finance department regarding fee structure, payment plans, receipts, or billing inquiries.',
      };
      const response = responses[aiQuery] || `Here's your fee summary: Total paid ₹${totalPaid.toLocaleString()}, pending ₹${totalDue.toLocaleString()}, completion rate ${completionPct}%. Your next payment of ₹${nextAmount.toLocaleString()} is due on July 15th. All payments are in good standing.`;
      setAiMessages(prev => [...prev, { role: 'assistant', text: response }]);
    }, 800);
    setAiQuery('');
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'successful': case 'paid': return { color: '#10B981', bg: '#F0FDF4', label: 'Successful', icon: CheckCircle2 };
      case 'pending': return { color: '#F59E0B', bg: '#FFFBEB', label: 'Pending', icon: Clock };
      case 'failed': return { color: '#EF4444', bg: '#FEF2F2', label: 'Failed', icon: AlertCircle };
      default: return { color: '#94A3B8', bg: '#F8FAFC', label: status || '—', icon: Clock };
    }
  };

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">
      {/* ===== HERO ===== */}
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#6D4CFF] via-[#7C5CFF] to-[#4F2DB8]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.12)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(124,58,237,0.15)_0%,transparent_50%)]" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#A855F7]/15 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-[#6366F1]/15 rounded-full blur-[80px]" />
        <motion.div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full bg-white/10"
              animate={{ opacity: [0.1, 0.4, 0.1], y: [0, -(10 + (i % 3) * 8), 0], x: [0, (i % 2 === 0 ? 1 : -1) * 10, 0] }}
              transition={{ duration: 4 + (i % 3) * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
              style={{ width: `${2 + (i % 3) * 2}px`, height: `${2 + (i % 3) * 2}px`, top: `${10 + (i * 12) % 80}%`, left: `${5 + (i * 15) % 90}%` }}
            />
          ))}
        </motion.div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
                <Wallet className="w-3.5 h-3.5 text-purple-200" />
                <span className="text-[10px] font-semibold text-purple-100 uppercase tracking-wider">Fees & Payments</span>
              </div>
              {selectedChild && <Badge className="bg-white/20 text-white border-0 text-[10px]">{selectedChild.full_name}</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">School Finance Center</h1>
            <p className="text-sm text-white/80 mt-1 max-w-xl">
              Manage school fees, payment schedules, receipts, installments, and financial records from one place.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              {[
                { icon: CheckCircle2, label: 'Total Paid', value: `₹${totalPaid.toLocaleString()}`, color: '#10B981' },
                { icon: Clock, label: 'Pending', value: `₹${totalDue.toLocaleString()}`, color: '#F59E0B' },
                { icon: CalendarDays, label: 'Upcoming', value: `₹${nextAmount.toLocaleString()}`, color: '#3B82F6' },
                { icon: FileText, label: 'Receipts', value: receiptCount, color: '#6D4CFF' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  <div>
                    <span className="text-[10px] text-purple-200/70 block">{item.label}</span>
                    <span className="text-sm font-bold text-white">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
            <Button className="bg-white text-[#6D4CFF] hover:bg-white/95 hover:-translate-y-0.5 active:scale-[0.97] font-bold rounded-xl text-xs h-9 px-4 shadow-[0_4px_12px_rgba(255,255,255,0.15)] border-0 transition-all duration-200 gap-1.5"
              onClick={() => setShowPayModal(true)}>
              <CreditCard className="w-3.5 h-3.5" /> Pay Fees
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.97] text-white font-bold rounded-xl text-xs h-9 px-4 border border-white/25 transition-all duration-200 gap-1.5"
              onClick={() => { downloadReportCard?.(); toast.success('Fee statement download initiated'); }}>
              <Download className="w-3.5 h-3.5" /> Statement
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.97] text-white font-bold rounded-xl text-xs h-9 px-4 border border-white/25 transition-all duration-200 gap-1.5"
              onClick={() => setAiAskOpen(true)}>
              <Sparkles className="w-3.5 h-3.5" /> Ask AI
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ===== TOP KPI CARDS ===== */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: DollarSign, label: 'Total Paid', value: `₹${totalPaid.toLocaleString()}`, desc: 'This Academic Year', color: '#10B981', bg: '#F0FDF4' },
          { icon: Clock, label: 'Pending Fees', value: `₹${totalDue.toLocaleString()}`, desc: 'Due in 12 days', color: '#F59E0B', bg: '#FFFBEB' },
          { icon: CalendarDays, label: 'Upcoming', value: `₹${nextAmount.toLocaleString()}`, desc: 'Next Installment', color: '#3B82F6', bg: '#EFF6FF' },
          { icon: TrendingUp, label: 'Completion', value: `${completionPct}%`, progress: completionPct, color: '#6D4CFF', bg: '#F3F0FF' },
          { icon: FileText, label: 'Receipts', value: receiptCount, desc: 'Available for Download', color: '#8B5CF6', bg: '#F5F3FF' },
          { icon: BadgeCheck, label: 'Financial Status', value: 'Good Standing', desc: 'No Outstanding Issues', color: '#10B981', bg: '#F0FDF4' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={i} whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#6D4CFF]/20 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: item.bg, color: item.color }}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.05, type: 'spring' }}
                  className="w-2 h-2 rounded-full" style={{ background: item.color }} />
              </div>
              <div className="text-[11px] font-medium text-gray-400 mb-0.5">{item.label}</div>
              <div className="text-lg font-extrabold text-gray-900">{item.value}</div>
              <div className="text-[10px]" style={{ color: item.color }}>{item.desc || ''}</div>
              {(item as any).progress !== undefined && (
                <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(item as any).progress}%` }} transition={{ duration: 1, delay: 0.5 + i * 0.08 }}
                    className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}88)` }} />
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* ===== MAIN CONTENT: Two-column ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">

        {/* ===== LEFT ===== */}
        <div className="space-y-6">

          {/* Fee Breakdown */}
          <motion.div variants={fadeUp}>
            <Card className="p-5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#F3F0FF] to-transparent rounded-bl-full pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">Fee Breakdown</h3>
                    <p className="text-xs text-gray-400">Annual fee structure and payment status</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 rounded-xl" onClick={() => toast.success('Full fee structure')}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {effBreakdown.map((fee: any, i: number) => {
                    const isPaid = fee.status === 'paid';
                    const Icon = fee.icon;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className={`p-3.5 rounded-xl border transition-all ${isPaid ? 'border-green-100 bg-green-50/30' : 'border-amber-100 bg-amber-50/30'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${fee.color}15` }}>
                            <Icon className="w-4.5 h-4.5" style={{ color: fee.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-800">{fee.name}</span>
                              <Badge className={`text-[9px] border-0 ${isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {isPaid ? 'Paid' : 'Pending'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                              <span className="font-bold text-gray-700">₹{fee.amount.toLocaleString()}</span>
                              <span>• {fee.due}</span>
                            </div>
                            <div className="mt-2 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: isPaid ? '100%' : '0%' }} transition={{ duration: 1, delay: 0.3 + i * 0.04 }}
                                className="h-full rounded-full" style={{ background: isPaid ? '#10B981' : '#F59E0B' }} />
                            </div>
                          </div>
                          {!isPaid && (
                            <Button size="sm" className="text-[10px] h-7 px-3 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white border-0 flex-shrink-0"
                              onClick={() => setShowPayModal(true)}>
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-[#F3F0FF] to-white border border-[#6D4CFF]/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-gray-500">Total Annual Fees</span>
                    <div className="text-lg font-extrabold text-gray-900">₹69,000</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-gray-500">Paid</span>
                    <div className="text-lg font-extrabold text-[#10B981]">₹{totalPaid.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-gray-500">Pending</span>
                    <div className="text-lg font-extrabold text-[#F59E0B]">₹{totalDue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Payment History */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Payment History</h3>
                  <p className="text-xs text-gray-400">Track all your past transactions</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search..." value={paySearch} onChange={e => setPaySearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:bg-white w-32" />
                  </div>
                  <select value={payFilter} onChange={e => setPayFilter(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:border-[#6D4CFF]">
                    <option value="all">All</option>
                    <option value="successful">Successful</option>
                    <option value="pending">Pending</option>
                  </select>
                  <Button variant="outline" size="sm" className="text-xs h-8 rounded-lg border-gray-200 gap-1"
                    onClick={() => toast.success('Exporting transactions...')}>
                    <Download className="w-3.5 h-3.5" /> Export
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-[10px] font-semibold text-gray-400 uppercase">Txn ID</th>
                      <th className="text-left py-3 px-2 text-[10px] font-semibold text-gray-400 uppercase">Date</th>
                      <th className="text-left py-3 px-2 text-[10px] font-semibold text-gray-400 uppercase">Description</th>
                      <th className="text-right py-3 px-2 text-[10px] font-semibold text-gray-400 uppercase">Amount</th>
                      <th className="text-left py-3 px-2 text-[10px] font-semibold text-gray-400 uppercase">Method</th>
                      <th className="text-left py-3 px-2 text-[10px] font-semibold text-gray-400 uppercase">Status</th>
                      <th className="text-right py-3 px-2 text-[10px] font-semibold text-gray-400 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length > 0 ? filteredPayments.map((p: any, i: number) => {
                      const st = getStatusInfo(p.status);
                      const Icon = st.icon;
                      return (
                        <motion.tr key={p.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                          className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${selectedPay === p.id ? 'bg-[#F3F0FF]/30' : ''}`}
                          onClick={() => setSelectedPay(selectedPay === p.id ? null : p.id)}
                        >
                          <td className="py-3 px-2 text-xs font-mono text-gray-500">{p.id?.replace('TXN-', '') || '—'}</td>
                          <td className="py-3 px-2 text-xs text-gray-600">{p.date ? new Date(p.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                          <td className="py-3 px-2 text-xs font-medium text-gray-800">{p.description || 'Payment'}</td>
                          <td className="py-3 px-2 text-xs font-bold text-right text-gray-900">₹{(p.amount || 0).toLocaleString()}</td>
                          <td className="py-3 px-2">
                            <Badge className="bg-gray-50 text-gray-500 border-gray-200 text-[9px]">{p.method || '—'}</Badge>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />
                              <span className="text-xs font-medium" style={{ color: st.color }}>{st.label}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Button variant="ghost" size="sm" className="w-7 h-7 text-gray-400 hover:text-[#6D4CFF]"
                              onClick={(e) => { e.stopPropagation(); toast.success('Receipt downloaded'); }}>
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </motion.tr>
                      );
                    }) : (
                      <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-xs">No transactions found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>

          {/* Upcoming Payments + Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Upcoming Payments */}
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#6D4CFF]" />
                  Upcoming Payments
                </h3>
                <div className="space-y-3">
                  {effUpcoming.map((up: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      className="p-3.5 rounded-xl border border-gray-100 hover:border-[#6D4CFF]/20 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#6D4CFF] flex-shrink-0">
                          <CalendarDays className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-800">{up.title}</span>
                            <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200 text-[9px]">{up.category}</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            <span>Due: {new Date(up.due).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className="font-bold text-[#6D4CFF]">₹{(up.amount || 0).toLocaleString()}</span>
                          </div>
                        </div>
                        <Button size="sm" className="text-[10px] h-7 px-3 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white border-0 shadow-[0_2px_8px_rgba(109,76,255,0.15)] flex-shrink-0"
                          onClick={() => setShowPayModal(true)}>
                          Pay Now
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Payment Analytics */}
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#6D4CFF]" />
                  Payment Analytics
                </h3>
                <div className="h-36 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={effMonthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                      <Bar dataKey="paid" name="Paid" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={24} />
                      <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Total Paid', value: `₹${totalPaid.toLocaleString()}`, color: '#10B981', bg: '#F0FDF4' },
                    { label: 'Pending', value: `₹${totalDue.toLocaleString()}`, color: '#F59E0B', bg: '#FFFBEB' },
                    { label: 'Completion', value: `${completionPct}%`, color: '#6D4CFF', bg: '#F3F0FF' },
                    { label: 'Transactions', value: effPayments.length, color: '#3B82F6', bg: '#EFF6FF' },
                  ].map((item, i) => (
                    <div key={i} className="p-2.5 rounded-xl text-center" style={{ background: item.bg }}>
                      <div className="text-sm font-extrabold" style={{ color: item.color }}>{item.value}</div>
                      <div className="text-[10px] text-gray-500">{item.label}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Installment & Scholarship */}
          <motion.div variants={fadeUp}>
            <Card className="p-5 bg-gradient-to-br from-[#F3F0FF]/40 to-white border-[#6D4CFF]/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#6D4CFF]">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">Installment Plans</h4>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Split pending fees into easy monthly installments. Zero interest, auto-debit available.</p>
                  <div className="space-y-2 mb-3">
                    {[
                      { due: '15 Jul 2026', amount: 4000 },
                      { due: '15 Aug 2026', amount: 4000 },
                      { due: '15 Sep 2026', amount: 4000 },
                    ].map((inst, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Installment {i + 1}: {inst.due}</span>
                        <span className="font-bold text-gray-700">₹{inst.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" className="w-full text-xs h-8 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white border-0 gap-1"
                    onClick={() => toast.success('Installment plan requested')}>
                    <Plus className="w-3 h-3" /> Request Installment Plan
                  </Button>
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center text-[#F59E0B]">
                      <Gift className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">Scholarships & Discounts</h4>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">Available discounts and scholarships applied to your account.</p>
                  <div className="space-y-2">
                    {[
                      { name: 'Merit Scholarship', amount: 5000, status: 'Applied', color: '#10B981' },
                      { name: 'Sibling Discount', amount: 4000, status: 'Eligible', color: '#F59E0B' },
                    ].map((sch, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                        <div>
                          <div className="text-xs font-semibold text-gray-700">{sch.name}</div>
                          <div className="text-[10px] text-gray-400">₹{sch.amount.toLocaleString()}</div>
                        </div>
                        <Badge className={`text-[9px] ${sch.status === 'Applied' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}>
                          {sch.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3 text-xs h-8 rounded-lg border-gray-200 gap-1"
                    onClick={() => { setAiAskOpen(true); setAiQuery('Scholarships'); }}>
                    <Sparkles className="w-3 h-3 text-[#6D4CFF]" /> Check Eligibility
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <div className="space-y-5">
          {/* Today's Status */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#6D4CFF]" />
                Fee Status
              </h3>
              <div className="text-center mb-4">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F3F4F6" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#10B981" strokeWidth="3"
                      strokeDasharray={`${completionPct} ${100 - completionPct}`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-[#10B981]">{completionPct}%</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200">
                  <BadgeCheck className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-semibold text-green-600">Good Standing</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">No overdue fees</p>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: 'Total Fees', value: '₹69,000', color: '#6D4CFF' },
                  { label: 'Paid', value: `₹${totalPaid.toLocaleString()}`, color: '#10B981' },
                  { label: 'Pending', value: `₹${totalDue.toLocaleString()}`, color: '#F59E0B' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                    <span className="text-xs text-gray-500">{item.label}</span>
                    <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Next Payment */}
          <motion.div variants={fadeUp}>
            <Card className="p-5 bg-gradient-to-br from-[#F59E0B]/10 to-white border-amber-100">
              <h3 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F59E0B]" />
                Next Payment Due
              </h3>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-[#F59E0B]">₹{nextAmount.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">Due in 12 days • 15 July 2026</p>
              </div>
              <Button className="w-full mt-4 text-xs h-9 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white border-0 gap-1.5 shadow-[0_4px_12px_rgba(109,76,255,0.2)]"
                onClick={() => setShowPayModal(true)}>
                <CreditCard className="w-3.5 h-3.5" /> Pay Now
              </Button>
            </Card>
          </motion.div>

          {/* Payment Methods */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#6D4CFF]" />
                Payment Methods
              </h3>
              <div className="space-y-2">
                {[
                  { icon: Smartphone, label: 'UPI', desc: 'GPay, PhonePe, Paytm', color: '#6D4CFF' },
                  { icon: CreditCard, label: 'Cards', desc: 'Credit & Debit', color: '#3B82F6' },
                  { icon: Landmark, label: 'Net Banking', desc: 'All Major Banks', color: '#10B981' },
                  { icon: Shield, label: 'Wallets', desc: 'Paytm, PhonePe', color: '#F59E0B' },
                ].map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => { setPayMethod(m.label.toLowerCase().replace(' ', '-')); setShowPayModal(true); }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${m.color}12` }}>
                        <Icon className="w-4 h-4" style={{ color: m.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-700">{m.label}</div>
                        <div className="text-[10px] text-gray-400">{m.desc}</div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#6D4CFF]" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {([] as any[]).map((n: any, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700">{n.text}</p>
                      <span className="text-[10px] text-gray-400">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* AI Assistant */}
          <motion.div variants={fadeUp}>
            <Card className="p-5 bg-gradient-to-br from-[#6D4CFF] to-[#4F2DB8] text-white border-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.08)_0%,transparent_50%)]" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-purple-200" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold">Prerana AI</h3>
                    <p className="text-[10px] text-purple-200/70">Finance Assistant</p>
                  </div>
                </div>
                <p className="text-[11px] text-purple-200/80 mb-4">
                  Get help with fee structure, payment plans, scholarships, and financial queries.
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {aiQuickActions.slice(0, 6).map((action: any, i: number) => {
                    const Icon = action.icon;
                    return (
                      <button key={i} onClick={() => { setAiAskOpen(true); setAiQuery(action.label); }}
                        className="flex items-center gap-1.5 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all text-left">
                        <Icon className="w-3 h-3 flex-shrink-0" style={{ color: action.color }} />
                        <span className="text-[9px] font-semibold text-white/90 leading-tight">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                  <input type="text" placeholder="Ask about fees..."
                    className="flex-1 bg-transparent border-0 text-[11px] text-white placeholder-purple-200/50 outline-none"
                    value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { setAiAskOpen(true); handleAiSend(); } }} />
                  <button onClick={() => { setAiAskOpen(true); handleAiSend(); }} className="text-purple-200 hover:text-white transition-colors">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ===== PAYMENT MODAL ===== */}
      <AnimatePresence>
        {showPayModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowPayModal(false)}>
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#6D4CFF] to-[#4F2DB8] p-5 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.08)_0%,transparent_50%)]" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                      <CreditCard className="w-5 h-5 text-purple-200" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base">Pay Fees</h3>
                      <p className="text-[11px] text-purple-200/70">Secure online payment</p>
                    </div>
                  </div>
                  <button onClick={() => setShowPayModal(false)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="p-3.5 rounded-xl bg-[#F3F0FF] border border-[#6D4CFF]/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Amount to Pay</span>
                    <span className="text-lg font-extrabold text-[#6D4CFF]">₹{nextAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">July Tuition Fee - Due 15 Jul 2026</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-2">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'upi', label: 'UPI', icon: Smartphone },
                      { id: 'card', label: 'Card', icon: CreditCard },
                      { id: 'netbanking', label: 'Net Banking', icon: Landmark },
                      { id: 'wallet', label: 'Wallet', icon: Shield },
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <button key={m.id} onClick={() => setPayMethod(m.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                            payMethod === m.id ? 'border-[#6D4CFF] bg-[#F3F0FF] text-[#6D4CFF]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}>
                          <Icon className="w-4 h-4" /> {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <Shield className="w-3.5 h-3.5 text-green-500" />
                    Secured by 256-bit SSL encryption
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    <span>🔒 PCI Compliant</span>
                    <span>✓ Instant Receipt</span>
                    <span>⏱ Auto-Refund</span>
                  </div>
                </div>
                <Button className="w-full h-10 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white font-bold text-sm shadow-[0_4px_14px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_20px_rgba(109,76,255,0.4)] border-0"
                  onClick={() => { setShowPayModal(false); toast.success('Payment initiated successfully!'); }}>
                  <LockIcon className="w-4 h-4 mr-1.5" /> Pay ₹{nextAmount.toLocaleString()} securely
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== AI PANEL ===== */}
      <AnimatePresence>
        {aiAskOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setAiAskOpen(false)}>
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-[#6D4CFF] to-[#4F2DB8] p-5 relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.08)_0%,transparent_50%)]" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                      <Sparkles className="w-5 h-5 text-purple-200" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base">Prerana AI</h3>
                      <p className="text-[11px] text-purple-200/70">Finance Assistant</p>
                    </div>
                  </div>
                  <button onClick={() => setAiAskOpen(false)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-5 max-h-[50vh] overflow-y-auto space-y-3">
                {aiMessages.length === 0 && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center">
                      <Wallet className="w-8 h-8 text-[#6D4CFF]" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Ask about your fees</p>
                    <p className="text-xs text-gray-400 mt-1">Get fee structure details, payment help, and financial guidance.</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {aiQuickActions.slice(0, 4).map((action: any, i: number) => {
                        const Icon = action.icon;
                        return (
                          <button key={i} onClick={() => { setAiQuery(action.label); handleAiSend(); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-xs font-medium text-gray-600 hover:bg-[#F3F0FF] hover:text-[#6D4CFF] transition-all">
                            <Icon className="w-3 h-3" style={{ color: action.color }} /> {action.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {aiMessages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                      msg.role === 'user' ? 'bg-[#6D4CFF] text-white rounded-br-sm' : 'bg-gray-50 text-gray-700 border border-gray-100 rounded-bl-sm'
                    }`}>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Sparkles className="w-3 h-3 text-[#6D4CFF]" />
                          <span className="text-[10px] font-semibold text-[#6D4CFF]">Prerana AI</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="Ask about fees, payments, scholarships..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-[#6D4CFF] focus:ring-2 focus:ring-[rgba(109,76,255,0.1)] focus:bg-white transition-all"
                    value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAiSend(); }} />
                  <button onClick={handleAiSend}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_16px_rgba(109,76,255,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all flex-shrink-0">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BusIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 18H6a2 2 0 01-2-2V7a5 5 0 015-5h6a5 5 0 015 5v9a2 2 0 01-2 2h-2m-8 0a2 2 0 102 2 2 2 0 00-2-2zm8 0a2 2 0 102 2 2 2 0 00-2-2z" /></svg>; }
function BookOpenIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>; }
function LockIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>; }
