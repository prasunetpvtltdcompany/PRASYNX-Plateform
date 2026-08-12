'use client';

import { BrainCircuit, RefreshCw } from 'lucide-react';
import { useLanguage } from '../language/LanguageProvider';

export function ModuleHeader({ icon: Icon, gradient, title, subtitle, onRefresh }: {
  icon: any;
  gradient: string;
  title: string;
  subtitle: string;
  onRefresh?: () => void;
}) {
  const { ui } = useLanguage();
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center text-white flex-shrink-0`}><Icon size={20} /></div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-gray-900 leading-tight truncate">{title}</h1>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
        </div>
      </div>
      {onRefresh && (
        <button onClick={onRefresh} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 flex-shrink-0">
          <RefreshCw size={13} /> {ui('refresh')}
        </button>
      )}
    </div>
  );
}

export function AiIntelligenceHero({ label, title, description, stats, score, icon: Icon = BrainCircuit, accent = '#22D3EE' }: {
  label: string;
  title: string;
  description: string;
  stats: { label: string; value: any }[];
  score?: number;
  icon?: any;
  accent?: string;
}) {
  const scoreVal = Math.max(0, Math.min(100, Number(score) || 0));
  const scoreColor = scoreVal >= 80 ? '#22C55E' : scoreVal >= 55 ? '#F59E0B' : '#EF4444';

  return (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-[#0B1120] via-[#111C33] to-[#1A1040] border border-white/10 text-white relative overflow-hidden anim-fade-up delay-2">
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#6D4CFF]/25 blur-3xl anim-float" />
      <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-[#06B6D4]/15 blur-3xl anim-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-[#22D3EE]/10 blur-2xl anim-pulse-glow" />
      <div className="relative flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon size={16} className="anim-pulse-glow" style={{ color: accent }} />
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: accent }}>{label}</span>
          </div>
          <h3 className="text-xl font-bold leading-tight">{title}</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-md">{description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {stats.map((s, i) => (
              <div key={i} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-sm font-bold text-white">{s.value ?? '—'}</div>
                <div className="text-[8px] text-slate-400 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        {score !== undefined && (
          <div className="flex flex-col items-center shrink-0 relative">
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-white/10 anim-ping-slow" />
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(scoreVal / 100) * 264} 264`} style={{ filter: `drop-shadow(0 0 6px ${scoreColor})`, transition: 'stroke-dasharray 1s ease' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: scoreColor }}>{scoreVal}</span>
                <span className="text-[8px] text-slate-400 uppercase tracking-widest">AI Score</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
