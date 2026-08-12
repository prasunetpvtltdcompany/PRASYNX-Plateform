import type { CreateLibraryBookInput, LibraryBookDTO } from '@prasynx/types';
import { db } from '../../infrastructure/database/supabase';
import { NotFoundError } from '../../shared/errors/errors';

const COLUMNS =
  'id,organisation_id,title,author,isbn,category,publisher,publish_year,copies_total,copies_available,shelf_location,status,created_at';

export class LibraryRepository {
  async list(tenantId: string): Promise<LibraryBookDTO[]> {
    const { data, error } = await db
      .from('library_books')
      .select(COLUMNS)
      .eq('organisation_id', tenantId)
      .order('title');
    if (error) throw error;
    return (data as unknown as LibraryBookDTO[]) ?? [];
  }

  async findById(tenantId: string, id: string): Promise<LibraryBookDTO | null> {
    const { data, error } = await db
      .from('library_books')
      .select(COLUMNS)
      .eq('id', id)
      .eq('organisation_id', tenantId)
      .maybeSingle();
    if (error) throw error;
    return (data as unknown as LibraryBookDTO | null) ?? null;
  }

  async create(tenantId: string, input: CreateLibraryBookInput): Promise<string> {
    const total = input.copies_total ?? 1;
    const row = {
      organisation_id: tenantId,
      title: input.title,
      author: input.author ?? null,
      isbn: input.isbn ?? null,
      category: input.category ?? null,
      publisher: input.publisher ?? null,
      publish_year: input.publish_year ?? null,
      copies_total: total,
      copies_available: total,
      shelf_location: input.shelf_location ?? null,
      status: input.status ?? 'available',
    };
    const { data, error } = await db.from('library_books').insert(row).select('id').single();
    if (error || !data) throw error ?? new Error('Book could not be created');
    return data.id as string;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const { error } = await db.from('library_books').delete().eq('id', id).eq('organisation_id', tenantId);
    if (error) throw error;
  }

  async assertExists(tenantId: string, id: string): Promise<LibraryBookDTO> {
    const found = await this.findById(tenantId, id);
    if (!found) throw new NotFoundError('Book not found in this school');
    return found;
  }
}