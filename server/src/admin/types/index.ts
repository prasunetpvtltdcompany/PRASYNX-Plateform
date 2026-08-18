import { Request } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

// NOTE: `user`, `token` and `supabase` are already augmented on Express.Request
// by the monolith (shared/types/express.ts), so AuthRequest inherits them and
// must not redeclare them (that would conflict with the global augmentation).
export interface AuthRequest extends Request {
  token?: string;
  supabase?: SupabaseClient;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface Organisation {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  status: 'pending' | 'verified' | 'suspended';
  created_at?: string;
}

export interface User {
  id: string;
  organisation_id?: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  password_hash?: string;
  created_at?: string;
}
