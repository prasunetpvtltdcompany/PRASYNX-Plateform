import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
/**
 * AI Insights (Legacy) Routes
 *
 * Handles legacy AI insight endpoints for predictions, remedial plans,
 * teacher effectiveness, and timetable optimizations.
 */
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { aiInsightsController } from '../controllers/ai-insights.controller';

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

router.use(verifyManagementAuth);
router.use(enforceOrgAccess());


router.get('/predictions/:org_id', asyncHandler(aiInsightsController.getPredictions));
router.post('/predictions', asyncHandler(aiInsightsController.createPrediction));
router.get('/remedial-plans/:org_id', asyncHandler(aiInsightsController.getRemedialPlans));
router.post('/remedial-plans', asyncHandler(aiInsightsController.createRemedialPlan));
router.put('/remedial-plans/:id/status', asyncHandler(aiInsightsController.updateRemedialPlanStatus));
router.get('/teacher-effectiveness/:org_id', asyncHandler(aiInsightsController.getTeacherEffectiveness));
router.post('/teacher-effectiveness', asyncHandler(aiInsightsController.createTeacherEffectiveness));
router.get('/timetable-optimizations/:org_id', asyncHandler(aiInsightsController.getTimetableOptimizations));
router.post('/timetable-optimizations', asyncHandler(aiInsightsController.createTimetableOptimization));

export default router;
