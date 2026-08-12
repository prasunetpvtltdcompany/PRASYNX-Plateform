"use client";

import { useMemo, useState } from "react";
import type { ClassDTO, Paginated, TimetableDTO, TimetableEntryDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { Card, CardHeader } from "@/components/ui/card";
import { PageState } from "@/components/ui/page-state";
import { useI18n } from "@/lib/i18n";

const DAYS = [1, 2, 3, 4, 5, 6]; // Mon..Sat; day_of_week 0 = Sunday
const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export default function ManagementTimetablePage() {
  const { t } = useI18n();
  const [classId, setClassId] = useState<string>("");
  const classes = useApi<Paginated<ClassDTO>>("/api/v1/classes?page=1&pageSize=100");
  const timetable = useApi<{ timetable: TimetableDTO }>(classId ? `/api/v1/timetable?class_id=${classId}` : null);

  // Distinct periods across the week, ordered by start time.
  const entries = useMemo(() => timetable.data?.timetable.entries ?? [], [timetable.data]);

  const periods = useMemo(() => {
    const seen = new Map<string, { start: string; end: string }>();
    for (const e of entries) {
      const key = `${e.start_time}-${e.end_time}`;
      if (!seen.has(key)) seen.set(key, { start: e.start_time, end: e.end_time });
    }
    return Array.from(seen.values()).sort((a, b) => a.start.localeCompare(b.start));
  }, [entries]);

  const byDay = useMemo(() => {
    const map = new Map<number, TimetableEntryDTO[]>();
    for (const e of entries) {
      const list = map.get(e.day_of_week) ?? [];
      list.push(e);
      map.set(e.day_of_week, list);
    }
    return map;
  }, [entries]);

  const cellFor = (day: number, period: { start: string; end: string }): TimetableEntryDTO | undefined =>
    (byDay.get(day) ?? []).find((e) => e.start_time === period.start && e.end_time === period.end);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("timetable.title")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("timetable.subtitle")}</p>
      </div>

      <Card>
        <CardHeader title={t("timetable.selectClass")} />
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="">{t("timetable.chooseClass")}</option>
          {classes.data?.data.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Card>

      <PageState state={{ loading: timetable.loading, error: timetable.error }} />

      {classId && timetable.data && entries.length > 0 ? (
        <Card>
          <CardHeader title={timetable.data.timetable.class_name ?? classId} subtitle={t("timetable.weekly")} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-slate-200 bg-slate-50 p-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    {t("field.day")}
                  </th>
                  {periods.map((p) => (
                    <th
                      key={`${p.start}-${p.end}`}
                      className="border border-slate-200 bg-slate-50 p-2 text-center text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    >
                      {t("timetable.period")}
                      <br />
                      <span className="font-normal">{p.start}–{p.end}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => (
                  <tr key={day}>
                    <td className="border border-slate-200 p-2 font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">
                      {t(`days.${DAY_KEYS[day]}`)}
                    </td>
                    {periods.map((p) => {
                      const entry = cellFor(day, p);
                      return (
                        <td key={`${day}-${p.start}`} className="border border-slate-200 p-2 align-top dark:border-slate-700">
                          {entry ? (
                            <div className="rounded-md bg-indigo-50 px-2 py-1.5 dark:bg-indigo-900/40">
                              <div className="font-semibold text-slate-900 dark:text-slate-100">{entry.subject_name ?? "—"}</div>
                              {entry.room ? (
                                <div className="text-xs text-slate-500 dark:text-slate-400">{entry.room}</div>
                              ) : null}
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {classId && timetable.data && entries.length === 0 ? (
        <Card>
          <CardHeader title={t("timetable.weekly")} />
          <p className="p-5 text-sm text-slate-500">{t("timetable.empty")}</p>
        </Card>
      ) : null}
    </div>
  );
}
