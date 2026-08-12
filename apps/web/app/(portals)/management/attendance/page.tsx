"use client";

import { useState } from "react";
import type { AttendanceReport, ClassDTO, ClassRosterDTO, DailyAttendanceSummaryDTO, Paginated, UserDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { useI18n } from "@/lib/i18n";

const STATUS_KEYS = ["present", "absent", "late", "excused"] as const;
const STATUS_TONES: Record<(typeof STATUS_KEYS)[number], "green" | "rose" | "amber" | "indigo"> = {
  present: "green",
  absent: "rose",
  late: "amber",
  excused: "indigo",
};

type Tab = "roster" | "summary" | "report";

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

export default function ManagementAttendancePage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("roster");
  const today = new Date().toISOString().slice(0, 10);
  const [classId, setClassId] = useState<string>("");
  const [date, setDate] = useState<string>(today);

  const classes = useApi<Paginated<ClassDTO>>("/api/v1/classes?page=1&pageSize=100");
  const roster = useApi<{ roster: ClassRosterDTO }>(classId ? `/api/v1/attendance/roster?class_id=${classId}&date=${date}` : null);
  const summary = useApi<{ summary: DailyAttendanceSummaryDTO }>(`/api/v1/attendance/daily-summary?date=${date}`);
  const [studentId, setStudentId] = useState<string>("");
  const users = useApi<Paginated<UserDTO>>("/api/v1/users?page=1&pageSize=200");
  const report = useApi<{ report: AttendanceReport }>(studentId ? `/api/v1/attendance?student_id=${studentId}` : null);

  const summaryLabels: Record<string, string> = {
    total: t("attendance.total"),
    present: t("attendance.presentCol"),
    absent: t("attendance.absentCol"),
    late: t("attendance.lateCol"),
    excused: t("attendance.excusedCol"),
  };

  const currentError =
    tab === "roster" ? roster.error : tab === "summary" ? summary.error : report.error;
  const currentLoading =
    tab === "roster" ? roster.loading : tab === "summary" ? summary.loading : report.loading;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("attendance.title")}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("attendance.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <TabButton active={tab === "roster"} onClick={() => setTab("roster")}>
            {t("attendance.rosterTitle")}
          </TabButton>
          <TabButton active={tab === "summary"} onClick={() => setTab("summary")}>
            {t("attendance.dailySummary")}
          </TabButton>
          <TabButton active={tab === "report"} onClick={() => setTab("report")}>
            {t("attendance.summary")}
          </TabButton>
        </div>
      </div>

      <PageState state={{ loading: currentLoading, error: currentError }} />

      {tab === "roster" ? (
        <>
          <Card>
            <CardHeader title={t("attendance.rosterTitle")} />
            <div className="flex flex-wrap gap-3">
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">{t("attendance.chooseClass")}</option>
                {classes.data?.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            {classId && roster.data ? (
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="rounded-full bg-green-50 px-2.5 py-1 font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
                  {t("attendance.marked").replace("{n}", String(roster.data.roster.marked))}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {t("attendance.unmarked").replace("{n}", String(roster.data.roster.unmarked))}
                </span>
              </div>
            ) : null}
          </Card>

          {classId && roster.data ? (
            <Card>
              <Table
                headers={[t("attendance.rollNumber"), t("home.fullName"), t("field.status"), t("field.notes")]}
                rows={roster.data.roster.students.map((s) => [
                  s.roll_number ?? "—",
                  s.full_name,
                  s.status ? (
                    <Badge key={`${s.id}-st`} tone={STATUS_TONES[s.status]}>
                      {t(`val.${s.status}`)}
                    </Badge>
                  ) : (
                    <Badge key={`${s.id}-st`} tone="slate">
                      —
                    </Badge>
                  ),
                  s.notes ?? "—",
                ])}
              />
            </Card>
          ) : null}
        </>
      ) : null}

      {tab === "summary" && summary.data ? (
        <Card>
          <CardHeader title={t("attendance.dailySummary")} subtitle={summary.data.summary.date} />
          <Table
            headers={[t("attendance.classNameCol"), t("attendance.enrolled"), ...STATUS_KEYS.map((k) => summaryLabels[k]), t("attendance.unmarked").replace("{n}", "")]}
            rows={summary.data.summary.classes.map((c) => [
              c.class_name ?? c.class_id,
              c.total,
              c.present,
              c.absent,
              c.late,
              c.excused,
              c.unmarked,
            ])}
          />
        </Card>
      ) : null}

      {tab === "report" ? (
        <>
          <Card>
            <CardHeader title={t("attendance.selectStudent")} />
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">{t("attendance.chooseStudent")}</option>
              {users.data?.data
                .filter((u) => u.role === "student")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
            </select>
          </Card>

          {report.data ? (
            <Card>
              <CardHeader
                title={t("attendance.summary")}
                subtitle={t("home.percentAttendance").replace("{pct}", String(report.data.report.summary.percentage))}
              />
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {(["total", "present", "absent", "late", "excused"] as const).map((key) => (
                  <div key={key} className="rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-800/60">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{report.data!.report.summary[key]}</div>
                    <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{summaryLabels[key] ?? key}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Table
                  headers={[t("field.date"), t("field.status"), t("field.notes")]}
                  rows={report.data.report.records.map((r) => [
                    r.date,
                    STATUS_KEYS.includes(r.status) ? t(`val.${r.status}`) : r.status,
                    r.notes ?? "—",
                  ])}
                />
              </div>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
