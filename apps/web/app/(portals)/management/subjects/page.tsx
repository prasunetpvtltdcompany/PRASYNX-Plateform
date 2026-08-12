"use client";

import type { SchoolSubjectDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { apiClient } from "@/lib/api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { buttonClasses } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useState, type FormEvent } from "react";

const emptyForm = { name: "", code: "", description: "" };

export default function ManagementSubjectsPage() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useApi<{ subjects: SchoolSubjectDTO[] }>("/api/v1/subjects");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const subjects = data?.subjects ?? [];

  function setField<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: form.name,
        code: form.code || undefined,
        description: form.description || undefined,
      };
      await apiClient("/api/v1/subjects", { method: "POST", body: payload });
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
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("subjects.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("subjects.subtitle")}</p>
        </div>
        <button type="button" onClick={() => setShowForm((s) => !s)} className={buttonClasses("primary")}>
          {showForm ? t("common.cancel") : t("subjects.add")}
        </button>
      </div>

      <PageState state={{ loading, error }} />

      {showForm ? (
        <Card>
          <CardHeader title={t("subjects.modalTitle")} />
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>{`${t("subjects.nameField")} *`}</label>
              <input value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputCls} required placeholder="e.g. Mathematics" />
            </div>
            <InputField label={t("subjects.code")} value={form.code} onChange={(v) => setField("code", v)} placeholder="e.g. MATH" />
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("field.description")}</label>
              <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} className={inputCls} rows={3} />
            </div>
            {formError ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 dark:bg-rose-950/40 dark:text-rose-300">{formError}</div> : null}
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className={buttonClasses("primary")}>
                {saving ? t("subjects.creating") : t("subjects.create")}
              </button>
            </div>
          </form>
        </Card>
      ) : null}

      {subjects.length ? (
        <Card>
          <CardHeader title={t("subjects.count").replace("{n}", String(subjects.length))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("subjects.col.name"), t("subjects.col.code"), t("subjects.col.description"), t("subjects.col.created")]}
              rows={subjects.map((s) => [
                s.name,
                s.code ? <Badge key={`${s.id}-c`} tone="indigo">{s.code}</Badge> : "—",
                s.description ?? "-",
                (s.created_at ?? "").slice(0, 10) || "-",
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder={placeholder} />
    </div>
  );
}