import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://axwhtngxveaidbscsrca.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4d2h0bmd4dmVhaWRic2NzcmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NTY3NDIsImV4cCI6MjA5MzAzMjc0Mn0.1ZgcgPiH8l6kJ7KzHLgIYD_ZFo9o3WaoIWBKRqRikSI';

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (!clientInstance) {
    clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
}
