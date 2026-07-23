import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest, JwtPayload } from '../types';
import { sendError } from '../utils/response';
import { createUserClient } from '../config/database';

const ADMIN_ROLES = ['admin', 'supervisor', 'owner'];

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.token;
  const token = (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : cookieToken) || '';
  if (!token) {
    sendError(res, 'Authentication required. No token provided.', 401);
    return;
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    if (!ADMIN_ROLES.includes(decoded.role)) {
      sendError(res, 'Access denied. Admin role required.', 403);
      return;
    }
    req.user = decoded;
    req.token = token;
    req.supabase = createUserClient(token);
    next();
  } catch {
    sendError(res, 'Invalid or expired token.', 403);
  }
};
