"use client";

import type { AttendanceReport } from "@prasynx/types";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/use-api";
import { Card, CardHeader } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { useI18n } from "@/lib/i18n";

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const { data, loading, error } = useApi<AttendanceReport>(user ? `/api/v1/attendance?student_id=${user.id}` : null);
  const { t } = useI18n();

  const summaryLabels: Record<string, string> = {
    total: t("attendance.total"),
    present: t("attendance.presentCol"),
    absent: t("attendance.absentCol"),
    late: t("attendance.lateCol"),
    excused: t("attendance.excusedCol"),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("attendance.title")}</h1>
      </div>

      <PageState state={{ loading, error }} />

      {data ? (
        <Card>
          <CardHeader title={t("attendance.summary")} subtitle={t("home.percentAttendance").replace("{pct}", String(data.summary.percentage))} />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {(["total", "present", "absent", "late", "excused"] as const).map((key) => (
              <div key={key} className="rounded-lg bg-slate-50 p-4 text-center">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{data.summary[key]}</div>
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{summaryLabels[key]}</div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Table
              headers={[t("field.date"), t("field.status"), t("field.notes")]}
              rows={data.records.map((r) => [r.date, t(`val.${r.status}`), r.notes ?? "—"])}
            />
          </div>
        </Card>
      ) : null}
    </div>
  );
}