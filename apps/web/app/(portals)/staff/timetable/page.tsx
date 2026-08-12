"use client";

import type { TimetableDTO } from "@prasynx/types";
import { useApi } from "@/lib/use-api";
import { Card, CardHeader } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { PageState } from "@/components/ui/page-state";
import { useI18n } from "@/lib/i18n";

const DAY_KEYS = ["days.sunday", "days.monday", "days.tuesday", "days.wednesday", "days.thursday", "days.friday", "days.saturday"];

export default function TeacherTimetablePage() {
  const { data, loading, error } = useApi<TimetableDTO[]>("/api/v1/timetable");
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("timetable.title")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t("timetable.subtitle")}</p>
      </div>

      <PageState state={{ loading, error }} />

      {data?.map((tt) => (
        <Card key={tt.class_id}>
          <CardHeader title={tt.class_name ?? tt.class_id} />
          <Table
            headers={[t("field.day"), t("field.subject"), t("field.starts"), t("field.end"), t("field.room")]}
            rows={tt.entries.map((e) => [
              DAY_KEYS[e.day_of_week] ? t(DAY_KEYS[e.day_of_week]) : e.day_of_week,
              e.subject_name ?? "—",
              e.start_time,
              e.end_time,
              e.room ?? "—",
            ])}
          />
        </Card>
      ))}
    </div>
  );
}