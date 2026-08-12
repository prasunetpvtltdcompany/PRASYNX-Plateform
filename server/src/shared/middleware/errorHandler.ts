import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/errors';
import { logger } from '../logger/logger';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, 'NOT_FOUND'));
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req as Request & { id?: string }).id;
  const meta = { requestId, method: req.method, path: req.originalUrl, err };

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      requestId,
      details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) logger.error(meta, err.message);
    else logger.info(meta, err.message);
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      requestId,
      ...(err.details !== undefined ? { details: err.details } : {}),
    });
    return;
  }

  // Unknown error -> never leak internals.
  logger.error({ requestId, method: req.method, path: req.originalUrl, err }, 'Unhandled error');
  res.status(500).json({ success: false, error: 'Internal server error', requestId });
}