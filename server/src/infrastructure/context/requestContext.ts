import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Per-request context. Stored via AsyncLocalStorage so any repository/service
 * downstream of a request can resolve the authenticated user's token WITHOUT
 * threading a client instance through every method signature.
 */
interface RequestContext {
  token?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(token: string | undefined, fn: () => T): T {
  return requestContext.run({ token }, fn);
}

/** The authenticated user's raw JWT for this request (undefined for unauthenticated/none). */
export function currentRequestToken(): string | undefined {
  return requestContext.getStore()?.token;
}