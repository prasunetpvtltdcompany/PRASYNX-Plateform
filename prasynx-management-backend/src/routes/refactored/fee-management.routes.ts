import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { feeManagementController } from '../../controllers/fee-management.controller';

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

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => feeManagementController.getDashboard(req, res)));
router.get('/structures/:organisation_id', asyncHandler((req, res) => feeManagementController.getFeeStructures(req, res)));
router.post('/structures/:organisation_id', asyncHandler((req, res) => feeManagementController.createFeeStructure(req, res)));
router.put('/structures/:id', asyncHandler((req, res) => feeManagementController.updateFeeStructure(req, res)));
router.delete('/structures/:id', asyncHandler((req, res) => feeManagementController.deleteFeeStructure(req, res)));
router.get('/student-fees/:organisation_id', asyncHandler((req, res) => feeManagementController.getStudentFees(req, res)));
router.post('/payments/:organisation_id', asyncHandler((req, res) => feeManagementController.collectPayment(req, res)));
router.get('/transactions/:organisation_id', asyncHandler((req, res) => feeManagementController.getTransactions(req, res)));
router.get('/invoices/:organisation_id', asyncHandler((req, res) => feeManagementController.getInvoices(req, res)));
router.post('/invoices/:organisation_id', asyncHandler((req, res) => feeManagementController.createInvoice(req, res)));
router.get('/scholarships/:organisation_id', asyncHandler((req, res) => feeManagementController.getScholarships(req, res)));
router.post('/scholarships/:id/approve', asyncHandler((req, res) => feeManagementController.approveScholarship(req, res)));
router.get('/analytics/:organisation_id', asyncHandler((req, res) => feeManagementController.getFinancialAnalytics(req, res)));
router.get('/ai-insights/:organisation_id', asyncHandler((req, res) => feeManagementController.getAiInsights(req, res)));
router.get('/reports/:organisation_id', asyncHandler((req, res) => feeManagementController.getReports(req, res)));
router.get('/sidebar/:organisation_id', asyncHandler((req, res) => feeManagementController.getSidebar(req, res)));

export default router;
