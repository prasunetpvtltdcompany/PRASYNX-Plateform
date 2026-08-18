import { Response } from 'express';
import { attendanceService } from '../services/attendance.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class AttendanceController {
  async getByStudent(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await attendanceService.getByStudent(student_id);
    sendSuccess(res, data);
  }

  async scanQr(req: AuthRequest, res: Response) {
    const result = await attendanceService.scanQr(req.body);
    sendSuccess(res, result, result.message);
  }
}
export const attendanceController = new AttendanceController();
