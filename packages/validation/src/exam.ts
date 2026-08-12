import { z } from 'zod';
import { dateOnlySchema, uuidSchema } from './common';

export const examTypeSchema = z.enum(['midterm', 'final', 'quiz', 'unit_test', 'practical']);
export const examStatusSchema = z.enum(['upcoming', 'ongoing', 'completed']);

export const createExamSchema = z.object({
  name: z.string().trim().min(1, { message: 'Exam name is required' }).max(200),
  exam_type: examTypeSchema,
  start_date: dateOnlySchema.optional().nullable(),
  end_date: dateOnlySchema.optional().nullable(),
  max_marks: z.coerce.number().min(1).max(1000).default(100),
});

export const updateExamStatusSchema = z.object({
  status: examStatusSchema,
});

export const updateExamSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  exam_type: examTypeSchema.optional(),
  start_date: dateOnlySchema.optional().nullable(),
  end_date: dateOnlySchema.optional().nullable(),
  max_marks: z.coerce.number().min(1).max(1000).optional(),
  status: examStatusSchema.optional(),
});

export const scheduleExamSchema = z.object({
  entries: z
    .array(
      z.object({
        class_id: uuidSchema,
        subject_id: uuidSchema,
        date: dateOnlySchema,
        start_time: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Time must be HH:mm' }).optional().nullable(),
        end_time: z.string().regex(/^\d{2}:\d{2}$/, { message: 'Time must be HH:mm' }).optional().nullable(),
        room: z.string().max(100).optional().nullable(),
      }),
    )
    .min(1, { message: 'At least one schedule entry is required' })
    .max(200, { message: 'Too many schedule entries (max 200)' }),
});

export const deleteScheduleSchema = z.object({
  schedule_ids: z.array(uuidSchema).min(1).max(200),
});

export const upsertResultSchema = z.object({
  student_id: uuidSchema,
  subject_id: uuidSchema,
  marks_obtained: z.coerce.number().min(0).max(1000),
  max_marks: z.coerce.number().min(1).max(1000).optional(),
  grade: z.string().max(10).optional().nullable(),
  remarks: z.string().max(500).optional().nullable(),
});

export const recordResultsSchema = z.object({
  exam_id: uuidSchema,
  results: z.array(upsertResultSchema).min(1).max(500),
});

export const resultsQuerySchema = z.object({
  exam_id: uuidSchema.optional(),
  class_id: uuidSchema.optional(),
  student_id: uuidSchema.optional(),
});

export const examQuerySchema = z.object({
  status: examStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
});