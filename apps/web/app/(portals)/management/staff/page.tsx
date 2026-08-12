"use client";

import type { StaffRecordDTO, StaffAttendanceDTO, StaffLeaveRequestDTO, StaffPayslipDTO } from "@prasynx/types";
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

type Tab = "directory" | "attendance" | "leaves" | "payroll";

const emptyMember = {
  full_name: "",
  email: "",
  phone: "",
  staff_unique_id: "",
  subject: "",
  designation: "",
  department: "",
  qualification: "",
  join_date: "",
  gender: "",
  employment_type: "",
  salary: "",
  status: "active",
};

const emptyAttendance = { staff_id: "", attendance_date: "", check_in: "", check_out: "", status: "present", remarks: "" };
const emptyLeave = { staff_id: "", leave_type: "casual", from_date: "", to_date: "", reason: "" };

const emptyForm = { ...emptyMember, ...emptyAttendance, ...emptyLeave };

const MEMBER_STATUS_KEYS = ["active", "inactive", "on_leave"];
const ATTENDANCE_STATUS_KEYS = ["present", "absent", "late", "leave"];
const LEAVE_STATUS_KEYS = ["pending", "approved", "rejected"];
const LEAVE_TYPE_KEYS = ["casual", "sick", "earned", "unpaid"];
const EMPLOYMENT_KEYS = ["full_time", "part_time", "contract"];

