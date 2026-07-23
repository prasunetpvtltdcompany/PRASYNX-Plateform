'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '../../contexts/AuthContext';

const PreranaAILauncher = dynamic(() => import('./PreranaAILauncher'), { ssr: false });

export default function PreranaAILauncherWrapper({ role }: { role: string }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return <PreranaAILauncher role={role} />;
}
