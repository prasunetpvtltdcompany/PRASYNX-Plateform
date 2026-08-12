import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { admissionsService } from './admissions.service';
import type { AdmissionStatus, CreateAdmissionInput } from '@prasynx/types';

const tenantOf = (req: Request): string => req.user?.tenantId ?? '';

export class AdmissionsController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const forms = await admissionsService.list(tenantOf(req));
    res.status(200).json({ admissions: forms });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing admission id');
    const form = await admissionsService.get(tenantOf(req), params.id);
    res.status(200).json({ admission: form });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as CreateAdmissionInput;
    if (!body) throw new BadRequestError('Invalid request body');
    const form = await admissionsService.create(tenantOf(req), body);
    res.status(201).json({ admission: form });
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    const body = req.validated?.body as { status: AdmissionStatus };
    if (!params?.id || !body) throw new BadRequestError('Missing admission id or status');
    const form = await admissionsService.updateStatus(tenantOf(req), params.id, body.status);
    res.status(200).json({ admission: form });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing admission id');
    await admissionsService.remove(tenantOf(req), params.id);
    res.status(204).send();
  });
}

export const admissionsController = new AdmissionsController();