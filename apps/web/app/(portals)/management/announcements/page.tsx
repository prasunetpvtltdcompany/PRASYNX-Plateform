"use client";

import type { AnnouncementDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { apiClient } from "@/lib/api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { buttonClasses } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useState, type FormEvent } from "react";

const emptyForm = { title: "", content: "", target_role: "all", priority: "normal", publish: "on" };

const PRIORITY_TONE: Record<string, "slate" | "green" | "amber" | "rose"> = {
  low: "slate",
  normal: "green",
  high: "amber",
  urgent: "rose",
};

const PRIORITY_KEYS = ["low", "normal", "high", "urgent"];

export default function ManagementAnnouncementsPage() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useApi<{ announcements: AnnouncementDTO[] }>("/api/v1/announcements");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const announcements = data?.announcements ?? [];

  const priorityLabel = (p: string) => (PRIORITY_KEYS.includes(p) ? t(`val.${p}`) : p);

  function setField<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await apiClient("/api/v1/announcements", {
        method: "POST",
        body: {
          title: form.title,
          content: form.content || undefined,
          target_role: form.target_role || undefined,
          priority: form.priority,
          publish: form.publish === "on",
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

  async function remove(id: string) {
    if (!confirm(t("announcements.deleteConfirm"))) return;
    await apiClient(`/api/v1/announcements/${id}`, { method: "DELETE" });
    reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("announcements.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("announcements.subtitle")}</p>
        </div>
        <button type="button" onClick={() => setShowForm((s) => !s)} className={buttonClasses("primary")}>
          {showForm ? t("common.cancel") : t("announcements.new")}
        </button>
      </div>

      <PageState state={{ loading, error }} />

      {showForm ? (
        <Card>
          <CardHeader title={t("announcements.modalTitle")} />
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("field.title")} *</label>
              <input value={form.title} onChange={(e) => setField("title", e.target.value)} className={inputCls} required />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("announcements.message")}</label>
              <textarea value={form.content} onChange={(e) => setField("content", e.target.value)} className={inputCls} rows={4} />
            </div>
            <div>
              <label className={labelCls}>{t("announcements.audience")}</label>
              <select value={form.target_role} onChange={(e) => setField("target_role", e.target.value)} className={inputCls}>
                {["all", "students", "staff", "parents"].map((r) => (
                  <option key={r} value={r}>{t(`val.${r}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t("field.priority")}</label>
              <select value={form.priority} onChange={(e) => setField("priority", e.target.value)} className={inputCls}>
                {["low", "normal", "high", "urgent"].map((p) => (
                  <option key={p} value={p}>{priorityLabel(p)}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 sm:col-span-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.publish === "on"}
                onChange={(e) => setField("publish", e.target.checked ? "on" : "off")}
                className="h-4 w-4 rounded border-slate-300"
              />
              {t("announcements.publishNow")}
            </label>
            {formError ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 dark:bg-rose-950/40 dark:text-rose-300">{formError}</div> : null}
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className={buttonClasses("primary")}>
                {saving ? t("announcements.creating") : t("announcements.post")}
              </button>
            </div>
          </form>
        </Card>
      ) : null}

      {announcements.length ? (
        <Card>
          <CardHeader title={t("announcements.count").replace("{n}", String(announcements.length))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("announcements.col.title"), t("announcements.col.audience"), t("announcements.col.priority"), t("announcements.col.status"), ""]}
              rows={announcements.map((a) => [
                <div key={`${a.id}-t`}>
                  {a.title}
                  {a.content ? <div className="mt-0.5 max-w-md truncate text-xs text-slate-400 dark:text-slate-500">{a.content}</div> : null}
                </div>,
                a.target_role ? t(`val.${a.target_role}`) : t("val.all"),
                a.priority ? <Badge key={`${a.id}-p`} tone={PRIORITY_TONE[a.priority] ?? "slate"}>{priorityLabel(a.priority)}</Badge> : "—",
                a.published_at ? <Badge key={`${a.id}-s`} tone="green">{t("val.published")}</Badge> : <Badge key={`${a.id}-s`} tone="amber">{t("val.draft")}</Badge>,
                <button key={`${a.id}-d`} onClick={() => void remove(a.id)} className="text-xs font-medium text-rose-600 hover:underline">
                  {t("common.delete")}
                </button>,
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