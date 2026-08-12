"use client";

import type { HealthRecordDTO, StudentDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { apiClient } from "@/lib/api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { buttonClasses } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useState, type FormEvent } from "react";

const emptyForm = { student_id: "", record_type: "checkup", title: "", value: "", description: "" };

const HEALTH_TYPES = ["checkup", "vaccination", "illness", "medication", "immunisation", "general"];

export default function ManagementHealthPage() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useApi<{ records: HealthRecordDTO[] }>("/api/v1/health");
  const students = useApi<{ students: StudentDTO[] }>("/api/v1/students");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const records = data?.records ?? [];
  const studentList = students.data?.students ?? [];
  const studentName = (id: string) => studentList.find((s) => s.id === id)?.full_name ?? id.slice(0, 8);

  const healthType = (v: string) => (v && HEALTH_TYPES.includes(v) ? t(`val.${v}`) : v);

  function setField<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await apiClient("/api/v1/health", {
        method: "POST",
        body: {
          student_id: form.student_id,
          record_type: form.record_type,
          title: form.title,
          value: form.value || undefined,
          description: form.description || undefined,
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
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("health.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("health.subtitle")}</p>
        </div>
        <button type="button" onClick={() => setShowForm((s) => !s)} className={buttonClasses("primary")}>
          {showForm ? t("common.cancel") : t("health.add")}
        </button>
      </div>

      <PageState state={{ loading: loading || students.loading, error: error ?? students.error }} />

      {showForm ? (
        <Card>
          <CardHeader title={t("health.modalTitle")} />
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div>
              <label className={labelCls}>{t("field.student")} *</label>
              <select value={form.student_id} onChange={(e) => setField("student_id", e.target.value)} className={inputCls} required>
                <option value="">{t("health.selectStudent")}</option>
                {studentList.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t("health.type")}</label>
              <select value={form.record_type} onChange={(e) => setField("record_type", e.target.value)} className={inputCls}>
                {HEALTH_TYPES.map((v) => (
                  <option key={v} value={v}>{healthType(v)}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("health.titleField")}</label>
              <input value={form.title} onChange={(e) => setField("title", e.target.value)} className={inputCls} required placeholder="e.g. Annual vision checkup" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("health.value")}</label>
              <input value={form.value} onChange={(e) => setField("value", e.target.value)} className={inputCls} placeholder="e.g. 20/20" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("field.notes")}</label>
              <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} className={inputCls} rows={3} />
            </div>
            {formError ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 dark:bg-rose-950/40 dark:text-rose-300">{formError}</div> : null}
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className={buttonClasses("primary")}>{saving ? t("health.creating") : t("health.save")}</button>
            </div>
          </form>
        </Card>
      ) : null}

      {records.length ? (
        <Card>
          <CardHeader title={t("health.count").replace("{n}", String(records.length))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("health.col.student"), t("health.col.type"), t("health.col.title"), t("health.col.value"), t("health.col.recorded")]}
              rows={records.map((r) => [
                studentName(r.student_id),
                <Badge key={`${r.id}-t`} tone="indigo">{healthType(r.record_type)}</Badge>,
                r.title,
                r.value ?? "—",
                (r.recorded_at ?? "").slice(0, 10) || "-",
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