"use client";

import type { TransportRouteDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { apiClient } from "@/lib/api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { buttonClasses } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useState, type FormEvent } from "react";

const emptyForm = { route_name: "", route_code: "", start_point: "", end_point: "", fee: "", status: "active" };

export default function ManagementTransportPage() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useApi<{ routes: TransportRouteDTO[] }>("/api/v1/transport");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const routes = data?.routes ?? [];

  function setField<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await apiClient("/api/v1/transport", {
        method: "POST",
        body: {
          route_name: form.route_name,
          route_code: form.route_code || undefined,
          start_point: form.start_point || undefined,
          end_point: form.end_point || undefined,
          fee: form.fee || undefined,
          status: form.status,
        },
      });
      setForm(emptyForm);
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("transport.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("transport.subtitle")}</p>
        </div>
        <button type="button" onClick={() => setShowForm((s) => !s)} className={buttonClasses("primary")}>
          {showForm ? t("common.cancel") : t("transport.add")}
        </button>
      </div>

      <PageState state={{ loading, error }} />

      {showForm ? (
        <Card>
          <CardHeader title={t("transport.modalTitle")} />
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div>
              <label className={labelCls}>{t("transport.routeName")}</label>
              <input value={form.route_name} onChange={(e) => setField("route_name", e.target.value)} className={inputCls} required placeholder="e.g. Route A - North Line" />
            </div>
            <div>
              <label className={labelCls}>{t("transport.routeCode")}</label>
              <input value={form.route_code} onChange={(e) => setField("route_code", e.target.value)} className={inputCls} placeholder="e.g. NA-01" />
            </div>
            <InputField label={t("transport.start")} value={form.start_point} onChange={(v) => setField("start_point", v)} />
            <InputField label={t("transport.end")} value={form.end_point} onChange={(v) => setField("end_point", v)} />
            <InputField label={t("transport.fee")} value={form.fee} onChange={(v) => setField("fee", v)} placeholder="e.g. 1200" />
            <div>
              <label className={labelCls}>{t("field.status")}</label>
              <select value={form.status} onChange={(e) => setField("status", e.target.value)} className={inputCls}>
                {["active", "inactive"].map((s) => (
                  <option key={s} value={s}>{t(`val.${s}`)}</option>
                ))}
              </select>
            </div>
            {formError ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 dark:bg-rose-950/40 dark:text-rose-300">{formError}</div> : null}
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className={buttonClasses("primary")}>{saving ? t("transport.creating") : t("transport.create")}</button>
            </div>
          </form>
        </Card>
      ) : null}

      {routes.length ? (
        <Card>
          <CardHeader title={t("transport.count").replace("{n}", String(routes.length))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("transport.col.route"), t("transport.col.code"), t("transport.col.routeLine"), t("transport.col.fee"), t("transport.col.status")]}
              rows={routes.map((r) => [
                r.route_name,
                r.route_code ?? "—",
                <span key={`${r.id}-se`}>{[r.start_point, r.end_point].filter(Boolean).join(" → ") || "-"}</span>,
                r.fee ? `₹ ${r.fee}` : "—",
                <Badge key={`${r.id}-st`} tone={r.status === "active" ? "green" : "slate"}>{r.status ? t(`val.${r.status}`) : "-"}</Badge>,
              ])}
            />
          </div>
        </Card>
      ) : null}
    </div>
  );
}

const labelCls = "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";
const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder={placeholder} />
    </div>
  );
}