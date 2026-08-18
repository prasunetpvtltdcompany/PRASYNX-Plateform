/**
 * Management Controller (Legacy — use DashboardController, StaffController, StudentController, ClassController instead)
 * 
 * @deprecated Split into domain-specific controllers:
 *   - DashboardController  → dashboard.controller.ts
 *   - StaffController      → staff.controller.ts
 *   - StudentController    → student.controller.ts
 *   - ClassController      → class.controller.ts
 * 
 * Kept for backward compatibility. New code should import from the individual controllers.
 */
import { Request, Response } from 'express';
import { managementService } from '../services/management.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class ManagementController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const stats = await managementService.getDashboardStats(organisation_id);
    sendSuccess(res, stats);
  }

  // Staff
  async createStaff(req: AuthRequest, res: Response) {
    const staff = await managementService.createStaff(req.body);
    sendCreated(res, staff, 'Staff created successfully');
  }

  async getStaff(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const staff = await managementService.getStaff(organisation_id);
    sendSuccess(res, { staff });
  }

  async updateStaff(req: AuthRequest, res: Response) {
    const { staff_id } = req.params;
    const result = await managementService.updateStaff(staff_id, req.body);
    sendSuccess(res, result);
  }

  async updateStaffStatus(req: AuthRequest, res: Response) {
    const { staff_id } = req.params;
    const { status } = req.body;
    const result = await managementService.updateStaffStatus(staff_id, status);
    sendSuccess(res, result);
  }

  // Students
  async createStudent(req: AuthRequest, res: Response) {
    const student = await managementService.createStudent(req.body);
    sendCreated(res, student, 'Student created successfully');
  }

  async getStudents(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const students = await managementService.getStudents(organisation_id);
    sendSuccess(res, students);
  }

  async updateStudent(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const student = await managementService.updateStudent(student_id, req.body);
    sendSuccess(res, student);
  }

  // Classes
  async createClass(req: AuthRequest, res: Response) {
    const cls = await managementService.createClass(req.body);
    sendCreated(res, cls, 'Class created successfully');
  }

  async getClasses(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const classes = await managementService.getClasses(organisation_id);
    sendSuccess(res, classes);
  }

  async assignStudentToClass(req: AuthRequest, res: Response) {
    const { class_id } = req.params;
    const { student_id } = req.body;
    const result = await managementService.assignStudentToClass(class_id, student_id);
    sendCreated(res, result, 'Student assigned to class');
  }
}

export const managementController = new ManagementController();
