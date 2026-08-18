import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data, message } as ApiResponse<T>);
};

export const sendError = (res: Response, error: string, statusCode = 500) => {
  res.status(statusCode).json({ success: false, error } as ApiResponse);
};

export const sendCreated = <T>(res: Response, data: T, message = 'Created') => {
  sendSuccess(res, data, message, 201);
};
