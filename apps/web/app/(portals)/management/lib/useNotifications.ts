'use client';

import { useState, useEffect, useCallback } from 'react';
import { auth } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  read: boolean;
  created_at: string;
}

interface NotificationsState {
  notifications: Notification[];
  total: number;
  unread: number;
  loading: boolean;
}

export function useNotifications(options?: { pollInterval?: number }) {
  const pollInterval = options?.pollInterval || 30000;
  const [state, setState] = useState<NotificationsState>({
    notifications: [],
    total: 0,
    unread: 0,
    loading: true,
  });

  const token = typeof window !== 'undefined' ? auth.getToken() : null;

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    try {
      const [notifRes, unreadRes] = await Promise.all([
        fetch(`${API_BASE}/v2/notifications?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/v2/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (notifRes.ok) {
        const notifData = await notifRes.json();
        if (notifData.success && notifData.data) {
          setState(prev => ({
            ...prev,
            notifications: notifData.data.data || [],
            total: notifData.data.total || 0,
            unread: notifData.data.unread || 0,
            loading: false,
          }));
        }
      }
    } catch (e) {
      console.error('[Notifications] Fetch error:', e);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, pollInterval);
    return () => clearInterval(interval);
  }, [fetchNotifications, pollInterval]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/v2/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setState(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        notifications: prev.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ),
      }));
    } catch (e) {
      console.error('[Notifications] Mark read error:', e);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/v2/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setState(prev => ({
        ...prev,
        unread: 0,
        notifications: prev.notifications.map(n => ({ ...n, read: true })),
      }));
    } catch (e) {
      console.error('[Notifications] Mark all read error:', e);
    }
  };

  return { ...state, fetchNotifications, markAsRead, markAllAsRead, token };
}
