import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { globalCommandCenterController } from '../controllers/global-command-center.controller';
import { impersonateStartSchema } from '../validators/global-command-center.validator';

const router = Router();

router.use(authenticate);

// Overview
router.get('/gcc/overview', asyncHandler((req, res) => globalCommandCenterController.getOverview(req, res)));

// Organisations
router.get('/gcc/organisations', asyncHandler((req, res) => globalCommandCenterController.listOrganisations(req, res)));
router.get('/gcc/organisations/:id', asyncHandler((req, res) => globalCommandCenterController.getOrganisation(req, res)));

// Portal users
router.get('/gcc/organisations/:orgId/students', asyncHandler((req, res) => globalCommandCenterController.getStudents(req, res)));
router.get('/gcc/organisations/:orgId/staff', asyncHandler((req, res) => globalCommandCenterController.getStaff(req, res)));
router.get('/gcc/organisations/:orgId/parents', asyncHandler((req, res) => globalCommandCenterController.getParents(req, res)));
router.get('/gcc/organisations/:orgId/admins', asyncHandler((req, res) => globalCommandCenterController.getOrgAdmins(req, res)));
router.get('/gcc/organisations/:orgId/security-logs', asyncHandler((req, res) => globalCommandCenterController.getOrgSecurityLogs(req, res)));
router.get('/gcc/organisations/:orgId/audit-logs', asyncHandler((req, res) => globalCommandCenterController.getOrgAuditLogs(req, res)));

// Global search
router.get('/gcc/search', asyncHandler((req, res) => globalCommandCenterController.globalSearch(req, res)));

// Impersonation
router.post('/gcc/impersonate/start', validateBody(impersonateStartSchema), asyncHandler((req, res) => globalCommandCenterController.startImpersonation(req, res)));
router.post('/gcc/impersonate/:sessionId/stop', asyncHandler((req, res) => globalCommandCenterController.stopImpersonation(req, res)));
router.get('/gcc/impersonate/sessions', asyncHandler((req, res) => globalCommandCenterController.getImpersonationSessions(req, res)));

// Monitoring
router.get('/gcc/monitoring', asyncHandler((req, res) => globalCommandCenterController.getMonitoring(req, res)));

// Audit logs
router.get('/gcc/audit-logs', asyncHandler((req, res) => globalCommandCenterController.getAuditLogs(req, res)));

// RBAC
router.get('/gcc/rbac', asyncHandler((req, res) => globalCommandCenterController.getRBAC(req, res)));

// Compliance
router.get('/gcc/compliance', asyncHandler((req, res) => globalCommandCenterController.getCompliance(req, res)));

// Portal stats
router.get('/gcc/portal-stats', asyncHandler((req, res) => globalCommandCenterController.getPortalStats(req, res)));
router.get('/gcc/portal-users', asyncHandler((req, res) => globalCommandCenterController.getPortalUsers(req, res)));

export default router;
