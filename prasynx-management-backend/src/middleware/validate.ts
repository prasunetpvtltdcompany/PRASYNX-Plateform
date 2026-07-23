import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const issues = error.issues || [];
        const messages = issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        sendError(res, messages, 400);
        return;
      }
      sendError(res, 'Validation failed', 400);
    }
  };
};

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const issues = error.issues || [];
        const messages = issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        sendError(res, messages, 400);
        return;
      }
      sendError(res, 'Validation failed', 400);
    }
  };
};
