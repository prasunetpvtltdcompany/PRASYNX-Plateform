export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

/** Row shape from attendance_records (existing schema). */
export interface AttendanceRecordRow {
  id: string;
  organisation_id: string;
  student_id: string;
  class_id: string | null;
  section_id: string | null;
  teacher_id: string | null;
  subject_id: string | null;
  attendance_date: string;
  attendance_status: string;
  remarks?: string | null;
  created_at?: string;
}

export interface AttendanceRecordDTO {
  id: string;
  organisation_id: string;
  student_id: string;
  teacher_id: string | null;
  date: string;
  status: AttendanceStatus;
  notes: string | null;
  created_at?: string;
}

export interface MarkAttendanceInput {
  teacherId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string | null;
}

export interface BulkAttendanceInput {
  teacherId: string;
  classId: string;
  date: string;
  records: Array<{
    studentId: string;
    status: AttendanceStatus;
    notes?: string | null;
  }>;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export interface AttendanceReport {
  summary: AttendanceSummary;
  records: AttendanceRecordDTO[];
}

/** One student row in the class roster grid for a given date. */
export interface ClassRosterStudent {
  id: string;
  full_name: string;
  roll_number: string | null;
  section_id: string | null;
  status: AttendanceStatus | null;
  record_id: string | null;
  notes: string | null;
}

export interface ClassRosterDTO {
  class_id: string;
  date: string;
  marked: number;
  unmarked: number;
  students: ClassRosterStudent[];
}

/** A single attendance record with student context for the records table. */
export interface AttendanceRecordListItem {
  id: string;
  organisation_id: string;
  student_id: string;
  student_name: string | null;
  class_id: string | null;
  section_id: string | null;
  teacher_id: string | null;
  subject_id: string | null;
  date: string;
  status: AttendanceStatus;
  notes: string | null;
  created_at?: string;
}

export interface PaginatedAttendanceRecords {
  data: AttendanceRecordListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ClassAttendanceSummary {
  class_id: string;
  class_name: string | null;
  present: number;
  absent: number;
  late: number;
  excused: number;
  unmarked: number;
  total: number;
}

export interface DailyAttendanceSummaryDTO {
  date: string;
  classes: ClassAttendanceSummary[];
  totals: AttendanceSummary;
}