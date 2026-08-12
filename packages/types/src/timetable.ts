/** day_of_week: 0 = Sunday ... 6 = Saturday (matches schema CHECK 0..6). */
export interface TimetableEntryRow {
  id: string;
  organisation_id: string;
  class_id: string;
  subject_id: string;
  teacher_id?: string | null;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  start_time: string;
  end_time: string;
  room?: string | null;
}

export interface TimetableEntryDTO extends TimetableEntryRow {
  subject_name?: string | null;
  section_name?: string | null;
}

export interface TimetableDTO {
  class_id: string;
  class_name?: string | null;
  /** Grouped by day_of_week for client convenience. */
  entries: TimetableEntryDTO[];
}

export interface TimetableEntryInput {
  subject_id: string;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  room?: string | null;
}