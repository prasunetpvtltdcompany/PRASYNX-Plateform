'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications } from './useNotifications';

export function NotificationBell() {
  const { notifications, unread, loading, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-500';
      case 'danger': return 'bg-red-500';
      case 'success': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="header-btn relative"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-sm">Notifications</h3>
            {unread > 0 && (
              <button onClick={markAllAsRead} className="text-[10px] text-[#6D4CFF] font-semibold hover:underline">Mark all read</button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-[#6D4CFF] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">No notifications</div>
            ) : notifications.map((n: any) => (
              <div key={n.id} className={`p-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? 'bg-[#F3F0FF]/30' : ''}`}
                onClick={() => markAsRead(n.id)}>
                <div className="flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    n.type === 'danger' ? 'bg-red-500' : n.type === 'warning' ? 'bg-amber-500' : n.type === 'success' ? 'bg-green-500' : 'bg-[#6D4CFF]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs ${!n.read ? 'font-semibold' : 'font-medium'}`}>{n.title || 'Notification'}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{n.message || ''}</div>
                    <div className="text-[10px] text-gray-300 mt-1">{getTimeAgo(n.created_at)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
