import { Response } from 'express';
import { academicService } from '../services/academic.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { getPagination } from '../utils/pagination';
import { AuthRequest } from '../types';

export class AcademicController {
  // Academic Years
  async getAcademicYears(req: AuthRequest, res: Response) {
    const pag = getPagination(req);
    const { data, total } = await academicService.getAcademicYears(req.params.org_id, pag);
    sendSuccess(res, data, undefined, 200, { page: pag.page, limit: pag.limit, total: total ?? undefined });
  }
  async getAcademicYearById(req: AuthRequest, res: Response) {
    const result = await academicService.getAcademicYearById(req.params.id);
    sendSuccess(res, result);
  }
  async createAcademicYear(req: AuthRequest, res: Response) {
    const result = await academicService.createAcademicYear(req.params.org_id, req.body);
    sendCreated(res, result, 'Academic year created');
  }
  async updateAcademicYear(req: AuthRequest, res: Response) {
    const result = await academicService.updateAcademicYear(req.params.id, req.body);
    sendSuccess(res, result);
  }
  async deleteAcademicYear(req: AuthRequest, res: Response) {
    const result = await academicService.deleteAcademicYear(req.params.id);
    sendSuccess(res, result);
  }
  async setActiveAcademicYear(req: AuthRequest, res: Response) {
    const result = await academicService.setActiveAcademicYear(req.params.org_id, req.params.id);
    sendSuccess(res, result, 'Active academic year updated');
  }

  // Sections
  async getSections(req: AuthRequest, res: Response) {
    const pag = getPagination(req);
    const { data, total } = await academicService.getSections(req.params.org_id, pag);
    sendSuccess(res, data, undefined, 200, { page: pag.page, limit: pag.limit, total: total ?? undefined });
  }
  async getSectionById(req: AuthRequest, res: Response) {
    const result = await academicService.getSectionById(req.params.id);
    sendSuccess(res, result);
  }
  async createSection(req: AuthRequest, res: Response) {
    const result = await academicService.createSection(req.params.org_id, req.body);
    sendCreated(res, result, 'Section created');
  }
  async updateSection(req: AuthRequest, res: Response) {
    const result = await academicService.updateSection(req.params.id, req.body);
    sendSuccess(res, result);
  }
  async deleteSection(req: AuthRequest, res: Response) {
    const result = await academicService.deleteSection(req.params.id);
    sendSuccess(res, result);
  }

  // Class-Subject Assignments
  async getClassSubjects(req: AuthRequest, res: Response) {
    const pag = getPagination(req);
    const { data, total } = await academicService.getClassSubjects(req.params.org_id, pag);
    sendSuccess(res, data, undefined, 200, { page: pag.page, limit: pag.limit, total: total ?? undefined });
  }
  async getClassSubjectById(req: AuthRequest, res: Response) {
    const result = await academicService.getClassSubjectById(req.params.id);
    sendSuccess(res, result);
  }
  async createClassSubject(req: AuthRequest, res: Response) {
    const result = await academicService.createClassSubject(req.params.org_id, req.body);
    sendCreated(res, result, 'Subject assigned to class');
  }
  async updateClassSubject(req: AuthRequest, res: Response) {
    const result = await academicService.updateClassSubject(req.params.id, req.body);
    sendSuccess(res, result);
  }
  async deleteClassSubject(req: AuthRequest, res: Response) {
    const result = await academicService.deleteClassSubject(req.params.id);
    sendSuccess(res, result);
  }

  // Teacher Assignments
  async getTeacherAssignments(req: AuthRequest, res: Response) {
    const result = await academicService.getTeacherAssignments(req.params.org_id);
    sendSuccess(res, result);
  }
  async getTeacherAssignmentById(req: AuthRequest, res: Response) {
    const result = await academicService.getTeacherAssignmentById(req.params.id);
    sendSuccess(res, result);
  }
  async createTeacherAssignment(req: AuthRequest, res: Response) {
    const result = await academicService.createTeacherAssignment(req.params.org_id, req.body);
    sendCreated(res, result, 'Teacher assigned');
  }
  async updateTeacherAssignment(req: AuthRequest, res: Response) {
    const result = await academicService.updateTeacherAssignment(req.params.id, req.body);
    sendSuccess(res, result);
  }
  async deleteTeacherAssignment(req: AuthRequest, res: Response) {
    const result = await academicService.deleteTeacherAssignment(req.params.id);
    sendSuccess(res, result);
  }

  // Class Teacher
  async getClassTeachers(req: AuthRequest, res: Response) {
    const result = await academicService.getClassTeachers(req.params.org_id);
    sendSuccess(res, result);
  }
  async assignClassTeacher(req: AuthRequest, res: Response) {
    const result = await academicService.assignClassTeacher(req.params.org_id, req.body);
    sendCreated(res, result, 'Class teacher assigned');
  }
  async removeClassTeacher(req: AuthRequest, res: Response) {
    const result = await academicService.removeClassTeacher(req.params.org_id, req.params.class_id);
    sendSuccess(res, result);
  }

  // Enrollments
  async getEnrollments(req: AuthRequest, res: Response) {
    const result = await academicService.getEnrollments(req.params.org_id);
    sendSuccess(res, result);
  }
  async getClassEnrollments(req: AuthRequest, res: Response) {
    const result = await academicService.getClassEnrollments(req.params.class_id);
    sendSuccess(res, result);
  }
  async enrollStudent(req: AuthRequest, res: Response) {
    const result = await academicService.enrollStudent(req.params.org_id, req.body);
    sendCreated(res, result, 'Student enrolled');
  }
  async enrollStudentsBulk(req: AuthRequest, res: Response) {
    const result = await academicService.enrollStudentsBulk(req.params.org_id, req.body);
    sendCreated(res, result, 'Students enrolled');
  }
  async removeEnrollment(req: AuthRequest, res: Response) {
    const result = await academicService.removeEnrollment(req.params.class_id, req.params.student_id);
    sendSuccess(res, result);
  }
}

export const academicController = new AcademicController();
