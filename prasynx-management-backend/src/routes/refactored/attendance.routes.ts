import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { attendanceController } from '../../controllers/attendance.controller';

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

// Read-only endpoints accessible to roles that need attendance visibility
router.get('/dashboard/:organisation_id', authorize('management','admin','principal','teacher'), asyncHandler((req, res) => attendanceController.getDashboard(req, res)));
router.get('/students/:organisation_id', authorize('management','admin','principal','teacher'), asyncHandler((req, res) => attendanceController.getStudents(req, res)));
router.get('/records/:organisation_id', authorize('management','admin','principal','teacher'), asyncHandler((req, res) => attendanceController.getRecords(req, res)));

// Write endpoints require management/admin/principal
router.post('/mark/:organisation_id', authorize('management','admin','principal','teacher'), asyncHandler((req, res) => attendanceController.markAttendance(req, res)));
router.post('/bulk/:organisation_id', authorize('management','admin','principal','teacher'), asyncHandler((req, res) => attendanceController.bulkMark(req, res)));
router.post('/import/:organisation_id', authorize('management','admin','principal'), asyncHandler((req, res) => attendanceController.importAttendance(req, res)));

router.get('/daily/:organisation_id', authorize('management','admin','principal','teacher'), asyncHandler((req, res) => attendanceController.getDailySummary(req, res)));
router.get('/history/:student_id', authorize('management','admin','principal','teacher'), asyncHandler((req, res) => attendanceController.getStudentHistory(req, res)));
router.get('/analytics/:organisation_id', authorize('management','admin','principal'), asyncHandler((req, res) => attendanceController.getAnalytics(req, res)));
router.get('/risk-flags/:organisation_id', authorize('management','admin','principal'), asyncHandler((req, res) => attendanceController.getRiskFlags(req, res)));
router.get('/ai-insights/:organisation_id', authorize('management','admin','principal'), asyncHandler((req, res) => attendanceController.getAiInsights(req, res)));

router.get('/reports/:organisation_id', authorize('management','admin','principal'), asyncHandler((req, res) => attendanceController.getReports(req, res)));
router.get('/reports/weekly/:organisation_id', authorize('management','admin','principal'), asyncHandler((req, res) => attendanceController.getWeeklyReport(req, res)));
router.get('/reports/monthly/:organisation_id', authorize('management','admin','principal'), asyncHandler((req, res) => attendanceController.getMonthlyReport(req, res)));

router.get('/settings/:organisation_id', authorize('management','admin','principal'), asyncHandler((req, res) => attendanceController.getSettings(req, res)));
router.post('/settings/:organisation_id', authorize('management','admin','principal'), asyncHandler((req, res) => attendanceController.saveSettings(req, res)));

router.get('/automation/:organisation_id', authorize('management','admin','principal'), asyncHandler((req, res) => attendanceController.getAutomationLogs(req, res)));
router.post('/automation/:organisation_id', authorize('management','admin','principal'), asyncHandler((req, res) => attendanceController.createAutomationLog(req, res)));

router.get('/notifications/:organisation_id', authorize('management','admin','principal','teacher'), asyncHandler((req, res) => attendanceController.getNotifications(req, res)));
router.post('/notifications/:organisation_id', authorize('management','admin','principal'), asyncHandler((req, res) => attendanceController.sendNotification(req, res)));

export default router;
