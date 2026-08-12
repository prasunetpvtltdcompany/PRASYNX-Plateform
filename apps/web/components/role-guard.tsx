"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Role } from "@prasynx/types";
import { useAuth } from "@/lib/auth";
import { homeForRole, loginPathForGroup } from "@/lib/route-groups";

/**
 * Guards a route-group layout: unauthenticated users go to that portal's own
 * login page, and users whose role does not belong to this route group are
 * bounced to their own portal's home.
 */
export function RoleGuard({
  allowedRoles,
  portal,
  children,
}: {
  allowedRoles: Role[];
  portal: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace(loginPathForGroup(portal));
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      router.replace(homeForRole(user.role));
    }
  }, [user, allowedRoles, portal, router]);

  if (!user || !allowedRoles.includes(user.role)) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">Loading…</div>;
  }
  return <>{children}</>;
}