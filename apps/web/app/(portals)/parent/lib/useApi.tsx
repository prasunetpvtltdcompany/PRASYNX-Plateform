'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  refetch: () => void;
}

export function useApi<T = any>(
  fetcher: () => Promise<{ success: boolean; data?: T; error?: string }>,
  deps: any[] = [],
  immediate = true
): ApiState<T> & { setData: (data: T | null) => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await fetcher();
      if (!mountedRef.current) return;
      if (result.success) {
        setData(result.data ?? null);
        setSuccess(true);
      } else {
        setError(result.error || 'Request failed');
        setData(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || 'Network error');
        setData(null);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    if (immediate) fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  return { data, loading, error, success, refetch: fetchData, setData };
}

export function useForm<T = Record<string, any>>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const reset = useCallback(() => {
    setValues(initial);
    setErrors({});
  }, [initial]);

  const validate = useCallback((rules: Record<string, (v: any) => string | null>): boolean => {
    const newErrors: Record<string, string> = {};
    let valid = true;
    for (const [field, rule] of Object.entries(rules)) {
      const err = rule(values[field as keyof T]);
      if (err) { newErrors[field] = err; valid = false; }
    }
    setErrors(newErrors);
    return valid;
  }, [values]);

  return { values, setValues, errors, setErrors, submitting, setSubmitting, handleChange, reset, validate };
}

export function LoadingSkeleton({ rows = 4, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-10 bg-gray-200 rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-red-600 mb-1">Failed to load data</p>
      <p className="text-xs text-gray-400 mb-4 max-w-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5A3EF0] transition-colors">
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message = 'No data available', action }: { message?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-500">{message}</p>
      {action && (
        <button onClick={action.onClick} className="mt-3 px-4 py-2 rounded-lg bg-[#6D4CFF] text-white text-xs font-semibold hover:bg-[#5A3EF0] transition-colors">
          {action.label}
        </button>
      )}
    </div>
  );
}
