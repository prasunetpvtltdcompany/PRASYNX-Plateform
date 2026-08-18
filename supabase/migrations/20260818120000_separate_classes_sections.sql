-- ============================================================================
-- SEPARATE class_sections BACK INTO classes + sections
--
-- Reverts the single self-referencing table (parent_id / grade_level removed).
--   * classes:   id, organisation_id, name, room_number, capacity, status, timestamps
--   * sections:  id, organisation_id, class_id -> classes(id) CASCADE,
--                name, room_number, capacity, status, timestamps
--   * UNIQUE(organisation_id, name) on classes
--   * UNIQUE(class_id, name) on sections
--   * class_student_map gains nullable section_id -> sections(id) so a student
--     can be mapped directly to a class (section_id NULL) or to a section.
--   * Tables start EMPTY (pre-existing class/section data is intentionally
--     discarded; the UI re-creates classes manually).
--   * FK constraint names are preserved so PostgREST embeds that reference
--     them by name keep working after the repoint.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. CREATE classes + sections (empty)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_number TEXT,
  capacity INTEGER NOT NULL DEFAULT 35,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organisation_id, name)
);

CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_number TEXT,
  capacity INTEGER NOT NULL DEFAULT 35,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, name)
);

-- ============================================================================
-- 2. REPOINT FKs REFERENCING class_sections(id)
--    (class_id FKs -> classes(id); section_id FKs -> sections(id))
-- ============================================================================

-- ── classes(id) targets ──

-- CASCADE
ALTER TABLE public.assignments            DROP CONSTRAINT assignments_class_id_fkey;
ALTER TABLE public.assignments            ADD CONSTRAINT assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
ALTER TABLE public.class_student_map      DROP CONSTRAINT class_student_map_class_id_fkey;
ALTER TABLE public.class_student_map      ADD CONSTRAINT class_student_map_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
ALTER TABLE public.class_subject_teacher_map DROP CONSTRAINT class_subject_teacher_map_class_id_fkey;
ALTER TABLE public.class_subject_teacher_map ADD CONSTRAINT class_subject_teacher_map_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
ALTER TABLE public.exam_schedules         DROP CONSTRAINT exam_schedules_class_id_fkey;
ALTER TABLE public.exam_schedules         ADD CONSTRAINT exam_schedules_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
ALTER TABLE public.qr_sessions            DROP CONSTRAINT qr_sessions_class_id_fkey;
ALTER TABLE public.qr_sessions            ADD CONSTRAINT qr_sessions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
ALTER TABLE public.timetable_entries      DROP CONSTRAINT timetable_entries_class_id_fkey;
ALTER TABLE public.timetable_entries      ADD CONSTRAINT timetable_entries_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

-- SET NULL
ALTER TABLE public.ai_generated_content   DROP CONSTRAINT ai_generated_content_class_id_fkey;
ALTER TABLE public.ai_generated_content   ADD CONSTRAINT ai_generated_content_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;
ALTER TABLE public.ai_lessons             DROP CONSTRAINT ai_lessons_class_id_fkey;
ALTER TABLE public.ai_lessons             ADD CONSTRAINT ai_lessons_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;
ALTER TABLE public.ai_quizzes             DROP CONSTRAINT ai_quizzes_class_id_fkey;
ALTER TABLE public.ai_quizzes             ADD CONSTRAINT ai_quizzes_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;
ALTER TABLE public.announcements          DROP CONSTRAINT announcements_target_class_id_fkey;
ALTER TABLE public.announcements          ADD CONSTRAINT announcements_target_class_id_fkey FOREIGN KEY (target_class_id) REFERENCES public.classes(id) ON DELETE SET NULL;
ALTER TABLE public.exams                  DROP CONSTRAINT exams_class_id_fkey;
ALTER TABLE public.exams                  ADD CONSTRAINT exams_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;
ALTER TABLE public.fee_structures         DROP CONSTRAINT fee_structures_class_id_fkey;
ALTER TABLE public.fee_structures         ADD CONSTRAINT fee_structures_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;
ALTER TABLE public.staff_records          DROP CONSTRAINT staff_records_assigned_class_fkey;
ALTER TABLE public.staff_records          ADD CONSTRAINT staff_records_assigned_class_fkey FOREIGN KEY (assigned_class) REFERENCES public.classes(id) ON DELETE SET NULL;
ALTER TABLE public.students               DROP CONSTRAINT students_class_id_fkey;
ALTER TABLE public.students               ADD CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

