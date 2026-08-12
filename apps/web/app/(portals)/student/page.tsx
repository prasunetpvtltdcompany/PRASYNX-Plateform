"use client";

import type { Paginated, AssignmentDTO, AttendanceReport } from "@prasynx/types";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/use-api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { useI18n } from "@/lib/i18n";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const assignments = useApi<Paginated<AssignmentDTO>>(
    user ? `/api/v1/assignments/student?student_id=${user.id}&page=1&pageSize=10` : null,
  );
  const attendance = useApi<AttendanceReport>(user ? `/api/v1/attendance?student_id=${user.id}` : null);

  const records = attendance.data?.records ?? [];
  const present = records.filter((r) => r.status === "present").length;
  const presentPct = records.length ? Math.round((present / records.length) * 100) : 0;
  const error = assignments.error ?? attendance.error;
  const loading = assignments.loading || attendance.loading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{t("home.student.title")}</h1>
        <p className="text-sm text-slate-500">{t("home.student.welcome").replace("{name}", user?.full_name ?? "")}</p>
      </div>

      <PageState state={{ loading, error }} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="text-sm font-medium text-slate-500">{t("home.recentAttendance")}</div>
          <div className="mt-1 text-3xl font-extrabold text-slate-900">{records.length ? `${presentPct}%` : "—"}</div>
          <div className="mt-1 text-xs text-slate-400">{t("home.presentDays").replace("{n}", String(present)).replace("{total}", String(records.length))}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-medium text-slate-500">{t("home.myAssignments")}</div>
          <div className="mt-1 text-3xl font-extrabold text-slate-900">{assignments.data?.total ?? 0}</div>
          <div className="mt-1 text-xs text-slate-400">{t("home.assignedToYou")}</div>
        </Card>
      </div>

      {assignments.data && assignments.data.data.length ? (
        <Card>
          <CardHeader title={t("home.myAssignments")} />
          <Table
            headers={[t("home.title"), t("home.subjectColumn"), t("home.dueColumn"), t("home.status")]}
            rows={assignments.data.data.map((a) => [
              a.title,
              a.subject_name ?? "—",
              a.due_date.slice(0, 10),
              <Badge key={`${a.id}-s`} tone={a.status === "closed" ? "indigo" : "amber"}>{a.status === "closed" ? t("home.closed") : t("home.active")}</Badge>,
            ])}
          />
        </Card>
      ) : null}
    </div>
  );
}