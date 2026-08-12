import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { announcementsService } from './announcements.service';
import type { CreateAnnouncementInput, UpdateAnnouncementInput } from '@prasynx/types';

const tenantOf = (req: Request): string => req.user?.tenantId ?? '';
const actorId = (req: Request): string | undefined => req.user?.userId;

export class AnnouncementsController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const announcements = await announcementsService.list(tenantOf(req));
    res.status(200).json({ announcements });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing announcement id');
    const announcement = await announcementsService.get(tenantOf(req), params.id);
    res.status(200).json({ announcement });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as CreateAnnouncementInput;
    if (!body) throw new BadRequestError('Invalid request body');
    const announcement = await announcementsService.create(tenantOf(req), body, actorId(req));
    res.status(201).json({ announcement });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    const body = req.validated?.body as UpdateAnnouncementInput;
    if (!params?.id || !body) throw new BadRequestError('Missing announcement id or body');
    const announcement = await announcementsService.update(tenantOf(req), params.id, body);
    res.status(200).json({ announcement });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing announcement id');
    await announcementsService.remove(tenantOf(req), params.id);
    res.status(204).send();
  });
}

export const announcementsController = new AnnouncementsController();