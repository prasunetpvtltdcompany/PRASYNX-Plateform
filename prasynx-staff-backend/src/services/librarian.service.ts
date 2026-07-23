import { supabase } from '../config/database';
import { BadRequestError } from '../utils/errors';

export class LibrarianService {
  async getBooks(orgId: string) {
    const { data, error } = await supabase
      .from('books').select('*').eq('organisation_id', orgId)
      .order('title');
    if (error) throw new BadRequestError(error.message);
    return data || [];
  }

  async addBook(data: { organisation_id: string; title: string; author: string; isbn?: string; copies?: number }) {
    const copies = data.copies || 1;
    const { data: result, error } = await supabase
      .from('books').insert({
        organisation_id: data.organisation_id, title: data.title, author: data.author,
        isbn: data.isbn || null, total_copies: copies, available_copies: copies
      }).select().single();
    if (error) throw new BadRequestError(error.message);
    return result;
  }

  async issueBook(data: { book_id: string; student_id: string; issued_by: string }) {
    const { data: result, error } = await supabase
      .from('book_issues').insert({
        book_id: data.book_id, student_id: data.student_id, issued_by: data.issued_by,
        issue_date: new Date().toISOString(), due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), status: 'issued'
      }).select().single();
    if (error) throw new BadRequestError(error.message);
    await supabase.rpc('decrement_available_copies', { book_id: data.book_id });
    return result;
  }
}
export const librarianService = new LibrarianService();
