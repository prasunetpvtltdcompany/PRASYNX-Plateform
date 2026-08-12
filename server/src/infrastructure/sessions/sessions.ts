import { randomUUID } from 'node:crypto';
import { cache } from '../cache/cache';
import { config } from '../../config';
import { parseDuration } from '../../shared/utils/duration';

const accessTtlSeconds = () => parseDuration(config.jwt.accessTtl);

export function sessionKey(sessionId: string) {
  return `sess:${sessionId}`;
}

function userSessionsKey(userId: string) {
  return `sess:user:${userId}`;
}

/**
 * Session store = the single source of truth for "is this access token still
 * live?". Persisted in Redis (production) / in-memory (dev). Killing a session
 * here immediately invalidates every access token issued under it, including
 * refresh tokens - without relying on JWT expiry alone.
 */
export async function createSession(userId: string): Promise<string> {
  const sessionId = randomUUID();
  const ttl = accessTtlSeconds();
  await cache.set(sessionKey(sessionId), userId, ttl);

  const list = await readUserSessions(userId);
  list.push(sessionId);
  await cache.set(userSessionsKey(userId), JSON.stringify(list), Math.max(ttl, 60));
  return sessionId;
}

export async function isSessionLive(sessionId: string): Promise<boolean> {
  return (await cache.get(sessionKey(sessionId))) !== null;
}

export async function revokeSession(sessionId: string): Promise<void> {
  const userId = await cache.get(sessionKey(sessionId));
  await cache.del(sessionKey(sessionId));
  if (userId) await removeFromUserSessions(userId, sessionId);
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  const list = await readUserSessions(userId);
  for (const id of list) await cache.del(sessionKey(id));
  await cache.del(userSessionsKey(userId));
}

export async function sessionOwnerUserId(sessionId: string): Promise<string | null> {
  return cache.get(sessionKey(sessionId));
}

async function readUserSessions(userId: string): Promise<string[]> {
  const raw = await cache.get(userSessionsKey(userId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

async function removeFromUserSessions(userId: string, sessionId: string): Promise<void> {
  const list = (await readUserSessions(userId)).filter((id) => id !== sessionId);
  if (list.length) await cache.set(userSessionsKey(userId), JSON.stringify(list), accessTtlSeconds());
  else await cache.del(userSessionsKey(userId));
}