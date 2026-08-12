"use client";

import { useState, type FormEvent } from "react";
import type { RegisterSchoolResult } from "@prasynx/types";
import { apiClient } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export default function PlatformRegisterSchoolPage() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [adminFullName, setAdminFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RegisterSchoolResult | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const registered = await apiClient<RegisterSchoolResult>("/api/v1/organisations/register", {
        method: "POST",
        body: {
          name,
          email,
          address: address || undefined,
          phone: phone || undefined,
          adminFullName: adminFullName || undefined,
        },
      });
      setResult(registered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("admin.register.title", "Register a school")}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("admin.register.subtitle", "Provision a new school and its initial management account.")}
        </p>
      </div>

      {result ? (
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40">
          <CardHeader
            title={t("admin.register.success", "School registered")}
            subtitle={t("admin.register.credentialsNote", "Save these credentials now - the temporary password is shown only once.")}
          />
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="font-semibold text-slate-700 dark:text-slate-300">{t("admin.register.school", "School")}</dt>
              <dd>{result.organisation.name} ({result.organisation.email})</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700 dark:text-slate-300">{t("admin.register.mgmtEmail", "Management email")}</dt>
              <dd>{result.management.email}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700 dark:text-slate-300">{t("admin.register.tempPass", "Temporary password")}</dt>
              <dd className="font-mono">{result.management.temporary_password}</dd>
            </div>
          </dl>
        </Card>
      ) : (
        <Card>
          <CardHeader title={t("admin.register.schoolDetails", "School details")} />
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label={t("admin.register.schoolName", "School name")}>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </Field>
            <Field label={t("admin.register.contactEmail", "Contact email")}>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </Field>
            <Field label={t("admin.register.address", "Address (optional)")}>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
            </Field>
            <Field label={t("admin.register.phone", "Phone (optional)")}>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
            </Field>
            <Field label={t("admin.register.mgmtName", "Management account name (optional)")}>
              <input value={adminFullName} onChange={(e) => setAdminFullName(e.target.value)} className={inputCls} />
            </Field>

            {error ? (
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</div>
            ) : null}

            <button type="submit" disabled={submitting} className={buttonClasses("primary")}>
              {submitting ? t("admin.register.creating", "Registering…") : t("admin.register.submit", "Register school")}
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      {children}
    </div>
  );
}