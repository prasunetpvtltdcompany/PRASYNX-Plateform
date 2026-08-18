-- ============================================================================
-- STUDENTS: drop legacy TEXT display columns (student_class, student_section)
--
-- The canonical class/section membership lives in:
--   students.class_id    -> classes.id
--   students.section_id  -> sections.id
--   class_student_map    -> per-student class/section rows
--
-- The legacy `student_class` (TEXT) and `student_section` (TEXT, formerly
-- `section`) columns are no longer written or read by any module, so they are
-- dropped here. Class/section display names are resolved via joins on
-- class_id / section_id everywhere.
-- ============================================================================

ALTER TABLE public.students DROP COLUMN IF EXISTS student_class;
ALTER TABLE public.students DROP COLUMN IF EXISTS student_section;