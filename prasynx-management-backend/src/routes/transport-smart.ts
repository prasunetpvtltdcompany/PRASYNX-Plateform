import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
/**
 * Smart Transport Routes (Legacy)
 *
 * Handles legacy smart transport operations: RFID cards, bus tracking,
 * geofence alerts, pickup authorizations, bus routes, and driver behavior.
 */

import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { transportSmartController } from '../controllers/transport-smart.controller';

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


router.get('/rfid-cards/:org_id', asyncHandler(transportSmartController.getRfidCards));
router.post('/rfid-cards', asyncHandler(transportSmartController.createRfidCard));

router.get('/bus-tracking/:org_id', asyncHandler(transportSmartController.getBusTracking));
router.post('/bus-tracking', asyncHandler(transportSmartController.createBusTracking));

router.get('/geofence-alerts/:org_id', asyncHandler(transportSmartController.getGeofenceAlerts));
router.post('/geofence-alerts', asyncHandler(transportSmartController.createGeofenceAlert));

router.get('/pickup-authorizations/:org_id', asyncHandler(transportSmartController.getPickupAuthorizations));
router.post('/pickup-authorizations', asyncHandler(transportSmartController.createPickupAuthorization));

router.get('/bus-routes/:org_id', asyncHandler(transportSmartController.getBusRoutes));
router.post('/bus-routes', asyncHandler(transportSmartController.createBusRoute));

router.get('/driver-behavior/:org_id', asyncHandler(transportSmartController.getDriverBehavior));
router.post('/driver-behavior', asyncHandler(transportSmartController.createDriverBehavior));

export default router;
