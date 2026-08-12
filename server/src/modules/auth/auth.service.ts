import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { cache } from '../../infrastructure/cache/cache';
import { createSession, revokeAllUserSessions, revokeSession, isSessionLive, sessionKey } from '../../infrastructure/sessions/sessions';
import { BRUTE_FORCE } from '../../infrastructure/jobs/queue';
import { config } from '../../config';
import { logger } from '../../shared/logger/logger';
import { issueAccessToken } from '../../shared/middleware/authenticate';
import { BadRequestError, TooManyRequestsError, UnauthorizedError } from '../../shared/errors/errors';
import { AuthRepository } from './auth.repository';
import { sendPasswordResetEmail } from '../../infrastructure/mail/mailer';
import { toUserDTO } from '../../shared/utils/mappers';
import type { LoginResult } from '@prasynx/types';
import { DOMAIN_ROLE_PORTAL, type PortalSlug } from '@prasynx/types';
import { parseDuration } from '../../shared/utils/duration';

const refreshTtlSeconds = () => parseDuration(config.jwt.refreshTtl);
const sha256 = (v: string) => crypto.createHash('sha256').update(v).digest('hex');
const refreshKey = (hash: string) => `rt:${hash}`;

interface StoredRefresh {
  userId: string;
  sessionId: string;
  expiresAt: number;
}

export class AuthService {
  constructor(private repo: AuthRepository) {}

  async login(email: string, password: string, _userAgent = '', ip = ''): Promise<LoginResult> {
    const key = email.toLowerCase().trim();

    if (await BRUTE_FORCE.isLocked(key)) {
      throw new TooManyRequestsError('Too many failed login attempts. Account temporarily locked.');
    }

    const user = await this.repo.findUserByEmail(key);
    if (!user || !user.password_hash) {
      await BRUTE_FORCE.delay(); // opaque timing for unknown emails
      throw new UnauthorizedError('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      const { locked } = await BRUTE_FORCE.registerFailure(key);
      if (locked) logger.warn({ email: key }, 'Brute-force lockout engaged');
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Account is not active. Contact support.');
    }

    await this.assertPortalGranted(user.organisation_id, user.role as keyof typeof DOMAIN_ROLE_PORTAL);

    await BRUTE_FORCE.clearFailures(key);

    const pair = await this.issueTokenPair(user.id, user.email, user.role, user.organisation_id);
    logger.info({ email: key, userId: user.id, ip }, 'user.login');

    return {
      ...pair,
      user: toUserDTO(user),
    };
  }

  async refresh(refreshToken: string, ip = ''): Promise<LoginResult> {
    const stored = await this.lookupRefresh(refreshToken);
    if (!stored) throw new UnauthorizedError('Invalid or expired refresh token');

    if (!(await isSessionLive(stored.sessionId))) {
      await this.deleteRefresh(refreshToken);
      throw new UnauthorizedError('Session has been revoked');
    }

    const user = await this.repo.findUserById(stored.userId);
    if (!user) throw new UnauthorizedError('User no longer exists');
    if (user.status !== 'active') throw new UnauthorizedError('Account is not active');

    await this.assertPortalGranted(user.organisation_id, user.role as keyof typeof DOMAIN_ROLE_PORTAL);

    // rotate: my old refresh, issue a new one under the same session
    await this.deleteRefresh(refreshToken);
    await cache.set(sessionKey(stored.sessionId), user.id, parseDuration(config.jwt.accessTtl)); // keep session alive
    const newRefresh = await this.createRefresh(user.id, stored.sessionId);

    logger.info({ userId: user.id, ip }, 'user.refresh');
    return {
      accessToken: this.accessFor(user, stored.sessionId),
      refreshToken: newRefresh,
      expiresIn: parseDuration(config.jwt.accessTtl),
      user: toUserDTO(user),
    };
  }

  async logout(refreshToken: string | undefined, all: boolean, sessionId: string, userId: string): Promise<void> {
    if (all) {
      await revokeAllUserSessions(userId);
      logger.info({ userId }, 'user.logout.all');
      return;
    }
    let targetSession = sessionId;
    if (refreshToken) {
      const stored = await this.lookupRefresh(refreshToken);
      if (stored && stored.userId === userId) targetSession = stored.sessionId;
      await this.deleteRefresh(refreshToken);
    }
    await revokeSession(targetSession);
    logger.info({ userId, sessionId: targetSession }, 'user.logout');
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.repo.findUserById(userId);
    if (!user || !user.password_hash) throw new UnauthorizedError('User not found');

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) throw new BadRequestError('Current password is incorrect');

    await this.persistPassword(userId, newPassword);
  }

