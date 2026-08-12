import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { assignmentService } from './assignments.service';
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  submitAssignmentSchema,
  gradeSubmissionSchema,
  assignmentQuerySchema,
} from '@prasynx/validation';
import type { Role } from '@prasynx/types';

export class AssignmentController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as ReturnType<typeof createAssignmentSchema.parse>;
    if (!body) throw new BadRequestError('Invalid request body');
    const user = req.user!;

    const assignment = await assignmentService.create({
      tenantId: user.tenantId ?? '',
      teacherUserId: user.userId,
      role: user.role as Role,
      title: body.title,
      description: body.description,
      subjectId: body.subject_id,
      classId: body.class_id,
      dueDate: body.due_date,
      maxScore: body.max_score,
      fileUrl: body.file_url,
    });

    res.status(201).json({ assignment });
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const query = req.validated?.query as ReturnType<typeof assignmentQuerySchema.parse>;
    if (!query) throw new BadRequestError('Invalid query');
    const user = req.user!;

    const assignments = await assignmentService.list({
      tenantId: user.tenantId ?? '',
      classId: query.class_id,
      subjectId: query.subject_id,
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
      role: user.role as Role,
      userId: user.userId,
    });

    res.status(200).json({ assignments });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const assignment = await assignmentService.get({
      tenantId: req.user!.tenantId ?? '',
      assignmentId: req.params.assignmentId,
      role: req.user!.role as Role,
      userId: req.user!.userId,
    });
    res.status(200).json({ assignment });
  });

  submit = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as ReturnType<typeof submitAssignmentSchema.parse>;
    if (!body) throw new BadRequestError('Invalid request body');

    const submission = await assignmentService.submit({
      requester: { role: req.user!.role as Role, userId: req.user!.userId, tenantId: req.user!.tenantId },
      tenantId: req.user!.tenantId ?? '',
      assignmentId: req.params.assignmentId,
      studentId: body.student_id,
      submissionText: body.submission_text,
      fileUrl: body.file_url,
    });

    res.status(201).json({ submission });
  });

  grade = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as ReturnType<typeof gradeSubmissionSchema.parse>;
    if (!body) throw new BadRequestError('Invalid request body');

    await assignmentService.grade({
      tenantId: req.user!.tenantId ?? '',
      assignmentId: req.params.assignmentId,
      studentId: body.student_id,
      grade: body.grade,
      feedback: body.feedback,
    });

    res.status(200).json({ ok: true });
  });

  studentView = asyncHandler(async (req: Request, res: Response) => {
    const query = req.validated?.query as ReturnType<typeof assignmentQuerySchema.parse>;
    const studentId = (query as { student_id?: string } | undefined)?.student_id;
    if (!studentId) throw new BadRequestError('student_id is required');

    const assignments = await assignmentService.studentAssignments({
      requester: { role: req.user!.role as Role, userId: req.user!.userId, tenantId: req.user!.tenantId },
      tenantId: req.user!.tenantId ?? '',
      studentId,
    });

    res.status(200).json({ assignments });
  });
}

export const assignmentController = new AssignmentController();

// schema types are exercised by the routes layer
void updateAssignmentSchema;