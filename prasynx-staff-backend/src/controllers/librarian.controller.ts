import { Response } from 'express';
import { librarianService } from '../services/librarian.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuthRequest } from '../types';

export class LibrarianController {
  async getBooks(req: AuthRequest, res: Response) {
    const { org_id } = req.params;
    const data = await librarianService.getBooks(org_id);
    sendSuccess(res, data);
  }

  async addBook(req: AuthRequest, res: Response) {
    const data = await librarianService.addBook(req.body);
    sendCreated(res, data, 'Book added');
  }

  async issueBook(req: AuthRequest, res: Response) {
    const data = await librarianService.issueBook(req.body);
    sendCreated(res, data, 'Book issued');
  }
}
export const librarianController = new LibrarianController();
