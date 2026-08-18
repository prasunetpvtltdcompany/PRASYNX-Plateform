import { z } from 'zod';

export const loginSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

export const createOrgSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  secondary_email: z.string().email('Invalid secondary email').optional().or(z.literal('')),
  contact_person: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  plan: z.enum(['starter', 'growth', 'professional', 'premium', 'enterprise']).default('starter'),
  billing_cycle: z.enum(['monthly', 'yearly']).default('yearly'),
  plan_price: z.number().nonnegative().optional(),
  currency: z.string().default('USD'),
  student_capacity: z.number().int().positive().optional(),
  max_admins: z.number().int().positive().optional(),
  subscription_start: z.string().optional(),
  expiry_date: z.string().optional(),
  modules: z.array(z.enum(['management', 'staff', 'student', 'parent'])).optional(),
  notes: z.string().optional()
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
