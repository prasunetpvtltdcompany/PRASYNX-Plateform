import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/backend-common';
import { config } from '../config';
import { AuthRequest } from '../types';
import { sendError } from '../utils/response';

export const verifyManagementAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication required. No token provided.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .maybeSingle();

    if (!profile) {
      sendError(res, 'Profile not found. Contact administrator.', 401);
      return;
    }

    if (profile.role !== 'management') {
      sendError(res, 'Unauthorized role for management portal.', 403);
      return;
    }

    if (profile.status !== 'active') {
      sendError(res, 'Account disabled. Contact administrator.', 403);
      return;
    }

    req.user = {
      userId: profile.id,
      email: profile.email || '',
      role: profile.role,
      tenantId: profile.organisation_id || null,
      organisationId: profile.organisation_id || null,
      sessionId: profile.session_id || '',
      id: profile.id
    } as any;

    next();
  } catch (error: any) {
    sendError(res, 'Invalid or expired token.', 401);
  }
};

export const enforceOrgAccess = () => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user?.organisationId) {
      sendError(res, 'No organisation access configured for this account.', 403);
      return;
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const orgId = req.params.organisation_id || req.params.org_id || req.body.organisation_id || req.query.organisation_id;

    if (orgId) {
      if (!UUID_RE.test(orgId)) {
        sendError(res, 'Invalid organisation_id format.', 400);
        return;
      }
      if (orgId !== req.user.organisationId) {
        sendError(res, 'Cross-organisation access denied.', 403);
        return;
      }
    }

    next();
  };
};
