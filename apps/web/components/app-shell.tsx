"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { homeForRole } from "@/lib/route-groups";
import { cn } from "@/lib/cn";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { NotificationBell } from "@/components/notification-bell";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  match: string | string[];
}

export function AppShell({ nav, children }: { nav: NavItem[]; children: React.ReactNode }) {
  return (
    <I18nProvider>
      <Shell nav={nav}>{children}</Shell>
    </I18nProvider>
  );
}

function Shell({ nav, children }: { nav: NavItem[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useI18n();

  const isActive = (item: NavItem) => {
    const matches = Array.isArray(item.match) ? item.match : [item.match];
    return matches.some((m) => pathname.startsWith(m));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
          <Link href={user ? homeForRole(user.role) : "/"} className="text-lg font-bold text-indigo-600">
            PRASYNX
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
                isActive(item) && "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(`nav.${item.href}`, item.label)}
            </Link>
          ))}
          <button
            onClick={() => void logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
          >
            <LogOut className="h-4 w-4" />
            {t("common.signOut")}
          </button>
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="lg:hidden">
            <span className="text-lg font-bold text-indigo-600">PRASYNX</span>
          </div>
          <div className="hidden text-sm text-slate-500 lg:block dark:text-slate-400">
            {user ? `${t("common.signedInAs")} ${user.full_name}` : ""}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <NotificationBell />
            <button
              onClick={() => void logout()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 lg:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              {t("common.signOut")}
            </button>
          </div>
        </header>
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}