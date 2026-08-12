import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema, z } from 'zod';

type SchemaSource = { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema };

/**
 * Validates payloads against the shared @prasynx/validation schemas and stamps
 * the parsed results on req.validated so controllers use *typed* data, never raw
 * untrusted input.
 */
export function validate(schemas: SchemaSource) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.validated = {
        body: schemas.body ? (schemas.body.parse(req.body) as object) : undefined,
        query: schemas.query ? (schemas.query.parse(req.query) as object) : undefined,
        params: schemas.params ? (schemas.params.parse(req.params) as object) : undefined,
      };
      next();
    } catch (err) {
      next(err); // ZodError handled centrally by errorHandler
    }
  };
}

export type { z };