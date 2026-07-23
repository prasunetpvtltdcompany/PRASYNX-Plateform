import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
// Transport Management (legacy) routes — routes, vehicles, allocations, expenses
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { transportManagementController } from '../controllers/transport-management.controller';

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


router.get('/routes/:org_id', asyncHandler(transportManagementController.getRoutes));
router.post('/routes', asyncHandler(transportManagementController.createRoute));
router.put('/routes/:id', asyncHandler(transportManagementController.updateRoute));
router.delete('/routes/:id', asyncHandler(transportManagementController.deleteRoute));

router.get('/vehicles/:org_id', asyncHandler(transportManagementController.getVehicles));
router.post('/vehicles', asyncHandler(transportManagementController.createVehicle));
router.put('/vehicles/:id', asyncHandler(transportManagementController.updateVehicle));
router.delete('/vehicles/:id', asyncHandler(transportManagementController.deleteVehicle));

router.get('/allocations/:org_id', asyncHandler(transportManagementController.getAllocations));
router.post('/allocations', asyncHandler(transportManagementController.createAllocation));
router.delete('/allocations/:id', asyncHandler(transportManagementController.deleteAllocation));

router.get('/expenses/:org_id', asyncHandler(transportManagementController.getExpenses));
router.post('/expenses', asyncHandler(transportManagementController.createExpense));

export default router;
