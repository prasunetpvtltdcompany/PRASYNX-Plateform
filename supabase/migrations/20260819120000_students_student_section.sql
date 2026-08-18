-- ============================================================================
-- STUDENTS: rename legacy `section` (TEXT) -> `student_section` and backfill FKs
--
-- The students table historically kept two legacy TEXT display columns:
--   student_class  (e.g. "Grade 10")   -> still kept for display
--   section        (e.g. "A")          -> renamed to student_section
--
-- Canonical membership lives in:
--   students.class_id    -> classes.id
--   students.section_id  -> sections.id
--   class_student_map    -> per-student class/section rows
--
-- This migration:
--   1. Renames students.section -> students.student_section (TEXT, idempotent)
--   2. Backfills class_id from student_class text where a class with the same
--      name exists inside the same organisation.
--   3. Backfills section_id from student_section text where a section with the
--      same name exists inside that class.
--   4. Syncs class_student_map for any newly connected students.
-- ============================================================================

-- ── 1. Rename legacy display column ─────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'section'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'student_section'
  ) THEN
    ALTER TABLE public.students RENAME COLUMN section TO student_section;
  END IF;
END $$;

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS student_section TEXT;

-- ── 2. Backfill class_id from student_class text ────────────────────────────
UPDATE public.students s
SET class_id = c.id
FROM public.classes c
WHERE s.class_id IS NULL
  AND s.student_class IS NOT NULL
  AND btrim(s.student_class) <> ''
  AND c.organisation_id = s.organisation_id
  AND c.name = s.student_class;

-- ── 3. Backfill section_id from student_section text ────────────────────────
UPDATE public.students s
SET section_id = sec.id
FROM public.sections sec
WHERE s.section_id IS NULL
  AND s.student_section IS NOT NULL
  AND btrim(s.student_section) <> ''
  AND s.class_id = sec.class_id
  AND sec.name = s.student_section;

-- ── 4. Sync class_student_map for newly connected students ─────────────────
INSERT INTO public.class_student_map (organisation_id, class_id, section_id, student_id)
SELECT s.organisation_id, s.class_id, s.section_id, s.id
FROM public.students s
WHERE s.class_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.class_student_map csm
    WHERE csm.student_id = s.id AND csm.class_id = s.class_id
  );
