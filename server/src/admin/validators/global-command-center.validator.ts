import { z } from 'zod';

export const impersonateStartSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.string().min(1, 'Role is required'),
  organisationId: z.string().min(1, 'Organisation ID is required'),
  orgName: z.string().min(1, 'Organisation name is required'),
  userName: z.string().min(1, 'User name is required'),
});

export const impersonateStopSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

export const orgSearchSchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  plan: z.string().optional(),
  region: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export const globalSearchSchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters'),
  type: z.enum(['all', 'organizations', 'students', 'staff', 'parents']).optional().default('all'),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
});

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  orgId: z.string().optional(),
  portal: z.string().optional(),
  action: z.string().optional(),
});
