import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(2).max(200),
  content: z.string().max(5000).optional(),
  target_role: z.string().max(30).optional(),
  target_class_id: z.string().uuid().nullable().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  publish: z.boolean().optional(),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  content: z.string().max(5000).optional(),
  target_role: z.string().max(30).optional(),
  target_class_id: z.string().uuid().nullable().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  publish: z.boolean().optional(),
});