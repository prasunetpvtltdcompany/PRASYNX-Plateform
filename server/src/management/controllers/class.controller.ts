import { Response } from 'express';
import { classService } from '../services/class.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class ClassController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await classService.getDashboard(organisation_id);
    sendSuccess(res, result);
  }

  async getClasses(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const classes = await classService.getClasses(organisation_id);
    sendSuccess(res, classes);
  }

  async getClassById(req: AuthRequest, res: Response) {
    const { class_id } = req.params;
    const cls = await classService.getClassById(class_id);
    sendSuccess(res, cls);
  }

  async createClass(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const cls = await classService.createClass(organisation_id, req.body);
    sendCreated(res, cls, 'Class created successfully');
  }

  async updateClass(req: AuthRequest, res: Response) {
    const { class_id } = req.params;
    const cls = await classService.updateClass(class_id, req.body);
    sendSuccess(res, cls);
  }

  async deleteClass(req: AuthRequest, res: Response) {
    const { class_id } = req.params;
    const result = await classService.deleteClass(class_id);
    sendSuccess(res, result);
  }

  async archiveClass(req: AuthRequest, res: Response) {
    const { class_id } = req.params;
    const cls = await classService.archiveClass(class_id);
    sendSuccess(res, cls);
  }

  async getClassStudents(req: AuthRequest, res: Response) {
    const { class_id } = req.params;
    const students = await classService.getClassStudents(class_id);
    sendSuccess(res, students);
  }

  async assignStudent(req: AuthRequest, res: Response) {
    const { class_id } = req.params;
    const { student_id, confirm } = req.body;
    const result = await classService.assignStudent(class_id, student_id, confirm === true);
    sendCreated(res, result, 'Student assigned');
  }

  async assignStudentsBulk(req: AuthRequest, res: Response) {
    const { class_id } = req.params;
    const { student_ids, confirm } = req.body;
    const result = await classService.assignStudentsBulk(class_id, student_ids, confirm === true);
    sendCreated(res, result, 'Students assigned');
  }

  async removeStudent(req: AuthRequest, res: Response) {
    const { class_id, student_id } = req.params;
    const result = await classService.removeStudent(class_id, student_id);
    sendSuccess(res, result);
  }

  async transferStudent(req: AuthRequest, res: Response) {
    const { student_id, from_class_id, to_class_id } = req.body;
    const result = await classService.transferStudent(student_id, from_class_id, to_class_id);
    sendSuccess(res, result);
  }

  async promoteStudents(req: AuthRequest, res: Response) {
    const { organisation_id, from_class_id, to_class_id, student_ids } = req.body;
    const result = await classService.promoteStudents(organisation_id, from_class_id, to_class_id, student_ids);
    sendSuccess(res, result);
  }

  async assignClassTeacher(req: AuthRequest, res: Response) {
    const { class_id, teacher_id } = req.params;
    const result = await classService.assignClassTeacher(class_id, teacher_id, req.user?.organisationId ?? undefined);
    sendSuccess(res, result);
  }

  async assignAssistantTeacher(req: AuthRequest, res: Response) {
    const { class_id, teacher_id } = req.params;
    const result = await classService.assignAssistantTeacher(class_id, teacher_id, req.user?.organisationId ?? undefined);
    sendSuccess(res, result);
  }

  async getRooms(req: AuthRequest, res: Response) {
    const { class_id } = req.params;
    const rooms = await classService.getRooms(class_id);
    sendSuccess(res, rooms);
  }

  async allocateRoom(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const room = await classService.allocateRoom(organisation_id, req.body);
    sendCreated(res, room, 'Room allocated');
  }

  async updateRoom(req: AuthRequest, res: Response) {
    const { room_id } = req.params;
    const room = await classService.updateRoom(room_id, req.body);
    sendSuccess(res, room);
  }

  async deleteRoom(req: AuthRequest, res: Response) {
    const { room_id } = req.params;
    const result = await classService.deleteRoom(room_id);
    sendSuccess(res, result);
  }

  async getAttendanceTrend(req: AuthRequest, res: Response) {
    const { organisation_id, class_id } = req.params;
    const trend = await classService.getAttendanceTrend(organisation_id, class_id);
    sendSuccess(res, trend);
  }

  async getPerformanceSnapshots(req: AuthRequest, res: Response) {
    const { organisation_id, class_id } = req.params;
    const snapshots = await classService.getPerformanceSnapshots(organisation_id, class_id);
    sendSuccess(res, snapshots);
  }

  async getAcademicAnalytics(req: AuthRequest, res: Response) {
    const { organisation_id, class_id } = req.params;
    const analytics = await classService.getAcademicAnalytics(organisation_id, class_id);
    sendSuccess(res, analytics);
  }

  async getAiInsights(req: AuthRequest, res: Response) {
    const { organisation_id, class_id } = req.params;
    const insights = await classService.getAiInsights(organisation_id, class_id);
    sendSuccess(res, insights);
  }

  async getUnassignedStudents(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const students = await classService.getUnassignedStudents(organisation_id);
    sendSuccess(res, students);
  }

  async getAllAssignedStudents(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const students = await classService.getAllAssignedStudents(organisation_id);
    sendSuccess(res, students);
  }

  async getAvailableTeachers(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const teachers = await classService.getAvailableTeachers(organisation_id);
    sendSuccess(res, teachers);
  }

  async getSections(req: AuthRequest, res: Response) {
    const { class_id } = req.params;
    const sections = await classService.getSections(class_id);
    sendSuccess(res, sections);
  }

  async createSection(req: AuthRequest, res: Response) {
    const { class_id } = req.params;
    const section = await classService.createSection(class_id, req.body);
    sendCreated(res, section, 'Section created successfully');
  }

  async updateSection(req: AuthRequest, res: Response) {
    const { section_id } = req.params;
    const section = await classService.updateSection(section_id, req.body);
    sendSuccess(res, section);
  }

  async deleteSection(req: AuthRequest, res: Response) {
    const { section_id } = req.params;
    const result = await classService.deleteSection(section_id);
    sendSuccess(res, result);
  }
}

export const classController = new ClassController();
