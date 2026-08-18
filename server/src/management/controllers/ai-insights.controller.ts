import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export class AiInsightsController {
  async getPredictions(req: Request, res: Response) {
    try {
      const { data } = await supabase
        .from('ai_predictions')
        .select('*, student:students(*)')
        .eq('organisation_id', req.params.org_id)
        .order('created_at', { ascending: false });
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createPrediction(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('ai_predictions')
        .insert({
          student_id: req.body.student_id,
          prediction_type: req.body.prediction_type,
          score: req.body.score,
          risk_level: req.body.risk_level,
          recommendation: req.body.recommendation,
          organisation_id: req.body.organisation_id
        })
        .select()
        .single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getRemedialPlans(req: Request, res: Response) {
    try {
      const { data } = await supabase
        .from('ai_remedial_plans')
        .select('*')
        .eq('organisation_id', req.params.org_id)
        .order('created_at', { ascending: false });
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createRemedialPlan(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('ai_remedial_plans')
        .insert({
          student_id: req.body.student_id,
          subject: req.body.subject,
          weakness_areas: req.body.weakness_areas,
          plan_details: req.body.plan_details,
          start_date: req.body.start_date,
          end_date: req.body.end_date,
          status: req.body.status,
          organisation_id: req.body.organisation_id
        })
        .select()
        .single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async updateRemedialPlanStatus(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('ai_remedial_plans')
        .update({ status: req.body.status })
        .eq('id', req.params.id)
        .select()
        .single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getTeacherEffectiveness(req: Request, res: Response) {
    try {
      const { data } = await supabase
        .from('teacher_effectiveness')
        .select('*, teacher:staff_records(*)')
        .eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createTeacherEffectiveness(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('teacher_effectiveness')
        .insert({
          teacher_id: req.body.teacher_id,
          metric_name: req.body.metric_name,
          score: req.body.score,
          period: req.body.period,
          organisation_id: req.body.organisation_id
        })
        .select()
        .single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getTimetableOptimizations(req: Request, res: Response) {
    try {
      const { data } = await supabase
        .from('timetable_optimizations')
        .select('*')
        .eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createTimetableOptimization(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('timetable_optimizations')
        .insert({
          suggested_timetable: req.body.suggested_timetable,
          constraints: req.body.constraints,
          score: req.body.score,
          status: req.body.status,
          organisation_id: req.body.organisation_id
        })
        .select()
        .single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }
}

export const aiInsightsController = new AiInsightsController();
