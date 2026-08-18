import { Response } from 'express';
import { assignmentService } from '../services/assignment.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class AssignmentController {
  async getByStudent(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await assignmentService.getByStudent(student_id, req.user?.organisationId ?? undefined);
    sendSuccess(res, data);
  }

  async submit(req: AuthRequest, res: Response) {
    const { assignment_id } = req.params;
    const data = await assignmentService.submit(assignment_id, req.body);
    sendCreated(res, data, 'Assignment submitted');
  }
}
export const assignmentController = new AssignmentController();
