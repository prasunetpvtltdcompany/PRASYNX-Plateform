import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from '../../config';

const supabaseUrl = config.supabase.url;
const serviceRoleKey = config.supabase.serviceRoleKey;
const anonKey = config.supabase.anonKey || config.supabase.serviceRoleKey;

export const db: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

export function rlsClient(jwt?: string): SupabaseClient {
  const headers: Record<string, string> = {};
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
  return createClient(supabaseUrl, anonKey, {
    global: { headers },
    auth: { persistSession: false },
  });
}

/** Alias kept for clarity at call sites: repositories on the service role. */
export const serviceRoleClient = db;

import { currentRequestToken } from '../context/requestContext';

export function requestDb(): SupabaseClient {
  const token = currentRequestToken();
  return token ? rlsClient(token) : db;
}
