import { Response } from 'express';
import { studentService } from '../services/student.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class StudentController {
  async getStudents(req: AuthRequest, res: Response) {
    const { teacher_id } = req.params;
    const students = await studentService.getStudents(teacher_id);
    sendSuccess(res, { students });
  }
}
export const studentController = new StudentController();
