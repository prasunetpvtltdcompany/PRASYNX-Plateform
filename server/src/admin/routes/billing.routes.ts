import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { auditLog } from '../middleware/audit';
import { billingController } from '../controllers/billing.controller';

const router = Router();

router.use(authenticate);
router.use(auditLog('admin_action'));

router.get('/billing/overview', asyncHandler((req, res) => billingController.getOverview(req, res)));
router.get('/billing/plans', asyncHandler((req, res) => billingController.getPlans(req, res)));
router.post('/billing/plans', asyncHandler((req, res) => billingController.createPlan(req, res)));
router.put('/billing/plans/:id', asyncHandler((req, res) => billingController.updatePlan(req, res)));
router.delete('/billing/plans/:id', asyncHandler((req, res) => billingController.deletePlan(req, res)));
router.get('/billing/subscriptions', asyncHandler((req, res) => billingController.getSubscriptions(req, res)));
router.put('/billing/subscriptions/:id', asyncHandler((req, res) => billingController.updateSubscription(req, res)));
router.delete('/billing/subscriptions/:id', asyncHandler((req, res) => billingController.deleteSubscription(req, res)));
router.get('/billing/invoices', asyncHandler((req, res) => billingController.getInvoices(req, res)));
router.post('/billing/invoices', asyncHandler((req, res) => billingController.createInvoice(req, res)));
router.put('/billing/invoices/:id/status', asyncHandler((req, res) => billingController.updateInvoiceStatus(req, res)));
router.delete('/billing/invoices/:id', asyncHandler((req, res) => billingController.deleteInvoice(req, res)));
router.get('/billing/transactions', asyncHandler((req, res) => billingController.getTransactions(req, res)));
router.post('/billing/transactions', asyncHandler((req, res) => billingController.recordTransaction(req, res)));
router.put('/billing/transactions/:id', asyncHandler((req, res) => billingController.updateTransaction(req, res)));
router.delete('/billing/transactions/:id', asyncHandler((req, res) => billingController.deleteTransaction(req, res)));
router.post('/billing/reconcile', asyncHandler((req, res) => billingController.reconcile(req, res)));

export default router;
