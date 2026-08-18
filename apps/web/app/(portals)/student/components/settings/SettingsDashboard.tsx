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
  Lock, Upload, Fingerprint, BookMarked, Quote, Sun, Moon,
  Monitor, Wifi, Smartphone, Bell, BellOff,
  Mail, MailOpen, MessageSquare, CalendarRange, Languages,
  Key, Trash2, DownloadCloud, LogOut, UserX, UsersRound,
  EyeOff, Share2, Settings, Sliders, Database, HardDrive,
  AlertTriangle, ScanFace, QrCode, Info, Tablet,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };

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



const SectionCard = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
  <Card className={`p-5 ${className}`}>
    <div className="mb-3">
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </Card>
);

interface SettingsDashboardProps {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

export function SettingsDashboard({ darkMode, setDarkMode }: SettingsDashboardProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'security' | 'notifications' | 'privacy'>('overview');
  const [toggles, setToggles] = useState({ notifications: true, emailAlerts: false, calendarReminders: true, backupEmail: true, twoFactor: true, securityAlerts: false });

  const toggle = (key: keyof typeof toggles) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  const securityScore = 0;
  const activeDevices = 0;
  const profileCompletion = 0;

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Settings & Account Center</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account, privacy, notifications, security, devices, and personal preferences.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="px-4 py-2 text-xs font-medium text-[#6D4CFF] bg-[#F3F0FF] rounded-xl hover:bg-[#EBE6FF] transition-all flex items-center gap-2">
            <DownloadCloud className="w-4 h-4" /> Download Data
          </button>
          <button className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] rounded-xl shadow-[0_4px_14px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_20px_rgba(109,76,255,0.4)] transition-all flex items-center gap-2">
            <ShieldPlus className="w-4 h-4" /> Security Checkup
          </button>
        </div>
      </motion.div>

