"use client";

import type { Paginated } from "@prasynx/types";
import type { ExamDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { useI18n } from "@/lib/i18n";

export default function ParentExamsPage() {
  const { data, loading, error } = useApi<Paginated<ExamDTO>>("/api/v1/exams?page=1&pageSize=50");
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("exams.title")}</h1>
      </div>

      <PageState state={{ loading, error }} />

      {data ? (
        <Card>
          <CardHeader title={`${t("exams.title")} (${data.total})`} />
          <Table
            headers={[t("field.name"), t("field.type"), t("field.maxMarks"), t("field.status"), t("field.starts")]}
            rows={data.data.map((e) => [
              e.name,
              t(`val.${e.exam_type}`, e.exam_type),
              String(e.max_marks),
              <Badge key={e.id} tone={e.status === "ongoing" ? "green" : e.status === "upcoming" ? "amber" : "slate"}>
                {t(`val.${e.status}`)}
              </Badge>,
              (e.start_date ?? "—").slice(0, 10),
            ])}
          />
        </Card>
      ) : null}
    </div>
  );
}