import { createClient } from '@supabase/supabase-js';
import { config } from './index';

export const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
  auth: { persistSession: false }
});

export const createUserClient = (jwt?: string) => {
  const headers: Record<string, string> = {};
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    global: { headers },
    auth: { persistSession: false }
  });
};
