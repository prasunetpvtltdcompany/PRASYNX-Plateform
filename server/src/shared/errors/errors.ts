import type { NextFunction, Request, Response } from 'express';

/** Base operational error. Distinguishes expected failures from crashes (isOperational). */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  details?: unknown;

  constructor(message: string, statusCode = 500, code?: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: unknown) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

/** Wrap async express handlers so rejected promises reach the error handler. */
export const asyncHandler =
  <Params = Record<string, never>, ResBody = unknown, ReqBody = unknown, ReqQuery = unknown>(
    fn: (req: Request<Params, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => Promise<unknown>,
  ) =>
  (req: Request<Params, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };