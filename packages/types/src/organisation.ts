import type { DomainRole } from './user';

/** Organisation status values (existing schema). */
export type OrganisationStatus = 'verified' | 'pending' | 'suspended' | 'rejected';

/**
 * Portals a school can be granted (organisation_portals.portal).
 * The admin portal is company-owned, so it is not org-scoped.
 */
export const PORTAL_SLUGS = ['management', 'staff', 'student', 'parent'] as const;
export type PortalSlug = (typeof PORTAL_SLUGS)[number];

/** Which portal a school-side role belongs to (used for login gating + the role cookie). */
export const DOMAIN_ROLE_PORTAL: Record<DomainRole, PortalSlug> = {
  management: 'management',
  teacher: 'staff',
  staff: 'staff',
  student: 'student',
  parent: 'parent',
  accountant: 'staff',
  librarian: 'staff',
  transport_manager: 'staff',
  hostel_warden: 'staff',
};

export interface OrganisationRow {
  id: string;
  name: string;
  status: OrganisationStatus;
  address?: string | null;
  phone?: string | null;
  email: string;
  created_at?: string;
}

export interface OrganisationDTO {
  id: string;
  name: string;
  status: OrganisationStatus;
  address?: string | null;
  phone?: string | null;
  email: string;
  created_at?: string;
  /** Portals granted to this school by PRASYNX (organisation_portals). */
  portal_access: PortalSlug[];
}

/**
 * Payload returned when PRASYNX registers a new school.
 * The credentials belong to the school's initial management account and are
 * revealed exactly once (in the API response + the provisioning email).
 */
export interface RegisterSchoolResult {
  organisation: OrganisationDTO;
  management: {
    email: string;
    full_name: string;
    role: 'management';
    /** One-time generated password. NEVER stored or logged in plaintext. */
    temporary_password: string;
  };
  user_id: string;
}