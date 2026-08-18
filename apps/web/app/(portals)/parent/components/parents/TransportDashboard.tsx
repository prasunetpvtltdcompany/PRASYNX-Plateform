'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bus, MapPin, Clock, Phone, User, Navigation, Shield,
  GaugeCircle, Route, CalendarDays, Bell, Sparkles,
  RefreshCw, ChevronRight, Fuel, Thermometer, Wifi,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface TransportDashboardProps {
  transportInfo: any;
  busLocation: any;
  refetchBus: () => void;
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

export function TransportDashboard({ transportInfo, busLocation, refetchBus, selectedChild, children, setSelectedChild }: TransportDashboardProps) {
  const [activeTab, setActiveTabLocal] = useState<'info' | 'route' | 'tracking'>('info');
  const [refreshing, setRefreshing] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const effTransport = useMemo(() => {
    if (transportInfo && (transportInfo.route || transportInfo.driver_name)) return transportInfo;
    return {};
  }, [transportInfo]);

  const liveLat = busLocation?.latitude || 12.9716;
  const liveLng = busLocation?.longitude || 77.5946;

  const handleRefresh = async () => {
    setRefreshing(true);
    refetchBus();
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
    toast.success('Bus location updated');
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
                <Bus className="w-3.5 h-3.5 text-purple-200" />
                <span className="text-[10px] font-semibold text-purple-100 uppercase tracking-wider">Transport</span>
              </div>
              {selectedChild && <Badge className="bg-white/20 text-white border-0 text-[10px]">{selectedChild.full_name}</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Bus Tracking & Route Info</h1>
            <p className="text-sm text-white/80 mt-1 max-w-xl">Track school bus in real-time, view route details, driver information, and get arrival alerts.</p>
            <div className="flex flex-wrap gap-3 mt-5">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <Route className="w-4 h-4 text-[#10B981]" />
                <div><span className="text-[10px] text-purple-200/70 block">Route</span><span className="text-sm font-bold text-white">{effTransport.route?.split('-')[0]?.trim() || 'N/A'}</span></div>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <Clock className="w-4 h-4 text-[#F59E0B]" />
                <div><span className="text-[10px] text-purple-200/70 block">Pickup</span><span className="text-sm font-bold text-white">{effTransport.pickup_time || '—'}</span></div>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                <Navigation className="w-4 h-4 text-[#3B82F6]" />
                <div><span className="text-[10px] text-purple-200/70 block">Status</span><span className="text-sm font-bold text-white">{effTransport.tracking_enabled ? 'Active' : 'Inactive'}</span></div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
            <Button onClick={handleRefresh} disabled={refreshing}
              className="bg-white text-[#6D4CFF] hover:bg-white/95 hover:-translate-y-0.5 active:scale-[0.97] font-bold rounded-xl text-xs h-9 px-4 shadow-[0_4px_12px_rgba(255,255,255,0.15)] border-0 transition-all duration-200 gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> {refreshing ? 'Updating...' : 'Refresh'}
            </Button>
            <Button className="bg-white/10 hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.97] text-white font-bold rounded-xl text-xs h-9 px-4 border border-white/25 transition-all duration-200 gap-1.5"
              onClick={() => toast.info('Arrival alerts enabled. You will be notified 5 min before pickup.')}>
              <Bell className="w-3.5 h-3.5" /> Set Alerts
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ===== TOP KPI CARDS ===== */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Bus, label: 'Vehicle No', value: effTransport.vehicle_number || '—', desc: effTransport.bus_model || '', color: '#6D4CFF', bg: '#F3F0FF' },
          { icon: Route, label: 'Pickup Time', value: effTransport.pickup_time || '—', desc: 'Morning Pickup', color: '#10B981', bg: '#F0FDF4' },
          { icon: Clock, label: 'Drop Time', value: effTransport.drop_time || '—', desc: 'Afternoon Drop', color: '#F59E0B', bg: '#FFFBEB' },
          { icon: GaugeCircle, label: 'Capacity', value: `${effTransport.students_aboard || 0}/${effTransport.bus_capacity || 52}`, desc: `${Math.round(((effTransport.students_aboard || 0) / (effTransport.bus_capacity || 52)) * 100)}% Occupied`, color: '#3B82F6', bg: '#EFF6FF', progress: Math.round(((effTransport.students_aboard || 0) / (effTransport.bus_capacity || 52)) * 100) },
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
            { key: 'info', label: 'Bus Info', icon: Bus },
            { key: 'route', label: 'Route Map', icon: Route },
            { key: 'tracking', label: 'Live Track', icon: Navigation },
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
          {/* BUS INFO */}
          {activeTab === 'info' && (
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] flex items-center justify-center"><Bus className="w-5 h-5 text-[#6D4CFF]" /></div>
                  <div><h3 className="font-bold text-sm">Vehicle Details</h3><p className="text-[10px] text-gray-400">Bus Information</p></div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Vehicle Number', value: effTransport.vehicle_number || '—', icon: Bus },
                    { label: 'Model', value: effTransport.bus_model || '—', icon: GaugeCircle },
                    { label: 'Capacity', value: `${effTransport.students_aboard || 0} / ${effTransport.bus_capacity || 52} Students`, icon: User },
                    { label: 'Fuel Level', value: `${effTransport.fuel_level || 0}%`, icon: Fuel },
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] flex items-center justify-center"><User className="w-5 h-5 text-[#F59E0B]" /></div>
                  <div><h3 className="font-bold text-sm">Driver Details</h3><p className="text-[10px] text-gray-400">Contact Information</p></div>
                </div>
                <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white text-sm font-bold">
                      {effTransport.driver_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{effTransport.driver_name || '—'}</h4>
                    <p className="text-[10px] text-gray-400">Certified School Bus Driver</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <a href={`tel:${effTransport.driver_phone}`} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F0FDF4] border border-[rgba(16,185,129,0.15)] hover:bg-[#F0FDF4]/80 transition-all group">
                    <Phone className="w-4 h-4 text-[#10B981]" />
                    <div><span className="text-[10px] text-gray-400 block">Phone</span><span className="text-sm font-semibold text-gray-900 group-hover:text-[#10B981] transition-colors">{effTransport.driver_phone || '—'}</span></div>
                  </a>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F3F0FF] border border-[rgba(109,76,255,0.15)]">
                    <Route className="w-4 h-4 text-[#6D4CFF]" />
                    <div><span className="text-[10px] text-gray-400 block">Assigned Route</span><span className="text-sm font-semibold text-gray-900">{effTransport.route || '—'}</span></div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ROUTE MAP */}
          {activeTab === 'route' && (
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-[#6D4CFF]" />
                    <h3 className="font-bold text-sm">Route Stops</h3>
                  </div>
                  <Badge className="bg-[#F3F0FF] text-[#6D4CFF] border-0 text-[10px]">{effTransport.stops?.length || 0} stops</Badge>
                </div>
                <div className="space-y-0">
                  {(effTransport.stops || []).map((stop: any, i: number) => {
                    const isLast = i === (effTransport.stops?.length || 0) - 1;
                    const isFirst = i === 0;
                    const isSchool = stop.name?.toLowerCase().includes('school');
                    return (
                      <div key={i} className="flex gap-4 relative">
                        <div className="flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isSchool ? 'bg-[#6D4CFF]' : isFirst ? 'bg-[#10B981]' : isLast ? 'bg-[#3B82F6]' : 'bg-gray-200'}`}>
                            <div className={`w-2 h-2 rounded-full ${isSchool ? 'bg-white' : isFirst || isLast ? 'bg-white' : 'bg-gray-400'}`} />
                          </div>
                          {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-0.5 min-h-[24px]" />}
                        </div>
                        <div className={`flex-1 pb-4 ${isLast ? 'pb-0' : ''}`}>
                          <div className={`p-3 rounded-xl border ${isSchool ? 'bg-[#F3F0FF] border-[#6D4CFF]/20' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className={`text-sm font-semibold ${isSchool ? 'text-[#6D4CFF]' : 'text-gray-800'}`}>{stop.name}</span>
                                {isSchool && <Badge className="ml-2 bg-[#6D4CFF] text-white border-0 text-[8px] px-1 py-0">School</Badge>}
                              </div>
                              <div className="text-right">
                                <span className={`text-xs font-bold ${isSchool ? 'text-[#6D4CFF]' : 'text-gray-500'}`}>{stop.time}</span>
                                {isFirst && <div className="text-[8px] text-[#10B981] font-semibold">PICKUP</div>}
                                {isLast && <div className="text-[8px] text-[#3B82F6] font-semibold">DROP</div>}
                              </div>
                            </div>
                            {!isLast && stop.order && (
                              <div className="text-[10px] text-gray-400 mt-0.5">Stop #{stop.order} of {effTransport.stops?.length}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}

          {/* LIVE TRACKING */}
          {activeTab === 'tracking' && (
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-[#6D4CFF]" />
                    <h3 className="font-bold text-sm">Live Bus Location</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="text-[10px] text-[#10B981] font-semibold">LIVE</span>
                  </div>
                </div>
                <div className="h-64 rounded-2xl bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center border border-gray-200 relative overflow-hidden">
                  {effTransport.tracking_enabled ? (
                    <div className="text-center relative z-10">
                      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] flex items-center justify-center shadow-[0_8px_24px_rgba(109,76,255,0.25)]">
                        <Bus className="w-8 h-8 text-white" />
                      </motion.div>
                      <p className="text-sm font-bold text-gray-700">Bus is en route</p>
                      <div className="flex items-center justify-center gap-4 mt-2">
                        <div className="text-center">
                          <span className="text-[10px] text-gray-400 block">Speed</span>
                          <span className="text-xs font-bold text-[#6D4CFF]">{effTransport.speed || 0} km/h</span>
                        </div>
                        <div className="w-px h-6 bg-gray-200" />
                        <div className="text-center">
                          <span className="text-[10px] text-gray-400 block">Next Stop</span>
                          <span className="text-xs font-bold text-[#10B981]">{effTransport.next_stop || '—'}</span>
                        </div>
                        <div className="w-px h-6 bg-gray-200" />
                        <div className="text-center">
                          <span className="text-[10px] text-gray-400 block">ETA</span>
                          <span className="text-xs font-bold text-[#F59E0B]">{effTransport.eta_next_stop || '—'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-gray-400">
                        <MapPin className="w-3 h-3" />
                        <span>{liveLat.toFixed(4)}, {liveLng.toFixed(4)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Navigation className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-medium text-gray-600">Tracking Unavailable</p>
                      <p className="text-xs mt-1">Real-time bus tracking is currently disabled for this route.</p>
                    </div>
                  )}
                  {/* Map decorative elements */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full border-2 border-[#6D4CFF]" />
                    <div className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full border-2 border-[#10B981]" />
                    <div className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full border-2 border-[#3B82F6]" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm" className="text-[10px] h-8 rounded-lg gap-1 flex-1">
                    <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> Refresh Location
                  </Button>
                  <Button size="sm" className="bg-[#6D4CFF] text-white text-[10px] h-8 rounded-lg gap-1 flex-1 hover:bg-[#5B3FE8]"
                    onClick={() => toast.success('Arrival alert set for next stop!')}>
                    <Bell className="w-3 h-3" /> Alert at Stop
                  </Button>
                  <Button size="sm" variant="outline" className="text-[10px] h-8 rounded-lg gap-1"
                    onClick={() => toast.info('Map view expanded to full screen')}>
                    <MapPin className="w-3 h-3" /> Full Map
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-4">
          {/* QUICK STATS */}
          <motion.div variants={fadeUp}>
            <Card className="p-4">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-3"><GaugeCircle className="w-3.5 h-3.5 text-[#6D4CFF]" />Live Stats</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-gray-500 flex items-center gap-1"><Fuel className="w-3 h-3" />Fuel Level</span>
                    <span className="text-[10px] font-bold" style={{ color: (effTransport.fuel_level || 0) > 30 ? '#10B981' : '#EF4444' }}>{effTransport.fuel_level || 0}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${effTransport.fuel_level || 0}%` }} transition={{ duration: 1 }}
                      className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${(effTransport.fuel_level || 0) > 30 ? '#10B981' : '#EF4444'}, ${(effTransport.fuel_level || 0) > 30 ? '#10B981' : '#EF4444'}88)` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-gray-500 flex items-center gap-1"><Thermometer className="w-3 h-3" />Temperature</span>
                    <span className="text-[10px] font-bold text-[#F59E0B]">24°C</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '72%' }} transition={{ duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#3B82F6] via-[#10B981] to-[#F59E0B]" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0FDF4] border border-[rgba(16,185,129,0.15)]">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-3.5 h-3.5 text-[#10B981]" />
                    <span className="text-[11px] text-gray-600">Bus WiFi</span>
                  </div>
                  <Badge className="text-[9px] bg-[#10B981] text-white border-0">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F3F0FF] border border-[rgba(109,76,255,0.15)]">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#6D4CFF]" />
                    <span className="text-[11px] text-gray-600">GPS Tracking</span>
                  </div>
                  <Badge className={`text-[9px] border-0 ${effTransport.tracking_enabled ? 'bg-[#10B981] text-white' : 'bg-gray-200 text-gray-500'}`}>{effTransport.tracking_enabled ? 'Enabled' : 'Off'}</Badge>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* SCHEDULE CARD */}
          <motion.div variants={fadeUp}>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="w-4 h-4 text-[#6D4CFF]" />
                <h3 className="text-xs font-bold text-gray-800">Today's Schedule</h3>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span className="text-[11px] text-gray-600">Pickup</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{effTransport.pickup_time || '—'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                    <span className="text-[11px] text-gray-600">Drop</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{effTransport.drop_time || '—'}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <span className="text-[11px] text-gray-600">Active Hours</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">~7.5 hrs</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* ALERTS */}
          <motion.div variants={fadeUp}>
            <Card className="p-4 bg-gradient-to-br from-[#F3F0FF] to-[#E8E0FF] border-[rgba(109,76,255,0.15)]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm"><Sparkles className="w-4 h-4 text-[#6D4CFF]" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-[#6D4CFF]">Prerana AI</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">Your bus is on Route 7 and running on schedule. Next stop: {effTransport.next_stop || 'School'}.</p>
                  <div className="mt-2.5 flex gap-1.5">
                    <button onClick={() => toast.success('SMS alert sent to your registered mobile.')}
                      className="flex-1 py-1.5 rounded-lg bg-white text-[9px] font-semibold text-[#6D4CFF] border border-[rgba(109,76,255,0.2)] hover:bg-[#6D4CFF] hover:text-white transition-all">
                      Get SMS Alert
                    </button>
                    <button onClick={() => toast.success('Map link shared on WhatsApp.')}
                      className="flex-1 py-1.5 rounded-lg bg-white text-[9px] font-semibold text-[#6D4CFF] border border-[rgba(109,76,255,0.2)] hover:bg-[#6D4CFF] hover:text-white transition-all">
                      Share Location
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
