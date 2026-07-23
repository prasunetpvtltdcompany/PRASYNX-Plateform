import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sendError } from '../utils/response';

export const enforceOrgAccess = () => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }
    const orgId = req.params.organisation_id || req.params.org_id || req.body.organisation_id;
    if (orgId && orgId !== req.user.organisationId) {
      sendError(res, 'Tenant access denied', 403);
      return;
    }
    next();
  };
};