      {/* Account Status Banner */}
      <motion.div variants={fadeUp} className="rounded-2xl bg-gradient-to-br from-[#6D4CFF] via-[#7B5DFF] to-[#8B6FFF] p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex-1">
            <h2 className="text-xl font-extrabold mb-3">Account Security Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: BadgeCheck, label: 'Account Status', value: 'Active', color: '#22C55E' },
                { icon: Clock, label: 'Last Login', value: 'Today, 10:24 AM' },
                { icon: ShieldPlus, label: '2FA Status', value: 'Enabled', color: '#22C55E' },
                { icon: Mail, label: 'Recovery Email', value: 'Verified', color: '#22C55E' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                    <Icon size={16} className={s.color || 'text-white/80'} />
                    <div>
                      <div className="text-[9px] text-white/60">{s.label}</div>
                      <div className="text-xs font-bold">{s.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <ShieldPlus size={32} className="text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-white to-[#F0FDF4] border-green-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50"><ShieldPlus size={20} style={{ color: COLORS.success }} /></div>
            <Badge variant="success" className="text-[8px]">Strong</Badge>
          </div>
          <div className="text-2xl font-extrabold text-gray-900"><CounterAnimation value={securityScore} />%</div>
          <div className="text-xs text-gray-500 font-medium">Security Score</div>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-white to-[#F3F0FF] border-[#6D4CFF]/10">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F3F0FF]"><Laptop size={20} style={{ color: COLORS.primary }} /></div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900"><CounterAnimation value={activeDevices} /></div>
          <div className="text-xs text-gray-500 font-medium">Active Devices</div>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-white to-[#FFFBEB] border-yellow-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-yellow-50"><Bell size={20} style={{ color: COLORS.warning }} /></div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{toggles.notifications ? 'On' : 'Off'}</div>
          <div className="text-xs text-gray-500 font-medium">Notifications</div>
        </Card>
        <Card className="p-5 bg-gradient-to-br from-white to-[#FFFBEB] border-yellow-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50"><User size={20} style={{ color: COLORS.info }} /></div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900"><CounterAnimation value={profileCompletion} />%</div>
          <div className="text-xs text-gray-500 font-medium">Profile Completion</div>
        </Card>
      </motion.div>

      {/* Section Tabs */}
      <motion.div variants={fadeUp} className="flex gap-2 flex-wrap border-b border-gray-100 pb-3">
        {[
          { key: 'overview' as const, label: 'Overview', icon: Settings },
          { key: 'security' as const, label: 'Security', icon: ShieldPlus },
          { key: 'notifications' as const, label: 'Notifications', icon: Bell },
          { key: 'privacy' as const, label: 'Privacy', icon: EyeOff },
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

            {/* Preferences */}
            <SectionCard title="Preferences" subtitle="Customize your experience">
              <div className="space-y-1">
                {[
                  { label: 'Dark Mode', desc: 'Toggle dark theme across the platform', icon: darkMode ? Moon : Sun, key: 'darkMode', isToggle: true, toggled: darkMode, action: () => setDarkMode(!darkMode) },
                  { label: 'Push Notifications', desc: 'Receive push notifications for updates', icon: Bell, key: 'push', isToggle: true, toggled: toggles.notifications, action: () => toggle('notifications') },
                  { label: 'Email Alerts', desc: 'Receive email notifications for important updates', icon: Mail, key: 'emailAlerts', isToggle: true, toggled: toggles.emailAlerts, action: () => toggle('emailAlerts') },
                  { label: 'Calendar Reminders', desc: 'Get reminded about upcoming events and deadlines', icon: CalendarDays, key: 'calendarReminders', isToggle: true, toggled: toggles.calendarReminders, action: () => toggle('calendarReminders') },
                  { label: 'Language', desc: 'Select your preferred language', icon: Languages, key: 'lang', isToggle: false, value: 'English (US)' },
                  { label: 'Appearance Theme', desc: 'Choose between light, dark, or system theme', icon: Palette, key: 'theme', isToggle: false, value: 'System Default' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 text-gray-500 border border-gray-100">
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-900">{item.label}</div>
                          <div className="text-[9px] text-gray-400">{item.desc}</div>
                        </div>
                      </div>
                      {'isToggle' in item && item.isToggle ? (
                        <button onClick={item.action}
                          className={`w-11 h-6 rounded-full transition-all relative ${item.toggled ? 'bg-[#6D4CFF]' : 'bg-gray-200'}`}
                        >
                          <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm absolute top-0.75 transition-all ${item.toggled ? 'left-5.5' : 'left-0.75'}`} style={{ width: 18, height: 18, top: 3 }} />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-gray-600">{item.value}</span>
                          <ChevronDown size={12} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* AI Settings Suggestions */}
            <SectionCard title="Recommended by Prerana AI" subtitle="Security and account improvement suggestions">
              <div className="space-y-2">
                {[
                  { title: 'Enable Security Alerts', priority: 'High', benefit: 'Get notified of suspicious logins', done: toggles.securityAlerts },
                  { title: 'Turn On Backup Email', priority: 'High', benefit: 'Account recovery option', done: toggles.backupEmail },
                  { title: 'Activate Two-Factor Auth', priority: 'High', benefit: 'Extra layer of security', done: toggles.twoFactor },
                  { title: 'Complete Profile Info', priority: 'Medium', benefit: 'Better personalized experience', done: false },
                  { title: 'Review Connected Devices', priority: 'Medium', benefit: 'Remove unrecognized devices', done: false },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#F3F0FF] to-white border border-[#6D4CFF]/10">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${r.done ? 'bg-green-100 text-green-600' : 'bg-[#6D4CFF]/10 text-[#6D4CFF]'}`}>
                      {r.done ? <CheckCircle2 size={12} /> : <Lightbulb size={12} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-gray-900">{r.title}</span>
                        <Badge variant={r.priority === 'High' ? 'danger' : 'warning'} className="text-[7px]">{r.priority}</Badge>
                      </div>
                      <div className="text-[8px] text-gray-500">{r.benefit}</div>
                    </div>
                    {!r.done && <button className="px-2.5 py-1 rounded-lg bg-[#6D4CFF] text-white text-[8px] font-semibold hover:bg-[#5A3FD6] transition-all">Enable</button>}
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 py-2 rounded-xl bg-[#6D4CFF] text-white text-[10px] font-semibold hover:bg-[#5A3FD6] transition-all">Enable All Recommended</button>
            </SectionCard>

            {/* Security Overview */}
            <SectionCard title="Security Overview" subtitle="Your account security status">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Password Strength', value: 'Strong', color: COLORS.success, score: 85 },
                  { label: 'Two-Factor Auth', value: 'Enabled', color: COLORS.success, score: 100 },
                  { label: 'Recovery Options', value: '2 Methods', color: COLORS.warning, score: 60 },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] text-gray-500">{s.label}</span>
                      <Badge variant={s.color === COLORS.success ? 'success' : 'warning'} className="text-[7px]">{s.value}</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${s.score}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center gap-2">
                  <ShieldPlus size={16} className="text-green-600" />
                  <span className="text-[10px] font-semibold text-green-700">Your account security is strong</span>
                </div>
                <button className="px-3 py-1 rounded-lg bg-green-600 text-white text-[8px] font-semibold hover:bg-green-700 transition-all">Run Checkup</button>
              </div>
            </SectionCard>

            {/* Login Activity */}
            <SectionCard title="Login Activity" subtitle="Recent sign-ins to your account">
              <div className="space-y-2">
                {([] as any[]).map((l: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-[10px]">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        l.status === 'Current' ? 'bg-green-100 text-green-600' : l.status === 'Active' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Laptop size={12} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-gray-900 truncate">{l.device}</div>
                        <div className="text-[8px] text-gray-400">{l.location} • {l.ip}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-[9px] text-gray-500">{l.date}</div>
                      <Badge variant={l.status === 'Current' ? 'success' : l.status === 'Active' ? 'info' : 'default'} className="text-[7px]">{l.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

          </div>

          {/* Right (40%) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Account Management */}
            <SectionCard title="Account Management" subtitle="Manage your account settings">
              <div className="space-y-2">
                {[
                  { label: 'Change Password', desc: 'Update your account password', icon: Key, color: COLORS.primary },
                  { label: 'Language Settings', desc: 'Change interface language', icon: Languages, color: COLORS.success },
                  { label: 'Privacy Settings', desc: 'Control your data and visibility', icon: EyeOff, color: COLORS.warning },
                  { label: 'Notification Settings', desc: 'Manage notification preferences', icon: Bell, color: COLORS.info },
                  { label: 'Connected Accounts', desc: 'Manage linked accounts and services', icon: Link, color: '#8B5CF6' },
                  { label: 'Delete Account', desc: 'Permanently delete your account', icon: Trash2, color: COLORS.danger },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button key={i} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all group">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${item.color}12`, color: item.color }}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-xs font-semibold text-gray-900">{item.label}</div>
                        <div className="text-[9px] text-gray-400">{item.desc}</div>
                      </div>
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-[#6D4CFF] transition-all" />
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* Quick Actions */}
            <SectionCard title="Quick Actions">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Download My Data', icon: Download, color: COLORS.primary },
                  { label: 'Connected Apps', icon: Link, color: COLORS.success },
                  { label: 'Manage Devices', icon: Laptop, color: COLORS.warning },
                  { label: 'Blocked Users', icon: UserX, color: COLORS.danger },
                  { label: 'Activity Log', icon: Clock, color: COLORS.info },
                  { label: 'Backup Account', icon: Upload, color: '#8B5CF6' },
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

            {/* Connected Devices */}
            <SectionCard title="Connected Devices" subtitle="0 active sessions">
              <div className="space-y-2">
                {([] as any[]).map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      d.type === 'laptop' ? 'bg-[#F3F0FF] text-[#6D4CFF]' : d.type === 'phone' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {d.type === 'laptop' ? <Laptop size={16} /> : d.type === 'phone' ? <Smartphone size={16} /> : <Tablet size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-gray-900">{d.name}</span>
                        {d.trusted && <BadgeCheck size={10} className="text-green-500" />}
                      </div>
                      <div className="text-[8px] text-gray-400">{d.browser} • Last active: {d.lastActive}</div>
                    </div>
                    <button className="px-2.5 py-1 rounded-lg bg-gray-200 text-gray-600 text-[8px] font-medium hover:bg-gray-300 transition-all">Remove</button>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Account Recovery */}
            <SectionCard title="Account Recovery" subtitle="Recovery options for your account">
              <div className="space-y-2">
                {[
                  { label: 'Recovery Email', value: 's*****@gmail.com', icon: Mail, verified: true },
                  { label: 'Recovery Phone', value: '+91 ******3210', icon: PhoneCall, verified: true },
                  { label: 'Backup Codes', value: '5 codes remaining', icon: Key, verified: true },
                ].map((r, i) => {
                  const Icon = r.icon;
                  return (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${r.verified ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          <Icon size={12} />
                        </div>
                        <div>
                          <div className="text-[9px] font-semibold text-gray-900">{r.label}</div>
                          <div className="text-[8px] text-gray-400">{r.value}</div>
                        </div>
                      </div>
                      {r.verified && <CheckCircle2 size={12} className="text-green-500" />}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 py-2 rounded-xl bg-[#6D4CFF] text-white text-[9px] font-semibold hover:bg-[#5A3FD6] transition-all">Update Recovery</button>
                <button className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-600 text-[9px] font-semibold hover:bg-gray-200 transition-all">Generate Codes</button>
              </div>
            </SectionCard>

          </div>
        </div>
      )}

      {/* Security Section */}
      {activeSection === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <SectionCard title="Security Tools" subtitle="Tools to protect your account">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'Password Manager', desc: 'Store and manage passwords securely', icon: Key, color: COLORS.primary, status: 'Active' },
                  { name: 'Security Checkup', desc: 'Review account security recommendations', icon: ShieldPlus, color: COLORS.success, status: 'Run Now' },
                  { name: 'Login History', desc: 'View all sign-in attempts', icon: Clock, color: COLORS.warning, status: 'View' },
                  { name: 'Device Verification', desc: 'Manage trusted devices', icon: ScanFace, color: COLORS.info, status: 'Manage' },
                  { name: 'Suspicious Activity', desc: 'Monitor unusual account behavior', icon: AlertTriangle, color: COLORS.danger, status: 'Monitor' },
                  { name: 'Backup & Recovery', desc: 'Secure your account recovery options', icon: Database, color: '#8B5CF6', status: 'Configure' },
                ].map((t, i) => {
                  const Icon = t.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-sm transition-all">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${t.color}12`, color: t.color }}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold text-gray-900">{t.name}</div>
                        <div className="text-[8px] text-gray-400">{t.desc}</div>
                      </div>
                      <Badge variant={t.status === 'Active' ? 'success' : t.status === 'Run Now' ? 'warning' : 'info'} className="text-[7px] cursor-pointer">{t.status}</Badge>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <SectionCard title="Security Score" subtitle="Overall account protection">
              <div className="text-center">
                <div className="relative w-28 h-28 mx-auto mb-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
                    <circle cx="55" cy="55" r="48" fill="none" stroke="#F3F0FF" strokeWidth="8" />
                    <circle cx="55" cy="55" r="48" fill="none" stroke="#22C55E" strokeWidth="8"
                      strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 48}`}
                      strokeDashoffset={`${2 * Math.PI * 48 * 0.06}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <ShieldPlus size={24} className="text-green-500 mb-0.5" />
                    <span className="text-2xl font-extrabold text-green-600">{securityScore}%</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mb-4">Your account security is in great shape</p>
                <div className="space-y-2">
                  {[
                    { label: 'Password', score: 85 },
                    { label: '2FA', score: 100 },
                    { label: 'Recovery', score: 60 },
                    { label: 'Devices', score: 90 },
                    { label: 'Activity', score: 95 },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[9px] text-gray-500 w-16">{s.label}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${s.score}%`, background: s.score >= 90 ? '#22C55E' : s.score >= 70 ? '#F59E0B' : '#EF4444' }} />
                      </div>
                      <span className="text-[9px] font-medium text-gray-600">{s.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* Notifications Section */}
      {activeSection === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <SectionCard title="Notification Center" subtitle="Manage your notification preferences">
              <div className="space-y-2">
                {([] as any[]).map((n: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        n.priority === 'High' ? 'bg-red-50 text-red-500' : n.priority === 'Medium' ? 'bg-yellow-50 text-yellow-500' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Bell size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-gray-900">{n.category}</span>
                          <Badge variant={n.priority === 'High' ? 'danger' : n.priority === 'Medium' ? 'warning' : 'default'} className="text-[7px]">{n.priority}</Badge>
                        </div>
                        <div className="text-[9px] text-gray-400">{n.desc}</div>
                      </div>
                    </div>
                    <button
                      className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${n.enabled ? 'bg-[#6D4CFF]' : 'bg-gray-200'}`}
                    >
                      <div className={`w-[18px] h-[18px] rounded-full bg-white shadow-sm absolute top-[3px] transition-all ${n.enabled ? 'left-[23px]' : 'left-[3px]'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <SectionCard title="Notification Summary" subtitle="Your current notification status">
              <div className="space-y-3">
                {[
                  { label: 'Enabled Categories', value: '0/0', icon: Bell, color: COLORS.success },
                  { label: 'High Priority', value: 0, icon: AlertCircle, color: COLORS.danger },
                  { label: 'Medium Priority', value: 0, icon: Clock, color: COLORS.warning },
                  { label: 'Low Priority', value: 0, icon: Info, color: COLORS.info },
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
          </div>
        </div>
      )}

      {/* Privacy Section */}
      {activeSection === 'privacy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <SectionCard title="Privacy Center" subtitle="Control your data and visibility">
              <div className="space-y-2">
                {([] as any[]).map((s: any, i: number) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#F3F0FF] text-[#6D4CFF]"><Icon size={16} /></div>
                        <div>
                          <div className="text-xs font-semibold text-gray-900">{s.label}</div>
                          <div className="text-[9px] text-gray-400">{s.value}</div>
                        </div>
                      </div>
                      <button className="px-3 py-1 rounded-lg bg-gray-200 text-gray-600 text-[8px] font-medium hover:bg-gray-300 transition-all">Change</button>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
            <SectionCard title="Data & Storage" subtitle="Your account storage usage">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Used Storage', value: '2.4 GB / 10 GB', icon: HardDrive, color: COLORS.primary, pct: 24 },
                  { label: 'Documents', value: '156 files', icon: FileText, color: COLORS.success, pct: 35 },
                  { label: 'Certificates', value: '8 files', icon: Award, color: COLORS.warning, pct: 5 },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12`, color: s.color }}><Icon size={14} /></div>
                        <div>
                          <div className="text-[10px] font-semibold text-gray-900">{s.label}</div>
                          <div className="text-[8px] text-gray-400">{s.value}</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="w-full py-2 rounded-xl border border-gray-200 text-gray-500 text-[10px] font-medium hover:bg-gray-50 transition-all">Manage Storage</button>
            </SectionCard>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <SectionCard title="Preferences Center" subtitle="Customize your experience further">
              <div className="space-y-2">
                {[
                  { label: 'Theme', value: 'System Default', icon: Monitor },
                  { label: 'Language', value: 'English (US)', icon: Languages },
                  { label: 'Timezone', value: 'IST (UTC +5:30)', icon: Clock },
                  { label: 'Font Size', value: 'Medium', icon: FileText },
                  { label: 'Display Density', value: 'Comfortable', icon: Sliders },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <Icon size={12} className="text-gray-400" />
                        <span className="text-[9px] text-gray-600">{s.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-medium text-gray-900">{s.value}</span>
                        <ChevronDown size={10} className="text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
            <SectionCard title="Export & Delete" subtitle="Your data control options">
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600"><Download size={16} /></div>
                  <div className="text-left flex-1">
                    <div className="text-xs font-semibold text-gray-900">Export Personal Data</div>
                    <div className="text-[9px] text-gray-400">Download all your account data</div>
                  </div>
                  <ArrowRight size={14} className="text-gray-300" />
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 hover:bg-white hover:shadow-sm transition-all">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-50 text-red-600"><Trash2 size={16} /></div>
                  <div className="text-left flex-1">
                    <div className="text-xs font-semibold text-red-600">Delete Account</div>
                    <div className="text-[9px] text-gray-400">Permanently delete your data</div>
                  </div>
                  <ArrowRight size={14} className="text-gray-300" />
                </button>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* Bottom Security Banner */}
      <motion.div variants={fadeUp} className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-[#6D4CFF]/10 rounded-full -translate-x-1/4 -translate-y-1/4" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#6D4CFF]/20 flex items-center justify-center flex-shrink-0">
              <ShieldPlus size={28} className="text-[#6D4CFF]" />
            </div>
            <div>
              <h3 className="text-base font-bold">Your Security Is Our Priority</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-lg">We continuously monitor your account to keep your data safe and secure. Stay protected with our advanced security features.</p>
            </div>
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-[#6D4CFF] text-white text-xs font-bold hover:bg-[#5A3FD6] transition-all flex-shrink-0 flex items-center gap-2">
            <Lightbulb size={14} /> Security Tips
          </button>
        </div>
      </motion.div>

    </motion.div>
  );
}
