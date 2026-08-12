import { ForbiddenError, NotFoundError } from '../../shared/errors/errors';
import { requestDb } from '../../infrastructure/database/supabase';
import type { AssignmentDetailDTO, AssignmentDTO, AssignmentRow, AssignmentSubmissionRow } from '@prasynx/types';

export interface AssignmentRowWithNames extends AssignmentRow {
  subjects: { name: string } | null;
}

/** Row plus an optional joined subject (used by toDTO). */
type AssignmentLike = AssignmentRow & { subjects?: { name: string } | null };

export interface SubmissionRowWithNames extends AssignmentSubmissionRow {
  students: { full_name: string } | null;
}

export class AssignmentRepository {
  async getAssignment(tenantId: string, assignmentId: string): Promise<AssignmentRow> {
    const { data, error } = await requestDb()
      .from('assignments')
      .select('*')
      .eq('id', assignmentId)
      .maybeSingle();
    if (error || !data) throw new NotFoundError('Assignment not found');
    if ((data as AssignmentRow).organisation_id !== tenantId) throw new ForbiddenError('Assignment does not belong to this school');
    return data as AssignmentRow;
  }

  async assertClassInTenant(tenantId: string, classId: string): Promise<void> {
    const { data } = await requestDb().from('classes').select('organisation_id').eq('id', classId).maybeSingle();
    if (!data) throw new NotFoundError('Class not found');
    if ((data as { organisation_id: string }).organisation_id !== tenantId) throw new ForbiddenError('Class does not belong to this school');
  }

  async assertSubjectInTenant(tenantId: string, subjectId: string | null | undefined): Promise<void> {
    if (!subjectId) return;
    const { data } = await requestDb().from('subjects').select('organisation_id').eq('id', subjectId).maybeSingle();
    if (!data) throw new NotFoundError('Subject not found');
    if ((data as { organisation_id: string }).organisation_id !== tenantId) throw new ForbiddenError('Subject does not belong to this school');
  }

  async assertStudentInTenant(tenantId: string, studentId: string): Promise<void> {
    const { data } = await requestDb().from('students').select('organisation_id').eq('id', studentId).maybeSingle();
    if (!data) throw new NotFoundError('Student not found');
    if ((data as { organisation_id: string }).organisation_id !== tenantId) throw new ForbiddenError('Student does not belong to this school');
  }

  async listAssignments(input: {
    tenantId: string;
    classId?: string;
    subjectId?: string;
    status?: AssignmentRow['status'];
    page: number;
    pageSize: number;
  }): Promise<{ data: AssignmentDTO[]; total: number; page: number; pageSize: number; totalPages: number }> {
    let query = requestDb()
      .from('assignments')
      .select('*, subjects(name), assignment_submissions(count)', { count: 'exact' })
      .eq('organisation_id', input.tenantId)
      .order('created_at', { ascending: false });
    if (input.classId) query = query.eq('class_id', input.classId);
    if (input.subjectId) query = query.eq('subject_id', input.subjectId);
    if (input.status) query = query.eq('status', input.status);
    const from = (input.page - 1) * input.pageSize;
    const { data, error, count } = await query.range(from, from + input.pageSize - 1);
    if (error) throw error;
    const items = ((data as AssignmentRowWithNames[]) ?? []).map((r) => this.toDTO(r));
    const total = count ?? items.length;
    return { data: items, total, page: input.page, pageSize: input.pageSize, totalPages: Math.ceil(total / input.pageSize) };
  }

  async createAssignment(input: {
    organisation_id: string;
    teacher_id?: string | null;
    subject_id?: string | null;
    class_id: string;
    title: string;
    description?: string | null;
    due_date: string;
    max_score: number;
    file_url?: string | null;
  }): Promise<AssignmentRow> {
    const { data, error } = await requestDb()
      .from('assignments')
      .insert({ ...input, teacher_id: input.teacher_id ?? null })
      .select()
      .single();
    if (error || !data) throw error ?? new NotFoundError('Assignment could not be created');
    return data as AssignmentRow;
  }

  async getDetail(tenantId: string, assignmentId: string): Promise<AssignmentDetailDTO> {
    const assignment = await this.getAssignment(tenantId, assignmentId);
    const { data: subData, error } = await requestDb()
      .from('assignment_submissions')
      .select('*, students(full_name)')
      .eq('assignment_id', assignmentId);
    if (error) throw error;
    const submissions = ((subData as SubmissionRowWithNames[]) ?? []).map((s) => ({
      id: s.id,
      assignment_id: s.assignment_id,
      student_id: s.student_id,
      submission_text: s.submission_text,
      file_url: s.file_url,
      grade: s.grade,
      feedback: s.feedback,
      status: s.status,
      submitted_at: s.submitted_at,
      student_name: s.students?.full_name ?? null,
    }));
    const subjectName = await this.subjectName(assignment.subject_id);
    return { ...this.toDTO(this.withSubjectName(assignment, subjectName)), submissions };
  }

