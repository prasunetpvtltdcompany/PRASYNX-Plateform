"use client";

import type { PromotionDTO, StudentDTO, ClassDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { apiClient } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { buttonClasses } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useState, type FormEvent } from "react";

export default function ManagementPromotionPage() {
  const { t } = useI18n();
  const promotions = useApi<{ promotions: PromotionDTO[] }>("/api/v1/promotions");
  const students = useApi<{ students: StudentDTO[] }>("/api/v1/students");
  const classes = useApi<{ classes: ClassDTO[] }>("/api/v1/classes");

  const [form, setForm] = useState({ student_id: "", to_class_id: "", to_section_id: "", remarks: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const history = promotions.data?.promotions ?? [];
  const studentList = students.data?.students ?? [];
  const classList = classes.data?.classes ?? [];
  const className = (id: string | null) => classList.find((c) => c.id === id)?.name ?? (id ? id.slice(0, 8) : "—");
  const studentName = (id: string) => studentList.find((s) => s.id === id)?.full_name ?? id.slice(0, 8);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    setSuccess(null);
    try {
      await apiClient("/api/v1/promotions", {
        method: "POST",
        body: {
          student_id: form.student_id,
          to_class_id: form.to_class_id,
          to_section_id: form.to_section_id || undefined,
          remarks: form.remarks || undefined,
        },
      });
      setSuccess(t("promotion.success").replace("{student}", studentName(form.student_id)).replace("{class}", className(form.to_class_id)));
      setForm({ student_id: "", to_class_id: "", to_section_id: "", remarks: "" });
      promotions.reload();
      students.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  const activeStudents = studentList.filter((s) => s.status === "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("promotion.title")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("promotion.subtitle")}</p>
      </div>

      <PageState state={{ loading: promotions.loading || students.loading || classes.loading, error: promotions.error ?? students.error ?? classes.error }} />

      <Card>
        <CardHeader title={t("promotion.modalTitle")} subtitle={t("promotion.hint")} />
        <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>{t("field.student")} *</label>
            <select required value={form.student_id} onChange={(e) => setF("student_id", e.target.value)} className={inputCls}>
              <option value="">{t("promotion.selectStudent")}</option>
              {activeStudents.map((s) => (
                <option key={s.id} value={s.id}>{s.full_name} {s.roll_number ? `(${s.roll_number})` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("promotion.toClass")} *</label>
            <select required value={form.to_class_id} onChange={(e) => setF("to_class_id", e.target.value)} className={inputCls}>
              <option value="">{t("promotion.selectClass")}</option>
              {classList.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t("field.remarks")}</label>
            <input value={form.remarks} onChange={(e) => setF("remarks", e.target.value)} className={inputCls} placeholder="e.g. Regular promotion 2026-27" />
          </div>
          {success ? <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 sm:col-span-2 dark:bg-emerald-950/40 dark:text-emerald-300">{success}</div> : null}
          {formError ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 dark:bg-rose-950/40 dark:text-rose-300">{formError}</div> : null}
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className={buttonClasses("primary")}>{saving ? t("promotion.promoting") : t("promotion.submit")}</button>
          </div>
        </form>
      </Card>

      {history.length ? (
        <Card>
          <CardHeader title={t("promotion.history").replace("{n}", String(history.length))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("promotion.col.student"), t("promotion.col.from"), t("promotion.col.to"), t("promotion.col.when"), t("promotion.col.by")]}
              rows={history.map((p) => [
                studentName(p.student_id),
                className(p.from_class_id),
                <span key={`${p.id}-to`} className="font-medium text-slate-800 dark:text-slate-100">{className(p.to_class_id)}</span>,
                (p.promoted_at ?? "").slice(0, 10) || "-",
                p.promoted_by ? p.promoted_by.slice(0, 8) : "—",
              ])}
            />
          </div>
        </Card>
      ) : null}
    </div>
  );

  function setF<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }
}

const labelCls = "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";
const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";