/** Library module DTOs (schema: public.library_books). */

export interface LibraryBookDTO {
  id: string;
  organisation_id: string;
  title: string;
  author: string | null;
  isbn: string | null;
  category: string | null;
  publisher: string | null;
  publish_year: number | null;
  copies_total: number | null;
  copies_available: number | null;
  shelf_location: string | null;
  status: string | null;
  created_at?: string;
}

export interface CreateLibraryBookInput {
  title: string;
  author?: string;
  isbn?: string;
  category?: string;
  publisher?: string;
  publish_year?: number;
  copies_total?: number;
  shelf_location?: string;
  status?: string;
}