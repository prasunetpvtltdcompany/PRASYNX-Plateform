'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, FileText, Phone, User, Shield, Activity,
  Droplets, Thermometer, CalendarDays, Bell, Sparkles,
  AlertTriangle, CheckCircle2, Clock, Stethoscope,
  Syringe, Plus, Pill, Ambulance, ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface HealthDashboardProps {
  healthData: any;
  vaccinations: any[];
  emergencyContacts: any[];
  selectedChild: any;
  children: any[];
  setSelectedChild: (c: any) => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

export function HealthDashboard({ healthData, vaccinations, emergencyContacts, selectedChild, children, setSelectedChild }: HealthDashboardProps) {
  const [activeTab, setActiveTabLocal] = useState<'overview' | 'vaccinations' | 'checkups'>('overview');

  const effHealth = useMemo(() => {
    if (healthData && (healthData.blood_group || healthData.allergies)) return healthData;
    return {};
  }, [healthData]);

  const effVaccinations = useMemo(() => {
    if (vaccinations.length > 0) return vaccinations;
    return [];
  }, [vaccinations]);

  const effContacts = useMemo(() => {
    if (emergencyContacts.length > 0) return emergencyContacts;
    return [];
  }, [emergencyContacts]);

  const completedVacc = effVaccinations.filter((v: any) => v.status === 'completed').length;
  const totalVacc = effVaccinations.length;
  const vaccRate = totalVacc > 0 ? Math.round((completedVacc / totalVacc) * 100) : 0;
  const pendingVacc = totalVacc - completedVacc;

  const getBgColor = (bg: string) => {
    const map: Record<string, string> = {
      'A+': '#F3F0FF', 'A-': '#F3F0FF', 'B+': '#FEF3C7', 'B-': '#FEF3C7',
      'AB+': '#F0FDF4', 'AB-': '#F0FDF4', 'O+': '#EFF6FF', 'O-': '#EFF6FF',
    };
    return map[bg] || '#F3F0FF';
  };

  const getTextColor = (bg: string) => {
    const map: Record<string, string> = {
      'A+': '#6D4CFF', 'A-': '#6D4CFF', 'B+': '#F59E0B', 'B-': '#F59E0B',
      'AB+': '#10B981', 'AB-': '#10B981', 'O+': '#3B82F6', 'O-': '#3B82F6',
    };
    return map[bg] || '#6D4CFF';
  };

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
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20">
                <Heart className="w-3.5 h-3.5 text-purple-200" />
                <span className="text-[10px] font-semibold text-purple-100 uppercase tracking-wider">Health & Wellness</span>
              </div>
              {selectedChild && <Badge className="bg-white/20 text-white border-0 text-[10px]">{selectedChild.full_name}</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Student Health Hub</h1>
            <p className="text-sm text-white/80 mt-1 max-w-xl">Track health records, vaccinations, medical checkups, and emergency contacts in one place.</p>
            <div className="flex flex-wrap gap-3 mt-5">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <Droplets className="w-4 h-4" style={{ color: getTextColor(effHealth.blood_group || 'A+') }} />
                <div><span className="text-[10px] text-purple-200/70 block">Blood Group</span><span className="text-sm font-bold text-white">{effHealth.blood_group || '—'}</span></div>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <Syringe className="w-4 h-4 text-[#10B981]" />
                <div><span className="text-[10px] text-purple-200/70 block">Vaccinations</span><span className="text-sm font-bold text-white">{completedVacc}/{totalVacc}</span></div>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <div><span className="text-[10px] text-purple-200/70 block">Vaccination Rate</span><span className="text-sm font-bold text-white">{vaccRate}%</span></div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
            <Button className="bg-white text-[#6D4CFF] hover:bg-white/95 hover:-translate-y-0.5 active:scale-[0.97] font-bold rounded-xl text-xs h-9 px-4 shadow-[0_4px_12px_rgba(255,255,255,0.15)] border-0 transition-all duration-200 gap-1.5"
              onClick={() => toast.success('Downloading health report...')}>
              <FileText className="w-3.5 h-3.5" /> Health Report
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.97] text-white font-bold rounded-xl text-xs h-9 px-4 border border-white/25 transition-all duration-200 gap-1.5"
              onClick={() => toast.info('Emergency contact dialed: 108')}>
              <Ambulance className="w-3.5 h-3.5" /> Emergency
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ===== TOP KPI CARDS ===== */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Heart, label: 'Blood Group', value: effHealth.blood_group || '—', desc: 'Type', color: getTextColor(effHealth.blood_group || 'A+'), bg: getBgColor(effHealth.blood_group || 'A+') },
          { icon: Syringe, label: 'Vaccinations', value: `${completedVacc}/${totalVacc}`, desc: `${vaccRate}% Complete`, color: '#10B981', bg: '#F0FDF4', progress: vaccRate },
          { icon: Activity, label: 'BMI', value: effHealth.bmi || '—', desc: effHealth.bmi && parseFloat(effHealth.bmi) < 25 ? 'Healthy Range' : 'Needs Attention', color: effHealth.bmi && parseFloat(effHealth.bmi) < 25 ? '#10B981' : '#F59E0B', bg: effHealth.bmi && parseFloat(effHealth.bmi) < 25 ? '#F0FDF4' : '#FFFBEB' },
          { icon: Stethoscope, label: 'Last Checkup', value: effHealth.last_checkup ? new Date(effHealth.last_checkup).toLocaleDateString() : '—', desc: effHealth.last_checkup ? `${Math.floor((Date.now() - new Date(effHealth.last_checkup).getTime()) / (86400000 * 30))} months ago` : 'Not recorded', color: '#3B82F6', bg: '#EFF6FF' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={i} whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#6D4CFF]/20 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: item.bg, color: item.color }}><Icon className="w-4.5 h-4.5" /></div>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.05, type: 'spring' }} className="w-2 h-2 rounded-full" style={{ background: item.color }} />
              </div>
              <div className="text-[11px] font-medium text-gray-400 mb-0.5">{item.label}</div>
              <div className="text-lg font-extrabold text-gray-900">{item.value}</div>
              <div className="text-[10px]" style={{ color: item.color }}>{item.desc}</div>
              {(item as any).progress !== undefined && (
                <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(item as any).progress}%` }} transition={{ duration: 1, delay: 0.5 + i * 0.08 }}
                    className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}88)` }} />
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* ===== TABS ===== */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-100 w-fit">
          {[
            { key: 'overview', label: 'Overview', icon: Heart },
            { key: 'vaccinations', label: 'Vaccinations', icon: Syringe },
            { key: 'checkups', label: 'Checkups', icon: Stethoscope },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTabLocal(tab.key as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-semibold transition-all ${isActive ? 'bg-white text-[#6D4CFF] shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}>
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center"><Heart className="w-5 h-5 text-[#6D4CFF]" /></div>
                  <div><h3 className="font-bold text-sm">Health Profile</h3><p className="text-[10px] text-gray-400">{selectedChild?.full_name || 'Student'}</p></div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Height', value: effHealth.height || '—', icon: User },
                    { label: 'Weight', value: effHealth.weight || '—', icon: Thermometer },
                    { label: 'BMI', value: effHealth.bmi || '—', icon: Activity },
                    { label: 'Vision', value: effHealth.vision || '—', icon: FileText },
                    { label: 'Dental', value: effHealth.dental || '—', icon: FileText },
                  ].map((r, i) => {
                    const Icon = r.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <Icon className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500 flex-1">{r.label}</span>
                        <span className="text-xs font-semibold text-gray-800">{r.value}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
              <Card className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-[#F59E0B]" /></div>
                  <div><h3 className="font-bold text-sm">Medical Notes</h3><p className="text-[10px] text-gray-400">Important Health Info</p></div>
                </div>
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-[#FEF3C7] border border-[rgba(245,158,11,0.2)]">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span className="text-xs font-bold text-gray-700">Allergies</span>
                    </div>
                    <p className="text-xs text-gray-600">{effHealth.allergies || 'None reported'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F3F0FF] border border-[rgba(109,76,255,0.15)]">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-3.5 h-3.5 text-[#6D4CFF]" />
                      <span className="text-xs font-bold text-gray-700">Additional Notes</span>
                    </div>
                    <p className="text-xs text-gray-600">{effHealth.notes || 'No additional notes'}</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F0FDF4] border border-[rgba(16,185,129,0.15)]">
                    <CalendarDays className="w-4 h-4 text-[#10B981]" />
                    <div><span className="text-[10px] text-gray-400 block">Last Checkup</span><span className="text-xs font-semibold text-gray-800">{effHealth.last_checkup ? new Date(effHealth.last_checkup).toLocaleDateString() : '—'}</span></div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* VACCINATIONS */}
          {activeTab === 'vaccinations' && (
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-[#6D4CFF]" />
                    <h3 className="font-bold text-sm">Vaccination Records</h3>
                  </div>
                  <Badge className={`text-[9px] border-0 ${vaccRate >= 80 ? 'bg-[#F0FDF4] text-[#10B981]' : 'bg-[#FEF3C7] text-[#F59E0B]'}`}>{vaccRate}% Complete</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase">Vaccine</th>
                        <th className="text-left py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase">Date Administered</th>
                        <th className="text-left py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase">Booster Due</th>
                        <th className="text-left py-2.5 px-2 text-[10px] font-semibold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {effVaccinations.map((v: any, i: number) => {
                        const isCompleted = v.status === 'completed';
                        return (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 px-2 text-sm font-medium text-gray-800">{v.name || v.vaccine}</td>
                            <td className="py-3 px-2 text-xs text-gray-500">{v.date ? new Date(v.date).toLocaleDateString() : '—'}</td>
                            <td className="py-3 px-2 text-xs text-gray-500">{v.booster && v.booster !== '—' ? new Date(v.booster).toLocaleDateString() : '—'}</td>
                            <td className="py-3 px-2">
                              <Badge className={`text-[9px] font-semibold border-0 ${isCompleted ? 'bg-[#F0FDF4] text-[#10B981]' : 'bg-[#FFFBEB] text-[#F59E0B]'}`}>
                                {isCompleted ? 'Completed' : 'Pending'}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] border border-[rgba(109,76,255,0.15)] flex items-center gap-3">
                  <Bell className="w-4 h-4 text-[#6D4CFF] flex-shrink-0" />
                  <p className="text-[11px] text-gray-600 flex-1">{pendingVacc > 0 ? `${pendingVacc} vaccination${pendingVacc > 1 ? 's are' : ' is'} pending. Schedule a visit to complete the immunization schedule.` : 'All vaccinations are up to date! Great job keeping your child protected.'}</p>
                  <Button size="sm" className="text-[10px] h-7 bg-[#6D4CFF] text-white rounded-lg flex-shrink-0" onClick={() => toast.success('Appointment booking form opened')}>
                    <Plus className="w-3 h-3" /> Schedule
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* CHECKUPS */}
          {activeTab === 'checkups' && (
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-[#6D4CFF]" />
                    <h3 className="font-bold text-sm">Medical Checkups</h3>
                  </div>
                  <Button size="sm" className="text-[10px] h-7 bg-[#6D4CFF] text-white rounded-lg"
                    onClick={() => toast.success('New checkup record form opened')}>
                    <Plus className="w-3 h-3" /> Add Record
                  </Button>
                </div>
                <div className="space-y-2.5">
                  {([] as any[]).map((c, i) => (
                    <motion.div key={i} whileHover={{ x: 1 }}
                      className="p-4 rounded-xl border border-gray-100 bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.status === 'completed' ? 'bg-[#F0FDF4] text-[#10B981]' : 'bg-[#FFFBEB] text-[#F59E0B]'}`}>
                          {c.status === 'completed' ? <CheckCircle2 className="w-4.5 h-4.5" /> : <Clock className="w-4.5 h-4.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm text-gray-900">{c.type}</h4>
                            <Badge className={`text-[9px] border-0 ${c.status === 'completed' ? 'bg-[#F0FDF4] text-[#10B981]' : 'bg-[#FFFBEB] text-[#F59E0B]'}`}>{c.status}</Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                            <span className="text-[11px] text-gray-400">{new Date(c.date).toLocaleDateString()}</span>
                            <span className="text-[11px] text-gray-400">{c.doctor}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1.5 italic">{c.notes}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-4">
          {/* EMERGENCY CONTACTS */}
          <motion.div variants={fadeUp}>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-4 h-4 text-[#EF4444]" />
                <h3 className="text-xs font-bold text-gray-800">Emergency Contacts</h3>
              </div>
              <div className="space-y-2">
                {effContacts.map((c: any, i: number) => (
                  <div key={c.id || i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#EF4444]/20 hover:bg-[#FEF2F2] transition-all group">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-gray-800">{c.name}</div>
                        <div className="text-[10px] text-gray-400">{c.relation}</div>
                      </div>
                      <a href={`tel:${c.phone}`}
                        className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-all shadow-sm">
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <div className="mt-1.5 text-[11px] font-semibold text-[#EF4444]">{c.phone}</div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 text-[10px] h-8 rounded-lg gap-1"
                onClick={() => toast.info('Dialing emergency services...')}>
                <Ambulance className="w-3 h-3" /> Emergency: 108
              </Button>
            </Card>
          </motion.div>

          {/* QUICK STATS */}
          <motion.div variants={fadeUp}>
            <Card className="p-4">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-3"><Activity className="w-3.5 h-3.5 text-[#6D4CFF]" />Health Summary</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0FDF4] border border-[rgba(16,185,129,0.15)]">
                  <span className="text-[11px] text-gray-600 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-[#10B981]" />Vaccinations</span>
                  <Badge className="text-[9px] bg-[#10B981] text-white border-0">{completedVacc} Done</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F3F0FF] border border-[rgba(109,76,255,0.15)]">
                  <span className="text-[11px] text-gray-600 flex items-center gap-1.5"><Stethoscope className="w-3 h-3 text-[#6D4CFF]" />Checkups</span>
                  <Badge className="text-[9px] bg-[#6D4CFF] text-white border-0">0 Completed</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FEF3C7] border border-[rgba(245,158,11,0.15)]">
                  <span className="text-[11px] text-gray-600 flex items-center gap-1.5"><Pill className="w-3 h-3 text-[#F59E0B]" />Allergies</span>
                  <span className="text-[10px] font-semibold text-[#F59E0B]">{effHealth.allergies && effHealth.allergies !== 'None' && effHealth.allergies !== '—' ? 'Known' : 'None'}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* PRERANA AI */}
          <motion.div variants={fadeUp}>
            <Card className="p-4 bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] border-[rgba(109,76,255,0.15)]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm"><Sparkles className="w-4 h-4 text-[#6D4CFF]" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-[#6D4CFF]">Health Tips</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">Regular checkups and vaccinations are key to your child's wellbeing. Schedule a dental visit every 6 months.</p>
                  <div className="mt-2.5 flex gap-1.5">
                    <button onClick={() => toast.success('Health tips guide downloaded')}
                      className="flex-1 py-1.5 rounded-lg bg-white text-[9px] font-semibold text-[#6D4CFF] border border-[rgba(109,76,255,0.2)] hover:bg-[#6D4CFF] hover:text-white transition-all">
                      Health Guide
                    </button>
                    <button onClick={() => toast.info('Appointment booking opened')}
                      className="flex-1 py-1.5 rounded-lg bg-white text-[9px] font-semibold text-[#6D4CFF] border border-[rgba(109,76,255,0.2)] hover:bg-[#6D4CFF] hover:text-white transition-all">
                      Book Checkup
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>


    </motion.div>
  );
}
