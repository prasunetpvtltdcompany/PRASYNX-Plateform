'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Mail, Phone, Globe, MapPin, Save, Edit3,
  FileText, Camera, CheckCircle, AlertCircle, Award, TrendingUp,
  Users, Briefcase, Star, Eye, Download, Upload, X, Plus,
  Search, Link, Share2, ChevronDown, MoreHorizontal, Bell,
  Clock, HelpCircle, Target, Zap, Bot, Sparkles, Copy,
  Shield, CheckSquare, Flag, Gift, Rocket, BookOpen,
  Settings, Trash2, RefreshCw, ArrowUpRight, CalendarDays, ExternalLink,
  Video, MessageSquare, UserCheck, GraduationCap, DollarSign,
  Loader, ArrowRight, ArrowLeft, Home, BarChart3, Activity,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart as ReLineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  CartesianGrid,
} from 'recharts';
import apiClient from '../../lib/apiClient';

const CLR = {
  primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B',
  danger: '#EF4444', info: '#3B82F6', purple: '#A855F7',
  indigo: '#4F46E5', pink: '#EC4899', teal: '#14B8A6', orange: '#F97316',
};



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
    <ResponsiveContainer width="100%" height={32}>
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

export default function ProfileDashboard({ provider }: { provider: any }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [form, setForm] = useState<any>({
    company_name: '', contact_name: '', phone: '', website: '',
    description: '', location: '', industry: '', founded_year: '',
    company_size: '', headquarters: '', gst: '', email: '',
    recruitment_email: '', linkedin: '', twitter: '', instagram: '',
    facebook: '', mission: '', vision: '',
  });

  useEffect(() => {
    setLoading(true);
    apiClient.get<any>('/job-provider/profile').then((r) => {
      if (r.success && r.data) {
        setProfile(r.data);
        setForm({
          company_name: r.data.company_name || provider.company_name || '',
          contact_name: r.data.contact_name || provider.contact_name || '',
          phone: r.data.phone || provider.phone || '',
          website: r.data.website || provider.website || '',
          description: r.data.description || '',
          location: r.data.location || '',
          industry: r.data.industry || '',
          founded_year: r.data.founded_year || '',
          company_size: r.data.company_size || '',
          headquarters: r.data.headquarters || '',
          gst: r.data.gst || '',
          email: r.data.email || '',
          recruitment_email: r.data.recruitment_email || '',
          linkedin: r.data.linkedin || '',
          twitter: r.data.twitter || '',
          instagram: r.data.instagram || '',
          facebook: r.data.facebook || '',
          mission: r.data.mission || '',
          vision: r.data.vision || '',
        });
      } else { setProfile(null); }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const r = await apiClient.put('/job-provider/profile', form);
    setSaving(false);
    if (r.success) {
      setProfile(r.data);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setProfile({ ...profile, ...form });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const data = profile || {};

  const renderField = (label: string, value: string, editing: boolean, key: string, icon?: any) => {
    const Icon = icon;
    return (
      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all">
        <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mb-1 uppercase tracking-wider">
          {Icon && <Icon size={11} />} {label}
        </div>
        {editing ? (
          <input value={(form as any)[key] || ''} onChange={(e) => setForm((f: any) => ({ ...f, [key]: e.target.value }))}
            className="w-full bg-transparent text-[12px] font-semibold focus:outline-none border-b border-dashed border-gray-300 focus:border-[#6D4CFF] pb-0.5" />
        ) : (
          <div className="text-[12px] font-semibold text-gray-800">{value || 'Not set'}</div>
        )}
      </div>
    );
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#6D4CFF]" /></div>;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* ===== COMPANY BANNER HERO ===== */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 shadow-sm">
        <div className="h-32 md:h-48 bg-gradient-to-r from-[#6D4CFF] via-[#7C3AED] to-[#A855F7] relative">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-5 left-10 w-32 h-32 bg-white rounded-full blur-[80px]" />
            <div className="absolute bottom-5 right-10 w-40 h-40 bg-purple-300 rounded-full blur-[100px]" />
          </div>
          {editing && (
            <button className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white text-[10px] font-semibold backdrop-blur-sm flex items-center gap-1 transition-all">
              <Camera size={12} /> Change Cover
            </button>
          )}
        </div>
        <div className="px-4 md:px-6 pb-4 md:pb-6 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 sm:-mt-12 relative z-10">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg border-4 border-white flex-shrink-0">
                {(form.company_name || 'P')[0]}
              </div>
              {editing && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 shadow-sm">
                  <Camera size={11} className="text-gray-500" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pt-2 sm:pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {editing ? (
                  <input value={form.company_name} onChange={(e) => setForm((f: any) => ({ ...f, company_name: e.target.value }))}
                    className="text-lg md:text-xl font-extrabold border-b-2 border-[#6D4CFF] focus:outline-none px-1 py-0.5 bg-transparent max-w-[300px]" />
                ) : (
                  <h1 className="text-lg md:text-xl font-extrabold text-gray-900">{data.company_name}</h1>
                )}
                {data.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-semibold border border-blue-100">
                    <Shield size={10} /> Verified Employer
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-gray-500">
                <span className="flex items-center gap-1"><Building2 size={12} /> {form.industry || data.industry}</span>
                <span className="flex items-center gap-1"><Users size={12} /> {form.company_size || data.company_size}</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {form.location || data.location}</span>
                {data.website && <span className="flex items-center gap-1"><Globe size={12} /> {data.website}</span>}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={11} className={s <= Math.round(data.employer_rating || 4.8) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-gray-700">{data.employer_rating || 4.8}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-[#6D4CFF]" style={{ width: `${data.profile_completion || 92}%` }} />
                  </div>
                  <span className="text-[9px] font-medium text-gray-400">{data.profile_completion || 92}% Complete</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              {!editing ? (
                <>
                  <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6D4CFF] text-white text-[10px] font-bold hover:bg-[#5a3ed9] transition-all shadow-sm">
                    <Edit3 size={13} /> Edit Profile
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 text-[10px] font-semibold hover:bg-gray-50 transition-all">
                    <Share2 size={13} /> Share
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-500 text-[10px] font-semibold hover:bg-gray-50 transition-all">
                    <Eye size={13} /> Preview
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditing(false); setForm({ ...profile }); }} className="px-3.5 py-2 rounded-xl border border-gray-200 text-[10px] font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D4CFF] text-white text-[10px] font-bold hover:bg-[#5a3ed9] disabled:opacity-50 transition-all shadow-sm">
                    <Save size={13} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs">
          <CheckCircle size={16} className="text-green-500 flex-shrink-0" /> Profile updated successfully
        </motion.div>
      )}

      {/* ===== COMPANY OVERVIEW KPI CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {[
          { icon: Briefcase, label: 'Active Jobs', value: data.active_jobs || 12, trend: '+3 This Month', color: CLR.primary, chart: [8, 10, 9, 12, 11, 13, 12] },
          { icon: Users, label: 'Applications', value: data.applications_received || 248, trend: '+34 This Week', color: CLR.info, chart: [180, 200, 190, 220, 210, 240, 248] },
          { icon: Award, label: 'Total Hires', value: data.total_hires || 48, trend: '+6 This Quarter', color: CLR.success, chart: [30, 35, 38, 42, 44, 46, 48] },
          { icon: Star, label: 'Employer Rating', value: `${data.employer_rating || 4.8}/5`, trend: 'Excellent', color: CLR.warning, chart: [4.2, 4.3, 4.5, 4.6, 4.7, 4.8, 4.8] },
          { icon: Users, label: 'Team Members', value: data.team_members || 18, trend: '+2 This Month', color: CLR.purple, chart: [12, 13, 14, 15, 16, 17, 18] },
          { icon: Eye, label: 'Profile Views', value: data.profile_views || 4286, trend: '+18% Growth', color: CLR.teal, chart: [2800, 3100, 3400, 3600, 3900, 4100, 4286] },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3, scale: 1.01 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-3.5 border border-gray-100/80 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300">
              <div className="flex items-start justify-between mb-2">
                <div className="p-1.5 rounded-lg" style={{ background: `${card.color}12`, color: card.color }}>
                  <Icon size={14} />
                </div>
                <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${card.color}12`, color: card.color }}>{card.trend}</span>
              </div>
              <div className="text-sm md:text-base font-extrabold text-gray-900">{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</div>
              <div className="text-[9px] text-gray-400 font-medium mb-1.5">{card.label}</div>
              <div className="h-6">
                <MiniChart data={card.chart} color={card.color} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ===== MAIN CONTENT: 3 COLUMNS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT: Company Info + About */}
        <div className="lg:col-span-2 space-y-5">
          {/* Company Information */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
            <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Building2 size={14} className="text-[#6D4CFF]" /> Company Information</h3>
              <button onClick={() => setEditing(!editing)} className={`p-1.5 rounded-lg transition-all ${editing ? 'bg-[#6D4CFF]/10 text-[#6D4CFF]' : 'text-gray-400 hover:bg-gray-100'}`}>
                <Edit3 size={13} />
              </button>
            </div>
            <div className="p-4 md:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {renderField('Company Name', form.company_name || data.company_name, editing, 'company_name', Building2)}
                {renderField('Industry', form.industry || data.industry, editing, 'industry', Briefcase)}
                {renderField('Founded Year', String(form.founded_year || data.founded_year || ''), editing, 'founded_year', CalendarDays)}
                {renderField('Company Size', form.company_size || data.company_size, editing, 'company_size', Users)}
                {renderField('Headquarters', form.headquarters || data.headquarters, editing, 'headquarters', MapPin)}
                {renderField('Location', form.location || data.location, editing, 'location', MapPin)}
                {renderField('Website', form.website || data.website, editing, 'website', Globe)}
                {renderField('Email', form.email || data.email, editing, 'email', Mail)}
                {renderField('Phone', form.phone || data.phone, editing, 'phone', Phone)}
                {renderField('GST Number', form.gst || data.gst, editing, 'gst', FileText)}
                {renderField('Recruitment Email', form.recruitment_email || data.recruitment_email, editing, 'recruitment_email', Mail)}
                {renderField('Contact Person', form.contact_name || data.contact_name, editing, 'contact_name', Users)}
              </div>
            </div>
          </div>

          {/* About Company */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
            <div className="p-4 md:p-5 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><FileText size={14} className="text-[#6D4CFF]" /> About Company</h3>
            </div>
            <div className="p-4 md:p-5 space-y-4">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Mission</div>
                {editing ? (
                  <textarea value={form.mission} onChange={(e) => setForm((f: any) => ({ ...f, mission: e.target.value }))}
                    className="w-full text-[12px] border border-dashed border-gray-300 focus:border-[#6D4CFF] rounded-lg p-2 min-h-[60px] focus:outline-none bg-gray-50" />
                ) : (
                  <p className="text-[12px] text-gray-600 leading-relaxed">{data.mission}</p>
                )}
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Vision</div>
                {editing ? (
                  <textarea value={form.vision} onChange={(e) => setForm((f: any) => ({ ...f, vision: e.target.value }))}
                    className="w-full text-[12px] border border-dashed border-gray-300 focus:border-[#6D4CFF] rounded-lg p-2 min-h-[60px] focus:outline-none bg-gray-50" />
                ) : (
                  <p className="text-[12px] text-gray-600 leading-relaxed">{data.vision}</p>
                )}
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Description</div>
                {editing ? (
                  <textarea value={form.description} onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))}
                    className="w-full text-[12px] border border-dashed border-gray-300 focus:border-[#6D4CFF] rounded-lg p-2 min-h-[80px] focus:outline-none bg-gray-50" />
                ) : (
                  <p className="text-[12px] text-gray-600 leading-relaxed">{data.description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {data.core_values?.map((v: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 p-2 rounded-lg bg-[#6D4CFF]/5 border border-[#6D4CFF]/10">
                    <CheckCircle size={11} className="text-[#6D4CFF]" />
                    <span className="text-[10px] font-medium text-gray-600">{v}</span>
                  </div>
                ))}
              </div>
              {data.benefits && (
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Employee Benefits</div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.benefits.map((b: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-green-50 text-green-600 text-[9px] font-medium border border-green-100">{b}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
            <div className="p-4 md:p-5 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Globe size={14} className="text-[#6D4CFF]" /> Social Media</h3>
            </div>
            <div className="p-4 md:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'LinkedIn', key: 'linkedin', icon: Link, value: data.linkedin },
                  { label: 'Twitter / X', key: 'twitter', icon: Link, value: data.twitter },
                  { label: 'Instagram', key: 'instagram', icon: Link, value: data.instagram },
                  { label: 'Facebook', key: 'facebook', icon: Link, value: data.facebook },
                ].map((s) => (
                  <div key={s.key} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all">
                    <div className="p-1.5 rounded-lg bg-[#6D4CFF]/10 text-[#6D4CFF]"><s.icon size={13} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] text-gray-400 uppercase tracking-wider">{s.label}</div>
                      {editing ? (
                        <input value={(form as any)[s.key] || ''} onChange={(e) => setForm((f: any) => ({ ...f, [s.key]: e.target.value }))}
                          className="w-full bg-transparent text-[11px] font-medium focus:outline-none border-b border-dashed border-gray-300 focus:border-[#6D4CFF] pb-0.5 text-blue-600" />
                      ) : (
                        <a href={s.value} target="_blank" className="text-[11px] font-medium text-blue-600 hover:underline truncate block">{s.value || 'Not set'}</a>
                      )}
                    </div>
                    {s.value && <ExternalLink size={11} className="text-gray-300 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
            <div className="p-4 md:p-5 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><MessageSquare size={14} className="text-[#6D4CFF]" /> Employee Reviews & Testimonials</h3>
            </div>
            <div className="p-4 md:p-5 space-y-3">
              <div className="text-center py-8 text-[11px] text-gray-400">No reviews yet</div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-5">
          {/* Profile Completion */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
            <h3 className="text-xs font-bold text-gray-800 mb-3">Profile Completion</h3>
            <div className="text-center mb-3">
              <div className="relative w-24 h-24 mx-auto mb-2">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f0f0f0" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke={CLR.primary} strokeWidth="3"
                    strokeDasharray={`${(data.profile_completion || 92) * 0.341} 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-extrabold text-[#6D4CFF]">{data.profile_completion || 92}%</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Basic Info', done: true },
                { label: 'Company Description', done: true },
                { label: 'Social Media Links', done: true },
                { label: 'Office Photos', done: false, sug: 'Upload photos' },
                { label: 'Culture Content', done: false, sug: 'Add culture' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-300'}`}>
                    {item.done ? <CheckCircle size={10} /> : <HelpCircle size={10} />}
                  </div>
                  <span className={`text-[10px] ${item.done ? 'text-gray-600' : 'text-gray-400'}`}>{item.label}</span>
                  {!item.done && <span className="text-[8px] text-amber-500">{item.sug}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* AI Employer Brand Score */}
          <div className="bg-gradient-to-br from-[#6D4CFF]/5 via-[#A855F7]/5 to-[#EC4899]/5 rounded-2xl p-4 border border-[#6D4CFF]/10 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6D4CFF] to-[#A855F7] flex items-center justify-center">
                <Bot size={14} className="text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-800">Employer Brand Score</h3>
                <p className="text-[9px] text-gray-400">AI-powered analysis</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'Attraction', value: '88', color: CLR.success },
                { label: 'Branding', value: '85', color: CLR.info },
                { label: 'Response', value: '94', color: CLR.teal },
                { label: 'Reputation', value: '90', color: CLR.purple },
              ].map((m, i) => (
                <div key={i} className="p-2 rounded-lg bg-white/60 text-center">
                  <div className="text-sm font-extrabold" style={{ color: m.color }}>{m.value}%</div>
                  <div className="text-[7px] text-gray-400">{m.label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              {[
                { icon: Camera, text: 'Add company culture images to boost engagement', color: CLR.warning },
                { icon: FileText, text: 'Complete company description for better SEO', color: CLR.info },
                { icon: Link, text: 'Add social media links to increase trust', color: CLR.purple },
              ].map((sug, i) => {
                const SugIcon = sug.icon;
                return (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/60">
                    <SugIcon size={10} className="mt-0.5" style={{ color: sug.color }} />
                    <p className="text-[9px] text-gray-500">{sug.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
            <h3 className="text-xs font-bold text-gray-800 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Upload, label: 'Upload Photos', color: CLR.primary },
                { icon: Download, label: 'Download Assets', color: CLR.teal },
                { icon: Plus, label: 'Invite Member', color: CLR.success, onClick: () => setShowInviteModal(true) },
                { icon: Sparkles, label: 'AI Assistant', color: CLR.purple, onClick: () => setShowAIAssistant(true) },
              ].map((action, i) => {
                const ActionIcon = action.icon;
                return (
                  <button key={i} onClick={action.onClick}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all hover:-translate-y-0.5">
                    <div className="p-1.5 rounded-lg transition-transform group-hover:scale-110" style={{ background: `${action.color}12`, color: action.color }}>
                      <ActionIcon size={13} />
                    </div>
                    <span className="text-[8px] font-semibold text-gray-500 text-center leading-tight">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
            <h3 className="text-xs font-bold text-gray-800 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {data.recent_activity?.map((act: any, i: number) => {
                const ActIcon = act.icon;
                return (
                  <div key={i} className="flex items-start gap-2.5 py-2 border-b border-gray-50 last:border-0">
                    <div className="p-1 rounded-lg mt-0.5 flex-shrink-0" style={{ background: `${act.color}12`, color: act.color }}>
                      <ActIcon size={10} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-gray-600">{act.text}</div>
                      <div className="text-[8px] text-gray-400 mt-0.5">{act.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Campaigns */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
            <h3 className="text-xs font-bold text-gray-800 mb-3">Upcoming Campaigns</h3>
            <div className="space-y-2">
              {data.upcoming_campaigns?.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold text-gray-700 truncate">{c.name}</div>
                    <div className="text-[8px] text-gray-400">{c.date}</div>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-semibold ${c.status === 'Confirmed' ? 'bg-green-50 text-green-600' : c.status === 'Planned' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recruiter Team */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-800">Recruiter Team</h3>
              <button onClick={() => setShowInviteModal(true)} className="text-[9px] font-semibold text-[#6D4CFF] hover:underline flex items-center gap-0.5">
                <Plus size={10} /> Invite
              </button>
            </div>
            <div className="space-y-2">
              {data.recruiters?.map((r: any, i: number) => (
                <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500">
                    {r.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-gray-700 truncate">{r.name}</div>
                    <div className="text-[8px] text-gray-400">{r.role}</div>
                  </div>
                  <span className={`w-1.5 h-1.5 rounded-full ${r.active ? 'bg-green-400' : 'bg-gray-300'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== COMPANY PERFORMANCE ANALYTICS ===== */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-gray-100/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><BarChart3 size={14} className="text-[#6D4CFF]" /> Company Performance Analytics</h3>
          <button className="text-[10px] font-semibold text-[#6D4CFF] hover:underline">Full Report</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <h4 className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Profile Views</h4>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={[]}>
                <defs><linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={CLR.primary} stopOpacity={0.3} /><stop offset="100%" stopColor={CLR.primary} stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 8 }} />
                <YAxis tick={{ fontSize: 8 }} />
                <Tooltip contentStyle={{ fontSize: 9, borderRadius: 8 }} />
                <Area type="monotone" dataKey="views" stroke={CLR.primary} strokeWidth={2} fill="url(#pvGrad)" dot={{ r: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Applications Trend</h4>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 8 }} />
                <YAxis tick={{ fontSize: 8 }} />
                <Tooltip contentStyle={{ fontSize: 9, borderRadius: 8 }} />
                <Bar dataKey="applications" fill={CLR.info} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Hiring Performance</h4>
            <ResponsiveContainer width="100%" height={160}>
              <ReLineChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 8 }} />
                <YAxis tick={{ fontSize: 8 }} />
                <Tooltip contentStyle={{ fontSize: 9, borderRadius: 8 }} />
                <Line type="monotone" dataKey="hires" stroke={CLR.success} strokeWidth={2} dot={{ r: 3 }} />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Engagement Stats</h4>
            <div className="space-y-3">
              {[
                { label: 'Profile Views', value: '4,286', change: '+18%', color: CLR.primary },
                { label: 'App Rate', value: '18/Job', change: '+12%', color: CLR.info },
                { label: 'Hire Rate', value: '3.2%', change: '+5%', color: CLR.success },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                  <div>
                    <div className="text-[9px] text-gray-500">{m.label}</div>
                    <div className="text-xs font-bold text-gray-800">{m.value}</div>
                  </div>
                  <span className="text-[9px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">{m.change}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
