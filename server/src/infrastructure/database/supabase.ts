import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from '../../config';

/**
 * SINGLE access point to Supabase. Two client kinds, used deliberately:
 *
 * - `db`        : service-role client. Bypasses RLS. USE ONLY for platform/admin
 *                 system operations inside repositories. Never in user flows.
 * - `rlsClient` : per-request client built from the end-user's JWT. Respects
 *                 RLS and is the DEFAULT for authenticated business flows.
 *
 * Repositories accept a client so controllers/middleware decide which one applies.
 */
export const db: SupabaseClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
  auth: { persistSession: false },
});

export function rlsClient(jwt?: string): SupabaseClient {
  const headers: Record<string, string> = {};
  if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
  return createClient(config.supabase.url, config.supabase.anonKey, {
    global: { headers },
    auth: { persistSession: false },
  });
}

/** Alias kept for clarity at call sites: repositories on the service role. */
export const serviceRoleClient = db;

import { currentRequestToken } from '../context/requestContext';

/**
 * DEFAULT client for business flows: respects RLS by building a per-request
 * client from the authenticated user's JWT. Falls back to the service-role
 * client only when no authenticated token exists (health checks, background
 * jobs, batch/import jobs). Prefer this over `db` in repositories.
 */
export function requestDb(): SupabaseClient {
  const token = currentRequestToken();
  return token ? rlsClient(token) : db;
}