'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, ChevronLeft, ChevronRight,
  Download, Clock, CheckCircle2, AlertCircle, Award, Star,
  TrendingUp, FileText, Brain, Lightbulb, CalendarDays, X, Mic,
  Target, Timer, ChevronDown, Calendar, MapPin, Users, Trophy,
  Zap, Gift, BookOpen, Flag, Camera, Medal, Flame, Heart,
  User, ArrowRight, Link, ExternalLink,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6' };
const PIE_COLORS = ['#6D4CFF', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

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

const demoEvents: any[] = [];

const demoClubs: any[] = [];

const demoCompetitions: any[] = [];

const demoRegistered: any[] = [];

const demoAchievements: any[] = [];

const demoLeaderboard: any[] = [];

const demoRecommendations: any[] = [];

const demoGallery: any[] = [];

const demoOpportunities: any[] = [];

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

interface EventsDashboardProps {
  eventsHook: any;
  clubsHook: any;
  eventsData: any[];
  clubsData: any[];
}

export function EventsDashboard({ eventsHook, clubsHook, eventsData, clubsData }: EventsDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Events');
  const [showInsights, setShowInsights] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const filters = ['All Events', 'Workshops', 'Hackathons', 'Competitions', 'Sports', 'Cultural', 'Seminars', 'Clubs', 'Career Events'];

  const effectiveEvents = useMemo(() => {
    if (Array.isArray(eventsData) && eventsData.length > 0) return eventsData;
    return demoEvents;
  }, [eventsData]);

  const effectiveClubs = useMemo(() => {
    if (Array.isArray(clubsData) && clubsData.length > 0) return clubsData;
    return demoClubs;
  }, [clubsData]);

  const filteredEvents = useMemo(() => {
    let list = effectiveEvents;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e: any) =>
        (e.title || e.name || '').toLowerCase().includes(q) ||
        (e.organizer || '').toLowerCase().includes(q) ||
        (e.type || e.event_type || '').toLowerCase().includes(q)
      );
    }
    if (activeFilter !== 'All Events') {
      list = list.filter((e: any) => {
        const cat = e.category || e.type || e.event_type || '';
        return cat.toLowerCase() === activeFilter.toLowerCase().replace(' events', '');
      });
    }
    return list;
  }, [effectiveEvents, searchQuery, activeFilter]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return effectiveEvents
      .filter((e: any) => e.date ? new Date(e.date) >= now : true)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [effectiveEvents]);

  const calendarDays = useMemo(() => {
    const totalDays = daysInMonth(calendarMonth, calendarYear);
    const firstDay = firstDayOfMonth(calendarMonth, calendarYear);
    const days: any[] = [];
    for (let i = 0; i < firstDay; i++) days.push({ date: 0, events: [], isToday: false });
    const today = new Date();
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dateObj = new Date(calendarYear, calendarMonth, d);
      const dayEvents = effectiveEvents.filter((e: any) => e.date === dateStr);
      days.push({
        date: d,
        events: dayEvents,
        isToday: d === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear(),
        isPast: dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      });
    }
    return days;
  }, [calendarMonth, calendarYear, effectiveEvents]);

  const eventCategories = useMemo(() => {
    const map: Record<string, number> = {};
    effectiveEvents.forEach((e: any) => {
      const cat = e.category || e.type || e.event_type || 'Other';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, value], i) => ({
      name, value, color: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [effectiveEvents]);

  const SectionCard = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );

  const daysLeft = (date: string) => Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (eventsHook?.loading) {
    return (
      <div className="space-y-6">
        <div className="page-header"><h1>Events</h1><p>Loading campus events...</p></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-gray-100 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
              <div className="h-7 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-6 animate-pulse">
              <div className="h-40 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (eventsHook?.error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load events</h2>
        <p className="text-gray-500 mb-6">{eventsHook.error}</p>
        <div className="flex gap-3">
          <button onClick={eventsHook.refetch} className="px-6 py-2.5 bg-[#6D4CFF] text-white rounded-xl font-medium hover:bg-[#5A3FD6] transition-colors">Refresh Data</button>
          <button className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">Contact Activities Office</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Campus Events & Activities Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Stay connected with workshops, competitions, hackathons, clubs, sports, cultural activities, and career events.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="px-4 py-2 text-xs font-medium text-[#6D4CFF] bg-[#F3F0FF] rounded-xl hover:bg-[#EBE6FF] transition-all flex items-center gap-2">
            <Calendar className="w-4 h-4" /> My Calendar
          </button>
          <button className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] rounded-xl shadow-[0_4px_14px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_20px_rgba(109,76,255,0.4)] transition-all flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Create Event
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Upcoming Events', value: upcomingEvents.length, suffix: '', icon: Calendar, color: COLORS.primary, bg: '#F3F0FF', sub: 'This semester', trend: 'up' },
          { label: 'Competitions Joined', value: 12, icon: Trophy, color: COLORS.success, bg: '#F0FDF4', sub: 'Active participation', trend: 'up' },
          { label: 'Workshops Attended', value: 18, icon: BookOpen, color: COLORS.warning, bg: '#FFFBEB', sub: 'Skill development', trend: 'up' },
          { label: 'Activity Points', value: 2450, suffix: '', icon: Star, color: COLORS.info, bg: '#EFF6FF', sub: 'Top 15% of class', trend: 'up' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={i}
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
              className="rounded-2xl bg-white border border-gray-100 p-5 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: kpi.bg }}>
                  <Icon size={19} style={{ color: kpi.color }} />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">
                <CounterAnimation value={kpi.value} suffix={kpi.suffix} />
              </div>
              <div className="text-xs font-medium text-gray-500 mt-1">{kpi.label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Smart Event Search */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 md:p-5">
          <div className="relative">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#F3F0FF] to-white border border-[#E8DFFF]">
              <Search className="w-5 h-5 text-[#6D4CFF] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search events, hackathons, workshops, clubs, competitions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
              />
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-700">
                  <Mic className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold hover:shadow-[0_4px_12px_rgba(109,76,255,0.3)] transition-all flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Search
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 text-[10px] font-semibold rounded-full whitespace-nowrap transition-all ${
                  activeFilter === filter
                    ? 'bg-[#6D4CFF] text-white shadow-[0_2px_8px_rgba(109,76,255,0.3)]'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Main Layout: 70% Left | 30% Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN (70%) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Upcoming Events */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Upcoming Events" subtitle={filteredEvents.length > 0 ? `${filteredEvents.length} events found` : ''}>
              {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredEvents.slice(0, 6).map((ev: any, i: number) => {
                    const dl = ev.deadline ? daysLeft(ev.deadline) : 0;
                    const statusColor = dl <= 1 ? COLORS.danger : dl <= 7 ? COLORS.warning : COLORS.success;
                    const statusText = dl <= 1 ? 'Tomorrow' : dl <= 7 ? `${dl} days left` : `${dl} days left`;
                    return (
                      <motion.div
                        key={ev.id || i}
                        whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
                        className="rounded-2xl bg-white border border-gray-100 overflow-hidden transition-all"
                      >
                        <div className="h-20 flex items-center gap-3 px-4" style={{ background: `linear-gradient(135deg, ${PIE_COLORS[i % PIE_COLORS.length]}22, ${PIE_COLORS[i % PIE_COLORS.length]}44)` }}>
                          <span className="text-3xl">{ev.image || '📅'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-gray-900 truncate">{ev.title || ev.name}</div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                              <Badge variant="info" className="text-[8px]">{ev.category || ev.type || ev.event_type || 'Event'}</Badge>
                              <span>{ev.organizer || ''}</span>
                            </div>
                          </div>
                          <div className={`px-2.5 py-1 rounded-lg text-[9px] font-bold ${
                            dl <= 1 ? 'bg-red-50 text-red-600' : dl <= 7 ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                          }`}>{statusText}</div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {ev.date ? new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {ev.time || '—'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {ev.venue || '—'}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                              <Users className="w-3.5 h-3.5 text-gray-400" />
                              {ev.participants || 0} participants
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[10px] font-semibold hover:shadow-[0_4px_12px_rgba(109,76,255,0.3)] transition-all">
                              Register Now
                            </button>
                            <button className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-gray-200 transition-all">
                              Details
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">No events found</p>
                  <p className="text-xs text-gray-400 mb-4">Try adjusting your search or filters</p>
                  <button className="px-4 py-2 bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold rounded-xl transition-all">
                    Browse All Events
                  </button>
                </div>
              )}
            </SectionCard>
          </motion.div>

          {/* Event Calendar */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Event Calendar</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); } else setCalendarMonth(m => m - 1); }}
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-xs font-semibold text-gray-700 min-w-[100px] text-center">{months[calendarMonth]} {calendarYear}</span>
                  <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); } else setCalendarMonth(m => m + 1); }}
                    className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <div key={d} className="text-[10px] font-semibold text-gray-400 text-center py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day: any, i: number) => (
                  <div key={i} className="relative min-h-[40px] text-center py-1 text-xs rounded-lg transition-all cursor-pointer hover:bg-gray-50"
                    style={day.isToday ? { background: '#F3F0FF', border: '1px solid #6D4CFF' } : day.events.length > 0 ? { background: `${PIE_COLORS[0]}15` } : {}}
                  >
                    <span className={`${day.isToday ? 'font-bold text-[#6D4CFF]' : day.isPast ? 'text-gray-300' : 'text-gray-600'}`}>
                      {day.date > 0 ? day.date : ''}
                    </span>
                    {day.events.length > 0 && (
                      <div className="flex justify-center gap-0.5 mt-0.5">
                        {day.events.slice(0, 3).map((_: any, ei: number) => (
                          <div key={ei} className="w-1 h-1 rounded-full bg-[#6D4CFF]" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#6D4CFF]" />
                    <span className="text-[9px] text-gray-500">Events</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-gray-500">{upcomingEvents.length} upcoming events</span>
              </div>
            </Card>
          </motion.div>

          {/* My Registrations + Competitions Hub */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Registrations */}
            <motion.div variants={fadeUp}>
              <SectionCard title="My Registrations" subtitle="Events you've signed up for">
                {demoRegistered.length > 0 ? (
                  <div className="space-y-3">
                    {demoRegistered.map((reg, i) => (
                      <div key={reg.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-900 truncate">{reg.title}</div>
                            <div className="text-[9px] text-gray-500 mt-0.5">
                              {new Date(reg.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                          <Badge variant={reg.status === 'confirmed' ? 'success' : 'warning'} className="text-[8px] capitalize">{reg.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {reg.pass && (
                            <button className="px-2.5 py-1 rounded-lg bg-[#F3F0FF] text-[#6D4CFF] text-[8px] font-semibold hover:bg-[#EBE6FF] transition-all">
                              View Pass
                            </button>
                          )}
                          <div className="flex items-center gap-1.5 ml-auto">
                            <div className={`w-1.5 h-1.5 rounded-full ${reg.attendance === 'completed' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                            <span className="text-[8px] text-gray-500">{reg.attendance === 'completed' ? 'Attended' : 'Pending'}</span>
                          </div>
                          {reg.certificate && (
                            <Download className="w-3 h-3 text-gray-400 hover:text-[#6D4CFF] cursor-pointer" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-xs font-medium text-gray-500">No registered events yet</p>
                    <button className="mt-3 px-3 py-1.5 bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[9px] font-semibold rounded-lg transition-all">
                      Explore Upcoming Events
                    </button>
                  </div>
                )}
              </SectionCard>
            </motion.div>

            {/* Competitions Hub */}
            <motion.div variants={fadeUp}>
              <SectionCard title="Competitions Hub" subtitle="Active competitions & challenges">
                <div className="space-y-3">
                  {demoCompetitions.map((comp, i) => {
                    const diffColor = comp.difficulty === 'Hard' ? COLORS.danger : comp.difficulty === 'Medium' ? COLORS.warning : COLORS.success;
                    return (
                      <div key={comp.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${diffColor}15` }}>
                          <Trophy className="w-4 h-4" style={{ color: diffColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-900">{comp.name}</div>
                          <div className="flex items-center gap-2 text-[9px] text-gray-500 mt-0.5">
                            <span>💰 {comp.prize}</span>
                            <span>👥 {comp.participants}</span>
                            <Badge className="text-[7px]" variant={comp.difficulty === 'Hard' ? 'danger' : comp.difficulty === 'Medium' ? 'warning' : 'success'}>{comp.difficulty}</Badge>
                          </div>
                        </div>
                        <button className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[8px] font-semibold transition-all">
                          Register
                        </button>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </motion.div>
          </div>

          {/* Achievements & Certificates + Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Achievements */}
            <motion.div variants={fadeUp}>
              <SectionCard title="Achievements & Certificates" subtitle="Your campus engagement milestones">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {demoAchievements.map((ach, i) => {
                    const Icon = ach.icon;
                    const pct = Math.round((ach.value / ach.total) * 100);
                    return (
                      <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${ach.color}15` }}>
                            <Icon className="w-3.5 h-3.5" style={{ color: ach.color }} />
                          </div>
                          <span className="text-xs font-extrabold" style={{ color: ach.color }}>{ach.value}</span>
                        </div>
                        <div className="text-[9px] text-gray-600">{ach.label}</div>
                        <div className="h-1 rounded-full bg-gray-200 mt-2 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: ach.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-[#F3F0FF] to-white border border-[#E8DFFF]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-gray-600">Overall Achievement Progress</span>
                    <span className="text-xs font-bold text-[#6D4CFF]">
                      {demoAchievements.reduce((s, a) => s + a.value, 0)}/{demoAchievements.reduce((s, a) => s + a.total, 0)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-200 mt-2 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6]" style={{ width: `${(demoAchievements.reduce((s, a) => s + a.value, 0) / demoAchievements.reduce((s, a) => s + a.total, 0)) * 100}%` }} />
                  </div>
                </div>
              </SectionCard>
            </motion.div>

            {/* Leaderboard */}
            <motion.div variants={fadeUp}>
              <SectionCard title="Leaderboard" subtitle="Top active students this semester">
                <div className="space-y-2">
                  {demoLeaderboard.map((student, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0 ${
                        student.rank === 1 ? 'bg-yellow-500' : student.rank === 2 ? 'bg-gray-400' : student.rank === 3 ? 'bg-amber-700' : ''
                      }`} style={student.rank > 3 ? { background: student.color } : {}}>
                        {student.rank}
                      </div>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ background: student.color }}>
                        {student.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-gray-900">{student.name}</div>
                        <div className="text-[8px] text-gray-500">{student.events} events • {student.achievements} achievements</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-gray-900">{student.points.toLocaleString()}</div>
                        <div className="text-[7px] text-gray-400">pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </motion.div>
          </div>

          {/* Event Gallery */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Event Gallery" subtitle="Recent campus moments">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {demoGallery.map((item, i) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -3, scale: 1.02 }}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-center hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="text-2xl mb-1">{item.emoji}</div>
                    <div className="text-[8px] font-medium text-gray-600 truncate">{item.title}</div>
                    <Badge variant={item.type === 'video' ? 'warning' : 'default'} className="text-[7px] mt-1">{item.type}</Badge>
                  </motion.div>
                ))}
              </div>
            </SectionCard>
          </motion.div>
        </div>

        {/* RIGHT COLUMN (30%) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Today's Campus Insights */}
          <motion.div variants={fadeUp}>
            <Card className="p-5">
              <button onClick={() => setShowInsights(!showInsights)} className="flex items-center justify-between w-full mb-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" /> Today's Campus Insights
                </h3>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showInsights ? 'rotate-180' : ''}`} />
              </button>
              {showInsights && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-white border border-[#E8DFFF]">
                      <div className="text-[9px] text-gray-500">Events Today</div>
                      <div className="text-lg font-extrabold text-[#6D4CFF] mt-0.5">
                        {upcomingEvents.filter((e: any) => {
                          const d = e.date ? new Date(e.date) : null;
                          const today = new Date();
                          return d && d.toDateString() === today.toDateString();
                        }).length || 0}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                      <div className="text-[9px] text-green-600">Club Meetings</div>
                      <div className="text-lg font-extrabold text-green-700 mt-0.5">{effectiveClubs.length}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Upcoming Deadlines', value: `${effectiveEvents.filter((e: any) => e.deadline && daysLeft(e.deadline) <= 7).length} this week`, icon: Timer, color: COLORS.danger },
                      { label: 'Popular Activity', value: 'Coding & Tech Events', icon: Zap, color: COLORS.warning },
                      { label: 'Student Participation', value: `${Math.round((demoRegistered.filter(r => r.status === 'confirmed').length / effectiveEvents.length) * 100)}% engagement rate`, icon: Users, color: COLORS.success },
                    ].map((item, i) => {
                      const Icn = item.icon;
                      return (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${item.color}15` }}>
                            <Icn className="w-3.5 h-3.5" style={{ color: item.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] text-gray-500">{item.label}</div>
                            <div className="text-[11px] font-semibold text-gray-900">{item.value}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* AI Recommendations */}
          <motion.div variants={fadeUp}>
            <Card className="p-5 bg-gradient-to-br from-[#6D4CFF] to-[#4F2DB8] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-semibold">Recommended By Prerana AI</span>
                </div>
                <p className="text-[10px] text-white/70 mb-4">Personalized campus activity suggestions</p>
                <div className="space-y-3">
                  {demoRecommendations.map((rec, i) => {
                    const priorityColor = rec.priority === 'High' ? COLORS.danger : rec.priority === 'Medium' ? COLORS.warning : COLORS.success;
                    return (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold text-white truncate">{rec.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="text-[8px] px-1.5 py-0.5" style={{ background: `${priorityColor}30`, color: '#fff', border: `1px solid ${priorityColor}50` }}>
                              {rec.priority}
                            </Badge>
                            <span className="text-[8px] text-white/60">{rec.benefit}</span>
                          </div>
                        </div>
                        <button className="px-2.5 py-1.5 rounded-lg bg-white/20 text-[9px] font-semibold hover:bg-white/30 transition-all whitespace-nowrap">
                          Register
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Clubs & Communities */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Clubs & Communities" subtitle={`${effectiveClubs.length} active clubs`}>
              <div className="space-y-2">
                {effectiveClubs.slice(0, 6).map((club: any, i: number) => {
                  const color = club.color || PIE_COLORS[i % PIE_COLORS.length];
                  return (
                    <div key={club.id || i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm" style={{ background: `${color}15` }}>
                        <span>{club.image || club.name?.charAt(0) || 'C'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-900">{club.name || club.club_name}</div>
                        <div className="text-[8px] text-gray-500 mt-0.5">{club.members || club.members_count || 0} members • {club.activity || ''}</div>
                      </div>
                      <button className="px-2.5 py-1 rounded-lg bg-[#F3F0FF] text-[#6D4CFF] text-[8px] font-semibold hover:bg-[#EBE6FF] transition-all">
                        Join
                      </button>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </motion.div>

          {/* Networking & Career Events */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Networking & Career Events" subtitle="Industry connections & opportunities">
              <div className="space-y-3">
                {[
                  { title: 'Industry Talk: Future of AI', company: 'Google', date: '2026-07-12', seats: 150, icon: '🔬' },
                  { title: 'Recruitment Drive 2026', company: 'Microsoft', date: '2026-07-20', seats: 200, icon: '💼' },
                  { title: 'Internship Fair', company: 'Multiple Companies', date: '2026-07-25', seats: 500, icon: '🎯' },
                  { title: 'Startup Meetup', company: 'Startup Incubator', date: '2026-08-01', seats: 80, icon: '🚀' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold text-gray-900">{item.title}</div>
                      <div className="text-[8px] text-gray-500">{item.company} • {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="info" className="text-[7px]">{item.seats} seats</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp}>
            <SectionCard title="Quick Actions" subtitle="Campus engagement tools">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Register for Event', icon: Calendar, color: '#6D4CFF' },
                  { label: 'Join Club', icon: Users, color: '#22C55E' },
                  { label: 'Download Certificate', icon: Download, color: '#3B82F6' },
                  { label: 'View Calendar', icon: CalendarDays, color: '#F59E0B' },
                  { label: 'Track Activity Points', icon: Star, color: '#8B5CF6' },
                  { label: 'Ask Prerana AI', icon: Brain, color: '#EC4899' },
                ].map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${action.color}12` }}>
                        <Icon className="w-4 h-4" style={{ color: action.color }} />
                      </div>
                      <span className="text-[9px] font-medium text-gray-600 text-center leading-tight">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </SectionCard>
          </motion.div>
        </div>
      </div>

      {/* Upcoming Opportunities */}
      <motion.div variants={fadeUp}>
        <SectionCard title="Upcoming Opportunities" subtitle="Hackathons, internships, conferences & more">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {demoOpportunities.map((opp, i) => {
              const dl = daysLeft(opp.deadline);
              const typeIcons: Record<string, any> = { 'Hackathon': Zap, 'Internship': Briefcase, 'Conference': Users, 'Competition': Trophy, 'Research': Brain, 'Workshop': BookOpen };
              const Icon = typeIcons[opp.type] || Target;
              const typeColors: Record<string, string> = { 'Hackathon': '#6D4CFF', 'Internship': '#22C55E', 'Conference': '#3B82F6', 'Competition': '#F59E0B', 'Research': '#8B5CF6', 'Workshop': '#EC4899' };
              const color = typeColors[opp.type] || COLORS.primary;
              return (
                <motion.div key={i} whileHover={{ y: -3 }} className="p-4 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-all">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${color}12` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="text-[11px] font-bold text-gray-900 mb-1">{opp.title}</div>
                  <div className="text-[8px] text-gray-500 mb-2">{opp.eligibility}</div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[8px] font-semibold ${dl <= 7 ? 'text-red-500' : 'text-gray-500'}`}>
                      {dl > 0 ? `${dl}d left` : 'Closed'}
                    </span>
                    <button className="px-2 py-1 rounded-lg bg-[#F3F0FF] text-[#6D4CFF] text-[7px] font-semibold hover:bg-[#EBE6FF] transition-all">
                      Apply
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SectionCard>
      </motion.div>

    </motion.div>
  );
}

function Briefcase({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
