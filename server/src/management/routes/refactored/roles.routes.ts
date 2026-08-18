import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { rolesController } from '../../controllers/roles.controller';

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
router.use(authorize('management', 'admin', 'principal', 'staff'));

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => rolesController.getDashboard(req, res)));
router.get('/roles/:organisation_id', asyncHandler((req, res) => rolesController.getRoles(req, res)));
router.post('/roles/:organisation_id', asyncHandler((req, res) => rolesController.createRole(req, res)));
router.put('/roles/:id', asyncHandler((req, res) => rolesController.updateRole(req, res)));
router.delete('/roles/:id', asyncHandler((req, res) => rolesController.deleteRole(req, res)));
router.post('/roles/:id/permissions', asyncHandler((req, res) => rolesController.assignPermissions(req, res)));
router.get('/permissions/:organisation_id', asyncHandler((req, res) => rolesController.getPermissions(req, res)));
router.get('/users/:organisation_id', asyncHandler((req, res) => rolesController.getUsers(req, res)));
router.put('/users/:user_id/role', asyncHandler((req, res) => rolesController.updateUserRole(req, res)));
router.get('/audit-logs/:organisation_id', asyncHandler((req, res) => rolesController.getAuditLogs(req, res)));
router.get('/analytics/:organisation_id', asyncHandler((req, res) => rolesController.getAnalytics(req, res)));
router.get('/reports/:organisation_id', asyncHandler((req, res) => rolesController.getReports(req, res)));
router.get('/sidebar/:organisation_id', asyncHandler((req, res) => rolesController.getSidebar(req, res)));

export default router;
