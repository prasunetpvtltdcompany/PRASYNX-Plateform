'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, TrendingUp, Sparkles, Search, Filter, X,
  ChevronDown, Download, FileText, Mail, Phone, MapPin,
  Briefcase, CalendarDays, MessageSquare, Eye, UserCheck, Video,
  Clock, ThumbsUp, GraduationCap, Link, RefreshCw,
  MoreHorizontal, Upload, Send, Sliders, Ban, CheckCircle,
  Hourglass, BarChart3, Activity, Target, Zap, Bookmark, Plus, Bot,
  ArrowUpRight, Star, ChevronLeft, ChevronRight, ListChecks,
  ExternalLink, Copy, CheckSquare, Square, HelpCircle, Bell,
  DollarSign, School, Loader, ArrowRight, ArrowLeft, Home,
  Globe, Code2, Edit3, Building2, Users, Mic, PieChart as PieChartIcon,
  Flag, Gift, Rocket, Coffee, BookOpen, Shield,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart as ReLineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  CartesianGrid,
} from 'recharts';
import apiClient from '../../lib/apiClient';
import HiredDashboardContent from './HiredDashboardContent';

const CLR = {
  primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B',
  danger: '#EF4444', info: '#3B82F6', purple: '#A855F7',
  indigo: '#4F46E5', pink: '#EC4899', teal: '#14B8A6', orange: '#F97316',
};

const aiRecommendations = [
  { type: 'retention', text: 'Frontend team shows 92% retention - highest in organization', priority: 'high' },
  { type: 'source', text: 'Campus recruitment yields highest quality hires with 95% retention forecast', priority: 'high' },
  { type: 'speed', text: 'Average time-to-hire reduced to 14 days - 18% improvement', priority: 'medium' },
  { type: 'department', text: 'Engineering department has highest hiring volume and retention', priority: 'medium' },
  { type: 'quality', text: 'AI quality score for recent hires is 88% - above industry benchmark', priority: 'low' },
];

const pipelineStages = [
  { key: 'offer_accepted', label: 'Offer Accepted', icon: FileText, color: CLR.warning },
  { key: 'documents_pending', label: 'Documents Submitted', icon: Upload, color: CLR.info },
  { key: 'bg_verification', label: 'Background Verification', icon: Shield, color: CLR.purple },
  { key: 'joining_confirmed', label: 'Joining Confirmed', icon: CalendarDays, color: CLR.teal },
  { key: 'orientation', label: 'Orientation', icon: GraduationCap, color: CLR.orange },
  { key: 'completed', label: 'Successfully Onboarded', icon: Award, color: CLR.success },
];

