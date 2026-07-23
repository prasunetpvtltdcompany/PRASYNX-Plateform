-- Prasunet School Management System - Full Database Schema
-- Run this in Supabase SQL Editor

-- 1. ORGANISATIONS
CREATE TABLE IF NOT EXISTS organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS (auth + profile)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','management','staff','teacher','student','parent','jobprovider')),
  phone TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CLASSES
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  section TEXT,
  grade_level TEXT,
  capacity INT DEFAULT 30,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUBJECTS
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TEACHERS
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  teacher_code TEXT UNIQUE NOT NULL,
  staff_unique_id TEXT,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  subject TEXT,
  assigned_class UUID REFERENCES classes(id) ON DELETE SET NULL,
  qualification TEXT,
  join_date DATE,
  department TEXT,
  designation TEXT,
  experience_years INT,
  gender TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  salary NUMERIC(10,2),
  employment_type TEXT,
  reporting_manager TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. STUDENTS
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  roll_number TEXT,
  student_class UUID REFERENCES classes(id) ON DELETE SET NULL,
  section TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  parent_name TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  blood_group TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TIMETABLE
CREATE TABLE IF NOT EXISTS timetable_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present','absent','late','excused')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- 9. EXAMS
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  exam_type TEXT CHECK (exam_type IN ('midterm','final','quiz','unit_test','practical')),
  start_date DATE,
  end_date DATE,
  max_marks INT DEFAULT 100,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EXAM SCHEDULES
CREATE TABLE IF NOT EXISTS exam_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  date DATE,
  start_time TIME,
  end_time TIME,
  room TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. EXAM RESULTS / MARKS
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  marks_obtained NUMERIC(5,2),
  max_marks NUMERIC(5,2) DEFAULT 100,
  grade TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exam_id, student_id, subject_id)
);

-- 12. ASSIGNMENTS
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  max_score NUMERIC(5,2) DEFAULT 100,
  file_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ASSIGNMENT SUBMISSIONS
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  submission_text TEXT,
  file_url TEXT,
  grade NUMERIC(5,2),
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft','submitted','graded')),
  UNIQUE(assignment_id, student_id)
);

-- 14. LIBRARY BOOKS
CREATE TABLE IF NOT EXISTS library_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT,
  category TEXT,
  publisher TEXT,
  publish_year INT,
  copies_total INT DEFAULT 1,
  copies_available INT DEFAULT 1,
  shelf_location TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. LIBRARY ISSUES
CREATE TABLE IF NOT EXISTS library_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  book_id UUID REFERENCES library_books(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  issued_by UUID REFERENCES teachers(id) ON DELETE SET NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  status TEXT DEFAULT 'issued' CHECK (status IN ('issued','returned','overdue','lost')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. FEES
CREATE TABLE IF NOT EXISTS fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  academic_year TEXT,
  total_amount NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE SET NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  paid_amount NUMERIC(10,2) DEFAULT 0,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','partial','paid','overdue','waived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  student_fee_id UUID REFERENCES student_fees(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  amount_paid NUMERIC(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash','card','bank_transfer','online','cheque')),
  transaction_id TEXT,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  receipt_url TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending','completed','failed','refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_role TEXT,
  target_class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. EVENTS
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('academic','sports','cultural','meeting','holiday','other')),
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  location TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. TRANSPORT
CREATE TABLE IF NOT EXISTS transport_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  route_name TEXT NOT NULL,
  start_point TEXT,
  end_point TEXT,
  stops JSONB,
  distance NUMERIC(8,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  vehicle_number TEXT NOT NULL,
  route_id UUID REFERENCES transport_routes(id) ON DELETE SET NULL,
  driver_name TEXT,
  driver_phone TEXT,
  capacity INT DEFAULT 40,
  vehicle_type TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES transport_vehicles(id) ON DELETE CASCADE,
  route_id UUID REFERENCES transport_routes(id) ON DELETE SET NULL,
  pickup_point TEXT,
  drop_point TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id)
);

-- 20. HOSTEL
CREATE TABLE IF NOT EXISTS hostel_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  capacity INT DEFAULT 2,
  floor INT,
  building TEXT,
  room_type TEXT CHECK (room_type IN ('single','double','triple','dormitory')),
  monthly_rent NUMERIC(10,2),
  status TEXT DEFAULT 'available' CHECK (status IN ('available','occupied','maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hostel_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  room_id UUID REFERENCES hostel_rooms(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_out_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. PARENT-STUDENT LINKS
CREATE TABLE IF NOT EXISTS parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  relationship TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- 22. MESSAGES
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT,
  message TEXT NOT NULL,
  file_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. GRADES
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject TEXT,
  grade TEXT,
  score NUMERIC(5,2),
  semester TEXT,
  academic_year TEXT,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. SCHOLARSHIPS
CREATE TABLE IF NOT EXISTS scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT,
  amount NUMERIC(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','active','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. CLUBS
CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  coordinator TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. CAREER SESSIONS
CREATE TABLE IF NOT EXISTS career_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  speaker TEXT,
  session_date DATE,
  session_time TIME,
  location TEXT,
  max_participants INT,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. CANTEEN
CREATE TABLE IF NOT EXISTS canteen_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  balance NUMERIC(10,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id)
);

CREATE TABLE IF NOT EXISTS canteen_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  order_items JSONB,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','preparing','ready','delivered','cancelled')),
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. HEALTH
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  record_type TEXT CHECK (record_type IN ('checkup','medication','vaccination','condition','allergy','injury')),
  title TEXT NOT NULL,
  description TEXT,
  value TEXT,
  recorded_by TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 29. PART-TIME JOBS
CREATE TABLE IF NOT EXISTS part_time_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('on_campus','off_campus','remote')),
  area TEXT,
  pay_type TEXT CHECK (pay_type IN ('hourly','monthly','fixed')),
  pay_amount NUMERIC(10,2),
  duration TEXT,
  slots INT DEFAULT 1,
  skills TEXT,
  contact_info TEXT,
  target_role TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','closed','filled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS part_time_job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES part_time_jobs(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  applicant_name TEXT,
  applicant_email TEXT,
  applicant_type TEXT,
  phone TEXT,
  cover_note TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','shortlisted','accepted','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 30. LEAVE APPLICATIONS
CREATE TABLE IF NOT EXISTS leave_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  leave_type TEXT CHECK (leave_type IN ('sick','casual','annual','personal','maternity','other')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 31. COMPLAINTS / TICKETS
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  filed_by UUID REFERENCES users(id) ON DELETE CASCADE,
  complaint_type TEXT,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 32. DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  document_type TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 33. QR SESSIONS (for attendance)
CREATE TABLE IF NOT EXISTS qr_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject TEXT,
  period TEXT,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 34. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info','warning','error','critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 35. CLASS → SUBJECT → TEACHER mapping
CREATE TABLE IF NOT EXISTS class_subject_teacher_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, subject_id, teacher_id)
);

-- 36. PAYROLL
CREATE TABLE IF NOT EXISTS payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
  payroll_month TEXT NOT NULL,
  gross_amount NUMERIC(10,2) NOT NULL,
  deductions NUMERIC(10,2) DEFAULT 0,
  net_amount NUMERIC(10,2) NOT NULL,
  payment_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 37. LEDGER
CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  entry_type TEXT CHECK (entry_type IN ('income','expense')),
  category TEXT,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_type TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organisation_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(student_class);
CREATE INDEX IF NOT EXISTS idx_students_org ON students(organisation_id);
CREATE INDEX IF NOT EXISTS idx_teachers_org ON teachers(organisation_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam ON exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id);
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
