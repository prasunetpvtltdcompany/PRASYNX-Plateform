"use client";

import type { ReactNode } from "react";
import type { Role } from "@prasynx/types";
import { ROLES } from "@prasynx/types";
import { RoleGuard } from "@/components/role-guard";
import { AppShell, type NavItem } from "@/components/app-shell";
import { Building2, LayoutDashboard, School } from "lucide-react";

const allowedRoles: Role[] = [ROLES.PLATFORM_ADMIN, ROLES.PLATFORM_SUPERVISOR, ROLES.PLATFORM_OWNER];

export const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, match: ["/admin"] },
  { label: "Register school", href: "/admin/register", icon: School, match: "/admin/register" },
  { label: "Organisations", href: "/admin/organisations", icon: Building2, match: "/admin/organisations" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allowedRoles={allowedRoles} portal="admin">
      <AppShell nav={adminNav}>{children}</AppShell>
    </RoleGuard>
  );
}