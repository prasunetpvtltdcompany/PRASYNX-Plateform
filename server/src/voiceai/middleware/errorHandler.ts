import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[VoiceAI Error]', err.message);
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }
  sendError(res, 'Internal server error', 500);
};

export const notFoundHandler = (_req: Request, res: Response) => {
  sendError(res, 'Route not found', 404);
};
