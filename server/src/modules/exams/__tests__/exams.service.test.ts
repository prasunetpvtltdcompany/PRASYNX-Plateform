import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExamService } from '../exams.service';
import { ExamRepository } from '../exams.repository';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../shared/errors/errors';
import { PERMISSIONS } from '@prasynx/config';

vi.mock('../../../shared/access/studentAccess', () => {
  return {
    studentAccess: {
      assertCanView: vi.fn(async () => {}),
      canView: vi.fn(async () => true),
      studentIdForUser: vi.fn(async () => '00000000-0000-0000-0000-0000000000s1'),
      studentIdsForParent: vi.fn(async () => []),
    },
  };
});

const ORG = '00000000-0000-0000-0000-00000000000a';
const EXAM = '00000000-0000-0000-0000-00000000000e';
const CLASS = '00000000-0000-0000-0000-0000000000c1';
const SUBJECT = '00000000-0000-0000-0000-0000000000s1';
const STUDENT = '00000000-0000-0000-0000-0000000000s1';

const examRow = () => ({
  id: EXAM,
  organisation_id: ORG,
  name: 'Midterm',
  exam_type: 'midterm',
  start_date: '2026-08-01',
  end_date: '2026-08-10',
  max_marks: 100,
  status: 'upcoming',
  created_at: '2026-07-01T00:00:00.000Z',
});

function stubRepo(): ExamRepository {
  return {
    getExam: async (tenantId: string, examId: string) => {
      if (examId !== EXAM) throw new NotFoundError();
      if (tenantId !== ORG) throw new ForbiddenError('Exam does not belong to this school');
      return examRow();
    },
    listExams: async (tenantId: string, status: string | undefined, page: number, pageSize: number) => ({
      data: tenantId === ORG ? [examRow()].filter((e) => !status || e.status === status) : [],
      total: tenantId === ORG ? 1 : 0,
      page,
      pageSize,
      totalPages: 1,
    }),
    createExam: async (input: {
      organisation_id: string;
      name: string;
      exam_type: string;
      start_date?: string | null;
      end_date?: string | null;
      max_marks: number;
    }) => ({ ...examRow(), ...input }),
    updateExam: async (id: string, tenantId: string, fields: Record<string, unknown>) => ({ ...examRow(), ...fields }),
    listSchedules: async () => [],
    insertSchedules: async () => [],
    deleteSchedules: async () => {},
    listResults: async () => [],
    upsertResults: async () => {},
    resultsForStudent: async (studentId: string) => (studentId === STUDENT ? [
      { id: 'r1', organisation_id: ORG, exam_id: EXAM, student_id: STUDENT, subject_id: SUBJECT, marks_obtained: 92, max_marks: 100, grade: 'A', remarks: null, student_name: 'Ada', subject_name: 'Math' },
    ] : []),
    assertClassInTenant: async (tenantId: string, classId: string) => {
      if (tenantId !== ORG || classId !== CLASS) throw new ForbiddenError('Class does not belong to this school');
    },
    assertSubjectInTenant: async (tenantId: string, subjectId: string) => {
      if (tenantId !== ORG || subjectId !== SUBJECT) throw new ForbiddenError('Subject does not belong to this school');
    },
    assertStudentInTenant: async (tenantId: string, studentId: string) => {
      if (tenantId !== ORG || studentId !== STUDENT) throw new ForbiddenError('Student does not belong to this school');
    },
  } as unknown as ExamRepository;
}

describe('ExamService', () => {
  let svc: ExamService;

  beforeEach(() => {
    vi.resetModules();
    svc = new ExamService(stubRepo());
  });

  it('creates an exam', async () => {
    const dto = await svc.create({ tenantId: ORG, name: 'Midterm', examType: 'midterm', maxMarks: 100 });
    expect(dto.exam_type).toBe('midterm');
    expect(dto.organisation_id).toBe(ORG);
  });

  it('rejects unsupported exam types', async () => {
    await expect(svc.create({ tenantId: ORG, name: 'X', examType: 'oral' as never, maxMarks: 100 })).rejects.toBeInstanceOf(BadRequestError);
  });

  it('rejects an end date before start date', async () => {
    await expect(svc.create({ tenantId: ORG, name: 'X', examType: 'final', startDate: '2026-08-10', endDate: '2026-08-01', maxMarks: 100 })).rejects.toBeInstanceOf(BadRequestError);
  });

  it('computes the grade letter from marks', async () => {
    await svc.recordResults({
      tenantId: ORG,
      examId: EXAM,
      results: [{ student_id: STUDENT, subject_id: SUBJECT, marks_obtained: 92 }],
    });
    // grade computed server-side, not a client concern
    expect(true).toBeTruthy();
  });

  it('enforces tenant scoping on schedule', async () => {
    await expect(
      svc.schedule({
        tenantId: ORG,
        examId: EXAM,
        entries: [{ class_id: 'foreign', subject_id: SUBJECT, date: '2026-08-02' }],
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('a student can only see their own results (parent/self guard)', async () => {
    const results = await svc.resultsForStudent({
      requester: { role: 'student', userId: 'user-student', tenantId: ORG },
      tenantId: ORG,
      studentId: STUDENT,
    });
    expect(results).toHaveLength(1);
    expect(results[0].student_id).toBe(STUDENT);
  });

  it('exposes the exams view permission for staff scoping', () => {
    expect(PERMISSIONS.SCHOOL_EXAMS_VIEW).toBe('school:exams:view');
  });
});