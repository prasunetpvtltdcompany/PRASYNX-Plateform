import { Response } from 'express';
import { exportService } from '../services/export.service';
import { sendCSV, sendJSONExport } from '../utils/export';
import { AuthRequest } from '../types';

export class ExportController {
  async csvAcademicYears(req: AuthRequest, res: Response) {
    const { rows, columns } = await exportService.exportAcademicYears(req.params.org_id);
    sendCSV(res, 'academic-years', rows, columns);
  }
  async csvSections(req: AuthRequest, res: Response) {
    const { rows, columns } = await exportService.exportSections(req.params.org_id);
    sendCSV(res, 'sections', rows, columns);
  }
  async csvStudents(req: AuthRequest, res: Response) {
    const { rows, columns } = await exportService.exportStudents(req.params.org_id);
    sendCSV(res, 'students', rows, columns);
  }
  async csvStaff(req: AuthRequest, res: Response) {
    const { rows, columns } = await exportService.exportStaff(req.params.org_id);
    sendCSV(res, 'staff', rows, columns);
  }
  async csvHomework(req: AuthRequest, res: Response) {
    const { rows, columns } = await exportService.exportHomework(req.params.org_id);
    sendCSV(res, 'homework', rows, columns);
  }
  async csvEnrollments(req: AuthRequest, res: Response) {
    const { rows, columns } = await exportService.exportEnrollments(req.params.org_id);
    sendCSV(res, 'enrollments', rows, columns);
  }
  async csvPromotions(req: AuthRequest, res: Response) {
    const { rows, columns } = await exportService.exportPromotions(req.params.org_id);
    sendCSV(res, 'promotions', rows, columns);
  }
  async csvCommunicationLogs(req: AuthRequest, res: Response) {
    const { rows, columns } = await exportService.exportCommunicationLogs(req.params.org_id);
    sendCSV(res, 'communication-logs', rows, columns);
  }
  async csvTeacherAssignments(req: AuthRequest, res: Response) {
    const { rows, columns } = await exportService.exportTeacherAssignments(req.params.org_id);
    sendCSV(res, 'teacher-assignments', rows, columns);
  }
  async csvParents(req: AuthRequest, res: Response) {
    const { rows, columns } = await exportService.exportParents(req.params.org_id);
    sendCSV(res, 'parents', rows, columns);
  }
}

export const exportController = new ExportController();
