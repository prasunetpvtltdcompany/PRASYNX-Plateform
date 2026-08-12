"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications, type NotificationItem } from "@/lib/use-notifications";
import { useI18n } from "@/lib/i18n";

const typeDot: Record<string, string> = {
  danger: "bg-rose-500",
  warning: "bg-amber-500",
  success: "bg-emerald-500",
  info: "bg-indigo-500",
};

function timeAgo(date: string | null | undefined, t: (k: string, f?: string) => string): string {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("common.justNow");
  if (mins < 60) return `${mins}${t("common.minAgo")}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}${t("common.hrAgo")}`;
  return `${Math.floor(hours / 24)}${t("common.dayAgo")}`;
}

export function NotificationBell() {
  const { notifications, unread, loading, markAsRead, markAllAsRead } = useNotifications();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        aria-label={t("common.notifications")}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 flex max-h-[500px] w-96 flex-col rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t("common.notifications")}</h3>
            {unread > 0 ? (
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                className="text-xs font-medium text-indigo-600 hover:underline"
              >
                {t("common.markAllRead")}
              </button>
            ) : null}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-slate-400">
                <Bell className="h-8 w-8" />
                <span>{t("common.noNotifications")}</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {notifications.map((n) => <NotificationRow key={n.id} item={n} onSelect={() => void markAsRead(n.id)} time={timeAgo(n.created_at, t)} />)}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NotificationRow({ item, onSelect, time }: { item: NotificationItem; onSelect: () => void; time: string }) {
  const dot = typeDot[item.type ?? "info"] ?? typeDot.info;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${item.read ? "" : "bg-indigo-50/50 dark:bg-indigo-950/40"}`}
    >
      <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${dot}`} />
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm ${item.read ? "font-medium" : "font-semibold"} text-slate-900 dark:text-slate-100`}>{item.title}</span>
        {item.message ? <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500 dark:text-slate-400">{item.message}</span> : null}
        {time ? <span className="mt-1.5 block text-[10px] text-slate-400 dark:text-slate-500">{time}</span> : null}
      </span>
    </button>
  );
}