  async upsertSubmission(input: {
    assignment_id: string;
    student_id: string;
    submission_text?: string | null;
    file_url?: string | null;
    status: 'draft' | 'submitted';
  }): Promise<AssignmentSubmissionRow> {
    const { data, error } = await requestDb()
      .from('assignment_submissions')
      .upsert(input, { onConflict: 'assignment_id,student_id' })
      .select()
      .single();
    if (error || !data) throw error ?? new NotFoundError('Submission could not be saved');
    return data as AssignmentSubmissionRow;
  }

  async gradeSubmission(assignmentId: string, studentId: string, fields: { grade: number; feedback?: string | null; status?: 'graded' }): Promise<AssignmentSubmissionRow> {
    const { data, error } = await requestDb()
      .from('assignment_submissions')
      .update({ ...fields, feedback: fields.feedback ?? null })
      .eq('assignment_id', assignmentId)
      .eq('student_id', studentId)
      .select()
      .single();
    if (error || !data) throw new NotFoundError('Submission not found for this student');
    return data as AssignmentSubmissionRow;
  }

  async submissionsForStudent(studentId: string): Promise<Array<{ assignment: AssignmentRow; submission: AssignmentSubmissionRow }>> {
    const { data, error } = await requestDb()
      .from('assignment_submissions')
      .select('*, assignments(*)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data as Array<SubmitLeaf>) ?? []).map((s) => ({
      assignment: s.assignments as AssignmentRow,
      submission: {
        id: s.id,
        assignment_id: s.assignment_id,
        student_id: s.student_id,
        submission_text: s.submission_text,
        file_url: s.file_url,
        grade: s.grade,
        feedback: s.feedback,
        status: s.status,
        submitted_at: s.submitted_at,
      },
    }));
  }

  /** Resolve the teacher id bound to a user (submission/report flows). */
  async teacherForUser(userId: string): Promise<string | null> {
    const { data } = await requestDb().from('teachers').select('id').eq('user_id', userId).maybeSingle();
    return (data as { id: string } | null)?.id ?? null;
  }

  /** A teacher may act on an assignment if it belongs to their class. */
  async teacherClassIds(userId: string): Promise<string[]> {
    const teacher = await this.teacherForUser(userId);
    if (!teacher) return [];
    const { data } = await requestDb()
      .from('class_subject_teacher_map')
      .select('class_id')
      .eq('teacher_id', teacher);
    return ((data as Array<{ class_id: string }>) ?? []).map((r) => r.class_id);
  }

  private async subjectName(subjectId: string | null | undefined): Promise<string | null> {
    if (!subjectId) return null;
    const { data } = await requestDb().from('subjects').select('name').eq('id', subjectId).maybeSingle();
    return (data as { name: string } | null)?.name ?? null;
  }

  private withSubjectName(row: AssignmentRow, subjectName: string | null): AssignmentDTO {
    return this.toDTO({ ...row, subjects: subjectName ? { name: subjectName } : null });
  }

  private toDTO(row: AssignmentLike): AssignmentDTO {
    const submissionsAgg = (row as unknown as { assignment_submissions: Array<unknown> | { count?: number } | null }).assignment_submissions;
    let submissions_count: number;
    if (Array.isArray(submissionsAgg)) submissions_count = submissionsAgg.length;
    else if (submissionsAgg && typeof submissionsAgg === 'object' && 'count' in submissionsAgg) submissions_count = (submissionsAgg as { count: number }).count;
    else submissions_count = 0;
    return {
      id: row.id,
      organisation_id: row.organisation_id,
      teacher_id: row.teacher_id,
      subject_id: row.subject_id,
      class_id: row.class_id,
      title: row.title,
      description: row.description,
      due_date: row.due_date,
      max_score: row.max_score,
      file_url: row.file_url,
      status: row.status,
      created_at: row.created_at,
      subject_name: row.subjects?.name ?? null,
      submissions_count,
    };
  }
}

interface SubmitLeaf {
  assignments: AssignmentRow;
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text?: string | null;
  file_url?: string | null;
  grade?: number | null;
  feedback?: string | null;
  status: AssignmentSubmissionRow['status'];
  submitted_at?: string;
}