import { Response } from 'express';
import { supabase } from '../lib/backend-common';
import { attendanceService } from '../services/attendance.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export class AttendanceController {
  async markAttendance(req: AuthRequest, res: Response) {
    if (!req.user) return sendError(res, 'Authentication required.', 401);
    const { data: teacher } = await supabase.from('staff_records').select('id').eq('user_id', req.user.userId).maybeSingle();
    if (!teacher) return sendError(res, 'Teacher profile not found.', 404);
    const data = await attendanceService.markAttendance({ ...req.body, teacher_id: teacher.id });
    sendSuccess(res, data);
  }

  async bulkAttendance(req: AuthRequest, res: Response) {
    if (!req.user) return sendError(res, 'Authentication required.', 401);
    const { data: teacher } = await supabase.from('staff_records').select('id').eq('user_id', req.user.userId).maybeSingle();
    if (!teacher) return sendError(res, 'Teacher profile not found.', 404);
    const bodyTeacherId = req.body.teacher_id;
    if (bodyTeacherId && bodyTeacherId !== teacher.id) {
      return sendError(res, 'Access denied: teacher_id does not match your identity.', 403);
    }
    const data = await attendanceService.bulkAttendance({ ...req.body, teacher_id: teacher.id });
    sendSuccess(res, data);
  }

  async getAttendance(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await attendanceService.getAttendance(student_id);
    sendSuccess(res, data);
  }

  async getAttendanceReport(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await attendanceService.getAttendanceReport(student_id);
    sendSuccess(res, data);
  }
}
export const attendanceController = new AttendanceController();
