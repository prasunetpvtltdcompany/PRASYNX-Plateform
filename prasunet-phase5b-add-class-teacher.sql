-- ============================================================================
-- PHASE 5b: Add is_class_teacher to class_subject_teacher_map
-- ============================================================================

ALTER TABLE class_subject_teacher_map ADD COLUMN IF NOT EXISTS is_class_teacher BOOLEAN DEFAULT false;

-- Add index for filtering class teachers
CREATE INDEX IF NOT EXISTS idx_cstmap_class_teacher ON class_subject_teacher_map(class_id) WHERE is_class_teacher = true;
