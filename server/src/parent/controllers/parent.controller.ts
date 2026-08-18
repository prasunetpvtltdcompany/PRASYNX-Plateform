/**
 * @deprecated Use domain-specific controllers instead (dashboard, children, attendance, etc.)
 * Kept for backward compatibility. New code should import from individual controllers.
 */
import { Response } from 'express';
import { parentService } from '../services/parent.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class ParentController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { parent_id } = req.params;
    const userId = (req.query.user_id as string) || parent_id;
    const data = await parentService.getDashboard(parent_id, userId);
    sendSuccess(res, data);
  }

  async getChildren(req: AuthRequest, res: Response) {
    const { parent_id } = req.params;
    const students = await parentService.getChildren(parent_id);
    sendSuccess(res, { students });
  }

  async getAttendance(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await parentService.getAttendance(student_id);
    sendSuccess(res, data);
  }

  async getPerformance(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await parentService.getPerformance(student_id);
    sendSuccess(res, data);
  }

  async getAssignments(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const assignments = await parentService.getAssignments(student_id);
    sendSuccess(res, { assignments });
  }

  async getTeachers(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const teachers = await parentService.getTeachers(organisation_id);
    sendSuccess(res, teachers);
  }

  async getTransport(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await parentService.getTransport(student_id);
    sendSuccess(res, data);
  }

  async getHostel(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await parentService.getHostel(student_id);
    sendSuccess(res, data);
  }

  async getFeesSummary(req: AuthRequest, res: Response) {
    const { parent_id } = req.params;
    const data = await parentService.getFeesSummary(parent_id);
    sendSuccess(res, data);
  }

  async getHealth(req: AuthRequest, res: Response) {
    const { student_id } = req.params;
    const data = await parentService.getHealth(student_id);
    sendSuccess(res, data);
  }

  async getAnnouncements(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await parentService.getAnnouncements(org_id);
    sendSuccess(res, data);
  }

  async getNotifications(req: AuthRequest, res: Response) {
    const { user_id } = req.params;
    const data = await parentService.getNotifications(user_id);
    sendSuccess(res, data);
  }

  async sendMessage(req: AuthRequest, res: Response) {
    const result = await parentService.sendMessage(req.body);
    sendCreated(res, result, 'Message sent');
  }

  async getConversation(req: AuthRequest, res: Response) {
    const { user_id, other_user_id } = req.params;
    const data = await parentService.getConversation(user_id, other_user_id);
    sendSuccess(res, data);
  }
}

export const parentController = new ParentController();
