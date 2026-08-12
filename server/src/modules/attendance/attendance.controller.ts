import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { attendanceService } from './attendance.service';
import { markAttendanceSchema, bulkAttendanceSchema, attendanceQuerySchema } from '@prasynx/validation';
import type { AttendanceRecordDTO } from '@prasynx/types';

export class AttendanceController {
  mark = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as ReturnType<typeof markAttendanceSchema.parse>;
    if (!body) throw new BadRequestError('Invalid request body');

    const attendance: AttendanceRecordDTO = await attendanceService.mark({
      teacherId: req.user!.userId,
      studentId: body.student_id,
      date: body.date,
      status: body.status,
      notes: body.notes,
      tenantId: req.user!.tenantId ?? '',
    });

    res.status(201).json({ attendance });
  });

  bulk = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as ReturnType<typeof bulkAttendanceSchema.parse>;
    if (!body) throw new BadRequestError('Invalid request body');

    const attendance = await attendanceService.markBulk({
      teacherId: req.user!.userId,
      classId: body.class_id,
      date: body.date,
      records: body.records.map((r) => ({ studentId: r.student_id, status: r.status, notes: r.notes })),
      tenantId: req.user!.tenantId ?? '',
    });

    res.status(201).json({ attendance });
  });

  report = asyncHandler(async (req: Request, res: Response) => {
    const query = req.validated?.query as ReturnType<typeof attendanceQuerySchema.parse>;
    if (!query?.student_id) throw new BadRequestError('student_id is required');

    const report = await attendanceService.report({
      requester: { role: req.user!.role, userId: req.user!.userId, tenantId: req.user!.tenantId },
      studentId: query.student_id,
      from: query.date_from,
      to: query.date_to,
    });

    res.status(200).json({ report });
  });

  roster = asyncHandler(async (req: Request, res: Response) => {
    const query = req.validated?.query as { class_id: string; date?: string };
    if (!query?.class_id) throw new BadRequestError('class_id is required');
    const roster = await attendanceService.roster({
      tenantId: req.user!.tenantId ?? '',
      classId: query.class_id,
      date: query.date,
    });
    res.status(200).json({ roster });
  });

  records = asyncHandler(async (req: Request, res: Response) => {
    const query = req.validated?.query as {
      class_id?: string;
      date?: string;
      date_from?: string;
      date_to?: string;
      status?: string;
      student_id?: string;
      page?: number;
      pageSize?: number;
    };
    const records = await attendanceService.records({
      tenantId: req.user!.tenantId ?? '',
      classId: query.class_id,
      date: query.date,
      from: query.date_from,
      to: query.date_to,
      status: query.status,
      studentId: query.student_id,
      page: query.page,
      pageSize: query.pageSize,
    });
    res.status(200).json({ records });
  });

  dailySummary = asyncHandler(async (req: Request, res: Response) => {
    const query = req.validated?.query as { date?: string };
    const summary = await attendanceService.dailySummary({
      tenantId: req.user!.tenantId ?? '',
      date: query.date,
    });
    res.status(200).json({ summary });
  });
}

export const attendanceController = new AttendanceController();