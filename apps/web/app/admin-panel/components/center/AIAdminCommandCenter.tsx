'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Sparkles, BarChart3, TrendingUp, Users, Building2, Activity,
  Zap, Target, AlertTriangle, CheckCircle2, ArrowUpRight, ChevronRight,
  RefreshCw, Download, Eye, Settings, MessageSquare, Lightbulb,
  Shield, Database, Globe, Clock, Cpu, FileText, Bot, Network,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  LineChart, Line, PieChart as RePieChart, Pie, Cell,
} from 'recharts';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', accent: '#A855F7' };

const aiInsights = [
  { priority: 'critical', title: 'Platform Performance Optimization', desc: 'AI detected suboptimal query patterns in the Student Portal. Recommended indexing could reduce latency by 34%.', impact: 'High', category: 'Performance' },
  { priority: 'high', title: 'User Engagement Decline Alert', desc: 'Parent portal engagement dropped 12% this week. AI recommends targeted notification campaign.', impact: 'Medium', category: 'Engagement' },
  { priority: 'medium', title: 'Credential Issuance Prediction', desc: 'Based on current trends, credential issuance will exceed 55,000 by Q3. Prepare scaling measures.', impact: 'Low', category: 'Growth' },
  { priority: 'high', title: 'Security Anomaly Detected', desc: 'Unusual login pattern detected from 3 admin accounts. AI recommends immediate password rotation.', impact: 'High', category: 'Security' },
  { priority: 'low', title: 'Resource Utilization Forecast', desc: 'Cloud costs projected to increase 18% next quarter. AI recommends right-sizing 4 underutilized instances.', impact: 'Medium', category: 'Cost' },
  { priority: 'medium', title: 'Organization Churn Risk', desc: '3 organizations show signs of potential churn. AI recommends proactive engagement strategy.', impact: 'High', category: 'Retention' },
];

const aiPerformanceData = [
  { month: 'Jan', predictions: 1240, accuracy: 92.4, automation: 68 },
  { month: 'Feb', predictions: 1380, accuracy: 93.1, automation: 71 },
  { month: 'Mar', predictions: 1520, accuracy: 94.2, automation: 75 },
  { month: 'Apr', predictions: 1680, accuracy: 94.8, automation: 78 },
  { month: 'May', predictions: 1750, accuracy: 95.3, automation: 82 },
  { month: 'Jun', predictions: 1890, accuracy: 95.8, automation: 85 },
];

const aiFeatures = [
  { name: 'Predictive Analytics', status: 'active', usage: 94, icon: TrendingUp },
  { name: 'Anomaly Detection', status: 'active', usage: 88, icon: AlertTriangle },
  { name: 'Automated Reporting', status: 'active', usage: 92, icon: FileText },
  { name: 'Smart Notifications', status: 'active', usage: 86, icon: Bot },
  { name: 'Natural Language Search', status: 'active', usage: 78, icon: MessageSquare },
  { name: 'Intelligent Routing', status: 'active', usage: 72, icon: Network },
];

const kpis = [
  { icon: Brain, label: 'AI Score', value: '94/100', sub: '+2 from last month', color: COLORS.primary, bg: '#F3F0FF', trend: '+2.1%' },
  { icon: Zap, label: 'Automation Rate', value: '85%', sub: 'Tasks automated by AI', color: COLORS.success, bg: '#F0FDF4', trend: '+5.3%' },
  { icon: Target, label: 'Prediction Accuracy', value: '95.8%', sub: 'Across all AI models', color: COLORS.info, bg: '#EFF6FF', trend: '+0.5%' },
  { icon: Activity, label: 'AI Actions Today', value: '1,890', sub: 'Automated decisions made', color: COLORS.warning, bg: '#FFFBEB', trend: '+12%' },
  { icon: Users, label: 'Users Served', value: '125K', sub: 'By AI features daily', color: COLORS.accent, bg: '#FAF5FF', trend: '+8.7%' },
  { icon: Clock, label: 'Avg Response', value: '0.4s', sub: 'AI processing time', color: COLORS.danger, bg: '#FEF2F2', trend: '-0.1s' },
];

