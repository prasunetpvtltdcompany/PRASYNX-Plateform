import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gmqsgbrfnuwgnbutdizg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcXNnYnJmbnV3Z25idXRkaXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NDAxMTMsImV4cCI6MjA5OTUxNjExM30.sIgizVJHHMy9iZlqX46FfMtSyDatGTzs7yFnP82DReE';

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!clientInstance) {
    clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
}
