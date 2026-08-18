'use client';

import type { ReactNode } from 'react';
import { LanguageProvider } from './language/LanguageProvider';
import { AuthProvider } from './contexts/AuthContext';
import PreranaAILauncherWrapper from './lib/prerana-ai/PreranaAILauncherWrapper';

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="student-portal">
          {children}
          <PreranaAILauncherWrapper role="student" />
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}