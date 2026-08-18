import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest, JwtPayload } from '../types';
import { sendError } from '../utils/response';

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication required. No token provided.', 401);
    return;
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], config.jwtSecret) as JwtPayload;
    req.user = decoded as any;
    next();
  } catch {
    sendError(res, 'Invalid or expired token.', 401);
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) { sendError(res, 'Authentication required.', 401); return; }
    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, `Access denied. Required role: ${allowedRoles.join(', ')}`, 403);
      return;
    }
    next();
  };
};

export const enforceOwnership = (paramName: string, claimKey: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) { sendError(res, 'Authentication required.', 401); return; }
    const paramValue = req.params[paramName];
    const userValue = (req.user as any)[claimKey] || req.user.userId;
    if (paramValue && paramValue !== userValue) {
      sendError(res, 'Access denied: resource does not belong to you.', 403);
      return;
    }
    next();
  };
};

export const enforceStudentAccess = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) { sendError(res, 'Authentication required.', 401); return; }
  const studentId = req.params.student_id;
  if (studentId && studentId !== req.user.userId) {
    sendError(res, 'Access denied: you can only access your own records.', 403);
    return;
  }
  next();
};

export const enforceParentChildAccess = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) { sendError(res, 'Authentication required.', 401); return; }
  next();
};

export const enforceRoleAccess = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) { sendError(res, 'Authentication required.', 401); return; }
    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, `Access denied. Required role: ${allowedRoles.join(', ')}`, 403);
      return;
    }
    next();
  };
};
