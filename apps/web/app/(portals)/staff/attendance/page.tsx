"use client";

import type { Paginated } from "@prasynx/types";
import type { AttendanceReport, UserDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { Card, CardHeader } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export default function TeacherAttendancePage() {
  const { user } = useAuth();
  const students = useApi<Paginated<UserDTO>>("/api/v1/users?page=1&pageSize=200");
  const myUserId = user?.id ?? "";
  const report = useApi<AttendanceReport>(myUserId ? `/api/v1/attendance?student_id=${myUserId}` : null);
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("staffAtt.title")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("staffAtt.subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title={t("staffAtt.students")} subtitle={t("staffAtt.selectClass")} />
          <div className="max-h-96 overflow-auto rounded-lg border border-slate-100">
            {students.data?.data.map((s) => (
              <div key={s.id} className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-sm">
                <span className="font-medium text-slate-800">{s.full_name}</span>
                <span className="text-slate-500">{s.role}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title={t("staff.attendanceTotal")} subtitle={t("staff.attendanceOwn")} />
          <PageState state={{ loading: report.loading, error: report.error }} />
          {report.data ? (
            <Table
              headers={[t("field.date"), t("field.status"), t("field.notes")]}
              rows={report.data.records.slice(0, 20).map((r) => [r.date, t(`val.${r.status}`), r.notes ?? "—"])}
            />
          ) : null}
        </Card>
      </div>
    </div>
  );
}