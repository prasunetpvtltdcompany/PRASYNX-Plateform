import type { Role } from "@prasynx/types";
import { ROLES } from "@prasynx/types";

/**
 * Portal => required role mapping. Matches the App Router folder layout.
 *
 * Product (CUIMS-style): one main site + one portal per audience, each with its
 * own login and its own subdomain in production:
 *   www.* - public showcase site lives in apps/platform (marketing app)
 *   /admin-panel/*   - admin.prasynx.in  - PRASYNX company: register schools + grant portal access
 *   /management/*      - management.prasynx.in - school management
 *   /staff/*           - staff.prasynx.in  - teachers and non-teaching staff
 *   /student/*         - student.prasynx.in - students
 *   /parent/*          - parent.prasynx.in - parents
 *   /jobprovider/*     - jobprovider.prasynx.in - employers (placeholder)
 */
export const ROLE_ROUTE_GROUPS: Record<string, Role[]> = {
  admin: [ROLES.PLATFORM_ADMIN, ROLES.PLATFORM_SUPERVISOR, ROLES.PLATFORM_OWNER],
  management: [ROLES.SCHOOL_MANAGEMENT],
  staff: [ROLES.TEACHER, ROLES.STAFF, ROLES.ACCOUNTANT, ROLES.LIBRARIAN, ROLES.TRANSPORT_MANAGER, ROLES.HOSTEL_WARDEN],
  student: [ROLES.STUDENT],
  parent: [ROLES.PARENT],
  jobprovider: [],
};

export interface PortalMeta {
  label: string;
  description: string;
}

/** Copy for login pages and the portal chooser. */
export const PORTAL_META: Record<string, PortalMeta> = {
  admin: {
    label: "Admin Portal",
    description: "PRASYNX company operations - register schools and grant portal access.",
  },
  management: {
    label: "Management Portal",
    description: "School management - classes, attendance, exams, timetables, assignments and finance.",
  },
  staff: {
    label: "Staff Portal",
    description: "Teachers and staff - mark attendance, plan exams and follow the timetable.",
  },
  student: {
    label: "Student Portal",
    description: "Students - your attendance, exams, timetable and assignments.",
  },
  parent: {
    label: "Parent Portal",
    description: "Parents - track your child's attendance, exams and timetable.",
  },
  jobprovider: {
    label: "Job Provider Portal",
    description: "Employers - post roles and hire from the PRASYNX community.",
  },
};

const PRIVATE_GROUP_LEAF = Object.keys(ROLE_ROUTE_GROUPS);

/** First portal segment matched by a pathname, e.g. /staff/classes -> staff. */
export function matchRouteGroup(pathname: string): string | null {
  const first = pathname.split("/")[1];
  return first && PRIVATE_GROUP_LEAF.includes(first) ? first : null;
}

/** Portal login URL for a route group, e.g. /student/login. */
export function loginPathForGroup(group: string): string {
  return `/${group}/login`;
}

/** Portal label for a route group, e.g. "Student Portal" (falls back to the group raw). */
export function portalLabel(group: string): string {
  return PORTAL_META[group]?.label ?? group;
}

/** Subdomain => portal, e.g. student.prasynx.in -> student. Accepts a host with optional port. */
export function portalFromHost(host: string): string | null {
  const lower = host.toLowerCase().split(":")[0];
  if (lower === "prasynx.in" || lower === "localhost" || lower === "www.prasynx.in") return null;
  for (const group of PRIVATE_GROUP_LEAF) {
    if (lower === `${group}.prasynx.in` || lower.startsWith(`${group}.`)) return group;
  }
  return null;
}

export function roleAllowedInGroup(role: Role, group: string): boolean {
  const allowed = ROLE_ROUTE_GROUPS[group];
  return !!allowed && allowed.includes(role);
}

/** Human-readable label for a role using the active i18n dictionary. */
export function roleLabel(role: string, t: (key: string, fallback?: string) => string): string {
  return t(`role.${role}`, role.replace(/_/g, " "));
}

export function homeForRole(role: Role): string {
  switch (role) {
    case ROLES.PLATFORM_ADMIN:
    case ROLES.PLATFORM_SUPERVISOR:
    case ROLES.PLATFORM_OWNER:
      return "/admin-panel";
    case ROLES.SCHOOL_MANAGEMENT:
      return "/management";
    case ROLES.TEACHER:
    case ROLES.STAFF:
    case ROLES.ACCOUNTANT:
    case ROLES.LIBRARIAN:
    case ROLES.TRANSPORT_MANAGER:
    case ROLES.HOSTEL_WARDEN:
      return "/staff";
    case ROLES.STUDENT:
      return "/student";
    case ROLES.PARENT:
      return "/parent";
    default:
      return "/";
  }
}