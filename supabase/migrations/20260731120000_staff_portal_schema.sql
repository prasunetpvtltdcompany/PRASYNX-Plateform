-- Staff Portal schema: attendance, leave, tasks, payroll, and related WOS tables.
-- Safe to run on existing projects (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- staff_attendance (canonical for staff portal + management WOS routes)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIME,
  check_out TIME,
  working_hours DECIMAL(5, 2),
  status TEXT NOT NULL DEFAULT 'Present',
  remarks TEXT,
  marked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organisation_id, staff_id, attendance_date)
);

ALTER TABLE public.staff_attendance ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE;
ALTER TABLE public.staff_attendance ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE;
ALTER TABLE public.staff_attendance ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.staff_attendance ADD COLUMN IF NOT EXISTS attendance_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.staff_attendance ADD COLUMN IF NOT EXISTS check_in TIME;
ALTER TABLE public.staff_attendance ADD COLUMN IF NOT EXISTS check_out TIME;
ALTER TABLE public.staff_attendance ADD COLUMN IF NOT EXISTS working_hours DECIMAL(5, 2);
ALTER TABLE public.staff_attendance ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Present';
ALTER TABLE public.staff_attendance ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE public.staff_attendance ADD COLUMN IF NOT EXISTS marked_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.staff_attendance ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.staff_attendance ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;
ALTER TABLE public.staff_attendance ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE public.staff_attendance ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.staff_attendance ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Legacy column from older workforce migration (`date` instead of `attendance_date`)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'staff_attendance' AND column_name = 'date'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'staff_attendance' AND column_name = 'attendance_date'
  ) THEN
    ALTER TABLE public.staff_attendance RENAME COLUMN date TO attendance_date;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'staff_attendance' AND column_name = 'date'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'staff_attendance' AND column_name = 'attendance_date'
  ) THEN
    UPDATE public.staff_attendance
    SET attendance_date = COALESCE(attendance_date, date)
    WHERE attendance_date IS NULL AND date IS NOT NULL;
  END IF;
END $$;

-- Ensure the unique constraint used by backend upsert (onConflict: 'organisation_id,staff_id,attendance_date')
-- Drop the legacy unique constraint from 0020 (UNIQUE(staff_id, date) / UNIQUE(staff_id, attendance_date)),
-- then add the canonical one only if no unique constraint covers those columns yet.
DO $$
DECLARE
  has_unique BOOLEAN;
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.staff_attendance'::regclass
      AND contype = 'u'
      AND conname IN ('staff_attendance_staff_id_date_key', 'staff_attendance_staff_id_attendance_date_key')
  ) THEN
    ALTER TABLE public.staff_attendance DROP CONSTRAINT IF EXISTS staff_attendance_staff_id_date_key;
    ALTER TABLE public.staff_attendance DROP CONSTRAINT IF EXISTS staff_attendance_staff_id_attendance_date_key;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_index i ON i.indexrelid = c.conindid
    WHERE c.conrelid = 'public.staff_attendance'::regclass AND c.contype = 'u'
      AND EXISTS (
        SELECT 1 FROM unnest(i.indkey::int2[]) WITH ORDINALITY AS cols(attnum, ord)
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = cols.attnum
        WHERE a.attname = 'organisation_id' AND cols.ord = 1
      )
      AND EXISTS (
        SELECT 1 FROM unnest(i.indkey::int2[]) WITH ORDINALITY AS cols(attnum, ord)
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = cols.attnum
        WHERE a.attname = 'staff_id' AND cols.ord = 2
      )
      AND EXISTS (
        SELECT 1 FROM unnest(i.indkey::int2[]) WITH ORDINALITY AS cols(attnum, ord)
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = cols.attnum
        WHERE a.attname = 'attendance_date' AND cols.ord = 3
      )
  ) INTO has_unique;

  IF NOT has_unique THEN
    ALTER TABLE public.staff_attendance
      ADD CONSTRAINT staff_attendance_org_staff_date_unique UNIQUE (organisation_id, staff_id, attendance_date);
  END IF;
END $$;

-- Normalize legacy UPPERCASE statuses from 0020 ('PRESENT','ABSENT','ON_LEAVE','LATE','HALF_DAY') to
-- the title-case values used by the app ('Present','Absent','Late','Leave', etc.).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.staff_attendance'::regclass AND conname = 'staff_attendance_status_check'
  ) THEN
    UPDATE public.staff_attendance SET status = INITCAP(REPLACE(status, '_', ' ')) WHERE status IS NOT NULL;
    ALTER TABLE public.staff_attendance DROP CONSTRAINT IF EXISTS staff_attendance_status_check;
  END IF;
END $$;

