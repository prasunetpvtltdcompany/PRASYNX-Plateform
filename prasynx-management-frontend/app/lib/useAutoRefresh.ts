'use client';

import { useEffect, useRef } from 'react';

export function useAutoRefresh(callback: () => void | Promise<void>, intervalMs: number = 30000) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (intervalMs <= 0) return;

    const tick = () => {
      savedCallback.current();
    };

    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
