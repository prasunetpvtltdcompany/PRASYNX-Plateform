import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { hostelService } from './hostel.service';
import type { CreateHostelRoomInput } from '@prasynx/types';

const tenantOf = (req: Request): string => req.user?.tenantId ?? '';

export class HostelController {
  rooms = asyncHandler(async (req: Request, res: Response) => {
    const rooms = await hostelService.listRooms(tenantOf(req));
    res.status(200).json({ rooms });
  });

  allocations = asyncHandler(async (req: Request, res: Response) => {
    const allocations = await hostelService.listAllocations(tenantOf(req));
    res.status(200).json({ allocations });
  });

  getRoom = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing room id');
    const room = await hostelService.getRoom(tenantOf(req), params.id);
    res.status(200).json({ room });
  });

  createRoom = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as CreateHostelRoomInput;
    if (!body) throw new BadRequestError('Invalid request body');
    const room = await hostelService.createRoom(tenantOf(req), body);
    res.status(201).json({ room });
  });

  removeRoom = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing room id');
    await hostelService.removeRoom(tenantOf(req), params.id);
    res.status(204).send();
  });
}

export const hostelController = new HostelController();