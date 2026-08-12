"use client";

import type { OrganisationDTO, PortalSlug } from "@prasynx/types";
import { PORTAL_SLUGS } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { apiClient } from "@/lib/api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { cn } from "@/lib/cn";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

const STATUS_TONE: Record<string, "slate" | "green" | "amber" | "rose"> = {
  verified: "green",
  pending: "amber",
  suspended: "rose",
  rejected: "rose",
};

function PortalToggle({
  label,
  active,
  disabled,
  onChange,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50",
        active
          ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
          : "border-slate-300 bg-white text-slate-500 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-700",
      )}
    >
      {label}
    </button>
  );
}

export default function PlatformOrganisationsPage() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useApi<{ organisations: OrganisationDTO[] }>("/api/v1/organisations");
  const [busy, setBusy] = useState<Record<string, string | null>>({});
  const organisations = data?.organisations ?? [];

  async function updateStatus(organisationId: string, status: string) {
    setBusy((prev) => ({ ...prev, [organisationId]: "status" }));
    try {
      await apiClient(`/api/v1/organisations/${organisationId}/status`, { method: "PATCH", body: { status } });
      reload();
    } finally {
      setBusy((prev) => ({ ...prev, [organisationId]: null }));
    }
  }

  async function togglePortal(organisation: OrganisationDTO, slug: PortalSlug) {
    setBusy((prev) => ({ ...prev, [organisation.id]: slug }));
    try {
      const current = organisation.portal_access ?? [];
      const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
      await apiClient(`/api/v1/organisations/${organisation.id}/portals`, { method: "PATCH", body: { portals: next } });
      reload();
    } finally {
      setBusy((prev) => ({ ...prev, [organisation.id]: null }));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("admin.orgs.title", "Organisations")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("admin.orgs.subtitle", "All schools on the platform. Grant or revoke the portals each school may use.")}
        </p>
      </div>

      <PageState state={{ loading, error }} />

      {organisations.length ? (
        <Card>
          <CardHeader title={`${t("admin.organisations", "Schools")} (${organisations.length})`} />
          <div className="overflow-x-auto">
            <Table
              headers={[
                t("admin.col.name", "Name"),
                t("admin.col.email", "Email"),
                t("admin.col.status", "Status"),
                t("admin.grantedPortals", "Granted portals"),
                t("admin.col.created", "Created"),
                t("admin.changeStatus", "Change status"),
              ]}
              rows={organisations.map((o) => [
                o.name,
                o.email,
                <Badge key={`${o.id}-badge`} tone={STATUS_TONE[o.status] ?? "slate"}>
                  {t(`val.${o.status}`, o.status)}
                </Badge>,
                <div key={`${o.id}-portals`} className="flex flex-wrap gap-1">
                  {PORTAL_SLUGS.map((slug) => (
                    <PortalToggle
                      key={slug}
                      label={t(`portal.${slug}`, slug)}
                      active={(o.portal_access ?? []).includes(slug)}
                      disabled={busy[o.id] !== null}
                      onChange={() => void togglePortal(o, slug)}
                    />
                  ))}
                </div>,
                (o.created_at ?? "").slice(0, 10),
                <select
                  key={`${o.id}-select`}
                  value={o.status}
                  disabled={busy[o.id] !== null}
                  onChange={(e) => void updateStatus(o.id, e.target.value)}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-indigo-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {["verified", "pending", "suspended", "rejected"].map((s) => (
                    <option key={s} value={s}>
                      {t(`val.${s}`, s)}
                    </option>
                  ))}
                </select>,
              ])}
            />
          </div>
        </Card>
      ) : null}
    </div>
  );
}