-- Sync organization_id from organisation_id for existing rows
UPDATE public.staff_attendance SET organization_id = organisation_id WHERE organization_id IS NULL AND organisation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_staff_attendance_org ON public.staff_attendance(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff ON public.staff_attendance(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_date ON public.staff_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_org_date ON public.staff_attendance(organisation_id, attendance_date);

-- ---------------------------------------------------------------------------
-- staff_attendance_corrections
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_attendance_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  attendance_id UUID REFERENCES public.staff_attendance(id) ON DELETE CASCADE,
  original_status TEXT,
  requested_status TEXT,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_attendance_corrections_org ON public.staff_attendance_corrections(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_corrections_staff ON public.staff_attendance_corrections(staff_id);

-- ---------------------------------------------------------------------------
-- staff_leave_balance
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_leave_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 0,
  used_days INTEGER NOT NULL DEFAULT 0,
  pending_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (staff_id, leave_type)
);

CREATE INDEX IF NOT EXISTS idx_staff_leave_balance_org ON public.staff_leave_balance(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_leave_balance_staff ON public.staff_leave_balance(staff_id);

-- ---------------------------------------------------------------------------
-- staff_leave_requests
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL DEFAULT 'CASUAL',
  from_date DATE,
  to_date DATE,
  start_date DATE,
  end_date DATE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.staff_leave_requests ADD COLUMN IF NOT EXISTS from_date DATE;
ALTER TABLE public.staff_leave_requests ADD COLUMN IF NOT EXISTS to_date DATE;
ALTER TABLE public.staff_leave_requests ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.staff_leave_requests ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.staff_leave_requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.staff_leave_requests ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_staff_leave_requests_org ON public.staff_leave_requests(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_leave_requests_staff ON public.staff_leave_requests(staff_id);

-- ---------------------------------------------------------------------------
-- staff_tasks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'BLOCKED', 'CANCELLED', 'OVERDUE')),
  deadline DATE,
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  assigned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  department_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_tasks_org ON public.staff_tasks(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_staff ON public.staff_tasks(staff_id);

-- ---------------------------------------------------------------------------
-- staff_documents
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  document_name TEXT,
  title TEXT,
  description TEXT,
  file_url TEXT,
  document_type TEXT DEFAULT 'VERIFICATION',
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  folder TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.staff_documents ADD COLUMN IF NOT EXISTS document_name TEXT;
ALTER TABLE public.staff_documents ADD COLUMN IF NOT EXISTS title TEXT;

CREATE INDEX IF NOT EXISTS idx_staff_documents_org ON public.staff_documents(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_documents_staff ON public.staff_documents(staff_id);

-- ---------------------------------------------------------------------------
-- staff_payroll + staff_payslips
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  base_salary DECIMAL(12, 2) DEFAULT 0,
  allowances DECIMAL(12, 2) DEFAULT 0,
  deductions DECIMAL(12, 2) DEFAULT 0,
  net_salary DECIMAL(12, 2) DEFAULT 0,
  pay_frequency TEXT DEFAULT 'MONTHLY',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organisation_id, staff_id)
);

CREATE TABLE IF NOT EXISTS public.staff_payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  gross_pay DECIMAL(12, 2) DEFAULT 0,
  deductions DECIMAL(12, 2) DEFAULT 0,
  net_pay DECIMAL(12, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'CANCELLED')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_payroll_org ON public.staff_payroll(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_payslips_org ON public.staff_payslips(organisation_id);
CREATE INDEX IF NOT EXISTS idx_staff_payslips_staff ON public.staff_payslips(staff_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_leave_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_payslips ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF to_regprocedure('public.get_user_org_id()') IS NOT NULL THEN
    DROP POLICY IF EXISTS org_isolation ON public.staff_attendance;
    DROP POLICY IF EXISTS staff_portal_org_isolation ON public.staff_attendance;
    CREATE POLICY staff_portal_org_isolation ON public.staff_attendance
      FOR ALL USING (organisation_id = public.get_user_org_id())
      WITH CHECK (organisation_id = public.get_user_org_id());

    DROP POLICY IF EXISTS org_isolation ON public.staff_attendance_corrections;
    DROP POLICY IF EXISTS staff_portal_org_isolation ON public.staff_attendance_corrections;
    CREATE POLICY staff_portal_org_isolation ON public.staff_attendance_corrections
      FOR ALL USING (organisation_id = public.get_user_org_id())
      WITH CHECK (organisation_id = public.get_user_org_id());

    DROP POLICY IF EXISTS staff_portal_org_isolation ON public.staff_leave_balance;
    CREATE POLICY staff_portal_org_isolation ON public.staff_leave_balance
      FOR ALL USING (organisation_id = public.get_user_org_id())
      WITH CHECK (organisation_id = public.get_user_org_id());

    DROP POLICY IF EXISTS staff_portal_org_isolation ON public.staff_leave_requests;
    CREATE POLICY staff_portal_org_isolation ON public.staff_leave_requests
      FOR ALL USING (organisation_id = public.get_user_org_id())
      WITH CHECK (organisation_id = public.get_user_org_id());

    DROP POLICY IF EXISTS staff_portal_org_isolation ON public.staff_tasks;
    CREATE POLICY staff_portal_org_isolation ON public.staff_tasks
      FOR ALL USING (organisation_id = public.get_user_org_id())
      WITH CHECK (organisation_id = public.get_user_org_id());

    DROP POLICY IF EXISTS staff_portal_org_isolation ON public.staff_documents;
    CREATE POLICY staff_portal_org_isolation ON public.staff_documents
      FOR ALL USING (organisation_id = public.get_user_org_id())
      WITH CHECK (organisation_id = public.get_user_org_id());

    DROP POLICY IF EXISTS staff_portal_org_isolation ON public.staff_payroll;
    CREATE POLICY staff_portal_org_isolation ON public.staff_payroll
      FOR ALL USING (organisation_id = public.get_user_org_id())
      WITH CHECK (organisation_id = public.get_user_org_id());

    DROP POLICY IF EXISTS staff_portal_org_isolation ON public.staff_payslips;
    CREATE POLICY staff_portal_org_isolation ON public.staff_payslips
      FOR ALL USING (organisation_id = public.get_user_org_id())
      WITH CHECK (organisation_id = public.get_user_org_id());
  END IF;
END $$;
