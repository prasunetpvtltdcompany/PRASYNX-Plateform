import { Request } from 'express';

export interface PaginationParams {
  limit: number;
  offset: number;
  page: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    offset: number;
    total: number | null;
  };
}

export function getPagination(req: Request, defaultLimit = 50, maxLimit = 200): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit as string) || defaultLimit));
  const offset = (page - 1) * limit;
  return { limit, offset, page };
}

export function paginatedResponse<T>(data: T[], pagination: PaginationParams, total: number | null): PaginatedResult<T> {
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      offset: pagination.offset,
      total,
    },
  };
}

export function sendPaginated(res: any, data: any[], pagination: PaginationParams, total: number | null, message?: string) {
  res.status(200).json({
    success: true,
    data,
    message,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
    },
  });
}
