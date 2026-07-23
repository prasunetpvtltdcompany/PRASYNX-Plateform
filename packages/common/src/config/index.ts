import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

export interface SupabaseConfig {
  url: string;
  key: string;
}

export function createSupabaseClient(config: SupabaseConfig): SupabaseClient {
  if (!config.url || !config.key) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be set');
  }
  return createClient(config.url, config.key);
}

export function getSupabaseConfig(): SupabaseConfig {
  return {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_KEY || '',
  };
}

export function getJwtConfig() {
  return {
    secret: process.env.JWT_SECRET || 'prasunet-jwt-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  };
}

export function getAllowedOrigins(defaultPort: number): string[] {
  return [process.env.CORS_ORIGIN || `http://localhost:${defaultPort}`];
}
