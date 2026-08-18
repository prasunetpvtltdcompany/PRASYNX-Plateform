import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

/**
 * Health Management Controller (legacy)
 *
 * Handles all legacy health-management endpoints including medical records,
 * checkups, medications, counseling, COVID tracking, mood logs, and emergency contacts.
 * Functions: getRecords, getCheckups, getMedications, getCounseling, getCovid,
 *            getMood, getEmergency, createRecord, createCheckup, createMedication,
 *            updateCounselingStatus, resolveCovidCase
 */
export class HealthManagementController {
  async getRecords(req: Request, res: Response) {
    try {
      const { data } = await supabase
        .from('health_medical_records')
        .select('*, student:students(full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))')
        .eq('organisation_id', req.params.org_id)
        .order('created_at', { ascending: false });
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getCheckups(req: Request, res: Response) {
    try {
      const { data } = await supabase
        .from('health_checkups')
        .select('*, student:students(full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))')
        .eq('organisation_id', req.params.org_id)
        .order('scheduled_date', { ascending: false });
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getMedications(req: Request, res: Response) {
    try {
      const { data } = await supabase
        .from('health_medications')
        .select('*, student:students(full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))')
        .eq('organisation_id', req.params.org_id)
        .order('administered_at', { ascending: false });
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getCounseling(req: Request, res: Response) {
    try {
      const { data } = await supabase
        .from('health_counseling_requests')
        .select('*')
        .eq('organisation_id', req.params.org_id)
        .order('created_at', { ascending: false });
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getCovid(req: Request, res: Response) {
    try {
      const { data } = await supabase
        .from('health_covid_tracking')
        .select('*, student:students(full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))')
        .eq('organisation_id', req.params.org_id)
        .order('reported_date', { ascending: false });
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getMood(req: Request, res: Response) {
    try {
      const { data } = await supabase
        .from('health_mood_logs')
        .select('*, student:students(full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))')
        .eq('organisation_id', req.params.org_id)
        .order('logged_at', { ascending: false });
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getEmergency(req: Request, res: Response) {
    try {
      const { data } = await supabase
        .from('health_emergency_contacts')
        .select('*, student:students(full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))')
        .eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createRecord(req: Request, res: Response) {
    const { student_id, record_type, title, description, value, organisation_id } = req.body;
    if (!student_id || !record_type) return sendError(res, 'Required: student_id, record_type', 400);
    try {
      const { data, error } = await supabase.from('health_medical_records').insert({
        student_id, record_type, title, description, value, organisation_id
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createCheckup(req: Request, res: Response) {
    const { student_id, checkup_type, scheduled_date, notes, organisation_id } = req.body;
    if (!student_id || !checkup_type || !scheduled_date) return sendError(res, 'Required: student_id, checkup_type, scheduled_date', 400);
    try {
      const { data, error } = await supabase.from('health_checkups').insert({
        student_id, checkup_type, scheduled_date, notes, organisation_id, status: 'scheduled'
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createMedication(req: Request, res: Response) {
    const { student_id, medication_name, dosage, administered_by, notes, organisation_id } = req.body;
    if (!student_id || !medication_name || !dosage) return sendError(res, 'Required: student_id, medication_name, dosage', 400);
    try {
      const { data, error } = await supabase.from('health_medications').insert({
        student_id, medication_name, dosage, administered_by, notes, organisation_id, administered_at: new Date().toISOString()
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async updateCounselingStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const { data, error } = await supabase.from('health_counseling_requests').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async resolveCovidCase(req: Request, res: Response) {
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
}

export const healthManagementController = new HealthManagementController();
