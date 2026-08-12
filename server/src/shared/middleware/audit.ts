import type { NextFunction, Request, Response } from 'express';
import { logger } from '../logger/logger';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Audit middleware - writes a structured audit log for every authenticated
 * mutating request (who/what/tenant/when). Non-blocking and never fails the
 * request. Persisting into the existing `audit_logs` table is a follow-up that
 * must match that table's actual columns.
 */
export function audit(req: Request, _res: Response, next: NextFunction) {
  if (MUTATING.has(req.method)) {
    const user = req.user;
    if (user) {
      logger.info(
        {
          audit: true,
          requestId: req.id,
          action: `${req.method} ${req.originalUrl}`,
          userId: user.userId,
          role: user.role,
          tenantId: user.tenantId,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        },
        'audit.trail',
      );
    }
  }
  next();
}