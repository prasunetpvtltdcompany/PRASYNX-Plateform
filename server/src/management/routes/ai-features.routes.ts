import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
// AI Features routes — attendance analysis, library recommendations, assignment grading,
// predictive risk detection, study plans, and quiz generation
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { aiFeaturesController } from '../controllers/ai-features.controller';

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


// ===== ATTENDANCE AI =====
router.get('/attendance/analyze/:org_id', asyncHandler(aiFeaturesController.analyzeAttendanceByOrg));
router.get('/attendance/analyze/:org_id/:student_id', asyncHandler(aiFeaturesController.analyzeAttendanceByStudent));
router.get('/attendance/low-attendance/:org_id', asyncHandler(aiFeaturesController.detectLowAttendance));
router.get('/attendance/predict-absenteeism/:org_id', asyncHandler(aiFeaturesController.predictAbsenteeism));
router.post('/attendance/generate-alerts/:org_id', asyncHandler(aiFeaturesController.generateAttendanceAlerts));

// ===== LIBRARY AI =====
router.get('/library/recommendations/:student_id', asyncHandler(aiFeaturesController.getBookRecommendations));
router.get('/library/reading-analytics/:student_id', asyncHandler(aiFeaturesController.getReadingAnalytics));

// ===== ASSIGNMENT AI =====
router.post('/assignments/auto-grade', asyncHandler(aiFeaturesController.autoGrade));
router.post('/assignments/generate-feedback/:submission_id', asyncHandler(aiFeaturesController.generateFeedback));
router.get('/assignments/performance-insights/:student_id', asyncHandler(aiFeaturesController.getPerformanceInsights));

// ===== PREDICTIVE AI =====
router.get('/predict/at-risk/:org_id', asyncHandler(aiFeaturesController.predictAtRiskStudents));
router.get('/predict/performance-decline/:org_id', asyncHandler(aiFeaturesController.predictPerformanceDecline));
router.get('/predict/dropout-risk/:org_id', asyncHandler(aiFeaturesController.predictDropoutRisk));

// ===== STUDY PLANS & QUIZZES =====
router.post('/study-plan', asyncHandler(aiFeaturesController.generateStudyPlan));
router.post('/generate-quiz', asyncHandler(aiFeaturesController.generateQuiz));

export default router;
