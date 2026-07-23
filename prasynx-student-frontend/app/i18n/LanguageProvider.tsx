'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { LanguageCode, translations, getNestedValue } from './translations';

type LanguageContextType = {
  lang: LanguageCode;
  setLang: (code: LanguageCode) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>('en');

  const setLang = useCallback((code: LanguageCode) => {
    setLangState(code);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = code;
      localStorage.setItem('preferredLang', code);
    }
  }, []);

  const t = useCallback((key: string): string => {
    const translation = translations[lang];
    return getNestedValue(translation, key);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
