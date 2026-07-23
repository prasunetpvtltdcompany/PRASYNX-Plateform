import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
// Inventory Management (legacy) - Assets, Purchase Orders, Stock, and Maintenance requests
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { inventoryManagementController } from '../controllers/inventory-management.controller';

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


router.get('/assets/:org_id', asyncHandler(inventoryManagementController.getAssets));
router.post('/assets', asyncHandler(inventoryManagementController.createAsset));
router.put('/assets/:id', asyncHandler(inventoryManagementController.updateAsset));

router.get('/purchase-orders/:org_id', asyncHandler(inventoryManagementController.getPurchaseOrders));
router.post('/purchase-orders', asyncHandler(inventoryManagementController.createPurchaseOrder));
router.put('/purchase-orders/:id/status', asyncHandler(inventoryManagementController.updatePurchaseOrderStatus));

router.get('/stock/:org_id', asyncHandler(inventoryManagementController.getStock));
router.post('/stock', asyncHandler(inventoryManagementController.createStock));
router.put('/stock/:id', asyncHandler(inventoryManagementController.updateStock));

router.get('/maintenance/:org_id', asyncHandler(inventoryManagementController.getMaintenanceRequests));
router.post('/maintenance', asyncHandler(inventoryManagementController.createMaintenanceRequest));
router.put('/maintenance/:id/status', asyncHandler(inventoryManagementController.updateMaintenanceRequestStatus));

export default router;
