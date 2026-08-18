import { supabase } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class HomeworkService {
  async getHomework(orgId: string) {
    const { data, error } = await supabase.from('homework')
      .select('*, class:class_sections!homework_class_id_fkey(name), section:class_sections!homework_section_id_fkey(name), subject:subjects(name), teacher:staff_records(full_name)')
      .eq('organisation_id', orgId).order('due_date', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getHomeworkById(id: string) {
    const { data, error } = await supabase.from('homework')
      .select('*, class:class_sections!homework_class_id_fkey(name), section:class_sections!homework_section_id_fkey(name), subject:subjects(name), teacher:staff_records(full_name)')
      .eq('id', id).single();
    if (error) throw new NotFoundError('Homework not found');
    return data;
  }

  async createHomework(orgId: string, body: any) {
    const { data, error } = await supabase.from('homework').insert({ ...body, organisation_id: orgId }).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async updateHomework(id: string, body: any) {
    const { data, error } = await supabase.from('homework').update(body).eq('id', id).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async deleteHomework(id: string) {
    const { error } = await supabase.from('homework').delete().eq('id', id);
    if (error) throw new BadRequestError(error.message);
    return { message: 'Homework deleted' };
  }

  async getSubmissions(homeworkId: string) {
    const { data, error } = await supabase.from('homework_submissions')
      .select('*, student:students(full_name, roll_number)')
      .eq('homework_id', homeworkId).order('submitted_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async submitHomework(orgId: string, body: any) {
    const { data, error } = await supabase.from('homework_submissions').insert({ ...body, organisation_id: orgId }).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async gradeSubmission(id: string, body: any) {
    const { data, error } = await supabase.from('homework_submissions').update({ ...body, graded_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async getPerformance(orgId: string) {
    const { data, error } = await supabase.from('homework_submissions')
      .select('*, homework:homework!inner(organisation_id, subject:subjects(name))')
      .eq('homework.organisation_id', orgId);
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }
}

export const homeworkService = new HomeworkService();
