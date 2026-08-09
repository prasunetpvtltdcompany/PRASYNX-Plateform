import { Response } from 'express';
import { examService } from '../services/exam.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class ExamController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await examService.getDashboard(organisation_id);
    sendSuccess(res, result);
  }

  async getExams(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const filters = {
      class_id: req.query.class_id as string,
      section: req.query.section as string,
      exam_type: req.query.exam_type as string,
      status: req.query.status as string,
      term: req.query.term as string,
      academic_year: req.query.academic_year as string,
      from: req.query.from as string,
      to: req.query.to as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };
    const result = await examService.getExams(organisation_id, filters);
    sendSuccess(res, result);
  }

  async getExamById(req: AuthRequest, res: Response) {
    const { exam_id } = req.params;
    const result = await examService.getExamById(exam_id);
    sendSuccess(res, result);
  }

  async createExam(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await examService.createExam(organisation_id, req.body);
    sendCreated(res, result, 'Exam created');
  }

  async updateExam(req: AuthRequest, res: Response) {
    const { exam_id } = req.params;
    const result = await examService.updateExam(exam_id, req.body);
    sendSuccess(res, result, 'Exam updated');
  }

  async deleteExam(req: AuthRequest, res: Response) {
    const { exam_id } = req.params;
    const result = await examService.deleteExam(exam_id);
    sendSuccess(res, result, 'Exam deleted');
  }

  async updateExamStatus(req: AuthRequest, res: Response) {
    const { exam_id } = req.params;
    const { status } = req.body;
    const result = await examService.updateExamStatus(exam_id, status);
    sendSuccess(res, result, 'Status updated');
  }

  async getSchedules(req: AuthRequest, res: Response) {
    const { exam_id } = req.params;
    const result = await examService.getSchedules(exam_id);
    sendSuccess(res, result);
  }

  async createSchedule(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await examService.createSchedule(organisation_id, req.body);
    sendCreated(res, result, 'Schedule created');
  }

  async updateSchedule(req: AuthRequest, res: Response) {
    const { schedule_id } = req.params;
    const result = await examService.updateSchedule(schedule_id, req.body);
    sendSuccess(res, result, 'Schedule updated');
  }

  async deleteSchedule(req: AuthRequest, res: Response) {
    const { schedule_id } = req.params;
    const result = await examService.deleteSchedule(schedule_id);
    sendSuccess(res, result, 'Schedule deleted');
  }

  async getResults(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const filters = {
      exam_id: req.query.exam_id as string,
      student_id: req.query.student_id as string,
      subject_id: req.query.subject_id as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
    };
    const result = await examService.getResults(organisation_id, filters);
    sendSuccess(res, result);
  }

  async enterMarks(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await examService.enterMarks(organisation_id, req.body);
    sendCreated(res, result, 'Marks entered');
  }

  async bulkEnterMarks(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await examService.bulkEnterMarks(organisation_id, req.body);
    sendCreated(res, result, 'Marks saved');
  }

  async publishResults(req: AuthRequest, res: Response) {
    const { exam_id } = req.params;
    const result = await examService.publishResults(exam_id);
    sendSuccess(res, result, 'Results published');
  }

  async lockResults(req: AuthRequest, res: Response) {
    const { exam_id } = req.params;
    const result = await examService.lockResults(exam_id);
    sendSuccess(res, result, 'Results locked');
  }

  async unlockResults(req: AuthRequest, res: Response) {
    const { exam_id } = req.params;
    const result = await examService.unlockResults(exam_id);
    sendSuccess(res, result, 'Results unlocked');
  }

  async getStudentPerformance(req: AuthRequest, res: Response) {
    const { organisation_id, student_id } = req.params;
    const result = await examService.getStudentPerformance(organisation_id, student_id);
    sendSuccess(res, result);
  }

  async getAnalytics(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await examService.getAnalytics(organisation_id);
    sendSuccess(res, result);
  }

  async getAiInsights(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await examService.getAiInsights(organisation_id);
    sendSuccess(res, result);
  }

  async getReadinessScores(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await examService.getReadinessScores(organisation_id);
    sendSuccess(res, result);
  }

  async getInvigilators(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await examService.getInvigilators(organisation_id);
    sendSuccess(res, result);
  }

  async getGradeDefinitions(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await examService.getGradeDefinitions(organisation_id);
    sendSuccess(res, result);
  }

  async saveGradeDefinitions(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await examService.saveGradeDefinitions(organisation_id, req.body);
    sendSuccess(res, result, 'Grades saved');
  }
}

export const examController = new ExamController();
