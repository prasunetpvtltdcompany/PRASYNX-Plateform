/** Admissions module DTOs (schema: public.admission_applications). */

export type AdmissionStatus =
  | 'pending'
  | 'contacted'
  | 'reviewing'
  | 'accepted'
  | 'rejected'
  | 'waitlisted';

export const ADMISSION_STATUSES: AdmissionStatus[] = [
  'pending',
  'contacted',
  'reviewing',
  'accepted',
  'rejected',
  'waitlisted',
];

export interface AdmissionDTO {
  id: string;
  organisation_id: string;
  applicant_name: string;
  applicant_email: string | null;
  phone: string | null;
  applying_class: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  status: AdmissionStatus;
  academic_year_id: string | null;
  academic_year: string | null;
  created_at?: string;
}

export interface CreateAdmissionInput {
  applicant_name: string;
  applicant_email?: string;
  phone?: string;
  applying_class?: string;
  parent_name?: string;
  parent_phone?: string;
  academic_year?: string;
}

export interface UpdateAdmissionStatusInput {
  status: AdmissionStatus;
}