import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { BadRequestError } from '../utils/errors';

export const validate = (schema: ZodType, source: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const messages = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new BadRequestError(messages);
    }
    req[source] = result.data;
    next();
  };
