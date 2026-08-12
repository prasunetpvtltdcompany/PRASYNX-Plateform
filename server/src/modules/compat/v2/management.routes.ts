import { Router } from 'express';
import { authenticate, requireTenant } from '../../../shared/middleware/authenticate';
import { authorize } from '../../../shared/middleware/authorize';
import { PERMISSIONS } from '@prasynx/config';
import { asyncHandler, BadRequestError } from '../../../shared/errors/errors';
import { managementService } from '../../management/management.service';

const router = Router();

// Keep parity with legacy: require authentication + tenant scoping
router.use(authenticate);
router.use(requireTenant);
router.use(authorize(PERMISSIONS.SCHOOL_MANAGE));

// Organization-scoped dashboard: /api/v2/management/dashboard/:organisation_id
router.get(
  '/dashboard/:organisation_id',
  asyncHandler(async (req, res) => {
    const { organisation_id } = req.params as { organisation_id?: string };
    if (!organisation_id) throw new BadRequestError('organisation_id is required');
    // Ensure token tenant matches param
    if (req.user?.tenantId && req.user.tenantId !== organisation_id) {
      return res.status(403).json({ error: 'Tenant access denied' });
    }
    const data = await managementService.dashboard(organisation_id || '');
    res.status(200).json(data);
  }),
);

// Modules list
router.get(
  '/modules',
  asyncHandler(async (req, res) => {
    const tenant = req.user?.tenantId || '';
    const modules = await managementService.listModules(tenant);
    res.status(200).json({ modules });
  }),
);

export default router;
