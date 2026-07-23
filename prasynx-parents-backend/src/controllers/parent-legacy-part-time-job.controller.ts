import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';

export class ParentLegacyPartTimeJobController {
  async getAll(req: Request, res: Response) {
    const { organisation_id } = req.params;
    const { type, role } = req.query as any;
    try {
      let query = supabase.from('part_time_jobs').select('*').eq('status', 'active');
      if (type) query = query.eq('type', type);
      if (role) query = query.or(`target_role.eq.${role},target_role.eq.,target_role.is.null`);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }

  async apply(req: Request, res: Response) {
    const { job_id, applicant_id, applicant_name, applicant_email, applicant_type, phone, cover_note } = req.body;
    if (!job_id || !applicant_id || !applicant_name) return res.status(400).json({ error: 'Required: job_id, applicant_id, applicant_name' });
    try {
      const { data: existing } = await supabase.from('part_time_job_applications').select('id').eq('job_id', job_id).eq('applicant_id', applicant_id).maybeSingle();
      if (existing) return res.status(400).json({ error: 'Already applied for this job' });
      const { data, error } = await supabase.from('part_time_job_applications').insert({
        job_id, applicant_id, applicant_name, applicant_email, applicant_type: applicant_type || 'parent',
        phone: phone || '', cover_note: cover_note || '', status: 'pending'
      }).select().single();
      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }

  async getMyApplications(req: Request, res: Response) {
    const { user_id } = req.params;
    try {
      const { data, error } = await supabase.from('part_time_job_applications').select('*, part_time_jobs(*)').eq('applicant_id', user_id).order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  }
}
export const parentLegacyPartTimeJobController = new ParentLegacyPartTimeJobController();
