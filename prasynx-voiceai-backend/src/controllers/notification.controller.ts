import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService';
import { sendSuccess } from '../utils/response';

export class NotificationController {
  async sendNotification(req: Request, res: Response) {
    const notification = await notificationService.send(req.body);
    sendSuccess(res, notification, 'Notification created and queued', 201);
  }
}

export const notificationController = new NotificationController();
