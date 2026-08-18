'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Bell, Globe, Palette, Download, Trash2, Shield,
  Mail, MessageSquare, Clock, Sun, Moon, Monitor, CheckCircle2,
  ChevronRight, Sparkles, Smartphone, Laptop, Save,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LanguageSwitcher from '../../language/LanguageSwitcher';
import { toast } from 'sonner';

interface SettingsDashboardProps {
  notifSettings: any;
  setNotifSettings: (s: any) => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

export function SettingsDashboard({ notifSettings, setNotifSettings }: SettingsDashboardProps) {
  const [timezone, setTimezone] = useState('ist');
  const [theme, setTheme] = useState('light');

  const toggleSwitch = (key: string) => {
    setNotifSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const notifications = [
    { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email', icon: Mail },
    { key: 'sms', label: 'SMS Alerts', desc: 'Get text message alerts', icon: MessageSquare },
    { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications', icon: Bell },
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
              <Settings className="w-3.5 h-3.5 text-purple-200" />
              <span className="text-[10px] font-semibold text-purple-100 uppercase tracking-wider">Settings</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Portal Settings</h1>
          <p className="text-sm text-white/80 mt-1 max-w-xl">Customize your experience: manage notifications, language, theme, and account preferences.</p>
        </div>
      </motion.div>

      {/* ===== SETTINGS CARDS ===== */}
      <div className="max-w-2xl space-y-5">
        {/* NOTIFICATIONS */}
        <motion.div variants={fadeUp}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#6D4CFF]" />
              </div>
              <div><h3 className="font-bold text-base text-gray-900">Notifications</h3><p className="text-xs text-gray-400">Manage how you receive updates and alerts</p></div>
            </div>
            <div className="space-y-1">
              {notifications.map((n) => {
                const Icon = n.icon;
                const isOn = (notifSettings as any)[n.key];
                return (
                  <div key={n.key} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isOn ? 'text-[#6D4CFF]' : 'text-gray-300'}`} />
                      <div>
                        <div className="text-sm font-medium text-gray-800">{n.label}</div>
                        <div className="text-xs text-gray-400">{n.desc}</div>
                      </div>
                    </div>
                    <button onClick={() => toggleSwitch(n.key)}
                      className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${isOn ? 'bg-[#6D4CFF]' : 'bg-gray-200'}`}>
                      <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 shadow-sm transition-all ${isOn ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* LANGUAGE & REGION */}
        <motion.div variants={fadeUp}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div><h3 className="font-bold text-base text-gray-900">Language & Region</h3><p className="text-xs text-gray-400">Configure language, timezone, and display preferences</p></div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />Language</label>
                <LanguageSwitcher />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Timezone</label>
                <Select value={timezone} onValueChange={v => { setTimezone(v || 'utc'); toast.success(`Timezone set to ${(v || '').toUpperCase()}`); }}>
                  <SelectTrigger className="w-full max-w-xs rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC (Default)</SelectItem>
                    <SelectItem value="est">Eastern Time</SelectItem>
                    <SelectItem value="pst">Pacific Time</SelectItem>
                    <SelectItem value="ist">India Standard Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5 flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" />Theme</label>
                <div className="flex items-center gap-2">
                  {[
                    { value: 'light', icon: Sun, label: 'Light' },
                    { value: 'dark', icon: Moon, label: 'Dark' },
                    { value: 'system', icon: Monitor, label: 'System' },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isActive = theme === t.value;
                    return (
                      <button key={t.value} onClick={() => { setTheme(t.value); toast.success(`Theme set to ${t.label}`); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${isActive ? 'bg-[#F3F0FF] text-[#6D4CFF] border-[#6D4CFF]/30 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                        <Icon className="w-4 h-4" /> {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ACCOUNT ACTIONS */}
        <motion.div variants={fadeUp}>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FEF2F2] to-[#FEE2E2] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div><h3 className="font-bold text-base text-gray-900">Account Actions</h3><p className="text-xs text-gray-400">Manage your account data and privacy</p></div>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3 rounded-xl h-11 text-sm"
                onClick={() => toast.success('Data exported successfully. Check your email for the download link.')}>
                <Download className="w-4 h-4 text-[#6D4CFF]" /> Export My Data
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 rounded-xl h-11 text-sm text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => { if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) { toast.success('Account deletion request submitted'); } }}>
                <Trash2 className="w-4 h-4" /> Delete Account
              </Button>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-[11px] text-gray-500">
                <span className="font-semibold">Data Privacy:</span> Your data is encrypted and stored securely. You can request data export or account deletion at any time. For assistance, contact support.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* DEVICES */}
        <motion.div variants={fadeUp}>
          <Card className="p-6 bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] border-[rgba(109,76,255,0.15)]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0"><Smartphone className="w-5 h-5 text-[#6D4CFF]" /></div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-[#6D4CFF]">Active Sessions</h3>
                <p className="text-xs text-gray-500 mt-0.5">You are currently logged in on 1 device. Manage your active sessions for security.</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-[rgba(109,76,255,0.15)]">
                    <Laptop className="w-3.5 h-3.5 text-[#6D4CFF]" />
                    <span className="text-[10px] font-medium text-gray-600">MacOS • Chrome</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  </div>
                </div>
                <Button size="sm" variant="outline" className="mt-2 rounded-lg text-[10px] h-7 bg-white border-[rgba(109,76,255,0.2)] text-[#6D4CFF]"
                  onClick={() => toast.success('All other sessions logged out')}>
                  Logout Other Sessions
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
