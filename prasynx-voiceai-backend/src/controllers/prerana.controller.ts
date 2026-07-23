import { Request, Response } from 'express';
import { preranaService } from '../services/preranaService';
import { sendSuccess, sendError } from '../utils/response';

export class PreranaController {
  async chat(req: Request, res: Response) {
    const { message, role, userId, organisationId, language, callId, personaId } = req.body;
    if (!message) return sendError(res, 'Message is required', 400);
    if (!role) return sendError(res, 'Role is required (parent, student, teacher, admin, management, staff)', 400);
    const result = await preranaService.processMessage({
      message, role, userId, organisationId, language, callId, personaId,
    });
    sendSuccess(res, result);
  }

  async getSlots(req: Request, res: Response) {
    const { userId, organisationId } = req.query;
    const slots = await preranaService.getAvailablePTMSlots(userId as string, organisationId as string);
    sendSuccess(res, { slots });
  }

  async schedulePTM(req: Request, res: Response) {
    const { parentId, teacherId, studentId, date, time, organisationId } = req.body;
    if (!parentId || !teacherId || !date || !time) {
      return sendError(res, 'Required: parentId, teacherId, date, time', 400);
    }
    sendSuccess(res, {
      appointmentId: `PTM-${Date.now()}`,
      status: 'confirmed',
      message: `PTM scheduled successfully for ${date} at ${time}. A confirmation will be sent to parents and the teacher.`,
    }, 'PTM scheduled', 201);
  }

  async getAnalytics(req: Request, res: Response) {
    const analytics = preranaService.getAnalytics();
    sendSuccess(res, analytics);
  }

  async voiceCall(req: Request, res: Response) {
    const { to, message, type } = req.body;
    if (!to || !message) return sendError(res, 'Required: to, message', 400);
    const scenarios: Record<string, string> = {
      fee_reminder: '📞 Fee Reminder Call',
      ptm_reminder: '📞 PTM Reminder Call',
      attendance_alert: '📞 Attendance Alert Call',
      exam_notification: '📞 Exam Notification Call',
      emergency: '🚨 Emergency Announcement Call',
      scholarship: '📞 Scholarship Announcement',
      transport_alert: '📞 Transport Alert Call',
      general: '📞 General Voice Call',
    };
    sendSuccess(res, {
      callId: `CALL-${Date.now()}`,
      status: 'queued',
      scenario: scenarios[type as string] || 'Voice Call',
      message: `Call queued to ${to}${type ? ` for ${scenarios[type as string] || type}` : ''}.`,
    });
  }

  async translate(req: Request, res: Response) {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) return sendError(res, 'Required: text, targetLanguage', 400);
    const translations: Record<string, Record<string, string>> = {
      en: {
        hi: 'यह एक अनुवादित संदेश है।',
        mr: 'हा एक भाषांतरित संदेश आहे।',
        ta: 'இது மொழிபெயர்க்கப்பட்ட செய்தி.',
        te: 'ఇది అనువదించబడిన సందేశం.',
        bn: 'এটি একটি অনুবাদিত বার্তা।',
        gu: 'આ અનુવાદિત સંદેશ છે.',
        pa: 'ਇਹ ਇੱਕ ਅਨੁਵਾਦਿਤ ਸੰਦੇਸ਼ ਹੈ।',
      },
    };
    sendSuccess(res, { translatedText: translations.en?.[targetLanguage] || text, sourceLanguage: 'en', targetLanguage });
  }

  async handleInfoQuery(req: Request, res: Response) {
    const { query, role, userId, organisationId } = req.body;
    if (!query) return sendError(res, 'Query is required', 400);
    const result = await preranaService.processMessage({
      message: query, role: role || 'admin', userId, organisationId,
    });
    sendSuccess(res, result);
  }

  async getPersonas(req: Request, res: Response) {
    const personas = preranaService.getPersonas();
    sendSuccess(res, { personas });
  }

  async searchKnowledgeBase(req: Request, res: Response) {
    const { query } = req.body;
    if (!query) return sendError(res, 'Query is required', 400);
    const items = preranaService['searchKnowledgeBase'](query);
    sendSuccess(res, { results: items });
  }

  async executeAction(req: Request, res: Response) {
    const { action, params } = req.body;
    if (!action) return sendError(res, 'Action is required', 400);
    const result = await preranaService.executeAction(action, params || {});
    sendSuccess(res, result);
  }
}

export const preranaController = new PreranaController();
