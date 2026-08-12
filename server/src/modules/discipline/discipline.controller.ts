import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { disciplineService } from './discipline.service';
import type { CreateDisciplineIncidentInput, UpdateDisciplineIncidentInput } from '@prasynx/types';

const tenantOf = (req: Request): string => req.user?.tenantId ?? '';
const userIdOf = (req: Request): string => req.user?.userId ?? '';

export class DisciplineController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const incidents = await disciplineService.list(tenantOf(req));
    res.status(200).json({ incidents });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing incident id');
    const incident = await disciplineService.get(tenantOf(req), params.id);
    res.status(200).json({ incident });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as CreateDisciplineIncidentInput;
    if (!body) throw new BadRequestError('Invalid request body');
    const incident = await disciplineService.create(tenantOf(req), body, userIdOf(req));
    res.status(201).json({ incident });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    const body = req.validated?.body as UpdateDisciplineIncidentInput;
    if (!params?.id) throw new BadRequestError('Missing incident id');
    const incident = await disciplineService.update(tenantOf(req), params.id, body, userIdOf(req));
    res.status(200).json({ incident });
  });
}

export const disciplineController = new DisciplineController();