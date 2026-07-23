-- ============================================================================
-- STEP 10: ORPHAN DATA REPAIR — INDIVIDUAL STATEMENTS
-- ============================================================================

-- ==================================================================
-- STUDENT REPAIRS
-- ==================================================================

-- Create user accounts for orphan students (skip conflicts)
INSERT INTO users (organisation_id, full_name, email, password_hash, role, status)
SELECT
  s.organisation_id,
  s.full_name,
  COALESCE(s.email, LOWER(REPLACE(COALESCE(s.full_name, 'student'), ' ', '.')) || '.' || s.id::text || '@student.local'),
  '$2b$10$placeholder_hash_must_be_reset_by_admin',
  'student',
  'active'
FROM students s
WHERE s.user_id IS NULL
ON CONFLICT (organisation_id, email) DO NOTHING;

-- Link students to the newly created or existing users
UPDATE students s
SET user_id = u.id
FROM users u
WHERE s.user_id IS NULL
  AND u.organisation_id = s.organisation_id
  AND u.email = COALESCE(s.email, LOWER(REPLACE(COALESCE(s.full_name, 'student'), ' ', '.')) || '.' || s.id::text || '@student.local')
  AND u.role = 'student'
  AND NOT EXISTS (SELECT 1 FROM students s2 WHERE s2.user_id = u.id AND s2.id != s.id);

-- ==================================================================
-- PARENT REPAIRS
-- ==================================================================

INSERT INTO users (organisation_id, full_name, email, password_hash, role, status)
SELECT
  p.organisation_id,
  p.full_name,
  COALESCE(p.email, LOWER(REPLACE(COALESCE(p.full_name, 'parent'), ' ', '.')) || '.' || p.id::text || '@parent.local'),
  '$2b$10$placeholder_hash_must_be_reset_by_admin',
  'parent',
  'active'
FROM parents p
WHERE p.user_id IS NULL
ON CONFLICT (organisation_id, email) DO NOTHING;

UPDATE parents p
SET user_id = u.id
FROM users u
WHERE p.user_id IS NULL
  AND u.organisation_id = p.organisation_id
  AND u.email = COALESCE(p.email, LOWER(REPLACE(COALESCE(p.full_name, 'parent'), ' ', '.')) || '.' || p.id::text || '@parent.local')
  AND u.role = 'parent'
  AND NOT EXISTS (SELECT 1 FROM parents p2 WHERE p2.user_id = u.id AND p2.id != p.id);
