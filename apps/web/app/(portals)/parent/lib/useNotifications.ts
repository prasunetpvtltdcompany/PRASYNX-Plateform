'use client';

import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  read: boolean;
  created_at: string;
}

export function useNotifications(options?: { pollInterval?: number }) {
  const pollInterval = options?.pollInterval || 30000;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? (() => {
    try {
      const raw = localStorage.getItem('parentSession');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.token || null;
    } catch {
      return null;
    }
  })() : null;

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
          setNotifications(notifData.data.data || []);
          setUnread(notifData.data.unread || 0);
          setLoading(false);
        }
      }
      if (unreadRes.ok) {
        const unreadData = await unreadRes.json();
        if (unreadData.success) setUnread(unreadData.data?.count || 0);
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
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch (e) { console.error(e); }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/v2/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch (e) { console.error(e); }
  };

  return { notifications, unread, loading, fetchNotifications, markAsRead, markAllAsRead };
}
