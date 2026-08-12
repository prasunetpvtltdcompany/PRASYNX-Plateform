import type { AuthenticatedUser } from '@prasynx/types';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Express Request augmentation. Imported once in app.ts so the `user`,
 * `validated`, `token`, `supabase` properties are typed everywhere.
 */
declare global {
  namespace Express {
    interface Request {
      id?: string;
      token?: string;
      user?: AuthenticatedUser;
      supabase?: SupabaseClient;
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};