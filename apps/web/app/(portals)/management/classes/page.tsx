"use client";

import type { Paginated } from "@prasynx/types";
import type { ClassDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { Card, CardHeader } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { useI18n } from "@/lib/i18n";

export default function ManagementClassesPage() {
  const { t } = useI18n();
  const { data, loading, error } = useApi<Paginated<ClassDTO>>("/api/v1/classes?page=1&pageSize=50");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("classes.title")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("classes.subtitle")}</p>
      </div>

      <PageState state={{ loading, error }} />

      {data ? (
        <Card>
          <CardHeader title={t("classes.count").replace("{n}", String(data.total))} />
          <Table
            headers={[t("classes.col.name"), t("classes.col.organisation"), t("classes.col.created")]}
            rows={data.data.map((c) => [c.name, c.organisation_id.slice(0, 8), (c.created_at ?? "").slice(0, 10)])}
          />
        </Card>
      ) : null}
    </div>
  );
}