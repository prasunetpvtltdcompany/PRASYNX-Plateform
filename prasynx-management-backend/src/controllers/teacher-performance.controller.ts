import { Response } from 'express';
import { teacherPerformanceService } from '../services/teacher-performance.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class TeacherPerformanceController {
  async getTeachers(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const teachers = await teacherPerformanceService.getTeachers(organisation_id);
    sendSuccess(res, teachers);
  }

  async analyzeAll(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await teacherPerformanceService.analyzeAllTeachers(organisation_id);
    sendSuccess(res, result);
  }

  async analyzeTeacher(req: AuthRequest, res: Response) {
    const { organisation_id, teacher_id } = req.params;
    const result = await teacherPerformanceService.analyzeTeacher(organisation_id, teacher_id);
    sendSuccess(res, result);
  }

  async createObservation(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await teacherPerformanceService.createObservation(organisation_id, req.body);
    sendCreated(res, result, 'Observation recorded');
  }

  async getObservations(req: AuthRequest, res: Response) {
    const { organisation_id, teacher_id } = req.params;
    const observations = await teacherPerformanceService.getObservations(organisation_id, teacher_id);
    sendSuccess(res, observations);
  }

  async submitFeedback(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await teacherPerformanceService.submitFeedback(organisation_id, req.body);
    sendCreated(res, result, 'Feedback submitted');
  }

  async getFeedbackSummary(req: AuthRequest, res: Response) {
    const { organisation_id, teacher_id } = req.params;
    const summary = await teacherPerformanceService.getFeedbackSummary(organisation_id, teacher_id);
    sendSuccess(res, summary);
  }

  async predictRetention(req: AuthRequest, res: Response) {
    const { organisation_id, teacher_id } = req.params;
    const result = await teacherPerformanceService.predictRetention(organisation_id, teacher_id);
    sendSuccess(res, result);
  }

  async predictAllRetention(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await teacherPerformanceService.predictAllRetention(organisation_id);
    sendSuccess(res, result);
  }

  async createPerformanceReview(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await teacherPerformanceService.createPerformanceReview(organisation_id, req.body);
    sendCreated(res, result, 'Performance review created');
  }

  async getPerformanceReviews(req: AuthRequest, res: Response) {
    const { organisation_id, teacher_id } = req.params;
    const reviews = await teacherPerformanceService.getPerformanceReviews(organisation_id, teacher_id);
    sendSuccess(res, reviews);
  }

  async getInsights(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await teacherPerformanceService.getInsights(organisation_id);
    sendSuccess(res, result);
  }
}

export const teacherPerformanceController = new TeacherPerformanceController();
