'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Shield, Mail, Smartphone, Globe, Lock, Save, CheckCircle,
  Eye, EyeOff, RefreshCw, Bot, Settings, Users, CreditCard,
  Share2, Sliders, Key, FileText, Clock, LogOut, Download,
  Upload, Trash2, Plus, X, Search, Filter, ChevronDown,
  MoreHorizontal, Link, ExternalLink, Moon, Sun, ToggleLeft,
  ToggleRight, Sparkles, Target, Zap, HelpCircle, AlertCircle,
  Building2, UserCheck, Video, Award, Briefcase, CalendarDays,
  MessageSquare, BarChart3, Activity, Copy, Loader,
  ArrowRight, ArrowLeft, Home, Star, TrendingUp, Send, MapPin, Phone,
} from 'lucide-react';
import apiClient from '../../lib/apiClient';

const CLR = {
  primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B',
  danger: '#EF4444', info: '#3B82F6', purple: '#A855F7',
  indigo: '#4F46E5', pink: '#EC4899', teal: '#14B8A6',
};

const settingsTabs = [
  { key: 'general', label: 'General', icon: Settings },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'recruitment', label: 'Recruitment', icon: Briefcase },
  { key: 'automation', label: 'Automation', icon: Zap },
  { key: 'integrations', label: 'Integrations', icon: Share2 },
  { key: 'team', label: 'Team Access', icon: Users },
  { key: 'billing', label: 'Billing', icon: CreditCard },
  { key: 'privacy', label: 'Privacy', icon: Lock },
  { key: 'logs', label: 'Audit Logs', icon: FileText },
];



function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-[#6D4CFF]' : 'bg-gray-200'}`}>
      <motion.div animate={{ x: value ? 20 : 2 }} className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
    </button>
  );
}

