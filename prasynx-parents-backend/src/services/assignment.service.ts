import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class AssignmentService {
  async getAssignments(studentId: string) {
    const { data: studentClasses, error: classError } = await supabase
      .from('class_student_map')
      .select('class_id')
      .eq('student_id', studentId);

    if (classError) throw new BadRequestError(classError.message);

    const classIds = studentClasses?.map(s => s.class_id) || [];
    if (classIds.length === 0) return { assignments: [], submissions: [] };

    const [assignmentsResult, submissionsResult] = await Promise.all([
      supabase.from('assignments').select('*').in('class_id', classIds).order('due_date', { ascending: true }),
      supabase.from('assignment_submissions').select('*').eq('student_id', studentId)
    ]);

    if (assignmentsResult.error) throw new BadRequestError(assignmentsResult.error.message);
    if (submissionsResult.error) throw new BadRequestError(submissionsResult.error.message);

    const subs = submissionsResult.data || [];
    const assignments = (assignmentsResult.data || []).map((a: any) => {
      const sub = subs.find((s: any) => s.assignment_id === a.id);
      const overdue = a.due_date ? new Date(a.due_date) < new Date() : false;
      return { ...a, submitted: Boolean(sub), submission: sub, status: sub?.status || (overdue ? 'overdue' : 'pending') };
    });
    return { assignments };
  }
}
export const assignmentService = new AssignmentService();
