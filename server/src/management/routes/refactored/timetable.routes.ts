import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { timetableController } from '../../controllers/timetable.controller';

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
router.use(authorize('management', 'admin', 'principal', 'teacher', 'staff'));

router.get('/dashboard/:organisation_id', asyncHandler((req, res) => timetableController.getDashboard(req, res)));

router.get('/entries/:organisation_id', asyncHandler((req, res) => timetableController.getEntries(req, res)));
router.get('/entries/:organisation_id/:entry_id', asyncHandler((req, res) => timetableController.getEntryById(req, res)));
router.post('/entries/:organisation_id', asyncHandler((req, res) => timetableController.createEntry(req, res)));
router.put('/entries/:entry_id', asyncHandler((req, res) => timetableController.updateEntry(req, res)));
router.delete('/entries/:entry_id', asyncHandler((req, res) => timetableController.deleteEntry(req, res)));
router.post('/entries/:organisation_id/bulk', asyncHandler((req, res) => timetableController.bulkCreate(req, res)));

router.get('/teachers/:organisation_id', asyncHandler((req, res) => timetableController.getTeachersList(req, res)));
router.get('/classes/:organisation_id', asyncHandler((req, res) => timetableController.getClassesList(req, res)));
router.get('/subjects/:organisation_id', asyncHandler((req, res) => timetableController.getSubjectsList(req, res)));

router.post('/swap/:organisation_id', asyncHandler((req, res) => timetableController.swapPeriods(req, res)));
router.put('/move/:entry_id', asyncHandler((req, res) => timetableController.moveEntry(req, res)));
router.put('/substitute/:entry_id', asyncHandler((req, res) => timetableController.assignSubstitute(req, res)));
router.post('/copy/:organisation_id', asyncHandler((req, res) => timetableController.copySchedule(req, res)));
router.post('/duplicate-week/:organisation_id', asyncHandler((req, res) => timetableController.duplicateWeek(req, res)));

router.get('/conflicts/detect/:organisation_id', asyncHandler((req, res) => timetableController.detectConflicts(req, res)));
router.get('/conflicts/:organisation_id', asyncHandler((req, res) => timetableController.getConflicts(req, res)));
router.put('/conflicts/:conflict_id/resolve', asyncHandler((req, res) => timetableController.resolveConflict(req, res)));

router.get('/availability/:organisation_id', asyncHandler((req, res) => timetableController.getTeacherAvailability(req, res)));
router.post('/availability/:organisation_id', asyncHandler((req, res) => timetableController.setTeacherAvailability(req, res)));

router.get('/rooms/:organisation_id', asyncHandler((req, res) => timetableController.getRoomSchedule(req, res)));
router.post('/rooms/:organisation_id', asyncHandler((req, res) => timetableController.bookRoom(req, res)));

router.get('/templates/:organisation_id', asyncHandler((req, res) => timetableController.getTemplates(req, res)));
router.post('/templates/:organisation_id', asyncHandler((req, res) => timetableController.saveTemplate(req, res)));
router.post('/templates/:organisation_id/apply', asyncHandler((req, res) => timetableController.applyTemplate(req, res)));

router.get('/calendar/:organisation_id', asyncHandler((req, res) => timetableController.getAcademicCalendar(req, res)));
router.post('/calendar/:organisation_id', asyncHandler((req, res) => timetableController.createCalendarEvent(req, res)));

router.post('/generate/:organisation_id', asyncHandler((req, res) => timetableController.generateTimetable(req, res)));

router.get('/analytics/:organisation_id', asyncHandler((req, res) => timetableController.getAnalytics(req, res)));
router.get('/suggestions/:organisation_id', asyncHandler((req, res) => timetableController.getAiSuggestions(req, res)));

export default router;
