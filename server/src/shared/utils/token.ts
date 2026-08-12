import type { Request } from 'express';

/** Extract a bearer token from the Authorization header or the `token` cookie. */
export function bearerFrom(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length).trim() || undefined;
  const cookie = req.cookies?.token;
  if (typeof cookie === 'string' && cookie) return cookie;
  return undefined;
}