import { ExamRepository } from './exams.repository';
import { BadRequestError } from '../../shared/errors/errors';
import { enqueue } from '../../infrastructure/jobs/queue';
import { studentAccess, type Requester } from '../../shared/access/studentAccess';
import { PERMISSIONS } from '@prasynx/config';
import type { ExamDetailDTO, ExamDTO, ExamResultDTO, ExamRow, ExamStatus, ExamType, Paginated } from '@prasynx/types';

const EXAM_TYPES: ExamType[] = ['midterm', 'final', 'quiz', 'unit_test', 'practical'];
const EXAM_STATUSES: ExamStatus[] = ['upcoming', 'ongoing', 'completed'];

export class ExamService {
  constructor(private repo: ExamRepository) {}

  async create(input: { tenantId: string; name: string; examType: ExamType; startDate?: string | null; endDate?: string | null; maxMarks: number }): Promise<ExamDTO> {
    if (!EXAM_TYPES.includes(input.examType)) throw new BadRequestError('Unsupported exam type');
    if (input.startDate && input.endDate && input.endDate < input.startDate) {
      throw new BadRequestError('End date cannot be before start date');
    }
    const row = await this.repo.createExam({
      organisation_id: input.tenantId,
      name: input.name,
      exam_type: input.examType,
      start_date: input.startDate,
      end_date: input.endDate,
      max_marks: input.maxMarks,
    });
    return this.toDTO(row);
  }

  async list(input: { tenantId: string; status?: ExamStatus; page: number; pageSize: number }): Promise<Paginated<ExamDTO>> {
    if (input.status && !EXAM_STATUSES.includes(input.status)) throw new BadRequestError('Unsupported exam status');
    return this.repo.listExams(input.tenantId, input.status, input.page, input.pageSize);
  }

  async get(input: { tenantId: string; examId: string }): Promise<ExamDetailDTO> {
    const exam = await this.repo.getExam(input.tenantId, input.examId);
    const [schedules, results] = await Promise.all([
      this.repo.listSchedules(input.tenantId, input.examId),
      this.repo.listResults(input.tenantId, input.examId),
    ]);
    return { ...this.toDTO(exam), schedules, results };
  }

  async updateStatus(input: { tenantId: string; examId: string; status: ExamStatus }): Promise<ExamDTO> {
    if (!EXAM_STATUSES.includes(input.status)) throw new BadRequestError('Unsupported exam status');
    const row = await this.repo.updateExam(input.examId, input.tenantId, { status: input.status });
    return this.toDTO(row);
  }

  async update(
    input: { tenantId: string; examId: string; fields: Partial<Pick<ExamRow, 'name' | 'exam_type' | 'start_date' | 'end_date' | 'max_marks'>> },
    status?: ExamStatus,
  ): Promise<ExamDTO> {
    const row = await this.repo.updateExam(input.examId, input.tenantId, {
      ...input.fields,
      ...(status ? { status } : {}),
    });
    return this.toDTO(row);
  }

  async schedule(input: {
    tenantId: string;
    examId: string;
    entries: Array<{ class_id: string; subject_id: string; date: string; start_time?: string | null; end_time?: string | null; room?: string | null }>;
  }): Promise<ExamDetailDTO['schedules']> {
    await this.repo.getExam(input.tenantId, input.examId); // existence + tenant
    const rows: Parameters<ExamRepository['insertSchedules']>[0] = [];
    for (const e of input.entries) {
      await this.repo.assertClassInTenant(input.tenantId, e.class_id);
      await this.repo.assertSubjectInTenant(input.tenantId, e.subject_id);
      rows.push({
        organisation_id: input.tenantId,
        exam_id: input.examId,
        class_id: e.class_id,
        subject_id: e.subject_id,
        date: e.date,
        start_time: e.start_time ?? null,
        end_time: e.end_time ?? null,
        room: e.room ?? null,
      });
    }
    return this.repo.insertSchedules(rows);
  }

  async removeSchedules(input: { tenantId: string; scheduleIds: string[] }): Promise<void> {
    await this.repo.deleteSchedules(input.tenantId, input.scheduleIds);
  }

  async recordResults(input: {
    tenantId: string;
    examId: string;
    results: Array<{ student_id: string; subject_id: string; marks_obtained: number; max_marks?: number; grade?: string | null; remarks?: string | null }>;
  }): Promise<ExamResultDTO[]> {
    await this.repo.getExam(input.tenantId, input.examId);
    const rows: Parameters<ExamRepository['upsertResults']>[0] = [];
    for (const r of input.results) {
      await this.repo.assertStudentInTenant(input.tenantId, r.student_id);
      await this.repo.assertSubjectInTenant(input.tenantId, r.subject_id);
      if (r.marks_obtained > (r.max_marks ?? 100)) throw new BadRequestError('Marks obtained cannot exceed max marks');
      rows.push({
        organisation_id: input.tenantId,
        exam_id: input.examId,
        student_id: r.student_id,
        subject_id: r.subject_id,
        marks_obtained: r.marks_obtained,
        max_marks: r.max_marks ?? 100,
        grade: r.grade ?? this.computeGrade(r.marks_obtained, r.max_marks ?? 100),
        remarks: r.remarks ?? null,
      });
    }
    await this.repo.upsertResults(rows);
    this.fanOutResultsPublished(input.tenantId, input.examId, input.results.length);
    return this.repo.listResults(input.tenantId, input.examId);
  }

  async resultsForStudent(input: { requester: Requester; tenantId: string; studentId: string }): Promise<ExamResultDTO[]> {
    await this.repo.assertStudentInTenant(input.tenantId, input.studentId);
    await studentAccess.assertCanView(input.requester, input.studentId, PERMISSIONS.SCHOOL_EXAMS_VIEW);
    return this.repo.resultsForStudent(input.studentId);
  }

  private fanOutResultsPublished(tenantId: string, examId: string, count: number): void {
    enqueue('exam.resultsPublished', { tenantId, examId, count });
  }

  private computeGrade(marks: number, maxMarks: number): string {
    const pct = maxMarks > 0 ? (marks / maxMarks) * 100 : 0;
    if (pct >= 90) return 'A';
    if (pct >= 75) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
  }

  private toDTO(row: ExamRow): ExamDTO {
    return {
      id: row.id,
      organisation_id: row.organisation_id,
      name: row.name,
      exam_type: row.exam_type as ExamType,
      start_date: row.start_date,
      end_date: row.end_date,
      max_marks: row.max_marks,
      status: row.status as ExamStatus,
      created_at: row.created_at,
    };
  }
}

export const examService = new ExamService(new ExamRepository());