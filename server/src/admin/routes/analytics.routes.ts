import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { auditLog } from '../middleware/audit';
import { analyticsController } from '../controllers/analytics.controller';

const router = Router();

router.use(authenticate);
router.use(auditLog('admin_action'));

router.get('/analytics/dashboard', asyncHandler((req, res) => analyticsController.getDashboard(req, res)));
router.get('/analytics/org-growth', asyncHandler((req, res) => analyticsController.getOrgGrowth(req, res)));
router.get('/analytics/credential-trend', asyncHandler((req, res) => analyticsController.getCredentialTrend(req, res)));
router.get('/analytics/user-activity', asyncHandler((req, res) => analyticsController.getUserActivity(req, res)));
router.get('/analytics/top-organisations', asyncHandler((req, res) => analyticsController.getTopOrganisations(req, res)));
router.get('/analytics/revenue', asyncHandler((req, res) => analyticsController.getRevenue(req, res)));

router.get('/organisations', asyncHandler((req, res) => analyticsController.listOrganisations(req, res)));
router.get('/organisations/:id', asyncHandler((req, res) => analyticsController.getOrganisation(req, res)));
router.post('/organisations/:id', asyncHandler((req, res) => analyticsController.updateOrganisation(req, res)));
router.delete('/organisations/:id', asyncHandler((req, res) => analyticsController.deleteOrganisation(req, res)));

router.get('/audit-logs', asyncHandler((req, res) => analyticsController.getAuditLogs(req, res)));

router.post('/credentials/:id/revoke', asyncHandler((req, res) => analyticsController.revokeCredential(req, res)));

router.post('/bulk-create-organisations', asyncHandler((req, res) => analyticsController.bulkCreateOrganisations(req, res)));

export default router;
