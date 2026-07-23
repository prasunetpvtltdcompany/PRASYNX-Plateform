'use client';

'use client';

import { createBrowserClient } from '@/lib/supabase/browser';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Profile, UserRole } from '@/types';
import { ROLE_DASHBOARD_MAP } from '@/types';

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  role: UserRole | null;
  dashboardUrl: string;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  role: null,
  dashboardUrl: '/',
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createBrowserClient();

  const refresh = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setUser(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    setUser(data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        refresh();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const role = user?.role ?? null;
  const dashboardUrl = role ? ROLE_DASHBOARD_MAP[role] : '/';

  return (
    <AuthContext.Provider value={{ user, loading, role, dashboardUrl, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
