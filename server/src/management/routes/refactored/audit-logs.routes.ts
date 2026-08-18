import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { auditLogsController } from '../../controllers/audit-logs.controller';

const router = Router();


// URL param org_id/organisation_id must match JWT
router.param('organisation_id', (req, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
});
router.param('org_id', (req, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
});

router.use(authenticate);
router.use(authorize('management', 'admin', 'staff'));

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => auditLogsController.getDashboard(req, res)));

router.get('/logs/:organisation_id', asyncHandler((req, res) => auditLogsController.getLogs(req, res)));
router.get('/logs/:organisation_id/:log_id', asyncHandler((req, res) => auditLogsController.getLogById(req, res)));
router.post('/logs/:organisation_id', asyncHandler((req, res) => auditLogsController.createLog(req, res)));

router.get('/actions/:organisation_id', asyncHandler((req, res) => auditLogsController.getDistinctActions(req, res)));
router.get('/entity-types/:organisation_id', asyncHandler((req, res) => auditLogsController.getDistinctEntityTypes(req, res)));

router.get('/retention/:organisation_id', asyncHandler((req, res) => auditLogsController.getRetentionConfig(req, res)));
router.put('/retention/:organisation_id', asyncHandler((req, res) => auditLogsController.updateRetentionConfig(req, res)));

router.post('/purge/:organisation_id', asyncHandler((req, res) => auditLogsController.purgeLogs(req, res)));

export default router;
