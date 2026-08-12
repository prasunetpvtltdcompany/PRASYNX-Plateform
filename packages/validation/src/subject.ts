import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().max(30).optional(),
  description: z.string().max(1000).optional(),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().max(30).optional(),
  description: z.string().max(1000).optional(),
});