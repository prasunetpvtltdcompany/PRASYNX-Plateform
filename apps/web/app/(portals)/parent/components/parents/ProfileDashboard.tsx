'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircle, GraduationCap, Shield, Edit3, Settings, Mail, Phone,
  CalendarDays, BadgeCheck, Users, Lock, LogOut, ChevronRight,
  Sparkles, Bell, Key, Eye, Smartphone,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ProfileDashboardProps {
  session: any;
  children: any[];
  userInitials: string;
  saveProfile: () => void;
  startEditingProfile: () => void;
  editForm: any;
  setEditForm: (f: any) => void;
  editingProfile: boolean;
  setEditingProfile: (v: boolean) => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

export function ProfileDashboard({ session, children, userInitials, saveProfile, startEditingProfile, editForm, setEditForm, editingProfile, setEditingProfile }: ProfileDashboardProps) {
  const [profileTab, setProfileTab] = useState('overview');

  const tabs = [
    { key: 'overview', label: 'Overview', icon: UserCircle },
    { key: 'children', label: 'My Children', icon: GraduationCap },
    { key: 'security', label: 'Security', icon: Shield },
  ];

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
              style={{ width: `${2 + (i % 3) * 2}px`, height: `${2 + (i % 3) * 2}px`, top: `${10 + (i * 12) % 80}%`, left: `${5 + (i * 15) % 90}%` }} />
          ))}
        </motion.div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
              <UserCircle className="w-3.5 h-3.5 text-purple-200" />
              <span className="text-[10px] font-semibold text-purple-100 uppercase tracking-wider">Profile</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">My Account</h1>
          <p className="text-sm text-white/80 mt-1 max-w-xl">Manage your personal information, view linked children, and configure security settings.</p>
        </div>
      </motion.div>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* SIDEBAR */}
        <motion.div variants={fadeUp} className="space-y-4">
          <Card className="p-5 text-center">
            <div className="relative mx-auto w-fit mb-3">
              <Avatar className="w-20 h-20 ring-4 ring-[#F3F0FF] cursor-pointer hover:ring-[#6D4CFF]/30 transition-all"
                onClick={() => toast.info('Change profile picture')}>
                <AvatarImage src={session?.user?.avatar_url || ''} />
                <AvatarFallback className="bg-gradient-to-br from-[#6D4CFF] to-[#8B6FFF] text-white text-xl font-bold">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center">
                <BadgeCheck className="w-3 h-3 text-white" />
              </div>
            </div>
            <h2 className="font-bold text-lg text-gray-900">{session?.user?.full_name || 'User'}</h2>
            <p className="text-sm text-gray-500">{session?.user?.email || '—'}</p>
            <Badge className="mt-2 bg-[#F3F0FF] text-[#6D4CFF] border-[rgba(109,76,255,0.2)] capitalize">{session?.user?.role || 'Parent'}</Badge>
          </Card>

          <Card className="p-2">
            <div className="space-y-0.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = profileTab === tab.key;
                return (
                  <button key={tab.key} onClick={() => setProfileTab(tab.key)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${isActive ? 'bg-[#F3F0FF] text-[#6D4CFF] font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#6D4CFF]' : 'text-gray-400'}`} />
                    <span>{tab.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-[#6D4CFF]" />}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] border-[rgba(109,76,255,0.15)]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm"><Sparkles className="w-4 h-4 text-[#6D4CFF]" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-600">Profile completeness: 80%. Add your phone number and address to complete your profile.</p>
                <button onClick={() => { startEditingProfile(); setProfileTab('overview'); }}
                  className="mt-1.5 text-[11px] font-semibold text-[#6D4CFF] hover:underline">Complete Profile →</button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* MAIN CONTENT */}
        <motion.div variants={fadeUp}>
          <Card className="p-6">
            {profileTab === 'overview' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-base text-gray-900">Account Information</h3>
                  {!editingProfile && (
                    <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs h-8"
                      onClick={startEditingProfile}>
                      <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                    </Button>
                  )}
                </div>
                {editingProfile ? (
                  <div className="space-y-4">
                    {[
                      { key: 'full_name', label: 'Full Name', icon: UserCircle },
                      { key: 'phone', label: 'Phone', icon: Phone },
                      { key: 'address', label: 'Address', icon: Mail },
                    ].map((f) => {
                      const Icon = f.icon;
                      return (
                        <div key={f.key}>
                          <label className="text-xs font-semibold text-gray-500 block mb-1.5 flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5" /> {f.label}
                          </label>
                          <Input value={(editForm as any)[f.key] || ''} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                            className="rounded-xl bg-gray-50 focus:bg-white" placeholder={`Enter your ${f.label.toLowerCase()}`} />
                        </div>
                      );
                    })}
                    <div className="flex gap-3 pt-2">
                      <Button onClick={saveProfile} className="bg-gradient-to-r from-[#6D4CFF] to-[#8B6FFF] text-white rounded-xl gap-1.5">
                        <BadgeCheck className="w-4 h-4" /> Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditingProfile(false)} className="rounded-xl">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[
                      { label: 'Full Name', value: session?.user?.full_name || '—', icon: UserCircle },
                      { label: 'Email', value: session?.user?.email || '—', icon: Mail },
                      { label: 'Phone', value: session?.user?.phone || session?.user?.phone_number || '—', icon: Phone },
                      { label: 'Role', value: session?.user?.role || 'Parent', icon: BadgeCheck },
                      { label: 'Children Linked', value: children.length.toString(), icon: Users },
                      { label: 'Member Since', value: session?.user?.created_at ? new Date(session.user.created_at).toLocaleDateString() : '—', icon: CalendarDays },
                    ].map((f, i) => {
                      const Icon = f.icon;
                      return (
                        <div key={i} className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500 flex-1">{f.label}</span>
                          <span className="text-sm font-medium text-gray-900">{f.value}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {profileTab === 'children' && (
              <div>
                <h3 className="font-bold text-base text-gray-900 mb-5">My Children</h3>
                {children.length > 0 ? (
                  <div className="space-y-3">
                    {children.map((child: any) => (
                      <div key={child.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#6D4CFF]/20 hover:bg-white transition-all group">
                        <Avatar className="w-14 h-14 ring-2 ring-[#F3F0FF] group-hover:ring-[#6D4CFF]/30 transition-all">
                          <AvatarFallback className="bg-gradient-to-br from-[#6D4CFF] to-[#8B6FFF] text-white text-sm font-bold">
                            {child.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{child.full_name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Class {child.class || child.student_class} • Roll {child.roll_number || '—'}
                            {child.section && <> • Section {child.section}</>}
                          </div>
                        </div>
                        <Badge className="bg-[#F0FDF4] text-[#10B981] border-0 text-[10px]">Active</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="font-medium text-gray-600">No Children Linked</p>
                    <p className="text-sm mt-1">Contact the school to link your children to this account.</p>
                  </div>
                )}
              </div>
            )}

            {profileTab === 'security' && (
              <div>
                <h3 className="font-bold text-base text-gray-900 mb-5">Security Settings</h3>
                <div className="space-y-3">
                  {[
                    { icon: Key, label: 'Password', desc: 'Last changed 3 months ago', btn: 'Change', color: '#6D4CFF' },
                    { icon: Shield, label: 'Two-Factor Authentication', desc: 'Add an extra layer of security', btn: 'Enable', color: '#10B981' },
                    { icon: Smartphone, label: 'Active Sessions', desc: "You're logged in on 1 device", btn: 'Logout All', color: '#EF4444' },
                    { icon: Eye, label: 'Login History', desc: 'Review recent account activity', btn: 'View', color: '#3B82F6' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#6D4CFF]/20 hover:bg-white transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: item.color + '15', color: item.color }}>
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-900">{item.label}</div>
                            <div className="text-xs text-gray-400">{item.desc}</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm"
                          className={`rounded-lg text-xs h-8 ${item.color === '#EF4444' ? 'text-red-500 border-red-200 hover:bg-red-50' : ''}`}
                          onClick={() => toast.info(`${item.label} feature coming soon`)}>
                          {item.btn}
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 p-4 rounded-xl bg-[#FEF2F2] border border-[rgba(239,68,68,0.15)]">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-[#EF4444] mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Security Recommendation</p>
                      <p className="text-xs text-gray-500 mt-1">Enable two-factor authentication to secure your account. It adds an extra verification step when logging in from new devices.</p>
                      <Button size="sm" className="mt-2 bg-[#EF4444] text-white rounded-lg text-xs h-8 hover:bg-[#DC2626]"
                        onClick={() => toast.info('2FA setup wizard opened')}>
                        <Lock className="w-3.5 h-3.5 mr-1" /> Enable 2FA Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
