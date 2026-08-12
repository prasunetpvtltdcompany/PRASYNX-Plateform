import { AssignmentRepository } from './assignments.repository';
import { BadRequestError, ForbiddenError } from '../../shared/errors/errors';
import { enqueue } from '../../infrastructure/jobs/queue';
import { studentAccess, type Requester } from '../../shared/access/studentAccess';
import { PERMISSIONS } from '@prasynx/config';
import type { AssignmentDetailDTO, AssignmentDTO, AssignmentRow, Paginated, Role } from '@prasynx/types';

export class AssignmentService {
  constructor(private repo: AssignmentRepository) {}

  async create(
    input: {
      tenantId: string;
      teacherUserId: string;
      role: Role;
      title: string;
      description?: string | null;
      subjectId?: string | null;
      classId: string;
      dueDate: string;
      maxScore: number;
      fileUrl?: string | null;
    },
    teacherId?: string,
  ): Promise<AssignmentDTO> {
    await this.repo.assertClassInTenant(input.tenantId, input.classId);
    await this.repo.assertSubjectInTenant(input.tenantId, input.subjectId);

    // Management may create assignments without a teacher binding; teachers must be bound to self.
    const boundTeacherId = teacherId ?? (await this.resolveTeacher(input.teacherUserId, input.role));
    if (input.role === 'teacher' && !boundTeacherId) throw new ForbiddenError('No teacher record is linked to this account');

    const row = await this.repo.createAssignment({
      organisation_id: input.tenantId,
      teacher_id: boundTeacherId,
      subject_id: input.subjectId,
      class_id: input.classId,
      title: input.title,
      description: input.description,
      due_date: input.dueDate,
      max_score: input.maxScore,
      file_url: input.fileUrl,
    });
    return this.toDTO(row);
  }

  async list(input: {
    tenantId: string;
    classId?: string;
    subjectId?: string;
    status?: AssignmentRow['status'];
    page: number;
    pageSize: number;
    role: Role;
    userId: string;
  }): Promise<Paginated<AssignmentDTO>> {
    // Teachers only see assignments for classes they teach.
    if (input.role === 'teacher') {
      const classIds = await this.repo.teacherClassIds(input.userId);
      if (!classIds.length) return { data: [], total: 0, page: input.page, pageSize: input.pageSize, totalPages: 0 };
      if (input.classId && !classIds.includes(input.classId)) throw new ForbiddenError('You can only view assignments for classes you teach');
      if (!input.classId && classIds.length === 1) input = { ...input, classId: classIds[0] };
    }
    const rows = await this.repo.listAssignments({
      tenantId: input.tenantId,
      classId: input.classId,
      subjectId: input.subjectId,
      status: input.status,
      page: input.page,
      pageSize: input.pageSize,
    });
    return { ...rows };
  }

  async get(input: { tenantId: string; assignmentId: string; role: Role; userId: string }): Promise<AssignmentDetailDTO> {
    const assignment = await this.repo.getAssignment(input.tenantId, input.assignmentId);
    if (input.role === 'teacher') {
      const classIds = await this.repo.teacherClassIds(input.userId);
      if (!classIds.includes(assignment.class_id)) throw new ForbiddenError('You can only view assignments for classes you teach');
    }
    return this.repo.getDetail(input.tenantId, input.assignmentId);
  }

  async submit(input: {
    requester: Requester;
    tenantId: string;
    assignmentId: string;
    studentId?: string;
    submissionText?: string | null;
    fileUrl?: string | null;
  }): Promise<AssignmentDetailDTO['submissions'][number]> {
    const isStaff = input.requester.role === 'teacher' || input.requester.role === 'management';
    const studentId = input.studentId ?? (await studentAccess.studentIdForUser(input.requester.userId));
    if (!studentId) throw new ForbiddenError('No student record is linked to this account');
    if (!isStaff) await studentAccess.assertCanView(input.requester, studentId, PERMISSIONS.SCHOOL_ASSIGNMENTS_VIEW);
    await this.repo.assertStudentInTenant(input.tenantId, studentId);
    const assignment = await this.repo.getAssignment(input.tenantId, input.assignmentId);
    if (assignment.status === 'closed') throw new BadRequestError('This assignment is closed for submissions');
    const row = await this.repo.upsertSubmission({
      assignment_id: input.assignmentId,
      student_id: studentId,
      submission_text: input.submissionText ?? null,
      file_url: input.fileUrl ?? null,
      status: 'submitted',
    });
    this.fanOutSubmitted(input.tenantId, input.assignmentId, studentId);
    return {
      id: row.id,
      assignment_id: row.assignment_id,
      student_id: row.student_id,
      submission_text: row.submission_text,
      file_url: row.file_url,
      grade: row.grade,
      feedback: row.feedback,
      status: row.status,
      submitted_at: row.submitted_at,
      student_name: null,
    };
  }

  async grade(input: { tenantId: string; assignmentId: string; studentId: string; grade: number; feedback?: string | null }): Promise<void> {
    const assignment = await this.repo.getAssignment(input.tenantId, input.assignmentId);
    await this.repo.assertStudentInTenant(input.tenantId, input.studentId);
    if (input.grade > assignment.max_score) throw new BadRequestError('Grade cannot exceed the assignment max score');
    await this.repo.gradeSubmission(input.assignmentId, input.studentId, { grade: input.grade, feedback: input.feedback, status: 'graded' });
  }

  async studentAssignments(input: { requester: Requester; tenantId: string; studentId: string }): Promise<Array<AssignmentDTO & { submission?: AssignmentDetailDTO['submissions'][number] }>> {
    await this.repo.assertStudentInTenant(input.tenantId, input.studentId);
    await studentAccess.assertCanView(input.requester, input.studentId, PERMISSIONS.SCHOOL_ASSIGNMENTS_VIEW);
    const rows = await this.repo.submissionsForStudent(input.studentId);
    return rows.map((r) => ({
      id: r.assignment.id,
      organisation_id: r.assignment.organisation_id,
      teacher_id: r.assignment.teacher_id,
      subject_id: r.assignment.subject_id,
      class_id: r.assignment.class_id,
      title: r.assignment.title,
      description: r.assignment.description,
      due_date: r.assignment.due_date,
      max_score: r.assignment.max_score,
      file_url: r.assignment.file_url,
      status: r.assignment.status,
      created_at: r.assignment.created_at,
      subject_name: null,
      submissions_count: 0,
      submission: {
        id: r.submission.id,
        assignment_id: r.submission.assignment_id,
        student_id: r.submission.student_id,
        submission_text: r.submission.submission_text,
        file_url: r.submission.file_url,
        grade: r.submission.grade,
        feedback: r.submission.feedback,
        status: r.submission.status,
        submitted_at: r.submission.submitted_at,
        student_name: null,
      },
    }));
  }

  /** Teacher gate used by the routes layer before mutate actions. */
  async teacherCanManage(tenantId: string, userId: string): Promise<boolean> {
    const teacherId = await this.resolveTeacher(userId, 'teacher');
    return Boolean(teacherId);
  }

  private async resolveTeacher(userId: string, role: Role): Promise<string | null> {
    if (role === 'teacher' || role === 'management') return this.repo.teacherForUser(userId);
    return null;
  }

  private fanOutSubmitted(tenantId: string, assignmentId: string, studentId: string): void {
    enqueue('assignment.submitted', { tenantId, assignmentId, studentId });
  }

  private toDTO(row: AssignmentRow): AssignmentDTO {
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
      subject_name: null,
      submissions_count: 0,
    };
  }
}

export const assignmentService = new AssignmentService(new AssignmentRepository());