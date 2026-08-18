import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { analyticsController } from '../../controllers/analytics.controller';

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
router.use(authorize('management', 'admin', 'staff'));

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => analyticsController.getDashboard(req, res)));

// Aliases for calls that omit organisation id — use authenticated user's org
router.get('/dashboard', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId as any;
  return analyticsController.getDashboard(req, res);
}));

router.get('/dashboards/:organisation_id', asyncHandler((req, res) => analyticsController.getDashboards(req, res)));
router.post('/dashboards/:organisation_id', asyncHandler((req, res) => analyticsController.createDashboard(req, res)));
router.put('/dashboards/:dashboard_id', asyncHandler((req, res) => analyticsController.updateDashboard(req, res)));
router.delete('/dashboards/:dashboard_id', asyncHandler((req, res) => analyticsController.deleteDashboard(req, res)));

router.get('/dashboards/:dashboard_id/widgets', asyncHandler((req, res) => analyticsController.getWidgets(req, res)));
router.post('/widgets/:organisation_id', asyncHandler((req, res) => analyticsController.createWidget(req, res)));

router.post('/widgets', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId as any;
  return analyticsController.createWidget(req, res);
}));
router.put('/widgets/:widget_id', asyncHandler((req, res) => analyticsController.updateWidget(req, res)));
router.delete('/widgets/:widget_id', asyncHandler((req, res) => analyticsController.deleteWidget(req, res)));

router.get('/reports/:organisation_id', asyncHandler((req, res) => analyticsController.getReports(req, res)));
router.post('/reports/:organisation_id', asyncHandler((req, res) => analyticsController.createReport(req, res)));
router.put('/reports/:report_id', asyncHandler((req, res) => analyticsController.updateReport(req, res)));
router.delete('/reports/:report_id', asyncHandler((req, res) => analyticsController.deleteReport(req, res)));
router.post('/reports/:report_id/execute', asyncHandler((req, res) => analyticsController.executeReport(req, res)));

router.get('/data-sources/:organisation_id', asyncHandler((req, res) => analyticsController.getDataSources(req, res)));
router.post('/data-sources/:organisation_id', asyncHandler((req, res) => analyticsController.createDataSource(req, res)));
router.put('/data-sources/:source_id', asyncHandler((req, res) => analyticsController.updateDataSource(req, res)));
router.delete('/data-sources/:source_id', asyncHandler((req, res) => analyticsController.deleteDataSource(req, res)));
router.post('/data-sources/:source_id/test', asyncHandler((req, res) => analyticsController.testDataSource(req, res)));

// Aliases without organisation param
router.get('/dashboards', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId as any;
  return analyticsController.getDashboards(req, res);
}));

router.post('/dashboards', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId as any;
  return analyticsController.createDashboard(req, res);
}));

router.get('/reports', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId as any;
  return analyticsController.getReports(req, res);
}));

router.post('/reports', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId as any;
  return analyticsController.createReport(req, res);
}));

router.get('/data-sources', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId as any;
  return analyticsController.getDataSources(req, res);
}));

router.post('/data-sources', asyncHandler((req, res) => {
  req.params.organisation_id = req.user?.organisationId as any;
  return analyticsController.createDataSource(req, res);
}));

export default router;
