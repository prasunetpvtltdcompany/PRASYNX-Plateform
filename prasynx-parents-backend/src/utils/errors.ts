export class AppError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
export class BadRequestError extends AppError { constructor(m = 'Bad request') { super(m, 400); } }
export class UnauthorizedError extends AppError { constructor(m = 'Unauthorized') { super(m, 401); } }
export class ForbiddenError extends AppError { constructor(m = 'Forbidden') { super(m, 403); } }
export class NotFoundError extends AppError { constructor(m = 'Not found') { super(m, 404); } }