  async forgotPassword(email: string): Promise<void> {
    // Always succeed to avoid account enumeration.
    const user = await this.repo.findUserByEmail(email.toLowerCase().trim());
    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString('base64url');
    const tokenHash = sha256(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await this.repo.insertPasswordReset(user.email, tokenHash, expiresAt);

    const resetLink = `${config.frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
    await sendPasswordResetEmail(user.email, resetLink);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = sha256(token);
    const record = await this.repo.findPasswordReset(tokenHash);
    if (!record) throw new BadRequestError('Invalid or expired reset token');
    if (new Date(record.expires_at) < new Date()) throw new BadRequestError('Reset token has expired');

    const user = await this.repo.findUserByEmail(record.email);
    if (!user) throw new BadRequestError('User not found');

    await this.persistPassword(user.id, newPassword);
    await this.repo.markResetUsed(tokenHash);
  }

  // --- private helpers ---

  /** A school-side user can only sign in to a portal PRASYNX granted their school. */
  private async assertPortalGranted(organisationId: string | null, role: keyof typeof DOMAIN_ROLE_PORTAL): Promise<void> {
    if (!organisationId) return; // platform (company) users have no tenant
    const portal: PortalSlug | undefined = DOMAIN_ROLE_PORTAL[role];
    if (!portal) return; // platform (company) roles are exempt
    const granted = await this.repo.hasOrganisationPortal(organisationId, portal);
    if (!granted) {
      throw new UnauthorizedError('Your school has not enabled this portal. Contact your school administration.');
    }
  }

  private async persistPassword(userId: string, newPassword: string): Promise<void> {
    const hash = await bcrypt.hash(newPassword, config.jwt.bcryptRounds);

    // 1) update users.password_hash
    const prev = await this.repo.findUserById(userId);
    await this.repo.updatePasswordHash(userId, hash);

    // 2) keep Supabase Auth in sync; roll back on failure (mirrors legacy behavior)
    const sync = await this.repo.syncAuthPassword(userId, newPassword);
    if (!sync.ok) {
      if (prev?.password_hash) await this.repo.updatePasswordHash(userId, prev.password_hash);
      throw new BadRequestError(`Password sync failed: ${sync.error}`);
    }

    // 3) invalidate live sessions so the new password must be re-authenticated
    await revokeAllUserSessions(userId);
  }

  private async issueTokenPair(userId: string, email: string, role: string, tenantId: string | null) {
    const sessionId = await createSession(userId);
    return {
      accessToken: this.buildAccess(userId, email, role, tenantId, sessionId),
      refreshToken: await this.createRefresh(userId, sessionId),
      expiresIn: parseDuration(config.jwt.accessTtl),
    };
  }

  private buildAccess(userId: string, email: string, role: string, tenantId: string | null, sessionId: string) {
    return issueAccessToken({ userId, email, role, tenantId, sessionId });
  }

  private accessFor(user: { id: string; email: string; role: string; organisation_id: string | null }, sessionId: string) {
    return this.buildAccess(user.id, user.email, user.role, user.organisation_id, sessionId);
  }

  private async createRefresh(userId: string, sessionId: string): Promise<string> {
    const token = crypto.randomBytes(48).toString('base64url');
    const stored: StoredRefresh = { userId, sessionId, expiresAt: Date.now() + refreshTtlSeconds() * 1000 };
    await cache.set(refreshKey(sha256(token)), JSON.stringify(stored), refreshTtlSeconds());
    return token;
  }

  private async lookupRefresh(token: string): Promise<StoredRefresh | null> {
    const raw = await cache.get(refreshKey(sha256(token)));
    if (!raw) return null;
    let parsed: StoredRefresh;
    try {
      parsed = JSON.parse(raw) as StoredRefresh;
    } catch {
      return null;
    }
    if (parsed.expiresAt < Date.now()) {
      await this.deleteRefresh(token);
      return null;
    }
    return parsed;
  }

  private async deleteRefresh(token: string): Promise<void> {
    await cache.del(refreshKey(sha256(token)));
  }
}

export const authService = new AuthService(new AuthRepository());