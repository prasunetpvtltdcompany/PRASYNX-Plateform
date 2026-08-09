import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { staffExpensesController } from '../../controllers/staff-expenses.controller';

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

router.get('/summary/:organisation_id', asyncHandler((req, res) => staffExpensesController.getSummary(req, res)));
router.get('/:organisation_id', asyncHandler((req, res) => staffExpensesController.getExpenses(req, res)));
router.post('/:organisation_id', asyncHandler((req, res) => staffExpensesController.createExpense(req, res)));
router.put('/:id', asyncHandler((req, res) => staffExpensesController.updateExpense(req, res)));
router.delete('/:id', asyncHandler((req, res) => staffExpensesController.deleteExpense(req, res)));

export default router;