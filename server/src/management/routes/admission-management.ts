import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { admissionManagementController } from '../controllers/admission-management.controller';

/**
 * Admission Management Routes
 *
 * Routes for admission applications, enquiries, waiting list, and reports.
 * All endpoints under /api/admission-management/
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


router.get('/applications/:org_id', asyncHandler((req, res) => admissionManagementController.getApplications(req, res)));
router.post('/applications', asyncHandler((req, res) => admissionManagementController.createApplication(req, res)));
router.put('/applications/:id/status', asyncHandler((req, res) => admissionManagementController.updateApplicationStatus(req, res)));
router.get('/enquiries/:org_id', asyncHandler((req, res) => admissionManagementController.getEnquiries(req, res)));
router.post('/enquiries', asyncHandler((req, res) => admissionManagementController.createEnquiry(req, res)));
router.put('/enquiries/:id/status', asyncHandler((req, res) => admissionManagementController.updateEnquiryStatus(req, res)));
router.get('/waiting/:org_id', asyncHandler((req, res) => admissionManagementController.getWaitingList(req, res)));
router.post('/waiting', asyncHandler((req, res) => admissionManagementController.createWaitingEntry(req, res)));
router.delete('/waiting/:id', asyncHandler((req, res) => admissionManagementController.deleteWaitingEntry(req, res)));
router.get('/reports/:org_id', asyncHandler((req, res) => admissionManagementController.getAdmissionReports(req, res)));

export default router;
