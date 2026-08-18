import { Response } from 'express';
import { timetableService } from '../services/timetable.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class TimetableController {
  async getByClass(req: AuthRequest, res: Response) {
    const { class_id } = req.params;
    const data = await timetableService.getByClass(class_id);
    sendSuccess(res, data);
  }

  async getByStudent(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await timetableService.getByStudent(student_id);
    sendSuccess(res, data);
  }
}
export const timetableController = new TimetableController();
