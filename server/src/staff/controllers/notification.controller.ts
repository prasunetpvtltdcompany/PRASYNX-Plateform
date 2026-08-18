import { Response } from 'express';
import { AuthRequest } from '../types';
import { notificationService } from '../services/notification.service';
import { sendSuccess, sendError } from '../utils/response';

export class NotificationController {
  async getNotifications(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 401);
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const unreadOnly = req.query.unread_only === 'true';
      const result = await notificationService.getNotifications(req.user.userId, { limit, offset, unreadOnly });
      sendSuccess(res, result);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch notifications');
    }
  }

  async markAsRead(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 401);
      await notificationService.markAsRead(req.params.id, req.user.userId);
      sendSuccess(res, { id: req.params.id });
    } catch (error: any) {
      sendError(res, error.message || 'Failed to mark notification as read');
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 401);
      await notificationService.markAllAsRead(req.user.userId);
      sendSuccess(res, { message: 'All notifications marked as read' });
    } catch (error: any) {
      sendError(res, error.message || 'Failed to mark all as read');
    }
  }

  async archiveNotification(req: AuthRequest, res: Response) {
    await this.markAsRead(req, res);
  }

  async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthorized', 401);
      const result = await notificationService.getNotifications(req.user.userId, { limit: 1, unreadOnly: true });
      sendSuccess(res, { count: result.unread });
    } catch (error: any) {
      sendError(res, error.message || 'Failed to get unread count');
    }
  }
}

export const notificationController = new NotificationController();
