import { z } from 'zod';

export const emailSchema = z.email({ message: 'A valid email is required' });

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .max(128, { message: 'Password must be at most 128 characters' });

export const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be in YYYY-MM-DD format',
});

export const uuidSchema = z.string().uuid({ message: 'Invalid id' });

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
});