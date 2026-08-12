import { z } from 'zod';
import { dateOnlySchema, uuidSchema } from './common';

export const attendanceStatusSchema = z.enum(['present', 'absent', 'late', 'excused']);

/** markAttendance - teacher marks one student. */
export const markAttendanceSchema = z.object({
  student_id: uuidSchema,
  date: dateOnlySchema,
  status: attendanceStatusSchema,
  notes: z.string().max(500).optional().nullable(),
});

/** bulkAttendance - teacher marks a whole class on a day. */
export const bulkAttendanceSchema = z.object({
  class_id: uuidSchema,
  date: dateOnlySchema,
  records: z
    .array(
      z.object({
        student_id: uuidSchema,
        status: attendanceStatusSchema,
        notes: z.string().max(500).optional().nullable(),
      }),
    )
    .min(1, { message: 'At least one attendance record is required' })
    .max(500, { message: 'Batch too large (max 500 records)' }),
});

export const attendanceQuerySchema = z.object({
  student_id: uuidSchema,
  date_from: dateOnlySchema.optional(),
  date_to: dateOnlySchema.optional(),
});

/** roster - the class + date grid management uses to verify/mark attendance. */
export const attendanceRosterQuerySchema = z.object({
  class_id: uuidSchema,
  date: dateOnlySchema.optional(),
});

/** records - filtered, paginated attendance records list. */
export const attendanceRecordsQuerySchema = z.object({
  class_id: uuidSchema.optional(),
  date: dateOnlySchema.optional(),
  date_from: dateOnlySchema.optional(),
  date_to: dateOnlySchema.optional(),
  status: attendanceStatusSchema.optional(),
  student_id: uuidSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

/** daily-summary - per-class attendance breakdown for a date. */
export const dailySummaryQuerySchema = z.object({
  date: dateOnlySchema.optional(),
});