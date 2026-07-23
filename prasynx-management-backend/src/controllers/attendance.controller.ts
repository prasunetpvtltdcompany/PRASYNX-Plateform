import { Response } from 'express';
import { attendanceService } from '../services/attendance.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class AttendanceController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const date = req.query.date as string;
    const result = await attendanceService.getDashboard(organisation_id, date);
    sendSuccess(res, result);
  }

  async getStudents(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { class_id, section, search } = req.query as any;
    const result = await attendanceService.getStudents(organisation_id, { class_id, section, search });
    sendSuccess(res, result);
  }

  async getRecords(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const filters = {
      class_id: req.query.class_id as string,
      section: req.query.section as string,
      subject_id: req.query.subject_id as string,
      teacher_id: req.query.teacher_id as string,
      date: req.query.date as string,
      from: req.query.from as string,
      to: req.query.to as string,
      status: req.query.status as string,
      session: req.query.session as string,
      student_id: req.query.student_id as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
    };
    const result = await attendanceService.getRecords(organisation_id, filters);
    sendSuccess(res, result);
  }

  async markAttendance(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await attendanceService.markAttendance(organisation_id, req.body);
    sendCreated(res, result, 'Attendance marked');
  }

  async bulkMark(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await attendanceService.bulkMark(organisation_id, req.body);
    sendCreated(res, result, 'Bulk attendance marked');
  }

  async getDailySummary(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const date = req.query.date as string;
    const result = await attendanceService.getDailySummary(organisation_id, date);
    sendSuccess(res, result);
  }

  async getStudentHistory(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const result = await attendanceService.getStudentHistory(student_id, limit);
    sendSuccess(res, result);
  }

  async getAnalytics(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { from, to, class_id } = req.query as any;
    const result = await attendanceService.getAnalytics(organisation_id, { from, to, class_id });
    sendSuccess(res, result);
  }

  async getRiskFlags(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const risk_level = req.query.risk_level as string;
    const result = await attendanceService.getRiskFlags(organisation_id, { risk_level });
    sendSuccess(res, result);
  }

  async getAiInsights(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await attendanceService.getAiInsights(organisation_id);
    sendSuccess(res, result);
  }

  async getReports(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const type = req.query.type as string || 'daily';
    const { from, to, class_id, student_id, teacher_id } = req.query as any;
    const result = await attendanceService.getReports(organisation_id, type, { from, to, class_id, student_id, teacher_id });
    sendSuccess(res, result);
  }

  async getWeeklyReport(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const date = req.query.date as string || new Date().toISOString().split('T')[0];
    const result = await attendanceService.getWeeklyReportData(organisation_id, date);
    sendSuccess(res, result);
  }

  async getMonthlyReport(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const date = req.query.date as string || new Date().toISOString().split('T')[0];
    const result = await attendanceService.getMonthlyReportData(organisation_id, date);
    sendSuccess(res, result);
  }

  async getSettings(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await attendanceService.getSettings(organisation_id);
    sendSuccess(res, result);
  }

  async saveSettings(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await attendanceService.saveSettings(organisation_id, req.body);
    sendSuccess(res, result, 'Settings saved');
  }

  async getAutomationLogs(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { type, student_id, status } = req.query as any;
    const result = await attendanceService.getAutomationLogs(organisation_id, { type, student_id, status });
    sendSuccess(res, result);
  }

  async createAutomationLog(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await attendanceService.createAutomationLog(organisation_id, req.body);
    sendCreated(res, result, 'Automation log created');
  }

  async sendNotification(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await attendanceService.sendNotification(organisation_id, req.body);
    sendCreated(res, result, 'Notification sent');
  }

  async getNotifications(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await attendanceService.getNotifications(organisation_id);
    sendSuccess(res, result);
  }

  async importAttendance(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await attendanceService.importAttendance(organisation_id, req.body);
    sendCreated(res, result, 'Import completed');
  }

  async getDashboardStats(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const date = req.query.date as string || new Date().toISOString().split('T')[0];
    const [dashboard, dailySummary] = await Promise.all([
      attendanceService.getDashboard(organisation_id, date),
      attendanceService.getDailySummary(organisation_id, date),
    ]);
    sendSuccess(res, { ...dashboard, daily: dailySummary });
  }
}

export const attendanceController = new AttendanceController();
