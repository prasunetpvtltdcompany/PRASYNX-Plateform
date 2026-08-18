import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { predictiveAiController } from '../../controllers/predictive-ai.controller';

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
router.use(authorize('management', 'admin', 'staff', 'teacher', 'counsellor'));

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => predictiveAiController.getDashboard(req, res)));
router.get('/risk-analysis/:organisation_id', asyncHandler((req, res) => predictiveAiController.getRiskAnalysis(req, res)));
router.get('/student-predictions/:organisation_id', asyncHandler((req, res) => predictiveAiController.getStudentPredictions(req, res)));
router.get('/attendance-forecast/:organisation_id', asyncHandler((req, res) => predictiveAiController.getAttendanceForecast(req, res)));
router.get('/academic-forecast/:organisation_id', asyncHandler((req, res) => predictiveAiController.getAcademicForecast(req, res)));
router.get('/dropout-prediction/:organisation_id', asyncHandler((req, res) => predictiveAiController.getDropoutPrediction(req, res)));
router.get('/interventions/:organisation_id', asyncHandler((req, res) => predictiveAiController.getInterventions(req, res)));
router.post('/interventions/:organisation_id', asyncHandler((req, res) => predictiveAiController.createIntervention(req, res)));
router.get('/analytics/:organisation_id', asyncHandler((req, res) => predictiveAiController.getAnalytics(req, res)));
router.get('/ai-insights/:organisation_id', asyncHandler((req, res) => predictiveAiController.getAiInsights(req, res)));
router.get('/reports/:organisation_id', asyncHandler((req, res) => predictiveAiController.getReports(req, res)));
router.get('/sidebar/:organisation_id', asyncHandler((req, res) => predictiveAiController.getSidebar(req, res)));

export default router;
