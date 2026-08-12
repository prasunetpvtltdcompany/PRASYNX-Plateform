'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { LanguageCode, translations, getNestedValue } from './translations';

type LanguageContextType = {
  lang: LanguageCode;
  setLang: (code: LanguageCode) => void;
  t: (key: string) => string;
  ui: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
  ui: (key: string) => key,
});

function getInitialLang(): LanguageCode {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem('preferredLang') as LanguageCode | null;
    if (saved && translations[saved]) return saved;
  } catch {}
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(getInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('preferredLang', lang); } catch {}
  }, [lang]);

  const setLang = useCallback((code: LanguageCode) => {
    setLangState(code);
  }, []);

  const t = useCallback((key: string): string => {
    const inLang = getNestedValue(translations[lang], key);
    if (inLang !== key) return inLang;
    return getNestedValue(translations.en, key);
  }, [lang]);

  const ui = useCallback((key: string): string => {
    const inLang = getNestedValue(translations[lang], 'ui.' + key);
    if (inLang !== 'ui.' + key) return inLang;
    return getNestedValue(translations.en, 'ui.' + key);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, ui }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
