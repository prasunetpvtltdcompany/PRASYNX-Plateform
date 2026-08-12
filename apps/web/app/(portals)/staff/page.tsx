"use client";

import type { UserDTO } from "@prasynx/types";
import Link from "next/link";
import { ClipboardCheck, FileSpreadsheet, CalendarRange, NotebookPen } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/use-api";
import { roleLabel } from "@/lib/route-groups";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { PageState } from "@/components/ui/page-state";
import { useI18n } from "@/lib/i18n";

const QUICK_LINKS = [
  { href: "/staff/attendance", icon: ClipboardCheck, label: "nav./staff/attendance", desc: "Mark and review daily attendance." },
  { href: "/staff/exams", icon: FileSpreadsheet, label: "nav./staff/exams", desc: "Examination schedules and results." },
  { href: "/staff/timetable", icon: CalendarRange, label: "nav./staff/timetable", desc: "Your weekly teaching timetable." },
  { href: "/staff/assignments", icon: NotebookPen, label: "nav./staff/assignments", desc: "Assignments you have set." },
];

export default function StaffDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data, loading, error } = useApi<UserDTO>("/api/v1/users/me");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{t("home.staff.title")}</h1>
        <p className="text-sm text-slate-500">{t("home.staff.welcome").replace("{name}", user?.full_name ?? "")}</p>
      </div>

      <PageState state={{ loading, error }} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_LINKS.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <q.icon className="h-6 w-6 text-indigo-600" />
            <div className="mt-3 text-sm font-semibold text-slate-900">{t(q.label)}</div>
            <div className="mt-0.5 text-xs text-slate-400">{t(q.desc, q.desc)}</div>
          </Link>
        ))}
      </div>

      {data ? (
        <Card>
          <CardHeader title={t("home.myProfile")} />
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("home.fullName")}</dt>
              <dd className="text-sm font-medium text-slate-900">{data.full_name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("home.email")}</dt>
              <dd className="text-sm font-medium text-slate-900">{data.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("home.role")}</dt>
              <dd>
                <Badge tone="indigo">{roleLabel(data.role, t)}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("home.status")}</dt>
              <dd>
                <Badge tone={data.status === "active" ? "green" : "amber"}>{data.status}</Badge>
              </dd>
            </div>
          </dl>
        </Card>
      ) : null}
    </div>
  );
}