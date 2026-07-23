-- ============================================================================
-- STEP 7: BULK OPERATIONS — UNIQUE IDENTIFIERS
-- ============================================================================

-- ============================================================================
-- PART 1: ADD UNIQUE IDENTIFIER COLUMNS
-- ============================================================================

-- Students: add student_unique_id
ALTER TABLE students ADD COLUMN IF NOT EXISTS student_unique_id TEXT;
CREATE INDEX IF NOT EXISTS idx_students_unique_id ON students(organisation_id, student_unique_id);
UPDATE students SET student_unique_id = roll_number WHERE student_unique_id IS NULL;

-- Parents: add parent_unique_id
ALTER TABLE parents ADD COLUMN IF NOT EXISTS parent_unique_id TEXT;
CREATE INDEX IF NOT EXISTS idx_parents_unique_id ON parents(organisation_id, parent_unique_id);
UPDATE parents SET parent_unique_id = 'PAR-' || SUBSTRING(gen_random_uuid()::text, 1, 8) WHERE parent_unique_id IS NULL;

-- Teachers: add staff_unique_id
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS staff_unique_id TEXT;
CREATE INDEX IF NOT EXISTS idx_teachers_unique_id ON teachers(organisation_id, staff_unique_id);
UPDATE teachers SET staff_unique_id = teacher_code WHERE staff_unique_id IS NULL AND teacher_code IS NOT NULL;
UPDATE teachers SET staff_unique_id = 'STAFF-' || SUBSTRING(gen_random_uuid()::text, 1, 8) WHERE staff_unique_id IS NULL;

-- ============================================================================
-- PART 2: BACKFILL ORGANISATION CODES
-- ============================================================================

UPDATE organisations SET code = 'ORG-' || SUBSTRING(REPLACE(id::text, '-', ''), 1, 8) WHERE code IS NULL;

-- ============================================================================
-- PART 3: ADD UNIQUE CONSTRAINTS
-- ============================================================================

-- Allow null for backward compatibility, but enforce uniqueness when set
DROP INDEX IF EXISTS idx_students_unique_id;
CREATE UNIQUE INDEX idx_students_unique_id ON students(organisation_id, student_unique_id) WHERE student_unique_id IS NOT NULL;

DROP INDEX IF EXISTS idx_parents_unique_id;
CREATE UNIQUE INDEX idx_parents_unique_id ON parents(organisation_id, parent_unique_id) WHERE parent_unique_id IS NOT NULL;

DROP INDEX IF EXISTS idx_teachers_unique_id;
CREATE UNIQUE INDEX idx_teachers_unique_id ON teachers(organisation_id, staff_unique_id) WHERE staff_unique_id IS NOT NULL;

-- Organisation code must be unique
DROP INDEX IF EXISTS idx_organisations_code;
CREATE UNIQUE INDEX idx_organisations_code ON organisations(code) WHERE code IS NOT NULL;
