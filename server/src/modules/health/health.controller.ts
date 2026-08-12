import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { healthService } from './health.service';
import type { CreateHealthRecordInput } from '@prasynx/types';

const tenantOf = (req: Request): string => req.user?.tenantId ?? '';
const actorId = (req: Request): string | undefined => req.user?.userId;

export class HealthController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const records = await healthService.list(tenantOf(req));
    res.status(200).json({ records });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing record id');
    const record = await healthService.get(tenantOf(req), params.id);
    res.status(200).json({ record });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as CreateHealthRecordInput;
    if (!body) throw new BadRequestError('Invalid request body');
    const record = await healthService.create(tenantOf(req), body, actorId(req));
    res.status(201).json({ record });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing record id');
    await healthService.remove(tenantOf(req), params.id);
    res.status(204).send();
  });
}

export const healthController = new HealthController();