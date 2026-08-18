import { Response } from 'express';
import { announcementService } from '../services/announcement.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class AnnouncementController {
  async createAnnouncement(req: AuthRequest, res: Response) {
    const data = await announcementService.createAnnouncement(req.body);
    sendCreated(res, data, 'Announcement posted');
  }

  async getAnnouncements(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await announcementService.getAnnouncements(org_id);
    sendSuccess(res, data);
  }
}
export const announcementController = new AnnouncementController();
