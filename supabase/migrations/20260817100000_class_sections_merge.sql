-- ============================================================================
-- MERGE classes + sections INTO class_sections (single self-referencing table)
--
-- Design:
--   * One row per "class section".
--   * A class row:      parent_id IS NULL
--   * A section row:    parent_id = its class row id
--   * A class with no section: a single standalone row (parent_id NULL, no children)
--   * Existing classes/sections are migrated in, PRESERVING their UUIDs so all
--     FK references (class_student_map, students, timetable_entries, exams,
--     promotion_history, etc.) remain valid after the FK repoint.
--   * Unwanted columns removed: classes.section (text), sections.is_active
--     (boolean -> status text), sections.is_active default.
--   * capacity defaults to 35 (hard cap enforced in the service layer).
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. CREATE class_sections
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.class_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.class_sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade_level TEXT,
  room_number TEXT,
  capacity INTEGER NOT NULL DEFAULT 35,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, name)
);

-- ============================================================================
-- 2. MIGRATE DATA (preserving IDs)
-- ============================================================================

-- Classes -> parent rows
INSERT INTO public.class_sections (id, organisation_id, parent_id, name, grade_level, capacity, status, created_at)
SELECT id, organisation_id, NULL, name, grade_level, COALESCE(capacity, 35), COALESCE(status, 'active'), created_at
FROM public.classes;

-- Sections -> child rows
INSERT INTO public.class_sections (id, organisation_id, parent_id, name, room_number, capacity, status, created_at, updated_at)
SELECT s.id, s.organisation_id, s.class_id, s.name, s.room_number, COALESCE(s.capacity, 35),
       CASE WHEN s.is_active THEN 'active' ELSE 'inactive' END, s.created_at, s.updated_at
FROM public.sections s;

-- ============================================================================
-- 3. REPOINT FKs REFERENCING classes(id) -> class_sections(id)
-- ============================================================================

-- CASCADE
ALTER TABLE public.assignments            DROP CONSTRAINT assignments_class_id_fkey;
ALTER TABLE public.assignments            ADD CONSTRAINT assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.class_sections(id) ON DELETE CASCADE;
ALTER TABLE public.class_student_map      DROP CONSTRAINT class_student_map_class_id_fkey;
ALTER TABLE public.class_student_map      ADD CONSTRAINT class_student_map_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.class_sections(id) ON DELETE CASCADE;
ALTER TABLE public.class_subject_teacher_map DROP CONSTRAINT class_subject_teacher_map_class_id_fkey;
ALTER TABLE public.class_subject_teacher_map ADD CONSTRAINT class_subject_teacher_map_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.class_sections(id) ON DELETE CASCADE;
ALTER TABLE public.exam_schedules         DROP CONSTRAINT exam_schedules_class_id_fkey;
ALTER TABLE public.exam_schedules         ADD CONSTRAINT exam_schedules_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.class_sections(id) ON DELETE CASCADE;
ALTER TABLE public.qr_sessions            DROP CONSTRAINT qr_sessions_class_id_fkey;
ALTER TABLE public.qr_sessions            ADD CONSTRAINT qr_sessions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.class_sections(id) ON DELETE CASCADE;
ALTER TABLE public.timetable_entries      DROP CONSTRAINT timetable_entries_class_id_fkey;
ALTER TABLE public.timetable_entries      ADD CONSTRAINT timetable_entries_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.class_sections(id) ON DELETE CASCADE;

-- SET NULL
ALTER TABLE public.ai_generated_content   DROP CONSTRAINT ai_generated_content_class_id_fkey;
ALTER TABLE public.ai_generated_content   ADD CONSTRAINT ai_generated_content_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.class_sections(id) ON DELETE SET NULL;
ALTER TABLE public.ai_lessons             DROP CONSTRAINT ai_lessons_class_id_fkey;
ALTER TABLE public.ai_lessons             ADD CONSTRAINT ai_lessons_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.class_sections(id) ON DELETE SET NULL;
ALTER TABLE public.ai_quizzes             DROP CONSTRAINT ai_quizzes_class_id_fkey;
ALTER TABLE public.ai_quizzes             ADD CONSTRAINT ai_quizzes_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.class_sections(id) ON DELETE SET NULL;
ALTER TABLE public.announcements          DROP CONSTRAINT announcements_target_class_id_fkey;
ALTER TABLE public.announcements          ADD CONSTRAINT announcements_target_class_id_fkey FOREIGN KEY (target_class_id) REFERENCES public.class_sections(id) ON DELETE SET NULL;
ALTER TABLE public.exams                  DROP CONSTRAINT exams_class_id_fkey;
ALTER TABLE public.exams                  ADD CONSTRAINT exams_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.class_sections(id) ON DELETE SET NULL;
ALTER TABLE public.fee_structures         DROP CONSTRAINT fee_structures_class_id_fkey;
ALTER TABLE public.fee_structures         ADD CONSTRAINT fee_structures_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.class_sections(id) ON DELETE SET NULL;
ALTER TABLE public.staff_records          DROP CONSTRAINT staff_records_assigned_class_fkey;
ALTER TABLE public.staff_records          ADD CONSTRAINT staff_records_assigned_class_fkey FOREIGN KEY (assigned_class) REFERENCES public.class_sections(id) ON DELETE SET NULL;
ALTER TABLE public.students               DROP CONSTRAINT students_class_id_fkey;
ALTER TABLE public.students               ADD CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.class_sections(id) ON DELETE SET NULL;

