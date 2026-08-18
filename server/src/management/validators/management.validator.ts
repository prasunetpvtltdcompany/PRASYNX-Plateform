import { z } from 'zod';

export const createStudentSchema = z.object({
  organisation_id: z.string().uuid(),
  full_name: z.string().min(1, 'Full name is required'),
  roll_number: z.string().min(1, 'Roll number is required'),
  student_class: z.string().optional(),
  section: z.string().optional(),
  phone: z.string().optional(),
  parent_email: z.string().email().optional(),
  parent_phone: z.string().optional()
});

export const createStaffSchema = z.object({
  organisation_id: z.string().uuid(),
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().optional(),
  subject: z.string().optional(),
  phone: z.string().optional()
});

export const createClassSchema = z.object({
  organisation_id: z.string().uuid(),
  name: z.string().min(1, 'Class name is required'),
  section: z.string().optional(),
  capacity: z.number().positive().optional()
});

export const orgIdParamSchema = z.object({
  params: z.object({
    organisation_id: z.string().uuid()
  })
});

export const studentIdParamSchema = z.object({
  params: z.object({
    student_id: z.string().uuid()
  })
});

export const staffIdParamSchema = z.object({
  params: z.object({
    staff_id: z.string().uuid()
  })
});
