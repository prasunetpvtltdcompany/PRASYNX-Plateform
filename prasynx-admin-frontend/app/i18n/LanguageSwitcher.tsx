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
    <div ref={ref} className="lang-switcher">
      <button
        onClick={() => setOpen(!open)}
        className="lang-switcher-btn"
      >
        <span className="lang-flag">{getFlag(lang)}</span>
        <span>{current.native}</span>
        <svg className={`lang-chevron ${open ? 'open' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="12" height="12">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="lang-dropdown">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`lang-dropdown-item ${lang === l.code ? 'active' : ''}`}
            >
              <span className="lang-flag">{getFlag(l.code)}</span>
              <span>{l.native}</span>
              {lang === l.code && (
                <svg className="lang-check" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="12" height="12">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
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
    case 'ta': return '🇮🇳';
    case 'te': return '🇮🇳';
    case 'bn': return '🇮🇳';
    case 'mr': return '🇮🇳';
    case 'gu': return '🇮🇳';
    case 'sp': return '🇪🇸';
  }
}
