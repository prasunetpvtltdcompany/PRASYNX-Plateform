import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { payrollController } from '../../controllers/payroll.controller';

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
router.use(authorize('management', 'admin', 'hr', 'accountant', 'principal'));

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => payrollController.getDashboard(req, res)));
router.get('/records/:organisation_id', asyncHandler((req, res) => payrollController.getPayrollRecords(req, res)));
router.post('/records/:organisation_id', asyncHandler((req, res) => payrollController.createPayrollRecord(req, res)));
router.put('/records/:id', asyncHandler((req, res) => payrollController.updatePayrollRecord(req, res)));
router.post('/records/:id/process', asyncHandler((req, res) => payrollController.processPayroll(req, res)));
router.post('/records/:id/mark-paid', asyncHandler((req, res) => payrollController.markPaid(req, res)));
router.get('/salary-structures/:organisation_id', asyncHandler((req, res) => payrollController.getSalaryStructures(req, res)));
router.post('/salary-structures/:organisation_id', asyncHandler((req, res) => payrollController.createSalaryStructure(req, res)));
router.put('/salary-structures/:id', asyncHandler((req, res) => payrollController.updateSalaryStructure(req, res)));
router.get('/employee-salaries/:organisation_id', asyncHandler((req, res) => payrollController.getEmployeeSalaries(req, res)));
router.get('/deductions/:organisation_id', asyncHandler((req, res) => payrollController.getDeductions(req, res)));
router.post('/deductions/:organisation_id', asyncHandler((req, res) => payrollController.createDeduction(req, res)));
router.get('/analytics/:organisation_id', asyncHandler((req, res) => payrollController.getAnalytics(req, res)));
router.get('/ai-insights/:organisation_id', asyncHandler((req, res) => payrollController.getAiInsights(req, res)));
router.get('/reports/:organisation_id', asyncHandler((req, res) => payrollController.getReports(req, res)));
router.get('/sidebar/:organisation_id', asyncHandler((req, res) => payrollController.getSidebar(req, res)));

export default router;
