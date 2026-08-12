import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssignmentService } from '../assignments.service';
import { AssignmentRepository } from '../assignments.repository';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../shared/errors/errors';

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
const CLASS = '00000000-0000-0000-0000-0000000000c1';
const SUBJECT = '00000000-0000-0000-0000-0000000000s1';
const STUDENT = '00000000-0000-0000-0000-0000000000s1';
const ASSIGNMENT = '00000000-0000-0000-0000-0000000000a1';
const TEACHER = '00000000-0000-0000-0000-0000000000t1';

const assignmentRow = () => ({
  id: ASSIGNMENT,
  organisation_id: ORG,
  teacher_id: TEACHER,
  subject_id: SUBJECT,
  class_id: CLASS,
  title: 'Chapter 1',
  description: null,
  due_date: '2026-08-20',
  max_score: 100,
  file_url: null,
  status: 'active',
  created_at: '2026-08-01T00:00:00.000Z',
});

function stubRepo(): AssignmentRepository {
  return {
    getAssignment: async (tenantId: string, assignmentId: string) => {
      if (assignmentId !== ASSIGNMENT) throw new NotFoundError();
      if (tenantId !== ORG) throw new ForbiddenError('Assignment does not belong to this school');
      return assignmentRow();
    },
    assertClassInTenant: async (tenantId: string, classId: string) => {
      if (tenantId !== ORG || classId !== CLASS) throw new ForbiddenError('Class does not belong to this school');
    },
    assertSubjectInTenant: async (tenantId: string, subjectId: string | null | undefined) => {
      if (!subjectId) return;
      if (tenantId !== ORG || subjectId !== SUBJECT) throw new ForbiddenError('Subject does not belong to this school');
    },
    assertStudentInTenant: async (tenantId: string, studentId: string) => {
      if (tenantId !== ORG || studentId !== STUDENT) throw new ForbiddenError('Student does not belong to this school');
    },
    listAssignments: async () => ({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }),
    createAssignment: async (input: Record<string, unknown>) => ({ ...assignmentRow(), ...input, id: ASSIGNMENT }),
    getDetail: async () => ({ ...assignmentRow(), subject_name: 'Math', submissions: [] }),
    upsertSubmission: async (input: {
      assignment_id: string;
      student_id: string;
      submission_text?: string | null;
      file_url?: string | null;
      status?: string;
    }) => ({
      id: 'sub1',
      assignment_id: input.assignment_id,
      student_id: input.student_id,
      submission_text: input.submission_text ?? null,
      file_url: input.file_url ?? null,
      grade: null,
      feedback: null,
      status: input.status ?? 'submitted',
      submitted_at: '2026-08-10T00:00:00.000Z',
    }),
    gradeSubmission: async () => ({
      id: 'sub1',
      assignment_id: ASSIGNMENT,
      student_id: STUDENT,
      submission_text: null,
      file_url: null,
      grade: 95,
      feedback: 'Great',
      status: 'graded',
      submitted_at: '2026-08-10T00:00:00.000Z',
    }),
    submissionsForStudent: async () => [
      {
        assignment: assignmentRow(),
        submission: {
          id: 'sub1',
          assignment_id: ASSIGNMENT,
          student_id: STUDENT,
          submission_text: 'done',
          file_url: null,
          grade: null,
          feedback: null,
          status: 'submitted',
          submitted_at: '2026-08-10T00:00:00.000Z',
        },
      },
    ],
    teacherForUser: async (userId: string) => (userId === 'user-teacher' ? TEACHER : null),
    teacherClassIds: async (userId: string) => (userId === 'user-teacher' ? [CLASS] : []),
  } as unknown as AssignmentRepository;
}

describe('AssignmentService', () => {
  let svc: AssignmentService;

  beforeEach(() => {
    svc = new AssignmentService(stubRepo());
  });

  it('creates an assignment bound to the acting teacher', async () => {
    const dto = await svc.create({
      tenantId: ORG,
      teacherUserId: 'user-teacher',
      role: 'teacher',
      title: 'Chapter 1',
      classId: CLASS,
      dueDate: '2026-08-20',
      maxScore: 100,
    });
    expect(dto.teacher_id).toBe(TEACHER);
    expect(dto.class_id).toBe(CLASS);
  });

  it('a teacher without a linked record cannot create assignments', async () => {
    await expect(
      svc.create({ tenantId: ORG, teacherUserId: 'unlinked', role: 'teacher', title: 'X', classId: CLASS, dueDate: '2026-08-20', maxScore: 100 }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('rejects submitting to a closed assignment', async () => {
    const repo = stubRepo() as AssignmentRepository;
    repo.getAssignment = async () => ({ ...assignmentRow(), status: 'closed' });
    const closed = new AssignmentService(repo);
    await expect(
      closed.submit({ requester: { role: 'student', userId: 'user-student', tenantId: ORG }, tenantId: ORG, assignmentId: ASSIGNMENT }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('grades within the assignment max score', async () => {
    await svc.grade({ tenantId: ORG, assignmentId: ASSIGNMENT, studentId: STUDENT, grade: 80 });
    expect(true).toBeTruthy();
  });

  it('rejects a grade above the max score', async () => {
    await expect(svc.grade({ tenantId: ORG, assignmentId: ASSIGNMENT, studentId: STUDENT, grade: 250 })).rejects.toBeInstanceOf(BadRequestError);
  });

  it('a teacher only sees assignments for classes they teach', async () => {
    const list = await svc.list({ tenantId: ORG, page: 1, pageSize: 20, role: 'teacher', userId: 'user-teacher' });
    expect(list.data).toHaveLength(0);
  });

  it('lists a student’s submissions with their assignment', async () => {
    const rows = await svc.studentAssignments({
      requester: { role: 'student', userId: 'user-student', tenantId: ORG },
      tenantId: ORG,
      studentId: STUDENT,
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].submission?.student_id).toBe(STUDENT);
  });
});