import { Response } from 'express';
import { assignmentService } from '../services/assignment.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types';

export class AssignmentController {
  async getAssignments(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const assignments = await assignmentService.getAssignments(student_id);
    sendSuccess(res, { assignments });
  }
}
export const assignmentController = new AssignmentController();
