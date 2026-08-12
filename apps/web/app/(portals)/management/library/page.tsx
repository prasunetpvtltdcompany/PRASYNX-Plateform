"use client";

import type { LibraryBookDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { apiClient } from "@/lib/api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { buttonClasses } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useState, type FormEvent } from "react";

const emptyForm = { title: "", author: "", isbn: "", category: "", publisher: "", copies_total: "1", shelf_location: "" };

export default function ManagementLibraryPage() {
  const { t } = useI18n();
  const { data, loading, error, reload } = useApi<{ books: LibraryBookDTO[] }>("/api/v1/library");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const books = data?.books ?? [];

  function setField<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await apiClient("/api/v1/library", {
        method: "POST",
        body: {
          title: form.title,
          author: form.author || undefined,
          isbn: form.isbn || undefined,
          category: form.category || undefined,
          publisher: form.publisher || undefined,
          copies_total: Number(form.copies_total) || undefined,
          shelf_location: form.shelf_location || undefined,
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
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("library.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("library.subtitle")}</p>
        </div>
        <button type="button" onClick={() => setShowForm((s) => !s)} className={buttonClasses("primary")}>
          {showForm ? t("common.cancel") : t("library.add")}
        </button>
      </div>

      <PageState state={{ loading, error }} />

      {showForm ? (
        <Card>
          <CardHeader title={t("library.modalTitle")} />
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("library.titleField")}</label>
              <input value={form.title} onChange={(e) => setField("title", e.target.value)} className={inputCls} required placeholder="e.g. To Kill a Mockingbird" />
            </div>
            <InputField label={t("field.author")} value={form.author} onChange={(v) => setField("author", v)} />
            <InputField label={t("field.isbn")} value={form.isbn} onChange={(v) => setField("isbn", v)} />
            <InputField label={t("field.category")} value={form.category} onChange={(v) => setField("category", v)} placeholder="e.g. Fiction" />
            <InputField label={t("field.publisher")} value={form.publisher} onChange={(v) => setField("publisher", v)} />
            <InputField label={t("field.copies")} value={form.copies_total} onChange={(v) => setField("copies_total", v)} />
            <InputField label={t("field.shelf")} value={form.shelf_location} onChange={(v) => setField("shelf_location", v)} placeholder="e.g. A3" />
            {formError ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 dark:bg-rose-950/40 dark:text-rose-300">{formError}</div> : null}
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className={buttonClasses("primary")}>{saving ? t("library.creating") : t("library.create")}</button>
            </div>
          </form>
        </Card>
      ) : null}

      {books.length ? (
        <Card>
          <CardHeader title={t("library.count").replace("{n}", String(books.length))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("library.col.title"), t("library.col.author"), t("library.col.category"), t("library.col.copies"), t("library.col.available"), t("library.col.status")]}
              rows={books.map((b) => [
                <div key={`${b.id}-t`}>
                  {b.title}
                  {b.isbn ? <div className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">ISBN {b.isbn}</div> : null}
                </div>,
                b.author ?? "—",
                b.category ?? "—",
                b.copies_total ?? 0,
                <Badge key={`${b.id}-a`} tone={Number(b.copies_available) > 0 ? "green" : "rose"}>{b.copies_available ?? 0}</Badge>,
                b.status ? t(`val.${b.status}`, b.status) : "-",
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