import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { config } from '../config';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

/**
 * Career Management Controller (Legacy)
 *
 * Handles internships, psychometric tests, college applications,
 * skill assessments, and career sessions.
 */
export class CareerManagementController {
  // ==================== INTERNSHIPS ====================

  async getInternships(req: Request, res: Response) {
    try {
      const { data, error } = await supabase.from('career_internships')
        .select('*').eq('organisation_id', req.params.org_id).order('created_at', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createInternship(req: Request, res: Response) {
    try {
      const { organisation_id, company, role, description, duration, stipend, application_deadline } = req.body;
      const { data, error } = await supabase.from('career_internships').insert({
        organisation_id, company, role, description, duration, stipend, application_deadline, status: 'open'
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async updateInternship(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      delete updates.id; delete updates.organisation_id; delete updates.created_at;
      const { data, error } = await supabase.from('career_internships').update(updates).eq('id', id).select().single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async deleteInternship(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('career_internships').delete().eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) { sendError(res, e.message); }
  }

  // ==================== PSYCHOMETRIC TESTS ====================

  async getPsychometricTests(req: Request, res: Response) {
    try {
      const { data, error } = await supabase.from('career_psychometric_tests')
        .select('*').eq('organisation_id', req.params.org_id).order('name');
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createPsychometricTest(req: Request, res: Response) {
    try {
      const { organisation_id, name, description, duration } = req.body;
      const { data, error } = await supabase.from('career_psychometric_tests').insert({
        organisation_id, name, description, duration: parseInt(duration) || null
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async updatePsychometricTest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      delete updates.id; delete updates.organisation_id; delete updates.created_at;
      const { data, error } = await supabase.from('career_psychometric_tests').update(updates).eq('id', id).select().single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async deletePsychometricTest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('career_psychometric_tests').delete().eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) { sendError(res, e.message); }
  }

  // ==================== COLLEGE APPLICATIONS ====================

  async getCollegeApplications(req: Request, res: Response) {
    try {
      const { data: apps, error } = await supabase.from('career_college_applications')
        .select('*').eq('organisation_id', req.params.org_id).order('application_date', { ascending: false });
      if (error) throw error;
      if (!apps || apps.length === 0) { sendSuccess(res, []); return; }
      const studentIds = [...new Set(apps.map((a: any) => a.student_id).filter(Boolean))];
      const { data: students } = await supabase.from('students')
        .select('id, full_name, roll_number').in('id', studentIds.length ? studentIds : ['none']);
      const sm = new Map((students || []).map((s: any) => [s.id, s]));
      sendSuccess(res, apps.map((a: any) => ({ ...a, student: sm.get(a.student_id) || null })));
    } catch (e: any) { sendError(res, e.message); }
  }

  async createCollegeApplication(req: Request, res: Response) {
    try {
      const { organisation_id, student_id, college_name, program, application_date } = req.body;
      const { data, error } = await supabase.from('career_college_applications').insert({
        organisation_id, student_id, college_name, program, application_date, status: 'draft'
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async updateCollegeApplication(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      delete updates.id; delete updates.organisation_id; delete updates.created_at; delete updates.student;
      const { data, error } = await supabase.from('career_college_applications').update(updates).eq('id', id).select().single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async deleteCollegeApplication(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('career_college_applications').delete().eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) { sendError(res, e.message); }
  }

  // ==================== SKILL ASSESSMENTS ====================

  async getSkillAssessments(req: Request, res: Response) {
    try {
      const { data: assessments, error } = await supabase.from('career_skill_assessments')
        .select('*').eq('organisation_id', req.params.org_id).order('assessed_date', { ascending: false });
      if (error) throw error;
      if (!assessments || assessments.length === 0) { sendSuccess(res, []); return; }
      const studentIds = [...new Set(assessments.map((a: any) => a.student_id).filter(Boolean))];
      const { data: students } = await supabase.from('students')
        .select('id, full_name, roll_number').in('id', studentIds.length ? studentIds : ['none']);
      const sm = new Map((students || []).map((s: any) => [s.id, s]));
      sendSuccess(res, assessments.map((a: any) => ({ ...a, student: sm.get(a.student_id) || null })));
    } catch (e: any) { sendError(res, e.message); }
  }

  async createSkillAssessment(req: Request, res: Response) {
    try {
      const { organisation_id, student_id, skill, score, assessed_date } = req.body;
      const { data, error } = await supabase.from('career_skill_assessments').insert({
        organisation_id, student_id, skill, score: parseInt(score) || 0, assessed_date
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async deleteSkillAssessment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('career_skill_assessments').delete().eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) { sendError(res, e.message); }
  }

  // ==================== CAREER SESSIONS ====================

  async getSessions(req: Request, res: Response) {
    try {
      const { data, error } = await supabase.from('career_sessions')
        .select('*').eq('organisation_id', req.params.org_id).order('session_date', { ascending: false });
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async createSession(req: Request, res: Response) {
    try {
      const { organisation_id, title, description, speaker, session_date, session_time, location, max_participants } = req.body;
      const { data, error } = await supabase.from('career_sessions').insert({
        organisation_id, title, description, speaker, session_date, session_time, location,
        max_participants: parseInt(max_participants) || null, status: 'upcoming'
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async updateSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      delete updates.id; delete updates.organisation_id; delete updates.created_at;
      const { data, error } = await supabase.from('career_sessions').update(updates).eq('id', id).select().single();
      if (error) throw error;
      sendSuccess(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async deleteSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('career_sessions').delete().eq('id', id);
      if (error) throw error;
      sendSuccess(res, { success: true });
    } catch (e: any) { sendError(res, e.message); }
  }
}

export const careerManagementController = new CareerManagementController();
