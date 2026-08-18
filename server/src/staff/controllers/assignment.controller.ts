import { Response } from 'express';
import { assignmentService } from '../services/assignment.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class AssignmentController {
  async createAssignment(req: AuthRequest, res: Response) {
    const data = await assignmentService.createAssignment(req.body);
    sendCreated(res, data, 'Assignment created');
  }

  async getAssignments(req: AuthRequest, res: Response) {
    const { teacher_id } = req.params;
    const data = await assignmentService.getAssignments(teacher_id);
    sendSuccess(res, data);
  }

  async getSubmissions(req: AuthRequest, res: Response) {
    const { assignment_id } = req.params;
    const data = await assignmentService.getSubmissions(assignment_id);
    sendSuccess(res, data);
  }

  async gradeSubmission(req: AuthRequest, res: Response) {
    const { submission_id } = req.params;
    const { grade, feedback } = req.body;
    const data = await assignmentService.gradeSubmission(submission_id, grade, feedback);
    sendSuccess(res, data);
  }
}
export const assignmentController = new AssignmentController();
