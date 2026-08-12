"use client";

import type { Paginated } from "@prasynx/types";
import type { AssignmentDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { useI18n } from "@/lib/i18n";

const STATUS_KEYS = ["active", "completed", "draft"];

export default function ManagementAssignmentsPage() {
  const { t } = useI18n();
  const { data, loading, error } = useApi<Paginated<AssignmentDTO>>("/api/v1/assignments?page=1&pageSize=50");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("staffAssign.title")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("assignments.subtitle")}</p>
      </div>

      <PageState state={{ loading, error }} />

      {data ? (
        <Card>
          <CardHeader title={t("staffAssign.count").replace("{n}", String(data.total))} />
          <Table
            headers={[t("staffAssign.col.title"), t("staffAssign.col.subject"), t("staffAssign.col.due"), t("field.maxMarks"), t("staffAssign.col.status")]}
            rows={data.data.map((a) => [
              a.title,
              a.subject_name ?? "—",
              a.due_date.slice(0, 10),
              String(a.max_score),
              <Badge key={a.id} tone={a.status === "active" ? "green" : "slate"}>
                {STATUS_KEYS.includes(a.status) ? t(`val.${a.status}`) : a.status}
              </Badge>,
            ])}
          />
        </Card>
      ) : null}
    </div>
  );
}