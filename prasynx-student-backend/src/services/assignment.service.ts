import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class AssignmentService {
  async getByStudent(studentId: string, organisationId?: string) {
    let query = supabase.from('assignments').select('*').eq('status', 'active');
    if (organisationId) {
      query = query.eq('organisation_id', organisationId);
    }
    const { data: assignments, error } = await query;
    if (error) throw new BadRequestError(error.message);

    const { data: submissions } = await supabase
      .from('assignment_submissions')
      .select('*')
      .eq('student_id', studentId);

    return (assignments || []).map((a: any) => {
      const sub = submissions?.find((s: any) => s.assignment_id === a.id) || null;
      return { ...a, submission_status: sub ? sub.status : 'pending', submission: sub };
    });
  }

  async submit(assignmentId: string, data: any) {
    const { data: result, error } = await supabase.from('assignment_submissions').insert({ assignment_id: assignmentId, ...data, submitted_at: new Date() }).select();
    if (error) throw new BadRequestError(error.message);
    return result?.[0];
  }
}
export const assignmentService = new AssignmentService();
