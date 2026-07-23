import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { teacherPerformanceController } from '../../controllers/teacher-performance.controller';

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

router.get('/teachers/:organisation_id', asyncHandler((req, res) => teacherPerformanceController.getTeachers(req, res)));
router.get('/analyze/:organisation_id', asyncHandler((req, res) => teacherPerformanceController.analyzeAll(req, res)));
router.get('/analyze/:organisation_id/:teacher_id', asyncHandler((req, res) => teacherPerformanceController.analyzeTeacher(req, res)));

router.get('/observations/:organisation_id', asyncHandler((req, res) => teacherPerformanceController.getObservations(req, res)));
router.get('/observations/:organisation_id/:teacher_id', asyncHandler((req, res) => teacherPerformanceController.getObservations(req, res)));
router.post('/observations/:organisation_id', asyncHandler((req, res) => teacherPerformanceController.createObservation(req, res)));

router.get('/feedback/:organisation_id', asyncHandler((req, res) => teacherPerformanceController.getFeedbackSummary(req, res)));
router.get('/feedback/:organisation_id/:teacher_id', asyncHandler((req, res) => teacherPerformanceController.getFeedbackSummary(req, res)));
router.post('/feedback/:organisation_id', asyncHandler((req, res) => teacherPerformanceController.submitFeedback(req, res)));

router.get('/retention/:organisation_id', asyncHandler((req, res) => teacherPerformanceController.predictAllRetention(req, res)));
router.get('/retention/:organisation_id/:teacher_id', asyncHandler((req, res) => teacherPerformanceController.predictRetention(req, res)));

router.get('/reviews/:organisation_id', asyncHandler((req, res) => teacherPerformanceController.getPerformanceReviews(req, res)));
router.get('/reviews/:organisation_id/:teacher_id', asyncHandler((req, res) => teacherPerformanceController.getPerformanceReviews(req, res)));
router.post('/reviews/:organisation_id', asyncHandler((req, res) => teacherPerformanceController.createPerformanceReview(req, res)));

router.get('/insights/:organisation_id', asyncHandler((req, res) => teacherPerformanceController.getInsights(req, res)));

export default router;
