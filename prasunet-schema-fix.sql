-- Add missing columns to existing tables for backend compatibility

-- assignments
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS subject_id UUID;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS class_id UUID;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS organisation_id UUID;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS max_score NUMERIC(5,2) DEFAULT 100;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- announcements
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_role TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_class_id UUID;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- attendance
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS organisation_id UUID;

-- exam_schedules
ALTER TABLE exam_schedules ADD COLUMN IF NOT EXISTS exam_id UUID;
ALTER TABLE exam_schedules ADD COLUMN IF NOT EXISTS class_id UUID;
ALTER TABLE exam_schedules ADD COLUMN IF NOT EXISTS subject_id UUID;
ALTER TABLE exam_schedules ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE exam_schedules ADD COLUMN IF NOT EXISTS end_time TIME;

-- fee_payments
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS organisation_id UUID;
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS student_fee_id UUID;
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE fee_payments ADD COLUMN IF NOT EXISTS student_id UUID;

-- fee_structures
ALTER TABLE fee_structures ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE fee_structures ADD COLUMN IF NOT EXISTS class_id UUID;
ALTER TABLE fee_structures ADD COLUMN IF NOT EXISTS academic_year TEXT;
ALTER TABLE fee_structures ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2) DEFAULT 0;

-- grades
ALTER TABLE grades ADD COLUMN IF NOT EXISTS organisation_id UUID;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS score NUMERIC(5,2);
ALTER TABLE grades ADD COLUMN IF NOT EXISTS academic_year TEXT;

-- health_records
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS organisation_id UUID;

-- hostel_allocations
ALTER TABLE hostel_allocations ADD COLUMN IF NOT EXISTS room_id UUID;
ALTER TABLE hostel_allocations ADD COLUMN IF NOT EXISTS check_in_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE hostel_allocations ADD COLUMN IF NOT EXISTS check_out_date DATE;
ALTER TABLE hostel_allocations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE hostel_allocations ADD COLUMN IF NOT EXISTS organisation_id UUID;

-- leave_applications
ALTER TABLE leave_applications ADD COLUMN IF NOT EXISTS organisation_id UUID;
ALTER TABLE leave_applications ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE leave_applications ADD COLUMN IF NOT EXISTS leave_type TEXT;
ALTER TABLE leave_applications ADD COLUMN IF NOT EXISTS reviewed_by UUID;

-- part_time_job_applications
ALTER TABLE part_time_job_applications ADD COLUMN IF NOT EXISTS job_id UUID;
ALTER TABLE part_time_job_applications ADD COLUMN IF NOT EXISTS applicant_id UUID;
ALTER TABLE part_time_job_applications ADD COLUMN IF NOT EXISTS applicant_name TEXT;
ALTER TABLE part_time_job_applications ADD COLUMN IF NOT EXISTS applicant_email TEXT;
ALTER TABLE part_time_job_applications ADD COLUMN IF NOT EXISTS applicant_type TEXT;
ALTER TABLE part_time_job_applications ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE part_time_job_applications ADD COLUMN IF NOT EXISTS cover_note TEXT;

-- part_time_jobs
ALTER TABLE part_time_jobs ADD COLUMN IF NOT EXISTS provider_id UUID;
ALTER TABLE part_time_jobs ADD COLUMN IF NOT EXISTS target_role TEXT;
ALTER TABLE part_time_jobs ADD COLUMN IF NOT EXISTS contact_info TEXT;

-- students
ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS blood_group TEXT;

-- teachers
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS assigned_class UUID;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS qualification TEXT;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS join_date DATE;

-- transport_assignments
ALTER TABLE transport_assignments ADD COLUMN IF NOT EXISTS organisation_id UUID;
ALTER TABLE transport_assignments ADD COLUMN IF NOT EXISTS vehicle_id UUID;
ALTER TABLE transport_assignments ADD COLUMN IF NOT EXISTS route_id UUID;
ALTER TABLE transport_assignments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- users
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create indexes (only for columns that exist)
CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_students_org ON students(organisation_id);
CREATE INDEX IF NOT EXISTS idx_teachers_org ON teachers(organisation_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam ON exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_library_issues_book ON library_issues(book_id);
CREATE INDEX IF NOT EXISTS idx_library_issues_student ON library_issues(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_parent_student ON parent_student_links(student_id);
CREATE INDEX IF NOT EXISTS idx_events_org ON events(organisation_id);
CREATE INDEX IF NOT EXISTS idx_announcements_org ON announcements(organisation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organisation_id);
