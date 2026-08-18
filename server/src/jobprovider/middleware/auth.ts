import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';

/**
 * Job Provider JWT auth — ported from prasynx-jobprovider-backend.
 * Accepts the token from the Authorization header (Bearer) or the `token`
 * cookie, verifies it with the shared app JWT secret, and attaches the
 * decoded payload as `req.user`.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const cookieToken = (req.cookies && req.cookies.token) as string | undefined;
  const token = (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : cookieToken) || '';
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    (req as any).user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}
