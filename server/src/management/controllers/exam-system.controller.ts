import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export class ExamSystemController {
  async getExams(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('online_exams').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createExam(req: Request, res: Response) {
    const { error } = await supabase.from('online_exams').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getQuestions(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('exam_questions').select('*').eq('exam_id', req.params.exam_id);
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createQuestion(req: Request, res: Response) {
    const { error } = await supabase.from('exam_questions').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getProctoringSessions(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('proctoring_sessions').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createProctoringSession(req: Request, res: Response) {
    const { error } = await supabase.from('proctoring_sessions').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getQuestionBankItems(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('question_bank_items').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createQuestionBankItem(req: Request, res: Response) {
    const { error } = await supabase.from('question_bank_items').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getAdaptiveTests(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('adaptive_test_sessions').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createAdaptiveTest(req: Request, res: Response) {
    const { error } = await supabase.from('adaptive_test_sessions').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getGradebookEntries(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('gradebook_entries').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createGradebookEntry(req: Request, res: Response) {
    const { error } = await supabase.from('gradebook_entries').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getReEvaluations(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('re_evaluation_requests').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) {
      sendError(res, e.message);
    }
  }

  async createReEvaluation(req: Request, res: Response) {
    const { error } = await supabase.from('re_evaluation_requests').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }
}

export const examSystemController = new ExamSystemController();
