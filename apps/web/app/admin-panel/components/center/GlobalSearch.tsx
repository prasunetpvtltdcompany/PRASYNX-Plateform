'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Building2, Users, UserCheck, GraduationCap, ArrowUpRight, ExternalLink,
  Clock, ChevronRight, Sparkles, Target, X, RefreshCw, Eye, Command, ShieldAlert,
  Database, Inbox,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { gccApi } from '../../lib/dataService-gcc';

const COLORS = { primary: '#6D4CFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6', accent: '#A855F7' };

const fmtNum = (n?: any) => Number(n || 0).toLocaleString();
const fmtAgo = (d?: string) => {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
};
const exportCSV = (rows: any[], filename: string) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const severityBadge = (s?: string) => {
  switch ((s || 'info').toLowerCase()) {
    case 'critical': return 'bg-red-100 text-red-700 border-red-200';
    case 'error': return 'bg-rose-50 text-rose-600 border-rose-200';
    case 'warning': return 'bg-amber-50 text-amber-600 border-amber-200';
    default: return 'bg-sky-50 text-sky-600 border-sky-200';
  }
};
const statusBadge = (s?: string) => {
  switch ((s || 'active').toLowerCase()) {
    case 'active': return <Badge variant="success" className="text-[9px]">Active</Badge>;
    case 'inactive': case 'blocked': case 'suspended': return <Badge variant="danger" className="text-[9px]">{s}</Badge>;
    case 'pending': return <Badge variant="warning" className="text-[9px]">Pending</Badge>;
    default: return <Badge className="text-[9px]">{s || '—'}</Badge>;
  }
};

function CountUp({ value }: { value: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!value) { setVal(0); return; }
    let raf: number;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / 700, 1);
      setVal(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{fmtNum(val)}</>;
}

const categories = [
  { key: 'all', label: 'All Results', icon: Target },
  { key: 'organizations', label: 'Organizations', icon: Building2 },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'activity', label: 'Activity', icon: ShieldAlert },
];

