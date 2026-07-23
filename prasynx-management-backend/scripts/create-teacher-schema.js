const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.axwhtngxveaidbscsrca:Prasunet123*@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to DB. Starting Teacher Workforce tables migration...');

  const query = `
    -- 1. Create teacher_assignments
    CREATE TABLE IF NOT EXISTS public.teacher_assignments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
      assignment_type TEXT NOT NULL, -- 'ACADEMIC', 'CLASS_TEACHER', 'EXAM', 'CLUB', 'EVENT', 'HOUSE', 'MENTORSHIP', 'COMMITTEE'
      assignment_name TEXT NOT NULL, -- e.g. "Grade 5A", "Debate Club"
      target_id TEXT,
      details JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 2. Create teacher_classes
    CREATE TABLE IF NOT EXISTS public.teacher_classes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
      class_id UUID,
      section_id UUID,
      class_name TEXT NOT NULL,
      section_name TEXT NOT NULL,
      student_count INT DEFAULT 25,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 3. Create teacher_subjects
    CREATE TABLE IF NOT EXISTS public.teacher_subjects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
      subject_id UUID,
      subject_name TEXT NOT NULL,
      class_name TEXT NOT NULL,
      average_score NUMERIC(5,2) DEFAULT 78.5,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 4. Create teacher_homework
    CREATE TABLE IF NOT EXISTS public.teacher_homework (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
      class_name TEXT NOT NULL,
      subject_name TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      due_date DATE NOT NULL,
      attachments JSONB DEFAULT '[]'::jsonb,
      status TEXT DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'COMPLETED')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 5. Create teacher_assignments_submissions
    CREATE TABLE IF NOT EXISTS public.teacher_assignments_submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      assignment_id UUID NOT NULL REFERENCES public.teacher_homework(id) ON DELETE CASCADE,
      student_id UUID,
      student_name TEXT NOT NULL,
      submitted_at TIMESTAMPTZ DEFAULT NOW(),
      status TEXT DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'GRADED', 'LATE')),
      submission_url TEXT,
      grade TEXT,
      feedback TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 6. Create teacher_attendance
    CREATE TABLE IF NOT EXISTS public.teacher_attendance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
      class_name TEXT NOT NULL,
      student_id UUID,
      student_name TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE')),
      attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
      remarks TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 7. Create teacher_exams
    CREATE TABLE IF NOT EXISTS public.teacher_exams (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
      exam_name TEXT NOT NULL,
      class_name TEXT NOT NULL,
      subject_name TEXT NOT NULL,
      exam_date DATE NOT NULL,
      max_marks INT NOT NULL,
      status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 8. Create teacher_marks
    CREATE TABLE IF NOT EXISTS public.teacher_marks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      exam_id UUID NOT NULL REFERENCES public.teacher_exams(id) ON DELETE CASCADE,
      student_id UUID,
      student_name TEXT NOT NULL,
      marks_obtained NUMERIC(5,2) NOT NULL,
      remarks TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 9. Create teacher_ptm
    CREATE TABLE IF NOT EXISTS public.teacher_ptm (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
      parent_name TEXT NOT NULL,
      student_name TEXT NOT NULL,
      meeting_date DATE NOT NULL,
      time_slot TEXT NOT NULL,
      status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 10. Create teacher_resources
    CREATE TABLE IF NOT EXISTS public.teacher_resources (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
      resource_name TEXT NOT NULL,
      resource_type TEXT NOT NULL CHECK (resource_type IN ('PDF', 'VIDEO', 'PPT', 'NOTES')),
      subject_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 11. Create teacher_tasks
    CREATE TABLE IF NOT EXISTS public.teacher_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'OVERDUE')),
      deadline DATE NOT NULL,
      priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 12. Create teacher_performance
    CREATE TABLE IF NOT EXISTS public.teacher_performance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
      metric_name TEXT NOT NULL,
      metric_value NUMERIC(5,2) NOT NULL,
      rating_period TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 13. Create teacher_communications
    CREATE TABLE IF NOT EXISTS public.teacher_communications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
      recipient_type TEXT NOT NULL CHECK (recipient_type IN ('PARENT', 'STUDENT', 'MANAGEMENT', 'COORDINATOR', 'TEACHER')),
      recipient_name TEXT NOT NULL,
      message_text TEXT NOT NULL,
      communication_type TEXT DEFAULT 'DIRECT' CHECK (communication_type IN ('DIRECT', 'BROADCAST', 'ALERT')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 14. Create teacher_notifications
    CREATE TABLE IF NOT EXISTS public.teacher_notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      notification_type TEXT NOT NULL,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 15. Create teacher_activity_logs
    CREATE TABLE IF NOT EXISTS public.teacher_activity_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
      teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      details JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Enable RLS on all 15 tables
    ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.teacher_homework ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.teacher_assignments_submissions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.teacher_attendance ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.teacher_exams ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.teacher_marks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.teacher_ptm ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.teacher_resources ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.teacher_tasks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.teacher_performance ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.teacher_communications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.teacher_notifications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.teacher_activity_logs ENABLE ROW LEVEL SECURITY;

    -- Drop existing org_isolation policies if they exist
    DROP POLICY IF EXISTS org_isolation ON public.teacher_assignments;
    DROP POLICY IF EXISTS org_isolation ON public.teacher_classes;
    DROP POLICY IF EXISTS org_isolation ON public.teacher_subjects;
    DROP POLICY IF EXISTS org_isolation ON public.teacher_homework;
    DROP POLICY IF EXISTS org_isolation ON public.teacher_assignments_submissions;
    DROP POLICY IF EXISTS org_isolation ON public.teacher_attendance;
    DROP POLICY IF EXISTS org_isolation ON public.teacher_exams;
    DROP POLICY IF EXISTS org_isolation ON public.teacher_marks;
    DROP POLICY IF EXISTS org_isolation ON public.teacher_ptm;
    DROP POLICY IF EXISTS org_isolation ON public.teacher_resources;
    DROP POLICY IF EXISTS org_isolation ON public.teacher_tasks;
    DROP POLICY IF EXISTS org_isolation ON public.teacher_performance;
    DROP POLICY IF EXISTS org_isolation ON public.teacher_communications;
    DROP POLICY IF EXISTS org_isolation ON public.teacher_notifications;
    DROP POLICY IF EXISTS org_isolation ON public.teacher_activity_logs;

    -- Re-create org_isolation policies based on public.get_user_org_id()
    CREATE POLICY org_isolation ON public.teacher_assignments FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.teacher_classes FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.teacher_subjects FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.teacher_homework FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.teacher_assignments_submissions FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.teacher_attendance FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.teacher_exams FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.teacher_marks FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.teacher_ptm FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.teacher_resources FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.teacher_tasks FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.teacher_performance FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.teacher_communications FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.teacher_notifications FOR ALL USING (organisation_id = public.get_user_org_id());
    CREATE POLICY org_isolation ON public.teacher_activity_logs FOR ALL USING (organisation_id = public.get_user_org_id());
  `;

  try {
    await client.query(query);
    console.log('Successfully created the 15 teacher workforce tables and set up RLS policies.');
    
    // Now let's seed realistic data for all teachers in public.teachers
    const teachersRes = await client.query('SELECT id, organisation_id, full_name FROM public.teachers');
    const teachers = teachersRes.rows;
    console.log(`Found ${teachers.length} teachers to seed.`);

    for (const teacher of teachers) {
      const tid = teacher.id;
      const oid = teacher.organisation_id;
      const name = teacher.full_name;

      console.log(`Seeding data for Teacher: ${name} (ID: ${tid})`);

      // 1. Seed teacher_assignments
      await client.query(`
        INSERT INTO public.teacher_assignments (organisation_id, teacher_id, assignment_type, assignment_name, details)
        VALUES 
          ($1, $2, 'ACADEMIC', 'Grade 5A - Mathematics', '{"subject": "Mathematics", "session": "2026-2027"}'),
          ($1, $2, 'ACADEMIC', 'Grade 5B - Mathematics', '{"subject": "Mathematics", "session": "2026-2027"}'),
          ($1, $2, 'ACADEMIC', 'Grade 6A - Science', '{"subject": "Science", "session": "2026-2027"}'),
          ($1, $2, 'CLASS_TEACHER', 'Grade 5A', '{"responsibilities": ["Attendance", "Parent Communication", "Student Discipline", "PTM Management", "Student Welfare"]}'),
          ($1, $2, 'EXAM', 'Exam Coordinator', '{"role": "Invigilator & Evaluator", "duties": ["Paper Setter", "Result Verification"]}'),
          ($1, $2, 'CLUB', 'Robotics Club', '{"role": "Club Mentor", "meeting_day": "Friday"}'),
          ($1, $2, 'EVENT', 'Annual Function 2026', '{"role": "Cultural Coordinator", "event_date": "2026-11-20"}'),
          ($1, $2, 'HOUSE', 'Blue House', '{"role": "House Warden", "duties": ["Mentorship"]}'),
          ($1, $2, 'MENTORSHIP', 'Counselling Group B', '{"duties": ["Weak Students Counseling"]}'),
          ($1, $2, 'COMMITTEE', 'Discipline Committee', '{"role": "Committee Lead"}')
        ON CONFLICT DO NOTHING;
      `, [oid, tid]);

      // 2. Seed teacher_classes
      await client.query(`
        INSERT INTO public.teacher_classes (organisation_id, teacher_id, class_name, section_name, student_count)
        VALUES 
          ($1, $2, 'Grade 5', 'A', 28),
          ($1, $2, 'Grade 5', 'B', 25),
          ($1, $2, 'Grade 6', 'A', 30)
        ON CONFLICT DO NOTHING;
      `, [oid, tid]);

      // 3. Seed teacher_subjects
      await client.query(`
        INSERT INTO public.teacher_subjects (organisation_id, teacher_id, subject_name, class_name, average_score)
        VALUES 
          ($1, $2, 'Mathematics', 'Grade 5A', 82.4),
          ($1, $2, 'Mathematics', 'Grade 5B', 79.1),
          ($1, $2, 'Science', 'Grade 6A', 85.5)
        ON CONFLICT DO NOTHING;
      `, [oid, tid]);

      // 4. Seed teacher_homework
      const hwRes = await client.query(`
        INSERT INTO public.teacher_homework (organisation_id, teacher_id, class_name, subject_name, title, description, due_date, status)
        VALUES 
          ($1, $2, 'Grade 5A', 'Mathematics', 'Fractions Practice Sheet', 'Solve questions 1 to 10 in Chapter 4.', CURRENT_DATE + INTERVAL '2 days', 'PUBLISHED'),
          ($1, $2, 'Grade 5B', 'Mathematics', 'Decimal Word Problems', 'Complete exercises on Page 122.', CURRENT_DATE + INTERVAL '3 days', 'PUBLISHED'),
          ($1, $2, 'Grade 6A', 'Science', 'Photosynthesis Diagram', 'Draw and label the process of photosynthesis.', CURRENT_DATE + INTERVAL '1 day', 'PUBLISHED')
        RETURNING id
      `, [oid, tid]);

      // 5. Seed teacher_assignments_submissions
      if (hwRes.rows.length > 0) {
        const hwId = hwRes.rows[0].id;
        await client.query(`
          INSERT INTO public.teacher_assignments_submissions (organisation_id, assignment_id, student_name, status, submission_url, grade, feedback)
          VALUES 
            ($1, $2, 'Aarav Sharma', 'GRADED', 'https://prasunetos.s3.amazonaws.com/submissions/aarav_hw1.pdf', 'A', 'Excellent diagram labeling!'),
            ($1, $2, 'Aditya Patel', 'SUBMITTED', 'https://prasunetos.s3.amazonaws.com/submissions/aditya_hw1.pdf', NULL, NULL),
            ($1, $2, 'Ananya Sen', 'LATE', 'https://prasunetos.s3.amazonaws.com/submissions/ananya_hw1.pdf', 'B', 'Submitted 3 hours late, good work.')
          ON CONFLICT DO NOTHING;
        `, [oid, hwId]);
      }

      // 6. Seed teacher_attendance
      await client.query(`
        INSERT INTO public.teacher_attendance (organisation_id, teacher_id, class_name, student_name, status, remarks)
        VALUES 
          ($1, $2, 'Grade 5A', 'Aarav Sharma', 'PRESENT', 'On time'),
          ($1, $2, 'Grade 5A', 'Aditya Patel', 'PRESENT', 'On time'),
          ($1, $2, 'Grade 5A', 'Ananya Sen', 'ABSENT', 'Informed leaves'),
          ($1, $2, 'Grade 5A', 'Vihaan Reddy', 'LATE', 'Late by 10 mins')
        ON CONFLICT DO NOTHING;
      `, [oid, tid]);

      // 7. Seed teacher_exams
      const examRes = await client.query(`
        INSERT INTO public.teacher_exams (organisation_id, teacher_id, exam_name, class_name, subject_name, exam_date, max_marks, status)
        VALUES 
          ($1, $2, 'Unit Test I', 'Grade 5A', 'Mathematics', CURRENT_DATE - INTERVAL '5 days', 50, 'COMPLETED'),
          ($1, $2, 'Mid-Term Exam', 'Grade 5A', 'Mathematics', CURRENT_DATE + INTERVAL '15 days', 100, 'SCHEDULED')
        RETURNING id
      `, [oid, tid]);

      // 8. Seed teacher_marks
      if (examRes.rows.length > 0) {
        const examId = examRes.rows[0].id;
        await client.query(`
          INSERT INTO public.teacher_marks (organisation_id, exam_id, student_name, marks_obtained, remarks)
          VALUES 
            ($1, $2, 'Aarav Sharma', 45.50, 'Top scorer'),
            ($1, $2, 'Aditya Patel', 38.00, 'Good logic'),
            ($1, $2, 'Ananya Sen', 42.00, 'Well written'),
            ($1, $2, 'Vihaan Reddy', 29.50, 'Needs improvement')
          ON CONFLICT DO NOTHING;
        `, [oid, examId]);
      }

      // 9. Seed teacher_ptm
      await client.query(`
        INSERT INTO public.teacher_ptm (organisation_id, teacher_id, parent_name, student_name, meeting_date, time_slot, status, notes)
        VALUES 
          ($1, $2, 'Mrs. Sharma', 'Aarav Sharma', CURRENT_DATE + INTERVAL '1 day', '10:00 AM - 10:15 AM', 'SCHEDULED', 'Discuss academic progress and extracurricular interests'),
          ($1, $2, 'Mr. Patel', 'Aditya Patel', CURRENT_DATE + INTERVAL '1 day', '10:15 AM - 10:30 AM', 'SCHEDULED', 'Review performance in maths and exam prep')
        ON CONFLICT DO NOTHING;
      `, [oid, tid]);

      // 10. Seed teacher_resources
      await client.query(`
        INSERT INTO public.teacher_resources (organisation_id, teacher_id, resource_name, resource_type, subject_name, file_url)
        VALUES 
          ($1, $2, 'Fractions Lecture Notes', 'PDF', 'Mathematics', 'https://prasunetos.s3.amazonaws.com/resources/fractions_notes.pdf'),
          ($1, $2, 'Introduction to Algebra Video', 'VIDEO', 'Mathematics', 'https://prasunetos.s3.amazonaws.com/resources/algebra_intro.mp4'),
          ($1, $2, 'Photosynthesis Slideshow', 'PPT', 'Science', 'https://prasunetos.s3.amazonaws.com/resources/photosynthesis.pptx')
        ON CONFLICT DO NOTHING;
      `, [oid, tid]);

      // 11. Seed teacher_tasks
      await client.query(`
        INSERT INTO public.teacher_tasks (organisation_id, teacher_id, title, description, status, deadline, priority)
        VALUES 
          ($1, $2, 'Complete Grade 5A Result Analysis', 'Submit the analysis sheet to the coordinator.', 'PENDING', CURRENT_DATE + INTERVAL '3 days', 'HIGH'),
          ($1, $2, 'Prepare Annual Function Report', 'Draft the cultural events report.', 'IN_PROGRESS', CURRENT_DATE + INTERVAL '5 days', 'MEDIUM'),
          ($1, $2, 'Conduct PTM Meeting', 'Complete parent-teacher meeting slots.', 'PENDING', CURRENT_DATE + INTERVAL '1 day', 'HIGH'),
          ($1, $2, 'Syllabus Planning for Term 2', 'Outline targets for the next term.', 'COMPLETED', CURRENT_DATE - INTERVAL '1 day', 'LOW')
        ON CONFLICT DO NOTHING;
      `, [oid, tid]);

      // 12. Seed teacher_performance
      await client.query(`
        INSERT INTO public.teacher_performance (organisation_id, teacher_id, metric_name, metric_value, rating_period)
        VALUES 
          ($1, $2, 'Attendance Completion %', 95.80, 'June 2026'),
          ($1, $2, 'Homework Completion %', 88.20, 'June 2026'),
          ($1, $2, 'Assignment Completion %', 91.50, 'June 2026'),
          ($1, $2, 'Student Result %', 85.00, 'June 2026'),
          ($1, $2, 'Parent Communication Score', 92.00, 'June 2026'),
          ($1, $2, 'PTM Participation', 96.00, 'June 2026'),
          ($1, $2, 'Teacher Rating', 4.80, 'June 2026'),
          ($1, $2, 'Workload Score', 85.00, 'June 2026')
        ON CONFLICT DO NOTHING;
      `, [oid, tid]);

      // 13. Seed teacher_communications
      await client.query(`
        INSERT INTO public.teacher_communications (organisation_id, teacher_id, recipient_type, recipient_name, message_text, communication_type)
        VALUES 
          ($1, $2, 'PARENT', 'Mrs. Sharma (Aarav)', 'Hello, Aarav has performed exceptionally well in the recent unit test. Keep up the good work!', 'DIRECT'),
          ($1, $2, 'PARENT', 'Mr. Patel (Aditya)', 'Reminder: The mathematics assignments are due tomorrow. Please ensure Aditya completes it.', 'DIRECT'),
          ($1, $2, 'PARENT', 'Grade 5A Parents', 'Dear Parents, PTM invites have been sent. Please book your slots.', 'BROADCAST')
        ON CONFLICT DO NOTHING;
      `, [oid, tid]);

      // 14. Seed teacher_notifications
      await client.query(`
        INSERT INTO public.teacher_notifications (organisation_id, teacher_id, title, message, notification_type, is_read)
        VALUES 
          ($1, $2, 'New Task Assigned', 'You have been assigned: Complete Grade 5A Result Analysis.', 'TASK', false),
          ($1, $2, 'PTM Slot Booked', 'Mrs. Sharma booked a meeting slot for tomorrow at 10:00 AM.', 'PTM', false),
          ($1, $2, 'Syllabus Update', 'Management has published the revised syllabus outline for Grade 5.', 'SYSTEM', true)
        ON CONFLICT DO NOTHING;
      `, [oid, tid]);

      // 15. Seed teacher_activity_logs
      await client.query(`
        INSERT INTO public.teacher_activity_logs (organisation_id, teacher_id, action, details)
        VALUES 
          ($1, $2, 'Marked Attendance', '{"class": "Grade 5A", "date": "2026-06-18"}'),
          ($1, $2, 'Published Homework', '{"title": "Fractions Practice Sheet", "subject": "Mathematics"}'),
          ($1, $2, 'Graded Submission', '{"student": "Aarav Sharma", "grade": "A"}')
        ON CONFLICT DO NOTHING;
      `, [oid, tid]);
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
