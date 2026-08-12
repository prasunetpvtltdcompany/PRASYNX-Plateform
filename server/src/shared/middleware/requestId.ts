import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const header = req.headers['x-request-id'];
  const id = typeof header === 'string' && header ? header : randomUUID();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}