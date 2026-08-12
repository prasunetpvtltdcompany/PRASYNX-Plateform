import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { organisationsService } from './organisations.service';
import { registerSchoolSchema, updateOrganisationStatusSchema, updateOrganisationPortalsSchema } from '@prasynx/validation';
import type { RegisterSchoolResult } from '@prasynx/types';

export class OrganisationsController {
  /** PRASYNX (platform admin) registers a new school. */
  registerSchool = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as ReturnType<typeof registerSchoolSchema.parse>;
    if (!body) throw new BadRequestError('Invalid request body');
    const result: RegisterSchoolResult = await organisationsService.registerSchool(body);
    res.status(201).json(result);
  });

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    const body = req.validated?.body as ReturnType<typeof updateOrganisationStatusSchema.parse>;
    if (!params?.id || !body) throw new BadRequestError('Missing organisation id or status');
    const org = await organisationsService.updateStatus(params.id, body.status);
    res.status(200).json({ organisation: org });
  });

  updatePortals = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    const body = req.validated?.body as ReturnType<typeof updateOrganisationPortalsSchema.parse>;
    if (!params?.id || !body) throw new BadRequestError('Missing organisation id or portal access');
    const org = await organisationsService.updatePortals(params.id, body.portals, req.user?.userId);
    res.status(200).json({ organisation: org });
  });

  list = asyncHandler(async (_req: Request, res: Response) => {
    const organisations = await organisationsService.list();
    res.status(200).json({ organisations });
  });
}

export const organisationsController = new OrganisationsController();