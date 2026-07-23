import { Response } from 'express';
import { timetableService } from '../services/timetable.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class TimetableController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await timetableService.getDashboard(organisation_id);
    sendSuccess(res, result);
  }

  async getEntries(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const filters = {
      class_id: req.query.class_id as string,
      teacher_id: req.query.teacher_id as string,
      day_of_week: req.query.day_of_week ? parseInt(req.query.day_of_week as string) : undefined,
      room: req.query.room as string,
      entry_type: req.query.entry_type as string,
      term: req.query.term as string,
    };
    const result = await timetableService.getEntries(organisation_id, filters);
    sendSuccess(res, result);
  }

  async getEntryById(req: AuthRequest, res: Response) {
    const { entry_id } = req.params;
    const result = await timetableService.getEntryById(entry_id);
    sendSuccess(res, result);
  }

  async createEntry(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await timetableService.createEntry(organisation_id, req.body);
    sendCreated(res, result, 'Timetable entry created');
  }

  async updateEntry(req: AuthRequest, res: Response) {
    const { entry_id } = req.params;
    const result = await timetableService.updateEntry(entry_id, req.body);
    sendSuccess(res, result, 'Timetable entry updated');
  }

  async deleteEntry(req: AuthRequest, res: Response) {
    const { entry_id } = req.params;
    const result = await timetableService.deleteEntry(entry_id);
    sendSuccess(res, result, 'Timetable entry deleted');
  }

  async bulkCreate(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await timetableService.bulkCreate(organisation_id, req.body.entries || []);
    sendCreated(res, result, 'Bulk entries created');
  }

  async swapPeriods(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { entry_id_a, entry_id_b } = req.body;
    const result = await timetableService.swapPeriods(organisation_id, entry_id_a, entry_id_b);
    sendSuccess(res, result, 'Periods swapped');
  }

  async moveEntry(req: AuthRequest, res: Response) {
    const { entry_id } = req.params;
    const { day_of_week, start_time, end_time } = req.body;
    const result = await timetableService.moveEntry(entry_id, day_of_week, start_time, end_time);
    sendSuccess(res, result, 'Entry moved');
  }

  async assignSubstitute(req: AuthRequest, res: Response) {
    const { entry_id } = req.params;
    const { substitute_teacher_id } = req.body;
    const result = await timetableService.assignSubstitute(entry_id, substitute_teacher_id);
    sendSuccess(res, result, 'Substitute assigned');
  }

  async copySchedule(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { from_class_id, to_class_id } = req.body;
    const result = await timetableService.copySchedule(organisation_id, from_class_id, to_class_id);
    sendCreated(res, result, 'Schedule copied');
  }

  async duplicateWeek(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { class_id, source_week_start, target_week_start } = req.body;
    const result = await timetableService.duplicateWeek(organisation_id, class_id, source_week_start, target_week_start);
    sendCreated(res, result, 'Week duplicated');
  }

  async detectConflicts(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await timetableService.detectConflicts(organisation_id, {
      teacher_id: req.query.teacher_id as string,
      day_of_week: parseInt(req.query.day_of_week as string),
      start_time: req.query.start_time as string,
      end_time: req.query.end_time as string,
      room: req.query.room as string,
      exclude_id: req.query.exclude_id as string,
    });
    sendSuccess(res, result);
  }

  async getConflicts(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await timetableService.getConflicts(organisation_id);
    sendSuccess(res, result);
  }

  async resolveConflict(req: AuthRequest, res: Response) {
    const { conflict_id } = req.params;
    const result = await timetableService.resolveConflict(conflict_id);
    sendSuccess(res, result, 'Conflict resolved');
  }

  async getTeacherAvailability(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await timetableService.getTeacherAvailability(organisation_id, req.query.teacher_id as string);
    sendSuccess(res, result);
  }

  async setTeacherAvailability(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await timetableService.setTeacherAvailability(organisation_id, req.body);
    sendCreated(res, result, 'Availability set');
  }

  async getRoomSchedule(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await timetableService.getRoomSchedule(organisation_id, req.query.room as string);
    sendSuccess(res, result);
  }

  async bookRoom(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await timetableService.bookRoom(organisation_id, req.body);
    sendCreated(res, result, 'Room booked');
  }

  async getTemplates(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await timetableService.getTemplates(organisation_id);
    sendSuccess(res, result);
  }

  async saveTemplate(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await timetableService.saveTemplate(organisation_id, req.body);
    sendCreated(res, result, 'Template saved');
  }

  async applyTemplate(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { template_id, class_id } = req.body;
    const result = await timetableService.applyTemplate(organisation_id, template_id, class_id);
    sendSuccess(res, result, 'Template applied');
  }

  async getAcademicCalendar(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const result = await timetableService.getAcademicCalendar(organisation_id, year);
    sendSuccess(res, result);
  }

  async createCalendarEvent(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await timetableService.createCalendarEvent(organisation_id, req.body);
    sendCreated(res, result, 'Calendar event created');
  }

  async generateTimetable(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const { class_id, term, academic_year } = req.body;
    const result = await timetableService.generateTimetable(organisation_id, class_id, term, academic_year);
    sendCreated(res, result, 'Timetable generated');
  }

  async getAnalytics(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await timetableService.getAnalytics(organisation_id);
    sendSuccess(res, result);
  }

  async getAiSuggestions(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await timetableService.getAiSuggestions(organisation_id);
    sendSuccess(res, result);
  }

  async getTeachersList(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await timetableService.getTeachersList(organisation_id);
    sendSuccess(res, result);
  }

  async getClassesList(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await timetableService.getClassesList(organisation_id);
    sendSuccess(res, result);
  }

  async getSubjectsList(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await timetableService.getSubjectsList(organisation_id);
    sendSuccess(res, result);
  }
}

export const timetableController = new TimetableController();
