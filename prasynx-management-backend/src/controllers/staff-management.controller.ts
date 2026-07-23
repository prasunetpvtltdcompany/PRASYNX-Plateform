import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

/**
 * Staff Management Controller (Legacy)
 *
 * Handles staff management operations including payroll, attendance integration,
 * job postings, applications, interviews, performance reviews, goals, training, and transfers.
 * Functions: getPayroll, createPayrollRecord, getAttendanceIntegration, createAttendanceIntegration,
 *            getJobPostings, createJobPosting, getApplications, createApplication,
 *            getInterviews, createInterview, getPerformanceReviews, createPerformanceReview,
 *            getGoals, createGoal, getTraining, createTraining, getTransfers, createTransfer
 */
export class StaffManagementController {
  async getPayroll(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('payroll_records').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createPayrollRecord(req: Request, res: Response) {
    const { error } = await supabase.from('payroll_records').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getAttendanceIntegration(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('attendance_integration').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createAttendanceIntegration(req: Request, res: Response) {
    const { error } = await supabase.from('attendance_integration').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getJobPostings(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('job_postings').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createJobPosting(req: Request, res: Response) {
    const { error } = await supabase.from('job_postings').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getApplications(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('job_applications').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createApplication(req: Request, res: Response) {
    const { error } = await supabase.from('job_applications').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getInterviews(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('interview_schedules').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createInterview(req: Request, res: Response) {
    const { error } = await supabase.from('interview_schedules').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getPerformanceReviews(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('performance_reviews').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createPerformanceReview(req: Request, res: Response) {
    const { error } = await supabase.from('performance_reviews').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getGoals(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('goal_settings').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createGoal(req: Request, res: Response) {
    const { error } = await supabase.from('goal_settings').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getTraining(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('training_records').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createTraining(req: Request, res: Response) {
    const { error } = await supabase.from('training_records').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }

  async getTransfers(req: Request, res: Response) {
    try {
      const { data } = await supabase.from('staff_transfers').select('*').eq('organisation_id', req.params.org_id);
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createTransfer(req: Request, res: Response) {
    const { error } = await supabase.from('staff_transfers').insert(req.body);
    if (error) return sendError(res, error.message);
    sendCreated(res, { success: true });
  }
}

export const staffManagementController = new StaffManagementController();
