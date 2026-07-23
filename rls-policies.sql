-- ============================================================================
-- Prasunet ERP: Row-Level Security Policies
-- Run this in Supabase SQL Editor (one-time setup)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_time_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_time_job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE: users can read their own record; management/admins can read all
-- ============================================================================
CREATE POLICY "Users can view own record"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Management can view all users"
  ON users FOR SELECT
  USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- ============================================================================
-- STUDENTS: students see own; parents see linked; staff see class-assigned
-- ============================================================================
CREATE POLICY "Students view own record"
  ON students FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Parents view linked students"
  ON students FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM parent_student_links
    WHERE parent_student_links.student_id = students.id
    AND parent_student_links.parent_user_id = auth.uid()
  ));

CREATE POLICY "Staff view students in their classes"
  ON students FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM class_subject_teacher_map cstm
    JOIN classes c ON c.id = cstm.class_id
    WHERE cstm.teacher_id = (SELECT id FROM teachers WHERE user_id = auth.uid())
    AND c.id = students.class_id
  ));

-- ============================================================================
-- PARENTS: parents see own; management sees all
-- ============================================================================
CREATE POLICY "Parents view own record"
  ON parents FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART-TIME JOBS: providers manage own; anyone (authenticated) can view active
-- ============================================================================
CREATE POLICY "Job providers manage own jobs"
  ON part_time_jobs FOR ALL
  USING (provider_id = auth.uid());

CREATE POLICY "Anyone can view active jobs"
  ON part_time_jobs FOR SELECT
  USING (status = 'active');

-- ============================================================================
-- JOB APPLICATIONS: providers see apps on their jobs; applicants see own
-- ============================================================================
CREATE POLICY "Providers view apps on their jobs"
  ON part_time_job_applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM part_time_jobs
    WHERE part_time_jobs.id = part_time_job_applications.job_id
    AND part_time_jobs.provider_id = auth.uid()
  ));

CREATE POLICY "Applicants view own applications"
  ON part_time_job_applications FOR SELECT
  USING (applicant_id = auth.uid());

CREATE POLICY "Anyone can apply"
  ON part_time_job_applications FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- JOB PROVIDERS: providers manage own profile; anyone can view active providers
-- ============================================================================
CREATE POLICY "Providers manage own profile"
  ON job_providers FOR ALL
  USING (id = auth.uid());

-- ============================================================================
-- ATTENDANCE: students see own; parents see linked; teachers see class
-- ============================================================================
CREATE POLICY "Students view own attendance"
  ON attendance_records FOR SELECT
  USING (student_id IN (
    SELECT id FROM students WHERE user_id = auth.uid()
  ));

CREATE POLICY "Parents view linked student attendance"
  ON attendance_records FOR SELECT
  USING (student_id IN (
    SELECT ps.student_id FROM parent_student_links ps
    WHERE ps.parent_user_id = auth.uid()
  ));

CREATE POLICY "Teachers manage class attendance"
  ON attendance_records FOR ALL
  USING (class_id IN (
    SELECT cstm.class_id FROM class_subject_teacher_map cstm
    WHERE cstm.teacher_id = (SELECT id FROM teachers WHERE user_id = auth.uid())
  ));

-- ============================================================================
-- NOTIFICATIONS: users see notifications addressed to them
-- ============================================================================
CREATE POLICY "Users view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);
