-- ============================================================================
-- COMPREHENSIVE STUDENTS TABLE ALIGNMENT MIGRATION
-- ============================================================================
-- Date: 2026-07-26
-- Purpose: Ensure complete schema alignment between frontend and database
-- 
-- Final Schema Design:
--   - classes: Represents grades/classes (e.g., "Class 10", "Grade 9")
--   - sections: Represents divisions within classes (e.g., "A", "B", "C")
--   - students: References both class_id and section_id (both UUIDs)
-- ============================================================================

-- ============================================================================
-- PART 1: VERIFY AND CREATE REQUIRED TABLES (if missing)
-- ============================================================================

-- Ensure sections table exists with complete schema
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER DEFAULT 40,
  room_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, name)
);

CREATE INDEX IF NOT EXISTS idx_sections_class_id ON sections(class_id);
CREATE INDEX IF NOT EXISTS idx_sections_org_id ON sections(organisation_id);

-- ============================================================================
-- PART 2: ENSURE CLASS_STUDENT_MAP EXISTS (for data migration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.class_student_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_class_student_map_student ON class_student_map(student_id);
CREATE INDEX IF NOT EXISTS idx_class_student_map_class ON class_student_map(class_id);

-- ============================================================================
-- PART 3: ADD REQUIRED COLUMNS TO STUDENTS TABLE
-- ============================================================================

-- Add class_id if missing (canonical class reference)
ALTER TABLE students ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE SET NULL;

-- Add section_id if missing (canonical section reference)
ALTER TABLE students ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES sections(id) ON DELETE SET NULL;

-- Add parent_relationship for better parent tracking
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_relationship TEXT DEFAULT 'parent' 
  CHECK (parent_relationship IN ('parent', 'guardian', 'other'));

-- Add admission_date if missing
ALTER TABLE students ADD COLUMN IF NOT EXISTS admission_date DATE;

-- Add updated_at if missing
ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- PART 4: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_section_id ON students(section_id);
CREATE INDEX IF NOT EXISTS idx_students_org_id ON students(organisation_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_org_class ON students(organisation_id, class_id);
CREATE INDEX IF NOT EXISTS idx_students_org_section ON students(organisation_id, section_id);
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(organisation_id, roll_number);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- ============================================================================
-- PART 5: MIGRATE DATA — POPULATE MISSING CLASS_ID
-- ============================================================================

-- Strategy A: Use existing student_class if it's UUID (from original schema)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'student_class'
    AND data_type IN ('uuid', 'USER-DEFINED')
  ) THEN
    UPDATE students
    SET class_id = student_class
    WHERE class_id IS NULL AND student_class IS NOT NULL;
    
    RAISE NOTICE 'Migrated class_id from student_class (UUID) for % students',
      (SELECT COUNT(*) FROM students WHERE class_id IS NOT NULL);
  END IF;
END $$;

-- Strategy B: Use class_student_map as fallback
UPDATE students s
SET class_id = csm.class_id
WHERE s.class_id IS NULL
  AND EXISTS (
    SELECT 1 FROM class_student_map csm 
    WHERE csm.student_id = s.id
  );

-- ============================================================================
-- PART 6: MIGRATE DATA — POPULATE MISSING SECTION_ID
-- ============================================================================

-- Strategy A: Use legacy section TEXT column if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'section'
    AND data_type IN ('character varying', 'text')
  ) THEN
    UPDATE students s
    SET section_id = (
      SELECT sec.id FROM sections sec
      WHERE sec.class_id = s.class_id AND sec.name = s.section
      LIMIT 1
    )
    WHERE s.section_id IS NULL 
      AND s.section IS NOT NULL 
      AND s.class_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM sections sec
        WHERE sec.class_id = s.class_id AND sec.name = s.section
      );
    
    RAISE NOTICE 'Migrated section_id from section (TEXT) for % students',
      (SELECT COUNT(*) FROM students WHERE section_id IS NOT NULL);
  END IF;
END $$;

-- Strategy B: Assign to first/default section of class if available
UPDATE students s
SET section_id = (
  SELECT sec.id FROM sections sec
  WHERE sec.class_id = s.class_id
  ORDER BY sec.created_at ASC
  LIMIT 1
)
WHERE s.section_id IS NULL 
  AND s.class_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM sections sec WHERE sec.class_id = s.class_id
  );

-- ============================================================================
-- PART 7: CREATE DEFAULT SECTIONS FOR CLASSES
-- ============================================================================

-- For each class with students but no sections, create default sections (A-E)
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
      INSERT INTO sections (organisation_id, class_id, name, capacity, is_active)
      VALUES (class_rec.organisation_id, class_rec.class_id, section_name, 40, true)
      ON CONFLICT (class_id, name) DO NOTHING;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Created default sections for classes without them';
