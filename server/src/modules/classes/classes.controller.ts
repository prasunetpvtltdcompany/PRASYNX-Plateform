import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { classesService } from './classes.service';

export class ClassesController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const classes = await classesService.listWithSections(req.user!.tenantId ?? '');
    res.status(200).json({ classes });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing class id');
    const klass = await classesService.getClass(req.user!.tenantId ?? '', params.id);
    res.status(200).json({ class: klass });
  });
}

export const classesController = new ClassesController();