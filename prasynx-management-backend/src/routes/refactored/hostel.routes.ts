import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { hostelController } from '../../controllers/hostel.controller';

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
router.use(authorize('management', 'admin', 'hostel', 'warden', 'student', 'parent', 'staff', 'hostel_warden'));

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => hostelController.getDashboard(req, res)));
router.get('/hostels/:organisation_id', asyncHandler((req, res) => hostelController.getHostels(req, res)));
router.post('/hostels/:organisation_id', asyncHandler((req, res) => hostelController.createHostel(req, res)));
router.put('/hostels/:id', asyncHandler((req, res) => hostelController.updateHostel(req, res)));
router.delete('/hostels/:id', asyncHandler((req, res) => hostelController.deleteHostel(req, res)));
router.get('/rooms/:organisation_id', asyncHandler((req, res) => hostelController.getRooms(req, res)));
router.post('/rooms/:organisation_id', asyncHandler((req, res) => hostelController.createRoom(req, res)));
router.put('/rooms/:id', asyncHandler((req, res) => hostelController.updateRoom(req, res)));
router.delete('/rooms/:id', asyncHandler((req, res) => hostelController.deleteRoom(req, res)));
router.get('/allocations/:organisation_id', asyncHandler((req, res) => hostelController.getAllocations(req, res)));
router.post('/allocations/:organisation_id', asyncHandler((req, res) => hostelController.createAllocation(req, res)));
router.put('/allocations/:id', asyncHandler((req, res) => hostelController.updateAllocation(req, res)));
router.delete('/allocations/:id', asyncHandler((req, res) => hostelController.deleteAllocation(req, res)));
router.get('/wardens/:organisation_id', asyncHandler((req, res) => hostelController.getWardens(req, res)));
router.get('/attendance/:organisation_id', asyncHandler((req, res) => hostelController.getAttendance(req, res)));
router.post('/attendance/:organisation_id', asyncHandler((req, res) => hostelController.markAttendance(req, res)));
router.get('/fees/:organisation_id', asyncHandler((req, res) => hostelController.getFees(req, res)));
router.post('/fees/:id/collect', asyncHandler((req, res) => hostelController.collectFee(req, res)));
router.get('/visitors/:organisation_id', asyncHandler((req, res) => hostelController.getVisitors(req, res)));
router.post('/visitors/:id/approve', asyncHandler((req, res) => hostelController.approveVisitor(req, res)));
router.post('/visitors/:id/reject', asyncHandler((req, res) => hostelController.rejectVisitor(req, res)));
router.get('/maintenance/:organisation_id', asyncHandler((req, res) => hostelController.getMaintenance(req, res)));
router.post('/maintenance/:organisation_id', asyncHandler((req, res) => hostelController.createMaintenanceTicket(req, res)));
router.get('/analytics/:organisation_id', asyncHandler((req, res) => hostelController.getAnalytics(req, res)));
router.get('/ai-insights/:organisation_id', asyncHandler((req, res) => hostelController.getAiInsights(req, res)));
router.get('/reports/:organisation_id', asyncHandler((req, res) => hostelController.getReports(req, res)));
router.get('/sidebar/:organisation_id', asyncHandler((req, res) => hostelController.getSidebar(req, res)));

export default router;
