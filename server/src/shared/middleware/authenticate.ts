import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { config } from '../../config';
import { cache } from '../../infrastructure/cache/cache';
import { bearerFrom } from '../utils/token';
import { UnauthorizedError } from '../errors/errors';
import { sessionKey } from '../../infrastructure/sessions/sessions';
import { rlsClient } from '../../infrastructure/database/supabase';
import { runWithRequestContext } from '../../infrastructure/context/requestContext';
import type { AuthenticatedUser } from '@prasynx/types';

interface JwtClaims {
  sub: string;
  email: string;
  role: string;
  tenantId: string | null;
  sessionId: string;
  iat: number;
  exp: number;
}

/** Issue an HS256 access token with the standard PRASYNX claims. */
export function issueAccessToken(p: { userId: string; email: string; role: string; tenantId: string | null; sessionId: string }): string {
  return jwt.sign(
    { sub: p.userId, email: p.email, role: p.role, tenantId: p.tenantId, sessionId: p.sessionId },
    config.jwt.secret,
    { issuer: config.jwt.issuer, audience: config.jwt.audience, expiresIn: config.jwt.accessTtl as unknown as number },
  );
}

/**
 * Authenticates the request. Verifies signature + issuer + audience, then checks
 * the session is still live in the session store so logout/revoke kill access
 * tokens before their natural expiry.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = bearerFrom(req);
    if (!token) return next(new UnauthorizedError('Authentication required. No token provided.'));

    let claims: JwtClaims;
    try {
      claims = jwt.verify(token, config.jwt.secret, {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      }) as unknown as JwtClaims;
    } catch {
      return next(new UnauthorizedError('Invalid or expired token.'));
    }

    const owner = await cache.get(sessionKey(claims.sessionId));
    if (owner === null) return next(new UnauthorizedError('Session has been revoked. Please log in again.'));
    if (owner !== claims.sub) return next(new UnauthorizedError('Session does not belong to the token subject.'));

    req.user = {
      userId: claims.sub,
      email: claims.email,
      role: claims.role as AuthenticatedUser['role'],
      tenantId: claims.tenantId,
      sessionId: claims.sessionId,
    };
    req.token = token;
    req.supabase = rlsClient(token);
    runWithRequestContext(token, () => next());
  } catch (err) {
    next(err);
  }
}

/** Guard for endpoints that only make sense inside a school (tenant claim present). */
export function requireTenant(req: Request, _res: Response, next: NextFunction) {
  if (!req.user?.tenantId) return next(new UnauthorizedError('Not scoped to a school.'));
  next();
}