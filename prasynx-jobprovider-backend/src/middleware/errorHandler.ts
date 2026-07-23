import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(`[Error] ${err.message}`, err.stack);
  res.status(500).json({ error: 'Internal server error' });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
};
