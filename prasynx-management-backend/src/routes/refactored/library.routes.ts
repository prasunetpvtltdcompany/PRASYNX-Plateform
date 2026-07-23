import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { libraryController } from '../../controllers/library.controller';

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
router.use(authorize('management', 'admin', 'principal', 'librarian', 'teacher', 'staff'));

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => libraryController.getDashboard(req, res)));

router.get('/books/:organisation_id', asyncHandler((req, res) => libraryController.getBooks(req, res)));
router.get('/books/:organisation_id/:book_id', asyncHandler((req, res) => libraryController.getBookById(req, res)));
router.post('/books/:organisation_id', asyncHandler((req, res) => libraryController.createBook(req, res)));
router.put('/books/:book_id', asyncHandler((req, res) => libraryController.updateBook(req, res)));
router.delete('/books/:book_id', asyncHandler((req, res) => libraryController.deleteBook(req, res)));

router.get('/issues/:organisation_id', asyncHandler((req, res) => libraryController.getIssues(req, res)));
router.post('/issues/:organisation_id', asyncHandler((req, res) => libraryController.issueBook(req, res)));
router.put('/issues/:issue_id/return', asyncHandler((req, res) => libraryController.returnBook(req, res)));
router.put('/issues/:issue_id/renew', asyncHandler((req, res) => libraryController.renewBook(req, res)));
router.post('/issues/:issue_id/reminder', asyncHandler((req, res) => libraryController.sendReminder(req, res)));

router.get('/members/:organisation_id', asyncHandler((req, res) => libraryController.getMembers(req, res)));
router.get('/members/:organisation_id/:member_id', asyncHandler((req, res) => libraryController.getMemberById(req, res)));
router.post('/members/:organisation_id', asyncHandler((req, res) => libraryController.createMember(req, res)));
router.put('/members/:member_id', asyncHandler((req, res) => libraryController.updateMember(req, res)));
router.post('/members/:member_id/suspend', asyncHandler((req, res) => libraryController.suspendMember(req, res)));

router.get('/fines/:organisation_id', asyncHandler((req, res) => libraryController.getFines(req, res)));
router.post('/fines/:fine_id/collect', asyncHandler((req, res) => libraryController.collectFine(req, res)));
router.post('/fines/:fine_id/waive', asyncHandler((req, res) => libraryController.waiveFine(req, res)));

router.get('/reservations/:organisation_id', asyncHandler((req, res) => libraryController.getReservations(req, res)));
router.post('/reservations/:organisation_id', asyncHandler((req, res) => libraryController.createReservation(req, res)));
router.post('/reservations/:reservation_id/fulfill', asyncHandler((req, res) => libraryController.fulfillReservation(req, res)));
router.post('/reservations/:reservation_id/cancel', asyncHandler((req, res) => libraryController.cancelReservation(req, res)));

router.get('/analytics/:organisation_id', asyncHandler((req, res) => libraryController.getAnalytics(req, res)));
router.get('/ai-insights/:organisation_id', asyncHandler((req, res) => libraryController.getAiInsights(req, res)));

router.get('/inventory/:organisation_id', asyncHandler((req, res) => libraryController.getInventoryRecords(req, res)));
router.post('/inventory/:organisation_id', asyncHandler((req, res) => libraryController.createInventoryRecord(req, res)));
router.post('/inventory/:record_id/verify', asyncHandler((req, res) => libraryController.verifyInventory(req, res)));

router.get('/reports/:organisation_id', asyncHandler((req, res) => libraryController.getReports(req, res)));
router.get('/reports/:organisation_id/export', asyncHandler((req, res) => libraryController.exportReport(req, res)));

export default router;
