import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { supabase } from '../config/database';
import { BadRequestError, UnauthorizedError, ForbiddenError } from '../utils/errors';
import { logCredential, getCredentialHistory as getStoredHistory } from '../lib/credentialStore';
import { createAuthUser } from '../lib/auth-helper';
import { sendPasswordResetEmail, sendCredentialEmail } from '../lib/mail.service';
import { billingService } from './billing.service';

const ADMIN_ROLES = ['admin', 'supervisor', 'owner'];

export class AuthService {
  async login(token: string) {
    if (!token) throw new UnauthorizedError('Token is required');

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) throw new UnauthorizedError('Invalid or expired token');
    const authUser = authData.user;

    let role = authUser.user_metadata?.role as string | undefined;
    if (!role) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', authUser.id)
        .maybeSingle();
      role = (profile as { role?: string } | null)?.role;
    }
    if (!role || !ADMIN_ROLES.includes(role)) throw new ForbiddenError('Unauthorized role');

    const { data: profile } = await supabase
      .from('users')
      .select('id,full_name,email,role')
      .eq('id', authUser.id)
      .maybeSingle();

    const { data: organisations } = await supabase.from('organisations').select('*');

    return {
      token,
      user: {
        id: authUser.id,
        full_name: (profile as any)?.full_name || authUser.user_metadata?.full_name || authUser.email || '',
        email: authUser.email || '',
        role
      },
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

  async createOrganisation(data: any) {
    const { name, address, phone, email } = data;

    if (!name || !email) throw new BadRequestError('Name and email required');

    const { data: org, error: orgError } = await supabase
      .from('organisations')
      .insert({
        name,
        address,
        phone,
        email,
        website: data.website || null,
        secondary_email: data.secondary_email || null,
        contact_person: data.contact_person || null,
        city: data.city || null,
        country: data.country || null,
        modules: Array.isArray(data.modules) && data.modules.length ? data.modules : ['management', 'staff', 'student', 'parent'],
        notes: data.notes || null,
        status: 'verified',
      })
      .select()
      .single();

    if (orgError) throw new BadRequestError(orgError.message);

    const planKey = data.plan || 'starter';
    const billingCycle = data.billing_cycle || 'yearly';
    const { data: planRow } = await supabase
      .from('subscription_plans').select('id, monthly_price, yearly_price').eq('plan_key', planKey).maybeSingle();
    const catalogPrice = billingCycle === 'yearly' ? Number(planRow?.yearly_price) || 0 : Number(planRow?.monthly_price) || 0;
    const amount = data.plan_price != null ? Number(data.plan_price) : catalogPrice;
    const startDate = data.subscription_start ? new Date(data.subscription_start).toISOString() : new Date().toISOString();
    const expiryDate = data.expiry_date ? new Date(data.expiry_date).toISOString() : null;
    const currency = data.currency || 'INR';

    const nextBilling = expiryDate || (() => {
      const d = new Date(startDate);
      if (billingCycle === 'yearly') d.setMonth(d.getMonth() + 12);
      else d.setDate(d.getDate() + 30);
      return d.toISOString();
    })();

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        organisation_id: org.id,
        plan_id: planRow?.id || null,
        plan_key: planKey,
        status: 'active',
        billing_cycle: billingCycle,
        amount,
        currency,
        auto_renew: true,
        start_date: startDate,
        current_period_start: startDate,
        current_period_end: nextBilling,
      })
      .select()
      .single();

    if (subError) {
      await supabase.from('organisations').delete().eq('id', org.id);
      throw new BadRequestError(`Subscription creation failed: ${subError.message}`);
    }

    await billingService.ensureInvoiceForSubscription(subscription);

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
      organisation: {
        ...org,
        plan: planKey,
        billing_cycle: billingCycle,
        plan_price: amount,
        currency,
        subscription_start: startDate,
        expiry_date: expiryDate,
      },
      subscription,
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
    const { data: authData, error } = await supabase.auth.getUser(token);
    if (error || !authData.user) throw new UnauthorizedError('Invalid or expired token');
    const u = authData.user;
    return {
      sub: u.id,
      userId: u.id,
      email: u.email,
      role: u.user_metadata?.role || null,
      sessionId: ''
    };
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
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: token });
    if (error || !data.session) {
      const { data: refreshData } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: token
      });
      if (!refreshData.session) throw new UnauthorizedError('Invalid or expired token');
      return { token: refreshData.session.access_token, refresh_token: refreshData.session.refresh_token };
    }
    return { token: data.session.access_token, refresh_token: data.session.refresh_token };
  }
}

export const authService = new AuthService();
