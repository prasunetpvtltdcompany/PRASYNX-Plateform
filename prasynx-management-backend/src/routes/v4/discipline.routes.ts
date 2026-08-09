import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { disciplineController } from '../../controllers/discipline.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('management', 'admin', 'principal'));

router.get('/list/:org_id', asyncHandler((req, res) => disciplineController.list(req, res)));
router.get('/dashboard/:org_id', asyncHandler((req, res) => disciplineController.dashboard(req, res)));
router.get('/:org_id/:id', asyncHandler((req, res) => disciplineController.getById(req, res)));
router.post('/create/:org_id', asyncHandler((req, res) => disciplineController.create(req, res)));
router.post('/upload-evidence/:org_id', asyncHandler((req, res) => disciplineController.uploadEvidence(req, res)));
router.put('/update/:org_id/:id', asyncHandler((req, res) => disciplineController.update(req, res)));
router.delete('/delete/:org_id/:id', asyncHandler((req, res) => disciplineController.remove(req, res)));

export default router;
