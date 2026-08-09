-- ============================================================================
-- ADMISSION MODULE TABLES
-- ============================================================================
-- Purpose: Admission applications, enquiries, and waiting list tables
--          for the management portal admission module.
-- ============================================================================

-- ============================================================================
-- TABLE: admission_applications (legacy — used by /api/management/admission/*)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admission_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id),
  applicant_name TEXT,
  applicant_email TEXT,
  phone TEXT,
  applying_class TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admission_applications_org ON public.admission_applications(organisation_id);
CREATE INDEX IF NOT EXISTS idx_admission_applications_status ON public.admission_applications(status);

-- ============================================================================
-- TABLE: admission_enquiries (legacy — used by /api/management/admission/*)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admission_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id),
  name TEXT,
  email TEXT,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admission_enquiries_org ON public.admission_enquiries(organisation_id);

-- ============================================================================
-- TABLE: admissions (new — used by /api/admission-management/*)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  class_applying TEXT,
  academic_year TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admissions_org_id ON public.admissions(organisation_id);
CREATE INDEX IF NOT EXISTS idx_admissions_status ON public.admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_org_status ON public.admissions(organisation_id, status);
CREATE INDEX IF NOT EXISTS idx_admissions_student_id ON public.admissions(student_id);

-- ============================================================================
-- TABLE: enquiries
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  parent_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  child_name TEXT,
  child_class TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  follow_up_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_org_id ON public.enquiries(organisation_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);

-- ============================================================================
-- TABLE: waiting_list
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.waiting_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  class TEXT,
  parent_name TEXT,
  phone TEXT,
  email TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waiting_list_org_id ON public.waiting_list(organisation_id);
CREATE INDEX IF NOT EXISTS idx_waiting_list_position ON public.waiting_list(organisation_id, position);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_admissions_updated_at ON public.admissions;
CREATE TRIGGER set_admissions_updated_at
  BEFORE UPDATE ON public.admissions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_enquiries_updated_at ON public.enquiries;
CREATE TRIGGER set_enquiries_updated_at
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_waiting_list_updated_at ON public.waiting_list;
CREATE TRIGGER set_waiting_list_updated_at
  BEFORE UPDATE ON public.waiting_list
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- AUTO-SET POSITION ON WAITING LIST INSERT
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_waiting_list_position()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.position IS NULL OR NEW.position = 0 THEN
    SELECT COALESCE(MAX(wl.position), 0) + 1 INTO NEW.position
    FROM public.waiting_list wl
    WHERE wl.organisation_id = NEW.organisation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_waiting_list_position ON public.waiting_list;
CREATE TRIGGER set_waiting_list_position
  BEFORE INSERT ON public.waiting_list
  FOR EACH ROW
  EXECUTE FUNCTION public.set_waiting_list_position();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.admission_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiting_list ENABLE ROW LEVEL SECURITY;

-- admission_applications policies
DROP POLICY IF EXISTS "Users can view admission_applications in their org" ON public.admission_applications;
CREATE POLICY "Users can view admission_applications in their org"
  ON public.admission_applications FOR SELECT
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert admission_applications in their org" ON public.admission_applications;
CREATE POLICY "Users can insert admission_applications in their org"
  ON public.admission_applications FOR INSERT
  WITH CHECK (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update admission_applications in their org" ON public.admission_applications;
CREATE POLICY "Users can update admission_applications in their org"
  ON public.admission_applications FOR UPDATE
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete admission_applications in their org" ON public.admission_applications;
CREATE POLICY "Users can delete admission_applications in their org"
  ON public.admission_applications FOR DELETE
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

-- admission_enquiries policies
DROP POLICY IF EXISTS "Users can view admission_enquiries in their org" ON public.admission_enquiries;
CREATE POLICY "Users can view admission_enquiries in their org"
  ON public.admission_enquiries FOR SELECT
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert admission_enquiries in their org" ON public.admission_enquiries;
CREATE POLICY "Users can insert admission_enquiries in their org"
  ON public.admission_enquiries FOR INSERT
  WITH CHECK (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update admission_enquiries in their org" ON public.admission_enquiries;
CREATE POLICY "Users can update admission_enquiries in their org"
  ON public.admission_enquiries FOR UPDATE
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete admission_enquiries in their org" ON public.admission_enquiries;
CREATE POLICY "Users can delete admission_enquiries in their org"
  ON public.admission_enquiries FOR DELETE
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

-- admissions policies
DROP POLICY IF EXISTS "Users can view admissions in their org" ON public.admissions;
CREATE POLICY "Users can view admissions in their org"
  ON public.admissions FOR SELECT
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert admissions in their org" ON public.admissions;
CREATE POLICY "Users can insert admissions in their org"
  ON public.admissions FOR INSERT
  WITH CHECK (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update admissions in their org" ON public.admissions;
CREATE POLICY "Users can update admissions in their org"
  ON public.admissions FOR UPDATE
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete admissions in their org" ON public.admissions;
CREATE POLICY "Users can delete admissions in their org"
  ON public.admissions FOR DELETE
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

-- enquiries policies
DROP POLICY IF EXISTS "Users can view enquiries in their org" ON public.enquiries;
CREATE POLICY "Users can view enquiries in their org"
  ON public.enquiries FOR SELECT
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert enquiries in their org" ON public.enquiries;
CREATE POLICY "Users can insert enquiries in their org"
  ON public.enquiries FOR INSERT
  WITH CHECK (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update enquiries in their org" ON public.enquiries;
CREATE POLICY "Users can update enquiries in their org"
  ON public.enquiries FOR UPDATE
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete enquiries in their org" ON public.enquiries;
CREATE POLICY "Users can delete enquiries in their org"
  ON public.enquiries FOR DELETE
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

-- waiting_list policies
DROP POLICY IF EXISTS "Users can view waiting list in their org" ON public.waiting_list;
CREATE POLICY "Users can view waiting list in their org"
  ON public.waiting_list FOR SELECT
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert waiting list entries in their org" ON public.waiting_list;
CREATE POLICY "Users can insert waiting list entries in their org"
  ON public.waiting_list FOR INSERT
  WITH CHECK (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update waiting list entries in their org" ON public.waiting_list;
CREATE POLICY "Users can update waiting list entries in their org"
  ON public.waiting_list FOR UPDATE
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete waiting list entries in their org" ON public.waiting_list;
CREATE POLICY "Users can delete waiting list entries in their org"
  ON public.waiting_list FOR DELETE
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));
