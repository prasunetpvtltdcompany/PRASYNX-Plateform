import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { notificationController } from '../controllers/notification.controller';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(notificationController.getNotifications.bind(notificationController)));
router.get('/unread-count', asyncHandler(notificationController.getUnreadCount.bind(notificationController)));
router.put('/:id/read', asyncHandler(notificationController.markAsRead.bind(notificationController)));
router.put('/read-all', asyncHandler(notificationController.markAllAsRead.bind(notificationController)));
router.put('/:id/archive', asyncHandler(notificationController.archiveNotification.bind(notificationController)));

export default router;
