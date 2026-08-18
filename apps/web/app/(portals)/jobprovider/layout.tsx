'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';

export default function JobProviderLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="jobprovider-portal">
        {children}
        <Toaster />
      </div>
    </AuthProvider>
  );
}