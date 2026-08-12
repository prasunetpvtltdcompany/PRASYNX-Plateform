import { Router } from 'express';
import { z } from 'zod';
import { moduleConfigKeySchema, moduleConfigUpdateSchema } from '@prasynx/validation';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { userLimiter } from '../../shared/middleware/rateLimit';
import { audit } from '../../shared/middleware/audit';
import { PERMISSIONS } from '@prasynx/config';
import { managementController } from './management.controller';

const router = Router();

router.use(authenticate, requireTenant, audit);

router.get(
  '/dashboard',
  authorize(PERMISSIONS.SCHOOL_MANAGE),
  userLimiter(60_000, 60, 'Too many dashboard requests, slow down.'),
  managementController.dashboard,
);

router.get('/modules', authorize(PERMISSIONS.SCHOOL_MANAGE), managementController.listModules);

router.get(
  '/modules/:module_key',
  authorize(PERMISSIONS.SCHOOL_MANAGE),
  validate({ params: z.object({ module_key: moduleConfigKeySchema }) }),
  managementController.getModule,
);

router.put(
  '/modules/:module_key',
  authorize(PERMISSIONS.SCHOOL_MANAGE),
  userLimiter(60_000, 30, 'Too many module updates, slow down.'),
  validate({ params: z.object({ module_key: moduleConfigKeySchema }), body: moduleConfigUpdateSchema }),
  managementController.updateModule,
);

router.delete(
  '/modules/:module_key',
  authorize(PERMISSIONS.SCHOOL_MANAGE),
  validate({ params: z.object({ module_key: moduleConfigKeySchema }) }),
  managementController.deleteModule,
);

export default router;