export default function ManagementStaffPage() {
  const { t } = useI18n();
  const staff = useApi<{ staff: StaffRecordDTO[] }>("/api/v1/staff");
  const attendance = useApi<{ attendance: StaffAttendanceDTO[] }>("/api/v1/staff/attendance");
  const leaves = useApi<{ leaves: StaffLeaveRequestDTO[] }>("/api/v1/staff/leave-requests");
  const payslips = useApi<{ payslips: StaffPayslipDTO[] }>("/api/v1/staff/payslips");

  const [tab, setTab] = useState<Tab>("directory");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const members = staff.data?.staff ?? [];
  const staffName = (id: string) => members.find((m) => m.id === id)?.full_name ?? id.slice(0, 8);

  async function submitMember(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await apiClient("/api/v1/staff", {
        method: "POST",
        body: {
          full_name: form.full_name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          staff_unique_id: form.staff_unique_id || undefined,
          subject: form.subject || undefined,
          designation: form.designation || undefined,
          department: form.department || undefined,
          qualification: form.qualification || undefined,
          join_date: form.join_date || undefined,
          gender: form.gender === "" ? undefined : form.gender,
          employment_type: form.employment_type === "" ? undefined : form.employment_type,
          salary: form.salary ? Number(form.salary) : undefined,
          status: form.status,
        },
      });
      setForm({ ...emptyForm, status: "active" });
      setShowForm(false);
      staff.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  async function submitAttendance(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await apiClient("/api/v1/staff/attendance", {
        method: "POST",
        body: {
          staff_id: form.staff_id,
          attendance_date: form.attendance_date,
          check_in: form.check_in || undefined,
          check_out: form.check_out || undefined,
          status: form.status,
          remarks: form.remarks || undefined,
        },
      });
      setForm({ ...emptyForm, status: "present" });
      attendance.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  async function submitLeave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await apiClient("/api/v1/staff/leave-requests", {
        method: "POST",
        body: {
          staff_id: form.staff_id,
          leave_type: form.leave_type,
          from_date: form.from_date,
          to_date: form.to_date,
          reason: form.reason || undefined,
        },
      });
      setForm(emptyForm);
      leaves.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  async function updateLeaveStatus(id: string, status: "approved" | "rejected") {
    setSaving(true);
    setFormError(null);
    try {
      await apiClient(`/api/v1/staff/leave-requests/${id}/status`, { method: "PATCH", body: { status } });
      leaves.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  const combinedError = staff.error ?? attendance.error ?? leaves.error ?? payslips.error;
  const combinedLoading = staff.loading || attendance.loading || leaves.loading || payslips.loading;

  const memberStatus = (v: string | null) => (v && MEMBER_STATUS_KEYS.includes(v) ? t(`val.${v}`) : (v ?? "-"));
  const attStatus = (v: string | null) => (v && ATTENDANCE_STATUS_KEYS.includes(v) ? t(`val.${v}`) : (v ?? "-"));
  const leaveStatus = (v: string | null) => (v && LEAVE_STATUS_KEYS.includes(v) ? t(`val.${v}`) : (v ?? "-"));

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "directory", label: t("staff.tab.directory"), count: members.length },
    { key: "attendance", label: t("staff.tab.attendance"), count: attendance.data?.attendance.length ?? 0 },
    { key: "leaves", label: t("staff.tab.leaves"), count: leaves.data?.leaves.length ?? 0 },
    { key: "payroll", label: t("staff.tab.payroll"), count: payslips.data?.payslips.length ?? 0 },
  ];

  const addLabel = showForm
    ? t("common.cancel")
    : tab === "directory"
      ? t("staff.add")
      : tab === "attendance"
        ? t("staff.addAttendance")
        : tab === "leaves"
          ? t("staff.addLeave")
          : null;

  function exportDirectory() {
    const headers = [t("staff.col.name"), t("staff.col.designation"), t("staff.col.department"), t("staff.col.subject"), t("staff.col.joined"), t("staff.col.status")];
    const rows = members.map((m) => [
      m.full_name,
      m.designation ?? "",
      m.department ?? "",
      m.subject ?? "",
      (m.join_date ?? "").slice(0, 10),
      m.status ?? "",
    ]);
    exportCsv("staff.csv", headers, rows);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("staff.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("staff.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {tab === "directory" && members.length ? (
            <button type="button" onClick={exportDirectory} className={buttonClasses("secondary")}>
              <Download className="h-4 w-4" /> {t("common.exportCsv")}
            </button>
          ) : null}
          {addLabel ? (
            <button type="button" onClick={() => setShowForm((s) => !s)} className={buttonClasses("primary")}>
              {addLabel}
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 pb-px dark:border-slate-800">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => { setTab(tb.key); setShowForm(false); }}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
              tab === tb.key
                ? "border-b-2 border-indigo-600 bg-indigo-50/60 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tb.label} <span className="ml-1 text-xs text-slate-400">{tb.count}</span>
          </button>
        ))}
      </div>

      <PageState state={{ loading: combinedLoading, error: combinedError }} />

      {showForm ? renderForm() : null}

      {tab === "directory" && members.length ? (
        <Card>
          <CardHeader title={t("staff.directory.title").replace("{n}", String(members.length))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("staff.col.name"), t("staff.col.designation"), t("staff.col.department"), t("staff.col.subject"), t("staff.col.joined"), t("staff.col.status")]}
              rows={members.map((m) => [
                <div key={`${m.id}-n`}>
                  <div className="font-medium text-slate-800 dark:text-slate-100">{m.full_name}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">{m.email ?? m.phone ?? m.staff_unique_id}</div>
                </div>,
                m.designation ?? "—",
                m.department ?? "—",
                m.subject ?? "—",
                (m.join_date ?? "").slice(0, 10) || "—",
                <Badge key={`${m.id}-s`} tone={m.status === "active" ? "green" : "slate"}>{memberStatus(m.status)}</Badge>,
              ])}
            />
          </div>
        </Card>
      ) : null}

      {tab === "attendance" && attendance.data?.attendance.length ? (
        <Card>
          <CardHeader title={t("staff.attendance.title").replace("{n}", String(attendance.data.attendance.length))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("staff.col.staff"), t("staff.col.date"), t("staff.col.checkIn"), t("staff.col.checkOut"), t("staff.col.hours"), t("field.status")]}
              rows={attendance.data.attendance.map((a) => [
                staffName(a.staff_id),
                (a.attendance_date ?? "").slice(0, 10) || "-",
                a.check_in ?? "—",
                a.check_out ?? "—",
                a.working_hours ?? "—",
                <Badge key={`${a.id}-s`} tone={a.status === "present" ? "green" : a.status === "absent" ? "rose" : "amber"}>{attStatus(a.status)}</Badge>,
              ])}
            />
          </div>
        </Card>
      ) : null}

      {tab === "leaves" && leaves.data?.leaves.length ? (
        <Card>
          <CardHeader title={t("staff.leave.title").replace("{n}", String(leaves.data.leaves.length))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("staff.col.staff"), t("field.type"), t("staff.col.period"), t("field.status"), t("staff.col.reason"), t("staff.col.actions")]}
              rows={leaves.data.leaves.map((l) => [
                staffName(l.staff_id),
                l.leave_type ? (LEAVE_TYPE_KEYS.includes(l.leave_type) ? t(`val.${l.leave_type}`) : l.leave_type) : "—",
                `${(l.from_date ?? "").slice(0, 10)} → ${(l.to_date ?? "").slice(0, 10)}`,
                <Badge key={`${l.id}-s`} tone={l.status === "approved" ? "green" : l.status === "rejected" ? "rose" : "amber"}>{leaveStatus(l.status)}</Badge>,
                l.reason ?? "—",
                l.status === "pending" ? (
                  <span key={`${l.id}-a`} className="flex gap-2">
                    <button type="button" disabled={saving} onClick={() => updateLeaveStatus(l.id, "approved")} className={buttonClasses("primary")}>{t("staff.leave.approve")}</button>
                    <button type="button" disabled={saving} onClick={() => updateLeaveStatus(l.id, "rejected")} className={buttonClasses("danger")}>{t("staff.leave.reject")}</button>
                  </span>
                ) : (
                  <span key={`${l.id}-a`}>—</span>
                ),
              ])}
            />
          </div>
        </Card>
      ) : null}

      {tab === "payroll" && !payslips.data?.payslips.length ? (
        <Card>
          <CardHeader title={t("staff.payroll.none")} subtitle={t("staff.payroll.noneHint")} />
        </Card>
      ) : tab === "payroll" ? (
        <Card>
          <CardHeader title={t("staff.payroll.title").replace("{n}", String(payslips.data?.payslips.length ?? 0))} />
          <div className="overflow-x-auto">
            <Table
              headers={[t("staff.col.staff"), t("staff.col.month"), t("staff.col.gross"), t("staff.col.deductions"), t("staff.col.net"), t("field.status")]}
              rows={(payslips.data?.payslips ?? []).map((p) => [
                staffName(p.staff_id),
                `${p.month ?? "-"} ${p.year ?? ""}`,
                p.gross_pay != null ? `₹ ${p.gross_pay}` : "—",
                p.deductions != null ? `₹ ${p.deductions}` : "—",
                p.net_pay != null ? <span className="font-medium text-slate-800 dark:text-slate-100">₹ {p.net_pay}</span> : "—",
                <Badge key={`${p.id}-s`} tone={p.status === "paid" ? "green" : "amber"}>{p.status ? t(`val.${p.status}`, p.status) : "-"}</Badge>,
              ])}
            />
          </div>
        </Card>
      ) : null}
    </div>
  );

  function renderForm() {
    if (tab === "directory") {
      return (
        <Card>
          <CardHeader title={t("staff.directory.add")} />
          <form onSubmit={submitMember} className="grid gap-4 p-6 sm:grid-cols-3">
            <Field label={`${t("field.fullName")} *`} value={form.full_name} onChange={(v) => setF("full_name", v)} required />
            <Field label={t("field.email")} value={form.email} onChange={(v) => setF("email", v)} />
            <Field label={t("field.phone")} value={form.phone} onChange={(v) => setF("phone", v)} />
            <Field label={t("staff.fields.staffId")} value={form.staff_unique_id} onChange={(v) => setF("staff_unique_id", v)} />
            <Field label={t("field.designation")} value={form.designation} onChange={(v) => setF("designation", v)} placeholder="e.g. Teacher" />
            <Field label={t("field.department")} value={form.department} onChange={(v) => setF("department", v)} />
            <Field label={t("field.subject")} value={form.subject} onChange={(v) => setF("subject", v)} />
            <Field label={t("field.qualification")} value={form.qualification} onChange={(v) => setF("qualification", v)} />
            <Field label={t("staff.fields.joinDate")} value={form.join_date} onChange={(v) => setF("join_date", v)} placeholder="YYYY-MM-DD" />
            <div>
              <label className={labelCls}>{t("field.gender")}</label>
              <select value={form.gender} onChange={(e) => setF("gender", e.target.value)} className={inputCls}>
                {["", "male", "female", "other"].map((g) => <option key={g} value={g}>{g ? t(`val.${g}`) : "—"}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t("field.employmentType")}</label>
              <select value={form.employment_type} onChange={(e) => setF("employment_type", e.target.value)} className={inputCls}>
                {["", "full_time", "part_time", "contract"].map((v) => <option key={v} value={v}>{v ? (EMPLOYMENT_KEYS.includes(v) ? t(`val.${v}`) : v) : "—"}</option>)}
              </select>
            </div>
            <Field label={t("field.salary")} value={form.salary} onChange={(v) => setF("salary", v)} placeholder="e.g. 45000" />
            <div>
              <label className={labelCls}>{t("field.status")}</label>
              <select value={form.status} onChange={(e) => setF("status", e.target.value)} className={inputCls}>
                {["active", "inactive", "on_leave"].map((s) => <option key={s} value={s}>{t(`val.${s}`)}</option>)}
              </select>
            </div>
            {formErrorRender()}
            <div className="sm:col-span-3">
              <button type="submit" disabled={saving} className={buttonClasses("primary")}>{saving ? t("staff.directory.creating") : t("staff.directory.create")}</button>
            </div>
          </form>
        </Card>
      );
    }
    if (tab === "attendance") {
      return (
        <Card>
          <CardHeader title={t("staff.attendance.mark")} />
          <form onSubmit={submitAttendance} className="grid gap-4 p-6 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className={labelCls}>{t("staff.col.staff")} *</label>
              <select required value={form.staff_id ?? ""} onChange={(e) => setF("staff_id", e.target.value)} className={inputCls}>
                <option value="">{t("staff.attendance.select")}</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
              </select>
            </div>
            <Field label={`${t("field.date")} *`} value={form.attendance_date ?? ""} onChange={(v) => setF("attendance_date", v)} required placeholder="YYYY-MM-DD" />
            <Field label={t("field.checkIn")} value={form.check_in ?? ""} onChange={(v) => setF("check_in", v)} placeholder="HH:MM" />
            <Field label={t("field.checkOut")} value={form.check_out ?? ""} onChange={(v) => setF("check_out", v)} placeholder="HH:MM" />
            <div>
              <label className={labelCls}>{t("field.status")}</label>
              <select value={form.status ?? "present"} onChange={(e) => setF("status", e.target.value)} className={inputCls}>
                {["present", "absent", "late", "half_day", "leave"].map((s) => <option key={s} value={s}>{ATTENDANCE_STATUS_KEYS.includes(s) ? t(`val.${s}`) : s}</option>)}
              </select>
            </div>
            <Field label={t("field.remarks")} value={form.remarks ?? ""} onChange={(v) => setF("remarks", v)} />
            {formErrorRender()}
            <div className="sm:col-span-3">
              <button type="submit" disabled={saving} className={buttonClasses("primary")}>{saving ? t("staff.attendance.saving") : t("staff.attendance.save")}</button>
            </div>
          </form>
        </Card>
      );
    }
    return (
      <Card>
        <CardHeader title={t("staff.leave.modalTitle")} />
        <form onSubmit={submitLeave} className="grid gap-4 p-6 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className={labelCls}>{t("staff.col.staff")} *</label>
            <select required value={form.staff_id ?? ""} onChange={(e) => setF("staff_id", e.target.value)} className={inputCls}>
              <option value="">{t("staff.attendance.select")}</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </select>
          </div>
          <Field label={t("staff.leave.type")} value={form.leave_type ?? "casual"} onChange={(v) => setF("leave_type", v)} />
          <Field label={`${t("field.origin")} *`} value={form.from_date ?? ""} onChange={(v) => setF("from_date", v)} required placeholder="YYYY-MM-DD" />
          <Field label={`${t("field.dest")} *`} value={form.to_date ?? ""} onChange={(v) => setF("to_date", v)} required placeholder="YYYY-MM-DD" />
          <div className="sm:col-span-3">
            <Field label={t("staff.leave.reason")} value={form.reason ?? ""} onChange={(v) => setF("reason", v)} />
            {formErrorRender()}
          </div>
          <div className="sm:col-span-3">
            <button type="submit" disabled={saving} className={buttonClasses("primary")}>{saving ? t("staff.attendance.saving") : t("staff.leave.submit")}</button>
          </div>
        </form>
      </Card>
    );
  }

  function setF<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function formErrorRender() {
    return formError ? <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-3 dark:bg-rose-950/40 dark:text-rose-300">{formError}</div> : null;
  }
}

const labelCls = "mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300";
const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder={placeholder} required={required} />
    </div>
  );
}