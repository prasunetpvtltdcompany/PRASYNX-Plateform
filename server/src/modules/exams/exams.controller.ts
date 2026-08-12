import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { examService } from './exams.service';
import {
  createExamSchema,
  updateExamSchema,
  scheduleExamSchema,
  deleteScheduleSchema,
  recordResultsSchema,
  resultsQuerySchema,
  examQuerySchema,
} from '@prasynx/validation';
import type { Role } from '@prasynx/types';

export class ExamController {
  create = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as ReturnType<typeof createExamSchema.parse>;
    if (!body) throw new BadRequestError('Invalid request body');

    const exam = await examService.create({
      tenantId: req.user!.tenantId ?? '',
      name: body.name,
      examType: body.exam_type,
      startDate: body.start_date,
      endDate: body.end_date,
      maxMarks: body.max_marks,
    });

    res.status(201).json({ exam });
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const query = req.validated?.query as ReturnType<typeof examQuerySchema.parse>;
    if (!query) throw new BadRequestError('Invalid query');

    const exams = await examService.list({
      tenantId: req.user!.tenantId ?? '',
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
    });

    res.status(200).json({ exams });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const exam = await examService.get({ tenantId: req.user!.tenantId ?? '', examId: req.params.examId });
    res.status(200).json({ exam });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as ReturnType<typeof updateExamSchema.parse>;
    if (!body) throw new BadRequestError('Invalid request body');
    const tenantId = req.user!.tenantId ?? '';
    const examId = req.params.examId;

    const exam = await examService.update(
      { tenantId, examId, fields: { name: body.name, exam_type: body.exam_type, start_date: body.start_date, end_date: body.end_date, max_marks: body.max_marks } },
      body.status,
    );

    res.status(200).json({ exam });
  });

  schedule = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as ReturnType<typeof scheduleExamSchema.parse>;
    if (!body) throw new BadRequestError('Invalid request body');

    const schedules = await examService.schedule({
      tenantId: req.user!.tenantId ?? '',
      examId: req.params.examId,
      entries: body.entries.map((e) => ({
        class_id: e.class_id,
        subject_id: e.subject_id,
        date: e.date,
        start_time: e.start_time,
        end_time: e.end_time,
        room: e.room,
      })),
    });

    res.status(201).json({ schedules });
  });

  deleteSchedules = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as ReturnType<typeof deleteScheduleSchema.parse>;
    if (!body) throw new BadRequestError('Invalid request body');

    await examService.removeSchedules({ tenantId: req.user!.tenantId ?? '', scheduleIds: body.schedule_ids });
    res.status(200).json({ ok: true });
  });

  recordResults = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as ReturnType<typeof recordResultsSchema.parse>;
    if (!body) throw new BadRequestError('Invalid request body');

    const results = await examService.recordResults({
      tenantId: req.user!.tenantId ?? '',
      examId: body.exam_id,
      results: body.results.map((r) => ({
        student_id: r.student_id,
        subject_id: r.subject_id,
        marks_obtained: r.marks_obtained,
        max_marks: r.max_marks,
        grade: r.grade,
        remarks: r.remarks,
      })),
    });

    res.status(200).json({ results });
  });

  results = asyncHandler(async (req: Request, res: Response) => {
    const query = req.validated?.query as ReturnType<typeof resultsQuerySchema.parse>;
    if (!query) throw new BadRequestError('Invalid query');

    const requester = { role: req.user!.role as Role, userId: req.user!.userId, tenantId: req.user!.tenantId };

    let results;
    if (query.exam_id) {
      const exam = await examService.get({ tenantId: req.user!.tenantId ?? '', examId: query.exam_id });
      results = exam.results;
    } else if (query.student_id) {
      results = await examService.resultsForStudent({ requester, tenantId: req.user!.tenantId ?? '', studentId: query.student_id });
    } else {
      throw new BadRequestError('exam_id or student_id is required');
    }

    res.status(200).json({ results });
  });
}

export const examController = new ExamController();