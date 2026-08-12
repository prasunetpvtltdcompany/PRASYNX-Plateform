import { db } from '../../infrastructure/database/supabase';
import { ConflictError } from '../../shared/errors/errors';
import type { UserRow } from '@prasynx/types';

export interface CreateUserWithAuthInput {
  email: string;
  password: string;
  fullName: string;
  role: string;
  organisationId: string | null;
  status?: UserRow['status'];
}

/**
 * users.repository - provisions user records. Kept separate from auth so
 * registration/provisioning flows do not depend on the session machinery.
 */
export class UsersRepository {
  async findByEmail(email: string): Promise<UserRow | null> {
    const { data } = await db.from('users').select('id,full_name,email,role,organisation_id,status,created_at').eq('email', email).maybeSingle();
    return (data as UserRow | null) ?? null;
  }

  async findById(id: string): Promise<UserRow | null> {
    const { data } = await db.from('users').select('id,full_name,email,role,organisation_id,status,created_at').eq('id', id).maybeSingle();
    return (data as UserRow | null) ?? null;
  }

  /**
   * Inserts into `users` (password_hash via bcrypt) AND mirrors the account into
   * Supabase Auth (auth.users) so passwords stay in sync across both paths.
   * Rolls back the users row if the auth mirror fails.
   */
  async createUserWithAuth(input: CreateUserWithAuthInput): Promise<string> {
    const existing = await this.findByEmail(input.email);
    if (existing) throw new ConflictError(`A user with email ${input.email} already exists`);

    const { data: inserted, error } = await db
      .from('users')
      .insert({
        email: input.email,
        password_hash: input.password,
        full_name: input.fullName,
        role: input.role,
        organisation_id: input.organisationId,
        status: input.status ?? (input.organisationId ? 'active' : 'active'),
      })
      .select('id')
      .single();

    if (error || !inserted) {
      throw new ConflictError(`User creation failed: ${error?.message ?? 'unknown error'}`);
    }

    const { error: authError } = await db.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.fullName, role: input.role, organisation_id: input.organisationId },
    });

    if (authError) {
      await db.from('users').delete().eq('id', (inserted as { id: string }).id).maybeSingle();
      throw new ConflictError(`Auth user mirror failed, rolled back: ${authError.message}`);
    }

    return (inserted as { id: string }).id;
  }

  async catalogueByOrganisation(organisationId: string): Promise<UserRow[]> {
    const { data } = await db
      .from('users')
      .select('id,full_name,email,role,organisation_id,status,created_at')
      .eq('organisation_id', organisationId)
      .order('created_at', { ascending: false });
    return (data as UserRow[]) ?? [];
  }
}