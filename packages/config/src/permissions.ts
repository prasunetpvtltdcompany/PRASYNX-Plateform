import { ROLES, type Role } from '@prasynx/types';

/**
 * Permission matrix. Every authorized endpoint declares which permissions it
 * requires; `authorize()` resolves the caller's role to a permission set.
 * Centralizing it here (one place) is what prevents the 6-backend drift.
 */
export const PERMISSIONS = {
  // Platform (company) scoped
  PLATFORM_MANAGE_ORGANISATIONS: 'platform:organisations:manage',
  PLATFORM_VIEW_ANALYTICS: 'platform:analytics:view',
  // School scoped
  SCHOOL_MANAGE: 'school:manage',
  SCHOOL_TEACHERS_MANAGE: 'school:teachers:manage',
  SCHOOL_STUDENTS_MANAGE: 'school:students:manage',
  SCHOOL_CLASSES_MANAGE: 'school:classes:manage',
  SCHOOL_ATTENDANCE_MANAGE: 'school:attendance:manage',
  SCHOOL_ATTENDANCE_VIEW: 'school:attendance:view',
  SCHOOL_EXAMS_MANAGE: 'school:exams:manage',
  SCHOOL_EXAMS_VIEW: 'school:exams:view',
  SCHOOL_TIMETABLE_MANAGE: 'school:timetable:manage',
  SCHOOL_TIMETABLE_VIEW: 'school:timetable:view',
  SCHOOL_ASSIGNMENTS_MANAGE: 'school:assignments:manage',
  SCHOOL_ASSIGNMENTS_VIEW: 'school:assignments:view',
  SCHOOL_SUBJECTS_MANAGE: 'school:subjects:manage',
  SCHOOL_FINANCE_MANAGE: 'school:finance:manage',
  SCHOOL_FINANCE_VIEW: 'school:finance:view',
  SCHOOL_STAFF_MANAGE: 'school:staff:manage',
  SCHOOL_PROMOTIONS_MANAGE: 'school:promotions:manage',
  SCHOOL_DISCIPLINE_MANAGE: 'school:discipline:manage',
  SCHOOL_AI_MANAGE: 'school:ai:manage',
  SCHOOL_ACTIVITIES_MANAGE: 'school:activities:manage',
  OWN_PROFILE: 'self:profile',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const PLATFORM_ADMIN_PERMS: Permission[] = [
  PERMISSIONS.PLATFORM_MANAGE_ORGANISATIONS,
  PERMISSIONS.PLATFORM_VIEW_ANALYTICS,
  PERMISSIONS.OWN_PROFILE,
];

const MANAGEMENT_PERMS: Permission[] = [
  PERMISSIONS.SCHOOL_MANAGE,
  PERMISSIONS.SCHOOL_TEACHERS_MANAGE,
  PERMISSIONS.SCHOOL_STUDENTS_MANAGE,
  PERMISSIONS.SCHOOL_CLASSES_MANAGE,
  PERMISSIONS.SCHOOL_ATTENDANCE_MANAGE,
  PERMISSIONS.SCHOOL_ATTENDANCE_VIEW,
  PERMISSIONS.SCHOOL_EXAMS_MANAGE,
  PERMISSIONS.SCHOOL_EXAMS_VIEW,
  PERMISSIONS.SCHOOL_TIMETABLE_MANAGE,
  PERMISSIONS.SCHOOL_TIMETABLE_VIEW,
  PERMISSIONS.SCHOOL_ASSIGNMENTS_MANAGE,
  PERMISSIONS.SCHOOL_ASSIGNMENTS_VIEW,
  PERMISSIONS.SCHOOL_SUBJECTS_MANAGE,
  PERMISSIONS.SCHOOL_FINANCE_MANAGE,
  PERMISSIONS.SCHOOL_FINANCE_VIEW,
  PERMISSIONS.SCHOOL_STAFF_MANAGE,
  PERMISSIONS.SCHOOL_PROMOTIONS_MANAGE,
  PERMISSIONS.SCHOOL_DISCIPLINE_MANAGE,
  PERMISSIONS.SCHOOL_AI_MANAGE,
  PERMISSIONS.SCHOOL_ACTIVITIES_MANAGE,
  PERMISSIONS.OWN_PROFILE,
];

const TEACHER_PERMS: Permission[] = [
  PERMISSIONS.SCHOOL_STUDENTS_MANAGE,
  PERMISSIONS.SCHOOL_ATTENDANCE_MANAGE,
  PERMISSIONS.SCHOOL_ATTENDANCE_VIEW,
  PERMISSIONS.SCHOOL_EXAMS_VIEW,
  PERMISSIONS.SCHOOL_TIMETABLE_VIEW,
  PERMISSIONS.SCHOOL_ASSIGNMENTS_MANAGE,
  PERMISSIONS.SCHOOL_ASSIGNMENTS_VIEW,
  PERMISSIONS.SCHOOL_SUBJECTS_MANAGE,
  PERMISSIONS.OWN_PROFILE,
];

const STUDENT_PERMS: Permission[] = [
  PERMISSIONS.SCHOOL_ATTENDANCE_VIEW,
  PERMISSIONS.SCHOOL_EXAMS_VIEW,
  PERMISSIONS.SCHOOL_TIMETABLE_VIEW,
  PERMISSIONS.SCHOOL_ASSIGNMENTS_VIEW,
  PERMISSIONS.SCHOOL_FINANCE_VIEW,
  PERMISSIONS.OWN_PROFILE,
];

const PARENT_PERMS: Permission[] = [
  PERMISSIONS.SCHOOL_ATTENDANCE_VIEW,
  PERMISSIONS.SCHOOL_EXAMS_VIEW,
  PERMISSIONS.SCHOOL_TIMETABLE_VIEW,
  PERMISSIONS.SCHOOL_ASSIGNMENTS_VIEW,
  PERMISSIONS.SCHOOL_FINANCE_VIEW,
  PERMISSIONS.OWN_PROFILE,
];

const STAFF_PERMS: Permission[] = [PERMISSIONS.OWN_PROFILE];

/** Resolve a role to its permission set. Unknown roles get no permissions. */
export function permissionsFor(role: Role | undefined): Permission[] {
  if (!role) return [];
  switch (role) {
    case ROLES.PLATFORM_ADMIN:
    case ROLES.PLATFORM_SUPERVISOR:
    case ROLES.PLATFORM_OWNER:
      return PLATFORM_ADMIN_PERMS;
    case ROLES.SCHOOL_MANAGEMENT:
      return MANAGEMENT_PERMS;
    case ROLES.TEACHER:
      return TEACHER_PERMS;
    case ROLES.STUDENT:
      return STUDENT_PERMS;
    case ROLES.PARENT:
      return PARENT_PERMS;
    case ROLES.STAFF:
    case ROLES.ACCOUNTANT:
    case ROLES.LIBRARIAN:
    case ROLES.TRANSPORT_MANAGER:
    case ROLES.HOSTEL_WARDEN:
      return STAFF_PERMS;
    default:
      return [];
  }
}

export function hasPermission(role: Role | undefined, required: Permission): boolean {
  return permissionsFor(role).includes(required);
}