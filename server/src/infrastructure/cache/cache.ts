import Redis from 'ioredis';
import { config } from '../../config';
import { logger } from '../../shared/logger/logger';

/**
 * Key-value cache with a pluggable backend:
 * - Redis when REDIS_URL is set (production / multi-instance).
 * - In-memory fallback for development when Redis is unavailable.
 */
export interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  setExNx(key: string, value: string, ttlSeconds: number): Promise<boolean>;
  del(key: string): Promise<void>;
  delByPrefix(prefix: string): Promise<void>;
  incr(key: string, ttlSeconds?: number): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<void>;
  /** Wire the store up to http transport (ioredis). No-op for memory. */
  connect(): Promise<void>;
  close(): Promise<void>;
}

class MemoryStore implements CacheStore {
  private map = new Map<string, { value: string; expiresAt: number }>();

  private alive(key: string) {
    const row = this.map.get(key);
    if (!row) return false;
    if (row.expiresAt && row.expiresAt < Date.now()) {
      this.map.delete(key);
      return false;
    }
    return true;
  }

  async get(key: string) {
    return this.alive(key) ? this.map.get(key)!.value : null;
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    this.map.set(key, { value, expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0 });
  }

  async setExNx(key: string, value: string, ttlSeconds: number) {
    if (this.alive(key)) return false;
    await this.set(key, value, ttlSeconds);
    return true;
  }

  async del(key: string) {
    this.map.delete(key);
  }

  async delByPrefix(prefix: string) {
    for (const key of this.map.keys()) {
      if (key.startsWith(prefix)) this.map.delete(key);
    }
  }

  async incr(key: string, ttlSeconds?: number) {
    const cur = this.alive(key) ? Number(this.map.get(key)!.value) || 0 : 0;
    const next = cur + 1;
    this.map.set(key, { value: String(next), expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0 });
    return next;
  }

  async expire(key: string, ttlSeconds: number) {
    const row = this.map.get(key);
    if (row) row.expiresAt = Date.now() + ttlSeconds * 1000;
  }

  async connect() {}
  async close() {}
}

class RedisStore implements CacheStore {
  private client: Redis;

  constructor(url: string) {
    this.client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 2 });
    this.client.on('error', (err) => logger.warn({ err }, 'Redis error'));
  }

  async connect() {
    await this.client.connect();
  }

  async close() {
    if (this.client.status === 'ready') await this.client.quit();
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) await this.client.set(key, value, 'EX', ttlSeconds);
    else await this.client.set(key, value);
  }

  async setExNx(key: string, value: string, ttlSeconds: number) {
    const res = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
    return res === 'OK';
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async delByPrefix(prefix: string) {
    const keys = await this.client.keys(`${prefix}*`);
    if (keys.length) await this.client.del(keys);
  }

  async incr(key: string, ttlSeconds?: number) {
    const val = await this.client.incr(key);
    if (val === 1 && ttlSeconds) await this.client.expire(key, ttlSeconds);
    return val;
  }

  async expire(key: string, ttlSeconds: number) {
    await this.client.expire(key, ttlSeconds);
  }
}

export const cache: CacheStore = config.redisUrl ? new RedisStore(config.redisUrl) : new MemoryStore();

export async function connectCache() {
  await cache.connect();
  logger.info(config.redisUrl ? 'Cache: connected to Redis' : 'Cache: using in-memory store (set REDIS_URL for Redis)');
}