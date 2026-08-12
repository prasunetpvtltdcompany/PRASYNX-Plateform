"use client";

import type { Paginated, AssignmentDTO } from "@prasynx/types";
import { useAuth } from "@/lib/auth";
import { useApi } from "@/lib/use-api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { useI18n } from "@/lib/i18n";

export default function StudentAssignmentsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data, loading, error } = useApi<Paginated<AssignmentDTO>>(
    user ? `/api/v1/assignments/student?student_id=${user.id}&page=1&pageSize=50` : null,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("staffAssign.title")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("staffAssign.subtitle")}</p>
      </div>

      <PageState state={{ loading, error }} />

      {data ? (
        <Card>
          <CardHeader title={t("staffAssign.count").replace("{n}", String(data.total))} />
          <Table
            headers={[t("field.title"), t("field.subject"), t("field.due"), t("field.status")]}
            rows={data.data.map((a) => [
              a.title,
              a.subject_name ?? "—",
              a.due_date.slice(0, 10),
              <Badge key={a.id} tone={a.status === "closed" ? "indigo" : "amber"}>
                {a.status === "closed" ? t("home.closed") : t("home.active")}
              </Badge>,
            ])}
          />
        </Card>
      ) : null}
    </div>
  );
}