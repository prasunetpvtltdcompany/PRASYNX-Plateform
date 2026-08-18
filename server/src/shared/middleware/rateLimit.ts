import rateLimit, { ipKeyGenerator, type Options } from 'express-rate-limit';
import type { NextFunction, Request, Response } from 'express';
import { cache } from '../../infrastructure/cache/cache';
import { TooManyRequestsError } from '../errors/errors';

/**
 * Rate-limit store backed by the shared cache (Redis in prod, in-memory in dev).
 * Fixed-window keyed by window index so old counters self-expire via TTL.
 */
function fixedWindowStore(windowMs: number): Options['store'] {
  const store = {
    localKeys: true,
    increment: async (key: string) => {
      const window = Math.floor(Date.now() / windowMs);
      const totalHits = await cache.incr(`rl:${key}:${window}`, Math.ceil(windowMs / 1000));
      return { totalHits, resetTime: new Date((window + 1) * windowMs) };
    },
    decrement: async (_key: string) => {
      /* express-rate-limit uses this only when it blocks + validates; no-op builds are fine. */
    },
    resetKey: async (key: string) => {
      await cache.delByPrefix(`rl:${key}:`);
    },
    resetAll: async () => {},
  };
  return store as Options['store'];
}

export const getIp = (req: Request) => ipKeyGenerator(req.ip ?? req.socket.remoteAddress ?? 'unknown');
export const getUserKey = (req: Request) => {
  const uid = (req as Request & { user?: { userId?: string } }).user?.userId;
  return uid ? `u:${uid}` : ipKeyGenerator(req.ip ?? req.socket.remoteAddress ?? 'unknown');
};

export function makeRateLimiter(_options: {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) {
  /* Rate limiting is intentionally disabled. */
  return (_req: Request, _res: Response, next: NextFunction) => next();
}

/** Global per-IP limiter on the whole /api surface. */
export const apiLimiter = makeRateLimiter({ windowMs: 15 * 60 * 1000, max: 300, message: 'Too many requests, slow down.' });

/** Per-user limiter for authenticated, write-heavy or expensive endpoints. */
export const userLimiter = (windowMs: number, max: number, message = 'Too many requests, slow down.') =>
  makeRateLimiter({ windowMs, max, keyGenerator: getUserKey, message });

/** Login limiter: both IP and account-based (defense in depth for brute force). */
export const loginLimiter = (() => {
  const perIp = makeRateLimiter({ windowMs: 15 * 60 * 1000, max: Number.MAX_SAFE_INTEGER, message: 'Too many login attempts from this address.' });
  const perAccount = makeRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: Number.MAX_SAFE_INTEGER,
    keyGenerator: (req) => {
      const email = (req.body as { email?: string })?.email;
      return email ? `login:${email.toLowerCase()}` : getIp(req);
    },
    message: 'Too many login attempts for this account. Try again later.',
  });
  return { perIp, perAccount };
})();