import { Response } from 'express';
import { timetableService } from '../services/timetable.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class TimetableController {
  async getTimetable(req: AuthRequest, res: Response) {
    const { teacher_id } = req.params;
    const data = await timetableService.getTimetable(teacher_id);
    sendSuccess(res, data);
  }

  async getAdminTimetable(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await timetableService.getAdminTimetable(org_id);
    sendSuccess(res, data);
  }

  async createAdminTimetable(req: AuthRequest, res: Response) {
    const data = await timetableService.createAdminTimetable(req.body);
    sendCreated(res, data, 'Timetable entry created');
  }
}
export const timetableController = new TimetableController();
