import { z } from 'zod';

export const createPromotionSchema = z.object({
  student_id: z.string().uuid(),
  from_class_id: z.string().uuid().optional().or(z.literal('')),
  from_section_id: z.string().uuid().optional().or(z.literal('')),
  to_class_id: z.string().uuid(),
  to_section_id: z.string().uuid().optional().or(z.literal('')),
  academic_year_id: z.string().uuid().optional().or(z.literal('')),
  academic_year: z.string().max(60).optional(),
  remarks: z.string().max(1000).optional(),
});