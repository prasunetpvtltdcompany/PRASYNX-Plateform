'use client';

import { useState } from 'react';
import { useApi, LoadingSkeleton } from '../../lib/useApi';
import { workforceApi } from '../../lib/enterpriseDataService';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, Download,
  FileText, CalendarDays, Users, BadgeCheck, Plus,
  Search, Filter, ChevronDown, ArrowUpRight, Banknote
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
} from 'recharts';

export function PayrollOverview() {
  const { organisationId } = useAuth();
  const orgId = organisationId || '';
  const [activeTab, setLocalTab] = useState('summary');

  const payrollHook = useApi(() => workforceApi.getPayrollOverview(orgId), [orgId], !!orgId);
  const payslipsHook = useApi(() => workforceApi.getPayslips(orgId), [orgId], !!orgId);

  const payroll = (payrollHook.data?.data || payrollHook.data || {}) as any;
  const payslips = Array.isArray(payslipsHook.data?.data || payslipsHook.data) ? (payslipsHook.data?.data || payslipsHook.data) : [] as any[];

  const statCards = [
    { label: 'Total Payroll', value: payroll.total_payroll || 0, prefix: '$', icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Avg Salary', value: payroll.avg_salary || 0, prefix: '$', icon: Banknote, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Allowances', value: payroll.total_allowances || 0, prefix: '$', icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Deductions', value: payroll.total_deductions || 0, prefix: '$', icon: TrendingDown, color: 'bg-red-50 text-red-600' },
    { label: 'Active Employees', value: payroll.active_employees || 0, icon: Users, color: 'bg-cyan-50 text-cyan-600' },
    { label: 'Pending Payslips', value: payroll.pending_payslips || 0, icon: FileText, color: 'bg-amber-50 text-amber-600' },
  ];

  const monthlyData = Array.isArray(payroll.monthly_data) ? payroll.monthly_data : [];

  return (
    <div>
      <div className="page-header">
        <h1>Payroll Overview</h1>
        <p>Salary management, allowances, deductions, and payslip generation.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={18} />
            </div>
            <div className="text-xl font-black text-gray-900">{stat.prefix}{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</div>
            <div className="text-[11px] font-semibold text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setLocalTab} className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-2xl">
          <TabsTrigger value="summary" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Summary</TabsTrigger>
          <TabsTrigger value="salary" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Salary Structure</TabsTrigger>
          <TabsTrigger value="payslips" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Payslips</TabsTrigger>
          <TabsTrigger value="reports" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-5 border-gray-100">
              <h3 className="text-sm font-bold mb-4">Monthly Payroll Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="total" stroke="#6D4CFF" fill="#6D4CFF" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5 border-gray-100">
              <h3 className="text-sm font-bold mb-4">Salary Distribution</h3>
              <div className="space-y-4">
                {[
                  { label: 'Basic Salary', value: payroll.basic_percentage || 50, amount: payroll.total_basic || 0, color: '#6D4CFF' },
                  { label: 'HRA', value: payroll.hra_percentage || 20, amount: payroll.total_hra || 0, color: '#22C55E' },
                  { label: 'Allowances', value: payroll.allowances_percentage || 15, amount: payroll.total_allowances || 0, color: '#F59E0B' },
                  { label: 'Deductions', value: payroll.deductions_percentage || 15, amount: payroll.total_deductions || 0, color: '#EF4444' },
                ].map((item, i) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-700">{item.label}</span>
                      <span style={{ color: item.color }}>{item.value}% (${item.amount.toLocaleString()})</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payslips">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800">Payslips</h3>
            <Button className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold">
              <Download size={14} className="mr-1" /> Generate All
            </Button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Staff</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Month</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Net Pay</th>
                  <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map((p: any, i: number) => (
                  <tr key={p.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900">{p.staff_name}</td>
                    <td className="py-3 px-4 text-gray-600">{p.month}</td>
                    <td className="py-3 px-4 text-right font-bold">${p.net_pay?.toLocaleString() || 0}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={`text-[9px] font-extrabold ${
                        p.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>{p.status || 'PENDING'}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="outline" size="sm" className="rounded-lg text-xs h-7 border-gray-200">
                        <Download size={11} className="mr-1" /> PDF
                      </Button>
                    </td>
                  </tr>
                ))}
                {payslips.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-xs font-semibold">No payslips generated yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Monthly Report', 'Annual Summary', 'Department Wise'].map((r, i) => (
              <Card key={r} className="p-5 border-gray-100 hover:shadow-lg transition-all cursor-pointer">
                <FileText size={24} className="text-purple-500 mb-3" />
                <h4 className="text-sm font-bold text-gray-900 mb-1">{r}</h4>
                <p className="text-xs text-gray-400 mb-3">Generate payroll report</p>
                <Button variant="outline" size="sm" className="rounded-xl text-xs border-gray-200">
                  <Download size={11} className="mr-1" /> Generate
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
