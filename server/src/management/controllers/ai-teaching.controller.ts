import { Response } from 'express';
import { AuthRequest } from '../types';
import { aiTeachingService } from '../services/ai-teaching.service';
import { sendSuccess, sendError } from '../utils/response';

class AiTeachingController {
  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await aiTeachingService.getDashboard(organisation_id);
      sendSuccess(res, data, 'Dashboard fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch dashboard');
    }
  }

  async getAssistants(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await aiTeachingService.getAssistants(organisation_id, req.query);
      sendSuccess(res, data, 'Assistants fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch assistants');
    }
  }

  async createAssistant(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await aiTeachingService.createAssistant(organisation_id, req.body);
      sendSuccess(res, data, 'Assistant created');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to create assistant');
    }
  }

  async updateAssistant(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await aiTeachingService.updateAssistant(id, req.body);
      sendSuccess(res, data, 'Assistant updated');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to update assistant');
    }
  }

  async deleteAssistant(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await aiTeachingService.deleteAssistant(id);
      sendSuccess(res, data, 'Assistant deleted');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to delete assistant');
    }
  }

  async getConversations(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await aiTeachingService.getConversations(organisation_id, req.query);
      sendSuccess(res, data, 'Conversations fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch conversations');
    }
  }

  async sendMessage(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await aiTeachingService.sendMessage(organisation_id, req.body);
      sendSuccess(res, data, 'Message sent');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to send message');
    }
  }

  async getStudentSupport(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const { student_id } = req.query;
      const data = await aiTeachingService.getStudentSupport(organisation_id, student_id as string);
      sendSuccess(res, data, 'Student support data fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch student support');
    }
  }

  async getTeacherTools(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const { teacher_id } = req.query;
      const data = await aiTeachingService.getTeacherTools(organisation_id, teacher_id as string);
      sendSuccess(res, data, 'Teacher tools data fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch teacher tools');
    }
  }

  async generateLesson(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await aiTeachingService.generateLesson(organisation_id, req.body);
      sendSuccess(res, data, 'Lesson generated');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to generate lesson');
    }
  }

  async generateQuiz(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await aiTeachingService.generateQuiz(organisation_id, req.body);
      sendSuccess(res, data, 'Quiz generated');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to generate quiz');
    }
  }

  async generateContent(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await aiTeachingService.generateContent(organisation_id, req.body);
      sendSuccess(res, data, 'Content generated');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to generate content');
    }
  }

  async getKnowledgeBase(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await aiTeachingService.getKnowledgeBase(organisation_id, req.query);
      sendSuccess(res, data, 'Knowledge base fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch knowledge base');
    }
  }

  async uploadKnowledgeDoc(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await aiTeachingService.uploadKnowledgeDoc(organisation_id, req.body);
      sendSuccess(res, data, 'Document uploaded');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to upload document');
    }
  }

  async deleteKnowledgeDoc(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = await aiTeachingService.deleteKnowledgeDoc(id);
      sendSuccess(res, data, 'Document deleted');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to delete document');
    }
  }

  async getAnalytics(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const data = await aiTeachingService.getAnalytics(organisation_id);
      sendSuccess(res, data, 'Analytics fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch analytics');
    }
  }

  async getReports(req: AuthRequest, res: Response) {
    try {
      const { organisation_id } = req.params;
      if (!organisation_id) return sendError(res, 'Organisation ID is required', 400);
      const { type } = req.query;
      const data = await aiTeachingService.getReports(organisation_id, (type as string) || 'summary');
      sendSuccess(res, data, 'Report fetched');
    } catch (err: any) {
      sendError(res, err.message || 'Failed to fetch report');
    }
  }
}

export const aiTeachingController = new AiTeachingController();
