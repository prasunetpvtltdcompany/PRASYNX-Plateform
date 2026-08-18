"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  School,
  GraduationCap,
  HeartHandshake,
  Briefcase,
  Sparkles,
  ShieldCheck,
  Lock,
  Globe,
  Check,
} from "lucide-react";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { PLATFORM_URL } from "@/lib/site-url";

type PortalEntry = {
  key: string;
  label: string;
  desc: string;
  features: string[];
  icon: typeof Users;
  from: string;
  to: string;
  soft: string;
  text: string;
  ring: string;
};

const PORTALS: PortalEntry[] = [
  {
    key: "student",
    label: "Student Login",
    desc: "Attendance, exams, timetable and assignments for students.",
    features: ["Attendance & Reports", "Exam Timetable", "Assignments"],
    icon: GraduationCap,
    from: "from-sky-500",
    to: "to-blue-600",
    soft: "bg-sky-50",
    text: "text-sky-600",
    ring: "hover:border-sky-300",
  },
  {
    key: "parent",
    label: "Parent Login",
    desc: "Track your child's attendance, exams and timetable.",
    features: ["Child Progress", "Fee & Exam Alerts", "Communication"],
    icon: HeartHandshake,
    from: "from-rose-500",
    to: "to-pink-600",
    soft: "bg-rose-50",
    text: "text-rose-600",
    ring: "hover:border-rose-300",
  },
  {
    key: "staff",
    label: "Staff Login",
    desc: "Teachers and staff - attendance, exams and timetable.",
    features: ["Mark Attendance", "Plan Exams", "Lesson Timetable"],
    icon: Users,
    from: "from-emerald-500",
    to: "to-teal-600",
    soft: "bg-emerald-50",
    text: "text-emerald-600",
    ring: "hover:border-emerald-300",
  },
  {
    key: "management",
    label: "Management Login",
    desc: "School management - classes, finance, exams and reports.",
    features: ["Student & Staff", "Finance & Fees", "Reports & Analytics"],
    icon: School,
    from: "from-violet-500",
    to: "to-indigo-600",
    soft: "bg-violet-50",
    text: "text-violet-600",
    ring: "hover:border-violet-300",
  },
  {
    key: "jobprovider",
    label: "Job Provider Login",
    desc: "Hiring portal - post jobs and manage candidates.",
    features: ["Post Jobs", "Applications & Hiring", "Reports & Analytics"],
    icon: Briefcase,
    from: "from-amber-500",
    to: "to-orange-600",
    soft: "bg-amber-50",
    text: "text-amber-600",
    ring: "hover:border-amber-300",
  },
];

export default function ChoosePortalPage() {
  return (
    <I18nProvider>
      <ChoosePortal />
    </I18nProvider>
  );
}

function ChoosePortal() {
  const { t } = useI18n();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#F5F3FF] via-[#EEF4FF] to-[#FDF2F8]">
      {/* Ambient light background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-32 -left-32 h-[560px] w-[560px] rounded-full bg-violet-300/40 blur-[130px]" />
        <div className="absolute -bottom-40 -right-32 h-[600px] w-[600px] rounded-full bg-sky-300/40 blur-[140px]" />
        <div className="absolute top-1/4 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-rose-200/40 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.6),transparent_60%)]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-14 sm:px-6 lg:py-16">
        {/* Centered large logo header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 flex flex-col items-center text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 scale-150 rounded-full bg-gradient-to-tr from-violet-400/40 via-indigo-300/30 to-sky-400/40 blur-2xl" aria-hidden />
            <Link href={PLATFORM_URL} className="group relative inline-block">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                src="/logo.png"
                alt="Prasynx Logo"
                className="h-32 w-auto object-contain drop-shadow-[0_18px_50px_rgba(99,102,241,0.4)] transition-transform duration-300 sm:h-40"
              />
            </Link>
          </div>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-6 py-2.5 shadow-sm backdrop-blur-sm">
            <Sparkles size={16} className="text-violet-600" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-700">
              Unified Education Platform
            </span>
          </div>

          <h1 className="mt-6 bg-gradient-to-r from-violet-700 via-indigo-700 to-sky-700 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl">
            {t("auth.choosePortal", "Choose your portal")}
          </h1>
        </motion.header>

        {/* Portal cards - horizontal row */}
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-4">
          {PORTALS.map((portal, i) => {
            const Icon = portal.icon;
            return (
              <motion.div
                key={portal.key}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 + i * 0.1, ease: "easeOut" }}
              >
                <div
                  className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-slate-100 bg-white/90 p-8 shadow-lg shadow-slate-200/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-transparent hover:shadow-2xl hover:shadow-slate-300/60 ${portal.ring}`}
                >
                  {/* Top gradient line */}
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${portal.from} ${portal.to} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                  {/* Corner glow on hover */}
                  <div className={`pointer-events-none absolute -top-20 -right-20 h-52 w-52 rounded-full bg-gradient-to-br ${portal.from} ${portal.to} opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-15`} aria-hidden />

                  <div className="relative mb-5">
                    <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${portal.from} ${portal.to} text-white shadow-lg shadow-slate-300/50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>

                  <h3 className="relative text-2xl font-bold text-slate-900">{portal.label}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-slate-500 transition-colors duration-300 group-hover:text-slate-600">
                    {portal.desc}
                  </p>

                  <ul className="relative mt-5 flex-1 space-y-2.5 border-t border-slate-100 pt-5">
                    {portal.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2.5 text-[13px] font-medium text-slate-600">
                        <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${portal.soft}`}>
                          <Check size={12} className={portal.text} />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Login Now button */}
                  <Link
                    href={`/${portal.key}/login`}
                    className={`relative mt-7 inline-flex w-full items-center justify-center gap-2 self-end rounded-xl bg-gradient-to-r ${portal.from} ${portal.to} px-4 py-3.5 text-[15px] font-bold text-white shadow-md shadow-slate-300/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.97]`}
                  >
                    {t("auth.enter", "Login Now")}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck size={14} className="text-emerald-500" /> SSL Secured
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Lock size={14} className="text-sky-500" /> 256-bit Encrypted
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Sparkles size={14} className="text-amber-500" /> Powered by Prerana AI
          </span>
        </motion.div>

        {/* Footer - navigate to home webpage */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-slate-500">
            {t("auth.newHere", "New here?")}{" "}
            <Link
              href={PLATFORM_URL}
              className="group inline-flex items-center gap-1.5 font-semibold text-violet-600 transition-all duration-300 hover:text-violet-700 hover:underline"
            >
              <Globe size={14} className="text-violet-500 transition-transform duration-300 group-hover:scale-110" />
              {t("auth.learnMore", "Discover PRASYNX on our website")}
            </Link>
          </p>
        </motion.footer>
      </main>
    </div>
  );
}