-- NO ACTION
ALTER TABLE public.promotion_history      DROP CONSTRAINT promotion_history_from_class_id_fkey;
ALTER TABLE public.promotion_history      ADD CONSTRAINT promotion_history_from_class_id_fkey FOREIGN KEY (from_class_id) REFERENCES public.classes(id);
ALTER TABLE public.promotion_history      DROP CONSTRAINT promotion_history_to_class_id_fkey;
ALTER TABLE public.promotion_history      ADD CONSTRAINT promotion_history_to_class_id_fkey FOREIGN KEY (to_class_id) REFERENCES public.classes(id);

-- ── sections(id) targets ──

ALTER TABLE public.class_subject_teacher_map DROP CONSTRAINT class_subject_teacher_map_section_id_fkey;
ALTER TABLE public.class_subject_teacher_map ADD CONSTRAINT class_subject_teacher_map_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE SET NULL;
ALTER TABLE public.timetable_entries      DROP CONSTRAINT timetable_entries_section_id_fkey;
ALTER TABLE public.timetable_entries      ADD CONSTRAINT timetable_entries_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE SET NULL;
ALTER TABLE public.students               DROP CONSTRAINT students_section_id_fkey;
ALTER TABLE public.students               ADD CONSTRAINT students_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE SET NULL;
ALTER TABLE public.promotion_history      DROP CONSTRAINT promotion_history_from_section_id_fkey;
ALTER TABLE public.promotion_history      ADD CONSTRAINT promotion_history_from_section_id_fkey FOREIGN KEY (from_section_id) REFERENCES public.sections(id);
ALTER TABLE public.promotion_history      DROP CONSTRAINT promotion_history_to_section_id_fkey;
ALTER TABLE public.promotion_history      ADD CONSTRAINT promotion_history_to_section_id_fkey FOREIGN KEY (to_section_id) REFERENCES public.sections(id);

-- ============================================================================
-- 3. class_student_map: add nullable section_id
-- ============================================================================
ALTER TABLE public.class_student_map ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL;

-- ============================================================================
-- 4. DROP MERGED TABLE (removes the self-referencing FK + unique automatically)
-- ============================================================================
DROP TABLE IF EXISTS public.class_sections;

-- ============================================================================
-- 5. INDEXES + GRANTS + TRIGGERS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_classes_org      ON public.classes(organisation_id);
CREATE INDEX IF NOT EXISTS idx_classes_status   ON public.classes(status);
CREATE INDEX IF NOT EXISTS idx_sections_org     ON public.sections(organisation_id);
CREATE INDEX IF NOT EXISTS idx_sections_class   ON public.sections(class_id);
CREATE INDEX IF NOT EXISTS idx_sections_status  ON public.sections(status);

GRANT ALL ON public.classes TO anon, authenticated, service_role;
GRANT ALL ON public.sections TO anon, authenticated, service_role;

DROP TRIGGER IF EXISTS trg_audit_on_classes ON public.classes;
CREATE TRIGGER trg_audit_on_classes
  AFTER INSERT OR UPDATE OR DELETE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION audit_table_change();

DROP TRIGGER IF EXISTS set_classes_updated_at ON public.classes;
CREATE TRIGGER set_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_audit_on_sections ON public.sections;
CREATE TRIGGER trg_audit_on_sections
  AFTER INSERT OR UPDATE OR DELETE ON public.sections
  FOR EACH ROW EXECUTE FUNCTION audit_table_change();

DROP TRIGGER IF EXISTS set_sections_updated_at ON public.sections;
CREATE TRIGGER set_sections_updated_at
  BEFORE UPDATE ON public.sections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 6. VERIFY
-- ============================================================================
DO $$
DECLARE
  n_classes  INTEGER;
  n_sections INTEGER;
BEGIN
  SELECT count(*) INTO n_classes  FROM public.classes;
  SELECT count(*) INTO n_sections FROM public.sections;
  RAISE NOTICE 'classes: %, sections: %', n_classes, n_sections;
END $$;

COMMIT;
