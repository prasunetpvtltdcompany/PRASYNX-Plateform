import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

class NlpServicesController {
  async getSearchLogs(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const { data, error } = await supabase
        .from('nlp_search_logs')
        .select('*')
        .eq('organisation_id', org_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      sendSuccess(res, { search_logs: data || [] });
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  async createSearchLog(req: Request, res: Response) {
    try {
      const { query, result_count, entity_type, organisation_id } = req.body;
      if (!query || !organisation_id) {
        return sendError(res, 'query and organisation_id are required', 400);
      }
      const { data, error } = await supabase
        .from('nlp_search_logs')
        .insert({ query, result_count, entity_type, organisation_id })
        .select();
      if (error) throw error;
      sendCreated(res, data);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  async searchStudents(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const q = req.query.q as string;
      if (!q) {
        return sendError(res, 'query parameter q is required', 400);
      }
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('organisation_id', org_id)
        .ilike('full_name', `%${q}%`);
      if (error) throw error;
      sendSuccess(res, { results: data || [] });
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  async getReportComments(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const { data, error } = await supabase
        .from('nlp_report_comments')
        .select('*')
        .eq('organisation_id', org_id);
      if (error) throw error;
      sendSuccess(res, { report_comments: data || [] });
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  async createReportComment(req: Request, res: Response) {
    try {
      const { student_id, subject, comment_text, sentiment, organisation_id } = req.body;
      if (!student_id || !subject || !comment_text || !organisation_id) {
        return sendError(res, 'student_id, subject, comment_text, and organisation_id are required', 400);
      }
      const { data, error } = await supabase
        .from('nlp_report_comments')
        .insert({ student_id, subject, comment_text, sentiment, organisation_id })
        .select();
      if (error) throw error;
      sendCreated(res, data);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  async getSpeechLogs(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const { data, error } = await supabase
        .from('nlp_speech_logs')
        .select('*')
        .eq('organisation_id', org_id);
      if (error) throw error;
      sendSuccess(res, { speech_logs: data || [] });
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  async createSpeechLog(req: Request, res: Response) {
    try {
      const { user_id, audio_duration, transcribed_text, confidence, organisation_id } = req.body;
      if (!user_id || !audio_duration || !transcribed_text || !organisation_id) {
        return sendError(res, 'user_id, audio_duration, transcribed_text, and organisation_id are required', 400);
      }
      const { data, error } = await supabase
        .from('nlp_speech_logs')
        .insert({ user_id, audio_duration, transcribed_text, confidence, organisation_id })
        .select();
      if (error) throw error;
      sendCreated(res, data);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  async getTranslations(req: Request, res: Response) {
    try {
      const { org_id } = req.params;
      const { data, error } = await supabase
        .from('nlp_translations')
        .select('*')
        .eq('organisation_id', org_id);
      if (error) throw error;
      sendSuccess(res, { translations: data || [] });
    } catch (err: any) {
      sendError(res, err.message);
    }
  }

  async createTranslation(req: Request, res: Response) {
    try {
      const { source_text, translated_text, source_lang, target_lang, organisation_id } = req.body;
      if (!source_text || !translated_text || !source_lang || !target_lang || !organisation_id) {
        return sendError(res, 'source_text, translated_text, source_lang, target_lang, and organisation_id are required', 400);
      }
      const { data, error } = await supabase
        .from('nlp_translations')
        .insert({ source_text, translated_text, source_lang, target_lang, organisation_id })
        .select();
      if (error) throw error;
      sendCreated(res, data);
    } catch (err: any) {
      sendError(res, err.message);
    }
  }
}

export const nlpServicesController = new NlpServicesController();
