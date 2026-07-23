import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(`[Error] ${err.message}`, err.stack);

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  sendError(res, 'Internal server error', 500);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
};
