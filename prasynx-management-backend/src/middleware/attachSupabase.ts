import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { createUserClient } from '../config/database';

// Must be placed after `authenticate` middleware so req.token is populated.
export const attachSupabase = (req: AuthRequest, _res: Response, next: NextFunction) => {
  req.supabase = createUserClient(req.token);
  next();
};
