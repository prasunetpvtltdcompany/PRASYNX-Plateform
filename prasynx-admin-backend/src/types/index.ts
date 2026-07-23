import { Request } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  organisationId?: string;
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
