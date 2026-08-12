/** Promotion module DTOs (schema: public.promotion_history). */

export interface PromotionDTO {
  id: string;
  organisation_id: string;
  student_id: string;
  from_class_id: string | null;
  from_section_id: string | null;
  to_class_id: string;
  to_section_id: string | null;
  academic_year_id: string | null;
  academic_year: string | null;
  promoted_by: string | null;
  remarks: string | null;
  promoted_at: string | null;
  created_at?: string;
}

export interface CreatePromotionInput {
  student_id: string;
  from_class_id?: string;
  from_section_id?: string;
  to_class_id: string;
  to_section_id?: string;
  academic_year_id?: string;
  academic_year?: string;
  remarks?: string;
}