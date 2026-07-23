-- Fix: Create tables referenced by APIs but missing from schema
-- Run this in Supabase SQL Editor

-- Attendance (used by staff, student, parents backends - distinct from attendance_records)
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  period TEXT,
  remarks TEXT,
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_org ON public.attendance(organisation_id);

-- Teacher-Student mapping
CREATE TABLE IF NOT EXISTS public.teacher_student_map (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, student_id, class_id, subject_id)
);

-- Fees (used by staff backend)
CREATE TABLE IF NOT EXISTS public.fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  fee_structure_id UUID REFERENCES public.fee_structures(id) ON DELETE SET NULL,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'overdue')),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Books (used by staff librarian)
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT UNIQUE,
  publisher TEXT,
  category TEXT,
  total_copies INTEGER DEFAULT 1,
  available_copies INTEGER DEFAULT 1,
  shelf_location TEXT,
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Book Issues
CREATE TABLE IF NOT EXISTS public.book_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'overdue', 'lost')),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Exam Questions
CREATE TABLE IF NOT EXISTS public.exam_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'text' CHECK (question_type IN ('text', 'mcq', 'true_false', 'fill_blanks')),
  options JSONB,
  correct_answer TEXT,
  marks INTEGER DEFAULT 1,
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Exam Submissions
CREATE TABLE IF NOT EXISTS public.exam_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  answers JSONB,
  total_marks DECIMAL(10,2),
  obtained_marks DECIMAL(10,2),
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded', 'reviewed')),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  UNIQUE(exam_id, student_id)
);

-- Vaccinations
CREATE TABLE IF NOT EXISTS public.vaccinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  vaccination_date DATE,
  next_due_date DATE,
  administered_by TEXT,
  notes TEXT,
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Health Medical Records
CREATE TABLE IF NOT EXISTS public.health_medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL,
  diagnosis TEXT,
  treatment TEXT,
  medication TEXT,
  doctor_name TEXT,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Health Emergency Contacts
CREATE TABLE IF NOT EXISTS public.health_emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT,
  alternate_phone TEXT,
  address TEXT,
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bus Locations (parents portal)
CREATE TABLE IF NOT EXISTS public.bus_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bus_id UUID,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  timestamp TIMESTAMPTZ DEFAULT now(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE
);

-- Helpdesk Tickets (management)
CREATE TABLE IF NOT EXISTS public.helpdesk_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Credential History
CREATE TABLE IF NOT EXISTS public.credential_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT,
  action TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- GCC Impersonation Logs
CREATE TABLE IF NOT EXISTS public.gcc_impersonation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  impersonated_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  action TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- GCC Audit Logs
CREATE TABLE IF NOT EXISTS public.gcc_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Provider Messages (job provider)
CREATE TABLE IF NOT EXISTS public.provider_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  receiver_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_student_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpdesk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gcc_impersonation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gcc_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_messages ENABLE ROW LEVEL SECURITY;

-- Basic org-scoped RLS policies
CREATE POLICY "Org-scoped access" ON public.attendance FOR ALL USING (organisation_id IN (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org-scoped access" ON public.teacher_student_map FOR ALL USING (organisation_id IN (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org-scoped access" ON public.fees FOR ALL USING (organisation_id IN (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org-scoped access" ON public.books FOR ALL USING (organisation_id IN (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org-scoped access" ON public.book_issues FOR ALL USING (organisation_id IN (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org-scoped access" ON public.exam_questions FOR ALL USING (organisation_id IN (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org-scoped access" ON public.exam_submissions FOR ALL USING (organisation_id IN (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org-scoped access" ON public.vaccinations FOR ALL USING (organisation_id IN (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org-scoped access" ON public.health_medical_records FOR ALL USING (organisation_id IN (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org-scoped access" ON public.health_emergency_contacts FOR ALL USING (organisation_id IN (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org-scoped access" ON public.bus_locations FOR ALL USING (organisation_id IN (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org-scoped access" ON public.helpdesk_tickets FOR ALL USING (organisation_id IN (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org-scoped access" ON public.credential_history FOR ALL USING (organisation_id IN (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org-scoped access" ON public.gcc_impersonation_logs FOR ALL USING (organisation_id IN (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org-scoped access" ON public.gcc_audit_logs FOR ALL USING (organisation_id IN (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org-scoped access" ON public.feedback FOR ALL USING (organisation_id IN (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
CREATE POLICY "Org-scoped access" ON public.provider_messages FOR ALL USING (organisation_id IN (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
