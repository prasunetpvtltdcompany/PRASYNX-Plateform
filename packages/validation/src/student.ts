import { z } from 'zod';
import { emailSchema } from './common';

export const createStudentSchema = z.object({
  full_name: z.string().min(2).max(200),
  roll_number: z.string().max(60).optional(),
  class_id: z.string().uuid().nullable().optional(),
  section_id: z.string().uuid().nullable().optional(),
  class_name: z.string().max(200).nullable().optional(),
  section_name: z.string().max(200).nullable().optional(),
  email: emailSchema.optional(),
  phone: z.string().max(30).optional(),
  password: z.string().min(8).max(128).optional(),
  parent_name: z.string().max(200).optional(),
  parent_email: emailSchema.optional(),
  parent_phone: z.string().max(30).optional(),
  parent_relationship: z.string().max(60).optional(),
  date_of_birth: z.string().max(30).optional(),
  gender: z.string().max(30).optional(),
  address: z.string().max(500).optional(),
  blood_group: z.string().max(10).optional(),
});

/** Class/section may be provided by uuid OR by display name. */
export const updateStudentSchema = createStudentSchema.omit({ password: true }).partial();