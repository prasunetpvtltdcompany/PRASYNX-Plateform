import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { studentsService } from './students.service';
import type { CreateStudentInput, UpdateStudentInput } from '@prasynx/types';

const tenantOf = (req: Request): string => req.user?.tenantId ?? '';

export class StudentsController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const students = await studentsService.list(tenantOf(req));
    res.status(200).json({ students });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as CreateStudentInput;
    if (!body) throw new BadRequestError('Invalid request body');
    const student = await studentsService.create(tenantOf(req), body);
    res.status(201).json({ student });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing student id');
    const student = await studentsService.get(tenantOf(req), params.id);
    res.status(200).json({ student });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    const body = req.validated?.body as UpdateStudentInput;
    if (!params?.id || !body) throw new BadRequestError('Missing student id or update payload');
    const student = await studentsService.update(tenantOf(req), params.id, body);
    res.status(200).json({ student });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing student id');
    await studentsService.remove(tenantOf(req), params.id);
    res.status(204).send();
  });
}

export const studentsController = new StudentsController();