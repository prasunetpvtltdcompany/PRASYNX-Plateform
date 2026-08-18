import { verifyManagementAuth, enforceOrgAccess } from "../middleware/verifyAuth";
// Hostel Management (legacy) — rooms & allocations CRUD with direct supabase queries
import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { hostelManagementController } from '../controllers/hostel-management.controller';

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


// ==================== ROOMS ====================
router.get('/rooms/:org_id', asyncHandler(hostelManagementController.getRooms));
router.post('/rooms', asyncHandler(hostelManagementController.createRoom));
router.put('/rooms/:id', asyncHandler(hostelManagementController.updateRoom));
router.delete('/rooms/:id', asyncHandler(hostelManagementController.deleteRoom));

// ==================== ALLOCATIONS ====================
router.get('/allocations/:org_id', asyncHandler(hostelManagementController.getAllocations));
router.post('/allocations', asyncHandler(hostelManagementController.createAllocation));
router.put('/allocations/:id', asyncHandler(hostelManagementController.updateAllocation));
router.delete('/allocations/:id', asyncHandler(hostelManagementController.deleteAllocation));

export default router;
