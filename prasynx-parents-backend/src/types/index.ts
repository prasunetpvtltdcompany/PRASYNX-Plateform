import { Request } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  organisationId: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
  token?: string;
  supabase?: SupabaseClient;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
