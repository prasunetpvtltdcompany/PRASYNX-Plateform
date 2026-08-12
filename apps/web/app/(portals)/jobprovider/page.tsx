"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { PLATFORM_URL } from "@/lib/site-url";

export default function JobProviderPlaceholder() {
  return (
    <I18nProvider>
      <JobProviderContent />
    </I18nProvider>
  );
}

function JobProviderContent() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Building2 className="mx-auto h-10 w-10 text-indigo-600" />
        <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">{t("portal.jobprovider", "Job Provider Portal")}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {t("portal.jobprovider.desc", "The job provider portal is a placeholder. It will be built in a later milestone.")}
        </p>
        <Link href={PLATFORM_URL} className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">
          {t("common.back", "Back home")}
        </Link>
      </div>
    </div>
  );
}