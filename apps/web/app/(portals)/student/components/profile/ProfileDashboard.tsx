'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, ChevronLeft, ChevronRight,
  Download, Clock, CheckCircle2, AlertCircle, Award, Star,
  TrendingUp, FileText, Brain, Lightbulb, CalendarDays, X, Mic,
  Target, Timer, ChevronDown, Calendar, MapPin, Users, Trophy,
  Zap, Gift, BookOpen, Flag, Camera, Medal, Flame, Heart,
  User, ArrowRight, Link, ExternalLink, Briefcase, DollarSign,
  Send, Bookmark, Eye, Edit3, RefreshCw, Globe, GraduationCap,
  Building, MapPinned, Laptop, PenTool, Code, ChartBar,
  Headphones, Megaphone, ShoppingCart, Palette, Smile,
  PhoneCall, Clock12, BadgeCheck, ShieldPlus, Route,
  Lock, Upload, Fingerprint, BookMarked, Quote,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';
import { certificateApi } from '../../lib/dataService';
import { useApi } from '../../lib/useApi';

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

const demoCertificates: any[] = [];

const demoBadges: any[] = [];

const subjectPerformance = [
  { name: 'Mathematics', score: 92, color: '#6D4CFF', trend: 'up' },
  { name: 'Science', score: 85, color: '#22C55E', trend: 'up' },
  { name: 'English', score: 78, color: '#F59E0B', trend: 'steady' },
  { name: 'Computer Science', score: 95, color: '#3B82F6', trend: 'up' },
  { name: 'Social Studies', score: 72, color: '#EF4444', trend: 'down' },
];

const demoActivity: any[] = [];

const demoSkills: any[] = [];
const demoGoals: any[] = [];

const demoDocuments: any[] = [];

const demoPortfolio: any[] = [];

const aiInsights = [
  { title: 'Improve Math Score', priority: 'High', benefit: '+15% overall average', action: 'Start Practice', time: '30 min/day' },
  { title: 'Join AI Club', priority: 'High', benefit: 'Build portfolio projects', action: 'Explore', time: 'Now' },
  { title: 'Apply for Scholarship', priority: 'Medium', benefit: 'Up to ₹50,000 grant', action: 'View', time: 'This week' },
  { title: 'Complete Profile Fields', priority: 'Medium', benefit: 'Better academic insights', action: 'Update', time: '5 min' },
  { title: 'Attend Workshop', priority: 'Low', benefit: 'Learn industry skills', action: 'Register', time: 'Next week' },
];

const statsData = [
  { label: 'Assignments', value: 48, icon: FileText, color: COLORS.primary },
  { label: 'Events Attended', value: 24, icon: Calendar, color: COLORS.success },
  { label: 'Certificates', value: 8, icon: Award, color: COLORS.warning },
  { label: 'Courses Completed', value: 12, icon: BookOpen, color: COLORS.info },
  { label: 'Attendance', value: '94%', icon: CheckCircle2, color: COLORS.success },
  { label: 'Community Points', value: 1250, icon: Star, color: '#EC4899' },
];

const SectionCard = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
  <Card className={`p-5 ${className}`}>
    <div className="mb-3">
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </Card>
);

interface ProfileDashboardProps {
  certsHook: any;
  certsData: any[];
  session: any;
}

