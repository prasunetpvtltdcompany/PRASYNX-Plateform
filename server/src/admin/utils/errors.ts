// Canonical error hierarchy lives in shared/errors/errors.ts.
// Re-export here so admin routes thrown errors are the SAME classes the
// monolith's global errorHandler recognizes (err instanceof AppError).
export {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
} from '../../shared/errors/errors';
