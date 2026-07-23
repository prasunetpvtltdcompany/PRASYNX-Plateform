import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

/**
 * Telemedicine Controller
 * 
 * Handles all telemedicine-related endpoints including consultations,
 * prescriptions, vaccinations, mental health chats, and emergency SOS.
 * Functions: getConsultations, createConsultation, getPrescriptions, createPrescription,
 *            getVaccinations, createVaccination, getMentalHealth, createMentalHealth,
 *            getSosAlerts, resolveSosAlert
 */
export class TelemedicineController {
  async getConsultations(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('telemedicine_consultations').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createConsultation(req: Request, res: Response) {
    const { error } = await supabase.from('telemedicine_consultations').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getPrescriptions(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('prescriptions').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createPrescription(req: Request, res: Response) {
    const { error } = await supabase.from('prescriptions').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getVaccinations(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('vaccination_records').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createVaccination(req: Request, res: Response) {
    const { error } = await supabase.from('vaccination_records').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getMentalHealth(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('mental_health_chats').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createMentalHealth(req: Request, res: Response) {
    const { error } = await supabase.from('mental_health_chats').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getSosAlerts(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('emergency_sos').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async resolveSosAlert(req: Request, res: Response) {
    const { error } = await supabase.from('emergency_sos').update({ resolved: true, responded_by: req.body.responded_by }).eq('id', req.params.id);
    if (error) return sendError(res, error.message);
    sendSuccess(res, { success: true });
  }
}

export const telemedicineController = new TelemedicineController();
