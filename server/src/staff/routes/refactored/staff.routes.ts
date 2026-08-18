import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize, enforceTeacherAccess } from '../../middleware/auth';
import { dashboardController } from '../../controllers/dashboard.controller';
import { studentController } from '../../controllers/student.controller';
import { classController } from '../../controllers/class.controller';
import { timetableController } from '../../controllers/timetable.controller';
import { qrAttendanceController } from '../../controllers/qr-attendance.controller';
import { attendanceController } from '../../controllers/attendance.controller';
import { gradeController } from '../../controllers/grade.controller';
import { assignmentController } from '../../controllers/assignment.controller';
import { examController } from '../../controllers/exam.controller';
import { messageController } from '../../controllers/message.controller';
import { leaveController } from '../../controllers/leave.controller';
import { announcementController } from '../../controllers/announcement.controller';
import { adminUserController } from '../../controllers/admin-user.controller';
import { adminFeeController } from '../../controllers/admin-fee.controller';
import { librarianController } from '../../controllers/librarian.controller';
import { transportController } from '../../controllers/transport.controller';
import { hostelController } from '../../controllers/hostel.controller';
import { accountantController } from '../../controllers/accountant.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('staff', 'teacher', 'admin', 'accountant', 'librarian', 'transport_manager', 'hostel_warden'));

// URL param org_id/organisation_id must match JWT
router.param('org_id', (req: any, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
});
router.param('organisation_id', (req: any, res, next, value) => {
  if (value && value !== req.user?.organisationId) {
    return res.status(403).json({ error: 'Tenant access denied' });
  }
  next();
});

// Dashboard
router.get('/dashboard/:teacher_id', enforceTeacherAccess(), asyncHandler((req, res) => dashboardController.getDashboard(req, res)));

// Students
router.get('/students/:teacher_id', enforceTeacherAccess(), asyncHandler((req, res) => studentController.getStudents(req, res)));

// Classes
router.get('/classes/:teacher_id', enforceTeacherAccess(), asyncHandler((req, res) => classController.getClasses(req, res)));

// Timetable
router.get('/timetable/:teacher_id', enforceTeacherAccess(), asyncHandler((req, res) => timetableController.getTimetable(req, res)));

// QR Attendance
router.post('/qr-attendance/generate', asyncHandler((req, res) => qrAttendanceController.generateQR(req, res)));
router.post('/qr-attendance/scan-count', asyncHandler((req, res) => qrAttendanceController.getScanCount(req, res)));

// Attendance
router.post('/attendance', asyncHandler((req, res) => attendanceController.markAttendance(req, res)));
router.post('/attendance/bulk', asyncHandler((req, res) => attendanceController.bulkAttendance(req, res)));
router.get('/attendance/:student_id', asyncHandler((req, res) => attendanceController.getAttendance(req, res)));
router.get('/attendance-report/:student_id', asyncHandler((req, res) => attendanceController.getAttendanceReport(req, res)));

// Grades
router.post('/grades', asyncHandler((req, res) => gradeController.addGrade(req, res)));
router.get('/grades/:student_id', asyncHandler((req, res) => gradeController.getGrades(req, res)));

// Assignments
router.post('/assignments', asyncHandler((req, res) => assignmentController.createAssignment(req, res)));
router.get('/assignments/:teacher_id', asyncHandler((req, res) => assignmentController.getAssignments(req, res)));
router.get('/assignments/:assignment_id/submissions', asyncHandler((req, res) => assignmentController.getSubmissions(req, res)));
router.patch('/assignments/:submission_id/grade', asyncHandler((req, res) => assignmentController.gradeSubmission(req, res)));

// Exams
router.post('/exams', asyncHandler((req, res) => examController.createExam(req, res)));
router.post('/exam-questions', asyncHandler((req, res) => examController.addExamQuestion(req, res)));
router.get('/exams/:organisation_id', asyncHandler((req, res) => examController.getExams(req, res)));
router.patch('/exams/:id/status', asyncHandler((req, res) => examController.updateExamStatus(req, res)));
router.delete('/exam-questions/:id', asyncHandler((req, res) => examController.deleteExamQuestion(req, res)));
router.get('/exam-submissions/:exam_id', asyncHandler((req, res) => examController.getExamSubmissions(req, res)));
router.patch('/exam-submissions/:id/grade', asyncHandler((req, res) => examController.gradeExamSubmission(req, res)));

// Messages
router.post('/messages', asyncHandler((req, res) => messageController.sendMessage(req, res)));
router.get('/messages/:user_id/:other_user_id', asyncHandler((req, res) => messageController.getMessages(req, res)));
router.patch('/messages/:id/read', asyncHandler((req, res) => messageController.markMessageRead(req, res)));
router.get('/conversations/:user_id', asyncHandler((req, res) => messageController.getConversations(req, res)));
router.get('/unread-count/:user_id', asyncHandler((req, res) => messageController.getUnreadCount(req, res)));

// Leave
router.post('/leave', asyncHandler((req, res) => leaveController.applyLeave(req, res)));
router.get('/leave/:user_id', asyncHandler((req, res) => leaveController.getLeave(req, res)));

// Announcements
router.post('/announcements', asyncHandler((req, res) => announcementController.createAnnouncement(req, res)));
router.get('/announcements/:org_id', asyncHandler((req, res) => announcementController.getAnnouncements(req, res)));

// Admin: Users
router.get('/admin/users/:org_id', asyncHandler((req, res) => adminUserController.getAdminUsers(req, res)));
router.post('/admin/users', asyncHandler((req, res) => adminUserController.createAdminUser(req, res)));
router.patch('/admin/users/:user_id/status', asyncHandler((req, res) => adminUserController.updateUserStatus(req, res)));

// Admin: Classes
router.get('/admin/classes/:org_id', asyncHandler((req, res) => classController.getAdminClasses(req, res)));
router.post('/admin/classes', asyncHandler((req, res) => classController.createAdminClass(req, res)));

// Admin: Timetable
router.get('/admin/timetable/:org_id', asyncHandler((req, res) => timetableController.getAdminTimetable(req, res)));
router.post('/admin/timetable', asyncHandler((req, res) => timetableController.createAdminTimetable(req, res)));

// Admin: Fees
router.get('/admin/fees/:org_id', asyncHandler((req, res) => adminFeeController.getAdminFees(req, res)));
router.post('/admin/fees', asyncHandler((req, res) => adminFeeController.createAdminFee(req, res)));

// Librarian
router.get('/librarian/books/:org_id', asyncHandler((req, res) => librarianController.getBooks(req, res)));
router.post('/librarian/books', asyncHandler((req, res) => librarianController.addBook(req, res)));
router.post('/librarian/issue', asyncHandler((req, res) => librarianController.issueBook(req, res)));

// Transport
router.get('/transport/routes/:org_id', asyncHandler((req, res) => transportController.getTransportRoutes(req, res)));
router.post('/transport/routes', asyncHandler((req, res) => transportController.createTransportRoute(req, res)));

// Hostel
router.get('/hostel/rooms/:org_id', asyncHandler((req, res) => hostelController.getHostelRooms(req, res)));

// Accountant
router.get('/accountant/collections/:org_id', asyncHandler((req, res) => accountantController.getCollections(req, res)));

export default router;
