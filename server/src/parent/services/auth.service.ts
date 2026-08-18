import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabase } from '../config/database';
import { config } from '../config';
import { UnauthorizedError, ForbiddenError, BadRequestError } from '../utils/errors';
import { sendPasswordResetEmail } from '../lib/mail.service';

export class AuthService {
  async login(email: string, password: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id,full_name,email,password_hash,role,organisation_id,status')
      .eq('email', email)
      .single();

    if (error || !user) throw new UnauthorizedError('Invalid email or password');
    if (user.role !== 'parent') throw new ForbiddenError('Unauthorized role');
    if (user.status !== 'active') throw new ForbiddenError('Account is not active');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    const { data: parent } = await supabase
      .from('parents')
      .select('*')
      .eq('user_id', user.id)
      .eq('organisation_id', user.organisation_id)
      .maybeSingle();

    let students: any[] = [];
    const { data: links } = await supabase
      .from('parent_student_links')
      .select('student_id')
      .eq('parent_id', user.id);
    if (links && links.length > 0) {
      const { data: linked } = await supabase
        .from('students')
        .select('*')
        .in('id', links.map(l => l.student_id))
        .eq('organisation_id', user.organisation_id);
      if (linked) students = linked;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, organisationId: user.organisation_id },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return {
      token,
      parent,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, organisation_id: user.organisation_id },
      students
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
    await supabase.from('password_reset_tokens').insert({ email: user.email, token_hash: tokenHash, expires_at: expiresAt });
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3004'}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
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
