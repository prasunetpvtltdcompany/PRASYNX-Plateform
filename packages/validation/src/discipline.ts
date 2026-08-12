import { z } from 'zod';

export const createDisciplineIncidentSchema = z.object({
  student_id: z.string().uuid(),
  incident_type: z.string().max(100).optional(),
  title: z.string().min(2).max(300),
  description: z.string().max(3000).optional(),
  severity: z.string().max(30).optional(),
  location: z.string().max(200).optional(),
  action_taken: z.string().max(500).optional(),
  status: z.string().max(30).optional(),
  evidence_url: z.string().max(1000).optional(),
});

export const updateDisciplineIncidentSchema = z.object({
  status: z.string().max(30).optional(),
  action_taken: z.string().max(500).optional(),
  action_detail: z.string().max(2000).optional(),
  resolution_notes: z.string().max(2000).optional(),
});