export default function AIAdminCommandCenter() {
  const [activeInsight, setActiveInsight] = useState('all');

  const priorityColors: Record<string, string> = { critical: 'danger', high: 'warning', medium: 'info', low: 'default' };

  return (
    <div>
      {/* Hero */}
      <div className="hero-section relative overflow-hidden rounded-3xl p-6 md:p-8 xl:p-8 mb-8 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.2)] min-h-[340px] md:min-h-[360px] xl:h-[380px] xl:max-h-[380px] flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[55%] bg-[#A855F7]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[45%] bg-[#3B82F6]/15 rounded-full blur-[100px]" />
          <div className="absolute top-[30%] left-[40%] w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute top-[60%] left-[30%] w-1.5 h-1.5 bg-purple-300/40 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
        </div>
        <div className="relative z-10 w-full">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-white/10 text-white border border-white/10 text-[10px] flex items-center gap-1.5">
              <Sparkles size={12} /> AI-Powered Administration
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl xl:text-4xl font-extrabold text-white mb-2 leading-tight tracking-tight">
            AI Admin Command Center
          </h1>
          <p className="text-xs md:text-sm text-white/80 max-w-2xl leading-relaxed mb-4">
            Central AI hub delivering predictive insights, intelligent automation, anomaly detection, and data-driven recommendations across the platform.
          </p>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md max-w-xl">
            <Sparkles size={14} className="text-purple-300 animate-pulse flex-shrink-0" />
            <p className="text-[11px] text-white/80 leading-snug">
              AI Score: <span className="font-semibold text-white">94/100</span> · <span className="font-semibold text-white">1,890</span> actions today · <span className="font-semibold text-white">95.8%</span> prediction accuracy
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

      {/* AI Performance & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">AI Performance Metrics</h3>
            <Badge variant="info" className="text-[9px]">Improving</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aiPerformanceData}>
                <defs>
                  <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} /></linearGradient>
                  <linearGradient id="autoGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.success} stopOpacity={0.2} /><stop offset="95%" stopColor={COLORS.success} stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F1F5F9' }} />
                <Area type="monotone" dataKey="predictions" stroke={COLORS.primary} strokeWidth={2} fill="url(#predGrad)" name="AI Predictions" />
                <Area type="monotone" dataKey="automation" stroke={COLORS.success} strokeWidth={2} fill="url(#autoGrad)" name="Automation Rate %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">AI Feature Usage</h3>
          <div className="space-y-3">
            {aiFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#F3F0FF] text-[#6D4CFF] flex-shrink-0"><Icon size={13} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold">{feature.name}</span>
                      <span className="text-[10px] font-medium">{feature.usage}%</span>
                    </div>
                    <Progress value={feature.usage} className="h-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold">AI-Generated Insights</h3>
          <div className="flex items-center gap-2">
            {['all', 'critical', 'high', 'medium', 'low'].map(p => (
              <button key={p} onClick={() => setActiveInsight(p)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${activeInsight === p ? 'bg-[#6D4CFF] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {aiInsights.filter(i => activeInsight === 'all' || i.priority === activeInsight).map((insight, i) => (
            <div key={i} className={`p-4 rounded-xl border-l-4 ${insight.priority === 'critical' ? 'border-l-red-500 bg-red-50' : insight.priority === 'high' ? 'border-l-yellow-500 bg-yellow-50' : insight.priority === 'medium' ? 'border-l-blue-500 bg-blue-50' : 'border-l-gray-400 bg-gray-50'} hover:shadow-md transition-all cursor-pointer`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${insight.priority === 'critical' ? 'bg-red-100 text-red-600' : insight.priority === 'high' ? 'bg-yellow-100 text-yellow-600' : insight.priority === 'medium' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                    <Lightbulb size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold">{insight.title}</span>
                      <Badge variant={priorityColors[insight.priority] as any} className="text-[8px]">{insight.priority}</Badge>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">{insight.desc}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[9px] font-medium text-[#6D4CFF]">Impact: {insight.impact}</span>
                      <span className="text-[9px] text-gray-400">Category: {insight.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-[#6D4CFF] transition-all"><Eye size={13} /></button>
                  <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-[#6D4CFF] transition-all"><ArrowUpRight size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Model Performance & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">Model Performance</h3>
          <div className="space-y-3">
            {[
              { model: 'Predictive Engine', accuracy: 95.8, latency: '0.3s', status: 'healthy' },
              { model: 'Anomaly Detector', accuracy: 97.2, latency: '0.2s', status: 'healthy' },
              { model: 'Recommendation System', accuracy: 91.5, latency: '0.6s', status: 'healthy' },
              { model: 'NLP Processor', accuracy: 93.8, latency: '0.4s', status: 'healthy' },
              { model: 'Automation Engine', accuracy: 96.1, latency: '0.1s', status: 'healthy' },
            ].map((model, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <div className="text-[10px] font-semibold">{model.model}</div>
                  <div className="text-[9px] text-gray-400">{model.latency} latency</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-green-600">{model.accuracy}%</div>
                  <Badge variant="success" className="text-[8px]">{model.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">AI Automation Stats</h3>
          <div className="text-center mb-4">
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="42" fill="none" stroke="#F1F5F9" strokeWidth="6" />
                <circle cx="48" cy="48" r="42" fill="none" stroke="#6D4CFF" strokeWidth="6" strokeDasharray={`${(85 / 100) * 264} 264`} strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-extrabold text-[#6D4CFF]">85%</span>
                <span className="text-[9px] text-gray-400">Automation</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Tasks Automated Today', value: '12,450', color: COLORS.primary },
              { label: 'Hours Saved', value: '340 hrs', color: COLORS.success },
              { label: 'Error Rate', value: '0.8%', color: COLORS.warning },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-600">{stat.label}</span>
                <span className="text-xs font-bold" style={{ color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-bold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { icon: RefreshCw, label: 'Retrain AI Models', desc: 'Update with latest data' },
              { icon: BarChart3, label: 'AI Performance Report', desc: 'Generate detailed AI analytics' },
              { icon: Download, label: 'Export Predictions', desc: 'Download forecast data' },
              { icon: Settings, label: 'Configure AI Features', desc: 'Manage AI module settings' },
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
