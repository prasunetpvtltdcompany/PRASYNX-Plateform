import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { accountsController } from '../../controllers/accounts.controller';

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
router.use(authorize('management', 'admin', 'finance', 'accountant', 'principal', 'auditor'));

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => accountsController.getDashboard(req, res)));
router.get('/chart-of-accounts/:organisation_id', asyncHandler((req, res) => accountsController.getChartOfAccounts(req, res)));
router.post('/chart-of-accounts/:organisation_id', asyncHandler((req, res) => accountsController.createAccount(req, res)));
router.put('/chart-of-accounts/:id', asyncHandler((req, res) => accountsController.updateAccount(req, res)));
router.delete('/chart-of-accounts/:id', asyncHandler((req, res) => accountsController.deleteAccount(req, res)));
router.get('/ledgers/:organisation_id', asyncHandler((req, res) => accountsController.getLedgers(req, res)));
router.get('/journal-entries/:organisation_id', asyncHandler((req, res) => accountsController.getJournalEntries(req, res)));
router.post('/journal-entries/:organisation_id', asyncHandler((req, res) => accountsController.createJournalEntry(req, res)));
router.put('/journal-entries/:id', asyncHandler((req, res) => accountsController.updateJournalEntry(req, res)));
router.post('/journal-entries/:id/approve', asyncHandler((req, res) => accountsController.approveJournalEntry(req, res)));
router.post('/journal-entries/:id/reverse', asyncHandler((req, res) => accountsController.reverseJournalEntry(req, res)));
router.get('/transactions/:organisation_id', asyncHandler((req, res) => accountsController.getTransactions(req, res)));
router.post('/transactions/:organisation_id', asyncHandler((req, res) => accountsController.createTransaction(req, res)));
router.get('/assets/:organisation_id', asyncHandler((req, res) => accountsController.getAssets(req, res)));
router.post('/assets/:organisation_id', asyncHandler((req, res) => accountsController.createAsset(req, res)));
router.put('/assets/:id', asyncHandler((req, res) => accountsController.updateAssetValue(req, res)));
router.post('/liabilities/:organisation_id', asyncHandler((req, res) => accountsController.createLiability(req, res)));
router.get('/budgets/:organisation_id', asyncHandler((req, res) => accountsController.getBudgets(req, res)));
router.post('/budgets/:organisation_id', asyncHandler((req, res) => accountsController.createBudget(req, res)));
router.put('/budgets/:id', asyncHandler((req, res) => accountsController.updateBudget(req, res)));
router.get('/analytics/:organisation_id', asyncHandler((req, res) => accountsController.getAnalytics(req, res)));
router.get('/ai-insights/:organisation_id', asyncHandler((req, res) => accountsController.getAiInsights(req, res)));
router.get('/reports/:organisation_id', asyncHandler((req, res) => accountsController.getReports(req, res)));
router.get('/sidebar/:organisation_id', asyncHandler((req, res) => accountsController.getSidebar(req, res)));

export default router;
