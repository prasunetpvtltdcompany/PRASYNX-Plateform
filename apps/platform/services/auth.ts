import { createBrowserClient } from '@/lib/supabase/browser';
import type { Profile, UserRole } from '@/types';

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createBrowserClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
  role: UserRole
) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  return { data, error };
}

export async function signInWithOAuth(provider: 'google' | 'azure' | 'linkedin') {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });

  return { data, error };
}

export async function signOut() {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function sendPasswordResetEmail(email: string) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  return { data, error };
}

export async function updatePassword(newPassword: string) {
  const supabase = createBrowserClient();

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { data, error };
}

export async function createRoleProfile(
  userId: string,
  role: UserRole,
  data: Record<string, unknown>
) {
  const supabase = createBrowserClient();

  const tableMap: Record<string, string> = {
    student: 'student_profiles',
    parent: 'parent_profiles',
    teacher: 'teacher_profiles',
    institution: 'institution_profiles',
    recruiter: 'recruiter_profiles',
    organization: 'organization_profiles',
  };

  const table = tableMap[role];
  if (!table) return { error: new Error('Invalid role') };

  const { error } = await supabase.from(table).insert({
    user_id: userId,
    ...data,
  });

  return { error };
}
