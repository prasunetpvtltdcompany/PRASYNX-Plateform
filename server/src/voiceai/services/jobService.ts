import { supabase } from '../config/database';
import { JobRecord } from '../types';
import { AppError } from '../utils/errors';

export class JobService {
  async create(data: {
    providerName: string;
    title: string;
    description: string;
    type: JobRecord['type'];
    location: string;
    salaryRange?: string;
    skills: string[];
    targetAudience: JobRecord['target_audience'];
  }): Promise<JobRecord> {
    const { data: record, error } = await supabase
      .from('voice_jobs')
      .insert({
        provider_name: data.providerName,
        title: data.title,
        description: data.description,
        type: data.type,
        location: data.location,
        salary_range: data.salaryRange || null,
        skills: data.skills,
        target_audience: data.targetAudience,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new AppError(`Failed to post job: ${error.message}`, 500);
    return record;
  }

  async list(limit = 20, offset = 0, type?: string, audience?: string): Promise<JobRecord[]> {
    let query = supabase.from('voice_jobs').select('*').eq('status', 'open');
    if (type) query = query.eq('type', type);
    if (audience) query = query.contains('target_audience', [audience]);
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw new AppError(`Failed to list jobs: ${error.message}`, 500);
    return data || [];
  }

  async getById(id: string): Promise<JobRecord> {
    const { data, error } = await supabase.from('voice_jobs').select('*').eq('id', id).single();
    if (error || !data) throw new AppError('Job not found', 404);
    return data;
  }

  async updateStatus(id: string, status: JobRecord['status']): Promise<JobRecord> {
    const { data, error } = await supabase
      .from('voice_jobs')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new AppError(`Failed to update job: ${error.message}`, 500);
    return data;
  }
}

export const jobService = new JobService();
