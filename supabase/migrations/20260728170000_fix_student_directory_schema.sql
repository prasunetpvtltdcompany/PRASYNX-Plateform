-- ============================================================================
-- STUDENT DIRECTORY SCHEMA ALIGNMENT
-- ============================================================================
-- Purpose:
--   Keep management student create/list flows aligned with the database.
--   Canonical fields:
--     students.class_id -> classes.id
--     students.section_id -> sections.id
--     class_student_map mirrors active class membership
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER DEFAULT 40,
  room_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, name)
);

CREATE TABLE IF NOT EXISTS public.class_student_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES public.organisations(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

INSERT INTO public.classes (organisation_id, name, grade_level, capacity, status)
SELECT org.id, grade_name, grade_name, 40, 'active'
FROM public.organisations org
CROSS JOIN generate_series(1, 12) AS grade_num
CROSS JOIN LATERAL (SELECT 'Grade ' || grade_num AS grade_name) g
WHERE NOT EXISTS (
  SELECT 1
  FROM public.classes c
  WHERE c.organisation_id = org.id
    AND c.name = grade_name
);

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS parent_relationship TEXT DEFAULT 'guardian',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'students'
      AND column_name = 'student_class'
      AND udt_name = 'uuid'
  ) THEN
    ALTER TABLE public.students RENAME COLUMN student_class TO legacy_student_class_id;
  END IF;
END $$;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS student_class TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'students'
      AND column_name = 'legacy_student_class_id'
      AND udt_name = 'uuid'
  ) THEN
    UPDATE public.students
    SET class_id = legacy_student_class_id
    WHERE class_id IS NULL
      AND legacy_student_class_id IS NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'students'
      AND column_name = 'student_class'
      AND data_type IN ('text', 'character varying')
  ) THEN
    UPDATE public.students s
    SET class_id = c.id
    FROM public.classes c
    WHERE s.class_id IS NULL
      AND s.student_class IS NOT NULL
      AND c.organisation_id = s.organisation_id
      AND c.name = s.student_class;
  END IF;
END $$;

UPDATE public.students s
SET student_class = c.name
FROM public.classes c
WHERE s.class_id = c.id
  AND (s.student_class IS NULL OR btrim(s.student_class) = '');

UPDATE public.class_student_map csm
SET organisation_id = COALESCE(csm.organisation_id, s.organisation_id)
FROM public.students s
WHERE csm.student_id = s.id
  AND csm.organisation_id IS NULL;

INSERT INTO public.class_student_map (organisation_id, class_id, student_id)
SELECT s.organisation_id, s.class_id, s.id
FROM public.students s
WHERE s.class_id IS NOT NULL
ON CONFLICT (class_id, student_id) DO NOTHING;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'students'
      AND column_name = 'section'
      AND data_type IN ('text', 'character varying')
  ) THEN
    INSERT INTO public.sections (organisation_id, class_id, name)
    SELECT DISTINCT s.organisation_id, s.class_id, s.section
    FROM public.students s
    WHERE s.class_id IS NOT NULL
      AND s.section IS NOT NULL
      AND btrim(s.section) <> ''
    ON CONFLICT (class_id, name) DO NOTHING;

    UPDATE public.students s
    SET section_id = sec.id
    FROM public.sections sec
    WHERE s.section_id IS NULL
      AND s.class_id = sec.class_id
      AND s.section = sec.name;
  END IF;
END $$;

DO $$
DECLARE
  class_rec RECORD;
  section_name TEXT;
BEGIN
  FOR class_rec IN
    SELECT c.id AS class_id, c.organisation_id
    FROM public.classes c
    WHERE NOT EXISTS (
      SELECT 1 FROM public.sections sec WHERE sec.class_id = c.id
    )
  LOOP
    FOREACH section_name IN ARRAY ARRAY['A', 'B', 'C', 'D', 'E'] LOOP
      INSERT INTO public.sections (organisation_id, class_id, name)
      VALUES (class_rec.organisation_id, class_rec.class_id, section_name)
      ON CONFLICT (class_id, name) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

UPDATE public.students s
SET section_id = sec.id
FROM public.sections sec
WHERE s.section_id IS NULL
  AND s.class_id = sec.class_id
  AND sec.name = 'A';

DO $$
BEGIN
  ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_parent_relationship_check;
  ALTER TABLE public.students
    ADD CONSTRAINT students_parent_relationship_check
    CHECK (parent_relationship IN ('parent', 'guardian', 'father', 'mother', 'other'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_students_org_id ON public.students(organisation_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_section_id ON public.students(section_id);
CREATE INDEX IF NOT EXISTS idx_students_org_class ON public.students(organisation_id, class_id);
CREATE INDEX IF NOT EXISTS idx_students_org_section ON public.students(organisation_id, section_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_students_org_roll_present
  ON public.students(organisation_id, roll_number)
  WHERE roll_number IS NOT NULL;
DELETE FROM public.parent_student_links psl
USING public.parent_student_links newer
WHERE psl.parent_id = newer.parent_id
  AND psl.student_id = newer.student_id
  AND psl.id > newer.id;
CREATE UNIQUE INDEX IF NOT EXISTS uq_parent_student_links_parent_student
  ON public.parent_student_links(parent_id, student_id);
CREATE INDEX IF NOT EXISTS idx_sections_org_class ON public.sections(organisation_id, class_id);
CREATE INDEX IF NOT EXISTS idx_class_student_map_org_class ON public.class_student_map(organisation_id, class_id);
CREATE INDEX IF NOT EXISTS idx_class_student_map_org_student ON public.class_student_map(organisation_id, student_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_students_updated_at ON public.students;
CREATE TRIGGER set_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_sections_updated_at ON public.sections;
CREATE TRIGGER set_sections_updated_at
  BEFORE UPDATE ON public.sections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