-- NO ACTION
ALTER TABLE public.promotion_history      DROP CONSTRAINT promotion_history_from_class_id_fkey;
ALTER TABLE public.promotion_history      ADD CONSTRAINT promotion_history_from_class_id_fkey FOREIGN KEY (from_class_id) REFERENCES public.class_sections(id);
ALTER TABLE public.promotion_history      DROP CONSTRAINT promotion_history_to_class_id_fkey;
ALTER TABLE public.promotion_history      ADD CONSTRAINT promotion_history_to_class_id_fkey FOREIGN KEY (to_class_id) REFERENCES public.class_sections(id);

-- ============================================================================
-- 4. REPOINT FKs REFERENCING sections(id) -> class_sections(id)
-- ============================================================================

ALTER TABLE public.class_subject_teacher_map DROP CONSTRAINT class_subject_teacher_map_section_id_fkey;
ALTER TABLE public.class_subject_teacher_map ADD CONSTRAINT class_subject_teacher_map_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.class_sections(id) ON DELETE SET NULL;
ALTER TABLE public.timetable_entries      DROP CONSTRAINT timetable_entries_section_id_fkey;
ALTER TABLE public.timetable_entries      ADD CONSTRAINT timetable_entries_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.class_sections(id) ON DELETE SET NULL;
ALTER TABLE public.students               DROP CONSTRAINT students_section_id_fkey;
ALTER TABLE public.students               ADD CONSTRAINT students_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.class_sections(id) ON DELETE SET NULL;
ALTER TABLE public.promotion_history      DROP CONSTRAINT promotion_history_from_section_id_fkey;
ALTER TABLE public.promotion_history      ADD CONSTRAINT promotion_history_from_section_id_fkey FOREIGN KEY (from_section_id) REFERENCES public.class_sections(id);
ALTER TABLE public.promotion_history      DROP CONSTRAINT promotion_history_to_section_id_fkey;
ALTER TABLE public.promotion_history      ADD CONSTRAINT promotion_history_to_section_id_fkey FOREIGN KEY (to_section_id) REFERENCES public.class_sections(id);

-- ============================================================================
-- 5. DROP OLD TABLES
-- ============================================================================
DROP TABLE IF EXISTS public.sections;
DROP TABLE IF EXISTS public.classes;

-- ============================================================================
-- 6. INDEXES + GRANTS + TRIGGERS (carried over from old tables)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_class_sections_org      ON public.class_sections(organisation_id);
CREATE INDEX IF NOT EXISTS idx_class_sections_parent   ON public.class_sections(parent_id);
CREATE INDEX IF NOT EXISTS idx_class_sections_status   ON public.class_sections(status);

GRANT ALL ON public.class_sections TO anon, authenticated, service_role;

-- Recreate audit trigger (was trg_audit_on_classes) and updated_at trigger
-- (was set_sections_updated_at) on the merged table.
DROP TRIGGER IF EXISTS trg_audit_on_class_sections ON public.class_sections;
CREATE TRIGGER trg_audit_on_class_sections
  AFTER INSERT OR UPDATE OR DELETE ON public.class_sections
  FOR EACH ROW EXECUTE FUNCTION audit_table_change();

DROP TRIGGER IF EXISTS set_class_sections_updated_at ON public.class_sections;
CREATE TRIGGER set_class_sections_updated_at
  BEFORE UPDATE ON public.class_sections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 7. VERIFY
-- ============================================================================
DO $$
DECLARE
  n_classes  INTEGER;
  n_sections INTEGER;
BEGIN
  SELECT count(*) INTO n_classes  FROM public.class_sections WHERE parent_id IS NULL;
  SELECT count(*) INTO n_sections FROM public.class_sections WHERE parent_id IS NOT NULL;
  RAISE NOTICE 'class_sections: % class rows, % section rows', n_classes, n_sections;
END $$;

COMMIT;
