import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { libraryService } from './library.service';
import type { CreateLibraryBookInput } from '@prasynx/types';

const tenantOf = (req: Request): string => req.user?.tenantId ?? '';

export class LibraryController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const books = await libraryService.list(tenantOf(req));
    res.status(200).json({ books });
  });

  get = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing book id');
    const book = await libraryService.get(tenantOf(req), params.id);
    res.status(200).json({ book });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as CreateLibraryBookInput;
    if (!body) throw new BadRequestError('Invalid request body');
    const book = await libraryService.create(tenantOf(req), body);
    res.status(201).json({ book });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { id: string };
    if (!params?.id) throw new BadRequestError('Missing book id');
    await libraryService.remove(tenantOf(req), params.id);
    res.status(204).send();
  });
}

export const libraryController = new LibraryController();