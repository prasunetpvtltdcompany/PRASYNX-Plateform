"use client";

import type { AdmissionDTO, AdmissionStatus } from "@prasynx/types";
import { ADMISSION_STATUSES } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { apiClient } from "@/lib/api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { buttonClasses } from "@/components/ui/button";
import { exportCsv } from "@/lib/export";
import { useI18n } from "@/lib/i18n";
import { Download } from "lucide-react";
import { useState, type FormEvent } from "react";

const STATUS_TONE: Record<AdmissionStatus, "slate" | "green" | "amber" | "rose"> = {
  pending: "amber",
  contacted: "slate",
  reviewing: "slate",
  accepted: "green",
  rejected: "rose",
  waitlisted: "slate",
};

const emptyForm = {
  applicant_name: "",
  phone: "",
  applicant_email: "",
  applying_class: "",
  parent_name: "",
  parent_phone: "",
  academic_year: "",
};

export default function ManagementAdmissionsPage() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useApi<{ admissions: AdmissionDTO[] }>("/api/v1/admissions");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const admissions = data?.admissions ?? [];

  function setField<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload = Object.fromEntries(
        Object.entries(form)
          .filter(([, v]) => v !== "")
          .map(([k, v]) => [k, v]),
      );
      await apiClient("/api/v1/admissions", { method: "POST", body: payload });
      setForm(emptyForm);
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(id: string, status: AdmissionStatus) {
    setBusyId(id);
    try {
      await apiClient(`/api/v1/admissions/${id}/status`, { method: "PATCH", body: { status } });
      reload();
    } finally {
      setBusyId(null);
    }
  }

  function exportApplications() {
    const headers = [
      t("admissions.col.applicant"),
      t("admissions.col.class"),
      t("admissions.col.contact"),
      t("admissions.col.parent"),
      t("admissions.col.status"),
    ];
    const rows = admissions.map((a) => [
      a.applicant_name,
      a.applying_class ?? "",
      [a.applicant_email, a.phone].filter(Boolean).join(", "),
      [a.parent_name, a.parent_phone].filter(Boolean).join(", "),
      a.status ?? "",
    ]);
    exportCsv("admissions.csv", headers, rows);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("admissions.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("admissions.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {admissions.length ? (
            <button type="button" onClick={exportApplications} className={buttonClasses("secondary")}>
              <Download className="h-4 w-4" /> {t("common.exportCsv")}
            </button>
          ) : null}
          <button type="button" onClick={() => setShowForm((s) => !s)} className={buttonClasses("primary")}>
            {showForm ? t("common.cancel") : t("admissions.new")}
          </button>
        </div>
      </div>

      <PageState state={{ loading, error }} />

      {showForm ? (
        <Card>
          <CardHeader title={t("admissions.record")} />
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("admissions.applicant")}</label>
              <input
                value={form.applicant_name}
                onChange={(e) => setField("applicant_name", e.target.value)}
                className={inputCls}
                required
                placeholder="e.g. Kabir Singh"
              />
            </div>
            <InputField label={t("field.phone")} value={form.phone} onChange={(v) => setField("phone", v)} />
            <InputField label={t("field.email")} type="email" value={form.applicant_email} onChange={(v) => setField("applicant_email", v)} />
            <InputField label={t("admissions.applyingClass")} value={form.applying_class} onChange={(v) => setField("applying_class", v)} />
            <InputField label={t("admissions.academicYear")} value={form.academic_year} onChange={(v) => setField("academic_year", v)} placeholder="e.g. 2026-27" />
            <InputField label={t("admissions.parentName")} value={form.parent_name} onChange={(v) => setField("parent_name", v)} />
            <InputField label={t("admissions.parentPhone")} value={form.parent_phone} onChange={(v) => setField("parent_phone", v)} />
            {formError ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 dark:bg-rose-950/40 dark:text-rose-300">{formError}</div> : null}
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className={buttonClasses("primary")}>
                {saving ? t("admissions.creating") : t("admissions.create")}
              </button>
            </div>
          </form>
        </Card>
      ) : null}

      {admissions.length ? (
        <Card>
          <CardHeader title={t("admissions.count").replace("{n}", String(admissions.length))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("admissions.col.applicant"), t("admissions.col.class"), t("admissions.col.contact"), t("admissions.col.parent"), t("admissions.col.status"), t("admissions.changeStatus")]}
              rows={admissions.map((a) => [
                a.applicant_name,
                a.applying_class ?? "-",
                <span key={`${a.id}-c`} className="text-sm">
                  {[a.applicant_email, a.phone].filter(Boolean).join(", ") || "-"}
                </span>,
                <span key={`${a.id}-p`} className="text-sm">
                  {[a.parent_name, a.parent_phone].filter(Boolean).join(" · ") || "-"}
                </span>,
                <Badge key={`${a.id}-s`} tone={STATUS_TONE[a.status] ?? "slate"}>
                  {t(`val.${a.status}`)}
                </Badge>,
                <select
                  key={`${a.id}-sel`}
                  value={a.status}
                  disabled={busyId === a.id}
                  onChange={(e) => void changeStatus(a.id, e.target.value as AdmissionStatus)}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-indigo-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {ADMISSION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t(`val.${s}`)}
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

const labelCls = "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";
const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder={placeholder} />
    </div>
  );
}