"use client";

import type { HostelRoomDTO, HostelAllocationDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { apiClient } from "@/lib/api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { buttonClasses } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useState, type FormEvent } from "react";

const emptyForm = { room_number: "", capacity: "", floor: "", building: "", room_type: "general", monthly_rent: "" };

const ROOM_TYPES = ["general", "ac", "deluxe", "staff"];

export default function ManagementHostelPage() {
  const { t } = useI18n();
  const rooms = useApi<{ rooms: HostelRoomDTO[] }>("/api/v1/hostel/rooms");
  const allocations = useApi<{ allocations: HostelAllocationDTO[] }>("/api/v1/hostel/allocations");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const roomList = rooms.data?.rooms ?? [];
  const allocList = allocations.data?.allocations ?? [];
  const roomNumber = (id: string) => roomList.find((r) => r.id === id)?.room_number ?? id.slice(0, 8);

  const roomType = (v: string) =>
    v === "general" ? t("hostel.roomGeneral") : v === "ac" ? t("hostel.roomAc") : v === "deluxe" ? t("hostel.roomDeluxe") : v === "staff" ? t("hostel.roomStaff") : v;

  function setField<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await apiClient("/api/v1/hostel/rooms", {
        method: "POST",
        body: {
          room_number: form.room_number,
          capacity: Number(form.capacity) || undefined,
          floor: form.floor || undefined,
          building: form.building || undefined,
          room_type: form.room_type,
          monthly_rent: form.monthly_rent || undefined,
        },
      });
      setForm(emptyForm);
      setShowForm(false);
      rooms.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  const combinedError = rooms.error ?? allocations.error;
  const combinedLoading = rooms.loading || allocations.loading;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("hostel.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("hostel.subtitle")}</p>
        </div>
        <button type="button" onClick={() => setShowForm((s) => !s)} className={buttonClasses("primary")}>
          {showForm ? t("common.cancel") : t("hostel.add")}
        </button>
      </div>

      <PageState state={{ loading: combinedLoading, error: combinedError }} />

      {showForm ? (
        <Card>
          <CardHeader title={t("hostel.modalTitle")} />
          <form onSubmit={onSubmit} className="grid gap-4 p-6 sm:grid-cols-2">
            <InputField label={t("hostel.roomNumber")} value={form.room_number} onChange={(v) => setField("room_number", v)} placeholder="e.g. B-101" />
            <InputField label={t("field.capacity")} value={form.capacity} onChange={(v) => setField("capacity", v)} placeholder="e.g. 4" />
            <InputField label={t("field.floor")} value={form.floor} onChange={(v) => setField("floor", v)} />
            <InputField label={t("field.building")} value={form.building} onChange={(v) => setField("building", v)} placeholder="e.g. Boys Hostel" />
            <div>
              <label className={labelCls}>{t("hostel.roomType")}</label>
              <select value={form.room_type} onChange={(e) => setField("room_type", e.target.value)} className={inputCls}>
                {ROOM_TYPES.map((v) => (
                  <option key={v} value={v}>{roomType(v)}</option>
                ))}
              </select>
            </div>
            <InputField label={t("field.rent")} value={form.monthly_rent} onChange={(v) => setField("monthly_rent", v)} />
            {formError ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2 dark:bg-rose-950/40 dark:text-rose-300">{formError}</div> : null}
            <div className="sm:col-span-2">
              <button type="submit" disabled={saving} className={buttonClasses("primary")}>{saving ? t("hostel.creating") : t("hostel.create")}</button>
            </div>
          </form>
        </Card>
      ) : null}

      {roomList.length ? (
        <Card>
          <CardHeader title={t("hostel.count").replace("{n}", String(roomList.length))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("hostel.col.room"), t("hostel.col.building"), t("hostel.col.type"), t("hostel.col.capacity"), t("hostel.col.rent"), t("hostel.col.status")]}
              rows={roomList.map((r) => [
                r.room_number,
                r.building ?? "—",
                r.room_type ? roomType(r.room_type) : "—",
                r.capacity ?? "—",
                r.monthly_rent ? `₹ ${r.monthly_rent}` : "—",
                <Badge key={`${r.id}-st`} tone={r.status === "available" ? "green" : "slate"}>{r.status ? t(`val.${r.status}`, r.status) : "-"}</Badge>,
              ])}
            />
          </div>
        </Card>
      ) : null}

      {allocList.length ? (
        <Card>
          <CardHeader title={t("hostel.allocations").replace("{n}", String(allocList.length))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("hostel.col.allocRoom"), t("hostel.col.allocStudent"), t("hostel.col.checkIn"), t("hostel.col.allocStatus")]}
              rows={allocList.map((a) => [
                roomNumber(a.room_id),
                a.student_id.slice(0, 8),
                (a.check_in_date ?? "").slice(0, 10) || "-",
                <Badge key={`${a.id}-st`} tone="amber">{a.status ? t(`val.${a.status}`, a.status) : t("val.occupied")}</Badge>,
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
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
        placeholder={placeholder}
        required={label.endsWith("*")}
      />
    </div>
  );
}