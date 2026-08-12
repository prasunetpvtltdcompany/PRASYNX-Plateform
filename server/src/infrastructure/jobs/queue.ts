import { config } from '../../config';
import { cache } from '../cache/cache';
import { logger } from '../../shared/logger/logger';

/**
 * In-process async job queue. Keeps side effects (emails, notifications, exports)
 * OUT of the request lifecycle. Swap for BullMQ when Redis is required for
 * durable, multi-instance jobs; the enqueue/dequeue contract stays the same.
 */
type JobHandler = (payload: Record<string, unknown>) => Promise<void>;

const handlers = new Map<string, JobHandler>();
const inbox: Array<{ name: string; payload: Record<string, unknown> }> = [];

export function registerJob(name: string, handler: JobHandler) {
  handlers.set(name, handler);
}

export function enqueue(name: string, payload: Record<string, unknown>): void {
  inbox.push({ name, payload });
}

let started = false;

export function startWorker(): void {
  if (started) return;
  started = true;
  setInterval(runTick, 0 /* drain on next macrotask */);
  setInterval(runTick, 1000).unref();
  logger.info('Job worker started (in-process)');
}

async function runTick() {
  while (inbox.length) {
    const job = inbox.shift();
    if (!job) continue;
    const handler = handlers.get(job.name);
    if (!handler) {
      logger.warn({ name: job.name }, 'No handler registered for job');
      continue;
    }
    try {
      await handler(job.payload);
    } catch (err) {
      logger.error({ err, name: job.name }, 'Job failed');
    }
  }
}

/**
 * Anti-abuse: per-account failure counter + temporary lockout, stored in the
 * cache backend (Redis in prod). Prevents brute-force credential stuffing even
 * when generic IP rate limits are not enough.
 */
export const BRUTE_FORCE = {
  MAX_FAILURES: 5,
  LOCKOUT_SECONDS: 15 * 60,
  DELAYED_MS: 300, // constant-time-ish padding for unknown accounts

  failureKey(email: string) {
    return `bf:fail:${email.toLowerCase()}`;
  },
  lockKey(email: string) {
    return `bf:lock:${email.toLowerCase()}`;
  },

  async registerFailure(email: string): Promise<{ locked: boolean }> {
    const count = await cache.incr(this.failureKey(email), this.LOCKOUT_SECONDS);
    const locked = count >= this.MAX_FAILURES;
    if (locked) await cache.set(this.lockKey(email), '1', this.LOCKOUT_SECONDS);
    return { locked };
  },

  async isLocked(email: string): Promise<boolean> {
    const v = await cache.get(this.lockKey(email));
    return v !== null;
  },

  async clearFailures(email: string) {
    await cache.del(this.failureKey(email));
    await cache.del(this.lockKey(email));
  },

  /** Opaque delay for wrong credentials so unknown emails don't respond faster than real ones. */
  async delay() {
    await new Promise((r) => setTimeout(r, BRUTE_FORCE.DELAYED_MS));
  },
};

export { config };