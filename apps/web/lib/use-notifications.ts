"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "./api";
import { loadSession } from "./session";

export interface NotificationItem {
  id: string;
  title: string;
  message: string | null;
  type: string | null;
  read: boolean | null;
  created_at?: string | null;
}

interface NotificationsState {
  notifications: NotificationItem[];
  unread: number;
  loading: boolean;
}

/**
 * Common notification feed for every portal.
 *
 * Uses three mechanisms so updates feel instant:
 *  1. Server-Sent Events (SSE) push from /api/v1/notifications/stream.
 *  2. Polling fallback (default 30s) in case SSE is unavailable/expired.
 *  3. Refetch when the tab regains focus.
 */
export function useNotifications(pollInterval = 30000) {
  const [state, setState] = useState<NotificationsState>({ notifications: [], unread: 0, loading: true });

  const fetchNotifications = useCallback(async () => {
    try {
      const [list, unreadResult] = await Promise.all([
        apiClient<{ notifications: NotificationItem[] }>("/api/v1/notifications"),
        apiClient<{ unread: number }>("/api/v1/notifications/unread-count"),
      ]);
      setState({
        notifications: list.notifications ?? [],
        unread: unreadResult.unread ?? 0,
        loading: false,
      });
    } catch {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async poll after await
    void fetchNotifications();
    const interval = setInterval(() => void fetchNotifications(), pollInterval);

    const onFocus = () => void fetchNotifications();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchNotifications, pollInterval]);

  useEffect(() => {
    const token = loadSession()?.accessToken;
    if (typeof window === "undefined" || !token || typeof EventSource === "undefined") return;
    const source = new EventSource(`/api/v1/notifications/stream?token=${encodeURIComponent(token)}`);
    source.addEventListener("change", () => void fetchNotifications());
    source.onerror = () => source.close();
    return () => source.close();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiClient(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
      setState((prev) => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));
    } catch {
      // best-effort: drop silently
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient("/api/v1/notifications/read-all", { method: "PATCH" });
      setState((prev) => ({
        ...prev,
        unread: 0,
        notifications: prev.notifications.map((n) => ({ ...n, read: true })),
      }));
    } catch {
      // best-effort
    }
  }, []);

  return { ...state, reload: fetchNotifications, markAsRead, markAllAsRead };
}