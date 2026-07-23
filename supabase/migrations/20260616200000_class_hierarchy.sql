-- ============================================================================
-- STEP 6: CLASS MANAGEMENT — COMPLETE SCHOOL HIERARCHY
-- ============================================================================

-- ============================================================================
-- PART 1: ACADEMIC YEARS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organisation_id, name)
);

-- ============================================================================
-- PART 2: ADD academic_year_id TO CLASSES
-- ============================================================================

ALTER TABLE classes ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL;

-- ============================================================================
-- PART 3: ADD SECTION LINKS TO CLASS_SUBJECT_TEACHER_MAP
-- ============================================================================

ALTER TABLE class_subject_teacher_map ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES sections(id) ON DELETE SET NULL;

-- ============================================================================
-- PART 4: CREATE DEFAULT ACADEMIC YEAR FOR EXISTING DATA
-- ============================================================================

DO $$
DECLARE
  org RECORD;
  ay_id UUID;
BEGIN
  FOR org IN SELECT DISTINCT organisation_id FROM classes WHERE academic_year_id IS NULL LOOP
    INSERT INTO academic_years (organisation_id, name, start_date, end_date, is_current, status)
    VALUES (org.organisation_id, '2025-2026', '2025-04-01', '2026-03-31', true, 'active')
    RETURNING id INTO ay_id;

    UPDATE classes SET academic_year_id = ay_id
    WHERE organisation_id = org.organisation_id AND academic_year_id IS NULL;
  END LOOP;
END $$;

-- ============================================================================
-- PART 5: ADD RLS FOR ACADEMIC YEARS
-- ============================================================================

ALTER TABLE IF EXISTS public.academic_years ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'academic_years' AND policyname = 'org_isolation') THEN
    CREATE POLICY org_isolation ON public.academic_years
      USING (organisation_id = get_user_org_id());
  END IF;
END $$;

-- ============================================================================
-- PART 6: SAMPLE HIERARCHY DATA
-- ============================================================================

-- Insert additional sections for existing classes
INSERT INTO sections (organisation_id, class_id, name, capacity)
SELECT DISTINCT
  c.organisation_id,
  c.id,
  'B',
  40
FROM classes c
WHERE NOT EXISTS (
  SELECT 1 FROM sections s WHERE s.class_id = c.id AND s.name = 'B'
);

INSERT INTO sections (organisation_id, class_id, name, capacity)
SELECT DISTINCT
  c.organisation_id,
  c.id,
  'C',
  40
FROM classes c
WHERE NOT EXISTS (
  SELECT 1 FROM sections s WHERE s.class_id = c.id AND s.name = 'C'
);
