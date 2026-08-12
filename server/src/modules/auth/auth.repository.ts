import { db } from '../../infrastructure/database/supabase';
import type { UserRow, UserStatus } from '@prasynx/types';
import { NotFoundError } from '../../shared/errors/errors';

/**
 * auth.repository - ONLY place in the auth module that touches Supabase.
 * Uses the service-role client: before first login there is no user JWT yet.
 */
export class AuthRepository {
  async findUserByEmail(email: string): Promise<UserRow | null> {
    const { data } = await db.from('users').select('id,full_name,email,password_hash,role,organisation_id,status,created_at').eq('email', email).maybeSingle();
    return (data as UserRow | null) ?? null;
  }

  async findUserById(id: string): Promise<UserRow | null> {
    const { data } = await db.from('users').select('id,full_name,email,password_hash,role,organisation_id,status,created_at').eq('id', id).maybeSingle();
    return (data as UserRow | null) ?? null;
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    const { error } = await db.from('users').update({ password_hash: passwordHash }).eq('id', userId);
    if (error) throw new NotFoundError(`Could not update password: ${error.message}`);
  }

  async syncAuthPassword(userId: string, password: string): Promise<{ ok: boolean; error?: string }> {
    const { error } = await db.auth.admin.updateUserById(userId, { password });
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  async getUsersByOrganisationId(organisationId: string): Promise<UserRow[]> {
    const { data } = await db
      .from('users')
      .select('id,full_name,email,role,organisation_id,status,created_at')
      .eq('organisation_id', organisationId);
    return (data as UserRow[]) ?? [];
  }

  async setUserStatus(userId: string, status: UserStatus): Promise<void> {
    const { error } = await db.from('users').update({ status }).eq('id', userId);
    if (error) throw new NotFoundError(`Could not update user status: ${error.message}`);
  }

  async insertPasswordReset(email: string, tokenHash: string, expiresAt: string): Promise<void> {
    const { error } = await db.from('password_reset_tokens').insert({ email, token_hash: tokenHash, expires_at: expiresAt });
    if (error) throw new NotFoundError(`Could not create reset token: ${error.message}`);
  }

  async findPasswordReset(tokenHash: string): Promise<{ email: string; expires_at: string } | null> {
    const { data } = await db
      .from('password_reset_tokens')
      .select('email,expires_at')
      .eq('token_hash', tokenHash)
      .is('used_at', null)
      .maybeSingle();
    return (data as { email: string; expires_at: string } | null) ?? null;
  }

  async markResetUsed(tokenHash: string): Promise<void> {
    await db.from('password_reset_tokens').update({ used_at: new Date().toISOString() }).eq('token_hash', tokenHash);
  }

  /** Whether the school has been granted this portal by PRASYNX. */
  async hasOrganisationPortal(organisationId: string, portal: string): Promise<boolean> {
    const { data } = await db.from('organisation_portals').select('id').eq('organisation_id', organisationId).eq('portal', portal).maybeSingle();
    return !!data;
  }
}