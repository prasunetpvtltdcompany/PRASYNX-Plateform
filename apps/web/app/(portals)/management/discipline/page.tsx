"use client";

import type { DisciplineIncidentDTO, StudentDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { apiClient } from "@/lib/api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { buttonClasses } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useState, type FormEvent } from "react";

const emptyForm = { student_id: "", incident_type: "general", title: "", description: "", severity: "low", location: "", action_taken: "", status: "open" };

const statusTone = (s: string | null) => (s === "resolved" ? "green" : s === "closed" ? "green" : s === "in_progress" ? "indigo" : s === "under_review" ? "amber" : "rose");

const SEVERITY_KEYS = ["low", "medium", "high", "critical"];

const INCIDENT_KEYS = ["general", "misconduct", "bullying", "absconding", "uniform", "attendance", "other"];

export default function ManagementDisciplinePage() {
  const { t } = useI18n();
  const incidents = useApi<{ incidents: DisciplineIncidentDTO[] }>("/api/v1/discipline");
  const students = useApi<{ students: StudentDTO[] }>("/api/v1/students");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const list = incidents.data?.incidents ?? [];
  const studentList = students.data?.students ?? [];
  const studentName = (id: string) => studentList.find((s) => s.id === id)?.full_name ?? id.slice(0, 8);

  const incidentType = (v: string) =>
    v === "academics" ? t("val.academic") : INCIDENT_KEYS.includes(v) ? t(`val.${v}`) : v;

  const statusLabel = (v: string | null) => {
    if (!v) return "-";
    if (v === "resolved") return t("val.resolved");
    if (v === "open") return t("val.open");
    if (v === "closed") return t("home.closed");
    if (v === "in_progress") return t("val.in_progress");
    if (v === "under_review") return t("val.under_review");
    return v;
  };

  const severityLabel = (v: string | null) => (v && SEVERITY_KEYS.includes(v) ? t(`val.${v}`) : (v ?? "-"));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await apiClient("/api/v1/discipline", { method: "POST", body: form });
      setForm(emptyForm);
      setShowForm(false);
      incidents.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(id: string, status: string) {
    setBusyId(id);
    setFormError(null);
    try {
      await apiClient(`/api/v1/discipline/${id}`, { method: "PATCH", body: { status } });
      incidents.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setBusyId(null);
    }
  }

  const open = list.filter((i) => i.status !== "resolved" && i.status !== "closed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("discipline.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("discipline.subtitle")}</p>
        </div>
        <button type="button" onClick={() => setShowForm((s) => !s)} className={buttonClasses("primary")}>
          {showForm ? t("common.cancel") : t("discipline.add")}
        </button>
      </div>

      <PageState state={{ loading: incidents.loading || students.loading, error: incidents.error ?? students.error }} />

      {showForm ? (
        <Card>
          <CardHeader title={t("discipline.modalTitle")} />
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div>
              <label className={labelCls}>{t("field.student")} *</label>
              <select value={form.student_id} onChange={(e) => setF("student_id", e.target.value)} className={inputCls} required>
                <option value="">{t("attendance.selectStudent")}</option>
                {studentList.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t("field.type")}</label>
              <select value={form.incident_type} onChange={(e) => setF("incident_type", e.target.value)} className={inputCls}>
                {["general", "misconduct", "bullying", "absconding", "uniform", "attendance", "academics", "other"].map((v) => (
                  <option key={v} value={v}>{incidentType(v)}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("discipline.titleField")}</label>
              <input value={form.title} onChange={(e) => setF("title", e.target.value)} className={inputCls} required placeholder="e.g. Repeated late arrival" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("field.description")}</label>
              <textarea value={form.description} onChange={(e) => setF("description", e.target.value)} className={inputCls} rows={3} />
            </div>
            <div>
              <label className={labelCls}>{t("field.severity")}</label>
              <select value={form.severity} onChange={(e) => setF("severity", e.target.value)} className={inputCls}>
                {["low", "medium", "high", "critical"].map((s) => (
                  <option key={s} value={s}>{severityLabel(s)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t("field.location")}</label>
              <input value={form.location} onChange={(e) => setF("location", e.target.value)} className={inputCls} placeholder="e.g. Classroom 3" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("field.actionTaken")}</label>
              <input value={form.action_taken} onChange={(e) => setF("action_taken", e.target.value)} className={inputCls} placeholder="e.g. Warning issued" />
            </div>
            {formError ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 dark:bg-rose-950/40 dark:text-rose-300">{formError}</div> : null}
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className={buttonClasses("primary")}>{saving ? t("discipline.saving") : t("discipline.submit")}</button>
            </div>
          </form>
        </Card>
      ) : null}

      {list.length ? (
        <Card>
          <CardHeader title={t("discipline.count").replace("{n}", String(list.length))} subtitle={t("discipline.openCount").replace("{n}", String(open))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("discipline.col.student"), t("discipline.col.incident"), t("discipline.col.severity"), t("discipline.col.date"), t("discipline.col.status"), t("discipline.col.actions")]}
              rows={list.map((i) => [
                studentName(i.student_id),
                <div key={`${i.id}-n`}>
                  <div className="font-medium text-slate-800 dark:text-slate-100">{i.title}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">{i.incident_type ? incidentType(i.incident_type) : "-"}</div>
                </div>,
                <Badge key={`${i.id}-sev`} tone={i.severity === "high" || i.severity === "critical" ? "rose" : i.severity === "medium" ? "amber" : "slate"}>{severityLabel(i.severity)}</Badge>,
                (i.reported_at ?? "").slice(0, 10) || "-",
                <Badge key={`${i.id}-st`} tone={statusTone(i.status)}>{statusLabel(i.status)}</Badge>,
                <div key={`${i.id}-act`} className="flex items-center gap-1">
                  <RowAction onClick={() => changeStatus(i.id, "in_progress")} disabled={busyId === i.id || i.status === "in_progress"} label={t("discipline.start")} />
                  <RowAction onClick={() => changeStatus(i.id, "resolved")} disabled={busyId === i.id || i.status === "resolved"} label={t("discipline.resolve")} />
                </div>,
              ])}
            />
          </div>
        </Card>
      ) : null}
    </div>
  );

  function setF<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }
}

const labelCls = "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";
const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

function RowAction({ onClick, disabled, label }: { onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-indigo-200 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
    >
      {label}
    </button>
  );
}