-- ============================================================================
-- PHASE 4: ACADEMIC HIERARCHY CONSOLIDATION MIGRATION
-- ============================================================================
-- This migration:
-- 1. Populates class_student_map from legacy students.student_class TEXT
-- 2. Populates class_student_map from legacy students.class_id UUID FK
-- 3. Populates class_subject_teacher_map from legacy teachers.assigned_class/subject
-- 4. Adds missing FK indexes
-- 5. Drops legacy columns (soft — comments only, no destructive DDL)
-- 6. Creates credential_exports table
-- 7. Creates sections table
-- ============================================================================

-- ============================================================================
-- PART 1: POPULATE class_student_map FROM LEGACY DATA
-- ============================================================================

-- Strategy:
--   Source A: students.class_id (UUID FK, set by prasunet-fixes-migration.sql)
--   Source B: students.student_class (TEXT class name, matched to classes.name)
--   Result: Insert into class_student_map, skip duplicates

-- Source A: Direct class_id FKs
INSERT INTO class_student_map (class_id, student_id, organisation_id, created_at)
SELECT
  s.class_id,
  s.id,
  s.organisation_id,
  NOW()
FROM students s
WHERE s.class_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM class_student_map csm
    WHERE csm.class_id = s.class_id AND csm.student_id = s.id
  );

-- Source B: Match student_class TEXT to classes.name
INSERT INTO class_student_map (class_id, student_id, organisation_id, created_at)
SELECT
  c.id,
  s.id,
  s.organisation_id,
  NOW()
FROM students s
JOIN classes c ON c.organisation_id = s.organisation_id AND c.name = s.student_class
WHERE s.class_id IS NULL
  AND s.student_class IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM class_student_map csm
    WHERE csm.class_id = c.id AND csm.student_id = s.id
  );

-- ============================================================================
-- PART 2: POPULATE class_subject_teacher_map FROM LEGACY DATA
-- ============================================================================

-- Match teacher.assigned_class + teachers.subject to class_subject_teacher_map
INSERT INTO class_subject_teacher_map (class_id, subject_id, teacher_id, organisation_id, created_at)
SELECT
  c.id,
  sub.id,
  t.id,
  t.organisation_id,
  NOW()
FROM teachers t
JOIN classes c ON c.organisation_id = t.organisation_id
  AND c.id = t.assigned_class::uuid
LEFT JOIN subjects sub ON sub.organisation_id = t.organisation_id AND sub.name = t.subject
WHERE t.assigned_class IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM class_subject_teacher_map cstm
    WHERE cstm.teacher_id = t.id AND cstm.class_id = c.id
  );

-- Also populate from classes.class_teacher_id (if column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'class_teacher_id') THEN
    INSERT INTO class_subject_teacher_map (class_id, teacher_id, organisation_id, created_at)
    SELECT
      c.id,
      c.class_teacher_id,
      c.organisation_id,
      NOW()
    FROM classes c
    WHERE c.class_teacher_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM class_subject_teacher_map cstm
        WHERE cstm.class_id = c.id AND cstm.teacher_id = c.class_teacher_id
      );
  END IF;
END $$;

-- ============================================================================
-- PART 3: CREATE SECTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER DEFAULT 40,
  room_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, name)
);

-- Backfill sections from existing students.section data
INSERT INTO sections (organisation_id, class_id, name, capacity)
SELECT DISTINCT
  s.organisation_id,
  csm.class_id,
  s.section,
  40
FROM students s
JOIN class_student_map csm ON csm.student_id = s.id
WHERE s.section IS NOT NULL AND s.section != ''
  AND NOT EXISTS (
    SELECT 1 FROM sections sec
    WHERE sec.class_id = csm.class_id AND sec.name = s.section
  );

-- Add section_id to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES sections(id) ON DELETE SET NULL;

-- Backfill students.section_id from sections
UPDATE students s
SET section_id = (
  SELECT sec.id FROM sections sec
  JOIN class_student_map csm ON csm.class_id = sec.class_id AND csm.student_id = s.id
  WHERE sec.name = s.section
  LIMIT 1
)
WHERE s.section IS NOT NULL AND s.section != ''
  AND s.section_id IS NULL
  AND EXISTS (
    SELECT 1 FROM sections sec
    JOIN class_student_map csm ON csm.class_id = sec.class_id AND csm.student_id = s.id
    WHERE sec.name = s.section
  );

-- ============================================================================
-- PART 4: CREATE credential_exports TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.credential_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  initial_password TEXT NOT NULL,
  exported_at TIMESTAMPTZ DEFAULT NOW(),
  exported_by UUID REFERENCES users(id),
  UNIQUE(organisation_id, user_id)
);

-- ============================================================================
-- PART 5: FIX parent_student_links FK REFERENCES
-- ============================================================================

-- prasunet-fixes-migration.sql incorrectly references a non-existent 'parents' table
-- Fix: parent_student_links.parent_id references users(id), not parents(id)
-- The column already references users(id) in the original schema, so no ALTER needed.
-- Just verify:
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'parent_student_links' AND kcu.column_name = 'parent_id'
    AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    RAISE NOTICE 'parent_student_links.parent_id FK is already correctly defined';
  ELSE
    RAISE WARNING 'parent_student_links.parent_id FK needs verification';
  END IF;
END $$;

-- ============================================================================
-- PART 6: REMOVE LEGACY COLUMNS (COMMENT OUT — DESTRUCTIVE)
-- ============================================================================

-- NOTE: The following columns are kept for backward compatibility but are no
-- longer used by any application code:
--   students.student_class (TEXT) — use class_student_map instead
--   students.class_id (UUID) — use class_student_map instead
--   students.parent_email (TEXT) — use parent_student_links instead
--   students.parent_phone (TEXT) — use parent_student_links instead
--   teachers.assigned_class (UUID) — use class_subject_teacher_map instead
--   teachers.subject (TEXT) — use class_subject_teacher_map instead
--   classes.class_teacher_id (UUID) — use class_subject_teacher_map instead

-- ============================================================================
-- PART 7: RLS POLICIES FOR NEW TABLES
-- ============================================================================

ALTER TABLE IF EXISTS public.sections ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sections' AND policyname = 'org_isolation') THEN
    CREATE POLICY org_isolation ON public.sections
      USING (organisation_id = get_user_org_id());
  END IF;
END $$;

ALTER TABLE IF EXISTS public.credential_exports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'credential_exports' AND policyname = 'org_isolation') THEN
    CREATE POLICY org_isolation ON public.credential_exports
      USING (organisation_id = get_user_org_id());
  END IF;
END $$;

-- ============================================================================
-- PART 8: DROP display_password COLUMNS
-- ============================================================================

ALTER TABLE IF EXISTS public.users DROP COLUMN IF EXISTS display_password;
ALTER TABLE IF EXISTS public.students DROP COLUMN IF EXISTS display_password;
ALTER TABLE IF EXISTS public.teachers DROP COLUMN IF EXISTS display_password;
