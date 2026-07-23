import { Response } from 'express';
import { AuthRequest } from '../types';
import { academicAnalyticsService } from '../services/academic-analytics.service';
import { sendSuccess, sendError } from '../utils/response';

class AcademicAnalyticsController {
  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await academicAnalyticsService.getDashboard(organisation_id);
      sendSuccess(res, data, 'Dashboard fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch dashboard');
    }
  }

  async getStudentAnalytics(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await academicAnalyticsService.getStudentAnalytics(organisation_id, req.query);
      sendSuccess(res, data, 'Student analytics fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch student analytics');
    }
  }

  async getClassAnalytics(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await academicAnalyticsService.getClassAnalytics(organisation_id);
      sendSuccess(res, data, 'Class analytics fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch class analytics');
    }
  }

  async getSubjectAnalytics(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await academicAnalyticsService.getSubjectAnalytics(organisation_id);
      sendSuccess(res, data, 'Subject analytics fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch subject analytics');
    }
  }

  async getExamAnalytics(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await academicAnalyticsService.getExamAnalytics(organisation_id);
      sendSuccess(res, data, 'Exam analytics fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch exam analytics');
    }
  }

  async getAttendanceAnalytics(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await academicAnalyticsService.getAttendanceAnalytics(organisation_id);
      sendSuccess(res, data, 'Attendance analytics fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch attendance analytics');
    }
  }

  async getAiInsights(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await academicAnalyticsService.getAiInsights(organisation_id);
      sendSuccess(res, data, 'AI insights fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch AI insights');
    }
  }

  async getReports(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const { type } = req.query;
      const data = await academicAnalyticsService.getReports(organisation_id, (type as string) || 'summary');
      sendSuccess(res, data, 'Report fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch report');
    }
  }

  async exportReport(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const { type, format } = req.query;
      const data = await academicAnalyticsService.exportReport(organisation_id, (type as string) || 'summary', (format as string) || 'json');
      sendSuccess(res, data, 'Report exported');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to export report');
    }
  }
}

export const academicAnalyticsController = new AcademicAnalyticsController();
