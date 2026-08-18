import { Response } from 'express';
import { studentService } from '../services/student.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

/**
 * Student Controller
 * 
 * Handles all student management endpoints.
 * Functions: createStudent, getStudents, updateStudent
 */
export class StudentController {
  async createStudent(req: AuthRequest, res: Response) {
    const student = await studentService.createStudent(req.body);
    sendCreated(res, student, 'Student created successfully');
  }

  async getStudents(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const students = await studentService.getStudents(organisation_id);
    sendSuccess(res, students);
  }

  async updateStudent(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const student = await studentService.updateStudent(student_id, req.body);
    sendSuccess(res, student);
  }
}

export const studentController = new StudentController();
