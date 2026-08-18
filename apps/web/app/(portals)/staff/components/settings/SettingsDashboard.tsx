'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Bell, Globe, Moon, Sun, Shield, Key, Users, Clock,
  Mail, Phone, Monitor, Smartphone, LogOut, Download, Upload,
  Trash2, CheckCircle2, AlertCircle, Star, Sparkles, HelpCircle,
  Send, Palette, Eye, Languages, Activity, FileText, RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const PCOLORS = { primary: '#7C3AED', secondary: '#8B5CF6', tertiary: '#6366F1', success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };

interface SettingsDashboardProps {
  darkMode?: boolean;
  setDarkMode?: (v: boolean) => void;
  setActiveTab?: (tab: string) => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const settingSections = {
  general: [
    { id: 'lang', label: 'Language', desc: 'Choose your preferred language', icon: Languages, type: 'select', options: ['English', 'Hindi', 'Marathi'] },
    { id: 'timezone', label: 'Timezone', desc: 'Set your local timezone', icon: Clock, type: 'select', options: ['UTC', 'IST (UTC+5:30)', 'EST', 'PST'] },
    { id: 'datefmt', label: 'Date Format', desc: 'Choose how dates are displayed', icon: CalendarIcon, type: 'select', options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
  ],
  notifications: [
    { id: 'email_notif', label: 'Email Notifications', desc: 'Receive updates via email', icon: Mail, type: 'toggle', defaultOn: true },
    { id: 'sms_alerts', label: 'SMS Alerts', desc: 'Get text message alerts', icon: Smartphone, type: 'toggle', defaultOn: false },
    { id: 'push_notif', label: 'Push Notifications', desc: 'Browser push notifications', icon: Bell, type: 'toggle', defaultOn: true },
    { id: 'weekly_report', label: 'Weekly Report', desc: 'Receive weekly summary report', icon: FileText, type: 'toggle', defaultOn: false },
    { id: 'attendance_alert', label: 'Attendance Alerts', desc: 'Alert when attendance drops below 75%', icon: Activity, type: 'toggle', defaultOn: true },
  ],
  security: [
    { id: '2fa', label: 'Two-Factor Authentication', desc: 'Add extra security layer', icon: Shield, type: 'action', actionLabel: 'Enable' },
    { id: 'sessions', label: 'Active Sessions', desc: 'Manage logged-in devices', icon: Monitor, type: 'action', actionLabel: 'View' },
    { id: 'export_data', label: 'Export My Data', desc: 'Download all your data', icon: Download, type: 'action', actionLabel: 'Export' },
    { id: 'delete_account', label: 'Delete Account', desc: 'Permanently delete your account', icon: Trash2, type: 'action', actionLabel: 'Delete', danger: true },
  ],
};

function CalendarIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

export function SettingsDashboard({ darkMode, setDarkMode, setActiveTab }: SettingsDashboardProps) {
  const [activeSection, setActiveSection] = useState('general');
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    email_notif: true,
    sms_alerts: false,
    push_notif: true,
    weekly_report: false,
    attendance_alert: true,
  });

  const toggleSwitch = (id: string) => {
    setToggles(prev => ({ ...prev, [id]: !prev[id] }));
    toast.success(`Setting updated`);
  };

