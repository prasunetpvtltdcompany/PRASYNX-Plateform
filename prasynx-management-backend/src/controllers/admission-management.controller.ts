import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export class AdmissionManagementController {
  async getApplications(req: Request, res: Response) {
    try {
      const { data } = await supabase
        .from('admissions')
        .select('*, student:students(*)')
        .eq('organisation_id', req.params.org_id)
        .order('created_at', { ascending: false });
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createApplication(req: Request, res: Response) {
    const { student_id, full_name, email, phone, class_applying, academic_year, status, document_url, organisation_id } = req.body;
    if (!organisation_id) return sendError(res, 'Required: organisation_id', 400);
    try {
      const { data, error } = await supabase.from('admissions').insert({
        student_id, full_name, email, phone, class_applying, academic_year,
        status: status || 'pending', document_url, organisation_id
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async updateApplicationStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    try {
      const { data, error } = await supabase.from('admissions').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getEnquiries(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('enquiries').select('*').eq('organisation_id', req.params.org_id).order('created_at', { ascending: false });
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createEnquiry(req: Request, res: Response) {
    const { parent_name, email, phone, child_name, child_class, message, status, organisation_id } = req.body;
    if (!organisation_id) return sendError(res, 'Required: organisation_id', 400);
    try {
      const { data, error } = await supabase.from('enquiries').insert({
        parent_name, email, phone, child_name, child_class, message,
        status: status || 'new', organisation_id
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async updateEnquiryStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status, follow_up_notes } = req.body;
    try {
      const { data, error } = await supabase.from('enquiries').update({ status, follow_up_notes }).eq('id', id).select().single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getWaitingList(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('waiting_list').select('*').eq('organisation_id', req.params.org_id).order('position', { ascending: true });
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createWaitingEntry(req: Request, res: Response) {
    const { student_name, class: studentClass, parent_name, phone, email, organisation_id } = req.body;
    if (!organisation_id) return sendError(res, 'Required: organisation_id', 400);
    try {
      const { data, error } = await supabase.from('waiting_list').insert({
        student_name, class: studentClass, parent_name, phone, email, organisation_id
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async deleteWaitingEntry(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const { error } = await supabase.from('waiting_list').delete().eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) { sendError(res, e.message); }
  }

  async getAdmissionReports(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('admissions').select('status').eq('organisation_id', req.params.org_id);
      const total = data?.length || 0;
      const accepted = data?.filter(r => r.status === 'accepted').length || 0;
      const rejected = data?.filter(r => r.status === 'rejected').length || 0;
      const waitlisted = data?.filter(r => r.status === 'waitlisted').length || 0;
      const pending = data?.filter(r => r.status === 'pending').length || 0;
      const conversion_rate = total > 0 ? Math.round((accepted / total) * 100) : 0;
      sendSuccess(res, { total_applications: total, accepted, rejected, waitlisted, pending, conversion_rate });
    } catch (e: any) { sendError(res, e.message); }
  }
}

export const admissionManagementController = new AdmissionManagementController();
