import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { communicationController } from '../../controllers/communication.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('management', 'admin', 'principal'));

router.post('/notify/:org_id', asyncHandler((req, res) => communicationController.sendNotification(req, res)));
router.post('/notify-role/:org_id', asyncHandler((req, res) => communicationController.notifyRole(req, res)));
router.post('/announce/:org_id', asyncHandler((req, res) => communicationController.sendAnnouncement(req, res)));
router.get('/logs/:org_id', asyncHandler((req, res) => communicationController.getLogs(req, res)));
router.get('/stats/:org_id', asyncHandler((req, res) => communicationController.getStats(req, res)));
router.get('/pending/:org_id', asyncHandler((req, res) => communicationController.getPending(req, res)));

export default router;
