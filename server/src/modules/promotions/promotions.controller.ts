import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { promotionService } from './promotions.service';
import type { CreatePromotionInput } from '@prasynx/types';

const tenantOf = (req: Request): string => req.user?.tenantId ?? '';
const userIdOf = (req: Request): string => req.user?.userId ?? '';

export class PromotionController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const promotions = await promotionService.list(tenantOf(req));
    res.status(200).json({ promotions });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const body = req.validated?.body as CreatePromotionInput;
    if (!body) throw new BadRequestError('Invalid request body');
    const promotion = await promotionService.create(tenantOf(req), body, userIdOf(req));
    res.status(201).json({ promotion });
  });
}

export const promotionController = new PromotionController();