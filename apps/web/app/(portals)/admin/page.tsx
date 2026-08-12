"use client";

import type { OrganisationDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { Card, CardHeader } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export default function PlatformDashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const organisations = useApi<{ organisations: OrganisationDTO[] }>("/api/v1/organisations");
  const { data, loading, error } = organisations;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("admin.dashboard.title", "Platform dashboard")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("admin.dashboard.welcome", "Welcome, {name}.").replace("{name}", user?.full_name ?? "")}
        </p>
      </div>

      <PageState state={{ loading, error }} />

      {data ? (
        <Card>
          <CardHeader title={t("admin.organisations", "Organisations")} subtitle={t("admin.schoolsCount", "Schools registered on PRASYNX")} />
          <Table
            headers={[t("admin.col.name", "Name"), t("admin.col.email", "Email"), t("admin.col.status", "Status"), t("admin.col.created", "Created")]}
            rows={data.organisations.map((o) => [
              o.name,
              o.email,
              t(`val.${o.status}`, o.status),
              (o.created_at ?? "").slice(0, 10),
            ])}
          />
        </Card>
      ) : null}
    </div>
  );
}