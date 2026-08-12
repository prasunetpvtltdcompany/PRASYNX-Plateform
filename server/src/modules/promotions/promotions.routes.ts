import { Router } from 'express';
import { authenticate, requireTenant } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { PERMISSIONS } from '@prasynx/config';
import { validate } from '../../shared/middleware/validate';
import { createPromotionSchema } from '@prasynx/validation';
import { promotionController } from './promotions.controller';

const router = Router();

router.use(authenticate, requireTenant, authorize(PERMISSIONS.SCHOOL_PROMOTIONS_MANAGE));

router.get('/', promotionController.list);
router.post('/', validate({ body: createPromotionSchema }), promotionController.create);

export default router;