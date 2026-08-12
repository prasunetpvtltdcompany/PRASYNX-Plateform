/** Students module DTOs (schema: public.students, class_student_map, sections). */

export type StudentStatus = 'active' | 'inactive' | 'suspended' | 'alumni';

export interface StudentDTO {
  id: string;
  user_id: string | null;
  organisation_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  roll_number: string | null;
  class_id: string | null;
  section_id: string | null;
  /** Enriched labels resolved from classes/sections. */
  class_name: string | null;
  section_name: string | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  parent_relationship: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  blood_group: string | null;
  status: StudentStatus;
  created_at?: string;
}

export interface CreateStudentInput {
  full_name: string;
  roll_number?: string;
  class_id?: string | null;
  section_id?: string | null;
  /** Fallback: resolve class/section by name when the id is not provided. */
  class_name?: string | null;
  section_name?: string | null;
  email?: string;
  phone?: string;
  /** If provided with email, also provisions a student login account. */
  password?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  parent_relationship?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  blood_group?: string;
}

export type UpdateStudentInput = Partial<Omit<CreateStudentInput, 'password'>>;