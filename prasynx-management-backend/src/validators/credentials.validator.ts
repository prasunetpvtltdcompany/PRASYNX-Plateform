import { z } from 'zod';

export const createStudentSchema = z.object({
  organisation_id: z.string().uuid('Invalid organisation_id'),
  full_name: z.string().min(1, 'Full name is required'),
  roll_number: z.string().min(1, 'Roll number is required'),
  student_class: z.string().optional(),
  section: z.string().optional()
});

export const createStaffSchema = z.object({
  organisation_id: z.string().uuid('Invalid organisation_id'),
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  role: z.string().optional(),
  subject: z.string().optional(),
  phone: z.string().optional()
});

export const createParentSchema = z.object({
  organisation_id: z.string().uuid('Invalid organisation_id'),
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  student_id: z.string().uuid('Invalid student_id')
});

export const bulkCreateSchema = z.object({
  organisation_id: z.string().uuid('Invalid organisation_id'),
  csv: z.string().min(1, 'CSV data is required')
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended'], { message: 'Status must be active, inactive, or suspended' })
});

export const orgIdParamSchema = z.object({
  org_id: z.string().uuid('Invalid organisation_id')
});

export const userIdParamSchema = z.object({
  user_id: z.string().uuid('Invalid user_id')
});