END $$;

-- Re-attempt to populate section_id after creating defaults
UPDATE students s
SET section_id = (
  SELECT sec.id FROM sections sec
  WHERE sec.class_id = s.class_id
  ORDER BY sec.created_at ASC
  LIMIT 1
)
WHERE s.section_id IS NULL AND s.class_id IS NOT NULL;

-- ============================================================================
-- PART 8: POPULATE MISSING PARENT INFORMATION (if empty)
-- ============================================================================

-- Set default parent_relationship for students with parent emails
UPDATE students
SET parent_relationship = 'parent'
WHERE parent_relationship IS NULL AND parent_email IS NOT NULL;

-- ============================================================================
-- PART 9: ADD MISSING CONSTRAINTS
-- ============================================================================

-- Ensure organisation_id is NOT NULL
ALTER TABLE students ALTER COLUMN organisation_id SET NOT NULL;

-- Add unique constraint for roll_number per organisation
ALTER TABLE students DROP CONSTRAINT IF EXISTS uq_students_org_roll;
ALTER TABLE students ADD CONSTRAINT uq_students_org_roll UNIQUE(organisation_id, roll_number) WHERE roll_number IS NOT NULL;

-- ============================================================================
-- PART 10: COMPREHENSIVE DATA QUALITY REPORT
-- ============================================================================

DO $$
DECLARE
  total_students INT;
  students_with_org INT;
  students_with_class INT;
  students_with_section INT;
  students_with_both INT;
  students_with_parent INT;
  students_with_full_data INT;
BEGIN
  SELECT COUNT(*) INTO total_students FROM students;
  SELECT COUNT(*) INTO students_with_org FROM students WHERE organisation_id IS NOT NULL;
  SELECT COUNT(*) INTO students_with_class FROM students WHERE class_id IS NOT NULL;
  SELECT COUNT(*) INTO students_with_section FROM students WHERE section_id IS NOT NULL;
  SELECT COUNT(*) INTO students_with_both FROM students WHERE class_id IS NOT NULL AND section_id IS NOT NULL;
  SELECT COUNT(*) INTO students_with_parent FROM students WHERE parent_email IS NOT NULL OR parent_name IS NOT NULL;
  SELECT COUNT(*) INTO students_with_full_data FROM students 
    WHERE organisation_id IS NOT NULL 
    AND class_id IS NOT NULL 
    AND section_id IS NOT NULL
    AND (parent_email IS NOT NULL OR parent_name IS NOT NULL);
  
  RAISE NOTICE '
    ================================================================
    STUDENTS TABLE DATA QUALITY REPORT — 2026-07-26
    ================================================================
    Total Students:                    %
    With Organisation:                 % (%)
    With Class:                        % (%)
    With Section:                      % (%)
    With Both Class & Section:         % (%)
    With Parent Information:           % (%)
    Complete (Org+Class+Section+Parent): % (%)
    ================================================================
  ', 
    total_students,
    students_with_org, 
    ROUND(100.0 * students_with_org / NULLIF(total_students, 0), 2),
    students_with_class, 
    ROUND(100.0 * students_with_class / NULLIF(total_students, 0), 2),
    students_with_section, 
    ROUND(100.0 * students_with_section / NULLIF(total_students, 0), 2),
    students_with_both, 
    ROUND(100.0 * students_with_both / NULLIF(total_students, 0), 2),
    students_with_parent, 
    ROUND(100.0 * students_with_parent / NULLIF(total_students, 0), 2),
    students_with_full_data, 
    ROUND(100.0 * students_with_full_data / NULLIF(total_students, 0), 2);
END $$;

-- ============================================================================
-- PART 11: CLEANUP LEGACY COLUMNS (OPTIONAL - UNCOMMENT WHEN SAFE)
-- ============================================================================

-- Uncomment when confident all data has been migrated:
-- ALTER TABLE students DROP COLUMN IF EXISTS student_class CASCADE;
-- ALTER TABLE students DROP COLUMN IF EXISTS section CASCADE;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- To verify the schema after migration, run these queries:
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns 
-- WHERE table_name = 'students' ORDER BY ordinal_position;
--
-- SELECT COUNT(*), COUNT(class_id) with_class, COUNT(section_id) with_section 
-- FROM students;
--
-- SELECT c.name as class_name, COUNT(s.id) as student_count, COUNT(DISTINCT s.section_id) as section_count
-- FROM classes c
-- LEFT JOIN students s ON s.class_id = c.id
-- GROUP BY c.id, c.name;
