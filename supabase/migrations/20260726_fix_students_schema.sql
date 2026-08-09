-- ============================================================================
-- FIX STUDENTS TABLE SCHEMA — ALIGN FRONTEND & BACKEND
-- ============================================================================
-- Purpose: 
--   1. Ensure student_class (UUID FK to classes) is the canonical column
--   2. Ensure section_id (UUID FK to sections) is the canonical section column
--   3. Drop duplicate/legacy TEXT columns (student_class TEXT, section TEXT)
--   4. Provide migration path for existing data
--   5. Create any missing default data (sections)
-- ============================================================================

-- ============================================================================
-- PART 1: VERIFY STUDENTS TABLE STRUCTURE
-- ============================================================================

-- Check if legacy TEXT columns exist and drop them
DO $$
BEGIN
  -- Drop legacy student_class if it's a TEXT column (not UUID)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'student_class' 
    AND data_type IN ('character varying', 'text')
  ) THEN
    ALTER TABLE students DROP COLUMN IF EXISTS student_class CASCADE;
    RAISE NOTICE 'Dropped students.student_class (legacy TEXT column)';
  END IF;
END $$;

-- Drop legacy section TEXT column if it exists (canonical is now section_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'section' 
    AND data_type IN ('character varying', 'text')
  ) THEN
    ALTER TABLE students DROP COLUMN IF EXISTS section CASCADE;
    RAISE NOTICE 'Dropped students.section (legacy TEXT column)';
  END IF;
END $$;

-- ============================================================================
-- PART 2: ENSURE REQUIRED UUID FK COLUMNS EXIST
-- ============================================================================

-- Ensure class_id (UUID FK to classes) exists
ALTER TABLE students ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE SET NULL;

-- Ensure section_id (UUID FK to sections) exists
ALTER TABLE students ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES sections(id) ON DELETE SET NULL;

-- ============================================================================
-- PART 3: POPULATE MISSING CLASS_ID FROM class_student_map
-- ============================================================================

-- For any students with NULL class_id, populate from class_student_map
UPDATE students s
SET class_id = csm.class_id
WHERE s.class_id IS NULL
  AND EXISTS (
    SELECT 1 FROM class_student_map csm
    WHERE csm.student_id = s.id
  )
  AND class_id IS NULL;

RAISE NOTICE 'Populated class_id from class_student_map for % students', 
  (SELECT COUNT(*) FROM students WHERE class_id IS NOT NULL);

-- ============================================================================
-- PART 4: POPULATE MISSING SECTION_ID FROM CLASS-SECTION MAPPING
-- ============================================================================

-- For students with valid class_id but NULL section_id,
-- assign to the first (default) section of their class if it exists

UPDATE students s
SET section_id = (
  SELECT sec.id FROM sections sec
  WHERE sec.class_id = s.class_id
  ORDER BY sec.created_at ASC
  LIMIT 1
)
WHERE s.class_id IS NOT NULL
  AND s.section_id IS NULL
  AND EXISTS (
    SELECT 1 FROM sections sec WHERE sec.class_id = s.class_id
  );

RAISE NOTICE 'Populated section_id for % students', 
  (SELECT COUNT(*) FROM students WHERE section_id IS NOT NULL);

-- ============================================================================
-- PART 5: CREATE DEFAULT SECTIONS FOR CLASSES WITHOUT THEM
-- ============================================================================

-- For each class that has students but no sections, create default sections (A-E)
DO $$
DECLARE
  class_rec RECORD;
  default_sections TEXT[] := ARRAY['A', 'B', 'C', 'D', 'E'];
  section_name TEXT;
BEGIN
  FOR class_rec IN 
    SELECT DISTINCT s.organisation_id, s.class_id 
    FROM students s
    WHERE s.class_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM sections sec WHERE sec.class_id = s.class_id
      )
  LOOP
    FOREACH section_name IN ARRAY default_sections LOOP
      INSERT INTO sections (organisation_id, class_id, name, capacity)
      VALUES (class_rec.organisation_id, class_rec.class_id, section_name, 40)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
  RAISE NOTICE 'Created default sections for classes without them';
END $$;

-- ============================================================================
-- PART 6: ADD INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_section_id ON students(section_id);
CREATE INDEX IF NOT EXISTS idx_students_org_class ON students(organisation_id, class_id);

-- ============================================================================
-- PART 7: VERIFY DATA INTEGRITY
-- ============================================================================

-- Report on data quality
DO $$
DECLARE
  total_students INT;
  students_with_class INT;
  students_with_section INT;
  students_with_both INT;
BEGIN
  SELECT COUNT(*) INTO total_students FROM students;
  SELECT COUNT(*) INTO students_with_class FROM students WHERE class_id IS NOT NULL;
  SELECT COUNT(*) INTO students_with_section FROM students WHERE section_id IS NOT NULL;
  SELECT COUNT(*) INTO students_with_both FROM students WHERE class_id IS NOT NULL AND section_id IS NOT NULL;
  
  RAISE NOTICE '
    ============= STUDENTS DATA QUALITY REPORT =============
    Total Students: %
    Students with Class: % (%)
    Students with Section: % (%)
    Students with Both: % (%)
  ', 
    total_students,
    students_with_class, ROUND(100.0 * students_with_class / NULLIF(total_students, 0), 2),
    students_with_section, ROUND(100.0 * students_with_section / NULLIF(total_students, 0), 2),
    students_with_both, ROUND(100.0 * students_with_both / NULLIF(total_students, 0), 2);
END $$;
