import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { activityService } from './activities.service';
import type { CreateClubInput, CreateEventInput, CreateSportsTeamInput } from '@prasynx/types';

const tenantOf = (req: Request): string => req.user?.tenantId ?? '';

export class ActivityController {
  overview = asyncHandler(async (req: Request, res: Response) => {
    const data = await activityService.overview(tenantOf(req));
    res.status(200).json(data);
  });

  createEvent = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as CreateEventInput;
    if (!body?.title) throw new BadRequestError('Event title is required');
    const event = await activityService.createEvent(tenantOf(req), body);
    res.status(201).json(event);
  });

  createClub = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as CreateClubInput;
    if (!body?.name) throw new BadRequestError('Club name is required');
    const club = await activityService.createClub(tenantOf(req), body);
    res.status(201).json(club);
  });

  createTeam = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as CreateSportsTeamInput;
    if (!body?.name) throw new BadRequestError('Team name is required');
    const team = await activityService.createTeam(tenantOf(req), body);
    res.status(201).json(team);
  });
}

export const activityController = new ActivityController();