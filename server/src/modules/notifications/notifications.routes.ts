import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { validate } from '../../shared/middleware/validate';
import { notificationsController } from './notifications.controller';

const router = Router();

// Notifications are scoped per authenticated user/role, so any signed-in role may read them.
router.use(authenticate, requireTenant);

router.get('/', notificationsController.list);
router.get('/unread-count', notificationsController.unreadCount);
router.get('/stream', notificationsController.stream);
router.patch('/read-all', notificationsController.markAllRead);
router.patch('/:id/read', validate({ params: z.object({ id: z.string().uuid() }) }), notificationsController.markRead);

export default router;