"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./language/LanguageProvider";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";

export default function ManagementLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <I18nProvider>
          {children}
          <Toaster />
        </I18nProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
