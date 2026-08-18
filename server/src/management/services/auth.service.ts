import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabase } from '../config/database';
import { config } from '../config';
import { BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError } from '../utils/errors';
import { sendPasswordResetEmail } from '../lib/mail.service';

export class AuthService {
  async login(email: string, password: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, password_hash, role, organisation_id, status')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.role !== 'management') {
      throw new ForbiddenError('Unauthorized role for this portal');
    }

    if (user.status !== 'active') {
      throw new ForbiddenError('Account is not yet approved by admin');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const { data: organisation, error: orgError } = await supabase
      .from('organisations')
      .select('*')
      .eq('id', user.organisation_id)
      .single();

    if (orgError || !organisation) {
      throw new NotFoundError('Organisation not found');
    }

    if (organisation.status !== 'verified') {
      throw new ForbiddenError('Organisation is not verified by admin');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        organisationId: user.organisation_id
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    // Return both `token` and `accessToken` for compatibility with
    // different frontend clients (legacy and apps/web).
    return {
      token,
      accessToken: token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
        organisation_id: user.organisation_id
      },
      organisation
    };
  }

  async register(data: {
    name: string;
    address?: string;
    phone?: string;
    email: string;
    password: string;
  }) {
    const orgId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(data.password, 10);

    const { error: orgError } = await supabase
      .from('organisations')
      .insert([{
        id: orgId,
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        status: 'pending'
      }]);

    if (orgError) {
      throw new BadRequestError(orgError.message);
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        organisation_id: orgId,
        full_name: data.name,
        email: data.email,
        password_hash: passwordHash,
        role: 'management',
        status: 'pending'
      }])
      .select()
      .single();

    if (userError) {
      await supabase.from('organisations').delete().eq('id', orgId);
      throw new BadRequestError(userError.message);
    }

    return {
      orgId,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      },
      message: 'Organisation registration submitted for approval.'
    };
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
    await supabase.from('password_reset_tokens').insert({
      email: user.email,
      token_hash: tokenHash,
      expires_at: expiresAt
    });
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
    await sendPasswordResetEmail(user.email, resetLink);
    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { data: resetRecord, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .is('used_at', null)
      .single();
    if (error || !resetRecord) throw new BadRequestError('Invalid or expired reset token');
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
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
      );
      return { token: newToken, expires_in: config.jwtExpiresIn };
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}

export const authService = new AuthService();
