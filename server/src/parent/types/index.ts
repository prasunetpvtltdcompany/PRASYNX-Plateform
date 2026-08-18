import { Request } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

// NOTE: `user`, `token` and `supabase` are already augmented on Express.Request
// by the monolith (shared/types/express.ts), so AuthRequest inherits them and
// must not redeclare them (that would conflict with the global augmentation).
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  organisationId: string | null;
}

export interface AuthRequest extends Request {
  token?: string;
  supabase?: SupabaseClient;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
