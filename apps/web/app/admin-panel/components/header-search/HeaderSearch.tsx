'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, Building2, GraduationCap, Users, Heart, Loader2,
  AlertCircle, X,
} from 'lucide-react';
import { gccApi } from '../../lib/dataService-gcc';

interface SearchResult {
  id: string;
  name: string;
  email: string | null;
  type: string;
  status: string;
}

const TYPE_META: Record<string, { icon: any; color: string; bg: string }> = {
  Organization: { icon: Building2, color: '#6D4CFF', bg: '#F3F0FF' },
  Student: { icon: GraduationCap, color: '#22C55E', bg: '#F0FDF4' },
  Staff: { icon: Users, color: '#3B82F6', bg: '#EFF6FF' },
  Parent: { icon: Heart, color: '#F59E0B', bg: '#FFFBEB' },
};
const DEFAULT_META = { icon: Search, color: '#64748B', bg: '#F1F5F9' };

export default function HeaderSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    setOpen(true);
    try {
      const res = await gccApi.globalSearch(query.trim());
      setResults(res.data?.results || []);
    } catch {
      setResults([]);
      setError('Search failed. Try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(q), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, runSearch]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const hasQuery = q.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative hidden lg:block">
      <div className="search-bar">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search organizations, users, credentials..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q ? (
          <button
            onClick={() => { setQ(''); setOpen(false); }}
            className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        ) : (
          <span className="search-badge"><Sparkles size={10} /> AI</span>
        )}
      </div>

      <AnimatePresence>
        {open && hasQuery && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 max-h-[420px] w-[380px] overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <Sparkles size={12} className="text-[#6D4CFF]" /> Results for &quot;{q}&quot;
              </h3>
              {loading && <Loader2 size={13} className="animate-spin text-[#6D4CFF]" />}
            </div>

            <div className="p-1.5">
              {loading && results.length === 0 && (
                <div className="flex items-center gap-3 px-3 py-3 text-xs text-gray-400">
                  <Loader2 size={14} className="animate-spin text-[#6D4CFF]" /> Searching…
                </div>
              )}

              {!loading && error && (
                <div className="flex items-center gap-2 px-3 py-3 text-xs text-red-500">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              {!loading && !error && results.length === 0 && (
                <div className="px-3 py-4 text-center">
                  <Search size={22} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-xs font-semibold text-gray-500">No results found</p>
                  <p className="mt-0.5 text-[10px] text-gray-400">Try a different keyword (min 2 characters)</p>
                </div>
              )}

              {results.map((r, i) => {
                const meta = TYPE_META[r.type] || DEFAULT_META;
                const Icon = meta.icon;
                return (
                  <button
                    key={`${r.type}-${r.id}-${i}`}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      <Icon size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-semibold text-gray-800">{r.name}</div>
                      {r.email && <div className="truncate text-[10px] text-gray-400">{r.email}</div>}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: meta.color }}>
                        {r.type}
                      </span>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${
                          r.status === 'active' || r.status === 'verified'
                            ? 'bg-green-50 text-green-600'
                            : r.status === 'pending'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {r.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}