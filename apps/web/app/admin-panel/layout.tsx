"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./contexts/AuthContext";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
