"use client";

import { useState } from "react";
import { Languages, ChevronDown } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";

const OPTIONS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
];

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const current = OPTIONS.find((o) => o.code === lang) ?? OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
      >
        <Languages className="h-4 w-4" />
        <span>{current.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {OPTIONS.map((o) => (
            <button
              key={o.code}
              type="button"
              onClick={() => {
                setLang(o.code);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${
                o.code === lang ? "font-semibold text-indigo-600" : "text-slate-700"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}