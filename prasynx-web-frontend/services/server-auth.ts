import { createServerClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types';

export async function getSession() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const supabase = await createServerClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}

export async function requireAuth() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { redirect: { destination: '/signin', permanent: false } };
  }
  return { profile };
}

export async function requireRole(allowedRoles: UserRole[]) {
  const result = await requireAuth();
  if ('redirect' in result) return result;

  if (!allowedRoles.includes(result.profile.role)) {
    return { redirect: { destination: '/signin', permanent: false } };
  }

  return result;
}

export function roleDashboard(role: UserRole): string {
  const map: Record<UserRole, string> = {
    student: '/student/dashboard',
    parent: '/parent/dashboard',
    teacher: '/staff/dashboard',
    staff: '/staff/dashboard',
    institution: '/management/dashboard',
    management: '/management/dashboard',
    recruiter: '/job-provider/dashboard',
    job_provider: '/job-provider/dashboard',
    organization: '/organization/dashboard',
    admin: '/admin/dashboard',
  };
  return map[role] || '/signin';
}
