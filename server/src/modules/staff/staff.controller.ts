import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { staffService } from './staff.service';
import type { CreateStaffInput } from '@prasynx/types';

const tenantOf = (req: Request): string => req.user?.tenantId ?? '';
const userIdOf = (req: Request): string => req.user?.userId ?? '';

export class StaffController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const staff = await staffService.list(tenantOf(req));
    res.status(200).json({ staff });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing staff id');
    const member = await staffService.get(tenantOf(req), params.id);
    res.status(200).json({ member });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as CreateStaffInput;
    if (!body) throw new BadRequestError('Invalid request body');
    const member = await staffService.create(tenantOf(req), body);
    res.status(201).json({ member });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    const body = req.validated?.body as { status?: string };
    if (!params?.id) throw new BadRequestError('Missing staff id');
    const member = await staffService.updateStatus(tenantOf(req), params.id, body?.status ?? 'active');
    res.status(200).json({ member });
  });

  listAttendance = asyncHandler(async (req: Request, res: Response) => {
    const attendance = await staffService.listAttendance(tenantOf(req));
    res.status(200).json({ attendance });
  });

  createAttendance = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as { staff_id: string; attendance_date: string; check_in?: string; check_out?: string; status?: string; remarks?: string };
    if (!body?.staff_id) throw new BadRequestError('Invalid request body');
    const id = await staffService.recordAttendance(tenantOf(req), body, userIdOf(req));
    res.status(201).json({ id });
  });

  listLeaves = asyncHandler(async (req: Request, res: Response) => {
    const leaves = await staffService.listLeaves(tenantOf(req));
    res.status(200).json({ leaves });
  });

  createLeave = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as { staff_id: string; leave_type?: string; from_date: string; to_date: string; reason?: string };
    if (!body?.staff_id) throw new BadRequestError('Invalid request body');
    const id = await staffService.createLeave(tenantOf(req), body);
    res.status(201).json({ id });
  });

  updateLeaveStatus = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    const body = req.validated?.body as { status: 'approved' | 'rejected'; rejection_reason?: string };
    if (!params?.id || !body) throw new BadRequestError('Missing leave id or status');
    const leave = await staffService.updateLeaveStatus(tenantOf(req), params.id, body, userIdOf(req));
    res.status(200).json({ leave });
  });

  listPayroll = asyncHandler(async (req: Request, res: Response) => {
    const payroll = await staffService.listPayroll(tenantOf(req));
    res.status(200).json({ payroll });
  });

  listPayslips = asyncHandler(async (req: Request, res: Response) => {
    const payslips = await staffService.listPayslips(tenantOf(req));
    res.status(200).json({ payslips });
  });
}

export const staffController = new StaffController();