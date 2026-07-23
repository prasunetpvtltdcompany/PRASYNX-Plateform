'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Shield, Mail, Smartphone, Globe, Lock,
  Moon, Sun, ToggleLeft, ToggleRight, Save, CheckCircle,
  Eye, EyeOff, RefreshCw, Bot,
} from 'lucide-react';
import apiClient from '../../lib/apiClient';

export default function SettingsTab({ provider }: { provider: any }) {
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    auto_respond: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-[#6D4CFF]' : 'bg-gray-200'}`}>
      <motion.div animate={{ x: value ? 20 : 2 }} className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
    </button>
  );

  const handleSave = async () => {
    setSaving(true);
    const r = await apiClient.patch('/job-provider/settings', settings);
    setSaving(false);
    if (r.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const notificationSettings = [
    { icon: Mail, label: 'Email Notifications', desc: 'Receive updates via email', key: 'email_notifications' as const },
    { icon: Smartphone, label: 'SMS Notifications', desc: 'Receive updates via SMS', key: 'sms_notifications' as const },
    { icon: Bot, label: 'Auto-respond to applicants', desc: 'Send automatic acknowledgment', key: 'auto_respond' as const },
  ];

  return (
    <div className="max-w-[800px] mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Settings</h1>
          <p className="text-xs text-gray-400">Manage your account preferences</p>
        </div>
      </div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs">
          <CheckCircle size={16} className="text-green-500" /> Settings saved successfully
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5 mb-1">
            <Bell size={18} className="text-[#6D4CFF]" />
            <h3 className="font-bold text-sm">Notifications</h3>
          </div>
          <p className="text-[10px] text-gray-400">Configure how you receive notifications</p>
        </div>
        <div className="p-5 space-y-4">
          {notificationSettings.map((ns) => {
            const Icon = ns.icon;
            return (
              <div key={ns.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-500"><Icon size={16} /></div>
                  <div>
                    <div className="text-xs font-semibold">{ns.label}</div>
                    <div className="text-[10px] text-gray-400">{ns.desc}</div>
                  </div>
                </div>
                <Toggle value={settings[ns.key]} onChange={v => setSettings(s => ({ ...s, [ns.key]: v }))} />
              </div>
            );
          })}
        </div>
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5a3ed9] disabled:opacity-50 transition-all">
            <Save size={14} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5 mb-1">
            <Lock size={18} className="text-[#6D4CFF]" />
            <h3 className="font-bold text-sm">Change Password</h3>
          </div>
          <p className="text-[10px] text-gray-400">Update your account password</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="relative">
            <label className="text-[10px] font-medium text-gray-500 mb-1 block">Current Password</label>
            <input type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" />
          </div>
          <div className="relative">
            <label className="text-[10px] font-medium text-gray-500 mb-1 block">New Password</label>
            <input type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]" />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowPasswords(!showPasswords)} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600">
              {showPasswords ? <EyeOff size={12} /> : <Eye size={12} />} {showPasswords ? 'Hide' : 'Show'} passwords
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF] text-[10px] font-semibold hover:bg-[#6D4CFF]/20 transition-all ml-auto">
              <RefreshCw size={12} /> Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

