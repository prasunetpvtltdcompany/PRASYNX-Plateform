'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';
import { LANGUAGES, LanguageCode } from './translations';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="text-base">{getFlag(lang)}</span>
        <span className="hidden sm:inline">{current.native}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-gray-200 z-50 py-2 max-h-72 overflow-y-auto">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                lang === l.code ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{getFlag(l.code)}</span>
              <span>{l.native}</span>
              <span className="text-gray-400 ml-auto text-xs">{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getFlag(code: LanguageCode): string {
  switch (code) {
    case 'en': return '🇬🇧';
    case 'hi': return '🇮🇳';
    default: return '🌐';
  }
}
