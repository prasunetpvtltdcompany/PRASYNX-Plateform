import { Response } from 'express';
import { communicationService } from '../services/communication.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class CommunicationController {
  async sendNotification(req: AuthRequest, res: Response) {
    const result = await communicationService.sendNotification(req.params.org_id, req.body);
    sendCreated(res, result, 'Notification sent');
  }
  async notifyRole(req: AuthRequest, res: Response) {
    const result = await communicationService.notifyRole(req.params.org_id, req.body);
    sendCreated(res, result, 'Role notified');
  }
  async sendAnnouncement(req: AuthRequest, res: Response) {
    const result = await communicationService.sendAnnouncement(req.params.org_id, req.body);
    sendCreated(res, result, 'Announcement sent');
  }
  async getLogs(req: AuthRequest, res: Response) {
    const result = await communicationService.getLogs(req.params.org_id);
    sendSuccess(res, result);
  }
  async getStats(req: AuthRequest, res: Response) {
    const result = await communicationService.getStats(req.params.org_id);
    sendSuccess(res, result);
  }
  async getPending(req: AuthRequest, res: Response) {
    const result = await communicationService.getPending(req.params.org_id);
    sendSuccess(res, result);
  }
}

export const communicationController = new CommunicationController();
