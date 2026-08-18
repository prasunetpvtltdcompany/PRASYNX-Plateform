import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/backend-common';
import { config } from '../config';
import { AuthRequest, JwtPayload } from '../types';
import { sendError } from '../utils/response';
import { createUserClient } from '../config/database';

// Accepts tokens signed by EITHER the staff backend OR the management backend JWT_SECRET.
const secrets = [config.jwtSecret, process.env.MANAGEMENT_JWT_SECRET].filter(Boolean) as string[];

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.token;
  const token = (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : cookieToken) || '';
  if (!token) {
    sendError(res, 'Authentication required. No token provided.', 401);
    return;
  }
  let decoded: JwtPayload | null = null;
  for (const secret of secrets) {
    try {
      decoded = jwt.verify(token, secret) as JwtPayload;
      break;
    } catch {}
  }
  if (!decoded) {
    sendError(res, 'Invalid or expired token.', 403);
    return;
  }
  req.user = decoded as any;
  req.token = token;
  req.supabase = createUserClient(token);
  next();
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, `Access denied. Required role: ${allowedRoles.join(', ')}`, 403);
      return;
    }

    next();
  };
};

export const enforceTeacherAccess = () => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) { sendError(res, 'Authentication required.', 401); return; }
    const teacherId = req.params.teacher_id;
    if (!teacherId) { next(); return; }
    const { data: teacher } = await supabase.from('staff_records').select('user_id').eq('id', teacherId).single();
    if (!teacher || teacher.user_id !== req.user.userId) {
      sendError(res, 'Access denied: you can only access your own records.', 403);
      return;
    }
    next();
  };
};

export const enforceUserAccess = (paramName: string = 'user_id') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) { sendError(res, 'Authentication required.', 401); return; }
    const paramValue = req.params[paramName];
    if (paramValue && paramValue !== req.user.userId) {
      sendError(res, 'Access denied: resource does not belong to you.', 403);
      return;
    }
    next();
  };
};
