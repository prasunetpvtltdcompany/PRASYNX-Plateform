import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode: number = 200): void => {
  const response: ApiResponse<T> = { success: true, data, message };
  res.status(statusCode).json(response);
};

export const sendError = (res: Response, error: string, statusCode: number = 500): void => {
  const response: ApiResponse = { success: false, error };
  res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T, message: string = 'Created successfully'): void => {
  sendSuccess(res, data, message, 201);
};
