'use client';

import type { ReactNode } from 'react';
import { LanguageProvider } from './language/LanguageProvider';
import { AuthProvider } from './contexts/AuthContext';
import PreranaAILauncherWrapper from './lib/prerana-ai/PreranaAILauncherWrapper';

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="staff-portal">
          {children}
          <PreranaAILauncherWrapper role="staff" />
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}