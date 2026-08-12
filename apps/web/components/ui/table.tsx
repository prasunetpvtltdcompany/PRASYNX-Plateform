"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n";

export function Table({ headers, rows, empty }: { headers: string[]; rows: ReactNode[][]; empty?: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                {empty ?? t("common.noRecords")}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={cn(
                      "px-4 py-3 text-slate-700 dark:text-slate-300",
                      j === 0 && "font-medium text-slate-900 dark:text-slate-100",
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}