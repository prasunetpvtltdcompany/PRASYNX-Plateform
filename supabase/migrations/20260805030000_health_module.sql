-- ============================================================================
-- HEALTH MODULE — Student Health Records, Vaccinations, Medical Records, Emergency Contacts
-- ============================================================================
-- Backs the management Health module and the student/parent health uploads.
-- Idempotent + missing-table-safe.
-- ============================================================================

-- Health records (checkups, medications, conditions, allergies, injuries, vaccinations)
CREATE TABLE IF NOT EXISTS public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  record_type TEXT CHECK (record_type IN ('checkup','medication','vaccination','condition','allergy','injury')),
  title TEXT NOT NULL,
  description TEXT,
  value TEXT,
  recorded_by TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vaccinations
CREATE TABLE IF NOT EXISTS public.vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  vaccination_date DATE,
  next_due_date DATE,
  administered_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health medical records
CREATE TABLE IF NOT EXISTS public.health_medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL,
  diagnosis TEXT,
  treatment TEXT,
  medication TEXT,
  doctor_name TEXT,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health emergency contacts
CREATE TABLE IF NOT EXISTS public.health_emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT,
  alternate_phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_health_records_org ON public.health_records(organisation_id);
CREATE INDEX IF NOT EXISTS idx_health_records_student ON public.health_records(student_id);
CREATE INDEX IF NOT EXISTS idx_health_records_type ON public.health_records(record_type);
CREATE INDEX IF NOT EXISTS idx_health_records_recorded_at ON public.health_records(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_vaccinations_org ON public.vaccinations(organisation_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_student ON public.vaccinations(student_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_next_due ON public.vaccinations(next_due_date);

CREATE INDEX IF NOT EXISTS idx_health_medical_records_org ON public.health_medical_records(organisation_id);
CREATE INDEX IF NOT EXISTS idx_health_medical_records_student ON public.health_medical_records(student_id);
CREATE INDEX IF NOT EXISTS idx_health_medical_records_date ON public.health_medical_records(record_date DESC);

CREATE INDEX IF NOT EXISTS idx_health_emergency_contacts_org ON public.health_emergency_contacts(organisation_id);
CREATE INDEX IF NOT EXISTS idx_health_emergency_contacts_student ON public.health_emergency_contacts(student_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Org-scoped access for all four tables
CREATE OR REPLACE FUNCTION public.fn_health_org_scope()
RETURNS UUID AS $$
  SELECT organisation_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

DROP POLICY IF EXISTS "Health records org-scoped" ON public.health_records;
CREATE POLICY "Health records org-scoped"
  ON public.health_records FOR ALL
  USING (organisation_id = public.fn_health_org_scope())
  WITH CHECK (organisation_id = public.fn_health_org_scope());

DROP POLICY IF EXISTS "Vaccinations org-scoped" ON public.vaccinations;
CREATE POLICY "Vaccinations org-scoped"
  ON public.vaccinations FOR ALL
  USING (organisation_id = public.fn_health_org_scope())
  WITH CHECK (organisation_id = public.fn_health_org_scope());

DROP POLICY IF EXISTS "Health medical records org-scoped" ON public.health_medical_records;
CREATE POLICY "Health medical records org-scoped"
  ON public.health_medical_records FOR ALL
  USING (organisation_id = public.fn_health_org_scope())
  WITH CHECK (organisation_id = public.fn_health_org_scope());

DROP POLICY IF EXISTS "Health emergency contacts org-scoped" ON public.health_emergency_contacts;
CREATE POLICY "Health emergency contacts org-scoped"
  ON public.health_emergency_contacts FOR ALL
  USING (organisation_id = public.fn_health_org_scope())
  WITH CHECK (organisation_id = public.fn_health_org_scope());

COMMENT ON TABLE public.health_records IS
  'Health records per student (checkup, medication, vaccination, condition, allergy, injury).';
COMMENT ON TABLE public.vaccinations IS
  'Vaccination history and upcoming due dates per student.';
COMMENT ON TABLE public.health_medical_records IS
  'Detailed medical visit records with diagnosis, treatment, medication, and doctor.';
COMMENT ON TABLE public.health_emergency_contacts IS
  'Emergency contact details uploaded by parents/students.';
