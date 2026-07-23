import { Response } from 'express';
import { attendanceService } from '../services/attendance.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class AttendanceController {
  async getAttendance(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await attendanceService.getAttendance(student_id);
    sendSuccess(res, data);
  }
}
export const attendanceController = new AttendanceController();
