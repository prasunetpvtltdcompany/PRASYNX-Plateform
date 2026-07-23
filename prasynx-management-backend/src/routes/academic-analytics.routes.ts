import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate, authorize } from '../middleware/auth';
import { academicAnalyticsController } from '../controllers/academic-analytics.controller';

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
router.use(authorize('management', 'admin', 'principal', 'teacher', 'staff'));

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => academicAnalyticsController.getDashboard(req, res)));
router.get('/students/:organisation_id', asyncHandler((req, res) => academicAnalyticsController.getStudentAnalytics(req, res)));
router.get('/classes/:organisation_id', asyncHandler((req, res) => academicAnalyticsController.getClassAnalytics(req, res)));
router.get('/subjects/:organisation_id', asyncHandler((req, res) => academicAnalyticsController.getSubjectAnalytics(req, res)));
router.get('/exams/:organisation_id', asyncHandler((req, res) => academicAnalyticsController.getExamAnalytics(req, res)));
router.get('/attendance/:organisation_id', asyncHandler((req, res) => academicAnalyticsController.getAttendanceAnalytics(req, res)));
router.get('/ai-insights/:organisation_id', asyncHandler((req, res) => academicAnalyticsController.getAiInsights(req, res)));
router.get('/reports/:organisation_id', asyncHandler((req, res) => academicAnalyticsController.getReports(req, res)));
router.get('/reports/:organisation_id/export', asyncHandler((req, res) => academicAnalyticsController.exportReport(req, res)));

export default router;
