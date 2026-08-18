import { Request, Response } from 'express';
import { supabase } from '../lib/backend-common';
import { sendSuccess, sendCreated, sendError } from '../utils/response';

export class StudentOnlineExamController {
  async getQuestions(req: Request, res: Response) {
    const { exam_id } = req.params;
    try {
      const { data, error } = await supabase.from('exam_questions').select('*').eq('exam_id', exam_id).order('created_at');
      if (error) throw error;
      sendSuccess(res, data || []);
    } catch (e: any) { sendError(res, e.message); }
  }

  async submitExam(req: Request, res: Response) {
    const { student_id, exam_id, answers } = req.body;
    try {
      const { data: questions } = await supabase.from('exam_questions').select('*').eq('exam_id', exam_id);
      const scored = (questions || []).reduce((total: number, q: any) => {
        if (q.question_type === 'mcq') {
          const answer = answers?.[q.id];
          if (answer && answer.toString().trim().toLowerCase() === q.correct_answer?.toString().trim().toLowerCase()) {
            return total + (q.marks || 1);
          }
        }
        return total;
      }, 0);
      const { data, error } = await supabase.from('exam_submissions').insert({
        exam_id, student_id, answers: JSON.stringify(answers),
        start_time: new Date().toISOString(), submission_time: new Date().toISOString(),
        marks_obtained: scored, status: 'completed'
      }).select().single();
      if (error) throw error;
      sendCreated(res, data);
    } catch (e: any) { sendError(res, e.message); }
  }

  async getExamResult(req: Request, res: Response) {
    const { exam_id, student_id } = req.params;
    try {
      const { data, error } = await supabase.from('exam_submissions').select('*').eq('exam_id', exam_id).eq('student_id', student_id).single();
      if (error && error.code !== 'PGRST116') throw error;
      sendSuccess(res, data || null);
    } catch (e: any) { sendError(res, e.message); }
  }
}
export const studentOnlineExamController = new StudentOnlineExamController();