export function ProfileDashboard({ certsHook, certsData, session }: ProfileDashboardProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'portfolio' | 'documents'>('overview');

  const profile = session?.student || null;
  const uid = session?.user?.id || '';

  const userInitials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'S';

  const achievementsList = useMemo(() => {
    if (Array.isArray(certsData) && certsData.length > 0) {
      return certsData.slice(0, 6).map((c: any, i: number) => ({
        title: c.title || c.name || 'Certificate',
        desc: c.description || '',
        icon: demoCertificates[i]?.icon || '🏆',
        color: PIE_COLORS[i % PIE_COLORS.length],
        category: c.category || 'General',
        date: c.date || '',
      }));
    }
    return demoCertificates;
  }, [certsData]);

  if (certsHook?.loading && !certsHook.data) {
    return (
      <div className="space-y-6">
        <div className="page-header"><h1>Profile Dashboard</h1><p>Loading your profile...</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 rounded-2xl bg-white border border-gray-100 p-6 animate-pulse h-80" />
          <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 p-6 animate-pulse h-80" />
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Profile Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information, academic progress, achievements, and student journey.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="px-4 py-2 text-xs font-medium text-[#6D4CFF] bg-[#F3F0FF] rounded-xl hover:bg-[#EBE6FF] transition-all flex items-center gap-2">
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
          <button className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] rounded-xl shadow-[0_4px_14px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_20px_rgba(109,76,255,0.4)] transition-all flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Share Profile
          </button>
        </div>
      </motion.div>

      {/* Profile Hero Card */}
      <motion.div variants={fadeUp} className="rounded-2xl bg-gradient-to-br from-[#6D4CFF] via-[#7B5DFF] to-[#8B6FFF] p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24 ring-4 ring-white/30">
              <div className="flex h-full w-full items-center justify-center bg-white/20 text-white text-3xl font-bold rounded-full backdrop-blur-sm">{userInitials}</div>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-extrabold">{profile?.full_name || 'Student'}</h2>
              <Badge className="bg-white/20 text-white border-white/30 text-[9px]">Active</Badge>
              <Badge className="bg-white/15 text-white border-white/20 text-[9px]">ID: {profile?.roll_number || '—'}</Badge>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1.5 text-sm text-white/80">
              <span>{profile?.student_class || 'Class'} • Section {profile?.section || '—'}</span>
              <span>Academic Year 2025 – 2026</span>
              <span>Enrolled: June 2025</span>
            </div>
          </div>
          <div className="flex-shrink-0 text-center">
            <div className="relative w-16 h-16 mx-auto mb-1">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                <circle cx="30" cy="30" r="26" fill="none" stroke="white" strokeWidth="4"
                  strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * 0.08}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-extrabold text-white">92%</span>
              </div>
            </div>
            <div className="text-[10px] text-white/70">Profile Complete</div>
          </div>
        </div>
        <div className="relative z-10 flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/10">
          <button className="px-3.5 py-1.5 rounded-xl bg-white/15 text-white text-[10px] font-semibold hover:bg-white/25 transition-all flex items-center gap-1.5"><Edit3 size={12} /> Edit Profile</button>
          <button className="px-3.5 py-1.5 rounded-xl bg-white/15 text-white text-[10px] font-semibold hover:bg-white/25 transition-all flex items-center gap-1.5"><Share2 size={12} /> Share</button>
          <button className="px-3.5 py-1.5 rounded-xl bg-white/15 text-white text-[10px] font-semibold hover:bg-white/25 transition-all flex items-center gap-1.5"><Download size={12} /> Download</button>
          <button className="px-3.5 py-1.5 rounded-xl bg-white/15 text-white text-[10px] font-semibold hover:bg-white/25 transition-all flex items-center gap-1.5"><Lock size={12} /> Privacy</button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-white to-[#F3F0FF] border-[#6D4CFF]/10">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#6D4CFF]/10"><GraduationCap size={20} style={{ color: COLORS.primary }} /></div>
          </div>
          <div className="text-lg font-extrabold text-gray-900">2025 – 26</div>
          <div className="text-xs text-gray-500 font-medium">Academic Year</div>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-white to-[#FFF0F0] border-red-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50"><Award size={20} style={{ color: COLORS.danger }} /></div>
          </div>
          <div className="text-lg font-extrabold text-gray-900"><CounterAnimation value={achievementsList.length} /></div>
          <div className="text-xs text-gray-500 font-medium">Achievements</div>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-white to-[#F0FDF4] border-green-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50"><Target size={20} style={{ color: COLORS.success }} /></div>
          </div>
          <div className="text-lg font-extrabold text-gray-900">92%</div>
          <div className="text-xs text-gray-500 font-medium">Profile Completion</div>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-white to-[#FFFBEB] border-yellow-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-50"><TrendingUp size={20} style={{ color: COLORS.warning }} /></div>
          </div>
          <div className="text-lg font-extrabold text-gray-900">Top 15%</div>
          <div className="text-xs text-gray-500 font-medium">Student Ranking</div>
        </Card>
      </motion.div>

      {/* Section Tabs */}
      <motion.div variants={fadeUp} className="flex gap-2 flex-wrap border-b border-gray-100 pb-3">
        {[
          { key: 'overview' as const, label: 'Overview', icon: User },
          { key: 'portfolio' as const, label: 'Portfolio', icon: Briefcase },
          { key: 'documents' as const, label: 'Documents', icon: FileText },
        ].map((v) => {
          const Icon = v.icon;
          return (
            <button key={v.key} onClick={() => setActiveSection(v.key)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize flex items-center gap-1.5 ${
                activeSection === v.key ? 'bg-[#6D4CFF] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            ><Icon size={12} />{v.label}</button>
          );
        })}
      </motion.div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left (60%) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Personal Information */}
            <SectionCard title="Personal Information" subtitle="Your profile details">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {[
                  { label: 'Full Name', value: profile?.full_name || '—' },
                  { label: 'Student ID', value: profile?.roll_number || '—' },
                  { label: 'Email', value: session?.user?.email || profile?.email || '—' },
                  { label: 'Phone', value: profile?.phone || '+91 98765 43210' },
                  { label: 'Date of Birth', value: profile?.dob || '15 Jan 2004' },
                  { label: 'Gender', value: profile?.gender || '—' },
                  { label: 'Blood Group', value: profile?.blood_group || 'B+' },
                  { label: 'Nationality', value: profile?.nationality || 'Indian' },
                  { label: 'Languages', value: profile?.languages || 'English, Hindi' },
                  { label: 'Address', value: profile?.address || '—' },
                ].map((f, i) => (
                  <div key={i} className="py-1">
                    <div className="text-[9px] text-gray-400 uppercase tracking-wider">{f.label}</div>
                    <div className="text-xs font-semibold text-gray-900 mt-0.5">{f.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <button className="px-4 py-1.5 rounded-xl bg-[#6D4CFF] text-white text-[10px] font-semibold hover:bg-[#5A3FD6] transition-all">Edit Information</button>
                <button className="px-4 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-gray-200 transition-all">Update Contact</button>
              </div>
            </SectionCard>

            {/* Academic Overview */}
            <SectionCard title="Academic Overview" subtitle="Your academic performance at a glance">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Overall %', value: '87%', color: COLORS.primary },
                  { label: 'Attendance', value: '94%', color: COLORS.success },
                  { label: 'Class Rank', value: '#3', color: COLORS.warning },
                  { label: 'Assignments', value: '48/52', color: COLORS.info },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                    <div className="text-sm font-extrabold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[9px] text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Subject Performance */}
              <div className="space-y-3">
                <div className="text-[11px] font-semibold text-gray-600">Subject-wise Performance</div>
                {subjectPerformance.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-24 text-[10px] font-medium text-gray-700 flex-shrink-0">{s.name}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${s.score}%`, background: s.color }} />
                    </div>
                    <div className="flex items-center gap-1 w-12 justify-end">
                      <span className="text-[10px] font-bold text-gray-900">{s.score}%</span>
                      {s.trend === 'up' && <TrendingUp size={10} className="text-green-500" />}
                      {s.trend === 'down' && <TrendingDown size={10} className="text-red-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Student Statistics */}
            <SectionCard title="Student Statistics" subtitle="Your academic and co-curricular stats">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {statsData.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12`, color: s.color }}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-gray-900">{s.value}</div>
                        <div className="text-[9px] text-gray-400">{s.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* Recent Activity */}
            <SectionCard title="Recent Activity" subtitle="Your latest actions and updates">
              <div className="space-y-3">
                {demoActivity.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}12`, color: a.color }}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-gray-900">{a.action}</div>
                        <div className="text-[9px] text-gray-400">{a.detail}</div>
                      </div>
                      <span className="text-[8px] text-gray-400 flex-shrink-0">{a.date}</span>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

          </div>

          {/* Right (40%) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Quick Actions */}
            <SectionCard title="Quick Actions">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Edit Profile', icon: Edit3, color: COLORS.primary },
                  { label: 'Change Password', icon: Lock, color: COLORS.danger },
                  { label: 'Upload Documents', icon: Upload, color: COLORS.success },
                  { label: 'Download Report', icon: Download, color: COLORS.warning },
                  { label: 'Privacy Settings', icon: ShieldPlus, color: COLORS.info },
                  { label: 'Academic Records', icon: FileText, color: '#8B5CF6' },
                ].map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <button key={i} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 hover:shadow-sm transition-all active:scale-95"
                      style={{ background: `${a.color}06` }}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${a.color}12`, color: a.color }}>
                        <Icon size={12} />
                      </div>
                      <span className="text-[9px] font-semibold text-gray-700">{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* Achievements & Certificates */}
            <SectionCard title="Achievements & Certificates" subtitle={`${achievementsList.length} total achievements`}>
              {certsHook?.loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 animate-pulse h-24" />
                  ))}
                </div>
              ) : certsHook?.error ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600">
                  <AlertCircle size={14} /> Failed to load certificates
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto">
                  {achievementsList.map((a: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{a.icon}</span>
                        <span className="text-[10px] font-bold text-gray-900">{a.title}</span>
                      </div>
                      <p className="text-[8px] text-gray-400 leading-relaxed">{a.desc}</p>
                      <div className="flex items-center justify-between mt-2">
                        {a.category && <Badge variant="default" className="text-[7px] bg-gray-200 text-gray-600">{a.category}</Badge>}
                        {a.date && <span className="text-[7px] text-gray-400">{new Date(a.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Badges & Rewards */}
            <SectionCard title="Badges & Rewards" subtitle={`${demoBadges.filter(b => b.earned).length}/${demoBadges.length} earned`}>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {demoBadges.map((b, i) => (
                  <div key={i} className={`p-2.5 rounded-xl text-center border transition-all ${
                    b.earned ? 'bg-gray-50 border-gray-100' : 'bg-gray-50/50 border-dashed border-gray-200 opacity-50'
                  }`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1 ${
                      b.earned ? 'shadow-sm' : 'grayscale'
                    }`} style={{ background: `${b.color}15`, color: b.color }}>
                      <b.icon size={12} />
                    </div>
                    <div className="text-[8px] font-semibold text-gray-700">{b.name}</div>
                    <div className="text-[7px] text-gray-400">{b.points} pts</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F3F0FF] border border-[#6D4CFF]/10">
                <span className="text-[9px] font-semibold text-[#6D4CFF]">Total Points</span>
                <span className="text-sm font-extrabold text-[#6D4CFF]">1,580</span>
              </div>
            </SectionCard>

            {/* Skills & Interests */}
            <SectionCard title="Skills & Interests" subtitle={`${demoSkills.length} skills listed`}>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {demoSkills.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-[#F3F0FF] text-[#6D4CFF] text-[9px] font-medium border border-[#6D4CFF]/10">{s}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-xl bg-[#6D4CFF] text-white text-[9px] font-semibold hover:bg-[#5A3FD6] transition-all">Add Skills</button>
                <button className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-[9px] font-semibold hover:bg-gray-200 transition-all">Get Recommendations</button>
              </div>
            </SectionCard>

            {/* Goals & Progress */}
            <SectionCard title="Goals & Progress" subtitle="Track your personal targets">
              <div className="space-y-3">
                {demoGoals.map((g, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="text-[10px] font-semibold text-gray-900">{g.title}</span>
                        <Badge variant={g.type === 'Academic' ? 'info' : g.type === 'Career' ? 'warning' : 'success'} className="text-[7px] ml-1.5">{g.type}</Badge>
                      </div>
                      <span className="text-[10px] font-bold" style={{ color: g.progress >= 80 ? COLORS.success : g.progress >= 50 ? COLORS.warning : COLORS.danger }}>{g.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${g.progress}%`, background: g.progress >= 80 ? '#22C55E' : g.progress >= 50 ? '#F59E0B' : '#EF4444' }} />
                    </div>
                    <div className="text-[8px] text-gray-400 mt-1">Due: {new Date(g.deadline).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* AI Insights */}
            <SectionCard title="Recommended by Prerana AI" subtitle="Personalized suggestions for you">
              <div className="space-y-2">
                {aiInsights.slice(0, 4).map((r, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-gradient-to-r from-[#F3F0FF] to-white border border-[#6D4CFF]/10">
                    <div className="flex items-start gap-2">
                      <Brain size={12} className="text-[#6D4CFF] mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-gray-900">{r.title}</span>
                          <Badge variant={r.priority === 'High' ? 'danger' : r.priority === 'Medium' ? 'warning' : 'default'} className="text-[7px]">{r.priority}</Badge>
                        </div>
                        <div className="text-[8px] text-gray-500">{r.benefit} • {r.time}</div>
                        <button className="text-[8px] text-[#6D4CFF] font-semibold hover:underline mt-0.5">{r.action} →</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

          </div>
        </div>
      )}

      {/* Portfolio Section */}
      {activeSection === 'portfolio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <SectionCard title="Portfolio" subtitle="Showcase your projects, research, competitions & more">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {demoPortfolio.map((p, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#6D4CFF]">
                          {p.type === 'Project' ? <Code size={16} /> : p.type === 'Research' ? <BookOpen size={16} /> : p.type === 'Competition' ? <Trophy size={16} /> : <Briefcase size={16} />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">{p.title}</div>
                          <Badge variant={p.status === 'Completed' ? 'success' : p.status === 'Winner' ? 'warning' : 'info'} className="text-[7px]">{p.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-[9px] text-gray-500 mb-2">{p.tech}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] text-gray-400">{p.type} • {new Date(p.date).toLocaleDateString('en', { month: 'short', year: 'numeric' })}</span>
                      <button className="text-[8px] text-[#6D4CFF] font-semibold hover:underline">View Details →</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-xs font-semibold hover:border-[#6D4CFF]/30 hover:text-[#6D4CFF] transition-all">
                + Add New Portfolio Item
              </button>
            </SectionCard>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <SectionCard title="Portfolio Stats" subtitle="Your professional showcase">
              <div className="space-y-3">
                {[
                  { label: 'Projects', value: '4', icon: Code, color: COLORS.primary },
                  { label: 'Research Papers', value: '2', icon: BookOpen, color: COLORS.success },
                  { label: 'Competitions Won', value: '3', icon: Trophy, color: COLORS.warning },
                  { label: 'Internships', value: '1', icon: Briefcase, color: COLORS.info },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12`, color: s.color }}><Icon size={16} /></div>
                      <div>
                        <div className="text-sm font-extrabold text-gray-900">{s.value}</div>
                        <div className="text-[9px] text-gray-400">{s.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
            <SectionCard title="Profile Visibility" subtitle="Who can see your portfolio">
              <div className="space-y-2">
                {[
                  { label: 'Profile visible to', value: 'Teachers & Students', icon: Globe },
                  { label: 'Portfolio public', value: 'Yes', icon: Eye },
                  { label: 'Contact info', value: 'Private', icon: Lock },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <Icon size={12} className="text-gray-400" />
                        <span className="text-[9px] text-gray-600">{s.label}</span>
                      </div>
                      <span className="text-[9px] font-semibold text-gray-900">{s.value}</span>
                    </div>
                  );
                })}
              </div>
              <button className="w-full mt-3 py-2 rounded-xl border border-gray-200 text-gray-500 text-[10px] font-medium hover:bg-gray-50 transition-all">Manage Privacy</button>
            </SectionCard>
          </div>
        </div>
      )}

      {/* Documents Section */}
      {activeSection === 'documents' && (
        <SectionCard title="Document Center" subtitle={`${demoDocuments.length} documents stored`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {demoDocuments.map((d, i) => {
              const Icon = d.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-sm transition-all cursor-pointer">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    d.name.includes('ID') ? 'bg-[#F3F0FF] text-[#6D4CFF]' :
                    d.name.includes('Mark') ? 'bg-green-50 text-green-600' :
                    d.name.includes('Bonafide') ? 'bg-blue-50 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-gray-900 truncate">{d.name}</div>
                    <div className="text-[8px] text-gray-400">{d.type} • {d.size}</div>
                    <div className="text-[8px] text-gray-400">Updated: {new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-[#6D4CFF]"><Eye size={12} /></button>
                    <button className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-[#6D4CFF]"><Download size={12} /></button>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="w-full mt-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-xs font-semibold hover:border-[#6D4CFF]/30 hover:text-[#6D4CFF] transition-all">
            + Upload New Document
          </button>
        </SectionCard>
      )}

    </motion.div>
  );
}

// Share2 icon (not in older lucide versions)
function Share2(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>}
// TrendingDown icon
function TrendingDown(props: any) { return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>}
