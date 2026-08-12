import { z } from 'zod';

export const createStaffRecordSchema = z.object({
  full_name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(30).optional(),
  staff_unique_id: z.string().max(50).optional(),
  subject: z.string().max(200).optional(),
  assigned_class: z.string().uuid().optional().or(z.literal('')),
  qualification: z.string().max(300).optional(),
  join_date: z.string().max(60).optional(),
  department: z.string().max(150).optional(),
  designation: z.string().max(150).optional(),
  experience_years: z.number().int().min(0).max(60).optional(),
  gender: z.string().max(30).optional(),
  date_of_birth: z.string().max(60).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postal_code: z.string().max(30).optional(),
  salary: z.number().min(0).optional(),
  employment_type: z.string().max(50).optional(),
  reporting_manager: z.string().max(200).optional(),
  status: z.string().max(30).optional(),
  role: z.string().max(60).optional(),
});

export const createStaffAttendanceSchema = z.object({
  staff_id: z.string().uuid(),
  attendance_date: z.string().min(1).max(40),
  check_in: z.string().max(40).optional().or(z.literal('')),
  check_out: z.string().max(40).optional().or(z.literal('')),
  status: z.string().max(30).optional(),
  remarks: z.string().max(500).optional(),
});

export const createStaffLeaveRequestSchema = z.object({
  staff_id: z.string().uuid(),
  leave_type: z.string().max(60).optional(),
  from_date: z.string().min(1).max(40),
  to_date: z.string().min(1).max(40),
  reason: z.string().max(1000).optional(),
});

export const updateStaffLeaveStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejection_reason: z.string().max(500).optional(),
});