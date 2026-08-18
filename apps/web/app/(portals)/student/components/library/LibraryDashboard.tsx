'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Search, Sparkles, ChevronLeft, ChevronRight,
  Download, Clock, CheckCircle2, AlertCircle,
  Star, FileText, Video, BookMarked, Brain, Lightbulb,
  CalendarDays, X, Mic, List, Grid3X3, Timer, ChevronDown,
  CalendarCheck, Target,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
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

const demoBooks: any[] = [];

const demoBorrowed: any[] = [];

const demoRecommendations: any[] = [];

const demoRecentlyAdded: any[] = [];

const demoSources: any[] = [];

const categoryColors: Record<string, string> = {
  'Computer Science': '#6D4CFF',
  Mathematics: '#3B82F6',
  Physics: '#EC4899',
  Chemistry: '#22C55E',
  Biology: '#059669',
  History: '#F59E0B',
  Psychology: '#8B5CF6',
  Philosophy: '#14B8A6',
  Finance: '#D97706',
  'Self-Help': '#0891B2',
  Productivity: '#6D4CFF',
  default: '#94A3B8',
};

interface LibraryDashboardProps {
  libraryHook: any;
  libraryData: any[];
}

export function LibraryDashboard({ libraryHook, libraryData: rawData }: LibraryDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [resourceTab, setResourceTab] = useState('Books');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showInsights, setShowInsights] = useState(true);

  const filters = ['All', 'Books', 'E-books', 'Research Papers', 'Magazines', 'Videos', 'Notes'];

  const libraryData = useMemo(() => {
    if (Array.isArray(rawData) && rawData.length > 0) return rawData;
    return demoBooks;
  }, [rawData]);

  const borrowedBooks = useMemo(() => {
    if (Array.isArray(rawData) && rawData.length > 0) {
      return rawData.filter((b: any) => b.status === 'issued' || b.status === 'active');
    }
    return demoBorrowed;
  }, [rawData]);

  const totalBooks = libraryData.length;
  const borrowedCount = borrowedBooks.length;
  const availableCount = libraryData.filter((b: any) => b.available !== false).length;
  const resourceCount = libraryData.filter((b: any) => b.type !== 'Book').length;

  const filteredBooks = useMemo(() => {
    let list = libraryData;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((b: any) =>
        (b.title || b.name || '').toLowerCase().includes(q) ||
        (b.author || '').toLowerCase().includes(q) ||
        (b.isbn || '').includes(q) ||
        (b.category || '').toLowerCase().includes(q)
      );
    }
    if (activeFilter !== 'All') {
      const filterMap: Record<string, string> = {
        'Books': 'Book',
        'E-books': 'E-Book',
        'Research Papers': 'Research Paper',
        'Magazines': 'Magazine',
        'Videos': 'Video',
        'Notes': 'Notes',
      };
      const type = filterMap[activeFilter];
      if (type) list = list.filter((b: any) => (b.type || b.document_type) === type);
    }
    return list;
  }, [libraryData, searchQuery, activeFilter]);

  const upcomingReturns = useMemo(() => {
    return borrowedBooks
      .filter((b: any) => b.due_date)
      .map((b: any) => {
        const due = new Date(b.due_date);
        const now = new Date();
        const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { ...b, daysLeft };
      })
      .sort((a: any, b: any) => a.daysLeft - b.daysLeft);
  }, [borrowedBooks]);

  const maxCarouselIndex = Math.max(0, demoRecentlyAdded.length - 3);

  const categoryDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    libraryData.forEach((b: any) => {
      const cat = b.category || 'Other';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      color: categoryColors[name] || PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [libraryData]);

  const SectionCard = ({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) => (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );

  if (libraryHook?.loading) {
    return (
      <div className="space-y-6">
        <div className="page-header"><h1>Library</h1><p>Loading library resources...</p></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-gray-100 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-20 mb-2" />
              <div className="h-7 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 p-6 animate-pulse">
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (libraryHook?.error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load library data</h2>
        <p className="text-gray-500 mb-6">{libraryHook.error}</p>
        <div className="flex gap-3">
          <button onClick={libraryHook.refetch} className="px-6 py-2.5 bg-[#6D4CFF] text-white rounded-xl font-medium hover:bg-[#5A3FD6] transition-colors">Refresh Data</button>
          <button className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">Contact Administrator</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">

      {/* Header */}
      <motion.div variants={fadeUp} className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Library & Knowledge Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Access books, e-books, journals, research papers and AI-powered learning resources.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select className="px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 bg-white text-gray-700 outline-none focus:border-[#6D4CFF]">
            <option>All Resources</option>
            <option>Books Only</option>
            <option>E-Books Only</option>
            <option>Research Papers</option>
          </select>
          <button className="px-4 py-2 text-xs font-medium text-[#6D4CFF] bg-[#F3F0FF] rounded-xl hover:bg-[#EBE6FF] transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Borrow History
          </button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div variants={fadeUp}>
        <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#6D4CFF] via-[#8B5CF6] to-[#2D1B69]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(255,255,255,0.15)_0%,transparent_45%),radial-gradient(circle_at_85%_75%,rgba(255,255,255,0.08)_0%,transparent_45%)]" />
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#EC4899]/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-[90px] translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-white/70 mb-3">
              <Sparkles className="w-3.5 h-3.5 inline mr-1 text-yellow-300" />
              Library & Knowledge Hub ✨
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Your Digital Library</h2>
            <p className="text-sm text-white/80 max-w-2xl mb-6">Access thousands of books, e-books, journals, research papers and AI-powered learning resources curated just for you.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
              {[
                { label: 'Total Books', value: totalBooks, color: 'text-white', bg: 'bg-white/10' },
                { label: 'Academic Resources', value: resourceCount, color: 'text-green-300', bg: 'bg-green-500/10' },
                { label: 'Borrowed Books', value: borrowedCount, color: 'text-yellow-300', bg: 'bg-yellow-500/10' },
                { label: 'Recommended For You', value: demoRecommendations.length, color: 'text-purple-300', bg: 'bg-purple-500/10' },
              ].map((stat, i) => (
                <div key={i} className={`rounded-xl p-4 backdrop-blur-sm border border-white/10 ${stat.bg}`}>
                  <div className={`text-2xl md:text-3xl font-extrabold ${stat.color}`}>
                    <CounterAnimation value={stat.value} />
                  </div>
                  <div className="text-[10px] text-white/70 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Search Bar */}
      <motion.div variants={fadeUp}>
        <Card className="p-4 md:p-5">
          <div className="relative">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[#F3F0FF] to-white border border-[#E8DFFF]">
              <Search className="w-5 h-5 text-[#6D4CFF] flex-shrink-0" />
              <input
                type="text"
                placeholder="Ask Prerana AI or search books, authors, journals..."
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

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {[
            { label: 'Borrow Book', icon: BookOpen, color: '#6D4CFF', desc: 'Issue a new book' },
            { label: 'Return Book', icon: BookMarked, color: '#22C55E', desc: 'Return borrowed items' },
            { label: 'Reserve Book', icon: CalendarCheck, color: '#F59E0B', desc: 'Reserve for later' },
            { label: 'Download E-Book', icon: Download, color: '#3B82F6', desc: 'Access digital copies' },
            { label: 'Ask Prerana AI', icon: Brain, color: '#8B5CF6', desc: 'AI-powered help' },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={i}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${action.color}12` }}>
                  <Icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <div className="text-[10px] font-semibold text-gray-700 text-center leading-tight">{action.label}</div>
                <div className="text-[8px] text-gray-400 text-center">{action.desc}</div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Main Content: 40% Left | 60% Right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Section (40%) */}
        <div className="lg:col-span-2 space-y-6">

          {/* My Borrowed Books */}
          <motion.div variants={fadeUp}>
            <SectionCard title="My Borrowed Books" subtitle={borrowedBooks.length > 0 ? `${borrowedBooks.length} books currently issued` : ''}>
              {borrowedBooks.length > 0 ? (
                <div className="space-y-3">
                  {borrowedBooks.map((book: any, i: number) => {
                    const initials = book.cover_initials || (book.title || book.name || 'B').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                    const color = book.cover_color || categoryColors[book.category] || COLORS.primary;
                    const dueDate = book.due_date ? new Date(book.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                    const issueDate = book.issue_date ? new Date(book.issue_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                    const daysLeft = book.due_date ? Math.ceil((new Date(book.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
                    return (
                      <div key={book.id || i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                        <div className="w-10 h-13 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-900 truncate">{book.title || book.name}</div>
                          <div className="text-[10px] text-gray-500">{book.author || ''}</div>
                          <div className="flex items-center gap-3 mt-1.5 text-[9px] text-gray-400">
                            <span>Issued: {issueDate}</span>
                            <span>Due: {dueDate}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#8B6FFF]" style={{ width: `${book.progress || 0}%` }} />
                            </div>
                            <span className="text-[9px] font-semibold text-[#6D4CFF]">{book.progress || 0}%</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1.5">
                            <Clock className="w-3 h-3" style={{ color: daysLeft <= 3 ? COLORS.danger : daysLeft <= 7 ? COLORS.warning : COLORS.success }} />
                            <span className={`text-[9px] font-medium ${daysLeft <= 3 ? 'text-red-500' : daysLeft <= 7 ? 'text-yellow-500' : 'text-green-500'}`}>
                              {daysLeft > 0 ? `${daysLeft} days remaining` : daysLeft === 0 ? 'Due today' : 'Overdue'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Your reading journey starts here</p>
                  <p className="text-xs text-gray-400 mb-4">Borrow your first book from the catalog</p>
                  <button className="px-4 py-2 bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold rounded-xl hover:shadow-[0_4px_14px_rgba(109,76,255,0.3)] transition-all">
                    Browse Library
                  </button>
                </div>
              )}
            </SectionCard>
          </motion.div>

          {/* Current Reading Progress */}
          {borrowedBooks.length > 0 && (
            <motion.div variants={fadeUp}>
              <SectionCard title="Current Reading" subtitle="Your reading progress">
                <div className="space-y-4">
                  {borrowedBooks.slice(0, 3).map((book: any, i: number) => {
                    const colors = ['#6D4CFF', '#22C55E', '#3B82F6'];
                    return (
                      <div key={book.id || i}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-gray-700 truncate mr-2">{book.title || book.name}</span>
                          <span className="text-[10px] font-bold" style={{ color: colors[i] }}>{book.progress || 0}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${book.progress || 0}%` }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${colors[i]}, ${colors[i]}cc)` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* Category Distribution */}
          {categoryDistribution.length > 0 && (
            <motion.div variants={fadeUp}>
              <SectionCard title="Categories" subtitle="Books by category">
                <div className="flex items-center gap-6">
                  <div className="w-28 h-28 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={28} outerRadius={44} paddingAngle={2} dataKey="value">
                          {categoryDistribution.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {categoryDistribution.slice(0, 5).map((cat, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                          <span className="text-[10px] text-gray-600">{cat.name}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-gray-900">{cat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </motion.div>
          )}
        </div>

        {/* Right Section (60%) */}
        <div className="lg:col-span-3 space-y-6">

          {/* Book Catalog */}
          <motion.div variants={fadeUp}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Book Catalog</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{filteredBooks.length} books found</p>
                </div>
                <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                  <button onClick={() => setActiveView('grid')}
                    className={`p-1.5 rounded-md transition-all ${activeView === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Grid3X3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setActiveView('list')}
                    className={`p-1.5 rounded-md transition-all ${activeView === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {filteredBooks.length > 0 ? (
                activeView === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredBooks.slice(0, 9).map((book: any, i: number) => {
                      const initials = book.cover_initials || (book.title || book.name || 'B').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                      const color = book.cover_color || categoryColors[book.category] || COLORS.primary;
                      const available = book.available !== false;
                      return (
                        <motion.div
                          key={book.id || i}
                          whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }}
                          className="rounded-2xl bg-white border border-gray-100 overflow-hidden cursor-pointer group"
                          onClick={() => setSelectedBook(book)}
                        >
                          <div className="h-28 flex items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                            <div className="w-14 h-20 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg shadow-lg transform group-hover:scale-110 transition-transform">
                              {initials}
                            </div>
                            <div className="absolute top-2 right-2">
                              <Badge variant={available ? 'success' : 'default'} className="text-[8px] px-1.5 py-0.5">
                                {available ? 'Available' : 'Issued'}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3">
                            <div className="text-[11px] font-bold text-gray-900 truncate">{book.title || book.name}</div>
                            <div className="text-[9px] text-gray-500 truncate mt-0.5">{book.author}</div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{book.category || 'General'}</span>
                              <div className="flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                                <span className="text-[9px] font-semibold text-gray-700">{book.rating || '-'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <button className="flex-1 py-1.5 rounded-lg bg-[#F3F0FF] text-[#6D4CFF] text-[9px] font-semibold hover:bg-[#EBE6FF] transition-all">
                                View Details
                              </button>
                              <button className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-[9px] font-semibold hover:shadow-[0_2px_8px_rgba(109,76,255,0.3)] transition-all">
                                {available ? 'Borrow Now' : 'Reserve'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredBooks.slice(0, 10).map((book: any, i: number) => {
                      const initials = book.cover_initials || (book.title || book.name || 'B').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                      const color = book.cover_color || categoryColors[book.category] || COLORS.primary;
                      return (
                        <div key={book.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer" onClick={() => setSelectedBook(book)}>
                          <div className="w-8 h-11 rounded-lg flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-900 truncate">{book.title || book.name}</div>
                            <div className="text-[9px] text-gray-500">{book.author} • {book.category || 'General'}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                              <span className="text-[9px] font-semibold text-gray-600">{book.rating || '-'}</span>
                            </div>
                            <Badge variant={book.available !== false ? 'success' : 'default'} className="text-[8px]">{book.available !== false ? 'Available' : 'Issued'}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <Search className="w-10 h-10 text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-500">No books found</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      {/* AI Recommendations */}
      <motion.div variants={fadeUp}>
        <Card className="p-6 bg-gradient-to-br from-[#6D4CFF] to-[#4F2DB8] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#EC4899]/10 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-semibold text-white/90">Recommended By Prerana AI</span>
            </div>
            <p className="text-xs text-white/70 mb-5">Personalized recommendations based on your subjects, attendance, assignments, and exam preparation.</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {demoSources.map((source, i) => (
                <div key={i} className="px-2.5 py-1.5 rounded-lg bg-white/10 border border-white/10 text-[9px] text-white/80 font-medium text-center">
                  {source}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {demoRecommendations.map((rec, i) => {
                const Icon = i === 0 ? BookOpen : i === 1 ? Target : i === 2 ? Star : Lightbulb;
                return (
                  <motion.div
                    key={rec.id}
                    whileHover={{ y: -3 }}
                    className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-[10px] font-medium text-white/70">{rec.reason}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-10 rounded-lg flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0 shadow-sm" style={{ background: rec.cover_color }}>
                        {rec.cover_initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{rec.title}</div>
                        <div className="text-[9px] text-white/70 truncate">{rec.author}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-2.5 h-2.5 text-yellow-300 fill-yellow-300" />
                          <span className="text-[9px] text-white/80">{rec.rating}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recently Added Books + Upcoming Returns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Added */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <SectionCard title="Recently Added" subtitle="New arrivals in the library">
            <div className="relative">
              <div className="flex gap-3 overflow-hidden">
                <AnimatePresence mode="popLayout">
                  {demoRecentlyAdded.slice(carouselIndex, carouselIndex + 3).map((book, i) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="flex-1 min-w-0"
                    >
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm" style={{ background: `linear-gradient(135deg, ${book.cover_color}, ${book.cover_color}dd)` }}>
                            {book.cover_initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-900 truncate">{book.title}</div>
                            <div className="text-[9px] text-gray-500 truncate">{book.author}</div>
                            <div className="text-[8px] text-gray-400 mt-0.5">{book.added}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                  disabled={carouselIndex === 0}
                  className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.ceil(demoRecentlyAdded.length / 3) }).map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${carouselIndex === i * 3 ? 'bg-[#6D4CFF] w-3' : 'bg-gray-300'}`} />
                  ))}
                </div>
                <button
                  onClick={() => setCarouselIndex(Math.min(maxCarouselIndex, carouselIndex + 1))}
                  disabled={carouselIndex >= maxCarouselIndex}
                  className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </SectionCard>
        </motion.div>

        {/* Upcoming Returns */}
        <motion.div variants={fadeUp}>
          <SectionCard title="Upcoming Returns" subtitle="Books due soon">
            {upcomingReturns.length > 0 ? (
              <div className="space-y-3">
                {upcomingReturns.map((book: any, i: number) => {
                  const { daysLeft } = book;
                  const status = daysLeft <= 3 ? 'danger' : daysLeft <= 7 ? 'warning' : 'success';
                  const statusColors = { danger: 'border-red-200 bg-red-50', warning: 'border-yellow-200 bg-yellow-50', success: 'border-green-200 bg-green-50' };
                  const initials = book.cover_initials || (book.title || book.name || 'B').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <div key={book.id || i} className={`flex items-center gap-3 p-3 rounded-xl border ${statusColors[status]}`}>
                      <div className={`w-8 h-10 rounded-lg flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0 ${
                        status === 'danger' ? 'bg-red-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-gray-900 truncate">{book.title || book.name}</div>
                        <div className="text-[9px] text-gray-500">{book.author}</div>
                        <div className={`text-[9px] font-semibold mt-0.5 ${
                          status === 'danger' ? 'text-red-600' : status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-xs font-medium text-gray-500">No upcoming returns</p>
              </div>
            )}
          </SectionCard>
        </motion.div>
      </div>

      {/* Learning Resources + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Learning Resources */}
        <motion.div variants={fadeUp} className="lg:col-span-3">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Learning Resources</h3>
                <p className="text-xs text-gray-500 mt-0.5">Browse categorized learning materials</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
              {['Books', 'Videos', 'Research Papers', 'Lecture Notes', 'Question Banks'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setResourceTab(tab)}
                  className={`px-3.5 py-1.5 text-[10px] font-semibold rounded-full whitespace-nowrap transition-all ${
                    resourceTab === tab
                      ? 'bg-[#6D4CFF] text-white shadow-[0_2px_8px_rgba(109,76,255,0.3)]'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredBooks.filter(b => {
                if (resourceTab === 'Books') return b.type === 'Book' || !b.type;
                if (resourceTab === 'E-books') return b.type === 'E-Book';
                if (resourceTab === 'Research Papers') return b.type === 'Research Paper';
                return true;
              }).slice(0, 6).map((book: any, i: number) => {
                const initials = book.cover_initials || (book.title || book.name || 'R').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                const color = book.cover_color || categoryColors[book.category] || COLORS.info;
                const icons: Record<string, any> = { 'Book': BookOpen, 'E-Book': FileText, 'Research Paper': BookMarked, 'Video': Video, 'Notes': FileText };
                const Icon = icons[book.type as string] || BookOpen;
                return (
                  <div key={book.id || i} className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold text-gray-900 truncate">{book.title || book.name}</div>
                      <div className="text-[8px] text-gray-400">{book.author || ''}</div>
                    </div>
                    <Download className="w-3 h-3 text-gray-400 hover:text-[#6D4CFF] flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Right Sidebar Widget */}
        <motion.div variants={fadeUp}>
          <Card className="p-5">
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="flex items-center justify-between w-full mb-4"
            >
              <h3 className="text-sm font-bold text-gray-900">Today's Insights</h3>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showInsights ? 'rotate-180' : ''}`} />
            </button>
            {showInsights && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookMarked className="w-4 h-4 text-[#6D4CFF]" />
                    <span className="text-[10px] font-semibold text-gray-500">Books Read Today</span>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900">3</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">+2 from yesterday</div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-4 h-4 text-green-500" />
                    <span className="text-[10px] font-semibold text-gray-500">Reading Time</span>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900">2.5h</div>
                  <div className="h-1.5 rounded-full bg-gray-100 mt-2 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500" style={{ width: '63%' }} />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[9px] text-gray-400">
                    <span>Daily goal: 4h</span>
                    <span>63%</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="text-[10px] font-semibold text-gray-500">Recommended Topic</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gradient-to-r from-[#F3F0FF] to-white border border-[#E8DFFF]">
                    <div className="text-xs font-semibold text-[#6D4CFF]">Data Structures</div>
                    <div className="text-[9px] text-gray-500 mt-0.5">Based on your Computer Science subjects</div>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarDays className="w-4 h-4 text-orange-500" />
                    <span className="text-[10px] font-semibold text-gray-500">Upcoming Exam</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-100">
                    <div className="text-xs font-semibold text-red-600">Mathematics Mid-Term</div>
                    <div className="text-[9px] text-red-400 mt-0.5">In 3 days • Start preparing</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Book Detail Modal */}
      <AnimatePresence>
        {selectedBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedBook(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0" style={{ background: `linear-gradient(135deg, ${selectedBook.cover_color || COLORS.primary}, ${selectedBook.cover_color || COLORS.primary}dd)` }}>
                    {selectedBook.cover_initials || (selectedBook.title || 'B').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900">{selectedBook.title || selectedBook.name}</h3>
                    <p className="text-sm text-gray-500">{selectedBook.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={selectedBook.available !== false ? 'success' : 'default'}>
                        {selectedBook.available !== false ? 'Available' : 'Issued'}
                      </Badge>
                      <span className="text-xs text-gray-400">{selectedBook.category || 'General'}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedBook(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'ISBN', value: selectedBook.isbn || '—' },
                  { label: 'Pages', value: selectedBook.pages || '—' },
                  { label: 'Type', value: selectedBook.type || 'Book' },
                  { label: 'Rating', value: selectedBook.rating ? `${selectedBook.rating}/5` : '—' },
                ].map((info, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-[9px] text-gray-500">{info.label}</div>
                    <div className="text-xs font-semibold text-gray-900 mt-0.5">{info.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-semibold shadow-[0_4px_14px_rgba(109,76,255,0.3)] hover:shadow-[0_6px_20px_rgba(109,76,255,0.4)] transition-all">
                  {selectedBook.available !== false ? 'Borrow Now' : 'Reserve Book'}
                </button>
                <button className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-all">
                  View Details
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
