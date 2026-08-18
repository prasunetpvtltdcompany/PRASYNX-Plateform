'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays, Clock, School, BookOpen, Users, ChevronLeft, ChevronRight,
  Plus, Search, X, Filter, Star, Sparkles, Bell, FileText, CheckCircle2,
  AlertCircle, Award, TrendingUp, MapPin, HelpCircle, Send, Globe,
  BarChart3, PieChart as PieChartIcon, Target, Zap, Eye,
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

interface CalendarDashboardProps {
  darkMode?: boolean;
  setActiveTab?: (tab: string) => void;
  exams?: any[];
  timetable?: any[];
  timetableHook?: any;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const demoEvents: any[] = [];

const demoSchedule: any[] = [];

const demoActivity: any[] = [];

const weekDayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

export function CalendarDashboard({ darkMode, setActiveTab, exams = [], timetable = [], timetableHook }: CalendarDashboardProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate());
  const [selectedTab, setSelectedTab] = useState<'month' | 'week' | 'schedule'>('month');
  const [filterType, setFilterType] = useState('all');
  const viewDate = new Date(currentYear, currentMonth);

  const todayEvents = demoEvents.filter(e => e.status === 'today');
  const upcomingEvents = demoEvents.filter(e => e.status === 'upcoming').slice(0, 4);
  const filteredEvents = filterType === 'all' ? demoEvents : demoEvents.filter(e => e.type === filterType);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const getEventsForDay = (day: number) => {
    return demoEvents.filter(e => e.date.getDate() === day && e.date.getMonth() === currentMonth && e.date.getFullYear() === currentYear);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  const eventTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return { bg: '#F3F0FF', color: '#7C3AED', label: 'Exam' };
      case 'class': return { bg: '#EFF6FF', color: '#3B82F6', label: 'Class' };
      case 'meeting': return { bg: '#F0FDF4', color: '#10B981', label: 'Meeting' };
      case 'event': return { bg: '#FFFBEB', color: '#F59E0B', label: 'Event' };
      default: return { bg: '#F3F4F6', color: '#6B7280', label: 'Other' };
    }
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

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
                <CalendarDays size={20} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-200">Schedule & Events</div>
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Calendar</h1>
              </div>
            </div>
            <p className="text-sm text-purple-100/90 mt-2 max-w-xl leading-relaxed">
              View your academic calendar, class schedule, exams, and upcoming events.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { icon: School, value: demoSchedule.filter(s => s.type === 'class').length, label: 'Classes Today', color: '#A855F7' },
                { icon: FileText, value: upcomingEvents.length, label: 'Upcoming Events', color: '#3B82F6' },
                { icon: Clock, value: demoSchedule.length, label: 'Time Slots', color: '#10B981' },
                { icon: Bell, value: todayEvents.length, label: 'Today\'s Events', color: '#F59E0B' },
              ].map((stat, i) => (
                <motion.div key={i} whileHover={{ scale: 1.03, y: -2 }} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon size={14} className="text-white/80" />
                    <span className="text-[10px] font-medium text-purple-200/80">{stat.label}</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {typeof stat.value === 'number' ? <CounterAnimation value={stat.value} /> : stat.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={() => toast.success('New event creation coming soon!')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-[#7C3AED] hover:bg-white/95 hover:shadow-[0_8px_24px_rgba(255,255,255,0.25)] font-bold rounded-xl text-xs h-10 shadow-lg border-0 transition-all"
            >
              <Plus size={16} /> Add Event
            </motion.button>
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={() => toast.success('Schedule optimized with AI!')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs h-10 border border-white/25 backdrop-blur-sm transition-all"
            >
              <Sparkles size={16} /> Optimize Schedule
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ===== TAB NAVIGATION ===== */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        {[
          { key: 'month', label: 'Month View', icon: CalendarDays },
          { key: 'week', label: 'Week View', icon: BarChart3 },
          { key: 'schedule', label: 'Schedule', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setSelectedTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all ${selectedTab === tab.key ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            ><Icon size={14} />{tab.label}</button>
          );
        })}
      </div>

      {/* ===== TAB: MONTH VIEW ===== */}
      {selectedTab === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Calendar Header */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 transition-all"><ChevronLeft size={18} /></button>
                  <h2 className="text-lg font-bold">{viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                  <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 transition-all"><ChevronRight size={18} /></button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { const t = new Date(); setCurrentMonth(t.getMonth()); setCurrentYear(t.getFullYear()); setSelectedDate(t.getDate()); }}
                    className="px-3 py-1.5 rounded-lg bg-[#7C3AED] text-white text-xs font-semibold">Today</button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDayHeaders.map(d => (
                  <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-2">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[80px] p-1.5 rounded-lg" />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dayEvents = getEventsForDay(day);
                  const isSelected = selectedDate === day;
                  const todayClass = isToday(day);
                  return (
                    <div key={day} onClick={() => setSelectedDate(day)}
                      className={`min-h-[80px] p-1.5 rounded-lg border cursor-pointer transition-all ${todayClass ? 'bg-[#7C3AED]/10 border-[#7C3AED]/30' : isSelected ? 'bg-gray-50 border-gray-200' : 'border-gray-50 hover:border-gray-200 hover:bg-gray-50'}`}
                    >
                      <div className={`text-xs font-semibold mb-1 ${todayClass ? 'text-[#7C3AED]' : 'text-gray-700'}`}>{day}</div>
                      {dayEvents.slice(0, 3).map((ev, idx) => {
                        const ec = eventTypeColor(ev.type);
                        return (
                          <div key={idx} className="text-[8px] px-1 py-0.5 rounded mb-0.5 truncate font-medium" style={{ background: ec.bg, color: ec.color }}>
                            {ev.type === 'exam' ? '📝' : ev.type === 'class' ? '📚' : ev.type === 'meeting' ? '👥' : '🎉'} {ev.title.slice(0, 18)}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && <div className="text-[8px] text-gray-400 px-1">+{dayEvents.length - 3} more</div>}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">
                {selectedDate ? new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
              </h3>
              {selectedDate && (
                <div className="space-y-2">
                  {getEventsForDay(selectedDate).length > 0 ? getEventsForDay(selectedDate).map((ev, i) => {
                    const ec = eventTypeColor(ev.type);
                    return (
                      <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full" style={{ background: ec.color }} />
                          <span className="text-[10px] font-semibold" style={{ color: ec.color }}>{ec.label}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-900">{ev.title}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                          <Clock size={10} />{ev.time}
                          <MapPin size={10} />{ev.location}
                        </div>
                      </div>
                    );
                  }) : <p className="text-xs text-gray-400">No events on this day</p>}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Upcoming Events</h3>
              <div className="space-y-3">
                {upcomingEvents.map((ev, i) => {
                  const ec = eventTypeColor(ev.type);
                  return (
                    <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: ec.bg }}>
                        <CalendarDays size={16} style={{ color: ec.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-gray-900">{ev.title}</p>
                        <p className="text-[10px] text-gray-400">{formatDate(ev.date)} • {ev.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Prerana AI */}
            <Card className="p-5 bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)] pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">Prerana AI</div>
                    <div className="text-[9px] text-purple-200">Calendar Assistant</div>
                  </div>
                </div>
                <p className="text-[11px] text-purple-100/90 mb-3 leading-relaxed">
                  Manage your schedule, get smart reminders, and optimize your teaching time.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: 'Smart Schedule', icon: CalendarDays },
                    { label: 'Reminders', icon: Bell },
                    { label: 'Conflict Check', icon: AlertCircle },
                    { label: 'Export Calendar', icon: Globe },
                  ].map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <button key={i} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-left transition-all">
                        <Icon size={11} className="text-purple-200" />
                        <span className="text-[10px] font-medium text-white/90">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 border border-white/10">
                  <input type="text" placeholder="Ask Prerana AI..." className="flex-1 bg-transparent text-[11px] text-white placeholder-purple-200/60 outline-none border-0" />
                  <Send size={14} className="text-purple-200 cursor-pointer hover:text-white transition-colors" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ===== TAB: WEEK VIEW ===== */}
      {selectedTab === 'week' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-4">This Week at a Glance</h3>
              <div className="space-y-1">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => {
                  const d = new Date();
                  d.setDate(d.getDate() - d.getDay() + idx + 1);
                  const dayEvents = demoEvents.filter(e => e.date.toDateString() === d.toDateString());
                  return (
                    <div key={day} className={`flex items-start gap-4 p-3 rounded-xl ${d.toDateString() === new Date().toDateString() ? 'bg-[#F3F0FF] border border-[#7C3AED]/20' : 'hover:bg-gray-50'} transition-all`}>
                      <div className="w-16 text-center flex-shrink-0">
                        <div className="text-[10px] font-semibold text-gray-400">{day.slice(0, 3)}</div>
                        <div className={`text-lg font-bold ${d.toDateString() === new Date().toDateString() ? 'text-[#7C3AED]' : 'text-gray-900'}`}>{d.getDate()}</div>
                      </div>
                      <div className="flex-1">
                        {dayEvents.length > 0 ? dayEvents.map((ev, i) => {
                          const ec = eventTypeColor(ev.type);
                          return (
                            <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: ec.color }} />
                              <span className="text-xs text-gray-700">{ev.title}</span>
                              <span className="text-[10px] text-gray-400">{ev.time}</span>
                            </div>
                          );
                        }) : <p className="text-xs text-gray-400 py-1">No events scheduled</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Event Filters</h3>
              <div className="space-y-2">
                {[
                  { key: 'all', label: 'All Events', color: '#7C3AED' },
                  { key: 'class', label: 'Classes', color: '#3B82F6' },
                  { key: 'exam', label: 'Exams', color: '#7C3AED' },
                  { key: 'meeting', label: 'Meetings', color: '#10B981' },
                  { key: 'event', label: 'Events', color: '#F59E0B' },
                ].map((f) => (
                  <button key={f.key} onClick={() => setFilterType(f.key)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${filterType === f.key ? 'bg-[#F3F0FF] text-[#7C3AED] font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: f.color }} />
                    {f.label}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ===== TAB: SCHEDULE ===== */}
      {selectedTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-4">Today's Timetable</h3>
              <div className="space-y-1">
                {demoSchedule.map((slot, i) => (
                  <div key={i} className={`flex items-center gap-4 p-3 rounded-xl ${slot.type === 'break' ? 'bg-gray-50' : 'hover:bg-gray-50'} transition-all`}>
                    <div className="w-24 text-[10px] font-semibold text-gray-500 flex-shrink-0">{slot.time}</div>
                    {slot.type === 'break' ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-xs font-medium text-gray-500">{slot.subject}</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-lg bg-[#F3F0FF] flex items-center justify-center text-[#7C3AED] flex-shrink-0">
                          <BookOpen size={14} />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-gray-900">{slot.subject}</div>
                          <div className="text-[10px] text-gray-400">{slot.class} • Room {slot.room}</div>
                        </div>
                        <Badge className="text-[9px] bg-[#F3F0FF] text-[#7C3AED] border-0">{slot.class}</Badge>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Today's Events</h3>
              {todayEvents.length > 0 ? todayEvents.map((ev, i) => {
                const ec = eventTypeColor(ev.type);
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 mb-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: ec.bg }}>
                      <CalendarDays size={14} style={{ color: ec.color }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{ev.title}</p>
                      <p className="text-[10px] text-gray-400">{ev.time} • {ev.location}</p>
                    </div>
                  </div>
                );
              }) : <p className="text-xs text-gray-400">No events today</p>}
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {demoActivity.map((act, i) => (
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

    </motion.div>
  );
}
