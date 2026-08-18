import { Response } from 'express';
import { ApiResponse } from '../types';

export function sendSuccess<T>(res: Response, data: T, message?: string, statusCode: number = 200) {
  const response: ApiResponse<T> = { success: true, data, message };
  res.status(statusCode).json(response);
}

export function sendError(res: Response, error: string, statusCode: number = 500) {
  const response: ApiResponse = { success: false, error };
  res.status(statusCode).json(response);
}
