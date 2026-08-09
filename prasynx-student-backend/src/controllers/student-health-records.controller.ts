import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

/**
 * Student health controller — writes student/parent uploaded medical data into
 * the shared tables the management portal reads (health_records, vaccinations,
 * health_emergency_contacts). Every insert resolves and stores organisation_id
 * so the management portal can scope data by org.
 */
export class StudentHealthRecordsController {
  private async resolveOrg(studentId: string): Promise<string | null> {
    const { data } = await supabase.from('students').select('organisation_id').eq('id', studentId).maybeSingle();
    return data?.organisation_id || null;
  }

  async createMedicalRecord(req: Request, res: Response) {
    const { student_id, record_type, title, description, value } = req.body;
    if (!student_id || !record_type) return sendError(res, 'Required: student_id, record_type', 400);
    if (!title) return sendError(res, 'Required: title', 400);
    const organisation_id = await this.resolveOrg(student_id);
    try {
      const { data, error } = await supabase.from('health_records').insert({
        organisation_id, student_id, record_type,
        title, description: description || null, value: value || null,
        recorded_by: 'Student', recorded_at: new Date().toISOString(),
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createCheckup(req: Request, res: Response) {
    const { student_id, checkup_type, scheduled_date, notes } = req.body;
    if (!student_id || !checkup_type) return sendError(res, 'Required: student_id, checkup_type', 400);
    const organisation_id = await this.resolveOrg(student_id);
    try {
      const { data, error } = await supabase.from('health_records').insert({
        organisation_id, student_id, record_type: 'checkup',
        title: checkup_type, description: notes || null,
        value: scheduled_date || null, recorded_by: 'Student',
        recorded_at: new Date().toISOString(),
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createMedication(req: Request, res: Response) {
    const { student_id, medication_name, dosage, administered_by, notes } = req.body;
    if (!student_id || !medication_name || !dosage) return sendError(res, 'Required: student_id, medication_name, dosage', 400);
    const organisation_id = await this.resolveOrg(student_id);
    try {
      const { data, error } = await supabase.from('health_records').insert({
        organisation_id, student_id, record_type: 'medication',
        title: medication_name, value: dosage,
        description: [administered_by, notes].filter(Boolean).join(' — ') || null,
        recorded_by: 'Student', recorded_at: new Date().toISOString(),
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createVaccination(req: Request, res: Response) {
    const { student_id, vaccine_name, vaccination_date, next_due_date, administered_by, notes } = req.body;
    if (!student_id || !vaccine_name) return sendError(res, 'Required: student_id, vaccine_name', 400);
    const organisation_id = await this.resolveOrg(student_id);
    try {
      const { data, error } = await supabase.from('vaccinations').insert({
        organisation_id, student_id, vaccine_name,
        vaccination_date: vaccination_date || new Date().toISOString().slice(0, 10),
        next_due_date: next_due_date || null,
        administered_by: administered_by || null,
        notes: notes || null,
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createEmergencyContact(req: Request, res: Response) {
    const { student_id, name, relationship, phone, alternate_phone, address } = req.body;
    if (!student_id || !name) return sendError(res, 'Required: student_id, name', 400);
    const organisation_id = await this.resolveOrg(student_id);
    try {
      const { data, error } = await supabase.from('health_emergency_contacts').insert({
        organisation_id, student_id, name, relationship: relationship || null,
        phone: phone || null, alternate_phone: alternate_phone || null,
        address: address || null,
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createCounseling(req: Request, res: Response) {
    const { student_id, category, message } = req.body;
    if (!student_id || !category || !message) return sendError(res, 'Required: student_id, category, message', 400);
    const organisation_id = await this.resolveOrg(student_id);
    try {
      const { data, error } = await supabase.from('health_counseling_requests').insert({
        organisation_id, student_id, category, message, status: 'open', created_at: new Date().toISOString()
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async logMood(req: Request, res: Response) {
    const { student_id, mood_score, note } = req.body;
    if (!student_id || mood_score == null) return sendError(res, 'Required: student_id, mood_score', 400);
    const organisation_id = await this.resolveOrg(student_id);
    try {
      const { data, error } = await supabase.from('health_mood_logs').insert({
        organisation_id, student_id, mood_score, note: note || null, logged_at: new Date().toISOString()
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async reportCovid(req: Request, res: Response) {
    const { student_id, symptoms, has_fever, isolation_start, notes } = req.body;
    if (!student_id || !symptoms) return sendError(res, 'Required: student_id, symptoms', 400);
    const organisation_id = await this.resolveOrg(student_id);
    try {
      const { data, error } = await supabase.from('health_covid_tracking').insert({
        organisation_id, student_id, symptoms, has_fever: has_fever || false,
        isolation_start: isolation_start || new Date().toISOString().slice(0, 10), notes: notes || null,
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
