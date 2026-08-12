export type ExamType = 'midterm' | 'final' | 'quiz' | 'unit_test' | 'practical';
export type ExamStatus = 'upcoming' | 'ongoing' | 'completed';

export interface SubjectDTO {
  id: string;
  name: string;
  code?: string | null;
  organisation_id: string;
}

export interface ExamRow {
  id: string;
  organisation_id: string;
  name: string;
  exam_type: ExamType;
  start_date?: string | null;
  end_date?: string | null;
  max_marks: number;
  status: ExamStatus;
  created_at?: string;
}

export interface ExamDTO extends ExamRow {}

export interface ExamScheduleRow {
  id: string;
  organisation_id: string;
  exam_id: string;
  class_id: string;
  subject_id: string;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  room?: string | null;
}

export interface ExamScheduleDTO extends ExamScheduleRow {
  subject_name?: string | null;
  class_name?: string | null;
}

export interface ExamResultRow {
  id: string;
  organisation_id: string;
  exam_id: string;
  student_id: string;
  subject_id: string;
  marks_obtained: number;
  max_marks: number;
  grade?: string | null;
  remarks?: string | null;
}

export interface ExamResultDTO extends ExamResultRow {
  student_name?: string | null;
  subject_name?: string | null;
}

export interface ExamDetailDTO extends ExamDTO {
  schedules: ExamScheduleDTO[];
  results: ExamResultDTO[];
}