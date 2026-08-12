import { z } from 'zod';

export const createNotificationSchema = z.object({
  user_id: z.string().uuid().optional(),
  title: z.string().min(1).max(300),
  message: z.string().max(2000).optional(),
  type: z.enum(['info', 'success', 'warning', 'danger']).optional(),
  reference_type: z.string().max(100).optional(),
  reference_id: z.string().max(100).optional(),
  target_role: z.string().max(60).optional(),
});