import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const createOrgSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  address: z.string().optional()
});

export const createManagementAccessSchema = z.object({
  organisation_id: z.string().min(1, 'Organisation ID is required'),
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format')
});

export const verifyOrgSchema = z.object({
  organisation_id: z.string().min(1, 'Organisation ID is required'),
  status: z.enum(['verified', 'pending', 'suspended'])
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(6, 'New password must be at least 6 characters')
});
