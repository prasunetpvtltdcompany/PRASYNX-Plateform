"use client";

import type { StudentDTO } from "@prasynx/types";
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

interface ClassOption {
  id: string;
  name: string;
}

const emptyForm = {
  full_name: "",
  roll_number: "",
  class_id: "",
  section_id: "",
  email: "",
  phone: "",
  password: "",
  parent_name: "",
  parent_email: "",
  parent_phone: "",
};

const STATUS_KEYS = ["active", "inactive", "suspended"];

export default function ManagementStudentsPage() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useApi<{ students: StudentDTO[] }>("/api/v1/students");
  const classes = useApi<{ classes: (ClassOption & { sections: ClassOption[] })[] }>("/api/v1/classes");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const students = data?.students ?? [];
  const classList = classes.data?.classes ?? [];

  function setField<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const selectedClass = classList.find((c) => c.id === form.class_id) ?? null;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        full_name: form.full_name,
        roll_number: form.roll_number || undefined,
        class_id: form.class_id || undefined,
        section_id: form.section_id || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        password: form.password || undefined,
        parent_name: form.parent_name || undefined,
        parent_email: form.parent_email || undefined,
        parent_phone: form.parent_phone || undefined,
      };
      await apiClient("/api/v1/students", { method: "POST", body: payload });
      setForm(emptyForm);
      setShowForm(false);
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  function exportStudents() {
    const headers = [
      t("students.col.name"),
      t("students.col.roll"),
      t("field.class"),
      t("field.section"),
      t("field.email"),
      t("field.phone"),
      t("students.parentName"),
      t("students.col.status"),
    ];
    const rows = students.map((s) => [
      s.full_name,
      s.roll_number ?? "",
      s.class_name ?? "",
      s.section_name ?? "",
      s.email ?? "",
      s.phone ?? "",
      s.parent_name ?? "",
      s.status ?? "",
    ]);
    exportCsv("students.csv", headers, rows);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("students.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("students.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {students.length ? (
            <button type="button" onClick={exportStudents} className={buttonClasses("secondary")}>
              <Download className="h-4 w-4" /> {t("common.exportCsv")}
            </button>
          ) : null}
          <button type="button" onClick={() => setShowForm((s) => !s)} className={buttonClasses("primary")}>
            {showForm ? t("common.cancel") : t("students.add")}
          </button>
        </div>
      </div>

      <PageState state={{ loading: loading || classes.loading, error: error ?? classes.error }} />

      {showForm ? (
        <Card>
          <CardHeader title={t("students.modalTitle")} />
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("field.fullName")} *</label>
              <input value={form.full_name} onChange={(e) => setField("full_name", e.target.value)} className={inputCls} required placeholder="e.g. Ananya Sharma" />
            </div>
            <InputField label={t("students.roll")} value={form.roll_number} onChange={(v) => setField("roll_number", v)} />
            <div>
              <label className={labelCls}>{t("field.class")}</label>
              <select
                value={form.class_id}
                onChange={(e) => setField("class_id", e.target.value)}
                className={inputCls}
              >
                <option value="">{t("students.noClass")}</option>
                {classList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t("field.section")}</label>
              <select
                value={form.section_id}
                onChange={(e) => setField("section_id", e.target.value)}
                className={inputCls}
                disabled={!selectedClass}
              >
                <option value="">{t("students.noSection")}</option>
                {(selectedClass?.sections ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <InputField label={t("students.emailLogin")} type="email" value={form.email} onChange={(v) => setField("email", v)} />
            <InputField label={t("field.phone")} value={form.phone} onChange={(v) => setField("phone", v)} />
            <InputField label={t("students.tempPassword")} type="password" value={form.password} onChange={(v) => setField("password", v)} />
            <InputField label={t("students.parentName")} value={form.parent_name} onChange={(v) => setField("parent_name", v)} />
            <InputField label={t("students.parentEmail")} type="email" value={form.parent_email} onChange={(v) => setField("parent_email", v)} />
            <InputField label={t("students.parentPhone")} value={form.parent_phone} onChange={(v) => setField("parent_phone", v)} />
            {formError ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 dark:bg-rose-950/40 dark:text-rose-300">{formError}</div> : null}
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className={buttonClasses("primary")}>
                {saving ? t("students.creating") : t("students.create")}
              </button>
            </div>
          </form>
        </Card>
      ) : null}

      {students.length ? (
        <Card>
          <CardHeader title={t("students.count").replace("{n}", String(students.length))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("students.col.name"), t("students.col.roll"), t("students.col.class"), t("students.col.contact"), t("students.col.parent"), t("students.col.status")]}
              rows={students.map((s) => [
                s.full_name,
                s.roll_number ?? "-",
                <span key={`${s.id}-cs`}>{[(s.class_name ?? "—"), s.section_name].filter(Boolean).join(" / ") || t("students.unassigned")}</span>,
                <span key={`${s.id}-ct`} className="text-sm">
                  {[s.email, s.phone].filter(Boolean).join(", ") || "-"}
                </span>,
                <span key={`${s.id}-pn`} className="text-sm">
                  {[s.parent_name, s.parent_phone].filter(Boolean).join(" · ") || "-"}
                </span>,
                <Badge key={`${s.id}-st`} tone={s.status === "active" ? "green" : "slate"}>
                  {STATUS_KEYS.includes(s.status) ? t(`val.${s.status}`) : s.status}
                </Badge>,
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </div>
  );
}