function Counter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const inc = value / (duration / 16);
    const timer = setInterval(() => {
      start += inc;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{count.toLocaleString()}</>;
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data.map((v, i) => ({ i, v }))}>
        <defs>
          <linearGradient id={`mc${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#mc${color.replace('#', '')})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
      ))}
    </div>
  );
}

function Info({ size }: { size?: number }) {
  return (
    <svg width={size || 12} height={size || 12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function Paperclip({ size }: { size?: number }) {
  return (
    <svg width={size || 14} height={size || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

export default function HiredDashboard({ provider }: { provider: any }) {
  const [hired, setHired] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [activeTimelineTab, setActiveTimelineTab] = useState('all');
  const [advancedFilters, setAdvancedFilters] = useState(false);
  const [selectedHires, setSelectedHires] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    apiClient.get<any[]>('/job-provider/applications/hired').then((r) => {
      if (r.success && r.data && r.data.length > 0) setHired(r.data);
      else setHired([]);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let list = hired;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) =>
        c.applicant_name?.toLowerCase().includes(q) ||
        c.applicant_role?.toLowerCase().includes(q) ||
        c.department?.toLowerCase().includes(q) ||
        c.applicant_email?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') list = list.filter((c) => c.status === statusFilter);
    if (departmentFilter !== 'all') list = list.filter((c) => c.department === departmentFilter);
    return list;
  }, [hired, searchQuery, statusFilter, departmentFilter]);

  const totalHires = hired.length;
  const activeEmployees = hired.filter((c) => c.status === 'joined').length;
  const joiningSoon = hired.filter((c) => c.status === 'joining_soon' || c.status === 'offer_accepted').length;
  const offerAcceptanceRate = totalHires > 0 ? Math.round((hired.filter((c) => c.joining_confirmed).length / totalHires) * 100) : 0;
  const avgTimeToHire = 14;
  const qualityScore = Math.round(hired.reduce((s, c) => s + (c.ai_score || 0), 0) / Math.max(hired.length, 1));

  const departments = [...new Set(hired.map((c) => c.department))];
  const statuses = [...new Set(hired.map((c) => c.status))];

  const onboardingPipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    hired.forEach((c) => {
      const stage = c.onboarding_stage || 'offer_accepted';
      counts[stage] = (counts[stage] || 0) + 1;
    });
    return counts;
  }, [hired]);

  const successHighlights = [
    { icon: Building2, label: 'Top Hiring Department', value: 'Engineering', detail: '14 hires this quarter', color: CLR.primary },
    { icon: Users, label: 'Best Recruitment Source', value: 'LinkedIn', detail: '35% of all hires', color: CLR.success },
    { icon: Zap, label: 'Fastest Hiring Process', value: 'Design Team', detail: '12 days avg', color: CLR.warning },
    { icon: TrendingUp, label: 'Highest Offer Acceptance', value: `${offerAcceptanceRate}%`, detail: 'Across all departments', color: CLR.teal },
    { icon: ArrowUpRight, label: 'Monthly Hiring Growth', value: '+60%', detail: 'June vs May', color: CLR.purple },
  ];

  const toggleSelect = (id: string) => {
    setSelectedHires(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedHires.size === filtered.length) setSelectedHires(new Set());
    else setSelectedHires(new Set(filtered.map((a: any) => a.id)));
  };

  const getStageIcon = (stage: string) => {
    const config = pipelineStages.find(s => s.key === stage);
    if (!config) return <Star size={12} />;
    const Icon = config.icon;
    return <Icon size={12} />;
  };

  const getStageColor = (stage: string) => pipelineStages.find(s => s.key === stage)?.color || '#6B7280';
  const getStageBg = (stage: string) => `${getStageColor(stage)}15`;
  const getStageLabel = (stage: string) => pipelineStages.find(s => s.key === stage)?.label || stage;

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" /></div>;
  return <HiredDashboardContent
    hired={hired} filtered={filtered} totalHires={totalHires} activeEmployees={activeEmployees}
    joiningSoon={joiningSoon} offerAcceptanceRate={offerAcceptanceRate} avgTimeToHire={avgTimeToHire}
    qualityScore={qualityScore} departments={departments} statuses={statuses}
    onboardingPipelineCounts={onboardingPipelineCounts} successHighlights={successHighlights}
    searchQuery={searchQuery} statusFilter={statusFilter} departmentFilter={departmentFilter}
    selectedCandidate={selectedCandidate} showAnalytics={showAnalytics} showAIInsights={showAIInsights}
    showReportModal={showReportModal} showExportModal={showExportModal} showMessageModal={showMessageModal}
    showScheduleModal={showScheduleModal} showDocModal={showDocModal}
    messageText={messageText} scheduleDate={scheduleDate} scheduleTime={scheduleTime}
    advancedFilters={advancedFilters} selectedHires={selectedHires}
    pipelineStages={pipelineStages} aiRecommendations={aiRecommendations} CLR={CLR}
    onSetSearchQuery={setSearchQuery} onSetStatusFilter={setStatusFilter}
    onSetDepartmentFilter={setDepartmentFilter} onSetSelectedCandidate={setSelectedCandidate}
    onSetShowAnalytics={setShowAnalytics} onSetShowAIInsights={setShowAIInsights}
    onSetShowReportModal={setShowReportModal} onSetShowExportModal={setShowExportModal}
    onSetShowMessageModal={setShowMessageModal} onSetShowScheduleModal={setShowScheduleModal}
    onSetShowDocModal={setShowDocModal} onSetMessageText={setMessageText} onSetScheduleDate={setScheduleDate}
    onSetScheduleTime={setScheduleTime} onSetAdvancedFilters={setAdvancedFilters}
    onToggleSelect={toggleSelect} onToggleSelectAll={toggleSelectAll}
    getStageIcon={getStageIcon} getStageColor={getStageColor} getStageLabel={getStageLabel}
  />;
}