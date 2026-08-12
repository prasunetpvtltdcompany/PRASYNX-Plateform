import type { NextFunction, Request, Response } from 'express';
import { hasPermission, type Permission } from '@prasynx/config';
import { ForbiddenError } from '../errors/errors';

/**
 * RBAC guard. Requires `authenticate` to have run first (req.user populated).
 * Usage: authorize(PERMISSIONS.SCHOOL_ATTENDANCE_MANAGE)
 */
export function authorize(...required: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) return next(new ForbiddenError('Not authenticated.'));
    const hasAll = required.every((perm) => hasPermission(role, perm));
    if (!hasAll) {
      return next(new ForbiddenError(`Insufficient permissions. Requires: ${required.join(', ')}`));
    }
    next();
  };
}

/** Convenience: caller must have at least one of the given permissions. */
export function authorizeAny(...anyOf: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) return next(new ForbiddenError('Not authenticated.'));
    if (!anyOf.some((perm) => hasPermission(role, perm))) {
      return next(new ForbiddenError(`Insufficient permissions. Requires one of: ${anyOf.join(', ')}`));
    }
    next();
  };
}