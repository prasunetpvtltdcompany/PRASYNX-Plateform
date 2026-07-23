import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export class StudentHealthRecordsController {
  async createMedicalRecord(req: Request, res: Response) {
    const { student_id, record_type, title, description, value } = req.body;
    if (!student_id || !record_type) return sendError(res, 'Required: student_id, record_type', 400);
    try {
      const { data, error } = await supabase.from('health_medical_records').insert({ student_id, record_type, title, description, value }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createCheckup(req: Request, res: Response) {
    const { student_id, checkup_type, scheduled_date, notes } = req.body;
    if (!student_id || !checkup_type || !scheduled_date) return sendError(res, 'Required: student_id, checkup_type, scheduled_date', 400);
    try {
      const { data, error } = await supabase.from('health_checkups').insert({ student_id, checkup_type, scheduled_date, notes, status: 'scheduled' }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createMedication(req: Request, res: Response) {
    const { student_id, medication_name, dosage, administered_by, notes } = req.body;
    if (!student_id || !medication_name || !dosage) return sendError(res, 'Required: student_id, medication_name, dosage', 400);
    try {
      const { data, error } = await supabase.from('health_medications').insert({ student_id, medication_name, dosage, administered_by, notes, administered_at: new Date().toISOString() }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createCounseling(req: Request, res: Response) {
    const { student_id, category, message } = req.body;
    if (!student_id || !category || !message) return sendError(res, 'Required: student_id, category, message', 400);
    try {
      const { data, error } = await supabase.from('health_counseling_requests').insert({ student_id, category, message, status: 'open', created_at: new Date().toISOString() }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async logMood(req: Request, res: Response) {
    const { student_id, mood_score, note } = req.body;
    if (!student_id || mood_score == null) return sendError(res, 'Required: student_id, mood_score', 400);
    try {
      const { data, error } = await supabase.from('health_mood_logs').insert({ student_id, mood_score, note, logged_at: new Date().toISOString() }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async reportCovid(req: Request, res: Response) {
    const { student_id, symptoms, has_fever, isolation_start, notes } = req.body;
    if (!student_id || !symptoms) return sendError(res, 'Required: student_id, symptoms', 400);
    try {
      const { data, error } = await supabase.from('health_covid_tracking').insert({
        student_id, symptoms, has_fever: has_fever || false,
        isolation_start: isolation_start || new Date().toISOString().slice(0, 10), notes,
        status: 'active', reported_date: new Date().toISOString().slice(0, 10)
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async resolveCovid(req: Request, res: Response) {
    const { id } = req.params;
    const { isolation_end, notes } = req.body;
    try {
      const { data, error } = await supabase.from('health_covid_tracking').update({
        status: 'resolved', isolation_end: isolation_end || new Date().toISOString().slice(0, 10), notes
      }).eq('id', id).select().single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getEmergency(req: Request, res: Response) {
    const { student_id } = req.params;
    try {
      const { data, error } = await supabase.from('health_emergency_contacts').select('*').eq('student_id', student_id);
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }
}
export const studentHealthRecordsController = new StudentHealthRecordsController();
