import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { scholarshipController } from '../../controllers/scholarship.controller';

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
router.use(authorize('management', 'admin', 'staff', 'finance'));

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => scholarshipController.getDashboard(req, res)));
router.get('/programs/:organisation_id', asyncHandler((req, res) => scholarshipController.getPrograms(req, res)));
router.post('/programs/:organisation_id', asyncHandler((req, res) => scholarshipController.createProgram(req, res)));
router.put('/programs/:id', asyncHandler((req, res) => scholarshipController.updateProgram(req, res)));
router.delete('/programs/:id', asyncHandler((req, res) => scholarshipController.deleteProgram(req, res)));
router.get('/applications/:organisation_id', asyncHandler((req, res) => scholarshipController.getApplications(req, res)));
router.post('/applications/:organisation_id', asyncHandler((req, res) => scholarshipController.createApplication(req, res)));
router.put('/applications/:id/status', asyncHandler((req, res) => scholarshipController.updateApplicationStatus(req, res)));
router.get('/beneficiaries/:organisation_id', asyncHandler((req, res) => scholarshipController.getBeneficiaries(req, res)));
router.get('/ai-eligibility/:organisation_id', asyncHandler((req, res) => scholarshipController.getAiEligibility(req, res)));
router.get('/analytics/:organisation_id', asyncHandler((req, res) => scholarshipController.getFinancialAidAnalytics(req, res)));
router.get('/reports/:organisation_id', asyncHandler((req, res) => scholarshipController.getReports(req, res)));
router.get('/sidebar/:organisation_id', asyncHandler((req, res) => scholarshipController.getSidebar(req, res)));

export default router;
