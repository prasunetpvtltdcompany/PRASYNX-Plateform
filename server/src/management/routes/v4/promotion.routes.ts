import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { promotionController } from '../../controllers/promotion.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('management', 'admin', 'principal'));

router.get('/history/:org_id', asyncHandler((req, res) => promotionController.getHistory(req, res)));
router.post('/promote/:org_id', asyncHandler((req, res) => promotionController.promoteStudents(req, res)));
router.get('/report/:org_id', asyncHandler((req, res) => promotionController.getPromotionReport(req, res)));

export default router;
