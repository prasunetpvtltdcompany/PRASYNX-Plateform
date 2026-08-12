import { Router } from 'express';
import { registerSchoolSchema, updateOrganisationStatusSchema, updateOrganisationPortalsSchema } from '@prasynx/validation';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { audit } from '../../shared/middleware/audit';
import { PERMISSIONS } from '@prasynx/config';
import { organisationsController } from './organisations.controller';
import { z } from 'zod';

const router = Router();

// All routes under /api/v1/organisations require platform level access (the company).
router.use(authenticate, authorize(PERMISSIONS.PLATFORM_MANAGE_ORGANISATIONS), audit);

router.post('/register', validate({ body: registerSchoolSchema }), organisationsController.registerSchool);

router.get('/', organisationsController.list);

router.patch(
  '/:id/status',
  validate({ params: z.object({ id: z.string().uuid() }), body: updateOrganisationStatusSchema }),
  organisationsController.updateStatus,
);

router.patch(
  '/:id/portals',
  validate({ params: z.object({ id: z.string().uuid() }), body: updateOrganisationPortalsSchema }),
  organisationsController.updatePortals,
);

export default router;