import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { transportController } from '../../controllers/transport.controller';

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
router.use(authorize('management', 'admin', 'transport', 'driver', 'parent', 'student'));

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => transportController.getDashboard(req, res)));
router.get('/vehicles/:organisation_id', asyncHandler((req, res) => transportController.getVehicles(req, res)));
router.post('/vehicles/:organisation_id', asyncHandler((req, res) => transportController.createVehicle(req, res)));
router.put('/vehicles/:id', asyncHandler((req, res) => transportController.updateVehicle(req, res)));
router.delete('/vehicles/:id', asyncHandler((req, res) => transportController.deleteVehicle(req, res)));
router.get('/vehicles/:id/service-history', asyncHandler((req, res) => transportController.getServiceHistory(req, res)));
router.get('/routes/:organisation_id', asyncHandler((req, res) => transportController.getRoutes(req, res)));
router.post('/routes/:organisation_id', asyncHandler((req, res) => transportController.createRoute(req, res)));
router.put('/routes/:id', asyncHandler((req, res) => transportController.updateRoute(req, res)));
router.delete('/routes/:id', asyncHandler((req, res) => transportController.deleteRoute(req, res)));
router.post('/routes/:id/optimize', asyncHandler((req, res) => transportController.optimizeRoute(req, res)));
router.get('/assignments/:organisation_id', asyncHandler((req, res) => transportController.getAssignments(req, res)));
router.post('/assignments/:organisation_id', asyncHandler((req, res) => transportController.createAssignment(req, res)));
router.put('/assignments/:id', asyncHandler((req, res) => transportController.updateAssignment(req, res)));
router.delete('/assignments/:id', asyncHandler((req, res) => transportController.deleteAssignment(req, res)));
router.get('/drivers/:organisation_id', asyncHandler((req, res) => transportController.getDrivers(req, res)));
router.get('/expenses/:organisation_id', asyncHandler((req, res) => transportController.getExpenses(req, res)));
router.post('/expenses/:organisation_id', asyncHandler((req, res) => transportController.createExpense(req, res)));
router.put('/expenses/:id', asyncHandler((req, res) => transportController.updateExpense(req, res)));
router.get('/gps-tracking/:organisation_id', asyncHandler((req, res) => transportController.getGpsTracking(req, res)));
router.get('/analytics/:organisation_id', asyncHandler((req, res) => transportController.getAnalytics(req, res)));
router.get('/ai-insights/:organisation_id', asyncHandler((req, res) => transportController.getAiInsights(req, res)));
router.get('/reports/:organisation_id', asyncHandler((req, res) => transportController.getReports(req, res)));
router.get('/sidebar/:organisation_id', asyncHandler((req, res) => transportController.getSidebar(req, res)));

export default router;
