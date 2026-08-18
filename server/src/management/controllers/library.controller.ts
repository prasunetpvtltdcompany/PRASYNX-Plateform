import { Response } from 'express';
import { libraryService } from '../services/library.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class LibraryController {
  async getDashboard(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await libraryService.getDashboard(organisation_id);
    sendSuccess(res, result);
  }

  async getBooks(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const filters = {
      category: req.query.category as string,
      author: req.query.author as string,
      publisher: req.query.publisher as string,
      status: req.query.status as string,
      search: req.query.search as string,
      rack_number: req.query.rack_number as string,
      language: req.query.language as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };
    const result = await libraryService.getBooks(organisation_id, filters);
    sendSuccess(res, result);
  }

  async getBookById(req: AuthRequest, res: Response) {
    const { book_id } = req.params;
    const result = await libraryService.getBookById(book_id);
    sendSuccess(res, result);
  }

  async createBook(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await libraryService.createBook(organisation_id, req.body);
    sendCreated(res, result, 'Book created');
  }

  async updateBook(req: AuthRequest, res: Response) {
    const { book_id } = req.params;
    const result = await libraryService.updateBook(book_id, req.body);
    sendSuccess(res, result, 'Book updated');
  }

  async deleteBook(req: AuthRequest, res: Response) {
    const { book_id } = req.params;
    const result = await libraryService.deleteBook(book_id);
    sendSuccess(res, result, 'Book deleted');
  }

  async getIssues(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const filters = {
      status: req.query.status as string,
      book_id: req.query.book_id as string,
      member_id: req.query.member_id as string,
      from: req.query.from as string,
      to: req.query.to as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };
    const result = await libraryService.getIssues(organisation_id, filters);
    sendSuccess(res, result);
  }

  async issueBook(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await libraryService.issueBook(organisation_id, req.body);
    sendCreated(res, result, 'Book issued');
  }

  async returnBook(req: AuthRequest, res: Response) {
    const { issue_id } = req.params;
    const result = await libraryService.returnBook(issue_id, req.body);
    sendSuccess(res, result, 'Book returned');
  }

  async renewBook(req: AuthRequest, res: Response) {
    const { issue_id } = req.params;
    const extraDays = req.body.extra_days ? parseInt(req.body.extra_days) : 14;
    const result = await libraryService.renewBook(issue_id, extraDays);
    sendSuccess(res, result, 'Book renewed');
  }

  async sendReminder(req: AuthRequest, res: Response) {
    const { issue_id } = req.params;
    const result = await libraryService.sendReminder(issue_id);
    sendSuccess(res, result, 'Reminder sent');
  }

  async getMembers(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const filters = {
      member_type: req.query.member_type as string,
      status: req.query.status as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };
    const result = await libraryService.getMembers(organisation_id, filters);
    sendSuccess(res, result);
  }

  async getMemberById(req: AuthRequest, res: Response) {
    const { member_id } = req.params;
    const result = await libraryService.getMemberById(member_id);
    sendSuccess(res, result);
  }

  async createMember(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await libraryService.createMember(organisation_id, req.body);
    sendCreated(res, result, 'Member created');
  }

  async updateMember(req: AuthRequest, res: Response) {
    const { member_id } = req.params;
    const result = await libraryService.updateMember(member_id, req.body);
    sendSuccess(res, result, 'Member updated');
  }

  async suspendMember(req: AuthRequest, res: Response) {
    const { member_id } = req.params;
    const result = await libraryService.suspendMember(member_id);
    sendSuccess(res, result, 'Member suspended');
  }

  async getFines(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const filters = {
      status: req.query.status as string,
      member_id: req.query.member_id as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };
    const result = await libraryService.getFines(organisation_id, filters);
    sendSuccess(res, result);
  }

  async collectFine(req: AuthRequest, res: Response) {
    const { fine_id } = req.params;
    const result = await libraryService.collectFine(fine_id, req.body);
    sendSuccess(res, result, 'Fine collected');
  }

  async waiveFine(req: AuthRequest, res: Response) {
    const { fine_id } = req.params;
    const result = await libraryService.waiveFine(fine_id);
    sendSuccess(res, result, 'Fine waived');
  }

  async getReservations(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const bookId = req.query.book_id as string;
    const result = await libraryService.getReservations(organisation_id, bookId);
    sendSuccess(res, result);
  }

  async createReservation(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await libraryService.createReservation(organisation_id, req.body);
    sendCreated(res, result, 'Reservation created');
  }

  async fulfillReservation(req: AuthRequest, res: Response) {
    const { reservation_id } = req.params;
    const result = await libraryService.fulfillReservation(reservation_id);
    sendSuccess(res, result, 'Reservation fulfilled');
  }

  async cancelReservation(req: AuthRequest, res: Response) {
    const { reservation_id } = req.params;
    const result = await libraryService.cancelReservation(reservation_id);
    sendSuccess(res, result, 'Reservation cancelled');
  }

  async getAnalytics(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await libraryService.getAnalytics(organisation_id);
    sendSuccess(res, result);
  }

  async getAiInsights(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await libraryService.getAiInsights(organisation_id);
    sendSuccess(res, result);
  }

  async getInventoryRecords(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const bookId = req.query.book_id as string;
    const result = await libraryService.getInventoryRecords(organisation_id, bookId);
    sendSuccess(res, result);
  }

  async createInventoryRecord(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const result = await libraryService.createInventoryRecord(organisation_id, req.body);
    sendCreated(res, result, 'Inventory record created');
  }

  async verifyInventory(req: AuthRequest, res: Response) {
    const { record_id } = req.params;
    const verifiedBy = req.user?.userId || '';
    const result = await libraryService.verifyInventory(record_id, verifiedBy);
    sendSuccess(res, result, 'Inventory verified');
  }

  async getReports(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const type = req.query.type as string || 'inventory';
    const result = await libraryService.getReports(organisation_id, type, req.query);
    sendSuccess(res, result);
  }

  async exportReport(req: AuthRequest, res: Response) {
    const { organisation_id } = req.params;
    const type = req.query.type as string || 'inventory';
    const format = req.query.format as string || 'csv';
    const result = await libraryService.exportReport(organisation_id, type, format);
    sendSuccess(res, result);
  }
}

export const libraryController = new LibraryController();
