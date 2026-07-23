-- ============================================================================
-- PRASYNX ERP - RLS POLICY FIX MIGRATION (v2 - corrected for actual schema)
-- ============================================================================
-- Fixes:
-- 1. Adds RLS to `attendance` table (the operational table, not attendance_records)
-- 2. Adds tenant-isolation (organisation_id) policies to key tables
-- 3. Adds user-level policies for notifications
-- ============================================================================
-- NOTE: service_role (management/admin backends) always bypasses RLS.
-- These policies protect student/staff/parent portal queries via anon key.
-- Ownership enforcement is handled separately by middleware on each route.
-- ============================================================================

-- ============================================================================
-- 1. ATTENDANCE: RLS + policies
-- ============================================================================
ALTER TABLE IF EXISTS attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view own attendance" ON attendance;
CREATE POLICY "Students view own attendance" ON attendance FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Parents view linked student attendance" ON attendance;
CREATE POLICY "Parents view linked student attendance" ON attendance FOR SELECT
  USING (student_id IN (
    SELECT ps.student_id FROM parent_student_links ps WHERE ps.parent_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Teachers manage own attendance records" ON attendance;
CREATE POLICY "Teachers manage own attendance records" ON attendance FOR ALL
  USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff view all attendance in org" ON attendance;
CREATE POLICY "Staff view all attendance in org" ON attendance FOR SELECT
  USING (organisation_id IN (
    SELECT organisation_id FROM users WHERE id = auth.uid()
  ));

-- ============================================================================
-- 2. ORGANISATIONS: org management view
-- ============================================================================
DROP POLICY IF EXISTS "Org management can view their organisation" ON organisations;
CREATE POLICY "Org management can view their organisation"
  ON organisations FOR SELECT
  USING (id IN (
    SELECT organisation_id FROM users WHERE id = auth.uid() AND role IN ('management', 'admin')
  ));

-- ============================================================================
-- 3. TEACHERS: teachers see own; users in org see all
-- ============================================================================
DROP POLICY IF EXISTS "Teachers view own record" ON teachers;
CREATE POLICY "Teachers view own record"
  ON teachers FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users view teachers in their org" ON teachers;
CREATE POLICY "Users view teachers in their org"
  ON teachers FOR SELECT
  USING (organisation_id IN (
    SELECT organisation_id FROM users WHERE id = auth.uid()
  ));

-- ============================================================================
-- 4. PARENT_STUDENT_LINKS: parents see their links; org users see all
-- ============================================================================
DROP POLICY IF EXISTS "Parents view own links" ON parent_student_links;
CREATE POLICY "Parents view own links"
  ON parent_student_links FOR SELECT
  USING (parent_id = auth.uid());

DROP POLICY IF EXISTS "Org users view links" ON parent_student_links;
CREATE POLICY "Org users view links"
  ON parent_student_links FOR SELECT
  USING (student_id IN (
    SELECT id FROM students WHERE organisation_id IN (
      SELECT organisation_id FROM users WHERE id = auth.uid()
    )
  ));

-- ============================================================================
-- 5. CLASSES: users in org can view; management can manage
-- ============================================================================
DROP POLICY IF EXISTS "Users view classes in their org" ON classes;
CREATE POLICY "Users view classes in their org"
  ON classes FOR SELECT
  USING (organisation_id IN (
    SELECT organisation_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Management manage classes" ON classes;
CREATE POLICY "Management manage classes"
  ON classes FOR ALL
  USING (organisation_id IN (
    SELECT organisation_id FROM users WHERE id = auth.uid() AND role = 'management'
  ));

-- ============================================================================
-- 6. SUBJECTS: users in org can view
-- ============================================================================
DROP POLICY IF EXISTS "Users view subjects in their org" ON subjects;
CREATE POLICY "Users view subjects in their org"
  ON subjects FOR SELECT
  USING (organisation_id IN (
    SELECT organisation_id FROM users WHERE id = auth.uid()
  ));

-- ============================================================================
-- 7. EXAMS (no class_id column — use org isolation)
-- ============================================================================
DROP POLICY IF EXISTS "Users view exams in their org" ON exams;
CREATE POLICY "Users view exams in their org"
  ON exams FOR SELECT
  USING (organisation_id IN (
    SELECT organisation_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Management manage exams" ON exams;
CREATE POLICY "Management manage exams"
  ON exams FOR ALL
  USING (organisation_id IN (
    SELECT organisation_id FROM users WHERE id = auth.uid() AND role = 'management'
  ));

-- ============================================================================
-- 8. EXAM_SCHEDULES: org isolation
-- ============================================================================
ALTER TABLE IF EXISTS exam_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view exam schedules in their org" ON exam_schedules;
CREATE POLICY "Users view exam schedules in their org"
  ON exam_schedules FOR SELECT
  USING (organisation_id IN (
    SELECT organisation_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Management manage exam schedules" ON exam_schedules;
CREATE POLICY "Management manage exam schedules"
  ON exam_schedules FOR ALL
  USING (organisation_id IN (
    SELECT organisation_id FROM users WHERE id = auth.uid() AND role = 'management'
  ));

-- ============================================================================
-- 9. EXAM_RESULTS: students view own; parents view linked; management views all
-- ============================================================================
DROP POLICY IF EXISTS "Students view own exam results" ON exam_results;
CREATE POLICY "Students view own exam results"
  ON exam_results FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Parents view linked student results" ON exam_results;
CREATE POLICY "Parents view linked student results"
  ON exam_results FOR SELECT
  USING (student_id IN (
    SELECT ps.student_id FROM parent_student_links ps WHERE ps.parent_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Management view org exam results" ON exam_results;
CREATE POLICY "Management view org exam results"
  ON exam_results FOR SELECT
  USING (exam_id IN (
    SELECT e.id FROM exams e
    WHERE e.organisation_id IN (
      SELECT organisation_id FROM users WHERE id = auth.uid() AND role = 'management'
    )
  ));

-- ============================================================================
-- 10. ASSIGNMENTS: org + staff self isolation
-- ============================================================================
DROP POLICY IF EXISTS "Users view assignments in their org" ON assignments;
CREATE POLICY "Users view assignments in their org"
  ON assignments FOR SELECT
  USING (organisation_id IN (
    SELECT organisation_id FROM users WHERE id = auth.uid()
  ));

DROP POLICY IF EXISTS "Staff manage own assignments" ON assignments;
CREATE POLICY "Staff manage own assignments"
  ON assignments FOR ALL
  USING (teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid()));

-- ============================================================================
-- 11. ASSIGNMENT_SUBMISSIONS: students view own; staff view assignment
-- ============================================================================
DROP POLICY IF EXISTS "Students view own submissions" ON assignment_submissions;
CREATE POLICY "Students view own submissions"
  ON assignment_submissions FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Students create own submissions" ON assignment_submissions;
CREATE POLICY "Students create own submissions"
  ON assignment_submissions FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Staff view submissions for their assignments" ON assignment_submissions;
CREATE POLICY "Staff view submissions for their assignments"
  ON assignment_submissions FOR SELECT
  USING (assignment_id IN (
    SELECT a.id FROM assignments a
    WHERE a.teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
  ));

-- ============================================================================
-- 12. FEE_STRUCTURES: management manages; users in org view
-- ============================================================================
DROP POLICY IF EXISTS "Management manage fee structures" ON fee_structures;
CREATE POLICY "Management manage fee structures"
  ON fee_structures FOR ALL
  USING (organisation_id IN (
    SELECT organisation_id FROM users WHERE id = auth.uid() AND role = 'management'
  ));

DROP POLICY IF EXISTS "Users view fee structures in their org" ON fee_structures;
CREATE POLICY "Users view fee structures in their org"
  ON fee_structures FOR SELECT
  USING (organisation_id IN (
    SELECT organisation_id FROM users WHERE id = auth.uid()
  ));

-- ============================================================================
-- 13. FEE_PAYMENTS: students view own; parents view linked; management view org
-- ============================================================================
DROP POLICY IF EXISTS "Students view own fee payments" ON fee_payments;
CREATE POLICY "Students view own fee payments"
  ON fee_payments FOR SELECT
  USING (student_id IN (SELECT id FROM students WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Parents view linked student payments" ON fee_payments;
CREATE POLICY "Parents view linked student payments"
  ON fee_payments FOR SELECT
  USING (student_id IN (
    SELECT ps.student_id FROM parent_student_links ps WHERE ps.parent_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Management view org fee payments" ON fee_payments;
CREATE POLICY "Management view org fee payments"
  ON fee_payments FOR SELECT
  USING (organisation_id IN (
    SELECT organisation_id FROM users WHERE id = auth.uid() AND role = 'management'
  ));

-- ============================================================================
-- 14. STUDENT_FEES (org view for users in org)
-- ============================================================================
ALTER TABLE IF EXISTS student_fees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view student fees in their org" ON student_fees;
CREATE POLICY "Users view student fees in their org"
  ON student_fees FOR SELECT
  USING (organisation_id IN (
    SELECT organisation_id FROM users WHERE id = auth.uid()
  ));

-- ============================================================================
-- 15. NOTIFICATIONS (user-level)
-- ============================================================================
DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
CREATE POLICY "Users view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());
