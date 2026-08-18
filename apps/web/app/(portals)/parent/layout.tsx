'use client';

import type { ReactNode } from 'react';
import { LanguageProvider } from './language/LanguageProvider';
import { AuthProvider } from './contexts/AuthContext';
import PreranaAILauncherWrapper from './lib/prerana-ai/PreranaAILauncherWrapper';

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="parent-portal">
          {children}
          <PreranaAILauncherWrapper role="parent" />
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}
