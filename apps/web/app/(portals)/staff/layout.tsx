"use client";

import type { ReactNode } from "react";
import type { Role } from "@prasynx/types";
import { ROLES } from "@prasynx/types";
import { RoleGuard } from "@/components/role-guard";
import { AppShell, type NavItem } from "@/components/app-shell";
import { LayoutDashboard, ClipboardCheck, FileSpreadsheet, CalendarRange, NotebookPen } from "lucide-react";

/** Teachers are members of the staff portal. */
const allowedRoles: Role[] = [
  ROLES.TEACHER,
  ROLES.STAFF,
  ROLES.ACCOUNTANT,
  ROLES.LIBRARIAN,
  ROLES.TRANSPORT_MANAGER,
  ROLES.HOSTEL_WARDEN,
];

export const staffNav: NavItem[] = [
  { label: "Dashboard", href: "/staff", icon: LayoutDashboard, match: ["/staff"] },
  { label: "Assignments", href: "/staff/assignments", icon: NotebookPen, match: "/staff/assignments" },
  { label: "Attendance", href: "/staff/attendance", icon: ClipboardCheck, match: "/staff/attendance" },
  { label: "Exams", href: "/staff/exams", icon: FileSpreadsheet, match: "/staff/exams" },
  { label: "Timetable", href: "/staff/timetable", icon: CalendarRange, match: "/staff/timetable" },
];

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={allowedRoles} portal="staff">
      <AppShell nav={staffNav}>{children}</AppShell>
    </RoleGuard>
  );
}