// Rate limiting intentionally disabled for local development. Exports are no-op
// middlewares to keep call sites unchanged.
import { Request, Response, NextFunction } from 'express';

const noop = (req: Request, res: Response, next: NextFunction) => next();

export const apiLimiter = noop;
export const authLimiter = noop;
export const credentialLimiter = noop;
