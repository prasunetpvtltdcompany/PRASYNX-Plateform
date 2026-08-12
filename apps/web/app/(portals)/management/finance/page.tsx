"use client";

import { useState, type FormEvent } from "react";
import type { ClassDTO, FeePaymentDTO, FeeStructureDTO, Paginated, StudentFeeDTO, StudentFinanceStatementDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { apiClient } from "@/lib/api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { buttonClasses } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const feeStatusTone: Record<string, "slate" | "green" | "amber" | "rose"> = {
  pending: "amber",
  partial: "amber",
  paid: "green",
  overdue: "rose",
  waived: "slate",
};

const PAYMENT_METHODS = ["cash", "card", "bank_transfer", "online", "cheque"];

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";
const labelCls = "block text-sm font-medium text-slate-600 dark:text-slate-300";

function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder={placeholder} required={required} />
    </div>
  );
}

export default function ManagementFinancePage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<"structures" | "statement">("structures");
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const structures = useApi<Paginated<FeeStructureDTO>>("/api/v1/finance/structures?page=1&pageSize=100");
  const classes = useApi<Paginated<ClassDTO>>("/api/v1/classes?page=1&pageSize=100");
  const students = useApi<{ students: Array<{ id: string; full_name: string; roll_number: string | null }> }>("/api/v1/students");
  const [statementStudentId, setStatementStudentId] = useState<string>("");
  const statement = useApi<{ statement: StudentFinanceStatementDTO }>(
    tab === "statement" && statementStudentId ? `/api/v1/finance/students?student_id=${statementStudentId}` : null,
  );
  const [feeDetail, setFeeDetail] = useState<{ fee: StudentFeeDTO; payments: FeePaymentDTO[] } | null>(null);
  const [payFeeId, setPayFeeId] = useState<string>("");
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [payTxn, setPayTxn] = useState("");

  const [createForm, setCreateForm] = useState({ name: "", class_id: "", academic_year: "", items: [{ item_name: "", amount: "" }] });
  const [assignForm, setAssignForm] = useState({ structure_id: "", class_id: "", due_date: "" });
  const [assignStudentIds, setAssignStudentIds] = useState<string[]>([]);

  const className = (id: string) => classes.data?.data.find((c) => c.id === id)?.name ?? id.slice(0, 8);
  const studentName = (id: string) => students.data?.students.find((s) => s.id === id)?.full_name ?? id.slice(0, 8);

  async function submitCreate(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    const items = createForm.items.filter((i) => i.item_name && i.amount !== "").map((i) => ({ item_name: i.item_name, amount: Number(i.amount) }));
    if (!items.length) {
      setFormError(t("common.error"));
      setSaving(false);
      return;
    }
    try {
      await apiClient("/api/v1/finance/structures", {
        method: "POST",
        body: {
          name: createForm.name,
          class_id: createForm.class_id || null,
          academic_year: createForm.academic_year || null,
          items,
        },
      });
      setCreateForm({ name: "", class_id: "", academic_year: "", items: [{ item_name: "", amount: "" }] });
      setShowCreate(false);
      structures.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  function pickAssignClass(classId: string) {
    setAssignForm((f) => ({ ...f, class_id: classId }));
    const roster = students.data?.students ?? [];
    setAssignStudentIds(classId ? roster.map((s) => s.id) : []);
  }

  async function submitAssign(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    if (!assignStudentIds.length) {
      setFormError(t("common.error"));
      setSaving(false);
      return;
    }
    try {
      await apiClient("/api/v1/finance/assign", {
        method: "POST",
        body: {
          fee_structure_id: assignForm.structure_id,
          student_ids: assignStudentIds,
          due_date: assignForm.due_date || null,
        },
      });
      setShowAssign(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  async function openFeeDetail(id: string) {
    setPayFeeId(id);
    setShowPayment((cur) => (cur === id ? null : id));
    if (feeDetail?.fee.id !== id) {
      setFeeDetail(null);
      try {
        const res = await apiClient<{ fee: StudentFeeDTO; payments: FeePaymentDTO[] }>(`/api/v1/finance/fee/${id}`);
        setFeeDetail(res);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : t("common.error"));
      }
    }
  }

  async function submitPayment(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const res = await apiClient<{ payment: FeePaymentDTO; fee: StudentFeeDTO }>("/api/v1/finance/payments", {
        method: "POST",
        body: {
          student_fee_id: payFeeId,
          amount_paid: Number(payAmount),
          payment_method: payMethod,
          transaction_id: payTxn || null,
        },
      });
      setPayAmount("");
      setPayTxn("");
      setShowPayment(null);
      setFeeDetail((d) => (d ? { ...d, fee: res.fee } : d));
      if (statementStudentId) statement.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  const tabs: { key: "structures" | "statement"; label: string }[] = [
    { key: "structures", label: t("finance.tab.structures") },
    { key: "statement", label: t("finance.tab.statement") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("finance.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("finance.subtitle")}</p>
        </div>
        {tab === "structures" ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowCreate(true)} className={buttonClasses("primary")}>
              {t("finance.createStructure")}
            </button>
            <button type="button" onClick={() => setShowAssign(true)} className={buttonClasses("secondary")}>
              {t("finance.assignFees")}
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tb) => (
          <button key={tb.key} type="button" onClick={() => setTab(tb.key)} className={buttonClasses(tab === tb.key ? "primary" : "secondary")}>
            {tb.label}
          </button>
        ))}
      </div>

      {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}

      {tab === "structures" ? (
        <>
          {showCreate ? (
            <Card>
              <CardHeader title={t("finance.createStructure")} />
              <form onSubmit={submitCreate} className="grid gap-4 p-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label={`${t("field.name")} *`} value={createForm.name} onChange={(v) => setCreateForm((f) => ({ ...f, name: v }))} required />
                </div>
                <div>
                  <label className={labelCls}>{t("field.class")}</label>
                  <select value={createForm.class_id} onChange={(e) => setCreateForm((f) => ({ ...f, class_id: e.target.value }))} className={inputCls}>
                    <option value="">—</option>
                    {classes.data?.data.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Field label={t("finance.academicYear")} value={createForm.academic_year} onChange={(v) => setCreateForm((f) => ({ ...f, academic_year: v }))} placeholder="e.g. 2026-27" />
                <div className="sm:col-span-2">
                  <div className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">{t("finance.items")}</div>
                  <div className="space-y-2">
                    {createForm.items.map((item, i) => (
                      <div key={i} className="grid gap-2 sm:grid-cols-3">
                        <input
                          value={item.item_name}
                          onChange={(e) => setCreateForm((f) => ({ ...f, items: f.items.map((it, j) => (j === i ? { ...it, item_name: e.target.value } : it)) }))}
                          className={inputCls}
                          placeholder={t("finance.itemName")}
                        />
                        <input
                          value={item.amount}
                          onChange={(e) => setCreateForm((f) => ({ ...f, items: f.items.map((it, j) => (j === i ? { ...it, amount: e.target.value } : it)) }))}
                          className={inputCls}
                          placeholder={t("field.total")}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreateForm((f) => ({ ...f, items: [...f.items, { item_name: "", amount: "" }] }))}
                    className={buttonClasses("secondary")}
                  >
                    {t("exams.addRow")}
                  </button>
                </div>
                <div className="flex gap-2 sm:col-span-2">
                  <button type="submit" disabled={saving} className={buttonClasses("primary")}>
                    {saving ? t("common.save") : t("common.create")}
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className={buttonClasses("secondary")}>
                    {t("common.cancel")}
                  </button>
                </div>
              </form>
            </Card>
          ) : null}

          {showAssign ? (
            <Card>
              <CardHeader title={t("finance.assignFees")} />
              <form onSubmit={submitAssign} className="grid gap-4 p-5 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>{t("finance.col.structure")} *</label>
                  <select value={assignForm.structure_id} onChange={(e) => setAssignForm((f) => ({ ...f, structure_id: e.target.value }))} className={inputCls} required>
                    <option value="">{t("finance.selectStructure")}</option>
                    {structures.data?.data.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — ₹{s.total_amount}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{t("field.class")}</label>
                  <select value={assignForm.class_id} onChange={(e) => pickAssignClass(e.target.value)} className={inputCls}>
                    <option value="">{t("finance.allStudents")}</option>
                    {classes.data?.data.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Field label={t("field.due")} value={assignForm.due_date} onChange={(v) => setAssignForm((f) => ({ ...f, due_date: v }))} placeholder="YYYY-MM-DD" />
                <div className="sm:col-span-2">
                  <div className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    {t("finance.selectedStudents").replace("{n}", String(assignStudentIds.length))}
                  </div>
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                    {assignStudentIds.map((id) => (
                      <div key={id} className="flex items-center gap-2">
                        <input type="checkbox" checked onChange={() => setAssignStudentIds((ids) => ids.filter((x) => x !== id))} className="h-4 w-4" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{studentName(id)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 sm:col-span-2">
                  <button type="submit" disabled={saving} className={buttonClasses("primary")}>
                    {saving ? t("common.save") : t("finance.assignFees")}
                  </button>
                  <button type="button" onClick={() => setShowAssign(false)} className={buttonClasses("secondary")}>
                    {t("common.cancel")}
                  </button>
                </div>
              </form>
            </Card>
          ) : null}

          <PageState state={{ loading: structures.loading, error: structures.error }} />

          {structures.data ? (
            <Card>
              <CardHeader title={`${t("finance.col.structure")} (${structures.data.total})`} />
              <Table
                headers={[t("field.name"), t("field.class"), t("finance.academicYear"), t("field.total"), t("field.status")]}
                rows={structures.data.data.map((s) => [
                  s.name,
                  s.class_id ? className(s.class_id) : "—",
                  s.academic_year ?? "—",
                  `₹ ${s.total_amount.toFixed(2)}`,
                  <Badge key={`${s.id}-s`} tone={s.status === "active" ? "green" : "slate"}>
                    {t(`val.${s.status}`, s.status)}
                  </Badge>,
                ])}
              />
            </Card>
          ) : null}
        </>
      ) : (
        <>
          <Card>
            <CardHeader title={t("finance.selectStudent")} />
            <select
              value={statementStudentId}
              onChange={(e) => setStatementStudentId(e.target.value)}
              className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">{t("finance.selectStudent")}</option>
              {students.data?.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                  {s.roll_number ? ` (${s.roll_number})` : ""}
                </option>
              ))}
            </select>
          </Card>

          <PageState state={{ loading: statement.loading, error: statement.error }} />

          {statement.data?.statement ? (
            <>
              <Card>
                <CardHeader
                  title={t("finance.statement")}
                  subtitle={t("finance.changed")
                    .replace("{n}", String(statement.data.statement.total_charged))
                    .replace("{n}", String(statement.data.statement.total_paid))
                    .replace("{n}", String(statement.data.statement.outstanding))}
                />
                <Table
                  headers={[t("finance.col.structure"), t("field.total"), t("field.paid"), t("field.status"), t("field.due"), ""]}
                  rows={statement.data.statement.fees.map((f) => [
                    f.structure_name ?? "—",
                    `₹ ${f.total_amount.toFixed(2)}`,
                    `₹ ${f.paid_amount.toFixed(2)}`,
                    <Badge key={`${f.id}-s`} tone={feeStatusTone[f.status] ?? "slate"}>
                      {t(`val.${f.status}`, f.status)}
                    </Badge>,
                    f.due_date ?? "—",
                    <button key={`${f.id}-o`} type="button" onClick={() => openFeeDetail(f.id)} className={buttonClasses("secondary")}>
                      {showPayment === f.id ? t("common.close") : t("finance.recordPayment")}
                    </button>,
                  ])}
                />
              </Card>

              {showPayment && feeDetail ? (
                <Card>
                  <CardHeader title={`${t("finance.recordPayment")} — ${studentName(feeDetail.fee.student_id)}`} />
                  <div className="space-y-4 p-5">
                    {feeDetail.payments.length ? (
                      <Table
                        headers={[t("field.date"), t("field.amount"), t("finance.col.method"), t("finance.col.txn")]}
                        rows={feeDetail.payments.map((p) => [
                          (p.payment_date ?? "").slice(0, 10),
                          `₹ ${p.amount_paid.toFixed(2)}`,
                          t(`val.${p.payment_method}`, p.payment_method),
                          p.transaction_id ?? "—",
                        ])}
                      />
                    ) : (
                      <p className="text-sm text-slate-500">{t("finance.noPayments")}</p>
                    )}
                    <form onSubmit={submitPayment} className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>{t("finance.balance")}</label>
                        <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                          ₹ {Math.max(0, feeDetail.fee.total_amount - feeDetail.fee.paid_amount).toFixed(2)}
                        </div>
                      </div>
                      <Field label={`${t("field.amount")} *`} value={payAmount} onChange={setPayAmount} required />
                      <div>
                        <label className={labelCls}>{t("finance.col.method")} *</label>
                        <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className={inputCls}>
                          {PAYMENT_METHODS.map((m) => (
                            <option key={m} value={m}>
                              {t(`val.${m}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Field label={t("finance.col.txn")} value={payTxn} onChange={setPayTxn} placeholder="optional" />
                      <div className="flex gap-2 sm:col-span-2">
                        <button type="submit" disabled={saving} className={buttonClasses("primary")}>
                          {saving ? t("common.save") : t("finance.recordPayment")}
                        </button>
                        <button type="button" onClick={() => setShowPayment(null)} className={buttonClasses("secondary")}>
                          {t("common.cancel")}
                        </button>
                      </div>
                    </form>
                  </div>
                </Card>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
