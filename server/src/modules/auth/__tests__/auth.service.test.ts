import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { AuthService } from '../auth.service';
import { AuthRepository } from '../auth.repository';
import { BRUTE_FORCE } from '../../../infrastructure/jobs/queue';
import { cache } from '../../../infrastructure/cache/cache';
import { UnauthorizedError, TooManyRequestsError } from '../../../shared/errors/errors';
import type { UserRow } from '@prasynx/types';

const EMAIL = 'student@school.edu';
const PASSWORD = 'correct-horse-battery';
let passwordHash: string;

const user: UserRow = {
  id: '00000000-0000-0000-0000-000000000001',
  full_name: 'Test Student',
  email: EMAIL,
  role: 'student',
  organisation_id: '00000000-0000-0000-0000-00000000000a',
  status: 'active',
};

function stubRepo(): AuthRepository {
  return {
    findUserByEmail: async (email: string) => (email === EMAIL ? user : null),
    findUserById: async (id: string) => (id === user.id ? user : null),
    updatePasswordHash: async () => {},
    syncAuthPassword: async () => ({ ok: true }),
    getUsersByOrganisationId: async () => [user],
    setUserStatus: async () => {},
    insertPasswordReset: async () => {},
    findPasswordReset: async () => ({ email: EMAIL, expires_at: new Date(Date.now() + 3600_000).toISOString() }),
    markResetUsed: async () => {},
    hasOrganisationPortal: async () => true,
  } as unknown as AuthRepository;
}

describe('AuthService', () => {
  let auth: AuthService;

  beforeAll(async () => {
    passwordHash = await bcrypt.hash(PASSWORD, 4);
    user.password_hash = passwordHash;
  });

  afterAll(async () => {
    await cache.delByPrefix('sess:');
    await cache.delByPrefix('rt:');
  });

  beforeEach(() => {
    auth = new AuthService(stubRepo());
  });

  it('logs in and returns tokens + a safe user DTO (no password material)', async () => {
    const result = await auth.login(EMAIL, PASSWORD);

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.expiresIn).toBeGreaterThan(0);
    expect(result.user).not.toHaveProperty('password_hash');
    expect(result.user.email).toBe(EMAIL);
  });

  it('rejects a wrong password and does not leak which field failed', async () => {
    await expect(auth.login(EMAIL, 'wrong-password')).rejects.toBeInstanceOf(UnauthorizedError);
    await expect(auth.login('nobody@school.edu', PASSWORD)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('locks an account after repeated failures', async () => {
    const email = 'lockout@school.edu';
    const lockedUser = { ...user, email, id: '00000000-0000-0000-0000-000000000099' } as UserRow;
    const auth2 = new AuthService({
      findUserByEmail: async () => lockedUser,
      findUserById: async () => lockedUser,
      hasOrganisationPortal: async () => true,
    } as unknown as AuthRepository);

    for (let i = 0; i < BRUTE_FORCE.MAX_FAILURES; i++) {
      await auth2.login(email, 'nope').catch((e: unknown) => expect(e).toBeInstanceOf(UnauthorizedError));
    }
    await expect(auth2.login(email, PASSWORD)).rejects.toBeInstanceOf(TooManyRequestsError);

    await BRUTE_FORCE.clearFailures(email);
  });

  it('rotates refresh tokens: the old one is dead after refresh', async () => {
    const login = await auth.login(EMAIL, PASSWORD);

    const refreshed = await auth.refresh(login.refreshToken);
    expect(refreshed.refreshToken).not.toBe(login.refreshToken);

    await expect(auth.refresh(login.refreshToken)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('rejects a refresh token for a logged-out (revoked) session', async () => {
    const login = await auth.login(EMAIL, PASSWORD);
    await auth.logout(login.refreshToken, false, login.user.id === 'x' ? 'session' : 'session', user.id);

    await expect(auth.refresh(login.refreshToken)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('revokes all sessions on logout(all)', async () => {
    const a = await auth.login(EMAIL, PASSWORD);
    const b = await auth.login(EMAIL, PASSWORD);

    await auth.logout(undefined, true, 'any', user.id);
    await expect(auth.refresh(a.refreshToken)).rejects.toBeInstanceOf(UnauthorizedError);
    await expect(auth.refresh(b.refreshToken)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('blocks a school user whose school has not been granted their portal', async () => {
    const blocked = new AuthService({
      findUserByEmail: async () => user,
      findUserById: async () => user,
      hasOrganisationPortal: async () => false,
    } as unknown as AuthRepository);

    await expect(blocked.login(EMAIL, PASSWORD)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('lets company (platform) users sign in without portal grants', async () => {
    const platformUser: UserRow = {
      ...user,
      id: '00000000-0000-0000-0000-0000000000ad',
      role: 'admin',
      organisation_id: null,
    };
    const platform = new AuthService({
      findUserByEmail: async () => platformUser,
      findUserById: async () => platformUser,
    } as unknown as AuthRepository);

    const result = await platform.login('admin@prasynx.in', PASSWORD);
    expect(result.user.role).toBe('admin');
  });
});