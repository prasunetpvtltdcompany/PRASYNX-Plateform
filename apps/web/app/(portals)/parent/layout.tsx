"use client";

import type { ReactNode } from "react";
import type { Role } from "@prasynx/types";
import { ROLES } from "@prasynx/types";
import { RoleGuard } from "@/components/role-guard";
import { AppShell, type NavItem } from "@/components/app-shell";
import { LayoutDashboard, ClipboardCheck, FileSpreadsheet, CalendarRange } from "lucide-react";

const allowedRoles: Role[] = [ROLES.PARENT];

export const parentNav: NavItem[] = [
  { label: "Dashboard", href: "/parent", icon: LayoutDashboard, match: ["/parent"] },
  { label: "Attendance", href: "/parent/attendance", icon: ClipboardCheck, match: "/parent/attendance" },
  { label: "Exams", href: "/parent/exams", icon: FileSpreadsheet, match: "/parent/exams" },
  { label: "Timetable", href: "/parent/timetable", icon: CalendarRange, match: "/parent/timetable" },
];

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={allowedRoles} portal="parent">
      <AppShell nav={parentNav}>{children}</AppShell>
    </RoleGuard>
  );
}