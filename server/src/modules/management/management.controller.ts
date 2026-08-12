import type { Request, Response } from 'express';
import { asyncHandler, BadRequestError } from '../../shared/errors/errors';
import { managementService } from './management.service';
import type { ModuleConfigDTO } from '@prasynx/types';

const tenantOf = (req: Request): string => req.user?.tenantId ?? '';

export class ManagementController {
  dashboard = asyncHandler(async (req: Request, res: Response) => {
    const data = await managementService.dashboard(tenantOf(req));
    res.status(200).json(data);
  });

  listModules = asyncHandler(async (req: Request, res: Response) => {
    const modules = await managementService.listModules(tenantOf(req));
    res.status(200).json({ modules });
  });

  getModule = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { module_key: string };
    if (!params?.module_key) throw new BadRequestError('Missing module key');
    const module = await managementService.getModule(tenantOf(req), params.module_key);
    res.status(200).json({ module });
  });

  updateModule = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { module_key: string };
    const body = req.validated?.body as { enabled?: boolean; settings?: Record<string, unknown> };
    if (!params?.module_key || !body) throw new BadRequestError('Missing module key or update payload');
    const module: ModuleConfigDTO = await managementService.updateModule(tenantOf(req), params.module_key, body);
    res.status(200).json({ module });
  });

  deleteModule = asyncHandler(async (req: Request, res: Response) => {
    const params = req.validated?.params as { module_key: string };
    if (!params?.module_key) throw new BadRequestError('Missing module key');
    await managementService.deleteModule(tenantOf(req), params.module_key);
    res.status(204).send();
  });
}

export const managementController = new ManagementController();
