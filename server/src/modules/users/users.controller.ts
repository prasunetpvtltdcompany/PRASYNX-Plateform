import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { usersService } from './users.service';
import { createUserSchema } from '@prasynx/validation';
import type { UserDTO } from '@prasynx/types';

export class UsersController {
  me = asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.me(req.user!.userId);
    res.status(200).json({ user });
  });

  provision = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as ReturnType<typeof createUserSchema.parse>;
    if (!body) throw new BadRequestError('Invalid request body');
    const user = (await usersService.provisionUser({
      fullName: body.full_name,
      email: body.email,
      role: body.role,
      tenantId: req.user!.tenantId ?? '',
    })) as UserDTO & { temporaryPassword: string };

    res.status(201).json({
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, status: user.status },
      temporary_password: user.temporaryPassword, // revealed once
    });
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const users = await usersService.listOrganisationUsers(req.user!.tenantId ?? '', req.user!.role);
    res.status(200).json({ users });
  });
}

export const usersController = new UsersController();