"use client";

import { useState, type FormEvent } from "react";
import type { ClassDTO, ExamDetailDTO, ExamDTO, Paginated, SubjectDTO, ExamType, ExamStatus } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { apiClient } from "@/lib/api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { buttonClasses } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const statusTone: Record<string, "slate" | "green" | "amber" | "rose"> = {
  upcoming: "amber",
  ongoing: "green",
  completed: "slate",
};

const EXAM_TYPES: ExamType[] = ["midterm", "final", "quiz", "unit_test", "practical"];
const STATUSES: ExamStatus[] = ["upcoming", "ongoing", "completed"];

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";
const labelCls = "block text-sm font-medium text-slate-600 dark:text-slate-300";

interface ScheduleRow {
  class_id: string;
  subject_id: string;
  date: string;
  start_time: string;
  end_time: string;
  room: string;
}

interface ResultRow {
  student_id: string;
  subject_id: string;
  marks_obtained: string;
  max_marks: string;
  grade: string;
}

function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder={placeholder} required={required} />
    </div>
  );
}

export default function ManagementExamsPage() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const listQuery = `/api/v1/exams?page=1&pageSize=100${filter ? `&status=${filter}` : ""}`;
  const exams = useApi<Paginated<ExamDTO & { status: string }>>(listQuery);
  const classes = useApi<Paginated<ClassDTO>>("/api/v1/classes?page=1&pageSize=100");
  const subjects = useApi<Paginated<SubjectDTO>>("/api/v1/subjects?page=1&pageSize=100");
  const detail = useApi<{ exam: ExamDetailDTO }>(selectedId ? `/api/v1/exams/${selectedId}` : null);
  const [rosterClassId, setRosterClassId] = useState<string>("");
  const roster = useApi<{ roster: { students: Array<{ id: string; full_name: string; roll_number: string | null }> } }>(
    showResults && rosterClassId ? `/api/v1/attendance/roster?class_id=${rosterClassId}` : null,
  );

  const [createForm, setCreateForm] = useState({ name: "", exam_type: "midterm", start_date: "", end_date: "", max_marks: "100" });
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([emptyScheduleRow()]);
  const [resultRows, setResultRows] = useState<ResultRow[]>([]);

  function emptyScheduleRow(): ScheduleRow {
    return { class_id: "", subject_id: "", date: "", start_time: "", end_time: "", room: "" };
  }

  const className = (id: string) => classes.data?.data.find((c) => c.id === id)?.name ?? id.slice(0, 8);
  const subjectName = (id: string) => subjects.data?.data.find((s) => s.id === id)?.name ?? id.slice(0, 8);

  async function submitCreate(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await apiClient("/api/v1/exams", {
        method: "POST",
        body: {
          name: createForm.name,
          exam_type: createForm.exam_type,
          start_date: createForm.start_date || null,
          end_date: createForm.end_date || null,
          max_marks: Number(createForm.max_marks),
        },
      });
      setCreateForm({ name: "", exam_type: "midterm", start_date: "", end_date: "", max_marks: "100" });
      setShowCreate(false);
      exams.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  async function submitSchedule(event: FormEvent) {
    event.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    setFormError(null);
    try {
      await apiClient(`/api/v1/exams/${selectedId}/schedule`, {
        method: "POST",
        body: {
          entries: scheduleRows.map((r) => ({
            class_id: r.class_id,
            subject_id: r.subject_id,
            date: r.date,
            start_time: r.start_time || null,
            end_time: r.end_time || null,
            room: r.room || null,
          })),
        },
      });
      setScheduleRows([emptyScheduleRow()]);
      setShowSchedule(false);
      detail.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  function pickRosterClass(classId: string) {
    setRosterClassId(classId);
    setResultRows((roster.data?.roster.students ?? []).map((s) => ({ student_id: s.id, subject_id: "", marks_obtained: "", max_marks: "", grade: "" })));
  }

  async function submitResults(event: FormEvent) {
    event.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    setFormError(null);
    const rows = resultRows.filter((r) => r.student_id && r.marks_obtained !== "" && r.subject_id);
    if (!rows.length) {
      setFormError(t("common.error"));
      setSaving(false);
      return;
    }
    try {
      await apiClient(`/api/v1/exams/${selectedId}/results`, {
        method: "POST",
        body: {
          exam_id: selectedId,
          results: rows.map((r) => ({
            student_id: r.student_id,
            subject_id: r.subject_id,
            marks_obtained: Number(r.marks_obtained),
            max_marks: r.max_marks ? Number(r.max_marks) : undefined,
            grade: r.grade || undefined,
          })),
        },
      });
      setShowResults(false);
      detail.reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  const selected = detail.data?.exam;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("exams.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("exams.subtitle")}</p>
        </div>
        <button type="button" onClick={() => setShowCreate(true)} className={buttonClasses("primary")}>
          {t("exams.createTitle")}
        </button>
      </div>

      <PageState state={{ loading: exams.loading, error: exams.error }} />

      {showCreate ? (
        <Card>
          <CardHeader title={t("exams.createTitle")} />
          <form onSubmit={submitCreate} className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label={`${t("field.name")} *`} value={createForm.name} onChange={(v) => setCreateForm((f) => ({ ...f, name: v }))} required />
            </div>
            <div>
              <label className={labelCls}>{t("field.type")} *</label>
              <select value={createForm.exam_type} onChange={(e) => setCreateForm((f) => ({ ...f, exam_type: e.target.value }))} className={inputCls}>
                {EXAM_TYPES.map((et) => (
                  <option key={et} value={et}>
                    {t(`val.${et}`)}
                  </option>
                ))}
              </select>
            </div>
            <Field label={t("field.maxMarks")} value={createForm.max_marks} onChange={(v) => setCreateForm((f) => ({ ...f, max_marks: v }))} placeholder="100" />
            <Field label={t("field.starts")} value={createForm.start_date} onChange={(v) => setCreateForm((f) => ({ ...f, start_date: v }))} placeholder="YYYY-MM-DD" />
            <Field label={t("field.date")} value={createForm.end_date} onChange={(v) => setCreateForm((f) => ({ ...f, end_date: v }))} placeholder="YYYY-MM-DD" />
            {formError ? <p className="text-sm text-rose-600 sm:col-span-2">{formError}</p> : null}
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

      {exams.data ? (
        <Card>
          <CardHeader title={`${t("exams.title")} (${exams.data.total})`} />
          <div className="flex flex-wrap gap-2 px-5 pb-2">
            <button
              type="button"
              onClick={() => setFilter("")}
              className={buttonClasses(filter === "" ? "primary" : "secondary")}
            >
              {t("exams.filterAll")}
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={buttonClasses(filter === s ? "primary" : "secondary")}
              >
                {t(`exams.filter${s.charAt(0).toUpperCase()}${s.slice(1)}`)}
              </button>
            ))}
          </div>
          <Table
            headers={[t("field.name"), t("field.type"), t("field.maxMarks"), t("field.status"), t("field.starts"), ""]}
            rows={exams.data.data.map((e) => [
              e.name,
              t(`val.${e.exam_type}`, e.exam_type),
              String(e.max_marks),
              <Badge key={`${e.id}-s`} tone={statusTone[e.status] ?? "slate"}>
                {t(`val.${e.status}`)}
              </Badge>,
              (e.start_date ?? "—").slice(0, 10),
              <button
                key={`${e.id}-o`}
                type="button"
                onClick={() => setSelectedId(selectedId === e.id ? null : e.id)}
                className={buttonClasses("secondary")}
              >
                {selectedId === e.id ? t("common.close") : t("exams.details")}
              </button>,
            ])}
          />
        </Card>
      ) : null}

      {selected ? (
        <>
          <Card>
            <CardHeader title={`${t("exams.details")}: ${selected.name}`} />
            <div className="grid gap-4 p-5 sm:grid-cols-4">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{t("field.type")}</div>
                <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">{t(`val.${selected.exam_type}`, selected.exam_type)}</div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{t("field.status")}</div>
                <div className="mt-1">
                  <Badge tone={statusTone[selected.status] ?? "slate"}>{t(`val.${selected.status}`)}</Badge>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{t("field.maxMarks")}</div>
                <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">{selected.max_marks}</div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{t("field.starts")}</div>
                <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                  {(selected.start_date ?? "—").slice(0, 10)}
                  {selected.end_date ? ` → ${(selected.end_date ?? "").slice(0, 10)}` : ""}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 px-5 pb-5">
              <button type="button" onClick={() => setShowSchedule((v) => !v)} className={buttonClasses("primary")}>
                {t("exams.addSchedule")}
              </button>
              <button type="button" onClick={() => setShowResults((v) => !v)} className={buttonClasses("primary")}>
                {t("exams.recordResults")}
              </button>
            </div>
          </Card>

          {showSchedule ? (
            <Card>
              <CardHeader title={t("exams.addSchedule")} />
              <form onSubmit={submitSchedule} className="space-y-4 p-5">
                {scheduleRows.map((row, i) => (
                  <div key={i} className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-3 lg:grid-cols-6 dark:border-slate-700">
                    <div>
                      <label className={labelCls}>{t("field.class")} *</label>
                      <select
                        value={row.class_id}
                        onChange={(e) => setScheduleRows((rows) => rows.map((r, j) => (j === i ? { ...r, class_id: e.target.value } : r)))}
                        className={inputCls}
                      >
                        <option value="">{t("exams.selectClass")}</option>
                        {classes.data?.data.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>{t("field.subject")} *</label>
                      <select
                        value={row.subject_id}
                        onChange={(e) => setScheduleRows((rows) => rows.map((r, j) => (j === i ? { ...r, subject_id: e.target.value } : r)))}
                        className={inputCls}
                      >
                        <option value="">{t("exams.selectSubject")}</option>
                        {subjects.data?.data.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Field label={`${t("field.date")} *`} value={row.date} onChange={(v) => setScheduleRows((rows) => rows.map((r, j) => (j === i ? { ...r, date: v } : r)))} placeholder="YYYY-MM-DD" />
                    <Field label={t("exams.startTime")} value={row.start_time} onChange={(v) => setScheduleRows((rows) => rows.map((r, j) => (j === i ? { ...r, start_time: v } : r)))} placeholder="HH:MM" />
                    <Field label={t("exams.endTime")} value={row.end_time} onChange={(v) => setScheduleRows((rows) => rows.map((r, j) => (j === i ? { ...r, end_time: v } : r)))} placeholder="HH:MM" />
                    <Field label={t("field.room")} value={row.room} onChange={(v) => setScheduleRows((rows) => rows.map((r, j) => (j === i ? { ...r, room: v } : r)))} />
                  </div>
                ))}
                <button type="button" onClick={() => setScheduleRows((rows) => [...rows, emptyScheduleRow()])} className={buttonClasses("secondary")}>
                  {t("exams.addRow")}
                </button>
                {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className={buttonClasses("primary")}>
                    {saving ? t("common.save") : t("common.save")}
                  </button>
                  <button type="button" onClick={() => setShowSchedule(false)} className={buttonClasses("secondary")}>
                    {t("common.cancel")}
                  </button>
                </div>
              </form>
            </Card>
          ) : null}

          {showResults ? (
            <Card>
              <CardHeader title={t("exams.recordResults")} />
              <div className="space-y-4 p-5">
                <div>
                  <label className={labelCls}>{t("field.class")}</label>
                  <select value={rosterClassId} onChange={(e) => pickRosterClass(e.target.value)} className={inputCls}>
                    <option value="">{t("exams.selectClass")}</option>
                    {classes.data?.data.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                {roster.data && resultRows.length > 0 ? (
                  <form onSubmit={submitResults} className="space-y-3">
                    {resultRows.map((row, i) => (
                      <div key={row.student_id} className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-4 lg:grid-cols-6 dark:border-slate-700">
                        <div className="sm:col-span-2">
                          <label className={labelCls}>{t("field.student")}</label>
                          <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                            {roster.data?.roster.students.find((s) => s.id === row.student_id)?.full_name ?? "—"}
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>{t("field.subject")} *</label>
                          <select
                            value={row.subject_id}
                            onChange={(e) => setResultRows((rows) => rows.map((r, j) => (j === i ? { ...r, subject_id: e.target.value } : r)))}
                            className={inputCls}
                          >
                            <option value="">{t("exams.selectSubject")}</option>
                            {subjects.data?.data.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Field label={t("exams.marksObtained")} value={row.marks_obtained} onChange={(v) => setResultRows((rows) => rows.map((r, j) => (j === i ? { ...r, marks_obtained: v } : r)))} />
                        <Field label={t("field.maxMarks")} value={row.max_marks} onChange={(v) => setResultRows((rows) => rows.map((r, j) => (j === i ? { ...r, max_marks: v } : r)))} placeholder="100" />
                        <Field label={t("exams.grade")} value={row.grade} onChange={(v) => setResultRows((rows) => rows.map((r, j) => (j === i ? { ...r, grade: v } : r)))} />
                      </div>
                    ))}
                    {formError ? <p className="text-sm text-rose-600">{formError}</p> : null}
                    <div className="flex gap-2">
                      <button type="submit" disabled={saving} className={buttonClasses("primary")}>
                        {saving ? t("common.save") : t("common.save")}
                      </button>
                      <button type="button" onClick={() => setShowResults(false)} className={buttonClasses("secondary")}>
                        {t("common.cancel")}
                      </button>
                    </div>
                  </form>
                ) : null}
              </div>
            </Card>
          ) : null}

          {selected.schedules.length ? (
            <Card>
              <CardHeader title={`${t("exams.schedules")} (${selected.schedules.length})`} />
              <Table
                headers={[t("field.class"), t("field.subject"), t("field.date"), t("exams.startTime"), t("exams.endTime"), t("field.room")]}
                rows={selected.schedules.map((s) => [
                  s.class_name ?? className(s.class_id),
                  s.subject_name ?? subjectName(s.subject_id),
                  (s.date ?? "").slice(0, 10),
                  s.start_time ?? "—",
                  s.end_time ?? "—",
                  s.room ?? "—",
                ])}
              />
            </Card>
          ) : (
            <Card>
              <CardHeader title={t("exams.schedules")} />
              <p className="p-5 text-sm text-slate-500">{t("exams.noSchedules")}</p>
            </Card>
          )}

          {selected.results.length ? (
            <Card>
              <CardHeader title={`${t("exams.results")} (${selected.results.length})`} />
              <Table
                headers={[t("field.student"), t("field.subject"), t("exams.marksObtained"), t("field.maxMarks"), t("exams.grade")]}
                rows={selected.results.map((r) => [
                  r.student_name ?? r.student_id.slice(0, 8),
                  r.subject_name ?? subjectName(r.subject_id),
                  String(r.marks_obtained),
                  String(r.max_marks),
                  r.grade ?? "—",
                ])}
              />
            </Card>
          ) : (
            <Card>
              <CardHeader title={t("exams.results")} />
              <p className="p-5 text-sm text-slate-500">{t("exams.noResults")}</p>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}
