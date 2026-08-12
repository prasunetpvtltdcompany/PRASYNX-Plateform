"use client";

import type { ReactNode } from "react";
import type { Role } from "@prasynx/types";
import { ROLES } from "@prasynx/types";
import { RoleGuard } from "@/components/role-guard";
import { AppShell, type NavItem } from "@/components/app-shell";
import { LayoutDashboard, ClipboardCheck, FileSpreadsheet, CalendarRange, NotebookPen } from "lucide-react";

const allowedRoles: Role[] = [ROLES.STUDENT];

export const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: LayoutDashboard, match: ["/student"] },
  { label: "Attendance", href: "/student/attendance", icon: ClipboardCheck, match: "/student/attendance" },
  { label: "Exams", href: "/student/exams", icon: FileSpreadsheet, match: "/student/exams" },
  { label: "Timetable", href: "/student/timetable", icon: CalendarRange, match: "/student/timetable" },
  { label: "Assignments", href: "/student/assignments", icon: NotebookPen, match: "/student/assignments" },
];

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={allowedRoles} portal="student">
      <AppShell nav={studentNav}>{children}</AppShell>
    </RoleGuard>
  );
}