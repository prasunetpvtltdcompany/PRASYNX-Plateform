export type AssignmentStatus = 'active' | 'closed';
export type SubmissionStatus = 'draft' | 'submitted' | 'graded';

export interface AssignmentRow {
  id: string;
  organisation_id: string;
  teacher_id?: string | null;
  subject_id?: string | null;
  class_id: string;
  title: string;
  description?: string | null;
  due_date: string;
  max_score: number;
  file_url?: string | null;
  status: AssignmentStatus;
  created_at?: string;
}

export interface AssignmentDTO extends AssignmentRow {
  subject_name?: string | null;
  submissions_count?: number;
}

export interface AssignmentSubmissionRow {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text?: string | null;
  file_url?: string | null;
  grade?: number | null;
  feedback?: string | null;
  status: SubmissionStatus;
  submitted_at?: string;
}

export interface AssignmentSubmissionDTO extends AssignmentSubmissionRow {
  student_name?: string | null;
}

export interface AssignmentDetailDTO extends AssignmentDTO {
  submissions: AssignmentSubmissionDTO[];
}