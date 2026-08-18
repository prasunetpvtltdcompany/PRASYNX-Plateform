import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { riskDetectionController } from '../../controllers/risk-detection.controller';

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

router.get('/analyze/:organisation_id', asyncHandler((req, res) => riskDetectionController.analyzeAllStudents(req, res)));
router.get('/analyze/:organisation_id/:student_id', asyncHandler((req, res) => riskDetectionController.analyzeStudent(req, res)));

// Aliases without organisation id — use authenticated user's organisation
router.get('/analyze', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId as any;
  return riskDetectionController.analyzeAllStudents(req, res);
}));

router.get('/alerts/:organisation_id', asyncHandler((req, res) => riskDetectionController.getAlerts(req, res)));
router.post('/alerts/:organisation_id/generate', asyncHandler((req, res) => riskDetectionController.generateAlerts(req, res)));
router.put('/alerts/:alert_id/resolve', asyncHandler((req, res) => riskDetectionController.resolveAlert(req, res)));

router.get('/thresholds/:organisation_id', asyncHandler((req, res) => riskDetectionController.getThresholds(req, res)));
router.put('/thresholds/:organisation_id/:threshold_type', asyncHandler((req, res) => riskDetectionController.updateThresholds(req, res)));

router.get('/history/:organisation_id/:student_id', asyncHandler((req, res) => riskDetectionController.getStudentHistory(req, res)));

router.get('/predictive-insights/:organisation_id', asyncHandler((req, res) => riskDetectionController.getPredictiveInsights(req, res)));

router.get('/alerts', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId as any;
  return riskDetectionController.getAlerts(req, res);
}));

router.get('/predictive-insights', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId as any;
  return riskDetectionController.getPredictiveInsights(req, res);
}));

export default router;
