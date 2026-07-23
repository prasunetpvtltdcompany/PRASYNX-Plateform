import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { biometricsController } from '../../controllers/biometrics.controller';

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

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => biometricsController.getDashboard(req, res)));

router.get('/devices/:organisation_id', asyncHandler((req, res) => biometricsController.getDevices(req, res)));
router.post('/devices/:organisation_id', asyncHandler((req, res) => biometricsController.createDevice(req, res)));
router.put('/devices/:device_id', asyncHandler((req, res) => biometricsController.updateDevice(req, res)));
router.delete('/devices/:device_id', asyncHandler((req, res) => biometricsController.deleteDevice(req, res)));

router.get('/templates/:organisation_id', asyncHandler((req, res) => biometricsController.getTemplates(req, res)));
router.get('/templates/:organisation_id/user/:user_id', asyncHandler((req, res) => biometricsController.getTemplates(req, res)));
router.post('/templates/:organisation_id', asyncHandler((req, res) => biometricsController.enrollTemplate(req, res)));
router.put('/templates/:template_id', asyncHandler((req, res) => biometricsController.updateTemplate(req, res)));
router.delete('/templates/:template_id', asyncHandler((req, res) => biometricsController.deleteTemplate(req, res)));

router.get('/attendance/:organisation_id', asyncHandler((req, res) => biometricsController.getAttendanceLogs(req, res)));
router.post('/attendance/:organisation_id', asyncHandler((req, res) => biometricsController.recordAttendance(req, res)));

router.get('/assignments/:organisation_id', asyncHandler((req, res) => biometricsController.getAssignments(req, res)));
router.get('/assignments/:organisation_id/device/:device_id', asyncHandler((req, res) => biometricsController.getAssignments(req, res)));
router.post('/assignments/:organisation_id', asyncHandler((req, res) => biometricsController.createAssignment(req, res)));
router.delete('/assignments/:assignment_id', asyncHandler((req, res) => biometricsController.deleteAssignment(req, res)));

export default router;
