import { createClient } from '@supabase/supabase-js';
import { config } from './index';

// Service role client — bypasses RLS. Use ONLY for admin operations
// (user creation, credential generation, system migrations)
export const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
  auth: { persistSession: false }
});

// Creates a per-request Supabase client using the anon key + user's JWT.
// This respects RLS policies and ensures tenant isolation at the DB level.
// Pass nullish token for unauthenticated requests (public data only).
export const createUserClient = (jwt?: string) => {
  const headers: Record<string, string> = {};
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }
  return createClient(config.supabase.url, config.supabase.anonKey, {
    global: { headers },
    auth: { persistSession: false }
  });
};
