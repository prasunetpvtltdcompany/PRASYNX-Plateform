/**
 * Platform-wide roles (values match the `users.role` column in the existing schema).
 * Platform roles operate as PRASYNX (the company). Domain roles operate inside a school.
 */
export const ROLES = {
  PLATFORM_ADMIN: 'admin',
  PLATFORM_SUPERVISOR: 'supervisor',
  PLATFORM_OWNER: 'owner',
  SCHOOL_MANAGEMENT: 'management',
  TEACHER: 'teacher',
  STAFF: 'staff',
  STUDENT: 'student',
  PARENT: 'parent',
  ACCOUNTANT: 'accountant',
  LIBRARIAN: 'librarian',
  TRANSPORT_MANAGER: 'transport_manager',
  HOSTEL_WARDEN: 'hostel_warden',
} as const;

export type PlatformRole = typeof ROLES.PLATFORM_ADMIN | typeof ROLES.PLATFORM_SUPERVISOR | typeof ROLES.PLATFORM_OWNER;
export type DomainRole =
  | typeof ROLES.SCHOOL_MANAGEMENT
  | typeof ROLES.TEACHER
  | typeof ROLES.STAFF
  | typeof ROLES.STUDENT
  | typeof ROLES.PARENT
  | typeof ROLES.ACCOUNTANT
  | typeof ROLES.LIBRARIAN
  | typeof ROLES.TRANSPORT_MANAGER
  | typeof ROLES.HOSTEL_WARDEN;

export type Role = PlatformRole | DomainRole;

/** Never serialize these columns to clients. */
export type UserStatus = 'active' | 'pending' | 'suspended' | 'disabled';

export interface UserRow {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  organisation_id: string | null;
  status: UserStatus;
  password_hash?: string;
  created_at?: string;
}

/** Safe serialization of a user (no password material). */
export interface UserDTO {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  organisation_id: string | null;
  status: UserStatus;
  created_at?: string;
}

export interface NotifyUserTarget {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
}