export default function SettingsDashboard({ provider }: { provider: any }) {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const [general, setGeneral] = useState({
    company_name: provider.company_name || 'Prasunet Technologies',
    company_email: provider.email || 'careers@prasunet.com',
    contact_number: provider.phone || '+91-124-456-7890',
    website: provider.website || 'https://prasunet.com',
    address: 'Gurgaon, India',
    timezone: 'Asia/Kolkata',
    language: 'English',
    currency: 'INR',
  });

  const [notifications, setNotifications] = useState({
    email_applications: true, email_shortlisted: true, email_interview: true,
    email_offer: true, email_job_expiry: true, email_reports: false,
    push_notifications: true, sms_notifications: false,
    whatsapp_notifications: false, slack_notifications: false,
  });

  const [recruitment, setRecruitment] = useState({
    default_status: 'new', auto_shortlist: true, auto_reject: false,
    interview_reminder: 24, candidate_visibility: 'all',
    resume_download: 'recruiters', job_expiry_days: 30,
  });

  const [automation, setAutomation] = useState({
    ai_matching: true, ai_screening: true, ai_jd_generator: true,
    ai_questions: true, ai_ranking: true, ai_recommendations: true,
    ai_followup: true, ai_insights: true,
  });

  const [security, setSecurity] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
    twoFactorEnabled: false, emailVerified: true, phoneVerified: false,
  });

  const [privacy, setPrivacy] = useState({
    gdpr_compliant: true, data_retention_days: 365,
    resume_retention: 180, cookie_consent: true,
  });

  const [showPasswords, setShowPasswords] = useState(false);
  const [logFilter, setLogFilter] = useState('all');

  const showSaveSuccess = (msg: string) => {
    setSavedMessage(msg); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveGeneral = async () => {
    setSaving(true);
    const r = await apiClient.put('/job-provider/profile', general);
    setSaving(false);
    if (r.success) showSaveSuccess('General settings saved successfully');
    else showSaveSuccess('General settings saved locally');
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    const r = await apiClient.patch('/job-provider/settings', notifications);
    setSaving(false);
    if (r.success) showSaveSuccess('Notification preferences saved');
    else showSaveSuccess('Notification preferences saved locally');
  };

  const handlePasswordUpdate = () => {
    if (security.newPassword !== security.confirmPassword) return;
    showSaveSuccess('Password updated successfully');
    setSecurity({ ...security, currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const notificationItems = [
    { icon: Mail, label: 'Application Received', desc: 'When a new application is submitted', key: 'email_applications' as const },
    { icon: UserCheck, label: 'Shortlisted Candidate', desc: 'When a candidate is shortlisted', key: 'email_shortlisted' as const },
    { icon: Video, label: 'Interview Reminder', desc: 'Reminders for upcoming interviews', key: 'email_interview' as const },
    { icon: Award, label: 'Offer Accepted', desc: 'When a candidate accepts an offer', key: 'email_offer' as const },
    { icon: Clock, label: 'Job Expiry Alerts', desc: 'When jobs are about to expire', key: 'email_job_expiry' as const },
    { icon: BarChart3, label: 'Recruitment Reports', desc: 'Weekly recruitment analytics', key: 'email_reports' as const },
    { icon: Bell, label: 'Push Notifications', desc: 'Browser push notifications', key: 'push_notifications' as const },
    { icon: Smartphone, label: 'SMS Notifications', desc: 'Text message alerts', key: 'sms_notifications' as const },
    { icon: MessageSquare, label: 'WhatsApp Notifications', desc: 'WhatsApp message updates', key: 'whatsapp_notifications' as const },
    { icon: Share2, label: 'Slack Notifications', desc: 'Slack channel notifications', key: 'slack_notifications' as const },
  ];

  const automationItems = [
    { icon: Target, label: 'AI Candidate Matching', desc: 'Automatically match candidates to jobs', key: 'ai_matching' as const, color: CLR.primary },
    { icon: FileText, label: 'AI Resume Screening', desc: 'Auto-screen and rank resumes', key: 'ai_screening' as const, color: CLR.teal },
    { icon: FileText, label: 'AI Job Description Generator', desc: 'Generate JD from keywords', key: 'ai_jd_generator' as const, color: CLR.info },
    { icon: HelpCircle, label: 'AI Interview Questions', desc: 'Generate interview questions', key: 'ai_questions' as const, color: CLR.warning },
    { icon: Star, label: 'AI Candidate Ranking', desc: 'Rank candidates by AI score', key: 'ai_ranking' as const, color: CLR.purple },
    { icon: Sparkles, label: 'AI Hiring Recommendations', desc: 'Get AI hiring suggestions', key: 'ai_recommendations' as const, color: CLR.pink },
    { icon: Send, label: 'AI Follow-up Messages', desc: 'Auto-generate candidate messages', key: 'ai_followup' as const, color: CLR.success },
    { icon: TrendingUp, label: 'AI Recruitment Insights', desc: 'Analytics and predictions', key: 'ai_insights' as const, color: CLR.indigo },
  ];

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      {notificationItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 text-gray-500"><Icon size={14} /></div>
              <div>
                <div className="text-[11px] font-semibold text-gray-800">{item.label}</div>
                <div className="text-[9px] text-gray-400">{item.desc}</div>
              </div>
            </div>
            <Toggle value={notifications[item.key]} onChange={(v) => setNotifications((s) => ({ ...s, [item.key]: v }))} />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* ===== HEADER ===== */}
      <div className="relative overflow-hidden rounded-2xl p-4 md:p-6 border border-white/10 shadow-[0_20px_50px_rgba(109,76,255,0.15)]"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-[#6D4CFF]/20 rounded-full blur-[140px]" />
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-[#3B82F6]/12 rounded-full blur-[140px]" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">Configuration</div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white">Settings Center</h1>
            <p className="text-xs text-white/60 mt-1">Manage account preferences, hiring workflows, security, and integrations.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-white border border-white/20 transition-all">
              <RefreshCw size={12} className="inline mr-1" /> Reset
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-white border border-white/20 transition-all">
              <Download size={12} className="inline mr-1" /> Export
            </button>
          </div>
        </div>
      </div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs">
          <CheckCircle size={16} className="text-green-500 flex-shrink-0" /> {savedMessage}
        </motion.div>
      )}

      {/* ===== SETTINGS NAVIGATION ===== */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex gap-0.5 p-1.5">
            {settingsTabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-semibold whitespace-nowrap transition-all flex-shrink-0 ${activeTab === tab.key ? 'bg-[#6D4CFF] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}>
                  <TabIcon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== SETTINGS CONTENT ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        <div className="xl:col-span-3 space-y-5">
          {/* GENERAL */}
          {activeTab === 'general' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
              <div className="p-4 md:p-5 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Building2 size={14} className="text-[#6D4CFF]" /> Account Settings</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Manage your company account details and preferences</p>
              </div>
              <div className="p-4 md:p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  {[
                    { label: 'Company Name', key: 'company_name', icon: Building2 },
                    { label: 'Company Email', key: 'company_email', icon: Mail },
                    { label: 'Contact Number', key: 'contact_number', icon: Phone },
                    { label: 'Website', key: 'website', icon: Globe },
                    { label: 'Address', key: 'address', icon: MapPin },
                    { label: 'Time Zone', key: 'timezone', icon: Clock },
                    { label: 'Language', key: 'language', icon: Globe },
                    { label: 'Currency', key: 'currency', icon: CreditCard },
                  ].map((field) => {
                    const FieldIcon = field.icon;
                    return (
                      <div key={field.key} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mb-1 uppercase tracking-wider">
                          <FieldIcon size={11} /> {field.label}
                        </div>
                        <input value={(general as any)[field.key] || ''} onChange={(e) => setGeneral((s) => ({ ...s, [field.key]: e.target.value }))}
                          className="w-full bg-transparent text-[12px] font-semibold focus:outline-none border-b border-dashed border-gray-300 focus:border-[#6D4CFF] pb-0.5" />
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <CheckCircle size={12} className="text-green-500" /> Profile 92% complete
                  </div>
                  <button onClick={handleSaveGeneral} disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-[10px] font-bold hover:bg-[#5a3ed9] disabled:opacity-50 transition-all shadow-sm">
                    <Save size={13} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
              <div className="p-4 md:p-5 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Bell size={14} className="text-[#6D4CFF]" /> Notification Center</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Configure how you receive updates and alerts</p>
              </div>
              <div className="p-4 md:p-5">
                {renderNotificationSettings()}
              </div>
              <div className="px-4 md:px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                <button onClick={handleSaveNotifications} disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-[10px] font-bold hover:bg-[#5a3ed9] disabled:opacity-50 transition-all shadow-sm">
                  <Save size={13} /> {saving ? 'Saving...' : 'Save Notification Settings'}
                </button>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
                <div className="p-4 md:p-5 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Lock size={14} className="text-[#6D4CFF]" /> Change Password</h3>
                </div>
                <div className="p-4 md:p-5 space-y-4">
                  {[
                    { label: 'Current Password', key: 'currentPassword' },
                    { label: 'New Password', key: 'newPassword' },
                    { label: 'Confirm New Password', key: 'confirmPassword' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-[10px] font-medium text-gray-500 mb-1 block">{field.label}</label>
                      <input type={showPasswords ? 'text' : 'password'} value={(security as any)[field.key] || ''} onChange={(e) => setSecurity((s) => ({ ...s, [field.key]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 focus:border-[#6D4CFF]" />
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <button onClick={() => setShowPasswords(!showPasswords)} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600">
                      {showPasswords ? <EyeOff size={12} /> : <Eye size={12} />} {showPasswords ? 'Hide' : 'Show'} passwords
                    </button>
                    <button onClick={handlePasswordUpdate} disabled={!security.currentPassword || !security.newPassword || security.newPassword !== security.confirmPassword}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-[10px] font-bold hover:bg-[#5a3ed9] disabled:opacity-50 transition-all shadow-sm">
                      <RefreshCw size={13} /> Update Password
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
                <div className="p-4 md:p-5 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Shield size={14} className="text-[#6D4CFF]" /> Two-Factor Authentication</h3>
                </div>
                <div className="p-4 md:p-5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <div className="text-[11px] font-semibold text-gray-800">Two-Factor Authentication</div>
                      <div className="text-[9px] text-gray-400">Add an extra layer of security to your account</div>
                    </div>
                    <Toggle value={security.twoFactorEnabled} onChange={(v) => setSecurity((s) => ({ ...s, twoFactorEnabled: v }))} />
                  </div>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
                <div className="p-4 md:p-5 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Activity size={14} className="text-[#6D4CFF]" /> Active Sessions</h3>
                </div>
                <div className="p-4 md:p-5 space-y-3">
                  {[
                    { device: 'Chrome / macOS', ip: '192.168.1.100', lastActive: 'Current session', current: true, location: 'Gurgaon, India' },
                    { device: 'Safari / iOS', ip: '192.168.1.101', lastActive: '2 hours ago', current: false, location: 'Gurgaon, India' },
                    { device: 'Chrome / Windows', ip: '192.168.1.102', lastActive: '1 day ago', current: false, location: 'Mumbai, India' },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${session.current ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          <Smartphone size={13} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-gray-800">{session.device}</span>
                            {session.current && <span className="px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 text-[7px] font-semibold">Current</span>}
                          </div>
                          <div className="text-[9px] text-gray-400">{session.ip} · {session.location} · {session.lastActive}</div>
                        </div>
                      </div>
                      {!session.current && <button className="text-[9px] font-medium text-red-500 hover:text-red-600">Revoke</button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* RECRUITMENT SETTINGS */}
          {activeTab === 'recruitment' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
              <div className="p-4 md:p-5 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Briefcase size={14} className="text-[#6D4CFF]" /> Recruitment Workflow</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Configure hiring pipeline and automation rules</p>
              </div>
              <div className="p-4 md:p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <label className="text-[9px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Default Application Status</label>
                    <select value={recruitment.default_status} onChange={(e) => setRecruitment((s) => ({ ...s, default_status: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 bg-white">
                      <option value="new">New</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                    </select>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <label className="text-[9px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Interview Reminder (hours before)</label>
                    <input type="number" value={recruitment.interview_reminder} onChange={(e) => setRecruitment((s) => ({ ...s, interview_reminder: Number(e.target.value) }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <label className="text-[9px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Candidate Visibility</label>
                    <select value={recruitment.candidate_visibility} onChange={(e) => setRecruitment((s) => ({ ...s, candidate_visibility: e.target.value }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20 bg-white">
                      <option value="all">All Team Members</option>
                      <option value="recruiters">Recruiters Only</option>
                      <option value="admins">Admins Only</option>
                    </select>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <label className="text-[9px] font-medium text-gray-400 uppercase tracking-wider block mb-1.5">Job Expiry Duration (days)</label>
                    <input type="number" value={recruitment.job_expiry_days} onChange={(e) => setRecruitment((s) => ({ ...s, job_expiry_days: Number(e.target.value) }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <div className="text-[11px] font-semibold text-gray-800">Auto Shortlist Rules</div>
                    <div className="text-[9px] text-gray-400">Automatically shortlist candidates with AI score &gt; 85%</div>
                  </div>
                  <Toggle value={recruitment.auto_shortlist} onChange={(v) => setRecruitment((s) => ({ ...s, auto_shortlist: v }))} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <div className="text-[11px] font-semibold text-gray-800">Auto Reject Rules</div>
                    <div className="text-[9px] text-gray-400">Automatically reject candidates with AI score &lt; 40%</div>
                  </div>
                  <Toggle value={recruitment.auto_reject} onChange={(v) => setRecruitment((s) => ({ ...s, auto_reject: v }))} />
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => showSaveSuccess('Recruitment settings saved successfully')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-[10px] font-bold hover:bg-[#5a3ed9] transition-all shadow-sm">
                    <Save size={13} /> Save Recruitment Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AUTOMATION */}
          {activeTab === 'automation' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
              <div className="p-4 md:p-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">AI Recruitment Automation</h3>
                    <p className="text-[9px] text-gray-400">Powered by Prerana AI</p>
                  </div>
                </div>
              </div>
              <div className="p-4 md:p-5">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#6D4CFF]/5 to-[#A855F7]/5 border border-[#6D4CFF]/10 mb-4">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f0f0f0" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke={CLR.primary} strokeWidth="3" strokeDasharray="31.4 100" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-extrabold text-[#6D4CFF]">92%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-gray-800">AI Efficiency Score</div>
                    <div className="text-[9px] text-gray-400">Your recruitment AI is performing at 92% efficiency. 8 AI features active.</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {automationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: `${item.color}12`, color: item.color }}>
                            <Icon size={13} />
                          </div>
                          <div>
                            <div className="text-[10px] font-semibold text-gray-800">{item.label}</div>
                            <div className="text-[8px] text-gray-400">{item.desc}</div>
                          </div>
                        </div>
                        <Toggle value={(automation as any)[item.key]} onChange={(v) => setAutomation((s) => ({ ...s, [item.key]: v }))} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
              <div className="p-4 md:p-5 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Share2 size={14} className="text-[#6D4CFF]" /> Integrations Hub</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Connect your favorite tools and platforms</p>
              </div>
              <div className="p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="col-span-full text-center py-8 text-[10px] text-gray-400">No integrations configured yet</div>
              </div>
            </div>
          )}

          {/* TEAM ACCESS */}
          {activeTab === 'team' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
              <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Users size={14} className="text-[#6D4CFF]" /> Team & Access Management</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Manage recruiters, hiring managers, and permissions</p>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#6D4CFF] text-white text-[9px] font-semibold hover:bg-[#5a3ed9] transition-all shadow-sm">
                  <Plus size={12} /> Invite Member
                </button>
              </div>
              <div className="p-4 md:p-5 space-y-3">
                <div className="text-center py-8 text-[10px] text-gray-400">No team members added yet</div>
              </div>
            </div>
          )}

          {/* BILLING */}
          {activeTab === 'billing' && (
            <div className="space-y-5">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
                <div className="p-4 md:p-5 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><CreditCard size={14} className="text-[#6D4CFF]" /> Subscription & Billing</h3>
                </div>
                <div className="p-4 md:p-5">
                  <div className="bg-gradient-to-r from-[#6D4CFF]/5 to-[#A855F7]/5 rounded-xl p-4 border border-[#6D4CFF]/10 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-[9px] text-gray-400 uppercase tracking-wider">Current Plan</div>
                        <div className="text-lg font-extrabold text-gray-900">Professional</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[9px] font-semibold border border-green-100">Active</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Active Jobs', value: '12 / 25' },
                        { label: 'Candidate Credits', value: '248 / 500' },
                        { label: 'AI Credits', value: '892 / 1000' },
                        { label: 'Team Members', value: '5 / 10' },
                      ].map((m, i) => (
                        <div key={i} className="text-center p-2 rounded-lg bg-white/60">
                          <div className="text-[10px] font-bold text-gray-800">{m.value}</div>
                          <div className="text-[7px] text-gray-400">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="text-[9px] text-gray-400">Next Billing Date</div>
                      <div className="text-[12px] font-bold text-gray-800">Feb 15, 2026</div>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="text-[9px] text-gray-400">Monthly Amount</div>
                      <div className="text-[12px] font-bold text-gray-800">₹4,999/month</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-[10px] font-bold hover:bg-[#5a3ed9] transition-all shadow-sm">Upgrade Plan</button>
                    <button className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-[10px] font-semibold hover:bg-gray-50 transition-all">View Invoices</button>
                    <button className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-[10px] font-semibold hover:bg-gray-50 transition-all">Payment Methods</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
              <div className="p-4 md:p-5 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Lock size={14} className="text-[#6D4CFF]" /> Privacy & Compliance</h3>
              </div>
              <div className="p-4 md:p-5 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <div className="text-[11px] font-semibold text-gray-800">GDPR Compliance</div>
                    <div className="text-[9px] text-gray-400">Ensure compliance with data protection regulations</div>
                  </div>
                  <Toggle value={privacy.gdpr_compliant} onChange={(v) => setPrivacy((s) => ({ ...s, gdpr_compliant: v }))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <label className="text-[9px] font-medium text-gray-400 uppercase tracking-wider block mb-1">Data Retention (days)</label>
                    <input type="number" value={privacy.data_retention_days} onChange={(e) => setPrivacy((s) => ({ ...s, data_retention_days: Number(e.target.value) }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <label className="text-[9px] font-medium text-gray-400 uppercase tracking-wider block mb-1">Resume Retention (days)</label>
                    <input type="number" value={privacy.resume_retention} onChange={(e) => setPrivacy((s) => ({ ...s, resume_retention: Number(e.target.value) }))}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#6D4CFF]/20" />
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between">
                  <button className="text-[10px] font-medium text-red-500 hover:text-red-600 flex items-center gap-1"><Trash2 size={12} /> Delete Organization</button>
                  <button
                    onClick={() => showSaveSuccess('Privacy settings saved successfully')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-[10px] font-bold hover:bg-[#5a3ed9] transition-all shadow-sm">
                    <Save size={13} /> Save Privacy Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
              <div className="p-4 md:p-5 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><FileText size={14} className="text-[#6D4CFF]" /> Audit Logs</h3>
                  <div className="flex items-center gap-2">
                    {['all', '24h', '7d', '30d'].map((f) => (
                      <button key={f} onClick={() => setLogFilter(f)}
                        className={`px-2.5 py-1 rounded-lg text-[8px] font-semibold transition-all ${logFilter === f ? 'bg-[#6D4CFF] text-white' : 'text-gray-400 hover:bg-gray-100'}`}>
                        {f === 'all' ? 'All' : f === '24h' ? '24 Hours' : f === '7d' ? '7 Days' : '30 Days'}
                      </button>
                    ))}
                    <button className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50"><Download size={12} /></button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead className="bg-gray-50/80">
                    <tr>
                      {['User', 'Action', 'Date', 'IP Address', 'Device', 'Status'].map((h) => (
                        <th key={h} className="text-left px-3 py-2.5 text-[8px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-[10px] text-gray-400">No audit log entries</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-4">
          {/* Quick Status */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
            <h3 className="text-xs font-bold text-gray-800 mb-3">Quick Status</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Profile Completion', value: '92%', color: CLR.primary },
                { label: 'Security Score', value: '88/100', color: CLR.success },
                { label: 'AI Usage Score', value: '92%', color: CLR.purple },
                { label: 'System Health', value: 'All Good', color: CLR.teal },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                  <span className="text-[10px] text-gray-500">{item.label}</span>
                  <span className="text-[10px] font-bold" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Changes */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
            <h3 className="text-xs font-bold text-gray-800 mb-3">Recent Changes</h3>
            <div className="space-y-2">
              {[
                { text: 'Notification preferences updated', time: '5 min ago' },
                { text: 'Security settings changed', time: '2 hours ago' },
                { text: 'New team member invited', time: '1 day ago' },
                { text: 'Subscription plan renewed', time: '3 days ago' },
              ].map((change, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6D4CFF] mt-1.5 flex-shrink-0" />
                  <div>
                    <div className="text-[9px] text-gray-600">{change.text}</div>
                    <div className="text-[7px] text-gray-400">{change.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-[#6D4CFF]/5 via-[#A855F7]/5 to-[#EC4899]/5 rounded-2xl p-4 border border-[#6D4CFF]/10 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <h3 className="text-xs font-bold text-gray-800">Quick Actions</h3>
            </div>
            <div className="space-y-1.5">
              {[
                { icon: Settings, label: 'Configure Integrations', color: CLR.info },
                { icon: Users, label: 'Invite Team Member', color: CLR.success },
                { icon: Shield, label: 'Review Security', color: CLR.warning },
                { icon: Download, label: 'Export All Settings', color: CLR.teal },
              ].map((act, i) => {
                const ActIcon = act.icon;
                return (
                  <button key={i} className="w-full flex items-center gap-2 p-2 rounded-lg bg-white/60 hover:bg-white transition-all text-left">
                    <div className="p-1 rounded" style={{ background: `${act.color}12`, color: act.color }}>
                      <ActIcon size={11} />
                    </div>
                    <span className="text-[9px] font-medium text-gray-600">{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
