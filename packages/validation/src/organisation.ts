import { z } from 'zod';
import { emailSchema } from './common';

/** PRASYNX registers a new school on behalf of the company. */
export const registerSchoolSchema = z.object({
  name: z.string().min(2).max(200),
  email: emailSchema,
  address: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  // Optional: the school's initial management account holder.
  adminFullName: z.string().min(2).max(200).optional(),
});

export const updateOrganisationStatusSchema = z.object({
  status: z.enum(['verified', 'pending', 'suspended', 'rejected']),
});

/** Full replacement of the portals a school may use. */
export const updateOrganisationPortalsSchema = z.object({
  portals: z.array(z.enum(['management', 'staff', 'student', 'parent'])).max(4),
});