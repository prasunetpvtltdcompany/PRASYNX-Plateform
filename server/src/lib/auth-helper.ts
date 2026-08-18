import bcrypt from 'bcryptjs';
import { supabase } from './backend-common';

export async function createAuthUser(
  email: string,
  password: string,
  fullName: string,
  role: string,
  organisationId: string
): Promise<string> {
  const password_hash = await bcrypt.hash(password, 10);

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role,
      organisation_id: organisationId,
    },
  });

  if (authError || !authUser.user) {
    throw new Error(authError?.message || 'Failed to create auth user');
  }

  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authUser.user.id,
      organisation_id: organisationId,
      full_name: fullName,
      email,
      password_hash,
      role,
      status: 'active'
    });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authUser.user.id).catch(() => {});
    throw new Error(`Failed to create user record: ${profileError.message}`);
  }

  return authUser.user.id;
}
