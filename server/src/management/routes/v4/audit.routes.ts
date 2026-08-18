import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { auditController } from '../../controllers/audit.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('management', 'admin'));

router.get('/:org_id', asyncHandler((req, res) => auditController.runAll(req, res)));

export default router;