  const sectionData = settingSections[activeSection as keyof typeof settingSections] || [];

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
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <Settings size={20} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-200">Preferences</div>
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Settings</h1>
              </div>
            </div>
            <p className="text-sm text-purple-100/90 mt-2 max-w-xl leading-relaxed">
              Customize your portal experience, manage notifications, and configure security preferences.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { icon: Settings, value: '12', label: 'Configurable Options', color: '#A855F7' },
                { icon: Bell, value: Object.values(toggles).filter(Boolean).length, label: 'Active Notifications', color: '#3B82F6' },
                { icon: Shield, value: '2', label: 'Security Features', color: '#10B981' },
                { icon: Globe, value: '3', label: 'Language Options', color: '#F59E0B' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={i} whileHover={{ scale: 1.03, y: -2 }} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={14} className="text-white/80" />
                      <span className="text-[10px] font-medium text-purple-200/80">{stat.label}</span>
                    </div>
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs">
              <button onClick={() => setDarkMode && setDarkMode(false)} className={`p-1.5 rounded-lg transition-all ${!darkMode ? 'bg-white/20' : 'hover:bg-white/10'}`}><Sun size={14} /></button>
              <button onClick={() => setDarkMode && setDarkMode(true)} className={`p-1.5 rounded-lg transition-all ${darkMode ? 'bg-white/20' : 'hover:bg-white/10'}`}><Moon size={14} /></button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== SECTION SIDEBAR + CONTENT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <div className="space-y-2">
          {[
            { key: 'general', label: 'General', icon: Settings },
            { key: 'notifications', label: 'Notifications', icon: Bell },
            { key: 'security', label: 'Security', icon: Shield },
          ].map((section) => {
            const Icon = section.icon;
            return (
              <button key={section.key} onClick={() => setActiveSection(section.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${activeSection === section.key ? 'bg-[#F3F0FF] text-[#7C3AED] shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              ><Icon size={16} />{section.label}</button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-100">
            <button onClick={() => { toast.success('Settings saved!'); }} className="w-full px-4 py-2.5 rounded-xl bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9] transition-all">
              Save All Settings
            </button>
            <button onClick={() => toast.success('Settings reset to default')} className="w-full px-4 py-2.5 rounded-xl text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-all mt-2">
              Reset to Default
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-6">
            <h3 className="text-base font-bold mb-1 capitalize">{activeSection} Settings</h3>
            <p className="text-xs text-gray-400 mb-5">
              {activeSection === 'general' ? 'Configure your language, timezone, and display preferences.' :
               activeSection === 'notifications' ? 'Manage how you receive alerts and updates.' :
               'Configure security features and manage your account safety.'}
            </p>
            <div className="space-y-3">
              {sectionData.map((item: any) => {
                const Icon = item.icon;
                if (item.type === 'toggle') {
                  const isOn = toggles[item.id] ?? item.defaultOn;
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-gray-400 shadow-sm"><Icon size={16} /></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.label}</div>
                          <div className="text-[11px] text-gray-400">{item.desc}</div>
                        </div>
                      </div>
                      <button onClick={() => toggleSwitch(item.id)}
                        className={`w-10 h-6 rounded-full relative transition-colors ${isOn ? 'bg-[#7C3AED]' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 shadow-sm transition-all ${isOn ? 'left-[18px]' : 'left-0.5'}`} />
                      </button>
                    </div>
                  );
                }
                if (item.type === 'select') {
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-gray-400 shadow-sm"><Icon size={16} /></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.label}</div>
                          <div className="text-[11px] text-gray-400">{item.desc}</div>
                        </div>
                      </div>
                      <select className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:outline-none focus:border-[#7C3AED]">
                        {item.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  );
                }
                if (item.type === 'action') {
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100/50 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm ${item.danger ? 'text-red-500' : 'text-gray-400'}`}><Icon size={16} /></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.label}</div>
                          <div className="text-[11px] text-gray-400">{item.desc}</div>
                        </div>
                      </div>
                      <button onClick={() => {
                        if (item.danger) toast.error('This action is irreversible!');
                        else toast.success(`${item.actionLabel} coming soon`);
                      }}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${item.danger ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >{item.actionLabel}</button>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </Card>

          {activeSection === 'general' && (
            <Card className="p-6">
              <h3 className="text-base font-bold mb-4">Appearance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-gray-400 shadow-sm"><Palette size={16} /></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Theme</div>
                      <div className="text-[11px] text-gray-400">Choose between light and dark mode</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                    <button onClick={() => setDarkMode && setDarkMode(false)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!darkMode ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      <Sun size={14} className="inline mr-1" />Light
                    </button>
                    <button onClick={() => setDarkMode && setDarkMode(true)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${darkMode ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      <Moon size={14} className="inline mr-1" />Dark
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

    </motion.div>
  );
}