type SearchResult = {
  id: string; category: 'organizations' | 'users' | 'activity';
  type: string; status?: string; created?: string;
  name?: string; email?: string; org_id?: string; avatar?: string;
  role?: string; org?: string; organisation_id?: string;
  action?: string; entityType?: string; method?: string; resource?: string;
  ip?: string; severity?: string; user?: string; userEmail?: string;
};

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [counts, setCounts] = useState({ organizations: 0, users: 0, activity: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchMs, setSearchMs] = useState(0);
  const [searched, setSearched] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [detail, setDetail] = useState<SearchResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<any>(null);

  const loadOverview = useCallback(async () => {
    const res = await gccApi.overview();
    if (res.success) setOverview(res.data);
  }, []);

  useEffect(() => { loadOverview(); }, [loadOverview]);

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem('gcc-recent-searches') || '[]'));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA';
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); inputRef.current?.focus(); }
      if (e.key === '/' && !typing) { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const doSearch = useCallback(async (q: string, type: string, save = true) => {
    const term = q.trim();
    if (term.length < 2) { setResults([]); setSearched(false); setCounts({ organizations: 0, users: 0, activity: 0 }); return; }
    setLoading(true);
    setError('');
    const t0 = performance.now();
    const res = await gccApi.globalSearch(term, type, 25);
    if (res.success) {
      setResults(res.data?.results || []);
      setCounts(res.data?.counts || { organizations: 0, users: 0, activity: 0 });
      setSearchMs(Math.round(performance.now() - t0));
      setSearched(true);
      if (save) {
        setRecent(prev => {
          const next = [term, ...prev.filter(r => r.toLowerCase() !== term.toLowerCase())].slice(0, 6);
          try { localStorage.setItem('gcc-recent-searches', JSON.stringify(next)); } catch { /* ignore */ }
          return next;
        });
      }
    } else {
      setError(res.error || 'Search failed');
      setResults([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) { setResults([]); setSearched(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(term, activeCategory, false), 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, activeCategory, doSearch]);

  const switchCategory = (key: string) => {
    setActiveCategory(key);
    if (query.trim().length >= 2) doSearch(query.trim(), key, false);
  };

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([loadOverview(), query.trim().length >= 2 ? doSearch(query.trim(), activeCategory, false) : Promise.resolve()]);
    setRefreshing(false);
  };

  const totalUsers = (overview?.totalStudents || 0) + (overview?.totalStaff || 0) + (overview?.totalParents || 0);

  const filtered = results.filter(r => {
    if (statusFilter === 'all') return true;
    if (r.category === 'activity') return (r.severity || 'info') === statusFilter;
    return (r.status || 'active') === statusFilter;
  });
  const orgs = filtered.filter(r => r.category === 'organizations');
  const users = filtered.filter(r => r.category === 'users');
  const acts = filtered.filter(r => r.category === 'activity');

  const viewAllVisible = (cat: string) => activeCategory === 'all' || activeCategory === cat;

  const selectedDetail = detail ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDetail(null)}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#3A2A6B] to-[#6D4CFF] text-white">
          <h3 className="text-sm font-bold flex items-center gap-2">
            {detail.category === 'organizations' && <Building2 size={15} />}
            {detail.category === 'users' && <Users size={15} />}
            {detail.category === 'activity' && <ShieldAlert size={15} />}
            {detail.type} Details
          </h3>
          <button onClick={() => setDetail(null)} className="p-1 rounded-lg hover:bg-white/15"><X size={15} /></button>
        </div>
        <div className="p-5 space-y-3 text-xs">
          {detail.category === 'organizations' && (
            <>
              <Row label="Organization" value={detail.name} />
              <Row label="Org ID" value={detail.org_id} mono />
              <Row label="Email" value={detail.email} />
              <Row label="Status" value={detail.status} />
              <Row label="Created" value={new Date(detail.created || '').toLocaleString()} />
            </>
          )}
          {detail.category === 'users' && (
            <>
              <Row label="Name" value={detail.name} />
              <Row label="Email" value={detail.email} />
              <Row label="Role" value={detail.role} />
              <Row label="Organization" value={detail.org || 'Unassigned'} />
              <Row label="Status" value={detail.status} />
              <Row label="Created" value={new Date(detail.created || '').toLocaleString()} />
            </>
          )}
          {detail.category === 'activity' && (
            <>
              <Row label="Action" value={detail.action} />
              <Row label="Entity" value={`${detail.entityType}${detail.resource ? ` · ${detail.resource}` : ''}`} />
              <Row label="Method" value={detail.method || '—'} mono />
              <Row label="Actor" value={detail.user ? `${detail.user}${detail.userEmail ? ` (${detail.userEmail})` : ''}` : '—'} />
              <Row label="IP Address" value={detail.ip || '—'} mono />
              <Row label="Severity" value={detail.severity} />
              <Row label="HTTP Status" value={String(detail.status ?? '—')} />
              <Row label="Time" value={new Date(detail.created || '').toLocaleString()} />
            </>
          )}
        </div>
      </motion.div>
    </div>
  ) : null;

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl mb-6 border border-white/15 bg-gradient-to-br from-[#3A2A6B] via-[#4B3B9A] to-[#6D4CFF] shadow-[0_20px_60px_rgba(109,76,255,0.28)] min-h-[210px] md:min-h-[230px] flex items-center"
      >
        <motion.div className="absolute -top-32 -left-24 w-96 h-96 bg-[#7C3AED]/45 rounded-full blur-[120px] pointer-events-none"
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -bottom-32 -right-24 w-96 h-96 bg-[#3B82F6]/35 rounded-full blur-[130px] pointer-events-none"
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />

        <div className="relative z-10 w-full px-5 md:px-7 py-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" /></span>
                Live Index
              </Badge>
              <Badge className="bg-white/15 text-white border border-white/15 text-[10px] flex items-center gap-1">
                <Sparkles size={10} /> AI-Powered Search
              </Badge>
            </div>
            <button onClick={refresh} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 border border-white/20 text-white text-[10px] font-semibold hover:bg-white/25 transition-all active:scale-95">
              <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl xl:text-3xl font-extrabold text-white leading-tight tracking-tight mb-0.5">
                Global Search
              </h1>
              <p className="text-[11px] md:text-xs text-white/70 leading-snug max-w-2xl">
                Search organizations, users, and security activity across the entire platform.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 border border-white/15 text-[9px] text-white/70">
              <Command size={11} /> + K to search
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md max-w-2xl mt-4 focus-within:border-white/40 focus-within:shadow-lg transition-all">
            {loading ? (
              <RefreshCw size={18} className="text-white/70 animate-spin" />
            ) : (
              <Search size={18} className="text-white/70" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search organizations, users, emails, security events..."
              className="bg-transparent border-none outline-none text-sm text-white flex-1 placeholder-white/45"
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setSearched(false); }} className="p-1 rounded-lg hover:bg-white/15 text-white/70"><X size={13} /></button>
            )}
            <Badge className="bg-white/10 text-white border border-white/10 text-[9px] flex items-center gap-1">
              <Sparkles size={10} /> AI
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map(cat => {
          const Icon = cat.icon;
          const count = cat.key === 'all' ? results.length : counts[cat.key as keyof typeof counts] || 0;
          return (
            <button key={cat.key} onClick={() => switchCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat.key
                  ? 'bg-[#6D4CFF] text-white shadow-[0_4px_12px_rgba(109,76,255,0.3)]'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#6D4CFF] hover:text-[#6D4CFF]'
              }`}>
              <Icon size={14} />{cat.label}
              {count > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${activeCategory === cat.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 mb-6 bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-semibold">{error}</div>
      )}

      {!searched && query.trim().length < 2 ? (
        <div className="space-y-5">
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { icon: Building2, label: 'Organizations', value: overview?.totalOrganisations || 0, color: COLORS.primary },
              { icon: GraduationCap, label: 'Students', value: overview?.totalStudents || 0, color: COLORS.info },
              { icon: UserCheck, label: 'Staff', value: overview?.totalStaff || 0, color: COLORS.success },
              { icon: Users, label: 'Parents', value: overview?.totalParents || 0, color: COLORS.warning },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-4 flex items-center gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${item.color}15`, color: item.color }}><Icon size={20} /></div>
                    <div>
                      <div className="text-xl font-extrabold" style={{ color: item.color }}><CountUp value={item.value} /></div>
                      <div className="text-[10px] text-gray-400 font-semibold">{item.label}</div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Recent searches */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold flex items-center gap-2"><Clock size={14} className="text-[#6D4CFF]" /> Recent Searches</h3>
                {recent.length > 0 && (
                  <button onClick={() => { setRecent([]); localStorage.removeItem('gcc-recent-searches'); }} className="text-[#6D4CFF] text-[10px] font-semibold hover:underline">Clear</button>
                )}
              </div>
              {recent.length === 0 ? (
                <div className="text-center py-8">
                  <Search size={28} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-[11px] text-gray-400">No recent searches yet.<br />Try searching something above.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {recent.map((r, i) => (
                    <button key={i} onClick={() => { setQuery(r); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-all">
                      <Search size={12} className="text-gray-300" />
                      <span className="text-xs text-gray-600 flex-1 truncate">{r}</span>
                      <ArrowUpRight size={12} className="text-gray-300" />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick filters */}
            <Card className="p-5">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-3"><Target size={14} className="text-[#22C55E]" /> Quick Filters</h3>
              <div className="space-y-1.5">
                {categories.filter(c => c.key !== 'all').map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${activeCategory === cat.key ? 'bg-[#6D4CFF]/5 border-[#6D4CFF] text-[#6D4CFF]' : 'border-gray-100 hover:border-[#6D4CFF]/40 text-gray-600'}`}>
                      <span className="flex items-center gap-2 text-xs font-semibold"><Icon size={13} /> {cat.label}</span>
                      <ChevronRight size={13} className="text-gray-300" />
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-[#F3F0FF] to-white border border-[#6D4CFF]/15">
                <p className="text-[10px] text-gray-500 leading-relaxed"><Sparkles size={11} className="inline text-[#6D4CFF] -mt-0.5 mr-1" />Tip: Press <span className="font-mono text-[#6D4CFF]">/</span> or <span className="font-mono text-[#6D4CFF]">Ctrl+K</span> to jump to search instantly.</p>
              </div>
            </Card>

            {/* Search suggestions */}
            <Card className="p-5">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-3"><Sparkles size={14} className="text-[#A855F7]" /> Try Searching</h3>
              <div className="flex flex-wrap gap-1.5">
                {['Demo', 'Greenfield', 'admin', 'login', 'student', 'org', 'teacher', 'pending'].map(s => (
                  <button key={s} onClick={() => setQuery(s)}
                    className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-[10px] text-gray-500 hover:border-[#6D4CFF]/40 hover:text-[#6D4CFF] hover:bg-white transition-all">
                    {s}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <Database size={14} className="text-[#6D4CFF]" />
                <div>
                  <div className="text-[11px] font-semibold text-gray-700">Indexed Records</div>
                  <div className="text-[10px] text-gray-400">{fmtNum((overview?.totalStudents || 0) + (overview?.totalStaff || 0) + (overview?.totalParents || 0) + (overview?.totalOrganisations || 0))} live records searchable</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div>
          {/* Results Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs text-gray-500">
                Found <span className="font-semibold text-gray-900">{results.length}</span> results for "<span className="font-semibold text-gray-900">{query}</span>"
              </p>
              {searchMs > 0 && <p className="text-[10px] text-gray-400 mt-0.5">Completed in {searchMs}ms · live query</p>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold outline-none border border-gray-200 hover:bg-gray-200 transition-all">
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="info">Severity: Info</option>
                <option value="warning">Severity: Warning</option>
                <option value="error">Severity: Error</option>
                <option value="critical">Severity: Critical</option>
              </select>
              <button onClick={() => exportCSV(filtered.map(r => {
                if (r.category === 'organizations') return { Type: 'Organization', Name: r.name, 'Org ID': r.org_id, Email: r.email, Status: r.status };
                if (r.category === 'users') return { Type: 'User', Name: r.name, Email: r.email, Role: r.role, Organization: r.org, Status: r.status };
                return { Type: 'Activity', Action: r.action, Entity: r.entityType, Severity: r.severity, IP: r.ip, Actor: r.user, Time: new Date(r.created || '').toLocaleString() };
              }), `global-search-${new Date().toISOString().slice(0, 10)}.csv`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold hover:bg-gray-200 transition-all">
                <ExternalLink size={12} /> Export
              </button>
            </div>
          </div>

          {loading ? (
            <Card className="p-14 text-center">
              <RefreshCw size={34} className="mx-auto text-[#6D4CFF] animate-spin mb-3" />
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Searching platform...</h3>
              <p className="text-xs text-gray-400">Scanning organizations, users, and security activity</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Organizations */}
              {orgs.length > 0 && viewAllVisible('organizations') && (
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold flex items-center gap-2"><Building2 size={14} className="text-[#6D4CFF]" /> Organizations <span className="text-[10px] font-semibold text-gray-400">({orgs.length})</span></h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead><tr><th>Name</th><th>Org ID</th><th>Email</th><th>Status</th><th>Created</th><th className="text-right">Actions</th></tr></thead>
                      <tbody>
                        {orgs.map(org => (
                          <tr key={org.id}>
                            <td>
                              <div className="flex items-center gap-2">
                                <Avatar className="w-7 h-7" fallback={org.avatar || 'O'} />
                                <span className="text-xs font-semibold">{org.name}</span>
                              </div>
                            </td>
                            <td><span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 rounded">{org.org_id}</span></td>
                            <td className="text-xs text-gray-600">{org.email || '—'}</td>
                            <td>{statusBadge(org.status)}</td>
                            <td className="text-xs text-gray-500">{fmtAgo(org.created)}</td>
                            <td className="text-right">
                              <button onClick={() => setDetail(org)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Eye size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Users */}
              {users.length > 0 && viewAllVisible('users') && (
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold flex items-center gap-2"><Users size={14} className="text-[#22C55E]" /> Users <span className="text-[10px] font-semibold text-gray-400">({users.length})</span></h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Organization</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id}>
                            <td>
                              <div className="flex items-center gap-2">
                                <Avatar className="w-7 h-7" fallback={user.avatar || 'U'} />
                                <span className="text-xs font-semibold">{user.name}</span>
                              </div>
                            </td>
                            <td className="text-xs text-gray-600">{user.email || '—'}</td>
                            <td><span className="text-[10px] px-2 py-0.5 rounded-md bg-[#6D4CFF]/10 text-[#6D4CFF] font-semibold">{user.role}</span></td>
                            <td className="text-xs text-gray-600">{user.org || 'Unassigned'}</td>
                            <td>{statusBadge(user.status)}</td>
                            <td className="text-right">
                              <button onClick={() => setDetail(user)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Eye size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Activity */}
              {acts.length > 0 && viewAllVisible('activity') && (
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold flex items-center gap-2"><ShieldAlert size={14} className="text-[#F59E0B]" /> Security Activity <span className="text-[10px] font-semibold text-gray-400">({acts.length})</span></h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead><tr><th>Action</th><th>Entity</th><th>Severity</th><th>Actor</th><th>IP</th><th>Time</th><th className="text-right">Actions</th></tr></thead>
                      <tbody>
                        {acts.map(act => (
                          <tr key={act.id}>
                            <td className="text-xs font-semibold">{act.action}
                              {act.method && <span className="ml-1.5 text-[9px] font-mono text-gray-400">{act.method}</span>}
                            </td>
                            <td className="text-xs text-gray-600">{act.entityType}{act.resource ? ` · ${act.resource}` : ''}</td>
                            <td><Badge className={`text-[9px] ${severityBadge(act.severity)}`}>{act.severity}</Badge></td>
                            <td className="text-xs text-gray-600">{act.user || 'System'}</td>
                            <td className="text-[10px] font-mono text-gray-400">{act.ip || '—'}</td>
                            <td className="text-xs text-gray-500">{fmtAgo(act.created)}</td>
                            <td className="text-right">
                              <button onClick={() => setDetail(act)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6D4CFF]"><Eye size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {filtered.length === 0 && !loading && (
                <Card className="p-12 text-center">
                  <Inbox size={40} className="mx-auto text-gray-200 mb-3" />
                  <h3 className="text-sm font-semibold text-gray-500 mb-1">No results found</h3>
                  <p className="text-xs text-gray-400 mb-4">Try adjusting your search query or filters</p>
                  <button onClick={() => { setStatusFilter('all'); setQuery(''); }} className="px-4 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:shadow-lg transition-all">Reset Search</button>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>{detail && selectedDetail}</AnimatePresence>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-50 pb-2">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 shrink-0">{label}</span>
      <span className={`text-xs text-gray-700 text-right break-words ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
    </div>
  );
}
