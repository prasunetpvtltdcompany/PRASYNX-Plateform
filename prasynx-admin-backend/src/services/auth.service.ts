import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabase } from '../config/database';
import { config } from '../config';
import { BadRequestError, UnauthorizedError, ForbiddenError } from '../utils/errors';
import { logCredential, getCredentialHistory as getStoredHistory } from '../lib/credentialStore';
import { createAuthUser } from '../lib/auth-helper';
import { sendPasswordResetEmail, sendCredentialEmail } from '../lib/mail.service';

const ADMIN_ROLES = ['admin', 'supervisor', 'owner'];

export class AuthService {
  async login(email: string, password: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id,full_name,email,password_hash,role')
      .eq('email', email)
      .single();

    if (error || !user) throw new UnauthorizedError('User not found');
    if (!ADMIN_ROLES.includes(user.role)) throw new ForbiddenError('Unauthorized role');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    const { data: organisations } = await supabase.from('organisations').select('*');

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, organisationId: null },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return {
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
      organisations: organisations || []
    };
  }

  async getCredentialHistory() {
    return getStoredHistory();
  }

  async verifyOrg(organisationId: string, status: string) {
    const { error: orgError } = await supabase.from('organisations').update({ status }).eq('id', organisationId);
    if (orgError) throw new BadRequestError(orgError.message);

    const userStatus = status === 'verified' ? 'active' : 'pending';
    const { error: userError } = await supabase
      .from('users')
      .update({ status: userStatus })
      .eq('organisation_id', organisationId)
      .eq('role', 'management');

    if (userError) throw new BadRequestError(userError.message);
    return { message: 'Organisation and management access status updated' };
  }

  async createOrganisation(data: { name: string; address?: string; phone?: string; email: string }) {
    const { name, address, phone, email } = data;

    if (!name || !email) throw new BadRequestError('Name and email required');

    const { data: org, error: orgError } = await supabase
      .from('organisations')
      .insert({ name, address, phone, email, status: 'verified' })
      .select()
      .single();

    if (orgError) throw new BadRequestError(orgError.message);

    const password = crypto.randomBytes(8).toString('hex');

    let userId: string;
    try {
      userId = await createAuthUser(email, password, name, 'management', org.id);
    } catch (authError: any) {
      await supabase.from('organisations').delete().eq('id', org.id);
      throw new BadRequestError(`Auth creation failed: ${authError.message}`);
    }

    logCredential(org.id, name, name, email, 'management', 'Admin Portal');
    await sendCredentialEmail(email, name, password, 'Management Portal');

    return {
      organisation: org,
      credentials: { email, password, full_name: name, role: 'management' },
      user_id: userId
    };
  }

  async createManagementAccess(data: { organisation_id: string; full_name: string; email: string }) {
    const { organisation_id, full_name, email } = data;

    if (!organisation_id || !full_name || !email) {
      throw new BadRequestError('organisation_id, full_name, and email required');
    }

    const password = crypto.randomBytes(8).toString('hex');

    let userId: string;
    try {
      userId = await createAuthUser(email, password, full_name, 'management', organisation_id);
    } catch (authError: any) {
      throw new BadRequestError(`Auth creation failed: ${authError.message}`);
    }

    const { data: org } = await supabase.from('organisations').select('name').eq('id', organisation_id).maybeSingle();
    logCredential(organisation_id, org?.name || '', full_name, email, 'management', 'Admin Portal');
    await sendCredentialEmail(email, full_name, password, 'Management Portal');

    return { credentials: { email, password, full_name, role: 'management' }, user_id: userId };
  }

  async changePassword(email: string, currentPassword: string, newPassword: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id,password_hash')
      .eq('email', email)
      .single();

    if (error || !user) throw new UnauthorizedError('User not found');

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) throw new UnauthorizedError('Current password is incorrect');

    const password_hash = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase.from('users').update({ password_hash }).eq('id', user.id);
    if (updateError) throw new BadRequestError(updateError.message);

    return { message: 'Password changed successfully' };
  }

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      return decoded;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  async forgotPassword(email: string) {
    const { data: user } = await supabase.from('users').select('id, email').eq('email', email).maybeSingle();
    if (!user) return { message: 'If the email exists, a reset link has been sent' };
    const resetToken = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await supabase.from('password_reset_tokens').insert({ email: user.email, token_hash: tokenHash, expires_at: expiresAt });
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3005'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
    await sendPasswordResetEmail(user.email, resetLink);
    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { data: resetRecord } = await supabase.from('password_reset_tokens').select('*').eq('token_hash', tokenHash).is('used_at', null).single();
    if (!resetRecord) throw new BadRequestError('Invalid or expired reset token');
    if (new Date(resetRecord.expires_at) < new Date()) throw new BadRequestError('Reset token has expired');
    const { data: user } = await supabase.from('users').select('id').eq('email', resetRecord.email).single();
    if (!user) throw new BadRequestError('User not found');
    const password_hash = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase.from('users').update({ password_hash }).eq('id', user.id);
    if (updateError) throw new BadRequestError(updateError.message);
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(user.id, { password: newPassword });
    if (authUpdateError) {
      const { data: oldUser } = await supabase.from('users').select('password_hash').eq('id', user.id).single();
      await supabase.from('users').update({ password_hash: oldUser?.password_hash }).eq('id', user.id);
      throw new BadRequestError(`Auth update failed: ${authUpdateError.message}. Password reset rolled back.`);
    }
    await supabase.from('password_reset_tokens').update({ used_at: new Date().toISOString() }).eq('token_hash', tokenHash);
    return { message: 'Password has been reset successfully' };
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      const newToken = jwt.sign(
        { userId: decoded.userId, email: decoded.email, role: decoded.role, organisationId: decoded.organisationId },
        config.jwtSecret, { expiresIn: config.jwtExpiresIn as any }
      );
      return { token: newToken, expires_in: config.jwtExpiresIn };
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}

export const authService = new AuthService();
