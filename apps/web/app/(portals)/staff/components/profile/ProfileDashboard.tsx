'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircle, School, BookOpen, Users, Mail, Phone, MapPin, Award,
  CalendarDays, Clock, CheckCircle2, AlertCircle, Star, Sparkles,
  TrendingUp, Target, HelpCircle, Send, Globe, BarChart3, Edit3,
  Shield, Key, Bell, Settings, LogOut, Camera, Medal, Trophy,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const PCOLORS = { primary: '#7C3AED', secondary: '#8B5CF6', tertiary: '#6366F1', success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };

interface ProfileDashboardProps {
  darkMode?: boolean;
  setActiveTab?: (tab: string) => void;
  session?: any;
  classes?: any[];
  students?: any[];
  userInitials?: string;
  profileTab?: string;
  setProfileTab?: (tab: string) => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

function CounterAnimation({ value, suffix = '', duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => {
    let start = 0;
    const inc = value / (duration * 60);
    ref.current = setInterval(() => {
      start += inc;
      if (start >= value) { setCount(value); clearInterval(ref.current); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(ref.current);
  }, [value, duration]);
  return <span>{count}{suffix}</span>;
}

export function ProfileDashboard({ darkMode, setActiveTab, session, classes = [], students = [], userInitials = 'T', profileTab: extProfileTab, setProfileTab: extSetProfileTab }: ProfileDashboardProps) {
  const [localProfileTab, setLocalProfileTab] = useState('overview');
  const activeProfileTab = extProfileTab || localProfileTab;
  const setActiveProfileTab = extSetProfileTab || setLocalProfileTab;
  const [isEditing, setIsEditing] = useState(false);

  const teacher = session?.teacher || {};
  const user = session?.user || {};
  const initials = userInitials || (user.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'T');

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* ===== HERO SECTION ===== */}
      <motion.div variants={fadeUp}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] p-6 md:p-8"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
          <motion.div className="absolute w-72 h-72 rounded-full bg-[#A855F7]/25 blur-[90px]" animate={{ x: [-40, 40, -40], y: [-20, 20, -20], scale: [1, 1.15, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} style={{ top: '-15%', left: '-10%' }} />
          <motion.div className="absolute w-80 h-80 rounded-full bg-[#3B82F6]/20 blur-[100px]" animate={{ x: [30, -30, 30], y: [20, -20, 20], scale: [1.1, 1, 1.1] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} style={{ bottom: '-20%', right: '-10%' }} />
          <motion.div className="absolute w-48 h-48 rounded-full bg-[#EC4899]/15 blur-[80px]" animate={{ x: [-15, 15, -15], y: [30, -30, 30] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} style={{ top: '20%', right: '25%' }} />
          {[...Array(10)].map((_, i) => (
            <motion.div key={i} animate={{ opacity: [0.1, 0.5, 0.1], y: [0, -(12 + (i % 4) * 6), 0], x: [0, (i % 3 - 1) * 10, 0] }} transition={{ duration: 5 + (i % 3) * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }} className="absolute rounded-full bg-white/30 pointer-events-none" style={{ width: `${1.5 + (i % 3) * 1}px`, height: `${1.5 + (i % 3) * 1}px`, top: `${10 + (i * 9) % 80}%`, left: `${5 + (i * 13) % 90}%` }} />
          ))}
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="w-20 h-20 ring-4 ring-white/30">
                <AvatarFallback className="bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-white text-xl font-bold">{initials}</AvatarFallback>
              </Avatar>
              <button onClick={() => toast.success('Photo upload coming soon!')} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-[#7C3AED] transition-all">
                <Camera size={12} />
              </button>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">{user.full_name || 'Teacher'}</h1>
              <p className="text-sm text-purple-100/90">{teacher.subject || user.role || 'Staff'}</p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-purple-200">
                <span className="flex items-center gap-1"><Mail size={11} />{user.email || '—'}</span>
                {teacher.staff_unique_id && <span className="flex items-center gap-1"><Award size={11} />ID: {teacher.staff_unique_id}</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#7C3AED] hover:bg-white/95 hover:shadow-[0_8px_24px_rgba(255,255,255,0.25)] font-bold rounded-xl text-xs h-10 shadow-lg border-0 transition-all"
            >
              <Edit3 size={16} /> {isEditing ? 'Save Profile' : 'Edit Profile'}
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { icon: School, value: classes.length, label: 'Classes', color: '#A855F7' },
            { icon: Users, value: students.length, label: 'Students', color: '#3B82F6' },
            { icon: Award, value: 0, label: 'Achievements', color: '#F59E0B' },
            { icon: CalendarDays, value: '5+', label: 'Years Exp.', color: '#10B981' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={i} whileHover={{ scale: 1.03, y: -2 }} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} className="text-white/80" />
                  <span className="text-[10px] font-medium text-purple-200/80">{stat.label}</span>
                </div>
                <div className="text-lg font-bold text-white">{typeof stat.value === 'number' ? <CounterAnimation value={stat.value} /> : stat.value}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ===== TAB NAVIGATION ===== */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        {[
          { key: 'overview', label: 'Overview', icon: UserCircle },
          { key: 'classes', label: 'My Classes', icon: School },
          { key: 'security', label: 'Security', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveProfileTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all ${activeProfileTab === tab.key ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            ><Icon size={14} />{tab.label}</button>
          );
        })}
      </div>

      {/* ===== TAB: OVERVIEW ===== */}
      {activeProfileTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <Card className="p-6">
              <h3 className="text-base font-bold mb-5">Personal Information</h3>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', value: user.full_name || '—', icon: UserCircle },
                  { label: 'Email Address', value: user.email || '—', icon: Mail },
                  { label: 'Phone', value: (teacher as any)?.phone || user.phone || '—', icon: Phone },
                  { label: 'Employee ID', value: teacher.staff_unique_id || '—', icon: Award },
                  { label: 'Subject', value: teacher.subject || '—', icon: BookOpen },
                  { label: 'Role', value: user.role || 'Teacher', icon: UserCircle },
                ].map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0"><Icon size={14} /></div>
                        <div><div className="text-[11px] text-gray-400">{f.label}</div><div className={`text-xs font-medium ${isEditing ? 'text-[#7C3AED]' : 'text-gray-900'}`}>{f.value}</div></div>
                      </div>
                      {isEditing && <button className="text-[10px] text-[#7C3AED] font-semibold hover:underline">Change</button>}
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-base font-bold mb-4">Achievements & Awards</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {([] as any[]).map((ach, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
                    {'—'}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Quick Stats</h3>
              <div className="space-y-3">
                {[
                  { label: 'Classes Assigned', value: classes.length },
                  { label: 'Total Students', value: students.length },
                  { label: 'Assignments Created', value: 24 },
                  { label: 'Exams Conducted', value: 12 },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <span className="text-xs text-gray-500">{s.label}</span>
                    <span className="text-sm font-bold text-gray-900">{s.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {([] as any[]).map((act, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${act.color}15` }}>
                      <act.icon size={12} style={{ color: act.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-gray-700">{act.text}</p>
                      <p className="text-[10px] text-gray-400">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ===== TAB: MY CLASSES ===== */}
      {activeProfileTab === 'classes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-base font-bold mb-1">Assigned Classes</h3>
              <p className="text-xs text-gray-400 mb-5">{classes.length} classes currently assigned</p>
              {classes.length > 0 ? (
                <div className="space-y-3">
                  {classes.map((c: any) => (
                    <div key={c.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-[#F3F0FF] flex items-center justify-center text-[#7C3AED] flex-shrink-0">
                        <School size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">{c.class?.class_name || c.class_name} {c.class?.section || c.section || ''}</div>
                        <div className="text-[11px] text-gray-500">{c.subject?.name || c.subject} • {students.filter((s: any) => s.class_id === c.class_id || s.class === c.class_name).length} students</div>
                      </div>
                      <Badge className="bg-green-50 text-green-600 border-green-200 text-[9px]">Active</Badge>
                      <button onClick={() => setActiveTab && setActiveTab('attendance')} className="text-[10px] text-[#7C3AED] font-semibold hover:underline flex-shrink-0">View</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">No classes assigned yet.</div>
              )}
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Teaching Load</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Weekly Hours</span>
                  <span className="text-sm font-bold text-gray-900">{classes.length * 4}h</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-[#7C3AED]" style={{ width: `${Math.min(classes.length * 10, 100)}%` }} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>0h</span>
                  <span>40h</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ===== TAB: SECURITY ===== */}
      {activeProfileTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-base font-bold mb-5">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F3F0FF] flex items-center justify-center text-[#7C3AED]"><Key size={18} /></div>
                    <div><div className="text-sm font-medium text-gray-900">Password</div><div className="text-[11px] text-gray-400">Last changed 3 months ago</div></div>
                  </div>
                  <button onClick={() => toast.info('Password change coming soon')} className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all">Change</button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center text-[#10B981]"><Shield size={18} /></div>
                    <div><div className="text-sm font-medium text-gray-900">Two-Factor Authentication</div><div className="text-[11px] text-gray-400">Add extra security to your account</div></div>
                  </div>
                  <button onClick={() => toast.info('2FA setup coming soon')} className="px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] transition-all">Enable</button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6]"><Bell size={18} /></div>
                    <div><div className="text-sm font-medium text-gray-900">Login Alerts</div><div className="text-[11px] text-gray-400">Get notified of new sign-ins</div></div>
                  </div>
                  <button className="w-10 h-6 rounded-full bg-[#7C3AED] relative transition-colors">
                    <div className="absolute w-5 h-5 bg-white rounded-full top-0.5 shadow-sm transition-all left-[18px]" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] flex items-center justify-center text-[#EF4444]"><LogOut size={18} /></div>
                    <div><div className="text-sm font-medium text-gray-900">Active Sessions</div><div className="text-[11px] text-gray-400">Manage your logged-in devices</div></div>
                  </div>
                  <button onClick={() => toast.success('Session list refreshed')} className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all">View All</button>
                </div>
              </div>
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Current Session</h3>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs font-semibold text-gray-900">Active</span>
                </div>
                <div className="space-y-1 text-[11px] text-gray-500">
                  <p>macOS • Chrome 125</p>
                  <p>IP: 192.168.1.100</p>
                  <p>Last active: Just now</p>
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Security Tips</h3>
              <div className="space-y-2">
                {[
                  'Use a strong, unique password',
                  'Enable two-factor authentication',
                  'Don\'t share your login credentials',
                  'Log out from shared devices',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={12} className="text-[#10B981] mt-0.5" />
                    <span className="text-[11px] text-gray-600">{tip}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

    </motion.div>
  );
}
