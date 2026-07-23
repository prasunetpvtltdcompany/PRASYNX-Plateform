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
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface User {
  id: string;
  organisation_id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  password_hash?: string;
  created_at?: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  organisation_id: string;
  full_name: string;
  teacher_code: string;
  subject?: string;
  phone?: string;
  status: string;
  created_at?: string;
}

export interface Student {
  id: string;
  organisation_id: string;
  full_name: string;
  roll_number: string;
  student_class?: string;
  section?: string;
  phone?: string;
  status: string;
  created_at?: string;
}

export interface Class {
  id: string;
  organisation_id: string;
  class_name: string;
  section?: string;
  status?: string;
  created_at?: string;
}
