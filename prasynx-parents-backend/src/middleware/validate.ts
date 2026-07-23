import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const messages = (error.issues || []).map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        sendError(res, messages, 400);
        return;
      }
      sendError(res, 'Validation failed', 400);
    }
  };
};
