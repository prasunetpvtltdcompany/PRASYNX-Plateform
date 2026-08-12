import { z } from 'zod';
import { dateOnlySchema, uuidSchema } from './common';

export const assignmentStatusSchema = z.enum(['active', 'closed']);
export const submissionStatusSchema = z.enum(['draft', 'submitted', 'graded']);

export const createAssignmentSchema = z.object({
  title: z.string().trim().min(1, { message: 'Title is required' }).max(200),
  description: z.string().max(5000).optional().nullable(),
  subject_id: uuidSchema.optional().nullable(),
  class_id: uuidSchema,
  due_date: dateOnlySchema,
  max_score: z.coerce.number().min(1).max(1000).default(100),
  file_url: z.string().max(1000).optional().nullable(),
});

export const updateAssignmentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  due_date: dateOnlySchema.optional(),
  max_score: z.coerce.number().min(1).max(1000).optional(),
  status: assignmentStatusSchema.optional(),
});

export const submitAssignmentSchema = z.object({
  student_id: uuidSchema.optional(), // staff/management can submit on a student's behalf
  submission_text: z.string().max(10000).optional().nullable(),
  file_url: z.string().max(1000).optional().nullable(),
});

export const gradeSubmissionSchema = z.object({
  student_id: uuidSchema,
  grade: z.coerce.number().min(0).max(1000),
  feedback: z.string().max(2000).optional().nullable(),
});

export const assignmentQuerySchema = z.object({
  class_id: uuidSchema.optional(),
  subject_id: uuidSchema.optional(),
  status: assignmentStatusSchema.optional(),
  student_id: uuidSchema.optional(), // per-student view (self/children scope enforced in service)
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
});