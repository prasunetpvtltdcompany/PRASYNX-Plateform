import { z } from 'zod';
import { emailSchema } from './common';
import { ADMISSION_STATUSES } from '@prasynx/types';

export const createAdmissionSchema = z.object({
  applicant_name: z.string().min(2).max(200),
  applicant_email: emailSchema.optional(),
  phone: z.string().max(30).optional(),
  applying_class: z.string().max(200).optional(),
  parent_name: z.string().max(200).optional(),
  parent_phone: z.string().max(30).optional(),
  academic_year: z.string().max(100).optional(),
});

export const updateAdmissionStatusSchema = z.object({
  status: z.enum(ADMISSION_STATUSES),
});