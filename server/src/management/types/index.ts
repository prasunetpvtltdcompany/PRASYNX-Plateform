import { Request } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import type { AuthenticatedUser } from '@prasynx/types';

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
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
  organisation_id: string;
  full_name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  password_hash?: string;
  created_at?: string;
}

export interface Student {
  id: string;
  organisation_id: string;
  full_name: string;
  roll_number: string;
  class_id?: string;
  section_id?: string;
  phone?: string;
  parent_email?: string;
  parent_phone?: string;
  status: string;
  created_at?: string;
}

export interface Staff {
  id: string;
  user_id: string;
  organisation_id: string;
  full_name: string;
  staff_unique_id: string;
  subject?: string;
  phone?: string;
  status: string;
  created_at?: string;
}

export interface Class {
  id: string;
  organisation_id: string;
  name: string;
  section?: string;
  capacity?: number;
  status: string;
  created_at?: string;
}
