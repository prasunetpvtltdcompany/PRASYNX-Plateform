import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/backend-common';
import { config } from '../config';
import { AuthRequest, JwtPayload } from '../types';
import { sendError } from '../utils/response';
import { createUserClient } from '../config/database';

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
    req.user = decoded as any;
    req.token = token;
    req.supabase = createUserClient(token);
    next();
  } catch {
    sendError(res, 'Invalid or expired token.', 403);
  }
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

export const enforceStudentAccess = () => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) { sendError(res, 'Authentication required.', 401); return; }
    const studentId = req.params.student_id;
    if (!studentId) { next(); return; }
    if (studentId === req.user.userId) { next(); return; }
    const { data: student } = await supabase.from('students').select('user_id').eq('id', studentId).single();
    if (!student || student.user_id !== req.user.userId) {
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
