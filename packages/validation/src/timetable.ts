import { z } from 'zod';

export const dayOfWeekSchema = z.number().int().min(0).max(6);

export const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, { message: 'Time must be HH:mm' });

export const timetableEntryInputSchema = z.object({
  subject_id: z.string().uuid({ message: 'Invalid subject id' }),
  day_of_week: dayOfWeekSchema,
  start_time: timeSchema,
  end_time: timeSchema,
  room: z.string().max(100).optional().nullable(),
});

export const upsertTimetableSchema = z.object({
  class_id: z.string().uuid({ message: 'Invalid class id' }),
  /** Replace the full weekly grid for this class. */
  entries: z.array(timetableEntryInputSchema).max(500, { message: 'Too many timetable entries (max 500)' }),
});

export const deleteTimetableEntriesSchema = z.object({
  entry_ids: z.array(z.string().uuid({ message: 'Invalid entry id' })).min(1).max(500),
});

export const timetableQuerySchema = z.object({
  class_id: z.string().uuid({ message: 'Invalid class id' }).optional(),
  day_of_week: dayOfWeekSchema.optional(),
});