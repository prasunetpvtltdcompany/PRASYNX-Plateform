'use client';

import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'prasynx-dark-mode';

function getInitialMode(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === 'true';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState<boolean>(getInitialMode);

  const applyMode = useCallback((dark: boolean) => {
    const root = typeof document !== 'undefined' ? document.documentElement : null;
    if (root) root.classList.toggle('dark', dark);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(dark));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    applyMode(darkMode);
  }, [darkMode, applyMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  return { darkMode, toggleDarkMode, setDarkMode };
}