/** Health records module DTOs (schema: public.health_records). */

export interface HealthRecordDTO {
  id: string;
  organisation_id: string;
  student_id: string;
  record_type: string;
  title: string;
  description: string | null;
  value: string | null;
  recorded_by: string | null;
  recorded_at: string | null;
  created_at?: string;
}

export interface CreateHealthRecordInput {
  student_id: string;
  record_type: string;
  title: string;
  description?: string;
  value?: string;
}