import { z } from 'zod';

export const createAiLessonSchema = z.object({
  title: z.string().min(1).max(300),
  subject_id: z.string().uuid().optional().or(z.literal('')),
  class_id: z.string().uuid().optional().or(z.literal('')),
  topic: z.string().max(200).optional(),
  duration: z.number().int().min(1).max(600).optional(),
  objectives: z.array(z.string().max(500)).max(20).optional(),
  content: z.string().max(20000).optional(),
  materials: z.array(z.string().max(1000)).max(20).optional(),
  status: z.string().max(30).optional(),
});

export const createAiQuizSchema = z.object({
  title: z.string().min(1).max(300),
  subject_id: z.string().uuid().optional().or(z.literal('')),
  class_id: z.string().uuid().optional().or(z.literal('')),
  topic: z.string().max(200).optional(),
  difficulty: z.string().max(30).optional(),
  questions: z.array(z.unknown()).max(200).optional(),
  status: z.string().max(30).optional(),
});