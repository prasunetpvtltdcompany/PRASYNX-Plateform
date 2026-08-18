// Canonical error hierarchy lives in shared/errors/errors.ts.
// Re-export here so every import path (utils/errors and shared/errors/errors)
// resolves to the SAME classes — this keeps `err instanceof AppError`
// checks in the error handler working for errors thrown by services.
export {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
} from '../../shared/errors/errors';
