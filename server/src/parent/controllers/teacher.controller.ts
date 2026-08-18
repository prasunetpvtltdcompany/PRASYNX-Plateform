import { Response } from 'express';
import { teacherService } from '../services/teacher.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class TeacherController {
  async getTeachers(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const teachers = await teacherService.getTeachers(organisation_id);
    sendSuccess(res, teachers);
  }
}
export const teacherController = new TeacherController();
