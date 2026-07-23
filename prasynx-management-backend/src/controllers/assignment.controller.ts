import { Response } from 'express';
import { assignmentService } from '../services/assignment.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class AssignmentController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await assignmentService.getDashboard(organisation_id);
    sendSuccess(res, result);
  }

  async getAssignments(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const filters = {
      class_id: req.query.class_id as string,
      section: req.query.section as string,
      subject_id: req.query.subject_id as string,
      teacher_id: req.query.teacher_id as string,
      status: req.query.status as string,
      assignment_type: req.query.assignment_type as string,
      academic_year: req.query.academic_year as string,
      from: req.query.from as string,
      to: req.query.to as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };
    const result = await assignmentService.getAssignments(organisation_id, filters);
    sendSuccess(res, result);
  }

  async getAssignmentById(req: AuthRequest, res: Response) {
    const { assignment_id } = req.params;
    const result = await assignmentService.getAssignmentById(assignment_id);
    sendSuccess(res, result);
  }

  async createAssignment(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await assignmentService.createAssignment(organisation_id, req.body);
    sendCreated(res, result, 'Assignment created');
  }

  async updateAssignment(req: AuthRequest, res: Response) {
    const { assignment_id } = req.params;
    const result = await assignmentService.updateAssignment(assignment_id, req.body);
    sendSuccess(res, result, 'Assignment updated');
  }

  async deleteAssignment(req: AuthRequest, res: Response) {
    const { assignment_id } = req.params;
    const result = await assignmentService.deleteAssignment(assignment_id);
    sendSuccess(res, result, 'Assignment deleted');
  }

  async publishAssignment(req: AuthRequest, res: Response) {
    const { assignment_id } = req.params;
    const result = await assignmentService.publishAssignment(assignment_id);
    sendSuccess(res, result, 'Assignment published');
  }

  async closeAssignment(req: AuthRequest, res: Response) {
    const { assignment_id } = req.params;
    const result = await assignmentService.closeAssignment(assignment_id);
    sendSuccess(res, result, 'Assignment closed');
  }

  async duplicateAssignment(req: AuthRequest, res: Response) {
    const { assignment_id } = req.params;
    const result = await assignmentService.duplicateAssignment(assignment_id);
    sendCreated(res, result, 'Assignment duplicated');
  }

  async getSubmissions(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const filters = {
      assignment_id: req.query.assignment_id as string,
      student_id: req.query.student_id as string,
      status: req.query.status as string,
      is_late: req.query.is_late as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
    };
    const result = await assignmentService.getSubmissions(organisation_id, filters);
    sendSuccess(res, result);
  }

  async gradeSubmission(req: AuthRequest, res: Response) {
    const { submission_id } = req.params;
    const result = await assignmentService.gradeSubmission(submission_id, req.body);
    sendSuccess(res, result, 'Submission graded');
  }

  async bulkGrade(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await assignmentService.bulkGrade(organisation_id, req.body);
    sendSuccess(res, result, 'Bulk grading done');
  }

  async publishGrades(req: AuthRequest, res: Response) {
    const { assignment_id } = req.params;
    const result = await assignmentService.publishGrades(assignment_id);
    sendSuccess(res, result, 'Grades published');
  }

  async getStudentPerformance(req: AuthRequest, res: Response) {
    const { organisation_id, student_id } = req.params;
    const result = await assignmentService.getStudentPerformance(organisation_id, student_id);
    sendSuccess(res, result);
  }

  async getAnalytics(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await assignmentService.getAnalytics(organisation_id);
    sendSuccess(res, result);
  }

  async getAiInsights(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await assignmentService.getAiInsights(organisation_id);
    sendSuccess(res, result);
  }

  async getRubrics(req: AuthRequest, res: Response) {
    const { assignment_id } = req.params;
    const result = await assignmentService.getRubrics(assignment_id);
    sendSuccess(res, result);
  }

  async saveRubrics(req: AuthRequest, res: Response) {
    const { organisation_id, assignment_id } = req.params;
    const result = await assignmentService.saveRubrics(organisation_id, assignment_id, req.body.rubrics || []);
    sendSuccess(res, result, 'Rubrics saved');
  }

  async getReports(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const type = req.query.type as string || 'assignment';
    const result = await assignmentService.getReports(organisation_id, type, req.query);
    sendSuccess(res, result);
  }

  async exportReport(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const type = req.query.type as string || 'assignment';
    const format = req.query.format as string || 'csv';
    const result = await assignmentService.exportReport(organisation_id, type, format);
    sendSuccess(res, result);
  }
}

export const assignmentController = new AssignmentController();
