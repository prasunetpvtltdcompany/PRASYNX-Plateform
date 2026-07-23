'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Users, Briefcase, Award, PieChart,
  Download, CalendarDays, ArrowUpRight, Clock, Filter,
  Activity, Target, Zap,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart as RePieChart, Pie, Cell,
} from 'recharts';
import apiClient from '../../lib/apiClient';

const CLR = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', purple: '#A855F7' };

const COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#A855F7', '#EC4899', '#06B6D4', '#F97316'];

export default function AnalyticsTab({ provider }: { provider: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    setLoading(true);
    apiClient.get<any>('/job-provider/dashboard/enhanced').then(r => {
      if (r.success) setData(r.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" /></div>;
  if (!data) return <div className="text-center py-20 text-gray-400">Failed to load analytics</div>;

  const funnelData = [
    { name: 'Applications', value: data.totalApplications, color: CLR.primary },
    { name: 'Shortlisted', value: data.shortlisted, color: CLR.purple },
    { name: 'Interviews', value: data.interviews, color: CLR.warning },
    { name: 'Hired', value: data.hired, color: CLR.success },
  ];

  const roleData = Object.entries(data.appsByRole || {}).map(([name, value]) => ({ name, value: value as number }));
  const chartData = (data.appsOverTime || []).slice(-14);

  return (
    <div className="max-w-[1600px] mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-xs text-gray-400">Comprehensive hiring metrics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF] bg-white">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50">
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Briefcase, label: 'Total Jobs', value: data.totalJobs, trend: `${data.activeJobs} active`, color: CLR.primary },
          { icon: Users, label: 'Applications', value: data.totalApplications, trend: `${data.pendingApplications} pending`, color: CLR.info },
          { icon: Target, label: 'Conversion Rate', value: `${data.conversionRate || 0}%`, trend: 'of apps to hires', color: CLR.success },
          { icon: Award, label: 'Hired', value: data.hired, trend: `${data.shortlisted} shortlisted`, color: CLR.purple },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl" style={{ background: `${card.color}15`, color: card.color }}><Icon size={16} /></div>
                <span className="text-[9px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-semibold">{card.trend}</span>
              </div>
              <div className="text-lg font-extrabold">{card.value}</div>
              <div className="text-[10px] text-gray-400">{card.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Activity size={16} className="text-[#6D4CFF]" /> Application Trends</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs><linearGradient id="appTrend" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6D4CFF" stopOpacity={0.3} /><stop offset="100%" stopColor="#6D4CFF" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v?.slice(5) || ''} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Area type="monotone" dataKey="count" stroke="#6D4CFF" strokeWidth={2} fill="url(#appTrend)" dot={{ r: 3, fill: '#6D4CFF' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="h-[220px] flex items-center justify-center text-xs text-gray-400">No trend data yet</div>}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><PieChart size={16} className="text-[#6D4CFF]" /> Hiring Funnel</h3>
          <div className="space-y-3">
            {funnelData.map((f, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-700">{f.name}</span>
                  <span className="text-gray-400">{f.value}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${funnelData[0].value > 0 ? (f.value / funnelData[0].value) * 100 : 0}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${f.color}, ${f.color}88)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {roleData.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Users size={16} className="text-[#6D4CFF]" /> Applications by Role</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {roleData.map((r: any, i: number) => (
                <span key={i} className="inline-flex items-center gap-1 text-[9px] font-medium text-gray-500">
                  <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {r.name}: {r.value}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Zap size={16} className="text-[#6D4CFF]" /> Key Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Application per Job', value: data.totalJobs > 0 ? (data.totalApplications / data.totalJobs).toFixed(1) : '0', sub: `${data.totalApplications} apps / ${data.totalJobs} jobs` },
              { label: 'Shortlist Rate', value: data.totalApplications > 0 ? `${Math.round((data.shortlisted / data.totalApplications) * 100)}%` : '0%', sub: `${data.shortlisted} shortlisted` },
              { label: 'Interview Rate', value: data.totalApplications > 0 ? `${Math.round((data.interviews / data.totalApplications) * 100)}%` : '0%', sub: `${data.interviews} interviewed` },
              { label: 'Offer Acceptance', value: data.interviews > 0 ? `${Math.round((data.hired / data.interviews) * 100)}%` : '0%', sub: `${data.hired} hired` },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div>
                  <div className="text-xs font-semibold text-gray-700">{m.label}</div>
                  <div className="text-[9px] text-gray-400">{m.sub}</div>
                </div>
                <div className="text-lg font-extrabold text-[#6D4CFF]">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
