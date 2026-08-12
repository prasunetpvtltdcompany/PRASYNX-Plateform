"use client";

import type { AttendanceReport } from "@prasynx/types";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/use-api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { useI18n } from "@/lib/i18n";

export default function ParentDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data, loading, error } = useApi<AttendanceReport>(user ? `/api/v1/attendance?student_id=${user.id}` : null);

  const records = data?.records ?? [];
  const absent = records.filter((r) => r.status === "absent").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{t("home.parent.title")}</h1>
        <p className="text-sm text-slate-500">{t("home.parent.welcome").replace("{name}", user?.full_name ?? "")}</p>
      </div>

      <PageState state={{ loading, error }} />

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <div className="text-sm font-medium text-slate-500">{t("home.totalDays")}</div>
              <div className="mt-1 text-3xl font-extrabold text-slate-900">{records.length}</div>
              <div className="mt-1 text-xs text-slate-400">—</div>
            </Card>
            <Card className="p-5">
              <div className="text-sm font-medium text-slate-500">{t("home.absentDays")}</div>
              <div className="mt-1 text-3xl font-extrabold text-slate-900">{absent}</div>
              <div className="mt-1 text-xs text-slate-400">—</div>
            </Card>
          </div>

          <Card>
            <CardHeader title={t("home.recentAttendance")} subtitle={t("home.linkedStudents")} />
            <Table
              headers={[t("home.dateColumn"), t("home.status"), t("home.notesColumn")]}
              rows={records.slice(0, 10).map((r) => [
                r.date,
                <Badge key={`${r.date}-s`} tone={r.status === "present" ? "green" : r.status === "absent" ? "rose" : "amber"}>
                  {r.status === "present" ? t("home.present") : r.status === "absent" ? t("home.absent") : r.status === "late" ? t("home.late") : t("home.excused")}
                </Badge>,
                r.notes ?? "—",
              ])}
            />
          </Card>
        </>
      ) : null}
    </div>
  );
}