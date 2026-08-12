"use client";

import type { Paginated } from "@prasynx/types";
import type { AssignmentDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { useI18n } from "@/lib/i18n";

export default function TeacherAssignmentsPage() {
  const { data, loading, error } = useApi<Paginated<AssignmentDTO>>("/api/v1/assignments?page=1&pageSize=100");
  const { t } = useI18n();

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
            headers={[t("field.title"), t("field.subject"), t("field.class"), t("field.due"), t("staffAssign.col.submissions"), t("field.status")]}
            rows={data.data.map((a) => [
              a.title,
              a.subject_name ?? "—",
              a.class_id.slice(0, 8),
              a.due_date.slice(0, 10),
              String(a.submissions_count ?? 0),
              <Badge key={a.id} tone={a.status === "active" ? "green" : "slate"}>
                {t(`val.${a.status}`)}
              </Badge>,
            ])}
          />
        </Card>
      ) : null}
    </div>
  );
}