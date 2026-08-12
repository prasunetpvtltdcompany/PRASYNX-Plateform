/** Subjects module DTOs (schema: public.subjects). */

export interface SchoolSubjectDTO {
  id: string;
  organisation_id: string;
  name: string;
  code: string | null;
  description: string | null;
  created_at?: string;
}

export interface CreateSchoolSubjectInput {
  name: string;
  code?: string;
  description?: string;
}

export interface UpdateSchoolSubjectInput {
  name?: string;
  code?: string;
  description?: string;
}