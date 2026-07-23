/**
 * @deprecated This monolithic controller is being split into domain-specific controllers.
 * Use dashboard.controller.ts, student.controller.ts, class.controller.ts, timetable.controller.ts,
 * qr-attendance.controller.ts, attendance.controller.ts, grade.controller.ts, assignment.controller.ts,
 * exam.controller.ts, message.controller.ts, leave.controller.ts, announcement.controller.ts,
 * admin-user.controller.ts, admin-fee.controller.ts, librarian.controller.ts, transport.controller.ts,
 * hostel.controller.ts, accountaint.controller.ts instead.
 */
import { Request, Response } from 'express';
import { staffService } from '../services/staff.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class StaffController {
  // Dashboard
  async getDashboard(req: AuthRequest, res: Response) {
    const { teacher_id } = req.params;
    const data = await staffService.getDashboard(teacher_id);
    sendSuccess(res, data);
  }

  // Students
  async getStudents(req: AuthRequest, res: Response) {
    const { teacher_id } = req.params;
    const students = await staffService.getStudents(teacher_id);
    sendSuccess(res, { students });
  }

  // Classes
  async getClasses(req: AuthRequest, res: Response) {
    const { teacher_id } = req.params;
    const data = await staffService.getClasses(teacher_id);
    sendSuccess(res, data);
  }

  // Timetable
  async getTimetable(req: AuthRequest, res: Response) {
    const { teacher_id } = req.params;
    const data = await staffService.getTimetable(teacher_id);
    sendSuccess(res, data);
  }

  // QR Attendance
  async generateQR(req: AuthRequest, res: Response) {
    const data = await staffService.generateQR(req.body);
    sendSuccess(res, data);
  }

  async getScanCount(req: AuthRequest, res: Response) {
    const { token } = req.body;
    const data = await staffService.getScanCount(token);
    sendSuccess(res, data);
  }

  // Attendance
  async markAttendance(req: AuthRequest, res: Response) {
    const data = await staffService.markAttendance(req.body);
    sendSuccess(res, data);
  }

  async bulkAttendance(req: AuthRequest, res: Response) {
    const data = await staffService.bulkAttendance(req.body);
    sendSuccess(res, data);
  }

  async getAttendance(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await staffService.getAttendance(student_id);
    sendSuccess(res, data);
  }

  async getAttendanceReport(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await staffService.getAttendanceReport(student_id);
    sendSuccess(res, data);
  }

  // Grades
  async addGrade(req: AuthRequest, res: Response) {
    const data = await staffService.addGrade(req.body);
    sendCreated(res, data, 'Grade added');
  }

  async getGrades(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await staffService.getGrades(student_id);
    sendSuccess(res, data);
  }

  // Assignments
  async createAssignment(req: AuthRequest, res: Response) {
    const data = await staffService.createAssignment(req.body);
    sendCreated(res, data, 'Assignment created');
  }

  async getAssignments(req: AuthRequest, res: Response) {
    const { teacher_id } = req.params;
    const data = await staffService.getAssignments(teacher_id);
    sendSuccess(res, data);
  }

  async getSubmissions(req: AuthRequest, res: Response) {
    const { assignment_id } = req.params;
    const data = await staffService.getSubmissions(assignment_id);
    sendSuccess(res, data);
  }

  async gradeSubmission(req: AuthRequest, res: Response) {
    const { submission_id } = req.params;
    const { grade, feedback } = req.body;
    const data = await staffService.gradeSubmission(submission_id, grade, feedback);
    sendSuccess(res, data);
  }

  // Exams
  async createExam(req: AuthRequest, res: Response) {
    const data = await staffService.createExam(req.body);
    sendCreated(res, data, 'Exam created');
  }

  async addExamQuestion(req: AuthRequest, res: Response) {
    const data = await staffService.addExamQuestion(req.body);
    sendCreated(res, data, 'Question added');
  }

  async getExams(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const data = await staffService.getExams(organisation_id);
    sendSuccess(res, data);
  }

  async updateExamStatus(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    const data = await staffService.updateExamStatus(id, status);
    sendSuccess(res, data);
  }

  async deleteExamQuestion(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const data = await staffService.deleteExamQuestion(id);
    sendSuccess(res, data);
  }

  async getExamSubmissions(req: AuthRequest, res: Response) {
    const { exam_id } = req.params;
    const data = await staffService.getExamSubmissions(exam_id);
    sendSuccess(res, data);
  }

  async gradeExamSubmission(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { marks_obtained, feedback } = req.body;
    const data = await staffService.gradeExamSubmission(id, marks_obtained, feedback);
    sendSuccess(res, data);
  }

  // Messages
  async sendMessage(req: AuthRequest, res: Response) {
    const data = await staffService.sendMessage(req.body);
    sendCreated(res, data, 'Message sent');
  }

  async getMessages(req: AuthRequest, res: Response) {
    const { user_id, other_user_id } = req.params;
    const data = await staffService.getMessages(user_id, other_user_id);
    sendSuccess(res, data);
  }

  async markMessageRead(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const data = await staffService.markMessageRead(id);
    sendSuccess(res, data);
  }

  async getConversations(req: AuthRequest, res: Response) {
    const { user_id } = req.params;
    const data = await staffService.getConversations(user_id);
    sendSuccess(res, data);
  }

  async getUnreadCount(req: AuthRequest, res: Response) {
    const { user_id } = req.params;
    const data = await staffService.getUnreadCount(user_id);
    sendSuccess(res, data);
  }

  // Leave
  async applyLeave(req: AuthRequest, res: Response) {
    const data = await staffService.applyLeave(req.body);
    sendCreated(res, data, 'Leave applied');
  }

  async getLeave(req: AuthRequest, res: Response) {
    const { user_id } = req.params;
    const data = await staffService.getLeave(user_id);
    sendSuccess(res, data);
  }

  // Announcements
  async createAnnouncement(req: AuthRequest, res: Response) {
    const data = await staffService.createAnnouncement(req.body);
    sendCreated(res, data, 'Announcement posted');
  }

  async getAnnouncements(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await staffService.getAnnouncements(org_id);
    sendSuccess(res, data);
  }

  // Admin: Users
  async getAdminUsers(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await staffService.getAdminUsers(org_id);
    sendSuccess(res, data);
  }

  async createAdminUser(req: AuthRequest, res: Response) {
    const data = await staffService.createAdminUser(req.body);
    sendCreated(res, data, 'User created');
  }

  async updateUserStatus(req: AuthRequest, res: Response) {
    const { user_id } = req.params;
    const { status } = req.body;
    const data = await staffService.updateUserStatus(user_id, status);
    sendSuccess(res, data);
  }

  // Admin: Classes
  async getAdminClasses(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await staffService.getAdminClasses(org_id);
    sendSuccess(res, data);
  }

  async createAdminClass(req: AuthRequest, res: Response) {
    const data = await staffService.createAdminClass(req.body);
    sendCreated(res, data, 'Class created');
  }

  // Admin: Timetable
  async getAdminTimetable(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await staffService.getAdminTimetable(org_id);
    sendSuccess(res, data);
  }

  async createAdminTimetable(req: AuthRequest, res: Response) {
    const data = await staffService.createAdminTimetable(req.body);
    sendCreated(res, data, 'Timetable entry created');
  }

  // Admin: Fees
  async getAdminFees(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await staffService.getAdminFees(org_id);
    sendSuccess(res, data);
  }

  async createAdminFee(req: AuthRequest, res: Response) {
    const data = await staffService.createAdminFee(req.body);
    sendCreated(res, data, 'Fee created');
  }

  // Librarian
  async getBooks(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await staffService.getBooks(org_id);
    sendSuccess(res, data);
  }

  async addBook(req: AuthRequest, res: Response) {
    const data = await staffService.addBook(req.body);
    sendCreated(res, data, 'Book added');
  }

  async issueBook(req: AuthRequest, res: Response) {
    const data = await staffService.issueBook(req.body);
    sendCreated(res, data, 'Book issued');
  }

  // Transport
  async getTransportRoutes(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await staffService.getTransportRoutes(org_id);
    sendSuccess(res, data);
  }

  async createTransportRoute(req: AuthRequest, res: Response) {
    const data = await staffService.createTransportRoute(req.body);
    sendCreated(res, data, 'Route created');
  }

  // Hostel
  async getHostelRooms(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await staffService.getHostelRooms(org_id);
    sendSuccess(res, data);
  }

  // Accountant
  async getCollections(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await staffService.getCollections(org_id);
    sendSuccess(res, data);
  }
}

export const staffController = new StaffController();
