import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthenticatedUser } from '@prasynx/types';
import { config } from '../config';
import { AuthRequest, JwtPayload } from '../types';
import { UnauthorizedError } from '../utils/errors';

const toAuthenticatedUser = (claims: JwtPayload): AuthenticatedUser => {
  const userId = claims.sub || claims.userId || claims.id || '';
  return {
    userId,
    email: claims.email || '',
    role: claims.role as AuthenticatedUser['role'],
    tenantId: claims.tenantId ?? claims.organisationId ?? claims.organisation_id ?? null,
    sessionId: claims.sessionId || '',
    organisationId: claims.tenantId ?? claims.organisationId ?? claims.organisation_id ?? null,
    id: userId,
  };
};

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = toAuthenticatedUser(decoded);
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      req.user = toAuthenticatedUser(decoded);
    } catch {
      // token invalid, continue without auth
    }
  }
  next();
};