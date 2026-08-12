import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { subjectsService } from './subjects.service';
import type { CreateSchoolSubjectInput, UpdateSchoolSubjectInput } from '@prasynx/types';

const tenantOf = (req: Request): string => req.user?.tenantId ?? '';

export class SubjectsController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const subjects = await subjectsService.list(tenantOf(req));
    res.status(200).json({ subjects });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing subject id');
    const subject = await subjectsService.get(tenantOf(req), params.id);
    res.status(200).json({ subject });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as CreateSchoolSubjectInput;
    if (!body) throw new BadRequestError('Invalid request body');
    const subject = await subjectsService.create(tenantOf(req), body);
    res.status(201).json({ subject });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    const body = req.validated?.body as UpdateSchoolSubjectInput;
    if (!params?.id || !body) throw new BadRequestError('Missing subject id or body');
    const subject = await subjectsService.update(tenantOf(req), params.id, body);
    res.status(200).json({ subject });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing subject id');
    await subjectsService.remove(tenantOf(req), params.id);
    res.status(204).send();
  });
}

export const subjectsController = new SubjectsController();