"use client";

import { useEffect, useState } from "react";
import { apiClient, ApiError } from "./api";

interface UseApiResult<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  reload: () => void;
}

interface ResultState<T> {
  data: T | null;
  error: ApiError | null;
  pending: boolean;
}

/** Small data hook for pages that call the monolith via the rewritten /api/v1 proxy. */
export function useApi<T>(path: string | null, options: { method?: "GET" | "POST"; body?: unknown } = {}): UseApiResult<T> {
  const [result, setResult] = useState<ResultState<T>>({ data: null, error: null, pending: !!path });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    void (async () => {
      try {
        const data = await apiClient<T>(path, options);
        if (cancelled) return;
        setResult({ data, error: null, pending: false });
      } catch (err) {
        if (cancelled) return;
        setResult({ data: null, error: err instanceof ApiError ? err : new ApiError(0, "Network error"), pending: false });
      }
    })();
    return () => {
      cancelled = true;
    };
    // reloads are triggered via `attempt`; `options` is intentionally read fresh each run
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, attempt]);

  return {
    data: result.data,
    error: result.error,
    loading: result.pending,
    reload: () => {
      setResult((prev) => ({ ...prev, pending: true }));
      setAttempt((a) => a + 1);
    },
  };
}