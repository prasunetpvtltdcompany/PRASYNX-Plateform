import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class ExamService {
  async createExam(data: { organisation_id: string; name: string; exam_type: string; start_date?: string; end_date?: string }) {
    const { organisation_id, name, exam_type, start_date, end_date } = data;
    if (!organisation_id || !name || !exam_type) throw new BadRequestError('Required fields: organisation_id, name, exam_type');
    const { data: result, error } = await supabase
      .from('exams')
      .insert({ organisation_id, name, exam_type, start_date: start_date || null, end_date: end_date || null, status: 'draft' })
      .select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async addExamQuestion(data: { exam_id: string; subject_id?: string; question_type: string; question_text: string; options?: any; correct_answer?: string; marks?: number }) {
    const { exam_id, subject_id, question_type, question_text, options, correct_answer, marks } = data;
    const { data: result, error } = await supabase
      .from('exam_questions')
      .insert({
        exam_id, subject_id: subject_id || null, question_type, question_text,
        option_a: options?.a || null, option_b: options?.b || null,
        option_c: options?.c || null, option_d: options?.d || null,
        correct_answer: correct_answer || null, marks: marks || 1
      })
      .select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async getExams(organisationId: string) {
    const { data, error } = await supabase
      .from('exams').select('*, questions:exam_questions(*)').eq('organisation_id', organisationId)
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async updateExamStatus(id: string, status: string) {
    const { data, error } = await supabase.from('exams').update({ status }).eq('id', id).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  async deleteExamQuestion(id: string) {
    const { error } = await supabase.from('exam_questions').delete().eq('id', id);
    if (error) throw new BadRequestError(error.message);
    return { success: true };
  }

  async getExamSubmissions(examId: string) {
    const { data, error } = await supabase
      .from('exam_submissions').select('*, student:students(full_name, roll_number, class_id, classes:classes!students_class_id_fkey(name))').eq('exam_id', examId)
      .order('submission_time', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async gradeExamSubmission(id: string, marks_obtained: number, feedback?: string) {
    const { data, error } = await supabase
      .from('exam_submissions').update({ marks_obtained, feedback: feedback || null }).eq('id', id).select().single();
    if (error) throw new BadRequestError(error.message);
    return data;
  }
}
export const examService = new ExamService();
