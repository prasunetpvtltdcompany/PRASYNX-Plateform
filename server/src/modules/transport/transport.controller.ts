import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { transportService } from './transport.service';
import type { CreateTransportRouteInput } from '@prasynx/types';

const tenantOf = (req: Request): string => req.user?.tenantId ?? '';

export class TransportController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const routes = await transportService.list(tenantOf(req));
    res.status(200).json({ routes });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing route id');
    const route = await transportService.get(tenantOf(req), params.id);
    res.status(200).json({ route });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as CreateTransportRouteInput;
    if (!body) throw new BadRequestError('Invalid request body');
    const route = await transportService.create(tenantOf(req), body);
    res.status(201).json({ route });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing route id');
    await transportService.remove(tenantOf(req), params.id);
    res.status(204).send();
  });
}

export const transportController = new TransportController();