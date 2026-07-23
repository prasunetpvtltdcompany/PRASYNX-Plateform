import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class AssignmentService {
  async createAssignment(data: { teacher_id: string; subject_id?: string; class_id?: string; title: string; description?: string; due_date: string }) {
    const { teacher_id, subject_id, class_id, title, description, due_date } = data;
    if (!teacher_id || !title || !due_date) {
      throw new BadRequestError('Required fields: teacher_id, title, due_date');
    }
    const { data: result, error } = await supabase
      .from('assignments')
      .insert({ teacher_id, subject_id: subject_id || null, class_id: class_id || null, title, description: description || null, due_date, status: 'active' })
      .select().single();
    if (error) throw new BadRequestError(error.message);

    try {
      if (class_id) {
        const { data: classStudents } = await supabase.from('class_student_map').select('student_id').eq('class_id', class_id);
        if (classStudents && classStudents.length > 0) {
          const { data: students } = await supabase.from('students').select('id, organisation_id').in('id', classStudents.map((s: any) => s.student_id));
          if (students && students.length > 0) {
            const { data: studentUsers } = await supabase.from('users').select('id').in('id', students.map((s: any) => s.id)).eq('status', 'active');
            if (studentUsers && studentUsers.length > 0) {
              await supabase.from('notifications').insert(
                studentUsers.map((u: any) => ({ user_id: u.id, title: 'New Assignment', message: `New assignment: "${title}" — Due: ${due_date}`, type: 'info', read: false }))
              );
            }
          }
        }
      }
    } catch (e) { console.error('[Assignment] Failed to notify:', e); }

    return result;
  }

  async getAssignments(teacherId: string) {
    const { data, error } = await supabase
      .from('assignments').select('*, submissions:assignment_submissions(*)').eq('teacher_id', teacherId)
      .order('due_date', { ascending: true });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async getSubmissions(assignmentId: string) {
    const { data, error } = await supabase
      .from('assignment_submissions').select('*, student:students(*)').eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async gradeSubmission(submissionId: string, grade: string, feedback?: string) {
    const { data, error } = await supabase
      .from('assignment_submissions').update({ grade, feedback }).eq('id', submissionId).select().single();
    if (error) throw new BadRequestError(error.message);

    try {
      const { data: submission } = await supabase
        .from('assignment_submissions').select('student_id, assignment:assignments(title)').eq('id', submissionId).single();
      if (submission) {
        const { data: student } = await supabase.from('students').select('organisation_id').eq('id', submission.student_id).single();
        if (student) {
          await supabase.from('notifications').insert({
            user_id: submission.student_id, title: 'Assignment Graded',
            message: `Your assignment "${(submission.assignment as any)?.title}" has been graded: ${grade}.`, type: 'success', read: false,
          });
        }
      }
    } catch (e) { console.error('[Grade] Failed to notify:', e); }

    return data;
  }
}
export const assignmentService = new AssignmentService();
