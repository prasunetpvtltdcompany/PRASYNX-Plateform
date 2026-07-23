import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';
import { sendSuccess, sendError } from '../utils/response';
import { supabase } from '../lib/backend-common';

class AiFeaturesController {
  async analyzeAttendanceByOrg(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const result = await aiService.analyzeAttendance(org_id);
      sendSuccess(res, result);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async analyzeAttendanceByStudent(req: Request, res: Response) {
    try {
      const { org_id, student_id } = req.params;
      const result = await aiService.analyzeAttendance(org_id, student_id);
      sendSuccess(res, result);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async detectLowAttendance(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const threshold = parseInt(req.query.threshold as string) || 75;
      const result = await aiService.detectLowAttendance(org_id, threshold);
      sendSuccess(res, result);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async predictAbsenteeism(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const result = await aiService.predictAbsenteeism(org_id);
      sendSuccess(res, result);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async generateAttendanceAlerts(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const alerts = await aiService.generateAttendanceAlerts(org_id);
      for (const alert of alerts) {
        await supabase.from('notifications').insert({
          user_id: alert.studentId,
          title: 'Low Attendance Alert',
          message: alert.alert,
          type: 'warning',
          read: false,
        });
      }
      sendSuccess(res, { data: alerts, count: alerts.length });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async getBookRecommendations(req: Request, res: Response) {
    try {
      const { student_id } = req.params;
      const limit = parseInt(req.query.limit as string) || 5;
      const result = await aiService.getBookRecommendations(student_id, limit);
      sendSuccess(res, result);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async getReadingAnalytics(req: Request, res: Response) {
    try {
      const { student_id } = req.params;
      const result = await aiService.getReadingAnalytics(student_id);
      sendSuccess(res, result);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async autoGrade(req: Request, res: Response) {
    try {
      const { submission_text, answer_key } = req.body;
      if (!submission_text || !answer_key) {
        return sendError(res, 'submission_text and answer_key required', 400);
      }
      const result = await aiService.autoGrade(submission_text, answer_key);
      sendSuccess(res, result);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async generateFeedback(req: Request, res: Response) {
    try {
      const { submission_id } = req.params;
      const feedback = await aiService.generateFeedback(submission_id);
      sendSuccess(res, { feedback });
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async getPerformanceInsights(req: Request, res: Response) {
    try {
      const { student_id } = req.params;
      const result = await aiService.getPerformanceInsights(student_id);
      sendSuccess(res, result);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async predictAtRiskStudents(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const result = await aiService.predictAtRiskStudents(org_id);
      sendSuccess(res, result);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async predictPerformanceDecline(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const result = await aiService.predictPerformanceDecline(org_id);
      sendSuccess(res, result);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async predictDropoutRisk(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const result = await aiService.predictDropoutRisk(org_id);
      sendSuccess(res, result);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async generateStudyPlan(req: Request, res: Response) {
    try {
      const { student_id, weak_subjects } = req.body;
      if (!student_id || !weak_subjects) {
        return sendError(res, 'student_id and weak_subjects required', 400);
      }
      const result = await aiService.generateStudyPlan(student_id, weak_subjects);
      sendSuccess(res, result);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async generateQuiz(req: Request, res: Response) {
    try {
      const { subject, topic, difficulty, count } = req.body;
      if (!subject || !topic) {
        return sendError(res, 'subject and topic required', 400);
      }
      const result = await aiService.generateQuiz(subject, topic, difficulty || 'medium', count || 5);
      sendSuccess(res, result);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }
}

export const aiFeaturesController = new AiFeaturesController();
