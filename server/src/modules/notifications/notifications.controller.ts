import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { notificationsService } from './notifications.service';
import { config } from '../../config';
import { cache } from '../../infrastructure/cache/cache';
import { sessionKey } from '../../infrastructure/sessions/sessions';

const tenantOf = (req: Request): string => req.user?.tenantId ?? '';
const userIdOf = (req: Request): string => req.user?.userId ?? '';
const roleOf = (req: Request): string => req.user?.role ?? '';

export class NotificationsController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const notifications = await notificationsService.list(tenantOf(req), userIdOf(req), roleOf(req));
    res.status(200).json({ notifications });
  });

  unreadCount = asyncHandler(async (req: Request, res: Response) => {
    const unread = await notificationsService.unreadCount(tenantOf(req), userIdOf(req), roleOf(req));
    res.status(200).json({ unread });
  });

  markRead = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing notification id');
    await notificationsService.markRead(tenantOf(req), userIdOf(req), roleOf(req), params.id);
    res.status(204).send();
  });

  markAllRead = asyncHandler(async (req: Request, res: Response) => {
    await notificationsService.markAllRead(tenantOf(req), userIdOf(req), roleOf(req));
    res.status(204).send();
  });

  /**
   * Server-Sent Events push channel for the notification bell. Uses the access
   * token in the query string (EventSource cannot set headers); validated exactly
   * like `authenticate`. Emits a `change` event when the unread count or latest
   * notification changes, so the client can avoid blind polling.
   */
  stream = (req: Request, res: Response): void => {
    const token = typeof req.query.token === 'string' ? req.query.token : undefined;
    if (!token) {
      res.status(401).json({ error: 'No token provided.' });
      return;
    }

    let claims: { sub: string; role: string; tenantId: string | null; sessionId: string };
    try {
      claims = jwt.verify(token, config.jwt.secret, {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      }) as unknown as typeof claims;
    } catch {
      res.status(401).json({ error: 'Invalid token.' });
      return;
    }

    const { sub: userId, role, tenantId, sessionId } = claims;
    if (!tenantId) {
      res.status(401).json({ error: 'Not scoped to a school.' });
      return;
    }

    void (async () => {
      try {
        const owner = await cache.get(sessionKey(sessionId));
        if (owner === null || owner !== userId) {
          res.status(401).json({ error: 'Session has been revoked.' });
          return;
        }
      } catch {
        res.status(401).json({ error: 'Session check failed.' });
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      res.write('retry: 10000\n\n');
      res.flushHeaders?.();

      let lastFingerprint = '';
      const tick = async () => {
        try {
          const [notifications, unread] = await Promise.all([
            notificationsService.list(tenantId, userId, role),
            notificationsService.unreadCount(tenantId, userId, role),
          ]);
          const fingerprint = `${unread}:${notifications[0]?.id ?? ''}`;
          if (fingerprint !== lastFingerprint) {
            lastFingerprint = fingerprint;
            res.write(
              `event: change\ndata: ${JSON.stringify({ unread, lastId: notifications[0]?.id ?? null })}\n\n`,
            );
          }
          res.write(': keep-alive\n\n');
        } catch {
          // keep the stream alive; the client's polling remains the fallback
        }
      };

      void tick();
      const interval = setInterval(() => void tick(), 5000);
      const timeout = setTimeout(() => {
        clearInterval(interval);
        res.end();
      }, 60000);
      req.on('close', () => {
        clearInterval(interval);
        clearTimeout(timeout);
        res.end();
      });
    })();
  };
}

export const notificationsController = new NotificationsController();