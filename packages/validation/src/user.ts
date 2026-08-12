import { z } from 'zod';
import { emailSchema } from './common';

const roleEnum = z.enum(['management', 'teacher', 'staff', 'student', 'accountant', 'librarian', 'transport_manager', 'hostel_warden']);

/** Provision a user within the caller's school (management action). */
export const createUserSchema = z.object({
  full_name: z.string().min(2).max(200),
  email: emailSchema,
  role: roleEnum,
});