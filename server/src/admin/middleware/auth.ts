import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthenticatedUser } from '@prasynx/types';
import { AuthRequest } from '../types';
import { sendError } from '../utils/response';
import { createUserClient, supabase } from '../config/database';

const ADMIN_ROLES = ['admin', 'supervisor', 'owner'];

function tokenAAL(token: string): string {
  try {
    const decoded = jwt.decode(token) as { aal?: string } | null;
    return decoded?.aal || 'aal1';
  } catch {
    return 'aal1';
  }
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.token;
  const token = (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : cookieToken) || '';
  if (!token) {
    sendError(res, 'Authentication required. No token provided.', 401);
    return;
  }
  try {
    const { data: authData, error: getUserError } = await supabase.auth.getUser(token);
    if (getUserError || !authData.user) {
      sendError(res, 'Invalid or expired token.', 401);
      return;
    }
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
    if (!role || !ADMIN_ROLES.includes(role)) {
      sendError(res, 'Access denied. Admin role required.', 403);
      return;
    }
    const { data: mfaData } = await supabase.auth.admin.mfa.listFactors({ userId: authUser.id });
    const mfaAll = (mfaData as unknown as { all?: Array<{ factor_type?: string; status?: string }> | null })?.all;
    const hasVerifiedTotp = (mfaAll ?? []).some(
      (factor) => factor.factor_type === 'totp' && factor.status === 'verified'
    );
    if (hasVerifiedTotp && tokenAAL(token) !== 'aal2') {
      sendError(res, 'Multi-factor authentication verification required.', 403);
      return;
    }
    req.user = {
      userId: authUser.id,
      id: authUser.id,
      email: authUser.email || '',
      role,
      tenantId: null,
      organisationId: null,
      sessionId: '',
    } as AuthenticatedUser;
    req.token = token;
    req.supabase = createUserClient(token);
    next();
  } catch {
    sendError(res, 'Authentication failed.', 401);
  }
};