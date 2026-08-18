import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { matchRouteGroup, roleAllowedInGroup, homeForRole, loginPathForGroup, portalFromHost } from "./lib/route-groups";
import { SESSION_COOKIE } from "./lib/session";

/**
 * PRASYNX Proxy (Next.js 16 = "edge middleware").
 *
 * Role gate at the edge: reads the non-secret session role cookie mirrored by
 * lib/session.ts and redirects users away from portals they have no role for.
 *
 * This is UX-level gating only - the real security boundary is the monolith,
 * which verifies the JWT signature and enforces the RBAC permission matrix on
 * every /api/v1/* request. Pages themselves double-check via <RoleGuard>.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  // Never gate the API proxy or static assets (the API enforces auth itself).
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // Subdomain root redirects: student.prasynx.in/ -> /student (CUIMS model).
  const hostPortal = portalFromHost(host);
  if (hostPortal && pathname === "/") {
    return NextResponse.redirect(new URL(`/${hostPortal}`, request.url));
  }

  const group = matchRouteGroup(pathname);
  // Public (marketing/auth) routes and unknown paths pass through.
  if (!group) return NextResponse.next();

  // The management portal was replaced by the legacy prasynx-management-frontend
  // page, which manages its own session (localStorage `managementSession`) and
  // renders its own sign-in screen inside /management. Skip the edge role gate.
  // Same for the admin panel: it authenticates via Supabase (storage session +
  // httpOnly `token` cookie) and self-gates on loading/session in page.tsx.
  // Same for the parent portal: legacy prasynx-parents-frontend port keeps its
  // own session (localStorage `parentSession`) and an inline sign-in screen.
  // Same for the staff and student portals: legacy prasynx-staff/student-frontend
  // ports keep their own sessions (localStorage `staffSession`/`studentSession`)
  // with inline sign-in screens.
  if (group === "admin-panel" || group === "management" || group === "parent" || group === "staff" || group === "student") return NextResponse.next();

  // A portal's own login page (/<portal>/login) is always public.
  if (pathname === loginPathForGroup(group)) return NextResponse.next();

  const roleCookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (!roleCookie) {
    // No session at all -> send to that portal's own sign-in page.
    return NextResponse.redirect(new URL(loginPathForGroup(group), request.url));
  }

  const role = decodeURIComponent(roleCookie) as Parameters<typeof roleAllowedInGroup>[0];
  if (!roleAllowedInGroup(role, group)) {
    return NextResponse.redirect(new URL(homeForRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run for all except static assets, images and the API proxy.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};