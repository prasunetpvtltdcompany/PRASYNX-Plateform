import { z } from 'zod';
import { emailSchema, passwordSchema } from './common';

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' }),
  // Human-readable client/device label logged against the session.
  userAgent: z.string().max(300).optional().default(''),
  ip: z.string().max(64).optional().default(''),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(20, { message: 'Invalid refresh token' }),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(20, { message: 'Invalid refresh token' }).optional(),
  // logout("all") kills every session; default kills only the presenting one.
  all: z.enum(['true', 'false']).optional().default('false'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20, { message: 'Invalid reset token' }),
  newPassword: passwordSchema,
});