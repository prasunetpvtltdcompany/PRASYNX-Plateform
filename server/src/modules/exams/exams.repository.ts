import { ForbiddenError, NotFoundError } from '../../shared/errors/errors';
import { requestDb } from '../../infrastructure/database/supabase';
import type { ExamDTO, ExamResultDTO, ExamResultRow, ExamRow, ExamScheduleDTO, ExamScheduleRow, ExamStatus, ExamType, Paginated } from '@prasynx/types';

export interface ExamScheduleRowWithNames extends ExamScheduleDTO {
  class_name: string | null;
}

export class ExamRepository {
  async getExam(tenantId: string, examId: string): Promise<ExamRow> {
    const { data, error } = await requestDb()
      .from('exams')
      .select('*')
      .eq('id', examId)
      .maybeSingle();
    if (error || !data) throw new NotFoundError('Exam not found');
    this.ensureTenant((data as ExamRow).organisation_id, tenantId);
    return data as ExamRow;
  }

  async listExams(tenantId: string, status: ExamStatus | undefined, page: number, pageSize: number): Promise<Paginated<ExamDTO>> {
    let query = requestDb().from('exams').select('*', { count: 'exact' }).eq('organisation_id', tenantId).order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const from = (page - 1) * pageSize;
    const { data, error, count } = await query.range(from, from + pageSize - 1);
    if (error) throw error;
    const items = (data as ExamDTO[]) ?? [];
    const total = count ?? items.length;
    return { data: items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async createExam(input: {
    organisation_id: string;
    name: string;
    exam_type: ExamType;
    start_date?: string | null;
    end_date?: string | null;
    max_marks: number;
  }): Promise<ExamRow> {
    const { data, error } = await requestDb().from('exams').insert(input).select().single();
    if (error || !data) throw error ?? new NotFoundError('Exam could not be created');
    return data as ExamRow;
  }

  async updateExam(examId: string, tenantId: string, fields: Partial<Pick<ExamRow, 'name' | 'exam_type' | 'start_date' | 'end_date' | 'max_marks' | 'status'>>): Promise<ExamRow> {
    await this.getExam(tenantId, examId); // existence + tenant
    const { data, error } = await requestDb()
      .from('exams')
      .update(fields)
      .eq('id', examId)
      .select()
      .single();
    if (error || !data) throw error ?? new NotFoundError('Exam could not be updated');
    return data as ExamRow;
  }

  async listSchedules(tenantId: string, examId: string): Promise<ExamScheduleDTO[]> {
    const { data, error } = await requestDb()
      .from('exam_schedules')
      .select('*, subjects(name), classes(name)')
      .eq('organisation_id', tenantId)
      .eq('exam_id', examId)
      .order('date');
    if (error) throw error;
    return ((data as ExamScheduleRowWithNames[]) ?? []).map((r) => ({
      id: r.id,
      organisation_id: r.organisation_id,
      exam_id: r.exam_id,
      class_id: r.class_id,
      subject_id: r.subject_id,
      date: r.date,
      start_time: r.start_time,
      end_time: r.end_time,
      room: r.room,
      subject_name: (r as unknown as { subjects: { name: string } | null }).subjects?.name ?? null,
      class_name: (r as unknown as { classes: { name: string } | null }).classes?.name ?? null,
    }));
  }

  async insertSchedules(rows: Array<Pick<ExamScheduleRow, 'organisation_id' | 'exam_id' | 'class_id' | 'subject_id' | 'date' | 'start_time' | 'end_time' | 'room'>>): Promise<ExamScheduleRow[]> {
    if (!rows.length) return [];
    const { data, error } = await requestDb().from('exam_schedules').insert(rows).select();
    if (error) throw error;
    return (data as ExamScheduleRow[]) ?? [];
  }

  async deleteSchedules(tenantId: string, scheduleIds: string[]): Promise<void> {
    const { error } = await requestDb().from('exam_schedules').delete().in('id', scheduleIds).eq('organisation_id', tenantId);
    if (error) throw error;
  }

  async listResults(tenantId: string, examId: string): Promise<ExamResultDTO[]> {
    const { data, error } = await requestDb()
      .from('exam_results')
      .select('*, students(full_name), subjects(name)')
      .eq('organisation_id', tenantId)
      .eq('exam_id', examId);
    if (error) throw error;
    return ((data as Array<ExamResultRow & { students: { full_name: string } | null; subjects: { name: string } | null }>) ?? []).map((r) => ({
      id: r.id,
      organisation_id: r.organisation_id,
      exam_id: r.exam_id,
      student_id: r.student_id,
      subject_id: r.subject_id,
      marks_obtained: r.marks_obtained,
      max_marks: r.max_marks,
      grade: r.grade,
      remarks: r.remarks,
      student_name: r.students?.full_name ?? null,
      subject_name: r.subjects?.name ?? null,
    }));
  }

  /** Upsert result rows. Rows carry no tenant id - it is stamped by the service. */
  async upsertResults(rows: Array<{
    organisation_id: string;
    exam_id: string;
    student_id: string;
    subject_id: string;
    marks_obtained: number;
    max_marks: number;
    grade?: string | null;
    remarks?: string | null;
  }>): Promise<void> {
    if (!rows.length) return;
    const { error } = await requestDb()
      .from('exam_results')
      .upsert(rows, { onConflict: 'exam_id,student_id,subject_id' });
    if (error) throw error;
  }

  async resultsForStudent(studentId: string): Promise<ExamResultDTO[]> {
    const { data, error } = await requestDb()
      .from('exam_results')
      .select('*, students(full_name), subjects(name)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data as Array<ExamResultRow & { students: { full_name: string } | null; subjects: { name: string } | null }>) ?? []).map((r) => ({
      id: r.id,
      organisation_id: r.organisation_id,
      exam_id: r.exam_id,
      student_id: r.student_id,
      subject_id: r.subject_id,
      marks_obtained: r.marks_obtained,
      max_marks: r.max_marks,
      grade: r.grade,
      remarks: r.remarks,
      student_name: r.students?.full_name ?? null,
      subject_name: r.subjects?.name ?? null,
    }));
  }

  // --- tenant guards ---

  /** Ensure a class belongs to the tenant (subjects/classes are org-scoped). */
  async assertClassInTenant(tenantId: string, classId: string): Promise<void> {
    const { data } = await requestDb().from('classes').select('organisation_id').eq('id', classId).maybeSingle();
    if (!data) throw new NotFoundError('Class not found');
    if ((data as { organisation_id: string }).organisation_id !== tenantId) throw new ForbiddenError('Class does not belong to this school');
  }

  async assertSubjectInTenant(tenantId: string, subjectId: string): Promise<void> {
    const { data } = await requestDb().from('subjects').select('organisation_id').eq('id', subjectId).maybeSingle();
    if (!data) throw new NotFoundError('Subject not found');
    if ((data as { organisation_id: string }).organisation_id !== tenantId) throw new ForbiddenError('Subject does not belong to this school');
  }

  async assertStudentInTenant(tenantId: string, studentId: string): Promise<void> {
    const { data } = await requestDb().from('students').select('organisation_id').eq('id', studentId).maybeSingle();
    if (!data) throw new NotFoundError('Student not found');
    if ((data as { organisation_id: string }).organisation_id !== tenantId) throw new ForbiddenError('Student does not belong to this school');
  }

  private ensureTenant(rowOrg: string, claimTenant: string) {
    if (rowOrg !== claimTenant) throw new ForbiddenError('Exam does not belong to this school');
  }
}