import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { staffManagementController } from '../controllers/staff-management.controller';

/**
 * Staff Management Routes (Legacy)
 *
 * Routes for payroll, attendance integration, job postings, applications,
 * interviews, performance reviews, goals, training, and transfers.
 * GET/POST for each resource under /api/staff-management/
 */
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


router.get('/payroll/:org_id', asyncHandler((req, res) => staffManagementController.getPayroll(req, res)));
router.post('/payroll', asyncHandler((req, res) => staffManagementController.createPayrollRecord(req, res)));
router.get('/attendance-integration/:org_id', asyncHandler((req, res) => staffManagementController.getAttendanceIntegration(req, res)));
router.post('/attendance-integration', asyncHandler((req, res) => staffManagementController.createAttendanceIntegration(req, res)));
router.get('/job-postings/:org_id', asyncHandler((req, res) => staffManagementController.getJobPostings(req, res)));
router.post('/job-postings', asyncHandler((req, res) => staffManagementController.createJobPosting(req, res)));
router.get('/applications/:org_id', asyncHandler((req, res) => staffManagementController.getApplications(req, res)));
router.post('/applications', asyncHandler((req, res) => staffManagementController.createApplication(req, res)));
router.get('/interviews/:org_id', asyncHandler((req, res) => staffManagementController.getInterviews(req, res)));
router.post('/interviews', asyncHandler((req, res) => staffManagementController.createInterview(req, res)));
router.get('/performance-reviews/:org_id', asyncHandler((req, res) => staffManagementController.getPerformanceReviews(req, res)));
router.post('/performance-reviews', asyncHandler((req, res) => staffManagementController.createPerformanceReview(req, res)));
router.get('/goals/:org_id', asyncHandler((req, res) => staffManagementController.getGoals(req, res)));
router.post('/goals', asyncHandler((req, res) => staffManagementController.createGoal(req, res)));
router.get('/training/:org_id', asyncHandler((req, res) => staffManagementController.getTraining(req, res)));
router.post('/training', asyncHandler((req, res) => staffManagementController.createTraining(req, res)));
router.get('/transfers/:org_id', asyncHandler((req, res) => staffManagementController.getTransfers(req, res)));
router.post('/transfers', asyncHandler((req, res) => staffManagementController.createTransfer(req, res)));

export default router;
